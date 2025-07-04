import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';
import { getAllModels } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    console.log('📊 Fetching analytics stats for:', { restaurantId });

    // Récupérer tous les modèles pour avoir les noms
    const allModels = await getAllModels();
    const modelMap = new Map(allModels.map(m => [m.id, m]));

    // Obtenir les stats générales
    const generalStats = await analyticsStorage.getGeneralStats(restaurantId || undefined);
    console.log('📈 Stats générales récupérées:', generalStats);
    
    // Obtenir les stats par modèle
    const modelStats = await analyticsStorage.getModelStats(restaurantId || undefined);
    
    // Enrichir les stats avec les informations des modèles
    const enrichedModelStats = modelStats.map(stat => {
      const model = modelMap.get(stat.modelId);
      return {
        ...stat,
        name: model?.name || `Modèle ${stat.modelId}`,
        category: model?.category,
        thumbnailUrl: model?.thumbnailUrl,
      };
    }).sort((a, b) => b.views - a.views);

    // Obtenir les vues par jour
    const viewsByDay = await analyticsStorage.getViewsByDay(restaurantId || undefined);

    // Calculer les plats "Waouh" (durée > 120s)
    const waouhModels = enrichedModelStats.filter(stat => stat.avgDuration > 120);

    return NextResponse.json({
      success: true,
      data: {
        general: generalStats,
        models: enrichedModelStats,
        viewsByDay,
        waouhModels,
        topModel: enrichedModelStats[0] || null,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('💥 Error fetching analytics stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des stats' 
      },
      { status: 500 }
    );
  }
} 