'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalModels: number;
  totalViews: number;
  totalUsers: number;
  modelsThisMonth: number;
  viewsThisMonth: number;
  topModels: Array<{
    id: string;
    name: string;
    views: number;
    thumbnail?: string;
  }>;
}

export default function DashboardPage() {
  const { user, isLoading, logout, canPerform, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Simuler des données pour la démonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        totalModels: hasRole(['owner', 'manager']) ? 247 : 15,
        totalViews: hasRole(['owner', 'manager']) ? 12850 : 1240,
        totalUsers: hasRole(['owner', 'manager']) ? 8 : 1,
        modelsThisMonth: hasRole(['owner', 'manager']) ? 23 : 3,
        viewsThisMonth: hasRole(['owner', 'manager']) ? 3420 : 340,
        topModels: [
          { id: '1', name: 'Pizza Margherita', views: 1250, thumbnail: undefined },
          { id: '2', name: 'Burger Classic', views: 980, thumbnail: undefined },
          { id: '3', name: 'Salade César', views: 756, thumbnail: undefined },
          { id: '4', name: 'Pasta Carbonara', views: 643, thumbnail: undefined },
          { id: '5', name: 'Tiramisu', views: 521, thumbnail: undefined },
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  const roleInfo = ROLE_PERMISSIONS[user.role];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span className="text-3xl">🏗️</span>
                <span>COBI</span>
              </Link>
              <div className="text-sm text-gray-600">
                Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className="mr-1">{roleInfo.icon}</span>
                    {roleInfo.role}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Se déconnecter"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour, {user.name.split(' ')[0]} ! 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre activité {roleInfo.description.toLowerCase()}.
          </p>
        </motion.div>

        {/* Quick Stats */}
        {(canPerform('analytics', 'read') || canPerform('models', 'read')) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              {
                label: 'Modèles 3D',
                value: stats?.totalModels || 0,
                change: `+${stats?.modelsThisMonth || 0} ce mois`,
                icon: '🎯',
                color: 'blue',
                show: canPerform('models', 'read')
              },
              {
                label: 'Vues totales',
                value: stats?.totalViews || 0,
                change: `+${stats?.viewsThisMonth || 0} ce mois`,
                icon: '👁️',
                color: 'green',
                show: canPerform('analytics', 'read')
              },
              {
                label: 'Utilisateurs',
                value: stats?.totalUsers || 0,
                change: hasRole(['owner', 'manager']) ? 'Équipe active' : 'Votre compte',
                icon: '👥',
                color: 'purple',
                show: hasRole(['owner', 'manager'])
              },
              {
                label: 'Performance',
                value: '95%',
                change: 'Disponibilité',
                icon: '📊',
                color: 'orange',
                show: canPerform('analytics', 'read')
              },
            ]
              .filter(stat => stat.show)
              .map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {typeof stat.value === 'number' && stat.value > 1000 
                          ? `${(stat.value / 1000).toFixed(1)}k`
                          : stat.value
                        }
                      </p>
                      <p className={`text-xs mt-1 ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-orange-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-100' :
                      stat.color === 'green' ? 'bg-green-100' :
                      stat.color === 'purple' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              title: 'Gérer les modèles',
              description: 'Upload, édition et organisation',
              href: '/',
              icon: '🎯',
              color: 'blue',
              show: canPerform('models', 'read')
            },
            {
              title: 'Analytics',
              description: 'Statistiques et insights',
              href: '/insights',
              icon: '📊',
              color: 'green',
              show: canPerform('analytics', 'read')
            },
            {
              title: 'Utilisateurs',
              description: 'Gestion de l\'équipe',
              href: '/admin/users',
              icon: '👥',
              color: 'purple',
              show: canPerform('users', 'manage')
            },
            {
              title: 'Logs d\'audit',
              description: 'Historique des actions',
              href: '/admin/audit',
              icon: '📝',
              color: 'orange',
              show: canPerform('analytics', 'read')
            },
            {
              title: 'Upload',
              description: 'Ajouter un nouveau modèle',
              href: '/upload',
              icon: '📤',
              color: 'green',
              show: canPerform('models', 'create')
            },
            {
              title: 'Menu restaurant',
              description: 'Voir le menu public',
              href: '/menu/test',
              icon: '🍽️',
              color: 'blue',
              show: true
            },
          ]
            .filter(action => action.show)
            .map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    action.color === 'blue' ? 'bg-blue-100' :
                    action.color === 'green' ? 'bg-green-100' :
                    action.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
        </motion.div>

        {/* Top Models */}
        {canPerform('analytics', 'read') && stats?.topModels && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🏆 Modèles les plus populaires
            </h2>
            
            <div className="space-y-3">
              {stats.topModels.slice(0, 5).map((model, index) => (
                <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{model.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{model.views} vues</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State for Stats */}
        {isLoadingStats && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 