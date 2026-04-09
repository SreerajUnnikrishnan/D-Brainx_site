// Floating Particles Animation (Antigravity/Cyber Theme)
class Particle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * -1 - 0.2; // Antigravity: generally float upwards

        // Colors: mix of neon blue, purple, and cyan
        const colors = [
            'rgba(56, 189, 248, 0.5)', // Neon Blue
            'rgba(168, 85, 247, 0.4)', // Neon Purple
            'rgba(34, 211, 238, 0.6)'  // Neon Cyan
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.y < 0) {
            this.y = this.canvas.height;
            this.x = Math.random() * this.canvas.width;
        }
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return; // Only run if container exists

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set styles
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    let particles = [];
    const particleCount = Math.min(window.innerWidth / 10, 100);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas, ctx));
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Connect particles that are close to each other
        connectParticles();

        requestAnimationFrame(animate);
    }

    function connectParticles() {
        const maxDistance = 100;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.2})`; // Faint cyan lines
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    animate();
}

// Initialize when DOM is parsed
document.addEventListener('DOMContentLoaded', initParticles);
