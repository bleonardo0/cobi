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
    visible: { opacity: 1, y: 0 }
  };

  const hoverVariants = {
    scale: 1.02
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
        className="card-modern card-hover overflow-hidden cursor-pointer animate-scale-in h-96 flex flex-col"
      >
        {/* Preview Area */}
        <div className="relative h-56 gradient-bg-soft flex-shrink-0">
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
              <div className="text-center animate-pulse-soft">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                     style={{ backgroundColor: 'rgba(30, 64, 175, 0.1)' }}>
                  <svg
                    className="w-10 h-10"
                    style={{ color: 'var(--color-primary)' }}
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
                <p className="text-base font-semibold mb-1">Modèle 3D</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {getFileFormats(model).join(' + ')}
                </p>
              </div>
            </div>
          )}
          
          {/* Format Badge */}
          <div className="absolute top-3 right-3">
            <span className="glass-effect px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}>
              {getFileFormats(model).join(' + ')}
            </span>
          </div>

          {/* AR Badge for AR-compatible files */}
          {(model.usdzUrl || model.mimeType === 'model/vnd.usdz+zip' || model.glbUrl || model.mimeType === 'model/gltf-binary') && (
            <div className="absolute top-3 left-3">
              <span 
                className="text-white px-2.5 py-1.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: 'var(--color-primary)' }}
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
            <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewsLoading ? '...' : views}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold line-clamp-2 flex-1">
              {model.name}
            </h3>
          </div>

          <div className="space-y-2 text-sm mb-4 flex-1">
            <div className="flex justify-between">
              <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Taille:
              </span>
              <span className="font-semibold">
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
              <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Ajouté:
              </span>
              <span className="font-semibold">{formatDate(model.uploadDate)}</span>
            </div>
          </div>

          <div className="pt-3 border-t mt-auto" style={{ borderColor: 'var(--color-bg-secondary)' }}>
            <div className="inline-flex items-center font-semibold text-sm transition-colors hover:underline"
                 style={{ color: 'var(--color-primary)' }}>
              Voir détails →
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 