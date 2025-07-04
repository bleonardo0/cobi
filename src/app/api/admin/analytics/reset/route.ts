import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, resetToZero = true } = await request.json();
    
    console.log('🗑️ Début du reset analytics:', { restaurantId, resetToZero });
    
    // Vérifications de sécurité
    if (!restaurantId || typeof restaurantId !== 'string') {
      console.log('❌ Restaurant ID manquant ou invalide:', restaurantId);
      return NextResponse.json(
        { success: false, error: 'Restaurant ID requis' },
        { status: 400 }
      );
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on fait confiance au frontend
    // Plus tard, on ajoutera une vérification JWT/session
    
    console.log('🔄 Appel de resetRestaurantAnalytics avec:', { restaurantId, completeReset: !resetToZero });
    
    // Remettre à zéro les analytics du restaurant
    // Si resetToZero = true, on remet vraiment à zéro (0 vues)
    // Si resetToZero = false, on régénère des données de base
    const result = await analyticsStorage.resetRestaurantAnalytics(restaurantId, !resetToZero);
    
    const action = resetToZero ? 'remis à zéro' : 'réinitialisé avec données de base';
    
    console.log('✅ Reset terminé avec succès:', result);
    
    return NextResponse.json({
      success: true,
      message: `Analytics ${action} pour le restaurant ${restaurantId}`,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du reset des analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 