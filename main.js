// nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// reveal-on-scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// year
document.getElementById('yr').textContent = new Date().getFullYear();

// placeholder Steam button — friendly notice until the store page is live
document.getElementById('steam-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  alert('The Steam page is coming soon — follow GitHub Sponsors for launch news!');
});

/* ===== Spinning Astral Arcana card (navbar + hero) ===== */
(function () {
  const cards = [...document.querySelectorAll('.spincard')];
  if (!cards.length) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const img = new Image();
  img.src = 'assets/img/spin_card.png';
  const TILT = -7 * Math.PI / 180;               // gentle diagonal lean

  let states = [];
  function setup(c) {
    const r = c.getBoundingClientRect();
    const w = Math.round(r.width) || c.width;
    const h = Math.round(r.height) || c.height;
    c.width = w * dpr; c.height = h * dpr;
    return {
      ctx: c.getContext('2d'), w, h, parts: [], seed: Math.random() * 1000,
      sparks: !c.classList.contains('nav-card'),   // navbar card: no particles
    };
  }
  const resize = () => { states = cards.map(setup); };

  function draw(s, t) {
    const { ctx, w, h } = s;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const ratio = (img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1.436);
    const cx = w / 2;
    const ph = s.seed + t;
    const floatY = Math.sin(t * 1.05 + s.seed) * (Math.min(w, h) * 0.045);  // gentle bob
    const cy = h / 2 + floatY;
    const angle = t * 1.35;                        // spin speed (rad/s)
    const sx = Math.cos(angle);                    // vertical-axis foreshorten
    const cardH = Math.min(w, h) * 0.72;
    const cardW = cardH / ratio;
    const ew = Math.max(1, cardW * Math.abs(sx));
    const pulse = 0.5 + 0.5 * Math.sin(ph * 1.5);

    // soft golden halo (follows the card)
    const halo = ctx.createRadialGradient(cx, cy, cardH * 0.08, cx, cy, cardH * 0.85);
    halo.addColorStop(0, `rgba(233,196,106,${0.20 + 0.12 * pulse})`);
    halo.addColorStop(1, 'rgba(233,196,106,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, cardH * 0.85, 0, 7); ctx.fill();

    // rotating light-flare rays
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ph * 0.6);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      const g = ctx.createLinearGradient(0, 0, cardH * 0.78, 0);
      g.addColorStop(0, 'rgba(255,240,200,0)');
      g.addColorStop(0.5, `rgba(255,240,200,${0.10 + 0.07 * pulse})`);
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.fillRect(0, -1.3, cardH * 0.78, 2.6);
    }
    ctx.restore();

    // gold sparkle particles — emitted from card center, drawn BEHIND the card,
    // spread wide enough to be seen peeking out from behind it
    if (s.sparks) {
      if (s.parts.length < 22 && Math.random() < 0.55) {
        const a = Math.random() * Math.PI * 2;
        const spd = (0.6 + Math.random() * 1.1) * (Math.min(w, h) / 150);
        s.parts.push({ x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 0.25,
                       life: 1, sz: 1 + Math.random() * 1.8 });
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = s.parts.length - 1; i >= 0; i--) {
        const p = s.parts[i];
        p.x += p.vx; p.y += p.vy; p.vy -= 0.01; p.life -= 0.011;
        if (p.life <= 0) { s.parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = 'rgba(255,231,150,1)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * p.life, 0, 7); ctx.fill();
      }
      ctx.restore();
    }

    // the card itself — tilted on a gentle diagonal, drawn over the particles
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(TILT);
    if (img.complete && img.naturalWidth) {
      ctx.globalAlpha = 0.9 + 0.1 * Math.abs(sx);   // dim slightly edge-on
      ctx.drawImage(img, -ew / 2, -cardH / 2, ew, cardH);
      // sweeping specular sheen
      ctx.globalCompositeOperation = 'lighter';
      const sp = (Math.sin(angle) + 1) / 2;
      const sg = ctx.createLinearGradient(-ew / 2, 0, ew / 2, 0);
      sg.addColorStop(Math.max(0, sp - 0.18), 'rgba(255,255,255,0)');
      sg.addColorStop(sp, `rgba(255,250,230,${0.28 * Math.abs(sx)})`);
      sg.addColorStop(Math.min(1, sp + 0.18), 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(-ew / 2, -cardH / 2, ew, cardH);
    }
    // bright flare as the card turns edge-on
    const edge = 1 - Math.abs(sx);
    if (edge > 0.72) {
      const fa = (edge - 0.72) / 0.28;
      ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createLinearGradient(0, -cardH / 2, 0, cardH / 2);
      fg.addColorStop(0, 'rgba(255,246,212,0)');
      fg.addColorStop(0.5, `rgba(255,246,212,${0.8 * fa})`);
      fg.addColorStop(1, 'rgba(255,246,212,0)');
      ctx.fillStyle = fg; ctx.fillRect(-2, -cardH / 2, 4, cardH);
    }
    ctx.restore();
  }

  let t0 = null;
  function loop(ts) {
    if (t0 === null) t0 = ts;
    const t = (ts - t0) / 1000;
    if (!document.hidden) states.forEach((s) => draw(s, t));
    requestAnimationFrame(loop);
  }
  const start = () => { resize(); requestAnimationFrame(loop); };
  if (img.complete) start(); else img.onload = start;
  window.addEventListener('resize', resize, { passive: true });
})();
