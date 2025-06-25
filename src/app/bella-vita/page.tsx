'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import ModelViewer from "@/components/ModelViewer";

// Données de test pour La Bella Vita
const mockModels = [
  {
    id: '1',
    name: 'Pizza Margherita',
    price: 22.73,
    shortDescription: 'Pizza traditionnelle avec une pâte fine et croustillante',
    thumbnailUrl: '/models/pizza-thumb.jpg',
    glbUrl: '/models/Pizza.glb',
    category: 'plats'
  },
  {
    id: '2',
    name: 'Tarte au Cacao',
    price: 15.97,
    shortDescription: 'Plat délicieux préparé avec soin par nos chefs',
    thumbnailUrl: '/models/tarte-thumb.jpg',
    glbUrl: '/models/Tarte.glb',
    category: 'desserts'
  },
  {
    id: '3',
    name: 'Tarte à l\'Abricot',
    price: 9.90,
    shortDescription: 'Délicieuse tarte à l\'abricot du jardin',
    thumbnailUrl: '/models/abricot-thumb.jpg',
    glbUrl: '/models/Abricot.glb',
    category: 'desserts'
  }
];

const categories = [
  { id: 'all', name: 'Tout', icon: '🍽️' },
  { id: 'plats', name: 'Plats', icon: '🍕' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'autres', name: 'Autres', icon: '🥗' }
];

export default function BellaVitaPage() {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredModels = selectedCategory === 'all' 
    ? mockModels 
    : mockModels.filter(model => model.category === selectedCategory);

  const handleModelSelect = (model: any) => {
    if (selectedModel?.id === model.id) {
      setSelectedModel(null);
    } else {
      setSelectedModel(model);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 font-montserrat">
      {/* Header du restaurant */}
      <div 
        className="text-white py-8"
        style={{ 
          background: 'rgb(10, 91, 72)' 
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold font-montserrat">La Bella Vita</h1>
              <p className="text-white mt-1 font-montserrat opacity-90">Découvrez notre menu en 3D - Une expérience culinaire immersive</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filtres par catégorie */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-montserrat ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
                style={selectedCategory !== category.id ? { color: 'rgb(10, 91, 72)' } : {}}
              >
                {category.icon} {category.name}
              </button>
            ))}
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
                  ? 'border-teal-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleModelSelect(model)}
            >
              {/* Image/Thumbnail */}
              <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
                {/* Badge 3D */}
                <div className="absolute top-2 right-2">
                  <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    3D
                  </span>
                </div>
              </div>

              {/* Informations du plat */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>{model.name}</h3>
                  <span className="font-bold text-lg font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>
                    {model.price.toFixed(2)}€
                  </span>
                </div>

                <p className="text-sm mb-3 line-clamp-2 font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>
                  {model.shortDescription}
                </p>

                {/* Bouton d'action */}
                <button className="w-full mt-3 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium font-montserrat">
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
                  <p className="font-semibold text-lg font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>
                    {selectedModel.price.toFixed(2)}€
                  </p>
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
                src={selectedModel.glbUrl}
                alt={selectedModel.name}
                className="w-full h-full"
              />
            </div>

            <div className="p-4 border-t border-gray-200">
              <p className="font-montserrat" style={{ color: 'rgb(10, 91, 72)' }}>{selectedModel.shortDescription}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 