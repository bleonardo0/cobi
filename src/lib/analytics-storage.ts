import { ModelView, MenuSession, MenuView } from '@/types/analytics';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Chemin du fichier de stockage temporaire
const STORAGE_FILE = path.join(os.tmpdir(), 'cobi-analytics-storage.json');

// Interface pour le stockage
interface StorageData {
  modelViews: ModelView[];
  sessions: MenuSession[];
  menuViews: MenuView[];
}

// Fonction pour lire le stockage depuis le fichier
const readStorage = (): StorageData => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du stockage:', error);
  }
  return { modelViews: [], sessions: [], menuViews: [] };
};

// Fonction pour écrire le stockage dans le fichier
const writeStorage = (data: StorageData): void => {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'écriture du stockage:', error);
  }
};

// Stockage en mémoire pour les données d'analytics
let storage = readStorage();

// Fonction helper pour sauvegarder après modification
const saveAndUpdate = (newStorage: StorageData) => {
  storage = newStorage;
  writeStorage(storage);
};

export const addModelView = (view: ModelView) => {
  const newStorage = { ...storage };
  newStorage.modelViews.push(view);
  saveAndUpdate(newStorage);
  console.log('📊 Vue modèle ajoutée:', view);
  console.log('🔢 Total vues modèles:', newStorage.modelViews.length);
};

export const addSession = (session: MenuSession) => {
  const newStorage = { ...storage };
  newStorage.sessions.push(session);
  saveAndUpdate(newStorage);
  console.log('👤 Session ajoutée:', session);
  console.log('🔢 Total sessions:', newStorage.sessions.length);
};

export const addMenuView = (menuView: MenuView) => {
  const newStorage = { ...storage };
  newStorage.menuViews.push(menuView);
  saveAndUpdate(newStorage);
  console.log('📋 Vue menu ajoutée:', menuView);
  console.log('🔢 Total vues menus:', newStorage.menuViews.length);
};

export const getModelViews = (restaurantId?: string): ModelView[] => {
  if (!restaurantId) return storage.modelViews;
  return storage.modelViews.filter(view => view.restaurantId === restaurantId);
};

export const getSessions = (restaurantId?: string): MenuSession[] => {
  if (!restaurantId) return storage.sessions;
  return storage.sessions.filter(session => session.restaurantId === restaurantId);
};

export const getMenuViews = (restaurantId?: string): MenuView[] => {
  if (!restaurantId) return storage.menuViews;
  return storage.menuViews.filter(view => view.restaurantId === restaurantId);
};

export const getGeneralStats = (restaurantId?: string) => {
  const modelViews = getModelViews(restaurantId);
  const sessions = getSessions(restaurantId);
  const menuViews = getMenuViews(restaurantId);
  
  const totalViews = modelViews.length + menuViews.length;
  
  console.log('📊 Calcul des stats générales pour:', restaurantId);
  console.log('🔢 Vues modèles:', modelViews.length);
  console.log('🔢 Vues menus:', menuViews.length);
  console.log('🔢 Total vues:', totalViews);
  console.log('🔢 Sessions:', sessions.length);
  
  return {
    totalViews,
    totalSessions: sessions.length,
    totalModelViews: modelViews.length,
    totalMenuViews: menuViews.length
  };
};

export const getViewsByDay = (restaurantId?: string, days: number = 7) => {
  const modelViews = getModelViews(restaurantId);
  const menuViews = getMenuViews(restaurantId);
  const allViews = [...modelViews, ...menuViews];
  
  const now = new Date();
  const viewsByDay: { [key: string]: number } = {};
  
  // Initialiser les jours
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    viewsByDay[dayKey] = 0;
  }
  
  // Compter les vues par jour
  allViews.forEach(view => {
    const viewDate = new Date(view.timestamp);
    const dayKey = viewDate.toISOString().split('T')[0];
    if (viewsByDay.hasOwnProperty(dayKey)) {
      viewsByDay[dayKey]++;
    }
  });
  
  return viewsByDay;
};

export const getPopularModels = (restaurantId?: string, limit: number = 10) => {
  const modelViews = getModelViews(restaurantId);
  const modelCounts: { [key: string]: number } = {};
  
  modelViews.forEach(view => {
    modelCounts[view.modelId] = (modelCounts[view.modelId] || 0) + 1;
  });
  
  return Object.entries(modelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([modelId, count]) => ({ modelId, count }));
};

export const getDeviceStats = (restaurantId?: string) => {
  const modelViews = getModelViews(restaurantId);
  const menuViews = getMenuViews(restaurantId);
  const allViews = [...modelViews, ...menuViews];
  
  const deviceCounts: { [key: string]: number } = {};
  
  allViews.forEach(view => {
    deviceCounts[view.deviceType] = (deviceCounts[view.deviceType] || 0) + 1;
  });
  
  return deviceCounts;
};

export const resetAnalytics = (restaurantId?: string) => {
  if (!restaurantId) {
    // Réinitialiser tout
    const newStorage = { modelViews: [], sessions: [], menuViews: [] };
    saveAndUpdate(newStorage);
    console.log('🔄 Toutes les analytics réinitialisées');
  } else {
    // Réinitialiser seulement pour un restaurant
    const newStorage = {
      modelViews: storage.modelViews.filter(view => view.restaurantId !== restaurantId),
      sessions: storage.sessions.filter(session => session.restaurantId !== restaurantId),
      menuViews: storage.menuViews.filter(view => view.restaurantId !== restaurantId)
    };
    saveAndUpdate(newStorage);
    console.log('🔄 Analytics réinitialisées pour:', restaurantId);
  }
};

export const getStorageDebug = (restaurantId?: string) => {
  const modelViews = getModelViews(restaurantId);
  const sessions = getSessions(restaurantId);
  const menuViews = getMenuViews(restaurantId);
  
  return {
    modelViews,
    sessions,
    menuViews,
    totalModelViews: modelViews.length,
    totalSessions: sessions.length,
    totalMenuViews: menuViews.length,
    storageFile: STORAGE_FILE,
    fileExists: fs.existsSync(STORAGE_FILE)
  };
};

// Fonction pour forcer la relecture du stockage
export const reloadStorage = () => {
  storage = readStorage();
  console.log('🔄 Stockage rechargé depuis le fichier');
  return storage;
}; 

// Export object pour l'API
export const analyticsStorage = {
  addModelView,
  addSession,
  addMenuView,
  getModelViews,
  getSessions,
  getMenuViews,
  getGeneralStats,
  getViewsByDay,
  getPopularModels,
  getDeviceStats,
  resetAnalytics,
  getStorageDebug,
  reloadStorage
}; 