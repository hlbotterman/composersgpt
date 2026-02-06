# 🎵 CompositeursGPT

<div align="center">

**Dialoguez avec les Grands Maîtres de la Musique Classique**

Une application web pour converser avec les plus grands compositeurs de l'histoire de la musique.

[![Tests](https://img.shields.io/badge/tests-25%20passing-brightgreen)](#-tests)
[![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#-licence)
[![JavaScript](https://img.shields.io/badge/javascript-vanilla-yellow)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Groq](https://img.shields.io/badge/powered%20by-Groq-orange)](https://groq.com/)

[Démo en ligne](#) • [Installation](#-installation) • [Documentation](#-fonctionnalités)

</div>

---

## 📖 À propos

**CompositeursGPT** permet de dialoguer avec des compositeurs de musique classique grâce à l'intelligence artificielle. Chaque compositeur possède sa propre personnalité, son style de communication et ses connaissances historiques.

- 🎼 **10 compositeurs** : De Bach à Debussy, chacun avec sa personnalité unique
- 💬 **Conversations naturelles** : Discussions contextuelles et pertinentes
- 🎭 **Mode groupe** : Débats entre 2-3 compositeurs simultanément
- 🌓 **Dark mode** : Interface élégante adaptable à vos préférences
- 📥 **Export pro** : Markdown, PDF et TXT pour sauvegarder vos échanges
- 🎤 **Transcription vocale** : Parlez à voix haute grâce à Whisper
- 📄 **Analyse de documents** : Uploadez des PDF ou fichiers texte
- 💾 **Persistance** : Toutes vos conversations sauvegardées localement
- 🧵 **Threads** : Répondez à des messages spécifiques
- ✨ **Suggestions IA** : Questions de suivi intelligentes

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
    WORKER_URL: 'https://composersgpt-api.votre-nom.workers.dev',
};
```

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


## 🧪 Tests

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