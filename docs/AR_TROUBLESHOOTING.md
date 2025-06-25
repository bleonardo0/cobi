# Guide de Dépannage AR - Android

## Problème : L'application crash quand je clique sur le bouton AR

### ✅ Solutions testées et validées :

#### 1. **Vérifications de base**
- Assurez-vous d'être sur **HTTPS** (obligatoire pour WebXR)
- Utilisez **Chrome** ou **Chrome Beta** (navigateur recommandé)
- Vérifiez que **Google Play Services pour AR** est installé et à jour

#### 2. **Redémarrage rapide**
```bash
# Étapes à suivre :
1. Fermez complètement Chrome
2. Redémarrez Chrome
3. Videz le cache (Paramètres > Confidentialité > Effacer les données)
4. Retestez l'AR
```

#### 3. **Vérification des permissions**
- Allez dans **Paramètres Android > Applications > Chrome**
- Vérifiez que la permission **Caméra** est activée
- Vérifiez que la permission **Stockage** est activée

#### 4. **Test en mode navigation privée**
- Ouvrez un onglet de navigation privée
- Testez l'AR dans cet onglet
- Si ça marche, le problème vient du cache/cookies

### 🔧 Solutions techniques avancées :

#### 1. **Forcer Scene Viewer au lieu de WebXR**
```javascript
// Dans l'URL, ajoutez le paramètre :
?ar_mode=scene-viewer
```

#### 2. **Vérifier la compatibilité de l'appareil**
Appareils testés et compatibles :
- ✅ Samsung Galaxy S8+ et plus récent
- ✅ Google Pixel (tous modèles)
- ✅ OnePlus 6 et plus récent
- ✅ Xiaomi Mi 8 et plus récent
- ❌ Appareils avec Android < 7.0

#### 3. **Diagnostic automatique**
Utilisez notre page de test : `/test-ar-android`
- Détection automatique de la compatibilité
- Logs en temps réel
- Tests avec différents modèles

### 🚨 Problèmes connus et workarounds :

#### **Crash immédiat au lancement AR**
**Cause :** Éléments CSS avec `display: none`
**Solution :** Utiliser `visibility: hidden` ou `opacity: 0`

#### **AR ne se lance pas du tout**
**Cause :** WebXR non supporté
**Solution :** Fallback automatique vers Scene Viewer

#### **Modèle n'apparaît pas en AR**
**Cause :** Modèle 3D trop volumineux ou mal formaté
**Solutions :**
- Utilisez des modèles < 10MB
- Préférez GLB à GLTF
- Vérifiez que le modèle est optimisé pour mobile

### 📱 Par type d'appareil :

#### **Samsung Galaxy**
- Désactivez temporairement Samsung Internet
- Utilisez Chrome comme navigateur par défaut
- Vérifiez les mises à jour One UI

#### **Xiaomi/MIUI**
- Désactivez les optimisations MIUI pour Chrome
- Autorisez Chrome à s'exécuter en arrière-plan
- Désactivez le mode économie d'énergie

#### **Huawei (sans Google Services)**
- AR non disponible sans Google Play Services
- Utilisez le mode 3D uniquement

### 🔍 Diagnostic étape par étape :

1. **Test de base :** Ouvrez `/test-ar-android`
2. **Vérifiez les logs :** Regardez les messages d'erreur
3. **Testez différents modèles :** Commencez par l'Astronaute Google
4. **Changez de navigateur :** Testez avec Chrome Beta
5. **Redémarrez l'appareil :** Solution de dernier recours

### 📞 Support technique :

Si le problème persiste après avoir suivi ce guide :
1. Notez le modèle exact de votre appareil
2. Notez la version d'Android
3. Notez la version de Chrome
4. Faites une capture d'écran des logs d'erreur
5. Contactez le support avec ces informations

---

**Dernière mise à jour :** Janvier 2025  
**Testé sur :** Android 7-14, Chrome 120-122 