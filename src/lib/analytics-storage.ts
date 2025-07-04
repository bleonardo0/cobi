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

// Pas de données de base automatiques - les restaurants commencent avec des données vides

const initializeBaseDataForRestaurant = async (restaurantId: string) => {
  // Cette fonction n'est plus utilisée - les restaurants commencent avec des données vides
  return;
  
  try {
    // Importer getAllModels dynamiquement pour éviter les problèmes de circular imports
    const { getAllModels } = await import('./models');
    const models = await getAllModels();
    
    if (models.length === 0) return;
    
    // Utiliser les vrais IDs des modèles
    const realModelIds = models.map(m => m.id);
    const baseViews: ViewRecord[] = [];
    
    // Vérifier si des données de base existent déjà pour ce restaurant
    const hasBaseDataForRestaurant = viewsStorage.some(
      view => view.id.startsWith(`base_${restaurantId}_`)
    );
    
    if (!hasBaseDataForRestaurant) {
      // Générer des données de base personnalisées pour chaque restaurant
      const restaurantSeed = getRestaurantSeed(restaurantId);
      const fixedData = generateFixedDataForRestaurant(restaurantSeed);
      
      let viewId = 0;
      fixedData.forEach((modelData, modelIndex) => {
        const modelId = realModelIds[modelData.modelIndex % realModelIds.length];
        
        // Générer les vues pour ce modèle
        for (let i = 0; i < modelData.views; i++) {
          const date = new Date();
          // Répartir les vues sur 7 jours avec des patterns fixes
          const dayOffset = (viewId % 7) * 24 + (viewId % 24);
          date.setHours(date.getHours() - dayOffset);
          
          baseViews.push({
            id: `base_${restaurantId}_${viewId}`,
            modelId: modelId,
            restaurantId: restaurantId,
            timestamp: date.toISOString(),
            sessionId: `base_session_${restaurantId}_${Math.floor(viewId / 3)}`,
            interactionType: 'view',
            deviceType: modelData.deviceType,
            viewDuration: modelData.avgDuration + (viewId % 10) - 5,
            endedAt: new Date(date.getTime() + (modelData.avgDuration + (viewId % 10) - 5) * 1000).toISOString(),
          });
          viewId++;
        }
      });
      
      // Ajouter les données de base aux vues existantes
      viewsStorage.push(...baseViews);
      console.log(`📊 Données de base ajoutées pour ${restaurantId}:`, baseViews.length, 'vues');
    } else {
      console.log(`📊 Données de base déjà présentes pour ${restaurantId}`);
    }
  } catch (error) {
    console.error(`Erreur lors de l'initialisation des données pour ${restaurantId}:`, error);
  }
};

// Générer un seed personnalisé pour chaque restaurant
const getRestaurantSeed = (restaurantId: string): number => {
  let hash = 0;
  for (let i = 0; i < restaurantId.length; i++) {
    const char = restaurantId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Générer des données fixes personnalisées selon le restaurant
const generateFixedDataForRestaurant = (seed: number) => {
  const random = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280; // Générateur pseudo-aléatoire déterministe
    return min + (seed / 233280) * (max - min);
  };

  const deviceTypes = ['mobile', 'tablet', 'desktop'] as const;
  const data = [];
  
  for (let i = 0; i < 5; i++) {
    data.push({
      modelIndex: i,
      views: Math.floor(random(8, 20)), // Entre 8 et 20 vues
      avgDuration: Math.floor(random(90, 150)), // Entre 90 et 150 secondes
      deviceType: deviceTypes[Math.floor(random(0, 3))]
    });
  }
  
  // Trier par nombre de vues décroissant pour avoir un classement cohérent
  return data.sort((a, b) => b.views - a.views);
};

// Pas d'initialisation automatique - les restaurants commencent avec des données vides
const initializeRestaurantOnFirstVisit = async (restaurantId: string) => {
  console.log(`📊 Analytics pour ${restaurantId} - commence avec des données vides`);
  // Pas d'initialisation automatique, les données commencent à zéro
  // Seules les vraies vues des utilisateurs seront trackées
};

export const analyticsStorage = {
  // Ajouter une vue
  addView: async (view: Omit<ViewRecord, 'id'>) => {
    // Ne pas initialiser automatiquement avec des données de base
    // Les vraies vues des utilisateurs s'ajouteront naturellement
    const newView: ViewRecord = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...view,
    };
    viewsStorage.push(newView);
    console.log('📊 Vue ajoutée (vraie vue d\'utilisateur):', newView);
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
    // Pas d'initialisation automatique - les restaurants commencent avec des données vides
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
    // Pas d'initialisation automatique - les restaurants commencent avec des données vides
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
    // Pas d'initialisation automatique - les restaurants commencent avec des données vides
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
    console.log('🔄 Analytics storage reset');
  },

  // Forcer la réinitialisation avec les vrais modèles
  forceReinitialize: async (restaurantId?: string) => {
    if (restaurantId) {
      // Réinitialiser seulement pour un restaurant spécifique
      viewsStorage = viewsStorage.filter(v => v.restaurantId !== restaurantId);
      sessionsStorage = sessionsStorage.filter(s => s.restaurantId !== restaurantId);
      console.log(`🔄 Analytics storage réinitialisé pour ${restaurantId}`);
    } else {
      // Réinitialiser tout
      viewsStorage = [];
      sessionsStorage = [];
      console.log('🔄 Analytics storage réinitialisé complètement');
    }
  },

  // Remettre à zéro les analytics d'un restaurant (admin uniquement)
  resetRestaurantAnalytics: async (restaurantId: string, completeReset: boolean = true) => {
    try {
      console.log(`🔍 État avant reset pour ${restaurantId}:`);
      console.log(`   • Total vues en mémoire: ${viewsStorage.length}`);
      console.log(`   • Total sessions en mémoire: ${sessionsStorage.length}`);
      
      // Supprimer toutes les vues du restaurant
      const viewsBeforeReset = viewsStorage.filter(v => v.restaurantId === restaurantId);
      console.log(`   • Vues à supprimer pour ${restaurantId}:`, viewsBeforeReset.length);
      console.log(`   • IDs des vues à supprimer:`, viewsBeforeReset.map(v => v.id));
      
      viewsStorage = viewsStorage.filter(v => v.restaurantId !== restaurantId);
      
      // Supprimer toutes les sessions du restaurant
      const sessionsBeforeReset = sessionsStorage.filter(s => s.restaurantId === restaurantId);
      console.log(`   • Sessions à supprimer pour ${restaurantId}:`, sessionsBeforeReset.length);
      
      sessionsStorage = sessionsStorage.filter(s => s.restaurantId !== restaurantId);
      
      console.log(`🔍 État après suppression:`);
      console.log(`   • Total vues restantes: ${viewsStorage.length}`);
      console.log(`   • Total sessions restantes: ${sessionsStorage.length}`);
      
      let regeneratedData = false;
      if (completeReset) {
        // Régénérer les données de base seulement si demandé
        console.log(`🔄 Régénération des données de base pour ${restaurantId}...`);
        await initializeBaseDataForRestaurant(restaurantId);
        regeneratedData = true;
        console.log(`   • Vues après régénération: ${viewsStorage.filter(v => v.restaurantId === restaurantId).length}`);
      }
      
      const result = {
        success: true,
        restaurantId,
        viewsRemoved: viewsBeforeReset.length,
        sessionsRemoved: sessionsBeforeReset.length,
        regeneratedData,
        timestamp: new Date().toISOString()
      };
      
      console.log(`🗑️ Analytics ${completeReset ? 'réinitialisé' : 'remis à zéro'} pour ${restaurantId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Erreur lors du reset des analytics pour ${restaurantId}:`, error);
      throw error;
    }
  },
}; 