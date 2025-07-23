'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/ClerkAuthProvider';

interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
  error: string | null;
}

export function useRestaurantTheme(restaurantSlug?: string): RestaurantTheme {
  const [theme, setTheme] = useState<RestaurantTheme>({
    primaryColor: '#3b82f6', // Default blue
    secondaryColor: '#10b981', // Default green
    isLoading: true,
    error: null
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setTheme(prev => ({ ...prev, isLoading: true, error: null }));

        let endpoint = '';
        
        if (restaurantSlug) {
          // Pour les pages publiques (menu client)
          endpoint = `/api/restaurants/by-slug/${restaurantSlug}`;
        } else if (user?.restaurantId) {
          // Pour les pages du dashboard restaurant
          endpoint = `/api/restaurants/${user.restaurantId}`;
        } else {
          // Pas de restaurant défini, utiliser les couleurs par défaut
          setTheme(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.warn(`Erreur API ${response.status}: ${response.statusText}`);
          setTheme({
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981',
            isLoading: false,
            error: null
          });
          return;
        }

        const data = await response.json();

        if (data && data.success && data.restaurant) {
          const restaurant = data.restaurant;
          setTheme({
            primaryColor: restaurant.primary_color || restaurant.primaryColor || '#3b82f6',
            secondaryColor: restaurant.secondary_color || restaurant.secondaryColor || '#10b981',
            isLoading: false,
            error: null
          });
        } else {
          // Restaurant non trouvé, utiliser les couleurs par défaut sans erreur
          console.warn('Restaurant non trouvé, utilisation des couleurs par défaut');
          setTheme({
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981',
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
        setTheme({
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    };

    fetchTheme();
  }, [restaurantSlug, user?.restaurantId]);

  return theme;
}

// Hook pour appliquer les couleurs CSS dynamiquement
export function useApplyTheme(theme: RestaurantTheme) {
  useEffect(() => {
    if (!theme.isLoading && !theme.error) {
      // Injecter les couleurs comme variables CSS
      const root = document.documentElement;
      root.style.setProperty('--restaurant-primary', theme.primaryColor);
      root.style.setProperty('--restaurant-secondary', theme.secondaryColor);
      
      // Créer des variantes plus claires et plus foncées
      const primaryRgb = hexToRgb(theme.primaryColor);
      const secondaryRgb = hexToRgb(theme.secondaryColor);
      
      if (primaryRgb) {
        root.style.setProperty('--restaurant-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        root.style.setProperty('--restaurant-primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
        root.style.setProperty('--restaurant-primary-hover', darkenColor(theme.primaryColor, 10));
      }
      
      if (secondaryRgb) {
        root.style.setProperty('--restaurant-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
        root.style.setProperty('--restaurant-secondary-light', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`);
        root.style.setProperty('--restaurant-secondary-hover', darkenColor(theme.secondaryColor, 10));
      }
    }
  }, [theme]);
}

// Utilitaires pour manipuler les couleurs
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 - percent) / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
} 