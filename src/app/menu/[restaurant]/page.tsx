'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { Restaurant } from "@/types/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePOSConfig } from "@/hooks/usePOSConfig";
import { useCart } from "@/hooks/useCart";
import { getCategoryInfo, getAllergenInfo } from "@/lib/constants";
import ModelViewer from "@/components/ModelViewer";
import HotspotViewer from "@/components/HotspotViewer";
import Cart from "@/components/Cart";

export default function MenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hotspotsEnabled, setHotspotsEnabled] = useState(true);

  const { trackModelView, trackModelViewEnd, trackSessionStart, trackMenuView } = useAnalytics(restaurant?.id);
  
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
    fetchRestaurantData();
  }, [restaurantSlug]);

  useEffect(() => {
    if (restaurant) {
      console.log('🔍 Restaurant chargé:', restaurant);
      console.log('🔍 Restaurant ID:', restaurant.id);
      trackSessionStart();
      trackMenuView(); // Track la vue de menu
    }
  }, [restaurant]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les données du restaurant
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantSlug}`);
      if (!restaurantResponse.ok) {
        throw new Error('Restaurant non trouvé');
      }
      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData.restaurant);

      // Récupérer les modèles du restaurant
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

  const handleModelSelect = (model: Model3D) => {
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
  };

  const groupedModels = models.reduce((acc, model) => {
    const category = model.category || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, Model3D[]>);

  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(model => model.category === selectedCategory);

  const categories = ['all', ...Object.keys(groupedModels)];

  // Handlers pour le panier
  const handleCheckout = () => {
    // TODO: Rediriger vers la page de checkout
    console.log('Checkout avec panier:', cart);
    alert('Fonctionnalité de checkout à implémenter');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-teal-800 mb-2">Restaurant non trouvé</h1>
          <p className="text-teal-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 font-montserrat">
      {/* Header du restaurant */}
      <div 
        className="text-white py-4 sm:py-8"
        style={{ 
          background: restaurant.primaryColor || '#0a5b48' 
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold font-montserrat">{restaurant.name}</h1>
              <p className="text-white mt-1 font-montserrat opacity-90 text-sm sm:text-base">
                {restaurant.description || 'Découvrez notre menu en 3D - Une expérience culinaire immersive'}
                {posEnabled && canOrder && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                    📱 Commande en ligne
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
              {/* Toggle Hotspots */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white hidden sm:inline">Hotspots</span>
                <span className="text-xs font-medium text-white sm:hidden">Hotspots</span>
                <button
                  onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hotspotsEnabled ? 'bg-green-600' : 'bg-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hotspotsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Bouton Panier */}
              {posEnabled && canOrder && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 text-sm sm:text-base min-h-[44px]"
                  style={{ color: restaurant.primaryColor || '#0a5b48' }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6 0H9.5" />
                  </svg>
                  <span className="hidden sm:inline">Panier</span>
                  {!isCartEmpty && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Filtres par catégorie */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category) => {
              const categoryInfo = category === 'all' 
                ? { name: 'Tout', icon: '🍽️' }
                : getCategoryInfo(category as any);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-colors font-montserrat min-h-[44px] ${
                    selectedCategory === category
                      ? 'text-white shadow-md'
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                  style={selectedCategory === category 
                    ? { backgroundColor: restaurant.primaryColor || '#0a5b48' }
                    : { color: restaurant.primaryColor || '#0a5b48' }
                  }
                >
                  <span className="flex items-center space-x-1">
                    <span>{categoryInfo?.icon}</span>
                    <span>{categoryInfo?.name || category}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des plats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredModels.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
                selectedModel?.id === model.id 
                  ? 'shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              style={selectedModel?.id === model.id 
                ? { borderColor: restaurant.primaryColor || '#0a5b48' } 
                : {}
              }
              onClick={() => handleModelSelect(model)}
            >
              {/* Image/Thumbnail */}
              <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                {model.thumbnailUrl ? (
                  <img 
                    src={model.thumbnailUrl} 
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                
                {/* Badge 3D */}
                <div className="absolute top-2 right-2">
                  <span 
                    className="text-white text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: restaurant.primaryColor || '#0a5b48' }}
                  >
                    3D
                  </span>
                </div>
              </div>

              {/* Informations du plat */}
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-base sm:text-lg font-montserrat flex-1 min-w-0 pr-2" style={{ color: restaurant.primaryColor || '#0a5b48' }}>{model.name}</h3>
                  {model.price && (
                    <span className="font-bold text-base sm:text-lg font-montserrat flex-shrink-0" style={{ color: restaurant.primaryColor || '#0a5b48' }}>
                      {model.price.toFixed(2)}€
                    </span>
                  )}
                </div>

                {model.shortDescription && (
                  <p className="text-sm mb-3 line-clamp-2 font-montserrat" style={{ color: restaurant.primaryColor || '#0a5b48' }}>
                    {model.shortDescription}
                  </p>
                )}

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {model.tags.slice(0, 3).map((tagId) => {
                      const tagInfo = getCategoryInfo(tagId as any);
                      return tagInfo ? (
                        <span
                          key={tagId}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tagInfo.color}`}
                        >
                          {tagInfo.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Allergènes */}
                {model.allergens && model.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {model.allergens.slice(0, 4).map((allergenId) => {
                      const allergenInfo = getAllergenInfo(allergenId);
                      return allergenInfo ? (
                        <span
                          key={allergenId}
                          className="inline-flex items-center text-xs bg-red-50 text-red-700 border border-red-200 rounded px-1"
                          title={allergenInfo.name}
                        >
                          {allergenInfo.icon}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="mt-3 space-y-2">
                  <button 
                    className="w-full bg-teal-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium font-montserrat min-h-[44px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModelSelect(model);
                    }}
                  >
                    {selectedModel?.id === model.id ? 'Fermer la vue 3D' : 'Voir en 3D'}
                  </button>
                  
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
                            className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="w-10 h-10 sm:w-8 sm:h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full bg-green-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium font-montserrat disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[44px]"
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
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>Aucun plat trouvé</h3>
            <p className="font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>Aucun plat ne correspond à cette catégorie.</p>
          </div>
        )}
      </div>

      {/* Visualiseur 3D Modal */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => handleModelSelect(selectedModel)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-lg sm:rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-lg sm:text-xl font-bold font-montserrat truncate" style={{ color: 'rgb(10, 91, 72)' }}>{selectedModel.name}</h2>
                  {selectedModel.price && (
                    <p className="font-semibold text-base sm:text-lg font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>
                      {selectedModel.price.toFixed(2)}€
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleModelSelect(selectedModel)}
                  className="text-gray-400 hover:text-gray-600 p-2 -m-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="h-64 sm:h-96 relative">
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
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <button
                    onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                    className={`p-2 rounded-lg transition-colors min-h-[44px] ${
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
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <p className="font-montserrat text-sm sm:text-base" style={{ color: 'rgb(10, 91, 72)' }}>{selectedModel.shortDescription}</p>
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