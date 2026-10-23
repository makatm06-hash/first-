import { test, expect } from '@playwright/test';
const endpoint = 'https://formspree.io/f/mvkkojpb';
async function fillEnquiry(page) {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('/');
 await page.getByLabel('Your name').fill('Max Test');
 await page.getByLabel('Email address').fill('max@example.com');
 await page.getByLabel('What can we help with?').selectOption('Video campaign');
 await page.getByLabel('Budget range').selectOption('£2,000–£5,000');
 await page.getByLabel('A little about your project').fill('A video campaign for our next product launch.');
}

test('enquiry sends all details once and shows pending and success states', async ({page}) => {
 let finish, requests = 0, fields;
 await page.route(endpoint, async route => {
  requests++;
  const request = route.request();
  fields = Object.fromEntries(await new Response(request.postDataBuffer(), {
   headers: { 'Content-Type': request.headers()['content-type'] },
  }).formData());
  await new Promise(resolve => { finish = resolve; });
  await route.fulfill({json:{ok:true}});
 });
 await fillEnquiry(page);
 const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0,10);
 await page.getByLabel('Ideal project date').fill(date);
 await page.getByRole('button',{name:'Send enquiry'}).click();
 await expect(page.locator('#form-status')).toHaveText('Sending your enquiry…');
 await expect(page.getByRole('button',{name:'Sending…'})).toBeDisabled();
 await expect(page.getByLabel('Your name')).toBeDisabled();
 await expect.poll(()=>typeof finish).toBe('function');
 // A repeated submit event during the request must not send another email.
 await page.locator('#booking-form').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 expect(requests).toBe(1);
 expect(fields).toMatchObject({name:'Max Test',email:'max@example.com',service:'Video campaign',date,budget:'£2,000–£5,000',message:'A video campaign for our next product launch.',_gotcha:'',_subject:'MASTUDIO — New project enquiry'});
 finish();
 await expect(page.locator('#form-status')).toHaveAttribute('data-state','success');
 await expect(page.getByLabel('Your name')).toHaveValue('');
 await expect(page.getByRole('button',{name:'Send enquiry'})).toBeEnabled();
});

test('server errors keep the enquiry and allow a successful retry', async ({page}) => {
 let attempts = 0;
 await page.route(endpoint, route=>{
  attempts++;
  return route.fulfill(attempts===1 ? {status:422,json:{errors:[{message:'Unable to process form.'}]}} : {json:{ok:true}});
 });
 await fillEnquiry(page);
 await page.getByRole('button',{name:'Send enquiry'}).click();
 await expect(page.locator('#form-status')).toHaveAttribute('data-state','error');
 await expect(page.getByLabel('Your name')).toHaveValue('Max Test');
 await expect(page.getByLabel('Budget range')).toHaveValue('£2,000–£5,000');
 await expect(page.getByLabel('A little about your project')).toHaveValue('A video campaign for our next product launch.');
 await page.getByRole('button',{name:'Send enquiry'}).click();
 await expect(page.locator('#form-status')).toHaveAttribute('data-state','success');
 expect(attempts).toBe(2);
});

for (const failure of ['network failure','timeout']) {
 test(`enquiry recovers from ${failure} without losing the brief`, async ({page}) => {
  let release;
  await page.route(endpoint, async route=>{
   if (failure==='network failure') return route.abort('failed');
   await new Promise(resolve=>{release=resolve;});
   await route.abort().catch(()=>{});
  });
  await fillEnquiry(page);
  if(failure==='timeout') await page.clock.install();
  await page.getByRole('button',{name:'Send enquiry'}).click();
  if(failure==='timeout') {
   await expect.poll(()=>typeof release).toBe('function');
   await page.clock.runFor(21000);
   release();
  }
  await expect(page.locator('#form-status')).toHaveAttribute('data-state','error');
  await expect(page.locator('#form-status')).toContainText('couldn’t confirm');
  await expect(page.getByLabel('A little about your project')).toHaveValue('A video campaign for our next product launch.');
  await expect(page.getByRole('button',{name:'Send enquiry'})).toBeEnabled();
  await expect(page.getByLabel('Your name')).toBeEnabled();
 });
}
