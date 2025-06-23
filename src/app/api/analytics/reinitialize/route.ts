import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Réinitialisation des données analytics...');

    // Forcer la réinitialisation avec les vrais modèles
    await analyticsStorage.forceReinitialize();

    return NextResponse.json({
      success: true,
      message: 'Données analytics réinitialisées avec les vrais modèles',
    });
  } catch (error) {
    console.error('💥 Error reinitializing analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de réinitialisation' 
      },
      { status: 500 }
    );
  }
} 