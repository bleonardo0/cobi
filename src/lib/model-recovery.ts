// Utilitaires pour la récupération des erreurs de modèles 3D

export interface ModelRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackToProxy?: boolean;
  logErrors?: boolean;
}

export class ModelRecovery {
  private static defaultOptions: ModelRecoveryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackToProxy: true,
    logErrors: true
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
   * Tente de récupérer un modèle avec différentes stratégies
   */
  static async recoverModel(
    originalSrc: string, 
    modelViewer: any,
    options: ModelRecoveryOptions = {}
  ): Promise<boolean> {
    const opts = { ...this.defaultOptions, ...options };
    
    if (opts.logErrors) {
      console.log('🔄 Tentative de récupération du modèle:', originalSrc);
    }

    // Stratégie 1: Retry simple
    for (let attempt = 1; attempt <= opts.maxRetries!; attempt++) {
      try {
        if (opts.logErrors) {
          console.log(`🔄 Tentative ${attempt}/${opts.maxRetries}`);
        }

        await this.reloadModel(modelViewer, originalSrc);
        await this.waitForLoad(modelViewer, 5000);
        
        if (opts.logErrors) {
          console.log('✅ Récupération réussie');
        }
        return true;
      } catch (error) {
        if (opts.logErrors) {
          console.log(`❌ Tentative ${attempt} échouée:`, error);
        }
        
        if (attempt < opts.maxRetries!) {
          await this.delay(opts.retryDelay!);
        }
      }
    }

    // Stratégie 2: Proxy fallback (si Supabase)
    if (opts.fallbackToProxy && originalSrc.includes('supabase.co')) {
      try {
        const proxyUrl = this.getProxyUrl(originalSrc);
        if (opts.logErrors) {
          console.log('🔄 Tentative avec proxy URL:', proxyUrl);
        }

        await this.reloadModel(modelViewer, proxyUrl);
        await this.waitForLoad(modelViewer, 5000);
        
        if (opts.logErrors) {
          console.log('✅ Récupération via proxy réussie');
        }
        return true;
      } catch (error) {
        if (opts.logErrors) {
          console.log('❌ Proxy fallback échoué:', error);
        }
      }
    }

    // Stratégie 3: Cache bust
    try {
      const cacheBustUrl = this.addCacheBuster(originalSrc);
      if (opts.logErrors) {
        console.log('🔄 Tentative avec cache bust:', cacheBustUrl);
      }

      await this.reloadModel(modelViewer, cacheBustUrl);
      await this.waitForLoad(modelViewer, 5000);
      
      if (opts.logErrors) {
        console.log('✅ Récupération avec cache bust réussie');
      }
      return true;
    } catch (error) {
      if (opts.logErrors) {
        console.log('❌ Cache bust échoué:', error);
      }
    }

    if (opts.logErrors) {
      console.log('❌ Toutes les stratégies de récupération ont échoué');
    }
    return false;
  }

  /**
   * Recharge un modèle dans model-viewer
   */
  static async reloadModel(modelViewer: any, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!modelViewer) {
        reject(new Error('ModelViewer non disponible'));
        return;
      }

      // Forcer le rechargement
      modelViewer.setAttribute('src', '');
      
      setTimeout(() => {
        modelViewer.setAttribute('src', src);
        resolve();
      }, 100);
    });
  }

  /**
   * Attend le chargement du modèle
   */
  static async waitForLoad(modelViewer: any, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!modelViewer) {
        reject(new Error('ModelViewer non disponible'));
        return;
      }

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout de chargement'));
      }, timeout);

      const handleLoad = () => {
        cleanup();
        resolve();
      };

      const handleError = (event: any) => {
        cleanup();
        reject(new Error('Erreur de chargement: ' + event.detail?.message || 'Inconnue'));
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
      };

      modelViewer.addEventListener('load', handleLoad);
      modelViewer.addEventListener('error', handleError);

      // Si déjà chargé
      if (modelViewer.loaded) {
        cleanup();
        resolve();
      }
    });
  }

  /**
   * Convertit une URL Supabase en URL proxy
   */
  static getProxyUrl(originalUrl: string): string {
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
   * Ajoute un cache buster à l'URL
   */
  static addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_cb=${Date.now()}`;
  }

  /**
   * Délai utilitaire
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Récupération automatique après sortie d'AR
   */
  static async recoverFromAR(modelViewer: any, originalSrc: string): Promise<boolean> {
    console.log('🔄 Récupération post-AR...');
    
    try {
      // Attendre un peu que l'AR se termine complètement
      await this.delay(500);
      
      // Forcer le rechargement
      await this.reloadModel(modelViewer, originalSrc);
      
      // Attendre le chargement avec un timeout plus court
      await this.waitForLoad(modelViewer, 3000);
      
      console.log('✅ Récupération post-AR réussie');
      return true;
    } catch (error) {
      console.log('❌ Récupération post-AR échouée, tentative de récupération complète...');
      
      // Fallback vers récupération complète
      return await this.recoverModel(originalSrc, modelViewer, {
        maxRetries: 2,
        retryDelay: 500,
        fallbackToProxy: true,
        logErrors: true
      });
    }
  }
}

export default ModelRecovery; 