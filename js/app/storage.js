// ============================================
// CompositeursGPT — Local Storage Functions
// ============================================

function getAllConversations() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function getConversation(composerId) {
    const all = getAllConversations();
    const conversation = all[composerId];

    // Rétrocompatibilité : si c'est un array, le convertir
    if (Array.isArray(conversation)) {
        return { history: conversation, summary: null };
    }

    return conversation || { history: [], summary: null };
}

function saveConversation(composerId, history, summary = null, resetUnread = false) {
    const all = getAllConversations();
    const existing = all[composerId];

    // Calculate unread count
    let unreadCount = existing?.unreadCount || 0;
    if (resetUnread) {
        unreadCount = 0;
    } else {
        // If the last message is from assistant and it's not the active composer, increment unread
        const lastMsg = history[history.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && (!currentComposer || currentComposer.id !== composerId)) {
            unreadCount++;
        }
    }

    all[composerId] = {
        history: history,
        summary: summary !== null ? summary : (existing?.summary || null),
        unreadCount: unreadCount,
        lastUpdated: history.length > 0 ? history[history.length - 1].date : 0
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Compresse automatiquement une conversation trop longue
 * en générant un résumé des messages anciens
 */
async function compressConversationIfNeeded(composerId) {
    const COMPRESSION_THRESHOLD = 25; // Déclencher compression après 25 messages
    const MESSAGES_TO_KEEP = 15;      // Garder les 15 derniers messages complets
    const MESSAGES_TO_SUMMARIZE = 10;  // Résumer les 10 plus anciens

    const conversation = getConversation(composerId);
    const history = conversation.history;

    // Pas besoin de compression si moins de 25 messages
    if (history.length < COMPRESSION_THRESHOLD) {
        return;
    }

    try {
        // Messages à résumer (les plus anciens)
        const toSummarize = history.slice(0, MESSAGES_TO_SUMMARIZE);

        // Créer un texte représentant ces messages
        const conversationText = toSummarize.map(msg => {
            const role = msg.role === 'user' ? 'User' : currentComposer.name;
            return `${role}: ${msg.content}`;
        }).join('\n\n');

        // Demander à l'IA de résumer
        const summaryPrompt = `You are an assistant that summarizes conversations. Here is an excerpt from a conversation between a User and ${currentComposer.name}. Create a concise summary (3-5 sentences) of the topics discussed and important information exchanged. Write the summary in the same language as the conversation:

${conversationText}

Résumé :`;

        const response = await callGroqAPIWithPrompt(
            'You are an assistant that summarizes conversations concisely and faithfully.',
            summaryPrompt
        );

        if (response.error || !response.choices?.[0]?.message?.content) {
            console.warn('Échec de la compression, conservation de tous les messages');
            return;
        }

        const newSummary = response.choices[0].message.content.trim();

        // Combiner ancien résumé (si existe) avec le nouveau
        const finalSummary = conversation.summary
            ? `${conversation.summary}\n\n[Suite] ${newSummary}`
            : newSummary;

        // Garder seulement les N derniers messages + le résumé
        const compressedHistory = history.slice(-MESSAGES_TO_KEEP);

        // Sauvegarder
        saveConversation(composerId, compressedHistory, finalSummary);

        console.log(`✅ Conversation compressée : ${history.length} → ${compressedHistory.length} messages + résumé`);

        // Mettre à jour l'affichage du résumé
        updateSummaryDisplay();

    } catch (error) {
        console.error('Erreur lors de la compression:', error);
        // En cas d'erreur, ne rien faire (garder tous les messages)
    }
}

/**
 * Met à jour l'affichage du bouton et panneau de résumé
 */
function updateSummaryDisplay() {
    if (!currentComposer) return;

    const conversation = getConversation(currentComposer.id);

    if (conversation.summary) {
        // Afficher le bouton
        summaryToggle.classList.remove('hidden');

        // Mettre à jour le contenu du panneau
        summaryContent.innerHTML = conversation.summary
            .split('\n\n')
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
    } else {
        // Masquer le bouton et le panneau
        summaryToggle.classList.add('hidden');
        summaryPanel.classList.add('hidden');
        summaryToggle.classList.remove('active');
    }
}

/**
 * Toggle l'affichage du panneau de résumé
 */
function toggleSummary() {
    summaryPanel.classList.toggle('hidden');
    summaryToggle.classList.toggle('active');
}

function clearConversation() {
    if (!currentComposer) return;

    // Confirmation dialog
    const confirmMsg = conversationMode === 'group'
        ? 'Effacer cette conversation de groupe ?'
        : `Effacer la conversation avec ${currentComposer.name} ?`;

    if (!confirm(confirmMsg)) {
        return;
    }

    if (conversationMode === 'group') {
        // Clear group conversation
        const groupId = getGroupId();
        const data = localStorage.getItem(GROUP_STORAGE_KEY);
        const all = data ? JSON.parse(data) : {};
        delete all[groupId];
        localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(all));

        groupConversationHistory = [];
        messages.innerHTML = '';

        // Show welcome message
        showGroupWelcomeMessage();
    } else {
        // Clear solo conversation
        const all = getAllConversations();
        delete all[currentComposer.id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

        conversationHistory = [];
        messages.innerHTML = '';

        // Hide summary button
        summaryToggle.classList.add('hidden');
        summaryPanel.classList.add('hidden');

        // Show welcome message
        showWelcomeMessage();

        // Update sidebar preview
        updateComposerPreview(currentComposer.id);
    }

    // Reset reply state
    cancelReply();
}
