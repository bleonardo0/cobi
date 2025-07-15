import { NextRequest, NextResponse } from 'next/server';
import { getModelViewsStats } from '@/lib/analytics-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    console.log('📊 Récupération des analytics pour restaurant:', restaurantId);

    const stats = await getModelViewsStats(restaurantId || undefined);

    // Récupérer les détails des modèles depuis la base de données
    const modelIds = stats.modelStats.map(stat => stat.modelId);
    const { data: modelsData } = modelIds.length > 0 ? await supabaseAdmin
      .from('models_3d')
      .select('id, name, thumbnail_url, category')
      .in('id', modelIds) : { data: [] };

    // Créer un map pour accéder rapidement aux données des modèles
    const modelsMap = new Map();
    modelsData?.forEach((model: any) => {
      modelsMap.set(model.id, {
        name: model.name,
        thumbnailUrl: model.thumbnail_url,
        category: model.category
      });
    });

    // Transformer les données pour la page insights
    const mockModels = stats.modelStats.map((model, index) => {
      const modelData = modelsMap.get(model.modelId);
      return {
        id: model.modelId,
        name: modelData?.name || model.name,
        views: model.count,
        avgDuration: model.avgDuration || 0, // Vraie durée moyenne
        popularityScore: model.percentage,
        category: modelData?.category || 'Plat',
        thumbnailUrl: modelData?.thumbnailUrl || null // URL de la vraie image du plat
      };
    });

    // Convertir viewsByDay en format tableau
    const viewsByDay = stats.viewsByDay || {};
    const viewsByDayArray = Object.entries(viewsByDay).map(([date, views]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      views: views
    })).reverse();

    // Calculer les stats des appareils en pourcentages
    const deviceStats = stats.deviceStats || { mobile: 0, tablet: 0, desktop: 0 };
    const totalDeviceViews = Object.values(deviceStats).reduce((sum, count) => sum + count, 0);
    const deviceBreakdown = Object.entries(deviceStats).reduce((acc, [device, count]) => {
      acc[device] = totalDeviceViews > 0 ? Math.round((count / totalDeviceViews) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      general: {
        totalViews: stats.totalViews,
        avgDuration: stats.globalAvgDuration || 0, // Vraie durée moyenne globale
        uniqueSessions: stats.totalViews, // Simplifié : 1 session = 1 vue
        deviceBreakdown: deviceBreakdown,
      },
      models: mockModels,
      viewsByDay: viewsByDayArray,
      waouhModels: mockModels.filter(m => m.views > 2), // Modèles avec plus de 2 vues
      topModel: mockModels[0] || null,
      lastUpdated: new Date().toISOString(),
    };

    console.log('📊 Analytics simplifiées:', analytics);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('💥 Erreur lors de la récupération des stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des stats' 
      },
      { status: 500 }
    );
  }
} 