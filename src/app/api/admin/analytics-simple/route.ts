import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Analytics simple - bypass auth pour test');

    // 1. Récupérer tous les restaurants avec leurs stats
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, slug, logo_url, created_at, is_active')
      .eq('is_active', true)
      .order('name');

    if (restaurantsError) {
      console.error('❌ Erreur restaurants:', restaurantsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur restaurants: ' + restaurantsError.message 
      }, { status: 500 });
    }

    console.log('🏪 Restaurants trouvés:', restaurants?.length || 0);

    // 2. Récupérer toutes les vues de modèles
    const { data: allViews, error: viewsError } = await supabaseAdmin
      .from('model_views')
      .select('id, model_id, restaurant_id, viewed_at, view_duration, device_type')
      .order('viewed_at', { ascending: false });

    if (viewsError) {
      console.error('❌ Erreur vues:', viewsError);
      // Continuer même si pas de vues
      console.log('⚠️ Pas de vues trouvées, continuons avec des données vides');
    }

    console.log('👁️ Vues trouvées:', allViews?.length || 0);

    // 3. Récupérer tous les modèles
    const { data: allModels, error: modelsError } = await supabaseAdmin
      .from('models_3d')
      .select('id, name, restaurant_id, thumbnail_url, category');

    if (modelsError) {
      console.error('❌ Erreur modèles:', modelsError);
      // Continuer même si pas de modèles
      console.log('⚠️ Pas de modèles trouvés, continuons avec des données vides');
    }

    console.log('🍽️ Modèles trouvés:', allModels?.length || 0);

    // 4. Calculer les stats basiques
    const views = allViews || [];
    const models = allModels || [];
    
    // Stats globales
    const globalStats = {
      totalViews: views.length,
      totalRestaurants: restaurants?.length || 0,
      totalModels: models.length,
      avgViewsPerRestaurant: restaurants?.length ? Math.round(views.length / restaurants.length) : 0,
      deviceStats: { mobile: 0, tablet: 0, desktop: 0 }
    };

    // Compter les devices
    views.forEach(view => {
      if (view.device_type && globalStats.deviceStats[view.device_type as keyof typeof globalStats.deviceStats] !== undefined) {
        globalStats.deviceStats[view.device_type as keyof typeof globalStats.deviceStats]++;
      }
    });

    // Créer le classement simple des restaurants
    const restaurantRanking = (restaurants || []).map((restaurant, index) => {
      const restaurantViews = views.filter(v => v.restaurant_id === restaurant.id);
      const restaurantModels = models.filter(m => m.restaurant_id === restaurant.id);
      
      // Trouver le modèle le plus vu
      const modelViewCounts = new Map();
      restaurantViews.forEach(view => {
        modelViewCounts.set(view.model_id, (modelViewCounts.get(view.model_id) || 0) + 1);
      });
      
      let topModel = null;
      let topModelViews = 0;
      modelViewCounts.forEach((count, modelId) => {
        if (count > topModelViews) {
          topModelViews = count;
          const model = models.find(m => m.id === modelId);
          topModel = model?.name || 'Modèle inconnu';
        }
      });

      return {
        rank: index + 1,
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logo_url,
        totalViews: restaurantViews.length,
        uniqueModelsViewed: new Set(restaurantViews.map(v => v.model_id)).size,
        topModel,
        topModelViews,
        avgDuration: 0, // Simplifié pour le test
        createdAt: restaurant.created_at,
        recentViews: []
      };
    }).sort((a, b) => b.totalViews - a.totalViews);

    // Stats des 7 derniers jours (simplifiées)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      const dayViews = views.filter(v => v.viewed_at.startsWith(dayKey)).length;
      last7Days.push({
        date: date.toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        views: dayViews
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        global: {
          ...globalStats,
          viewsByDay: last7Days
        },
        restaurantRanking,
        summary: {
          totalRestaurants: globalStats.totalRestaurants,
          totalViews: globalStats.totalViews,
          totalModels: globalStats.totalModels,
          topRestaurant: restaurantRanking[0] || null,
          mostActiveToday: null
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur analytics simple:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des analytics: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
} 