# Configuration de l'envoi d'emails avec Resend

## 📧 Système de contact restaurateurs

Le système de feedback permet aux restaurateurs d'envoyer des messages directement à `cobi.need@gmail.com` via la plateforme.

## 🚀 Configuration Resend

### 1. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit (50 emails/jour inclus)
3. Vérifiez votre email

### 2. Obtenir la clé API

1. Connectez-vous à votre dashboard Resend
2. Allez dans **API Keys** dans la sidebar
3. Cliquez sur **Create API Key**
4. Donnez un nom à votre clé (ex: "COBI Platform")
5. Copiez la clé qui commence par `re_`

### 3. Configurer les variables d'environnement

#### Développement local :
```bash
# Copiez le fichier d'exemple
cp env.example .env.local

# Ajoutez votre clé Resend dans .env.local
RESEND_API_KEY=re_votre_cle_api_ici
```

#### Production (Vercel) :
1. Allez dans **Settings > Environment Variables**
2. Ajoutez `RESEND_API_KEY` avec votre clé
3. Redéployez l'application

### 4. Configurer le domaine (optionnel)

Pour un envoi professionnel, configurez votre domaine :

1. Dans Resend, allez dans **Domains**
2. Cliquez **Add Domain**
3. Entrez votre domaine (ex: `cobi-platform.com`)
4. Suivez les instructions DNS
5. Modifiez `EMAIL_CONFIG.from` dans `src/lib/email-service.ts`

## 📝 Fonctionnalités du système

### Formulaire de contact
- **Dropdown** avec types de demandes :
  - Erreur technique
  - Question de fonctionnement
  - Retour sur une fonctionnalité
  - Question de facturation
  - Demande de fonctionnalité
  - Autre

- **Champ message** : 2000 caractères max
- **Case à cocher** : Demande de rappel
- **Infos auto** : Email + nom du restaurant

### Format des emails
- **HTML** : Email formaté avec style professionnel
- **Sujet** : `[COBI Contact] [Type] - [Restaurant]`
- **Reply-to** : Email du restaurateur
- **Destinataire** : `cobi.need@gmail.com`

## 🔧 Fonctionnement technique

### Avec Resend configuré :
- ✅ Envoi d'emails HTML formatés
- ✅ Réponse directe possible (reply-to)
- ✅ Suivi des envois dans le dashboard Resend

### Sans Resend (fallback) :
- ⚠️ Logging détaillé dans la console
- ⚠️ Message "mode développement" à l'utilisateur
- ⚠️ Aucun email réellement envoyé

## 🐛 Dépannage

### Emails non reçus
1. Vérifiez que `RESEND_API_KEY` est bien configurée
2. Consultez les logs de la console
3. Vérifiez le dashboard Resend pour les erreurs
4. Vérifiez vos spams

### Erreurs communes
- `401 Unauthorized` : Clé API invalide
- `403 Forbidden` : Quota dépassé
- `Domain not verified` : Domaine non vérifié

## 📊 Monitoring

### Logs de développement
```bash
# Recherchez ces logs dans la console
✅ Email envoyé avec succès via Resend
❌ Erreur lors de l'envoi avec Resend
⚠️ Resend non configuré, utilisation du fallback
```

### Dashboard Resend
- Emails envoyés
- Taux de délivrabilité
- Erreurs d'envoi
- Statistiques d'ouverture

## 🎯 Test du système

1. Allez sur `/restaurant/feedback`
2. Remplissez le formulaire
3. Envoyez un message test
4. Vérifiez `cobi.need@gmail.com`
5. Consultez les logs/dashboard

## 📋 Checklist de déploiement

- [ ] Compte Resend créé
- [ ] Clé API obtenue
- [ ] `RESEND_API_KEY` configurée en local
- [ ] Test d'envoi réussi en développement
- [ ] `RESEND_API_KEY` configurée sur Vercel
- [ ] Domaine configuré (optionnel)
- [ ] Test d'envoi réussi en production

## 🔒 Sécurité

- La clé API Resend est **secrète** - ne la partagez jamais
- Elle doit être configurée côté serveur uniquement
- Utilisez des variables d'environnement pour la stocker
- Surveillez l'utilisation dans le dashboard Resend

---

💡 **Tip** : Commencez avec le plan gratuit (50 emails/jour) et upgradez si nécessaire. 