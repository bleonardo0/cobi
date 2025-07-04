import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Model3D } from '@/types/model';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📋 Fetching model with ID:', params.id);

    const { data: model, error } = await supabaseAdmin
      .from('models_3d')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Patching model with ID:', params.id);

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
      
      // Handle allergens
      const allergensJson = formData.get('allergens') as string;
      if (allergensJson) {
        try {
          updateData.allergens = JSON.parse(allergensJson);
        } catch (error) {
          console.error('Error parsing allergens JSON:', error);
        }
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
      .eq('id', params.id)
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
    console.error('💥 Error patching model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Updating model with ID:', params.id);

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
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Deleting model with ID:', params.id);

    // First, get the model to retrieve file paths
    const { data: model, error: fetchError } = await supabaseAdmin
      .from('models_3d')
      .select('storage_path, thumbnail_path')
      .eq('id', params.id)
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
      .eq('id', params.id);

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