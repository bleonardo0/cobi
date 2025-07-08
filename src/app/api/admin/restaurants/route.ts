import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';

interface RestaurantCreateData {
  name: string;
  slug: string;
  address: string;
  phone?: string;
  email: string;
  website?: string;
  description?: string;
  shortDescription: string;
  primaryColor: string;
  secondaryColor: string;
  subscriptionPlan: 'basic' | 'premium';
  allergens: string[];
  ownerName?: string;
  ownerContact?: string;
  ownerContactMethod?: 'email' | 'phone' | 'both';
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const restaurantData: RestaurantCreateData = await request.json();

    // Validation des données
    if (!restaurantData.name || !restaurantData.slug || !restaurantData.address || !restaurantData.email) {
      return NextResponse.json(
        { error: 'Nom, slug, adresse et email sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation du mot de passe si fourni
    if (restaurantData.password && restaurantData.password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(restaurantData.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Validation slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(restaurantData.slug)) {
      return NextResponse.json(
        { error: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets' },
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

    // Vérifier si le slug existe déjà
    const { data: existingRestaurant, error: checkError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', restaurantData.slug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = pas de résultat trouvé
      console.error('Erreur lors de la vérification du slug:', checkError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification du slug' },
        { status: 500 }
      );
    }

    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Ce slug est déjà utilisé. Veuillez en choisir un autre.' },
        { status: 400 }
      );
    }

    // Créer le compte utilisateur si un mot de passe est fourni
    let authUserId: string | null = null;
    if (restaurantData.password) {
      try {
        // Créer le compte avec Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: restaurantData.email,
          password: restaurantData.password,
          email_confirm: true, // Confirmer l'email automatiquement
          user_metadata: {
            name: restaurantData.ownerName || 'Propriétaire',
            role: 'restaurateur'
          }
        });

        if (authError) {
          console.error('Erreur lors de la création du compte Auth:', authError);
          return NextResponse.json(
            { error: `Erreur lors de la création du compte: ${authError.message}` },
            { status: 500 }
          );
        }

        authUserId = authData.user?.id || null;
        console.log('✅ Compte Auth créé avec succès:', authData.user?.email);
      } catch (error) {
        console.error('Erreur lors de la création du compte Auth:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la création du compte utilisateur' },
          { status: 500 }
        );
      }
    }

    // Créer le restaurant dans Supabase
    const newRestaurant = {
      name: restaurantData.name,
      slug: restaurantData.slug,
      address: restaurantData.address,
      phone: restaurantData.phone || null,
      email: restaurantData.email,
      website: restaurantData.website || null,
      description: restaurantData.description || null,
      short_description: restaurantData.shortDescription,
      primary_color: restaurantData.primaryColor,
      secondary_color: restaurantData.secondaryColor,
      subscription_plan: restaurantData.subscriptionPlan,
      subscription_status: 'active' as const,
      allergens: restaurantData.allergens,
      owner_name: restaurantData.ownerName || null,
      owner_contact: restaurantData.ownerContact || null,
      owner_contact_method: restaurantData.ownerContactMethod || 'email',
      rating: 0,
      logo_url: null, // À ajouter plus tard
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .insert(newRestaurant)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la création:', error);
      return NextResponse.json(
        { error: `Erreur lors de la création: ${error.message}` },
        { status: 500 }
      );
    }

    // Créer l'utilisateur dans la table users si un compte Auth a été créé
    if (authUserId && restaurantData.password) {
      try {
        const { error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUserId,
            email: restaurantData.email,
            name: restaurantData.ownerName || 'Propriétaire',
            role: 'restaurateur',
            restaurant_id: data.id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (userError) {
          console.error('Erreur lors de la création de l\'utilisateur:', userError);
          // Ne pas faire échouer la création du restaurant pour une erreur utilisateur
          // mais logger l'erreur
        } else {
          console.log('✅ Utilisateur créé avec succès dans la table users');
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        // Ne pas faire échouer la création du restaurant
      }
    }

    // Convertir les données Supabase au format attendu par le frontend
    const restaurantForFrontend = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      description: data.description,
      shortDescription: data.short_description,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      subscriptionPlan: data.subscription_plan,
      subscriptionStatus: data.subscription_status,
      allergens: data.allergens,
      ownerName: data.owner_name,
      ownerContact: data.owner_contact,
      ownerContactMethod: data.owner_contact_method,
      rating: data.rating,
      logoUrl: data.logo_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('✅ Restaurant créé avec succès:', restaurantForFrontend);

    return NextResponse.json({
      success: true,
      message: `Restaurant "${restaurantData.name}" créé avec succès`,
      restaurant: restaurantForFrontend,
      urls: {
        dashboard: '/restaurant/dashboard',
        menu: `/menu/${restaurantData.slug}`,
        admin: `/admin/restaurants/${data.id}`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Récupérer tous les restaurants
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase lors de la récupération:', error);
      return NextResponse.json(
        { error: `Erreur lors de la récupération: ${error.message}` },
        { status: 500 }
      );
    }

    // Convertir les données au format frontend
    const restaurants = data.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      website: restaurant.website,
      description: restaurant.description,
      shortDescription: restaurant.short_description,
      primaryColor: restaurant.primary_color,
      secondaryColor: restaurant.secondary_color,
      subscriptionPlan: restaurant.subscription_plan,
      subscriptionStatus: restaurant.subscription_status,
      allergens: restaurant.allergens,
      ownerName: restaurant.owner_name,
      ownerContact: restaurant.owner_contact,
      ownerContactMethod: restaurant.owner_contact_method,
      rating: restaurant.rating,
      logoUrl: restaurant.logo_url,
      isActive: restaurant.is_active,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at
    }));

    return NextResponse.json({
      success: true,
      restaurants: restaurants,
      total: restaurants.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 