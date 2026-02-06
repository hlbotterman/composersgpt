// ============================================
// Configuration API
// ============================================

const CONFIG = {
    // MODE: 'direct' ou 'worker'
    MODE: 'worker',

    // Production (GitHub Pages)
    WORKER_URL: 'https://composersgpt-api.honglan-botterman.workers.dev',

    // Local development
    // WORKER_URL: 'http://localhost:8787',

    // API directe (pour dev local uniquement)
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
};

