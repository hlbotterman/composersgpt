// ============================================
// CompositeursGPT — API Functions
// ============================================

// ============================================
// Send Message & API Call
// ============================================
async function sendMessage() {
    // Route to group message if in group mode
    if (conversationMode === 'group' && selectedComposers.length >= 2) {
        return sendGroupMessage();
    }

    const text = userInput.value.trim();
    if (!text || isLoading) return;

    // Capture reply and file context before clearing
    const currentReplyTo = replyToMessage ? { ...replyToMessage } : null;
    const currentAttachedFile = attachedFile ? { ...attachedFile } : null;

    // Clear input, reply state, and file attachment
    userInput.value = '';
    userInput.style.height = 'auto';
    cancelReply();
    removeAttachedFile();

    // Add user message with thread info
    const userMsgId = generateMessageId();
    const now = new Date();
    const timestamp = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const date = now.getTime();
    addMessage('user', text, userMsgId, currentReplyTo?.id, timestamp);
    conversationHistory.push({
        role: 'user',
        content: text,
        id: userMsgId,
        replyToId: currentReplyTo?.id || null,
        timestamp: timestamp,
        date: date
    });
    saveConversation(currentComposer.id, conversationHistory);
    updateSidebarPreview();

    // Show loading
    isLoading = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const response = await callGroqAPI(text, currentReplyTo, currentAttachedFile);
        removeTypingIndicator();

        if (response.error) {
            // Gestion spéciale pour le rate limiting
            if (response.error.type === 'rate_limit_exceeded') {
                const error = new Error(response.error.message || 'Limite de requêtes atteinte');
                error.type = 'rate_limit_exceeded';
                error.resetTime = response.error.resetTime;
                error.retryAfter = response.error.retryAfter;
                throw error;
            }
            throw new Error(response.error.message || 'Erreur API');
        }

        const rawContent = response.choices[0].message.content;

        // Parser les suggestions dynamiques
        const { cleanContent, suggestions } = parseSuggestions(rawContent);

        // Afficher le message (sans les suggestions)
        const assistantMsgId = generateMessageId();
        const now = new Date();
        const assistantTimestamp = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const date = now.getTime();
        addMessage('assistant', cleanContent, assistantMsgId, userMsgId, assistantTimestamp);

        // Sauvegarder le contenu complet dans l'historique (pour le contexte LLM)
        conversationHistory.push({
            role: 'assistant',
            content: cleanContent,
            id: assistantMsgId,
            replyToId: userMsgId,
            timestamp: assistantTimestamp,
            date: date
        });
        saveConversation(currentComposer.id, conversationHistory);
        updateSidebarPreview();

        // Compression automatique si conversation trop longue
        await compressConversationIfNeeded(currentComposer.id);

        // Afficher les suggestions dynamiques
        if (suggestions.length > 0) {
            showDynamicSuggestions(suggestions);
        }

    } catch (error) {
        removeTypingIndicator();
        console.error('Error:', error);

        let errorMessage;

        // Message personnalisé pour le rate limiting
        if (error.type === 'rate_limit_exceeded') {
            const resetDate = error.resetTime ? new Date(error.resetTime) : null;
            const now = new Date();

            if (resetDate) {
                const diffMinutes = Math.ceil((resetDate - now) / 1000 / 60);
                const diffHours = Math.floor(diffMinutes / 60);

                if (diffHours > 0) {
                    errorMessage = `⏳ **Limite de requêtes atteinte**\n\n${error.message}\n\nRéessayez dans environ ${diffHours}h${diffMinutes % 60}min.`;
                } else if (diffMinutes > 1) {
                    errorMessage = `⏳ **Limite de requêtes atteinte**\n\n${error.message}\n\nRéessayez dans ${diffMinutes} minutes.`;
                } else {
                    errorMessage = `⏳ **Limite de requêtes atteinte**\n\n${error.message}\n\nRéessayez dans quelques instants.`;
                }
            } else {
                errorMessage = `⏳ **Limite de requêtes atteinte**\n\n${error.message}`;
            }
        } else if (error.message.includes('401') || error.message.includes('invalid_api_key')) {
            errorMessage = 'Désolé, une erreur est survenue. Votre clé API semble invalide. Veuillez la vérifier dans les paramètres.';
        } else {
            errorMessage = 'Désolé, une erreur est survenue. ' + error.message;
        }

        addMessage('assistant', errorMessage);
    }

    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
}

async function callGroqAPI(userMessage, replyTo = null, attachedFileMetadata = null) {
    // Construire le prompt système augmenté avec le contexte RAG, la langue et les suggestions
    let augmentedSystemPrompt = buildAugmentedSystemPrompt(
        currentComposer.systemPrompt,
        userMessage,
        currentComposer.id
    );

    // Ajouter le contenu du fichier joint si présent
    if (attachedFileMetadata) {
        augmentedSystemPrompt += `

--- CONTENU DU FICHIER JOINT (${attachedFileMetadata.name}) ---
${attachedFileMetadata.content}
--- FIN DU FICHIER ---

L'utilisateur t'a envoyé ce fichier pour analyse. Prends-en connaissance et utilise ces informations pour répondre à sa question.`;
    }

    // Ajouter le résumé de la conversation si disponible
    const conversation = getConversation(currentComposer.id);
    if (conversation.summary) {
        augmentedSystemPrompt += `

RÉSUMÉ DE LA CONVERSATION PRÉCÉDENTE :
${conversation.summary}

Utilise ce contexte pour maintenir la cohérence avec ce qui a été discuté auparavant.`;
    }

    // Add reply context to system prompt if replying to a specific message
    if (replyTo) {
        const replyAuthor = replyTo.role === 'user' ? "l'utilisateur" : 'toi-même';
        augmentedSystemPrompt += `

CONTEXTE DE RÉPONSE :
L'utilisateur répond spécifiquement à ce message précédent (de ${replyAuthor}) :
"${replyTo.content.substring(0, 300)}${replyTo.content.length > 300 ? '...' : ''}"

Prends en compte ce contexte pour formuler une réponse pertinente et connectée.`;
    }

    // Convert history to API format (strip extra fields)
    // On garde les 15 derniers messages au lieu de 10
    const apiHistory = conversationHistory.slice(-15).map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    const apiMessages = [
        { role: 'system', content: augmentedSystemPrompt },
        ...apiHistory
    ];

    // Utiliser le Worker ou l'API directe selon CONFIG
    const url = CONFIG.MODE === 'worker' ? CONFIG.WORKER_URL : CONFIG.GROQ_API_URL;
    const headers = {
        'Content-Type': 'application/json'
    };

    // En mode direct, ajouter la clé API (pour dev local uniquement)
    if (CONFIG.MODE === 'direct') {
        const apiKey = localStorage.getItem('groq_api_key');
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: MODEL,
            messages: apiMessages,
            temperature: 0.8,
            max_tokens: 1024,
            top_p: 0.9
        })
    });

    const data = await response.json();

    // Gérer le rate limiting
    if (response.status === 429) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const retryAfter = response.headers.get('Retry-After');

        return {
            error: {
                type: 'rate_limit_exceeded',
                message: data.error?.message || 'Limite de requêtes atteinte',
                resetTime: resetTime,
                retryAfter: retryAfter
            }
        };
    }

    return data;
}
