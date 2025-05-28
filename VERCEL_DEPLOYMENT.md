# 🚀 Guide de déploiement Vercel - Galerie 3D

## Problème identifié
Votre application fonctionne parfaitement en local mais échoue sur Vercel car les variables d'environnement Supabase ne sont pas configurées.

## 📋 Étapes de déploiement

### 1. Configuration des variables d'environnement sur Vercel

Allez dans votre dashboard Vercel :
1. Sélectionnez votre projet
2. Allez dans **Settings** > **Environment Variables**
3. Ajoutez ces variables :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=models-3d
```

⚠️ **Important** : Remplacez les valeurs par celles de votre projet Supabase

### 2. Où trouver vos clés Supabase

Dans votre dashboard Supabase :
- **Project URL** : Settings > API > Project URL
- **Anon key** : Settings > API > Project API keys > anon public
- **Service role key** : Settings > API > Project API keys > service_role

### 3. Redéploiement

Après avoir ajouté les variables :
1. Allez dans l'onglet **Deployments**
2. Cliquez sur **Redeploy** sur le dernier déploiement
3. Ou poussez un nouveau commit pour déclencher un redéploiement

### 4. Vérification du déploiement

Une fois redéployé, testez :
- ✅ Page d'accueil charge sans erreur
- ✅ Pas de message "Configuration Supabase requise"
- ✅ Upload de fichiers fonctionne
- ✅ Galerie affiche les modèles

## 🔧 Configuration Supabase (si pas encore fait)

### Créer le bucket de stockage
1. Dans Supabase : **Storage** > **Create bucket**
2. Nom : `models-3d`
3. ✅ Cocher **Public bucket**

### Politiques de sécurité
Exécutez dans **SQL Editor** :

```sql
-- Politique de lecture publique
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'models-3d');

-- Politique d'upload public
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'models-3d');
```

### Base de données
Exécutez le script `supabase-setup.sql` dans **SQL Editor**

## 🚨 Dépannage

### Si l'erreur persiste après redéploiement :

1. **Vérifiez les variables** dans Vercel Settings
2. **Testez les clés** dans votre projet Supabase local
3. **Vérifiez les logs** Vercel : Functions > View Function Logs
4. **Vérifiez le bucket** existe dans Supabase Storage

### Commandes de vérification locale :

```bash
# Vérifier que les variables sont bien définies
npm run build

# Tester l'API upload en local
curl -X POST http://localhost:3002/api/upload \
  -F "file=@path/to/your/model.usdz"
```

## 📱 Test final

Une fois déployé, testez sur votre URL Vercel :
1. Accédez à votre-app.vercel.app
2. Cliquez sur "Ajouter un modèle"
3. Uploadez un fichier USDZ/GLB
4. Vérifiez qu'il apparaît dans la galerie

## 🔗 Liens utiles

- [Dashboard Vercel](https://vercel.com/dashboard)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Documentation Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) 