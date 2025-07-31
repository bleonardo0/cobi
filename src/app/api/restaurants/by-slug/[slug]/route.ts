import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log(`🍽️ Fetching restaurant for: ${slug}`);
    
    // Récupérer les informations du restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, slug, address, phone, email, website, description, logo_url, ambiance_image_url, primary_color, secondary_color, is_active')
      .eq('slug', slug)
      .single();

    if (restaurantError) {
      console.error('Erreur lors de la récupération du restaurant:', restaurantError);
      
      // Fallback pour "bella-vita" si la base de données n'est pas disponible
      if (slug === 'bella-vita') {
        const fallbackRestaurant = {
          id: 'restaurant-bella-vita-1',
          name: 'Bella Vita',
          slug: 'bella-vita',
          description: 'Restaurant italien authentique',
          address: '123 Rue de la Paix, Paris',
          phone: '+33 1 23 45 67 89',
          email: 'contact@bellavita.fr',
          website: 'https://bellavita.fr',
          is_active: true,
          primary_color: '#d97706',
          secondary_color: '#f59e0b',
          logo_url: null,
          ambiance_image_url: null
        };
        
        return NextResponse.json(fallbackRestaurant);
      }
      
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found restaurant "${restaurant.name}"`);
    
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('💥 Error fetching restaurant:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}