'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ModelViewer from '@/components/ModelViewer';

export default function TestIOSARPage() {
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [arLogs, setArLogs] = useState<string[]>([]);

  // Modèles de test spécialement optimisés pour iOS AR
  const testModels = [
    {
      id: 'toy-robot',
      name: 'Toy Robot (Apple Référence)',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/toyrobot/robot_walk_idle.usdz',
      description: 'Modèle officiel Apple, garantit de fonctionner',
      size: '2.8 MB',
      format: 'USDZ'
    },
    {
      id: 'retro-tv',
      name: 'TV Rétro (Apple)',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/retrotv/tv_retro.usdz',
      description: 'Modèle de référence Apple',
      size: '3.1 MB',
      format: 'USDZ'
    },
    {
      id: 'gramophone',
      name: 'Gramophone (Apple)',
      url: 'https://developer.apple.com/augmented-reality/quick-look/models/gramophone/gramophone.usdz',
      description: 'Modèle complexe Apple',
      size: '4.2 MB',
      format: 'USDZ'
    },
    {
      id: 'chair',
      name: 'Chaise (Model Viewer)',
      url: 'https://modelviewer.dev/shared-assets/models/Chair.glb',
      description: 'Test GLB sur iOS (WebXR)',
      size: '1.1 MB',
      format: 'GLB'
    }
  ];

  useEffect(() => {
    // Collecter des informations détaillées sur l'appareil iOS
    const collectDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isIPad = /iPad/.test(userAgent);
      const isIPhone = /iPhone/.test(userAgent);
      const isIPod = /iPod/.test(userAgent);
      
      // Extraction version iOS
      const iosVersionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      const iosVersion = iosVersionMatch 
        ? `${iosVersionMatch[1]}.${iosVersionMatch[2]}${iosVersionMatch[3] ? '.' + iosVersionMatch[3] : ''}`
        : 'Unknown';

      // Détection modèle iPhone
      const getDeviceModel = () => {
        if (isIPhone) {
          if (userAgent.includes('iPhone14')) return 'iPhone 14';
          if (userAgent.includes('iPhone13')) return 'iPhone 13';
          if (userAgent.includes('iPhone12')) return 'iPhone 12';
          if (userAgent.includes('iPhone SE')) return 'iPhone SE';
          return 'iPhone (modèle non détecté)';
        }
        if (isIPad) return 'iPad';
        if (isIPod) return 'iPod Touch';
        return 'Non-iOS';
      };

      const info = {
        userAgent,
        isIOS,
        isSafari,
        isIPad,
        isIPhone,
        isIPod,
        iosVersion,
        deviceModel: getDeviceModel(),
        safariVersion: userAgent.match(/Version\/(\d+\.?\d*)/)?.[1] || 'Unknown',
        hasWebXR: 'xr' in navigator,
        isHTTPS: window.location.protocol === 'https:',
        canUseQuickLook: isIOS && isSafari && window.location.protocol === 'https:',
        deviceMemory: (navigator as any).deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
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
      addLog(`📱 Device: ${info.deviceModel}`);
      addLog(`🍎 iOS: ${info.iosVersion}`);
      addLog(`🌐 Safari: ${info.safariVersion}`);
      addLog(`🔒 HTTPS: ${info.isHTTPS ? 'Oui' : 'Non'}`);
      addLog(`🥽 Quick Look: ${info.canUseQuickLook ? 'Disponible' : 'Indisponible'}`);
      addLog(`🖥️ Screen: ${info.screen.width}x${info.screen.height} (${info.screen.pixelRatio}x)`);
    };

    collectDeviceInfo();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setArLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  const testQuickLookCapabilities = async () => {
    addLog('🔍 Test des capacités Quick Look...');
    
    if (!deviceInfo.isIOS) {
      addLog('❌ Appareil non-iOS détecté');
      return;
    }

    if (!deviceInfo.isSafari) {
      addLog('❌ Safari requis pour Quick Look');
      return;
    }

    if (!deviceInfo.isHTTPS) {
      addLog('❌ HTTPS requis pour Quick Look');
      return;
    }

    addLog('✅ Configuration iOS Quick Look valide');
    
    // Test WebXR support
    try {
      if ('xr' in navigator) {
        const xr = (navigator as any).xr;
        if (xr && typeof xr.isSessionSupported === 'function') {
          const supported = await xr.isSessionSupported('immersive-ar');
          addLog(`WebXR AR: ${supported ? '✅ Supporté' : '❌ Non supporté'}`);
        }
      } else {
        addLog('WebXR: ❌ Non disponible');
      }
    } catch (error) {
      addLog(`❌ Erreur test WebXR: ${error}`);
    }
  };

  const testDirectQuickLook = (modelUrl: string) => {
    addLog(`📱 Test Quick Look direct pour: ${modelUrl}`);
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = modelUrl;
    link.rel = 'ar';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
      addLog('✅ Lien Quick Look activé');
    } catch (error) {
      addLog(`❌ Erreur activation Quick Look: ${error}`);
    }
    
    document.body.removeChild(link);
  };

  const clearLogs = () => {
    setArLogs([]);
    addLog('🗑️ Logs effacés');
  };

  const getCompatibilityStatus = () => {
    if (!deviceInfo.isIOS) return 'incompatible';
    if (!deviceInfo.isSafari) return 'incompatible';
    if (!deviceInfo.isHTTPS) return 'incompatible';
    
    const iosVersionNum = parseFloat(deviceInfo.iosVersion);
    if (iosVersionNum < 12) return 'incompatible';
    if (iosVersionNum < 14) return 'warning';
    return 'compatible';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compatible':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'incompatible':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test AR iOS
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Diagnostic et test des fonctionnalités AR sur iPhone et iPad
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/test"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ← Retour aux tests
            </Link>
            <Link
              href="/test-usdz"
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Test USDZ →
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-purple-800 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Informations iOS</span>
              </h2>
              
              <div className={`p-3 rounded-lg mb-4 ${getStatusColor(getCompatibilityStatus())}`}>
                <p className="font-semibold">
                  Statut AR: {getCompatibilityStatus() === 'compatible' ? '✅ Pleinement compatible' : 
                            getCompatibilityStatus() === 'warning' ? '⚠️ Compatible avec limitations' : '❌ Incompatible'}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-purple-700">Appareil:</span>
                  <div className="text-gray-600">{deviceInfo.deviceModel}</div>
                </div>
                <div>
                  <span className="font-medium text-purple-700">iOS:</span>
                  <div className="text-gray-600">{deviceInfo.iosVersion}</div>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Safari:</span>
                  <div className="text-gray-600">{deviceInfo.safariVersion}</div>
                </div>
                <div>
                  <span className="font-medium text-purple-700">HTTPS:</span>
                  <div className={deviceInfo.isHTTPS ? 'text-green-600' : 'text-red-600'}>
                    {deviceInfo.isHTTPS ? '✅ Oui' : '❌ Non'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Quick Look:</span>
                  <div className={deviceInfo.canUseQuickLook ? 'text-green-600' : 'text-red-600'}>
                    {deviceInfo.canUseQuickLook ? '✅ Disponible' : '❌ Indisponible'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-purple-700">WebXR:</span>
                  <div className={deviceInfo.hasWebXR ? 'text-green-600' : 'text-orange-600'}>
                    {deviceInfo.hasWebXR ? '✅ Supporté' : '⚠️ Non supporté'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={testQuickLookCapabilities}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔍 Tester Quick Look
              </button>
            </div>
          </motion.div>

          {/* Logs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-purple-800">Logs de Diagnostic</h2>
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

        {/* Model Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Modèles de Test iOS</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testModels.map((model) => (
              <div
                key={model.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedModel === model.url
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
                onClick={() => {
                  setSelectedModel(model.url);
                  addLog(`📦 Modèle sélectionné: ${model.name}`);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{model.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    model.format === 'USDZ' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {model.format}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                <p className="text-xs text-gray-500">Taille: {model.size}</p>
                
                {model.format === 'USDZ' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testDirectQuickLook(model.url);
                    }}
                    className="mt-2 w-full px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    📱 Test Quick Look Direct
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Model Viewer */}
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Test AR en Temps Réel</h2>
              <p className="text-gray-600 text-sm">
                Le bouton AR doit apparaître automatiquement sur iOS Safari avec fichiers USDZ
              </p>
            </div>
            
            <div className="h-96 bg-gradient-to-br from-purple-100 to-pink-200 relative">
              <ModelViewer
                src={selectedModel}
                alt="Test AR iOS"
                className="w-full h-full"
              />
            </div>

            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Instructions iOS</div>
                  <div className="text-gray-600">1. Recherchez le bouton AR</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Si absent</div>
                  <div className="text-gray-600">2. Utilisez Safari uniquement</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Problème persistant</div>
                  <div className="text-gray-600">3. Videz le cache Safari</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* iOS Specific Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
        >
          <div className="p-6 border-b border-orange-200">
            <h2 className="text-xl font-semibold text-orange-800 mb-2">🍎 Dépannage iOS Spécifique</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Si le bouton AR n'apparaît pas:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Vérifiez que vous utilisez Safari (pas Chrome iOS)</li>
                <li>• Assurez-vous que le fichier est au format USDZ</li>
                <li>• Confirmez que le site est en HTTPS</li>
                <li>• Rechargez la page complètement</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Si l'AR ne se lance pas:</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Redémarrez Safari complètement</li>
                <li>• Réglages  Safari Effacer historique et données</li>
                <li>• Testez en navigation privée</li>
                <li>• Vérifiez l'espace de stockage disponible</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Compatibilité iOS:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ✅ iOS 12+ : Support Quick Look AR</li>
                <li>• ✅ iOS 14+ : Performances optimales</li>
                <li>• ✅ iPhone 6s+ : Compatible</li>
                <li>• ❌ iPhone 6 et antérieur : Non supporté</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 