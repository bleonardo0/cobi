import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    // Validation du contenu
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    const { modelId, restaurantId, timestamp, sessionId, interactionType, deviceType, userAgent } = body;

    console.log('📊 Tracking view:', { modelId, restaurantId, interactionType, deviceType });

    // Ajouter la vue au stockage
    const viewRecord = await analyticsStorage.addView({
      modelId,
      restaurantId,
      timestamp,
      sessionId,
      interactionType,
      deviceType,
    });

    return NextResponse.json({
      success: true,
      viewId: viewRecord.id,
    });
  } catch (error) {
    console.error('💥 Error tracking view:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de tracking' 
      },
      { status: 500 }
    );
  }
} 