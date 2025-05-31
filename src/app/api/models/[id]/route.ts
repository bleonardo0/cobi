import { NextRequest, NextResponse } from 'next/server';
import { deleteModel } from '@/lib/models';

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