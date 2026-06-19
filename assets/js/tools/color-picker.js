/* DEVFORGES COLOR PICKER & ACCESSIBILITY COMPLIANCE UTILITY */
document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('tool-input-textarea');
    const outputArea = document.getElementById('tool-output-display');
    const swatchInput = document.getElementById('ctrl-color-input');
    const bgInput = document.getElementById('ctrl-color-bg');
    
    const clearBtn = document.getElementById('btn-clear');
    const copyBtn = document.getElementById('btn-copy');
    const sampleBtn = document.getElementById('btn-sample');

    const STORAGE_INPUT_KEY = 'devforge_color_input';
    const STORAGE_BG_KEY = 'devforge_color_bg';

    const SAMPLE_COLOR = '#6366f1';
    const SAMPLE_BG = '#030303';

    // Load initial storage states
    inputArea.value = localStorage.getItem(STORAGE_INPUT_KEY) !== null ? localStorage.getItem(STORAGE_INPUT_KEY) : SAMPLE_COLOR;
    bgInput.value = localStorage.getItem(STORAGE_BG_KEY) !== null ? localStorage.getItem(STORAGE_BG_KEY) : SAMPLE_BG;
    swatchInput.value = isValidHex(inputArea.value) ? inputArea.value : SAMPLE_COLOR;

    // Listeners
    inputArea.addEventListener('input', () => {
        const hex = inputArea.value.trim();
        if (isValidHex(hex)) {
            swatchInput.value = hex.startsWith('#') ? hex : '#' + hex;
        }
        localStorage.setItem(STORAGE_INPUT_KEY, inputArea.value);
        runColorPicker();
    });

    swatchInput.addEventListener('input', () => {
        inputArea.value = swatchInput.value;
        localStorage.setItem(STORAGE_INPUT_KEY, swatchInput.value);
        runColorPicker();
    });

    bgInput.addEventListener('input', () => {
        localStorage.setItem(STORAGE_BG_KEY, bgInput.value);
        runColorPicker();
    });

    clearBtn.onclick = () => {
        inputArea.value = '';
        localStorage.setItem(STORAGE_INPUT_KEY, '');
        outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting color input...</span>';
    };

    sampleBtn.onclick = () => {
        inputArea.value = SAMPLE_COLOR;
        swatchInput.value = SAMPLE_COLOR;
        bgInput.value = SAMPLE_BG;
        localStorage.setItem(STORAGE_INPUT_KEY, SAMPLE_COLOR);
        localStorage.setItem(STORAGE_BG_KEY, SAMPLE_BG);
        runColorPicker();
    };

    copyBtn.onclick = () => {
        const hex = inputArea.value.trim();
        if (!isValidHex(hex)) {
            alert('No valid color hex to copy.');
            return;
        }
        navigator.clipboard.writeText(hex).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Copied HEX!
            `;
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 1500);
        });
    };

    // Global copy utility helper
    window.copySwatch = function(hex) {
        navigator.clipboard.writeText(hex).then(() => {
            alert(`Copied swatch color: ${hex}`);
        });
    };

    function isValidHex(hex) {
        const clean = hex.trim();
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(clean);
    }

    function runColorPicker() {
        let mainColor = inputArea.value.trim();
        if (!mainColor) {
            outputArea.innerHTML = '<span style="color: var(--text-muted);">Awaiting color input...</span>';
            return;
        }

        if (!mainColor.startsWith('#') && (mainColor.length === 3 || mainColor.length === 6)) {
            mainColor = '#' + mainColor;
        }

        if (!isValidHex(mainColor)) {
            outputArea.innerHTML = '<span style="color: #ef4444; font-weight:600;">⚠️ Invalid HEX color format. (Use #6366f1 or 6366f1)</span>';
            return;
        }

        try {
            const rgb = hexToRgb(mainColor);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            const bgHex = bgInput.value.trim();
            const bgRgb = isValidHex(bgHex) ? hexToRgb(bgHex) : {r:3, g:3, b:3};

            const ratio = getContrastRatio(rgb, bgRgb);
            const aaNormal = ratio >= 4.5 ? 'PASS' : 'FAIL';
            const aaaNormal = ratio >= 7.0 ? 'PASS' : 'FAIL';
            const aaLarge = ratio >= 3.0 ? 'PASS' : 'FAIL';
            const aaaLarge = ratio >= 4.5 ? 'PASS' : 'FAIL';

            // Harmonious swatches
            const monochromatic = [
                lightenDarkenColor(mainColor, 35),
                lightenDarkenColor(mainColor, 18),
                mainColor,
                lightenDarkenColor(mainColor, -18),
                lightenDarkenColor(mainColor, -35)
            ];

            const monoHTML = monochromatic.map(c => `
                <div class="color-palette-block" style="background: ${c};" onclick="window.copySwatch('${c}')" title="Copy ${c}">
                    ${c}
                </div>
            `).join('');

            const compH = (hsl.h + 180) % 360;
            const compHex = hslToHex(compH, hsl.s, hsl.l);

            const analog1H = (hsl.h + 30) % 360;
            const analog2H = (hsl.h - 30 + 360) % 360;
            const analog1Hex = hslToHex(analog1H, hsl.s, hsl.l);
            const analog2Hex = hslToHex(analog2H, hsl.s, hsl.l);

            const triad1H = (hsl.h + 120) % 360;
            const triad2H = (hsl.h + 240) % 360;
            const triad1Hex = hslToHex(triad1H, hsl.s, hsl.l);
            const triad2Hex = hslToHex(triad2H, hsl.s, hsl.l);

            outputArea.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <table class="regex-matches-table">
                        <thead>
                            <tr><th colspan="2">Color Space Representations</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>HEX String</td><td><code>${mainColor.toLowerCase()}</code></td></tr>
                            <tr><td>RGB Format</td><td><code>rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</code></td></tr>
                            <tr><td>HSL Format</td><td><code>hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</code></td></tr>
                        </tbody>
                    </table>

                    <table class="regex-matches-table">
                        <thead>
                            <tr><th>WCAG 2.1 Contrast Check (${ratio.toFixed(2)}:1)</th><th>Result</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Normal Text (AA) (>= 4.5)</td><td><span class="contrast-badge ${aaNormal === 'PASS' ? 'pass' : 'fail'}">${aaNormal}</span></td></tr>
                            <tr><td>Normal Text (AAA) (>= 7.0)</td><td><span class="contrast-badge ${aaaNormal === 'PASS' ? 'pass' : 'fail'}">${aaaNormal}</span></td></tr>
                            <tr><td>Large Text (AA) (>= 3.0)</td><td><span class="contrast-badge ${aaLarge === 'PASS' ? 'pass' : 'fail'}">${aaLarge}</span></td></tr>
                            <tr><td>Large Text (AAA) (>= 4.5)</td><td><span class="contrast-badge ${aaaLarge === 'PASS' ? 'pass' : 'fail'}">${aaaLarge}</span></td></tr>
                        </tbody>
                    </table>

                    <div>
                        <span class="form-label" style="display:block; margin-bottom:6px;">Monochromatic Theme Swatches</span>
                        <div class="color-palette-grid">
                            ${monoHTML}
                        </div>
                    </div>

                    <div style="margin-top: 4px;">
                        <span class="form-label" style="display:block; margin-bottom:6px;">Harmonic Contrast Pairs</span>
                        <div class="color-palette-grid">
                            <div class="color-palette-block" style="background: ${compHex};" onclick="window.copySwatch('${compHex}')" title="Copy Complementary">Comp</div>
                            <div class="color-palette-block" style="background: ${analog1Hex};" onclick="window.copySwatch('${analog1Hex}')" title="Copy Analogous 1">Analog 1</div>
                            <div class="color-palette-block" style="background: ${analog2Hex};" onclick="window.copySwatch('${analog2Hex}')" title="Copy Analogous 2">Analog 2</div>
                            <div class="color-palette-block" style="background: ${triad1Hex};" onclick="window.copySwatch('${triad1Hex}')" title="Copy Triadic 1">Triad 1</div>
                            <div class="color-palette-block" style="background: ${triad2Hex};" onclick="window.copySwatch('${triad2Hex}')" title="Copy Triadic 2">Triad 2</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (e) {
            outputArea.innerHTML = `<span style="color: #ef4444; font-weight:600;">❌ Color Parsing Failure:</span>\n<span style="color: var(--text-secondary);">${e.message}</span>`;
        }
    }

    // Helper math formulas
    function hexToRgb(hex) {
        let c = hex.substring(1);
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        }
        const num = parseInt(c, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
        let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
        let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
        return `#${rHex}${gHex}${bHex}`;
    }

    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(rgb1, rgb2) {
        const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    function lightenDarkenColor(col, amt) {
        let usePound = false;
        if (col[0] === "#") {
            col = col.slice(1);
            usePound = true;
        }
        let num = parseInt(col, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    // Trigger on init
    runColorPicker();
});
