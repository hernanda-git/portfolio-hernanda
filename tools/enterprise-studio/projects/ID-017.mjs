import {
  esc,
  fmtNum,
  fmtIdr,
  fmtPct,
  ic,
  badge,
  wrapEnterpriseHtml,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgStackedBarChart,
  svgSpanWaterfall,
} from '../charts.mjs';

export const meta = {
  id: 'ID-017',
  name: 'SNAPBox Studio',
  reference: 'Postman Enterprise + Insomnia IDE + Swagger Inspector',
  persona: 'R. Wijaya · Lead Payment Architect · PT Nusantara Pay Gateway',
  pages: [
    { slug: 'p1', title: 'Workbench Request & Inspektor Tanda Tangan Live' },
    { slug: 'p2', title: 'Pipeline Kriptografi RSA/HMAC & Diff Quirk Bank' },
    { slug: 'p3', title: 'Log Replay Transaksi, Telemetri & Simulator Error' },
    { slug: 'p4', title: 'Generator Kode Klien C# / Go / TS & OpenAPI 3.1' },
    { slug: 'p5', title: 'Suite Uji Otomatis & Bukti Sertifikasi ASPI SNAP BI' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY VERIFIED ACROSS P1-P5)
// ============================================================================
const BANKS = [
  {
    code: 'BCA',
    name: 'Bank Central Asia',
    spec: 'SNAP v2.0 Strict',
    req24h: 412,
    errCount: 14,
    avgMs: 64,
    p95Ms: 112,
    quirks: 6,
    totalTests: 16,
    passed: 16,
    failed: 0,
    driftSec: 300,
    padVa: '3 spasi kiri (8 char)',
    headerRule: 'Case-sensitive exact',
    tone: 'ok',
    status: 'Siap ASPI',
  },
  {
    code: 'MANDIRI',
    name: 'Bank Mandiri (Kopra)',
    spec: 'SNAP v2.0 + ISO-20022',
    req24h: 348,
    errCount: 19,
    avgMs: 78,
    p95Ms: 148,
    quirks: 5,
    totalTests: 16,
    passed: 16,
    failed: 0,
    driftSec: 180,
    padVa: '3 spasi kiri (8 char)',
    headerRule: 'X-EXTERNAL-ID 36 num',
    tone: 'ok',
    status: 'Siap ASPI',
  },
  {
    code: 'BNI',
    name: 'Bank Negara Indonesia',
    spec: 'SNAP v1.1/v2.0 Hybrid',
    req24h: 264,
    errCount: 22,
    avgMs: 92,
    p95Ms: 186,
    quirks: 4,
    totalTests: 16,
    passed: 15,
    failed: 1,
    driftSec: 300,
    padVa: 'Trimmed / 5 digit',
    headerRule: 'CHANNEL-ID wajib 95221',
    tone: 'warn',
    status: '1 Deviasi',
  },
  {
    code: 'BRI',
    name: 'Bank Rakyat Indonesia',
    spec: 'SNAP v2.0 Strict NTP',
    req24h: 224,
    errCount: 31,
    avgMs: 118,
    p95Ms: 264,
    quirks: 4,
    totalTests: 16,
    passed: 14,
    failed: 2,
    driftSec: 60,
    padVa: '3 spasi kiri (8 char)',
    headerRule: 'Clock skew max ±60 dtk',
    tone: 'bad',
    status: '2 Deviasi',
  },
];

const SERVICES = [
  { code: '73', name: 'Access Token B2B', path: '/v1.0/access-token/b2b', auth: 'RSA-SHA256', reqOk: 286, req401: 12, req409: 0, req504: 4 },
  { code: '24', name: 'VA Inquiry', path: '/v1.0/transfer-va/inquiry', auth: 'HMAC-SHA512', reqOk: 324, req401: 8, req409: 16, req504: 6 },
  { code: '25', name: 'VA Payment', path: '/v1.0/transfer-va/payment', auth: 'HMAC-SHA512', reqOk: 198, req401: 4, req409: 10, req504: 4 },
  { code: '17', name: 'Transfer Intrabank', path: '/v1.0/transfer-intrabank', auth: 'HMAC-SHA512', reqOk: 112, req401: 2, req409: 4, req504: 2 },
  { code: '18', name: 'BI-FAST Interbank', path: '/v1.0/transfer-interbank', auth: 'HMAC-SHA512', reqOk: 174, req401: 4, req409: 4, req504: 4 },
  { code: '54', name: 'Balance & Account', path: '/v1.0/balance-inquiry', auth: 'HMAC-SHA512', reqOk: 68, req401: 2, req409: 0, req504: 0 },
];

const ACTIVE_SPANS_P1 = [
  { label: 'TLS & HTTP Parse', start: 0, dur: 4, color: '#64748b' },
  { label: 'JSON Minify + SHA256', start: 4, dur: 2, color: '#0f52ba' },
  { label: 'HMAC-SHA512 Verify', start: 6, dur: 3, color: '#0284c7' },
  { label: 'BCA Quirk Responder', start: 9, dur: 54, color: '#047857' },
  { label: 'OpenAPI 3.1 Assert', start: 63, dur: 5, color: '#475569' },
];

const REPLAY_SPANS_P3 = [
  { label: 'Edge TLS & Header', start: 0, dur: 4, color: '#64748b' },
  { label: 'HMAC-SHA512 Verify', start: 4, dur: 5, color: '#0f52ba' },
  { label: 'Redis Idempotency', start: 9, dur: 11, color: '#b45309' },
  { label: 'BCA 4092400 Builder', start: 20, dur: 21, color: '#be123c' },
  { label: 'Replay Log Commit', start: 41, dur: 5, color: '#475569' },
];

const REPLAY_LOGS = [
  { id: 'REQ-9421', time: '14:22:08', bank: 'BCA', svc: '24', method: 'POST', path: '/v1.0/transfer-va/inquiry', extId: '202611221422080019421', aspi: '2002400', sig: 'VALID', ms: 68, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9420', time: '14:22:04', bank: 'MANDIRI', svc: '73', method: 'POST', path: '/v1.0/access-token/b2b', extId: 'N/A (Asymmetric)', aspi: '2007300', sig: 'VALID', ms: 42, idem: 'Token 900d', tone: 'ok' },
  { id: 'REQ-9419', time: '14:21:59', bank: 'BCA', svc: '18', method: 'POST', path: '/v1.0/transfer-interbank', extId: '202611221421590019419', aspi: '2001800', sig: 'VALID', ms: 115, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9418', time: '14:21:53', bank: 'BCA', svc: '24', method: 'POST', path: '/v1.0/transfer-va/inquiry', extId: '202611221421100019402', aspi: '4092400', sig: 'VALID', ms: 46, idem: 'Duplikat', tone: 'warn', selected: true },
  { id: 'REQ-9417', time: '14:21:47', bank: 'BRI', svc: '18', method: 'POST', path: '/v1.0/transfer-interbank', extId: '202611221421470019417', aspi: '5041800', sig: 'VALID', ms: 312, idem: 'Timeout Sim', tone: 'bad' },
  { id: 'REQ-9416', time: '14:21:41', bank: 'BNI', svc: '25', method: 'POST', path: '/v1.0/transfer-va/payment', extId: '202611221421410019416', aspi: '2002500', sig: 'VALID', ms: 89, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9415', time: '14:21:35', bank: 'BRI', svc: '73', method: 'POST', path: '/v1.0/access-token/b2b', extId: 'N/A (Asymmetric)', aspi: '4017300', sig: 'INVALID', ms: 19, idem: 'Skew +74d', tone: 'bad' },
  { id: 'REQ-9414', time: '14:21:29', bank: 'MANDIRI', svc: '25', method: 'POST', path: '/v1.0/transfer-va/payment', extId: '202611221421290019414', aspi: '2002500', sig: 'VALID', ms: 76, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9413', time: '14:21:22', bank: 'BCA', svc: '17', method: 'POST', path: '/v1.0/transfer-intrabank', extId: '202611221421220019413', aspi: '2001700', sig: 'VALID', ms: 71, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9412', time: '14:21:18', bank: 'BNI', svc: '24', method: 'POST', path: '/v1.0/transfer-va/inquiry', extId: '202611221421180019412', aspi: '4002401', sig: 'VALID', ms: 34, idem: 'Pad VA Err', tone: 'warn' },
  { id: 'REQ-9411', time: '14:21:11', bank: 'MANDIRI', svc: '18', method: 'POST', path: '/v1.0/transfer-interbank', extId: '202611221421110019411', aspi: '2001800', sig: 'VALID', ms: 124, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9410', time: '14:21:05', bank: 'BRI', svc: '24', method: 'POST', path: '/v1.0/transfer-va/inquiry', extId: '202611221421050019410', aspi: '2002400', sig: 'VALID', ms: 98, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9409', time: '14:20:58', bank: 'BCA', svc: '54', method: 'POST', path: '/v1.0/balance-inquiry', extId: '202611221420580019409', aspi: '2005400', sig: 'VALID', ms: 53, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9408', time: '14:20:51', bank: 'MANDIRI', svc: '24', method: 'POST', path: '/v1.0/transfer-va/inquiry', extId: '202611221420220019398', aspi: '4092400', sig: 'VALID', ms: 41, idem: 'Duplikat', tone: 'warn' },
  { id: 'REQ-9407', time: '14:20:44', bank: 'BNI', svc: '18', method: 'POST', path: '/v1.0/transfer-interbank', extId: '202611221420440019407', aspi: '2001800', sig: 'VALID', ms: 132, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9406', time: '14:20:39', bank: 'BCA', svc: '73', method: 'POST', path: '/v1.0/access-token/b2b', extId: 'N/A (Asymmetric)', aspi: '2007300', sig: 'VALID', ms: 38, idem: 'Token 900d', tone: 'ok' },
  { id: 'REQ-9405', time: '14:20:31', bank: 'MANDIRI', svc: '17', method: 'POST', path: '/v1.0/transfer-intrabank', extId: '202611221420310019405', aspi: '2001700', sig: 'VALID', ms: 69, idem: 'Baru', tone: 'ok' },
  { id: 'REQ-9404', time: '14:20:24', bank: 'BRI', svc: '25', method: 'POST', path: '/v1.0/transfer-va/payment', extId: '202611221420240019404', aspi: '2002500', sig: 'VALID', ms: 104, idem: 'Baru', tone: 'ok' },
];

const ASPI_CASES = [
  { id: 'TC-73-01', svc: '73', bank: 'BCA', scenario: 'Generate Access Token B2B RSA-SHA256 valid', exp: '2007300', act: '2007300', kind: 'Positif', ms: 39, pass: true },
  { id: 'TC-73-04', svc: '73', bank: 'MANDIRI', scenario: 'Tolak RSA signature salah (private key mismatch)', exp: '4017300', act: '4017300', kind: 'Negatif', ms: 18, pass: true },
  { id: 'TC-73-07', svc: '73', bank: 'BRI', scenario: 'Clock skew X-TIMESTAMP +74 detik melampaui batas BRI', exp: '4007301', act: '4017300', kind: 'Negatif', ms: 21, pass: false },
  { id: 'TC-24-01', svc: '24', bank: 'BCA', scenario: 'VA Inquiry normal dengan padding partnerServiceId 8 char', exp: '2002400', act: '2002400', kind: 'Positif', ms: 68, pass: true },
  { id: 'TC-24-03', svc: '24', bank: 'BCA', scenario: 'Idempotensi replay duplikat X-EXTERNAL-ID hari sama', exp: '4092400', act: '4092400', kind: 'Negatif', ms: 46, pass: true },
  { id: 'TC-24-05', svc: '24', bank: 'BNI', scenario: 'VA Inquiry format partnerServiceId tanpa spasi kiri', exp: '2002400', act: '4002401', kind: 'Positif', ms: 34, pass: false },
  { id: 'TC-24-08', svc: '24', bank: 'MANDIRI', scenario: 'Tolak HMAC-SHA512 saat body JSON tidak diminifikasi', exp: '4012400', act: '4012400', kind: 'Negatif', ms: 24, pass: true },
  { id: 'TC-25-01', svc: '25', bank: 'MANDIRI', scenario: 'VA Payment nominal tepat Rp 4.850.000,00 IDR', exp: '2002500', act: '2002500', kind: 'Positif', ms: 76, pass: true },
  { id: 'TC-25-04', svc: '25', bank: 'BCA', scenario: 'Tolak pembayaran ganda (bill already paid)', exp: '4042514', act: '4042514', kind: 'Negatif', ms: 52, pass: true },
  { id: 'TC-26-01', svc: '26', bank: 'BCA', scenario: 'VA Status Inquiry konfirmasi flag settlement terbayar', exp: '2002600', act: '2002600', kind: 'Positif', ms: 49, pass: true },
  { id: 'TC-17-01', svc: '17', bank: 'BCA', scenario: 'Transfer Intrabank antar rekening korporat IDR', exp: '2001700', act: '2001700', kind: 'Positif', ms: 71, pass: true },
  { id: 'TC-17-04', svc: '17', bank: 'MANDIRI', scenario: 'Tolak transfer intrabank saldo giro tidak mencukupi', exp: '4031714', act: '4031714', kind: 'Negatif', ms: 31, pass: true },
  { id: 'TC-18-01', svc: '18', bank: 'MANDIRI', scenario: 'BI-FAST Interbank via proxy email ISO-20022 pacs.008', exp: '2001800', act: '2001800', kind: 'Positif', ms: 115, pass: true },
  { id: 'TC-18-03', svc: '18', bank: 'BNI', scenario: 'BI-FAST Interbank validasi kode BIC tujuan 8 char', exp: '2001800', act: '2001800', kind: 'Positif', ms: 128, pass: true },
  { id: 'TC-18-04', svc: '18', bank: 'BCA', scenario: 'BI-FAST tolak rekening penerima berstatus dormant/tutup', exp: '4041811', act: '4041811', kind: 'Negatif', ms: 62, pass: true },
  { id: 'TC-18-06', svc: '18', bank: 'BRI', scenario: 'Simulasi timeout gateway & fallback status inquiry (504)', exp: '2001800', act: '5041800', kind: 'Negatif', ms: 312, pass: false },
  { id: 'TC-54-01', svc: '54', bank: 'BCA', scenario: 'Balance Inquiry rekening giro operasional IDR', exp: '2005400', act: '2005400', kind: 'Positif', ms: 53, pass: true },
  { id: 'TC-54-02', svc: '54', bank: 'MANDIRI', scenario: 'Tolak akses Bearer token kedaluwarsa (>900 detik)', exp: '4015401', act: '4015401', kind: 'Negatif', ms: 16, pass: true },
  { id: 'TC-54-05', svc: '54', bank: 'BNI', scenario: 'Validasi format mata uang ISO-4217 & ledger balance', exp: '2005400', act: '2005400', kind: 'Positif', ms: 61, pass: true },
  { id: 'TC-52-01', svc: '52', bank: 'BRI', scenario: 'Account Inquiry eksternal cross-bank BI-FAST proxy HP', exp: '2005200', act: '2005200', kind: 'Positif', ms: 84, pass: true },
];

const EVIDENCE_FILES = [
  { name: '01_aspi_certification_report_v2.0.pdf', desc: 'Ringkasan 64 skenario uji & matriks bank', kb: 486, hash: 'a94c1f0e...81b2' },
  { name: '02_signed_http_transcripts.har', desc: 'Rekaman header + payload mentah tersign', kb: 742, hash: '3d7e8a14...c409' },
  { name: '03_rsa_hmac_test_vectors.json', desc: 'Vektor kripto deterministik C#/Go/TS', kb: 218, hash: 'f12b60c8...9e31' },
  { name: '04_iso20022_pacs008_samples.xml', desc: 'Sampel payload BI-FAST & proxy mapping', kb: 384, hash: '7c55e9a2...2d10' },
  { name: '05_manifest_worm_sha256.txt', desc: 'Daftar checksum WORM anti-tamper', kb: 12, hash: 'e804b19d...4a77' },
];

const TOTAL_REQ_24H = BANKS.reduce((a, b) => a + b.req24h, 0);
const TOTAL_ERR_24H = BANKS.reduce((a, b) => a + b.errCount, 0);
const TOTAL_OK_24H = TOTAL_REQ_24H - TOTAL_ERR_24H;
const TOTAL_QUIRKS = BANKS.reduce((a, b) => a + b.quirks, 0);
const TOTAL_TESTS = BANKS.reduce((a, b) => a + b.totalTests, 0);
const TOTAL_PASSED = BANKS.reduce((a, b) => a + b.passed, 0);
const TOTAL_FAILED = BANKS.reduce((a, b) => a + b.failed, 0);
const TOTAL_EVIDENCE_KB = EVIDENCE_FILES.reduce((a, f) => a + f.kb, 0);

export function verifyMath() {
  const svcOk = SERVICES.reduce((a, s) => a + s.reqOk, 0);
  const svc401 = SERVICES.reduce((a, s) => a + s.req401, 0);
  const svc409 = SERVICES.reduce((a, s) => a + s.req409, 0);
  const svc504 = SERVICES.reduce((a, s) => a + s.req504, 0);
  const svcErr = svc401 + svc409 + svc504;
  const svcTotal = svcOk + svcErr;

  if (TOTAL_REQ_24H !== 1248) throw new Error(`Math mismatch TOTAL_REQ_24H=${TOTAL_REQ_24H}`);
  if (TOTAL_ERR_24H !== 86) throw new Error(`Math mismatch TOTAL_ERR_24H=${TOTAL_ERR_24H}`);
  if (TOTAL_OK_24H !== 1162) throw new Error(`Math mismatch TOTAL_OK_24H=${TOTAL_OK_24H}`);
  if (svcTotal !== TOTAL_REQ_24H) throw new Error(`Math mismatch svcTotal=${svcTotal} vs ${TOTAL_REQ_24H}`);
  if (svcOk !== TOTAL_OK_24H) throw new Error(`Math mismatch svcOk=${svcOk} vs ${TOTAL_OK_24H}`);
  if (svcErr !== TOTAL_ERR_24H) throw new Error(`Math mismatch svcErr=${svcErr} vs ${TOTAL_ERR_24H}`);
  if (TOTAL_QUIRKS !== 19) throw new Error(`Math mismatch TOTAL_QUIRKS=${TOTAL_QUIRKS}`);
  if (TOTAL_TESTS !== 64) throw new Error(`Math mismatch TOTAL_TESTS=${TOTAL_TESTS}`);
  if (TOTAL_PASSED !== 61 || TOTAL_FAILED !== 3) throw new Error(`Math mismatch tests ${TOTAL_PASSED}/${TOTAL_FAILED}`);
  if (TOTAL_PASSED + TOTAL_FAILED !== TOTAL_TESTS) throw new Error('Passed + Failed != Total');

  const spanP1 = ACTIVE_SPANS_P1.reduce((a, s) => a + s.dur, 0);
  if (spanP1 !== 68) throw new Error(`Math mismatch P1 span sum=${spanP1}`);
  const spanP3 = REPLAY_SPANS_P3.reduce((a, s) => a + s.dur, 0);
  if (spanP3 !== 46) throw new Error(`Math mismatch P3 span sum=${spanP3}`);

  const tableFails = ASPI_CASES.filter((c) => !c.pass).length;
  if (tableFails !== TOTAL_FAILED) throw new Error(`Table fails=${tableFails} vs TOTAL_FAILED=${TOTAL_FAILED}`);
  if (TOTAL_EVIDENCE_KB !== 1842) throw new Error(`Evidence KB mismatch=${TOTAL_EVIDENCE_KB}`);
}

// ============================================================================
// DISTINCT DEVELOPER IDE CHROME (POSTMAN ENTERPRISE / INSOMNIA / VS CODE STYLE)
// ============================================================================
const IDE_CSS = `
  /* Light-first Developer IDE Workbench — Cobalt #0f52ba anchor, flat crisp hairlines */
  .ide-topbar {
    height: 40px;
    background: #ffffff;
    border-bottom: 1px solid #d5dde8;
    padding: 0 12px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .ide-brand-slot {
    width: 46px;
    height: 40px;
    background: #0c192c;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-right: 1px solid #1e2d45;
  }
  .ide-logo-mark {
    width: 26px;
    height: 26px;
    border-radius: 4px;
    background: #0f52ba;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 11px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.03em;
  }
  .ide-top-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }
  .ide-ws-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
  }
  .ide-ws-sep { color: #cbd5e1; }
  .ide-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 40px;
    margin-left: 6px;
  }
  .ide-tab {
    height: 40px;
    padding: 0 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    color: #475569;
    border-right: 1px solid #e6ebf1;
    border-bottom: 2px solid transparent;
    background: #f8fafc;
    white-space: nowrap;
  }
  .ide-tab.is-active {
    background: #ffffff;
    color: #0f172a;
    font-weight: 700;
    border-bottom-color: #0f52ba;
  }
  .ide-m {
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 2px;
    letter-spacing: 0.02em;
  }
  .ide-m-post { background: #e8f0fe; color: #0f52ba; }
  .ide-m-err  { background: #fff1f2; color: #be123c; }
  .ide-m-get  { background: #ecfdf5; color: #047857; }
  .ide-m-spec { background: #f1f5f9; color: #334155; }

  .ide-top-right {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }
  .ide-env-select {
    height: 26px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #0f172a;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ide-env-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    display: inline-block;
  }
  .ide-user {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid #e2e8f0;
    white-space: nowrap;
  }
  .ide-avatar {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #0f52ba;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Workspace Shell + Slim 46px Activity Rail */
  .ide-body {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
    background: #f3f6fa;
  }
  .ide-rail {
    width: 46px;
    background: #0c192c;
    border-right: 1px solid #1e2d45;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    flex-shrink: 0;
  }
  .ide-rail-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
  }
  .ide-rail-btn {
    width: 34px;
    height: 34px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8fa3bf;
    position: relative;
  }
  .ide-rail-btn.is-active {
    background: #172b4d;
    color: #ffffff;
  }
  .ide-rail-btn.is-active::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 6px;
    bottom: 6px;
    width: 3px;
    background: #3b82f6;
    border-radius: 0 2px 2px 0;
  }
  .ide-rail-badge {
    position: absolute;
    top: 3px;
    right: 3px;
    min-width: 13px;
    height: 13px;
    padding: 0 3px;
    border-radius: 3px;
    background: #be123c;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 8.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ide-workspace {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Bottom VS Code-style Cobalt Status Bar */
  .ide-statusbar {
    height: 24px;
    background: #0f52ba;
    color: #e8f0fe;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.8px;
    flex-shrink: 0;
  }
  .ide-st-grp {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .ide-st-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .ide-st-pill {
    background: #0b3d91;
    color: #ffffff;
    padding: 1px 6px;
    border-radius: 2px;
    font-weight: 700;
  }

  /* Code & JSON Inspector Panes (High-contrast IDE dark editor surface) */
  .code-pane {
    background: #0d1526;
    color: #dbeafe;
    font-family: var(--e-mono);
    font-size: 10.2px;
    line-height: 1.44;
    padding: 8px 10px;
    border-radius: 3px;
    overflow: hidden;
  }
  .code-line {
    display: flex;
    gap: 9px;
    white-space: pre;
    overflow: hidden;
  }
  .code-ln {
    width: 20px;
    text-align: right;
    color: #475569;
    user-select: none;
    flex-shrink: 0;
  }
  .ck { color: #7dd3fc; }
  .cs { color: #86efac; }
  .cn { color: #fcd34d; }
  .cm { color: #64748b; }
  .ct { color: #c4b5fd; }
  .cp { color: #94a3b8; }
  .ce { color: #fda4af; }

  /* Diff lines */
  .diff-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-family: var(--e-mono);
    font-size: 10.1px;
    line-height: 1.48;
    padding: 1px 8px;
    white-space: pre;
    overflow: hidden;
  }
  .diff-del { background: #3b1320; color: #fecdd3; border-left: 2px solid #f43f5e; }
  .diff-add { background: #0c2d23; color: #bbf7d0; border-left: 2px solid #10b981; }
  .diff-ctx { background: #0d1526; color: #cbd5e1; border-left: 2px solid transparent; }
  .diff-wrn { background: #332209; color: #fde68a; border-left: 2px solid #f59e0b; }

  /* Request URL Bar */
  .req-bar {
    height: 36px;
    background: #ffffff;
    border-bottom: 1px solid #d5dde8;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }
  .req-url-box {
    flex: 1;
    height: 26px;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    overflow: hidden;
    min-width: 0;
  }
  .req-method-box {
    height: 100%;
    padding: 0 10px;
    background: #e8f0fe;
    color: #0f52ba;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
    border-right: 1px solid #cbd5e1;
    display: inline-flex;
    align-items: center;
  }
  .req-url-txt {
    padding: 0 9px;
    font-family: var(--e-mono);
    font-size: 11px;
    color: #0f172a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Sub-tabs inside panels */
  .sub-tabs {
    height: 29px;
    padding: 0 10px;
    background: #f8fafc;
    border-bottom: 1px solid #d5dde8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .sub-tab-list {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 100%;
  }
  .sub-tab {
    height: 100%;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.8px;
    font-weight: 600;
    color: #64748b;
    border-bottom: 2px solid transparent;
  }
  .sub-tab.is-active {
    color: #0f52ba;
    border-bottom-color: #0f52ba;
  }

  /* Collection Sidebar */
  .col-tree {
    width: 264px;
    background: #ffffff;
    border-right: 1px solid #d5dde8;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
    overflow: hidden;
  }
  .col-head {
    height: 36px;
    padding: 0 10px;
    border-bottom: 1px solid #d5dde8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    flex-shrink: 0;
  }
  .col-grp-title {
    font-size: 9.2px;
    font-weight: 700;
    color: #64748b;
    padding: 7px 10px 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .col-item {
    padding: 4.5px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    font-size: 10.4px;
    color: #334155;
    border-left: 2.5px solid transparent;
  }
  .col-item.is-active {
    background: #e8f0fe;
    color: #0b3d91;
    font-weight: 700;
    border-left-color: #0f52ba;
  }
  .col-path {
    font-family: var(--e-mono);
    font-size: 9.8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Crypto Step Cards */
  .pipe-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .pipe-step {
    background: #f8fafc;
    border: 1px solid #d5dde8;
    border-radius: 3px;
    padding: 7px 9px;
    min-width: 0;
  }
  .pipe-step.is-ok { border-top: 2px solid #047857; }
  .pipe-step.is-accent { border-top: 2px solid #0f52ba; }
  .pipe-step-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .pipe-code {
    font-family: var(--e-mono);
    font-size: 9.6px;
    color: #1e293b;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 2px;
    padding: 4px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Key-Value mini grid */
  .kv-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 3.5px 0;
    border-bottom: 1px solid #eef2f6;
    font-size: 10.4px;
  }
  .kv-row:last-child { border-bottom: 0; }
  .kv-k { color: #64748b; font-weight: 500; }
  .kv-v { color: #0f172a; font-weight: 600; font-family: var(--e-mono); font-size: 10px; }

  /* Progress bar */
  .prog-track {
    height: 6px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
    flex: 1;
  }
  .prog-fill { height: 100%; }
`;

function renderIdeShell({ activeRail, pageTitle, topTabs = [], envTag = 'ASPI SNAP v2.0 · HMAC-SHA512', contentHtml }) {
  const railItems = [
    { id: 'p1', icon: 'play', title: 'Workbench Request' },
    { id: 'p2', icon: 'key', title: 'Crypto & Quirk Diff' },
    { id: 'p3', icon: 'activity', title: 'Log Replay & Telemetri' },
    { id: 'p4', icon: 'code', title: 'SDK Codegen & OpenAPI' },
    { id: 'p5', icon: 'shield', title: 'Sertifikasi ASPI', badge: TOTAL_FAILED },
  ];

  const tabsHtml = topTabs
    .map(
      (t) => `<div class="ide-tab ${t.active ? 'is-active' : ''}">
        <span class="ide-m ide-m-${t.mCls}">${esc(t.method)}</span>
        <span class="mono" style="font-size:10.3px;">${esc(t.label)}</span>
      </div>`
    )
    .join('');

  const railHtml = railItems
    .map(
      (r) => `<div class="ide-rail-btn ${r.id === activeRail ? 'is-active' : ''}" title="${esc(r.title)}">
        ${ic(r.icon, 16, r.id === activeRail ? '#ffffff' : '#8fa3bf')}
        ${r.badge ? `<span class="ide-rail-badge">${r.badge}</span>` : ''}
      </div>`
    )
    .join('');

  return `<header class="ide-topbar">
    <div class="ide-top-left">
      <div class="ide-brand-slot"><span class="ide-logo-mark">SB</span></div>
      <div class="ide-ws-title">
        <span>SNAPBox Studio</span>
        <span class="ide-ws-sep">/</span>
        <span style="color:#475569;font-weight:600;font-size:11px;">PT Nusantara Pay Gateway</span>
      </div>
      <div class="ide-tabs">${tabsHtml}</div>
    </div>
    <div class="ide-top-right">
      <div class="ide-env-select">
        <span class="ide-env-dot"></span>
        <span class="mono" style="font-size:10px;">${esc(envTag)}</span>
        ${ic('chevronDown', 11, '#64748b')}
      </div>
      <div class="ide-env-select" style="background:#e8f0fe;border-color:#bfdbfe;color:#0b3d91;">
        ${ic('server', 11, '#0f52ba')}
        <span class="mono" style="font-size:10px;">.NET 9 Mock :5094</span>
      </div>
      <div class="ide-user">
        <span class="ide-avatar">RW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;">R. Wijaya</div>
          <div style="font-size:9px;color:#64748b;">Lead Payment Architect</div>
        </div>
      </div>
    </div>
  </header>
  <div class="ide-body">
    <nav class="ide-rail">
      <div class="ide-rail-stack">${railHtml}</div>
      <div class="ide-rail-stack">
        <div class="ide-rail-btn" title="Keypair Vault">${ic('lock', 15, '#8fa3bf')}</div>
        <div class="ide-rail-btn" title="Pengaturan Engine">${ic('sliders', 15, '#8fa3bf')}</div>
      </div>
    </nav>
    <main class="ide-workspace">${contentHtml}</main>
  </div>
  <footer class="ide-statusbar">
    <div class="ide-st-grp">
      <span class="ide-st-item"><span class="ide-st-pill">aspi-snap-v2.0.4</span></span>
      <span class="ide-st-item">${ic('checkCircle', 11, '#86efac')} Mock Engine .NET 9 Ready (4 Bank Rekanan)</span>
      <span class="ide-st-item">${ic('key', 11, '#bfdbfe')} RSA-2048 + HMAC-SHA512 Active</span>
      <span class="ide-st-item">${esc(pageTitle)}</span>
    </div>
    <div class="ide-st-grp">
      <span class="ide-st-item">Sertifikasi ASPI: ${TOTAL_PASSED}/${TOTAL_TESTS} (${fmtPct((TOTAL_PASSED / TOTAL_TESTS) * 100)})</span>
      <span class="ide-st-item">24j: ${fmtNum(TOTAL_REQ_24H)} req</span>
      <span class="ide-st-item">WIB UTC+07:00 · 22 Nov 2026</span>
    </div>
  </footer>`;
}

function codeLines(lines) {
  return lines
    .map(
      (ln, idx) => `<div class="code-line"><span class="code-ln">${idx + 1}</span><span>${ln}</span></div>`
    )
    .join('');
}

// ============================================================================
// PAGE 1: WORKBENCH REQUEST & INSPEKTOR TANDA TANGAN LIVE
// ============================================================================
function renderPage1() {
  const collectionHtml = `<aside class="col-tree">
    <div style="min-height:0;overflow:hidden;">
      <div class="col-head">
        <span style="display:inline-flex;align-items:center;gap:6px;">${ic('layers', 13, '#0f52ba')} Koleksi ASPI SNAP v2</span>
        ${badge('18 API', 'accent')}
      </div>
      <div style="padding:6px 8px;border-bottom:1px solid #eef2f6;">
        <div style="height:24px;border:1px solid #cbd5e1;border-radius:3px;background:#f8fafc;padding:0 7px;display:flex;align-items:center;justify-content:space-between;color:#64748b;font-size:10px;">
          <span style="display:inline-flex;align-items:center;gap:5px;">${ic('search', 11, '#64748b')} Cari service code / path...</span>
          <span class="mono" style="font-size:9px;color:#94a3b8;">Ctrl+P</span>
        </div>
      </div>

      <div class="col-grp-title"><span>73 · AUTH & TOKEN B2B</span><span class="mono">RSA</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/access-token/b2b</span><span class="mono" style="font-size:9.3px;color:#047857;">2007300</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/access-token/b2b2c</span><span class="mono" style="font-size:9.3px;color:#64748b;">73</span></div>

      <div class="col-grp-title"><span>24-28 · VIRTUAL ACCOUNT</span><span class="mono">HMAC</span></div>
      <div class="col-item is-active"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-va/inquiry</span><span class="mono" style="font-size:9.3px;color:#0f52ba;">2002400</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-va/payment</span><span class="mono" style="font-size:9.3px;color:#047857;">2002500</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-va/status</span><span class="mono" style="font-size:9.3px;color:#047857;">2002600</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-va/create-va</span><span class="mono" style="font-size:9.3px;color:#64748b;">27</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-va/update-va</span><span class="mono" style="font-size:9.3px;color:#64748b;">28</span></div>

      <div class="col-grp-title"><span>17-18 · TRANSFER & BI-FAST</span><span class="mono">ISO</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-intrabank</span><span class="mono" style="font-size:9.3px;color:#047857;">2001700</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/transfer-interbank</span><span class="mono" style="font-size:9.3px;color:#047857;">2001800</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/account-inquiry-ext</span><span class="mono" style="font-size:9.3px;color:#047857;">2005200</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/balance-inquiry</span><span class="mono" style="font-size:9.3px;color:#047857;">2005400</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-post">POST</span> /v1.0/bank-statement</span><span class="mono" style="font-size:9.3px;color:#64748b;">14</span></div>

      <div class="col-grp-title"><span>UJI NEGATIF & REPLAY</span><span class="mono">SIM</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-err">ERR</span> Replay Duplikat X-EXT-ID</span><span class="mono" style="font-size:9.3px;color:#b45309;">4092400</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-err">ERR</span> Token Invalid / Kedaluwarsa</span><span class="mono" style="font-size:9.3px;color:#be123c;">4017300</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-err">ERR</span> Gateway Timeout BI-FAST</span><span class="mono" style="font-size:9.3px;color:#be123c;">5041800</span></div>
      <div class="col-item"><span class="col-path"><span class="ide-m ide-m-err">ERR</span> VA Padding Mismatch</span><span class="mono" style="font-size:9.3px;color:#b45309;">4002401</span></div>
    </div>

    <div style="border-top:1px solid #d5dde8;">
      <div style="padding:8px 10px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
        <div style="font-size:9.6px;font-weight:700;color:#64748b;margin-bottom:5px;">RIWAYAT EKSEKUSI CEPAT</div>
        <div class="kv-row"><span class="mono" style="font-size:9.6px;color:#0f52ba;">2002400</span><span class="mono" style="font-size:9.4px;color:#334155;">VA Inquiry · 68ms</span></div>
        <div class="kv-row"><span class="mono" style="font-size:9.6px;color:#047857;">2007300</span><span class="mono" style="font-size:9.4px;color:#334155;">Token B2B · 42ms</span></div>
        <div class="kv-row"><span class="mono" style="font-size:9.6px;color:#b45309;">4092400</span><span class="mono" style="font-size:9.4px;color:#334155;">Replay Duplikat</span></div>
      </div>
      <div style="padding:8px 10px;background:#f8fafc;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:10px;font-weight:700;color:#0f172a;">Profil Bank Simulator</span>
          ${badge('BCA v2.0', 'accent')}
        </div>
        <div class="kv-row"><span class="kv-k">Partner ID</span><span class="kv-v">NPG-ID-88901</span></div>
        <div class="kv-row"><span class="kv-k">Token B2B TTL</span><span class="kv-v" style="color:#047857;">842 dtk tersisa</span></div>
        <div class="kv-row"><span class="kv-k">Strict Quirk</span><span class="kv-v">6 aturan aktif</span></div>
      </div>
    </div>
  </aside>`;

  const reqJsonLines = [
    '<span class="cp">{</span>',
    '  <span class="ck">"partnerServiceId"</span><span class="cp">:</span> <span class="cs">"   88901"</span><span class="cp">,</span> <span class="cm">// 3 spasi kiri (quirk BCA/Mandiri)</span>',
    '  <span class="ck">"customerNo"</span><span class="cp">:</span> <span class="cs">"000184920144"</span><span class="cp">,</span>',
    '  <span class="ck">"virtualAccountNo"</span><span class="cp">:</span> <span class="cs">"   88901000184920144"</span><span class="cp">,</span>',
    '  <span class="ck">"trxDateInit"</span><span class="cp">:</span> <span class="cs">"2026-11-22T14:22:08+07:00"</span><span class="cp">,</span>',
    '  <span class="ck">"channelCode"</span><span class="cp">:</span> <span class="cn">6011</span><span class="cp">,</span>',
    '  <span class="ck">"language"</span><span class="cp">:</span> <span class="cs">"ID"</span><span class="cp">,</span>',
    '  <span class="ck">"amount"</span><span class="cp">: {</span>',
    '    <span class="ck">"value"</span><span class="cp">:</span> <span class="cs">"4850000.00"</span><span class="cp">,</span>',
    '    <span class="ck">"currency"</span><span class="cp">:</span> <span class="cs">"IDR"</span>',
    '  <span class="cp">},</span>',
    '  <span class="ck">"hashedSourceAccountNo"</span><span class="cp">:</span> <span class="cs">"8f1c9a0d72b1e39a4410"</span><span class="cp">,</span>',
    '  <span class="ck">"sourceBankCode"</span><span class="cp">:</span> <span class="cs">"014"</span><span class="cp">,</span>',
    '  <span class="ck">"inquiryRequestId"</span><span class="cp">:</span> <span class="cs">"INQ-20261122-9421-VA"</span><span class="cp">,</span>',
    '  <span class="ck">"passApp"</span><span class="cp">:</span> <span class="cs">"SNAPBOX-CORE-V2"</span><span class="cp">,</span>',
    '  <span class="ck">"additionalInfo"</span><span class="cp">: {</span>',
    '    <span class="ck">"deviceId"</span><span class="cp">:</span> <span class="cs">"SNAPBOX-JKT01"</span><span class="cp">,</span>',
    '    <span class="ck">"channel"</span><span class="cp">:</span> <span class="cs">"H2H-CORPORATE"</span>',
    '  <span class="cp">}</span>',
    '<span class="cp">}</span>',
  ];

  const resJsonLines = [
    '<span class="cp">{</span>',
    '  <span class="ck">"responseCode"</span><span class="cp">:</span> <span class="cs">"2002400"</span><span class="cp">,</span>',
    '  <span class="ck">"responseMessage"</span><span class="cp">:</span> <span class="cs">"Successful"</span><span class="cp">,</span>',
    '  <span class="ck">"virtualAccountData"</span><span class="cp">: {</span>',
    '    <span class="ck">"inquiryStatus"</span><span class="cp">:</span> <span class="cs">"00"</span><span class="cp">,</span>',
    '    <span class="ck">"inquiryReason"</span><span class="cp">: {</span> <span class="ck">"indonesia"</span><span class="cp">:</span> <span class="cs">"Sukses"</span><span class="cp">,</span> <span class="ck">"english"</span><span class="cp">:</span> <span class="cs">"Success"</span> <span class="cp">},</span>',
    '    <span class="ck">"partnerServiceId"</span><span class="cp">:</span> <span class="cs">"   88901"</span><span class="cp">,</span>',
    '    <span class="ck">"customerNo"</span><span class="cp">:</span> <span class="cs">"000184920144"</span><span class="cp">,</span>',
    '    <span class="ck">"virtualAccountNo"</span><span class="cp">:</span> <span class="cs">"   88901000184920144"</span><span class="cp">,</span>',
    '    <span class="ck">"virtualAccountName"</span><span class="cp">:</span> <span class="cs">"PT KARYA LOGISTIK MANDIRI"</span><span class="cp">,</span>',
    '    <span class="ck">"inquiryRequestId"</span><span class="cp">:</span> <span class="cs">"INQ-20261122-9421-VA"</span><span class="cp">,</span>',
    '    <span class="ck">"totalAmount"</span><span class="cp">: {</span> <span class="ck">"value"</span><span class="cp">:</span> <span class="cs">"4850000.00"</span><span class="cp">,</span> <span class="ck">"currency"</span><span class="cp">:</span> <span class="cs">"IDR"</span> <span class="cp">},</span>',
    '    <span class="ck">"virtualAccountTrxType"</span><span class="cp">:</span> <span class="cs">"C"</span><span class="cp">,</span> <span class="cm">// Closed Amount VA</span>',
    '    <span class="ck">"feeAmount"</span><span class="cp">: {</span> <span class="ck">"value"</span><span class="cp">:</span> <span class="cs">"0.00"</span><span class="cp">,</span> <span class="ck">"currency"</span><span class="cp">:</span> <span class="cs">"IDR"</span> <span class="cp">},</span>',
    '    <span class="ck">"billDetails"</span><span class="cp">: [{</span>',
    '      <span class="ck">"billCode"</span><span class="cp">:</span> <span class="cs">"INV-01"</span><span class="cp">,</span> <span class="ck">"billNo"</span><span class="cp">:</span> <span class="cs">"INV/2026/XI/8841"</span><span class="cp">,</span>',
    '      <span class="ck">"billDescription"</span><span class="cp">: {</span> <span class="ck">"indonesia"</span><span class="cp">:</span> <span class="cs">"Tagihan Kontainer JKT-SBY"</span> <span class="cp">},</span>',
    '      <span class="ck">"billAmount"</span><span class="cp">: {</span> <span class="ck">"value"</span><span class="cp">:</span> <span class="cs">"4850000.00"</span><span class="cp">,</span> <span class="ck">"currency"</span><span class="cp">:</span> <span class="cs">"IDR"</span> <span class="cp">},</span>',
    '      <span class="ck">"status"</span><span class="cp">:</span> <span class="cs">"00"</span> <span class="cm">// Belum dibayar (Open)</span>',
    '    <span class="cp">}],</span>',
    '    <span class="ck">"additionalInfo"</span><span class="cp">: {</span> <span class="ck">"bankProfile"</span><span class="cp">:</span> <span class="cs">"BCA-SNAP-V2"</span> <span class="cp">}</span>',
    '  <span class="cp">}</span>',
    '<span class="cp">}</span>',
  ];

  const reqHeaders = [
    { k: 'X-TIMESTAMP', v: '2026-11-22T14:22:08+07:00', note: 'ISO-8601 WIB' },
    { k: 'X-SIGNATURE', v: 'b8F2kQ9+vR4mP1xZ...wQ8==', note: 'HMAC-SHA512 OK' },
    { k: 'X-PARTNER-ID', v: 'NPG-ID-88901', note: 'Partner terdaftar' },
    { k: 'X-EXTERNAL-ID', v: '202611221422080019421', note: 'Unik harian' },
    { k: 'CHANNEL-ID', v: '95221', note: 'Host-to-Host' },
    { k: 'Authorization', v: 'Bearer eyJhbGciOiJSUzI1NiJ9...', note: 'Service 73' },
  ];

  const mainHtml = `<div style="display:flex;flex:1;min-height:0;overflow:hidden;">
    ${collectionHtml}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;">
      <!-- Request Execution Bar -->
      <div class="req-bar">
        <div class="req-url-box">
          <span class="req-method-box">POST</span>
          <span class="req-url-txt">https://mock-snap.local:5094/v1.0/transfer-va/inquiry</span>
        </div>
        ${badge('Service 24 · VA Inquiry', 'neutral')}
        ${badge('Profil: BCA Strict', 'info')}
        <span class="e-btn">${ic('copy', 12, '#334155')} Salin Kode C#</span>
        <span class="e-btn e-btn-primary">${ic('play', 12, '#ffffff')} Sign & Kirim Mock</span>
      </div>

      <!-- Compact Verification Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px 10px 0;flex-shrink:0;">
        <div class="e-kpi" style="padding:6px 9px;">
          <div class="e-kpi-top"><span>Signature Status</span>${badge('Valid', 'ok')}</div>
          <div class="e-kpi-val" style="font-size:14.5px;color:#047857;">HMAC-SHA512</div>
          <div class="e-kpi-foot"><span>Digest cocok 100%</span><span class="mono">3 ms</span></div>
        </div>
        <div class="e-kpi" style="padding:6px 9px;">
          <div class="e-kpi-top"><span>Service Code</span>${badge('ASPI v2.0', 'accent')}</div>
          <div class="e-kpi-val" style="font-size:14.5px;">24 (VA Inquiry)</div>
          <div class="e-kpi-foot"><span>OpenAPI 3.1 Strict</span><span class="mono">14 field</span></div>
        </div>
        <div class="e-kpi" style="padding:6px 9px;">
          <div class="e-kpi-top"><span>Response Code</span>${badge('HTTP 200', 'ok')}</div>
          <div class="e-kpi-val" style="font-size:14.5px;color:#047857;">2002400</div>
          <div class="e-kpi-foot"><span>Successful</span><span class="mono">68 ms</span></div>
        </div>
        <div class="e-kpi" style="padding:6px 9px;">
          <div class="e-kpi-top"><span>Idempotensi</span>${badge('Unik', 'ok')}</div>
          <div class="e-kpi-val" style="font-size:14.5px;">X-EXT-ID Baru</div>
          <div class="e-kpi-foot"><span>TTL Redis 24 jam</span><span class="mono">0 konflik</span></div>
        </div>
        <div class="e-kpi" style="padding:6px 9px;">
          <div class="e-kpi-top"><span>Nominal Tagihan</span>${badge('IDR', 'neutral')}</div>
          <div class="e-kpi-val" style="font-size:14.5px;">${fmtIdr(4850000)}</div>
          <div class="e-kpi-foot"><span>PT Karya Logistik</span><span class="mono">Status 00</span></div>
        </div>
      </div>

      <!-- Center Split: Request Editor (Left) + Response & Timing Inspector (Right) -->
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 10px;overflow:hidden;">
        <!-- LEFT: Request Panel -->
        <section class="e-panel">
          <div class="sub-tabs">
            <div class="sub-tab-list">
              <span class="sub-tab is-active">Body JSON & Headers</span>
              <span class="sub-tab">Auth (HMAC-SHA512)</span>
              <span class="sub-tab">Quirk Rules (6)</span>
            </div>
            <span class="mono" style="font-size:9.8px;color:#64748b;">Minified: 398 byte · UTF-8</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <div style="border:1px solid #e2e8f0;border-radius:3px;overflow:hidden;flex-shrink:0;">
              <table class="e-table" style="font-size:10.1px;">
                <thead>
                  <tr>
                    <th style="width:124px;">Header SNAP BI</th>
                    <th>Nilai Aktif (Canonical)</th>
                    <th style="width:116px;">Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  ${reqHeaders
                    .map(
                      (h) => `<tr>
                        <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(h.k)}</td>
                        <td class="mono" style="color:#0f172a;">${esc(h.v)}</td>
                        <td><span class="e-badge e-badge-ok">${esc(h.note)}</span></td>
                      </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
            <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:10px;font-weight:700;color:#334155;">Request Payload JSON (Formatted · Auto-Minified saat Signing)</span>
                <span class="mono" style="font-size:9.5px;color:#047857;">JSON Valid · 0 warning</span>
              </div>
              <div class="code-pane" style="flex:1;">${codeLines(reqJsonLines)}</div>
            </div>
          </div>
        </section>

        <!-- RIGHT: Live Response & Latency Waterfall -->
        <section class="e-panel">
          <div class="sub-tabs">
            <div class="sub-tab-list">
              <span class="sub-tab is-active">Response Body (2002400)</span>
              <span class="sub-tab">Response Headers (5)</span>
              <span class="sub-tab">Schema Assert (14/14)</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('200 OK', 'ok')}
              <span class="mono" style="font-size:9.8px;color:#334155;">68 ms · 1,42 KB</span>
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <div class="code-pane" style="flex:1;">${codeLines(resJsonLines)}</div>
            <div style="border:1px solid #e2e8f0;border-radius:3px;padding:7px 9px;background:#fafcfe;flex-shrink:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:10.3px;font-weight:700;color:#0f172a;">Breakdown Latensi Eksekusi Mock (.NET 9 Engine)</span>
                <span class="mono" style="font-size:10px;font-weight:700;color:#0f52ba;">Total: 68 ms</span>
              </div>
              ${svgSpanWaterfall({ spans: ACTIVE_SPANS_P1, totalMs: 68, width: 580 })}
            </div>
          </div>
        </section>
      </div>

      <!-- Bottom Crypto Signature Pipeline Drawer -->
      <div style="padding:0 10px 10px;flex-shrink:0;">
        <section class="e-panel">
          <div class="e-panel-head" style="height:28px;">
            <div class="e-panel-title">
              ${ic('key', 12, '#0f52ba')}
              <span>Inspektor Langkah-demi-Langkah Pembentukan Signature Simetris (HMAC-SHA512 · Service 24)</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="mono" style="font-size:9.8px;color:#475569;">ClientSecret: ****9e4a (Vault Lokal)</span>
              ${badge('X-SIGNATURE: VALID', 'ok')}
            </div>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;gap:6px;">
            <div class="pipe-grid">
              <div class="pipe-step is-ok">
                <div class="pipe-step-hd"><span>1. Minify Request Body</span><span class="mono" style="color:#047857;">398 B</span></div>
                <div class="pipe-code">{"partnerServiceId":"   88901","customerNo":"000184...</div>
              </div>
              <div class="pipe-step is-ok">
                <div class="pipe-step-hd"><span>2. LowerHex(SHA-256)</span><span class="mono" style="color:#047857;">64 hex</span></div>
                <div class="pipe-code">e4a91f7c3b208d6e105f94c7a82b4d90...71c2</div>
              </div>
              <div class="pipe-step is-accent">
                <div class="pipe-step-hd"><span>3. Canonical StringToSign</span><span class="mono" style="color:#0f52ba;">5 segmen</span></div>
                <div class="pipe-code">POST:/v1.0/transfer-va/inquiry:eyJhbG...:e4a91f...:2026-11-22T14:22:08+07:00</div>
              </div>
              <div class="pipe-step is-ok">
                <div class="pipe-step-hd"><span>4. Base64(HMAC-SHA512)</span><span class="mono" style="color:#047857;">88 char</span></div>
                <div class="pipe-code">b8F2kQ9+vR4mP1xZ7nL0dC3tY6hJ2sW5...wQ8==</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>`;

  return wrapEnterpriseHtml({
    title: 'SNAPBox Studio — Workbench Request & Inspektor Tanda Tangan Live',
    extraCss: IDE_CSS,
    bodyHtml: renderIdeShell({
      activeRail: 'p1',
      pageTitle: 'Workbench Service 24 · VA Inquiry',
      topTabs: [
        { method: 'POST', mCls: 'post', label: '/v1.0/transfer-va/inquiry', active: true },
        { method: 'POST', mCls: 'post', label: '/v1.0/access-token/b2b', active: false },
        { method: 'POST', mCls: 'post', label: '/v1.0/transfer-interbank', active: false },
        { method: 'ERR', mCls: 'err', label: 'Replay 4092400', active: false },
      ],
      contentHtml: mainHtml,
    }),
  });
}

// ============================================================================
// PAGE 2: PIPELINE KRIPTOGRAFI RSA/HMAC & DIFF QUIRK BANK
// ============================================================================
function renderPage2() {
  const cryptoSteps = [
    {
      step: 'Tahap 01',
      mode: 'Asymmetric (73)',
      op: 'StringToSign Token B2B',
      formula: 'clientKey + "|" + X-TIMESTAMP',
      sample: 'NPG-88901-LIVE|2026-11-22T14:22:04+07:00',
      check: 'Cocok (RSA-2048)',
    },
    {
      step: 'Tahap 02',
      mode: 'Asymmetric (73)',
      op: 'SHA256withRSA Signature',
      formula: 'Base64(RSASSA-PKCS1-v1_5(PrivateKey, STS))',
      sample: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...K9xP==',
      check: 'Token TTL 900 dtk',
    },
    {
      step: 'Tahap 03',
      mode: 'Symmetric (24/18)',
      op: 'Minifikasi & Digest Body',
      formula: 'Lowercase(Hex(SHA-256(MinifyJSON(body))))',
      sample: 'e4a91f7c3b208d6e105f94c7a82b4d90f8139e...71c2',
      check: 'Zero whitespace',
    },
    {
      step: 'Tahap 04',
      mode: 'Symmetric (24/18)',
      op: 'Komposisi Canonical STS',
      formula: 'Method + ":" + RelURL + ":" + Token + ":" + Hash + ":" + TS',
      sample: 'POST:/v1.0/transfer-va/inquiry:eyJhbG...:e4a91f...:...+07:00',
      check: '5 segmen valid',
    },
    {
      step: 'Tahap 05',
      mode: 'Symmetric (24/18)',
      op: 'HMAC-SHA512 Signing',
      formula: 'Base64(HMAC_SHA512(ClientSecret, StringToSign))',
      sample: 'b8F2kQ9+vR4mP1xZ7nL0dC3tY6hJ2sW5aE9vR...wQ8==',
      check: 'Header Match 100%',
    },
  ];

  const diffBaseline = [
    { cls: 'diff-ctx', ln: '01', txt: '# Standar Spesifikasi Resmi ASPI SNAP BI v2.0 (Baseline)' },
    { cls: 'diff-ctx', ln: '02', txt: 'POST /v1.0/transfer-va/inquiry HTTP/1.1' },
    { cls: 'diff-del', ln: '03', txt: '- X-External-Id: 9948102938471          // Casing fleksibel HTTP/1.1' },
    { cls: 'diff-del', ln: '04', txt: '- X-TIMESTAMP: 2026-11-22T14:22:08+07:00 // Toleransi drift ±300 detik' },
    { cls: 'diff-ctx', ln: '05', txt: '  CHANNEL-ID: 95221' },
    { cls: 'diff-ctx', ln: '06', txt: '{' },
    { cls: 'diff-del', ln: '07', txt: '-   "partnerServiceId": "88901",        // Tanpa padding spasi kiri' },
    { cls: 'diff-del', ln: '08', txt: '-   "virtualAccountNo": "88901000184920144",' },
    { cls: 'diff-del', ln: '09', txt: '-   "amount": { "value": "4850000", "currency": "IDR" },' },
    { cls: 'diff-ctx', ln: '10', txt: '    "inquiryRequestId": "INQ-20261122-9421-VA",' },
    { cls: 'diff-del', ln: '11', txt: '-   "additionalInfo": {}                // Objek kosong diizinkan' },
    { cls: 'diff-del', ln: '12', txt: '-   "beneficiaryProxy": "pay@npg.co.id" // ISO-20022 tanpa proxyType' },
    { cls: 'diff-ctx', ln: '13', txt: '}' },
  ];

  const diffBankQuirk = [
    { cls: 'diff-ctx', ln: '01', txt: '# Profil Produksi Bank Rekanan (BCA Strict + BRI NTP + Mandiri VA)' },
    { cls: 'diff-ctx', ln: '02', txt: 'POST /v1.0/transfer-va/inquiry HTTP/1.1' },
    { cls: 'diff-add', ln: '03', txt: '+ X-EXTERNAL-ID: 202611221422080019421  // [BCA] Wajib UPPERCASE & numerik' },
    { cls: 'diff-wrn', ln: '04', txt: '~ X-TIMESTAMP: 2026-11-22T14:22:08+07:00 // [BRI] Tolak 4017300 jika > ±60 dtk' },
    { cls: 'diff-ctx', ln: '05', txt: '  CHANNEL-ID: 95221                      // [BNI] Wajib 5 digit kode kanal' },
    { cls: 'diff-ctx', ln: '06', txt: '{' },
    { cls: 'diff-add', ln: '07', txt: '+   "partnerServiceId": "   88901",     // [BCA/Mandiri] Wajib 8 char left-pad' },
    { cls: 'diff-add', ln: '08', txt: '+   "virtualAccountNo": "   88901000184920144",' },
    { cls: 'diff-add', ln: '09', txt: '+   "amount": { "value": "4850000.00", "currency": "IDR" }, // Wajib .00' },
    { cls: 'diff-ctx', ln: '10', txt: '    "inquiryRequestId": "INQ-20261122-9421-VA",' },
    { cls: 'diff-add', ln: '11', txt: '+   "additionalInfo": { "deviceId": "SNAPBOX-JKT01" } // [BCA] Non-empty' },
    { cls: 'diff-add', ln: '12', txt: '+   "proxyType": "02", "proxyValue": "pay@npg.co.id"  // [BI-FAST pacs.008]' },
    { cls: 'diff-ctx', ln: '13', txt: '}' },
  ];

  const faultToggles = [
    { code: '4017300', label: 'Unauthorized Signature / Token', scope: 'Service 73 · Semua Bank', state: 'Aktif (Uji)', tone: 'bad' },
    { code: '4092400', label: 'Conflict Duplikat X-EXTERNAL-ID', scope: 'Service 24/25 · Redis Lock', state: 'Aktif (Uji)', tone: 'warn' },
    { code: '5041800', label: 'Gateway Timeout BI-FAST (300ms+)', scope: 'Service 18 · Profil BRI', state: 'Simulasi', tone: 'bad' },
    { code: '4002401', label: 'Invalid Field Format (VA Padding)', scope: 'Service 24 · Profil BNI', state: 'Terdeteksi', tone: 'warn' },
    { code: '4012400', label: 'HMAC Digest Mismatch (Unminified)', scope: 'Service 24 · Profil Mandiri', state: 'Aktif (Uji)', tone: 'bad' },
    { code: '4042514', label: 'Paid Bill / Tagihan Sudah Lunas', scope: 'Service 25 · Profil BCA', state: 'Siap Uji', tone: 'neutral' },
  ];

  const contentHtml = `<div style="flex:1;min-height:0;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">
    <!-- Top KPI Strip -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Profil Simulator Bank</span>${badge('4 Bank Aktif', 'accent')}</div>
        <div class="e-kpi-val">BCA · Mandiri · BNI · BRI</div>
        <div class="e-kpi-foot"><span>Total request 24 jam</span><span class="mono">${fmtNum(TOTAL_REQ_24H)} req</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Aturan Quirk Terpetakan</span>${badge('ASPI v1/v2', 'info')}</div>
        <div class="e-kpi-val">${TOTAL_QUIRKS} Aturan Spesifik</div>
        <div class="e-kpi-foot"><span>Header, Padding, NTP, ISO-20022</span><span class="mono">6+5+4+4</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Verifikasi Signature 24j</span>${badge('Deterministic', 'ok')}</div>
        <div class="e-kpi-val">${fmtPct((TOTAL_OK_24H / TOTAL_REQ_24H) * 100)} Sukses</div>
        <div class="e-kpi-foot"><span>${fmtNum(TOTAL_OK_24H)} valid · ${TOTAL_ERR_24H} negatif/fault</span><span class="mono">0 false-pos</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Akselerasi Integrasi Tim</span>${badge('Benchmark', 'ok')}</div>
        <div class="e-kpi-val">4,2 mnt / kasus</div>
        <div class="e-kpi-foot"><span>vs 3,5 hari debug manual bank</span><span class="mono">-94% waktu</span></div>
      </div>
    </div>

    <!-- Middle Row: 5-Stage Crypto Trace (Left 61%) + Bank Quirk Fault Injector (Right 39%) -->
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;flex:1;min-height:0;overflow:hidden;">
      <!-- Left: Crypto Step-by-step Table + Bank Quirk Matrix -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#0f52ba')} Pipeline Verifikasi Kriptografi RSA-SHA256 & HMAC-SHA512</div>
          <div style="display:flex;gap:6px;">${badge('Asymmetric 73', 'accent')} ${badge('Symmetric 24/17/18', 'ok')}</div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.3px;">
            <thead>
              <tr>
                <th style="width:70px;">Tahap</th>
                <th style="width:116px;">Mode Auth</th>
                <th style="width:154px;">Operasi Kriptografi</th>
                <th>Formula & Sampel Output Deterministik</th>
                <th style="width:124px;">Hasil Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              ${cryptoSteps
                .map(
                  (s, idx) => `<tr class="${idx === 4 ? 'is-selected' : ''}">
                    <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(s.step)}</td>
                    <td>${badge(s.mode, idx < 2 ? 'info' : 'accent')}</td>
                    <td style="font-weight:600;">${esc(s.op)}</td>
                    <td>
                      <div class="mono" style="font-size:9.5px;color:#475569;">${esc(s.formula)}</div>
                      <div class="mono" style="font-size:9.7px;color:#0f172a;font-weight:600;">${esc(s.sample)}</div>
                    </td>
                    <td>${badge(s.check, 'ok')}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:7px 10px 5px;border-top:1px solid #d5dde8;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:10.5px;font-weight:700;color:#0f172a;">Matriks Perilaku Khas Bank Rekanan (Bank Quirk Matrix)</span>
            <span class="mono" style="font-size:9.8px;color:#64748b;">Total: ${TOTAL_QUIRKS} quirk terverifikasi</span>
          </div>
          <table class="e-table" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:76px;">Bank</th>
                <th style="width:168px;">Versi Spesifikasi</th>
                <th style="width:142px;">Padding VA</th>
                <th>Aturan Header / NTP</th>
                <th class="num" style="width:62px;">Quirk</th>
                <th class="num" style="width:74px;">Avg (ms)</th>
              </tr>
            </thead>
            <tbody>
              ${BANKS.map(
                (b) => `<tr>
                  <td style="font-weight:700;color:#0f52ba;">${esc(b.code)}</td>
                  <td class="mono" style="font-size:9.7px;">${esc(b.spec)}</td>
                  <td class="mono" style="font-size:9.7px;">${esc(b.padVa)}</td>
                  <td>${esc(b.headerRule)}</td>
                  <td class="num mono" style="font-weight:700;">${b.quirks}</td>
                  <td class="num mono">${b.avgMs} ms</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Right: Mock Bank Responder & Fault Injector -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#0f52ba')} Simulator Fault & Mock Bank Responder</div>
          ${badge('Engine .NET 9', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;flex-direction:column;gap:5px;flex:1;">
            ${faultToggles
              .map(
                (f) => `<div style="border:1px solid #d5dde8;border-radius:3px;padding:6px 8px;background:#fafcfe;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span class="mono" style="font-weight:700;color:#0f172a;">${esc(f.code)}</span>
                      <span style="font-weight:600;color:#1e293b;font-size:10.4px;" class="trunc">${esc(f.label)}</span>
                    </div>
                    <div style="font-size:9.5px;color:#64748b;margin-top:1px;">${esc(f.scope)}</div>
                  </div>
                  ${badge(f.state, f.tone)}
                </div>`
              )
              .join('')}
          </div>
          <div style="border:1px solid #e2e8f0;border-radius:3px;padding:6px 8px;background:#f8fafc;">
            <div class="kv-row"><span class="kv-k">Simulasi Clock Skew NTP</span><span class="kv-v">+0 dtk (BRI ketat ±60 dtk)</span></div>
            <div class="kv-row"><span class="kv-k">Latensi Jitter Responder</span><span class="kv-v">18–65 ms (p95 &lt; 150 ms)</span></div>
            <div class="kv-row"><span class="kv-k">ISO-20022 Bridge</span><span class="kv-v" style="color:#0f52ba;">pacs.008 &lt;-&gt; SNAP Service 18</span></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:9.8px;color:#475569;">Idempotensi: <strong class="mono" style="color:#047857;">Redis TTL 24j</strong></span>
            <span class="e-btn e-btn-primary">${ic('zap', 11, '#ffffff')} Terapkan Profil Fault</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom Full-Width Side-by-Side Contract Diff Viewer -->
    <section class="e-panel" style="height:278px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 13, '#0f52ba')} Diff Kontrak Protokol: Standar ASPI SNAP v2.0 vs Quirk Produksi Bank Rekanan</div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${badge('-6 Deviasi Baseline', 'bad')}
          ${badge('+6 Penyesuaian Bank', 'ok')}
          ${badge('1 Peringatan NTP', 'warn')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="display:grid;grid-template-columns:1fr 1fr;background:#0d1526;">
        <div style="border-right:1px solid #1e293b;padding:7px 0;overflow:hidden;">
          ${diffBaseline
            .map(
              (d) => `<div class="diff-row ${d.cls}"><span style="width:18px;color:#64748b;flex-shrink:0;">${d.ln}</span><span>${esc(d.txt)}</span></div>`
            )
            .join('')}
        </div>
        <div style="padding:7px 0;overflow:hidden;">
          ${diffBankQuirk
            .map(
              (d) => `<div class="diff-row ${d.cls}"><span style="width:18px;color:#64748b;flex-shrink:0;">${d.ln}</span><span>${esc(d.txt)}</span></div>`
            )
            .join('')}
        </div>
      </div>
    </section>
  </div>`;

  return wrapEnterpriseHtml({
    title: 'SNAPBox Studio — Pipeline Kriptografi & Diff Quirk Bank',
    extraCss: IDE_CSS,
    bodyHtml: renderIdeShell({
      activeRail: 'p2',
      pageTitle: 'Crypto Pipeline & Bank Quirk Diff',
      topTabs: [
        { method: 'SPEC', mCls: 'spec', label: 'ASPI v2.0 vs Bank Quirk Diff', active: true },
        { method: 'POST', mCls: 'post', label: 'RSA-SHA256 Token 73', active: false },
        { method: 'POST', mCls: 'post', label: 'HMAC-SHA512 Service 24', active: false },
      ],
      envTag: 'Diff Mode · 4 Bank Rekanan',
      contentHtml: contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 3: LOG REPLAY TRANSAKSI, TELEMETRI & SIMULATOR ERROR
// ============================================================================
function renderPage3() {
  const hours = ['00:00', '03:00', '06:00', '09:00', '11:00', '12:00', '13:00', '14:00'];
  const latencyChart = svgMultiLineChart({
    width: 720,
    height: 180,
    xLabels: hours,
    yMin: 0,
    yMax: 360,
    yTicks: 4,
    yUnit: 'ms',
    threshold: { value: 250, label: 'SLA Target 250 ms', color: '#be123c' },
    series: [
      { label: 'p50 Latensi', color: '#0f52ba', values: [58, 54, 62, 74, 71, 82, 76, 68], area: true, dots: true },
      { label: 'p95 Latensi', color: '#0284c7', values: [118, 110, 126, 152, 148, 174, 162, 144], dots: true },
      { label: 'p99 (Termasuk Fault)', color: '#b45309', values: [190, 178, 204, 240, 228, 312, 268, 224], dashed: true },
    ],
    annotations: [{ index: 5, seriesIdx: 2, label: 'BRI 5041800 Timeout (312 ms)', color: '#be123c', dy: -24 }],
  });

  const stackedChart = svgStackedBarChart({
    width: 470,
    height: 180,
    categories: SERVICES.map((s) => `Svc ${s.code}`),
    yFormat: (v) => String(Math.round(v)),
    series: [
      { label: '2xx Sukses', color: '#047857', values: SERVICES.map((s) => s.reqOk) },
      { label: '409 Duplikat', color: '#f59e0b', values: SERVICES.map((s) => s.req409) },
      { label: '401 Auth', color: '#be123c', values: SERVICES.map((s) => s.req401) },
      { label: '504 Fault', color: '#64748b', values: SERVICES.map((s) => s.req504) },
    ],
  });

  const contentHtml = `<div style="flex:1;min-height:0;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">
    <!-- Top Charts Row -->
    <div style="display:grid;grid-template-columns:1.52fr 1fr;gap:9px;height:224px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0f52ba')} Distribusi Persentil Latensi Mock & Sandbox (p50 / p95 / p99 · 24 Jam)</div>
          <div style="display:flex;gap:6px;">${badge('p50: 68 ms', 'accent')} ${badge('p95: 144 ms', 'info')}</div>
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">${latencyChart}</div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Volume & Kode Error per Layanan ASPI (${fmtNum(TOTAL_REQ_24H)} req)</div>
          ${badge(`${TOTAL_ERR_24H} Negatif/Error`, 'warn')}
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">${stackedChart}</div>
      </section>
    </div>

    <!-- Bottom Dense 18-Row Replay Table + Right Packet & Waterfall Inspector -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.78fr 1fr;gap:9px;overflow:hidden;">
      <!-- Left: 18-Row Replay Grid -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('terminal', 13, '#0f52ba')} Log Replay Transaksi SNAP BI (18 Eksekusi Terkini · Klik untuk Inspeksi & Putar Ulang)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="e-btn">${ic('filter', 11, '#334155')} Semua Bank (4)</span>
            <span class="e-btn e-btn-primary">${ic('refresh', 11, '#ffffff')} Putar Ulang Pilihan</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:72px;">ID Log</th>
                <th style="width:74px;">WIB</th>
                <th style="width:66px;">Bank</th>
                <th style="width:36px;">Svc</th>
                <th>Endpoint SNAP BI</th>
                <th style="width:148px;">X-EXTERNAL-ID</th>
                <th style="width:68px;">ASPI</th>
                <th style="width:70px;">Sig</th>
                <th class="num" style="width:46px;">ms</th>
                <th style="width:82px;">Idempotensi</th>
              </tr>
            </thead>
            <tbody>
              ${REPLAY_LOGS.map((r) => {
                const trCls = r.selected ? 'is-selected' : r.tone === 'bad' ? 'is-bad' : r.tone === 'warn' ? 'is-warn' : '';
                const sigTone = r.sig === 'VALID' ? 'ok' : 'bad';
                return `<tr class="${trCls}">
                  <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(r.id)}</td>
                  <td class="mono" style="color:#475569;">${esc(r.time)}</td>
                  <td style="font-weight:700;">${esc(r.bank)}</td>
                  <td class="mono" style="font-weight:700;">${esc(r.svc)}</td>
                  <td class="mono" style="font-size:9.7px;">${esc(r.path)}</td>
                  <td class="mono" style="font-size:9.5px;color:#475569;">${esc(r.extId)}</td>
                  <td>${badge(r.aspi, r.tone)}</td>
                  <td>${badge(r.sig, sigTone)}</td>
                  <td class="num mono">${r.ms}</td>
                  <td style="font-size:9.7px;color:#334155;">${esc(r.idem)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Ringkasan 24 Jam · ${fmtNum(TOTAL_REQ_24H)} Request (${fmtNum(TOTAL_OK_24H)} Sukses · ${TOTAL_ERR_24H} Negatif/Error)</td>
                <td colspan="2" class="mono">409 Conflict: 34</td>
                <td colspan="2" class="num mono">Avg: 84 ms</td>
                <td class="mono">Idem: OK</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- Right: Selected Request Replay & Span Inspector -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#0f52ba')} Inspektor Replay · REQ-9418</div>
          ${badge('4092400 · Conflict', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:3px;padding:7px 9px;">
            <div style="font-size:10.4px;font-weight:700;color:#92400e;margin-bottom:2px;">Penjaga Idempotensi Terverifikasi (Sesuai Spec ASPI)</div>
            <div style="font-size:9.9px;color:#78350f;">
              Header <span class="mono">X-EXTERNAL-ID: 202611221421100019402</span> sudah terekam 43 detik sebelumnya pada <span class="mono">REQ-9402</span>. Mock BCA menolak <span class="mono">4092400</span> tanpa mutasi ganda.
            </div>
          </div>

          <div style="border:1px solid #e2e8f0;border-radius:3px;padding:6px 9px;background:#fafcfe;">
            <div class="kv-row"><span class="kv-k">Bank / Service</span><span class="kv-v">BCA · Service 24 (VA Inquiry)</span></div>
            <div class="kv-row"><span class="kv-k">Verifikasi HMAC</span><span class="kv-v" style="color:#047857;">VALID (Lolos sebelum cek Redis)</span></div>
            <div class="kv-row"><span class="kv-k">Request Asli #1</span><span class="kv-v">REQ-9402 · 14:21:10 · 2002400</span></div>
            <div class="kv-row"><span class="kv-k">Replay Retry #2</span><span class="kv-v" style="color:#b45309;">REQ-9418 · 14:21:53 · 4092400</span></div>
          </div>

          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10.2px;font-weight:700;color:#0f172a;">Span Waterfall Eksekusi (46 ms)</span>
              <span class="mono" style="font-size:9.6px;color:#0f52ba;">Redis Cache Hit</span>
            </div>
            ${svgSpanWaterfall({ spans: REPLAY_SPANS_P3, totalMs: 46, width: 450 })}
          </div>

          <div class="code-pane" style="flex:1;">
            ${codeLines([
              '<span class="cm">// Response JSON 4092400 (BCA Idempotency Guard)</span>',
              '<span class="cp">{</span>',
              '  <span class="ck">"responseCode"</span><span class="cp">:</span> <span class="ce">"4092400"</span><span class="cp">,</span>',
              '  <span class="ck">"responseMessage"</span><span class="cp">:</span> <span class="cs">"Conflict - Duplicate X-EXTERNAL-ID"</span><span class="cp">,</span>',
              '  <span class="ck">"xExternalId"</span><span class="cp">:</span> <span class="cs">"202611221421100019402"</span><span class="cp">,</span>',
              '  <span class="ck">"partnerServiceId"</span><span class="cp">:</span> <span class="cs">"   88901"</span><span class="cp">,</span>',
              '  <span class="ck">"originalRequestId"</span><span class="cp">:</span> <span class="cs">"INQ-20261122-9402-VA"</span><span class="cp">,</span>',
              '  <span class="ck">"idempotencyTtlSec"</span><span class="cp">:</span> <span class="cn">86357</span><span class="cp">,</span>',
              '  <span class="ck">"traceId"</span><span class="cp">:</span> <span class="cs">"snap-bca-9418-idem"</span>',
              '<span class="cp">}</span>',
            ])}
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-shrink:0;">
            <span class="e-btn" style="flex:1;justify-content:center;">${ic('copy', 11, '#334155')} Salin cURL Replay</span>
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('refresh', 11, '#ffffff')} Replay + X-EXT-ID Baru</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return wrapEnterpriseHtml({
    title: 'SNAPBox Studio — Log Replay Transaksi & Telemetri',
    extraCss: IDE_CSS,
    bodyHtml: renderIdeShell({
      activeRail: 'p3',
      pageTitle: 'Log Replay & Telemetri Latensi',
      topTabs: [
        { method: 'ERR', mCls: 'err', label: 'Replay Log (18 Terkini)', active: true },
        { method: 'POST', mCls: 'post', label: 'REQ-9418 · 4092400', active: false },
        { method: 'SPEC', mCls: 'spec', label: 'Latency SLO 250ms', active: false },
      ],
      envTag: 'Replay Engine · Redis Idempotency',
      contentHtml: contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 4: GENERATOR KODE KLIEN C# / GO / TS & OPENAPI 3.1 REGISTRY
// ============================================================================
function renderPage4() {
  const schemas = [
    { file: 'snap-b2b-token-73.yaml', svc: '73', fields: 6, active: false },
    { file: 'snap-va-inquiry-24.yaml', svc: '24', fields: 14, active: true },
    { file: 'snap-va-payment-25.yaml', svc: '25', fields: 19, active: false },
    { file: 'snap-intrabank-17.yaml', svc: '17', fields: 15, active: false },
    { file: 'snap-bifast-18.yaml', svc: '18', fields: 22, active: false },
    { file: 'iso20022-pacs008-bridge.yaml', svc: 'ISO', fields: 28, active: false },
  ];

  const constraints = [
    { field: 'partnerServiceId', rule: 'string(8) · 3 spasi kiri', bank: 'BCA / Mandiri' },
    { field: 'customerNo', rule: 'numerik max 20 digit', bank: 'Semua Bank' },
    { field: 'virtualAccountNo', rule: 'partnerServiceId + custNo', bank: 'BCA / Mandiri' },
    { field: 'amount.value', rule: '^\\d{1,16}\\.\\d{2}$ wajib .00', bank: 'Semua Bank' },
    { field: 'trxDateInit', rule: 'ISO-8601 +07:00 (WIB)', bank: 'ASPI v2.0' },
    { field: 'inquiryRequestId', rule: 'unik per sesi inquiry', bank: 'Idempotensi' },
    { field: 'X-TIMESTAMP', rule: 'ISO-8601 +07:00 (±60d BRI)', bank: 'Strict NTP' },
    { field: 'X-EXTERNAL-ID', rule: 'numerik max 36 · unik/hari', bank: 'Redis 24j' },
    { field: 'X-SIGNATURE', rule: 'Base64(HMAC-SHA512(STS))', bank: 'Symmetric' },
    { field: 'CHANNEL-ID', rule: 'string(5) · kode kanal H2H', bank: 'BNI / BCA' },
  ];

  const csharpLines = [
    '<span class="cm">// Dihasilkan oleh SNAPBox Studio · Target: .NET 9 (C# 13)</span>',
    '<span class="cm">// Profil Bank: BCA + Mandiri Strict · Service 24 (VA Inquiry)</span>',
    '<span class="ck">using</span> System.Security.Cryptography;',
    '<span class="ck">using</span> System.Text;',
    '<span class="ck">using</span> System.Text.Json;',
    '',
    '<span class="ck">public sealed class</span> <span class="ct">SnapSymmetricSigner</span>(<span class="ct">string</span> clientSecret)',
    '<span class="cp">{</span>',
    '  <span class="ck">private static readonly</span> <span class="ct">TimeZoneInfo</span> WibTz =',
    '      TimeZoneInfo.FindSystemTimeZoneById(<span class="cs">"SE Asia Standard Time"</span>);',
    '',
    '  <span class="ck">public</span> (<span class="ct">string</span> Timestamp, <span class="ct">string</span> Signature) <span class="ct">Sign</span>(',
    '      <span class="ct">string</span> httpMethod, <span class="ct">string</span> relativePath,',
    '      <span class="ct">string</span> accessToken, <span class="ct">object</span> payload)',
    '  <span class="cp">{</span>',
    '    <span class="cm">// 1. Minifikasi body JSON deterministik (tanpa spasi)</span>',
    '    <span class="ct">string</span> minified = JsonSerializer.Serialize(payload,',
    '        <span class="ck">new</span> JsonSerializerOptions <span class="cp">{</span> WriteIndented = <span class="cn">false</span> <span class="cp">});</span>',
    '',
    '    <span class="cm">// 2. Lowercase Hex SHA-256 atas body ter-minifikasi</span>',
    '    <span class="ct">byte</span>[] bodyHash = SHA256.HashData(Encoding.UTF8.GetBytes(minified));',
    '    <span class="ct">string</span> lowerHex = Convert.ToHexStringLower(bodyHash);',
    '',
    '    <span class="cm">// 3. Timestamp WIB (+07:00) presisi detik sesuai NTP bank</span>',
    '    <span class="ct">string</span> tsWib = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, WibTz)',
    '        .ToString(<span class="cs">"yyyy-MM-ddTHH:mm:sszzz"</span>);',
    '',
    '    <span class="cm">// 4. Rangkai StringToSign &amp; hitung HMAC-SHA512 Base64</span>',
    '    <span class="ct">string</span> sts = <span class="cs">$"{httpMethod.ToUpperInvariant()}:{relativePath}:"</span> +',
    '                 <span class="cs">$"{accessToken}:{lowerHex}:{tsWib}"</span>;',
    '    <span class="ck">using var</span> hmac = <span class="ck">new</span> HMACSHA512(Encoding.UTF8.GetBytes(clientSecret));',
    '    <span class="ct">string</span> sig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(sts)));',
    '    <span class="ck">return</span> (tsWib, sig);',
    '  <span class="cp">}</span>',
    '',
    '  <span class="ck">public void</span> <span class="ct">AttachSnapHeaders</span>(<span class="ct">HttpRequestMessage</span> req, <span class="ct">string</span> partnerId,',
    '      <span class="ct">string</span> externalId, <span class="ct">string</span> channelId, <span class="ct">string</span> tsWib, <span class="ct">string</span> sig)',
    '  <span class="cp">{</span>',
    '    req.Headers.TryAddWithoutValidation(<span class="cs">"X-TIMESTAMP"</span>, tsWib);',
    '    req.Headers.TryAddWithoutValidation(<span class="cs">"X-SIGNATURE"</span>, sig);',
    '    req.Headers.TryAddWithoutValidation(<span class="cs">"X-PARTNER-ID"</span>, partnerId);',
    '    req.Headers.TryAddWithoutValidation(<span class="cs">"X-EXTERNAL-ID"</span>, externalId);',
    '    req.Headers.TryAddWithoutValidation(<span class="cs">"CHANNEL-ID"</span>, channelId);',
    '  <span class="cp">}</span>',
    '<span class="cp">}</span>',
  ];

  const goLines = [
    '<span class="cm">// snap_signer.go — Go 1.23 (Zero External Dependency)</span>',
    '<span class="ck">func</span> <span class="ct">SignSnapHMAC</span>(',
    '    secret, method, path, token <span class="ct">string</span>,',
    '    body []<span class="ct">byte</span>, tsWib <span class="ct">string</span>,',
    ') <span class="ct">string</span> <span class="cp">{</span>',
    '    <span class="ck">var</span> compact bytes.Buffer',
    '    _ = json.Compact(&amp;compact, body)',
    '    sum := sha256.Sum256(compact.Bytes())',
    '    sts := fmt.Sprintf(<span class="cs">"%s:%s:%s:%x:%s"</span>,',
    '        strings.ToUpper(method), path, token, sum, tsWib)',
    '    mac := hmac.New(sha512.New, []<span class="ct">byte</span>(secret))',
    '    mac.Write([]<span class="ct">byte</span>(sts))',
    '    <span class="ck">return</span> base64.StdEncoding.EncodeToString(mac.Sum(<span class="cn">nil</span>))',
    '<span class="cp">}</span>',
  ];

  const tsLines = [
    '<span class="cm">// snapSigner.ts — TypeScript 5.6 (Node 22 Native Crypto)</span>',
    '<span class="ck">export function</span> <span class="ct">signSnapSymmetric</span>(cfg: <span class="ct">SnapSignInput</span>): <span class="ct">string</span> <span class="cp">{</span>',
    '  <span class="ck">const</span> minified = JSON.stringify(cfg.payload);',
    '  <span class="ck">const</span> bodyHex = createHash(<span class="cs">"sha256"</span>)',
    '    .update(minified, <span class="cs">"utf8"</span>).digest(<span class="cs">"hex"</span>);',
    '  <span class="ck">const</span> sts = [cfg.method.toUpperCase(), cfg.path,',
    '    cfg.token, bodyHex, cfg.tsWib].join(<span class="cs">":"</span>);',
    '  <span class="ck">return</span> createHmac(<span class="cs">"sha512"</span>, cfg.clientSecret)',
    '    .update(sts, <span class="cs">"utf8"</span>).digest(<span class="cs">"base64"</span>);',
    '<span class="cp">}</span>',
  ];

  const contentHtml = `<div style="flex:1;min-height:0;display:flex;overflow:hidden;">
    <!-- Left OpenAPI 3.1 Registry Sidebar -->
    <aside style="width:336px;background:#ffffff;border-right:1px solid #d5dde8;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;">
      <div class="col-head">
        <span style="display:inline-flex;align-items:center;gap:6px;">${ic('fileText', 13, '#0f52ba')} ASPI OpenAPI 3.1 Schema Registry</span>
        ${badge('6 Kontrak', 'accent')}
      </div>
      <div style="padding:7px 8px;border-bottom:1px solid #e2e8f0;display:flex;flex-direction:column;gap:2px;">
        ${schemas
          .map(
            (s) => `<div class="col-item ${s.active ? 'is-active' : ''}" style="border-radius:3px;">
              <span class="col-path">${esc(s.file)}</span>
              <span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;">
                <span class="mono" style="font-size:9px;color:#64748b;">${s.fields}f</span>
                ${badge(s.svc, s.active ? 'accent' : 'neutral')}
              </span>
            </div>`
          )
          .join('')}
      </div>

      <div style="padding:8px 10px 4px;font-size:10.3px;font-weight:700;color:#0f172a;display:flex;justify-content:space-between;align-items:center;">
        <span>Validasi Kontrak · Service 24</span>
        <span class="mono" style="font-size:9.5px;color:#047857;">Strict ON</span>
      </div>
      <div style="flex:1;min-height:0;padding:0 10px 6px;overflow:hidden;">
        <table class="e-table" style="font-size:9.9px;">
          <thead>
            <tr>
              <th style="width:124px;">Field / Header</th>
              <th>Aturan Presisi</th>
            </tr>
          </thead>
          <tbody>
            ${constraints
              .map(
                (c) => `<tr>
                  <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(c.field)}</td>
                  <td>
                    <div class="mono" style="font-size:9.4px;color:#0f172a;">${esc(c.rule)}</div>
                    <div style="font-size:8.9px;color:#64748b;">${esc(c.bank)}</div>
                  </td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div style="padding:8px 10px;border-top:1px solid #d5dde8;background:#f8fafc;">
        <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:3px;">Paritas Vektor Uji Lintas Bahasa</div>
        <div class="kv-row"><span class="kv-k">C# (.NET 9)</span><span class="kv-v" style="color:#047857;">b8F2kQ9+...wQ8==</span></div>
        <div class="kv-row"><span class="kv-k">Go 1.23</span><span class="kv-v" style="color:#047857;">b8F2kQ9+...wQ8==</span></div>
        <div class="kv-row"><span class="kv-k">TypeScript</span><span class="kv-v" style="color:#047857;">b8F2kQ9+...wQ8==</span></div>
      </div>
    </aside>

    <!-- Main Codegen IDE Area -->
    <div style="flex:1;min-width:0;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">
      <!-- Top Action & Target Bar -->
      <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:11.5px;font-weight:700;color:#0f172a;">Generator Klien Signing Presisi</span>
          ${badge('C# (.NET 9) Aktif', 'accent')}
          ${badge('Go 1.23', 'neutral')}
          ${badge('TypeScript 5.6', 'neutral')}
          ${badge('WIB +07:00 Sync', 'ok')}
          ${badge('Auto Pad VA 8-Char', 'info')}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="e-btn">${ic('copy', 11, '#334155')} Salin Semua SDK</span>
          <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Paket NuGet / Go Mod</span>
        </div>
      </div>

      <!-- Code Editors Grid: Primary C# Left (55%) + Go & TS Stacked Right (45%) -->
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.22fr 1fr;gap:9px;overflow:hidden;">
        <!-- Primary C# (.NET 9) Editor -->
        <section class="e-panel">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#0f52ba')} SnapSymmetricSigner.cs <span class="e-panel-sub">(.NET 9 · C# 13 · Zero-Alloc Hex)</span></div>
            <div style="display:flex;gap:6px;">${badge('Vector Match 100%', 'ok')} <span class="e-btn">${ic('copy', 11, '#334155')} Salin</span></div>
          </div>
          <div class="e-panel-body-flush" style="background:#0d1526;padding:8px 10px;">
            <div class="code-pane" style="padding:0;flex:1;">${codeLines(csharpLines)}</div>
          </div>
        </section>

        <!-- Right Column: Go + TypeScript + Deterministic Vector Check -->
        <div style="display:flex;flex-direction:column;gap:9px;min-height:0;overflow:hidden;">
          <section class="e-panel" style="flex:1.15;">
            <div class="e-panel-head">
              <div class="e-panel-title">${ic('code', 13, '#0284c7')} snap_signer.go <span class="e-panel-sub">(Go 1.23 stdlib)</span></div>
              ${badge('Identik', 'ok')}
            </div>
            <div class="e-panel-body-flush" style="background:#0d1526;padding:8px 10px;">
              <div class="code-pane" style="padding:0;">${codeLines(goLines)}</div>
            </div>
          </section>

          <section class="e-panel" style="flex:0.9;">
            <div class="e-panel-head">
              <div class="e-panel-title">${ic('code', 13, '#0f52ba')} snapSigner.ts <span class="e-panel-sub">(TypeScript · Node 22)</span></div>
              ${badge('Identik', 'ok')}
            </div>
            <div class="e-panel-body-flush" style="background:#0d1526;padding:8px 10px;">
              <div class="code-pane" style="padding:0;">${codeLines(tsLines)}</div>
            </div>
          </section>

          <!-- Deterministic Test Vector Verification Box (Cleanly sized, 0 overflow) -->
          <section class="e-panel" style="height:164px;flex-shrink:0;">
            <div class="e-panel-head" style="height:28px;">
              <div class="e-panel-title">${ic('checkCircle', 12, '#047857')} Verifikasi Paritas Vektor Deterministik (Cross-SDK)</div>
              ${badge('3/3 Bahasa Identik', 'ok')}
            </div>
            <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;gap:4px;">
              <div class="kv-row"><span class="kv-k">Input Minified SHA-256</span><span class="kv-v">e4a91f7c3b208d6e105f94c7a82b4d90...71c2</span></div>
              <div class="kv-row"><span class="kv-k">Timestamp Referensi</span><span class="kv-v">2026-11-22T14:22:08+07:00 (WIB)</span></div>
              <div class="kv-row"><span class="kv-k">X-SIGNATURE Output</span><span class="kv-v" style="color:#047857;">b8F2kQ9+vR4mP1xZ7nL0dC3tY6hJ2sW5...wQ8==</span></div>
              <div style="font-size:9.6px;color:#475569;margin-top:2px;">Uji otomatis memverifikasi kesamaan byte-per-byte antara C# .NET 9, Go 1.23, dan Node 22 terhadap validator mock ASPI.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>`;

  return wrapEnterpriseHtml({
    title: 'SNAPBox Studio — Generator Kode Klien & OpenAPI 3.1',
    extraCss: IDE_CSS,
    bodyHtml: renderIdeShell({
      activeRail: 'p4',
      pageTitle: 'SDK Codegen (C# / Go / TS) & OpenAPI 3.1',
      topTabs: [
        { method: 'SPEC', mCls: 'spec', label: 'SnapSymmetricSigner.cs', active: true },
        { method: 'SPEC', mCls: 'spec', label: 'snap_signer.go', active: false },
        { method: 'SPEC', mCls: 'spec', label: 'snapSigner.ts', active: false },
        { method: 'GET', mCls: 'get', label: 'snap-va-inquiry-24.yaml', active: false },
      ],
      envTag: 'OpenAPI 3.1 · Cross-SDK Parity',
      contentHtml: contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 5: SUITE UJI OTOMATIS & BUKTI SERTIFIKASI ASPI SNAP BI
// ============================================================================
function renderPage5() {
  const passRate = (TOTAL_PASSED / TOTAL_TESTS) * 100;

  const blockers = [
    { id: 'TC-73-07', bank: 'BRI', fix: 'Sinkronisasi NTP worker < ±60 dtk (sekarang drift +74 dtk).' },
    { id: 'TC-24-05', bank: 'BNI', fix: 'Gunakan mode trimmed 5-digit partnerServiceId untuk profil BNI.' },
    { id: 'TC-18-06', bank: 'BRI', fix: 'Aktifkan fallback status inquiry otomatis pasca timeout 5041800.' },
  ];

  const contentHtml = `<div style="flex:1;min-height:0;padding:10px 12px;display:flex;flex-direction:column;gap:9px;overflow:hidden;">
    <!-- Top Certification Readiness KPI Strip -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;flex-shrink:0;">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Skenario ASPI</span>${badge('v2.0.4', 'accent')}</div>
        <div class="e-kpi-val">${TOTAL_TESTS} Kasus Uji</div>
        <div class="e-kpi-foot"><span>46 Positif · 18 Negatif</span><span class="mono">4 Bank</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Tingkat Kelulusan</span>${badge('Otomatis', 'ok')}</div>
        <div class="e-kpi-val" style="color:#047857;">${TOTAL_PASSED} / ${TOTAL_TESTS} (${fmtPct(passRate)})</div>
        <div class="e-kpi-foot"><span>BCA & Mandiri 100% lulus</span><span class="mono">6 layanan</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Deviasi Terbuka</span>${badge('Perlu Aksi', 'bad')}</div>
        <div class="e-kpi-val" style="color:#be123c;">${TOTAL_FAILED} Kasus Gagal</div>
        <div class="e-kpi-foot"><span>1 BNI (Pad VA) · 2 BRI (NTP/504)</span><span class="mono">Tercatat</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kepatuhan ISO-20022</span>${badge('BI-FAST 18', 'info')}</div>
        <div class="e-kpi-val">pacs.008 Valid</div>
        <div class="e-kpi-foot"><span>Proxy & BIC tervalidasi</span><span class="mono">100%</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Bundel Bukti ASPI</span>${badge('WORM SHA-256', 'ok')}</div>
        <div class="e-kpi-val">${fmtNum(TOTAL_EVIDENCE_KB)} KB</div>
        <div class="e-kpi-foot"><span>5 berkas audit siap ekspor</span><span class="mono">.ZIP</span></div>
      </div>
    </div>

    <!-- Main Split: Left 20-Row ASPI Test Matrix (66%) + Right Readiness, Blockers & Evidence Bundle (34%) -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.88fr 1fr;gap:9px;overflow:hidden;">
      <!-- Left: ASPI Certification Test Matrix -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#0f52ba')} Matriks Eksekusi Suite Uji Sertifikasi ASPI SNAP BI (20 Sampel Kunci · Seluruh 3 Deviasi Ditampilkan)</div>
          <div style="display:flex;gap:6px;">
            <span class="e-btn">${ic('play', 11, '#334155')} Jalankan Ulang Gagal (3)</span>
            <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Ekspor Bukti ASPI</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:74px;">ID Kasus</th>
                <th style="width:38px;">Svc</th>
                <th style="width:68px;">Bank</th>
                <th>Skenario Uji Resmi ASPI SNAP BI</th>
                <th style="width:62px;">Tipe</th>
                <th style="width:68px;">Expected</th>
                <th style="width:68px;">Actual</th>
                <th class="num" style="width:48px;">ms</th>
                <th style="width:72px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${ASPI_CASES.map((c) => {
                const trCls = !c.pass ? 'is-bad' : '';
                return `<tr class="${trCls}">
                  <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(c.id)}</td>
                  <td class="mono" style="font-weight:700;">${esc(c.svc)}</td>
                  <td style="font-weight:700;">${esc(c.bank)}</td>
                  <td>${esc(c.scenario)}</td>
                  <td>${badge(c.kind, c.kind === 'Positif' ? 'info' : 'neutral')}</td>
                  <td class="mono">${esc(c.exp)}</td>
                  <td class="mono" style="font-weight:700;color:${c.pass ? '#047857' : '#be123c'};">${esc(c.act)}</td>
                  <td class="num mono">${c.ms}</td>
                  <td>${badge(c.pass ? 'Lulus' : 'Deviasi', c.pass ? 'ok' : 'bad')}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total Suite Penuh ASPI SNAP v2.0: ${TOTAL_TESTS} Skenario (4 Bank × 16 Kasus)</td>
                <td colspan="2" class="mono">Lulus: ${TOTAL_PASSED} (${fmtPct(passRate)})</td>
                <td colspan="3" class="num mono" style="color:#be123c;">Deviasi Aktif: ${TOTAL_FAILED} Kasus</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- Right Column: Per-Bank Readiness + Remediation Blockers + Evidence Bundle -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;overflow:hidden;">
        <!-- Per-Bank Readiness -->
        <section class="e-panel" style="flex-shrink:0;">
          <div class="e-panel-head" style="height:29px;">
            <div class="e-panel-title">${ic('checkCircle', 13, '#047857')} Kesiapan Sertifikasi per Bank Rekanan</div>
            <span class="mono" style="font-size:10px;color:#0f52ba;font-weight:700;">${TOTAL_PASSED}/${TOTAL_TESTS}</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;gap:7px;">
            ${BANKS.map((b) => {
              const pct = (b.passed / b.totalTests) * 100;
              const barColor = b.failed === 0 ? '#047857' : b.failed === 1 ? '#b45309' : '#be123c';
              return `<div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-weight:700;color:#0f172a;font-size:10.5px;">${esc(b.code)}</span>
                    <span style="font-size:9.5px;color:#64748b;">${esc(b.name)}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:5px;">
                    <span class="mono" style="font-size:9.8px;font-weight:700;">${b.passed}/${b.totalTests}</span>
                    ${badge(b.status, b.tone)}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:7px;">
                  <div class="prog-track"><div class="prog-fill" style="width:${pct.toFixed(1)}%;background:${barColor};"></div></div>
                  <span class="mono" style="font-size:9.5px;color:#475569;width:38px;text-align:right;">${fmtPct(pct)}</span>
                </div>
              </div>`;
            }).join('')}
          </div>
        </section>

        <!-- Actionable Remediation Blockers (3 Active Deviations) -->
        <section class="e-panel" style="flex-shrink:0;">
          <div class="e-panel-head" style="height:29px;">
            <div class="e-panel-title">${ic('alert', 12, '#be123c')} Rekomendasi Perbaikan Deviasi (3 Kasus)</div>
            ${badge('Blocker ASPI', 'bad')}
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;gap:5px;">
            ${blockers
              .map(
                (bl) => `<div style="border-left:2.5px solid #be123c;background:#fff1f2;padding:4px 7px;border-radius:0 3px 3px 0;">
                  <div style="display:flex;align-items:center;gap:6px;font-size:9.8px;">
                    <span class="mono" style="font-weight:700;color:#be123c;">${esc(bl.id)}</span>
                    <span style="font-weight:700;color:#0f172a;">${esc(bl.bank)}</span>
                  </div>
                  <div style="font-size:9.6px;color:#475569;margin-top:1px;">${esc(bl.fix)}</div>
                </div>`
              )
              .join('')}
          </div>
        </section>

        <!-- Evidence Bundle Manifest -->
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head" style="height:29px;">
            <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')} Paket Bukti Sertifikasi ASPI (WORM)</div>
            ${badge(`${fmtNum(TOTAL_EVIDENCE_KB)} KB`, 'accent')}
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${EVIDENCE_FILES.map(
                (f) => `<div style="border:1px solid #e2e8f0;border-radius:3px;padding:5px 8px;background:#fafcfe;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                    <span class="mono trunc" style="font-size:9.8px;font-weight:700;color:#0f52ba;">${esc(f.name)}</span>
                    <span class="mono" style="font-size:9.5px;color:#334155;flex-shrink:0;">${f.kb} KB</span>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1px;font-size:9.2px;color:#64748b;">
                    <span>${esc(f.desc)}</span>
                    <span class="mono">sha256:${esc(f.hash)}</span>
                  </div>
                </div>`
              ).join('')}
            </div>

            <div style="border-top:1px solid #d5dde8;padding-top:7px;display:flex;flex-direction:column;gap:5px;">
              <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#475569;">
                <span>Tanda Tangan Paket (WORM SHA-256)</span>
                <span class="mono" style="color:#0f172a;font-weight:700;">4f9a2c88e1d0...9b3a</span>
              </div>
              <div class="e-btn e-btn-primary" style="justify-content:center;height:26px;">
                ${ic('download', 12, '#ffffff')} Ekspor Bundel Sertifikasi ASPI SNAP BI (.zip)
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>`;

  return wrapEnterpriseHtml({
    title: 'SNAPBox Studio — Suite Uji Otomatis & Sertifikasi ASPI SNAP BI',
    extraCss: IDE_CSS,
    bodyHtml: renderIdeShell({
      activeRail: 'p5',
      pageTitle: 'Suite Sertifikasi ASPI SNAP BI',
      topTabs: [
        { method: 'SPEC', mCls: 'spec', label: 'ASPI Certification Suite (64)', active: true },
        { method: 'ERR', mCls: 'err', label: '3 Deviasi BNI/BRI', active: false },
        { method: 'GET', mCls: 'get', label: 'Bukti WORM (.zip)', active: false },
      ],
      envTag: 'ASPI Certification Runner v2.0',
      contentHtml: contentHtml,
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
