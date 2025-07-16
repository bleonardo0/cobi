import { NextResponse } from 'next/server';
import { sendContactEmail, validateEmailConfig } from '@/lib/email-service';

export async function GET() {
  // Vérifier la configuration
  const configCheck = validateEmailConfig();
  
  return NextResponse.json({
    message: 'API de test de contact',
    emailConfig: configCheck,
    testEndpoint: 'POST /api/contact/test',
    usage: 'Utilisez POST avec des données de test pour envoyer un email de test'
  });
}

export async function POST() {
  try {
    // Données de test
    const testData = {
      subject: 'technical-error',
      message: 'Ceci est un message de test automatique du système de contact COBI.\n\nSi vous recevez ce message, cela signifie que le système d\'envoi d\'emails fonctionne correctement !',
      needCallback: true,
      userEmail: 'test@restaurant-demo.com',
      restaurantName: 'Restaurant de Test'
    };

    // Envoyer l'email de test
    const result = await sendContactEmail(testData);
    
    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé',
      result: result,
      testData: testData
    });
    
  } catch (error) {
    console.error('Erreur lors du test d\'envoi:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test d\'envoi',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 