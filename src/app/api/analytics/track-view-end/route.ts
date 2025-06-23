import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, restaurantId, sessionId, viewDuration } = body;

    console.log('⏱️ Tracking view end:', { modelId, restaurantId, viewDuration });

    // Mettre à jour la durée de la vue
    const updatedView = analyticsStorage.updateViewDuration(modelId, sessionId, viewDuration);

    return NextResponse.json({
      success: true,
      updated: !!updatedView,
      viewId: updatedView?.id,
    });
  } catch (error) {
    console.error('💥 Error tracking view end:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de tracking' 
      },
      { status: 500 }
    );
  }
} 