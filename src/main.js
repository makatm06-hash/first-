import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/noto-sans-symbols-2/400.css';
import './style.css';
import { filterProjects, initMotion } from './motion.js';
import { initPdmGallery } from './pdm-gallery.js';
import { initCoverCarousel } from './cover-carousel.js';
import { initEnquiryForm } from './enquiry-form.js';
import { arrowIcon } from './icons.js';

const projects = [
 {name:'Saucony',youtubeId:'JLWG4RrAMek',category:'Video campaigns',number:'01',image:'/campaigns/saucony-cover.png',alt:'Saucony campaign: three athletes in black and white with a lime-green Saucony logo',campaign:true,description:'Selected campaign imagery for Saucony.'},
 {name:'a lifetime of lives',youtubeId:'yZzb0bxzl5I',client:'RIMOWA',category:'Video campaigns',number:'02',image:'/campaigns/rimowa-a-lifetime-of-lives.png',alt:'RIMOWA campaign: a woman sitting behind a silver suitcase in a warmly lit living room',campaign:true,description:'RIMOWA — a lifetime of lives.'},
 {name:'Stone Island',youtubeId:'CIXPhkQkelI',category:'Video campaigns',number:'03',image:'/campaigns/stone-island-cover.png',alt:'Stone Island campaign: a model in a black jacket on a rugged landscape beneath a drone',campaign:true,description:'Selected campaign imagery for Stone Island.'},
 {name:'Product photography',gallery:'pdm',category:'Still images',number:'04',image:'/campaigns/product-photography/collage.png',alt:'Product photography collage: fragrance bottles, chess pieces, and warm golden light',campaign:true,description:'A product photography series exploring fragrance, light, and texture.'},
 {name:'Fashion campaigns',category:'Fashion campaigns',number:'05',image:'/campaigns/fashion-campaigns.png',alt:'On fashion campaign collage featuring athletes in running apparel and trainers against blue skies',campaign:true,featured:false,description:'Fashion campaign imagery for On.'},
];
const featuredProjects = projects.filter(project => project.campaign && project.featured !== false);
// User-supplied client artwork. Adobe retains its existing symbol and wordmark.
const clientBrands = [
 { name: 'Ninja', slug: 'ninja', logo: '/logos/ninja.png' },
 { name: 'Shark', slug: 'shark', logo: '/logos/shark.png' },
 { name: 'Sodii', slug: 'sodii', logo: '/logos/sodii.png' },
 { name: 'Adobe', slug: 'adobe', logo: '/logos/adobe.svg' },
];
const clientLogos = clientBrands.map(brand => `
 <span class="client-logo client-logo--${brand.slug}${brand.logo && brand.slug !== 'adobe' ? ' client-logo--artwork' : ''}" role="img" aria-label="${brand.name}">
  ${brand.logo ? `<img src="${brand.logo}" alt="" width="40" height="40">` : ''}
  ${!brand.logo || brand.slug === 'adobe' ? `<span aria-hidden="true">${brand.name}</span>` : ''}
 </span>`).join('');
const arrow = `<span aria-hidden="true">${arrowIcon()}</span>`;
document.querySelector('#app').innerHTML = `
<header class="nav"><a href="#" class="wordmark" aria-label="Mastudio home">MASTUDIO.</a><nav aria-label="Main navigation"><a href="#work">Work <sup>${String(projects.length).padStart(2, '0')}</sup></a><a href="#studio">Agency</a><a href="#booking" class="nav-cta">Let’s talk ${arrow}</a></nav></header>
<main>
<section class="hero" aria-labelledby="hero-title"><div class="hero-top"><span class="eyebrow"><i class="status"></i> AI CREATIVE PRODUCTION AGENCY</span><span class="eyebrow hero-location">VIDEO. STILLS. FULL AI PRODUCTION.</span></div><h1 id="hero-title"><span class="hero-title-line">IDEAS MEANT</span><span class="hero-title-line">TO <span class="outline">SCALE.</span></span><span class="hero-asterisk" aria-hidden="true">✳︎</span></h1><div class="hero-bottom"><p>We create video campaigns, commercials and still-image campaigns for leading DTC and B2B brands. Full AI production, from first concept to final delivery.</p><a class="round-link" href="#work"><span>EXPLORE THE WORK</span><b aria-hidden="true">${arrowIcon('down')}</b></a></div><div class="hero-media hero-media--campaign" role="region" aria-roledescription="carousel" aria-label="Featured campaigns" tabindex="0" aria-describedby="cover-instructions">${featuredProjects.map((p,i)=>`<div class="featured-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${featuredProjects.length}: ${p.name}" ${i?'hidden':''}><img src="${p.image}" alt="${p.alt}" ${i?'loading="lazy"':'fetchpriority="high"'}><div class="media-shade"></div><span class="media-note">FEATURED CAMPAIGN / ${(p.client || p.name).toUpperCase()}</span></div>`).join('')}<p id="cover-instructions" class="cover-hint">Drag to explore</p><div class="showcase-controls"><button type="button" id="showcase-play" aria-label="Pause featured campaign loop">Pause</button><span id="showcase-position" aria-live="off" aria-atomic="true">01 / ${String(featuredProjects.length).padStart(2, '0')}</span><button type="button" id="showcase-prev" aria-label="Previous featured campaign"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><button type="button" id="showcase-next" aria-label="Next featured campaign"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></div></section>
<section class="clients" aria-label="Client logos"><div class="section-kicker"><span class="client-intro">brands we have worked with</span></div><div class="marquee"><div class="marquee-track">${[0,1].map((v)=>`<div class="logo-group" ${v?'aria-hidden="true"':''}>${clientLogos}</div>`).join('')}</div></div></section>
<section id="work" class="work section"><div class="section-kicker"><span>01 / SELECTED WORK</span><span>CAMPAIGNS BUILT WITH AI</span></div><div class="section-heading"><h2>View our work</h2></div><div class="work-toolbar"><div class="filters" role="group" aria-label="Filter projects">${['All work','Video campaigns','Still images','Fashion campaigns'].map((x,i)=>`<button class="filter ${i===0?'active':''}" data-filter="${x}" aria-pressed="${i===0}">${x}</button>`).join('')}</div></div><div class="project-grid">${projects.map((p,i)=>`<button class="project reveal${p.campaign ? ' project--campaign' : ''}" data-project="${i}" data-category="${p.category}" aria-label="View ${p.name}"><div class="project-image"><img src="${p.image}" alt="${p.alt || `${p.name} — sample portfolio artwork`}" loading="lazy"><span class="project-open" aria-hidden="true">${arrowIcon()}</span><span class="project-index">/${p.number}</span></div><div class="project-caption"><h3>${p.name}</h3><span>${p.category}</span></div></button>`).join('')}</div></section>
<section id="studio" class="studio section"><div class="section-kicker"><span>02 / THE AGENCY</span><span>FULL AI PRODUCTION. BUILT TO SCALE.</span></div><div class="studio-content"><div class="studio-symbol" aria-hidden="true">✳︎</div><div><h2>Full AI.<br>Full production.</h2><p>MASTUDIO is an AI creative production agency creating video campaigns, commercials and still-image campaigns for leading DTC and B2B brands.</p><p>We bring creative direction and full AI production together, from concept to final delivery. We also handle all post-production editing. Whether you need one campaign or a steady flow of content, we build the production around your brand and the scale you need.</p><div class="services"><span>Video campaigns</span><span>Commercials</span><span>Still-image campaigns</span><span>Full AI production</span></div><a href="#booking" class="text-button">LET’S BUILD YOUR NEXT CAMPAIGN ${arrow}</a></div></div></section>
<section id="booking" class="booking section"><div class="section-kicker"><span>03 / START A CONVERSATION</span><span><i class="status"></i> OPEN FOR COLLABORATIONS</span></div><div class="booking-layout"><div><h2>Your next<br>campaign.</h2><p>Tell us about your brand, your campaign and what you want to create. We’ll shape the AI production around it.</p><span class="booking-star" aria-hidden="true">${arrowIcon()}</span></div><form id="booking-form" action="https://formspree.io/f/mvkkojpb" method="POST"><input type="hidden" name="_subject" value="MASTUDIO — New project enquiry"><div class="booking-trap" aria-hidden="true"><label>Leave this field empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div><div class="form-row"><label>Your name<input name="name" autocomplete="name" placeholder="Max Adams" required maxlength="100"></label><label>Email address<input type="email" name="email" autocomplete="email" placeholder="Max@yourcompany.com" required></label></div><label>What can we help with?<select name="service" required><option value="">Select a service</option><option>Video campaign</option><option>Commercial</option><option>Still-image campaign</option><option>Full AI production</option></select></label><div class="form-row"><label>Ideal project date<input type="date" name="date"></label><label>Budget range<select name="budget"><option value="">Select a range (optional)</option><option>£500–£2,000</option><option>£2,000–£5,000</option><option>£5,000–£10,000</option><option>Let’s discuss</option></select></label></div><label>A little about your project<textarea name="message" rows="3" placeholder="Your brand, campaign idea, deliverables and timeline…" required maxlength="5000"></textarea></label><button class="submit-button" type="submit">Send enquiry ${arrow}</button><p id="form-status" role="status"></p></form></div></section>
</main><footer><div class="footer-top"><span>YOUR NEXT CAMPAIGN STARTS HERE.</span><a href="#">BACK TO TOP ${arrowIcon('up')}</a></div><div class="footer-wordmark">MASTUDIO.</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} MASTUDIO</span><span>AI PRODUCTION. HUMAN CREATIVITY.</span></div></footer>
<dialog id="project-dialog"><button class="close-dialog" aria-label="Close project">✕</button><div id="project-detail"></div></dialog>
<dialog id="editor-dialog"><button class="close-dialog" aria-label="Close media editor">✕</button><div class="editor-content"><span class="eyebrow">YOUR WORK. YOUR WAY.</span><h2>Make it yours.</h2><p>Choose an image or video for each project. Media is saved in this browser only; it won’t update a published website.</p><div id="editor-fields">${projects.map((p,i)=>`<label class="upload-label">${p.number} / ${p.name}<input type="file" accept="image/*,video/*" data-upload="${i}"></label>`).join('')}</div><button id="reset-media" class="text-button">Restore campaign covers</button><p id="editor-status" role="status"></p></div></dialog>`;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});filterProjects(button.dataset.filter);}));
let db;
const media = new Map();
const urls = new Map();
function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open('mastudio-media',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function storeMedia(key,value){return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');const store=tx.objectStore('projects');value?store.put(value,key):store.clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function renderMedia(i, container, controls = false) {
 const project = projects[i];
 const saved = media.get(i);
 const localUrl = urls.get(i);
 // Campaign films belong in the project viewer; grid covers stay as images.
 const videoSource = saved?.type.startsWith('video/') ? localUrl : controls && !saved ? project.video : null;
 const youtubeId = controls && !saved ? project.youtubeId : null;
 container.classList.toggle('detail-media--video', Boolean(controls && (youtubeId || videoSource)));
 container.replaceChildren();
 if (youtubeId) {
  const player = document.createElement('iframe');
  player.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1`;
  player.title = `${project.name} campaign film`;
  player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  player.allowFullscreen = true;
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  container.append(player);
 } else if (videoSource) {
  const video = document.createElement('video');
  video.src = videoSource;
  video.poster = project.image;
  video.controls = controls;
  video.muted = !controls;
  video.loop = !controls;
  video.playsInline = true;
  video.autoplay = !controls && !reduced;
  video.preload = 'metadata';
  video.setAttribute('aria-label', `${project.name} campaign film`);
  container.append(video);
 } else {
  const image = document.createElement('img');
  image.src = localUrl || project.image;
  image.alt = project.alt || project.name;
  container.append(image);
 }
}
function updateCard(i){const container=document.querySelector(`[data-project="${i}"] .project-image`);renderMedia(i,container);container.insertAdjacentHTML('beforeend',`<span class="project-open" aria-hidden="true">${arrowIcon()}</span><span class="project-index">/${projects[i].number}</span>`);}
openDatabase().then(database=>{db=database;const req=db.transaction('projects').objectStore('projects').openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){media.set(Number(cursor.key),cursor.value);urls.set(Number(cursor.key),URL.createObjectURL(cursor.value));updateCard(Number(cursor.key));cursor.continue();}};}).catch(()=>{document.querySelector('#editor-status').textContent='Browser storage is unavailable. Uploads will last for this visit only.';});
const projectDialog=document.querySelector('#project-dialog');
const pdmGallery = initPdmGallery();
document.querySelectorAll('[data-project]').forEach(card=>card.addEventListener('click',()=>{const i=Number(card.dataset.project);const p=projects[i];if(p.gallery==='pdm'&&!media.has(i)){pdmGallery.open();return;}const detail=document.querySelector('#project-detail');detail.innerHTML=`<div class="detail-media"></div><div class="detail-copy"><span class="eyebrow">${p.category} / ${p.number}</span><h2>${p.name}</h2><p>${p.description}</p>${p.youtubeId ? `<a class="youtube-link" href="https://www.youtube.com/watch?v=${p.youtubeId}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>` : ''}<a class="text-button" href="#booking" id="project-enquiry">Start a project like this ${arrow}</a></div>`;renderMedia(i,detail.querySelector('.detail-media'),true);detail.querySelector('#project-enquiry').onclick=()=>projectDialog.close();projectDialog.showModal();}));
document.querySelectorAll('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d)d.close();});d.addEventListener('close',()=>{d.querySelectorAll('video').forEach(v=>v.pause());d.querySelectorAll('iframe').forEach(frame=>frame.remove());});});
const editor=document.querySelector('#editor-dialog');
document.querySelectorAll('[data-upload]').forEach(input=>input.onchange=async()=>{const file=input.files[0];if(!file)return;const status=document.querySelector('#editor-status');if(!/^(image|video)\//.test(file.type)){status.textContent='Please choose an image or video.';return;}if(file.size>100*1024*1024){status.textContent='Please choose a file smaller than 100 MB.';return;}const i=Number(input.dataset.upload);try{if(db)await storeMedia(i,file);if(urls.has(i))URL.revokeObjectURL(urls.get(i));media.set(i,file);urls.set(i,URL.createObjectURL(file));updateCard(i);status.textContent=db?'Media saved in this browser.':'Media updated for this visit.';}catch{status.textContent='Could not save this file. Browser storage may be full.';}});
document.querySelector('#reset-media').onclick=async()=>{try{if(db)await storeMedia(null,null);urls.forEach(url=>URL.revokeObjectURL(url));urls.clear();media.clear();projects.forEach((_,i)=>updateCard(i));document.querySelectorAll('[data-upload]').forEach(i=>i.value='');document.querySelector('#editor-status').textContent='Campaign covers restored.';}catch{document.querySelector('#editor-status').textContent='Could not reset saved media.';}};
const dateInput=document.querySelector('[name="date"]');const today=new Date();dateInput.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
initEnquiryForm(document.querySelector('#booking-form'));

initCoverCarousel();

initMotion();
