# Configuration Supabase pour l'application Cobi

## Étapes de configuration

### 1. Créer le fichier .env.local

Copiez le fichier `env.example` vers `.env.local` :

```bash
cp env.example .env.local
```

### 2. Remplir les variables d'environnement

Ouvrez `.env.local` et remplacez les valeurs par celles de votre projet Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=models-3d
```

### 3. Exécuter les scripts SQL

Dans votre dashboard Supabase (SQL Editor), exécutez le script de migration :

**Si vous avez l'erreur "column slug does not exist"** :
```sql
-- Copiez et collez le contenu de migration-add-missing-columns.sql
```

**Sinon, pour une installation complète** :
```sql
-- Copiez et collez le contenu de supabase-complete-setup.sql
```

### 4. Vérifier la configuration

Après avoir configuré Supabase, vous pouvez tester que tout fonctionne :

```bash
npm run dev
```

L'application devrait maintenant :
- ✅ Sauvegarder les modifications des restaurants en base de données
- ✅ Afficher les modifications dans le menu client
- ✅ Persister les données même après redémarrage du serveur

### 5. Fonctionnalités disponibles

Une fois Supabase configuré :

- **Dashboard Admin** : Modifier les informations des restaurants
- **Menu Client** : Afficher les données mises à jour
- **Persistance** : Les modifications sont sauvegardées en base
- **Synchronisation** : Les changements sont visibles partout

### Dépannage

Si vous avez des erreurs :

1. Vérifiez que les clés Supabase sont correctes
2. Vérifiez que les tables sont créées
3. Vérifiez les logs de la console pour les erreurs Supabase 