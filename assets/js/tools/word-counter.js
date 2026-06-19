/* DEVFORGES WORD COUNTER UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');

    const STORAGE_KEY = 'devforge_wordcounter_input';
    const SAMPLE_TEXT = 'DEVFORGES is an exceptionally well-crafted, offline-first library of web applications designed to support builders, makers, founders, and students in their daily operations. Keep your clipboard fast and secure, running 100% locally in your client environment.';

    // Load initial storage state
    const cached = localStorage.getItem(STORAGE_KEY);
    inputArea.value = cached !== null ? cached : SAMPLE_TEXT;

    // Listeners
    inputArea.addEventListener('input', () => {
        localStorage.setItem(STORAGE_KEY, inputArea.value);
        runWordCounter();
    });

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting text input...</span>';
    };

    sampleBtn.onclick = () => {
        inputArea.value = SAMPLE_TEXT;
        localStorage.setItem(STORAGE_KEY, SAMPLE_TEXT);
        runWordCounter();
    };

    copyBtn.onclick = () => {
        // Copy summary text
        const rows = outputArea.querySelectorAll('tr');
        if (!rows.length) {
            alert('Nothing to copy.');
            return;
        }
        const text = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return cells.length === 2 ? `${cells[0].textContent}: ${cells[1].textContent}` : '';
        }).filter(Boolean).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Copied Report!
            `;
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1500);
        });
    };

    function runWordCounter() {
        const val = inputArea.value;
        if (!val.trim()) {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting text input...</span>';
            return;
        }

        const cleanText = val.trim();
        const words = cleanText === '' ? [] : cleanText.split(/\s+/);
        const charsWithSpaces = val.length;
        const charsNoSpaces = val.replace(/\s/g, '').length;
        const lines = val.split('\n').filter(Boolean).length;
        const sentences = val.split(/[.!?]+/).filter(Boolean).length;
        
        const readingTime = Math.ceil(words.length / 200);
        const speakingTime = Math.ceil(words.length / 140);
        
        // Density parsing
        const frequency = {};
        words.forEach(w => {
            const norm = w.toLowerCase().replace(/[^a-zA-Z]/g, '');
            if (norm.length > 2) {
                frequency[norm] = (frequency[norm] || 0) + 1;
            }
        });
        
        const sortedDensity = Object.entries(frequency)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 7);

        let densityRows = sortedDensity.map(item => `<tr><td><code>${escapeHtml(item[0])}</code></td><td>${item[1]}x</td></tr>`).join('');
        if(!densityRows) densityRows = '<tr><td colspan="2" style="color: var(--text-muted);">Insufficient long words to extract keyword density.</td></tr>';

        outputArea.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div>
                    <table class="regex-matches-table">
                        <thead>
                            <tr><th colspan="2">Text Statistics</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Words Count</td><td><strong>${words.length}</strong></td></tr>
                            <tr><td>Characters (with spaces)</td><td>${charsWithSpaces}</td></tr>
                            <tr><td>Characters (no spaces)</td><td>${charsNoSpaces}</td></tr>
                            <tr><td>Lines Count</td><td>${lines}</td></tr>
                            <tr><td>Sentences Count</td><td>${sentences}</td></tr>
                            <tr><td>Estimated Reading Time</td><td>${readingTime} Min</td></tr>
                            <tr><td>Estimated Speaking Time</td><td>${speakingTime} Min</td></tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <table class="regex-matches-table">
                        <thead>
                            <tr><th>Top Word Density</th><th>Frequency</th></tr>
                        </thead>
                        <tbody>
                            ${densityRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Trigger on start
    runWordCounter();
});
