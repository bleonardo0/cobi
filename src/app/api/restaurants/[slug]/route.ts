import { NextRequest, NextResponse } from 'next/server';

// Restaurant fictif pour le test
const TEST_RESTAURANT = {
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
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log(`🏪 Fetching restaurant with slug: ${slug}`);
    
    // Pour le moment, on utilise un restaurant fictif
    if (slug === 'le-gourmet-3d' || slug === 'test') {
      return NextResponse.json({
        success: true,
        restaurant: TEST_RESTAURANT,
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