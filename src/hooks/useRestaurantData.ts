import { useState, useEffect } from 'react';
import { Model3D } from '@/types/model';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
}

interface RestaurantData {
  restaurant: Restaurant | null;
  models: Model3D[];
  modelsCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useRestaurantData(slug: string): RestaurantData {
  const [data, setData] = useState<RestaurantData>({
    restaurant: null,
    models: [],
    modelsCount: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!slug) return;

    const fetchRestaurantData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Utiliser l'API consolidée qui retourne restaurant + modèles
        const response = await fetch(`/api/restaurants/by-slug/${slug}/models`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur inconnue');
        }

        setData({
          restaurant: result.restaurant,
          models: result.models || [],
          modelsCount: result.modelsCount || 0,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données du restaurant:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    };

    fetchRestaurantData();
  }, [slug]);

  return data;
} 