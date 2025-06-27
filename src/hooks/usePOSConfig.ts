'use client';

import { useState, useEffect } from 'react';
import { RestaurantPOSConfig } from '@/types/pos';

export function usePOSConfig(restaurantId: string) {
  const [config, setConfig] = useState<RestaurantPOSConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchPOSConfig(restaurantId);
    }
  }, [restaurantId]);

  const fetchPOSConfig = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Pour l'instant, on utilise une configuration par défaut
      // Plus tard, ceci fera un appel API à /api/restaurants/${id}/pos-config
      const mockConfig: RestaurantPOSConfig = {
        restaurantId: id,
        enabled: true, // Activé par défaut pour le test
        features: {
          ordering: true,
          payment: false, // Désactivé pour l'instant
          delivery: false,
          takeaway: true,
          dineIn: true,
          customization: false
        },
        settings: {
          currency: 'EUR',
          taxRate: 0.20, // 20% TVA
          deliveryFee: 0,
          minimumOrder: 0,
          estimatedPrepTime: 20,
          acceptsReservations: false
        },
        paymentMethods: ['cash'],
        openingHours: {
          lundi: { open: '09:00', close: '22:00', closed: false },
          mardi: { open: '09:00', close: '22:00', closed: false },
          mercredi: { open: '09:00', close: '22:00', closed: false },
          jeudi: { open: '09:00', close: '22:00', closed: false },
          vendredi: { open: '09:00', close: '23:00', closed: false },
          samedi: { open: '09:00', close: '23:00', closed: false },
          dimanche: { open: '10:00', close: '21:00', closed: false }
        }
      };

      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setConfig(mockConfig);
    } catch (error) {
      console.error('Erreur lors du chargement de la config POS:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<RestaurantPOSConfig>) => {
    if (!config) return false;

    try {
      setIsLoading(true);
      
      // TODO: Appel API pour mettre à jour la config
      // await fetch(`/api/restaurants/${restaurantId}/pos-config`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });

      const updatedConfig = { ...config, ...updates };
      setConfig(updatedConfig);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la config POS:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePOS = async (enabled: boolean) => {
    return updateConfig({ enabled });
  };

  const toggleFeature = async (feature: keyof RestaurantPOSConfig['features'], enabled: boolean) => {
    if (!config) return false;
    
    return updateConfig({
      features: {
        ...config.features,
        [feature]: enabled
      }
    });
  };

  return {
    config,
    isLoading,
    error,
    updateConfig,
    togglePOS,
    toggleFeature,
    // Helpers
    isEnabled: config?.enabled || false,
    canOrder: config?.enabled && config?.features.ordering,
    canPay: config?.enabled && config?.features.payment,
    canDeliver: config?.enabled && config?.features.delivery,
    canTakeaway: config?.enabled && config?.features.takeaway,
    canDineIn: config?.enabled && config?.features.dineIn
  };
} 