import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase non configuré' },
        { status: 503 }
      );
    }

    const { restaurantSlug, restaurantId } = await request.json();

    if (!restaurantSlug || !restaurantId) {
      return NextResponse.json(
        { error: 'restaurantSlug et restaurantId requis' },
        { status: 400 }
      );
    }

    // Récupérer tous les modèles sans restaurant_id
    const { data: unassignedModels, error: fetchError } = await supabaseAdmin
      .from('models_3d')
      .select('id, name, created_at')
      .is('restaurant_id', null);

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des modèles: ${fetchError.message}`);
    }

    console.log(`🔍 Trouvé ${unassignedModels?.length || 0} modèles sans restaurant assigné`);

    if (!unassignedModels || unassignedModels.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun modèle sans restaurant trouvé',
        modelsUpdated: 0
      });
    }

    // Assigner tous les modèles sans restaurant au restaurant spécifié
    const { data: updatedModels, error: updateError } = await supabaseAdmin
      .from('models_3d')
      .update({ restaurant_id: restaurantId })
      .is('restaurant_id', null)
      .select();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    console.log(`✅ ${updatedModels?.length || 0} modèles assignés au restaurant ${restaurantSlug}`);

    return NextResponse.json({
      success: true,
      message: `${updatedModels?.length || 0} modèles assignés au restaurant ${restaurantSlug}`,
      modelsUpdated: updatedModels?.length || 0,
      models: updatedModels?.map(m => ({ id: m.id, name: m.name }))
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation des modèles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase non configuré' },
        { status: 503 }
      );
    }

    // Récupérer tous les modèles sans restaurant_id
    const { data: unassignedModels, error: fetchError } = await supabaseAdmin
      .from('models_3d')
      .select('id, name, created_at, slug')
      .is('restaurant_id', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
    }

    return NextResponse.json({
      success: true,
      unassignedModels: unassignedModels || [],
      count: unassignedModels?.length || 0
    });

  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 