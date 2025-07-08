/**
 * Script de test et debug pour le système de restaurants
 * Permet de vérifier l'API, la base de données et l'affichage des restaurants
 */

async function testRestaurantAPI() {
  console.log('🔍 Test du système de restaurants');
  console.log('=====================================');

  try {
    // Test 1: Vérifier l'API GET /api/admin/restaurants
    console.log('\n1. Test de l\'API GET /api/admin/restaurants');
    const response = await fetch('http://localhost:3000/api/admin/restaurants');
    
    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API répond correctement');
    console.log('📊 Nombre de restaurants:', data.total);
    console.log('📋 Restaurants trouvés:');
    
    if (data.restaurants && data.restaurants.length > 0) {
      data.restaurants.forEach((restaurant, index) => {
        console.log(`\n   Restaurant ${index + 1}:`);
        console.log(`   - ID: ${restaurant.id}`);
        console.log(`   - Nom: ${restaurant.name}`);
        console.log(`   - Slug: ${restaurant.slug}`);
        console.log(`   - Adresse: ${restaurant.address}`);
        console.log(`   - Status: ${restaurant.subscriptionStatus}`);
        console.log(`   - Plan: ${restaurant.subscriptionPlan}`);
        console.log(`   - Créé: ${restaurant.createdAt}`);
        
        // Vérifier les nouveaux champs propriétaire
        if (restaurant.ownerName) {
          console.log(`   - Propriétaire: ${restaurant.ownerName}`);
          console.log(`   - Contact: ${restaurant.ownerContact} (${restaurant.ownerContactMethod})`);
        }
      });
    } else {
      console.log('⚠️ Aucun restaurant trouvé dans la base de données');
    }

    // Test 2: Vérifier si les restaurants apparaissent dans l'interface
    console.log('\n2. Test de l\'interface frontend');
    console.log('Pour vérifier l\'interface:');
    console.log('- Ouvrir http://localhost:3000/admin/restaurants');
    console.log('- Regarder les logs de la console du navigateur');
    console.log('- Cliquer sur "Actualiser" pour forcer le reload');

    // Test 3: Suggestions de debug
    console.log('\n3. Suggestions de debug');
    console.log('- Vérifier les logs dans la console du navigateur');
    console.log('- Vérifier si les variables d\'environnement Supabase sont configurées');
    console.log('- Vérifier si la migration SQL des colonnes owner a été exécutée');
    console.log('- Tester avec un hard refresh (Ctrl+F5)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testRestaurantAPI(); 