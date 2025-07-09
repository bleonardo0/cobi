'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Model3D } from "@/types/model";
import { Restaurant } from "@/types/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePOSConfig } from "@/hooks/usePOSConfig";
import { useCart } from "@/hooks/useCart";
import { useDebounce } from "@/hooks/useDebounce";
import { getCategoryInfo, getAllergenInfo } from "@/lib/constants";
import ModelViewer from "@/components/ModelViewer";
import HotspotViewer from "@/components/HotspotViewer";
import Cart from "@/components/Cart";
import LazyImage from "@/components/LazyImage";

type CategoryType = 'all' | string;

interface CategoryInfo {
  name: string;
  icon: string;
}

export default function MenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hotspotsEnabled, setHotspotsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { trackModelView, trackModelViewEnd, trackSessionStart } = useAnalytics(restaurant?.id);
  
  // Configuration POS
  const { config: posConfig, isEnabled: posEnabled, canOrder } = usePOSConfig(restaurant?.id || '');
  
  // Gestion du panier
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    isInCart,
    getItemQuantity,
    isEmpty: isCartEmpty,
    isLoading: isCartLoading,
    error: cartError
  } = useCart({ 
    restaurantId: restaurant?.id || '', 
    config: posConfig || undefined 
  });

  useEffect(() => {
    const fetchRestaurantData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantSlug}`);
      if (!restaurantResponse.ok) {
        throw new Error('Restaurant non trouvé');
      }
      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData.restaurant);

      const modelsResponse = await fetch(`/api/restaurants/${restaurantSlug}/models`);
      if (!modelsResponse.ok) {
        throw new Error('Erreur lors du chargement du menu');
      }
      const modelsData = await modelsResponse.json();
      setModels(modelsData.models);
      
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

    fetchRestaurantData();
  }, [restaurantSlug]);

  useEffect(() => {
    if (restaurant) {
      trackSessionStart();
    }
  }, [restaurant, trackSessionStart]);

  const handleModelSelect = useCallback((model: Model3D) => {
    if (selectedModel?.id === model.id) {
      trackModelViewEnd();
      setSelectedModel(null);
    } else {
      if (selectedModel) {
        trackModelViewEnd();
      }
      setSelectedModel(model);
      trackModelView(model.id);
    }
  }, [selectedModel, trackModelView, trackModelViewEnd]);

  // Memoization des calculs coûteux
  const groupedModels = useMemo(() => {
    return models.reduce((acc, model) => {
      const category = model.category || 'autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(model);
      return acc;
    }, {} as Record<string, Model3D[]>);
  }, [models]);

  const categories: CategoryType[] = useMemo(() => {
    return ['all', ...Object.keys(groupedModels)];
  }, [groupedModels]);

  // Filtrage combiné par catégorie et recherche avec memoization et debounce
  const filteredModels = useMemo(() => {
    return models.filter(model => {
      // Filtrage par catégorie
      const categoryMatch = selectedCategory === 'all' || model.category === selectedCategory;
      
      // Filtrage par recherche (avec debounce)
      const searchMatch = debouncedSearchQuery === '' || 
        model.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        model.shortDescription?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        model.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      return categoryMatch && searchMatch;
    });
  }, [models, selectedCategory, debouncedSearchQuery]);

  // Handlers pour le panier
  const handleCheckout = () => {
    // TODO: Rediriger vers la page de checkout
    console.log('Checkout avec panier:', cart);
    alert('Fonctionnalité de checkout à implémenter');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded-lg w-64 mb-3"></div>
              <div className="h-4 bg-white/15 rounded w-96"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Search Bar Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-12 bg-neutral-200 rounded-2xl w-full max-w-md mx-auto"></div>
          </div>
          
          {/* Category Filters Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="flex flex-wrap gap-3 justify-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-neutral-200 rounded-full w-20"></div>
              ))}
            </div>
          </div>
          
          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-neutral-200 to-neutral-300 relative">
                  <div className="absolute top-3 right-3 w-12 h-6 bg-neutral-300 rounded-full"></div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-5 bg-neutral-200 rounded w-12"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-full"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
                    <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
                  </div>
                  <div className="h-10 bg-neutral-200 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="glass backdrop-blur-lg rounded-2xl px-6 py-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-primary-700 font-medium">Chargement du menu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="glass backdrop-blur-lg rounded-3xl p-8 shadow-soft-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
              <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-3 text-shadow">Restaurant non trouvé</h1>
            <p className="text-neutral-600 mb-6 leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-soft"
            >
              Réessayer
            </button>
        </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 font-display">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 px-4 py-4 md:py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="text-white font-semibold text-sm md:text-base">Menu 3D</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4"
            >
              {/* Toggle Hotspots */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="text-xs md:text-sm font-medium text-white/90 hidden sm:inline">Hotspots</span>
                <button
                  onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                  className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-all duration-200 ${
                    hotspotsEnabled ? 'bg-green-500' : 'bg-white/30'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      hotspotsEnabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Bouton Panier */}
              {posEnabled && canOrder && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative glass backdrop-blur-sm text-white px-3 py-2 md:px-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 flex items-center space-x-1 md:space-x-2 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                  </svg>
                  <span className="text-sm md:text-base">Panier</span>
                  {!isCartEmpty && (
                    <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-accent-500 text-white text-xs w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center animate-pulse">
                      {getItemCount()}
                    </span>
                  )}
                </button>
              )}
            </motion.div>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="relative z-10 px-4 pb-12 md:pb-16 pt-4 md:pt-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-shadow-lg" style={{ color: '#fbbf24' }}>
                La Bella Vita
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                Découvrez notre menu en 3D - Une expérience culinaire immersive
              </p>
              
              {/* Status badges */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-4">
                {posEnabled && canOrder && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center px-3 py-2 md:px-4 rounded-2xl bg-green-600/90 backdrop-blur-sm text-white text-xs md:text-sm font-medium"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Commande en ligne disponible</span>
                    <span className="sm:hidden">Commande en ligne</span>
                  </motion.span>
                )}
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center px-3 py-2 md:px-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm font-medium"
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Visualisation 3D
                </motion.span>
            </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute -bottom-1 w-full">
          <svg className="w-full h-20 text-primary-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {/* Barre de recherche */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <label htmlFor="search-input" className="sr-only">
              Rechercher un plat, ingrédient ou catégorie
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              role="searchbox"
              placeholder="Rechercher un plat, ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher parmi les plats du menu"
              aria-describedby={searchQuery ? "search-results-count" : undefined}
              className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-neutral-700 placeholder-neutral-400 shadow-soft"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSearchQuery('');
                  }
                }}
                aria-label="Effacer la recherche"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-r-2xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <motion.p 
              id="search-results-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-neutral-600 mt-2"
              role="status"
              aria-live="polite"
            >
              {filteredModels.length} résultat{filteredModels.length > 1 ? 's' : ''} pour "{searchQuery}"
            </motion.p>
          )}
        </motion.div>

        {/* Filtres par catégorie */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-800 sr-only">Filtres par catégorie</h2>
          </div>
          <div 
            className="flex flex-wrap gap-3 justify-center"
            role="group"
            aria-labelledby="category-filter-label"
          >
            <div id="category-filter-label" className="sr-only">
              Filtrer les plats par catégorie
            </div>
            {categories.map((category, index) => {
              // Mapping des catégories avec fallback
              const getCategoryDisplay = (cat: string) => {
                if (cat === 'all') return { name: 'Tout', icon: '🍽️' };
                
                const categoryMap: Record<string, { name: string; icon: string }> = {
                  'entrees': { name: 'Entrées', icon: '🥗' },
                  'plats': { name: 'Plats', icon: '🍽️' },
                  'desserts': { name: 'Desserts', icon: '🍰' },
                  'boissons': { name: 'Boissons', icon: '🥤' },
                  'autres': { name: 'Autres', icon: '📦' },
                };
                
                return categoryMap[cat] || { name: cat, icon: '🍽️' };
              };
              
              const categoryInfo = getCategoryDisplay(category);
              const isSelected = selectedCategory === category;
              
              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCategory(category);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Filtrer par ${categoryInfo.name}${isSelected ? ' (actuel)' : ''}`}
                  className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200 font-display flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg font-semibold'
                      : 'bg-white text-gray-800 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{categoryInfo.icon}</span>
                  <span>{categoryInfo.name}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Grille des plats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="grid"
          aria-label="Menu des plats"
        >
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-soft-lg flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                selectedModel?.id === model.id 
                  ? 'border-primary-300 shadow-glow bg-primary-50/50' 
                  : 'border-neutral-200 hover:border-primary-200'
              }`}
              onClick={() => handleModelSelect(model)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleModelSelect(model);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Voir le plat ${model.name} en 3D${model.price ? ` - ${model.price.toFixed(2)}€` : ''}${selectedModel?.id === model.id ? ' (actuellement sélectionné)' : ''}`}
              aria-pressed={selectedModel?.id === model.id}
            >
              {/* Image/Thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-t-2xl overflow-hidden relative">
                {model.thumbnailUrl ? (
                  <LazyImage 
                    src={model.thumbnailUrl} 
                    alt={model.name}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-gradient-to-br from-neutral-100 to-neutral-200">
                    <motion.svg 
                      className="w-16 h-16" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </motion.svg>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge 3D */}
                <div className="absolute top-3 right-3">
                  <motion.span 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-soft backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✨ 3D
                  </motion.span>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-soft"
                  >
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Informations du plat */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg font-display text-neutral-800 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {model.name}
                  </h3>
                  {model.price && (
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-xl font-display text-primary-600">
                      {model.price.toFixed(2)}€
                    </span>
                      <span className="text-xs text-neutral-500 font-medium">TTC</span>
                    </div>
                  )}
                </div>

                {model.shortDescription && (
                  <p className="text-sm mb-4 line-clamp-2 font-body text-neutral-600 leading-relaxed">
                    {model.shortDescription}
                  </p>
                )}

                {/* Tags et allergènes */}
                <div className="flex flex-wrap gap-2 mb-4">
                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                    <>
                      {model.tags.slice(0, 2).map((tagId) => {
                      const tagInfo = getCategoryInfo(tagId as any);
                      return tagInfo ? (
                          <motion.span
                          key={tagId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border border-primary-200"
                        >
                          {tagInfo.name}
                          </motion.span>
                      ) : null;
                    })}
                    </>
                )}

                {/* Allergènes */}
                {model.allergens && model.allergens.length > 0 && (
                    <>
                      {model.allergens.slice(0, 3).map((allergenId) => {
                      const allergenInfo = getAllergenInfo(allergenId);
                      return allergenInfo ? (
                          <motion.span
                          key={allergenId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center w-8 h-8 rounded-full text-sm bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border border-accent-200 justify-center"
                          title={allergenInfo.name}
                        >
                          {allergenInfo.icon}
                          </motion.span>
                      ) : null;
                    })}
                    </>
                  )}
                  </div>

                {/* Boutons d'action */}
                <div className="space-y-3 mt-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-xl font-semibold font-display text-sm transition-all duration-200 shadow-soft hover:shadow-glow flex items-center justify-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModelSelect(model);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{selectedModel?.id === model.id ? 'Fermer la vue 3D' : 'Voir en 3D'}</span>
                  </motion.button>
                  
                  {/* Bouton Ajouter au panier (si POS activé) */}
                  {posEnabled && canOrder && model.price && model.price > 0 && (
                    <div className="flex items-center space-x-2">
                      {/* Boutons quantité si déjà dans le panier */}
                      {isInCart(model.id) ? (
                        <div className="flex items-center space-x-2 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = getItemQuantity(model.id);
                              if (currentQty > 1) {
                                // Trouver l'item dans le panier et décrémenter
                                const cartItem = cart?.items.find(item => item.modelId === model.id);
                                if (cartItem) {
                                  updateQuantity(cartItem.id, currentQty - 1);
                                }
                              } else {
                                // Supprimer du panier
                                const cartItem = cart?.items.find(item => item.modelId === model.id);
                                if (cartItem) {
                                  removeFromCart(cartItem.id);
                                }
                              }
                            }}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="flex-1 text-center font-medium text-sm">
                            {getItemQuantity(model.id)} dans le panier
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = getItemQuantity(model.id);
                              const cartItem = cart?.items.find(item => item.modelId === model.id);
                              if (cartItem) {
                                updateQuantity(cartItem.id, currentQty + 1);
                              }
                            }}
                            disabled={isCartLoading}
                            className="w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(model, 1);
                          }}
                          disabled={isCartLoading}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium font-montserrat disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>{isCartLoading ? 'Ajout...' : `Ajouter • ${model.price.toFixed(2)}€`}</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Message d'erreur panier */}
                  {cartError && (
                    <p className="text-red-600 text-xs mt-1">{cartError}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredModels.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full text-center py-16"
          >
            <div className="glass backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                <motion.svg 
                  className="w-12 h-12 text-primary-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </motion.svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-3 font-display">Aucun plat trouvé</h3>
              <p className="text-neutral-600 mb-6 font-body leading-relaxed">
                {searchQuery 
                  ? `Aucun plat ne correspond à "${searchQuery}". Essayez un autre terme de recherche.`
                  : "Aucun plat ne correspond à cette catégorie."}
              </p>
              
              {/* Actions */}
              <div className="space-y-3">
                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery('')}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 rounded-xl font-semibold font-display text-sm transition-all duration-200 shadow-soft hover:shadow-glow"
                  >
                    Effacer la recherche
                  </motion.button>
                )}
                
                {selectedCategory !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory('all')}
                    className="w-full bg-white hover:bg-neutral-50 text-neutral-700 py-3 rounded-xl font-semibold font-display text-sm transition-all duration-200 shadow-soft border border-neutral-200 hover:border-primary-300"
                  >
                    Voir toutes les catégories
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Visualiseur 3D Modal */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => handleModelSelect(selectedModel)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>{selectedModel.name}</h2>
                  {selectedModel.price && (
                    <p className="font-semibold text-lg font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>
                      {selectedModel.price.toFixed(2)}€
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleModelSelect(selectedModel)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="h-96 relative">
              <ModelViewer 
                src={selectedModel.url}
                alt={selectedModel.name}
                className="w-full h-full"
              />
              
              {/* Hotspots */}
              {selectedModel.hotspotsEnabled && (
                <HotspotViewer
                  hotspotsConfig={selectedModel.hotspotsConfig}
                  enabled={hotspotsEnabled}
                  onHotspotClick={(type, data) => {
                    console.log('Hotspot clicked:', type, data);
                  }}
                />
              )}
              
              {/* Toggle Hotspots */}
              {selectedModel.hotspotsEnabled && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      hotspotsEnabled
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title={hotspotsEnabled ? 'Masquer les hotspots' : 'Afficher les hotspots'}
                  >
                    {hotspotsEnabled ? '👁️' : '🚫'}
                  </button>
                </div>
              )}
            </div>

            {selectedModel.shortDescription && (
              <div className="p-4 border-t border-gray-200">
                <p className="font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>{selectedModel.shortDescription}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Composant Panier */}
      {posEnabled && canOrder && (
        <Cart
          cart={cart}
          config={posConfig || undefined}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
          onClearCart={clearCart}
        />
      )}
    </div>
  );
} 