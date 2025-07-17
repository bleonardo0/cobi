'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UploadForm from "@/components/UploadForm";
import { Model3D } from "@/types/model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/ClerkAuthProvider";

export default function UploadPage() {
  const [uploadedModels, setUploadedModels] = useState<Model3D[]>([]);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);

  // Vérifier l'authentification et récupérer le restaurant de l'utilisateur
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Récupérer l'ID du restaurant de l'utilisateur connecté
    if (user.restaurantId) {
      setCurrentRestaurantId(user.restaurantId);
    } else {
      // Fallback : utiliser bella-vita par défaut
      setCurrentRestaurantId('restaurant-bella-vita-1');
    }
  }, [user, authLoading, router]);

  const handleUploadSuccess = (model: Model3D) => {
    setUploadedModels(prev => [...prev, model]);
  };

  const pageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageVariants}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Télécharger un modèle</h1>
              <p className="text-gray-600 mt-1">Ajoutez vos modèles 3D GLB ou GLTF à la galerie</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la galerie
          </Link>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageVariants}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <UploadForm 
            onUploadSuccess={handleUploadSuccess}
            restaurantId={currentRestaurantId || undefined}
          />
        </motion.div>

        {/* Modèles uploadés récemment */}
        {uploadedModels.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Modèles uploadés récemment
            </h2>
            <div className="space-y-3">
              {uploadedModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-500">
                        {model.category} • {model.tags?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">
                      {model.price ? `${model.price}€` : 'Gratuit'}
                    </span>
                    <Link
                      href={`/models/${model.slug}`}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 