# 🔄 Configuration CI/CD

Ce guide vous explique comment configurer les secrets GitHub pour activer la CI/CD.

## 📋 Secrets requis

Vous devez configurer 3 secrets dans votre repository GitHub.

### 1. Accéder aux Secrets GitHub

1. Allez sur votre repo : `https://github.com/VOTRE-USERNAME/composersgpt`
2. Cliquez sur **Settings** (en haut)
3. Dans le menu latéral : **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### 2. Créer les secrets

#### Secret 1 : `CLOUDFLARE_API_TOKEN`

**Comment l'obtenir :**
1. Allez sur https://dash.cloudflare.com/profile/api-tokens
2. Cliquez sur **Create Token**
3. Utilisez le template **Edit Cloudflare Workers**
4. Permissions nécessaires :
   - Account : Workers Scripts : Edit
   - Account : Workers KV Storage : Edit
5. Copiez le token généré

**Dans GitHub :**
- Name: `CLOUDFLARE_API_TOKEN`
- Secret: `[votre-token]`

#### Secret 2 : `CLOUDFLARE_ACCOUNT_ID`

**Comment l'obtenir :**
1. Allez sur https://dash.cloudflare.com/
2. Sélectionnez votre compte Workers
3. L'Account ID est visible dans la barre latérale droite
4. Ou trouvez-le dans l'URL : `https://dash.cloudflare.com/[ACCOUNT_ID]/workers`

**Dans GitHub :**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Secret: `935ffa72ca561a9bee80fbd8ffd70475` (votre Account ID)

#### Secret 3 : `GROQ_API_KEY`

**Comment l'obtenir :**
1. Vous l'avez déjà dans votre fichier `.dev.vars`
2. C'est la clé qui commence par `gsk_...`

**Dans GitHub :**
- Name: `GROQ_API_KEY`
- Secret: `gsk_...` (votre clé qui est dans `.dev.vars`)

---

## ✅ Vérification

Une fois les secrets configurés :

1. Faites un commit et push :
   ```bash
   git add .github/
   git commit -m "Add CI/CD workflows"
   git push
   ```

2. Allez dans l'onglet **Actions** de votre repo GitHub

3. Vous devriez voir les workflows s'exécuter :
   - ✅ **CI - Tests** : Lance les tests
   - ✅ **CD - Deploy Worker** : Déploie le Worker

---

## 🎯 Ce que fait la CI/CD

### Sur chaque Push/PR
- ✅ Lance les 25 tests unitaires
- ✅ Génère le rapport de couverture
- ✅ Vérifie la structure du projet
- ✅ Détecte les fuites de secrets

### Sur Push vers `main`
- ✅ Déploie automatiquement le Worker Cloudflare
- ✅ Met à jour la clé API Groq
- ✅ Génère un rapport de déploiement

### Sur Pull Request
- ✅ Lance les tests
- ✅ Commente le rapport de couverture
- ✅ Affiche un preview des changements

---

## 🚨 Troubleshooting

### Error: "Invalid API Token"
- Vérifiez que le token a les bonnes permissions
- Recréez un token avec le template "Edit Cloudflare Workers"

### Error: "Account ID not found"
- Vérifiez que l'Account ID est correct
- Il doit être exactement celui de votre compte Cloudflare

### Error: "Tests failed"
- Vérifiez que tous les tests passent localement avec `npm test`
- Vérifiez que les dépendances sont à jour

---

## 🎉 Résultat

Une fois configuré, vous aurez :
- 🤖 Tests automatiques sur chaque commit
- 🚀 Déploiement automatique sur push vers main
- 📊 Rapports de couverture sur les PR
- ✅ Badges de status dans le README

Plus besoin de déployer manuellement ! 🎊
