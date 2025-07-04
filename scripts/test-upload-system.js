const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUploadSystem() {
  console.log('🔍 Test du système d\'upload...\n');
  
  try {
    // Test 1: Vérifier la connexion à la base de données
    console.log('1. Test de connexion à la base de données...');
    const { data, error } = await supabase.from('models_3d').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return;
    }
    console.log('✅ Connexion à la base de données réussie');
    
    // Test 2: Vérifier la structure de la table
    console.log('\n2. Vérification de la structure de la table...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'models_3d' 
        AND column_name IN ('thumbnail_url', 'category', 'tags', 'price', 'short_description', 'allergens')
        ORDER BY column_name
      `
    });
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
      return;
    }
    
    const expectedColumns = ['thumbnail_url', 'category', 'tags', 'price', 'short_description', 'allergens'];
    const existingColumns = columns?.map(col => col.column_name) || [];
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Colonnes manquantes:', missingColumns.join(', '));
      console.log('💡 Exécutez le script migration-metadata-columns.sql dans Supabase Dashboard');
      return;
    }
    console.log('✅ Structure de la table complète');
    
    // Test 3: Vérifier le bucket de stockage
    console.log('\n3. Vérification du bucket de stockage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Erreur lors de la vérification des buckets:', bucketsError.message);
      return;
    }
    
    const modelsBucket = buckets.find(bucket => bucket.name === 'models-3d');
    if (!modelsBucket) {
      console.error('❌ Bucket "models-3d" introuvable');
      console.log('💡 Créez le bucket "models-3d" dans Supabase Dashboard > Storage');
      return;
    }
    console.log('✅ Bucket "models-3d" trouvé');
    
    // Test 4: Vérifier les permissions du bucket
    console.log('\n4. Vérification des permissions du bucket...');
    const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('models-3d');
    if (bucketError) {
      console.error('❌ Erreur lors de la vérification du bucket:', bucketError.message);
      return;
    }
    
    if (!bucketInfo.public) {
      console.warn('⚠️  Le bucket n\'est pas public - les URLs publiques pourraient ne pas fonctionner');
    } else {
      console.log('✅ Bucket configuré en public');
    }
    
    // Test 5: Vérifier les index
    console.log('\n5. Vérification des index de performance...');
    const { data: indexes, error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'models_3d' 
        AND indexname LIKE 'idx_models_3d_%'
      `
    });
    
    if (indexError) {
      console.warn('⚠️  Impossible de vérifier les index:', indexError.message);
    } else {
      const expectedIndexes = ['idx_models_3d_category', 'idx_models_3d_tags', 'idx_models_3d_allergens'];
      const existingIndexes = indexes?.map(idx => idx.indexname) || [];
      const missingIndexes = expectedIndexes.filter(idx => !existingIndexes.includes(idx));
      
      if (missingIndexes.length > 0) {
        console.warn('⚠️  Index manquants:', missingIndexes.join(', '));
      } else {
        console.log('✅ Index de performance présents');
      }
    }
    
    // Test 6: Tester une insertion simple
    console.log('\n6. Test d\'insertion dans la base de données...');
    const testModel = {
      name: 'Test Model',
      filename: 'test-model.glb',
      original_name: 'test-model.glb',
      file_size: 1024,
      mime_type: 'model/gltf-binary',
      storage_path: 'test/test-model.glb',
      public_url: 'https://example.com/test-model.glb',
      slug: 'test-model-' + Date.now(),
      category: 'autres',
      tags: ['test'],
      price: 12.50,
      short_description: 'Modèle de test',
      allergens: ['test']
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('models_3d')
      .insert([testModel])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion test:', insertError.message);
      return;
    }
    
    console.log('✅ Insertion test réussie');
    
    // Nettoyer le test
    await supabase.from('models_3d').delete().eq('id', insertData.id);
    console.log('✅ Données de test nettoyées');
    
    console.log('\n🎉 Système d\'upload prêt à fonctionner !');
    console.log('\n📋 Résumé:');
    console.log('  - Base de données: OK');
    console.log('  - Colonnes de métadonnées: OK');
    console.log('  - Bucket de stockage: OK');
    console.log('  - Test d\'insertion: OK');
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Exécuter le test
testUploadSystem(); 