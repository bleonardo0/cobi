const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001';

// Données de test
const testRestaurant = {
  name: "Le Bistro Test",
  slug: "le-bistro-test",
  address: "123 Rue de Test, 75001 Paris",
  phone: "+33 1 23 45 67 89",
  email: "contact@bistrotest.fr",
  website: "https://bistrotest.fr",
  description: "Un restaurant de test pour valider le système de création automatique",
  shortDescription: "Restaurant de test avec cuisine française moderne",
  primaryColor: "#dc2626",
  secondaryColor: "#991b1b",
  subscriptionPlan: "premium",
  allergens: ["gluten", "lactose", "arachides"]
};

async function testRestaurantCreation() {
  console.log('🧪 Test de création de restaurant\n');
  
  try {
    // 1. Créer le restaurant
    console.log('1️⃣ Création du restaurant...');
    const createResponse = await fetch(`${API_BASE_URL}/api/admin/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRestaurant)
    });

    if (!createResponse.ok) {
      throw new Error(`Erreur HTTP ${createResponse.status}: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log('✅ Restaurant créé avec succès!');
    console.log(`   ID: ${createData.restaurant.id}`);
    console.log(`   Nom: ${createData.restaurant.name}`);
    console.log(`   Slug: ${createData.restaurant.slug}`);
    console.log(`   URLs générées:`);
    console.log(`   - Menu: ${API_BASE_URL}/menu/${createData.restaurant.slug}`);
    console.log(`   - Dashboard: ${API_BASE_URL}/restaurant/dashboard`);
    console.log(`   - Admin: ${API_BASE_URL}/admin/restaurants/${createData.restaurant.id}`);

    // 2. Vérifier que le restaurant existe dans la liste
    console.log('\n2️⃣ Vérification dans la liste des restaurants...');
    const listResponse = await fetch(`${API_BASE_URL}/api/admin/restaurants`);
    const listData = await listResponse.json();
    
    const foundRestaurant = listData.restaurants.find(r => r.id === createData.restaurant.id);
    if (foundRestaurant) {
      console.log('✅ Restaurant trouvé dans la liste');
      console.log(`   Total restaurants: ${listData.restaurants.length}`);
    } else {
      console.log('❌ Restaurant introuvable dans la liste');
    }

    // 3. Tester l'API restaurant par slug
    console.log('\n3️⃣ Test de l\'API restaurant par slug...');
    const restaurantResponse = await fetch(`${API_BASE_URL}/api/restaurants/${testRestaurant.slug}`);
    
    if (restaurantResponse.ok) {
      const restaurantData = await restaurantResponse.json();
      console.log('✅ API restaurant par slug fonctionne');
      console.log(`   Nom: ${restaurantData.restaurant.name}`);
      console.log(`   Adresse: ${restaurantData.restaurant.address}`);
    } else {
      console.log('❌ API restaurant par slug échoue');
    }

    // 4. Tester l'API des modèles du restaurant
    console.log('\n4️⃣ Test de l\'API des modèles du restaurant...');
    const modelsResponse = await fetch(`${API_BASE_URL}/api/restaurants/${testRestaurant.slug}/models`);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('✅ API des modèles fonctionne');
      console.log(`   Nombre de modèles: ${modelsData.models.length}`);
      console.log(`   Slug du restaurant: ${modelsData.restaurantSlug}`);
    } else {
      console.log('❌ API des modèles échoue');
    }

    // 5. Tester les URLs générées
    console.log('\n5️⃣ Test des URLs générées...');
    
    // Test page menu
    const menuResponse = await fetch(`${API_BASE_URL}/menu/${testRestaurant.slug}`);
    if (menuResponse.ok) {
      console.log('✅ Page menu accessible');
    } else {
      console.log('❌ Page menu inaccessible');
    }

    // Test dashboard
    const dashboardResponse = await fetch(`${API_BASE_URL}/restaurant/dashboard`);
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard accessible');
    } else {
      console.log('❌ Dashboard inaccessible');
    }

    // Test page admin
    const adminResponse = await fetch(`${API_BASE_URL}/admin/restaurants/${createData.restaurant.id}`);
    if (adminResponse.ok) {
      console.log('✅ Page admin accessible');
    } else {
      console.log('❌ Page admin inaccessible');
    }

    console.log('\n🎉 Test terminé avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   Restaurant créé: ${createData.restaurant.name}`);
    console.log(`   ID: ${createData.restaurant.id}`);
    console.log(`   Slug: ${createData.restaurant.slug}`);
    console.log(`   Plan: ${createData.restaurant.subscriptionPlan}`);
    console.log(`   Allergènes: ${createData.restaurant.allergens.join(', ')}`);
    
    return createData.restaurant;

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    throw error;
  }
}

async function cleanupTestRestaurant(restaurantId) {
  console.log('\n🧹 Nettoyage du restaurant de test...');
  
  // Note: Pour le moment, pas d'API de suppression
  // Dans le futur, on pourrait ajouter:
  // await fetch(`${API_BASE_URL}/api/admin/restaurants/${restaurantId}`, { method: 'DELETE' });
  
  console.log('⚠️  Nettoyage manuel requis - pas d\'API de suppression pour le moment');
  console.log(`   Restaurant à supprimer: ${restaurantId}`);
}

// Exécuter le test
if (require.main === module) {
  testRestaurantCreation()
    .then((restaurant) => {
      console.log('\n✅ Test réussi!');
      console.log('\n🔗 URLs à tester manuellement:');
      console.log(`   Menu: ${API_BASE_URL}/menu/${restaurant.slug}`);
      console.log(`   Dashboard: ${API_BASE_URL}/restaurant/dashboard`);
      console.log(`   Admin: ${API_BASE_URL}/admin/restaurants/${restaurant.id}`);
      
      // Proposer le nettoyage (optionnel)
      // cleanupTestRestaurant(restaurant.id);
    })
    .catch((error) => {
      console.error('❌ Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testRestaurantCreation, cleanupTestRestaurant }; 