import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {browserOptions} from './browser.mjs';
import {startTestServer} from './test-server.mjs';
const {origin,stop}=await startTestServer();
const browser=await chromium.launch(await browserOptions());
const routes=JSON.parse(await fs.readFile('docs/routes.json','utf8'));
const report={framework:'Next.js App Router',pages:[],interactions:[]};
await fs.mkdir('.qa',{recursive:true});
try{
 for(const [device,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(12000);let issues=[];
  page.on('pageerror',error=>issues.push(error.message));
  page.on('response',response=>{if(response.status()>=400)issues.push(`${response.status()}: ${response.url()}`)});
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(/^https?:$/.test(url.protocol)&&url.origin!==origin){issues.push(`External: ${url.href}`);return route.abort()}return route.continue()});
  for(const {route}of routes.filter(r=>!process.env.TEST_ROUTE||r.route===process.env.TEST_ROUTE)){
   issues=[];
   try{
    const response=await page.goto(origin+route,{waitUntil:'load'});assert.equal(response.status(),200);
    await page.waitForSelector('[data-experience][data-ready="true"]',{state:'attached'});await page.waitForTimeout(250);
    assert.ok((await page.locator('h1,h2').allTextContents()).join('').trim());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal overflow');
    const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.getBoundingClientRect().width&&i.complete&&!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[],'Images loaded');
    if(route==='/'){
     await page.screenshot({path:`.qa/local-${device}.png`});
     await page.locator('[modal-menu-open]').filter({visible:true}).first().click();await page.waitForTimeout(1600);
     assert.ok(await page.locator('[modal-menu="menu"]').isVisible());
     await page.locator('[modal-menu-open]').filter({visible:true}).first().click();await page.waitForTimeout(1400);report.interactions.push(`${device}: menu opens/closes`);
     const cta=page.locator('[modal-cta-open]').filter({visible:true}).first();await cta.click();await page.waitForTimeout(1400);assert.ok(await page.locator('[modal-cta="cta"]').isVisible());
     const form=page.locator('[modal-cta="cta"] form');await form.locator('input[name="Name"]').fill('Alex Demo');await form.locator('input[type="tel"]').fill('+380501234567');await form.locator('[data-form-btn]').click();await page.waitForTimeout(300);assert.ok(await page.locator('[modal-cta="cta"] [role="status"]').isVisible());report.interactions.push(`${device}: consultation form uses local dummy submission`);
     const close=page.locator('[modal-cta-close]').filter({visible:true}).first();await close.click();await page.waitForTimeout(1400);report.interactions.push(`${device}: consultation modal opens/closes`);
     await page.locator('#faq').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
     const accordion=page.locator('[accordion-btn]').first();
     const accordionId=await accordion.getAttribute('accordion-btn');
     const closedHeight=(await page.locator(`[accordion-desc="${accordionId}"]`).boundingBox()).height;
     await accordion.click();await page.waitForTimeout(1500);
     assert.ok((await page.locator(`[accordion-desc="${accordionId}"]`).boundingBox()).height>10);await accordion.click();await page.waitForTimeout(1500);assert.ok(Math.abs((await page.locator(`[accordion-desc="${accordionId}"]`).boundingBox()).height-closedHeight)<2);report.interactions.push(`${device}: FAQ expands and collapses`);
     await page.locator('[slider="gallery"]').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
     const gallery=page.locator('[slider="gallery"]');const previous=await gallery.locator('[slider="current"]').innerText();await gallery.locator('[slider="next"]').click();await page.waitForTimeout(1500);assert.notEqual(await gallery.locator('[slider="current"]').innerText(),previous);report.interactions.push(`${device}: gallery advances`);
     await page.evaluate(()=>{window.__nextNavigation='preserved'});
     await page.locator('a[href="/en/"],a[href="/en"]').first().evaluate(e=>e.click());await page.waitForURL(/\/en\/?$/);await page.waitForSelector('[data-experience][data-ready="true"]',{state:'attached'});
     assert.equal(await page.evaluate(()=>window.__nextNavigation),'preserved');assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');report.interactions.push(`${device}: native Next.js language navigation`);
    }
    assert.deepEqual(issues,[],'No errors or external runtime requests');report.pages.push({device,route,passed:true});console.log(`PASS ${device} ${route}`);
   }catch(error){report.pages.push({device,route,passed:false,error:error.message,issues:[...issues]});console.log(`FAIL ${device} ${route}: ${error.message}`);await page.screenshot({path:`.qa/failure-${device}-${route.replaceAll('/','_')||'home'}.png`}).catch(()=>{});}
  }
  await context.close();
 }
}finally{await browser.close();await stop()}
report.passed=report.pages.every(p=>p.passed);await fs.writeFile('.qa/verification.json',JSON.stringify(report,null,2));console.log(`${report.pages.filter(p=>p.passed).length}/${report.pages.length} checks pass`);if(!report.passed)process.exitCode=1;
