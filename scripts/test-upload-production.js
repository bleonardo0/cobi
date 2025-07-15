#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/upload`
  : 'http://localhost:3000/api/upload';

console.log('🔍 Test de l\'API Upload en production');
console.log(`🌐 URL: ${API_URL}`);

async function testUpload() {
  try {
    // Vérifier les variables d'environnement
    console.log('\n📋 Vérification des variables d\'environnement...');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: Non définie`);
      }
    }

    // Créer un fichier de test simple
    console.log('\n📁 Création d\'un fichier de test...');
    const testContent = JSON.stringify({
      asset: {
        version: "2.0",
        generator: "Test Upload"
      },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: "VEC3" }],
      bufferViews: [{ buffer: 0, byteLength: 36 }],
      buffers: [{ byteLength: 36 }]
    });
    
    const testFileName = 'test-upload.gltf';
    const testFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(testFilePath, testContent);
    
    console.log(`✅ Fichier de test créé: ${testFilePath} (${fs.statSync(testFilePath).size} bytes)`);

    // Préparer les données du formulaire
    console.log('\n📤 Préparation de l\'upload...');
    const formData = new FormData();
    formData.append('model', fs.createReadStream(testFilePath));
    formData.append('category', 'test');
    formData.append('tags', JSON.stringify(['test']));
    formData.append('modelName', 'Test Upload Production');
    formData.append('price', '10.99');
    formData.append('shortDescription', 'Test d\'upload en production');
    formData.append('allergens', JSON.stringify([]));
    formData.append('restaurantId', '123e4567-e89b-12d3-a456-426614174000');
    formData.append('hotspotsEnabled', 'false');
    formData.append('securityRisk', 'false');
    formData.append('hotspotsConfig', JSON.stringify([]));

    // Effectuer l'upload
    console.log('\n🚀 Envoi de la requête...');
    const startTime = Date.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Temps de réponse: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    // Analyser la réponse
    const responseText = await response.text();
    console.log('\n📋 Réponse brute:', responseText.substring(0, 200) + '...');
    
    try {
      const responseData = JSON.parse(responseText);
      
      if (response.ok) {
        console.log('✅ Upload réussi!');
        console.log(`📝 Modèle: ${responseData.model?.name}`);
        console.log(`🔗 URL: ${responseData.model?.url}`);
      } else {
        console.log('❌ Upload échoué!');
        console.log(`📝 Erreur: ${responseData.error}`);
        if (responseData.details) {
          console.log(`📋 Détails: ${responseData.details}`);
        }
      }
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
      console.log('📋 Réponse complète:', responseText);
    }

    // Nettoyer le fichier de test
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Fichier de test supprimé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('📋 Stack trace:', error.stack);
  }
}

// Exécuter le test
testUpload().then(() => {
  console.log('\n🏁 Test terminé');
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 