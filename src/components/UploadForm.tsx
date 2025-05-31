'use client';

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Model3D, SupportedMimeTypes } from "@/types/model";
import { validateFile, formatFileSize } from "@/lib/utils";

interface UploadFormProps {
  onUploadSuccess: (model: Model3D) => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleThumbnailInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleThumbnailSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setUploadError(null);
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Fichier invalide');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleThumbnailSelection = (file: File) => {
    setUploadError(null);
    
    // Validation pour les images
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUploadError('L\'image ne doit pas dépasser 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format d\'image non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }
    
    setSelectedThumbnail(file);
    
    // Créer une preview de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Ajouter le thumbnail si sélectionné
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Erreur lors du téléchargement';
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Si le parsing JSON échoue, utiliser le message par défaut
          }
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Erreur ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error('Réponse invalide du serveur');
      }

      const data = await response.json();
      
      if (data.success) {
        setTimeout(() => {
          onUploadSuccess(data.model);
          resetForm();
        }, 500);
      } else {
        throw new Error(data.error || 'Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
  };

  const removeThumbnail = () => {
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
  };

  const getSupportedFormats = (): SupportedMimeTypes[] => {
    return ['model/vnd.usdz+zip', 'model/gltf-binary', 'model/gltf+json'];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        {!selectedFile ? (
          /* File Selection */
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input
                type="file"
                accept=".usdz,.glb,.gltf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragOver ? 'Déposez votre fichier ici' : 'Sélectionnez votre modèle 3D'}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Glissez-déposez ou cliquez pour sélectionner un fichier
                  </p>
                </div>
                
                <div className="text-sm text-gray-400">
                  Formats supportés : USDZ, GLB, GLTF • Taille max : 50MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* File Selected */
          <div className="space-y-6">
            {/* Fichier sélectionné */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                
                {!isUploading && (
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Section Thumbnail (optionnel) */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Image de prévisualisation (optionnel)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez une image JPG, PNG ou WebP pour prévisualiser votre modèle dans la galerie
              </p>

              {!selectedThumbnail ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ position: 'relative' }}
                  />
                  <div className="space-y-2">
                    <svg
                      className="mx-auto w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner une image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP • Max 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedThumbnail.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedThumbnail.size)}</p>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={removeThumbnail}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Téléchargement en cours...</span>
                  <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-600 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-800 text-sm">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={uploadFile}
              disabled={isUploading}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-colors
                ${isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isUploading ? 'Téléchargement...' : 'Télécharger le modèle'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Supported Formats Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Formats de modèles 3D supportés:</p>
        <div className="flex justify-center space-x-4 text-xs">
          {getSupportedFormats().map((format) => (
            <span
              key={format}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              {format.split('/')[1].toUpperCase().replace('+ZIP', '').replace('+JSON', '')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 