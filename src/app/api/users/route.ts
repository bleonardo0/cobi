import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { User } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const userData: User = await request.json();

    // Créer l'utilisateur dans Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar,
        role: userData.role,
        restaurant_id: userData.restaurantId,
        is_active: userData.isActive,
        created_at: userData.createdAt,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Utilisateur déjà existant
        return NextResponse.json({ data: null, error: 'User already exists' }, { status: 409 });
      }
      throw error;
    }

    // Convertir au format User
    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar_url,
      role: data.role,
      restaurantId: data.restaurant_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastLogin: data.last_login
    };

    return NextResponse.json({ data: user, error: null });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 