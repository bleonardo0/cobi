import { supabaseAdmin } from './supabase';

// Types simplifiés
export interface ModelView {
  id: string;
  modelId: string;
  restaurantId: string;
  viewedAt: string;
  viewDuration?: number;
  sessionId?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
}

export interface AnalyticsStats {
  totalViews: number;
  modelStats: Array<{
    modelId: string;
    name: string;
    views: number;
    avgDuration: number;
    percentage: number;
  }>;
  deviceStats: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  viewsByDay: Record<string, number>;
  globalAvgDuration: number;
}

// Fonction pour détecter le type d'appareil
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet')) return 'tablet';
  return 'desktop';
}

// Tracking simplifié avec logique d'upsert pour éviter les doublons
export async function trackModelView(
  modelId: string,
  restaurantId: string,
  userAgent: string,
  sessionId?: string,
  viewDuration?: number
): Promise<boolean> {
  try {
    const deviceType = getDeviceType(userAgent);
    const now = new Date().toISOString();
    
    // Si on a un sessionId, essayer d'abord de mettre à jour une vue existante
    if (sessionId) {
      const { data: existingView, error: findError } = await supabaseAdmin
        .from('model_views')
        .select('id')
        .eq('model_id', modelId)
        .eq('restaurant_id', restaurantId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (findError) {
        console.error('❌ Erreur lors de la recherche de vue existante:', findError);
      }

      if (existingView) {
        // Mise à jour de la vue existante
        const { error: updateError } = await supabaseAdmin
          .from('model_views')
          .update({
            view_duration: viewDuration || null,
            user_agent: userAgent,
            device_type: deviceType,
            viewed_at: now // Mettre à jour le timestamp
          })
          .eq('id', existingView.id);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour de vue:', updateError);
          return false;
        }

        console.log('✅ Vue mise à jour:', { modelId, restaurantId, deviceType, viewDuration });
        return true;
      }
    }

    // Créer une nouvelle vue si pas trouvée
    const { error } = await supabaseAdmin
      .from('model_views')
      .insert({
        model_id: modelId,
        restaurant_id: restaurantId,
        viewed_at: now,
        view_duration: viewDuration || null,
        session_id: sessionId || null,
        device_type: deviceType,
        user_agent: userAgent
      });

    if (error) {
      console.error('❌ Erreur lors du tracking de vue:', error);
      return false;
    }

    console.log('✅ Nouvelle vue créée:', { modelId, restaurantId, deviceType, viewDuration });
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du tracking de vue:', error);
    return false;
  }
}

// Récupération des vues pour un modèle spécifique
export async function getModelViews(
  modelId: string,
  restaurantId: string,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<number> {
  try {
    const now = new Date();
    const periodInDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - (periodInDays * 24 * 60 * 60 * 1000));

    const { data, error } = await supabaseAdmin
      .from('model_views')
      .select('id')
      .eq('model_id', modelId)
      .eq('restaurant_id', restaurantId)
      .gte('viewed_at', startDate.toISOString());

    if (error) {
      console.error('❌ Erreur lors de la récupération des vues:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vues:', error);
    return 0;
  }
}

// Récupération des stats globales - Version simplifiée
export async function getAnalyticsStats(restaurantId?: string, timeRange?: '7d' | '30d' | '90d'): Promise<AnalyticsStats> {
  try {
    let query = supabaseAdmin
      .from('model_views')
      .select('model_id, viewed_at, view_duration, device_type');

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    // Ajouter le filtre de période
    if (timeRange) {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('viewed_at', startDate.toISOString());
    }

    const { data: views, error } = await query;

    if (error) {
      console.error('❌ Erreur lors de la récupération des stats:', error);
      return {
        totalViews: 0,
        modelStats: [],
        deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
        viewsByDay: {},
        globalAvgDuration: 0
      };
    }

    const totalViews = views?.length || 0;
    
    // Calculer les stats par modèle
    const modelStatsMap = new Map<string, { views: number; totalDuration: number; count: number }>();
    const deviceStats = { mobile: 0, tablet: 0, desktop: 0 };
    const viewsByDay: Record<string, number> = {};

    views?.forEach(view => {
      // Stats par modèle
      const modelId = view.model_id;
      const current = modelStatsMap.get(modelId) || { views: 0, totalDuration: 0, count: 0 };
      current.views += 1;
      if (view.view_duration) {
        current.totalDuration += view.view_duration;
        current.count += 1;
      }
      modelStatsMap.set(modelId, current);

      // Stats par appareil
      const deviceType = view.device_type as 'mobile' | 'tablet' | 'desktop';
      if (deviceType && deviceStats[deviceType] !== undefined) {
        deviceStats[deviceType] += 1;
      }

      // Stats par jour
      const dayKey = new Date(view.viewed_at).toISOString().split('T')[0];
      viewsByDay[dayKey] = (viewsByDay[dayKey] || 0) + 1;
    });

    // Convertir en tableau et calculer les pourcentages
    const modelStats = Array.from(modelStatsMap.entries())
      .map(([modelId, stats]) => ({
        modelId,
        name: modelId, // Sera enrichi plus tard avec les vraies données
        views: stats.views,
        avgDuration: stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0,
        percentage: totalViews > 0 ? Math.round((stats.views / totalViews) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20); // Top 20

    // Calculer la durée moyenne globale
    const allDurations = views?.filter(v => v.view_duration).map(v => v.view_duration) || [];
    const globalAvgDuration = allDurations.length > 0 
      ? Math.round(allDurations.reduce((sum, duration) => sum + duration, 0) / allDurations.length)
      : 0;

    return {
      totalViews,
      modelStats,
      deviceStats,
      viewsByDay,
      globalAvgDuration
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    return {
      totalViews: 0,
      modelStats: [],
      deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
      viewsByDay: {},
      globalAvgDuration: 0
    };
  }
} 