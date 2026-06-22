(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const enableCursor = !prefersReduced && !isTouch && window.innerWidth > 860;

  /* ── Particle field ── */
  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -9999, y: -9999 };
      this.count = window.innerWidth > 860 ? 72 : 32;
      this.resize();
      this.init();
      window.addEventListener('resize', () => this.resize());
      if (!prefersReduced) {
        window.addEventListener('mousemove', (e) => {
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
          this.mouse.x = -9999;
          this.mouse.y = -9999;
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
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
      }));
    }

    loop() {
      const { ctx, w, h, particles, mouse } = this;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 1.8;
          p.y -= (dy / dist) * force * 1.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110, 231, 255, 0.55)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(110, 231, 255, ${0.14 * (1 - d / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      if (mouse.x > 0) {
        let nearest = null;
        let minD = Infinity;
        for (const p of particles) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < minD) { minD = d; nearest = p; }
        }
        if (nearest && minD < 200) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(nearest.x, nearest.y);
          ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  /* ── Custom cursor ── */
  class Cursor {
    constructor(dot, ring) {
      this.dot = dot;
      this.ring = ring;
      this.pos = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.ringPos = { x: 0, y: 0 };
      document.documentElement.classList.add('has-custom-cursor');
      window.addEventListener('mousemove', (e) => {
        this.target.x = e.clientX;
        this.target.y = e.clientY;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        this.dot.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;
      });
      document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
      });
      window.addEventListener('mousedown', () => ring.classList.add('is-click'));
      window.addEventListener('mouseup', () => ring.classList.remove('is-click'));
      this.tick();
    }

    tick() {
      this.ringPos.x += (this.target.x - this.ringPos.x) * 0.14;
      this.ringPos.y += (this.target.y - this.ringPos.y) * 0.14;
      this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(() => this.tick());
    }
  }

  /* ── Text scramble ── */
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}=+*^?#________';
      this.original = el.textContent;
      this.frame = null;
    }

    setText(text) {
      const old = this.el.textContent;
      const len = Math.max(old.length, text.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      let frame = 0;
      const maxFrames = Math.ceil(len / 3) + 8;

      if (this.frame) cancelAnimationFrame(this.frame);

      const update = () => {
        let output = '';
        for (let i = 0; i < len; i++) {
          const from = old[i] || '';
          const to = text[i] || '';
          if (i >= frame) {
            output += this.chars[Math.floor(Math.random() * this.chars.length)];
          } else {
            output += to || from;
          }
        }
        this.el.textContent = output;
        if (frame >= maxFrames) {
          this.el.textContent = text;
          this.resolve();
        } else {
          frame += 1;
          this.frame = requestAnimationFrame(update);
        }
      };
      update();
      return promise;
    }
  }

  /* ── 3D tilt cards ── */
  function initTiltCards() {
    if (prefersReduced || isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        const rx = ((y / rect.height) - 0.5) * -10;
        const ry = ((x / rect.width) - 0.5) * 10;
        card.style.setProperty('--spot-x', px + '%');
        card.style.setProperty('--spot-y', py + '%');
        card.style.setProperty('--rx', rx + 'deg');
        card.style.setProperty('--ry', ry + 'deg');
        card.classList.add('is-active');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.classList.remove('is-active');
      });
    });
  }

  /* ── Magnetic cursor pull on cards ── */
  function initMagneticLinks() {
    if (!enableCursor || prefersReduced) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ── Scroll progress ── */
  function initScrollProgress(bar) {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Intersection reveals ── */
  function initReveal() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.section, .marquee-wrap').forEach((el) => io.observe(el));
  }

  /* ── Counter animation ── */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ── Live clock ── */
  function initClock(el) {
    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── Page transition ── */
  function initPageTransition(overlay) {
    document.querySelectorAll('a[data-transition]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        overlay.classList.add('is-active');
        setTimeout(() => { window.location.href = href; }, 650);
      });
    });
  }

  /* ── Glitch label on cards ── */
  function initGlitchLabels() {
    const chars = '01アイウエオ';
    document.querySelectorAll('.card-glitch').forEach((el) => {
      setInterval(() => {
        if (Math.random() > 0.7) {
          const original = el.dataset.label || el.textContent;
          el.textContent = original.split('').map((c, i) =>
            Math.random() > 0.85 ? chars[Math.floor(Math.random() * chars.length)] : c
          ).join('');
          setTimeout(() => { el.textContent = original; }, 80);
        }
      }, 1200);
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas && !prefersReduced) new ParticleField(canvas);

    if (enableCursor) {
      const dot = document.querySelector('.cursor-dot');
      const ring = document.querySelector('.cursor-ring');
      if (dot && ring) new Cursor(dot, ring);
    }

    const desc = document.querySelector('.hero-desc');
    if (desc && !prefersReduced) {
      const scramble = new TextScramble(desc);
      const phrases = [
        'Selected experiments in interaction, industrial design, and critical media studies.',
        'Creative code, critical media, industrial design.',
        'One archive. Many experiments.',
      ];
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % phrases.length;
        scramble.setText(phrases[idx]);
      }, 4200);
    }

    initTiltCards();
    initMagneticLinks();
    initScrollProgress(document.querySelector('.scroll-progress'));
    initReveal();
    animateCounters();
    initClock(document.querySelector('.nav-clock'));

    initPageTransition(document.querySelector('.page-transition'));
    initGlitchLabels();
  });
})();
