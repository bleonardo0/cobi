'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AdminCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  status?: 'active' | 'beta' | 'new';
  stats?: {
    label: string;
    value: string | number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalModels: 0,
    totalViews: 0,
    activeRestaurants: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // Charger les statistiques générales
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Remplacer par de vrais appels API
      // Pour l'instant, données mock
      setStats({
        totalModels: 42,
        totalViews: 1337,
        activeRestaurants: 3,
        totalUsers: 15
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const adminCards: AdminCard[] = [
    {
      id: 'pos',
      title: 'Système POS',
      description: 'Gérer les commandes en ligne et les configurations de restaurants',
      icon: '📱',
      href: '/admin/pos',
      color: 'from-teal-500 to-teal-600',
      status: 'new',
      stats: {
        label: 'Restaurants actifs',
        value: stats.activeRestaurants
      }
    },

    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Statistiques de vues et analyses comportementales',
      icon: '📊',
      href: '/insights',
      color: 'from-purple-500 to-purple-600',
      stats: {
        label: 'Vues totales',
        value: stats.totalViews
      }
    },
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      description: 'Administration des comptes et permissions',
      icon: '👥',
      href: '/admin/users',
      color: 'from-green-500 to-green-600',
      stats: {
        label: 'Utilisateurs',
        value: stats.totalUsers
      }
    },
    {
      id: 'audit',
      title: 'Audit & Logs',
      description: 'Historique des actions et logs système',
      icon: '🔍',
      href: '/admin/audit',
      color: 'from-orange-500 to-orange-600',
      status: 'beta'
    },
    {
      id: 'thumbnails',
      title: 'Gestion des miniatures',
      description: 'Génération et optimisation des thumbnails',
      icon: '🖼️',
      href: '/admin/thumbnails',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'cleanup',
      title: 'Nettoyage système',
      description: 'Suppression des fichiers orphelins et optimisation',
      icon: '🧹',
      href: '/admin/cleanup',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'settings',
      title: 'Paramètres globaux',
      description: 'Configuration générale de l\'application',
      icon: '⚙️',
      href: '/admin/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const quickActions = [
    {
      label: 'Nouveau modèle',
      href: '/upload',
      icon: '➕',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Voir les stats',
      href: '/insights',
      icon: '📈',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Config POS',
      href: '/admin/pos',
      icon: '🛒',
      color: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      label: 'Nettoyage',
      href: '/admin/cleanup',
      icon: '🧹',
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600 mt-2">
                Tableau de bord centralisé pour la gestion de COBI
              </p>
            </div>
            
            {/* Actions rapides */}
            <div className="flex space-x-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${action.color} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
                  >
                    <span>{action.icon}</span>
                    <span className="hidden sm:inline">{action.label}</span>
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modèles 3D</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModels}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-lg">
                <span className="text-2xl">🏪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRestaurants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des modules d'administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Header avec gradient */}
                  <div className={`bg-gradient-to-r ${card.color} p-6 text-white relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{card.icon}</span>
                      {card.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          card.status === 'new' ? 'bg-green-500' :
                          card.status === 'beta' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {card.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mt-4 group-hover:scale-105 transition-transform">
                      {card.title}
                    </h3>
                    
                    {card.stats && (
                      <div className="mt-2 opacity-90">
                        <span className="text-sm">{card.stats.label}: </span>
                        <span className="font-bold">{card.stats.value}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                    
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                      <span>Accéder</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Section d'aide */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">💡</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Guide d'administration
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• <strong>Système POS</strong> : Configurez les commandes en ligne pour vos restaurants</p>
                <p>• <strong>Gestion des modèles</strong> : Uploadez et organisez vos modèles 3D</p>
                <p>• <strong>Analytics</strong> : Suivez les performances et l'engagement des utilisateurs</p>
                <p>• <strong>Nettoyage</strong> : Maintenez votre système propre et optimisé</p>
              </div>
              <div className="mt-4">
                <Link 
                  href="/docs" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir la documentation complète
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec informations système */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>COBI Administration Panel • Version 1.0.0</p>
          <p className="mt-1">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
} 