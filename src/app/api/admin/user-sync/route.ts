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

    console.log('🔍 Diagnostic utilisateur pour:', email);

    // 1. Vérifier dans Supabase Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers.users.find(user => user.email === email);

    // 2. Vérifier dans la table users
    let tableUser = null;
    let tableError = null;
    
    if (authUser) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      tableUser = data;
      tableError = error;
    }

    // 3. Vérifier dans la table restaurants (si c'est un restaurateur)
    let restaurantData = null;
    if (tableUser?.restaurant_id) {
      const { data } = await supabaseAdmin
        .from('restaurants')
        .select('id, name, slug')
        .eq('id', tableUser.restaurant_id)
        .single();
      
      restaurantData = data;
    }

    const diagnostic = {
      email: email,
      auth_exists: !!authUser,
      table_exists: !!tableUser,
      is_synced: !!(authUser && tableUser),
      auth_user: authUser ? {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        user_metadata: authUser.user_metadata
      } : null,
      table_user: tableUser,
      table_error: tableError?.message,
      restaurant: restaurantData,
      can_login: !!(authUser && tableUser && tableUser.is_active),
      issue: authUser && !tableUser ? 'USER_NOT_IN_TABLE' : 
             !authUser && tableUser ? 'USER_NOT_IN_AUTH' :
             authUser && tableUser && !tableUser.is_active ? 'USER_INACTIVE' :
             authUser && tableUser ? 'OK' : 'USER_NOT_FOUND'
    };

    return NextResponse.json({
      success: true,
      diagnostic
    });

  } catch (error) {
    console.error('💥 Erreur diagnostic utilisateur:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email et action sont requis' },
        { status: 400 }
      );
    }

    console.log(`🔧 Action "${action}" pour utilisateur:`, email);

    // Récupérer l'utilisateur Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers.users.find(user => user.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans Supabase Auth' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'create_user_record':
        // Créer l'enregistrement manquant dans la table users
        
        // D'abord, essayer de trouver le restaurant associé par email
        const { data: restaurant } = await supabaseAdmin
          .from('restaurants')
          .select('id, name')
          .eq('email', email)
          .single();

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || 'Utilisateur',
          role: 'restaurateur' as const,
          restaurant_id: restaurant?.id || null,
          is_active: true,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        };

        const { data: createdUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (createError) {
          throw new Error(`Erreur création utilisateur: ${createError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Utilisateur créé avec succès dans la table users',
          user: createdUser,
          restaurant: restaurant
        });

      case 'activate_user':
        // Activer l'utilisateur
        const { data: activatedUser, error: activateError } = await supabaseAdmin
          .from('users')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', authUser.id)
          .select()
          .single();

        if (activateError) {
          throw new Error(`Erreur activation: ${activateError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Utilisateur activé avec succès',
          user: activatedUser
        });

      case 'link_restaurant':
        // Lier à un restaurant (si pas déjà fait)
        const { data: userRestaurant } = await supabaseAdmin
          .from('restaurants')
          .select('id, name')
          .eq('email', email)
          .single();

        if (!userRestaurant) {
          return NextResponse.json(
            { error: 'Aucun restaurant trouvé avec cet email' },
            { status: 404 }
          );
        }

        const { data: linkedUser, error: linkError } = await supabaseAdmin
          .from('users')
          .update({ 
            restaurant_id: userRestaurant.id,
            updated_at: new Date().toISOString() 
          })
          .eq('id', authUser.id)
          .select()
          .single();

        if (linkError) {
          throw new Error(`Erreur liaison restaurant: ${linkError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: `Utilisateur lié au restaurant "${userRestaurant.name}"`,
          user: linkedUser,
          restaurant: userRestaurant
        });

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('💥 Erreur réparation utilisateur:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 