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
  id: 'ID-011',
  name: 'TapNusa QRIS',
  reference: 'SAP S/4HANA Fiori Horizon + Workday Financial Management',
  persona: 'R. Kusuma · VP Settlement & Treasury · PT TapNusa Pembayaran Nusantara (PJP-I)',
  pages: [
    { slug: 'p1', title: 'Ikhtisar Kliring QRIS Tap, Likuiditas BI-FAST & SLA Transit' },
    { slug: 'p2', title: 'Buku Besar Transaksi & Inspektor APDU / Double-Entry' },
    { slug: 'p3', title: 'Pratinjau Aplikasi Mobile Komuter (.NET MAUI 9 + Kotlin HCE)' },
    { slug: 'p4', title: 'Persetujuan Settlement DoA (Maker-Checker) & Rekonsiliasi FX' },
    { slug: 'p5', title: 'Kepatuhan Bank Indonesia (SNAP BI, PMK 69 & CoreTax XML)' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY RECONCILED ACROSS P1-P5)
// ============================================================================

const CHANNELS = [
  {
    code: 'CH-NFC-TR',
    name: 'QRIS Tap NFC Transit (MRT·KRL·TJ·LRT)',
    rail: 'ASPI QRIS Tap v1.4',
    trx: 368400,
    grossIdr: 2578800000,
    feeRate: '0,7%',
    feeIdr: 18051600,
    netIdr: 2560748400,
    p95Ms: 238,
    status: 'SLA < 300ms',
    tone: 'ok',
  },
  {
    code: 'CH-MPM-RT',
    name: 'QRIS MPM Dinamis (Merchant Ritel)',
    rail: 'ASPI QRIS MPM',
    trx: 142180,
    grossIdr: 5971500000,
    feeRate: '0,7%',
    feeIdr: 41800500,
    netIdr: 5929699500,
    p95Ms: 264,
    status: 'Terselesaikan',
    tone: 'ok',
  },
  {
    code: 'CH-XB-MY',
    name: 'Cross-Border DuitNow QR (Malaysia · MYR)',
    rail: 'LCT BI–BNM',
    trx: 7420,
    grossIdr: 964600000,
    feeRate: '0,9%',
    feeIdr: 8681400,
    netIdr: 955918600,
    p95Ms: 412,
    status: 'Kunci Kurs T+0',
    tone: 'info',
  },
  {
    code: 'CH-XB-TH',
    name: 'Cross-Border PromptPay QR (Thailand · THB)',
    rail: 'LCT BI–BOT',
    trx: 4280,
    grossIdr: 556400000,
    feeRate: '0,9%',
    feeIdr: 5007600,
    netIdr: 551392400,
    p95Ms: 428,
    status: 'Kunci Kurs T+0',
    tone: 'info',
  },
  {
    code: 'CH-XB-SG',
    name: 'Cross-Border NETS / PayNow (Singapura · SGD)',
    rail: 'LCT BI–MAS',
    trx: 3120,
    grossIdr: 663500000,
    feeRate: '0,9%',
    feeIdr: 5971500,
    netIdr: 657528500,
    p95Ms: 396,
    status: 'Menunggu DoA',
    tone: 'warn',
  },
  {
    code: 'CH-BF-TOP',
    name: 'Auto-Topup & Isi Ulang Instan BI-FAST',
    rail: 'BI-FAST ISO 20022',
    trx: 58800,
    grossIdr: 7727700000,
    feeRate: 'Rp 2.500/trx',
    feeIdr: 147000000,
    netIdr: 7580700000,
    p95Ms: 184,
    status: 'Instan 24/7',
    tone: 'ok',
  },
];

const TRANSIT_OPERATORS = [
  { name: 'KAI Commuter (KRL)', trx: 164200, grossIdr: 821000000, p95Ms: 232, gates: '84 Stasiun · 612 Gate' },
  { name: 'MRT Jakarta', trx: 102400, grossIdr: 1024000000, p95Ms: 228, gates: '13 Stasiun · 148 Gate' },
  { name: 'TransJakarta BRT', trx: 74800, grossIdr: 261800000, p95Ms: 244, gates: '248 Halte · 740 Gate' },
  { name: 'LRT Jabodebek', trx: 27000, grossIdr: 472000000, p95Ms: 248, gates: '18 Stasiun · 126 Gate' },
];

const ESCROW_ACCOUNTS = [
  { bank: 'Giro Settlement Bank Indonesia', code: 'BI-RTGS-001', balanceIdr: 4620000000, limitIdr: 7000000000, limitLabel: 'Rp 7,0 M', rail: 'BI-FAST / RTGS', tone: 'ok' },
  { bank: 'PT Bank Central Asia Tbk (BCA)', code: 'BCA-ESC-4821', balanceIdr: 3480000000, limitIdr: 5000000000, limitLabel: 'Rp 5,0 M', rail: 'SNAP BI Direct', tone: 'ok' },
  { bank: 'PT Bank Mandiri (Persero) Tbk', code: 'BMRI-TR-1094', balanceIdr: 2340000000, limitIdr: 4000000000, limitLabel: 'Rp 4,0 M', rail: 'Float Transit', tone: 'ok' },
  { bank: 'PT Bank Negara Indonesia (BNI)', code: 'BNI-LCT-8802', balanceIdr: 1420000000, limitIdr: 2500000000, limitLabel: 'Rp 2,5 M', rail: 'Nostro ASEAN', tone: 'info' },
  { bank: 'PT Bank Rakyat Indonesia (BRI)', code: 'BRI-RTL-5519', balanceIdr: 980000000, limitIdr: 1500000000, limitLabel: 'Rp 1,5 M', rail: 'Settlement Ritel', tone: 'ok' },
];

const FX_CORRIDORS = [
  {
    pair: 'MYR / IDR',
    scheme: 'DuitNow QR · PayNet Malaysia',
    rateIdr: 3590,
    jisdor: 3577,
    spreadBps: '+36 bps',
    trx: 7420,
    volIdr: 964600000,
    volFx: 'MYR 268.690,81',
    nostroFx: 'MYR 420.000',
    quotaPct: 58,
    ttlSec: 45,
    status: 'Aktif · T+0',
    tone: 'ok',
  },
  {
    pair: 'THB / IDR',
    scheme: 'PromptPay QR · NITMX Thailand',
    rateIdr: 462,
    jisdor: 460,
    spreadBps: '+43 bps',
    trx: 4280,
    volIdr: 556400000,
    volFx: 'THB 1.204.329,00',
    nostroFx: 'THB 2.500.000',
    quotaPct: 44,
    ttlSec: 45,
    status: 'Aktif · T+0',
    tone: 'ok',
  },
  {
    pair: 'SGD / IDR',
    scheme: 'NETS / PayNow · MAS Singapura',
    rateIdr: 11840,
    jisdor: 11798,
    spreadBps: '+35 bps',
    trx: 3120,
    volIdr: 663500000,
    volFx: 'SGD 56.038,85',
    nostroFx: 'SGD 115.000',
    quotaPct: 62,
    ttlSec: 30,
    status: 'Review DoA',
    tone: 'warn',
  },
];

// Page 2: 18-Row Ledger Sample (Includes Exact Spec Rows TAP-881, TAP-880, FX-104, TOP-209)
const LEDGER_TXNS = [
  { code: 'TAP-881', rrn: '261120081904', time: '08:19:42', merchant: 'MRT Jakarta — Dukuh Atas BNI (Gate #04)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 230, dir: 'DR', amountIdr: -7000, feeIdr: 49, status: 'Lunas', tone: 'ok', selected: true },
  { code: 'TAP-880', rrn: '261120081418', time: '08:14:18', merchant: 'Kopi Kenangan — Menara Sudirman', rail: 'QRIS MPM Dinamis', corridor: 'ID-Ritel', latMs: 254, dir: 'DR', amountIdr: -28000, feeIdr: 196, status: 'Lunas', tone: 'ok' },
  { code: 'FX-104', rrn: '261120081105', time: '08:11:05', merchant: 'DuitNow QR — KL Sentral (MYR 14,50)', rail: 'ASEAN QR LCT', corridor: 'MY-DuitNow', latMs: 398, dir: 'DR', amountIdr: -52055, feeIdr: 469, status: 'Cross-Border', tone: 'info' },
  { code: 'TOP-209', rrn: '261120080531', time: '08:05:31', merchant: 'BI-FAST Auto Top-Up (BCA ••••4821)', rail: 'BI-FAST Instan', corridor: 'ID-Escrow', latMs: 172, dir: 'CR', amountIdr: 300000, feeIdr: 2500, status: 'Instan', tone: 'ok' },
  { code: 'TAP-879', rrn: '261120080458', time: '08:04:58', merchant: 'KRL Commuter — Stasiun Sudirman (Gate #11)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 226, dir: 'DR', amountIdr: -5000, feeIdr: 35, status: 'Lunas', tone: 'ok' },
  { code: 'TAP-878', rrn: '261120080312', time: '08:03:12', merchant: 'TransJakarta — Halte Tosari Koridor 1', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 241, dir: 'DR', amountIdr: -3500, feeIdr: 25, status: 'Lunas', tone: 'ok' },
  { code: 'TAP-877', rrn: '261120080144', time: '08:01:44', merchant: 'MRT Jakarta — Lebak Bulus Grab (Gate #02)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 218, dir: 'DR', amountIdr: -14000, feeIdr: 98, status: 'Lunas', tone: 'ok' },
  { code: 'FX-103', rrn: '261120075920', time: '07:59:20', merchant: 'PromptPay QR — BTS Asok Bangkok (THB 185)', rail: 'ASEAN QR LCT', corridor: 'TH-PromptPay', latMs: 418, dir: 'DR', amountIdr: -85470, feeIdr: 769, status: 'Cross-Border', tone: 'info' },
  { code: 'TAP-876', rrn: '261120075803', time: '07:58:03', merchant: 'LRT Jabodebek — Stasiun Cawang (Gate #07)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 246, dir: 'DR', amountIdr: -12000, feeIdr: 84, status: 'Lunas', tone: 'ok' },
  { code: 'RTL-412', rrn: '261120075619', time: '07:56:19', merchant: 'Indomaret Point — Stasiun Tanah Abang', rail: 'QRIS MPM Dinamis', corridor: 'ID-Ritel', latMs: 262, dir: 'DR', amountIdr: -34500, feeIdr: 242, status: 'Lunas', tone: 'ok' },
  { code: 'TOP-208', rrn: '261120075447', time: '07:54:47', merchant: 'BI-FAST Auto Top-Up (Mandiri ••••1094)', rail: 'BI-FAST Instan', corridor: 'ID-Escrow', latMs: 186, dir: 'CR', amountIdr: 250000, feeIdr: 2500, status: 'Instan', tone: 'ok' },
  { code: 'FX-102', rrn: '261120075211', time: '07:52:11', merchant: 'NETS QR — Changi Airport T3 (SGD 19,80)', rail: 'ASEAN QR LCT', corridor: 'SG-NETS', latMs: 389, dir: 'DR', amountIdr: -234432, feeIdr: 2110, status: 'Pending DoA', tone: 'warn', warn: true },
  { code: 'TAP-875', rrn: '261120075036', time: '07:50:36', merchant: 'KRL Commuter — Stasiun Bekasi (Gate #06)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 234, dir: 'DR', amountIdr: -4000, feeIdr: 28, status: 'Lunas', tone: 'ok' },
  { code: 'RTL-411', rrn: '261120074852', time: '07:48:52', merchant: 'Fore Coffee — Plaza Indonesia B1', rail: 'QRIS MPM Dinamis', corridor: 'ID-Ritel', latMs: 249, dir: 'DR', amountIdr: -39000, feeIdr: 273, status: 'Lunas', tone: 'ok' },
  { code: 'TAP-874', rrn: '261120074615', time: '07:46:15', merchant: 'MRT Jakarta — Istora Mandiri (Gate #01)', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 221, dir: 'DR', amountIdr: -9000, feeIdr: 63, status: 'Lunas', tone: 'ok' },
  { code: 'TOP-207', rrn: '261120074408', time: '07:44:08', merchant: 'BI-FAST Top-Up Manual (BNI ••••8802)', rail: 'BI-FAST Instan', corridor: 'ID-Escrow', latMs: 179, dir: 'CR', amountIdr: 500000, feeIdr: 2500, status: 'Instan', tone: 'ok' },
  { code: 'TAP-873', rrn: '261120074229', time: '07:42:29', merchant: 'TransJakarta — Halte Harmoni Sentral', rail: 'QRIS Tap NFC', corridor: 'ID-Transit', latMs: 245, dir: 'DR', amountIdr: -3500, feeIdr: 25, status: 'Lunas', tone: 'ok' },
  { code: 'RTL-410', rrn: '261120074011', time: '07:40:11', merchant: 'Alfamart Express — Stasiun Gondangdia', rail: 'QRIS MPM Dinamis', corridor: 'ID-Ritel', latMs: 258, dir: 'DR', amountIdr: -21500, feeIdr: 151, status: 'Lunas', tone: 'ok' },
];

const TAP881_SPANS = [
  { label: '1. HCE SELECT AID (NFC)', start: 0, dur: 24, color: '#0f52ba' },
  { label: '2. APDU Cryptogram TEE', start: 24, dur: 38, color: '#1d6ce0' },
  { label: '3. Gate -> ASPI Switch', start: 62, dur: 54, color: '#0369a1' },
  { label: '4. SNAP BI mTLS Auth', start: 116, dur: 28, color: '#0d9488' },
  { label: '5. PG Double-Entry Lock', start: 144, dur: 46, color: '#047857' },
  { label: '6. ISO 8583 ACK & Gate', start: 190, dur: 40, color: '#475569' },
];

// Page 3: Commuter Monthly Claim Recap (Nov 2026)
const CLAIM_ITEMS = [
  { operator: 'MRT Jakarta (Lebak Bulus–Dukuh Atas)', trips: 22, totalIdr: 264000, lastRef: '#MRT-20261120-881' },
  { operator: 'KAI Commuter KRL (Bekasi–Sudirman)', trips: 14, totalIdr: 84000, lastRef: '#KRL-20261120-879' },
  { operator: 'TransJakarta BRT (Koridor 1 & 9)', trips: 4, totalIdr: 14000, lastRef: '#TJ-20261120-878' },
  { operator: 'Transit Dinas ASEAN (KL Sentral & SG)', trips: 2, totalIdr: 286500, lastRef: '#FX-20261120-104' },
];

// Page 4: 14-Row Settlement Batches (EXACTLY SUM TO P1 CHANNELS GRAND TOTALS)
const SETTLEMENT_BATCHES = [
  { id: 'STL-1120-01', partner: 'PT MRT Jakarta (Perseroda)', ccy: 'IDR', trx: 102400, grossIdr: 1024000000, feeIdr: 7168000, netIdr: 1016832000, doa: 'T2 · Treasury', status: 'Disetujui', tone: 'ok' },
  { id: 'STL-1120-02', partner: 'PT Kereta Commuter Indonesia', ccy: 'IDR', trx: 164200, grossIdr: 821000000, feeIdr: 5747000, netIdr: 815253000, doa: 'T2 · Treasury', status: 'Disetujui', tone: 'ok' },
  { id: 'STL-1120-03', partner: 'PT Transportasi Jakarta (TJ)', ccy: 'IDR', trx: 74800, grossIdr: 261800000, feeIdr: 1832600, netIdr: 259967400, doa: 'T1 · Ops Mgr', status: 'BI-FAST OK', tone: 'ok' },
  { id: 'STL-1120-04', partner: 'LRT Jabodebek (Divisi KAI)', ccy: 'IDR', trx: 27000, grossIdr: 472000000, feeIdr: 3304000, netIdr: 468696000, doa: 'T1 · Ops Mgr', status: 'BI-FAST OK', tone: 'ok' },
  { id: 'STL-1120-05', partner: 'Grup Ritel (Indomaret · Alfa)', ccy: 'IDR', trx: 68400, grossIdr: 2840000000, feeIdr: 19880000, netIdr: 2820120000, doa: 'T3 · VP Treas', status: 'Tunggu DoA', tone: 'warn', selected: true },
  { id: 'STL-1120-06', partner: 'Jaringan F&B (Kenangan · Fore)', ccy: 'IDR', trx: 41280, grossIdr: 1651500000, feeIdr: 11560500, netIdr: 1639939500, doa: 'T2 · Treasury', status: 'Disetujui', tone: 'ok' },
  { id: 'STL-1120-07', partner: 'Aggregator UMKM Jabodetabek', ccy: 'IDR', trx: 32500, grossIdr: 1480000000, feeIdr: 10360000, netIdr: 1469640000, doa: 'T2 · Treasury', status: 'Disetujui', tone: 'ok' },
  { id: 'STL-1120-08', partner: 'PayNet Malaysia (DuitNow LCT)', ccy: 'MYR', trx: 7420, grossIdr: 964600000, feeIdr: 8681400, netIdr: 955918600, doa: 'T2 · FX LCT', status: 'Kurs T+0', tone: 'info' },
  { id: 'STL-1120-09', partner: 'NITMX Thailand (PromptPay)', ccy: 'THB', trx: 4280, grossIdr: 556400000, feeIdr: 5007600, netIdr: 551392400, doa: 'T2 · FX LCT', status: 'Kurs T+0', tone: 'info' },
  { id: 'STL-1120-10', partner: 'NETS / PayNow Singapore', ccy: 'SGD', trx: 3120, grossIdr: 663500000, feeIdr: 5971500, netIdr: 657528500, doa: 'T2 · FX LCT', status: 'Tunggu DoA', tone: 'warn' },
  { id: 'STL-1120-11', partner: 'Bank BCA (Auto-Topup Escrow)', ccy: 'IDR', trx: 26400, grossIdr: 3564000000, feeIdr: 66000000, netIdr: 3498000000, doa: 'T3 · VP Treas', status: 'BI-FAST OK', tone: 'ok' },
  { id: 'STL-1120-12', partner: 'Bank Mandiri (Topup BI-FAST)', ccy: 'IDR', trx: 15200, grossIdr: 1976000000, feeIdr: 38000000, netIdr: 1938000000, doa: 'T2 · Treasury', status: 'BI-FAST OK', tone: 'ok' },
  { id: 'STL-1120-13', partner: 'Bank BNI (Escrow & Nostro)', ccy: 'IDR', trx: 10100, grossIdr: 1313000000, feeIdr: 25250000, netIdr: 1287750000, doa: 'T2 · Treasury', status: 'BI-FAST OK', tone: 'ok' },
  { id: 'STL-1120-14', partner: 'Bank BRI (Topup Ritel)', ccy: 'IDR', trx: 7100, grossIdr: 874700000, feeIdr: 17750000, netIdr: 856950000, doa: 'T2 · Treasury', status: 'BI-FAST OK', tone: 'ok' },
];

// Page 5: Regulatory Controls, SNAP BI mTLS Certificates & WORM Audit Log
const COMPLIANCE_CONTROLS = [
  { code: 'BI-PJP-01', reg: 'PBI No. 23/6/PBI/2021 (PJP Kategori I)', scope: 'Dana Float 100% di Escrow Bank Umum & Giro BI', owner: 'Treasury Ops', evidence: 'LKPBU-20261120', status: 'Patuh', tone: 'ok' },
  { code: 'ASPI-NFC-02', reg: 'PADG QRIS Tap NFC v1.4 (ASPI)', scope: 'Latensi End-to-End HCE < 300ms (p95: 238ms)', owner: 'Switch Eng', evidence: 'ASPI-CERT-881', status: 'Patuh', tone: 'ok' },
  { code: 'SNAP-BI-03', reg: 'Standar Nasional Open API (SNAP BI v2.1)', scope: 'OAuth2 B2B + mTLS + Asymmetric RSA-SHA256', owner: 'API Security', evidence: 'SNAP-AUD-Q4', status: 'Patuh', tone: 'ok' },
  { code: 'BIFAST-04', reg: 'Aturan BI-FAST ISO 20022 (pacs.008)', scope: 'Auto-Topup Real-Time 24/7 & Proxy Alias', owner: 'Payment Core', evidence: 'BI-CONN-9998', status: 'Patuh', tone: 'ok' },
  { code: 'LCT-FX-05', reg: 'Local Currency Transaction (BI–BNM–BOT–MAS)', scope: 'Transparansi Kurs IDR Sebelum PIN & Batas Kuota', owner: 'FX Switch', evidence: 'LCT-RPT-1120', status: 'Patuh', tone: 'ok' },
  { code: 'DJP-PMK-06', reg: 'PMK No. 69/PMK.03/2022 (PPN Fintech)', scope: 'PPN 11% atas Jasa MDR & Biaya BI-FAST ke CoreTax', owner: 'Tax & Acc', evidence: 'EFK-040-1120', status: 'Siap Unggah', tone: 'info' },
  { code: 'PSAK-72-07', reg: 'PSAK 72 Pengakuan Pendapatan Kontrak', scope: 'Pemisahan Gross Float vs Net Fee Double-Entry', owner: 'Controller', evidence: 'GL-BAL-000', status: 'Seimbang', tone: 'ok' },
  { code: 'UU-PDP-08', reg: 'UU No. 27/2022 Pelindungan Data Pribadi', scope: 'Tokenisasi PAN & Enkripsi PII di DC Jakarta', owner: 'DPO / CISO', evidence: 'DPIA-2026-09', status: 'Patuh', tone: 'ok' },
  { code: 'APUPPT-09', reg: 'POJK APU-PPT & PPATK (LTKM Otomatis)', scope: 'Skrining Velocity Auto-Topup & Transaksi FX', owner: 'Compliance', evidence: 'AML-SCR-00', status: '0 Alert', tone: 'ok' },
  { code: 'PCI-HCE-10', reg: 'PCI-DSS v4.0 & StrongBox TEE Android', scope: 'Kunci Kriptogram HCE Single-Use Tanpa Simpan PAN', owner: 'Mobile Sec', evidence: 'QSA-2026-ID', status: 'Tersertifikasi', tone: 'ok' },
];

const SNAP_ENDPOINTS = [
  { service: 'ASPI QRIS Tap Switch Primary', url: 'mtls.aspi-qris.id/v1.4/nfc-tap', cipher: 'TLS 1.3 · RSA-4096', p95: '54 ms', expiry: '142 hari', status: 'Aktif', tone: 'ok' },
  { service: 'BI-FAST Hub (ISO 20022 pacs.008)', url: 'bifast-gw.bi.go.id/pacs008', cipher: 'TLS 1.3 · HSM FIPS', p95: '68 ms', expiry: '198 hari', status: 'Aktif', tone: 'ok' },
  { service: 'BCA SNAP BI Direct Debit', url: 'api.bca.co.id/snap/v2.1/debit', cipher: 'TLS 1.3 · OAuth2', p95: '74 ms', expiry: '89 hari', status: 'Aktif', tone: 'ok' },
  { service: 'Mandiri SNAP BI Escrow Host', url: 'apigw.bankmandiri.co.id/snap', cipher: 'TLS 1.3 · OAuth2', p95: '82 ms', expiry: '114 hari', status: 'Aktif', tone: 'ok' },
  { service: 'PayNet MY DuitNow LCT Switch', url: 'lct-my.aspi-asean.org/duitnow', cipher: 'TLS 1.3 · mTLS', p95: '138 ms', expiry: '64 hari', status: 'Aktif', tone: 'ok' },
  { service: 'NITMX TH / NETS SG FX Quote', url: 'lct-thsg.aspi-asean.org/fx', cipher: 'TLS 1.3 · mTLS', p95: '146 ms', expiry: '31 hari', status: 'Jadwal Rotasi', tone: 'warn' },
];

const WORM_LOGS = [
  { seq: '#584200', time: '08:19:42', actor: 'switch-core-jkt1', action: 'COMMIT TAP-881 MRT Dukuh Atas (-Rp 7.000)', hash: '8f4c1a9e...d27b' },
  { seq: '#584199', time: '08:16:05', actor: 'tax-coretax-job', action: 'BUILD CoreTax XML 040-26.881024 (PPN 11%)', hash: '3e91b4c0...7a12' },
  { seq: '#584198', time: '08:11:19', actor: 's.rahmawati', action: 'CHECKER_SIGN STL-1120-05 (Rp 2,84M -> Tier 3)', hash: 'c720f5a8...94e1' },
  { seq: '#584197', time: '08:05:31', actor: 'bifast-auto-eng', action: 'AUTO_TOPUP TOP-209 BCA (+Rp 300.000 Instan)', hash: '5a19d8b3...1f08' },
  { seq: '#584196', time: '07:58:14', actor: 'a.wijaya', action: 'MAKER_SUBMIT Rekonsiliasi 14 Mitra (0 Selisih)', hash: '91b4e2f7...4c63' },
  { seq: '#584195', time: '07:45:00', actor: 'ledger-recon-01', action: 'VERIFY 584.200 Jurnal Harian Double-Entry OK', hash: '0d82a6c4...e95a' },
];

// Computed Constants
const TOTAL_TRX = CHANNELS.reduce((a, c) => a + c.trx, 0);
const TOTAL_GROSS = CHANNELS.reduce((a, c) => a + c.grossIdr, 0);
const TOTAL_FEE = CHANNELS.reduce((a, c) => a + c.feeIdr, 0);
const TOTAL_NET = CHANNELS.reduce((a, c) => a + c.netIdr, 0);
const XB_TRX = CHANNELS.slice(2, 5).reduce((a, c) => a + c.trx, 0);
const XB_GROSS = CHANNELS.slice(2, 5).reduce((a, c) => a + c.grossIdr, 0);
const TOTAL_ESCROW = ESCROW_ACCOUNTS.reduce((a, e) => a + e.balanceIdr, 0);
const TOTAL_ESCROW_LIMIT = ESCROW_ACCOUNTS.reduce((a, e) => a + e.limitIdr, 0);
const PPN_11_IDR = Math.round(TOTAL_FEE * 0.11);
const TOTAL_INVOICE_TAX = TOTAL_FEE + PPN_11_IDR;

const LEDGER_DR = LEDGER_TXNS.filter((t) => t.dir === 'DR').reduce((a, t) => a + Math.abs(t.amountIdr), 0);
const LEDGER_CR = LEDGER_TXNS.filter((t) => t.dir === 'CR').reduce((a, t) => a + t.amountIdr, 0);
const LEDGER_NET = LEDGER_CR - LEDGER_DR;
const LEDGER_FEES = LEDGER_TXNS.reduce((a, t) => a + t.feeIdr, 0);

const CLAIM_TRIPS = CLAIM_ITEMS.reduce((a, i) => a + i.trips, 0);
const CLAIM_TOTAL = CLAIM_ITEMS.reduce((a, i) => a + i.totalIdr, 0);

export function verifyMath() {
  if (TOTAL_TRX !== 584200) throw new Error(`TOTAL_TRX mismatch: ${TOTAL_TRX}`);
  if (TOTAL_GROSS !== 18462500000) throw new Error(`TOTAL_GROSS mismatch: ${TOTAL_GROSS}`);
  if (TOTAL_FEE !== 226512600) throw new Error(`TOTAL_FEE mismatch: ${TOTAL_FEE}`);
  if (TOTAL_NET !== TOTAL_GROSS - TOTAL_FEE) throw new Error(`TOTAL_NET mismatch: ${TOTAL_NET}`);
  if (XB_TRX !== 14820) throw new Error(`XB_TRX mismatch: ${XB_TRX}`);
  if (XB_GROSS !== 2184500000) throw new Error(`XB_GROSS mismatch: ${XB_GROSS}`);

  // Transit breakdown reconciles to Channel 1
  const transitTrx = TRANSIT_OPERATORS.reduce((a, o) => a + o.trx, 0);
  const transitGross = TRANSIT_OPERATORS.reduce((a, o) => a + o.grossIdr, 0);
  if (transitTrx !== CHANNELS[0].trx) throw new Error(`Transit trx mismatch: ${transitTrx} vs ${CHANNELS[0].trx}`);
  if (transitGross !== CHANNELS[0].grossIdr) throw new Error(`Transit gross mismatch: ${transitGross} vs ${CHANNELS[0].grossIdr}`);

  // Escrow totals
  if (TOTAL_ESCROW !== 12840000000) throw new Error(`TOTAL_ESCROW mismatch: ${TOTAL_ESCROW}`);
  if (TOTAL_ESCROW_LIMIT !== 20000000000) throw new Error(`TOTAL_ESCROW_LIMIT mismatch: ${TOTAL_ESCROW_LIMIT}`);

  // FX Corridors reconcile to Cross-Border channels
  const fxTrx = FX_CORRIDORS.reduce((a, f) => a + f.trx, 0);
  const fxVol = FX_CORRIDORS.reduce((a, f) => a + f.volIdr, 0);
  if (fxTrx !== XB_TRX) throw new Error(`FX trx mismatch: ${fxTrx} vs ${XB_TRX}`);
  if (fxVol !== XB_GROSS) throw new Error(`FX vol mismatch: ${fxVol} vs ${XB_GROSS}`);

  // Page 4: 14 Settlement Batches MUST reconcile 100% to P1 Grand Totals
  const batchTrx = SETTLEMENT_BATCHES.reduce((a, b) => a + b.trx, 0);
  const batchGross = SETTLEMENT_BATCHES.reduce((a, b) => a + b.grossIdr, 0);
  const batchFee = SETTLEMENT_BATCHES.reduce((a, b) => a + b.feeIdr, 0);
  const batchNet = SETTLEMENT_BATCHES.reduce((a, b) => a + b.netIdr, 0);
  if (batchTrx !== TOTAL_TRX) throw new Error(`Batch trx mismatch: ${batchTrx} vs ${TOTAL_TRX}`);
  if (batchGross !== TOTAL_GROSS) throw new Error(`Batch gross mismatch: ${batchGross} vs ${TOTAL_GROSS}`);
  if (batchFee !== TOTAL_FEE) throw new Error(`Batch fee mismatch: ${batchFee} vs ${TOTAL_FEE}`);
  if (batchNet !== TOTAL_NET) throw new Error(`Batch net mismatch: ${batchNet} vs ${TOTAL_NET}`);
  for (const b of SETTLEMENT_BATCHES) {
    if (b.grossIdr - b.feeIdr !== b.netIdr) throw new Error(`Batch row net mismatch: ${b.id}`);
  }

  // Page 2: TAP-881 span waterfall sum === 230ms & ledger count === 18
  const spanTotal = TAP881_SPANS.reduce((a, s) => a + s.dur, 0);
  if (spanTotal !== 230) throw new Error(`TAP-881 span sum mismatch: ${spanTotal}`);
  if (LEDGER_TXNS.length !== 18) throw new Error(`LEDGER_TXNS length mismatch: ${LEDGER_TXNS.length}`);

  // Page 3: FX-104 exact quote math & claim sum
  if (Math.round(14.5 * 3590) !== 52055) throw new Error('FX-104 quote math mismatch');
  if (482500 - 52055 !== 430445) throw new Error('Mobile remaining balance mismatch');
  if (CLAIM_TRIPS !== 42 || CLAIM_TOTAL !== 648500) throw new Error('Claim recap math mismatch');

  // Page 5: Exact integer PPN 11% on DPP
  if (TOTAL_FEE * 11 % 100 !== 0) throw new Error('PPN 11% not exact integer');
  if (PPN_11_IDR !== 24916386) throw new Error(`PPN_11_IDR mismatch: ${PPN_11_IDR}`);
}

// ============================================================================
// SAP S/4HANA FIORI HORIZON + WORKDAY ENTERPRISE CHROME
// ============================================================================

const EXTRA_CSS = `
  /* SAP Fiori Horizon Light-First Enterprise Shell */
  .fh-topaccent {
    height: 3px;
    background: var(--e-accent);
    flex-shrink: 0;
  }
  .fh-shell {
    height: 38px;
    background: #ffffff;
    border-bottom: 1px solid #d5dde6;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .fh-shell-left, .fh-shell-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .fh-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.015em;
    white-space: nowrap;
  }
  .fh-logo {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: var(--e-accent);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .fh-divider {
    width: 1px;
    height: 18px;
    background: #d5dde6;
    flex-shrink: 0;
  }
  .fh-selector {
    height: 25px;
    padding: 0 9px;
    border-radius: 4px;
    background: #f5f7fa;
    border: 1px solid #cfd8e3;
    color: #1e293b;
    font-size: 10.6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .fh-selector-accent {
    background: #edf3fd;
    border-color: #b7cef6;
    color: #0b3d91;
  }
  .fh-search {
    height: 25px;
    width: 278px;
    padding: 0 9px;
    border-radius: 4px;
    background: #f8fafc;
    border: 1px solid #cfd8e3;
    color: #64748b;
    font-size: 10.4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .fh-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .fh-health {
    height: 24px;
    padding: 0 8px;
    border-radius: 4px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .fh-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 8px;
    border-left: 1px solid #d5dde6;
    white-space: nowrap;
  }
  .fh-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #0b3d91;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Fiori Horizon Module Tab Bar */
  .fh-tabs {
    height: 33px;
    background: #ffffff;
    border-bottom: 1px solid #cfd8e3;
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .fh-tab-list {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }
  .fh-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .fh-tab.is-active {
    color: var(--e-accent);
    border-bottom-color: var(--e-accent);
    background: #f5f9ff;
  }
  .fh-tab-num {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #f1f5f9;
    color: #475569;
  }
  .fh-tab.is-active .fh-tab-num {
    background: var(--e-accent);
    color: #ffffff;
  }
  .fh-tab-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10.2px;
    color: #64748b;
  }

  /* Workspace Body */
  .fh-main {
    flex: 1;
    min-height: 0;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background: #f3f5f8;
  }
  .fh-filter-bar {
    height: 30px;
    background: #ffffff;
    border: 1px solid #d5dde6;
    border-radius: 4px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .fh-filter-group {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .fh-chip {
    height: 21px;
    padding: 0 7px;
    border-radius: 3px;
    background: #f8fafc;
    border: 1px solid #d5dde6;
    font-size: 10px;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .fh-chip strong {
    color: #0f172a;
  }
  .fh-chip-active {
    background: #edf3fd;
    border-color: #93b7f2;
    color: #0b3d91;
  }

  /* Fiori KPI Tile */
  .fh-kpi-grid {
    display: grid;
    gap: 8px;
    flex-shrink: 0;
  }
  .fh-kpi {
    background: #ffffff;
    border: 1px solid #d5dde6;
    border-top: 2px solid #cbd5e1;
    border-radius: 4px;
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .fh-kpi.accent { border-top-color: var(--e-accent); }
  .fh-kpi.ok     { border-top-color: #047857; }
  .fh-kpi.info   { border-top-color: #0369a1; }
  .fh-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.8px;
    font-weight: 600;
    color: #64748b;
  }
  .fh-kpi-mid {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
  }
  .fh-kpi-val {
    font-family: var(--e-mono);
    font-size: 15.5px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.2;
    white-space: nowrap;
  }
  .fh-kpi-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.5px;
    color: #64748b;
    gap: 4px;
  }

  /* Clean Code / XML / APDU Surface */
  .fh-code {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.6px;
    line-height: 1.42;
    color: #1e293b;
    white-space: pre;
    overflow: hidden;
  }
  .fh-code-tag { color: #0f52ba; font-weight: 700; }
  .fh-code-val { color: #047857; font-weight: 600; }
  .fh-code-dim { color: #64748b; }

  /* DoA Maker-Checker Stepper */
  .doa-stepper {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  .doa-step {
    background: #f8fafc;
    border: 1px solid #d5dde6;
    border-radius: 4px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .doa-step.done {
    background: #f0fdf7;
    border-color: #a7f3d0;
  }
  .doa-step.active {
    background: #edf3fd;
    border-color: #0f52ba;
    border-width: 1.5px;
  }
  .doa-step-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 9.5px;
    font-weight: 700;
    color: #475569;
  }
  .doa-step.done .doa-step-head { color: #065f46; }
  .doa-step.active .doa-step-head { color: #0b3d91; }
  .doa-step-title {
    font-size: 10.8px;
    font-weight: 700;
    color: #0f172a;
  }
  .doa-step-meta {
    font-family: var(--e-mono);
    font-size: 9.4px;
    color: #475569;
  }

  /* Enterprise Mobile Frame (Page 3) — Crisp Flat Hardware Frame */
  .mob-frame {
    width: 318px;
    height: 752px;
    margin: 0 auto;
    background: #ffffff;
    border: 2px solid #334155;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }
  .mob-status {
    height: 22px;
    padding: 0 11px;
    background: #0f52ba;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 9.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .mob-status-light {
    background: #ffffff;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
  }
  .mob-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    overflow: hidden;
  }
  .mob-nav {
    height: 40px;
    background: #ffffff;
    border-top: 1px solid #d5dde6;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    flex-shrink: 0;
  }
  .mob-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 8.6px;
    font-weight: 600;
    color: #64748b;
  }
  .mob-nav-item.active {
    color: #0f52ba;
    background: #f5f9ff;
    border-top: 2px solid #0f52ba;
  }

  /* Table spacing density helpers */
  table.e-table.p1-tbl td { padding: 7px 6px; }
  table.e-table.p2-tbl td { padding: 6.2px 6px; }
  table.e-table.p4-tbl td { padding: 6.8px 5px; }
  table.e-table.p4-tbl th { padding: 5.5px 5px; }
  table.e-table.p4-tbl tfoot td { padding: 6.5px 5px; }
  table.e-table.p4-doa td { padding: 7.5px 7px; }
  table.e-table.p5-ctl td { padding: 6.4px 6px; }
  table.e-table.p5-snap td { padding: 8px 6px; }
  table.e-table.p5-worm td { padding: 8px 6px; }

  /* Compact KV rows inside inspector */
  .kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
  }
  .kv-item {
    border-bottom: 1px solid #edf2f7;
    padding-bottom: 4px;
    min-width: 0;
  }
  .kv-k {
    font-size: 9.2px;
    color: #64748b;
    font-weight: 600;
  }
  .kv-v {
    font-size: 10.4px;
    color: #0f172a;
    font-weight: 600;
  }
`;

const TABS = [
  { id: 'p1', num: '01', label: 'Ikhtisar Kliring & SLA', icon: 'activity' },
  { id: 'p2', num: '02', label: 'Buku Besar & Inspektor APDU', icon: 'database' },
  { id: 'p3', num: '03', label: 'Mobile Superapp (.NET MAUI 9)', icon: 'zap' },
  { id: 'p4', num: '04', label: 'Persetujuan DoA & FX LCT', icon: 'checkCircle' },
  { id: 'p5', num: '05', label: 'Kepatuhan BI & CoreTax XML', icon: 'shield' },
];

function nfcWaveSvg(size = 16, color = '#ffffff') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">
    <path d="M6 8.5a6.5 6.5 0 0 1 0 7" />
    <path d="M10 5.5a11 11 0 0 1 0 13" />
    <path d="M14.5 3a15 15 0 0 1 0 18" />
    <rect x="2" y="10" width="2.5" height="4" rx="1" fill="${color}" stroke="none" />
  </svg>`;
}

function qrMatrixSvg(size = 54) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" style="display:block;flex-shrink:0;background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;">
    <rect x="2" y="2" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1.6"/>
    <rect x="4.2" y="4.2" width="2.6" height="2.6" fill="#0f172a"/>
    <rect x="19" y="2" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1.6"/>
    <rect x="21.2" y="4.2" width="2.6" height="2.6" fill="#0f172a"/>
    <rect x="2" y="19" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1.6"/>
    <rect x="4.2" y="21.2" width="2.6" height="2.6" fill="#0f172a"/>
    <rect x="11" y="3" width="2" height="2" fill="#0f172a"/><rect x="15" y="3" width="2" height="4" fill="#0f172a"/>
    <rect x="11" y="7" width="4" height="2" fill="#0f172a"/><rect x="3" y="11" width="3" height="2" fill="#0f172a"/>
    <rect x="8" y="11" width="3" height="4" fill="#0f172a"/><rect x="13" y="11" width="4" height="4" fill="#0f52ba"/>
    <rect x="19" y="11" width="2" height="4" fill="#0f172a"/><rect x="23" y="11" width="3" height="2" fill="#0f172a"/>
    <rect x="3" y="15" width="4" height="2" fill="#0f172a"/><rect x="11" y="17" width="3" height="3" fill="#0f172a"/>
    <rect x="16" y="17" width="4" height="2" fill="#0f172a"/><rect x="22" y="16" width="4" height="3" fill="#0f172a"/>
    <rect x="11" y="22" width="2" height="4" fill="#0f172a"/><rect x="15" y="21" width="4" height="3" fill="#0f172a"/>
    <rect x="21" y="21" width="5" height="2" fill="#0f172a"/><rect x="23" y="24" width="3" height="2" fill="#0f172a"/>
  </svg>`;
}

function renderShell(activeId, mainHtml, footerExtra = '') {
  const tabsHtml = TABS.map((t) => {
    const active = t.id === activeId;
    return `<div class="fh-tab ${active ? 'is-active' : ''}">
      <span class="fh-tab-num">${t.num}</span>
      ${ic(t.icon, 12, active ? '#0f52ba' : '#64748b')}
      <span>${esc(t.label)}</span>
    </div>`;
  }).join('');

  return `
    <div class="fh-topaccent"></div>
    <header class="fh-shell">
      <div class="fh-shell-left">
        <div class="fh-brand">
          <span class="fh-logo">${nfcWaveSvg(14, '#ffffff')}</span>
          <span>TapNusa QRIS</span>
        </div>
        <span class="e-badge e-badge-accent mono">PJP-I · SNAP BI v2.1</span>
        <div class="fh-divider"></div>
        <div class="fh-selector">
          ${ic('layers', 12, '#0f52ba')}
          <span>PT TapNusa Pembayaran Nusantara</span>
          ${ic('chevronDown', 11, '#64748b')}
        </div>
        <div class="fh-selector fh-selector-accent">
          ${ic('clock', 11, '#0b3d91')}
          <span class="mono" style="font-size:10px;">Fiskal 2026-P11 · 20 Nov 2026</span>
          ${ic('chevronDown', 11, '#0b3d91')}
        </div>
        <div class="fh-search">
          <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
            ${ic('search', 12, '#64748b')}
            <span class="trunc">Cari RRN, Kode TAP/FX, Batch STL, atau NPWP...</span>
          </span>
          <span class="fh-kbd">Ctrl+K</span>
        </div>
      </div>
      <div class="fh-shell-right">
        <div class="fh-health">
          <span class="dot dot-ok"></span>
          <span>ASPI + BI-FAST 99,98%</span>
        </div>
        <div class="fh-user">
          <span class="fh-avatar">RK</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.5px;font-weight:700;color:#0f172a;">R. Kusuma</div>
            <div style="font-size:9px;color:#64748b;">VP Settlement &amp; Treasury</div>
          </div>
        </div>
      </div>
    </header>
    <nav class="fh-tabs">
      <div class="fh-tab-list">${tabsHtml}</div>
      <div class="fh-tab-meta">
        <span class="mono">DC-JKT1 · Active-Active</span>
        <span class="fh-divider" style="height:12px;"></span>
        <span class="mono" style="color:#0f52ba;font-weight:700;">08:20:04 WIB</span>
      </div>
    </nav>
    <main class="fh-main">${mainHtml}</main>
    ${renderStatusFooter({
      leftItems: [
        `<span class="dot dot-ok"></span> PostgreSQL 16 Double-Entry Ledger (0 Suspense)`,
        `<span>SNAP BI OAuth2 + mTLS TLS 1.3</span>`,
        `<span>.NET Core 9 Switch · Kotlin HCE AID A000000602101001</span>`,
      ],
      rightItems: [
        footerExtra || `<span>Cut-off Kliring BI-FAST Wave-04: 09:00 WIB</span>`,
        `<span>Audit WORM SHA-256 Terverifikasi</span>`,
      ],
    })}
  `;
}

// ============================================================================
// PAGE 1: IKHTISAR KLIRING QRIS TAP, LIKUIDITAS BI-FAST & SLA TRANSIT
// ============================================================================
function renderPage1() {
  const kpiHtml = `
    <div class="fh-kpi-grid" style="grid-template-columns: repeat(6, 1fr);">
      <div class="fh-kpi accent">
        <div class="fh-kpi-head"><span>Volume Kliring 24 Jam</span>${badge('6 Kanal', 'accent')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">${fmtIdr(TOTAL_GROSS)}</span>
          ${svgSparkline({ points: [14.2, 15.1, 15.8, 16.4, 17.2, 17.9, 18.46], width: 54, height: 19, color: '#0f52ba' })}
        </div>
        <div class="fh-kpi-sub"><span class="mono">${fmtNum(TOTAL_TRX)} trx</span><span style="color:#047857;font-weight:600;">+12,4% WoW</span></div>
      </div>
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Latensi NFC HCE (p95)</span>${badge('SLA < 300ms', 'ok')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">238 ms</span>
          ${svgSparkline({ points: [252, 246, 244, 241, 239, 240, 238], width: 54, height: 19, color: '#047857' })}
        </div>
        <div class="fh-kpi-sub"><span class="mono">p50: 174 ms</span><span>Tanpa buka kamera</span></div>
      </div>
      <div class="fh-kpi accent">
        <div class="fh-kpi-head"><span>Saldo Escrow BI-FAST</span>${badge('64,2% Pagu', 'neutral')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">${fmtIdr(TOTAL_ESCROW)}</span>
          ${svgSparkline({ points: [11.8, 12.0, 12.3, 12.1, 12.6, 12.7, 12.84], width: 54, height: 19, color: '#0f52ba' })}
        </div>
        <div class="fh-kpi-sub"><span class="mono">Pagu Rp 20,0 M</span><span>5 Bank Mitra BI</span></div>
      </div>
      <div class="fh-kpi info">
        <div class="fh-kpi-head"><span>QR Lintas Negara ASEAN</span>${badge('MY · TH · SG', 'info')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">${fmtIdr(XB_GROSS)}</span>
          ${svgSparkline({ points: [1.62, 1.74, 1.81, 1.95, 2.02, 2.11, 2.18], width: 54, height: 19, color: '#0369a1' })}
        </div>
        <div class="fh-kpi-sub"><span class="mono">${fmtNum(XB_TRX)} trx LCT</span><span>Kurs transparan</span></div>
      </div>
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Sukses Gerbang Transit</span>${badge('99,94% OK', 'ok')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">368.400 trx</span>
          ${svgSparkline({ points: [99.88, 99.90, 99.91, 99.92, 99.93, 99.94, 99.94], width: 54, height: 19, color: '#047857' })}
        </div>
        <div class="fh-kpi-sub"><span>Auto-Topup aktif</span><span class="mono">142.680 user</span></div>
      </div>
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Selisih Buku Besar</span>${badge('Balanced', 'ok')}</div>
        <div class="fh-kpi-mid">
          <span class="fh-kpi-val">Rp 0</span>
          ${svgSparkline({ points: [0, 0, 0, 0, 0, 0, 0], width: 54, height: 19, color: '#047857', fill: false })}
        </div>
        <div class="fh-kpi-sub"><span>Double-Entry PG16</span><span class="mono">0 Suspense</span></div>
      </div>
    </div>
  `;

  const latencyChart = svgMultiLineChart({
    width: 820,
    height: 198,
    xLabels: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    yMin: 100,
    yMax: 360,
    yTicks: 5,
    yUnit: 'ms',
    threshold: { value: 300, label: 'SLA ASPI QRIS Tap: 300 ms', color: '#be123c' },
    series: [
      { label: 'p95 Latensi HCE Gerbang', color: '#0f52ba', width: 2.1, area: true, dots: true, values: [212, 224, 256, 268, 244, 226, 232, 224, 238, 262, 234, 218] },
      { label: 'p50 Latensi Median', color: '#047857', width: 1.8, dots: false, values: [158, 166, 184, 192, 178, 168, 172, 166, 176, 188, 170, 162] },
      { label: 'p95 Auto-Topup BI-FAST', color: '#0369a1', width: 1.5, dashed: true, values: [176, 180, 194, 202, 186, 182, 184, 178, 186, 196, 182, 174] },
    ],
    annotations: [
      { index: 3, seriesIdx: 0, label: 'Puncak Pagi: 268 ms (31.400 tap/jam)', color: '#b45309', dy: -26 },
      { index: 9, seriesIdx: 0, label: 'Puncak Sore: 262 ms (Dukuh Atas)', color: '#0f52ba', dy: 12 },
    ],
  });

  const transitCards = TRANSIT_OPERATORS.map((op) => `
    <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;display:flex;flex-direction:column;gap:2px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span style="font-size:10.4px;font-weight:700;color:#0f172a;" class="trunc">${esc(op.name)}</span>
        <span class="mono" style="font-size:9.8px;font-weight:700;color:#047857;">${op.p95Ms} ms</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:10.5px;font-weight:700;color:#0f52ba;">
        <span>${fmtNum(op.trx)} tap</span>
        <span style="color:#0f172a;">${fmtIdr(op.grossIdr)}</span>
      </div>
      <div style="font-size:9.2px;color:#64748b;">${esc(op.gates)}</div>
    </div>
  `).join('');

  const escrowRows = ESCROW_ACCOUNTS.map((a) => {
    const pct = (a.balanceIdr / a.limitIdr) * 100;
    return `
      <div style="display:flex;flex-direction:column;gap:3px;padding:5px 0;border-bottom:1px solid #edf2f7;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="min-width:0;">
            <span style="font-size:10.6px;font-weight:700;color:#0f172a;">${esc(a.bank)}</span>
            <span class="mono" style="font-size:9.3px;color:#64748b;margin-left:5px;">${esc(a.code)}</span>
          </div>
          <span class="mono" style="font-size:10.8px;font-weight:700;color:#0f172a;white-space:nowrap;">${fmtIdr(a.balanceIdr)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span style="font-size:9.3px;color:#64748b;width:112px;flex-shrink:0;">${esc(a.rail)}</span>
          <div style="flex:1;">${renderCapacityBar(pct, { warnAt: 78, critAt: 92 })}</div>
          <span class="mono" style="font-size:9.2px;color:#64748b;width:72px;text-align:right;flex-shrink:0;">/ ${esc(a.limitLabel)}</span>
        </div>
      </div>
    `;
  }).join('');

  const channelRows = CHANNELS.map((c) => `
    <tr>
      <td>
        <div style="font-weight:700;color:#0f172a;" class="trunc">${esc(c.name)}</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">${esc(c.code)} · ${esc(c.rail)}</div>
      </td>
      <td class="num mono">${fmtNum(c.trx)}</td>
      <td class="num mono" style="font-weight:600;">${fmtIdr(c.grossIdr)}</td>
      <td class="num mono" style="color:#475569;">${fmtIdr(c.feeIdr)}</td>
      <td class="num mono" style="font-weight:700;color:#0f52ba;">${fmtIdr(c.netIdr)}</td>
      <td class="num mono">${c.p95Ms} ms</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>
  `).join('');

  const fxCards = FX_CORRIDORS.map((f) => `
    <div style="border:1px solid #d8dee6;border-radius:4px;padding:7px 9px;background:#fafcfe;display:flex;flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span class="mono" style="font-size:11.5px;font-weight:800;color:#0f52ba;">${esc(f.pair)}</span>
          <span style="font-size:10.3px;font-weight:600;color:#334155;">${esc(f.scheme)}</span>
        </div>
        ${badge(f.status, f.tone)}
      </div>
      <div style="display:grid;grid-template-columns:1.1fr 1fr 1.1fr 1fr;gap:8px;align-items:center;">
        <div>
          <div style="font-size:9px;color:#64748b;">Kurs Live TapNusa</div>
          <div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">${fmtIdr(f.rateIdr)} <span style="font-size:9px;color:#047857;">(${esc(f.spreadBps)})</span></div>
        </div>
        <div>
          <div style="font-size:9px;color:#64748b;">Volume 24J (${fmtNum(f.trx)} trx)</div>
          <div class="mono" style="font-size:10.6px;font-weight:700;color:#0f172a;">${fmtIdr(f.volIdr)}</div>
        </div>
        <div>
          <div style="font-size:9px;color:#64748b;">Ekuivalen FX · Nostro</div>
          <div class="mono" style="font-size:10px;color:#334155;">${esc(f.volFx)}</div>
        </div>
        <div>
          <div style="font-size:9px;color:#64748b;">Kuota LCT BI · TTL ${f.ttlSec}dtk</div>
          ${renderCapacityBar(f.quotaPct, { warnAt: 75, critAt: 90 })}
        </div>
      </div>
    </div>
  `).join('');

  const mainHtml = `
    <div class="fh-filter-bar">
      <div class="fh-filter-group">
        <span class="fh-chip fh-chip-active">${ic('filter', 11, '#0b3d91')} <strong>Entitas:</strong> PT TapNusa (PJP-I)</span>
        <span class="fh-chip"><strong>Koridor:</strong> Jabodetabek Transit + ASEAN (MY·TH·SG)</span>
        <span class="fh-chip"><strong>Window Kliring:</strong> 20 Nov 2026 · 00:00–08:20 WIB (Proyeksi 24J)</span>
        <span class="fh-chip"><strong>Mata Uang Pelaporan:</strong> IDR (PSAK 72)</span>
      </div>
      <div class="fh-filter-group">
        <span class="e-btn">${ic('refresh', 11, '#334155')} Sinkron ASPI</span>
        <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Laporan LKPBU</span>
      </div>
    </div>
    ${kpiHtml}
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:8px;flex:0 0 340px;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0f52ba')} Telemetri Latensi NFC HCE &amp; Throughput Gerbang Transit <span class="e-panel-sub">· Target SLA ASPI &lt; 300 ms</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('p50: 174 ms', 'ok')}
            ${badge('p95: 238 ms', 'accent')}
            ${badge('0 Timeout Gate', 'neutral')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div>${latencyChart}</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;">${transitCards}</div>
        </div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Posisi Likuiditas Escrow &amp; Float BI-FAST <span class="e-panel-sub">· Rasio Dana 100%</span></div>
          ${badge('64,2% Terpakai', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>${escrowRows}</div>
          <div style="background:#edf3fd;border:1px solid #b7cef6;border-radius:4px;padding:6px 9px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:9.4px;font-weight:700;color:#0b3d91;">Total Likuiditas Escrow Tersedia (5 Rekening BI/Bank Umum)</div>
              <div style="font-size:9.2px;color:#334155;">Auto-Topup Trigger: Saldo &lt; Rp 50.000 · 58.800 eksekusi sukses</div>
            </div>
            <div class="mono" style="font-size:13px;font-weight:800;color:#0b3d91;">${fmtIdr(TOTAL_ESCROW)}</div>
          </div>
        </div>
      </section>
    </div>
    <div style="display:grid;grid-template-columns:1.48fr 1fr;gap:8px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0f52ba')} Ringkasan Volume, MDR &amp; Net Settlement per Kanal Pembayaran</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="e-panel-sub">Terekonsiliasi 100% dgn 14 Batch DoA (Halaman 04)</span>
            ${badge('0 Selisih', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p1-tbl">
            <colgroup>
              <col style="width:28%;">
              <col style="width:8.5%;">
              <col style="width:15.5%;">
              <col style="width:13%;">
              <col style="width:15.5%;">
              <col style="width:6.5%;">
              <col style="width:13%;">
            </colgroup>
            <thead>
              <tr>
                <th>Kanal &amp; Jaringan Pembayaran</th>
                <th class="num">Transaksi</th>
                <th class="num">Gross Volume (IDR)</th>
                <th class="num">MDR / Fee (IDR)</th>
                <th class="num">Net Settlement</th>
                <th class="num">p95</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${channelRows}</tbody>
            <tfoot>
              <tr>
                <td>TOTAL KLIRING HARIAN (6 KANAL)</td>
                <td class="num mono">${fmtNum(TOTAL_TRX)}</td>
                <td class="num mono">${fmtIdr(TOTAL_GROSS)}</td>
                <td class="num mono">${fmtIdr(TOTAL_FEE)}</td>
                <td class="num mono" style="color:#0b3d91;">${fmtIdr(TOTAL_NET)}</td>
                <td class="num mono">238 ms</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d8dee6;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;">
            <span><strong>Dasar Pengenaan Pajak (DPP PMK 69/2022):</strong> Total MDR &amp; Fee BI-FAST <span class="mono" style="color:#0f172a;font-weight:700;">${fmtIdr(TOTAL_FEE)}</span> · PPN 11% <span class="mono" style="color:#0f52ba;font-weight:700;">${fmtIdr(PPN_11_IDR)}</span></span>
            <span class="mono" style="color:#047857;font-weight:700;">Double-Entry Checksum: PASS</span>
          </div>
        </div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#0f52ba')} Koridor FX QR Lintas Negara ASEAN (LCT Bank Indonesia)</div>
          ${badge('Kurs Transparan Pra-PIN', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          ${fxCards}
          <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:4px;padding:6px 9px;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;">
            <span style="color:#334155;"><strong>FX Quote Switch Engine:</strong> Kunci kurs atomik 30–45 dtk sebelum otorisasi PIN biometrik</span>
            <span class="mono" style="color:#0f52ba;font-weight:700;">Total LCT: ${fmtIdr(XB_GROSS)}</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${meta.pages[0].title}`,
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell('p1', mainHtml),
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR TRANSAKSI (18 BARIS) & INSPEKTOR APDU / DOUBLE-ENTRY
// ============================================================================
function renderPage2() {
  const rowsHtml = LEDGER_TXNS.map((t) => {
    const rowCls = t.selected ? 'is-selected' : t.warn ? 'is-warn' : '';
    const amtColor = t.dir === 'CR' ? '#047857' : '#0f172a';
    const amtStr = (t.amountIdr > 0 ? '+' : '-') + fmtIdr(Math.abs(t.amountIdr));
    return `
      <tr class="${rowCls}">
        <td style="text-align:center;"><span class="cb ${t.selected ? 'checked' : ''}">${t.selected ? ic('check', 9, '#ffffff') : ''}</span></td>
        <td class="mono" style="font-weight:700;color:${t.selected ? '#0b3d91' : '#0f172a'};">${esc(t.code)}</td>
        <td class="mono" style="color:#64748b;">${esc(t.time)}</td>
        <td style="font-weight:600;" title="${esc(t.merchant)}">${esc(t.merchant)}</td>
        <td><span class="e-badge ${t.rail === 'QRIS Tap NFC' ? 'e-badge-accent' : t.rail === 'ASEAN QR LCT' ? 'e-badge-info' : 'e-badge-neutral'}">${esc(t.rail)}</span></td>
        <td class="mono" style="color:#475569;">${esc(t.corridor)}</td>
        <td class="num mono" style="color:${t.latMs <= 300 ? '#047857' : '#b45309'};font-weight:600;">${t.latMs} ms</td>
        <td class="num mono" style="font-weight:700;color:${amtColor};">${amtStr}</td>
        <td>${badge(t.status, t.tone)}</td>
      </tr>
    `;
  }).join('');

  const waterfallHtml = svgSpanWaterfall({
    spans: TAP881_SPANS,
    totalMs: 250,
    width: 472,
  });

  const mainHtml = `
    <div class="fh-filter-bar">
      <div class="fh-filter-group">
        <span class="fh-chip fh-chip-active">${ic('filter', 11, '#0b3d91')} <strong>Buku Besar:</strong> Double-Entry Real-Time</span>
        <span class="fh-chip"><strong>Kanal:</strong> Semua (NFC Tap · MPM · ASEAN QR · BI-FAST)</span>
        <span class="fh-chip"><strong>Periode:</strong> 20 Nov 2026 · 07:40–08:20 WIB</span>
        <span class="fh-chip"><strong>Terpilih:</strong> TAP-881 (#MRT-20261120-881)</span>
      </div>
      <div class="fh-filter-group">
        <span class="e-btn">${ic('code', 11, '#334155')} Ekspor ISO 8583 / JSON</span>
        <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Ekspor Buku Besar CSV</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.92fr 1fr;gap:8px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0f52ba')} Jurnal Transaksi Komuter, Ritel &amp; Cross-Border (18 Baris Terbaru)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Debit: ' + fmtIdr(LEDGER_DR), 'neutral')}
            ${badge('Kredit Top-Up: +' + fmtIdr(LEDGER_CR), 'ok')}
            ${badge('Net Aliran: +' + fmtIdr(LEDGER_NET), 'accent')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p2-tbl" style="font-size:10.3px;">
            <colgroup>
              <col style="width:3.2%;">
              <col style="width:8%;">
              <col style="width:7.8%;">
              <col style="width:28.5%;">
              <col style="width:13%;">
              <col style="width:10.5%;">
              <col style="width:6.8%;">
              <col style="width:11.2%;">
              <col style="width:11%;">
            </colgroup>
            <thead>
              <tr>
                <th style="text-align:center;">#</th>
                <th>Kode</th>
                <th>Waktu WIB</th>
                <th>Merchant / Gerbang Transit / Rekening</th>
                <th>Kanal</th>
                <th>Koridor</th>
                <th class="num">Latensi</th>
                <th class="num">Nominal (IDR)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">SUBTOTAL SAMPEL BUKU BESAR (18 TRANSAKSI · 15 DEBIT · 3 KREDIT BI-FAST)</td>
                <td colspan="2" class="mono" style="font-size:9.8px;color:#475569;">MDR/Fee: ${fmtIdr(LEDGER_FEES)}</td>
                <td class="num mono">256 ms</td>
                <td class="num mono" style="color:#047857;">+${fmtIdr(LEDGER_NET)}</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d8dee6;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;">
            <span>Menampilkan <strong>1–18</strong> dari <strong class="mono">584.200</strong> jurnal hari ini · Isolasi transaksi PostgreSQL <span class="mono">SERIALIZABLE</span></span>
            <span class="mono" style="color:#0b3d91;font-weight:700;">1 Baris Terpilih: TAP-881 (RRN 261120081904)</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#0f52ba')} Inspektor Transaksi: TAP-881</div>
          ${badge('230 ms · Lunas', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="background:#edf3fd;border:1px solid #b7cef6;border-radius:4px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div>
              <div style="font-size:11.5px;font-weight:700;color:#0f172a;">MRT Jakarta — Dukuh Atas BNI</div>
              <div class="mono" style="font-size:9.6px;color:#0b3d91;">Struk #MRT-20261120-881 · Gate #04 · 08:19:42 WIB</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:14px;font-weight:800;color:#0f172a;">-Rp 7.000</div>
              <div style="font-size:9.2px;color:#047857;font-weight:700;">Saldo Akhir: Rp 482.500</div>
            </div>
          </div>

          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10.4px;font-weight:700;color:#0f172a;">Waterfall Latensi NFC HCE End-to-End (Total 230 ms)</span>
              <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">70 ms di bawah SLA</span>
            </div>
            <div style="border:1px solid #d8dee6;border-radius:3px;padding:5px 7px;background:#ffffff;">${waterfallHtml}</div>
          </div>

          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10.4px;font-weight:700;color:#0f172a;">Jurnal Akuntansi Double-Entry (PSAK 72 / PJP)</span>
              ${badge('Dr = Cr · Rp 7.000', 'ok')}
            </div>
            <table class="e-table" style="font-size:9.8px;border:1px solid #d8dee6;">
              <colgroup><col style="width:20%;"><col style="width:44%;"><col style="width:18%;"><col style="width:18%;"></colgroup>
              <thead><tr><th>Akun GL</th><th>Nama Pos Akuntansi</th><th class="num">Debit</th><th class="num">Kredit</th></tr></thead>
              <tbody>
                <tr><td class="mono">1102-ESC</td><td>Escrow Dompet Komuter</td><td class="num mono">Rp 7.000</td><td class="num mono">-</td></tr>
                <tr><td class="mono">2104-MRT</td><td>Titipan Settlement MRT JKT</td><td class="num mono">-</td><td class="num mono">Rp 6.951</td></tr>
                <tr><td class="mono">4101-MDR</td><td>Pendapatan Jasa MDR (0,7%)</td><td class="num mono">-</td><td class="num mono">Rp 49</td></tr>
              </tbody>
              <tfoot>
                <tr><td colspan="2">TOTAL JURNAL SEIMBANG</td><td class="num mono">Rp 7.000</td><td class="num mono">Rp 7.000</td></tr>
              </tfoot>
            </table>
          </div>

          <div>
            <div style="font-size:10.4px;font-weight:700;color:#0f172a;margin-bottom:4px;">Trace NFC HCE APDU &amp; Verifikasi Token ASPI</div>
            <div class="fh-code"><span class="fh-code-dim">08:19:42.104</span> <span class="fh-code-tag">APDU&gt;</span> 00 A4 04 00 08 A0 00 00 06 02 10 10 01
<span class="fh-code-dim">08:19:42.166</span> <span class="fh-code-tag">TEE &lt;</span> QRIS_TAP_CRYPT=9F26:8A4C1E77 · SW=9000
<span class="fh-code-dim">08:19:42.248</span> <span class="fh-code-tag">ASPI&gt;</span> Token QRIS Tap terverifikasi 230ms (mTLS)
<span class="fh-code-dim">08:19:42.334</span> <span class="fh-code-val">LEDGER</span> Saldo terdebit Rp 7.000 | #MRT-20261120-881</div>
          </div>

          <div class="kv-grid">
            <div class="kv-item"><div class="kv-k">RRN / STAN ASPI</div><div class="kv-v mono">261120081904 / 881042</div></div>
            <div class="kv-item"><div class="kv-k">Terminal Gate ID</div><div class="kv-v mono">MRT-DKA-G04 (SAM v3)</div></div>
            <div class="kv-item"><div class="kv-k">Perangkat Komuter</div><div class="kv-v">.NET MAUI 9 · Android 15 HCE</div></div>
            <div class="kv-item"><div class="kv-k">Mode Otorisasi</div><div class="kv-v">Tap Cepat (&lt; Rp 100rb Tanpa PIN)</div></div>
          </div>
        </div>
      </section>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${meta.pages[1].title}`,
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell('p2', mainHtml, '<span>Ledger Inspector: TAP-881 · PostgreSQL Lock 46 ms</span>'),
  });
}

// ============================================================================
// PAGE 3: PRATINJAU APLIKASI MOBILE KOMUTER (.NET MAUI 9 + KOTLIN HCE)
// ============================================================================
function renderPage3() {
  const phone1Activities = [
    { code: 'TAP-881', title: 'MRT Jakarta — Dukuh Atas BNI', sub: 'QRIS Tap NFC Gate #04 · 08:19 WIB', val: '-Rp 7.000', meta: '230 ms', cr: false },
    { code: 'TAP-880', title: 'Kopi Kenangan — Sudirman', sub: 'QRIS MPM Dinamis · Tanpa antre', val: '-Rp 28.000', meta: 'QRIS', cr: false },
    { code: 'FX-104', title: 'DuitNow QR — KL Sentral', sub: 'MYR 14,50 @ Rp 3.590/MYR', val: '-Rp 52.055', meta: 'ASEAN QR', cr: false },
    { code: 'TOP-209', title: 'BI-FAST Auto Top-Up (BCA)', sub: 'Isi ulang otomatis tanpa hambatan', val: '+Rp 300.000', meta: 'Rp 2,5rb', cr: true },
  ].map((it) => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 9px;background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;">
      <div style="min-width:0;">
        <div style="font-size:10.3px;font-weight:700;color:#0f172a;" class="trunc">${esc(it.title)}</div>
        <div style="font-size:8.9px;color:#64748b;" class="trunc">${esc(it.sub)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div class="mono" style="font-size:10.4px;font-weight:700;color:${it.cr ? '#047857' : '#0f172a'};">${esc(it.val)}</div>
        <div class="mono" style="font-size:8.6px;color:#0f52ba;">${esc(it.meta)}</div>
      </div>
    </div>
  `).join('');

  const claimRowsPhone = CLAIM_ITEMS.map((c) => `
    <div style="padding:7px 9px;background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
      <div style="min-width:0;">
        <div style="font-size:10.1px;font-weight:700;color:#0f172a;" class="trunc">${esc(c.operator)}</div>
        <div class="mono" style="font-size:8.8px;color:#64748b;">${c.trips} perjalanan · ${esc(c.lastRef)}</div>
      </div>
      <div class="mono" style="font-size:10.6px;font-weight:700;color:#0f52ba;flex-shrink:0;">${fmtIdr(c.totalIdr)}</div>
    </div>
  `).join('');

  const mobNav = (activeIdx) => {
    const items = [
      { label: 'Beranda', icon: 'layers' },
      { label: 'Tap NFC', icon: 'zap' },
      { label: 'QR ASEAN', icon: 'globe' },
      { label: 'Klaim', icon: 'fileText' },
    ];
    return `<div class="mob-nav">
      ${items.map((it, idx) => `<div class="mob-nav-item ${idx === activeIdx ? 'active' : ''}">
        ${ic(it.icon, 12, idx === activeIdx ? '#0f52ba' : '#64748b')}
        <span>${it.label}</span>
      </div>`).join('')}
    </div>`;
  };

  const mainHtml = `
    <div class="fh-filter-bar">
      <div class="fh-filter-group">
        <span class="fh-chip fh-chip-active">${ic('zap', 11, '#0b3d91')} <strong>Build Mobile:</strong> .NET MAUI 9.0.40 + Kotlin HCE NFC Service</span>
        <span class="fh-chip"><strong>Profil Uji:</strong> Dimas Mahendra (Komuter MRT/KRL + Bisnis ASEAN)</span>
        <span class="fh-chip"><strong>NFC AID:</strong> <span class="mono">A000000602101001</span> (ASPI QRIS Tap)</span>
      </div>
      <div class="fh-filter-group">
        <span class="e-btn">${ic('play', 11, '#334155')} Simulasi APDU Gate</span>
        <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Ekspor Paket QA .APK</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1.12fr;gap:8px;flex:1;min-height:0;">
      <!-- DEVICE 1: DOMPET KOMUTER NFC HCE -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">1. Dompet Komuter NFC HCE</div>
          ${badge('240 ms Avg', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding:8px;background:#eef2f7;">
          <div class="mob-frame">
            <div class="mob-status"><span>08:19 WIB</span><span>5G · NFC HCE AKTIF</span></div>
            <div class="mob-body">
              <div style="background:#0f52ba;color:#ffffff;padding:11px 12px 12px;display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div style="font-size:11.5px;font-weight:700;">TapNusa · Dompet Komuter NFC</div>
                  <span class="mono" style="font-size:8.6px;background:#0b3d91;padding:2px 5px;border-radius:3px;border:1px solid #3b7be0;">BI-FAST</span>
                </div>
                <div style="display:flex;align-items:flex-end;justify-content:space-between;">
                  <div>
                    <div style="font-size:9px;color:#dbeafe;">Saldo Aktif Tersedia</div>
                    <div class="mono" style="font-size:21px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;">Rp 482.500</div>
                  </div>
                  <div style="text-align:right;font-size:8.8px;color:#dbeafe;">
                    <div>Auto-Topup: <strong style="color:#ffffff;">&lt; Rp 50rb</strong></div>
                    <div>Latensi Tap: <strong style="color:#86efac;">240 ms</strong></div>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                  <div style="background:#ffffff;color:#0f52ba;border-radius:4px;padding:6px 8px;font-size:9.8px;font-weight:700;text-align:center;">Simulasi Tap NFC</div>
                  <div style="background:#0b3d91;color:#ffffff;border:1px solid #4a84e3;border-radius:4px;padding:6px 8px;font-size:9.8px;font-weight:700;text-align:center;">Top Up BI-FAST</div>
                </div>
              </div>

              <div style="padding:9px 10px;display:flex;flex-direction:column;gap:8px;flex:1;overflow:hidden;">
                <div style="background:#ffffff;border:1.5px solid #0f52ba;border-radius:6px;padding:9px 10px;display:flex;align-items:center;gap:10px;">
                  <div style="width:42px;height:42px;border-radius:6px;background:#edf3fd;border:1px solid #b7cef6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${nfcWaveSvg(22, '#0f52ba')}
                  </div>
                  <div style="min-width:0;">
                    <div style="font-size:10.6px;font-weight:700;color:#0f172a;">QRIS Tap NFC Siap di Gerbang</div>
                    <div style="font-size:9px;color:#475569;">Tempelkan ponsel ke reader MRT, KRL, atau TransJakarta tanpa membuka kamera.</div>
                    <div class="mono" style="font-size:8.8px;color:#047857;font-weight:700;margin-top:2px;">HCE Token Aktif · TTL 04:12 · Offline 3/5</div>
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="font-size:10px;font-weight:700;color:#334155;">Aktivitas Komuter &amp; ASEAN Terbaru</span>
                  <span style="font-size:9.2px;color:#0f52ba;font-weight:600;">Lihat Semua</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:5px;">${phone1Activities}</div>

                <div style="background:#f0fdf7;border:1px solid #a7f3d0;border-radius:4px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
                  <div>
                    <div style="font-size:9.6px;font-weight:700;color:#065f46;">Auto-Topup BI-FAST Aktif (BCA ••••4821)</div>
                    <div style="font-size:8.6px;color:#047857;">Otomatis +Rp 300.000 saat saldo &lt; Rp 50.000</div>
                  </div>
                  <span class="e-badge e-badge-ok">ON</span>
                </div>

                <div style="margin-top:auto;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:6px 8px;font-family:var(--e-mono);font-size:8.4px;color:#334155;line-height:1.35;">
                  NFC HCE APDU -&gt; Token ASPI 230ms | Debit Rp 7.000 | #MRT-20261120-881
                </div>
              </div>
            </div>
            ${mobNav(0)}
          </div>
        </div>
      </section>

      <!-- DEVICE 2: PEMINDAI QR CROSS-BORDER ASEAN -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">2. QR Lintas Negara ASEAN</div>
          ${badge('MYR · THB · SGD', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding:8px;background:#eef2f7;">
          <div class="mob-frame">
            <div class="mob-status mob-status-light"><span>08:11 WIB</span><span>ASEAN LCT · BI-BNM</span></div>
            <div class="mob-body" style="padding:10px;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <div style="font-size:11.5px;font-weight:700;color:#0f172a;">Konfirmasi QR Cross-Border</div>
                  <div style="font-size:9px;color:#64748b;">Standar QRIS Lintas Negara Bank Indonesia</div>
                </div>
                ${badge('DuitNow MY', 'info')}
              </div>

              <div style="background:#ffffff;border:1px solid #d5dde6;border-radius:5px;padding:9px;display:flex;align-items:center;gap:9px;">
                ${qrMatrixSvg(48)}
                <div style="min-width:0;">
                  <div style="font-size:11px;font-weight:700;color:#0f172a;">KL Sentral Express Retail</div>
                  <div style="font-size:9.2px;color:#475569;">Kuala Lumpur, Malaysia · PayNet</div>
                  <div class="mono" style="font-size:8.8px;color:#047857;font-weight:700;margin-top:2px;">Merchant Terverifikasi ASPI–PayNet</div>
                </div>
              </div>

              <div style="background:#edf3fd;border:1px solid #93b7f2;border-radius:5px;padding:10px;display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="font-size:9.5px;font-weight:700;color:#0b3d91;">Nominal Tagihan Merchant</span>
                  <span class="mono" style="font-size:9px;background:#ffffff;border:1px solid #93b7f2;padding:1px 5px;border-radius:3px;color:#0b3d91;font-weight:700;">Kunci Kurs 00:38</span>
                </div>
                <div style="display:flex;align-items:baseline;justify-content:space-between;">
                  <span class="mono" style="font-size:19px;font-weight:800;color:#0f172a;">MYR 14,50</span>
                  <span style="font-size:10px;color:#475569;font-weight:600;">=</span>
                  <span class="mono" style="font-size:19px;font-weight:800;color:#0f52ba;">Rp 52.055</span>
                </div>
                <div style="border-top:1px solid #bfd4f8;padding-top:6px;display:flex;flex-direction:column;gap:3px;font-size:9.4px;color:#334155;">
                  <div style="display:flex;justify-content:space-between;"><span>Kurs Konversi Live</span><span class="mono" style="font-weight:700;">Rp 3.590 / MYR</span></div>
                  <div style="display:flex;justify-content:space-between;"><span>Referensi JISDOR + Spread</span><span class="mono">Rp 3.577 (+0,36%)</span></div>
                  <div style="display:flex;justify-content:space-between;"><span>Biaya Admin Pengguna</span><span class="mono" style="color:#047857;font-weight:700;">Rp 0 (Gratis)</span></div>
                </div>
              </div>

              <div style="background:#ffffff;border:1px solid #d5dde6;border-radius:5px;padding:8px 10px;display:flex;flex-direction:column;gap:4px;font-size:9.5px;">
                <div style="font-weight:700;color:#0f172a;">Sumber Dana &amp; Proyeksi Saldo</div>
                <div style="display:flex;justify-content:space-between;color:#475569;"><span>Saldo TapNusa Saat Ini</span><span class="mono" style="font-weight:600;color:#0f172a;">Rp 482.500</span></div>
                <div style="display:flex;justify-content:space-between;color:#475569;"><span>Debit Transaksi FX-104</span><span class="mono" style="font-weight:600;color:#be123c;">-Rp 52.055</span></div>
                <div style="border-top:1px solid #edf2f7;padding-top:4px;display:flex;justify-content:space-between;font-weight:700;color:#0f172a;"><span>Sisa Saldo Setelah Bayar</span><span class="mono" style="color:#047857;">Rp 430.445</span></div>
              </div>

              <div style="background:#ffffff;border:1px solid #d5dde6;border-radius:5px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;font-size:9.2px;">
                <span style="color:#475569;">Koridor Tersedia Lainnya:</span>
                <div style="display:flex;gap:4px;">
                  <span class="e-badge e-badge-neutral mono">THB 462</span>
                  <span class="e-badge e-badge-neutral mono">SGD 11.840</span>
                </div>
              </div>

              <div style="background:#ffffff;border:1px solid #d5dde6;border-radius:5px;padding:7px 9px;display:flex;flex-direction:column;gap:4px;">
                <div style="font-size:9.2px;font-weight:700;color:#334155;">Riwayat ASEAN Terakhir (Nov 2026)</div>
                <div style="display:flex;justify-content:space-between;font-size:8.9px;color:#475569;">
                  <span>PromptPay · BTS Asok (THB 185)</span><span class="mono" style="font-weight:700;color:#0f172a;">-Rp 85.470</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:8.9px;color:#475569;">
                  <span>NETS QR · Changi T3 (SGD 19,80)</span><span class="mono" style="font-weight:700;color:#0f172a;">-Rp 234.432</span>
                </div>
              </div>

              <div style="margin-top:auto;display:flex;flex-direction:column;gap:5px;">
                <div style="background:#0f52ba;color:#ffffff;border-radius:4px;padding:9px;text-align:center;font-size:10.6px;font-weight:700;">Konfirmasi Biometrik / PIN · Rp 52.055</div>
                <div style="text-align:center;font-size:8.6px;color:#64748b;">Tercatat otomatis ke Rekap Klaim Perjalanan Dinas</div>
              </div>
            </div>
            ${mobNav(2)}
          </div>
        </div>
      </section>

      <!-- DEVICE 3: REKAP STRUK PERJALANAN BULANAN -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">3. Rekap Klaim Transportasi</div>
          ${badge('Ekspor ERP', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding:8px;background:#eef2f7;">
          <div class="mob-frame">
            <div class="mob-status mob-status-light"><span>08:20 WIB</span><span>KLAIM KORPORAT</span></div>
            <div class="mob-body" style="padding:10px;gap:8px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <div style="font-size:11.5px;font-weight:700;color:#0f172a;">Rekap Struk Perjalanan</div>
                  <div style="font-size:9px;color:#64748b;">Periode November 2026 · Cost Center CC-402</div>
                </div>
                ${badge('42 Struk', 'accent')}
              </div>

              <div style="background:#0f52ba;color:#ffffff;border-radius:5px;padding:10px 11px;display:flex;flex-direction:column;gap:5px;">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.2px;color:#dbeafe;">
                  <span>Total Klaim Transportasi Siap Ekspor</span>
                  <span class="mono" style="color:#86efac;font-weight:700;">100% Terverifikasi</span>
                </div>
                <div class="mono" style="font-size:20px;font-weight:800;">${fmtIdr(CLAIM_TOTAL)}</div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:#dbeafe;border-top:1px solid #356ed0;padding-top:5px;">
                  <span>Domestik (40x): Rp 362.000</span>
                  <span>ASEAN (2x): Rp 286.500</span>
                </div>
              </div>

              <div style="font-size:10px;font-weight:700;color:#334155;">Rincian per Operator &amp; Koridor</div>
              <div style="display:flex;flex-direction:column;gap:5px;">${claimRowsPhone}</div>

              <div style="background:#f0fdf7;border:1px solid #a7f3d0;border-radius:4px;padding:7px 9px;font-size:9.1px;color:#065f46;">
                <div style="font-weight:700;margin-bottom:2px;">Validitas Bukti Pajak &amp; HR Perusahaan</div>
                <div>Setiap struk memuat RRN ASPI, stempel waktu WIB, kurs BI LCT, dan hash SHA-256 anti-ubah.</div>
              </div>

              <div style="background:#ffffff;border:1px solid #d5dde6;border-radius:4px;padding:7px 9px;display:flex;flex-direction:column;gap:3px;font-size:9px;">
                <div style="display:flex;justify-content:space-between;color:#475569;"><span>Status Verifikasi Kebijakan HR</span><span class="mono" style="color:#047857;font-weight:700;">42/42 Sesuai</span></div>
                <div style="display:flex;justify-content:space-between;color:#475569;"><span>Pagu Transportasi Bulanan</span><span class="mono" style="color:#0f172a;font-weight:700;">Rp 1.500.000 (43%)</span></div>
              </div>

              <div style="margin-top:auto;display:flex;flex-direction:column;gap:5px;">
                <div style="background:#0f52ba;color:#ffffff;border-radius:4px;padding:8px;text-align:center;font-size:10.3px;font-weight:700;">Ekspor PDF + CSV (SAP Concur / Workday)</div>
                <div style="background:#ffffff;color:#0f172a;border:1px solid #cbd5e1;border-radius:4px;padding:7px;text-align:center;font-size:9.8px;font-weight:600;">Kirim Otomatis ke Email Finance Kantor</div>
              </div>
            </div>
            ${mobNav(3)}
          </div>
        </div>
      </section>

      <!-- RIGHT TELEMETRY & SDK COLUMN -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('cpu', 13, '#0f52ba')} Kontrol Kotlin HCE NFC &amp; TEE</div>
            ${badge('StrongBox OK', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div class="kv-grid">
              <div class="kv-item"><div class="kv-k">Application ID (AID)</div><div class="kv-v mono">A000000602101001</div></div>
              <div class="kv-item"><div class="kv-k">Kecepatan APDU</div><div class="kv-v mono" style="color:#047857;">62 ms (HCE+TEE)</div></div>
              <div class="kv-item"><div class="kv-k">Kriptogram Dinamis</div><div class="kv-v">Single-Use EMV/ASPI</div></div>
              <div class="kv-item"><div class="kv-k">Batas Anti-Relay</div><div class="kv-v mono">&lt; 150 ms RF Field</div></div>
              <div class="kv-item"><div class="kv-k">Token Offline Darurat</div><div class="kv-v mono">3 / 5 Tersedia</div></div>
              <div class="kv-item"><div class="kv-k">Batas Tanpa PIN</div><div class="kv-v mono">Rp 100.000 / Tap</div></div>
            </div>
            <div class="fh-code" style="font-size:9px;padding:6px 8px;"><span class="fh-code-tag">TapNusaHceService.kt</span> · ISO-DEP 14443-4
onDeactivated(): 0ms leak · Keystore HW-Bound
ASPI Token Pool: 5 pre-signed @ JKT1 Switch</div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('refresh', 13, '#0f52ba')} Aturan Auto-Topup BI-FAST</div>
            ${badge('Aktif · BCA', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div class="kv-grid">
              <div class="kv-item"><div class="kv-k">Ambang Pemicu Saldo</div><div class="kv-v mono">&lt; Rp 50.000</div></div>
              <div class="kv-item"><div class="kv-k">Nominal Isi Otomatis</div><div class="kv-v mono" style="color:#0f52ba;">+Rp 300.000</div></div>
              <div class="kv-item"><div class="kv-k">Rekening Sumber</div><div class="kv-v">BCA Direct ••••4821</div></div>
              <div class="kv-item"><div class="kv-k">Biaya Transaksi</div><div class="kv-v mono">Rp 2.500 (Flat BI)</div></div>
              <div class="kv-item"><div class="kv-k">Eksekusi Terakhir</div><div class="kv-v mono">TOP-209 · 08:05 WIB</div></div>
              <div class="kv-item"><div class="kv-k">Proteksi Velocity</div><div class="kv-v">Maks 2x / 24 Jam</div></div>
            </div>
            <div style="background:#f0fdf7;border:1px solid #a7f3d0;border-radius:3px;padding:6px 8px;font-size:9.6px;color:#065f46;">
              <strong>Zero-Friction Transit:</strong> Pengisian berjalan asinkron via SNAP BI Direct Debit tepat setelah tap gerbang menembus ambang Rp 50.000.
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.92;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')} Ekspor Klaim ke ERP Korporat</div>
            ${badge('SAP / Workday', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
            <div style="font-size:10px;color:#334155;">Struk komuter &amp; perjalanan dinas ASEAN dikelompokkan per Cost Center dan siap unggah ke modul Expense:</div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:9.8px;">
              <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
                <span>Format SAP Concur / Fiori Expense</span><span class="mono" style="font-weight:700;color:#047857;">CSV + XML OK</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
                <span>Lampiran Bukti Kurs LCT (MYR/THB/SGD)</span><span class="mono" style="font-weight:700;color:#047857;">Terlampir</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
                <span>Tanda Tangan Hash SHA-256 Dokumen</span><span class="mono" style="font-weight:700;color:#0f52ba;">e74a..92c1</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${meta.pages[2].title}`,
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell('p3', mainHtml, '<span>Mobile Studio: .NET MAUI 9 · Android 15 Kotlin HCE</span>'),
  });
}

// ============================================================================
// PAGE 4: PERSETUJUAN SETTLEMENT DoA (MAKER-CHECKER) & REKONSILIASI FX
// ============================================================================
function renderPage4() {
  const batchRows = SETTLEMENT_BATCHES.map((b) => `
    <tr class="${b.selected ? 'is-selected' : b.tone === 'warn' ? 'is-warn' : ''}">
      <td style="text-align:center;"><span class="cb ${b.selected ? 'checked' : ''}">${b.selected ? ic('check', 9, '#ffffff') : ''}</span></td>
      <td class="mono" style="font-weight:700;color:${b.selected ? '#0b3d91' : '#0f172a'};">${esc(b.id)}</td>
      <td style="font-weight:600;">${esc(b.partner)}</td>
      <td class="mono" style="text-align:center;">${badge(b.ccy, b.ccy === 'IDR' ? 'neutral' : 'info')}</td>
      <td class="num mono">${fmtNum(b.trx)}</td>
      <td class="num mono">${fmtIdr(b.grossIdr)}</td>
      <td class="num mono" style="color:#475569;">${fmtIdr(b.feeIdr)}</td>
      <td class="num mono" style="font-weight:700;color:#0f52ba;">${fmtIdr(b.netIdr)}</td>
      <td style="font-size:9.8px;color:#475569;">${esc(b.doa)}</td>
      <td>${badge(b.status, b.tone)}</td>
    </tr>
  `).join('');

  const fxBarChart = svgStackedBarChart({
    width: 496,
    height: 162,
    categories: ['W-01', 'W-02', 'W-03', 'W-04', 'W-05', 'W-06'],
    yFormat: (v) => `${Math.round(v)} Jt`,
    series: [
      { label: 'DuitNow MY (MYR)', color: '#0f52ba', values: [120, 148, 174, 192, 168, 163] },
      { label: 'PromptPay TH (THB)', color: '#0369a1', values: [74, 86, 98, 112, 96, 90] },
      { label: 'NETS SG (SGD)', color: '#0d9488', values: [88, 102, 118, 132, 116, 108] },
    ],
  });

  const mainHtml = `
    <div class="fh-filter-bar">
      <div class="fh-filter-group">
        <span class="fh-chip fh-chip-active">${ic('checkCircle', 11, '#0b3d91')} <strong>Antrean Persetujuan DoA:</strong> 2 Batch Menunggu Otorisasi</span>
        <span class="fh-chip"><strong>Gelombang Kliring:</strong> Wave-04 Pagi · Cut-Off 09:00 WIB</span>
        <span class="fh-chip"><strong>Kebijakan:</strong> SK Direksi DoA No. 14/2026 (Dual Control)</span>
      </div>
      <div class="fh-filter-group">
        <span class="e-btn e-btn-danger">${ic('alert', 11, '#be123c')} Tahan Batch untuk Audit</span>
        <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Setujui &amp; Rilis STL-1120-05</span>
      </div>
    </div>

    <section class="e-panel" style="flex:0 0 164px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#0f52ba')} Alur Persetujuan Maker–Checker–Approver: <span class="mono" style="color:#0b3d91;">STL-1120-05</span> · Grup Ritel Modern (Indomaret · Alfa)</div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="mono" style="font-size:10.5px;font-weight:700;color:#0f172a;">Net Payout: Rp 2.820.120.000</span>
          ${badge('DoA Tier 3 (> Rp 2 M)', 'warn')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
        <div class="doa-stepper">
          <div class="doa-step done">
            <div class="doa-step-head"><span>TAHAP 1 · OTOMATIS</span>${ic('checkCircle', 12, '#047857')}</div>
            <div class="doa-step-title">Rekonsiliasi Switch &amp; GL</div>
            <div class="doa-step-meta">07:45 WIB · 68.400 trx · 0 selisih</div>
          </div>
          <div class="doa-step done">
            <div class="doa-step-head"><span>TAHAP 2 · MAKER</span>${ic('checkCircle', 12, '#047857')}</div>
            <div class="doa-step-title">Validasi Settlement Analyst</div>
            <div class="doa-step-meta">07:58 WIB · A. Wijaya (Signed)</div>
          </div>
          <div class="doa-step done">
            <div class="doa-step-head"><span>TAHAP 3 · CHECKER</span>${ic('checkCircle', 12, '#047857')}</div>
            <div class="doa-step-title">Verifikasi Treasury Manager</div>
            <div class="doa-step-meta">08:11 WIB · S. Rahmawati (Signed)</div>
          </div>
          <div class="doa-step active">
            <div class="doa-step-head"><span>TAHAP 4 · APPROVER DoA</span>${badge('Aktif', 'accent')}</div>
            <div class="doa-step-title">Otorisasi VP Treasury</div>
            <div class="doa-step-meta">Menunggu R. Kusuma · Token HSM</div>
          </div>
          <div class="doa-step">
            <div class="doa-step-head"><span>TAHAP 5 · EKSEKUSI</span>${ic('clock', 12, '#64748b')}</div>
            <div class="doa-step-title">Rilis BI-FAST / RTGS</div>
            <div class="doa-step-meta">Terjadwal 09:00 WIB · pacs.008</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#475569;padding-top:2px;">
          <span><strong>Rincian Batch STL-1120-05:</strong> Gross <span class="mono" style="color:#0f172a;font-weight:700;">Rp 2.840.000.000</span> − MDR 0,7% <span class="mono" style="color:#0f172a;font-weight:700;">Rp 19.880.000</span> = Net Payout <span class="mono" style="color:#0f52ba;font-weight:700;">Rp 2.820.120.000</span></span>
          <span class="mono" style="color:#047857;font-weight:700;">Verifikasi Dual-Control: Terpenuhi (2/3 Tanda Tangan)</span>
        </div>
      </div>
    </section>

    <div style="display:grid;grid-template-columns:2.02fr 1fr;gap:8px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Daftar Batch Settlement Mitra &amp; Bank Peserta (14 Entitas · 100% Rekonsiliasi)</div>
          ${badge('Total Net: ' + fmtIdr(TOTAL_NET), 'accent')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p4-tbl" style="font-size:9.8px;">
            <colgroup>
              <col style="width:2.6%;">
              <col style="width:9.2%;">
              <col style="width:20.2%;">
              <col style="width:4.6%;">
              <col style="width:6.6%;">
              <col style="width:13.8%;">
              <col style="width:10.8%;">
              <col style="width:13.8%;">
              <col style="width:9.2%;">
              <col style="width:9.2%;">
            </colgroup>
            <thead>
              <tr>
                <th style="text-align:center;">#</th>
                <th>ID Batch</th>
                <th>Mitra / Operator / Bank</th>
                <th style="text-align:center;">CCY</th>
                <th class="num">Trx</th>
                <th class="num">Gross (IDR)</th>
                <th class="num">MDR / Fee</th>
                <th class="num">Net Payout</th>
                <th>Tingkat DoA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${batchRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL 14 BATCH SETTLEMENT (REKONSILIASI PENUH HAL. 01)</td>
                <td class="num mono">${fmtNum(TOTAL_TRX)}</td>
                <td class="num mono">${fmtIdr(TOTAL_GROSS)}</td>
                <td class="num mono">${fmtIdr(TOTAL_FEE)}</td>
                <td class="num mono" style="color:#0b3d91;">${fmtIdr(TOTAL_NET)}</td>
                <td class="mono" style="font-size:9.6px;">2 Pending DoA</td>
                <td>${badge('0 Selisih', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d8dee6;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#475569;">
            <span>Seluruh instruksi RTGS/BI-FAST menggunakan pesan terenkripsi <span class="mono">ISO 20022 pacs.008</span> dengan idempotency key unik.</span>
            <span class="mono" style="color:#047857;font-weight:700;">Suspense Account Balance: Rp 0</span>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.18;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('globe', 13, '#0f52ba')} Rekonsiliasi Nostro &amp; Volume LCT per Window</div>
            ${badge('Selisih Kurs: Rp 0', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>${fxBarChart}</div>
            <table class="e-table" style="font-size:9.6px;border:1px solid #d8dee6;">
              <colgroup><col style="width:20%;"><col style="width:30%;"><col style="width:28%;"><col style="width:22%;"></colgroup>
              <thead><tr><th>Nostro</th><th class="num">Saldo Tersedia</th><th class="num">Kewajiban Hari Ini</th><th class="num">Selisih</th></tr></thead>
              <tbody>
                <tr><td class="mono" style="font-weight:700;">BNI-MYR</td><td class="num mono">MYR 420.000</td><td class="num mono">MYR 268.691</td><td class="num mono" style="color:#047857;font-weight:700;">0,00</td></tr>
                <tr><td class="mono" style="font-weight:700;">BNI-THB</td><td class="num mono">THB 2.500.000</td><td class="num mono">THB 1.204.329</td><td class="num mono" style="color:#047857;font-weight:700;">0,00</td></tr>
                <tr><td class="mono" style="font-weight:700;">BNI-SGD</td><td class="num mono">SGD 115.000</td><td class="num mono">SGD 56.039</td><td class="num mono" style="color:#047857;font-weight:700;">0,00</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0.82;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('users', 13, '#0f52ba')} Matriks Kewenangan DoA (SK Direksi 14/2026)</div>
            ${badge('4 Tingkat', 'neutral')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table p4-doa" style="font-size:9.8px;">
              <colgroup><col style="width:16%;"><col style="width:30%;"><col style="width:34%;"><col style="width:20%;"></colgroup>
              <thead><tr><th>Tier</th><th>Batas Nilai Batch</th><th>Approver Wajib</th><th>Kontrol</th></tr></thead>
              <tbody>
                <tr><td class="mono" style="font-weight:700;">Tier 1</td><td class="mono">&lt; Rp 500 Juta</td><td>Settlement Ops Mgr</td><td>1-Eyes + Auto</td></tr>
                <tr><td class="mono" style="font-weight:700;">Tier 2</td><td class="mono">Rp 500 Jt – 2 M</td><td>Treasury Manager</td><td>Maker+Checker</td></tr>
                <tr class="is-selected"><td class="mono" style="font-weight:700;color:#0b3d91;">Tier 3</td><td class="mono" style="font-weight:700;">Rp 2 M – 10 M</td><td><strong>VP Treasury (R. Kusuma)</strong></td><td>HSM Dual-Sign</td></tr>
                <tr><td class="mono" style="font-weight:700;">Tier 4</td><td class="mono">&gt; Rp 10 Miliar</td><td>CFO + Dir. Kepatuhan</td><td>Board Quorum</td></tr>
              </tbody>
            </table>
            <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d8dee6;font-size:9.5px;color:#475569;">
              Segregation of Duties (SoD): Maker tidak dapat menyetujui batch sendiri; seluruh tanda tangan tercatat di WORM Ledger.
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${meta.pages[3].title}`,
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell('p4', mainHtml, '<span>DoA Queue: 2 Batch Menunggu Otorisasi VP Treasury</span>'),
  });
}

// ============================================================================
// PAGE 5: KEPATUHAN BANK INDONESIA (SNAP BI, PMK 69 & CORETAX XML)
// ============================================================================
function renderPage5() {
  const controlRows = COMPLIANCE_CONTROLS.map((c) => `
    <tr>
      <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(c.code)}</td>
      <td style="font-weight:600;">${esc(c.reg)}</td>
      <td style="color:#475569;">${esc(c.scope)}</td>
      <td style="font-size:9.8px;">${esc(c.owner)}</td>
      <td class="mono" style="font-size:9.6px;color:#334155;">${esc(c.evidence)}</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>
  `).join('');

  const endpointRows = SNAP_ENDPOINTS.map((e) => `
    <tr class="${e.tone === 'warn' ? 'is-warn' : ''}">
      <td style="font-weight:600;">${esc(e.service)}</td>
      <td class="mono" style="font-size:9.4px;color:#475569;">${esc(e.url)}</td>
      <td class="mono" style="font-size:9.4px;">${esc(e.cipher)}</td>
      <td class="num mono">${esc(e.p95)}</td>
      <td class="num mono" style="color:${e.tone === 'warn' ? '#b45309' : '#047857'};font-weight:700;">${esc(e.expiry)}</td>
      <td>${badge(e.status, e.tone)}</td>
    </tr>
  `).join('');

  const wormRows = WORM_LOGS.map((w) => `
    <tr>
      <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(w.seq)}</td>
      <td class="mono" style="color:#64748b;">${esc(w.time)}</td>
      <td class="mono" style="font-size:9.5px;">${esc(w.actor)}</td>
      <td style="font-size:9.8px;">${esc(w.action)}</td>
      <td class="mono" style="font-size:9.3px;color:#047857;">${esc(w.hash)}</td>
    </tr>
  `).join('');

  const mainHtml = `
    <div class="fh-filter-bar">
      <div class="fh-filter-group">
        <span class="fh-chip fh-chip-active">${ic('shield', 11, '#0b3d91')} <strong>Regulator:</strong> Bank Indonesia · ASPI · DJP CoreTax · PPATK</span>
        <span class="fh-chip"><strong>NPWP 16-Digit:</strong> <span class="mono">0123456789012345</span> (PKP Jasa Sistem Pembayaran)</span>
        <span class="fh-chip"><strong>Masa Pajak:</strong> November 2026 (PMK 69/2022)</span>
      </div>
      <div class="fh-filter-group">
        <span class="e-btn">${ic('key', 11, '#334155')} Rotasi Sertifikat mTLS</span>
        <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh CoreTax XML e-Faktur</span>
      </div>
    </div>

    <div class="fh-kpi-grid" style="grid-template-columns: repeat(5, 1fr);">
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Kepatuhan SNAP BI v2.1</span>${badge('100% Lulus', 'ok')}</div>
        <div class="fh-kpi-mid"><span class="fh-kpi-val">6 / 6 Host</span></div>
        <div class="fh-kpi-sub"><span>OAuth2 + mTLS TLS 1.3</span><span class="mono">RSA-SHA256</span></div>
      </div>
      <div class="fh-kpi accent">
        <div class="fh-kpi-head"><span>DPP Jasa MDR &amp; BI-FAST</span>${badge('PMK 69/2022', 'accent')}</div>
        <div class="fh-kpi-mid"><span class="fh-kpi-val">${fmtIdr(TOTAL_FEE)}</span></div>
        <div class="fh-kpi-sub"><span>Pendapatan Jasa PSAK 72</span><span class="mono">24 Jam</span></div>
      </div>
      <div class="fh-kpi info">
        <div class="fh-kpi-head"><span>PPN Keluaran 11% (CoreTax)</span>${badge('Siap Unggah', 'info')}</div>
        <div class="fh-kpi-mid"><span class="fh-kpi-val">${fmtIdr(PPN_11_IDR)}</span></div>
        <div class="fh-kpi-sub"><span>Faktur Pajak Kode 04</span><span class="mono">Bruto Rp 251,4 Jt</span></div>
      </div>
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Laporan Berkala BI (LKPBU)</span>${badge('Tepat Waktu', 'ok')}</div>
        <div class="fh-kpi-mid"><span class="fh-kpi-val">T+0 Terkirim</span></div>
        <div class="fh-kpi-sub"><span>Float 100% di Bank Umum</span><span class="mono">0 Temuan</span></div>
      </div>
      <div class="fh-kpi ok">
        <div class="fh-kpi-head"><span>Integritas Audit WORM</span>${badge('SHA-256 OK', 'ok')}</div>
        <div class="fh-kpi-mid"><span class="fh-kpi-val">584.200 Blok</span></div>
        <div class="fh-kpi-sub"><span>Retensi 10 Tahun (UU P2SK)</span><span class="mono">Immutable</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.32fr 1fr;gap:8px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.38;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#0f52ba')} Matriks Kepatuhan Regulasi Bank Indonesia, ASPI, PSAK 72 &amp; DJP (10 Kontrol)</div>
            ${badge('10/10 Terverifikasi', 'ok')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table p5-ctl" style="font-size:9.9px;">
              <colgroup>
                <col style="width:11.2%;">
                <col style="width:27.3%;">
                <col style="width:29%;">
                <col style="width:10.5%;">
                <col style="width:10.5%;">
                <col style="width:11.5%;">
              </colgroup>
              <thead>
                <tr><th>Kode</th><th>Dasar Regulasi / Standar</th><th>Lingkup Kontrol &amp; Bukti</th><th>PIC</th><th>Ref Bukti</th><th>Status</th></tr>
              </thead>
              <tbody>${controlRows}</tbody>
            </table>
            <div style="padding:5px 10px;background:#f8fafc;border-top:1px solid #d8dee6;display:flex;justify-content:space-between;font-size:9.6px;color:#475569;">
              <span>Audit Eksternal KAP &amp; Pengawasan On-Site Bank Indonesia terakhir: <strong>14 Okt 2026 (Wajar Tanpa Pengecualian)</strong></span>
              <span class="mono" style="color:#047857;font-weight:700;">Score: 100%</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#0f52ba')} Registri Endpoint SNAP BI OAuth2 &amp; Sertifikat mTLS (6 Gateway)</div>
            ${badge('1 Jadwal Rotasi', 'warn')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table p5-snap" style="font-size:10px;">
              <colgroup>
                <col style="width:25%;">
                <col style="width:27%;">
                <col style="width:17%;">
                <col style="width:8%;">
                <col style="width:10%;">
                <col style="width:13%;">
              </colgroup>
              <thead>
                <tr><th>Layanan / Mitra</th><th>Endpoint Gateway</th><th>Enkripsi</th><th class="num">p95</th><th class="num">Masa Aktif</th><th>Status</th></tr>
              </thead>
              <tbody>${endpointRows}</tbody>
            </table>
            <div style="padding:5px 10px;background:#f8fafc;border-top:1px solid #d8dee6;font-size:9.5px;color:#475569;">
              Kunci privat tersimpan di <strong>HSM Thales Luna FIPS 140-3 Level 3</strong> (DC Jakarta JK5); rotasi otomatis pada H-30 kedaluwarsa.
            </div>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.38;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#0f52ba')} Pratinjau CoreTax XML (Faktur Pajak PMK 69/2022)</div>
            ${badge('Skema DJP v2.0 Valid', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
            <div class="fh-code" style="font-size:9.3px;line-height:1.42;"><span class="fh-code-tag">&lt;TaxInvoiceBulk</span> <span class="fh-code-dim">xmlns="urn:djp:coretax:efaktur:v2"</span><span class="fh-code-tag">&gt;</span>
  <span class="fh-code-tag">&lt;TIN&gt;</span><span class="fh-code-val">0123456789012345</span><span class="fh-code-tag">&lt;/TIN&gt;</span>
  <span class="fh-code-tag">&lt;TaxPeriod&gt;</span>2026-11<span class="fh-code-tag">&lt;/TaxPeriod&gt;</span>
  <span class="fh-code-tag">&lt;Invoice&gt;</span>
    <span class="fh-code-tag">&lt;TrxCode&gt;</span>04<span class="fh-code-tag">&lt;/TrxCode&gt;</span> <span class="fh-code-dim">&lt;!-- DPP Nilai Lain / Jasa Fintech PMK 69 --&gt;</span>
    <span class="fh-code-tag">&lt;RefBatch&gt;</span>STL-20261120-ALL-14<span class="fh-code-tag">&lt;/RefBatch&gt;</span>
    <span class="fh-code-tag">&lt;Description&gt;</span>Jasa Switch QRIS Tap NFC, MPM, LCT &amp; BI-FAST<span class="fh-code-tag">&lt;/Description&gt;</span>
    <span class="fh-code-tag">&lt;TaxBaseIdr&gt;</span><span class="fh-code-val">${TOTAL_FEE}</span><span class="fh-code-tag">&lt;/TaxBaseIdr&gt;</span>
    <span class="fh-code-tag">&lt;VATRate&gt;</span>0.11<span class="fh-code-tag">&lt;/VATRate&gt;</span>
    <span class="fh-code-tag">&lt;VATAmountIdr&gt;</span><span class="fh-code-val">${PPN_11_IDR}</span><span class="fh-code-tag">&lt;/VATAmountIdr&gt;</span>
    <span class="fh-code-tag">&lt;GrandTotalIdr&gt;</span><span class="fh-code-val">${TOTAL_INVOICE_TAX}</span><span class="fh-code-tag">&lt;/GrandTotalIdr&gt;</span>
    <span class="fh-code-tag">&lt;AccountingStd&gt;</span>PSAK-72-NET-REVENUE<span class="fh-code-tag">&lt;/AccountingStd&gt;</span>
  <span class="fh-code-tag">&lt;/Invoice&gt;</span>
<span class="fh-code-tag">&lt;/TaxInvoiceBulk&gt;</span></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
              <div style="background:#f8fafc;border:1px solid #d8dee6;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9px;color:#64748b;font-weight:600;">DPP Jasa (Net Fee)</div>
                <div class="mono" style="font-size:11.2px;font-weight:700;color:#0f172a;">${fmtIdr(TOTAL_FEE)}</div>
              </div>
              <div style="background:#edf3fd;border:1px solid #b7cef6;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9px;color:#0b3d91;font-weight:600;">PPN Keluaran 11%</div>
                <div class="mono" style="font-size:11.2px;font-weight:700;color:#0f52ba;">${fmtIdr(PPN_11_IDR)}</div>
              </div>
              <div style="background:#f0fdf7;border:1px solid #a7f3d0;border-radius:3px;padding:6px 8px;">
                <div style="font-size:9px;color:#065f46;font-weight:600;">Total Faktur Bruto</div>
                <div class="mono" style="font-size:11.2px;font-weight:700;color:#047857;">${fmtIdr(TOTAL_INVOICE_TAX)}</div>
              </div>
            </div>
            <div style="font-size:9.6px;color:#475569;border-top:1px solid #e2e8f0;padding-top:6px;">
              <strong>PSAK 72 Compliance:</strong> Dana titipan komuter (${fmtIdr(TOTAL_NET)}) diakui sebagai Liabilitas Escrow, bukan objek PPN. Hanya pendapatan MDR &amp; biaya BI-FAST yang menjadi DPP CoreTax.
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')} Jejak Audit WORM SHA-256 (Immutable Ledger)</div>
            ${badge('Chain Utuh', 'ok')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table p4-doa" style="font-size:9.8px;">
              <colgroup>
                <col style="width:12%;">
                <col style="width:12%;">
                <col style="width:19%;">
                <col style="width:41%;">
                <col style="width:16%;">
              </colgroup>
              <thead>
                <tr><th>Blok</th><th>Waktu</th><th>Aktor</th><th>Aktivitas Tercatat</th><th>Hash SHA-256</th></tr>
              </thead>
              <tbody>${wormRows}</tbody>
            </table>
            <div style="padding:5px 10px;background:#f0fdf7;border-top:1px solid #a7f3d0;display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:9.3px;color:#065f46;font-weight:700;">
              <span>Merkle Root: 8f4c1a9e77b2...d27b (Terverifikasi)</span>
              <span>Write-Once S3 Object Lock · 10 Thn</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${meta.pages[4].title}`,
    extraCss: EXTRA_CSS,
    bodyHtml: renderShell('p5', mainHtml, '<span>CoreTax XML: Faktur 040-26.881024 Siap Unggah DJP</span>'),
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
