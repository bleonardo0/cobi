'use client';

import { useState, useEffect } from 'react';

export const useModelViews = (modelId: string) => {
  const [views, setViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchViews();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchViews, 30000);
    
    return () => clearInterval(interval);
  }, [modelId]);

  const fetchViews = async () => {
    try {
      const response = await fetch(`/api/analytics/model-views/${modelId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setViews(data.views);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des vues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { views, isLoading, refresh: fetchViews };
}; 