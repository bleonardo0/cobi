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
      <div className="min-h-screen gradient-bg-soft flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="animate-pulse-soft w-16 h-16 rounded-2xl mx-auto mb-6 gradient-bg"></div>
          <p className="text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  const roleInfo = ROLE_PERMISSIONS[user.role];

  return (
    <div className="min-h-screen gradient-bg-soft">
      {/* Header */}
      <header className="nav-modern glass-effect sticky top-0 z-50">
        <div className="container-modern py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link href="/" className="text-2xl sm:text-3xl font-bold flex items-center space-x-3 text-gradient">
                <span className="text-4xl sm:text-5xl">🏗️</span>
                <span>COBI</span>
              </Link>
              <div className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gradient-bg flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-base font-semibold">{user.name}</p>
                  <p className="text-sm flex items-center" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="mr-2">{roleInfo.icon}</span>
                    {roleInfo.role}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-2 sm:p-3 rounded-xl transition-all hover:bg-white/20"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Se déconnecter"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-modern section-padding">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 animate-fade-in"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gradient">
            Bonjour, {user.name.split(' ')[0]} ! 👋
          </h1>
          <p className="text-xl sm:text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
            Voici un aperçu de votre activité {roleInfo.description.toLowerCase()}.
          </p>
        </motion.div>

        {/* Quick Stats */}
        {(canPerform('analytics', 'read') || canPerform('models', 'read')) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-12 animate-scale-in"
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
                <div key={index} className="card-modern card-hover p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm sm:text-base font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl sm:text-4xl font-bold mb-2">
                        {typeof stat.value === 'number' && stat.value > 1000 
                          ? `${(stat.value / 1000).toFixed(1)}k`
                          : stat.value
                        }
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                         style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                      <span className="text-3xl sm:text-4xl">{stat.icon}</span>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 animate-slide-up"
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
                className="block card-modern card-hover p-6 sm:p-8 transition-all"
              >
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                    <span className="text-3xl sm:text-4xl">{action.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{action.title}</h3>
                    <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                      {action.description}
                    </p>
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
            className="card-modern p-6 sm:p-8 animate-fade-in"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
              🏆 Modèles les plus populaires
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {stats.topModels.slice(0, 5).map((model, index) => (
                <div key={model.id} className="flex items-center justify-between p-4 sm:p-6 rounded-xl" 
                     style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-sm sm:text-base font-bold text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}>
                      {index + 1}
                    </span>
                    <span className="text-base sm:text-lg font-semibold">{model.name}</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {model.views} vues
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State for Stats */}
        {isLoadingStats && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="card-modern p-8 sm:p-10 animate-scale-in">
              <div className="animate-pulse-soft w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-6 gradient-bg"></div>
              <p className="text-lg sm:text-xl font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
                Chargement des statistiques...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 