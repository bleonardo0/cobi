import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validation des données
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Rechercher le token dans la table reset_tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('reset_tokens')
      .select('user_id, email, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token non trouvé ou invalide:', tokenError);
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier si le token n'a pas expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      // Supprimer le token expiré
      await supabaseAdmin
        .from('reset_tokens')
        .delete()
        .eq('token', token);
      
      return NextResponse.json(
        { error: 'Token expiré. Veuillez demander un nouveau lien de réinitialisation.' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe via Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password: password }
    );

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la réinitialisation du mot de passe' },
        { status: 500 }
      );
    }

    // Mettre à jour la dernière connexion dans la table users
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', tokenData.user_id);

    // Supprimer le token utilisé
    await supabaseAdmin
      .from('reset_tokens')
      .delete()
      .eq('token', token);

    console.log('✅ Mot de passe réinitialisé avec succès pour:', tokenData.email);

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la confirmation de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json({
    message: 'API de confirmation de réinitialisation de mot de passe',
    endpoints: {
      POST: 'Confirmer la réinitialisation avec token',
      required: ['token', 'password']
    }
  });
} 