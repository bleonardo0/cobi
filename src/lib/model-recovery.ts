// Utilitaires pour la récupération des erreurs de modèles 3D

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackToProxy?: boolean;
  logErrors?: boolean;
  timeoutMs?: number;
}

interface ModelViewerElement extends HTMLElement {
  src: string;
  loaded: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dismissPoster(): void;
  updateFraming(): void;
  jumpCameraToGoal(): void;
}

class ModelRecovery {
  private static readonly DEFAULT_OPTIONS: Required<RecoveryOptions> = {
    maxRetries: 3,
    retryDelay: 1500,
    fallbackToProxy: true,
    logErrors: true,
    timeoutMs: 10000
  };

  /**
   * Diagnostique les problèmes de chargement de modèle
   */
  static async diagnoseModel(src: string): Promise<{
    isReachable: boolean;
    isValidFormat: boolean;
    fileSize?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(src, { method: 'HEAD' });
      
      const diagnosis = {
        isReachable: response.ok,
        isValidFormat: this.isValidModelFormat(src),
        fileSize: response.headers.get('content-length') 
          ? parseInt(response.headers.get('content-length')!) 
          : undefined,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

      return diagnosis;
    } catch (error) {
      return {
        isReachable: false,
        isValidFormat: this.isValidModelFormat(src),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Vérifie si le format de fichier est valide
   */
  static isValidModelFormat(src: string): boolean {
    const validExtensions = ['.glb', '.gltf', '.usdz'];
    const url = new URL(src, window.location.origin);
    const pathname = url.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext));
  }

  /**
   * Convert Supabase URL to proxy URL for better reliability
   */
  private static getProxyUrl(originalUrl: string): string {
    if (originalUrl.includes('supabase.co/storage/v1/object/public/')) {
      const match = originalUrl.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
      if (match) {
        const filePath = match[1];
        return `/api/proxy/${filePath}`;
      }
    }
    return originalUrl;
  }

  /**
   * Generate cache-busting URL
   */
  private static getCacheBustUrl(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_cb=${Date.now()}&_retry=${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if URL is accessible
   */
  private static async checkUrlAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      console.warn('🔍 URL check failed:', url, error);
      return false;
    }
  }

  /**
   * Get fallback URLs in order of preference
   */
  private static getFallbackUrls(originalUrl: string): string[] {
    const urls: string[] = [];
    
    // 1. Original URL
    urls.push(originalUrl);
    
    // 2. Proxy URL (if different)
    const proxyUrl = this.getProxyUrl(originalUrl);
    if (proxyUrl !== originalUrl) {
      urls.push(proxyUrl);
    }
    
    // 3. Cache-busted original
    urls.push(this.getCacheBustUrl(originalUrl));
    
    // 4. Cache-busted proxy (if different)
    if (proxyUrl !== originalUrl) {
      urls.push(this.getCacheBustUrl(proxyUrl));
    }
    
    return urls;
  }

  /**
   * Safely set model-viewer src with error handling
   */
  private static async safeSetSrc(
    modelViewer: ModelViewerElement, 
    url: string, 
    timeoutMs: number = 10000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      let loadTimeout: NodeJS.Timeout;
      
      const cleanup = () => {
        if (loadTimeout) clearTimeout(loadTimeout);
        modelViewer.removeEventListener('load', onLoad);
        modelViewer.removeEventListener('error', onError);
      };
      
      const resolveOnce = (success: boolean) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(success);
      };
      
      const onLoad = () => {
        console.log('✅ Model loaded successfully:', url);
        resolveOnce(true);
      };
      
      const onError = (event: any) => {
        console.warn('❌ Model load error:', url, event);
        resolveOnce(false);
      };
      
      // Set timeout
      loadTimeout = setTimeout(() => {
        console.warn('⏰ Model load timeout:', url);
        resolveOnce(false);
      }, timeoutMs);
      
      // Add listeners
      modelViewer.addEventListener('load', onLoad);
      modelViewer.addEventListener('error', onError);
      
      // Check if already loaded with this URL
      if (modelViewer.src === url && modelViewer.loaded) {
        console.log('✅ Model already loaded:', url);
        resolveOnce(true);
        return;
      }
      
      try {
        // Update src
        modelViewer.src = url;
        console.log('🔄 Attempting to load:', url);
        
        // Force update if model-viewer is already initialized
        if (typeof modelViewer.updateFraming === 'function') {
          setTimeout(() => {
            try {
              modelViewer.updateFraming();
            } catch (e) {
              console.warn('⚠️ updateFraming failed:', e);
            }
          }, 100);
        }
        
      } catch (error) {
        console.error('💥 Failed to set src:', error);
        resolveOnce(false);
      }
    });
  }

  /**
   * Recover a model with multiple fallback strategies
   */
  static async recoverModel(
    originalUrl: string,
    modelViewer: ModelViewerElement,
    options: RecoveryOptions = {}
  ): Promise<boolean> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (opts.logErrors) {
      console.log('🔧 Starting model recovery for:', originalUrl);
    }
    
    const fallbackUrls = this.getFallbackUrls(originalUrl);
    
    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
      for (const url of fallbackUrls) {
        try {
          if (opts.logErrors) {
            console.log(`🔄 Recovery attempt ${attempt + 1}/${opts.maxRetries} with URL:`, url);
          }
          
          // Optional: Check URL accessibility first (can be slow)
          if (attempt > 0) {
            const isAccessible = await this.checkUrlAccessibility(url);
            if (!isAccessible) {
              console.warn('⚠️ URL not accessible, skipping:', url);
              continue;
            }
          }
          
          const success = await this.safeSetSrc(modelViewer, url, opts.timeoutMs);
          
          if (success) {
            if (opts.logErrors) {
              console.log('✅ Model recovery successful with:', url);
            }
            return true;
          }
          
          // Small delay between URL attempts
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          if (opts.logErrors) {
            console.error('💥 Recovery attempt failed:', error);
          }
        }
      }
      
      // Delay between retry cycles
      if (attempt < opts.maxRetries - 1) {
        if (opts.logErrors) {
          console.log(`⏳ Waiting ${opts.retryDelay}ms before next retry cycle...`);
        }
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
      }
    }
    
    if (opts.logErrors) {
      console.error('❌ Model recovery failed after all attempts');
    }
    return false;
  }

  /**
   * Recover from AR session end with special handling
   */
  static async recoverFromAR(
    modelViewer: ModelViewerElement,
    originalUrl: string,
    options: RecoveryOptions = {}
  ): Promise<boolean> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options, retryDelay: 2000 };
    
    console.log('🥽 Recovering from AR session...');
    
    // Wait for AR session to fully end
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Force refresh the model viewer state
      if (typeof modelViewer.dismissPoster === 'function') {
        modelViewer.dismissPoster();
      }
      
      // Try to recover with a longer timeout for post-AR
      const success = await this.recoverModel(originalUrl, modelViewer, {
        ...opts,
        timeoutMs: 15000, // Longer timeout after AR
        maxRetries: 2 // Fewer retries but with longer timeout
      });
      
      if (success) {
        // Additional post-AR cleanup
        setTimeout(() => {
          try {
            if (typeof modelViewer.jumpCameraToGoal === 'function') {
              modelViewer.jumpCameraToGoal();
            }
            if (typeof modelViewer.updateFraming === 'function') {
              modelViewer.updateFraming();
            }
          } catch (e) {
            console.warn('⚠️ Post-AR cleanup failed:', e);
          }
        }, 500);
      }
      
      return success;
      
    } catch (error) {
      console.error('💥 AR recovery failed:', error);
      return false;
    }
  }

  /**
   * Quick recovery for simple reload scenarios
   */
  static async quickRecover(
    modelViewer: ModelViewerElement,
    originalUrl: string
  ): Promise<boolean> {
    console.log('⚡ Quick recovery attempt...');
    
    try {
      // Try cache-busted version first for quick recovery
      const cacheBustUrl = this.getCacheBustUrl(originalUrl);
      const success = await this.safeSetSrc(modelViewer, cacheBustUrl, 5000);
      
      if (success) {
        console.log('✅ Quick recovery successful');
        return true;
      }
      
      // Fallback to proxy if available
      const proxyUrl = this.getProxyUrl(originalUrl);
      if (proxyUrl !== originalUrl) {
        const proxySuccess = await this.safeSetSrc(modelViewer, proxyUrl, 5000);
        if (proxySuccess) {
          console.log('✅ Quick recovery successful with proxy');
          return true;
        }
      }
      
      console.warn('⚠️ Quick recovery failed');
      return false;
      
    } catch (error) {
      console.error('💥 Quick recovery error:', error);
      return false;
    }
  }

  /**
   * Preload and validate a model URL
   */
  static async preloadModel(url: string): Promise<boolean> {
    try {
      console.log('🔍 Preloading model:', url);
      
      // Check basic accessibility
      const isAccessible = await this.checkUrlAccessibility(url);
      if (!isAccessible) {
        console.warn('⚠️ Model URL not accessible:', url);
        return false;
      }
      
      // Try to fetch a small portion to validate
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1023' // First 1KB
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok || response.status === 206) {
        console.log('✅ Model preload successful:', url);
        return true;
      } else {
        console.warn('⚠️ Model preload failed:', response.status, url);
        return false;
      }
      
    } catch (error) {
      console.warn('⚠️ Model preload error:', url, error);
      return false;
    }
  }

  /**
   * Get the best URL for a model based on current conditions
   */
  static async getBestUrl(originalUrl: string): Promise<string> {
    const fallbackUrls = this.getFallbackUrls(originalUrl);
    
    // Test URLs in parallel for speed
    const tests = fallbackUrls.map(async (url) => {
      const isGood = await this.checkUrlAccessibility(url);
      return { url, isGood };
    });
    
    try {
      const results = await Promise.allSettled(tests);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.isGood) {
          console.log('✅ Best URL found:', result.value.url);
          return result.value.url;
        }
      }
    } catch (error) {
      console.warn('⚠️ URL testing failed:', error);
    }
    
    // Fallback to original if all tests fail
    console.log('🔄 Using original URL as fallback:', originalUrl);
    return originalUrl;
  }
}

export default ModelRecovery; 