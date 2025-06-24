'use client';

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import { useModelViews } from "@/hooks/useModelViews";
import Link from "next/link";

interface ModelCardProps {
  model: Model3D;
}

export default function ModelCard({ model }: ModelCardProps) {
  const { views, isLoading: viewsLoading } = useModelViews(model.id);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const hoverVariants = {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getFileFormats = (model: Model3D) => {
    const formats = [];
    if (model.glbUrl) formats.push('GLB');
    if (model.usdzUrl) formats.push('USDZ');
    
    // Fallback vers l'ancien système si pas de nouveaux champs
    if (formats.length === 0) {
      if (model.mimeType.includes('usdz')) return ['USDZ'];
      if (model.mimeType.includes('gltf-binary')) return ['GLB'];
      if (model.mimeType.includes('gltf')) return ['GLTF'];
      return ['Unknown'];
    }
    
    return formats;
  };

  return (
    <Link href={`/models/${model.slug}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={hoverVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
      >
        {/* Preview Area */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {model.thumbnailUrl ? (
            // Afficher l'image de prévisualisation si disponible
            <img
              src={model.thumbnailUrl}
              alt={`Prévisualisation de ${model.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder simple si pas d'image
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Modèle 3D</p>
                <p className="text-xs text-gray-400">{getFileFormats(model).join(' + ')}</p>
              </div>
            </div>
          )}
          
          {/* Format Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {getFileFormats(model).join(' + ')}
            </span>
          </div>

          {/* AR Badge for AR-compatible files */}
          {(model.usdzUrl || model.mimeType === 'model/vnd.usdz+zip' || model.glbUrl || model.mimeType === 'model/gltf-binary') && (
            <div className="absolute top-3 left-3">
              <span 
                className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium"
                title={
                  model.usdzUrl || model.mimeType === 'model/vnd.usdz+zip' 
                    ? 'AR disponible sur iOS/Safari'
                    : 'AR disponible via WebXR sur mobile'
                }
              >
                AR
              </span>
            </div>
          )}

          {/* Views Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewsLoading ? '...' : views}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
              {model.name}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Taille:</span>
              <span className="font-medium">
                {(() => {
                  if (model.glbUrl && model.usdzUrl) {
                    const totalSize = (model.glbFileSize || model.fileSize) + (model.usdzFileSize || 0);
                    return formatFileSize(totalSize);
                  }
                  return formatFileSize(model.fileSize);
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ajouté:</span>
              <span className="font-medium">{formatDate(model.uploadDate)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Voir détails →
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 