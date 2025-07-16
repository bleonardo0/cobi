import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || 'week';
    
    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID requis'
      }, { status: 400 });
    }

    const { id } = await params;
    const modelId = id;
    
    // Calculer la date de début selon la période
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'day':
        startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      default:
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    // Récupérer les vues du modèle depuis la période spécifiée
    const { data: views, error } = await supabase
      .from('model_views')
      .select('id, viewed_at')
      .eq('model_id', modelId)
      .eq('restaurant_id', restaurantId)
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des vues:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des vues'
      }, { status: 500 });
    }

    // Compter les vues
    const viewsCount = views?.length || 0;

    return NextResponse.json({
      success: true,
      views: viewsCount,
      period: period,
      modelId: modelId,
      restaurantId: restaurantId
    });

  } catch (error) {
    console.error('Erreur dans l\'endpoint model-views:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
} 