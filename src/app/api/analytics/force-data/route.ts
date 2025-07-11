import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const restaurantId = 'restaurant-bella-vita-1';
    
    console.log('🔧 FORCE DATA - Injection directe de données pour:', restaurantId);
    
    // Forcer des données directement dans le stockage
    const timestamp = new Date().toISOString();
    const sessionId = `forced_session_${Date.now()}`;
    
    // 1. Forcer une session
    const session = analyticsStorage.addSession({
      restaurantId,
      sessionId,
      startTime: timestamp,
      deviceType: 'desktop' as const,
      modelsViewed: [],
    });
    console.log('✅ Session forcée ajoutée:', session);
    
    // 2. Forcer une vue de menu
    const menuView = await analyticsStorage.addMenuView({
      restaurantId,
      timestamp,
      sessionId,
      deviceType: 'desktop' as const,
      userAgent: 'Forced Test Agent',
      pageUrl: '/menu/bella-vita',
    });
    console.log('✅ Vue de menu forcée ajoutée:', menuView);
    
    // 3. Forcer quelques vues de modèles
    const modelViews = [];
    for (let i = 0; i < 5; i++) {
      const modelView = await analyticsStorage.addView({
        modelId: `model-${i + 1}`,
        restaurantId,
        timestamp,
        sessionId,
        interactionType: 'view' as const,
        deviceType: 'desktop' as const,
      });
      
      // Ajouter la durée manuellement
      const viewDuration = 30 + (i * 10);
      analyticsStorage.updateViewDuration(`model-${i + 1}`, sessionId, viewDuration);
      
      modelViews.push(modelView);
    }
    console.log('✅ Vues de modèles forcées ajoutées:', modelViews.length);
    
    // 4. Vérifier les données
    const allViews = analyticsStorage.getAllViews();
    const allMenuViews = analyticsStorage.getAllMenuViews();
    const allSessions = analyticsStorage.getAllSessions();
    
    console.log('📊 APRES FORCE DATA:');
    console.log('   • Total vues:', allViews.length);
    console.log('   • Total vues de menu:', allMenuViews.length);
    console.log('   • Total sessions:', allSessions.length);
    
    // 5. Récupérer les stats
    const stats = await analyticsStorage.getGeneralStats(restaurantId);
    console.log('📈 Stats après force data:', stats);
    
    return NextResponse.json({
      success: true,
      message: 'Données forcées injectées avec succès',
      data: {
        restaurantId,
        sessionId,
        storage: {
          totalViews: allViews.length,
          totalMenuViews: allMenuViews.length,
          totalSessions: allSessions.length,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('💥 Erreur lors de l\'injection forcée:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 