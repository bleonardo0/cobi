// Script de test pour le nouveau système d'analytics simplifié

const testAnalytics = async () => {
  const baseUrl = 'http://localhost:3000/api/analytics';
  
  console.log('🧪 Test du système d\'analytics simplifié\n');
  
  try {
    // 1. Remettre à zéro
    console.log('1. 🧹 Remise à zéro des données...');
    const resetResponse = await fetch(`${baseUrl}/reset`, {
      method: 'POST',
    });
    const resetResult = await resetResponse.json();
    console.log('   Résultat:', resetResult.success ? '✅ OK' : '❌ Erreur');
    
    // 2. Vérifier stats vides
    console.log('\n2. 📊 Vérification stats vides...');
    const statsEmptyResponse = await fetch(`${baseUrl}/stats`);
    const statsEmpty = await statsEmptyResponse.json();
    console.log('   Vues totales:', statsEmpty.data?.general?.totalViews || 0);
    
    // 3. Ajouter quelques vues de test
    console.log('\n3. 📝 Ajout de vues de test...');
    const testViews = [
      { modelId: 'model-0', restaurantId: 'restaurant-bella-vita-1' },
      { modelId: 'model-1', restaurantId: 'restaurant-bella-vita-1' },
      { modelId: 'model-0', restaurantId: 'restaurant-bella-vita-1' }, // Duplicate pour tester
      { modelId: 'model-2', restaurantId: 'restaurant-bella-vita-1' },
    ];
    
    for (const view of testViews) {
      const trackResponse = await fetch(`${baseUrl}/track-model-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(view),
      });
      const trackResult = await trackResponse.json();
      console.log(`   Vue ${view.modelId}:`, trackResult.success ? '✅' : '❌');
    }
    
    // 4. Vérifier les nouvelles stats
    console.log('\n4. 📈 Vérification des nouvelles stats...');
    const statsResponse = await fetch(`${baseUrl}/stats`);
    const stats = await statsResponse.json();
    
    if (stats.success) {
      console.log('   ✅ Stats récupérées avec succès');
      console.log('   🔢 Vues totales:', stats.data.general.totalViews);
      console.log('   📱 Sessions uniques:', stats.data.general.uniqueSessions);
      console.log('   🏆 Modèles populaires:', stats.data.models.length);
      console.log('   📊 Top modèle:', stats.data.topModel?.name || 'Aucun');
      
      if (stats.data.models.length > 0) {
        console.log('\n   📋 Détail des modèles :');
        stats.data.models.forEach((model, index) => {
          console.log(`   ${index + 1}. ${model.name} - ${model.views} vues (${model.popularityScore}%)`);
        });
      }
      
      console.log('\n🎉 Test terminé avec succès !');
      console.log('\n📋 Prochaines étapes :');
      console.log('   1. Exécuter le script SQL dans Supabase');
      console.log('   2. Aller sur /menu/bella-vita et cliquer sur des plats');
      console.log('   3. Vérifier /insights pour voir les stats réelles');
      
    } else {
      console.log('   ❌ Erreur lors de la récupération des stats:', stats.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
    console.log('\n🔧 Vérifications nécessaires :');
    console.log('   1. Le serveur Next.js est-il démarré ?');
    console.log('   2. Supabase est-il configuré ?');
    console.log('   3. La table model_views existe-t-elle ?');
  }
};

testAnalytics(); 