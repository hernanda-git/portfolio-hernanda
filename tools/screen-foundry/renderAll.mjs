import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { PROJECT_VISUAL_SPECS } from './projectSpecs.mjs';
import {
  renderAudioWaveformQa,
  renderCctvVisionGrid,
  renderClinicalEmr,
  renderCodeIdeDiff,
  renderLegalDocumentReview,
  renderMobileTrio,
  renderSaasGateway,
  renderSocThreatOps,
} from './layoutsPart1.mjs';
import {
  renderBankingTreasury,
  renderDesktopWinErp,
  renderEcommercePim,
  renderGisSatelliteMap,
  renderGovDpiPortal,
  renderKanbanBoard,
  renderPosTerminal,
  renderScadaPlant,
} from './layoutsPart2.mjs';
import {
  renderApiSandbox,
  renderBiExecutive,
  renderClinicLabLis,
  renderCommunityCivic,
  renderRadiologyPacs,
  renderSchedulerTape,
  renderTaxCustoms,
  renderWhatsappFlow,
} from './layoutsPart3.mjs';

const ROOT = 'C:/Workspace/portfolio-hernanda';
const OUT_DIR = path.join(ROOT, 'public/screenshots');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// Load all 108 projects natively using Node 24 TypeScript stripping
const { PROJECTS_PART_1 } = await import('../../src/data/projectsPart1.ts');
const { PROJECTS_PART_2 } = await import('../../src/data/projectsPart2.ts');
const { PROJECTS_PART_3 } = await import('../../src/data/projectsPart3.ts');
const ALL_PROJECTS = [...PROJECTS_PART_1, ...PROJECTS_PART_2, ...PROJECTS_PART_3];

console.log(`Loaded ${ALL_PROJECTS.length} projects.`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const RENDERERS = {
  'mobile-trio': renderMobileTrio,
  'saas-gateway': renderSaasGateway,
  'legal-document-review': renderLegalDocumentReview,
  'audio-waveform-qa': renderAudioWaveformQa,
  'code-ide-diff': renderCodeIdeDiff,
  'clinical-emr-workstation': renderClinicalEmr,
  'soc-threat-ops': renderSocThreatOps,
  'cctv-vision-grid': renderCctvVisionGrid,
  'ecommerce-pim-store': renderEcommercePim,
  'gis-satellite-map': renderGisSatelliteMap,
  'banking-treasury-desk': renderBankingTreasury,
  'pos-retail-terminal': renderPosTerminal,
  'kanban-enterprise-board': renderKanbanBoard,
  'desktop-win-erp': renderDesktopWinErp,
  'scada-industrial-plant': renderScadaPlant,
  'gov-dpi-portal': renderGovDpiPortal,
  'bi-executive-suite': renderBiExecutive,
  'api-sandbox-studio': renderApiSandbox,
  'scheduler-tape-chart': renderSchedulerTape,
  'radiology-pacs-viewer': renderRadiologyPacs,
  'community-civic-hub': renderCommunityCivic,
  'tax-customs-workbench': renderTaxCustoms,
  'clinic-lab-lis': renderClinicLabLis,
  'whatsapp-flow-studio': renderWhatsappFlow,
};

const htmlById = new Map();
for (const project of ALL_PROJECTS) {
  const spec = PROJECT_VISUAL_SPECS[project.id];
  if (!spec) throw new Error(`Missing visual spec for ${project.id}`);
  const renderer = RENDERERS[spec.layout];
  if (!renderer) throw new Error(`Unknown layout ${spec.layout} for ${project.id}`);
  htmlById.set(project.id, renderer(project, spec));
}

const server = http.createServer((req, res) => {
  const id = (req.url || '/').replace(/^\//, '').split('?')[0];
  const html = htmlById.get(id);
  if (!html) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

await new Promise((resolve) => server.listen(4188, '127.0.0.1', resolve));

const userDataDir = path.join(ROOT, '.tmp-chrome-' + Date.now());
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9231',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

async function waitForBrowser() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch('http://127.0.0.1:9231/json/version');
      const v = await r.json();
      if (v.webSocketDebuggerUrl) return v.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Chrome CDP failed to start');
}

await waitForBrowser();

async function createTabClient() {
  const r = await fetch('http://127.0.0.1:9231/json/new?about:blank', { method: 'PUT' });
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

  const renderOne = async (projectId) => {
    const loaded = new Promise((resolve) => {
      loadResolver = resolve;
    });
    await send('Page.navigate', { url: `http://127.0.0.1:4188/${projectId}` });
    await loaded;
    await new Promise((r) => setTimeout(r, 35));
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 92 });
    fs.writeFileSync(path.join(OUT_DIR, `${projectId}.webp`), Buffer.from(data, 'base64'));
  };

  return { renderOne, close: () => ws.close() };
}

const CONCURRENCY = 4;
const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
  workers.push(await createTabClient());
}

const t0 = Date.now();
let cursor = 0;
let done = 0;

try {
  await Promise.all(
    workers.map(async (w) => {
      while (cursor < ALL_PROJECTS.length) {
        const idx = cursor++;
        const proj = ALL_PROJECTS[idx];
        await w.renderOne(proj.id);
        done++;
        if (done % 18 === 0 || done === ALL_PROJECTS.length) {
          console.log(`Rendered ${done}/${ALL_PROJECTS.length} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
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
console.log(`COMPLETE: ${files.length} WebP screenshots (${(totalBytes / 1024 / 1024).toFixed(2)} MB total) in ${OUT_DIR}`);
