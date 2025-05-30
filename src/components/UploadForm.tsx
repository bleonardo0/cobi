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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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

  const handleFileSelection = (file: File) => {
    setUploadError(null);
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Fichier invalide');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleImageSelection = (file: File) => {
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
    
    setSelectedImage(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Ajouter l'image de prévisualisation si sélectionnée
      if (selectedImage) {
        formData.append('thumbnail', selectedImage);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du téléchargement');
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
    setSelectedImage(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-gray-400"
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
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-gray-500 mt-1">
                  ou cliquez pour sélectionner
                </p>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>Formats supportés: USDZ, GLB, GLTF</p>
                <p>Taille maximale: 50MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* File Preview & Upload */
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Image de prévisualisation (optionnelle) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                Image de prévisualisation (optionnelle)
              </h3>
              
              {!selectedImage ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleImageSelection(files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cliquez pour ajouter une image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP - Max 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedImage.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedImage.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Téléchargement en cours...</span>
                  <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-600 mr-2"
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
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex space-x-3">
              <button
                onClick={uploadFile}
                disabled={isUploading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploading ? 'Téléchargement...' : 'Télécharger le modèle'}
              </button>
              
              <button
                onClick={resetForm}
                disabled={isUploading}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
            </div>
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