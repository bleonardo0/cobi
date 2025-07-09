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
    const [retryKey, setRetryKey] = useState(0);
    const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
    const [arSupported, setArSupported] = useState(false);
    const [isInAR, setIsInAR] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const modelViewerRef = useRef<any>(null);

    // Detect AR support
    useEffect(() => {
      const isAndroid = /android/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isChrome = /chrome/i.test(navigator.userAgent);
      const hasWebXR = 'xr' in navigator;
      
      const iosArSupport = isIOS && isSafari;
      const androidArSupport = isAndroid && isChrome;
      const arSupported = iosArSupport || androidArSupport || hasWebXR;
      
      setArSupported(arSupported);
      console.log('🔍 AR Support:', arSupported, { isIOS, isAndroid, isSafari, isChrome, hasWebXR });
    }, []);

    // Determine AR modes based on device
    const getArModes = () => {
      if (!arSupported) return '';
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /android/i.test(navigator.userAgent);
      
      if (isIOS) {
        return 'webxr quick-look';
      } else if (isAndroid) {
        return 'scene-viewer webxr';
      } else {
        return 'webxr scene-viewer quick-look';
      }
    };

    // Load model-viewer library
    useEffect(() => {
      const loadModelViewer = async () => {
        try {
          await import('@google/model-viewer');
          setModelViewerLoaded(true);
        } catch (error) {
          console.error('Failed to load model-viewer:', error);
          setIsError(true);
          setIsLoading(false);
        }
      };
      
      loadModelViewer();
    }, []);

    // Handle retry
    const handleRetry = () => {
      setIsError(false);
      setIsLoading(true);
      setIsLoaded(false);
      setRetryKey(prev => prev + 1);
    };

    // Create and setup model-viewer when ready
    useEffect(() => {
      if (!modelViewerLoaded || !containerRef.current) return;

      const container = containerRef.current;
      
      // Clear previous model-viewer
      const existingViewer = container.querySelector('model-viewer');
      if (existingViewer) {
        existingViewer.remove();
      }

      // Create new model-viewer element
      const modelViewer = document.createElement('model-viewer') as any;
      modelViewer.src = src;
      modelViewer.alt = alt;
      modelViewer.setAttribute('auto-rotate', '');
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.setAttribute('loading', 'eager');
      modelViewer.setAttribute('reveal', 'auto');
      modelViewer.setAttribute('interaction-prompt', 'auto');
      modelViewer.setAttribute('interaction-prompt-style', 'wiggle');
      modelViewer.setAttribute('interaction-prompt-threshold', '2000');
      
      // AR Configuration
      if (arSupported) {
        modelViewer.setAttribute('ar', '');
        modelViewer.setAttribute('ar-modes', getArModes());
        modelViewer.setAttribute('ar-scale', 'auto');
        modelViewer.setAttribute('ar-placement', 'floor');
        console.log('🥽 AR configured with modes:', getArModes());
      }
      
      // Styling
      modelViewer.style.width = '100%';
      modelViewer.style.height = '100%';
      modelViewer.style.background = 'transparent';

      modelViewerRef.current = modelViewer;

      // Pass ref to parent
      if (ref) {
        if (typeof ref === 'function') {
          ref(modelViewer);
        } else {
          ref.current = modelViewer;
        }
      }

      const onLoad = () => {
        console.log('✅ Model loaded');
        setIsLoaded(true);
        setIsLoading(false);
        setIsError(false);
      };

      const onError = () => {
        console.log('❌ Model error');
        setIsError(true);
        setIsLoading(false);
      };

      const onArStatus = (event: any) => {
        const status = event.detail?.status;
        console.log('🥽 AR Status:', status);
        
        switch (status) {
          case 'session-started':
            setIsInAR(true);
            setIsError(false);
            break;
          case 'session-ended':
          case 'not-presenting':
            setIsInAR(false);
            // Force reload after AR exit
            setTimeout(() => {
              if (modelViewer) {
                modelViewer.src = modelViewer.src;
                setIsLoaded(true);
                setIsLoading(false);
                setIsError(false);
              }
            }, 1000);
            break;
          case 'failed':
            setIsInAR(false);
            console.log('❌ AR failed to start');
            break;
        }
      };

      modelViewer.addEventListener('load', onLoad);
      modelViewer.addEventListener('error', onError);
      modelViewer.addEventListener('ar-status', onArStatus);

      // Append to container
      container.appendChild(modelViewer);

      // Timeout
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          console.log('⏰ Timeout');
          setIsError(true);
          setIsLoading(false);
        }
      }, 10000);

      return () => {
        clearTimeout(timeout);
        if (modelViewer) {
          modelViewer.removeEventListener('load', onLoad);
          modelViewer.removeEventListener('error', onError);
          modelViewer.removeEventListener('ar-status', onArStatus);
          if (modelViewer.parentNode) {
            modelViewer.parentNode.removeChild(modelViewer);
          }
        }
      };
    }, [modelViewerLoaded, src, alt, retryKey, ref, isLoaded, arSupported]);

    // Reset states when src changes
    useEffect(() => {
      setIsLoading(true);
      setIsError(false);
      setIsLoaded(false);
      setIsInAR(false);
    }, [src]);

    if (!modelViewerLoaded) {
      return (
        <div
          className={`model-viewer-container ${className}`}
          style={{
            ...style,
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '300px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm font-medium">Chargement de model-viewer...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`model-viewer-container ${className}`}
        style={{
          ...style,
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '300px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Loading state */}
        {isLoading && !isError && !isInAR && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm font-medium">Chargement du modèle 3D...</p>
              {arSupported && (
                <p className="text-green-600 text-xs mt-1">✓ AR disponible</p>
              )}
            </div>
          </div>
        )}
        
        {/* AR Active state */}
        {isInAR && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mode AR Actif</h3>
              <p className="text-sm opacity-75">
                Utilisez votre appareil pour voir le modèle en réalité augmentée
              </p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {isError && !isInAR && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 z-10">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 text-sm mb-4">
                Impossible de charger le modèle 3D. Veuillez réessayer.
              </p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Réessayer
              </button>
            </div>
          </div>
        )}
        
        {/* Success indicator */}
        {isLoaded && !isError && !isInAR && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
              <span>✓</span>
              <span>Chargé</span>
            </div>
          </div>
        )}

        {/* AR indicator */}
        {isLoaded && arSupported && !isError && !isInAR && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
              <span>🥽</span>
              <span>AR</span>
            </div>
          </div>
        )}

        {children}
      </div>
    );
  }
);

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer; 