/**
 * Script pour vérifier les données hotspots en base de données
 * Usage: node scripts/check-hotspots-data.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: 'cobi/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkHotspotsData() {
  try {
    console.log('🔍 Vérification des données hotspots...\n')
    
    // Récupérer tous les modèles avec des colonnes hotspots
    const { data: models, error } = await supabase
      .from('models_3d')
      .select(`
        id, 
        name, 
        hotspots_enabled, 
        hotspots_config, 
        nutri_score, 
        security_risk, 
        origin_country, 
        transport_distance, 
        carbon_footprint
      `)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error)
      return
    }

    if (!models || models.length === 0) {
      console.log('📭 Aucun modèle trouvé')
      return
    }

    console.log(`📊 ${models.length} modèles trouvés:\n`)

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`)
      console.log(`   ID: ${model.id}`)
      console.log(`   Hotspots activés: ${model.hotspots_enabled ? '✅ OUI' : '❌ NON'}`)
      
      if (model.hotspots_config && Object.keys(model.hotspots_config).length > 0) {
        console.log(`   Config hotspots: ✅ Présente (${Object.keys(model.hotspots_config).length} éléments)`)
        console.log(`   Config détail: ${JSON.stringify(model.hotspots_config)}`)
      } else {
        console.log(`   Config hotspots: ❌ Vide ou nulle`)
      }
      
      if (model.nutri_score) console.log(`   Nutri-Score: ${model.nutri_score}`)
      if (model.security_risk) console.log(`   Risque sécurité: ⚠️ OUI`)
      if (model.origin_country) console.log(`   Pays: ${model.origin_country}`)
      if (model.transport_distance) console.log(`   Transport: ${model.transport_distance} km`)
      if (model.carbon_footprint) console.log(`   CO2: ${model.carbon_footprint} kg`)
      
      console.log('') // Ligne vide
    })

    // Statistiques
    const enabledCount = models.filter(m => m.hotspots_enabled).length
    const configCount = models.filter(m => m.hotspots_config && Object.keys(m.hotspots_config).length > 0).length
    
    console.log('📈 Statistiques:')
    console.log(`   Modèles avec hotspots activés: ${enabledCount}/${models.length}`)
    console.log(`   Modèles avec configuration: ${configCount}/${models.length}`)

  } catch (error) {
    console.error('💥 Erreur:', error)
  }
}

checkHotspotsData() 