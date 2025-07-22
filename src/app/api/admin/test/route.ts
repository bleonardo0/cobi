import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Test de base
    const { userId } = await auth();
    
    console.log('🧪 Test admin - userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non authentifié',
        tests: {
          auth: false,
          supabase: false,
          userRole: false
        }
      });
    }

    // Test Supabase
    let supabaseTest = false;
    let userRoleTest = false;
    let userData = null;

    try {
      // Test de connexion Supabase simple
      const { data: testData, error: testError } = await supabaseAdmin
        .from('restaurants')
        .select('count(*)')
        .limit(1);
      
      supabaseTest = !testError;
      console.log('🔗 Test Supabase:', supabaseTest, testError?.message);
    } catch (error) {
      console.error('❌ Erreur test Supabase:', error);
    }

    try {
      // Test récupération utilisateur
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('role, email')
        .eq('clerk_id', userId)
        .single();
      
      userData = user;
      userRoleTest = !userError && user?.role === 'admin';
      console.log('👤 Test utilisateur:', { user, userError: userError?.message });
    } catch (error) {
      console.error('❌ Erreur test utilisateur:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Tests admin terminés',
      userId,
      userData,
      tests: {
        auth: true,
        supabase: supabaseTest,
        userRole: userRoleTest
      },
      recommendations: [
        !supabaseTest ? 'Vérifier la configuration Supabase' : null,
        !userRoleTest ? 'Créer un utilisateur admin dans la table users' : null
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('❌ Erreur test admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors des tests: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
} 