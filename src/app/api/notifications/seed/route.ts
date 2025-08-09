import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

async function insertSamples() {
  if (!isSupabaseConfigured) {
    return { error: 'Supabase not configured' } as const;
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
  if (error) return { error: error.message } as const;
  return { inserted: data?.length || 0 } as const;
}

export async function POST() {
  try {
    const result = await insertSamples();
    if ('error' in result) throw new Error(result.error);
    return NextResponse.json({ success: true, inserted: result.inserted });
  } catch (error) {
    console.error('Seed notifications error', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}

// Allow GET for convenience in browser (returns 200 and inserts samples)
export async function GET(_request: NextRequest) {
  try {
    const result = await insertSamples();
    if ('error' in result) throw new Error(result.error);
    return NextResponse.json({ success: true, inserted: result.inserted });
  } catch (error) {
    console.error('Seed notifications GET error', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}


