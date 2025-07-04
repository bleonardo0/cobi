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

// Types de fichiers supportés (GLB/GLTF seulement)
export type SupportedMimeTypes = 
  | 'model/gltf-binary'
  | 'model/gltf+json';

// Extensions de fichiers supportées
export const SUPPORTED_EXTENSIONS = ['.glb', '.gltf'] as const;
export type SupportedExtensions = typeof SUPPORTED_EXTENSIONS[number];

// Modèles de test pour le développement
export const SAMPLE_MODELS: Model3D[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    filename: 'pizza-margherita.glb',
    originalName: 'pizza-margherita.glb',
    url: '/models/pizza-margherita.glb',
    fileSize: 2457600, // 2.4MB
    uploadDate: new Date('2024-01-20').toISOString(),
    mimeType: 'model/gltf-binary',
    slug: 'pizza-margherita',
    storagePath: 'models/pizza-margherita.glb',
    thumbnailUrl: '/models/pizza-margherita-thumb.jpg',
    category: 'plats',
    tags: ['italien', 'végétarien'],
    description: 'Pizza traditionnelle italienne avec mozzarella et basilic frais',
    ingredients: ['Pâte à pizza', 'Sauce tomate', 'Mozzarella', 'Basilic'],
    price: 12.50,
    shortDescription: 'Pizza italienne classique',
    allergens: ['gluten', 'lactose']
  },
  {
    id: '2',
    name: 'Tiramisu',
    filename: 'tiramisu.glb',
    originalName: 'tiramisu.glb',
    url: '/models/tiramisu.glb',
    fileSize: 1843200, // 1.8MB
    uploadDate: new Date('2024-01-21').toISOString(),
    mimeType: 'model/gltf-binary',
    slug: 'tiramisu',
    storagePath: 'models/tiramisu.glb',
    thumbnailUrl: '/models/tiramisu-thumb.jpg',
    category: 'desserts',
    tags: ['italien', 'café'],
    description: 'Dessert italien traditionnel au café et mascarpone',
    ingredients: ['Mascarpone', 'Café espresso', 'Biscuits ladyfingers', 'Cacao'],
    price: 6.90,
    shortDescription: 'Dessert italien au café',
    allergens: ['lactose', 'œufs', 'gluten']
  }
];

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