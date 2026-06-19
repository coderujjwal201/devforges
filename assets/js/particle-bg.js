/* PREMIUM DYNAMIC INTERACTIVE GLOW PARTICLES */
(function() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000, mouseY = -1000;

    window.addEventListener('resize', initCanvas);
    document.addEventListener('mousemove', (e) => {
        const bounds = canvas.getBoundingClientRect();
        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;
    });

    // Handle mouse leaving viewport
    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function initCanvas() {
        if (!canvas.parentElement) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Mouse interaction physics
            if (mouseX !== -1000 && mouseY !== -1000) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            const theme = document.documentElement.getAttribute('data-theme') || 'onyx';
            let color = 'rgba(139, 92, 246, ';
            if(theme === 'obsidian') color = 'rgba(255, 255, 255, ';
            if(theme === 'matrix') color = 'rgba(34, 197, 94, ';

            ctx.fillStyle = color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        initCanvas();
        particles = [];
        const count = Math.min(45, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < Math.max(15, count); i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    // Initialize and run
    initParticles();
    animateParticles();

    // Export helper to global for re-init on theme switch if needed
    window.reinitParticles = initParticles;
})();
