/* DEVFORGES JSON FORMATTER UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    const spaceSelect = document.getElementById('ctrl-json-space');
    const modeSelect = document.getElementById('ctrl-json-mode');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');
    const validateStatus = document.getElementById('validate-status');

    const STORAGE_KEY = 'devforge_json_input';
    const SAMPLE_JSON = `{
  "status": "success",
  "code": 200,
  "data": {
    "name": "Devforges Studio",
    "version": "2.4.0",
    "features": [
      "100% Client-Side Privacy",
      "Fast Local Calculation",
      "Zero Network Overhead"
    ],
    "sandbox": true,
    "metrics": {
      "execution_time_ms": 0.12,
      "cache_hits": 45
    }
  }
}`;

    // Load initial storage state
    const cached = localStorage.getItem(STORAGE_KEY);
    inputArea.value = cached !== null ? cached : SAMPLE_JSON;

    // Listeners
    inputArea.addEventListener('input', () => {
        localStorage.setItem(STORAGE_KEY, inputArea.value);
        runFormatter();
    });

    spaceSelect.addEventListener('change', runFormatter);
    modeSelect.addEventListener('change', runFormatter);

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting JSON input...</span>';
        updateStatus(null);
    };

    sampleBtn.onclick = () => {
        inputArea.value = SAMPLE_JSON;
        localStorage.setItem(STORAGE_KEY, SAMPLE_JSON);
        runFormatter();
    };

    copyBtn.onclick = () => {
        const text = outputArea.innerText;
        if (!text || text.startsWith('❌') || text.startsWith('Awaiting')) {
            alert('Nothing valid to copy.');
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

    // Hotkey bindings: Ctrl + Enter to re-format manually
    inputArea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runFormatter();
        }
    });

    function updateStatus(state, msg = '') {
        if (!validateStatus) return;
        if (state === 'valid') {
            validateStatus.className = 'badge';
            validateStatus.style.borderColor = '#22c55e';
            validateStatus.style.color = '#4ade80';
            validateStatus.textContent = 'Valid JSON';
        } else if (state === 'invalid') {
            validateStatus.className = 'badge';
            validateStatus.style.borderColor = '#ef4444';
            validateStatus.style.color = '#f87171';
            validateStatus.textContent = 'Invalid JSON';
        } else {
            validateStatus.className = 'badge';
            validateStatus.style.borderColor = 'var(--border-primary)';
            validateStatus.style.color = 'var(--text-muted)';
            validateStatus.textContent = 'Empty';
        }
    }

    function runFormatter() {
        const val = inputArea.value.trim();
        if (!val) {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting JSON input...</span>';
            updateStatus(null);
            return;
        }

        try {
            const parsed = JSON.parse(val);
            updateStatus('valid');

            const spacing = spaceSelect.value;
            const mode = modeSelect.value;

            if (spacing === 'minify') {
                const minified = JSON.stringify(parsed);
                if (mode === 'raw') {
                    outputArea.innerText = minified;
                } else {
                    renderTree(parsed);
                }
            } else {
                const indent = spacing === 'tab' ? '\t' : parseInt(spacing);
                const formatted = JSON.stringify(parsed, null, indent);
                if (mode === 'raw') {
                    outputArea.innerText = formatted;
                } else {
                    renderTree(parsed);
                }
            }
        } catch (err) {
            updateStatus('invalid');
            outputArea.innerHTML = `<span style="color: #ef4444; font-weight:600;">❌ JSON Parse Error:</span>\n<span style="color: var(--text-secondary);">${escapeHtml(err.message)}</span>`;
        }
    }

    function renderTree(obj) {
        outputArea.innerHTML = '';
        const treeList = document.createElement('ul');
        treeList.className = 'json-tree';
        treeList.appendChild(renderJsonTreeNode('ROOT', obj));
        outputArea.appendChild(treeList);
    }

    function renderJsonTreeNode(key, val) {
        const li = document.createElement('li');
        li.className = 'json-node';

        const hasKey = key !== '';
        let keySpan = '';
        if (hasKey) {
            keySpan = `<span class="json-key">"${escapeHtml(key)}"</span>: `;
        }

        if (val === null) {
            li.innerHTML = `${keySpan}<span class="json-value-null">null</span>`;
        } else if (typeof val === 'undefined') {
            li.innerHTML = `${keySpan}<span class="json-value-null">undefined</span>`;
        } else if (typeof val === 'boolean') {
            li.innerHTML = `${keySpan}<span class="json-value-boolean">${val}</span>`;
        } else if (typeof val === 'number') {
            li.innerHTML = `${keySpan}<span class="json-value-number">${val}</span>`;
        } else if (typeof val === 'string') {
            li.innerHTML = `${keySpan}<span class="json-value-string">"${escapeHtml(val)}"</span>`;
        } else if (Array.isArray(val)) {
            // Foldable Array
            const toggle = document.createElement('span');
            toggle.className = 'json-toggle';
            toggle.textContent = '▼';
            
            const label = document.createElement('span');
            label.innerHTML = `${keySpan}<span style="color: var(--text-muted);">Array[${val.length}]</span> [`;

            const childrenUl = document.createElement('ul');
            childrenUl.className = 'json-tree';
            val.forEach((item, index) => {
                childrenUl.appendChild(renderJsonTreeNode(index.toString(), item));
            });

            const closing = document.createElement('div');
            closing.innerHTML = `<span style="color: var(--text-muted); padding-left:14px;">]</span>`;

            toggle.onclick = () => {
                const collapsed = toggle.classList.toggle('collapsed');
                toggle.textContent = collapsed ? '▶' : '▼';
                childrenUl.style.display = collapsed ? 'none' : 'block';
            };

            li.appendChild(toggle);
            li.appendChild(label);
            li.appendChild(childrenUl);
            li.appendChild(closing);
        } else if (typeof val === 'object') {
            // Foldable Object
            const toggle = document.createElement('span');
            toggle.className = 'json-toggle';
            toggle.textContent = '▼';
            
            const label = document.createElement('span');
            label.innerHTML = `${keySpan}<span style="color: var(--text-muted);">{</span>`;

            const childrenUl = document.createElement('ul');
            childrenUl.className = 'json-tree';
            Object.entries(val).forEach(([k, v]) => {
                childrenUl.appendChild(renderJsonTreeNode(k, v));
            });

            const closing = document.createElement('div');
            closing.innerHTML = `<span style="color: var(--text-muted); padding-left:14px;">}</span>`;

            toggle.onclick = () => {
                const collapsed = toggle.classList.toggle('collapsed');
                toggle.textContent = collapsed ? '▶' : '▼';
                childrenUl.style.display = collapsed ? 'none' : 'block';
            };

            li.appendChild(toggle);
            li.appendChild(label);
            li.appendChild(childrenUl);
            li.appendChild(closing);
        }

        return li;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Trigger format on init
    runFormatter();
});
