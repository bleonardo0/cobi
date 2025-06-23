'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { Restaurant } from "@/types/analytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getCategoryInfo, getAllergenInfo } from "@/lib/constants";
import ModelViewer from "@/components/ModelViewer";

export default function MenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurant as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [models, setModels] = useState<Model3D[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { trackModelView, trackModelViewEnd, trackSessionStart } = useAnalytics(restaurant?.id);

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantSlug]);

  useEffect(() => {
    if (restaurant) {
      trackSessionStart();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant non trouvé</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du restaurant */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8"
        style={restaurant.primaryColor ? { 
          background: `linear-gradient(to right, ${restaurant.primaryColor}, ${restaurant.secondaryColor || restaurant.primaryColor})` 
        } : {}}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4">
            {restaurant.logo && (
              <img 
                src={restaurant.logo} 
                alt={restaurant.name}
                className="w-16 h-16 rounded-full bg-white p-2"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-blue-100 mt-1">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtres par catégorie */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const categoryInfo = category === 'all' 
                ? { name: 'Tout', icon: '🍽️' }
                : getCategoryInfo(category as any);
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {categoryInfo?.icon} {categoryInfo?.name || category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des plats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
                selectedModel?.id === model.id 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
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
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    3D
                  </span>
                </div>
              </div>

              {/* Informations du plat */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{model.name}</h3>
                  {model.price && (
                    <span className="text-blue-600 font-bold text-lg">
                      {model.price.toFixed(2)}€
                    </span>
                  )}
                </div>

                {model.shortDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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

                {/* Bouton d'action */}
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  {selectedModel?.id === model.id ? 'Fermer la vue 3D' : 'Voir en 3D'}
                </button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun plat trouvé</h3>
            <p className="text-gray-600">Aucun plat ne correspond à cette catégorie.</p>
          </div>
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
                  <h2 className="text-xl font-bold text-gray-900">{selectedModel.name}</h2>
                  {selectedModel.price && (
                    <p className="text-blue-600 font-semibold text-lg">
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
            
            <div className="h-96">
              <ModelViewer 
                src={selectedModel.glbUrl || selectedModel.usdzUrl || selectedModel.url}
                alt={selectedModel.name}
                glbSrc={selectedModel.glbUrl}
                usdzSrc={selectedModel.usdzUrl}
                className="w-full h-full"
              />
            </div>

            {selectedModel.shortDescription && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-gray-700">{selectedModel.shortDescription}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 