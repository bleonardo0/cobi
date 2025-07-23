'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Model3D } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import Link from "next/link";
import ModelViewer from "@/components/ModelViewer";
import BackButton from "@/components/BackButton";
import HotspotViewer from "@/components/HotspotViewer";
import QRCode from 'qrcode';
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatsCard from "@/components/shared/StatsCard";
import { useAuth } from "@/providers/ClerkAuthProvider";

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelViewerRef = useRef<HTMLElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Auth et restaurant
  const { user } = useAuth();
  const [restaurantSlug, setRestaurantSlug] = useState<string>('restaurant');
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  
  // États pour les nouvelles fonctionnalités
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [hotspotsEnabled, setHotspotsEnabled] = useState(true);
  const [performanceStats, setPerformanceStats] = useState<{
    loadTime?: number;
    triangles?: number;
    vertices?: number;
    isHeavy?: boolean;
  }>({});
  
  // Pour gérer la position de scroll lors du retour
  const { clearScrollPosition } = useScrollPosition('gallery', false);

  useEffect(() => {
    if (params.slug) {
      fetchModel(params.slug as string);
    }
  }, [params.slug]);

  // Récupérer les informations du restaurant
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (user?.restaurantId) {
        try {
          const response = await fetch(`/api/admin/restaurants/${user.restaurantId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.restaurant) {
              setRestaurantSlug(data.restaurant.slug);
              setRestaurantName(data.restaurant.name);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du restaurant:', error);
        }
      }
    };

    if (user) {
      fetchRestaurantInfo();
    }
  }, [user]);

  useEffect(() => {
    // Charger model-viewer dynamiquement côté client
    import('@google/model-viewer').then(() => {
      console.log('model-viewer chargé');
      
      // Initialiser l'analyse de performance
      setTimeout(() => {
        if (modelViewerRef.current) {
          analyzePerformance(modelViewerRef.current);
        }
      }, 1000);
    }).catch((error) => {
      console.error('Erreur lors du chargement de model-viewer:', error);
    });
  }, [model]);

  const fetchModel = async (slug: string) => {
    try {
      setIsLoading(true);
      // Ajouter un cache-bust pour forcer la récupération des données fraîches
      const response = await fetch(`/api/models?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du modèle');
      }
      
      const data = await response.json();
      const foundModel = data.models.find((m: Model3D) => m.slug === slug);
      
      if (!foundModel) {
        setError('Modèle non trouvé');
        return;
      }
      
      console.log('📊 Modèle récupéré:', foundModel);
      setModel(foundModel);
    } catch (error) {
      console.error('Error fetching model:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleARClick = () => {
    if (modelViewerRef.current) {
      try {
        const modelViewer = modelViewerRef.current;
        
        if (typeof (modelViewer as any).activateAR === 'function') {
          (modelViewer as any).activateAR();
        } else {
          setTimeout(() => {
            if (typeof (modelViewer as any).activateAR === 'function') {
              (modelViewer as any).activateAR();
            } else {
              console.error('AR non disponible pour ce modèle');
              alert('La réalité augmentée n\'est pas disponible sur cet appareil ou navigateur.');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Erreur lors de l\'activation AR:', error);
        alert('Impossible d\'activer la réalité augmentée. Assurez-vous d\'utiliser un appareil compatible.');
      }
    }
  };

  const generateQRCode = async () => {
    if (showQRCode) {
      setShowQRCode(false);
      setQrCodeUrl(null);
      return;
    }

    try {
      const currentUrl = window.location.href;
      const qrDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      alert('Erreur lors de la génération du QR code');
    }
  };

  const analyzePerformance = (modelViewer: any) => {
    if (!model) return;
    
    const startTime = Date.now();
    
    modelViewer.addEventListener('load', () => {
      const loadTime = Date.now() - startTime;
      
      // Estimation basique des métriques (à améliorer avec de vraies données du modèle)
      const fileSize = model.fileSize;
      const estimatedTriangles = Math.floor(fileSize / 1000); // Estimation approximative
      const estimatedVertices = Math.floor(estimatedTriangles * 1.5);
      const isHeavy = fileSize > 20 * 1024 * 1024; // > 20MB
      
      setPerformanceStats({
        loadTime,
        triangles: estimatedTriangles,
        vertices: estimatedVertices,
        isHeavy
      });
    });
  };



  const handleDeleteModel = async () => {
    if (!model) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to home page after successful deletion
        router.push('/');
      } else {
        alert('Erreur lors de la suppression: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du modèle');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
          router.push('/sign-in');
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <DashboardLayout
        userRole={user?.role || 'restaurateur'}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Chargement du modèle...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !model) {
    return (
      <DashboardLayout
        userRole={user?.role || 'restaurateur'}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Modèle non trouvé
            </h1>
            <p className="text-neutral-600 mb-6">
              {error || 'Le modèle demandé n&apos;existe pas ou a été supprimé.'}
            </p>
            <BackButton 
              fallbackHref="/restaurant/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour au dashboard
            </BackButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const topBarActions = (
    <div className="flex items-center space-x-3">
      <Link
        href={`/models/${model.slug}/edit`}
        className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium shadow-sm"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Modifier
      </Link>
      
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Supprimer
      </button>
    </div>
  );

  return (
    <DashboardLayout
      userRole={user?.role || 'restaurateur'}
      restaurantName={restaurantName}
      restaurantSlug={restaurantSlug}
      topBarActions={topBarActions}
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link href="/restaurant/dashboard" className="hover:text-neutral-900 transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium">
            {model.name}
          </span>
        </nav>

        {/* En-tête avec titre et badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {model.name}
            </h1>
            <p className="text-neutral-600 mt-1 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                <span className="w-2 h-2 bg-sky-600 rounded-full mr-1"></span>
                GLB/GLTF
              </span>
              <span>•</span>
              <span>{formatFileSize(model.fileSize)}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-500">
              Actions disponibles dans la barre du haut
            </span>
          </div>
        </div>

        {/* Métriques du modèle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Taille du fichier"
            value={formatFileSize(model.fileSize)}
            emoji="📁"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="blue"
          />
          <StatsCard
            title="Format"
            value="GLB/GLTF"
            emoji="🎨"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="green"
          />
          <StatsCard
            title="Catégorie"
            value={model.category || 'Non définie'}
            emoji="🏷️"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            color="purple"
          />
        </div>
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Model Viewer & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div ref={viewerContainerRef} className="relative h-80 lg:h-[500px] xl:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100">
                <ModelViewer
                  ref={modelViewerRef}
                  src={model.url}
                  alt={model.name}
                  className="w-full h-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                />
                
                {/* Hotspots */}
                {model.hotspotsEnabled && (
                  <HotspotViewer
                    hotspotsConfig={model.hotspotsConfig}
                    enabled={hotspotsEnabled}
                    onHotspotClick={(type, data) => {
                      console.log('Hotspot clicked:', type, data);
                    }}
                  />
                )}
                
                {/* Contrôles hotspots */}
                {model.hotspotsEnabled && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                      <button
                        onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                        className={`p-2 rounded transition-colors ${
                          hotspotsEnabled
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        title={hotspotsEnabled ? 'Masquer les hotspots' : 'Afficher les hotspots'}
                      >
                        {hotspotsEnabled ? '👁️' : '🚫'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="p-4 border-t border-neutral-200">
                <div className="text-sm text-neutral-600">
                  Utilisez votre souris ou vos doigts pour explorer le modèle
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Fonctionnalités
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Rotation automatique</span>
                </div>
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Contrôles de caméra</span>
                </div>
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Réalité augmentée (iOS/Safari)</span>
                </div>
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Hotspots interactifs</span>
                </div>
                
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">Téléchargement direct</span>
                </div>
              </div>
            </div>

            {/* Share & AR */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Partager & AR
              </h2>
              
              <div className="space-y-3">
                {/* QR Code Toggle */}
                <button
                  onClick={generateQRCode}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 10h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zM17 4h2a1 1 0 011 1v3a1 1 0 01-1 1h-2a1 1 0 01-1-1V5a1 1 0 011-1z"
                    />
                  </svg>
                  {showQRCode ? 'Masquer QR Code' : 'Générer QR Code AR'}
                </button>

                {showQRCode && qrCodeUrl && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg text-center">
                    <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code pour la réalité augmentée" 
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-purple-700 mt-3">
                      📱 Scannez avec votre mobile pour voir en AR
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Compatible iOS Safari & Android Chrome
                    </p>
                  </div>
                )}

                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copier le lien
                </button>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="space-y-6">
            {/* Thumbnail Preview */}
            {model.thumbnailUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Aperçu
                </h2>
                <img 
                  src={model.thumbnailUrl} 
                  alt={`Aperçu de ${model.name}`}
                  className="w-full rounded-lg border border-neutral-200"
                />
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Détails du modèle
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom</label>
                  <p className="text-gray-900">{model.name}</p>
                </div>

                {/* Catégorie et Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Catégorie</label>
                  <p className="text-gray-900">{model.category || 'Non définie'}</p>
                </div>

                {model.tags && model.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {model.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prix */}
                {model.price && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prix</label>
                    <p className="text-gray-900 font-semibold text-lg">
                      {model.price.toFixed(2)} €
                    </p>
                  </div>
                )}

                {/* Description courte */}
                {model.shortDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{model.shortDescription}</p>
                  </div>
                )}

                {/* Description longue */}
                {model.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description détaillée</label>
                    <p className="text-gray-900">{model.description}</p>
                  </div>
                )}

                {/* Ingrédients */}
                {model.ingredients && model.ingredients.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">🥘 Ingrédients</label>
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex flex-wrap gap-1">
                        {model.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            🌿 {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Allergènes */}
                {model.allergens && model.allergens.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">⚠️ Allergènes</label>
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex flex-wrap gap-1">
                        {model.allergens.map((allergen, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            ⚠️ {allergen}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Contient ou peut contenir des traces de ces allergènes
                      </p>
                    </div>
                  </div>
                )}

                {/* Informations nutritionnelles supplémentaires */}
                {(model.nutriScore || model.originCountry || model.carbonFootprint) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">📊 Informations nutritionnelles</label>
                    <div className="mt-2 space-y-2">
                      {model.nutriScore && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Nutri-Score:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            model.nutriScore === 'A' ? 'bg-green-500 text-white' :
                            model.nutriScore === 'B' ? 'bg-lime-400 text-black' :
                            model.nutriScore === 'C' ? 'bg-yellow-400 text-black' :
                            model.nutriScore === 'D' ? 'bg-orange-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {model.nutriScore}
                          </span>
                        </div>
                      )}
                      
                      {model.originCountry && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">🌍 Origine:</span>
                          <span className="text-sm text-gray-900">{model.originCountry}</span>
                        </div>
                      )}
                      
                      {model.carbonFootprint && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">🌱 Empreinte carbone:</span>
                          <span className="text-sm text-gray-900">{model.carbonFootprint} kg CO₂</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date d&apos;ajout</label>
                  <p className="text-gray-900">
                    {new Date(model.uploadDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Statistiques de performance */}
                {(performanceStats.loadTime || performanceStats.triangles) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Performance</label>
                    <div className="mt-1 space-y-1">
                      {performanceStats.loadTime && (
                        <p className="text-sm text-gray-700">
                          ⏱️ Temps de chargement: {performanceStats.loadTime}ms
                        </p>
                      )}
                      {performanceStats.triangles && (
                        <p className="text-sm text-gray-700">
                          🔺 ~{performanceStats.triangles.toLocaleString()} triangles
                        </p>
                      )}
                    </div>
                    {performanceStats.isHeavy && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs text-orange-700">
                          ⚠️ Modèle lourd - Peut affecter les performances sur mobile
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Accordéon Avancé */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-500">Informations techniques</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                      <div>
                        <label className="text-xs font-medium text-gray-400">Format</label>
                        <p className="text-sm text-gray-600">GLB/GLTF</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400">Poids du fichier</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600">{formatFileSize(model.fileSize)}</p>
                          {performanceStats.isHeavy && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              ⚠️ Lourd
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400">Nom de fichier</label>
                        <p className="text-sm text-gray-600 break-all">{model.filename}</p>
                      </div>
                      {performanceStats.vertices && (
                        <div>
                          <label className="text-xs font-medium text-gray-400">Estimation vertices</label>
                          <p className="text-sm text-gray-600">{performanceStats.vertices.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Confirmer la suppression
              </h3>
            </div>
            
            <p className="text-neutral-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le modèle &quot;{model.name}&quot; ? 
              Cette action est irréversible et supprimera définitivement le fichier et ses données.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteModel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 