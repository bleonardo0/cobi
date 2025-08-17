import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/notifications?restaurantId=...&userId=...&unread=true
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const userId = searchParams.get('userId');
    const unread = searchParams.get('unread') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (unread) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, notifications: data || [] });
  } catch (error) {
    console.error('GET /api/notifications error', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications { user_id?, restaurant_id?, type, title, message?, url? }
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { user_id, restaurant_id, type, title, message, url } = body || {};

    if (!type || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert([{ user_id, restaurant_id, type, title, message, url }])
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, notification: data });
  } catch (error) {
    console.error('POST /api/notifications error', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}



