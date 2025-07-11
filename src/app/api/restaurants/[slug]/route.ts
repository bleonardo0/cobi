import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Restaurants fictifs pour le test
const TEST_RESTAURANTS = {
  'le-gourmet-3d': {
    id: 'restaurant-test-123',
    name: 'Le Gourmet 3D',
    slug: 'le-gourmet-3d',
    description: 'Découvrez notre menu en 3D - Une expérience culinaire immersive',
    address: '123 Rue de la Gastronomie, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    website: 'https://legourmet3d.fr',
    logo: '/api/placeholder/logo-restaurant.png',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'bella-vita': {
    id: 'restaurant-bella-vita-1',
    name: 'La Bella Vita',
    slug: 'bella-vita',
    description: 'Découvrez notre menu italien en 3D - Une expérience culinaire immersive',
    address: '123 Rue de la Paix, 75001 Paris',
    phone: '+33 1 42 86 87 88',
    website: 'https://bellavita.fr',
    logo: '/api/placeholder/logo-bellavita.png',
    primaryColor: '#0a5b48',
    secondaryColor: '#d97706',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'leo-et-les-pieds': {
    id: 'restaurant-leo-et-les-pieds-1',
    name: 'Leo et les Pieds',
    slug: 'leo-et-les-pieds',
    description: 'Découvrez notre menu gastronomique en 3D - Une expérience culinaire unique',
    address: '456 Boulevard Saint-Germain, 75006 Paris',
    phone: '+33 1 45 48 55 26',
    website: 'https://leo-et-les-pieds.fr',
    logo: '/api/placeholder/logo-leo.png',
    primaryColor: '#8b5a2b',
    secondaryColor: '#d4a574',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log(`🏪 Fetching restaurant with slug: ${slug}`);
    
    // Si Supabase est configuré, essayer de récupérer depuis la base
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          // Restaurant trouvé dans Supabase
          const restaurant = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || data.short_description,
            address: data.address, // Correction: utiliser 'address' au lieu de 'adress'
            phone: data.phone,
            website: data.website,
            logo: data.logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };

          return NextResponse.json({
            success: true,
            restaurant: restaurant,
          });
        }
      } catch (supabaseError) {
        console.warn('Erreur Supabase, fallback vers données fictives:', supabaseError);
      }
    }


    
    // Fallback: utiliser les restaurants fictifs par défaut
    const restaurant = TEST_RESTAURANTS[slug as keyof typeof TEST_RESTAURANTS];
    if (restaurant) {
      return NextResponse.json({
        success: true,
        restaurant: restaurant,
      });
    }
    
    // Support pour le slug 'test' (redirige vers le-gourmet-3d)
    if (slug === 'test') {
      return NextResponse.json({
        success: true,
        restaurant: TEST_RESTAURANTS['le-gourmet-3d'],
      });
    }
    
    // Dans le futur, on pourrait chercher dans une vraie base de données
    // const { data, error } = await supabase
    //   .from('restaurants')
    //   .select('*')
    //   .eq('slug', slug)
    //   .eq('isActive', true)
    //   .single();
    
    return NextResponse.json(
      { success: false, error: 'Restaurant non trouvé' },
      { status: 404 }
    );
  } catch (error) {
    console.error('💥 Error fetching restaurant:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 