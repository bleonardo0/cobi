import { NextResponse } from 'next/server';
import { sendContactEmail, validateEmailConfig } from '@/lib/email-service';

export async function GET() {
  // Diagnostic détaillé de la configuration
  const resendKey = process.env.RESEND_API_KEY;
  const configCheck = validateEmailConfig();
  
  // Diagnostic détaillé
  const diagnostic = {
    resendApiKey: {
      exists: !!resendKey,
      length: resendKey ? resendKey.length : 0,
      startsWithRe: resendKey ? resendKey.startsWith('re_') : false,
      preview: resendKey ? `${resendKey.substring(0, 10)}...` : 'undefined',
      type: typeof resendKey
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
    },
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('RESEND') || key.includes('EMAIL') || key.includes('API')
    )
  };
  
  return NextResponse.json({
    message: 'Diagnostic complet de la configuration email',
    emailConfig: configCheck,
    diagnostic,
    instructions: {
      setup: 'Ajoutez RESEND_API_KEY=re_your-api-key-here dans votre fichier .env.local',
      location: 'Le fichier .env.local doit être à la racine du projet (même niveau que package.json)',
      restart: 'Redémarrez le serveur après avoir ajouté la clé : npm run dev',
      test: 'Utilisez POST /api/contact/test pour envoyer un email de test'
    }
  });
}

export async function POST() {
  try {
    // Vérifier la clé API
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Clé API Resend non trouvée',
        details: {
          environment: process.env.NODE_ENV,
          totalEnvVars: Object.keys(process.env).length
        }
      }, { status: 500 });
    }

    // Test avec des données réelles
    const testData = {
      subject: 'technical-error',
      message: 'Test automatique du système de contact - ' + new Date().toISOString(),
      needCallback: false,
      userEmail: 'fvallmajo2000@gmail.com',
      restaurantName: 'Restaurant Test'
    };

    console.log('Test contact - Envoi avec clé API:', apiKey.substring(0, 10) + '...');
    
    const result = await sendContactEmail(testData);
    
    console.log('Test contact - Résultat:', result);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      method: result.method,
      details: {
        apiKey: apiKey.substring(0, 10) + '...',
        timestamp: new Date().toISOString(),
        data: result.data
      }
    });

  } catch (error) {
    console.error('Erreur test contact:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test de contact',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 