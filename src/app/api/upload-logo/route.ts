import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;
    const imageType = formData.get('type') as string || 'logo'; // 'logo' ou 'ambiance'

    if (!file || !restaurantId) {
      return NextResponse.json(
        { error: 'Fichier et restaurant ID requis' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Veuillez sélectionner une image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB pour ambiance, 5MB pour logo)
    const maxSize = imageType === 'ambiance' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = imageType === 'ambiance' ? 10 : 5;
      return NextResponse.json(
        { error: `L'image ne doit pas dépasser ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Create file path based on type
    const fileExt = file.name.split('.').pop();
    const fileName = `${imageType}-${restaurantId}-${Date.now()}.${fileExt}`;
    const filePath = `${imageType === 'ambiance' ? 'ambiance' : 'logos'}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('models-3d')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Erreur upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('models-3d')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Impossible de générer l\'URL publique' },
        { status: 500 }
      );
    }

    // Update restaurant in database with new image URL
    const updateField = imageType === 'ambiance' ? 'ambiance_image_url' : 'logo_url';
    
    const { error: updateError } = await supabaseAdmin
      .from('restaurants')
      .update({ [updateField]: urlData.publicUrl })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Pour les images d'ambiance, si la colonne n'existe pas encore, on continue sans erreur
      if (imageType === 'ambiance' && updateError.message?.includes('column')) {
        console.log('Colonne ambiance_image_url non trouvée, continuons sans sauvegarder en base');
      } else {
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour en base de données' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      [imageType === 'ambiance' ? 'imageUrl' : 'logoUrl']: urlData.publicUrl,
      filePath: filePath
    });

  } catch (error) {
    console.error('Error in upload-logo API:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
} 