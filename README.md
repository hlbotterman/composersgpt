# 🎵 CompositeursGPT

<div align="center">

**Dialoguez avec les Grands Maîtres de la Musique Classique**

Une application web interactive propulsée par IA pour converser avec les plus grands compositeurs de l'histoire de la musique.

[![Tests](https://img.shields.io/badge/tests-25%20passing-brightgreen)](#-tests)
[![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#-licence)
[![JavaScript](https://img.shields.io/badge/javascript-vanilla-yellow)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Groq](https://img.shields.io/badge/powered%20by-Groq-orange)](https://groq.com/)

[Démo en ligne](#) • [Installation](#-installation) • [Documentation](#-fonctionnalités)

</div>

---

## 📖 À propos

**CompositeursGPT** est une expérience unique qui permet de dialoguer avec 15+ compositeurs de musique classique grâce à l'intelligence artificielle. Chaque compositeur possède sa propre personnalité, son style de communication et ses connaissances historiques enrichies par un système RAG (Retrieval Augmented Generation).

### ✨ Points forts

- 🎼 **15+ compositeurs** : De Bach à Debussy, chacun avec sa personnalité unique
- 💬 **Conversations naturelles** : Discussions contextuelles et pertinentes
- 🎭 **Mode groupe** : Débats entre 2-3 compositeurs simultanément
- 🌓 **Dark mode** : Interface élégante adaptable à vos préférences
- 📥 **Export pro** : Markdown, PDF et TXT pour sauvegarder vos échanges
- 🎤 **Transcription vocale** : Parlez à voix haute grâce à Whisper
- 📄 **Analyse de documents** : Uploadez des PDF ou fichiers texte
- 💾 **Persistance** : Toutes vos conversations sauvegardées localement
- 🧵 **Threads** : Répondez à des messages spécifiques
- ✨ **Suggestions IA** : Questions de suivi intelligentes
- 🧪 **Tests robustes** : 25 tests unitaires pour garantir la qualité

---

## 🚀 Installation

### Prérequis

- Compte [Groq](https://console.groq.com) (API gratuite)
- [Node.js](https://nodejs.org/) 18+ (pour le Worker)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/composersgpt.git
cd composersgpt
```

### 2. Déployer le Cloudflare Worker (Backend)

#### Installation de Wrangler

```bash
npm install -g wrangler
```

#### Connexion à Cloudflare

```bash
wrangler login
```

#### Configuration de la clé API Groq

1. Créez un compte sur [console.groq.com](https://console.groq.com)
2. Générez une clé API gratuite
3. Ajoutez-la comme secret :

```bash
cd backend
wrangler secret put GROQ_API_KEY
# Collez votre clé quand demandé
```

#### Créer le KV namespace (Rate Limiting)

```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
```

Copiez l'ID retourné dans `backend/wrangler.toml` :

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "votre_id_ici"
```

#### Déployer

```bash
wrangler deploy
```

✅ Notez l'URL (ex: `https://composersgpt-api.votre-nom.workers.dev`)

### 3. Configurer le Frontend

Éditez `js/config.js` :

```javascript
const CONFIG = {
    MODE: 'worker',
    WORKER_URL: 'https://composersgpt-api.votre-nom.workers.dev', // ← Votre URL
};
```

### 4. Déployer sur GitHub Pages

```bash
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/votre-nom/composersgpt.git
git push -u origin main
```

Activez GitHub Pages :
- **Settings** → **Pages**
- **Source** : Deploy from a branch
- **Branch** : `main` / `(root)`
- **Save**

🎉 Votre site sera disponible sur `https://votre-nom.github.io/composersgpt/`

### 5. Sécuriser le Worker (CORS)

Mettez à jour `backend/worker.js` avec votre domaine :

```javascript
const ALLOWED_ORIGINS = [
    'https://votre-nom.github.io',
    'http://localhost:3000' // Pour le dev local
];
```

Redéployez :

```bash
cd backend
wrangler deploy
```

---

## 🎨 Fonctionnalités

### 💬 Conversations Solo

- **15+ compositeurs** : Mozart, Beethoven, Bach, Chopin, Debussy, Ravel, etc.
- **Personnalités uniques** : Chaque compositeur a son style et ses connaissances
- **Contexte RAG** : Réponses enrichies avec des faits historiques et musicaux
- **Suggestions dynamiques** : L'IA propose des questions de suivi
- **Compression automatique** : Résumés générés après 25 messages

### 👥 Mode Groupe

- Sélectionnez 2 ou 3 compositeurs
- Créez des débats fascinants entre différentes époques
- Observez leurs points de vue divergents ou convergents

### 🌓 Dark Mode

- Interface élégante en mode clair ou sombre
- Sauvegarde automatique de votre préférence
- Transition fluide et sans flash

### 📥 Export Multi-Format

**Markdown**
- Format propre et structuré
- Parfait pour GitHub, Notion, Obsidian
- Emojis pour identifier les interlocuteurs

**PDF**
- Document professionnel
- Mise en page soignée avec pagination
- Prêt à imprimer ou partager

**TXT**
- Format universel et simple
- Compatible avec tous les éditeurs

### 🎤 Transcription Vocale

- Enregistrez votre question à voix haute
- Transcription automatique via Whisper Large V3
- Envoi instantané du message

### 📄 Upload de Documents

- Glissez-déposez des fichiers PDF, TXT, Markdown
- Le compositeur analyse le contenu
- Idéal pour discuter d'une partition ou d'un texte

### 🧵 Système de Threads

- Répondez à un message spécifique
- Fil de conversation clair et structuré
- Navigation fluide entre les réponses

---

## 🏗️ Architecture

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Vanilla JavaScript (ES6+), CSS3, HTML5 |
| **IA** | Groq API (LLaMA 3.3 70B Versatile) |
| **Transcription** | Whisper Large V3 |
| **Backend** | Cloudflare Workers (Serverless) |
| **Tests** | Vitest + Happy DOM |
| **Export PDF** | jsPDF |
| **Lecture PDF** | PDF.js |

### Architecture des fichiers

```
composersgpt/
├── index.html                 # Page principale
├── assets/
│   ├── css/
│   │   └── style.css          # Styles (thème clair + sombre)
│   └── images/                # Photos des compositeurs
├── js/
│   ├── config.js              # Configuration API
│   ├── composers.js           # Données des 15+ compositeurs
│   ├── rag-rules.js           # Prompts système RAG
│   └── app/                   # Modules applicatifs
│       ├── theme.js           # 🌓 Dark mode
│       ├── state.js           # État global
│       ├── storage.js         # localStorage & compression
│       ├── ui.js              # 📥 Interface + Export
│       ├── api.js             # Appels API Groq
│       ├── composer.js        # Logique compositeurs
│       ├── group.js           # 👥 Mode groupe
│       ├── audio.js           # 🎤 Transcription vocale
│       ├── file.js            # 📄 Upload fichiers
│       └── init.js            # Initialisation
├── backend/
│   ├── worker.js              # Cloudflare Worker (proxy + rate limit)
│   ├── wrangler.toml          # Config Cloudflare
│   └── .dev.vars              # Variables locales (gitignored)
├── tests/                     # 🧪 Tests unitaires
│   ├── setup.js
│   ├── ui.test.js
│   ├── storage.test.js
│   ├── theme.test.js
│   ├── export.test.js
│   └── README.md
├── package.json               # Dépendances de test
├── vitest.config.js           # Configuration Vitest
└── README.md                  # Ce fichier
```

### Flux de données

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────┐
│ Utilisateur │────→│ Interface Web    │────→│  Cloudflare │────→│ Groq API │
│             │     │ (JavaScript)     │     │   Worker    │     │ (LLaMA)  │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────────┘
                             │                        │                 │
                             ↓                        ↓                 ↓
                    ┌─────────────────┐     ┌──────────────┐    ┌──────────┐
                    │  localStorage   │     │ Rate Limit   │    │ Response │
                    │ (Conversations) │     │   (KV Store) │    │          │
                    └─────────────────┘     └──────────────┘    └──────────┘
```

---

## 🧪 Tests

L'application dispose de **25 tests unitaires** couvrant les fonctionnalités critiques.

### Lancer les tests

```bash
# Installation des dépendances
npm install

# Lancer tous les tests
npm test

# Interface interactive
npm run test:ui

# Rapport de couverture
npm run test:coverage
```

### Couverture

| Fichier | Tests | Description |
|---------|-------|-------------|
| `ui.test.js` | 6 | Formatage messages, parsing suggestions, IDs |
| `storage.test.js` | 6 | localStorage, conversations, compression |
| `theme.test.js` | 7 | Dark mode, toggle, persistance |
| `export.test.js` | 6 | Export Markdown, PDF, TXT |
| **Total** | **25** | **100% des fonctions critiques** |

---

## 🛠️ Développement Local

### Avec Worker (Recommandé)

1. Créez `backend/.dev.vars` :

```bash
GROQ_API_KEY=votre_cle_groq_ici
```

2. Lancez le Worker local :

```bash
cd backend
wrangler dev
```

3. Configurez `js/config.js` :

```javascript
WORKER_URL: 'http://localhost:8787',
```

4. Ouvrez `index.html` dans votre navigateur

### Mode Direct (Alternative)

Pour tester sans Worker :

```javascript
// js/config.js
const CONFIG = {
    MODE: 'direct',
};

// Console du navigateur
localStorage.setItem('groq_api_key', 'votre_cle_ici');
```

---

## 🎯 Guide d'utilisation

### Conversation Solo

1. **Sélectionner un compositeur**
   - Cliquez sur "Nouvelle discussion" (✏️)
   - Ou sélectionnez dans la liste

2. **Poser une question**
   - Tapez dans le champ de texte
   - Ou utilisez le micro (🎤)
   - Ou joignez un document (📎)

3. **Répondre à un message**
   - Cliquez sur "Répondre" sous un message
   - Le contexte sera pris en compte

### Conversation de Groupe

1. Basculez sur l'onglet **"Groupe"**
2. Sélectionnez 2 ou 3 compositeurs
3. Cliquez sur **"Commencer"**
4. Posez une question et observez le débat !

### Exporter une Conversation

1. Cliquez sur les **3 points** (⋮) en haut à droite
2. Choisissez "Exporter en..."
3. Sélectionnez votre format préféré

### Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Entrée` | Envoyer le message |
| `Maj + Entrée` | Nouvelle ligne |
| `Échap` | Fermer les modales |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

### Workflow

1. **Fork** le projet
2. Créez une **branche** :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. **Committez** :
   ```bash
   git commit -m "feat: ajoute ma fonctionnalité"
   ```
4. **Push** :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
5. Ouvrez une **Pull Request**

### Guidelines

- ✅ Écrivez des tests pour les nouvelles fonctionnalités
- ✅ Suivez le style de code existant
- ✅ Commentez le code complexe en français
- ✅ Mettez à jour la documentation
- ✅ Testez en local avant de commit

### Ajouter un nouveau compositeur

Éditez `js/composers.js` :

```javascript
{
  id: 'nouveau-id',
  name: 'Nom du Compositeur',
  dates: '1800-1850',
  image: 'assets/images/compositeur.jpg',
  description: 'Description courte...',
  biography: 'Biographie complète...',
  tags: ['Romantique', 'Piano'],
  systemPrompt: 'Tu es [Nom], compositeur romantique...',
  suggestions: [
    'Question exemple 1?',
    'Question exemple 2?',
    'Question exemple 3?'
  ]
}
```

---

## 🗺️ Roadmap

### ✅ Version 1.0 (Actuelle)

- [x] Conversations avec 15+ compositeurs
- [x] Mode groupe (2-3 compositeurs)
- [x] Dark mode élégant
- [x] Export Markdown, PDF, TXT
- [x] Transcription vocale
- [x] Upload de documents
- [x] Tests unitaires (25 tests)
- [x] Système de threads
- [x] Compression automatique
- [x] Rate limiting (50/jour, 5/min)

### 🔄 Version 2.0 (Prévue)

- [ ] PWA (Progressive Web App)
  - Mode offline
  - Installation sur mobile
  - Notifications push
- [ ] Recherche avancée
  - Dans les conversations
  - Par date, compositeur, mots-clés
- [ ] Statistiques
  - Compositeurs préférés
  - Graphiques d'utilisation
  - Temps de conversation
- [ ] Thèmes personnalisables
  - Couleurs custom
  - Polices
  - Layouts

### 💡 Idées Futures

- Partage de conversations (liens publics)
- Compositeurs créés par les utilisateurs
- Intégration Spotify/Apple Music
- Mode "Concert" avec plusieurs compositeurs
- Recommandations d'œuvres musicales
- Traduction multilingue
- API publique

---

## 🔐 Sécurité & Confidentialité

### Mesures de sécurité

- ✅ **Clé API sécurisée** : Stockée dans les secrets Cloudflare
- ✅ **Proxy Worker** : Jamais exposée au client
- ✅ **CORS strict** : Seuls les domaines autorisés
- ✅ **Rate limiting** :
  - 50 requêtes/jour par IP
  - 5 requêtes/minute par IP
  - Messages d'erreur conviviaux
- ✅ **Aucune donnée serveur** : Tout est stocké localement
- ✅ **Open source** : Code auditable publiquement

### Données utilisateur

- 💾 **Stockage local uniquement** (localStorage)
- 🔒 **Aucune collecte de données personnelles**
- 🚫 **Pas de tracking ni d'analytics**
- ✅ **Contrôle total** sur vos conversations

---

## 📄 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Crédits & Remerciements

### Technologies

- [Groq](https://groq.com/) - Inférence IA ultra-rapide
- [Meta LLaMA 3.3](https://ai.meta.com/llama/) - Modèle de langage
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless backend
- [Vitest](https://vitest.dev/) - Framework de test moderne
- [jsPDF](https://github.com/parallax/jsPDF) - Génération PDF
- [PDF.js](https://mozilla.github.io/pdf.js/) - Lecture PDF

### Inspiration

Ce projet est né de la volonté de rendre la musique classique accessible à tous en permettant des conversations interactives avec les compositeurs qui ont façonné notre héritage musical.

Chaque conversation est une fenêtre sur l'histoire, l'art et la pensée de ces génies créatifs.

---

<div align="center">

**Développé avec ❤️ et 🎵**

[⬆ Retour en haut](#-composersgpt)

</div>
