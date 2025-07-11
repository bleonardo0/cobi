import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, restaurantId, sessionId, viewDuration } = body;

    if (!modelId || !restaurantId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'modelId, restaurantId et sessionId sont requis' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking fin de vue modèle: ${modelId} pour restaurant: ${restaurantId}, durée: ${viewDuration}s`);

    // Chercher la vue la plus récente pour ce modèle et session
    const { data: existingViews, error: findError } = await supabaseAdmin
      .from('model_views')
      .select('*')
      .eq('model_id', modelId)
      .eq('restaurant_id', restaurantId)
      .eq('session_id', sessionId)
      .order('viewed_at', { ascending: false })
      .limit(1);

    if (findError) {
      console.error('❌ Erreur lors de la recherche de la vue:', findError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la recherche de la vue' },
        { status: 500 }
      );
    }

    let data = null;
    let error = null;

    if (existingViews && existingViews.length > 0) {
      // Mettre à jour la vue existante
      const viewToUpdate = existingViews[0];
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('model_views')
        .update({
          view_duration: viewDuration,
          ended_at: new Date().toISOString()
        })
        .eq('id', viewToUpdate.id)
        .select()
        .single();
      
      data = updateData;
      error = updateError;
    } else {
      // Aucune vue trouvée, créer une nouvelle entrée avec la durée
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('model_views')
        .insert({
          model_id: modelId,
          restaurant_id: restaurantId,
          session_id: sessionId,
          view_duration: viewDuration,
          ended_at: new Date().toISOString(),
          interaction_type: 'view'
        })
        .select()
        .single();
      
      data = insertData;
      error = insertError;
    }

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de la vue:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la vue' },
        { status: 500 }
      );
    }

    console.log('✅ Fin de vue trackée:', data);
    return NextResponse.json({
      success: true,
      message: 'Fin de vue trackée avec succès',
      data
    });

  } catch (error) {
    console.error('❌ Erreur API track-view-end:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 