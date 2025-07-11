import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Ajout de la colonne last_login à la table users...');

    // Vérifier d'abord si la colonne existe déjà
    const { data: columns, error: columnError } = await supabaseAdmin
      .rpc('sql', { 
        query: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'last_login';
        `
      });

    if (columnError) {
      // Essayer une approche alternative - tenter directement l'ajout
      console.log('Tentative d\'ajout direct de la colonne...');
    }

    // Ajouter la colonne last_login
    const { error: addColumnError } = await supabaseAdmin
      .rpc('sql', { 
        query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;'
      });

    if (addColumnError) {
      return NextResponse.json({
        success: false,
        error: 'Impossible d\'ajouter la colonne automatiquement',
        instructions: 'Allez dans Supabase Dashboard > SQL Editor et exécutez: ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;',
        sql_command: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;'
      });
    }

    // Vérifier que la colonne a été ajoutée
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id, last_login')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Colonne ajoutée mais problème de vérification: ' + testError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Colonne last_login ajoutée avec succès!',
      next_step: 'Vous pouvez maintenant vous connecter normalement'
    });

  } catch (error) {
    console.error('💥 Erreur ajout colonne:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        manual_fix: 'Exécutez dans Supabase Dashboard: ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;'
      },
      { status: 500 }
    );
  }
} 