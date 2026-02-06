// ============================================
// CompositeursGPT — UI Functions
// ============================================

// ============================================
// Dropdown Menu (3 dots)
// ============================================

function toggleDropdownMenu() {
    dropdownMenu.classList.toggle('hidden');
    menuBtn.classList.toggle('active');
}

function closeDropdownMenu() {
    dropdownMenu.classList.add('hidden');
    menuBtn.classList.remove('active');
}

// ============================================
// Export Functions
// ============================================

function getExportData() {
    if (!currentComposer) return null;

    if (conversationMode === 'group') {
        return {
            isGroup: true,
            title: `Conversation de groupe avec ${selectedComposers.map(c => c.name).join(', ')}`,
            composers: selectedComposers,
            messages: groupConversationHistory,
            summary: null,
            filename: `conversation_groupe_${new Date().toISOString().split('T')[0]}`
        };
    } else {
        const conversation = getConversation(currentComposer.id);
        return {
            isGroup: false,
            title: `Conversation avec ${currentComposer.name}`,
            composer: currentComposer,
            messages: conversation.history,
            summary: conversation.summary,
            filename: `conversation_${currentComposer.id}_${new Date().toISOString().split('T')[0]}`
        };
    }
}

function exportAsMarkdown() {
    const data = getExportData();
    if (!data) return;

    let markdown = `# ${data.title}\n\n`;
    markdown += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;

    if (data.summary) {
        markdown += `## 📝 Résumé\n\n${data.summary}\n\n---\n\n`;
    }

    markdown += `## Messages\n\n`;

    data.messages.forEach(msg => {
        if (msg.role === 'user') {
            markdown += `### 👤 Vous\n\n${msg.content}\n\n`;
        } else if (data.isGroup && msg.composerId) {
            const composer = COMPOSERS.find(c => c.id === msg.composerId);
            markdown += `### 🎵 ${composer?.name || 'Compositeur'}\n\n${msg.content}\n\n`;
        } else {
            markdown += `### 🎵 ${data.composer.name}\n\n${msg.content}\n\n`;
        }
    });

    markdown += `\n---\n\n*Exporté depuis CompositeursGPT le ${new Date().toLocaleString()}*\n`;

    downloadFile(markdown, `${data.filename}.md`, 'text/markdown');
}

function exportAsPdf() {
    const data = getExportData();
    if (!data) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(data.title, margin, y);
    y += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // Line separator
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;

    // Summary if exists
    if (data.summary) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        doc.text('Résumé', margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const summaryLines = doc.splitTextToSize(data.summary, maxWidth);
        summaryLines.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
        });

        y += 5;
        doc.line(margin, y, 190, y);
        y += 10;
    }

    // Messages
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('Messages', margin, y);
    y += 10;

    data.messages.forEach((msg, index) => {
        let author = '';
        if (msg.role === 'user') {
            author = 'Vous';
        } else if (data.isGroup && msg.composerId) {
            const composer = COMPOSERS.find(c => c.id === msg.composerId);
            author = composer?.name || 'Compositeur';
        } else {
            author = data.composer.name;
        }

        // Check if we need a new page
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }

        // Author
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text(author, margin, y);
        y += 6;

        // Message content
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0);
        const contentLines = doc.splitTextToSize(msg.content, maxWidth);
        contentLines.forEach(line => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
        });

        y += 8;
    });

    // Footer on last page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `CompositeursGPT - Page ${i}/${totalPages}`,
            margin,
            pageHeight - 10
        );
    }

    doc.save(`${data.filename}.pdf`);
}

function exportAsTxt() {
    const data = getExportData();
    if (!data) return;

    let text = `${data.title}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    text += '═'.repeat(60) + '\n\n';

    if (data.summary) {
        text += `RÉSUMÉ DE LA CONVERSATION:\n${data.summary}\n\n`;
        text += '═'.repeat(60) + '\n\n';
    }

    data.messages.forEach(msg => {
        if (msg.role === 'user') {
            text += `VOUS:\n${msg.content}\n\n`;
        } else if (data.isGroup && msg.composerId) {
            const composer = COMPOSERS.find(c => c.id === msg.composerId);
            text += `${composer?.name || 'Compositeur'}:\n${msg.content}\n\n`;
        } else {
            text += `${data.composer.name}:\n${msg.content}\n\n`;
        }
    });

    text += `\n---\nExporté depuis CompositeursGPT le ${new Date().toLocaleString()}\n`;

    downloadFile(text, `${data.filename}.txt`, 'text/plain');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// ============================================
// Composer Profile Modal
// ============================================

function openProfileModal() {
    if (!currentComposer) return;

    // Populate profile modal
    profileAvatar.innerHTML = `<img src="${currentComposer.image}" alt="${currentComposer.name}">`;
    profileName.textContent = currentComposer.name;
    profileDates.textContent = currentComposer.dates;

    // Add tags
    profileTags.innerHTML = currentComposer.tags
        .map(tag => `<span class="profile-tag">${tag}</span>`)
        .join('');

    // Add biography
    profileDescription.textContent = currentComposer.biography || currentComposer.description;

    // Show modal
    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    profileModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================
// Welcome Message
// ============================================
function showWelcomeMessage() {
    const welcomeHtml = `
        <div class="welcome-message">
            <h4>Bienvenue dans une conversation avec ${currentComposer.name}</h4>
            <p>Posez vos questions sur sa musique, sa vie, son époque...</p>
            <div class="suggestions">
                ${currentComposer.suggestions.map(s => `
                    <button class="suggestion">${s}</button>
                `).join('')}
            </div>
        </div>
    `;
    messages.innerHTML = welcomeHtml;
}

// ============================================
// Message Display
// ============================================
function generateMessageId() {
    return `msg-${Date.now()}-${messageIdCounter++}`;
}

function addMessage(role, content, messageId = null, replyToId = null, timestamp = null) {
    // Remove welcome message if present
    const welcome = messages.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    // Remove dynamic suggestions before adding new message
    removeDynamicSuggestions();

    const id = messageId || generateMessageId();
    const time = timestamp || new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.dataset.messageId = id;
    if (replyToId) {
        messageDiv.dataset.replyTo = replyToId;
        messageDiv.classList.add('has-reply-context');
    }


    // Build reply quote if replying to a message
    let replyQuoteHtml = '';
    if (replyToId) {
        const replyToMsg = conversationHistory.find(m => m.id === replyToId);
        if (replyToMsg) {
            const shortContent = replyToMsg.content.length > 80
                ? replyToMsg.content.substring(0, 80) + '...'
                : replyToMsg.content;
            const replyAuthor = replyToMsg.role === 'user' ? (navigator.language.startsWith('fr') ? 'Vous' : 'You') : currentComposer?.name || 'Composer';
            replyQuoteHtml = `
                <div class="reply-quote" data-reply-target="${replyToId}">
                    <span class="reply-author">${replyAuthor}</span>
                    <span class="reply-text">${shortContent}</span>
                </div>
            `;
        }
    }

    messageDiv.innerHTML = `
        <div class="message-content">
            ${replyQuoteHtml}
            <div class="message-text">${formatMessage(content)}</div>
            <div class="message-footer">
                <button class="reply-btn" data-msg-id="${id}" data-msg-role="${role}" aria-label="Répondre">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 14l-5-5 5-5M4 9h10.5a5.5 5.5 0 015.5 5.5v0a5.5 5.5 0 01-5.5 5.5H11"/>
                    </svg>
                    Répondre
                </button>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;

    messages.appendChild(messageDiv);
    scrollToBottom();

    return id;
}

function formatMessage(content) {
    // Mapping des actions vers des emojis
    const actionToEmoji = {
        'rire': '😄', 'laugh': '😄',
        'sourire': '😊', 'smile': '😊', 'sourit': '😊',
        'soupir': '😮‍💨', 'sigh': '😮‍💨', 'soupire': '😮‍💨',
        'enthousiaste': '😃', 'enthusiastic': '😃',
        'coup de tête': '🙂', 'nod': '🙂',
        'hochement de tête': '🙂', 'hochement': '🙂', 'hoche la tête': '🙂',
        'applaudit': '👏', 'applaud': '👏', 'applaudissement': '👏',
        'réfléchit': '🤔', 'think': '🤔', 'pense': '🤔', 'pensif': '🤔', 'thoughtful': '🤔',
        'clin d\'œil': '😉', 'wink': '😉',
        'surprise': '😲', 'surprised': '😲', 'étonné': '😲',
        'tristesse': '😢', 'sad': '😢', 'triste': '😢', 'pleure': '😢', 'cry': '😢',
        'émerveillé': '😍', 'amazed': '😍', 'émerveillement': '😍',
        'joie': '😊', 'joy': '😊', 'joyeux': '😊',
        'excité': '🤩', 'excited': '🤩', 'excitation': '🤩',
        'passionné': '🔥', 'passionate': '🔥', 'passion': '🔥',
        'nostalgique': '🥲', 'nostalgic': '🥲', 'nostalgie': '🥲',
        'mélancolique': '😔', 'melancholy': '😔', 'mélancolie': '😔',
        'concentration': '🎯', 'concentrated': '🎯', 'concentré': '🎯',
        'regard': '👀', 'look': '👀', 'regarde': '👀', 'observe': '👀',
        'inspiré': '✨', 'inspired': '✨', 'inspiration': '✨'
    };

    // Remplacer les actions entre astérisques par des emojis
    let formatted = content.replace(/\*([^*]+)\*/g, (_, action) => {
        const actionLower = action.toLowerCase().trim();

        // Chercher un emoji correspondant
        for (const [key, emoji] of Object.entries(actionToEmoji)) {
            if (actionLower.includes(key)) {
                return emoji;
            }
        }

        // Si pas de correspondance, supprimer l'action
        return '';
    });

    // Nettoyer les espaces multiples
    formatted = formatted.replace(/\s{2,}/g, ' ').trim();

    // Remplacer les retours à la ligne par <br>
    return formatted.replace(/\n/g, '<br>');
}

// ============================================
// Thread/Reply System
// ============================================

function selectMessageForReply(id, content, role) {
    // Clear previous selection
    document.querySelectorAll('.message.reply-selected').forEach(el => {
        el.classList.remove('reply-selected');
    });

    // Set the reply target
    replyToMessage = { id, content, role };

    // Highlight selected message
    const messageEl = document.querySelector(`[data-message-id="${id}"]`);
    if (messageEl) {
        messageEl.classList.add('reply-selected');
    }

    // Show reply indicator
    showReplyIndicator();

    // Focus input
    userInput.focus();
}

function showReplyIndicator() {
    // Remove existing indicator
    hideReplyIndicator();

    if (!replyToMessage) return;

    const shortContent = replyToMessage.content.length > 60
        ? replyToMessage.content.substring(0, 60) + '...'
        : replyToMessage.content;

    const author = replyToMessage.role === 'user' ? (navigator.language.startsWith('fr') ? 'Vous' : 'You') : (currentComposer?.name || 'Composer');

    const indicator = document.createElement('div');
    indicator.className = 'reply-indicator';
    indicator.innerHTML = `
        <div class="reply-indicator-content">
            <span class="reply-indicator-icon">↩</span>
            <div class="reply-indicator-text">
                <span class="reply-indicator-author">${navigator.language.startsWith('fr') ? 'Réponse à' : 'Replying to'} ${author}</span>
                <span class="reply-indicator-preview">${shortContent}</span>
            </div>
        </div>
        <button class="reply-indicator-cancel" aria-label="Annuler la réponse">✕</button>
    `;

    // Insert before input wrapper
    const inputArea = document.querySelector('.input-area');
    const inputWrapper = document.querySelector('.input-wrapper');
    inputArea.insertBefore(indicator, inputWrapper);

    // Cancel button handler
    indicator.querySelector('.reply-indicator-cancel').addEventListener('click', cancelReply);
}

function hideReplyIndicator() {
    const indicator = document.querySelector('.reply-indicator');
    if (indicator) indicator.remove();
}

function cancelReply() {
    // Clear selection highlight
    document.querySelectorAll('.message.reply-selected').forEach(el => {
        el.classList.remove('reply-selected');
    });

    replyToMessage = null;
    hideReplyIndicator();
}

function scrollToMessage(messageId) {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageEl.classList.add('highlight-flash');
        setTimeout(() => messageEl.classList.remove('highlight-flash'), 1500);
    }
}

// ============================================
// Dynamic Suggestions
// ============================================

/**
 * Parse les suggestions du contenu de la réponse
 * Format attendu: [SUGGESTIONS: "Q1?" | "Q2?" | "Q3?"]
 */
function parseSuggestions(content) {
    const regex = /\[SUGGESTIONS:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\]/i;
    const match = content.match(regex);

    if (match) {
        return {
            cleanContent: content.replace(regex, '').trim(),
            suggestions: [match[1], match[2], match[3]]
        };
    }

    return { cleanContent: content, suggestions: [] };
}

/**
 * Affiche les suggestions dynamiques après la réponse
 */
function showDynamicSuggestions(suggestions) {
    // Supprimer les anciennes suggestions dynamiques
    const existingSuggestions = messages.querySelector('.dynamic-suggestions');
    if (existingSuggestions) existingSuggestions.remove();

    if (suggestions.length === 0) return;

    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'dynamic-suggestions';
    suggestionsDiv.innerHTML = `
        <div class="suggestions">
            ${suggestions.map(s => `<button class="suggestion">${s}</button>`).join('')}
        </div>
    `;

    messages.appendChild(suggestionsDiv);
    scrollToBottom();
}

/**
 * Supprime les suggestions dynamiques (appelé avant d'ajouter un nouveau message)
 */
function removeDynamicSuggestions() {
    const existingSuggestions = messages.querySelector('.dynamic-suggestions');
    if (existingSuggestions) existingSuggestions.remove();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
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

function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============================================
// Sidebar Preview Update
// ============================================
function updateSidebarPreview() {
    renderComposerList();
}

function updateComposerPreview(composerId) {
    renderComposerList();
}
