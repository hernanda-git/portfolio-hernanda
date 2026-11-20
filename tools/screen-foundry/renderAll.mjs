import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { renderProjectPage } from './renderLayout.mjs';

const ROOT = 'C:/Workspace/portfolio-hernanda';
const OUT_DIR = path.join(ROOT, 'public/screenshots');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const { PROJECTS_PART_1 } = await import('../../src/data/projectsPart1.ts');
const { PROJECTS_PART_2 } = await import('../../src/data/projectsPart2.ts');
const { PROJECTS_PART_3 } = await import('../../src/data/projectsPart3.ts');
const { PROJECTS_PART_4 } = await import('../../src/data/projectsPart4.ts');
const { PROJECT_PAGES } = await import('../../src/data/projectPages.ts');

const ALL_PROJECTS = [...PROJECTS_PART_1, ...PROJECTS_PART_2, ...PROJECTS_PART_3, ...PROJECTS_PART_4];
fs.mkdirSync(OUT_DIR, { recursive: true });

const jobs = [];
const htmlByKey = new Map();
const heroSignatures = new Set();
let adjacentSameHero = 0;
let prevHeroLayout = '';

for (const project of ALL_PROJECTS) {
  const art = PROJECT_PAGES[project.id];
  if (!art) throw new Error(`Missing PROJECT_PAGES spec for ${project.id}`);

  const p1Layout = art.pages[0].layout;
  if (p1Layout === prevHeroLayout) adjacentSameHero++;
  prevHeroLayout = p1Layout;
  heroSignatures.add(`${p1Layout}|${art.theme}|${art.font}`);

  const seenLayouts = new Set();
  for (const pageSpec of art.pages) {
    if (seenLayouts.has(pageSpec.layout)) {
      throw new Error(`Duplicate layout ${pageSpec.layout} inside ${project.id}`);
    }
    seenLayouts.add(pageSpec.layout);

    const fileBase = pageSpec.slug === 'p1' ? project.id : `${project.id}-${pageSpec.slug}`;
    htmlByKey.set(fileBase, renderProjectPage(project, pageSpec, art));
    jobs.push(fileBase);
  }
}

console.log(`Loaded ${ALL_PROJECTS.length} projects x 4 pages = ${jobs.length} screens.`);
console.log(`Unique Hero (layout+theme+font) signatures: ${heroSignatures.size}/${ALL_PROJECTS.length} | Adjacent hero layout collisions: ${adjacentSameHero}`);

const server = http.createServer((req, res) => {
  const key = (req.url || '/').replace(/^\//, '').split('?')[0];
  const html = htmlByKey.get(key);
  if (!html) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

await new Promise((resolve) => server.listen(4189, '127.0.0.1', resolve));

const userDataDir = path.join(ROOT, '.tmp-chrome-v4-' + Date.now());
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9235',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

async function waitForBrowser() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch('http://127.0.0.1:9235/json/version');
      const v = await r.json();
      if (v.webSocketDebuggerUrl) return v.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Chrome CDP failed to start');
}

await waitForBrowser();

async function createTabClient() {
  const r = await fetch('http://127.0.0.1:9235/json/new?about:blank', { method: 'PUT' });
  const tab = await r.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let seq = 0;
  const pending = new Map();
  let loadResolver = null;

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Page.loadEventFired' && loadResolver) {
      const fn = loadResolver;
      loadResolver = null;
      fn();
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const renderOne = async (fileBase) => {
    const loaded = new Promise((resolve) => {
      loadResolver = resolve;
    });
    await send('Page.navigate', { url: `http://127.0.0.1:4189/${fileBase}` });
    await loaded;
    await new Promise((r) => setTimeout(r, 25));
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 84 });
    fs.writeFileSync(path.join(OUT_DIR, `${fileBase}.webp`), Buffer.from(data, 'base64'));
  };

  return { renderOne, close: () => ws.close() };
}

const workers = [];
for (let i = 0; i < 6; i++) workers.push(await createTabClient());

const t0 = Date.now();
let cursor = 0;
let done = 0;

try {
  await Promise.all(
    workers.map(async (w) => {
      while (cursor < jobs.length) {
        const idx = cursor++;
        await w.renderOne(jobs[idx]);
        done++;
        if (done % 48 === 0 || done === jobs.length) {
          console.log(`Rendered ${done}/${jobs.length} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
        }
      }
    })
  );
} finally {
  workers.forEach((w) => w.close());
  chrome.kill();
  server.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
}

const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webp'));
const totalBytes = files.reduce((acc, f) => acc + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`COMPLETE: ${files.length} multi-page WebPs (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
