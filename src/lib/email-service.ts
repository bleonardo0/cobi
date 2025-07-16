import { Resend } from 'resend';

// Configuration des emails
const EMAIL_CONFIG = {
  from: 'COBI Platform <noreply@cobi-platform.com>',
  to: 'cobi.need@gmail.com',
  fallbackFrom: 'noreply@cobi-platform.com',
};

// Initialiser Resend uniquement si la clé API est disponible
let resend: Resend | null = null;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

interface EmailData {
  subject: string;
  message: string;
  needCallback: boolean;
  userEmail: string;
  restaurantName: string;
}

interface EmailServiceResult {
  success: boolean;
  message: string;
  method: 'email' | 'fallback';
  data?: any;
}

export async function sendContactEmail(data: EmailData): Promise<EmailServiceResult> {
  const { subject, message, needCallback, userEmail, restaurantName } = data;
  
  // Mapping des sujets
  const subjectMap: Record<string, string> = {
    'technical-error': 'Erreur technique',
    'functionality-question': 'Question de fonctionnement',
    'feature-feedback': 'Retour sur une fonctionnalité',
    'billing-question': 'Question de facturation',
    'feature-request': 'Demande de fonctionnalité',
    'other': 'Autre'
  };
  
  const subjectLabel = subjectMap[subject] || subject;
  const emailSubject = `[COBI Contact] ${subjectLabel} - ${restaurantName}`;
  
  // Contenu HTML de l'email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🍽️ COBI Platform</h1>
        <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Nouveau message de contact</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 10px;">
            📝 Détails du contact
          </h2>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; margin-bottom: 15px;">
              <strong style="color: #374151; min-width: 140px;">🏪 Restaurant:</strong>
              <span style="color: #6b7280;">${restaurantName}</span>
            </div>
            
            <div style="display: flex; margin-bottom: 15px;">
              <strong style="color: #374151; min-width: 140px;">📧 Email:</strong>
              <span style="color: #6b7280;">${userEmail}</span>
            </div>
            
            <div style="display: flex; margin-bottom: 15px;">
              <strong style="color: #374151; min-width: 140px;">🏷️ Objet:</strong>
              <span style="color: #6b7280;">${subjectLabel}</span>
            </div>
            
            <div style="display: flex; margin-bottom: 15px;">
              <strong style="color: #374151; min-width: 140px;">📞 Rappel souhaité:</strong>
              <span style="color: ${needCallback ? '#059669' : '#6b7280'}; font-weight: ${needCallback ? 'bold' : 'normal'};">
                ${needCallback ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            
            <div style="margin-top: 25px;">
              <strong style="color: #374151; display: block; margin-bottom: 10px;">💬 Message:</strong>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; border-left: 4px solid #14b8a6;">
                <p style="margin: 0; line-height: 1.6; color: #4b5563; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📅 Envoyé le ${new Date().toLocaleString('fr-FR', { 
              timeZone: 'Europe/Paris',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
            Via la plateforme COBI - Système de contact automatisé
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Version texte simple
  const textContent = `
Nouveau message de contact reçu via la plateforme COBI

INFORMATIONS DU CONTACT:
- Restaurant: ${restaurantName}
- Email: ${userEmail}
- Objet: ${subjectLabel}
- Demande de rappel: ${needCallback ? 'Oui' : 'Non'}

MESSAGE:
${message}

---
Envoyé le ${new Date().toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
Via la plateforme COBI
  `.trim();

  // Tentative d'envoi avec Resend
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: EMAIL_CONFIG.to,
        replyTo: userEmail,
        subject: emailSubject,
        html: htmlContent,
        text: textContent,
      });

      console.log('✅ Email envoyé avec succès via Resend:', result);
      
      return {
        success: true,
        message: 'Email envoyé avec succès',
        method: 'email',
        data: result
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi avec Resend:', error);
      
      // Fallback vers logging détaillé
      return await fallbackEmailLogging(data, emailSubject, textContent, htmlContent);
    }
  } else {
    console.warn('⚠️ Resend non configuré, utilisation du fallback');
    
    // Fallback vers logging détaillé
    return await fallbackEmailLogging(data, emailSubject, textContent, htmlContent);
  }
}

async function fallbackEmailLogging(
  data: EmailData, 
  emailSubject: string, 
  textContent: string, 
  htmlContent: string
): Promise<EmailServiceResult> {
  
  console.log('\n' + '='.repeat(80));
  console.log('📧 NOUVEAU MESSAGE DE CONTACT REÇU');
  console.log('='.repeat(80));
  console.log(`To: ${EMAIL_CONFIG.to}`);
  console.log(`From: ${data.userEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Reply-To: ${data.userEmail}`);
  console.log('');
  console.log('CONTENU:');
  console.log(textContent);
  console.log('='.repeat(80));
  console.log('');
  
  // Optionnel: Sauvegarder dans un fichier ou une base de données
  // await saveToDatabase(data);
  
  return {
    success: true,
    message: 'Message reçu et loggé (mode développement)',
    method: 'fallback'
  };
}

// Fonction pour valider la configuration
export function validateEmailConfig(): { isValid: boolean; message: string } {
  if (!RESEND_API_KEY) {
    return {
      isValid: false,
      message: 'RESEND_API_KEY manquante dans les variables d\'environnement'
    };
  }
  
  return {
    isValid: true,
    message: 'Configuration email valide'
  };
} 