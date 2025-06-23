import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, sessionId, endTime } = body;

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