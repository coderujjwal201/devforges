/* DEVFORGES COMMON LOGIC */
// Establish Trusted Types Default Policy to support secure client-side sandbox environments
try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        if (!window.trustedTypes.defaultPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string) => string,
                createScript: (string) => string,
                createScriptURL: (string) => string
            });
        }
    }
} catch (e) {
    console.warn("TrustedTypes policy creation failed:", e);
}

(function() {
    // 1. PATH RESOLUTION SYSTEM
    const rootPath = document.body.getAttribute('data-root-path') || './';

    // 2. THEME CONFIGURATION
    const themeKey = 'devforges_theme';
    const activeTheme = localStorage.getItem(themeKey) || 'onyx';
    document.documentElement.setAttribute('data-theme', activeTheme);

    function initAll() {
        // Synchronize theme selector on DOM load
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = activeTheme;
            themeSelector.addEventListener('change', function() {
                const newTheme = this.value;
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem(themeKey, newTheme);
                
                // If particles are active, trigger redraw
                if (window.reinitParticles) {
                    window.reinitParticles();
                }
            });
        }

        try { initNavbarScroll(); } catch(e) { console.error("initNavbarScroll error:", e); }
        try { initFavoritesAndRecents(); } catch(e) { console.error("initFavoritesAndRecents error:", e); }
        try { initCommandPalette(); } catch(e) { console.error("initCommandPalette error:", e); }
        try { initNewsletterForm(); } catch(e) { console.error("initNewsletterForm error:", e); }
        try { initMobileMenu(); } catch(e) { console.error("initMobileMenu error:", e); }
        try { initFadeIn(); } catch(e) { console.error("initFadeIn error:", e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // 3. NAVBAR SCROLL ANIMATION & BLUR STATE
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 15) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Set immediate state based on initial load scroll position
        if (window.scrollY > 15) {
            navbar.classList.add('scrolled');
        }
    }

    // 4. UTILITY DATA REGISTRY
    const UTILITIES = [
        {
            id: 'json-formatter',
            name: 'JSON Formatter',
            category: 'formatters',
            description: 'Format, parse, minify, and inspect JSON documents inside visual branch grids.',
            path: 'tool/json-formatter/',
            icon: `<svg viewBox="0 0 24 24"><path d="M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 16h14V5H5v14zm2-12h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>`
        },
        {
            id: 'base64',
            name: 'Base64 Encoder / Decoder',
            category: 'encoders',
            description: 'Encode and decode base64 strings and files instantly with MIME-type deduction.',
            path: 'tool/base64/',
            icon: `<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62C8.77 11.22 10.54 10.5 12.5 10.5c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>`
        },
        {
            id: 'regex',
            name: 'Regex Tester',
            category: 'text',
            description: 'Test JavaScript regular expressions live, listing target matches and capture groups.',
            path: 'tool/regex/',
            icon: `<svg viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`
        },
        {
            id: 'url-encoder',
            name: 'URL Encoder / Decoder',
            category: 'encoders',
            description: 'Encode and decode query strings while mapping items into editable key-value grids.',
            path: 'tool/url-encoder/',
            icon: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`
        },
        {
            id: 'color-picker',
            name: 'Color Picker & Compliance',
            category: 'design',
            description: 'Format HEX/RGB/HSL values, run WCAG color checks, and generate palettes.',
            path: 'tool/color-picker/',
            icon: `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.02 9 9 9 1 0 1.8-.8 1.8-1.8 0-.47-.18-.92-.5-1.28a.38.38 0 0 1-.08-.26c0-.22.18-.4.4-.4h1.78c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm-5 9c-.83 0-1.5-.67-1.5-1.5S6.17 9 7 9s1.5.67 1.5 1.5S7.83 12 7 12zm3-4c-.83 0-1.5-.67-1.5-1.5S9.17 5 10 5s1.5.67 1.5 1.5S10.83 8 10 8zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 5 14 5s1.5.67 1.5 1.5S14.83 8 14 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.17 9 17 9s1.5.67 1.5 1.5S17.83 12 17 12z"/></svg>`
        },
        {
            id: 'word-counter',
            name: 'Word Counter',
            category: 'text',
            description: 'Count words, sentences, lines, and calculate speaking and reading time metric arrays.',
            path: 'tool/word-counter/',
            icon: `<svg viewBox="0 0 24 24"><path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h9v-2H3v2zm16-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8h2v-2h-2v2z"/></svg>`
        },
        {
            id: 'lorem',
            name: 'Lorem Ipsum Generator',
            category: 'text',
            description: 'Generate customizable filler content structures including words, paragraphs, or lists.',
            path: 'tool/lorem/',
            icon: `<svg viewBox="0 0 24 24"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zm0 4H4v2h16v-2zM4 5v2h16V5H4z"/></svg>`
        },
        {
            id: 'jwt-decoder',
            name: 'JWT Decoder',
            category: 'formatters',
            description: 'Decode and inspect JSON Web Token header, payload parameters, and expiry validation check.',
            path: 'tool/jwt-decoder/',
            icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`
        },
        {
            id: 'hash-generator',
            name: 'Hash Generator',
            category: 'encoders',
            description: 'Generate secure MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously from a text payload.',
            path: 'tool/hash-generator/',
            icon: `<svg viewBox="0 0 24 24"><path d="M12.85 4.51l6.43 6.43c.78.78.78 2.05 0 2.83l-6.43 6.43c-.78.78-2.05.78-2.83 0l-6.43-6.43c-.78-.78-.78-2.05 0-2.83l6.43-6.43c.78-.78 2.05-.78 2.83 0z"/></svg>`
        },
        {
            id: 'diff-checker',
            name: 'Diff Checker',
            category: 'text',
            description: 'Compare two text selections side-by-side to highlight added, removed, or changed lines.',
            path: 'tool/diff-checker/',
            icon: `<svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>`
        },
        {
            id: 'contrast-checker',
            name: 'Color Contrast Checker',
            category: 'design',
            description: 'Evaluate color combinations against WCAG 2.1 accessibility compliance checks.',
            path: 'tool/contrast-checker/',
            icon: `<svg viewBox="0 0 24 24"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm1-17.93c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z"/></svg>`
        },
        {
            id: 'timestamp',
            name: 'Timestamp Converter',
            category: 'encoders',
            description: 'Convert Unix epoch timestamps to human-readable date formats across standard timezones.',
            path: 'tool/timestamp/',
            icon: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`
        }
    ];

    // 5. FAVORITES & RECENTLY USED LOGIC
    function initFavoritesAndRecents() {
        const bookmarksKey = 'devforges_bookmarks';
        const recentKey = 'devforges_recent';
        
        let bookmarks = JSON.parse(localStorage.getItem(bookmarksKey)) || [];
        let recents = JSON.parse(localStorage.getItem(recentKey)) || ['json-formatter', 'base64', 'regex'];

        // Track active tool visit
        const activeToolId = document.body.getAttribute('data-tool-id');
        if (activeToolId) {
            recents = recents.filter(id => id !== activeToolId);
            recents.unshift(activeToolId);
            if (recents.length > 6) recents.pop();
            localStorage.setItem(recentKey, JSON.stringify(recents));
        }

        // Render Recently Used Grid if container exists
        const recentGrid = document.getElementById('recently-used-grid');
        if (recentGrid) {
            recentGrid.innerHTML = '';
            
            const recentTools = UTILITIES.filter(t => recents.includes(t.id))
                                         .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));

            if (recentTools.length === 0) {
                recentGrid.innerHTML = `
                    <div class="recent-card" style="grid-column: 1/-1; justify-content: center; color: var(--text-muted); font-size: 0.85rem;">
                        No tools visited in this session yet. Explore the directory!
                    </div>
                `;
            } else {
                recentTools.forEach(tool => {
                    const card = document.createElement('div');
                    card.className = 'recent-card';
                    card.innerHTML = `
                        <div class="recent-card-left">
                            <div class="recent-card-icon">${tool.icon}</div>
                            <div class="recent-card-info">
                                <h4>${tool.name}</h4>
                                <p>${tool.category.toUpperCase()}</p>
                            </div>
                        </div>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-muted)"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
                    `;
                    card.onclick = () => {
                        window.location.href = rootPath + tool.path;
                    };
                    recentGrid.appendChild(card);
                });
            }
        }

        // Bind interactive bookmark items if present in sidebar list
        const favoriteButtons = document.querySelectorAll('.sidebar-item-favorite');
        favoriteButtons.forEach(btn => {
            const toolId = btn.dataset.toolId;
            const isActive = bookmarks.includes(toolId);
            if (isActive) btn.classList.add('active');

            btn.onclick = (e) => {
                e.stopPropagation(); // prevent sidebar trigger
                bookmarks = JSON.parse(localStorage.getItem(bookmarksKey)) || [];
                const idx = bookmarks.indexOf(toolId);
                if (idx > -1) {
                    bookmarks.splice(idx, 1);
                    btn.classList.remove('active');
                } else {
                    bookmarks.push(toolId);
                    btn.classList.add('active');
                }
                localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
                
                if (window.refreshFavoritesView) window.refreshFavoritesView();
            };
        });
    }

    // 6. COMMAND PALETTE IMPLEMENTATION (Ctrl/Cmd + K)
    function initCommandPalette() {
        const overlay = document.getElementById('command-modal-overlay');
        const input = document.getElementById('command-palette-input');
        const results = document.getElementById('command-palette-results');
        const trigger = document.getElementById('search-trigger');
        if (!overlay || !input || !results) return;

        let currentFocusIndex = 0;

        const show = () => {
            overlay.classList.add('active');
            input.value = '';
            input.focus();
            render('');
        };

        const hide = () => {
            overlay.classList.remove('active');
        };

        if (trigger) {
            trigger.onclick = (e) => {
                e.preventDefault();
                show();
            };
        }

        overlay.onclick = (e) => {
            if (e.target === overlay) hide();
        };

        input.oninput = function() {
            render(this.value);
        };

        function render(query) {
            results.innerHTML = '';
            currentFocusIndex = 0;

            const matches = UTILITIES.filter(tool => {
                return tool.name.toLowerCase().includes(query.toLowerCase()) || 
                       tool.description.toLowerCase().includes(query.toLowerCase());
            });

            if (matches.length === 0) {
                results.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem;">No matches identified for "${query}"</div>`;
                return;
            }

            matches.forEach((tool, idx) => {
                const item = document.createElement('div');
                item.className = `palette-item ${idx === 0 ? 'selected' : ''}`;
                item.innerHTML = `
                    <div class="palette-item-left">
                        ${tool.icon}
                        <div>
                            <div style="font-weight: 500; color: var(--text-primary);">${tool.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${tool.description}</div>
                        </div>
                    </div>
                    <span class="palette-shortcut">Launch</span>
                `;
                item.onclick = () => {
                    window.location.href = rootPath + tool.path;
                    hide();
                };
                results.appendChild(item);
            });
        }

        // Keyboard navigation inside Palette
        input.onkeydown = function(e) {
            const items = results.querySelectorAll('.palette-item');
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[currentFocusIndex].classList.remove('selected');
                currentFocusIndex = (currentFocusIndex + 1) % items.length;
                items[currentFocusIndex].classList.add('selected');
                items[currentFocusIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[currentFocusIndex].classList.remove('selected');
                currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
                items[currentFocusIndex].classList.add('selected');
                items[currentFocusIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                items[currentFocusIndex].click();
            } else if (e.key === 'Escape') {
                hide();
            }
        };

        // Global keybindings
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                show();
            }
            if (e.key === 'Escape') {
                hide();
            }
        });
    }

    // 7. NEWSLETTER SUBSCRIPTION
    function initNewsletterForm() {
        document.querySelector('.newsletter-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) return;
            localStorage.setItem('devforges_email', email);
            this.innerHTML = '<p style="color:var(--success-color);font-size:0.9rem;margin:10px 0;">✓ You are subscribed!</p>';
        });
    }

    // 8. MOBILE NAVIGATION MENU
    function initMobileMenu() {
        const navToggle = document.getElementById('mobile-nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = navLinks.classList.toggle('active');
                navToggle.classList.toggle('active');
                if (isActive) {
                    document.body.classList.add('mobile-menu-open');
                } else {
                    document.body.classList.remove('mobile-menu-open');
                }
            });

            // Close on clicking links
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                });
            });

            // Close on clicking outside
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== navToggle) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.classList.remove('mobile-menu-open');
                }
            });
        }
    }

    // 9. REVEAL PAGE LOAD FADE-IN
    function initFadeIn() {
        const observerOptions = {
            threshold: 0.01,
            rootMargin: "50px"
        };
        const fadeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

        // Fail-safe: immediately reveal any fade-in elements within the current viewport
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('visible');
                }
            });
        }, 100);
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(rootPath + 'sw.js')
                .then(reg => console.log('ServiceWorker registered with scope: ', reg.scope))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }

    // Export registry globally
    window.DEVFORGE_UTILITIES = UTILITIES;
})();
