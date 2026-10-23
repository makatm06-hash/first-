import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(({key,value})=>[key,value]));
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
let server, origin;

test.beforeAll(async()=>{
 // Exercise the production bundle with the exact headers configured for Vercel.
 await stat(resolve(root,'index.html'));
 server=createServer(async(req,res)=>{
  try {
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root+sep)) throw new Error('Not found');
   const data=await readFile(file);
   res.writeHead(200,{...headers,'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);
  }catch{
   res.writeHead(404,{...headers,'Content-Type':'text/plain'}).end('Not found');
  }
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 origin=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{
 if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('production policy blocks injected scripts and unapproved connections',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const response=await page.goto(origin);
 expect(response.headers()['content-security-policy']).toContain("script-src 'self'");
 expect(response.headers()['x-frame-options']).toBe('DENY');
 expect(response.headers()['x-content-type-options']).toBe('nosniff');
 await expect(page.getByRole('heading',{name:'IDEAS MEANT TO SCALE.'})).toBeVisible();
 await page.evaluate(()=>{
  window.__policyViolations=[];
  document.addEventListener('securitypolicyviolation',event=>window.__policyViolations.push(event.effectiveDirective));
  const script=document.createElement('script');
  script.textContent='window.__injectedScriptRan = true';
  document.body.append(script);
 });
 await expect.poll(()=>page.evaluate(()=>window.__policyViolations)).toContain('script-src-elem');
 expect(await page.evaluate(()=>window.__injectedScriptRan)).toBeUndefined();
 const blocked=await page.evaluate(async()=>{
  try {await fetch('https://unapproved.invalid/collect',{method:'POST',body:'test only'});return false;}
  catch {return true;}
 });
 expect(blocked).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__policyViolations)).toContain('connect-src');
});

test('production policy permits enquiry delivery and campaign viewers',async({page,context})=>{
 const endpoint='https://formspree.io/f/mvkkojpb';
 let sent;
 await context.addCookies([{name:'test_session',value:'fake-test-cookie',domain:'formspree.io',path:'/',secure:true}]);
 await page.route(endpoint,route=>{sent=route.request();return route.fulfill({json:{ok:true}});});
 await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Test player</title>'}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin);
 await page.getByLabel('Your name').fill('Security Test');
 await page.getByLabel('Email address').fill('test@example.com');
 await page.getByLabel('What can we help with?').selectOption('Commercial');
 await page.getByLabel('A little about your project').fill('A test enquiry under the production content policy.');
 await page.getByRole('button',{name:'Send enquiry'}).click();
 await expect(page.locator('#form-status')).toHaveAttribute('data-state','success');
 expect((await sent.allHeaders()).cookie).toBeUndefined();
 await page.getByRole('button',{name:'View Saucony',exact:true}).click();
 await expect(page.locator('#project-dialog iframe')).toHaveAttribute('src',/^https:\/\/www.youtube-nocookie.com\/embed\//);
 await expect.poll(()=>page.frames().some(frame=>frame.url().startsWith('https://www.youtube-nocookie.com/embed/'))).toBe(true);
 await page.getByRole('button',{name:'Close project'}).click();
 await page.getByRole('button',{name:'View Product photography',exact:true}).click();
 await expect(page.locator('.pdm-stage')).toHaveAttribute('aria-busy','false');
 const first=page.locator('.pdm-card').first();
 const before=await first.getAttribute('style');
 await page.getByRole('button',{name:'Next product photo'}).click();
 expect(await first.getAttribute('style')).not.toBe(before);
});

test('enquiries do not follow redirects to another destination',async({page})=>{
 let forwarded=false;
 await page.route('https://unapproved.invalid/**',route=>{forwarded=true;return route.abort();});
 await page.route('https://formspree.io/f/mvkkojpb',route=>route.fulfill({status:307,headers:{location:'https://unapproved.invalid/collect'}}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin);
 await page.getByLabel('Your name').fill('Security Test');
 await page.getByLabel('Email address').fill('test@example.com');
 await page.getByLabel('What can we help with?').selectOption('Commercial');
 await page.getByLabel('A little about your project').fill('This brief must not be redirected.');
 await page.getByRole('button',{name:'Send enquiry'}).click();
 await expect(page.locator('#form-status')).toHaveAttribute('data-state','error');
 await expect(page.getByLabel('A little about your project')).toHaveValue('This brief must not be redirected.');
 expect(forwarded).toBe(false);
});
