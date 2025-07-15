const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qwjlhktzlqpbzxxmvofx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3amxoa3R6bHFwYnp4eG12b2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MjY2NTcsImV4cCI6MjA1MDEwMjY1N30.L-FJGxRyBgKZJBJr8BwZJJMgYUkGnVVQIHqTUvOGVqE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRestaurants() {
  try {
    console.log('🔍 Vérification des restaurants dans la base de données...');
    
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des restaurants:', error);
      return;
    }
    
    console.log(`📊 ${restaurants.length} restaurant(s) trouvé(s):`);
    restaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. ${restaurant.name}`);
      console.log(`   ID: ${restaurant.id}`);
      console.log(`   Slug: ${restaurant.slug}`);
      console.log(`   Actif: ${restaurant.is_active}`);
      console.log(`   Créé: ${restaurant.created_at}`);
    });
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

checkRestaurants(); 