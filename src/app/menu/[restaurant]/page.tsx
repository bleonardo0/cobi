'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Model3D } from "@/types/model";
import { Restaurant } from "@/types/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getCategoryInfo } from "@/lib/constants";
import ModelViewer from "@/components/ModelViewer";
import HotspotViewer from "@/components/HotspotViewer";
import { useRestaurantTheme, useApplyTheme } from "@/hooks/useRestaurantTheme";
import { useMenuLanguage } from "@/contexts/MenuLanguageContext";
import { useCart } from "@/hooks/useCart";
import { usePOSConfig } from "@/hooks/usePOSConfig";
import MenuLanguageSelector from "@/components/MenuLanguageSelector";
import Cart from "@/components/Cart";

export default function ModernMenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<Model3D[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hotspotsEnabled, setHotspotsEnabled] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hooks
  const { trackModelView, trackModelViewEnd } = useAnalytics(restaurant?.id);
  const { t } = useMenuLanguage();
  const { config: posConfig, loading: posLoading } = usePOSConfig(restaurant?.id);
  
  // Initialize cart with empty restaurantId if restaurant not loaded yet
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getItemCount, getItemQuantity } = useCart({
    restaurantId: restaurant?.id || restaurantSlug || '',
    config: posConfig
  });

  // Activer le panier par défaut en mode démo
  const canOrder = true; // !posLoading && (posConfig?.isEnabled || true);

  const isEmpty = !cart || cart.items.length === 0;

  // Load data function
  useEffect(() => {
    async function loadData() {
    try {
      setIsLoading(true);
      
        // Fetch restaurant data
        const restaurantResponse = await fetch(`/api/restaurants/by-slug/${restaurantSlug}`);
      if (!restaurantResponse.ok) {
          throw new Error('Restaurant not found');
      }
      const restaurantData = await restaurantResponse.json();
        setRestaurant(restaurantData);

        // Fetch models
      const modelsResponse = await fetch(`/api/restaurants/by-slug/${restaurantSlug}/models`);
      if (!modelsResponse.ok) {
          throw new Error('Failed to load dishes');
      }
      const modelsData = await modelsResponse.json();
        // L'API retourne un objet avec une propriété models
        const modelsList = modelsData.models || modelsData || [];
        setModels(Array.isArray(modelsList) ? modelsList : []);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
    }

    if (restaurantSlug) {
      loadData();
    }
  }, [restaurantSlug]);

  // Group models by category
  const safeModels = Array.isArray(models) ? models : [];
  const groupedModels = safeModels.reduce((acc, model) => {
    const category = model.category || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, Model3D[]>);

  // Filter models based on selected category
  const filteredModels = selectedCategory === 'all' 
    ? safeModels
    : safeModels.filter(model => model.category === selectedCategory);

  // Get all available categories
  const categories = ['all', ...Object.keys(groupedModels || {})];

  // Handler functions
  const handleViewIn3D = (model: Model3D) => {
    console.log('🔄 handleViewIn3D called for model:', model.id, 'restaurant:', restaurant?.id);
    
    if (selectedModel?.id === model.id) {
      setSelectedModel(null);
      if (selectedModel) {
      trackModelViewEnd();
      }
    } else {
      if (selectedModel) {
        trackModelViewEnd();
      }
      setSelectedModel(model);
      trackModelView(model.id);
    }
  };

  const handleAddToCart = (model: Model3D) => {
    if (model.price && model.price > 0) {
      addToCart({
        id: model.id,
        name: model.name,
        price: model.price,
        quantity: 1
      });
    }
  };

  const isInCart = (modelId: string) => {
    return cart?.items.some(item => item.id === modelId) || false;
  };

  const handleCartCheckout = () => {
    console.log('Commande passée:', cart);
    alert('Commande passée ! (Intégration POS à venir)');
    clearCart();
    setIsCartOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600">{t('menu.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Restaurant not found'}
          </h1>
          <p className="text-gray-600">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-30">
        <MenuLanguageSelector />
      </div>

      {/* Restaurant header */}
      <div className="relative">
        <img 
          src={restaurant.ambiance_image_url || '/default-restaurant-ambiance.jpg'} 
          alt={`Ambiance ${restaurant.name}`}
          className="w-full h-48 object-cover rounded-b-xl"
        />
        <div className="absolute inset-0 bg-black/30 rounded-b-xl"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
            <p className="text-white/90">Menu interactif 3D</p>
          </div>
      </div>
        </div>

      {/* Content container */}
      <div className="container mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(categories || []).map((category) => {
            const categoryInfo = getCategoryInfo(category as any);
            const isActive = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-restaurant-primary text-white shadow-sm' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {categoryInfo?.icon} {categoryInfo?.name || category}
              </button>
            );
          })}
        </div>

        {/* Display mode toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                displayMode === 'grid'
                  ? 'bg-restaurant-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cartes
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                displayMode === 'list'
                  ? 'bg-restaurant-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Liste
            </button>
          </div>
        </div>

        {/* Affichage conditionnel : Cartes vs Liste */}
        {displayMode === 'grid' ? (
          /* Affichage en cartes avec images */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredModels || []).map((model) => (
              <div key={model.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-105">
                {/* Image du plat */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {model.thumbnailUrl ? (
                    <img 
                      src={model.thumbnailUrl} 
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p className="text-sm text-gray-500">Image bientôt disponible</p>
                      </div>
                    </div>
                  )}
                  {/* Badge catégorie */}
                  {model.category && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        {getCategoryInfo(model.category as any)?.name || model.category}
                      </span>
                    </div>
                  )}
                  {/* Prix en overlay */}
                  {model.price && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-restaurant-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                        {model.price.toFixed(2)}€
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Contenu de la carte */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
                  
                  {/* Description courte */}
                  {model.shortDescription && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {model.shortDescription}
                    </p>
                  )}
                  
                  {/* Ingrédients (limités) */}
                  {model.ingredients && model.ingredients.length > 0 && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                      {model.ingredients.slice(0, 3).join(', ')}
                      {model.ingredients.length > 3 && '...'}
                    </p>
                  )}
                  
                  {/* Allergènes compacts */}
                  {model.allergens && model.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {model.allergens.slice(0, 3).map((allergen, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600"
                        >
                          ⚠️ {allergen}
                        </span>
                      ))}
                      {model.allergens.length > 3 && (
                        <span className="text-xs text-gray-400">+{model.allergens.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Boutons d'action */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleViewIn3D(model)}
                      className="flex-1 bg-restaurant-primary text-white py-2 px-3 rounded-lg hover:bg-restaurant-primary/90 transition-colors text-sm font-medium"
                    >
                      👁️ 3D
                    </button>
                    {canOrder && model.price && model.price > 0 && (
                      <button
                        onClick={() => handleAddToCart(model)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        🛒 Panier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Affichage en liste détaillée */
          <div className="space-y-4">
            {(filteredModels || []).map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
                      {model.price && (
                        <p className="text-xl font-bold text-restaurant-primary ml-4">
                          {model.price.toFixed(2)}€
                        </p>
                      )}
                    </div>
                    
                    {/* Description */}
                    {model.shortDescription && (
                      <p className="text-gray-600 mb-3 italic">
                        {model.shortDescription}
                      </p>
                    )}
                    
                    {/* Ingrédients */}
                    {model.ingredients && model.ingredients.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ingrédients :</p>
                        <p className="text-sm text-gray-600">
                          {model.ingredients.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {/* Allergènes */}
                    {model.allergens && model.allergens.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Allergènes :</p>
                        <div className="flex flex-wrap gap-1">
                          {model.allergens.map((allergen, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                            >
                              ⚠️ {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Boutons d'action */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewIn3D(model)}
                        className="bg-restaurant-primary text-white px-4 py-2 rounded-full hover:bg-restaurant-primary/90 transition-colors flex items-center gap-2"
                      >
                        👁️ Voir en 3D
                      </button>
                      {canOrder && model.price && model.price > 0 && (
                        <button
                          onClick={() => handleAddToCart(model)}
                          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          🛒 Ajouter au panier
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
        )}

        {/* No dishes message */}
        {(filteredModels || []).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-800">{t('menu.no.results')}</h3>
            <p className="text-gray-600">{t('restaurant.no.dishes.category')}</p>
          </div>
        )}
      </div>

      {/* 3D Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => handleViewIn3D(selectedModel)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{selectedModel.name}</h2>
                  {selectedModel.price && (
                    <p className="font-semibold text-lg text-emerald-600">
                      {selectedModel.price.toFixed(2)}€
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleViewIn3D(selectedModel)}
                  className="text-gray-400 hover:text-gray-600 p-2 -m-2 rounded-full hover:bg-gray-100"
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
              
              {selectedModel.hotspotsEnabled && (
                <HotspotViewer
                  hotspotsConfig={selectedModel.hotspotsConfig}
                  enabled={hotspotsEnabled}
                  onHotspotClick={(type, data) => {
                    console.log('Hotspot clicked:', type, data);
                  }}
                />
              )}
            </div>
          </div>
                </div>
              )}

      {/* Floating cart button */}
      {canOrder && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center z-30"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
            </svg>
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {getItemCount()}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Cart Component */}
      <Cart
        cart={cart}
        config={posConfig}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCartCheckout}
        onClearCart={clearCart}
      />
    </div>
  );
} 