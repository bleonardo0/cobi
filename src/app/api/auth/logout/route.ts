import { NextResponse } from 'next/server';

// Forcer l'utilisation du runtime Node.js
export const runtime = 'nodejs';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Déconnexion réussie' });

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
} 