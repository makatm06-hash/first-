import { test, expect } from '@playwright/test';
test('portfolio, media upload, and booking workflow',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'IDEAS MEANT TO SCALE.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'Video campaigns',exact:true}).click();
 await expect(page.locator('.project:visible')).toHaveCount(3);
 await page.getByRole('button',{name:'View Stone Island'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Close project'}).click();
 await page.getByRole('button',{name:'All work',exact:true}).click();
 await page.getByRole('button',{name:'Edit media ↗',exact:true}).click();
 await page.locator('[data-upload="0"]').setInputFiles({name:'test.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>')});
 await expect(page.locator('#editor-status')).toContainText('Media saved');
 await page.getByRole('button',{name:'Close media editor'}).click();
 await page.reload();
 await expect(page.locator('[data-project="0"] img')).toHaveAttribute('src',/^blob:/);
 await page.getByLabel('Your name').fill('Test Person');
 await page.getByLabel('Email address').fill('test@example.com');
 await page.getByLabel('What can we help with?').selectOption('Still-image campaign');
 await page.getByLabel('A little about your project').fill('A brand photography project.');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Prepare booking request'}).click();
 expect((await download).suggestedFilename()).toBe('mastudio-booking-request.txt');
 await expect(page.locator('#form-status')).toContainText('It has not been sent');
 await page.screenshot({path:`/tmp/mastudio-${test.info().project.name}.png`,fullPage:true});
 expect(errors).toEqual([]);
});

test('featured campaigns cycle and RIMOWA cover opens',async({page})=>{
 await page.goto('/');
 const slides=page.locator('.featured-slide');
 await expect(slides.nth(0)).toBeVisible();
 await expect(slides.nth(1)).toBeHidden();
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(0)).toBeHidden();
 await expect(slides.nth(1)).toBeVisible();
 await expect(slides.nth(1)).toHaveAttribute('aria-label','2 of 4: a lifetime of lives');
 await expect(page.locator('#showcase-position')).toHaveText('02 / 04');
 await expect.poll(()=>slides.nth(1).locator('img').evaluate(img=>img.complete&&img.naturalWidth===3838)).toBe(true);
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(2)).toBeVisible();
 await expect(slides.nth(2)).toHaveAttribute('aria-label','3 of 4: Stone Island');
 await expect(page.locator('#showcase-position')).toHaveText('03 / 04');
 await expect.poll(()=>slides.nth(2).locator('img').evaluate(img=>img.complete&&img.naturalWidth===5504)).toBe(true);
 await expect(page.locator('.featured-slide .media-caption')).toHaveCount(0);
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(3)).toBeVisible();
 await expect(slides.nth(3)).toHaveAttribute('aria-label','4 of 4: Product photography');
 await page.getByRole('button',{name:'Next featured campaign'}).click();
 await expect(slides.nth(0)).toBeVisible();
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(3)).toBeVisible();
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(2)).toBeVisible();
 await page.getByRole('button',{name:'Previous featured campaign'}).click();
 await expect(slides.nth(1)).toBeVisible();
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
 await expect(page.locator('.still-gallery-group:not([aria-hidden]) img')).toHaveCount(3);
 await expect(page.locator('.still-gallery-group:not([aria-hidden]) img').first()).toHaveAttribute('src','/campaigns/product-photography/still-1.png');
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
 await expect(page.locator('.still-gallery-group:not([aria-hidden]) img')).toHaveCount(3);
 await expect(page.locator('.still-gallery-group:not([aria-hidden]) img').first()).toHaveAttribute('src','/campaigns/product-photography/still-1.png');
 await expect(page.locator('iframe')).toHaveCount(0);
});


test('product still viewer loops, responds to controls, and resets on reopening', async ({page}) => {
 await page.goto('/');
 const card=page.getByRole('button',{name:'View Product photography',exact:true});
 await card.click();
 const gallery=page.locator('.still-gallery');
 await expect.poll(()=>gallery.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 const start=await gallery.evaluate(el=>el.scrollLeft);
 await page.getByRole('button',{name:'Next product photo'}).click();
 await expect.poll(()=>gallery.evaluate(el=>el.scrollLeft)).toBeGreaterThan(start+50);
 await gallery.focus();
 await page.keyboard.press('ArrowLeft');
 await expect.poll(()=>gallery.evaluate((el,origin)=>Math.abs(el.scrollLeft-origin),start)).toBeLessThan(3);
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=0;i<10;i++) await page.getByRole('button',{name:'Next product photo'}).click();
 expect(await gallery.evaluate(el=>{const period=el.firstElementChild.getBoundingClientRect().width;return el.scrollLeft>=period*.5-1&&el.scrollLeft<period*1.5+1})).toBeTruthy();
 await gallery.dispatchEvent('wheel',{deltaY:180,deltaMode:0});
 expect(await gallery.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Close project'}).click();
 await card.click();
 await expect.poll(()=>gallery.evaluate(el=>Math.abs(el.scrollLeft-el.firstElementChild.getBoundingClientRect().width))).toBeLessThan(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
