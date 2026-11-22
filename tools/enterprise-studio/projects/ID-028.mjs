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
  id: 'ID-028',
  name: 'MallLoyalty Pass',
  reference: 'SAP S/4HANA Fiori Horizon + Workday Governance',
  persona: 'R. Wibisono · VP Loyalty & Commercial ERP · PT Nusantara Properti Tbk',
  pages: [
    { slug: 'p1', title: 'Komando Eksekutif & Operasi Multi-Mal' },
    { slug: 'p2', title: 'Workbench Verifikasi Struk OCR & Inspektor PaddleOCR' },
    { slug: 'p3', title: 'Komando Parkir ANPR, Peta Basement B2 & Gerbang QRIS' },
    { slug: 'p4', title: 'Afinitas Cross-Shopping & Simulasi Liabilitas PSAK 72' },
    { slug: 'p5', title: 'Settlement Tenant, Jurnal PSAK 72 & CoreTax XML e-Faktur' },
    { slug: 'p6', title: 'Matriks DoA Maker-Checker-Approver & Workflow Kampanye' },
    { slug: 'p7', title: 'Kepatuhan UU PDP PP 33/2026, RBAC & Audit WORM SHA-256' },
    { slug: 'p8', title: 'Aplikasi Pengunjung .NET MAUI & Telemetri Integrasi Edge' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// ============================================================================

const MALLS = [
  {
    code: 'JKT-SCBD',
    name: 'Grand Sudirman Superblock',
    city: 'Jakarta Selatan',
    bridge: 'SecureParking',
    tenants: 248,
    slots: 1840,
    occupied: 1462,
    receipts: 42180,
    gmv: 24850000000,
    pointsIssued: 24850000,
    parkingQris: 1420000000,
    liabilityIssued: 248500000,
    ocrP95: 1.42,
    qrisShare: 71,
    ptsShare: 24,
    emoneyShare: 5,
    status: 'Normal',
    tone: 'ok',
  },
  {
    code: 'JKT-SEN',
    name: 'Senayan Promenade Mall',
    city: 'Jakarta Pusat',
    bridge: 'SecureParking',
    tenants: 194,
    slots: 1420,
    occupied: 1108,
    receipts: 31420,
    gmv: 18640000000,
    pointsIssued: 18640000,
    parkingQris: 1085000000,
    liabilityIssued: 186400000,
    ocrP95: 1.49,
    qrisShare: 68,
    ptsShare: 27,
    emoneyShare: 5,
    status: 'Normal',
    tone: 'ok',
  },
  {
    code: 'JKT-KMG',
    name: 'Kemang Lifestyle Plaza',
    city: 'Jakarta Selatan',
    bridge: 'CentrePark',
    tenants: 132,
    slots: 960,
    occupied: 684,
    receipts: 18950,
    gmv: 10420000000,
    pointsIssued: 10420000,
    parkingQris: 640000000,
    liabilityIssued: 104200000,
    ocrP95: 1.56,
    qrisShare: 66,
    ptsShare: 28,
    emoneyShare: 6,
    status: 'Normal',
    tone: 'ok',
  },
  {
    code: 'SBY-TJN',
    name: 'Tunjungan Grand Galleria',
    city: 'Surabaya Pusat',
    bridge: 'CentrePark',
    tenants: 216,
    slots: 1680,
    occupied: 1294,
    receipts: 34860,
    gmv: 19320000000,
    pointsIssued: 19320000,
    parkingQris: 1125000000,
    liabilityIssued: 193200000,
    ocrP95: 1.51,
    qrisShare: 70,
    ptsShare: 25,
    emoneyShare: 5,
    status: 'Padat 77%',
    tone: 'warn',
  },
  {
    code: 'SBY-PHB',
    name: 'Pakuwon Harbour Square',
    city: 'Surabaya Barat',
    bridge: 'SecureParking',
    tenants: 168,
    slots: 1240,
    occupied: 912,
    receipts: 23640,
    gmv: 12890000000,
    pointsIssued: 12890000,
    parkingQris: 790000000,
    liabilityIssued: 128900000,
    ocrP95: 1.46,
    qrisShare: 67,
    ptsShare: 27,
    emoneyShare: 6,
    status: 'Normal',
    tone: 'ok',
  },
  {
    code: 'BDG-CHM',
    name: 'Cihampelas Skywalk Mall',
    city: 'Bandung Utara',
    bridge: 'CentrePark',
    tenants: 146,
    slots: 1080,
    occupied: 724,
    receipts: 19450,
    gmv: 9680000000,
    pointsIssued: 9680000,
    parkingQris: 580000000,
    liabilityIssued: 96800000,
    ocrP95: 1.64,
    qrisShare: 65,
    ptsShare: 28,
    emoneyShare: 7,
    status: 'Normal',
    tone: 'ok',
  },
];

const TOTAL_TENANTS = MALLS.reduce((a, m) => a + m.tenants, 0);
const TOTAL_SLOTS = MALLS.reduce((a, m) => a + m.slots, 0);
const TOTAL_OCCUPIED = MALLS.reduce((a, m) => a + m.occupied, 0);
const TOTAL_RECEIPTS = MALLS.reduce((a, m) => a + m.receipts, 0);
const TOTAL_GMV = MALLS.reduce((a, m) => a + m.gmv, 0);
const TOTAL_POINTS_ISSUED = MALLS.reduce((a, m) => a + m.pointsIssued, 0);
const TOTAL_PARKING_QRIS = MALLS.reduce((a, m) => a + m.parkingQris, 0);
const TOTAL_LIABILITY_ISSUED = MALLS.reduce((a, m) => a + m.liabilityIssued, 0);

// PSAK 72 Liability Waterfall (in IDR)
const WATERFALL = {
  opening: 2140000000,
  issued: TOTAL_LIABILITY_ISSUED, // 958.000.000
  redeemVoucher: 412500000,
  redeemParking: 184200000,
  breakage: 136300000,
  closing: 2365000000,
};

// 18-row OCR Receipt Verification Queue (P2)
const OCR_RECEIPTS = [
  { id: 'RCP-902', time: '13:28:14', tenant: 'Uniqlo Grand Sudirman', entity: 'PT Fast Retailing Indonesia', mall: 'JKT-SCBD', npwp: '01.308.449.2-092.000', no: '#UQ-88124', dpp: 405405, ppn: 44595, gross: 450000, pts: 450, conf: 99.6, ms: 1420, status: 'Masuk Poin', tone: 'ok', selected: true },
  { id: 'RCP-901', time: '13:27:52', tenant: 'Starbucks Reserve SCBD', entity: 'PT Sari Coffee Indonesia', mall: 'JKT-SCBD', npwp: '01.812.441.7-054.000', no: '#SB-44910', dpp: 166667, ppn: 18333, gross: 185000, pts: 185, conf: 99.2, ms: 1280, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-900', time: '13:27:31', tenant: 'Sephora Senayan Promenade', entity: 'PT Sephora Indonesia', mall: 'JKT-SEN', npwp: '02.419.882.1-058.000', no: '#SP-71204', dpp: 1126126, ppn: 123874, gross: 1250000, pts: 1250, conf: 99.4, ms: 1510, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-899', time: '13:26:58', tenant: 'Marugame Udon Tunjungan', entity: 'PT Sriboga Marugame ID', mall: 'SBY-TJN', npwp: '01.945.112.4-631.000', no: '#MU-30918', dpp: 288288, ppn: 31712, gross: 320000, pts: 320, conf: 98.9, ms: 1390, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-898', time: '13:26:20', tenant: 'iBox Grand Sudirman', entity: 'PT Data Citra Mandiri', mall: 'JKT-SCBD', npwp: '01.662.309.5-073.000', no: '#IB-19402', dpp: 3153153, ppn: 346847, gross: 3500000, pts: 3500, conf: 93.1, ms: 2180, status: 'Tinjau Manual', tone: 'warn', warn: true },
  { id: 'RCP-897', time: '13:25:47', tenant: 'The FoodHall Kemang', entity: 'PT Swalayan Sukses Abadi', mall: 'JKT-KMG', npwp: '01.340.771.9-062.000', no: '#FH-66219', dpp: 612613, ppn: 67387, gross: 680000, pts: 680, conf: 99.1, ms: 1460, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-896', time: '13:25:15', tenant: 'Zara Tunjungan Galleria', entity: 'PT Mitra Adiperkasa Tbk', mall: 'SBY-TJN', npwp: '01.318.920.3-054.000', no: '#ZR-55831', dpp: 1441441, ppn: 158559, gross: 1600000, pts: 1600, conf: 99.5, ms: 1440, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-895', time: '13:24:44', tenant: 'Cinema XXI Premiere SCBD', entity: 'PT Nusantara Sejahtera Raya', mall: 'JKT-SCBD', npwp: '01.301.224.8-054.000', no: '#XX-90841', dpp: 432432, ppn: 47568, gross: 480000, pts: 480, conf: 99.7, ms: 1190, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-894', time: '13:24:10', tenant: 'H&M Cihampelas Skywalk', entity: 'PT Hindo Indonesia', mall: 'BDG-CHM', npwp: '03.112.904.6-056.000', no: '#HM-22810', dpp: 720721, ppn: 79279, gross: 800000, pts: 0, conf: 98.4, ms: 1340, status: 'Duplikat Hash', tone: 'bad', bad: true },
  { id: 'RCP-893', time: '13:23:39', tenant: 'Sushi Tei Pakuwon Harbour', entity: 'PT Sushi Tei Indonesia', mall: 'SBY-PHB', npwp: '02.214.663.2-054.000', no: '#ST-77104', dpp: 522523, ppn: 57477, gross: 580000, pts: 580, conf: 99.3, ms: 1410, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-892', time: '13:23:02', tenant: 'Kinokuniya Senayan', entity: 'PT Kinokuniya Bukindo', mall: 'JKT-SEN', npwp: '01.384.510.1-058.000', no: '#KN-14522', dpp: 351351, ppn: 38649, gross: 390000, pts: 390, conf: 99.0, ms: 1360, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-891', time: '13:22:28', tenant: 'Sociolla Grand Sudirman', entity: 'PT Social Bella Indonesia', mall: 'JKT-SCBD', npwp: '03.298.411.5-074.000', no: '#SC-61920', dpp: 486486, ppn: 53514, gross: 540000, pts: 540, conf: 99.4, ms: 1320, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-890', time: '13:21:54', tenant: 'Nike Beacon Senayan', entity: 'PT MAP Aktif Adiperkasa', mall: 'JKT-SEN', npwp: '01.884.192.2-054.000', no: '#NK-38814', dpp: 1981982, ppn: 218018, gross: 2200000, pts: 2200, conf: 92.4, ms: 2340, status: 'Tinjau Manual', tone: 'warn', warn: true },
  { id: 'RCP-889', time: '13:21:19', tenant: 'Remboelan Tunjungan', entity: 'PT Remboelan Kuliner', mall: 'SBY-TJN', npwp: '02.771.304.8-611.000', no: '#RB-49102', dpp: 396396, ppn: 43604, gross: 440000, pts: 440, conf: 98.8, ms: 1470, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-888', time: '13:20:41', tenant: 'Guardian Cihampelas', entity: 'PT Hero Supermarket Tbk', mall: 'BDG-CHM', npwp: '01.302.774.1-054.000', no: '#GD-82311', dpp: 234234, ppn: 25766, gross: 260000, pts: 260, conf: 99.1, ms: 1290, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-887', time: '13:20:06', tenant: 'Frank & Co. Grand Sudirman', entity: 'PT Central Mega Kencana', mall: 'JKT-SCBD', npwp: '01.366.812.9-054.000', no: '#FC-09412', dpp: 4504505, ppn: 495495, gross: 5000000, pts: 0, conf: 88.7, ms: 2610, status: 'Blokir Fraud', tone: 'bad', bad: true },
  { id: 'RCP-886', time: '13:19:33', tenant: 'Gramedia Pakuwon Harbour', entity: 'PT Gramedia Asri Media', mall: 'SBY-PHB', npwp: '01.305.918.6-054.000', no: '#GR-51209', dpp: 279279, ppn: 30721, gross: 310000, pts: 310, conf: 99.2, ms: 1380, status: 'Masuk Poin', tone: 'ok' },
  { id: 'RCP-885', time: '13:18:55', tenant: 'Erafone Kemang Plaza', entity: 'PT Erafone Artha Retailindo', mall: 'JKT-KMG', npwp: '01.771.894.3-054.000', no: '#ER-73920', dpp: 1351351, ppn: 148649, gross: 1500000, pts: 1500, conf: 94.0, ms: 1980, status: 'Tinjau Manual', tone: 'warn', warn: true },
];

// Member Tiers (P4 & P7 consistency: total members = 418.420)
const TIERS = [
  {
    name: 'Silver Member',
    req: 'Registrasi · Rp 0–5 Jt/thn',
    members: 248620,
    avgSpend: 820000,
    gmvMtd: 26420000000,
    perks: 'Scan OCR 1x Poin · Bayar Parkir QRIS',
    perkCost: 112000000,
    costRatio: 0.42,
    netMargin: 1984000000,
    tone: 'neutral',
  },
  {
    name: 'Gold Member',
    req: 'Belanja >= Rp 5 Jt/thn',
    members: 118440,
    avgSpend: 2150000,
    gmvMtd: 34880000000,
    perks: 'Parkir 3 Jam (300 pts) · VIP Lounge L3 (2 tamu) · Voucher Ultah Rp 100rb',
    perkCost: 348000000,
    costRatio: 1.00,
    netMargin: 2846000000,
    tone: 'accent',
  },
  {
    name: 'Platinum Member',
    req: 'Belanja >= Rp 25 Jt/thn',
    members: 38910,
    avgSpend: 5420000,
    gmvMtd: 22650000000,
    perks: 'Gratis Parkir 4 Jam · Valet Diskon 50% · Lounge Unlimited · 1,5x Poin',
    perkCost: 312000000,
    costRatio: 1.38,
    netMargin: 2145000000,
    tone: 'info',
  },
  {
    name: 'Black VIP',
    req: 'Undangan >= Rp 100 Jt/thn',
    members: 12450,
    avgSpend: 11800000,
    gmvMtd: 11850000000,
    perks: 'Valet VIP Gratis · Dedicated Bay B2 · Concierge · 2x Poin · Voucher Ultah Rp 1 Jt',
    perkCost: 248000000,
    costRatio: 2.09,
    netMargin: 1294000000,
    tone: 'dark',
  },
];

// Double-Entry PSAK 72 & Settlement Ledger (P5: 16 rows, exact Debit == Credit)
const JOURNAL_ENTRIES = [
  { doc: 'GL-2611-001', date: '22 Nov', coa: '1110-02', desc: 'Kas Escrow QRIS Parkir (SNAP BI Batch #42)', mall: '6 Mal', debit: 5600520000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-001', date: '22 Nov', coa: '5140-03', desc: 'Beban MDR QRIS Bank Acquirer (0,70%)', mall: '6 Mal', debit: 39480000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-001', date: '22 Nov', coa: '4120-01', desc: 'Pendapatan Parkir ANPR & QRIS (Nett Pajak)', mall: '6 Mal', debit: 0, credit: 5081081081, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-001', date: '22 Nov', coa: '2150-04', desc: 'Utang Pajak Parkir Daerah PBJT (10% Pemda)', mall: '6 Mal', debit: 0, credit: 558918919, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-002', date: '22 Nov', coa: '5210-01', desc: 'Beban Penerbitan Poin Loyalitas (Porsi Mal 60%)', mall: '6 Mal', debit: 574800000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-002', date: '22 Nov', coa: '1130-04', desc: 'Piutang Co-Funding Tenant Ritel (Porsi 40%)', mall: '6 Mal', debit: 383200000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-002', date: '22 Nov', coa: '2140-01', desc: 'Kewajiban Kontrak Poin Ditangguhkan (PSAK 72)', mall: '6 Mal', debit: 0, credit: 958000000, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-003', date: '22 Nov', coa: '2140-01', desc: 'Realisasi Redempsi Voucher F&B & Ritel Tenant', mall: '6 Mal', debit: 412500000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-003', date: '22 Nov', coa: '2120-07', desc: 'Utang Settlement Reimbursement Tenant Voucher', mall: '6 Mal', debit: 0, credit: 412500000, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-004', date: '22 Nov', coa: '2140-01', desc: 'Realisasi Redempsi Poin Parkir ANPR (300 pts)', mall: '6 Mal', debit: 184200000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-004', date: '22 Nov', coa: '4120-02', desc: 'Pendapatan Parkir Diakui dari Konversi Poin', mall: '6 Mal', debit: 0, credit: 184200000, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-005', date: '22 Nov', coa: '2140-01', desc: 'Pengakuan Breakage Poin Kedaluwarsa (PSAK 72)', mall: '6 Mal', debit: 136300000, credit: 0, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-005', date: '22 Nov', coa: '4290-05', desc: 'Pendapatan Lain-Lain — Breakage Poin Member', mall: '6 Mal', debit: 0, credit: 136300000, status: 'Posted', tone: 'ok' },
  { doc: 'GL-2611-006', date: '22 Nov', coa: '1130-05', desc: 'Tagihan e-Faktur Co-Funding & Media In-App', mall: 'JKT-SCBD', debit: 1095500000, credit: 0, status: 'CoreTax OK', tone: 'info' },
  { doc: 'GL-2611-006', date: '22 Nov', coa: '4150-01', desc: 'Pendapatan Jasa Co-Marketing & Loyalty Fee', mall: 'JKT-SCBD', debit: 0, credit: 986936937, status: 'CoreTax OK', tone: 'info' },
  { doc: 'GL-2611-006', date: '22 Nov', coa: '2150-02', desc: 'PPN Keluaran 11% (CoreTax DJP PMK 131/2024)', mall: 'JKT-SCBD', debit: 0, credit: 108563063, status: 'CoreTax OK', tone: 'info' },
];

// QRIS Bank Escrow Reconciliation (P5: exact sum = TOTAL_PARKING_QRIS 5.640.000.000)
const QRIS_BANKS = [
  { bank: 'Bank Mandiri (Livin/SNAP)', tx: 164200, gross: 2180000000, mdr: 15260000, nett: 2164740000, diff: 0, status: 'Matched' },
  { bank: 'Bank Central Asia (BCA)', tx: 138450, gross: 1840000000, mdr: 12880000, nett: 1827120000, diff: 0, status: 'Matched' },
  { bank: 'Bank Rakyat Indonesia (BRI)', tx: 71800, gross: 960000000, mdr: 6720000, nett: 953280000, diff: 0, status: 'Matched' },
  { bank: 'Bank Negara Indonesia (BNI)', tx: 49650, gross: 660000000, mdr: 4620000, nett: 655380000, diff: 0, status: 'Matched' },
];

// 16-row DoA Approval Queue (P6)
const DOA_QUEUE = [
  { id: 'CHG-2026-1142', type: 'Kampanye 3x Poin & Subsidi Parkir', scope: '6 Mal (Grup)', maker: 'D. Kartika', stage: 'Approver Tier-1 (CFO)', exposure: 1850000000, sla: '4j 15m', status: 'Tunggu CFO', tone: 'accent', selected: true },
  { id: 'CHG-2026-1141', type: 'Batch Voucher F&B Rp 50.000 (10rb kupon)', scope: 'JKT-SCBD', maker: 'N. Saputri', stage: 'Checker (Finance)', exposure: 500000000, sla: '6j 40m', status: 'Review Tax', tone: 'warn' },
  { id: 'CHG-2026-1140', type: 'Settlement Co-Funding PT MAP Tbk', scope: 'JKT · SBY', maker: 'H. Kusuma', stage: 'Approver Tier-2 (VP)', exposure: 642000000, sla: '2j 10m', status: 'SLA Dekat', tone: 'bad', bad: true },
  { id: 'CHG-2026-1139', type: 'Penyesuaian Tarif Valet VIP Weekend', scope: 'JKT-SCBD', maker: 'F. Gunawan', stage: 'Approver Tier-2 (VP)', exposure: 280000000, sla: '11j 20m', status: 'Tunggu VP', tone: 'info' },
  { id: 'CHG-2026-1138', type: 'Onboarding 14 Tenant Baru + Master NPWP', scope: 'SBY-TJN', maker: 'M. Rizky', stage: 'Checker (Tax/OCR)', exposure: 120000000, sla: '18j 05m', status: 'Cek NPWP', tone: 'neutral' },
  { id: 'CHG-2026-1137', type: 'Reimbursement Voucher Ulang Tahun Gold', scope: '6 Mal (Grup)', maker: 'D. Kartika', stage: 'Approver Tier-2 (VP)', exposure: 415000000, sla: '8j 50m', status: 'Tunggu VP', tone: 'info' },
  { id: 'CHG-2026-1136', type: 'Koreksi Poin Manual VIP (#ML-00921)', scope: 'JKT-SEN', maker: 'L. Wijaya', stage: 'Checker (Fraud Ops)', exposure: 18500000, sla: '5j 30m', status: 'Audit Struk', tone: 'warn' },
  { id: 'CHG-2026-1135', type: 'Perpanjangan Kontrak Bridge CentrePark', scope: 'SBY · BDG', maker: 'B. Prakoso', stage: 'Approver Tier-1 (CFO)', exposure: 960000000, sla: '14j 00m', status: 'Cek Legal', tone: 'info' },
  { id: 'CHG-2026-1134', type: 'Voucher Parkir Gratis Tenant Anchor Uniqlo', scope: 'JKT-SCBD', maker: 'N. Saputri', stage: 'Selesai & Rilis', exposure: 225000000, sla: 'Tuntas', status: 'Disetujui', tone: 'ok' },
  { id: 'CHG-2026-1133', type: 'Penghapusan Poin Fraud Terindikasi (42 Akun)', scope: 'SBY-TJN', maker: 'A. Pramesti', stage: 'Selesai & Rilis', exposure: 64000000, sla: 'Tuntas', status: 'Dieksekusi', tone: 'ok' },
  { id: 'CHG-2026-1132', type: 'Update Kebijakan Konsen UU PDP v2.4', scope: '6 Mal (Grup)', maker: 'A. Pramesti', stage: 'Approver DPO & Legal', exposure: 0, sla: '3j 45m', status: 'Wajib DPO', tone: 'warn' },
  { id: 'CHG-2026-1131', type: 'Subsidi EV Charging Member Black VIP', scope: 'JKT-SCBD', maker: 'F. Gunawan', stage: 'Checker (Finance)', exposure: 145000000, sla: '16j 20m', status: 'Cek Capex', tone: 'neutral' },
  { id: 'CHG-2026-1130', type: 'Pencairan Settlement Tenant F&B Periode 2', scope: 'BDG-CHM', maker: 'H. Kusuma', stage: 'Selesai & Rilis', exposure: 318000000, sla: 'Tuntas', status: 'Disetujui', tone: 'ok' },
  { id: 'CHG-2026-1129', type: 'Aktivasi Akses VIP Lounge Lantai 3', scope: 'JKT-SCBD', maker: 'D. Kartika', stage: 'Approver Tier-2 (VP)', exposure: 340000000, sla: '9j 15m', status: 'Tunggu VP', tone: 'info' },
  { id: 'CHG-2026-1128', type: 'Threshold Anti-Fraud OCR > Rp 2,5 Jt/Struk', scope: '6 Mal (Grup)', maker: 'M. Rizky', stage: 'Selesai & Rilis', exposure: 0, sla: 'Tuntas', status: 'Aktif Prod', tone: 'ok' },
  { id: 'CHG-2026-1127', type: 'Jurnal Penyesuaian Breakage PSAK 72 Q4', scope: '6 Mal (Grup)', maker: 'S. Hartono', stage: 'Approver Tier-1 (CFO)', exposure: 371000000, sla: '7j 30m', status: 'Tunggu CFO', tone: 'accent' },
];

export function verifyMath() {
  if (TOTAL_TENANTS !== 1104) throw new Error(`TOTAL_TENANTS mismatch: ${TOTAL_TENANTS}`);
  if (TOTAL_SLOTS !== 8220) throw new Error(`TOTAL_SLOTS mismatch: ${TOTAL_SLOTS}`);
  if (TOTAL_OCCUPIED !== 6184) throw new Error(`TOTAL_OCCUPIED mismatch: ${TOTAL_OCCUPIED}`);
  if (TOTAL_RECEIPTS !== 170500) throw new Error(`TOTAL_RECEIPTS mismatch: ${TOTAL_RECEIPTS}`);
  if (TOTAL_GMV !== 95800000000) throw new Error(`TOTAL_GMV mismatch: ${TOTAL_GMV}`);
  if (TOTAL_POINTS_ISSUED !== 95800000) throw new Error(`TOTAL_POINTS_ISSUED mismatch: ${TOTAL_POINTS_ISSUED}`);
  if (TOTAL_PARKING_QRIS !== 5640000000) throw new Error(`TOTAL_PARKING_QRIS mismatch: ${TOTAL_PARKING_QRIS}`);
  if (TOTAL_LIABILITY_ISSUED !== 958000000) throw new Error(`TOTAL_LIABILITY_ISSUED mismatch: ${TOTAL_LIABILITY_ISSUED}`);

  const wfCheck =
    WATERFALL.opening +
    WATERFALL.issued -
    WATERFALL.redeemVoucher -
    WATERFALL.redeemParking -
    WATERFALL.breakage;
  if (wfCheck !== WATERFALL.closing) {
    throw new Error(`PSAK 72 waterfall mismatch: ${wfCheck} vs ${WATERFALL.closing}`);
  }

  for (const r of OCR_RECEIPTS) {
    if (r.dpp + r.ppn !== r.gross) {
      throw new Error(`OCR receipt ${r.id} DPP+PPN mismatch: ${r.dpp + r.ppn} vs ${r.gross}`);
    }
  }

  const tierMembers = TIERS.reduce((a, t) => a + t.members, 0);
  const tierGmv = TIERS.reduce((a, t) => a + t.gmvMtd, 0);
  if (tierMembers !== 418420) throw new Error(`Tier members mismatch: ${tierMembers}`);
  if (tierGmv !== TOTAL_GMV) throw new Error(`Tier GMV mismatch: ${tierGmv} vs ${TOTAL_GMV}`);

  const sumDebit = JOURNAL_ENTRIES.reduce((a, j) => a + j.debit, 0);
  const sumCredit = JOURNAL_ENTRIES.reduce((a, j) => a + j.credit, 0);
  if (sumDebit !== sumCredit) throw new Error(`Journal unbalanced: D=${sumDebit} vs C=${sumCredit}`);

  const sumQrisGross = QRIS_BANKS.reduce((a, b) => a + b.gross, 0);
  if (sumQrisGross !== TOTAL_PARKING_QRIS) {
    throw new Error(`QRIS bank gross mismatch: ${sumQrisGross} vs ${TOTAL_PARKING_QRIS}`);
  }
  for (const b of QRIS_BANKS) {
    if (b.gross - b.mdr !== b.nett) throw new Error(`Bank ${b.bank} nett mismatch`);
  }
}

// ============================================================================
// SAP S/4HANA FIORI HORIZON / WORKDAY LIGHT-FIRST ENTERPRISE SHELL
// Distinct from ID-001: light corporate header, horizontal module bar, #4338ca
// ============================================================================

const MODULE_TABS = [
  { id: 'p1', icon: 'activity', label: 'Komando Multi-Mal', cnt: '6 Mal' },
  { id: 'p2', icon: 'fileText', label: 'Verifikasi OCR', cnt: '18' },
  { id: 'p3', icon: 'layers', label: 'Parkir ANPR & QRIS', cnt: '75,2%' },
  { id: 'p4', icon: 'sliders', label: 'Cross-Shop & PSAK 72', cnt: '4 Tier' },
  { id: 'p5', icon: 'database', label: 'Jurnal & CoreTax XML', cnt: 'Bal OK' },
  { id: 'p6', icon: 'checkCircle', label: 'Otorisasi DoA', cnt: '12', warn: true },
  { id: 'p7', icon: 'shield', label: 'UU PDP & WORM', cnt: '98,4%' },
  { id: 'p8', icon: 'globe', label: 'Aplikasi MAUI & Edge', cnt: '3 Layar' },
];

const SHARED_CSS = `
  /* SAP Fiori Horizon / Workday Light-First Shell */
  .f-topbar {
    height: 44px;
    background: #ffffff;
    border-top: 3px solid var(--e-accent);
    border-bottom: 1px solid var(--e-border);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .f-top-left, .f-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .f-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 13px;
    color: #1e1b4b;
    letter-spacing: -0.015em;
    white-space: nowrap;
    padding-right: 10px;
    border-right: 1px solid var(--e-border);
  }
  .f-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: var(--e-accent);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .f-selector {
    height: 26px;
    padding: 0 9px;
    border-radius: 3px;
    background: #f8f9fc;
    border: 1px solid var(--e-border-strong);
    color: #1e293b;
    font-size: 10.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .f-selector-accent {
    background: var(--e-accent-soft);
    border-color: #c7d2fe;
    color: var(--e-accent-ink);
  }
  .f-search {
    height: 26px;
    width: 268px;
    padding: 0 9px;
    border-radius: 3px;
    background: #f8f9fc;
    border: 1px solid var(--e-border);
    color: #64748b;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .f-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .f-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid var(--e-border);
    white-space: nowrap;
  }
  .f-avatar {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #312e81;
    color: #ffffff;
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Fiori Module Tab Bar */
  .f-modbar {
    height: 34px;
    background: #f8f9fc;
    border-bottom: 1px solid var(--e-border-strong);
    padding: 0 12px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .f-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
    min-width: 0;
  }
  .f-tab {
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10.8px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .f-tab.is-active {
    color: var(--e-accent-ink);
    background: #ffffff;
    border-bottom-color: var(--e-accent);
    border-left: 1px solid var(--e-border);
    border-right: 1px solid var(--e-border);
    font-weight: 700;
  }
  .f-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 0.5px 4.5px;
    border-radius: 2px;
    background: #e2e8f0;
    color: #334155;
    font-weight: 700;
  }
  .f-tab.is-active .f-tab-cnt {
    background: var(--e-accent);
    color: #ffffff;
  }
  .f-tab-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .f-mod-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    color: #475569;
    white-space: nowrap;
  }

  /* Page Subbar */
  .f-subbar {
    height: 34px;
    padding: 0 14px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-content {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* Utility layout grids */
  .g-2 { display: grid; gap: 10px; min-height: 0; min-width: 0; }
  .g-col { display: flex; flex-direction: column; gap: 9px; min-height: 0; min-width: 0; }
  .kv-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4.5px 0;
    border-bottom: 1px solid #eef1f6;
    font-size: 10.5px;
    gap: 8px;
  }
  .kv-row:last-child { border-bottom: 0; }
  .kv-k { color: var(--e-muted); font-weight: 500; }
  .kv-v { color: var(--e-text); font-weight: 600; text-align: right; }

  .facet-bar {
    height: 36px;
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-radius: 4px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .facet-group {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .f-chip {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid var(--e-border-strong);
    background: #f8f9fc;
    color: #334155;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-chip.is-on {
    background: var(--e-accent-soft);
    border-color: var(--e-accent);
    color: var(--e-accent-ink);
  }
  .code-dark {
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #1e293b;
    border-radius: 3px;
    padding: 9px 10px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.48;
    white-space: pre;
    overflow: hidden;
  }
  .xml-tag { color: #93c5fd; }
  .xml-attr { color: #fcd34d; }
  .xml-val { color: #86efac; }
  .xml-cm { color: #94a3b8; }

  /* Dense table fine-tuning */
  table.e-table.dense td { padding: 4px 6.5px; font-size: 10.4px; }
  table.e-table.dense th { padding: 4.5px 6.5px; font-size: 9.6px; }
  table.e-table.compact td { padding: 3.3px 6px; font-size: 10.2px; }
  table.e-table.compact th { padding: 4px 6px; font-size: 9.4px; }

  /* Mobile Phone Frame (.NET MAUI P8) */
  .m-phone {
    background: #0f172a;
    border-radius: 16px;
    padding: 7px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    border: 1px solid #334155;
  }
  .m-screen {
    flex: 1;
    background: #f4f5f9;
    border-radius: 11px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .m-status {
    height: 20px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 700;
    color: #1e293b;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  .m-nav {
    height: 36px;
    background: #ffffff;
    border-top: 1px solid #d5dae4;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    flex-shrink: 0;
  }
  .m-nav-it {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 8.5px;
    font-weight: 600;
    color: #64748b;
  }
  .m-nav-it.on { color: #4338ca; font-weight: 700; }
`;

function fiorishell({
  title,
  activeId,
  entityLabel = 'PT Nusantara Properti Tbk · 6 Mal (JKT · SBY · BDG)',
  fiscalLabel = 'Periode Fiskal: Nov 2026 (Q4)',
  crumbSection,
  crumbTitle,
  actionsHtml = '',
  contentHtml = '',
  extraCss = '',
}) {
  const topbar = `<header class="f-topbar">
    <div class="f-top-left">
      <div class="f-brand">
        <span class="f-mark">ML</span>
        <span>MallLoyalty Pass</span>
        <span class="e-badge e-badge-accent" style="font-family:var(--e-mono);font-size:9px;">ERP v4.8</span>
      </div>
      <div class="f-selector">
        ${ic('layers', 12, '#4338ca')}
        <span>${esc(entityLabel)}</span>
        ${ic('chevronDown', 11, '#64748b')}
      </div>
      <div class="f-selector f-selector-accent">
        ${ic('clock', 12, '#312e81')}
        <span class="mono" style="font-size:10px;">${esc(fiscalLabel)}</span>
      </div>
    </div>
    <div class="f-top-right">
      <div class="f-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#64748b')}
          <span class="trunc">Cari struk RCP, plat nomor, NPWP tenant, DoA...</span>
        </span>
        <span class="f-kbd">Ctrl+K</span>
      </div>
      <span class="e-badge e-badge-ok" style="height:24px;padding:0 8px;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">OCR p95 1,48 dtk · 24/24 Gate</span>
      </span>
      <div class="f-user">
        <span class="f-avatar">RW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;">R. Wibisono</div>
          <div style="font-size:9px;color:#64748b;">VP Loyalty & Commercial ERP</div>
        </div>
      </div>
    </div>
  </header>`;

  const modbar = `<nav class="f-modbar">
    <div class="f-tabs">
      ${MODULE_TABS.map((t) => {
        const active = t.id === activeId;
        return `<div class="f-tab ${active ? 'is-active' : ''}">
          ${ic(t.icon, 12, active ? '#4338ca' : '#64748b')}
          <span>${esc(t.label)}</span>
          <span class="f-tab-cnt ${t.warn ? 'warn' : ''}">${esc(t.cnt)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="f-mod-meta">
      <span>PSAK 72 · CoreTax XML · UU PDP</span>
    </div>
  </nav>`;

  const subbar = `<div class="f-subbar">
    <div class="e-crumb">
      <span>MallLoyalty ERP</span>
      ${ic('chevronRight', 12, '#94a3b8')}
      <span>${esc(crumbSection)}</span>
      ${ic('chevronRight', 12, '#94a3b8')}
      <strong>${esc(crumbTitle)}</strong>
    </div>
    <div style="display:flex;align-items:center;gap:6px;">${actionsHtml}</div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> .NET 9 API Gateway: 99,98% SLA`,
      `PaddleOCR GPU Workers: 8/8 Aktif (Queue 14)`,
      `PostgreSQL Points Ledger: Primary JKT-DC1 · Sync 0 ms`,
      `Parking Bridge: SecureParking & CentrePark OK`,
    ],
    rightItems: [
      `WORM Audit: SHA-256 Terverifikasi`,
      `22 Nov 2026 · 13:32:18 WIB`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `MallLoyalty Pass — ${title}`,
    accent: '#4338ca',
    accentSoft: '#eef2ff',
    accentInk: '#312e81',
    bg: '#f3f4f8',
    surface: '#ffffff',
    surface2: '#f8f9fc',
    border: '#d5dae4',
    borderStrong: '#bec6d4',
    text: '#0f172a',
    text2: '#334155',
    muted: '#64748b',
    extraCss: SHARED_CSS + extraCss,
    bodyHtml: `${topbar}${modbar}${subbar}<main class="f-content">${contentHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: EXECUTIVE COMMAND & MULTI-MALL OPERATIONS COCKPIT
// ============================================================================
function renderP1() {
  const days = ['01', '03', '05', '07', '09', '11', '13', '15', '17', '19', '21', '22'];
  const gmvSeries = [3.4, 3.8, 3.6, 4.9, 5.2, 4.1, 4.4, 6.8, 5.1, 4.7, 5.6, 5.9];
  const rcpSeries = [6.2, 6.9, 6.5, 8.7, 9.1, 7.3, 7.8, 11.4, 9.0, 8.2, 9.8, 10.3];

  const mainChart = svgMultiLineChart({
    width: 920,
    height: 244,
    xLabels: days.map((d) => `${d} Nov`),
    series: [
      { label: 'GMV Struk OCR (Rp Miliar/hari)', values: gmvSeries, color: '#4338ca', area: true, dots: true, width: 2.1 },
      { label: 'Volume Struk Terverifikasi (Ribu/hari)', values: rcpSeries, color: '#047857', dashed: true, dots: false, width: 1.7 },
    ],
    yMin: 0,
    yMax: 12,
    yTicks: 4,
    yFormat: (v) => `${v.toFixed(0)}`,
    threshold: { value: 2.8, label: 'Batas Min GMV Rp 2,8 M/hari', color: '#b45309' },
    annotations: [
      { index: 7, seriesIdx: 1, label: '15 Nov: Promo Payday 2x Poin (+46%)', color: '#4338ca', dy: -22 },
    ],
  });

  const payChart = svgStackedBarChart({
    width: 560,
    height: 214,
    categories: MALLS.map((m) => m.code.split('-')[1]),
    series: [
      { label: 'QRIS Dinamis', color: '#4338ca', values: MALLS.map((m) => m.qrisShare) },
      { label: 'Tukar Poin', color: '#047857', values: MALLS.map((m) => m.ptsShare) },
      { label: 'Kartu e-Money', color: '#94a3b8', values: MALLS.map((m) => m.emoneyShare) },
    ],
    yMax: 100,
    yFormat: (v) => `${Math.round(v)}%`,
  });

  const alerts = [
    { sev: 'Tinggi', tone: 'bad', time: '13:26 WIB', mall: 'JKT-SCBD', title: 'Deteksi Indikasi Struk Fraud Rp 5,0 Jt (#FC-09412)', desc: 'Confidence NPWP 88,7% · Ditahan otomatis ke Antrean Checker Fraud.' },
    { sev: 'Waspada', tone: 'warn', time: '13:21 WIB', mall: 'SBY-TJN', title: 'Okupansi Parkir Basement B1–B2 Mencapai 77,0%', desc: '1.294 / 1.680 slot terisi · Gate ANPR CentrePark alihkan arus ke B3.' },
    { sev: 'Waspada', tone: 'warn', time: '13:14 WIB', mall: '6 Mal', title: 'Paket DoA CHG-2026-1142 Menunggu Tanda Tangan CFO', desc: 'Kampanye Year-End 3x Poin (Rp 1,85 M) · Sisa SLA 4 jam 15 menit.' },
    { sev: 'Info', tone: 'info', time: '12:58 WIB', mall: 'JKT-SCBD', title: 'Batch Settlement QRIS SNAP BI #42 Terkredit Penuh', desc: 'Rp 5,64 M bruto / Rp 5,60 M nett (4 Bank Acquirer · Selisih Rp 0).' },
    { sev: 'Normal', tone: 'ok', time: '12:40 WIB', mall: 'BDG-CHM', title: 'Pembaruan Model PaddleOCR v4.3-ID Selesai di 8 GPU', desc: 'Akurasi ekstraksi NPWP 16-digit naik dari 98,6% ke 99,4% (< 1,5 dtk).' },
    { sev: 'Normal', tone: 'ok', time: '12:12 WIB', mall: 'JKT-SEN', title: 'Sinkronisasi Master NPWP 14 Tenant Baru ke CoreTax', desc: 'Faktur Pajak Keluaran co-funding batch November 100% tervalidasi.' },
  ];

  const kpis = [
    {
      label: 'GMV Struk Terverifikasi (MTD)',
      val: 'Rp 95,80 M',
      sub: `${fmtNum(TOTAL_RECEIPTS)} struk · 1.104 tenant`,
      delta: '+14,8% MoM',
      tone: 'ok',
      spark: [62, 68, 71, 75, 79, 84, 88, 95.8],
      color: '#4338ca',
    },
    {
      label: 'Liabilitas Poin Bersih (PSAK 72)',
      val: 'Rp 2,365 M',
      sub: `Terbit ${fmtNum(TOTAL_POINTS_ISSUED / 1e6)} Jt pts · Breakage 18,4%`,
      delta: 'Tercadang 100%',
      tone: 'accent',
      spark: [2.14, 2.18, 2.21, 2.25, 2.29, 2.33, 2.35, 2.365],
      color: '#312e81',
    },
    {
      label: 'Pendapatan Parkir QRIS (MTD)',
      val: 'Rp 5,64 M',
      sub: '424.100 transaksi · 94,6% cashless',
      delta: 'Selisih Rp 0',
      tone: 'ok',
      spark: [3.8, 4.1, 4.4, 4.7, 5.0, 5.2, 5.4, 5.64],
      color: '#047857',
    },
    {
      label: 'Latensi Pipeline OCR (p95)',
      val: '1,48 dtk',
      sub: 'Target SLA < 3,00 dtk · Akurasi 99,3%',
      delta: 'SLA Terpenuhi',
      tone: 'ok',
      spark: [2.1, 1.9, 1.8, 1.72, 1.65, 1.58, 1.51, 1.48],
      color: '#0369a1',
    },
    {
      label: 'Konversi Cross-Shop & Redempsi',
      val: '38,4%',
      sub: '418.420 member · 2,4 tenant/kunjungan',
      delta: '+4,2% YoY',
      tone: 'info',
      spark: [31, 32.5, 33.4, 34.8, 35.9, 36.8, 37.6, 38.4],
      color: '#4338ca',
    },
  ];

  const html = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
      ${kpis
        .map(
          (k) => `<div class="e-kpi">
          <div class="e-kpi-top">
            <span class="trunc">${esc(k.label)}</span>
            ${badge(k.delta, k.tone)}
          </div>
          <div class="e-kpi-mid">
            <span class="e-kpi-val">${esc(k.val)}</span>
            ${svgSparkline({ points: k.spark, width: 68, height: 22, color: k.color })}
          </div>
          <div class="e-kpi-foot"><span class="trunc">${esc(k.sub)}</span></div>
        </div>`
        )
        .join('')}
    </div>

    <div class="g-2" style="grid-template-columns:1.58fr 1fr;flex:1;">
      <div class="g-col">
        <section class="e-panel" style="height:316px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#4338ca')} <span>Tren Harian Scan Struk PaddleOCR & GMV Terverifikasi (Nov 2026)</span></div>
            <div style="display:flex;gap:6px;align-items:center;">
              ${badge('6 Properti Aktif', 'neutral')}
              ${badge('Rata-rata 7.750 struk/hari', 'accent')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:6px 10px 8px;">
            ${mainChart}
            <div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid #eef1f6;font-size:10px;color:#475569;">
              <span>Puncak Harian: <strong class="mono" style="color:#0f172a;">15 Nov (11.420 struk · Rp 6,80 M)</strong></span>
              <span>Auto-Approve OCR >= 95%: <strong class="mono" style="color:#047857;">96,4%</strong></span>
              <span>Penolakan Duplikat/Fraud: <strong class="mono" style="color:#be123c;">0,82% (1.398 struk)</strong></span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#4338ca')} <span>Scorecard Operasional & Finansial 6 Properti Superblock (MTD Nov 2026)</span></div>
            <span class="e-panel-sub">Konsolidasi Multi-Entitas · Mata Uang IDR</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10.5px;">
              <colgroup>
                <col style="width:27%;" />
                <col style="width:7%;" />
                <col style="width:14%;" />
                <col style="width:10%;" />
                <col style="width:11%;" />
                <col style="width:11%;" />
                <col style="width:10%;" />
                <col style="width:10%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Properti Mal &amp; Kota</th>
                  <th class="num">Tenant</th>
                  <th>Okupansi ANPR</th>
                  <th class="num">Struk OCR</th>
                  <th class="num">GMV (Rp)</th>
                  <th class="num">Parkir QRIS</th>
                  <th class="num">Poin Terbit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${MALLS.map(
                  (m, idx) => `<tr class="${idx === 0 ? 'is-selected' : ''}">
                    <td style="padding:7px 7px;">
                      <div style="font-weight:700;color:#0f172a;">${esc(m.name)}</div>
                      <div style="font-size:9.1px;color:#64748b;" class="mono">${esc(m.code)} · ${esc(m.city)} · ${esc(m.bridge)}</div>
                    </td>
                    <td class="num mono">${fmtNum(m.tenants)}</td>
                    <td>${renderCapacityBar((m.occupied / m.slots) * 100, { warnAt: 76, critAt: 90 })}</td>
                    <td class="num mono">${fmtNum(m.receipts)}</td>
                    <td class="num mono" style="font-weight:700;">${(m.gmv / 1e9).toFixed(2).replace('.', ',')} M</td>
                    <td class="num mono">${(m.parkingQris / 1e9).toFixed(2).replace('.', ',')} M</td>
                    <td class="num mono">${(m.pointsIssued / 1e6).toFixed(2).replace('.', ',')} Jt</td>
                    <td>${badge(m.status, m.tone)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL KONSOLIDASI (6 MAL)</td>
                  <td class="num mono">${fmtNum(TOTAL_TENANTS)}</td>
                  <td class="mono" style="font-size:9.6px;">${fmtNum(TOTAL_OCCUPIED)}/${fmtNum(TOTAL_SLOTS)} (75%)</td>
                  <td class="num mono">${fmtNum(TOTAL_RECEIPTS)}</td>
                  <td class="num mono">Rp 95,80 M</td>
                  <td class="num mono">Rp 5,64 M</td>
                  <td class="num mono">95,80 Jt</td>
                  <td>${badge('100% Sync', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;">
              <div style="border:1px solid #c7d2fe;background:#eef2ff;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9.2px;color:#312e81;font-weight:700;">Wilayah DKI Jakarta (3 Mal)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#1e1b4b;">Rp 53,91 M <span style="font-size:9.3px;font-weight:600;color:#4338ca;">(56,3% GMV)</span></div>
              </div>
              <div style="border:1px solid #d5dae4;background:#ffffff;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9.2px;color:#475569;font-weight:700;">Wilayah Surabaya (2 Mal)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#0f172a;">Rp 32,21 M <span style="font-size:9.3px;font-weight:600;color:#64748b;">(33,6% GMV)</span></div>
              </div>
              <div style="border:1px solid #d5dae4;background:#ffffff;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9.2px;color:#475569;font-weight:700;">Wilayah Bandung (1 Mal)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#0f172a;">Rp 9,68 M <span style="font-size:9.3px;font-weight:600;color:#64748b;">(10,1% GMV)</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="g-col">
        <section class="e-panel" style="height:316px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#4338ca')} <span>Bauran Pembayaran Parkir ANPR per Mal (%)</span></div>
            ${badge('Cashless 94,6%', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;">
            ${payChart}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding-top:6px;border-top:1px solid #eef1f6;">
              <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:3px;padding:4px 7px;">
                <div style="font-size:9px;color:#312e81;font-weight:700;">QRIS Dinamis</div>
                <div class="mono" style="font-size:12.5px;font-weight:800;color:#1e1b4b;">68,4%</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:4px 7px;">
                <div style="font-size:9px;color:#047857;font-weight:700;">Tukar Poin</div>
                <div class="mono" style="font-size:12.5px;font-weight:800;color:#064e3b;">26,2%</div>
              </div>
              <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:3px;padding:4px 7px;">
                <div style="font-size:9px;color:#475569;font-weight:700;">e-Money Gate</div>
                <div class="mono" style="font-size:12.5px;font-weight:800;color:#334155;">5,4%</div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('bell', 13, '#4338ca')} <span>Feed Anomali Operasional, OCR & Eskalasi DoA</span></div>
            ${badge('6 Kejadian', 'neutral')}
          </div>
          <div class="e-panel-body" style="padding:6px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            ${alerts
              .map(
                (a) => `<div style="padding:6px 0;border-bottom:1px solid #eef1f6;display:flex;flex-direction:column;gap:2px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                  <div style="display:flex;align-items:center;gap:5px;min-width:0;">
                    ${badge(a.sev, a.tone)}
                    <span class="mono" style="font-size:9.3px;color:#4338ca;font-weight:700;">${esc(a.mall)}</span>
                    <span style="font-size:10.5px;font-weight:700;color:#0f172a;" class="trunc">${esc(a.title)}</span>
                  </div>
                  <span class="mono" style="font-size:9.3px;color:#64748b;flex-shrink:0;">${esc(a.time)}</span>
                </div>
                <div style="font-size:9.8px;color:#475569;padding-left:2px;">${esc(a.desc)}</div>
              </div>`
              )
              .join('')}
          </div>
        </section>
      </div>
    </div>
  `;

  return fiorishell({
    title: 'Komando Eksekutif & Operasi Multi-Mal',
    activeId: 'p1',
    crumbSection: 'Operasional Grup',
    crumbTitle: 'Komando Eksekutif & Kesehatan Multi-Mal',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12)} Ekspor Laporan Direksi (PDF/XLSX)</span>
      <span class="e-btn e-btn-primary">${ic('refresh', 12, '#ffffff')} Sinkronisasi Ledger Real-Time</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 2: WORKBENCH VERIFIKASI STRUK OCR & INSPEKTOR PADDLEOCR
// ============================================================================
function renderP2() {
  const sumDpp = OCR_RECEIPTS.reduce((a, r) => a + r.dpp, 0);
  const sumPpn = OCR_RECEIPTS.reduce((a, r) => a + r.ppn, 0);
  const sumGross = OCR_RECEIPTS.reduce((a, r) => a + r.gross, 0);
  const sumPts = OCR_RECEIPTS.reduce((a, r) => a + r.pts, 0);

  // Synthetic Thermal Receipt SVG with PaddleOCR bounding boxes for RCP-902 (Uniqlo Grand Sudirman)
  const receiptSvg = `<svg viewBox="0 0 460 228" width="100%" height="228" style="display:block;background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;">
    <!-- Left Thermal Paper -->
    <rect x="14" y="10" width="246" height="208" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text x="137" y="28" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="10.5" font-weight="700" fill="#0f172a">UNIQLO GRAND SUDIRMAN</text>
    <text x="137" y="42" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#334155">PT FAST RETAILING INDONESIA</text>
    <text x="137" y="55" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#0f172a">NPWP: 01.308.449.2-092.000</text>
    <line x1="24" y1="64" x2="250" y2="64" stroke="#94a3b8" stroke-dasharray="3,2" />
    <text x="26" y="78" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#334155">STRUK: #UQ-88124</text>
    <text x="248" y="78" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#334155">2026-11-20 13:24</text>
    <text x="26" y="96" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#0f172a">1x AIRism Oversized Tee L</text>
    <text x="248" y="96" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#0f172a">199.000</text>
    <text x="26" y="111" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#0f172a">1x Ultra Stretch Chino M</text>
    <text x="248" y="111" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#0f172a">251.000</text>
    <line x1="24" y1="122" x2="250" y2="122" stroke="#94a3b8" stroke-dasharray="3,2" />
    <text x="26" y="137" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">DPP (Incl. PPN 11%)</text>
    <text x="248" y="137" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">405.405</text>
    <text x="26" y="151" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">PPN 11%</text>
    <text x="248" y="151" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">44.595</text>
    <text x="26" y="172" font-family="Cascadia Mono,Consolas,monospace" font-size="10" font-weight="700" fill="#0f172a">GRAND TOTAL</text>
    <text x="248" y="172" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="10" font-weight="700" fill="#0f172a">Rp 450.000</text>
    <text x="26" y="191" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#64748b">BAYAR: QRIS BCA · REF 881240092</text>
    <text x="137" y="208" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="7.8" fill="#64748b">TERIMA KASIH · GRAND SUDIRMAN GF-12</text>

    <!-- PaddleOCR Bounding Boxes -->
    <rect x="44" y="32" width="186" height="27" fill="#4338ca" fill-opacity="0.08" stroke="#4338ca" stroke-width="1.4" rx="2" />
    <rect x="22" y="67" width="230" height="16" fill="#0369a1" fill-opacity="0.08" stroke="#0369a1" stroke-width="1.3" rx="2" />
    <rect x="22" y="158" width="230" height="20" fill="#047857" fill-opacity="0.10" stroke="#047857" stroke-width="1.5" rx="2" />

    <!-- Connector Callouts on Right Side -->
    <line x1="230" y1="45" x2="274" y2="45" stroke="#4338ca" stroke-width="1.1" stroke-dasharray="2,2" />
    <rect x="274" y="20" width="174" height="48" rx="3" fill="#eef2ff" stroke="#4338ca" stroke-width="1" />
    <text x="282" y="34" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#312e81">BOX-01 · NPWP & ENTITAS (99,6%)</text>
    <text x="282" y="47" font-family="Cascadia Mono,Consolas,monospace" font-size="8.4" fill="#1e1b4b">01.308.449.2-092.000</text>
    <text x="282" y="60" font-family="Segoe UI,system-ui,sans-serif" font-size="8.2" fill="#047857">Match Master Tenant SCBD-014</text>

    <line x1="252" y1="75" x2="274" y2="96" stroke="#0369a1" stroke-width="1.1" stroke-dasharray="2,2" />
    <rect x="274" y="78" width="174" height="44" rx="3" fill="#f0f9ff" stroke="#0369a1" stroke-width="1" />
    <text x="282" y="92" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#0369a1">BOX-02 · STRUK & TANGGAL (99,4%)</text>
    <text x="282" y="105" font-family="Cascadia Mono,Consolas,monospace" font-size="8.4" fill="#0f172a">#UQ-88124 · 2026-11-20</text>
    <text x="282" y="116" font-family="Segoe UI,system-ui,sans-serif" font-size="8.1" fill="#475569">Hash Unik: 0 Duplikasi</text>

    <line x1="252" y1="168" x2="274" y2="168" stroke="#047857" stroke-width="1.1" stroke-dasharray="2,2" />
    <rect x="274" y="132" width="174" height="58" rx="3" fill="#ecfdf5" stroke="#047857" stroke-width="1" />
    <text x="282" y="146" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#047857">BOX-03 · TOTAL & POIN (99,8%)</text>
    <text x="282" y="160" font-family="Cascadia Mono,Consolas,monospace" font-size="9.5" font-weight="700" fill="#064e3b">Rp 450.000 -> +450 pts</text>
    <text x="282" y="173" font-family="Segoe UI,system-ui,sans-serif" font-size="8.1" fill="#047857">Auto-Kredit PostgreSQL Ledger</text>
    <text x="282" y="184" font-family="Cascadia Mono,Consolas,monospace" font-size="7.9" fill="#334155">Latensi Total: 1.420 ms (&lt; 3s SLA)</text>

    <rect x="274" y="198" width="174" height="20" rx="2" fill="#0f172a" />
    <text x="361" y="211" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" fill="#86efac">PADDLEOCR v4.3 · GPU-T4-02 OK</text>
  </svg>`;

  const waterfallSvg = svgSpanWaterfall({
    width: 458,
    totalMs: 1420,
    spans: [
      { label: '1. Upload & Deskew', start: 0, dur: 140, color: '#64748b' },
      { label: '2. PaddleOCR Det+Rec', start: 140, dur: 760, color: '#4338ca' },
      { label: '3. Validasi NPWP Master', start: 900, dur: 190, color: '#0369a1' },
      { label: '4. Cek Duplikat SHA-256', start: 1090, dur: 150, color: '#b45309' },
      { label: '5. Kredit Points Ledger', start: 1240, dur: 180, color: '#047857' },
    ],
  });

  const html = `
    <div class="facet-bar">
      <div class="facet-group">
        <span style="font-size:10.5px;font-weight:700;color:#475569;display:inline-flex;align-items:center;gap:5px;">
          ${ic('filter', 12, '#4338ca')} Filter Antrean:
        </span>
        <span class="f-chip is-on">Semua (18)</span>
        <span class="f-chip">Masuk Poin (13)</span>
        <span class="f-chip" style="border-color:#fde68a;background:#fffbeb;color:#b45309;">Tinjau Manual &lt;95% (3)</span>
        <span class="f-chip" style="border-color:#fecdd3;background:#fff1f2;color:#be123c;">Duplikat / Fraud (2)</span>
        <span class="f-chip">Mal: Semua 6 Properti</span>
      </div>
      <div class="facet-group">
        ${badge('SLA OCR < 3.000 ms: 99,4% Tercapai', 'ok')}
        ${badge('Queue Depth: 14 Citra', 'info')}
      </div>
    </div>

    <div class="g-2" style="grid-template-columns:1.86fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#4338ca')} <span>Antrean Verifikasi Struk Belanja & Ekstraksi NPWP (18 Transaksi Aktif)</span></div>
          <span class="e-panel-sub">Klik baris untuk inspeksi bounding-box PaddleOCR</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table dense">
            <colgroup>
              <col style="width:3.2%;" />
              <col style="width:8.2%;" />
              <col style="width:7.6%;" />
              <col style="width:19.5%;" />
              <col style="width:15.5%;" />
              <col style="width:9.5%;" />
              <col style="width:8.0%;" />
              <col style="width:7.0%;" />
              <col style="width:6.2%;" />
              <col style="width:6.3%;" />
              <col style="width:9.0%;" />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>Kode</th>
                <th>Waktu</th>
                <th>Tenant & Mal</th>
                <th>NPWP Merchant</th>
                <th class="num">Bruto (Rp)</th>
                <th class="num">PPN 11%</th>
                <th class="num">Poin</th>
                <th class="num">Conf</th>
                <th class="num">Latensi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${OCR_RECEIPTS.map(
                (r) => `<tr class="${r.selected ? 'is-selected' : r.bad ? 'is-bad' : r.warn ? 'is-warn' : ''}">
                  <td><span class="cb ${r.selected ? 'checked' : ''}">${r.selected ? ic('check', 9, '#fff') : ''}</span></td>
                  <td class="mono" style="font-weight:700;color:#312e81;">${esc(r.id)}</td>
                  <td class="mono" style="color:#64748b;">${esc(r.time)}</td>
                  <td>
                    <div style="font-weight:600;color:#0f172a;" class="trunc">${esc(r.tenant)}</div>
                    <div style="font-size:9px;color:#64748b;" class="trunc">${esc(r.mall)} · ${esc(r.no)}</div>
                  </td>
                  <td class="mono" style="font-size:9.6px;color:#334155;">${esc(r.npwp)}</td>
                  <td class="num mono" style="font-weight:600;">${fmtNum(r.gross)}</td>
                  <td class="num mono" style="color:#475569;">${fmtNum(r.ppn)}</td>
                  <td class="num mono" style="font-weight:700;color:${r.pts > 0 ? '#047857' : '#be123c'};">${r.pts > 0 ? '+' + fmtNum(r.pts) : '0'}</td>
                  <td class="num mono" style="color:${r.conf < 95 ? '#b45309' : '#047857'};font-weight:600;">${r.conf.toFixed(1).replace('.', ',')}%</td>
                  <td class="num mono">${(r.ms / 1000).toFixed(2).replace('.', ',')}s</td>
                  <td>${badge(r.status, r.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL 18 STRUK ANTREAN (DPP Rp ${fmtNum(sumDpp)})</td>
                <td class="num mono">${fmtNum(sumGross)}</td>
                <td class="num mono">${fmtNum(sumPpn)}</td>
                <td class="num mono" style="color:#047857;">+${fmtNum(sumPts)}</td>
                <td class="num mono">97,8%</td>
                <td class="num mono">1,56s</td>
                <td>${badge('Verif OK', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;align-items:center;font-size:10px;">
            <span style="color:#475569;">Aturan Anti-Fraud: Struk > Rp 2.500.000 atau Confidence &lt; 95% otomatis masuk antrean Checker.</span>
            <div style="display:flex;gap:6px;">
              <span class="e-btn">Setujui Batch (3 Tinjau)</span>
              <span class="e-btn e-btn-danger">Karantina Fraud (2)</span>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#4338ca')} <span>Inspektor PaddleOCR · RCP-902</span></div>
          ${badge('Masuk Poin +450', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:8px 10px;">
          ${receiptSvg}

          <div style="border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;background:#ffffff;">
            <div style="font-size:10px;font-weight:700;color:#312e81;margin-bottom:4px;">HASIL EKSTRAKSI & VERIFIKASI LEDGER</div>
            <div class="kv-row"><span class="kv-k">Entitas Merchant</span><span class="kv-v">PT Fast Retailing Indonesia</span></div>
            <div class="kv-row"><span class="kv-k">NPWP Terdaftar</span><span class="kv-v mono">01.308.449.2-092.000 (Aktif)</span></div>
            <div class="kv-row"><span class="kv-k">Struk / Tanggal</span><span class="kv-v mono">#UQ-88124 · 2026-11-20</span></div>
            <div class="kv-row"><span class="kv-k">Member Penerima</span><span class="kv-v mono">ML-88412-GLD · Plat B 1842 KJP</span></div>
            <div class="kv-row"><span class="kv-k">Nominal -> Poin</span><span class="kv-v mono" style="color:#047857;">Rp 450.000 -> +450 pts (1x Gold)</span></div>
            <div class="kv-row"><span class="kv-k">Dedup SHA-256</span><span class="kv-v mono" style="font-size:9.2px;">9a4f8c...e21b04 (Unik · 0 Konflik)</span></div>
          </div>

          <div style="border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;background:#f8f9fc;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:10px;font-weight:700;color:#0f172a;">Span Waterfall Latensi OCR (1.420 ms)</span>
              <span class="mono" style="font-size:9.3px;color:#047857;font-weight:700;">52,7% dibawah SLA 3s</span>
            </div>
            ${waterfallSvg}
          </div>

          <div style="display:flex;gap:6px;justify-content:space-between;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 12, '#fff')} Konfirmasi Ledger</span>
            <span class="e-btn" style="flex:1;justify-content:center;">Minta Foto Ulang</span>
            <span class="e-btn e-btn-danger">Tandai Fraud</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return fiorishell({
    title: 'Workbench Verifikasi Struk OCR & Inspektor PaddleOCR',
    activeId: 'p2',
    crumbSection: 'Operasional Loyalitas',
    crumbTitle: 'Workbench Verifikasi Struk OCR & Validasi NPWP Merchant',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 12)} Ambang Confidence (95,0%)</span>
      <span class="e-btn e-btn-primary">${ic('play', 12, '#fff')} Jalankan Uji OCR Sampel</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 3: COMMAND PARKIR ANPR, PETA BASEMENT B2 & GERBANG QRIS
// ============================================================================
function renderP3() {
  const gateStream = [
    { plate: 'B 1842 KJP', gate: 'ZONE-C4 (IN)', bridge: 'SecureParking', dur: '2j 18m', fee: 15000, method: '300 pts / QRIS', status: 'Aktif · Gold', tone: 'accent', selected: true },
    { plate: 'B 2719 SSV', gate: 'OUT-01 QRIS', bridge: 'SecureParking', dur: '1j 42m', fee: 10000, method: 'QRIS BCA', status: 'Gate Terbuka', tone: 'ok' },
    { plate: 'B 1094 RFS', gate: 'OUT-02 VIP', bridge: 'SecureParking', dur: '3j 05m', fee: 0, method: 'Platinum Free', status: 'Gate Terbuka', tone: 'ok' },
    { plate: 'L 1482 ABD', gate: 'TJN-OUT-03', bridge: 'CentrePark', dur: '2j 51m', fee: 15000, method: 'Tukar 300 pts', status: 'Gate Terbuka', tone: 'ok' },
    { plate: 'D 1662 XZA', gate: 'CHM-OUT-01', bridge: 'CentrePark', dur: '4j 12m', fee: 25000, method: 'QRIS Mandiri', status: 'Gate Terbuka', tone: 'ok' },
    { plate: 'B 2190 UYK', gate: 'IN-02 ANPR', bridge: 'SecureParking', dur: '0j 04m', fee: 5000, method: 'Terikat App', status: 'Masuk B2-A2', tone: 'info' },
    { plate: 'B 1920 KLM', gate: 'OUT-03 QRIS', bridge: 'SecureParking', dur: '1j 15m', fee: 10000, method: 'QRIS BRI', status: 'Menunggu Bayar', tone: 'warn', warn: true },
    { plate: 'L 1889 PQR', gate: 'PHB-OUT-02', bridge: 'SecureParking', dur: '2j 08m', fee: 15000, method: 'Tukar 300 pts', status: 'Gate Terbuka', tone: 'ok' },
    { plate: 'B 1504 JKT', gate: 'VALET-B2', bridge: 'SecureParking', dur: '3j 44m', fee: 0, method: 'Black VIP', status: 'Valet Siap', tone: 'dark' },
    { plate: 'B 2844 WZX', gate: 'KMG-OUT-01', bridge: 'CentrePark', dur: '0j 52m', fee: 5000, method: 'e-Money Flazz', status: 'Gate Terbuka', tone: 'neutral' },
    { plate: 'D 1102 BDG', gate: 'CHM-IN-02', bridge: 'CentrePark', dur: '0j 19m', fee: 5000, method: 'Terikat App', status: 'Masuk B1-B3', tone: 'info' },
  ];

  // Architectural Basement B2 SVG Schematic (Grand Sudirman Superblock)
  const renderBayRow = (x, y, count, colsOccupied, highlightIdx = -1, bayType = 'std') => {
    let s = '';
    const w = 22;
    const h = 34;
    for (let i = 0; i < count; i++) {
      const bx = x + i * (w + 3);
      const isHi = i === highlightIdx;
      const isOcc = colsOccupied.includes(i);
      const fill = isHi
        ? '#4338ca'
        : bayType === 'ev'
          ? isOcc ? '#0369a1' : '#e0f2fe'
          : bayType === 'vip'
            ? isOcc ? '#312e81' : '#eef2ff'
            : isOcc ? '#cbd5e1' : '#ecfdf5';
      const stroke = isHi ? '#1e1b4b' : isOcc ? '#94a3b8' : '#10b981';
      s += `<rect x="${bx}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${isHi ? '1.8' : '0.9'}" />`;
      if (isHi) {
        s += `<circle cx="${bx + w / 2}" cy="${y + h / 2}" r="4" fill="#ffffff" />`;
      } else if (isOcc) {
        s += `<rect x="${bx + 5}" y="${y + 7}" width="12" height="20" rx="2" fill="${bayType === 'vip' || bayType === 'ev' ? '#ffffff' : '#64748b'}" fill-opacity="0.45" />`;
      }
    }
    return s;
  };

  const floorplanSvg = `<svg viewBox="0 0 880 510" width="100%" height="552" style="display:block;background:#f8f9fc;border:1px solid #cbd5e1;border-radius:3px;">
    <!-- Outer Concrete Wall -->
    <rect x="14" y="14" width="852" height="482" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />

    <!-- Top ANPR Gate Portal Strip -->
    <rect x="26" y="24" width="828" height="58" rx="3" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
    <text x="38" y="40" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#334155">PORTAL GERBANG ANPR (SECUREPARKING BRIDGE · KAMERA LPR 60 FPS)</text>

    <!-- 4 ANPR Gate Cards -->
    <g transform="translate(38,47)">
      <rect x="0" y="0" width="186" height="28" rx="3" fill="#ecfdf5" stroke="#047857" stroke-width="1" />
      <circle cx="11" cy="14" r="4" fill="#10b981" />
      <text x="20" y="12" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" font-weight="700" fill="#064e3b">GATE-IN-01 · MASUK UTARA</text>
      <text x="20" y="23" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#047857">ANPR OK · 38 ms · 142/jam</text>
    </g>
    <g transform="translate(238,47)">
      <rect x="0" y="0" width="186" height="28" rx="3" fill="#ecfdf5" stroke="#047857" stroke-width="1" />
      <circle cx="11" cy="14" r="4" fill="#10b981" />
      <text x="20" y="12" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" font-weight="700" fill="#064e3b">GATE-IN-02 · MASUK SCBD</text>
      <text x="20" y="23" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#047857">Last: B 2190 UYK · Auto-Bind</text>
    </g>
    <g transform="translate(438,47)">
      <rect x="0" y="0" width="194" height="28" rx="3" fill="#eef2ff" stroke="#4338ca" stroke-width="1.2" />
      <circle cx="11" cy="14" r="4" fill="#4338ca" />
      <text x="20" y="12" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" font-weight="700" fill="#312e81">GATE-OUT-01 · QRIS / POIN</text>
      <text x="20" y="23" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#4338ca">Boom Open · B 2719 SSV (Paid)</text>
    </g>
    <g transform="translate(646,47)">
      <rect x="0" y="0" width="196" height="28" rx="3" fill="#f0f9ff" stroke="#0369a1" stroke-width="1" />
      <circle cx="11" cy="14" r="4" fill="#0284c7" />
      <text x="20" y="12" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" font-weight="700" fill="#0c4a6e">GATE-OUT-02 · VIP PLATINUM</text>
      <text x="20" y="23" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#0369a1">Free-Flow · B 1094 RFS (0 Rp)</text>
    </g>

    <!-- Driving Aisle Horizontal Top -->
    <rect x="26" y="90" width="828" height="22" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="4,3" />
    <text x="440" y="104" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#64748b">JALUR UTAMA BASEMENT B2  ---&gt;  ARAH ZONA A / B / C &amp; VALET VIP  ---&gt;</text>

    <!-- ZONA A (Left Block) -->
    <rect x="26" y="120" width="256" height="240" rx="3" fill="#fafbfe" stroke="#cbd5e1" stroke-width="1" />
    <rect x="26" y="120" width="256" height="22" rx="2" fill="#eef2ff" />
    <text x="35" y="135" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#312e81">ZONA A (A1–A4) · LIFT UTARA</text>
    <text x="274" y="135" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="9" font-weight="700" fill="#b45309">82% Terisi</text>
    ${renderBayRow(38, 152, 9, [0, 1, 2, 4, 5, 6, 7, 8])}
    <text x="154" y="201" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#94a3b8">Lajur A1–A2 (Satu Arah)</text>
    ${renderBayRow(38, 212, 9, [0, 1, 3, 4, 5, 7, 8])}
    ${renderBayRow(38, 256, 9, [0, 2, 3, 4, 5, 6, 7])}
    <text x="154" y="305" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#94a3b8">Lajur A3–A4 (Akses FoodHall)</text>
    ${renderBayRow(38, 315, 9, [1, 2, 3, 4, 5, 6, 8])}

    <!-- ZONA B (Center Block + EV Charging) -->
    <rect x="296" y="120" width="256" height="240" rx="3" fill="#fafbfe" stroke="#cbd5e1" stroke-width="1" />
    <rect x="296" y="120" width="256" height="22" rx="2" fill="#f0f9ff" />
    <text x="305" y="135" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#0369a1">ZONA B (B1–B4) · EV &amp; ATRIUM</text>
    <text x="544" y="135" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="9" font-weight="700" fill="#047857">76% Terisi</text>
    ${renderBayRow(308, 152, 9, [0, 1, 3, 4, 5, 6], -1, 'ev')}
    <text x="424" y="201" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#0369a1">B1: 9 Bay Fast EV Charger (22 kW)</text>
    ${renderBayRow(308, 212, 9, [0, 1, 2, 4, 5, 6, 7])}
    ${renderBayRow(308, 256, 9, [1, 2, 3, 5, 6, 7, 8])}
    <text x="424" y="305" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#94a3b8">Lajur B3–B4 (Lift Atrium Utama)</text>
    ${renderBayRow(308, 315, 9, [0, 2, 3, 4, 6, 7, 8])}

    <!-- ZONA C (Right Block — Highlighted Slot C4: B 1842 KJP) -->
    <rect x="566" y="120" width="288" height="240" rx="3" fill="#fafbfe" stroke="#4338ca" stroke-width="1.3" />
    <rect x="566" y="120" width="288" height="22" rx="2" fill="#eef2ff" />
    <text x="575" y="135" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#312e81">ZONA C (C1–C4) · MEMBER GOLD &amp; VALET</text>
    <text x="846" y="135" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="9" font-weight="700" fill="#4338ca">79% Terisi</text>
    ${renderBayRow(578, 152, 10, [0, 1, 2, 4, 5, 6, 8], -1, 'vip')}
    <text x="710" y="201" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#312e81">C1: Dedicated Bay Black VIP &amp; Valet</text>
    ${renderBayRow(578, 212, 10, [0, 1, 3, 4, 5, 6, 7, 9])}
    ${renderBayRow(578, 256, 10, [0, 2, 3, 4, 5, 7, 8])}
    <text x="710" y="305" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#4338ca" font-weight="700">C4: Akses Langsung Uniqlo &amp; VIP Lounge L3</text>
    ${renderBayRow(578, 315, 10, [0, 1, 2, 4, 5, 6, 8, 9], 3)}

    <!-- Callout Bubble for B 1842 KJP at Zona C4 -->
    <line x1="664" y1="350" x2="664" y2="384" stroke="#4338ca" stroke-width="1.6" />
    <rect x="492" y="384" width="362" height="98" rx="4" fill="#1e1b4b" stroke="#4338ca" stroke-width="1.5" />
    <text x="504" y="403" font-family="Cascadia Mono,Consolas,monospace" font-size="9.5" font-weight="700" fill="#ffffff">PLAT B 1842 KJP · ZONA C4-04</text>
    <rect x="774" y="391" width="68" height="16" rx="2" fill="#4338ca" />
    <text x="808" y="402" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.4" font-weight="700" fill="#ffffff">TIER: GOLD</text>
    <text x="504" y="422" font-family="Segoe UI,system-ui,sans-serif" font-size="9.2" fill="#c7d2fe">Masuk: 11:14 WIB (Gate IN-01) · Durasi Berjalan: 2 jam 18 menit</text>
    <text x="504" y="440" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" fill="#86efac">Tarif: Rp 15.000 | Opsi Gold: Tukar 300 pts (Gratis 3 Jam)</text>
    <text x="504" y="458" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" fill="#cbd5e1">Struk Terakhir: Uniqlo #UQ-88124 (+450 pts) · Saldo: 2.840 pts</text>
    <text x="504" y="473" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" fill="#fcd34d">Gerbang Keluar ANPR: Siap Auto-Open via QRIS atau Poin</text>

    <!-- Bottom Left Elevator Cores & Lobby Connectors -->
    <rect x="26" y="384" width="144" height="98" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="98" y="405" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#0f172a">LIFT LOBBY UTARA</text>
    <text x="98" y="422" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">4 Unit Lift · Aktif</text>
    <text x="98" y="439" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="8.5" fill="#64748b">Akses: FoodHall GF</text>
    <rect x="44" y="452" width="108" height="18" rx="2" fill="#ecfdf5" stroke="#a7f3d0" />
    <text x="98" y="464" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#047857">KIOSK QRIS: ONLINE</text>

    <rect x="184" y="384" width="144" height="98" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="256" y="405" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#0f172a">LIFT ATRIUM UTAMA</text>
    <text x="256" y="422" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">6 Unit Lift · Aktif</text>
    <text x="256" y="439" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="8.5" fill="#64748b">Akses: Uniqlo &amp; XXI</text>
    <rect x="202" y="452" width="108" height="18" rx="2" fill="#eef2ff" stroke="#c7d2fe" />
    <text x="256" y="464" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#312e81">EV CHARGER: 6/9 USE</text>

    <rect x="342" y="384" width="142" height="98" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="413" y="405" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#0f172a">DESK VALET VIP</text>
    <text x="413" y="422" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.5" fill="#475569">14/22 Slot Terisi</text>
    <text x="413" y="439" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="8.5" fill="#64748b">Akses: VIP Lounge L3</text>
    <rect x="360" y="452" width="106" height="18" rx="2" fill="#0f172a" />
    <text x="413" y="464" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#e2e8f0">VIP CONCIERGE OK</text>
  </svg>`;

  const html = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Okupansi Parkir ANPR (6 Mal)</span>${badge('75,2%', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_OCCUPIED)} / ${fmtNum(TOTAL_SLOTS)}</span></div>
        <div class="e-kpi-foot"><span>Grand Sudirman: 1.462 / 1.840 (79,5%)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kesehatan Gerbang ANPR</span>${badge('24/24 Online', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">99,6% LPR</span></div>
        <div class="e-kpi-foot"><span>SecureParking (42 ms) · CentrePark (58 ms)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rata-Rata Durasi Kunjungan</span>${badge('+14m YoY', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">2j 18m</span></div>
        <div class="e-kpi-foot"><span>Member Gold/VIP: 3j 04m (+46m vs Reguler)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Pembayaran Cashless App</span>${badge('Zero Antrean', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">94,6%</span></div>
        <div class="e-kpi-foot"><span>QRIS 68,4% · Tukar Poin 26,2% · e-Money 5,4%</span></div>
      </div>
    </div>

    <div class="g-2" style="grid-template-columns:1.48fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#4338ca')} <span>Denah Sensor & Gerbang ANPR — Grand Sudirman Superblock (Basement B2)</span></div>
          <div style="display:flex;gap:8px;align-items:center;font-size:9.5px;color:#475569;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;background:#ecfdf5;border:1px solid #10b981;display:inline-block;"></span>Kosong</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;background:#cbd5e1;border:1px solid #94a3b8;display:inline-block;"></span>Terisi</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;background:#4338ca;display:inline-block;"></span>Plat Terpilih</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;background:#0369a1;display:inline-block;"></span>EV 22kW</span>
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;">
          ${floorplanSvg}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:8px;">
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.5px;font-weight:700;color:#334155;">Zona A (Reguler)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;margin:2px 0;">412 / 502 Bay</div>
              ${renderCapacityBar(82, { warnAt: 80 })}
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.5px;font-weight:700;color:#0369a1;">Zona B (EV &amp; Atrium)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;margin:2px 0;">368 / 484 Bay</div>
              ${renderCapacityBar(76, { warnAt: 80 })}
            </div>
            <div style="border:1px solid #c7d2fe;border-radius:3px;padding:6px 8px;background:#eef2ff;">
              <div style="font-size:9.5px;font-weight:700;color:#312e81;">Zona C (Gold &amp; VIP)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#1e1b4b;margin:2px 0;">458 / 580 Bay</div>
              ${renderCapacityBar(79, { warnAt: 85 })}
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.5px;font-weight:700;color:#047857;">Valet VIP &amp; Priority</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;margin:2px 0;">224 / 274 Bay</div>
              ${renderCapacityBar(81, { warnAt: 85 })}
            </div>
          </div>
        </div>
      </section>

      <div class="g-col">
        <section class="e-panel" style="height:444px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#4338ca')} <span>Stream Transaksi Gerbang ANPR &amp; Pembayaran QRIS</span></div>
            ${badge('Live Feed', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:18%;" />
                <col style="width:17%;" />
                <col style="width:11%;" />
                <col style="width:14%;" />
                <col style="width:20%;" />
                <col style="width:20%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Plat Nomor</th>
                  <th>Gerbang</th>
                  <th class="num">Durasi</th>
                  <th class="num">Tarif</th>
                  <th>Metode Bayar</th>
                  <th>Status Gate</th>
                </tr>
              </thead>
              <tbody>
                ${gateStream
                  .map(
                    (g) => `<tr class="${g.selected ? 'is-selected' : g.warn ? 'is-warn' : ''}">
                    <td class="mono" style="font-weight:700;color:#0f172a;">${esc(g.plate)}</td>
                    <td class="mono" style="font-size:9.5px;color:#475569;">${esc(g.gate)}</td>
                    <td class="num mono">${esc(g.dur)}</td>
                    <td class="num mono" style="font-weight:600;">${fmtIdr(g.fee)}</td>
                    <td style="font-size:9.8px;color:#334155;">${esc(g.method)}</td>
                    <td>${badge(g.status, g.tone)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('key', 13, '#4338ca')} <span>Aturan Tarif Parkir &amp; Konversi Poin Member</span></div>
            <span class="e-panel-sub">Berlaku 6 Mal</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table dense">
              <colgroup>
                <col style="width:24%;" />
                <col style="width:22%;" />
                <col style="width:28%;" />
                <col style="width:26%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Tier / Jenis</th>
                  <th>Tarif Dasar</th>
                  <th>Konversi Poin ANPR</th>
                  <th>Fasilitas Tambahan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight:600;">Reguler Umum</td>
                  <td class="mono">Rp 5.000/jam</td>
                  <td>QRIS Dinamis / e-Money</td>
                  <td>Bayar di Aplikasi</td>
                </tr>
                <tr>
                  <td style="font-weight:600;">Silver Member</td>
                  <td class="mono">Rp 5.000/jam</td>
                  <td class="mono">500 pts = Gratis 2 Jam</td>
                  <td>Auto-Bind 1 Plat</td>
                </tr>
                <tr class="is-selected">
                  <td style="font-weight:700;color:#312e81;">Gold Member</td>
                  <td class="mono">Rp 5.000/jam</td>
                  <td class="mono" style="color:#047857;font-weight:700;">300 pts = Gratis 3 Jam</td>
                  <td>Zona C · 2 Plat Aktif</td>
                </tr>
                <tr>
                  <td style="font-weight:600;">Platinum Member</td>
                  <td class="mono">Gratis 4 Jam</td>
                  <td class="mono">200 pts / jam berikutnya</td>
                  <td>Valet Diskon 50%</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Black VIP</td>
                  <td class="mono" style="color:#047857;">Gratis Penuh</td>
                  <td class="mono">0 pts (Free-Flow Gate)</td>
                  <td>Valet VIP &amp; Bay C1</td>
                </tr>
                <tr>
                  <td style="font-weight:600;color:#0369a1;">EV Charging 22kW</td>
                  <td class="mono">Rp 2.400/kWh</td>
                  <td class="mono">250 pts = 10 kWh</td>
                  <td>Zona B1 (9 Fast Bay)</td>
                </tr>
              </tbody>
            </table>
            <div style="padding:6px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.8px;color:#475569;">
              <span>Bridge: <strong class="mono" style="color:#047857;">SecureParking v4.2 (42ms)</strong> · <strong class="mono" style="color:#047857;">CentrePark v3.9 (58ms)</strong></span>
              <span>Auto-Open Gate: <strong class="mono" style="color:#0f172a;">&lt; 1,8 dtk</strong></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return fiorishell({
    title: 'Komando Parkir ANPR, Peta Basement B2 & Gerbang QRIS',
    activeId: 'p3',
    crumbSection: 'Operasional Parkir',
    crumbTitle: 'Komando Parkir ANPR, Denah Basement B2 & Pembayaran QRIS',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 12)} Uji Koneksi Bridge Gate</span>
      <span class="e-btn e-btn-primary">${ic('zap', 12, '#fff')} Override Buka Palang Darurat</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 4: ANALITIK CROSS-SHOPPING & SIMULASI LIABILITAS PSAK 72
// ============================================================================
function renderP4() {
  const cats = ['Fashion', 'F&B', 'Bioskop', 'Supermkt', 'Kopi/Roti', 'Beauty', 'Elektronik', 'KidZone'];
  const matrix = [
    [100, 64.2, 22.4, 31.8, 49.4, 38.6, 14.2, 11.5],
    [52.8, 100, 34.1, 41.2, 46.8, 28.4, 16.5, 24.6],
    [28.4, 58.6, 100, 18.4, 42.1, 15.2, 9.4, 19.8],
    [34.6, 44.8, 14.2, 100, 39.5, 29.1, 12.8, 21.4],
    [48.2, 41.6, 26.8, 33.2, 100, 31.4, 18.6, 13.2],
    [56.4, 49.2, 17.5, 32.4, 44.8, 100, 11.2, 8.4],
    [24.1, 38.4, 16.2, 22.8, 35.6, 14.8, 100, 7.6],
    [29.8, 61.4, 31.2, 48.6, 36.2, 12.4, 8.8, 100],
  ];

  function cellStyle(v, isDiag) {
    if (isDiag) return 'background:#eef2ff;color:#6366f1;font-weight:700;';
    if (v >= 55) return 'background:#4338ca;color:#ffffff;font-weight:700;';
    if (v >= 42) return 'background:#818cf8;color:#ffffff;font-weight:700;';
    if (v >= 28) return 'background:#c7d2fe;color:#1e1b4b;font-weight:600;';
    if (v >= 16) return 'background:#e0e7ff;color:#312e81;font-weight:500;';
    return 'background:#f8fafc;color:#64748b;font-weight:500;';
  }

  // PSAK 72 Liability Waterfall SVG (2.140 -> +958 -> -412.5 -> -184.2 -> -136.3 -> 2.365 M)
  const wfBars = [
    { label: 'Saldo Awal', sub: '01 Nov', val: 2140, base: 0, hVal: 2140, color: '#475569', txt: '2,140 M' },
    { label: '(+) Terbit', sub: '95,8 Jt pts', val: 958, base: 2140, hVal: 958, color: '#4338ca', txt: '+0,958 M' },
    { label: '(-) Voucher', sub: 'F&B/Ritel', val: -412.5, base: 2685.5, hVal: 412.5, color: '#047857', txt: '-0,413 M' },
    { label: '(-) Parkir', sub: 'ANPR 300p', val: -184.2, base: 2501.3, hVal: 184.2, color: '#0369a1', txt: '-0,184 M' },
    { label: '(-) Breakage', sub: 'PSAK 72', val: -136.3, base: 2365.0, hVal: 136.3, color: '#b45309', txt: '-0,136 M' },
    { label: 'Saldo Akhir', sub: '22 Nov', val: 2365, base: 0, hVal: 2365, color: '#1e1b4b', txt: '2,365 M' },
  ];

  const wfW = 660;
  const wfH = 204;
  const maxWf = 3300;
  const padL = 46;
  const padT = 22;
  const padB = 34;
  const plotH = wfH - padT - padB;
  const yWf = (v) => padT + plotH - (v / maxWf) * plotH;
  const slotW = (wfW - padL - 14) / wfBars.length;
  const barW = 58;

  let wfSvgInner = '';
  [0, 1000, 2000, 3000].forEach((t) => {
    const y = yWf(t);
    wfSvgInner += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${wfW - 10}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-dasharray="${t === 0 ? '' : '2,3'}" />`;
    wfSvgInner += `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="8.8" font-family="Cascadia Mono,Consolas,monospace" fill="#64748b">${(t / 1000).toFixed(1)}M</text>`;
  });

  wfBars.forEach((b, i) => {
    const cx = padL + i * slotW + (slotW - barW) / 2;
    const topVal = b.base + b.hVal;
    const yTop = yWf(topVal);
    const yBot = yWf(b.base);
    const bh = Math.max(4, yBot - yTop);
    wfSvgInner += `<rect x="${cx.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barW}" height="${bh.toFixed(1)}" rx="2" fill="${b.color}" />`;
    wfSvgInner += `<text x="${(cx + barW / 2).toFixed(1)}" y="${(yTop - 5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" font-family="Cascadia Mono,Consolas,monospace" fill="${b.color}">${b.txt}</text>`;
    wfSvgInner += `<text x="${(cx + barW / 2).toFixed(1)}" y="${wfH - 18}" text-anchor="middle" font-size="9.2" font-weight="700" font-family="Segoe UI,system-ui,sans-serif" fill="#0f172a">${b.label}</text>`;
    wfSvgInner += `<text x="${(cx + barW / 2).toFixed(1)}" y="${wfH - 6}" text-anchor="middle" font-size="8.2" font-family="Cascadia Mono,Consolas,monospace" fill="#64748b">${b.sub}</text>`;
  });

  const waterfallChart = `<svg viewBox="0 0 ${wfW} ${wfH}" width="100%" height="${wfH}" style="display:block;">${wfSvgInner}</svg>`;

  const totalMembers = TIERS.reduce((a, t) => a + t.members, 0);
  const totalPerkCost = TIERS.reduce((a, t) => a + t.perkCost, 0);
  const totalNetMargin = TIERS.reduce((a, t) => a + t.netMargin, 0);

  const html = `
    <div class="g-2" style="grid-template-columns:1.15fr 1fr;height:492px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#4338ca')} <span>Matriks Afinitas Cross-Shopping Antar Kategori Tenant (Jendela 90 Menit)</span></div>
          ${badge('Tim Leasing Mal · 170,5k Struk', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:9px 10px;">
          <table class="e-table" style="border:1px solid #d5dae4;font-size:10.6px;">
            <thead>
              <tr>
                <th style="width:14%;padding:6.5px 6px;">Asal \\ Tujuan</th>
                ${cats.map((c) => `<th class="num" style="text-align:center;padding:6.5px 4px;">${esc(c)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${matrix
                .map(
                  (row, ri) => `<tr>
                  <td style="font-weight:700;background:#f8f9fc;color:#0f172a;padding:7px 6px;">${esc(cats[ri])}</td>
                  ${row
                    .map(
                      (val, ci) => `<td class="mono" style="text-align:center;padding:7px 4px;${cellStyle(val, ri === ci)}">${ri === ci ? '—' : val.toFixed(1).replace('.', ',') + '%'}</td>`
                    )
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
          </table>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:#f8f9fc;border:1px solid #e2e8f0;border-radius:3px;font-size:9.3px;color:#475569;">
            <span>Intensitas Konversi Lintas Tenant (90 menit):</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#f8fafc;border:1px solid #cbd5e1;display:inline-block;"></span>&lt;16%</span>
              <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#e0e7ff;display:inline-block;"></span>16–27%</span>
              <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#c7d2fe;display:inline-block;"></span>28–41%</span>
              <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#818cf8;display:inline-block;"></span>42–54%</span>
              <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;background:#4338ca;display:inline-block;"></span>&gt;=55%</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div style="border:1px solid #c7d2fe;background:#eef2ff;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;font-weight:700;color:#312e81;">Korelasi Tertinggi #1</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin:2px 0;">Fashion -> F&amp;B Casual (64,2%)</div>
              <div style="font-size:9.3px;color:#475569;">Uniqlo &amp; Zara mendorong rata-rata Rp 285rb di resto lantai sama.</div>
            </div>
            <div style="border:1px solid #d5dae4;background:#f8f9fc;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;font-weight:700;color:#047857;">Korelasi Keluarga #2</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin:2px 0;">KidZone -> F&amp;B &amp; Supermkt (61,4%)</div>
              <div style="font-size:9.3px;color:#475569;">Rekomendasi leasing: relokasi tenant kopi dekat eskalator KidZone.</div>
            </div>
            <div style="border:1px solid #d5dae4;background:#f8f9fc;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;font-weight:700;color:#0369a1;">Efek Bioskop XXI #3</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin:2px 0;">Bioskop -> F&amp;B (58,6%)</div>
              <div style="font-size:9.3px;color:#475569;">Voucher F&amp;B 500 pts pasca-tiket menaikkan durasi parkir +42 menit.</div>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#4338ca')} <span>Simulator Liabilitas Poin &amp; Breakage PSAK 72 (What-If)</span></div>
          ${badge('Skenario: Baseline Q4', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.2px;color:#64748b;font-weight:600;">Rasio Perolehan</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">1 pt / Rp 1.000</div>
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.2px;color:#64748b;font-weight:600;">Nilai Wajar Poin</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">Rp 10,00 / pt</div>
            </div>
            <div style="border:1px solid #c7d2fe;border-radius:3px;padding:6px 8px;background:#eef2ff;">
              <div style="font-size:9.2px;color:#312e81;font-weight:700;">Asumsi Breakage</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#4338ca;">18,4% (Aktuaria)</div>
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.2px;color:#64748b;font-weight:600;">Co-Funding Tenant</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#047857;">40,0% (Rp 383 Jt)</div>
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.2px;color:#64748b;font-weight:600;">Masa Berlaku Poin</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">12 Bulan Rolling</div>
            </div>
            <div style="border:1px solid #d5dae4;border-radius:3px;padding:6px 8px;background:#f8f9fc;">
              <div style="font-size:9.2px;color:#64748b;font-weight:600;">Rasio Redempsi MTD</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0369a1;">62,3% Terpakai</div>
            </div>
          </div>

          <div style="border:1px solid #e2e8f0;border-radius:3px;padding:6px 8px;background:#ffffff;">
            <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:2px;">Jembatan Mutasi Liabilitas Poin Ditangguhkan (Rp Miliar · Nov 2026)</div>
            ${waterfallChart}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 9px;background:#1e1b4b;color:#ffffff;border-radius:3px;font-size:10.2px;">
            <span>Saldo Akhir Liabilitas PSAK 72 (22 Nov 2026):</span>
            <strong class="mono" style="font-size:12.5px;color:#a5b4fc;">${fmtIdr(WATERFALL.closing)}</strong>
          </div>
        </div>
      </section>
    </div>

    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('users', 13, '#4338ca')} <span>Ekonomi Tier Member, Utilisasi Keistimewaan &amp; ROI Program (418.420 Member Aktif)</span></div>
        <span class="e-panel-sub">Evaluasi Valet VIP, VIP Lounge Lantai 3, Voucher Ulang Tahun &amp; Parkir Gratis</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.6px;">
          <colgroup>
            <col style="width:13%;" />
            <col style="width:13%;" />
            <col style="width:8%;" />
            <col style="width:7%;" />
            <col style="width:10%;" />
            <col style="width:24%;" />
            <col style="width:9%;" />
            <col style="width:7%;" />
            <col style="width:9%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Tier Member</th>
              <th>Syarat Kualifikasi</th>
              <th class="num">Member</th>
              <th class="num">Pangsa</th>
              <th class="num">GMV MTD</th>
              <th>Keistimewaan Aktif</th>
              <th class="num">Biaya Perks</th>
              <th class="num">Cost/GMV</th>
              <th class="num">Margin Nett</th>
            </tr>
          </thead>
          <tbody>
            ${TIERS.map(
              (t, idx) => `<tr class="${idx === 1 ? 'is-selected' : ''}">
                <td style="padding:8px 7px;">${badge(t.name, t.tone)}</td>
                <td style="font-size:9.8px;color:#475569;">${esc(t.req)}</td>
                <td class="num mono" style="font-weight:700;">${fmtNum(t.members)}</td>
                <td class="num mono">${((t.members / totalMembers) * 100).toFixed(1).replace('.', ',')}%</td>
                <td class="num mono" style="font-weight:700;">Rp ${(t.gmvMtd / 1e9).toFixed(2).replace('.', ',')} M</td>
                <td style="font-size:9.8px;color:#334155;">${esc(t.perks)}</td>
                <td class="num mono">${fmtIdr(t.perkCost)}</td>
                <td class="num mono">${t.costRatio.toFixed(2).replace('.', ',')}%</td>
                <td class="num mono" style="font-weight:700;color:#047857;">Rp ${(t.netMargin / 1e9).toFixed(2).replace('.', ',')} M</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:7px 7px;">TOTAL PROGRAM LOYALITAS (4 TIER)</td>
              <td class="num mono">${fmtNum(totalMembers)}</td>
              <td class="num mono">100,0%</td>
              <td class="num mono">Rp 95,80 M</td>
              <td style="font-size:9.8px;font-weight:600;color:#312e81;">Rata-rata Rasio Biaya Program: 1,06% dari GMV</td>
              <td class="num mono">${fmtIdr(totalPerkCost)}</td>
              <td class="num mono">1,06%</td>
              <td class="num mono" style="color:#047857;">Rp ${(totalNetMargin / 1e9).toFixed(2).replace('.', ',')} M</td>
            </tr>
          </tfoot>
        </table>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px 12px;background:#f8f9fc;border-top:1px solid #d5dae4;">
          <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:4px;">
              <span>Parkir Gratis 3 Jam (Gold)</span><span class="mono" style="color:#4338ca;">91%</span>
            </div>
            ${renderCapacityBar(91, { warnAt: 95, critAt: 99, showLabel: false })}
            <div style="font-size:9.1px;color:#64748b;margin-top:4px;">18.420 sesi · Hemat Rp 184,2 Jt</div>
          </div>
          <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:4px;">
              <span>Voucher Ulang Tahun</span><span class="mono" style="color:#047857;">86%</span>
            </div>
            ${renderCapacityBar(86, { warnAt: 95, critAt: 99, showLabel: false })}
            <div style="font-size:9.1px;color:#64748b;margin-top:4px;">4.120 kupon diklaim · Avg basket 3,8x</div>
          </div>
          <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:4px;">
              <span>Valet VIP (Platinum/Black)</span><span class="mono" style="color:#b45309;">78%</span>
            </div>
            ${renderCapacityBar(78, { warnAt: 75, critAt: 92, showLabel: false })}
            <div style="font-size:9.1px;color:#64748b;margin-top:4px;">2.840 unit · Rata-rata ambil 4,2 mnt</div>
          </div>
          <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:4px;">
              <span>VIP Lounge Lantai 3</span><span class="mono" style="color:#047857;">64%</span>
            </div>
            ${renderCapacityBar(64, { warnAt: 80, critAt: 92, showLabel: false })}
            <div style="font-size:9.1px;color:#64748b;margin-top:4px;">6.190 kunjungan · Akses NFC/QR Pass</div>
          </div>
        </div>
      </div>
    </section>
  `;

  return fiorishell({
    title: 'Afinitas Cross-Shopping & Simulasi Liabilitas PSAK 72',
    activeId: 'p4',
    crumbSection: 'Analitik & Aktuaria',
    crumbTitle: 'Pola Cross-Shopping Leasing & Simulator Liabilitas Poin PSAK 72',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12)} Ekspor Deck Tim Leasing</span>
      <span class="e-btn e-btn-primary">${ic('sliders', 12, '#fff')} Simpan Skenario Aktuaria Q4</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 5: SETTLEMENT TENANT, JURNAL PSAK 72 & CORETAX XML E-FAKTUR
// ============================================================================
function renderP5() {
  const sumDebit = JOURNAL_ENTRIES.reduce((a, j) => a + j.debit, 0);
  const sumCredit = JOURNAL_ENTRIES.reduce((a, j) => a + j.credit, 0);
  const sumTx = QRIS_BANKS.reduce((a, b) => a + b.tx, 0);
  const sumGross = QRIS_BANKS.reduce((a, b) => a + b.gross, 0);
  const sumMdr = QRIS_BANKS.reduce((a, b) => a + b.mdr, 0);
  const sumNett = QRIS_BANKS.reduce((a, b) => a + b.nett, 0);

  const coretaxXml = `<span class="xml-cm">&lt;!-- CoreTax DJP e-Faktur XML v2.1 · PMK 131/2024 --&gt;</span>
<span class="xml-tag">&lt;TaxInvoiceBulk</span> <span class="xml-attr">xmlns</span>=<span class="xml-val">"urn:djp:coretax:efaktur:v2.1"</span><span class="xml-tag">&gt;</span>
  <span class="xml-tag">&lt;TIN&gt;</span>0100288450910000<span class="xml-tag">&lt;/TIN&gt;</span> <span class="xml-cm">&lt;!-- PT Nusantara Properti Tbk --&gt;</span>
  <span class="xml-tag">&lt;ListOfTaxInvoice&gt;</span>
    <span class="xml-tag">&lt;TaxInvoice&gt;</span>
      <span class="xml-tag">&lt;TaxInvoiceDate&gt;</span>2026-11-22<span class="xml-tag">&lt;/TaxInvoiceDate&gt;</span>
      <span class="xml-tag">&lt;TaxInvoiceOpt&gt;</span>Normal<span class="xml-tag">&lt;/TaxInvoiceOpt&gt;</span>
      <span class="xml-tag">&lt;TrxCode&gt;</span>04<span class="xml-tag">&lt;/TrxCode&gt;</span> <span class="xml-cm">&lt;!-- DPP Nilai Lain 11/12 --&gt;</span>
      <span class="xml-tag">&lt;RefDesc&gt;</span>INV-CF-202611-SCBD-014<span class="xml-tag">&lt;/RefDesc&gt;</span>
      <span class="xml-tag">&lt;BuyerTin&gt;</span>0130844920920000<span class="xml-tag">&lt;/BuyerTin&gt;</span>
      <span class="xml-tag">&lt;BuyerName&gt;</span>PT FAST RETAILING INDONESIA<span class="xml-tag">&lt;/BuyerName&gt;</span>
      <span class="xml-tag">&lt;ListOfGoodService&gt;</span>
        <span class="xml-tag">&lt;GoodService&gt;</span>
          <span class="xml-tag">&lt;Name&gt;</span>Jasa Co-Funding Poin Loyalitas Nov 2026<span class="xml-tag">&lt;/Name&gt;</span>
          <span class="xml-tag">&lt;Price&gt;</span>148500000<span class="xml-tag">&lt;/Price&gt;</span>
          <span class="xml-tag">&lt;TaxBase&gt;</span>148500000<span class="xml-tag">&lt;/TaxBase&gt;</span>
          <span class="xml-tag">&lt;OtherTaxBase&gt;</span>136125000<span class="xml-tag">&lt;/OtherTaxBase&gt;</span>
          <span class="xml-tag">&lt;VATRate&gt;</span>12<span class="xml-tag">&lt;/VATRate&gt;</span>
          <span class="xml-tag">&lt;VAT&gt;</span>16335000<span class="xml-tag">&lt;/VAT&gt;</span> <span class="xml-cm">&lt;!-- Efektif 11% --&gt;</span>
        <span class="xml-tag">&lt;/GoodService&gt;</span>
      <span class="xml-tag">&lt;/ListOfGoodService&gt;</span>
      <span class="xml-tag">&lt;ApprovalCode&gt;</span>DJP-CT-20261122-9941820<span class="xml-tag">&lt;/ApprovalCode&gt;</span>
    <span class="xml-tag">&lt;/TaxInvoice&gt;</span>
  <span class="xml-tag">&lt;/ListOfTaxInvoice&gt;</span>
<span class="xml-tag">&lt;/TaxInvoiceBulk&gt;</span>`;

  const html = `
    <div class="facet-bar">
      <div class="facet-group">
        ${badge('NPWP Pemungut: 0100.2884.5091.0000', 'accent')}
        <span style="font-size:10.5px;color:#334155;">Masa Pajak: <strong>November 2026</strong></span>
        <span style="color:#cbd5e1;">|</span>
        <span style="font-size:10.5px;color:#334155;">Standar: <strong>PSAK 72 · PMK 131/2024 · SNAP BI</strong></span>
      </div>
      <div class="facet-group">
        ${badge('Jurnal Balance: Selisih Rp 0', 'ok')}
        ${badge('BI-FAST / QRIS Reconciled 100%', 'ok')}
        ${badge('CoreTax XML v2.1 Valid', 'info')}
      </div>
    </div>

    <div class="g-2" style="grid-template-columns:1.42fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#4338ca')} <span>Buku Besar Jurnal PSAK 72 &amp; Settlement Co-Funding (16 Entri · Batch #GL-202611-084)</span></div>
          <span class="e-panel-sub">Double-Entry SAP FI-GL</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.4px;">
            <colgroup>
              <col style="width:11.5%;" />
              <col style="width:7.5%;" />
              <col style="width:9.5%;" />
              <col style="width:33.5%;" />
              <col style="width:14.5%;" />
              <col style="width:14.5%;" />
              <col style="width:9.0%;" />
            </colgroup>
            <thead>
              <tr>
                <th>No. Dokumen</th>
                <th>Tgl</th>
                <th>COA</th>
                <th>Akun &amp; Uraian Jurnal</th>
                <th class="num">Debit (Rp)</th>
                <th class="num">Kredit (Rp)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${JOURNAL_ENTRIES.map(
                (j, i) => `<tr class="${i >= 13 ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:#312e81;padding:6px 6.5px;">${esc(j.doc)}</td>
                  <td class="mono" style="color:#64748b;">${esc(j.date)}</td>
                  <td class="mono" style="font-weight:600;color:#0f172a;">${esc(j.coa)}</td>
                  <td class="trunc" style="color:${j.credit > 0 ? '#334155' : '#0f172a'};padding-left:${j.credit > 0 ? '14px' : '6px'};">${esc(j.desc)}</td>
                  <td class="num mono" style="font-weight:${j.debit > 0 ? '700' : '400'};color:${j.debit > 0 ? '#0f172a' : '#94a3b8'};">${j.debit > 0 ? fmtNum(j.debit) : '—'}</td>
                  <td class="num mono" style="font-weight:${j.credit > 0 ? '700' : '400'};color:${j.credit > 0 ? '#0f172a' : '#94a3b8'};">${j.credit > 0 ? fmtNum(j.credit) : '—'}</td>
                  <td>${badge(j.status, j.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="padding:7px 6.5px;">TOTAL JURNAL KONSOLIDASI (SELISIH DEBIT - KREDIT = RP 0)</td>
                <td class="num mono">${fmtNum(sumDebit)}</td>
                <td class="num mono">${fmtNum(sumCredit)}</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="display:flex;flex-direction:column;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 10px;background:#ffffff;border-top:1px solid #d5dae4;">
              <div style="border:1px solid #c7d2fe;background:#eef2ff;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9px;color:#312e81;font-weight:700;">Saldo Kewajiban Poin (COA 2140-01)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#1e1b4b;">Rp 2.365.000.000</div>
              </div>
              <div style="border:1px solid #d5dae4;background:#f8f9fc;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9px;color:#475569;font-weight:700;">Utang PBJT Parkir 10% (COA 2150-04)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#0f172a;">Rp 558.918.919</div>
              </div>
              <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;padding:5px 8px;">
                <div style="font-size:9px;color:#047857;font-weight:700;">PPN Keluaran CoreTax (COA 2150-02)</div>
                <div class="mono" style="font-size:11.5px;font-weight:800;color:#064e3b;">Rp 108.563.063</div>
              </div>
            </div>
            <div style="padding:7px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:10px;color:#475569;">
              <span>Posting Otomatis: <strong style="color:#0f172a;">SAP S/4HANA FI-GL Interface (RFC-SSL)</strong></span>
              <span>Checksum Ledger: <strong class="mono" style="color:#047857;">SHA256: 7c21b9...90a4e1</strong></span>
            </div>
          </div>
        </div>
      </section>

      <div class="g-col">
        <section class="e-panel" style="height:492px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#4338ca')} <span>Inspektor CoreTax XML e-Faktur (Co-Funding Tenant)</span></div>
            ${badge('Approval DJP OK', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;padding:8px 10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
              <span>Faktur: <strong class="mono" style="color:#312e81;">040.004-26.88412019</strong></span>
              <span>Lawan Transaksi: <strong>PT Fast Retailing Indonesia</strong></span>
            </div>
            <div class="code-dark" style="flex:1;">${coretaxXml}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
              <div style="border:1px solid #d5dae4;border-radius:3px;padding:5px 7px;background:#f8f9fc;">
                <div style="font-size:9px;color:#64748b;">DPP Nilai Lain (11/12)</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">Rp 136.125.000</div>
              </div>
              <div style="border:1px solid #d5dae4;border-radius:3px;padding:5px 7px;background:#f8f9fc;">
                <div style="font-size:9px;color:#64748b;">PPN 12% (Efektif 11%)</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#4338ca;">Rp 16.335.000</div>
              </div>
              <div style="border:1px solid #a7f3d0;border-radius:3px;padding:5px 7px;background:#ecfdf5;">
                <div style="font-size:9px;color:#047857;">Total Faktur Tagihan</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#064e3b;">Rp 164.835.000</div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('checkCircle', 13, '#4338ca')} <span>Rekonsiliasi Settlement Parkir QRIS &amp; Bank Escrow</span></div>
            ${badge('4 Bank Matched', 'ok')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10.3px;">
              <colgroup>
                <col style="width:30%;" />
                <col style="width:13%;" />
                <col style="width:20%;" />
                <col style="width:17%;" />
                <col style="width:20%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Bank Acquirer SNAP</th>
                  <th class="num">Trx</th>
                  <th class="num">Bruto (Rp)</th>
                  <th class="num">MDR 0,7%</th>
                  <th class="num">Nett Escrow</th>
                </tr>
              </thead>
              <tbody>
                ${QRIS_BANKS.map(
                  (b) => `<tr>
                    <td style="font-weight:600;color:#0f172a;padding:7px 6px;">${esc(b.bank)}</td>
                    <td class="num mono">${fmtNum(b.tx)}</td>
                    <td class="num mono">${fmtNum(b.gross)}</td>
                    <td class="num mono" style="color:#64748b;">${fmtNum(b.mdr)}</td>
                    <td class="num mono" style="font-weight:700;color:#047857;">${fmtNum(b.nett)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding:7px 6px;">TOTAL SETTLEMENT QRIS</td>
                  <td class="num mono">${fmtNum(sumTx)}</td>
                  <td class="num mono">${fmtNum(sumGross)}</td>
                  <td class="num mono">${fmtNum(sumMdr)}</td>
                  <td class="num mono" style="color:#047857;">${fmtNum(sumNett)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="display:flex;flex-direction:column;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:7px 10px;background:#ffffff;border-top:1px solid #d5dae4;font-size:9.6px;">
                <div style="display:flex;justify-content:space-between;"><span>Batch BI-FAST Pagi (09:00):</span><strong class="mono" style="color:#047857;">Rp 2,14 M Settled</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Batch BI-FAST Sore (17:00):</span><strong class="mono" style="color:#4338ca;">Rp 3,46 M Antre</strong></div>
              </div>
              <div style="padding:6px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.8px;color:#475569;">
                <span>Payout BI-FAST ke Rekening Operasional: <strong style="color:#047857;">T+0 Pukul 17:00 WIB</strong></span>
                <span>Selisih Rekonsiliasi: <strong class="mono" style="color:#047857;">Rp 0</strong></span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return fiorishell({
    title: 'Settlement Tenant, Jurnal PSAK 72 & CoreTax XML e-Faktur',
    activeId: 'p5',
    crumbSection: 'Keuangan & Perpajakan',
    crumbTitle: 'Buku Besar PSAK 72, CoreTax XML e-Faktur & Rekonsiliasi QRIS',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12)} Unduh XML Batch CoreTax</span>
      <span class="e-btn e-btn-primary">${ic('check', 12, '#fff')} Posting Batch ke SAP S/4HANA</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 6: MATRIKS OTORISASI DoA (MAKER-CHECKER-APPROVER) & WORKFLOW KAMPANYE
// ============================================================================
function renderP6() {
  const totalExposure = DOA_QUEUE.reduce((a, d) => a + d.exposure, 0);

  const steps = [
    { num: '01', role: 'Maker (Inisiator)', person: 'D. Kartika · Mgr Loyalty', time: '20 Nov 09:15 WIB', state: 'done', badgeTxt: 'Selesai' },
    { num: '02', role: 'Checker (Finance & Tax)', person: 'S. Hartono · Head Finance', time: '20 Nov 14:40 WIB', state: 'done', badgeTxt: 'Terverifikasi' },
    { num: '03', role: 'Compliance & UU PDP', person: 'A. Pramesti · VP Legal/DPO', time: '21 Nov 10:05 WIB', state: 'done', badgeTxt: 'Lulus Kepatuhan' },
    { num: '04', role: 'Approver Tier-1 (> Rp 1 M)', person: 'B. Santoso · CFO Properti', time: 'Sisa SLA: 4j 15m', state: 'active', badgeTxt: 'Menunggu Otorisasi' },
    { num: '05', role: 'Release Production', person: '.NET 9 Rule Engine CI/CD', time: 'Jadwal: 01 Des 00:00', state: 'pending', badgeTxt: 'Terkunci DoA' },
  ];

  const doaMatrix = [
    { tier: 'DoA Tier 4', limit: '<= Rp 50 Jt', maker: 'Officer / CS Lead', checker: 'Manager Loyalty', approver: 'GM Properti Mal', sla: '8 Jam' },
    { tier: 'DoA Tier 3', limit: 'Rp 50 Jt – 250 Jt', maker: 'Manager Loyalty', checker: 'Finance Controller', approver: 'Head of Commercial', sla: '12 Jam' },
    { tier: 'DoA Tier 2', limit: 'Rp 250 Jt – 1 M', maker: 'Manager / Head', checker: 'Head Finance & Tax', approver: 'VP Loyalty & ERP', sla: '24 Jam' },
    { tier: 'DoA Tier 1', limit: '> Rp 1 Miliar', maker: 'Manager / VP', checker: 'Finance + Legal DPO', approver: 'CFO & Direktur Ops', sla: '48 Jam' },
    { tier: 'Kebijakan Kritis', limit: 'Tarif ANPR / UU PDP', maker: 'Product / Legal', checker: 'DPO + IT Security', approver: 'VP ERP + DPO', sla: '24 Jam' },
  ];

  const html = `
    <section class="e-panel" style="height:112px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 13, '#4338ca')} <span>Workflow Otorisasi DoA Aktif — CHG-2026-1142: Kampanye "Year-End 3x Poin &amp; Subsidi Parkir QRIS 6 Mal"</span></div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${badge('Eksposur: Rp 1.850.000.000', 'accent')}
          ${badge('Four-Eyes Enforcement: ON', 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:8px 12px;display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;align-items:center;">
        ${steps
          .map((s) => {
            const bd = s.state === 'active' ? '#4338ca' : s.state === 'done' ? '#a7f3d0' : '#d5dae4';
            const bg = s.state === 'active' ? '#eef2ff' : s.state === 'done' ? '#ecfdf5' : '#f8f9fc';
            const tc = s.state === 'active' ? '#312e81' : s.state === 'done' ? '#064e3b' : '#475569';
            const bt = s.state === 'active' ? 'accent' : s.state === 'done' ? 'ok' : 'neutral';
            return `<div style="border:1.2px solid ${bd};background:${bg};border-radius:4px;padding:6px 8px;display:flex;flex-direction:column;gap:2px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-size:9.5px;font-weight:800;color:${tc};">TAHAP ${s.num} · ${esc(s.role)}</span>
              </div>
              <div style="font-size:10.3px;font-weight:700;color:#0f172a;" class="trunc">${esc(s.person)}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                <span class="mono" style="font-size:8.8px;color:#475569;">${esc(s.time)}</span>
                ${badge(s.badgeTxt, bt)}
              </div>
            </div>`;
          })
          .join('')}
      </div>
    </section>

    <div class="g-2" style="grid-template-columns:1.58fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#4338ca')} <span>Antrean Persetujuan DoA Multi-Entitas (16 Dokumen Governance)</span></div>
          <span class="e-panel-sub">Segregation of Duties (SoD) aktif pada seluruh entitas</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.3px;">
            <colgroup>
              <col style="width:12.0%;" />
              <col style="width:24.5%;" />
              <col style="width:9.5%;" />
              <col style="width:9.5%;" />
              <col style="width:14.0%;" />
              <col style="width:10.0%;" />
              <col style="width:7.5%;" />
              <col style="width:13.0%;" />
            </colgroup>
            <thead>
              <tr>
                <th>ID Paket</th>
                <th>Perubahan / Dokumen Otorisasi</th>
                <th>Lingkup</th>
                <th>Maker</th>
                <th>Tahap Saat Ini</th>
                <th class="num">Eksposur</th>
                <th class="num">SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${DOA_QUEUE.map(
                (d) => `<tr class="${d.selected ? 'is-selected' : d.bad ? 'is-bad' : ''}">
                  <td class="mono" style="font-weight:700;color:#312e81;padding:5.5px 6px;">${esc(d.id)}</td>
                  <td style="font-weight:600;color:#0f172a;" class="trunc">${esc(d.type)}</td>
                  <td class="mono" style="font-size:9.5px;color:#475569;">${esc(d.scope)}</td>
                  <td>${esc(d.maker)}</td>
                  <td style="font-size:9.8px;color:#334155;" class="trunc">${esc(d.stage)}</td>
                  <td class="num mono" style="font-weight:600;">${d.exposure > 0 ? (d.exposure / 1e6).toFixed(1).replace('.', ',') + ' Jt' : 'Policy'}</td>
                  <td class="num mono" style="color:${d.bad ? '#be123c' : '#334155'};font-weight:${d.bad ? '700' : '500'};">${esc(d.sla)}</td>
                  <td>${badge(d.status, d.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="padding:7px 6px;">TOTAL EKSPOSUR ANTREAN DOA AKTIF (12 MENUNGGU · 4 TUNTAS)</td>
                <td class="num mono">Rp ${(totalExposure / 1e9).toFixed(2).replace('.', ',')} M</td>
                <td colspan="2" style="text-align:right;">${badge('SoD 0 Pelanggaran', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:6px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.8px;color:#475569;">
            <span>Eskalasi Otomatis: Notifikasi Telegram/Email ke CFO jika sisa SLA &lt; 2 jam.</span>
            <span>Delegasi Cuti Aktif: <strong style="color:#0f172a;">Tidak Ada (Semua Approver Aktif)</strong></span>
          </div>
        </div>
      </section>

      <div class="g-col">
        <section class="e-panel" style="height:376px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#4338ca')} <span>Inspektor Paket — CHG-2026-1142</span></div>
            ${badge('DoA Tier 1', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;">
            <div>
              <div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:4px;">Kampanye Year-End Triple Points &amp; Subsidi Parkir QRIS</div>
              <div class="kv-row"><span class="kv-k">Periode Berlaku</span><span class="kv-v mono">01 Des – 31 Des 2026 (6 Mal)</span></div>
              <div class="kv-row"><span class="kv-k">Aturan Multiplier</span><span class="kv-v">3x Poin (Fashion &amp; F&amp;B min. Rp 300rb)</span></div>
              <div class="kv-row"><span class="kv-k">Subsidi Parkir QRIS</span><span class="kv-v mono">Rp 5.000 / kunjungan member Gold+</span></div>
              <div class="kv-row"><span class="kv-k">Eksposur Bruto Liabilitas</span><span class="kv-v mono" style="color:#312e81;">Rp 1.850.000.000</span></div>
              <div class="kv-row"><span class="kv-k">Porsi Co-Funding Tenant (40%)</span><span class="kv-v mono" style="color:#047857;">Rp 740.000.000 (186 Tenant Opt-in)</span></div>
              <div class="kv-row"><span class="kv-k">Beban Nett Pengelola Mal</span><span class="kv-v mono">Rp 1.110.000.000 (Sisa Pagu Q4: 1,42 M)</span></div>
            </div>

            <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;padding:7px 9px;display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:9.8px;color:#064e3b;">
              <span style="display:flex;align-items:center;gap:4px;">${ic('check', 11, '#047857')} Maker != Checker (SoD OK)</span>
              <span style="display:flex;align-items:center;gap:4px;">${ic('check', 11, '#047857')} Cadangan PSAK 72 Cukup</span>
              <span style="display:flex;align-items:center;gap:4px;">${ic('check', 11, '#047857')} Review PPN Co-Funding OK</span>
              <span style="display:flex;align-items:center;gap:4px;">${ic('check', 11, '#047857')} Klausul T&amp;C UU PDP Valid</span>
            </div>

            <div style="display:flex;gap:6px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('lock', 11, '#fff')} Setujui &amp; Tanda Tangan (MFA)</span>
              <span class="e-btn">Minta Revisi</span>
              <span class="e-btn e-btn-danger">Tolak</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#4338ca')} <span>Matriks Kewenangan DoA &amp; SLA Eskalasi</span></div>
            <span class="e-panel-sub">SK Direksi No. 018/2026</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10.3px;">
              <colgroup>
                <col style="width:19%;" />
                <col style="width:22%;" />
                <col style="width:22%;" />
                <col style="width:25%;" />
                <col style="width:12%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Tingkat</th>
                  <th>Batas Nilai</th>
                  <th>Checker</th>
                  <th>Approver Final</th>
                  <th class="num">SLA</th>
                </tr>
              </thead>
              <tbody>
                ${doaMatrix
                  .map(
                    (m, i) => `<tr class="${i === 3 ? 'is-selected' : ''}">
                    <td style="font-weight:700;color:#312e81;padding:7.5px 6px;">${esc(m.tier)}</td>
                    <td class="mono" style="font-size:9.6px;">${esc(m.limit)}</td>
                    <td style="font-size:9.6px;color:#475569;">${esc(m.checker)}</td>
                    <td style="font-weight:600;font-size:9.6px;">${esc(m.approver)}</td>
                    <td class="num mono">${esc(m.sla)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.7px;color:#475569;">
              <span>Verifikasi Tanda Tangan: <strong style="color:#047857;">FIDO2 / WebAuthn Hardware Key</strong></span>
              <span>Audit Log DoA: <strong class="mono" style="color:#312e81;">WORM SHA-256</strong></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return fiorishell({
    title: 'Matriks DoA Maker-Checker-Approver & Workflow Kampanye',
    activeId: 'p6',
    crumbSection: 'Tata Kelola & Otorisasi',
    crumbTitle: 'Workflow Maker-Checker-Approver & Matriks Delegation of Authority (DoA)',
    actionsHtml: `
      <span class="e-btn">${ic('users', 12)} Atur Delegasi Cuti</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 12, '#fff')} Ajukan Paket Kampanye Baru</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 7: KEPATUHAN UU PDP (PP 33/2026), RBAC & AUDIT TRAIL WORM SHA-256
// ============================================================================
function renderP7() {
  const ropa = [
    { data: 'Plat Nomor Kendaraan (ANPR)', cls: 'Data Pribadi Umum', basis: 'Pelaksanaan Kontrak Parkir', enc: 'AES-256-GCM + Tokenize', ret: '90 Hari -> Anonimisasi', status: 'Patuh', tone: 'ok' },
    { data: 'Citra Struk Belanja (PaddleOCR)', cls: 'Data Transaksi Ritel', basis: 'Persetujuan Eksplisit (Opt-In)', enc: 'Object Lock + Redact Kartu', ret: '365 Hari (Audit Pajak)', status: 'Patuh', tone: 'ok' },
    { data: 'Profil Member (Nama, HP, Email)', cls: 'Data Pribadi Umum', basis: 'Persetujuan Eksplisit v2.4', enc: 'AES-256 + KMS HSM JKT', ret: 'Aktif + 5 Thn (UU KUP)', status: 'Patuh', tone: 'ok' },
    { data: 'Token QRIS & Riwayat Bayar', cls: 'Data Keuangan Pribadi', basis: 'Kewajiban Hukum BI/SNAP', enc: 'PCI-DSS Token · 0 PAN', ret: '10 Tahun (Arsip Fiskal)', status: 'Patuh', tone: 'ok' },
    { data: 'Analitik Cross-Shop & Lokasi Mal', cls: 'Data Perilaku Agregat', basis: 'Konsen Granular Terpisah', enc: 'k-Anonymity (k>=50)', ret: '180 Hari Agregat', status: 'Patuh', tone: 'ok' },
    { data: 'NPWP & Rekening Escrow Tenant', cls: 'Data Badan Hukum', basis: 'Kontrak Sewa & CoreTax', enc: 'TLS 1.3 + Vault Secret', ret: '10 Tahun (DJP)', status: 'Patuh', tone: 'ok' },
    { data: 'Log Akses VIP Lounge Lantai 3', cls: 'Data Kunjungan NFC/QR', basis: 'Manfaat Member Gold+', enc: 'Pseudonymized MemberID', ret: '180 Hari Otomatis', status: 'Tinjau Q1', tone: 'info' },
  ];

  const dsar = [
    { id: 'DSAR-26-084', req: 'Hak Penghapusan & Anonimisasi Plat ANPR', member: 'ML-61209-SLV', sla: 'Sisa 18j 12m', status: 'Proses DPO', tone: 'warn' },
    { id: 'DSAR-26-083', req: 'Portabilitas Data Riwayat Struk (JSON)', member: 'ML-88412-GLD', sla: 'Selesai 4j', status: 'Terkirim', tone: 'ok' },
    { id: 'DSAR-26-082', req: 'Pencabutan Konsen Analitik Cross-Shop', member: 'ML-40918-PLT', sla: 'Selesai 2m', status: 'Otomatis', tone: 'ok' },
    { id: 'DSAR-26-081', req: 'Koreksi Nomor HP & Verifikasi Ulang OTP', member: 'ML-19204-SLV', sla: 'Selesai 1j', status: 'Tuntas', tone: 'ok' },
  ];

  const rbac = [
    { role: 'Kasir / Admin Tenant', ocr: false, pii: false, pts: false, gl: false, worm: false, scope: 'Lihat Promo & Redeem Voucher Saja' },
    { role: 'CS Desk Properti Mal', ocr: true, pii: false, pts: false, gl: false, worm: false, scope: 'Tinjau Struk (PII Termasking)' },
    { role: 'Tim Leasing & Analitik', ocr: false, pii: false, pts: false, gl: false, worm: false, scope: 'Agregat Cross-Shop (k-Anon)' },
    { role: 'Finance, Tax & Settlement', ocr: true, pii: false, pts: false, gl: true, worm: true, scope: 'Jurnal PSAK 72 & CoreTax XML' },
    { role: 'DPO & Legal Kepatuhan', ocr: true, pii: true, pts: false, gl: false, worm: true, scope: 'Akses DSAR + Audit WORM (MFA)' },
    { role: 'VP Loyalty / Approver DoA', ocr: true, pii: false, pts: true, gl: true, worm: true, scope: 'Otorisasi Kampanye & Poin' },
  ];

  const wormLogs = [
    { seq: '#1.482.910', time: '13:28:15', actor: 'ocr-worker-02 (SVC)', ip: '10.24.8.14 · mTLS', action: 'POINTS_CREDIT_AUTO', target: 'RCP-902 (+450 pts · ML-88412)', prev: '4c81e9..a02f', curr: '8f94e2c1..7a09d4b3', ok: true },
    { seq: '#1.482.909', time: '13:26:22', actor: 'fraud-engine (SVC)', ip: '10.24.9.04 · mTLS', action: 'RECEIPT_QUARANTINE', target: 'RCP-887 (Rp 5,0 Jt · Conf 88,7%)', prev: '9b22d1..71c8', curr: '4c81e9f0..a02f19e2', ok: true },
    { seq: '#1.482.908', time: '13:24:09', actor: 'anpr-bridge-scbd', ip: '10.24.12.5 · mTLS', action: 'GATE_AUTO_OPEN_QRIS', target: 'B 2719 SSV · GATE-OUT-01 (Rp 10rb)', prev: '1e77a4..3b90', curr: '9b22d18c..71c844a1', ok: true },
    { seq: '#1.482.907', time: '13:15:44', actor: 'A. Pramesti (DPO)', ip: '10.10.4.88 · FIDO2', action: 'DSAR_CONSENT_REVOKE', target: 'DSAR-26-082 · Opt-Out Cross-Shop', prev: '6d05f8..c912', curr: '1e77a42b..3b90e7f5', ok: true },
    { seq: '#1.482.906', time: '12:58:03', actor: 'S. Hartono (Finance)', ip: '10.10.2.41 · FIDO2', action: 'CORETAX_XML_SUBMIT', target: 'Faktur 040.004-26.88412019 (DJP OK)', prev: '3a90c2..88d4', curr: '6d05f81a..c912b03e', ok: true },
    { seq: '#1.482.905', time: '12:41:18', actor: 'R. Wibisono (VP)', ip: '10.10.1.12 · FIDO2', action: 'DOA_REVIEW_OPEN', target: 'CHG-2026-1142 (Year-End 3x Poin)', prev: 'f129b7..54e1', curr: '3a90c29e..88d410cc', ok: true },
    { seq: '#1.482.904', time: '12:12:50', actor: 'sap-gl-bridge (SVC)', ip: '10.24.6.20 · mTLS', action: 'PSAK72_JOURNAL_POST', target: 'Batch #GL-202611-084 (Balanced 0)', prev: '77c4e1..09ab', curr: 'f129b74d..54e19c88', ok: true },
    { seq: '#1.482.903', time: '11:48:33', actor: 'B. Prakoso (Infra)', ip: '10.10.5.19 · FIDO2', action: 'KMS_KEY_ROTATION', target: 'HSM-JKT-PII-2026Q4 (Zero Downtime)', prev: '20a8d3..6e77', curr: '77c4e19b..09ab31f0', ok: true },
    { seq: '#1.482.902', time: '11:14:06', actor: 'anpr-bridge-scbd', ip: '10.24.12.5 · mTLS', action: 'ANPR_PLATE_TOKENIZE', target: 'B 1842 KJP -> AES256-GCM Zona C4', prev: '51f0a2..93cd', curr: '20a8d31e..6e774a09', ok: true },
    { seq: '#1.482.901', time: '10:32:19', actor: 'D. Kartika (Loyalty)', ip: '10.10.3.22 · FIDO2', action: 'DOA_PACKAGE_SUBMIT', target: 'CHG-2026-1142 (Year-End 3x Poin)', prev: 'c841b6..12fe', curr: '51f0a28a..93cd77e1', ok: true },
  ];

  const mark = (v) =>
    v
      ? `<span style="color:#047857;font-weight:700;">${ic('check', 11, '#047857')}</span>`
      : `<span style="color:#cbd5e1;">—</span>`;

  const html = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Skor Kepatuhan UU PDP</span>${badge('PP 33/2026', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">98,4%</span></div>
        <div class="e-kpi-foot"><span>Residency: 100% Data Center Jakarta (JKT-DC1/2)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Persetujuan (Consent) Member</span>${badge('v2.4 Granular', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">98,7%</span></div>
        <div class="e-kpi-foot"><span>412.860 / 418.420 member menyetujui opt-in aktif</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kepatuhan SLA DSAR (&lt; 3x24 Jam)</span>${badge('100% Tepat Waktu', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">3,4 Jam</span></div>
        <div class="e-kpi-foot"><span>Rata-rata pemenuhan hak subjek data (UU PDP Ps. 8)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Integritas Audit WORM SHA-256</span>${badge('0 Tamper', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">1.482.910</span></div>
        <div class="e-kpi-foot"><span>Blok rantai kriptografi terkunci S3 Object Lock</span></div>
      </div>
    </div>

    <div class="g-2" style="grid-template-columns:1.18fr 1fr;height:370px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#4338ca')} <span>Registri Pemrosesan Data Pribadi &amp; Retensi (RoPA — UU PDP Ps. 31)</span></div>
          ${badge('7 Kategori Data', 'neutral')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.3px;">
            <colgroup>
              <col style="width:23.5%;" />
              <col style="width:15.0%;" />
              <col style="width:19.5%;" />
              <col style="width:18.5%;" />
              <col style="width:13.0%;" />
              <col style="width:10.5%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Aset Data Pribadi</th>
                <th>Klasifikasi</th>
                <th>Dasar Hukum</th>
                <th>Enkripsi / Masking</th>
                <th>Retensi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${ropa
                .map(
                  (r) => `<tr>
                  <td style="font-weight:700;color:#0f172a;padding:7.5px 6px;">${esc(r.data)}</td>
                  <td style="font-size:9.6px;color:#475569;">${esc(r.cls)}</td>
                  <td style="font-size:9.6px;color:#334155;">${esc(r.basis)}</td>
                  <td class="mono" style="font-size:9.2px;color:#312e81;">${esc(r.enc)}</td>
                  <td style="font-size:9.5px;color:#475569;">${esc(r.ret)}</td>
                  <td>${badge(r.status, r.tone)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:7px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.7px;color:#475569;">
            <span>Penilaian Dampak (DPIA): <strong style="color:#047857;">Lulus 15 Okt 2026 (OCR + ANPR)</strong></span>
            <span>DPO Terdaftar: <strong style="color:#0f172a;">A. Pramesti, SH, CIPP/A</strong></span>
          </div>
        </div>
      </section>

      <div class="g-col">
        <section class="e-panel" style="height:164px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('users', 13, '#4338ca')} <span>Antrean Hak Subjek Data (DSAR · SLA 72 Jam)</span></div>
            ${badge('1 Aktif · 3 Tuntas', 'info')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:18%;" />
                <col style="width:42%;" />
                <col style="width:20%;" />
                <col style="width:20%;" />
              </colgroup>
              <thead>
                <tr><th>Tiket</th><th>Permintaan Subjek Data</th><th>SLA</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${dsar
                  .map(
                    (d, i) => `<tr class="${i === 0 ? 'is-warn' : ''}">
                    <td class="mono" style="font-weight:700;color:#312e81;">${esc(d.id)}</td>
                    <td class="trunc" style="font-size:9.8px;">${esc(d.req)}</td>
                    <td class="mono" style="font-size:9.5px;">${esc(d.sla)}</td>
                    <td>${badge(d.status, d.tone)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#4338ca')} <span>Matriks RBAC &amp; Least-Privilege Access (MFA Wajib)</span></div>
            <span class="e-panel-sub">6 Peran Entitas</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:31%;" />
                <col style="width:8%;" />
                <col style="width:8%;" />
                <col style="width:8%;" />
                <col style="width:8%;" />
                <col style="width:9%;" />
                <col style="width:28%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Peran RBAC</th>
                  <th style="text-align:center;">OCR</th>
                  <th style="text-align:center;">PII</th>
                  <th style="text-align:center;">Poin</th>
                  <th style="text-align:center;">GL</th>
                  <th style="text-align:center;">WORM</th>
                  <th>Ruang Lingkup</th>
                </tr>
              </thead>
              <tbody>
                ${rbac
                  .map(
                    (r, i) => `<tr class="${i === 4 ? 'is-selected' : ''}">
                    <td style="font-weight:600;color:#0f172a;">${esc(r.role)}</td>
                    <td style="text-align:center;">${mark(r.ocr)}</td>
                    <td style="text-align:center;">${mark(r.pii)}</td>
                    <td style="text-align:center;">${mark(r.pts)}</td>
                    <td style="text-align:center;">${mark(r.gl)}</td>
                    <td style="text-align:center;">${mark(r.worm)}</td>
                    <td class="trunc" style="font-size:9.3px;color:#475569;">${esc(r.scope)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('terminal', 13, '#4338ca')} <span>Log Audit Imutabel WORM SHA-256 (Rantai Kriptografi PostgreSQL Ledger)</span></div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">Merkle Root: 8f94e2c1...7a09d4b3</span>
          ${badge('Verifikasi Rantai: VALID', 'ok')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.2px;">
          <colgroup>
            <col style="width:9%;" />
            <col style="width:7.5%;" />
            <col style="width:13.5%;" />
            <col style="width:12.5%;" />
            <col style="width:14.5%;" />
            <col style="width:20.0%;" />
            <col style="width:9.0%;" />
            <col style="width:14.0%;" />
          </colgroup>
          <thead>
            <tr>
              <th>Seq #</th>
              <th>WIB</th>
              <th>Aktor &amp; Peran</th>
              <th>IP / Autentikasi</th>
              <th>Aksi Sistem</th>
              <th>Objek Target</th>
              <th>Prev Hash</th>
              <th>SHA-256 Digest</th>
            </tr>
          </thead>
          <tbody>
            ${wormLogs
              .map(
                (w, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
                <td class="mono" style="font-weight:700;color:#312e81;padding:5.2px 6px;">${esc(w.seq)}</td>
                <td class="mono" style="color:#64748b;">${esc(w.time)}</td>
                <td style="font-weight:600;color:#0f172a;">${esc(w.actor)}</td>
                <td class="mono" style="font-size:9.4px;color:#475569;">${esc(w.ip)}</td>
                <td class="mono" style="font-size:9.4px;font-weight:700;color:#0369a1;">${esc(w.action)}</td>
                <td class="trunc" style="color:#334155;">${esc(w.target)}</td>
                <td class="mono" style="font-size:9.2px;color:#64748b;">${esc(w.prev)}</td>
                <td class="mono" style="font-size:9.2px;color:#047857;font-weight:700;">${esc(w.curr)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <div style="padding:6px 10px;background:#f8f9fc;border-top:1px solid #d5dae4;display:flex;justify-content:space-between;font-size:9.8px;color:#475569;">
          <span>Replikasi WORM: <strong style="color:#0f172a;">S3 Object Lock Compliance Mode (Retensi 10 Tahun · Tidak Dapat Dihapus Superadmin)</strong></span>
          <span>Audit Eksternal ISO 27001 &amp; UU PDP: <strong style="color:#047857;">Siap Ekspor Paket Bukti</strong></span>
        </div>
      </div>
    </section>
  `;

  return fiorishell({
    title: 'Kepatuhan UU PDP PP 33/2026, RBAC & Audit WORM SHA-256',
    activeId: 'p7',
    crumbSection: 'Kepatuhan & Keamanan',
    crumbTitle: 'Kepatuhan UU PDP (PP 33/2026), Matriks RBAC & Audit Trail WORM SHA-256',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12)} Ekspor Paket Audit DPO</span>
      <span class="e-btn e-btn-primary">${ic('shield', 12, '#fff')} Verifikasi Rantai SHA-256</span>
    `,
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 8: COMPANION MOBILE SUPERAPP (.NET MAUI iOS/ANDROID) & EDGE TELEMETRY
// ============================================================================
function renderP8() {
  // Crisp QRIS Vector Pattern SVG (for Mobile Screen 3)
  let qrisRects = '';
  const seed = [
    '111111101011001111111',
    '100000100101101000001',
    '101110101100101011101',
    '101110100011001011101',
    '101110101010101011101',
    '100000101101001000001',
    '111111101010101111111',
    '000000001100100000000',
    '101101110110110110101',
    '010010101001001001010',
    '110110111011101101101',
    '001001000100010010011',
    '101110110110101110100',
    '000000001011010001011',
    '111111100101101011101',
    '100000101100110100010',
    '101110101011001110111',
    '101110100110101001001',
    '101110101101010110110',
    '100000100010110001101',
    '111111101101001110011',
  ];
  seed.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '1') {
        qrisRects += `<rect x="${12 + c * 6}" y="${12 + r * 6}" width="5.2" height="5.2" fill="#0f172a" />`;
      }
    }
  });
  const qrisSvg = `<svg viewBox="0 0 150 150" width="128" height="128" style="display:block;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:4px;">
    ${qrisRects}
    <rect x="57" y="61" width="36" height="28" rx="3" fill="#ffffff" stroke="#4338ca" stroke-width="1.5" />
    <text x="75" y="78" text-anchor="middle" font-family="Cascadia Mono,Consolas,monospace" font-size="9.5" font-weight="800" fill="#4338ca">QRIS</text>
  </svg>`;

  // 5-Layer System Architecture Flow SVG (Right Top Panel)
  const archSvg = `<svg viewBox="0 0 470 226" width="100%" height="226" style="display:block;background:#f8f9fc;border:1px solid #d5dae4;border-radius:3px;">
    <!-- Layer 1: Client -->
    <rect x="14" y="10" width="442" height="32" rx="3" fill="#eef2ff" stroke="#4338ca" stroke-width="1.2" />
    <text x="24" y="24" font-family="Segoe UI,system-ui,sans-serif" font-size="9" font-weight="700" fill="#312e81">CLIENT · Aplikasi Pengunjung iOS/Android (.NET MAUI 9)</text>
    <text x="24" y="36" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#4338ca">Offline Cache · Camera Deskew · Biometric + UU PDP Opt-In</text>
    <text x="446" y="29" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#047857">418,4k User</text>

    <line x1="235" y1="42" x2="235" y2="54" stroke="#4338ca" stroke-width="1.4" />

    <!-- Layer 2: Edge -->
    <rect x="14" y="54" width="442" height="34" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.1" />
    <text x="24" y="69" font-family="Segoe UI,system-ui,sans-serif" font-size="9" font-weight="700" fill="#0369a1">EDGE · .NET 9 API Gateway + OCR Worker Queue</text>
    <text x="24" y="81" font-family="Cascadia Mono,Consolas,monospace" font-size="8" fill="#475569">JWT/mTLS · Rate Limit · Python PaddleOCR GPU (p95 1,48s)</text>
    <text x="446" y="73" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#047857">8/8 GPU OK</text>

    <line x1="130" y1="88" x2="130" y2="100" stroke="#475569" stroke-width="1.2" />
    <line x1="340" y1="88" x2="340" y2="100" stroke="#475569" stroke-width="1.2" />

    <!-- Layer 3: Core Split -->
    <rect x="14" y="100" width="214" height="36" rx="3" fill="#ffffff" stroke="#4338ca" stroke-width="1.1" />
    <text x="22" y="115" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#0f172a">CORE · Points Ledger Engine</text>
    <text x="22" y="128" font-family="Cascadia Mono,Consolas,monospace" font-size="7.8" fill="#475569">Double-Entry · PSAK 72 · Dedup</text>

    <rect x="242" y="100" width="214" height="36" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.1" />
    <text x="250" y="115" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#0f172a">CORE · Parking Gate Bridge</text>
    <text x="250" y="128" font-family="Cascadia Mono,Consolas,monospace" font-size="7.8" fill="#475569">ANPR LPR Match · Auto-Open &lt;2s</text>

    <line x1="130" y1="136" x2="130" y2="148" stroke="#475569" stroke-width="1.2" />
    <line x1="340" y1="136" x2="340" y2="148" stroke="#475569" stroke-width="1.2" />

    <!-- Layer 4: Integrations -->
    <rect x="14" y="148" width="442" height="32" rx="3" fill="#f0f9ff" stroke="#0284c7" stroke-width="1" />
    <text x="24" y="162" font-family="Segoe UI,system-ui,sans-serif" font-size="8.8" font-weight="700" fill="#0c4a6e">INTEGRASI · SecureParking / CentrePark · QRIS SNAP BI · CoreTax DJP</text>
    <text x="24" y="174" font-family="Cascadia Mono,Consolas,monospace" font-size="7.9" fill="#0369a1">Webhook 42ms · QRIS Callback 180ms · SAP S/4HANA FI-GL</text>

    <line x1="235" y1="180" x2="235" y2="190" stroke="#475569" stroke-width="1.2" />

    <!-- Layer 5: Storage -->
    <rect x="14" y="190" width="442" height="28" rx="3" fill="#1e1b4b" />
    <text x="24" y="207" font-family="Cascadia Mono,Consolas,monospace" font-size="8.6" font-weight="700" fill="#e0e7ff">STORAGE · PostgreSQL Member &amp; Receipt DB + WORM SHA-256 (JKT-DC1)</text>
    <text x="446" y="207" text-anchor="end" font-family="Cascadia Mono,Consolas,monospace" font-size="8.2" font-weight="700" fill="#86efac">SYNC 0 ms</text>
  </svg>`;

  const webhooks = [
    { time: '13:28:14', ep: 'POST /v1/ocr/receipts', ms: '1.420 ms', code: '200', note: 'RCP-902 Uniqlo -> +450 pts' },
    { time: '13:27:55', ep: 'POST /v1/qris/snap/notify', ms: '164 ms', code: '200', note: 'B 2719 SSV · Rp 10.000 Paid' },
    { time: '13:27:56', ep: 'POST /v1/gate/open-boom', ms: '41 ms', code: '200', note: 'SecureParking GATE-OUT-01' },
    { time: '13:26:20', ep: 'POST /v1/ocr/receipts', ms: '2.180 ms', code: '202', note: 'RCP-898 -> Checker Queue' },
    { time: '13:25:12', ep: 'POST /v1/points/redeem', ms: '88 ms', code: '200', note: 'VCH-12 Voucher F&B 500 pts' },
    { time: '13:24:08', ep: 'POST /v1/parking/anpr-in', ms: '52 ms', code: '200', note: 'CentrePark B 2190 UYK -> B2' },
    { time: '13:22:41', ep: 'GET  /v1/member/pass-qr', ms: '19 ms', code: '200', note: 'VIP Lounge L3 NFC Verified' },
    { time: '13:20:06', ep: 'POST /v1/fraud/hold-rcp', ms: '63 ms', code: '200', note: 'RCP-887 Conf 88,7% Held' },
    { time: '13:18:19', ep: 'POST /v1/parking/pts-pay', ms: '74 ms', code: '200', note: 'L 1482 ABD · 300 pts (3 Jam)' },
    { time: '13:15:44', ep: 'PUT  /v1/consent/uu-pdp', ms: '34 ms', code: '200', note: 'Opt-Out Cross-Shop Logged' },
  ];

  const html = `
    <div class="g-2" style="grid-template-columns:2.05fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#4338ca')} <span>Aplikasi Pengunjung .NET MAUI 9 (iOS &amp; Android) — Grand Sudirman Pass · Plat B 1842 KJP</span></div>
          <div style="display:flex;gap:6px;">
            ${badge('Build v4.8.2 Prod', 'accent')}
            ${badge('Offline-First Sync OK', 'ok')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:10px 12px;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;">
          <!-- MOBILE SCREEN 1: HOME PASS -->
          <div class="m-phone">
            <div class="m-screen">
              <div class="m-status"><span>13:32</span><span style="color:#4338ca;">Grand Sudirman</span><span>5G · 92%</span></div>
              <div style="padding:9px 10px;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-size:11px;font-weight:800;color:#1e1b4b;">MallLoyalty · Grand Sudirman Pass</div>
                    <div class="mono" style="font-size:8.6px;color:#4338ca;font-weight:700;">TIER: GOLD · PLAT B 1842 KJP</div>
                  </div>
                  <span style="width:24px;height:24px;border-radius:4px;background:#eef2ff;border:1px solid #c7d2fe;display:inline-flex;align-items:center;justify-content:center;">${ic('bell', 12, '#4338ca')}</span>
                </div>

                <!-- Solid Dark Indigo Member Card (Flat, zero gradient) -->
                <div style="background:#312e81;color:#ffffff;border-radius:6px;padding:10px 11px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:8.8px;color:#c7d2fe;">
                    <span>SALDO POIN AKTIF</span>
                    <span class="mono" style="background:#4338ca;padding:1px 5px;border-radius:2px;color:#ffffff;font-weight:700;">GOLD PASS</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0 6px;">
                    <span class="mono" style="font-size:20px;font-weight:800;letter-spacing:-0.02em;">2.840 pts</span>
                    <span style="font-size:9px;color:#a5b4fc;">Setara Rp 28.400</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding-top:6px;border-top:1px solid #4338ca;">
                    <div>
                      <div style="font-size:8.2px;color:#c7d2fe;">Durasi Parkir (B2-C4)</div>
                      <div class="mono" style="font-size:11px;font-weight:700;">2j 18m</div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-size:8.2px;color:#c7d2fe;">Biaya Parkir ANPR</div>
                      <div class="mono" style="font-size:11px;font-weight:700;color:#86efac;">Rp 15.000</div>
                    </div>
                  </div>
                </div>

                <!-- Dual Primary Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                  <div style="background:#4338ca;color:#ffffff;border-radius:4px;padding:7px 6px;text-align:center;font-size:9.8px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;">
                    ${ic('eye', 11, '#fff')} Scan Struk Belanja
                  </div>
                  <div style="background:#ffffff;color:#312e81;border:1px solid #4338ca;border-radius:4px;padding:7px 6px;text-align:center;font-size:9.8px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;">
                    ${ic('zap', 11, '#4338ca')} Bayar Parkir QRIS
                  </div>
                </div>

                <!-- Spec Activity & Privilege Items -->
                <div style="font-size:9.2px;font-weight:700;color:#475569;margin-top:2px;">AKTIVITAS &amp; MANFAAT MEMBER</div>
                <div style="display:flex;flex-direction:column;gap:5px;flex:1;">
                  <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:4px;padding:6px 8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:9.8px;font-weight:700;color:#0f172a;">Uniqlo Grand Sudirman</span>
                      <span class="mono" style="font-size:9.8px;font-weight:700;color:#047857;">+450 pts</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8.4px;color:#64748b;margin-top:2px;">
                      <span>RCP-902 · OCR Terverifikasi #UQ-88124</span>
                      <span class="mono">Rp 450rb</span>
                    </div>
                  </div>

                  <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:4px;padding:6px 8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:9.8px;font-weight:700;color:#312e81;">Basement B2 — Zona C4</span>
                      <span class="mono" style="font-size:9.5px;font-weight:700;color:#4338ca;">Gratis 3 Jam</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8.4px;color:#475569;margin-top:2px;">
                      <span>PRK-01 · Tukar 300 poin bebas parkir</span>
                      <span class="mono">Gerbang ANPR</span>
                    </div>
                  </div>

                  <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:4px;padding:6px 8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:9.8px;font-weight:700;color:#0f172a;">Voucher F&amp;B Rp 50.000</span>
                      <span class="mono" style="font-size:9.5px;font-weight:700;color:#334155;">500 pts</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8.4px;color:#64748b;margin-top:2px;">
                      <span>VCH-12 · 64 tenant resto s/d 30 Nov</span>
                      <span class="mono">Kode QR</span>
                    </div>
                  </div>

                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:6px 8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:9.8px;font-weight:700;color:#064e3b;">Akses VIP Lounge Lantai 3</span>
                      <span class="mono" style="font-size:9.5px;font-weight:700;color:#047857;">Pass Aktif</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8.4px;color:#047857;margin-top:2px;">
                      <span>EVT-03 · Manfaat Gold · 2 tamu</span>
                      <span class="mono">NFC / QR</span>
                    </div>
                  </div>
                </div>

                <!-- Nearby Cross-Shop Tenant Promos -->
                <div style="margin-top:auto;">
                  <div style="font-size:8.8px;font-weight:700;color:#475569;margin-bottom:4px;">REKOMENDASI CROSS-SHOP · GRAND SUDIRMAN</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
                    <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:4px;padding:6px 7px;">
                      <div style="font-size:9.2px;font-weight:700;color:#0f172a;">Starbucks Reserve</div>
                      <div style="font-size:8.2px;color:#4338ca;font-weight:600;margin-top:1px;">2x Poin pasca-Uniqlo</div>
                      <div class="mono" style="font-size:7.8px;color:#64748b;margin-top:2px;">GF-08 · 45 meter</div>
                    </div>
                    <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:4px;padding:6px 7px;">
                      <div style="font-size:9.2px;font-weight:700;color:#0f172a;">Cinema XXI Premiere</div>
                      <div style="font-size:8.2px;color:#047857;font-weight:600;margin-top:1px;">Tukar 400 pts F&amp;B</div>
                      <div class="mono" style="font-size:7.8px;color:#64748b;margin-top:2px;">Lantai 3 · Lift Atrium</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="m-nav">
                <div class="m-nav-it on">${ic('layers', 11, '#4338ca')}<span>Beranda</span></div>
                <div class="m-nav-it">${ic('eye', 11, '#64748b')}<span>Scan OCR</span></div>
                <div class="m-nav-it">${ic('clock', 11, '#64748b')}<span>Parkir</span></div>
                <div class="m-nav-it">${ic('fileText', 11, '#64748b')}<span>Voucher</span></div>
                <div class="m-nav-it">${ic('users', 11, '#64748b')}<span>Profil</span></div>
              </div>
            </div>
          </div>

          <!-- MOBILE SCREEN 2: REAL-TIME OCR RECEIPT SCANNER -->
          <div class="m-phone">
            <div class="m-screen">
              <div class="m-status"><span>13:32</span><span style="color:#047857;">PaddleOCR &lt;3 dtk</span><span>5G · 92%</span></div>
              <div style="padding:9px 10px;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:11px;font-weight:800;color:#0f172a;">Pemindai OCR Struk Tenant</span>
                  ${badge('1,42 dtk', 'ok')}
                </div>

                <!-- Camera Viewfinder -->
                <div style="background:#0f172a;border-radius:6px;padding:10px;position:relative;border:1px solid #334155;">
                  <div style="display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:8px;color:#86efac;margin-bottom:6px;">
                    <span>AUTO-DESKEW: LOCKED</span>
                    <span>CONF: 99,6%</span>
                  </div>
                  <div style="background:#ffffff;border:2px solid #10b981;border-radius:3px;padding:8px 9px;font-family:var(--e-mono);font-size:8.4px;color:#0f172a;line-height:1.45;">
                    <div style="text-align:center;font-weight:800;font-size:9.2px;">UNIQLO GRAND SUDIRMAN</div>
                    <div style="text-align:center;background:#eef2ff;border:1px solid #4338ca;padding:1px 3px;margin:2px 0;color:#312e81;font-weight:700;">PT Fast Retailing Indonesia</div>
                    <div style="text-align:center;font-size:7.8px;color:#475569;">NPWP: 01.308.449.2-092.000</div>
                    <div style="border-top:1px dashed #94a3b8;margin:4px 0;"></div>
                    <div style="display:flex;justify-content:space-between;"><span>STRUK #UQ-88124</span><span>2026-11-20</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>AIRism Tee L</span><span>199.000</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>Ultra Chino M</span><span>251.000</span></div>
                    <div style="border-top:1px dashed #94a3b8;margin:4px 0;"></div>
                    <div style="display:flex;justify-content:space-between;background:#ecfdf5;border:1px solid #047857;padding:2px 4px;font-weight:800;color:#064e3b;">
                      <span>TOTAL BAYAR</span><span>Rp 450.000</span>
                    </div>
                  </div>
                </div>

                <!-- Verification Result Box -->
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:5px;padding:8px 9px;">
                  <div style="display:flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:#064e3b;margin-bottom:3px;">
                    ${ic('checkCircle', 12, '#047857')} OCR Terverifikasi · Masuk Poin Instan
                  </div>
                  <div class="mono" style="font-size:8.5px;color:#065f46;line-height:1.4;">
                    Tenant="PT Fast Retailing Indonesia"<br/>
                    Tanggal=2026-11-20 | Total=Rp 450.000<br/>
                    Kredit Ledger: +450 poin (Gold 1x)
                  </div>
                </div>

                <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:5px;padding:7px 9px;">
                  <div class="kv-row"><span class="kv-k">Validasi NPWP</span><span class="kv-v" style="color:#047857;">Terdaftar SCBD</span></div>
                  <div class="kv-row"><span class="kv-k">Anti-Duplikasi</span><span class="kv-v mono">SHA-256 Unik</span></div>
                  <div class="kv-row"><span class="kv-k">Saldo Baru Anda</span><span class="kv-v mono" style="color:#4338ca;">2.840 pts</span></div>
                </div>

                <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:5px;padding:6px 8px;">
                  <div style="font-size:8.6px;font-weight:700;color:#475569;margin-bottom:4px;">RIWAYAT SCAN HARI INI (2 STRUK)</div>
                  <div style="display:flex;justify-content:space-between;font-size:8.8px;padding:3px 0;border-bottom:1px solid #eef1f6;">
                    <span style="font-weight:600;color:#0f172a;">Uniqlo SCBD (#UQ-88124)</span>
                    <span class="mono" style="color:#047857;font-weight:700;">+450 pts</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:8.8px;padding:3px 0;">
                    <span style="font-weight:600;color:#0f172a;">Starbucks SCBD (#SB-44910)</span>
                    <span class="mono" style="color:#047857;font-weight:700;">+185 pts</span>
                  </div>
                </div>

                <div style="margin-top:auto;display:flex;flex-direction:column;gap:5px;">
                  <div style="background:#4338ca;color:#ffffff;border-radius:4px;padding:8px;text-align:center;font-size:10px;font-weight:700;">Selesai · Kembali ke Pass</div>
                  <div style="background:#ffffff;color:#334155;border:1px solid #cbd5e1;border-radius:4px;padding:6px;text-align:center;font-size:9.5px;font-weight:600;">Pindai Struk Belanja Lainnya</div>
                </div>
              </div>
              <div class="m-nav">
                <div class="m-nav-it">${ic('layers', 11, '#64748b')}<span>Beranda</span></div>
                <div class="m-nav-it on">${ic('eye', 11, '#4338ca')}<span>Scan OCR</span></div>
                <div class="m-nav-it">${ic('clock', 11, '#64748b')}<span>Parkir</span></div>
                <div class="m-nav-it">${ic('fileText', 11, '#64748b')}<span>Voucher</span></div>
                <div class="m-nav-it">${ic('users', 11, '#64748b')}<span>Profil</span></div>
              </div>
            </div>
          </div>

          <!-- MOBILE SCREEN 3: ANPR PARKING QRIS & POINTS PAYMENT -->
          <div class="m-phone">
            <div class="m-screen">
              <div class="m-status"><span>13:32</span><span style="color:#4338ca;">Parkir ANPR</span><span>5G · 92%</span></div>
              <div style="padding:9px 10px;display:flex;flex-direction:column;gap:7px;flex:1;min-height:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:11px;font-weight:800;color:#0f172a;">Bayar Parkir Plat Nomor</span>
                  ${badge('ANPR Terikat', 'ok')}
                </div>

                <!-- Vehicle Plate Card -->
                <div style="background:#ffffff;border:1px solid #c7d2fe;border-radius:5px;padding:8px 9px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span class="mono" style="font-size:13.5px;font-weight:800;color:#1e1b4b;background:#eef2ff;padding:2px 7px;border-radius:3px;border:1px solid #4338ca;">B 1842 KJP</span>
                    <span class="mono" style="font-size:10px;font-weight:700;color:#4338ca;">Durasi 2j 18m</span>
                  </div>
                  <div style="font-size:8.8px;color:#475569;margin-top:5px;">Grand Sudirman · Basement B2 — Zona C4</div>
                  <div class="mono" style="font-size:8.4px;color:#64748b;margin-top:1px;">Masuk: 11:14 WIB · SecureParking ANPR</div>
                </div>

                <!-- Payment Method Selector -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;background:#e2e8f0;padding:3px;border-radius:4px;">
                  <div style="background:#ffffff;color:#312e81;border-radius:3px;padding:5px;text-align:center;font-size:9.2px;font-weight:700;">QRIS (Rp 15.000)</div>
                  <div style="color:#475569;padding:5px;text-align:center;font-size:9.2px;font-weight:600;">Tukar 300 Poin</div>
                </div>

                <!-- QRIS Box -->
                <div style="background:#ffffff;border:1px solid #d5dae4;border-radius:5px;padding:8px;text-align:center;">
                  <div style="font-size:8.8px;font-weight:700;color:#334155;margin-bottom:5px;">QRIS Dinamis · NMID ID1026008841290</div>
                  ${qrisSvg}
                  <div class="mono" style="font-size:13px;font-weight:800;color:#0f172a;margin-top:5px;">Rp 15.000</div>
                  <div class="mono" style="font-size:8.3px;color:#b45309;">Berlaku 04:42 · Auto-verifikasi SNAP BI</div>
                </div>

                <!-- Gold Points Alternative -->
                <div style="background:#eef2ff;border:1px solid #4338ca;border-radius:5px;padding:7px 9px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:9.4px;font-weight:800;color:#312e81;">Opsi Member Gold: Bebas Parkir</span>
                    <span class="mono" style="font-size:9.2px;font-weight:700;color:#4338ca;">300 pts</span>
                  </div>
                  <div style="font-size:8.4px;color:#475569;margin-top:2px;">Tukar 300 poin dari saldo 2.840 pts -> Gratis 3 Jam.</div>
                </div>

                <div style="margin-top:auto;background:#047857;color:#ffffff;border-radius:4px;padding:7px 8px;text-align:center;font-size:9.4px;font-weight:700;">
                  Palang Keluar ANPR Terbuka Otomatis (&lt; 2 dtk)
                </div>
              </div>
              <div class="m-nav">
                <div class="m-nav-it">${ic('layers', 11, '#64748b')}<span>Beranda</span></div>
                <div class="m-nav-it">${ic('eye', 11, '#64748b')}<span>Scan OCR</span></div>
                <div class="m-nav-it on">${ic('clock', 11, '#4338ca')}<span>Parkir</span></div>
                <div class="m-nav-it">${ic('fileText', 11, '#64748b')}<span>Voucher</span></div>
                <div class="m-nav-it">${ic('users', 11, '#64748b')}<span>Profil</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="g-col">
        <section class="e-panel" style="height:412px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 13, '#4338ca')} <span>Arsitektur Edge, OCR Worker &amp; Parking Bridge</span></div>
            ${badge('.NET 9 + PaddleOCR', 'info')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;gap:8px;">
            ${archSvg}
            <table class="e-table compact" style="border:1px solid #d5dae4;">
              <colgroup>
                <col style="width:42%;" />
                <col style="width:19%;" />
                <col style="width:18%;" />
                <col style="width:21%;" />
              </colgroup>
              <thead>
                <tr><th>Layanan Backend</th><th class="num">p95</th><th class="num">Uptime</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td style="font-weight:600;">.NET 9 API Gateway</td><td class="num mono">28 ms</td><td class="num mono">99,99%</td><td>${badge('Healthy', 'ok')}</td></tr>
                <tr><td style="font-weight:600;">PaddleOCR GPU Worker</td><td class="num mono">1.480 ms</td><td class="num mono">99,96%</td><td>${badge('8/8 Active', 'ok')}</td></tr>
                <tr><td style="font-weight:600;">Parking Gate Bridge</td><td class="num mono">48 ms</td><td class="num mono">99,98%</td><td>${badge('24/24 Gate', 'ok')}</td></tr>
                <tr><td style="font-weight:600;">QRIS SNAP Callback</td><td class="num mono">168 ms</td><td class="num mono">99,97%</td><td>${badge('Matched', 'ok')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('terminal', 13, '#4338ca')} <span>Log API Gateway &amp; Persetujuan UU PDP Mobile</span></div>
            ${badge('Live Telemetry', 'ok')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table compact">
              <colgroup>
                <col style="width:15%;" />
                <col style="width:36%;" />
                <col style="width:15%;" />
                <col style="width:34%;" />
              </colgroup>
              <thead>
                <tr><th>WIB</th><th>Endpoint .NET 9 API</th><th class="num">Latensi</th><th>Hasil Eksekusi</th></tr>
              </thead>
              <tbody>
                ${webhooks
                  .map(
                    (w, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
                    <td class="mono" style="color:#64748b;">${esc(w.time)}</td>
                    <td class="mono trunc" style="font-size:9.3px;color:#312e81;font-weight:600;">${esc(w.ep)}</td>
                    <td class="num mono">${esc(w.ms)}</td>
                    <td class="trunc" style="font-size:9.4px;color:#334155;">${esc(w.note)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;background:#eef2ff;border-top:1px solid #c7d2fe;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;">
              <div>
                <div style="font-weight:700;color:#312e81;">Persetujuan UU PDP Mobile v2.4 Aktif</div>
                <div style="font-size:9.1px;color:#475569;">Opt-in terpisah untuk OCR Struk, ANPR Plat Nomor &amp; Analitik Cross-Shop.</div>
              </div>
              ${badge('98,7% Opt-In', 'ok')}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return fiorishell({
    title: 'Aplikasi Pengunjung .NET MAUI & Telemetri Integrasi Edge',
    activeId: 'p8',
    crumbSection: 'Aplikasi & Integrasi',
    crumbTitle: 'Pratinjau Aplikasi Pengunjung .NET MAUI & Telemetri API Gateway / OCR / ANPR',
    actionsHtml: `
      <span class="e-btn">${ic('code', 12)} Spesifikasi OpenAPI 3.1</span>
      <span class="e-btn e-btn-primary">${ic('refresh', 12, '#fff')} Simulasi Push Pass ke Perangkat</span>
    `,
    contentHtml: html,
  });
}

export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderP1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderP2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderP3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderP4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderP5() },
    { slug: 'p6', title: meta.pages[5].title, html: renderP6() },
    { slug: 'p7', title: meta.pages[6].title, html: renderP7() },
    { slug: 'p8', title: meta.pages[7].title, html: renderP8() },
  ];
}
