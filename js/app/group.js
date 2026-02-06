// ============================================
// CompositeursGPT — Group Conversation Mode
// ============================================

function setConversationMode(mode) {
    conversationMode = mode;
    selectedComposers = [];
    groupConversationHistory = [];

    // Update toggle buttons
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    // Show/hide group action
    const groupAction = document.getElementById('groupAction');
    if (groupAction) {
        groupAction.classList.toggle('hidden', mode !== 'group');
    }

    // Update composer list display
    renderComposerList();
    updateGroupActionUI();

    // Reset to empty state
    if (mode === 'group') {
        emptyState.classList.remove('hidden');
        chatSection.classList.add('hidden');
        currentComposer = null;
    }
}

function toggleComposerSelection(composerId) {
    const composer = COMPOSERS.find(c => c.id === composerId);
    if (!composer) return;

    const index = selectedComposers.findIndex(c => c.id === composerId);

    if (index > -1) {
        // Remove from selection
        selectedComposers.splice(index, 1);
    } else if (selectedComposers.length < MAX_GROUP_COMPOSERS) {
        // Add to selection
        selectedComposers.push(composer);
    }

    renderComposerList();
    updateGroupActionUI();
}

function updateGroupActionUI() {
    const selectedCount = document.getElementById('selectedCount');
    const startGroupBtn = document.getElementById('startGroupBtn');

    if (selectedCount) {
        selectedCount.textContent = `${selectedComposers.length}/${MAX_GROUP_COMPOSERS}`;
    }

    if (startGroupBtn) {
        startGroupBtn.disabled = selectedComposers.length < 2;
        startGroupBtn.textContent = 'Commencer';
    }
}

function startGroupConversation() {
    if (selectedComposers.length < 2) return;

    // Load existing group conversation if any
    const groupId = getGroupId();
    groupConversationHistory = getGroupConversation(groupId);

    // Update header for group
    updateGroupHeader();

    // Show chat section
    emptyState.classList.add('hidden');
    chatSection.classList.remove('hidden');

    // Render messages
    messages.innerHTML = '';
    if (groupConversationHistory.length > 0) {
        groupConversationHistory.forEach(msg => {
            if (msg.composerId) {
                addGroupMessage(msg);
            } else {
                addMessage(msg.role, msg.content, msg.id || null, msg.replyToId || null);
            }
        });
    } else {
        showGroupWelcomeMessage();
    }

    // On mobile, hide sidebar
    sidebar.classList.add('sidebar-hidden');

    userInput.focus();
    scrollToBottom();
}

function getGroupId() {
    return selectedComposers.map(c => c.id).sort().join('-');
}

function getGroupConversation(groupId) {
    const data = localStorage.getItem(GROUP_STORAGE_KEY);
    const all = data ? JSON.parse(data) : {};
    return all[groupId] || [];
}

function saveGroupConversation() {
    const groupId = getGroupId();
    const data = localStorage.getItem(GROUP_STORAGE_KEY);
    const all = data ? JSON.parse(data) : {};
    all[groupId] = groupConversationHistory;
    localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(all));
}

function updateGroupHeader() {
    const names = selectedComposers.map(c => c.name.split(' ').pop()).join(' & ');
    currentName.textContent = names;
    currentDates.textContent = 'Débat';

    // Show multiple avatars
    currentAvatar.innerHTML = selectedComposers.map(c =>
        `<img src="${c.image}" alt="${c.name}" class="group-avatar">`
    ).join('');
}

function showGroupWelcomeMessage() {
    const names = selectedComposers.map(c => c.name).join(', ');
    const welcomeHtml = `
        <div class="welcome-message">
            <h4>Discussion avec ${names}</h4>
            <p>Posez une question aux compositeurs et observez leur débat.</p>
            <div class="group-avatars-large">
                ${selectedComposers.map(c => `
                    <div class="group-avatar-item">
                        <img src="${c.image}" alt="${c.name}">
                        <span>${c.name.split(' ').pop()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    messages.innerHTML = welcomeHtml;
}

function addGroupMessage(message) {
    // Remove welcome message if present
    const welcome = messages.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    // Remove dynamic suggestions
    removeDynamicSuggestions();

    const composer = COMPOSERS.find(c => c.id === message.composerId);
    if (!composer) return;

    const id = message.id || generateMessageId();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant group-message';
    messageDiv.dataset.messageId = id;
    if (message.replyToId) {
        messageDiv.dataset.replyTo = message.replyToId;
        messageDiv.classList.add('has-reply-context');
    }

    // Build reply quote if replying to a message
    let replyQuoteHtml = '';
    if (message.replyToId) {
        const replyToMsg = groupConversationHistory.find(m => m.id === message.replyToId);
        if (replyToMsg) {
            const shortContent = replyToMsg.content.length > 80
                ? replyToMsg.content.substring(0, 80) + '...'
                : replyToMsg.content;
            let replyAuthor = 'Compositeur';
            if (replyToMsg.role === 'user') {
                replyAuthor = 'Vous';
            } else if (replyToMsg.composerId) {
                const replyComposer = COMPOSERS.find(c => c.id === replyToMsg.composerId);
                if (replyComposer) replyAuthor = replyComposer.name;
            }
            replyQuoteHtml = `
                <div class="reply-quote" data-reply-target="${message.replyToId}">
                    <span class="reply-author">${replyAuthor}</span>
                    <span class="reply-text">${shortContent}</span>
                </div>
            `;
        }
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${composer.image}" alt="${composer.name}">
        </div>
        <div class="message-content">
            <div class="composer-name-badge">${composer.name}</div>
            ${replyQuoteHtml}
            <div class="message-text">${formatMessage(message.content)}</div>
            <button class="reply-btn" data-msg-id="${id}" data-msg-role="assistant" aria-label="Répondre">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 14l-5-5 5-5M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11"/>
                </svg>
                Répondre
            </button>
        </div>
    `;

    messages.appendChild(messageDiv);
    scrollToBottom();

    return id;
}

async function sendGroupMessage() {
    const text = userInput.value.trim();
    if (!text || isLoading) return;

    // Capture reply context before clearing
    const currentReplyTo = replyToMessage ? { ...replyToMessage } : null;

    // Clear input and reply state
    userInput.value = '';
    userInput.style.height = 'auto';
    cancelReply();

    // Add user message with thread info
    const userMsgId = generateMessageId();
    addMessage('user', text, userMsgId, currentReplyTo?.id);
    groupConversationHistory.push({
        role: 'user',
        content: text,
        id: userMsgId,
        replyToId: currentReplyTo?.id || null
    });

    isLoading = true;
    sendBtn.disabled = true;

    try {
        // Each composer responds in sequence
        for (let i = 0; i < selectedComposers.length; i++) {
            const composer = selectedComposers[i];
            const isLast = (i === selectedComposers.length - 1);

            // Show typing indicator for this composer
            showTypingIndicatorForComposer(composer);

            // Get previous responses in this turn
            const previousResponses = groupConversationHistory.filter(m =>
                m.composerId && m.role === 'assistant'
            ).slice(-selectedComposers.length + 1);

            // Build the prompt for this composer
            const systemPrompt = buildGroupSystemPrompt(composer, text, previousResponses, isLast);

            // Call API
            const response = await callGroqAPIWithPrompt(systemPrompt, text);
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
            const { cleanContent, suggestions } = parseSuggestions(rawContent);

            // Add composer's response
            const assistantMsgId = generateMessageId();
            const now = new Date();
            const message = {
                role: 'assistant',
                composerId: composer.id,
                content: cleanContent,
                id: assistantMsgId,
                replyToId: userMsgId,
                timestamp: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                date: now.getTime()
            };
            groupConversationHistory.push(message);
            addGroupMessage(message);

            // Show suggestions only from last composer
            if (isLast && suggestions.length > 0) {
                showDynamicSuggestions(suggestions);
            }

            // Small delay between responses for effect
            if (!isLast) {
                await delay(500);
            }
        }

        saveGroupConversation();

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
        } else {
            errorMessage = 'Désolé, une erreur est survenue. ' + error.message;
        }

        addMessage('assistant', errorMessage);
    }

    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
}

function showTypingIndicatorForComposer(composer) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar"><img src="${composer.image}" alt="${composer.name}"></div>
        <div class="message-content">
            <div class="composer-name-badge">${composer.name}</div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messages.appendChild(typingDiv);
    scrollToBottom();
}

function buildGroupSystemPrompt(composer, userQuestion, previousResponses, isLast) {
    const othersNames = selectedComposers
        .filter(c => c.id !== composer.id)
        .map(c => c.name)
        .join(' et ');

    let prompt = composer.systemPrompt;

    // Add group context
    prompt += `

GROUP DISCUSSION CONTEXT:
You are participating in a debate with ${othersNames}. The user is asking you a common question.
- Give YOUR personal point of view in a few paragraphs (not too long, 2-3 paragraphs max).
- You can refer to other composers present, comment on their styles or eras.
- Stay respectful but do not hesitate to express artistic disagreements constructively.
- Be concise to leave room for others.
- ALWAYS respond in the same language as the user.`;

    // Add previous responses context
    if (previousResponses.length > 0) {
        prompt += '\n\nRÉPONSES PRÉCÉDENTES DANS CE DÉBAT :';
        for (const resp of previousResponses) {
            const respComposer = COMPOSERS.find(c => c.id === resp.composerId);
            if (respComposer) {
                const shortContent = resp.content.length > 300
                    ? resp.content.substring(0, 300) + '...'
                    : resp.content;
                prompt += `\n\n${respComposer.name} : "${shortContent}"`;
            }
        }
        prompt += '\n\nDonne maintenant ta réponse en tenant compte de ce qui a été dit.';
    }

    // Add suggestion instruction only for last composer
    if (isLast) {
        prompt += SUGGESTION_INSTRUCTION;
    }

    return prompt;
}

async function callGroqAPIWithPrompt(systemPrompt, userMessage) {
    const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
