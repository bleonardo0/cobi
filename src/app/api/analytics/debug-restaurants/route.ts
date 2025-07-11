import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug restaurants IDs');
    
    // Restaurants avec leurs vrais IDs (d'après la DB)
    const mockRestaurants = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Bella Vita',
        slug: 'bella-vita',
        address: '1 rue de l\'église, 59200, Antières Sur Sein',
        analyticsId: '123e4567-e89b-12d3-a456-426614174000'
      },
      {
        id: '1518ab7e-7e39-4508-a4e8-f259a98ac464',
        name: 'Leo et les pieds',
        slug: 'leo-et-les-pieds',
        address: '1 rue des pieds',
        analyticsId: '1518ab7e-7e39-4508-a4e8-f259a98ac464'
      }
    ];
    
    return NextResponse.json({
      success: true,
      restaurants: mockRestaurants,
      message: 'IDs des restaurants pour debug analytics'
    });
    
  } catch (error) {
    console.error('❌ Erreur debug restaurants:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 