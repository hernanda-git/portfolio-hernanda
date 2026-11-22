import {
  esc,
  fmtNum,
  fmtPct,
  ic,
  badge,
  wrapEnterpriseHtml,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSpanWaterfall,
} from '../charts.mjs';

export const meta = {
  id: 'ID-004',
  name: 'SwarmForge CLI',
  reference: 'JetBrains Rider + GitHub Enterprise + Linear Dark',
  persona: 'R. Wijaya · Staff .NET Architect · Divisi Core Banking PT Bank Nusantara',
  pages: [
    { slug: 'p1', title: 'TUI Operator Shell & Orkestrasi Worktree Swarm' },
    { slug: 'p2', title: 'Antrean Migrasi Modul & Inspektor Kontrak' },
    { slug: 'p3', title: 'Inspektor Diff AST Roslyn & Paritas Replay' },
    { slug: 'p4', title: 'Topologi Git Worktree & Pipeline Verify Gate' },
    { slug: 'p5', title: 'Transkrip Audit Deterministik & Review PR' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY VERIFIED ACROSS P1-P5)
// ============================================================================
const REPO = {
  org: 'core-banking',
  name: 'Billing.Legacy.slnx',
  host: 'gitea.bank-nusantara.internal',
  baseBranch: 'main',
  baseSha: '8f41c0a',
  runId: 'run_20261122_0914',
  dbFile: 'run_20261122_0914.db',
  sdk: '.NET 9.0.102 · Roslyn 4.12',
  vllmHost: '10.42.8.14:8000',
  vllmModel: 'Qwen2.5-Coder-32B-Instruct',
  operator: 'R. Wijaya',
  operatorInitials: 'RW',
  operatorRole: 'Staff .NET Architect',
};

const LANES = [
  {
    code: 'LANE-1',
    title: 'Konversi System.Web -> Minimal API',
    subtitle: '14 controller · Terverifikasi Roslyn',
    branch: 'feat/migrate-billing-api-l1',
    worktree: 'wt/lane-1-minimal-api',
    headSha: '7a3d91c',
    pid: 19304,
    pr: '#418',
    model: 'Qwen2.5-Coder-32B',
    add: 318,
    del: 640,
    warnings: 0,
    errors: 0,
    tests: 124,
    reviewNotes: 0,
    durationS: 3.1,
    status: 'Terverifikasi',
    prStatus: 'Siap Merge',
    tone: 'ok',
    meta: '0 err',
  },
  {
    code: 'LANE-2',
    title: 'Ganti WCF Client -> Refit Typed HTTP',
    subtitle: 'Bridge SOAP OCBC & ERP tetap terjaga',
    branch: 'feat/migrate-billing-api-l2',
    worktree: 'wt/lane-2-wcf-refit',
    headSha: '5e2b84f',
    pid: 19358,
    pr: '#419',
    model: 'Qwen2.5-Coder-32B',
    add: 204,
    del: 412,
    warnings: 0,
    errors: 0,
    tests: 96,
    reviewNotes: 0,
    durationS: 2.6,
    status: 'Terverifikasi',
    prStatus: 'Siap Merge',
    tone: 'ok',
    meta: '0 err',
  },
  {
    code: 'LANE-3',
    title: 'Upgrade EF6 -> EF Core 9 + Dapper',
    subtitle: '2 stored proc T-SQL ditandai untuk review',
    branch: 'feat/migrate-billing-api-l3',
    worktree: 'wt/lane-3-efcore9',
    headSha: 'c48e21a',
    pid: 19412,
    pr: '#420',
    model: 'DeepSeek-Coder-V2',
    add: 144,
    del: 189,
    warnings: 0,
    errors: 0,
    tests: 64,
    reviewNotes: 2,
    durationS: 2.9,
    status: 'Review',
    prStatus: 'Hold DBA',
    tone: 'warn',
    meta: '2 catatan',
  },
  {
    code: 'LANE-4',
    title: 'xUnit Regression & Contract Tests',
    subtitle: 'Paritas snapshot terhadap replay produksi',
    branch: 'feat/migrate-billing-api-l4',
    worktree: 'wt/lane-4-xunit-parity',
    headSha: '9d1f60b',
    pid: 19477,
    pr: '#421',
    model: 'Qwen2.5-Coder-32B',
    add: 386,
    del: 42,
    warnings: 0,
    errors: 0,
    tests: 128,
    reviewNotes: 0,
    durationS: 2.8,
    status: 'Hijau',
    prStatus: 'Siap Merge',
    tone: 'ok',
    meta: '11,4 dtk',
  },
];

const QUEUED_LANES = [
  {
    code: 'LANE-5',
    title: 'Migrasi Quartz.NET 2 -> BackgroundService',
    subtitle: 'Menunggu merge PR #418 & #420',
    branch: 'queue/migrate-billing-jobs-l5',
    worktree: 'antrean (belum dialokasi)',
    add: 0,
    del: 0,
    warnings: 0,
    tests: 0,
    status: 'Antre Lock',
    tone: 'neutral',
    meta: 'Dep: L1,L3',
  },
  {
    code: 'LANE-6',
    title: 'Upgrade Log4Net -> OpenTelemetry + Seq',
    subtitle: 'Menunggu slot GPU vLLM #2 bebas',
    branch: 'queue/migrate-billing-otel-l6',
    worktree: 'antrean (belum dialokasi)',
    add: 0,
    del: 0,
    warnings: 0,
    tests: 0,
    status: 'Antre GPU',
    tone: 'neutral',
    meta: 'Dep: L4',
  },
];

const MODULES = [
  // LANE-1: +318, -640, 124 tests, 14 controllers
  { id: 'MOD-01', lane: 'LANE-1', src: 'BillingController.cs', dst: 'BillingEndpoints.cs', dir: 'src/Billing.Api/Endpoints', pattern: 'ApiController -> Minimal API', ctrlCount: 4, add: 78, del: 164, warnings: 0, errors: 0, tests: 34, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '7a3d91c', note: '0 temuan' },
  { id: 'MOD-02', lane: 'LANE-1', src: 'InvoiceSettlementCtrl.cs', dst: 'SettlementEndpoints.cs', dir: 'src/Billing.Api/Endpoints', pattern: 'ApiController -> Minimal API', ctrlCount: 3, add: 64, del: 132, warnings: 0, errors: 0, tests: 28, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '7a3d88e', note: '0 temuan' },
  { id: 'MOD-03', lane: 'LANE-1', src: 'VaReconciliationCtrl.cs', dst: 'VaReconEndpoints.cs', dir: 'src/Billing.Api/Endpoints', pattern: 'ApiController -> Minimal API', ctrlCount: 3, add: 68, del: 128, warnings: 0, errors: 0, tests: 24, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '7a3d81a', note: '0 temuan' },
  { id: 'MOD-04', lane: 'LANE-1', src: 'TaxFakturApiCtrl.cs', dst: 'FakturEndpoints.cs', dir: 'src/Billing.Api/Endpoints', pattern: 'ApiController -> Minimal API', ctrlCount: 2, add: 56, del: 112, warnings: 0, errors: 0, tests: 20, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '7a3d74b', note: '0 temuan' },
  { id: 'MOD-05', lane: 'LANE-1', src: 'LegacyHttpModules.cs', dst: 'TenantMiddleware.cs', dir: 'src/Billing.Api/Middleware', pattern: 'IHttpModule -> Middleware', ctrlCount: 2, add: 52, del: 104, warnings: 0, errors: 0, tests: 18, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '7a3d69c', note: '0 temuan' },
  // LANE-2: +204, -412, 96 tests
  { id: 'MOD-06', lane: 'LANE-2', src: 'OcbcSoapBridgeClient.cs', dst: 'IOcbcTreasuryRefit.cs', dir: 'src/Billing.Integrations/Ocbc', pattern: 'WCF SOAP -> Refit + Bridge', ctrlCount: 0, add: 62, del: 128, warnings: 0, errors: 0, tests: 30, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '5e2b84f', note: 'SOAP XML OK' },
  { id: 'MOD-07', lane: 'LANE-2', src: 'ErpSapJournalWcf.cs', dst: 'IErpSapPostingRefit.cs', dir: 'src/Billing.Integrations/Erp', pattern: 'WCF Channel -> Refit HTTP', ctrlCount: 0, add: 54, del: 114, warnings: 0, errors: 0, tests: 26, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '5e2b79d', note: 'Polly Retry' },
  { id: 'MOD-08', lane: 'LANE-2', src: 'BiFastIsoProxyWcf.cs', dst: 'IBiFastAdapterRefit.cs', dir: 'src/Billing.Integrations/BiFast', pattern: 'WCF Proxy -> Typed HttpClient', ctrlCount: 0, add: 48, del: 96, warnings: 0, errors: 0, tests: 22, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '5e2b71c', note: 'mTLS Terjaga' },
  { id: 'MOD-09', lane: 'LANE-2', src: 'CoreBankAccountWcf.cs', dst: 'ICoreAccountRefit.cs', dir: 'src/Billing.Integrations/Core', pattern: 'WCF Binding -> Refit Client', ctrlCount: 0, add: 40, del: 74, warnings: 0, errors: 0, tests: 18, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: '5e2b60a', note: '0 temuan' },
  // LANE-3: +144, -189, 64 tests, 2 reviewNotes
  { id: 'MOD-10', lane: 'LANE-3', src: 'BillingDbContext.cs', dst: 'BillingDbContext.cs', dir: 'src/Billing.Data/Context', pattern: 'EF6 -> EF Core 9 ModelBuilder', ctrlCount: 0, add: 48, del: 62, warnings: 0, errors: 0, tests: 22, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: 'c48e19b', note: '0 temuan' },
  { id: 'MOD-11', lane: 'LANE-3', src: 'LedgerEf6Repository.cs', dst: 'LedgerDapperRepo.cs', dir: 'src/Billing.Data/Repos', pattern: 'ObjectQuery -> Dapper Async', ctrlCount: 0, add: 38, del: 54, warnings: 0, errors: 0, tests: 18, reviewNotes: 0, roslyn: 'AST-OK', status: 'Terverifikasi', tone: 'ok', sha: 'c48e20e', note: '0 temuan' },
  { id: 'MOD-12', lane: 'LANE-3', src: 'Sp_CalcPenalty_Tsql.sql', dst: 'PenaltyTvpCommand.cs', dir: 'src/Billing.Data/StoredProcs', pattern: 'T-SQL Cursor -> Dapper TVP', ctrlCount: 0, add: 32, del: 41, warnings: 0, errors: 0, tests: 14, reviewNotes: 1, roslyn: 'SF-SQL014', status: 'Review DBA', tone: 'warn', sha: 'c48e21a', note: '1 catatan TVP', selected: true },
  { id: 'MOD-13', lane: 'LANE-3', src: 'Sp_PostGlBatch_Tsql.sql', dst: 'GlBatchDapperExec.cs', dir: 'src/Billing.Data/StoredProcs', pattern: 'T-SQL Tx -> ReadCommitted', ctrlCount: 0, add: 26, del: 32, warnings: 0, errors: 0, tests: 10, reviewNotes: 1, roslyn: 'SF-SQL019', status: 'Review DBA', tone: 'warn', sha: 'c48e21f', note: '1 catatan Lock' },
  // LANE-4: +386, -42, 128 tests
  { id: 'MOD-14', lane: 'LANE-4', src: 'BillingLegacyTests.cs', dst: 'BillingSnapshotReplayTests.cs', dir: 'tests/Billing.Parity.Tests', pattern: 'MSTest -> xUnit + Replay', ctrlCount: 0, add: 148, del: 16, warnings: 0, errors: 0, tests: 52, reviewNotes: 0, roslyn: 'AST-OK', status: 'Hijau', tone: 'ok', sha: '9d1f60b', note: '128/128 cocok' },
  { id: 'MOD-15', lane: 'LANE-4', src: 'OcbcWcfMockTests.cs', dst: 'OcbcSoapContractTests.cs', dir: 'tests/Billing.Parity.Tests', pattern: 'WCF Stub -> WireMock Contract', ctrlCount: 0, add: 124, del: 14, warnings: 0, errors: 0, tests: 40, reviewNotes: 0, roslyn: 'AST-OK', status: 'Hijau', tone: 'ok', sha: '9d1f54a', note: 'XML Schema OK' },
  { id: 'MOD-16', lane: 'LANE-4', src: 'GlBatchLegacyTests.cs', dst: 'GlPostingParityTests.cs', dir: 'tests/Billing.Parity.Tests', pattern: 'SQL Fixture -> Testcontainers', ctrlCount: 0, add: 114, del: 12, warnings: 0, errors: 0, tests: 36, reviewNotes: 0, roslyn: 'AST-OK', status: 'Hijau', tone: 'ok', sha: '9d1f49d', note: 'Debit=Kredit' },
];

const BURNDOWN_X = ['It-01', 'It-02', 'It-03', 'It-04', 'It-05', 'It-06', 'It-07', 'It-08', 'It-09', 'It-10', 'It-11'];
const BURNDOWN_ERR = [64, 48, 36, 24, 15, 9, 4, 2, 0, 0, 0];
const BURNDOWN_WARN = [118, 94, 72, 54, 38, 22, 11, 5, 2, 0, 0];
const BURNDOWN_TSQL = [12, 12, 10, 9, 7, 6, 5, 4, 3, 2, 2];

const GATE_SPANS = [
  { label: '1. NuGet Offline Restore', start: 0, dur: 840, color: '#38bdf8' },
  { label: '2. Roslyn AST & Analyzer', start: 840, dur: 1420, color: '#60a5fa' },
  { label: '3. dotnet build -c Release', start: 2260, dur: 3180, color: '#34d399' },
  { label: '4. xUnit Suite (412 tes)', start: 5440, dur: 4620, color: '#10b981' },
  { label: '5. Replay Parity (128 req)', start: 10060, dur: 910, color: '#a78bfa' },
  { label: '6. SQLite WAL & PR Signer', start: 10970, dur: 430, color: '#fbbf24' },
];

const POLICY_RULES = [
  { id: 'POL-01', rule: 'Isolasi satu git worktree per agent (mutex path)', scope: 'Global Swarm', enforcer: 'WorkspaceLock', hits: '0 blokir', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-02', rule: 'Kompilator wajib 0 Warning (/warnaserror Release)', scope: 'Build Gate', enforcer: 'MSBuild + Roslyn', hits: '0 lolos', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-03', rule: 'Larangan git push --force & mutasi branch main', scope: 'Gitea Remote', enforcer: 'PolicyGuard', hits: '0 upaya', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-04', rule: 'Hold otomatis bila ada perubahan stored proc T-SQL', scope: 'LANE-3 Data', enforcer: 'SqlAstGuard', hits: '2 ditahan', status: 'HOLD DBA', tone: 'warn' },
  { id: 'POL-05', rule: 'Feed NuGet wajib 100% Artifactory offline internal', scope: 'Container Net', enforcer: 'Docker AirGap', hits: '0 egress', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-06', rule: 'Inferensi LLM hanya ke vLLM on-prem (10.42.8.14)', scope: 'Agent Proxy', enforcer: 'EgressFirewall', hits: '0 egress', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-07', rule: 'Paritas snapshot JSON >= 100% pada replay produksi', scope: 'LANE-4 Parity', enforcer: 'ReplayVerifier', hits: '128/128', status: 'AKTIF', tone: 'ok' },
  { id: 'POL-08', rule: 'Pemindai secret & connection string sebelum commit', scope: 'Pre-Commit', enforcer: 'SecretScanner', hits: '0 temuan', status: 'AKTIF', tone: 'ok' },
];

const AUDIT_LOGS = [
  { seq: '016', time: '09:26:48', lane: 'ALL', stage: 'pr.manifest.sign --lanes L1,L2,L4 --sqlite-wal', exit: '0', sha: 'sha256:9f4c...e182', status: 'SIGNED', tone: 'ok' },
  { seq: '015', time: '09:26:42', lane: 'LANE-4', stage: 'replay.verify --fixtures 128 --tolerance exact', exit: '0', sha: 'sha256:81d2...a04f', status: 'VERIFIED', tone: 'ok' },
  { seq: '014', time: '09:26:31', lane: 'LANE-4', stage: 'dotnet test Billing.slnx -c Release (412/412)', exit: '0', sha: 'sha256:7c1a...b920', status: 'VERIFIED', tone: 'ok' },
  { seq: '013', time: '09:25:58', lane: 'LANE-3', stage: 'sql.guard.flag Sp_PostGlBatch_Tsql.sql (SF-SQL019)', exit: '2', sha: 'sha256:6b8e...4d11', status: 'HOLD DBA', tone: 'warn' },
  { seq: '012', time: '09:25:44', lane: 'LANE-3', stage: 'sql.guard.flag Sp_CalcPenalty_Tsql.sql (SF-SQL014)', exit: '2', sha: 'sha256:59a1...7e30', status: 'HOLD DBA', tone: 'warn' },
  { seq: '011', time: '09:25:19', lane: 'LANE-3', stage: 'dotnet build wt/lane-3-efcore9 -c Release (0 warn)', exit: '0', sha: 'sha256:4e0f...c622', status: 'VERIFIED', tone: 'ok' },
  { seq: '010', time: '09:24:41', lane: 'LANE-2', stage: 'wiremock.verify OCBC SOAP & SAP ERP bridge', exit: '0', sha: 'sha256:3d92...81ab', status: 'VERIFIED', tone: 'ok' },
  { seq: '009', time: '09:24:12', lane: 'LANE-2', stage: 'roslyn.rewrite WcfToRefitAnalyzer (4 service)', exit: '0', sha: 'sha256:2a7c...f491', status: 'VERIFIED', tone: 'ok' },
  { seq: '008', time: '09:23:38', lane: 'LANE-1', stage: 'dotnet build wt/lane-1-minimal-api /warnaserror', exit: '0', sha: 'sha256:1f64...d208', status: 'VERIFIED', tone: 'ok' },
  { seq: '007', time: '09:22:55', lane: 'LANE-1', stage: 'roslyn.rewrite SystemWebToMinimalApi (14 ctrl)', exit: '0', sha: 'sha256:0e51...9c74', status: 'VERIFIED', tone: 'ok' },
  { seq: '006', time: '09:21:14', lane: 'ALL', stage: 'sandbox.netcheck --assert-zero-egress --vllm-only', exit: '0', sha: 'sha256:b37a...55d1', status: 'VERIFIED', tone: 'ok' },
  { seq: '005', time: '09:19:40', lane: 'ALL', stage: 'secret.scan --pre-commit --scope wt/lane-{1..4}', exit: '0', sha: 'sha256:a91c...2e48', status: 'VERIFIED', tone: 'ok' },
  { seq: '004', time: '09:18:10', lane: 'ALL', stage: 'nuget.restore --source internal-artifactory --offline', exit: '0', sha: 'sha256:f82b...3a19', status: 'VERIFIED', tone: 'ok' },
  { seq: '003', time: '09:16:04', lane: 'ALL', stage: 'policy.guard.init --airgap-vllm 10.42.8.14:8000', exit: '0', sha: 'sha256:e41d...6b02', status: 'VERIFIED', tone: 'ok' },
  { seq: '002', time: '09:14:22', lane: 'ALL', stage: 'git worktree add wt/lane-{1..4} (4 mutex locks)', exit: '0', sha: 'sha256:d309...1f88', status: 'LOCKED', tone: 'info' },
  { seq: '001', time: '09:14:02', lane: 'ALL', stage: 'swarmforge init --repo Billing.Legacy.slnx @ 8f41c0a', exit: '0', sha: 'sha256:c104...88e0', status: 'INIT', tone: 'info' },
];

const REPLAY_ROUTES = [
  { route: 'GET /api/v1/billing/invoices/{id}', legSha: 'a94f...12c0', net9Sha: 'a94f...12c0', legMs: 142, net9Ms: 38, count: 32 },
  { route: 'POST /api/v1/billing/settle', legSha: '7e21...88b4', net9Sha: '7e21...88b4', legMs: 218, net9Ms: 61, count: 28 },
  { route: 'POST /api/v1/va/reconcile', legSha: '3c90...4f1e', net9Sha: '3c90...4f1e', legMs: 184, net9Ms: 49, count: 24 },
  { route: 'GET /api/v1/faktur/pajak/{npwp}', legSha: 'd412...9b7a', net9Sha: 'd412...9b7a', legMs: 166, net9Ms: 44, count: 16 },
  { route: 'POST /api/v1/ocbc/soap-inquiry', legSha: '6f08...2d3c', net9Sha: '6f08...2d3c', legMs: 312, net9Ms: 118, count: 16 },
  { route: 'POST /api/v1/erp/post-gl-batch', legSha: 'b154...7a6e', net9Sha: 'b154...7a6e', legMs: 274, net9Ms: 86, count: 12 },
];

export function verifyMath() {
  if (LANES.length !== 4) {
    throw new Error(`Expected 4 active lanes, got ${LANES.length}`);
  }
  for (const lane of LANES) {
    const mods = MODULES.filter((m) => m.lane === lane.code);
    const sumAdd = mods.reduce((a, m) => a + m.add, 0);
    const sumDel = mods.reduce((a, m) => a + m.del, 0);
    const sumTests = mods.reduce((a, m) => a + m.tests, 0);
    const sumWarn = mods.reduce((a, m) => a + m.warnings, 0);
    const sumErr = mods.reduce((a, m) => a + m.errors, 0);
    const sumNotes = mods.reduce((a, m) => a + m.reviewNotes, 0);
    if (sumAdd !== lane.add) throw new Error(`${lane.code} add mismatch: ${sumAdd} vs ${lane.add}`);
    if (sumDel !== lane.del) throw new Error(`${lane.code} del mismatch: ${sumDel} vs ${lane.del}`);
    if (sumTests !== lane.tests) throw new Error(`${lane.code} tests mismatch: ${sumTests} vs ${lane.tests}`);
    if (sumWarn !== lane.warnings) throw new Error(`${lane.code} warnings mismatch`);
    if (sumErr !== lane.errors) throw new Error(`${lane.code} errors mismatch`);
    if (sumNotes !== lane.reviewNotes) throw new Error(`${lane.code} reviewNotes mismatch`);
  }

  const totalTests = LANES.reduce((a, l) => a + l.tests, 0);
  if (totalTests !== 412) throw new Error(`Total xUnit tests mismatch: ${totalTests}`);

  const totalWarn = LANES.reduce((a, l) => a + l.warnings, 0);
  if (totalWarn !== 0) throw new Error(`Total warnings must be 0, got ${totalWarn}`);

  const totalNotes = LANES.reduce((a, l) => a + l.reviewNotes, 0);
  if (totalNotes !== 2) throw new Error(`Total review notes must be 2, got ${totalNotes}`);

  const l1Ctrls = MODULES.filter((m) => m.lane === 'LANE-1').reduce((a, m) => a + m.ctrlCount, 0);
  if (l1Ctrls !== 14) throw new Error(`LANE-1 controller count mismatch: ${l1Ctrls}`);

  const gateTotalMs = GATE_SPANS.reduce((a, s) => a + s.dur, 0);
  if (gateTotalMs !== 11400) throw new Error(`Gate duration mismatch: ${gateTotalMs}ms`);

  const replayTotal = REPLAY_ROUTES.reduce((a, r) => a + r.count, 0);
  if (replayTotal !== 128) throw new Error(`Replay fixture count mismatch: ${replayTotal}`);

  const lastIdx = BURNDOWN_X.length - 1;
  if (BURNDOWN_ERR[lastIdx] !== 0 || BURNDOWN_WARN[lastIdx] !== 0 || BURNDOWN_TSQL[lastIdx] !== 2) {
    throw new Error('Burndown endpoint mismatch with final diagnostics');
  }
}

const TOTAL_ADD = LANES.reduce((a, l) => a + l.add, 0);
const TOTAL_DEL = LANES.reduce((a, l) => a + l.del, 0);
const TOTAL_NET = TOTAL_ADD - TOTAL_DEL;
const TOTAL_TESTS = LANES.reduce((a, l) => a + l.tests, 0);
const TOTAL_NOTES = LANES.reduce((a, l) => a + l.reviewNotes, 0);

// ============================================================================
// DARK WORKBENCH CSS (OBSIDIAN SLATE #0b101a + BRAND #1f2937 + STEEL SKY #38bdf8)
// ============================================================================
const DARK_CSS = `
  :root {
    --sf-canvas: #0b101a;
    --sf-surface: #111827;
    --sf-surface-2: #161f30;
    --sf-chrome: #1f2937;
    --sf-border: #243247;
    --sf-border-strong: #334155;
    --sf-text: #f1f5f9;
    --sf-text-2: #cbd5e1;
    --sf-muted: #94a3b8;
    --sf-accent: #38bdf8;
    --sf-accent-btn: #2563eb;
    --sf-accent-soft: #10253d;
    --sf-ok: #34d399;
    --sf-ok-bg: #052e1e;
    --sf-ok-bd: #065f46;
    --sf-warn: #fbbf24;
    --sf-warn-bg: #2e1f05;
    --sf-warn-bd: #78350f;
    --sf-bad: #fb7185;
    --sf-bad-bg: #2f0c16;
    --sf-bad-bd: #881337;
    --sf-info: #38bdf8;
    --sf-info-bg: #08243a;
    --sf-info-bd: #075985;
  }

  /* Override light chrome.mjs defaults cleanly for dark IDE canvas */
  html, body, #canvas {
    background: var(--sf-canvas);
    color: var(--sf-text);
  }
  .e-panel {
    background: var(--sf-surface);
    border-color: var(--sf-border);
    border-radius: 3px;
  }
  .e-panel-head {
    height: 30px;
    padding: 0 10px;
    background: var(--sf-surface-2);
    border-bottom-color: var(--sf-border);
  }
  .e-panel-title {
    color: var(--sf-text);
    font-size: 11px;
  }
  .e-panel-sub {
    color: var(--sf-muted);
    font-size: 9.8px;
  }
  .e-panel-body {
    padding: 8px 10px;
  }
  .e-kpi {
    background: var(--sf-surface);
    border-color: var(--sf-border);
    border-radius: 3px;
    padding: 7px 10px;
  }
  .e-kpi-top { color: var(--sf-muted); font-size: 9.8px; }
  .e-kpi-val { color: var(--sf-text); font-size: 15.5px; }
  .e-kpi-foot { color: var(--sf-muted); font-size: 9.5px; }

  .e-badge {
    border-radius: 2px;
    font-size: 9.5px;
    padding: 1.5px 5.5px;
    font-family: var(--e-mono);
    letter-spacing: 0.01em;
  }
  .e-badge-neutral { background: #1f2937; color: #cbd5e1; border-color: #334155; }
  .e-badge-accent  { background: #10253d; color: #7dd3fc; border-color: #1d4ed8; }
  .e-badge-ok      { background: var(--sf-ok-bg); color: var(--sf-ok); border-color: var(--sf-ok-bd); }
  .e-badge-warn    { background: var(--sf-warn-bg); color: var(--sf-warn); border-color: var(--sf-warn-bd); }
  .e-badge-bad     { background: var(--sf-bad-bg); color: var(--sf-bad); border-color: var(--sf-bad-bd); }
  .e-badge-info    { background: var(--sf-info-bg); color: var(--sf-info); border-color: var(--sf-info-bd); }

  .e-btn {
    height: 24px;
    padding: 0 9px;
    border-radius: 3px;
    background: #1f2937;
    border: 1px solid #334155;
    color: #e2e8f0;
    font-size: 10.2px;
  }
  .e-btn-primary {
    background: var(--sf-accent-btn);
    border-color: #3b82f6;
    color: #ffffff;
  }
  .e-btn-ok {
    background: #065f46;
    border-color: #10b981;
    color: #ecfdf5;
  }

  /* Dense Dark Table */
  table.e-table {
    font-size: 10.4px;
  }
  table.e-table th {
    background: #161f30;
    color: #94a3b8;
    border-bottom: 1px solid #2b3a52;
    font-size: 9.4px;
    padding: 5px 7px;
  }
  table.e-table td {
    color: #e2e8f0;
    border-bottom: 1px solid #1c273a;
    padding: 4.5px 7px;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #0e1524;
  }
  table.e-table tbody tr.is-selected {
    background: #10253d !important;
    box-shadow: inset 2.5px 0 0 #38bdf8;
  }
  table.e-table tbody tr.is-warn {
    background: #1f1a0d !important;
    box-shadow: inset 2.5px 0 0 #f59e0b;
  }
  table.e-table tfoot td {
    background: #161f30;
    color: #f8fafc;
    border-top: 1px solid #334155;
    padding: 5.5px 7px;
  }

  /* Workbench Chrome */
  .sf-topbar {
    height: 36px;
    background: #1f2937;
    border-bottom: 1px solid #334155;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .sf-top-l, .sf-top-r {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .sf-brand {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 12px;
    color: #f8fafc;
    white-space: nowrap;
  }
  .sf-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #0b101a;
    border: 1px solid #38bdf8;
    color: #38bdf8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .sf-chip {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #111827;
    border: 1px solid #334155;
    color: #cbd5e1;
    font-size: 10.2px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .sf-chip-ok {
    background: #052e1e;
    border-color: #065f46;
    color: #6ee7b7;
  }
  .sf-cmd {
    height: 23px;
    width: 310px;
    padding: 0 8px;
    border-radius: 3px;
    background: #0b101a;
    border: 1px solid #334155;
    color: #94a3b8;
    font-family: var(--e-mono);
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .sf-kbd {
    font-family: var(--e-mono);
    font-size: 8.8px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #1f2937;
    border: 1px solid #475569;
    color: #cbd5e1;
  }

  /* Shell & Activity Rail */
  .sf-shell {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .sf-rail {
    width: 46px;
    background: #111827;
    border-right: 1px solid var(--sf-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    flex-shrink: 0;
  }
  .sf-rail-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
  }
  .sf-rail-item {
    width: 34px;
    height: 34px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    position: relative;
  }
  .sf-rail-item.is-active {
    background: #10253d;
    color: #38bdf8;
    border: 1px solid #1e3a5f;
  }
  .sf-rail-item.is-active::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 6px;
    bottom: 6px;
    width: 2.5px;
    background: #38bdf8;
    border-radius: 1px;
  }

  /* Main Workspace */
  .sf-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sf-subbar {
    height: 36px;
    padding: 0 12px;
    background: #111827;
    border-bottom: 1px solid var(--sf-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .sf-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
  }
  .sf-tab {
    height: 26px;
    padding: 0 10px;
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10.6px;
    font-weight: 600;
    color: #94a3b8;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .sf-tab.is-active {
    background: #1f2937;
    border-color: #334155;
    color: #f8fafc;
  }
  .sf-workspace {
    flex: 1;
    min-height: 0;
    min-width: 0;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Bottom IDE Statusbar */
  .sf-statusbar {
    height: 24px;
    background: #1f2937;
    border-top: 1px solid #334155;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.6px;
    color: #cbd5e1;
    flex-shrink: 0;
  }
  .sf-st-g {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .sf-st-i {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  /* Terminal & Syntax Helpers */
  .sf-term {
    background: #070b12;
    font-family: var(--e-mono);
    font-size: 10.3px;
    line-height: 1.48;
    color: #cbd5e1;
    padding: 8px 11px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .t-dim { color: #64748b; }
  .t-cmd { color: #f8fafc; font-weight: 700; }
  .t-ok  { color: #34d399; }
  .t-warn { color: #fbbf24; }
  .t-bad { color: #fb7185; }
  .t-info { color: #38bdf8; }
  .t-kw { color: #7dd3fc; }
  .t-type { color: #fbbf24; }
  .t-str { color: #86efac; }
  .t-attr { color: #c4b5fd; }

  .loc-add { color: #34d399; font-family: var(--e-mono); font-weight: 600; }
  .loc-del { color: #fb7185; font-family: var(--e-mono); font-weight: 600; }

  /* Dark Meter Bar */
  .sf-bar-track {
    height: 6px;
    background: #243247;
    border-radius: 2px;
    overflow: hidden;
    flex: 1;
  }
  .sf-bar-fill {
    height: 100%;
    border-radius: 2px;
  }
  table.e-table.p2-grid td {
    padding: 6px 7px;
  }
  table.e-table.p4-rules td {
    padding: 8.5px 7px;
  }
  table.e-table.p5-audit td {
    padding: 7.5px 7px;
  }

  /* Tree Drawer */
  .sf-tree-sec {
    padding: 6px 8px;
    border-bottom: 1px solid #1c273a;
  }
  .sf-tree-hdr {
    font-size: 9.2px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sf-tree-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 3.5px 6px;
    border-radius: 2px;
    font-size: 10.2px;
    color: #cbd5e1;
  }
  .sf-tree-row.is-active {
    background: #10253d;
    color: #f8fafc;
    box-shadow: inset 2px 0 0 #38bdf8;
  }
`;

// ============================================================================
// SHARED WORKBENCH CHROME
// ============================================================================
function renderWorkbench({ activePage, subTabs = [], actionsHtml = '', workspaceHtml = '' }) {
  const railItems = [
    { id: 'p1', icon: 'terminal', title: 'TUI Swarm' },
    { id: 'p2', icon: 'layers', title: 'Antrean Modul' },
    { id: 'p3', icon: 'code', title: 'Diff Roslyn AST' },
    { id: 'p4', icon: 'gitBranch', title: 'Topologi Worktree' },
    { id: 'p5', icon: 'shield', title: 'Audit & PR' },
  ];

  const topbar = `<header class="sf-topbar">
    <div class="sf-top-l">
      <div class="sf-brand">
        <span class="sf-mark">SF</span>
        <span>SwarmForge CLI</span>
        <span class="mono" style="font-size:9.5px;color:#94a3b8;font-weight:500;">v2.4.1</span>
      </div>
      <div class="sf-chip">
        ${ic('gitBranch', 11, '#38bdf8')}
        <span class="mono">${esc(REPO.name)}</span>
        <span style="color:#64748b;">@</span>
        <span class="mono" style="color:#7dd3fc;">${esc(REPO.baseBranch)}:${esc(REPO.baseSha)}</span>
      </div>
      <div class="sf-chip" style="border-color:#075985;background:#08243a;color:#7dd3fc;">
        ${ic('lock', 11, '#38bdf8')}
        <span class="mono">WORKTREE: feat/migrate-billing-api</span>
      </div>
      <div class="sf-cmd">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('terminal', 11, '#38bdf8')}
          <span class="trunc">swarmforge gate --all --strict --warnaserror</span>
        </span>
        <span class="sf-kbd">Ctrl+P</span>
      </div>
    </div>
    <div class="sf-top-r">
      <div class="sf-chip sf-chip-ok">
        <span class="dot dot-ok"></span>
        <span class="mono">vLLM Lokal · 0 Byte Egress</span>
      </div>
      <div class="sf-chip">
        ${ic('server', 11, '#94a3b8')}
        <span class="mono">Gitea On-Prem</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding-left:8px;border-left:1px solid #334155;">
        <span style="width:22px;height:22px;border-radius:3px;background:#2563eb;color:#fff;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">${esc(REPO.operatorInitials)}</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.3px;font-weight:700;color:#f8fafc;">${esc(REPO.operator)}</div>
          <div style="font-size:8.8px;color:#94a3b8;">${esc(REPO.operatorRole)}</div>
        </div>
      </div>
    </div>
  </header>`;

  const rail = `<nav class="sf-rail">
    <div class="sf-rail-group">
      ${railItems
        .map(
          (r) => `<div class="sf-rail-item ${r.id === activePage ? 'is-active' : ''}" title="${esc(r.title)}">
            ${ic(r.icon, 16, r.id === activePage ? '#38bdf8' : '#64748b')}
          </div>`
        )
        .join('')}
    </div>
    <div class="sf-rail-group">
      <div class="sf-rail-item" title="SQLite Run State">${ic('database', 15, '#64748b')}</div>
      <div class="sf-rail-item" title="Policy Guard">${ic('sliders', 15, '#64748b')}</div>
    </div>
  </nav>`;

  const subbar = `<div class="sf-subbar">
    <div class="sf-tabs">
      ${subTabs
        .map(
          (t) => `<div class="sf-tab ${t.active ? 'is-active' : ''}">
            ${ic(t.icon, 12, t.active ? '#38bdf8' : '#64748b')}
            <span>${esc(t.label)}</span>
            ${t.count != null ? `<span class="mono" style="font-size:9px;padding:0 4px;border-radius:2px;background:${t.warn ? '#2e1f05' : '#0b101a'};color:${t.warn ? '#fbbf24' : '#94a3b8'};">${esc(t.count)}</span>` : ''}
          </div>`
        )
        .join('')}
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      ${actionsHtml}
    </div>
  </div>`;

  const statusbar = `<footer class="sf-statusbar">
    <div class="sf-st-g">
      <span class="sf-st-i"><span class="dot dot-ok"></span><strong>4/4 Worktree Terkunci</strong></span>
      <span class="sf-st-i">${ic('cpu', 11, '#38bdf8')} ${esc(REPO.sdk)}</span>
      <span class="sf-st-i">${ic('checkCircle', 11, '#34d399')} Build: 0 Warning · 0 Error</span>
      <span class="sf-st-i">${ic('activity', 11, '#34d399')} xUnit: 412/412 (11,4 dtk)</span>
    </div>
    <div class="sf-st-g">
      <span class="sf-st-i">${ic('database', 11, '#94a3b8')} SQLite: ${esc(REPO.dbFile)}</span>
      <span class="sf-st-i">${ic('lock', 11, '#34d399')} Air-Gapped · ${esc(REPO.vllmHost)}</span>
      <span class="sf-st-i">22 Nov 2026 · 09:26 WIB</span>
    </div>
  </footer>`;

  return `${topbar}
  <div class="sf-shell">
    ${rail}
    <div class="sf-main">
      ${subbar}
      <div class="sf-workspace">
        ${workspaceHtml}
      </div>
    </div>
  </div>
  ${statusbar}`;
}

function darkMeter(pct, color = '#38bdf8') {
  const clamped = Math.max(0, Math.min(100, pct));
  return `<div style="display:flex;align-items:center;gap:6px;min-width:0;">
    <div class="sf-bar-track"><div class="sf-bar-fill" style="width:${clamped}%;background:${color};"></div></div>
    <span class="mono" style="font-size:9.6px;color:#cbd5e1;width:30px;text-align:right;flex-shrink:0;">${clamped}%</span>
  </div>`;
}

// ============================================================================
// PAGE 1: TUI OPERATOR SHELL & ORKESTRASI WORKTREE SWARM
// ============================================================================
function renderPage1() {
  const treeHtml = `
    <div class="e-panel" style="width:244px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 12, '#38bdf8')} <span>Worktree Explorer</span></div>
        <span class="e-badge e-badge-info">4 aktif</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div>
          <div class="sf-tree-sec">
            <div class="sf-tree-hdr"><span>BARE REPOSITORY</span><span class="mono">RO</span></div>
            <div class="sf-tree-row">
              <span style="display:flex;align-items:center;gap:5px;" class="trunc">${ic('database', 11, '#94a3b8')} <span class="mono trunc">.git/objects (shared)</span></span>
              <span class="mono" style="font-size:9px;color:#64748b;">1,4 GB</span>
            </div>
            <div class="sf-tree-row">
              <span style="display:flex;align-items:center;gap:5px;" class="trunc">${ic('shield', 11, '#34d399')} <span class="mono trunc">main @ ${esc(REPO.baseSha)}</span></span>
              <span class="mono" style="font-size:9px;color:#34d399;">LOCK</span>
            </div>
          </div>

          <div class="sf-tree-sec">
            <div class="sf-tree-hdr"><span>WORKTREE TERISOLASI (4)</span><span class="mono">PID</span></div>
            ${LANES.map(
              (l, idx) => `<div class="sf-tree-row ${idx === 0 ? 'is-active' : ''}" style="flex-direction:column;align-items:stretch;gap:2px;margin-bottom:3px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                  <span style="display:flex;align-items:center;gap:5px;" class="trunc">
                    <span class="dot dot-${l.tone}"></span>
                    <strong class="mono" style="font-size:10px;color:#f8fafc;">${esc(l.code)}</strong>
                  </span>
                  <span class="mono" style="font-size:9px;color:#94a3b8;">#${l.pid}</span>
                </div>
                <div class="mono trunc" style="font-size:9.3px;color:#94a3b8;padding-left:12px;">${esc(l.worktree)}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding-left:12px;font-size:9px;">
                  <span class="mono" style="color:#7dd3fc;">${esc(l.headSha)}</span>
                  <span><span class="loc-add">+${l.add}</span> <span class="loc-del">-${l.del}</span></span>
                </div>
              </div>`
            ).join('')}
          </div>

          <div class="sf-tree-sec">
            <div class="sf-tree-hdr"><span>ANTREAN BERIKUTNYA (2)</span><span class="mono">WAIT</span></div>
            ${QUEUED_LANES.map(
              (q) => `<div class="sf-tree-row">
                <span style="display:flex;align-items:center;gap:5px;" class="trunc">
                  ${ic('clock', 10, '#64748b')}
                  <span class="mono">${esc(q.code)}</span>
                </span>
                <span class="mono" style="font-size:9px;color:#64748b;">${esc(q.meta)}</span>
              </div>`
            ).join('')}
          </div>

          <div class="sf-tree-sec" style="border-bottom:0;">
            <div class="sf-tree-hdr"><span>STATE & ARTIFAK LOKAL</span><span class="mono">WAL</span></div>
            <div class="sf-tree-row">
              <span class="mono trunc" style="font-size:9.5px;color:#cbd5e1;">sqlite/${esc(REPO.dbFile)}</span>
              <span class="mono" style="font-size:9px;color:#34d399;">OK</span>
            </div>
            <div class="sf-tree-row">
              <span class="mono trunc" style="font-size:9.5px;color:#cbd5e1;">policy/swarm-guard.toml</span>
              <span class="mono" style="font-size:9px;color:#38bdf8;">v2.4</span>
            </div>
            <div class="sf-tree-row">
              <span class="mono trunc" style="font-size:9.5px;color:#cbd5e1;">diffs/pr-418..421.patch</span>
              <span class="mono" style="font-size:9px;color:#94a3b8;">4 file</span>
            </div>
          </div>
        </div>

        <div style="margin:8px;padding:7px 8px;background:#0b101a;border:1px solid #243247;border-radius:3px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:9.5px;font-weight:700;color:#cbd5e1;">Sovereign vLLM Cluster</span>
            <span class="e-badge e-badge-ok">ON-PREM</span>
          </div>
          <div class="mono" style="font-size:9.2px;color:#94a3b8;margin-bottom:4px;">2x L40S · ${esc(REPO.vllmHost)}</div>
          ${darkMeter(74, '#38bdf8')}
          <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:9px;color:#94a3b8;" class="mono">
            <span>VRAM 71/96 GB</span><span>148 tok/dtk</span>
          </div>
        </div>
      </div>
    </div>`;

  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Lane Terisolasi</span>${ic('gitBranch', 11, '#38bdf8')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#34d399;">4 aktif</span>${badge('0 konflik', 'ok')}</div>
        <div class="e-kpi-foot"><span>2 lane antre</span><span class="mono">Mutex OK</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Build Warning</span>${ic('checkCircle', 11, '#34d399')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#34d399;">0 warn</span>${badge('0 err', 'ok')}</div>
        <div class="e-kpi-foot"><span>Release /warnaserror</span><span class="mono">.NET 9</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Suite xUnit</span>${ic('activity', 11, '#34d399')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_TESTS} / ${TOTAL_TESTS}</span>${badge('100%', 'ok')}</div>
        <div class="e-kpi-foot"><span>Replay 128/128</span><span class="mono">11,4 dtk</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Delta LOC Bersih</span>${ic('code', 11, '#38bdf8')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_NET}</span><span class="mono" style="font-size:9.8px;"><span class="loc-add">+${fmtNum(TOTAL_ADD)}</span> <span class="loc-del">-${fmtNum(TOTAL_DEL)}</span></span></div>
        <div class="e-kpi-foot"><span>16 modul termigrasi</span><span class="mono">Roslyn</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Review T-SQL DBA</span>${ic('alert', 11, '#fbbf24')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#fbbf24;">${TOTAL_NOTES} catatan</span>${badge('LANE-3', 'warn')}</div>
        <div class="e-kpi-foot"><span>2 stored proc hold</span><span class="mono">PR #420</span></div>
      </div>
    </div>`;

  const laneTable = `
    <div class="e-panel" style="height:292px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 12, '#38bdf8')} <span>Matriks Lane Swarm — Migrasi .NET Framework 4.8 ke .NET 9</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="e-panel-sub mono">4 Aktif · 2 Antre · 14 Controller + 4 WCF + 4 Data + 3 Suite Tes</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:66px;">Lane</th>
              <th style="width:254px;">Tugas Migrasi & Cakupan</th>
              <th style="width:136px;">Worktree / SHA</th>
              <th style="width:102px;" class="num">Diff LOC</th>
              <th style="width:52px;" class="num">Warn</th>
              <th style="width:58px;" class="num">xUnit</th>
              <th style="width:112px;">Status Gate</th>
              <th style="width:74px;">Bukti</th>
            </tr>
          </thead>
          <tbody>
            ${LANES.map(
              (l, idx) => `<tr class="${idx === 0 ? 'is-selected' : l.tone === 'warn' ? 'is-warn' : ''}">
                <td class="mono" style="font-weight:700;color:#7dd3fc;">${esc(l.code)}</td>
                <td>
                  <div style="font-weight:600;color:#f8fafc;" class="trunc">${esc(l.title)}</div>
                  <div style="font-size:9.3px;color:#94a3b8;" class="trunc">${esc(l.subtitle)}</div>
                </td>
                <td class="mono" style="font-size:9.6px;color:#cbd5e1;">
                  <div class="trunc">${esc(l.worktree)}</div>
                  <div style="font-size:9px;color:#64748b;">${esc(l.headSha)} · PR ${esc(l.pr)}</div>
                </td>
                <td class="num mono"><span class="loc-add">+${l.add}</span> <span class="loc-del">-${l.del}</span></td>
                <td class="num mono" style="color:#34d399;font-weight:700;">${l.warnings}</td>
                <td class="num mono" style="color:#f8fafc;font-weight:600;">${l.tests}</td>
                <td>${badge(l.status, l.tone)}</td>
                <td class="mono" style="font-size:9.6px;color:${l.tone === 'warn' ? '#fbbf24' : '#94a3b8'};">${esc(l.meta)}</td>
              </tr>`
            ).join('')}
            ${QUEUED_LANES.map(
              (q) => `<tr style="opacity:0.74;">
                <td class="mono" style="color:#94a3b8;">${esc(q.code)}</td>
                <td><span style="color:#cbd5e1;">${esc(q.title)}</span> <span style="font-size:9.2px;color:#64748b;">— ${esc(q.subtitle)}</span></td>
                <td class="mono" style="font-size:9.5px;color:#64748b;">${esc(q.worktree)}</td>
                <td class="num mono" style="color:#64748b;">—</td>
                <td class="num mono" style="color:#64748b;">—</td>
                <td class="num mono" style="color:#64748b;">—</td>
                <td>${badge(q.status, 'neutral')}</td>
                <td class="mono" style="font-size:9.4px;color:#64748b;">${esc(q.meta)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="mono">TOTAL 4 LANE AKTIF (16 MODUL TERVERIFIKASI)</td>
              <td class="num mono"><span class="loc-add">+${fmtNum(TOTAL_ADD)}</span> <span class="loc-del">-${fmtNum(TOTAL_DEL)}</span></td>
              <td class="num mono" style="color:#34d399;">0</td>
              <td class="num mono">${TOTAL_TESTS}</td>
              <td>${badge('3 SIAP · 1 HOLD', 'info')}</td>
              <td class="mono" style="color:#34d399;">11,4 dtk</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;

  const terminalPanel = `
    <div class="e-panel" style="flex:1;">
      <div class="e-panel-head" style="background:#0d1320;">
        <div style="display:flex;align-items:center;gap:6px;">
          ${ic('terminal', 12, '#38bdf8')}
          <span class="e-panel-title">TUI Operator Stream</span>
          <span class="e-badge e-badge-accent">swarmforge gate --strict</span>
          <span class="e-badge e-badge-neutral">LANE-1 build</span>
          <span class="e-badge e-badge-warn">LANE-3 ef-review (2)</span>
          <span class="e-badge e-badge-neutral">SQLite WAL</span>
        </div>
        <span class="mono" style="font-size:9.5px;color:#34d399;">EXIT 0 · DETERMINISTIC SEED 0x4E91B2</span>
      </div>
      <div class="e-panel-body-flush">
        <div class="sf-term">
          <div><span class="t-dim">09:26:18</span> <span class="t-cmd">$ swarmforge gate --lane LANE-1 --strict</span></div>
          <div><span class="t-dim">09:26:18</span> <span class="t-info">[lock]  </span> Verifikasi isolasi worktree <span class="t-kw">wt/lane-1-minimal-api</span> (PID #19304) -> 0 kontaminasi lintas branch</div>
          <div><span class="t-dim">09:26:19</span> <span class="t-info">[roslyn]</span> Analisis AST 14 controller System.Web -> Minimal API (CSharpSyntaxRewriter v4.12) -> <span class="t-ok">0 diagnostic error</span></div>
          <div><span class="t-dim">09:26:22</span> <span class="t-ok">[build] </span> dotnet build Billing.slnx -c Release /p:TreatWarningsAsErrors=true -> <span class="t-ok">0 Warning(s), 0 Error(s)</span></div>
          <div><span class="t-dim">09:26:27</span> <span class="t-ok">[test]  </span> 412 passed, 0 failed, 0 skipped (11.4s) -> <span class="t-ok">READY FOR PR (#418)</span></div>
          <div style="margin-top:6px;"><span class="t-dim">09:26:28</span> <span class="t-cmd">$ swarmforge gate --lane LANE-2 --verify-bridge</span></div>
          <div><span class="t-dim">09:26:29</span> <span class="t-info">[wcf]   </span> Refit Typed HTTP client menggantikan 4 WCF proxy (OCBC Treasury, SAP ERP, BI-FAST, CoreBank)</div>
          <div><span class="t-dim">09:26:31</span> <span class="t-ok">[bridge]</span> WireMock SOAP XML envelope parity: <span class="t-ok">40/40 kontrak identik</span> · mTLS certificate pinning terjaga -> <span class="t-ok">READY (#419)</span></div>
          <div style="margin-top:6px;"><span class="t-dim">09:26:32</span> <span class="t-cmd">$ swarmforge gate --lane LANE-3 --sql-guard</span></div>
          <div><span class="t-dim">09:26:34</span> <span class="t-ok">[efcore]</span> BillingDbContext &amp; LedgerDapperRepo lolos build Release (0 warning) &amp; 64/64 xUnit</div>
          <div><span class="t-dim">09:26:35</span> <span class="t-warn">[flag]  </span> <span class="t-warn">SF-SQL014</span> Sp_CalcPenalty_Tsql.sql: cursor + #TmpLateFee memerlukan konfirmasi DBA untuk mapping Dapper TVP</div>
          <div><span class="t-dim">09:26:36</span> <span class="t-warn">[flag]  </span> <span class="t-warn">SF-SQL019</span> Sp_PostGlBatch_Tsql.sql: escalation hint UPDLOCK/HOLDLOCK ditandai untuk review DBA -> <span class="t-warn">HOLD PR #420</span></div>
          <div style="margin-top:6px;"><span class="t-dim">09:26:38</span> <span class="t-cmd">$ swarmforge replay --lane LANE-4 --fixtures prod-replay-20261121.jsonl</span></div>
          <div><span class="t-dim">09:26:42</span> <span class="t-ok">[parity]</span> 128/128 payload HTTP 200 cocok byte-level SHA-256 · Latensi p95 turun <span class="t-ok">198 ms -> 54 ms (-72,7%)</span></div>
          <div><span class="t-dim">09:26:45</span> <span class="t-info">[gitea] </span> Draft PR tersinkronisasi: <span class="t-ok">#418 (L1 READY)</span> · <span class="t-ok">#419 (L2 READY)</span> · <span class="t-warn">#420 (L3 HOLD)</span> · <span class="t-ok">#421 (L4 READY)</span></div>
          <div><span class="t-dim">09:26:47</span> <span class="t-info">[docker]</span> 4 container sandbox terisolasi bersih · 0 byte egress publik · Artifactory NuGet hit rate 100%</div>
          <div><span class="t-dim">09:26:48</span> <span class="t-info">[audit] </span> Transkrip WORM (16 entri) tersimpan ke <span class="t-str">sqlite/run_20261122_0914.db</span> · Root: <span class="t-kw">sha256:9f4c...e182</span></div>
          <div><span class="t-dim">09:26:48</span> <span class="t-ok">[done]  </span> Verify Gate tuntas dalam 11.400 ms (412/412 lulus, 0 warning). Siap review Tech Lead &amp; konfirmasi DBA.</div>
        </div>
        <div style="height:28px;background:#111827;border-top:1px solid #243247;padding:0 10px;display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:10px;">
          <span style="color:#e2e8f0;"><span style="color:#38bdf8;">swarmforge@bank-nusantara</span>:<span style="color:#34d399;">~/Billing.Legacy</span>$ pr publish --lanes L1,L2,L4 --gitea-sign <span style="display:inline-block;width:6px;height:12px;background:#38bdf8;vertical-align:middle;"></span></span>
          <span style="color:#64748b;">Tab: Autocomplete · F5: Re-Verify Gate</span>
        </div>
      </div>
    </div>`;

  const burndownSvg = svgMultiLineChart({
    width: 344,
    height: 180,
    xLabels: BURNDOWN_X,
    yMin: 0,
    yMax: 120,
    yTicks: 4,
    dark: true,
    series: [
      { label: 'Warning', values: BURNDOWN_WARN, color: '#fbbf24', area: true, width: 1.8 },
      { label: 'Error', values: BURNDOWN_ERR, color: '#fb7185', width: 1.8 },
      { label: 'T-SQL Flag', values: BURNDOWN_TSQL, color: '#38bdf8', dashed: true, width: 1.5 },
    ],
    annotations: [
      { index: 9, seriesIdx: 0, label: '0 Warn dicapai (It-10)', color: '#34d399', dy: -32 },
    ],
  });

  const rightDock = `
    <div style="width:368px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="e-panel" style="height:252px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 12, '#38bdf8')} <span>Konvergensi Diagnostik Roslyn</span></div>
          <span class="e-panel-sub mono">11 Iterasi</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          ${burndownSvg}
          <div style="display:flex;justify-content:space-between;font-size:9.4px;color:#94a3b8;padding-top:4px;border-top:1px solid #1c273a;" class="mono">
            <span>Awal: 64 err · 118 warn</span>
            <span style="color:#34d399;">Akhir: 0 err · 0 warn · 2 T-SQL</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="height:292px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 12, '#34d399')} <span>Workspace Lock & Policy Guard</span></div>
          ${badge('STRICT MODE', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
          ${[
            ['Isolasi Worktree Git', '4 direktori mutex aktif, 0 file bocor', 'TERKUNCI', 'ok'],
            ['Kompilator 0-Warning', '/p:TreatWarningsAsErrors=true', 'LULUS', 'ok'],
            ['Proteksi Branch main', 'Direct push & force-push diblokir', 'AKTIF', 'ok'],
            ['Guard Stored Proc T-SQL', '2 file LANE-3 menunggu sign DBA', '2 HOLD', 'warn'],
            ['NuGet Offline Artifactory', '100% paket lokal, 0 koneksi publik', 'AIR-GAP', 'ok'],
            ['Egress LLM Firewall', 'Hanya vLLM 10.42.8.14:8000', '0 BYTE', 'ok'],
          ]
            .map(
              ([k, desc, st, tone]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #1c273a;">
                <div style="min-width:0;">
                  <div style="font-size:10.3px;font-weight:600;color:#f1f5f9;" class="trunc">${esc(k)}</div>
                  <div style="font-size:9.2px;color:#94a3b8;" class="trunc">${esc(desc)}</div>
                </div>
                ${badge(st, tone)}
              </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('cpu', 12, '#38bdf8')} <span>Worker Sandbox & Slot Model</span></div>
          <span class="e-panel-sub mono">Docker Isolated</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:center;">
          ${[
            ['Agent-L1 · Qwen2.5-Coder-32B', 'GPU-0 · wt/lane-1-minimal-api', 82, '#34d399', 'Selesai'],
            ['Agent-L2 · Qwen2.5-Coder-32B', 'GPU-0 · wt/lane-2-wcf-refit', 76, '#34d399', 'Selesai'],
            ['Agent-L3 · DeepSeek-Coder-V2', 'GPU-1 · wt/lane-3-efcore9', 64, '#fbbf24', 'Hold DBA'],
            ['Agent-L4 · xUnit Replay Runner', 'CPU 8vCore · Testcontainers', 91, '#38bdf8', '412/412'],
          ]
            .map(
              ([name, sub, pct, col, st]) => `<div>
                <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
                  <span style="font-weight:600;color:#e2e8f0;">${esc(name)}</span>
                  <span class="mono" style="font-size:9.3px;color:${col};">${esc(st)}</span>
                </div>
                <div class="mono" style="font-size:9px;color:#64748b;margin-bottom:3px;">${esc(sub)}</div>
                ${darkMeter(pct, col)}
              </div>`
            )
            .join('')}
        </div>
      </div>
    </div>`;

  const workspaceHtml = `
    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      ${treeHtml}
      <div style="flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:hidden;">
        ${kpiStrip}
        ${laneTable}
        ${terminalPanel}
      </div>
      ${rightDock}
    </div>`;

  return wrapEnterpriseHtml({
    title: 'SwarmForge CLI — TUI Operator Shell & Orkestrasi Worktree Swarm',
    extraCss: DARK_CSS,
    bodyHtml: renderWorkbench({
      activePage: 'p1',
      subTabs: [
        { icon: 'terminal', label: 'Orkestrator Swarm', count: '4 aktif', active: true },
        { icon: 'layers', label: 'Antrean Modul', count: '16' },
        { icon: 'code', label: 'Diff Roslyn AST', count: '+1.052' },
        { icon: 'gitBranch', label: 'Topologi Worktree', count: '11,4d' },
        { icon: 'shield', label: 'Audit & PR', count: '2 hold', warn: true },
      ],
      actionsHtml: `
        <span class="e-btn">${ic('eye', 11, '#cbd5e1')} Periksa Diff PR</span>
        <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Jalankan Verify Gate</span>
      `,
      workspaceHtml,
    }),
  });
}

// ============================================================================
// PAGE 2: ANTREAN MIGRASI MODUL (16 ROW DENSE GRID + RIGHT INSPECTOR)
// ============================================================================
function renderPage2() {
  const filterBar = `
    <div style="height:34px;background:#111827;border:1px solid #243247;border-radius:3px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:5px;">
        <span class="e-badge e-badge-accent">Semua Modul (16)</span>
        <span class="e-badge e-badge-neutral">LANE-1 Web->API (5)</span>
        <span class="e-badge e-badge-neutral">LANE-2 WCF->Refit (4)</span>
        <span class="e-badge e-badge-warn">LANE-3 EF6->EFCore9 (4 · 2 Hold)</span>
        <span class="e-badge e-badge-neutral">LANE-4 xUnit Parity (3)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="height:22px;width:230px;background:#0b101a;border:1px solid #334155;border-radius:2px;padding:0 7px;display:flex;align-items:center;gap:6px;font-size:10px;color:#94a3b8;">
          ${ic('search', 11, '#64748b')}
          <span>Filter modul, Roslyn ID, atau SHA...</span>
        </div>
        <span class="mono" style="font-size:9.8px;color:#34d399;">14 Terverifikasi</span>
        <span class="mono" style="font-size:9.8px;color:#fbbf24;">2 Review DBA</span>
        <span class="mono" style="font-size:9.8px;color:#94a3b8;">0 Error</span>
      </div>
    </div>`;

  const tablePanel = `
    <div class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 12, '#38bdf8')} <span>Inventaris Migrasi Modul — Billing.Legacy.slnx (.NET Framework 4.8 -> .NET 9.0)</span></div>
        <span class="e-panel-sub mono">Menampilkan 16/16 file terindeks · Urut berdasarkan Lane &amp; Prioritas Gate</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table p2-grid">
          <thead>
            <tr>
              <th style="width:54px;">ID</th>
              <th style="width:58px;">Lane</th>
              <th style="width:302px;">Berkas Sumber -> Target (.NET 9)</th>
              <th style="width:144px;">Pola Transformasi</th>
              <th style="width:106px;" class="num">Diff LOC</th>
              <th style="width:68px;">Roslyn</th>
              <th style="width:46px;" class="num">xUnit</th>
              <th style="width:92px;">Verdict</th>
              <th style="width:80px;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${MODULES.map(
              (m) => `<tr class="${m.selected ? 'is-selected' : m.tone === 'warn' ? 'is-warn' : ''}">
                <td class="mono" style="color:#94a3b8;font-weight:600;">${esc(m.id)}</td>
                <td class="mono" style="color:${m.lane === 'LANE-3' ? '#fbbf24' : '#7dd3fc'};font-weight:700;">${esc(m.lane)}</td>
                <td>
                  <div class="mono trunc" style="font-size:10px;color:#f8fafc;font-weight:600;">${esc(m.src)} <span style="color:#64748b;">-></span> <span style="color:#7dd3fc;">${esc(m.dst)}</span></div>
                  <div class="mono trunc" style="font-size:8.9px;color:#64748b;">${esc(m.dir)} · ${esc(m.sha)}</div>
                </td>
                <td class="trunc" style="color:#cbd5e1;font-size:10px;">${esc(m.pattern)}</td>
                <td class="num mono"><span class="loc-add">+${m.add}</span> <span class="loc-del">-${m.del}</span></td>
                <td class="mono" style="font-size:9.6px;color:${m.roslyn === 'AST-OK' ? '#34d399' : '#fbbf24'};font-weight:600;">${esc(m.roslyn)}</td>
                <td class="num mono" style="font-weight:600;color:#f1f5f9;">${m.tests}</td>
                <td>${badge(m.status, m.tone)}</td>
                <td class="mono trunc" style="font-size:9.4px;color:${m.reviewNotes > 0 ? '#fbbf24' : '#94a3b8'};">${esc(m.note)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="mono">REKAP 16 MODUL · 14 CONTROLLER · 4 WCF CLIENT · 2 STORED PROC FLAG · 0 COMPILER WARNING</td>
              <td class="num mono"><span class="loc-add">+${fmtNum(TOTAL_ADD)}</span> <span class="loc-del">-${fmtNum(TOTAL_DEL)}</span></td>
              <td class="mono" style="color:#34d399;">0 WARN</td>
              <td class="num mono" style="color:#34d399;">${TOTAL_TESTS}</td>
              <td>${badge('412/412 OK', 'ok')}</td>
              <td class="mono" style="color:#fbbf24;">${TOTAL_NOTES} catatan</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:auto;padding:7px 10px;background:#0e1524;border-top:1px solid #243247;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          ${LANES.map(
            (l) => `<div style="background:#111827;border:1px solid #243247;border-radius:2px;padding:5px 8px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div class="mono" style="font-size:9.5px;font-weight:700;color:${l.tone === 'warn' ? '#fbbf24' : '#7dd3fc'};">${esc(l.code)} · ${esc(l.pr)}</div>
                <div class="mono" style="font-size:9px;color:#94a3b8;">${l.tests} tes · ${l.warnings} warn</div>
              </div>
              <div style="text-align:right;" class="mono">
                <div style="font-size:9.6px;"><span class="loc-add">+${l.add}</span> <span class="loc-del">-${l.del}</span></div>
                <div style="font-size:8.8px;color:${l.tone === 'warn' ? '#fbbf24' : '#34d399'};">${esc(l.prStatus)}</div>
              </div>
            </div>`
          ).join('')}
        </div>
      </div>
    </div>`;

  const modWaterfall = svgSpanWaterfall({
    width: 424,
    totalMs: 1840,
    dark: true,
    spans: [
      { label: 'AST & T-SQL Parser', start: 0, dur: 290, color: '#38bdf8' },
      { label: 'EF Core 9 Build Check', start: 290, dur: 460, color: '#34d399' },
      { label: 'Dapper TVP Schema Map', start: 750, dur: 380, color: '#fbbf24' },
      { label: 'xUnit Suite (14 tes)', start: 1130, dur: 590, color: '#10b981' },
      { label: 'Flag SF-SQL014 Emit', start: 1720, dur: 120, color: '#fb7185' },
    ],
  });

  const inspectorPanel = `
    <div class="e-panel" style="width:458px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('alert', 12, '#fbbf24')} <span>Inspektor Modul: MOD-12</span></div>
        ${badge('HOLD REVIEW DBA', 'warn')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;">
        <div style="background:#0b101a;border:1px solid #243247;border-radius:3px;padding:8px 9px;">
          <div class="mono" style="font-size:11px;font-weight:700;color:#f8fafc;margin-bottom:3px;">Sp_CalcPenalty_Tsql.sql -> PenaltyTvpCommand.cs</div>
          <div class="mono" style="font-size:9.3px;color:#94a3b8;margin-bottom:6px;">wt/lane-3-efcore9 · branch feat/migrate-billing-api-l3 · c48e21a</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#111827;border:1px solid #1e293b;border-radius:2px;padding:4px 6px;">
              <div style="font-size:8.8px;color:#94a3b8;">Diff LOC</div>
              <div class="mono" style="font-size:10.5px;"><span class="loc-add">+32</span> <span class="loc-del">-41</span></div>
            </div>
            <div style="background:#111827;border:1px solid #1e293b;border-radius:2px;padding:4px 6px;">
              <div style="font-size:8.8px;color:#94a3b8;">xUnit Modul</div>
              <div class="mono" style="font-size:10.5px;color:#34d399;font-weight:700;">14 / 14 Lulus</div>
            </div>
            <div style="background:#111827;border:1px solid #1e293b;border-radius:2px;padding:4px 6px;">
              <div style="font-size:8.8px;color:#94a3b8;">Build Warning</div>
              <div class="mono" style="font-size:10.5px;color:#34d399;font-weight:700;">0 Warning</div>
            </div>
          </div>
        </div>

        <div style="background:#1f1a0d;border:1px solid #78350f;border-radius:3px;padding:8px 9px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span class="mono" style="font-size:10px;font-weight:700;color:#fbbf24;">DIAGNOSTIK SF-SQL014 · POLICY POL-04</span>
            <span class="mono" style="font-size:9px;color:#fde68a;">Catatan 1 dari 2</span>
          </div>
          <div style="font-size:10.2px;color:#fef3c7;line-height:1.42;">
            Stored procedure <span class="mono">dbo.Sp_CalcPenalty_Tsql</span> memakai cursor <span class="mono">FETCH NEXT</span> dan temp table <span class="mono">#TmpLateFee</span>. Agent telah membungkus eksekusi ke Dapper <span class="mono">SqlDbType.Structured</span> (TVP), namun kebijakan bank mewajibkan konfirmasi DBA sebelum PR #420 di-merge.
          </div>
        </div>

        <div style="background:#070b12;border:1px solid #243247;border-radius:3px;overflow:hidden;">
          <div style="height:24px;background:#161f30;border-bottom:1px solid #243247;padding:0 8px;display:flex;align-items:center;justify-content:space-between;font-size:9.4px;" class="mono">
            <span style="color:#cbd5e1;">src/Billing.Data/StoredProcs/PenaltyTvpCommand.cs</span>
            <span style="color:#38bdf8;">Dapper 2.1 · .NET 9</span>
          </div>
          <div style="padding:7px 9px;font-family:var(--e-mono);font-size:9.3px;line-height:1.5;color:#cbd5e1;">
            <div class="trunc"><span class="t-dim">18 </span><span class="t-kw">var</span> tvp = rows.<span class="t-type">ToTvp</span>(<span class="t-str">"dbo.PenaltyBatchTvp"</span>);</div>
            <div class="trunc"><span class="t-dim">19 </span><span class="t-kw">var</span> args = <span class="t-kw">new</span> <span class="t-type">DynamicParameters</span>();</div>
            <div class="trunc"><span class="t-dim">20 </span>args.<span class="t-type">Add</span>(<span class="t-str">"@BatchItems"</span>, tvp);</div>
            <div class="trunc" style="background:#2e1f05;"><span class="t-warn">21!</span>args.<span class="t-type">Add</span>(<span class="t-str">"@Cutoff"</span>, cut, <span class="t-type">DbType</span>.Date); <span class="t-dim">// SF-SQL014</span></div>
            <div class="trunc"><span class="t-dim">22 </span><span class="t-kw">return await</span> conn.<span class="t-type">QueryAsync</span>&lt;<span class="t-type">PenaltyDto</span>&gt;(</div>
            <div class="trunc"><span class="t-dim">23 </span>&nbsp;&nbsp;<span class="t-str">"dbo.Sp_CalcPenalty_Tsql"</span>, args, commandType: StoredProcedure);</div>
          </div>
        </div>

        <div style="background:#0b101a;border:1px solid #243247;border-radius:3px;padding:7px 9px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:10px;font-weight:700;color:#e2e8f0;">Waterfall Gate Modul (1.840 ms)</span>
            <span class="mono" style="font-size:9.2px;color:#94a3b8;">SQLite Trace #904</span>
          </div>
          ${modWaterfall}
        </div>

        <div style="background:#0b101a;border:1px solid #243247;border-radius:3px;padding:7px 9px;">
          <div style="font-size:9.8px;font-weight:700;color:#cbd5e1;margin-bottom:5px;">Catatan Terkait di LANE-3 (PR #420)</div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.8px;padding:3px 0;border-bottom:1px solid #1c273a;">
            <span class="mono" style="color:#fbbf24;">MOD-12 · Sp_CalcPenalty_Tsql.sql</span>
            <span class="mono" style="color:#94a3b8;">SF-SQL014 (TVP)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.8px;padding:3px 0;">
            <span class="mono" style="color:#fbbf24;">MOD-13 · Sp_PostGlBatch_Tsql.sql</span>
            <span class="mono" style="color:#94a3b8;">SF-SQL019 (Lock)</span>
          </div>
        </div>

        <div style="margin-top:auto;display:flex;gap:6px;padding-top:6px;border-top:1px solid #243247;">
          <span class="e-btn e-btn-ok" style="flex:1;justify-content:center;">${ic('check', 11, '#ecfdf5')} Setujui TVP (DBA)</span>
          <span class="e-btn" style="flex:1;justify-content:center;">${ic('refresh', 11, '#cbd5e1')} Revisi Agent L3</span>
        </div>
      </div>
    </div>`;

  const workspaceHtml = `
    ${filterBar}
    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      ${tablePanel}
      ${inspectorPanel}
    </div>`;

  return wrapEnterpriseHtml({
    title: 'SwarmForge CLI — Antrean Migrasi Modul & Inspektor Kontrak',
    extraCss: DARK_CSS,
    bodyHtml: renderWorkbench({
      activePage: 'p2',
      subTabs: [
        { icon: 'terminal', label: 'Orkestrator Swarm', count: '4 aktif' },
        { icon: 'layers', label: 'Antrean Modul', count: '16', active: true },
        { icon: 'code', label: 'Diff Roslyn AST', count: '+1.052' },
        { icon: 'gitBranch', label: 'Topologi Worktree', count: '11,4d' },
        { icon: 'shield', label: 'Audit & PR', count: '2 hold', warn: true },
      ],
      actionsHtml: `
        <span class="e-btn">${ic('download', 11, '#cbd5e1')} Ekspor Matriks CSV</span>
        <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Verify Ulang LANE-3</span>
      `,
      workspaceHtml,
    }),
  });
}

// ============================================================================
// PAGE 3: INSPEKTOR DIFF AST ROSLYN & PARITAS REPLAY
// ============================================================================
function renderPage3() {
  const fileList = `
    <div class="e-panel" style="width:254px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 12, '#38bdf8')} <span>Berkas Diff (16)</span></div>
        <span class="mono" style="font-size:9.2px;"><span class="loc-add">+1.052</span> <span class="loc-del">-1.283</span></span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div>
        ${LANES.map((lane) => {
          const mods = MODULES.filter((m) => m.lane === lane.code);
          return `<div class="sf-tree-sec">
            <div class="sf-tree-hdr">
              <span class="mono" style="color:${lane.tone === 'warn' ? '#fbbf24' : '#7dd3fc'};">${esc(lane.code)} · ${esc(lane.pr)}</span>
              <span class="mono"><span class="loc-add">+${lane.add}</span> <span class="loc-del">-${lane.del}</span></span>
            </div>
            ${mods
              .map(
                (m) => `<div class="sf-tree-row ${m.id === 'MOD-01' ? 'is-active' : ''}">
                  <span style="display:flex;align-items:center;gap:5px;min-width:0;">
                    <span class="dot dot-${m.tone}"></span>
                    <span class="mono trunc" style="font-size:9.7px;">${esc(m.dst)}</span>
                  </span>
                  <span class="mono" style="font-size:8.8px;color:#94a3b8;flex-shrink:0;">+${m.add}/-${m.del}</span>
                </div>`
              )
              .join('')}
          </div>`;
        }).join('')}
        </div>
        <div style="margin:8px;padding:7px 8px;background:#0b101a;border:1px solid #243247;border-radius:3px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:9.5px;font-weight:700;color:#cbd5e1;">Ringkasan Roslyn AST</span>
            <span class="e-badge e-badge-ok">0 WARN</span>
          </div>
          <div class="mono" style="font-size:9px;color:#94a3b8;line-height:1.5;">
            <div>16 file · 14 ApiController</div>
            <div>0 CS Error · 2 T-SQL Flag</div>
            <div style="color:#34d399;">Net Delta: ${TOTAL_NET} LOC</div>
          </div>
        </div>
      </div>
    </div>`;

  const diffRows = [
    ['14', 'del', '<span class="t-kw">using</span> System.Web;', '12', 'add', '<span class="t-kw">using</span> Microsoft.AspNetCore.Http.HttpResults;'],
    ['15', 'del', '<span class="t-kw">using</span> System.Web.Http;', '13', 'add', '<span class="t-kw">using</span> Microsoft.Extensions.Options;'],
    ['16', 'del', '<span class="t-kw">using</span> System.Configuration;', '14', 'add', '<span class="t-kw">using</span> Billing.Application.Invoices;'],
    ['17', 'ctx', '', '15', 'ctx', ''],
    ['18', 'del', '<span class="t-attr">[RoutePrefix("api/v1/billing")]</span>', '16', 'add', '<span class="t-kw">public static class</span> <span class="t-type">BillingEndpoints</span>'],
    ['19', 'del', '<span class="t-kw">public class</span> <span class="t-type">BillingController</span> : <span class="t-type">ApiController</span>', '17', 'add', '{'],
    ['20', 'del', '{', '18', 'add', '  <span class="t-kw">public static</span> <span class="t-type">RouteGroupBuilder</span> MapBilling(<span class="t-kw">this</span> <span class="t-type">IEndpointRouteBuilder</span> app)'],
    ['21', 'del', '  <span class="t-kw">private readonly</span> <span class="t-type">IBillingSvc</span> _svc = <span class="t-type">ServiceLocator</span>.Get();', '19', 'add', '  {'],
    ['22', 'del', '  <span class="t-attr">[HttpPost, Route("settle")]</span>', '20', 'add', '    <span class="t-kw">var</span> g = app.MapGroup(<span class="t-str">"/api/v1/billing"</span>).RequireAuthorization();'],
    ['23', 'del', '  <span class="t-kw">public</span> <span class="t-type">IHttpActionResult</span> Settle(<span class="t-type">SettleReq</span> req)', '21', 'add', '    g.MapPost(<span class="t-str">"/settle"</span>, HandleSettle).WithName(<span class="t-str">"BillingSettle"</span>);'],
    ['24', 'del', '  {', '22', 'add', '    g.MapGet(<span class="t-str">"/invoices/{id}"</span>, HandleGetInvoice).WithName(<span class="t-str">"GetInvoice"</span>);'],
    ['25', 'del', '    <span class="t-kw">var</span> user = <span class="t-type">HttpContext</span>.Current.User.Identity.Name;', '23', 'add', '    <span class="t-kw">return</span> g;'],
    ['26', 'del', '    <span class="t-kw">var</span> cut = <span class="t-type">ConfigurationManager</span>.AppSettings[<span class="t-str">"Cutoff"</span>];', '24', 'add', '  }'],
    ['27', 'del', '    <span class="t-kw">var</span> res = _svc.PostSettlementAsync(req, user).Result;', '25', 'add', '  <span class="t-kw">private static async</span> <span class="t-type">Task</span>&lt;<span class="t-type">Results</span>&lt;<span class="t-type">Ok</span>&lt;<span class="t-type">SettleDto</span>&gt;, <span class="t-type">ValidationProblem</span>&gt;&gt;'],
    ['28', 'del', '    <span class="t-kw">if</span> (!res.IsValid) <span class="t-kw">return</span> BadRequest(res.Error);', '26', 'add', '    HandleSettle(<span class="t-type">SettleReq</span> req, <span class="t-type">IBillingSvc</span> svc, <span class="t-type">ClaimsPrincipal</span> user,'],
    ['29', 'del', '    <span class="t-type">LegacyAuditLog</span>.WriteSync(res.TxId, cut);', '27', 'add', '      <span class="t-type">IOptions</span>&lt;<span class="t-type">BillingOpts</span>&gt; opts, <span class="t-type">CancellationToken</span> ct)'],
    ['30', 'del', '    <span class="t-kw">return</span> Ok(res.Payload);', '28', 'add', '  {'],
    ['31', 'del', '  }', '29', 'add', '    <span class="t-kw">var</span> res = <span class="t-kw">await</span> svc.PostSettlementAsync(req, user.Identity!.Name!, ct);'],
    ['32', 'ctx', '', '30', 'add', '    <span class="t-kw">return</span> res.IsValid ? <span class="t-type">TypedResults</span>.Ok(res.Payload) : <span class="t-type">TypedResults</span>.ValidationProblem(res.Errors);'],
    ['33', 'del', '  <span class="t-attr">[HttpGet, Route("invoices/{id}")]</span>', '31', 'add', '  }'],
    ['34', 'del', '  <span class="t-kw">public</span> <span class="t-type">IHttpActionResult</span> GetInvoice(<span class="t-kw">string</span> id)', '32', 'add', '  <span class="t-kw">private static async</span> <span class="t-type">Task</span>&lt;<span class="t-type">Results</span>&lt;<span class="t-type">Ok</span>&lt;<span class="t-type">InvoiceDto</span>&gt;, <span class="t-type">NotFound</span>&gt;&gt;'],
    ['35', 'del', '  {', '33', 'add', '    HandleGetInvoice(<span class="t-kw">string</span> id, <span class="t-type">IBillingSvc</span> svc, <span class="t-type">CancellationToken</span> ct)'],
    ['36', 'del', '    <span class="t-kw">var</span> inv = _svc.FindInvoice(id);', '34', 'add', '  {'],
    ['37', 'del', '    <span class="t-kw">return</span> inv == <span class="t-kw">null</span> ? NotFound() : Ok(inv);', '35', 'add', '    <span class="t-kw">var</span> inv = <span class="t-kw">await</span> svc.FindInvoiceAsync(id, ct);'],
    ['38', 'del', '  }', '36', 'add', '    <span class="t-kw">return</span> inv <span class="t-kw">is null</span> ? <span class="t-type">TypedResults</span>.NotFound() : <span class="t-type">TypedResults</span>.Ok(inv);'],
    ['39', 'del', '}', '37', 'add', '  } }'],
  ];

  const diffPanel = `
    <div class="e-panel" style="height:546px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('code', 12, '#38bdf8')}
          <span class="mono">BillingController.cs (.NET 4.8) -> BillingEndpoints.cs (.NET 9.0)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('LANE-1 · PR #418', 'accent')}
          ${badge('ROSLYN AST 100%', 'ok')}
          <span class="mono" style="font-size:9.8px;"><span class="loc-add">+78</span> <span class="loc-del">-164</span></span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <div style="display:grid;grid-template-columns:1fr 1fr;background:#161f30;border-bottom:1px solid #243247;font-family:var(--e-mono);font-size:9.5px;color:#94a3b8;flex-shrink:0;">
          <div style="padding:4px 10px;border-right:1px solid #243247;display:flex;justify-content:space-between;">
            <span>SEBELUM: src/Billing.Legacy/Controllers/BillingController.cs</span>
            <span style="color:#fb7185;">net48 · System.Web.Http</span>
          </div>
          <div style="padding:4px 10px;display:flex;justify-content:space-between;">
            <span>SESUDAH: src/Billing.Api/Endpoints/BillingEndpoints.cs</span>
            <span style="color:#34d399;">net9.0 · Minimal API TypedResults</span>
          </div>
        </div>
        <div style="flex:1;min-height:0;overflow:hidden;background:#070b12;font-family:var(--e-mono);font-size:9.7px;line-height:1.52;">
          ${diffRows
            .map(
              ([lNo, lKind, lCode, rNo, rKind, rCode]) => `<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #101725;">
                <div style="display:flex;border-right:1px solid #243247;background:${lKind === 'del' ? '#241118' : 'transparent'};min-width:0;">
                  <span style="width:32px;text-align:right;padding:1px 6px 1px 0;color:#64748b;user-select:none;flex-shrink:0;">${lNo}</span>
                  <span style="width:14px;text-align:center;color:${lKind === 'del' ? '#fb7185' : '#475569'};flex-shrink:0;">${lKind === 'del' ? '-' : ' '}</span>
                  <span class="trunc" style="padding:1px 6px 1px 2px;color:#e2e8f0;">${lCode}</span>
                </div>
                <div style="display:flex;background:${rKind === 'add' ? '#092219' : 'transparent'};min-width:0;">
                  <span style="width:32px;text-align:right;padding:1px 6px 1px 0;color:#64748b;user-select:none;flex-shrink:0;">${rNo}</span>
                  <span style="width:14px;text-align:center;color:${rKind === 'add' ? '#34d399' : '#475569'};flex-shrink:0;">${rKind === 'add' ? '+' : ' '}</span>
                  <span class="trunc" style="padding:1px 6px 1px 2px;color:#e2e8f0;">${rCode}</span>
                </div>
              </div>`
            )
            .join('')}
        </div>
        <div style="padding:6px 10px;background:#08243a;border-top:1px solid #075985;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;flex-shrink:0;">
          <span style="display:flex;align-items:center;gap:6px;color:#bae6fd;">
            ${ic('checkCircle', 12, '#34d399')}
            <strong>ROSLYN-AST-OK:</strong> Route template <span class="mono">/api/v1/billing/settle</span>, hilangnya blocking <span class="mono">.Result</span> deadlock, DI eksplisit, &amp; skema JSON camelCase terverifikasi identik.
          </span>
          <span class="mono" style="color:#34d399;font-weight:700;">34/34 xUnit Lulus</span>
        </div>
      </div>
    </div>`;

  const astDiagramSvg = `<svg viewBox="0 0 676 196" width="100%" height="196" style="display:block;">
    <defs>
      <marker id="arrSky" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
      </marker>
    </defs>
    <!-- Stage 1 -->
    <rect x="6" y="14" width="146" height="106" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="6" y="14" width="146" height="22" rx="3" fill="#1f2937" />
    <text x="14" y="29" font-size="9.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#7dd3fc">1. Parse .NET 4.8 AST</text>
    <text x="14" y="50" font-size="9" font-family="Consolas,monospace" fill="#e2e8f0">14 ApiController</text>
    <text x="14" y="66" font-size="9" font-family="Consolas,monospace" fill="#94a3b8">68 ActionMethod</text>
    <text x="14" y="82" font-size="9" font-family="Consolas,monospace" fill="#fb7185">22 HttpContext.Current</text>
    <text x="14" y="98" font-size="9" font-family="Consolas,monospace" fill="#fb7185">19 Sync .Result calls</text>

    <line x1="152" y1="67" x2="176" y2="67" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrSky)" />

    <!-- Stage 2 -->
    <rect x="180" y="14" width="148" height="106" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="180" y="14" width="148" height="22" rx="3" fill="#1f2937" />
    <text x="188" y="29" font-size="9.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#7dd3fc">2. Roslyn Rewriter</text>
    <text x="188" y="50" font-size="9" font-family="Consolas,monospace" fill="#e2e8f0">CSharpSyntaxRewriter</text>
    <text x="188" y="66" font-size="9" font-family="Consolas,monospace" fill="#94a3b8">RoutePrefix -> MapGroup</text>
    <text x="188" y="82" font-size="9" font-family="Consolas,monospace" fill="#94a3b8">ServiceLocator -> DI</text>
    <text x="188" y="98" font-size="9" font-family="Consolas,monospace" fill="#34d399">async/await + CT</text>

    <line x1="328" y1="67" x2="352" y2="67" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrSky)" />

    <!-- Stage 3 -->
    <rect x="356" y="14" width="146" height="106" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="356" y="14" width="146" height="22" rx="3" fill="#1f2937" />
    <text x="364" y="29" font-size="9.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#7dd3fc">3. Semantic Guard</text>
    <text x="364" y="50" font-size="9" font-family="Consolas,monospace" fill="#34d399">CS Warnings: 0</text>
    <text x="364" y="66" font-size="9" font-family="Consolas,monospace" fill="#34d399">CA Analyzers: 0</text>
    <text x="364" y="82" font-size="9" font-family="Consolas,monospace" fill="#e2e8f0">OpenAPI Diff: Identik</text>
    <text x="364" y="98" font-size="9" font-family="Consolas,monospace" fill="#e2e8f0">Nullability: Enabled</text>

    <line x1="502" y1="67" x2="526" y2="67" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrSky)" />

    <!-- Stage 4 -->
    <rect x="530" y="14" width="140" height="106" rx="3" fill="#052e1e" stroke="#065f46" stroke-width="1.2" />
    <rect x="530" y="14" width="140" height="22" rx="3" fill="#064e3b" />
    <text x="538" y="29" font-size="9.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#6ee7b7">4. .NET 9 Output</text>
    <text x="538" y="50" font-size="9" font-family="Consolas,monospace" fill="#ecfdf5">14 Minimal Groups</text>
    <text x="538" y="66" font-size="9" font-family="Consolas,monospace" fill="#ecfdf5">68 TypedResults</text>
    <text x="538" y="82" font-size="9" font-family="Consolas,monospace" fill="#6ee7b7">0 Blocking Thread</text>
    <text x="538" y="98" font-size="9" font-family="Consolas,monospace" fill="#6ee7b7">Net -322 LOC (L1)</text>

    <!-- Bottom summary bar inside SVG -->
    <rect x="6" y="134" width="664" height="52" rx="3" fill="#0b101a" stroke="#243247" stroke-width="1" />
    <text x="16" y="153" font-size="9.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#cbd5e1">Bukti Deterministik Roslyn Compilation (net9.0 Release)</text>
    <text x="16" y="172" font-size="9.3" font-family="Consolas,monospace" fill="#94a3b8">Rule Set: SwarmForge.Net9.Strict.ruleset  ·  Symbol Binding: 100% Resolved  ·  Unsafe Cast: 0  ·  Alloc/Req: -41%</text>
  </svg>`;

  const bottomPanels = `
    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      <div class="e-panel" style="width:55%;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('cpu', 12, '#38bdf8')} <span>Peta Transformasi Sintaks Roslyn AST (LANE-1)</span></div>
          <span class="e-panel-sub mono">Roslyn 4.12 · Deterministik</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:center;">
          ${astDiagramSvg}
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 12, '#34d399')} <span>Paritas Snapshot Replay Produksi (128/128)</span></div>
          ${badge('BYTE-EXACT', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:205px;">Endpoint HTTP</th>
                <th style="width:94px;">SHA-256 Cocok</th>
                <th style="width:82px;" class="num">p95 4.8 -> 9</th>
                <th style="width:46px;" class="num">Req</th>
                <th style="width:68px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${REPLAY_ROUTES.map(
                (r) => `<tr>
                  <td class="mono trunc" style="font-size:9.6px;color:#f1f5f9;">${esc(r.route)}</td>
                  <td class="mono" style="font-size:9.3px;color:#34d399;">${esc(r.net9Sha)}</td>
                  <td class="num mono" style="font-size:9.5px;"><span style="color:#94a3b8;">${r.legMs}</span> -> <span style="color:#34d399;font-weight:700;">${r.net9Ms}ms</span></td>
                  <td class="num mono">${r.count}</td>
                  <td>${badge('COCOK', 'ok')}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="mono">TOTAL REPLAY FIXTURE (6 ENDPOINT KRITIS)</td>
                <td class="num mono" style="color:#34d399;">-69% p95</td>
                <td class="num mono">128</td>
                <td>${badge('100% OK', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:auto;padding:7px 10px;background:#0b101a;border-top:1px solid #243247;display:flex;justify-content:space-between;align-items:center;font-size:9.3px;" class="mono">
            <span style="color:#94a3b8;">Rata-rata p95: <span style="color:#cbd5e1;">216 ms</span> -> <span style="color:#34d399;font-weight:700;">66 ms</span></span>
            <span style="color:#7dd3fc;">Alokasi GC: -41% · 0 Schema Drift</span>
          </div>
        </div>
      </div>
    </div>`;

  const workspaceHtml = `
    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      ${fileList}
      <div style="flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:hidden;">
        ${diffPanel}
        ${bottomPanels}
      </div>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'SwarmForge CLI — Inspektor Diff AST Roslyn & Paritas Replay',
    extraCss: DARK_CSS,
    bodyHtml: renderWorkbench({
      activePage: 'p3',
      subTabs: [
        { icon: 'terminal', label: 'Orkestrator Swarm', count: '4 aktif' },
        { icon: 'layers', label: 'Antrean Modul', count: '16' },
        { icon: 'code', label: 'Diff Roslyn AST', count: '+1.052', active: true },
        { icon: 'gitBranch', label: 'Topologi Worktree', count: '11,4d' },
        { icon: 'shield', label: 'Audit & PR', count: '2 hold', warn: true },
      ],
      actionsHtml: `
        <span class="e-btn">${ic('copy', 11, '#cbd5e1')} Salin Patch Diff</span>
        <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Tandai File Ditinjau</span>
      `,
      workspaceHtml,
    }),
  });
}

// ============================================================================
// PAGE 4: TOPOLOGI GIT WORKTREE & PIPELINE GERBANG VERIFY GATE
// ============================================================================
function renderPage4() {
  const topologySvg = `<svg viewBox="0 0 1510 398" width="100%" height="398" style="display:block;">
    <defs>
      <marker id="mBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="mOk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#34d399" />
      </marker>
      <marker id="mWarn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>

    <!-- Column headers -->
    <text x="14" y="18" font-size="9.5" font-weight="700" font-family="Consolas,monospace" fill="#94a3b8">1. REPO PRIVAT &amp; BARE STORE</text>
    <text x="274" y="18" font-size="9.5" font-weight="700" font-family="Consolas,monospace" fill="#94a3b8">2. WORKSPACE LOCK GUARD</text>
    <text x="536" y="18" font-size="9.5" font-weight="700" font-family="Consolas,monospace" fill="#94a3b8">3. ISOLASI GIT WORKTREE PER AGENT (4 LANE)</text>
    <text x="954" y="18" font-size="9.5" font-weight="700" font-family="Consolas,monospace" fill="#94a3b8">4. GERBANG WAJIB VERIFY GATE</text>
    <text x="1256" y="18" font-size="9.5" font-weight="700" font-family="Consolas,monospace" fill="#94a3b8">5. GITEA PR &amp; SQLITE STATE</text>

    <!-- Col 1: On-Prem Repo -->
    <rect x="14" y="34" width="222" height="156" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="14" y="34" width="222" height="24" rx="3" fill="#1f2937" />
    <text x="24" y="50" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f8fafc">Gitea On-Prem Enterprise</text>
    <text x="24" y="76" font-size="9.4" font-family="Consolas,monospace" fill="#7dd3fc">Billing.Legacy.slnx</text>
    <text x="24" y="94" font-size="9.2" font-family="Consolas,monospace" fill="#94a3b8">Host: gitea.bank-nusantara</text>
    <text x="24" y="112" font-size="9.2" font-family="Consolas,monospace" fill="#94a3b8">Base: main @ 8f41c0a</text>
    <text x="24" y="130" font-size="9.2" font-family="Consolas,monospace" fill="#34d399">Branch Protection: STRICT</text>
    <rect x="24" y="144" width="202" height="34" rx="2" fill="#0b101a" stroke="#243247" />
    <text x="32" y="159" font-size="9" font-family="Consolas,monospace" fill="#cbd5e1">.git/objects (shared RO)</text>
    <text x="32" y="172" font-size="8.6" font-family="Consolas,monospace" fill="#64748b">Zero duplicate clone · 1,4 GB</text>

    <!-- Col 1 Bottom: Local vLLM Sovereign -->
    <rect x="14" y="210" width="222" height="168" rx="3" fill="#052e1e" stroke="#065f46" stroke-width="1.2" />
    <rect x="14" y="210" width="222" height="24" rx="3" fill="#064e3b" />
    <text x="24" y="226" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ecfdf5">Sovereign vLLM Cluster</text>
    <text x="24" y="252" font-size="9.3" font-family="Consolas,monospace" fill="#6ee7b7">10.42.8.14:8000 (Air-Gap)</text>
    <text x="24" y="270" font-size="9.1" font-family="Consolas,monospace" fill="#d1fae5">Model 1: Qwen2.5-Coder-32B</text>
    <text x="24" y="288" font-size="9.1" font-family="Consolas,monospace" fill="#d1fae5">Model 2: DeepSeek-Coder-V2</text>
    <text x="24" y="306" font-size="9.1" font-family="Consolas,monospace" fill="#a7f3d0">Cloud Egress: 0 Byte</text>
    <text x="24" y="324" font-size="9.1" font-family="Consolas,monospace" fill="#a7f3d0">NuGet Feed: Artifactory ID</text>
    <rect x="24" y="338" width="202" height="28" rx="2" fill="#041f14" stroke="#047857" />
    <text x="32" y="356" font-size="9" font-weight="700" font-family="Consolas,monospace" fill="#34d399">PATUH POJK 11/2022 &amp; UU PDP</text>

    <!-- Connectors Col 1 -> Col 2 -->
    <path d="M 236 112 L 270 112" stroke="#38bdf8" stroke-width="1.6" fill="none" marker-end="url(#mBlue)" />
    <path d="M 236 294 L 270 294" stroke="#34d399" stroke-width="1.6" fill="none" marker-end="url(#mOk)" />

    <!-- Col 2: Workspace Lock & Policy Guard -->
    <rect x="274" y="34" width="214" height="344" rx="3" fill="#111827" stroke="#38bdf8" stroke-width="1.4" />
    <rect x="274" y="34" width="214" height="26" rx="3" fill="#10253d" />
    <text x="284" y="51" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#7dd3fc">Policy Guard &amp; Mutex</text>
    <rect x="284" y="72" width="194" height="58" rx="2" fill="#161f30" stroke="#243247" />
    <text x="292" y="89" font-size="9.4" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f1f5f9">Worktree Path Isolation</text>
    <text x="292" y="105" font-size="8.8" font-family="Consolas,monospace" fill="#94a3b8">1 PID = 1 Direktori Worktree</text>
    <text x="292" y="120" font-size="8.8" font-family="Consolas,monospace" fill="#34d399">Cross-branch write: DENY</text>

    <rect x="284" y="142" width="194" height="58" rx="2" fill="#161f30" stroke="#243247" />
    <text x="292" y="159" font-size="9.4" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f1f5f9">Docker Sandbox Network</text>
    <text x="292" y="175" font-size="8.8" font-family="Consolas,monospace" fill="#94a3b8">--network=none + vLLM sock</text>
    <text x="292" y="190" font-size="8.8" font-family="Consolas,monospace" fill="#34d399">Public DNS: BLOCKED</text>

    <rect x="284" y="212" width="194" height="58" rx="2" fill="#161f30" stroke="#243247" />
    <text x="292" y="229" font-size="9.4" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f1f5f9">SQL &amp; Secret Interceptor</text>
    <text x="292" y="245" font-size="8.8" font-family="Consolas,monospace" fill="#94a3b8">T-SQL Stored Proc -> HOLD</text>
    <text x="292" y="260" font-size="8.8" font-family="Consolas,monospace" fill="#fbbf24">2 file LANE-3 tertahan</text>

    <rect x="284" y="282" width="194" height="84" rx="2" fill="#0b101a" stroke="#243247" />
    <text x="292" y="299" font-size="9.2" font-weight="700" font-family="Consolas,monospace" fill="#7dd3fc">LOCK TABLE (WAL)</text>
    <text x="292" y="316" font-size="8.8" font-family="Consolas,monospace" fill="#cbd5e1">L1: #19304  L2: #19358</text>
    <text x="292" y="331" font-size="8.8" font-family="Consolas,monospace" fill="#cbd5e1">L3: #19412  L4: #19477</text>
    <text x="292" y="352" font-size="8.8" font-family="Consolas,monospace" fill="#34d399">Kontaminasi: 0 file</text>

    <!-- Col 3: 4 Isolated Worktrees -->
    ${LANES.map((l, i) => {
      const y = 34 + i * 90;
      const isWarn = l.tone === 'warn';
      const stroke = isWarn ? '#b45309' : '#065f46';
      const hdrFill = isWarn ? '#2e1f05' : '#052e1e';
      const txtCol = isWarn ? '#fbbf24' : '#34d399';
      const marker = isWarn ? 'url(#mWarn)' : 'url(#mOk)';
      return `
        <path d="M 488 ${y + 37} L 532 ${y + 37}" stroke="#38bdf8" stroke-width="1.4" fill="none" marker-end="url(#mBlue)" />
        <rect x="536" y="${y}" width="362" height="74" rx="3" fill="#161f30" stroke="${stroke}" stroke-width="1.2" />
        <rect x="536" y="${y}" width="362" height="22" rx="3" fill="${hdrFill}" />
        <text x="546" y="${y + 15}" font-size="9.8" font-weight="700" font-family="Consolas,monospace" fill="${txtCol}">${esc(l.code)} · ${esc(l.worktree)}</text>
        <text x="888" y="${y + 15}" text-anchor="end" font-size="9" font-weight="700" font-family="Consolas,monospace" fill="${txtCol}">${esc(l.status.toUpperCase())}</text>
        <text x="546" y="${y + 39}" font-size="10" font-weight="600" font-family="Segoe UI,sans-serif" fill="#f1f5f9">${esc(l.title)}</text>
        <text x="546" y="${y + 58}" font-size="9" font-family="Consolas,monospace" fill="#94a3b8">${esc(l.model)} · SHA ${esc(l.headSha)} · +${l.add} -${l.del} · ${l.tests} tes · 0 warn</text>
        <path d="M 898 ${y + 37} L 950 ${y + 37}" stroke="${txtCol}" stroke-width="1.5" fill="none" marker-end="${marker}" />
      `;
    }).join('')}

    <!-- Col 4: 4-Stage Mandatory Verify Gate -->
    <rect x="954" y="34" width="256" height="344" rx="3" fill="#111827" stroke="#334155" stroke-width="1.2" />
    <rect x="954" y="34" width="256" height="26" rx="3" fill="#1f2937" />
    <text x="964" y="51" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f8fafc">Verify Gate (11,4 dtk)</text>
    ${[
      ['G1 · Roslyn AST & Static Guard', '0 Error · 2 Flag T-SQL (L3)', '1.420 ms', '#38bdf8'],
      ['G2 · dotnet build -c Release', '/warnaserror -> 0 Warning', '3.180 ms', '#34d399'],
      ['G3 · xUnit Regression Suite', '412 / 412 Lulus · 0 Gagal', '4.620 ms', '#10b981'],
      ['G4 · Replay Parity & PR Signer', '128/128 SHA-256 · SQLite WAL', '1.340 ms', '#a78bfa'],
    ]
      .map(([t, s, ms, col], idx) => {
        const gy = 72 + idx * 74;
        return `
          <rect x="966" y="${gy}" width="232" height="62" rx="3" fill="#161f30" stroke="#243247" />
          <rect x="966" y="${gy}" width="4" height="62" rx="1" fill="${col}" />
          <text x="978" y="${gy + 19}" font-size="9.8" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f1f5f9">${esc(t)}</text>
          <text x="978" y="${gy + 36}" font-size="9" font-family="Consolas,monospace" fill="#cbd5e1">${esc(s)}</text>
          <text x="978" y="${gy + 52}" font-size="8.8" font-family="Consolas,monospace" fill="${col}">Durasi: ${esc(ms)} · EXIT 0</text>
        `;
      })
      .join('')}

    <!-- Connectors Col 4 -> Col 5 -->
    <path d="M 1210 112 L 1252 112" stroke="#34d399" stroke-width="1.6" fill="none" marker-end="url(#mOk)" />
    <path d="M 1210 294 L 1252 294" stroke="#38bdf8" stroke-width="1.6" fill="none" marker-end="url(#mBlue)" />

    <!-- Col 5: Gitea PR Queue & SQLite -->
    <rect x="1256" y="34" width="240" height="196" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="1256" y="34" width="240" height="24" rx="3" fill="#1f2937" />
    <text x="1266" y="50" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f8fafc">Gitea PR Queue (4 PR)</text>
    ${LANES.map((l, idx) => {
      const py = 68 + idx * 38;
      const col = l.tone === 'warn' ? '#fbbf24' : '#34d399';
      return `
        <rect x="1266" y="${py}" width="220" height="30" rx="2" fill="#0b101a" stroke="#243247" />
        <text x="1274" y="${py + 19}" font-size="9.4" font-weight="700" font-family="Consolas,monospace" fill="#f1f5f9">PR ${esc(l.pr)} (${esc(l.code)})</text>
        <text x="1478" y="${py + 19}" text-anchor="end" font-size="9" font-weight="700" font-family="Consolas,monospace" fill="${col}">${esc(l.prStatus.toUpperCase())}</text>
      `;
    }).join('')}

    <rect x="1256" y="246" width="240" height="132" rx="3" fill="#161f30" stroke="#334155" stroke-width="1.2" />
    <rect x="1256" y="246" width="240" height="24" rx="3" fill="#1f2937" />
    <text x="1266" y="262" font-size="10.2" font-weight="700" font-family="Segoe UI,sans-serif" fill="#f8fafc">SQLite Run State &amp; Diff</text>
    <text x="1266" y="288" font-size="9.2" font-family="Consolas,monospace" fill="#7dd3fc">${esc(REPO.dbFile)}</text>
    <text x="1266" y="306" font-size="9" font-family="Consolas,monospace" fill="#cbd5e1">WAL Checkpoints: 16 / 16</text>
    <text x="1266" y="324" font-size="9" font-family="Consolas,monospace" fill="#cbd5e1">Diff Bundles: 4 .patch signed</text>
    <text x="1266" y="342" font-size="9" font-family="Consolas,monospace" fill="#34d399">Root: sha256:9f4c...e182</text>
    <text x="1266" y="362" font-size="8.8" font-family="Consolas,monospace" fill="#94a3b8">Siap audit Tech Lead &amp; OJK IT</text>
  </svg>`;

  const waterfallSvg = svgSpanWaterfall({
    width: 736,
    totalMs: 11400,
    dark: true,
    spans: GATE_SPANS,
  });

  const workspaceHtml = `
    <div class="e-panel" style="height:444px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 12, '#38bdf8')} <span>Arsitektur Isolasi Worktree Swarm &amp; Pipeline Verify Gate — ${esc(REPO.name)}</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('ZERO CROSS-BRANCH LEAK', 'ok')}
          ${badge('100% AIR-GAPPED', 'info')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;align-items:center;justify-content:center;padding:6px 10px;">
        ${topologySvg}
      </div>
    </div>

    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      <div class="e-panel" style="width:51%;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('clock', 12, '#38bdf8')} <span>Waterfall Eksekusi Verify Gate — Total 11.400 ms (11,4 dtk)</span></div>
          <span class="e-panel-sub mono">dotnet build + 412 xUnit + 128 Replay</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>${waterfallSvg}</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:10px;border-top:1px solid #1c273a;">
            <div style="background:#0b101a;border:1px solid #243247;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#94a3b8;">Offline NuGet Cache</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#34d399;">100% Hit</div>
              <div class="mono" style="font-size:8.8px;color:#64748b;">840 ms restore</div>
            </div>
            <div style="background:#0b101a;border:1px solid #243247;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#94a3b8;">MSBuild Release</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#34d399;">0 Warn / 0 Err</div>
              <div class="mono" style="font-size:8.8px;color:#64748b;">3.180 ms compile</div>
            </div>
            <div style="background:#0b101a;border:1px solid #243247;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#94a3b8;">xUnit Parallel (8 core)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#34d399;">412 / 412</div>
              <div class="mono" style="font-size:8.8px;color:#64748b;">4.620 ms runtime</div>
            </div>
            <div style="background:#0b101a;border:1px solid #243247;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#94a3b8;">SQLite &amp; PR Signer</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#38bdf8;">EXIT 0</div>
              <div class="mono" style="font-size:8.8px;color:#64748b;">430 ms commit</div>
            </div>
          </div>
          <div style="background:#0b101a;border:1px solid #243247;border-radius:2px;padding:7px 9px;display:flex;justify-content:space-between;align-items:center;font-size:9.6px;" class="mono">
            <span style="color:#cbd5e1;">Perintah Verifikasi: <span style="color:#7dd3fc;">swarmforge gate --all --strict --replay prod-20261121</span></span>
            <span style="color:#34d399;font-weight:700;">11.400 ms TOTAL</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 12, '#34d399')} <span>Aturan Policy Guard &amp; Isolasi Sandbox (8 Aturan Aktif)</span></div>
          <span class="e-panel-sub mono">swarm-guard.toml</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table p4-rules">
            <thead>
              <tr>
                <th style="width:58px;">Kode</th>
                <th style="width:270px;">Aturan Tata Kelola Swarm</th>
                <th style="width:94px;">Enforcer</th>
                <th style="width:74px;" class="num">Temuan</th>
                <th style="width:82px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${POLICY_RULES.map(
                (r) => `<tr class="${r.tone === 'warn' ? 'is-warn' : ''}">
                  <td class="mono" style="color:#7dd3fc;font-weight:700;">${esc(r.id)}</td>
                  <td class="trunc" style="color:#f1f5f9;">${esc(r.rule)}</td>
                  <td class="mono" style="font-size:9.5px;color:#94a3b8;">${esc(r.enforcer)}</td>
                  <td class="num mono" style="color:${r.tone === 'warn' ? '#fbbf24' : '#34d399'};font-weight:600;">${esc(r.hits)}</td>
                  <td>${badge(r.status, r.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="mono">ENFORCEMENT RATE: 8/8 ATURAN AKTIF DI RUNTIME</td>
                <td class="num mono" style="color:#fbbf24;">2 hold</td>
                <td>${badge('TERKAWAL', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:auto;padding:7px 10px;background:#0b101a;border-top:1px solid #243247;display:flex;justify-content:space-between;align-items:center;font-size:9.4px;" class="mono">
            <span style="color:#94a3b8;">Policy Digest: <span style="color:#cbd5e1;">sha256:4b12...8f90</span> · Mode: <span style="color:#34d399;">FAIL-CLOSED</span></span>
            <span style="color:#7dd3fc;">Terakhir Verifikasi: 09:26:48 WIB</span>
          </div>
        </div>
      </div>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'SwarmForge CLI — Topologi Git Worktree & Pipeline Verify Gate',
    extraCss: DARK_CSS,
    bodyHtml: renderWorkbench({
      activePage: 'p4',
      subTabs: [
        { icon: 'terminal', label: 'Orkestrator Swarm', count: '4 aktif' },
        { icon: 'layers', label: 'Antrean Modul', count: '16' },
        { icon: 'code', label: 'Diff Roslyn AST', count: '+1.052' },
        { icon: 'gitBranch', label: 'Topologi Worktree', count: '11,4d', active: true },
        { icon: 'shield', label: 'Audit & PR', count: '2 hold', warn: true },
      ],
      actionsHtml: `
        <span class="e-btn">${ic('lock', 11, '#cbd5e1')} Cek Mutex Lock</span>
        <span class="e-btn e-btn-primary">${ic('refresh', 11, '#ffffff')} Jalankan Ulang Gate</span>
      `,
      workspaceHtml,
    }),
  });
}

// ============================================================================
// PAGE 5: TRANSKRIP AUDIT DETERMINISTIK & BUKTI REVIEW PR
// ============================================================================
function renderPage5() {
  const prStrip = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
      ${LANES.map(
        (l, idx) => `<div class="e-kpi" style="border-color:${idx === 0 ? '#38bdf8' : l.tone === 'warn' ? '#78350f' : '#243247'};background:${idx === 0 ? '#10253d' : '#111827'};">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span class="mono" style="font-size:10.5px;font-weight:700;color:#f8fafc;">PR ${esc(l.pr)} · ${esc(l.code)}</span>
            ${badge(l.prStatus, l.tone)}
          </div>
          <div style="font-size:10.3px;font-weight:600;color:#e2e8f0;margin:2px 0;" class="trunc">${esc(l.title)}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.3px;" class="mono">
            <span><span class="loc-add">+${l.add}</span> <span class="loc-del">-${l.del}</span> · ${l.tests} tes</span>
            <span style="color:${l.tone === 'warn' ? '#fbbf24' : '#34d399'};">${l.warnings} warn · ${esc(l.headSha)}</span>
          </div>
        </div>`
      ).join('')}
    </div>`;

  const auditTablePanel = `
    <div class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 12, '#38bdf8')} <span>Transkrip Audit Deterministik — SQLite WORM Ledger (${esc(REPO.dbFile)})</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('16/16 HASH CHAIN VALID', 'ok')}
          <span class="e-panel-sub mono">Seed 0x4E91B2</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table p5-audit">
          <thead>
            <tr>
              <th style="width:42px;">Seq</th>
              <th style="width:68px;">WIB</th>
              <th style="width:62px;">Lane</th>
              <th style="width:360px;">Tahap &amp; Perintah Deterministik</th>
              <th style="width:42px;" class="num">Exit</th>
              <th style="width:126px;">Digest SHA-256</th>
              <th style="width:86px;">Verdict</th>
            </tr>
          </thead>
          <tbody>
            ${AUDIT_LOGS.map(
              (ev, idx) => `<tr class="${idx === 0 ? 'is-selected' : ev.tone === 'warn' ? 'is-warn' : ''}">
                <td class="mono" style="color:#94a3b8;">#${esc(ev.seq)}</td>
                <td class="mono" style="color:#cbd5e1;">${esc(ev.time)}</td>
                <td class="mono" style="color:${ev.lane === 'LANE-3' ? '#fbbf24' : '#7dd3fc'};font-weight:700;">${esc(ev.lane)}</td>
                <td class="mono trunc" style="font-size:9.8px;color:#f1f5f9;">${esc(ev.stage)}</td>
                <td class="num mono" style="color:${ev.exit === '0' ? '#34d399' : '#fbbf24'};font-weight:700;">${esc(ev.exit)}</td>
                <td class="mono" style="font-size:9.4px;color:#94a3b8;">${esc(ev.sha)}</td>
                <td>${badge(ev.status, ev.tone)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="mono">INTEGRITAS RANTAI AUDIT: 16 ENTRI TERKUNCI · 0 MUTASI ILEGAL · REPRODUCIBILITY 100%</td>
              <td class="num mono" style="color:#34d399;">0 err</td>
              <td class="mono" style="color:#34d399;">9f4c...e182</td>
              <td>${badge('WORM OK', 'ok')}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:auto;padding:8px 10px;background:#0e1524;border-top:1px solid #243247;display:flex;align-items:center;justify-content:space-between;font-size:9.7px;" class="mono">
          <span style="color:#cbd5e1;">Target Integrasi: <span style="color:#7dd3fc;">Gitea Enterprise (gitea.bank-nusantara.internal)</span> · Mirror: Azure DevOps Server 2022</span>
          <span style="color:#34d399;">Bundel Diff: pr-418..421-audit.tar.zst (482 KB)</span>
        </div>
      </div>
    </div>`;

  const rightGovernance = `
    <div style="width:524px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;min-height:0;">
      <div class="e-panel" style="height:212px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 12, '#34d399')} <span>Kepatuhan Sovereign AI &amp; Air-Gapped DevOps</span></div>
          ${badge('POJK 11/2022', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;justify-content:center;">
          ${[
            ['Inferensi LLM Lokal (vLLM)', '10.42.8.14:8000 · Qwen2.5-Coder-32B & DeepSeek-V2', '0 BYTE EGRESS', 'ok'],
            ['Repositori Privat & CI', 'Gitea On-Prem mTLS + Azure DevOps Privat', 'TERISOLASI', 'ok'],
            ['Feed Dependensi NuGet', 'Artifactory Internal (.NET 9.0.102 Offline)', '100% LOKAL', 'ok'],
            ['Audit Secret & Kredensial', 'Pre-commit scanner & Roslyn analyzer (16 file)', '0 TEMUAN', 'ok'],
          ]
            .map(
              ([k, d, b, t]) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #1c273a;">
                <div style="min-width:0;">
                  <div style="font-size:10.3px;font-weight:600;color:#f1f5f9;">${esc(k)}</div>
                  <div class="mono trunc" style="font-size:9.1px;color:#94a3b8;">${esc(d)}</div>
                </div>
                ${badge(b, t)}
              </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="e-panel" style="height:336px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 12, '#38bdf8')} <span>Manifes Bukti PR #418 (LANE-1 · Siap Review Tech Lead)</span></div>
          <span class="e-panel-sub mono">JSON Signed</span>
        </div>
        <div class="e-panel-body-flush">
          <div class="sf-term" style="font-size:9.6px;line-height:1.45;">
            <div>{</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"run_id"</span>: <span class="t-str">"run_20261122_0914"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"pull_request"</span>: <span class="t-str">"gitea://core-banking/Billing.Legacy/pulls/418"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"worktree_lane"</span>: <span class="t-str">"LANE-1 (wt/lane-1-minimal-api)"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"git_range"</span>: <span class="t-str">"8f41c0a..7a3d91c"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"roslyn_ruleset"</span>: <span class="t-str">"SwarmForge.Net9.Strict (v4.12)"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"diff_summary"</span>: { <span class="t-kw">"controllers"</span>: 14, <span class="t-kw">"added"</span>: 318, <span class="t-kw">"deleted"</span>: 640 },</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"build_gate"</span>: { <span class="t-kw">"config"</span>: <span class="t-str">"Release"</span>, <span class="t-kw">"warnings"</span>: <span class="t-ok">0</span>, <span class="t-kw">"errors"</span>: <span class="t-ok">0</span> },</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"xunit_suite"</span>: { <span class="t-kw">"lane_passed"</span>: <span class="t-ok">124</span>, <span class="t-kw">"total_passed"</span>: <span class="t-ok">412</span>, <span class="t-kw">"failed"</span>: <span class="t-ok">0</span> },</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"replay_parity"</span>: { <span class="t-kw">"matched"</span>: <span class="t-str">"128/128"</span>, <span class="t-kw">"p95_delta"</span>: <span class="t-str">"-72.7%"</span> },</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"sql_flags_in_lane"</span>: <span class="t-ok">0</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"nuget_feed"</span>: <span class="t-str">"artifactory.bank-nusantara.internal (offline)"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"inference_sovereignty"</span>: <span class="t-str">"vllm-onprem-10.42.8.14 (0B egress)"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"deterministic_seed"</span>: <span class="t-str">"0x4E91B2"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"artifact_sha256"</span>: <span class="t-str">"9f4c2b81e7a041d2c88a1b54f9e20c73a48e182"</span>,</div>
            <div>&nbsp;&nbsp;<span class="t-kw">"tech_lead_signoff"</span>: <span class="t-str">"PENDING: R. Wijaya (Staff .NET Architect)"</span></div>
            <div>}</div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 12, '#34d399')} <span>Gerbang Persetujuan &amp; Merge PR</span></div>
          <span class="e-panel-sub mono">3 Siap · 1 Hold DBA</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
              <span style="color:#e2e8f0;">PR #418 (Minimal API) · PR #419 (Refit) · PR #421 (xUnit)</span>
              ${badge('VERIFIED 0-WARN', 'ok')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
              <span style="color:#fde68a;">PR #420 (EF Core 9 + Dapper · 2 Stored Proc T-SQL)</span>
              ${badge('BUTUH SIGN DBA', 'warn')}
            </div>
            <div style="font-size:9.5px;color:#94a3b8;">
              Merge dilakukan secara fast-forward terisolasi ke branch integrasi <span class="mono">release/dotnet9-billing</span> setelah tanda tangan Tech Lead tercatat di Gitea.
            </div>
          </div>
          <div style="display:flex;gap:6px;padding-top:6px;border-top:1px solid #243247;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#ffffff')} Setujui &amp; Merge 3 PR Siap</span>
            <span class="e-btn" style="justify-content:center;">${ic('download', 11, '#cbd5e1')} Unduh Bundel Audit</span>
          </div>
        </div>
      </div>
    </div>`;

  const workspaceHtml = `
    ${prStrip}
    <div style="flex:1;min-height:0;display:flex;gap:8px;overflow:hidden;">
      ${auditTablePanel}
      ${rightGovernance}
    </div>`;

  return wrapEnterpriseHtml({
    title: 'SwarmForge CLI — Transkrip Audit Deterministik & Bukti Review PR',
    extraCss: DARK_CSS,
    bodyHtml: renderWorkbench({
      activePage: 'p5',
      subTabs: [
        { icon: 'terminal', label: 'Orkestrator Swarm', count: '4 aktif' },
        { icon: 'layers', label: 'Antrean Modul', count: '16' },
        { icon: 'code', label: 'Diff Roslyn AST', count: '+1.052' },
        { icon: 'gitBranch', label: 'Topologi Worktree', count: '11,4d' },
        { icon: 'shield', label: 'Audit & PR', count: '2 hold', warn: true, active: true },
      ],
      actionsHtml: `
        <span class="e-btn">${ic('download', 11, '#cbd5e1')} Ekspor SQLite Audit</span>
        <span class="e-btn e-btn-ok">${ic('checkCircle', 11, '#ecfdf5')} Publikasi 3 PR ke Gitea</span>
      `,
      workspaceHtml,
    }),
  });
}

export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
  ];
}
