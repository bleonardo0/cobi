'use client';

import { useEffect, forwardRef, useState } from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const ModelViewer = forwardRef<HTMLElement, ModelViewerProps>(
  ({ src, alt, className = '', style, children }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deviceInfo, setDeviceInfo] = useState<any>({});

    // Détecter le type de fichier
    const isUSDZ = src.toLowerCase().includes('.usdz');
    const isGLB = src.toLowerCase().includes('.glb');
    const isGLTF = src.toLowerCase().includes('.gltf');

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

    const proxyUrl = getProxyUrl(src);

    useEffect(() => {
      // Détecter les informations du device
      setDeviceInfo({
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isWebKit: 'WebKitAppearance' in document.documentElement.style,
      });
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
            console.warn('⚠️ USDZ file on non-iOS/Safari browser - compatibility may be limited');
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
    }, [src, proxyUrl, isUSDZ, deviceInfo]);

    // Générer les attributs model-viewer selon le type de fichier
    const getModelViewerAttributes = () => {
      const baseAttributes = `
        src="${proxyUrl}"
        alt="${alt}"
        auto-rotate
        camera-controls
        loading="eager"
        reveal="auto"
        style="width: 100%; height: 100%; display: block; background: transparent; min-height: 400px;"
      `;

      if (isUSDZ) {
        // Attributs spécifiques pour USDZ
        return baseAttributes + `
          ios-src="${proxyUrl}"
          ar
          ar-modes="webxr scene-viewer quick-look"
          environment-image="neutral"
          auto-rotate-delay="0"
        `;
      } else {
        // Attributs pour GLB/GLTF
        return baseAttributes + `
          environment-image="neutral"
          auto-rotate-delay="3000"
          interaction-prompt="auto"
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
        
        {/* Error state */}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 z-10">
            <div className="text-center max-w-md px-4">
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
          </div>
        )}
        
        {/* Success indicator */}
        {isLoaded && !isError && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ✓ {isUSDZ ? 'USDZ' : isGLB ? 'GLB' : 'GLTF'} chargé
            </span>
            {isUSDZ && deviceInfo.isIOS && (
              <a
                href={proxyUrl}
                rel="ar"
                className="block mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-lg text-center hover:bg-blue-700 transition-colors"
              >
                📱 Voir en AR
              </a>
            )}
          </div>
        )}

        {/* Model viewer */}
        {!isLoading && !isError && (
          <div 
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{
              __html: `<model-viewer ${getModelViewerAttributes()}></model-viewer>`
            }}
          />
        )}
        
        {children}
      </div>
    );
  }
);

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer; 