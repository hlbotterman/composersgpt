// ============================================
// CompositeursGPT — Initialization
// ============================================

function init() {
    // Re-fetch DOM elements to ensure they are available
    newChatBtn = document.getElementById('newChatBtn');
    modalOverlay = document.getElementById('modalOverlay');
    newChatModal = document.getElementById('newChatModal');
    closeNewChat = document.getElementById('closeNewChat');
    newChatSearchInput = document.getElementById('newChatSearchInput');
    frequentList = document.getElementById('frequentList');
    modalComposerList = document.getElementById('modalComposerList');

    renderComposerList();
    setupEventListeners();
}

// Start App
document.addEventListener('DOMContentLoaded', init);
