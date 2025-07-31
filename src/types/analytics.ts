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
  logo_url?: string;
  ambiance_image_url?: string; // Image d'ambiance pour le nouveau design de menu
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

// Nouveaux types pour les statistiques avancées
export interface ModelTrendAnalytics {
  modelId: string;
  name: string;
  dailyViews: { date: string; views: number }[];
  weeklyViews: { week: string; views: number }[];
  monthlyViews: { month: string; views: number }[];
  growthRate: number; // pourcentage de croissance sur la période
  trend: 'ascending' | 'descending' | 'stable';
}

export interface ConversionMetrics {
  modelId: string;
  name: string;
  totalViews: number;
  ordersCount: number; // sera connecté au POS
  conversionRate: number; // pourcentage (commandes / vues * 100)
  revenueGenerated: number; // sera connecté au POS
  avgOrderValue: number; // sera connecté au POS
}

export interface SmartAlert {
  id: string;
  type: 'low_conversion' | 'high_views_no_orders' | 'declining_popularity' | 'trending_up';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  modelId?: string;
  modelName?: string;
  metrics: {
    views?: number;
    orders?: number;
    conversionRate?: number;
    trend?: number;
  };
  createdAt: string;
  isRead: boolean;
}

export interface AdvancedAnalytics {
  topModelsByPeriod: {
    daily: ModelTrendAnalytics[];
    weekly: ModelTrendAnalytics[];
    monthly: ModelTrendAnalytics[];
  };
  conversionMetrics: ConversionMetrics[];
  alerts: SmartAlert[];
  summary: {
    totalViews: number;
    totalOrders: number;
    overallConversionRate: number;
    totalRevenue: number;
    avgOrderValue: number;
    mostViewedModel: string;
    bestConvertingModel: string;
    worstConvertingModel: string;
  };
}

// Types pour l'intégration POS future
export interface POSOrder {
  id: string;
  restaurantId: string;
  modelId?: string; // Lien avec le modèle 3D consulté
  sessionId?: string; // Lien avec la session de consultation
  items: POSOrderItem[];
  totalAmount: number;
  timestamp: string;
  customerInfo?: {
    id?: string;
    email?: string;
    phone?: string;
  };
}

export interface POSOrderItem {
  id: string;
  modelId?: string; // Lien avec le modèle 3D
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
} 