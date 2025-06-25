'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ModelViewer from '@/components/ModelViewer';

export default function TestUSDZPage() {
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  // URLs de test USDZ
  const testModels = [
    {
      name: 'Apple - Toy Robot (Référence)',
      url: "https://cwrivrxejzesoyszhggz.supabase.co/storage/v1/object/public/models-3d/models/Baldi-5-1748711194080-nql7p5.usdz",
      description: 'Modèle USDZ officiel d\'Apple',
      status: 'reference'
    },
    {
      name: 'Apple - Retro TV',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/retrotv/tv_retro.usdz',
      description: 'TV rétro d\'Apple',
      status: 'reference'
    },
    {
      name: 'Apple - Gramophone',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/gramophone/gramophone.usdz',
      description: 'Gramophone d\'Apple',
      status: 'reference'
    }
  ];

  useEffect(() => {
    // Détecter les informations du device
    setDeviceInfo({
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isWebKit: 'WebKitAppearance' in document.documentElement.style,
      supportsAR: 'xr' in navigator,
    });
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

  const getCompatibilityIcon = (isCompatible: boolean) => {
    return isCompatible ? '✅' : '❌';
  };

  const getCompatibilityColor = (isCompatible: boolean) => {
    return isCompatible ? 'text-teal-600' : 'text-red-600';
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
              <span className="hidden sm:block text-teal-700 font-medium">Test USDZ AR</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v1M7 4V3a1 1 0 011-1h8a1 1 0 011 1v1m-9 4l3 3 6-6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-teal-800">Test USDZ AR</h1>
          <p className="text-lg text-teal-600 max-w-2xl mx-auto">
            Test de compatibilité AR avec les formats USDZ sur iOS Safari
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Device Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg border border-orange-100 p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-teal-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Compatibilité Device</span>
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-700">iOS:</span>
                  <span className={`text-sm font-semibold ${getCompatibilityColor(deviceInfo.isIOS)}`}>
                    {getCompatibilityIcon(deviceInfo.isIOS)} {deviceInfo.isIOS ? 'Compatible' : 'Non compatible'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-700">Safari:</span>
                  <span className={`text-sm font-semibold ${getCompatibilityColor(deviceInfo.isSafari)}`}>
                    {getCompatibilityIcon(deviceInfo.isSafari)} {deviceInfo.isSafari ? 'Compatible' : 'Non compatible'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-700">WebKit:</span>
                  <span className={`text-sm font-semibold ${getCompatibilityColor(deviceInfo.isWebKit)}`}>
                    {getCompatibilityIcon(deviceInfo.isWebKit)} {deviceInfo.isWebKit ? 'Compatible' : 'Non compatible'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-700">Support AR:</span>
                  <span className={`text-sm font-semibold ${getCompatibilityColor(deviceInfo.supportsAR)}`}>
                    {getCompatibilityIcon(deviceInfo.supportsAR)} {deviceInfo.supportsAR ? 'Compatible' : 'Non compatible'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Test Models */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-orange-100 p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-teal-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Modèles de Test</span>
              </h2>
              
              <div className="space-y-3">
                {testModels.map((model, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTest(model.url)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTest === model.url
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-teal-200 hover:border-teal-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-teal-900 text-sm">{model.name}</h3>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(model.status)}`}>
                        ✅ {model.status}
                      </div>
                    </div>
                    <p className="text-xs text-teal-600">{model.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* USDZ Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-orange-50 border border-teal-100"
            >
              <h3 className="font-semibold mb-3 flex items-center space-x-2 text-teal-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>À propos d'USDZ</span>
              </h3>
              <ul className="text-sm space-y-2 text-teal-600">
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Format développé par Apple</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Optimisé pour iOS et Safari</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Support AR natif sur iOS 12+</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Compatibilité limitée sur autres navigateurs</span>
                </li>
              </ul>
            </motion.div>

            {/* Quick Look Test */}
            {selectedTest && deviceInfo.isIOS && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-teal-50 border border-teal-200"
              >
                <h3 className="font-semibold text-teal-900 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Test Quick Look iOS</span>
                </h3>
                <a
                  href={selectedTest}
                  rel="ar"
                  className="block w-full text-center text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  📱 Ouvrir en AR (iOS)
                </a>
              </motion.div>
            )}
          </div>

          {/* Model Viewer */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
            >
              {selectedTest ? (
                <div>
                  <div className="p-6 border-b border-teal-100">
                    <h2 className="text-xl font-semibold mb-2 text-teal-800">Aperçu du modèle USDZ</h2>
                    <p className="text-teal-600 text-sm">
                      Via model-viewer (compatibilité variable selon le navigateur)
                    </p>
                  </div>
                  
                  <div className="h-96 bg-gradient-to-br from-teal-100 to-teal-200 relative">
                    <ModelViewer
                      src={selectedTest}
                      alt="Test USDZ"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-6 border-t border-teal-100 bg-teal-50">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-teal-700">URL du modèle:</span>
                        <p className="text-xs text-teal-600 font-mono bg-white p-2 rounded mt-1 break-all">
                          {selectedTest}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => window.open(selectedTest, '_blank')}
                          className="px-3 py-1 bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-xs"
                        >
                          📥 Télécharger
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedTest)}
                          className="px-3 py-1 bg-white text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-xs"
                        >
                          📋 Copier URL
                        </button>
                        {deviceInfo.isIOS && (
                          <a
                            href={selectedTest}
                            rel="ar"
                            className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs"
                          >
                            📱 Quick Look
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-teal-100 to-teal-200">
                      <svg
                        className="w-10 h-10 text-teal-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-teal-800">Sélectionnez un modèle USDZ</h3>
                    <p className="text-teal-600">Choisissez un modèle dans la liste pour le tester</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Browser Compatibility Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200"
            >
              <h3 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Compatibilité Navigateur</span>
              </h3>
              <div className="text-sm text-orange-800 space-y-1">
                <p>• <strong>iOS Safari:</strong> Support complet USDZ + AR Quick Look</p>
                <p>• <strong>Chrome/Firefox:</strong> Aperçu via model-viewer uniquement</p>
                <p>• <strong>Desktop:</strong> Pas de support AR natif</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 