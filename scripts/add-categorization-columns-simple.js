const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndAddColumns() {
  console.log('🚀 Vérification et ajout des colonnes de catégorisation...');

  try {
    // Vérifier les colonnes existantes
    const { data: existingColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'models_3d');

    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }

    const columnNames = existingColumns.map(col => col.column_name);
    console.log('📋 Colonnes existantes:', columnNames);

    // Vérifier quelles colonnes manquent
    const requiredColumns = ['category', 'tags', 'description', 'ingredients'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes de catégorisation existent déjà!');
    } else {
      console.log('⚠️ Colonnes manquantes:', missingColumns);
      console.log('📝 Vous devez ajouter ces colonnes manuellement dans Supabase Dashboard:');
      console.log('');
      
      missingColumns.forEach(col => {
        switch (col) {
          case 'category':
            console.log(`ALTER TABLE models_3d ADD COLUMN ${col} VARCHAR(50);`);
            break;
          case 'tags':
          case 'ingredients':
            console.log(`ALTER TABLE models_3d ADD COLUMN ${col} TEXT[];`);
            break;
          case 'description':
            console.log(`ALTER TABLE models_3d ADD COLUMN ${col} TEXT;`);
            break;
        }
      });
      
      console.log('');
      console.log('📊 Index recommandés:');
      console.log('CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);');
      console.log('CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);');
      console.log('CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);');
    }

    // Vérifier les modèles existants
    const { data: models, error: modelsError } = await supabase
      .from('models_3d')
      .select('id, name, category, tags, description, ingredients')
      .limit(3);

    if (!modelsError && models) {
      console.log('\n🔍 Aperçu des modèles (les 3 premiers):');
      models.forEach(model => {
        console.log(`  - ${model.name}:`);
        console.log(`    Category: ${model.category || 'null'}`);
        console.log(`    Tags: ${model.tags || 'null'}`);
        console.log(`    Description: ${model.description || 'null'}`);
        console.log(`    Ingredients: ${model.ingredients || 'null'}`);
        console.log('');
      });
    } else if (modelsError) {
      console.log('⚠️ Les colonnes de catégorisation ne sont pas encore ajoutées');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour ajouter des données de test
async function addSampleData() {
  console.log('🎯 Ajout de données de test...');

  try {
    // Obtenir quelques modèles existants
    const { data: models, error: fetchError } = await supabase
      .from('models_3d')
      .select('id, name')
      .limit(5);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modèles:', fetchError);
      return;
    }

    if (!models || models.length === 0) {
      console.log('ℹ️ Aucun modèle trouvé pour ajouter des données de test');
      return;
    }

    // Ajouter des données de test pour chaque modèle
    for (const model of models) {
      const sampleData = getSampleDataForModel(model.name);
      
      const { error: updateError } = await supabase
        .from('models_3d')
        .update(sampleData)
        .eq('id', model.id);

      if (updateError) {
        console.warn(`⚠️ Erreur lors de la mise à jour de ${model.name}:`, updateError);
      } else {
        console.log(`✅ Données ajoutées pour: ${model.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
  }
}

function getSampleDataForModel(name) {
  const lowerName = name.toLowerCase();
  
  // Données de test basées sur le nom
  if (lowerName.includes('ball') || lowerName.includes('sport')) {
    return {
      category: 'autres',
      tags: ['sport', 'nouveau'],
      description: 'Équipement de sport réaliste',
      ingredients: ['matériau synthétique', 'cuir']
    };
  } else if (lowerName.includes('cat') || lowerName.includes('animal')) {
    return {
      category: 'autres',
      tags: ['animal', 'mignon'],
      description: 'Modèle d\'animal adorable',
      ingredients: ['fourrure', 'détails réalistes']
    };
  } else if (lowerName.includes('food') || lowerName.includes('cake') || lowerName.includes('pizza')) {
    return {
      category: 'desserts',
      tags: ['fait-maison', 'signature'],
      description: 'Délicieuse création culinaire',
      ingredients: ['farine', 'sucre', 'œufs', 'beurre']
    };
  } else {
    return {
      category: 'autres',
      tags: ['nouveau'],
      description: 'Modèle 3D de qualité',
      ingredients: ['matériaux divers']
    };
  }
}

// Exécuter le script
async function main() {
  await checkAndAddColumns();
  
  // Demander si on veut ajouter des données de test
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n❓ Voulez-vous ajouter des données de test aux modèles existants? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      addSampleData().then(() => {
        console.log('🎉 Script terminé!');
        rl.close();
      });
    } else {
      console.log('🎉 Script terminé sans données de test!');
      rl.close();
    }
  });
}

main().catch(console.error); 