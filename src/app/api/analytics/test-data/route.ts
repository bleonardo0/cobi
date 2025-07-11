import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const restaurantId = 'restaurant-bella-vita-1';
    const sessionId = `test_session_${Date.now()}`;
    
    console.log('🧪 Génération de données de test pour:', restaurantId);
    
    // 1. Créer une session
    console.log('🚀 Création session...');
    const session = analyticsStorage.addSession({
      restaurantId,
      sessionId,
      startTime: new Date().toISOString(),
      deviceType: 'desktop',
      modelsViewed: [],
    });
    console.log('✅ Session créée:', session);
    
    // 2. Créer une vue de menu
    console.log('🍽️ Création vue de menu...');
    const menuView = await analyticsStorage.addMenuView({
      restaurantId,
      timestamp: new Date().toISOString(),
      sessionId,
      deviceType: 'desktop',
      userAgent: 'Test Agent',
      pageUrl: '/menu/bella-vita',
      referrer: undefined,
    });
    console.log('✅ Vue de menu créée:', menuView);
    
    // 3. Créer quelques vues de modèles fictives
    console.log('📊 Création vues de modèles...');
    const modelViews = [];
    for (let i = 0; i < 3; i++) {
      const modelView = await analyticsStorage.addView({
        modelId: `model-${i + 1}`,
        restaurantId,
        timestamp: new Date().toISOString(),
        sessionId,
        interactionType: 'view',
        deviceType: 'desktop',
      });
      modelViews.push(modelView);
    }
    console.log('✅ Vues de modèles créées:', modelViews.length);
    
    // 4. Récupérer les stats
    console.log('📈 Récupération des stats...');
    const stats = await analyticsStorage.getGeneralStats(restaurantId);
    console.log('✅ Stats récupérées:', stats);
    
    return NextResponse.json({
      success: true,
      message: 'Données de test créées avec succès',
      data: {
        restaurantId,
        sessionId,
        session,
        menuView,
        modelViews: modelViews.length,
        stats,
      },
    });
  } catch (error) {
    console.error('💥 Erreur lors de la génération de données de test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Juste pour vérifier que l'endpoint fonctionne
  return NextResponse.json({
    success: true,
    message: 'Endpoint de test disponible. Utilisez POST pour générer des données.',
  });
} 