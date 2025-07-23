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
import MenuLanguageSelector from "@/components/MenuLanguageSelector";

// Nouveau composant de carte de plat moderne
interface ModernDishCardProps {
  model: Model3D;
  restaurant: Restaurant;
  onViewIn3D: (model: Model3D) => void;
}

function ModernDishCard({ model, restaurant, onViewIn3D }: ModernDishCardProps) {
  const { t } = useMenuLanguage();
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:scale-105">
      {/* Image du plat */}
      <div className="relative">
        <img 
          src={model.thumbnailUrl || '/placeholder-dish.jpg'} 
          alt={model.name}
          className="w-full h-48 object-cover"
        />
        {/* Badge catégorie optionnel */}
        {model.category && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white/90 text-gray-800 text-xs rounded-full font-medium">
              {getCategoryInfo(model.category as any)?.name || model.category}
            </span>
          </div>
        )}
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-2">{model.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {model.shortDescription || t('restaurant.dish.description.default')}
        </p>
        
        {/* Ingrédients */}
        {model.ingredients && model.ingredients.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <span className="mr-1">🥘</span>
              {t('model.ingredients')}
            </div>
            <div className="flex flex-wrap gap-1">
              {model.ingredients.slice(0, 4).map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                >
                  🌿 {ingredient}
                </span>
              ))}
              {model.ingredients.length > 4 && (
                <span className="text-xs text-green-600 italic font-medium">
                  +{model.ingredients.length - 4} {t('model.ingredients').toLowerCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Allergènes */}
        {model.allergens && model.allergens.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {t('model.allergens')}
            </div>
            <div className="flex flex-wrap gap-1">
              {model.allergens.slice(0, 3).map((allergen, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                >
                  ⚠️ {allergen}
                </span>
              ))}
              {model.allergens.length > 3 && (
                <span className="text-xs text-red-600 italic font-medium">
                  +{model.allergens.length - 3} {t('model.allergens').toLowerCase()}
                </span>
              )}
            </div>
          </div>
        )}

        <p className="text-base font-bold text-restaurant-primary mb-3">
          {model.price ? `${model.price.toFixed(2)}€` : t('model.price.on.request')}
        </p>
        <button 
          onClick={() => onViewIn3D(model)}
          className="mt-2 w-full bg-restaurant-primary text-white text-sm py-2 rounded-full hover:bg-restaurant-primary transition-colors"
        >
          {t('model.view.3d')}
        </button>
      </div>
    </div>
  );
}

export default function ModernMenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  const { t } = useMenuLanguage();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hotspotsEnabled, setHotspotsEnabled] = useState(true);

  const { trackModelView, trackModelViewEnd, trackSessionStart, trackMenuView } = useAnalytics(restaurant?.id);

  // Système de thème restaurant
  const theme = useRestaurantTheme(restaurantSlug);
  useApplyTheme(theme);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantSlug]);

  useEffect(() => {
    if (restaurant) {
      trackSessionStart();
      trackMenuView();
    }
  }, [restaurant]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les données du restaurant
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantSlug}`);
      if (!restaurantResponse.ok) {
        throw new Error(t('restaurant.not.found'));
      }
      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData.restaurant);

      // Récupérer les modèles du restaurant
      const modelsResponse = await fetch(`/api/restaurants/by-slug/${restaurantSlug}/models`);
      if (!modelsResponse.ok) {
        throw new Error(t('restaurant.error.loading'));
      }
      const modelsData = await modelsResponse.json();
      setModels(modelsData.models);
      
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : t('restaurant.error.unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewIn3D = (model: Model3D) => {
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

  // Grouper les modèles par catégorie
  const groupedModels = models.reduce((acc, model) => {
    const category = model.category || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {} as Record<string, Model3D[]>);

  // Filtrer les modèles selon la catégorie sélectionnée
  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(model => model.category === selectedCategory);

  // Obtenir toutes les catégories disponibles
  const categories = ['all', ...Object.keys(groupedModels)];

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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('restaurant.not.found')}</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sélecteur de langue fixe */}
      <div className="fixed top-4 right-4 z-30">
        <MenuLanguageSelector />
      </div>

      {/* Image d'ambiance en haut */}
      <div className="relative">
        <img 
          src={restaurant.ambiance_image_url || '/default-restaurant-ambiance.jpg'} 
          alt={`Ambiance ${restaurant.name}`}
          className="w-full h-48 object-cover rounded-b-xl"
        />
        {/* Overlay gradient pour le texte */}
        <div className="absolute inset-0 bg-black/30 rounded-b-xl"></div>
      </div>

      {/* Conteneur principal centré */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Informations du restaurant */}
        <div className="text-center mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-1">
            {restaurant.description || t('restaurant.menu.description')}
          </p>
          <p className="text-sm italic text-gray-500">
            🍽️ {t('restaurant.menu.3d.available')}
          </p>
        </div>

        {/* Filtres de catégories */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 mb-8 sticky top-4 z-10 bg-gray-50 py-4 rounded-lg">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const categoryInfo = category === 'all' 
              ? { name: t('menu.all'), icon: '🍽️' }
              : getCategoryInfo(category as any);
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1 rounded-full border text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-restaurant-primary text-white border-restaurant-primary'
                    : 'text-gray-700 border-gray-300 hover:bg-restaurant-primary-light hover:border-restaurant-primary hover:text-restaurant-primary'
                }`}
              >
                {categoryInfo?.name || category}
              </button>
            );
          })}
        </div>

        {/* Grille des plats - responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          {filteredModels.map((model) => (
            <ModernDishCard
              key={model.id}
              model={model}
              restaurant={restaurant}
              onViewIn3D={handleViewIn3D}
            />
          ))}
        </div>

        {/* Message si aucun plat */}
        {filteredModels.length === 0 && (
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

      {/* Modal 3D */}
      {selectedModel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => handleViewIn3D(selectedModel)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
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
                    title={hotspotsEnabled ? t('model.hotspots.hide') : t('model.hotspots.show')}
                  >
                    {hotspotsEnabled ? '👁️' : '🚫'}
                  </button>
                </div>
              )}
            </div>

            {selectedModel.shortDescription && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-gray-700">{selectedModel.shortDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 