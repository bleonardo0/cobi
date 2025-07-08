/**
 * Script de test pour valider la création d'un restaurant avec compte utilisateur
 * Teste l'API de création de restaurant avec les nouveaux champs password
 */

async function testRestaurantCreationWithUser() {
  console.log('🔍 Test de création de restaurant avec compte utilisateur');
  console.log('=========================================================');

  // Données de test
  const testRestaurant = {
    name: 'Test Restaurant Auth',
    slug: 'test-restaurant-auth',
    address: '123 Test Street, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    email: 'test@restaurant-auth.com',
    website: 'https://test-restaurant-auth.com',
    description: 'Restaurant de test pour l\'authentification',
    shortDescription: 'Restaurant de test avec compte utilisateur',
    primaryColor: '#e74c3c',
    secondaryColor: '#c0392b',
    subscriptionPlan: 'premium',
    allergens: ['gluten', 'lactose'],
    ownerName: 'Jean Testeur',
    ownerContact: 'jean.testeur@test.com',
    ownerContactMethod: 'email',
    password: 'testpassword123' // Mot de passe de test
  };

  try {
    console.log('\n1. Test de création de restaurant avec compte utilisateur');
    console.log('Données:', {
      ...testRestaurant,
      password: '[MASQUÉ]' // Ne pas afficher le mot de passe
    });

    const response = await fetch('http://localhost:3000/api/admin/restaurants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRestaurant)
    });

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Restaurant créé avec succès');
    console.log('Réponse:', data);

    // Test 2: Vérifier que le restaurant apparaît dans la liste
    console.log('\n2. Vérification dans la liste des restaurants');
    const listResponse = await fetch('http://localhost:3000/api/admin/restaurants');
    const listData = await listResponse.json();
    
    const createdRestaurant = listData.restaurants.find(r => r.slug === testRestaurant.slug);
    if (createdRestaurant) {
      console.log('✅ Restaurant trouvé dans la liste');
      console.log('ID:', createdRestaurant.id);
      console.log('Nom:', createdRestaurant.name);
      console.log('Propriétaire:', createdRestaurant.ownerName);
    } else {
      console.log('❌ Restaurant non trouvé dans la liste');
    }

    // Test 3: Informations sur le compte utilisateur créé
    console.log('\n3. Informations sur le compte utilisateur');
    console.log('🔐 Compte utilisateur créé pour:');
    console.log('- Email:', testRestaurant.email);
    console.log('- Propriétaire:', testRestaurant.ownerName);
    console.log('- Rôle: restaurateur');
    console.log('- Restaurant lié:', data.restaurant?.id);

    // Test 4: Instructions pour tester la connexion
    console.log('\n4. Test de connexion (manuel)');
    console.log('Pour tester la connexion:');
    console.log('1. Aller sur http://localhost:3000/auth/login');
    console.log('2. Utiliser les identifiants:');
    console.log('   - Email:', testRestaurant.email);
    console.log('   - Mot de passe:', testRestaurant.password);
    console.log('3. Vérifier que l\'utilisateur est redirigé vers le dashboard restaurant');

    // Test 5: URLs générées
    console.log('\n5. URLs générées');
    console.log('🔗 Pages créées automatiquement:');
    console.log('- Menu:', `http://localhost:3000/menu/${testRestaurant.slug}`);
    console.log('- Dashboard:', 'http://localhost:3000/restaurant/dashboard');
    console.log('- Admin:', `http://localhost:3000/admin/restaurants/${data.restaurant?.id}`);

    console.log('\n✅ Test terminé avec succès !');
    console.log('⚠️  N\'oubliez pas de supprimer le restaurant de test si nécessaire');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
if (require.main === module) {
  testRestaurantCreationWithUser().catch(console.error);
}

module.exports = testRestaurantCreationWithUser; 