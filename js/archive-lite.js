(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const enableCursor = !prefersReduced && !isTouch && window.innerWidth > 860;

  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -9999, y: -9999 };
      this.count = window.innerWidth > 860 ? 48 : 24;
      this.resize();
      this.init();
      window.addEventListener('resize', () => this.resize());
      if (!prefersReduced) {
        window.addEventListener('mousemove', (e) => {
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
        });
        this.loop();
      }
    }
    resize() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = this.w * devicePixelRatio;
      this.canvas.height = this.h * devicePixelRatio;
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    init() {
      this.particles = Array.from({ length: this.count }, () => ({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.2 + 0.5,
      }));
    }
    loop() {
      const { ctx, w, h, particles, mouse } = this;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const f = (120 - dist) / 120;
          p.x -= (dx / dist) * f * 1.5;
          p.y -= (dy / dist) * f * 1.5;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110, 231, 255, 0.45)';
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(110, 231, 255, ${0.1 * (1 - d / 110)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(() => this.loop());
    }
  }

  class Cursor {
    constructor(dot, ring) {
      this.dot = dot;
      this.ring = ring;
      this.target = { x: 0, y: 0 };
      this.ringPos = { x: 0, y: 0 };
      document.documentElement.classList.add('has-custom-cursor');
      window.addEventListener('mousemove', (e) => {
        this.target.x = e.clientX;
        this.target.y = e.clientY;
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      });
      document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
      });
      const tick = () => {
        this.ringPos.x += (this.target.x - this.ringPos.x) * 0.14;
        this.ringPos.y += (this.target.y - this.ringPos.y) * 0.14;
        ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas && !prefersReduced) new ParticleField(canvas);

    if (enableCursor) {
      const dot = document.querySelector('.cursor-dot');
      const ring = document.querySelector('.cursor-ring');
      if (dot && ring) new Cursor(dot, ring);
    }
  });
})();
