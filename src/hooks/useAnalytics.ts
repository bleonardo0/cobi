'use client';

import { useEffect, useRef, useState } from 'react';
import { ModelView } from '@/types/analytics';

// Génère un ID de session unique
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Détecte le type d'appareil
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

export const useAnalytics = (restaurantId?: string) => {
  const [sessionId] = useState(() => generateSessionId());
  const viewStartTime = useRef<number>(0);
  const currentModelId = useRef<string | null>(null);

  // Track le début d'une vue de modèle
  const trackModelView = async (modelId: string, interactionType: 'view' | 'ar_view' | 'zoom' | 'rotate' = 'view') => {
    if (!restaurantId) return;

    viewStartTime.current = Date.now();
    currentModelId.current = modelId;

    const viewData = {
      modelId,
      restaurantId,
      sessionId,
      interactionType,
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
    };

    try {
      await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewData),
      });
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  };

  // Track la fin d'une vue (avec durée)
  const trackModelViewEnd = async () => {
    if (!currentModelId.current || !restaurantId || !viewStartTime.current) return;

    const viewDuration = Math.round((Date.now() - viewStartTime.current) / 1000);
    
    try {
      await fetch('/api/analytics/track-view-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: currentModelId.current,
          restaurantId,
          sessionId,
          viewDuration,
        }),
      });
    } catch (error) {
      console.error('Erreur lors du tracking de fin:', error);
    }

    viewStartTime.current = 0;
    currentModelId.current = null;
  };

  // Track le début d'une session
  const trackSessionStart = async () => {
    if (!restaurantId) return;

    console.log('🚀 Attempting to track session start for restaurant:', restaurantId);

    try {
      const response = await fetch('/api/analytics/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          sessionId,
          startTime: new Date().toISOString(),
          deviceType: getDeviceType(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Session start tracked successfully:', result);
      } else {
        console.error('❌ Failed to track session start:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du tracking de session:', error);
    }
  };

  // Track la fin d'une session
  const trackSessionEnd = async () => {
    if (!restaurantId) return;

    try {
      await fetch('/api/analytics/track-session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          sessionId,
          endTime: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Erreur lors du tracking de fin de session:', error);
    }
  };

  // Track une vue de menu (page view)
  const trackMenuView = async () => {
    if (!restaurantId) return;

    console.log('🍽️ Attempting to track menu view for restaurant:', restaurantId);

    try {
      const response = await fetch('/api/analytics/track-menu-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          timestamp: new Date().toISOString(),
          sessionId,
          deviceType: getDeviceType(),
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          referrer: document.referrer || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Menu view tracked successfully:', result);
      } else {
        console.error('❌ Failed to track menu view:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du tracking de vue de menu:', error);
    }
  };

  // Cleanup automatique à la fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackModelViewEnd();
      trackSessionEnd();
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
      trackSessionEnd();
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