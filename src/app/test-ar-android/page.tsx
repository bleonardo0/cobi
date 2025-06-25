'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ModelViewer from '@/components/ModelViewer';
import ModelRecovery from '@/lib/model-recovery';

export default function TestARAndroidPage() {
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [arLogs, setArLogs] = useState<string[]>([]);

  // Modèles de test spécialement optimisés pour Android AR
  const testModels = [
    {
      id: 'astronaut',
      name: 'Astronaute Google (Référence)',
      url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      description: 'Modèle de référence Google, optimisé AR',
      size: '2.3 MB',
      triangles: '5,000'
    },
    {
      id: 'chair',
      name: 'Chaise Simple',
      url: 'https://modelviewer.dev/shared-assets/models/Chair.glb',
      description: 'Modèle simple pour test AR',
      size: '1.1 MB',
      triangles: '2,500'
    },
    {
      id: 'werewolf',
      name: 'Loup-garou (Supabase)',
      url: 'https://cwrivrxejzesoyszhggz.supabase.co/storage/v1/object/public/models-3d/models/grand-mechant-loup-1748701638400-q7xzn3.glb',
      description: 'Modèle depuis Supabase',
      size: '~3 MB',
      triangles: '~8,000'
    }
  ];

  useEffect(() => {
    // Collecter des informations détaillées sur l'appareil
    const collectDeviceInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        isAndroid: /android/i.test(navigator.userAgent),
        isChrome: /chrome/i.test(navigator.userAgent),
        isSamsung: /samsung/i.test(navigator.userAgent),
        androidVersion: navigator.userAgent.match(/Android (\d+\.?\d*)/)?.[1] || 'Unknown',
        chromeVersion: navigator.userAgent.match(/Chrome\/(\d+\.?\d*)/)?.[1] || 'Unknown',
        hasWebXR: 'xr' in navigator,
        hasServiceWorker: 'serviceWorker' in navigator,
        isOnline: navigator.onLine,
        deviceMemory: (navigator as any).deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        platform: navigator.platform,
        language: navigator.language,
        screen: {
          width: screen.width,
          height: screen.height,
          pixelRatio: window.devicePixelRatio
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      setDeviceInfo(info);
      
      // Log initial device info
      addLog(`📱 Device: ${info.platform}`);
      addLog(`🤖 Android: ${info.androidVersion}`);
      addLog(`🌐 Chrome: ${info.chromeVersion}`);
      addLog(`🥽 WebXR: ${info.hasWebXR ? 'Supporté' : 'Non supporté'}`);
      addLog(`💾 RAM: ${info.deviceMemory}GB`);
      addLog(`🖥️ Screen: ${info.screen.width}x${info.screen.height} (${info.screen.pixelRatio}x)`);
    };

    collectDeviceInfo();

    // Listen for online/offline changes
    const handleOnline = () => addLog('🌐 Connexion rétablie');
    const handleOffline = () => addLog('🔴 Connexion perdue');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setArLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  const testARCapabilities = async () => {
    addLog('🔍 Test des capacités AR...');
    
    try {
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        if (xr && typeof xr.isSessionSupported === 'function') {
          const supported = await xr.isSessionSupported('immersive-ar');
          addLog(`WebXR AR: ${supported ? '✅ Supporté' : '❌ Non supporté'}`);
        } else {
          addLog('WebXR API non disponible');
        }
      } else {
        addLog('❌ WebXR non disponible dans ce navigateur');
      }
    } catch (error) {
      addLog(`❌ Erreur test WebXR: ${error}`);
    }

    // Test Scene Viewer support
    const isSceneViewerSupported = deviceInfo.isAndroid && deviceInfo.isChrome;
    addLog(`Scene Viewer: ${isSceneViewerSupported ? '✅ Supporté' : '❌ Non supporté'}`);
  };

  const diagnoseSelectedModel = async () => {
    if (!selectedModel) {
      addLog('❌ Aucun modèle sélectionné');
      return;
    }

    addLog('🔍 Diagnostic du modèle...');
    
    try {
      const diagnosis = await ModelRecovery.diagnoseModel(selectedModel);
      
      addLog(`📡 Accessible: ${diagnosis.isReachable ? '✅ Oui' : '❌ Non'}`);
      addLog(`📄 Format valide: ${diagnosis.isValidFormat ? '✅ Oui' : '❌ Non'}`);
      
      if (diagnosis.fileSize) {
        const sizeMB = (diagnosis.fileSize / (1024 * 1024)).toFixed(2);
        addLog(`📦 Taille: ${sizeMB} MB`);
      }
      
      if (diagnosis.error) {
        addLog(`❌ Erreur: ${diagnosis.error}`);
      } else {
        addLog('✅ Modèle semble OK');
      }
    } catch (error) {
      addLog(`❌ Erreur diagnostic: ${error}`);
    }
  };

  const clearLogs = () => {
    setArLogs([]);
    addLog('🧹 Logs effacés');
  };

  const getCompatibilityStatus = () => {
    if (!deviceInfo.isAndroid) return 'incompatible';
    if (!deviceInfo.isChrome) return 'warning';
    if (parseFloat(deviceInfo.androidVersion) < 7) return 'incompatible';
    return 'compatible';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compatible': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'incompatible': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test AR Android
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Diagnostic et test des fonctionnalités AR sur Android
          </p>
          <Link
            href="/test"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Retour aux tests
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Informations Appareil</span>
              </h2>
              
              <div className={`p-3 rounded-lg mb-4 ${getStatusColor(getCompatibilityStatus())}`}>
                <p className="font-semibold">
                  Statut AR: {getCompatibilityStatus() === 'compatible' ? '✅ Compatible' : 
                            getCompatibilityStatus() === 'warning' ? '⚠️ Limité' : '❌ Incompatible'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Plateforme:</span>
                <span className="text-gray-600">{deviceInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Android:</span>
                <span className="text-gray-600">{deviceInfo.androidVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Chrome:</span>
                <span className="text-gray-600">{deviceInfo.chromeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">WebXR:</span>
                <span className={deviceInfo.hasWebXR ? 'text-green-600' : 'text-red-600'}>
                  {deviceInfo.hasWebXR ? '✅ Oui' : '❌ Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">RAM:</span>
                <span className="text-gray-600">{deviceInfo.deviceMemory}GB</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Résolution:</span>
                <span className="text-gray-600">{deviceInfo.screen?.width}x{deviceInfo.screen?.height}</span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={testARCapabilities}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔍 Tester les capacités AR
              </button>
              
              {selectedModel && (
                <button
                  onClick={diagnoseSelectedModel}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🩺 Diagnostiquer le modèle
                </button>
              )}
            </div>
          </motion.div>

          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">Modèles de Test</h2>
            </div>

            <div className="p-6 space-y-4">
              {testModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel === model.url
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setSelectedModel(model.url);
                    addLog(`📦 Modèle sélectionné: ${model.name}`);
                  }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Taille: {model.size}</span>
                    <span>Triangles: {model.triangles}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Logs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">Logs AR</h2>
              <button
                onClick={clearLogs}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Effacer
              </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto bg-gray-50 font-mono text-sm">
              {arLogs.length === 0 ? (
                <p className="text-gray-500 italic">Aucun log pour le moment...</p>
              ) : (
                arLogs.map((log, index) => (
                  <div key={index} className="mb-1 text-gray-800">
                    {log}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Model Viewer */}
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Test AR</h2>
              <p className="text-gray-600 text-sm">
                Cliquez sur le bouton AR dans le visualiseur pour tester la réalité augmentée
              </p>
            </div>
            
            <div className="h-96 bg-gradient-to-br from-blue-100 to-indigo-200 relative">
              <ModelViewer
                src={selectedModel}
                alt="Test AR Android"
                className="w-full h-full"
              />
            </div>

            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Instructions</div>
                  <div className="text-gray-600">1. Cliquez sur le bouton AR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Si ça crash</div>
                  <div className="text-gray-600">2. Vérifiez les logs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Problème persistant</div>
                  <div className="text-gray-600">3. Essayez un autre modèle</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
        >
          <div className="p-6 border-b border-orange-200">
            <h2 className="text-xl font-semibold text-orange-800 mb-2">🛠️ Dépannage AR</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Si l'AR crash:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Vérifiez que Google Play Services pour AR est installé</li>
                <li>• Redémarrez Chrome</li>
                <li>• Videz le cache du navigateur</li>
                <li>• Essayez en mode navigation privée</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Si l'AR ne se lance pas:</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Vérifiez les permissions de la caméra</li>
                <li>• Assurez-vous d'être sur HTTPS</li>
                <li>• Testez avec un autre modèle plus simple</li>
                <li>• Vérifiez la compatibilité de votre appareil</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Appareils testés compatibles:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Samsung Galaxy S8+ et plus récent</li>
                <li>• Google Pixel (tous modèles)</li>
                <li>• OnePlus 6 et plus récent</li>
                <li>• Xiaomi Mi 8 et plus récent</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 