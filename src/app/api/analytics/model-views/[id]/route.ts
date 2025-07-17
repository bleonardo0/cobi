import { NextRequest, NextResponse } from 'next/server';
import { getModelViews } from '@/lib/analytics-simplified';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || 'week';
    
    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID requis'
      }, { status: 400 });
    }

    const { id } = await params;
    const modelId = id;
    
    // Récupérer les vues du modèle
    const viewsCount = await getModelViews(
      modelId, 
      restaurantId, 
      period as 'day' | 'week' | 'month'
    );

    return NextResponse.json({
      success: true,
      views: viewsCount,
      modelId,
      restaurantId,
      period
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vues:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des vues'
    }, { status: 500 });
  }
} 