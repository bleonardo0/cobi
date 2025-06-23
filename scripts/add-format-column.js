const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addFormatColumn() {
  console.log('🔧 Ajout de la colonne format à la table models_3d...');
  
  try {
    // Ajouter la colonne format si elle n'existe pas
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            -- Vérifier et ajouter format
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'models_3d' AND column_name = 'format') THEN
                ALTER TABLE models_3d ADD COLUMN format VARCHAR(50);
                RAISE NOTICE 'Colonne format ajoutée';
            ELSE
                RAISE NOTICE 'Colonne format existe déjà';
            END IF;
        END $$;
      `
    });

    if (alterError) {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', alterError);
      return;
    }

    console.log('✅ Colonne format ajoutée avec succès');

    // Mettre à jour les enregistrements existants pour définir le format
    console.log('🔄 Mise à jour des formats existants...');
    
    const { data: models, error: fetchError } = await supabase
      .from('models_3d')
      .select('id, filename, original_name, glb_url, usdz_url')
      .is('format', null);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modèles:', fetchError);
      return;
    }

    console.log(`📊 ${models.length} modèles à mettre à jour`);

    for (const model of models) {
      let format = '';
      
      // Déterminer le format basé sur les URLs existantes
      const hasGlb = !!model.glb_url;
      const hasUsdz = !!model.usdz_url;
      
      if (hasGlb && hasUsdz) {
        format = 'GLB + USDZ';
      } else if (hasGlb) {
        format = 'GLB';
      } else if (hasUsdz) {
        format = 'USDZ';
      } else {
        // Détecter basé sur le nom de fichier
        const filename = model.filename || model.original_name || '';
        if (filename.toLowerCase().endsWith('.usdz')) {
          format = 'USDZ';
        } else if (filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')) {
          format = 'GLB';
        }
      }

      if (format) {
        const { error: updateError } = await supabase
          .from('models_3d')
          .update({ format })
          .eq('id', model.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour modèle ${model.id}:`, updateError);
        } else {
          console.log(`✅ Modèle ${model.id} mis à jour avec format: ${format}`);
        }
      }
    }

    console.log('🎉 Migration terminée avec succès!');
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
addFormatColumn(); 