# 🔧 Résolution de l'erreur d'upload

## Problème
L'erreur "Erreur lors de l'upload" se produit car les colonnes de métadonnées nécessaires n'existent pas dans la base de données.

## Solution étape par étape

### 1. Exécuter le script de migration SQL

1. Allez dans **Supabase Dashboard** > **SQL Editor**
2. Copiez et collez le contenu du fichier `migration-metadata-columns.sql`
3. Cliquez sur **Run** pour exécuter le script
4. Vérifiez que les colonnes ont été ajoutées avec succès

### 2. Vérifier la configuration du bucket

1. Allez dans **Supabase Dashboard** > **Storage**
2. Assurez-vous que le bucket `models-3d` existe
3. Si il n'existe pas, créez-le :
   - Cliquez sur **New bucket**
   - Nom : `models-3d`
   - Cochez **Public bucket**
   - Cliquez sur **Save**

### 3. Tester le système (optionnel)

```bash
# Exécuter le script de test
node scripts/test-upload-system.js
```

Ce script vérifiera :
- ✅ Connexion à la base de données
- ✅ Structure de la table
- ✅ Bucket de stockage
- ✅ Permissions
- ✅ Test d'insertion

### 4. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

## Vérification

Après avoir suivi ces étapes, vous devriez pouvoir :

1. **Sélectionner un fichier GLB/GLTF** dans la première étape
2. **Ajouter les métadonnées** dans la seconde étape :
   - Catégorie
   - Tags
   - Prix
   - Description
   - Allergènes
3. **Uploader avec succès** le modèle

## Colonnes ajoutées

Le script de migration ajoute ces colonnes à la table `models_3d` :

- `thumbnail_url` : URL de l'image de prévisualisation
- `thumbnail_path` : Chemin de l'image de prévisualisation
- `category` : Catégorie du plat
- `tags` : Tags du plat (array)
- `description` : Description complète
- `ingredients` : Ingrédients (array)
- `price` : Prix en euros
- `short_description` : Description courte (150 caractères)
- `allergens` : Allergènes (array)

## Dépannage

### Erreur "bucket not found"
- Vérifiez que le bucket `models-3d` existe dans Storage
- Vérifiez qu'il est configuré en public

### Erreur "column does not exist"
- Exécutez le script `migration-metadata-columns.sql`
- Vérifiez les logs dans Supabase Dashboard

### Erreur de permissions
- Vérifiez les politiques RLS dans Supabase
- Assurez-vous que la clé service role est correcte

### Test rapide
```bash
# Tester rapidement le système
node scripts/test-upload-system.js
```

## Support

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez les logs dans **Supabase Dashboard** > **Logs**
2. Vérifiez les variables d'environnement dans `.env.local`
3. Assurez-vous que toutes les dépendances sont installées

---

**📝 Note** : Cette erreur est normale lors de la première configuration du système. Une fois les colonnes ajoutées, l'upload fonctionnera parfaitement. 