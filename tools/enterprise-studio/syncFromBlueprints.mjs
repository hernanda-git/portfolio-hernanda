import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = 'C:/Workspace/portfolio-hernanda';
const PROJECTS_DIR = path.join(ROOT, 'tools/enterprise-studio/projects');
const PAGES_TS_PATH = path.join(ROOT, 'src/data/projectPages.ts');
const LEDGER_PATH = path.join(ROOT, 'docs/enterprise-upgrade-ledger.json');
const SHOTS_DIR = path.join(ROOT, 'public/screenshots');

const files = fs
  .readdirSync(PROJECTS_DIR)
  .filter((f) => /^ID-\d{3}\.mjs$/.test(f))
  .sort();

const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
let pagesTs = fs.readFileSync(PAGES_TS_PATH, 'utf8');

function escapeSingle(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let synced = 0;

for (const file of files) {
  const id = file.replace(/\.mjs$/, '');
  const modPath = path.join(PROJECTS_DIR, file);
  const mod = await import(pathToFileURL(modPath).href);
  const { meta } = mod;
  if (!meta || !Array.isArray(meta.pages) || meta.pages.length < 1) {
    throw new Error(`Invalid meta in ${file}`);
  }

  // Verify all rendered WebP files exist
  for (const pg of meta.pages) {
    const fname = pg.slug === 'p1' ? `${id}.webp` : `${id}-${pg.slug}.webp`;
    const fpath = path.join(SHOTS_DIR, fname);
    if (!fs.existsSync(fpath)) {
      throw new Error(`Missing screenshot ${fname} for ${id}`);
    }
  }

  // Remove stale extra -pN.webp beyond current page count
  for (let n = meta.pages.length + 1; n <= 8; n++) {
    const stale = path.join(SHOTS_DIR, `${id}-p${n}.webp`);
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  }

  // Build replacement block for src/data/projectPages.ts
  const titlesLines = meta.pages
    .map((p) => `      '${escapeSingle(p.title)}',`)
    .join('\n');
  const replacementBlock =
    `  '${id}': enterprisePlan(\n` +
    `    '${escapeSingle(meta.reference || 'Enterprise Bespoke')}',\n` +
    `    '${escapeSingle(meta.persona || 'Enterprise Operator · Indonesia')}',\n` +
    `    [\n${titlesLines}\n    ]\n` +
    `  ),`;

  // Match either legacy plan(...) or existing enterprisePlan(...) for this exact ID
  const rx = new RegExp(`  '${id}': (?:plan|enterprisePlan)\\([\\s\\S]*?\\n  \\),|  '${id}': plan\\([\\s\\S]*?\\]\\),`, 'm');
  if (!rx.test(pagesTs)) {
    throw new Error(`Could not locate entry for '${id}' in src/data/projectPages.ts`);
  }
  pagesTs = pagesTs.replace(rx, replacementBlock);

  // Update ledger entry
  if (ledger.projects[id]) {
    const prev = ledger.projects[id];
    ledger.projects[id] = {
      ...prev,
      status: 'ENTERPRISE_VERIFIED',
      pages: meta.pages.length,
      pageTitles: meta.pages.map((p) => p.title),
      resolution: '1600x1000@2x',
      designReference: meta.reference || 'Enterprise Bespoke',
      blueprint: `tools/enterprise-studio/projects/${id}.mjs`,
      verifiedAt: prev.verifiedAt || new Date().toISOString(),
    };
  }
  synced++;
}

const allIds = Object.keys(ledger.projects);
const verifiedCount = allIds.filter((k) => ledger.projects[k].status === 'ENTERPRISE_VERIFIED').length;
ledger.updatedAt = new Date().toISOString();
ledger.verifiedCount = verifiedCount;
ledger.pendingCount = allIds.length - verifiedCount;
ledger.nextTargetId = allIds.find((k) => ledger.projects[k].status !== 'ENTERPRISE_VERIFIED') ?? null;

fs.writeFileSync(PAGES_TS_PATH, pagesTs, 'utf8');
fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf8');

console.log(`SYNC COMPLETE: ${synced} blueprints synced -> ${verifiedCount}/${allIds.length} ENTERPRISE_VERIFIED (next=${ledger.nextTargetId})`);
