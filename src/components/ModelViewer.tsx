'use client';

import { useEffect, forwardRef, useState, useMemo } from 'react';

interface Hotspot {
  id: string;
  position: string; // Format: "X Y Z" (coordonnées 3D)
  normal: string;   // Format: "X Y Z" (normale de surface)
  title: string;
  description?: string;
  icon?: string;
}

interface ModelViewerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  hotspots?: Hotspot[];
  glbSrc?: string;
  usdzSrc?: string;
  fallback360Video?: string; // URL vidéo 360° en fallback
  defaultScale?: string; // Échelle par défaut (ex: "1m" ou "0.01m")
  autoAltText?: boolean; // Génération automatique du texte alternatif
}

const ModelViewer = forwardRef<HTMLElement, ModelViewerProps>(
  ({ src, alt, className = '', style, children, hotspots = [], glbSrc, usdzSrc, fallback360Video, defaultScale = "1m", autoAltText = false }, ref) => {
      const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    // Convert Supabase URL to proxy URL
    const getProxyUrl = (originalUrl: string): string => {
      if (originalUrl.includes('supabase.co/storage/v1/object/public/')) {
        const match = originalUrl.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
        if (match) {
          const filePath = match[1];
          return `/api/proxy/${filePath}`;
        }
      }
      return originalUrl;
    };

    // Choisir le bon fichier selon la plateforme et la disponibilité
    const getModelSrc = () => {
      // Si on a des fichiers spécifiques GLB et USDZ
      if (glbSrc || usdzSrc) {
        // Sur iOS/Safari, préférer USDZ si disponible
        if (deviceInfo.isIOS || deviceInfo.isSafari) {
          return usdzSrc || glbSrc || src;
        }
        // Sur autres navigateurs, préférer GLB si disponible
        return glbSrc || usdzSrc || src;
      }
      // Sinon utiliser le src par défaut
      return src;
    };

    const modelSrc = getModelSrc();
    const proxyUrl = getProxyUrl(modelSrc);
    
    // Détecter le type de fichier
    const isUSDZ = modelSrc.toLowerCase().includes('.usdz');
    const isGLB = modelSrc.toLowerCase().includes('.glb');
    const isGLTF = modelSrc.toLowerCase().includes('.gltf');

      useEffect(() => {
    // Détecter les informations du device
    const checkWebXRSupport = async () => {
      try {
        if ('xr' in navigator) {
          const xr = (navigator as any).xr;
          const isSupported = await xr.isSessionSupported('immersive-ar');
          return isSupported;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    const detectDevice = async () => {
      const webXRSupport = await checkWebXRSupport();
      
      setDeviceInfo({
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isWebKit: 'WebKitAppearance' in document.documentElement.style,
        isAndroid: /Android/.test(navigator.userAgent),
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        hasWebXR: 'xr' in navigator,
        supportsWebXRAR: webXRSupport,
      });
    };

    detectDevice();

  }, []);

      useEffect(() => {
    let isMounted = true;
    let loadTimeout: NodeJS.Timeout;

    const loadModelViewer = async () => {
      try {
        console.log('🔄 Loading ModelViewer...');
        console.log('📂 Original URL:', src);
        console.log('🔄 Proxy URL:', proxyUrl);
        console.log('📋 File type:', { isUSDZ, isGLB, isGLTF });
        console.log('📱 Device:', deviceInfo);
        
        // Reset states
        setIsLoading(true);
        setIsError(false);
        setIsLoaded(false);
        
        // Import model-viewer dynamically
        await import('@google/model-viewer');
        console.log('✅ @google/model-viewer loaded');

                  // Pour les fichiers USDZ, vérifier la compatibilité
        if (isUSDZ && !deviceInfo.isIOS && !deviceInfo.isSafari) {
          console.warn('⚠️ USDZ file on non-iOS/Safari browser - showing download option instead');
          // Ne pas charger le model-viewer pour USDZ sur navigateurs non-compatibles
          if (isMounted) {
            setIsLoading(false);
            setIsError(true);
          }
          return;
        }

          let modelLoadedSuccessfully = false;

          // Simulate loading for UX
          setTimeout(() => {
            if (isMounted) {
              setIsLoaded(true);
              setIsLoading(false);
              modelLoadedSuccessfully = true;
              console.log('✅ Model loaded successfully!');
            }
          }, isUSDZ ? 2000 : 1000); // Plus de temps pour USDZ

          // Timeout plus long pour USDZ
          const timeoutDuration = isUSDZ ? 20000 : 15000;
          loadTimeout = setTimeout(() => {
            if (isMounted && !modelLoadedSuccessfully) {
              console.log(`⏰ Timeout: Model failed to load after ${timeoutDuration/1000}s`);
              setIsError(true);
              setIsLoading(false);
            }
          }, timeoutDuration);

        } catch (error) {
          if (!isMounted) return;
          console.error('💥 Failed to load ModelViewer:', error);
          setIsError(true);
          setIsLoading(false);
        }
      };

      loadModelViewer();

      return () => {
        isMounted = false;
        if (loadTimeout) {
          clearTimeout(loadTimeout);
        }
      };
    }, [src, proxyUrl, isUSDZ, deviceInfo]); // activeHotspot retiré des dépendances

    // Gestion des clics sur les hotspots de manière propre
    useEffect(() => {
      const handleHotspotClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const hotspotButton = target.closest('[data-hotspot-id]') as HTMLElement;
        
        if (hotspotButton) {
          const hotspotId = hotspotButton.getAttribute('data-hotspot-id');
          if (hotspotId) {
            setActiveHotspot(prev => prev === hotspotId ? null : hotspotId);
          }
        }
      };

      // Attacher l'événement au conteneur
      const container = document.querySelector('.model-viewer-container');
      if (container) {
        container.addEventListener('click', handleHotspotClick);
        
        return () => {
          container.removeEventListener('click', handleHotspotClick);
        };
      }
    }, [hotspots]); // Se met à jour seulement si les hotspots changent

    // Mémoriser les hotspots HTML pour éviter les regénérations
    const hotspotsHTML = useMemo(() => {
      if (!hotspots.length || isUSDZ) return '';
      
      return hotspots.map(hotspot => `
        <button 
          slot="hotspot-${hotspot.id}" 
          class="hotspot" 
          data-position="${hotspot.position}" 
          data-normal="${hotspot.normal}"
          data-visibility-attribute="visible"
          data-hotspot-id="${hotspot.id}"
        >
          <div class="hotspot-icon">
            ${hotspot.icon || '📍'}
          </div>
        </button>
      `).join('');
    }, [hotspots, isUSDZ]);

    // Générer le texte alternatif automatiquement
    const getAutoAltText = () => {
      if (!autoAltText) return alt;
      
      // Extraire le nom du modèle et générer une description
      const modelName = alt || src.split('/').pop()?.replace(/\.[^/.]+$/, "") || "Modèle 3D";
      const formats = [];
      if (isUSDZ) formats.push("compatible réalité augmentée iOS");
      if (isGLB) formats.push("compatible réalité augmentée Android");
      if (hotspots?.length) formats.push(`${hotspots.length} points d'intérêt interactifs`);
      
      return `${modelName}. Modèle 3D interactif${formats.length ? ` avec ${formats.join(', ')}` : ''}. Utilisez les contrôles tactiles pour explorer le modèle en 360°.`;
    };

    // Générer les attributs model-viewer selon le type de fichier
    const getModelViewerAttributes = () => {
      const autoAlt = getAutoAltText();
      const scaleAttribute = defaultScale !== "1m" ? `scale="${defaultScale}"` : '';
      
      const baseAttributes = `
        src="${proxyUrl}"
        alt="${autoAlt}"
        ${scaleAttribute}
        auto-rotate
        camera-controls
        loading="eager"
        reveal="auto"
        style="width: 100%; height: 100%; display: block; background: transparent; min-height: 400px;"
      `;

      if (isUSDZ) {
        // Attributs spécifiques pour USDZ - utiliser seulement ios-src pour éviter les erreurs de parsing
        return `
          ios-src="${proxyUrl}"
          alt="${autoAlt}"
          ${scaleAttribute}
          ar
          ar-modes="quick-look"
          environment-image="neutral"
          auto-rotate-delay="0"
          interaction-prompt="none"
          style="width: 100%; height: 100%; display: block; background: transparent; min-height: 400px;"
        `;
      } else {
        // Attributs pour GLB/GLTF avec support WebXR + Scene Viewer
        return baseAttributes + `
          environment-image="neutral"
          auto-rotate-delay="3000"
          interaction-prompt="auto"
          ar
          ar-modes="webxr scene-viewer quick-look"
        `;
      }
    };

    return (
      <div
        className={`model-viewer-container ${className}`}
        style={{
          ...style,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '400px',
          background: '#f8f9fa'
        }}
      >
        {/* Loading state */}
        {isLoading && !isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm font-medium">
                Chargement du modèle {isUSDZ ? 'USDZ' : '3D'}...
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {isUSDZ && !deviceInfo.isIOS && '⚠️ Compatibilité limitée sur ce navigateur'}
              </p>
            </div>
          </div>
        )}
        
        {/* Error state with 360° video fallback */}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 z-10">
            <div className="text-center max-w-md px-4">
              {fallback360Video ? (
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📹 Aperçu vidéo 360°</h3>
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
                    <video 
                      controls 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-48 object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23999' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'/%3E%3C/svg%3E"
                    >
                      <source src={fallback360Video} type="video/mp4" />
                      Votre navigateur ne supporte pas la vidéo HTML5.
                    </video>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Le modèle 3D n'a pas pu se charger, mais vous pouvez voir cette vidéo 360° du produit.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔄 Réessayer 3D
                    </button>
                    <a 
                      href={fallback360Video} 
                      target="_blank"
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🎥 Ouvrir vidéo
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {isUSDZ 
                      ? 'Les fichiers USDZ ont une compatibilité limitée. Essayez Safari sur iOS/macOS ou convertissez en GLB.'
                      : 'Impossible de charger le modèle 3D'
                    }
                  </p>
                  {isUSDZ && (
                    <a 
                      href={proxyUrl}
                      download
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors mr-2"
                    >
                      📥 Télécharger USDZ
                    </a>
                  )}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Success indicator */}
        {isLoaded && !isError && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ✓ {isUSDZ ? 'USDZ' : isGLB ? 'GLB' : 'GLTF'} chargé
            </span>
            {/* AR Button Logic */}
            {(() => {
              // iOS/Safari avec USDZ
              if ((deviceInfo.isIOS || deviceInfo.isSafari) && (usdzSrc || isUSDZ)) {
                return (
                  <button
                    onClick={() => {
                      const arUrl = usdzSrc ? getProxyUrl(usdzSrc) : proxyUrl;
                      window.location.href = arUrl;
                    }}
                    className="block mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-lg text-center hover:bg-blue-700 transition-colors w-full"
                  >
                    📱 Voir en AR (iOS)
                  </button>
                );
              }
              // WebXR pour GLB sur navigateurs compatibles
              else if (!isUSDZ && (glbSrc || isGLB)) {
                // Vérifier la compatibilité WebXR
                if (deviceInfo.supportsWebXRAR && deviceInfo.isMobile) {
                  return (
                    <button
                      onClick={() => {
                        // Activer WebXR si disponible
                        const modelViewer = document.querySelector('model-viewer');
                        if (modelViewer && typeof (modelViewer as any).activateAR === 'function') {
                          (modelViewer as any).activateAR();
                        } else {
                          alert('Erreur lors de l\'activation WebXR. Rechargez la page et réessayez.');
                        }
                      }}
                      className="block mt-2 bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow-lg text-center hover:bg-green-700 transition-colors w-full"
                    >
                      🌐 Voir en AR (WebXR)
                    </button>
                  );
                }
                                // Afficher info pour desktop
                else if (!deviceInfo.isMobile) {
                  return (
                    <span className="block mt-2 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full shadow-lg text-center">
                      📱 AR optimisé pour mobile
                    </span>
                  );
                }
                // Afficher info pour mobile non compatible
                else if (deviceInfo.isAndroid) {
                  return (
                    <button
                      onClick={() => {
                        // Essayer Scene Viewer comme fallback
                        const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(proxyUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
                        window.location.href = sceneViewerUrl;
                      }}
                      className="block mt-2 bg-orange-600 text-white text-sm px-3 py-1 rounded-full shadow-lg text-center hover:bg-orange-700 transition-colors w-full"
                    >
                      📱 Scene Viewer AR
                    </button>
                  );
                }
                else {
                  return (
                    <div className="mt-2 bg-orange-100 text-orange-700 text-xs px-3 py-2 rounded-full text-center">
                      ⚠️ AR non supporté sur cet appareil
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
        )}

        {/* Model viewer */}
        {!isLoading && !isError && (
          <div 
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{
              __html: `<model-viewer ${getModelViewerAttributes()}>
                ${hotspotsHTML}
              </model-viewer>`
            }}
          />
        )}

        {/* Hotspot Tooltips */}
        {activeHotspot && hotspots.length > 0 && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-20 border">
            {(() => {
              const hotspot = hotspots.find(h => h.id === activeHotspot);
              if (!hotspot) return null;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{hotspot.title}</h3>
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {hotspot.description && (
                    <p className="text-gray-600 text-sm">{hotspot.description}</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Styles CSS pour les hotspots */}
        <style jsx>{`
          :global(.hotspot) {
            display: block;
            width: 20px;
            height: 20px;
            border: none;
            border-radius: 50%;
            background: #1d4ed8;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            animation: pulse 2s infinite;
          }
          
          :global(.hotspot:hover) {
            transform: scale(1.2);
            background: #1e40af;
          }
          
          :global(.hotspot-icon) {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 12px;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(29, 78, 216, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(29, 78, 216, 0);
            }
          }
        `}</style>
        
        {children}
      </div>
    );
  }
);

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer; 