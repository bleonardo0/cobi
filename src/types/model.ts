export interface Model3D {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  url: string;
  fileSize: number;
  uploadDate: string;
  mimeType: SupportedMimeTypes;
  slug: string;
  storagePath: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
}

export interface UploadResponse {
  success: boolean;
  model?: Model3D;
  error?: string;
}

export interface ModelsResponse {
  models: Model3D[];
  total: number;
}

export type SupportedMimeTypes = 
  | 'model/vnd.usdz+zip'
  | 'model/gltf-binary'
  | 'model/gltf+json';

// Type pour la conversion entre Supabase et notre interface
export interface SupabaseModel {
  id: string;
  name: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  public_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  thumbnail_path?: string;
}

// Fonction utilitaire pour convertir de Supabase vers notre interface
export function convertSupabaseToModel(supabaseModel: SupabaseModel): Model3D {
  return {
    id: supabaseModel.id,
    name: supabaseModel.name,
    filename: supabaseModel.filename,
    originalName: supabaseModel.original_name,
    url: supabaseModel.public_url,
    fileSize: supabaseModel.file_size,
    uploadDate: supabaseModel.created_at,
    mimeType: supabaseModel.mime_type as SupportedMimeTypes,
    slug: supabaseModel.slug,
    storagePath: supabaseModel.storage_path,
    thumbnailUrl: supabaseModel.thumbnail_url,
    thumbnailPath: supabaseModel.thumbnail_path,
  };
} 