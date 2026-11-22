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
  id: 'ID-007',
  name: 'PajakCopilot',
  reference: 'LangSmith Enterprise + Bloomberg Tax Advisory Workbench',
  persona: 'R. Wibisono, BKP · Head of Tax Compliance · PT Nusantara Energi Holding',
  pages: [
    { slug: 'p1', title: 'Klasifikasi Faktur & Objek Potong CoreTax' },
    { slug: 'p2', title: 'Orkestrasi Agent RAG & Evaluasi Sitasi PMK' },
    { slug: 'p3', title: 'Simulator PPh 26 Lintas Negara & Tax Treaty DGT' },
    { slug: 'p4', title: 'Korpus Regulasi & Graf Pasal UU HPP / PMK' },
    { slug: 'p5', title: 'Kertas Kerja Auditor & Ekspor CoreTax XML' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const INVOICES = [
  {
    code: 'TX-01',
    invNo: 'INV/SAN/26/1104',
    vendor: 'PT Solusi Awan Nusantara',
    npwp: '0013.4829.1041.2000',
    npwpValid: true,
    desc: 'Jasa Konsultasi IT & Arsitektur ERP',
    taxType: 'PPh 23',
    objCode: '24-104-01',
    pmkRef: 'PMK-141/2015 Ps. 1(6)',
    dpp: 450000000,
    pphRate: 2.0,
    pphAmt: 9000000,
    ppnRate: 11.0,
    ppnAmt: 49500000,
    conf: 99.4,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'NPWP Valid',
    selected: true,
  },
  {
    code: 'TX-02',
    invNo: 'CS-SG-2026-8841',
    vendor: 'CloudStack Asia Pte. Ltd. (SG)',
    npwp: 'NON-RESIDEN (SG)',
    npwpValid: false,
    desc: 'Sewa Server Cloud Singapura (ap-se-1)',
    taxType: 'PPh 26',
    objCode: '27-104-01',
    pmkRef: 'UU PPh Ps. 26 / P3B SG',
    dpp: 1343000000,
    pphRate: 20.0,
    pphAmt: 268600000,
    ppnRate: 11.0,
    ppnAmt: 147730000,
    conf: 94.2,
    status: 'Butuh DGT',
    tone: 'warn',
    meta: 'Treaty SG',
    warn: true,
  },
  {
    code: 'TX-03',
    invNo: 'LDS/2026/XI/0419',
    vendor: 'PT Logistik Dingin Sejahtera',
    npwp: '0021.9942.0081.1000',
    npwpValid: true,
    desc: 'Sewa Gudang Cold Storage Marunda',
    taxType: 'PPh 4(2)',
    objCode: '28-403-02',
    pmkRef: 'PP 34/2017 Ps. 4(1)',
    dpp: 620000000,
    pphRate: 10.0,
    pphAmt: 62000000,
    ppnRate: 11.0,
    ppnAmt: 68200000,
    conf: 99.7,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'Final',
  },
  {
    code: 'TX-04',
    invNo: 'SEP/FF/26/9182',
    vendor: 'PT Samudera Ekspedisi Prima',
    npwp: '0018.3120.4409.5000',
    npwpValid: true,
    desc: 'Faktur Masukan Jasa Ekspedisi (JPT)',
    taxType: 'PPh 23',
    objCode: '24-104-56',
    pmkRef: 'PMK 71/2022 DPP 1,1%',
    dpp: 280000000,
    pphRate: 2.0,
    pphAmt: 5600000,
    ppnRate: 1.1,
    ppnAmt: 3080000,
    conf: 99.1,
    status: 'Terverifikasi',
    tone: 'ok',
    meta: 'CoreTax',
  },
  {
    code: 'TX-05',
    invNo: 'KBK/TRM/26/0211',
    vendor: 'PT Karya Baja Konstruksi',
    npwp: '0011.6720.8812.0000',
    npwpValid: true,
    desc: 'Jasa Konstruksi Kualifikasi Besar',
    taxType: 'PPh 4(2)',
    objCode: '28-409-10',
    pmkRef: 'PP 9/2022 Ps. 3(1)(b)',
    dpp: 1850000000,
    pphRate: 2.65,
    pphAmt: 49025000,
    ppnRate: 11.0,
    ppnAmt: 203500000,
    conf: 98.9,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'SBU Besar',
  },
  {
    code: 'TX-06',
    invNo: 'KAP-DR/26/0892',
    vendor: 'KAP Darmawan & Rekan',
    npwp: '0015.2091.3310.0000',
    npwpValid: true,
    desc: 'Jasa Audit Laporan Keuangan Interim',
    taxType: 'PPh 23',
    objCode: '24-104-02',
    pmkRef: 'PMK-141/2015 Ps. 1(6)f',
    dpp: 320000000,
    pphRate: 2.0,
    pphAmt: 6400000,
    ppnRate: 11.0,
    ppnAmt: 35200000,
    conf: 99.6,
    status: 'Terverifikasi',
    tone: 'ok',
    meta: 'NPWP Valid',
  },
  {
    code: 'TX-07',
    invNo: 'NTC-JP-2026-4410',
    vendor: 'Nippon Telemetry Corp. (JP)',
    npwp: 'NON-RESIDEN (JP)',
    npwpValid: true,
    desc: 'Lisensi Software SCADA & Telemetry',
    taxType: 'PPh 26',
    objCode: '27-103-01',
    pmkRef: 'P3B RI-Jepang Ps. 12',
    dpp: 510000000,
    pphRate: 10.0,
    pphAmt: 51000000,
    ppnRate: 11.0,
    ppnAmt: 56100000,
    conf: 97.8,
    status: 'DGT Valid',
    tone: 'ok',
    meta: 'Treaty JP',
  },
  {
    code: 'TX-08',
    invNo: 'CMK/INV/26/3318',
    vendor: 'CV Cipta Media Kreatif',
    npwp: '0031.5408.7712.0000',
    npwpValid: true,
    desc: 'Jasa Produksi Video & Kampanye Digital',
    taxType: 'PPh 23',
    objCode: '24-104-47',
    pmkRef: 'PMK-141/2015 Ps. 1(6)as',
    dpp: 145000000,
    pphRate: 2.0,
    pphAmt: 2900000,
    ppnRate: 11.0,
    ppnAmt: 15950000,
    conf: 98.4,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'NPWP Valid',
  },
  {
    code: 'TX-09',
    invNo: 'HON/LGL/26/119',
    vendor: 'Dr. Hendra Kusuma, S.H.',
    npwp: '3174.0821.0978.0004',
    npwpValid: true,
    desc: 'Honorarium Tenaga Ahli Hukum Korporat',
    taxType: 'PPh 21',
    objCode: '21-100-07',
    pmkRef: 'PMK 168/2023 Ps. 16',
    dpp: 120000000,
    pphRate: 2.5,
    pphAmt: 3000000,
    ppnRate: 0.0,
    ppnAmt: 0,
    conf: 99.2,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'NIK=NPWP',
  },
  {
    code: 'TX-10',
    invNo: 'GNS/LSE/26/1102',
    vendor: 'PT Graha Niaga Sentosa',
    npwp: '0012.7710.9011.0000',
    npwpValid: true,
    desc: 'Sewa Kantor Menara Sudirman Lt. 18',
    taxType: 'PPh 4(2)',
    objCode: '28-403-02',
    pmkRef: 'PP 34/2017 Ps. 2(1)',
    dpp: 480000000,
    pphRate: 10.0,
    pphAmt: 48000000,
    ppnRate: 11.0,
    ppnAmt: 52800000,
    conf: 99.8,
    status: 'Terverifikasi',
    tone: 'ok',
    meta: 'Final',
  },
  {
    code: 'TX-11',
    invNo: 'ARM/FLEET/26/714',
    vendor: 'PT Armada Rental Mandiri',
    npwp: '0024.1198.3340.0000',
    npwpValid: true,
    desc: 'Sewa Kendaraan Operasional (12 Unit)',
    taxType: 'PPh 23',
    objCode: '24-100-02',
    pmkRef: 'UU PPh Ps. 23(1)(c)',
    dpp: 190000000,
    pphRate: 2.0,
    pphAmt: 3800000,
    ppnRate: 11.0,
    ppnAmt: 20900000,
    conf: 99.3,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'Sewa Harta',
  },
  {
    code: 'TX-12',
    invNo: 'EG-NL-2026-0912',
    vendor: 'EuroGrid Advisory B.V. (NL)',
    npwp: 'NON-RESIDEN (NL)',
    npwpValid: true,
    desc: 'Jasa Konsultasi Transisi Energi (Remote)',
    taxType: 'PPh 26',
    objCode: '27-104-01',
    pmkRef: 'P3B RI-Belanda Ps. 7',
    dpp: 420000000,
    pphRate: 0.0,
    pphAmt: 0,
    ppnRate: 11.0,
    ppnAmt: 46200000,
    conf: 96.9,
    status: 'DGT Valid',
    tone: 'ok',
    meta: 'Treaty NL',
  },
  {
    code: 'TX-13',
    invNo: 'MKI/SVC/26/5540',
    vendor: 'PT Mitra Kalibrasi Industri',
    npwp: '0019.8832.1204.0000',
    npwpValid: true,
    desc: 'Jasa Pemeliharaan & Kalibrasi Sensor',
    taxType: 'PPh 23',
    objCode: '24-104-12',
    pmkRef: 'PMK-141/2015 Ps. 1(6)o',
    dpp: 165000000,
    pphRate: 2.0,
    pphAmt: 3300000,
    ppnRate: 11.0,
    ppnAmt: 18150000,
    conf: 98.7,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'NPWP Valid',
  },
  {
    code: 'TX-14',
    invNo: 'MBT/26/XI/0089',
    vendor: 'UD Maju Bersama Teknik',
    npwp: 'TIDAK TERDAFTAR',
    npwpValid: false,
    desc: 'Jasa Instalasi Panel Listrik Gudang',
    taxType: 'PPh 23',
    objCode: '24-104-10',
    pmkRef: 'UU PPh Ps. 23(1a) +100%',
    dpp: 85000000,
    pphRate: 4.0,
    pphAmt: 3400000,
    ppnRate: 0.0,
    ppnAmt: 0,
    conf: 91.5,
    status: 'Cek NPWP',
    tone: 'bad',
    meta: 'Non-NPWP',
    bad: true,
  },
  {
    code: 'TX-15',
    invNo: 'BKK/CAT/26/4021',
    vendor: 'PT Bintang Katering Korporat',
    npwp: '0027.6104.5529.0000',
    npwpValid: true,
    desc: 'Jasa Boga & Katering Rapat Umum',
    taxType: 'PPh 23',
    objCode: '24-104-50',
    pmkRef: 'PMK-141/2015 Ps. 1(6)aw',
    dpp: 92000000,
    pphRate: 2.0,
    pphAmt: 1840000,
    ppnRate: 0.0,
    ppnAmt: 0,
    conf: 99.0,
    status: 'Terpetakan',
    tone: 'ok',
    meta: 'Non-PKP',
  },
  {
    code: 'TX-16',
    invNo: 'NFL/DOM/26/6621',
    vendor: 'PT Nusantara Freight Lines',
    npwp: '0016.4491.8832.0000',
    npwpValid: true,
    desc: 'Jasa Ekspedisi Kontainer Priok-SBY',
    taxType: 'PPh 23',
    objCode: '24-104-56',
    pmkRef: 'PMK 71/2022 DPP 1,1%',
    dpp: 210000000,
    pphRate: 2.0,
    pphAmt: 4200000,
    ppnRate: 1.1,
    ppnAmt: 2310000,
    conf: 99.4,
    status: 'Terverifikasi',
    tone: 'ok',
    meta: 'CoreTax',
  },
];

// P2 — AI Agent Workflow & Token Cost Attribution (MTD Nov 2026)
const AGENT_WORKFLOWS = [
  { name: 'Klasifikasi Faktur AP & e-Bupot', req: 2840, fastPathPct: 78.4, p95Ms: 412, faithPct: 99.1, tokM: 18.4, costIdr: 6840000, budgetIdr: 9000000 },
  { name: 'Riset Sitasi PMK & UU HPP (RAG)', req: 1120, fastPathPct: 42.0, p95Ms: 848, faithPct: 98.2, tokM: 21.6, costIdr: 7420000, budgetIdr: 9500000 },
  { name: 'Simulator PPh 26 & Validasi Form DGT', req: 480, fastPathPct: 61.5, p95Ms: 694, faithPct: 97.9, tokM: 7.2, costIdr: 2680000, budgetIdr: 4000000 },
  { name: 'Audit Pra-Posting & XML CoreTax', req: 380, fastPathPct: 91.2, p95Ms: 286, faithPct: 99.7, tokM: 4.1, costIdr: 1480000, budgetIdr: 2500000 },
];

const GUARDRAILS = [
  { id: 'GRD-01', name: 'Zero Uncited Statutory Claim', rule: 'Setiap rekomendasi tarif wajib menyertakan pasal PMK/PP/UU terverifikasi di Graph', blocked: 42, passRate: 99.1, tone: 'ok' },
  { id: 'GRD-02', name: 'Tarif Drift Deterministic Lock', rule: 'Output LLM tidak dapat menimpa tarif deterministik .NET 9 Rule Engine', blocked: 19, passRate: 100.0, tone: 'ok' },
  { id: 'GRD-03', name: 'NPWP 16-Digit & NITKU Checksum', rule: 'Auto-flag kenaikan tarif +100% (Ps. 23(1a)) bila NPWP vendor belum aktif CoreTax', blocked: 27, passRate: 98.8, tone: 'warn' },
  { id: 'GRD-04', name: 'Form DGT & COD Expiry Gate', rule: 'Blokir penerapan tarif P3B jika masa berlaku COD/DGT melewati tanggal faktur', blocked: 14, passRate: 100.0, tone: 'ok' },
  { id: 'GRD-05', name: 'CoreTax XSD v2.6 Schema Strict', rule: 'Tolak ekspor XML bila kode objek 9-digit atau format DPP Nilai Lain invalid', blocked: 8, passRate: 100.0, tone: 'ok' },
];

// P3 — Cross-Border PPh 26 & Tax Treaty Contracts (10 Active Contracts, includes TX-02, TX-07, TX-12)
const TREATY_CONTRACTS = [
  { code: 'TX-02', vendor: 'CloudStack Asia Pte. Ltd.', country: 'Singapura', p3bArt: 'Ps. 7 (Laba Usaha)', objCode: '27-104-01', dpp: 1343000000, domRate: 20, treatyRate: 0, appliedRate: 20, dgtStatus: 'Menunggu DGT', dgtExp: 'Belum Unggah', tone: 'warn', selected: true },
  { code: 'TX-07', vendor: 'Nippon Telemetry Corp.', country: 'Jepang', p3bArt: 'Ps. 12 (Royalti)', objCode: '27-103-01', dpp: 510000000, domRate: 20, treatyRate: 10, appliedRate: 10, dgtStatus: 'DGT Valid', dgtExp: '31 Des 2026', tone: 'ok' },
  { code: 'TX-12', vendor: 'EuroGrid Advisory B.V.', country: 'Belanda', p3bArt: 'Ps. 7 (Jasa Remote)', objCode: '27-104-01', dpp: 420000000, domRate: 20, treatyRate: 0, appliedRate: 0, dgtStatus: 'DGT Valid', dgtExp: '31 Des 2026', tone: 'ok' },
  { code: 'CB-04', vendor: 'Apex Analytics Inc.', country: 'Amerika Serikat', p3bArt: 'Ps. 13 (Royalti)', objCode: '27-103-01', dpp: 380000000, domRate: 20, treatyRate: 10, appliedRate: 10, dgtStatus: 'DGT Valid', dgtExp: '30 Jun 2027', tone: 'ok' },
  { code: 'CB-05', vendor: 'Harbour FinTech HK Ltd.', country: 'Hong Kong', p3bArt: 'Ps. 12 (Royalti)', objCode: '27-103-01', dpp: 290000000, domRate: 20, treatyRate: 5, appliedRate: 5, dgtStatus: 'DGT Valid', dgtExp: '31 Mar 2027', tone: 'ok' },
  { code: 'CB-06', vendor: 'Thames Actuarial LLP', country: 'Inggris', p3bArt: 'Ps. 7 (Jasa Aktuaria)', objCode: '27-104-01', dpp: 260000000, domRate: 20, treatyRate: 0, appliedRate: 20, dgtStatus: 'COD Expired', dgtExp: '31 Okt 2026', tone: 'bad' },
  { code: 'CB-07', vendor: 'Hansol Grid Systems Co.', country: 'Korea Selatan', p3bArt: 'Ps. 12 (Lisensi)', objCode: '27-103-01', dpp: 340000000, domRate: 20, treatyRate: 15, appliedRate: 15, dgtStatus: 'DGT Valid', dgtExp: '31 Des 2026', tone: 'ok' },
  { code: 'CB-08', vendor: 'RheinWerk Engineering GmbH', country: 'Jerman', p3bArt: 'Ps. 12 (Jasa Teknik)', objCode: '27-104-02', dpp: 460000000, domRate: 20, treatyRate: 7.5, appliedRate: 7.5, dgtStatus: 'DGT Valid', dgtExp: '31 Des 2026', tone: 'ok' },
  { code: 'CB-09', vendor: 'Merlion Cloud Security Pte.', country: 'Singapura', p3bArt: 'Ps. 12(2)b (Royalti)', objCode: '27-103-01', dpp: 225000000, domRate: 20, treatyRate: 8, appliedRate: 8, dgtStatus: 'DGT Valid', dgtExp: '31 Des 2026', tone: 'ok' },
  { code: 'CB-10', vendor: 'Nordic Turbine Services AB', country: 'Swedia', p3bArt: 'Ps. 7 (Supervisi <90h)', objCode: '27-104-01', dpp: 310000000, domRate: 20, treatyRate: 0, appliedRate: 0, dgtStatus: 'DGT Valid', dgtExp: '28 Feb 2027', tone: 'ok' },
];

const TREATY_MATRIX = [
  { country: 'Singapura', code: 'SG', jasa: '0% (Non-BUT)', royalti: '8% / 10%', bunga: '10%', dividen: '10% / 15%', active: 2, highlight: true },
  { country: 'Jepang', code: 'JP', jasa: '0% (Non-BUT)', royalti: '10%', bunga: '10%', dividen: '10% / 15%', active: 1 },
  { country: 'Belanda', code: 'NL', jasa: '0% (Non-BUT)', royalti: '10%', bunga: '5% / 10%', dividen: '5% / 15%', active: 1 },
  { country: 'Amerika Serikat', code: 'US', jasa: '0% (Non-BUT)', royalti: '10%', bunga: '10%', dividen: '10% / 15%', active: 1 },
  { country: 'Hong Kong', code: 'HK', jasa: '0% (Non-BUT)', royalti: '5%', bunga: '10%', dividen: '5% / 10%', active: 1 },
  { country: 'Jerman', code: 'DE', jasa: '7,5% (Teknik)', royalti: '10% / 15%', bunga: '10%', dividen: '10% / 15%', active: 1 },
  { country: 'Inggris', code: 'GB', jasa: '0% (Non-BUT)', royalti: '10% / 15%', bunga: '10%', dividen: '10% / 15%', active: 1 },
  { country: 'Korea Selatan', code: 'KR', jasa: '0% (Non-BUT)', royalti: '15%', bunga: '10%', dividen: '10% / 15%', active: 1 },
];

// P4 — Statutory Corpus Collections & Rule Impact Register
const CORPUS_COLLECTIONS = [
  { id: 'COR-01', name: 'UU HPP (UU No. 7 Tahun 2021) & Penjelasan', docs: 48, chunks: 4820, updated: '12 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-02', name: 'PMK 81/2024 — Ketentuan Perpajakan CoreTax', docs: 186, chunks: 14640, updated: '20 Nov 2026', status: 'Synced', tone: 'ok', selected: true },
  { id: 'COR-03', name: 'PMK 131/2024 — PPN 12% & DPP Nilai Lain 11/12', docs: 64, chunks: 3920, updated: '19 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-04', name: 'PP 58/2023 & PMK 168/2023 — PPh 21 TER', docs: 142, chunks: 8140, updated: '14 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-05', name: 'PMK 141/2015 — Daftar 62 Jenis Jasa Lain PPh 23', docs: 96, chunks: 5280, updated: '10 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-06', name: 'PP 34/2017 & PP 9/2022 — PPh Final Ps. 4(2)', docs: 118, chunks: 5640, updated: '11 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-07', name: 'PER-25/PJ/2018 & 71 Naskah P3B (Tax Treaty)', docs: 428, chunks: 13960, updated: '18 Nov 2026', status: 'Synced', tone: 'ok' },
  { id: 'COR-08', name: 'SE Dirjen Pajak, Putusan Pengadilan Pajak & XSD', docs: 400, chunks: 7880, updated: '21 Nov 2026', status: 'Indexing', tone: 'info' },
];

const RULE_IMPACTS = [
  { id: 'IMP-26-14', reg: 'PMK 81/2024', change: 'Pemetaan kode objek e-Bupot ke 9-digit CoreTax', gl: '210401-210409', affectedInv: 168, testPass: '482/482', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-13', reg: 'PMK 131/2024', change: 'Formula DPP Nilai Lain 11/12 (non-mewah)', gl: '110701 PPN Masukan', affectedInv: 112, testPass: '310/310', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-12', reg: 'PMK 71/2022', change: 'Validasi PPN efektif 1,1% jasa transportasi', gl: '510302 Freight', affectedInv: 24, testPass: '94/94', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-11', reg: 'PER-25/PJ/18', change: 'Enforcement otomatis uji BO & PPT Form DGT', gl: '210406 PPh 26', affectedInv: 10, testPass: '128/128', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-10', reg: 'PMK 168/2023', change: 'Hitung 50% Ph. Bruto Bukan Pegawai (Ahli)', gl: '520108 Honorarium', affectedInv: 19, testPass: '164/164', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-09', reg: 'PP 9/2022', change: 'Verifikasi SBU LPJK aktif tarif konstruksi 2,65%', gl: '140201 CAPEX', affectedInv: 8, testPass: '72/72', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-08', reg: 'XSD v2.6.1', change: 'Wajib NITKU 22-digit untuk transaksi cabang', gl: 'Semua GL AP/AR', affectedInv: 168, testPass: '520/520', status: 'Review', tone: 'warn' },
  { id: 'IMP-26-07', reg: 'PMK 141/2015', change: 'Pemisahan 62 jasa PPh 23 vs sewa PPh 4(2)', gl: '520400-520499', affectedInv: 86, testPass: '218/218', status: 'Aktif', tone: 'ok' },
  { id: 'IMP-26-06', reg: 'PP 58/2023', change: 'Tabel kategori TER A/B/C PPh 21 bulanan', gl: '520101 Payroll', affectedInv: 18, testPass: '146/146', status: 'Aktif', tone: 'ok' },
];

// P5 — Consolidated Masa Pajak Nov 2026 Tax Position & GL Reconciliation (168 Faktur/Bupot)
const TAX_RECON = [
  { kind: 'PPh Pasal 23 (Jasa & Sewa Harta)', objGroup: '24-100 / 24-104', count: 64, glDpp: 3840000000, ctDpp: 3840000000, taxAmt: 78500000, xsd: 'XSD OK', tone: 'ok' },
  { kind: 'PPh Pasal 4(2) Final (Sewa & Konstruksi)', objGroup: '28-403 / 28-409', count: 22, glDpp: 4120000000, ctDpp: 4120000000, taxAmt: 214025000, xsd: 'XSD OK', tone: 'ok' },
  { kind: 'PPh Pasal 26 (Jasa & Royalti Luar Negeri)', objGroup: '27-103 / 27-104', count: 10, glDpp: 4538000000, ctDpp: 4538000000, taxAmt: 527600000, xsd: '2 Hold DGT', tone: 'warn' },
  { kind: 'PPh Pasal 21 TER (Bukan Pegawai & Ahli)', objGroup: '21-100-07', count: 18, glDpp: 680000000, ctDpp: 680000000, taxAmt: 19450000, xsd: 'XSD OK', tone: 'ok' },
  { kind: 'PPN Masukan Reguler (Tarif Efektif 11%)', objGroup: 'FP-010 / JLN', count: 38, glDpp: 12460000000, ctDpp: 12460000000, taxAmt: 1370600000, xsd: 'e-Faktur OK', tone: 'ok' },
  { kind: 'PPN Masukan DPP Nilai Lain (JPT 1,1%)', objGroup: 'FP-040 / JPT', count: 16, glDpp: 1420000000, ctDpp: 1420000000, taxAmt: 15620000, xsd: 'e-Faktur OK', tone: 'ok' },
];

const AUDIT_SIGNOFFS = [
  { step: '01', role: 'Tax Specialist (Maker)', actor: 'D. Anggraini, S.Ak', time: '22 Nov 26 · 08:42 WIB', action: 'Verifikasi 168 klasifikasi objek potong & lampiran e-Faktur', hash: 'sha256:8f41c2...9a04', status: 'Disetujui', tone: 'ok' },
  { step: '02', role: 'Head of Tax Compliance (Checker)', actor: 'R. Wibisono, BKP', time: '22 Nov 26 · 10:15 WIB', action: 'Review rekonsiliasi GL AP vs CoreTax & 2 kontrak DGT pending', hash: 'sha256:3b90e7...4d11', status: 'Sedang Review', tone: 'warn' },
  { step: '03', role: 'Partner KKP Eksternal (Reviewer)', actor: 'Ir. S. Kartika, CPA, BKP', time: 'Menunggu Checker', action: 'Sign-off kertas kerja posisi pajak & mitigasi eksposur PPh 26', hash: 'PENDING-WORM-LOCK', status: 'Antrean', tone: 'neutral' },
  { step: '04', role: 'CFO / Kuasa Wajib Pajak', actor: 'B. Santoso, MBA', time: 'Target 25 Nov 2026', action: 'Otorisasi final setor billing & unggah XML SPT Masa CoreTax', hash: 'PENDING-PASSKEY-DJP', status: 'Terjadwal', tone: 'info' },
];

// ============================================================================
// DERIVED AGGREGATES & MATHEMATICAL ASSERTIONS
// ============================================================================
const BATCH_DPP = INVOICES.reduce((a, r) => a + r.dpp, 0);
const BATCH_PPH = INVOICES.reduce((a, r) => a + r.pphAmt, 0);
const BATCH_PPN = INVOICES.reduce((a, r) => a + r.ppnAmt, 0);
const BATCH_OK_CNT = INVOICES.filter((r) => r.tone === 'ok').length;
const BATCH_ATTN_CNT = INVOICES.filter((r) => r.tone !== 'ok').length;

const TOTAL_AGENT_REQ = AGENT_WORKFLOWS.reduce((a, w) => a + w.req, 0);
const TOTAL_AGENT_COST = AGENT_WORKFLOWS.reduce((a, w) => a + w.costIdr, 0);
const TOTAL_AGENT_TOKM = AGENT_WORKFLOWS.reduce((a, w) => a + w.tokM, 0);
const TOTAL_GUARD_BLOCKED = GUARDRAILS.reduce((a, g) => a + g.blocked, 0);

const TREATY_DPP_SUM = TREATY_CONTRACTS.reduce((a, c) => a + c.dpp, 0);
const TREATY_DOM_PPH = TREATY_CONTRACTS.reduce((a, c) => a + Math.round((c.dpp * c.domRate) / 100), 0);
const TREATY_APPLIED_PPH = TREATY_CONTRACTS.reduce((a, c) => a + Math.round((c.dpp * c.appliedRate) / 100), 0);
const TREATY_REALIZED_SAVE = TREATY_DOM_PPH - TREATY_APPLIED_PPH;
const TREATY_POTENTIAL_ADD = TREATY_CONTRACTS.reduce(
  (a, c) => a + Math.round((c.dpp * (c.appliedRate - c.treatyRate)) / 100),
  0
);

const CORPUS_TOTAL_DOCS = CORPUS_COLLECTIONS.reduce((a, c) => a + c.docs, 0);
const CORPUS_TOTAL_CHUNKS = CORPUS_COLLECTIONS.reduce((a, c) => a + c.chunks, 0);

const RECON_TOTAL_COUNT = TAX_RECON.reduce((a, r) => a + r.count, 0);
const RECON_PPH_TOTAL = TAX_RECON.slice(0, 4).reduce((a, r) => a + r.taxAmt, 0);
const RECON_PPN_TOTAL = TAX_RECON.slice(4).reduce((a, r) => a + r.taxAmt, 0);

export function verifyMath() {
  // 1. Verify every invoice row's exact tax arithmetic
  for (const inv of INVOICES) {
    const expPph = Math.round((inv.dpp * inv.pphRate) / 100);
    const expPpn = Math.round((inv.dpp * inv.ppnRate) / 100);
    if (inv.pphAmt !== expPph) {
      throw new Error(`Invoice ${inv.code} PPh mismatch: ${inv.pphAmt} !== ${expPph}`);
    }
    if (inv.ppnAmt !== expPpn) {
      throw new Error(`Invoice ${inv.code} PPN mismatch: ${inv.ppnAmt} !== ${expPpn}`);
    }
  }
  if (BATCH_DPP !== 7280000000) throw new Error(`BATCH_DPP mismatch: ${BATCH_DPP}`);
  if (BATCH_PPH !== 522065000) throw new Error(`BATCH_PPH mismatch: ${BATCH_PPH}`);
  if (BATCH_PPN !== 719620000) throw new Error(`BATCH_PPN mismatch: ${BATCH_PPN}`);
  if (BATCH_OK_CNT + BATCH_ATTN_CNT !== INVOICES.length) throw new Error('Batch status count mismatch');

  // 2. Verify P2 agent telemetry totals
  if (TOTAL_AGENT_REQ !== 4820) throw new Error(`TOTAL_AGENT_REQ mismatch: ${TOTAL_AGENT_REQ}`);
  if (TOTAL_AGENT_COST !== 18420000) throw new Error(`TOTAL_AGENT_COST mismatch: ${TOTAL_AGENT_COST}`);
  if (Math.round(TOTAL_AGENT_TOKM * 10) !== 513) throw new Error(`TOTAL_AGENT_TOKM mismatch: ${TOTAL_AGENT_TOKM}`);
  if (TOTAL_GUARD_BLOCKED !== 110) throw new Error(`TOTAL_GUARD_BLOCKED mismatch: ${TOTAL_GUARD_BLOCKED}`);

  // 3. Verify P3 cross-border treaty math & consistency with P1 & P5
  const tx02P1 = INVOICES.find((i) => i.code === 'TX-02');
  const tx02P3 = TREATY_CONTRACTS.find((c) => c.code === 'TX-02');
  if (!tx02P1 || !tx02P3 || tx02P1.dpp !== tx02P3.dpp) throw new Error('TX-02 P1/P3 DPP mismatch');
  const tx07P1 = INVOICES.find((i) => i.code === 'TX-07');
  const tx07P3 = TREATY_CONTRACTS.find((c) => c.code === 'TX-07');
  if (!tx07P1 || !tx07P3 || tx07P1.dpp !== tx07P3.dpp) throw new Error('TX-07 P1/P3 DPP mismatch');
  const tx12P1 = INVOICES.find((i) => i.code === 'TX-12');
  const tx12P3 = TREATY_CONTRACTS.find((c) => c.code === 'TX-12');
  if (!tx12P1 || !tx12P3 || tx12P1.dpp !== tx12P3.dpp) throw new Error('TX-12 P1/P3 DPP mismatch');

  const p5Pph26 = TAX_RECON[2];
  if (p5Pph26.count !== TREATY_CONTRACTS.length) throw new Error('P3/P5 PPh 26 contract count mismatch');
  if (p5Pph26.glDpp !== TREATY_DPP_SUM) throw new Error(`P3/P5 PPh 26 DPP mismatch: ${p5Pph26.glDpp} vs ${TREATY_DPP_SUM}`);
  if (p5Pph26.taxAmt !== TREATY_APPLIED_PPH) throw new Error(`P3/P5 PPh 26 tax mismatch: ${p5Pph26.taxAmt} vs ${TREATY_APPLIED_PPH}`);

  // 4. Verify P4 corpus totals
  if (CORPUS_TOTAL_DOCS !== 1482) throw new Error(`CORPUS_TOTAL_DOCS mismatch: ${CORPUS_TOTAL_DOCS}`);
  if (CORPUS_TOTAL_CHUNKS !== 64280) throw new Error(`CORPUS_TOTAL_CHUNKS mismatch: ${CORPUS_TOTAL_CHUNKS}`);

  // 5. Verify P5 reconciliation totals
  if (RECON_TOTAL_COUNT !== 168) throw new Error(`RECON_TOTAL_COUNT mismatch: ${RECON_TOTAL_COUNT}`);
  if (RECON_PPH_TOTAL !== 839575000) throw new Error(`RECON_PPH_TOTAL mismatch: ${RECON_PPH_TOTAL}`);
  if (RECON_PPN_TOTAL !== 1386220000) throw new Error(`RECON_PPN_TOTAL mismatch: ${RECON_PPN_TOTAL}`);
  for (const r of TAX_RECON) {
    if (r.glDpp !== r.ctDpp) throw new Error(`Unreconciled variance on ${r.kind}`);
  }
}

// ============================================================================
// CUSTOM PAJAKCOPILOT ARCHITECTURAL SHELL (DISTINCT FROM ID-001)
// Top #1b4965 statutory ribbon (24px) + crisp white tab header (40px)
// + compact 44px left tool rail + full-width dense canvas + 24px status bar
// ============================================================================

const BASE_SHELL_CSS = `
  .pc-ribbon {
    height: 24px;
    background: #1b4965;
    color: #dbeaf2;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    letter-spacing: 0.01em;
    flex-shrink: 0;
  }
  .pc-ribbon-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pc-ribbon-tag {
    background: #113247;
    border: 1px solid #30698c;
    color: #e6f4fb;
    padding: 1px 6px;
    border-radius: 2px;
    font-weight: 700;
  }
  .pc-header {
    height: 40px;
    background: #ffffff;
    border-bottom: 1px solid #cbd5e1;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .pc-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 12px;
    border-right: 1px solid #d5dde5;
    flex-shrink: 0;
  }
  .pc-logo {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #1b4965;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.02em;
  }
  .pc-tabs {
    display: flex;
    align-items: stretch;
    height: 40px;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  .pc-tab {
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
  .pc-tab .pc-tab-idx {
    font-family: var(--e-mono);
    font-size: 9.2px;
    color: #94a3b8;
    font-weight: 700;
  }
  .pc-tab.is-active {
    color: #123449;
    background: #f0f6fa;
    border-bottom-color: #1b4965;
    font-weight: 700;
  }
  .pc-tab.is-active .pc-tab-idx {
    color: #1b4965;
  }
  .pc-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .pc-search {
    height: 25px;
    width: 224px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f4f7fa;
    border: 1px solid #cbd5e1;
    color: #64748b;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .pc-kbd {
    font-family: var(--e-mono);
    font-size: 8.8px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .pc-user {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid #d5dde5;
  }
  .pc-avatar {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #e7f0f5;
    border: 1px solid #b5cedc;
    color: #1b4965;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .pc-body {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }
  .pc-rail {
    width: 44px;
    background: #f8fafc;
    border-right: 1px solid #d5dde5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    flex-shrink: 0;
  }
  .pc-rail-grp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  .pc-rail-btn {
    width: 30px;
    height: 30px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    position: relative;
  }
  .pc-rail-btn.is-active {
    background: #e7f0f5;
    color: #1b4965;
    border: 1px solid #b5cedc;
  }
  .pc-workspace {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pc-actionbar {
    height: 34px;
    padding: 0 12px;
    background: #ffffff;
    border-bottom: 1px solid #d5dde5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .pc-canvas-inner {
    flex: 1;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }
  .pc-footer {
    height: 24px;
    background: #eef2f5;
    border-top: 1px solid #cbd5e1;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: #475569;
    flex-shrink: 0;
  }
  .pc-rule-box {
    background: #f4f8fb;
    border: 1px solid #bfd3e0;
    border-left: 3px solid #1b4965;
    border-radius: 3px;
    padding: 7px 9px;
  }
  .pc-code-block {
    background: #0f212e;
    color: #dbeaf2;
    border: 1px solid #1e3a4c;
    border-radius: 3px;
    padding: 7px 10px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    line-height: 1.36;
    overflow: hidden;
  }
  .pc-kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
  }
  .pc-kv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3.5px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 10.5px;
  }
  .pc-kv-lbl { color: #64748b; }
  .pc-kv-val { font-weight: 700; color: #0f172a; }
`;

function renderShell({ activeTab, pageTitle, subMeta, actionsHtml, contentHtml, extraCss = '' }) {
  const tabs = [
    { id: 'p1', idx: '01', label: 'Klasifikasi Faktur', icon: 'layers' },
    { id: 'p2', idx: '02', label: 'Agent RAG & Evaluasi', icon: 'cpu' },
    { id: 'p3', idx: '03', label: 'Simulator PPh 26 & DGT', icon: 'globe' },
    { id: 'p4', idx: '04', label: 'Korpus & Graf PMK', icon: 'gitBranch' },
    { id: 'p5', idx: '05', label: 'Kertas Kerja & XML', icon: 'fileText' },
  ];

  const ribbonHtml = `<div class="pc-ribbon">
    <div class="pc-ribbon-group">
      <span class="pc-ribbon-tag">CORETAX-2026</span>
      <span>KORPUS PMK v26.4</span>
      <span style="opacity:0.45;">|</span>
      <span>.NET 9 RULE ENGINE v4.12 (DETERMINISTIC)</span>
      <span style="opacity:0.45;">|</span>
      <span>POSTGRESQL STATUTORY GRAPH: 1.482 DOK · 64.280 PASAL</span>
    </div>
    <div class="pc-ribbon-group">
      <span>PT NUSANTARA ENERGI HOLDING</span>
      <span style="opacity:0.45;">|</span>
      <span>NPWP16: 0012.8410.5019.0000</span>
      <span style="opacity:0.45;">|</span>
      <span>MASA PAJAK: NOV 2026</span>
    </div>
  </div>`;

  const headerHtml = `<header class="pc-header">
    <div class="pc-brand">
      <span class="pc-logo">PC</span>
      <div style="line-height:1.15;">
        <div style="font-size:12.5px;font-weight:800;color:#123449;letter-spacing:-0.01em;">PajakCopilot</div>
        <div style="font-size:9px;color:#64748b;font-weight:600;">CoreTax AI Workbench</div>
      </div>
    </div>
    <nav class="pc-tabs">
      ${tabs
        .map(
          (t) => `<div class="pc-tab ${t.id === activeTab ? 'is-active' : ''}">
            <span class="pc-tab-idx">${t.idx}</span>
            ${ic(t.icon, 12, t.id === activeTab ? '#1b4965' : '#64748b')}
            <span>${esc(t.label)}</span>
          </div>`
        )
        .join('')}
    </nav>
    <div class="pc-header-right">
      <div class="pc-search">
        <span style="display:inline-flex;align-items:center;gap:5px;" class="trunc">
          ${ic('search', 11, '#64748b')}
          <span class="trunc">Cari NPWP, kode objek, pasal PMK...</span>
        </span>
        <span class="pc-kbd">Ctrl+K</span>
      </div>
      <div class="pc-user">
        <span class="pc-avatar">RW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;">R. Wibisono, BKP</div>
          <div style="font-size:9px;color:#64748b;">Head of Tax Compliance</div>
        </div>
      </div>
    </div>
  </header>`;

  const railHtml = `<aside class="pc-rail">
    <div class="pc-rail-grp">
      ${tabs
        .map(
          (t) => `<div class="pc-rail-btn ${t.id === activeTab ? 'is-active' : ''}" title="${esc(t.label)}">
            ${ic(t.icon, 15, t.id === activeTab ? '#1b4965' : '#64748b')}
          </div>`
        )
        .join('')}
    </div>
    <div class="pc-rail-grp">
      <div class="pc-rail-btn">${ic('shield', 14, '#047857')}</div>
      <div class="pc-rail-btn">${ic('database', 14, '#64748b')}</div>
      <div class="pc-rail-btn">${ic('sliders', 14, '#64748b')}</div>
    </div>
  </aside>`;

  const actionBarHtml = `<div class="pc-actionbar">
    <div style="display:flex;align-items:center;gap:8px;min-width:0;">
      <strong style="font-size:12.5px;color:#0f172a;white-space:nowrap;">${esc(pageTitle)}</strong>
      <span style="color:#cbd5e1;">/</span>
      <span style="font-size:10.8px;color:#64748b;" class="trunc">${esc(subMeta)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
      ${actionsHtml}
    </div>
  </div>`;

  const footerHtml = `<footer class="pc-footer">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="display:inline-flex;align-items:center;gap:5px;"><span class="dot dot-ok"></span>CoreTax DJP XSD v2.6.1 Sinkron</span>
      <span>Rule Engine: .NET 9 · 0 Drift</span>
      <span>RAG Index: Python BGE-M3 + BM25 Hybrid</span>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <span>KPP Madya Jakarta Selatan II</span>
      <span>WORM Audit: sha256:9c4e12a8...f01b</span>
      <span>22 Nov 2026 · 11:04 WIB</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `PajakCopilot — ${pageTitle}`,
    accent: '#1b4965',
    accentSoft: '#e7f0f5',
    accentInk: '#123449',
    bg: '#f2f5f7',
    surface: '#ffffff',
    surface2: '#f7f9fb',
    border: '#d5dde5',
    borderStrong: '#b8c4d0',
    text: '#0f172a',
    text2: '#334155',
    muted: '#64748b',
    extraCss: BASE_SHELL_CSS + extraCss,
    bodyHtml: `
      ${ribbonHtml}
      ${headerHtml}
      <div class="pc-body">
        ${railHtml}
        <main class="pc-workspace">
          ${actionBarHtml}
          <div class="pc-canvas-inner">${contentHtml}</div>
        </main>
      </div>
      ${footerHtml}
    `,
  });
}

// ============================================================================
// PAGE 1: KLASIFIKASI FAKTUR & OBJEK POTONG CORETAX (MASTER-DETAIL WORKBENCH)
// ============================================================================
function renderPage1() {
  const sel = INVOICES[0]; // TX-01 selected so exact PMK-141 snippet & CoreTax 24-104-01 are spotlighted
  const netPayable = sel.dpp + sel.ppnAmt - sel.pphAmt;

  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Faktur Batch Aktif</span>${badge('BCH-11-04', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">16 <span style="font-size:11px;font-weight:600;color:#64748b;">/ 168 Masa</span></span>
        ${svgSparkline({ points: [11, 14, 13, 18, 15, 19, 16], width: 64, height: 20, color: '#1b4965' })}
      </div>
      <div class="e-kpi-foot"><span>${BATCH_OK_CNT} Terpetakan · ${BATCH_ATTN_CNT} Eskalasi</span><span class="mono" style="color:#047857;font-weight:700;">87,5% Auto</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total DPP Batch</span>${badge('ERP AP', 'neutral')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="font-size:15px;">${fmtIdr(BATCH_DPP)}</span>
      </div>
      <div class="e-kpi-foot"><span>16 Vendor (13 Domestik · 3 LN)</span><span class="mono">SAP S/4HANA</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total PPh Dipotong</span>${badge('Unifikasi', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="font-size:15px;color:#1b4965;">${fmtIdr(BATCH_PPH)}</span>
      </div>
      <div class="e-kpi-foot"><span>PPh 23 · 4(2) · 26 · 21 TER</span><span class="mono">Tarif Ef. 7,2%</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>PPN Masukan & JPT 1,1%</span>${badge('e-Faktur', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="font-size:15px;">${fmtIdr(BATCH_PPN)}</span>
      </div>
      <div class="e-kpi-foot"><span>Termasuk 2 Faktur DPP Nilai Lain</span><span class="mono">PMK 71/2022</span></div>
    </div>
    <div class="e-kpi" style="border-color:#fde68a;background:#fffdf5;">
      <div class="e-kpi-top"><span>Perlu Tindakan Pajak</span>${badge('2 Kasus', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">1 DGT · 1 NPWP</span>
      </div>
      <div class="e-kpi-foot"><span>TX-02 Treaty SG · TX-14 Non-NPWP</span><span class="mono" style="color:#b45309;font-weight:700;">Pra-Posting</span></div>
    </div>
  </div>`;

  const rowsHtml = INVOICES.map((r) => {
    const trClass = r.selected ? 'is-selected' : r.bad ? 'is-bad' : r.warn ? 'is-warn' : '';
    const taxTone =
      r.taxType === 'PPh 26'
        ? 'warn'
        : r.taxType === 'PPh 4(2)'
          ? 'info'
          : r.taxType === 'PPh 21'
            ? 'neutral'
            : 'accent';
    return `<tr class="${trClass}">
      <td class="mono" style="font-weight:700;color:#1b4965;">${esc(r.code)}</td>
      <td>
        <div class="trunc" style="font-weight:600;color:#0f172a;">${esc(r.vendor)}</div>
        <div class="trunc" style="font-size:9.4px;color:#64748b;">${esc(r.desc)}</div>
      </td>
      <td>${badge(r.taxType, taxTone)}</td>
      <td class="mono" style="font-weight:700;color:#123449;">${esc(r.objCode)}</td>
      <td class="mono num">${fmtNum(r.dpp)}</td>
      <td class="mono num" style="font-weight:600;">${fmtPct(r.pphRate, r.pphRate === 2.65 ? 2 : 1)}</td>
      <td class="mono num" style="font-weight:700;color:#0f172a;">${fmtNum(r.pphAmt)}</td>
      <td class="mono num" style="color:#475569;">${r.ppnAmt > 0 ? fmtNum(r.ppnAmt) : '—'}</td>
      <td>${badge(r.status, r.tone)}</td>
    </tr>`;
  }).join('');

  const contentHtml = `
    ${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.72fr 1fr;gap:9px;">
      <!-- LEFT: 16-ROW OPERATIONAL INVOICE CLASSIFICATION GRID -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('layers', 13, '#1b4965')}
            <span>Antrean Klasifikasi Faktur Vendor (Batch BCH-2026-11-04)</span>
            <span class="e-panel-sub">· 16 transaksi prioritas · Nilai dalam IDR</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('Semua (16)', 'accent')}
            ${badge('PPh 23 (9)', 'neutral')}
            ${badge('PPh 4(2) (3)', 'neutral')}
            ${badge('PPh 26 (3)', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p1-grid">
            <thead>
              <tr>
                <th style="width:52px;">Kode</th>
                <th style="width:248px;">Vendor & Deskripsi Transaksi</th>
                <th style="width:68px;">Jenis</th>
                <th style="width:76px;">Kode Objek</th>
                <th class="num" style="width:106px;">DPP (IDR)</th>
                <th class="num" style="width:52px;">Tarif</th>
                <th class="num" style="width:94px;">PPh Potong</th>
                <th class="num" style="width:92px;">PPN Masuk</th>
                <th style="width:88px;">Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="mono">TOTAL BATCH BCH-2026-11-04 (16 FAKTUR)</td>
                <td class="mono num">${fmtNum(BATCH_DPP)}</td>
                <td class="mono num">—</td>
                <td class="mono num" style="color:#1b4965;">${fmtNum(BATCH_PPH)}</td>
                <td class="mono num">${fmtNum(BATCH_PPN)}</td>
                <td>${badge('Balance OK', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- RIGHT: DETERMINISTIC RULE & PMK CITATION INSPECTOR -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('checkCircle', 13, '#047857')}
            <span>Inspektor Klasifikasi · ${esc(sel.code)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('Kode: 24-104-01', 'ok')}
            ${badge('Tarif 2,0%', 'accent')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <!-- Selected Invoice Identity -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:7px;border-bottom:1px solid #e2e8f0;">
            <div>
              <div style="font-size:12.5px;font-weight:800;color:#0f172a;">${esc(sel.vendor)}</div>
              <div style="font-size:10.5px;color:#475569;margin-top:1px;">${esc(sel.desc)}</div>
              <div class="mono" style="font-size:9.8px;color:#64748b;margin-top:2px;">Faktur: ${esc(sel.invNo)} · NPWP16: ${esc(sel.npwp)}</div>
            </div>
            <div style="text-align:right;">
              ${badge('NPWP Valid CoreTax', 'ok')}
              <div class="mono" style="font-size:9.5px;color:#047857;font-weight:700;margin-top:4px;">Skor Sitasi: 99,4%</div>
            </div>
          </div>

          <!-- Deterministic Rule Engine Verdict -->
          <div class="pc-rule-box">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10px;font-weight:700;color:#123449;display:inline-flex;align-items:center;gap:5px;">
                ${ic('cpu', 12, '#1b4965')} DETERMINISTIC RULE MATCH (.NET 9 ENGINE)
              </span>
              <span class="mono" style="font-size:9.2px;color:#1b4965;font-weight:700;">FAST-PATH · 18 ms</span>
            </div>
            <div class="mono" style="font-size:10px;color:#0f172a;line-height:1.45;">
              Rule Match: PMK-141/PMK.03/2015 Pasal 1(6) -&gt; Jasa Konsultan = PPh 23 (2% ber-NPWP). Objek CoreTax: <strong>24-104-01</strong>.
            </div>
          </div>

          <!-- Statutory Passage Grounding -->
          <div style="border:1px solid #d5dde5;border-radius:3px;padding:7px 9px;background:#fafcfe;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:10px;font-weight:700;color:#334155;">Sitasi Pasal Terverifikasi (PostgreSQL Statutory Graph)</span>
              ${badge('Pasal 1(6) huruf g', 'info')}
            </div>
            <div style="font-size:10.2px;color:#334155;line-height:1.42;">
              &ldquo;Jasa konsultan selain jasa konstruksi termasuk dalam jenis jasa lain yang dikenakan pemotongan PPh Pasal 23 sebesar <strong>2% (dua persen)</strong> dari jumlah bruto tidak termasuk PPN bagi Wajib Pajak yang memiliki NPWP aktif.&rdquo;
            </div>
            <div style="display:flex;gap:6px;margin-top:6px;">
              ${badge('Bukan Sewa 4(2)', 'neutral')}
              ${badge('Bukan Konstruksi', 'neutral')}
              ${badge('PKP · e-Faktur 010', 'ok')}
            </div>
          </div>

          <!-- Exact Withholding & Cashflow Computation -->
          <div style="border:1px solid #d5dde5;border-radius:3px;padding:7px 9px;background:#ffffff;">
            <div style="font-size:10px;font-weight:700;color:#334155;margin-bottom:4px;">Kalkulasi Pemotongan & Net Payable Vendor</div>
            <div class="pc-kv"><span class="pc-kv-lbl">Dasar Pengenaan Pajak (DPP Jasa)</span><span class="pc-kv-val mono">${fmtIdr(sel.dpp)}</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">PPN Masukan (11,0% · FP 010.004-26)</span><span class="pc-kv-val mono" style="color:#0369a1;">+ ${fmtIdr(sel.ppnAmt)}</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">Potongan PPh 23 (2,0% · 24-104-01)</span><span class="pc-kv-val mono" style="color:#be123c;">- ${fmtIdr(sel.pphAmt)}</span></div>
            <div class="pc-kv" style="border-bottom:0;padding-top:5px;"><span style="font-weight:700;color:#0f172a;">Net Transfer ke Vendor (ERP AP)</span><span class="mono" style="font-weight:800;font-size:12px;color:#1b4965;">${fmtIdr(netPayable)}</span></div>
          </div>

          <!-- Pre-Posting Journal Preview -->
          <div style="border:1px solid #d5dde5;border-radius:3px;padding:7px 9px;background:#f8fafc;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
              <span style="font-size:10px;font-weight:700;color:#334155;">Pratinjau Jurnal Pra-Posting (SAP AP)</span>
              <span class="mono" style="font-size:9.2px;color:#047857;font-weight:700;">DR = CR · 499.500.000</span>
            </div>
            <table class="e-table" style="font-size:9.8px;">
              <thead>
                <tr>
                  <th style="width:54px;">GL</th>
                  <th>Nama Akun</th>
                  <th class="num" style="width:86px;">Debit</th>
                  <th class="num" style="width:86px;">Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="mono">520410</td><td>Beban Konsultasi TI</td><td class="mono num">450.000.000</td><td class="mono num">—</td></tr>
                <tr><td class="mono">110701</td><td>PPN Masukan Dapat Dikreditkan</td><td class="mono num">49.500.000</td><td class="mono num">—</td></tr>
                <tr><td class="mono">210402</td><td>Utang PPh 23 (24-104-01)</td><td class="mono num">—</td><td class="mono num">9.000.000</td></tr>
                <tr><td class="mono">210101</td><td>Utang Usaha Vendor AP</td><td class="mono num">—</td><td class="mono num">490.500.000</td></tr>
              </tbody>
            </table>
          </div>

          <!-- CoreTax & e-Faktur Pre-Posting Audit Checks -->
          <div style="border:1px solid #d5dde5;border-radius:3px;padding:7px 9px;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:10px;font-weight:700;color:#123449;">Verifikasi Pra-Posting CoreTax &amp; e-Faktur</span>
              <span class="mono" style="font-size:9.2px;color:#047857;font-weight:700;">4/4 Lulus</span>
            </div>
            <div class="pc-kv"><span class="pc-kv-lbl">Status NPWP16 &amp; NITKU Lawan Transaksi</span><span class="pc-kv-val mono" style="color:#047857;">Aktif · PKP Terdaftar</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">Validasi Nomor Faktur Pajak Masukan</span><span class="pc-kv-val mono">010.004-26.819204 · OK</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">Pemisahan Objek Jasa 23 vs Sewa 4(2)</span><span class="pc-kv-val mono" style="color:#1b4965;">Jasa Murni (Non-Sewa)</span></div>
            <div class="pc-kv" style="border-bottom:0;"><span class="pc-kv-lbl">Jejak Hash Rule Engine (WORM)</span><span class="pc-kv-val mono">sha256:8f41c2d9...04e</span></div>
          </div>

          <!-- Next Escalation Callout -->
          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:3px;padding:6px 9px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;">
            <div style="font-size:10px;color:#92400e;">
              <strong>Eskalasi Berikutnya (TX-02):</strong> CloudStack Asia Pte. Ltd. (SG) butuh Form DGT untuk hindari PPh 26 20%.
            </div>
            <span class="e-btn" style="border-color:#f59e0b;color:#92400e;background:#ffffff;">Buka DGT</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeTab: 'p1',
    pageTitle: 'PajakCopilot · Klasifikasi Objek Potong',
    subMeta: 'Pemetaan faktur vendor ERP ke objek PPh 21/23/4(2)/26, PPN DPP Nilai Lain & kode XML CoreTax',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#334155')} Sinkron ERP AP</span>
      <span class="e-btn">${ic('download', 11, '#334155')} Ekspor Kertas Kerja</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Klasifikasi Faktur</span>
    `,
    contentHtml,
    extraCss: `
      .p1-grid td { padding: 6.1px 7px !important; }
      .p1-grid tfoot td { padding: 7.5px 7px !important; }
    `,
  });
}
// ============================================================================
function renderPage2() {
  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Eksekusi Agent (MTD)</span>${badge('30 Hari', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_AGENT_REQ)}</span>
        ${svgSparkline({ points: [310, 345, 390, 412, 465, 440, 510], width: 64, height: 20, color: '#1b4965' })}
      </div>
      <div class="e-kpi-foot"><span>69,2% Fast-Path .NET 9</span><span class="mono" style="color:#047857;font-weight:700;">+14,2% MoM</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Citation Faithfulness (PMK)</span>${badge('Target >=98%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">98,6%</span>
        ${svgSparkline({ points: [97.4, 97.9, 98.1, 98.3, 98.4, 98.5, 98.6], width: 64, height: 20, color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>0 Halusinasi Tarif Lolos</span><span class="mono">Eval 482 Uji</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Latensi Pipeline (P50 / P95)</span>${badge('SLA <800ms', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">248 <span style="font-size:11px;color:#64748b;">/ 642 ms</span></span>
      </div>
      <div class="e-kpi-foot"><span>TTFT RAG Median: 184 ms</span><span class="mono">JKT-DC1</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Biaya Token LLM (MTD)</span>${badge('73,7% Pagu', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="font-size:15px;">${fmtIdr(TOTAL_AGENT_COST)}</span>
      </div>
      <div class="e-kpi-foot"><span>Total Token: ${TOTAL_AGENT_TOKM.toFixed(1).replace('.', ',')}M</span><span class="mono">Rp 3.822/sesi</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Intervensi Guardrail</span>${badge('Aktif', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">${fmtNum(TOTAL_GUARD_BLOCKED)}</span>
      </div>
      <div class="e-kpi-foot"><span>42 Tanpa Sitasi · 27 Non-NPWP</span><span class="mono">100% Terblokir</span></div>
    </div>
  </div>`;

  // Custom Vector Agent Orchestration DAG SVG (840 x 210)
  const dagSvg = `<svg viewBox="0 0 840 206" width="100%" height="206" style="display:block;">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
      </marker>
      <marker id="arr-acc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#1b4965"/>
      </marker>
      <marker id="arr-ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#047857"/>
      </marker>
    </defs>

    <!-- Subtle Stage Zone Backgrounds -->
    <rect x="4" y="6" width="140" height="194" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="3,2"/>
    <text x="12" y="20" font-size="8.5" font-weight="700" fill="#64748b" font-family="ui-monospace,Consolas,monospace">1. INGEST ERP</text>

    <rect x="156" y="6" width="212" height="194" rx="3" fill="#f4f8fb" stroke="#cbdce8" stroke-dasharray="3,2"/>
    <text x="164" y="20" font-size="8.5" font-weight="700" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">2. DETERMINISTIC + HYBRID RAG</text>

    <rect x="380" y="6" width="234" height="194" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="3,2"/>
    <text x="388" y="20" font-size="8.5" font-weight="700" fill="#64748b" font-family="ui-monospace,Consolas,monospace">3. STATUTORY GRAPH &amp; VERIFIER</text>

    <rect x="626" y="6" width="210" height="194" rx="3" fill="#f2fbf7" stroke="#bce3d4" stroke-dasharray="3,2"/>
    <text x="634" y="20" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">4. GUARDRAIL &amp; OUTPUT</text>

    <!-- Edges -->
    <path d="M 134 102 L 168 68" fill="none" stroke="#1b4965" stroke-width="1.6" marker-end="url(#arr-acc)"/>
    <path d="M 134 102 L 168 144" fill="none" stroke="#64748b" stroke-width="1.4" stroke-dasharray="4,2" marker-end="url(#arr)"/>
    <rect x="135" y="61" width="30" height="12" rx="2" fill="#ffffff" stroke="#cbdce8" stroke-width="0.8"/>
    <text x="150" y="70" text-anchor="middle" font-size="7.8" font-weight="700" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">69,2%</text>
    <rect x="135" y="131" width="30" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <text x="150" y="140" text-anchor="middle" font-size="7.8" font-weight="700" fill="#475569" font-family="ui-monospace,Consolas,monospace">30,8%</text>

    <!-- Fast-Path to Verifier -->
    <path d="M 356 64 L 392 64" fill="none" stroke="#1b4965" stroke-width="1.6" marker-end="url(#arr-acc)"/>
    <!-- Hybrid RAG to Graph -->
    <path d="M 356 144 L 392 144" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
    <!-- Graph to Grounding -->
    <path d="M 498 118 L 498 92" fill="none" stroke="#0369a1" stroke-width="1.4" marker-end="url(#arr)"/>
    <!-- Verifier to Guardrail -->
    <path d="M 602 64 L 638 64" fill="none" stroke="#047857" stroke-width="1.6" marker-end="url(#arr-ok)"/>
    <!-- Guardrail to XML/Journal -->
    <path d="M 730 92 L 730 118" fill="none" stroke="#047857" stroke-width="1.6" marker-end="url(#arr-ok)"/>

    <!-- Node 1: ERP AP/AR Ingest -->
    <rect x="14" y="72" width="120" height="60" rx="3" fill="#ffffff" stroke="#1b4965" stroke-width="1.4"/>
    <rect x="14" y="72" width="120" height="16" rx="2" fill="#1b4965"/>
    <text x="20" y="83" font-size="8.5" font-weight="700" fill="#ffffff" font-family="ui-monospace,Consolas,monospace">ERP AP + e-FAKTUR</text>
    <text x="20" y="100" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Parser OCR &amp; NPWP</text>
    <text x="20" y="114" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">4.820 req · 38 ms</text>
    <text x="20" y="126" font-size="8.2" fill="#047857" font-family="ui-monospace,Consolas,monospace">NITKU 22-digit OK</text>

    <!-- Node 2A: .NET 9 Deterministic Rule Engine -->
    <rect x="170" y="34" width="186" height="60" rx="3" fill="#ffffff" stroke="#1b4965" stroke-width="1.6"/>
    <rect x="170" y="34" width="186" height="16" rx="2" fill="#e7f0f5"/>
    <text x="177" y="45" font-size="8.5" font-weight="700" fill="#123449" font-family="ui-monospace,Consolas,monospace">.NET 9 RULE ENGINE (FAST-PATH)</text>
    <text x="177" y="62" font-size="9.8" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Kalkulator Objek &amp; Tarif</text>
    <text x="177" y="75" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">3.335 hit · p50 18 ms · Rp 0 LLM</text>
    <text x="177" y="87" font-size="8.2" fill="#047857" font-family="ui-monospace,Consolas,monospace">PMK 141 · PP 34 · PMK 71 · TER</text>

    <!-- Node 2B: Python Hybrid RAG -->
    <rect x="170" y="114" width="186" height="60" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1.3"/>
    <rect x="170" y="114" width="186" height="16" rx="2" fill="#f1f5f9"/>
    <text x="177" y="125" font-size="8.5" font-weight="700" fill="#334155" font-family="ui-monospace,Consolas,monospace">PYTHON RAG (MULTI-HOP PMK)</text>
    <text x="177" y="142" font-size="9.8" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">BGE-M3 + BM25 + Rerank</text>
    <text x="177" y="155" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">1.485 kompleks · p95 642 ms</text>
    <text x="177" y="167" font-size="8.2" fill="#b45309" font-family="ui-monospace,Consolas,monospace">Kasus P3B, Mixed Contract, Sengketa</text>

    <!-- Node 3A: Citation Grounding Verifier -->
    <rect x="394" y="34" width="208" height="58" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.4"/>
    <rect x="394" y="34" width="208" height="16" rx="2" fill="#f0f9ff"/>
    <text x="401" y="45" font-size="8.5" font-weight="700" fill="#0369a1" font-family="ui-monospace,Consolas,monospace">CITATION GROUNDING VERIFIER</text>
    <text x="401" y="61" font-size="9.6" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Cek Pasal &amp; Anti-Halusinasi</text>
    <text x="401" y="74" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">Faithfulness: 98,6% · 42 ditolak</text>
    <text x="401" y="86" font-size="8.2" fill="#047857" font-family="ui-monospace,Consolas,monospace">Exact Pasal Span Match Wajib</text>

    <!-- Node 3B: PostgreSQL Statutory Graph -->
    <rect x="394" y="118" width="208" height="56" rx="3" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="394" y="118" width="208" height="16" rx="2" fill="#f1f5f9"/>
    <text x="401" y="129" font-size="8.5" font-weight="700" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">POSTGRESQL STATUTORY GRAPH</text>
    <text x="401" y="145" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">pgvector + Apache AGE Graph</text>
    <text x="401" y="158" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">1.482 Dok · 64.280 Pasal · 71 P3B</text>
    <text x="401" y="169" font-size="8.2" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">Korpus PMK v26.4 Terindeks</text>

    <!-- Node 4A: Guardrail Policy Gate -->
    <rect x="640" y="34" width="184" height="58" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.5"/>
    <rect x="640" y="34" width="184" height="16" rx="2" fill="#ecfdf5"/>
    <text x="647" y="45" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">POLICY GUARDRAIL GATE</text>
    <text x="647" y="61" font-size="9.5" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">5 Guardrail Deterministik</text>
    <text x="647" y="74" font-size="8.5" fill="#475569" font-family="ui-monospace,Consolas,monospace">110 intervensi · 0 tarif drift</text>
    <text x="647" y="86" font-size="8.2" fill="#047857" font-family="ui-monospace,Consolas,monospace">XSD v2.6.1 · DGT Expiry Lock</text>

    <!-- Node 4B: Output CoreTax XML & Audit -->
    <rect x="640" y="118" width="184" height="56" rx="3" fill="#1b4965" stroke="#123449" stroke-width="1.2"/>
    <text x="649" y="135" font-size="8.5" font-weight="700" fill="#9bd0ea" font-family="ui-monospace,Consolas,monospace">OUTPUT SIAP AUDITOR</text>
    <text x="649" y="150" font-size="9.8" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">CoreTax XML + Jurnal AP</text>
    <text x="649" y="164" font-size="8.4" fill="#dbeaf2" font-family="ui-monospace,Consolas,monospace">WORM SHA-256 · Kertas Kerja</text>
  </svg>`;

  const waterfallSvg = svgSpanWaterfall({
    width: 780,
    totalMs: 650,
    spans: [
      { label: '1. OCR & Parser e-Faktur', start: 0, dur: 44, color: '#475569' },
      { label: '2. Validasi NPWP16/DGT', start: 44, dur: 62, color: '#0369a1' },
      { label: '3. .NET 9 Rule Engine', start: 106, dur: 22, color: '#1b4965' },
      { label: '4. Hybrid RAG (PG Graph)', start: 128, dur: 174, color: '#0f766e' },
      { label: '5. LLM Legal Synthesis', start: 302, dur: 256, color: '#b45309' },
      { label: '6. Grounding & XSD Gate', start: 558, dur: 60, color: '#047857' },
    ],
  });

  const telemetryChart = svgMultiLineChart({
    width: 580,
    height: 196,
    xLabels: ['11 Nov', '12 Nov', '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
    yMin: 0,
    yMax: 950,
    yTicks: 5,
    yUnit: 'ms',
    threshold: { value: 800, label: 'SLA P95 <= 800 ms', color: '#be123c' },
    series: [
      { label: 'Latensi P95 Hybrid RAG', color: '#1b4965', values: [690, 715, 678, 742, 665, 632, 658, 710, 684, 651, 648, 642], area: true, dots: true },
      { label: 'Latensi P50 Median', color: '#047857', values: [270, 282, 265, 290, 261, 248, 255, 268, 259, 252, 250, 248], dots: true },
      { label: 'Fast-Path .NET 9 (x10)', color: '#0369a1', values: [190, 185, 180, 195, 182, 176, 178, 184, 180, 178, 175, 180], dashed: true },
    ],
    annotations: [{ index: 3, seriesIdx: 0, label: 'Re-index PMK 131', color: '#b45309', dy: -24 }],
  });

  const wfRows = AGENT_WORKFLOWS.map((w) => {
    const pct = (w.costIdr / w.budgetIdr) * 100;
    return `<tr>
      <td style="font-weight:600;color:#0f172a;">${esc(w.name)}</td>
      <td class="mono num">${fmtNum(w.req)}</td>
      <td class="mono num" style="color:#1b4965;font-weight:700;">${fmtPct(w.fastPathPct)}</td>
      <td class="mono num">${w.tokM.toFixed(1).replace('.', ',')}M</td>
      <td class="mono num" style="font-weight:700;">${fmtNum(w.costIdr)}</td>
      <td>${renderCapacityBar(pct, { warnAt: 78, critAt: 92 })}</td>
    </tr>`;
  }).join('');

  const guardRows = GUARDRAILS.map(
    (g) => `<tr>
      <td class="mono" style="font-weight:700;color:#1b4965;">${esc(g.id)}</td>
      <td style="font-weight:700;color:#0f172a;">${esc(g.name)}</td>
      <td style="color:#475569;">${esc(g.rule)}</td>
      <td class="mono num" style="font-weight:700;color:#b45309;">${fmtNum(g.blocked)}</td>
      <td class="mono num" style="font-weight:700;color:#047857;">${fmtPct(g.passRate)}</td>
      <td>${badge('Enforced', g.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `
    ${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 1fr;gap:9px;">
      <!-- LEFT: AGENT PIPELINE DAG + TRACE WATERFALL -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 auto;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 13, '#1b4965')}<span>Topologi Orkestrasi Agent (Deterministic .NET 9 + Python RAG)</span></div>
            <div style="display:flex;gap:5px;">${badge('Zero Tariff Hallucination', 'ok')}${badge('Hybrid Routing', 'accent')}</div>
          </div>
          <div class="e-panel-body" style="padding:7px 9px;">${dagSvg}</div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#1b4965')}<span>Trace Span Waterfall · trc_pjk_8841a (TX-02 CloudStack SG · 618 ms)</span></div>
            <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">HTTP 200 · 4 Sitasi PMK/P3B</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            ${waterfallSvg}
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid #e2e8f0;font-size:10px;color:#475569;">
              <span><strong>Retriever:</strong> Top-8 chunk (PMK 81/2024, PER-25/PJ/2018, P3B RI-SG Ps. 7 &amp; 12)</span>
              <span class="mono" style="color:#1b4965;font-weight:700;">Cost: Rp 4.180 · 6.240 tok</span>
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT: TELEMETRY CHART + TOKEN COST IDR ATTRIBUTION -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 auto;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('cpu', 13, '#1b4965')}<span>Telemetri Latensi Pipeline &amp; Re-Index Korpus (12 Hari)</span></div>
            <span class="mono" style="font-size:9.5px;color:#64748b;">WIB · 24h Window</span>
          </div>
          <div class="e-panel-body" style="padding:6px 9px;">${telemetryChart}</div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('database', 13, '#1b4965')}<span>Atribusi Token &amp; Biaya Inferensi (IDR · MTD Nov 2026)</span></div>
            <span class="mono" style="font-size:9.5px;color:#1b4965;font-weight:700;">Pagu Rp 25,0 Jt</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:206px;">Alur Kerja Agent</th>
                  <th class="num" style="width:50px;">Req</th>
                  <th class="num" style="width:62px;">Fast-Path</th>
                  <th class="num" style="width:50px;">Token</th>
                  <th class="num" style="width:80px;">Biaya (IDR)</th>
                  <th style="width:106px;">Serapan Pagu</th>
                </tr>
              </thead>
              <tbody>${wfRows}</tbody>
              <tfoot>
                <tr>
                  <td class="mono">TOTAL MTD NOV 2026</td>
                  <td class="mono num">${fmtNum(TOTAL_AGENT_REQ)}</td>
                  <td class="mono num">69,2%</td>
                  <td class="mono num">${TOTAL_AGENT_TOKM.toFixed(1).replace('.', ',')}M</td>
                  <td class="mono num" style="color:#1b4965;">${fmtNum(TOTAL_AGENT_COST)}</td>
                  <td class="mono">73,7% Pagu</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d5dde5;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#475569;">
              <span><strong>Routing Model:</strong> Qwen2.5-72B Sovereign JKT (Rp 0) + Claude 3.7 Sonnet (PII-Redacted)</span>
              <span class="mono" style="color:#047857;font-weight:700;">Hemat 69,2% via .NET 9</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- BOTTOM: DETERMINISTIC GUARDRAILS MATRIX -->
    <section class="e-panel" style="flex:0 0 auto;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#047857')}<span>Policy Guardrails &amp; Anti-Halusinasi Regulasi (5 Aturan Wajib)</span></div>
        <span class="mono" style="font-size:9.5px;color:#475569;">Total Intervensi MTD: <strong>${TOTAL_GUARD_BLOCKED} kasus</strong> · Zero Uncited Tariff Pass</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:70px;">ID</th>
              <th style="width:230px;">Nama Guardrail</th>
              <th>Kebijakan Enforced (.NET 9 + Citation Gate)</th>
              <th class="num" style="width:92px;">Intervensi</th>
              <th class="num" style="width:86px;">Pass Rate</th>
              <th style="width:92px;">Mode</th>
            </tr>
          </thead>
          <tbody>${guardRows}</tbody>
        </table>
      </div>
    </section>
  `;

  return renderShell({
    activeTab: 'p2',
    pageTitle: 'Orkestrasi Agent RAG & Evaluasi Sitasi PMK',
    subMeta: 'Kontrol operasional pipeline hibrida .NET 9 Rule Engine + Python RAG, evaluasi grounding & atribusi biaya token IDR',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#334155')} Jalankan Suite Evaluasi (482)</span>
      <span class="e-btn e-btn-primary">${ic('terminal', 11, '#ffffff')} Buka Trace Explorer</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3: SIMULATOR PPh 26 LINTAS NEGARA & TAX TREATY (FORM DGT)
// ============================================================================
function renderPage3() {
  const tx02Dpp = 1343000000;
  const scenA = Math.round(tx02Dpp * 0.2); // 268.600.000
  const scenB = 0; // 0% with valid Form DGT (Business Profits)
  const scenC = Math.round(tx02Dpp * 0.08); // 107.440.000 (Royalty SG 8%)

  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total DPP Lintas Negara (10 Kontrak)</span>${badge('Kurs KMK', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;">${fmtIdr(TREATY_DPP_SUM)}</span></div>
      <div class="e-kpi-foot"><span>8 Yurisdiksi P3B Aktif</span><span class="mono">Masa Nov 2026</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>PPh 26 Terutang Saat Ini</span>${badge('2 Hold DGT', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;color:#b45309;">${fmtIdr(TREATY_APPLIED_PPH)}</span></div>
      <div class="e-kpi-foot"><span>Tanpa P3B (20%): ${fmtIdr(TREATY_DOM_PPH)}</span><span class="mono">Tarif Ef. ${fmtPct((TREATY_APPLIED_PPH / TREATY_DPP_SUM) * 100)}</span></div>
    </div>
    <div class="e-kpi" style="border-color:#a7f3d0;background:#f5fdf9;">
      <div class="e-kpi-top"><span>Penghematan P3B Terealisasi</span>${badge('8 DGT Valid', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;color:#047857;">${fmtIdr(TREATY_REALIZED_SAVE)}</span></div>
      <div class="e-kpi-foot"><span>Sesuai PER-25/PJ/2018</span><span class="mono" style="color:#047857;font-weight:700;">Audit-Ready</span></div>
    </div>
    <div class="e-kpi" style="border-color:#fde68a;background:#fffdf5;">
      <div class="e-kpi-top"><span>Potensi Hemat Tambahan (2 Hold)</span>${badge('Aksi Prioritas', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;color:#1b4965;">${fmtIdr(TREATY_POTENTIAL_ADD)}</span></div>
      <div class="e-kpi-foot"><span>TX-02 (SG) + CB-06 (GB)</span><span class="mono">Batas 28 Nov</span></div>
    </div>
  </div>`;

  const pptChecks = [
    { item: 'Part I — Identitas WPLN & Negara Domisili (Singapura)', state: 'Lolos', tone: 'ok' },
    { item: 'Part II — Pengesahan Otoritas Pajak IRAS (COD Valid <= 12 Bln)', state: 'Menunggu Unggah', tone: 'warn' },
    { item: 'Part III — Uji Beneficial Ownership (Bukan Conduit / Agen)', state: 'Lolos', tone: 'ok' },
    { item: 'Part IV — Uji Principal Purpose Test (Substansi Ekonomi Nyata)', state: 'Lolos', tone: 'ok' },
    { item: 'Time Test BUT P3B RI-SG (Kehadiran Fisik 0 Hari < 90 Hari)', state: 'Non-BUT', tone: 'ok' },
    { item: 'Rekonsiliasi PPN JLN 11% (NTPN Setor Sendiri Ps. 4(1)e)', state: 'Siap Billing', tone: 'info' },
  ];

  const matrixRows = TREATY_MATRIX.map(
    (m) => `<tr class="${m.highlight ? 'is-selected' : ''}">
      <td><span class="mono" style="font-weight:700;color:#1b4965;margin-right:5px;">${esc(m.code)}</span><strong>${esc(m.country)}</strong></td>
      <td class="mono" style="color:#047857;font-weight:700;">${esc(m.jasa)}</td>
      <td class="mono">${esc(m.royalti)}</td>
      <td class="mono">${esc(m.bunga)}</td>
      <td class="mono">${esc(m.dividen)}</td>
      <td class="mono num" style="font-weight:700;">${m.active}</td>
    </tr>`
  ).join('');

  const contractRows = TREATY_CONTRACTS.map((c) => {
    const pphNow = Math.round((c.dpp * c.appliedRate) / 100);
    const saveNow = Math.round((c.dpp * (c.domRate - c.appliedRate)) / 100);
    const potAdd = Math.round((c.dpp * (c.appliedRate - c.treatyRate)) / 100);
    const trCls = c.selected ? 'is-warn' : c.tone === 'bad' ? 'is-bad' : '';
    return `<tr class="${trCls}">
      <td class="mono" style="font-weight:700;color:#1b4965;">${esc(c.code)}</td>
      <td style="font-weight:600;color:#0f172a;">${esc(c.vendor)}</td>
      <td>${esc(c.country)}</td>
      <td style="color:#475569;">${esc(c.p3bArt)}</td>
      <td class="mono" style="font-weight:700;">${esc(c.objCode)}</td>
      <td class="mono num">${fmtNum(c.dpp)}</td>
      <td class="mono num">${fmtPct(c.treatyRate)}</td>
      <td class="mono num" style="font-weight:700;color:${c.appliedRate === 20 ? '#be123c' : '#047857'};">${fmtPct(c.appliedRate)}</td>
      <td class="mono num" style="font-weight:700;">${fmtNum(pphNow)}</td>
      <td class="mono num" style="color:#047857;font-weight:600;">${saveNow > 0 ? fmtNum(saveNow) : '—'}</td>
      <td class="mono num" style="color:${potAdd > 0 ? '#b45309' : '#94a3b8'};font-weight:${potAdd > 0 ? '700' : '500'};">${potAdd > 0 ? '+' + fmtNum(potAdd) : '—'}</td>
      <td>${badge(c.dgtStatus, c.tone)}</td>
    </tr>`;
  }).join('');

  const contentHtml = `
    ${kpiHtml}
    <!-- TOP SPLIT: SCENARIO SIMULATOR (LEFT) + P3B JURISDICTION MATRIX (RIGHT) -->
    <div style="display:grid;grid-template-columns:1.22fr 1fr;gap:9px;flex:0 0 auto;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#1b4965')}<span>Simulator Skenario PPh 26 · TX-02 CloudStack Asia Pte. Ltd. (SG)</span></div>
          <span class="mono" style="font-size:9.8px;color:#475569;">USD 85.000 x Kurs KMK Rp 15.800 = <strong>Rp 1.343.000.000</strong></span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <!-- 3 Side-by-Side Scenarios -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
            <div style="border:1px solid #fecdd3;background:#fff7f8;border-radius:3px;padding:7px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.8px;font-weight:700;color:#9f1239;">SKENARIO A · TANPA DGT</span>
                ${badge('Aktif Hold', 'bad')}
              </div>
              <div style="font-size:10px;color:#475569;margin-top:3px;">UU PPh Ps. 26 Domestik (20%)</div>
              <div class="mono" style="font-size:14px;font-weight:800;color:#be123c;margin-top:4px;">${fmtIdr(scenA)}</div>
              <div style="font-size:9.4px;color:#64748b;margin-top:3px;">Risiko gross-up kontrak USD 17.000</div>
            </div>

            <div style="border:1.5px solid #047857;background:#f0fdf7;border-radius:3px;padding:7px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.8px;font-weight:700;color:#065f46;">SKENARIO B · P3B PS. 7</span>
                ${badge('Target Optimal', 'ok')}
              </div>
              <div style="font-size:10px;color:#334155;margin-top:3px;">Form DGT Valid · Non-BUT (0%)</div>
              <div class="mono" style="font-size:14px;font-weight:800;color:#047857;margin-top:4px;">${fmtIdr(scenB)}</div>
              <div style="font-size:9.4px;color:#047857;font-weight:700;margin-top:3px;">Hemat Pajak: ${fmtIdr(scenA)}</div>
            </div>

            <div style="border:1px solid #d5dde5;background:#f8fafc;border-radius:3px;padding:7px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9.8px;font-weight:700;color:#334155;">SKENARIO C · ROYALTI</span>
                ${badge('P3B Ps. 12', 'neutral')}
              </div>
              <div style="font-size:10px;color:#475569;margin-top:3px;">Jika Lisensi Hak Cipta (8%)</div>
              <div class="mono" style="font-size:14px;font-weight:800;color:#1b4965;margin-top:4px;">${fmtIdr(scenC)}</div>
              <div style="font-size:9.4px;color:#64748b;margin-top:3px;">Hemat vs Domestik: ${fmtIdr(scenA - scenC)}</div>
            </div>
          </div>

          <!-- PER-25/PJ/2018 PPT & BO Checklist -->
          <div style="border:1px solid #d5dde5;border-radius:3px;padding:7px 9px;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
              <span style="font-size:10.2px;font-weight:700;color:#123449;">Checklist Substansi Form DGT (PER-25/PJ/2018 · Uji BO &amp; PPT)</span>
              <span class="mono" style="font-size:9.5px;color:#b45309;font-weight:700;">5/6 Terpenuhi · Butuh Pengesahan IRAS</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;">
              ${pptChecks
                .map(
                  (chk) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px dashed #e2e8f0;font-size:10px;">
                    <span class="trunc" style="color:#334155;">${esc(chk.item)}</span>
                    ${badge(chk.state, chk.tone)}
                  </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="pc-rule-box" style="padding:6px 9px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;">
            <span style="font-size:9.8px;color:#123449;"><strong>Rekomendasi Agent P3B:</strong> Tahan pembayaran bersih <strong>TX-02</strong> hingga IRAS COD &amp; DGT Part II diterima (H-6) untuk menghemat <strong>Rp 268.600.000</strong>.</span>
            ${badge('PER-25/PJ/2018', 'accent')}
          </div>
        </div>
      </section>

      <!-- RIGHT: P3B TREATY RATE MATRIX -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#1b4965')}<span>Matriks Tarif P3B (8 Yurisdiksi Vendor Aktif vs Domestik 20%)</span></div>
          ${badge('71 P3B Terindeks', 'info')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:138px;">Negara Mitra P3B</th>
                <th style="width:100px;">Jasa / Laba</th>
                <th style="width:76px;">Royalti</th>
                <th style="width:70px;">Bunga</th>
                <th style="width:78px;">Dividen</th>
                <th class="num" style="width:52px;">Kontrak</th>
              </tr>
            </thead>
            <tbody>${matrixRows}</tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- BOTTOM: 10-ROW CROSS-BORDER CONTRACT REGISTER -->
    <section class="e-panel" style="flex:1;min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#1b4965')}<span>Register Kontrak Lintas Negara &amp; Validitas Form DGT (Masa Nov 2026)</span></div>
        <div style="display:flex;gap:5px;">
          ${badge('8 DGT Valid', 'ok')}
          ${badge('1 Menunggu DGT', 'warn')}
          ${badge('1 COD Expired', 'bad')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table p3-grid">
          <thead>
            <tr>
              <th style="width:52px;">Kode</th>
              <th style="width:188px;">Vendor Luar Negeri (WPLN)</th>
              <th style="width:104px;">Yurisdiksi</th>
              <th style="width:134px;">Dasar P3B</th>
              <th style="width:74px;">Kode Objek</th>
              <th class="num" style="width:106px;">DPP (IDR)</th>
              <th class="num" style="width:62px;">Tarif P3B</th>
              <th class="num" style="width:64px;">Diterapkan</th>
              <th class="num" style="width:94px;">PPh 26 Kini</th>
              <th class="num" style="width:94px;">Hemat P3B</th>
              <th class="num" style="width:94px;">Potensi Add</th>
              <th style="width:98px;">Status DGT</th>
            </tr>
          </thead>
          <tbody>${contractRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="mono">TOTAL 10 KONTRAK LINTAS NEGARA (PPh PASAL 26)</td>
              <td class="mono num">${fmtNum(TREATY_DPP_SUM)}</td>
              <td class="mono num">—</td>
              <td class="mono num">${fmtPct((TREATY_APPLIED_PPH / TREATY_DPP_SUM) * 100)}</td>
              <td class="mono num" style="color:#b45309;">${fmtNum(TREATY_APPLIED_PPH)}</td>
              <td class="mono num" style="color:#047857;">${fmtNum(TREATY_REALIZED_SAVE)}</td>
              <td class="mono num" style="color:#1b4965;">+${fmtNum(TREATY_POTENTIAL_ADD)}</td>
              <td>${badge('Rekon P5 OK', 'ok')}</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 11px;background:#f8fafc;border-top:1px solid #d5dde5;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;">
          <span class="mono">Kurs KMK 47/KM.10/2026: <strong>USD 15.800</strong> · <strong>SGD 11.790</strong> · <strong>EUR 17.120</strong> · <strong>GBP 20.140</strong> · <strong>JPY 103,40</strong></span>
          <span>Eskalasi otomatis portal vendor aktif H-14 sebelum batas lapor SPT Masa 20 Des 2026</span>
        </div>
      </div>
    </section>
  `;

  return renderShell({
    activeTab: 'p3',
    pageTitle: 'Simulator PPh 26 Lintas Negara & Pemanfaatan Tax Treaty (Form DGT)',
    subMeta: 'Analisis perbandingan tarif domestik 20% vs P3B, uji Beneficial Ownership & Principal Purpose Test PER-25/PJ/2018',
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 11, '#334155')} Kirim Permintaan DGT ke Vendor</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Memo P3B (PDF)</span>
    `,
    contentHtml,
    extraCss: `
      .p3-grid td { padding: 6.5px 7px !important; }
      .p3-grid tfoot td { padding: 7.5px 7px !important; }
    `,
  });
}

// ============================================================================
// PAGE 4: KORPUS REGULASI & GRAF PASAL PMK (STATUTORY GRAPH & REDLINE DIFF)
// ============================================================================
function renderPage4() {
  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Dokumen Regulasi Terindeks</span>${badge('PMK v26.4', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(CORPUS_TOTAL_DOCS)} <span style="font-size:11px;color:#64748b;">Dokumen</span></span></div>
      <div class="e-kpi-foot"><span>UU · PP · PMK · PER · 71 P3B</span><span class="mono" style="color:#047857;font-weight:700;">Sinkron 21 Nov</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Node Pasal &amp; Vektor Graf</span>${badge('PG Graph', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(CORPUS_TOTAL_CHUNKS)} <span style="font-size:11px;color:#64748b;">Pasal</span></span></div>
      <div class="e-kpi-foot"><span>18.420 Relasi Rujukan Silang</span><span class="mono">pgvector + AGE</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Regresi Rule Engine (.NET 9)</span>${badge('100% Hijau', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">2.134 / 2.134</span></div>
      <div class="e-kpi-foot"><span>9 Perubahan Aturan 2024-2026</span><span class="mono">Zero Breaking</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Pembaruan Terakhir DJP</span>${badge('XSD v2.6.1', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15px;">PMK 81 &amp; 131/2024</span></div>
      <div class="e-kpi-foot"><span>Wajib NITKU 22-Digit Cabang</span><span class="mono">168 Faktur Cek</span></div>
    </div>
  </div>`;

  // PostgreSQL Statutory Citation Dependency Graph (SVG 620 x 258)
  const graphSvg = `<svg viewBox="0 0 620 258" width="100%" height="258" style="display:block;">
    <defs>
      <marker id="garr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
      </marker>
      <marker id="garr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#1b4965"/>
      </marker>
    </defs>

    <!-- Background subtle grid dots -->
    <rect x="0" y="0" width="620" height="258" fill="#fafcfe" rx="3" stroke="#e2e8f0"/>

    <!-- Connecting Edges -->
    <path d="M 142 128 L 194 52" fill="none" stroke="#1b4965" stroke-width="1.5" marker-end="url(#garr-b)"/>
    <path d="M 142 128 L 194 128" fill="none" stroke="#1b4965" stroke-width="1.6" marker-end="url(#garr-b)"/>
    <path d="M 142 128 L 194 206" fill="none" stroke="#64748b" stroke-width="1.4" marker-end="url(#garr)"/>

    <path d="M 378 52 L 430 42" fill="none" stroke="#0369a1" stroke-width="1.4" marker-end="url(#garr)"/>
    <path d="M 378 52 L 430 100" fill="none" stroke="#1b4965" stroke-width="1.5" marker-end="url(#garr-b)"/>
    <path d="M 378 128 L 430 100" fill="none" stroke="#1b4965" stroke-width="1.5" marker-end="url(#garr-b)"/>
    <path d="M 378 128 L 430 162" fill="none" stroke="#047857" stroke-width="1.4" marker-end="url(#garr)"/>
    <path d="M 378 206 L 430 220" fill="none" stroke="#b45309" stroke-width="1.4" marker-end="url(#garr)"/>

    <!-- Edge labels -->
    <text x="150" y="76" font-size="7.8" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">amanat</text>
    <text x="152" y="123" font-size="7.8" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">tarif</text>
    <text x="150" y="185" font-size="7.8" fill="#64748b" font-family="ui-monospace,Consolas,monospace">P3B</text>
    <text x="383" y="92" font-size="7.8" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">map XML</text>

    <!-- Root Statutory Node -->
    <rect x="12" y="94" width="130" height="68" rx="3" fill="#1b4965" stroke="#123449" stroke-width="1.5"/>
    <text x="20" y="110" font-size="8.2" font-weight="700" fill="#9bd0ea" font-family="ui-monospace,Consolas,monospace">STATUTA INDUK</text>
    <text x="20" y="126" font-size="10.5" font-weight="800" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">UU HPP 7/2021</text>
    <text x="20" y="140" font-size="8.4" fill="#dbeaf2" font-family="ui-monospace,Consolas,monospace">UU KUP · PPh · PPN</text>
    <text x="20" y="153" font-size="8" fill="#9bd0ea" font-family="ui-monospace,Consolas,monospace">48 Dok · 4.820 Pasal</text>

    <!-- Mid Layer: Implementing Regulations -->
    <rect x="196" y="20" width="182" height="62" rx="3" fill="#ffffff" stroke="#1b4965" stroke-width="1.6"/>
    <rect x="196" y="20" width="182" height="15" rx="2" fill="#e7f0f5"/>
    <text x="203" y="30.5" font-size="8" font-weight="700" fill="#123449" font-family="ui-monospace,Consolas,monospace">IMPLEMENTASI CORETAX</text>
    <text x="203" y="47" font-size="9.8" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">PMK 81/2024 &amp; PMK 131/2024</text>
    <text x="203" y="60" font-size="8.3" fill="#475569" font-family="ui-monospace,Consolas,monospace">Unifikasi 9-Digit · DPP 11/12</text>
    <text x="203" y="73" font-size="8" fill="#047857" font-family="ui-monospace,Consolas,monospace">Aktif Efektif 1 Jan 2025/2026</text>

    <rect x="196" y="96" width="182" height="62" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.4"/>
    <rect x="196" y="96" width="182" height="15" rx="2" fill="#ecfdf5"/>
    <text x="203" y="106.5" font-size="8" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">PEMOTONGAN DOMESTIK</text>
    <text x="203" y="123" font-size="9.8" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">PMK 141/2015 · PP 34 · TER</text>
    <text x="203" y="136" font-size="8.3" fill="#475569" font-family="ui-monospace,Consolas,monospace">62 Jenis Jasa · Sewa · Konstruksi</text>
    <text x="203" y="149" font-size="8" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">PMK 168/2023 · PMK 71/2022</text>

    <rect x="196" y="174" width="182" height="62" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="1.4"/>
    <rect x="196" y="174" width="182" height="15" rx="2" fill="#fffbeb"/>
    <text x="203" y="184.5" font-size="8" font-weight="700" fill="#b45309" font-family="ui-monospace,Consolas,monospace">LINTAS NEGARA &amp; TREATY</text>
    <text x="203" y="201" font-size="9.8" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">PER-25/PJ/2018 + 71 P3B</text>
    <text x="203" y="214" font-size="8.3" fill="#475569" font-family="ui-monospace,Consolas,monospace">Form DGT · Uji BO &amp; PPT</text>
    <text x="203" y="227" font-size="8" fill="#b45309" font-family="ui-monospace,Consolas,monospace">Override Tarif Ps. 26 (20%)</text>

    <!-- Right Layer: CoreTax Object Codes -->
    <rect x="432" y="16" width="176" height="48" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.2"/>
    <text x="440" y="31" font-size="8.5" font-weight="700" fill="#0369a1" font-family="ui-monospace,Consolas,monospace">PPN · FP-010 / FP-040</text>
    <text x="440" y="44" font-size="9.2" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">DPP Nilai Lain 11/12 &amp; 1,1%</text>
    <text x="440" y="56" font-size="8" fill="#64748b" font-family="ui-monospace,Consolas,monospace">54 Faktur Masukan Masa Nov</text>

    <rect x="432" y="74" width="176" height="52" rx="3" fill="#e7f0f5" stroke="#1b4965" stroke-width="1.6"/>
    <text x="440" y="89" font-size="8.5" font-weight="800" fill="#123449" font-family="ui-monospace,Consolas,monospace">OBJEK 24-104-01 · PPh 23</text>
    <text x="440" y="102" font-size="9.2" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Jasa Konsultan &amp; Teknik (2%)</text>
    <text x="440" y="115" font-size="8" fill="#1b4965" font-family="ui-monospace,Consolas,monospace">64 Bupot · Auto-Map 100%</text>

    <rect x="432" y="136" width="176" height="50" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.2"/>
    <text x="440" y="151" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">OBJEK 28-403-02 · PPh 4(2)</text>
    <text x="440" y="164" font-size="9.2" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Sewa Tanah/Bangunan (10%)</text>
    <text x="440" y="176" font-size="8" fill="#64748b" font-family="ui-monospace,Consolas,monospace">22 Bupot · Konstruksi 2,65%</text>

    <rect x="432" y="196" width="176" height="50" rx="3" fill="#fffbeb" stroke="#b45309" stroke-width="1.3"/>
    <text x="440" y="211" font-size="8.5" font-weight="700" fill="#b45309" font-family="ui-monospace,Consolas,monospace">OBJEK 27-104-01 · PPh 26</text>
    <text x="440" y="224" font-size="9.2" font-weight="700" fill="#0f172a" font-family="Segoe UI,system-ui,sans-serif">Jasa &amp; Royalti LN (0%-20%)</text>
    <text x="440" y="236" font-size="8" fill="#92400e" font-family="ui-monospace,Consolas,monospace">10 Kontrak · 2 Hold DGT</text>
  </svg>`;

  const corpusListHtml = CORPUS_COLLECTIONS.map(
    (c) => `<div style="padding:9px 9px;border-bottom:1px solid #e6ebf1;background:${c.selected ? '#e7f0f5' : '#ffffff'};${c.selected ? 'box-shadow:inset 2.5px 0 0 #1b4965;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
        <span class="mono" style="font-size:9.2px;font-weight:700;color:#1b4965;">${esc(c.id)}</span>
        ${badge(c.status, c.tone)}
      </div>
      <div style="font-size:10.6px;font-weight:700;color:#0f172a;margin-top:2px;line-height:1.3;">${esc(c.name)}</div>
      <div class="mono" style="display:flex;justify-content:space-between;font-size:9.2px;color:#64748b;margin-top:3px;">
        <span>${fmtNum(c.docs)} dok · ${fmtNum(c.chunks)} pasal</span>
        <span>${esc(c.updated)}</span>
      </div>
    </div>`
  ).join('');

  const impactRows = RULE_IMPACTS.map(
    (r) => `<tr>
      <td class="mono" style="font-weight:700;color:#1b4965;">${esc(r.reg)}</td>
      <td>
        <div class="trunc" style="font-weight:600;color:#0f172a;">${esc(r.change)}</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">GL: ${esc(r.gl)}</div>
      </td>
      <td class="mono num" style="font-weight:700;">${fmtNum(r.affectedInv)}</td>
      <td class="mono num" style="color:#047857;font-weight:700;">${esc(r.testPass)}</td>
      <td>${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `
    ${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:284px 1.15fr 1.08fr;gap:9px;">
      <!-- LEFT: STATUTORY CORPUS TREE -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#1b4965')}<span>Korpus PMK v26.4 (8 Klaster)</span></div>
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">1.482 Dok</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div>${corpusListHtml}</div>
          <div style="padding:7px 9px;background:#eef2f7;border-top:1px solid #b8c4d0;display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:9.6px;font-weight:700;color:#123449;">
            <span>TOTAL KORPUS</span>
            <span>${fmtNum(CORPUS_TOTAL_DOCS)} dok · ${fmtNum(CORPUS_TOTAL_CHUNKS)} pasal</span>
          </div>
        </div>
      </section>

      <!-- CENTER: STATUTORY DEPENDENCY GRAPH + REDLINE REGULATORY DIFF -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 auto;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 13, '#1b4965')}<span>Graf Dependensi Regulasi (PostgreSQL Statutory Graph)</span></div>
            <span class="mono" style="font-size:9.5px;color:#64748b;">UU HPP -&gt; PMK -&gt; Kode CoreTax</span>
          </div>
          <div class="e-panel-body" style="padding:7px 9px;">${graphSvg}</div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#1b4965')}<span>Redline Diff Transisi: e-Bupot Legacy (2024) -&gt; CoreTax DJP (2026)</span></div>
            ${badge('PMK 81/2024 + PMK 131/2024', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;justify-content:space-between;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:0;">
              <div style="border:1px solid #fecdd3;background:#fff8f9;border-radius:3px;padding:8px 9px;display:flex;flex-direction:column;gap:5px;">
                <div style="font-size:9.6px;font-weight:700;color:#9f1239;border-bottom:1px solid #fecdd3;padding-bottom:4px;">SEBELUM (DJP ONLINE / LEGACY 2024)</div>
                <div class="mono" style="font-size:9.6px;color:#881337;line-height:1.6;">
                  - Identitas WP: NPWP 15-Digit terpisah<br/>
                  - Kode Jasa Konsultan: 24-104-01 (CSV)<br/>
                  - PPN Umum: 11% x Nilai Kontrak<br/>
                  - PPh 21 Ahli: Hitung manual kumulatif<br/>
                  - Validasi DGT: Unggah PDF per masa<br/>
                  - Cabang PKP: Nomor NPWP cabang<br/>
                  - Bukti Potong: Kirim manual via email<br/>
                  - PPN JLN: Input NTPN manual di SPT
                </div>
              </div>
              <div style="border:1px solid #a7f3d0;background:#f4fdf8;border-radius:3px;padding:8px 9px;display:flex;flex-direction:column;gap:5px;">
                <div style="font-size:9.6px;font-weight:700;color:#065f46;border-bottom:1px solid #a7f3d0;padding-bottom:4px;">SESUDAH (CORETAX DJP 2026 · AKTIF)</div>
                <div class="mono" style="font-size:9.6px;color:#064e3b;line-height:1.6;">
                  + Identitas WP: NPWP 16-Digit / NIK<br/>
                  + Skema Lapor: XML XSD v2.6.1 Unifikasi<br/>
                  + PPN Non-Mewah: 12% x (11/12 DPP)<br/>
                  + PPh 21 Ahli: 50% Bruto x Ps. 17 (PMK 168)<br/>
                  + Validasi DGT: Tautan ID e-DGT aktif<br/>
                  + Cabang PKP: NITKU 22-Digit terpusat<br/>
                  + Bukti Potong: Auto-prepopulated DJP<br/>
                  + PPN JLN: Sinkron otomatis kode billing
                </div>
              </div>
            </div>
            <div class="pc-rule-box" style="padding:6px 8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10px;color:#123449;"><strong>Dampak Otomatis Rule Engine:</strong> Rumus DPP Nilai Lain <code>11/12</code> diterapkan pada 112 faktur non-mewah; faktur JPT tetap <code>1,1%</code> (PMK 71/2022).</span>
              ${badge('Terverifikasi', 'ok')}
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT: RULE IMPACT & REGRESSION REGISTER -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#1b4965')}<span>Register Dampak Aturan &amp; Uji Regresi</span></div>
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">2.134 Uji Lulus</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p4-grid">
            <thead>
              <tr>
                <th style="width:94px;">Regulasi</th>
                <th>Perubahan &amp; Akun GL Terdampak</th>
                <th class="num" style="width:48px;">Faktur</th>
                <th class="num" style="width:62px;">Regresi</th>
                <th style="width:58px;">Status</th>
              </tr>
            </thead>
            <tbody>${impactRows}</tbody>
          </table>
          <div style="padding:9px 10px;border-top:1px solid #d5dde5;background:#f8fafc;display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10.5px;font-weight:700;color:#123449;">Sinkronisasi Referensi CoreTax DJP</span>
              ${badge('Auto-Sync 04:00 WIB', 'ok')}
            </div>
            <div class="pc-kv"><span class="pc-kv-lbl">Tabel Kode Objek Pajak Unifikasi</span><span class="pc-kv-val mono">148 Kode · v2026.4</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">Tabel Kurs KMK Mingguan</span><span class="pc-kv-val mono">KMK 47/KM.10/2026</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">Daftar PKP &amp; SBU Konstruksi LPJK</span><span class="pc-kv-val mono">Live API Cache 12j</span></div>
            <div class="pc-kv" style="border-bottom:0;"><span class="pc-kv-lbl">Snapshot Hash Korpus</span><span class="pc-kv-val mono" style="color:#1b4965;">pmk26.4-9a7e4c1</span></div>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeTab: 'p4',
    pageTitle: 'Korpus Regulasi & Graf Pasal UU HPP / PMK',
    subMeta: 'Indeks vektor & graf relasi pasal UU HPP, PMK 81/2024 CoreTax, PMK 131/2024, PPh 21 TER, serta uji regresi rule engine',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#334155')} Sinkron JDIH Kemenkeu</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Uji Regresi Rule Engine</span>
    `,
    contentHtml,
    extraCss: `.p4-grid td { padding: 6px 6px !important; }`,
  });
}

// ============================================================================
// PAGE 5: KERTAS KERJA POSISI PAJAK & EKSPOR CORETAX XML (AUDIT CONSOLE)
// ============================================================================
function renderPage5() {
  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total PPh Dipotong (Masa Nov)</span>${badge('114 Bupot', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;color:#1b4965;">${fmtIdr(RECON_PPH_TOTAL)}</span></div>
      <div class="e-kpi-foot"><span>PPh 23 · 4(2) · 26 · 21 TER</span><span class="mono">Selisih GL: Rp 0</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total PPN Masukan Dikreditkan</span>${badge('54 Faktur', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15.5px;">${fmtIdr(RECON_PPN_TOTAL)}</span></div>
      <div class="e-kpi-foot"><span>Reguler 11% + JPT 1,1%</span><span class="mono">e-Faktur Valid</span></div>
    </div>
    <div class="e-kpi" style="border-color:#a7f3d0;background:#f5fdf9;">
      <div class="e-kpi-top"><span>Rekonsiliasi Buku Besar vs CoreTax</span>${badge('168/168 Cocok', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">Rp 0 <span style="font-size:11px;font-weight:600;">Selisih</span></span></div>
      <div class="e-kpi-foot"><span>Equalisasi GL AP &amp; Biaya Jasa</span><span class="mono" style="color:#047857;font-weight:700;">100,0% Match</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kesiapan Ekspor CoreTax XML</span>${badge('XSD v2.6.1', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">166 Siap <span style="font-size:11px;color:#64748b;">/ 2 Hold</span></span></div>
      <div class="e-kpi-foot"><span>Menunggu DGT TX-02 &amp; CB-06</span><span class="mono">Batas 20 Des</span></div>
    </div>
  </div>`;

  const reconRows = TAX_RECON.map((r) => {
    const diff = r.glDpp - r.ctDpp;
    return `<tr>
      <td style="font-weight:600;color:#0f172a;">${esc(r.kind)}</td>
      <td class="mono" style="color:#1b4965;font-weight:700;">${esc(r.objGroup)}</td>
      <td class="mono num">${fmtNum(r.count)}</td>
      <td class="mono num">${fmtNum(r.glDpp)}</td>
      <td class="mono num">${fmtNum(r.ctDpp)}</td>
      <td class="mono num" style="color:#047857;font-weight:700;">${fmtNum(diff)}</td>
      <td class="mono num" style="font-weight:700;color:#0f172a;">${fmtNum(r.taxAmt)}</td>
      <td>${badge(r.xsd, r.tone)}</td>
    </tr>`;
  }).join('');

  const stackedChart = svgStackedBarChart({
    width: 780,
    height: 222,
    categories: ['Jun 26', 'Jul 26', 'Agt 26', 'Sep 26', 'Okt 26', 'Nov 26'],
    yMax: 950,
    yFormat: (v) => `${Math.round(v)} Jt`,
    series: [
      { label: 'PPh 26 Lintas Negara', color: '#1b4965', values: [390, 420, 385, 440, 412, 528] },
      { label: 'PPh 4(2) Final', color: '#0369a1', values: [185, 198, 210, 195, 224, 214] },
      { label: 'PPh 23 Jasa & Sewa', color: '#047857', values: [68, 74, 72, 81, 76, 79] },
      { label: 'PPh 21 TER Ahli', color: '#b45309', values: [16, 18, 17, 21, 19, 19] },
    ],
  });

  const xmlSnippet = `&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;UnifikasiBatch xmlns="urn:djp:coretax:unifikasi:v2.6.1"&gt;
  &lt;Header&gt;
    &lt;NPWP16&gt;0012841050190000&lt;/NPWP16&gt;
    &lt;NITKU&gt;0012841050190000000001&lt;/NITKU&gt;
    &lt;MasaPajak&gt;2026-11&lt;/MasaPajak&gt;
    &lt;TotalBuktiPotong&gt;114&lt;/TotalBuktiPotong&gt;
    &lt;TotalPPhDipotong&gt;${RECON_PPH_TOTAL}&lt;/TotalPPhDipotong&gt;
  &lt;/Header&gt;
  &lt;BuktiPotong id="TX-01" status="VALIDATED"&gt;
    &lt;NPWPLawan&gt;0013482910412000&lt;/NPWPLawan&gt;
    &lt;KodeObjekPajak&gt;24-104-01&lt;/KodeObjekPajak&gt;
    &lt;DasarPengenaanPajak&gt;450000000&lt;/DasarPengenaanPajak&gt;
    &lt;TarifPersen&gt;2.00&lt;/TarifPersen&gt;
    &lt;PPhDipotong&gt;9000000&lt;/PPhDipotong&gt;
    &lt;SitasiDasarHukum&gt;PMK-141/2015 Ps. 1(6)&lt;/SitasiDasarHukum&gt;
  &lt;/BuktiPotong&gt;
  &lt;BuktiPotong id="TX-02" status="HOLD_DGT"&gt;
    &lt;NegaraDomisili&gt;SG&lt;/NegaraDomisili&gt;
    &lt;KodeObjekPajak&gt;27-104-01&lt;/KodeObjekPajak&gt;
    &lt;DasarPengenaanPajak&gt;1343000000&lt;/DasarPengenaanPajak&gt;
    &lt;TarifPersen&gt;20.00&lt;/TarifPersen&gt;
    &lt;CatatanTreaty&gt;Menunggu Form DGT IRAS (Target 0%)&lt;/CatatanTreaty&gt;
  &lt;/BuktiPotong&gt;
&lt;/UnifikasiBatch&gt;`;

  const signoffRows = AUDIT_SIGNOFFS.map(
    (s) => `<tr>
      <td class="mono" style="font-weight:700;color:#1b4965;">${esc(s.step)}</td>
      <td style="font-weight:700;color:#0f172a;">${esc(s.role)}</td>
      <td style="font-weight:600;">${esc(s.actor)}</td>
      <td class="mono" style="color:#475569;">${esc(s.time)}</td>
      <td style="color:#334155;">${esc(s.action)}</td>
      <td class="mono" style="color:#1b4965;">${esc(s.hash)}</td>
      <td>${badge(s.status, s.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `
    ${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 1fr;gap:9px;">
      <!-- LEFT: GL-TO-CORETAX RECONCILIATION + 6-MONTH LIABILITY TREND -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 auto;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#1b4965')}<span>Kertas Kerja Equalisasi Buku Besar (GL) vs CoreTax Masa Nov 2026</span></div>
            <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">168 Dokumen · Selisih Rp 0</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:196px;">Kelompok Pajak &amp; Kredit</th>
                  <th style="width:116px;">Kode Objek</th>
                  <th class="num" style="width:42px;">Jml</th>
                  <th class="num" style="width:102px;">DPP GL (IDR)</th>
                  <th class="num" style="width:102px;">DPP CoreTax</th>
                  <th class="num" style="width:54px;">Selisih</th>
                  <th class="num" style="width:98px;">Pajak (IDR)</th>
                  <th style="width:86px;">Validasi</th>
                </tr>
              </thead>
              <tbody>${reconRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="mono">TOTAL PPh DIPOTONG (4 JENIS · 114 BUPOT)</td>
                  <td class="mono num">114</td>
                  <td class="mono num">13.178.000.000</td>
                  <td class="mono num">13.178.000.000</td>
                  <td class="mono num" style="color:#047857;">0</td>
                  <td class="mono num" style="color:#1b4965;">${fmtNum(RECON_PPH_TOTAL)}</td>
                  <td>${badge('Equalized', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#1b4965')}<span>Tren Kewajiban Pemotongan PPh Unifikasi (6 Masa Terakhir · Juta IDR)</span></div>
            <span class="mono" style="font-size:9.5px;color:#64748b;">Jun - Nov 2026</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            ${stackedChart}
            <div style="font-size:9.8px;color:#475569;padding-top:5px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;">
              <span><strong>Catatan Varians Nov 26:</strong> Kenaikan PPh 26 sementara (+Rp 116 Jt MoM) dipicu hold DGT TX-02 &amp; CB-06.</span>
              <span class="mono" style="color:#047857;font-weight:700;">Proyeksi Pasca-DGT: Rp 518,9 Jt</span>
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT: CORETAX XML PAYLOAD & AUDITOR PACKAGE INSPECTOR -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#1b4965')}<span>Pratinjau Payload CoreTax XML (XSD v2.6.1)</span></div>
          <div style="display:flex;gap:5px;">${badge('Schema Valid', 'ok')}${badge('UTF-8', 'neutral')}</div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <pre class="pc-code-block" style="margin:0;white-space:pre-wrap;">${xmlSnippet}</pre>

          <div style="border:1px solid #d5dde5;border-radius:3px;padding:8px 10px;background:#f8fafc;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10.5px;font-weight:700;color:#123449;">Bundel Kertas Kerja Auditor Eksternal (KKP)</span>
              ${badge('WORM SHA-256', 'accent')}
            </div>
            <div class="pc-kv"><span class="pc-kv-lbl">1. Unifikasi_202611_CoreTax.xml</span><span class="pc-kv-val mono" style="color:#047857;">114 Bupot · 428 KB</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">2. KertasKerja_Equalisasi_GL_Nov26.xlsx</span><span class="pc-kv-val mono">168 Baris · Sitasi PMK</span></div>
            <div class="pc-kv"><span class="pc-kv-lbl">3. Lampiran_Form_DGT_P3B_Bundle.zip</span><span class="pc-kv-val mono" style="color:#b45309;">8/10 Lengkap (2 Hold)</span></div>
            <div class="pc-kv" style="border-bottom:0;"><span class="pc-kv-lbl">4. Jejak_Sitasi_Agent_WORM_Audit.json</span><span class="pc-kv-val mono">Immutable Log</span></div>
          </div>

          <div style="display:flex;gap:6px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:28px;">${ic('download', 12, '#ffffff')} Ekspor Bundel Kertas Kerja &amp; XML</span>
            <span class="e-btn" style="height:28px;">${ic('copy', 12, '#334155')} Salin SHA-256</span>
          </div>
        </div>
      </section>
    </div>

    <!-- BOTTOM: EXTERNAL AUDITOR & MAKER-CHECKER SIGN-OFF LEDGER -->
    <section class="e-panel" style="flex:0 0 auto;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('users', 13, '#1b4965')}<span>Rantai Persetujuan Kertas Kerja (Maker - Checker - Partner KKP - CFO)</span></div>
        <span class="mono" style="font-size:9.5px;color:#475569;">WORM Ledger · Siap Pemeriksaan Auditor Eksternal &amp; DJP</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:44px;">Thp</th>
              <th style="width:210px;">Peran Otorisasi</th>
              <th style="width:166px;">Pejabat / Konsultan</th>
              <th style="width:162px;">Waktu (WIB)</th>
              <th>Lingkup Verifikasi &amp; Catatan Audit</th>
              <th style="width:154px;">Bukti Kriptografi</th>
              <th style="width:102px;">Status</th>
            </tr>
          </thead>
          <tbody>${signoffRows}</tbody>
        </table>
      </div>
    </section>
  `;

  return renderShell({
    activeTab: 'p5',
    pageTitle: 'Kertas Kerja Posisi Pajak & Ekspor CoreTax XML',
    subMeta: 'Equalisasi GL AP/AR vs SPT Masa Unifikasi, validasi skema XSD v2.6.1, dan persetujuan auditor eksternal KKP',
    actionsHtml: `
      <span class="e-btn">${ic('checkCircle', 11, '#047857')} Validasi XSD v2.6.1</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Paket Auditor (ZIP)</span>
    `,
    contentHtml,
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
