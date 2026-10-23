import { arrowIcon } from './icons.js';

const stills = [
 { source: '/campaigns/product-photography/still-1.png', description: 'A close-up of a dark Parfums de Marly bottle in warm sunlight.' },
 { source: '/campaigns/product-photography/still-2.png', description: 'Parfums de Marly fragrance bottles among chess pieces and vanilla pods.' },
 { source: '/campaigns/product-photography/still-3.png', description: 'A pale Parfums de Marly bottle with chess pieces in golden light.' },
 { source: '/campaigns/product-photography/rhode.png', crop: 'left', description: 'Rhode peptide lip treatment campaign: a model in sunglasses with a yellow lip treatment tube.' },
 { source: '/campaigns/product-photography/rhode.png', crop: 'right', description: 'A yellow Rhode peptide lip treatment tube tucked into a black leather pocket.' },
];
const modulo = (value, length) => ((value % length) + length) % length;

export function initPdmGallery() {
 const dialog = document.createElement('dialog');
 dialog.id = 'pdm-dialog';
 dialog.className = 'pdm-dialog';
 dialog.setAttribute('aria-labelledby', 'pdm-title');
 dialog.innerHTML = `
  <div class="pdm-layout">
   <header class="pdm-header">
    <span class="wordmark">MASTUDIO.</span>
    <h2 id="pdm-title">Product photography</h2>
    <button class="pdm-close" type="button" aria-label="Close project">Back to work <span aria-hidden="true">×</span></button>
   </header>
   <div class="pdm-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Product photography image gallery" aria-describedby="pdm-instructions">
    <div class="pdm-cards" aria-hidden="true"></div>
    <p class="pdm-loading" role="status" hidden>Loading images…</p>
   </div>
   <footer class="pdm-footer">
    <div><p>PRODUCT PHOTOGRAPHY</p></div>
    <p id="pdm-instructions">Scroll or drag to explore</p>
    <div class="pdm-controls">
     <button class="pdm-play" type="button" aria-label="Pause image loop">Pause <span aria-hidden="true">Ⅱ</span></button>
     <span class="pdm-counter" aria-live="off">01 / ${String(stills.length).padStart(2, '0')}</span>
     <button class="pdm-prev" type="button" aria-label="Previous product photo">${arrowIcon('left')}</button>
     <button class="pdm-next" type="button" aria-label="Next product photo">${arrowIcon('right')}</button>
    </div>
   </footer>
   <p class="pdm-description visually-hidden" aria-live="polite"></p>
  </div>`;
 document.body.append(dialog);
 const stage = dialog.querySelector('.pdm-stage');
 const counter = dialog.querySelector('.pdm-counter');
 const loading = dialog.querySelector('.pdm-loading');
 const description = dialog.querySelector('.pdm-description');
 const play = dialog.querySelector('.pdm-play');
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 // Repeat complete sets so recycling stays outside the visible fan.
 const slotCount = Math.ceil(9 / stills.length) * stills.length;
 const cards = Array.from({ length: slotCount }, (_, index) => {
  const card = document.createElement('div');
  const still = stills[index % stills.length];
  card.className = `pdm-card${still.crop ? ` pdm-card--diptych pdm-card--${still.crop}` : ''}`;
  card.dataset.still = String(index % stills.length + 1);
  const image = document.createElement('img');
  image.dataset.source = stills[index % stills.length].source;
  image.alt = '';
  image.draggable = false;
  card.append(image);
  dialog.querySelector('.pdm-cards').append(card);
  return card;
 });
 let position = 0, target = 0, frame = 0, previousTime = 0;
 let paused = false, dragging = false, pointerId, lastX = 0, resumeAt = 0;
 let activeIndex = -1, opener, oldOverflow = '', announceNext = false;
 const automatic = () => !preference.matches && !paused && !dragging && !document.hidden;
 function render(announce = false) {
  const width = cards[0].offsetWidth;
  cards.forEach((card, index) => {
   const distance = modulo(index - position + slotCount / 2, slotCount) - slotCount / 2;
   const depth = Math.abs(distance);
   const scale = Math.pow(.72, depth);
   const x = Math.sign(distance) * width * .82 * (1 - scale) / .28;
   card.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
   card.style.zIndex = String(100 - Math.round(depth * 20));
   card.style.opacity = String(Math.min(1, Math.max(0, (4.4 - depth) * 2)));
   card.dataset.distance = distance.toFixed(3);
  });
  const index = modulo(Math.round(position), stills.length);
  if (index !== activeIndex) {
   activeIndex = index;
   counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stills.length).padStart(2, '0')}`;
  }
  if (announce) description.textContent = `Image ${index + 1} of ${stills.length}. ${stills[index].description}`;
 }
 function tick(time) {
  frame = 0;
  if (!dialog.open || document.hidden) { previousTime = 0; return; }
  const elapsed = previousTime ? Math.min(time - previousTime, 40) : 16;
  previousTime = time;
  if (automatic() && time > resumeAt) target += elapsed / 10000;
  position = preference.matches ? target : position + (target - position) * (1 - Math.exp(-elapsed / 115));
  // Keep values small without changing the repeated image sequence.
  const turns = Math.floor(position / slotCount);
  if (turns) { position -= turns * slotCount; target -= turns * slotCount; }
  render();
  if (announceNext && Math.abs(target - position) < .01) { render(true); announceNext = false; }
  if (automatic() || Math.abs(target - position) > .0001) schedule();
  else previousTime = 0;
 }
 function schedule() { if (!frame && dialog.open && !document.hidden) frame = requestAnimationFrame(tick); }
 function move(amount, snap = false) {
  if (!dialog.open) return;
  target = snap ? Math.round(target) + amount : target + amount;
  resumeAt = performance.now() + 2200; announceNext = true;
  if (preference.matches) { position = target; render(true); announceNext = false; }
  else schedule();
 }
 function updatePlay() {
  play.hidden = preference.matches;
  play.setAttribute('aria-label', paused ? 'Play image loop' : 'Pause image loop');
  play.innerHTML = paused ? 'Play <span aria-hidden="true">▷</span>' : 'Pause <span aria-hidden="true">Ⅱ</span>';
 }
 dialog.querySelector('.pdm-close').onclick = () => dialog.close();
 dialog.querySelector('.pdm-prev').onclick = () => move(-1, true);
 dialog.querySelector('.pdm-next').onclick = () => move(1, true);
 play.onclick = () => { paused = !paused; updatePlay(); schedule(); };
 stage.addEventListener('wheel', event => {
  if (event.ctrlKey) return;
  event.preventDefault();
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1);
  move(Math.max(-1, Math.min(1, pixels / 420)));
 }, { passive: false });
 stage.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1, true);
 });
 stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  dragging = true; pointerId = event.pointerId; lastX = event.clientX;
  target = position; stage.setPointerCapture(pointerId); stage.classList.add('is-dragging');
 });
 stage.addEventListener('pointermove', event => {
  if (!dragging || event.pointerId !== pointerId) return;
  move((lastX - event.clientX) / Math.max(cards[0].offsetWidth * .8, 1));
  lastX = event.clientX;
 });
 function endDrag(event) {
  if (!dragging || event.pointerId !== pointerId) return;
  dragging = false; stage.classList.remove('is-dragging');
  if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
  pointerId = undefined; move(0, true);
 }
 stage.addEventListener('pointerup', endDrag);
 stage.addEventListener('pointercancel', endDrag);
 stage.addEventListener('lostpointercapture', endDrag);
 dialog.addEventListener('close', () => {
  cancelAnimationFrame(frame); frame = 0; previousTime = 0; dragging = false;
  stage.classList.remove('is-dragging');
  document.body.style.overflow = oldOverflow;
  opener?.focus({ preventScroll: true });
 });
 preference.addEventListener('change', () => {
  if (!dialog.open) return;
  cancelAnimationFrame(frame); frame = 0; previousTime = 0;
  position = target = Math.round(position); updatePlay(); render(true); schedule();
 });
 document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(frame); frame = 0; previousTime = 0; schedule();
 });
 const resize = new ResizeObserver(() => { if (dialog.open) render(); });
 resize.observe(stage);
 return {
  open() {
   opener = document.activeElement;
   oldOverflow = document.body.style.overflow;
   position = target = 0; paused = false; activeIndex = -1; announceNext = false; resumeAt = performance.now() + 1200;
   dialog.showModal(); document.body.style.overflow = 'hidden';
   stage.setAttribute('aria-busy', 'true'); loading.hidden = false; loading.textContent = 'Loading images…';
   const images = cards.map(card => card.firstElementChild);
   images.forEach(image => {
    if (!image.getAttribute('src') || (image.complete && !image.naturalWidth)) image.src = image.dataset.source;
   });
   Promise.all(images.map(image => image.decode())).then(() => {
    loading.hidden = true; stage.setAttribute('aria-busy', 'false');
   }).catch(() => { loading.textContent = 'Could not load the images. Please close and try again.'; });
   updatePlay(); render(true); schedule();
  },
 };
}
