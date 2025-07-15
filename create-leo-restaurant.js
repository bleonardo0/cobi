const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qwjlhktzlqpbzxxmvofx.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3amxoa3R6bHFwYnp4eG12b2Z4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUyNjY1NywiZXhwIjoyMDUwMTAyNjU3fQ.qVfRWLGMGpKTgMjW2BN2FWZgd8LJ5xfYKdqRNfgGZMY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createLeoRestaurant() {
  try {
    console.log('🏪 Création du restaurant "Leo et les pieds"...');
    
    const restaurantData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Leo et les pieds',
      slug: 'leo-et-les-pieds',
      description: 'Restaurant spécialisé dans les plats créatifs',
      address: '123 Rue Example, Paris, France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@leoetlespieds.fr',
      website: 'https://leoetlespieds.fr',
      is_active: true,
      primary_color: '#6366f1',
      secondary_color: '#8b5cf6',
      logo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Vérifier si le restaurant existe déjà
    const { data: existingRestaurant, error: checkError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('slug', 'leo-et-les-pieds')
      .single();
    
    if (existingRestaurant) {
      console.log('✅ Le restaurant "Leo et les pieds" existe déjà');
      return;
    }
    
    // Créer le restaurant
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de la création du restaurant:', error);
      return;
    }
    
    console.log('✅ Restaurant "Leo et les pieds" créé avec succès:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Nom: ${data.name}`);
    console.log(`   Slug: ${data.slug}`);
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

createLeoRestaurant(); 