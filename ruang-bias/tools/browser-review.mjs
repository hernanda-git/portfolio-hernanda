import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4186';
const evidence=process.env.PREVIEW_EVIDENCE;
if (evidence) await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN || undefined,headless:true,timeout:15000});
const issues=[];
const requests=new Set();
const noOverflow=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const image=async p=>createHash('sha256').update(await p.locator('canvas').evaluate(c=>c.toDataURL())).digest('hex');
const shot=(p,n)=>evidence ? p.screenshot({path:resolve(evidence,n+'.png')}) : undefined;
async function observe(options){
  const p=await browser.newPage(options);
  p.setDefaultTimeout(8000);
  p.setDefaultNavigationTimeout(10000);
  p.on('pageerror',e=>issues.push(e.message));
  p.on('console',m=>{if(m.type()==='error')issues.push(m.text());});
  p.on('response',r=>{if(r.status()>=400)issues.push(r.status()+' '+r.url());});
  p.on('request',r=>requests.add(new URL(r.url()).origin));
  return p;
}
async function open(p,route){
  assert.equal((await p.goto(base+route)).status(),200,route);
  await p.evaluate(()=>document.fonts.ready.then(()=>true));
  assert(await noOverflow(p),`${route} overflow at ${p.viewportSize()?.width}`);
}

try {
  const pc=await observe({viewport:{width:1440,height:900}});
  await open(pc,'/');
  await pc.locator('[data-refraction][data-ready]').waitFor();
  assert(await pc.evaluate(()=>document.fonts.check('720 100px Bricolage')));
  assert(await pc.evaluate(()=>document.querySelector('.signature').getBoundingClientRect().right<=document.querySelector('canvas').getBoundingClientRect().left+2));
  await shot(pc,'01-desktop-home');
  await pc.keyboard.press('Tab');
  assert.equal(await pc.evaluate(()=>document.activeElement.getAttribute('href')),'#main');
  await pc.keyboard.press('Enter');
  assert.equal(await pc.evaluate(()=>document.activeElement.id),'main');
  const current=await image(pc);
  const slider=pc.getByRole('slider',{name:'Geser cahaya'});
  await slider.focus();
  await pc.keyboard.press('End');
  await pc.waitForFunction(()=>document.querySelector('[data-refraction]').dataset.phase==='1.000');
  assert.notEqual(await image(pc),current);
  const field=await pc.locator('canvas').boundingBox();
  await pc.mouse.move(field.x+field.width*.75,field.y+field.height*.48);
  await pc.mouse.down(); await pc.mouse.move(field.x+field.width*.38,field.y+field.height*.48,{steps:6}); await pc.mouse.up();
  await pc.waitForFunction(()=>Math.abs(Number(document.querySelector('[data-refraction]').dataset.phase)-.38)<.012);
  await pc.locator('[data-refraction][data-settled="true"]').waitFor();
  const still=await image(pc);
  await pc.waitForTimeout(250);
  assert.equal(await image(pc),still);
  await pc.getByRole('link',{name:'Jelajahi karya'}).click();
  assert.equal(new URL(pc.url()).hash,'#selected');
  assert.equal(await pc.locator('.work-plate').count(),3);
  assert(await pc.locator('.work-plate img').evaluateAll(arr=>arr.every(i=>i.naturalWidth===1000)));
  await shot(pc,'02-desktop-gallery');
  console.log('PASS desktop: new optical artwork, real canvas response, keyboard and drag, no autoplay, linked work gallery');

  const routes=['/karya/','/karya/datagate/','/karya/approval-enterprise/','/karya/warga-digital/','/atlas/','/atlas/id-011/','/tentang/','/kontak/'];
  for(const url of routes) await open(pc,url);
  assert.equal(await pc.locator('main a[href^="mailto:"]').count(),1);
  assert.equal(await pc.locator('main a').evaluateAll(links=>links.filter(link=>['www.linkedin.com','linkedin.com'].includes(new URL(link.href).hostname)).length),1);
  await pc.getByRole('navigation').getByRole('link',{name:'Tentang'}).click();
  assert.equal(await pc.locator('.timeline li').count(),16);
  await pc.getByRole('navigation').getByRole('link',{name:'Karya'}).click();
  await pc.getByRole('link',{name:/DataGate/}).click();
  await pc.getByRole('heading',{name:'DataGate',exact:true}).waitFor();
  assert.match(await pc.locator('.case-grid').innerText(),/18 cabang/);
  await shot(pc,'03-desktop-work');
  await pc.locator('.next-study a').click();
  await pc.getByRole('heading',{name:'Alur persetujuan enterprise',exact:true}).waitFor();
  await pc.locator('.next-study a').click();
  await pc.getByRole('heading',{name:'Warga Digital',exact:true}).waitFor();
  console.log('PASS work: all three pages, next-study navigation, 16 career records, two contact links');

  await open(pc,'/atlas/');
  assert.equal(await pc.locator('.concept-row:visible').count(),152);
  await shot(pc,'04-desktop-atlas');

  const query=pc.getByRole('searchbox');
  await query.fill('tidak-ada-hasil-93208');
  await pc.getByRole('heading',{name:'Tidak ada konsep yang cocok.'}).waitFor();
  assert.equal(await pc.locator('.concept-row:visible').count(),0);
  await pc.getByRole('button',{name:'Tampilkan semua konsep'}).click();
  assert.equal(await pc.locator('.concept-row:visible').count(),152);
  assert.equal(await pc.evaluate(()=>document.activeElement.name),'q');
  await query.fill('tapnusa');
  await pc.getByLabel('Sektor',{exact:true}).selectOption('fintech');
  assert.equal(await pc.locator('.concept-row:visible').count(),1);
  const platform=await pc.locator('.concept-row:visible').getAttribute('data-platform');
  await pc.getByLabel('Platform',{exact:true}).selectOption(platform);
  const filtered=pc.url();
  await pc.getByRole('link',{name:'TapNusa QRIS'}).click();
  assert.equal(await pc.locator('.demo-links li').count(),5);
  const target=await pc.locator('.demo-links a').filter({hasText:'Pratinjau Aplikasi Mobile Komuter'}).getAttribute('href');
  assert.equal(new URL(target).pathname,'/portfolio-hernanda/tapnusa-qris/pratinjau-aplikasi-mobile-komuter-net-maui-9-kotlin-hce/');
  assert.equal(new URL(await pc.locator('#atlas-back').getAttribute('href'),base).href,filtered);
  await pc.locator('#atlas-back').click();
  assert.equal(pc.url(),filtered);
  assert.equal(await pc.locator('.concept-row:visible').count(),1);
  await pc.reload();
  assert.equal(await query.inputValue(),'tapnusa');
  await pc.getByRole('navigation').getByRole('link',{name:'Atlas'}).click();
  assert.equal(await pc.locator('.concept-row:visible').count(),152);
  console.log('PASS Atlas: 152 entries, empty/reset, three filters, URL reload, contextual return and plain menu');

  const phone=await observe({viewport:{width:390,height:844}, isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await open(phone,'/');
  await phone.locator('[data-refraction][data-ready]').waitFor();
  await shot(phone,'05-phone-home');
  const texture=await image(phone);
  await phone.locator('canvas').tap({position:{x:258,y:110}});
  const next=await image(phone);
  assert.notEqual(next,texture);
  await phone.waitForTimeout(120);
  assert.equal(await image(phone),next);
  assert.equal(await phone.locator('.work-plate img').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  for(const width of [320,390,768,1024]){
    await phone.setViewportSize({width,height:844});
    for(const route of ['/','/karya/approval-enterprise/','/atlas/','/atlas/id-011/','/tentang/','/kontak/']) await open(phone,route);
  }
  await phone.setViewportSize({width:390,height:844});
  await open(phone,'/atlas/'); await shot(phone,'06-phone-atlas');
  await open(phone,'/karya/warga-digital/'); await shot(phone,'07-phone-case');
  console.log('PASS phone: real touch, reduced motion, 24 route/viewport checks from 320px to 1024px');

  const staticPage=await observe({viewport:{width:390,height:844},javaScriptEnabled:false});
  await open(staticPage,'/');
  assert.equal(await staticPage.getByRole('slider').count(),0);
  assert.match(await staticPage.locator('.projection-field').evaluate(el=>getComputedStyle(el).backgroundImage),/refraction-print\.svg/);
  await open(staticPage,'/atlas/');
  assert.equal(await staticPage.locator('.concept-row:visible').count(),152);
  assert.deepEqual([...requests],[base]);
  assert.deepEqual(issues,[]);
  console.log('PASS no-JS: artwork fallback and all catalogue results; no browser errors or off-origin asset requests');

  // The live prototype is a destination, not a dependency of the local pages.
  if(process.env.VERIFY_DEMO==='1'){
    const external=await browser.newPage();
    const res=await external.goto(target,{timeout:20000});
    assert.equal(res.status(),200);
    await external.getByRole('heading',{name:'Simulasi pembayaran'}).waitFor({timeout:12000});
    await external.getByRole('button',{name:/Simulasikan tap/}).click();
    await external.getByText(/Pembayaran simulasi berhasil/).waitFor({timeout:5000});
    console.log('PASS external demo: TapNusa opened directly and its local simulation completed');
  }
} finally { await browser.close(); }
