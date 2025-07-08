'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RestaurantPOSConfig } from '@/types/pos';
import { usePOSConfig } from '@/hooks/usePOSConfig';

interface POSConfigPanelProps {
  restaurantId: string;
  restaurantName: string;
}

export default function POSConfigPanel({ restaurantId, restaurantName }: POSConfigPanelProps) {
  const { config, isLoading, error, togglePOS, toggleFeature, updateConfig } = usePOSConfig(restaurantId);
  const [isSaving, setIsSaving] = useState(false);

  const handleTogglePOS = async () => {
    setIsSaving(true);
    try {
      const success = await togglePOS(!config?.enabled);
      if (!success) {
        alert('Erreur lors de la mise à jour');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeature = async (feature: keyof RestaurantPOSConfig['features']) => {
    if (!config) return;
    setIsSaving(true);
    try {
      const success = await toggleFeature(feature, !config.features[feature]);
      if (!success) {
        alert('Erreur lors de la mise à jour');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<RestaurantPOSConfig['settings']>) => {
    if (!config) return;
    setIsSaving(true);
    try {
      const success = await updateConfig({
        settings: {
          ...config.settings,
          ...updates
        }
      });
      if (!success) {
        alert('Erreur lors de la mise à jour');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Erreur</h3>
          <p className="text-sm">{error || 'Configuration non trouvée'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuration POS</h2>
            <p className="text-gray-600 mt-1">{restaurantName}</p>
          </div>
          
          {/* Toggle principal */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${config.enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {config.enabled ? 'Activé' : 'Désactivé'}
            </span>
            <button
              onClick={handleTogglePOS}
              disabled={isSaving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-green-600' : 'bg-gray-200'
              } ${isSaving ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-6 space-y-6">
        {/* Fonctionnalités */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.features).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getFeatureLabel(key as keyof RestaurantPOSConfig['features'])}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {getFeatureDescription(key as keyof RestaurantPOSConfig['features'])}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFeature(key as keyof RestaurantPOSConfig['features'])}
                  disabled={isSaving || !config.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled && config.enabled ? 'bg-teal-600' : 'bg-gray-200'
                  } ${isSaving ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled && config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Paramètres */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                value={config.settings.currency}
                onChange={(e) => handleUpdateSettings({ currency: e.target.value })}
                disabled={isSaving || !config.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux de TVA (%) - Prix TTC
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={Math.round(config.settings.taxRate * 100 * 10) / 10}
                onChange={(e) => handleUpdateSettings({ taxRate: parseFloat(e.target.value) / 100 })}
                disabled={isSaving || !config.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Les prix affichés incluent déjà la TVA (prix TTC)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frais de livraison (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={config.settings.deliveryFee}
                onChange={(e) => handleUpdateSettings({ deliveryFee: parseFloat(e.target.value) || 0 })}
                disabled={isSaving || !config.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commande minimum (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={config.settings.minimumOrder}
                onChange={(e) => handleUpdateSettings({ minimumOrder: parseFloat(e.target.value) || 0 })}
                disabled={isSaving || !config.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temps de préparation (min)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={config.settings.estimatedPrepTime}
                onChange={(e) => handleUpdateSettings({ estimatedPrepTime: parseInt(e.target.value) || 20 })}
                disabled={isSaving || !config.enabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Statut du système</h3>
              <p className="text-sm text-gray-500 mt-1">
                Les clients peuvent {config.enabled && config.features.ordering ? 'maintenant' : 'ne peuvent pas'} passer commande
              </p>
            </div>
            <div className={`px-3 py-2 rounded-full text-sm font-medium ${
              config.enabled && config.features.ordering 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {config.enabled && config.features.ordering ? '🟢 Opérationnel' : '🔴 Hors ligne'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getFeatureLabel(feature: keyof RestaurantPOSConfig['features']): string {
  const labels = {
    ordering: 'Commandes',
    payment: 'Paiement en ligne',
    delivery: 'Livraison',
    takeaway: 'À emporter',
    dineIn: 'Sur place',
    customization: 'Personnalisation'
  };
  return labels[feature];
}

function getFeatureDescription(feature: keyof RestaurantPOSConfig['features']): string {
  const descriptions = {
    ordering: 'Permettre aux clients de passer commande',
    payment: 'Paiement CB/PayPal intégré',
    delivery: 'Service de livraison disponible',
    takeaway: 'Commandes à emporter',
    dineIn: 'Commandes sur place',
    customization: 'Options personnalisables par plat'
  };
  return descriptions[feature];
} 