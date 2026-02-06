// ============================================
// CompositeursGPT — Composer Functions
// ============================================

// ============================================
// Render Composer List (Sidebar)
// ============================================
function renderComposerList(filterText = '') {
    const conversations = getAllConversations();
    const query = filterText.toLowerCase().trim();

    composerList.innerHTML = [...COMPOSERS]
        .map(composer => {
            const conversation = conversations[composer.id];
            const history = Array.isArray(conversation) ? conversation : (conversation?.history || []);

            // Robust lastUpdated
            let lastUpdated = 0;
            if (conversation && !Array.isArray(conversation) && conversation.lastUpdated) {
                lastUpdated = conversation.lastUpdated;
            } else if (history.length > 0) {
                // For old data, use a fallback (e.g., 0 or try to infer from timestamp if it were possible)
                lastUpdated = history[history.length - 1].date || 0;
            }

            return {
                ...composer,
                lastUpdated,
                history,
                unreadCount: (!Array.isArray(conversation) ? conversation?.unreadCount : 0) || 0
            };
        })
        .filter(composer => {
            // Si pas de discussion, ne rien mettre (sauf si on fait une recherche explicite)
            if (!query && composer.history.length === 0) return false;

            if (!query) return true;

            // Search in name and tags
            const matchesProfile = composer.name.toLowerCase().includes(query) ||
                                composer.tags.some(tag => tag.toLowerCase().includes(query));
            if (matchesProfile) return true;

            // Search in conversation history
            return composer.history.some(msg => msg.content.toLowerCase().includes(query));
        })
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .map(composer => {
        const history = composer.history;
        const lastMessage = history.length > 0 ? history[history.length - 1] : null;

        // Teams-style preview
        const preview = lastMessage
            ? lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
            : '';
        const timestamp = lastMessage ? (lastMessage.timestamp || '') : '';

        const isActive = currentComposer && currentComposer.id === composer.id;
        const isUnread = composer.unreadCount > 0 && !isActive;

        const groupModeClass = conversationMode === 'group' ? 'group-mode' : '';
        const isSelected = conversationMode === 'group' && selectedComposers.some(c => c.id === composer.id);
        const selectedClass = isSelected ? 'selected' : '';
        const unreadClass = isUnread ? 'unread' : '';
        const selectionIndex = selectedComposers.findIndex(c => c.id === composer.id);

        return `
            <div class="composer-item ${isActive ? 'active' : ''} ${groupModeClass} ${selectedClass} ${unreadClass}" data-id="${composer.id}">
                ${conversationMode === 'group' ? `
                    <div class="selection-indicator">
                        ${isSelected ? `<span class="selection-number">${selectionIndex + 1}</span>` : ''}
                    </div>
                ` : ''}
                <div class="composer-avatar"><img src="${composer.image}" alt="${composer.name}"></div>
                <div class="composer-item-info">
                    <div class="composer-item-top">
                        <span class="composer-item-name">${composer.name}</span>
                        <span class="composer-item-time">${timestamp}</span>
                    </div>
                    <div class="composer-item-bottom">
                        <div class="composer-item-preview">${preview}</div>
                        ${isUnread ? `<div class="unread-badge">${composer.unreadCount}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Composer selection in sidebar
    composerList.addEventListener('click', (e) => {
        const item = e.target.closest('.composer-item');
        if (item) {
            if (conversationMode === 'group') {
                toggleComposerSelection(item.dataset.id);
            } else {
                selectComposer(item.dataset.id);
            }
        }
    });

    // Mode toggle (Solo/Group)
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.mode-btn');
            if (btn) {
                setConversationMode(btn.dataset.mode);
            }
        });
    }

    // Start group conversation button
    const startGroupBtn = document.getElementById('startGroupBtn');
    if (startGroupBtn) {
        startGroupBtn.addEventListener('click', startGroupConversation);
    }

    // Back button (mobile only)
    backBtn.addEventListener('click', goBack);

    // Send message
    sendBtn.addEventListener('click', sendMessage);

    // Enter to send (Shift+Enter for new line)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    });

    // Search composer
    const composerSearch = document.getElementById('composerSearch');
    if (composerSearch) {
        composerSearch.addEventListener('input', (e) => {
            renderComposerList(e.target.value);
        });
    }

    // Summary toggle
    summaryToggle.addEventListener('click', toggleSummary);
    summaryClose.addEventListener('click', () => {
        summaryPanel.classList.add('hidden');
        summaryToggle.classList.remove('active');
    });

    // Menu toggle
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdownMenu();
    });

    // Export conversation - Multiple formats
    const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportTxtBtn = document.getElementById('exportTxtBtn');

    if (exportMarkdownBtn) {
        exportMarkdownBtn.addEventListener('click', () => {
            closeDropdownMenu();
            exportAsMarkdown();
        });
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            closeDropdownMenu();
            exportAsPdf();
        });
    }

    if (exportTxtBtn) {
        exportTxtBtn.addEventListener('click', () => {
            closeDropdownMenu();
            exportAsTxt();
        });
    }

    // Clear conversation
    clearConversationBtn.addEventListener('click', () => {
        closeDropdownMenu();
        clearConversation();
    });

    // Profile modal
    currentAvatar.addEventListener('click', openProfileModal);
    profileClose.addEventListener('click', closeProfileModal);
    profileOverlay.addEventListener('click', closeProfileModal);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdownMenu();
        }
    });

    // Handle suggestion clicks (using event delegation)
    messages.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion')) {
            userInput.value = e.target.textContent;
            sendMessage();
        }

        // Handle reply quote clicks - scroll to original message
        const replyQuote = e.target.closest('.reply-quote');
        if (replyQuote) {
            const targetId = replyQuote.dataset.replyTarget;
            if (targetId) {
                scrollToMessage(targetId);
            }
        }

        // Handle reply button clicks
        const replyBtn = e.target.closest('.reply-btn');
        if (replyBtn) {
            const id = replyBtn.dataset.msgId;
            const role = replyBtn.dataset.msgRole;
            // Look up message content from history
            let content = '';
            const historyToSearch = conversationMode === 'group' ? groupConversationHistory : conversationHistory;
            const msg = historyToSearch.find(m => m.id === id);
            if (msg) {
                content = msg.content;
            }
            selectMessageForReply(id, content, role);
        }
    });

    // New Chat Modal listeners
    if (newChatBtn) {
        newChatBtn.addEventListener('click', openNewChatModal);
    }
    if (closeNewChat) {
        closeNewChat.addEventListener('click', closeNewChatModal);
    }
    if (newChatSearchInput) {
        newChatSearchInput.addEventListener('input', (e) => {
            renderModalComposerList(e.target.value);
        });
    }

    // Modal composer selection
    modalComposerList.addEventListener('click', (e) => {
        const item = e.target.closest('.modal-composer-item');
        if (item) {
            selectComposer(item.dataset.id);
            closeNewChatModal();
        }
    });

    frequentList.addEventListener('click', (e) => {
        const item = e.target.closest('.modal-composer-item');
        if (item) {
            selectComposer(item.dataset.id);
            closeNewChatModal();
        }
    });

    // Close modal on Escape or overlay click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeNewChatModal();
        }
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeNewChatModal();
        }
    });

    // Microphone button
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.addEventListener('click', toggleRecording);
    }

    // Attachment buttons
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// Composer Selection
// ============================================
function selectComposer(id) {
    const composer = COMPOSERS.find(c => c.id === id);
    if (!composer) return;

    currentComposer = composer;

    // Mark as read
    const conversation = getConversation(id);
    conversationHistory = conversation.history;
    saveConversation(id, conversationHistory, conversation.summary, true);

    // Close summary panel if open
    summaryPanel.classList.add('hidden');
    summaryToggle.classList.remove('active');

    // Update header
    currentAvatar.innerHTML = `<img src="${currentComposer.image}" alt="${currentComposer.name}">`;
    currentName.textContent = currentComposer.name;
    currentDates.textContent = currentComposer.dates;

    // Render messages
    messages.innerHTML = '';
    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            addMessage(msg.role, msg.content, msg.id || null, msg.replyToId || null, msg.timestamp || null);
        });
    } else {
        showWelcomeMessage();
    }

    // Switch views
    emptyState.classList.add('hidden');
    chatSection.classList.remove('hidden');

    // Update summary display
    updateSummaryDisplay();

    // On mobile, hide sidebar
    sidebar.classList.add('sidebar-hidden');

    // Update active state in sidebar
    renderComposerList();

    // Focus input
    userInput.focus();
    scrollToBottom();
}

// ============================================
// New Discussion Modal Logic
// ============================================
function openNewChatModal() {
    modalOverlay.classList.remove('hidden');
    newChatSearchInput.value = '';
    renderFrequentComposers();
    renderModalComposerList();
    newChatSearchInput.focus();
}

function closeNewChatModal() {
    modalOverlay.classList.add('hidden');
}

function getMostFrequentComposers() {
    const conversations = getAllConversations();
    const stats = COMPOSERS.map(composer => {
        const conv = conversations[composer.id];
        const history = Array.isArray(conv) ? conv : (conv?.history || []);
        return { id: composer.id, count: history.length };
    });

    // Sort by message count and take top 2
    return stats
        .filter(s => s.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map(s => COMPOSERS.find(c => c.id === s.id));
}

function renderFrequentComposers() {
    const frequent = getMostFrequentComposers();
    const section = document.getElementById('frequentSection');

    if (frequent.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    frequentList.innerHTML = frequent.map(c => renderModalItem(c)).join('');
}

function renderModalComposerList(filterText = '') {
    const query = filterText.toLowerCase().trim();
    modalComposerList.innerHTML = COMPOSERS
        .filter(c => {
            if (!query) return true;
            return c.name.toLowerCase().includes(query) ||
                   c.tags.some(tag => tag.toLowerCase().includes(query));
        })
        .map(c => renderModalItem(c))
        .join('');
}

function renderModalItem(composer) {
    return `
        <div class="modal-composer-item" data-id="${composer.id}">
            <div class="modal-composer-avatar">
                <img src="${composer.image}" alt="${composer.name}">
            </div>
            <div class="modal-composer-info">
                <span class="modal-composer-name">${composer.name}</span>
                <span class="modal-composer-desc">${composer.description}</span>
            </div>
        </div>
    `;
}

function goBack() {
    // On mobile, show sidebar again
    sidebar.classList.remove('sidebar-hidden');
    chatSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
    currentComposer = null;
    renderComposerList();
}
