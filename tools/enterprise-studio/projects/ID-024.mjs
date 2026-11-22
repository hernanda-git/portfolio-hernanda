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
  id: 'ID-024',
  name: 'WarungRestock',
  reference: 'SAP S/4HANA Fiori Horizon + Android Offline-First GT Commerce',
  persona: 'R. Santoso · Kepala Operasional Sub-Distributor · PT Sumber Makmur Distribusi',
  pages: [
    { slug: 'p1', title: 'Pusat Kendali Sub-Distributor & Ringkasan Restock' },
    { slug: 'p2', title: 'Buku Besar Pesanan Restock & Inspektor Satuan GT' },
    { slug: 'p3', title: 'Pratinjau Aplikasi Android Warung (Offline-First)' },
    { slug: 'p4', title: 'Peta Rute Milk-Run Depok-Bogor & Manifest Armada' },
    { slug: 'p5', title: 'Tata Kelola DoA Tempo 7H, Rebate PSAK 72 & CoreTax XML' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const ROUTES = [
  {
    code: 'Depok-03',
    zone: 'Margonda · Beji · Kukusan',
    truck: 'B 9421 TXU',
    driver: 'A. Kurniawan',
    warung: 36,
    karton: 192,
    bruto: 31480000,
    promo: 1620000,
    netto: 29860000,
    catSembako: 15400000,
    catMieMinuman: 9820000,
    catHome: 4640000,
    weightKg: 3640,
    maxKg: 4000,
    cbm: 13.2,
    maxCbm: 14.5,
    capPct: 91,
    distKm: 38.4,
    etaStart: '09:00',
    etaEnd: '13:45',
    status: 'Siap Muat',
    tone: 'ok',
  },
  {
    code: 'Depok-01',
    zone: 'Sukmajaya · Cilodong',
    truck: 'B 9184 TXU',
    driver: 'B. Prasetyo',
    warung: 34,
    karton: 178,
    bruto: 28950000,
    promo: 1440000,
    netto: 27510000,
    catSembako: 14120000,
    catMieMinuman: 9150000,
    catHome: 4240000,
    weightKg: 3520,
    maxKg: 4000,
    cbm: 12.6,
    maxCbm: 14.5,
    capPct: 88,
    distKm: 41.2,
    etaStart: '09:00',
    etaEnd: '14:10',
    status: 'Siap Muat',
    tone: 'ok',
  },
  {
    code: 'Cibinong-02',
    zone: 'Cibinong · Citeureup',
    truck: 'F 8823 GZ',
    driver: 'D. Hidayat',
    warung: 38,
    karton: 204,
    bruto: 33120000,
    promo: 1710000,
    netto: 31410000,
    catSembako: 16450000,
    catMieMinuman: 10180000,
    catHome: 4780000,
    weightKg: 3760,
    maxKg: 4000,
    cbm: 13.8,
    maxCbm: 14.5,
    capPct: 94,
    distKm: 49.6,
    etaStart: '08:30',
    etaEnd: '14:50',
    status: 'Muatan Padat',
    tone: 'warn',
  },
  {
    code: 'Sawangan-04',
    zone: 'Sawangan · Bojongsari',
    truck: 'B 9305 TXU',
    driver: 'S. Rahmat',
    warung: 28,
    karton: 146,
    bruto: 23640000,
    promo: 1120000,
    netto: 22520000,
    catSembako: 11800000,
    catMieMinuman: 7240000,
    catHome: 3480000,
    weightKg: 3280,
    maxKg: 4000,
    cbm: 11.4,
    maxCbm: 14.5,
    capPct: 82,
    distKm: 34.8,
    etaStart: '09:00',
    etaEnd: '13:15',
    status: 'Terjadwal',
    tone: 'info',
  },
  {
    code: 'Beji-05',
    zone: 'Tanah Baru · Limo',
    truck: 'B 9512 TXU',
    driver: 'M. Yusuf',
    warung: 26,
    karton: 124,
    bruto: 19810000,
    promo: 920000,
    netto: 18890000,
    catSembako: 9740000,
    catMieMinuman: 6210000,
    catHome: 2940000,
    weightKg: 3160,
    maxKg: 4000,
    cbm: 10.8,
    maxCbm: 14.5,
    capPct: 79,
    distKm: 29.5,
    etaStart: '09:30',
    etaEnd: '13:05',
    status: 'Terjadwal',
    tone: 'info',
  },
  {
    code: 'Cinere-06',
    zone: 'Cinere · Gandul',
    truck: 'B 9640 TXU',
    driver: 'E. Saputra',
    warung: 24,
    karton: 98,
    bruto: 16020000,
    promo: 690000,
    netto: 15330000,
    catSembako: 7910000,
    catMieMinuman: 5020000,
    catHome: 2400000,
    weightKg: 2880,
    maxKg: 4000,
    cbm: 9.6,
    maxCbm: 14.5,
    capPct: 72,
    distKm: 26.1,
    etaStart: '09:30',
    etaEnd: '12:40',
    status: 'Terjadwal',
    tone: 'info',
  },
];

// Selected Warung Detail: Toko Sumber Rejeki (matches spec verbatim)
const SUMBER_REJEKI = {
  code: 'WRG-DPK-014',
  name: 'Toko Sumber Rejeki',
  owner: 'H. Mulyadi',
  address: 'Jl. Nusantara Raya No. 48, Beji, Depok',
  route: 'Depok-03',
  slot: 'Besok 09:00 WIB',
  orderNo: '#ORD-241104',
  openInvoiceNo: '#INV-1113',
  openInvoiceAmount: 1840000,
  openInvoiceDue: '22 Nov 2026',
  openInvoiceDueDays: 'Jatuh 2h',
  tempoLimit: 4500000,
  promoBalance: 85000,
  lines: [
    {
      code: 'GT-01',
      ean: '8998866200578',
      title: 'Minyak Goreng 1L Pouch',
      conv: '1 Dus = 12 Pouch',
      qty: 5,
      unit: 'Dus',
      unitPrice: 196000,
      subtotal: 980000,
      note: 'Promo beli 5 dus potongan Rp 25.000',
      tag: 'Laris',
      tone: 'ok',
    },
    {
      code: 'GT-02',
      ean: '8992761136017',
      title: 'Mie Instan Goreng',
      conv: '1 Karton = 40 Bks',
      qty: 2,
      unit: 'Krt',
      unitPrice: 114500,
      subtotal: 229000,
      note: 'Stok warung tinggal 12 bungkus',
      tag: 'Stok Tipis',
      tone: 'warn',
    },
    {
      code: 'GT-03',
      ean: '8991002105423',
      title: 'Kopi Sachet Renceng',
      conv: '1 Dus = 12 Rcn',
      qty: 1,
      unit: 'Dus',
      unitPrice: 148000,
      subtotal: 148000,
      note: 'Estimasi margin eceran 18%',
      tag: 'Renceng',
      tone: 'ok',
    },
  ],
  promoPrincipal: 25000,
  rebateTierA: 8000,
  netto: 1324000,
};

// 20-Row Dense Enterprise Restock Order Ledger (Page 2)
const ORDERS = [
  { id: '#ORD-241101', time: '08:12', warung: 'Warung Barokah Jaya', route: 'Depok-03', qty: 14, unitLbl: '14 Krt/Dus', bruto: 2420000, promo: 120000, netto: 2300000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241102', time: '08:18', warung: 'Toko Sinar Pagi', route: 'Depok-01', qty: 11, unitLbl: '11 Krt/Dus', bruto: 1890000, promo: 85000, netto: 1805000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241103', time: '08:25', warung: 'Kios Maju Bersama', route: 'Cibinong-02', qty: 18, unitLbl: '18 Krt/Dus', bruto: 3140000, promo: 160000, netto: 2980000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Cek Limit', tone: 'warn', warn: true },
  { id: '#ORD-241104', time: '08:31', warung: 'Toko Sumber Rejeki', route: 'Depok-03', qty: 8, unitLbl: '8 Krt/Dus', bruto: 1357000, promo: 33000, netto: 1324000, pay: 'Tempo 7H', sync: 'SQLite Sync', status: 'Terverifikasi', tone: 'accent', selected: true },
  { id: '#ORD-241105', time: '08:34', warung: 'Warung Bu Siti Aminah', route: 'Sawangan-04', qty: 9, unitLbl: '9 Krt/Dus', bruto: 1520000, promo: 65000, netto: 1455000, pay: 'COD Supir', sync: 'SQLite Sync', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241106', time: '08:39', warung: 'Toko Berkah Ibu', route: 'Depok-03', qty: 12, unitLbl: '12 Krt/Dus', bruto: 2080000, promo: 100000, netto: 1980000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241107', time: '08:42', warung: 'Warung Pak Hendra', route: 'Beji-05', qty: 7, unitLbl: '7 Krt/Dus', bruto: 1190000, promo: 45000, netto: 1145000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241108', time: '08:47', warung: 'Toko Sembako Rahayu', route: 'Cibinong-02', qty: 16, unitLbl: '16 Krt/Dus', bruto: 2760000, promo: 145000, netto: 2615000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241109', time: '08:50', warung: 'Kios Putra Mandiri', route: 'Depok-01', qty: 10, unitLbl: '10 Krt/Dus', bruto: 1740000, promo: 75000, netto: 1665000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241110', time: '08:53', warung: 'Warung Makmur Sejati', route: 'Cinere-06', qty: 6, unitLbl: '6 Krt/Dus', bruto: 1045000, promo: 40000, netto: 1005000, pay: 'COD Supir', sync: 'Antre 4G', status: 'Sync Offline', tone: 'info' },
  { id: '#ORD-241111', time: '08:56', warung: 'Toko Karya Baru', route: 'Depok-03', qty: 15, unitLbl: '15 Krt/Dus', bruto: 2590000, promo: 135000, netto: 2455000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241112', time: '09:01', warung: 'Warung Tunas Harapan', route: 'Sawangan-04', qty: 13, unitLbl: '13 Krt/Dus', bruto: 2210000, promo: 110000, netto: 2100000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241113', time: '09:04', warung: 'Toko Rizki Abadi', route: 'Cibinong-02', qty: 19, unitLbl: '19 Krt/Dus', bruto: 3280000, promo: 175000, netto: 3105000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Tahan Kredit', tone: 'bad', bad: true },
  { id: '#ORD-241114', time: '09:07', warung: 'Kios Cahaya Rejeki', route: 'Depok-01', qty: 9, unitLbl: '9 Krt/Dus', bruto: 1560000, promo: 70000, netto: 1490000, pay: 'COD Supir', sync: 'SQLite Sync', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241115', time: '09:10', warung: 'Warung Mbak Yuni', route: 'Beji-05', qty: 8, unitLbl: '8 Krt/Dus', bruto: 1380000, promo: 55000, netto: 1325000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241116', time: '09:13', warung: 'Toko Bintang Timur', route: 'Depok-03', qty: 11, unitLbl: '11 Krt/Dus', bruto: 1910000, promo: 90000, netto: 1820000, pay: 'Tempo 7H', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241117', time: '09:16', warung: 'Warung Jaya Sentosa', route: 'Cinere-06', qty: 7, unitLbl: '7 Krt/Dus', bruto: 1215000, promo: 50000, netto: 1165000, pay: 'COD Supir', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241118', time: '09:19', warung: 'Toko Anugerah Kelontong', route: 'Sawangan-04', qty: 12, unitLbl: '12 Krt/Dus', bruto: 2060000, promo: 95000, netto: 1965000, pay: 'Tempo 7H', sync: 'SQLite Sync', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241119', time: '09:22', warung: 'Kios Fajar Baru', route: 'Depok-01', qty: 10, unitLbl: '10 Krt/Dus', bruto: 1720000, promo: 80000, netto: 1640000, pay: 'QRIS Lunas', sync: 'Online 4G', status: 'Siap Muat', tone: 'ok' },
  { id: '#ORD-241120', time: '09:25', warung: 'Warung Berkat Usaha', route: 'Beji-05', qty: 9, unitLbl: '9 Krt/Dus', bruto: 1540000, promo: 68000, netto: 1472000, pay: 'Tempo 7H', sync: 'Antre 4G', status: 'Sync Offline', tone: 'info' },
];

// Master GT Unit Conversion Matrix (Page 3)
const SKU_CONVERSIONS = [
  { code: 'GT-01', name: 'Minyak Goreng 1L Pouch', ratio: '1 Dus = 12 Pouch', hppPcs: 16333, srpPcs: 18500, margin: '11,7%', promo: '-25rb / 5 Dus' },
  { code: 'GT-02', name: 'Mie Instan Goreng', ratio: '1 Krt = 40 Bks', hppPcs: 2863, srpPcs: 3500, margin: '18,2%', promo: '-6rb / 3 Krt' },
  { code: 'GT-03', name: 'Kopi Sachet Renceng', ratio: '1 Dus = 12 Rcn (120)', hppPcs: 1233, srpPcs: 1500, margin: '18,0%', promo: 'Rebate 2%' },
  { code: 'GT-05', name: 'Gula Pasir Kemasan 1Kg', ratio: '1 Bal = 20 Kg', hppPcs: 15400, srpPcs: 17500, margin: '12,0%', promo: '-15rb / 3 Bal' },
  { code: 'GT-06', name: 'Sabun Cuci Piring 750ml', ratio: '1 Krt = 12 Pouch', hppPcs: 11250, srpPcs: 13500, margin: '16,7%', promo: 'Bonus 1 Pch' },
  { code: 'GT-07', name: 'Teh Celup Kotak 25s', ratio: '1 Krt = 24 Kotak', hppPcs: 5450, srpPcs: 6500, margin: '16,2%', promo: '-10rb / 4 Krt' },
  { code: 'GT-08', name: 'Deterjen Sachet Renceng', ratio: '1 Krt = 18 Rcn (108)', hppPcs: 833, srpPcs: 1000, margin: '16,7%', promo: 'Rebate 3%' },
];

// Page 4: Depok-03 Milk-Run Manifest (sums EXACTLY to Depok-03: 36 warung, 192 krt, Rp 29.860.000)
const DEPOK03_MANIFEST = [
  { seq: '01', eta: '08:40', warung: 'Warung Barokah Jaya', area: 'Margonda Utara', count: 1, krt: 14, netto: 2300000, collect: 'Rp 1.950.000 (QRIS)', status: 'Geofence OK', tone: 'ok' },
  { seq: '02', eta: '08:50', warung: 'Toko Berkah Ibu', area: 'Pondok Cina', count: 1, krt: 12, netto: 1980000, collect: 'Lunas QRIS', status: 'Geofence OK', tone: 'ok' },
  { seq: '03', eta: '09:00', warung: 'Toko Sumber Rejeki', area: 'Jl. Nusantara Beji', count: 1, krt: 8, netto: 1324000, collect: 'Rp 1.840.000 (#INV-1113)', status: 'Prioritas 09:00', tone: 'accent', selected: true },
  { seq: '04', eta: '09:15', warung: 'Toko Karya Baru', area: 'Beji Timur', count: 1, krt: 15, netto: 2455000, collect: 'Rp 2.120.000 (COD)', status: 'Terjadwal', tone: 'info' },
  { seq: '05', eta: '09:30', warung: 'Toko Bintang Timur', area: 'Kemiri Muka', count: 1, krt: 11, netto: 1820000, collect: 'Rp 1.480.000 (QRIS)', status: 'Terjadwal', tone: 'info' },
  { seq: '06', eta: '09:48', warung: 'Warung Bu Ningsih', area: 'Kukusan Barat', count: 1, krt: 9, netto: 1410000, collect: 'Rp 980.000 (COD)', status: 'Terjadwal', tone: 'info' },
  { seq: '07', eta: '10:05', warung: 'Kios Jaya Abadi 2', area: 'Kukusan UI', count: 1, krt: 13, netto: 2040000, collect: 'Lunas QRIS', status: 'Terjadwal', tone: 'info' },
  { seq: '08', eta: '10:25', warung: 'Toko Sembako Pak RT', area: 'Tanah Baru Selatan', count: 1, krt: 10, netto: 1625000, collect: 'Rp 1.240.000 (Tempo)', status: 'Terjadwal', tone: 'info' },
  { seq: '09', eta: '10:45', warung: 'Warung Sari Rasa', area: 'Depok Jaya', count: 1, krt: 8, netto: 1296000, collect: 'Rp 860.000 (COD)', status: 'Terjadwal', tone: 'info' },
  { seq: '10', eta: '11:05', warung: 'Toko Harapan Mulia', area: 'Pancoran Mas', count: 1, krt: 11, netto: 1790000, collect: 'Rp 1.650.000 (QRIS)', status: 'Terjadwal', tone: 'info' },
  { seq: '11-36', eta: '11:20-13:45', warung: 'Klaster 26 Warung Beji-Pancoran Mas', area: 'Sub-Loop B (26 Titik)', count: 26, krt: 81, netto: 11820000, collect: 'Rp 9.420.000 (Mix)', status: 'Batch Rute', tone: 'neutral' },
];

// Page 5: DoA Maker-Checker Approval Queue (10 rows — exact sum verified)
const DOA_QUEUE = [
  { doc: 'DOA-26-1147', entity: 'Toko Sumber Rejeki (Depok-03)', type: 'Rebate Tier A & Limit', amount: 4500000, dso: '5,2 hr', maker: 'R. Santoso', checker: 'D. Wulandari', stage: 'Menunggu Kacab', tone: 'warn', selected: true },
  { doc: 'DOA-26-1146', entity: 'Kios Maju Bersama (Cibinong-02)', type: 'Naik Limit 5jt -> 7,5jt', amount: 7500000, dso: '6,8 hr', maker: 'H. Kurnia', checker: 'D. Wulandari', stage: 'Menunggu Kacab', tone: 'warn' },
  { doc: 'DOA-26-1145', entity: 'Toko Rizki Abadi (Cibinong-02)', type: 'Override Tahan Kredit', amount: 3105000, dso: '11,4 hr', maker: 'H. Kurnia', checker: 'D. Wulandari', stage: 'Ditolak AR', tone: 'bad' },
  { doc: 'DOA-26-1144', entity: 'Klaim Principal PT Wilmar Nabati', type: 'Rebate Minyak 5 Dus', amount: 9850000, dso: '14,0 hr', maker: 'S. Kartika', checker: 'A. Pratiwi', stage: 'Disetujui CFO', tone: 'ok' },
  { doc: 'DOA-26-1143', entity: 'Klaim Principal PT Indofood CBP', type: 'Rebate Mie GT Nov', amount: 6420000, dso: '12,0 hr', maker: 'S. Kartika', checker: 'A. Pratiwi', stage: 'Disetujui CFO', tone: 'ok' },
  { doc: 'DOA-26-1142', entity: 'Klaim Principal PT Kapal Api', type: 'Promo Renceng 18%', amount: 3840000, dso: '10,5 hr', maker: 'S. Kartika', checker: 'A. Pratiwi', stage: 'Posting GL OK', tone: 'ok' },
  { doc: 'DOA-26-1141', entity: 'Warung Barokah Jaya (Depok-03)', type: 'Perpanjangan Tempo 7H', amount: 4200000, dso: '4,8 hr', maker: 'R. Santoso', checker: 'D. Wulandari', stage: 'Posting GL OK', tone: 'ok' },
  { doc: 'DOA-26-1140', entity: 'Toko Sembako Rahayu (Cibinong-02)', type: 'Kredit Musiman Nataru', amount: 3085000, dso: '5,9 hr', maker: 'H. Kurnia', checker: 'D. Wulandari', stage: 'Menunggu AR', tone: 'info' },
  { doc: 'DOA-26-1139', entity: 'Toko Karya Baru (Depok-03)', type: 'Naik Limit 3jt -> 4,5jt', amount: 4500000, dso: '4,6 hr', maker: 'R. Santoso', checker: 'D. Wulandari', stage: 'Posting GL OK', tone: 'ok' },
  { doc: 'DOA-26-1138', entity: 'Klaim Principal PT Wings Surya', type: 'Rebate Deterjen GT', amount: 2800000, dso: '11,0 hr', maker: 'S. Kartika', checker: 'A. Pratiwi', stage: 'Posting GL OK', tone: 'ok' },
];

// Page 5: Balanced PSAK 72 & BI-SNAP QRIS General Ledger Journal (6 lines)
const GL_JOURNAL = [
  { acc: '11201-GT', name: 'Piutang Dagang Tempo 7H · Rute Depok-03', ref: 'BATCH-DPK03-1122', debit: 33144600, kredit: 0, note: 'DPP + PPN 11%' },
  { acc: '41205-RB', name: 'Kontra-Pendapatan Rebate Promo Principal (PSAK 72)', ref: 'RBT-DPK03-1122', debit: 1620000, kredit: 0, note: 'Potongan GT 5,1%' },
  { acc: '41101-SL', name: 'Penjualan Bruto Sembako General Trade', ref: 'INV-DPK03-1122', debit: 0, kredit: 31480000, note: '36 Warung · 192 Krt' },
  { acc: '21302-TX', name: 'Utang PPN Keluaran 11% (CoreTax e-Faktur)', ref: 'CTX-010-26-1147', debit: 0, kredit: 3284600, note: '11% × Rp 29.860.000' },
  { acc: '11102-BNK', name: 'Kas Giro BCA · Pelunasan QRIS BI-SNAP Pagi', ref: 'QRIS-SNAP-1122', debit: 41280000, kredit: 0, note: '74 Transaksi Warung' },
  { acc: '11201-GT', name: 'Pelunasan Piutang Dagang Tempo 7H (QRIS)', ref: 'QRIS-SNAP-1122', debit: 0, kredit: 41280000, note: 'Auto-Clear AR 100%' },
];

// CoreTax Invoice Math for Selected Order #ORD-241104 (Toko Sumber Rejeki)
const CORETAX_DPP = SUMBER_REJEKI.netto; // 1.324.000
const CORETAX_PPN = Math.round(CORETAX_DPP * 0.11); // 145.640
const CORETAX_TOTAL = CORETAX_DPP + CORETAX_PPN; // 1.469.640

// Computed aggregates
const TOTAL_WARUNG = ROUTES.reduce((a, r) => a + r.warung, 0);
const TOTAL_KARTON = ROUTES.reduce((a, r) => a + r.karton, 0);
const TOTAL_BRUTO = ROUTES.reduce((a, r) => a + r.bruto, 0);
const TOTAL_PROMO = ROUTES.reduce((a, r) => a + r.promo, 0);
const TOTAL_NETTO = ROUTES.reduce((a, r) => a + r.netto, 0);
const AVG_CAP_PCT = ROUTES.reduce((a, r) => a + r.capPct, 0) / ROUTES.length;
const TOTAL_SEMBAKO = ROUTES.reduce((a, r) => a + r.catSembako, 0);
const TOTAL_MIEMIN = ROUTES.reduce((a, r) => a + r.catMieMinuman, 0);
const TOTAL_HOME = ROUTES.reduce((a, r) => a + r.catHome, 0);

const ORDER_SUM_QTY = ORDERS.reduce((a, o) => a + o.qty, 0);
const ORDER_SUM_BRUTO = ORDERS.reduce((a, o) => a + o.bruto, 0);
const ORDER_SUM_PROMO = ORDERS.reduce((a, o) => a + o.promo, 0);
const ORDER_SUM_NETTO = ORDERS.reduce((a, o) => a + o.netto, 0);

const DOA_SUM_AMT = DOA_QUEUE.reduce((a, d) => a + d.amount, 0);
const GL_SUM_DEBIT = GL_JOURNAL.reduce((a, j) => a + j.debit, 0);
const GL_SUM_KREDIT = GL_JOURNAL.reduce((a, j) => a + j.kredit, 0);

export function verifyMath() {
  // 1. Routes consistency
  if (TOTAL_WARUNG !== 186) throw new Error(`Warung total mismatch: ${TOTAL_WARUNG}`);
  if (TOTAL_KARTON !== 942) throw new Error(`Karton total mismatch: ${TOTAL_KARTON}`);
  if (TOTAL_BRUTO !== 153020000) throw new Error(`Bruto total mismatch: ${TOTAL_BRUTO}`);
  if (TOTAL_PROMO !== 7500000) throw new Error(`Promo total mismatch: ${TOTAL_PROMO}`);
  if (TOTAL_NETTO !== 145520000) throw new Error(`Netto total mismatch: ${TOTAL_NETTO}`);
  if (TOTAL_BRUTO - TOTAL_PROMO !== TOTAL_NETTO) throw new Error('Route Bruto - Promo !== Netto');
  for (const r of ROUTES) {
    if (r.bruto - r.promo !== r.netto) throw new Error(`Route ${r.code} netto mismatch`);
    if (r.catSembako + r.catMieMinuman + r.catHome !== r.netto) {
      throw new Error(`Route ${r.code} category split mismatch`);
    }
  }
  if (TOTAL_SEMBAKO + TOTAL_MIEMIN + TOTAL_HOME !== TOTAL_NETTO) {
    throw new Error('Global category sum !== TOTAL_NETTO');
  }

  // 2. Toko Sumber Rejeki line item math
  const srQty = SUMBER_REJEKI.lines.reduce((a, l) => a + l.qty, 0);
  const srBruto = SUMBER_REJEKI.lines.reduce((a, l) => a + l.subtotal, 0);
  for (const l of SUMBER_REJEKI.lines) {
    if (l.qty * l.unitPrice !== l.subtotal) throw new Error(`SKU ${l.code} subtotal mismatch`);
  }
  const srDisc = SUMBER_REJEKI.promoPrincipal + SUMBER_REJEKI.rebateTierA;
  if (srQty !== 8) throw new Error(`Sumber Rejeki qty !== 8: ${srQty}`);
  if (srBruto !== 1357000) throw new Error(`Sumber Rejeki bruto !== 1357000: ${srBruto}`);
  if (srBruto - srDisc !== SUMBER_REJEKI.netto || SUMBER_REJEKI.netto !== 1324000) {
    throw new Error(`Sumber Rejeki netto mismatch: ${srBruto - srDisc}`);
  }

  // 3. 20-Row Orders grid consistency
  if (ORDERS.length !== 20) throw new Error(`Expected 20 order rows, got ${ORDERS.length}`);
  for (const o of ORDERS) {
    if (o.bruto - o.promo !== o.netto) throw new Error(`Order ${o.id} math mismatch`);
  }
  if (ORDER_SUM_BRUTO - ORDER_SUM_PROMO !== ORDER_SUM_NETTO) {
    throw new Error('Order table totals mismatch');
  }
  const srRow = ORDERS.find((o) => o.id === SUMBER_REJEKI.orderNo);
  if (!srRow || srRow.netto !== SUMBER_REJEKI.netto || srRow.qty !== srQty) {
    throw new Error('Selected order row disagrees with Sumber Rejeki inspector');
  }

  // 4. Depok-03 Manifest reconciles 100% with Depok-03 route
  const dpk03 = ROUTES[0];
  const mWarung = DEPOK03_MANIFEST.reduce((a, m) => a + m.count, 0);
  const mKrt = DEPOK03_MANIFEST.reduce((a, m) => a + m.krt, 0);
  const mNetto = DEPOK03_MANIFEST.reduce((a, m) => a + m.netto, 0);
  if (mWarung !== dpk03.warung) throw new Error(`Depok-03 manifest warung ${mWarung} !== ${dpk03.warung}`);
  if (mKrt !== dpk03.karton) throw new Error(`Depok-03 manifest karton ${mKrt} !== ${dpk03.karton}`);
  if (mNetto !== dpk03.netto) throw new Error(`Depok-03 manifest netto ${mNetto} !== ${dpk03.netto}`);

  // 5. PSAK 72 Journal & CoreTax math
  if (GL_SUM_DEBIT !== GL_SUM_KREDIT) throw new Error(`GL unbalanced: ${GL_SUM_DEBIT} vs ${GL_SUM_KREDIT}`);
  if (GL_SUM_DEBIT !== 76044600) throw new Error(`GL total unexpected: ${GL_SUM_DEBIT}`);
  if (Math.round(dpk03.netto * 0.11) !== 3284600) throw new Error('Depok-03 PPN 11% mismatch');
  if (CORETAX_PPN !== 145640 || CORETAX_TOTAL !== 1469640) throw new Error('CoreTax XML PPN mismatch');
  if (DOA_SUM_AMT !== 49800000) throw new Error(`DoA queue sum mismatch: ${DOA_SUM_AMT}`);
}

// ============================================================================
// CUSTOM DOMAIN SVG ICONS (1.5px STROKE, ZERO EMOJI)
// ============================================================================
function wIc(name, size = 13, color = 'currentColor') {
  const paths = {
    truck: '<rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    barcode: '<path d="M3 5v14"/><path d="M7 5v14"/><path d="M10 5v14"/><path d="M14 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/>',
    store: '<path d="M3 9l2-5h14l2 5"/><path d="M3 9v11h18V9"/><path d="M9 20v-6h6v6"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M18 18h3v3h-3z"/><path d="M14 19h2v2h-2z"/>',
    mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2-3-2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>',
    wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  };
  if (!paths[name]) return ic(name, size, color);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${paths[name]}</svg>`;
}

// ============================================================================
// SAP S/4HANA FIORI HORIZON SHELL (DISTINCT LIGHT-FIRST ENTERPRISE CHROME)
// ============================================================================

const EXTRA_CSS = `
  /* SAP S/4HANA Fiori Horizon Light Shell Bar */
  .fiori-shellbar {
    height: 40px;
    background: #ffffff;
    border-top: 3px solid #c2410c;
    border-bottom: 1px solid #ddd8d2;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .fiori-left, .fiori-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .fiori-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 13px;
    color: #1c1917;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
  .fiori-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #c2410c;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .fiori-divider {
    width: 1px;
    height: 18px;
    background: #ddd8d2;
    flex-shrink: 0;
  }
  .fiori-select {
    height: 25px;
    padding: 0 8px;
    border-radius: 3px;
    background: #faf8f6;
    border: 1px solid #d6cfc7;
    color: #292524;
    font-size: 10.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .fiori-period {
    height: 25px;
    padding: 0 8px;
    border-radius: 3px;
    background: #fff3ed;
    border: 1px solid #fdba74;
    color: #9a3412;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .fiori-search {
    height: 25px;
    width: 265px;
    padding: 0 8px;
    border-radius: 3px;
    background: #faf8f6;
    border: 1px solid #d6cfc7;
    color: #78716c;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .fiori-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #d6cfc7;
    color: #57534e;
  }
  .fiori-health {
    height: 25px;
    padding: 0 8px;
    border-radius: 3px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .fiori-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 8px;
    border-left: 1px solid #ddd8d2;
    white-space: nowrap;
  }
  .fiori-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #292524;
    color: #fafaf9;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Secondary Horizontal Module Tab Bar */
  .fiori-tabs {
    height: 32px;
    background: #faf8f6;
    border-bottom: 1px solid #ddd8d2;
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .fiori-tab-list {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }
  .fiori-tab {
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.8px;
    font-weight: 600;
    color: #57534e;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .fiori-tab.is-active {
    color: #9a3412;
    border-bottom-color: #c2410c;
    background: #ffffff;
    font-weight: 700;
  }
  .fiori-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.5px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #ece7e1;
    color: #44403c;
  }
  .fiori-tab.is-active .fiori-tab-cnt {
    background: #c2410c;
    color: #ffffff;
  }

  /* Object Page Context Subbar */
  .fiori-subbar {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid #ddd8d2;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }

  /* Main Workspace */
  .wr-content {
    flex: 1;
    min-height: 0;
    padding: 9px 14px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* Warm Stone Panel Refinements */
  .e-panel {
    border-color: #ddd8d2;
    border-radius: 4px;
  }
  .e-panel-head {
    height: 30px;
    background: #faf8f6;
    border-bottom-color: #e6e1db;
    padding: 0 10px;
  }
  .e-kpi {
    border-color: #ddd8d2;
    padding: 7px 10px;
  }
  .e-kpi-accent-top {
    border-top: 2px solid #c2410c;
  }
  table.e-table th {
    background: #f5f2ee;
    color: #57534e;
    border-bottom-color: #d6cfc7;
    padding: 4.5px 7px;
  }
  table.e-table td {
    border-bottom-color: #ece8e2;
    padding: 4.5px 7px;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbfa;
  }
  table.e-table tbody tr.is-selected {
    background: #fff3ed !important;
    box-shadow: inset 2.5px 0 0 #c2410c;
  }
  table.e-table tfoot td {
    background: #f5f2ee;
    border-top: 1px solid #c8c1b8;
    color: #1c1917;
    padding: 5.5px 7px;
  }
  .e-badge-accent {
    background: #fff3ed;
    color: #9a3412;
    border-color: #fdba74;
  }
  .e-statusbar {
    background: #f5f2ee;
    border-top-color: #d6cfc7;
    color: #57534e;
  }

  /* Android Low-Spec Phone Mockup Frame (Flat, Crisp, Zero Slop) */
  .android-frame {
    width: 342px;
    height: 676px;
    border: 2px solid #292524;
    border-radius: 14px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }
  .android-sysbar {
    height: 22px;
    background: #1c1917;
    color: #e7e5e4;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    flex-shrink: 0;
  }
  .android-appbar {
    background: #c2410c;
    color: #ffffff;
    padding: 8px 10px;
    flex-shrink: 0;
  }
  .android-body {
    flex: 1;
    background: #f7f5f2;
    padding: 8px 9px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 0;
    overflow: hidden;
  }
  .android-nav {
    height: 36px;
    background: #ffffff;
    border-top: 1px solid #e6e1db;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    flex-shrink: 0;
  }
  .android-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 8.5px;
    font-weight: 600;
    color: #78716c;
  }
  .android-nav-btn.is-active {
    color: #c2410c;
    font-weight: 700;
  }
  .m-card {
    background: #ffffff;
    border: 1px solid #e6e1db;
    border-radius: 4px;
    padding: 7px 8px;
  }

  /* DoA Maker-Checker Stepper */
  .doa-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .doa-step {
    border: 1px solid #ddd8d2;
    border-radius: 4px;
    padding: 7px 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .doa-step.done {
    border-left: 3px solid #047857;
    background: #f9fefb;
  }
  .doa-step.current {
    border-left: 3px solid #c2410c;
    background: #fff8f4;
    border-color: #fdba74;
  }
  .doa-step.pending {
    border-left: 3px solid #94a3b8;
    background: #fafaf9;
  }

  /* Code / CoreTax XML Panel */
  .xml-box {
    background: #1c1917;
    color: #e7e5e4;
    font-family: var(--e-mono);
    font-size: 10px;
    line-height: 1.42;
    padding: 9px 11px;
    border-radius: 3px;
    overflow: hidden;
    white-space: pre;
  }
  .xt { color: #fb923c; }
  .xa { color: #93c5fd; }
  .xv { color: #86efac; }
  .xc { color: #a8a29e; }
`;

const TABS = [
  { id: 'p1', icon: 'layers', label: 'Pusat Kendali Sub-Dist', count: '6 Rute' },
  { id: 'p2', icon: 'receipt', label: 'Buku Besar Pesanan & Satuan GT', count: '186' },
  { id: 'p3', icon: 'phone', label: 'Aplikasi Android Warung (Offline)', count: '3 Layar' },
  { id: 'p4', icon: 'truck', label: 'Rute Milk-Run & Manifest Armada', count: 'Depok-03' },
  { id: 'p5', icon: 'shield', label: 'DoA Tempo 7H, PSAK 72 & CoreTax', count: '3 Pending' },
];

function renderShell({ activeTab, crumbTitle, crumbSub, actionsHtml = '', bodyHtml }) {
  const topbar = `<header class="fiori-shellbar">
    <div class="fiori-left">
      <div class="fiori-logo">
        <span class="fiori-mark">WR</span>
        <span>WarungRestock</span>
        <span style="font-size:10px;font-weight:600;color:#78716c;">ERP Sub-Dist GT</span>
      </div>
      <span class="fiori-divider"></span>
      <div class="fiori-select">
        ${wIc('store', 12, '#c2410c')}
        <span>PT Sumber Makmur Distribusi · Depo Depok-Bogor (CC-104)</span>
        ${ic('chevronDown', 11, '#78716c')}
      </div>
      <div class="fiori-period">
        ${ic('clock', 11, '#9a3412')}
        <span>SIKLUS MILK-RUN #47 · KIRIM BESOK 09:00 WIB</span>
      </div>
      <div class="fiori-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#78716c')}
          <span class="trunc">Cari warung, #ORD, SKU GT-01, atau #INV-1113...</span>
        </span>
        <span class="fiori-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="fiori-right">
      <div class="fiori-health">
        <span class="dot dot-ok"></span>
        <span>.NET 9 Edge API · 99,96% · SQLite Sync OK</span>
      </div>
      <div class="fiori-user">
        <span class="fiori-avatar">RS</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#1c1917;">R. Santoso</div>
          <div style="font-size:9px;color:#78716c;">Kepala Ops Sub-Distributor</div>
        </div>
      </div>
    </div>
  </header>`;

  const tabBar = `<nav class="fiori-tabs">
    <div class="fiori-tab-list">
      ${TABS.map(
        (t) => `<div class="fiori-tab ${t.id === activeTab ? 'is-active' : ''}">
          ${wIc(t.icon, 12, t.id === activeTab ? '#c2410c' : '#78716c')}
          <span>${esc(t.label)}</span>
          <span class="fiori-tab-cnt">${esc(t.count)}</span>
        </div>`
      ).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-family:var(--e-mono);font-size:9.6px;color:#57534e;white-space:nowrap;flex-shrink:0;">
      <span>Buku: <strong>2026-P11</strong></span>
      <span style="color:#d6cfc7;">|</span>
      <span>Mata Uang: <strong>IDR</strong></span>
      <span style="color:#d6cfc7;">|</span>
      <span>Cutoff: <strong>17:00 WIB</strong></span>
    </div>
  </nav>`;

  const subbar = `<div class="fiori-subbar">
    <div class="e-crumb">
      <span>WarungRestock ERP</span>
      ${ic('chevronRight', 11, '#a8a29e')}
      <span>Depo Depok-Bogor</span>
      ${ic('chevronRight', 11, '#a8a29e')}
      <strong>${esc(crumbTitle)}</strong>
      <span style="margin-left:6px;color:#78716c;font-size:10.5px;">— ${esc(crumbSub)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      ${actionsHtml}
    </div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> PostgreSQL 16 Primary (Depok-JKT) · Replikasi 8 ms`,
      `SQLite Offline Client v3.46 · Kompresi Brotli 3,4 KB/order`,
      `BI-SNAP QRIS & WMS Route Planner Terhubung`,
    ],
    rightItems: [
      `Standar: QRIS · Offline-First Mobile · Satuan GT FMCG · PSAK 72 · CoreTax DJP`,
      `Snapshot: 22 Nov 2026 09:26 WIB`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `WarungRestock — ${crumbTitle}`,
    accent: '#c2410c',
    accentSoft: '#fff3ed',
    accentInk: '#9a3412',
    bg: '#f4f3f1',
    surface: '#ffffff',
    surface2: '#faf8f6',
    border: '#ddd8d2',
    borderStrong: '#c8c1b8',
    text: '#1c1917',
    text2: '#44403c',
    muted: '#78716c',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}${tabBar}${subbar}<main class="wr-content">${bodyHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: PUSAT KENDALI SUB-DISTRIBUTOR & RINGKASAN RESTOCK HARIAN
// ============================================================================
function renderPage1() {
  const rebatePct = (TOTAL_PROMO / TOTAL_BRUTO) * 100;

  const kpis = [
    {
      label: 'Nilai Restock Netto (H-1)',
      val: fmtIdr(TOTAL_NETTO),
      sub: `${fmtNum(TOTAL_WARUNG)} warung · ${fmtNum(TOTAL_KARTON)} krt/dus`,
      delta: '+11,4%',
      tone: 'ok',
      spark: [112, 118, 121, 119, 128, 134, 139, 145.5],
      accent: true,
    },
    {
      label: 'Piutang Tempo 7 Hari Aktif',
      val: 'Rp 64.250.000',
      sub: 'Pagu Rp 115,0 jt · Utilisasi 55,9%',
      delta: 'DSO 5,4 hr',
      tone: 'ok',
      spark: [58, 61, 60, 63, 66, 65, 64.2],
    },
    {
      label: 'Akrual Rebate Promo Principal',
      val: fmtIdr(TOTAL_PROMO),
      sub: `${fmtPct(rebatePct)} dari Bruto ${fmtIdr(TOTAL_BRUTO)}`,
      delta: '4 Skema',
      tone: 'accent',
      spark: [4.8, 5.2, 5.9, 6.1, 6.8, 7.2, 7.5],
    },
    {
      label: 'Utilisasi Armada Milk-Run',
      val: fmtPct(AVG_CAP_PCT),
      sub: '6 truk aktif · Kirim besok 09:00',
      delta: '1 Padat',
      tone: 'warn',
      spark: [76, 79, 81, 83, 82, 85, 84.3],
    },
    {
      label: 'Pelunasan QRIS & COD 7H',
      val: '96,8%',
      sub: 'QRIS 62,4% · COD Supir 37,6%',
      delta: '0 selisih',
      tone: 'ok',
      spark: [93.2, 94.1, 95.0, 95.8, 96.1, 96.5, 96.8],
    },
    {
      label: 'Antrean Sync SQLite Offline',
      val: '14 paket',
      sub: 'Avg 4G sync 184 ms · 0 konflik',
      delta: 'RAM 2GB OK',
      tone: 'info',
      spark: [28, 22, 19, 25, 16, 15, 14],
    },
  ];

  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    ${kpis
      .map(
        (k) => `<div class="e-kpi ${k.accent ? 'e-kpi-accent-top' : ''}">
          <div class="e-kpi-top">
            <span class="trunc">${esc(k.label)}</span>
            ${badge(k.delta, k.tone)}
          </div>
          <div class="e-kpi-mid">
            <span class="e-kpi-val">${esc(k.val)}</span>
            ${svgSparkline({ points: k.spark, width: 58, height: 18, color: k.accent ? '#c2410c' : '#44403c' })}
          </div>
          <div class="e-kpi-foot">
            <span class="trunc">${esc(k.sub)}</span>
          </div>
        </div>`
      )
      .join('')}
  </section>`;

  // Multi-line chart: 14-day daily restock & tempo settlement trend
  const trendChart = svgMultiLineChart({
    width: 920,
    height: 256,
    xLabels: ['09 Nov', '10 Nov', '11 Nov', '12 Nov', '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
    yMin: 60,
    yMax: 185,
    yTicks: 5,
    yFormat: (v) => `Rp ${Math.round(v)}jt`,
    threshold: { value: 166, label: 'Kapasitas Max Depo: Rp 166 jt', color: '#9a3412' },
    series: [
      {
        label: 'Restock Bruto Masuk (Rp Jt)',
        color: '#c2410c',
        width: 2.2,
        area: true,
        dots: true,
        values: [118, 124, 121, 132, 129, 114, 98, 126, 131, 138, 142, 146, 149, 153.0],
      },
      {
        label: 'Restock Netto Pasca-Promo (Rp Jt)',
        color: '#047857',
        width: 1.8,
        dots: true,
        values: [113, 118, 116, 126, 123, 109, 94, 120, 125, 131, 135, 139, 141.8, 145.5],
      },
      {
        label: 'Pelunasan QRIS + COD Harian (Rp Jt)',
        color: '#0369a1',
        width: 1.6,
        dashed: true,
        values: [108, 114, 115, 121, 120, 112, 92, 116, 122, 127, 132, 136, 138.4, 141.2],
      },
    ],
    annotations: [
      { index: 10, seriesIdx: 0, label: 'Promo Minyak 5 Dus (-Rp 25rb) Aktif', color: '#b45309', dy: -28 },
    ],
  });

  // Stacked bar chart: Category revenue split per Milk-Run route
  const catChart = svgStackedBarChart({
    width: 560,
    height: 206,
    categories: ROUTES.map((r) => r.code),
    yMax: 36,
    yFormat: (v) => `${Math.round(v)}jt`,
    series: [
      { label: 'Sembako Inti', color: '#c2410c', values: ROUTES.map((r) => r.catSembako / 1e6) },
      { label: 'Mie & Minuman', color: '#d97706', values: ROUTES.map((r) => r.catMieMinuman / 1e6) },
      { label: 'Home & Personal', color: '#57534e', values: ROUTES.map((r) => r.catHome / 1e6) },
    ],
  });

  const middleRow = `<section style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;height:306px;flex-shrink:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('activity', 13, '#c2410c')}
          <span>Tren Pesanan Restock Harian & Pelunasan Tempo 7H (14 Hari · Depo Depok-Bogor)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Cutoff 17:00 WIB', 'neutral')}
          ${badge('Live PostgreSQL', 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:7px 10px;">
        ${trendChart}
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${wIc('box', 13, '#c2410c')}
          <span>Bauran Kategori FMCG Netto per Rute Milk-Run</span>
        </div>
        <span class="e-panel-sub mono">Total ${fmtIdr(TOTAL_NETTO)}</span>
      </div>
      <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;">
        ${catChart}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding-top:6px;border-top:1px solid #ece8e2;">
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Sembako Inti (51,8%)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#c2410c;">${fmtIdr(TOTAL_SEMBAKO)}</div>
          </div>
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Mie & Minuman (32,7%)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">${fmtIdr(TOTAL_MIEMIN)}</div>
          </div>
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:4px 7px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Home & Care (15,5%)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#44403c;">${fmtIdr(TOTAL_HOME)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  // Bottom Row: Route Matrix + Priority Credit/Promo Worklist
  const alerts = [
    {
      warung: 'Toko Sumber Rejeki (Depok-03)',
      code: '#INV-1113 · #ORD-241104',
      desc: 'Pesanan baru 8 krt (Rp 1.324.000, promo -Rp 25.000). Tagihan tempo Rp 1.840.000 jatuh 2h lagi.',
      metric: 'Rp 1.840.000',
      badgeTxt: 'Jatuh 2h',
      tone: 'warn',
    },
    {
      warung: 'Toko Rizki Abadi (Cibinong-02)',
      code: '#ORD-241113 · DSO 11,4 hr',
      desc: 'Pesanan 19 krt (Rp 3.105.000) ditahan otomatis: tunggakan tempo 7H lewat 4 hari (DoA-26-1145).',
      metric: 'Rp 3.105.000',
      badgeTxt: 'Tahan Kredit',
      tone: 'bad',
    },
    {
      warung: 'Kios Maju Bersama (Cibinong-02)',
      code: '#ORD-241103 · Utilisasi 94%',
      desc: 'Pengajuan kenaikan limit tempo Rp 5,0 jt -> Rp 7,5 jt menunggu persetujuan Kepala Cabang.',
      metric: 'Rp 2.980.000',
      badgeTxt: 'Cek Limit',
      tone: 'warn',
    },
    {
      warung: 'Promo Principal Wilmar Nabati',
      code: 'GT-01 Minyak Goreng 1L Pouch',
      desc: '142 warung telah memenuhi syarat beli >= 5 dus (-Rp 25.000). Sisa kuota principal 58 paket.',
      metric: 'Rp 3.550.000',
      badgeTxt: '71% Kuota',
      tone: 'ok',
    },
    {
      warung: 'Sinkronisasi SQLite Offline 4G',
      code: 'Cinere-06 & Beji-05 (14 paket)',
      desc: 'Seluruh order dari ponsel RAM 2GB terkompresi Brotli 3,4 KB; retry otomatis 100% berhasil.',
      metric: '184 ms p95',
      badgeTxt: 'Edge Sehat',
      tone: 'info',
    },
    {
      warung: 'Rekonsiliasi QRIS BI-SNAP Pagi',
      code: 'Batch Settlement 22 Nov 09:00',
      desc: '74 transaksi pelunasan warung via QRIS dinamis cocok 100% dengan mutasi rekening giro BCA.',
      metric: 'Rp 41.280.000',
      badgeTxt: 'Cocok 100%',
      tone: 'ok',
    },
  ];

  const bottomRow = `<section style="display:grid;grid-template-columns:1.38fr 1fr;gap:9px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${wIc('truck', 13, '#c2410c')}
          <span>Matriks Alokasi Rute Truk Milk-Run Besok (Slot 08:30–09:30 WIB)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('6 Armada Aktif', 'neutral')}
          ${badge('WMS Terkunci 17:00', 'accent')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:13%;">Rute</th>
              <th style="width:17%;">Wilayah & Armada</th>
              <th class="num" style="width:7%;">Wrg</th>
              <th class="num" style="width:8%;">Krt</th>
              <th class="num" style="width:14%;">Bruto (Rp)</th>
              <th class="num" style="width:12%;">Promo (Rp)</th>
              <th class="num" style="width:14%;">Netto (Rp)</th>
              <th style="width:15%;">Kapasitas Truk</th>
            </tr>
          </thead>
          <tbody>
            ${ROUTES.map(
              (r, idx) => `<tr class="${idx === 0 ? 'is-selected' : r.tone === 'warn' ? 'is-warn' : ''}">
                <td>
                  <div class="mono" style="font-weight:700;color:${idx === 0 ? '#9a3412' : '#1c1917'};">${esc(r.code)}</div>
                  <div style="font-size:9.3px;color:#78716c;">Berangkat ${esc(r.etaStart)}</div>
                </td>
                <td>
                  <div class="trunc" style="font-weight:600;">${esc(r.zone)}</div>
                  <div class="mono" style="font-size:9.3px;color:#78716c;">${esc(r.truck)} · ${esc(r.driver)}</div>
                </td>
                <td class="num mono">${r.warung}</td>
                <td class="num mono">${r.karton}</td>
                <td class="num mono">${fmtNum(r.bruto)}</td>
                <td class="num mono" style="color:#047857;">-${fmtNum(r.promo)}</td>
                <td class="num mono" style="font-weight:700;">${fmtNum(r.netto)}</td>
                <td>${renderCapacityBar(r.capPct, { warnAt: 85, critAt: 93 })}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">TOTAL 6 RUTE DEPO DEPOK-BOGOR</td>
              <td class="num mono">${fmtNum(TOTAL_WARUNG)}</td>
              <td class="num mono">${fmtNum(TOTAL_KARTON)}</td>
              <td class="num mono">${fmtNum(TOTAL_BRUTO)}</td>
              <td class="num mono" style="color:#047857;">-${fmtNum(TOTAL_PROMO)}</td>
              <td class="num mono">${fmtNum(TOTAL_NETTO)}</td>
              <td class="mono" style="font-size:10px;text-align:right;">Rata ${fmtPct(AVG_CAP_PCT)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 11px;background:#ffffff;border-top:1px solid #ece8e2;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:5px 8px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Skema Wilmar Minyak 5 Dus</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
              <span class="mono" style="font-size:11px;font-weight:700;color:#047857;">Rp 3.550.000</span>
              <span style="font-size:9px;color:#57534e;">142 klaim (-25rb)</span>
            </div>
          </div>
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:5px 8px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Skema Indofood Mie &amp; Kopi</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
              <span class="mono" style="font-size:11px;font-weight:700;color:#047857;">Rp 2.480.000</span>
              <span style="font-size:9px;color:#57534e;">118 klaim (GT-02/03)</span>
            </div>
          </div>
          <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:5px 8px;">
            <div style="font-size:9.2px;color:#78716c;font-weight:600;">Rebate Loyalitas Tempo Tier A</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px;">
              <span class="mono" style="font-size:11px;font-weight:700;color:#047857;">Rp 1.470.000</span>
              <span style="font-size:9px;color:#57534e;">Total Promo: Rp 7,50 jt</span>
            </div>
          </div>
        </div>
        <div style="padding:7px 11px;background:#faf8f6;border-top:1px solid #e6e1db;display:flex;align-items:center;justify-content:space-between;font-size:10.3px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-weight:700;color:#9a3412;">Ringkasan Muat Terpilih (Depok-03):</span>
            <span>36 warung · 192 krt/dus · 3.640 kg / 4.000 kg · Prioritas Stop #3: <strong>Toko Sumber Rejeki (09:00 WIB)</strong></span>
          </div>
          <span class="e-btn e-btn-primary">${wIc('truck', 11, '#fff')} Cetak Surat Jalan WMS</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('bell', 13, '#c2410c')}
          <span>Daftar Kerja Prioritas · Kredit Tempo 7H, Promo & Sync Offline</span>
        </div>
        ${badge('6 Item Aktif', 'warn')}
      </div>
      <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
        ${alerts
          .map(
            (a) => `<div style="border:1px solid #e6e1db;border-left:3px solid ${a.tone === 'bad' ? '#be123c' : a.tone === 'warn' ? '#b45309' : a.tone === 'ok' ? '#047857' : '#0369a1'};border-radius:3px;padding:6px 8px;background:#ffffff;display:flex;flex-direction:column;gap:2px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                  <strong class="trunc" style="font-size:11px;color:#1c1917;">${esc(a.warung)}</strong>
                  <span class="mono" style="font-size:9.3px;color:#78716c;">${esc(a.code)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span class="mono" style="font-size:10.5px;font-weight:700;color:#1c1917;">${esc(a.metric)}</span>
                  ${badge(a.badgeTxt, a.tone)}
                </div>
              </div>
              <div style="font-size:10px;color:#57534e;line-height:1.3;">${esc(a.desc)}</div>
            </div>`
          )
          .join('')}
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p1',
    crumbTitle: 'Pusat Kendali Sub-Distributor',
    crumbSub: 'Ringkasan restock sembako GT, utilisasi rute milk-run & piutang tempo 7 hari',
    actionsHtml: `
      <span class="e-btn">${ic('filter', 11)} Filter Depo (6 Rute)</span>
      <span class="e-btn">${ic('download', 11)} Ekspor SAP Excel</span>
      <span class="e-btn e-btn-primary">${wIc('box', 11, '#fff')} Kunci Batch Muat 09:00</span>
    `,
    bodyHtml: `${kpiStrip}${middleRow}${bottomRow}`,
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR PESANAN RESTOCK (20 BARIS) & INSPEKTOR SATUAN GT
// ============================================================================
function renderPage2() {
  const srBruto = SUMBER_REJEKI.lines.reduce((a, l) => a + l.subtotal, 0);
  const srUsedAfter = SUMBER_REJEKI.openInvoiceAmount + SUMBER_REJEKI.netto;
  const srLimitPct = (srUsedAfter / SUMBER_REJEKI.tempoLimit) * 100;

  const filterBar = `<section style="background:#ffffff;border:1px solid #ddd8d2;border-radius:4px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:10.2px;font-weight:700;color:#57534e;">FILTER AKTIF:</span>
      ${badge('Rute: Semua (6)', 'neutral')}
      ${badge('Pengiriman: Besok 09:00 WIB', 'accent')}
      ${badge('Pembayaran: Tempo 7H · QRIS · COD', 'neutral')}
      ${badge('Satuan: Multi-Satuan GT (Krt/Dus/Rcn)', 'info')}
      ${badge('1 Tahan Kredit · 1 Cek Limit', 'warn')}
    </div>
    <div style="display:flex;align-items:center;gap:12px;font-family:var(--e-mono);font-size:10.3px;">
      <span>Halaman 1 (20 dari 186): <strong>${fmtNum(ORDER_SUM_QTY)} Krt/Dus</strong></span>
      <span style="color:#d6cfc7;">|</span>
      <span>Netto Tampil: <strong style="color:#c2410c;">${fmtIdr(ORDER_SUM_NETTO)}</strong></span>
    </div>
  </section>`;

  const ordersTable = `<div class="e-panel">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${wIc('receipt', 13, '#c2410c')}
        <span>Buku Besar Pesanan Restock Masuk — Siklus Milk-Run #47 (20 Baris Teratas)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-panel-sub">Urutan: Waktu Masuk · Klik baris untuk inspeksi satuan</span>
        ${badge('Auto-Promo Aktif', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush" style="justify-content:space-between;">
      <table class="e-table" style="font-size:10.8px;">
        <thead>
          <tr>
            <th style="width:11%;padding:6px 7px;">No. Order</th>
            <th style="width:6%;padding:6px 7px;">Jam</th>
            <th style="width:20%;padding:6px 7px;">Nama Warung</th>
            <th style="width:10%;padding:6px 7px;">Rute</th>
            <th class="num" style="width:8%;padding:6px 7px;">Qty</th>
            <th class="num" style="width:11%;padding:6px 7px;">Bruto (Rp)</th>
            <th class="num" style="width:9%;padding:6px 7px;">Promo</th>
            <th class="num" style="width:11%;padding:6px 7px;">Netto (Rp)</th>
            <th style="width:14%;padding:6px 7px;">Bayar & Status</th>
          </tr>
        </thead>
        <tbody>
          ${ORDERS.map(
            (o) => `<tr class="${o.selected ? 'is-selected' : o.bad ? 'is-bad' : o.warn ? 'is-warn' : ''}">
              <td class="mono" style="padding:5.5px 7px;font-weight:700;color:${o.selected ? '#9a3412' : '#1c1917'};">${esc(o.id)}</td>
              <td class="mono" style="padding:5.5px 7px;color:#78716c;">${esc(o.time)}</td>
              <td style="padding:5.5px 7px;font-weight:${o.selected ? '700' : '600'};">${esc(o.warung)}</td>
              <td class="mono" style="padding:5.5px 7px;font-size:10px;color:#57534e;">${esc(o.route)}</td>
              <td class="num mono" style="padding:5.5px 7px;">${o.qty} krt</td>
              <td class="num mono" style="padding:5.5px 7px;">${fmtNum(o.bruto)}</td>
              <td class="num mono" style="padding:5.5px 7px;color:#047857;">-${fmtNum(o.promo)}</td>
              <td class="num mono" style="padding:5.5px 7px;font-weight:700;">${fmtNum(o.netto)}</td>
              <td style="padding:5.5px 7px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                  <span style="font-size:9.5px;color:#57534e;">${esc(o.pay)}</span>
                  ${badge(o.status, o.tone)}
                </div>
              </td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">SUBTOTAL 20 PESANAN TAMPIL (DARI 186 TOTAL HARIAN)</td>
            <td class="num mono">${ORDER_SUM_QTY} krt</td>
            <td class="num mono">${fmtNum(ORDER_SUM_BRUTO)}</td>
            <td class="num mono" style="color:#047857;">-${fmtNum(ORDER_SUM_PROMO)}</td>
            <td class="num mono">${fmtNum(ORDER_SUM_NETTO)}</td>
            <td class="mono" style="font-size:9.8px;text-align:right;">17 Siap · 2 Hold/Cek</td>
          </tr>
        </tfoot>
      </table>
      <div style="padding:7px 10px;background:#faf8f6;border-top:1px solid #e6e1db;display:flex;align-items:center;justify-content:space-between;font-size:10.2px;color:#57534e;">
        <span>Menampilkan <strong>1–20</strong> dari <strong>186</strong> pesanan · Grand Total Depo: <strong class="mono" style="color:#1c1917;">${fmtIdr(TOTAL_NETTO)}</strong></span>
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="e-btn" style="height:21px;">Sebelumnya</span>
          <span class="e-btn e-btn-primary" style="height:21px;">1</span>
          <span class="e-btn" style="height:21px;">2</span>
          <span class="e-btn" style="height:21px;">3</span>
          <span class="e-btn" style="height:21px;">... 10</span>
          <span class="e-btn" style="height:21px;">Berikutnya</span>
        </div>
      </div>
    </div>
  </div>`;

  const inspector = `<div class="e-panel">
    <div class="e-panel-head" style="background:#fff3ed;border-bottom-color:#fdba74;">
      <div class="e-panel-title" style="color:#9a3412;">
        ${wIc('store', 13, '#c2410c')}
        <span>Inspektor Pesanan · ${esc(SUMBER_REJEKI.name)} (${esc(SUMBER_REJEKI.orderNo)})</span>
      </div>
      ${badge('KIRIM BESOK 09:00', 'accent')}
    </div>
    <div class="e-panel-body" style="padding:9px 11px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
      <!-- Warung Identity & Tempo Limit -->
      <div style="border:1px solid #e6e1db;border-radius:4px;padding:8px 9px;background:#faf8f6;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
          <div>
            <div style="font-size:12px;font-weight:700;color:#1c1917;">${esc(SUMBER_REJEKI.name)} <span class="mono" style="font-size:10px;color:#78716c;">${esc(SUMBER_REJEKI.code)}</span></div>
            <div style="font-size:10px;color:#57534e;">Pemilik: ${esc(SUMBER_REJEKI.owner)} · ${esc(SUMBER_REJEKI.address)}</div>
          </div>
          ${badge('Tier A · Depok-03', 'ok')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;">
          <div style="background:#ffffff;border:1px solid #e6e1db;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#78716c;font-weight:600;">Limit Tempo 7H</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#047857;">Rp 4,5 jt</div>
          </div>
          <div style="background:#ffffff;border:1px solid #e6e1db;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#78716c;font-weight:600;">Promo Aktif</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#c2410c;">Rp 85 rb</div>
          </div>
          <div style="background:#ffffff;border:1px solid #e6e1db;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#78716c;font-weight:600;">Sisa Limit Pasca-Order</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#1c1917;">${fmtIdr(SUMBER_REJEKI.tempoLimit - srUsedAfter)}</div>
          </div>
        </div>
        <div style="margin-top:7px;">
          <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#57534e;margin-bottom:3px;">
            <span>Eksposur Kredit (#INV-1113 + #ORD-241104)</span>
            <span class="mono" style="font-weight:700;">${fmtIdr(srUsedAfter)} / ${fmtIdr(SUMBER_REJEKI.tempoLimit)} (${fmtPct(srLimitPct)})</span>
          </div>
          ${renderCapacityBar(srLimitPct, { warnAt: 75, critAt: 90, showLabel: false })}
        </div>
      </div>

      <!-- Multi-Unit GT Line Items -->
      <div style="border:1px solid #e6e1db;border-radius:4px;overflow:hidden;">
        <div style="padding:5px 8px;background:#f5f2ee;border-bottom:1px solid #e6e1db;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10.5px;font-weight:700;color:#1c1917;">Rincian SKU & Konversi Satuan GT (8 Karton/Dus)</span>
          <span class="mono" style="font-size:9.5px;color:#9a3412;">Scan Rak: 42 detik</span>
        </div>
        <table class="e-table" style="font-size:10.2px;">
          <thead>
            <tr>
              <th style="width:15%;">SKU</th>
              <th style="width:41%;">Produk & Konversi</th>
              <th class="num" style="width:16%;">Qty</th>
              <th class="num" style="width:28%;">Subtotal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${SUMBER_REJEKI.lines
              .map(
                (l) => `<tr>
                  <td class="mono" style="font-weight:700;color:#9a3412;">${esc(l.code)}</td>
                  <td>
                    <div style="font-weight:600;" class="trunc">${esc(l.title)}</div>
                    <div style="font-size:9.2px;color:#78716c;">${esc(l.conv)} · @${fmtNum(l.unitPrice)}</div>
                  </td>
                  <td class="num mono">${l.qty} ${esc(l.unit)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtNum(l.subtotal)}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <div style="padding:7px 9px;background:#faf8f6;border-top:1px solid #e6e1db;display:flex;flex-direction:column;gap:3px;font-size:10.3px;">
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#57534e;">Subtotal Bruto (8 karton/dus)</span>
            <span class="mono">${fmtIdr(srBruto)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#047857;">
            <span>Promo Principal Minyak 5 Dus (Otomatis)</span>
            <span class="mono">-${fmtIdr(SUMBER_REJEKI.promoPrincipal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#047857;">
            <span>Rebate Loyalitas Tempo 7H (Tier A)</span>
            <span class="mono">-${fmtIdr(SUMBER_REJEKI.rebateTierA)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:4px;margin-top:2px;border-top:1px solid #d6cfc7;font-weight:700;font-size:11.5px;color:#1c1917;">
            <span>Total Tagihan Netto (DPP)</span>
            <span class="mono" style="color:#c2410c;">${fmtIdr(SUMBER_REJEKI.netto)}</span>
          </div>
        </div>
      </div>

      <!-- Open Tempo Invoice #INV-1113 -->
      <div style="border:1px solid #fde68a;border-left:3px solid #b45309;background:#fffbeb;border-radius:4px;padding:7px 9px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-size:10.5px;font-weight:700;color:#92400e;">Tagihan Tempo Berjalan: ${esc(SUMBER_REJEKI.openInvoiceNo)}</span>
          ${badge('Jatuh 2h · 22 Nov', 'warn')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-size:10px;color:#78350f;">Pelunasan via QRIS Dinamis atau COD Supir Depok-03</span>
          <span class="mono" style="font-size:13px;font-weight:800;color:#92400e;">${fmtIdr(SUMBER_REJEKI.openInvoiceAmount)}</span>
        </div>
      </div>

      <!-- Recent 3-Cycle Tempo Payment Track Record -->
      <div style="border:1px solid #e6e1db;border-radius:4px;overflow:hidden;">
        <div style="padding:4.5px 8px;background:#f5f2ee;border-bottom:1px solid #e6e1db;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;font-weight:700;color:#1c1917;">Histori Pelunasan 3 Siklus Terakhir (Skor DSO 5,2 hr)</span>
          ${badge('100% Tepat Waktu', 'ok')}
        </div>
        <table class="e-table" style="font-size:9.8px;">
          <tbody>
            <tr>
              <td class="mono" style="font-weight:700;width:24%;">#INV-1089</td>
              <td style="width:24%;color:#57534e;">15 Nov 2026</td>
              <td class="num mono" style="width:26%;font-weight:700;">Rp 1.620.000</td>
              <td style="width:26%;text-align:right;">${badge('Lunas QRIS · 5h', 'ok')}</td>
            </tr>
            <tr>
              <td class="mono" style="font-weight:700;">#INV-1042</td>
              <td style="color:#57534e;">08 Nov 2026</td>
              <td class="num mono" style="font-weight:700;">Rp 1.495.000</td>
              <td style="text-align:right;">${badge('Lunas QRIS · 6h', 'ok')}</td>
            </tr>
            <tr>
              <td class="mono" style="font-weight:700;">#INV-0998</td>
              <td style="color:#57534e;">01 Nov 2026</td>
              <td class="num mono" style="font-weight:700;">Rp 1.710.000</td>
              <td style="text-align:right;">${badge('Lunas COD · 4h', 'ok')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edge Sync & Payload Proof -->
      <div style="border:1px solid #e6e1db;border-radius:4px;padding:7px 9px;background:#ffffff;display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;font-weight:700;color:#1c1917;">Jejak Sinkronisasi SQLite Offline -> .NET 9 Edge API</span>
          ${badge('SHA-256 Valid', 'ok')}
        </div>
        <div class="mono" style="font-size:9.4px;color:#57534e;line-height:1.45;">
          Device: Samsung A05 (Android 14 · RAM 2GB · 4G 2-bar)<br/>
          Payload: 3,4 KB Brotli · Latensi 184 ms · Idempotency Key: wr_241104_dpk03<br/>
          Snippet: Pesanan Masuk: 8 krt (Rp 1.324.000) -> Truk Depok-03 | -Rp 25.000
        </div>
        <div style="display:flex;gap:6px;margin-top:3px;">
          <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#fff')} Setujui & Alokasi Truk</span>
          <span class="e-btn" style="flex:1;justify-content:center;">${wIc('qr', 11)} Kirim QRIS #INV-1113</span>
        </div>
      </div>
    </div>
  </div>`;

  const mainGrid = `<section style="display:grid;grid-template-columns:1.88fr 1fr;gap:9px;flex:1;min-height:0;">
    ${ordersTable}
    ${inspector}
  </section>`;

  return renderShell({
    activeTab: 'p2',
    crumbTitle: 'Buku Besar Pesanan Restock & Inspektor Satuan GT',
    crumbSub: 'Validasi konversi karton/dus/renceng, potongan promo principal & batas kredit tempo 7 hari',
    actionsHtml: `
      <span class="e-btn">${wIc('barcode', 11)} Audit Scan Barcode</span>
      <span class="e-btn">${ic('refresh', 11)} Tarik Antrean SQLite (14)</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Terbitkan 17 Faktur Batch</span>
    `,
    bodyHtml: `${filterBar}${mainGrid}`,
  });
}

// ============================================================================
// PAGE 3: PRATINJAU APLIKASI ANDROID WARUNG (OFFLINE-FIRST TRIO)
// ============================================================================
function renderQrisSvg() {
  // Deterministic crisp vector QR matrix for #INV-1113
  const bits = [
    '11111110101101111111',
    '10000010010101000001',
    '10111010111001011101',
    '10111010001101011101',
    '10111010100101011101',
    '10000010011001000001',
    '11111110101011111111',
    '00000000110100000000',
    '10110111011011010110',
    '01001010100100101001',
    '11101101110011011100',
    '00110010011100100111',
    '10101111101011110101',
    '00000000101101001010',
    '11111110010110110111',
    '10000010111001001001',
    '10111010100111101110',
    '10111010011000110011',
    '10000010101110011101',
    '11111110010011101011',
  ];
  let rects = '';
  const cell = 4.2;
  bits.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '1') {
        rects += `<rect x="${(4 + c * cell).toFixed(1)}" y="${(4 + r * cell).toFixed(1)}" width="${cell}" height="${cell}" fill="#1c1917" />`;
      }
    }
  });
  return `<svg viewBox="0 0 92 92" width="88" height="88" style="display:block;background:#ffffff;border:1px solid #d6cfc7;border-radius:3px;">${rects}</svg>`;
}

function renderBarcodeSvg() {
  const widths = [2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 1, 2, 2, 1, 3, 2, 1, 2, 1, 2, 2];
  let x = 22;
  let bars = '';
  widths.forEach((w, i) => {
    if (i % 2 === 0) {
      bars += `<rect x="${x}" y="12" width="${w * 2.1}" height="52" fill="#1c1917" />`;
    }
    x += w * 2.1 + 1.6;
  });
  return `<svg viewBox="0 0 260 88" width="100%" height="84" style="display:block;background:#faf8f6;border:1px solid #d6cfc7;border-radius:4px;">
    <rect x="8" y="6" width="244" height="64" rx="2" fill="#ffffff" stroke="#e6e1db" />
    ${bars}
    <line x1="12" y1="38" x2="248" y2="38" stroke="#c2410c" stroke-width="1.8" />
    <path d="M12 18 L12 8 L24 8 M248 18 L248 8 L236 8 M12 58 L12 68 L24 68 M248 58 L248 68 L236 68" fill="none" stroke="#c2410c" stroke-width="2" />
    <text x="130" y="82" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="10.5" font-weight="700" fill="#1c1917">8 998866 200578 · SKU GT-01</text>
  </svg>`;
}

function renderPage3() {
  const topStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi e-kpi-accent-top">
      <div class="e-kpi-top"><span>Perangkat Warung Aktif</span>${badge('Android 10-14', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">186 Toko</span><span class="mono" style="font-size:10px;color:#047857;">98,4% v2.8</span></div>
      <div class="e-kpi-foot"><span>Target ponsel RAM 2-3 GB · APK 14,2 MB</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kecepatan Scan Restock</span>${badge('< 60 detik', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">42 dtk</span><span class="mono" style="font-size:10px;color:#047857;">Median rak</span></div>
      <div class="e-kpi-foot"><span>Kamera EAN-13 lokal (ML Kit Offline)</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Payload 4G Terkompresi</span>${badge('Brotli 3,4 KB', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">184 ms</span><span class="mono" style="font-size:10px;color:#57534e;">p95 Edge API</span></div>
      <div class="e-kpi-foot"><span>Hemat kuota 81% di jaringan 4G terbatas</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Mesin SQLite Offline-First</span>${badge('WAL Mode', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">0 Konflik</span><span class="mono" style="font-size:10px;color:#047857;">100% Idemp.</span></div>
      <div class="e-kpi-foot"><span>Auto-replay katalog & pesanan saat sinyal pulih</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Konversi Satuan Lokal</span>${badge('GT FMCG', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">4 Tingkat</span><span class="mono" style="font-size:10px;color:#9a3412;">Krt/Dus/Rcn/Pcs</span></div>
      <div class="e-kpi-foot"><span>Kalkulasi otomatis HPP eceran & margin warung</span></div>
    </div>
  </section>`;

  // PHONE 1: Home / Warung Restock Dashboard
  const phone1 = `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
    <div class="android-frame">
      <div class="android-sysbar">
        <span>09:14 WIB</span>
        <span style="display:inline-flex;align-items:center;gap:5px;">${wIc('wifi', 10, '#86efac')} 4G · SQLite OK · 82%</span>
      </div>
      <div class="android-appbar">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:12px;font-weight:800;">WarungRestock · Toko Sumber Rejeki</div>
            <div class="mono" style="font-size:9px;color:#ffedd5;margin-top:1px;">KIRIM BESOK 09:00 · TEMPO 7 HARI</div>
          </div>
          <span style="background:#9a3412;border:1px solid #fdba74;padding:2px 6px;border-radius:3px;font-family:var(--e-mono);font-size:9px;font-weight:700;">Depok-03</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px;">
          <div style="background:#9a3412;border-radius:3px;padding:4px 6px;">
            <div style="font-size:8.5px;color:#fed7aa;">Limit Tempo 7H</div>
            <div class="mono" style="font-size:11px;font-weight:800;">Rp 4,5 jt</div>
          </div>
          <div style="background:#9a3412;border-radius:3px;padding:4px 6px;">
            <div style="font-size:8.5px;color:#fed7aa;">Promo Aktif</div>
            <div class="mono" style="font-size:11px;font-weight:800;">Rp 85 rb</div>
          </div>
          <div style="background:#9a3412;border-radius:3px;padding:4px 6px;">
            <div style="font-size:8.5px;color:#fed7aa;">Rute Truk</div>
            <div class="mono" style="font-size:11px;font-weight:800;">Depok-03</div>
          </div>
        </div>
      </div>
      <div class="android-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="background:#c2410c;color:#fff;border-radius:4px;padding:7px;text-align:center;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;">
            ${wIc('box', 12, '#fff')} Pesan Restock
          </div>
          <div style="background:#ffffff;color:#1c1917;border:1px solid #c2410c;border-radius:4px;padding:7px;text-align:center;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:5px;">
            ${wIc('barcode', 12, '#c2410c')} Scan Barcode Rak
          </div>
        </div>

        <div style="font-size:9.8px;font-weight:700;color:#57534e;display:flex;justify-content:space-between;align-items:center;">
          <span>REKOMENDASI RESTOCK & TAGIHAN</span>
          <span class="mono" style="color:#9a3412;">4 Item Prioritas</span>
        </div>

        <div class="m-card" style="border-left:3px solid #047857;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.3px;font-weight:700;color:#9a3412;">GT-01 · Laris</span>
            ${badge('Promo', 'ok')}
          </div>
          <div style="font-size:10.8px;font-weight:700;color:#1c1917;margin-top:2px;">Minyak Goreng 1L Pouch (1 Dus = 12)</div>
          <div style="font-size:9.5px;color:#57534e;">Promo beli 5 dus potongan Rp 25.000</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span class="mono" style="font-size:11px;font-weight:800;color:#1c1917;">Rp 196.000/dus</span>
            <span style="background:#fff3ed;border:1px solid #fdba74;color:#9a3412;padding:1.5px 7px;border-radius:3px;font-size:9.5px;font-weight:700;">+ 5 Dus</span>
          </div>
        </div>

        <div class="m-card" style="border-left:3px solid #b45309;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.3px;font-weight:700;color:#b45309;">GT-02 · Pesan Ulang</span>
            ${badge('Stok Tipis', 'warn')}
          </div>
          <div style="font-size:10.8px;font-weight:700;color:#1c1917;margin-top:2px;">Mie Instan Goreng (1 Karton = 40)</div>
          <div style="font-size:9.5px;color:#92400e;">Stok warung tinggal 12 bungkus</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span class="mono" style="font-size:11px;font-weight:800;color:#1c1917;">Rp 114.500/krt</span>
            <span style="background:#fff3ed;border:1px solid #fdba74;color:#9a3412;padding:1.5px 7px;border-radius:3px;font-size:9.5px;font-weight:700;">+ 2 Krt</span>
          </div>
        </div>

        <div class="m-card" style="border-left:3px solid #047857;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.3px;font-weight:700;color:#57534e;">GT-03 · Renceng</span>
            ${badge('Siap', 'ok')}
          </div>
          <div style="font-size:10.8px;font-weight:700;color:#1c1917;margin-top:2px;">Kopi Sachet Renceng (1 Dus = 12 Rcn)</div>
          <div style="font-size:9.5px;color:#57534e;">Estimasi margin eceran 18%</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span class="mono" style="font-size:11px;font-weight:800;color:#1c1917;">Rp 148.000/dus</span>
            <span style="background:#fff3ed;border:1px solid #fdba74;color:#9a3412;padding:1.5px 7px;border-radius:3px;font-size:9.5px;font-weight:700;">+ 1 Dus</span>
          </div>
        </div>

        <div class="m-card" style="border-left:3px solid #b45309;background:#fffbeb;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.3px;font-weight:700;color:#92400e;">GT-04 · Tempo</span>
            ${badge('Jatuh 2h', 'warn')}
          </div>
          <div style="font-size:10.8px;font-weight:700;color:#1c1917;margin-top:2px;">Tagihan Tempo #INV-1113</div>
          <div style="font-size:9.5px;color:#78350f;">Jatuh tempo 22 Nov · Bayar via QRIS/Supir</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
            <span class="mono" style="font-size:11.5px;font-weight:800;color:#92400e;">Rp 1.840.000</span>
            <span style="background:#1c1917;color:#ffffff;padding:2px 8px;border-radius:3px;font-size:9.5px;font-weight:700;">Bayar QRIS</span>
          </div>
        </div>
      </div>
      <div class="android-nav">
        <div class="android-nav-btn is-active">${wIc('store', 12, '#c2410c')}<span>Beranda</span></div>
        <div class="android-nav-btn">${wIc('barcode', 12, '#78716c')}<span>Scan Rak</span></div>
        <div class="android-nav-btn">${wIc('percent', 12, '#78716c')}<span>Promo</span></div>
        <div class="android-nav-btn">${wIc('receipt', 12, '#78716c')}<span>Tempo</span></div>
      </div>
    </div>
    <div style="font-size:10.5px;font-weight:700;color:#44403c;">1. Beranda Warung & Status Tempo 7H</div>
  </div>`;

  // PHONE 2: Barcode Rack Scanner (<60s) & Multi-Unit Converter
  const phone2 = `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
    <div class="android-frame">
      <div class="android-sysbar">
        <span>09:15 WIB</span>
        <span>MODE OFFLINE · SQLite Lokal</span>
      </div>
      <div class="android-appbar" style="background:#1c1917;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11.5px;font-weight:700;">Scan Barcode Rak (< 60 Detik)</div>
            <div style="font-size:9px;color:#d6d3d1;">Arahkan ke kemasan dus, renceng, atau satuan rak</div>
          </div>
          <span class="mono" style="background:#c2410c;padding:2px 6px;border-radius:3px;font-size:9.5px;font-weight:700;">00:42</span>
        </div>
      </div>
      <div class="android-body">
        ${renderBarcodeSvg()}

        <div class="m-card" style="border-color:#fdba74;background:#fff8f4;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:11px;color:#1c1917;">Minyak Goreng 1L Pouch</strong>
            ${badge('Terdeteksi 0,3 dtk', 'ok')}
          </div>
          <div style="font-size:9.5px;color:#57534e;margin-top:2px;">Konversi Satuan GT: <strong>1 Dus = 12 Pouch</strong> · 1 Karton = 2 Dus</div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px;">
            <div style="background:#ffffff;border:1px solid #d6cfc7;border-radius:3px;padding:4px;text-align:center;">
              <div style="font-size:8.5px;color:#78716c;">Karton (24)</div>
              <div class="mono" style="font-size:10px;font-weight:700;">Rp 392rb</div>
            </div>
            <div style="background:#c2410c;color:#ffffff;border:1px solid #c2410c;border-radius:3px;padding:4px;text-align:center;">
              <div style="font-size:8.5px;color:#ffedd5;">Dus (12) · Aktif</div>
              <div class="mono" style="font-size:10px;font-weight:800;">Rp 196rb</div>
            </div>
            <div style="background:#ffffff;border:1px solid #d6cfc7;border-radius:3px;padding:4px;text-align:center;">
              <div style="font-size:8.5px;color:#78716c;">HPP / Pouch</div>
              <div class="mono" style="font-size:10px;font-weight:700;">Rp 16.333</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px;padding-top:6px;border-top:1px solid #fed7aa;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:22px;height:22px;border:1px solid #c8c1b8;border-radius:3px;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;">-</span>
              <span class="mono" style="font-size:12px;font-weight:800;">5 Dus</span>
              <span style="width:22px;height:22px;border:1px solid #c2410c;border-radius:3px;background:#c2410c;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;">+</span>
              <span style="font-size:9.3px;color:#57534e;">(= 60 Pouch)</span>
            </div>
            <span class="mono" style="font-size:11.5px;font-weight:800;color:#9a3412;">Rp 980.000</span>
          </div>
        </div>

        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:6px 8px;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:9.5px;color:#065f46;font-weight:600;">Target Promo Principal Tercapai (5 Dus)!</div>
          <span class="mono" style="font-size:10px;font-weight:800;color:#047857;">-Rp 25.000</span>
        </div>

        <div class="m-card" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="font-size:9.5px;font-weight:700;color:#57534e;margin-bottom:5px;">KERANJANG SCAN SAAT INI (3 SKU · 8 KRT/DUS)</div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:10px;">
              <div style="display:flex;justify-content:space-between;padding-bottom:3px;border-bottom:1px solid #f5f2ee;">
                <span><strong>GT-01</strong> Minyak Goreng 1L (5 Dus)</span>
                <span class="mono" style="font-weight:700;">980.000</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:3px;border-bottom:1px solid #f5f2ee;">
                <span><strong>GT-02</strong> Mie Instan Goreng (2 Krt)</span>
                <span class="mono" style="font-weight:700;">229.000</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:3px;border-bottom:1px solid #f5f2ee;">
                <span><strong>GT-03</strong> Kopi Sachet Renceng (1 Dus)</span>
                <span class="mono" style="font-weight:700;">148.000</span>
              </div>
            </div>
            <div style="margin-top:6px;padding:5px 7px;background:#faf8f6;border:1px dashed #d6cfc7;border-radius:3px;font-size:9.2px;color:#57534e;display:flex;justify-content:space-between;">
              <span>Rekomendasi Scan: <strong>GT-05 Gula Pasir 1Kg</strong></span>
              <span class="mono" style="color:#9a3412;">-15rb / 3 Bal</span>
            </div>
          </div>
          <div style="padding-top:6px;border-top:1px solid #e6e1db;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:9px;color:#78716c;">Netto Pasca Promo (-Rp 33rb)</div>
              <div class="mono" style="font-size:13px;font-weight:800;color:#c2410c;">Rp 1.324.000</div>
            </div>
            <span style="background:#c2410c;color:#ffffff;padding:6px 11px;border-radius:4px;font-size:10.5px;font-weight:700;">Lanjut Kirim -></span>
          </div>
        </div>
      </div>
      <div class="android-nav">
        <div class="android-nav-btn">${wIc('store', 12, '#78716c')}<span>Beranda</span></div>
        <div class="android-nav-btn is-active">${wIc('barcode', 12, '#c2410c')}<span>Scan Rak</span></div>
        <div class="android-nav-btn">${wIc('percent', 12, '#78716c')}<span>Promo</span></div>
        <div class="android-nav-btn">${wIc('receipt', 12, '#78716c')}<span>Tempo</span></div>
      </div>
    </div>
    <div style="font-size:10.5px;font-weight:700;color:#44403c;">2. Scan Barcode Rak & Konversi Multi-Satuan</div>
  </div>`;

  // PHONE 3: Milk-Run Slot Confirmation & QRIS/Tempo Payment
  const phone3 = `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
    <div class="android-frame">
      <div class="android-sysbar">
        <span>09:16 WIB</span>
        <span>Sync Antrean · 3,4 KB Brotli</span>
      </div>
      <div class="android-appbar">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11.5px;font-weight:800;">Konfirmasi Kirim & Pembayaran</div>
            <div class="mono" style="font-size:9px;color:#ffedd5;">#ORD-241104 · Toko Sumber Rejeki</div>
          </div>
          ${badge('Tempo 7H', 'neutral')}
        </div>
      </div>
      <div class="android-body">
        <div class="m-card" style="border-left:3px solid #c2410c;">
          <div style="font-size:9.3px;font-weight:700;color:#9a3412;">SLOT TRUK MILK-RUN BESOK</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
            <div>
              <div style="font-size:11px;font-weight:700;color:#1c1917;">Besok, 09:00–11:00 WIB</div>
              <div style="font-size:9.5px;color:#57534e;">Rute Depok-03 · Truk B 9421 TXU (A. Kurniawan)</div>
            </div>
            ${badge('Gratis Ongkir', 'ok')}
          </div>
        </div>

        <div class="m-card">
          <div style="font-size:9.3px;font-weight:700;color:#57534e;margin-bottom:5px;">METODE PEMBAYARAN PESANAN BARU</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <div style="border:1.5px solid #c2410c;background:#fff8f4;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:10.3px;font-weight:700;color:#9a3412;">Tempo Bayar 7 Hari (Jatuh 29 Nov)</div>
                <div style="font-size:9px;color:#57534e;">Sisa limit pasca-order: Rp 1.336.000</div>
              </div>
              <span class="dot" style="background:#c2410c;width:9px;height:9px;"></span>
            </div>
            <div style="border:1px solid #e6e1db;background:#ffffff;border-radius:3px;padding:5px 7px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10px;color:#44403c;">QRIS Dinamis Instan / COD Tunai Supir</span>
              <span class="mono" style="font-size:9px;color:#78716c;">0% Biaya</span>
            </div>
          </div>
        </div>

        <div class="m-card">
          <div style="font-size:9.3px;font-weight:700;color:#57534e;margin-bottom:4px;">PELUNASAN CEPAT TAGIHAN #INV-1113 (QRIS)</div>
          <div style="display:flex;gap:8px;align-items:center;">
            ${renderQrisSvg()}
            <div style="flex:1;display:flex;flex-direction:column;gap:3px;">
              <div style="font-size:10.5px;font-weight:700;color:#1c1917;">Tagihan #INV-1113</div>
              <div class="mono" style="font-size:13px;font-weight:800;color:#9a3412;">Rp 1.840.000</div>
              <div style="font-size:9px;color:#57534e;line-height:1.3;">Jatuh tempo 22 Nov. Scan QRIS untuk buka kembali limit Rp 1,84 jt secara instan.</div>
              ${badge('BI-SNAP QRIS Aktif', 'ok')}
            </div>
          </div>
        </div>

        <div class="m-card" style="background:#faf8f6;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;flex-direction:column;gap:2.5px;font-size:10px;">
            <div style="display:flex;justify-content:space-between;"><span>Bruto 8 Karton/Dus</span><span class="mono">Rp 1.357.000</span></div>
            <div style="display:flex;justify-content:space-between;color:#047857;"><span>Potongan Promo Minyak 5 Dus</span><span class="mono">-Rp 25.000</span></div>
            <div style="display:flex;justify-content:space-between;color:#047857;"><span>Rebate Loyalitas Tier A</span><span class="mono">-Rp 8.000</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:11.5px;padding-top:3px;border-top:1px solid #d6cfc7;color:#1c1917;">
              <span>Total Pesanan Masuk</span><span class="mono" style="color:#c2410c;">Rp 1.324.000</span>
            </div>
          </div>
          <div style="font-size:9px;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:3.5px 6px;text-align:center;font-weight:600;">
            Tersimpan di SQLite Lokal · Siap Sync 4G Otomatis
          </div>
          <div style="background:#c2410c;color:#ffffff;border-radius:4px;padding:7px;text-align:center;font-size:10.8px;font-weight:700;">
            Kirim Pesanan ke Truk Depok-03
          </div>
        </div>
      </div>
      <div class="android-nav">
        <div class="android-nav-btn">${wIc('store', 12, '#78716c')}<span>Beranda</span></div>
        <div class="android-nav-btn">${wIc('barcode', 12, '#78716c')}<span>Scan Rak</span></div>
        <div class="android-nav-btn">${wIc('percent', 12, '#78716c')}<span>Promo</span></div>
        <div class="android-nav-btn is-active">${wIc('receipt', 12, '#c2410c')}<span>Tempo</span></div>
      </div>
    </div>
    <div style="font-size:10.5px;font-weight:700;color:#44403c;">3. Slot Milk-Run Depok-03 & QRIS #INV-1113</div>
  </div>`;

  const waterfall = svgSpanWaterfall({
    width: 410,
    totalMs: 200,
    spans: [
      { label: 'SQLite WAL Local Write', start: 0, dur: 14, color: '#57534e' },
      { label: 'Brotli Compress (3,4KB)', start: 14, dur: 18, color: '#0369a1' },
      { label: '4G Edge TLS + Auth', start: 32, dur: 58, color: '#d97706' },
      { label: '.NET 9 Unit & Promo Eval', start: 90, dur: 34, color: '#c2410c' },
      { label: 'Tempo Ledger PG Lock', start: 124, dur: 42, color: '#047857' },
      { label: 'Idempotent ACK + ETag', start: 166, dur: 18, color: '#44403c' },
    ],
  });

  const mainRow = `<section style="display:grid;grid-template-columns:2.42fr 1fr;gap:10px;flex:1;min-height:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${wIc('phone', 13, '#c2410c')}
          <span>Simulasi Langsung Aplikasi Android WarungRestock — Toko Sumber Rejeki (3 Layar Inti)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('.NET MAUI / Flutter', 'neutral')}
          ${badge('Offline-First SQLite', 'ok')}
          ${badge('360x740 Low-Spec Android', 'accent')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-around;background:#f7f5f2;">
        ${phone1}
        ${phone2}
        ${phone3}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="height:262px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('zap', 13, '#c2410c')}
            <span>Profil Latensi 4G · .NET 9 Lightweight Edge API</span>
          </div>
          <span class="mono" style="font-size:10px;font-weight:700;color:#047857;">184 ms Total</span>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
          ${waterfall}
          <div style="padding:6px 8px;background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;font-size:9.8px;color:#57534e;display:flex;justify-content:space-between;">
            <span>Delta Katalog Harian: <strong>48 KB</strong></span>
            <span>Retry Offline: <strong>Exponential Backoff</strong></span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${wIc('box', 13, '#c2410c')}
            <span>Master Konversi Satuan GT FMCG</span>
          </div>
          ${badge('7 SKU Aktif', 'neutral')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:9.8px;">
            <thead>
              <tr>
                <th style="width:13%;">SKU</th>
                <th style="width:37%;">Produk & Rasio</th>
                <th class="num" style="width:14%;">HPP/Pcs</th>
                <th class="num" style="width:12%;">Mgn</th>
                <th style="width:24%;">Skema Promo</th>
              </tr>
            </thead>
            <tbody>
              ${SKU_CONVERSIONS.map(
                (s, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:#9a3412;">${esc(s.code)}</td>
                  <td>
                    <div class="trunc" style="font-weight:600;">${esc(s.name)}</div>
                    <div class="mono" style="font-size:8.8px;color:#78716c;">${esc(s.ratio)}</div>
                  </td>
                  <td class="num mono">${fmtNum(s.hppPcs)}</td>
                  <td class="num mono" style="color:#047857;font-weight:700;">${esc(s.margin)}</td>
                  <td class="mono" style="font-size:9.2px;color:#44403c;font-weight:600;">${esc(s.promo)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
          <div style="padding:7px 10px;background:#fff8f4;border-top:1px solid #fed7aa;font-size:9.8px;color:#9a3412;">
            <strong>Catatan Konversi:</strong> Aplikasi warung menghitung harga eceran per pcs/bungkus secara otomatis saat pemilik memilih satuan Karton, Dus, atau Renceng tanpa koneksi internet.
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p3',
    crumbTitle: 'Pratinjau Aplikasi Android Warung (Offline-First)',
    crumbSub: 'Alur end-to-end pemilik warung: beranda tempo, scan barcode rak <60 dtk & pelunasan QRIS',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11)} Dorong Delta Katalog (48 KB)</span>
      <span class="e-btn e-btn-primary">${wIc('phone', 11, '#fff')} Publikasi Paket Promo v2.8</span>
    `,
    bodyHtml: `${topStrip}${mainRow}`,
  });
}

// ============================================================================
// PAGE 4: PETA RUTE MILK-RUN DEPOK-BOGOR & MANIFEST ARMADA
// ============================================================================
function renderMilkRunMapSvg() {
  return `<svg viewBox="0 0 840 398" width="100%" height="398" style="display:block;background:#f8f6f2;border-radius:3px;">
    <!-- Subtle Cartographic Grid -->
    <defs>
      <pattern id="mapGrid" width="42" height="42" patternUnits="userSpaceOnUse">
        <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#ebe6de" stroke-width="1" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="840" height="398" fill="url(#mapGrid)" />

    <!-- Geographic Zone Polygons -->
    <polygon points="18,22 250,22 280,170 40,195" fill="#eef2f0" stroke="#d5ddd8" stroke-width="1" />
    <text x="36" y="42" font-size="9.5" font-weight="700" fill="#78716c" font-family="system-ui,sans-serif">KORIDOR CINERE &amp; LIMO</text>

    <polygon points="275,20 582,20 592,205 290,210" fill="#fff7f2" stroke="#fed7aa" stroke-width="1.2" />

    <polygon points="602,26 822,26 822,314 612,314" fill="#f3f5f8" stroke="#d5dde6" stroke-width="1" />
    <text x="618" y="45" font-size="9.5" font-weight="700" fill="#64748b" font-family="system-ui,sans-serif">KORIDOR CIBINONG-02</text>

    <polygon points="24,215 330,215 345,372 24,372" fill="#f5f3ef" stroke="#dfd8ce" stroke-width="1" />
    <text x="44" y="356" font-size="9.5" font-weight="700" fill="#78716c" font-family="system-ui,sans-serif">KORIDOR SAWANGAN-04 &amp; BOJONGSARI</text>

    <!-- Arterial Roads -->
    <path d="M 10 198 L 415 198 L 540 120 L 830 120" fill="none" stroke="#d6cfc7" stroke-width="7" stroke-linecap="round" />
    <path d="M 415 10 L 415 390" fill="none" stroke="#d6cfc7" stroke-width="8" />
    <path d="M 650 10 L 650 390" fill="none" stroke="#e2dcd4" stroke-width="6" />
    <text x="424" y="378" font-size="8.8" font-weight="700" fill="#78716c" font-family="ui-monospace,monospace">JL. MARGONDA RAYA</text>
    <text x="658" y="218" font-size="8.8" font-weight="700" fill="#78716c" font-family="ui-monospace,monospace">JL. RAYA BOGOR</text>
    <text x="60" y="191" font-size="8.8" font-weight="700" fill="#78716c" font-family="ui-monospace,monospace">JL. RAYA SAWANGAN / TOL CIJAGO</text>

    <!-- Clean Opaque Zone Pill Badge above Roads -->
    <rect x="285" y="26" width="286" height="20" rx="3" fill="#fff3ed" stroke="#fdba74" stroke-width="1" />
    <text x="294" y="39.5" font-size="9.2" font-weight="800" fill="#9a3412" font-family="system-ui,sans-serif">ZONA AKTIF · RUTE DEPOK-03 (MARGONDA–BEJI)</text>

    <!-- Secondary Route Loops (Muted) -->
    <!-- Cibinong-02 Loop -->
    <polyline points="508,264 635,245 735,165 775,260 700,328 508,264" fill="none" stroke="#0369a1" stroke-width="2" stroke-dasharray="5,4" opacity="0.72" />
    <!-- Sawangan-04 Loop -->
    <polyline points="508,264 310,275 180,250 105,310 245,335 508,264" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="5,4" opacity="0.72" />
    <!-- Cinere-06 Loop -->
    <polyline points="508,264 360,155 195,120 115,78 220,62 508,264" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4,4" opacity="0.6" />

    <!-- ACTIVE ROUTE: DEPOK-03 MILK-RUN LOOP (Solid Burnt Terracotta) -->
    <polyline points="508,264 468,185 452,132 392,98 332,88 308,142 355,176 418,225 462,250 508,264" fill="none" stroke="#c2410c" stroke-width="3.2" stroke-linejoin="round" />

    <!-- Depo Utama PT Sumber Makmur (Hub) -->
    <circle cx="508" cy="264" r="14" fill="#1c1917" stroke="#ffffff" stroke-width="2.5" />
    <text x="508" y="268" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff" font-family="ui-monospace,monospace">DC</text>
    <rect x="444" y="284" width="148" height="28" rx="3" fill="#1c1917" />
    <text x="518" y="296" text-anchor="middle" font-size="9" font-weight="700" fill="#ffffff" font-family="system-ui,sans-serif">DEPO UTAMA CILODONG</text>
    <text x="518" y="307" text-anchor="middle" font-size="8.2" fill="#fed7aa" font-family="ui-monospace,monospace">Berangkat 08:30 · 6 Truk</text>

    <!-- Numbered Milk-Run Stops on Depok-03 -->
    ${[
      { n: '1', x: 468, y: 185, lbl: '08:40 Barokah Jaya' },
      { n: '2', x: 452, y: 132, lbl: '08:50 Berkah Ibu' },
      { n: '4', x: 332, y: 88, lbl: '09:15 Karya Baru' },
      { n: '5', x: 308, y: 142, lbl: '09:30 Bintang Timur' },
      { n: '6', x: 355, y: 176, lbl: '09:48 Bu Ningsih' },
      { n: '7', x: 418, y: 225, lbl: '10:05 Jaya Abadi 2' },
    ]
      .map(
        (s) => `<circle cx="${s.x}" cy="${s.y}" r="8.5" fill="#ffffff" stroke="#c2410c" stroke-width="2" />
          <text x="${s.x}" y="${s.y + 3}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#9a3412" font-family="ui-monospace,monospace">${s.n}</text>`
      )
      .join('')}

    <!-- HIGHLIGHTED STOP #3: TOKO SUMBER REJEKI (09:00 WIB) -->
    <circle cx="392" cy="98" r="22" fill="#c2410c" fill-opacity="0.14" stroke="#c2410c" stroke-width="1" stroke-dasharray="3,2" />
    <circle cx="392" cy="98" r="10.5" fill="#c2410c" stroke="#ffffff" stroke-width="2" />
    <text x="392" y="101.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff" font-family="ui-monospace,monospace">3</text>

    <!-- Callout Card for Stop #3 (clean leader line, zero overlap) -->
    <line x1="402" y1="95" x2="438" y2="82" stroke="#c2410c" stroke-width="1.4" stroke-dasharray="3,2" />
    <rect x="438" y="56" width="212" height="54" rx="4" fill="#ffffff" stroke="#c2410c" stroke-width="1.5" />
    <text x="447" y="71" font-size="9.8" font-weight="800" fill="#9a3412" font-family="system-ui,sans-serif">STOP #3 · TOKO SUMBER REJEKI</text>
    <text x="447" y="85" font-size="9" fill="#1c1917" font-family="ui-monospace,monospace">ETA 09:00 WIB · 8 Krt · Rp 1.324.000</text>
    <text x="447" y="99" font-size="8.6" fill="#b45309" font-family="ui-monospace,monospace">Tagih #INV-1113: Rp 1.840.000 (QRIS/COD)</text>

    <!-- Route Badges on Other Loops -->
    <rect x="688" y="142" width="112" height="22" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1" />
    <text x="744" y="156" text-anchor="middle" font-size="8.8" font-weight="700" fill="#0369a1" font-family="ui-monospace,monospace">Cibinong-02 · 38 Wrg</text>

    <rect x="74" y="294" width="116" height="22" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1" />
    <text x="132" y="308" text-anchor="middle" font-size="8.8" font-weight="700" fill="#047857" font-family="ui-monospace,monospace">Sawangan-04 · 28 Wrg</text>

    <rect x="72" y="64" width="106" height="22" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1" />
    <text x="125" y="78" text-anchor="middle" font-size="8.8" font-weight="700" fill="#475569" font-family="ui-monospace,monospace">Cinere-06 · 24 Wrg</text>

    <!-- Bottom-Right Legend Box -->
    <rect x="618" y="324" width="208" height="62" rx="4" fill="#ffffff" stroke="#d6cfc7" stroke-width="1" />
    <text x="628" y="339" font-size="9" font-weight="700" fill="#1c1917" font-family="system-ui,sans-serif">LEGENDA KORIDOR MILK-RUN</text>
    <line x1="628" y1="351" x2="648" y2="351" stroke="#c2410c" stroke-width="3" />
    <text x="654" y="354" font-size="8.8" fill="#44403c" font-family="system-ui,sans-serif">Depok-03 Aktif (38,4 km · 36 warung)</text>
    <line x1="628" y1="366" x2="648" y2="366" stroke="#0369a1" stroke-width="2" stroke-dasharray="4,3" />
    <text x="654" y="369" font-size="8.8" fill="#44403c" font-family="system-ui,sans-serif">Rute Pendamping (Cibinong/Sawangan)</text>
    <circle cx="638" cy="378" r="4" fill="#c2410c" />
    <text x="654" y="381" font-size="8.8" fill="#44403c" font-family="system-ui,sans-serif">Geofence Radius 50m (Bukti Foto POD)</text>
  </svg>`;
}

function renderPage4() {
  const dpk03 = ROUTES[0];
  const totalWeight = ROUTES.reduce((a, r) => a + r.weightKg, 0);
  const totalDist = ROUTES.reduce((a, r) => a + r.distKm, 0);

  const topKpis = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi e-kpi-accent-top">
      <div class="e-kpi-top"><span>Rute Terpilih (Besok 09:00)</span>${badge('Siap Muat', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Depok-03</span><span class="mono" style="font-size:10.5px;color:#9a3412;">B 9421 TXU</span></div>
      <div class="e-kpi-foot"><span>36 warung · 192 krt · Supir A. Kurniawan</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Tonase 6 Truk</span>${badge('20,2 Ton', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(totalWeight)} kg</span><span class="mono" style="font-size:10px;color:#57534e;">/ 24.000 kg</span></div>
      <div class="e-kpi-foot"><span>Rata-rata utilisasi muat ${fmtPct(AVG_CAP_PCT)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Jarak Milk-Run</span>${badge('-21,4% BBM', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${totalDist.toFixed(1).replace('.', ',')} km</span><span class="mono" style="font-size:10px;color:#047857;">Optimal</span></div>
      <div class="e-kpi-foot"><span>Dibanding rute kunjungan sales manual</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Target Pungutan Depok-03</span>${badge('QRIS + COD', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Rp 21,54 jt</span><span class="mono" style="font-size:10px;color:#0369a1;">28 Faktur</span></div>
      <div class="e-kpi-foot"><span>Termasuk #INV-1113 Toko Sumber Rejeki</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>SLA Ketepatan Slot H+1</span>${badge('Target >=95%', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">97,4%</span><span class="mono" style="font-size:10px;color:#047857;">+1,8% MoM</span></div>
      <div class="e-kpi-foot"><span>Verifikasi geofence 50m & foto rak POD</span></div>
    </div>
  </section>`;

  const mainGrid = `<section style="display:grid;grid-template-columns:1.28fr 1fr;gap:9px;flex:1;min-height:0;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="height:446px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${wIc('mapPin', 13, '#c2410c')}
            <span>Peta Koridor Milk-Run Depok–Cibinong–Sawangan (Simulasi VRP Besok 09:00 WIB)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Depok-03 Aktif: 38,4 km', 'accent')}
            ${badge('Geofence 50m', 'ok')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;">
          ${renderMilkRunMapSvg()}
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${wIc('truck', 13, '#c2410c')}
            <span>Keseimbangan Muatan, Tonase (Kg) & Kubikasi (CBM) Armada</span>
          </div>
          <span class="e-panel-sub mono">Batas Truk Engkel Box: 4.000 kg · 14,5 CBM</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.3px;">
            <thead>
              <tr>
                <th style="width:15%;">Rute</th>
                <th style="width:15%;">No. Pol</th>
                <th class="num" style="width:12%;">Jarak</th>
                <th class="num" style="width:14%;">Tonase</th>
                <th class="num" style="width:12%;">Kubikasi</th>
                <th style="width:18%;">Utilisasi Muat</th>
                <th style="width:14%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${ROUTES.map(
                (r, idx) => `<tr class="${idx === 0 ? 'is-selected' : r.tone === 'warn' ? 'is-warn' : ''}">
                  <td class="mono" style="padding:5.5px 7px;font-weight:700;color:${idx === 0 ? '#9a3412' : '#1c1917'};">${esc(r.code)}</td>
                  <td class="mono" style="padding:5.5px 7px;">${esc(r.truck)}</td>
                  <td class="num mono" style="padding:5.5px 7px;">${r.distKm.toFixed(1).replace('.', ',')} km</td>
                  <td class="num mono" style="padding:5.5px 7px;">${fmtNum(r.weightKg)} kg</td>
                  <td class="num mono" style="padding:5.5px 7px;">${r.cbm.toFixed(1).replace('.', ',')} m3</td>
                  <td style="padding:5.5px 7px;">${renderCapacityBar(r.capPct, { warnAt: 85, critAt: 93 })}</td>
                  <td style="padding:5.5px 7px;">${badge(r.status, r.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL 6 ARMADA ENGKEL BOX</td>
                <td class="num mono">${totalDist.toFixed(1).replace('.', ',')} km</td>
                <td class="num mono">${fmtNum(totalWeight)} kg</td>
                <td class="num mono">${ROUTES.reduce((a, r) => a + r.cbm, 0).toFixed(1).replace('.', ',')} m3</td>
                <td class="mono" style="text-align:right;font-size:9.8px;">Rata ${fmtPct(AVG_CAP_PCT)}</td>
                <td>${badge('5 OK · 1 Padat', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head" style="background:#fff3ed;border-bottom-color:#fdba74;">
          <div class="e-panel-title" style="color:#9a3412;">
            ${wIc('receipt', 13, '#c2410c')}
            <span>Manifest Urutan Kunjungan — Rute Depok-03 (B 9421 TXU)</span>
          </div>
          ${badge('36 Warung · 192 Krt', 'accent')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.3px;">
            <thead>
              <tr>
                <th style="width:9%;">Stop</th>
                <th style="width:12%;">ETA</th>
                <th style="width:27%;">Nama Warung</th>
                <th class="num" style="width:9%;">Krt</th>
                <th class="num" style="width:17%;">Nilai Netto</th>
                <th style="width:26%;">Tagih Tempo / Status</th>
              </tr>
            </thead>
            <tbody>
              ${DEPOK03_MANIFEST.map(
                (m) => `<tr class="${m.selected ? 'is-selected' : ''}">
                  <td class="mono" style="padding:5.5px 7px;font-weight:700;color:${m.selected ? '#9a3412' : '#57534e'};">#${esc(m.seq)}</td>
                  <td class="mono" style="padding:5.5px 7px;font-weight:${m.selected ? '700' : '500'};">${esc(m.eta)}</td>
                  <td style="padding:5.5px 7px;">
                    <div class="trunc" style="font-weight:${m.selected ? '700' : '600'};">${esc(m.warung)}</div>
                    <div style="font-size:9px;color:#78716c;">${esc(m.area)}</div>
                  </td>
                  <td class="num mono" style="padding:5.5px 7px;">${m.krt}</td>
                  <td class="num mono" style="padding:5.5px 7px;font-weight:700;">${fmtNum(m.netto)}</td>
                  <td style="padding:5.5px 7px;">
                    <div class="trunc mono" style="font-size:9.3px;color:${m.selected ? '#92400e' : '#44403c'};font-weight:${m.selected ? '700' : '500'};">${esc(m.collect)}</div>
                  </td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">TOTAL MANIFEST RUTE DEPOK-03 (${dpk03.warung} WARUNG)</td>
                <td class="num mono">${dpk03.karton}</td>
                <td class="num mono">${fmtNum(dpk03.netto)}</td>
                <td class="mono" style="font-size:9.6px;text-align:right;">Selesai ${dpk03.etaEnd} WIB</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#faf8f6;border-top:1px solid #e6e1db;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#57534e;">
            <span>Urutan muat truk (LIFO): Klaster 26 dimuat pertama, Stop #1–#3 paling dekat pintu belakang.</span>
            <span class="mono" style="font-weight:700;color:#047857;">Dock #2 Siap</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="height:178px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('checkCircle', 13, '#047857')}
            <span>Protokol Serah Terima Supir & Pungutan Lapangan (Depok-03)</span>
          </div>
          ${badge('Anti-Selisih Kas', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="border:1px solid #e6e1db;border-radius:3px;padding:7px 9px;background:#faf8f6;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-size:10.3px;font-weight:700;color:#1c1917;">Kontrol Bukti Pengiriman (e-POD)</div>
            <div style="font-size:9.8px;color:#57534e;line-height:1.45;">
              1. Validasi koordinat GPS radius <strong>&lt; 50 meter</strong> dari toko.<br/>
              2. Scan QR Surat Jalan & foto tumpukan karton di rak warung.<br/>
              3. Tanda tangan digital pemilik pada aplikasi supir offline.
            </div>
            <div class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">Sinkronisasi WMS otomatis setiap 15 menit</div>
          </div>
          <div style="border:1px solid #e6e1db;border-radius:3px;padding:7px 9px;background:#ffffff;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-size:10.3px;font-weight:700;color:#1c1917;">Batas Kas Tunai (COD) & QRIS Dinamis</div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:9.8px;color:#57534e;">
              <div style="display:flex;justify-content:space-between;"><span>Estimasi Tagih QRIS</span><strong class="mono" style="color:#047857;">Rp 13.420.000 (62%)</strong></div>
              <div style="display:flex;justify-content:space-between;"><span>Estimasi Kas COD Supir</span><strong class="mono" style="color:#b45309;">Rp 8.120.000 (38%)</strong></div>
              <div style="display:flex;justify-content:space-between;"><span>Plafon Asuransi Kas Mobil</span><strong class="mono">Rp 15.000.000</strong></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;border-top:1px solid #ece8e2;">
              <span style="font-size:9.5px;color:#57534e;">Status Risiko Kas:</span>
              ${badge('Aman (54% Plafon)', 'ok')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p4',
    crumbTitle: 'Peta Rute Milk-Run & Manifest Armada',
    crumbSub: 'Optimasi rute harian Depok-Bogor, urutan muat WMS LIFO & rekonsiliasi COD/QRIS lapangan',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 11)} Optimasi Ulang VRP</span>
      <span class="e-btn">${ic('download', 11)} Unduh Picking List WMS</span>
      <span class="e-btn e-btn-primary">${wIc('truck', 11, '#fff')} Kirim Manifest ke Supir</span>
    `,
    bodyHtml: `${topKpis}${mainGrid}`,
  });
}

// ============================================================================
// PAGE 5: TATA KELOLA DoA TEMPO 7H, REBATE PSAK 72 & CORETAX XML
// ============================================================================
function renderPage5() {
  const doaStepper = `<section class="e-panel" style="flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${ic('shield', 13, '#c2410c')}
        <span>Alur Otorisasi DoA Maker-Checker — Batch Kredit Tempo 7H & Klaim Rebate Principal (DOA-26-1147 · Total ${fmtIdr(DOA_SUM_AMT)})</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('SOP Kebijakan Kredit v4.2', 'neutral')}
        ${badge('Menunggu Tanda Tangan Tahap 3', 'warn')}
      </div>
    </div>
    <div class="e-panel-body" style="padding:8px 10px;">
      <div class="doa-stepper">
        <div class="doa-step done">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.5px;font-weight:700;color:#047857;">TAHAP 1 · MAKER</span>
            ${badge('Selesai 08:12', 'ok')}
          </div>
          <div style="font-size:11px;font-weight:700;color:#1c1917;">R. Santoso · Kepala Ops Sub-Dist</div>
          <div style="font-size:9.5px;color:#57534e;">Validasi histori belanja 12 minggu & kepatuhan tempo warung Depok-03.</div>
        </div>

        <div class="doa-step done">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.5px;font-weight:700;color:#047857;">TAHAP 2 · CHECKER</span>
            ${badge('Selesai 08:48', 'ok')}
          </div>
          <div style="font-size:11px;font-weight:700;color:#1c1917;">D. Wulandari · Analis Kredit AR</div>
          <div style="font-size:9.5px;color:#57534e;">Skor DSO 5,2 hr lolos ambang (&lt;7 hr); 1 pengajuan berisiko ditolak (DOA-1145).</div>
        </div>

        <div class="doa-step current">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.5px;font-weight:700;color:#9a3412;">TAHAP 3 · APPROVER</span>
            ${badge('Menunggu Aksi', 'accent')}
          </div>
          <div style="font-size:11px;font-weight:700;color:#1c1917;">H. Wijaya · Kepala Cabang Depo</div>
          <div style="font-size:9.5px;color:#57534e;">Otorisasi pagu limit s.d. Rp 10 jt & konfirmasi pemotongan faktur PSAK 72.</div>
        </div>

        <div class="doa-step pending">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-size:9.5px;font-weight:700;color:#64748b;">TAHAP 4 · ERP &amp; TAX</span>
            ${badge('Otomatis', 'neutral')}
          </div>
          <div style="font-size:11px;font-weight:700;color:#1c1917;">Posting GL + CoreTax XML v2.1</div>
          <div style="font-size:9.5px;color:#57534e;">Jurnal PSAK 72, unggah faktur DJP & kunci log WORM SHA-256 otomatis.</div>
        </div>
      </div>
    </div>
  </section>`;

  const xmlSnippet = `<span class="xc">&lt;!-- CoreTax DJP e-Faktur XML v2.1 · XSD Valid · #ORD-241104 --&gt;</span>
<span class="xt">&lt;TaxInvoiceBulk</span> <span class="xa">xmlns</span>=<span class="xv">"urn:djp:coretax:efaktur:2.1"</span><span class="xt">&gt;</span>
  <span class="xt">&lt;TIN&gt;</span>0134892014120000<span class="xt">&lt;/TIN&gt;</span> <span class="xc">&lt;!-- PT Sumber Makmur Distribusi --&gt;</span>
  <span class="xt">&lt;TaxInvoice&gt;</span>
    <span class="xt">&lt;TaxInvoiceDate&gt;</span>2026-11-22<span class="xt">&lt;/TaxInvoiceDate&gt;</span>
    <span class="xt">&lt;TrxCode&gt;</span>04<span class="xt">&lt;/TrxCode&gt;</span> <span class="xc">&lt;!-- DPP Nilai Lain / Umum GT --&gt;</span>
    <span class="xt">&lt;RefDesc&gt;</span>ORD-241104 / MILKRUN-DEPOK03<span class="xt">&lt;/RefDesc&gt;</span>
    <span class="xt">&lt;BuyerName&gt;</span>TOKO SUMBER REJEKI (H. MULYADI)<span class="xt">&lt;/BuyerName&gt;</span>
    <span class="xt">&lt;BuyerIdOpt&gt;</span>NIK<span class="xt">&lt;/BuyerIdOpt&gt;</span>
    <span class="xt">&lt;BuyerIdNumber&gt;</span>327602140578****<span class="xt">&lt;/BuyerIdNumber&gt;</span>
    <span class="xt">&lt;GoodServiceList&gt;</span>
      <span class="xt">&lt;Item</span> <span class="xa">sku</span>=<span class="xv">"GT-01"</span> <span class="xa">qty</span>=<span class="xv">"5"</span> <span class="xa">uom</span>=<span class="xv">"DUS"</span> <span class="xa">disc</span>=<span class="xv">"25000"</span><span class="xt">&gt;</span>955000<span class="xt">&lt;/Item&gt;</span>
      <span class="xt">&lt;Item</span> <span class="xa">sku</span>=<span class="xv">"GT-02"</span> <span class="xa">qty</span>=<span class="xv">"2"</span> <span class="xa">uom</span>=<span class="xv">"KRT"</span> <span class="xa">disc</span>=<span class="xv">"0"</span><span class="xt">&gt;</span>229000<span class="xt">&lt;/Item&gt;</span>
      <span class="xt">&lt;Item</span> <span class="xa">sku</span>=<span class="xv">"GT-03"</span> <span class="xa">qty</span>=<span class="xv">"1"</span> <span class="xa">uom</span>=<span class="xv">"DUS"</span> <span class="xa">disc</span>=<span class="xv">"8000"</span><span class="xt">&gt;</span>140000<span class="xt">&lt;/Item&gt;</span>
    <span class="xt">&lt;/GoodServiceList&gt;</span>
    <span class="xt">&lt;TaxBase&gt;</span>1324000<span class="xt">&lt;/TaxBase&gt;</span>       <span class="xc">&lt;!-- DPP Netto --&gt;</span>
    <span class="xt">&lt;VAT&gt;</span>145640<span class="xt">&lt;/VAT&gt;</span>                <span class="xc">&lt;!-- PPN 11% --&gt;</span>
    <span class="xt">&lt;GrandTotal&gt;</span>1469640<span class="xt">&lt;/GrandTotal&gt;</span>
  <span class="xt">&lt;/TaxInvoice&gt;</span>
<span class="xt">&lt;/TaxInvoiceBulk&gt;</span>`;

  const auditLogs = [
    { ts: '09:24:18', actor: 'SYSTEM · CoreTaxSvc', action: 'Validasi XSD e-Faktur #ORD-241104 (DPP Rp 1.324.000)', hash: 'sha256:9f82a4c1...e4b9' },
    { ts: '09:18:04', actor: 'BI-SNAP · QRIS Hook', action: 'Settlement 74 pelunasan tempo Rp 41.280.000 cocok 100%', hash: 'sha256:7d31c8b0...2a17' },
    { ts: '08:48:32', actor: 'D. Wulandari (AR)', action: 'Checker OK DOA-1147; tolak DOA-1145 (DSO 11,4 hr)', hash: 'sha256:4b19e0f4...8c52' },
    { ts: '08:31:09', actor: 'SQLite Edge Sync', action: 'Terima order offline WRG-DPK-014 (8 krt, -Rp 25rb)', hash: 'sha256:1a67d2e8...f903' },
    { ts: '08:12:45', actor: 'R. Santoso (Ops)', action: 'Ajukan batch DOA-26-1147 & kunci rute Depok-03', hash: 'sha256:6c04f1a2...3d71' },
    { ts: '07:55:12', actor: 'SAP FI · AutoPost', action: 'Posting jurnal PSAK 72 kontra-pendapatan Rp 1.620.000', hash: 'sha256:3e91b7d5...6f20' },
    { ts: '07:30:00', actor: 'WMS · Route Engine', action: 'Kunci slot milk-run 6 armada (186 warung · 942 krt)', hash: 'sha256:5a20c4e9...1b88' },
  ];

  const mainGrid = `<section style="display:grid;grid-template-columns:1.25fr 1fr;gap:9px;flex:1;min-height:0;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1.12;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('users', 13, '#c2410c')}
            <span>Antrean Persetujuan DoA · Kredit Tempo 7H & Klaim Rebate Principal</span>
          </div>
          ${badge('10 Dokumen · Rp 49,80 jt', 'accent')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.1px;">
            <thead>
              <tr>
                <th style="width:14%;">No. Dok</th>
                <th style="width:27%;">Entitas / Principal</th>
                <th style="width:19%;">Jenis Pengajuan</th>
                <th class="num" style="width:13%;">Nilai (Rp)</th>
                <th class="num" style="width:9%;">DSO</th>
                <th style="width:18%;">Status DoA</th>
              </tr>
            </thead>
            <tbody>
              ${DOA_QUEUE.map(
                (d) => `<tr class="${d.selected ? 'is-selected' : d.tone === 'bad' ? 'is-bad' : ''}">
                  <td class="mono" style="padding:4.2px 7px;font-weight:700;color:${d.selected ? '#9a3412' : '#1c1917'};">${esc(d.doc)}</td>
                  <td style="padding:4.2px 7px;font-weight:600;">${esc(d.entity)}</td>
                  <td style="padding:4.2px 7px;color:#57534e;">${esc(d.type)}</td>
                  <td class="num mono" style="padding:4.2px 7px;font-weight:700;">${fmtNum(d.amount)}</td>
                  <td class="num mono" style="padding:4.2px 7px;">${esc(d.dso)}</td>
                  <td style="padding:4.2px 7px;">${badge(d.stage, d.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">TOTAL NILAI ANTREAN OTORISASI DOA PERIODE 2026-P11</td>
                <td class="num mono">${fmtNum(DOA_SUM_AMT)}</td>
                <td colspan="2" class="mono" style="text-align:right;font-size:9.5px;">6 Lulus · 3 Menunggu · 1 Tolak</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="e-panel" style="flex:0.96;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${wIc('receipt', 13, '#047857')}
            <span>Jurnal Akuntansi Otomatis PSAK 72 & Settlement QRIS BI-SNAP (Depok-03)</span>
          </div>
          ${badge('Seimbang · Debit = Kredit', 'ok')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10px;">
            <thead>
              <tr>
                <th style="width:13%;">Kode GL</th>
                <th style="width:39%;">Nama Akun (COA Sub-Distributor)</th>
                <th style="width:16%;">Referensi</th>
                <th class="num" style="width:16%;">Debit (Rp)</th>
                <th class="num" style="width:16%;">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${GL_JOURNAL.map(
                (j) => `<tr>
                  <td class="mono" style="padding:3.8px 7px;font-weight:700;color:#44403c;">${esc(j.acc)}</td>
                  <td style="padding:3.8px 7px;">
                    <div class="trunc" style="font-weight:600;">${esc(j.name)}</div>
                    <div style="font-size:8.6px;color:#78716c;">${esc(j.note)}</div>
                  </td>
                  <td class="mono" style="padding:3.8px 7px;font-size:9.3px;color:#57534e;">${esc(j.ref)}</td>
                  <td class="num mono" style="padding:3.8px 7px;font-weight:${j.debit ? '700' : '400'};">${j.debit ? fmtNum(j.debit) : '—'}</td>
                  <td class="num mono" style="padding:3.8px 7px;font-weight:${j.kredit ? '700' : '400'};">${j.kredit ? fmtNum(j.kredit) : '—'}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">TOTAL JURNAL PSAK 72 + QRIS BI-SNAP (SELISIH = Rp 0)</td>
                <td class="num mono">${fmtNum(GL_SUM_DEBIT)}</td>
                <td class="num mono">${fmtNum(GL_SUM_KREDIT)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:5.5px 10px;background:#faf8f6;border-top:1px solid #e6e1db;font-size:9.6px;color:#57534e;display:flex;justify-content:space-between;">
            <span><strong>PSAK 72 Par. 50:</strong> Potongan promo principal diakui langsung sebagai kontra-pendapatan saat faktur terbit.</span>
            <span class="mono" style="color:#047857;font-weight:700;">Auto-Post SAP FI</span>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="height:392px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('code', 13, '#c2410c')}
            <span>Inspektor CoreTax XML (e-Faktur DJP v2.1) — #ORD-241104</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('XSD Schema OK', 'ok')}
            ${badge('NIK Tersamar', 'info')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div class="xml-box">${xmlSnippet}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9px;color:#78716c;font-weight:600;">DPP Netto (Pasca Promo)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#1c1917;">${fmtIdr(CORETAX_DPP)}</div>
            </div>
            <div style="background:#faf8f6;border:1px solid #e6e1db;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9px;color:#78716c;font-weight:600;">PPN Keluaran (11%)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#0369a1;">${fmtIdr(CORETAX_PPN)}</div>
            </div>
            <div style="background:#fff3ed;border:1px solid #fdba74;border-radius:3px;padding:5px 7px;">
              <div style="font-size:9px;color:#9a3412;font-weight:600;">Total Faktur CoreTax</div>
              <div class="mono" style="font-size:11.5px;font-weight:800;color:#c2410c;">${fmtIdr(CORETAX_TOTAL)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('lock', 13, '#1c1917')}
            <span>Jejak Audit Immutable (WORM SHA-256) & Rekonsiliasi BI-SNAP</span>
          </div>
          ${badge('Retensi 10 Thn', 'neutral')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:9.8px;">
            <thead>
              <tr>
                <th style="width:13%;">Waktu</th>
                <th style="width:22%;">Aktor / Layanan</th>
                <th style="width:44%;">Aktivitas Tercatat</th>
                <th style="width:21%;">WORM SHA-256</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs
                .map(
                  (a) => `<tr>
                    <td class="mono" style="padding:5px 7px;color:#57534e;">${esc(a.ts)}</td>
                    <td style="padding:5px 7px;font-weight:600;">${esc(a.actor)}</td>
                    <td class="trunc" style="padding:5px 7px;">${esc(a.action)}</td>
                    <td class="mono" style="padding:5px 7px;font-size:9.1px;color:#047857;">${esc(a.hash)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:6px 10px;background:#faf8f6;border-top:1px solid #e6e1db;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#57534e;">
            <span>Enkripsi PII Pembeli: <strong>UU PDP Ps. 4 · Masking NIK Otomatis</strong></span>
            <span class="mono" style="font-weight:700;color:#1c1917;">Merkle Root: 0x84f2...c19a</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeTab: 'p5',
    crumbTitle: 'Tata Kelola DoA Tempo 7H, Rebate PSAK 72 & CoreTax XML',
    crumbSub: 'Otorisasi berjenjang kredit warung, pengakuan rebate principal & ekspor e-Faktur DJP',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11)} Unduh CoreTax XML Batch</span>
      <span class="e-btn e-btn-danger">${ic('alert', 11)} Tolak Pengajuan</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Setujui DOA-26-1147 (Kacab)</span>
    `,
    bodyHtml: `${doaStepper}${mainGrid}`,
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
