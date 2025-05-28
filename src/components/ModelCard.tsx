'use client';

import { Model3D } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface ModelCardProps {
  model: Model3D;
  index?: number;
}

export default function ModelCard({ model, index = 0 }: ModelCardProps) {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import model-viewer for client-side only
    import('@google/model-viewer').then(() => {
      // model-viewer is now loaded
    });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <motion.div
        variants={hoverVariants}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
      >
        {/* Model Viewer */}
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
          <model-viewer
            ref={modelViewerRef}
            src={model.url}
            alt={model.name}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            ios-src={model.mimeType === 'model/vnd.usdz+zip' ? model.url : undefined}
            className="w-full h-full"
            loading="lazy"
            reveal="interaction"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
            }}
          >
            <div slot="progress-bar" className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </model-viewer>
          
          {/* AR Button */}
          {model.mimeType === 'model/vnd.usdz+zip' && (
            <button
              className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-black/80 transition-colors"
              onClick={() => {
                if (modelViewerRef.current) {
                  modelViewerRef.current.activateAR();
                }
              }}
            >
              AR
            </button>
          )}
        </div>

        {/* Model Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {model.name}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {model.mimeType.includes('usdz') ? 'USDZ' : 'GLB'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {formatFileSize(model.fileSize)}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(model.uploadDate).toLocaleDateString('fr-FR')}
            </span>
            
            <Link
              href={`/models/${model.slug}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Voir détails →
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 