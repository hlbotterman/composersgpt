// ============================================
// CompositeursGPT — File Upload Functions
// ============================================

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input
    event.target.value = '';

    isLoading = true;
    showTypingIndicator();

    try {
        let content = '';
        if (file.type === 'application/pdf') {
            content = await extractTextFromPDF(file);
        } else {
            // Assume text-based for others (txt, md, js, etc.)
            content = await file.text();
        }

        if (content && content.trim()) {
            attachedFile = {
                name: file.name,
                content: content,
                type: file.type
            };
            updateAttachmentUI();
        } else {
            alert('Impossible d\'extraire du texte de ce fichier.');
        }
    } catch (error) {
        console.error('File processing error:', error);
        alert('Erreur lors de la lecture du fichier.');
    } finally {
        isLoading = false;
        removeTypingIndicator();
    }
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

function updateAttachmentUI() {
    const preview = document.getElementById('attachmentPreview');
    if (!preview) return;

    if (attachedFile) {
        preview.innerHTML = `
            <div class="file-chip">
                <span>📄 ${attachedFile.name}</span>
                <button class="remove-file" onclick="removeAttachedFile()">×</button>
            </div>
        `;
        preview.classList.remove('hidden');
    } else {
        preview.innerHTML = '';
        preview.classList.add('hidden');
    }
}

function removeAttachedFile() {
    attachedFile = null;
    updateAttachmentUI();
}
