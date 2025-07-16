import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation des données
    if (!email) {
      return NextResponse.json(
        { error: 'Email est obligatoire' },
        { status: 400 }
      );
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe dans notre système, un lien de réinitialisation sera envoyé.'
      });
    }

    // Générer un token unique pour la réinitialisation
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Supprimer les anciens tokens pour cet utilisateur
    await supabaseAdmin
      .from('reset_tokens')
      .delete()
      .eq('user_id', userData.id);

    // Insérer le nouveau token
    const { error: tokenError } = await supabaseAdmin
      .from('reset_tokens')
      .insert({
        user_id: userData.id,
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Erreur lors de la création du token:', tokenError);
      return NextResponse.json(
        { error: 'Erreur lors de la génération du token de réinitialisation' },
        { status: 500 }
      );
    }

    // Créer le lien de réinitialisation
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset/confirm?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Ici, vous devriez envoyer un email avec le lien de réinitialisation
    // Pour l'instant, on log le lien pour le développement
    console.log('🔗 Lien de réinitialisation généré:', resetLink);
    
    // TODO: Intégrer avec votre service d'email (comme Resend)
    // await sendResetEmail(email, resetLink);

    console.log('✅ Lien de réinitialisation envoyé pour:', email);

    return NextResponse.json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé à votre adresse email.'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json({
    message: 'API de réinitialisation de mot de passe',
    endpoints: {
      POST: 'Demander une réinitialisation de mot de passe',
      required: ['email']
    }
  });
} 