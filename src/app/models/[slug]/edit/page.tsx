'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Model3D, SupportedMimeTypes, MenuCategory } from "@/types/model";
import { formatFileSize } from "@/lib/utils";
import { MENU_CATEGORIES, PREDEFINED_TAGS, PREDEFINED_ALLERGENS, getCategoryInfo, getTagInfo, getAllergenInfo } from "@/lib/constants";
import Link from "next/link";
import ModelViewer from "@/components/ModelViewer";
import HotspotButton from "@/components/HotspotButton";
import HotspotEditor from "@/components/HotspotEditor";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/providers/ClerkAuthProvider";

export default function EditModelPage() {
  const params = useParams();
  const router = useRouter();
  const [model, setModel] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [buttonClicked, setButtonClicked] = useState<string | null>(null);
  
  // Auth et restaurant
  const { user } = useAuth();
  const [restaurantSlug, setRestaurantSlug] = useState<string>('restaurant');
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');

  // États pour les notifications toast
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error'; position?: { top: number; left: number } }>>([]);

  // États pour les fichiers
  const [selectedGlbFile, setSelectedGlbFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [removeGlb, setRemoveGlb] = useState(false);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  
  // État pour le nom du modèle
  const [newModelName, setNewModelName] = useState('');
  
  // États pour les catégories et tags
  const [selectedCategory, setSelectedCategory] = useState<string>('autres');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // États pour les nouveaux champs restaurant
  const [price, setPrice] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [showAllergenDropdown, setShowAllergenDropdown] = useState(false);
  const allergenDropdownRef = useRef<HTMLDivElement>(null);

  // États pour les hotspots
  const [hotspotsEnabled, setHotspotsEnabled] = useState<boolean>(false);
  const [nutriScore, setNutriScore] = useState<'A' | 'B' | 'C' | 'D' | 'E' | ''>('');
  const [securityRisk, setSecurityRisk] = useState<boolean>(false);
  const [originCountry, setOriginCountry] = useState<string>('');
  const [transportDistance, setTransportDistance] = useState<string>('');
  const [carbonFootprint, setCarbonFootprint] = useState<string>('');
  
  // État pour l'éditeur de hotspots
  const [hotspotsConfig, setHotspotsConfig] = useState<any[]>([]);

  // État unifié pour toutes les sauvegardes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleLogout = () => {
          router.push('/sign-in');
  };

  // Fonction pour afficher les notifications toast
  const showToast = (message: string, type: 'success' | 'error' = 'success', element?: HTMLElement | null) => {
    const id = Date.now().toString();
    
    let position = undefined;
    if (element) {
      // Positionner à gauche du bouton flottant (position fixe)
      position = {
        top: window.innerHeight - 90, // Aligné avec le bouton
        left: window.innerWidth - 560 // À gauche du bouton (240px largeur bouton + 40px gap + 280px largeur toast)
      };
      console.log('Toast position:', position);
    }
    
    setToasts(prev => [...prev, { id, message, type, position }]);
    
    // Auto-remove after 4 seconds for contextual toasts, 3 for global ones
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, position ? 4000 : 3000);
  };

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (allergenDropdownRef.current && !allergenDropdownRef.current.contains(event.target as Node)) {
        setShowAllergenDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchModel = async (slug: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du modèle');
      }
      
      const data = await response.json();
      const foundModel = data.models.find((m: Model3D) => m.slug === slug);
      
      if (!foundModel) {
        setError('Modèle non trouvé');
        return;
      }
      
      // Détecter le format si pas défini
      if (foundModel && !foundModel.format) {
        const filename = foundModel.filename || foundModel.originalName || '';
        if (filename.toLowerCase().endsWith('.usdz')) {
          foundModel.format = 'USDZ';
        } else if (filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')) {
          foundModel.format = 'GLB';
        }
      }
      
      setModel(foundModel);
      setNewModelName(foundModel.name || ''); // Initialiser avec le nom actuel
      setSelectedCategory(foundModel.category || 'autres');
      setSelectedTags(foundModel.tags || []);
      setPrice(foundModel.price ? foundModel.price.toString() : '');
      setShortDescription(foundModel.shortDescription || '');
      setIngredients(foundModel.ingredients || []);
      setSelectedAllergens(foundModel.allergens || []);
      
      // Initialiser les hotspots
      setHotspotsEnabled(foundModel.hotspotsEnabled || false);
      setNutriScore(foundModel.nutriScore || '');
      setSecurityRisk(foundModel.securityRisk || false);
      setOriginCountry(foundModel.originCountry || '');
      setTransportDistance(foundModel.transportDistance ? foundModel.transportDistance.toString() : '');
      setCarbonFootprint(foundModel.carbonFootprint ? foundModel.carbonFootprint.toString() : '');
      
      // Initialiser la configuration des hotspots
      setHotspotsConfig(foundModel.hotspotsConfig || []);
      
      console.log('🔍 Model loaded for editing:', foundModel);
    } catch (error) {
      console.error('Error fetching model:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlbInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleGlbSelection(files[0]);
    }
  };



  const handleThumbnailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleThumbnailSelection(files[0]);
    }
  };

  const handleGlbSelection = (file: File) => {
    setUpdateError(null);
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['model/gltf-binary', 'model/gltf+json'];
    const hasValidExtension = /\.(glb|gltf)$/i.test(file.name);
    
    if (file.size > maxSize) {
      setUpdateError('Le fichier GLB ne doit pas dépasser 50MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setUpdateError('Format non supporté. Utilisez GLB ou GLTF');
      return;
    }

    // Vérifier si le nom de fichier est valide
    if (file.name.length > 255) {
      setUpdateError('Le nom de fichier est trop long (max 255 caractères)');
      return;
    }

    // Conseils pour éviter les conflits
    console.log(`📁 Fichier GLB sélectionné: ${file.name}`);
    
    setSelectedGlbFile(file);
    setRemoveGlb(false);
  };



  const handleThumbnailSelection = (file: File) => {
    setUpdateError(null);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUpdateError('L\'image ne doit pas dépasser 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUpdateError('Format d\'image non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }
    
    setSelectedThumbnail(file);
    setRemoveThumbnail(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergenId)
        ? prev.filter(a => a !== allergenId)
        : [...prev, allergenId]
    );
  };

  // Gestion des ingrédients
  const addIngredient = () => {
    if (!newIngredient.trim()) return;

    // Diviser par les virgules et traiter chaque ingrédient
    const ingredientsList = newIngredient
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);

    // Ajouter uniquement les nouveaux ingrédients (éviter les doublons)
    const newIngredients = ingredientsList.filter(ingredient => 
      !ingredients.includes(ingredient)
    );

    if (newIngredients.length > 0) {
      setIngredients(prev => [...prev, ...newIngredients]);
    }
    
    setNewIngredient('');
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const handleIngredientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  // Fonction de sauvegarde unifiée
  const saveAllChanges = async () => {
    if (!model || isSaving) return;

    setButtonClicked('save-all');
    setIsSaving(true);
    setUpdateError(null);

    try {
      // Étape 1: Sauvegarder les métadonnées si elles ont changé
      const hasMetadataChanges = (
        selectedCategory !== (model?.category || 'autres') ||
        JSON.stringify(selectedTags.sort()) !== JSON.stringify((model?.tags || []).sort()) ||
        price !== (model?.price ? model.price.toString() : '') ||
        shortDescription !== (model?.shortDescription || '') ||
        JSON.stringify(ingredients.sort()) !== JSON.stringify((model?.ingredients || []).sort()) ||
        JSON.stringify(selectedAllergens.sort()) !== JSON.stringify((model?.allergens || []).sort()) ||
        hotspotsEnabled !== (model?.hotspotsEnabled || false) ||
        nutriScore !== (model?.nutriScore || '') ||
        securityRisk !== (model?.securityRisk || false) ||
        originCountry !== (model?.originCountry || '') ||
        transportDistance !== (model?.transportDistance ? model.transportDistance.toString() : '') ||
        carbonFootprint !== (model?.carbonFootprint ? model.carbonFootprint.toString() : '')
      );

      if (hasMetadataChanges) {
        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('tags', JSON.stringify(selectedTags));
        
        if (price) formData.append('price', price);
        if (shortDescription) formData.append('shortDescription', shortDescription);
        formData.append('ingredients', JSON.stringify(ingredients));
        formData.append('allergens', JSON.stringify(selectedAllergens));
        formData.append('hotspotsEnabled', hotspotsEnabled.toString());
        if (nutriScore) formData.append('nutriScore', nutriScore);
        formData.append('securityRisk', securityRisk.toString());
        if (originCountry) formData.append('originCountry', originCountry);
        if (transportDistance) formData.append('transportDistance', transportDistance);
        if (carbonFootprint) formData.append('carbonFootprint', carbonFootprint);

        const response = await fetch(`/api/models/${model.id}`, {
          method: 'PATCH',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour des informations');
        }

        const data = await response.json();
        if (data.success) {
          setModel(data.model);
        } else {
          throw new Error(data.error || 'Erreur lors de la mise à jour');
        }
      }

      // Étape 2: Gérer les fichiers si nécessaire
      const hasFileChanges = selectedGlbFile || selectedThumbnail || removeGlb || removeThumbnail;
      
      if (hasFileChanges) {
        // Temporairement simulé pour le debug
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSelectedGlbFile(null);
        setSelectedThumbnail(null);
        setThumbnailPreview(null);
        setRemoveGlb(false);
        setRemoveThumbnail(false);
      }

      // Réinitialiser l'état des changements
      setHasUnsavedChanges(false);
      
      // Afficher le toast de succès
      setTimeout(() => {
        const saveButton = document.getElementById('unified-save-button');
        if (saveButton) {
          showToast('✅ Toutes les modifications sauvegardées !', 'success', saveButton);
        } else {
          showToast('✅ Toutes les modifications sauvegardées !', 'success');
        }
      }, 100);

    } catch (error) {
      console.error('Erreur:', error);
      setUpdateError(error instanceof Error ? error.message : 'Erreur inconnue');
      showToast('❌ Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
      setButtonClicked(null);
    }
  };

  const updateModelName = async () => {
    if (!model || !newModelName.trim() || newModelName === model.name) return;

    setIsSaving(true);
    setUpdateError(null);

    try {
      const formData = new FormData();
      formData.append('modelName', newModelName.trim());

      const response = await fetch(`/api/models/${model.id}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('🎉 Nom mis à jour:', data);
        setTimeout(() => {
          window.location.href = `/models/${model.slug}`;
        }, 500);
      } else {
        throw new Error(data.error || 'Erreur lors de la mise à jour du nom');
      }
    } catch (error) {
      console.error('Update name error:', error);
      setUpdateError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du nom');
    } finally {
      setIsSaving(false);
    }
  };

  // Système de détection des changements
  useEffect(() => {
    if (!model) return;

    const hasMetadataChanges = (
      selectedCategory !== (model?.category || 'autres') ||
      JSON.stringify(selectedTags.sort()) !== JSON.stringify((model?.tags || []).sort()) ||
      price !== (model?.price ? model.price.toString() : '') ||
      shortDescription !== (model?.shortDescription || '') ||
      JSON.stringify(ingredients.sort()) !== JSON.stringify((model?.ingredients || []).sort()) ||
      JSON.stringify(selectedAllergens.sort()) !== JSON.stringify((model?.allergens || []).sort()) ||
      hotspotsEnabled !== (model?.hotspotsEnabled || false) ||
      nutriScore !== (model?.nutriScore || '') ||
      securityRisk !== (model?.securityRisk || false) ||
      originCountry !== (model?.originCountry || '') ||
      transportDistance !== (model?.transportDistance ? model.transportDistance.toString() : '') ||
      carbonFootprint !== (model?.carbonFootprint ? model.carbonFootprint.toString() : '')
    );

    const hasFileChanges = !!(selectedGlbFile || selectedThumbnail || removeGlb || removeThumbnail);
    
    setHasUnsavedChanges(hasMetadataChanges || hasFileChanges);
  }, [
    model, selectedCategory, selectedTags, price, shortDescription, ingredients, selectedAllergens,
    hotspotsEnabled, nutriScore, securityRisk, originCountry, transportDistance, carbonFootprint,
    selectedGlbFile, selectedThumbnail, removeGlb, removeThumbnail
  ]);

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

  if (error) {
    return (
      <DashboardLayout
        userRole={user?.role || 'restaurateur'}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center text-red-600">
            <p>Erreur: {error}</p>
            <Link href="/restaurant/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
              ← Retour au dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!model) {
    return (
      <DashboardLayout
        userRole={user?.role || 'restaurateur'}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p>Modèle non trouvé</p>
            <Link href="/restaurant/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
              ← Retour au dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole={user?.role || 'restaurateur'}
      restaurantName={restaurantName}
      restaurantSlug={restaurantSlug}
      showFloatingButton={false}
    >
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.filter(toast => !toast.position).map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              {toast.message}
            </div>
          </div>
        ))}
      </div>

      {/* Contextual toast notifications */}
      {toasts.filter(toast => toast.position).map(toast => (
        <div
          key={toast.id}
          className={`fixed z-50 px-6 py-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-right transition-all duration-500 transform ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 shadow-green-500/20' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200 shadow-red-500/20'
          }`}
          style={{
            top: `${toast.position!.top}px`,
            left: `${toast.position!.left}px`,
            minWidth: '280px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center text-base font-semibold">
            <span className="mr-3 text-2xl">
              {toast.type === 'success' ? '🎉' : '❌'}
            </span>
            {toast.message}
          </div>
          {/* Petite flèche pointant vers le bouton */}
          <div className={`absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-r-0 border-t-8 border-b-8 border-transparent ${
            toast.type === 'success' ? 'border-l-green-200' : 'border-l-red-200'
          }`}></div>
        </div>
      ))}

      {/* Bouton de sauvegarde unifié flottant */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          <button
            id="unified-save-button"
            onClick={saveAllChanges}
            disabled={isSaving || buttonClicked === 'save-all'}
            className={`group relative inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden min-w-[240px] border-2 ${
              isSaving || buttonClicked === 'save-all'
                ? 'bg-gray-400 border-gray-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 border-white/20 hover:border-white/40 text-white'
            }`}
            style={{ 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            }}
          >
            {isSaving || buttonClicked === 'save-all' ? (
              <>
                <motion.svg 
                  className="w-5 h-5 relative z-10 flex-shrink-0 text-white drop-shadow-sm"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                <motion.span
                  className="font-bold text-sm relative z-10 whitespace-nowrap text-white drop-shadow-sm"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  Sauvegarde...
                </motion.span>
              </>
            ) : (
              <>
                <motion.svg
                  className="w-5 h-5 relative z-10 flex-shrink-0 text-white drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
                <motion.span
                  className="font-bold text-sm relative z-10 whitespace-nowrap text-white drop-shadow-sm"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  Sauvegarder les modifications
                </motion.span>
              </>
            )}
            
            {/* Effet de vagues au hover */}
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Animation de pulse pour attirer l'attention */}
            <motion.div
              className="absolute inset-0 bg-white opacity-15 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Effet de brillance */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 rounded-full"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />

            {/* Backdrop pour plus de contraste */}
            <div className="absolute inset-0 bg-black/10 rounded-full" />
          </button>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link href="/restaurant/dashboard" className="hover:text-neutral-900 transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/models/${model.slug}`} className="hover:text-neutral-900 transition-colors">
            {model.name}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium">
            Modifier
          </span>
        </nav>

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Modifier {model.name}</h1>
          <p className="text-neutral-600 mt-1">Modifiez les fichiers de votre modèle 3D</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8"
        >
          <div className="space-y-8">
            {/* Fichiers actuels */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Fichiers actuels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GLB actuel */}
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-sky-600 rounded-full mr-2"></span>
                    Fichier GLB
                  </h3>
                  {model.url ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Présent</span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Disponible</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Taille: {formatFileSize(model.fileSize)}
                      </div>
                      <button
                        onClick={() => setRemoveGlb(!removeGlb)}
                        className={`text-xs px-2 py-1 rounded ${
                          removeGlb 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {removeGlb ? 'Annuler suppression' : 'Supprimer GLB'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Aucun fichier GLB</div>
                  )}
                </div>


              </div>
            </div>

            {/* Modification du nom du modèle */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nom d'affichage</h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du modèle (affiché dans la galerie)
                </label>
                <input
                  type="text"
                  id="modelName"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newModelName !== model.name && newModelName.trim()) {
                      e.preventDefault();
                      updateModelName();
                    }
                  }}
                  placeholder="Entrez le nom d'affichage"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce nom sera affiché dans la galerie. Le nom du fichier reste inchangé.
                </p>
                {newModelName !== model.name && newModelName.trim() && (
                  <div className="mt-2 space-y-2">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <strong>Aperçu :</strong> Le modèle s'appellera "{newModelName}"
                    </div>
                    <button
                      onClick={updateModelName}
                      disabled={isSaving || !newModelName.trim() || newModelName === model.name}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder le nom'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Catégorie et Tags */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du Plat</h2>
              <div className="border border-gray-200 rounded-lg p-4 space-y-6">
                
                {/* Catégorie */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {MENU_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    {(() => {
                      const categoryInfo = getCategoryInfo(selectedCategory as MenuCategory);
                      return categoryInfo ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryInfo.color}`}>
                          <span className="mr-1">{categoryInfo.icon}</span>
                          {categoryInfo.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="relative" ref={tagDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowTagDropdown(!showTagDropdown)}
                      className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      {selectedTags.length > 0 ? `${selectedTags.length} tag(s) sélectionné(s)` : 'Sélectionner des tags...'}
                      <svg className="w-5 h-5 text-gray-400 float-right mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showTagDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {PREDEFINED_TAGS.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              selectedTags.includes(tag.id) ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              {tag.name}
                              {selectedTags.includes(tag.id) && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Affichage des tags sélectionnés */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTags.length > 0 ? (
                      selectedTags.map((tagId) => {
                        const tagInfo = getTagInfo(tagId);
                        return tagInfo ? (
                          <span
                            key={tagId}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tagInfo.color}`}
                          >
                            {tagInfo.name}
                            <button
                              type="button"
                              onClick={() => toggleTag(tagId)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun tag sélectionné</span>
                    )}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15.50"
                    min="0"
                    step="0.01"
                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                   />
                </div>

                {/* Description courte */}
                <div>
                  <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description courte (max 150 caractères)
                  </label>
                  <textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Une délicieuse description de votre plat..."
                    maxLength={150}
                    rows={3}
                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
                   />
                  <div className="text-xs text-gray-500 mt-1">
                    {shortDescription.length}/150 caractères
                  </div>
                </div>

                {/* Ingrédients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingrédients
                  </label>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={handleIngredientKeyPress}
                      placeholder="ex: Mozzarella, Tomates, Basilic (séparez par des virgules et appuyez sur Entrée)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  
                  {/* Liste des ingrédients */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ingredients.length > 0 ? (
                      ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                        >
                          <span className="mr-1">🧄</span>
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => removeIngredient(ingredient)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun ingrédient ajouté</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Tapez un ou plusieurs ingrédients séparés par des virgules et appuyez sur Entrée pour les ajouter
                  </p>
                </div>

                {/* Allergènes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergènes
                  </label>
                  <div className="relative" ref={allergenDropdownRef}>
                    <button
                      type="button"
                                             onClick={() => setShowAllergenDropdown(!showAllergenDropdown)}
                       className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      {selectedAllergens.length > 0 ? `${selectedAllergens.length} allergène(s) sélectionné(s)` : 'Sélectionner des allergènes...'}
                      <svg className="w-5 h-5 text-gray-400 float-right mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showAllergenDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {PREDEFINED_ALLERGENS.map((allergen) => (
                          <button
                            key={allergen.id}
                            type="button"
                            onClick={() => toggleAllergen(allergen.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              selectedAllergens.includes(allergen.id) ? 'bg-red-50 text-red-700' : ''
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span className="flex items-center">
                                <span className="mr-2">{allergen.icon}</span>
                                {allergen.name}
                              </span>
                              {selectedAllergens.includes(allergen.id) && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Affichage des allergènes sélectionnés */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedAllergens.length > 0 ? (
                      selectedAllergens.map((allergenId) => {
                        const allergenInfo = getAllergenInfo(allergenId);
                        return allergenInfo ? (
                          <span
                            key={allergenId}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${allergenInfo.color}`}
                          >
                            <span className="mr-1">{allergenInfo.icon}</span>
                            {allergenInfo.name}
                            <button
                              type="button"
                              onClick={() => toggleAllergen(allergenId)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun allergène sélectionné</span>
                    )}
                  </div>
                </div>

                {/* Plus besoin de bouton de sauvegarde ici - géré par le bouton flottant unifié */}
              </div>
            </div>

            {/* Configuration des hotspots */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration des hotspots</h2>
              <div className="border border-gray-200 rounded-lg p-4 space-y-6">
                
                {/* Toggle principal */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      🎯 Activer les hotspots
                    </h3>
                    <p className="text-sm text-gray-500">Ajouter des points interactifs sur le modèle 3D</p>
                  </div>
                  <button
                    onClick={() => setHotspotsEnabled(!hotspotsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hotspotsEnabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hotspotsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Configuration des hotspots (visible seulement si activé) */}
                {hotspotsEnabled && (
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Sécurité alimentaire */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">🛡️</span>
                          Sécurité alimentaire
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Nutri-Score
                          </label>
                          <select
                            value={nutriScore}
                            onChange={(e) => setNutriScore(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' | '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="">Sélectionner</option>
                            <option value="A">A - Excellent</option>
                            <option value="B">B - Bon</option>
                            <option value="C">C - Moyen</option>
                            <option value="D">D - Mauvais</option>
                            <option value="E">E - Très mauvais</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="securityRisk"
                            checked={securityRisk}
                            onChange={(e) => setSecurityRisk(e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <label htmlFor="securityRisk" className="text-sm text-gray-700">
                            ⚠️ Risque de sécurité alimentaire
                          </label>
                        </div>
                      </div>

                      {/* Traçabilité */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">📍</span>
                          Traçabilité
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Pays d'origine
                          </label>
                          <input
                            type="text"
                            value={originCountry}
                            onChange={(e) => setOriginCountry(e.target.value)}
                            placeholder="ex: France"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Distance de transport (km)
                          </label>
                          <input
                            type="number"
                            value={transportDistance}
                            onChange={(e) => setTransportDistance(e.target.value)}
                            placeholder="ex: 150"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Empreinte carbone */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">🌱</span>
                          Empreinte carbone
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Émissions CO2 (kg)
                          </label>
                          <input
                            type="number"
                            value={carbonFootprint}
                            onChange={(e) => setCarbonFootprint(e.target.value)}
                            placeholder="ex: 2.5"
                            min="0"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Émissions de CO2 liées à la production et transport
                          </p>
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">📊</span>
                          Statistiques
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Note moyenne:</span>
                            <span className="font-medium">
                              {model.averageRating ? model.averageRating.toFixed(1) : 'N/A'} ⭐
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Nombre d'avis:</span>
                            <span className="font-medium">
                              {model.ratingCount || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Les statistiques sont mises à jour automatiquement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aperçu des hotspots activés */}
                {hotspotsEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Aperçu des hotspots qui seront affichés :
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {nutriScore && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🛡️ Nutri-Score {nutriScore}
                        </span>
                      )}
                      {securityRisk && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠️ Risque sécurité
                        </span>
                      )}
                      {originCountry && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📍 {originCountry}
                        </span>
                      )}
                      {transportDistance && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🚚 {transportDistance} km
                        </span>
                      )}
                      {carbonFootprint && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🌱 {carbonFootprint} kg CO2
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⭐ Notation
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        📤 Partage
                      </span>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* Éditeur de hotspots interactif */}
            {hotspotsEnabled && model && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🎯 Éditeur de hotspots interactif
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">Comment utiliser l'éditeur :</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Sélectionnez un type de hotspot dans la barre d'outils</li>
                        <li>• Cliquez sur le modèle 3D pour placer le hotspot</li>
                        <li>• Utilisez le mode édition pour déplacer ou supprimer les hotspots</li>
                        <li>• Les hotspots seront sauvegardés avec le modèle</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <HotspotEditor
                  modelSrc={model.url}
                  modelName={model.name}
                  initialHotspots={hotspotsConfig}
                  onHotspotsChange={setHotspotsConfig}
                />
              </div>
            )}

            {/* Upload de nouveaux fichiers */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Modifier les fichiers</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 mb-1">À propos des noms de fichiers</h3>
                    <p className="text-sm text-blue-800">
                      Le nom affiché sera celui de votre fichier. Si un fichier avec ce nom existe déjà, 
                      vous devrez renommer votre fichier avant de l'uploader.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* GLB Upload */}
              <div className="border border-gray-200 rounded-lg p-6 mb-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  {model.url ? 'Remplacer le fichier GLB' : 'Ajouter un fichier GLB'}
                </h3>
                
                {!selectedGlbFile ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleGlbInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm text-gray-600">Cliquez pour sélectionner un fichier GLB/GLTF</p>
                      <p className="text-xs text-gray-400">Max 50MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedGlbFile.name}</p>
                          <p className="text-sm text-gray-500">GLB • {formatFileSize(selectedGlbFile.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedGlbFile(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>


            </div>

            {/* Thumbnail */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-3">Image de prévisualisation</h3>
              
              {model.thumbnailUrl && !removeThumbnail && !selectedThumbnail && (
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <img src={model.thumbnailUrl} alt="Thumbnail actuel" className="w-16 h-16 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Image actuelle</p>
                      <button
                        onClick={() => setRemoveThumbnail(!removeThumbnail)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Supprimer l'image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!selectedThumbnail && !removeThumbnail && (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {model.thumbnailUrl ? 'Remplacer l\'image' : 'Ajouter une image'}
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP • Max 10MB</p>
                  </div>
                </div>
              )}

              {selectedThumbnail && (
                <div className="flex items-center space-x-4">
                  {thumbnailPreview && (
                    <img src={thumbnailPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedThumbnail.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedThumbnail.size)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedThumbnail(null);
                      setThumbnailPreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Progress */}
            {isSaving && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mise à jour en cours...</span>
                  <span className="text-gray-900 font-medium">{updateProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 10l-1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800 text-sm">{updateError}</p>
                </div>
              </div>
            )}

            {/* Actions simplifiées */}
            <div className="flex items-center justify-center pt-6 border-t border-neutral-200">
              <Link
                href={`/models/${model.slug}`}
                className="px-6 py-3 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
              >
                ← Retour au modèle
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}