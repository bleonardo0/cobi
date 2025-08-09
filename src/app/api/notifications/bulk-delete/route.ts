import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/notifications/bulk-delete { user_id?, restaurant_id? }
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const user_id: string | undefined = body.user_id;
    const restaurant_id: string | undefined = body.restaurant_id;

    if (!user_id && !restaurant_id) {
      return NextResponse.json({ success: false, error: 'Missing filter' }, { status: 400 });
    }

    let query = supabaseAdmin.from('notifications').delete();
    if (user_id) query = query.eq('user_id', user_id);
    if (restaurant_id) query = query.eq('restaurant_id', restaurant_id);

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/notifications/bulk-delete error', error);
    return NextResponse.json({ success: false, error: 'Failed to bulk delete' }, { status: 500 });
  }
}


