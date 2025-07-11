import { NextRequest, NextResponse } from 'next/server';
import { getModelsByRestaurant } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log(`🍽️ Fetching models for restaurant: ${slug}`);
    
    // Récupérer les modèles spécifiques au restaurant
    const restaurantModels = await getModelsByRestaurant(slug);
    
    console.log(`✅ Found ${restaurantModels.length} models for restaurant: ${slug}`);
    
    return NextResponse.json({
      success: true,
      models: restaurantModels,
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