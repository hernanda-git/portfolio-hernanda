import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Workspace/portfolio-hernanda';
const LEDGER_PATH = path.join(ROOT, 'docs/enterprise-upgrade-ledger.json');

const { PROJECTS_PART_1 } = await import('../../src/data/projectsPart1.ts');
const { PROJECTS_PART_2 } = await import('../../src/data/projectsPart2.ts');
const { PROJECTS_PART_3 } = await import('../../src/data/projectsPart3.ts');
const { PROJECTS_PART_4 } = await import('../../src/data/projectsPart4.ts');
const { PROJECTS_PART_5 } = await import('../../src/data/projectsPart5.ts');
const { PROJECTS_PART_6 } = await import('../../src/data/projectsPart6.ts');

const ALL = [
  ...PROJECTS_PART_1,
  ...PROJECTS_PART_2,
  ...PROJECTS_PART_3,
  ...PROJECTS_PART_4,
  ...PROJECTS_PART_5,
  ...PROJECTS_PART_6,
];

fs.mkdirSync(path.dirname(LEDGER_PATH), { recursive: true });

const existing = fs.existsSync(LEDGER_PATH)
  ? JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'))
  : { projects: {} };

const projectsMap = {};
for (const p of ALL) {
  const prev = existing.projects?.[p.id];
  projectsMap[p.id] = prev ?? {
    id: p.id,
    name: p.name,
    sector: p.sector,
    platform: p.platform,
    status: 'LEGACY_V6',
    pages: 4,
    resolution: '1280x800@1x',
    designReference: null,
    blueprint: null,
    verifiedAt: null,
    commitSha: null,
  };
}

const verifiedCount = Object.values(projectsMap).filter((x) => x.status === 'ENTERPRISE_VERIFIED').length;

const ledger = {
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
  totalProjects: ALL.length,
  verifiedCount,
  pendingCount: ALL.length - verifiedCount,
  nextTargetId: ALL.find((p) => projectsMap[p.id].status !== 'ENTERPRISE_VERIFIED')?.id ?? null,
  projects: projectsMap,
};

fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
console.log(`Ledger written: ${LEDGER_PATH} (${verifiedCount}/${ALL.length} verified, next=${ledger.nextTargetId})`);
