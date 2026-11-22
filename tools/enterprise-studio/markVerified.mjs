import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '../..');
const LEDGER_PATH = path.join(ROOT, 'docs/enterprise-upgrade-ledger.json');
const idArg = process.argv.find((a) => a.startsWith('--id='));
const shaArg = process.argv.find((a) => a.startsWith('--sha='));

if (!idArg) {
  console.error('Usage: node tools/enterprise-studio/markVerified.mjs --id=ID-001 [--sha=abc1234]');
  process.exit(1);
}

const id = idArg.split('=')[1].trim();
const modPath = path.join(ROOT, 'tools/enterprise-studio/projects', `${id}.mjs`);
const mod = await import(pathToFileURL(modPath).href);
const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));

if (!ledger.projects[id]) {
  throw new Error(`Unknown project id in ledger: ${id}`);
}

ledger.projects[id] = {
  ...ledger.projects[id],
  status: 'ENTERPRISE_VERIFIED',
  pages: mod.meta.pages.length,
  pageTitles: mod.meta.pages.map((p) => p.title),
  resolution: '1600x1000@2x',
  designReference: mod.meta.reference,
  blueprint: `tools/enterprise-studio/projects/${id}.mjs`,
  verifiedAt: new Date().toISOString(),
  commitSha: shaArg ? shaArg.split('=')[1].trim() : ledger.projects[id].commitSha,
};

const allIds = Object.keys(ledger.projects);
const verifiedCount = allIds.filter((k) => ledger.projects[k].status === 'ENTERPRISE_VERIFIED').length;
ledger.updatedAt = new Date().toISOString();
ledger.verifiedCount = verifiedCount;
ledger.pendingCount = allIds.length - verifiedCount;
ledger.nextTargetId = allIds.find((k) => ledger.projects[k].status !== 'ENTERPRISE_VERIFIED') ?? null;

fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
console.log(`Updated ledger: ${id} -> ENTERPRISE_VERIFIED (${verifiedCount}/${allIds.length}, next=${ledger.nextTargetId})`);
