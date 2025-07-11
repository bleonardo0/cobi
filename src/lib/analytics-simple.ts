import { supabaseAdmin } from './supabase';

// Interface pour les vues de modèles (simplifié)
interface ModelView {
  id?: string;
  model_id: string;
  restaurant_id: string;
  viewed_at?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  user_agent?: string;
  session_id?: string;
  interaction_type?: string;
  view_duration?: number;
}

// Fonction pour détecter le type d'appareil
const getDeviceType = (userAgent: string): 'mobile' | 'tablet' | 'desktop' => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Générer un ID de session simple
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Fonction principale pour tracker une vue de modèle
export const trackModelView = async (
  modelId: string,
  restaurantId: string,
  userAgent?: string,
  sessionId?: string,
  deviceType?: 'mobile' | 'tablet' | 'desktop',
  interactionType?: string
): Promise<boolean> => {
  try {
    console.log(`📊 Tracking vue modèle: ${modelId} pour restaurant: ${restaurantId}`);
    
    const modelView: ModelView = {
      model_id: modelId,
      restaurant_id: restaurantId,
      device_type: deviceType || (userAgent ? getDeviceType(userAgent) : 'desktop'),
      user_agent: userAgent,
      session_id: sessionId || generateSessionId(),
      interaction_type: interactionType || 'view'
    };

    const { data, error } = await supabaseAdmin
      .from('model_views')
      .insert(modelView)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du tracking:', error);
      return false;
    }

    console.log('✅ Vue modèle trackée:', data);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du tracking de vue modèle:', error);
    return false;
  }
};

// Fonction pour récupérer les statistiques simples
export const getModelViewsStats = async (restaurantId?: string) => {
  try {
    let query = supabaseAdmin
      .from('model_views')
      .select('*');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        totalViews: 0,
        modelStats: [],
        deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
        recentViews: []
      };
    }

    // Calculer les statistiques
    const totalViews = data.length;
    
    // Statistiques par modèle
    const modelCounts: { [key: string]: number } = {};
    const modelDurations: { [key: string]: number[] } = {};
    const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
    
    data.forEach(view => {
      // Compter par modèle
      modelCounts[view.model_id] = (modelCounts[view.model_id] || 0) + 1;
      
      // Collecter les durées par modèle (si disponibles)
      if (view.view_duration && view.view_duration > 0) {
        if (!modelDurations[view.model_id]) {
          modelDurations[view.model_id] = [];
        }
        modelDurations[view.model_id].push(view.view_duration);
      }
      
      // Compter par device
      const deviceType = view.device_type as 'mobile' | 'tablet' | 'desktop';
      if (deviceType && deviceCounts.hasOwnProperty(deviceType)) {
        deviceCounts[deviceType]++;
      }
    });

    // Récupérer les vrais noms des modèles depuis la table models_3d
    const modelIds = Object.keys(modelCounts);
    const { data: modelsData } = await supabaseAdmin
      .from('models_3d')
      .select('id, name')
      .in('id', modelIds);

    const modelNamesMap = new Map();
    modelsData?.forEach(model => {
      modelNamesMap.set(model.id, model.name);
    });

    // Top modèles avec vrais noms et durées moyennes
    const modelStats = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([modelId, count]) => {
        // Calculer la durée moyenne pour ce modèle
        const durations = modelDurations[modelId] || [];
        const avgDuration = durations.length > 0 
          ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
          : 0;
        
        return {
          modelId,
          count,
          name: modelNamesMap.get(modelId) || `Modèle ${modelId}`,
          percentage: Math.round((count / totalViews) * 100),
          avgDuration
        };
      });

    // Vues récentes (7 derniers jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentViews = data
      .filter(view => new Date(view.viewed_at) > weekAgo)
      .sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())
      .slice(0, 20);

    // Statistiques par jour (7 derniers jours)
    const viewsByDay: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      viewsByDay[dayKey] = 0;
    }

    data.forEach(view => {
      const viewDate = new Date(view.viewed_at);
      const dayKey = viewDate.toISOString().split('T')[0];
      if (viewsByDay.hasOwnProperty(dayKey)) {
        viewsByDay[dayKey]++;
      }
    });

    // Calculer la durée moyenne globale
    const allDurations = Object.values(modelDurations).flat();
    const globalAvgDuration = allDurations.length > 0 
      ? Math.round(allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length)
      : 0;

    console.log(`📊 Stats calculées: ${totalViews} vues totales, ${modelStats.length} modèles, durée moyenne: ${globalAvgDuration}s`);

    return {
      totalViews,
      modelStats,
      deviceStats: deviceCounts,
      recentViews: recentViews.slice(0, 10),
      viewsByDay,
      globalAvgDuration
    };

  } catch (error) {
    console.error('❌ Erreur lors du calcul des stats:', error);
    return {
      totalViews: 0,
      modelStats: [],
      deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
      recentViews: [],
      viewsByDay: {}
    };
  }
};

// Fonction pour supprimer toutes les données (reset)
export const resetAllData = async (): Promise<boolean> => {
  try {
    console.log('🧹 Suppression de toutes les données analytics...');
    
    const { error } = await supabaseAdmin
      .from('model_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tous les enregistrements

    if (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return false;
    }

    console.log('✅ Toutes les données ont été supprimées');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du reset:', error);
    return false;
  }
}; 