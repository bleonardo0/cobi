import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email-service';

interface ContactData {
  subject: string;
  message: string;
  needCallback: boolean;
  userEmail: string;
  restaurantName: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactData = await request.json();
    
    // Validation des données
    if (!data.subject || !data.message || !data.userEmail || !data.restaurantName) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation de la longueur du message
    if (data.message.length > 2000) {
      return NextResponse.json(
        { error: 'Le message ne peut pas dépasser 2000 caractères' },
        { status: 400 }
      );
    }

    // Envoyer l'email via le service d'email
    const result = await sendContactEmail(data);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        method: result.method
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de contact:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json({ 
    message: 'API de contact fonctionnelle',
    endpoints: ['POST /api/contact'],
    version: '1.0.0'
  });
} 