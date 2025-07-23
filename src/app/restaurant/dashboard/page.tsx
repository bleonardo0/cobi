'use client';

import { useState, useEffect, useCallback } from "react";
import { Model3D, ModelsResponse, FilterState } from "@/types/model";
import GalleryGrid from "@/components/GalleryGrid";
import FilterBar from "@/components/FilterBar";
import Link from "next/link";
import { motion } from "framer-motion";
import { filterModels, getFilterStats, sortModels } from "@/lib/filtering";
import { MENU_CATEGORIES } from "@/lib/constants";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useAuth } from "@/providers/ClerkAuthProvider";
import { useRouter } from "next/navigation";
import { useRestaurantId } from "@/hooks/useRestaurantId";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import { useDashboardLanguage } from "@/contexts/DashboardLanguageContext";


export default function RestaurantDashboard() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model3D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('name');
  const { t } = useDashboardLanguage();
  
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Utiliser directement le restaurant de l'utilisateur connecté
  const restaurantId = user?.restaurantId;
  const [currentRestaurantSlug, setCurrentRestaurantSlug] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  
  // Restaurer la position de scroll si l'utilisateur revient de la page d'un modèle
  useScrollPosition('gallery', true);

  // Vérifier l'authentification
  useEffect(() => {
    // Ne pas rediriger si l'auth est en cours de chargement
    if (authLoading) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (user.role !== 'restaurateur') {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, router, authLoading]);

  // Récupérer les informations du restaurant de l'utilisateur
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (restaurantId) {
        try {
          const response = await fetch(`/api/admin/restaurants/${restaurantId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.restaurant) {
              setCurrentRestaurantSlug(data.restaurant.slug);
              setRestaurantName(data.restaurant.name);
            } else {
              setRestaurantName('Restaurant');
            }
          } else {
            setRestaurantName('Restaurant');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du restaurant:', error);
          setRestaurantName('Restaurant');
        }
      } else if (user?.email) {
        // Fallback: récupérer par email si pas de restaurantId
        try {
          const response = await fetch('/api/admin/restaurants');
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.restaurants) {
              const userRestaurant = data.restaurants.find((r: any) => r.email === user.email);
              if (userRestaurant) {
                setCurrentRestaurantSlug(userRestaurant.slug);
                setRestaurantName(userRestaurant.name);
              } else {
                setRestaurantName('Restaurant');
              }
            }
          }
        } catch (error) {
          console.error('Erreur fallback email:', error);
          setRestaurantName('Restaurant');
        }
      } else {
        setRestaurantName('Restaurant');
      }
      
      setRestaurantLoading(false);
    };

    if (user) {
      fetchRestaurantInfo();
    }
  }, [restaurantId, user?.email]);

  useEffect(() => {
    if (user && restaurantId) {
      fetchModels();
    }
  }, [user, restaurantId]);

  const fetchModels = async () => {
    if (!restaurantId) {
      console.warn('❌ Aucun restaurant ID disponible pour charger les modèles');
      setModels([]);
      setFilteredModels([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Chargement des modèles pour le restaurant:', restaurantId);
      
      // Utiliser l'API qui filtre par restaurant
      const response = await fetch(`/api/models?restaurantId=${restaurantId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des modèles');
      }
      
      const data: ModelsResponse = await response.json();
      const sortedModels = sortModels(data.models || [], sortBy);
      
      console.log(`✅ ${sortedModels.length} modèles chargés pour le restaurant`);
      setModels(sortedModels);
      setFilteredModels(sortedModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = useCallback((filters: FilterState) => {
    const filtered = filterModels(models, filters);
    const sorted = sortModels(filtered, sortBy);
    setFilteredModels(sorted);
  }, [models, sortBy]);

  const handleSortChange = (newSortBy: 'name' | 'date' | 'category') => {
    setSortBy(newSortBy);
    const sorted = sortModels(filteredModels, newSortBy);
    setFilteredModels(sorted);
  };



  // État pour les métriques
  const [analytics, setAnalytics] = useState<{
    totalDishes: number;
    totalViews: number;
    mostViewedDish: { name: string; views: number } | null;
    weeklyScans: number;
  } | null>(null);

  // Slug du restaurant pour les liens
  const restaurantSlug = currentRestaurantSlug || "restaurant";

  // Fonction pour récupérer les métriques du restaurant
  const getRestaurantMetrics = async () => {
    if (!restaurantId) return null;
    
    try {
      const response = await fetch(`/api/analytics/stats?restaurantId=${restaurantId}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          totalDishes: models.length,
          totalViews: data.data.general.totalViews || 0,
          mostViewedDish: data.data.models.length > 0 ? {
            name: data.data.models[0].name,
            views: data.data.models[0].views
          } : null,
          weeklyScans: data.data.general.weeklyScans || 0
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
    }
    
    return {
      totalDishes: models.length,
      totalViews: 0,
      mostViewedDish: null,
      weeklyScans: 0
    };
  };

  // Charger les métriques analytics
  useEffect(() => {
    if (models.length > 0 && restaurantId && !restaurantLoading) {
      getRestaurantMetrics().then(setAnalytics);
    }
  }, [models, restaurantId, restaurantLoading]);

  if (authLoading || !user) {
    return null; // Authentification en cours ou redirection
  }

  const topBarActions = (
    <div className="flex items-center space-x-3">
      <Link 
        href={`/menu/${restaurantSlug}`}
        target="_blank"
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span>{t('dashboard.view.menu')}</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout
      userRole="restaurateur"
      restaurantName={restaurantName || undefined}
      restaurantSlug={restaurantSlug}

      topBarActions={topBarActions}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('dashboard.dishes.total')}
            value={models.length}
            emoji="🍽️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="blue"
            loading={isLoading}
          />
          <StatsCard
            title={t('dashboard.views.total')}
            value={analytics?.totalViews || 0}
            emoji="👁️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="green"
            loading={isLoading}
          />
          <StatsCard
            title={t('dashboard.scans.weekly')}
            value={analytics?.weeklyScans || 0}
            emoji="📊"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="purple"
            loading={isLoading}
          />
          <StatsCard
            title={t('dashboard.dish.popular')}
            value={analytics?.mostViewedDish?.name || (t('language') === 'fr' ? 'Aucun' : 'None')}
            emoji="🏆"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            color="orange"
            loading={isLoading}
          />
        </div>



        {/* Hero Section - Menu Client */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-sky-100 to-violet-100 rounded-2xl p-8 text-neutral-800 shadow-lg border border-sky-200"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-100 rounded-full px-4 py-2 mb-6 border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-800">{t('dashboard.menu.active')}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                🍽️ {restaurantName || 'Restaurant'}
              </h2>
              
              <p className="text-xl mb-6 text-neutral-600">
                {t('dashboard.menu.description')}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/menu/${restaurantSlug}`}
                  target="_blank"
                  className="inline-flex items-center space-x-2 bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>{t('dashboard.view.menu')}</span>
                </Link>
                
                <div className="flex items-center space-x-4 text-neutral-600">
                  <div className="flex items-center space-x-2">
                    <span>📱</span>
                    <span className="text-sm">Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span className="text-sm">Analytics</span>
                  </div>
                </div>
              </div>
            </div>
            

          </div>
        </motion.div>

        {/* Filters and Models */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-neutral-900">
              {models.length} {t('dashboard.dishes.available')}
            </h3>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'name' | 'date' | 'category')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">{t('language') === 'fr' ? 'Trier par nom' : 'Sort by name'}</option>
                <option value="date">{t('language') === 'fr' ? 'Trier par date' : 'Sort by date'}</option>
                <option value="category">{t('language') === 'fr' ? 'Trier par catégorie' : 'Sort by category'}</option>
              </select>
            </div>
          </div>

          <FilterBar
            onFilterChange={handleFilterChange}
            totalItems={models.length}
            filteredItems={filteredModels.length}
          />

          <GalleryGrid
            models={filteredModels}
            isLoading={isLoading}
            error={error}
            onRetry={fetchModels}
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 