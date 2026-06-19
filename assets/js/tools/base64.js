/* DEVFORGES BASE64 ENCODER/DECODER UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    const modeSelect = document.getElementById('ctrl-base64-mode');
    const dropzone = document.getElementById('tool-file-dropzone');
    const fileInput = document.getElementById('file-input-hidden');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');

    const STORAGE_KEY = 'devforge_base64_input';
    const SAMPLE_TEXT = 'DEVFORGES - Developer Tools. Reimagined.';

    // Load initial storage state
    const cached = localStorage.getItem(STORAGE_KEY);
    inputArea.value = cached !== null ? cached : SAMPLE_TEXT;

    // Listeners
    inputArea.addEventListener('input', () => {
        localStorage.setItem(STORAGE_KEY, inputArea.value);
        runBase64();
    });

    modeSelect.addEventListener('change', () => {
        const mode = modeSelect.value;
        if (mode === 'file-encode') {
            inputArea.style.display = 'none';
            dropzone.style.display = 'flex';
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting file drag & drop...</span>';
        } else {
            inputArea.style.display = 'block';
            dropzone.style.display = 'none';
            runBase64();
        }
    });

    // File Dropzone Listeners
    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = function() {
        if (this.files.length) handleFiles(this.files);
    };

    dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent)';
        dropzone.style.background = 'rgba(var(--glow-color), 0.04)';
    };

    dropzone.ondragleave = () => {
        dropzone.style.borderColor = 'var(--border-primary)';
        dropzone.style.background = 'rgba(0,0,0,0.15)';
    };

    dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-primary)';
        dropzone.style.background = 'rgba(0,0,0,0.15)';
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    };

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting input...</span>';
        document.getElementById('dropzone-title').textContent = 'Drag & drop file here';
        document.getElementById('dropzone-subtitle').textContent = 'or click to browse local files';
    };

    sampleBtn.onclick = () => {
        modeSelect.value = 'encode';
        inputArea.style.display = 'block';
        dropzone.style.display = 'none';
        inputArea.value = SAMPLE_TEXT;
        localStorage.setItem(STORAGE_KEY, SAMPLE_TEXT);
        runBase64();
    };

    copyBtn.onclick = () => {
        const text = outputArea.innerText;
        if (!text || text.startsWith('❌') || text.startsWith('Awaiting') || text.includes('Successfully')) {
            alert('No text content to copy.');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Copied!
            `;
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1500);
        });
    };

    function handleFiles(files) {
        const file = files[0];
        const reader = new FileReader();
        
        document.getElementById('dropzone-title').textContent = `Reading: ${file.name}`;
        document.getElementById('dropzone-subtitle').textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;

        reader.onload = (e) => {
            const result = e.target.result;
            const base64Str = result.split(',')[1] || result;
            
            document.getElementById('dropzone-title').textContent = `Loaded: ${file.name}`;
            document.getElementById('dropzone-subtitle').textContent = `Base64 string successfully extracted!`;
            
            outputArea.innerText = base64Str;
        };

        reader.onerror = () => {
            alert('Failed to read file.');
            document.getElementById('dropzone-title').textContent = 'Drag & drop file here';
            document.getElementById('dropzone-subtitle').textContent = 'or click to browse local files';
        };

        reader.readAsDataURL(file);
    }

    function runBase64() {
        const val = inputArea.value;
        const mode = modeSelect.value;

        if (!val.trim() && mode !== 'file-encode') {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting input...</span>';
            return;
        }

        try {
            if (mode === 'encode') {
                const encoded = btoa(unescape(encodeURIComponent(val)));
                outputArea.innerText = encoded;
            } else if (mode === 'decode') {
                const decoded = decodeURIComponent(escape(atob(val.trim())));
                outputArea.innerText = decoded;
            } else if (mode === 'file-decode') {
                // Decode Base64 string to a download link
                const cleaned = val.trim().replace(/\s/g, '');
                let mime = 'application/octet-stream';
                let binaryStr;
                
                if (cleaned.startsWith('data:')) {
                    const parts = cleaned.split(';base64,');
                    mime = parts[0].substring(5);
                    binaryStr = atob(parts[1]);
                } else {
                    binaryStr = atob(cleaned);
                    mime = guessMimeTypeFromBase64(cleaned);
                }
                
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], {type: mime});
                const url = URL.createObjectURL(blob);
                const extension = mime.split('/')[1] || 'bin';
                
                outputArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; height:100%;">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--accent)" style="margin-bottom: 16px;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        <div style="font-weight:600; font-size:1rem; margin-bottom: 6px; color:var(--text-primary);">File Decoded Successfully</div>
                        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">
                            MIME Type: <code>${mime}</code><br>
                            Estimated Size: <code>${(blob.size / 1024).toFixed(2)} KB</code>
                        </div>
                        <a class="btn btn-primary" href="${url}" download="decoded-file.${extension}" style="text-decoration:none;">Download File</a>
                    </div>
                `;
            }
        } catch (err) {
            outputArea.innerHTML = `<span style="color: #ef4444; font-weight:600;">❌ Conversion Error:</span>\n<span style="color: var(--text-secondary);">${escapeHtml(err.message)}</span>`;
        }
    }

    function guessMimeTypeFromBase64(b64) {
        const header = b64.substring(0, 16);
        if (header.startsWith('iVBORw0KGgo')) return 'image/png';
        if (header.startsWith('/9j/')) return 'image/jpeg';
        if (header.startsWith('R0lGOD')) return 'image/gif';
        if (header.startsWith('U1BERg')) return 'application/pdf';
        if (header.startsWith('UEsDBB')) return 'application/zip';
        if (header.startsWith('MZ')) return 'application/x-msdownload';
        return 'application/octet-stream';
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Trigger on start
    runBase64();
});
