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
        ambianceImageUrl: data.ambiance_image_url || null,
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
      console.error('Erreur lors de la mise à jour dans Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour dans la base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur dans PUT restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurantId = id;

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

    // Vérifier d'abord si le restaurant existe
    const { data: existingRestaurant, error: checkError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name')
      .eq('id', actualRestaurantId)
      .single();

    if (checkError || !existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Suppression en cascade du restaurant: ${existingRestaurant.name}`);

    // Étape 1: Supprimer toutes les données d'analytics liées à ce restaurant
    try {
      console.log('🔍 Suppression des données d\'analytics...');
      
      // Supprimer les vues de modèles
      const { error: modelViewsError } = await supabaseAdmin
        .from('model_views')
        .delete()
        .eq('restaurant_id', actualRestaurantId);

      if (modelViewsError) {
        console.error('Erreur lors de la suppression des vues de modèles:', modelViewsError);
      }

      // Supprimer les sessions d'analytics
      const { error: sessionsError } = await supabaseAdmin
        .from('analytics_sessions')
        .delete()
        .eq('restaurant_id', actualRestaurantId);

      if (sessionsError) {
        console.error('Erreur lors de la suppression des sessions:', sessionsError);
      }

      // Supprimer les vues de menu
      const { error: menuViewsError } = await supabaseAdmin
        .from('analytics_menu_views')
        .delete()
        .eq('restaurant_id', actualRestaurantId);

      if (menuViewsError) {
        console.error('Erreur lors de la suppression des vues de menu:', menuViewsError);
      }

      console.log('✅ Données d\'analytics supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression des analytics:', error);
      // Continuer même si certaines tables d'analytics n'existent pas
    }

    // Étape 2: Supprimer tous les modèles 3D liés à ce restaurant
    try {
      console.log('🎨 Suppression des modèles 3D...');
      
      const { data: modelsToDelete, error: modelsError } = await supabaseAdmin
        .from('models_3d')
        .select('id, name, storage_path, thumbnail_path, glb_path, usdz_path')
        .eq('restaurant_id', actualRestaurantId);

      if (modelsError) {
        console.error('Erreur lors de la récupération des modèles:', modelsError);
      } else if (modelsToDelete && modelsToDelete.length > 0) {
        // Supprimer les fichiers du storage (optionnel, en fonction de la configuration)
        console.log(`🗄️ ${modelsToDelete.length} modèles 3D à supprimer`);
        
        // Supprimer les modèles de la base de données
        const { error: deleteModelsError } = await supabaseAdmin
          .from('models_3d')
          .delete()
          .eq('restaurant_id', actualRestaurantId);

        if (deleteModelsError) {
          console.error('Erreur lors de la suppression des modèles 3D:', deleteModelsError);
        } else {
          console.log('✅ Modèles 3D supprimés');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des modèles 3D:', error);
    }

    // Étape 3: Supprimer tous les utilisateurs liés à ce restaurant
    try {
      console.log('👥 Suppression des utilisateurs...');
      
      const { data: usersToDelete, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('restaurant_id', actualRestaurantId);

      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      } else if (usersToDelete && usersToDelete.length > 0) {
        console.log(`👤 ${usersToDelete.length} utilisateurs à supprimer`);
        
        // Supprimer les utilisateurs de la base de données
        const { error: deleteUsersError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('restaurant_id', actualRestaurantId);

        if (deleteUsersError) {
          console.error('Erreur lors de la suppression des utilisateurs:', deleteUsersError);
        } else {
          console.log('✅ Utilisateurs supprimés');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des utilisateurs:', error);
    }

    // Étape 4: Supprimer le restaurant lui-même
    console.log('🏪 Suppression du restaurant...');
    
    const { error: deleteError } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', actualRestaurantId);

    if (deleteError) {
      console.error('Erreur lors de la suppression du restaurant:', deleteError);
      return NextResponse.json(
        { error: `Erreur lors de la suppression du restaurant: ${deleteError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Restaurant supprimé avec succès');

    return NextResponse.json({
      success: true,
      message: `Restaurant "${existingRestaurant.name}" et toutes ses données associées ont été supprimés avec succès`
    });

  } catch (error) {
    console.error('Erreur dans DELETE restaurant:', error);
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
    const restaurantForFrontend = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      address: data.address,
      shortDescription: data.short_description || '',
      rating: data.rating || 4.8,
      logoUrl: data.logo_url || '/logos/bella-vita.png',
      ambianceImageUrl: data.ambiance_image_url || null,
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
      restaurant: restaurantForFrontend
    });

  } catch (error) {
    console.error('Erreur dans GET restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}