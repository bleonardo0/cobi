'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Model3D } from "@/types/model";
import { getAllModels } from "@/lib/models";
import { useRestaurantId } from "@/hooks/useRestaurantId";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";

interface ModelStats {
  id: string;
  name: string;
  views: number;
  avgDuration: number;
  popularityScore: number;
  category?: string;
  thumbnailUrl?: string;
}

interface AnalyticsData {
  general: {
    totalViews: number;
    avgDuration: number;
    uniqueSessions: number;
    deviceBreakdown: Record<string, number>;
  };
  models: ModelStats[];
  viewsByDay: { date: string; views: number }[];
  waouhModels: ModelStats[];
  topModel: ModelStats | null;
  lastUpdated: string;
}

export default function InsightsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const { user } = useAuth();
  
  // Utiliser directement le restaurant de l'utilisateur connecté
  const restaurantId = user?.restaurantId;

  useEffect(() => {
    if (restaurantId && user) {
      fetchAnalyticsData();
      fetchRestaurantName();
    }
  }, [restaurantId, user]);

  const fetchRestaurantName = async () => {
    try {
      if (!restaurantId) return;
      
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.restaurant) {
          setRestaurantName(data.restaurant.name || '');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nom du restaurant:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      if (!analyticsData) {
        setIsLoading(true);
      }
      
      if (!restaurantId) {
        console.warn('⚠️ Aucun restaurant ID disponible');
        return;
      }
      
      console.log('🔄 Rechargement des analytics pour restaurant ID:', restaurantId);
      
      const response = await fetch(`/api/analytics/stats?restaurantId=${restaurantId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des analytics');
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
        setLastRefresh(new Date().toLocaleTimeString('fr-FR'));
        console.log('📊 Analytics rechargés:', data.data.general);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analyticsData) {
    return (
      <DashboardLayout userRole="restaurateur">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement des statistiques...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { general, models: modelStats, viewsByDay, waouhModels, topModel } = analyticsData;

  return (
    <DashboardLayout 
      userRole="restaurateur"
      restaurantName={restaurantName || undefined}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Statistiques Analytics</h1>
              <p className="text-indigo-100 text-lg">
                Analysez les performances de votre menu 3D 👋
              </p>
              {lastRefresh && (
                <p className="text-indigo-200 text-sm mt-2">
                  🔄 Dernière mise à jour : {lastRefresh}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/restaurant/dashboard"
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
              <button
                onClick={fetchAnalyticsData}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </button>
            </div>
          </div>
          
          {/* Filtres de temps */}
          <div className="mt-6 flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Vues totales"
            value={general.totalViews.toLocaleString()}
            emoji="👁️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="blue"
          />
          <StatsCard
            title="Durée moy. d'exploration"
            value={`${general.avgDuration}s`}
            emoji="⏱️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatsCard
            title="Plat le plus populaire"
            value={topModel?.name || 'N/A'}
            emoji="🏆"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            color="orange"
          />
          <StatsCard
            title="Modèles actifs"
            value={modelStats.length.toString()}
            emoji="🍽️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique des vues par jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Vues par jour (7 derniers jours)</h3>
            <div className="space-y-4">
              {viewsByDay.map((day, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-slate-600">{day.date}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-100 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.views / Math.max(...viewsByDay.map(d => d.views))) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="w-8 text-sm font-bold text-slate-800">{day.views}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Répartition par appareil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6">Répartition par appareil</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                  <span className="text-slate-700 font-medium">📱 Mobile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${general.deviceBreakdown.mobile || 0}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 w-12">{general.deviceBreakdown.mobile || 0}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700 font-medium">📱 Tablette</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${general.deviceBreakdown.tablet || 0}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 w-12">{general.deviceBreakdown.tablet || 0}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-700 font-medium">💻 Desktop</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${general.deviceBreakdown.desktop || 0}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 w-12">{general.deviceBreakdown.desktop || 0}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top des modèles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h3 className="text-xl font-bold text-slate-800">🏆 Top des plats les plus explorés</h3>
            <p className="text-slate-600 mt-1">Classement basé sur les vues et la durée d'exploration</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rang</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Plat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Vues</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durée moy.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {modelStats.slice(0, 10).map((stat, index) => (
                  <motion.tr 
                    key={stat.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-slate-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-slate-800 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        {stat.thumbnailUrl ? (
                          <img
                            src={stat.thumbnailUrl}
                            alt={stat.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center border-2 border-slate-200">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-800">{stat.name}</div>
                          {stat.category && (
                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">
                              {stat.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800 bg-indigo-50 px-3 py-1 rounded-full">
                        {stat.views}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800 bg-emerald-50 px-3 py-1 rounded-full">
                        {stat.avgDuration}s
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-slate-800 w-8">{stat.popularityScore}</span>
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${stat.popularityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Détection des plats "Waouh" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border border-amber-200"
        >
          <div className="flex items-start space-x-4">
            <div className="text-4xl">🤩</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Plats "Waouh" détectés</h3>
              <p className="text-slate-700 mb-6 text-lg">
                Ces plats captent particulièrement l'attention avec une durée d'exploration supérieure à 30 secondes :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelStats
                  .filter(stat => stat.avgDuration > 30)
                  .slice(0, 3)
                  .map((stat, index) => (
                    <motion.div 
                      key={stat.id} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl p-4 border border-amber-200 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {stat.thumbnailUrl ? (
                          <img
                            src={stat.thumbnailUrl}
                            alt={stat.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-amber-200"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center border-2 border-amber-200">
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{stat.name}</div>
                          <div className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block mt-1">
                            ⏱️ {stat.avgDuration}s d'exploration
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 