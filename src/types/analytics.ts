// Types pour le système d'analytics
export interface ModelView {
  id: string;
  modelId: string;
  restaurantId: string;
  timestamp: string;
  sessionId: string;
  viewDuration?: number; // en secondes
  interactionType: 'view' | 'ar_view' | 'zoom' | 'rotate';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
}

export interface MenuView {
  id: string;
  restaurantId: string;
  timestamp: string;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
  pageUrl?: string;
  referrer?: string;
}

export interface ModelAnalytics {
  modelId: string;
  totalViews: number;
  uniqueViews: number;
  avgViewDuration: number;
  maxViewDuration: number;
  arViews: number;
  lastViewed: string;
  viewsByDay: { date: string; views: number }[];
  popularityScore: number; // calculé basé sur vues + durée
}

export interface RestaurantAnalytics {
  restaurantId: string;
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topModels: { modelId: string; name: string; views: number; avgDuration: number }[];
  viewsByHour: { hour: number; views: number }[];
  viewsByDay: { date: string; views: number }[];
  deviceBreakdown: { mobile: number; tablet: number; desktop: number };
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuSession {
  id: string;
  restaurantId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  modelsViewed: string[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
} 