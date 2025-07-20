import { Model3D, SupabaseModel, convertSupabaseToModel } from "@/types/model";
import { generateSlug } from "./utils";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'models-3d';

// Check if Supabase is configured
function checkSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase n\'est pas configuré. Veuillez configurer les variables d\'environnement.');
  }
}

// Upload file to Supabase Storage
export async function uploadFileToStorage(
  file: File,
  filename: string,
  folder: string = 'models'
): Promise<{ url: string; path: string }> {
  checkSupabaseConfig();
  
  const filePath = `${folder}/${filename}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erreur lors de l'upload: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath
  };
}

// Add a new model to database
export async function addModel(
  filename: string,
  originalName: string,
  fileSize: number,
  mimeType: string,
  storagePath: string,
  publicUrl: string,
  thumbnailUrl?: string,
  thumbnailPath?: string,
  glbUrl?: string,
  glbPath?: string,
  usdzUrl?: string,
  usdzPath?: string,
  category?: string,
  tags?: string[],
  price?: number,
  shortDescription?: string,
  allergens?: string[]
): Promise<Model3D> {
  checkSupabaseConfig();
  
  const modelData = {
    name: originalName.replace(/\.[^/.]+$/, ""), // Remove extension
    filename,
    original_name: originalName,
    file_size: fileSize,
    mime_type: mimeType,
    storage_path: storagePath,
    public_url: publicUrl,
    slug: generateSlug(filename), // Use unique filename instead of original name
    thumbnail_url: thumbnailUrl,
    thumbnail_path: thumbnailPath,
    glb_url: glbUrl,
    glb_path: glbPath,
    usdz_url: usdzUrl,
    usdz_path: usdzPath,
    category: category || 'autres',
    tags: tags || [],
    price: price,
    short_description: shortDescription,
    allergens: allergens || [],
  };

  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .insert(modelData)
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur lors de l'ajout en base: ${error.message}`);
  }

  return convertSupabaseToModel(data as SupabaseModel);
}

// Get model by slug
export async function getModelBySlug(slug: string): Promise<Model3D | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return convertSupabaseToModel(data as SupabaseModel);
}

// Get all models
export async function getAllModels(): Promise<Model3D[]> {
  if (!isSupabaseConfigured) {
    return [];
  }
  
  const { data, error } = await supabaseAdmin
    .from('models_3d')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }

  return data.map((model: SupabaseModel) => convertSupabaseToModel(model));
}

// Get models for a specific restaurant
export async function getModelsByRestaurant(restaurantSlug: string): Promise<Model3D[]> {
  if (!isSupabaseConfigured) {
    return [];
  }
  
  try {
    // D'abord, récupérer l'ID du restaurant à partir du slug
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', restaurantSlug)
      .single();

    if (restaurantError || !restaurant) {
      console.log(`❌ Restaurant not found in DB for slug: ${restaurantSlug}`);
      
      // Fallback pour les restaurants définis en code (comme les TEST_RESTAURANTS)
      const restaurantIdMap: Record<string, string> = {
        'bella-vita': 'restaurant-bella-vita-1',
        'le-gourmet-3d': 'restaurant-test-123'
      };
      
      const fallbackId = restaurantIdMap[restaurantSlug];
      if (fallbackId) {
        console.log(`🔄 Using fallback ID: ${fallbackId} for slug: ${restaurantSlug}`);
        // Récupérer les modèles avec cet ID
        const { data, error } = await supabaseAdmin
          .from('models_3d')
          .select('*')
          .eq('restaurant_id', fallbackId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching models with fallback ID:', error);
          return [];
        }

        return data.map((model: SupabaseModel) => convertSupabaseToModel(model));
      }
      
      return [];
    }

    // Récupérer les modèles associés à ce restaurant
    const { data, error } = await supabaseAdmin
      .from('models_3d')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching models for restaurant ${restaurantSlug}:`, error);
      return [];
    }

    console.log(`✅ Found ${data.length} models for restaurant ${restaurantSlug} (ID: ${restaurant.id})`);
    return data.map((model: SupabaseModel) => convertSupabaseToModel(model));
    
  } catch (error) {
    console.error(`Error in getModelsByRestaurant for ${restaurantSlug}:`, error);
    return [];
  }
}

// Delete a model
export async function deleteModel(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }
  
  try {
    // First get the model to get storage path
    const { data: model, error: fetchError } = await supabaseAdmin
      .from('models_3d')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError || !model) {
      return false;
    }

    // Delete file from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([model.storage_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue anyway to delete from database
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('models_3d')
      .delete()
      .eq('id', id);

    return !dbError;
  } catch (error) {
    console.error('Error deleting model:', error);
    return false;
  }
}

// Get MIME type from filename
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'usdz':
      return 'model/vnd.usdz+zip';
    case 'glb':
      return 'model/gltf-binary';
    case 'gltf':
      return 'model/gltf+json';
    default:
      return 'application/octet-stream';
  }
}

// Generate unique filename
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  
  const cleanBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${prefix}${cleanBaseName}-${timestamp}-${randomString}.${extension}`;
} 