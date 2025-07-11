const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter avec vos vraies variables)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function assignModelsToLeo() {
  console.log('🔄 Recherche des modèles sans restaurant assigné...');
  
  try {
    // 1. Récupérer tous les modèles sans restaurant_id
    const { data: unassignedModels, error: fetchError } = await supabase
      .from('models_3d')
      .select('id, name, created_at')
      .is('restaurant_id', null);

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
    }

    console.log(`🔍 Trouvé ${unassignedModels?.length || 0} modèles sans restaurant`);

    if (!unassignedModels || unassignedModels.length === 0) {
      console.log('✅ Aucun modèle à assigner');
      return;
    }

    // Afficher les modèles trouvés
    unassignedModels.forEach(model => {
      console.log(`  - ${model.name} (créé le ${new Date(model.created_at).toLocaleDateString()})`);
    });

    // 2. Assigner tous ces modèles au restaurant "Leo et les Pieds"
    const leoRestaurantId = 'restaurant-leo-et-les-pieds-1';
    
    console.log(`\n🔄 Attribution des modèles au restaurant "Leo et les Pieds" (${leoRestaurantId})...`);

    const { data: updatedModels, error: updateError } = await supabase
      .from('models_3d')
      .update({ restaurant_id: leoRestaurantId })
      .is('restaurant_id', null)
      .select('id, name');

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    console.log(`✅ ${updatedModels?.length || 0} modèles assignés avec succès !`);
    
    if (updatedModels && updatedModels.length > 0) {
      console.log('\nModèles assignés :');
      updatedModels.forEach(model => {
        console.log(`  ✓ ${model.name}`);
      });
    }

    console.log('\n🎉 Terminé ! Les modèles apparaîtront maintenant dans le menu de "Leo et les Pieds"');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
assignModelsToLeo(); 