# Tests Unitaires - CompositeursGPT

Ce dossier contient les tests unitaires pour l'application CompositeursGPT.

## 🧪 Framework de test

Nous utilisons **Vitest** avec **Happy DOM** pour tester les fonctions JavaScript.

## 📁 Structure des tests

```
tests/
├── setup.js         # Configuration et mocks globaux
├── ui.test.js       # Tests des fonctions UI (formatage, messages)
├── storage.test.js  # Tests du localStorage et persistance
├── theme.test.js    # Tests du système de thème dark/light
├── export.test.js   # Tests des exports (Markdown, PDF, TXT)
└── README.md        # Ce fichier
```

## 🚀 Lancer les tests

### Installation des dépendances
```bash
npm install
```

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests avec l'interface UI
```bash
npm run test:ui
```

### Lancer les tests avec couverture de code
```bash
npm run test:coverage
```

## ✅ Couverture actuelle

- ✅ **UI Functions** : formatMessage, parseSuggestions, generateMessageId
- ✅ **Storage** : getAllConversations, getConversation, saveConversation
- ✅ **Theme** : setTheme, toggleTheme, initTheme
- ✅ **Export** : getExportData, downloadFile, formatAsMarkdown

## 📝 Ajouter de nouveaux tests

1. Créez un nouveau fichier `*.test.js` dans le dossier `tests/`
2. Importez les fonctions de Vitest :
   ```javascript
   import { describe, it, expect, beforeEach } from 'vitest';
   ```
3. Écrivez vos tests :
   ```javascript
   describe('Ma fonction', () => {
     it('should do something', () => {
       expect(maFonction()).toBe('expected');
     });
   });
   ```

## 🔧 Configuration

La configuration est dans `vitest.config.js` :
- Environnement : Happy DOM (simulation du DOM)
- Globals : activés (pas besoin d'importer describe/it/expect)
- Setup file : `tests/setup.js` (mocks globaux)
- Coverage : v8 provider

## 📊 Bonnes pratiques

- ✅ Tester les cas nominaux
- ✅ Tester les cas d'erreur
- ✅ Tester les cas limites (null, undefined, empty)
- ✅ Utiliser des mocks pour localStorage, DOM, etc.
- ✅ Nettoyer les mocks avec `beforeEach`
- ✅ Nommer clairement les tests (`should ...`)
