import { NextRequest, NextResponse } from 'next/server';
import { trackModelView } from '@/lib/analytics-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, restaurantId } = body;

    if (!modelId || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'modelId et restaurantId sont requis' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';
    
    console.log(`📊 Tracking vue modèle: ${modelId} pour restaurant: ${restaurantId}`);

    const success = await trackModelView(modelId, restaurantId, userAgent);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Vue modèle trackée avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Erreur lors du tracking' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur API track-model-view:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 