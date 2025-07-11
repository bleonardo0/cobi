import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '../../../../lib/analytics-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('🔍 Debug analytics pour restaurant:', restaurantId);
    
    // Récupérer toutes les données
    const allData = analyticsStorage.getStorageDebug();
    
    // Si un restaurant spécifique est demandé
    if (restaurantId) {
      const restaurantData = analyticsStorage.getStorageDebug(restaurantId);
      
      return NextResponse.json({
        success: true,
        restaurantId: restaurantId,
        data: restaurantData,
        allDataSummary: {
          totalModelViews: allData.totalModelViews,
          totalSessions: allData.totalSessions,
          totalMenuViews: allData.totalMenuViews,
          storageFile: allData.storageFile,
          fileExists: allData.fileExists
        }
      });
    }
    
    // Retourner toutes les données avec un résumé
    const restaurantIds = [...new Set([
      ...allData.modelViews.map((v: any) => v.restaurantId),
      ...allData.sessions.map((s: any) => s.restaurantId),
      ...allData.menuViews.map((m: any) => m.restaurantId)
    ])];
    
    const restaurantBreakdown = restaurantIds.map(id => {
      const data = analyticsStorage.getStorageDebug(id);
      return {
        restaurantId: id,
        modelViews: data.totalModelViews,
        sessions: data.totalSessions,
        menuViews: data.totalMenuViews
      };
    });
    
    return NextResponse.json({
      success: true,
      summary: {
        totalModelViews: allData.totalModelViews,
        totalSessions: allData.totalSessions,
        totalMenuViews: allData.totalMenuViews,
        uniqueRestaurants: restaurantIds.length,
        storageFile: allData.storageFile,
        fileExists: allData.fileExists
      },
      restaurantIds: restaurantIds,
      restaurantBreakdown: restaurantBreakdown,
      rawData: allData
    });
    
  } catch (error) {
    console.error('❌ Erreur debug analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 