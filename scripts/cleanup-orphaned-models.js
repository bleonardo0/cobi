#!/usr/bin/env node

/**
 * Script de nettoyage des modèles orphelins
 * Supprime les entrées de base de données qui n'ont pas de fichier correspondant dans le storage
 */

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'models-3d';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que ces variables sont définies :');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('- NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET (optionnel)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOrphanedModels() {
  console.log('🧹 Début du nettoyage des modèles orphelins...\n');

  try {
    // 1. Récupérer tous les modèles de la base
    console.log('📋 Récupération des modèles en base de données...');
    const { data: models, error: dbError } = await supabase
      .from('models_3d')
      .select('*');

    if (dbError) {
      throw new Error(`Erreur base de données: ${dbError.message}`);
    }

    console.log(`✅ ${models.length} modèles trouvés en base\n`);

    // 2. Récupérer tous les fichiers du bucket
    console.log('☁️ Récupération des fichiers du storage...');
    const { data: files, error: storageError } = await supabase.storage
      .from(bucketName)
      .list('models', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (storageError) {
      throw new Error(`Erreur storage: ${storageError.message}`);
    }

    const fileNames = files.map(file => file.name);
    console.log(`✅ ${fileNames.length} fichiers trouvés dans le storage\n`);

    // 3. Identifier les modèles orphelins
    console.log('🔍 Identification des modèles orphelins...');
    const orphanedModels = [];

    for (const model of models) {
      const filename = model.filename;
      const fileExists = fileNames.includes(filename);
      
      console.log(`📄 ${model.name} (${filename}): ${fileExists ? '✅ OK' : '❌ ORPHELIN'}`);
      
      if (!fileExists) {
        orphanedModels.push(model);
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`- Modèles en base: ${models.length}`);
    console.log(`- Fichiers en storage: ${fileNames.length}`);
    console.log(`- Modèles orphelins: ${orphanedModels.length}\n`);

    // 4. Supprimer les modèles orphelins
    if (orphanedModels.length > 0) {
      console.log('🗑️ Suppression des modèles orphelins...');
      
      for (const model of orphanedModels) {
        console.log(`🗑️ Suppression: ${model.name} (ID: ${model.id})`);
        
        const { error: deleteError } = await supabase
          .from('models_3d')
          .delete()
          .eq('id', model.id);

        if (deleteError) {
          console.error(`❌ Erreur lors de la suppression de ${model.name}: ${deleteError.message}`);
        } else {
          console.log(`✅ ${model.name} supprimé avec succès`);
        }
      }
    } else {
      console.log('✅ Aucun modèle orphelin trouvé !');
    }

    console.log('\n🎉 Nettoyage terminé !');

  } catch (error) {
    console.error('💥 Erreur lors du nettoyage:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
cleanupOrphanedModels(); 