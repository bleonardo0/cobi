import { NextRequest, NextResponse } from 'next/server';
import { getAllModels } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log(`🍽️ Fetching models for restaurant: ${slug}`);
    
    // Récupérer tous les modèles
    const allModels = await getAllModels();
    
    // Pour l'instant, tous les restaurants partagent la même collection de modèles
    // Dans le futur, on pourrait filtrer par restaurant avec une colonne restaurant_id
    return NextResponse.json({
      success: true,
      models: allModels,
      restaurantSlug: slug,
    });
  } catch (error) {
    console.error('💥 Error fetching restaurant models:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 