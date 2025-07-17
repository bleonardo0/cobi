import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import { Model3D } from '@/types/model';

export async function POST(request: NextRequest) {
  console.log('🚀 Starting upload process...');
  
  try {
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase configuration');
      return NextResponse.json({ error: 'Configuration serveur incorrecte' }, { status: 500 });
    }

    // Parse form data
    console.log('📋 Parsing form data...');
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
    const restaurantId = formData.get('restaurantId') as string;
    
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
      console.error('❌ No model file provided');
      return NextResponse.json({ error: 'Fichier modèle requis' }, { status: 400 });
    }

    console.log(`📁 Processing file: ${modelFile.name} (${modelFile.size} bytes)`);

    // Check file size limit (50MB pour le mode direct)
    const maxSize = 50 * 1024 * 1024; // 50MB pour les gros modèles
    if (modelFile.size > maxSize) {
      console.error(`❌ File too large: ${modelFile.size} bytes > ${maxSize} bytes`);
      return NextResponse.json({ error: 'Fichier trop volumineux (max 50MB)' }, { status: 413 });
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
    
    console.log(`📤 Uploading model file: ${modelFileName} (${mimeType})`);
    
    // Upload model file to storage
    const { data: modelData, error: modelError } = await supabaseAdmin.storage
      .from('models-3d')
      .upload(modelFileName, modelFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      });

    if (modelError) {
      console.error('❌ Model upload error:', modelError);
      return NextResponse.json({ error: `Erreur lors de l'upload du modèle: ${modelError.message}` }, { status: 500 });
    }

    console.log(`✅ Model uploaded successfully: ${modelData.path}`);

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile) {
      console.log(`🖼️ Uploading thumbnail: ${thumbnailFile.name} (${thumbnailFile.size} bytes)`);
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
        console.error('⚠️ Thumbnail upload error:', thumbnailError);
        // Don't fail the whole upload if thumbnail fails
      } else {
        console.log(`✅ Thumbnail uploaded successfully: ${thumbnailData.path}`);
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
    console.log(`💾 Creating database record for: ${modelName || originalName}`);
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
      restaurant_id: restaurantId || null, // Assigner le restaurant ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('models_3d')
      .insert([modelRecord])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      
      // Cleanup uploaded files if database insert fails
      console.log('🧹 Cleaning up uploaded files...');
      await supabaseAdmin.storage.from('models-3d').remove([modelData.path]);
      if (thumbnailUrl) {
        const thumbnailExtension = thumbnailFile?.name.split('.').pop()?.toLowerCase();
        const thumbnailFileName = `${uniqueSlug}-thumb.${thumbnailExtension}`;
        await supabaseAdmin.storage.from('models-3d').remove([thumbnailFileName]);
      }
      
      return NextResponse.json({ error: `Erreur lors de la sauvegarde: ${error.message}` }, { status: 500 });
    }

    console.log(`✅ Database record created successfully with ID: ${data.id}`);

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

    console.log(`🎉 Upload completed successfully for: ${model.name}`);
    return NextResponse.json({ 
      success: true, 
      model,
      message: 'Modèle uploadé avec succès' 
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 