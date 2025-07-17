'use client';

import { useState, useRef, useEffect } from 'react';

// Générer un ID de session unique
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Détecter le type d'appareil
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

export const useAnalytics = (restaurantId?: string) => {
  const [sessionId] = useState(() => generateSessionId());
  const viewStartTime = useRef<number>(0);
  const currentModelId = useRef<string | null>(null);

  // Track le début d'une vue de modèle - N'enregistre que le début localement
  const trackModelView = async (modelId: string, interactionType: 'view' | 'ar_view' | 'zoom' | 'rotate' = 'view') => {
    if (!restaurantId) return;

    // Finir la vue précédente s'il y en a une
    if (currentModelId.current && currentModelId.current !== modelId) {
      await trackModelViewEnd();
    }

    // Démarrer le tracking de la nouvelle vue
    viewStartTime.current = Date.now();
    currentModelId.current = modelId;
    
    console.log(`📊 Début de vue pour modèle: ${modelId}`);
  };

  // Track la fin d'une vue (avec durée) - Enregistre la vue complète
  const trackModelViewEnd = async () => {
    if (!currentModelId.current || !restaurantId || !viewStartTime.current) return;

    const viewDuration = Math.round((Date.now() - viewStartTime.current) / 1000);
    
    // Enregistrer la vue complète avec durée
    try {
      await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: currentModelId.current,
          restaurantId,
          sessionId,
          viewDuration,
          deviceType: getDeviceType(),
          userAgent: navigator.userAgent,
        }),
      });
      
      console.log(`✅ Vue enregistrée: ${currentModelId.current} (${viewDuration}s)`);
    } catch (error) {
      console.error('Erreur lors du tracking de fin:', error);
    }

    viewStartTime.current = 0;
    currentModelId.current = null;
  };

  // Stubs pour les autres fonctions (simplifiées)
  const trackSessionStart = async () => {
    if (!restaurantId) return;
    console.log('🚀 Session start tracked (simplified)');
  };

  const trackSessionEnd = async () => {
    if (!restaurantId) return;
    console.log('🛑 Session end tracked (simplified)');
  };

  const trackMenuView = async () => {
    if (!restaurantId) return;
    console.log('🍽️ Menu view tracked (simplified)');
  };

  // Cleanup automatique à la fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackModelViewEnd();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackModelViewEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackModelViewEnd();
    };
  }, [restaurantId]);

  return {
    sessionId,
    trackModelView,
    trackModelViewEnd,
    trackSessionStart,
    trackSessionEnd,
    trackMenuView,
  };
}; 