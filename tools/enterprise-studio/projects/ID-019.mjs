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
  svgSparkline,
  svgStackedBarChart,
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-019',
  name: 'KreditUMKM Score',
  reference: 'Databricks SQL Analytics + Snowflake Horizon + Tableau Enterprise',
  persona: 'R. Kusuma · Senior Credit Risk Analyst · BPD Jatim & Konsorsium UMKM',
  pages: [
    { slug: 'p1', title: 'Eksekutif Portofolio & Analitik Regional BPD' },
    { slug: 'p2', title: 'Antrean Underwriting & Meja Skor Arus Kas' },
    { slug: 'p3', title: 'Arsitektur Lakehouse Medallion & Kontrak SQL/dbt' },
    { slug: 'p4', title: 'Laboratorium Stres DSCR & Simulator Komite Kredit' },
    { slug: 'p5', title: 'Tata Kelola OJK, Persetujuan UU PDP & Audit WORM' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const REGIONAL_BPD = [
  { code: 'JTM', region: 'Jawa Timur (BPD Jatim)', branches: 38, debitur: 3640, bakiM: 438.4, avgScore: 742, dscr: 2.28, nplPct: 1.52, ews: 44, tone: 'ok' },
  { code: 'JTG', region: 'Jawa Tengah & DIY', branches: 31, debitur: 2480, bakiM: 294.6, avgScore: 731, dscr: 2.18, nplPct: 1.74, ews: 34, tone: 'ok' },
  { code: 'JBR', region: 'Jawa Barat (BPD BJB)', branches: 29, debitur: 2310, bakiM: 282.0, avgScore: 726, dscr: 2.12, nplPct: 1.91, ews: 39, tone: 'ok' },
  { code: 'DKI', region: 'DKI Jakarta & Banten', branches: 22, debitur: 1790, bakiM: 228.8, avgScore: 736, dscr: 2.21, nplPct: 1.68, ews: 26, tone: 'ok' },
  { code: 'SUM', region: 'Sumatera Utara & Riau', branches: 18, debitur: 1290, bakiM: 141.2, avgScore: 704, dscr: 1.94, nplPct: 2.46, ews: 24, tone: 'warn' },
  { code: 'SUL', region: 'Sulawesi Selatan & Barat', branches: 14, debitur: 970, bakiM: 101.4, avgScore: 698, dscr: 1.89, nplPct: 2.58, ews: 17, tone: 'warn' },
];

const SECTOR_FLOWS = [
  { sector: 'Bahan Bangunan', short: 'Bangunan', qrisM: 312, posM: 268, efakturM: 420, debitur: 2410, npl: 1.48 },
  { sector: 'Grosir Sembako', short: 'Sembako', qrisM: 398, posM: 284, efakturM: 308, debitur: 2890, npl: 1.62 },
  { sector: 'F&B & Kuliner', short: 'F&B', qrisM: 446, posM: 214, efakturM: 124, debitur: 2740, npl: 2.14 },
  { sector: 'Konveksi & Tekstil', short: 'Tekstil', qrisM: 184, posM: 162, efakturM: 264, debitur: 1680, npl: 2.38 },
  { sector: 'Bengkel & Suku Cadang', short: 'Otomotif', qrisM: 168, posM: 156, efakturM: 172, debitur: 1490, npl: 1.78 },
  { sector: 'Farmasi & Alkes', short: 'Farmasi', qrisM: 142, posM: 118, efakturM: 140, debitur: 1270, npl: 1.24 },
];

const MONTHLY_PORTFOLIO = {
  labels: ['Des 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'Mei 26', 'Jun 26', 'Jul 26', 'Agu 26', 'Sep 26', 'Okt 26', 'Nov 26'],
  verifiedFlowM: [296, 308, 314, 342, 378, 354, 362, 368, 374, 382, 394, 408], // sums to 4280 M
  disbursedM: [108, 112, 116, 128, 144, 132, 136, 139, 142, 146, 151, 156],
  nplBps: [198, 196, 194, 191, 188, 189, 187, 186, 185, 184, 183, 182], // 1.82% latest exact match with AVG_NPL
};

const COHORT_VINTAGE = [
  { vintage: 'Q3 2025', count: 2140, m1: 99.6, m2: 99.1, m3: 98.6, m4: 98.1, m5: 97.7, m6: 97.4, kol3: 1.92 },
  { vintage: 'Q4 2025', count: 2490, m1: 99.7, m2: 99.2, m3: 98.8, m4: 98.3, m5: 98.0, m6: 97.8, kol3: 1.76 },
  { vintage: 'Q1 2026', count: 2680, m1: 99.7, m2: 99.3, m3: 98.9, m4: 98.5, m5: 98.2, m6: null, kol3: 1.64 },
  { vintage: 'Q2 2026', count: 2510, m1: 99.8, m2: 99.4, m3: 99.1, m4: 98.7, m5: null, m6: null, kol3: 1.48 },
  { vintage: 'Q3 2026', count: 2660, m1: 99.8, m2: 99.5, m3: 99.2, m4: null, m5: null, m6: null, kol3: 1.22 },
];

const EWS_ALERTS = [
  { id: 'EWS-891', merchant: 'CV Surya Tekstil Abadi', city: 'Bandung', dropPct: -38.4, avgDailyJt: 2.1, prevDailyJt: 3.4, spark: [3.5, 3.4, 3.3, 3.1, 2.7, 2.3, 2.1], cause: 'QRIS & e-Faktur turun 14 hari beruntun', bakiJt: 185, tone: 'bad' },
  { id: 'EWS-887', merchant: 'UD Berkah Sembako Raya', city: 'Medan', dropPct: -31.2, avgDailyJt: 4.2, prevDailyJt: 6.1, spark: [6.2, 6.0, 5.9, 5.4, 4.9, 4.5, 4.2], cause: 'Keterlambatan pelaporan SPT PPN Masa Okt', bakiJt: 210, tone: 'bad' },
  { id: 'EWS-882', merchant: 'Warung Nusantara Group', city: 'Makassar', dropPct: -27.6, avgDailyJt: 1.8, prevDailyJt: 2.5, spark: [2.6, 2.5, 2.4, 2.3, 2.1, 1.9, 1.8], cause: 'Penurunan transaksi QRIS akhir pekan -34%', bakiJt: 95, tone: 'warn' },
  { id: 'EWS-879', merchant: 'Bengkel Maju Motorindo', city: 'Semarang', dropPct: -24.8, avgDailyJt: 2.9, prevDailyJt: 3.9, spark: [3.9, 3.8, 3.8, 3.5, 3.2, 3.0, 2.9], cause: 'SLIK deteksi fasilitas multifinance baru', bakiJt: 140, tone: 'warn' },
  { id: 'EWS-874', merchant: 'Kios Elektronik Mandiri', city: 'Bekasi', dropPct: -21.5, avgDailyJt: 3.1, prevDailyJt: 4.0, spark: [4.1, 4.0, 3.8, 3.6, 3.5, 3.2, 3.1], cause: 'Konsentrasi 1 pemasok utama terganggu', bakiJt: 115, tone: 'warn' },
];

// Page 2: 16-Row Operational Underwriting Queue (Row 0 = Featured Merchant from spec)
const UNDERWRITING_QUEUE = [
  { id: 'UMKM-0841', merchant: 'Toko Bangunan Jaya', city: 'Surabaya', sector: 'Bahan Bangunan', score: 764, omzetJt: 148, pengajuanJt: 120, limitJt: 120, dscr: 2.1, slik: 'Kol-1', sources: 'QRIS·POS·XML', decision: 'SETUJUI', tone: 'ok', selected: true },
  { id: 'UMKM-0840', merchant: 'UD Sumber Pangan Sejahtera', city: 'Sidoarjo', sector: 'Grosir Sembako', score: 782, omzetJt: 214, pengajuanJt: 175, limitJt: 175, dscr: 2.3, slik: 'Kol-1', sources: 'QRIS·POS·XML', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0839', merchant: 'Apotek Sehat Sentosa', city: 'Malang', sector: 'Farmasi & Alkes', score: 791, omzetJt: 162, pengajuanJt: 130, limitJt: 130, dscr: 2.5, slik: 'Kol-1', sources: 'QRIS·POS·XML', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0838', merchant: 'CV Karya Baja Nusantara', city: 'Gresik', sector: 'Bahan Bangunan', score: 748, omzetJt: 268, pengajuanJt: 220, limitJt: 200, dscr: 1.9, slik: 'Kol-1', sources: 'QRIS·XML', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0837', merchant: 'Depot Soto & Katering Ibu Sari', city: 'Surabaya', sector: 'F&B & Kuliner', score: 718, omzetJt: 94, pengajuanJt: 80, limitJt: 70, dscr: 1.8, slik: 'Kol-1', sources: 'QRIS·POS', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0836', merchant: 'Konveksi Bintang Pratama', city: 'Bandung', sector: 'Konveksi & Tekstil', score: 668, omzetJt: 136, pengajuanJt: 150, limitJt: 90, dscr: 1.5, slik: 'Kol-1', sources: 'QRIS·XML', decision: 'PANTAU', tone: 'warn', warn: true },
  { id: 'UMKM-0835', merchant: 'Bengkel Diesel Karya Utama', city: 'Semarang', sector: 'Otomotif', score: 734, omzetJt: 118, pengajuanJt: 100, limitJt: 95, dscr: 2.0, slik: 'Kol-1', sources: 'QRIS·POS·XML', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0834', merchant: 'Toko Grosir Makmur Abadi', city: 'Kediri', sector: 'Grosir Sembako', score: 684, omzetJt: 124, pengajuanJt: 125, limitJt: 85, dscr: 1.6, slik: 'Kol-1', sources: 'QRIS·POS', decision: 'PANTAU', tone: 'warn' },
  { id: 'UMKM-0833', merchant: 'CV Cipta Furnitur Jati', city: 'Jepara', sector: 'Bahan Bangunan', score: 652, omzetJt: 172, pengajuanJt: 180, limitJt: 110, dscr: 1.4, slik: 'Kol-2', sources: 'QRIS·XML', decision: 'PANTAU', tone: 'warn' },
  { id: 'UMKM-0832', merchant: 'Kopi Roastery Lokal Jaya', city: 'Jakarta Sel.', sector: 'F&B & Kuliner', score: 756, omzetJt: 132, pengajuanJt: 100, limitJt: 100, dscr: 2.2, slik: 'Kol-1', sources: 'QRIS·POS·XML', decision: 'SETUJUI', tone: 'ok' },
  { id: 'UMKM-0831', merchant: 'UD Putra Logam Mandiri', city: 'Bekasi', sector: 'Bahan Bangunan', score: 594, omzetJt: 88, pengajuanJt: 120, limitJt: 0, dscr: 1.1, slik: 'Kol-2', sources: 'QRIS', decision: 'TOLAK', tone: 'bad', bad: true },
  { id: 'UMKM-0830', merchant: 'Minimarket Berkah Tani', city: 'Jember', sector: 'Grosir Sembako', score: 676, omzetJt: 106, pengajuanJt: 95, limitJt: 75, dscr: 1.6, slik: 'Kol-1', sources: 'QRIS·POS', decision: 'PANTAU', tone: 'warn' },
  { id: 'UMKM-0829', merchant: 'CV Sinar Kemasan Prima', city: 'Tangerang', sector: 'Konveksi & Tekstil', score: 612, omzetJt: 142, pengajuanJt: 160, limitJt: 0, dscr: 1.2, slik: 'Kol-2', sources: 'QRIS·XML', decision: 'EWS-TAHAN', tone: 'bad' },
  { id: 'UMKM-0828', merchant: 'Toko Suku Cadang Andalas', city: 'Medan', sector: 'Otomotif', score: 671, omzetJt: 112, pengajuanJt: 110, limitJt: 75, dscr: 1.5, slik: 'Kol-1', sources: 'QRIS·POS', decision: 'PANTAU', tone: 'warn' },
  { id: 'UMKM-0827', merchant: 'UD Lautan Rempah Celebes', city: 'Makassar', sector: 'Grosir Sembako', score: 568, omzetJt: 74, pengajuanJt: 100, limitJt: 0, dscr: 0.9, slik: 'Kol-3', sources: 'QRIS', decision: 'TOLAK', tone: 'bad', bad: true },
  { id: 'UMKM-0826', merchant: 'CV Delta Garment Sejahtera', city: 'Solo', sector: 'Konveksi & Tekstil', score: 582, omzetJt: 96, pengajuanJt: 135, limitJt: 0, dscr: 1.1, slik: 'Kol-2', sources: 'QRIS·POS', decision: 'EWS-TAHAN', tone: 'bad' },
];

// Featured Merchant Detail (Exact spec alignment for Toko Bangunan Jaya · SBY)
const FEATURED = {
  id: 'UMKM-0841',
  name: 'Toko Bangunan Jaya',
  city: 'Surabaya (Cabang Darmo)',
  envTag: 'MERCHANT: TOKO BANGUNAN JAYA · SBY',
  nmid: 'ID1024319847201',
  npwp: '31.842.190.4-614.000',
  nib: '1204000849122',
  consentId: 'PDP-2026-0841-9A2F',
  baseScore: 626,
  finalScore: 764,
  maxScore: 850,
  omzetBulananJt: 148,
  limitAmanJt: 120,
  tenorBln: 12,
  bungaEffPct: 11.5,
  dscrExisting: 2.4,
  dscrProjected: 2.1,
  signals: [
    { code: 'SIG-01', title: 'Mutasi QRIS & Rekening (12 Bln)', subtitle: 'Volatilitas rendah (CV 0,14) · 412 pembeli aktif', delta: 88, value: '+88 pts', status: 'Kuat', tone: 'ok', meta: 'Terizin' },
    { code: 'SIG-02', title: 'Konsistensi e-Faktur CoreTax', subtitle: '12/12 SPT Masa PPN dilaporkan tepat waktu', delta: 64, value: '+64 pts', status: 'Terverifikasi', tone: 'ok', meta: 'DJP XML' },
    { code: 'SIG-03', title: 'Eksposur Eksisting OJK SLIK', subtitle: '1 KUR aktif Rp 50 jt · Selalu Kol-1 lancar', delta: 0, value: 'DSCR 2,4x', status: 'Sehat', tone: 'ok', meta: 'Bersih' },
    { code: 'SIG-04', title: 'Risiko Konsentrasi Pemasok', subtitle: '68% pembelian berasal dari 2 distributor semen', delta: -14, value: '-14 pts', status: 'Pantau', tone: 'warn', meta: 'Catatan' },
  ],
  snippet: 'Rekomendasi Keputusan: SETUJUI Modal Kerja Produktif s/d Rp 120.000.000 (tenor 12b) | Proyeksi DSCR 2,1x.',
  // 12-month monthly cashflow decomposition (sums to 1776 jt / 12 = 148.0 jt/bln exact)
  monthlyMonths: ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
  monthlyQrisJt:    [52, 49, 50, 56, 62, 54, 55, 56, 58, 57, 59, 60], // sum = 668
  monthlyPosJt:     [44, 42, 41, 46, 50, 44, 45, 46, 47, 46, 48, 49], // sum = 548
  monthlyEfakturJt: [45, 43, 44, 47, 51, 46, 46, 47, 48, 47, 48, 48], // sum = 560
  // Financial DSCR exact numbers (Rp / bulan)
  omzetRp: 148000000,
  hppOpexRp: 112530000, // 76.03%
  kasBersihRp: 35470000,
  haircutRp: 3550000,   // 10% konservatif
  cfadsRp: 31920000,
  kurInstallmentRp: 4560000, // 1 KUR aktif Rp 50jt
  supplierLeaseRp: 8740000,  // Kewajiban tetap operasional/kontrak pemasok
  existingTotalRp: 13300000, // 31,920,000 / 13,300,000 = 2.40x
  newLoanInstallmentRp: 10640000, // Rp 120 jt, 12b @ 11.5% eff
  projectedCreditRp: 15200000,    // 4,560,000 + 10,640,000 = 15,200,000 -> 31,920,000 / 15,200,000 = 2.10x
  suppliers: [
    { name: 'PT Semen Gresik Distribusi Jatim', cat: 'Semen & Mortar', sharePct: 41, terms: 'TOP 30 Hari', risk: 'Tinggi', tone: 'warn' },
    { name: 'CV Baja Karya Utama Surabaya', cat: 'Besi Beton & Baja', sharePct: 27, terms: 'TOP 21 Hari', risk: 'Sedang', tone: 'warn' },
    { name: 'PT Cat Nusantara Indah', cat: 'Cat & Pelapis', sharePct: 11, terms: 'TOP 30 Hari', risk: 'Rendah', tone: 'ok' },
    { name: 'UD Keramik Mulia Sidoarjo', cat: 'Keramik & Sanitair', sharePct: 9, terms: 'TOP 14 Hari', risk: 'Rendah', tone: 'ok' },
    { name: 'PT Pipa PVC Surya Makmur', cat: 'Pipa & Plumbing', sharePct: 6, terms: 'TOP 30 Hari', risk: 'Rendah', tone: 'ok' },
    { name: '3 Pemasok Lokal Lainnya', cat: 'Aksesoris & Alat', sharePct: 6, terms: 'Tunai / QRIS', risk: 'Rendah', tone: 'ok' },
  ],
};

// Page 3: Decision API Trace Spans (sums to 248 ms exact)
const DECISION_SPANS = [
  { label: 'UU PDP OAuth2 Consent', start: 0, dur: 18, color: '#1e3a8a' },
  { label: 'ClickHouse Feature Store', start: 18, dur: 44, color: '#0369a1' },
  { label: 'OJK SLIK iDeb Lookup', start: 62, dur: 62, color: '#0f766e' },
  { label: 'CoreTax XML Verify', start: 124, dur: 36, color: '#4338ca' },
  { label: 'LightGBM + SHAP Engine', start: 160, dur: 54, color: '#b45309' },
  { label: '.NET 9 Memo & WORM', start: 214, dur: 34, color: '#047857' },
];

const DBT_TESTS = [
  { model: 'gold_umkm_cashflow_features', rule: 'accepted_range(cv_12m, 0, 2.5)', rows: '12.480', ms: '184 ms', status: 'LULUS', tone: 'ok' },
  { model: 'gold_umkm_cashflow_features', rule: 'pdp_consent_token_active = true', rows: '12.480', ms: '92 ms', status: 'LULUS', tone: 'ok' },
  { model: 'stg_coretax_ppn_reconciled', rule: 'xml_signature_djp_valid = true', rows: '149.760', ms: '412 ms', status: 'LULUS', tone: 'ok' },
  { model: 'stg_qris_daily_ledger', rule: 'freshness(settlement_ts) < 15m', rows: '4,82 jt', ms: '238 ms', status: 'LULUS', tone: 'ok' },
  { model: 'stg_slik_debt_obligations', rule: 'not_null(kolektibilitas_ojk)', rows: '28.910', ms: '310 ms', status: 'LULUS', tone: 'ok' },
  { model: 'gold_ews_velocity_signals', rule: 'latency_p95_sec < 30s', rows: '12.480', ms: '640 ms', status: 'PANTAU', tone: 'warn' },
];

// Page 4: DSCR Stress Scenarios (7 scenarios, zero truncation)
const STRESS_SCENARIOS = [
  { name: 'Skenario Dasar (Base)', shock: 'Omzet 0% · Bunga 11,5%', cfadsRp: 31920000, debtRp: 15200000, dscr: 2.10, cov: 'Lulus >=1,25x', limitRec: 'Rp 120 jt · Penuh', tone: 'ok', active: true },
  { name: 'Koreksi Musiman -15%', shock: 'Omzet -15% · HPP Tetap', cfadsRp: 27132000, debtRp: 15200000, dscr: 1.79, cov: 'Lulus >=1,25x', limitRec: 'Rp 120 jt · Penuh', tone: 'ok' },
  { name: 'Kenaikan Semen +12%', shock: 'Margin Turun 260 bps', cfadsRp: 28072000, debtRp: 15200000, dscr: 1.85, cov: 'Lulus >=1,25x', limitRec: 'Rp 120 jt · Penuh', tone: 'ok' },
  { name: 'Kenaikan Bunga +250bps', shock: 'Bunga Efektif 14,0%', cfadsRp: 31920000, debtRp: 15680000, dscr: 2.04, cov: 'Lulus >=1,25x', limitRec: 'Rp 120 jt · Penuh', tone: 'ok' },
  { name: 'Penurunan Omzet -25%', shock: 'Omzet Rp 111 jt/bln', cfadsRp: 23940000, debtRp: 15200000, dscr: 1.58, cov: 'Lulus >=1,25x', limitRec: 'Rp 105 jt · Buffer', tone: 'warn' },
  { name: 'Resesi + Bunga +150bps', shock: 'Omzet -20% · Bunga 13%', cfadsRp: 25536000, debtRp: 15510000, dscr: 1.65, cov: 'Lulus >=1,25x', limitRec: 'Rp 110 jt · Syarat', tone: 'warn' },
  { name: 'Stres Ekstrem Pemasok', shock: 'Omzet -38% · HPP +8%', cfadsRp: 18520000, debtRp: 15200000, dscr: 1.22, cov: 'Batas <1,25x', limitRec: 'Rp 85 jt · Mitigasi', tone: 'bad' },
];

// Page 5: UU PDP Consent Ledger (11 rows: 7 Aktif, 2 Perbarui, 2 Dicabut)
const CONSENT_LEDGER = [
  { id: 'PDP-0841', merchant: 'Toko Bangunan Jaya · SBY', scope: 'QRIS · POS · CoreTax · SLIK', method: 'e-KYC + OTP PrivyID', expiry: '18 Nov 2027', status: 'Aktif', tone: 'ok', hash: '9a2f8c4ed1' },
  { id: 'PDP-0840', merchant: 'UD Sumber Pangan Sejahtera', scope: 'QRIS · POS · CoreTax · SLIK', method: 'e-KYC + BSrE TTE', expiry: '14 Nov 2027', status: 'Aktif', tone: 'ok', hash: '4b71e90288' },
  { id: 'PDP-0839', merchant: 'Apotek Sehat Sentosa · MLG', scope: 'QRIS · POS · CoreTax · SLIK', method: 'e-KYC + OTP PrivyID', expiry: '11 Nov 2027', status: 'Aktif', tone: 'ok', hash: '7c3a11f839' },
  { id: 'PDP-0838', merchant: 'CV Karya Baja Nusantara', scope: 'QRIS · CoreTax · SLIK', method: 'e-KYC + BSrE TTE', expiry: '09 Nov 2027', status: 'Aktif', tone: 'ok', hash: '2d89b4c177' },
  { id: 'PDP-0837', merchant: 'Depot Soto Ibu Sari · SBY', scope: 'QRIS · POS · SLIK', method: 'e-KYC + OTP PrivyID', expiry: '27 Nov 2026', status: 'Perbarui <7h', tone: 'warn', hash: '5e04a7d9c4' },
  { id: 'PDP-0836', merchant: 'Konveksi Bintang Pratama', scope: 'QRIS · CoreTax · SLIK', method: 'e-KYC + OTP PrivyID', expiry: '04 Nov 2027', status: 'Aktif', tone: 'ok', hash: '8f12c6b350' },
  { id: 'PDP-0835', merchant: 'Bengkel Diesel Karya Utama', scope: 'QRIS · POS · CoreTax · SLIK', method: 'e-KYC + BSrE TTE', expiry: '02 Nov 2027', status: 'Aktif', tone: 'ok', hash: '1a66d2e49f' },
  { id: 'PDP-0834', merchant: 'Toko Grosir Makmur Abadi', scope: 'QRIS · POS · SLIK', method: 'e-KYC + OTP PrivyID', expiry: '25 Nov 2026', status: 'Perbarui <7h', tone: 'warn', hash: '3c90f5a121' },
  { id: 'PDP-0831', merchant: 'UD Putra Logam Mandiri', scope: 'QRIS · SLIK', method: 'e-KYC + OTP PrivyID', expiry: 'Dicabut 21 Nov', status: 'Dicabut', tone: 'bad', hash: '6d44b8c7e3' },
  { id: 'PDP-0829', merchant: 'CV Sinar Kemasan Prima', scope: 'QRIS · CoreTax · SLIK', method: 'e-KYC + BSrE TTE', expiry: '29 Okt 2027', status: 'Aktif', tone: 'ok', hash: '0e78a3f664' },
  { id: 'PDP-0827', merchant: 'UD Lautan Rempah Celebes', scope: 'QRIS · SLIK', method: 'e-KYC + OTP PrivyID', expiry: 'Dicabut 19 Nov', status: 'Dicabut', tone: 'bad', hash: '9f51d0c2a7' },
];

const MODEL_DRIFT = {
  labels: ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
  gini: [0.66, 0.67, 0.67, 0.68, 0.69, 0.68, 0.69, 0.70, 0.70, 0.71, 0.71, 0.72],
  ks:   [0.49, 0.50, 0.50, 0.51, 0.52, 0.51, 0.52, 0.53, 0.53, 0.54, 0.54, 0.55],
  psi:  [0.06, 0.07, 0.08, 0.09, 0.11, 0.09, 0.08, 0.09, 0.10, 0.09, 0.08, 0.09],
};

const REG_CONTROLS = [
  { code: 'POJK-40/2024', title: 'Layanan Pendanaan & Scoring Alternatif UMKM', freq: 'Harian / Real-Time', score: '100%', status: 'Patuh', tone: 'ok' },
  { code: 'UU-PDP-27/22', title: 'Persetujuan Eksplisit & Hak Pencabutan (Ps. 20, 40)', freq: 'Per Transaksi API', score: '100%', status: 'Patuh', tone: 'ok' },
  { code: 'OJK-SLIK-v3', title: 'Otorisasi Akses iDeb & Rekonsiliasi Kolektibilitas', freq: 'Batch T+0 & On-Demand', score: '99,8%', status: 'Patuh', tone: 'ok' },
  { code: 'DJP-CORETAX', title: 'Verifikasi Tanda Tangan XML e-Faktur & SPT PPN', freq: 'Bulanan (Masa Pajak)', score: '99,4%', status: 'Patuh', tone: 'ok' },
  { code: 'POJK-11/2022', title: 'Penyelenggaraan TI Bank & Retensi Audit WORM 10 Thn', freq: 'Kontinu (Object Lock)', score: '100%', status: 'Patuh', tone: 'ok' },
  { code: 'BI-QRIS-SNAP', title: 'Enkripsi mTLS Acquirer Settlement & Tokenisasi NMID', freq: 'Webhook Real-Time', score: '99,9%', status: 'Patuh', tone: 'ok' },
  { code: 'POJK-22/2023', title: 'Transparansi Faktor Penambah/Pengurang Memo Kredit', freq: 'Setiap Memo Komite', score: '100%', status: 'Patuh', tone: 'ok' },
  { code: 'ISO-27001-ID', title: 'Residency Data DCI Jakarta JK5 & Enkripsi KMS Lokal', freq: 'Audit Triwulanan', score: '100%', status: 'Patuh', tone: 'ok' },
];

const WORM_LOGS = [
  { ts: '15:21:08', actor: 'r.kusuma@bpdsby', event: 'MEMO_SIGN_READY', ref: 'UMKM-0841', detail: 'Skor 764 · Limit Rp 120 jt · Proyeksi DSCR 2,1x', hash: '9a2f8c4ed1' },
  { ts: '15:19:42', actor: 'dotnet9-decision', event: 'STRESS_DSCR_RUN', ref: 'UMKM-0841', detail: '7 skenario selesai · 6/7 lulus covenant >=1,25x', hash: '8c14a2b892' },
  { ts: '15:18:11', actor: 'slik-connector', event: 'SLIK_IDEB_VERIFY', ref: 'UMKM-0841', detail: '1 KUR Rp 50 jt · Kol-1 24/24 bulan lancar', hash: '7e03f15a21' },
  { ts: '15:16:55', actor: 'coretax-ingest', event: 'EFAKTUR_XML_OK', ref: 'UMKM-0841', detail: '12/12 SPT Masa PPN valid · CV omzet 0,14', hash: '4d91c83c77' },
  { ts: '15:12:04', actor: 'ews-clickhouse', event: 'EWS_DROP_ALERT', ref: 'EWS-891', detail: 'CV Surya Tekstil -38,4% QRIS 14h -> RM Bandung', hash: '2f55e49e08' },
  { ts: '15:08:39', actor: 'pdp-consent-svc', event: 'CONSENT_REVOKE', ref: 'PDP-0831', detail: 'Token dicabut debitur · feature store dipurge', hash: '6d44b8e311' },
  { ts: '14:54:20', actor: 'dbt-prod-runner', event: 'CONTRACT_PASS', ref: 'gold_cf_v4', detail: '12.480 baris tervalidasi · 0 null · PSI 0,09', hash: '1b82d94f63' },
  { ts: '14:41:12', actor: 'lgbm-scorer-432', event: 'BATCH_RESCORE', ref: 'BPD-JATIM', detail: '3.640 debitur diperbarui · Gini 0,72 stabil', hash: '0a37c17d19' },
  { ts: '14:28:05', actor: 'pdp-consent-svc', event: 'CONSENT_RENEW', ref: 'PDP-0840', detail: 'Perpanjangan 12 bln via BSrE TTE terverifikasi', hash: '5b19a60e44' },
  { ts: '14:15:33', actor: 'worm-anchorer', event: 'MERKLE_SEAL_OK', ref: 'BLOCK-9942', detail: '1.420.000 entri terkunci S3 Object Lock JK5', hash: '3f88e2c115' },
];

// Computed Totals (Single Source of Truth)
const TOTAL_DEBITUR = REGIONAL_BPD.reduce((a, r) => a + r.debitur, 0); // 12480
const TOTAL_BAKI_M = Number(REGIONAL_BPD.reduce((a, r) => a + r.bakiM, 0).toFixed(1)); // 1486.4
const TOTAL_EWS = REGIONAL_BPD.reduce((a, r) => a + r.ews, 0); // 184
const TOTAL_BRANCHES = REGIONAL_BPD.reduce((a, r) => a + r.branches, 0); // 152
const AVG_SCORE = Math.round(REGIONAL_BPD.reduce((a, r) => a + r.avgScore * r.debitur, 0) / TOTAL_DEBITUR); // 729
const AVG_DSCR = Number((REGIONAL_BPD.reduce((a, r) => a + r.dscr * r.bakiM, 0) / TOTAL_BAKI_M).toFixed(2)); // 2.16
const AVG_NPL = Number((REGIONAL_BPD.reduce((a, r) => a + r.nplPct * r.bakiM, 0) / TOTAL_BAKI_M).toFixed(2)); // 1.84

const TOTAL_SECTOR_FLOW_M = SECTOR_FLOWS.reduce((a, s) => a + s.qrisM + s.posM + s.efakturM, 0); // 4280
const TOTAL_MONTHLY_FLOW_M = MONTHLY_PORTFOLIO.verifiedFlowM.reduce((a, v) => a + v, 0); // 4280
const TOTAL_SECTOR_DEBITUR = SECTOR_FLOWS.reduce((a, s) => a + s.debitur, 0); // 12480

const QUEUE_SUM_OMZET = UNDERWRITING_QUEUE.reduce((a, q) => a + q.omzetJt, 0);
const QUEUE_SUM_PENGAJUAN = UNDERWRITING_QUEUE.reduce((a, q) => a + q.pengajuanJt, 0);
const QUEUE_SUM_LIMIT = UNDERWRITING_QUEUE.reduce((a, q) => a + q.limitJt, 0);
const QUEUE_AVG_DSCR = Number((UNDERWRITING_QUEUE.reduce((a, q) => a + q.dscr, 0) / UNDERWRITING_QUEUE.length).toFixed(2));
const QUEUE_APPROVAL_PCT = Number(((QUEUE_SUM_LIMIT / QUEUE_SUM_PENGAJUAN) * 100).toFixed(1));
const QUEUE_COUNT_APPROVE = UNDERWRITING_QUEUE.filter((q) => q.decision === 'SETUJUI').length; // 7
const QUEUE_COUNT_WATCH = UNDERWRITING_QUEUE.filter((q) => q.decision === 'PANTAU').length; // 5
const QUEUE_COUNT_REJECT = UNDERWRITING_QUEUE.filter((q) => q.decision === 'TOLAK' || q.decision === 'EWS-TAHAN').length; // 4

export function verifyMath() {
  if (TOTAL_DEBITUR !== 12480) throw new Error(`TOTAL_DEBITUR mismatch: ${TOTAL_DEBITUR}`);
  if (TOTAL_SECTOR_DEBITUR !== TOTAL_DEBITUR) throw new Error(`Sector debitur mismatch: ${TOTAL_SECTOR_DEBITUR} vs ${TOTAL_DEBITUR}`);
  if (TOTAL_BAKI_M !== 1486.4) throw new Error(`TOTAL_BAKI_M mismatch: ${TOTAL_BAKI_M}`);
  if (TOTAL_EWS !== 184) throw new Error(`TOTAL_EWS mismatch: ${TOTAL_EWS}`);
  if (TOTAL_SECTOR_FLOW_M !== 4280) throw new Error(`TOTAL_SECTOR_FLOW_M mismatch: ${TOTAL_SECTOR_FLOW_M}`);
  if (TOTAL_MONTHLY_FLOW_M !== TOTAL_SECTOR_FLOW_M) throw new Error(`Monthly vs Sector flow mismatch: ${TOTAL_MONTHLY_FLOW_M} vs ${TOTAL_SECTOR_FLOW_M}`);

  // Featured merchant SHAP score exact verification
  const shapSum = FEATURED.baseScore + FEATURED.signals.reduce((a, s) => a + s.delta, 0);
  if (shapSum !== FEATURED.finalScore) throw new Error(`SHAP sum mismatch: ${shapSum} vs ${FEATURED.finalScore}`);

  // Featured merchant 12-month cashflow exact average = Rp 148 jt/bln
  const mSum = FEATURED.monthlyQrisJt.reduce((a, v, i) => a + v + FEATURED.monthlyPosJt[i] + FEATURED.monthlyEfakturJt[i], 0);
  if (mSum !== 1776 || mSum / 12 !== FEATURED.omzetBulananJt) {
    throw new Error(`Featured monthly flow mismatch: sum=${mSum}, avg=${mSum / 12}`);
  }

  // DSCR financial math exact verification
  if (FEATURED.omzetRp - FEATURED.hppOpexRp !== FEATURED.kasBersihRp) throw new Error('Kas bersih mismatch');
  if (FEATURED.kasBersihRp - FEATURED.haircutRp !== FEATURED.cfadsRp) throw new Error('CFADS mismatch');
  if (FEATURED.kurInstallmentRp + FEATURED.supplierLeaseRp !== FEATURED.existingTotalRp) throw new Error('Existing total mismatch');
  if (FEATURED.kurInstallmentRp + FEATURED.newLoanInstallmentRp !== FEATURED.projectedCreditRp) throw new Error('Projected credit mismatch');
  const dscrEx = Number((FEATURED.cfadsRp / FEATURED.existingTotalRp).toFixed(2));
  const dscrPr = Number((FEATURED.cfadsRp / FEATURED.projectedCreditRp).toFixed(2));
  if (dscrEx !== 2.4 || dscrPr !== 2.1) throw new Error(`DSCR mismatch: existing=${dscrEx}, projected=${dscrPr}`);

  // Supplier concentration = 100%, top 2 = 68%
  const supTotal = FEATURED.suppliers.reduce((a, s) => a + s.sharePct, 0);
  const top2 = FEATURED.suppliers[0].sharePct + FEATURED.suppliers[1].sharePct;
  if (supTotal !== 100 || top2 !== 68) throw new Error(`Supplier share mismatch: total=${supTotal}, top2=${top2}`);

  // Queue totals & counts
  if (QUEUE_COUNT_APPROVE + QUEUE_COUNT_WATCH + QUEUE_COUNT_REJECT !== UNDERWRITING_QUEUE.length) {
    throw new Error('Queue status partition mismatch');
  }
  if (QUEUE_SUM_PENGAJUAN !== 2100 || QUEUE_SUM_LIMIT !== 1325 || QUEUE_SUM_OMZET !== 2186) {
    throw new Error(`Queue sums mismatch: omzet=${QUEUE_SUM_OMZET}, pengajuan=${QUEUE_SUM_PENGAJUAN}, limit=${QUEUE_SUM_LIMIT}`);
  }

  // Span waterfall duration sum
  const spanSum = DECISION_SPANS.reduce((a, s) => a + s.dur, 0);
  if (spanSum !== 248) throw new Error(`Decision span sum mismatch: ${spanSum}`);

  // Cohort vintage total equals TOTAL_DEBITUR
  const cohortSum = COHORT_VINTAGE.reduce((a, c) => a + c.count, 0);
  if (cohortSum !== TOTAL_DEBITUR) throw new Error(`Cohort debitur sum mismatch: ${cohortSum} vs ${TOTAL_DEBITUR}`);

  // Latest monthly NPL bps equals weighted AVG_NPL
  if (MONTHLY_PORTFOLIO.nplBps[MONTHLY_PORTFOLIO.nplBps.length - 1] !== Math.round(AVG_NPL * 100)) {
    throw new Error(`Monthly NPL bps mismatch: ${MONTHLY_PORTFOLIO.nplBps[11]} vs ${Math.round(AVG_NPL * 100)}`);
  }

  // Stress scenario DSCR cross-check (banking half-up rounding)
  for (const sc of STRESS_SCENARIOS) {
    const calc = Math.round((sc.cfadsRp / sc.debtRp + 1e-9) * 100) / 100;
    if (calc !== sc.dscr) {
      throw new Error(`Stress DSCR mismatch on ${sc.name}: calc=${calc} vs ${sc.dscr}`);
    }
  }
}

// ============================================================================
// CUSTOM ENTERPRISE LAKEHOUSE SHELL (Databricks / Snowflake / Tableau BI Look)
// Distinct from ID-001: Slim Navy Left Icon Rail + Light Analytical Top Bar + Tabs
// ============================================================================

const EXTRA_CSS = `
  .ku-shell {
    width: 1600px;
    height: 1000px;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    background: var(--e-bg);
  }
  /* Slim Institutional Navy Primary Rail */
  .ku-rail {
    width: 52px;
    height: 1000px;
    background: #172554;
    border-right: 1px solid #1e3a8a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 10px;
    flex-shrink: 0;
  }
  .ku-rail-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
  .ku-brand-box {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: #ffffff;
    color: #1e3a8a;
    font-family: var(--e-mono);
    font-weight: 800;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.04em;
    margin-bottom: 6px;
  }
  .ku-rail-item {
    width: 38px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #93c5fd;
    position: relative;
  }
  .ku-rail-item.is-active {
    background: #1e3a8a;
    color: #ffffff;
    box-shadow: inset 3px 0 0 #60a5fa;
  }
  .ku-rail-lbl {
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
  }
  .ku-rail-bot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .ku-rail-avatar {
    width: 28px;
    height: 28px;
    border-radius: 3px;
    background: #1e40af;
    border: 1px solid #60a5fa;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Right Main Lakehouse Workspace */
  .ku-workspace {
    flex: 1;
    min-width: 0;
    height: 1000px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .ku-topbar {
    height: 40px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .ku-topbar-left, .ku-topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .ku-prod-title {
    font-size: 13px;
    font-weight: 800;
    color: #172554;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
  .ku-divider-v {
    width: 1px;
    height: 18px;
    background: #cbd5e1;
    flex-shrink: 0;
  }
  .ku-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 40px;
  }
  .ku-tab {
    height: 40px;
    padding: 0 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .ku-tab.is-active {
    color: #1e3a8a;
    border-bottom-color: #1e3a8a;
    background: #f8fafc;
    font-weight: 700;
  }
  .ku-search-box {
    height: 25px;
    width: 248px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #64748b;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .ku-kbd {
    font-family: var(--e-mono);
    font-size: 8.8px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }

  /* Context & Filter Ribbon */
  .ku-subbar {
    height: 34px;
    background: #f8fafc;
    border-bottom: 1px solid var(--e-border);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .ku-filter-chip {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    font-size: 10.2px;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .ku-filter-chip strong {
    color: #0f172a;
    font-weight: 700;
  }
  .ku-env-tag {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    background: #eff4ff;
    border: 1px solid #bfdbfe;
    color: #1e3a8a;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  /* Main Analytical Body */
  .ku-body {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Bottom Telemetry Footer */
  .ku-footer {
    height: 24px;
    background: #ffffff;
    border-top: 1px solid var(--e-border-strong);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.4px;
    color: #475569;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
  }
  .ku-footer .e-status-group {
    gap: 10px;
    white-space: nowrap;
  }
  .ku-footer .e-status-item {
    white-space: nowrap;
    gap: 4px;
  }

  /* Custom Analytical Primitives */
  .ku-kpi-grid {
    display: grid;
    gap: 8px;
    flex-shrink: 0;
  }
  .ku-kpi {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-radius: 3px;
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 3px;
    min-width: 0;
  }
  .ku-kpi-accent {
    border-top: 2px solid #1e3a8a;
  }
  .ku-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.8px;
    font-weight: 600;
    color: #475569;
  }
  .ku-kpi-val {
    font-family: var(--e-mono);
    font-size: 16.5px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .ku-kpi-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.5px;
    color: #64748b;
  }

  /* Heat cells for ClickHouse Cohort Matrix */
  .heat-cell {
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    padding: 5px 4px;
    border-radius: 2px;
  }
  .heat-1 { background: #dcfce7; color: #166534; }
  .heat-2 { background: #ecfdf5; color: #047857; }
  .heat-3 { background: #eff6ff; color: #1e40af; }
  .heat-4 { background: #fef3c7; color: #92400e; }
  .heat-na { background: #f8fafc; color: #94a3b8; font-weight: 500; }

  /* Signal rows in Inspector */
  .sig-row {
    border: 1px solid #e2e8f0;
    border-left: 3px solid #047857;
    border-radius: 3px;
    padding: 6px 8px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .sig-row.is-warn {
    border-left-color: #b45309;
    background: #fffdf5;
  }

  /* Code / SQL Pane */
  .sql-pane {
    background: #0f172a;
    color: #e2e8f0;
    font-family: var(--e-mono);
    font-size: 10.2px;
    line-height: 1.44;
    padding: 8px 10px;
    overflow: hidden;
    flex: 1;
  }
  .sql-line {
    display: flex;
    gap: 10px;
    white-space: pre;
  }
  .sql-ln {
    width: 18px;
    text-align: right;
    color: #475569;
    user-select: none;
    flex-shrink: 0;
  }
  .kw { color: #93c5fd; font-weight: 700; }
  .fn { color: #6ee7b7; }
  .str { color: #fcd34d; }
  .cm { color: #64748b; }
  .num-tok { color: #f9a8d4; }

  /* WORM Log Console */
  .worm-pane {
    background: #0f172a;
    color: #cbd5e1;
    font-family: var(--e-mono);
    font-size: 9.7px;
    line-height: 1.48;
    padding: 7px 10px;
    flex: 1;
    overflow: hidden;
  }
  .worm-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px solid #1e293b;
    white-space: nowrap;
    overflow: hidden;
  }
  .worm-row:last-child { border-bottom: 0; }
`;

const RAIL_ITEMS = [
  { id: 'p1', icon: 'activity', short: 'BI', label: 'Portofolio' },
  { id: 'p2', icon: 'sliders', short: 'Skor', label: 'Underwriting' },
  { id: 'p3', icon: 'gitBranch', short: 'DAG', label: 'Lakehouse' },
  { id: 'p4', icon: 'layers', short: 'DSCR', label: 'Stres Uji' },
  { id: 'p5', icon: 'shield', short: 'PDP', label: 'Tata Kelola' },
];

const TOP_TABS = [
  { id: 'p1', label: 'Portofolio & Regional' },
  { id: 'p2', label: 'Meja Underwriting' },
  { id: 'p3', label: 'Medallion DAG & dbt' },
  { id: 'p4', label: 'Uji Stres DSCR' },
  { id: 'p5', label: 'UU PDP & Audit WORM' },
];

function renderShell({ activeId, pageTitle, subbarLeft, subbarRight, bodyContent, footerRightExtra = '' }) {
  const railHtml = `<nav class="ku-rail">
    <div class="ku-rail-top">
      <div class="ku-brand-box">KU</div>
      ${RAIL_ITEMS.map((item) => {
        const active = item.id === activeId;
        return `<div class="ku-rail-item ${active ? 'is-active' : ''}">
          ${ic(item.icon, 15, active ? '#ffffff' : '#93c5fd')}
          <span class="ku-rail-lbl">${esc(item.short)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="ku-rail-bot">
      <span class="dot dot-ok" title="Lakehouse Aktif"></span>
      <div class="ku-rail-avatar">RK</div>
    </div>
  </nav>`;

  const topbarHtml = `<header class="ku-topbar">
    <div class="ku-topbar-left">
      <span class="ku-prod-title">KreditUMKM Score</span>
      <span class="ku-divider-v"></span>
      <div class="ku-tabs">
        ${TOP_TABS.map((t) => `<div class="ku-tab ${t.id === activeId ? 'is-active' : ''}">${esc(t.label)}</div>`).join('')}
      </div>
    </div>
    <div class="ku-topbar-right">
      <div class="ku-search-box">
        <span style="display:inline-flex;align-items:center;gap:5px;" class="trunc">
          ${ic('search', 11, '#64748b')}
          <span class="trunc">Cari NPWP, NMID QRIS, ID Debitur...</span>
        </span>
        <span class="ku-kbd">Ctrl+K</span>
      </div>
      <span class="e-btn">${ic('sliders', 11, '#1e3a8a')} Uji Stres DSCR</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 11, '#ffffff')} Buat Memo Kredit</span>
    </div>
  </header>`;

  const subbarHtml = `<div class="ku-subbar">
    <div style="display:flex;align-items:center;gap:7px;min-width:0;">
      ${subbarLeft}
    </div>
    <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
      ${subbarRight}
    </div>
  </div>`;

  const footerHtml = `<footer class="ku-footer">
    <div class="e-status-group">
      <span class="e-status-item"><span class="dot dot-ok"></span> ClickHouse 3/3 · PG16 Primary</span>
      <span class="e-status-item">${ic('database', 10, '#1e3a8a')} QRIS T+0 · CoreTax XML · SLIK OJK</span>
      <span class="e-status-item">${ic('cpu', 10, '#047857')} LightGBM v4.3.2 · .NET 9 API (248 ms)</span>
    </div>
    <div class="e-status-group">
      ${footerRightExtra ? `<span class="e-status-item">${footerRightExtra}</span>` : ''}
      <span class="e-status-item">${ic('lock', 10, '#475569')} WORM SHA-256 · POJK 40/2024 · UU PDP</span>
      <span class="e-status-item">22 Nov 2026 · 15:24 WIB</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `KreditUMKM Score — ${pageTitle}`,
    accent: '#1e3a8a',
    accentSoft: '#eff4ff',
    accentInk: '#172554',
    bg: '#f2f5f9',
    surface: '#ffffff',
    surface2: '#f8fafc',
    border: '#d5dce6',
    borderStrong: '#bec8d6',
    extraCss: EXTRA_CSS,
    bodyHtml: `<div class="ku-shell">
      ${railHtml}
      <div class="ku-workspace">
        ${topbarHtml}
        ${subbarHtml}
        <main class="ku-body">${bodyContent}</main>
        ${footerHtml}
      </div>
    </div>`,
  });
}

// ============================================================================
// PAGE 1: EKSEKUTIF PORTOFOLIO & ANALITIK REGIONAL BPD
// ============================================================================
function renderPage1() {
  const kpiStrip = `<section class="ku-kpi-grid" style="grid-template-columns:repeat(6,1fr);">
    <div class="ku-kpi ku-kpi-accent">
      <div class="ku-kpi-head"><span>Baki Debet Portofolio</span>${badge('+12,4% YoY', 'ok')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val">Rp 1.486,4 M</span>
        ${svgSparkline({ points: [1180, 1215, 1248, 1292, 1340, 1388, 1435, 1486.4], width: 62, height: 20, color: '#1e3a8a' })}
      </div>
      <div class="ku-kpi-sub"><span>6 Regional BPD · ${TOTAL_BRANCHES} Cabang</span><span class="mono">Pagu 82%</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Debitur UMKM Aktif</span>${badge('UU PDP Valid', 'accent')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val">${fmtNum(TOTAL_DEBITUR)}</span>
        ${svgSparkline({ points: [9840, 10210, 10680, 11090, 11420, 11810, 12160, 12480], width: 62, height: 20, color: '#0369a1' })}
      </div>
      <div class="ku-kpi-sub"><span>96,2% QRIS + 68,4% CoreTax</span><span class="mono">+320 bln ini</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Arus Kas Terverifikasi</span>${badge('12 Bln', 'neutral')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val">Rp ${fmtNum(TOTAL_SECTOR_FLOW_M)} M</span>
        ${svgSparkline({ points: [296, 314, 342, 378, 362, 374, 394, 408], width: 62, height: 20, color: '#047857' })}
      </div>
      <div class="ku-kpi-sub"><span>QRIS · POS · e-Faktur DJP</span><span class="mono">2,88x Baki</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Skor Alternatif Rata2</span>${badge('Grade A-', 'ok')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val">${AVG_SCORE} / 850</span>
        ${svgSparkline({ points: [714, 716, 718, 721, 723, 725, 727, 729], width: 62, height: 20, color: '#047857' })}
      </div>
      <div class="ku-kpi-sub"><span>DSCR Tertimbang ${AVG_DSCR.toFixed(2).replace('.', ',')}x</span><span class="mono">Gini 0,72</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Rasio NPL (Kol-3+)</span>${badge('Batas <3,0%', 'ok')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val">${fmtPct(AVG_NPL, 2)}</span>
        ${svgSparkline({ points: [1.98, 1.95, 1.91, 1.88, 1.89, 1.86, 1.84, 1.84], width: 62, height: 20, color: '#047857' })}
      </div>
      <div class="ku-kpi-sub"><span>Kol-1 Lancar 95,4% · Kol-2 2,76%</span><span class="mono">-14 bps YoY</span></div>
    </div>
    <div class="ku-kpi" style="border-top:2px solid #b45309;">
      <div class="ku-kpi-head"><span>Peringatan Dini EWS</span>${badge('Pantau 14h', 'warn')}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:6px;">
        <span class="ku-kpi-val" style="color:#b45309;">${TOTAL_EWS}</span>
        ${svgSparkline({ points: [162, 168, 174, 169, 178, 181, 188, 184], width: 62, height: 20, color: '#b45309' })}
      </div>
      <div class="ku-kpi-sub"><span>Omzet QRIS turun &gt;20% (14h)</span><span class="mono">1,47% Deb.</span></div>
    </div>
  </section>`;

  const trendChart = svgMultiLineChart({
    width: 820,
    height: 244,
    xLabels: MONTHLY_PORTFOLIO.labels,
    yMin: 0,
    yMax: 450,
    yTicks: 5,
    yFormat: (v) => `Rp ${Math.round(v)}M`,
    series: [
      { label: 'Omzet Terverifikasi QRIS+POS+e-Faktur (Rp M)', color: '#1e3a8a', values: MONTHLY_PORTFOLIO.verifiedFlowM, area: true, dots: true, width: 2.1 },
      { label: 'Pencairan Modal Kerja Bulanan (Rp M)', color: '#047857', values: MONTHLY_PORTFOLIO.disbursedM, dots: true, width: 1.9 },
      { label: 'Indeks Risiko NPL (x100 bps)', color: '#be123c', values: MONTHLY_PORTFOLIO.nplBps, dashed: true, width: 1.6 },
    ],
    threshold: { value: 300, label: 'Target Arus Kas Bulanan Rp 300 M', color: '#0369a1' },
    annotations: [
      { index: 4, seriesIdx: 0, label: 'Puncak Musiman Lebaran: Rp 378 M', color: '#b45309', dy: -26 },
      { index: 11, seriesIdx: 0, label: 'Nov 26: Rp 408 M (NPL 1,82%)', color: '#1e3a8a', dy: -26 },
    ],
  });

  const regionalRows = REGIONAL_BPD.map((r) => {
    const share = (r.bakiM / TOTAL_BAKI_M) * 100;
    return `<tr>
      <td style="font-weight:700;color:#0f172a;">${esc(r.region)}</td>
      <td class="num mono">${fmtNum(r.debitur)}</td>
      <td class="num mono" style="font-weight:700;">Rp ${r.bakiM.toFixed(1).replace('.', ',')} M</td>
      <td class="num mono">${r.avgScore}</td>
      <td class="num mono">${r.dscr.toFixed(2).replace('.', ',')}x</td>
      <td class="num mono" style="color:${r.nplPct > 2.2 ? '#b45309' : '#047857'};font-weight:700;">${fmtPct(r.nplPct, 2)}</td>
      <td class="num mono">${r.ews}</td>
      <td>${renderCapacityBar(share, { warnAt: 40, critAt: 60 })}</td>
    </tr>`;
  }).join('');

  const middleRow = `<section style="display:grid;grid-template-columns:1.18fr 1fr;gap:8px;height:352px;flex-shrink:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('activity', 13, '#1e3a8a')}<span>Tren Arus Kas Terotorisasi vs Pencairan Modal Kerja (12 Bulan)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('ClickHouse Cohort DB', 'info')}
          ${badge('Total 12B: Rp 4.280 M', 'accent')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        ${trendChart}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:6px;border-top:1px solid #e2e8f0;">
          <div><div style="font-size:9.2px;color:#64748b;">Rasio Arus Kas / Baki</div><div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">2,88x <span style="color:#047857;font-size:9.5px;">(+0,21x)</span></div></div>
          <div><div style="font-size:9.2px;color:#64748b;">Persetujuan Otomatis (STP)</div><div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">61,8% <span style="color:#0369a1;font-size:9.5px;">(&lt;18 mnt)</span></div></div>
          <div><div style="font-size:9.2px;color:#64748b;">Rata-rata Limit Disetujui</div><div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">Rp 119,1 jt</div></div>
          <div><div style="font-size:9.2px;color:#64748b;">SLA Survei Konvensional</div><div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">14 hari -&gt; 42 mnt</div></div>
        </div>
      </div>
    </div>
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('globe', 13, '#1e3a8a')}<span>Sebaran Portofolio Regional BPD &amp; Kualitas Kredit</span></div>
        <span class="e-panel-sub">6 Regional · ${TOTAL_BRANCHES} Cabang Aktif</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table">
          <colgroup>
            <col style="width:27%;" />
            <col style="width:10%;" />
            <col style="width:15%;" />
            <col style="width:8%;" />
            <col style="width:9%;" />
            <col style="width:10%;" />
            <col style="width:7%;" />
            <col style="width:14%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Regional BPD / Provinsi</th>
              <th class="num">Debitur</th>
              <th class="num">Baki Debet</th>
              <th class="num">Skor</th>
              <th class="num">DSCR</th>
              <th class="num">NPL</th>
              <th class="num">EWS</th>
              <th>Porsi</th>
            </tr>
          </thead>
          <tbody>${regionalRows}</tbody>
          <tfoot>
            <tr>
              <td>Total Konsorsium (6 Regional)</td>
              <td class="num mono">${fmtNum(TOTAL_DEBITUR)}</td>
              <td class="num mono">Rp 1.486,4 M</td>
              <td class="num mono">${AVG_SCORE}</td>
              <td class="num mono">${AVG_DSCR.toFixed(2).replace('.', ',')}x</td>
              <td class="num mono">${fmtPct(AVG_NPL, 2)}</td>
              <td class="num mono">${TOTAL_EWS}</td>
              <td class="mono" style="font-size:10px;text-align:right;">100%</td>
            </tr>
          </tfoot>
        </table>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:7px 10px;background:#ffffff;border-top:1px solid #e2e8f0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#64748b;">Koridor Jawa (4 BPD)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">83,7% Baki · <span style="color:#047857;">NPL 1,69%</span></div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#64748b;">Luar Jawa (2 BPD)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">16,3% Baki · <span style="color:#b45309;">NPL 2,51%</span></div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#64748b;">Ruang Pagu Tersedia</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#1e3a8a;">Rp 326,6 M <span style="color:#64748b;font-size:9px;">(18%)</span></div>
          </div>
        </div>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;">
          <span>${ic('alert', 11, '#b45309')} <strong>Catatan Wilayah:</strong> Sumatera Utara &amp; Sulawesi Selatan dalam pemantauan komoditas (NPL 2,46%–2,58%).</span>
          <span class="mono" style="color:#1e3a8a;font-weight:700;">Batas RAS BPD: 3,00%</span>
        </div>
      </div>
    </div>
  </section>`;

  const heatCls = (v) => {
    if (v == null) return 'heat-na';
    if (v >= 99.0) return 'heat-1';
    if (v >= 98.2) return 'heat-2';
    if (v >= 97.6) return 'heat-3';
    return 'heat-4';
  };

  const cohortRows = COHORT_VINTAGE.map((c) => `<tr>
    <td class="mono" style="font-weight:700;">${esc(c.vintage)}</td>
    <td class="num mono">${fmtNum(c.count)}</td>
    <td><div class="heat-cell ${heatCls(c.m1)}">${c.m1.toFixed(1).replace('.', ',')}%</div></td>
    <td><div class="heat-cell ${heatCls(c.m2)}">${c.m2.toFixed(1).replace('.', ',')}%</div></td>
    <td><div class="heat-cell ${heatCls(c.m3)}">${c.m3.toFixed(1).replace('.', ',')}%</div></td>
    <td><div class="heat-cell ${heatCls(c.m4)}">${c.m4 != null ? c.m4.toFixed(1).replace('.', ',') + '%' : '—'}</div></td>
    <td><div class="heat-cell ${heatCls(c.m5)}">${c.m5 != null ? c.m5.toFixed(1).replace('.', ',') + '%' : '—'}</div></td>
    <td><div class="heat-cell ${heatCls(c.m6)}">${c.m6 != null ? c.m6.toFixed(1).replace('.', ',') + '%' : '—'}</div></td>
    <td class="num mono" style="font-weight:700;color:${c.kol3 > 1.8 ? '#b45309' : '#047857'};">${fmtPct(c.kol3, 2)}</td>
  </tr>`).join('');

  const sectorChart = svgStackedBarChart({
    width: 470,
    height: 266,
    categories: SECTOR_FLOWS.map((s) => s.short),
    yMax: 1150,
    yFormat: (v) => `${Math.round(v)}M`,
    series: [
      { label: 'QRIS Settlement', color: '#1e3a8a', values: SECTOR_FLOWS.map((s) => s.qrisM) },
      { label: 'POS Kasir/EDC', color: '#0369a1', values: SECTOR_FLOWS.map((s) => s.posM) },
      { label: 'e-Faktur CoreTax', color: '#0d9488', values: SECTOR_FLOWS.map((s) => s.efakturM) },
    ],
  });

  const ewsCards = EWS_ALERTS.map((e) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px;border-bottom:1px solid #e6ebf1;background:${e.tone === 'bad' ? '#fff7f8' : '#ffffff'};">
    <div style="min-width:0;flex:1;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="mono" style="font-size:9.5px;font-weight:700;color:#475569;">${esc(e.id)}</span>
        <span style="font-size:11px;font-weight:700;color:#0f172a;" class="trunc">${esc(e.merchant)}</span>
        <span style="font-size:9.5px;color:#64748b;">· ${esc(e.city)}</span>
      </div>
      <div style="font-size:9.8px;color:#475569;margin-top:2px;" class="trunc">${esc(e.cause)}</div>
    </div>
    <div style="display:flex;align-items:center;gap:9px;flex-shrink:0;">
      ${svgSparkline({ points: e.spark, width: 56, height: 18, color: e.tone === 'bad' ? '#be123c' : '#b45309', fill: false })}
      <div style="text-align:right;min-width:68px;">
        <div class="mono" style="font-size:11px;font-weight:800;color:${e.tone === 'bad' ? '#be123c' : '#b45309'};">${e.dropPct.toFixed(1).replace('.', ',')}%</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">Baki Rp ${e.bakiJt} jt</div>
      </div>
    </div>
  </div>`).join('');

  const bottomRow = `<section style="display:grid;grid-template-columns:1.05fr 0.95fr 1fr;gap:8px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 13, '#1e3a8a')}<span>Matriks Vintage Kohort Retensi Kol-1 (ClickHouse)</span></div>
        ${badge('M+1 s/d M+6', 'neutral')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.2px;">
          <colgroup>
            <col style="width:15%;" /><col style="width:12%;" />
            <col style="width:10%;" /><col style="width:10%;" /><col style="width:10%;" />
            <col style="width:10%;" /><col style="width:10%;" /><col style="width:10%;" />
            <col style="width:13%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Vintage</th><th class="num">Debitur</th>
              <th style="text-align:center;">M+1</th><th style="text-align:center;">M+2</th><th style="text-align:center;">M+3</th>
              <th style="text-align:center;">M+4</th><th style="text-align:center;">M+5</th><th style="text-align:center;">M+6</th>
              <th class="num">Kol-3+</th>
            </tr>
          </thead>
          <tbody>${cohortRows}</tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td class="num mono">${fmtNum(TOTAL_DEBITUR)}</td>
              <td colspan="6" style="font-size:9.5px;color:#475569;font-weight:600;">Retensi M+3 rata2 98,9% · Fitur CoreTax +42 bps</td>
              <td class="num mono">${fmtPct(AVG_NPL, 2)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:7px 10px;background:#ffffff;border-top:1px solid #e2e8f0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Roll Kol-1 -&gt; 2</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">1,42%</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Roll Kol-2 -&gt; 3+</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">0,48%</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Cure Rate EWS</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#047857;">34,6%</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Cadangan CKPN</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#1e3a8a;">Rp 29,8 M</div>
          </div>
        </div>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#475569;">
          <span>Skala Retensi Kol-1: <span class="heat-cell heat-1" style="padding:1px 5px;">&gt;=99%</span> <span class="heat-cell heat-2" style="padding:1px 5px;">98,2%</span> <span class="heat-cell heat-3" style="padding:1px 5px;">97,6%</span></span>
          <span class="mono">Cohort Sync: 15:20 WIB</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('database', 13, '#1e3a8a')}<span>Komposisi Sumber Arus Kas per Sektor (Rp M)</span></div>
        ${badge('Rp 4.280 M / 12B', 'accent')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
        ${sectorChart}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding-top:6px;border-top:1px solid #e2e8f0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9.2px;color:#64748b;">QRIS Acquirer</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#1e3a8a;">Rp 1.650 M <span style="font-size:9px;color:#64748b;">(38,6%)</span></div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9.2px;color:#64748b;">POS Kasir / EDC</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#0369a1;">Rp 1.202 M <span style="font-size:9px;color:#64748b;">(28,1%)</span></div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9.2px;color:#64748b;">CoreTax e-Faktur</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#0d9488;">Rp 1.428 M <span style="font-size:9px;color:#64748b;">(33,4%)</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('alert', 13, '#be123c')}<span>Radar Peringatan Dini (EWS) Omzet Harian</span></div>
        ${badge('5 Prioritas · 184 Total', 'bad')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div>${ewsCards}</div>
        <div style="padding:7px 10px;background:#fffbeb;border-top:1px solid #fde68a;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#92400e;">
          <span><strong>Aturan EWS:</strong> Alert otomatis jika rata-rata QRIS 14 hari turun &gt;20% vs baseline 90h.</span>
          <span class="mono" style="font-weight:700;">SLA RM: 48 Jam</span>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeId: 'p1',
    pageTitle: 'Eksekutif Portofolio & Analitik Regional BPD',
    subbarLeft: `
      <span class="ku-env-tag">${ic('shield', 11, '#1e3a8a')} KONSORSIUM BPD &amp; MULTIFINANCE · PRODUKSI</span>
      <span class="ku-filter-chip">${ic('clock', 11, '#64748b')} Periode: <strong>Des 2025 – Nov 2026 (12 Bln)</strong></span>
      <span class="ku-filter-chip">${ic('globe', 11, '#64748b')} Wilayah: <strong>Semua 6 Regional BPD</strong></span>
      <span class="ku-filter-chip">${ic('filter', 11, '#64748b')} Segmen: <strong>Modal Kerja Produktif (Rp 50 jt–500 jt)</strong></span>
    `,
    subbarRight: `
      <span class="ku-filter-chip">${ic('checkCircle', 11, '#047857')} <strong>SLIK OJK + CoreTax Sinkron</strong></span>
      <span class="e-btn">${ic('download', 11, '#334155')} Ekspor Laporan OJK</span>
    `,
    bodyContent: `${kpiStrip}${middleRow}${bottomRow}`,
    footerRightExtra: 'Baki Debet: Rp 1.486,4 M · 12.480 Debitur',
  });
}

// ============================================================================
// PAGE 2: ANTREAN UNDERWRITING & MEJA SKOR ARUS KAS (16 ROWS + INSPECTOR)
// ============================================================================
function renderPage2() {
  const filterBar = `<section style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:#ffffff;border:1px solid var(--e-border);border-radius:3px;padding:6px 10px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span class="e-badge e-badge-accent" style="padding:3px 8px;font-size:10.2px;">Semua Antrean (${UNDERWRITING_QUEUE.length})</span>
      <span class="e-badge e-badge-ok" style="padding:3px 8px;font-size:10.2px;">Setujui Otomatis (${QUEUE_COUNT_APPROVE})</span>
      <span class="e-badge e-badge-warn" style="padding:3px 8px;font-size:10.2px;">Pantau Analis (${QUEUE_COUNT_WATCH})</span>
      <span class="e-badge e-badge-bad" style="padding:3px 8px;font-size:10.2px;">Tolak / EWS (${QUEUE_COUNT_REJECT})</span>
      <span class="ku-divider-v" style="height:16px;margin:0 2px;"></span>
      <span style="font-size:10.2px;color:#475569;">Filter Cepat: <strong>BPD Jawa Timur</strong> · <strong>Consent UU PDP Aktif</strong> · <strong>Skor LightGBM v4.3.2</strong></span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:10.2px;">
      <span class="mono" style="color:#475569;">Total Pengajuan: <strong style="color:#0f172a;">Rp ${fmtNum(QUEUE_SUM_PENGAJUAN)} jt</strong></span>
      <span class="mono" style="color:#475569;">Limit Aman Disetujui: <strong style="color:#047857;">Rp ${fmtNum(QUEUE_SUM_LIMIT)} jt</strong></span>
    </div>
  </section>`;

  const queueRows = UNDERWRITING_QUEUE.map((q) => {
    const rowCls = q.selected ? 'is-selected' : q.bad ? 'is-bad' : q.warn ? 'is-warn' : '';
    const scoreColor = q.score >= 720 ? '#047857' : q.score >= 650 ? '#b45309' : '#be123c';
    const dscrColor = q.dscr >= 1.8 ? '#047857' : q.dscr >= 1.35 ? '#b45309' : '#be123c';
    return `<tr class="${rowCls}" style="height:43px;">
      <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(q.id)}</td>
      <td>
        <div style="font-weight:700;color:#0f172a;line-height:1.2;" class="trunc">${esc(q.merchant)}</div>
        <div style="font-size:9.3px;color:#64748b;line-height:1.2;" class="trunc">${esc(q.city)} · ${esc(q.sector)}</div>
      </td>
      <td class="num mono" style="font-weight:800;color:${scoreColor};">${q.score}</td>
      <td class="num mono">Rp ${fmtNum(q.omzetJt)} jt</td>
      <td class="num mono">Rp ${fmtNum(q.pengajuanJt)} jt</td>
      <td class="num mono" style="font-weight:700;color:${q.limitJt > 0 ? '#0f172a' : '#be123c'};">${q.limitJt > 0 ? 'Rp ' + fmtNum(q.limitJt) + ' jt' : 'Rp 0'}</td>
      <td class="num mono" style="font-weight:700;color:${dscrColor};">${q.dscr.toFixed(1).replace('.', ',')}x</td>
      <td style="text-align:center;">${badge(q.slik, q.slik === 'Kol-1' ? 'ok' : q.slik === 'Kol-2' ? 'warn' : 'bad')}</td>
      <td class="mono" style="font-size:9.4px;color:#475569;">${esc(q.sources)}</td>
      <td style="text-align:right;">${badge(q.decision, q.tone)}</td>
    </tr>`;
  }).join('');

  // Custom SHAP attribution bar SVG for Toko Bangunan Jaya (626 + 88 + 64 + 0 - 14 = 764)
  const shapSvg = `<svg viewBox="0 0 510 118" width="100%" height="118" style="display:block;">
    <line x1="158" y1="6" x2="158" y2="100" stroke="#cbd5e1" stroke-width="1" />
    <line x1="258" y1="6" x2="258" y2="100" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
    <line x1="358" y1="6" x2="358" y2="100" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />
    <line x1="458" y1="6" x2="458" y2="100" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2" />

    <text x="4" y="19" font-size="9.5" font-weight="600" fill="#475569">Skor Dasar Populasi</text>
    <rect x="158" y="9" width="160" height="13" rx="2" fill="#64748b" />
    <text x="324" y="19" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">626 pts</text>

    <text x="4" y="40" font-size="9.5" font-weight="600" fill="#0f172a">SIG-01 Mutasi QRIS/Rek</text>
    <rect x="318" y="30" width="88" height="13" rx="2" fill="#047857" />
    <text x="412" y="40" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">+88 pts</text>

    <text x="4" y="61" font-size="9.5" font-weight="600" fill="#0f172a">SIG-02 CoreTax e-Faktur</text>
    <rect x="406" y="51" width="64" height="13" rx="2" fill="#0d9488" />
    <text x="475" y="61" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">+64 pts</text>

    <text x="4" y="82" font-size="9.5" font-weight="600" fill="#0f172a">SIG-04 Konsentrasi Pemasok</text>
    <rect x="456" y="72" width="14" height="13" rx="2" fill="#be123c" />
    <text x="475" y="82" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#be123c">-14 pts</text>

    <line x1="158" y1="96" x2="495" y2="96" stroke="#1e3a8a" stroke-width="1" />
    <text x="4" y="111" font-size="10" font-weight="800" fill="#1e3a8a">SKOR AKHIR TERKALIBRASI</text>
    <rect x="158" y="101" width="298" height="13" rx="2" fill="#1e3a8a" />
    <text x="462" y="111" font-size="10" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#1e3a8a">764 / 850</text>
  </svg>`;

  const signalCards = FEATURED.signals.map((s) => `<div class="sig-row ${s.tone === 'warn' ? 'is-warn' : ''}">
    <div style="min-width:0;flex:1;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="mono" style="font-size:9.3px;font-weight:800;color:#1e3a8a;background:#eff4ff;padding:1px 5px;border-radius:2px;">${esc(s.code)}</span>
        <span style="font-size:10.8px;font-weight:700;color:#0f172a;" class="trunc">${esc(s.title)}</span>
      </div>
      <div style="font-size:9.8px;color:#475569;margin-top:2px;" class="trunc">${esc(s.subtitle)}</div>
    </div>
    <div style="text-align:right;flex-shrink:0;">
      <div class="mono" style="font-size:11.5px;font-weight:800;color:${s.tone === 'warn' ? '#b45309' : '#047857'};">${esc(s.value)}</div>
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:2px;">
        ${badge(s.status, s.tone)}
        <span class="mono" style="font-size:9px;color:#64748b;">${esc(s.meta)}</span>
      </div>
    </div>
  </div>`).join('');

  const mainSplit = `<section style="display:grid;grid-template-columns:1.72fr 1fr;gap:9px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 13, '#1e3a8a')}<span>Antrean Underwriting Arus Kas UMKM (16 Pengajuan Aktif)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="e-panel-sub">Urut: Prioritas SLA · Batch Komite 22 Nov 2026</span>
          ${badge('STP Engine Aktif', 'ok')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.4px;">
          <colgroup>
            <col style="width:10.5%;" />
            <col style="width:23%;" />
            <col style="width:7%;" />
            <col style="width:10.5%;" />
            <col style="width:10.5%;" />
            <col style="width:10.5%;" />
            <col style="width:7%;" />
            <col style="width:7.5%;" />
            <col style="width:11.5%;" />
            <col style="width:10%;" />
          </colgroup>
          <thead>
            <tr>
              <th>ID Berkas</th>
              <th>Merchant UMKM · Kota / Sektor</th>
              <th class="num">Skor</th>
              <th class="num">Omzet/Bln</th>
              <th class="num">Pengajuan</th>
              <th class="num">Limit Aman</th>
              <th class="num">DSCR</th>
              <th style="text-align:center;">SLIK</th>
              <th>Sumber Data</th>
              <th style="text-align:right;">Keputusan</th>
            </tr>
          </thead>
          <tbody>${queueRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3">Ringkasan 16 Pengajuan (${QUEUE_COUNT_APPROVE} Setujui · ${QUEUE_COUNT_WATCH} Pantau · ${QUEUE_COUNT_REJECT} Tolak/EWS)</td>
              <td class="num mono">Rp ${fmtNum(QUEUE_SUM_OMZET)} jt</td>
              <td class="num mono">Rp ${fmtNum(QUEUE_SUM_PENGAJUAN)} jt</td>
              <td class="num mono" style="color:#047857;">Rp ${fmtNum(QUEUE_SUM_LIMIT)} jt</td>
              <td class="num mono">${QUEUE_AVG_DSCR.toFixed(2).replace('.', ',')}x</td>
              <td colspan="3" style="text-align:right;font-size:9.8px;color:#475569;">Rasio Nilai Disetujui: ${fmtPct(QUEUE_APPROVAL_PCT, 1)} · SLA Rata2: 38 mnt</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 11px;background:#f8fafc;border-top:1px solid #d5dce6;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;">
          <span>Baris terpilih: <strong style="color:#1e3a8a;">UMKM-0841 · Toko Bangunan Jaya (Surabaya)</strong> · Consent token UU PDP terverifikasi</span>
          <span class="mono">Halaman 1 dari 14 · 224 berkas minggu ini</span>
        </div>
      </div>
    </div>

    <div class="e-panel" style="border-color:#93c5fd;">
      <div class="e-panel-head" style="background:#eff4ff;border-bottom-color:#bfdbfe;">
        <div class="e-panel-title" style="color:#172554;">${ic('eye', 13, '#1e3a8a')}<span>Meja Underwriting · Inspektor Memo Kredit</span></div>
        ${badge('SIAP KOMITE', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
        <div style="border-bottom:1px solid #e2e8f0;padding-bottom:7px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span style="font-size:13.5px;font-weight:800;color:#0f172a;">${esc(FEATURED.name)}</span>
            <span class="mono" style="font-size:9.5px;font-weight:700;color:#1e3a8a;background:#eff4ff;border:1px solid #bfdbfe;padding:2px 6px;border-radius:3px;">${esc(FEATURED.id)}</span>
          </div>
          <div style="font-size:10px;color:#475569;margin-top:2px;">${esc(FEATURED.city)} · Bahan Bangunan · Berdiri 8 Tahun</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:5px;font-size:9.3px;color:#64748b;" class="mono">
            <span>NMID: <strong style="color:#334155;">${esc(FEATURED.nmid)}</strong></span>
            <span>NPWP: <strong style="color:#334155;">${esc(FEATURED.npwp)}</strong></span>
            <span>PDP: <strong style="color:#047857;">${esc(FEATURED.consentId)}</strong></span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.3px;font-weight:600;color:#047857;">Skor Alternatif</div>
            <div class="mono" style="font-size:15.5px;font-weight:800;color:#065f46;margin-top:1px;">764 / 850</div>
            <div style="font-size:9px;color:#047857;">Persentil 89 · Grade A</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #d5dce6;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.3px;font-weight:600;color:#475569;">Omzet Bulanan</div>
            <div class="mono" style="font-size:15.5px;font-weight:800;color:#0f172a;margin-top:1px;">Rp 148 jt</div>
            <div style="font-size:9px;color:#047857;">Rata2 12B · CV 0,14</div>
          </div>
          <div style="background:#eff4ff;border:1px solid #bfdbfe;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.3px;font-weight:600;color:#1e3a8a;">Limit Aman</div>
            <div class="mono" style="font-size:15.5px;font-weight:800;color:#172554;margin-top:1px;">Rp 120 jt</div>
            <div style="font-size:9px;color:#1e3a8a;">Tenor 12b · 11,5% eff</div>
          </div>
        </div>

        <div style="border:1px solid #e2e8f0;border-radius:3px;padding:6px 8px;background:#fafcfe;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10px;font-weight:700;color:#0f172a;">Dekomposisi SHAP LightGBM (Transparansi Memo Kredit)</span>
            <span class="mono" style="font-size:9.2px;color:#64748b;">Base 626 + 138 = 764</span>
          </div>
          ${shapSvg}
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;">
          ${signalCards}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#f8fafc;border:1px solid #d5dce6;border-radius:3px;padding:6px 8px;">
          <div>
            <div style="font-size:9px;color:#64748b;">DSCR Eksisting</div>
            <div class="mono" style="font-size:12px;font-weight:800;color:#047857;">2,4x <span style="font-size:9px;font-weight:500;">(Sehat)</span></div>
          </div>
          <div>
            <div style="font-size:9px;color:#64748b;">Proyeksi Pasca Plafon</div>
            <div class="mono" style="font-size:12px;font-weight:800;color:#1e3a8a;">2,1x <span style="font-size:9px;font-weight:500;">(Tenor 12b)</span></div>
          </div>
          <div>
            <div style="font-size:9px;color:#64748b;">Stres Omzet -25%</div>
            <div class="mono" style="font-size:12px;font-weight:800;color:#b45309;">1,58x <span style="font-size:9px;font-weight:500;">(&gt;=1,25x)</span></div>
          </div>
        </div>

        <div style="background:#0f172a;color:#f8fafc;border-radius:3px;padding:8px 10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span class="mono" style="font-size:9.2px;color:#6ee7b7;font-weight:700;">KEPUTUSAN MESIN .NET 9 DECISION API</span>
            <span class="mono" style="font-size:9px;color:#94a3b8;">Confidence 94,2%</span>
          </div>
          <div style="font-size:10.6px;font-weight:600;line-height:1.38;color:#ffffff;">${esc(FEATURED.snippet)}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:7px;padding-top:6px;border-top:1px solid #334155;">
            <span style="font-size:9.3px;color:#94a3b8;">Mitigasi SIG-04: syarat diversifikasi pemasok &lt;55%</span>
            <div style="display:flex;gap:5px;">
              <span class="e-btn" style="height:21px;font-size:9.8px;background:#1e293b;border-color:#475569;color:#e2e8f0;">Uji Stres DSCR</span>
              <span class="e-btn e-btn-primary" style="height:21px;font-size:9.8px;background:#2563eb;border-color:#2563eb;">Buat Memo Kredit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeId: 'p2',
    pageTitle: 'Antrean Underwriting & Meja Skor Arus Kas',
    subbarLeft: `
      <span class="ku-env-tag">${ic('checkCircle', 11, '#1e3a8a')} ${esc(FEATURED.envTag)}</span>
      <span class="ku-filter-chip">Cabang: <strong>BPD Jatim · Darmo Surabaya</strong></span>
      <span class="ku-filter-chip">Kebijakan: <strong>Modal Kerja UMKM Non-Agunan s/d Rp 200 jt</strong></span>
    `,
    subbarRight: `
      <span class="ku-filter-chip">${ic('lock', 11, '#047857')} Persetujuan UU PDP: <strong>Aktif &amp; Terotorisasi</strong></span>
      <span class="e-btn">${ic('refresh', 11, '#334155')} Tarik Ulang SLIK OJK</span>
    `,
    bodyContent: `${filterBar}${mainSplit}`,
    footerRightExtra: 'Inspektor Aktif: UMKM-0841 · Skor 764/850 · DSCR 2,1x',
  });
}

// ============================================================================
// PAGE 3: ARSITEKTUR LAKEHOUSE MEDALLION & KONTRAK SQL/dbt
// ============================================================================
function renderPage3() {
  const kpiStrip = `<section class="ku-kpi-grid" style="grid-template-columns:repeat(4,1fr);">
    <div class="ku-kpi ku-kpi-accent">
      <div class="ku-kpi-head"><span>Throughput Ingestion Lakehouse</span>${badge('Streaming + CDC', 'accent')}</div>
      <div class="ku-kpi-val">4,82 jt <span style="font-size:11px;font-weight:600;color:#64748b;">baris/hari</span></div>
      <div class="ku-kpi-sub"><span>Webhook QRIS · POS CDC · CoreTax XML</span><span class="mono" style="color:#047857;">Lag 4,2 dtk</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Freshness Feature Store</span>${badge('SLA <15 mnt', 'ok')}</div>
      <div class="ku-kpi-val">6,4 mnt <span style="font-size:11px;font-weight:600;color:#64748b;">p95</span></div>
      <div class="ku-kpi-sub"><span>ClickHouse Cohort + Redis Online Store</span><span class="mono">68 Fitur Aktif</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Kontrak Data dbt &amp; Schema</span>${badge('42 / 42 Lulus', 'ok')}</div>
      <div class="ku-kpi-val">100,0% <span style="font-size:11px;font-weight:600;color:#64748b;">integritas</span></div>
      <div class="ku-kpi-sub"><span>Validasi XML DJP · Cek Token UU PDP</span><span class="mono">Run #8841</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Latensi .NET 9 Decision API</span>${badge('Target <400ms', 'ok')}</div>
      <div class="ku-kpi-val">248 ms <span style="font-size:11px;font-weight:600;color:#64748b;">p95 E2E</span></div>
      <div class="ku-kpi-sub"><span>LightGBM ONNX + SHAP + WORM Hash</span><span class="mono">Uptime 99,98%</span></div>
    </div>
  </section>`;

  // Custom Vector SVG Medallion Lakehouse Lineage DAG (1500 x 308)
  const medallionDagSvg = `<svg viewBox="0 0 1500 306" width="100%" height="294" style="display:block;">
    <!-- 4 Medallion Column Zones -->
    <rect x="6" y="6" width="332" height="294" rx="4" fill="#fffbeb" stroke="#fde68a" stroke-width="1" />
    <rect x="368" y="6" width="342" height="294" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <rect x="740" y="6" width="360" height="294" rx="4" fill="#eff4ff" stroke="#bfdbfe" stroke-width="1" />
    <rect x="1130" y="6" width="364" height="294" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1" />

    <!-- Column Headers -->
    <rect x="6" y="6" width="332" height="26" rx="4" fill="#fef3c7" />
    <text x="18" y="23" font-size="10.5" font-weight="800" fill="#92400e">BRONZE · KONEKTOR DATA TEROTORISASI</text>
    <text x="326" y="23" text-anchor="end" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#b45309">mTLS + UU PDP</text>

    <rect x="368" y="6" width="342" height="26" rx="4" fill="#e2e8f0" />
    <text x="380" y="23" font-size="10.5" font-weight="800" fill="#334155">SILVER · PEMBERSIHAN &amp; TOKENISASI</text>
    <text x="698" y="23" text-anchor="end" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#475569">dbt Staging</text>

    <rect x="740" y="6" width="360" height="26" rx="4" fill="#dbeafe" />
    <text x="752" y="23" font-size="10.5" font-weight="800" fill="#172554">GOLD · FEATURE STORE &amp; CLICKHOUSE</text>
    <text x="1088" y="23" text-anchor="end" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#1e3a8a">Mart Analitik</text>

    <rect x="1130" y="6" width="364" height="26" rx="4" fill="#d1fae5" />
    <text x="1142" y="23" font-size="10.5" font-weight="800" fill="#065f46">SERVING · SCORER &amp; DECISION API</text>
    <text x="1482" y="23" text-anchor="end" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#047857">.NET 9 + ONNX</text>

    <!-- Connector Paths (Bronze -> Silver) -->
    <path d="M 324 72 C 352 72, 354 84, 384 84" fill="none" stroke="#1e3a8a" stroke-width="1.8" />
    <path d="M 324 136 C 354 136, 354 92, 384 92" fill="none" stroke="#64748b" stroke-width="1.4" />
    <path d="M 324 200 C 354 200, 354 166, 384 166" fill="none" stroke="#1e3a8a" stroke-width="1.8" />
    <path d="M 324 262 C 354 262, 354 248, 384 248" fill="none" stroke="#1e3a8a" stroke-width="1.8" />

    <!-- Connector Paths (Silver -> Gold) -->
    <path d="M 694 88 C 724 88, 724 92, 756 92" fill="none" stroke="#1e3a8a" stroke-width="2" />
    <path d="M 694 98 C 724 98, 724 248, 756 248" fill="none" stroke="#0369a1" stroke-width="1.4" stroke-dasharray="4,3" />
    <path d="M 694 168 C 724 168, 724 104, 756 104" fill="none" stroke="#1e3a8a" stroke-width="2" />
    <path d="M 694 248 C 724 248, 724 176, 756 176" fill="none" stroke="#1e3a8a" stroke-width="1.8" />
    <path d="M 694 240 C 724 240, 724 114, 756 114" fill="none" stroke="#64748b" stroke-width="1.3" />

    <!-- Connector Paths (Gold -> Serving) -->
    <path d="M 1084 100 C 1114 100, 1114 88, 1146 88" fill="none" stroke="#1e3a8a" stroke-width="2" />
    <path d="M 1084 176 C 1114 176, 1114 168, 1146 168" fill="none" stroke="#047857" stroke-width="1.8" />
    <path d="M 1084 248 C 1114 248, 1114 248, 1146 248" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="4,3" />
    <path d="M 1315 120 L 1315 138" fill="none" stroke="#047857" stroke-width="1.8" />
    <path d="M 1315 200 L 1315 218" fill="none" stroke="#047857" stroke-width="1.8" />

    <!-- BRONZE NODES -->
    <g transform="translate(20,44)">
      <rect width="304" height="52" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1.2" />
      <rect width="4" height="52" rx="1" fill="#d97706" />
      <text x="12" y="18" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">raw_qris_settlement_webhook</text>
      <text x="12" y="33" font-size="9.4" fill="#475569">Acquirer QRIS BI-SNAP · 3,42 jt trx/hari</text>
      <text x="12" y="46" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">AKTIF · Lag 3,1 dtk · NMID Terizin</text>
    </g>
    <g transform="translate(20,108)">
      <rect width="304" height="52" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.1" />
      <rect width="4" height="52" rx="1" fill="#d97706" />
      <text x="12" y="18" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">raw_pos_kasir_edc_cdc</text>
      <text x="12" y="33" font-size="9.4" fill="#475569">Moka · Majoo · Pawoon CDC · 1,24 jt/hari</text>
      <text x="12" y="46" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">AKTIF · Kafka Debezium · JSONB</text>
    </g>
    <g transform="translate(20,172)">
      <rect width="304" height="52" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1.2" />
      <rect width="4" height="52" rx="1" fill="#d97706" />
      <text x="12" y="18" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">raw_coretax_efaktur_xml</text>
      <text x="12" y="33" font-size="9.4" fill="#475569">SPT Masa PPN &amp; Faktur Keluaran DJP XML</text>
      <text x="12" y="46" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">AKTIF · 149.760 XML · Tanda Tangan Valid</text>
    </g>
    <g transform="translate(20,236)">
      <rect width="304" height="52" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1.2" />
      <rect width="4" height="52" rx="1" fill="#d97706" />
      <text x="12" y="18" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">raw_ojk_slik_ideb_json</text>
      <text x="12" y="33" font-size="9.4" fill="#475569">OJK SLIK iDeb API · Riwayat 24 Bulan</text>
      <text x="12" y="46" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">AKTIF · 28.910 Fasilitas · OAuth2 mTLS</text>
    </g>

    <!-- SILVER NODES -->
    <g transform="translate(384,56)">
      <rect width="310" height="64" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1.2" />
      <rect width="4" height="64" rx="1" fill="#475569" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">stg_qris_daily_ledger</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Deduplikasi settlement, filter transaksi sendiri,</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">deteksi anomali refund &amp; hitung pembeli unik</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">4,82 jt baris · 8 tes dbt LULUS</text>
    </g>
    <g transform="translate(384,136)">
      <rect width="310" height="64" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1.2" />
      <rect width="4" height="64" rx="1" fill="#475569" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">stg_coretax_ppn_reconciled</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Validasi hash XML DJP, rekonsiliasi omzet DPP</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">vs mutasi QRIS &amp; konsentrasi NPWP pemasok</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">149.760 SPT · 12/12 masa pajak terverifikasi</text>
    </g>
    <g transform="translate(384,216)">
      <rect width="310" height="64" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1.2" />
      <rect width="4" height="64" rx="1" fill="#475569" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">stg_slik_debt_obligations</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Normalisasi KUR, KMK, multifinance &amp; P2P;</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">tokenisasi NIK/NPWP sesuai UU PDP Ps. 20</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">28.910 rekening · PII Terenkripsi AES-256</text>
    </g>

    <!-- GOLD NODES (Highlighted active inspected model) -->
    <g transform="translate(756,56)">
      <rect width="328" height="72" rx="3" fill="#1e3a8a" stroke="#172554" stroke-width="1.6" />
      <text x="12" y="19" font-size="10.5" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">gold_umkm_cashflow_features</text>
      <rect x="242" y="8" width="76" height="15" rx="2" fill="#2563eb" />
      <text x="280" y="18.5" text-anchor="middle" font-size="8.4" font-weight="700" fill="#ffffff">DIINSPEKSI</text>
      <text x="12" y="36" font-size="9.5" fill="#dbeafe">68 fitur arus kas: CV 12B, trend YoY, rasio repeat</text>
      <text x="12" y="49" font-size="9.5" fill="#dbeafe">pembeli QRIS, ketepatan SPT PPN &amp; HHI pemasok</text>
      <text x="12" y="64" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#93c5fd">ClickHouse + Postgres · 12.480 merchant · 184 ms</text>
    </g>
    <g transform="translate(756,142)">
      <rect width="328" height="64" rx="3" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2" />
      <rect width="4" height="64" rx="1" fill="#1e3a8a" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">gold_dscr_stress_matrix</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Proyeksi CFADS haircut 10%, rekonsiliasi angsuran</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">SLIK eksisting + simulasi 6 skenario stres</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#1e3a8a">Matriks 12.480 x 6 skenario · Covenant >=1,25x</text>
    </g>
    <g transform="translate(756,220)">
      <rect width="328" height="62" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="1.2" />
      <rect width="4" height="62" rx="1" fill="#b45309" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">gold_ews_velocity_signals</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Deteksi penurunan rata-rata QRIS 14h vs 90h</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">&amp; alert anomali kolektibilitas SLIK</text>
      <text x="12" y="59" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#b45309">184 alert aktif · ClickHouse Materialized View</text>
    </g>

    <!-- SERVING NODES -->
    <g transform="translate(1146,56)">
      <rect width="334" height="64" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.3" />
      <rect width="4" height="64" rx="1" fill="#047857" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">lgbm_credit_scorer_v432</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">Python LightGBM ONNX + TreeSHAP Explainer</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">Skor 300–850 · Gini 0,72 · PSI 0,09</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">Inferensi 54 ms · 4 Faktor Memo Transparan</text>
    </g>
    <g transform="translate(1146,138)">
      <rect width="334" height="62" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.3" />
      <rect width="4" height="62" rx="1" fill="#047857" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">dotnet9_decision_api</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">.NET 9 Minimal API · Policy Engine Limit &amp; DSCR</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">Generasi Memo Kredit + Tanda Tangan WORM</text>
      <text x="12" y="59" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#047857">p95 248 ms · 0 Error 5xx · mTLS Core Banking</text>
    </g>
    <g transform="translate(1146,218)">
      <rect width="334" height="64" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.2" />
      <rect width="4" height="64" rx="1" fill="#0369a1" />
      <text x="12" y="19" font-size="10.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">bi_underwriting_ews_hub</text>
      <text x="12" y="35" font-size="9.5" fill="#475569">React BI Analyst Desk · Komite Kredit BPD</text>
      <text x="12" y="48" font-size="9.5" fill="#475569">Notifikasi EWS RM &amp; Pelaporan RegTech OJK</text>
      <text x="12" y="60" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">152 Cabang Aktif · 418 Analis Kredit</text>
    </g>
  </svg>`;

  const sqlLines = [
    `<span class="cm">-- dbt model: gold_umkm_cashflow_features | owner: risk-data-eng | contract: enforced</span>`,
    `<span class="kw">WITH</span> qris_12m <span class="kw">AS</span> (`,
    `  <span class="kw">SELECT</span> merchant_id, <span class="fn">AVG</span>(monthly_omzet_rp) <span class="kw">AS</span> avg_omzet_rp,`,
    `         <span class="fn">STDDEV_POP</span>(monthly_omzet_rp) / <span class="fn">NULLIF</span>(<span class="fn">AVG</span>(monthly_omzet_rp), <span class="num-tok">0</span>) <span class="kw">AS</span> cv_12m,`,
    `         <span class="fn">COUNT</span>(<span class="kw">DISTINCT</span> buyer_hash) <span class="kw">AS</span> active_buyers_12m`,
    `  <span class="kw">FROM</span> {{ ref(<span class="str">'stg_qris_daily_ledger'</span>) }}`,
    `  <span class="kw">WHERE</span> settlement_date &gt;= <span class="fn">CURRENT_DATE</span> - <span class="kw">INTERVAL</span> <span class="str">'12 months'</span> <span class="kw">AND</span> is_self_transfer = <span class="kw">FALSE</span>`,
    `  <span class="kw">GROUP BY</span> <span class="num-tok">1</span>`,
    `), coretax_ppn <span class="kw">AS</span> (`,
    `  <span class="kw">SELECT</span> merchant_id, <span class="fn">COUNT</span>(*) <span class="kw">FILTER</span> (<span class="kw">WHERE</span> is_ontime_spt) <span class="kw">AS</span> spt_ontime_12m,`,
    `         <span class="fn">SUM</span>(top2_supplier_dpp) / <span class="fn">NULLIF</span>(<span class="fn">SUM</span>(total_input_dpp), <span class="num-tok">0</span>) <span class="kw">AS</span> supplier_top2_share`,
    `  <span class="kw">FROM</span> {{ ref(<span class="str">'stg_coretax_ppn_reconciled'</span>) }} <span class="kw">WHERE</span> xml_sig_djp_valid = <span class="kw">TRUE</span> <span class="kw">GROUP BY</span> <span class="num-tok">1</span>`,
    `)`,
    `<span class="kw">SELECT</span> q.merchant_id, q.avg_omzet_rp, <span class="fn">ROUND</span>(q.cv_12m, <span class="num-tok">2</span>) <span class="kw">AS</span> cv_12m, q.active_buyers_12m,`,
    `       c.spt_ontime_12m, <span class="fn">ROUND</span>(c.supplier_top2_share * <span class="num-tok">100</span>, <span class="num-tok">1</span>) <span class="kw">AS</span> supplier_conc_pct,`,
    `       s.max_kolektibilitas_24m, s.existing_debt_service_rp,`,
    `       <span class="fn">ROUND</span>((q.avg_omzet_rp * <span class="num-tok">0.2157</span>) / <span class="fn">NULLIF</span>(s.existing_debt_service_rp, <span class="num-tok">0</span>), <span class="num-tok">2</span>) <span class="kw">AS</span> dscr_base,`,
    `       p.consent_token_valid, p.worm_sha256_proof`,
    `<span class="kw">FROM</span> qris_12m q <span class="kw">JOIN</span> coretax_ppn c <span class="kw">USING</span> (merchant_id)`,
    `<span class="kw">JOIN</span> {{ ref(<span class="str">'stg_slik_debt_obligations'</span>) }} s <span class="kw">USING</span> (merchant_id)`,
    `<span class="kw">JOIN</span> {{ ref(<span class="str">'dim_pdp_active_consent'</span>) }} p <span class="kw">USING</span> (merchant_id)`,
    `<span class="kw">WHERE</span> p.consent_token_valid = <span class="kw">TRUE</span> <span class="kw">AND</span> p.expires_at &gt; <span class="fn">NOW</span>()`,
    `<span class="cm">-- Materialized incremental ke ClickHouse Cohort DB + Feast Redis Online Store (SLA &lt;15 mnt)</span>`,
  ];

  const sqlHtml = sqlLines
    .map((line, i) => `<div class="sql-line"><span class="sql-ln">${i + 1}</span><span>${line}</span></div>`)
    .join('');

  const spanSvg = svgSpanWaterfall({ spans: DECISION_SPANS, totalMs: 248, width: 640 });

  const dbtRows = DBT_TESTS.map((t) => `<tr>
    <td class="mono" style="font-weight:600;color:#1e3a8a;">${esc(t.model)}</td>
    <td class="mono" style="font-size:9.6px;color:#334155;">${esc(t.rule)}</td>
    <td class="num mono">${esc(t.rows)}</td>
    <td class="num mono">${esc(t.ms)}</td>
    <td style="text-align:right;">${badge(t.status, t.tone)}</td>
  </tr>`).join('');

  const bottomSplit = `<section style="display:grid;grid-template-columns:1.18fr 1fr;gap:8px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('code', 13, '#1e3a8a')}<span>Inspektor Kontrak SQL/dbt · gold_umkm_cashflow_features.sql</span></div>
        <div style="display:flex;align-items:center;gap:5px;">
          ${badge('schema.yml Enforced', 'ok')}
          ${badge('ClickHouse + PG16', 'info')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <div class="sql-pane">${sqlHtml}</div>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d5dce6;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;">
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('not_null(merchant_id)', 'ok')}
            ${badge('pdp_consent_valid', 'ok')}
            ${badge('cv_12m IN [0..2,5]', 'ok')}
            ${badge('xml_sig_djp_valid', 'ok')}
          </div>
          <span class="mono" style="color:#475569;">Git SHA: 8f4c21a · dbt 1.9</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('zap', 13, '#1e3a8a')}<span>Profil Latensi .NET 9 Decision API &amp; Uji Kualitas Data</span></div>
        ${badge('Total E2E: 248 ms', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div style="padding:8px 11px;border-bottom:1px solid #d5dce6;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:10.2px;font-weight:700;color:#0f172a;">Trace Eksekusi Scoring Real-Time (UMKM-0841 · trc_ku_9814a)</span>
            <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">HTTP 200 · 248 ms</span>
          </div>
          ${spanSvg}
        </div>
        <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-between;">
          <table class="e-table" style="font-size:10px;">
            <colgroup>
              <col style="width:31%;" /><col style="width:36%;" /><col style="width:11%;" /><col style="width:11%;" /><col style="width:11%;" />
            </colgroup>
            <thead>
              <tr><th>Model dbt</th><th>Aturan Kontrak Data</th><th class="num">Baris</th><th class="num">Durasi</th><th style="text-align:right;">Hasil</th></tr>
            </thead>
            <tbody>${dbtRows}</tbody>
          </table>
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:9.6px;color:#475569;">
            <span>Sinkronisasi Feast Online Store: <strong>0 baris ditolak</strong></span>
            <span class="mono">Next dbt Run: 15:30 WIB</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeId: 'p3',
    pageTitle: 'Arsitektur Lakehouse Medallion & Kontrak SQL/dbt',
    subbarLeft: `
      <span class="ku-env-tag">${ic('gitBranch', 11, '#1e3a8a')} LAKEHOUSE CATALOG: KREDITUMKM_PROD</span>
      <span class="ku-filter-chip">Engine: <strong>PostgreSQL 16 + ClickHouse 24.8 + dbt Core</strong></span>
      <span class="ku-filter-chip">Node Terpilih: <strong>gold_umkm_cashflow_features</strong></span>
    `,
    subbarRight: `
      <span class="ku-filter-chip">${ic('checkCircle', 11, '#047857')} <strong>Kontrak Skema: 42/42 Lulus</strong></span>
      <span class="e-btn">${ic('play', 11, '#1e3a8a')} Jalankan dbt Test</span>
    `,
    bodyContent: `
      ${kpiStrip}
      <div class="e-panel" style="height:336px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('gitBranch', 13, '#1e3a8a')}<span>Silsilah Data Medallion (Bronze → Silver → Gold → Feature Store &amp; .NET 9 Scorer)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('13 Node Aktif', 'neutral')}
            ${badge('Zero PII Egress', 'ok')}
            ${badge('Lineage Terverifikasi', 'accent')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:4px 9px;">${medallionDagSvg}</div>
      </div>
      ${bottomSplit}
    `,
    footerRightExtra: 'Medallion DAG: 13 Node · 42 Kontrak dbt Lulus',
  });
}

// ============================================================================
// PAGE 4: LABORATORIUM STRES DSCR & SIMULATOR KOMITE KREDIT
// ============================================================================
function renderPage4() {
  const dealBanner = `<section style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#ffffff;border:1px solid #bfdbfe;border-left:4px solid #1e3a8a;border-radius:3px;padding:7px 12px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:14px;min-width:0;">
      <div>
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="font-size:13px;font-weight:800;color:#0f172a;">TOKO BANGUNAN JAYA · SURABAYA</span>
          ${badge('UMKM-0841', 'accent')}
          ${badge('Skor 764 / 850', 'ok')}
          ${badge('SLIK Kol-1 Lancar', 'ok')}
        </div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">NIB 1204000849122 · NPWP 31.842.190.4-614.000 · BPD Jatim Cabang Darmo · Fasilitas Diajukan: Modal Kerja Produktif</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:14px;flex-shrink:0;">
      <div style="text-align:right;">
        <div style="font-size:9.3px;color:#64748b;">Plafon &amp; Tenor</div>
        <div class="mono" style="font-size:12.5px;font-weight:800;color:#1e3a8a;">Rp 120.000.000 · 12 Bln</div>
      </div>
      <span class="ku-divider-v" style="height:26px;"></span>
      <div style="text-align:right;">
        <div style="font-size:9.3px;color:#64748b;">Suku Bunga Efektif</div>
        <div class="mono" style="font-size:12.5px;font-weight:800;color:#0f172a;">11,50% p.a.</div>
      </div>
      <span class="ku-divider-v" style="height:26px;"></span>
      <div style="text-align:right;">
        <div style="font-size:9.3px;color:#64748b;">Proyeksi DSCR</div>
        <div class="mono" style="font-size:12.5px;font-weight:800;color:#047857;">2,10x <span style="font-size:9.5px;font-weight:600;">(Min 1,25x)</span></div>
      </div>
    </div>
  </section>`;

  const monthlyBarSvg = svgStackedBarChart({
    width: 780,
    height: 262,
    categories: FEATURED.monthlyMonths,
    yMax: 185,
    yFormat: (v) => `Rp ${Math.round(v)}jt`,
    series: [
      { label: 'Settlement QRIS (Rp 668 jt)', color: '#1e3a8a', values: FEATURED.monthlyQrisJt },
      { label: 'POS Kasir & EDC (Rp 548 jt)', color: '#0369a1', values: FEATURED.monthlyPosJt },
      { label: 'e-Faktur CoreTax B2B (Rp 560 jt)', color: '#0d9488', values: FEATURED.monthlyEfakturJt },
    ],
  });

  const middleRow = `<section style="display:grid;grid-template-columns:1.18fr 1fr;gap:8px;height:368px;flex-shrink:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('activity', 13, '#1e3a8a')}<span>Dekomposisi Arus Kas 12 Bulan (Total Rp 1.776 jt · Rata2 Rp 148,0 jt/bln)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('CV 0,14 · Stabil', 'ok')}
          ${badge('12/12 SPT PPN Valid', 'accent')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
        ${monthlyBarSvg}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:7px;border-top:1px solid #e2e8f0;">
          <div><div style="font-size:9.2px;color:#64748b;">Rata-rata Bulanan</div><div class="mono" style="font-size:11.8px;font-weight:800;color:#0f172a;">Rp 148,0 jt</div></div>
          <div><div style="font-size:9.2px;color:#64748b;">Omzet Terendah (Jan)</div><div class="mono" style="font-size:11.8px;font-weight:700;color:#334155;">Rp 134,0 jt</div></div>
          <div><div style="font-size:9.2px;color:#64748b;">Omzet Tertinggi (Apr)</div><div class="mono" style="font-size:11.8px;font-weight:700;color:#047857;">Rp 163,0 jt</div></div>
          <div><div style="font-size:9.2px;color:#64748b;">Rasio Transaksi Digital</div><div class="mono" style="font-size:11.8px;font-weight:800;color:#1e3a8a;">68,5% <span style="font-size:9px;color:#64748b;">QRIS+POS</span></div></div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#1e3a8a')}<span>Rekonsiliasi CFADS &amp; Kewajiban OJK SLIK (Per Bulan)</span></div>
        ${badge('iDeb 22 Nov 2026', 'info')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.4px;">
          <colgroup>
            <col style="width:52%;" /><col style="width:18%;" /><col style="width:30%;" />
          </colgroup>
          <thead>
            <tr><th>Komponen Arus Kas &amp; Kewajiban</th><th class="num">Rasio</th><th class="num">Nilai / Bulan</th></tr>
          </thead>
          <tbody>
            <tr><td style="font-weight:700;">Omzet Terverifikasi (QRIS + POS + e-Faktur)</td><td class="num mono">100,0%</td><td class="num mono" style="font-weight:700;">${fmtIdr(FEATURED.omzetRp)}</td></tr>
            <tr><td style="color:#475569;">(-) HPP Material &amp; Biaya Operasional</td><td class="num mono">76,0%</td><td class="num mono" style="color:#be123c;">(${fmtIdr(FEATURED.hppOpexRp)})</td></tr>
            <tr><td style="font-weight:700;">Arus Kas Bersih Operasional (EBITDA UMKM)</td><td class="num mono">24,0%</td><td class="num mono" style="font-weight:700;">${fmtIdr(FEATURED.kasBersihRp)}</td></tr>
            <tr><td style="color:#475569;">(-) Haircut Konservatif Komite Kredit</td><td class="num mono">10,0%</td><td class="num mono" style="color:#b45309;">(${fmtIdr(FEATURED.haircutRp)})</td></tr>
            <tr style="background:#eff4ff;"><td style="font-weight:800;color:#172554;">CFADS Tersedia untuk Kewajiban Utang</td><td class="num mono" style="font-weight:700;color:#1e3a8a;">21,6%</td><td class="num mono" style="font-weight:800;color:#172554;">${fmtIdr(FEATURED.cfadsRp)}</td></tr>
            <tr><td>Kewajiban SLIK: 1 KUR Aktif Rp 50 jt (Kol-1)</td><td class="num mono">3,1%</td><td class="num mono">${fmtIdr(FEATURED.kurInstallmentRp)}</td></tr>
            <tr><td>Kewajiban Kontraktual Sewa &amp; Pemasok (Eksisting)</td><td class="num mono">5,9%</td><td class="num mono">${fmtIdr(FEATURED.supplierLeaseRp)}</td></tr>
            <tr style="background:#ecfdf5;"><td style="font-weight:700;color:#065f46;">Angsuran Baru KreditUMKM Rp 120 jt (12b · 11,5%)</td><td class="num mono">7,2%</td><td class="num mono" style="font-weight:700;color:#065f46;">${fmtIdr(FEATURED.newLoanInstallmentRp)}</td></tr>
          </tbody>
          <tfoot>
            <tr>
              <td>DSCR Dasar: 2,40x &nbsp;|&nbsp; Proyeksi DSCR Kredit (KUR + Baru)</td>
              <td class="num mono" style="color:#047857;">2,10x</td>
              <td class="num mono">${fmtIdr(FEATURED.projectedCreditRp)} / bln</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:9.7px;color:#475569;">
          <span>Riwayat SLIK 24 Bln: <strong style="color:#047857;">24/24 Kol-1 Lancar · 0 Hari Tunggakan</strong></span>
          <span class="mono">Sisa Baki KUR: Rp 28,4 jt</span>
        </div>
      </div>
    </div>
  </section>`;

  const stressRows = STRESS_SCENARIOS.map((s) => `<tr class="${s.active ? 'is-selected' : s.tone === 'bad' ? 'is-bad' : ''}">
    <td style="font-weight:700;color:#0f172a;">${esc(s.name)}</td>
    <td style="color:#475569;">${esc(s.shock)}</td>
    <td class="num mono">${fmtIdr(s.cfadsRp)}</td>
    <td class="num mono">${fmtIdr(s.debtRp)}</td>
    <td class="num mono" style="font-weight:800;color:${s.tone === 'ok' ? '#047857' : s.tone === 'warn' ? '#b45309' : '#be123c'};">${s.dscr.toFixed(2).replace('.', ',')}x</td>
    <td>${badge(s.cov, s.tone)}</td>
    <td class="mono" style="font-size:9.8px;font-weight:600;">${esc(s.limitRec)}</td>
  </tr>`).join('');

  const supplierRows = FEATURED.suppliers.map((sup) => `<tr>
    <td style="font-weight:600;color:#0f172a;">${esc(sup.name)}</td>
    <td style="color:#475569;">${esc(sup.cat)}</td>
    <td class="mono" style="font-size:9.6px;">${esc(sup.terms)}</td>
    <td>${renderCapacityBar(sup.sharePct, { warnAt: 25, critAt: 40 })}</td>
    <td style="text-align:right;">${badge(sup.risk, sup.tone)}</td>
  </tr>`).join('');

  const bottomRow = `<section style="display:grid;grid-template-columns:1.25fr 1fr;gap:8px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('sliders', 13, '#1e3a8a')}<span>Matriks Uji Stres DSCR &amp; Sensitivitas Covenant Komite</span></div>
        ${badge('6 / 7 Skenario Lulus (>=1,25x)', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.2px;">
          <colgroup>
            <col style="width:20%;" /><col style="width:17%;" /><col style="width:13%;" /><col style="width:13%;" />
            <col style="width:7.5%;" /><col style="width:12.5%;" /><col style="width:17%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Skenario Stres</th><th>Asumsi Guncangan</th><th class="num">CFADS/Bln</th><th class="num">Kewajiban</th>
              <th class="num">DSCR</th><th>Covenant</th><th>Limit Aman</th>
            </tr>
          </thead>
          <tbody>${stressRows}</tbody>
        </table>
        <div style="padding:8px 11px;background:#f8fafc;border-top:1px solid #d5dce6;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          <div style="background:#ffffff;border:1px solid #d5dce6;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#64748b;">Opsi Tenor 6 Bulan</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">Angs Rp 20,7 jt · DSCR 1,26x</div>
            <div style="font-size:9px;color:#64748b;">Terlalu ketat untuk modal kerja</div>
          </div>
          <div style="background:#eff4ff;border:1px solid #1e3a8a;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#1e3a8a;font-weight:700;">Opsi Tenor 12 Bulan (Rekomendasi)</div>
            <div class="mono" style="font-size:11px;font-weight:800;color:#172554;">Angs Rp 10,64 jt · DSCR 2,10x</div>
            <div style="font-size:9px;color:#1e3a8a;">Buffer aman hingga stres -25%</div>
          </div>
          <div style="background:#ffffff;border:1px solid #d5dce6;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.2px;color:#64748b;">Opsi Tenor 18 Bulan</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#047857;">Angs Rp 7,29 jt · DSCR 2,69x</div>
            <div style="font-size:9px;color:#64748b;">Beban bunga total lebih tinggi</div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('alert', 13, '#b45309')}<span>Bedah SIG-04: Konsentrasi Pemasok (68%) &amp; Pembeli QRIS</span></div>
        ${badge('-14 pts · Pantau', 'warn')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.1px;">
          <colgroup>
            <col style="width:33%;" /><col style="width:20%;" /><col style="width:15%;" /><col style="width:20%;" /><col style="width:12%;" />
          </colgroup>
          <thead>
            <tr><th>Pemasok Terverifikasi (e-Faktur Masukan)</th><th>Kategori</th><th>Termin</th><th>Porsi</th><th style="text-align:right;">Risiko</th></tr>
          </thead>
          <tbody>${supplierRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3">Top-2 Distributor Semen (PT Semen Gresik + CV Baja Karya)</td>
              <td class="mono" style="color:#b45309;font-weight:800;">68% dari 100%</td>
              <td style="text-align:right;">${badge('Covenant', 'warn')}</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:8px 10px;background:#ffffff;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Pembeli QRIS Aktif</div>
            <div class="mono" style="font-size:11.5px;font-weight:800;color:#1e3a8a;">412 <span style="font-size:8.8px;color:#047857;">unik</span></div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Repeat Buyer 90h</div>
            <div class="mono" style="font-size:11.5px;font-weight:800;color:#047857;">64,8%</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Rata2 Tiket QRIS</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">Rp 312 rb</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;">
            <div style="font-size:8.8px;color:#64748b;">Top-10 Pembeli</div>
            <div class="mono" style="font-size:11.5px;font-weight:800;color:#047857;">11,2%</div>
          </div>
        </div>
        <div style="padding:7px 10px;background:#fffbeb;border-top:1px solid #fde68a;display:flex;flex-direction:column;gap:3px;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#92400e;">
            <span><strong>Mitigasi Sisi Permintaan (QRIS):</strong> 412 pembeli aktif · Repeat rate 64,8% · Top-10 pembeli hanya 11,2% omzet.</span>
          </div>
          <div style="font-size:9.7px;color:#78350f;">Syarat Pencairan Komite: debitur menambah min. 1 distributor semen cadangan dalam 90 hari pertama (target HHI pemasok &lt;55%).</div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeId: 'p4',
    pageTitle: 'Laboratorium Stres DSCR & Simulator Komite Kredit',
    subbarLeft: `
      <span class="ku-env-tag">${ic('sliders', 11, '#1e3a8a')} SIMULATOR KOMITE KREDIT · UMKM-0841</span>
      <span class="ku-filter-chip">Haircut Arus Kas: <strong>10% Konservatif</strong></span>
      <span class="ku-filter-chip">Batas Covenant BPD: <strong>DSCR &gt;= 1,25x</strong></span>
    `,
    subbarRight: `
      <span class="e-btn">${ic('copy', 11, '#334155')} Salin Ringkasan Komite</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Kunci Rekomendasi Rp 120 jt</span>
    `,
    bodyContent: `${dealBanner}${middleRow}${bottomRow}`,
    footerRightExtra: 'Stres DSCR: Base 2,10x · Stres -25% 1,58x · Lulus Covenant',
  });
}

// ============================================================================
// PAGE 5: TATA KELOLA OJK, PERSETUJUAN UU PDP & AUDIT WORM
// ============================================================================
function renderPage5() {
  const kpiStrip = `<section class="ku-kpi-grid" style="grid-template-columns:repeat(5,1fr);">
    <div class="ku-kpi ku-kpi-accent">
      <div class="ku-kpi-head"><span>Token Consent UU PDP</span>${badge('Ps. 20 Valid', 'ok')}</div>
      <div class="ku-kpi-val">12.480 <span style="font-size:10.5px;font-weight:600;color:#64748b;">aktif</span></div>
      <div class="ku-kpi-sub"><span>100% e-KYC + OTP / BSrE</span><span class="mono">0 Akses Ilegal</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Validasi SLIK OJK iDeb</span>${badge('mTLS OAuth2', 'info')}</div>
      <div class="ku-kpi-val">99,84%</div>
      <div class="ku-kpi-sub"><span>28.910 rekening terekonsiliasi</span><span class="mono">SLA 62 ms</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Stabilitas Model (PSI)</span>${badge('Batas <0,20', 'ok')}</div>
      <div class="ku-kpi-val">0,09 <span style="font-size:10.5px;font-weight:600;color:#047857;">Stabil</span></div>
      <div class="ku-kpi-sub"><span>LightGBM v4.3.2 · Gini 0,72</span><span class="mono">KS 0,55</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Pencabutan Hak Data</span>${badge('SLA <24 Jam', 'ok')}</div>
      <div class="ku-kpi-val">14 <span style="font-size:10.5px;font-weight:600;color:#64748b;">bln ini</span></div>
      <div class="ku-kpi-sub"><span>Auto-purge Feature Store</span><span class="mono">Rata2 11 mnt</span></div>
    </div>
    <div class="ku-kpi">
      <div class="ku-kpi-head"><span>Jejak Audit WORM</span>${badge('SHA-256 Lock', 'ok')}</div>
      <div class="ku-kpi-val">1,42 jt <span style="font-size:10.5px;font-weight:600;color:#64748b;">entri</span></div>
      <div class="ku-kpi-sub"><span>Retensi 10 Thn POJK 11/2022</span><span class="mono">0 Anomali</span></div>
    </div>
  </section>`;

  const consentRows = CONSENT_LEDGER.map((c) => `<tr>
    <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(c.id)}</td>
    <td style="font-weight:600;color:#0f172a;">${esc(c.merchant)}</td>
    <td class="mono" style="font-size:9.5px;color:#334155;">${esc(c.scope)}</td>
    <td style="color:#475569;">${esc(c.method)}</td>
    <td class="mono" style="font-size:9.6px;">${esc(c.expiry)}</td>
    <td>${badge(c.status, c.tone)}</td>
    <td class="mono" style="font-size:9.4px;color:#64748b;text-align:right;">${esc(c.hash)}</td>
  </tr>`).join('');

  const driftChart = svgMultiLineChart({
    width: 575,
    height: 214,
    xLabels: MODEL_DRIFT.labels,
    yMin: 0,
    yMax: 0.85,
    yTicks: 5,
    yFormat: (v) => v.toFixed(2).replace('.', ','),
    series: [
      { label: 'Gini Coefficient (Target >=0,60)', color: '#1e3a8a', values: MODEL_DRIFT.gini, dots: true, width: 2 },
      { label: 'KS Statistic (Target >=0,45)', color: '#047857', values: MODEL_DRIFT.ks, dots: true, width: 1.8 },
      { label: 'PSI Drift Index (Batas 0,20)', color: '#b45309', values: MODEL_DRIFT.psi, area: true, width: 1.8 },
    ],
    threshold: { value: 0.20, label: 'Batas Drift PSI 0,20 (Retrain)', color: '#be123c' },
  });

  const consentActive = CONSENT_LEDGER.filter((c) => c.status === 'Aktif').length;
  const consentWarn = CONSENT_LEDGER.filter((c) => c.tone === 'warn').length;
  const consentRevoked = CONSENT_LEDGER.filter((c) => c.tone === 'bad').length;

  const middleRow = `<section style="display:grid;grid-template-columns:1.42fr 1fr;gap:8px;height:404px;flex-shrink:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('lock', 13, '#1e3a8a')}<span>Buku Besar Persetujuan Pemilik Data (Consent Ledger UU PDP Ps. 20)</span></div>
        <div style="display:flex;align-items:center;gap:5px;">
          ${badge(`${consentActive} Aktif · ${consentWarn} Perbarui · ${consentRevoked} Dicabut`, 'neutral')}
          ${badge('Enkripsi AES-256-GCM', 'ok')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.1px;">
          <colgroup>
            <col style="width:9.5%;" /><col style="width:22.5%;" /><col style="width:20.5%;" /><col style="width:14.5%;" />
            <col style="width:10.5%;" /><col style="width:10.5%;" /><col style="width:12%;" />
          </colgroup>
          <thead>
            <tr>
              <th>ID Token</th><th>Subjek Data UMKM</th><th>Cakupan Data Terizin</th><th>Otentikasi</th>
              <th>Berlaku s/d</th><th>Status</th><th style="text-align:right;">Hash WORM</th>
            </tr>
          </thead>
          <tbody>${consentRows}</tbody>
        </table>
        <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d5dce6;display:flex;align-items:center;justify-content:space-between;font-size:9.7px;color:#475569;">
          <span>Hak Penghapusan (UU PDP Ps. 43): Pencabutan token otomatis menghentikan tarikan QRIS/CoreTax dalam &lt;15 menit.</span>
          <span class="mono" style="color:#1e3a8a;font-weight:700;">DPO BPD Terverifikasi</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('activity', 13, '#1e3a8a')}<span>Model Risk Management · LightGBM v4.3.2 &amp; Drift PSI</span></div>
        ${badge('Champion Aktif', 'accent')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        ${driftChart}
        <table class="e-table" style="font-size:10px;border:1px solid #e2e8f0;">
          <colgroup>
            <col style="width:30%;" /><col style="width:12%;" /><col style="width:12%;" /><col style="width:12%;" /><col style="width:14%;" /><col style="width:20%;" />
          </colgroup>
          <thead>
            <tr><th>Versi Model</th><th class="num">Gini</th><th class="num">KS</th><th class="num">PSI</th><th class="num">ECE</th><th style="text-align:right;">Status</th></tr>
          </thead>
          <tbody>
            <tr class="is-selected">
              <td class="mono" style="font-weight:700;">lgbm-v4.3.2</td>
              <td class="num mono" style="font-weight:700;">0,72</td>
              <td class="num mono">0,55</td>
              <td class="num mono" style="color:#047857;font-weight:700;">0,09</td>
              <td class="num mono">0,018</td>
              <td style="text-align:right;">${badge('Champion', 'ok')}</td>
            </tr>
            <tr>
              <td class="mono">lgbm-v4.4.0-rc2</td>
              <td class="num mono">0,74</td>
              <td class="num mono">0,56</td>
              <td class="num mono">0,08</td>
              <td class="num mono">0,015</td>
              <td style="text-align:right;">${badge('Shadow 10%', 'info')}</td>
            </tr>
            <tr>
              <td class="mono">logit-fallback-v2</td>
              <td class="num mono">0,58</td>
              <td class="num mono">0,42</td>
              <td class="num mono">0,12</td>
              <td class="num mono">0,031</td>
              <td style="text-align:right;">${badge('Fallback', 'neutral')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>`;

  const regRows = REG_CONTROLS.map((r) => `<tr>
    <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(r.code)}</td>
    <td style="font-weight:600;color:#0f172a;">${esc(r.title)}</td>
    <td style="color:#475569;">${esc(r.freq)}</td>
    <td class="num mono" style="font-weight:700;color:#047857;">${esc(r.score)}</td>
    <td style="text-align:right;">${badge(r.status, r.tone)}</td>
  </tr>`).join('');

  const wormRows = WORM_LOGS.map((w) => `<div class="worm-row">
    <span style="color:#64748b;width:58px;flex-shrink:0;">${esc(w.ts)}</span>
    <span style="color:#93c5fd;width:106px;flex-shrink:0;" class="trunc">${esc(w.actor)}</span>
    <span style="color:${w.event.includes('ALERT') || w.event.includes('REVOKE') ? '#fcd34d' : '#6ee7b7'};font-weight:700;width:112px;flex-shrink:0;">${esc(w.event)}</span>
    <span style="color:#ffffff;font-weight:700;width:72px;flex-shrink:0;">${esc(w.ref)}</span>
    <span style="color:#cbd5e1;flex:1;" class="trunc">${esc(w.detail)}</span>
    <span style="color:#94a3b8;flex-shrink:0;">${esc(w.hash)}</span>
  </div>`).join('');

  const bottomRow = `<section style="display:grid;grid-template-columns:0.94fr 1.06fr;gap:8px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#1e3a8a')}<span>Matriks Kepatuhan Regulasi (POJK, UU PDP, SLIK &amp; CoreTax)</span></div>
        ${badge('8 / 8 Kontrol Patuh', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.1px;">
          <colgroup>
            <col style="width:18%;" /><col style="width:43%;" /><col style="width:19%;" /><col style="width:10%;" /><col style="width:10%;" />
          </colgroup>
          <thead>
            <tr><th>Standar</th><th>Kontrol Kepatuhan &amp; Integrasi</th><th>Verifikasi</th><th class="num">Skor</th><th style="text-align:right;">Status</th></tr>
          </thead>
          <tbody>${regRows}</tbody>
        </table>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d5dce6;display:flex;align-items:center;justify-content:space-between;font-size:9.7px;color:#475569;">
          <span>Audit Eksternal ISO 27001 &amp; Pengawasan OJK Sandbox: <strong>Lulus Tanpa Temuan Kritis</strong></span>
          <span class="mono">Periode Q4 2026</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('terminal', 13, '#1e3a8a')}<span>Jejak Audit Keputusan Kredit Immutable (WORM SHA-256 Chain)</span></div>
        ${badge('Rantai Hash Terverifikasi', 'ok')}
      </div>
      <div class="e-panel-body-flush">
        <div class="worm-pane">${wormRows}</div>
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d5dce6;display:flex;align-items:center;justify-content:space-between;font-size:9.7px;color:#475569;">
          <span>Penyimpanan: <strong>S3 Object Lock Compliance Mode (DCI Jakarta JK5)</strong> · Retensi 10 Tahun</span>
          <span class="mono" style="color:#047857;font-weight:700;">Merkle Root: 0x9a2f8c...e71b</span>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeId: 'p5',
    pageTitle: 'Tata Kelola OJK, Persetujuan UU PDP & Audit WORM',
    subbarLeft: `
      <span class="ku-env-tag">${ic('shield', 11, '#1e3a8a')} TATA KELOLA REGTECH · POJK FINTECH &amp; UU PDP</span>
      <span class="ku-filter-chip">Residency Data: <strong>100% Indonesia (DCI JK5 + DRC Surabaya)</strong></span>
      <span class="ku-filter-chip">Audit Trail: <strong>WORM SHA-256 Chained</strong></span>
    `,
    subbarRight: `
      <span class="ku-filter-chip">${ic('checkCircle', 11, '#047857')} <strong>Bias Lintas Provinsi: Terkendali (&lt;2%)</strong></span>
      <span class="e-btn">${ic('download', 11, '#334155')} Unduh Paket Audit OJK</span>
    `,
    bodyContent: `${kpiStrip}${middleRow}${bottomRow}`,
    footerRightExtra: 'UU PDP Consent: 12.480 Aktif · WORM Chain Valid',
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
