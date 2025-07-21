'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [isHovered, setIsHovered] = useState(false);
  const [weeklyViews, setWeeklyViews] = useState(0);
  
  // Récupération dynamique de l'ID du restaurant pour le tracking
  const { restaurantId } = useRestaurantId();
  const router = useRouter();

  // Récupérer les vraies données de vues hebdomadaires
  useEffect(() => {
    const fetchWeeklyViews = async () => {
      if (!restaurantId || !model.id) {
        // Si pas de restaurant ID, on affiche 0 vues sans faire d'appel API
        setWeeklyViews(0);
        return;
      }
      
      try {
        const response = await fetch(`/api/analytics/model-views/${model.id}?restaurantId=${restaurantId}&period=week`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setWeeklyViews(data.views || 0);
          } else {
            // Fallback vers 0 si pas de données
            setWeeklyViews(0);
          }
        } else {
          // En cas d'erreur, ne pas afficher de données
          setWeeklyViews(0);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des vues:', error);
        setWeeklyViews(0);
      }
    };

    fetchWeeklyViews();
  }, [restaurantId, model.id]);

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

  const getCategoryInfo = (category?: string) => {
    const categories = {
      'entrees': { icon: '🥗', name: 'Entrées', color: 'bg-emerald-100 text-emerald-800' },
      'plats': { icon: '🍽️', name: 'Plats', color: 'bg-primary-100 text-primary-800' },
      'desserts': { icon: '🍰', name: 'Desserts', color: 'bg-accent-100 text-accent-800' },
      'boissons': { icon: '🧃', name: 'Boissons', color: 'bg-warning-100 text-warning-800' },
      'menus-speciaux': { icon: '✨', name: 'Menus Spéciaux', color: 'bg-yellow-100 text-yellow-800' }
    };
    return categories[category as keyof typeof categories] || { 
      icon: '📦', 
      name: 'Autres', 
      color: 'bg-neutral-100 text-neutral-800' 
    };
  };

  const trackModelView = () => {
    // Tracker la vue du modèle
    if (restaurantId) {
      fetch(`/api/analytics/track-model-view/${model.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      }).catch(console.error);
    }
  };

  const handleCardClick = () => {
    if (clickable && !showActions) {
      trackModelView();
      // Rediriger vers la page du modèle avec Next.js Router
      router.push(`/models/${model.slug}`);
    }
  };

  const cardContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-soft transition-all duration-300 ${
        clickable ? 'cursor-pointer' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -2 }}
    >
      {/* Image/Thumbnail Section */}
      <div className="relative aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
        {model.thumbnailUrl && !imageError ? (
          <motion.img
            src={model.thumbnailUrl}
            alt={model.name}
            className="w-full h-full object-cover rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-60">🎲</div>
              <div className="text-sm text-neutral-500 font-medium px-3 py-1 bg-white/80 rounded-full">
                {getFileExtension(model.filename)}
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!isImageLoaded && model.thumbnailUrl && !imageError && (
          <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        )}

        {/* Category badge */}
        {model.category && (
          <div className="absolute top-2 left-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm shadow-sm ${getCategoryInfo(model.category).color}`}
            >
              <span className="mr-1">{getCategoryInfo(model.category).icon}</span>
              {getCategoryInfo(model.category).name}
            </motion.div>
          </div>
        )}

        {/* GLB Format badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-full font-medium bg-gray-800 text-white backdrop-blur-sm shadow-sm">
            {getFileExtension(model.filename)}
          </span>
        </div>

        {/* Weekly views badge */}
        {weeklyViews > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 backdrop-blur-sm shadow-sm border border-green-200">
              +{weeklyViews} vues cette semaine
            </span>
          </div>
        )}

        {/* Actions overlay */}
        <AnimatePresence>
          {showActions && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleEdit}
                className="bg-white/90 text-neutral-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors shadow-soft"
              >
                Modifier
              </motion.button>
              {isAdmin && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-soft"
                >
                  Supprimer
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View hint for clickable cards */}
        <AnimatePresence>
          {clickable && !showActions && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6"
            >
              <div className="bg-white/90 text-neutral-800 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm shadow-soft">
                Voir en 3D & AR 🎉
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Title and price */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-neutral-900 truncate">
                {model.name}
              </h3>
              {model.shortDescription && (
                <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mt-1">
                  {model.shortDescription}
                </p>
              )}
            </div>
            {model.price && (
              <div className="ml-4 flex-shrink-0">
                <span className="text-lg font-bold text-emerald-600">
                  {model.price.toFixed(2)}€
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:ring-1 hover:ring-primary-200 transition-all"
                >
                  {tag}
                </motion.span>
              ))}
              {model.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
                  +{model.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Allergens */}
          {model.allergens && model.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {model.allergens.slice(0, 3).map((allergen, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  ⚠️ {allergen}
                </motion.span>
              ))}
              {model.allergens.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                  +{model.allergens.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          {clickable && !showActions && (
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/models/${model.slug}`}
                onClick={(e) => {
                  e.stopPropagation(); // Éviter la propagation vers handleCardClick
                  trackModelView();
                }}
                className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-accent-600 transition-all text-center"
              >
                Voir en 3D
              </Link>

            </div>
          )}

          {/* File info */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center space-x-3 text-xs text-neutral-500">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {formatFileSize(model.fileSize)}
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatUploadDate(model.uploadDate)}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-neutral-500 font-medium">3D & AR</span>
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
              className="bg-white rounded-lg p-6 max-w-sm w-full shadow-soft-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Supprimer le modèle
                </h3>
                <p className="text-neutral-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer "{model.name}" ? Cette action est irréversible.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-neutral-100 text-neutral-800 py-2 px-4 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (clickable && !showActions) {
    return (
      <div className="block">
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

export default ModelCard; 