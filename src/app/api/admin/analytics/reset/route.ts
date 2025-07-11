import { NextRequest, NextResponse } from 'next/server';
import { analyticsStorage } from '../../../../../lib/analytics-storage';
import { supabaseAdmin } from '../../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, resetToZero = true } = await request.json();
    
    console.log('🗑️ Début du reset analytics:', { restaurantId, resetToZero });
    
    // Vérifications de sécurité
    if (!restaurantId || typeof restaurantId !== 'string') {
      console.log('❌ Restaurant ID manquant ou invalide:', restaurantId);
      return NextResponse.json(
        { success: false, error: 'Restaurant ID requis' },
        { status: 400 }
      );
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on fait confiance au frontend
    // Plus tard, on ajoutera une vérification JWT/session
    
    console.log('🔄 Appel de resetAnalytics avec:', { restaurantId });
    
    // Debug: Vérifier les données AVANT le reset
    const beforeReset = analyticsStorage.getStorageDebug(restaurantId);
    console.log('📊 AVANT reset - Données pour', restaurantId, ':', beforeReset);
    
    // Debug: Vérifier TOUTES les données
    const allData = analyticsStorage.getStorageDebug();
    console.log('📊 TOUTES les données analytics:', {
      totalModelViews: allData.totalModelViews,
      totalSessions: allData.totalSessions,
      totalMenuViews: allData.totalMenuViews
    });
    
    // Afficher les restaurant IDs trouvés dans les données
    if (allData.modelViews && allData.modelViews.length > 0) {
      const restaurantIds = [...new Set(allData.modelViews.map((v: any) => v.restaurantId))];
      console.log('🔍 Restaurant IDs trouvés dans les analytics:', restaurantIds);
    }
    
    // Vérifier s'il y a des données dans le système de fichiers
    const hasFileData = beforeReset.totalModelViews > 0 || beforeReset.totalSessions > 0 || beforeReset.totalMenuViews > 0;
    
    // Vérifier s'il y a des données dans Supabase
    console.log('🔍 Vérification des données Supabase pour', restaurantId);
    const { data: supabaseViews, error: supabaseError } = await supabaseAdmin
      .from('model_views')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    const hasSupabaseData = supabaseViews && supabaseViews.length > 0;
    const supabaseCount = supabaseViews?.length || 0;
    
    console.log(`📊 Données trouvées - Fichier: ${hasFileData ? 'Oui' : 'Non'}, Supabase: ${hasSupabaseData ? `Oui (${supabaseCount})` : 'Non'}`);
    
    if (!hasFileData && !hasSupabaseData) {
      console.log('ℹ️ Aucune donnée analytics trouvée pour', restaurantId);
      return NextResponse.json({
        success: true,
        message: `Aucune donnée analytics trouvée pour le restaurant ${restaurantId}`,
        data: {
          restaurantId,
          action: 'no_data',
          viewsRemoved: 0,
          sessionsRemoved: 0,
          menuViewsRemoved: 0,
          supabaseViewsRemoved: 0,
          beforeReset: beforeReset,
          note: 'Ce restaurant n\'a pas encore de données analytics à supprimer'
        }
      });
    }
    
    let supabaseViewsRemoved = 0;
    
    // Supprimer les données Supabase si elles existent
    if (hasSupabaseData) {
      console.log(`🗑️ Suppression de ${supabaseCount} vues dans Supabase pour`, restaurantId);
      const { error: deleteError } = await supabaseAdmin
        .from('model_views')
        .delete()
        .eq('restaurant_id', restaurantId);
      
      if (deleteError) {
        console.error('❌ Erreur lors de la suppression Supabase:', deleteError);
      } else {
        supabaseViewsRemoved = supabaseCount;
        console.log(`✅ ${supabaseCount} vues supprimées de Supabase`);
      }
    }
    
    // Remettre à zéro les analytics du système de fichiers
    if (hasFileData) {
      console.log('🗑️ Suppression des données du système de fichiers');
      analyticsStorage.resetAnalytics(restaurantId);
    }
    
    // Debug: Vérifier les données APRÈS le reset
    const afterReset = analyticsStorage.getStorageDebug(restaurantId);
    console.log('📊 APRÈS reset - Données pour', restaurantId, ':', afterReset);
    
    const result = {
      restaurantId,
      action: 'reset',
      timestamp: new Date().toISOString(),
      viewsRemoved: beforeReset.totalModelViews,
      sessionsRemoved: beforeReset.totalSessions,
      menuViewsRemoved: beforeReset.totalMenuViews,
      supabaseViewsRemoved: supabaseViewsRemoved,
      totalRemoved: beforeReset.totalModelViews + beforeReset.totalSessions + beforeReset.totalMenuViews + supabaseViewsRemoved,
      beforeReset: beforeReset,
      afterReset: afterReset
    };
    
    const action = resetToZero ? 'remis à zéro' : 'réinitialisé avec données de base';
    
    console.log('✅ Reset terminé avec succès:', result);
    
    return NextResponse.json({
      success: true,
      message: `Analytics ${action} pour le restaurant ${restaurantId}`,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du reset des analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
} 