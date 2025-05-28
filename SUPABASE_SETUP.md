# Configuration Supabase pour la Galerie 3D

## 1. Création du projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **anon public key**

## 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=models-3d
```

## 3. Configuration de la base de données

### Exécuter le script SQL

1. Allez dans l'onglet **SQL Editor** de votre projet Supabase
2. Copiez et exécutez le contenu du fichier `supabase-setup.sql`

### Ou créez manuellement :

```sql
-- Création de la table models_3d
CREATE TABLE public.models_3d (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Configuration du Storage

### Créer le bucket

1. Allez dans l'onglet **Storage** de votre projet Supabase
2. Cliquez sur **Create bucket**
3. Nom du bucket : `models-3d`
4. Cochez **Public bucket** pour permettre l'accès public aux fichiers

### Configurer les politiques de sécurité

Dans l'onglet **Storage** > **Policies**, créez ces politiques :

#### Politique de lecture publique :
```sql
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'models-3d');
```

#### Politique d'upload public :
```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'models-3d');
```

#### Politique de suppression :
```sql
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'models-3d');
```

## 5. Configuration des politiques de base de données (optionnel)

Si vous voulez activer Row Level Security :

```sql
-- Activer RLS
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique
CREATE POLICY "Allow public read access" ON public.models_3d
FOR SELECT USING (true);

-- Permettre l'insertion publique
CREATE POLICY "Allow public insert" ON public.models_3d
FOR INSERT WITH CHECK (true);

-- Permettre la suppression publique
CREATE POLICY "Allow public delete" ON public.models_3d
FOR DELETE USING (true);
```

## 6. Test de la configuration

1. Démarrez votre application : `npm run dev`
2. Allez sur `/upload`
3. Téléchargez un fichier USDZ, GLB ou GLTF
4. Vérifiez que :
   - Le fichier apparaît dans Supabase Storage
   - Les métadonnées sont enregistrées dans la table `models_3d`
   - Le modèle s'affiche dans la galerie

## 7. Sécurité en production

Pour la production, considérez :

1. **Authentification** : Ajoutez l'authentification Supabase
2. **Validation côté serveur** : Validez les types de fichiers
3. **Limites de taille** : Configurez les limites dans Supabase
4. **Politiques RLS** : Restreignez l'accès selon vos besoins
5. **CORS** : Configurez les domaines autorisés

## 8. Monitoring

- Surveillez l'utilisation du storage dans le dashboard Supabase
- Configurez des alertes pour les quotas
- Surveillez les logs d'erreur dans l'onglet **Logs**

## Dépannage

### Erreur "bucket not found"
- Vérifiez que le bucket `models-3d` existe
- Vérifiez la variable `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

### Erreur de permissions
- Vérifiez les politiques de storage
- Vérifiez que le bucket est public
- Vérifiez les clés API dans `.env.local`

### Erreur de base de données
- Vérifiez que la table `models_3d` existe
- Vérifiez les politiques RLS si activées
- Vérifiez la clé service role 