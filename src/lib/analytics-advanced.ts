import { supabaseAdmin } from './supabase';
import { 
  ModelTrendAnalytics, 
  ConversionMetrics, 
  SmartAlert, 
  AdvancedAnalytics, 
  POSOrder 
} from '@/types/analytics';

// Utilitaire pour formater les dates
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatWeek(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Calculer les tendances des modèles par période
export async function getModelTrendAnalytics(
  restaurantId: string, 
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<ModelTrendAnalytics[]> {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Récupérer toutes les vues pour la période
    const { data: views, error } = await supabaseAdmin
      .from('model_views')
      .select('model_id, viewed_at')
      .eq('restaurant_id', restaurantId)
      .gte('viewed_at', startDate.toISOString());

    if (error) {
      console.error('Erreur lors de la récupération des vues:', error);
      return [];
    }

    // Récupérer les détails des modèles
    const modelIds = [...new Set(views?.map(v => v.model_id) || [])];
    const { data: models } = await supabaseAdmin
      .from('models_3d')
      .select('id, name')
      .in('id', modelIds);

    const modelsMap = new Map(models?.map(m => [m.id, m.name]) || []);

    // Grouper par modèle et calculer les tendances
    const modelStats = new Map<string, {
      dailyViews: Map<string, number>;
      weeklyViews: Map<string, number>;
      monthlyViews: Map<string, number>;
      totalViews: number;
    }>();

    views?.forEach(view => {
      const date = new Date(view.viewed_at);
      const dateStr = formatDate(date);
      const weekStr = formatWeek(date);
      const monthStr = formatMonth(date);

      if (!modelStats.has(view.model_id)) {
        modelStats.set(view.model_id, {
          dailyViews: new Map(),
          weeklyViews: new Map(),
          monthlyViews: new Map(),
          totalViews: 0
        });
      }

      const stats = modelStats.get(view.model_id)!;
      stats.totalViews += 1;
      stats.dailyViews.set(dateStr, (stats.dailyViews.get(dateStr) || 0) + 1);
      stats.weeklyViews.set(weekStr, (stats.weeklyViews.get(weekStr) || 0) + 1);
      stats.monthlyViews.set(monthStr, (stats.monthlyViews.get(monthStr) || 0) + 1);
    });

    // Convertir en résultat final avec calcul des tendances
    const result: ModelTrendAnalytics[] = [];

    for (const [modelId, stats] of modelStats.entries()) {
      const dailyViewsArray = Array.from(stats.dailyViews.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const weeklyViewsArray = Array.from(stats.weeklyViews.entries())
        .map(([week, views]) => ({ week, views }))
        .sort((a, b) => a.week.localeCompare(b.week));

      const monthlyViewsArray = Array.from(stats.monthlyViews.entries())
        .map(([month, views]) => ({ month, views }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Calculer la tendance (simple régression linéaire sur les vues quotidiennes)
      const trend = calculateTrend(dailyViewsArray.map(d => d.views));
      const growthRate = calculateGrowthRate(dailyViewsArray.map(d => d.views));

      result.push({
        modelId,
        name: modelsMap.get(modelId) || modelId,
        dailyViews: dailyViewsArray,
        weeklyViews: weeklyViewsArray,
        monthlyViews: monthlyViewsArray,
        growthRate,
        trend
      });
    }

    return result.sort((a, b) => b.dailyViews.reduce((sum, d) => sum + d.views, 0) - 
                                 a.dailyViews.reduce((sum, d) => sum + d.views, 0));

  } catch (error) {
    console.error('Erreur lors du calcul des tendances:', error);
    return [];
  }
}

// Calculer les métriques de conversion (préparé pour l'intégration POS)
export async function getConversionMetrics(
  restaurantId: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<ConversionMetrics[]> {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Récupérer les vues de modèles
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('model_views')
      .select('model_id')
      .eq('restaurant_id', restaurantId)
      .gte('viewed_at', startDate.toISOString());

    if (viewsError) {
      console.error('Erreur lors de la récupération des vues:', viewsError);
      return [];
    }

    // Pour l'instant, simuler les données de commandes POS
    // TODO: Remplacer par de vraies données POS quand l'intégration sera prête
    const mockOrdersData = await getMockPOSData(restaurantId, startDate);

    // Grouper les vues par modèle
    const viewsMap = new Map<string, number>();
    views?.forEach(view => {
      viewsMap.set(view.model_id, (viewsMap.get(view.model_id) || 0) + 1);
    });

    // Récupérer les détails des modèles
    const modelIds = [...viewsMap.keys()];
    const { data: models } = await supabaseAdmin
      .from('models_3d')
      .select('id, name, price')
      .in('id', modelIds);

    const result: ConversionMetrics[] = [];

    for (const model of models || []) {
      const totalViews = viewsMap.get(model.id) || 0;
      const ordersCount = mockOrdersData.get(model.id)?.orders || 0;
      const revenueGenerated = mockOrdersData.get(model.id)?.revenue || 0;
      const conversionRate = totalViews > 0 ? (ordersCount / totalViews) * 100 : 0;
      const avgOrderValue = ordersCount > 0 ? revenueGenerated / ordersCount : 0;

      result.push({
        modelId: model.id,
        name: model.name,
        totalViews,
        ordersCount,
        conversionRate,
        revenueGenerated,
        avgOrderValue
      });
    }

    return result.sort((a, b) => b.conversionRate - a.conversionRate);

  } catch (error) {
    console.error('Erreur lors du calcul des métriques de conversion:', error);
    return [];
  }
}

// Générer des alertes intelligentes
export async function generateSmartAlerts(
  restaurantId: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<SmartAlert[]> {
  try {
    const alerts: SmartAlert[] = [];
    
    // Récupérer les métriques nécessaires
    const trendAnalytics = await getModelTrendAnalytics(restaurantId, timeRange);
    const conversionMetrics = await getConversionMetrics(restaurantId, timeRange);

    // Alerte 1: Plats avec beaucoup de vues mais faible conversion
    conversionMetrics.forEach(metric => {
      if (metric.totalViews > 20 && metric.conversionRate < 5) {
        alerts.push({
          id: `low_conversion_${metric.modelId}`,
          type: 'high_views_no_orders',
          severity: 'warning',
          title: 'Plat populaire mais peu commandé',
          message: `${metric.name} a ${metric.totalViews} vues mais seulement ${metric.ordersCount} commandes (${metric.conversionRate.toFixed(1)}% de conversion)`,
          modelId: metric.modelId,
          modelName: metric.name,
          metrics: {
            views: metric.totalViews,
            orders: metric.ordersCount,
            conversionRate: metric.conversionRate
          },
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
    });

    // Alerte 2: Plats en déclin de popularité
    trendAnalytics.forEach(trend => {
      if (trend.trend === 'descending' && trend.growthRate < -20) {
        alerts.push({
          id: `declining_${trend.modelId}`,
          type: 'declining_popularity',
          severity: 'info',
          title: 'Baisse de popularité',
          message: `${trend.name} connaît une baisse de ${Math.abs(trend.growthRate).toFixed(1)}% des consultations`,
          modelId: trend.modelId,
          modelName: trend.name,
          metrics: {
            trend: trend.growthRate,
            views: trend.dailyViews.reduce((sum, d) => sum + d.views, 0)
          },
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
    });

    // Alerte 3: Plats en forte croissance
    trendAnalytics.forEach(trend => {
      if (trend.trend === 'ascending' && trend.growthRate > 50) {
        alerts.push({
          id: `trending_up_${trend.modelId}`,
          type: 'trending_up',
          severity: 'info',
          title: 'Plat en tendance',
          message: `${trend.name} connaît une forte croissance de ${trend.growthRate.toFixed(1)}% des consultations`,
          modelId: trend.modelId,
          modelName: trend.name,
          metrics: {
            trend: trend.growthRate,
            views: trend.dailyViews.reduce((sum, d) => sum + d.views, 0)
          },
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

  } catch (error) {
    console.error('Erreur lors de la génération des alertes:', error);
    return [];
  }
}

// Fonction principale pour récupérer toutes les analytics avancées
export async function getAdvancedAnalytics(
  restaurantId: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<AdvancedAnalytics> {
  try {
    const [trendAnalytics, conversionMetrics, alerts] = await Promise.all([
      getModelTrendAnalytics(restaurantId, timeRange),
      getConversionMetrics(restaurantId, timeRange),
      generateSmartAlerts(restaurantId, timeRange)
    ]);

    // Calculer le résumé
    const totalViews = conversionMetrics.reduce((sum, m) => sum + m.totalViews, 0);
    const totalOrders = conversionMetrics.reduce((sum, m) => sum + m.ordersCount, 0);
    const totalRevenue = conversionMetrics.reduce((sum, m) => sum + m.revenueGenerated, 0);
    const overallConversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const mostViewedModel = conversionMetrics.reduce((max, model) => 
      model.totalViews > max.totalViews ? model : max, 
      conversionMetrics[0] || { name: 'Aucun', totalViews: 0 }
    ).name;

    const bestConvertingModel = conversionMetrics.reduce((max, model) => 
      model.conversionRate > max.conversionRate ? model : max, 
      conversionMetrics[0] || { name: 'Aucun', conversionRate: 0 }
    ).name;

    const worstConvertingModel = conversionMetrics.reduce((min, model) => 
      model.conversionRate < min.conversionRate ? model : min, 
      conversionMetrics[0] || { name: 'Aucun', conversionRate: 0 }
    ).name;

    return {
      topModelsByPeriod: {
        daily: trendAnalytics,
        weekly: trendAnalytics, // Même données pour l'instant
        monthly: trendAnalytics // Même données pour l'instant
      },
      conversionMetrics,
      alerts,
      summary: {
        totalViews,
        totalOrders,
        overallConversionRate,
        totalRevenue,
        avgOrderValue,
        mostViewedModel,
        bestConvertingModel,
        worstConvertingModel
      }
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics avancées:', error);
    throw error;
  }
}

// Fonctions utilitaires pour les calculs statistiques
function calculateTrend(values: number[]): 'ascending' | 'descending' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
  
  const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (diff > 10) return 'ascending';
  if (diff < -10) return 'descending';
  return 'stable';
}

function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  
  const firstValue = values[0] || 1; // Éviter division par zéro
  const lastValue = values[values.length - 1];
  
  return ((lastValue - firstValue) / firstValue) * 100;
}

// Fonction temporaire pour simuler les données POS
// TODO: Remplacer par l'intégration réelle du POS
async function getMockPOSData(
  restaurantId: string, 
  startDate: Date
): Promise<Map<string, { orders: number; revenue: number }>> {
  
  // Simuler des données réalistes basées sur les modèles existants
  const { data: models } = await supabaseAdmin
    .from('models_3d')
    .select('id, price')
    .eq('restaurant_id', restaurantId);

  const mockData = new Map<string, { orders: number; revenue: number }>();
  
  models?.forEach(model => {
    // Simuler entre 0 et 15 commandes par modèle
    const orders = Math.floor(Math.random() * 16);
    const price = model.price || 15; // Prix par défaut si non défini
    const revenue = orders * price;
    
    mockData.set(model.id, { orders, revenue });
  });

  return mockData;
}