import {
  esc,
  fmtNum,
  fmtIdr,
  fmtPct,
  ic,
  badge,
  wrapEnterpriseHtml,
  renderStatusFooter,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSparkline,
  svgStackedBarChart,
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-020',
  name: 'RemitNusa Nexus',
  reference: 'Adyen Treasury + Stripe Sigma + BIS Nexus Clearing Console',
  persona: 'R. Kusuma · Kepala Operasi Remitansi & Likuiditas · RemitNusa Switch',
  pages: [
    { slug: 'p1', title: 'Ikhtisar Koridor & Kuotasi FX Real-Time' },
    { slug: 'p2', title: 'Buku Besar Transaksi & Inspektor BI-FAST' },
    { slug: 'p3', title: 'Likuiditas Prefund & Rekonsiliasi Multi-Mata Uang' },
    { slug: 'p4', title: 'Skrining AML/OFAC & Pelaporan PPATK IFTI' },
    { slug: 'p5', title: 'Topologi ISO 20022 & Telemetri Rel BI-FAST' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const CORRIDORS = [
  {
    code: 'SG-ID',
    pair: 'SGD/IDR',
    country: 'Singapura',
    ccy: 'SGD',
    mto: 'Singtel Dash · DBS Remit',
    midRate: 11893,
    quoteRate: 11840,
    spreadPct: 0.45,
    feeMto: 'SGD 1,50',
    tx24h: 2840,
    volIdr: 16046000000,
    avgSec: 3.8,
    matchPct: 99.2,
    amlHold: 0,
    prefundAvailIdr: 4820000000,
    prefundUsedIdr: 2180000000,
    status: 'Aktif · BI-FAST',
    tone: 'ok',
  },
  {
    code: 'MY-ID',
    pair: 'MYR/IDR',
    country: 'Malaysia',
    ccy: 'MYR',
    mto: 'Merchantrade · TNG Remit',
    midRate: 3601,
    quoteRate: 3585,
    spreadPct: 0.44,
    feeMto: 'MYR 5,00',
    tx24h: 2610,
    volIdr: 11223000000,
    avgSec: 4.1,
    matchPct: 98.9,
    amlHold: 1,
    prefundAvailIdr: 3640000000,
    prefundUsedIdr: 1760000000,
    status: 'Aktif · 1 Tahan',
    tone: 'warn',
  },
  {
    code: 'HK-ID',
    pair: 'HKD/IDR',
    country: 'Hong Kong',
    ccy: 'HKD',
    mto: 'TNG FinTech · WeChat Remit',
    midRate: 2042,
    quoteRate: 2033,
    spreadPct: 0.44,
    feeMto: 'HKD 15,00',
    tx24h: 1590,
    volIdr: 7632000000,
    avgSec: 4.3,
    matchPct: 99.1,
    amlHold: 0,
    prefundAvailIdr: 2480000000,
    prefundUsedIdr: 1120000000,
    status: 'Aktif · BI-FAST',
    tone: 'ok',
  },
  {
    code: 'TW-ID',
    pair: 'TWD/IDR',
    country: 'Taiwan',
    ccy: 'TWD',
    mto: 'QuickPay TW · EEC Remit',
    midRate: 492.3,
    quoteRate: 490.0,
    spreadPct: 0.47,
    feeMto: 'TWD 90',
    tx24h: 1420,
    volIdr: 8236000000,
    avgSec: 4.6,
    matchPct: 98.2,
    amlHold: 1,
    prefundAvailIdr: 2210000000,
    prefundUsedIdr: 1290000000,
    status: 'Aktif · 1 Tahan',
    tone: 'warn',
  },
  {
    code: 'JP-ID',
    pair: 'JPY/IDR',
    country: 'Jepang',
    ccy: 'JPY',
    mto: 'SBI Remit · Kyodai Remit',
    midRate: 104.5,
    quoteRate: 104.0,
    spreadPct: 0.48,
    feeMto: 'JPY 460',
    tx24h: 1020,
    volIdr: 5483000000,
    avgSec: 4.5,
    matchPct: 99.0,
    amlHold: 0,
    prefundAvailIdr: 1700000000,
    prefundUsedIdr: 850000000,
    status: 'Aktif · BI-FAST',
    tone: 'ok',
  },
];

const BANK_RAILS = [
  { bank: 'Bank BRI', bic: 'BRINIDJA', regions: 'Indramayu, Cilacap, Brebes, Ponorogo', tx: 3620, volIdr: 18420000000, p95Sec: 4.9, successPct: 99.91, color: '#0f52ba' },
  { bank: 'Bank Mandiri', bic: 'BMRIIDJA', regions: 'Blitar, Malang, Lampung, Medan', tx: 2180, volIdr: 11680000000, p95Sec: 5.1, successPct: 99.89, color: '#1d4ed8' },
  { bank: 'Bank BNI', bic: 'BNINIDJA', regions: 'Lombok Timur, Mataram, Kupang', tx: 1840, volIdr: 9240000000, p95Sec: 5.4, successPct: 99.84, color: '#0369a1' },
  { bank: 'Bank BCA', bic: 'CENAIDJA', regions: 'Surabaya, Semarang, Jakarta', tx: 1160, volIdr: 6140000000, p95Sec: 4.6, successPct: 99.94, color: '#047857' },
  { bank: 'BSI & BPD Daerah', bic: 'BSMDIDJA', regions: 'Banda Aceh, NTB Syariah, Jatim', tx: 680, volIdr: 3140000000, p95Sec: 6.2, successPct: 99.72, color: '#475569' },
];

const TX_STATUS_SUMMARY = {
  settled: 9376,
  pending: 44,
  amlHold: 2,
  rejectedPreDebit: 58,
};

const PREFUND_POOLS = [
  {
    code: 'LIQ-IDR',
    bank: 'Pool Prefund IDR — Bank Mandiri',
    bic: 'BMRIIDJA',
    acct: '122-00-0948120-7',
    availIdr: 6400000000,
    limitIdr: 8650000000,
    alertAtIdr: 2000000000,
    runwayHr: '34,5 jam',
    status: 'Tersedia',
    tone: 'ok',
  },
  {
    code: 'LIQ-BRI',
    bank: 'Pool Prefund IDR — Bank BRI',
    bic: 'BRINIDJA',
    acct: '0028-01-000841-30-9',
    availIdr: 4150000000,
    limitIdr: 5500000000,
    alertAtIdr: 1500000000,
    runwayHr: '26,2 jam',
    status: 'Tersedia',
    tone: 'ok',
  },
  {
    code: 'LIQ-BNI',
    bank: 'Pool Prefund IDR — Bank BNI',
    bic: 'BNINIDJA',
    acct: '0841-2291-8801',
    availIdr: 2300000000,
    limitIdr: 3000000000,
    alertAtIdr: 1000000000,
    runwayHr: '28,8 jam',
    status: 'Tersedia',
    tone: 'ok',
  },
  {
    code: 'LIQ-BCA',
    bank: 'Pool Prefund IDR — Bank BCA',
    bic: 'CENAIDJA',
    acct: '206-3098-441',
    availIdr: 1480000000,
    limitIdr: 2000000000,
    alertAtIdr: 600000000,
    runwayHr: '31,0 jam',
    status: 'Tersedia',
    tone: 'ok',
  },
  {
    code: 'LIQ-BSI',
    bank: 'Pool Prefund IDR — Bank Syariah Indonesia',
    bic: 'BSMDIDJA',
    acct: '7192-0041-882',
    availIdr: 520000000,
    limitIdr: 850000000,
    alertAtIdr: 500000000,
    runwayHr: '11,4 jam',
    status: 'Siaga Top-Up',
    tone: 'warn',
  },
];

const MTO_VOSTRO = [
  { partner: 'Singtel Dash SG', ccy: 'SGD', balanceCcy: 'SGD 248.400', equivIdr: 2941056000, settledToday: 1620, recon: 'Cocok 0 Selisih', tone: 'ok' },
  { partner: 'DBS Remit SG', ccy: 'SGD', balanceCcy: 'SGD 158.695', equivIdr: 1878944000, settledToday: 1220, recon: 'Cocok 0 Selisih', tone: 'ok' },
  { partner: 'Merchantrade MY', ccy: 'MYR', balanceCcy: 'MYR 1.015.342', equivIdr: 3640000000, settledToday: 2610, recon: 'Cocok 0 Selisih', tone: 'ok' },
  { partner: 'TNG FinTech HK', ccy: 'HKD', balanceCcy: 'HKD 1.219.872', equivIdr: 2480000000, settledToday: 1590, recon: 'Cocok 0 Selisih', tone: 'ok' },
  { partner: 'QuickPay TW', ccy: 'TWD', balanceCcy: 'TWD 4.510.204', equivIdr: 2210000000, settledToday: 1420, recon: '1 Hold AML', tone: 'warn' },
  { partner: 'SBI & Kyodai JP', ccy: 'JPY', balanceCcy: 'JPY 16.346.154', equivIdr: 1700000000, settledToday: 1020, recon: 'Cocok 0 Selisih', tone: 'ok' },
];

const TRANSACTIONS = [
  { code: 'RM-SG01', time: '15:26:48', ccy: 'SGD', foreignAmt: 450, rate: 11840, idrAmt: 5328000, mto: 'Singtel Dash SG', bank: 'BRI · Indramayu', rrn: '2026112088412', nameScore: '100%', dur: '3,8 dtk', status: 'Masuk', tone: 'ok', selected: true },
  { code: 'RM-MY04', time: '15:26:41', ccy: 'MYR', foreignAmt: 1200, rate: 3585, idrAmt: 4302000, mto: 'Merchantrade MY', bank: 'BNI · Lombok Timur', rrn: '2026112088409', nameScore: '100%', dur: '4,1 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-TW09', time: '15:26:33', ccy: 'TWD', foreignAmt: 18000, rate: 490, idrAmt: 8820000, mto: 'QuickPay TW', bank: 'Mandiri · Blitar', rrn: 'HOLD-AML-9041', nameScore: '91,7%', dur: 'Ditahan', status: 'Tinjau AML', tone: 'warn', warn: true },
  { code: 'RM-HK02', time: '15:26:29', ccy: 'HKD', foreignAmt: 2400, rate: 2033, idrAmt: 4879200, mto: 'TNG FinTech HK', bank: 'BRI · Cilacap', rrn: '2026112088404', nameScore: '100%', dur: '4,0 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-JP03', time: '15:26:22', ccy: 'JPY', foreignAmt: 65000, rate: 104, idrAmt: 6760000, mto: 'SBI Remit JP', bank: 'BCA · Surabaya', rrn: '2026112088398', nameScore: '100%', dur: '4,4 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-SG05', time: '15:26:15', ccy: 'SGD', foreignAmt: 620, rate: 11840, idrAmt: 7340800, mto: 'DBS Remit SG', bank: 'Mandiri · Lampung', rrn: '2026112088391', nameScore: '100%', dur: '3,6 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-MY08', time: '15:26:08', ccy: 'MYR', foreignAmt: 850, rate: 3585, idrAmt: 3047250, mto: 'TNG Remit MY', bank: 'BRI · Brebes', rrn: '2026112088385', nameScore: '99,1%', dur: '4,2 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-HK06', time: '15:26:01', ccy: 'HKD', foreignAmt: 3100, rate: 2033, idrAmt: 6302300, mto: 'WeChat Remit HK', bank: 'BRI · Ponorogo', rrn: '2026112088379', nameScore: '100%', dur: '4,1 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-MY18', time: '15:25:54', ccy: 'MYR', foreignAmt: 2000, rate: 3585, idrAmt: 7170000, mto: 'Merchantrade MY', bank: 'BCA · Surabaya', rrn: 'HOLD-AML-9038', nameScore: '98,4%', dur: 'Ditahan', status: 'Tinjau AML', tone: 'warn', warn: true },
  { code: 'RM-TW11', time: '15:25:47', ccy: 'TWD', foreignAmt: 12500, rate: 490, idrAmt: 6125000, mto: 'EEC Remit TW', bank: 'BNI · Malang', rrn: '2026112088371', nameScore: '100%', dur: '4,7 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-JP07', time: '15:25:39', ccy: 'JPY', foreignAmt: 48000, rate: 104, idrAmt: 4992000, mto: 'Kyodai Remit JP', bank: 'Mandiri · Semarang', rrn: '2026112088364', nameScore: '100%', dur: '4,3 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-SG10', time: '15:25:31', ccy: 'SGD', foreignAmt: 380, rate: 11840, idrAmt: 4499200, mto: 'Singtel Dash SG', bank: 'BSI · Banda Aceh', rrn: '2026112088358', nameScore: '100%', dur: '3,9 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-MY12', time: '15:25:24', ccy: 'MYR', foreignAmt: 1500, rate: 3585, idrAmt: 5377500, mto: 'Merchantrade MY', bank: 'NTB Syariah · Mataram', rrn: '2026112088351', nameScore: '98,8%', dur: '4,5 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-HK13', time: '15:25:18', ccy: 'HKD', foreignAmt: 1800, rate: 2033, idrAmt: 3659400, mto: 'TNG FinTech HK', bank: 'BRI · Subang', rrn: '2026112088346', nameScore: '100%', dur: '4,2 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-TW14', time: '15:25:11', ccy: 'TWD', foreignAmt: 9000, rate: 490, idrAmt: 4410000, mto: 'QuickPay TW', bank: 'BRI · Tulungagung', rrn: 'RJCT-ACMT-219', nameScore: '42,0%', dur: '0,7 dtk', status: 'Ditolak Nama', tone: 'bad', bad: true },
  { code: 'RM-JP15', time: '15:25:04', ccy: 'JPY', foreignAmt: 82000, rate: 104, idrAmt: 8528000, mto: 'SBI Remit JP', bank: 'Mandiri · Yogyakarta', rrn: '2026112088338', nameScore: '100%', dur: '4,6 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-SG16', time: '15:24:56', ccy: 'SGD', foreignAmt: 510, rate: 11840, idrAmt: 6038400, mto: 'DBS Remit SG', bank: 'BNI · Cirebon', rrn: '2026112088331', nameScore: '100%', dur: '3,7 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-MY17', time: '15:24:49', ccy: 'MYR', foreignAmt: 940, rate: 3585, idrAmt: 3369900, mto: 'TNG Remit MY', bank: 'Bank Jatim · Banyuwangi', rrn: '2026112088324', nameScore: '100%', dur: '4,0 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-HK19', time: '15:24:41', ccy: 'HKD', foreignAmt: 1500, rate: 2033, idrAmt: 3049500, mto: 'WeChat Remit HK', bank: 'Mandiri · Lampung Timur', rrn: '2026112088318', nameScore: '100%', dur: '4,1 dtk', status: 'Masuk', tone: 'ok' },
  { code: 'RM-JP20', time: '15:24:34', ccy: 'JPY', foreignAmt: 55000, rate: 104, idrAmt: 5720000, mto: 'Kyodai Remit JP', bank: 'BRI · Banyumas', rrn: '2026112088311', nameScore: '100%', dur: '4,4 dtk', status: 'Masuk', tone: 'ok' },
];

const WATERFALL_RM_SG01 = [
  { label: 'MTO ISO-20022 Ingress', start: 0, dur: 140, color: '#0f52ba' },
  { label: 'FX Quote Lock (SGD)', start: 140, dur: 110, color: '#1d4ed8' },
  { label: 'Validasi Nama BI-FAST', start: 250, dur: 680, color: '#0369a1' },
  { label: 'Skrining AML & OFAC', start: 930, dur: 290, color: '#047857' },
  { label: 'Jurnal Ledger Postgres', start: 1220, dur: 180, color: '#475569' },
  { label: 'BI-FAST pacs.008 Settle', start: 1400, dur: 2190, color: '#0f52ba' },
  { label: 'Antrean IFTI & Webhook', start: 3590, dur: 210, color: '#047857' },
];

const LEDGER_ENTRIES = [
  { jrn: 'JRN-261122-9481', time: '15:26:48', ref: 'RM-SG01', drAcct: 'VOSTRO-SINGTEL-SGD', crAcct: 'LIQ-BRI-PREFUND-IDR', src: 'SGD 450,00', drIdr: 5328000, crIdr: 5328000, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9480', time: '15:26:41', ref: 'RM-MY04', drAcct: 'VOSTRO-MERCHANTRADE', crAcct: 'LIQ-BNI-PREFUND-IDR', src: 'MYR 1.200,00', drIdr: 4302000, crIdr: 4302000, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9479', time: '15:26:29', ref: 'RM-HK02', drAcct: 'VOSTRO-TNG-HKD', crAcct: 'LIQ-BRI-PREFUND-IDR', src: 'HKD 2.400,00', drIdr: 4879200, crIdr: 4879200, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9478', time: '15:26:22', ref: 'RM-JP03', drAcct: 'VOSTRO-SBI-JPY', crAcct: 'LIQ-BCA-PREFUND-IDR', src: 'JPY 65.000', drIdr: 6760000, crIdr: 6760000, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9477', time: '15:26:15', ref: 'RM-SG05', drAcct: 'VOSTRO-DBS-SGD', crAcct: 'LIQ-IDR-MANDIRI', src: 'SGD 620,00', drIdr: 7340800, crIdr: 7340800, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9476', time: '15:26:01', ref: 'RM-HK06', drAcct: 'VOSTRO-WECHAT-HKD', crAcct: 'LIQ-BRI-PREFUND-IDR', src: 'HKD 3.100,00', drIdr: 6302300, crIdr: 6302300, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9475', time: '15:25:04', ref: 'RM-JP15', drAcct: 'VOSTRO-SBI-JPY', crAcct: 'LIQ-IDR-MANDIRI', src: 'JPY 82.000', drIdr: 8528000, crIdr: 8528000, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9474', time: '15:10:00', ref: 'SWP-BMRI-04', drAcct: 'TREASURY-MAIN-IDR', crAcct: 'LIQ-IDR-MANDIRI', src: 'RTGS Top-Up', drIdr: 1500000000, crIdr: 1500000000, recon: 'Final BI-RTGS', tone: 'info' },
  { jrn: 'JRN-261122-9473', time: '15:08:12', ref: 'RM-SG16', drAcct: 'VOSTRO-DBS-SGD', crAcct: 'LIQ-BNI-PREFUND-IDR', src: 'SGD 510,00', drIdr: 6038400, crIdr: 6038400, recon: 'Cocok camt.054', tone: 'ok' },
  { jrn: 'JRN-261122-9472', time: '15:04:40', ref: 'SWP-BRI-03', drAcct: 'TREASURY-MAIN-IDR', crAcct: 'LIQ-BRI-PREFUND-IDR', src: 'BI-FAST Sweep', drIdr: 800000000, crIdr: 800000000, recon: 'Final BI-FAST', tone: 'info' },
];

const AML_CASES = [
  { id: 'AML-9041', tx: 'RM-TW09', time: '15:26:33', corridor: 'TW -> Mandiri Blitar', amountIdr: 8820000, trigger: 'Selisih Ejaan Nama (91,7%) + KYC Manual', score: 74, state: 'Tahan Aktif', active: true, tone: 'warn', selected: true },
  { id: 'AML-9038', tx: 'RM-MY18', time: '15:25:54', corridor: 'MY -> BCA Surabaya', amountIdr: 7170000, trigger: 'Structuring 3x < Rp 10 Jt / 4 Jam (Penerima Sama)', score: 86, state: 'Tahan Aktif', active: true, tone: 'bad' },
  { id: 'AML-9034', tx: 'RM-SG88', time: '14:52:19', corridor: 'SG -> BRI Indramayu', amountIdr: 14208000, trigger: 'Verifikasi Sumber Dana Bonus Tahunan PMI', score: 41, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
  { id: 'AML-9029', tx: 'RM-HK74', time: '14:18:05', corridor: 'HK -> BNI Mataram', amountIdr: 6099000, trigger: 'Partial Hit Nama PEP (False Positive Terkonfirmasi)', score: 38, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
  { id: 'AML-9025', tx: 'RM-TW61', time: '13:44:12', corridor: 'TW -> BRI Ponorogo', amountIdr: 9800000, trigger: 'Perbedaan Gelar Tengah Rekening vs Paspor', score: 32, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
  { id: 'AML-9019', tx: 'RM-MY52', time: '12:31:48', corridor: 'MY -> Mandiri Medan', amountIdr: 11472000, trigger: 'Kecocokan DTTOT/OFAC (Ditolak & Lapor LTKM)', score: 96, state: 'Ditolak & STR', active: false, tone: 'bad' },
  { id: 'AML-9014', tx: 'RM-JP41', time: '11:20:09', corridor: 'JP -> BCA Semarang', amountIdr: 12480000, trigger: 'Ambang Transaksi Pertama > Rp 10 Jt', score: 29, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
  { id: 'AML-9008', tx: 'RM-SG31', time: '10:05:33', corridor: 'SG -> BRI Cilacap', amountIdr: 5920000, trigger: 'Koreksi Typo Nama MTO (Re-Inquiry 100%)', score: 24, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
  { id: 'AML-9003', tx: 'RM-HK19', time: '09:14:22', corridor: 'HK -> BNI Kupang', amountIdr: 8132000, trigger: 'Verifikasi Nomor Rekening Baru Keluarga PMI', score: 27, state: 'Dilepas BI-FAST', active: false, tone: 'ok' },
];

const AML_RULES = [
  { code: 'AML-01', name: 'Sanksi OFAC SDN & UNSC Consolidated', engine: 'Fuzzy Jaro-Winkler + Phonetic', hits24h: 1, fpRate: '0,02%', p95Ms: '48 ms', reg: 'POJK 8/2023' },
  { code: 'AML-02', name: 'Daftar DTTOT & PPSPM PPATK Indonesia', engine: 'Exact + Alias Token Match', hits24h: 1, fpRate: '0,01%', p95Ms: '34 ms', reg: 'PerPPATK 1/2021' },
  { code: 'AML-03', name: 'Deteksi Structuring & Smurfing 24 Jam', engine: 'Kafka Sliding Window Graph', hits24h: 4, fpRate: '0,14%', p95Ms: '72 ms', reg: 'UU TPPU Ps. 23' },
  { code: 'AML-04', name: 'Validasi Nama Rekening BI-FAST (acmt.024)', engine: 'Pre-Debit Fuzzy >= 95% Auto', hits24h: 59, fpRate: '0,08%', p95Ms: '680 ms', reg: 'PBI 23/6/2021' },
  { code: 'AML-05', name: 'Pelaporan IFTI Otomatis ke PPATK goAML', engine: 'ISO 20022 -> goAML XML v5.2', hits24h: 9376, fpRate: '0,00%', p95Ms: '185 ms', reg: 'PerPPATK 2/2021' },
  { code: 'AML-06', name: 'Velocity Penerima Baru & Anomali Koridor', engine: 'Redis Rolling Counter 7 Hari', hits24h: 12, fpRate: '0,11%', p95Ms: '26 ms', reg: 'POJK 8/2023' },
];

const IFTI_BATCHES = [
  { batch: 'Batch #01', time: '06:00 WIB', count: 1840, status: 'ACK 200' },
  { batch: 'Batch #02', time: '09:00 WIB', count: 2410, status: 'ACK 200' },
  { batch: 'Batch #03', time: '12:00 WIB', count: 3886, status: 'ACK 200' },
  { batch: 'Batch #04', time: '15:00 WIB', count: 1240, status: 'ACK 200' },
];

const KAFKA_TOPICS = [
  { topic: 'remit.iso20022.ingress', part: 12, tps: '42,8 msg/s', lag: '3 msg', p95: '38 ms', err: '0,00%', state: 'Optimal', tone: 'ok' },
  { topic: 'fx.quote.stream.locked', part: 6, tps: '42,8 msg/s', lag: '0 msg', p95: '19 ms', err: '0,00%', state: 'Optimal', tone: 'ok' },
  { topic: 'bifast.acmt023.namecheck', part: 12, tps: '43,1 msg/s', lag: '4 msg', p95: '680 ms', err: '0,04%', state: 'Optimal', tone: 'ok' },
  { topic: 'aml.screening.realtime', part: 8, tps: '42,8 msg/s', lag: '2 msg', p95: '290 ms', err: '0,00%', state: 'Optimal', tone: 'ok' },
  { topic: 'ledger.postgres.doubleentry', part: 8, tps: '85,6 msg/s', lag: '1 msg', p95: '180 ms', err: '0,00%', state: 'Optimal', tone: 'ok' },
  { topic: 'bifast.pacs008.settlement', part: 12, tps: '42,4 msg/s', lag: '2 msg', p95: '2.190 ms', err: '0,02%', state: 'Optimal', tone: 'ok' },
  { topic: 'ppatk.goaml.ifti.batch', part: 4, tps: '42,4 msg/s', lag: '0 msg', p95: '210 ms', err: '0,00%', state: 'Tersinkron', tone: 'info' },
];

// Computed Totals
const TOTAL_TX = CORRIDORS.reduce((a, c) => a + c.tx24h, 0);
const TOTAL_VOL_IDR = CORRIDORS.reduce((a, c) => a + c.volIdr, 0);
const WEIGHTED_AVG_SEC =
  CORRIDORS.reduce((a, c) => a + c.tx24h * c.avgSec, 0) / TOTAL_TX;
const WEIGHTED_SPREAD_PCT =
  CORRIDORS.reduce((a, c) => a + c.volIdr * c.spreadPct, 0) / TOTAL_VOL_IDR;
const TOTAL_AML_HOLD_COUNT = CORRIDORS.reduce((a, c) => a + c.amlHold, 0);
const TOTAL_PREFUND_AVAIL = PREFUND_POOLS.reduce((a, p) => a + p.availIdr, 0);
const TOTAL_PREFUND_LIMIT = PREFUND_POOLS.reduce((a, p) => a + p.limitIdr, 0);
const TOTAL_PREFUND_PCT = (TOTAL_PREFUND_AVAIL / TOTAL_PREFUND_LIMIT) * 100;
const ACTIVE_AML_CASES = AML_CASES.filter((c) => c.active);
const ACTIVE_AML_SUM_IDR = ACTIVE_AML_CASES.reduce((a, c) => a + c.amountIdr, 0);
const SAMPLE_TX_SUM_IDR = TRANSACTIONS.reduce((a, t) => a + t.idrAmt, 0);
const LEDGER_DR_SUM = LEDGER_ENTRIES.reduce((a, l) => a + l.drIdr, 0);
const LEDGER_CR_SUM = LEDGER_ENTRIES.reduce((a, l) => a + l.crIdr, 0);
const WATERFALL_TOTAL_MS = WATERFALL_RM_SG01.reduce((a, s) => a + s.dur, 0);
const IFTI_BATCH_SUM = IFTI_BATCHES.reduce((a, b) => a + b.count, 0);

export function verifyMath() {
  if (TOTAL_TX !== 9480) throw new Error(`TOTAL_TX mismatch: ${TOTAL_TX}`);
  if (TOTAL_VOL_IDR !== 48620000000) throw new Error(`TOTAL_VOL_IDR mismatch: ${TOTAL_VOL_IDR}`);

  const bankTx = BANK_RAILS.reduce((a, b) => a + b.tx, 0);
  const bankVol = BANK_RAILS.reduce((a, b) => a + b.volIdr, 0);
  if (bankTx !== TOTAL_TX) throw new Error(`BANK_RAILS tx mismatch: ${bankTx} vs ${TOTAL_TX}`);
  if (bankVol !== TOTAL_VOL_IDR) throw new Error(`BANK_RAILS vol mismatch: ${bankVol} vs ${TOTAL_VOL_IDR}`);

  const statusSum =
    TX_STATUS_SUMMARY.settled +
    TX_STATUS_SUMMARY.pending +
    TX_STATUS_SUMMARY.amlHold +
    TX_STATUS_SUMMARY.rejectedPreDebit;
  if (statusSum !== TOTAL_TX) throw new Error(`Status breakdown mismatch: ${statusSum} vs ${TOTAL_TX}`);
  if (IFTI_BATCH_SUM !== TX_STATUS_SUMMARY.settled) {
    throw new Error(`IFTI batch sum mismatch: ${IFTI_BATCH_SUM} vs ${TX_STATUS_SUMMARY.settled}`);
  }

  const corrPrefundSum = CORRIDORS.reduce((a, c) => a + c.prefundAvailIdr, 0);
  const mtoVostroSum = MTO_VOSTRO.reduce((a, m) => a + m.equivIdr, 0);
  if (TOTAL_PREFUND_AVAIL !== 14850000000) throw new Error(`PREFUND_AVAIL mismatch: ${TOTAL_PREFUND_AVAIL}`);
  if (corrPrefundSum !== TOTAL_PREFUND_AVAIL) throw new Error(`Corridor prefund mismatch: ${corrPrefundSum}`);
  if (mtoVostroSum !== TOTAL_PREFUND_AVAIL) throw new Error(`MTO vostro sum mismatch: ${mtoVostroSum}`);
  if (TOTAL_PREFUND_LIMIT !== 20000000000) throw new Error(`PREFUND_LIMIT mismatch: ${TOTAL_PREFUND_LIMIT}`);

  if (TOTAL_AML_HOLD_COUNT !== 2 || ACTIVE_AML_CASES.length !== 2) {
    throw new Error(`AML hold count mismatch: ${TOTAL_AML_HOLD_COUNT} vs ${ACTIVE_AML_CASES.length}`);
  }
  if (ACTIVE_AML_SUM_IDR !== 15990000) throw new Error(`AML active hold sum mismatch: ${ACTIVE_AML_SUM_IDR}`);

  for (const tx of TRANSACTIONS) {
    const calc = Math.round(tx.foreignAmt * tx.rate);
    if (calc !== tx.idrAmt) {
      throw new Error(`FX math mismatch on ${tx.code}: ${tx.foreignAmt} * ${tx.rate} = ${calc} != ${tx.idrAmt}`);
    }
  }

  if (LEDGER_DR_SUM !== LEDGER_CR_SUM) {
    throw new Error(`Double-entry ledger unbalanced: DR=${LEDGER_DR_SUM} CR=${LEDGER_CR_SUM}`);
  }
  if (WATERFALL_TOTAL_MS !== 3800) {
    throw new Error(`Waterfall RM-SG01 total mismatch: ${WATERFALL_TOTAL_MS}`);
  }
}

// ============================================================================
// CUSTOM INSTITUTIONAL TREASURY CSS (SWISS BANKING LIGHT + COBALT NAVY TAPE)
// ============================================================================
const EXTRA_CSS = `
  .rn-header {
    height: 38px;
    background: #0b1c36;
    color: #f8fafc;
    border-bottom: 1px solid #163056;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .rn-h-left, .rn-h-right {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .rn-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .rn-logo-box {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #0f52ba;
    border: 1px solid #3b82f6;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .rn-logo-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
  .rn-logo-sub {
    font-size: 9.5px;
    font-family: var(--e-mono);
    color: #93c5fd;
    padding-left: 8px;
    border-left: 1px solid #24406b;
  }
  .rn-tabs {
    display: flex;
    align-items: stretch;
    height: 38px;
    gap: 2px;
    margin-left: 10px;
  }
  .rn-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    font-size: 11px;
    font-weight: 600;
    color: #cbd5e1;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .rn-tab.is-active {
    color: #ffffff;
    background: #132a4e;
    border-bottom-color: #60a5fa;
  }
  .rn-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4.5px;
    border-radius: 2px;
    background: #1e3a66;
    color: #bfdbfe;
  }
  .rn-tab-cnt.warn {
    background: #78350f;
    color: #fde68a;
  }
  .rn-tab.is-active .rn-tab-cnt {
    background: #0f52ba;
    color: #ffffff;
  }
  .rn-chip-dark {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #132a4e;
    border: 1px solid #24406b;
    color: #e2e8f0;
    font-size: 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .rn-chip-ok {
    background: #052e16;
    border-color: #166534;
    color: #86efac;
  }

  /* Live Institutional FX & Spread Ticker Tape */
  .rn-ticker {
    height: 28px;
    background: #112545;
    border-bottom: 1px solid #0b1c36;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
    font-family: var(--e-mono);
    font-size: 10px;
    color: #e2e8f0;
  }
  .rn-ticker-list {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .rn-tick-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .rn-tick-pair { color: #93c5fd; font-weight: 700; }
  .rn-tick-rate { color: #ffffff; font-weight: 700; }
  .rn-tick-spd { color: #6ee7b7; font-size: 9.5px; }
  .rn-tick-div { color: #33527d; }

  /* Context Action Bar */
  .rn-actionbar {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .rn-ab-left, .rn-ab-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .rn-page-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #0b1c36;
    white-space: nowrap;
  }
  .rn-env-tag {
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 2px;
    background: #e8f0fe;
    color: #0b3d91;
    border: 1px solid #bfdbfe;
    white-space: nowrap;
  }
  .rn-filter-pill {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid var(--e-border);
    background: #f8fafc;
    color: #334155;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .rn-filter-pill.is-on {
    background: #e8f0fe;
    border-color: #93c5fd;
    color: #0b3d91;
  }

  /* Workspace Body */
  .rn-body {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* Institutional KPI cards with top hairline accent */
  .rn-kpi-grid {
    display: grid;
    gap: 8px;
    flex-shrink: 0;
  }
  .rn-kpi {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-top: 2px solid #cbd5e1;
    border-radius: 3px;
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .rn-kpi.accent { border-top-color: #0f52ba; }
  .rn-kpi.ok { border-top-color: #047857; }
  .rn-kpi.warn { border-top-color: #b45309; }
  .rn-kpi.bad { border-top-color: #be123c; }
  .rn-kpi-lbl {
    font-size: 9.8px;
    font-weight: 600;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  .rn-kpi-val {
    font-family: var(--e-mono);
    font-size: 16px;
    font-weight: 700;
    color: #0b1c36;
    letter-spacing: -0.02em;
    line-height: 1.15;
    white-space: nowrap;
  }
  .rn-kpi-sub {
    font-size: 9.6px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    white-space: nowrap;
  }

  /* Dense Key-Value rows inside Inspector */
  .kv-list { display: flex; flex-direction: column; gap: 3px; }
  .kv-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 10.3px;
  }
  .kv-row:last-child { border-bottom: 0; }
  .kv-k { color: #64748b; font-weight: 500; white-space: nowrap; }
  .kv-v { color: #0f172a; font-weight: 600; text-align: right; }

  /* Monospace Code / XML Inspector Surface */
  .xml-box {
    background: #0b1628;
    color: #e2e8f0;
    border: 1px solid #1e3354;
    border-radius: 3px;
    padding: 7px 10px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    line-height: 1.4;
    overflow: hidden;
    white-space: pre;
  }
  .xml-tag { color: #7dd3fc; }
  .xml-attr { color: #fcd34d; }
  .xml-val { color: #86efac; }
  .xml-cmt { color: #64748b; }

  /* ISO Snippet Strip */
  .iso-strip {
    background: #0b1c36;
    color: #e2e8f0;
    border-radius: 3px;
    padding: 6px 9px;
    font-family: var(--e-mono);
    font-size: 9.6px;
    display: flex;
    align-items: center;
    gap: 7px;
    border-left: 3px solid #3b82f6;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Alert Row Cards inside Panel */
  .ops-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    background: #ffffff;
  }
  .ops-row.is-warn {
    background: #fffbeb;
    border-color: #fde68a;
  }

  /* Compact table override for dense financial grids */
  table.e-table.tight td { padding: 3.6px 6px; }
  table.e-table.tight th { padding: 4px 6px; }
  table.e-table.roomy td { padding: 5.4px 7px; }
  table.e-table.roomy th { padding: 5.5px 7px; }
`;

function fmtShortM(n) {
  return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
}

function fmtRate(r) {
  return Number.isInteger(r)
    ? r.toLocaleString('id-ID')
    : r.toFixed(1).replace('.', ',');
}

function renderShell({ activeTab, pageTitle, actionLeftHtml, actionRightHtml, contentHtml }) {
  const tabs = [
    { id: 'p1', label: 'Ikhtisar & FX', icon: 'globe', cnt: '5' },
    { id: 'p2', label: 'Transaksi BI-FAST', icon: 'activity', cnt: fmtNum(TOTAL_TX) },
    { id: 'p3', label: 'Likuiditas & Prefund', icon: 'layers', cnt: '74,3%' },
    { id: 'p4', label: 'AML & PPATK IFTI', icon: 'shield', cnt: String(TOTAL_AML_HOLD_COUNT), warn: true },
    { id: 'p5', label: 'Pipeline ISO 20022', icon: 'gitBranch', cnt: '99,8%' },
  ];

  const headerHtml = `<header class="rn-header">
    <div class="rn-h-left">
      <div class="rn-logo">
        <span class="rn-logo-box">RN</span>
        <span class="rn-logo-title">RemitNusa Nexus</span>
        <span class="rn-logo-sub">BI-FAST · BIS NEXUS SWITCH</span>
      </div>
      <nav class="rn-tabs">
        ${tabs
          .map(
            (t) => `<div class="rn-tab ${t.id === activeTab ? 'is-active' : ''}">
              ${ic(t.icon, 12, t.id === activeTab ? '#93c5fd' : '#94a3b8')}
              <span>${esc(t.label)}</span>
              <span class="rn-tab-cnt ${t.warn ? 'warn' : ''}">${esc(t.cnt)}</span>
            </div>`
          )
          .join('')}
      </nav>
    </div>
    <div class="rn-h-right">
      <div class="rn-chip-dark rn-chip-ok">
        <span class="dot dot-ok"></span>
        <span class="mono">BI-FAST 99,98%</span>
      </div>
      <div class="rn-chip-dark">
        ${ic('clock', 11, '#93c5fd')}
        <span class="mono">22 Nov 2026 · 15:27 WIB</span>
      </div>
      <div class="e-user-chip" style="border-left-color:#24406b;">
        <span class="e-avatar" style="background:#0f52ba;">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.3px;font-weight:700;color:#ffffff;">R. Kusuma</div>
          <div style="font-size:8.8px;color:#93c5fd;">Kepala Ops & Likuiditas</div>
        </div>
      </div>
    </div>
  </header>`;

  const tickerHtml = `<div class="rn-ticker">
    <div class="rn-ticker-list">
      <span style="color:#60a5fa;font-weight:700;letter-spacing:0.04em;">KURS KORIDOR LIVE</span>
      ${CORRIDORS.map(
        (c) => `<span class="rn-tick-item">
          <span class="rn-tick-pair">${esc(c.pair)}</span>
          <span class="rn-tick-rate">${fmtRate(c.quoteRate)}</span>
          <span class="rn-tick-spd">(${fmtPct(c.spreadPct, 2)})</span>
        </span>`
      ).join('<span class="rn-tick-div">|</span>')}
    </div>
    <div class="rn-ticker-list" style="gap:10px;">
      <span class="rn-tick-item"><span class="dot dot-ok"></span><span>Throughput: <strong style="color:#fff;">42,8 TPS</strong></span></span>
      <span class="rn-tick-div">|</span>
      <span class="rn-tick-item"><span>Cutoff PPATK IFTI: <strong style="color:#fde68a;">17:00 WIB</strong></span></span>
    </div>
  </div>`;

  const actionbarHtml = `<div class="rn-actionbar">
    <div class="rn-ab-left">
      <span class="rn-page-title">${esc(pageTitle)}</span>
      <span class="rn-env-tag">5 KORIDOR AKTIF · SETTLEMENT BI-FAST</span>
      ${actionLeftHtml || ''}
    </div>
    <div class="rn-ab-right">
      ${actionRightHtml || ''}
    </div>
  </div>`;

  const footerHtml = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><span>BI-FAST CI Hub: <strong>BIFAST-JKT1 (TLS 1.3 mTLS)</strong></span>`,
      `<span>Standar: <strong>ISO 20022 pacs.008 / acmt.023 / BIS Nexus</strong></span>`,
      `<span>Kafka Lag: <strong>12 ms</strong></span>`,
      `<span>PostgreSQL Multi-Currency Ledger: <strong style="color:#047857;">Selisih Rp 0</strong></span>`,
    ],
    rightItems: [
      `<span>PPATK goAML IFTI v5.2: <strong>9.376 tercatat</strong></span>`,
      `<span>WORM SHA-256: <strong>8a4f...c29e</strong></span>`,
    ],
  });

  return `${headerHtml}${tickerHtml}${actionbarHtml}<main class="rn-body">${contentHtml}</main>${footerHtml}`;
}

// ============================================================================
// PAGE 1: IKHTISAR KORIDOR & KUOTASI FX REAL-TIME
// ============================================================================
function renderPage1() {
  const kpiHtml = `<section class="rn-kpi-grid" style="grid-template-columns:repeat(6, 1fr);">
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Volume Remitansi 24 Jam</span>${ic('globe', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">${fmtShortM(TOTAL_VOL_IDR)}</div>
      <div class="rn-kpi-sub"><span>${fmtNum(TOTAL_TX)} transaksi PMI</span><span style="color:#047857;font-weight:700;">+14,2% WoW</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Rata-Rata Settlement</span>${ic('zap', 12, '#047857')}</div>
      <div class="rn-kpi-val">${WEIGHTED_AVG_SEC.toFixed(1).replace('.', ',')} dtk</div>
      <div class="rn-kpi-sub"><span>p95: 6,8 dtk · SLA &lt; 10 dtk</span>${svgSparkline({ points: [4.6, 4.4, 4.3, 4.5, 4.1, 4.0, 4.2], width: 52, height: 15, color: '#047857' })}</div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Spread Kurs Transparan</span>${ic('sliders', 12, '#047857')}</div>
      <div class="rn-kpi-val">${fmtPct(WEIGHTED_SPREAD_PCT, 2)}</div>
      <div class="rn-kpi-sub"><span>Hemat 3,85% vs koresponden</span><span style="color:#047857;font-weight:700;">Zero Hidden</span></div>
    </div>
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Validasi Nama Pra-Debit</span>${ic('checkCircle', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">98,9%</div>
      <div class="rn-kpi-sub"><span>${fmtNum(TX_STATUS_SUMMARY.settled)} cocok · ${TX_STATUS_SUMMARY.rejectedPreDebit} tolak awal</span></div>
    </div>
    <div class="rn-kpi warn">
      <div class="rn-kpi-lbl"><span>Tahan AML / KYC</span>${ic('shield', 12, '#b45309')}</div>
      <div class="rn-kpi-val">${TOTAL_AML_HOLD_COUNT} item</div>
      <div class="rn-kpi-sub"><span>Nilai: ${fmtIdr(ACTIVE_AML_SUM_IDR)}</span><span style="color:#b45309;font-weight:700;">Perlu Tinjau</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Buffer Prefund IDR</span>${ic('layers', 12, '#047857')}</div>
      <div class="rn-kpi-val">${fmtShortM(TOTAL_PREFUND_AVAIL)}</div>
      <div class="rn-kpi-sub"><span>${fmtPct(TOTAL_PREFUND_PCT, 1)} dari ${fmtShortM(TOTAL_PREFUND_LIMIT)}</span><span style="color:#047857;font-weight:700;">Aman</span></div>
    </div>
  </section>`;

  const volChart = svgMultiLineChart({
    width: 970,
    height: 256,
    xLabels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '15:00'],
    yMin: 0,
    yMax: 11,
    yTicks: 5,
    yFormat: (v) => `Rp ${v.toFixed(0)}M`,
    threshold: { value: 9.6, label: 'Batas Kapasitas Prefund/Jam Rp 9,6M', color: '#b45309' },
    annotations: [
      { index: 5, seriesIdx: 0, label: 'Puncak Gajian PMI SG/MY 10:00 (Rp 7,6M)', color: '#0f52ba', dy: -26 },
    ],
    series: [
      { label: 'Volume Remitansi (Rp Miliar/Jam)', color: '#0f52ba', area: true, dots: true, values: [1.8, 1.4, 2.1, 3.6, 5.4, 7.6, 7.1, 6.8, 6.5] },
      { label: 'Latensi p95 BI-FAST (Detik)', color: '#047857', dashed: true, dots: true, values: [3.9, 3.8, 4.0, 4.2, 4.5, 5.1, 4.8, 4.4, 4.2] },
    ],
  });

  const corridorRows = CORRIDORS.map(
    (c) => `<tr>
      <td><strong class="mono" style="color:#0b1c36;">${esc(c.pair)}</strong><div style="font-size:9.3px;color:#64748b;">${esc(c.country)}</div></td>
      <td class="trunc" style="color:#334155;">${esc(c.mto)}</td>
      <td class="num mono">${fmtRate(c.midRate)}</td>
      <td class="num mono" style="font-weight:700;color:#0b3d91;">${fmtRate(c.quoteRate)}</td>
      <td class="num mono" style="color:#047857;font-weight:700;">${fmtPct(c.spreadPct, 2)}</td>
      <td class="num mono">${fmtNum(c.tx24h)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(c.volIdr)}</td>
      <td class="num mono">${c.avgSec.toFixed(1).replace('.', ',')} dtk</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>`
  ).join('');

  const bankBarsHtml = BANK_RAILS.map((b) => {
    const share = (b.volIdr / TOTAL_VOL_IDR) * 100;
    return `<div style="display:flex;flex-direction:column;gap:3px;padding:5px 0;border-bottom:1px solid #eef2f6;">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <span style="font-weight:700;color:#0b1c36;font-size:11px;">${esc(b.bank)}</span>
          <span class="mono" style="font-size:9.2px;color:#64748b;">${esc(b.bic)}</span>
        </div>
        <div class="mono" style="font-size:10.5px;font-weight:700;color:#0b1c36;white-space:nowrap;">${fmtIdr(b.volIdr)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;height:6px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
          <div style="width:${share.toFixed(1)}%;height:100%;background:${b.color};"></div>
        </div>
        <span class="mono" style="font-size:9.6px;color:#334155;width:36px;text-align:right;font-weight:700;">${fmtPct(share, 1)}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.4px;color:#64748b;">
        <span class="trunc">${esc(b.regions)}</span>
        <span class="mono" style="white-space:nowrap;">${fmtNum(b.tx)} tx · p95 ${b.p95Sec.toFixed(1).replace('.', ',')} dtk · ${fmtPct(b.successPct, 2)}</span>
      </div>
    </div>`;
  }).join('');

  const liveItems = [
    { code: 'RM-SG01', title: 'SGD 450 -> BRI (Indramayu)', sub: 'Kurs Rp 11.840 · Nama cocok 100%', val: 'Rp 5.328.000', st: 'Masuk', tone: 'ok', meta: '3,8 dtk' },
    { code: 'RM-MY04', title: 'MYR 1.200 -> BNI (Lombok Timur)', sub: 'Kurs Rp 3.585 · BI-FAST instan', val: 'Rp 4.302.000', st: 'Masuk', tone: 'ok', meta: '4,1 dtk' },
    { code: 'RM-TW09', title: 'TWD 18.000 -> Mandiri (Blitar)', sub: 'Selisih ejaan nama — pemeriksaan KYC manual', val: 'Rp 8.820.000', st: 'Tinjau AML', tone: 'warn', meta: 'Ditahan', warn: true },
    { code: 'LIQ-IDR', title: 'Pool Prefund IDR — Bank Mandiri', sub: 'Buffer 74% aman menghadapi lonjakan akhir pekan', val: 'Rp 6,40 M', st: 'Tersedia', tone: 'ok', meta: 'Alert @ 2M' },
  ];

  const liveRowsHtml = liveItems
    .map(
      (it) => `<div class="ops-row ${it.warn ? 'is-warn' : ''}">
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="mono" style="font-size:9.8px;font-weight:700;color:#0b3d91;background:#e8f0fe;padding:1px 5px;border-radius:2px;">${esc(it.code)}</span>
            <span style="font-weight:700;font-size:10.8px;color:#0b1c36;" class="trunc">${esc(it.title)}</span>
          </div>
          <div style="font-size:9.6px;color:#475569;margin-top:2px;" class="trunc">${esc(it.sub)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="mono" style="font-size:11px;font-weight:700;color:#0b1c36;">${esc(it.val)}</div>
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:2px;">
            <span class="mono" style="font-size:9.3px;color:#64748b;">${esc(it.meta)}</span>
            ${badge(it.st, it.tone)}
          </div>
        </div>
      </div>`
    )
    .join('');

  const contentHtml = `${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.68fr 1fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0 0 306px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f52ba')}<span>Volume Remitansi & Latensi Settlement BI-FAST (Intraday WIB)</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('BIS Nexus Mode', 'accent')}
              <span class="e-panel-sub mono">Cutoff 15:27 WIB</span>
            </div>
          </div>
          <div class="e-panel-body" style="padding:6px 10px 4px;">
            ${volChart}
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('globe', 13, '#0f52ba')}<span>Matriks Kuotasi Kurs & Kinerja 5 Koridor PMI Aktif</span></div>
            <span class="e-panel-sub">Kuotasi mengunci kurs 120 dtk · Sumber Mid-Market: JISDOR / Reuters</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:10%;" />
                <col style="width:19%;" />
                <col style="width:9%;" />
                <col style="width:9%;" />
                <col style="width:7%;" />
                <col style="width:8%;" />
                <col style="width:16%;" />
                <col style="width:8%;" />
                <col style="width:14%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Koridor</th>
                  <th>Mitra MTO Luar Negeri</th>
                  <th class="num">Mid-Market</th>
                  <th class="num">Kurs Switch</th>
                  <th class="num">Spread</th>
                  <th class="num">Tx 24j</th>
                  <th class="num">Volume (IDR)</th>
                  <th class="num">Rata Settle</th>
                  <th>Status Rel</th>
                </tr>
              </thead>
              <tbody>${corridorRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4">TOTAL 5 KORIDOR AKTIF (SGD · MYR · HKD · TWD · JPY)</td>
                  <td class="num mono" style="color:#047857;">${fmtPct(WEIGHTED_SPREAD_PCT, 2)}</td>
                  <td class="num mono">${fmtNum(TOTAL_TX)}</td>
                  <td class="num mono">${fmtIdr(TOTAL_VOL_IDR)}</td>
                  <td class="num mono">${WEIGHTED_AVG_SEC.toFixed(1).replace('.', ',')} dtk</td>
                  <td>${badge('5/5 Online', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto;">
              <div style="background:#ffffff;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9.3px;font-weight:700;color:#64748b;">BENCHMARK SGD 450 -&gt; BRI</div>
                <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:10px;">
                  <span style="color:#047857;font-weight:700;">RemitNusa: Rp 5.328.000</span>
                  <span class="mono" style="color:#64748b;">SWIFT: Rp 5.112.000</span>
                </div>
                <div style="font-size:9.2px;color:#047857;margin-top:2px;">PMI hemat <strong>Rp 216.000</strong> · Masuk 3,8 dtk vs 2 hari kerja</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9.3px;font-weight:700;color:#64748b;">BENCHMARK MYR 1.200 -&gt; BNI</div>
                <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:10px;">
                  <span style="color:#047857;font-weight:700;">RemitNusa: Rp 4.302.000</span>
                  <span class="mono" style="color:#64748b;">SWIFT: Rp 4.131.000</span>
                </div>
                <div style="font-size:9.2px;color:#047857;margin-top:2px;">PMI hemat <strong>Rp 171.000</strong> · Masuk 4,1 dtk vs 2 hari kerja</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9.3px;font-weight:700;color:#047857;">TOTAL PENGHEMATAN PMI (24 JAM)</div>
                <div class="mono" style="font-size:13px;font-weight:800;color:#047857;margin-top:2px;">Rp 1.871.870.000</div>
                <div style="font-size:9.2px;color:#065f46;margin-top:1px;">Vs rata-rata markup bank koresponden 4,30%</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0 0 365px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#0f52ba')}<span>Distribusi Settlement per Bank Penerima BI-FAST</span></div>
            <span class="e-panel-sub mono">${fmtNum(TOTAL_TX)} tx</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:6px 11px;">
            <div>${bankBarsHtml}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;font-size:10.3px;">
              <span style="color:#475569;font-weight:600;">Total Kredit Rel BI-FAST (24 Jam)</span>
              <strong class="mono" style="color:#0b1c36;">${fmtIdr(TOTAL_VOL_IDR)} (100,0%)</strong>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('bell', 13, '#0f52ba')}<span>Sorotan Operasi Koridor & Prefund</span></div>
            ${badge('Live Stream', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;padding:8px 10px;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${liveRowsHtml}
            </div>
            <div class="iso-strip">
              ${ic('terminal', 12, '#60a5fa')}
              <span class="trunc">ISO 20022 pacs.008 -&gt; BI-FAST RRN 2026112088412 | Masuk 3,8 dtk | PPATK IFTI tercatat</span>
            </div>
          </div>
        </section>
      </div>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'RemitNusa Nexus — Ikhtisar Koridor & Kuotasi FX Real-Time',
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell({
      activeTab: 'p1',
      pageTitle: 'RemitNusa · Switch Koridor ASEAN ke Indonesia',
      actionLeftHtml: `<span class="rn-filter-pill is-on">Semua Koridor (5)</span><span class="rn-filter-pill">Shift Siang WIB</span>`,
      actionRightHtml: `<span class="e-btn">${ic('download', 11, '#334155')}<span>Ekspor XML IFTI</span></span><span class="e-btn e-btn-primary">${ic('refresh', 11, '#ffffff')}<span>Seimbangkan Prefund</span></span>`,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR TRANSAKSI & INSPEKTOR BI-FAST (20 ROWS + INSPECTOR)
// ============================================================================
function renderPage2() {
  const txRows = TRANSACTIONS.map((t) => {
    const cls = t.selected ? 'is-selected' : t.bad ? 'is-bad' : t.warn ? 'is-warn' : '';
    const scoreColor = t.nameScore === '100%' ? '#047857' : t.bad ? '#be123c' : '#b45309';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(t.code)}</td>
      <td class="mono" style="color:#475569;">${esc(t.time)}</td>
      <td class="mono"><strong>${esc(t.ccy)} ${fmtNum(t.foreignAmt)}</strong></td>
      <td class="trunc">${esc(t.mto)}</td>
      <td class="trunc" style="font-weight:600;">${esc(t.bank)}</td>
      <td class="num mono">${fmtRate(t.rate)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(t.idrAmt)}</td>
      <td class="num mono" style="font-weight:700;color:${scoreColor};">${esc(t.nameScore)}</td>
      <td class="num mono">${esc(t.dur)}</td>
      <td>${badge(t.status, t.tone)}</td>
    </tr>`;
  }).join('');

  const waterfallSvg = svgSpanWaterfall({
    spans: WATERFALL_RM_SG01,
    totalMs: WATERFALL_TOTAL_MS,
    width: 470,
  });

  const contentHtml = `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;background:#ffffff;border:1px solid var(--e-border);border-radius:3px;padding:6px 10px;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="rn-filter-pill is-on">Semua: ${fmtNum(TOTAL_TX)}</span>
        <span class="rn-filter-pill"><span class="dot dot-ok"></span>Masuk BI-FAST: ${fmtNum(TX_STATUS_SUMMARY.settled)}</span>
        <span class="rn-filter-pill"><span class="dot dot-info"></span>Dalam Kliring: ${TX_STATUS_SUMMARY.pending}</span>
        <span class="rn-filter-pill" style="background:#fffbeb;border-color:#fde68a;color:#92400e;"><span class="dot dot-warn"></span>Tinjau AML: ${TX_STATUS_SUMMARY.amlHold}</span>
        <span class="rn-filter-pill"><span class="dot dot-bad"></span>Ditolak Pra-Debit: ${TX_STATUS_SUMMARY.rejectedPreDebit}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="height:24px;width:270px;border:1px solid var(--e-border-strong);border-radius:3px;padding:0 8px;display:flex;align-items:center;justify-content:space-between;color:#64748b;font-size:10.3px;background:#f8fafc;">
          <span style="display:inline-flex;align-items:center;gap:5px;">${ic('search', 11, '#64748b')}<span>Cari RRN, Kode RM-*, Rekening...</span></span>
          <span class="mono" style="font-size:9px;color:#475569;">Ctrl+F</span>
        </div>
        <span class="e-btn">${ic('filter', 11, '#334155')}<span>Koridor: Semua</span></span>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.95fr 1fr;gap:9px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0f52ba')}<span>Buku Besar Transaksi Lintas Negara Real-Time (20 Terbaru dari ${fmtNum(TOTAL_TX)})</span></div>
          <span class="e-panel-sub mono">Auto-refresh 1 dtk · Urut terbaru WIB</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table roomy" style="font-size:10.3px;">
            <colgroup>
              <col style="width:7.5%;" />
              <col style="width:7.5%;" />
              <col style="width:10.5%;" />
              <col style="width:13.5%;" />
              <col style="width:16.5%;" />
              <col style="width:7%;" />
              <col style="width:12.5%;" />
              <col style="width:7%;" />
              <col style="width:7%;" />
              <col style="width:11%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>WIB</th>
                <th>Valas</th>
                <th>Mitra MTO</th>
                <th>Bank & Wilayah</th>
                <th class="num">Kurs</th>
                <th class="num">Nominal IDR</th>
                <th class="num">Nama</th>
                <th class="num">Durasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${txRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="6">SUBTOTAL 20 TRANSAKSI TERBARU (17 Masuk · 2 Tinjau AML · 1 Ditolak Nama Pra-Debit)</td>
                <td class="num mono">${fmtIdr(SAMPLE_TX_SUM_IDR)}</td>
                <td class="num mono">97,0%</td>
                <td class="num mono">4,1 dtk</td>
                <td>${badge('Verified', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;margin-top:auto;">
            <span>Transaksi berstatus <strong style="color:#be123c;">Ditolak Nama</strong> dihentikan saat <code>acmt.023</code> (pra-debit), sehingga dana PMI tidak terpotong di MTO.</span>
            <span class="mono">Halaman 1 / 474 · Total 24j: ${fmtIdr(TOTAL_VOL_IDR)}</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#0f52ba')}<span>Inspektor Transaksi · RM-SG01</span></div>
          ${badge('ACSC · Masuk 3,8 dtk', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;padding:9px 11px;">
          <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:8px 10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:9.8px;font-weight:700;color:#475569;">REFERENSI KLIRING BI-FAST</span>
              <span class="mono" style="font-size:10px;font-weight:700;color:#0b3d91;">RRN 2026112088412</span>
            </div>
            <div style="display:flex;align-items:baseline;justify-content:space-between;">
              <span class="mono" style="font-size:17px;font-weight:800;color:#0b1c36;">Rp 5.328.000</span>
              <span class="mono" style="font-size:11px;font-weight:700;color:#047857;">SGD 450,00 @ Rp 11.840</span>
            </div>
            <div style="font-size:9.6px;color:#64748b;margin-top:3px;">
              Spread 0,45% (Mid Rp 11.893) · PMI hemat <strong style="color:#047857;">Rp 216.000</strong> vs bank koresponden
            </div>
          </div>

          <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10px;font-weight:700;color:#047857;">VALIDASI NAMA PRA-DEBIT (ISO acmt.023/024)</span>
              ${badge('Cocok 100%', 'ok')}
            </div>
            <div class="kv-list">
              <div class="kv-row" style="border-bottom-color:#a7f3d0;"><span class="kv-k">Pengirim PMI (SG)</span><span class="kv-v">Siti Rohmah (FIN S84***91K)</span></div>
              <div class="kv-row" style="border-bottom-color:#a7f3d0;"><span class="kv-k">Input Penerima MTO</span><span class="kv-v mono">Siti Rohmah</span></div>
              <div class="kv-row" style="border-bottom-color:#a7f3d0;"><span class="kv-k">Nama Rekening BRI</span><span class="kv-v mono" style="color:#047857;">SITI ROHMAH (EXACT)</span></div>
              <div class="kv-row"><span class="kv-k">Rekening Tujuan</span><span class="kv-v mono">BRI Indramayu · 0028-01-041822-53-4</span></div>
            </div>
          </div>

          <div style="border:1px solid #d8dee6;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
              <span style="font-size:10px;font-weight:700;color:#0b1c36;">WATERFALL LATENSI END-TO-END</span>
              <span class="mono" style="font-size:10px;font-weight:700;color:#0f52ba;">Total 3.800 ms (3,8 dtk)</span>
            </div>
            ${waterfallSvg}
          </div>

          <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:3px;padding:7px 9px;">
            <div style="font-size:9.8px;font-weight:700;color:#0b3d91;margin-bottom:4px;">JURNAL DOUBLE-ENTRY ATOMIK (POSTGRESQL)</div>
            <div class="kv-list">
              <div class="kv-row" style="border-bottom-color:#bfdbfe;"><span class="kv-k mono">DR VOSTRO-SINGTEL-SGD</span><span class="kv-v mono">Rp 5.328.000 (SGD 450)</span></div>
              <div class="kv-row" style="border-bottom-color:#bfdbfe;"><span class="kv-k mono">CR LIQ-BRI-PREFUND-IDR</span><span class="kv-v mono" style="color:#047857;">Rp 5.328.000 (BRI)</span></div>
              <div class="kv-row"><span class="kv-k">Status Rekonsiliasi camt.054</span><span class="kv-v" style="color:#047857;">Terverifikasi · Selisih Rp 0</span></div>
            </div>
          </div>

          <div style="border:1px solid #d8dee6;border-radius:3px;padding:7px 9px;background:#fafcfe;margin-top:auto;">
            <div style="font-size:10px;font-weight:700;color:#0b1c36;margin-bottom:4px;">JEJAK KEPATUHAN & PPATK IFTI</div>
            <div class="kv-list">
              <div class="kv-row"><span class="kv-k">Skrining OFAC / DTTOT</span><span class="kv-v" style="color:#047857;">0 Hit · Lolos Otomatis (290 ms)</span></div>
              <div class="kv-row"><span class="kv-k">Antrean PPATK goAML v5.2</span><span class="kv-v mono">Batch #IFTI-261122-04 (Tercatat)</span></div>
              <div class="kv-row"><span class="kv-k">Hash Bukti WORM SHA-256</span><span class="kv-v mono">9c41b7...f082 (Immutable)</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'RemitNusa Nexus — Buku Besar Transaksi & Inspektor BI-FAST',
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell({
      activeTab: 'p2',
      pageTitle: 'Buku Besar Transaksi Lintas Negara & Inspektor BI-FAST',
      actionLeftHtml: `<span class="rn-filter-pill is-on">Live Feed WIB</span><span class="rn-filter-pill">ISO 20022 pacs.008</span>`,
      actionRightHtml: `<span class="e-btn">${ic('copy', 11, '#334155')}<span>Salin XML pacs.008</span></span><span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Unduh CSV Rekonsiliasi</span></span>`,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 3: LIKUIDITAS PREFUND & BUKU BESAR REKONSILIASI MULTI-MATA UANG
// ============================================================================
function renderPage3() {
  const kpiHtml = `<section class="rn-kpi-grid" style="grid-template-columns:repeat(5, 1fr);">
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Total Saldo Prefund IDR</span>${ic('layers', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">${fmtIdr(TOTAL_PREFUND_AVAIL)}</div>
      <div class="rn-kpi-sub"><span>5 Pool Bank Settlement Indonesia</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Rasio Buffer Prefund</span>${ic('checkCircle', 12, '#047857')}</div>
      <div class="rn-kpi-val">${fmtPct(TOTAL_PREFUND_PCT, 1)}</div>
      <div class="rn-kpi-sub"><span>Pagu Total: ${fmtShortM(TOTAL_PREFUND_LIMIT)}</span><span style="color:#047857;font-weight:700;">Aman</span></div>
    </div>
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Total Vostro Mitra MTO</span>${ic('globe', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">${fmtIdr(TOTAL_PREFUND_AVAIL)}</div>
      <div class="rn-kpi-sub"><span>6 MTO (SGD, MYR, HKD, TWD, JPY)</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Selisih Rekonsiliasi Intraday</span>${ic('check', 12, '#047857')}</div>
      <div class="rn-kpi-val">Rp 0</div>
      <div class="rn-kpi-sub"><span>100% cocok camt.054 BI-FAST</span><span style="color:#047857;font-weight:700;">Balance</span></div>
    </div>
    <div class="rn-kpi warn">
      <div class="rn-kpi-lbl"><span>Proyeksi Lonjakan Akhir Pekan</span>${ic('alert', 12, '#b45309')}</div>
      <div class="rn-kpi-val">Rp 11,20 M</div>
      <div class="rn-kpi-sub"><span>1 Pool Siaga Top-Up (LIQ-BSI)</span><span style="color:#b45309;font-weight:700;">Auto-Sweep</span></div>
    </div>
  </section>`;

  const poolRows = PREFUND_POOLS.map((p) => {
    const pct = (p.availIdr / p.limitIdr) * 100;
    const isWarn = p.tone === 'warn';
    return `<tr class="${isWarn ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(p.code)}</td>
      <td><div style="font-weight:700;color:#0b1c36;" class="trunc">${esc(p.bank)}</div><div class="mono" style="font-size:9.1px;color:#64748b;">${esc(p.bic)} · ${esc(p.acct)}</div></td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(p.availIdr)}</td>
      <td class="num mono" style="color:#475569;">${fmtIdr(p.limitIdr)}</td>
      <td>${renderCapacityBar(pct, { warnAt: 95, critAt: 99 })}</td>
      <td class="num mono">${fmtShortM(p.alertAtIdr)}</td>
      <td class="num mono">${esc(p.runwayHr)}</td>
      <td>${badge(p.status, p.tone)}</td>
    </tr>`;
  }).join('');

  const stackedChart = svgStackedBarChart({
    width: 630,
    height: 132,
    categories: CORRIDORS.map((c) => c.ccy),
    yMax: 8,
    yFormat: (v) => `Rp ${v}M`,
    series: [
      { label: 'Prefund Tersedia (Rp M)', color: '#0f52ba', values: CORRIDORS.map((c) => c.prefundAvailIdr / 1e9) },
      { label: 'Terpakai Intraday (Rp M)', color: '#93c5fd', values: CORRIDORS.map((c) => c.prefundUsedIdr / 1e9) },
    ],
  });

  const vostroRows = MTO_VOSTRO.map(
    (m) => `<tr>
      <td style="font-weight:600;">${esc(m.partner)}</td>
      <td class="num mono">${esc(m.balanceCcy)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(m.equivIdr)}</td>
      <td class="num mono">${fmtNum(m.settledToday)}</td>
      <td>${badge(m.recon, m.tone)}</td>
    </tr>`
  ).join('');

  const ledgerRows = LEDGER_ENTRIES.map(
    (l) => `<tr>
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(l.jrn)}</td>
      <td class="mono" style="color:#475569;">${esc(l.time)}</td>
      <td class="mono" style="font-weight:600;">${esc(l.ref)}</td>
      <td class="mono" style="font-size:10px;">${esc(l.drAcct)}</td>
      <td class="mono" style="font-size:10px;">${esc(l.crAcct)}</td>
      <td class="mono" style="color:#334155;">${esc(l.src)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(l.drIdr)}</td>
      <td class="num mono" style="font-weight:700;color:#047857;">${fmtIdr(l.crIdr)}</td>
      <td>${badge(l.recon, l.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `${kpiHtml}
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:9px;flex:0 0 366px;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')}<span>Posisi Pool Prefund IDR & Peringatan Ambang Batas per Bank</span></div>
          <span class="e-panel-sub">Pemantauan otomatis menghadapi puncak akhir pekan PMI</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.2px;">
            <colgroup>
              <col style="width:7.5%;" />
              <col style="width:24.5%;" />
              <col style="width:15%;" />
              <col style="width:15%;" />
              <col style="width:10.5%;" />
              <col style="width:8.5%;" />
              <col style="width:7.5%;" />
              <col style="width:11.5%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Pool Bank Settlement</th>
                <th class="num">Saldo Tersedia</th>
                <th class="num">Pagu Pool</th>
                <th>Buffer</th>
                <th class="num">Alert @</th>
                <th class="num">Runway</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${poolRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL POOL PREFUND IDR (5 BANK)</td>
                <td class="num mono">${fmtIdr(TOTAL_PREFUND_AVAIL)}</td>
                <td class="num mono">${fmtIdr(TOTAL_PREFUND_LIMIT)}</td>
                <td class="mono" style="color:#047857;">${fmtPct(TOTAL_PREFUND_PCT, 1)}</td>
                <td class="num mono">Rp 5,60 M</td>
                <td class="num mono">27,4 j</td>
                <td>${badge('5 Pool Aktif', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;padding:7px 10px 0;background:#ffffff;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 8px;">
              <div style="font-size:9px;font-weight:700;color:#64748b;">PROYEKSI INFLOW SG + MY (AKHIR PEKAN)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#0b1c36;margin-top:2px;">Rp 7.400.000.000</div>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 8px;">
              <div style="font-size:9px;font-weight:700;color:#64748b;">PROYEKSI INFLOW HK + TW + JP</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#0b1c36;margin-top:2px;">Rp 3.800.000.000</div>
            </div>
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:5px 8px;">
              <div style="font-size:9px;font-weight:700;color:#047857;">SISA BUFFER PASCA-PUNCAK MINGGU</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;margin-top:2px;">Rp 3.650.000.000 (Aman)</div>
            </div>
          </div>

          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;">
            <div style="font-size:10px;color:#334155;">
              <strong style="color:#b45309;">Rekomendasi Rebalance:</strong> Top-up <strong>LIQ-BSI</strong> sebesar <strong class="mono">Rp 330.000.000</strong> dari <strong>LIQ-IDR (Mandiri)</strong> sebelum Jumat 18:00 WIB.
            </div>
            <span class="e-btn e-btn-primary">${ic('zap', 11, '#ffffff')}<span>Eksekusi Sweep BI-RTGS</span></span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0f52ba')}<span>Likuiditas Valas & Saldo Vostro Mitra MTO</span></div>
          <span class="e-panel-sub mono">Eq. ${fmtShortM(TOTAL_PREFUND_AVAIL)}</span>
        </div>
        <div class="e-panel-body-flush">
          <div style="padding:5px 10px 2px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
            ${stackedChart}
          </div>
          <table class="e-table tight" style="font-size:9.9px;">
            <colgroup>
              <col style="width:23%;" />
              <col style="width:22%;" />
              <col style="width:24%;" />
              <col style="width:11%;" />
              <col style="width:20%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Mitra MTO</th>
                <th class="num">Saldo Valas</th>
                <th class="num">Ekuivalen IDR</th>
                <th class="num">Tx 24j</th>
                <th>Rekonsiliasi</th>
              </tr>
            </thead>
            <tbody>${vostroRows}</tbody>
          </table>
        </div>
      </section>
    </div>

    <section class="e-panel" style="flex:1;min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')}<span>Buku Besar Rekonsiliasi Double-Entry Multi-Mata Uang (PostgreSQL Append-Only Ledger)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Zero Variance · Rp 0', 'ok')}
          <span class="e-panel-sub mono">Sinkronisasi BI-FAST camt.054 Real-Time</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table" style="font-size:10.3px;">
          <colgroup>
            <col style="width:11.5%;" />
            <col style="width:6.5%;" />
            <col style="width:8%;" />
            <col style="width:16.5%;" />
            <col style="width:16.5%;" />
            <col style="width:9.5%;" />
            <col style="width:11%;" />
            <col style="width:11%;" />
            <col style="width:9.5%;" />
          </colgroup>
          <thead>
            <tr>
              <th>ID Jurnal</th>
              <th>WIB</th>
              <th>Ref Tx</th>
              <th>Akun Debit (Vostro/Kas)</th>
              <th>Akun Kredit (Prefund IDR)</th>
              <th>Sumber Valas</th>
              <th class="num">Debit (IDR)</th>
              <th class="num">Kredit (IDR)</th>
              <th>Status Recon</th>
            </tr>
          </thead>
          <tbody>${ledgerRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="6">VERIFIKASI KESEIMBANGAN DOUBLE-ENTRY (10 JURNAL TERBARU) · SELISIH = Rp 0</td>
              <td class="num mono">${fmtIdr(LEDGER_DR_SUM)}</td>
              <td class="num mono" style="color:#047857;">${fmtIdr(LEDGER_CR_SUM)}</td>
              <td>${badge('100% Cocok', 'ok')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>`;

  return wrapEnterpriseHtml({
    title: 'RemitNusa Nexus — Likuiditas Prefund & Rekonsiliasi Multi-Mata Uang',
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell({
      activeTab: 'p3',
      pageTitle: 'Manajemen Likuiditas Prefund & Buku Besar Rekonsiliasi',
      actionLeftHtml: `<span class="rn-filter-pill is-on">5 Pool Bank IDR</span><span class="rn-filter-pill">6 Rekening Vostro MTO</span>`,
      actionRightHtml: `<span class="e-btn">${ic('download', 11, '#334155')}<span>Ekspor camt.053/054</span></span><span class="e-btn e-btn-primary">${ic('refresh', 11, '#ffffff')}<span>Seimbangkan Prefund</span></span>`,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 4: SKRINING AML/OFAC & PELAPORAN PPATK IFTI
// ============================================================================
function renderPage4() {
  const kpiHtml = `<section class="rn-kpi-grid" style="grid-template-columns:repeat(5, 1fr);">
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Transaksi Terskrining 24j</span>${ic('shield', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">${fmtNum(TOTAL_TX)}</div>
      <div class="rn-kpi-sub"><span>100% pra-settlement · p95 290 ms</span></div>
    </div>
    <div class="rn-kpi warn">
      <div class="rn-kpi-lbl"><span>Kasus Tahan AML Aktif</span>${ic('alert', 12, '#b45309')}</div>
      <div class="rn-kpi-val">${ACTIVE_AML_CASES.length} kasus</div>
      <div class="rn-kpi-sub"><span>Nilai: ${fmtIdr(ACTIVE_AML_SUM_IDR)}</span><span style="color:#b45309;font-weight:700;">Antrean L2</span></div>
    </div>
    <div class="rn-kpi bad">
      <div class="rn-kpi-lbl"><span>Pola Structuring Terdeteksi</span>${ic('activity', 12, '#be123c')}</div>
      <div class="rn-kpi-val">1 klaster</div>
      <div class="rn-kpi-sub"><span>RM-MY18 · 3x pecahan &lt; Rp 10 Jt</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Laporan IFTI PPATK Terkirim</span>${ic('fileText', 12, '#047857')}</div>
      <div class="rn-kpi-val">${fmtNum(TX_STATUS_SUMMARY.settled)}</div>
      <div class="rn-kpi-sub"><span>goAML XML v5.2 · 0 gagal kirim</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Rata Resolusi Kasus AML</span>${ic('clock', 12, '#047857')}</div>
      <div class="rn-kpi-val">14,2 mnt</div>
      <div class="rn-kpi-sub"><span>Target SLA OJK/BI &lt; 30 mnt</span><span style="color:#047857;font-weight:700;">Patuh</span></div>
    </div>
  </section>`;

  const caseRows = AML_CASES.map((c) => {
    const cls = c.selected ? 'is-selected' : c.active ? 'is-warn' : '';
    const scColor = c.score >= 80 ? '#be123c' : c.score >= 60 ? '#b45309' : '#047857';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(c.id)}</td>
      <td class="mono" style="font-weight:600;">${esc(c.tx)}</td>
      <td class="mono" style="color:#475569;">${esc(c.time)}</td>
      <td class="trunc">${esc(c.corridor)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(c.amountIdr)}</td>
      <td class="trunc" style="color:#334155;">${esc(c.trigger)}</td>
      <td class="num mono" style="font-weight:700;color:${scColor};">${c.score}</td>
      <td>${badge(c.state, c.tone)}</td>
    </tr>`;
  }).join('');

  const ruleRows = AML_RULES.map(
    (r) => `<tr>
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(r.code)}</td>
      <td style="font-weight:600;" class="trunc">${esc(r.name)}</td>
      <td class="trunc" style="color:#475569;">${esc(r.engine)}</td>
      <td class="num mono" style="font-weight:700;">${fmtNum(r.hits24h)}</td>
      <td class="num mono">${esc(r.fpRate)}</td>
      <td class="num mono">${esc(r.p95Ms)}</td>
      <td class="mono" style="font-size:9.6px;color:#0b3d91;">${esc(r.reg)}</td>
    </tr>`
  ).join('');

  const batchCardsHtml = IFTI_BATCHES.map(
    (b) => `<div style="background:#ffffff;border:1px solid #d8dee6;border-radius:3px;padding:5px 8px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
      <div>
        <div class="mono" style="font-size:9.6px;font-weight:700;color:#0b1c36;">${esc(b.batch)} · ${esc(b.time)}</div>
        <div class="mono" style="font-size:10.5px;font-weight:700;color:#0f52ba;">${fmtNum(b.count)} IFTI</div>
      </div>
      ${badge(b.status, 'ok')}
    </div>`
  ).join('');

  const xmlSnippet = `<span class="xml-cmt">&lt;!-- PPATK goAML IFTI XML v5.2 · Auto-Generated Batch #IFTI-20261122-04 --&gt;</span>
<span class="xml-tag">&lt;report&gt;</span>
  <span class="xml-tag">&lt;rentity_id&gt;</span><span class="xml-val">RNUSA-PJP-020</span><span class="xml-tag">&lt;/rentity_id&gt;</span>
  <span class="xml-tag">&lt;submission_code&gt;</span><span class="xml-val">E</span><span class="xml-tag">&lt;/submission_code&gt;</span>  <span class="xml-tag">&lt;report_code&gt;</span><span class="xml-val">IFTI</span><span class="xml-tag">&lt;/report_code&gt;</span>
  <span class="xml-tag">&lt;transaction&gt;</span>
    <span class="xml-tag">&lt;transactionnumber&gt;</span><span class="xml-val">2026112088412</span><span class="xml-tag">&lt;/transactionnumber&gt;</span>
    <span class="xml-tag">&lt;date_transaction&gt;</span><span class="xml-val">2026-11-22T15:26:48+07:00</span><span class="xml-tag">&lt;/date_transaction&gt;</span>
    <span class="xml-tag">&lt;transmode_code&gt;</span><span class="xml-val">BIFAST_NEXUS</span><span class="xml-tag">&lt;/transmode_code&gt;</span>
    <span class="xml-tag">&lt;amount_local&gt;</span><span class="xml-val">5328000.00</span><span class="xml-tag">&lt;/amount_local&gt;</span>
    <span class="xml-tag">&lt;from_country&gt;</span><span class="xml-val">SG</span><span class="xml-tag">&lt;/from_country&gt;</span> <span class="xml-tag">&lt;to_country&gt;</span><span class="xml-val">ID</span><span class="xml-tag">&lt;/to_country&gt;</span>
    <span class="xml-tag">&lt;t_from_my_client&gt;</span><span class="xml-val">Singtel Dash SG · Siti Rohmah</span><span class="xml-tag">&lt;/t_from_my_client&gt;</span>
    <span class="xml-tag">&lt;t_to&gt;</span><span class="xml-val">BRINIDJA · 0028-01-041822-53-4 · SITI ROHMAH</span><span class="xml-tag">&lt;/t_to&gt;</span>
  <span class="xml-tag">&lt;/transaction&gt;</span>
<span class="xml-tag">&lt;/report&gt;</span>`;

  const contentHtml = `${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.42fr 1fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1.1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#0f52ba')}<span>Antrean Kasus Tahan AML, Sanksi OFAC/PPATK & Ketidakcocokan Nama</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('2 Tahan Aktif', 'warn')}
              <span class="e-panel-sub">7 Selesai Hari Ini</span>
            </div>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table roomy" style="font-size:10.3px;">
              <colgroup>
                <col style="width:9.5%;" />
                <col style="width:9%;" />
                <col style="width:8.5%;" />
                <col style="width:16.5%;" />
                <col style="width:13.5%;" />
                <col style="width:24.5%;" />
                <col style="width:6%;" />
                <col style="width:12.5%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kasus</th>
                  <th>Kode Tx</th>
                  <th>WIB</th>
                  <th>Koridor & Bank</th>
                  <th class="num">Nominal IDR</th>
                  <th>Pemicu Skrining</th>
                  <th class="num">Skor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${caseRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4">TOTAL NILAI KASUS TAHAN AKTIF (2 ITEM: RM-TW09 & RM-MY18)</td>
                  <td class="num mono" style="color:#b45309;">${fmtIdr(ACTIVE_AML_SUM_IDR)}</td>
                  <td colspan="3" style="font-weight:600;color:#475569;">Dana dikunci di escrow sementara — belum didebit ke BI-FAST</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0.9;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#0f52ba')}<span>Matriks Mesin Skrining APU-PPT & Jadwal Batch PPATK goAML</span></div>
            <span class="e-panel-sub">Sinkronisasi daftar sanksi otomatis tiap 15 menit</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.1px;">
              <colgroup>
                <col style="width:8%;" />
                <col style="width:28%;" />
                <col style="width:23%;" />
                <col style="width:9%;" />
                <col style="width:8%;" />
                <col style="width:9%;" />
                <col style="width:15%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Aturan</th>
                  <th>Mesin Deteksi & Daftar</th>
                  <th>Algoritma / Pipeline</th>
                  <th class="num">Hit 24j</th>
                  <th class="num">FP Rate</th>
                  <th class="num">p95</th>
                  <th>Dasar Hukum</th>
                </tr>
              </thead>
              <tbody>${ruleRows}</tbody>
            </table>
            <div style="padding:8px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;font-size:9.6px;font-weight:700;color:#475569;">
                <span>STATUS PENGIRIMAN BATCH IFTI PPATK HARI INI (TOTAL ${fmtNum(IFTI_BATCH_SUM)} TRANSAKSI)</span>
                <span class="mono" style="color:#047857;">100% Terkirim · 0 Gagal</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:7px;">
                ${batchCardsHtml}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1.15;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('eye', 13, '#b45309')}<span>Berkas Tinjauan KYC · AML-9041 (RM-TW09)</span></div>
            ${badge('Tahan Manual L2', 'warn')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;padding:9px 11px;">
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:8px 10px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:10.5px;font-weight:700;color:#92400e;">TWD 18.000 -&gt; Bank Mandiri (KC Blitar)</span>
                <span class="mono" style="font-size:12.5px;font-weight:800;color:#0b1c36;">Rp 8.820.000</span>
              </div>
              <div style="font-size:9.8px;color:#78350f;margin-top:3px;">
                Pemicu: Selisih ejaan nama penerima di bawah ambang auto-pass 95% — wajib verifikasi dokumen KYC.
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div style="border:1px solid #d8dee6;border-radius:3px;padding:7px 9px;background:#fafcfe;">
                <div style="font-size:9.3px;font-weight:700;color:#64748b;">INPUT MTO (QUICKPAY TW)</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;margin-top:3px;">BUDI SANTO<span style="background:#fde68a;padding:0 2px;">Z</span>O</div>
                <div style="font-size:9.4px;color:#475569;margin-top:3px;">Pengirim: Agus Santoso (ARC TW-H82***19)</div>
              </div>
              <div style="border:1px solid #a7f3d0;border-radius:3px;padding:7px 9px;background:#ecfdf5;">
                <div style="font-size:9.3px;font-weight:700;color:#047857;">REKENING MANDIRI (acmt.024)</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;margin-top:3px;">BUDI SANTO<span style="background:#a7f3d0;padding:0 2px;">S</span>O</div>
                <div style="font-size:9.4px;color:#065f46;margin-top:3px;">Skor Levenshtein: 91,7% · 1 karakter beda</div>
              </div>
            </div>

            <div class="kv-list" style="border:1px solid #e2e8f0;border-radius:3px;padding:6px 9px;">
              <div class="kv-row"><span class="kv-k">Sanksi OFAC SDN / UNSC</span><span class="kv-v" style="color:#047857;">0 Hit (Bersih)</span></div>
              <div class="kv-row"><span class="kv-k">Daftar DTTOT / PPSPM PPATK</span><span class="kv-v" style="color:#047857;">0 Hit (Bersih)</span></div>
              <div class="kv-row"><span class="kv-k">Riwayat Koridor 30 Hari</span><span class="kv-v mono">2x transfer sukses ke rekening sama</span></div>
              <div class="kv-row"><span class="kv-k">Status Kebijakan Maker-Checker</span><span class="kv-v">Menunggu persetujuan Pejabat APU-PPT</span></div>
            </div>

            <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:3px;padding:7px 9px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:9.5px;font-weight:700;color:#0b3d91;">VERIFIKASI DOKUMEN & CATATAN ANALIS L1</span>
                <div style="display:flex;gap:4px;">${badge('ARC Valid', 'ok')}${badge('Slip Gaji OK', 'ok')}</div>
              </div>
              <div style="font-size:9.8px;color:#1e3a8a;line-height:1.4;">
                Nota QuickPay TW mengonfirmasi typo huruf "Z" oleh agen konter Taichung. Hubungan keluarga inti (adik kandung) terverifikasi via KK tersimpan; direkomendasikan <strong>Setujui &amp; Lepas ke BI-FAST</strong>.
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:6px;margin-top:auto;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#ffffff')}<span>Setujui & Lepas BI-FAST</span></span>
              <span class="e-btn" style="flex:1;justify-content:center;">${ic('refresh', 11, '#334155')}<span>Minta Koreksi MTO</span></span>
              <span class="e-btn e-btn-danger">${ic('alert', 11, '#be123c')}<span>Tolak / STR</span></span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.85;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#0f52ba')}<span>Preview Ekspor XML PPATK IFTI (goAML v5.2)</span></div>
            ${badge('ACK 200 · Batch #04', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;padding:8px 10px;">
            <div class="xml-box" style="flex:1;">${xmlSnippet}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.6px;color:#475569;">
              <span class="mono">SHA-256: 7f2c9b14e0a1...d84e</span>
              <span>Batch berikutnya terkirim otomatis <strong>17:00 WIB</strong></span>
            </div>
          </div>
        </section>
      </div>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'RemitNusa Nexus — Skrining AML/OFAC & Pelaporan PPATK IFTI',
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell({
      activeTab: 'p4',
      pageTitle: 'Konsol Kepatuhan AML/OFAC & Pelaporan PPATK IFTI',
      actionLeftHtml: `<span class="rn-filter-pill is-on">POJK 8/2023</span><span class="rn-filter-pill">PPATK goAML v5.2</span>`,
      actionRightHtml: `<span class="e-btn">${ic('fileText', 11, '#334155')}<span>Audit Log WORM</span></span><span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Ekspor XML IFTI</span></span>`,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 5: TOPOLOGI ISO 20022 & TELEMETRI REL BI-FAST
// ============================================================================
function renderPage5() {
  const kpiHtml = `<section class="rn-kpi-grid" style="grid-template-columns:repeat(5, 1fr);">
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Core Switch .NET 9</span>${ic('server', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">8 / 8 Pod</div>
      <div class="rn-kpi-sub"><span>CPU 34% · GC Pause 1,8 ms</span><span style="color:#047857;font-weight:700;">Healthy</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Event Bus Kafka Cluster</span>${ic('activity', 12, '#047857')}</div>
      <div class="rn-kpi-val">42,8 TPS</div>
      <div class="rn-kpi-sub"><span>3 Broker · Consumer Lag 12 ms</span></div>
    </div>
    <div class="rn-kpi accent">
      <div class="rn-kpi-lbl"><span>Konektor BI-FAST CI</span>${ic('lock', 12, '#0f52ba')}</div>
      <div class="rn-kpi-val">99,98%</div>
      <div class="rn-kpi-sub"><span>TLS 1.3 mTLS · Cert Valid 214 hr</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Validasi Skema ISO 20022</span>${ic('checkCircle', 12, '#047857')}</div>
      <div class="rn-kpi-val">99,84%</div>
      <div class="rn-kpi-sub"><span>pacs.008 · acmt.023 · camt.054</span></div>
    </div>
    <div class="rn-kpi ok">
      <div class="rn-kpi-lbl"><span>Dead-Letter Queue (DLQ)</span>${ic('database', 12, '#047857')}</div>
      <div class="rn-kpi-val">0 pesan</div>
      <div class="rn-kpi-sub"><span>Idempotency Key Redis + Postgres</span></div>
    </div>
  </section>`;

  const topologySvg = `<svg viewBox="0 0 1540 226" width="100%" height="226" style="display:block;">
    <defs>
      <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f52ba"/>
      </marker>
      <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#047857"/>
      </marker>
      <marker id="arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569"/>
      </marker>
    </defs>

    <!-- Stage 1: Overseas MTO Corridors -->
    <rect x="8" y="10" width="248" height="204" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="10" width="248" height="24" rx="4" fill="#0b1c36"/>
    <text x="18" y="26" font-size="10.2" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">1. MITRA MTO LUAR NEGERI (5 KORIDOR)</text>

    <g font-family="Consolas,monospace" font-size="9.5">
      <rect x="18" y="42" width="228" height="28" rx="3" fill="#ffffff" stroke="#d5dde8"/>
      <circle cx="28" cy="56" r="3.5" fill="#10b981"/>
      <text x="38" y="54" font-weight="700" fill="#0b1c36">SG · Singtel Dash / DBS</text>
      <text x="238" y="54" text-anchor="end" fill="#0f52ba" font-weight="700">2.840 tx</text>
      <text x="38" y="65" font-size="8.6" fill="#64748b">SGD/IDR 11.840 · 3,8 dtk</text>

      <rect x="18" y="75" width="228" height="28" rx="3" fill="#ffffff" stroke="#d5dde8"/>
      <circle cx="28" cy="89" r="3.5" fill="#10b981"/>
      <text x="38" y="87" font-weight="700" fill="#0b1c36">MY · Merchantrade / TNG</text>
      <text x="238" y="87" text-anchor="end" fill="#0f52ba" font-weight="700">2.610 tx</text>
      <text x="38" y="98" font-size="8.6" fill="#64748b">MYR/IDR 3.585 · 4,1 dtk</text>

      <rect x="18" y="108" width="228" height="28" rx="3" fill="#ffffff" stroke="#d5dde8"/>
      <circle cx="28" cy="122" r="3.5" fill="#10b981"/>
      <text x="38" y="120" font-weight="700" fill="#0b1c36">HK · TNG / WeChat Remit</text>
      <text x="238" y="120" text-anchor="end" fill="#0f52ba" font-weight="700">1.590 tx</text>
      <text x="38" y="131" font-size="8.6" fill="#64748b">HKD/IDR 2.033 · 4,3 dtk</text>

      <rect x="18" y="141" width="228" height="28" rx="3" fill="#fffbeb" stroke="#fde68a"/>
      <circle cx="28" cy="155" r="3.5" fill="#f59e0b"/>
      <text x="38" y="153" font-weight="700" fill="#0b1c36">TW · QuickPay / EEC</text>
      <text x="238" y="153" text-anchor="end" fill="#b45309" font-weight="700">1.420 tx</text>
      <text x="38" y="164" font-size="8.6" fill="#92400e">TWD/IDR 490 · 1 Hold AML</text>

      <rect x="18" y="174" width="228" height="28" rx="3" fill="#ffffff" stroke="#d5dde8"/>
      <circle cx="28" cy="188" r="3.5" fill="#10b981"/>
      <text x="38" y="186" font-weight="700" fill="#0b1c36">JP · SBI / Kyodai Remit</text>
      <text x="238" y="186" text-anchor="end" fill="#0f52ba" font-weight="700">1.020 tx</text>
      <text x="38" y="197" font-size="8.6" fill="#64748b">JPY/IDR 104 · 4,5 dtk</text>
    </g>

    <!-- Connector 1 -> 2 -->
    <line x1="256" y1="112" x2="314" y2="112" stroke="#0f52ba" stroke-width="1.8" marker-end="url(#arr-blue)"/>
    <rect x="260" y="90" width="50" height="16" rx="2" fill="#e8f0fe" stroke="#bfdbfe"/>
    <text x="285" y="101" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#0b3d91">pacs.008</text>

    <!-- Stage 2: Partner ISO-20022 API Gateway -->
    <rect x="318" y="24" width="236" height="176" rx="4" fill="#ffffff" stroke="#0f52ba" stroke-width="1.4"/>
    <rect x="318" y="24" width="236" height="24" rx="4" fill="#0f52ba"/>
    <text x="328" y="40" font-size="10.2" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">2. ISO-20022 API GATEWAY (.NET 9)</text>
    <g font-family="Segoe UI,system-ui,sans-serif" font-size="10" fill="#1e293b">
      <text x="330" y="68" font-weight="700">mTLS + JWS Signature Verifier</text>
      <text x="330" y="83" font-size="9.3" fill="#475569">Validasi XSD pacs.008.001.08 &amp; acmt.023</text>
      <line x1="330" y1="94" x2="542" y2="94" stroke="#e2e8f0"/>
      <text x="330" y="112" font-weight="700">BIS Nexus Quote &amp; Proxy Mapper</text>
      <text x="330" y="127" font-size="9.3" fill="#475569">Kunci kurs 120 dtk · Idempotency Key</text>
      <line x1="330" y1="138" x2="542" y2="138" stroke="#e2e8f0"/>
      <rect x="330" y="148" width="100" height="38" rx="3" fill="#f8fafc" stroke="#d5dde8"/>
      <text x="338" y="162" font-size="8.5" fill="#64748b">THROUGHPUT</text>
      <text x="338" y="178" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#0b1c36">42,8 TPS</text>
      <rect x="438" y="148" width="104" height="38" rx="3" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="446" y="162" font-size="8.5" fill="#047857">LATENSI P95</text>
      <text x="446" y="178" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#047857">38 ms</text>
    </g>

    <!-- Connector 2 -> 3 -->
    <line x1="554" y1="112" x2="612" y2="112" stroke="#0f52ba" stroke-width="1.8" marker-end="url(#arr-blue)"/>
    <rect x="559" y="90" width="48" height="16" rx="2" fill="#e8f0fe" stroke="#bfdbfe"/>
    <text x="583" y="101" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#0b3d91">Kafka</text>

    <!-- Stage 3: FX + Name Check + AML Core -->
    <rect x="616" y="10" width="286" height="204" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="616" y="10" width="286" height="24" rx="4" fill="#0b1c36"/>
    <text x="626" y="26" font-size="10.2" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">3. CORE ENGINE: FX + VALIDASI NAMA + AML</text>

    <rect x="628" y="44" width="262" height="46" rx="3" fill="#ffffff" stroke="#bfdbfe"/>
    <text x="638" y="60" font-size="10" font-weight="700" fill="#0b3d91">FX Quote Engine (5 Pair ASEAN/JP)</text>
    <text x="638" y="75" font-family="Consolas,monospace" font-size="9.2" fill="#334155">Spread rata 0,45% · Lock TTL 120 dtk · 19 ms</text>

    <rect x="628" y="98" width="262" height="48" rx="3" fill="#ecfdf5" stroke="#a7f3d0"/>
    <text x="638" y="114" font-size="10" font-weight="700" fill="#047857">Pre-Debit Name Inquiry (acmt.023/024)</text>
    <text x="638" y="129" font-family="Consolas,monospace" font-size="9.2" fill="#065f46">98,9% Cocok · 58 ditolak pra-debit · 680 ms</text>

    <rect x="628" y="154" width="262" height="48" rx="3" fill="#fffbeb" stroke="#fde68a"/>
    <text x="638" y="170" font-size="10" font-weight="700" fill="#b45309">Skrining OFAC / DTTOT &amp; Structuring</text>
    <text x="638" y="185" font-family="Consolas,monospace" font-size="9.2" fill="#78350f">9.480 terskrining · 2 ditahan L2 · 290 ms</text>

    <!-- Connector 3 -> 4 -->
    <line x1="902" y1="112" x2="960" y2="112" stroke="#0f52ba" stroke-width="1.8" marker-end="url(#arr-blue)"/>
    <rect x="907" y="90" width="48" height="16" rx="2" fill="#e8f0fe" stroke="#bfdbfe"/>
    <text x="931" y="101" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#0b3d91">ACMT OK</text>

    <!-- Stage 4: Ledger + BI-FAST Router -->
    <rect x="964" y="20" width="256" height="184" rx="4" fill="#ffffff" stroke="#0f52ba" stroke-width="1.4"/>
    <rect x="964" y="20" width="256" height="24" rx="4" fill="#0f52ba"/>
    <text x="974" y="36" font-size="10.2" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">4. LEDGER POSTGRES &amp; ROUTER BI-FAST</text>

    <rect x="976" y="54" width="232" height="58" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="986" y="71" font-size="10" font-weight="700" fill="#0b1c36">PostgreSQL Multi-Currency Ledger</text>
    <text x="986" y="86" font-family="Consolas,monospace" font-size="9.2" fill="#334155">Double-entry Vostro -&gt; Prefund IDR</text>
    <text x="986" y="100" font-family="Consolas,monospace" font-size="9.2" font-weight="700" fill="#047857">Saldo Pool: Rp 14,85 M · Selisih Rp 0</text>

    <rect x="976" y="122" width="232" height="70" rx="3" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="986" y="139" font-size="10" font-weight="700" fill="#0b3d91">BI-FAST CI Router (BIFAST-JKT1)</text>
    <text x="986" y="154" font-family="Consolas,monospace" font-size="9.2" fill="#1e3a8a">pacs.008 -&gt; Hub BI -&gt; Bank Penerima</text>
    <text x="986" y="169" font-family="Consolas,monospace" font-size="9.2" fill="#1e3a8a">pacs.002 ACSC · p95 2,19 dtk</text>
    <text x="986" y="183" font-family="Consolas,monospace" font-size="9" font-weight="700" fill="#047857">5 Bank Pool Aktif · 99,98% Uptime</text>

    <!-- Connectors 4 -> 5 -->
    <path d="M 1220 78 L 1278 78" fill="none" stroke="#047857" stroke-width="1.8" marker-end="url(#arr-green)"/>
    <path d="M 1220 158 L 1278 158" fill="none" stroke="#475569" stroke-width="1.6" stroke-dasharray="4,2" marker-end="url(#arr-slate)"/>
    <text x="1249" y="71" text-anchor="middle" font-size="8.4" font-weight="700" font-family="Consolas,monospace" fill="#047857">BI-FAST</text>
    <text x="1249" y="151" text-anchor="middle" font-size="8.4" font-weight="700" font-family="Consolas,monospace" fill="#475569">Async XML</text>

    <!-- Stage 5A: Bank Penerima Indonesia -->
    <rect x="1282" y="20" width="250" height="94" rx="4" fill="#ecfdf5" stroke="#047857" stroke-width="1.3"/>
    <rect x="1282" y="20" width="250" height="22" rx="4" fill="#047857"/>
    <text x="1292" y="35" font-size="9.8" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">5A. REKENING PENERIMA (BI-FAST)</text>
    <text x="1294" y="59" font-size="10.2" font-weight="700" fill="#065f46">BRI · Mandiri · BNI · BCA · BSI</text>
    <text x="1294" y="76" font-family="Consolas,monospace" font-size="11.5" font-weight="700" fill="#0b1c36">9.376 Masuk · Rp 48,62 M</text>
    <text x="1294" y="94" font-family="Consolas,monospace" font-size="9.2" fill="#047857">Rata 4,2 dtk · Notifikasi SMS/WA PMI</text>

    <!-- Stage 5B: PPATK IFTI -->
    <rect x="1282" y="124" width="250" height="80" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>
    <rect x="1282" y="124" width="250" height="22" rx="4" fill="#334155"/>
    <text x="1292" y="139" font-size="9.8" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">5B. PELAPORAN PPATK goAML IFTI</text>
    <text x="1294" y="163" font-family="Consolas,monospace" font-size="10.5" font-weight="700" fill="#0b1c36">Batch #IFTI-261122-04</text>
    <text x="1294" y="180" font-family="Consolas,monospace" font-size="9.2" fill="#475569">9.376 XML v5.2 · 0 Gagal · WORM</text>
    <text x="1294" y="194" font-family="Consolas,monospace" font-size="8.8" fill="#047857">ACK 200 OK · Retensi 5 Tahun</text>
  </svg>`;

  const isoXml = `<span class="xml-cmt">&lt;!-- [1] REQUEST: ISO 20022 pacs.008.001.08 · BIS Nexus -&gt; BI-FAST RRN 2026112088412 --&gt;</span>
<span class="xml-tag">&lt;FIToFICstmrCdtTrf&gt;</span>
  <span class="xml-tag">&lt;GrpHdr&gt;&lt;MsgId&gt;</span><span class="xml-val">RNUSA-20261122-SG01-88412</span><span class="xml-tag">&lt;/MsgId&gt;&lt;SttlmMtd&gt;</span><span class="xml-val">CLRG</span><span class="xml-tag">&lt;/SttlmMtd&gt;&lt;ClrSys&gt;</span><span class="xml-val">BIFAST</span><span class="xml-tag">&lt;/ClrSys&gt;&lt;/GrpHdr&gt;</span>
  <span class="xml-tag">&lt;CdtTrfTxInf&gt;</span>
    <span class="xml-tag">&lt;PmtId&gt;&lt;EndToEndId&gt;</span><span class="xml-val">RM-SG01-20261122</span><span class="xml-tag">&lt;/EndToEndId&gt;&lt;TxId&gt;</span><span class="xml-val">2026112088412</span><span class="xml-tag">&lt;/TxId&gt;&lt;/PmtId&gt;</span>
    <span class="xml-tag">&lt;IntrBkSttlmAmt</span> <span class="xml-attr">Ccy="IDR"</span><span class="xml-tag">&gt;</span><span class="xml-val">5328000.00</span><span class="xml-tag">&lt;/IntrBkSttlmAmt&gt;</span>
    <span class="xml-tag">&lt;InstdAmt</span> <span class="xml-attr">Ccy="SGD"</span><span class="xml-tag">&gt;</span><span class="xml-val">450.00</span><span class="xml-tag">&lt;/InstdAmt&gt;</span> <span class="xml-tag">&lt;XchgRate&gt;</span><span class="xml-val">11840.00</span><span class="xml-tag">&lt;/XchgRate&gt;</span>
    <span class="xml-tag">&lt;DbtrAgt&gt;&lt;BICFI&gt;</span><span class="xml-val">SINGDGSG</span><span class="xml-tag">&lt;/BICFI&gt;&lt;/DbtrAgt&gt;</span> <span class="xml-tag">&lt;CdtrAgt&gt;&lt;BICFI&gt;</span><span class="xml-val">BRINIDJA</span><span class="xml-tag">&lt;/BICFI&gt;&lt;/CdtrAgt&gt;</span>
    <span class="xml-tag">&lt;Cdtr&gt;&lt;Nm&gt;</span><span class="xml-val">SITI ROHMAH</span><span class="xml-tag">&lt;/Nm&gt;&lt;/Cdtr&gt;</span> <span class="xml-tag">&lt;CdtrAcct&gt;&lt;Id&gt;</span><span class="xml-val">002801041822534</span><span class="xml-tag">&lt;/Id&gt;&lt;/CdtrAcct&gt;</span>
  <span class="xml-tag">&lt;/CdtTrfTxInf&gt;</span>
<span class="xml-tag">&lt;/FIToFICstmrCdtTrf&gt;</span>
<span class="xml-cmt">------------------------------------------------------------------------------------------</span>
<span class="xml-cmt">&lt;!-- [2] RESPONSE: ISO 20022 pacs.002.001.10 · Konfirmasi Settlement BI-FAST (3,8 dtk) --&gt;</span>
<span class="xml-tag">&lt;FIToFIPmtStsRpt&gt;</span>
  <span class="xml-tag">&lt;OrgnlGrpInfAndSts&gt;&lt;OrgnlMsgId&gt;</span><span class="xml-val">RNUSA-20261122-SG01-88412</span><span class="xml-tag">&lt;/OrgnlMsgId&gt;&lt;/OrgnlGrpInfAndSts&gt;</span>
  <span class="xml-tag">&lt;TxInfAndSts&gt;</span>
    <span class="xml-tag">&lt;OrgnlTxId&gt;</span><span class="xml-val">2026112088412</span><span class="xml-tag">&lt;/OrgnlTxId&gt;</span> <span class="xml-tag">&lt;TxSts&gt;</span><span class="xml-val">ACSC</span><span class="xml-tag">&lt;/TxSts&gt;</span> <span class="xml-tag">&lt;StsRsnInf&gt;</span><span class="xml-val">U000:OK</span><span class="xml-tag">&lt;/StsRsnInf&gt;</span>
    <span class="xml-tag">&lt;AccptncDtTm&gt;</span><span class="xml-val">2026-11-22T15:26:51.904+07:00</span><span class="xml-tag">&lt;/AccptncDtTm&gt;</span>
    <span class="xml-tag">&lt;ClrSysRef&gt;</span><span class="xml-val">BIFAST-JKT1-RRN2026112088412</span><span class="xml-tag">&lt;/ClrSysRef&gt;</span>
  <span class="xml-tag">&lt;/TxInfAndSts&gt;</span>
<span class="xml-tag">&lt;/FIToFIPmtStsRpt&gt;</span>`;

  const kafkaRows = KAFKA_TOPICS.map(
    (k) => `<tr>
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(k.topic)}</td>
      <td class="num mono">${k.part}</td>
      <td class="num mono">${esc(k.tps)}</td>
      <td class="num mono" style="color:#047857;font-weight:700;">${esc(k.lag)}</td>
      <td class="num mono">${esc(k.p95)}</td>
      <td class="num mono">${esc(k.err)}</td>
      <td>${badge(k.state, k.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `${kpiHtml}
    <section class="e-panel" style="flex:0 0 286px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 13, '#0f52ba')}<span>Topologi Switch Lintas Negara End-to-End (MTO -&gt; ISO 20022 -&gt; FX/AML -&gt; BI-FAST &amp; PPATK)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('.NET 9 + Kafka + PostgreSQL', 'accent')}
          ${badge('BIS Nexus Spec v2.1', 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:6px 10px 4px;display:flex;flex-direction:column;justify-content:space-between;">
        ${topologySvg}
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid #eef2f6;font-family:var(--e-mono);font-size:9.3px;color:#475569;">
          <span>Alur Hop: 5 Tahap Atomik · End-to-End p50: 3,6 dtk · p95: 6,8 dtk · Idempotency: 100%</span>
          <span style="color:#047857;font-weight:700;">Enkripsi: TLS 1.3 mTLS + JWS ES256 · Zero Message Loss</span>
        </div>
      </div>
    </section>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.08fr 1fr;gap:9px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#0f52ba')}<span>Inspektor Handshake ISO 20022: pacs.008 -&gt; pacs.002</span></div>
          <span class="e-panel-sub mono">RRN 2026112088412 · Valid XSD</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;padding:8px 10px;">
          <div class="xml-box" style="flex:1;">${isoXml}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 9px;font-size:10px;">
            <span class="mono" style="color:#047857;font-weight:700;">pacs.002 TxSts: ACSC (AcceptedSettlementCompleted)</span>
            <span class="mono" style="color:#475569;">JWS ES256 Terverifikasi · 3,8 dtk</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#0f52ba')}<span>Telemetri Topik Kafka &amp; Kesehatan Konektor Rel Eksternal</span></div>
          ${badge('7/7 Topik Sehat', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.2px;">
            <colgroup>
              <col style="width:32%;" />
              <col style="width:7%;" />
              <col style="width:14%;" />
              <col style="width:11%;" />
              <col style="width:12%;" />
              <col style="width:9%;" />
              <col style="width:15%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Topik Kafka / Pipeline</th>
                <th class="num">Part</th>
                <th class="num">Throughput</th>
                <th class="num">Lag</th>
                <th class="num">p95</th>
                <th class="num">Error</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${kafkaRows}</tbody>
            <tfoot>
              <tr>
                <td>TOTAL PIPELINE SWITCH (7 TOPIK)</td>
                <td class="num mono">62</td>
                <td class="num mono">341,9 msg/s</td>
                <td class="num mono" style="color:#047857;">12 msg</td>
                <td class="num mono">4,2 dtk</td>
                <td class="num mono">0,01%</td>
                <td>${badge('Zero DLQ', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;padding:8px 10px 0;">
            <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.5px;font-weight:700;color:#0b1c36;">BI-FAST CI Hub</span>
                <span class="dot dot-ok"></span>
              </div>
              <div class="mono" style="font-size:9.3px;color:#475569;margin-top:2px;">BIFAST-JKT1 · mTLS 1.3</div>
              <div class="mono" style="font-size:9.3px;color:#047857;font-weight:700;margin-top:1px;">Cert Valid 214 hari · 99,98%</div>
            </div>
            <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.5px;font-weight:700;color:#0b1c36;">BIS Nexus FX Feed</span>
                <span class="dot dot-ok"></span>
              </div>
              <div class="mono" style="font-size:9.3px;color:#475569;margin-top:2px;">JISDOR + Reuters Stream</div>
              <div class="mono" style="font-size:9.3px;color:#047857;font-weight:700;margin-top:1px;">Quote Lock 120 dtk · 19 ms</div>
            </div>
            <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.5px;font-weight:700;color:#0b1c36;">PPATK goAML API</span>
                <span class="dot dot-ok"></span>
              </div>
              <div class="mono" style="font-size:9.3px;color:#475569;margin-top:2px;">IFTI XML v5.2 · Batch #04</div>
              <div class="mono" style="font-size:9.3px;color:#047857;font-weight:700;margin-top:1px;">9.376 ACK 200 · 0 Gagal</div>
            </div>
          </div>

          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;margin-top:auto;">
            <span>Failover aktif: <strong>BIFAST-JKT1 (DCI JK5)</strong> -&gt; <strong>BIFAST-SBY2 (Hot-Sync)</strong> · RPO 0 dtk</span>
            <span class="mono" style="color:#047857;font-weight:700;">DR Drill: Lulus 18 Nov 2026</span>
          </div>
        </div>
      </section>
    </div>`;

  return wrapEnterpriseHtml({
    title: 'RemitNusa Nexus — Topologi ISO 20022 & Telemetri Rel BI-FAST',
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell({
      activeTab: 'p5',
      pageTitle: 'Arsitektur Switch ISO 20022 & Monitor Rel BI-FAST',
      actionLeftHtml: `<span class="rn-filter-pill is-on">ISO 20022 v2019</span><span class="rn-filter-pill">Cluster DCI Jakarta JK5</span>`,
      actionRightHtml: `<span class="e-btn">${ic('terminal', 11, '#334155')}<span>Uji Ping BI-FAST CI</span></span><span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Unduh Paket XSD ISO</span></span>`,
      contentHtml,
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
