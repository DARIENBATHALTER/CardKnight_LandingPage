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
