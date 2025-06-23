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

async function addCategorizationColumns() {
  console.log('🚀 Ajout des colonnes de catégorisation...');

  try {
    // Exécuter le script SQL pour ajouter les colonnes
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Ajouter les colonnes de catégorisation si elles n'existent pas
        DO $$ 
        BEGIN
            -- Vérifier et ajouter category
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'models_3d' AND column_name = 'category') THEN
                ALTER TABLE models_3d ADD COLUMN category VARCHAR(50);
                RAISE NOTICE 'Colonne category ajoutée';
            ELSE
                RAISE NOTICE 'Colonne category existe déjà';
            END IF;
            
            -- Vérifier et ajouter tags
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'models_3d' AND column_name = 'tags') THEN
                ALTER TABLE models_3d ADD COLUMN tags TEXT[];
                RAISE NOTICE 'Colonne tags ajoutée';
            ELSE
                RAISE NOTICE 'Colonne tags existe déjà';
            END IF;
            
            -- Vérifier et ajouter description
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'models_3d' AND column_name = 'description') THEN
                ALTER TABLE models_3d ADD COLUMN description TEXT;
                RAISE NOTICE 'Colonne description ajoutée';
            ELSE
                RAISE NOTICE 'Colonne description existe déjà';
            END IF;
            
            -- Vérifier et ajouter ingredients
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'models_3d' AND column_name = 'ingredients') THEN
                ALTER TABLE models_3d ADD COLUMN ingredients TEXT[];
                RAISE NOTICE 'Colonne ingredients ajoutée';
            ELSE
                RAISE NOTICE 'Colonne ingredients existe déjà';
            END IF;
        END $$;
      `
    });

    if (error) {
      console.error('❌ Erreur lors de l\'ajout des colonnes:', error);
      return;
    }

    // Créer les index pour optimiser les recherches
    console.log('📊 Création des index...');
    
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_models_3d_category ON models_3d(category);',
      'CREATE INDEX IF NOT EXISTS idx_models_3d_tags ON models_3d USING GIN(tags);',
      'CREATE INDEX IF NOT EXISTS idx_models_3d_name ON models_3d(name);',
      'CREATE INDEX IF NOT EXISTS idx_models_3d_ingredients ON models_3d USING GIN(ingredients);'
    ];

    for (const query of indexQueries) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: query });
      if (indexError) {
        console.warn('⚠️ Erreur lors de la création d\'un index:', indexError);
      }
    }

    console.log('✅ Colonnes de catégorisation ajoutées avec succès!');
    
    // Afficher les colonnes actuelles
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'models_3d')
      .order('ordinal_position');

    if (!columnsError && columns) {
      console.log('\n📋 Colonnes actuelles de la table models_3d:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Vérifier les modèles existants
    const { data: models, error: modelsError } = await supabase
      .from('models_3d')
      .select('id, name, category, tags, description, ingredients')
      .limit(5);

    if (!modelsError && models) {
      console.log('\n🔍 Aperçu des modèles (les 5 premiers):');
      models.forEach(model => {
        console.log(`  - ${model.name}:`);
        console.log(`    Category: ${model.category || 'null'}`);
        console.log(`    Tags: ${model.tags || 'null'}`);
        console.log(`    Description: ${model.description || 'null'}`);
        console.log(`    Ingredients: ${model.ingredients || 'null'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour mettre à jour des modèles avec des données de test
async function addSampleData() {
  console.log('🎯 Ajout de données de test...');

  const sampleUpdates = [
    {
      filter: { name: { ilike: '%ball%' } },
      update: {
        category: 'autres',
        tags: ['sport', 'nouveau'],
        description: 'Ballon de sport réaliste',
        ingredients: ['matériau synthétique', 'cuir']
      }
    },
    {
      filter: { name: { ilike: '%cat%' } },
      update: {
        category: 'autres',
        tags: ['animal', 'mignon'],
        description: 'Modèle de chat adorable',
        ingredients: ['fourrure', 'yeux']
      }
    }
  ];

  for (const sample of sampleUpdates) {
    const { data, error } = await supabase
      .from('models_3d')
      .update(sample.update)
      .match(sample.filter)
      .select();

    if (error) {
      console.warn('⚠️ Erreur lors de la mise à jour:', error);
    } else if (data && data.length > 0) {
      console.log(`✅ Mis à jour ${data.length} modèle(s) correspondant au filtre`);
    }
  }
}

// Exécuter le script
async function main() {
  await addCategorizationColumns();
  
  // Demander si on veut ajouter des données de test
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n❓ Voulez-vous ajouter des données de test aux modèles existants? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      addSampleData().then(() => {
        console.log('🎉 Migration terminée!');
        rl.close();
      });
    } else {
      console.log('🎉 Migration terminée sans données de test!');
      rl.close();
    }
  });
}

main().catch(console.error); 