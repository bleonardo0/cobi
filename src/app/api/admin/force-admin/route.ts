import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté depuis Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    console.log('🔧 Forcer le rôle admin pour:', userEmail);

    // Vérifier si l'utilisateur existe déjà dans la table users
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, clerk_id, email, role, restaurant_id')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ 
        error: 'Erreur lors de la vérification',
        details: checkError.message 
      }, { status: 500 });
    }

    if (existingUser) {
      // Mettre à jour le rôle vers admin
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          role: 'admin',
          restaurant_id: null, // Admin n'a pas de restaurant
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', clerkUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour du rôle:', updateError);
        return NextResponse.json({ 
          error: 'Erreur lors de la mise à jour du rôle',
          details: updateError.message 
        }, { status: 500 });
      }

      console.log('✅ Rôle admin forcé pour utilisateur existant:', updatedUser);

      return NextResponse.json({
        success: true,
        message: 'Rôle admin forcé avec succès',
        user: {
          id: updatedUser.id,
          clerk_id: updatedUser.clerk_id,
          email: updatedUser.email,
          role: updatedUser.role,
          restaurant_id: updatedUser.restaurant_id
        },
        action: 'updated'
      });
    } else {
      // Créer un nouveau compte admin
      const adminData = {
        clerk_id: clerkUser.id,
        email: userEmail || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Admin',
        avatar_url: clerkUser.imageUrl || null,
        role: 'admin' as const,
        restaurant_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newAdmin, error: createError } = await supabaseAdmin
        .from('users')
        .insert(adminData)
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création du compte admin:', createError);
        return NextResponse.json({ 
          error: 'Erreur lors de la création du compte admin',
          details: createError.message 
        }, { status: 500 });
      }

      console.log('✅ Nouveau compte admin créé:', newAdmin);

      return NextResponse.json({
        success: true,
        message: 'Compte admin créé avec succès',
        user: {
          id: newAdmin.id,
          clerk_id: newAdmin.clerk_id,
          email: newAdmin.email,
          role: newAdmin.role,
          restaurant_id: newAdmin.restaurant_id
        },
        action: 'created'
      });
    }

  } catch (error) {
    console.error('Erreur lors du forçage du rôle admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, clerk_id, email, role, restaurant_id, created_at')
      .eq('clerk_id', clerkUser.id)
      .single();

    return NextResponse.json({
      success: true,
      userExists: !!existingUser,
      clerkUser: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      },
      supabaseUser: existingUser ? {
        id: existingUser.id,
        clerk_id: existingUser.clerk_id,
        email: existingUser.email,
        role: existingUser.role,
        restaurant_id: existingUser.restaurant_id,
        created_at: existingUser.created_at
      } : null,
      needsForceAdmin: existingUser?.role !== 'admin'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 