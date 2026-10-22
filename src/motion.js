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
