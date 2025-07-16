// Test du système de réinitialisation de mot de passe
// Exécuter avec: node scripts/test-password-reset.js

async function testPasswordReset() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Test du système de réinitialisation de mot de passe');
  console.log('='.repeat(60));
  
  try {
    // 1. Tester la demande de réinitialisation
    console.log('1. Test de la demande de réinitialisation...');
    
    const resetResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cobi.com'
      })
    });
    
    const resetData = await resetResponse.json();
    console.log('   Réponse:', resetData);
    
    if (resetResponse.ok) {
      console.log('   ✅ Demande de réinitialisation réussie');
    } else {
      console.log('   ❌ Erreur lors de la demande:', resetData.error);
    }
    
    // 2. Vérifier les APIs GET
    console.log('\n2. Vérification des APIs GET...');
    
    const getResetResponse = await fetch(`${baseUrl}/api/auth/reset-password`);
    const getResetData = await getResetResponse.json();
    console.log('   API reset-password:', getResetData);
    
    const getConfirmResponse = await fetch(`${baseUrl}/api/auth/reset-password/confirm`);
    const getConfirmData = await getConfirmResponse.json();
    console.log('   API reset-password/confirm:', getConfirmData);
    
    // 3. Test avec email invalide
    console.log('\n3. Test avec email invalide...');
    
    const invalidResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email'
      })
    });
    
    const invalidData = await invalidResponse.json();
    console.log('   Réponse:', invalidData);
    
    if (!invalidResponse.ok) {
      console.log('   ✅ Validation email fonctionne');
    } else {
      console.log('   ❌ Validation email défaillante');
    }
    
    // 4. Test avec token invalide
    console.log('\n4. Test avec token invalide...');
    
    const invalidTokenResponse = await fetch(`${baseUrl}/api/auth/reset-password/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid-token-123',
        password: 'newpassword123'
      })
    });
    
    const invalidTokenData = await invalidTokenResponse.json();
    console.log('   Réponse:', invalidTokenData);
    
    if (!invalidTokenResponse.ok) {
      console.log('   ✅ Validation token fonctionne');
    } else {
      console.log('   ❌ Validation token défaillante');
    }
    
    console.log('\n🎉 Tests terminés !');
    console.log('\nPour tester complètement :');
    console.log('1. Allez sur http://localhost:3000/auth/login');
    console.log('2. Cliquez sur "Mot de passe oublié ?"');
    console.log('3. Entrez votre email');
    console.log('4. Consultez les logs pour le lien de réinitialisation');
    console.log('5. Suivez le lien et définissez un nouveau mot de passe');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testPasswordReset(); 