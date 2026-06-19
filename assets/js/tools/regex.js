/* DEVFORGES REGEX TESTER UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    const patternInput = document.getElementById('ctrl-regex-pattern');
    const flagsInput = document.getElementById('ctrl-regex-flags');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');

    const STORAGE_INPUT_KEY = 'devforge_regex_input';
    const STORAGE_PATTERN_KEY = 'devforge_regex_pattern';
    const STORAGE_FLAGS_KEY = 'devforge_regex_flags';

    const SAMPLE_TEXT = 'Contact DEVFORGES engineering at support@devforges.netlify.app or sales@devforges.netlify.app to discover standalone desktop tool updates.';
    const SAMPLE_PATTERN = '([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4})';
    const SAMPLE_FLAGS = 'g';

    // Load initial storage states
    inputArea.value = localStorage.getItem(STORAGE_INPUT_KEY) !== null ? localStorage.getItem(STORAGE_INPUT_KEY) : SAMPLE_TEXT;
    patternInput.value = localStorage.getItem(STORAGE_PATTERN_KEY) !== null ? localStorage.getItem(STORAGE_PATTERN_KEY) : SAMPLE_PATTERN;
    flagsInput.value = localStorage.getItem(STORAGE_FLAGS_KEY) !== null ? localStorage.getItem(STORAGE_FLAGS_KEY) : SAMPLE_FLAGS;

    // Listeners
    const triggerUpdate = () => {
        localStorage.setItem(STORAGE_INPUT_KEY, inputArea.value);
        localStorage.setItem(STORAGE_PATTERN_KEY, patternInput.value);
        localStorage.setItem(STORAGE_FLAGS_KEY, flagsInput.value);
        runRegex();
    };

    inputArea.addEventListener('input', triggerUpdate);
    patternInput.addEventListener('input', triggerUpdate);
    flagsInput.addEventListener('input', triggerUpdate);

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_INPUT_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting text input...</span>';
    };

    sampleBtn.onclick = () => {
        inputArea.value = SAMPLE_TEXT;
        patternInput.value = SAMPLE_PATTERN;
        flagsInput.value = SAMPLE_FLAGS;
        triggerUpdate();
    };

    copyBtn.onclick = () => {
        // Copy list of matched text
        const matches = outputArea.querySelectorAll('td style*="color: var(--accent-bright)"');
        if (!matches.length) {
            alert('No matches found to copy.');
            return;
        }
        const text = Array.from(matches).map(el => el.textContent).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Copied Matches!
            `;
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1500);
        });
    };

    function runRegex() {
        const textVal = inputArea.value;
        const pattern = patternInput.value;
        const flags = flagsInput.value;

        if (!textVal.trim()) {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting text input...</span>';
            return;
        }
        if (!pattern) {
            outputArea.innerHTML = '<span style="color: #ef4444; font-weight:600;">⚠️ Please enter a regular expression pattern.</span>';
            return;
        }

        try {
            const regex = new RegExp(pattern, flags);
            const matches = [];
            let match;

            // Prevent infinite loops in case global flag is missing
            const safeRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

            let count = 0;
            while ((match = safeRegex.exec(textVal)) !== null && count < 100) {
                count++;
                matches.push({
                    index: match.index,
                    text: match[0],
                    groups: match.slice(1)
                });
                if (match.index === safeRegex.lastIndex) {
                    safeRegex.lastIndex++;
                }
            }

            if (matches.length === 0) {
                outputArea.innerHTML = '<div style="color: var(--text-muted);">No matches identified.</div>';
                return;
            }

            // Generate HTML highlight view
            let highlighted = '';
            let lastIndex = 0;
            const sortedMatches = [...matches].sort((a,b) => a.index - b.index);
            sortedMatches.forEach(m => {
                if (m.text.length === 0 || m.index < lastIndex) return;
                highlighted += escapeHtml(textVal.substring(lastIndex, m.index));
                highlighted += `<mark style="background: rgba(139, 92, 246, 0.35); color: var(--text-primary); padding: 2px 4px; border-radius: 4px; border-bottom: 2px solid var(--accent); font-weight: 500;">${escapeHtml(m.text)}</mark>`;
                lastIndex = m.index + m.text.length;
            });
            highlighted += escapeHtml(textVal.substring(lastIndex));

            // Generate Match details rows
            let rows = matches.map((m, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>Index: <code>${m.index}</code></td>
                    <td style="color: var(--accent-bright); font-weight: 600;">${escapeHtml(m.text)}</td>
                    <td>${m.groups.map(g => `<span class="badge" style="padding: 1px 4px; font-size: 0.65rem;">${escapeHtml(g || '')}</span>`).join(' ')}</td>
                </tr>
            `).join('');

            outputArea.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <span class="form-label" style="display:block; margin-bottom:6px;">Visual Highlight</span>
                        <div style="background:rgba(0,0,0,0.2); border:1px solid var(--border-primary); border-radius:8px; padding:12px; font-family:var(--font-mono); font-size:0.8rem; max-height:160px; overflow-y:auto; white-space:pre-wrap; word-break:break-all; line-height: 1.6;">
                            ${highlighted}
                        </div>
                    </div>
                    <table class="regex-matches-table">
                        <thead>
                            <tr><th>#</th><th>Position</th><th>Full Match</th><th>Groups</th></tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            outputArea.innerHTML = `<span style="color: #ef4444; font-weight:600;">❌ Regular Expression Compilation Error:</span>\n<span style="color: var(--text-secondary);">${escapeHtml(err.message)}</span>`;
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Trigger on load
    runRegex();
});
