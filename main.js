// nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 6);
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

// talking/blinking NPC portrait(s) — swap idle/talk/blink frames
document.querySelectorAll('.talk-portrait').forEach((el) => {
  const base = el.dataset.base;
  const f = (s) => `${base}_${s}.png`;
  ['idle', 'talk', 'blink1', 'blink2'].forEach((s) => { const i = new Image(); i.src = f(s); });
  let mouth = 0;
  const next = () => setTimeout(step, 150 + Math.random() * 150);
  function step() {
    if (document.hidden) { next(); return; }
    if (Math.random() < 0.12) {                 // blink
      el.src = f('blink1');
      setTimeout(() => { el.src = f('blink2'); }, 70);
      setTimeout(() => { el.src = f('idle'); next(); }, 150);
    } else {                                     // talk flap
      mouth ^= 1;
      el.src = mouth ? f('talk') : f('idle');
      next();
    }
  }
  step();
});

// placeholder links — friendly notice until the real URLs are wired in
document.querySelectorAll('a.soon').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    alert(a.dataset.msg || 'Coming soon!');
  });
});

/* ===== Background music (title theme, quiet) ===== */
(function () {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  if (!audio || !btn) return;
  audio.volume = 0.22;                                  // quiet
  const ICON_ON =
    '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
    '<path d="M16 8.7a4 4 0 010 6.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M18.6 6a7 7 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_OFF =
    '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
    '<path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const KEY = 'ck_music';
  let on = localStorage.getItem(KEY) !== 'off';         // default on
  const render = () => {
    btn.innerHTML = on ? ICON_ON : ICON_OFF;
    btn.classList.toggle('muted', !on);
    btn.classList.toggle('playing', on && !audio.paused);
  };
  const start = () => { audio.play().catch(() => {}); };
  function armGesture() {                               // autoplay-with-sound is blocked; start on 1st gesture
    const evs = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    const go = () => { evs.forEach((e) => window.removeEventListener(e, go)); if (on) start(); };
    evs.forEach((e) => window.addEventListener(e, go, { passive: true }));
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    on = !on;
    localStorage.setItem(KEY, on ? 'on' : 'off');
    if (on) start(); else audio.pause();
    render();
  });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  render();
  if (on) { start(); armGesture(); }
})();

/* ===== Screenshot lightbox ===== */
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-cap');
  const closeBtn = document.getElementById('lightbox-close');
  function open(src, alt, caption) {
    img.src = src; img.alt = alt || ''; cap.textContent = caption || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function hide() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.shot').forEach((fig) => {
    fig.addEventListener('click', () => {
      const i = fig.querySelector('img');
      const c = fig.querySelector('figcaption');
      open(i.currentSrc || i.src, i.alt, c ? c.textContent : '');
    });
  });
  closeBtn.addEventListener('click', hide);
  lb.addEventListener('click', (e) => { if (e.target === lb) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) hide(); });
})();

/* ===== Sir Reginald Slime speaks (click the mascot) ===== */
(function () {
  const wrap = document.querySelector('.nav-mascot-wrap');
  const img = document.querySelector('.nav-mascot');
  if (!wrap || !img) return;
  const IDLE = 'assets/img/mascot.png', TALK = 'assets/img/mascot_talk.png';
  const LINE = 'Wishlist this game, and, ahem, ME';
  new Image().src = TALK; // preload so the swap is instant
  const audio = new Audio('assets/audio/slimey.mp3');
  audio.preload = 'auto';

  let bubble, timer;
  const stop = () => { img.src = IDLE; bubble && bubble.classList.remove('show'); };
  audio.addEventListener('ended', stop);

  function speak(e) {
    e.preventDefault(); e.stopPropagation();
    if (!bubble) { bubble = document.createElement('div'); bubble.className = 'mascot-bubble'; document.body.appendChild(bubble); }
    bubble.textContent = LINE;
    const r = wrap.getBoundingClientRect();
    const navBottom = document.querySelector('.nav').getBoundingClientRect().bottom;
    bubble.style.left = Math.max(10, r.left - 6) + 'px';
    bubble.style.top = (navBottom + 8) + 'px';
    requestAnimationFrame(() => bubble.classList.add('show'));
    img.src = TALK;
    try { audio.currentTime = 0; audio.play(); } catch (_) {}
    clearTimeout(timer);
    timer = setTimeout(stop, 6000); // fallback if audio is blocked/unavailable
  }
  wrap.addEventListener('click', speak);
})();

/* ===== Spinning Astral Arcana card (navbar + hero) ===== */
(function () {
  const cards = [...document.querySelectorAll('.spincard')];
  if (!cards.length) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const img = new Image();
  img.src = 'assets/img/spin_card.png';
  const TILT_BASE = -2 * Math.PI / 180;          // slight resting lean
  const TILT_AMP = 9 * Math.PI / 180;            // wobble amplitude (rocks back & forth)

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
    const S = Math.min(w, h);
    const cx = w / 2;
    const ph = s.seed + t;
    const floatY = Math.sin(t * 1.05 + s.seed) * (S * 0.035);   // gentle bob
    const cy = h / 2 + floatY;
    const angle = t * 1.35;                        // spin speed (rad/s)
    const sx = Math.cos(angle);                    // vertical-axis foreshorten
    const cardH = S * 0.62;
    const cardW = cardH / ratio;
    const ew = Math.max(1, cardW * Math.abs(sx));
    const pulse = 0.5 + 0.5 * Math.sin(ph * 1.5);
    // keep the glow inside the canvas's inscribed circle so it fades out before the
    // square edge (otherwise the radial light gets clipped into an ugly box)
    const glowR = S / 2 - S * 0.035 - 2;

    // soft golden halo (follows the card)
    const halo = ctx.createRadialGradient(cx, cy, cardH * 0.08, cx, cy, glowR);
    halo.addColorStop(0, `rgba(233,196,106,${0.20 + 0.12 * pulse})`);
    halo.addColorStop(1, 'rgba(233,196,106,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, 7); ctx.fill();

    // rotating light-flare rays (kept within the glow radius)
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ph * 0.6);
    ctx.globalCompositeOperation = 'lighter';
    const rayLen = glowR * 0.92;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      const g = ctx.createLinearGradient(0, 0, rayLen, 0);
      g.addColorStop(0, 'rgba(255,240,200,0)');
      g.addColorStop(0.5, `rgba(255,240,200,${0.10 + 0.07 * pulse})`);
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.fillRect(0, -1.3, rayLen, 2.6);
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

    // the card itself — rocking back & forth as it spins/floats, drawn over the particles
    const tilt = TILT_BASE + Math.sin(t * 0.9 + s.seed) * TILT_AMP;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tilt);
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
