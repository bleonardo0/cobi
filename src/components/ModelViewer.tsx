'use client';

import { useEffect, forwardRef, useState, useRef } from 'react';
import ModelRecovery from '@/lib/model-recovery';

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
    const [arSupported, setArSupported] = useState(false);
    const [isInAR, setIsInAR] = useState(false);
    const [arJustExited, setArJustExited] = useState(false);
    const [loadAttempts, setLoadAttempts] = useState(0);
    const [currentSrc, setCurrentSrc] = useState(src);
    const containerRef = useRef<HTMLDivElement>(null);
    const modelViewerRef = useRef<any>(null);
    const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Detect AR support
    useEffect(() => {
      const checkArSupport = () => {
        const isAndroid = /android/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isChrome = /chrome/i.test(navigator.userAgent);
        const hasWebXR = 'xr' in navigator;
        
        // iOS support: Safari + iOS = Quick Look AR support
        const iosArSupport = isIOS && isSafari;
        
        // Android support: Chrome + WebXR or Scene Viewer support
        const androidArSupport = isAndroid && isChrome;
        
        // Overall AR support
        const arSupported = iosArSupport || androidArSupport || hasWebXR;
        setArSupported(arSupported);
        
        console.log('🔍 AR Support Check:', {
          isIOS,
          isSafari,
          isAndroid,
          isChrome,
          hasWebXR,
          iosArSupport,
          androidArSupport,
          supported: arSupported,
          userAgent: navigator.userAgent
        });
      };

      checkArSupport();
    }, []);

    // Reset when src changes
    useEffect(() => {
      console.log('🔄 Source changed:', src);
      console.log('📊 Current state before reset:', { isLoaded, isError, isLoading, loadAttempts });
      setCurrentSrc(src);
      setLoadAttempts(0);
      setIsError(false);
      setIsLoading(true);
      setIsLoaded(false);
      setArJustExited(false);
    }, [src]);

    // Reset error state after AR exit
    useEffect(() => {
      if (arJustExited) {
        console.log('🔄 Recovering from AR exit...');
        setIsError(false);
        setIsLoading(true);
        
        // Wait a bit then mark as loaded to avoid error state
        const recoveryTimer = setTimeout(() => {
          console.log('✅ AR recovery complete');
          setIsLoaded(true);
          setIsLoading(false);
          setIsError(false);
          setArJustExited(false);
        }, 1500); // Increased timeout

        return () => clearTimeout(recoveryTimer);
      }
    }, [arJustExited]);

    useEffect(() => {
      let isMounted = true;

      const loadModelViewer = async () => {
        try {
          console.log('🔄 Loading ModelViewer for:', currentSrc);
          console.log('📊 Environment check:', {
            userAgent: navigator.userAgent,
            hasWebXR: 'xr' in navigator,
            isHTTPS: window.location.protocol === 'https:',
            currentUrl: window.location.href
          });
          
          // Clear any existing timeout
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          
          setIsLoading(true);
          setIsError(false);
          setIsLoaded(false);
          
          // Import model-viewer dynamically
          console.log('📦 Importing @google/model-viewer...');
          await import('@google/model-viewer');
          console.log('✅ @google/model-viewer loaded successfully');

          // Wait a bit for the DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 200));

          // Set error timeout with progressive increase
          const baseTimeout = 8000;
          const timeoutDuration = baseTimeout + (loadAttempts * 2000); // Increase timeout with attempts
          
          console.log(`⏰ Setting timeout for ${timeoutDuration}ms (attempt ${loadAttempts + 1})`);
          
          loadTimeoutRef.current = setTimeout(() => {
            if (isMounted && !isLoaded && !arJustExited) {
              console.log(`⏰ Timeout after ${timeoutDuration}ms: Model failed to load`);
              console.log('📊 State at timeout:', { isLoaded, isError, isLoading, arJustExited });
              setLoadAttempts(prev => prev + 1);
              
              // Try different strategies based on attempt number
              if (loadAttempts === 0) {
                // First attempt: try proxy URL
                const newSrc = getProxyUrl(currentSrc);
                if (newSrc !== currentSrc) {
                  console.log('🔄 Trying proxy URL:', newSrc);
                  setCurrentSrc(newSrc);
                  return;
                }
              } else if (loadAttempts === 1) {
                // Second attempt: try with cache buster
                const cacheBustSrc = `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
                console.log('🔄 Trying cache bust:', cacheBustSrc);
                setCurrentSrc(cacheBustSrc);
                return;
              }
              
              // Final attempt failed
              console.log('❌ All recovery attempts failed');
              setIsError(true);
              setIsLoading(false);
            }
          }, timeoutDuration);

        } catch (error) {
          if (!isMounted) return;
          console.error('💥 Failed to load ModelViewer:', error);
          console.error('📊 Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            currentSrc,
            loadAttempts
          });
          if (!arJustExited) {
            setIsError(true);
            setIsLoading(false);
          }
        }
      };

      loadModelViewer();

      return () => {
        isMounted = false;
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    }, [currentSrc, arJustExited, loadAttempts]);

    // Listen for model-viewer events
    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        console.log('⚠️ Container ref not available');
        return;
      }

      console.log('🎧 Setting up event listeners for container:', container);

      const handleLoad = () => {
        console.log('✅ Model loaded successfully');
        console.log('📊 Load event state:', { currentSrc, loadAttempts, isInAR, arJustExited });
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        setIsLoaded(true);
        setIsLoading(false);
        setIsError(false);
        setArJustExited(false);
        setLoadAttempts(0); // Reset attempts on success
      };

      const handleError = (event: any) => {
        // Don't show error if we just exited AR or are in AR
        if (isInAR || arJustExited) {
          console.log('⚠️ Model error ignored (AR context):', event);
          return;
        }
        
        console.error('❌ Model failed to load:', event);
        console.error('📊 Error event details:', {
          type: event.type,
          detail: event.detail,
          target: event.target,
          currentSrc,
          loadAttempts
        });
        
        // Clear timeout since we got an explicit error
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
        
        setLoadAttempts(prev => prev + 1);
        
        // Try fallback strategies
        if (loadAttempts === 0) {
          // First error: try proxy URL
          const newSrc = getProxyUrl(currentSrc);
          if (newSrc !== currentSrc) {
            console.log('🔄 Error fallback: trying proxy URL');
            setCurrentSrc(newSrc);
            return;
          }
        }
        
        setIsError(true);
        setIsLoading(false);
        setIsLoaded(false);
      };

      const handleProgress = (event: any) => {
        const progress = event.detail?.totalProgress || 0;
        console.log('📈 Loading progress:', progress, event.detail);
        
        // If we have progress, we're loading properly
        if (progress > 0) {
          setIsError(false);
          setIsLoading(true);
        }
        
        // If progress is 100%, model should be loaded soon
        if (progress >= 1) {
          console.log('📦 Model fully downloaded');
        }
      };

      // Handle AR events
      const handleArStatus = (event: any) => {
        const status = event.detail?.status;
        console.log('🥽 AR Status:', status);
        
        switch (status) {
          case 'session-started':
            console.log('🚀 AR session started');
            setIsInAR(true);
            setIsError(false);
            break;
            
          case 'object-placed':
            console.log('📍 Object placed in AR');
            break;
            
          case 'failed':
            console.error('❌ AR failed to start');
            setIsInAR(false);
            // Fallback: try to restart without AR
            setTimeout(() => {
              const modelViewer = container.querySelector('model-viewer');
              if (modelViewer) {
                console.log('🔄 Restarting without AR...');
                modelViewer.removeAttribute('ar');
                setTimeout(() => {
                  if (arSupported) {
                    modelViewer.setAttribute('ar', '');
                  }
                }, 1000);
              }
            }, 1000);
            break;
            
          case 'not-presenting':
          case 'session-ended':
            console.log('🔚 AR session ended');
            setIsInAR(false);
            setArJustExited(true);
            // Use ModelRecovery for post-AR recovery
            setTimeout(async () => {
              const modelViewer = container.querySelector('model-viewer') as any;
              if (modelViewer) {
                try {
                  const success = await ModelRecovery.recoverFromAR(modelViewer, currentSrc);
                  if (success) {
                    console.log('✅ Post-AR recovery successful');
                    setIsLoaded(true);
                    setIsLoading(false);
                    setIsError(false);
                    setArJustExited(false);
                  } else {
                    console.log('⚠️ Post-AR recovery failed, will try on next interaction');
                  }
                } catch (error) {
                  console.error('❌ Post-AR recovery error:', error);
                }
              }
            }, 1000); // Increased delay
            break;
        }
      };

      // Add event listeners when model-viewer is ready
      const checkAndAddListeners = () => {
        const modelViewer = container.querySelector('model-viewer');
        if (modelViewer) {
          modelViewerRef.current = modelViewer;
          modelViewer.addEventListener('load', handleLoad);
          modelViewer.addEventListener('error', handleError);
          modelViewer.addEventListener('progress', handleProgress);
          modelViewer.addEventListener('ar-status', handleArStatus);
          
          // Check if already loaded
          if ((modelViewer as any).loaded) {
            handleLoad();
          }
          
          return () => {
            modelViewer.removeEventListener('load', handleLoad);
            modelViewer.removeEventListener('error', handleError);
            modelViewer.removeEventListener('progress', handleProgress);
            modelViewer.removeEventListener('ar-status', handleArStatus);
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
    }, [currentSrc, arSupported, isInAR, arJustExited, loadAttempts]);

    // Determine AR modes based on device and file type
    const getArModes = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isAndroid = /android/i.test(navigator.userAgent);
      
      // For USDZ files, prioritize Quick Look on iOS
      if (isUSDZ) {
        if (isIOS && isSafari) {
          return 'quick-look'; // iOS Safari + USDZ = Quick Look
        } else {
          return ''; // USDZ only works on iOS Safari
        }
      }
      
      if (!arSupported) {
        return ''; // No AR support
      }

      // iOS Safari: Quick Look for USDZ, WebXR for GLB
      if (isIOS && isSafari) {
        return 'webxr quick-look';
      }

      // Android: prefer Scene Viewer over WebXR for stability
      if (isAndroid) {
        return 'scene-viewer webxr quick-look';
      }
      
      // Default: all modes for maximum compatibility
      return 'webxr scene-viewer quick-look';
    };

    // Manual retry function
    const handleRetry = async () => {
      console.log('🔄 Manual retry triggered');
      setIsError(false);
      setIsLoading(true);
      setIsLoaded(false);
      setArJustExited(false);
      setLoadAttempts(0);
      
      // Reset to original source
      setCurrentSrc(src);
      
      // Use ModelRecovery for intelligent retry
      const modelViewer = modelViewerRef.current;
      if (modelViewer) {
        try {
          const success = await ModelRecovery.recoverModel(src, modelViewer, {
            maxRetries: 3,
            retryDelay: 1000,
            fallbackToProxy: true,
            logErrors: true
          });
          
          if (success) {
            setIsLoaded(true);
            setIsLoading(false);
            setIsError(false);
          } else {
            setIsError(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ Recovery failed:', error);
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

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
        {/* Loading state - IMPORTANT: Never use display: none, it causes AR crashes */}
        {(isLoading && !isError && !isInAR) && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10"
            style={{ visibility: 'visible', opacity: 1 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm font-medium">
                {arJustExited ? 'Récupération après AR...' : 
                 loadAttempts > 0 ? `Tentative ${loadAttempts + 1}...` : 
                 'Chargement du modèle 3D...'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {isUSDZ ? 'Fichier USDZ' : 'Fichier GLB/GLTF'}
              </p>
              {arSupported && (
                <p className="text-green-600 text-xs mt-1">
                  ✓ AR disponible
                </p>
              )}
              {loadAttempts > 0 && (
                <p className="text-orange-600 text-xs mt-1">
                  Stratégie de récupération en cours...
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* AR Active Indicator */}
        {isInAR && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20"
            style={{ visibility: 'visible', opacity: 1 }}
          >
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
        
        {/* Error state - only show if not in AR and not just exited */}
        {(isError && !isInAR && !arJustExited) && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 z-10"
            style={{ visibility: 'visible', opacity: 1 }}
          >
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
                  : `Impossible de charger le modèle 3D${loadAttempts > 0 ? ` (${loadAttempts + 1} tentatives)` : ''}`
                }
              </p>
              <div className="flex space-x-2 justify-center">
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Réessayer
                </button>
                <a 
                  href={src}
                  target="_blank"
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  📥 Télécharger
                </a>
              </div>
              {loadAttempts > 2 && (
                <p className="text-xs text-gray-500 mt-3">
                  Plusieurs tentatives ont échoué. Vérifiez votre connexion internet.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Success indicator */}
        {(isLoaded && !isError && !isInAR) && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ✓ Modèle chargé
            </span>
          </div>
        )}

        {/* AR Support indicator */}
        {(isLoaded && arSupported && !isError && !isInAR) && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              🥽 AR
            </span>
          </div>
        )}

        {/* Model viewer - Always render, never use display: none */}
        <div 
          style={{ 
            width: '100%', 
            height: '100%',
            opacity: isError && !isInAR && !arJustExited ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
            visibility: 'visible' // Force visibility to prevent AR crashes
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <model-viewer
                src="${currentSrc}"
                alt="${alt}"
                auto-rotate
                camera-controls
                loading="eager"
                reveal="auto"
                style="width: 100%; height: 100%; display: block; background: transparent; visibility: visible;"
                ${arSupported ? `ar ar-modes="${getArModes()}"` : ''}
                ${arSupported && isUSDZ ? `ios-src="${currentSrc}"` : ''}
                ${arSupported ? 'ar-scale="auto"' : ''}
                ${arSupported ? 'ar-placement="floor"' : ''}
                interaction-prompt="auto"
                interaction-prompt-style="wiggle"
                interaction-prompt-threshold="2000"
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