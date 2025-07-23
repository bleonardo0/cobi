import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Model3D } from '@/types/model';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📋 Fetching model with ID:', id);

    const { data: model, error } = await supabaseAdmin
      .from('models_3d')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du modèle' },
        { status: 500 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Convert database model to our Model3D interface
    const convertedModel: Model3D = {
      id: model.id,
      name: model.name,
      filename: model.filename,
      originalName: model.original_name,
      url: model.public_url,
      fileSize: model.file_size,
      uploadDate: model.created_at,
      mimeType: model.mime_type as 'model/gltf-binary' | 'model/gltf+json',
      slug: model.slug,
      storagePath: model.storage_path,
      thumbnailUrl: model.thumbnail_url,
      thumbnailPath: model.thumbnail_path,
      category: model.category,
      tags: model.tags || [],
      description: model.description,
      ingredients: model.ingredients || [],
      price: model.price,
      shortDescription: model.short_description,
      allergens: model.allergens || [],
      // Hotspots data
      hotspotsEnabled: model.hotspots_enabled || false,
      hotspotsConfig: model.hotspots_config || {},
      nutriScore: model.nutri_score,
      securityRisk: model.security_risk || false,
      originCountry: model.origin_country,
      transportDistance: model.transport_distance,
      carbonFootprint: model.carbon_footprint,
    };

    return NextResponse.json({
      success: true,
      model: convertedModel
    });

  } catch (error) {
    console.error('💥 Error fetching model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Patching model with ID:', id);

    // Check if request is FormData or JSON
    const contentType = request.headers.get('content-type');
    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (from edit page)
      const formData = await request.formData();
      
      // Handle model name
      const modelName = formData.get('modelName') as string;
      if (modelName) {
        updateData.name = modelName.trim();
      }
      
      // Handle category
      const category = formData.get('category') as string;
      if (category) {
        updateData.category = category;
      }
      
      // Handle tags
      const tagsJson = formData.get('tags') as string;
      if (tagsJson) {
        try {
          updateData.tags = JSON.parse(tagsJson);
        } catch (error) {
          console.error('Error parsing tags JSON:', error);
        }
      }
      
      // Handle price
      const price = formData.get('price') as string;
      if (price) {
        updateData.price = parseFloat(price);
      }
      
      // Handle short description
      const shortDescription = formData.get('shortDescription') as string;
      if (shortDescription !== null) {
        updateData.short_description = shortDescription;
      }
      
      // Handle ingredients
      const ingredientsJson = formData.get('ingredients') as string;
      if (ingredientsJson) {
        try {
          updateData.ingredients = JSON.parse(ingredientsJson);
        } catch (error) {
          console.error('Error parsing ingredients JSON:', error);
        }
      }
      
      // Handle allergens
      const allergensJson = formData.get('allergens') as string;
      if (allergensJson) {
        try {
          updateData.allergens = JSON.parse(allergensJson);
        } catch (error) {
          console.error('Error parsing allergens JSON:', error);
        }
      }
      
      // Handle hotspots data
      const hotspotsEnabled = formData.get('hotspotsEnabled') as string;
      if (hotspotsEnabled !== null) {
        updateData.hotspots_enabled = hotspotsEnabled === 'true';
      }
      
      const nutriScore = formData.get('nutriScore') as string;
      if (nutriScore) {
        updateData.nutri_score = nutriScore;
      }
      
      const securityRisk = formData.get('securityRisk') as string;
      if (securityRisk !== null) {
        updateData.security_risk = securityRisk === 'true';
      }
      
      const originCountry = formData.get('originCountry') as string;
      if (originCountry) {
        updateData.origin_country = originCountry;
      }
      
      const transportDistance = formData.get('transportDistance') as string;
      if (transportDistance) {
        updateData.transport_distance = parseFloat(transportDistance);
      }
      
      const carbonFootprint = formData.get('carbonFootprint') as string;
      if (carbonFootprint) {
        updateData.carbon_footprint = parseFloat(carbonFootprint);
      }
      
      // Handle hotspots config
      const hotspotsConfig = formData.get('hotspotsConfig') as string;
      if (hotspotsConfig) {
        try {
          updateData.hotspots_config = JSON.parse(hotspotsConfig);
        } catch (error) {
          console.error('Error parsing hotspots config JSON:', error);
        }
      }
      
      // Handle thumbnail URL
      const thumbnailUrl = formData.get('thumbnailUrl') as string;
      if (thumbnailUrl !== null) {
        updateData.thumbnail_url = thumbnailUrl;
      }
      
      // Handle file uploads (GLB and thumbnail)
      const glbFile = formData.get('glb') as File | null;
      const thumbnailFile = formData.get('thumbnail') as File | null;
      const removeGlb = formData.get('removeGlb') === 'true';
      const removeThumbnail = formData.get('removeThumbnail') === 'true';
      
      // For now, we'll handle file uploads in a separate API endpoint
      // This PATCH is primarily for metadata updates
      if (glbFile || thumbnailFile || removeGlb || removeThumbnail) {
        console.log('🔄 File operations detected, but not implemented in this endpoint yet');
        // TODO: Implement file upload/removal logic here
      }
      
    } else {
      // Handle JSON
      const body = await request.json();
      const { name, category, tags, price, shortDescription, allergens, description, ingredients } = body;

      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (price !== undefined) updateData.price = price;
      if (shortDescription !== undefined) updateData.short_description = shortDescription;
      if (allergens !== undefined) updateData.allergens = allergens;
      if (description !== undefined) updateData.description = description;
      if (ingredients !== undefined) updateData.ingredients = ingredients;
    }

    console.log('Update data:', updateData);

    // Update the model
    const { data: updatedModel, error } = await supabaseAdmin
      .from('models_3d')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      console.error('❌ Update data that caused error:', updateData);
      return NextResponse.json(
        { success: false, error: `Erreur lors de la mise à jour: ${error.message}` },
        { status: 500 }
      );
    }

    if (!updatedModel) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Convert database model to our Model3D interface
    const convertedModel: Model3D = {
      id: updatedModel.id,
      name: updatedModel.name,
      filename: updatedModel.filename,
      originalName: updatedModel.original_name,
      url: updatedModel.public_url,
      fileSize: updatedModel.file_size,
      uploadDate: updatedModel.created_at,
      mimeType: updatedModel.mime_type as 'model/gltf-binary' | 'model/gltf+json',
      slug: updatedModel.slug,
      storagePath: updatedModel.storage_path,
      thumbnailUrl: updatedModel.thumbnail_url,
      thumbnailPath: updatedModel.thumbnail_path,
      category: updatedModel.category,
      tags: updatedModel.tags || [],
      description: updatedModel.description,
      ingredients: updatedModel.ingredients || [],
      price: updatedModel.price,
      shortDescription: updatedModel.short_description,
      allergens: updatedModel.allergens || [],
      // Hotspots data
      hotspotsEnabled: updatedModel.hotspots_enabled || false,
      hotspotsConfig: updatedModel.hotspots_config || {},
      nutriScore: updatedModel.nutri_score,
      securityRisk: updatedModel.security_risk || false,
      originCountry: updatedModel.origin_country,
      transportDistance: updatedModel.transport_distance,
      carbonFootprint: updatedModel.carbon_footprint,
    };

    return NextResponse.json({
      success: true,
      model: convertedModel,
      message: 'Modèle mis à jour avec succès'
    });

  } catch (error) {
    console.error('💥 Error patching model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating model with ID:', id);

    const body = await request.json();
    const { name, category, tags, price, shortDescription, allergens, description, ingredients } = body;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (price !== undefined) updateData.price = price;
    if (shortDescription !== undefined) updateData.short_description = shortDescription;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = ingredients;

    console.log('Update data:', updateData);

    // Update the model
    const { data: updatedModel, error } = await supabaseAdmin
      .from('models_3d')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, error: `Erreur lors de la mise à jour: ${error.message}` },
        { status: 500 }
      );
    }

    if (!updatedModel) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Convert database model to our Model3D interface
    const convertedModel: Model3D = {
      id: updatedModel.id,
      name: updatedModel.name,
      filename: updatedModel.filename,
      originalName: updatedModel.original_name,
      url: updatedModel.public_url,
      fileSize: updatedModel.file_size,
      uploadDate: updatedModel.created_at,
      mimeType: updatedModel.mime_type as 'model/gltf-binary' | 'model/gltf+json',
      slug: updatedModel.slug,
      storagePath: updatedModel.storage_path,
      thumbnailUrl: updatedModel.thumbnail_url,
      thumbnailPath: updatedModel.thumbnail_path,
      category: updatedModel.category,
      tags: updatedModel.tags || [],
      description: updatedModel.description,
      ingredients: updatedModel.ingredients || [],
      price: updatedModel.price,
      shortDescription: updatedModel.short_description,
      allergens: updatedModel.allergens || [],
    };

    return NextResponse.json({
      success: true,
      model: convertedModel,
      message: 'Modèle mis à jour avec succès'
    });

  } catch (error) {
    console.error('💥 Error updating model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting model with ID:', id);

    // First, get the model to retrieve file paths
    const { data: model, error: fetchError } = await supabaseAdmin
      .from('models_3d')
      .select('storage_path, thumbnail_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Database error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du modèle' },
        { status: 500 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Delete files from storage
    const filesToDelete = [model.storage_path];
    if (model.thumbnail_path) {
      filesToDelete.push(model.thumbnail_path);
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from('models-3d')
      .remove(filesToDelete);

    if (storageError) {
      console.error('❌ Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('models_3d')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Database deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du modèle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Modèle supprimé avec succès'
    });

  } catch (error) {
    console.error('💥 Error deleting model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 