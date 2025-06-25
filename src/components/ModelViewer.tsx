'use client';

import { useEffect, forwardRef, useState, useRef } from 'react';

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
    const containerRef = useRef<HTMLDivElement>(null);

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
    const isUSDZ = src.toLowerCase().includes('.usdz');

    useEffect(() => {
      let isMounted = true;
      let loadTimeout: NodeJS.Timeout;

      const loadModelViewer = async () => {
        try {
          console.log('🔄 Loading ModelViewer for:', src);
          
          setIsLoading(true);
          setIsError(false);
          setIsLoaded(false);
          
          // Import model-viewer dynamically
          await import('@google/model-viewer');
          console.log('✅ @google/model-viewer loaded');

          // Wait a bit for the DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 100));

          // Set error timeout
          loadTimeout = setTimeout(() => {
            if (isMounted && !isLoaded) {
              console.log('⏰ Timeout: Model failed to load');
              setIsError(true);
              setIsLoading(false);
            }
          }, 15000);

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
    }, [src]);

    // Listen for model-viewer events
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleLoad = () => {
        console.log('✅ Model loaded successfully');
        setIsLoaded(true);
        setIsLoading(false);
        setIsError(false);
      };

      const handleError = (event: any) => {
        console.error('❌ Model failed to load:', event);
        setIsError(true);
        setIsLoading(false);
        setIsLoaded(false);
      };

      const handleProgress = (event: any) => {
        console.log('📈 Loading progress:', event.detail?.totalProgress || 'unknown');
      };

      // Add event listeners when model-viewer is ready
      const checkAndAddListeners = () => {
        const modelViewer = container.querySelector('model-viewer');
        if (modelViewer) {
          modelViewer.addEventListener('load', handleLoad);
          modelViewer.addEventListener('error', handleError);
          modelViewer.addEventListener('progress', handleProgress);
          
          // Check if already loaded
          if ((modelViewer as any).loaded) {
            handleLoad();
          }
          
          return () => {
            modelViewer.removeEventListener('load', handleLoad);
            modelViewer.removeEventListener('error', handleError);
            modelViewer.removeEventListener('progress', handleProgress);
          };
        }
        return null;
      };

      // Try immediately and also after a delay
      const cleanup1 = checkAndAddListeners();
      const timeoutId = setTimeout(() => {
        const cleanup2 = checkAndAddListeners();
        return cleanup2;
      }, 500);

      return () => {
        if (cleanup1) cleanup1();
        clearTimeout(timeoutId);
      };
    }, [src]);

    return (
      <div
        ref={containerRef}
        className={`model-viewer-container ${className}`}
        style={{
          ...style,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '400px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Loading state */}
        {isLoading && !isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm font-medium">
                Chargement du modèle 3D...
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {isUSDZ ? 'Fichier USDZ' : 'Fichier GLB/GLTF'}
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
                  ? 'Fichier USDZ incompatible avec ce navigateur'
                  : 'Impossible de charger le modèle 3D'
                }
              </p>
              <div className="flex space-x-2 justify-center">
                <button 
                  onClick={() => {
                    setIsLoading(true);
                    setIsError(false);
                    setIsLoaded(false);
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Réessayer
                </button>
                <a 
                  href={proxyUrl}
                  target="_blank"
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  📥 Télécharger
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Success indicator */}
        {isLoaded && !isError && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ✓ Modèle chargé
            </span>
          </div>
        )}

        {/* Model viewer - Always render */}
        <div 
          style={{ 
            width: '100%', 
            height: '100%',
            opacity: isError ? 0.3 : 1,
            transition: 'opacity 0.3s ease'
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <model-viewer
                src="${proxyUrl}"
                alt="${alt}"
                auto-rotate
                camera-controls
                loading="eager"
                reveal="auto"
                style="width: 100%; height: 100%; display: block; background: transparent;"
                ${isUSDZ ? 'ar ar-modes="quick-look"' : 'ar ar-modes="webxr scene-viewer quick-look"'}
              ></model-viewer>
            `
          }}
        />
        
        {children}
      </div>
    );
  }
);

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer; 