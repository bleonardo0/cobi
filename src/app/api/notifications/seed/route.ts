import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const now = new Date().toISOString();
    const items = [
      {
        restaurant_id: 'restaurant-bella-vita-1',
        type: 'model_ready',
        title: 'Modèle 3D prêt',
        message: 'Votre modèle Pizza Margherita a été traité',
        url: '/models/bella-vita',
        created_at: now,
      },
      {
        restaurant_id: 'restaurant-bella-vita-1',
        type: 'analytics_alert',
        title: 'Pic de vues',
        message: 'Vos vues ont augmenté de 45% aujourd’hui',
        url: '/insights',
        created_at: now,
      },
    ];

    const { data, error } = await supabaseAdmin.from('notifications').insert(items).select('*');
    if (error) throw error;
    return NextResponse.json({ success: true, inserted: data?.length || 0 });
  } catch (error) {
    console.error('Seed notifications error', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}


