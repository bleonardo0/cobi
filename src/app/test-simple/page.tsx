'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TestSimplePage() {
  const [loadingStates, setLoadingStates] = useState({
    astronaut: true,
    werewolfProxy: true,
    werewolfDirect: true
  });

  const testModels = [
    {
      id: 'astronaut',
      name: 'Astronaute Google (Référence)',
      description: 'Modèle GLB officiel de Google pour tester la compatibilité de base',
      src: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      type: 'GLB',
      status: 'reference'
    },
    {
      id: 'werewolfProxy',
      name: 'Werewolf via Proxy Next.js',
      description: 'Test du modèle via le proxy Next.js pour éviter les problèmes CORS',
      src: '/api/proxy/models/Werewolf_Warrior-1748705750086-r7afwr-1748708260428-gfsxd2.glb',
      type: 'GLB',
      status: 'testing'
    },
    {
      id: 'werewolfDirect',
      name: 'Werewolf URL Supabase Directe',
      description: 'Test avec URL Supabase directe pour comparer les performances',
      src: 'https://cwrivrxejzesoyszhggz.supabase.co/storage/v1/object/public/models-3d/models/Werewolf_Warrior-1748705750086-r7afwr-1748708260428-gfsxd2.glb',
      type: 'GLB',
      status: 'testing'
    }
  ];

  useEffect(() => {
    // Import model-viewer dynamically
    import('@google/model-viewer').then(() => {
      console.log('✅ Model viewer loaded');
      
      // Add global event listeners for all model-viewer elements
      const handleModelLoad = (event: any) => {
        const modelViewer = event.target;
        const src = modelViewer.getAttribute('src');
        console.log('✅ Model loaded:', src);
        
        // Update loading state based on src
        if (src?.includes('Astronaut.glb')) {
          setLoadingStates(prev => ({ ...prev, astronaut: false }));
        } else if (src?.includes('proxy')) {
          setLoadingStates(prev => ({ ...prev, werewolfProxy: false }));
        } else if (src?.includes('supabase')) {
          setLoadingStates(prev => ({ ...prev, werewolfDirect: false }));
        }
      };

      const handleModelError = (event: any) => {
        const modelViewer = event.target;
        const src = modelViewer.getAttribute('src');
        console.error('❌ Model error:', src, event);
      };

      // Listen for model-viewer events globally
      document.addEventListener('load', handleModelLoad, true);
      document.addEventListener('error', handleModelError, true);

      return () => {
        document.removeEventListener('load', handleModelLoad, true);
        document.removeEventListener('error', handleModelError, true);
      };
    }).catch(console.error);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reference':
        return 'bg-teal-100 text-teal-800';
      case 'testing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reference':
        return '✅';
      case 'testing':
        return '🧪';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ 
        background: 'rgba(255, 245, 235, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/test" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-teal-800">COBI</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-teal-300"></div>
              <span className="hidden sm:block text-teal-700 font-medium">Test Simple</span>
            </div>
            <Link
              href="/test"
              className="px-4 py-2 bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              ← Retour aux Tests
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-modern section-padding">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-teal-100 to-teal-200">
            <svg
              className="w-8 h-8 text-teal-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-teal-800">Test Simple Model Viewer</h1>
          <p className="text-lg text-teal-600 max-w-2xl mx-auto">
            Test comparatif des différentes méthodes de chargement des modèles 3D
          </p>
        </motion.div>

        {/* Test Models Grid */}
        <div className="space-y-8">
          {testModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            >
              {/* Model Header */}
              <div className="p-6 border-b border-orange-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-xl font-semibold text-teal-800">{model.name}</h2>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(model.status)}`}>
                        {getStatusIcon(model.status)} {model.status}
                      </div>
                      <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800">
                        {model.type}
                      </div>
                    </div>
                    <p className="text-teal-600">{model.description}</p>
                  </div>
                  
                  {loadingStates[model.id as keyof typeof loadingStates] && (
                    <div className="flex items-center space-x-2 text-teal-600">
                      <div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm font-medium">Chargement...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Viewer */}
              <div className="relative h-96 bg-gradient-to-br from-teal-50 to-orange-50">
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <model-viewer
                        src="${model.src}"
                        alt="${model.name}"
                        auto-rotate
                        camera-controls
                        loading="eager"
                        reveal="auto"
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        style="width: 100%; height: 100%; background: linear-gradient(135deg, #f0fdfa 0%, #fef7ed 100%);"
                      ></model-viewer>
                    `
                  }}
                />
                
                {/* Loading Overlay */}
                {loadingStates[model.id as keyof typeof loadingStates] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-teal-600 font-medium">Chargement du modèle 3D...</p>
                    </div>
                  </div>
                )}

                {/* Success indicator */}
                {!loadingStates[model.id as keyof typeof loadingStates] && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-teal-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                      ✓ Chargé
                    </span>
                  </div>
                )}
              </div>

              {/* Model Info */}
              <div className="p-6 bg-gradient-to-br from-teal-50 to-orange-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-teal-700">Source:</span>
                    <p className="text-teal-600 break-all font-mono text-xs mt-1">
                      {model.src}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-teal-700">Actions:</span>
                      <div className="flex space-x-3 mt-1">
                        <button
                          onClick={() => window.open(model.src, '_blank')}
                          className="text-teal-600 hover:text-teal-700 font-medium text-xs"
                        >
                          📥 Télécharger
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(model.src)}
                          className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                        >
                          📋 Copier URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-xl bg-gradient-to-br from-teal-50 to-orange-50 border border-teal-100"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-teal-800">Résultats du Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="font-medium text-teal-800 mb-1">Modèle de Référence</div>
                <div className="text-teal-600">Astronaute Google - Doit toujours fonctionner</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="font-medium text-teal-800 mb-1">Proxy Next.js</div>
                <div className="text-teal-600">Contourne les restrictions CORS</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="font-medium text-teal-800 mb-1">URL Directe</div>
                <div className="text-teal-600">Performance optimale si CORS configuré</div>
              </div>
            </div>
            <p className="text-teal-600 text-xs mt-4">
              🔬 Ouvrez la console développeur pour voir les logs de chargement détaillés
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 