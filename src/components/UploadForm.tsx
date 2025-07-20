'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Model3D, SupportedMimeTypes, MenuCategory } from '@/types/model';
import { formatFileSize } from '@/lib/utils';
import { MENU_CATEGORIES, PREDEFINED_TAGS, PREDEFINED_ALLERGENS, getCategoryInfo, getTagInfo, getAllergenInfo } from '@/lib/constants';
import ModelViewer from '@/components/ModelViewer';
import HotspotButton from '@/components/HotspotButton';
import HotspotEditor from '@/components/HotspotEditor';

interface UploadFormProps {
  onUploadSuccess: (model: Model3D) => void;
  restaurantId?: string;
}

// Composant pour l'aperçu du modèle
function ModelPreview({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadModelViewer = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Charger model-viewer dynamiquement
        await import('@google/model-viewer');
        
        // Attendre un peu pour la stabilité
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;

        // Créer l'élément model-viewer
        const modelViewer = document.createElement('model-viewer');
        modelViewer.src = src;
        modelViewer.alt = 'Preview du modèle 3D';
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('loading', 'eager');
        modelViewer.setAttribute('reveal', 'auto');
        modelViewer.style.width = '100%';
        modelViewer.style.height = '100%';
        modelViewer.style.backgroundColor = 'transparent';

        // Ajouter les événements
        modelViewer.addEventListener('load', () => {
          if (isMounted) {
            setIsLoading(false);
            setHasError(false);
          }
        });

        modelViewer.addEventListener('error', () => {
          if (isMounted) {
            setIsLoading(false);
            setHasError(true);
          }
        });

        // Ajouter au container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(modelViewer);
        }

      } catch (error) {
        console.error('Erreur lors du chargement du preview:', error);
        if (isMounted) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    };

    loadModelViewer();

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Chargement du modèle...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-red-600">Erreur lors du chargement</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadForm({ onUploadSuccess, restaurantId }: UploadFormProps) {
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFileSelection, setShowFileSelection] = useState(true);
  
  // États pour les catégories et tags
  const [selectedCategory, setSelectedCategory] = useState<string>('autres');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // États pour les nouveaux champs restaurant
  const [modelName, setModelName] = useState<string>('');
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

  // Charger model-viewer dynamiquement
  useEffect(() => {
    if (selectedModelFile) {
      import('@google/model-viewer').then(() => {
        console.log('model-viewer chargé pour le preview');
      }).catch((error) => {
        console.error('Erreur lors du chargement de model-viewer:', error);
      });
    }
  }, [selectedModelFile]);

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

  const handleModelInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleModelSelection(files[0]);
    }
  }, []);

  const handleThumbnailInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleThumbnailSelection(files[0]);
    }
  }, []);

  const handleModelSelection = (file: File) => {
    setUploadError(null);
    
    // Validation pour GLB/GLTF
    const maxSize = 50 * 1024 * 1024; // 50MB pour les gros modèles
    const allowedTypes = ['model/gltf-binary', 'model/gltf+json'];
    const hasValidExtension = /\.(glb|gltf)$/i.test(file.name);
    
        if (file.size > maxSize) {
      setUploadError('Le fichier ne doit pas dépasser 50MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setUploadError('Format non supporté. Utilisez GLB ou GLTF');
      return;
    }
    
    setSelectedModelFile(file);
    
    // Pré-remplir le nom du modèle avec le nom du fichier (sans l'extension)
    const fileNameWithoutExtension = file.name.replace(/\.(glb|gltf)$/i, '');
    setModelName(fileNameWithoutExtension);
    
    // Créer une URL de preview pour le modèle 3D
    const previewUrl = URL.createObjectURL(file);
    setModelPreviewUrl(previewUrl);
  };

  const handleThumbnailSelection = (file: File) => {
    setUploadError(null);
    
    // Validation pour les images
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUploadError('L\'image ne doit pas dépasser 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format d\'image non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }
    
    setSelectedThumbnailFile(file);
    
    // Créer une preview de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setSelectedThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const removeModel = () => {
    if (modelPreviewUrl) {
      URL.revokeObjectURL(modelPreviewUrl);
    }
    setSelectedModelFile(null);
    setModelPreviewUrl(null);
    setModelName('');
  };

  const uploadFile = async () => {
    if (!selectedModelFile) {
      setUploadError('Veuillez sélectionner un fichier 3D');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('model', selectedModelFile);
      
      if (selectedThumbnailFile) {
        formData.append('thumbnail', selectedThumbnailFile);
      }
      
      // Ajouter la catégorie et les tags
      formData.append('category', selectedCategory);
      formData.append('tags', JSON.stringify(selectedTags));

      // Ajouter les nouveaux champs restaurant
      if (modelName) {
        formData.append('modelName', modelName);
      }
      if (price) {
        formData.append('price', price);
      }
      if (shortDescription) {
        formData.append('shortDescription', shortDescription);
      }
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('allergens', JSON.stringify(selectedAllergens));
      
      // Ajouter les données des hotspots
      formData.append('hotspotsEnabled', hotspotsEnabled.toString());
      if (nutriScore) {
        formData.append('nutriScore', nutriScore);
      }
      formData.append('securityRisk', securityRisk.toString());
      if (originCountry) {
        formData.append('originCountry', originCountry);
      }
      if (transportDistance) {
        formData.append('transportDistance', transportDistance);
      }
      if (carbonFootprint) {
        formData.append('carbonFootprint', carbonFootprint);
      }
      
      // Ajouter la configuration des hotspots
      formData.append('hotspotsConfig', JSON.stringify(hotspotsConfig));

      // Ajouter l'ID du restaurant si disponible
      if (restaurantId) {
        formData.append('restaurantId', restaurantId);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'upload';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // Si on ne peut pas parser la réponse JSON, c'est probablement une erreur 500 HTML
          console.error('Failed to parse error response:', parseError);
          
          if (response.status === 500) {
            errorMessage = 'Erreur serveur. Vérifiez la taille du fichier et réessayez.';
          } else if (response.status === 413) {
            errorMessage = 'Fichier trop volumineux (max 50MB). Réduisez la taille de votre modèle.';
          } else if (response.status === 408) {
            errorMessage = 'Timeout d\'upload. Réessayez avec un fichier plus petit.';
          } else if (response.status === 502 || response.status === 504) {
            errorMessage = 'Erreur de gateway. Le fichier est probablement trop volumineux pour Vercel.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onUploadSuccess(data.model);
      
      // Reset form
      resetForm();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    // Nettoyer les URLs d'objets pour éviter les fuites mémoire
    if (modelPreviewUrl) {
      URL.revokeObjectURL(modelPreviewUrl);
      setModelPreviewUrl(null);
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    
    setSelectedModelFile(null);
    setSelectedThumbnailFile(null);
    setUploadError(null);
    setIsUploading(false);
    setShowFileSelection(true);
    setSelectedCategory('autres');
    setSelectedTags([]);
    setShowTagDropdown(false);
    setModelName('');
    setPrice('');
    setShortDescription('');
    setIngredients([]);
    setNewIngredient('');
    setSelectedAllergens([]);
    setShowAllergenDropdown(false);
    
    // Reset hotspots
    setHotspotsEnabled(false);
    setNutriScore('');
    setSecurityRisk(false);
    setOriginCountry('');
    setTransportDistance('');
    setCarbonFootprint('');
    setHotspotsConfig([]);
    
    // Reset file inputs
    const modelInput = document.querySelector('input[type="file"][accept*=".glb"]') as HTMLInputElement;
    const thumbnailInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (modelInput) modelInput.value = '';
    if (thumbnailInput) thumbnailInput.value = '';
  };

  const getSupportedFormats = (): SupportedMimeTypes[] => {
    return ['model/gltf-binary', 'model/gltf+json'];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        {showFileSelection ? (
          /* File Selection Phase */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Uploadez votre modèle 3D</h2>
              <p className="text-gray-600">Fichiers GLB ou GLTF pour une compatibilité universelle</p>
            </div>

            {/* Model Upload Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Fichier 3D (Requis)
                {selectedModelFile && <span className="ml-2 text-sm text-green-600">✓ Sélectionné</span>}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Format GLB/GLTF pour la visualisation 3D et la réalité augmentée
              </p>
              
              {!selectedModelFile ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleModelInput}
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedModelFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedModelFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeModel}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Upload Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Image de prévisualisation (Optionnel)
                {selectedThumbnailFile && <span className="ml-2 text-sm text-green-600">✓ Sélectionnée</span>}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Image qui s'affichera avant le chargement du modèle 3D
              </p>
              
              {!selectedThumbnailFile ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <svg className="mx-auto w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner une image</p>
                    <p className="text-xs text-gray-400">JPG, PNG ou WebP • Max 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {thumbnailPreview && (
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-10 h-10 object-cover rounded-lg border"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedThumbnailFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedThumbnailFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeThumbnail}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Preview */}
            {selectedModelFile && modelPreviewUrl && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Aperçu du modèle 3D
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vérifiez que votre modèle s'affiche correctement
                </p>
                
                <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                  <ModelPreview src={modelPreviewUrl} />
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    💡 Utilisez votre souris pour faire tourner et zoomer sur le modèle
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Taille:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatFileSize(selectedModelFile.size)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Button */}
            {selectedModelFile && (
              <div className="text-center">
                <button
                  onClick={() => setShowFileSelection(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continuer avec les détails
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Details Phase */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Détails du modèle</h2>
              <p className="text-gray-600">Ajoutez des informations pour votre plat</p>
              <button
                onClick={() => setShowFileSelection(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                ← Retour à la sélection
              </button>
            </div>

            {/* Catégorie et Tags */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Catégorie et Tags</h3>
              
              <div className="space-y-4">
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
                    disabled={isUploading}
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
                    Tags (optionnel)
                  </label>
                  <div className="relative" ref={tagDropdownRef}>
                    <button
                      type="button"
                      onClick={() => !isUploading && setShowTagDropdown(!showTagDropdown)}
                      disabled={isUploading}
                      className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900"
                    >
                      {selectedTags.length > 0 ? `${selectedTags.length} tag(s) sélectionné(s)` : 'Sélectionner des tags...'}
                      <svg className="w-5 h-5 text-gray-400 float-right mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showTagDropdown && !isUploading && (
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
                            {!isUploading && (
                              <button
                                type="button"
                                onClick={() => toggleTag(tagId)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun tag sélectionné</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations Restaurant */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Informations Restaurant</h3>
              
              <div className="space-y-4">
                {/* Nom du modèle */}
                <div>
                  <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du modèle
                  </label>
                  <input
                    type="text"
                    id="modelName"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Nom du plat ou du modèle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    disabled={isUploading}
                  />
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
                    disabled={isUploading}
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
                    disabled={isUploading}
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
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={handleIngredientKeyPress}
                      placeholder="ex: Mozzarella, Tomates, Basilic (séparez par des virgules)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      disabled={isUploading || !newIngredient.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>+</span>
                      Ajouter
                    </button>
                  </div>
                  
                  {/* Liste des ingrédients */}
                  <div className="flex flex-wrap gap-1">
                    {ingredients.length > 0 ? (
                      ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                        >
                          <span className="mr-1">🧄</span>
                          {ingredient}
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={() => removeIngredient(ingredient)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun ingrédient ajouté</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tapez un ou plusieurs ingrédients séparés par des virgules. Appuyez sur Entrée ou cliquez sur "Ajouter"
                  </p>
                </div>

                {/* Allergènes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergènes (optionnel)
                  </label>
                  <div className="relative" ref={allergenDropdownRef}>
                    <button
                      type="button"
                      onClick={() => !isUploading && setShowAllergenDropdown(!showAllergenDropdown)}
                      disabled={isUploading}
                      className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900"
                    >
                      {selectedAllergens.length > 0 ? `${selectedAllergens.length} allergène(s) sélectionné(s)` : 'Sélectionner des allergènes...'}
                      <svg className="w-5 h-5 text-gray-400 float-right mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showAllergenDropdown && !isUploading && (
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
                            {!isUploading && (
                              <button
                                type="button"
                                onClick={() => toggleAllergen(allergenId)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Aucun allergène sélectionné</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration des hotspots */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Configuration des hotspots</h3>
              
              <div className="space-y-4">
                {/* Toggle principal */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">🎯 Activer les hotspots</h4>
                    <p className="text-xs text-gray-500">Ajouter des points interactifs sur le modèle 3D</p>
                  </div>
                  <button
                    onClick={() => !isUploading && setHotspotsEnabled(!hotspotsEnabled)}
                    disabled={isUploading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hotspotsEnabled ? 'bg-green-600' : 'bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Sécurité alimentaire */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-900 flex items-center">
                          <span className="mr-2">🛡️</span>
                          Sécurité alimentaire
                        </h5>
                        
                        <div className="space-y-2">
                          <label className="block text-xs text-gray-700">
                            Nutri-Score
                          </label>
                          <select
                            value={nutriScore}
                            onChange={(e) => setNutriScore(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' | '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isUploading}
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
                            disabled={isUploading}
                          />
                          <label htmlFor="securityRisk" className="text-xs text-gray-700">
                            ⚠️ Risque de sécurité alimentaire
                          </label>
                        </div>
                      </div>

                      {/* Traçabilité */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-900 flex items-center">
                          <span className="mr-2">📍</span>
                          Traçabilité
                        </h5>
                        
                        <div className="space-y-2">
                          <label className="block text-xs text-gray-700">
                            Pays d'origine
                          </label>
                          <input
                            type="text"
                            value={originCountry}
                            onChange={(e) => setOriginCountry(e.target.value)}
                            placeholder="ex: France"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isUploading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-xs text-gray-700">
                            Distance de transport (km)
                          </label>
                          <input
                            type="number"
                            value={transportDistance}
                            onChange={(e) => setTransportDistance(e.target.value)}
                            placeholder="ex: 150"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            disabled={isUploading}
                          />
                        </div>
                      </div>

                      {/* Empreinte carbone */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-900 flex items-center">
                          <span className="mr-2">🌱</span>
                          Empreinte carbone
                        </h5>
                        
                        <div className="space-y-2">
                          <label className="block text-xs text-gray-700">
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
                            disabled={isUploading}
                          />
                          <p className="text-xs text-gray-500">
                            Émissions de CO2 liées à la production et transport
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aperçu des hotspots activés */}
                {hotspotsEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-blue-900 mb-2">
                      Aperçu des hotspots qui seront disponibles :
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {nutriScore && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🛡️ Nutri-Score {nutriScore}
                        </span>
                      )}
                      {securityRisk && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠️ Risque sécurité
                        </span>
                      )}
                      {originCountry && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📍 {originCountry}
                        </span>
                      )}
                      {transportDistance && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🚚 {transportDistance} km
                        </span>
                      )}
                      {carbonFootprint && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🌱 {carbonFootprint} kg CO2
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⭐ Notation
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        📤 Partage
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Éditeur de hotspots interactif */}
            {hotspotsEnabled && selectedModelFile && modelPreviewUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">🎯 Éditeur de hotspots</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-800">
                        Placez les hotspots en cliquant sur le modèle 3D. Vous pourrez les repositionner en mode édition.
                      </p>
                    </div>
                  </div>
                </div>
                
                <HotspotEditor
                  modelSrc={modelPreviewUrl}
                  modelName={modelName || selectedModelFile.name}
                  initialHotspots={hotspotsConfig}
                  onHotspotsChange={setHotspotsConfig}
                  className="scale-90"
                />
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-red-700 text-sm">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={uploadFile}
              disabled={!selectedModelFile || isUploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Upload en cours...</span>
                </div>
              ) : (
                'Uploader le modèle'
              )}
            </button>

            {/* Reset button */}
            {!isUploading && (
              <div className="text-center">
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Tout recommencer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <h4 className="font-medium mb-2">Formats supportés :</h4>
          <ul className="space-y-1 text-xs">
            <li>• <strong>GLB</strong> : Format binaire compact et rapide</li>
            <li>• <strong>GLTF</strong> : Format JSON avec assets séparés</li>
          </ul>
          <p className="mt-3 text-xs">
            Ces formats fonctionnent parfaitement sur tous les appareils (iPhone, Android, PC) 
            pour la visualisation 3D et la réalité augmentée.
          </p>
        </div>
      </motion.div>
    </div>
  );
} 