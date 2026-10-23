import { test, expect } from '@playwright/test';
test('portfolio and booking workflow',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://formspree.io/f/mvkkojpb',route=>route.fulfill({json:{ok:true}}));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'IDEAS MEANT TO SCALE.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'Video campaigns',exact:true}).click();
 await expect(page.locator('.project:visible')).toHaveCount(3);
 await page.getByRole('button',{name:'View Stone Island'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Close project'}).click();
 await page.getByRole('button',{name:'All work',exact:true}).click();
 await page.getByLabel('Your name').fill('Test Person');
 await page.getByLabel('Email address').fill('test@example.com');
 await page.getByLabel('What can we help with?').selectOption('Still-image campaign');
 await page.getByLabel('A little about your project').fill('A brand photography project.');
 const submission=page.waitForRequest('https://formspree.io/f/mvkkojpb');
 await page.getByRole('button',{name:'Send enquiry'}).click();
 const request=await submission;
 expect(request.method()).toBe('POST');
 const fields=await new Response(request.postDataBuffer(),{headers:{'Content-Type':request.headers()['content-type']}}).formData();
 expect(Object.fromEntries(fields)).toMatchObject({name:'Test Person',email:'test@example.com',service:'Still-image campaign',message:'A brand photography project.',_gotcha:''});
 await expect(page.locator('#form-status')).toContainText('your enquiry has been sent');
 await expect(page.getByLabel('Your name')).toHaveValue('');
 await page.screenshot({path:`/tmp/mastudio-${test.info().project.name}.png`,fullPage:true});
 expect(errors).toEqual([]);
});

test('featured campaigns cycle and RIMOWA cover opens',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const slides=page.locator('.featured-slide');
 await expect(slides.nth(0)).toHaveAttribute('data-active','true');
 await expect(slides.nth(1)).toHaveAttribute('data-active','false');
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(0)).toHaveAttribute('data-active','false');
 await expect(slides.nth(1)).toHaveAttribute('data-active','true');
 await expect(slides.nth(1)).toHaveAttribute('aria-label','2 of 4: a lifetime of lives');
 await expect(page.locator('#showcase-position')).toHaveText('02 / 04');
 await expect.poll(()=>slides.nth(1).locator('img').evaluate(img=>img.complete&&img.naturalWidth===3838)).toBe(true);
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(2)).toHaveAttribute('data-active','true');
 await expect(slides.nth(2)).toHaveAttribute('aria-label','3 of 4: Stone Island');
 await expect(page.locator('#showcase-position')).toHaveText('03 / 04');
 await expect.poll(()=>slides.nth(2).locator('img').evaluate(img=>img.complete&&img.naturalWidth===5504)).toBe(true);
 await expect(page.locator('.featured-slide .media-caption')).toHaveCount(0);
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(3)).toHaveAttribute('data-active','true');
 await expect(slides.nth(3)).toHaveAttribute('aria-label','4 of 4: Product photography');
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(0)).toHaveAttribute('data-active','true');
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(3)).toHaveAttribute('data-active','true');
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(2)).toHaveAttribute('data-active','true');
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(1)).toHaveAttribute('data-active','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'View a lifetime of lives',exact:true}).click();
 await expect(page.getByRole('dialog').getByRole('heading',{name:'a lifetime of lives',exact:true})).toBeVisible();
 await expect(page.locator('.detail-media iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/yZzb0bxzl5I?rel=0&playsinline=1');
 await page.getByRole('button',{name:'Close project'}).click();
 await page.locator('.hero-media').scrollIntoViewIfNeeded();
 await page.locator('.hero-media').screenshot({path:`/tmp/mastudio-rimowa-${test.info().project.name}.png`});
});


test('product collage stays static and portfolio covers align', async ({page, isMobile}) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const card=page.getByRole('button',{name:'View Product photography',exact:true});
 const cover=card.locator('.project-image img');
 await card.scrollIntoViewIfNeeded();
 await expect(cover).toHaveAttribute('src','/campaigns/product-photography/collage.png');
 await expect.poll(()=>cover.evaluate(img=>img.complete&&img.naturalWidth===5133)).toBe(true);
 if(!isMobile) await card.hover();
 await page.clock.install();
 await page.clock.runFor(6500);
 await expect(cover).toHaveAttribute('src','/campaigns/product-photography/collage.png');
 const boxes=await page.locator('.project-image').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,left:r.left};}));
 for(const box of boxes){
  expect(Math.abs(box.width/box.height-16/9)).toBeLessThan(.02);
  expect(Math.abs(box.width-boxes[0].width)).toBeLessThan(1);
  expect(Math.abs(box.height-boxes[0].height)).toBeLessThan(1);
 }
 if(isMobile){expect(boxes.every(box=>Math.abs(box.left-boxes[0].left)<1)).toBeTruthy();}
 else{
  expect(Math.abs(boxes[0].top-boxes[1].top)).toBeLessThan(1);
  expect(Math.abs(boxes[2].top-boxes[3].top)).toBeLessThan(1);
 }
 await card.click();
 await expect(page.getByRole('dialog').getByRole('heading',{name:'Product photography',exact:true})).toBeVisible();
 await expect(page.locator('#pdm-dialog')).toBeVisible();
 await expect(page.locator('#pdm-dialog .pdm-card img')).toHaveCount(10);
 await expect(page.getByRole('button',{name:'Next product photo'})).toBeVisible();
 await page.getByRole('button',{name:'Close project'}).click();
 await page.locator('.work').screenshot({path:`/tmp/mastudio-even-covers-${isMobile?'mobile':'desktop'}.png`});
});


test('each campaign opens its matching YouTube player and removes it on close', async ({page}) => {
 // Validate local embed wiring without depending on the external player network.
 await page.route('https://www.youtube-nocookie.com/**', route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>External player placeholder</title>'}));
 await page.goto('/');
 await expect(page.locator('iframe')).toHaveCount(0);
 for(const [name,id] of [['Saucony','JLWG4RrAMek'],['a lifetime of lives','yZzb0bxzl5I'],['Stone Island','CIXPhkQkelI']]){
  const card=page.getByRole('button',{name:`View ${name}`,exact:true});
  await expect(card.locator('img')).toHaveCount(1);
  await card.click();
  const player=page.getByRole('dialog').locator('iframe');
  await expect(player).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`);
  await expect(player).toHaveAttribute('title',`${name} campaign film`);
  await expect(player).toHaveAttribute('allowfullscreen','');
  const bounds=await player.boundingBox();
  expect(Math.abs(bounds.width/bounds.height-16/9)).toBeLessThan(.02);
  await expect(page.getByRole('link',{name:'Watch on YouTube'})).toHaveAttribute('href',`https://www.youtube.com/watch?v=${id}`);
  await page.getByRole('button',{name:'Close project'}).click();
  await expect(page.locator('iframe')).toHaveCount(0);
 }
 await page.getByRole('button',{name:'View Product photography',exact:true}).click();
 await expect(page.locator('#pdm-dialog')).toBeVisible();
 await expect(page.locator('#pdm-dialog .pdm-card img')).toHaveCount(10);
 await expect(page.locator('iframe')).toHaveCount(0);
});


test('PDM opens a full-screen depth gallery with looping controls and drag', async ({page,isMobile}) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const card=page.getByRole('button',{name:'View Product photography',exact:true});
 await card.click();
 const dialog=page.locator('#pdm-dialog');
 const stage=dialog.locator('.pdm-stage');
 await expect(dialog).toBeVisible();
 const bounds=await dialog.boundingBox();
 expect(bounds.width).toBe(page.viewportSize().width);
 expect(bounds.height).toBe(page.viewportSize().height);
 await expect.poll(()=>dialog.locator('img').evaluateAll(imgs=>imgs.every(img=>img.complete&&[1792,3584].includes(img.naturalWidth)))).toBe(true);
 await expect(dialog.locator('.pdm-footer')).toContainText('PRODUCT PHOTOGRAPHY');
 await expect(dialog.locator('.pdm-footer')).not.toContainText('PARFUMS DE MARLY');
 const rhodeFrames=dialog.locator('.pdm-card--diptych');
 await expect(rhodeFrames).toHaveCount(4);
 expect(await rhodeFrames.first().evaluate(el=>getComputedStyle(el).borderRadius)).toBe('8px');
 expect(await rhodeFrames.first().locator('img').evaluate(el=>el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width)).toBeCloseTo(2,1);
 const depths=await dialog.locator('.pdm-card').evaluateAll(cards=>cards.map(card=>({distance:Number(card.dataset.distance),width:card.getBoundingClientRect().width})));
 expect(depths.find(card=>card.distance===0).width).toBeGreaterThan(depths.find(card=>card.distance===1).width);
 await expect(dialog.locator('.pdm-counter')).toHaveText('01 / 05');
 for(const count of ['02 / 05','03 / 05','04 / 05','05 / 05','01 / 05']){
  await page.getByRole('button',{name:'Next product photo'}).click();
  await expect(dialog.locator('.pdm-counter')).toHaveText(count);
 }
 await page.getByRole('button',{name:'Previous product photo'}).click();
 await expect(dialog.locator('.pdm-counter')).toHaveText('05 / 05');
 await stage.focus();await page.keyboard.press('ArrowRight');
 await expect(dialog.locator('.pdm-counter')).toHaveText('01 / 05');
 const box=await stage.boundingBox();
 if(isMobile){
  const session=await page.context().newCDPSession(page);
  const y=box.y+box.height/2;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.width*.8,y}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.width*.3,y}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{
  await page.mouse.move(box.width*.7,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.width*.7-250,box.y+box.height/2,{steps:8});await page.mouse.up();
 }
 await expect(dialog.locator('.pdm-counter')).toHaveText('02 / 05');
 await expect(page.getByRole('button',{name:'Pause image loop'})).toBeHidden();
 await page.screenshot({path:`/tmp/pdm-depth-${isMobile?'mobile':'desktop'}.png`});
 await page.keyboard.press('Escape');
 await expect(dialog).toBeHidden();
 await expect(card).toBeFocused();
 await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).toBe('');
 await card.click();await expect(dialog.locator('.pdm-counter')).toHaveText('01 / 05');
 await page.getByRole('button',{name:'Close project'}).click();
 await page.getByRole('button',{name:'View Saucony',exact:true}).click();
 await expect(page.locator('#project-dialog iframe')).toHaveCount(1);
});

test('PDM loop moves smoothly, pauses, and stops for reduced motion',async({page})=>{
 await page.clock.install();
 await page.goto('/');
 await page.getByRole('button',{name:'View Product photography',exact:true}).click();
 const stage=page.locator('#pdm-dialog .pdm-stage');
 const card=page.locator('#pdm-dialog .pdm-card').first();
 const initial=await card.getAttribute('data-distance');
 await page.clock.runFor(15000);
 expect(await card.getAttribute('data-distance')).not.toBe(initial);
 await expect(page.locator('.pdm-counter')).toHaveText('02 / 05');
 await page.getByRole('button',{name:'Pause image loop'}).click();
 await page.clock.runFor(1500);
 const paused=await card.getAttribute('style');
 await page.clock.runFor(3000);
 await expect(card).toHaveAttribute('style',paused);
 await stage.dispatchEvent('wheel',{deltaY:420,deltaMode:0});
 await page.clock.runFor(1500);
 expect(await card.getAttribute('style')).not.toBe(paused);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#pdm-dialog .pdm-play')).toBeHidden();
 const reduced=await card.getAttribute('style');
 await page.clock.runFor(12000);
 await expect(card).toHaveAttribute('style',reduced);
 await page.getByRole('button',{name:'Close project'}).click();
 await page.clock.runFor(3000);
 await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).toBe('');
});


test('cover carousel keeps vertical scrolling free while supporting horizontal browsing',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const stage=page.locator('.hero-media');
 await stage.scrollIntoViewIfNeeded();
 const box=await stage.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.wheel(520,0);
 await expect(page.locator('#showcase-position')).toHaveText('02 / 04');
 const before=await page.evaluate(()=>scrollY);
 await page.mouse.wheel(0,450);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+100);
 await expect(page.locator('#showcase-position')).toHaveText('02 / 04');
 await stage.scrollIntoViewIfNeeded();
 await stage.focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#showcase-position')).toHaveText('03 / 04');
 if(isMobile){
  const session=await page.context().newCDPSession(page);
  const area=await stage.boundingBox();
  const y=area.y+area.height*.45;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:area.x+area.width*.8,y}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:area.x+area.width*.2,y}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#showcase-position')).toHaveText('04 / 04');
  const area2=await stage.boundingBox();
  const previous=await page.evaluate(()=>scrollY);
  const startY=area2.y+area2.height*.85;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:area2.x+area2.width/2,y:startY}]});
  for(let i=1;i<=5;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:area2.x+area2.width/2,y:startY-i*25}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(previous+30);
 }
 await page.getByRole('heading',{name:'View our work',exact:true}).scrollIntoViewIfNeeded();
 await expect(page.getByRole('heading',{name:'View our work',exact:true})).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('cover loop animates, pauses, and respects reduced motion',async({page})=>{
 await page.clock.install();
 await page.goto('/');
 await page.locator('.hero-media').scrollIntoViewIfNeeded();
 const first=page.locator('.featured-slide').first();
 await expect.poll(()=>first.getAttribute('data-distance')).not.toBe('0.000');
 const initial=await first.getAttribute('data-distance');
 await page.clock.runFor(14000);
 expect(await first.getAttribute('data-distance')).not.toBe(initial);
 await page.locator('.hero-media').focus();
 await page.keyboard.press('Space');
 await page.clock.runFor(1500);
 const paused=await first.getAttribute('style');
 await page.clock.runFor(3000);
 await expect(first).toHaveAttribute('style',paused);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#showcase-play')).toHaveCount(0);
 const reduced=await first.getAttribute('style');
 await page.clock.runFor(12000);
 await expect(first).toHaveAttribute('style',reduced);
});
