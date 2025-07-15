import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    
    // Récupérer les informations du restaurant par slug
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, slug, address, phone, email, website, description, logo_url, primary_color, secondary_color, is_active')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du restaurant:', error);
      
      // Fallback pour "Leo et les pieds" si la base de données n'est pas disponible
      if (slug === 'leo-et-les-pieds') {
        const fallbackRestaurant = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Leo et les pieds',
          slug: 'leo-et-les-pieds',
          description: 'Restaurant spécialisé dans les plats créatifs',
          address: '123 Rue Example, Paris, France',
          phone: '+33 1 23 45 67 89',
          email: 'contact@leoetlespieds.fr',
          website: 'https://leoetlespieds.fr',
          is_active: true,
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          logo_url: null
        };
        
        return NextResponse.json({
          success: true,
          restaurant: fallbackRestaurant
        });
      }
      
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant
    });

  } catch (error) {
    console.error('Erreur dans API restaurants/[slug]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 