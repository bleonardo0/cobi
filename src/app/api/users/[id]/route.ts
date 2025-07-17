import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkId = id;

    // Récupérer l'utilisateur depuis Supabase par clerk_id avec les infos du restaurant
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        clerk_id,
        email,
        name,
        avatar_url,
        role,
        restaurant_id,
        is_active,
        created_at,
        last_login,
        restaurants (
          id,
          name,
          slug,
          address,
          phone,
          email,
          website,
          description,
          logo_url,
          primary_color,
          secondary_color,
          is_active
        )
      `)
      .eq('clerk_id', clerkId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Utilisateur non trouvé
        return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    // Convertir au format User avec les informations du restaurant
    const user = {
      id: userData.clerk_id, // Utiliser clerk_id comme ID externe
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar_url,
      role: userData.role,
      restaurantId: userData.restaurant_id,
      isActive: userData.is_active,
      createdAt: userData.created_at,
      lastLogin: userData.last_login,
      // Ajouter les informations du restaurant si disponibles
      restaurant: userData.restaurants && Array.isArray(userData.restaurants) && userData.restaurants.length > 0 ? {
        id: userData.restaurants[0].id,
        name: userData.restaurants[0].name,
        slug: userData.restaurants[0].slug,
        address: userData.restaurants[0].address,
        phone: userData.restaurants[0].phone,
        email: userData.restaurants[0].email,
        website: userData.restaurants[0].website,
        description: userData.restaurants[0].description,
        logoUrl: userData.restaurants[0].logo_url,
        primaryColor: userData.restaurants[0].primary_color,
        secondaryColor: userData.restaurants[0].secondary_color,
        isActive: userData.restaurants[0].is_active
      } : null
    };

    return NextResponse.json({ data: user, error: null });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 