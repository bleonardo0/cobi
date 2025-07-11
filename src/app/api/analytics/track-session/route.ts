import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, restaurantId, userAgent, deviceType } = body;

    if (!sessionId || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'sessionId et restaurantId sont requis' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking session: ${sessionId} pour restaurant: ${restaurantId}`);

    // Insérer la session dans la table analytics_sessions
    const { data, error } = await supabaseAdmin
      .from('analytics_sessions')
      .insert({
        session_id: sessionId,
        restaurant_id: restaurantId,
        user_agent: userAgent,
        device_type: deviceType,
        start_time: new Date().toISOString(),
        models_viewed: []
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du tracking de session:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du tracking de session' },
        { status: 500 }
      );
    }

    console.log('✅ Session trackée:', data);
    return NextResponse.json({
      success: true,
      message: 'Session trackée avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur API track-session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 