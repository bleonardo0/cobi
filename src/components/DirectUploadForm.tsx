'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Model3D } from '@/types/model';

interface DirectUploadFormProps {
  onUploadSuccess: (model: Model3D) => void;
  restaurantId?: string;
}

export default function DirectUploadForm({ onUploadSuccess, restaurantId }: DirectUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');

  const handleFileSelection = (file: File) => {
    setUploadError(null);
    
    // Validation pour GLB/GLTF - limite plus élevée pour l'upload direct
    const maxSize = 50 * 1024 * 1024; // 50MB pour upload direct
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
    
    setSelectedFile(file);
    
    // Pré-remplir le nom du modèle
    const fileNameWithoutExtension = file.name.replace(/\.(glb|gltf)$/i, '');
    setModelName(fileNameWithoutExtension);
  };

  const uploadDirectly = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const nameForSlug = modelName || originalName;
      const slug = generateSlug(nameForSlug);
      const uniqueSlug = `${slug}-${timestamp}`;
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${uniqueSlug}.${fileExtension}`;

      console.log('🚀 Starting direct upload to Supabase...');
      setUploadProgress(10);

      // Upload direct vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('models-3d')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to storage');
      setUploadProgress(60);

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('models-3d')
        .getPublicUrl(fileName);

      setUploadProgress(80);

      // Créer l'enregistrement en base
      const mimeType = fileExtension === 'glb' ? 'model/gltf-binary' : 'model/gltf+json';
      const priceValue = price ? parseFloat(price) : null;

      const { data: modelData, error: dbError } = await supabase
        .from('models_3d')
        .insert([{
          name: modelName || originalName,
          filename: fileName,
          original_name: selectedFile.name,
          slug: uniqueSlug,
          file_size: selectedFile.size,
          mime_type: mimeType,
          storage_path: uploadData.path,
          public_url: urlData.publicUrl,
          category: 'autres',
          tags: [],
          price: priceValue,
          short_description: shortDescription,
          allergens: [],
          restaurant_id: restaurantId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (dbError) {
        // Cleanup si erreur DB
        await supabase.storage.from('models-3d').remove([uploadData.path]);
        throw new Error(`Erreur base de données: ${dbError.message}`);
      }

      console.log('✅ Database record created');
      setUploadProgress(100);

      // Transformer pour Model3D
      const model: Model3D = {
        id: modelData.id,
        name: modelData.name,
        filename: modelData.filename,
        originalName: modelData.original_name,
        url: modelData.public_url,
        fileSize: modelData.file_size,
        uploadDate: modelData.created_at,
        mimeType: modelData.mime_type as 'model/gltf-binary' | 'model/gltf+json',
        slug: modelData.slug,
        storagePath: modelData.storage_path,
        thumbnailUrl: modelData.thumbnail_url,
        category: modelData.category,
        tags: modelData.tags || [],
        price: modelData.price,
        shortDescription: modelData.short_description,
        allergens: modelData.allergens || [],
      };

      onUploadSuccess(model);
      
      // Reset form
      setSelectedFile(null);
      setModelName('');
      setPrice('');
      setShortDescription('');

    } catch (error) {
      console.error('❌ Direct upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          🚀 Upload Direct vers Supabase
        </h3>
        <p className="text-sm text-blue-700">
          Cette méthode contourne les limitations Vercel (4MB) et permet d'uploader des fichiers jusqu'à 50MB.
        </p>
      </div>

      {/* Sélection de fichier */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
          className="hidden"
          id="direct-file-input"
        />
        <label
          htmlFor="direct-file-input"
          className="cursor-pointer block"
        >
          <div className="space-y-2">
            <div className="text-4xl">📎</div>
            <div className="text-gray-600">
              Cliquez pour sélectionner un fichier GLB/GLTF
            </div>
            <div className="text-sm text-gray-500">
              Limite: 50MB (upload direct)
            </div>
          </div>
        </label>
      </div>

      {/* Fichier sélectionné */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Métadonnées */}
      {selectedFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du modèle
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du plat ou du modèle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description courte
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description du plat (max 150 caractères)"
              maxLength={150}
            />
          </div>
        </div>
      )}

      {/* Erreur */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{uploadError}</div>
        </div>
      )}

      {/* Barre de progression */}
      {isUploading && (
        <div className="space-y-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            Upload en cours... {uploadProgress}%
          </div>
        </div>
      )}

      {/* Bouton d'upload */}
      <button
        onClick={uploadDirectly}
        disabled={!selectedFile || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          !selectedFile || isUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Upload en cours...' : 'Uploader directement'}
      </button>
    </div>
  );
} 