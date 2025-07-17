'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/ClerkAuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';

interface UnassignedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function AssignUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [unassignedUsers, setUnassignedUsers] = useState<UnassignedUser[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, isLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Réinitialiser l'erreur
      const response = await fetch('/api/admin/assign-restaurant');
      const data = await response.json();

      if (response.ok) {
        setUnassignedUsers(data.unassignedUsers);
        setRestaurants(data.restaurants);
      } else {
        console.error('Error fetching data:', data.error);
        // Stocker l'erreur pour l'affichage
        setError(data.error || 'Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRestaurant = async (userEmail: string, restaurantId: string) => {
    try {
      setAssigning(userEmail);
      
      const response = await fetch('/api/admin/assign-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          restaurantId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Supprimer l'utilisateur de la liste des non-assignés
        setUnassignedUsers(prev => prev.filter(u => u.email !== userEmail));
        
        // Afficher un message de succès
        alert(`Utilisateur ${userEmail} assigné avec succès à ${data.restaurant.name}`);
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Error assigning restaurant:', error);
      alert('Erreur lors de l\'assignation');
    } finally {
      setAssigning(null);
    }
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout userRole={user?.role || 'admin'}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Assigner des restaurants aux utilisateurs
          </h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 font-medium">Erreur lors du chargement des utilisateurs</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            {error.includes('Unauthorized') || error.includes('Admin access required') ? (
              <div className="mt-4">
                <p className="text-red-600 text-sm mb-2">
                  Il semble que votre compte admin ne soit pas synchronisé avec la base de données.
                </p>
                <Link
                  href="/admin/sync-admin"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Synchroniser le compte admin
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Fermer
              </button>
            )}
          </div>
        )}

        {unassignedUsers.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-1">
              Tous les utilisateurs ont un restaurant assigné
            </h3>
            <p className="text-green-700">
              Aucun utilisateur en attente d'assignation.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {unassignedUsers.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        disabled={assigning === user.email}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignRestaurant(user.email, e.target.value);
                          }
                        }}
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Choisir un restaurant...</option>
                        {restaurants.map((restaurant) => (
                          <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </option>
                        ))}
                      </select>
                      {assigning === user.email && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Instructions :</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Les nouveaux utilisateurs apparaissent automatiquement ici après leur inscription</li>
            <li>• Sélectionnez un restaurant dans la liste déroulante pour assigner l'utilisateur</li>
            <li>• Une fois assigné, l'utilisateur peut accéder au dashboard de son restaurant</li>
            <li>• Cliquez sur "Actualiser" pour voir les nouveaux utilisateurs</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
} 