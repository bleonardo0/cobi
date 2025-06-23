import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '@/lib/analytics-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obtenir les vues pour ce modèle
    const modelViews = analyticsStorage.getViewsByModel(id);
    const viewCount = modelViews.length;
    
    return NextResponse.json({
      success: true,
      modelId: id,
      views: viewCount,
    });
  } catch (error) {
    console.error('💥 Error fetching model views:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de récupération des vues' 
      },
      { status: 500 }
    );
  }
} 