'use client';

import { useState, useEffect } from 'react';
import POSConfigPanel from '@/components/admin/POSConfigPanel';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPOSPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pour l'instant, on utilise des données mock
    // Plus tard, ceci fera un appel API
    const mockRestaurants: Restaurant[] = [
      { id: 'bella-vita', name: 'La Bella Vita', slug: 'bella-vita' },
      { id: 'le-bistrot', name: 'Le Bistrot', slug: 'le-bistrot' },
      { id: 'chez-marco', name: 'Chez Marco', slug: 'chez-marco' }
    ];
    
    setRestaurants(mockRestaurants);
    setSelectedRestaurant(mockRestaurants[0]); // Sélectionner le premier par défaut
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration POS</h1>
          <p className="text-gray-600 mt-2">
            Gérez les systèmes de commande en ligne de vos restaurants
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Liste des restaurants */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Restaurants</h2>
              </div>
              <div className="p-2">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRestaurant?.id === restaurant.id
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-sm text-gray-500">{restaurant.slug}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  📊 Voir les statistiques
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  📋 Gérer les commandes
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  🍽️ Gérer les menus
                </button>
                <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  💰 Paramètres de prix
                </button>
              </div>
            </div>
          </div>

          {/* Main content - Configuration POS */}
          <div className="lg:col-span-3">
            {selectedRestaurant ? (
              <POSConfigPanel
                restaurantId={selectedRestaurant.id}
                restaurantName={selectedRestaurant.name}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m3 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez un restaurant
                </h3>
                <p className="text-gray-500">
                  Choisissez un restaurant dans la liste pour configurer son système POS
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Comment utiliser le système POS</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Activez le POS</strong> avec le bouton principal pour permettre les commandes</li>
                <li>• <strong>Configurez les fonctionnalités</strong> selon vos besoins (livraison, sur place, etc.)</li>
                <li>• <strong>Ajustez les paramètres</strong> comme la TVA et les frais de livraison</li>
                <li>• <strong>Testez sur le menu</strong> : visitez <code className="bg-blue-100 px-1 rounded">/menu/[restaurant-slug]</code></li>
                <li>• <strong>Désactivez</strong> à tout moment si vous ne voulez plus accepter de commandes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 