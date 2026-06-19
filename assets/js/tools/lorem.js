/* DEVFORGES LOREM GENERATOR UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const outputArea = document.getElementById('tool-output-display');
    const typeSelect = document.getElementById('ctrl-lorem-type');
    const countInput = document.getElementById('ctrl-lorem-count');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const generateBtn = document.getElementById('btn-generate');

    const STORAGE_TYPE_KEY = 'devforge_lorem_type';
    const STORAGE_COUNT_KEY = 'devforge_lorem_count';

    const loremDatabase = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores."
    ];

    // Load initial storage states
    typeSelect.value = localStorage.getItem(STORAGE_TYPE_KEY) !== null ? localStorage.getItem(STORAGE_TYPE_KEY) : 'paragraphs';
    countInput.value = localStorage.getItem(STORAGE_COUNT_KEY) !== null ? localStorage.getItem(STORAGE_COUNT_KEY) : '3';

    // Listeners
    typeSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_TYPE_KEY, typeSelect.value);
        runLorem();
    });

    countInput.addEventListener('input', () => {
        localStorage.setItem(STORAGE_COUNT_KEY, countInput.value);
        runLorem();
    });

    generateBtn.onclick = runLorem;

    clearBtn.onclick = () => {
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting generation...</span>';
    };

    copyBtn.onclick = () => {
        const text = outputArea.innerText;
        if (!text || text.startsWith('Awaiting')) {
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

    function runLorem() {
        const type = typeSelect.value;
        const count = Math.min(100, Math.max(1, parseInt(countInput.value) || 3));
        
        let generatedText = '';

        if (type === 'paragraphs') {
            const paras = [];
            for (let i = 0; i < count; i++) {
                paras.push(loremDatabase[i % loremDatabase.length]);
            }
            generatedText = paras.join('\n\n');
        } else if (type === 'words') {
            const wordsArr = [];
            const allWords = loremDatabase.join(' ').split(/\s+/);
            for (let i = 0; i < count; i++) {
                wordsArr.push(allWords[i % allWords.length].replace(/[.,!]/g, '').toLowerCase());
            }
            generatedText = wordsArr.join(' ');
        } else {
            const listItems = [];
            for (let i = 0; i < count; i++) {
                listItems.push(`<li>${loremDatabase[i % loremDatabase.length]}</li>`);
            }
            generatedText = `<ul>\n  ${listItems.join('\n  ')}\n</ul>`;
        }

        outputArea.innerText = generatedText;
    }

    // Trigger on start
    runLorem();
});
