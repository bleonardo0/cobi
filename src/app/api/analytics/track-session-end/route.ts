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

    const { restaurantId, sessionId, endTime } = body;

    // Validation des paramètres requis
    if (!restaurantId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'restaurantId and sessionId are required' },
        { status: 400 }
      );
    }

    console.log('🏁 Tracking session end:', { restaurantId, sessionId });

    // Terminer la session
    const endedSession = analyticsStorage.endSession(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully',
      sessionEnded: !!endedSession,
    });
  } catch (error) {
    console.error('💥 Error tracking session end:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de tracking' 
      },
      { status: 500 }
    );
  }
} 