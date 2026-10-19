const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction < 0 ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;

export function createProductGallery(slides, { trigger, controls = false } = {}) {
 const element = document.createElement('div');
 element.className = 'product-gallery';
 const images = slides.map((slide, index) => {
  const image = document.createElement('img');
  image.alt = slide.alt;
  image.className = 'product-gallery-image';
  image.dataset.slide = String(index + 1);
  image.classList.toggle('is-active', index === 0);
  image.setAttribute('aria-hidden', String(index !== 0));
  if (index === 0) image.src = slide.image;
  element.append(image);
  return image;
 });
 let current = 0, timer = null, generation = 0, destroyed = false;
 let hovered = false, focused = false;
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const target = trigger || element;
 let counter;
 async function show(index) {
  const request = ++generation;
  const image = images[index];
  if (!image.src) image.src = slides[index].image;
  try { await image.decode(); } catch { return; }
  if (destroyed || request !== generation) return;
  current = index;
  images.forEach((img, i) => {
   img.classList.toggle('is-active', i === current);
   img.setAttribute('aria-hidden', String(i !== current));
  });
  if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
 }
 function reset() {
  ++generation;
  clearInterval(timer); timer = null;
  current = 0;
  images.forEach((img, i) => {
   img.classList.toggle('is-active', i === 0);
   img.setAttribute('aria-hidden', String(i !== 0));
  });
  if (counter) counter.textContent = `1 / ${slides.length}`;
 }
 function stop() { hovered = focused = false; reset(); }
 function start() {
  if (timer || destroyed || reducedMotion.matches || document.hidden) return;
  images.forEach((img, i) => { if (!img.src) img.src = slides[i].image; });
  timer = setInterval(() => { void show((current + 1) % slides.length); }, 3000);
 }
 function enter(event) { if (event.pointerType === 'mouse' || event.pointerType === 'pen') { hovered = true; start(); } }
 function leave() { hovered = false; reset(); }
 function focus(event) { if (event.target === target && target.matches(':focus-visible')) { focused = true; start(); } }
 function blur(event) { if (!target.contains(event.relatedTarget)) { focused = false; if (!hovered) reset(); } }
 function visibility() { if (document.hidden) stop(); }
 function preference() { reset(); if ((hovered || focused) && !reducedMotion.matches) start(); }
 target.addEventListener('pointerenter', enter);
 target.addEventListener('pointerleave', leave);
 target.addEventListener('focusin', focus);
 target.addEventListener('focusout', blur);
 target.addEventListener('gallery:reset', stop);
 document.addEventListener('visibilitychange', visibility);
 window.addEventListener('blur', stop);
 reducedMotion.addEventListener('change', preference);
 if (controls) {
  const navigation = document.createElement('div');
  navigation.className = 'product-gallery-controls';
  counter = document.createElement('span');
  counter.textContent = `1 / ${slides.length}`;
  counter.setAttribute('aria-live', 'polite');
  navigation.append(counter);
  for (const direction of [-1, 1]) {
   const button = document.createElement('button');
   button.type = 'button';
   button.setAttribute('aria-label', `${direction < 0 ? 'Previous' : 'Next'} product photo`);
   button.innerHTML = arrow(direction);
   button.addEventListener('click', () => {
    clearInterval(timer); timer = null;
    void show((current + direction + slides.length) % slides.length);
   });
   navigation.append(button);
  }
  element.append(navigation);
 }
 return { element, reset: stop, destroy() {
  destroyed = true; stop();
  target.removeEventListener('pointerenter', enter);
  target.removeEventListener('pointerleave', leave);
  target.removeEventListener('focusin', focus);
  target.removeEventListener('focusout', blur);
  target.removeEventListener('gallery:reset', stop);
  document.removeEventListener('visibilitychange', visibility);
  window.removeEventListener('blur', stop);
  reducedMotion.removeEventListener('change', preference);
 } };
}
