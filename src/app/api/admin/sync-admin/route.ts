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

    console.log('🔄 Synchronisation du compte admin pour:', clerkUser.emailAddresses[0]?.emailAddress);

    // Vérifier si l'utilisateur existe déjà dans la table users
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, clerk_id, email, role')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (!checkError && existingUser) {
      // L'utilisateur existe déjà
      return NextResponse.json({
        success: true,
        message: 'Utilisateur déjà synchronisé',
        user: {
          id: existingUser.id,
          clerk_id: existingUser.clerk_id,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Créer le compte admin dans la table users
    const adminData = {
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
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

    console.log('✅ Compte admin créé avec succès:', newAdmin);

    return NextResponse.json({
      success: true,
      message: 'Compte admin créé avec succès',
      user: {
        id: newAdmin.id,
        clerk_id: newAdmin.clerk_id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de la synchronisation admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté depuis Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Vérifier si l'utilisateur existe dans la table users
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, clerk_id, email, role, created_at')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ 
        error: 'Erreur lors de la vérification',
        details: checkError.message 
      }, { status: 500 });
    }

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
        created_at: existingUser.created_at
      } : null
    });

  } catch (error) {
    console.error('Erreur lors de la vérification admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 