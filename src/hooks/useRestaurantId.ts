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
    
    // 3. Pas de fallback par défaut - éviter les requêtes vers des restaurants inexistants
    return null;
  };

  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        setIsLoading(true);
        const slug = getRestaurantSlug();
        
        if (!slug) {
          // Au lieu de throw une erreur, on retourne silencieusement
          console.warn('⚠️ Aucun slug de restaurant trouvé - contexte sans restaurant');
          setError(null); // Pas d'erreur, juste pas de restaurant
          setRestaurantId(null);
          setRestaurantSlug(null);
          return;
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