'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/ClerkAuthProvider';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/shared/DashboardLayout';
import StatsCard from '@/components/shared/StatsCard';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RestaurantRanking {
  rank: number;
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  totalViews: number;
  uniqueModelsViewed: number;
  topModel?: string;
  topModelViews: number;
  avgDuration: number;
  createdAt: string;
  recentViews: Array<{
    modelName: string;
    viewedAt: string;
    duration?: number;
  }>;
}

interface GlobalStats {
  totalViews: number;
  totalRestaurants: number;
  totalModels: number;
  avgViewsPerRestaurant: number;
  viewsByDay: Array<{ date: string; views: number }>;
  deviceStats: { mobile: number; tablet: number; desktop: number };
}

interface AnalyticsData {
  global: GlobalStats;
  restaurantRanking: RestaurantRanking[];
  summary: {
    totalRestaurants: number;
    totalViews: number;
    totalModels: number;
    topRestaurant?: RestaurantRanking;
    mostActiveToday?: RestaurantRanking;
  };
}

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, authLoading, router]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();

      console.log('📊 Réponse API analytics:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des analytics');
      }

      setData(result.data);
    } catch (error) {
      console.error('❌ Erreur analytics:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsSimple = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/analytics-simple');
      const result = await response.json();

      console.log('📊 Réponse API analytics simple:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la récupération des analytics');
      }

      setData(result.data);
    } catch (error) {
      console.error('❌ Erreur analytics simple:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostic = async () => {
    try {
      console.log('🧪 Lancement du diagnostic...');
      const response = await fetch('/api/admin/test');
      const result = await response.json();
      setDebugInfo(result);
      console.log('🧪 Résultats diagnostic:', result);
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      setDebugInfo({ error: 'Erreur lors du diagnostic' });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout userRole="admin" restaurantName="Admin" restaurantSlug="admin">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="admin" restaurantName="Admin" restaurantSlug="admin">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Réessayer
              </button>
              <button
                onClick={fetchAnalyticsSimple}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🚀 Test Simple
              </button>
              <button
                onClick={runDiagnostic}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                🧪 Diagnostic
              </button>
            </div>
            
            {debugInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">🔍 Informations de diagnostic :</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                
                {debugInfo.recommendations && debugInfo.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-orange-600 mb-2">💡 Recommandations :</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {debugInfo.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout userRole="admin" restaurantName="Admin" restaurantSlug="admin">
        <div className="text-center py-12">
          <div className="text-neutral-600">Aucune donnée disponible</div>
        </div>
      </DashboardLayout>
    );
  }

  const maxViews = Math.max(...data.global.viewsByDay.map(d => d.views));
  const totalDeviceViews = data.global.deviceStats.mobile + data.global.deviceStats.tablet + data.global.deviceStats.desktop;

  return (
    <DashboardLayout userRole="admin" restaurantName="Admin" restaurantSlug="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">📊 Analytics Globales</h1>
          <p className="text-neutral-600 mt-2">Vue d'ensemble de tous les restaurants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Restaurants"
            value={data.summary.totalRestaurants.toString()}
            icon="🏪"
            change={{ value: "actifs", trend: "stable" }}
          />
          <StatsCard
            title="Total Vues"
            value={data.summary.totalViews.toLocaleString('fr-FR')}
            icon="👁️"
            change={{ value: `${data.global.avgViewsPerRestaurant} moy/resto`, trend: "up" }}
          />
          <StatsCard
            title="Total Modèles"
            value={data.summary.totalModels.toString()}
            icon="🍽️"
            change={{ value: `${Math.round(data.summary.totalModels / data.summary.totalRestaurants)} moy/resto`, trend: "stable" }}
          />
          <StatsCard
            title="Restaurant Leader"
            value={data.summary.topRestaurant?.name || "Aucun"}
            icon="🏆"
            change={{ value: `${data.summary.topRestaurant?.totalViews || 0} vues`, trend: "up" }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Views Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">📈 Vues des 7 derniers jours</h3>
            <div className="space-y-3">
              {data.global.viewsByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 w-20 flex-shrink-0">{day.date}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-neutral-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: maxViews > 0 ? `${(day.views / maxViews) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-8 text-right">{day.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">📱 Répartition par appareil</h3>
            <div className="space-y-4">
              {[
                { name: 'Mobile', count: data.global.deviceStats.mobile, icon: '📱', color: 'from-green-500 to-green-600' },
                { name: 'Desktop', count: data.global.deviceStats.desktop, icon: '💻', color: 'from-blue-500 to-blue-600' },
                { name: 'Tablet', count: data.global.deviceStats.tablet, icon: '📱', color: 'from-purple-500 to-purple-600' }
              ].map((device) => {
                const percentage = totalDeviceViews > 0 ? Math.round((device.count / totalDeviceViews) * 100) : 0;
                return (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{device.icon}</span>
                      <span className="text-sm text-neutral-700">{device.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${device.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-12 text-right">
                        {device.count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Restaurant Ranking */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900">🏆 Classement des Restaurants</h3>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
          
          <div className="space-y-4">
            {data.restaurantRanking.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: restaurant.rank * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-white rounded-xl border border-neutral-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(restaurant.rank)}`}>
                    {getRankIcon(restaurant.rank)}
                  </div>
                  
                  {/* Restaurant Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-neutral-900">{restaurant.name}</h4>
                      <Link
                        href={`/admin/restaurants/${restaurant.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Gérer →
                      </Link>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mt-1">
                      <span>👁️ {restaurant.totalViews.toLocaleString('fr-FR')} vues</span>
                      <span>🍽️ {restaurant.uniqueModelsViewed} modèles vus</span>
                      {restaurant.avgDuration > 0 && (
                        <span>⏱️ {formatDuration(restaurant.avgDuration)} moy.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Model */}
                <div className="text-right">
                  {restaurant.topModel ? (
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        🥇 {restaurant.topModel}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {restaurant.topModelViews} vues
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500">Aucun modèle vu</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {data.restaurantRanking.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <div className="text-4xl mb-2">📊</div>
              <div>Aucune donnée d'analytics disponible</div>
              <div className="text-sm mt-2">Les données apparaîtront une fois que les clients commenceront à consulter les menus</div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {data.summary.mostActiveToday && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">🔥 Plus actif aujourd'hui</h3>
            <p className="text-green-700">
              <strong>{data.summary.mostActiveToday.name}</strong> est le restaurant le plus consulté aujourd'hui !
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
} 