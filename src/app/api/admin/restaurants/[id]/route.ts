import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

interface RestaurantUpdateData {
  name: string;
  slug: string;
  address: string;
  shortDescription: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurantId = id;
    const updateData: RestaurantUpdateData = await request.json();

    // Validation des données
    if (!updateData.name || !updateData.address) {
      return NextResponse.json(
        { error: 'Nom et adresse sont obligatoires' },
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

    // Vérifier si c'est un UUID valide, sinon utiliser un mapping
    const restaurantMapping: Record<string, string> = {
      'bella-vita-uuid': '123e4567-e89b-12d3-a456-426614174000' // Mapping vers le vrai UUID
    };
    
    const actualRestaurantId = restaurantMapping[restaurantId] || restaurantId;

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

    // Mise à jour dans Supabase
    console.log('Mise à jour du restaurant dans Supabase:', actualRestaurantId, updateData);

    try {
      const { data, error } = await supabaseAdmin
        .from('restaurants')
        .update({
          name: updateData.name,
          slug: updateData.slug,
          address: updateData.address,
          short_description: updateData.shortDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', actualRestaurantId)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        return NextResponse.json(
          { error: `Erreur lors de la mise à jour: ${error.message}` },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Restaurant non trouvé' },
          { status: 404 }
        );
      }

      // Convertir les données Supabase au format attendu par le frontend
      const restaurantForFrontend = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        address: data.address,
        shortDescription: data.short_description || '',
        rating: data.rating || 4.8,
        logoUrl: data.logo_url || '/logos/bella-vita.png',
        subscriptionStatus: data.subscription_status || 'active',
        subscriptionPlan: data.subscription_plan || 'premium',
        phone: data.phone || '+33 1 23 45 67 89',
        website: data.website || 'https://bella-vita.fr',
        primaryColor: data.primary_color || '#dc2626',
        secondaryColor: data.secondary_color || '#991b1b',
        isActive: data.is_active !== false,
        allergens: data.allergens || ['gluten', 'lactose'],
        createdAt: data.created_at || '2024-01-15T10:00:00Z',
        updatedAt: data.updated_at || new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Restaurant mis à jour avec succès',
        restaurant: restaurantForFrontend
      });

    } catch (error) {
      // Cette erreur vient du try-catch, pas du if (error) de Supabase
      console.error('Erreur lors de la mise à jour du restaurant:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la mise à jour du restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurantId = id;

    // Vérifier si c'est un UUID valide, sinon utiliser un mapping
    const restaurantMapping: Record<string, string> = {
      'bella-vita-uuid': '123e4567-e89b-12d3-a456-426614174000' // Mapping vers le vrai UUID
    };
    
    const actualRestaurantId = restaurantMapping[restaurantId] || restaurantId;

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

    // Récupérer les données depuis Supabase
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', actualRestaurantId)
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: `Erreur lors de la récupération: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // Convertir les données Supabase au format attendu par le frontend
    const restaurant = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      address: data.address,
      shortDescription: data.short_description || '',
      rating: data.rating || 4.8,
      logoUrl: data.logo_url || '/logos/bella-vita.png',
      subscriptionStatus: data.subscription_status || 'active',
      subscriptionPlan: data.subscription_plan || 'premium',
      phone: data.phone || '+33 1 23 45 67 89',
      website: data.website || 'https://bella-vita.fr',
      primaryColor: data.primary_color || '#dc2626',
      secondaryColor: data.secondary_color || '#991b1b',
      isActive: data.is_active !== false,
      allergens: data.allergens || ['gluten', 'lactose'],
      createdAt: data.created_at || '2024-01-15T10:00:00Z',
      updatedAt: data.updated_at || new Date().toISOString()
    };

    console.log('🔍 Données récupérées depuis Supabase:', restaurant);

    return NextResponse.json({
      success: true,
      restaurant: restaurant
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}