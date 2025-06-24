'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuditLog, formatAuditMessage, getActionIcon, getActionColor } from '@/types/history';
import { usePermissions } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/useModelHistory';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const permissions = usePermissions();
  const { fetchLogs } = useAuditLogs();

  useEffect(() => {
    if (permissions.canViewAnalytics) {
      loadLogs();
    }
  }, [permissions.canViewAnalytics, filters]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      await fetchLogs({
        limit: 100,
        action: filters.action || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
    } catch (error) {
      console.error('Error loading logs:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        log.resourceName.toLowerCase().includes(searchTerm) ||
        log.userName.toLowerCase().includes(searchTerm) ||
        log.userEmail.toLowerCase().includes(searchTerm) ||
        formatAuditMessage(log).toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  if (!permissions.canViewAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-6V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4h.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions pour accéder aux logs d'audit.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Logs d'audit</h1>
              <p className="text-gray-600 mt-1">
                Historique des actions effectuées sur la plateforme
              </p>
            </div>
            
            <div className="flex space-x-3">
              {permissions.canManageUsers && (
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  👥 Utilisateurs
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                placeholder="Nom, email, ressource..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="restore">Restauration</option>
                <option value="upload">Upload</option>
                <option value="view">Consultation</option>
                <option value="login">Connexion</option>
                <option value="invite_user">Invitation</option>
                <option value="change_role">Changement de rôle</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredLogs.length} résultat{filteredLogs.length > 1 ? 's' : ''} 
              {filters.search || filters.action || filters.dateFrom || filters.dateTo ? ' (filtrés)' : ''}
            </span>
            
            <button
              onClick={() => setFilters({
                action: '',
                resource: '',
                userId: '',
                dateFrom: '',
                dateTo: '',
                search: ''
              })}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🗑️ Effacer les filtres
            </button>
          </div>
        </motion.div>

        {/* Logs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historique des actions
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement des logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">Aucun log trouvé</p>
              {(filters.search || filters.action || filters.dateFrom || filters.dateTo) && (
                <p className="text-gray-500 text-sm mt-2">
                  Essayez de modifier vos filtres
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Action Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      log.action === 'delete' || log.action === 'remove_user' ? 'bg-red-100' :
                      log.action === 'create' || log.action === 'upload' || log.action === 'invite_user' ? 'bg-green-100' :
                      log.action === 'update' || log.action === 'restore' || log.action === 'change_role' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <span className="text-lg">
                        {getActionIcon(log.action)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${getActionColor(log.action)}`}>
                          {formatAuditMessage(log)}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <details className="cursor-pointer">
                            <summary className="font-medium">Détails</summary>
                            <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>👤 {log.userName}</span>
                        <span>📧 {log.userEmail}</span>
                        <span>🔗 {log.resource}</span>
                        {log.ipAddress && (
                          <span>🌐 {log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total des logs', value: logs.length, icon: '📊', color: 'blue' },
            { label: 'Logs filtrés', value: filteredLogs.length, icon: '🔍', color: 'green' },
            { label: 'Actions aujourd\'hui', value: logs.filter(log => 
              new Date(log.timestamp).toDateString() === new Date().toDateString()
            ).length, icon: '📅', color: 'purple' },
            { label: 'Utilisateurs actifs', value: new Set(logs.map(log => log.userId)).size, icon: '👥', color: 'orange' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
} 