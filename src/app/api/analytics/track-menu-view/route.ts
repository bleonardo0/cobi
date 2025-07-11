import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, sessionId, userAgent, deviceType } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'restaurantId est requis' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking vue de menu pour restaurant: ${restaurantId}`);

    // Insérer la vue de menu dans la table analytics_menu_views
    const { data, error } = await supabaseAdmin
      .from('analytics_menu_views')
      .insert({
        restaurant_id: restaurantId,
        session_id: sessionId,
        user_agent: userAgent,
        device_type: deviceType,
        timestamp: new Date().toISOString(),
        page_url: body.pageUrl,
        referrer: body.referrer
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du tracking de vue de menu:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du tracking de vue de menu' },
        { status: 500 }
      );
    }

    console.log('✅ Vue de menu trackée:', data);
    return NextResponse.json({
      success: true,
      message: 'Vue de menu trackée avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur API track-menu-view:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 