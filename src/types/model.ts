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
  // Nouveaux champs pour supporter GLB + USDZ
  glbUrl?: string;
  glbPath?: string;
  glbFileSize?: number;
  usdzUrl?: string;
  usdzPath?: string;
  usdzFileSize?: number;
  format?: string;
  // Nouveaux champs pour la catégorisation
  category?: string;
  tags?: string[];
  description?: string;
  ingredients?: string[];
  // Nouveaux champs restaurant
  price?: number;
  shortDescription?: string;
  allergens?: string[];
  // Nouveaux champs pour les améliorations cross-plateforme & accessibilité
  fallback360Video?: string; // URL de la vidéo 360° de fallback
  defaultScale?: string; // Échelle par défaut (ex: "0.01m" pour corriger les unités)
  autoAltText?: boolean; // Active la génération automatique du texte alternatif
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

// Types pour le système de catégorisation
export type MenuCategory = 
  | 'entrees'
  | 'plats'
  | 'desserts'
  | 'boissons'
  | 'menus-speciaux'
  | 'autres';

export interface CategoryInfo {
  id: MenuCategory;
  name: string;
  icon: string;
  color: string;
}

export interface FilterState {
  category: MenuCategory | 'all';
  tags: string[];
  search: string;
}

export interface TagInfo {
  id: string;
  name: string;
  color: string;
}

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
  // Nouveaux champs pour GLB + USDZ
  glb_url?: string;
  glb_path?: string;
  glb_file_size?: number;
  usdz_url?: string;
  usdz_path?: string;
  usdz_file_size?: number;
  format?: string;
  // Nouveaux champs pour la catégorisation
  category?: string;
  tags?: string[];
  description?: string;
  ingredients?: string[];
  // Nouveaux champs restaurant
  price?: number;
  short_description?: string;
  allergens?: string[];
  // Nouveaux champs pour les améliorations cross-plateforme & accessibilité
  fallback_360_video?: string;
  default_scale?: string;
  auto_alt_text?: boolean;
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
    // Nouveaux champs GLB + USDZ
    glbUrl: supabaseModel.glb_url,
    glbPath: supabaseModel.glb_path,
    glbFileSize: supabaseModel.glb_file_size,
    usdzUrl: supabaseModel.usdz_url,
    usdzPath: supabaseModel.usdz_path,
    usdzFileSize: supabaseModel.usdz_file_size,
    format: supabaseModel.format,
    // Nouveaux champs catégorisation
    category: supabaseModel.category,
    tags: supabaseModel.tags,
    description: supabaseModel.description,
    ingredients: supabaseModel.ingredients,
    // Nouveaux champs restaurant
    price: supabaseModel.price,
    shortDescription: supabaseModel.short_description,
    allergens: supabaseModel.allergens,
    // Nouveaux champs pour les améliorations cross-plateforme & accessibilité
    fallback360Video: supabaseModel.fallback_360_video,
    defaultScale: supabaseModel.default_scale,
    autoAltText: supabaseModel.auto_alt_text,
  };
} 