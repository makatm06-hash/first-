// Native touch scrolling, with a gently eased wheel/keyboard loop.
export function mountStillGallery(container, images) {
 container.classList.add('detail-media--gallery');
 const viewport = document.createElement('div');
 viewport.className = 'still-gallery';
 viewport.tabIndex = 0;
 viewport.setAttribute('role', 'region');
 viewport.setAttribute('aria-label', 'Parfums de Marly stills. Scroll or use left and right arrow keys to explore.');
 for (let group = 0; group < 3; group++) {
  const strip = document.createElement('div');
  strip.className = 'still-gallery-group';
  if (group !== 1) strip.setAttribute('aria-hidden', 'true');
  images.forEach((source, index) => {
   const image = document.createElement('img');
   image.src = source;
   image.alt = group === 1 ? `Parfums de Marly product photography — still ${index + 1}` : '';
   image.draggable = false;
   strip.append(image);
  });
  viewport.append(strip);
 }
 const controls = document.createElement('div');
 controls.className = 'still-gallery-controls';
 controls.innerHTML = '<span>SCROLL TO EXPLORE</span><div><button type="button" aria-label="Previous product photo">←</button><button type="button" aria-label="Next product photo">→</button></div>';
 container.append(viewport, controls);
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 let period = 0, target = 0, frame = 0, lastTime = 0;
 function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; target = viewport.scrollLeft; }
 function wrap() {
  if (!period) return;
  const left = viewport.scrollLeft;
  const shift = left < period * .5 ? period : left >= period * 1.5 ? -period : 0;
  if (shift) { viewport.scrollLeft += shift; target += shift; }
 }
 function tick(time) {
  const elapsed = lastTime ? Math.min(time - lastTime, 40) : 16;
  lastTime = time;
  const distance = target - viewport.scrollLeft;
  viewport.scrollLeft += distance * (1 - Math.exp(-elapsed / 85));
  wrap();
  if (Math.abs(target - viewport.scrollLeft) > 1) frame = requestAnimationFrame(tick);
  else { viewport.scrollLeft = target; frame = 0; lastTime = 0; }
 }
 function move(amount) {
  if (!period) return;
  if (!frame) target = viewport.scrollLeft;
  target += Math.max(-period * .8, Math.min(amount, period * .8));
  if (preference.matches) { viewport.scrollLeft = target; wrap(); target = viewport.scrollLeft; }
  else if (!frame) frame = requestAnimationFrame(tick);
 }
 const resize = new ResizeObserver(() => {
  const next = viewport.firstElementChild.getBoundingClientRect().width;
  if (!next) return;
  stop(); period = next; viewport.scrollLeft = period; target = period;
 });
 resize.observe(viewport);
 viewport.addEventListener('scroll', () => { if (!frame) { target = viewport.scrollLeft; wrap(); } });
 viewport.addEventListener('wheel', event => {
  if (event.ctrlKey || !period) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  move(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1));
 }, { passive: false });
 viewport.addEventListener('pointerdown', stop);
 viewport.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault(); move(period / images.length * (event.key === 'ArrowLeft' ? -1 : 1));
 });
 controls.querySelectorAll('button').forEach((button, index) => button.onclick = () => move(period / images.length * (index ? 1 : -1)));
 preference.addEventListener('change', stop);
 return () => { stop(); resize.disconnect(); preference.removeEventListener('change', stop); };
}
