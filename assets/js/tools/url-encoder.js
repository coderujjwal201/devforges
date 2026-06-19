/* DEVFORGES URL ENCODER/DECODER UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    const modeSelect = document.getElementById('ctrl-url-mode');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');

    const STORAGE_INPUT_KEY = 'devforge_url_input';
    const STORAGE_MODE_KEY = 'devforge_url_mode';

    const SAMPLE_URL = 'https://devforges.netlify.app/search?q=JSON+Formatter&lang=en&ref=github&sandbox=true';

    // Load initial storage states
    inputArea.value = localStorage.getItem(STORAGE_INPUT_KEY) !== null ? localStorage.getItem(STORAGE_INPUT_KEY) : SAMPLE_URL;
    modeSelect.value = localStorage.getItem(STORAGE_MODE_KEY) !== null ? localStorage.getItem(STORAGE_MODE_KEY) : 'decode';

    // Listeners
    const triggerUpdate = () => {
        localStorage.setItem(STORAGE_INPUT_KEY, inputArea.value);
        localStorage.setItem(STORAGE_MODE_KEY, modeSelect.value);
        runUrlTool();
    };

    inputArea.addEventListener('input', triggerUpdate);
    modeSelect.addEventListener('change', triggerUpdate);

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_INPUT_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting URL input...</span>';
    };

    sampleBtn.onclick = () => {
        inputArea.value = SAMPLE_URL;
        modeSelect.value = 'decode';
        triggerUpdate();
    };

    copyBtn.onclick = () => {
        // Copy processed URL or text
        let text = '';
        if (modeSelect.value === 'encode') {
            text = outputArea.innerText;
        } else {
            // Find decoded URL line
            const header = outputArea.querySelector('div[style*="font-weight: 500"]');
            text = header ? header.textContent : inputArea.value;
        }
        if (!text || text.startsWith('❌') || text.startsWith('Awaiting')) {
            alert('Nothing to copy.');
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

    // Table rebuild handlers
    window.rebuildUrlFromParams = function() {
        const rows = document.querySelectorAll('.url-param-row');
        const params = new URLSearchParams();
        
        rows.forEach(row => {
            const key = row.querySelector('.url-param-key').value;
            const val = row.querySelector('.url-param-val').value;
            if (key) {
                params.append(key, val);
            }
        });

        const rawUrl = inputArea.value.trim();
        try {
            const urlObj = new URL(rawUrl.includes('://') ? rawUrl : 'https://dummy.org/' + rawUrl);
            urlObj.search = params.toString();
            
            // Extract the relative path back if it was a dummy URL
            let updatedVal = urlObj.toString();
            if (updatedVal.startsWith('https://dummy.org/')) {
                updatedVal = updatedVal.substring(18);
            }
            
            inputArea.value = updatedVal;
            localStorage.setItem(STORAGE_INPUT_KEY, updatedVal);
            
            // Re-render display header without refreshing inputs
            const headerEl = outputArea.querySelector('div[style*="font-weight: 500"]');
            if (headerEl) {
                headerEl.textContent = decodeURIComponent(updatedVal);
            }
        } catch (e) {
            // fallback if input is not a full URL structure
            const newQuery = params.toString();
            const qMarkIndex = rawUrl.indexOf('?');
            let updatedVal = rawUrl;
            if (qMarkIndex > -1) {
                updatedVal = rawUrl.substring(0, qMarkIndex) + (newQuery ? '?' + newQuery : '');
            } else {
                updatedVal = rawUrl + (newQuery ? '?' + newQuery : '');
            }
            inputArea.value = updatedVal;
            localStorage.setItem(STORAGE_INPUT_KEY, updatedVal);
            const headerEl = outputArea.querySelector('div[style*="font-weight: 500"]');
            if (headerEl) {
                headerEl.textContent = decodeURIComponent(updatedVal);
            }
        }
    };

    window.deleteUrlParam = function(btn) {
        btn.closest('tr').remove();
        window.rebuildUrlFromParams();
        runUrlTool(); // Redraw UI structures
    };

    window.addUrlParam = function() {
        const tbody = document.querySelector('#url-params-table-el tbody');
        if (!tbody) return;
        
        const tr = document.createElement('tr');
        tr.className = 'url-param-row';
        tr.innerHTML = `
            <td><input type="text" class="form-input url-param-key" value="" style="padding:4px 8px; width:100%; border:none; background:transparent;" oninput="window.rebuildUrlFromParams()"></td>
            <td><input type="text" class="form-input url-param-val" value="" style="padding:4px 8px; width:100%; border:none; background:transparent;" oninput="window.rebuildUrlFromParams()"></td>
            <td style="text-align: center;"><button class="workspace-btn" onclick="window.deleteUrlParam(this)" style="padding:4px 8px; color: #ef4444;">&times;</button></td>
        `;
        tbody.appendChild(tr);
    };

    window.addFirstUrlParam = function() {
        const rawUrl = inputArea.value.trim();
        inputArea.value = rawUrl + (rawUrl.includes('?') ? '&new_param=' : '?new_param=');
        triggerUpdate();
    };

    function runUrlTool() {
        const val = inputArea.value.trim();
        const mode = modeSelect.value;

        if (!val) {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting URL input...</span>';
            return;
        }

        try {
            if (mode === 'encode') {
                const encoded = encodeURIComponent(val);
                outputArea.innerHTML = `<div style="word-break: break-all; line-height: 1.6;">${encoded}</div>`;
            } else {
                const decoded = decodeURIComponent(val);
                let paramsHTML = '';
                
                // Safely parse parameters
                const urlObj = new URL(decoded.includes('://') ? decoded : 'https://dummy.org/' + decoded);
                const params = new URLSearchParams(urlObj.search);
                
                if (params.toString() || val.includes('?')) {
                    let paramRows = '';
                    params.forEach((v, k) => {
                        paramRows += `
                            <tr class="url-param-row">
                                <td><input type="text" class="form-input url-param-key" value="${escapeHtml(k)}" style="padding:4px 8px; width:100%; border:none; background:transparent;" oninput="window.rebuildUrlFromParams()"></td>
                                <td><input type="text" class="form-input url-param-val" value="${escapeHtml(v)}" style="padding:4px 8px; width:100%; border:none; background:transparent;" oninput="window.rebuildUrlFromParams()"></td>
                                <td style="text-align: center;"><button class="workspace-btn" onclick="window.deleteUrlParam(this)" style="padding:4px 8px; color: #ef4444;">&times;</button></td>
                            </tr>
                        `;
                    });
                    
                    paramsHTML = `
                        <table class="url-params-table" id="url-params-table-el">
                            <thead>
                                <tr><th>Parameter Key</th><th>Value</th><th style="width:40px; text-align:center;">Action</th></tr>
                            </thead>
                            <tbody>
                                ${paramRows}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="padding: 8px;">
                                        <button class="workspace-btn" onclick="window.addUrlParam()" style="width:100%; justify-content:center; border: 1px dashed var(--border-primary); padding: 6px;">+ Add Query Parameter</button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    `;
                } else {
                    paramsHTML = `
                        <div style="color: var(--text-muted); margin-top: 10px;">No query parameters detected in URL.</div>
                        <button class="workspace-btn" onclick="window.addFirstUrlParam()" style="margin-top:12px; border: 1px dashed var(--border-primary); padding: 6px; width:100%; justify-content:center;">+ Initialize Query Parameters</button>
                    `;
                }
                
                outputArea.innerHTML = `
                    <div style="word-break: break-all; margin-bottom:12px; font-weight: 500; color: var(--text-primary);">${escapeHtml(decoded)}</div>
                    ${paramsHTML}
                `;
            }
        } catch (err) {
            outputArea.innerHTML = `<span style="color: #ef4444; font-weight:600;">❌ Extraction Error:</span>\n<span style="color: var(--text-secondary);">${escapeHtml(err.message)}</span>`;
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Trigger format on init
    runUrlTool();
});
