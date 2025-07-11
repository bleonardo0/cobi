import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter required (e.g., ?email=contact@bella-vita.fr)'
      });
    }

    // 1. Vérifier l'utilisateur dans Supabase Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers.users.find(user => user.email === email);

    // 2. Vérifier l'utilisateur dans la table users
    let tableUser = null;
    if (authUser) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      tableUser = data;
    }

    // 3. Vérifier le restaurant associé
    let restaurant = null;
    if (tableUser?.restaurant_id) {
      const { data } = await supabaseAdmin
        .from('restaurants')
        .select('*')
        .eq('id', tableUser.restaurant_id)
        .single();
      
      restaurant = data;
    }

    // 4. Compter les modèles pour ce restaurant
    let modelCount = 0;
    if (tableUser?.restaurant_id) {
      const { data: models } = await supabaseAdmin
        .from('models_3d')
        .select('id')
        .eq('restaurant_id', tableUser.restaurant_id);
      
      modelCount = models?.length || 0;
    }

    return NextResponse.json({
      success: true,
      email: email,
      debug: {
        auth_user: authUser ? {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at
        } : null,
        table_user: tableUser,
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug
        } : null,
        model_count: modelCount,
        issues: [
          !authUser && 'USER_NOT_IN_AUTH',
          !tableUser && 'USER_NOT_IN_TABLE', 
          !restaurant && 'NO_RESTAURANT_ASSOCIATED',
          modelCount === 0 && 'NO_MODELS_FOR_RESTAURANT'
        ].filter(Boolean)
      }
    });

  } catch (error) {
    console.error('💥 Erreur debug user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 