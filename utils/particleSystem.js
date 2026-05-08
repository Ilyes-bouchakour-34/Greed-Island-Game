export class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('nen-particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.nenColor = '#00ffaa';
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.spawn();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setNenColor(color) {
        this.nenColor = color;
    }

    spawn() {
        for (let i = 0; i < 60; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: -Math.random() * 0.6 - 0.2,
            opacity: Math.random() * 0.6 + 0.1,
            life: Math.random()
        };
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 0.003;

            if (p.life <= 0 || p.y < -10) {
                this.particles[i] = this.createParticle();
                this.particles[i].y = this.canvas.height + 10;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.nenColor;
            this.ctx.globalAlpha = p.opacity * p.life;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.loop());
    }
}
