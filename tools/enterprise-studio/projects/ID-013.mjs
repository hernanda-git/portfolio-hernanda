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
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-013',
  name: 'AmanahEscrow',
  reference: 'Swiss Institutional Treasury + Stripe Treasury / Adyen Enterprise Ledger',
  persona: 'M. Irfan Hidayat, S.E. · Senior Escrow Custodian · PT Amanah Kustodian Syariah',
  pages: [
    { slug: 'p1', title: 'Buku Kustodian & Portofolio Escrow Syariah' },
    { slug: 'p2', title: 'Buku Besar ACID & Inspektor Pencairan Termin' },
    { slug: 'p3', title: 'Verifikasi BAST, State Machine & Bukti Lapangan' },
    { slug: 'p4', title: 'Rail SNAP BI / BI-FAST & Sub-Akun PPh Final' },
    { slug: 'p5', title: 'Ruang Sengketa Independen, Kepatuhan DSN-MUI & WORM' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY RECONCILED ACROSS P1-P5)
// ============================================================================

const FLAGSHIP_CONTRACT_ID = 'KTR-2026-WKL-0084';

// Flagship contract milestones: Total Rp 7.000.000.000 (Telah Cair Rp 4,15 M + Ditahan Rp 2,85 M)
const FLAGSHIP_MILESTONES = [
  {
    code: 'TRM-01',
    title: 'Uang Muka (DP 20%)',
    subtitle: 'Dijamin Bank Garansi #BG-2026-44 · Cair via BI-FAST',
    bruto: 1400000000,
    pphRate: 0.0265,
    pph: 37100000,
    ujrah: 3500000,
    neto: 1359400000,
    sharePct: 20.0,
    status: 'Tercairkan',
    tone: 'ok',
    meta: 'Terverifikasi',
    bastNo: 'BG-2026-44 / BAST-01',
    date: '05 Agu 2026',
    hash: '0x41b7...90c',
  },
  {
    code: 'TRM-02',
    title: 'Termin 2 — Pondasi & Kolom',
    subtitle: 'Cair via BI-FAST · PPh Final terpisah otomatis',
    bruto: 2100000000,
    pphRate: 0.0265,
    pph: 55650000,
    ujrah: 5250000,
    neto: 2039100000,
    sharePct: 30.0,
    status: 'Tercairkan',
    tone: 'ok',
    meta: 'Terverifikasi',
    bastNo: 'BAST-2026-084-T2',
    date: '24 Sep 2026',
    hash: '0x6c2e...17a',
  },
  {
    code: 'TRM-02B',
    title: 'Termin 2B — Mekanikal & Drainase',
    subtitle: 'Adendum sistem drainase gudang & instalasi hidran',
    bruto: 650000000,
    pphRate: 0.0265,
    pph: 17225000,
    ujrah: 1625000,
    neto: 631150000,
    sharePct: 9.3,
    status: 'Tercairkan',
    tone: 'ok',
    meta: 'Terverifikasi',
    bastNo: 'BAST-2026-084-T2B',
    date: '28 Okt 2026',
    hash: '0x77d1...4b8',
  },
  {
    code: 'TRM-03',
    title: 'Termin 3 — Struktur Atap Gudang',
    subtitle: 'BAST ditandatangani owner + konsultan pengawas',
    bruto: 1250000000,
    pphRate: 0.0265,
    pph: 33125000,
    ujrah: 3125000,
    neto: 1213750000,
    sharePct: 17.9,
    status: 'Siap Cair',
    tone: 'warn',
    meta: '40% struktur',
    bastNo: 'BAST-2026-084-T3',
    date: '22 Nov 2026',
    hash: '0x8a9c...e41',
    selected: true,
  },
  {
    code: 'TRM-04',
    title: 'Termin 4 — Lantai Epoxy & Uji Laik',
    subtitle: 'Progres fisik berjalan 22% · target PHO Des 2026',
    bruto: 1250000000,
    pphRate: 0.0265,
    pph: 33125000,
    ujrah: 3125000,
    neto: 1213750000,
    sharePct: 17.9,
    status: 'Menunggu BAST',
    tone: 'info',
    meta: 'Progres 22%',
    bastNo: 'Menunggu BAST-T4',
    date: 'Est. 18 Des 2026',
    hash: 'pending',
  },
  {
    code: 'RET-05',
    title: 'Retensi Pemeliharaan (5%)',
    subtitle: 'Terkunci 90 hari masa pemeliharaan pasca PHO',
    bruto: 350000000,
    pphRate: 0.0265,
    pph: 9275000,
    ujrah: 875000,
    neto: 339850000,
    sharePct: 5.0,
    status: 'Terkunci',
    tone: 'neutral',
    meta: 'Tahan 90h',
    bastNo: 'FHO +90 Hari',
    date: 'Est. 18 Mar 2027',
    hash: 'locked_90d',
  },
];

// Portfolio of 8 Segregated Sharia Escrow Contracts
const CONTRACTS = [
  {
    id: 'KTR-2026-WKL-0084',
    project: 'Gudang Logistik Halal Cikarang Fase II',
    owner: 'PT Nusantara Coldchain Syariah',
    vendor: 'PT Karya Konstruksi Amanah',
    sector: 'Konstruksi',
    akad: 'Wakalah bil Ujrah',
    bank: 'BSI',
    va: 'BSI 8801-0084-0001',
    contractVal: 7000000000,
    disbursed: 4150000000,
    held: 2850000000,
    readyDisburse: 1250000000,
    taxRate: 0.0265,
    taxSegregated: 109975000,
    progressPct: 59,
    disputes: 0,
    status: 'Siap Cair (TRM-03)',
    tone: 'warn',
    selected: true,
  },
  {
    id: 'KTR-2026-WKL-0081',
    project: 'Klaster Hunian Syariah Bintaro Sektor 9 (42 Unit)',
    owner: 'PT Griya Hasanah Properti',
    vendor: 'PT Bangun Persada Utama',
    sector: 'Properti',
    akad: 'Wakalah bil Ujrah',
    bank: 'BSI',
    va: 'BSI 8801-0081-0004',
    contractVal: 18500000000,
    disbursed: 11100000000,
    held: 7400000000,
    readyDisburse: 2200000000,
    taxRate: 0.0265,
    taxSegregated: 294150000,
    progressPct: 60,
    disputes: 0,
    status: 'Siap Cair (TRM-04)',
    tone: 'warn',
  },
  {
    id: 'KTR-2026-WDH-0079',
    project: 'Pengadaan CPO Curah Halal 1.500 MT (Dumai-Marunda)',
    owner: 'PT Sawit Berkah Niaga',
    vendor: 'PT Riau Agro Sentosa',
    sector: 'Komoditas',
    akad: 'Wadiah Escrow',
    bank: 'Muamalat',
    va: 'BMI 7704-0079-0012',
    contractVal: 16200000000,
    disbursed: 14400000000,
    held: 1800000000,
    readyDisburse: 0,
    taxRate: 0.0025,
    taxSegregated: 36000000,
    progressPct: 89,
    disputes: 1,
    status: 'Beku Sengketa',
    tone: 'bad',
  },
  {
    id: 'KTR-2026-WKL-0076',
    project: 'RS Islam Terpadu Bekasi — Gedung Rawat Inap 6 Lt',
    owner: 'Yayasan Medika Al-Falah',
    vendor: 'PT Adhi Graha Syariah',
    sector: 'Konstruksi',
    akad: 'Wakalah bil Ujrah',
    bank: 'BSI',
    va: 'BSI 8801-0076-0009',
    contractVal: 24000000000,
    disbursed: 12000000000,
    held: 12000000000,
    readyDisburse: 1400000000,
    taxRate: 0.0265,
    taxSegregated: 318000000,
    progressPct: 50,
    disputes: 0,
    status: 'Siap Cair (TRM-03B)',
    tone: 'warn',
  },
  {
    id: 'KTR-2026-WKL-0072',
    project: 'Pabrik Pengolahan Kopi Gayo & Cold Storage Aceh',
    owner: 'PT Kopi Nusantara Ekspor',
    vendor: 'PT Rekayasa Industri Muda',
    sector: 'Konstruksi',
    akad: 'Wakalah bil Ujrah',
    bank: 'BSI',
    va: 'BSI 8801-0072-0002',
    contractVal: 11400000000,
    disbursed: 6840000000,
    held: 4560000000,
    readyDisburse: 0,
    taxRate: 0.0265,
    taxSegregated: 181260000,
    progressPct: 60,
    disputes: 0,
    status: 'Progres Lapangan',
    tone: 'ok',
  },
  {
    id: 'KTR-2026-WDH-0068',
    project: 'Akuisisi Lahan Kavling Komersial Karawang 4,2 Ha',
    owner: 'PT Amanah Sentra Logistik',
    vendor: 'PT Bumi Cikampek Jaya',
    sector: 'Properti',
    akad: 'Wadiah Notaris',
    bank: 'Muamalat',
    va: 'BMI 7704-0068-0003',
    contractVal: 19600000000,
    disbursed: 7840000000,
    held: 11760000000,
    readyDisburse: 0,
    taxRate: 0.025,
    taxSegregated: 196000000,
    progressPct: 40,
    disputes: 0,
    status: 'Menunggu AJB PPAT',
    tone: 'info',
  },
  {
    id: 'KTR-2026-WKL-0065',
    project: 'Sentra UMKM & Masjid Kawasan Halal Gresik',
    owner: 'PT Kawasan Halal Jatim',
    vendor: 'CV Bina Karya Mandiri',
    sector: 'Konstruksi',
    akad: 'Wakalah bil Ujrah',
    bank: 'Muamalat',
    va: 'BMI 7704-0065-0008',
    contractVal: 6400000000,
    disbursed: 4800000000,
    held: 1600000000,
    readyDisburse: 0,
    taxRate: 0.0175,
    taxSegregated: 84000000,
    progressPct: 75,
    disputes: 0,
    status: 'Masa Retensi',
    tone: 'neutral',
  },
  {
    id: 'KTR-2026-WKL-0061',
    project: 'Depot Bahan Pangan & Silo Jagung Makassar',
    owner: 'PT Pangan Mandiri Sulsel',
    vendor: 'PT Konstruksi Timur Prima',
    sector: 'Komoditas',
    akad: 'Wakalah bil Ujrah',
    bank: 'BSI',
    va: 'BSI 8801-0061-0005',
    contractVal: 9750000000,
    disbursed: 3070000000,
    held: 6680000000,
    readyDisburse: 0,
    taxRate: 0.0265,
    taxSegregated: 81355000,
    progressPct: 31,
    disputes: 0,
    status: 'Progres Lapangan',
    tone: 'ok',
  },
];

// Page 2: 16-Row ACID Double-Entry Ledger for Flagship Contract KTR-2026-WKL-0084
const LEDGER_ENTRIES = [
  { id: 'JRN-08401', ts: '02 Agu 09:14', stage: 'DEP-01', desc: 'Setoran Kustodian Awal Tahap I (Pemilik Proyek)', acct: 'VA Escrow BSI 8801-0084', rail: 'SNAP VA', debit: 0, credit: 2500000000, balance: 2500000000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08402', ts: '05 Agu 11:02', stage: 'TRM-01', desc: 'Cair Neto Uang Muka DP 20% (Jaminan #BG-2026-44)', acct: 'VA Kontraktor BSI 7198', rail: 'BI-FAST', debit: 1359400000, credit: 0, balance: 1140600000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08403', ts: '05 Agu 11:02', stage: 'TRM-01', desc: 'Pemisahan PPh Final Konstruksi 2,65% (PP 9/2022)', acct: 'Sub-Akun Pajak BSI-0084', rail: 'ACID SPLIT', debit: 37100000, credit: 0, balance: 1103500000, state: 'POSTED', tone: 'info' },
  { id: 'JRN-08404', ts: '05 Agu 11:02', stage: 'TRM-01', desc: 'Ujrah Wakalah Kustodian 0,25% (Flat Non-Riba)', acct: 'Rek. Ujrah Amanah', rail: 'ACID SPLIT', debit: 3500000, credit: 0, balance: 1100000000, state: 'POSTED', tone: 'neutral' },
  { id: 'JRN-08405', ts: '01 Sep 08:00', stage: 'AUDIT', desc: 'Rekonsiliasi Zero-Riba Bulanan (Imbal Hasil = Rp 0)', acct: 'VA Escrow BSI 8801-0084', rail: 'DPS SWEEP', debit: 0, credit: 0, balance: 1100000000, state: 'VERIFIED', tone: 'ok' },
  { id: 'JRN-08406', ts: '18 Sep 14:22', stage: 'DEP-02', desc: 'Setoran Kustodian Tahap II (Pemilik Proyek)', acct: 'VA Escrow BSI 8801-0084', rail: 'RTGS SYR', debit: 0, credit: 2500000000, balance: 3600000000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08407', ts: '24 Sep 10:15', stage: 'TRM-02', desc: 'Cair Neto Pondasi & Kolom (BAST-2026-084-T2)', acct: 'VA Kontraktor BSI 7198', rail: 'BI-FAST', debit: 2039100000, credit: 0, balance: 1560900000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08408', ts: '24 Sep 10:15', stage: 'TRM-02', desc: 'Pemisahan PPh Final Konstruksi 2,65% (PP 9/2022)', acct: 'Sub-Akun Pajak BSI-0084', rail: 'ACID SPLIT', debit: 55650000, credit: 0, balance: 1505250000, state: 'POSTED', tone: 'info' },
  { id: 'JRN-08409', ts: '24 Sep 10:15', stage: 'TRM-02', desc: 'Ujrah Wakalah Kustodian 0,25% (Flat Non-Riba)', acct: 'Rek. Ujrah Amanah', rail: 'ACID SPLIT', debit: 5250000, credit: 0, balance: 1500000000, state: 'POSTED', tone: 'neutral' },
  { id: 'JRN-08410', ts: '14 Okt 15:40', stage: 'DEP-03', desc: 'Setoran Pelunasan Kustodian Tahap III (Full Funded)', acct: 'VA Escrow BSI 8801-0084', rail: 'SNAP VA', debit: 0, credit: 2000000000, balance: 3500000000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08411', ts: '28 Okt 13:08', stage: 'TRM-02B', desc: 'Cair Neto Mekanikal & Drainase (BAST-2026-084-T2B)', acct: 'VA Kontraktor BSI 7198', rail: 'BI-FAST', debit: 631150000, credit: 0, balance: 2868850000, state: 'POSTED', tone: 'ok' },
  { id: 'JRN-08412', ts: '28 Okt 13:08', stage: 'TRM-02B', desc: 'Pemisahan PPh Final Konstruksi 2,65% (PP 9/2022)', acct: 'Sub-Akun Pajak BSI-0084', rail: 'ACID SPLIT', debit: 17225000, credit: 0, balance: 2851625000, state: 'POSTED', tone: 'info' },
  { id: 'JRN-08413', ts: '28 Okt 13:08', stage: 'TRM-02B', desc: 'Ujrah Wakalah Kustodian 0,25% (Flat Non-Riba)', acct: 'Rek. Ujrah Amanah', rail: 'ACID SPLIT', debit: 1625000, credit: 0, balance: 2850000000, state: 'POSTED', tone: 'neutral' },
  { id: 'JRN-08414', ts: '22 Nov 14:50', stage: 'TRM-03', desc: '[SIAP CAIR] Neto Struktur Atap Gudang (BAST #T3)', acct: 'VA Kontraktor BSI 7198', rail: 'BI-FAST', debit: 1213750000, credit: 0, balance: 1636250000, state: 'SIAP CAIR', tone: 'warn', selected: true },
  { id: 'JRN-08415', ts: '22 Nov 14:50', stage: 'TRM-03', desc: '[SIAP CAIR] Split PPh Final 2,65% ke Sub-Akun Pajak', acct: 'Sub-Akun Pajak BSI-0084', rail: 'ACID SPLIT', debit: 33125000, credit: 0, balance: 1603125000, state: 'SIAP CAIR', tone: 'warn' },
  { id: 'JRN-08416', ts: '22 Nov 14:50', stage: 'TRM-03', desc: '[SIAP CAIR] Ujrah Wakalah Kustodian 0,25%', acct: 'Rek. Ujrah Amanah', rail: 'ACID SPLIT', debit: 3125000, credit: 0, balance: 1600000000, state: 'SIAP CAIR', tone: 'warn' },
];

// Page 4: SNAP BI / BI-FAST & Tax Split Transaction Log (10 Rows)
const SNAP_TXNS = [
  { trace: 'SNP-261122-9401', ts: '14:50:12', contract: 'WKL-0084 · TRM-03', rail: 'BSI BI-FAST', bruto: 1250000000, pph: 33125000, ujrah: 3125000, neto: 1213750000, ntpn: 'QUEUE-EBIL-9401', ms: 142, iso: 'pacs.008 READY', tone: 'warn', selected: true },
  { trace: 'SNP-261122-9388', ts: '14:18:44', contract: 'WKL-0081 · TRM-04', rail: 'BSI BI-FAST', bruto: 2200000000, pph: 58300000, ujrah: 5500000, neto: 2136200000, ntpn: 'QUEUE-EBIL-9388', ms: 156, iso: 'pacs.008 READY', tone: 'warn' },
  { trace: 'SNP-261121-9120', ts: '16:04:19', contract: 'WKL-0076 · TRM-03A', rail: 'BSI BI-FAST', bruto: 3600000000, pph: 95400000, ujrah: 9000000, neto: 3495600000, ntpn: '4109882716402291', ms: 168, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261119-8942', ts: '11:32:07', contract: 'WKL-0072 · TRM-02', rail: 'BSI BI-FAST', bruto: 2840000000, pph: 75260000, ujrah: 7100000, neto: 2757640000, ntpn: '4109882715889104', ms: 149, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261115-8610', ts: '09:47:51', contract: 'WDH-0068 · DP-AJB', rail: 'BMI SNAP RTGS', bruto: 4200000000, pph: 105000000, ujrah: 10500000, neto: 4084500000, ntpn: '4109882714903312', ms: 238, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261112-8405', ts: '15:11:33', contract: 'WKL-0065 · TRM-03', rail: 'BMI BI-FAST', bruto: 1600000000, pph: 28000000, ujrah: 4000000, neto: 1568000000, ntpn: '4109882714118820', ms: 194, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261108-8112', ts: '10:25:09', contract: 'WDH-0079 · LOT-03', rail: 'BMI BI-FAST', bruto: 3600000000, pph: 9000000, ujrah: 9000000, neto: 3582000000, ntpn: '4109882713004419', ms: 187, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261028-7890', ts: '13:08:22', contract: 'WKL-0084 · TRM-02B', rail: 'BSI BI-FAST', bruto: 650000000, pph: 17225000, ujrah: 1625000, neto: 631150000, ntpn: '4109882711992041', ms: 138, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-261019-7604', ts: '14:40:15', contract: 'WKL-0061 · TRM-01', rail: 'BSI BI-FAST', bruto: 3070000000, pph: 81355000, ujrah: 7675000, neto: 2980970000, ntpn: '4109882710884122', ms: 151, iso: 'ACSC SETTLED', tone: 'ok' },
  { trace: 'SNP-260924-6940', ts: '10:15:04', contract: 'WKL-0084 · TRM-02', rail: 'BSI BI-FAST', bruto: 2100000000, pph: 55650000, ujrah: 5250000, neto: 2039100000, ntpn: '4109882708441907', ms: 134, iso: 'ACSC SETTLED', tone: 'ok' },
];

// Page 5: Immutable WORM SHA-256 Audit Chain (9 Rows)
const WORM_LOGS = [
  { blk: '#48192', ts: '22 Nov 14:50:12', actor: 'M. Irfan Hidayat (Custodian)', action: 'DISBURSE_STAGE_READY', target: 'WKL-0084 / TRM-03', detail: 'State Machine membuka gerbang cair Rp 1.250.000.000 (2/2 sig + e-Meterai valid)', hash: '8a9c4f2b...01e41', tone: 'warn' },
  { blk: '#48191', ts: '22 Nov 14:46:08', actor: 'Dr. Eng. Ratna Kusuma (Pengawas)', action: 'BAST_DUAL_SIG_VERIFIED', target: 'WKL-0084 / BAST-T3', detail: 'Tanda tangan BSrE pihak ke-2 terverifikasi; progres rangka atap 98,4%', hash: '7e3d9a14...88b02', tone: 'ok' },
  { blk: '#48190', ts: '22 Nov 14:31:55', actor: 'Peruri e-Meterai Gateway', action: 'EMETERAI_STAMP_SEALED', target: 'SN-9921-8840-7712-ID', detail: 'Meterai elektronik Rp 10.000 tersemat pada PDF/A BAST-2026-084-T3', hash: '5c1104fa...49d17', tone: 'info' },
  { blk: '#48189', ts: '22 Nov 11:04:19', actor: 'Ir. Hendra Wijaya (Pemilik)', action: 'BAST_OWNER_SIGNED', target: 'WKL-0084 / BAST-T3', detail: 'Otorisasi pemilik proyek + cek 4 foto geotag Cikarang (-6.3184, 107.1429)', hash: '3f92a7c0...c12a8', tone: 'ok' },
  { blk: '#48188', ts: '21 Nov 17:12:40', actor: 'BASYARNAS Mediator #M-04', action: 'DISPUTE_PROPOSAL_FILED', target: 'WDH-0079 / DSP-019', detail: 'Rekomendasi potong mutu CPO Rp 240 jt; saldo Rp 1,80 M tetap beku', hash: '1b84e2d9...77f31', tone: 'bad' },
  { blk: '#48187', ts: '20 Nov 09:30:00', actor: 'DPS Auditor (KH. A. Fauzan)', action: 'DPS_ZERO_RIBA_SWEEP', target: 'ALL-8-VA-SEGREGATED', detail: 'Verifikasi harian bunga/riba = Rp 0 pada seluruh 8 VA BSI & Bank Muamalat', hash: '9d02f4ab...3e519', tone: 'ok' },
  { blk: '#48186', ts: '19 Nov 16:05:11', actor: 'CoreTax Engine (.NET 9)', action: 'PPH_FINAL_EBILLING_PAID', target: 'WKL-0072 / NTPN-5889', detail: 'Setoran otomatis PPh Final Rp 75.260.000 terkonfirmasi MPN-G3', hash: '6a47c8e1...90a44', tone: 'info' },
  { blk: '#48185', ts: '18 Nov 13:22:04', actor: 'PT Sawit Berkah Niaga', action: 'DISPUTE_ESCROW_FROZEN', target: 'WDH-0079 / DSP-019', detail: 'Pembekuan darurat VA-FREEZE-BMI-0079 (Rp 1,80 M); lampiran lab FFA 5,8%', hash: '2e71b50c...d44e0', tone: 'bad' },
  { blk: '#48184', ts: '15 Nov 09:47:51', actor: 'Notaris Hj. Siti Rahmawati', action: 'NOTARY_DEED_ATTESTED', target: 'WDH-0068 / AJB-42', detail: 'Pengesahan akta PPAT & pelepasan termin DP AJB Rp 4,20 M via BMI RTGS', hash: '0f58d19e...22c91', tone: 'ok' },
];

// ============================================================================
// MATHEMATICAL INTEGRITY VERIFICATION (EXECUTES BEFORE RENDERING)
// ============================================================================

export function verifyMath() {
  // 1. Flagship contract invariants
  const fDisbursed = FLAGSHIP_MILESTONES.filter((m) => m.status === 'Tercairkan').reduce((a, m) => a + m.bruto, 0);
  const fHeld = FLAGSHIP_MILESTONES.filter((m) => m.status !== 'Tercairkan').reduce((a, m) => a + m.bruto, 0);
  const fTotal = fDisbursed + fHeld;
  if (fDisbursed !== 4150000000) throw new Error(`Flagship disbursed mismatch: ${fDisbursed}`);
  if (fHeld !== 2850000000) throw new Error(`Flagship held mismatch: ${fHeld}`);
  if (fTotal !== 7000000000) throw new Error(`Flagship total mismatch: ${fTotal}`);

  for (const m of FLAGSHIP_MILESTONES) {
    if (m.pph + m.ujrah + m.neto !== m.bruto) {
      throw new Error(`Milestone ${m.code} split mismatch: ${m.pph + m.ujrah + m.neto} vs ${m.bruto}`);
    }
  }

  // 2. Portfolio invariants
  const pContract = CONTRACTS.reduce((a, c) => a + c.contractVal, 0);
  const pDisbursed = CONTRACTS.reduce((a, c) => a + c.disbursed, 0);
  const pHeld = CONTRACTS.reduce((a, c) => a + c.held, 0);
  const pReady = CONTRACTS.reduce((a, c) => a + c.readyDisburse, 0);
  const pTax = CONTRACTS.reduce((a, c) => a + c.taxSegregated, 0);
  const pDisputes = CONTRACTS.reduce((a, c) => a + c.disputes, 0);

  for (const c of CONTRACTS) {
    if (c.disbursed + c.held !== c.contractVal) {
      throw new Error(`Contract ${c.id} balance mismatch`);
    }
    const expectedTax = Math.round(c.disbursed * c.taxRate);
    if (expectedTax !== c.taxSegregated) {
      throw new Error(`Contract ${c.id} tax mismatch: ${c.taxSegregated} vs ${expectedTax}`);
    }
  }
  if (pContract !== 112850000000) throw new Error(`Portfolio contractVal mismatch: ${pContract}`);
  if (pDisbursed !== 64200000000) throw new Error(`Portfolio disbursed mismatch: ${pDisbursed}`);
  if (pHeld !== 48650000000) throw new Error(`Portfolio held mismatch: ${pHeld}`);
  if (pReady !== 4850000000) throw new Error(`Portfolio readyDisburse mismatch: ${pReady}`);
  if (pTax !== 1300740000) throw new Error(`Portfolio taxSegregated mismatch: ${pTax}`);
  if (pDisputes !== 1) throw new Error(`Portfolio disputes mismatch: ${pDisputes}`);

  // Bank split check
  const bsiHeld = CONTRACTS.filter((c) => c.bank === 'BSI').reduce((a, c) => a + c.held, 0);
  const bmiHeld = CONTRACTS.filter((c) => c.bank === 'Muamalat').reduce((a, c) => a + c.held, 0);
  if (bsiHeld + bmiHeld !== pHeld) throw new Error('Bank held split mismatch');

  // 3. Page 2 ACID Ledger running balance check
  let run = 0;
  let postedCredits = 0;
  let postedDebits = 0;
  let stagedDebits = 0;
  for (const row of LEDGER_ENTRIES) {
    run = run + row.credit - row.debit;
    if (run !== row.balance) {
      throw new Error(`Ledger ${row.id} running balance mismatch: ${run} vs ${row.balance}`);
    }
    if (row.state === 'SIAP CAIR') {
      stagedDebits += row.debit;
    } else {
      postedCredits += row.credit;
      postedDebits += row.debit;
    }
  }
  if (postedCredits !== fTotal) throw new Error(`Ledger posted credits ${postedCredits} != ${fTotal}`);
  if (postedDebits !== fDisbursed) throw new Error(`Ledger posted debits ${postedDebits} != ${fDisbursed}`);
  if (postedCredits - postedDebits !== fHeld) throw new Error('Ledger posted closing balance != flagship held');
  if (stagedDebits !== 1250000000) throw new Error(`Staged TRM-03 debits ${stagedDebits} != 1250000000`);
  if (run !== 1600000000) throw new Error(`Projected post-TRM-03 balance ${run} != 1600000000`);

  // 4. Page 4 SNAP transaction split check
  for (const t of SNAP_TXNS) {
    if (t.pph + t.ujrah + t.neto !== t.bruto) {
      throw new Error(`SNAP ${t.trace} split mismatch`);
    }
  }
}

// Derived Aggregates
const PORT_CONTRACT = CONTRACTS.reduce((a, c) => a + c.contractVal, 0);
const PORT_DISBURSED = CONTRACTS.reduce((a, c) => a + c.disbursed, 0);
const PORT_HELD = CONTRACTS.reduce((a, c) => a + c.held, 0);
const PORT_READY = CONTRACTS.reduce((a, c) => a + c.readyDisburse, 0);
const PORT_TAX = CONTRACTS.reduce((a, c) => a + c.taxSegregated, 0);
const PORT_DISPUTES = CONTRACTS.reduce((a, c) => a + c.disputes, 0);
const BSI_HELD = CONTRACTS.filter((c) => c.bank === 'BSI').reduce((a, c) => a + c.held, 0);
const BMI_HELD = CONTRACTS.filter((c) => c.bank === 'Muamalat').reduce((a, c) => a + c.held, 0);

function fmtMiliar(n) {
  return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
}

function fmtJuta(n) {
  return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',') + ' jt';
}

// ============================================================================
// CUSTOM INSTITUTIONAL TREASURY CHROME (DISTINCT SWISS BANKING SHELL)
// ============================================================================

const EXTRA_CSS = `
  /* AmanahEscrow Swiss Institutional Banking Overrides */
  :root {
    --ae-pine: #082f2a;
    --ae-pine-2: #0d3f38;
    --ae-pine-bd: #17544b;
    --ae-gold: #9a6b22;
    --ae-gold-bg: #fdf8ee;
    --ae-gold-bd: #e9d5a8;
  }

  .ae-header {
    height: 38px;
    background: var(--ae-pine);
    color: #f0f6f4;
    border-bottom: 1px solid #041e1b;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .ae-head-l, .ae-head-r {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .ae-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: -0.015em;
    color: #ffffff;
    white-space: nowrap;
  }
  .ae-tag-syariah {
    background: #0e6b5e;
    color: #d7f5ee;
    border: 1px solid #1e8f7f;
    padding: 2px 7px;
    border-radius: 2px;
    font-family: var(--e-mono);
    font-size: 9.2px;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .ae-rail-ticker {
    height: 23px;
    padding: 0 8px;
    border-radius: 2px;
    background: var(--ae-pine-2);
    border: 1px solid var(--ae-pine-bd);
    color: #cce6e1;
    font-family: var(--e-mono);
    font-size: 9.8px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }
  .ae-rail-sep {
    color: #3f7a71;
  }
  .ae-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 10px;
    border-left: 1px solid var(--ae-pine-bd);
    white-space: nowrap;
  }
  .ae-avatar {
    width: 22px;
    height: 22px;
    border-radius: 2px;
    background: #0e6b5e;
    border: 1px solid #2b9a8a;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
  }

  /* Horizontal Swiss Module Navigation Rail (No Left Sidebar!) */
  .ae-tabbar {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border-strong);
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .ae-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
  }
  .ae-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 9px;
    font-size: 10.8px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .ae-tab.is-active {
    color: #094a41;
    font-weight: 700;
    border-bottom-color: #0e6b5e;
    background: #f2f9f7;
  }
  .ae-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #eef2f1;
    color: #334155;
  }
  .ae-tab.is-active .ae-tab-cnt {
    background: #0e6b5e;
    color: #ffffff;
  }
  .ae-tab-cnt.is-bad {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .ae-tab-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ae-ctx-pill {
    height: 22px;
    padding: 0 8px;
    border-radius: 2px;
    background: #f5f7f6;
    border: 1px solid #cbd5d1;
    color: #1e293b;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  /* Main Workspace Surface */
  .ae-work {
    flex: 1;
    min-height: 0;
    padding: 9px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Refined Hairline Panels & Swiss Ledger Tables */
  .e-panel {
    border-radius: 3px;
    border-color: #cfd9d5;
  }
  .e-panel-head {
    height: 30px;
    background: #f7faf9;
    border-bottom-color: #d5dfdb;
    padding: 0 10px;
  }
  .e-kpi {
    border-radius: 3px;
    border-color: #cfd9d5;
    padding: 7px 10px;
    gap: 2px;
  }
  .e-kpi-val {
    font-size: 16px;
  }
  .e-kpi.is-accent {
    border-top: 2.5px solid #0e6b5e;
  }
  .e-kpi.is-warn {
    border-top: 2.5px solid #b45309;
  }
  .e-kpi.is-bad {
    border-top: 2.5px solid #be123c;
  }
  table.e-table th {
    background: #f1f6f4;
    color: #364945;
    padding: 4.5px 7px;
    border-bottom-color: #c5d3ce;
  }
  table.e-table td {
    padding: 4px 7px;
    border-bottom-color: #e6eeeb;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fafcfb;
  }
  table.e-table tbody tr.is-selected {
    background: #eaf6f3 !important;
    box-shadow: inset 2.5px 0 0 #0e6b5e;
  }
  table.e-table tfoot td {
    background: #eaf1ef;
    border-top-color: #b5c7c1;
    padding: 5px 7px;
  }

  .ae-kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
  }
  .ae-kv {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
    padding: 3px 0;
    border-bottom: 1px dashed #e1e9e6;
    font-size: 10.5px;
  }
  .ae-kv-k {
    color: #526560;
    white-space: nowrap;
  }
  .ae-kv-v {
    color: #0f172a;
    font-weight: 600;
    text-align: right;
  }

  .ae-flagship-strip {
    background: #ffffff;
    border: 1px solid #b7cec6;
    border-left: 3px solid #0e6b5e;
    border-radius: 3px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ae-ms-row {
    display: grid;
    grid-template-columns: 54px 1fr 112px 78px 72px;
    align-items: center;
    gap: 6px;
    padding: 3.5px 6px;
    border: 1px solid #e3ebe8;
    border-radius: 2px;
    background: #fbfdfc;
    font-size: 10.4px;
  }
  .ae-ms-row.is-active {
    background: #fffbeb;
    border-color: #f5d08a;
  }

  .ae-split-box {
    border: 1px solid #cddad5;
    border-radius: 3px;
    background: #f8fbfa;
    padding: 7px 9px;
  }
  .ae-rule-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 4.5px 7px;
    border-bottom: 1px solid #e7eeeb;
    font-size: 10.3px;
  }
  .ae-rule-row:last-child {
    border-bottom: 0;
  }
  .ae-seal-box {
    border: 1px solid #9cc8bc;
    background: #f1faf7;
    border-radius: 3px;
    padding: 7px 9px;
  }
  .ae-freeze-banner {
    background: #fff1f2;
    border: 1px solid #fda4af;
    border-left: 3px solid #be123c;
    border-radius: 3px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
`;

function renderLogoMark() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
    <rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#0e6b5e" stroke="#2ca08f" stroke-width="1.2"/>
    <path d="M12 4.8L18.2 8.2V13.4C18.2 16.6 15.5 18.8 12 19.8C8.5 18.8 5.8 16.6 5.8 13.4V8.2L12 4.8Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    <path d="M9.2 12.4L11.1 14.3L15.1 10.1" stroke="#7ef0db" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function renderShell({ activeTab, pageTitle, actionsHtml = '', bodyHtml }) {
  const tabs = [
    { id: 'p1', label: 'Buku Kustodian', icon: 'layers', cnt: '8 VA' },
    { id: 'p2', label: 'Buku Besar ACID', icon: 'database', cnt: '16 Entri' },
    { id: 'p3', label: 'Verifikasi BAST', icon: 'checkCircle', cnt: 'TRM-03' },
    { id: 'p4', label: 'SNAP BI & PPh Final', icon: 'zap', cnt: 'Rp 1,30 M' },
    { id: 'p5', label: 'Sengketa & DSN-MUI', icon: 'shield', cnt: '1 Beku', bad: true },
  ];

  const header = `<header class="ae-header">
    <div class="ae-head-l">
      <div class="ae-logo">
        ${renderLogoMark()}
        <span>AmanahEscrow</span>
      </div>
      <span class="ae-tag-syariah">AKAD WAKALAH · VA TERSEGREGASI BSI & BMI</span>
      <div class="ae-rail-ticker">
        <span class="dot dot-ok"></span>
        <span>SNAP BI v1.2: 142ms</span>
        <span class="ae-rail-sep">|</span>
        <span>BI-FAST: ONLINE</span>
        <span class="ae-rail-sep">|</span>
        <span>PERURI e-METERAI: 1.420 KUOTA</span>
        <span class="ae-rail-sep">|</span>
        <span style="color:#7ef0db;font-weight:700;">RIBA: Rp 0 (VERIFIED)</span>
      </div>
    </div>
    <div class="ae-head-r">
      <div class="ae-rail-ticker" style="background:#0a2622;border-color:#15473f;color:#9fc4bd;">
        ${ic('clock', 11, '#7ef0db')}
        <span>22 Nov 2026 · 15:12 WIB</span>
      </div>
      <div class="ae-user">
        <span class="ae-avatar">IH</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#ffffff;">M. Irfan Hidayat, S.E.</div>
          <div style="font-size:9px;color:#9ac2ba;">Senior Escrow Custodian · PT Amanah Kustodian Syariah</div>
        </div>
      </div>
    </div>
  </header>`;

  const tabbar = `<nav class="ae-tabbar">
    <div class="ae-tabs">
      ${tabs
        .map((t) => {
          const active = t.id === activeTab;
          return `<div class="ae-tab ${active ? 'is-active' : ''}">
            ${ic(t.icon, 12.5, active ? '#0e6b5e' : '#64748b')}
            <span>${esc(t.label)}</span>
            <span class="ae-tab-cnt ${t.bad && !active ? 'is-bad' : ''}">${esc(t.cnt)}</span>
          </div>`;
        })
        .join('')}
    </div>
    <div class="ae-tab-right">
      <span class="ae-ctx-pill">${ic('lock', 11, '#0e6b5e')} <span>${FLAGSHIP_CONTRACT_ID}</span></span>
      ${actionsHtml}
    </div>
  </nav>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> PostgreSQL ACID Ledger (SERIALIZABLE · Zero-Drift)`,
      `DSN-MUI Fatwa No. 10/2000 & 113/2017 · Bebas Riba 100%`,
      `BSI SNAP API: 99,98% SLA · Bank Muamalat: 99,95% SLA`,
    ],
    rightItems: [
      `WORM Chain Head: #48192 (0x8a9c...e41)`,
      `CoreTax PP 9/2022 · Peruri TSA BSrE Aktif`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `AmanahEscrow — ${pageTitle}`,
    accent: '#0e6b5e',
    accentSoft: '#e6f4f1',
    accentInk: '#094a41',
    bg: '#f4f7f6',
    surface: '#ffffff',
    surface2: '#f7faf9',
    border: '#cfd9d5',
    borderStrong: '#b5c5bf',
    extraCss: EXTRA_CSS,
    bodyHtml: `${header}${tabbar}<main class="ae-work">${bodyHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: BUKU KUSTODIAN & KOMANDO ESCROW SYARIAH
// ============================================================================

function renderPage1() {
  const bsiPct = (BSI_HELD / PORT_HELD) * 100;
  const bmiPct = (BMI_HELD / PORT_HELD) * 100;
  const readyCount = CONTRACTS.filter((c) => c.readyDisburse > 0).length;

  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns: repeat(5, 1fr);">
    <div class="e-kpi is-accent">
      <div class="e-kpi-top">
        <span>Total Dana Kustodian Ditahan</span>
        ${badge('8 VA Aktif', 'accent')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtMiliar(PORT_HELD)}</span>
        ${svgSparkline({ points: [34.2, 36.8, 39.1, 41.4, 43.0, 44.8, 46.2, 48.65], color: '#0e6b5e', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span class="mono">${fmtIdr(PORT_HELD)}</span>
        <span>BSI ${fmtPct(bsiPct)} · BMI ${fmtPct(bmiPct)}</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Telah Cair (YTD Bebas Riba)</span>
        ${badge('100% BAST', 'ok')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">${fmtMiliar(PORT_DISBURSED)}</span>
        ${svgSparkline({ points: [18.4, 24.0, 31.2, 38.6, 45.1, 52.8, 59.4, 64.2], color: '#047857', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span class="mono">${fmtPct((PORT_DISBURSED / PORT_CONTRACT) * 100)} dari ${fmtMiliar(PORT_CONTRACT)}</span>
        <span>0 gagal transfer</span>
      </div>
    </div>

    <div class="e-kpi is-warn">
      <div class="e-kpi-top">
        <span>Antrean Termin Siap Cair</span>
        ${badge(`${readyCount} Termin`, 'warn')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">${fmtMiliar(PORT_READY)}</span>
        ${svgSparkline({ points: [1.2, 2.8, 1.9, 3.4, 2.1, 4.0, 3.6, 4.85], color: '#b45309', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span>Prioritas: TRM-03 Rp 1,25 M</span>
        <span class="mono">2/2 Sig OK</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Sub-Akun PPh Final Terpisah</span>
        ${badge('PP 9/2022', 'info')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#0369a1;">${fmtMiliar(PORT_TAX)}</span>
        ${svgSparkline({ points: [0.38, 0.52, 0.68, 0.81, 0.94, 1.09, 1.21, 1.30], color: '#0369a1', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span class="mono">${fmtIdr(PORT_TAX)}</span>
        <span>Otomatis ke e-Billing</span>
      </div>
    </div>

    <div class="e-kpi is-bad">
      <div class="e-kpi-top">
        <span>Sengketa & Pembekuan Dana</span>
        ${badge(`${PORT_DISPUTES} Kasus`, 'bad')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#be123c;">Rp 1,80 M</span>
        <span class="e-badge e-badge-ok">WKL-0084: 0 Kasus</span>
      </div>
      <div class="e-kpi-foot">
        <span>1 beku di BMI (CPO #DSP-019)</span>
        <span>Mediasi BASYARNAS</span>
      </div>
    </div>
  </section>`;

  const treasuryChart = svgMultiLineChart({
    width: 900,
    height: 196,
    xLabels: ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
    yMin: 0,
    yMax: 75,
    yTicks: 5,
    yFormat: (v) => `Rp ${Math.round(v)}M`,
    series: [
      {
        label: 'Akumulasi Pencairan Termin (Rp M)',
        color: '#0e6b5e',
        area: true,
        dots: true,
        values: [14.2, 18.4, 23.1, 28.5, 34.0, 39.2, 44.6, 49.8, 54.1, 58.3, 61.5, 64.2],
      },
      {
        label: 'Saldo Dana Ditahan VA Tersegregasi (Rp M)',
        color: '#0369a1',
        dashed: false,
        dots: true,
        values: [26.5, 29.4, 31.8, 34.2, 36.8, 39.1, 41.4, 43.0, 44.8, 46.2, 47.4, 48.65],
      },
      {
        label: 'Dana Retensi & Hold Sengketa (Rp M)',
        color: '#b45309',
        dashed: true,
        values: [2.4, 2.8, 3.1, 3.4, 3.9, 4.2, 4.6, 4.9, 5.1, 5.4, 5.6, 6.15],
      },
    ],
    annotations: [
      { index: 11, seriesIdx: 0, label: 'TRM-03 Siap Cair Rp 1,25 M', color: '#b45309', dy: -24 },
      { index: 7, seriesIdx: 0, label: 'WKL-0084 DP & Pondasi', color: '#0e6b5e', dy: -26 },
    ],
  });

  // Flagship 4 key items matching the specification verbatim
  const flagshipShowcaseItems = [
    FLAGSHIP_MILESTONES[3], // TRM-03 Siap Cair
    FLAGSHIP_MILESTONES[1], // TRM-02 Tercairkan
    FLAGSHIP_MILESTONES[0], // TRM-01 DP 20%
    FLAGSHIP_MILESTONES[5], // RET-05 Retensi 5%
  ];

  const middleGrid = `<section style="display:grid;grid-template-columns: 1.58fr 1fr;gap:8px;height:426px;min-height:0;flex-shrink:0;">
    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="height:232px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#0e6b5e')}
            <span>Arus Kustodian Escrow & Pencairan Termin Syariah (12 Bulan · Rp Miliar)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('ACID Reconciled', 'ok')}
            <span class="e-panel-sub mono">Total Kelolaan: ${fmtMiliar(PORT_CONTRACT)}</span>
          </div>
        </div>
        <div class="e-panel-body" style="padding:4px 8px 2px;">
          ${treasuryChart}
        </div>
      </div>

      <div class="ae-flagship-strip" style="flex:1;min-height:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            ${badge('PRIORITAS', 'accent')}
            <strong style="font-size:11.2px;color:#082f2a;" class="trunc">WKL-0084 · Gudang Logistik Halal Cikarang Fase II</strong>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <span class="mono" style="font-size:9.8px;color:#475569;">Ditahan <strong style="color:#0f172a;">Rp 2,85 M</strong> · Cair <strong style="color:#047857;">Rp 4,15 M</strong> · Sengketa <strong style="color:#047857;">0</strong></span>
            <span class="e-btn" style="height:22px;font-size:10px;">${ic('eye', 11, '#334155')} Periksa Bukti BAST</span>
            <span class="e-btn e-btn-primary" style="height:22px;font-size:10px;">${ic('zap', 11, '#ffffff')} Cairkan Termin 3</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${flagshipShowcaseItems
            .map(
              (m) => `<div class="ae-ms-row ${m.selected ? 'is-active' : ''}">
                <span class="mono" style="font-weight:700;color:${m.selected ? '#92400e' : '#094a41'};">${esc(m.code)}</span>
                <div class="trunc">
                  <strong style="color:#0f172a;">${esc(m.title)}</strong>
                  <span style="color:#64748b;margin-left:6px;">${esc(m.subtitle)}</span>
                </div>
                <span class="mono num" style="font-weight:700;color:#0f172a;">${fmtIdr(m.bruto)}</span>
                <span class="mono" style="font-size:9.8px;color:#64748b;text-align:right;">${esc(m.meta)}</span>
                <span style="text-align:right;">${badge(m.status, m.tone)}</span>
              </div>`
            )
            .join('')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#f1f8f6;border:1px solid #cce3dc;border-radius:2px;padding:4px 8px;font-family:var(--e-mono);font-size:9.8px;color:#094a41;">
          <span>Escrow State: Hash BAST TRM-03 <strong>0x8a9c...e41</strong> terverifikasi 2/2 pihak → Siap cair bebas riba ke VA Kontraktor BSI 7198-0441-8820.</span>
          <span style="color:#047857;font-weight:700;">PPh Final 2,65%: Rp 33.125.000</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
      <div class="e-panel" style="height:212px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('lock', 13, '#0e6b5e')}
            <span>Segregasi Rekening Virtual Bank Syariah</span>
          </div>
          <span class="e-panel-sub mono">Zero Co-mingling</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:4px;">
              <strong>Komposisi Dana Ditahan (${fmtMiliar(PORT_HELD)})</strong>
              <span class="mono" style="color:#0e6b5e;font-weight:700;">8 VA Tersegregasi</span>
            </div>
            <div style="display:flex;height:14px;border-radius:2px;overflow:hidden;border:1px solid #b9ccc6;">
              <div style="width:${bsiPct.toFixed(1)}%;background:#0e6b5e;"></div>
              <div style="width:${bmiPct.toFixed(1)}%;background:#4a2c7c;"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px;">
              <div class="ae-split-box">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                  <span style="font-weight:700;color:#082f2a;font-size:10.5px;">Bank Syariah Indonesia</span>
                  ${badge('5 VA', 'accent')}
                </div>
                <div class="mono" style="font-size:13px;font-weight:700;color:#0f172a;">${fmtMiliar(BSI_HELD)}</div>
                <div class="mono" style="font-size:9.5px;color:#526560;">${fmtPct(bsiPct)} · SNAP BI v1.2 · 0% Riba</div>
              </div>
              <div class="ae-split-box" style="background:#faf9fc;border-color:#d8d0e5;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                  <span style="font-weight:700;color:#3b2166;font-size:10.5px;">Bank Muamalat (BMI)</span>
                  ${badge('3 VA', 'neutral')}
                </div>
                <div class="mono" style="font-size:13px;font-weight:700;color:#0f172a;">${fmtMiliar(BMI_HELD)}</div>
                <div class="mono" style="font-size:9.5px;color:#526560;">${fmtPct(bmiPct)} · 1 VA Beku Sengketa</div>
              </div>
            </div>
          </div>
          <div style="border-top:1px solid #e1eae7;padding-top:6px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:10px;">
            <div>
              <div style="color:#64748b;">Sektor Konstruksi</div>
              <div class="mono" style="font-weight:700;color:#0f172a;">Rp 21,01 M <span style="color:#64748b;font-weight:500;">(4)</span></div>
            </div>
            <div>
              <div style="color:#64748b;">Sektor Properti</div>
              <div class="mono" style="font-weight:700;color:#0f172a;">Rp 19,16 M <span style="color:#64748b;font-weight:500;">(2)</span></div>
            </div>
            <div>
              <div style="color:#64748b;">Sektor Komoditas</div>
              <div class="mono" style="font-weight:700;color:#0f172a;">Rp 8,48 M <span style="color:#64748b;font-weight:500;">(2)</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('server', 13, '#0e6b5e')}
            <span>Kesehatan Rail Perbankan, Pajak & e-Meterai</span>
          </div>
          ${badge('SEMUA SEHAT', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <div class="ae-rule-row">
            <div><strong style="color:#0f172a;">BSI SNAP Open API v1.2</strong><div style="font-size:9.5px;color:#64748b;">VA Inquiry, Balance Sync, Asymmetric RSA-SHA256</div></div>
            <div style="text-align:right;"><span class="mono" style="font-weight:700;color:#047857;">142 ms</span><div>${badge('99,98% OK', 'ok')}</div></div>
          </div>
          <div class="ae-rule-row">
            <div><strong style="color:#0f172a;">BI-FAST Core Transfer (ISO 20022)</strong><div style="font-size:9.5px;color:#64748b;">Pencairan termin real-time pacs.008 &gt; Rp 1 M</div></div>
            <div style="text-align:right;"><span class="mono" style="font-weight:700;color:#047857;">158 ms</span><div>${badge('ACTIVE', 'ok')}</div></div>
          </div>
          <div class="ae-rule-row">
            <div><strong style="color:#0f172a;">Bank Muamalat VA & Freeze API</strong><div style="font-size:9.5px;color:#64748b;">Kontrol blokir debet sengketa & Wadiah Notaris</div></div>
            <div style="text-align:right;"><span class="mono" style="font-weight:700;color:#047857;">189 ms</span><div>${badge('99,95% OK', 'ok')}</div></div>
          </div>
          <div class="ae-rule-row">
            <div><strong style="color:#0f172a;">Peruri e-Meterai & BSrE Digital Sign</strong><div style="font-size:9.5px;color:#64748b;">Segel BAST PDF/A + TSA · Kuota 1.420 keping</div></div>
            <div style="text-align:right;"><span class="mono" style="font-weight:700;color:#0369a1;">312 ms</span><div>${badge('TERVERIFIKASI', 'info')}</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const portfolioTable = `<section class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('fileText', 13, '#0e6b5e')}
        <span>Portofolio Rekening Bersama Syariah Aktif (8 Kontrak Tersegregasi)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="e-panel-sub">Urutan: Prioritas Pencairan & Sengketa</span>
        ${badge('Zero Co-mingling Audit: LULUS', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table">
        <colgroup>
          <col style="width:128px;"/>
          <col style="width:302px;"/>
          <col style="width:142px;"/>
          <col style="width:118px;"/>
          <col style="width:126px;"/>
          <col style="width:126px;"/>
          <col style="width:126px;"/>
          <col style="width:108px;"/>
          <col style="width:98px;"/>
          <col style="width:136px;"/>
        </colgroup>
        <thead>
          <tr>
            <th>Kode Kontrak</th>
            <th>Objek Proyek / Kontrak</th>
            <th>Akad &amp; Rekening VA</th>
            <th>Sektor</th>
            <th class="num">Nilai Kontrak</th>
            <th class="num">Telah Cair</th>
            <th class="num">Dana Ditahan</th>
            <th class="num">PPh Final</th>
            <th>Progres Cair</th>
            <th>Status Kustodian</th>
          </tr>
        </thead>
        <tbody>
          ${CONTRACTS.map(
            (c) => `<tr class="${c.selected ? 'is-selected' : c.disputes > 0 ? 'is-bad' : ''}">
              <td class="mono" style="font-weight:700;color:#094a41;">${esc(c.id)}</td>
              <td><strong style="color:#0f172a;">${esc(c.project)}</strong></td>
              <td class="mono" style="font-size:10px;color:#334155;">${esc(c.va)}</td>
              <td>${esc(c.sector)} · ${esc(c.akad.split(' ')[0])}</td>
              <td class="mono num">${fmtIdr(c.contractVal)}</td>
              <td class="mono num" style="color:#047857;font-weight:600;">${fmtIdr(c.disbursed)}</td>
              <td class="mono num" style="font-weight:700;">${fmtIdr(c.held)}</td>
              <td class="mono num" style="color:#0369a1;">${fmtIdr(c.taxSegregated)}</td>
              <td>${renderCapacityBar(c.progressPct, { warnAt: 85, critAt: 98 })}</td>
              <td>${badge(c.status, c.tone)}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">TOTAL PORTOFOLIO KUSTODIAN SYARIAH (8 KONTRAK · 1 SENGKETA AKTIF)</td>
            <td class="mono num">${fmtIdr(PORT_CONTRACT)}</td>
            <td class="mono num" style="color:#047857;">${fmtIdr(PORT_DISBURSED)}</td>
            <td class="mono num">${fmtIdr(PORT_HELD)}</td>
            <td class="mono num" style="color:#0369a1;">${fmtIdr(PORT_TAX)}</td>
            <td class="mono" style="text-align:right;">${fmtPct((PORT_DISBURSED / PORT_CONTRACT) * 100)}</td>
            <td>${badge('REKONSILED 100%', 'ok')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p1',
    pageTitle: meta.pages[0].title,
    actionsHtml: `<span class="e-btn">${ic('download', 11, '#334155')} Ekspor Laporan DPS</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Buka Akad Escrow Baru</span>`,
    bodyHtml: `${kpiStrip}${middleGrid}${portfolioTable}`,
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR ACID & INSPEKTOR PENCAIRAN TERMIN (16-ROW LEDGER)
// ============================================================================

function renderPage2() {
  const postedCredits = LEDGER_ENTRIES.filter((r) => r.state !== 'SIAP CAIR').reduce((a, r) => a + r.credit, 0);
  const postedDebits = LEDGER_ENTRIES.filter((r) => r.state !== 'SIAP CAIR').reduce((a, r) => a + r.debit, 0);
  const stagedDebits = LEDGER_ENTRIES.filter((r) => r.state === 'SIAP CAIR').reduce((a, r) => a + r.debit, 0);
  const postedBalance = postedCredits - postedDebits;
  const projectedBalance = postedBalance - stagedDebits;

  const topSummary = `<section class="e-panel" style="flex-shrink:0;">
    <div style="padding:7px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#ffffff;">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        ${badge('VA BSI 8801-0084-0001', 'accent')}
        <div>
          <div style="font-size:12px;font-weight:700;color:#082f2a;">Buku Besar Escrow ACID — KTR-2026-WKL-0084 (Gudang Logistik Halal Cikarang Fase II)</div>
          <div style="font-size:10px;color:#526560;">Pemilik: <strong>PT Nusantara Coldchain Syariah</strong> · Kontraktor: <strong>PT Karya Konstruksi Amanah</strong> · Akad Wakalah bil Ujrah (0,25% flat · 0% riba)</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;flex-shrink:0;">
        <div style="text-align:right;">
          <div style="font-size:9.5px;color:#64748b;">Total Dana Masuk (Kredit)</div>
          <div class="mono" style="font-size:12.5px;font-weight:700;color:#0f172a;">${fmtIdr(postedCredits)}</div>
        </div>
        <div style="width:1px;height:26px;background:#d5dfdb;"></div>
        <div style="text-align:right;">
          <div style="font-size:9.5px;color:#64748b;">Telah Cair (Posted Debet)</div>
          <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">${fmtIdr(postedDebits)}</div>
        </div>
        <div style="width:1px;height:26px;background:#d5dfdb;"></div>
        <div style="text-align:right;">
          <div style="font-size:9.5px;color:#64748b;">Saldo Ditahan Saat Ini</div>
          <div class="mono" style="font-size:12.5px;font-weight:700;color:#0e6b5e;">${fmtIdr(postedBalance)}</div>
        </div>
        <div style="width:1px;height:26px;background:#d5dfdb;"></div>
        <div style="text-align:right;">
          <div style="font-size:9.5px;color:#64748b;">Antrean TRM-03 Siap Cair</div>
          <div class="mono" style="font-size:12.5px;font-weight:700;color:#b45309;">${fmtIdr(stagedDebits)}</div>
        </div>
      </div>
    </div>
  </section>`;

  const mainSplit = `<section style="display:grid;grid-template-columns: 1.92fr 1fr;gap:9px;flex:1;min-height:0;">
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('database', 13, '#0e6b5e')}
          <span>Mutasi Jurnal Double-Entry PostgreSQL ACID (16 Baris · 13 Posted + 3 Staged TRM-03)</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          ${badge('Semua (16)', 'accent')}
          ${badge('Setoran VA (3)', 'neutral')}
          ${badge('Cair BI-FAST (4)', 'neutral')}
          ${badge('Split PPh Final (4)', 'info')}
          ${badge('Siap Cair (3)', 'warn')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.3px;">
          <colgroup>
            <col style="width:74px;"/>
            <col style="width:82px;"/>
            <col style="width:58px;"/>
            <col style="width:214px;"/>
            <col style="width:132px;"/>
            <col style="width:68px;"/>
            <col style="width:94px;"/>
            <col style="width:94px;"/>
            <col style="width:96px;"/>
            <col style="width:80px;"/>
          </colgroup>
          <thead>
            <tr>
              <th>ID Jurnal</th>
              <th>Waktu (WIB)</th>
              <th>Termin</th>
              <th>Uraian Transaksi Kustodian</th>
              <th>Akun / Counterparty</th>
              <th>Rail</th>
              <th class="num">Debet (Rp)</th>
              <th class="num">Kredit (Rp)</th>
              <th class="num">Saldo VA (Rp)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${LEDGER_ENTRIES.map(
              (r) => `<tr class="${r.selected ? 'is-selected' : r.state === 'SIAP CAIR' ? 'is-warn' : ''}">
                <td class="mono" style="padding:7.2px 6px;font-weight:700;color:#094a41;">${esc(r.id)}</td>
                <td class="mono" style="padding:7.2px 6px;font-size:9.6px;color:#475569;">${esc(r.ts)}</td>
                <td class="mono" style="padding:7.2px 6px;font-weight:600;">${esc(r.stage)}</td>
                <td style="padding:7.2px 6px;">${esc(r.desc)}</td>
                <td class="mono" style="padding:7.2px 6px;font-size:9.5px;color:#334155;">${esc(r.acct)}</td>
                <td class="mono" style="padding:7.2px 6px;font-size:9.3px;color:#526560;">${esc(r.rail)}</td>
                <td class="mono num" style="padding:7.2px 6px;color:${r.debit > 0 ? '#be123c' : '#94a3b8'};font-weight:${r.debit > 0 ? 600 : 400};">${r.debit > 0 ? fmtNum(r.debit) : '—'}</td>
                <td class="mono num" style="padding:7.2px 6px;color:${r.credit > 0 ? '#047857' : '#94a3b8'};font-weight:${r.credit > 0 ? 700 : 400};">${r.credit > 0 ? fmtNum(r.credit) : '—'}</td>
                <td class="mono num" style="padding:7.2px 6px;font-weight:700;color:#0f172a;">${fmtNum(r.balance)}</td>
                <td style="padding:7.2px 6px;">${badge(r.state, r.tone)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="padding:8px 6px;">TOTAL POSTED (13 ENTRI) · SALDO AKTUAL VA BSI: ${fmtIdr(postedBalance)} | PROYEKSI PASCA TRM-03: ${fmtIdr(projectedBalance)}</td>
              <td class="mono num" style="padding:8px 6px;color:#be123c;">${fmtNum(postedDebits)}</td>
              <td class="mono num" style="padding:8px 6px;color:#047857;">${fmtNum(postedCredits)}</td>
              <td class="mono num" style="padding:8px 6px;">${fmtNum(postedBalance)}</td>
              <td style="padding:8px 6px;">${badge('BALANCED', 'ok')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="padding:8px 10px;background:#f7faf9;border-top:1px solid #d5dfdb;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:10px;">
          <div class="ae-split-box" style="background:#ffffff;">
            <div style="color:#64748b;">Sub-Akun PPh Final (Posted)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#0369a1;">Rp 109.975.000</div>
            <div style="color:#526560;font-size:9.3px;">Rp 92,75 jt NTPN + Rp 17,23 jt Nov</div>
          </div>
          <div class="ae-split-box" style="background:#ffffff;">
            <div style="color:#64748b;">Akumulasi Ujrah Wakalah (0,25%)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#094a41;">Rp 10.375.000</div>
            <div style="color:#526560;font-size:9.3px;">Flat sesuai Akad No. 42 · Bebas riba</div>
          </div>
          <div class="ae-split-box" style="background:#ffffff;">
            <div style="color:#64748b;">Alokasi Retensi Terkunci (RET-05)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#334155;">Rp 350.000.000</div>
            <div style="color:#526560;font-size:9.3px;">5,0% nilai · Hold 90 hari pasca PHO</div>
          </div>
          <div class="ae-split-box" style="background:#ffffff;">
            <div style="color:#64748b;">Drift Check Bank BSI vs ACID DB</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#047857;">Rp 0 (0,00%)</div>
            <div style="color:#526560;font-size:9.3px;">Sync terakhir: 15:11:48 WIB</div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head" style="background:#fffbeb;border-bottom-color:#f5d08a;">
        <div class="e-panel-title" style="color:#92400e;">
          ${ic('zap', 13, '#b45309')}
          <span>Inspektor Otorisasi · TRM-03 (Siap Cair)</span>
        </div>
        ${badge('JRN-08414..16', 'warn')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div>
          <div style="font-size:12px;font-weight:700;color:#082f2a;">Termin 3 — Struktur Atap Gudang</div>
          <div style="font-size:10px;color:#526560;margin-top:2px;">Ref Dokumen: <span class="mono" style="font-weight:600;color:#0f172a;">BAST-2026-084-T3</span> · Peruri e-Meterai Terverifikasi</div>

          <div class="ae-split-box" style="margin-top:8px;">
            <div style="font-size:10px;font-weight:700;color:#094a41;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>PEMISAHAN DANA OTOMATIS (ATOMIC 3-LEG SPLIT)</span>
              <span class="mono">SERIALIZABLE</span>
            </div>
            <div class="ae-kv"><span class="ae-kv-k">Nilai Bruto Termin 3</span><span class="ae-kv-v mono">Rp 1.250.000.000</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Leg 2 · PPh Final Konstruksi (2,65%)</span><span class="ae-kv-v mono" style="color:#0369a1;">- Rp 33.125.000</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Leg 3 · Ujrah Wakalah Kustodian (0,25%)</span><span class="ae-kv-v mono" style="color:#526560;">- Rp 3.125.000</span></div>
            <div class="ae-kv" style="border-bottom:0;padding-top:6px;margin-top:2px;border-top:1px solid #b5c7c1;">
              <span style="font-weight:700;color:#082f2a;font-size:11px;">Leg 1 · Neto ke VA Kontraktor</span>
              <span class="mono" style="font-weight:800;font-size:13.5px;color:#047857;">Rp 1.213.750.000</span>
            </div>
          </div>

          <div style="margin-top:9px;">
            <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:4px;">DETAIL REKENING TUJUAN &amp; RAIL BI-FAST</div>
            <div class="ae-kv"><span class="ae-kv-k">Penerima Neto</span><span class="ae-kv-v">PT Karya Konstruksi Amanah</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Rekening Tujuan</span><span class="ae-kv-v mono">BSI 7198-0441-8820</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Sub-Akun Pajak</span><span class="ae-kv-v mono">VA-TAX-BSI-0084 (NPWP 02.418...)</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Format Pesan Rail</span><span class="ae-kv-v mono">ISO 20022 pacs.008 · SNAP v1.2</span></div>
            <div class="ae-kv"><span class="ae-kv-k">Idempotency Key</span><span class="ae-kv-v mono">idem_wkl0084_trm03_v1</span></div>
          </div>

          <div style="margin-top:9px;">
            <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:4px;">KUORUM PERSETUJUAN MULTI-PIHAK (2/2 + KUSTODIAN)</div>
            <div style="border:1px solid #d5dfdb;border-radius:3px;overflow:hidden;">
              <div class="ae-rule-row">
                <div><strong>1. Ir. Hendra Wijaya</strong> <span style="color:#64748b;">(Pemilik Proyek)</span></div>
                ${badge('SIGNED 11:04', 'ok')}
              </div>
              <div class="ae-rule-row">
                <div><strong>2. Dr. Eng. Ratna Kusuma</strong> <span style="color:#64748b;">(Pengawas)</span></div>
                ${badge('SIGNED 14:46', 'ok')}
              </div>
              <div class="ae-rule-row">
                <div><strong>3. Peruri e-Meterai &amp; Notaris</strong> <span style="color:#64748b;">(Segel Sah)</span></div>
                ${badge('VALID', 'info')}
              </div>
              <div class="ae-rule-row" style="background:#fffbeb;">
                <div><strong>4. M. Irfan Hidayat</strong> <span style="color:#92400e;">(Otorisator Akhir)</span></div>
                ${badge('MENUNGGU KLIK', 'warn')}
              </div>
            </div>
          </div>

          <div class="ae-seal-box" style="margin-top:9px;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:700;color:#094a41;">
              <span>${ic('lock', 11, '#0e6b5e')} Kriptografi Bukti BAST &amp; State Lock</span>
              <span class="mono">PG TX #94820114</span>
            </div>
            <div class="mono" style="font-size:9.4px;color:#1e3a34;margin-top:4px;word-break:break-all;">
              SHA-256 BAST: 0x8a9c4f2b19d07e83a44c9102f8b71c004a2e41<br/>
              Post-Cair Saldo: Rp 1.600.000.000 (TRM-04 Rp 1,25 M + RET-05 Rp 0,35 M)
            </div>
          </div>

          <div class="ae-split-box" style="margin-top:9px;">
            <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:4px;">RINGKASAN JADWAL TERMIN TERSISA PASCA TRM-03</div>
            <div class="ae-kv"><span class="ae-kv-k">TRM-04 · Lantai Epoxy &amp; Uji Laik (22%)</span><span class="ae-kv-v mono">Rp 1.250.000.000</span></div>
            <div class="ae-kv" style="border-bottom:0;"><span class="ae-kv-k">RET-05 · Retensi Pemeliharaan (90h PHO)</span><span class="ae-kv-v mono">Rp 350.000.000</span></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;padding-top:6px;border-top:1px solid #d5dfdb;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <span class="e-btn e-btn-primary" style="height:28px;justify-content:center;font-size:10.8px;">${ic('zap', 12, '#ffffff')} Cairkan Rp 1.213.750.000</span>
            <span class="e-btn" style="height:28px;justify-content:center;font-size:10.5px;">${ic('fileText', 12, '#334155')} Unduh Voucher Split</span>
          </div>
          <span class="e-btn e-btn-danger" style="height:24px;justify-content:center;font-size:10px;">${ic('alert', 11, '#be123c')} Tahan Pencairan &amp; Buka Ruang Klarifikasi Sengketa</span>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p2',
    pageTitle: meta.pages[1].title,
    actionsHtml: `<span class="e-btn">${ic('refresh', 11, '#334155')} Sync Saldo BSI SNAP</span>
      <span class="e-btn">${ic('download', 11, '#334155')} Ekspor Jurnal CSV/OFX</span>`,
    bodyHtml: `${topSummary}${mainSplit}`,
  });
}

// ============================================================================
// PAGE 3: VERIFIKASI BAST, STATE MACHINE TERMIN & BUKTI LAPANGAN
// ============================================================================

function renderStateMachineSvg() {
  const nodes = [
    { x: 14, w: 204, code: 'AKAD', title: 'Akad Wakalah & VA', sub: 'Rp 7,00 M Funded · e-Meterai', state: 'SELESAI', fill: '#ecfdf5', stroke: '#047857', ink: '#065f46' },
    { x: 244, w: 204, code: 'TRM-01', title: 'Uang Muka (DP 20%)', sub: 'Rp 1,40 M · BG #BG-2026-44', state: 'CAIR 05 AGU', fill: '#ecfdf5', stroke: '#047857', ink: '#065f46' },
    { x: 474, w: 204, code: 'TRM-02', title: 'Pondasi & Kolom', sub: 'Rp 2,10 M · BAST #T2 Valid', state: 'CAIR 24 SEP', fill: '#ecfdf5', stroke: '#047857', ink: '#065f46' },
    { x: 704, w: 204, code: 'TRM-02B', title: 'Mekanikal & Drainase', sub: 'Rp 0,65 M · BAST #T2B Valid', state: 'CAIR 28 OKT', fill: '#ecfdf5', stroke: '#047857', ink: '#065f46' },
    { x: 934, w: 230, code: 'TRM-03', title: 'Struktur Atap Gudang', sub: 'Rp 1,25 M · 2/2 Sig · Hash OK', state: 'GERBANG AKTIF', fill: '#fffbeb', stroke: '#b45309', ink: '#92400e', active: true },
    { x: 1190, w: 178, code: 'TRM-04', title: 'Epoxy & Uji Laik', sub: 'Rp 1,25 M · Progres 22%', state: 'TERKUNCI', fill: '#f8fafc', stroke: '#94a3b8', ink: '#475569' },
    { x: 1394, w: 162, code: 'RET-05', title: 'Retensi (5%)', sub: 'Rp 0,35 M · Hold 90h', state: 'HOLD 90H', fill: '#f1f5f9', stroke: '#94a3b8', ink: '#475569' },
  ];

  let svg = '';
  // Connecting transition arrows
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const x1 = a.x + a.w;
    const x2 = b.x;
    const y = 52;
    const passed = i < 4;
    const col = passed ? '#0e6b5e' : '#94a3b8';
    svg += `<line x1="${x1}" y1="${y}" x2="${x2 - 5}" y2="${y}" stroke="${col}" stroke-width="${passed ? 2 : 1.4}" ${passed ? '' : 'stroke-dasharray="4,3"'} />`;
    svg += `<polygon points="${x2},${y} ${x2 - 7},${y - 4} ${x2 - 7},${y + 4}" fill="${col}" />`;
  }

  // Dispute freeze bypass rail underneath TRM-03
  svg += `<path d="M 1049 90 L 1049 112 L 1540 112" fill="none" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3,3"/>`;
  svg += `<rect x="1084" y="102" width="336" height="19" rx="2" fill="#fff1f2" stroke="#fda4af" stroke-width="1"/>`;
  svg += `<text x="1094" y="114.5" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#be123c">GUARD SENGKETA: 0 KASUS AKTIF · FREEZE VA TIDAK TERPICU</text>`;

  // Cumulative telemetry rail on left bottom
  svg += `<rect x="14" y="102" width="664" height="19" rx="2" fill="#f1f8f6" stroke="#b9d6cd" stroke-width="1"/>`;
  svg += `<text x="24" y="114.5" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#094a41">STATE ENGINE (.NET 9): CAIR Rp 4.150.000.000 (59,3%)  |  DITAHAN Rp 2.850.000.000 (40,7%)  |  NEXT: TRM-03 Rp 1.250.000.000</text>`;

  for (const n of nodes) {
    svg += `<rect x="${n.x}" y="14" width="${n.w}" height="74" rx="3" fill="${n.fill}" stroke="${n.stroke}" stroke-width="${n.active ? 2.2 : 1.3}" />`;
    svg += `<rect x="${n.x + 8}" y="22" width="54" height="15" rx="2" fill="${n.stroke}" />`;
    svg += `<text x="${n.x + 35}" y="32.5" text-anchor="middle" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">${esc(n.code)}</text>`;
    svg += `<text x="${n.x + n.w - 8}" y="32.5" text-anchor="end" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${n.ink}">${esc(n.state)}</text>`;
    svg += `<text x="${n.x + 8}" y="55" font-size="11" font-weight="700" font-family="Segoe UI,system-ui,sans-serif" fill="#0f172a">${esc(n.title)}</text>`;
    svg += `<text x="${n.x + 8}" y="72" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#475569">${esc(n.sub)}</text>`;
  }

  return `<svg viewBox="0 0 1568 128" width="100%" height="128" style="display:block;">${svg}</svg>`;
}

function renderRoofInspectionBlueprintSvg() {
  // Technical engineering schematic of Gudang Logistik Halal Cikarang Fase II (48m x 96m steel truss)
  return `<svg viewBox="0 0 510 282" width="100%" height="282" style="display:block;background:#091f1c;border-radius:3px;border:1px solid #17433c;">
    <!-- Engineering Grid -->
    <defs>
      <pattern id="aeGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#12342f" stroke-width="0.7"/>
      </pattern>
    </defs>
    <rect width="510" height="282" fill="url(#aeGrid)"/>

    <!-- Blueprint Header Strip -->
    <rect x="0" y="0" width="510" height="24" fill="#061614"/>
    <text x="10" y="15.5" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#7ef0db">DENAH ELEVASI RANGKA ATAP BAJA WF-400 · GUDANG CIKARANG FASE II</text>
    <text x="500" y="15.5" text-anchor="end" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#9ac2ba">SKALA 1:250 · BENTANG 48m × 96m</text>

    <!-- Columns & Foundation Line -->
    <line x1="36" y1="226" x2="474" y2="226" stroke="#3b7a6f" stroke-width="1.5"/>
    <rect x="52" y="114" width="10" height="112" fill="#1e5950" stroke="#53b3a3" stroke-width="1"/>
    <rect x="164" y="114" width="8" height="112" fill="#16463f" stroke="#3a897c" stroke-width="0.9" stroke-dasharray="3,2"/>
    <rect x="338" y="114" width="8" height="112" fill="#16463f" stroke="#3a897c" stroke-width="0.9" stroke-dasharray="3,2"/>
    <rect x="448" y="114" width="10" height="112" fill="#1e5950" stroke="#53b3a3" stroke-width="1"/>

    <!-- Steel Roof Truss (Verified TRM-03 Scope!) -->
    <polygon points="44,114 255,48 466,114" fill="#0e6b5e" fill-opacity="0.22" stroke="#5eead4" stroke-width="2"/>
    <line x1="44" y1="114" x2="466" y2="114" stroke="#5eead4" stroke-width="2"/>
    <!-- Truss Web Diagonals -->
    <polyline points="84,114 114,92 144,114 184,70 220,114 255,48 290,114 326,70 366,114 396,92 426,114" fill="none" stroke="#5eead4" stroke-width="1.3"/>
    <line x1="255" y1="48" x2="255" y2="114" stroke="#99f6e4" stroke-width="1.4"/>
    <!-- Zincalume Roof Sheeting Highlight -->
    <line x1="38" y1="111" x2="255" y2="43" stroke="#fde68a" stroke-width="2.2"/>
    <line x1="255" y1="43" x2="472" y2="111" stroke="#fde68a" stroke-width="2.2"/>

    <!-- Dimension Annotations -->
    <line x1="52" y1="244" x2="458" y2="244" stroke="#78a69d" stroke-width="0.9"/>
    <line x1="52" y1="238" x2="52" y2="250" stroke="#78a69d" stroke-width="0.9"/>
    <line x1="458" y1="238" x2="458" y2="250" stroke="#78a69d" stroke-width="0.9"/>
    <rect x="206" y="236" width="98" height="16" fill="#091f1c"/>
    <text x="255" y="247" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">BENTANG 48,00 m</text>

    <line x1="484" y1="48" x2="484" y2="226" stroke="#78a69d" stroke-width="0.9"/>
    <text x="498" y="142" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1" transform="rotate(-90 498 142)">ELEVASI +14,2 m</text>

    <!-- Geotagged Inspection Pins (4 Verified Points) -->
    <!-- CAM-01 -->
    <circle cx="114" cy="92" r="9" fill="#047857" stroke="#ffffff" stroke-width="1.5"/>
    <text x="114" y="95.2" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">01</text>
    <rect x="24" y="54" width="96" height="22" rx="2" fill="#06221e" stroke="#34d399" stroke-width="1"/>
    <text x="30" y="64" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">CAM-01 WF-400</text>
    <text x="30" y="72.5" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">Grid A-F · EXIF OK</text>

    <!-- CAM-02 -->
    <circle cx="255" cy="78" r="9" fill="#047857" stroke="#ffffff" stroke-width="1.5"/>
    <text x="255" y="81.2" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">02</text>
    <rect x="196" y="128" width="118" height="22" rx="2" fill="#06221e" stroke="#34d399" stroke-width="1"/>
    <text x="202" y="138" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">CAM-02 BAUT HTB A325</text>
    <text x="202" y="146.5" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">Uji Torsi 100% Lulus</text>

    <!-- CAM-03 -->
    <circle cx="364" cy="77" r="9" fill="#b45309" stroke="#ffffff" stroke-width="1.5"/>
    <text x="364" y="80.2" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">03</text>
    <rect x="374" y="42" width="112" height="22" rx="2" fill="#291a04" stroke="#fbbf24" stroke-width="1"/>
    <text x="380" y="52" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fde68a">CAM-03 ZINCALUME</text>
    <text x="380" y="60.5" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#e2e8f0">Insulasi Foil 98,4%</text>

    <!-- CAM-04 -->
    <circle cx="448" cy="114" r="9" fill="#047857" stroke="#ffffff" stroke-width="1.5"/>
    <text x="448" y="117.2" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">04</text>
    <rect x="358" y="158" width="110" height="22" rx="2" fill="#06221e" stroke="#34d399" stroke-width="1"/>
    <text x="364" y="168" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">CAM-04 TALANG &amp; PETIR</text>
    <text x="364" y="176.5" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">Grounding 1,4 Ohm OK</text>

    <!-- Footer Telemetry Bar -->
    <rect x="0" y="260" width="510" height="22" fill="#061614"/>
    <text x="10" y="274" font-size="8.6" font-family="ui-monospace,Consolas,monospace" fill="#7ef0db">GPS: -6.31842, 107.14289 (Deviasi 6,2m &lt; 50m)</text>
    <text x="500" y="274" text-anchor="end" font-size="8.6" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">VOLUME TERPASANG: 98,4% / TARGET 95,0%</text>
  </svg>`;
}

function renderPage3() {
  const statePanel = `<section class="e-panel" style="height:168px;flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('gitBranch', 13, '#0e6b5e')}
        <span>Milestone State Machine &amp; Transisi Kriptografis — KTR-2026-WKL-0084</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="e-panel-sub mono">Engine: .NET 9 Deterministic State Machine</span>
        ${badge('GATE TRM-03 TERBUKA (8/8 SYARAT LULUS)', 'warn')}
      </div>
    </div>
    <div class="e-panel-body" style="padding:4px 8px;">
      ${renderStateMachineSvg()}
    </div>
  </section>`;

  const evidenceRows = [
    { id: 'CAM-01', title: 'Pemasangan Kuda-Kuda Baja WF-400 Grid A–F', gps: '-6.3184, 107.1428', ts: '21 Nov 10:12', sha: '0x4f8a...c19', status: 'EXIF OK' },
    { id: 'CAM-02', title: 'Pengelasan & Uji Torsi Baut HTB A325 (420 Titik)', gps: '-6.3185, 107.1429', ts: '21 Nov 13:44', sha: '0x91d2...8e4', status: 'EXIF OK' },
    { id: 'CAM-03', title: 'Lembaran Atap Zincalume 0,45mm & Bubble Foil', gps: '-6.3183, 107.1430', ts: '22 Nov 08:50', sha: '0x2c7e...55a', status: 'EXIF OK' },
    { id: 'CAM-04', title: 'Talang Hujan Galvanis & Penangkal Petir (1,4 Ω)', gps: '-6.3186, 107.1427', ts: '22 Nov 09:35', sha: '0x6b11...09f', status: 'EXIF OK' },
  ];

  const guardRules = [
    { code: 'GRD-01', name: 'Saldo VA BSI Tersegregasi ≥ Rp 1.250.000.000', val: 'Rp 2,85 M', pass: true },
    { code: 'GRD-02', name: 'Kuorum Tanda Tangan BSrE Pemilik + Pengawas', val: '2 / 2 Sah', pass: true },
    { code: 'GRD-03', name: 'Validasi Segel Peruri e-Meterai PDF/A', val: 'SN-9921-ID', pass: true },
    { code: 'GRD-04', name: 'Anti-Tamper EXIF & Geotag Radius Proyek (<50m)', val: '6,2 m OK', pass: true },
    { code: 'GRD-05', name: 'Bobot Progres Fisik ≥ Ambang Termin 3 (95%)', val: '98,4% OK', pass: true },
    { code: 'GRD-06', name: 'Status Bank Garansi #BG-2026-44 Aktif', val: 'Aktif s.d. Mar 27', pass: true },
    { code: 'GRD-07', name: 'Bebas Flag Pembekuan Sengketa (Dispute Lock)', val: '0 Kasus', pass: true },
    { code: 'GRD-08', name: 'Tarif PPh Final PP 9/2022 Terkonfirmasi SBU', val: '2,65% · Rp 33,1 jt', pass: true },
  ];

  const mainCols = `<section style="display:grid;grid-template-columns: 1.24fr 1.16fr 1fr;gap:9px;flex:1;min-height:0;">
    <!-- Col 1: Blueprint & Field Geotag Evidence -->
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('eye', 13, '#0e6b5e')}
          <span>Inspeksi Visual &amp; Telemetri Bukti Lapangan (TRM-03)</span>
        </div>
        ${badge('4/4 FOTO VALID', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        ${renderRoofInspectionBlueprintSvg()}

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Geofence Radius Proyek</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">6,2 m &lt; 50 m</div>
            <div style="font-size:8.8px;color:#526560;">Cikarang Barat, Bekasi</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Perangkat &amp; Sensor EXIF</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#0f172a;">Mavic 3E + LiDAR</div>
            <div style="font-size:8.8px;color:#526560;">Anti-Spoof Signed OK</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Sinkronisasi Waktu NTP</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#0369a1;">BMKG Stratum-1</div>
            <div style="font-size:8.8px;color:#526560;">4/4 Hash Terkunci WORM</div>
          </div>
        </div>

        <div style="border:1px solid #d5dfdb;border-radius:3px;overflow:hidden;">
          <table class="e-table" style="font-size:10px;">
            <colgroup>
              <col style="width:58px;"/>
              <col style="width:205px;"/>
              <col style="width:94px;"/>
              <col style="width:74px;"/>
              <col style="width:66px;"/>
            </colgroup>
            <thead>
              <tr><th>Pin</th><th>Objek Bukti Lapangan</th><th>Waktu &amp; GPS</th><th>Hash SHA</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${evidenceRows
                .map(
                  (e) => `<tr>
                    <td class="mono" style="padding:5.5px 6px;font-weight:700;color:#094a41;">${esc(e.id)}</td>
                    <td style="padding:5.5px 6px;font-weight:600;">${esc(e.title)}</td>
                    <td class="mono" style="padding:5.5px 6px;font-size:9.3px;color:#475569;">${esc(e.ts)}</td>
                    <td class="mono" style="padding:5.5px 6px;font-size:9.3px;color:#526560;">${esc(e.sha)}</td>
                    <td style="padding:5.5px 6px;">${badge(e.status, 'ok')}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="ae-split-box" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div style="font-size:10px;font-weight:700;color:#082f2a;">Verifikasi Opname Fisik Konsultan Pengawas</div>
            <div style="font-size:9.6px;color:#526560;">PT Bina Teknik Konsultan · Laporan Opname #OPN-084-11</div>
          </div>
          <div style="width:160px;">
            <div style="display:flex;justify-content:space-between;font-size:9.5px;margin-bottom:2px;">
              <span>Bobot Struktur Atap</span>
              <strong class="mono" style="color:#047857;">98,4%</strong>
            </div>
            ${renderCapacityBar(98.4, { warnAt: 101, critAt: 101, showLabel: false })}
          </div>
        </div>
      </div>
    </div>

    <!-- Col 2: BAST Document, Peruri e-Meterai & Multi-Sig Quorum -->
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('fileText', 13, '#0e6b5e')}
          <span>Dokumen BAST #BAST-2026-084-T3 &amp; Peruri e-Meterai</span>
        </div>
        ${badge('PDF/A-2B TERSEGEL', 'info')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div style="border:1px solid #cddad5;border-radius:3px;padding:9px 10px;background:#fcfdfd;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #dbe5e1;padding-bottom:6px;margin-bottom:6px;">
            <div>
              <div style="font-size:9.2px;font-weight:700;color:#0e6b5e;letter-spacing:0.04em;">BERITA ACARA SERAH TERIMA PROGRES (BAST)</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a;margin-top:1px;">No. BAST-2026-084-T3 · Termin 3 Struktur Atap</div>
            </div>
            <span class="mono" style="font-size:9.5px;color:#475569;text-align:right;">22 Nov 2026<br/>Cikarang Barat</span>
          </div>
          <div style="font-size:10.3px;color:#334155;line-height:1.45;">
            Para pihak menyatakan pekerjaan <strong>Struktur Rangka Atap Baja WF-400 &amp; Penutup Zincalume</strong> pada Gudang Logistik Halal Cikarang Fase II telah selesai dengan bobot terukur <strong>98,4%</strong> sesuai spesifikasi RKS. Berdasarkan <strong>Akta Wakalah No. 42/PPAT-CKR/VIII/2026</strong>, kustodian berwenang mencairkan dana termin sebesar <strong>Rp 1.250.000.000</strong> setelah pemisahan PPh Final 2,65% (<strong>Rp 33.125.000</strong>) dan Ujrah Wakalah 0,25% (<strong>Rp 3.125.000</strong>).
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Nilai Bruto BAST-T3</div>
            <div class="mono" style="font-size:11.8px;font-weight:700;color:#0f172a;">Rp 1,25 M</div>
            <div style="font-size:8.8px;color:#526560;">Neto Rp 1.213.750.000</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">PPh Final &amp; Ujrah</div>
            <div class="mono" style="font-size:11.8px;font-weight:700;color:#0369a1;">Rp 36,25 jt</div>
            <div style="font-size:8.8px;color:#526560;">PPh 33,125 + Ujrah 3,125</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Retensi Terkunci</div>
            <div class="mono" style="font-size:11.8px;font-weight:700;color:#094a41;">Rp 350 jt</div>
            <div style="font-size:8.8px;color:#526560;">5% · Hold 90h pasca PHO</div>
          </div>
        </div>

        <div class="ae-seal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div style="display:flex;align-items:center;gap:9px;">
              <svg width="46" height="46" viewBox="0 0 46 46" style="flex-shrink:0;">
                <rect x="1" y="1" width="44" height="44" rx="3" fill="#ffffff" stroke="#0e6b5e" stroke-width="1.4"/>
                <rect x="4" y="4" width="38" height="38" rx="2" fill="#e6f4f1" stroke="#0e6b5e" stroke-width="0.7" stroke-dasharray="2,1.5"/>
                <text x="23" y="17" text-anchor="middle" font-size="7" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#094a41">PERURI</text>
                <text x="23" y="26.5" text-anchor="middle" font-size="8.2" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#0e6b5e">10000</text>
                <text x="23" y="35.5" text-anchor="middle" font-size="6.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">e-METERAI</text>
              </svg>
              <div>
                <div style="font-size:11px;font-weight:700;color:#082f2a;">Validasi Segel Peruri e-Meterai · SAH</div>
                <div class="mono" style="font-size:9.8px;color:#094a41;margin-top:1px;">Serial: SN-9921-8840-7712-ID · Nominal Rp 10.000</div>
                <div style="font-size:9.6px;color:#475569;margin-top:1px;">TSA BSrE: 2026-11-22T14:31:55+07:00 · OCSP Revocation: GOOD</div>
              </div>
            </div>
            ${badge('TERVERIFIKASI', 'ok')}
          </div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:4px;">MATRIKS TANDA TANGAN ELEKTRONIK TERSERTIFIKASI (BSrE / PSrE)</div>
          <div style="border:1px solid #d5dfdb;border-radius:3px;overflow:hidden;">
            <table class="e-table" style="font-size:10px;">
              <colgroup>
                <col style="width:146px;"/>
                <col style="width:118px;"/>
                <col style="width:94px;"/>
                <col style="width:92px;"/>
              </colgroup>
              <thead>
                <tr><th>Penanda Tangan</th><th>Peran Akad</th><th>Sertifikat</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:5.5px 6px;"><strong>Ir. Hendra Wijaya</strong></td>
                  <td style="padding:5.5px 6px;">Pemilik Proyek</td>
                  <td class="mono" style="padding:5.5px 6px;font-size:9.3px;">BSrE #8812A</td>
                  <td style="padding:5.5px 6px;">${badge('SAH 11:04', 'ok')}</td>
                </tr>
                <tr>
                  <td style="padding:5.5px 6px;"><strong>Dr. Eng. Ratna Kusuma</strong></td>
                  <td style="padding:5.5px 6px;">Konsultan Pengawas</td>
                  <td class="mono" style="padding:5.5px 6px;font-size:9.3px;">BSrE #4409C</td>
                  <td style="padding:5.5px 6px;">${badge('SAH 14:46', 'ok')}</td>
                </tr>
                <tr>
                  <td style="padding:5.5px 6px;"><strong>Budi Santoso, S.T.</strong></td>
                  <td style="padding:5.5px 6px;">Kontraktor Pelaksana</td>
                  <td class="mono" style="padding:5.5px 6px;font-size:9.3px;">PSrE #2190F</td>
                  <td style="padding:5.5px 6px;">${badge('KLAIM 09:50', 'info')}</td>
                </tr>
                <tr>
                  <td style="padding:5.5px 6px;"><strong>Hj. Siti Rahmawati, S.H.</strong></td>
                  <td style="padding:5.5px 6px;">Notaris / PPAT Saksi</td>
                  <td class="mono" style="padding:5.5px 6px;font-size:9.3px;">AHU #7718N</td>
                  <td style="padding:5.5px 6px;">${badge('ATESTASI OK', 'ok')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ae-split-box" style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:10px;color:#334155;">
            <strong>Akta Induk Notaris:</strong> No. 42/PPAT-CKR/VIII/2026<br/>
            <span class="mono" style="font-size:9.3px;color:#526560;">SHA-256 Dokumen: 0x8a9c4f2b19d07e83a44c9102f8b71c004a2e41</span>
          </div>
          <span class="e-btn" style="height:22px;font-size:9.8px;">${ic('download', 10.5, '#334155')} PDF/A BAST</span>
        </div>
      </div>
    </div>

    <!-- Col 3: Automated State Machine Guard Rule Engine -->
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('shield', 13, '#0e6b5e')}
          <span>Guard Engine Otomatis (8/8 Syarat)</span>
        </div>
        ${badge('SIAP EKSEKUSI', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div style="border:1px solid #d5dfdb;border-radius:3px;overflow:hidden;">
          ${guardRules
            .map(
              (r) => `<div class="ae-rule-row" style="padding:6.2px 7px;">
                <div style="min-width:0;">
                  <div style="display:flex;align-items:center;gap:5px;">
                    <span class="mono" style="font-size:9.2px;font-weight:700;color:#0e6b5e;">${esc(r.code)}</span>
                    <span style="font-weight:600;color:#0f172a;" class="trunc">${esc(r.name)}</span>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
                  <span class="mono" style="font-size:9.5px;color:#475569;">${esc(r.val)}</span>
                  ${badge('LULUS', 'ok')}
                </div>
              </div>`
            )
            .join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Evaluasi Guard .NET 9</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">18,4 ms · 8/8 Pass</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Isolasi Transaksi DB</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#094a41;">PG SERIALIZABLE</div>
          </div>
        </div>

        <div style="background:#082f2a;color:#d7f5ee;border-radius:3px;padding:9px 10px;font-family:var(--e-mono);font-size:9.4px;line-height:1.48;">
          <div style="color:#7ef0db;font-weight:700;margin-bottom:4px;">// CANONICAL STATE TRANSITION PAYLOAD</div>
          <div>{</div>
          <div style="padding-left:10px;">"contract": "KTR-2026-WKL-0084",</div>
          <div style="padding-left:10px;">"milestone": "TRM-03",</div>
          <div style="padding-left:10px;">"bastHash": "0x8a9c4f2b...01e41",</div>
          <div style="padding-left:10px;">"quorum": "2/2_SIGNED + PERURI_OK",</div>
          <div style="padding-left:10px;">"splitNeto": 1213750000,</div>
          <div style="padding-left:10px;">"splitPphFinal": 33125000,</div>
          <div style="padding-left:10px;">"splitUjrah": 3125000,</div>
          <div style="padding-left:10px;">"ribaCheck": "ZERO_INTEREST_VERIFIED"</div>
          <div>}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <span class="e-btn e-btn-primary" style="height:28px;justify-content:center;font-size:10.8px;">${ic('checkCircle', 12, '#ffffff')} Konfirmasi &amp; Eksekusi Pencairan TRM-03</span>
          <span class="e-btn" style="height:24px;justify-content:center;font-size:10px;">${ic('refresh', 11, '#334155')} Jalankan Ulang Verifikasi EXIF &amp; OCSP</span>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p3',
    pageTitle: meta.pages[2].title,
    actionsHtml: `<span class="e-btn">${ic('fileText', 11, '#334155')} Riwayat BAST (3)</span>
      <span class="e-btn e-btn-primary">${ic('zap', 11, '#ffffff')} Cairkan Termin 3</span>`,
    bodyHtml: `${statePanel}${mainCols}`,
  });
}

// ============================================================================
// PAGE 4: RAIL SNAP BI / BI-FAST & SUB-AKUN PPH FINAL KONSTRUKSI
// ============================================================================

function renderPage4() {
  const sumBruto = SNAP_TXNS.reduce((a, t) => a + t.bruto, 0);
  const sumPph = SNAP_TXNS.reduce((a, t) => a + t.pph, 0);
  const sumUjrah = SNAP_TXNS.reduce((a, t) => a + t.ujrah, 0);
  const sumNeto = SNAP_TXNS.reduce((a, t) => a + t.neto, 0);

  const latencyChart = svgMultiLineChart({
    width: 810,
    height: 196,
    xLabels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    yMin: 0,
    yMax: 350,
    yTicks: 5,
    yUnit: 'ms',
    threshold: { value: 250, label: 'SLA SNAP BI 250 ms', color: '#be123c' },
    series: [
      { label: 'BSI SNAP BI-FAST p95 (ms)', color: '#0e6b5e', area: true, dots: true, values: [132, 138, 152, 164, 158, 149, 141, 146, 154, 142] },
      { label: 'Bank Muamalat SNAP p95 (ms)', color: '#4a2c7c', dots: true, values: [176, 182, 198, 214, 206, 192, 184, 195, 201, 189] },
      { label: 'Peruri e-Meterai API p50 (ms)', color: '#0369a1', dashed: true, values: [118, 122, 134, 148, 139, 128, 121, 132, 144, 136] },
    ],
    annotations: [
      { index: 3, seriesIdx: 1, label: 'Batch Kliring 09:00 WIB', color: '#4a2c7c', dy: -26 },
    ],
  });

  const taxBarChart = svgStackedBarChart({
    width: 660,
    height: 174,
    categories: ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
    yMax: 400,
    yFormat: (v) => `${Math.round(v)}jt`,
    series: [
      { label: 'PPh Final 2,65% (SBU Menengah/Besar)', color: '#0e6b5e', values: [148, 162, 184, 210, 196, 224] },
      { label: 'PPh Final 2,50% (Pengalihan Tanah)', color: '#0369a1', values: [42, 38, 46, 52, 60, 105] },
      { label: 'PPh Final 1,75% (SBU Kecil) & PPh 22', color: '#b45309', values: [22, 26, 30, 34, 28, 37] },
    ],
  });

  const topGrid = `<section style="display:grid;grid-template-columns: 1.24fr 1fr;gap:9px;height:396px;flex-shrink:0;">
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('activity', 13, '#0e6b5e')}
          <span>Telemetri Rail SNAP BI v1.2 &amp; BI-FAST ISO 20022 (WIB Hari Ini)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('RSA-SHA256 B2B OK', 'ok')}
          <span class="e-panel-sub mono">0 Timeout / 24j</span>
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:6px 10px 8px;">
        ${latencyChart}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;">
          <div class="ae-split-box">
            <div style="font-size:9.5px;color:#64748b;">BSI SNAP VA &amp; BI-FAST</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">142 ms</div>
            <div class="mono" style="font-size:9.2px;color:#475569;">5 VA · Sukses 99,98%</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.5px;color:#64748b;">Bank Muamalat SNAP</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">189 ms</div>
            <div class="mono" style="font-size:9.2px;color:#475569;">3 VA · Sukses 99,95%</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.5px;color:#64748b;">ISO 20022 pacs.008</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#0f172a;">42 / 42</div>
            <div class="mono" style="font-size:9.2px;color:#475569;">ACSC Settlement 100%</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.5px;color:#64748b;">Token B2B &amp; mTLS</div>
            <div class="mono" style="font-size:12.5px;font-weight:700;color:#0369a1;">Aktif</div>
            <div class="mono" style="font-size:9.2px;color:#475569;">Rotasi 12 mnt lagi</div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('layers', 13, '#0e6b5e')}
          <span>Sub-Akun Pajak PPh Final Konstruksi (PP 9/2022) &amp; CoreTax</span>
        </div>
        ${badge('AUTO-SEGREGATED', 'info')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;padding:6px 10px 8px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <div class="ae-split-box" style="background:#f0f9ff;border-color:#bae6fd;">
            <div style="font-size:9.3px;color:#0369a1;font-weight:600;">Total PPh Final YTD</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#0c4a6e;">${fmtMiliar(PORT_TAX)}</div>
            <div class="mono" style="font-size:9px;color:#0369a1;">${fmtIdr(PORT_TAX)}</div>
          </div>
          <div class="ae-split-box" style="background:#ecfdf5;border-color:#a7f3d0;">
            <div style="font-size:9.3px;color:#047857;font-weight:600;">Sudah Setor (NTPN)</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#065f46;">Rp 1,18 M</div>
            <div class="mono" style="font-size:9px;color:#047857;">Rp 1.184.740.000</div>
          </div>
          <div class="ae-split-box" style="background:#fffbeb;border-color:#fde68a;">
            <div style="font-size:9.3px;color:#b45309;font-weight:600;">Siap Setor Masa Nov</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#92400e;">Rp 116,0 jt</div>
            <div class="mono" style="font-size:9px;color:#b45309;">Jatuh Tempo 10 Des</div>
          </div>
        </div>

        ${taxBarChart}

        <div style="display:flex;align-items:center;justify-content:space-between;background:#f4f8f7;border:1px solid #cddad5;border-radius:2px;padding:5px 8px;font-size:9.8px;">
          <span><strong>CoreTax XML Unifikasi:</strong> 28 Bukti Potong siap unggah (Pasal 4 ayat 2 · KJS 411128-409)</span>
          <span class="e-btn" style="height:20px;font-size:9.3px;">${ic('download', 10, '#334155')} Ekspor CoreTax XML</span>
        </div>
      </div>
    </div>
  </section>`;

  const txnTable = `<section class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('zap', 13, '#0e6b5e')}
        <span>Log Kliring SNAP BI, Pemisahan PPh Final Otomatis &amp; Referensi NTPN (10 Transaksi Terkini)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-panel-sub mono">Rumus Verifikasi: Bruto = PPh Final + Ujrah Wakalah + Neto Kontraktor</span>
        ${badge('SPLIT 100% AKURAT', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush" style="justify-content:space-between;">
      <table class="e-table" style="font-size:10.5px;">
        <colgroup>
          <col style="width:128px;"/>
          <col style="width:74px;"/>
          <col style="width:146px;"/>
          <col style="width:110px;"/>
          <col style="width:130px;"/>
          <col style="width:118px;"/>
          <col style="width:104px;"/>
          <col style="width:132px;"/>
          <col style="width:146px;"/>
          <col style="width:68px;"/>
          <col style="width:126px;"/>
        </colgroup>
        <thead>
          <tr>
            <th>SNAP Trace ID</th>
            <th>Waktu</th>
            <th>Kontrak · Termin</th>
            <th>Rail Bank</th>
            <th class="num">Bruto Termin</th>
            <th class="num">PPh Final</th>
            <th class="num">Ujrah 0,25%</th>
            <th class="num">Neto Kontraktor</th>
            <th>NTPN / e-Billing</th>
            <th class="num">Latensi</th>
            <th>Status ISO 20022</th>
          </tr>
        </thead>
        <tbody>
          ${SNAP_TXNS.map(
            (t) => `<tr class="${t.selected ? 'is-selected' : ''}">
              <td class="mono" style="padding:7.8px 7px;font-weight:700;color:#094a41;">${esc(t.trace)}</td>
              <td class="mono" style="padding:7.8px 7px;color:#475569;">${esc(t.ts)}</td>
              <td class="mono" style="padding:7.8px 7px;font-weight:600;color:#0f172a;">${esc(t.contract)}</td>
              <td style="padding:7.8px 7px;">${esc(t.rail)}</td>
              <td class="mono num" style="padding:7.8px 7px;font-weight:600;">${fmtIdr(t.bruto)}</td>
              <td class="mono num" style="padding:7.8px 7px;color:#0369a1;font-weight:600;">${fmtIdr(t.pph)}</td>
              <td class="mono num" style="padding:7.8px 7px;color:#526560;">${fmtIdr(t.ujrah)}</td>
              <td class="mono num" style="padding:7.8px 7px;color:#047857;font-weight:700;">${fmtIdr(t.neto)}</td>
              <td class="mono" style="padding:7.8px 7px;font-size:9.8px;color:#334155;">${esc(t.ntpn)}</td>
              <td class="mono num" style="padding:7.8px 7px;color:#047857;">${t.ms} ms</td>
              <td style="padding:7.8px 7px;">${badge(t.iso, t.tone)}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="padding:8px 7px;">TOTAL 10 TRANSAKSI KLIRING SNAP BI (8 SETTLED + 2 READY QUEUE)</td>
            <td class="mono num" style="padding:8px 7px;">${fmtIdr(sumBruto)}</td>
            <td class="mono num" style="padding:8px 7px;color:#0369a1;">${fmtIdr(sumPph)}</td>
            <td class="mono num" style="padding:8px 7px;">${fmtIdr(sumUjrah)}</td>
            <td class="mono num" style="padding:8px 7px;color:#047857;">${fmtIdr(sumNeto)}</td>
            <td class="mono" colspan="2" style="padding:8px 7px;color:#094a41;">Avg p95: 166 ms</td>
            <td style="padding:8px 7px;">${badge('ZERO VARIANCE', 'ok')}</td>
          </tr>
        </tfoot>
      </table>
      <div style="padding:7px 12px;background:#f7faf9;border-top:1px solid #d5dfdb;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#334155;">
        <span><strong>Mekanisme Sub-Akun Pajak:</strong> Dana PPh Final dikunci langsung ke <span class="mono">VA-TAX-BSI</span> / <span class="mono">VA-TAX-BMI</span> pada saat eksekusi termin sehingga kontraktor tidak pernah menunggak pajak konstruksi.</span>
        <span class="mono" style="color:#047857;font-weight:700;">Kepatuhan Penyetoran DJP MPN-G3: 100% Tepat Waktu</span>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p4',
    pageTitle: meta.pages[3].title,
    actionsHtml: `<span class="e-btn">${ic('refresh', 11, '#334155')} Cek Status BI-FAST</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Buat ID Billing MPN-G3</span>`,
    bodyHtml: `${topGrid}${txnTable}`,
  });
}

// ============================================================================
// PAGE 5: RUANG SENGKETA INDEPENDEN, KEPATUHAN DSN-MUI & JEJAK AUDIT WORM
// ============================================================================

function renderPage5() {
  const complianceRows = [
    { std: 'DSN-MUI No. 10 & 113', scope: 'Akad Wakalah bil Ujrah (biaya tetap, bebas riba)', evidence: 'Sweep bunga Rp 0 harian', status: 'PATUH 100%', tone: 'ok' },
    { std: 'DSN-MUI No. 02/2000', scope: 'Wadiah Yad Dhamanah (segregasi penuh dana VA)', evidence: '8 VA BSI & BMI terpisah', status: 'PATUH 100%', tone: 'ok' },
    { std: 'SNAP BI v1.2 (PBI 23)', scope: 'RSA-SHA256 B2B Token & ISO 20022 BI-FAST', evidence: 'BI-ASPI #2026-091 OK', status: 'TERVERIFIKASI', tone: 'ok' },
    { std: 'Peruri e-Meterai & BSrE', scope: 'Meterai elektronik & TTE tersertifikasi BAST', evidence: 'OCSP Real-time · PDF/A', status: 'TERVERIFIKASI', tone: 'info' },
    { std: 'PP No. 9/2022 PPh Final', scope: 'Segregasi otomatis PPh Final jasa konstruksi', evidence: 'CoreTax XML · MPN-G3', status: 'PATUH 100%', tone: 'ok' },
    { std: 'UU PDP 27/2022 & WORM', scope: 'Enkripsi PII (NPWP/NIK) + retensi WORM 10 th', evidence: 'Hash Chain #48192 OK', status: 'AUDIT LULUS', tone: 'ok' },
  ];

  const topSplit = `<section style="display:grid;grid-template-columns: 1.24fr 1fr;gap:9px;height:476px;flex-shrink:0;">
    <!-- Left: Independent Dispute Freeze Vault -->
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head" style="background:#fff1f2;border-bottom-color:#fecdd3;">
        <div class="e-panel-title" style="color:#9f1239;">
          ${ic('lock', 13, '#be123c')}
          <span>Ruang Pembekuan Sengketa &amp; Mediasi Independen — Kasus #DSP-2026-019</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('KTR-2026-WKL-0084: 0 SENGKETA', 'ok')}
          ${badge('HOLD_DISPUTE AKTIF', 'bad')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div class="ae-freeze-banner">
          <div>
            <div style="font-size:11.5px;font-weight:700;color:#881337;">KTR-2026-WDH-0079 · Pengadaan CPO Curah Halal 1.500 MT (Dumai–Marunda)</div>
            <div style="font-size:10px;color:#9f1239;margin-top:1px;">Rekening Dibekukan: <span class="mono" style="font-weight:700;">BMI 7704-0079-0012 (VA-FREEZE)</span> · Debet keluar dikunci pada level ACID DB &amp; SNAP API</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:9.3px;color:#9f1239;">Dana Terkunci Sengketa</div>
            <div class="mono" style="font-size:14.5px;font-weight:800;color:#be123c;">Rp 1.800.000.000</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="border:1px solid #d5dfdb;border-radius:3px;padding:8px 9px;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #e6eeeb;">
              <strong style="font-size:10.5px;color:#0f172a;">Bukti Pihak Pembeli (Pemohon)</strong>
              ${badge('3 BERKAS SAH', 'info')}
            </div>
            <div style="font-size:10px;color:#334155;margin-bottom:5px;"><strong>PT Sawit Berkah Niaga</strong> · Diajukan 18 Nov 13:22 WIB</div>
            <div style="font-size:9.8px;color:#475569;line-height:1.4;">
              • Sertifikat Uji Lab Sucofindo #SCF-26-9914: kadar <strong>FFA 5,8%</strong> melampaui klausul mutu maksimal <strong>5,0%</strong>.<br/>
              • Berita acara bongkar muat Pelabuhan Marunda (kekurangan mutu Lot-04).<br/>
              • Klaim pemotongan harga: <strong class="mono" style="color:#be123c;">Rp 270.000.000</strong>.
            </div>
          </div>

          <div style="border:1px solid #d5dfdb;border-radius:3px;padding:8px 9px;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #e6eeeb;">
              <strong style="font-size:10.5px;color:#0f172a;">Bukti Pihak Pemasok (Termohon)</strong>
              ${badge('3 BERKAS SAH', 'info')}
            </div>
            <div style="font-size:10px;color:#334155;margin-bottom:5px;"><strong>PT Riau Agro Sentosa</strong> · Diajukan 19 Nov 10:15 WIB</div>
            <div style="font-size:9.8px;color:#475569;line-height:1.4;">
              • Certificate of Quality muat Pelabuhan Dumai: <strong>FFA 4,85%</strong> saat segel tangki dipasang.<br/>
              • Log suhu tangki kapal MT Berkah 04 (terjadi keterlambatan sandar 36 jam).<br/>
              • Usulan kompromi potong mutu: <strong class="mono" style="color:#094a41;">Rp 200.000.000</strong>.
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
          <div class="ae-split-box" style="background:#fff1f2;border-color:#fecdd3;">
            <div class="mono" style="font-size:9px;color:#9f1239;font-weight:700;">1 · 18 NOV 13:22</div>
            <div style="font-size:9.8px;font-weight:700;color:#0f172a;">VA BMI Dibekukan</div>
            <div style="font-size:8.8px;color:#64748b;">Debet keluar terkunci ACID</div>
          </div>
          <div class="ae-split-box">
            <div class="mono" style="font-size:9px;color:#0e6b5e;font-weight:700;">2 · 19 NOV 10:15</div>
            <div style="font-size:9.8px;font-weight:700;color:#0f172a;">Ruang Bukti 6 Berkas</div>
            <div style="font-size:8.8px;color:#64748b;">Lab Sucofindo &amp; Log Kapal</div>
          </div>
          <div class="ae-split-box">
            <div class="mono" style="font-size:9px;color:#0e6b5e;font-weight:700;">3 · 21 NOV 17:12</div>
            <div style="font-size:9.8px;font-weight:700;color:#0f172a;">Usulan Ishlah Panel</div>
            <div style="font-size:8.8px;color:#64748b;">Potong mutu Rp 240 jt</div>
          </div>
          <div class="ae-split-box" style="background:#fffbeb;border-color:#fde68a;">
            <div class="mono" style="font-size:9px;color:#b45309;font-weight:700;">4 · TAHAP AKTIF</div>
            <div style="font-size:9.8px;font-weight:700;color:#92400e;">Tandatangan 2 Pihak</div>
            <div style="font-size:8.8px;color:#78350f;">Otorisasi Split BI-FAST</div>
          </div>
        </div>

        <div class="ae-seal-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <div style="font-size:10.8px;font-weight:700;color:#082f2a;">
              ${ic('users', 12, '#0e6b5e')} Rekomendasi Mediator Independen BASYARNAS (Panel #M-04 · Dr. H. Fadhil Anwar, S.H., M.H.)
            </div>
            ${badge('MENUNGGU TANDA TANGAN 2 PIHAK', 'warn')}
          </div>
          <div style="font-size:10px;color:#334155;margin-bottom:6px;">
            Berdasarkan formula penalti FFA Pasal 8.3 Akad dan hasil uji independen Sucofindo, diusulkan penyelesaian damai (<em>Ishlah</em>) atas dana terkunci <strong>Rp 1.800.000.000</strong>:
          </div>
          <div style="display:flex;height:14px;border-radius:2px;overflow:hidden;border:1px solid #9cc8bc;margin-bottom:6px;">
            <div style="width:13.3%;background:#b45309;"></div>
            <div style="width:86.7%;background:#0e6b5e;"></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:10px;">
            <span style="color:#92400e;font-weight:700;">Refund Pembeli (13,3%): Rp 240.000.000</span>
            <span style="color:#047857;font-weight:700;">Cair ke Pemasok (86,7%): Rp 1.560.000.000</span>
            <span style="color:#475569;">Total: Rp 1.800.000.000</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:4px;border-top:1px solid #e1eae7;">
          <span style="font-size:9.8px;color:#526560;">SLA Mediasi: <strong>Hari ke-4 dari 14 Hari Kerja</strong> · Hash Berkas Ruang Bukti: <span class="mono">0x1b84...77f31</span></span>
          <div style="display:flex;gap:6px;">
            <span class="e-btn" style="height:24px;font-size:10px;">${ic('fileText', 11, '#334155')} Draf Akta Ishlah</span>
            <span class="e-btn e-btn-primary" style="height:24px;font-size:10px;">${ic('check', 11, '#ffffff')} Kirim Otorisasi Split Resolusi</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Sharia Compliance Matrix & DPS Seal -->
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('shield', 13, '#0e6b5e')}
          <span>Matriks Kepatuhan Syariah (DSN-MUI) &amp; Regulasi</span>
        </div>
        ${badge('6/6 PATUH', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div style="border:1px solid #d5dfdb;border-radius:3px;overflow:hidden;">
          <table class="e-table" style="font-size:10px;">
            <colgroup>
              <col style="width:144px;"/>
              <col style="width:262px;"/>
              <col style="width:146px;"/>
              <col style="width:94px;"/>
            </colgroup>
            <thead>
              <tr><th>Standar / Fatwa</th><th>Ruang Lingkup Kontrol</th><th>Bukti Verifikasi</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${complianceRows
                .map(
                  (c) => `<tr>
                    <td style="padding:6px 7px;font-weight:700;color:#082f2a;">${esc(c.std)}</td>
                    <td style="padding:6px 7px;color:#334155;">${esc(c.scope)}</td>
                    <td class="mono" style="padding:6px 7px;font-size:9.3px;color:#475569;">${esc(c.evidence)}</td>
                    <td style="padding:6px 7px;">${badge(c.status, c.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div style="background:#082f2a;color:#e6f4f1;border-radius:3px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div>
            <div style="font-size:9.2px;font-weight:700;color:#7ef0db;letter-spacing:0.05em;">OPINI DEWAN PENGAWAS SYARIAH (DPS) · TRIWULAN IV-2026</div>
            <div style="font-size:11.5px;font-weight:700;color:#ffffff;margin-top:2px;">LULUS TANPA CATATAN — ZERO RIBA &amp; ZERO CO-MINGLING</div>
            <div style="font-size:9.8px;color:#b2d4cd;margin-top:2px;">Ketua DPS: <strong>KH. Dr. Ahmad Fauzan, M.A.</strong> · Opini No. DPS-AE/XI/2026-014<br/>Seluruh 8 VA BSI &amp; Bank Muamalat terkonfirmasi non-interest bearing (imbal hasil riba = Rp 0).</div>
          </div>
          <div style="text-align:center;border:1px solid #2ca08f;border-radius:3px;padding:6px 10px;background:#0d3f38;flex-shrink:0;">
            <div class="mono" style="font-size:15px;font-weight:800;color:#7ef0db;">Rp 0</div>
            <div style="font-size:8.6px;color:#cce6e1;">BUNGA / RIBA</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Retensi Audit WORM</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">10 Tahun</div>
            <div style="font-size:9px;color:#526560;">S3 Object Lock Compliance</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Integritas Hash Chain</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#047857;">48.192 Blk</div>
            <div style="font-size:9px;color:#526560;">0 Broken Links</div>
          </div>
          <div class="ae-split-box">
            <div style="font-size:9.2px;color:#64748b;">Uji Penetrasi &amp; ISO</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#0369a1;">ISO 27001</div>
            <div style="font-size:9px;color:#526560;">Audit Okt 2026 Lulus</div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const wormTable = `<section class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('key', 13, '#0e6b5e')}
        <span>Jejak Audit Kriptografis WORM (Write-Once Read-Many · SHA-256 Chained Ledger)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="e-panel-sub mono">Merkle Root: 0x8a9c4f2b19d07e83...01e41</span>
        ${badge('IMMUTABLE VERIFIED', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table" style="font-size:10.3px;">
        <colgroup>
          <col style="width:74px;"/>
          <col style="width:124px;"/>
          <col style="width:200px;"/>
          <col style="width:168px;"/>
          <col style="width:152px;"/>
          <col style="width:522px;"/>
          <col style="width:136px;"/>
          <col style="width:94px;"/>
        </colgroup>
        <thead>
          <tr>
            <th>Blok</th>
            <th>Timestamp (WIB)</th>
            <th>Aktor / Entitas</th>
            <th>Kode Aksi</th>
            <th>Target Objek</th>
            <th>Ringkasan Perubahan &amp; Bukti Kepatuhan</th>
            <th>Hash SHA-256</th>
            <th>Segel</th>
          </tr>
        </thead>
        <tbody>
          ${WORM_LOGS.map(
            (w, idx) => `<tr class="${idx === 0 ? 'is-selected' : ''}">
              <td class="mono" style="padding:6.4px 7px;font-weight:700;color:#094a41;">${esc(w.blk)}</td>
              <td class="mono" style="padding:6.4px 7px;font-size:9.6px;color:#475569;">${esc(w.ts)}</td>
              <td style="padding:6.4px 7px;font-weight:600;">${esc(w.actor)}</td>
              <td class="mono" style="padding:6.4px 7px;font-size:9.6px;font-weight:700;color:#0f172a;">${esc(w.action)}</td>
              <td class="mono" style="padding:6.4px 7px;font-size:9.6px;color:#334155;">${esc(w.target)}</td>
              <td style="padding:6.4px 7px;">${esc(w.detail)}</td>
              <td class="mono" style="padding:6.4px 7px;font-size:9.5px;color:#0e6b5e;">${esc(w.hash)}</td>
              <td style="padding:6.4px 7px;">${badge('WORM OK', w.tone)}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="padding:7px 7px;">RANTAI AUDIT WORM TERVERIFIKASI: 48.192 BLOK KONTINU · 0 ANOMALI TAMPER · RETENSI S3 OBJECT LOCK COMPLIANCE S.D. NOV 2036</td>
            <td class="mono" style="padding:7px 7px;color:#094a41;">SHA-256 100%</td>
            <td style="padding:7px 7px;">${badge('VERIFIED', 'ok')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p5',
    pageTitle: meta.pages[4].title,
    actionsHtml: `<span class="e-btn">${ic('download', 11, '#334155')} Paket Audit DPS &amp; OJK</span>
      <span class="e-btn e-btn-danger">${ic('lock', 11, '#be123c')} Bekukan VA Darurat</span>`,
    bodyHtml: `${topSplit}${wormTable}`,
  });
}

// ============================================================================
// EXPORT RENDER PAGES
// ============================================================================

export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
  ];
}
