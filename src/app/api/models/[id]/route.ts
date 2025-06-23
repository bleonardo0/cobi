import { NextRequest, NextResponse } from 'next/server';
import { deleteModel } from '@/lib/models';
import { createClient } from '@supabase/supabase-js';
import { Model3D } from '@/types/model';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log(`🗑️ Attempting to delete model with ID: ${id}`);
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du modèle manquant' },
        { status: 400 }
      );
    }

    const success = await deleteModel(id);
    
    if (success) {
      console.log(`✅ Model ${id} deleted successfully`);
      return NextResponse.json({ success: true });
    } else {
      console.log(`❌ Failed to delete model ${id}`);
      return NextResponse.json(
        { success: false, error: 'Échec de la suppression' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('💥 Error deleting model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData();
    const { id: modelId } = await params;

    // Récupérer le modèle existant
    const { data: existingModel, error: fetchError } = await supabase
      .from('models_3d')
      .select('*')
      .eq('id', modelId)
      .single();

    if (fetchError || !existingModel) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les fichiers et flags du FormData
    const glbFile = formData.get('glbFile') as File | null;
    const usdzFile = formData.get('usdzFile') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const modelName = formData.get('modelName') as string | null;
    
    const removeGlb = formData.get('removeGlb') === 'true';
    const removeUsdz = formData.get('removeUsdz') === 'true';
    const removeThumbnail = formData.get('removeThumbnail') === 'true';

    // Vérifier les conflits de noms de fichiers
    if (glbFile) {
      const { data: existingGlb, error: glbCheckError } = await supabase
        .from('models_3d')
        .select('id')
        .eq('filename', glbFile.name)
        .neq('id', modelId)
        .single();

      if (existingGlb && !glbCheckError) {
        return NextResponse.json(
          { success: false, error: `Un fichier nommé "${glbFile.name}" existe déjà. Veuillez renommer votre fichier ou choisir un autre nom.` },
          { status: 409 }
        );
      }
    }

    if (usdzFile) {
      const { data: existingUsdz, error: usdzCheckError } = await supabase
        .from('models_3d')
        .select('id')
        .eq('filename', usdzFile.name)
        .neq('id', modelId)
        .single();

      if (existingUsdz && !usdzCheckError) {
        return NextResponse.json(
          { success: false, error: `Un fichier nommé "${usdzFile.name}" existe déjà. Veuillez renommer votre fichier ou choisir un autre nom.` },
          { status: 409 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    let totalFileSize = 0;

    // Mettre à jour le nom du modèle si fourni
    if (modelName && modelName.trim()) {
      updateData.name = modelName.trim();
    }

    // Mettre à jour la catégorie et les tags si fournis
    const category = formData.get('category') as string | null;
    const tagsString = formData.get('tags') as string | null;
    
    if (category) {
      updateData.category = category;
    }
    
    if (tagsString) {
      try {
        const tags = JSON.parse(tagsString);
        updateData.tags = tags;
      } catch (error) {
        console.log('⚠️ Failed to parse tags, ignoring:', error);
      }
    }

    // Mettre à jour les nouveaux champs restaurant si fournis
    const priceString = formData.get('price') as string | null;
    const shortDescription = formData.get('shortDescription') as string | null;
    const allergensString = formData.get('allergens') as string | null;
    
    if (priceString) {
      const price = parseFloat(priceString);
      if (!isNaN(price)) {
        updateData.price = price;
      }
    }
    
    if (shortDescription) {
      updateData.short_description = shortDescription;
    }
    
    if (allergensString) {
      try {
        const allergens = JSON.parse(allergensString);
        updateData.allergens = allergens;
      } catch (error) {
        console.log('⚠️ Failed to parse allergens, ignoring:', error);
      }
    }

    // Gérer la suppression/ajout du fichier GLB
    if (removeGlb && existingModel.glbPath) {
      // Supprimer le fichier GLB existant
      await supabase.storage
        .from('models-3d')
        .remove([existingModel.glb_path]);
        
      updateData.glb_url = null;
      updateData.glb_path = null;
      updateData.glb_file_size = null;
    } else if (glbFile) {
      // Supprimer l'ancien fichier GLB s'il existe
      if (existingModel.glb_path) {
        await supabase.storage
          .from('models-3d')
          .remove([existingModel.glb_path]);
      }
      
      // Upload du nouveau fichier GLB avec le nom original
      const glbFileName = glbFile.name;
      const glbArrayBuffer = await glbFile.arrayBuffer();
      
      const { data: glbUploadData, error: glbUploadError } = await supabase.storage
        .from('models-3d')
        .upload(glbFileName, glbArrayBuffer, {
          contentType: glbFile.type || 'model/gltf-binary',
          upsert: true
        });

      if (glbUploadError) {
        throw new Error(`Erreur upload GLB: ${glbUploadError.message}`);
      }

      const { data: { publicUrl: glbPublicUrl } } = supabase.storage
        .from('models-3d')
        .getPublicUrl(glbFileName);

      updateData.glb_url = glbPublicUrl;
      updateData.glb_path = glbFileName;
      updateData.glb_file_size = glbFile.size;
      totalFileSize += glbFile.size;
    } else {
      // Conserver les données GLB existantes
      if (existingModel.glb_file_size) {
        totalFileSize += existingModel.glb_file_size;
      }
    }

    // Gérer la suppression/ajout du fichier USDZ
    if (removeUsdz && existingModel.usdz_path) {
      // Supprimer le fichier USDZ existant
      await supabase.storage
        .from('models-3d')
        .remove([existingModel.usdz_path]);
        
      updateData.usdz_url = null;
      updateData.usdz_path = null;
      updateData.usdz_file_size = null;
    } else if (usdzFile) {
      // Supprimer l'ancien fichier USDZ s'il existe
      if (existingModel.usdz_path) {
        await supabase.storage
          .from('models-3d')
          .remove([existingModel.usdz_path]);
      }
      
      // Upload du nouveau fichier USDZ avec le nom original
      const usdzFileName = usdzFile.name;
      const usdzArrayBuffer = await usdzFile.arrayBuffer();
      
      const { data: usdzUploadData, error: usdzUploadError } = await supabase.storage
        .from('models-3d')
        .upload(usdzFileName, usdzArrayBuffer, {
          contentType: usdzFile.type || 'model/vnd.usdz+zip',
          upsert: true
        });

      if (usdzUploadError) {
        throw new Error(`Erreur upload USDZ: ${usdzUploadError.message}`);
      }

      const { data: { publicUrl: usdzPublicUrl } } = supabase.storage
        .from('models-3d')
        .getPublicUrl(usdzFileName);

      updateData.usdz_url = usdzPublicUrl;
      updateData.usdz_path = usdzFileName;
      updateData.usdz_file_size = usdzFile.size;
      totalFileSize += usdzFile.size;
    } else {
      // Conserver les données USDZ existantes
      if (existingModel.usdz_file_size) {
        totalFileSize += existingModel.usdz_file_size;
      }
    }

    // Gérer la suppression/ajout du thumbnail
    if (removeThumbnail && existingModel.thumbnail_path) {
      // Supprimer le thumbnail existant
      await supabase.storage
        .from('models-3d')
        .remove([existingModel.thumbnail_path]);
        
      updateData.thumbnail_url = null;
      updateData.thumbnail_path = null;
    } else if (thumbnailFile) {
      // Supprimer l'ancien thumbnail s'il existe
      if (existingModel.thumbnail_path) {
        await supabase.storage
          .from('models-3d')
          .remove([existingModel.thumbnail_path]);
      }
      
      // Upload du nouveau thumbnail avec le nom original
      const thumbnailFileName = `thumbnails/${thumbnailFile.name}`;
      const thumbnailArrayBuffer = await thumbnailFile.arrayBuffer();
      
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
        .from('models-3d')
        .upload(thumbnailFileName, thumbnailArrayBuffer, {
          contentType: thumbnailFile.type,
          upsert: true
        });

      if (thumbnailUploadError) {
        throw new Error(`Erreur upload thumbnail: ${thumbnailUploadError.message}`);
      }

      const { data: { publicUrl: thumbnailPublicUrl } } = supabase.storage
        .from('models-3d')
        .getPublicUrl(thumbnailFileName);

      updateData.thumbnail_url = thumbnailPublicUrl;
      updateData.thumbnail_path = thumbnailFileName;
    }

    // Mettre à jour la taille totale si nécessaire
    if (totalFileSize > 0) {
      updateData.file_size = totalFileSize;
    }

    // Marquer la date de mise à jour
    updateData.updated_at = new Date().toISOString();

    // Mettre à jour le nom de fichier principal si on remplace le fichier principal
    if (usdzFile && !existingModel.glb_url && !glbFile) {
      // Si c'est un modèle USDZ uniquement et qu'on remplace le USDZ
      updateData.filename = usdzFile.name; // Utiliser le nom original du fichier
      updateData.original_name = usdzFile.name;
      updateData.public_url = updateData.usdz_url;
      updateData.storage_path = updateData.usdz_path;
      updateData.mime_type = usdzFile.type || 'model/vnd.usdz+zip';
    } else if (glbFile && !existingModel.usdz_url && !usdzFile) {
      // Si c'est un modèle GLB uniquement et qu'on remplace le GLB
      updateData.filename = glbFile.name; // Utiliser le nom original du fichier
      updateData.original_name = glbFile.name;
      updateData.public_url = updateData.glb_url;
      updateData.storage_path = updateData.glb_path;
      updateData.mime_type = glbFile.type || 'model/gltf-binary';
    }

    // Déterminer les formats disponibles
    const hasGlb = !removeGlb && (glbFile || existingModel.glb_url);
    const hasUsdz = !removeUsdz && (usdzFile || existingModel.usdz_url);
    
    // TODO: Ajouter la colonne format à la base de données
    // Déterminer et mettre à jour le format (temporairement désactivé)
    // let formatValue = '';
    // if (hasGlb && hasUsdz) {
    //   formatValue = 'GLB + USDZ';
    // } else if (hasGlb) {
    //   formatValue = 'GLB';
    // } else if (hasUsdz) {
    //   formatValue = 'USDZ';
    // }
    // 
    // if (formatValue) {
    //   updateData.format = formatValue;
    // }

    // Mettre à jour le modèle dans la base de données
    console.log('🔄 Données à mettre à jour:', updateData);
    
    const { data: updatedModel, error: updateError } = await supabase
      .from('models_3d')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', modelId)
      .select()
      .single();

    console.log('✅ Modèle mis à jour:', updatedModel);

    if (updateError) {
      throw new Error(`Erreur mise à jour DB: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      model: updatedModel,
      message: 'Modèle mis à jour avec succès'
    });

  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}

// Optionnel: Ajouter une méthode GET pour récupérer un modèle spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;
    const { data: model, error } = await supabase
      .from('models_3d')
      .select('*')
      .eq('id', modelId)
      .single();

    if (error || !model) {
      return NextResponse.json(
        { success: false, error: 'Modèle non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model
    });

  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 