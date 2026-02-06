// ============================================
// CompositeursGPT — Audio Recording Functions
// ============================================

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendAudioToTranscription(audioBlob);

            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        updateMicUI();
    } catch (error) {
        console.error('Microphone access error:', error);
        alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        updateMicUI();
    }
}

function updateMicUI() {
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.classList.toggle('recording', isRecording);
    }
}

async function sendAudioToTranscription(blob) {
    if (isLoading) return;

    isLoading = true;
    showTypingIndicator(); // Show indicator while transcribing

    try {
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');
        // Optionnel: On peut passer la langue de l'utilisateur si on la connaît
        // formData.append('language', navigator.language.split('-')[0]);

        const url = CONFIG.MODE === 'worker' ? CONFIG.WORKER_URL : 'https://api.groq.com/openai/v1/audio/transcriptions';
        const headers = {};

        if (CONFIG.MODE === 'direct') {
            const apiKey = localStorage.getItem('groq_api_key');
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const data = await response.json();
        removeTypingIndicator();

        if (data.text && data.text.trim().length > 0) {
            userInput.value = data.text;
            userInput.dispatchEvent(new Event('input')); // Trigger auto-resize

            // Envoyer automatiquement le message
            await sendMessage();
        } else {
            console.warn('Transcription vide ou erreur:', data);
        }

    } catch (error) {
        removeTypingIndicator();
        console.error('Transcription error:', error);
        alert('Erreur lors de la transcription vocale.');
    } finally {
        isLoading = false;
    }
}
