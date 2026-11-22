import {
  esc,
  fmtNum,
  fmtIdr,
  fmtPct,
  ic,
  badge,
  wrapEnterpriseHtml,
  renderEnvTopbar,
  renderTreeSidebar,
  renderStatusFooter,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSparkline,
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-001',
  name: 'GarudaRouter',
  reference: 'Datadog + Cloudflare Enterprise',
  pages: [
    { slug: 'p1', title: 'Command Center & Kesehatan Pool' },
    { slug: 'p2', title: 'Telemetri Request & Inspektor Trace' },
    { slug: 'p3', title: 'Topologi Routing & Aturan Failover' },
    { slug: 'p4', title: 'Kepatuhan UU PDP PP 33/2026 & RBAC' },
    { slug: 'p5', title: 'Developer SDK & Diff Redaksi Prompt' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================
const POOLS = [
  { id: 'jkt-vllm-qwen72b-sovereign', provider: 'vLLM Lokal', region: 'DCI Jakarta JK5', residency: 'ID-Sovereign', req: 54210, tokM: 118.4, p50: 142, p95: 284, cap: 52, err: 0.02, costIdr: 0, status: 'Healthy', tone: 'ok' },
  { id: 'anthropic-claude-sonnet45', provider: 'Anthropic Ent', region: 'SG/US Redacted', residency: 'PII-Stripped', req: 31840, tokM: 94.6, p50: 348, p95: 612, cap: 64, err: 0.08, costIdr: 42570000, status: 'Healthy', tone: 'ok' },
  { id: 'openai-gpt41-responses', provider: 'OpenAI / Azure', region: 'SG East Redacted', residency: 'PII-Stripped', req: 24650, tokM: 68.2, p50: 392, p95: 740, cap: 89, err: 0.41, costIdr: 29326000, status: 'Throttled', tone: 'warn' },
  { id: 'gemini-25-flash-batch', provider: 'Vertex AI', region: 'asia-southeast2 (JKT)', residency: 'ID-Region', req: 22910, tokM: 112.8, p50: 214, p95: 396, cap: 28, err: 0.04, costIdr: 11280000, status: 'Healthy', tone: 'ok' },
  { id: 'jkt-vllm-sahabat70b-id', provider: 'vLLM Lokal', region: 'DCI Jakarta JK5', residency: 'ID-Sovereign', req: 11420, tokM: 29.5, p50: 168, p95: 310, cap: 34, err: 0.01, costIdr: 0, status: 'Healthy', tone: 'ok' },
  { id: 'deepseek-r1-private-vpc', provider: 'Private VPC', region: 'JKT-DC2 Standby', residency: 'ID-Private', req: 3890, tokM: 14.9, p50: 520, p95: 980, cap: 18, err: 0.12, costIdr: 4470000, status: 'Standby', tone: 'info' },
];

const ENTITY_SPEND = [
  { name: 'PT Bank Digital GRC', req: 41280, localPct: 58, costIdr: 26840000, budgetIdr: 35000000 },
  { name: 'Divisi Engineering & AI', req: 36420, localPct: 24, costIdr: 24190000, budgetIdr: 30000000 },
  { name: 'PT GRC Industri Manufaktur', req: 24150, localPct: 49, costIdr: 14620000, budgetIdr: 20000000 },
  { name: 'Holding Legal, Tax & Audit', req: 19840, localPct: 86, costIdr: 5840000, budgetIdr: 12000000 },
  { name: 'PT Logistik Nusantara', req: 16110, localPct: 31, costIdr: 10316000, budgetIdr: 15000000 },
  { name: 'PT Medika Prima & Lainnya', req: 11120, localPct: 42, costIdr: 5840000, budgetIdr: 10000000 },
];

const PII_DETECTORS = [
  { code: 'PII-ID-01', name: 'NIK 16-Digit (KTP / Dukcapil)', engine: 'Regex + Checksum Wilayah', action: 'TOKENIZE', tone: 'ok', count24h: 1418, fpRate: '0,04%', avgMs: '4,2 ms', law: 'UU PDP Ps. 4(2)' },
  { code: 'PII-ID-02', name: 'NPWP 16-Digit / 15-Digit Lama', engine: 'NER IndoBERT + Pattern', action: 'TOKENIZE', tone: 'ok', count24h: 894, fpRate: '0,06%', avgMs: '5,1 ms', law: 'UU KUP / CoreTax' },
  { code: 'PII-ID-03', name: 'Nomor Rekening & Kartu Bank', engine: 'Luhn + Bank Prefix ID', action: 'BLOCK_EGRESS', tone: 'bad', count24h: 762, fpRate: '0,02%', avgMs: '3,8 ms', law: 'POJK 11/2022' },
  { code: 'PII-ID-04', name: 'Nomor HP (+62) & Email Pribadi', engine: 'Deterministic Pattern', action: 'TOKENIZE', tone: 'ok', count24h: 318, fpRate: '0,11%', avgMs: '2,1 ms', law: 'UU PDP Ps. 4(3)' },
  { code: 'PII-ID-05', name: 'No. Rekam Medis & ICD-10 Pasien', engine: 'Clinical NER + Context', action: 'FORCE_LOCAL', tone: 'warn', count24h: 222, fpRate: '0,03%', avgMs: '6,8 ms', law: 'PMK 24/2022' },
  { code: 'PII-ID-06', name: 'No. Polis Asuransi & Kartu BPJS', engine: 'Pattern + Prefix BPJS', action: 'TOKENIZE', tone: 'ok', count24h: 112, fpRate: '0,05%', avgMs: '3,4 ms', law: 'UU PDP Ps. 4(2)' },
  { code: 'PII-ID-07', name: 'Slip Gaji, PPh 21 & Kompensasi', engine: 'Classifier HR-Payroll', action: 'FORCE_LOCAL', tone: 'warn', count24h: 74, fpRate: '0,08%', avgMs: '7,2 ms', law: 'PP 33/2026' },
  { code: 'PII-ID-08', name: 'API Key, Bearer Token & Secret', engine: 'Entropy + Prefix Vault', action: 'BLOCK_403', tone: 'bad', count24h: 42, fpRate: '0,01%', avgMs: '1,9 ms', law: 'ISO 27001 A.9' },
];

const TRACES = [
  { id: 'trc_9f82c1e9', time: '09:24:14', tenant: 'Divisi Engineering', app: 'omp-ide-agent', pool: 'anthropic-claude-sonnet45', tokIn: 4820, tokOut: 1410, ttft: 342, pii: 0, cost: 624, http: 200 },
  { id: 'trc_9f82c1d2', time: '09:24:11', tenant: 'Holding Legal', app: 'nusarag-redline', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 8420, tokOut: 1920, ttft: 158, pii: 4, cost: 0, http: 200 },
  { id: 'trc_9f82c1b8', time: '09:24:09', tenant: 'PT Bank Digital', app: 'cs-copilotsvc', pool: 'jkt-vllm-sahabat70b-id', tokIn: 2140, tokOut: 610, ttft: 164, pii: 2, cost: 0, http: 200 },
  { id: 'trc_9f82c1a4', time: '09:24:06', tenant: 'PT Bank Digital', app: 'kyc-credit-eval', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 3180, tokOut: 890, ttft: 146, pii: 3, cost: 0, http: 200, selected: true },
  { id: 'trc_9f82c191', time: '09:24:02', tenant: 'PT Logistik', app: 'ceisa-extractor', pool: 'gemini-25-flash-batch', tokIn: 14200, tokOut: 2180, ttft: 224, pii: 1, cost: 164, http: 200 },
  { id: 'trc_9f82c17e', time: '09:23:58', tenant: 'Divisi Engineering', app: 'pr-review-bot', pool: 'openai-gpt41-responses', tokIn: 6150, tokOut: 980, ttft: 785, pii: 0, cost: 512, http: 429, warn: true },
  { id: 'trc_9f82c16c', time: '09:23:57', tenant: 'Divisi Engineering', app: 'pr-review-bot', pool: 'anthropic-claude-sonnet45', tokIn: 6150, tokOut: 1020, ttft: 368, pii: 0, cost: 698, http: 200 },
  { id: 'trc_9f82c155', time: '09:23:53', tenant: 'PT Medika Prima', app: 'emr-soap-scribe', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 2940, tokOut: 780, ttft: 138, pii: 5, cost: 0, http: 200 },
  { id: 'trc_9f82c140', time: '09:23:49', tenant: 'Holding Tax', app: 'coretax-helper', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 5110, tokOut: 1120, ttft: 152, pii: 3, cost: 0, http: 200 },
  { id: 'trc_9f82c12c', time: '09:23:45', tenant: 'PT GRC Industri', app: 'mes-sop-qa', pool: 'gemini-25-flash-batch', tokIn: 9480, tokOut: 1340, ttft: 208, pii: 0, cost: 108, http: 200 },
  { id: 'trc_9f82c119', time: '09:23:41', tenant: 'PT Bank Digital', app: 'aml-alert-triage', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 4620, tokOut: 940, ttft: 149, pii: 6, cost: 0, http: 200 },
  { id: 'trc_9f82c104', time: '09:23:38', tenant: 'External Sandbox', app: 'unauth-script', pool: 'BLOCKED_EDGE_PII', tokIn: 1840, tokOut: 0, ttft: 14, pii: 2, cost: 0, http: 403, bad: true },
  { id: 'trc_9f82c0f1', time: '09:23:33', tenant: 'Divisi Engineering', app: 'roslyn-migrator', pool: 'anthropic-claude-sonnet45', tokIn: 9120, tokOut: 2640, ttft: 394, pii: 0, cost: 1142, http: 200 },
  { id: 'trc_9f82c0de', time: '09:23:29', tenant: 'PT Logistik', app: 'manifest-ocr-llm', pool: 'openai-gpt41-responses', tokIn: 5340, tokOut: 1180, ttft: 412, pii: 1, cost: 486, http: 200 },
  { id: 'trc_9f82c0c7', time: '09:23:25', tenant: 'Holding Legal', app: 'dpa-checker', pool: 'jkt-vllm-sahabat70b-id', tokIn: 3890, tokOut: 820, ttft: 171, pii: 2, cost: 0, http: 200 },
  { id: 'trc_9f82c0b2', time: '09:23:21', tenant: 'PT GRC Industri', app: 'vendor-rfq-cmp', pool: 'deepseek-r1-private-vpc', tokIn: 7640, tokOut: 2150, ttft: 518, pii: 0, cost: 340, http: 200 },
  { id: 'trc_9f82c09d', time: '09:23:18', tenant: 'PT Bank Digital', app: 'treasury-brief', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 3420, tokOut: 740, ttft: 141, pii: 4, cost: 0, http: 200 },
  { id: 'trc_9f82c088', time: '09:23:12', tenant: 'Divisi Engineering', app: 'sql-linter-ci', pool: 'openai-gpt41-responses', tokIn: 4180, tokOut: 890, ttft: 388, pii: 0, cost: 374, http: 200 },
  { id: 'trc_9f82c074', time: '09:23:08', tenant: 'PT Medika Prima', app: 'icd10-coder', pool: 'jkt-vllm-qwen72b-sovereign', tokIn: 2680, tokOut: 520, ttft: 136, pii: 3, cost: 0, http: 200 },
  { id: 'trc_9f82c05f', time: '09:23:03', tenant: 'PT Logistik', app: 'route-eta-gen', pool: 'gemini-25-flash-batch', tokIn: 6820, tokOut: 960, ttft: 219, pii: 0, cost: 78, http: 200 },
];

const RBAC_QUOTAS = [
  { unit: 'PT Bank Digital GRC', role: 'Sovereign-Strict', pools: 'vLLM JKT, Vertex JKT', paguMtd: 950000000, usedMtd: 684200000, mode: 'Hard-Block', status: 'Normal', tone: 'ok' },
  { unit: 'Divisi Engineering & AI', role: 'Multi-Pool Dev', pools: 'Anthropic, OpenAI, vLLM', paguMtd: 820000000, usedMtd: 642800000, mode: 'Auto-Cap', status: '78% Pagu', tone: 'warn' },
  { unit: 'PT GRC Industri Manufaktur', role: 'Ops & Batch', pools: 'vLLM JKT, Vertex JKT', paguMtd: 540000000, usedMtd: 348900000, mode: 'Auto-Cap', status: 'Normal', tone: 'ok' },
  { unit: 'Holding Legal, Tax & Audit', role: 'Sovereign-Only', pools: 'vLLM JKT (100% Lokal)', paguMtd: 300000000, usedMtd: 142500000, mode: 'Local-Lock', status: 'Zero Egress', tone: 'ok' },
  { unit: 'PT Logistik Nusantara', role: 'OCR & Dispatch', pools: 'Vertex JKT, OpenAI', paguMtd: 420000000, usedMtd: 289400000, mode: 'Auto-Cap', status: 'Normal', tone: 'ok' },
  { unit: 'PT Medika Prima (RS)', role: 'Clinical PHI', pools: 'vLLM JKT (100% Lokal)', paguMtd: 260000000, usedMtd: 158200000, mode: 'Local-Lock', status: 'PMK 24 OK', tone: 'ok' },
  { unit: 'Contact Center & BPO', role: 'QA & CS Voice', pools: 'Sahabat-70B, Vertex', paguMtd: 380000000, usedMtd: 334600000, mode: 'Throttle', status: '88% Pagu', tone: 'warn' },
  { unit: 'Holding Finance & Treasury', role: 'Sovereign-Strict', pools: 'vLLM JKT, DeepSeek', paguMtd: 310000000, usedMtd: 184000000, mode: 'Hard-Block', status: 'Normal', tone: 'ok' },
  { unit: 'HRIS & Rekrutmen Grup', role: 'PII-Mask Strict', pools: 'vLLM JKT, Sahabat', paguMtd: 180000000, usedMtd: 96400000, mode: 'Local-Lock', status: 'Normal', tone: 'ok' },
  { unit: 'PT Properti & Aset GRC', role: 'Doc & Kontrak', pools: 'vLLM JKT, Vertex JKT', paguMtd: 160000000, usedMtd: 88500000, mode: 'Auto-Cap', status: 'Normal', tone: 'ok' },
  { unit: 'Sekretariat Korporat & IR', role: 'Briefing & ESG', pools: 'Sahabat-70B, vLLM', paguMtd: 120000000, usedMtd: 64200000, mode: 'Local-Lock', status: 'Normal', tone: 'ok' },
  { unit: 'R&D Sandbox & Evaluasi', role: 'Isolated Test', pools: 'DeepSeek VPC, Vertex', paguMtd: 140000000, usedMtd: 129800000, mode: 'Hard-Block', status: '93% Kritis', tone: 'bad' },
];

export function verifyMath() {
  const sumReq = POOLS.reduce((a, p) => a + p.req, 0);
  const sumCost = POOLS.reduce((a, p) => a + p.costIdr, 0);
  const sumEntityReq = ENTITY_SPEND.reduce((a, e) => a + e.req, 0);
  const sumEntityCost = ENTITY_SPEND.reduce((a, e) => a + e.costIdr, 0);
  const sumPii = PII_DETECTORS.reduce((a, d) => a + d.count24h, 0);

  if (sumReq !== 148920) throw new Error(`Math mismatch sumReq=${sumReq}`);
  if (sumEntityReq !== sumReq) throw new Error(`Math mismatch entityReq=${sumEntityReq} vs ${sumReq}`);
  if (sumCost !== 87646000) throw new Error(`Math mismatch sumCost=${sumCost}`);
  if (sumEntityCost !== sumCost) throw new Error(`Math mismatch entityCost=${sumEntityCost} vs ${sumCost}`);
  if (sumPii !== 3842) throw new Error(`Math mismatch sumPii=${sumPii}`);
}

const TOTAL_REQ = POOLS.reduce((a, p) => a + p.req, 0);
const TOTAL_TOK_M = POOLS.reduce((a, p) => a + p.tokM, 0);
const TOTAL_COST = POOLS.reduce((a, p) => a + p.costIdr, 0);
const LOCAL_REQ = POOLS.filter((p) => p.residency === 'ID-Sovereign').reduce((a, p) => a + p.req, 0);
const LOCAL_PCT = (LOCAL_REQ / TOTAL_REQ) * 100;
const TOTAL_PII = PII_DETECTORS.reduce((a, d) => a + d.count24h, 0);

function shellLayout({ activeNav, breadcrumb, actionsHtml, contentHtml, extraCss = '' }) {
  const topbar = renderEnvTopbar({
    mark: 'GR',
    productName: 'GarudaRouter',
    envLabel: 'PROD-ID-JKT1',
    tenantName: 'GRC Holding Group (14 Entitas)',
    searchPlaceholder: 'Cari trace_id, pool, policy, NIK/NPWP audit...',
    timeRange: '24 Jam Terakhir · WIB',
    healthText: '6/6 Pool · SLA 99,98%',
    userInitials: 'HP',
    userName: 'H. Pratama',
    userRole: 'Principal AI Infra',
  });

  const sidebar = renderTreeSidebar({
    activeId: activeNav,
    groups: [
      {
        label: 'OPERASIONAL GATEWAY',
        items: [
          { id: 'p1', icon: 'activity', label: 'Command Center', badge: 'LIVE' },
          { id: 'p2', icon: 'database', label: 'Telemetri Request', badge: '148,9k' },
          { id: 'p3', icon: 'gitBranch', label: 'Topologi & Routing', badge: '11 rule' },
          { id: 'models', icon: 'cpu', label: 'Katalog Model', badge: '18' },
        ],
      },
      {
        label: 'TATA KELOLA & UU PDP',
        items: [
          { id: 'p4', icon: 'shield', label: 'PII Guardrail & Audit', badge: '3.842' },
          { id: 'rbac', icon: 'users', label: 'RBAC & Kuota Divisi', badge: '14' },
          { id: 'alerts', icon: 'alert', label: 'Insiden & Failover', badge: '3', badgeWarn: true },
        ],
      },
      {
        label: 'DEVELOPER & SDK',
        items: [
          { id: 'p5', icon: 'terminal', label: 'SDK & Prompt Diff', badge: 'v1' },
          { id: 'keys', icon: 'key', label: 'API Keys & Rotasi', badge: '42' },
          { id: 'webhooks', icon: 'zap', label: 'OpenTelemetry Export' },
        ],
      },
    ],
    footHtml: `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
        <span style="font-weight:700;color:#0f172a;display:inline-flex;align-items:center;gap:5px;">
          <span class="dot dot-ok"></span>Cluster DCI JK5
        </span>
        <span class="mono" style="color:#047857;font-weight:700;">8/8 H100</span>
      </div>
      <div style="color:#475569;margin-bottom:4px;">VRAM Terpakai: <strong class="mono">527 / 640 GB</strong></div>
      ${renderCapacityBar(82.4, { warnAt: 85, critAt: 95 })}
      <div style="margin-top:5px;color:#64748b;font-size:9.2px;">Sovereign Local Ratio: <strong class="mono" style="color:#0f52ba;">${fmtPct(LOCAL_PCT)}</strong></div>
    `,
  });

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><strong>GarudaRouter v4.8.2-sovereign</strong>`,
      `Region: <strong>id-jakarta-1 (DCI JK5)</strong>`,
      `PG-Ledger Sync: <strong>4 ms</strong>`,
      `Redis Quota: <strong>0,8 ms</strong>`,
    ],
    rightItems: [
      `Policy: <strong>UU-PDP-PP33-2026-rev4</strong>`,
      `WORM Chain: <strong>SHA-256 Verified</strong>`,
      `WIB <strong>09:24:18</strong>`,
    ],
  });

  const bodyHtml = `
    ${topbar}
    <div class="e-shell-body">
      ${sidebar}
      <main class="e-main">
        <div class="e-subbar">
          <div class="e-crumb">${breadcrumb}</div>
          <div style="display:flex;align-items:center;gap:6px;">${actionsHtml}</div>
        </div>
        <div class="e-content">${contentHtml}</div>
      </main>
    </div>
    ${footer}
  `;

  return wrapEnterpriseHtml({
    title: `GarudaRouter — ${activeNav}`,
    accent: '#0f52ba',
    accentSoft: '#e8f0fe',
    accentInk: '#0b3d91',
    extraCss,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1: COMMAND CENTER INFERENCE & KESEHATAN POOL
// ============================================================================
function renderPage1() {
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '11:20', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '09:24'];
  const ttftP95 = [310, 290, 275, 295, 420, 468, 692, 448, 430, 455, 410, 365, 330, 398];
  const ttftP50 = [165, 158, 152, 160, 248, 276, 338, 272, 260, 282, 254, 224, 196, 268];
  const localP50 = [128, 125, 122, 124, 144, 152, 164, 148, 142, 149, 140, 134, 130, 142];

  const mainChart = svgMultiLineChart({
    width: 820,
    height: 222,
    xLabels: hours,
    yMin: 0,
    yMax: 800,
    yTicks: 4,
    yUnit: 'ms',
    threshold: { value: 500, label: 'Batas SLA TTFT: 500 ms', color: '#be123c' },
    annotations: [
      { index: 6, seriesIdx: 0, label: '11:20 OpenAI 429 -> Auto-Failover Anthropic (1,4s)', color: '#b45309', dy: -26 },
    ],
    series: [
      { label: 'Global TTFT p95 (ms)', values: ttftP95, color: '#0f52ba', area: true, width: 2 },
      { label: 'Global TTFT p50 (ms)', values: ttftP50, color: '#0284c7', width: 1.8 },
      { label: 'Sovereign JKT vLLM p50 (ms)', values: localP50, color: '#047857', dashed: true, width: 1.7 },
    ],
  });

  const kpis = [
    { label: 'Request (24 Jam)', val: fmtNum(TOTAL_REQ), delta: '+14,2% vs kmrn', tone: 'ok', sub: 'Puncak 412 req/menit', pts: [62, 68, 71, 69, 82, 91, 95, 88, 94, 102], color: '#0f52ba' },
    { label: 'Volume Token (24 Jam)', val: `${TOTAL_TOK_M.toFixed(1).replace('.', ',')}M`, delta: 'Cache hit 31,8%', tone: 'info', sub: 'In 332,6M · Out 105,8M', pts: [40, 44, 48, 52, 59, 64, 61, 68, 74, 79], color: '#0284c7' },
    { label: 'Chargeback (24 Jam)', val: fmtIdr(TOTAL_COST), delta: '-22,4% vLLM', tone: 'ok', sub: 'Hemat Rp 58,4 jt/hari', pts: [98, 96, 92, 94, 88, 86, 89, 84, 82, 80], color: '#047857' },
    { label: 'Median TTFT Global', val: '268 ms', delta: 'SLA < 500 ms', tone: 'ok', sub: 'p95: 398 ms · JKT: 142 ms', pts: [290, 284, 278, 281, 312, 338, 285, 274, 270, 268], color: '#0f52ba' },
    { label: 'Field PII Tersaring', val: fmtNum(TOTAL_PII), delta: '0 bocor luar RI', tone: 'warn', sub: 'NIK 1.418 · NPWP 894', pts: [210, 240, 285, 310, 340, 390, 360, 380, 405, 422], color: '#b45309' },
    { label: 'Rasio Sovereign Lokal', val: fmtPct(LOCAL_PCT), delta: `${fmtNum(LOCAL_REQ)} lokal`, tone: 'ok', sub: 'DCI JK5 Rp 0/token', pts: [36, 37, 39, 40, 41, 42, 42.5, 43, 43.8, 44.1], color: '#047857' },
  ];

  const alerts = [
    { sev: 'P2', tone: 'warn', time: '09:23:58', title: 'openai-gpt41-responses mencapai 89% kuota RPM', detail: 'Traffic coding 30% dialihkan sementara ke anthropic-claude-sonnet45 (0 dropped).' },
    { sev: 'P1', tone: 'bad', time: '09:23:38', title: 'Blokir Egress 403 · API Key & No. Rekening Terdeteksi', detail: 'Tenant External Sandbox diblokir edge policy PII-ID-03 sebelum keluar cluster.' },
    { sev: 'INFO', tone: 'info', time: '09:14:02', title: 'Rotasi Kunci Enterprise Anthropic Key #03 Selesai', detail: 'Zero-downtime hot swap pada 3 node gateway Jakarta (verifikasi Vault OK).' },
    { sev: 'OK', tone: 'ok', time: '08:45:10', title: 'Auto-Scale Worker vLLM Qwen-72B (Replica 3 -> 4)', detail: 'Antrean legal pagi hari turun dari 410 ms ke 142 ms dalam 38 detik.' },
    { sev: 'INFO', tone: 'neutral', time: '07:30:00', title: 'Ekspor Jurnal Chargeback Harian ke SAP Finance', detail: 'Batch Rp 87.646.000 tervalidasi 14 cost center · hash WORM tercatat.' },
  ];

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(6,minmax(0,1fr));">
      ${kpis
        .map(
          (k) => `<div class="e-kpi">
            <div class="e-kpi-top">
              <span class="trunc">${esc(k.label)}</span>
              ${badge(k.delta, k.tone)}
            </div>
            <div class="e-kpi-mid">
              <div class="e-kpi-val">${esc(k.val)}</div>
              ${svgSparkline({ points: k.pts, width: 66, height: 22, color: k.color })}
            </div>
            <div class="e-kpi-foot"><span>${esc(k.sub)}</span></div>
          </div>`
        )
        .join('')}
    </div>

    <div style="display:grid;grid-template-columns:1.68fr 1fr;gap:9px;height:362px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0f52ba')}<span>Latensi Inference TTFT (p50 vs p95) &amp; Ambang SLA 24 Jam</span></div>
          <div style="display:flex;gap:5px;align-items:center;">
            ${badge('Interval 15m', 'neutral')}
            ${badge('Failover 24j: 14 event', 'warn')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${mainChart}
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:10.2px;">
            <div><span style="color:#64748b;">Throughput Puncak</span><div class="mono" style="font-weight:700;font-size:12px;">412 req/mnt</div></div>
            <div><span style="color:#64748b;">Prefix Cache Hit</span><div class="mono" style="font-weight:700;font-size:12px;color:#047857;">31,8% (-Rp 19,2 jt)</div></div>
            <div><span style="color:#64748b;">Rate Error 5xx</span><div class="mono" style="font-weight:700;font-size:12px;color:#047857;">0,04% (60 req)</div></div>
            <div><span style="color:#64748b;">MTTR Failover Pool</span><div class="mono" style="font-weight:700;font-size:12px;">1,4 detik</div></div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')}<span>Chargeback Biaya 24 Jam per Entitas (IDR)</span></div>
          <span class="mono" style="font-size:10px;font-weight:700;color:#0f52ba;">${fmtIdr(TOTAL_COST)}</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${ENTITY_SPEND.map((e) => {
              const pct = (e.costIdr / TOTAL_COST) * 100;
              return `<div>
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;gap:6px;">
                  <span style="font-weight:600;font-size:10.8px;" class="trunc">${esc(e.name)}</span>
                  <span class="mono" style="font-size:10.5px;font-weight:700;flex-shrink:0;">${fmtIdr(e.costIdr)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <div style="flex:1;height:7px;background:#e2e8f0;border-radius:2px;overflow:hidden;display:flex;">
                    <div style="width:${pct.toFixed(1)}%;background:#0f52ba;"></div>
                  </div>
                  <span class="mono" style="font-size:9.5px;color:#64748b;width:124px;text-align:right;white-space:nowrap;flex-shrink:0;">${fmtNum(e.req)} req · ${e.localPct}% JKT</span>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div style="padding-top:8px;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;align-items:center;font-size:10.5px;">
            <span style="color:#475569;font-weight:600;">Total 14 Entitas (100% Teratribusi)</span>
            <span class="mono" style="font-weight:700;color:#0f172a;">${fmtNum(TOTAL_REQ)} req · ${fmtIdr(TOTAL_COST)}</span>
          </div>
        </div>
      </section>
    </div>

    <div style="display:grid;grid-template-columns:1.68fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#0f52ba')}<span>Matriks Kesehatan 6 Pool Inference &amp; Kapasitas Kuota</span></div>
          <div style="display:flex;gap:5px;">
            ${badge('2 Sovereign JKT', 'ok')}
            ${badge('1 Throttled', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:22.5%;">ID Pool Inference</th>
                <th style="width:15%;">Residency / Region</th>
                <th class="num" style="width:8.5%;">Req 24j</th>
                <th class="num" style="width:7.5%;">Token</th>
                <th class="num" style="width:11%;">p50 / p95</th>
                <th style="width:12%;">Kapasitas</th>
                <th class="num" style="width:12.5%;">Biaya 24j</th>
                <th style="width:11%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${POOLS.map(
                (p) => `<tr class="${p.tone === 'warn' ? 'is-warn' : ''}">
                  <td style="padding:6px 7px;"><div class="mono" style="font-weight:700;color:#0f172a;">${esc(p.id)}</div><div style="font-size:9.3px;color:#64748b;">${esc(p.provider)}</div></td>
                  <td style="padding:6px 7px;"><div style="font-weight:600;">${esc(p.residency)}</div><div style="font-size:9.3px;color:#64748b;">${esc(p.region)}</div></td>
                  <td class="num mono">${fmtNum(p.req)}</td>
                  <td class="num mono">${p.tokM.toFixed(1).replace('.', ',')}M</td>
                  <td class="num mono">${p.p50} / <span style="color:#64748b;">${p.p95}ms</span></td>
                  <td>${renderCapacityBar(p.cap)}</td>
                  <td class="num mono" style="font-weight:600;color:${p.costIdr === 0 ? '#047857' : '#0f172a'};">${fmtIdr(p.costIdr)}</td>
                  <td>${badge(p.status, p.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL AGREGAT 6 POOL (24 JAM WIB)</td>
                <td class="num mono">${fmtNum(TOTAL_REQ)}</td>
                <td class="num mono">${TOTAL_TOK_M.toFixed(1).replace('.', ',')}M</td>
                <td class="num mono">268 / 398ms</td>
                <td class="mono" style="font-size:9.8px;">Avg 47,5%</td>
                <td class="num mono">${fmtIdr(TOTAL_COST)}</td>
                <td>${badge('99,98% SLA', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;background:#f8fafc;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;font-size:9.8px;color:#475569;">
            <div><span style="color:#64748b;">Cluster DCI JK5</span><div class="mono" style="font-weight:700;color:#0f172a;">2x DGX H100 (8x 80GB)</div></div>
            <div><span style="color:#64748b;">Utilisasi VRAM / KV Cache</span><div class="mono" style="font-weight:700;color:#0f52ba;">527 / 640 GB (82,4%)</div></div>
            <div><span style="color:#64748b;">Suhu GPU / Antrean</span><div class="mono" style="font-weight:700;color:#047857;">64°C · Queue 3 req</div></div>
            <div><span style="color:#64748b;">Egress Firewall</span><div class="mono" style="font-weight:700;color:#047857;">STRICT_UU_PDP_ON</div></div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('bell', 13, '#b45309')}<span>Antrean Peringatan &amp; Insiden Failover</span></div>
          ${badge('2 Perlu Tinjau', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          ${alerts
            .map(
              (a) => `<div style="padding:7px 8px;border:1px solid #e2e8f0;border-left:3px solid ${a.tone === 'bad' ? '#be123c' : a.tone === 'warn' ? '#b45309' : a.tone === 'ok' ? '#047857' : '#0284c7'};border-radius:3px;background:#ffffff;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:2px;">
                  <div style="display:flex;align-items:center;gap:5px;min-width:0;">
                    ${badge(a.sev, a.tone)}
                    <span style="font-weight:700;font-size:10.5px;" class="trunc">${esc(a.title)}</span>
                  </div>
                  <span class="mono" style="font-size:9.3px;color:#64748b;flex-shrink:0;">${a.time}</span>
                </div>
                <div style="font-size:10px;color:#475569;line-height:1.3;">${esc(a.detail)}</div>
              </div>`
            )
            .join('')}
        </div>
      </section>
    </div>
  `;

  return shellLayout({
    activeNav: 'p1',
    breadcrumb: `<span>Operasional Gateway</span>${ic('chevronRight', 12)}<strong>Command Center Inference &amp; Kesehatan Pool</strong>`,
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11)} Auto-Refresh 10d</span>
      <span class="e-btn">${ic('download', 11)} Ekspor Laporan Chargeback</span>
      <span class="e-btn e-btn-primary">${ic('zap', 11)} Uji Simulasi Failover</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR TELEMETRI REQUEST & INSPEKTOR TRACE (20 ROWS + WATERFALL)
// ============================================================================
function renderPage2() {
  const sumIn = TRACES.reduce((a, t) => a + t.tokIn, 0);
  const sumOut = TRACES.reduce((a, t) => a + t.tokOut, 0);
  const sumCost = TRACES.reduce((a, t) => a + t.cost, 0);
  const sumPii = TRACES.reduce((a, t) => a + t.pii, 0);
  const avgTtft = Math.round(TRACES.reduce((a, t) => a + t.ttft, 0) / TRACES.length);

  const waterfall = svgSpanWaterfall({
    width: 416,
    totalMs: 442,
    spans: [
      { label: '1. Edge mTLS & Quota', start: 0, dur: 6, color: '#64748b' },
      { label: '2. UU PDP PII Scanner', start: 6, dur: 19, color: '#b45309' },
      { label: '3. Policy Router DAG', start: 25, dur: 3, color: '#0284c7' },
      { label: '4. vLLM Prefill (3.180t)', start: 28, dur: 118, color: '#0f52ba' },
      { label: '5. Decode Stream (890t)', start: 146, dur: 296, color: '#047857' },
    ],
  });

  const contentHtml = `
    <div style="background:#ffffff;border:1px solid #d8dee6;border-radius:4px;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:6px;min-width:0;">
        <div style="height:24px;width:250px;padding:0 8px;border:1px solid #cbd5e1;border-radius:3px;background:#f8fafc;display:flex;align-items:center;gap:6px;color:#64748b;font-size:10.5px;">
          ${ic('search', 11)} <span>Filter trace_id, app, pool, status...</span>
        </div>
        <span class="e-btn">${ic('filter', 11)} Entitas: Semua (14)</span>
        <span class="e-btn">Pool: Semua (6)</span>
        <span class="e-btn" style="background:#fffbeb;border-color:#fde68a;color:#92400e;">PII: Tersaring &amp; Diblokir</span>
        <span class="e-btn">HTTP: 200 · 429 · 403</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('Live Tail: ON (42 req/d)', 'ok')}
        <span class="e-btn">${ic('download', 11)} Parquet / CSV</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.96fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0f52ba')}<span>Buku Besar Telemetri Inference Real-Time</span><span class="e-panel-sub">Menampilkan 1–20 dari ${fmtNum(TOTAL_REQ)} trace (24 jam)</span></div>
          <div style="display:flex;gap:5px;">
            ${badge('18 OK (200)', 'ok')}
            ${badge('1 Retry (429)', 'warn')}
            ${badge('1 Blokir (403)', 'bad')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:3%;"><span class="cb"></span></th>
                <th style="width:11%;">Trace ID</th>
                <th style="width:7.5%;">WIB</th>
                <th style="width:15.5%;">Entitas / Aplikasi</th>
                <th style="width:20%;">Target Model Pool</th>
                <th class="num" style="width:14.5%;">Token In / Out</th>
                <th class="num" style="width:7.5%;">TTFT</th>
                <th class="num" style="width:5%;">PII</th>
                <th class="num" style="width:9.8%;">Biaya</th>
                <th style="width:6.2%;">HTTP</th>
              </tr>
            </thead>
            <tbody>
              ${TRACES.map(
                (t) => `<tr class="${t.selected ? 'is-selected' : t.bad ? 'is-bad' : t.warn ? 'is-warn' : ''}">
                  <td><span class="cb ${t.selected ? 'checked' : ''}">${t.selected ? ic('check', 9, '#ffffff') : ''}</span></td>
                  <td class="mono" style="font-weight:700;color:${t.selected ? '#0b3d91' : '#0f172a'};">${t.id}</td>
                  <td class="mono" style="color:#64748b;">${t.time}</td>
                  <td><span style="font-weight:600;">${esc(t.tenant)}</span> <span style="color:#64748b;font-size:9.5px;">· ${esc(t.app)}</span></td>
                  <td class="mono" style="font-size:10px;color:${t.bad ? '#be123c' : '#334155'};">${esc(t.pool)}</td>
                  <td class="num mono">${fmtNum(t.tokIn)} / ${fmtNum(t.tokOut)}</td>
                  <td class="num mono" style="color:${t.ttft > 500 ? '#b45309' : '#0f172a'};font-weight:${t.ttft > 500 ? 700 : 500};">${t.ttft}ms</td>
                  <td class="num mono">${t.pii > 0 ? `<span style="color:#b45309;font-weight:700;">${t.pii}</span>` : '<span style="color:#94a3b8;">0</span>'}</td>
                  <td class="num mono" style="color:${t.cost === 0 ? '#047857' : '#0f172a'};">${fmtIdr(t.cost)}</td>
                  <td>${badge(String(t.http), t.http === 200 ? 'ok' : t.http === 429 ? 'warn' : 'bad')}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">SUBTOTAL BATCH TERLIHAT (20 BARIS · TERVERIFIKASI MATEMATIS)</td>
                <td class="num mono">${fmtNum(sumIn)} / ${fmtNum(sumOut)}</td>
                <td class="num mono">${avgTtft}ms</td>
                <td class="num mono">${sumPii}</td>
                <td class="num mono">${fmtIdr(sumCost)}</td>
                <td class="mono">20/20</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;">
            <span>Total Penyimpanan WORM Ledger: <strong class="mono">412,8 GB</strong> (Retensi 5 tahun UU PDP · Partisi bulanan PostgreSQL)</span>
            <span class="mono">Halaman 1 / 7.446 · &lt; Prev · Next &gt;</span>
          </div>
        </div>
      </section>

      <aside class="e-panel" style="border-color:#93c5fd;">
        <div class="e-panel-head" style="background:#eff6ff;border-bottom-color:#bfdbfe;">
          <div class="e-panel-title" style="color:#0b3d91;">${ic('eye', 13, '#0b3d91')}<span>Inspektor Trace: trc_9f82c1a4</span></div>
          ${badge('200 OK · Sovereign', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:8px;">
            <div><div style="font-size:9.3px;color:#64748b;">ENTITAS &amp; APLIKASI</div><div style="font-weight:700;">PT Bank Digital · kyc-credit-eval</div></div>
            <div><div style="font-size:9.3px;color:#64748b;">WAKTU &amp; TOTAL LATENSI</div><div class="mono" style="font-weight:700;">09:24:06 WIB · 442 ms</div></div>
            <div><div style="font-size:9.3px;color:#64748b;">TARGET POOL</div><div class="mono" style="font-weight:700;color:#047857;">jkt-vllm-qwen72b-sovereign</div></div>
            <div><div style="font-size:9.3px;color:#64748b;">BIAYA AKTUAL / HEMAT</div><div class="mono" style="font-weight:700;color:#047857;">Rp 0 <span style="color:#64748b;font-weight:500;">(vs Rp 412 ext)</span></div></div>
          </div>

          <div>
            <div style="font-size:10px;font-weight:700;color:#334155;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>WATERFALL LATENSI SPAN (OTEL)</span>
              <span class="mono" style="color:#0f52ba;">Total 442 ms · TTFT 146 ms</span>
            </div>
            <div style="border:1px solid #e2e8f0;border-radius:3px;padding:7px;background:#ffffff;">
              ${waterfall}
            </div>
          </div>

          <div>
            <div style="font-size:10px;font-weight:700;color:#334155;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>ENTITAS PII TERSARING (3 FIELD · UU PDP)</span>
              ${badge('Zero Foreign Egress', 'ok')}
            </div>
            <table class="e-table" style="border:1px solid #e2e8f0;">
              <thead>
                <tr>
                  <th style="width:28%;">Kelas PII</th>
                  <th style="width:42%;">Token Vault Pengganti</th>
                  <th class="num" style="width:15%;">Skor</th>
                  <th style="width:15%;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>NIK 16-Digit</td><td class="mono" style="color:#b45309;">[PII_NIK_88a1]</td><td class="num mono">99,8%</td><td>${badge('Mask', 'ok')}</td></tr>
                <tr><td>NPWP-16</td><td class="mono" style="color:#b45309;">[PII_NPWP_44c2]</td><td class="num mono">99,4%</td><td>${badge('Mask', 'ok')}</td></tr>
                <tr><td>No. Rekening</td><td class="mono" style="color:#be123c;">[PII_ACCT_19f0]</td><td class="num mono">99,9%</td><td>${badge('Local', 'warn')}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="background:#0f172a;color:#e2e8f0;border-radius:3px;padding:8px 9px;font-family:var(--e-mono);font-size:9.6px;line-height:1.45;">
            <div style="color:#94a3b8;margin-bottom:3px;">// WORM Audit Metadata (No Raw PII Stored)</div>
            <div>prompt_sha256: <span style="color:#93c5fd;">e3b0c44298fc1c14...8a92d1</span></div>
            <div>policy_matched: <span style="color:#86efac;">POL-001 (SOVEREIGN_PII_LOCK)</span></div>
            <div>traceparent: <span style="color:#fde68a;">00-4bf92f3577b34da6a3ce-00f067aa0b-01</span></div>
            <div>token_usage: prompt=3180 · cached=640 · completion=890</div>
          </div>

          <div style="margin-top:auto;display:flex;gap:6px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('terminal', 11)} Buka Diff Prompt</span>
            <span class="e-btn" style="flex:1;justify-content:center;">${ic('copy', 11)} Salin cURL</span>
            <span class="e-btn">${ic('download', 11)} JSON</span>
          </div>
        </div>
      </aside>
    </div>
  `;

  return shellLayout({
    activeNav: 'p2',
    breadcrumb: `<span>Operasional Gateway</span>${ic('chevronRight', 12)}<strong>Buku Besar Telemetri Request &amp; Inspektor Trace</strong>`,
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 11)} Kolom (10)</span>
      <span class="e-btn e-btn-primary">${ic('refresh', 11)} Segarkan Stream</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3: TOPOLOGI ROUTING VISUAL, FAILOVER & ATURAN RATE-LIMIT
// ============================================================================
function renderPage3() {
  const dagSvg = `<svg viewBox="0 0 1320 295" width="100%" height="295" style="display:block;">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
      </marker>
      <marker id="arrBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f52ba" />
      </marker>
      <marker id="arrGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#047857" />
      </marker>
      <marker id="arrWarn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#b45309" />
      </marker>
    </defs>

    <!-- Column headers -->
    <text x="14" y="16" font-size="9.5" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">1. INGRESS APLIKASI INTERNAL (148.920 REQ/24J)</text>
    <text x="315" y="16" font-size="9.5" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">2. EDGE GUARDRAIL &amp; UU PDP</text>
    <text x="615" y="16" font-size="9.5" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">3. POLICY ROUTER &amp; CIRCUIT BREAKER</text>
    <text x="985" y="16" font-size="9.5" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">4. TARGET POOL INFERENCE (6 ACTIVE)</text>

    <!-- Column 1: Ingress Nodes -->
    ${[
      { y: 30, title: 'IDE & Coding Agents', sub: 'omp · VS Code · CI PR-Bot', req: '42.180 req', c: '#0f52ba' },
      { y: 96, title: 'ERP, Legal & CoreTax', sub: 'NusaRAG · KYC · Finance', req: '38.940 req', c: '#047857' },
      { y: 162, title: 'Contact Center & EMR', sub: 'SuaraCS · SOAP Medis', req: '41.200 req', c: '#0284c7' },
      { y: 228, title: 'Batch ETL & OCR', sub: 'CEISA · Manifest · SKU', req: '26.600 req', c: '#475569' },
    ]
      .map(
        (n) => `
      <rect x="14" y="${n.y}" width="224" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
      <rect x="14" y="${n.y}" width="4" height="52" rx="2" fill="${n.c}" />
      <text x="27" y="${n.y + 19}" font-size="11" font-weight="700" fill="#0f172a" font-family="system-ui,sans-serif">${n.title}</text>
      <text x="27" y="${n.y + 34}" font-size="9.5" fill="#64748b" font-family="system-ui,sans-serif">${n.sub}</text>
      <text x="228" y="${n.y + 20}" text-anchor="end" font-size="9.5" font-weight="700" fill="${n.c}" font-family="ui-monospace,Consolas,monospace">${n.req}</text>
      <path d="M 238 ${n.y + 26} C 276 ${n.y + 26}, 276 155, 312 155" fill="none" stroke="#94a3b8" stroke-width="1.3" marker-end="url(#arr)" />
    `
      )
      .join('')}

    <!-- Column 2: Edge Guardrail Pipeline Box -->
    <rect x="315" y="30" width="236" height="250" rx="5" fill="#f8fafc" stroke="#0f52ba" stroke-width="1.5" />
    <rect x="315" y="30" width="236" height="24" rx="4" fill="#0f52ba" />
    <text x="326" y="46" font-size="10" font-weight="700" fill="#ffffff" font-family="system-ui,sans-serif">GarudaRouter .NET 9 Edge Pipeline</text>
    ${[
      { y: 66, name: 'mTLS & API Key Auth', stat: '42 keys · 0,8 ms', bg: '#ffffff', bd: '#cbd5e1' },
      { y: 118, name: 'Redis Token Bucket Quota', stat: '14 entitas · 1,1 ms', bg: '#ffffff', bd: '#cbd5e1' },
      { y: 170, name: 'UU PDP PII NER Scanner', stat: '3.842 masked · 19 ms', bg: '#fffbeb', bd: '#f59e0b' },
      { y: 222, name: 'Protocol Adapter (OAI/Anth)', stat: 'JSON Schema · 2,4 ms', bg: '#ffffff', bd: '#cbd5e1' },
    ]
      .map(
        (s) => `
      <rect x="327" y="${s.y}" width="212" height="42" rx="3" fill="${s.bg}" stroke="${s.bd}" stroke-width="1" />
      <text x="336" y="${s.y + 17}" font-size="10.2" font-weight="700" fill="#0f172a" font-family="system-ui,sans-serif">${s.name}</text>
      <text x="336" y="${s.y + 32}" font-size="9.3" fill="#475569" font-family="ui-monospace,Consolas,monospace">${s.stat}</text>
    `
      )
      .join('')}

    <!-- Connectors Col 2 -> Col 3 -->
    <path d="M 551 100 C 580 100, 580 58, 612 58" fill="none" stroke="#047857" stroke-width="1.8" marker-end="url(#arrGreen)" />
    <path d="M 551 140 C 580 140, 580 124, 612 124" fill="none" stroke="#0f52ba" stroke-width="1.8" marker-end="url(#arrBlue)" />
    <path d="M 551 180 C 580 180, 580 190, 612 190" fill="none" stroke="#0284c7" stroke-width="1.5" marker-end="url(#arr)" />
    <path d="M 551 220 C 580 220, 580 254, 612 254" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrWarn)" />

    <!-- Column 3: Policy Router Rules -->
    ${[
      { y: 32, code: 'POL-001', title: 'Sovereign PII & Legal Lock', rule: 'pii>0 OR tenant∈{Legal,RS} -> 100% Lokal', c: '#047857', bg: '#ecfdf5' },
      { y: 98, code: 'POL-002', title: 'Weighted Coding & Agent Pool', rule: 'Weight 70% Anthropic / 30% OpenAI', c: '#0f52ba', bg: '#eff6ff' },
      { y: 164, code: 'POL-003', title: 'High-Volume Document Triage', rule: 'tok>8k & batch=true -> Vertex JKT', c: '#0284c7', bg: '#f0f9ff' },
      { y: 230, code: 'POL-004', title: 'Circuit Breaker Fallback', rule: 'Trigger: >3x 429 atau p95 > 850 ms', c: '#b45309', bg: '#fffbeb' },
    ]
      .map(
        (r) => `
      <rect x="615" y="${r.y}" width="286" height="52" rx="4" fill="${r.bg}" stroke="${r.c}" stroke-width="1.2" />
      <rect x="623" y="${r.y + 8}" width="52" height="15" rx="2" fill="${r.c}" />
      <text x="649" y="${r.y + 18.5}" text-anchor="middle" font-size="8.8" font-weight="700" fill="#ffffff" font-family="ui-monospace,Consolas,monospace">${r.code}</text>
      <text x="682" y="${r.y + 19}" font-size="10.5" font-weight="700" fill="#0f172a" font-family="system-ui,sans-serif">${r.title}</text>
      <text x="623" y="${r.y + 39}" font-size="9.3" fill="#334155" font-family="ui-monospace,Consolas,monospace">${r.rule}</text>
    `
      )
      .join('')}

    <!-- Connectors Col 3 -> Col 4 -->
    <path d="M 901 52 C 942 52, 942 46, 982 46" fill="none" stroke="#047857" stroke-width="2" marker-end="url(#arrGreen)" />
    <path d="M 901 64 C 942 64, 942 90, 982 90" fill="none" stroke="#047857" stroke-width="1.4" marker-end="url(#arrGreen)" />
    <path d="M 901 118 C 942 118, 942 134, 982 134" fill="none" stroke="#0f52ba" stroke-width="2" marker-end="url(#arrBlue)" />
    <path d="M 901 132 C 942 132, 942 178, 982 178" fill="none" stroke="#b45309" stroke-width="1.6" stroke-dasharray="4,2" marker-end="url(#arrWarn)" />
    <path d="M 901 190 C 942 190, 942 222, 982 222" fill="none" stroke="#0284c7" stroke-width="1.6" marker-end="url(#arr)" />
    <path d="M 901 256 C 942 256, 942 266, 982 266" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrWarn)" />

    <!-- Column 4: 6 Target Pools -->
    ${[
      { y: 28, id: 'jkt-vllm-qwen72b-sovereign', meta: '54.210 req · 142ms · Rp 0', st: 'HEALTHY', c: '#047857' },
      { y: 72, id: 'jkt-vllm-sahabat70b-id', meta: '11.420 req · 168ms · Rp 0', st: 'HEALTHY', c: '#047857' },
      { y: 116, id: 'anthropic-claude-sonnet45', meta: '31.840 req · 348ms · W:70%', st: 'HEALTHY', c: '#0f52ba' },
      { y: 160, id: 'openai-gpt41-responses', meta: '24.650 req · 392ms · 89% CAP', st: 'THROTTLED', c: '#b45309' },
      { y: 204, id: 'gemini-25-flash-batch', meta: '22.910 req · 214ms · JKT', st: 'HEALTHY', c: '#0284c7' },
      { y: 248, id: 'deepseek-r1-private-vpc', meta: '3.890 req · 520ms · FALLBACK', st: 'STANDBY', c: '#475569' },
    ]
      .map(
        (p) => `
      <rect x="985" y="${p.y}" width="322" height="36" rx="4" fill="#ffffff" stroke="${p.c === '#b45309' ? '#f59e0b' : '#cbd5e1'}" stroke-width="1.2" />
      <circle cx="998" cy="${p.y + 18}" r="4" fill="${p.c}" />
      <text x="1009" y="${p.y + 15}" font-size="10" font-weight="700" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">${p.id}</text>
      <text x="1009" y="${p.y + 28}" font-size="9" fill="#64748b" font-family="ui-monospace,Consolas,monospace">${p.meta}</text>
      <text x="1298" y="${p.y + 21}" text-anchor="end" font-size="8.5" font-weight="700" fill="${p.c}" font-family="ui-monospace,Consolas,monospace">${p.st}</text>
    `
      )
      .join('')}
  </svg>`;

  const rules = [
    { prio: '01', id: 'POL-001', cond: 'pii_detected > 0 OR data_class == PHI_MEDIS', target: 'jkt-vllm-qwen72b (100%)', cb: 'Block Foreign Egress', hit: '44.620', st: 'Aktif', tone: 'ok' },
    { prio: '02', id: 'POL-002', cond: 'tenant IN (Holding Legal, Tax) AND lang == ID', target: 'jkt-vllm-qwen72b / Sahabat', cb: 'Failover Local Only', hit: '21.010', st: 'Aktif', tone: 'ok' },
    { prio: '03', id: 'POL-003', cond: 'app == omp-ide-agent OR task == code_review', target: 'Anthropic 70% · OpenAI 30%', cb: '>3x 429 -> 100% Anth', hit: '36.420', st: 'Aktif', tone: 'ok' },
    { prio: '04', id: 'POL-004', cond: 'openai_rpm_util >= 85% (Circuit Half-Open)', target: 'Drain OpenAI -> Anthropic', cb: 'Cooldown 120 detik', hit: '14', st: 'Triggered', tone: 'warn' },
    { prio: '05', id: 'POL-005', cond: 'input_tokens > 8.000 AND priority == batch', target: 'gemini-25-flash-batch', cb: 'p95>900ms -> DeepSeek', hit: '22.910', st: 'Aktif', tone: 'ok' },
    { prio: '06', id: 'POL-006', cond: 'tenant == Contact Center AND dialect == ID', target: 'jkt-vllm-sahabat70b-id', cb: 'Queue>25 -> Qwen72b', hit: '11.420', st: 'Aktif', tone: 'ok' },
    { prio: '07', id: 'POL-007', cond: 'secret_entropy >= 4.5 (API Key / Credential)', target: 'REJECT HTTP 403', cb: 'Alert SecOps SIEM', hit: '42', st: 'Enforced', tone: 'bad' },
    { prio: '08', id: 'POL-008', cond: 'cost_center_mtd >= 100% (Hard Budget Cap)', target: 'Degrade -> Sovereign vLLM', cb: 'Notifikasi CFO & VP', hit: '8.604', st: 'Aktif', tone: 'ok' },
    { prio: '09', id: 'POL-009', cond: 'reasoning_mode == deep_audit AND budget_ok', target: 'deepseek-r1-private-vpc', cb: 'Timeout 45s -> Anth', hit: '3.880', st: 'Standby', tone: 'info' },
    { prio: '10', id: 'POL-010', cond: 'endpoint == /v1/embeddings (RAG Index)', target: 'jkt-bge-m3-local (100%)', cb: 'Replica Failover JK5', hit: '18.420', st: 'Aktif', tone: 'ok' },
    { prio: '11', id: 'POL-011', cond: 'content_type == image/pdf AND ocr == true', target: 'gemini-25-flash-batch', cb: 'Size>12MB -> Local', hit: '9.140', st: 'Aktif', tone: 'ok' },
    { prio: '12', id: 'POL-012', cond: 'shadow_eval == true (Sample 2% Traffic)', target: 'Mirror -> Eval Cluster', cb: 'Async Drop on Lag', hit: '2.978', st: 'Shadow', tone: 'neutral' },
  ];

  const contentHtml = `
    <section class="e-panel" style="height:348px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 13, '#0f52ba')}<span>Topologi Routing Inference, PII Guardrail &amp; Circuit Breaker</span><span class="e-panel-sub">Policy v4.8.2 (Active · Canary 0%)</span></div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${badge('100% Deterministik', 'accent')}
          ${badge('OpenAI Pool: Half-Open 89%', 'warn')}
          <span class="e-btn">Tampilkan Bobot RPS</span>
        </div>
      </div>
      <div class="e-panel-body" style="padding:8px 10px;">
        ${dagSvg}
      </div>
    </section>

    <div style="display:grid;grid-template-columns:1.52fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#0f52ba')}<span>Tabel Aturan Routing Prioritas &amp; Circuit Breaker (12 Aturan Aktif)</span></div>
          <span class="e-btn e-btn-primary">+ Tambah Aturan</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:5%;">Prio</th>
                <th style="width:10%;">ID Rule</th>
                <th style="width:31%;">Kondisi Evaluasi (CEL Expression)</th>
                <th style="width:21%;">Target Pool &amp; Bobot</th>
                <th style="width:16%;">Trigger Failover</th>
                <th class="num" style="width:8%;">Hit 24j</th>
                <th style="width:9%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rules
                .map(
                  (r) => `<tr class="${r.tone === 'warn' ? 'is-warn' : ''}">
                    <td class="mono" style="font-weight:700;color:#64748b;">#${r.prio}</td>
                    <td class="mono" style="font-weight:700;color:#0f52ba;">${r.id}</td>
                    <td class="mono" style="font-size:9.8px;">${esc(r.cond)}</td>
                    <td style="font-weight:600;">${esc(r.target)}</td>
                    <td style="font-size:9.8px;color:#475569;">${esc(r.cb)}</td>
                    <td class="num mono">${r.hit}</td>
                    <td>${badge(r.st, r.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('play', 13, '#047857')}<span>Simulator Evaluasi Policy Live (Dry-Run)</span></div>
          ${badge('Evaluasi 2,4 ms', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:8px;">
            <div><div style="font-size:9.2px;color:#64748b;font-weight:700;">TENANT SIMULASI</div><div class="mono" style="font-weight:700;">holding-legal-jakarta</div></div>
            <div><div style="font-size:9.2px;color:#64748b;font-weight:700;">KLASIFIKASI DATA</div><div class="mono" style="font-weight:700;color:#b45309;">CONFIDENTIAL_PII (NIK+NPWP)</div></div>
            <div><div style="font-size:9.2px;color:#64748b;font-weight:700;">PROTOKOL CLIENT</div><div class="mono">OpenAI Responses API v1</div></div>
            <div><div style="font-size:9.2px;color:#64748b;font-weight:700;">ESTIMASI TOKEN</div><div class="mono">12.400 prompt · 2.000 out</div></div>
          </div>

          <div style="font-size:10px;font-weight:700;color:#334155;">JEJAK EVALUASI DETERMINISTIK</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="padding:7px 8px;border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;">
              <div style="display:flex;justify-content:space-between;font-weight:700;color:#065f46;font-size:10.5px;">
                <span>MATCH: POL-001 (Sovereign PII &amp; Legal Lock)</span>
                <span class="mono">1,2 ms</span>
              </div>
              <div style="font-size:9.8px;color:#047857;margin-top:2px;">Deteksi 2 field PII Indonesia -> Egress ke SG/US ditolak otomatis sesuai UU PDP.</div>
            </div>
            <div style="padding:7px 8px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:3px;">
              <div style="display:flex;justify-content:space-between;font-weight:700;color:#0b3d91;font-size:10.5px;">
                <span>ROUTED: jkt-vllm-qwen72b-sovereign (DCI JK5)</span>
                <span class="mono">Est. 142 ms · Rp 0</span>
              </div>
              <div style="font-size:9.8px;color:#1e40af;margin-top:2px;">Adapter menerjemahkan skema OpenAI Responses -> vLLM lokal dengan token vault aktif.</div>
            </div>
          </div>

          <div style="font-size:10px;font-weight:700;color:#334155;">RIWAYAT AUTO-FAILOVER TERBARU (24 JAM)</div>
          <table class="e-table" style="border:1px solid #e2e8f0;">
            <thead><tr><th style="width:17%;">WIB</th><th style="width:36%;">Sumber -> Tujuan</th><th style="width:29%;">Pemicu</th><th class="num" style="width:18%;">Durasi</th></tr></thead>
            <tbody>
              <tr><td class="mono">09:23:58</td><td class="mono">OpenAI -> Anthropic</td><td>RPM >= 89% (429)</td><td class="num mono">1,4 dtk</td></tr>
              <tr><td class="mono">08:45:10</td><td class="mono">vLLM-R3 -> Scale R4</td><td>Queue > 25 req</td><td class="num mono">38 dtk</td></tr>
              <tr><td class="mono">02:14:22</td><td class="mono">OpenAI -> DeepSeek</td><td>p95 > 850 ms</td><td class="num mono">2,1 dtk</td></tr>
            </tbody>
          </table>

          <div style="margin-top:auto;padding-top:8px;border-top:1px solid #e2e8f0;">
            <div style="font-size:9.8px;font-weight:700;color:#475569;margin-bottom:5px;">STATUS CIRCUIT BREAKER POOL</div>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;">
              <div style="padding:6px;border:1px solid #e2e8f0;border-radius:3px;background:#ffffff;">
                <div style="font-size:9px;color:#64748b;">vLLM JKT</div>
                <div class="mono" style="font-weight:700;color:#047857;">CLOSED · 52%</div>
              </div>
              <div style="padding:6px;border:1px solid #e2e8f0;border-radius:3px;background:#ffffff;">
                <div style="font-size:9px;color:#64748b;">Anthropic</div>
                <div class="mono" style="font-weight:700;color:#047857;">CLOSED · 64%</div>
              </div>
              <div style="padding:6px;border:1px solid #fde68a;border-radius:3px;background:#fffbeb;">
                <div style="font-size:9px;color:#92400e;">OpenAI Ent</div>
                <div class="mono" style="font-weight:700;color:#b45309;">HALF-OPEN 89%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return shellLayout({
    activeNav: 'p3',
    breadcrumb: `<span>Operasional Gateway</span>${ic('chevronRight', 12)}<strong>Topologi Routing Visual, Failover &amp; Aturan Rate-Limit</strong>`,
    actionsHtml: `
      <span class="e-btn">${ic('clock', 11)} Riwayat Revisi (v4.8.2)</span>
      <span class="e-btn">Deploy Canary 10%</span>
      <span class="e-btn e-btn-primary">${ic('check', 11)} Terbitkan Kebijakan</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4: KEPATUHAN UU PDP PP 33/2026, EGRESS AUDIT & MATRIKS RBAC
// ============================================================================
function renderPage4() {
  const totalPagu = RBAC_QUOTAS.reduce((a, q) => a + q.paguMtd, 0);
  const totalUsed = RBAC_QUOTAS.reduce((a, q) => a + q.usedMtd, 0);
  const overallPct = (totalUsed / totalPagu) * 100;

  const wormLogs = [
    { seq: '#88421', time: '09:23:38', actor: 'SYSTEM-EDGE', action: 'Blokir 403 egress rekening & API key (Sandbox)', hash: '8a4f..e91c', ok: 'Signed' },
    { seq: '#88420', time: '09:14:02', actor: 'H. Pratama (NIP 199502)', action: 'Rotasi Anthropic Key #03 (Maker-Checker OK)', hash: '7c1b..4d02', ok: 'Verified' },
    { seq: '#88419', time: '08:50:19', actor: 'D. Wibowo (DPO Legal)', action: 'Aktifkan aturan PP 33/2026 masking No. BPJS', hash: '4f90..11b8', ok: 'Verified' },
    { seq: '#88418', time: '08:12:44', actor: 'R. Santoso (FinOps)', action: 'Set hard-cap R&D Sandbox Rp 140.000.000/bln', hash: '2e0a..99f4', ok: 'Verified' },
    { seq: '#88417', time: '07:30:00', actor: 'CRON-AUDIT-WORM', action: 'Seal Merkle Root harian 148.920 hash prompt', hash: '9b7d..31e0', ok: 'Sealed' },
    { seq: '#88416', time: '06:00:05', actor: 'D. Wibowo (DPO Legal)', action: 'Unduh paket kepatuhan BPKP & OJK Q4-2026', hash: '1d3c..77a9', ok: 'Verified' },
    { seq: '#88415', time: '03:15:11', actor: 'SYSTEM-VAULT', action: 'Purge otomatis ephemeral PII RAM vault (TTL 15m)', hash: '5a21..c08e', ok: 'Purged' },
    { seq: '#88414', time: '00:01:02', actor: 'CRON-CHARGEBACK', action: 'Tutup buku kuota harian 14 entitas (Rp 87,6 jt)', hash: '3f88..62b1', ok: 'Sealed' },
  ];

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,minmax(0,1fr));">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Skor Kepatuhan UU PDP &amp; PP 33/2026</span>${badge('Audit Siap', 'ok')}</div>
        <div class="e-kpi-mid"><div class="e-kpi-val" style="color:#047857;">99,4%</div><span class="mono" style="font-size:10px;color:#047857;">47 / 47 Kontrol</span></div>
        <div class="e-kpi-foot"><span>Verifikasi terakhir DPO: 22 Nov 2026 · 08:50 WIB</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kebocoran PII Lintas Negara (90 Hari)</span>${badge('Zero Egress', 'ok')}</div>
        <div class="e-kpi-mid"><div class="e-kpi-val" style="color:#047857;">0 Insiden</div><span class="mono" style="font-size:10px;color:#64748b;">100% Terproteksi</span></div>
        <div class="e-kpi-foot"><span>42 upaya egress kredensial diblokir di edge (HTTP 403)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Field PII Tersaring (24 Jam)</span>${badge('8 Kelas ID', 'warn')}</div>
        <div class="e-kpi-mid"><div class="e-kpi-val">${fmtNum(TOTAL_PII)}</div><span class="mono" style="font-size:10px;color:#b45309;">FP Rate 0,04%</span></div>
        <div class="e-kpi-foot"><span>Vault ephemeral in-memory (TTL 15m, zero disk write)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Integritas Audit Log WORM</span>${badge('SHA-256 Valid', 'accent')}</div>
        <div class="e-kpi-mid"><div class="e-kpi-val">100,0%</div><span class="mono" style="font-size:10px;color:#0f52ba;">Merkle #88421</span></div>
        <div class="e-kpi-foot"><span>Hanya hash prompt disimpan; tanpa PII mentah</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.06fr 1fr;gap:9px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:316px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#047857')}<span>Katalog Detektor PII Indonesia &amp; Kebijakan Masking</span></div>
            <span class="mono" style="font-size:10px;font-weight:700;color:#b45309;">${fmtNum(TOTAL_PII)} deteksi / 24j</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:11%;">Kode</th>
                  <th style="width:28%;">Kelas Data Pribadi (ID)</th>
                  <th style="width:20%;">Mesin Deteksi</th>
                  <th style="width:15%;">Aksi Edge</th>
                  <th class="num" style="width:9%;">24 Jam</th>
                  <th style="width:17%;">Dasar Hukum</th>
                </tr>
              </thead>
              <tbody>
                ${PII_DETECTORS.map(
                  (d) => `<tr>
                    <td class="mono" style="font-weight:700;color:#0f52ba;">${d.code}</td>
                    <td style="font-weight:600;">${esc(d.name)}</td>
                    <td style="font-size:9.8px;color:#475569;">${esc(d.engine)}</td>
                    <td>${badge(d.action, d.tone)}</td>
                    <td class="num mono" style="font-weight:700;">${fmtNum(d.count24h)}</td>
                    <td class="mono" style="font-size:9.3px;color:#64748b;">${esc(d.law)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">TOTAL FIELD PII TERSARING / DIBLOKIR (24 JAM WIB)</td>
                  <td class="num mono">${fmtNum(TOTAL_PII)}</td>
                  <td class="mono">8/8 Aktif</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#0f52ba')}<span>Rantai Audit WORM (Immutable Hash Chain · Maker-Checker)</span></div>
            ${badge('Append-Only S3 ObjectLock', 'neutral')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:11%;">Seq</th>
                  <th style="width:12%;">WIB</th>
                  <th style="width:22%;">Aktor / NIP</th>
                  <th style="width:32%;">Peristiwa Tata Kelola</th>
                  <th style="width:13%;">SHA-256</th>
                  <th style="width:10%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${wormLogs
                  .map(
                    (w) => `<tr>
                      <td class="mono" style="font-weight:700;">${w.seq}</td>
                      <td class="mono" style="color:#64748b;">${w.time}</td>
                      <td style="font-weight:600;">${esc(w.actor)}</td>
                      <td>${esc(w.action)}</td>
                      <td class="mono" style="color:#0f52ba;">${w.hash}</td>
                      <td>${badge(w.ok, 'ok')}</td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 13, '#0f52ba')}<span>Matriks RBAC, Pagu Bulanan &amp; Chargeback MTD (Nov 2026)</span></div>
          ${badge('12 Entitas Holding', 'accent')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:23%;">Entitas / Divisi</th>
                <th style="width:16%;">Role IAM</th>
                <th style="width:15.5%;">Pool Diizinkan</th>
                <th class="num" style="width:11%;">Pagu/Bln</th>
                <th class="num" style="width:12%;">MTD</th>
                <th style="width:11%;">% Pagu</th>
                <th style="width:11.5%;">Mode</th>
              </tr>
            </thead>
            <tbody>
              ${RBAC_QUOTAS.map((q) => {
                const pct = (q.usedMtd / q.paguMtd) * 100;
                return `<tr class="${q.tone === 'bad' ? 'is-bad' : q.tone === 'warn' ? 'is-warn' : ''}">
                  <td style="font-weight:600;">${esc(q.unit)}</td>
                  <td>${badge(q.role, q.role.includes('Only') || q.role.includes('PHI') ? 'ok' : 'neutral')}</td>
                  <td style="font-size:9.6px;color:#475569;">${esc(q.pools)}</td>
                  <td class="num mono">${(q.paguMtd / 1e6).toFixed(0)} jt</td>
                  <td class="num mono" style="font-weight:700;">${(q.usedMtd / 1e6).toFixed(1).replace('.', ',')} jt</td>
                  <td>${renderCapacityBar(pct, { warnAt: 78, critAt: 90 })}</td>
                  <td style="font-size:9.3px;font-weight:600;color:#334155;">${esc(q.mode)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">TOTAL PAGU &amp; REALISASI MTD (NOV 2026)</td>
                <td class="num mono">${(totalPagu / 1e9).toFixed(2).replace('.', ',')} M</td>
                <td class="num mono">${(totalUsed / 1e9).toFixed(2).replace('.', ',')} M</td>
                <td class="mono">${fmtPct(overallPct)}</td>
                <td class="mono">OK</td>
              </tr>
            </tfoot>
          </table>

          <div style="padding:10px 12px;background:#f8fafc;border-top:1px solid #cbd5e1;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;">Persetujuan Perubahan Kebijakan (DoA Maker-Checker)</div>
              ${badge('DPO Sign-Off Aktif', 'ok')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;font-size:9.8px;">
              <div style="padding:6px 8px;background:#ffffff;border:1px solid #d8dee6;border-radius:3px;">
                <div style="color:#64748b;">1. Maker (Infra Lead)</div>
                <div style="font-weight:700;color:#0f172a;">H. Pratama</div>
                <div class="mono" style="color:#047857;">Signed · 08:42 WIB</div>
              </div>
              <div style="padding:6px 8px;background:#ffffff;border:1px solid #d8dee6;border-radius:3px;">
                <div style="color:#64748b;">2. Checker (DPO Legal)</div>
                <div style="font-weight:700;color:#0f172a;">D. Wibowo, S.H.</div>
                <div class="mono" style="color:#047857;">Approved · 08:50 WIB</div>
              </div>
              <div style="padding:6px 8px;background:#ffffff;border:1px solid #d8dee6;border-radius:3px;">
                <div style="color:#64748b;">3. CISO Governance</div>
                <div style="font-weight:700;color:#0f172a;">A. Kusuma, CISSP</div>
                <div class="mono" style="color:#0f52ba;">Enforced · v4.8.2</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;">
              <span style="font-size:9.8px;color:#475569;">Siap audit eksternal OJK, BPKP, dan Lembaga Pengawas PDP.</span>
              <span class="e-btn e-btn-primary">${ic('download', 11)} Unduh Paket Dossier PP 33/2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return shellLayout({
    activeNav: 'p4',
    breadcrumb: `<span>Tata Kelola &amp; UU PDP</span>${ic('chevronRight', 12)}<strong>Konsol Kepatuhan PP 33/2026, Egress Audit &amp; RBAC</strong>`,
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 11)} Verifikasi Merkle Chain</span>
      <span class="e-btn e-btn-primary">${ic('shield', 11)} Jalankan Audit PII Penuh</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5: DEVELOPER SDK GATEWAY & LIVE PROMPT REDACTION DIFF
// ============================================================================
function renderPage5() {
  const extraCss = `
    .code-pane {
      background: #0b1220;
      color: #e2e8f0;
      font-family: var(--e-mono);
      font-size: 10.4px;
      line-height: 1.5;
      padding: 9px 11px;
      overflow: hidden;
      flex: 1;
    }
    .code-line { display: flex; gap: 10px; }
    .ln { color: #475569; width: 20px; text-align: right; user-select: none; flex-shrink: 0; }
    .hl-pii { background: rgba(239, 68, 68, 0.25); color: #fecaca; border: 1px solid #ef4444; border-radius: 2px; padding: 0 3px; font-weight: 700; }
    .hl-tok { background: rgba(16, 185, 129, 0.22); color: #a7f3d0; border: 1px solid #10b981; border-radius: 2px; padding: 0 3px; font-weight: 700; }
    .hl-k { color: #93c5fd; }
    .hl-s { color: #fde68a; }
    .hl-n { color: #c4b5fd; }
    .hl-c { color: #64748b; }
  `;

  const endpoints = [
    { method: 'POST', path: '/v1/responses', desc: 'OpenAI Responses -> Sovereign vLLM', active: true },
    { method: 'POST', path: '/v1/messages', desc: 'Anthropic Messages + Tool Use' },
    { method: 'POST', path: '/v1/chat/completions', desc: 'Legacy OpenAI Chat Streaming' },
    { method: 'POST', path: '/v1/pii/dry-run', desc: 'Uji Deteksi & Masking UU PDP' },
    { method: 'POST', path: '/v1/embeddings', desc: 'Indo-BGE-M3 Lokal Jakarta' },
    { method: 'GET', path: '/v1/usage/chargeback', desc: 'Laporan Biaya IDR per Entitas' },
  ];

  const contentHtml = `
    <div style="background:#ffffff;border:1px solid #d8dee6;border-radius:4px;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:7px;min-width:0;flex:1;">
        <span class="e-badge e-badge-accent mono" style="font-size:10.5px;padding:3px 8px;">POST</span>
        <div class="mono" style="height:26px;flex:1;max-width:460px;padding:0 10px;border:1px solid #cbd5e1;border-radius:3px;background:#f8fafc;display:flex;align-items:center;font-size:11px;font-weight:600;color:#0f172a;">
          https://ai-gw.grc.co.id/v1/responses
        </div>
        <span class="e-btn" style="background:#eff6ff;border-color:#bfdbfe;color:#0b3d91;">Adapter: OpenAI Responses -&gt; vLLM Qwen-72B</span>
        <span class="e-btn">Policy: STRICT_UU_PDP</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('HTTP 200 OK · 184 ms', 'ok')}
        <span class="e-btn e-btn-primary">${ic('play', 11)} Kirim Uji Request</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:270px 1fr 330px;gap:9px;flex:1;min-height:0;">
      <!-- Left: Endpoint Collection & .NET SDK -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:298px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#0f52ba')}<span>Koleksi Endpoint Gateway</span></div>
            <span class="mono" style="font-size:9.5px;color:#64748b;">6 API</span>
          </div>
          <div class="e-panel-body" style="padding:6px;display:flex;flex-direction:column;gap:4px;">
            ${endpoints
              .map(
                (ep) => `<div style="padding:5px 7px;border-radius:3px;border:1px solid ${ep.active ? '#93c5fd' : '#eef2f6'};background:${ep.active ? '#eff6ff' : '#ffffff'};">
                  <div style="display:flex;align-items:center;gap:5px;">
                    <span class="mono" style="font-size:9px;font-weight:700;color:${ep.method === 'GET' ? '#047857' : '#0f52ba'};">${ep.method}</span>
                    <span class="mono" style="font-size:10px;font-weight:700;color:#0f172a;">${ep.path}</span>
                  </div>
                  <div style="font-size:9.3px;color:#64748b;">${ep.desc}</div>
                </div>`
              )
              .join('')}
          </div>
        </section>

        <section class="e-panel" style="height:184px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('key', 13, '#0f52ba')}<span>Request Headers Aktif</span></div>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <tbody>
                <tr><td class="mono" style="width:42%;color:#475569;">Authorization</td><td class="mono" style="font-weight:600;">Bearer grc_***89f2</td></tr>
                <tr><td class="mono" style="color:#475569;">X-GRC-Tenant</td><td class="mono" style="font-weight:600;">holding-legal-jkt</td></tr>
                <tr><td class="mono" style="color:#475569;">X-UU-PDP-Mode</td><td class="mono" style="color:#047857;font-weight:700;">STRICT_TOKENIZE</td></tr>
                <tr><td class="mono" style="color:#475569;">X-Budget-Center</td><td class="mono">CC-1042-LEGAL</td></tr>
                <tr><td class="mono" style="color:#475569;">X-Idempotency</td><td class="mono">req_20261122_0924</td></tr>
                <tr><td class="mono" style="color:#475569;">Accept</td><td class="mono">text/event-stream</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('terminal', 13, '#0f52ba')}<span>Contoh SDK (.NET 9 C#)</span></div>
            ${badge('Drop-in OpenAI', 'neutral')}
          </div>
          <div class="code-pane" style="font-size:9.4px;line-height:1.48;">
            <div><span class="hl-k">var</span> gw = <span class="hl-k">new</span> Uri(<span class="hl-s">"https://ai-gw.grc.co.id/v1"</span>);</div>
            <div><span class="hl-k">var</span> client = <span class="hl-k">new</span> OpenAIClient(</div>
            <div>&nbsp;&nbsp;<span class="hl-k">new</span> ApiKeyCredential(env[<span class="hl-s">"GRC_KEY"</span>]),</div>
            <div>&nbsp;&nbsp;<span class="hl-k">new</span> OpenAIClientOptions { Endpoint = gw }</div>
            <div>);</div>
            <div class="hl-c">// Rute otomatis ke DCI JK5 jika ada PII</div>
            <div><span class="hl-k">var</span> res = <span class="hl-k">await</span> client</div>
            <div>&nbsp;&nbsp;.GetChatClient(<span class="hl-s">"garuda-legal-auto"</span>)</div>
            <div>&nbsp;&nbsp;.CompleteChatAsync(prompt);</div>
            <div class="hl-c">// Cost Rp 0 · PII re-hydrated di client</div>
            <div>Console.WriteLine(res.Value.Id);</div>
          </div>
        </section>
      </div>

      <!-- Center: Live Redaction Diff (Before / After / Translated Response) -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#be123c')}<span>1. Payload Internal Mentah (Pra-Filter · Terdeteksi 4 Field PII)</span></div>
            ${badge('Dilarang Keluar Negeri', 'bad')}
          </div>
          <div class="code-pane">
            <div class="code-line"><span class="ln">1</span><span>{</span></div>
            <div class="code-line"><span class="ln">2</span><span>&nbsp;&nbsp;<span class="hl-k">"model"</span>: <span class="hl-s">"garuda-legal-auto"</span>, <span class="hl-k">"temperature"</span>: <span class="hl-n">0.1</span>,</span></div>
            <div class="code-line"><span class="ln">3</span><span>&nbsp;&nbsp;<span class="hl-k">"metadata"</span>: { <span class="hl-k">"matter"</span>: <span class="hl-s">"KYC-2026-8841"</span>, <span class="hl-k">"unit"</span>: <span class="hl-s">"PT Bank Digital GRC"</span> },</span></div>
            <div class="code-line"><span class="ln">4</span><span>&nbsp;&nbsp;<span class="hl-k">"input"</span>: [</span></div>
            <div class="code-line"><span class="ln">5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;{ <span class="hl-k">"role"</span>: <span class="hl-s">"user"</span>, <span class="hl-k">"content"</span>: <span class="hl-s">"Verifikasi kelengkapan DPA &amp; risiko kredit debitur:</span></span></div>
            <div class="code-line"><span class="ln">6</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Nama: Budi Santoso | NIK: </span><span class="hl-pii">3174051908920004</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">7</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">NPWP-16: </span><span class="hl-pii">09.421.882.1-012.000</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">8</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Rekening Pencairan: BCA </span><span class="hl-pii">5210-8892-11</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">9</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Kontak WA: </span><span class="hl-pii">+62 812-8840-2190</span><span class="hl-s">. Cek kepatuhan Pasal 46 UU PDP."</span> }</span></div>
            <div class="code-line"><span class="ln">10</span><span>&nbsp;&nbsp;]</span></div>
            <div class="code-line"><span class="ln">11</span><span>}</span></div>
          </div>
        </section>

        <section class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#047857')}<span>2. Payload Tersanitasi -> Rute Sovereign DCI JK5 (Pasca-Redaksi 19 ms)</span></div>
            ${badge('4 Token Vault Aktif', 'ok')}
          </div>
          <div class="code-pane">
            <div class="code-line"><span class="ln">1</span><span>{</span></div>
            <div class="code-line"><span class="ln">2</span><span>&nbsp;&nbsp;<span class="hl-k">"routed_pool"</span>: <span class="hl-s">"jkt-vllm-qwen72b-sovereign"</span>, <span class="hl-k">"policy"</span>: <span class="hl-s">"POL-001"</span>,</span></div>
            <div class="code-line"><span class="ln">3</span><span>&nbsp;&nbsp;<span class="hl-k">"redaction_vault_ttl_sec"</span>: <span class="hl-n">900</span>, <span class="hl-k">"foreign_egress"</span>: <span class="hl-n">false</span>,</span></div>
            <div class="code-line"><span class="ln">4</span><span>&nbsp;&nbsp;<span class="hl-k">"messages"</span>: [</span></div>
            <div class="code-line"><span class="ln">5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;{ <span class="hl-k">"role"</span>: <span class="hl-s">"user"</span>, <span class="hl-k">"content"</span>: <span class="hl-s">"Verifikasi kelengkapan DPA &amp; risiko kredit debitur:</span></span></div>
            <div class="code-line"><span class="ln">6</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Nama: Budi Santoso | NIK: </span><span class="hl-tok">[PII_NIK_88a1]</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">7</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">NPWP-16: </span><span class="hl-tok">[PII_NPWP_44c2]</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">8</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Rekening Pencairan: BCA </span><span class="hl-tok">[PII_ACCT_19f0]</span><span class="hl-s"> |</span></span></div>
            <div class="code-line"><span class="ln">9</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Kontak WA: </span><span class="hl-tok">[PII_PHONE_72b9]</span><span class="hl-s">. Cek kepatuhan Pasal 46 UU PDP."</span> }</span></div>
            <div class="code-line"><span class="ln">10</span><span>&nbsp;&nbsp;]</span></div>
            <div class="code-line"><span class="ln">11</span><span>}</span></div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('checkCircle', 13, '#047857')}<span>3. Respons JSON Terstandarisasi (Re-Hydration Otomatis untuk Klien Internal)</span></div>
            <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">184 ms TTFT · 1.520 token</span>
          </div>
          <div class="code-pane">
            <div class="code-line"><span class="ln">1</span><span>{</span></div>
            <div class="code-line"><span class="ln">2</span><span>&nbsp;&nbsp;<span class="hl-k">"id"</span>: <span class="hl-s">"resp_9f82c1a4"</span>, <span class="hl-k">"object"</span>: <span class="hl-s">"response"</span>, <span class="hl-k">"status"</span>: <span class="hl-s">"completed"</span>,</span></div>
            <div class="code-line"><span class="ln">3</span><span>&nbsp;&nbsp;<span class="hl-k">"output_text"</span>: <span class="hl-s">"Audit DPA debitur [PII_NIK_88a1]: Klausul notifikasi kebocoran data</span></span></div>
            <div class="code-line"><span class="ln">4</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">wajib diperbarui dari 7 hari menjadi maks 3x24 jam (Pasal 46 ayat 1 UU 27/2022).</span></span></div>
            <div class="code-line"><span class="ln">5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="hl-s">Rekening [PII_ACCT_19f0] terklasifikasi sensitif &amp; diproses 100% di DCI JK5."</span>,</span></div>
            <div class="code-line"><span class="ln">6</span><span>&nbsp;&nbsp;<span class="hl-k">"usage"</span>: { <span class="hl-k">"input_tokens"</span>: <span class="hl-n">1284</span>, <span class="hl-k">"cached_tokens"</span>: <span class="hl-n">420</span>, <span class="hl-k">"output_tokens"</span>: <span class="hl-n">642</span> },</span></div>
            <div class="code-line"><span class="ln">7</span><span>&nbsp;&nbsp;<span class="hl-k">"garuda_audit"</span>: { <span class="hl-k">"cost_idr"</span>: <span class="hl-n">0</span>, <span class="hl-k">"sovereign_jkt"</span>: <span class="hl-n">true</span>, <span class="hl-k">"pii_masked"</span>: <span class="hl-n">4</span> }</span></div>
            <div class="code-line"><span class="ln">8</span><span>}</span></div>
          </div>
        </section>
      </div>

      <!-- Right: Token Cost Diagnostics & Response Headers -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:282px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f52ba')}<span>Diagnostik Token &amp; Biaya (IDR)</span></div>
            ${badge('Hemat 100%', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <tbody>
                <tr><td>Prompt Input Mentah</td><td class="num mono">1.284 tok</td></tr>
                <tr><td>Prefix Cache Hit (System DPA)</td><td class="num mono" style="color:#047857;">-420 tok</td></tr>
                <tr><td>Overhead Token Redaksi PII</td><td class="num mono" style="color:#b45309;">+14 tok</td></tr>
                <tr><td>Output Completion</td><td class="num mono">642 tok</td></tr>
                <tr style="background:#f1f5f9;"><td style="font-weight:700;">Total Token Efektif</td><td class="num mono" style="font-weight:700;">1.520 tok</td></tr>
                <tr><td>Estimasi API Eksternal (USD)</td><td class="num mono" style="color:#64748b;text-decoration:line-through;">Rp 294</td></tr>
                <tr style="background:#ecfdf5;"><td style="font-weight:700;color:#065f46;">Biaya Aktual (Sovereign JKT)</td><td class="num mono" style="font-weight:700;color:#047857;">Rp 0</td></tr>
              </tbody>
            </table>
            <div style="padding:8px 10px;font-size:9.8px;color:#475569;">
              Rata-rata penghematan rute lokal Legal &amp; Banking bulan ini: <strong class="mono" style="color:#047857;">Rp 1,42 Miliar</strong>.
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:224px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#b45309')}<span>Peta Vault Ephemeral (4 Entitas)</span></div>
            <span class="mono" style="font-size:9.5px;color:#64748b;">TTL 15m</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead><tr><th style="width:30%;">Kelas</th><th style="width:45%;">Token Pengganti</th><th style="width:25%;">Status</th></tr></thead>
              <tbody>
                <tr><td>NIK 16-Digit</td><td class="mono" style="color:#047857;">[PII_NIK_88a1]</td><td>${badge('RAM-Only', 'ok')}</td></tr>
                <tr><td>NPWP-16</td><td class="mono" style="color:#047857;">[PII_NPWP_44c2]</td><td>${badge('RAM-Only', 'ok')}</td></tr>
                <tr><td>Rekening BCA</td><td class="mono" style="color:#b45309;">[PII_ACCT_19f0]</td><td>${badge('Local-Lock', 'warn')}</td></tr>
                <tr><td>No. WA +62</td><td class="mono" style="color:#047857;">[PII_PHONE_72b9]</td><td>${badge('RAM-Only', 'ok')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')}<span>HTTP Response Headers &amp; OTel</span></div>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <tbody>
                <tr><td class="mono" style="width:48%;color:#475569;">x-garuda-trace-id</td><td class="mono" style="font-weight:700;">trc_9f82c1a4</td></tr>
                <tr><td class="mono" style="color:#475569;">x-garuda-pool</td><td class="mono" style="color:#047857;">jkt-vllm-qwen72b</td></tr>
                <tr><td class="mono" style="color:#475569;">x-garuda-pii-count</td><td class="mono">4 (0 egress)</td></tr>
                <tr><td class="mono" style="color:#475569;">x-garuda-ttft-ms</td><td class="mono">184</td></tr>
                <tr><td class="mono" style="color:#475569;">x-ratelimit-rem</td><td class="mono">4.812 / 5.000 rpm</td></tr>
                <tr><td class="mono" style="color:#475569;">x-worm-sha256</td><td class="mono">e3b0c442..8a92</td></tr>
                <tr><td class="mono" style="color:#475569;">traceparent</td><td class="mono">00-4bf92f..aa0b-01</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;

  return shellLayout({
    activeNav: 'p5',
    breadcrumb: `<span>Developer &amp; SDK</span>${ic('chevronRight', 12)}<strong>SDK Gateway &amp; Live Prompt Redaction Diff</strong>`,
    actionsHtml: `
      <span class="e-btn">${ic('copy', 11)} Salin OpenAPI 3.1</span>
      <span class="e-btn">${ic('download', 11)} Postman Collection</span>
    `,
    contentHtml,
    extraCss,
  });
}

export function renderPages() {
  verifyMath();
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
  ];
}
