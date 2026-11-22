import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import { pathToFileURL } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
    s.on('error', reject);
  });
}

const ROOT = 'C:/Workspace/portfolio-hernanda';
const OUT_DIR = path.join(ROOT, 'public/screenshots');
const PROJECTS_DIR = path.join(ROOT, 'tools/enterprise-studio/projects');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const idArg = process.argv.find((a) => a.startsWith('--id='));
const idsArg = process.argv.find((a) => a.startsWith('--ids='));
const targetIds = idArg
  ? [idArg.split('=')[1].trim()]
  : idsArg
    ? idsArg.split('=')[1].split(',').map((x) => x.trim()).filter(Boolean)
    : [];

if (targetIds.length === 0) {
  console.error('Usage: node tools/enterprise-studio/renderOne.mjs --id=ID-001');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const jobs = [];
const htmlByKey = new Map();

for (const id of targetIds) {
  const modPath = path.join(PROJECTS_DIR, `${id}.mjs`);
  if (!fs.existsSync(modPath)) {
    throw new Error(`Missing enterprise project blueprint: ${modPath}`);
  }
  const mod = await import(pathToFileURL(modPath).href);
  if (typeof mod.verifyMath === 'function') {
    mod.verifyMath();
  }
  const pages = mod.renderPages();
  if (!Array.isArray(pages) || pages.length < 1) {
    throw new Error(`${id}: renderPages() must return at least 1 page (got ${pages?.length})`);
  }
  for (const pg of pages) {
    const fileBase = pg.slug === 'p1' ? id : `${id}-${pg.slug}`;
    htmlByKey.set(fileBase, pg.html);
    jobs.push({ id, slug: pg.slug, title: pg.title, fileBase });
  }
}

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

const PORT_CDP = await getFreePort();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const PORT_HTTP = server.address().port;

fs.mkdirSync('C:/Workspace/.cache', { recursive: true });
const userDataDir = path.join(
  'C:/Workspace/.cache',
  `chrome-ent-${process.pid}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    `--remote-debugging-port=${PORT_CDP}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

async function waitForBrowser() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT_CDP}/json/version`);
      const v = await r.json();
      if (v.webSocketDebuggerUrl) return v.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome CDP failed to start on port ' + PORT_CDP);
}

await waitForBrowser();

const r = await fetch(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, { method: 'PUT' });
const tab = await r.json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('WebSocket open timeout')), 10000);
  ws.addEventListener('open', () => { clearTimeout(t); resolve(); });
  ws.addEventListener('error', (e) => { clearTimeout(t); reject(new Error('WebSocket error: ' + e.message)); });
});

let seq = 0;
const pending = new Map();
let loadResolver = null;

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject, timer } = pending.get(msg.id);
    clearTimeout(timer);
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
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout on ${method}`));
    }, 25000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });

const AUDIT_EXPR = `(() => {
  const canvas = document.getElementById('canvas') || document.body;
  const vpW = 1600, vpH = 1000;
  const docOverflowX = document.documentElement.scrollWidth > vpW;
  const docOverflowY = document.documentElement.scrollHeight > vpH;
  const clipped = [];
  const panelOverflows = [];

  canvas.querySelectorAll('.e-panel, .e-kpi, .e-panel-body, .e-panel-body-flush, table.e-table').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > vpW + 1.5 || r.bottom > vpH + 1.5) {
      clipped.push({
        cls: el.className.slice(0, 40),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom),
      });
    }
    if (el.classList.contains('e-panel-body') || el.classList.contains('e-panel-body-flush')) {
      if (el.scrollHeight > el.clientHeight + 4) {
        panelOverflows.push({
          cls: el.className.slice(0, 40),
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
          diff: el.scrollHeight - el.clientHeight,
        });
      }
      if (el.scrollWidth > el.clientWidth + 4) {
        panelOverflows.push({
          cls: el.className.slice(0, 40) + ':X',
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          diff: el.scrollWidth - el.clientWidth,
        });
      }
    }
  });

  const domNodes = canvas.querySelectorAll('*').length;
  const tableRows = canvas.querySelectorAll('table.e-table tbody tr').length;
  const svgs = canvas.querySelectorAll('svg').length;
  const textChars = (canvas.innerText || '').trim().length;

  return {
    docOverflowX,
    docOverflowY,
    clippedCount: clipped.length,
    clipped: clipped.slice(0, 5),
    panelOverflowCount: panelOverflows.length,
    panelOverflows: panelOverflows.slice(0, 5),
    domNodes,
    tableRows,
    svgs,
    textChars,
  };
})()`;

let failed = false;
const results = [];

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 2,
    mobile: false,
  });

  for (const job of jobs) {
    const loaded = new Promise((resolve) => {
      const t = setTimeout(() => { loadResolver = null; resolve(); }, 8000);
      loadResolver = () => { clearTimeout(t); resolve(); };
    });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT_HTTP}/${job.fileBase}` });
    await loaded;
    await new Promise((r) => setTimeout(r, 40));

    const evalRes = await send('Runtime.evaluate', {
      expression: AUDIT_EXPR,
      returnByValue: true,
    });
    const audit = evalRes.result.value;

    const { data } = await send('Page.captureScreenshot', {
      format: 'webp',
      quality: 88,
    });
    const outPath = path.join(OUT_DIR, `${job.fileBase}.webp`);
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(outPath, buf);

    const ok =
      !audit.docOverflowX &&
      !audit.docOverflowY &&
      audit.clippedCount === 0 &&
      audit.panelOverflowCount === 0 &&
      audit.textChars >= 700;

    if (!ok) failed = true;

    results.push({
      file: `${job.fileBase}.webp`,
      title: job.title,
      kb: Number((buf.length / 1024).toFixed(1)),
      ok,
      ...audit,
    });
  }
} finally {
  try { ws.close(); } catch {}
  try {
    if (process.platform === 'win32' && chrome.pid) {
      execFileSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      chrome.kill();
    }
  } catch {}
  server.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
}

console.log('\n=== ENTERPRISE STUDIO RENDER & AUDIT REPORT (1600x1000 @ 2x DPR) ===');
for (const r of results) {
  const status = r.ok ? 'PASS' : 'FAIL';
  console.log(
    `[${status}] ${r.file.padEnd(16)} | ${String(r.kb).padStart(6)} KB | nodes=${String(r.domNodes).padStart(4)} rows=${String(r.tableRows).padStart(2)} svgs=${String(r.svgs).padStart(2)} chars=${String(r.textChars).padStart(4)} | clip=${r.clippedCount} pOv=${r.panelOverflowCount} | ${r.title}`
  );
  if (!r.ok) {
    console.log('   DETAILS:', JSON.stringify({ docOverflowX: r.docOverflowX, docOverflowY: r.docOverflowY, clipped: r.clipped, panelOverflows: r.panelOverflows }));
  }
}

if (failed) {
  console.error('\nAUDIT FAILED: Fix overflow/clipping/density before proceeding.');
  process.exit(2);
}
console.log('\nALL PAGES PASSED ENTERPRISE INTEGRITY AUDIT.');
