import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId') || 'restaurant-bella-vita-1';

    console.log('🧪 Test de l\'interface analyticsStorage pour:', restaurantId);

    // Tester l'interface analyticsStorage directement
    const sessionId = `test-interface-${Date.now()}`;

    // Test 1: Créer une session via l'interface analyticsStorage
    console.log('🧪 Test 1: Création d\'une session via analyticsStorage...');
    const sessionRecord = analyticsStorage.addSession({
      restaurantId,
      sessionId,
      startTime: new Date().toISOString(),
      deviceType: 'desktop',
      modelsViewed: [],
      userAgent: 'Test Interface'
    });
    console.log('✅ Session créée:', sessionRecord);

    // Test 2: Créer une vue de menu via l'interface analyticsStorage
    console.log('🧪 Test 2: Création d\'une vue de menu via analyticsStorage...');
    const menuViewRecord = await analyticsStorage.addMenuView({
      restaurantId,
      timestamp: new Date().toISOString(),
      sessionId,
      deviceType: 'desktop',
      userAgent: 'Test Interface',
      pageUrl: `http://localhost:3000/menu/${restaurantId}`,
      referrer: 'https://test.com'
    });
    console.log('✅ Vue de menu créée:', menuViewRecord);

    // Test 3: Créer une vue de modèle via l'interface analyticsStorage
    console.log('🧪 Test 3: Création d\'une vue de modèle via analyticsStorage...');
    const modelViewRecord = await analyticsStorage.addView({
      modelId: 'test-interface-model',
      restaurantId,
      timestamp: new Date().toISOString(),
      sessionId,
      interactionType: 'view',
      deviceType: 'desktop',
      userAgent: 'Test Interface'
    });
    console.log('✅ Vue de modèle créée:', modelViewRecord);

    // Test 4: Vérifier que les données sont bien stockées
    console.log('🧪 Test 4: Vérification du stockage...');
    const allViews = analyticsStorage.getAllViews();
    const allMenuViews = analyticsStorage.getAllMenuViews();
    const allSessions = analyticsStorage.getAllSessions();

    console.log('📊 Données stockées:');
    console.log('   - Vues de modèles:', allViews.length);
    console.log('   - Vues de menus:', allMenuViews.length);
    console.log('   - Sessions:', allSessions.length);

    return NextResponse.json({
      success: true,
      message: 'Test de l\'interface analyticsStorage terminé',
      data: {
        sessionCreated: sessionRecord,
        menuViewCreated: menuViewRecord,
        modelViewCreated: modelViewRecord,
        storageStats: {
          totalViews: allViews.length,
          totalMenuViews: allMenuViews.length,
          totalSessions: allSessions.length
        }
      }
    });
  } catch (error) {
    console.error('💥 Error testing analyticsStorage interface:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de test de l\'interface' 
      },
      { status: 500 }
    );
  }
} 