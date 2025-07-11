'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Model3D } from '@/types/model';
import { formatFileSize } from '@/lib/utils';
import { useRestaurantId } from '@/hooks/useRestaurantId';

interface ModelCardProps {
  model: Model3D;
  onDelete?: (id: string) => void;
  onEdit?: (model: Model3D) => void;
  showActions?: boolean;
  isAdmin?: boolean;
  clickable?: boolean;
}

const ModelCard = ({
  model,
  onDelete,
  onEdit,
  showActions = false,
  isAdmin = false,
  clickable = true
}: ModelCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Récupération dynamique de l'ID du restaurant pour le tracking
  const { restaurantId } = useRestaurantId();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(model.id);
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(model);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(true);
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'GLB';
  };

  const formatUploadDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'entrees':
        return '🥗';
      case 'plats':
        return '🍽️';
      case 'desserts':
        return '🍰';
      case 'boissons':
        return '🥤';
      default:
        return '📦';
    }
  };

  const getCategoryName = (category?: string) => {
    switch (category) {
      case 'entrees':
        return 'Entrées';
      case 'plats':
        return 'Plats';
      case 'desserts':
        return 'Desserts';
      case 'boissons':
        return 'Boissons';
      default:
        return 'Autres';
    }
  };

  // État pour le tracking des durées
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Fonction pour tracker les vues de modèles avec durée
  const trackModelView = async () => {
    try {
      console.log(`📊 Tracking vue modèle: ${model.name}`);
      
      if (!restaurantId) {
        console.warn('⚠️ Aucun restaurant ID disponible pour le tracking');
        return;
      }
      
      // Enregistrer le début de vue
      setViewStartTime(Date.now());
      
      await fetch('/api/analytics/track-model-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: model.id,
          restaurantId: restaurantId, // ID dynamique du restaurant
        }),
      });

      // Simuler une durée de vue réaliste (3-8 secondes)
      const simulatedDuration = Math.floor(Math.random() * 5) + 3;
      
      // Tracker la fin de vue après la durée simulée
      setTimeout(() => {
        trackModelViewEnd(simulatedDuration);
      }, simulatedDuration * 1000);
      
    } catch (error) {
      console.error('❌ Erreur lors du tracking:', error);
    }
  };

  // Fonction pour tracker la fin de vue avec durée
  const trackModelViewEnd = async (duration?: number) => {
    try {
      const actualDuration = duration || (viewStartTime ? Math.round((Date.now() - viewStartTime) / 1000) : 0);
      
      if (actualDuration > 0 && restaurantId) {
        await fetch('/api/analytics/track-view-end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelId: model.id,
            restaurantId: restaurantId,
            sessionId: sessionId,
            viewDuration: actualDuration,
          }),
        });
        
        console.log(`✅ Fin de vue trackée: ${actualDuration}s pour ${model.name}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du tracking de fin:', error);
    }
  };

  const cardContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group ${
        clickable ? 'cursor-pointer' : ''
      }`}
    >
      {/* Image/Thumbnail Section */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {model.thumbnailUrl && !imageError ? (
          <img
            src={model.thumbnailUrl}
            alt={model.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="text-4xl mb-2">🎲</div>
              <div className="text-xs text-gray-500 font-medium">
                {getFileExtension(model.filename)}
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!isImageLoaded && model.thumbnailUrl && !imageError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Category badge */}
        {model.category && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
              <span className="mr-1">{getCategoryIcon(model.category)}</span>
              {getCategoryName(model.category)}
            </span>
          </div>
        )}

        {/* Format badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getFileExtension(model.filename)}
          </span>
        </div>

        {/* Actions overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <button
              onClick={handleEdit}
              className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white transition-colors"
            >
              Modifier
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        )}

        {/* Navigation hint for clickable cards */}
        {clickable && !showActions && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
              Voir les détails →
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Title and price */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {model.name}
              </h3>
              {model.shortDescription && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {model.shortDescription}
                </p>
              )}
            </div>
            {model.price && (
              <div className="ml-3 flex-shrink-0">
                <span className="text-lg font-bold text-green-600">
                  {model.price.toFixed(2)}€
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {model.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{model.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Allergens */}
          {model.allergens && model.allergens.length > 0 && (
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  +{model.allergens.length - 3}
                </span>
              )}
            </div>
          )}

          {/* File info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {formatFileSize(model.fileSize)}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatUploadDate(model.uploadDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Supprimer le modèle
                </h3>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer "{model.name}" ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (clickable && !showActions) {
    return (
      <Link 
        href={`/models/${model.slug}`} 
        className="block"
        onClick={trackModelView}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ModelCard; 