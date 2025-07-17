import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Vérifier le rôle admin dans Supabase
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { userEmail, restaurantId } = await request.json();

    if (!userEmail || !restaurantId) {
      return NextResponse.json({ error: 'userEmail and restaurantId are required' }, { status: 400 });
    }

    // Vérifier que le restaurant existe
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Assigner le restaurant à l'utilisateur
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        restaurant_id: restaurantId,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail)
      .select(`
        id,
        clerk_id,
        email,
        name,
        role,
        restaurant_id,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Error assigning restaurant:', updateError);
      return NextResponse.json({ 
        error: 'Failed to assign restaurant',
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${restaurant.name} to ${updatedUser.email}`,
      user: {
        id: updatedUser.clerk_id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurant_id,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      }
    });
  } catch (error) {
    console.error('Error in assign-restaurant API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Vérifier le rôle admin dans Supabase
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', clerkUser.id)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Récupérer les utilisateurs sans restaurant assigné
    const { data: unassignedUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        clerk_id,
        email,
        name,
        role,
        restaurant_id,
        is_active,
        created_at
      `)
      .is('restaurant_id', null)
      .eq('role', 'restaurateur')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching unassigned users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Récupérer la liste des restaurants
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }

    return NextResponse.json({
      unassignedUsers: unassignedUsers.map(user => ({
        id: user.clerk_id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      })),
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug
      }))
    });
  } catch (error) {
    console.error('Error in assign-restaurant GET API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 