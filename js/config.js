// ============================================
// Configuration API
// ============================================

const CONFIG = {
    // MODE: 'direct' ou 'worker'
    MODE: 'worker',
    // local
    WORKER_URL: 'http://localhost:8787', 
    // production
    // WORKER_URL: 'https://composersgpt-api.votre-nom.workers.dev',
    // API directe (pour dev local uniquement)
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
};

