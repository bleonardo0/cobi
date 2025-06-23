const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données de test pour différents types de modèles
const sampleCategories = [
  {
    pattern: ['avocado', 'fruit', 'légume'],
    data: {
      category: 'entrees',
      tags: ['vegan', 'bio', 'leger'],
      description: 'Avocat frais et savoureux',
      ingredients: ['avocat', 'huile d\'olive', 'citron', 'sel']
    }
  },
  {
    pattern: ['dog', 'cat', 'animal'],
    data: {
      category: 'autres',
      tags: ['mignon', 'nouveau'],
      description: 'Modèle d\'animal adorable',
      ingredients: ['détails réalistes', 'texture naturelle']
    }
  },
  {
    pattern: ['werewolf', 'warrior', 'character'],
    data: {
      category: 'autres',
      tags: ['signature', 'epice'],
      description: 'Personnage fantastique unique',
      ingredients: ['design original', 'détails complexes']
    }
  },
  {
    pattern: ['ball', 'sport'],
    data: {
      category: 'autres',
      tags: ['sport', 'nouveau'],
      description: 'Équipement sportif réaliste',
      ingredients: ['matériau synthétique', 'texture authentique']
    }
  },
  {
    pattern: ['pizza', 'burger', 'food', 'cake'],
    data: {
      category: 'plats',
      tags: ['fait-maison', 'signature'],
      description: 'Spécialité de la maison',
      ingredients: ['ingrédients frais', 'recette traditionnelle']
    }
  },
  {
    pattern: ['dessert', 'sweet', 'chocolate'],
    data: {
      category: 'desserts',
      tags: ['fait-maison', 'signature'],
      description: 'Dessert gourmand fait maison',
      ingredients: ['chocolat', 'sucre', 'crème', 'vanille']
    }
  },
  {
    pattern: ['drink', 'coffee', 'tea', 'juice'],
    data: {
      category: 'boissons',
      tags: ['bio', 'leger'],
      description: 'Boisson rafraîchissante',
      ingredients: ['ingrédients naturels', 'sans conservateur']
    }
  }
];

function getCategoryForModel(name) {
  const lowerName = name.toLowerCase();
  
  for (const category of sampleCategories) {
    if (category.pattern.some(pattern => lowerName.includes(pattern))) {
      return category.data;
    }
  }
  
  // Catégorie par défaut
  return {
    category: 'autres',
    tags: ['nouveau'],
    description: 'Modèle 3D de qualité',
    ingredients: ['design soigné']
  };
}

async function addSampleData() {
  console.log('🎯 Ajout de données de catégorisation...');

  try {
    // Récupérer tous les modèles
    const { data: models, error: fetchError } = await supabase
      .from('models_3d')
      .select('id, name, category');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modèles:', fetchError);
      return;
    }

    console.log(`📊 ${models.length} modèles trouvés`);

    let updated = 0;
    let skipped = 0;

    for (const model of models) {
      // Skip si déjà une catégorie
      if (model.category) {
        skipped++;
        continue;
      }

      const categoryData = getCategoryForModel(model.name);
      
      const { error: updateError } = await supabase
        .from('models_3d')
        .update(categoryData)
        .eq('id', model.id);

      if (updateError) {
        console.warn(`⚠️ Erreur pour ${model.name}:`, updateError.message);
      } else {
        console.log(`✅ ${model.name} → ${categoryData.category} (${categoryData.tags.join(', ')})`);
        updated++;
      }
    }

    console.log(`\n🎉 Terminé! ${updated} modèles mis à jour, ${skipped} ignorés`);

    // Afficher les statistiques
    const { data: stats } = await supabase
      .from('models_3d')
      .select('category')
      .not('category', 'is', null);

    if (stats) {
      const categoryCount = stats.reduce((acc, model) => {
        acc[model.category] = (acc[model.category] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Répartition par catégorie:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} modèle(s)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

addSampleData(); 