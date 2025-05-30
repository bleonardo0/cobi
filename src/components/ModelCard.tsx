'use client';

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import ModelViewer from "./ModelViewer";

interface ModelCardProps {
  model: Model3D;
}

export default function ModelCard({ model }: ModelCardProps) {
  const modelViewerRef = useRef<HTMLElement>(null);
  const hiddenModelViewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Dynamically import model-viewer for client-side only
    import('@google/model-viewer').then(() => {
      // model-viewer is now loaded
    });
  }, []);

  const handleARClick = () => {
    // Détermine quelle référence utiliser selon l'affichage
    const activeModelViewer = model.thumbnailUrl ? hiddenModelViewerRef.current : modelViewerRef.current;
    
    if (activeModelViewer) {
      try {
        (activeModelViewer as HTMLElement & { activateAR: () => void }).activateAR();
      } catch (error) {
        console.error('Erreur lors de l\'activation AR:', error);
        // Fallback: rediriger vers la page de détail où le modèle 3D est toujours visible
        window.location.href = `/models/${model.slug}`;
      }
    }
  };

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

  const getFileFormat = (mimeType: string) => {
    if (mimeType.includes('usdz')) return 'USDZ';
    if (mimeType.includes('gltf-binary')) return 'GLB';
    if (mimeType.includes('gltf')) return 'GLTF';
    return 'Unknown';
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Model Viewer */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        {model.thumbnailUrl ? (
          // Afficher l'image de prévisualisation si disponible
          <div className="relative w-full h-full">
            <img
              src={model.thumbnailUrl}
              alt={`Prévisualisation de ${model.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback vers le modèle 3D si l'image ne charge pas
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const modelViewer = target.nextElementSibling as HTMLElement;
                if (modelViewer) {
                  modelViewer.style.display = 'block';
                }
              }}
            />
            <ModelViewer
              ref={hiddenModelViewerRef}
              src={model.url}
              alt={model.name}
              className="w-full h-full hidden"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                display: 'none',
              }}
            />
          </div>
        ) : (
          // Fallback vers le modèle 3D si pas d'image
          <ModelViewer
            ref={modelViewerRef}
            src={model.url}
            alt={model.name}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
            }}
          />
        )}
        
        {/* AR Button for USDZ files */}
        {model.mimeType === 'model/vnd.usdz+zip' && (
          <button
            onClick={handleARClick}
            className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            AR
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1">
            {model.name}
          </h3>
          <span className="ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[0.6rem] sm:text-xs rounded-full font-medium">
            {getFileFormat(model.mimeType)}
          </span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Taille:</span>
            <span className="font-medium">{formatFileSize(model.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ajouté:</span>
            <span className="font-medium">{formatDate(model.uploadDate)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/models/${model.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
          >
            Voir détails →
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 