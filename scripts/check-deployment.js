#!/usr/bin/env node

/**
 * Script de vérification de la configuration pour le déploiement
 * Vérifie que toutes les variables d'environnement nécessaires sont présentes
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET'
];

console.log('🔍 Vérification de la configuration de déploiement...\n');

let allGood = true;

// Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement :');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('KEY') ? `${value.substring(0, 10)}...` : value) : 
    'NON DÉFINIE';
  
  console.log(`  ${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    allGood = false;
  }
});

console.log('\n🔧 Configuration Supabase :');

// Vérifier la structure de l'URL Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  console.log(`  ${isValidUrl ? '✅' : '❌'} Format URL Supabase: ${isValidUrl ? 'Valide' : 'Invalide'}`);
  if (!isValidUrl) allGood = false;
} else {
  console.log('  ❌ URL Supabase non définie');
}

// Vérifier le nom du bucket
const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
if (bucket) {
  const isValidBucket = bucket === 'models-3d';
  console.log(`  ${isValidBucket ? '✅' : '⚠️'} Bucket de stockage: ${bucket}`);
  if (!isValidBucket) {
    console.log('    ⚠️  Le bucket recommandé est "models-3d"');
  }
} else {
  console.log('  ❌ Bucket de stockage non défini');
}

console.log('\n📁 Structure du projet :');

// Vérifier les fichiers importants
const fs = require('fs');
const path = require('path');

const importantFiles = [
  'src/app/api/upload/route.ts',
  'src/app/api/models/route.ts',
  'src/lib/models.ts',
  'supabase-setup.sql'
];

importantFiles.forEach(filePath => {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
  if (!exists) allGood = false;
});

console.log('\n🚀 Résultat :');
if (allGood) {
  console.log('✅ Configuration prête pour le déploiement !');
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Ajoutez ces variables dans Vercel Settings > Environment Variables');
  console.log('2. Redéployez votre application');
  console.log('3. Testez l\'upload de fichiers');
  process.exit(0);
} else {
  console.log('❌ Configuration incomplète');
  console.log('\n📝 Actions requises :');
  console.log('1. Configurez toutes les variables d\'environnement manquantes');
  console.log('2. Consultez SUPABASE_SETUP.md pour la configuration Supabase');
  console.log('3. Consultez VERCEL_DEPLOYMENT.md pour le déploiement');
  process.exit(1);
} 