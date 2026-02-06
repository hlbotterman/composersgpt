// ============================================
// Configuration API
// ============================================

const CONFIG = {
    // En développement local, vous pouvez utiliser l'API directement avec votre clé
    // En production, utilisez l'URL de votre Cloudflare Worker

    // MODE: 'direct' ou 'worker'
    MODE: 'worker',

    // URL du Cloudflare Worker (à remplacer par votre URL après déploiement)
    WORKER_URL: 'http://localhost:8787', //'https://composersgpt-api.votre-nom.workers.dev',

    // API directe (pour dev local uniquement)
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
};

