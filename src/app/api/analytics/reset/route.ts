import { NextRequest, NextResponse } from 'next/server';
import { resetAllData } from '@/lib/analytics-simple';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Remise à zéro des données analytics...');

    const success = await resetAllData();

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Toutes les données analytics ont été supprimées'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression des données' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur API reset:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 