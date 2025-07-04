'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

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
      
      // Récupérer les vraies données du restaurant et analytics
      let realTotalViews = 0;
      let restaurantData = {
        name: 'Bella Vita',
        address: '123 Rue de la Paix, 75001 Paris',
        shortDescription: 'Restaurant italien authentique'
      };

      try {
        // Récupérer les analytics
        const analyticsResponse = await fetch('/api/analytics/stats?restaurantId=restaurant-bella-vita-1');
        const analyticsResult = await analyticsResponse.json();
        realTotalViews = analyticsResult.success ? analyticsResult.data.general.totalViews : 0;
        console.log('🔍 Vraies données analytics:', realTotalViews, 'vues');

        // Récupérer les données du restaurant
        const restaurantResponse = await fetch('/api/admin/restaurants/bella-vita-uuid');
        const restaurantResult = await restaurantResponse.json();
        if (restaurantResult.success && restaurantResult.restaurant) {
          restaurantData = {
            name: restaurantResult.restaurant.name || 'Bella Vita',
            address: restaurantResult.restaurant.address || '123 Rue de la Paix, 75001 Paris',
            shortDescription: restaurantResult.restaurant.shortDescription || 'Restaurant italien authentique'
          };
          console.log('🔍 Vraies données restaurant:', restaurantData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }

      const mockRestaurants: Restaurant[] = [
        {
          id: 'bella-vita-uuid',
          name: restaurantData.name,
          slug: 'bella-vita',
          address: restaurantData.address,
          rating: 4.8,
          logoUrl: '/logos/bella-vita.png',
          shortDescription: restaurantData.shortDescription,
          subscriptionStatus: 'active',
          subscriptionPlan: 'premium',
          createdAt: '2024-01-15T10:00:00Z',
          modelsCount: 5,
          totalViews: realTotalViews
        }
      ];

      const mockStats: GlobalStats = {
        totalRestaurants: mockRestaurants.length,
        totalModels: mockRestaurants.reduce((acc, r) => acc + r.modelsCount, 0),
        totalViews: realTotalViews,
        totalStorage: 45.2, // Ajusté pour un seul restaurant
        activeSubscriptions: mockRestaurants.filter(r => r.subscriptionStatus === 'active').length,
        monthlyRevenue: 890 // Ajusté pour un seul restaurant
      };

      setRestaurants(mockRestaurants);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Fonction pour remettre à zéro les analytics d'un restaurant
  const handleResetAnalytics = async (restaurantId: string, restaurantName: string) => {
    // Demander confirmation
    const confirmed = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir remettre à zéro les analytics de "${restaurantName}" ?\n\n` +
      `Cette action va :\n` +
      `• Supprimer toutes les vues existantes\n` +
      `• Supprimer toutes les sessions\n` +
      `• Remettre les compteurs à ZÉRO (0 vues)\n\n` +
      `Les nouvelles visites du menu seront comptabilisées à partir de zéro.\n\n` +
      `Cette action est IRRÉVERSIBLE !`
    );
    
    if (!confirmed) return;

    try {
      setResetLoading(prev => ({ ...prev, [restaurantId]: true }));
      
      // Mapper l'ID du restaurant vers l'ID analytics
      const restaurantIdMapping: Record<string, string> = {
        'bella-vita-uuid': 'restaurant-bella-vita-1'
      };
      
      const analyticsRestaurantId = restaurantIdMapping[restaurantId] || restaurantId;
      
      const response = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: analyticsRestaurantId,
          resetToZero: true // Vraiment remettre à zéro (0 vues)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const shouldViewAnalytics = window.confirm(
          `✅ Analytics remis à zéro pour "${restaurantName}" !\n\n` +
          `• ${data.data.viewsRemoved} vues supprimées\n` +
          `• ${data.data.sessionsRemoved} sessions supprimées\n` +
          `• Les analytics sont maintenant à 0 vues\n` +
          `• Les nouvelles visites du menu seront comptabilisées\n\n` +
          `Voulez-vous voir la page Analytics pour vérifier ?`
        );
        
        if (shouldViewAnalytics) {
          // Mapper l'ID restaurant vers le slug
          const restaurantSlugMapping: Record<string, string> = {
            'bella-vita-uuid': 'bella-vita'
          };
          
          const restaurantSlug = restaurantSlugMapping[restaurantId] || 'bella-vita';
          window.open(`/insights?restaurant=${restaurantSlug}`, '_blank');
        }
      } else {
        throw new Error(data.error || 'Erreur lors du reset');
      }
    } catch (error) {
      console.error('Erreur lors du reset des analytics:', error);
      alert(
        `❌ Erreur lors du reset des analytics de "${restaurantName}"\n\n` +
        `${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setResetLoading(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  // Filtrer les restaurants
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'basic': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      {/* Header Admin */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-cream/90 border-b border-navy-100 shadow-sm" style={{ backgroundColor: 'rgba(251, 250, 245, 0.9)', borderColor: '#c9d0db' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo et branding */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.25)' }}>
                  <span className="text-white font-bold text-xl lg:text-2xl">👑</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl lg:text-3xl font-serif text-navy" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>
                  Admin Cobi
                </h1>
                <p className="text-base font-medium" style={{ color: '#1f2d3d' }}>Gestion Globale</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/admin/users" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d' }}
              >
                <span>👥</span>
                <span>Utilisateurs</span>
              </Link>
              <Link 
                href="/admin/settings" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d' }}
              >
                <span>⚙️</span>
                <span>Paramètres</span>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium hover:bg-navy-50"
                style={{ color: '#1f2d3d', backgroundColor: '#e9ecf1' }}
              >
                <span>🚪</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-12">
          {/* Hero Section Admin */}
          <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 shadow-2xl" style={{ 
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #312e81 100%)',
            boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)'
          }}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative">
              <div className="text-white">
                <div className="inline-flex items-center space-x-2 rounded-full px-4 py-2 mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">Administration Active</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 leading-tight font-bold" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>
                  👑 Tableau de Bord Admin
                </h2>
                
                <p className="text-xl lg:text-2xl mb-8 leading-relaxed font-medium">
                  Gérez l'ensemble des restaurants, utilisateurs et abonnements de la plateforme Cobi.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-2">
                      <span>🏪</span>
                      <span className="text-base font-semibold">{stats.totalRestaurants} Restaurants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>💰</span>
                      <span className="text-base font-semibold">{stats.monthlyRevenue}€/mois</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques Globales */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            {/* Total Restaurants */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #1f2d3d 0%, #22354a 100%)',
                  boxShadow: '0 10px 15px -3px rgba(31, 45, 61, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">🏪</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>{stats.totalRestaurants}</p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Restaurants</p>
                </div>
              </div>
            </div>

            {/* Total Modèles */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">📦</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>{stats.totalModels}</p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Modèles 3D</p>
                </div>
              </div>
            </div>

            {/* Total Vues */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">👁️</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>
                    {stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Vues Totales</p>
                </div>
              </div>
            </div>

            {/* Stockage */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">💾</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>
                    {stats.totalStorage}
                  </p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Mo Stockées</p>
                </div>
              </div>
            </div>

            {/* Abonnements Actifs */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">✅</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>{stats.activeSubscriptions}</p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Actifs</p>
                </div>
              </div>
            </div>

            {/* Revenus Mensuels */}
            <div className="rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.25)'
                }}>
                  <span className="text-2xl lg:text-3xl">💰</span>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#1f2d3d' }}>{stats.monthlyRevenue}€</p>
                  <p className="text-base lg:text-lg font-semibold" style={{ color: '#1f2d3d' }}>Revenus/mois</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gestion des Restaurants */}
          <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#1f2d3d' }}>
                  🏪 Gestion des Restaurants
                </h3>
                <p className="text-lg" style={{ color: '#1f2d3d' }}>
                  {filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''} affiché{filteredRestaurants.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Recherche */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un restaurant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px]"
                    style={{
                      backgroundColor: '#f8f7f2',
                      borderColor: '#c9d0db',
                      color: '#1f2d3d'
                    }}
                  />
                  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filtre par statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: '#f8f7f2',
                    borderColor: '#c9d0db',
                    color: '#1f2d3d'
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            {/* Liste des restaurants */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-2xl mb-4">⏳</div>
                <p className="text-lg" style={{ color: '#1f2d3d' }}>Chargement des restaurants...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="border rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: '#f8f7f2', borderColor: '#c9d0db' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#1f2d3d' }}>
                          <span className="text-white font-bold">🍽️</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold" style={{ color: '#1f2d3d' }}>{restaurant.name}</h4>
                          <p className="text-sm" style={{ color: '#6b7280' }}>{restaurant.address}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(restaurant.subscriptionStatus)}`}>
                        {restaurant.subscriptionStatus}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: '#1f2d3d' }}>Plan:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanColor(restaurant.subscriptionPlan)}`}>
                          {restaurant.subscriptionPlan}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: '#1f2d3d' }}>Modèles:</span>
                        <span className="text-sm font-semibold" style={{ color: '#1f2d3d' }}>{restaurant.modelsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: '#1f2d3d' }}>Vues:</span>
                        <span className="text-sm font-semibold" style={{ color: '#1f2d3d' }}>{restaurant.totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: '#1f2d3d' }}>Note:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold" style={{ color: '#1f2d3d' }}>{restaurant.rating}</span>
                          <span className="text-yellow-500">⭐</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/menu/${restaurant.slug}`}
                          target="_blank"
                          className="flex-1 px-3 py-2 text-center rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: '#1f2d3d', color: '#fbfaf5' }}
                        >
                          Voir Menu
                        </Link>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: '#e9ecf1', color: '#1f2d3d' }}
                        >
                          Gérer
                        </Link>
                      </div>
                      
                      {/* Bouton Reset Analytics */}
                      <button
                        onClick={() => handleResetAnalytics(restaurant.id, restaurant.name)}
                        disabled={resetLoading[restaurant.id]}
                        className="w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#f97316', color: '#ffffff' }}
                      >
                        {resetLoading[restaurant.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Reset...</span>
                          </>
                        ) : (
                          <>
                            <span>🗑️</span>
                            <span>Reset Analytics</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/users" className="p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.25)'
                }}>
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: '#1f2d3d' }}>Gestion Utilisateurs</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>Créer, modifier et gérer les comptes</p>
              </div>
            </Link>

            <Link href="/admin/cleanup" className="p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.25)'
                }}>
                  <span className="text-2xl">🗑️</span>
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: '#1f2d3d' }}>Nettoyage Modèles</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>Supprimer les modèles défaillants</p>
              </div>
            </Link>

            <Link href="/admin/settings" className="p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  boxShadow: '0 10px 15px -3px rgba(107, 114, 128, 0.25)'
                }}>
                  <span className="text-2xl">⚙️</span>
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: '#1f2d3d' }}>Paramètres</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>Configuration de la plateforme</p>
              </div>
            </Link>

            <Link href="/insights" className="p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 group" style={{ backgroundColor: '#fbfaf5', borderColor: '#e9ecf1' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)'
                }}>
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-bold mb-2" style={{ color: '#1f2d3d' }}>Analytics Global</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>Statistiques détaillées</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Admin */}
      <footer className="border-t" style={{ borderColor: '#c9d0db', backgroundColor: 'rgba(251, 250, 245, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ 
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.25)'
              }}>
                <span className="font-bold text-lg text-white">👑</span>
              </div>
              <span className="text-2xl font-serif font-bold" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: '#1f2d3d' }}>Admin Cobi</span>
            </div>
            <p className="text-base font-medium" style={{ color: '#1f2d3d' }}>
              Administration Globale • Plateforme Cobi © 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 