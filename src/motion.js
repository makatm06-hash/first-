const filterAnimations = new Map();

// Filtering stays immediate; a short settle softens the visible layout change.
export function filterProjects(category) {
 const cards = [...document.querySelectorAll('.project')];
 const previous = new Map(cards.filter(card => !card.hidden).map(card => [card, card.getBoundingClientRect()]));
 filterAnimations.forEach(animation => animation.cancel());
 filterAnimations.clear();
 cards.forEach(card => { card.hidden = category !== 'All work' && card.dataset.category !== category; });
 if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

 let stagger = 0;
 for (const card of cards) {
  if (card.hidden || !card.animate) continue;
  const bounds = card.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
  // Let the intersection reveal handle cards that have not entered yet.
  if (card.classList.contains('motion-reveal') && !card.classList.contains('motion-in')) continue;
  const before = previous.get(card);
  const dx = before ? before.left - bounds.left : 0;
  const dy = before ? before.top - bounds.top : 0;
  if (before && Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
  // Large grid changes get a small fade-up instead of a long journey.
  const nearby = before && Math.hypot(dx, dy) < 80;
  const animation = card.animate([
   { transform: `translate(${nearby ? dx : 0}px, ${nearby ? dy : 10}px)`, opacity: nearby ? 1 : .35 },
   { transform: 'translate(0, 0)', opacity: 1 },
  ], { duration: 460, delay: Math.min(stagger++ * 35, 70), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  filterAnimations.set(card, animation);
  const clear = () => { if (filterAnimations.get(card) === animation) filterAnimations.delete(card); };
  animation.finished.then(clear, clear);
 }
}

// Small, one-time reveals; content stays visible if motion is unsupported.
export function initMotion() {
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 const groups = [
  ['.nav', 0], ['.hero-top', 60], ['.hero h1', 120],
  ['.hero-bottom', 190], ['.hero-media', 250],
  ['.section-kicker, .section-heading, .work-toolbar', 0],
  ['.project', 0], ['.studio-symbol', 0],
  ['.studio-content > div:last-child > *', 0],
  ['.booking-layout > div, #booking-form', 0],
  ['.footer-top, .footer-wordmark, .footer-bottom', 0],
 ];
 const targets = new Map();
 for (const [selector, delay] of groups) {
  document.querySelectorAll(selector).forEach((element, index) => {
   targets.set(element, delay || (element.matches('.project, .studio-content > div:last-child > *') ? Math.min(index % 3 * 70, 140) : 0));
  });
 }
 let observer;
 function sync() {
  observer?.disconnect();
  filterAnimations.forEach(animation => animation.cancel());
  filterAnimations.clear();
  targets.forEach((_, element) => element.classList.remove('motion-reveal', 'motion-in'));
  const enabled = !preference.matches && 'IntersectionObserver' in window;
  document.documentElement.dataset.motion = enabled ? 'enabled' : 'reduced';
  if (!enabled) return;
  observer = new IntersectionObserver(entries => {
   for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('motion-in');
    observer.unobserve(entry.target);
   }
  }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' });
  targets.forEach((delay, element) => {
   element.style.setProperty('--reveal-delay', `${delay}ms`);
   element.classList.add('motion-reveal');
   observer.observe(element);
  });
 }
 sync();
 preference.addEventListener('change', sync);
}
