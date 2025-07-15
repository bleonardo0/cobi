'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  logoUrl?: string;
  shortDescription?: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  subscriptionPlan: 'basic' | 'premium';
  createdAt: string;
  modelsCount: number;
  totalViews: number;
}

interface GlobalStats {
  totalRestaurants: number;
  totalModels: number;
  totalViews: number;
  totalStorage: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalRestaurants: 0,
    totalModels: 0,
    totalViews: 0,
    totalStorage: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [resetLoading, setResetLoading] = useState<Record<string, boolean>>({});

  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Vérifier l'authentification
  useEffect(() => {
    // Ne pas rediriger si l'auth est en cours de chargement
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/restaurant/dashboard');
      return;
    }
  }, [user, router, authLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer TOUS les restaurants depuis l'API
      const restaurantsResponse = await fetch('/api/admin/restaurants');
      const restaurantsData = await restaurantsResponse.json();
      
      if (!restaurantsData.success) {
        throw new Error('Erreur lors de la récupération des restaurants');
      }

      const allRestaurants = restaurantsData.restaurants || [];
      console.log('🔍 Restaurants récupérés depuis l\'API:', allRestaurants.length);

      // Calculer les vraies statistiques
      let totalViews = 0;
      let totalModels = 0;

      // Pour chaque restaurant, récupérer ses stats
      const restaurantsWithStats = await Promise.all(
        allRestaurants.map(async (restaurant: any) => {
          let restaurantViews = 0;
          let restaurantModels = 5; // Mock temporaire

          try {
            // Récupérer les analytics pour ce restaurant
            const analyticsResponse = await fetch(`/api/analytics/stats?restaurantId=${restaurant.id}`);
            const analyticsResult = await analyticsResponse.json();
            if (analyticsResult.success) {
              restaurantViews = analyticsResult.data.general.totalViews || 0;
            }
          } catch (error) {
            console.error(`Erreur analytics pour ${restaurant.name}:`, error);
          }

          totalViews += restaurantViews;
          totalModels += restaurantModels;

          return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            address: restaurant.address,
            rating: restaurant.rating || 4.5,
            logoUrl: restaurant.logoUrl,
            shortDescription: restaurant.shortDescription,
            subscriptionStatus: restaurant.subscriptionStatus,
            subscriptionPlan: restaurant.subscriptionPlan,
            createdAt: restaurant.createdAt,
            modelsCount: restaurantModels,
            totalViews: restaurantViews
          };
        })
      );

      setRestaurants(restaurantsWithStats);
      
      // Calculer les stats globales
      const activeSubscriptions = restaurantsWithStats.filter(r => r.subscriptionStatus === 'active').length;
      const monthlyRevenue = activeSubscriptions * 29; // 29€/mois par restaurant

      setStats({
        totalRestaurants: restaurantsWithStats.length,
        totalModels: totalModels,
        totalViews: totalViews,
        totalStorage: totalModels * 50, // 50MB par modèle en moyenne
        activeSubscriptions: activeSubscriptions,
        monthlyRevenue: monthlyRevenue
      });

      console.log('✅ Données admin chargées:', {
        restaurants: restaurantsWithStats.length,
        totalViews,
        totalModels,
        activeSubscriptions
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetRestaurantAnalytics = async (restaurantId: string) => {
    setResetLoading(prev => ({ ...prev, [restaurantId]: true }));
    try {
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId }),
      });

      if (response.ok) {
        console.log('✅ Analytics réinitialisées pour le restaurant:', restaurantId);
        // Rafraîchir les données
        await fetchAdminData();
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    } finally {
      setResetLoading(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  if (authLoading || !user) {
    return null;
  }

  const topBarActions = (
    <div className="flex items-center space-x-3">
      <Link 
        href="/admin/restaurants/add"
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Nouveau restaurant</span>
      </Link>
      <Link 
        href="/admin/settings"
        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Paramètres</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout
      userRole="admin"
      userName="Admin"
      onLogout={handleLogout}
      topBarActions={topBarActions}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatsCard
            title="Restaurants"
            value={stats.totalRestaurants}
            emoji="🏪"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v7" />
              </svg>
            }
            color="blue"
            loading={isLoading}
          />
          <StatsCard
            title="Modèles 3D"
            value={stats.totalModels}
            emoji="🍽️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="green"
            loading={isLoading}
          />
          <StatsCard
            title="Vues totales"
            value={stats.totalViews}
            emoji="👁️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="purple"
            loading={isLoading}
          />
          <StatsCard
            title="Stockage"
            value={`${stats.totalStorage}MB`}
            emoji="💾"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            }
            color="orange"
            loading={isLoading}
          />
          <StatsCard
            title="Abonnements actifs"
            value={stats.activeSubscriptions}
            emoji="✅"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            color="teal"
            loading={isLoading}
          />
          <StatsCard
            title="Revenus mensuels"
            value={`${stats.monthlyRevenue}€`}
            emoji="💰"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="green"
            loading={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
              <p className="text-sm text-gray-500">
                {filteredRestaurants.length} sur {restaurants.length} restaurants
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un restaurant..."
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Restaurants List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              🏪 Restaurants
            </h3>
            <span className="text-sm text-gray-500">
              {filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des restaurants...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🍽️</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{restaurant.name}</h4>
                        <p className="text-sm text-gray-500">{restaurant.address}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(restaurant.subscriptionStatus)}`}>
                      {restaurant.subscriptionStatus}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Modèles</span>
                      <span className="font-medium">{restaurant.modelsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Vues</span>
                      <span className="font-medium">{restaurant.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-medium capitalize">{restaurant.subscriptionPlan}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/menu/${restaurant.slug}`}
                        target="_blank"
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Menu
                      </Link>
                      <Link
                        href={`/admin/restaurants/${restaurant.id}`}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                      >
                        Gérer
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => resetRestaurantAnalytics(restaurant.id)}
                      disabled={resetLoading[restaurant.id]}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {resetLoading[restaurant.id] ? '...' : 'Reset'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 