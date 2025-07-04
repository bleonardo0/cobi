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
    
    // Pour les restaurants de test, on retourne tous les modèles existants
    if (slug === 'le-gourmet-3d' || slug === 'bella-vita' || slug === 'test') {
      return NextResponse.json({
        success: true,
        models: allModels,
        restaurantSlug: slug,
      });
    }
    
    // Dans le futur, on pourrait filtrer par restaurant
    // const restaurantModels = allModels.filter(model => model.restaurantId === restaurantId);
    
    return NextResponse.json(
      { success: false, error: 'Restaurant non trouvé' },
      { status: 404 }
    );
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