import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Model3D } from '@/types/model';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const modelFile = formData.get('model') as File;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    
    // Parse metadata
    const category = formData.get('category') as string || 'autres';
    const tagsJson = formData.get('tags') as string || '[]';
    const modelName = formData.get('modelName') as string;
    const price = formData.get('price') as string;
    const shortDescription = formData.get('shortDescription') as string || '';
    const allergensJson = formData.get('allergens') as string || '[]';
    
    // Parse JSON arrays
    let tags: string[] = [];
    let allergens: string[] = [];
    
    try {
      tags = JSON.parse(tagsJson);
      allergens = JSON.parse(allergensJson);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      // Keep empty arrays if parsing fails
    }

    if (!modelFile) {
      return NextResponse.json({ error: 'Fichier modèle requis' }, { status: 400 });
    }

    // Generate unique filename and slug
    const timestamp = Date.now();
    const originalName = modelFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const nameForSlug = modelName || originalName; // Use custom name if provided
    const slug = generateSlug(nameForSlug);
    const uniqueSlug = `${slug}-${timestamp}`;
    
    // Get file extension
    const fileExtension = modelFile.name.split('.').pop()?.toLowerCase();
    const modelFileName = `${uniqueSlug}.${fileExtension}`;
    
    // Determine MIME type
    const mimeType = fileExtension === 'glb' ? 'model/gltf-binary' : 'model/gltf+json';
    
    // Upload model file to storage
    const { data: modelData, error: modelError } = await supabaseAdmin.storage
      .from('models-3d')
      .upload(modelFileName, modelFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      });

    if (modelError) {
      console.error('Model upload error:', modelError);
      return NextResponse.json({ error: 'Erreur lors de l\'upload du modèle' }, { status: 500 });
    }

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile) {
      const thumbnailExtension = thumbnailFile.name.split('.').pop()?.toLowerCase();
      const thumbnailFileName = `${uniqueSlug}-thumb.${thumbnailExtension}`;
      
      const { data: thumbnailData, error: thumbnailError } = await supabaseAdmin.storage
        .from('models-3d')
        .upload(thumbnailFileName, thumbnailFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: thumbnailFile.type,
        });

      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        // Don't fail the whole upload if thumbnail fails
      } else {
        const { data: thumbnailUrlData } = supabaseAdmin.storage
          .from('models-3d')
          .getPublicUrl(thumbnailData.path);
        thumbnailUrl = thumbnailUrlData.publicUrl;
      }
    }

    // Get model file URL
    const { data: modelUrlData } = supabaseAdmin.storage
      .from('models-3d')
      .getPublicUrl(modelData.path);

    // Parse price as number
    const priceValue = price ? parseFloat(price) : null;

    // Create database record
    const modelRecord = {
      name: modelName || originalName,
      filename: modelFileName,
      original_name: modelFile.name,
      slug: uniqueSlug,
      file_size: modelFile.size,
      mime_type: mimeType,
      storage_path: modelData.path,
      public_url: modelUrlData.publicUrl,
      thumbnail_url: thumbnailUrl,
      category: category,
      tags: tags,
      price: priceValue,
      short_description: shortDescription,
      allergens: allergens,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('models_3d')
      .insert([modelRecord])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Cleanup uploaded files if database insert fails
      await supabaseAdmin.storage.from('models-3d').remove([modelData.path]);
      if (thumbnailUrl) {
        const thumbnailExtension = thumbnailFile?.name.split('.').pop()?.toLowerCase();
        const thumbnailFileName = `${uniqueSlug}-thumb.${thumbnailExtension}`;
        await supabaseAdmin.storage.from('models-3d').remove([thumbnailFileName]);
      }
      
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    // Transform database record to Model3D format
    const model: Model3D = {
      id: data.id,
      name: data.name,
      filename: data.filename,
      originalName: data.original_name,
      url: data.public_url,
      fileSize: data.file_size,
      uploadDate: data.created_at,
      mimeType: data.mime_type as 'model/gltf-binary' | 'model/gltf+json',
      slug: data.slug,
      storagePath: data.storage_path,
      thumbnailUrl: data.thumbnail_url,
      category: data.category,
      tags: data.tags || [],
      price: data.price,
      shortDescription: data.short_description,
      allergens: data.allergens || [],
    };

    return NextResponse.json({ 
      success: true, 
      model,
      message: 'Modèle uploadé avec succès' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 