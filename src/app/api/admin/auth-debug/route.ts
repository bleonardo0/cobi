import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug Auth pour email:', email);

    // Lister tous les utilisateurs et chercher cet email
    const { data: allUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    // Chercher l'utilisateur avec cet email
    const userWithEmail = allUsers.users.find(user => user.email === email);
    
    const debugInfo = {
      email_searched: email,
      user_found: !!userWithEmail,
      total_users: allUsers.users.length,
      user_details: userWithEmail ? {
        id: userWithEmail.id,
        email: userWithEmail.email,
        created_at: userWithEmail.created_at,
        email_confirmed_at: userWithEmail.email_confirmed_at,
        last_sign_in_at: userWithEmail.last_sign_in_at,
        role: userWithEmail.role,
        app_metadata: userWithEmail.app_metadata,
        user_metadata: userWithEmail.user_metadata
      } : null,
      can_create: !userWithEmail
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('💥 Erreur debug auth:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const force = searchParams.get('force') === 'true';

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Tentative de suppression Auth pour email:', email);

    // Lister tous les utilisateurs et chercher cet email
    const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      );
    }

    const userWithEmail = allUsers.users.find(user => user.email === email);
    
    if (!userWithEmail) {
      return NextResponse.json({
        success: true,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    if (!force) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur trouvé. Utilisez force=true pour confirmer la suppression',
        user_id: userWithEmail.id,
        confirm_url: `/api/admin/auth-debug?email=${email}&force=true`
      });
    }

    // Supprimer l'utilisateur de Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userWithEmail.id);
    
    if (deleteError) {
      return NextResponse.json(
        { error: `Erreur lors de la suppression: ${deleteError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Utilisateur supprimé de Auth:', userWithEmail.id);

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${email} supprimé avec succès de Supabase Auth`,
      deleted_user_id: userWithEmail.id
    });

  } catch (error) {
    console.error('💥 Erreur suppression auth:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 