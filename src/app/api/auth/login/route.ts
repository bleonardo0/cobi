import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si Supabase est configuré
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { 
          error: 'Supabase non configuré. Veuillez configurer vos variables d\'environnement.',
          setup_required: true 
        },
        { status: 503 }
      );
    }

    // Authentification avec Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    // Récupérer les informations utilisateur depuis la table users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        restaurant_id,
        is_active,
        created_at,
        last_login
      `)
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Erreur lors de la récupération des données utilisateur:', userError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données utilisateur' },
        { status: 500 }
      );
    }

    // Vérifier que l'utilisateur est actif
    if (!userData.is_active) {
      return NextResponse.json(
        { error: 'Compte utilisateur désactivé' },
        { status: 403 }
      );
    }

    // Mettre à jour la dernière connexion
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Préparer la réponse avec les données utilisateur
    const userResponse = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      restaurantId: userData.restaurant_id,
      isActive: userData.is_active,
      createdAt: userData.created_at,
      lastLogin: new Date().toISOString()
    };

    console.log('✅ Connexion réussie:', userData.email);

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 