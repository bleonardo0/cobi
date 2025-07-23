import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'models-3d';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id;
    const formData = await request.formData();

    // Récupérer le modèle existant
    const { data: existingModel, error: fetchError } = await supabaseAdmin
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

    let updatedModel = { ...existingModel };

    // Gérer l'upload du fichier GLB
    const glbFile = formData.get('glbFile') as File | null;
    if (glbFile) {
      console.log('📁 Upload GLB file:', glbFile.name, glbFile.size);
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const sanitizedName = glbFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      
      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, glbFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur upload GLB:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de l\'upload du fichier GLB' },
          { status: 500 }
        );
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      updatedModel.url = urlData.publicUrl;
      updatedModel.fileSize = glbFile.size;
      updatedModel.filename = fileName;
      updatedModel.originalName = glbFile.name;
    }

    // Gérer l'upload de l'image de prévisualisation
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    if (thumbnailFile) {
      console.log('🖼️ Upload thumbnail:', thumbnailFile.name, thumbnailFile.size);
      
      // Générer un nom de fichier unique pour la thumbnail
      const timestamp = Date.now();
      const extension = thumbnailFile.name.split('.').pop();
      const thumbnailFileName = `thumbnail_${modelId}_${timestamp}.${extension}`;
      
      // Upload vers Supabase Storage (dans le même bucket que les autres fichiers)
      const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(`thumbnails/${thumbnailFileName}`, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (thumbnailUploadError) {
        console.error('Erreur upload thumbnail:', thumbnailUploadError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de l\'upload de l\'image de prévisualisation' },
          { status: 500 }
        );
      }

      // Obtenir l'URL publique
      const { data: thumbnailUrlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`thumbnails/${thumbnailFileName}`);

      updatedModel.thumbnailUrl = thumbnailUrlData.publicUrl;
    }

    // Gérer la suppression de fichiers
    const removeGlb = formData.get('removeGlb') === 'true';
    const removeThumbnail = formData.get('removeThumbnail') === 'true';

    if (removeGlb) {
      updatedModel.url = null;
      updatedModel.fileSize = null;
      updatedModel.filename = null;
    }

    if (removeThumbnail) {
      updatedModel.thumbnailUrl = null;
    }

    // Mettre à jour le modèle dans la base de données
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('models_3d')
      .update({
        url: updatedModel.url,
        thumbnailUrl: updatedModel.thumbnailUrl,
        fileSize: updatedModel.fileSize,
        filename: updatedModel.filename,
        originalName: updatedModel.originalName,
        updated_at: new Date().toISOString()
      })
      .eq('id', modelId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour modèle:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du modèle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fichiers mis à jour avec succès',
      model: updateData
    });

  } catch (error) {
    console.error('Erreur API files:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 