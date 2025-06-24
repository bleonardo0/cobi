'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { usePermissions } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/useModelHistory';
import Link from 'next/link';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [error, setError] = useState<string | null>(null);
  
  const permissions = usePermissions();
  const { createAuditLog } = useAuditLogs();

  useEffect(() => {
    if (permissions.canManageUsers) {
      fetchUsers();
    }
  }, [permissions.canManageUsers]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!inviteEmail || !permissions.currentUser) return;

    try {
      setIsInviting(true);
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'invitation');
      }

      // Log d'audit
      await createAuditLog({
        action: 'invite_user',
        resource: 'user',
        resourceId: 'new',
        resourceName: inviteEmail,
        user: permissions.currentUser,
        details: { role: inviteRole }
      });

      setInviteEmail('');
      setInviteRole('viewer');
      await fetchUsers();
      
    } catch (error) {
      console.error('Error inviting user:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    if (!permissions.currentUser) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du rôle');
      }

      const user = users.find(u => u.id === userId);
      if (user) {
        await createAuditLog({
          action: 'change_role',
          resource: 'user',
          resourceId: userId,
          resourceName: user.email,
          user: permissions.currentUser,
          details: { oldRole: user.role, newRole }
        });
      }

      await fetchUsers();
      
    } catch (error) {
      console.error('Error changing user role:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!permissions.currentUser) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du statut');
      }

      const user = users.find(u => u.id === userId);
      if (user) {
        await createAuditLog({
          action: isActive ? 'create' : 'delete',
          resource: 'user',
          resourceId: userId,
          resourceName: user.email,
          user: permissions.currentUser,
          details: { action: isActive ? 'activated' : 'deactivated' }
        });
      }

      await fetchUsers();
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification');
    }
  };

  if (!permissions.canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-6V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4h.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions pour accéder à cette page.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="text-gray-600 mt-1">
                Gérez les rôles et permissions de votre équipe
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href="/admin/audit"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                📝 Logs d'audit
              </Link>
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
        {/* Invitation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inviter un nouvel utilisateur</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                  <option key={role} value={role}>
                    {info.icon} {info.description}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={inviteUser}
              disabled={!inviteEmail || isInviting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isInviting ? 'Envoi...' : '📧 Inviter'}
            </button>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Utilisateurs ({users.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const roleInfo = ROLE_PERMISSIONS[user.role];
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                            disabled={user.id === permissions.currentUser?.id} // Cannot change own role
                            className={`text-sm rounded-full px-3 py-1 border ${
                              roleInfo.color === 'red' ? 'border-red-200 text-red-800 bg-red-100' :
                              roleInfo.color === 'blue' ? 'border-blue-200 text-blue-800 bg-blue-100' :
                              roleInfo.color === 'green' ? 'border-green-200 text-green-800 bg-green-100' :
                              'border-gray-200 text-gray-800 bg-gray-100'
                            } disabled:opacity-50`}
                          >
                            {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                              <option key={role} value={role}>
                                {info.icon} {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserStatus(user.id, !user.isActive)}
                            disabled={user.id === permissions.currentUser?.id} // Cannot deactivate own account
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            } disabled:opacity-50`}
                          >
                            {user.isActive ? '✓ Actif' : '✗ Inactif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {/* TODO: Voir l'historique de l'utilisateur */}}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              📊 Historique
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Role Permissions Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions par rôle</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
              <div key={role} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{info.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{role}</h4>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {info.permissions.map((perm, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {perm.resource}: {perm.action}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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