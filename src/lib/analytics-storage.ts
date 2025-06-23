// Stockage en mémoire pour les analytics (persistant pendant la session)
// En production, ceci serait remplacé par une vraie base de données

interface ViewRecord {
  id: string;
  modelId: string;
  restaurantId: string;
  timestamp: string;
  sessionId: string;
  interactionType: 'view' | 'ar_view' | 'zoom' | 'rotate';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewDuration?: number;
  endedAt?: string;
}

interface SessionRecord {
  id: string;
  restaurantId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  modelsViewed: string[];
}

// Stockage global
let viewsStorage: ViewRecord[] = [];
let sessionsStorage: SessionRecord[] = [];

// Initialiser avec quelques données de base pour la démo
let baseDataInitialized = false;

const initializeBaseData = async () => {
  if (baseDataInitialized || viewsStorage.length > 0) return;
  
  try {
    // Importer getAllModels dynamiquement pour éviter les problèmes de circular imports
    const { getAllModels } = await import('./models');
    const models = await getAllModels();
    
    if (models.length === 0) return;
    
    // Utiliser les vrais IDs des modèles
    const realModelIds = models.map(m => m.id);
    const baseViews: ViewRecord[] = [];
    
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // Dernière semaine
      
      baseViews.push({
        id: `base_view_${i}`,
        modelId: realModelIds[Math.floor(Math.random() * realModelIds.length)],
        restaurantId: 'restaurant-test-123',
        timestamp: date.toISOString(),
        sessionId: `base_session_${Math.floor(i / 3)}`,
        interactionType: 'view',
        deviceType: ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)] as any,
        viewDuration: Math.floor(Math.random() * 180) + 30,
        endedAt: new Date(date.getTime() + (Math.floor(Math.random() * 180) + 30) * 1000).toISOString(),
      });
    }
    
    viewsStorage = baseViews;
    baseDataInitialized = true;
    console.log('📊 Données de base initialisées avec', realModelIds.length, 'modèles réels');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données de base:', error);
  }
};

export const analyticsStorage = {
  // Ajouter une vue
  addView: async (view: Omit<ViewRecord, 'id'>) => {
    await initializeBaseData();
    const newView: ViewRecord = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...view,
    };
    viewsStorage.push(newView);
    console.log('📊 Vue ajoutée:', newView);
    return newView;
  },

  // Mettre à jour la durée d'une vue
  updateViewDuration: (modelId: string, sessionId: string, viewDuration: number) => {
    const viewIndex = viewsStorage.findIndex(
      v => v.modelId === modelId && v.sessionId === sessionId && !v.viewDuration
    );
    
    if (viewIndex !== -1) {
      viewsStorage[viewIndex].viewDuration = viewDuration;
      viewsStorage[viewIndex].endedAt = new Date().toISOString();
      console.log('⏱️ Durée mise à jour:', viewsStorage[viewIndex]);
      return viewsStorage[viewIndex];
    }
    return null;
  },

  // Ajouter une session
  addSession: (session: Omit<SessionRecord, 'id'>) => {
    const newSession: SessionRecord = {
      id: session.sessionId,
      ...session,
    };
    sessionsStorage.push(newSession);
    console.log('🚀 Session ajoutée:', newSession);
    return newSession;
  },

  // Terminer une session
  endSession: (sessionId: string) => {
    const sessionIndex = sessionsStorage.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex !== -1) {
      sessionsStorage[sessionIndex].endTime = new Date().toISOString();
      console.log('🏁 Session terminée:', sessionsStorage[sessionIndex]);
      return sessionsStorage[sessionIndex];
    }
    return null;
  },

  // Obtenir toutes les vues
  getAllViews: () => [...viewsStorage],

  // Obtenir toutes les sessions
  getAllSessions: () => [...sessionsStorage],

  // Obtenir les vues pour un restaurant
  getViewsByRestaurant: (restaurantId: string) => {
    return viewsStorage.filter(v => v.restaurantId === restaurantId);
  },

  // Obtenir les vues pour un modèle
  getViewsByModel: (modelId: string) => {
    return viewsStorage.filter(v => v.modelId === modelId);
  },

  // Calculer les statistiques
  getModelStats: async (restaurantId?: string) => {
    await initializeBaseData();
    const relevantViews = restaurantId 
      ? viewsStorage.filter(v => v.restaurantId === restaurantId)
      : viewsStorage;

    const modelStats = new Map();
    
    relevantViews.forEach(view => {
      if (!modelStats.has(view.modelId)) {
        modelStats.set(view.modelId, {
          modelId: view.modelId,
          views: 0,
          totalDuration: 0,
          completedViews: 0,
          lastViewed: view.timestamp,
        });
      }
      
      const stats = modelStats.get(view.modelId);
      stats.views++;
      
      if (view.viewDuration) {
        stats.totalDuration += view.viewDuration;
        stats.completedViews++;
      }
      
      if (new Date(view.timestamp) > new Date(stats.lastViewed)) {
        stats.lastViewed = view.timestamp;
      }
    });

    return Array.from(modelStats.values()).map(stats => ({
      ...stats,
      avgDuration: stats.completedViews > 0 ? Math.round(stats.totalDuration / stats.completedViews) : 0,
      popularityScore: Math.min(100, Math.round((stats.views * 2) + (stats.avgDuration / 3))),
    }));
  },

  // Obtenir les stats générales
  getGeneralStats: async (restaurantId?: string) => {
    await initializeBaseData();
    const relevantViews = restaurantId 
      ? viewsStorage.filter(v => v.restaurantId === restaurantId)
      : viewsStorage;
    
    const relevantSessions = restaurantId 
      ? sessionsStorage.filter(s => s.restaurantId === restaurantId)
      : sessionsStorage;

    const totalViews = relevantViews.length;
    const completedViews = relevantViews.filter(v => v.viewDuration).length;
    const totalDuration = relevantViews.reduce((sum, v) => sum + (v.viewDuration || 0), 0);
    const avgDuration = completedViews > 0 ? Math.round(totalDuration / completedViews) : 0;

    const deviceBreakdown = relevantViews.reduce((acc, view) => {
      acc[view.deviceType] = (acc[view.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDeviceViews = Object.values(deviceBreakdown).reduce((sum, count) => sum + count, 0);
    const devicePercentages = Object.entries(deviceBreakdown).reduce((acc, [device, count]) => {
      acc[device] = totalDeviceViews > 0 ? Math.round((count / totalDeviceViews) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalViews,
      avgDuration,
      uniqueSessions: relevantSessions.length,
      deviceBreakdown: devicePercentages,
    };
  },

  // Obtenir les vues par jour (7 derniers jours)
  getViewsByDay: async (restaurantId?: string) => {
    await initializeBaseData();
    const relevantViews = restaurantId 
      ? viewsStorage.filter(v => v.restaurantId === restaurantId)
      : viewsStorage;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayViews = relevantViews.filter(v => {
        const viewDate = new Date(v.timestamp);
        return viewDate >= date && viewDate < nextDay;
      });

      return {
        date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        views: dayViews.length,
      };
    });

    return last7Days;
  },

  // Reset des données (pour les tests)
  reset: () => {
    viewsStorage = [];
    sessionsStorage = [];
    baseDataInitialized = false;
    console.log('🔄 Analytics storage reset');
  },

  // Forcer la réinitialisation avec les vrais modèles
  forceReinitialize: async () => {
    viewsStorage = [];
    sessionsStorage = [];
    baseDataInitialized = false;
    await initializeBaseData();
    console.log('🔄 Analytics storage réinitialisé avec les vrais modèles');
  },
}; 