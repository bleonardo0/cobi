'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';

interface RestaurantInfo {
  id: string;
  slug: string;
  name: string;
}

export const useRestaurantId = (fallbackSlug?: string): {
  restaurantId: string | null;
  restaurantSlug: string | null;
  isLoading: boolean;
  error: string | null;
} => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const pathname = usePathname();

  // Déterminer le slug du restaurant selon le contexte
  const getRestaurantSlug = (): string | null => {
    // 1. Si on est sur une page menu : /menu/[restaurant]
    if (params?.restaurant) {
      return params.restaurant as string;
    }
    
    // 2. Si on a un fallback (dashboard restaurant)
    if (fallbackSlug) {
      return fallbackSlug;
    }
    
    // 3. Par défaut, leo-et-les-pieds
    return 'leo-et-les-pieds';
  };

  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        setIsLoading(true);
        const slug = getRestaurantSlug();
        
        if (!slug) {
          throw new Error('Aucun slug de restaurant trouvé');
        }

        setRestaurantSlug(slug);

        // Récupérer l'ID du restaurant depuis l'API (la route gère automatiquement slug ou ID)
        const response = await fetch(`/api/restaurants/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Restaurant ${slug} non trouvé`);
        }
        
        const data = await response.json();
        
        if (data.success && data.restaurant?.id) {
          setRestaurantId(data.restaurant.id);
          console.log(`🏪 Restaurant ID récupéré: ${data.restaurant.id} pour ${slug}`);
        } else {
          throw new Error('ID du restaurant non disponible');
        }
        
      } catch (err) {
        console.error('❌ Erreur lors de la récupération du restaurant ID:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        
        // Fallback vers l'ancien système pour leo-et-les-pieds
        if (getRestaurantSlug() === 'leo-et-les-pieds') {
          setRestaurantId('123e4567-e89b-12d3-a456-426614174000');
          setRestaurantSlug('leo-et-les-pieds');
          console.log('🔄 Fallback vers ancien ID pour leo-et-les-pieds');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantId();
  }, [params?.restaurant, fallbackSlug, pathname]);

  return {
    restaurantId,
    restaurantSlug,
    isLoading,
    error
  };
}; 