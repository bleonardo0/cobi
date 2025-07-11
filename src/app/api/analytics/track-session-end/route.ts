import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, restaurantId, duration } = body;

    if (!sessionId || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'sessionId et restaurantId sont requis' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking fin de session: ${sessionId} pour restaurant: ${restaurantId}`);

    // Mettre à jour la session dans la table analytics_sessions
    const { data, error } = await supabaseAdmin
      .from('analytics_sessions')
      .update({
        end_time: new Date().toISOString(),
        total_duration: duration
      })
      .eq('session_id', sessionId)
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du tracking de fin de session:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du tracking de fin de session' },
        { status: 500 }
      );
    }

    console.log('✅ Fin de session trackée:', data);
    return NextResponse.json({
      success: true,
      message: 'Fin de session trackée avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur API track-session-end:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 