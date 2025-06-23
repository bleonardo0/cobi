import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, sessionId, startTime, deviceType, userAgent } = body;

    console.log('🚀 Tracking session start:', { restaurantId, sessionId, deviceType });

    // Ajouter la session au stockage
    const sessionRecord = analyticsStorage.addSession({
      restaurantId,
      sessionId,
      startTime,
      deviceType,
      modelsViewed: [],
    });

    return NextResponse.json({
      success: true,
      sessionId: sessionRecord.id,
    });
  } catch (error) {
    console.error('💥 Error tracking session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de tracking' 
      },
      { status: 500 }
    );
  }
} 