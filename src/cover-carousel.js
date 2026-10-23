const wrap = (value, length) => ((value % length) + length) % length;

// This carousel uses horizontal gestures only; vertical scrolling stays native.
export function initCoverCarousel() {
 const stage = document.querySelector('.hero-media');
 const slides = [...stage.querySelectorAll('.featured-slide')];
 const counter = stage.querySelector('#showcase-position');
 const play = stage.querySelector('#showcase-play');
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 let position = 0, target = 0, frame = 0, lastTime = 0, resumeAt = 0;
 let paused = false, visible = false, active = -1, gesture;
 const automatic = () => visible && !document.hidden && !preference.matches && !paused && !gesture?.dragging;
 slides.forEach(slide => { slide.hidden = false; });
 function render() {
  const width = slides[0].offsetWidth;
  const selected = wrap(Math.round(position), slides.length);
  slides.forEach((slide, index) => {
   const distance = wrap(index - position + slides.length / 2, slides.length) - slides.length / 2;
   const depth = Math.abs(distance);
   const scale = Math.pow(.74, depth);
   const x = Math.sign(distance) * width * .8 * (1 - scale) / .26;
   slide.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
   slide.style.zIndex = String(20 - Math.round(depth * 8));
   slide.style.opacity = String(Math.min(1, Math.max(0, (slides.length / 2 - depth) * 3)));
   slide.dataset.distance = distance.toFixed(3);
   if (selected !== active) {
    slide.dataset.active = String(index === selected);
    slide.setAttribute('aria-hidden', String(index !== selected));
   }
  });
  if (selected !== active) {
   active = selected;
   counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
 }
 function schedule() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); }
 function tick(time) {
  frame = 0;
  if (!visible || document.hidden) { lastTime = 0; return; }
  const elapsed = lastTime ? Math.min(time - lastTime, 40) : 16;
  lastTime = time;
  if (automatic() && time > resumeAt) target += elapsed / 10000;
  position = preference.matches ? target : position + (target - position) * (1 - Math.exp(-elapsed / 125));
  const turns = Math.floor(position / slides.length);
  if (turns) { position -= turns * slides.length; target -= turns * slides.length; }
  render();
  if (automatic() || Math.abs(target - position) > .0001) schedule();
  else lastTime = 0;
 }
 function move(amount, snap = false) {
  target = snap ? Math.round(target) + amount : target + amount;
  resumeAt = performance.now() + 2400;
  if (preference.matches) { position = target; render(); }
  else schedule();
 }
 function updatePlay() {
  play.hidden = preference.matches;
  counter.setAttribute('aria-live', paused || preference.matches ? 'polite' : 'off');
  play.textContent = paused ? 'Play' : 'Pause';
  play.setAttribute('aria-label', paused ? 'Play featured campaign loop' : 'Pause featured campaign loop');
 }
 stage.querySelector('#showcase-prev').onclick = () => move(-1, true);
 stage.querySelector('#showcase-next').onclick = () => move(1, true);
 play.onclick = () => { paused = !paused; updatePlay(); schedule(); };
 stage.addEventListener('wheel', event => {
  if (event.ctrlKey) return;
  // A normal wheel / two-finger vertical gesture always scrolls down the page.
  const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.5;
  if (!horizontal && !event.shiftKey) return;
  event.preventDefault();
  const delta = horizontal ? event.deltaX : event.deltaY;
  const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1);
  move(Math.max(-1, Math.min(1, pixels / 520)));
 }, { passive: false });
 stage.addEventListener('keydown', event => {
  if (event.target !== stage || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1, true);
 });
 stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest('button,a')) return;
  gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, dragging: false };
 });
 stage.addEventListener('pointermove', event => {
  if (!gesture || event.pointerId !== gesture.id) return;
  const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
  if (!gesture.dragging) {
   if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
   if (Math.abs(dy) >= Math.abs(dx)) { gesture = undefined; return; }
   gesture.dragging = true; target = position;
   stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
  }
  move((gesture.lastX - event.clientX) / Math.max(slides[0].offsetWidth * .8, 1));
  gesture.lastX = event.clientX;
 });
 function release(event) {
  if (!gesture || event.pointerId !== gesture.id) return;
  const dragged = gesture.dragging;
  gesture = undefined; stage.classList.remove('is-dragging');
  if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  if (dragged) move(0, true);
 }
 stage.addEventListener('pointerleave', () => { if (gesture && !gesture.dragging) gesture = undefined; });
 stage.addEventListener('pointerup', release);
 stage.addEventListener('pointercancel', release);
 stage.addEventListener('lostpointercapture', release);
 preference.addEventListener('change', () => {
  cancelAnimationFrame(frame); frame = 0; lastTime = 0;
  position = target = Math.round(position); updatePlay(); render(); schedule();
 });
 document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(frame); frame = 0; lastTime = 0; schedule();
 });
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   visible = entries[0].isIntersecting;
   cancelAnimationFrame(frame); frame = 0; lastTime = 0;
   if (!visible) { gesture = undefined; stage.classList.remove('is-dragging'); }
   else schedule();
  });
  observer.observe(stage);
 } else { visible = true; schedule(); }
 new ResizeObserver(render).observe(stage);
 resumeAt = performance.now() + 1800;
 updatePlay(); render();
}
