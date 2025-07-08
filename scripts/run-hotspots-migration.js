/**
 * Script de migration pour ajouter les colonnes hotspots
 * Usage: node scripts/run-hotspots-migration.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Début de la migration hotspots...')
    
    // Lire le fichier SQL
    const migrationPath = path.join(__dirname, '..', 'migration-add-hotspots-columns.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    
    // Diviser le contenu en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📋 ${commands.length} commandes à exécuter`)
    
    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      console.log(`\n⏳ Exécution de la commande ${i + 1}/${commands.length}...`)
      
      const { data, error } = await supabase.rpc('sql', {
        query: command
      })
      
      if (error) {
        console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`, error)
        throw error
      }
      
      console.log(`✅ Commande ${i + 1} exécutée avec succès`)
    }
    
    // Vérification des colonnes ajoutées
    console.log('\n🔍 Vérification des colonnes ajoutées...')
    
    const { data: columns, error: columnError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'models_3d' 
        AND (column_name LIKE '%hotspot%' 
             OR column_name IN ('nutri_score', 'security_risk', 'origin_country', 'transport_distance', 'carbon_footprint'))
        ORDER BY column_name;
      `
    })
    
    if (columnError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnError)
    } else {
      console.log('\n📊 Colonnes hotspots dans la base de données:')
      console.table(columns)
    }
    
    console.log('\n🎉 Migration hotspots terminée avec succès!')
    console.log('✨ Les hotspots peuvent maintenant être sauvegardés et chargés correctement.')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
    process.exit(1)
  }
}

// Fonction pour tester la connexion
async function testConnection() {
  try {
    const { data, error } = await supabase.rpc('sql', {
      query: 'SELECT NOW() as current_time'
    })
    
    if (error) {
      throw error
    }
    
    console.log('✅ Connexion à Supabase réussie')
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error)
    return false
  }
}

// Exécution principale
async function main() {
  console.log('🎯 Script de migration des hotspots')
  console.log('=====================================\n')
  
  // Tester la connexion
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // Demander confirmation
  console.log('⚠️  Cette migration va ajouter les colonnes suivantes à la table models_3d:')
  console.log('   - hotspots_enabled (boolean)')
  console.log('   - hotspots_config (jsonb)')
  console.log('   - nutri_score (text)')
  console.log('   - security_risk (boolean)')
  console.log('   - origin_country (text)')
  console.log('   - transport_distance (numeric)')
  console.log('   - carbon_footprint (numeric)')
  console.log('')
  
  // En mode automatique, pas de confirmation nécessaire
  if (process.argv.includes('--auto')) {
    console.log('🤖 Mode automatique activé, exécution de la migration...')
    await runMigration()
  } else {
    // Pour un usage manuel avec confirmation
    console.log('Pour exécuter la migration automatiquement, utilisez: node scripts/run-hotspots-migration.js --auto')
    await runMigration()
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('💥 Erreur non gérée:', error)
  process.exit(1)
})

main() 