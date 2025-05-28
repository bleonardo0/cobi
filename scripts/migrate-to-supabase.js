#!/usr/bin/env node

/**
 * Script de migration des données locales vers Supabase
 * 
 * Ce script migre :
 * - Les fichiers du dossier public/models vers Supabase Storage
 * - Les métadonnées du fichier data/models.json vers la table Supabase
 * 
 * Usage: node scripts/migrate-to-supabase.js
 */

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
const MODELS_DATA_FILE = path.join(process.cwd(), 'data', 'models.json');
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'models-3d';

// Vérifier les variables d'environnement
function checkEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nVeuillez configurer ces variables dans .env.local');
    process.exit(1);
  }
}

// Initialiser le client Supabase
function initSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Charger les données existantes
async function loadExistingData() {
  try {
    const data = await fs.readFile(MODELS_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('ℹ️  Aucun fichier de données existant trouvé');
    return [];
  }
}

// Vérifier si les fichiers existent
async function checkFiles(models) {
  const existingFiles = [];
  
  for (const model of models) {
    const filePath = path.join(MODELS_DIR, model.filename);
    try {
      await fs.access(filePath);
      existingFiles.push({ model, filePath });
    } catch (error) {
      console.warn(`⚠️  Fichier manquant: ${model.filename}`);
    }
  }
  
  return existingFiles;
}

// Uploader un fichier vers Supabase Storage
async function uploadFile(supabase, filePath, filename) {
  const fileBuffer = await fs.readFile(filePath);
  const storagePath = `models/${filename}`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erreur upload ${filename}: ${error.message}`);
  }

  // Obtenir l'URL publique
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return {
    path: storagePath,
    url: urlData.publicUrl
  };
}

// Insérer les métadonnées en base
async function insertModelData(supabase, model, storagePath, publicUrl) {
  const modelData = {
    id: model.id,
    name: model.name,
    filename: model.filename,
    original_name: model.name, // Utiliser le nom comme nom original
    file_size: model.fileSize,
    mime_type: model.mimeType,
    storage_path: storagePath,
    public_url: publicUrl,
    slug: model.slug,
    created_at: model.uploadDate,
    updated_at: model.uploadDate
  };

  const { error } = await supabase
    .from('models_3d')
    .insert(modelData);

  if (error) {
    throw new Error(`Erreur insertion ${model.name}: ${error.message}`);
  }
}

// Fonction principale de migration
async function migrate() {
  console.log('🚀 Début de la migration vers Supabase...\n');

  // Vérifications préliminaires
  checkEnvironment();
  const supabase = initSupabase();

  // Charger les données existantes
  console.log('📂 Chargement des données existantes...');
  const models = await loadExistingData();
  
  if (models.length === 0) {
    console.log('ℹ️  Aucun modèle à migrer');
    return;
  }

  console.log(`📊 ${models.length} modèle(s) trouvé(s)`);

  // Vérifier les fichiers
  console.log('🔍 Vérification des fichiers...');
  const existingFiles = await checkFiles(models);
  console.log(`✅ ${existingFiles.length} fichier(s) disponible(s)`);

  if (existingFiles.length === 0) {
    console.log('❌ Aucun fichier à migrer');
    return;
  }

  // Migration
  let successCount = 0;
  let errorCount = 0;

  for (const { model, filePath } of existingFiles) {
    try {
      console.log(`📤 Migration de ${model.filename}...`);
      
      // Upload du fichier
      const { path: storagePath, url: publicUrl } = await uploadFile(
        supabase, 
        filePath, 
        model.filename
      );
      
      // Insertion des métadonnées
      await insertModelData(supabase, model, storagePath, publicUrl);
      
      console.log(`✅ ${model.filename} migré avec succès`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Erreur pour ${model.filename}: ${error.message}`);
      errorCount++;
    }
  }

  // Résumé
  console.log('\n📋 Résumé de la migration:');
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Migration terminée !');
    console.log('💡 Vous pouvez maintenant supprimer les fichiers locaux:');
    console.log('   - rm -rf public/models/*');
    console.log('   - rm data/models.json');
  }
}

// Exécution
if (require.main === module) {
  migrate().catch(error => {
    console.error('💥 Erreur fatale:', error.message);
    process.exit(1);
  });
}

module.exports = { migrate }; 