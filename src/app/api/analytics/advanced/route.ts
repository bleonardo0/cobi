import { NextRequest, NextResponse } from 'next/server';
import { getAdvancedAnalytics } from '@/lib/analytics-advanced';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const timeRange = searchParams.get('timeRange') as '7d' | '30d' | '90d' | null;

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID requis'
      }, { status: 400 });
    }

    console.log('📊 Récupération des analytics avancées pour restaurant:', restaurantId, 'période:', timeRange);

    const advancedStats = await getAdvancedAnalytics(
      restaurantId, 
      timeRange || '30d'
    );

    return NextResponse.json({
      success: true,
      data: advancedStats
    });

  } catch (error) {
    console.error('❌ Erreur API analytics avancées:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des analytics avancées'
    }, { status: 500 });
  }
}