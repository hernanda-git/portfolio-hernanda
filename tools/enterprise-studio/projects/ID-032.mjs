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
  id: 'ID-032',
  name: 'ColdGate 18',
  reference: 'SAP S/4HANA Fiori Horizon + DevExpress WPF Enterprise Suite',
  persona: 'Ir. Bambang Wibowo · VP National Cold-Chain Ops · PT Sukanda Cold-Chain Nusantara',
  pages: [
    { slug: 'p1', title: 'Kokpit Eksekutif & Peta KPI 18 Cabang' },
    { slug: 'p2', title: 'Grid Operasional 18 Cabang & Inspektor Pimpinan' },
    { slug: 'p3', title: 'Denah Gudang Dingin & Telemetri Sensor HACCP' },
    { slug: 'p4', title: 'Stock-Taking Per Batch, FEFO & Selisih Opname' },
    { slug: 'p5', title: 'Audit Kebersihan HACCP & Bukti Foto Lapangan' },
    { slug: 'p6', title: 'Berita Acara Pemusnahan & Matriks DoA Pusat' },
    { slug: 'p7', title: 'Jurnal PSAK 14, Valuasi Stok & Pajak CoreTax' },
    { slug: 'p8', title: 'Impor Excel EPPlus, WORM SHA-256 & Sync Cabang' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// Formula KPI Cabang:
//   stockPts = 100 - (100 - stockAcc) * 15
//   kpiScore = round1(0.40 * stockPts + 0.30 * hygiene + 0.30 * salesKpi)
// ============================================================================

const RAW_BRANCHES = [
  { code: 'BR-01', name: 'Surabaya Rungkut',       region: 'Jateng & Jatim',    head: 'Drs. Agung Prasetyo',   stockAcc: 99.80, hygiene: 96, salesKpi: 99.3, temp: -20.1, valM: 16.40, pallets: 3820, capPct: 86, varKg: 0,   varRp: 0,        baCount: 0, status: 'Rank #1',       tone: 'ok',   note: '0 selisih · Audit HACCP nihil temuan', x: 356, y: 214 },
  { code: 'BR-02', name: 'Jakarta Cibitung',       region: 'DKI & Jabar',       head: 'Ir. Ratna Dewi S.',     stockAcc: 99.60, hygiene: 94, salesKpi: 100.0,temp: -19.8, valM: 24.80, pallets: 5640, capPct: 91, varKg: 0,   varRp: 0,        baCount: 0, status: 'Rank #2',       tone: 'ok',   note: 'Volume tertinggi nasional · 0 selisih', x: 246, y: 202 },
  { code: 'BR-03', name: 'Semarang Tugu',          region: 'Jateng & Jatim',    head: 'Hendra Wijaya, MM',     stockAcc: 99.82, hygiene: 97, salesKpi: 91.3, temp: -20.3, valM: 10.20, pallets: 2340, capPct: 79, varKg: 11,  varRp: 1320000,  baCount: 0, status: 'Rank #3',       tone: 'ok',   note: 'Suhu blast freezer paling stabil',      x: 306, y: 208 },
  { code: 'BR-04', name: 'Bali Denpasar Cargo',    region: 'Bali & Sulawesi',   head: 'I Made Suardana',       stockAcc: 99.78, hygiene: 97, salesKpi: 90.8, temp: -19.9, valM: 11.60, pallets: 2680, capPct: 84, varKg: 15,  varRp: 1840000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Pasokan Horeca & hotel premium',        x: 400, y: 224 },
  { code: 'BR-05', name: 'Bandung Padalarang',     region: 'DKI & Jabar',       head: 'Dedi Kurniawan, ST',    stockAcc: 99.76, hygiene: 96, salesKpi: 90.7, temp: -20.0, valM: 12.40, pallets: 2890, capPct: 82, varKg: 19,  varRp: 2280000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'FEFO dairy 99,9% tepat waktu',          x: 264, y: 214 },
  { code: 'BR-06', name: 'Balikpapan Kariangau',   region: 'Kalimantan',        head: 'Rudi Hartono, SE',      stockAcc: 99.74, hygiene: 96, salesKpi: 89.8, temp: -20.2, valM: 8.40,  pallets: 1960, capPct: 76, varKg: 20,  varRp: 2420000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Hub distribusi IKN & Kaltim',           x: 422, y: 142 },
  { code: 'BR-07', name: 'Yogyakarta Sleman',      region: 'Jateng & Jatim',    head: 'Sri Wahyuni, SE',       stockAcc: 99.72, hygiene: 96, salesKpi: 88.5, temp: -19.7, valM: 7.20,  pallets: 1680, capPct: 74, varKg: 23,  varRp: 2650000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Kebersihan lantai & drainase unggul',   x: 312, y: 220 },
  { code: 'BR-08', name: 'Malang Singosari',       region: 'Jateng & Jatim',    head: 'Budi Santoso, ST',      stockAcc: 99.68, hygiene: 95, salesKpi: 88.4, temp: -19.6, valM: 6.80,  pallets: 1540, capPct: 71, varKg: 27,  varRp: 3120000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Rotasi es krim & dairy normal',         x: 362, y: 224 },
  { code: 'BR-09', name: 'Lampung Panjang',        region: 'Sumatera',          head: 'Fajar Nugroho, SE',     stockAcc: 99.64, hygiene: 95, salesKpi: 87.6, temp: -19.4, valM: 6.10,  pallets: 1410, capPct: 68, varKg: 31,  varRp: 3560000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Cross-docking Selat Sunda lancar',      x: 210, y: 188 },
  { code: 'BR-10', name: 'Banjarmasin L.Anggang',  region: 'Kalimantan',        head: 'M. Syahrul, ST',        stockAcc: 99.60, hygiene: 94, salesKpi: 87.0, temp: -19.5, valM: 5.90,  pallets: 1360, capPct: 72, varKg: 34,  varRp: 3890000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Stok beku musiman terkendali',          x: 396, y: 164 },
  { code: 'BR-11', name: 'Cirebon Plumbon',        region: 'DKI & Jabar',       head: 'Arief Rahman, SE',      stockAcc: 99.56, hygiene: 94, salesKpi: 85.5, temp: -19.2, valM: 5.40,  pallets: 1240, capPct: 69, varKg: 38,  varRp: 4320000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Impor Excel harian 100% valid',         x: 282, y: 206 },
  { code: 'BR-12', name: 'Samarinda Palaran',      region: 'Kalimantan',        head: 'Yusuf Hidayat, ST',     stockAcc: 99.50, hygiene: 93, salesKpi: 85.2, temp: -19.1, valM: 5.20,  pallets: 1190, capPct: 66, varKg: 42,  varRp: 4780000,  baCount: 0, status: 'Tercapai',      tone: 'ok',   note: 'Sensor PT100 baru terkalibrasi',        x: 428, y: 124 },
  { code: 'BR-13', name: 'Manado Bitung',          region: 'Bali & Sulawesi',   head: 'Robby Lengkong',        stockAcc: 99.42, hygiene: 92, salesKpi: 84.4, temp: -19.0, valM: 4.80,  pallets: 1120, capPct: 64, varKg: 48,  varRp: 5340000,  baCount: 0, status: 'Pantau',        tone: 'info', note: 'Lead-time kontainer reefer +1 hari',    x: 506, y: 102 },
  { code: 'BR-14', name: 'Makassar KIMA',          region: 'Bali & Sulawesi',   head: 'Hendra Kusuma, SE',     stockAcc: 98.80, hygiene: 88, salesKpi: 76.3, temp: -18.6, valM: 7.60,  pallets: 1780, capPct: 81, varKg: 240, varRp: 28800000, baCount: 1, status: 'Butuh BA',      tone: 'warn', note: 'Lot UHT 240 kg kedaluwarsa (#L902)',    x: 468, y: 184 },
  { code: 'BR-15', name: 'Palembang Alang-Alang',  region: 'Sumatera',          head: 'Taufik Ismail, SE',     stockAcc: 98.96, hygiene: 87, salesKpi: 72.5, temp: -18.8, valM: 4.50,  pallets: 1060, capPct: 73, varKg: 115, varRp: 12720000, baCount: 1, status: 'Butuh BA',      tone: 'warn', note: 'Butter 115 kg kemasan rusak (#L887)',   x: 196, y: 162 },
  { code: 'BR-16', name: 'Pekanbaru Tenayan',      region: 'Sumatera',          head: 'Rizal Effendi, ST',     stockAcc: 99.00, hygiene: 86, salesKpi: 70.6, temp: -18.7, valM: 4.10,  pallets: 950,  capPct: 67, varKg: 54,  varRp: 5980000,  baCount: 0, status: 'Pantau',        tone: 'info', note: 'Selisih opname minor seafood IQF',      x: 158, y: 120 },
  { code: 'BR-17', name: 'Medan Tanjung Morawa',   region: 'Sumatera',          head: 'Surya Darmawan, ST',    stockAcc: 98.60, hygiene: 78, salesKpi: 81.3, temp: -17.9, valM: 4.22,  pallets: 980,  capPct: 78, varKg: 62,  varRp: 6840000,  baCount: 0, status: 'Audit Terbuka', tone: 'bad',  note: 'Karet pintu chiller D-03 sobek',        x: 122, y: 76  },
  { code: 'BR-18', name: 'Pontianak Sungai Raya',  region: 'Kalimantan',        head: 'Andi Pratama, SE',      stockAcc: 98.58, hygiene: 78, salesKpi: 78.7, temp: -18.2, valM: 3.00,  pallets: 710,  capPct: 62, varKg: 46,  varRp: 4990000,  baCount: 0, status: 'Audit Terbuka', tone: 'bad',  note: 'Kondensasi evaporator EV-01 berlebih',  x: 332, y: 126 },
];

const BRANCHES = RAW_BRANCHES.map((b, idx) => {
  const stockPts = Number((100 - (100 - b.stockAcc) * 15).toFixed(2));
  const kpiScore = Number((0.40 * stockPts + 0.30 * b.hygiene + 0.30 * b.salesKpi).toFixed(1));
  return { ...b, rank: idx + 1, stockPts, kpiScore };
});

// Stock-taking batches (14 high-density batches across branches summing to total varKg = 825 kg & varRp = Rp 94.850.000)
const STOCK_BATCHES = [
  { batch: 'L902', sku: 'DRY-UHT-1000', product: 'Diamond UHT Full Cream 1L (12x1L)',    branch: 'BR-14 Makassar',   bin: 'QRT-01', sysKg: 240,  physKg: 0,    varKg: 240, varRp: 28800000, exp: '14 Nov 2026', fefo: 'Kedaluwarsa',  tone: 'bad',  cause: 'Retur modern trade telat',  ba: '#EXT-2026-114', selected: true },
  { batch: 'L887', sku: 'DRY-BTR-5000', product: 'Anchor Unsalted Butter Block 5kg',   branch: 'BR-15 Palembang',  bin: 'QRT-02', sysKg: 115,  physKg: 0,    varKg: 115, varRp: 12720000, exp: '29 Nov 2026', fefo: 'Hold BA',      tone: 'bad',  cause: 'Excursion +7,2 C truk',     ba: '#EXT-2026-115' },
  { batch: 'L941', sku: 'MET-SHP-2000', product: 'US Beef Shortplate Slice 2kg',       branch: 'BR-17 Medan',      bin: 'F2-B04', sysKg: 1420, physKg: 1358, varKg: 62,  varRp: 6840000,  exp: '18 Des 2026', fefo: '< 30 Hari',    tone: 'warn', cause: 'Susut thawing pintu D-03',  ba: '-' },
  { batch: 'L938', sku: 'SEA-DOR-1000', product: 'Fillet Dori Beku IQF Glaze 1kg',     branch: 'BR-16 Pekanbaru',  bin: 'F1-A09', sysKg: 1180, physKg: 1126, varKg: 54,  varRp: 5980000,  exp: '04 Des 2026', fefo: '< 14 Hari',    tone: 'warn', cause: 'Selisih berat glaze es',    ba: '-' },
  { batch: 'L934', sku: 'CHZ-MOZ-2000', product: 'Greenfields Mozzarella Block 2kg',   branch: 'BR-13 Manado',     bin: 'C1-A03', sysKg: 960,  physKg: 912,  varKg: 48,  varRp: 5340000,  exp: '11 Des 2026', fefo: '< 30 Hari',    tone: 'warn', cause: 'Karton basah bongkar port', ba: '-' },
  { batch: 'L929', sku: 'ICE-BLK-8000', product: 'Diamond Ice Cream Vanilla Bulk 8L',  branch: 'BR-18 Pontianak',  bin: 'BF-A02', sysKg: 890,  physKg: 844,  varKg: 46,  varRp: 4990000,  exp: '22 Jan 2027', fefo: '> 45 Hari',    tone: 'info', cause: 'Bunga es rusak segel tub',  ba: '-' },
  { batch: 'L925', sku: 'POT-FFR-2500', product: 'McCain Shoestring Fries 2,5kg',      branch: 'BR-12 Samarinda',  bin: 'F3-C07', sysKg: 2140, physKg: 2098, varKg: 42,  varRp: 4780000,  exp: '19 Feb 2027', fefo: '> 45 Hari',    tone: 'neutral', cause: 'Salah scan barcode shift', ba: '-' },
  { batch: 'L922', sku: 'DRY-WHP-1000', product: 'Elle & Vire Whipping Cream 1L',      branch: 'BR-11 Cirebon',    bin: 'C2-B01', sysKg: 780,  physKg: 742,  varKg: 38,  varRp: 4320000,  exp: '03 Des 2026', fefo: '< 14 Hari',    tone: 'warn', cause: 'Kemas bocor forklift',      ba: '-' },
  { batch: 'L918', sku: 'MET-CHK-2000', product: 'Boneless Chicken Leg IQF 2kg',       branch: 'BR-10 Banjarmasin',bin: 'F2-D05', sysKg: 1860, physKg: 1826, varKg: 34,  varRp: 3890000,  exp: '28 Jan 2027', fefo: '> 45 Hari',    tone: 'neutral', cause: 'Selisih timbang karung',   ba: '-' },
  { batch: 'L915', sku: 'SEA-SHR-1000', product: 'Peeled Vannamei Shrimp 31/40 1kg',   branch: 'BR-09 Lampung',    bin: 'F1-C02', sysKg: 1320, physKg: 1289, varKg: 31,  varRp: 3560000,  exp: '15 Feb 2027', fefo: '> 45 Hari',    tone: 'neutral', cause: 'Sampel QC tak terposting', ba: '-' },
  { batch: 'L911', sku: 'CHZ-CHD-2000', product: 'Kraft Cheddar Foodservice 2kg',      branch: 'BR-08 Malang',     bin: 'C1-B06', sysKg: 1640, physKg: 1613, varKg: 27,  varRp: 3120000,  exp: '09 Mar 2027', fefo: '> 45 Hari',    tone: 'neutral', cause: 'Salah input retur toko',   ba: '-' },
  { batch: 'L908', sku: 'DRY-YGT-1000', product: 'Biokul Greek Yogurt Plain 1kg',      branch: 'BR-07 Yogyakarta', bin: 'C2-A04', sysKg: 910,  physKg: 887,  varKg: 23,  varRp: 2650000,  exp: '02 Des 2026', fefo: '< 14 Hari',    tone: 'warn', cause: 'Pecah saat picking Horeca', ba: '-' },
  { batch: 'L905', sku: 'POT-WDG-2000', product: 'Lamb Weston Seasoned Wedges 2kg',    branch: 'BR-06 Balikpapan', bin: 'F3-A01', sysKg: 1520, physKg: 1500, varKg: 20,  varRp: 2420000,  exp: '14 Apr 2027', fefo: '> 45 Hari',    tone: 'neutral', cause: 'Karton penyok racking',    ba: '-' },
  { batch: 'L901', sku: 'DRY-MLK-1000', product: 'Fresh Milk Pasteurized 1L Barista',  branch: 'BR-05/04/03 Gab.', bin: 'C1-A01', sysKg: 4280, physKg: 4235, varKg: 45,  varRp: 5440000,  exp: '05 Des 2026', fefo: '< 14 Hari',    tone: 'ok',   cause: 'Selisih minor 3 cabang',    ba: '-' },
];

// Category valuation breakdown (sums to Rp 148,62 M = 148.620.000.000)
const CATEGORY_VALUATION = [
  { code: 'CAT-01', name: 'Dairy, UHT & Fresh Milk',   skus: 148, tons: 1842, valM: 42.80, sharePct: 28.8, tempBand: '+2 s.d. +4 C', shrinkPct: 0.38 },
  { code: 'CAT-02', name: 'Keju, Butter & Cream',      skus: 96,  tons: 1120, valM: 34.50, sharePct: 23.2, tempBand: '+1 s.d. +4 C', shrinkPct: 0.24 },
  { code: 'CAT-03', name: 'Daging Sapi & Unggas Beku', skus: 112, tons: 1490, valM: 31.20, sharePct: 21.0, tempBand: '-20 s.d. -18 C', shrinkPct: 0.21 },
  { code: 'CAT-04', name: 'Seafood & Fillet IQF',      skus: 84,  tons: 780,  valM: 18.42, sharePct: 12.4, tempBand: '-22 s.d. -18 C', shrinkPct: 0.31 },
  { code: 'CAT-05', name: 'Es Krim & Gelato Bulk',     skus: 64,  tons: 620,  valM: 12.60, sharePct: 8.5,  tempBand: '-25 s.d. -22 C', shrinkPct: 0.19 },
  { code: 'CAT-06', name: 'Kentang & Sayuran Beku',    skus: 52,  tons: 940,  valM: 9.10,  sharePct: 6.1,  tempBand: '-18 s.d. -16 C', shrinkPct: 0.14 },
];

// BA Pemusnahan Queue (Q4 2026: 2 Active Pending + 5 Completed)
const BA_RECORDS = [
  { no: 'EXT-2026-114', date: '19 Nov 2026', branch: 'BR-14 Makassar KIMA',     sku: 'Diamond UHT 1L (#L902)',       kg: 240, hpp: 28800000, witness: 'QA + Finance',      stage: 'Teken Dir Ops',     sla: '6 jam tersisa',  tone: 'warn', active: true, selected: true },
  { no: 'EXT-2026-115', date: '20 Nov 2026', branch: 'BR-15 Palembang',         sku: 'Anchor Butter 5kg (#L887)',    kg: 115, hpp: 12720000, witness: 'QA Regional',       stage: 'Verifikasi Finance',sla: '14 jam tersisa', tone: 'warn', active: true },
  { no: 'EXT-2026-113', date: '08 Nov 2026', branch: 'BR-17 Medan Tj.Morawa',   sku: 'Whipped Cream 1L (#L841)',     kg: 88,  hpp: 9680000,  witness: 'QA + Fin + KLHK',   stage: 'Selesai Dimusnahkan',sla: 'Tuntas 18 jam', tone: 'ok',   active: false },
  { no: 'EXT-2026-112', date: '02 Nov 2026', branch: 'BR-18 Pontianak',         sku: 'Yogurt Plain 1kg (#L819)',     kg: 74,  hpp: 7400000,  witness: 'QA + Fin + KLHK',   stage: 'Selesai Dimusnahkan',sla: 'Tuntas 22 jam', tone: 'ok',   active: false },
  { no: 'EXT-2026-111', date: '26 Okt 2026', branch: 'BR-13 Manado Bitung',     sku: 'Fillet Dori IQF (#L798)',      kg: 142, hpp: 14910000, witness: 'QA + Fin + KLHK',   stage: 'Selesai Dimusnahkan',sla: 'Tuntas 29 jam', tone: 'ok',   active: false },
  { no: 'EXT-2026-110', date: '19 Okt 2026', branch: 'BR-11 Cirebon Plumbon',   sku: 'Fresh Milk 1L (#L762)',        kg: 65,  hpp: 6175000,  witness: 'QA + Fin + KLHK',   stage: 'Selesai Dimusnahkan',sla: 'Tuntas 15 jam', tone: 'ok',   active: false },
  { no: 'EXT-2026-109', date: '11 Okt 2026', branch: 'BR-09 Lampung Panjang',   sku: 'Mozzarella 2kg (#L734)',       kg: 92,  hpp: 11040000, witness: 'QA + Fin + KLHK',   stage: 'Selesai Dimusnahkan',sla: 'Tuntas 20 jam', tone: 'ok',   active: false },
];

// Double-entry PSAK 14 Accounting Journal for November 2026 Stock-Taking & BA Pemusnahan
// Balanced: Total Debit === Total Kredit === Rp 99.417.200
// Breakdown:
//   BA Pemusnahan HPP (Rp 41.520.000) + PPN Masukan Koreksi 11% (Rp 4.567.200)
//   Selisih Opname Non-BA (Rp 94.850.000 - Rp 41.520.000 = Rp 53.330.000)
const PSAK_JOURNAL = [
  { line: '01', acct: '5104-02', name: 'Beban Pemusnahan Stok Kadaluwarsa (BR-14 #EXT-114)', cc: 'CC-MKS-14', ref: 'BA-114',  debit: 28800000, credit: 0 },
  { line: '02', acct: '5104-02', name: 'Beban Pemusnahan Stok Rusak Suhu (BR-15 #EXT-115)',  cc: 'CC-PLM-15', ref: 'BA-115',  debit: 12720000, credit: 0 },
  { line: '03', acct: '5104-05', name: 'Beban Selisih Opname Stok Beku (14 Cabang Lain)',    cc: 'CC-NAT-00', ref: 'OPN-11',  debit: 53330000, credit: 0 },
  { line: '04', acct: '5109-08', name: 'Beban Koreksi PPN Masukan Pemusnahan (PMK 81/2024)', cc: 'CC-TAX-HQ', ref: 'CTX-114', debit: 4567200,  credit: 0 },
  { line: '05', acct: '1105-01', name: 'Persediaan Barang Beku — Dairy & UHT (BR-14)',       cc: 'CC-MKS-14', ref: 'BA-114',  debit: 0, credit: 28800000 },
  { line: '06', acct: '1105-02', name: 'Persediaan Barang Beku — Keju & Butter (BR-15)',     cc: 'CC-PLM-15', ref: 'BA-115',  debit: 0, credit: 12720000 },
  { line: '07', acct: '1105-09', name: 'Cadangan Penurunan Nilai Persediaan (PSAK 14)',      cc: 'CC-NAT-00', ref: 'OPN-11',  debit: 0, credit: 32450000 },
  { line: '08', acct: '1105-03', name: 'Persediaan Barang Beku — Daging, Seafood & Lainnya', cc: 'CC-NAT-00', ref: 'OPN-11',  debit: 0, credit: 20880000 },
  { line: '09', acct: '2108-03', name: 'Utang Koreksi PPN Masukan CoreTax (e-Faktur)',       cc: 'CC-TAX-HQ', ref: 'CTX-114', debit: 0, credit: 4567200 },
];

// Computed National Aggregates
const AVG_STOCK_ACC = BRANCHES.reduce((a, b) => a + b.stockAcc, 0) / BRANCHES.length;
const AVG_HYGIENE = BRANCHES.reduce((a, b) => a + b.hygiene, 0) / BRANCHES.length;
const AVG_KPI = BRANCHES.reduce((a, b) => a + b.kpiScore, 0) / BRANCHES.length;
const TOTAL_VAL_M = Number(BRANCHES.reduce((a, b) => a + b.valM, 0).toFixed(2));
const TOTAL_PALLETS = BRANCHES.reduce((a, b) => a + b.pallets, 0);
const TOTAL_VAR_KG = BRANCHES.reduce((a, b) => a + b.varKg, 0);
const TOTAL_VAR_RP = BRANCHES.reduce((a, b) => a + b.varRp, 0);
const ACTIVE_BA = BA_RECORDS.filter((r) => r.active);
const ACTIVE_BA_COUNT = ACTIVE_BA.length;
const ACTIVE_BA_KG = ACTIVE_BA.reduce((a, r) => a + r.kg, 0);
const ACTIVE_BA_HPP = ACTIVE_BA.reduce((a, r) => a + r.hpp, 0);
const ACTIVE_BA_PPN = Math.round(ACTIVE_BA_HPP * 0.11);

export function verifyMath() {
  if (BRANCHES.length !== 18) throw new Error(`Expected 18 branches, got ${BRANCHES.length}`);
  if (AVG_STOCK_ACC.toFixed(2) !== '99.42') {
    throw new Error(`Stock accuracy mismatch: ${AVG_STOCK_ACC.toFixed(4)} !== 99.42`);
  }
  if (AVG_HYGIENE.toFixed(1) !== '91.8') {
    throw new Error(`Hygiene average mismatch: ${AVG_HYGIENE.toFixed(3)} !== 91.8`);
  }
  if (ACTIVE_BA_COUNT !== 2) {
    throw new Error(`Active BA count mismatch: ${ACTIVE_BA_COUNT} !== 2`);
  }
  // Verify spec anchor KPI scores
  if (BRANCHES[0].kpiScore !== 97.4) throw new Error(`BR-01 score mismatch: ${BRANCHES[0].kpiScore}`);
  if (BRANCHES[1].kpiScore !== 95.8) throw new Error(`BR-02 score mismatch: ${BRANCHES[1].kpiScore}`);
  if (BRANCHES[13].kpiScore !== 82.1) throw new Error(`BR-14 score mismatch: ${BRANCHES[13].kpiScore}`);
  if (BRANCHES[16].kpiScore !== 79.4) throw new Error(`BR-17 score mismatch: ${BRANCHES[16].kpiScore}`);

  // Verify strict descending rank order
  for (let i = 1; i < BRANCHES.length; i++) {
    if (BRANCHES[i].kpiScore > BRANCHES[i - 1].kpiScore) {
      throw new Error(`Rank order broken at ${BRANCHES[i].code}: ${BRANCHES[i].kpiScore} > ${BRANCHES[i - 1].kpiScore}`);
    }
  }

  // Verify Stock-Taking batch totals match 18-branch variance totals
  const batchVarKg = STOCK_BATCHES.reduce((a, r) => a + r.varKg, 0);
  const batchVarRp = STOCK_BATCHES.reduce((a, r) => a + r.varRp, 0);
  if (batchVarKg !== TOTAL_VAR_KG) {
    throw new Error(`Batch varKg=${batchVarKg} !== Branch TOTAL_VAR_KG=${TOTAL_VAR_KG}`);
  }
  if (batchVarRp !== TOTAL_VAR_RP) {
    throw new Error(`Batch varRp=${batchVarRp} !== Branch TOTAL_VAR_RP=${TOTAL_VAR_RP}`);
  }

  // Verify Category Valuation matches 18-branch total inventory value
  const catValM = Number(CATEGORY_VALUATION.reduce((a, c) => a + c.valM, 0).toFixed(2));
  if (catValM !== TOTAL_VAL_M) {
    throw new Error(`Category valM=${catValM} !== TOTAL_VAL_M=${TOTAL_VAL_M}`);
  }

  // Verify PSAK 14 Journal balanced & matches variance + PPN
  const sumDebit = PSAK_JOURNAL.reduce((a, j) => a + j.debit, 0);
  const sumCredit = PSAK_JOURNAL.reduce((a, j) => a + j.credit, 0);
  if (sumDebit !== sumCredit) {
    throw new Error(`PSAK 14 unbalanced: debit=${sumDebit} !== credit=${sumCredit}`);
  }
  if (sumDebit !== TOTAL_VAR_RP + ACTIVE_BA_PPN) {
    throw new Error(`PSAK 14 total=${sumDebit} !== varRp+PPN=${TOTAL_VAR_RP + ACTIVE_BA_PPN}`);
  }
}

// ============================================================================
// BESPOKE SAP FIORI HORIZON + DEVEXPRESS WPF SHELL CHROME
// Distinct from ID-001: Deep Maritime-Ice Top Entity Bar + Horizontal WPF
// Module Ribbon (no dark left sidebar!) maximizing 1600px grid/blueprint width.
// ============================================================================

const NAV_TABS = [
  { slug: 'p1', label: 'Kokpit',           icon: 'activity',   cnt: '18' },
  { slug: 'p2', label: 'Grid 18 Cabang',   icon: 'layers',     cnt: '18' },
  { slug: 'p3', label: 'Gudang HACCP',     icon: 'cpu',        cnt: '1 Alert', warn: true },
  { slug: 'p4', label: 'Stock-Taking',     icon: 'database',   cnt: '825 kg' },
  { slug: 'p5', label: 'Audit Kebersihan', icon: 'eye',        cnt: '2 Open',  warn: true },
  { slug: 'p6', label: 'BA & DoA',         icon: 'fileText',   cnt: '2 BA',    warn: true },
  { slug: 'p7', label: 'PSAK & CoreTax',   icon: 'shield',     cnt: 'NOV 26' },
  { slug: 'p8', label: 'EPPlus & Sync',    icon: 'server',     cnt: '18/18' },
];

const EXTRA_CSS = `
  /* ColdGate 18 — SAP S/4HANA Fiori Horizon + DevExpress WPF Shell */
  .cg-topbar {
    height: 36px;
    background: #0c4a6e;
    color: #f0f9ff;
    border-bottom: 1px solid #082f49;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .cg-tb-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .cg-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 12.5px;
    color: #ffffff;
    white-space: nowrap;
  }
  .cg-logo-box {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #0284c7;
    border: 1px solid #38bdf8;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cg-pill {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    background: #075985;
    border: 1px solid #0369a1;
    color: #e0f2fe;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .cg-pill-live {
    background: #064e3b;
    border-color: #059669;
    color: #a7f3d0;
    font-family: var(--e-mono);
    font-size: 9.8px;
  }
  .cg-ribbon {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border-strong);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .cg-tabs {
    display: flex;
    align-items: stretch;
    height: 34px;
    gap: 2px;
  }
  .cg-tab {
    padding: 0 7px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.3px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .cg-tab.is-active {
    color: #0369a1;
    background: #f0f9ff;
    border-bottom-color: #0369a1;
    font-weight: 700;
  }
  .cg-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #f1f5f9;
    color: #475569;
  }
  .cg-tab.is-active .cg-tab-cnt {
    background: #0369a1;
    color: #ffffff;
  }
  .cg-tab-cnt.is-warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .cg-tab.is-active .cg-tab-cnt.is-warn {
    background: #be123c;
    color: #ffffff;
    border-color: #be123c;
  }
  .cg-main {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background: #eef2f6;
  }
  .cg-grid {
    display: grid;
    gap: 8px;
    min-height: 0;
    min-width: 0;
  }
  .cg-kv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid #eef2f6;
    font-size: 10.5px;
    gap: 8px;
  }
  .cg-kv:last-child { border-bottom: 0; }
  .cg-kv-k { color: #64748b; }
  .cg-kv-v { font-weight: 600; color: #0f172a; text-align: right; }
  .cg-filter-bar {
    height: 30px;
    padding: 0 10px;
    background: #f8fafc;
    border-bottom: 1px solid var(--e-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .cg-chip {
    height: 20px;
    padding: 0 7px;
    border-radius: 3px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .cg-chip.is-on {
    background: #e0f2fe;
    border-color: #0369a1;
    color: #075985;
  }
  .cg-code-box {
    background: #0f172a;
    color: #e2e8f0;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.45;
    padding: 8px 10px;
    border-radius: 3px;
    border: 1px solid #334155;
    white-space: pre;
    overflow: hidden;
  }
  .cg-stepper {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    flex-shrink: 0;
  }
  .cg-step {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cg-step.done {
    border-left: 3px solid #047857;
    background: #f7fdf9;
  }
  .cg-step.curr {
    border: 1.5px solid #0369a1;
    border-left: 4px solid #0369a1;
    background: #f0f9ff;
  }
  .cg-step.wait {
    border-left: 3px solid #94a3b8;
    background: #f8fafc;
  }
  table.e-table.compact th { padding: 4px 6px; font-size: 9.5px; }
  table.e-table.compact td { padding: 3.4px 6px; font-size: 10.3px; }
  table.e-table.compact tfoot td { padding: 4.5px 6px; font-size: 10.3px; }
  .temp-ok { color: #0369a1; font-weight: 700; }
  .temp-warn { color: #b45309; font-weight: 700; }
  .temp-bad { color: #be123c; font-weight: 700; }
`;

function renderShell({ activeSlug, title, actionsHtml = '', bodyHtml }) {
  const tabsHtml = NAV_TABS.map((t) => {
    const active = t.slug === activeSlug;
    return `<div class="cg-tab ${active ? 'is-active' : ''}">
      ${ic(t.icon, 12, active ? '#0369a1' : '#64748b')}
      <span>${esc(t.label)}</span>
      <span class="cg-tab-cnt ${t.warn ? 'is-warn' : ''}">${esc(t.cnt)}</span>
    </div>`;
  }).join('');

  const html = `
    <header class="cg-topbar">
      <div class="cg-tb-group">
        <div class="cg-logo">
          <span class="cg-logo-box">C18</span>
          <span>ColdGate 18</span>
          <span style="font-size:10px;font-weight:500;color:#bae6fd;border-left:1px solid #0369a1;padding-left:7px;">Desktop ERP Cold-Chain · .NET 8 WPF</span>
        </div>
        <div class="cg-pill">
          ${ic('layers', 11, '#7dd3fc')}
          <span>PT Sukanda Cold-Chain Nusantara (18 Cabang)</span>
          ${ic('chevronDown', 10, '#bae6fd')}
        </div>
        <div class="cg-pill">
          ${ic('clock', 11, '#7dd3fc')}
          <span class="mono">PERIODE NOV 2026 · TUTUP BUKU 30 NOV</span>
        </div>
      </div>
      <div class="cg-tb-group">
        <div class="cg-pill cg-pill-live">
          <span class="dot dot-ok"></span>
          <span>SQL-HQ-JKT01 · 18/18 ONLINE · 14 ms</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;padding-left:8px;border-left:1px solid #0369a1;">
          <span style="width:22px;height:22px;border-radius:3px;background:#0369a1;border:1px solid #38bdf8;color:#fff;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">BW</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.3px;font-weight:700;color:#ffffff;">Ir. Bambang Wibowo</div>
            <div style="font-size:8.8px;color:#bae6fd;">VP National Cold-Chain Ops</div>
          </div>
        </div>
      </div>
    </header>
    <nav class="cg-ribbon">
      <div class="cg-tabs">${tabsHtml}</div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        ${actionsHtml}
      </div>
    </nav>
    <main class="cg-main">${bodyHtml}</main>
    ${renderStatusFooter({
      leftItems: [
        '<span class="dot dot-ok"></span> Dapper Pool: 18/24 aktif',
        'SQL Server 2022 · ColdGate_National_Prod',
        'EPPlus Engine v7.4 · DevExpress Grid v24.1',
      ],
      rightItems: [
        'HACCP Sensor Sync: 22 Nov 2026 21:14 WIB',
        'WORM Head: sha256:8f4c...d29a',
        'Lisensi: Enterprise 18-Cabang',
      ],
    })}
  `;

  return wrapEnterpriseHtml({
    title: `ColdGate 18 — ${title}`,
    accent: '#0369a1',
    accentSoft: '#e0f2fe',
    accentInk: '#075985',
    bg: '#eef2f6',
    surface: '#ffffff',
    surface2: '#f5f8fb',
    border: '#cbd5e1',
    borderStrong: '#94a3b8',
    extraCss: EXTRA_CSS,
    bodyHtml: html,
  });
}

function renderKpiCard({ label, value, sub, tone = 'neutral', delta = '', spark = null, sparkColor = '#0369a1' }) {
  const toneColor =
    tone === 'ok' ? '#047857' : tone === 'warn' ? '#b45309' : tone === 'bad' ? '#be123c' : '#0369a1';
  return `<div class="e-kpi" style="border-top:2px solid ${toneColor};">
    <div class="e-kpi-top">
      <span class="trunc">${esc(label)}</span>
      ${delta ? badge(delta, tone) : ''}
    </div>
    <div class="e-kpi-mid">
      <span class="e-kpi-val">${esc(value)}</span>
      ${spark ? svgSparkline({ points: spark, width: 62, height: 18, color: sparkColor }) : ''}
    </div>
    <div class="e-kpi-foot">
      <span class="trunc">${esc(sub)}</span>
    </div>
  </div>`;
}

// ============================================================================
// CUSTOM SVG: ARCHIPELAGO COLD-CHAIN CORRIDOR MAP (P1)
// ============================================================================
function svgArchipelagoMap() {
  // Stylized crisp technical vector map of Indonesia islands + 18 depot nodes + reefer corridors
  const corridors = [
    ['BR-02', 'BR-01'], ['BR-02', 'BR-09'], ['BR-09', 'BR-15'], ['BR-15', 'BR-17'],
    ['BR-01', 'BR-04'], ['BR-01', 'BR-06'], ['BR-01', 'BR-14'], ['BR-06', 'BR-12'],
    ['BR-14', 'BR-13'], ['BR-02', 'BR-18'], ['BR-01', 'BR-10'],
  ];
  const byCode = Object.fromEntries(BRANCHES.map((b) => [b.code, b]));

  const linesSvg = corridors.map(([a, b]) => {
    const ba = byCode[a], bb = byCode[b];
    return `<line x1="${ba.x}" y1="${ba.y}" x2="${bb.x}" y2="${bb.y}" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="3,2.5" opacity="0.55" />`;
  }).join('');

  const nodesSvg = BRANCHES.map((b) => {
    const fill = b.tone === 'bad' ? '#be123c' : b.tone === 'warn' ? '#d97706' : b.tone === 'info' ? '#0284c7' : '#047857';
    const r = b.code === 'BR-01' || b.code === 'BR-02' ? 5.2 : b.tone === 'bad' || b.tone === 'warn' ? 4.8 : 3.7;
    const ring = b.tone === 'bad' || b.tone === 'warn'
      ? `<circle cx="${b.x}" cy="${b.y}" r="${r + 3.5}" fill="none" stroke="${fill}" stroke-width="1.2" opacity="0.55" />`
      : '';
    return `${ring}<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="${fill}" stroke="#ffffff" stroke-width="1.3" />`;
  }).join('');

  const callouts = [
    { x: 122, y: 76,  dx: 9,   dy: -8,  txt: 'BR-17 Medan (79,4)', c: '#be123c' },
    { x: 246, y: 202, dx: -70, dy: -11, txt: 'BR-02 Cibitung (#2)', c: '#075985' },
    { x: 356, y: 214, dx: 6,   dy: 22,  txt: 'BR-01 SBY (#1)',     c: '#047857' },
    { x: 422, y: 142, dx: 9,   dy: 4,   txt: 'BR-06 Balikpapan',   c: '#0f172a' },
    { x: 468, y: 184, dx: 9,   dy: 12,  txt: 'BR-14 MKS (BA #114)', c: '#b45309' },
    { x: 506, y: 102, dx: -26, dy: -12, txt: 'BR-13 Manado',       c: '#0f172a' },
    { x: 332, y: 126, dx: -56, dy: -11, txt: 'BR-18 Pontianak',    c: '#be123c' },
  ].map((c) => `
    <text x="${c.x + c.dx}" y="${c.y + c.dy}" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${c.c}">${esc(c.txt)}</text>
  `).join('');

  return `<svg viewBox="0 0 600 250" width="100%" height="236" style="display:block;background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;">
    <!-- Lat/Lon technical grid -->
    <g stroke="#cfe8f7" stroke-width="0.8">
      <line x1="0" y1="62" x2="600" y2="62" />
      <line x1="0" y1="125" x2="600" y2="125" stroke-dasharray="4,3" />
      <line x1="0" y1="188" x2="600" y2="188" />
      <line x1="120" y1="0" x2="120" y2="250" />
      <line x1="240" y1="0" x2="240" y2="250" />
      <line x1="360" y1="0" x2="360" y2="250" />
      <line x1="480" y1="0" x2="480" y2="250" />
    </g>
    <text x="8" y="121" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#64748b">0° KHATULISTIWA</text>
    <!-- Simplified Indonesian Archipelago Silhouettes -->
    <g fill="#dbeafe" stroke="#93c5fd" stroke-width="1.2">
      <!-- Sumatera -->
      <path d="M88,48 L128,62 L166,108 L194,140 L218,176 L210,194 L182,174 L148,136 L112,92 Z" />
      <!-- Jawa -->
      <path d="M224,196 L278,198 L334,204 L384,214 L380,227 L324,224 L268,218 L224,210 Z" />
      <!-- Bali & Nusa Tenggara -->
      <path d="M392,217 L414,220 L412,230 L392,228 Z" />
      <path d="M420,222 L454,225 L452,233 L420,231 Z" />
      <!-- Kalimantan -->
      <path d="M322,118 L368,84 L424,96 L444,128 L430,164 L394,174 L350,166 L320,144 Z" />
      <!-- Sulawesi -->
      <path d="M460,118 L484,116 L516,96 L524,106 L488,128 L494,154 L476,192 L462,190 L466,156 L456,144 Z" />
      <!-- Maluku & Papua (far right context) -->
      <path d="M542,138 L586,146 L594,178 L552,172 Z" opacity="0.65" />
    </g>
    ${linesSvg}
    ${nodesSvg}
    ${callouts}
    <!-- Map Legend positioned cleanly top-right clear of islands -->
    <rect x="292" y="8" width="300" height="22" rx="2" fill="#ffffff" stroke="#cbd5e1" />
    <circle cx="304" cy="19" r="3.5" fill="#047857" /><text x="312" y="22" font-size="8.4" fill="#334155" font-weight="600">Tercapai (12)</text>
    <circle cx="386" cy="19" r="3.5" fill="#0284c7" /><text x="394" y="22" font-size="8.4" fill="#334155" font-weight="600">Pantau (2)</text>
    <circle cx="454" cy="19" r="3.5" fill="#d97706" /><text x="462" y="22" font-size="8.4" fill="#334155" font-weight="600">Butuh BA (2)</text>
    <circle cx="530" cy="19" r="3.5" fill="#be123c" /><text x="538" y="22" font-size="8.4" fill="#334155" font-weight="600">Audit (2)</text>
  </svg>`;
}

// ============================================================================
// PAGE 1: KOKPIT EKSEKUTIF & PETA KPI 18 CABANG
// ============================================================================
function renderPage1() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    ${renderKpiCard({
      label: 'Akurasi Stok Nasional',
      value: fmtPct(AVG_STOCK_ACC, 2),
      sub: 'Target SLA >= 99,00% · 18 Cabang',
      tone: 'ok',
      delta: '+0,18%',
      spark: [99.04, 99.12, 99.18, 99.21, 99.29, 99.34, 99.42],
      sparkColor: '#047857',
    })}
    ${renderKpiCard({
      label: 'Skor Kebersihan HACCP',
      value: `${AVG_HYGIENE.toFixed(1).replace('.', ',')} / 100`,
      sub: '16/18 lulus >= 85 · 2 audit terbuka',
      tone: 'ok',
      delta: 'Lulus',
      spark: [88.4, 89.1, 89.8, 90.5, 91.0, 91.4, 91.8],
      sparkColor: '#0369a1',
    })}
    ${renderKpiCard({
      label: 'BA Pemusnahan Aktif',
      value: `${ACTIVE_BA_COUNT} batch`,
      sub: `${ACTIVE_BA_KG} kg · HPP ${fmtIdr(ACTIVE_BA_HPP)}`,
      tone: 'warn',
      delta: 'Menunggu HQ',
    })}
    ${renderKpiCard({
      label: 'Nilai Persediaan Beku',
      value: `Rp ${TOTAL_VAL_M.toFixed(2).replace('.', ',')} M`,
      sub: `${fmtNum(TOTAL_PALLETS)} pallet · 6 kategori SKU`,
      tone: 'info',
      delta: '556 SKU',
    })}
    ${renderKpiCard({
      label: 'Selisih Stock-Taking Nov',
      value: fmtIdr(TOTAL_VAR_RP),
      sub: `${fmtNum(TOTAL_VAR_KG)} kg (0,064% dari total stok)`,
      tone: 'warn',
      delta: '14 batch',
    })}
    ${renderKpiCard({
      label: 'Rata-rata KPI Pimpinan',
      value: `${AVG_KPI.toFixed(1).replace('.', ',')} pts`,
      sub: 'Top: Surabaya 97,4 · Min: Pontianak 78,5',
      tone: 'ok',
      delta: 'Tier A',
      spark: [87.2, 88.0, 88.6, 89.1, 89.8, 90.2, 90.6],
      sparkColor: '#0369a1',
    })}
  </div>`;

  const trendChart = svgMultiLineChart({
    width: 680,
    height: 236,
    xLabels: ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
    yMin: 75,
    yMax: 105,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)}`,
    threshold: { value: 90, label: 'Target KPI (90,0 pts)', color: '#0369a1' },
    series: [
      { label: 'Akurasi Stok (%)', color: '#047857', values: [98.9, 99.0, 99.1, 99.0, 99.2, 99.1, 99.2, 99.3, 99.2, 99.3, 99.3, 99.4], dots: true, area: true },
      { label: 'Skor Kebersihan', color: '#0369a1', values: [86.5, 87.2, 88.0, 87.8, 88.9, 89.4, 90.1, 90.6, 90.4, 91.1, 91.4, 91.8], dots: true },
      { label: 'KPI Pimpinan (pts)', color: '#d97706', values: [85.2, 86.0, 86.8, 86.4, 87.6, 88.2, 88.9, 89.3, 89.0, 89.8, 90.2, 89.9], dashed: true },
    ],
    annotations: [
      { index: 6, seriesIdx: 1, label: 'Jun: Audit HACCP -> 90,1', color: '#0369a1', dy: -36 },
    ],
  });

  // Regional summary from single source of truth
  const regions = ['DKI & Jabar', 'Jateng & Jatim', 'Bali & Sulawesi', 'Kalimantan', 'Sumatera'];
  const regStats = regions.map((r) => {
    const list = BRANCHES.filter((b) => b.region === r);
    const valM = list.reduce((a, b) => a + b.valM, 0);
    const avgKpi = list.reduce((a, b) => a + b.kpiScore, 0) / list.length;
    const avgHyg = list.reduce((a, b) => a + b.hygiene, 0) / list.length;
    const varRp = list.reduce((a, b) => a + b.varRp, 0);
    return { region: r, count: list.length, valM, avgKpi, avgHyg, varRp };
  });

  // Top 6 + Watchlist Bottom 6 = 12 rows for Executive Spotlight (fills bottom panel cleanly)
  const spotlight = [...BRANCHES.slice(0, 6), ...BRANCHES.slice(12)];
  const spotlightRows = spotlight.map((b) => {
    const trCls = b.tone === 'bad' ? 'is-bad' : b.tone === 'warn' ? 'is-warn' : '';
    const tempCls = b.temp > -18.3 ? 'temp-bad' : b.temp > -18.9 ? 'temp-warn' : 'temp-ok';
    return `<tr class="${trCls}">
      <td class="mono" style="font-weight:700;">#${b.rank}</td>
      <td class="mono" style="color:#075985;font-weight:700;">${esc(b.code)}</td>
      <td style="font-weight:600;">${esc(b.name)}</td>
      <td>${esc(b.head)}</td>
      <td class="num mono">${fmtPct(b.stockAcc, 2)}</td>
      <td class="num mono">${b.hygiene}</td>
      <td class="num mono ${tempCls}">${b.temp.toFixed(1).replace('.', ',')} °C</td>
      <td class="num mono" style="font-weight:700;">${b.kpiScore.toFixed(1).replace('.', ',')} pts</td>
      <td>${badge(b.status, b.tone)}</td>
      <td style="color:#475569;">${esc(b.note)}</td>
    </tr>`;
  }).join('');

  const regBarChart = svgStackedBarChart({
    width: 470,
    height: 156,
    categories: ['DKI/Jbr', 'Jtg/Jtm', 'Bali/Sul', 'Kalim.', 'Sumat.'],
    yFormat: (v) => `${Math.round(v)}M`,
    series: [
      { label: 'Frozen (-20 C)', color: '#0369a1', values: regStats.map((r) => Number((r.valM * 0.62).toFixed(1))) },
      { label: 'Chiller (+2 C)', color: '#38bdf8', values: regStats.map((r) => Number((r.valM * 0.38).toFixed(1))) },
    ],
  });

  const bodyHtml = `
    ${kpiStrip}
    <div class="cg-grid" style="grid-template-columns:1.15fr 1fr;height:282px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0369a1')} Tren Akurasi Stok, Kebersihan HACCP & KPI 18 Cabang (12 Bulan)</div>
          <span class="e-panel-sub">Formula: 40% Stok + 30% Kebersihan + 30% Penjualan</span>
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">
          ${trendChart}
        </div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#0369a1')} Peta Koridor Distribusi Cold-Chain Nusantara (18 Depo)</div>
          ${badge('18 Depo Aktif', 'accent')}
        </div>
        <div class="e-panel-body" style="padding:6px 10px;">
          ${svgArchipelagoMap()}
        </div>
      </section>
    </div>
    <div class="cg-grid" style="grid-template-columns:1.85fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0369a1')} Podium Peringkat Teratas & Daftar Pantauan Eksekutif (Nov 2026)</div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${badge('BA #EXT-2026-114: Makassar 240 kg UHT', 'warn')}
            <span class="e-panel-sub">Menampilkan 12 sorotan dari 18 cabang</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table compact">
            <colgroup>
              <col style="width:40px;"><col style="width:58px;"><col style="width:152px;"><col style="width:130px;">
              <col style="width:70px;"><col style="width:52px;"><col style="width:66px;"><col style="width:68px;">
              <col style="width:94px;"><col>
            </colgroup>
            <thead>
              <tr>
                <th>Rank</th><th>Kode</th><th>Cabang Cold-Storage</th><th>Pimpinan Cabang</th>
                <th class="num">Stok</th><th class="num">HACCP</th><th class="num">Suhu</th><th class="num">Skor KPI</th>
                <th>Status</th><th>Catatan Operasional</th>
              </tr>
            </thead>
            <tbody>${spotlightRows}</tbody>
          </table>
          <div style="margin-top:auto;padding:6px 10px;background:#fffbeb;border-top:1px solid #fde68a;display:flex;align-items:center;justify-content:space-between;font-size:10.3px;">
            <span style="color:#92400e;font-weight:600;">${ic('alert', 12, '#b45309')} Antrean Teken Dir Ops: BA Pemusnahan #EXT-2026-114 (Makassar): 240 kg UHT Batch #L902 · Saksi QA + Finance</span>
            <span class="mono" style="color:#b45309;font-weight:700;">HPP Rp 28.800.000</span>
          </div>
        </div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0369a1')} Valuasi Stok & Rata-rata KPI per Regional</div>
          <span class="e-panel-sub">Total Rp 148,62 M</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;padding:7px 10px;">
          ${regBarChart}
          <table class="e-table compact">
            <colgroup><col style="width:118px;"><col style="width:42px;"><col style="width:74px;"><col style="width:62px;"><col></colgroup>
            <thead>
              <tr><th>Regional</th><th class="num">Cbg</th><th class="num">Stok (M)</th><th class="num">KPI</th><th class="num">Selisih Rp</th></tr>
            </thead>
            <tbody>
              ${regStats.map((r) => `<tr>
                <td style="font-weight:600;">${esc(r.region)}</td>
                <td class="num mono">${r.count}</td>
                <td class="num mono">Rp ${r.valM.toFixed(2).replace('.', ',')} M</td>
                <td class="num mono" style="font-weight:700;color:${r.avgKpi < 86 ? '#b45309' : '#047857'};">${r.avgKpi.toFixed(1).replace('.', ',')}</td>
                <td class="num mono">${fmtIdr(r.varRp)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeSlug: 'p1',
    title: 'Kokpit Eksekutif & Peta KPI 18 Cabang',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11, '#334155')} Impor Stok Excel</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Terbitkan Peringkat Cabang</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 2: GRID OPERASIONAL 18 CABANG & INSPEKTOR PIMPINAN (DEVEXPRESS GRID)
// ============================================================================
function renderPage2() {
  const selectedBranch = BRANCHES[13]; // BR-14 Makassar KIMA

  const rowsHtml = BRANCHES.map((b) => {
    const isSel = b.code === selectedBranch.code;
    const rowCls = isSel ? 'is-selected' : b.tone === 'bad' ? 'is-bad' : b.tone === 'warn' ? 'is-warn' : '';
    const tempCls = b.temp > -18.3 ? 'temp-bad' : b.temp > -18.9 ? 'temp-warn' : 'temp-ok';
    return `<tr class="${rowCls}">
      <td><span class="cb ${isSel ? 'checked' : ''}">${isSel ? ic('check', 9, '#fff') : ''}</span></td>
      <td class="mono" style="font-weight:700;">#${b.rank}</td>
      <td class="mono" style="color:#075985;font-weight:700;">${esc(b.code)}</td>
      <td style="font-weight:600;">${esc(b.name)}</td>
      <td style="color:#475569;">${esc(b.region)}</td>
      <td class="num mono" style="font-weight:600;color:${b.stockAcc < 99 ? '#be123c' : '#047857'};">${fmtPct(b.stockAcc, 2)}</td>
      <td class="num mono" style="font-weight:600;color:${b.hygiene < 85 ? '#be123c' : '#0f172a'};">${b.hygiene}</td>
      <td class="num mono">${fmtPct(b.salesKpi, 1)}</td>
      <td class="num mono ${tempCls}">${b.temp.toFixed(1).replace('.', ',')} °C</td>
      <td class="num mono">${b.varKg === 0 ? '0 kg' : fmtNum(b.varKg) + ' kg'}</td>
      <td class="num mono">${b.varRp === 0 ? 'Rp 0' : fmtIdr(b.varRp)}</td>
      <td class="num mono" style="font-weight:700;color:#0f172a;">${b.kpiScore.toFixed(1).replace('.', ',')}</td>
      <td>${badge(b.status, b.tone)}</td>
    </tr>`;
  }).join('');

  const bodyHtml = `
    <div class="cg-grid" style="grid-template-columns:1fr 390px;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0369a1')} DevExpress National Branch Grid — Peringkat 18 Cabang Cold-Storage</div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span class="e-panel-sub">Urut: Skor KPI (Tertinggi)</span>
            ${badge('18 / 18 Cabang Tersinkron', 'ok')}
          </div>
        </div>
        <div class="cg-filter-bar">
          <div style="display:flex;align-items:center;gap:5px;">
            <span class="cg-chip is-on">${ic('filter', 10, '#075985')} Semua (18)</span>
            <span class="cg-chip">Tier A >= 90 (12)</span>
            <span class="cg-chip">Pantau (2)</span>
            <span class="cg-chip" style="border-color:#fde68a;background:#fffbeb;color:#b45309;">Butuh BA (2)</span>
            <span class="cg-chip" style="border-color:#fecdd3;background:#fff1f2;color:#be123c;">Audit Terbuka (2)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="cg-chip">${ic('search', 10, '#64748b')} Cari kode / kota / pimpinan...</span>
            <span class="cg-chip">Periode: Nov 2026</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.7px;">
            <colgroup>
              <col style="width:26px;"><col style="width:36px;"><col style="width:56px;"><col style="width:146px;">
              <col style="width:102px;"><col style="width:66px;"><col style="width:48px;"><col style="width:58px;">
              <col style="width:62px;"><col style="width:62px;"><col style="width:94px;"><col style="width:50px;">
              <col style="width:94px;">
            </colgroup>
            <thead>
              <tr>
                <th></th><th>#</th><th>Kode</th><th>Nama Cabang</th><th>Regional</th>
                <th class="num">Stok %</th><th class="num">HACCP</th><th class="num">Sales</th>
                <th class="num">Suhu</th><th class="num">Selisih</th><th class="num">Nilai Selisih</th>
                <th class="num">KPI</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="5">RINGKASAN NASIONAL (18 CABANG · ${fmtNum(TOTAL_PALLETS)} PALLET · Rp ${TOTAL_VAL_M.toFixed(2).replace('.', ',')} M)</td>
                <td class="num mono">${fmtPct(AVG_STOCK_ACC, 2)}</td>
                <td class="num mono">${AVG_HYGIENE.toFixed(1).replace('.', ',')}</td>
                <td class="num mono">${fmtPct(BRANCHES.reduce((a, b) => a + b.salesKpi, 0) / 18, 1)}</td>
                <td class="num mono">-19,4 °C</td>
                <td class="num mono">${fmtNum(TOTAL_VAR_KG)} kg</td>
                <td class="num mono">${fmtIdr(TOTAL_VAR_RP)}</td>
                <td class="num mono">${AVG_KPI.toFixed(1).replace('.', ',')}</td>
                <td>${badge('2 BA Aktif', 'warn')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <aside class="e-panel">
        <div class="e-panel-head" style="background:#e0f2fe;border-bottom-color:#bae6fd;">
          <div class="e-panel-title" style="color:#075985;">${ic('eye', 13, '#0369a1')} Inspektor Cabang: BR-14 Makassar KIMA</div>
          ${badge('Rank #14', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;padding:10px 12px;">
          <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:700;font-size:12px;color:#0f172a;">Cabang Makassar KIMA</span>
              <span class="mono" style="font-size:15px;font-weight:800;color:#b45309;">82,1 pts</span>
            </div>
            <div class="cg-kv"><span class="cg-kv-k">Pimpinan Cabang</span><span class="cg-kv-v">${esc(selectedBranch.head)}</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Regional / Zona Waktu</span><span class="cg-kv-v">Bali & Sulawesi · WITA</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Kapasitas Cold-Room</span><span class="cg-kv-v mono">${fmtNum(selectedBranch.pallets)} / 2.200 pallet (${selectedBranch.capPct}%)</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Nilai Persediaan Aktif</span><span class="cg-kv-v mono">Rp 7,60 Miliar</span></div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;">
            <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-bottom:6px;">Dekomposisi Skor KPI Pimpinan (Nov 2026)</div>
            <div style="margin-bottom:6px;">
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
                <span>1. Akurasi Stok (Bobot 40%) · 98,80%</span><span class="mono" style="font-weight:700;">82,0 -> 32,80 pts</span>
              </div>
              ${renderCapacityBar(82, { warnAt: 85, critAt: 99, showLabel: false })}
            </div>
            <div style="margin-bottom:6px;">
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
                <span>2. Kebersihan HACCP (Bobot 30%) · 88/100</span><span class="mono" style="font-weight:700;">88,0 -> 26,40 pts</span>
              </div>
              ${renderCapacityBar(88, { warnAt: 95, critAt: 99, showLabel: false })}
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
                <span>3. Pencapaian Penjualan (Bobot 30%) · 76,3%</span><span class="mono" style="font-weight:700;">76,3 -> 22,89 pts</span>
              </div>
              ${renderCapacityBar(76.3, { warnAt: 70, critAt: 99, showLabel: false })}
            </div>
          </div>

          <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:3px;padding:8px 10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:700;color:#92400e;font-size:10.8px;">${ic('alert', 12, '#b45309')} BA Pemusnahan #EXT-2026-114</span>
              ${badge('Menunggu Dir Ops', 'warn')}
            </div>
            <div style="font-size:10.3px;color:#78350f;line-height:1.45;">
              240 kg Diamond UHT Full Cream 1L Batch <span class="mono" style="font-weight:700;">#L902</span> (Exp 14 Nov 2026). HPP <span class="mono" style="font-weight:700;">Rp 28.800.000</span>. Saksi QA Regional & Finance telah memverifikasi berita acara lapangan.
            </div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:10.5px;font-weight:700;color:#0f172a;">Tren Suhu Freezer F1-F4 (14 Hari)</span>
              <span class="mono temp-warn" style="font-size:10.5px;">-18,6 °C</span>
            </div>
            ${svgMultiLineChart({
              width: 345,
              height: 118,
              xLabels: ['H-14', 'H-11', 'H-8', 'H-5', 'H-2', 'Kini'],
              yMin: -22,
              yMax: -16,
              yTicks: 3,
              yFormat: (v) => `${v}°`,
              threshold: { value: -18, label: 'Batas -18°C', color: '#be123c' },
              series: [
                { label: 'Freezer F1', color: '#0369a1', values: [-19.4, -19.2, -18.9, -18.5, -18.8, -18.6], dots: true, area: true },
              ],
            })}
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:3px;padding:7px 9px;background:#f8fafc;">
            <div style="font-size:10.3px;font-weight:700;color:#0f172a;margin-bottom:4px;">Tindakan Perbaikan Terbuka (BR-14)</div>
            <div class="cg-kv"><span class="cg-kv-k">BA #EXT-2026-114 (240 kg UHT)</span><span class="cg-kv-v" style="color:#b45309;">Tunggu Teken Dir Ops</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Pengetatan Retur Modern Trade</span><span class="cg-kv-v">SLA &lt;= H-14 Exp</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Kalibrasi Sensor Freezer F2</span><span class="cg-kv-v" style="color:#047857;">Terjadwal 25 Nov</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Target Pemulihan KPI Des 2026</span><span class="cg-kv-v mono" style="color:#0369a1;">&gt;= 88,5 pts</span></div>
          </div>

          <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('fileText', 11, '#fff')} Buka Draf BA #114</span>
            <span class="e-btn" style="justify-content:center;">${ic('download', 11, '#334155')} Ekspor Rapor Excel</span>
          </div>
        </div>
      </aside>
    </div>
  `;

  return renderShell({
    activeSlug: 'p2',
    title: 'Grid Operasional 18 Cabang & Inspektor Pimpinan',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#334155')} Hitung Ulang KPI</span>
      <span class="e-btn">${ic('download', 11, '#334155')} Ekspor EPPlus (.xlsx)</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Kunci Peringkat Nov 2026</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 3: DENAH GUDANG DINGIN & TELEMETRI SENSOR HACCP (ARCHITECTURAL SVG)
// ============================================================================
function svgColdStorageBlueprint() {
  return `<svg viewBox="0 0 940 530" width="100%" height="525" style="display:block;background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;">
    <!-- Engineering Blueprint Grid -->
    <defs>
      <pattern id="bpGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" stroke-width="0.7"/>
      </pattern>
      <pattern id="hatchRed" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#fda4af" stroke-width="2" />
      </pattern>
    </defs>
    <rect width="940" height="530" fill="url(#bpGrid)" />

    <!-- Perimeter Insulated Sandwich Panel Wall (150mm PU) -->
    <rect x="26" y="24" width="888" height="474" fill="#ffffff" stroke="#0f172a" stroke-width="4" />

    <!-- ZONE A: BLAST FREEZER (-25 C) -->
    <rect x="30" y="28" width="210" height="225" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.8" />
    <rect x="30" y="28" width="210" height="24" fill="#0c4a6e" />
    <text x="40" y="44" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">ZONA BF · BLAST FREEZER</text>
    <text x="194" y="44" font-size="10" font-weight="700" fill="#7dd3fc" font-family="Consolas,monospace">-24,8 °C</text>
    <!-- Blast Racks -->
    <g fill="#bae6fd" stroke="#0369a1" stroke-width="1">
      <rect x="44" y="66" width="80" height="32" rx="2" /><rect x="138" y="66" width="86" height="32" rx="2" />
      <rect x="44" y="110" width="80" height="32" rx="2" /><rect x="138" y="110" width="86" height="32" rx="2" />
      <rect x="44" y="154" width="80" height="32" rx="2" /><rect x="138" y="154" width="86" height="32" rx="2" />
    </g>
    <g font-size="9" font-family="Consolas,monospace" fill="#075985" font-weight="700">
      <text x="54" y="86">BF-A1 (94%)</text><text x="148" y="86">BF-B1 (88%)</text>
      <text x="54" y="130">BF-A2 (91%)</text><text x="148" y="130">BF-B2 (82%)</text>
      <text x="54" y="174">BF-A3 (76%)</text><text x="148" y="174">BF-B3 (90%)</text>
    </g>
    <!-- Evaporator EV-01 -->
    <rect x="66" y="204" width="136" height="32" rx="2" fill="#0369a1" />
    <text x="78" y="224" font-size="9.5" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">EVAP EV-01 · DEFROST OK</text>

    <!-- ZONE B: DEEP FROZEN STORAGE (-20 C) -->
    <rect x="244" y="28" width="414" height="318" fill="#f0f9ff" stroke="#0369a1" stroke-width="1.8" />
    <rect x="244" y="28" width="414" height="24" fill="#0369a1" />
    <text x="256" y="44" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">ZONA F1–F4 · DEEP FROZEN STORAGE (DAGING, SEAFOOD, ES KRIM)</text>
    <text x="598" y="44" font-size="10" font-weight="700" fill="#e0f2fe" font-family="Consolas,monospace">-17,9 °C</text>
    <!-- 4 High-Density Pallet Aisles -->
    <g fill="#dbeafe" stroke="#0284c7" stroke-width="1">
      <rect x="262" y="68" width="80" height="224" rx="2" />
      <rect x="362" y="68" width="80" height="224" rx="2" />
      <rect x="462" y="68" width="80" height="224" rx="2" />
      <rect x="562" y="68" width="80" height="224" rx="2" />
    </g>
    <!-- Pallet bays lines -->
    <g stroke="#93c5fd" stroke-width="0.9">
      <line x1="262" y1="112" x2="342" y2="112" /><line x1="262" y1="156" x2="342" y2="156" /><line x1="262" y1="200" x2="342" y2="200" /><line x1="262" y1="244" x2="342" y2="244" />
      <line x1="362" y1="112" x2="442" y2="112" /><line x1="362" y1="156" x2="442" y2="156" /><line x1="362" y1="200" x2="442" y2="200" /><line x1="362" y1="244" x2="442" y2="244" />
      <line x1="462" y1="112" x2="542" y2="112" /><line x1="462" y1="156" x2="542" y2="156" /><line x1="462" y1="200" x2="542" y2="200" /><line x1="462" y1="244" x2="542" y2="244" />
      <line x1="562" y1="112" x2="642" y2="112" /><line x1="562" y1="156" x2="642" y2="156" /><line x1="562" y1="200" x2="642" y2="200" /><line x1="562" y1="244" x2="642" y2="244" />
    </g>
    <g font-size="9.5" font-family="Consolas,monospace" fill="#0c4a6e" font-weight="700" text-anchor="middle">
      <text x="302" y="94">RAK F1</text><text x="302" y="138">Seafood</text><text x="302" y="182">214 plt</text><text x="302" y="226">OK -19,2°</text>
      <text x="402" y="94">RAK F2</text><text x="402" y="138">Daging US</text><text x="402" y="182">248 plt</text><text x="402" y="226" fill="#b45309">WARN -17,9°</text>
      <text x="502" y="94">RAK F3</text><text x="502" y="138">Kentang</text><text x="502" y="182">192 plt</text><text x="502" y="226">OK -19,0°</text>
      <text x="602" y="94">RAK F4</text><text x="602" y="138">Es Krim</text><text x="602" y="182">176 plt</text><text x="602" y="226">OK -20,1°</text>
    </g>
    <!-- Evaporator EV-02 Alert -->
    <rect x="356" y="304" width="190" height="30" rx="2" fill="#fffbeb" stroke="#d97706" stroke-width="1.5" />
    <text x="366" y="323" font-size="9.2" font-weight="700" fill="#92400e" font-family="Consolas,monospace">EV-02 · BUNGA ES 14 mm (AUDIT)</text>

    <!-- ZONE C: CHILLER ROOM (+2 s.d. +4 C) WITH DOOR SEAL DEFECT -->
    <rect x="662" y="28" width="248" height="318" fill="#fff1f2" stroke="#be123c" stroke-width="2" />
    <rect x="662" y="28" width="248" height="24" fill="#be123c" />
    <text x="672" y="44" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">ZONA C1 · CHILLER DAIRY</text>
    <text x="852" y="44" font-size="10" font-weight="700" fill="#fecdd3" font-family="Consolas,monospace">+6,9 °C !</text>
    <!-- Chiller Racks -->
    <g fill="#ffffff" stroke="#fda4af" stroke-width="1.2">
      <rect x="680" y="70" width="96" height="168" rx="2" />
      <rect x="796" y="70" width="96" height="168" rx="2" />
    </g>
    <g font-size="9.2" font-family="Consolas,monospace" fill="#881337" font-weight="700" text-anchor="middle">
      <text x="728" y="102">C1-A (UHT/Milk)</text><text x="728" y="128">112 Pallet</text><text x="728" y="156" fill="#be123c">Suhu +6,4 °C</text>
      <text x="844" y="102">C1-B (Cheese)</text><text x="844" y="128">98 Pallet</text><text x="844" y="156" fill="#be123c">Suhu +6,9 °C</text>
    </g>
    <!-- Thermal leak callout at Door D-03 -->
    <rect x="676" y="254" width="220" height="72" rx="3" fill="#ffffff" stroke="#be123c" stroke-width="1.5" />
    <text x="686" y="272" font-size="9.5" font-weight="800" fill="#be123c" font-family="Segoe UI,sans-serif">TEMUAN AUDIT KRITIS · PINTU D-03</text>
    <text x="686" y="288" font-size="9" fill="#334155" font-family="Segoe UI,sans-serif">Karet gasket bawah sobek 18 cm.</text>
    <text x="686" y="302" font-size="9" fill="#334155" font-family="Segoe UI,sans-serif">Infiltrasi udara hangat +2,9 °C di atas</text>
    <text x="686" y="316" font-size="9" font-weight="700" fill="#be123c" font-family="Consolas,monospace">batas HACCP (+4,0 °C) · CAPA #MDN-09</text>
    <!-- Red highlighted broken door D-03 on partition wall -->
    <rect x="748" y="340" width="76" height="12" fill="#be123c" stroke="#ffffff" stroke-width="1.5" />
    <text x="786" y="349" font-size="8.2" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="Consolas,monospace">PINTU D-03</text>

    <!-- ZONE D: QUARANTINE / HOLD BA CAGE -->
    <rect x="30" y="257" width="210" height="89" fill="url(#hatchRed)" stroke="#be123c" stroke-width="1.6" />
    <rect x="38" y="266" width="194" height="71" rx="2" fill="#ffffff" fill-opacity="0.93" stroke="#fecdd3" />
    <text x="48" y="283" font-size="9.8" font-weight="800" fill="#be123c" font-family="Segoe UI,sans-serif">ZONA KARANTINA & HOLD BA</text>
    <text x="48" y="299" font-size="9" fill="#334155" font-family="Consolas,monospace">Rak QRT-01: 62 kg Shortplate</text>
    <text x="48" y="313" font-size="9" fill="#334155" font-family="Consolas,monospace">Kunci Ganda: QA + Ka. Gudang</text>
    <text x="48" y="328" font-size="8.8" font-weight="700" fill="#047857" font-family="Consolas,monospace">Segel Digital: LOCKED · CCTV OK</text>

    <!-- ZONE E: ANTE-ROOM & REEFER LOADING DOCK (+8 C) -->
    <rect x="30" y="350" width="880" height="144" fill="#f1f5f9" stroke="#64748b" stroke-width="1.6" />
    <text x="44" y="370" font-size="10.2" font-weight="700" fill="#334155" font-family="Segoe UI,sans-serif">ANTE-ROOM STAGING & REEFER DOCK LEVELER (+8,2 °C · TIRAI PVC AIR-CURTAIN)</text>
    <!-- 4 Reefer Docks -->
    <g>
      <rect x="52" y="388" width="186" height="88" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.4" />
      <rect x="52" y="388" width="186" height="20" fill="#0369a1" />
      <text x="62" y="402" font-size="9.2" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">DOCK 01 · LOADING AKTIF</text>
      <text x="62" y="424" font-size="9.5" font-weight="700" fill="#0f172a">BK 8412 XY (Reefer 12T)</text>
      <text x="62" y="440" font-size="9" fill="#475569" font-family="Consolas,monospace">Box: -19,4 °C · Rute: Binjai</text>
      <text x="62" y="458" font-size="9" font-weight="700" fill="#047857">Dock Seal: Rapat (0 kebocoran)</text>

      <rect x="266" y="388" width="186" height="88" rx="3" fill="#ffffff" stroke="#0369a1" stroke-width="1.4" />
      <rect x="266" y="388" width="186" height="20" fill="#0369a1" />
      <text x="276" y="402" font-size="9.2" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">DOCK 02 · UNLOADING HQ</text>
      <text x="276" y="424" font-size="9.5" font-weight="700" fill="#0f172a">B 9104 UXV (Kontainer 40ft)</text>
      <text x="276" y="440" font-size="9" fill="#475569" font-family="Consolas,monospace">Box: -20,1 °C · Dari: Cibitung</text>
      <text x="276" y="458" font-size="9" font-weight="700" fill="#047857">Verifikasi FEFO: 24/24 Pallet</text>

      <rect x="480" y="388" width="186" height="88" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3" />
      <rect x="480" y="388" width="186" height="20" fill="#64748b" />
      <text x="490" y="402" font-size="9.2" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">DOCK 03 · STANDBY</text>
      <text x="490" y="428" font-size="9.2" fill="#475569">Pintu sectional tertutup rapat</text>
      <text x="490" y="446" font-size="9" fill="#64748b" font-family="Consolas,monospace">Jadwal masuk: 22:00 WIB</text>

      <rect x="694" y="388" width="198" height="88" rx="3" fill="#fff1f2" stroke="#be123c" stroke-width="1.5" />
      <rect x="694" y="388" width="198" height="20" fill="#be123c" />
      <text x="704" y="402" font-size="9.2" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">DOCK 04 · AREA CHILLER D-03</text>
      <text x="704" y="424" font-size="9.5" font-weight="700" fill="#881337">DIBATASI · PERBAIKAN GASKET</text>
      <text x="704" y="440" font-size="9" fill="#475569" font-family="Consolas,monospace">Teknisi HVAC di lokasi</text>
      <text x="704" y="458" font-size="9" font-weight="700" fill="#be123c">ETA Penggantian: 23 Nov 06:00</text>
    </g>

    <!-- Wireless PT100 Sensor Pins -->
    <g font-family="Consolas,monospace" font-size="8.5" font-weight="700">
      <circle cx="134" cy="100" r="10" fill="#0c4a6e" stroke="#fff" stroke-width="1.5" /><text x="134" y="103" fill="#fff" text-anchor="middle">S1</text>
      <circle cx="352" cy="148" r="10" fill="#047857" stroke="#fff" stroke-width="1.5" /><text x="352" y="151" fill="#fff" text-anchor="middle">S2</text>
      <circle cx="452" cy="186" r="10" fill="#d97706" stroke="#fff" stroke-width="1.5" /><text x="452" y="189" fill="#fff" text-anchor="middle">S3</text>
      <circle cx="552" cy="148" r="10" fill="#047857" stroke="#fff" stroke-width="1.5" /><text x="552" y="151" fill="#fff" text-anchor="middle">S4</text>
      <circle cx="786" cy="182" r="11" fill="#be123c" stroke="#fff" stroke-width="1.5" /><text x="786" y="185" fill="#fff" text-anchor="middle">S5</text>
      <circle cx="470" cy="366" r="10" fill="#0369a1" stroke="#fff" stroke-width="1.5" /><text x="470" y="369" fill="#fff" text-anchor="middle">S6</text>
    </g>

    <!-- Bottom Technical Scale Footer inside Blueprint -->
    <text x="32" y="516" font-size="9" font-family="Consolas,monospace" fill="#475569">DENAH TEKNIS: BR-17 MEDAN TANJUNG MORAWA · SKALA 1:200 · KAPASITAS 1.250 PALLET · INSULASI PU 150 mm · MODBUS RTU POLL 15 dtk</text>
  </svg>`;
}

function renderPage3() {
  const sensors = [
    { id: 'PT100-S1', zone: 'Blast Freezer BF',    val: '-24,8 °C', limit: '<= -22,0 °C', door: '4 mnt',  batt: '98%', cal: 'Okt 2026', status: 'Normal',    tone: 'ok' },
    { id: 'PT100-S2', zone: 'Frozen Rak F1/F3',    val: '-19,2 °C', limit: '<= -18,0 °C', door: '11 mnt', batt: '94%', cal: 'Okt 2026', status: 'Normal',    tone: 'ok' },
    { id: 'PT100-S3', zone: 'Frozen Rak F2 (EV2)', val: '-17,9 °C', limit: '<= -18,0 °C', door: '18 mnt', batt: '91%', cal: 'Okt 2026', status: 'Batas Atas',tone: 'warn' },
    { id: 'PT100-S4', zone: 'Frozen Rak F4 EsKrim',val: '-20,1 °C', limit: '<= -18,0 °C', door: '6 mnt',  batt: '96%', cal: 'Okt 2026', status: 'Normal',    tone: 'ok' },
    { id: 'PT100-S5', zone: 'Chiller C1 Pintu D3', val: '+6,9 °C',  limit: '+2,0..+4,0 °C',door: '34 mnt', batt: '89%', cal: 'Okt 2026', status: 'Excursion', tone: 'bad' },
    { id: 'PT100-S6', zone: 'Ante-Room Staging',   val: '+8,2 °C',  limit: '<= +10,0 °C', door: '42 mnt', batt: '95%', cal: 'Okt 2026', status: 'Normal',    tone: 'ok' },
    { id: 'PT100-S7', zone: 'Karantina QRT-01',    val: '-19,4 °C', limit: '<= -18,0 °C', door: '2 mnt',  batt: '99%', cal: 'Okt 2026', status: 'Terkunci',  tone: 'info' },
    { id: 'HUM-01',   zone: 'Kelembapan Chiller',  val: '86,4% RH', limit: '<= 80,0% RH', door: '-',      batt: '92%', cal: 'Sep 2026', status: 'Kondensasi',tone: 'warn' },
    { id: 'PWR-01',   zone: 'Kompresor Bitzer #1', val: '74,2% A',  limit: '<= 85,0% A',  door: '-',      batt: 'AC',  cal: 'Okt 2026', status: 'Normal',    tone: 'ok' },
  ];

  const thermalChart = svgMultiLineChart({
    width: 560,
    height: 224,
    xLabels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    yMin: -28,
    yMax: 12,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)}°C`,
    threshold: { value: 4, label: 'Batas HACCP (+4°C)', color: '#be123c' },
    series: [
      { label: 'Chiller C1 (S5)', color: '#be123c', values: [3.1, 3.2, 3.8, 5.1, 6.2, 6.8, 6.5, 6.9], dots: true, area: true },
      { label: 'Ante-Room (S6)',  color: '#64748b', values: [7.6, 7.4, 8.2, 8.8, 9.1, 8.6, 8.4, 8.2], dashed: true },
      { label: 'Frozen F2 (S3)',  color: '#0369a1', values: [-19.4, -19.2, -18.8, -18.3, -18.0, -17.9, -18.1, -17.9], dots: true },
      { label: 'Blast BF (S1)',   color: '#047857', values: [-25.1, -25.0, -24.8, -24.7, -24.9, -24.8, -24.9, -24.8] },
    ],
    annotations: [
      { index: 4, seriesIdx: 0, label: 'Pintu D-03 Bocor (+6,9 °C)', color: '#be123c', dy: -28 },
    ],
  });

  const bodyHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      ${renderKpiCard({ label: 'Depo Terpilih', value: 'BR-17 Medan', sub: 'Tanjung Morawa · Skor 79,4 pts', tone: 'bad', delta: 'Audit Terbuka' })}
      ${renderKpiCard({ label: 'Suhu Chiller C1 (S5)', value: '+6,9 °C', sub: 'Melebihi batas HACCP +4,0 °C (+2,9 °C)', tone: 'bad', delta: 'EXCURSION' })}
      ${renderKpiCard({ label: 'Suhu Deep Frozen F2', value: '-17,9 °C', sub: 'Bunga es EV-02 · jadwal defrost paksa', tone: 'warn', delta: '+0,1 °C' })}
      ${renderKpiCard({ label: 'Suhu Blast Freezer', value: '-24,8 °C', sub: 'Kompresor Bitzer #1 & #2 normal', tone: 'ok', delta: 'Stabil' })}
      ${renderKpiCard({ label: 'Kepatuhan Suhu Nasional', value: '98,6%', sub: '106 / 108 sensor PT100 dalam batas', tone: 'ok', delta: '18 Cabang' })}
    </div>

    <div class="cg-grid" style="grid-template-columns:1.58fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('cpu', 13, '#0369a1')} Denah Termal & Zona Cold-Storage — BR-17 Medan Tanjung Morawa</div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${badge('Pintu D-03: Gasket Sobek 18 cm', 'bad')}
            ${badge('EV-02: Defrost Alert', 'warn')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
          ${svgColdStorageBlueprint()}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;padding:6px 9px;">
              <div style="font-size:9.5px;color:#64748b;font-weight:600;">Kompresor Utama</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">Bitzer 4GE-23Y · 74% Load</div>
              <div style="font-size:9.3px;color:#64748b;">Freon R404A · Tekanan Normal</div>
            </div>
            <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:6px 9px;">
              <div style="font-size:9.5px;color:#be123c;font-weight:700;">Durasi Excursion Chiller</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#be123c;">04 Jam 18 Menit</div>
              <div style="font-size:9.3px;color:#881337;">112 pallet dairy dipindah ke C2</div>
            </div>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:6px 9px;">
              <div style="font-size:9.5px;color:#b45309;font-weight:700;">Buka Pintu Hari Ini</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;">47 Siklus (Rata 44 dtk)</div>
              <div style="font-size:9.3px;color:#92400e;">Melebihi batas SOP 30 detik</div>
            </div>
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;padding:6px 9px;">
              <div style="font-size:9.5px;color:#64748b;font-weight:600;">Genset Backup Cold-Room</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#0369a1;">350 kVA · Solar 92%</div>
              <div style="font-size:9.3px;color:#64748b;">ATS Siaga · Uji beban 15 Nov</div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="height:278px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#be123c')} Kurva Telemetri Suhu 24 Jam (Modbus RTU)</div>
            <span class="e-panel-sub">Interval log: 15 dtk</span>
          </div>
          <div class="e-panel-body" style="padding:6px 8px;">
            ${thermalChart}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#0369a1')} Matriks Sensor PT100 & Kelembapan BR-17</div>
            ${badge('9 Node Aktif', 'info')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:74px;"><col style="width:138px;"><col style="width:66px;"><col style="width:86px;">
                <col style="width:52px;"><col style="width:86px;">
              </colgroup>
              <thead>
                <tr><th>Sensor</th><th>Zona Cold-Room</th><th class="num">Bacaan</th><th>Batas HACCP</th><th class="num">Pintu</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${sensors.map((s) => `<tr class="${s.tone === 'bad' ? 'is-bad' : s.tone === 'warn' ? 'is-warn' : ''}">
                  <td class="mono" style="font-weight:700;color:#075985;">${esc(s.id)}</td>
                  <td style="font-weight:600;">${esc(s.zone)}</td>
                  <td class="num mono" style="font-weight:700;color:${s.tone === 'bad' ? '#be123c' : s.tone === 'warn' ? '#b45309' : '#0369a1'};">${esc(s.val)}</td>
                  <td class="mono" style="font-size:9.5px;color:#64748b;">${esc(s.limit)}</td>
                  <td class="num mono">${esc(s.door)}</td>
                  <td>${badge(s.status, s.tone)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <div style="margin-top:auto;padding:7px 10px;background:#f8fafc;border-top:1px solid #cbd5e1;font-size:10px;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:#334155;">Kalibrasi KAN terakhir: <strong>14 Okt 2026</strong> (Sertifikat #KAN-26-0842)</span>
              <span class="e-btn e-btn-danger" style="height:20px;font-size:9.8px;">${ic('bell', 10, '#be123c')} Eskalasi Teknisi HVAC</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p3',
    title: 'Denah Gudang Dingin & Telemetri Sensor HACCP',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 11, '#334155')} Pilih Cabang: BR-17 Medan</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Log HACCP (PDF/CSV)</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 4: STOCK-TAKING PER BATCH, FEFO & SELISIH OPNAME
// ============================================================================
function renderPage4() {
  // Compute exact buckets from STOCK_BATCHES
  const expiredOrBa = STOCK_BATCHES.filter((r) => r.ba !== '-');
  const expBaKg = expiredOrBa.reduce((a, r) => a + r.varKg, 0);
  const expBaRp = expiredOrBa.reduce((a, r) => a + r.varRp, 0);
  const lt14 = STOCK_BATCHES.filter((r) => r.fefo === '< 14 Hari');
  const lt30 = STOCK_BATCHES.filter((r) => r.fefo === '< 30 Hari');
  const gt45 = STOCK_BATCHES.filter((r) => r.fefo === '> 45 Hari');

  const rowsHtml = STOCK_BATCHES.map((r) => {
    const trCls = r.selected ? 'is-selected' : r.tone === 'bad' ? 'is-bad' : r.tone === 'warn' ? 'is-warn' : '';
    return `<tr class="${trCls}">
      <td class="mono" style="font-weight:700;color:#075985;">#${esc(r.batch)}</td>
      <td class="mono" style="color:#475569;">${esc(r.sku)}</td>
      <td style="font-weight:600;">${esc(r.product)}</td>
      <td>${esc(r.branch)}</td>
      <td class="mono">${esc(r.bin)}</td>
      <td class="num mono">${fmtNum(r.sysKg)}</td>
      <td class="num mono">${fmtNum(r.physKg)}</td>
      <td class="num mono" style="font-weight:700;color:#be123c;">-${fmtNum(r.varKg)} kg</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(r.varRp)}</td>
      <td class="mono">${esc(r.exp)}</td>
      <td>${badge(r.fefo, r.tone)}</td>
      <td class="mono" style="font-weight:700;color:${r.ba !== '-' ? '#b45309' : '#64748b'};">${esc(r.ba)}</td>
    </tr>`;
  }).join('');

  // Root-cause breakdown summing to TOTAL_VAR_RP = 94.850.000
  const causes = [
    { label: 'Kedaluwarsa / Retur Telat (BA #114)',    kg: 240, rp: 28800000, pct: 30.4, color: '#be123c' },
    { label: 'Excursion Suhu & Pintu Chiller',         kg: 177, rp: 19560000, pct: 20.6, color: '#d97706' },
    { label: 'Susut Glaze ES & Penimbangan IQF',       kg: 134, rp: 14860000, pct: 15.7, color: '#0369a1' },
    { label: 'Kerusakan Kemasan Bongkar / Forklift',   kg: 152, rp: 17070000, pct: 18.0, color: '#0284c7' },
    { label: 'Salah Scan Barcode & Posting Retur',     kg: 122, rp: 14560000, pct: 15.3, color: '#64748b' },
  ];

  const bodyHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi" style="border-left:3.5px solid #be123c;background:#fff1f2;">
        <div class="e-kpi-top"><span style="color:#881337;">FEFO BUCKET 1 · KEDALUWARSA / HOLD BA</span>${badge('2 Batch Wajib BA', 'bad')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">${fmtNum(expBaKg)} kg</span><span class="mono" style="font-weight:700;color:#881337;">${fmtIdr(expBaRp)}</span></div>
        <div class="e-kpi-foot"><span>Batch #L902 (Makassar) & #L887 (Palembang)</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #d97706;">
        <div class="e-kpi-top"><span>FEFO BUCKET 2 · KRITIS &lt; 14 HARI</span>${badge(`${lt14.length} Batch`, 'warn')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(lt14.reduce((a, r) => a + r.varKg, 0))} kg</span><span class="mono" style="font-weight:700;color:#b45309;">${fmtIdr(lt14.reduce((a, r) => a + r.varRp, 0))}</span></div>
        <div class="e-kpi-foot"><span>Prioritas promo clearance & alokasi Horeca</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #0284c7;">
        <div class="e-kpi-top"><span>FEFO BUCKET 3 · PANTAU 15–30 HARI</span>${badge(`${lt30.length} Batch`, 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(lt30.reduce((a, r) => a + r.varKg, 0))} kg</span><span class="mono" style="font-weight:700;color:#0369a1;">${fmtIdr(lt30.reduce((a, r) => a + r.varRp, 0))}</span></div>
        <div class="e-kpi-foot"><span>Monitoring distribusi antar-depo aktif</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #047857;">
        <div class="e-kpi-top"><span>FEFO BUCKET 4 · AMAN &gt; 45 HARI</span>${badge(`${gt45.length} Batch`, 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(gt45.reduce((a, r) => a + r.varKg, 0))} kg</span><span class="mono" style="font-weight:700;color:#047857;">${fmtIdr(gt45.reduce((a, r) => a + r.varRp, 0))}</span></div>
        <div class="e-kpi-foot"><span>Selisih opname non-kedaluwarsa (reconcile)</span></div>
      </div>
    </div>

    <div class="cg-grid" style="grid-template-columns:2.12fr 1fr;flex:1;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0369a1')} Rekonsiliasi Stock-Taking Per Batch & FEFO Nasional (Periode Nov 2026)</div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span class="e-panel-sub">Total Opname: 18.420 Baris · 14 Batch Berselisih</span>
            ${badge('Terkunci Audit', 'accent')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.4px;">
            <colgroup>
              <col style="width:48px;"><col style="width:92px;"><col><col style="width:106px;">
              <col style="width:58px;"><col style="width:54px;"><col style="width:54px;"><col style="width:64px;">
              <col style="width:102px;"><col style="width:82px;"><col style="width:82px;"><col style="width:102px;">
            </colgroup>
            <thead>
              <tr>
                <th>Batch</th><th>Kode SKU</th><th>Deskripsi Produk Cold-Chain</th><th>Cabang</th><th>Bin</th>
                <th class="num">Sistem</th><th class="num">Fisik</th><th class="num">Selisih</th><th class="num">Nilai HPP</th>
                <th>Exp FEFO</th><th>Status FEFO</th><th>No. BA</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL SELISIH STOCK-TAKING NASIONAL (18 CABANG · NOV 2026)</td>
                <td class="num mono">${fmtNum(STOCK_BATCHES.reduce((a, r) => a + r.sysKg, 0))}</td>
                <td class="num mono">${fmtNum(STOCK_BATCHES.reduce((a, r) => a + r.physKg, 0))}</td>
                <td class="num mono" style="color:#be123c;">-${fmtNum(TOTAL_VAR_KG)} kg</td>
                <td class="num mono">${fmtIdr(TOTAL_VAR_RP)}</td>
                <td colspan="3" style="text-align:right;color:#475569;">Cocok dengan Grid 18 Cabang & Jurnal PSAK 14</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head" style="background:#e0f2fe;border-bottom-color:#bae6fd;">
            <div class="e-panel-title" style="color:#075985;">${ic('gitBranch', 13, '#0369a1')} Jejak Cold-Chain Batch Terpilih: #L902</div>
            ${badge('HOLD BA #114', 'bad')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
            <div style="font-size:10.8px;font-weight:700;color:#0f172a;">Diamond UHT Full Cream 1L (DRY-UHT-1000)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;padding:6px 8px;font-size:10px;">
              <div><span style="color:#64748b;">Qty Karantina:</span> <strong class="mono">240 kg (20 Karton)</strong></div>
              <div><span style="color:#64748b;">Nilai HPP:</span> <strong class="mono">Rp 28.800.000</strong></div>
              <div><span style="color:#64748b;">Lokasi Bin:</span> <strong class="mono">BR-14 · QRT-01</strong></div>
              <div><span style="color:#64748b;">Tgl Exp:</span> <strong class="mono" style="color:#be123c;">14 Nov 2026</strong></div>
            </div>
            <!-- Custody Timeline -->
            <div style="display:flex;flex-direction:column;gap:5px;margin-top:2px;">
              ${[
                { t: '18 Mei 2026', title: 'Produksi Pabrik Cikarang (Lot #L902)', sub: 'CoA QA Lulus · Suhu rilis +3,2 °C', c: '#047857' },
                { t: '04 Jun 2026', title: 'Kirim Kontainer Reefer MRKU-482190', sub: 'Tanjung Priok -> Pelabuhan Soekarno-Hatta MKS', c: '#0369a1' },
                { t: '11 Jun 2026', title: 'Penerimaan Depo BR-14 Makassar KIMA', sub: '2.400 kg diterima · 2.160 kg terjual tepat waktu', c: '#0369a1' },
                { t: '09 Nov 2026', title: 'Retur Modern Trade Telat (240 kg)', sub: 'Sisa umur simpan < 5 hari, blokir jual FEFO otomatis', c: '#d97706' },
                { t: '19 Nov 2026', title: 'Karantina QRT-01 & Terbit BA #EXT-2026-114', sub: 'Saksi QA + Finance terverifikasi · Tunggu Dir Ops', c: '#be123c' },
              ].map((st) => `<div style="display:flex;gap:8px;align-items:flex-start;">
                <span class="mono" style="width:68px;font-size:9.3px;color:#64748b;flex-shrink:0;padding-top:1px;">${esc(st.t)}</span>
                <span style="width:8px;height:8px;border-radius:999px;background:${st.c};margin-top:3px;flex-shrink:0;"></span>
                <div style="min-width:0;line-height:1.25;">
                  <div style="font-size:10.3px;font-weight:700;color:#0f172a;">${esc(st.title)}</div>
                  <div style="font-size:9.5px;color:#475569;">${esc(st.sub)}</div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#0369a1')} Akar Masalah Selisih Opname (Rp 94,85 Jt)</div>
            <span class="e-panel-sub">5 Kategori</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
            ${causes.map((c) => `<div>
              <div style="display:flex;justify-content:space-between;font-size:10.2px;margin-bottom:2px;">
                <span style="font-weight:600;color:#0f172a;">${esc(c.label)}</span>
                <span class="mono" style="font-weight:700;color:#334155;">${fmtIdr(c.rp)} (${c.pct.toFixed(1).replace('.', ',')}%)</span>
              </div>
              <div style="height:7px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
                <div style="width:${c.pct * 2.8}%;height:100%;background:${c.color};"></div>
              </div>
            </div>`).join('')}
            <div style="margin-top:auto;padding-top:6px;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;font-size:10px;color:#475569;">
              <span>Total Berat Selisih: <strong class="mono" style="color:#0f172a;">825 kg</strong></span>
              <span>Total Nilai HPP: <strong class="mono" style="color:#be123c;">Rp 94.850.000</strong></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p4',
    title: 'Stock-Taking Per Batch, FEFO & Selisih Opname',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11, '#334155')} Impor Hasil Opname (.xlsx)</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 11, '#ffffff')} Buat BA Pemusnahan Baru</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 5: AUDIT KEBERSIHAN HACCP & BUKTI FOTO LAPANGAN
// ============================================================================
function svgEvidencePhotoPlate({ type, title, stamp, badgeText, badgeColor }) {
  // High-precision technical inspection photo/thermal illustration (zero emoji, zero stock images)
  let scene = '';
  if (type === 'gasket') {
    // Chiller Door D-03 torn rubber gasket + thermal leak contour
    scene = `
      <rect x="0" y="0" width="320" height="128" fill="#1e293b" />
      <!-- Metallic stainless door panel -->
      <rect x="14" y="10" width="150" height="108" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
      <rect x="166" y="10" width="140" height="108" fill="#94a3b8" stroke="#475569" stroke-width="1.5" />
      <!-- Rubber door gasket frame -->
      <rect x="156" y="10" width="14" height="108" fill="#0f172a" />
      <!-- Torn gasket gap with warm air leak highlighted in crisp red vector -->
      <path d="M156,58 L170,62 L168,94 L156,98 Z" fill="#be123c" />
      <path d="M150,52 L176,52 L176,104 L150,104 Z" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="3,2" />
      <!-- Thermal measurement reticle -->
      <circle cx="163" cy="78" r="14" fill="none" stroke="#facc15" stroke-width="1.3" />
      <line x1="163" y1="60" x2="163" y2="96" stroke="#facc15" stroke-width="0.9" />
      <line x1="145" y1="78" x2="181" y2="78" stroke="#facc15" stroke-width="0.9" />
      <rect x="184" y="62" width="112" height="32" rx="2" fill="#0f172a" fill-opacity="0.88" stroke="#facc15" />
      <text x="190" y="75" font-size="8.5" font-weight="700" fill="#facc15" font-family="Consolas,monospace">SOBEK 18 cm (D-03)</text>
      <text x="190" y="88" font-size="8.5" font-weight="700" fill="#fda4af" font-family="Consolas,monospace">IR SPOT: +6,9 °C</text>
    `;
  } else if (type === 'frost') {
    // Evaporator EV-02 ice buildup on cooling fins
    scene = `
      <rect x="0" y="0" width="320" height="128" fill="#0f172a" />
      <rect x="20" y="16" width="280" height="94" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.5" />
      <!-- Dual fan housing -->
      <circle cx="96" cy="63" r="32" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
      <circle cx="224" cy="63" r="32" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
      <line x1="66" y1="63" x2="126" y2="63" stroke="#64748b" stroke-width="2" />
      <line x1="96" y1="33" x2="96" y2="93" stroke="#64748b" stroke-width="2" />
      <line x1="194" y1="63" x2="254" y2="63" stroke="#64748b" stroke-width="2" />
      <line x1="224" y1="33" x2="224" y2="93" stroke="#64748b" stroke-width="2" />
      <!-- Heavy frost crystallization overlay on bottom coil -->
      <path d="M24,84 L68,78 L112,86 L160,74 L208,85 L256,77 L296,86 L296,108 L24,108 Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.2" />
      <rect x="108" y="88" width="106" height="18" rx="2" fill="#b45309" />
      <text x="161" y="100" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="Consolas,monospace">ES 14 mm (MAX 5 mm)</text>
    `;
  } else {
    // Clean Epoxy Floor & Stainless Drain Channel (Passed)
    scene = `
      <rect x="0" y="0" width="320" height="128" fill="#e2e8f0" />
      <!-- Perspective clean epoxy floor -->
      <polygon points="0,128 70,22 250,22 320,128" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" />
      <!-- Yellow safety lane markings -->
      <line x1="48" y1="128" x2="96" y2="22" stroke="#eab308" stroke-width="3" />
      <line x1="272" y1="128" x2="224" y2="22" stroke="#eab308" stroke-width="3" />
      <!-- Clean stainless trench drain -->
      <polygon points="146,128 156,22 164,22 174,128" fill="#94a3b8" stroke="#475569" stroke-width="1" />
      <g stroke="#334155" stroke-width="1">
        <line x1="154" y1="40" x2="166" y2="40" /><line x1="152" y1="60" x2="168" y2="60" />
        <line x1="150" y1="82" x2="170" y2="82" /><line x1="148" y1="104" x2="172" y2="104" />
      </g>
      <rect x="92" y="88" width="136" height="18" rx="2" fill="#047857" />
      <text x="160" y="100" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="Consolas,monospace">LANTAI EPOXY & DRAIN OK</text>
    `;
  }

  return `<div style="border:1px solid #cbd5e1;border-radius:3px;overflow:hidden;background:#ffffff;">
    <svg viewBox="0 0 320 128" width="100%" height="124" style="display:block;">
      ${scene}
      <rect x="6" y="6" width="${Math.min(180, badgeText.length * 6 + 14)}" height="16" rx="2" fill="${badgeColor}" />
      <text x="13" y="17" font-size="8.5" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">${esc(badgeText)}</text>
    </svg>
    <div style="padding:6px 8px;background:#f8fafc;border-top:1px solid #cbd5e1;">
      <div style="font-size:10.3px;font-weight:700;color:#0f172a;">${esc(title)}</div>
      <div class="mono" style="font-size:8.8px;color:#475569;margin-top:2px;">${esc(stamp)}</div>
    </div>
  </div>`;
}

function renderPage5() {
  const pillars = [
    { code: 'P1', name: 'Integritas Karet Pintu & Tirai PVC', weight: 20, score: 55, status: 'Kritis', tone: 'bad' },
    { code: 'P2', name: 'Kondensasi & Bunga Es Evaporator',   weight: 20, score: 70, status: 'Perlu CAPA', tone: 'warn' },
    { code: 'P3', name: 'Sanitasi Lantai Epoxy & Drainase',   weight: 18, score: 92, status: 'Lulus', tone: 'ok' },
    { code: 'P4', name: 'Kebersihan Pallet Plastik & Racking',weight: 15, score: 88, status: 'Lulus', tone: 'ok' },
    { code: 'P5', name: 'Pengendalian Hama (Pest Control)',   weight: 15, score: 84, status: 'Pantau', tone: 'info' },
    { code: 'P6', name: 'Higiene Personel & APD Cold-Room',   weight: 12, score: 85, status: 'Lulus', tone: 'ok' },
  ];
  // Weighted score check: 0.20*55 + 0.20*70 + 0.18*92 + 0.15*88 + 0.15*84 + 0.12*85
  // = 11.0 + 14.0 + 16.56 + 13.20 + 12.60 + 10.20 = 77.56 -> rounds to 78 (matches BR-17 hygiene = 78!)

  const checklist = [
    { id: 'AUD-01', area: 'Chiller C1', item: 'Karet gasket pintu geser D-03 rapat & utuh',           pts: '4 / 10',  finding: 'Sobek 18 cm sisi bawah, udara hangat masuk', pic: 'Teknisi HVAC', due: '23 Nov', tone: 'bad',  status: 'Kritis' },
    { id: 'AUD-02', area: 'Chiller C1', item: 'Tirai plastik PVC strip curtain lengkap & bersih',     pts: '6 / 10',  finding: '2 bilah ujung sobek, diganti sementara',     pic: 'Ka. Gudang',   due: '24 Nov', tone: 'warn', status: 'CAPA' },
    { id: 'AUD-03', area: 'Frozen F2',  item: 'Sirip evaporator bebas penumpukan es > 5 mm',          pts: '6 / 10',  finding: 'Bunga es 14 mm di EV-02, sensor defrost lag',pic: 'Teknisi HVAC', due: '23 Nov', tone: 'warn', status: 'CAPA' },
    { id: 'AUD-04', area: 'Frozen F1',  item: 'Lantai epoxy bebas genangan air & licin es',           pts: '10 / 10', finding: 'Bersih, kering, marka keselamatan jelas',    pic: 'Tim Sanitasi', due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-05', area: 'Ante-Room',  item: 'Saluran drainase stainless bersih tanpa bau',          pts: '9 / 10',  finding: 'Perangkap lemak dibersihkan rutin harian',   pic: 'Tim Sanitasi', due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-06', area: 'Rak F1–F4',  item: 'Pallet plastik HDPE (nol pallet kayu di cold-room)',   pts: '9 / 10',  finding: '100% pallet HDPE biru, 2 unit retak tepi',   pic: 'Admin Stok',   due: '26 Nov', tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-07', area: 'Dock 1–4',   item: 'Perangkap serangga UV & umpan tikus berlabel peta',    pts: '8 / 10',  finding: '1 lampu UV Dock 4 redup, jadwal ganti',      pic: 'Vendor Pest',  due: '25 Nov', tone: 'info', status: 'Pantau' },
    { id: 'AUD-08', area: 'Karantina',  item: 'Zona barang rusak/exp terpisah & terkunci QA',         pts: '9 / 10',  finding: 'Segel fisik & label merah terpasang rapi',   pic: 'QA Cabang',    due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-09', area: 'Personel',   item: 'Jaket termal, sepatu anti-slip & sarung tangan bersih',pts: '9 / 10',  finding: '14/15 operator patuh; 1 APD pengganti dicuci',pic: 'HRGA Cabang', due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-10', area: 'Dokumentasi',item: 'Log pembersihan mingguan & swab ATP mikrobiologi',     pts: '8 / 10',  finding: 'Swab meja staging < 30 RLU (memenuhi BPOM)', pic: 'QA Cabang',    due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-11', area: 'Kalibrasi',  item: 'Termometer probe QA & logger truk terkalibrasi KAN',   pts: '9 / 10',  finding: 'Sertifikat #KAN-26-0842 aktif hingga Okt 27', pic: 'QA Cabang',    due: '-',      tone: 'ok',   status: 'Lulus' },
    { id: 'AUD-12', area: 'Mesin HVAC', item: 'Kebersihan ruang kompresor, kondensor & drain air',    pts: '8 / 10',  finding: 'Kondensor bebas debu, filter oli bersih',     pic: 'Teknisi HVAC', due: '-',      tone: 'ok',   status: 'Lulus' },
  ];

  const bodyHtml = `
    <div class="cg-grid" style="grid-template-columns:340px 1fr 345px;flex:1;">
      <!-- Left: 6 HACCP Pillars & Open Audit Queue -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head" style="background:#fff1f2;border-bottom-color:#fecdd3;">
            <div class="e-panel-title" style="color:#881337;">${ic('shield', 13, '#be123c')} Skor Audit BR-17 Medan</div>
            <span class="mono" style="font-size:13px;font-weight:800;color:#be123c;">78 / 100</span>
          </div>
          <div class="e-panel-body" style="padding:9px 11px;display:flex;flex-direction:column;gap:8px;">
            <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;padding:7px 9px;font-size:10px;">
              <div class="cg-kv"><span class="cg-kv-k">No. Audit HACCP</span><span class="cg-kv-v mono">HACCP-2026-11-MDN17</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Auditor QA Pusat</span><span class="cg-kv-v">drh. Rina Marlina, MP</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Tanggal Inspeksi</span><span class="cg-kv-v mono">19 Nov 2026 · 08:30 WIB</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Ambang Lulus CPPOB</span><span class="cg-kv-v mono" style="color:#be123c;">Min. 85 / 100 (Tidak Lulus)</span></div>
            </div>
            <div style="font-size:10.3px;font-weight:700;color:#0f172a;">Rincian 6 Pilar Kebersihan Gudang Dingin</div>
            ${pillars.map((p) => `<div>
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;margin-bottom:2px;">
                <span style="font-weight:600;color:#1e293b;">${esc(p.code)} · ${esc(p.name)}</span>
                <span class="mono" style="font-weight:700;color:${p.tone === 'bad' ? '#be123c' : p.tone === 'warn' ? '#b45309' : '#047857'};">${p.score}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="flex:1;height:6px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
                  <div style="width:${p.score}%;height:100%;background:${p.tone === 'bad' ? '#be123c' : p.tone === 'warn' ? '#d97706' : '#047857'};"></div>
                </div>
                <span class="mono" style="font-size:9px;color:#64748b;width:34px;text-align:right;">${p.weight}%</span>
              </div>
            </div>`).join('')}
          </div>
        </section>

        <section class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('clock', 13, '#0369a1')} Cabang Audit Terbuka & Re-Audit</div>
            ${badge('2 Terbuka', 'bad')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup><col style="width:54px;"><col><col style="width:46px;"><col style="width:76px;"></colgroup>
              <thead><tr><th>Kode</th><th>Cabang</th><th class="num">Skor</th><th>Status</th></tr></thead>
              <tbody>
                <tr class="is-selected"><td class="mono" style="font-weight:700;">BR-17</td><td style="font-weight:600;">Medan Tj. Morawa</td><td class="num mono" style="color:#be123c;font-weight:700;">78</td><td>${badge('Terbuka', 'bad')}</td></tr>
                <tr class="is-bad"><td class="mono" style="font-weight:700;">BR-18</td><td style="font-weight:600;">Pontianak S. Raya</td><td class="num mono" style="color:#be123c;font-weight:700;">78</td><td>${badge('Terbuka', 'bad')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">BR-16</td><td>Pekanbaru Tenayan</td><td class="num mono">86</td><td>${badge('Verifikasi', 'info')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">BR-15</td><td>Palembang Alang</td><td class="num mono">87</td><td>${badge('Lulus', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">BR-14</td><td>Makassar KIMA</td><td class="num mono">88</td><td>${badge('Lulus', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">BR-13</td><td>Manado Bitung</td><td class="num mono">92</td><td>${badge('Lulus', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">BR-12</td><td>Samarinda Palaran</td><td class="num mono">93</td><td>${badge('Lulus', 'ok')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Center: 12-Item HACCP Inspection Checklist + CAPA Action Plan -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#0369a1')} Checklist Inspeksi Kebersihan & Tindakan Korektif (CAPA)</div>
          <div style="display:flex;gap:6px;">
            ${badge('1 Kritis', 'bad')}
            ${badge('2 CAPA Mayor', 'warn')}
            ${badge('8 Lulus', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.3px;">
            <colgroup>
              <col style="width:58px;"><col style="width:74px;"><col style="width:236px;"><col style="width:60px;">
              <col><col style="width:86px;"><col style="width:56px;"><col style="width:66px;">
            </colgroup>
            <thead>
              <tr>
                <th>Item</th><th>Zona</th><th>Kriteria Audit HACCP / BPOM CPPOB</th><th class="num">Nilai</th>
                <th>Temuan Lapangan Auditor</th><th>PIC</th><th>Batas</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${checklist.map((c) => `<tr class="${c.tone === 'bad' ? 'is-bad' : c.tone === 'warn' ? 'is-warn' : ''}">
                <td class="mono" style="font-weight:700;color:#075985;">${esc(c.id)}</td>
                <td style="font-weight:600;">${esc(c.area)}</td>
                <td style="font-weight:600;">${esc(c.item)}</td>
                <td class="num mono" style="font-weight:700;">${esc(c.pts)}</td>
                <td style="color:#334155;">${esc(c.finding)}</td>
                <td>${esc(c.pic)}</td>
                <td class="mono">${esc(c.due)}</td>
                <td>${badge(c.status, c.tone)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          <!-- CAPA Summary & Swab Lab Panel below checklist -->
          <div style="margin-top:auto;padding:10px 12px;background:#f8fafc;border-top:1px solid #cbd5e1;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;">
              <div style="font-size:10.5px;font-weight:700;color:#be123c;margin-bottom:4px;">${ic('alert', 12, '#be123c')} Instruksi CAPA Wajib #MDN-09 (SLA 48 Jam)</div>
              <div style="font-size:10px;color:#334155;line-height:1.45;">
                1. Ganti karet gasket magnetik pintu chiller D-03 (sparepart dikirim dari Hub Jakarta via kargo udara 22 Nov).<br/>
                2. Jalankan siklus manual hot-gas defrost EV-02 & kalibrasi ulang sensor defrost.<br/>
                3. Unggah foto perbaikan ber-GPS untuk penutupan status Audit Terbuka.
              </div>
            </div>
            <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;">
              <div style="font-size:10.5px;font-weight:700;color:#047857;margin-bottom:4px;">${ic('check', 12, '#047857')} Hasil Uji Swab ATP & Mikrobiologi BPOM</div>
              <div class="cg-kv"><span class="cg-kv-k">Meja Staging Dairy (RLU)</span><span class="cg-kv-v mono" style="color:#047857;">18 RLU (Batas &lt; 30)</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Handle Pintu Frozen F1</span><span class="cg-kv-v mono" style="color:#047857;">22 RLU (Lulus)</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Uji E. coli / Listeria Lantai</span><span class="cg-kv-v mono" style="color:#047857;">Negatif / 25 cm²</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Dampak ke KPI BR-17</span><span class="cg-kv-v mono" style="color:#be123c;">-4,8 pts hingga CAPA tutup</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right: Verified EXIF/GPS Field Photo Evidence Plates -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#0369a1')} Bukti Foto Lapangan (EXIF + GPS)</div>
          ${badge('SHA-256 Valid', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:9px;">
          ${svgEvidencePhotoPlate({
            type: 'gasket',
            title: '1. Karet Pintu Chiller D-03 Sobek (18 cm)',
            stamp: '3.5412°N 98.7841°E · 19 Nov 08:42 WIB · IMG_MDN_881',
            badgeText: 'AUD-01 · KRITIS',
            badgeColor: '#be123c',
          })}
          ${svgEvidencePhotoPlate({
            type: 'frost',
            title: '2. Penumpukan Bunga Es Evaporator EV-02',
            stamp: '3.5411°N 98.7840°E · 19 Nov 08:54 WIB · IMG_MDN_884',
            badgeText: 'AUD-03 · CAPA MAYOR',
            badgeColor: '#b45309',
          })}
          ${svgEvidencePhotoPlate({
            type: 'floor',
            title: '3. Lantai Epoxy & Drainase Zona Frozen F1',
            stamp: '3.5413°N 98.7842°E · 19 Nov 09:08 WIB · IMG_MDN_889',
            badgeText: 'AUD-04 · LULUS',
            badgeColor: '#047857',
          })}
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeSlug: 'p5',
    title: 'Audit Kebersihan HACCP & Bukti Foto Lapangan',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11, '#334155')} Cetak Laporan HACCP</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Verifikasi Bukti CAPA</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 6: BERITA ACARA PEMUSNAHAN & MATRIKS PERSETUJUAN DoA PUSAT
// ============================================================================
function renderPage6() {
  const steps = [
    { n: 'TAHAP 1 · MAKER',       role: 'Kepala Cabang BR-14',    who: 'Hendra Kusuma, SE',   time: '19 Nov 09:15 WITA', state: 'done', badge: 'Diajukan' },
    { n: 'TAHAP 2 · SAKSI QA',    role: 'QA HACCP Regional Sul',  who: 'drh. Arif Budiman',   time: '19 Nov 11:40 WITA', state: 'done', badge: 'Terverifikasi' },
    { n: 'TAHAP 3 · CHECKER FIN', role: 'Finance Controller HQ',  who: 'Sinta Permata, Ak',   time: '19 Nov 16:05 WIB',  state: 'done', badge: 'HPP Sah' },
    { n: 'TAHAP 4 · APPROVER',    role: 'Direktur Operasional',   who: 'Ir. Bambang Wibowo',  time: 'SLA: 6 jam lagi',   state: 'curr', badge: 'Menunggu Teken' },
    { n: 'TAHAP 5 · EKSEKUSI',    role: 'Vendor Incinerator KLHK',who: 'PT Jasa Limbah Medis',time: 'Menunggu Tahap 4',  state: 'wait', badge: 'Terjadwal' },
  ];

  const doaRows = [
    { tier: 'Tier 1 (< Rp 10 Jt)',       maker: 'Admin Gudang',   checker: 'Ka. Cabang + QA Reg', approver: 'Regional Ops Mgr', sla: '24 Jam', witness: 'Foto + GPS',     active: false },
    { tier: 'Tier 2 (Rp 10 – 50 Jt)',    maker: 'Kepala Cabang',  checker: 'QA + Finance HQ',     approver: 'Direktur Operasional', sla: '36 Jam', witness: 'QA + Fin + BA', active: true },
    { tier: 'Tier 3 (Rp 50 – 250 Jt)',   maker: 'Regional Mgr',   checker: 'VP QA + Tax Controller', approver: 'Dir Ops + CFO',  sla: '48 Jam', witness: 'Notaris / KLHK', active: false },
    { tier: 'Tier 4 (> Rp 250 Jt)',      maker: 'VP Cold-Chain',  checker: 'Komite Audit + Legal',approver: 'Direktur Utama',   sla: '72 Jam', witness: 'BPOM + Pajak',   active: false },
  ];

  const bodyHtml = `
    <!-- 5-Stage DoA Approval Stepper -->
    <div class="cg-stepper">
      ${steps.map((s) => `<div class="cg-step ${s.state}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="mono" style="font-size:9px;font-weight:700;color:${s.state === 'curr' ? '#0369a1' : s.state === 'done' ? '#047857' : '#64748b'};">${esc(s.n)}</span>
          ${badge(s.badge, s.state === 'done' ? 'ok' : s.state === 'curr' ? 'warn' : 'neutral')}
        </div>
        <div style="font-size:11px;font-weight:700;color:#0f172a;">${esc(s.role)}</div>
        <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#475569;">
          <span>${esc(s.who)}</span>
          <span class="mono">${esc(s.time)}</span>
        </div>
      </div>`).join('')}
    </div>

    <div class="cg-grid" style="grid-template-columns:1.32fr 1fr;flex:1;">
      <!-- Left: Formal BA Dossier + National Queue -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head" style="background:#e0f2fe;border-bottom-color:#bae6fd;">
            <div class="e-panel-title" style="color:#075985;">${ic('fileText', 13, '#0369a1')} Draf Resmi Berita Acara Pemusnahan — #EXT-2026-114</div>
            <div style="display:flex;gap:6px;">
              ${badge('Tier 2 DoA (Rp 10–50 Jt)', 'accent')}
              ${badge('Menunggu Teken Dir Ops', 'warn')}
            </div>
          </div>
          <div class="e-panel-body" style="padding:10px 12px;display:flex;flex-direction:column;gap:8px;">
            <div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:3px;padding:9px 11px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-bottom:6px;">
                <div>
                  <div style="font-size:12px;font-weight:800;color:#0f172a;">BERITA ACARA PEMUSNAHAN BARANG BEKU / DAIRY</div>
                  <div class="mono" style="font-size:10px;color:#0369a1;font-weight:700;">Nomor: BA/EXT-2026-114/BR-14-MKS/XI/2026</div>
                </div>
                <div style="text-align:right;font-size:9.8px;color:#475569;">
                  <div>Dasar Regulasi: PerBPOM 21/2021 &amp; PSAK 14</div>
                  <div class="mono">Hash Draf: sha256:4a9b...e812</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:10.3px;">
                <div class="cg-kv"><span class="cg-kv-k">Cabang Pelapor</span><span class="cg-kv-v">BR-14 Makassar KIMA</span></div>
                <div class="cg-kv"><span class="cg-kv-k">SKU &amp; Nomor Batch</span><span class="cg-kv-v mono">DRY-UHT-1000 · #L902</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Nama Produk</span><span class="cg-kv-v">Diamond UHT Full Cream 1L</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Tanggal Kedaluwarsa</span><span class="cg-kv-v mono" style="color:#be123c;">14 Nov 2026</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Kuantitas Dimusnahkan</span><span class="cg-kv-v mono">240 kg (20 Karton / 240 Pak)</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Nilai HPP (PSAK 14)</span><span class="cg-kv-v mono" style="color:#be123c;">Rp 28.800.000</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Metode Pemusnahan</span><span class="cg-kv-v">Incinerator Berizin KLHK (Makassar)</span></div>
                <div class="cg-kv"><span class="cg-kv-k">Koreksi PPN CoreTax</span><span class="cg-kv-v mono">Rp 3.168.000 (11%)</span></div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.5px;font-weight:700;color:#047857;">SAKSI 1 · QA REGIONAL</div>
                <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-top:2px;">drh. Arif Budiman</div>
                <div class="mono" style="font-size:9px;color:#047857;">TTE Sah · 19 Nov 11:40</div>
              </div>
              <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.5px;font-weight:700;color:#047857;">SAKSI 2 · FINANCE HQ</div>
                <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-top:2px;">Sinta Permata, Ak., CA</div>
                <div class="mono" style="font-size:9px;color:#047857;">TTE Sah · 19 Nov 16:05</div>
              </div>
              <div style="border:1.5px solid #0369a1;background:#f0f9ff;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.5px;font-weight:700;color:#0369a1;">APPROVER · DIR OPS</div>
                <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-top:2px;">Ir. Bambang Wibowo</div>
                <div class="mono" style="font-size:9px;color:#b45309;font-weight:700;">Menunggu Teken PIN/TSE</div>
              </div>
            </div>

            <div style="border:1px solid #cbd5e1;background:#ffffff;border-radius:3px;padding:7px 10px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:10px;">
              <div>
                <div style="color:#64748b;font-size:9.3px;">Posting Jurnal PSAK 14 Otomatis</div>
                <div class="mono" style="font-weight:700;color:#0f172a;margin-top:2px;">DR 5104-02 / CR 1105-01</div>
                <div style="color:#475569;font-size:9.2px;">Rp 28.800.000 (Cost Ctr CC-MKS-14)</div>
              </div>
              <div>
                <div style="color:#64748b;font-size:9.3px;">Dampak KPI Cabang BR-14</div>
                <div class="mono" style="font-weight:700;color:#b45309;margin-top:2px;">-3,2 pts (Stok 98,80%)</div>
                <div style="color:#475569;font-size:9.2px;">Tercatat pada rapor Nov 2026</div>
              </div>
              <div>
                <div style="color:#64748b;font-size:9.3px;">Kepatuhan Fiskal CoreTax</div>
                <div class="mono" style="font-weight:700;color:#047857;margin-top:2px;">Deductible (Ps. 6 UU PPh)</div>
                <div style="color:#475569;font-size:9.2px;">Koreksi PPN 11%: Rp 3.168.000</div>
              </div>
            </div>

            <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid #cbd5e1;">
              <span style="font-size:10px;color:#475569;">Lampiran terverifikasi: <strong>4 Foto Segel QRT-01</strong> · <strong>CoA Pabrik</strong> · <strong>Manifest KLHK</strong></span>
              <div style="display:flex;gap:6px;">
                <span class="e-btn e-btn-danger">${ic('alert', 11, '#be123c')} Kembalikan Revisi</span>
                <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Teken &amp; Setujui BA #114</span>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:282px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#0369a1')} Registri BA Pemusnahan Nasional (Q4 2026)</div>
            <span class="e-panel-sub">2 Aktif (${ACTIVE_BA_KG} kg · ${fmtIdr(ACTIVE_BA_HPP)}) · 5 Selesai</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:94px;"><col style="width:76px;"><col style="width:142px;"><col style="width:154px;">
                <col style="width:56px;"><col style="width:92px;"><col style="width:120px;">
              </colgroup>
              <thead>
                <tr><th>No. BA</th><th>Tanggal</th><th>Cabang</th><th>Produk &amp; Batch</th><th class="num">Berat</th><th class="num">Nilai HPP</th><th>Tahap</th></tr>
              </thead>
              <tbody>
                ${BA_RECORDS.map((r) => `<tr class="${r.selected ? 'is-selected' : r.active ? 'is-warn' : ''}">
                  <td class="mono" style="font-weight:700;color:#075985;">#${esc(r.no)}</td>
                  <td class="mono">${esc(r.date)}</td>
                  <td style="font-weight:600;">${esc(r.branch)}</td>
                  <td>${esc(r.sku)}</td>
                  <td class="num mono">${fmtNum(r.kg)} kg</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(r.hpp)}</td>
                  <td>${badge(r.stage, r.tone)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Right: DoA Matrix, Segregation of Duties & Escalation Rules -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#0369a1')} Matriks Delegation of Authority (DoA) Pemusnahan</div>
            ${badge('SK Direksi 08/2026', 'neutral')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup><col style="width:130px;"><col style="width:118px;"><col style="width:118px;"><col style="width:56px;"><col></colgroup>
              <thead><tr><th>Pagu Nilai HPP</th><th>Checker Wajib</th><th>Approver Akhir</th><th>SLA</th><th>Bukti</th></tr></thead>
              <tbody>
                ${doaRows.map((d) => `<tr class="${d.active ? 'is-selected' : ''}">
                  <td style="font-weight:700;color:${d.active ? '#075985' : '#0f172a'};">${esc(d.tier)}</td>
                  <td>${esc(d.checker)}</td>
                  <td style="font-weight:600;">${esc(d.approver)}</td>
                  <td class="mono">${esc(d.sla)}</td>
                  <td style="color:#475569;">${esc(d.witness)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;background:#f8fafc;border-top:1px solid #cbd5e1;font-size:10px;color:#334155;line-height:1.4;">
              <strong>Segregation of Duties (SoD):</strong> Maker (Kepala Cabang) dilarang keras merangkap Checker QA atau Approver. Sistem WPF memblokir tombol persetujuan jika NIK approver sama dengan pengaju.
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('users', 13, '#0369a1')} Detail Antrean Aktif #EXT-2026-115 &amp; Aturan Eskalasi</div>
            ${badge('2/2 Dalam SLA', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:9px 11px;display:flex;flex-direction:column;gap:9px;">
            <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:3px;padding:8px 10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="mono" style="font-weight:700;color:#92400e;">#EXT-2026-115 · BR-15 Palembang Alang-Alang</span>
                ${badge('Verifikasi Finance', 'warn')}
              </div>
              <div style="font-size:10.2px;color:#78350f;line-height:1.4;">
                <strong>115 kg Anchor Unsalted Butter Block 5kg (#L887)</strong> · HPP <span class="mono" style="font-weight:700;">Rp 12.720.000</span>.<br/>
                Penyebab: Kegagalan unit pendingin truk reefer lintas Sumatera (+7,2 °C selama 6 jam). Menunggu validasi klaim asuransi transit oleh Finance HQ sebelum eskalasi ke Dir Ops.
              </div>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;background:#ffffff;">
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-bottom:5px;">Kebijakan Eskalasi SLA Otomatis &amp; Delegasi Cuti</div>
              <div class="cg-kv"><span class="cg-kv-k">Peringatan SLA 75%</span><span class="cg-kv-v">Notifikasi WPF + Email ke Approver</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Breach SLA &gt; 36 Jam</span><span class="cg-kv-v">Auto-eskalasi ke CFO &amp; Audit Internal</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Delegasi Aktif Dir Ops</span><span class="cg-kv-v">Tidak aktif (Approver hadir di HQ)</span></div>
              <div class="cg-kv"><span class="cg-kv-k">Retensi Arsip BA + Foto</span><span class="cg-kv-v mono">10 Tahun (WORM · UU KUP)</span></div>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:3px;padding:8px 10px;background:#f8fafc;margin-top:auto;">
              <div style="font-size:10.3px;font-weight:700;color:#0f172a;margin-bottom:4px;">Jejak Verifikasi Digital (#EXT-2026-114)</div>
              <div class="mono" style="font-size:9.3px;color:#334155;line-height:1.5;">
                19/11 09:15 [SUBMIT] BR-14 Hendra Kusuma (IP 10.14.2.18)<br/>
                19/11 11:40 [QA-OK ] drh. Arif Budiman · 4 foto GPS cocok<br/>
                19/11 16:05 [FIN-OK] Sinta Permata · HPP FIFO Rp 28.800.000<br/>
                22/11 21:14 [QUEUE ] Menunggu tanda tangan Dir Ops HQ
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p6',
    title: 'Berita Acara Pemusnahan & Matriks DoA Pusat',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11, '#334155')} Pratinjau PDF Resmi</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Teken Digital BA #114</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 7: JURNAL PSAK 14, VALUASI STOK & PAJAK CORETAX
// ============================================================================
function renderPage7() {
  const sumDebit = PSAK_JOURNAL.reduce((a, j) => a + j.debit, 0);
  const sumCredit = PSAK_JOURNAL.reduce((a, j) => a + j.credit, 0);

  const coreTaxXml = `&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;CoreTaxInventoryWriteOff xmlns="urn:djp:coretax:pmk81:2024"&gt;
  &lt;TaxpayerNPWP&gt;0130849210920000&lt;/TaxpayerNPWP&gt;
  &lt;FiscalPeriod&gt;2026-11&lt;/FiscalPeriod&gt;
  &lt;DocumentRef&gt;BA/EXT-2026-114/BR-14-MKS/XI/2026&lt;/DocumentRef&gt;
  &lt;WriteOffReason code="EXP_COLDCHAIN"&gt;Kedaluwarsa Pangan Beku&lt;/WriteOffReason&gt;
  &lt;BatchList count="2" totalWeightKg="355"&gt;
    &lt;Item sku="DRY-UHT-1000" batch="L902" hppIdr="28800000" vatAdjIdr="3168000"/&gt;
    &lt;Item sku="DRY-BTR-5000" batch="L887" hppIdr="12720000" vatAdjIdr="1399200"/&gt;
  &lt;/BatchList&gt;
  &lt;FiscalDeductibility&gt;DEDUCTIBLE_PS6_UUPPH&lt;/FiscalDeductibility&gt;
  &lt;WitnessDigest&gt;sha256:4a9b71c0e44f8210d9a3e812&lt;/WitnessDigest&gt;
&lt;/CoreTaxInventoryWriteOff&gt;`;

  const bodyHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      ${renderKpiCard({ label: 'Valuasi Stok Cold-Chain', value: `Rp ${TOTAL_VAL_M.toFixed(2).replace('.', ',')} M`, sub: 'Metode FIFO / NRV (PSAK 14)', tone: 'info', delta: '18 Cabang' })}
      ${renderKpiCard({ label: 'Beban Selisih Opname Nov', value: fmtIdr(TOTAL_VAR_RP), sub: 'Termasuk BA #114 & #115 + 12 batch', tone: 'warn', delta: '0,064% Stok' })}
      ${renderKpiCard({ label: 'Nilai HPP BA Pemusnahan', value: fmtIdr(ACTIVE_BA_HPP), sub: '2 batch aktif (355 kg) · Deductible', tone: 'warn', delta: 'BA #114/#115' })}
      ${renderKpiCard({ label: 'Koreksi PPN CoreTax (11%)', value: fmtIdr(ACTIVE_BA_PPN), sub: 'PMK 81/2024 · Nota Koreksi Pajak', tone: 'info', delta: 'XML Siap' })}
      ${renderKpiCard({ label: 'Total Posting Jurnal PSAK', value: fmtIdr(sumDebit), sub: 'Debit = Kredit · Status: Balanced', tone: 'ok', delta: 'BALANCED' })}
    </div>

    <div class="cg-grid" style="grid-template-columns:1.38fr 1fr;height:430px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#0369a1')} Jurnal Umum Otomatis — PSAK 14 Penurunan Nilai &amp; Pemusnahan Persediaan</div>
          <div style="display:flex;gap:6px;">
            <span class="mono" style="font-size:10px;color:#475569;">Doc: JV-2026-11-0482</span>
            ${badge('Debit = Kredit OK', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table compact">
            <colgroup>
              <col style="width:36px;"><col style="width:68px;"><col><col style="width:82px;"><col style="width:68px;">
              <col style="width:106px;"><col style="width:106px;">
            </colgroup>
            <thead>
              <tr>
                <th>No</th><th>Akun GL</th><th>Nama Akun &amp; Keterangan Posting</th><th>Cost Ctr</th><th>Ref</th>
                <th class="num">Debit (Rp)</th><th class="num">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${PSAK_JOURNAL.map((j) => `<tr ${j.debit > 0 ? '' : 'style="background:#fafcfe;"'}>
                <td class="mono" style="color:#64748b;">${esc(j.line)}</td>
                <td class="mono" style="font-weight:700;color:#075985;">${esc(j.acct)}</td>
                <td style="font-weight:${j.debit > 0 ? '600' : '500'};padding-left:${j.credit > 0 ? '18px' : '6px'};">${esc(j.name)}</td>
                <td class="mono" style="font-size:9.8px;">${esc(j.cc)}</td>
                <td class="mono" style="color:#475569;">${esc(j.ref)}</td>
                <td class="num mono" style="font-weight:${j.debit > 0 ? '700' : '400'};color:${j.debit > 0 ? '#0f172a' : '#94a3b8'};">${j.debit > 0 ? fmtIdr(j.debit) : '-'}</td>
                <td class="num mono" style="font-weight:${j.credit > 0 ? '700' : '400'};color:${j.credit > 0 ? '#0369a1' : '#94a3b8'};">${j.credit > 0 ? fmtIdr(j.credit) : '-'}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL JURNAL PENYESUAIAN PERSEDIAAN COLD-CHAIN (NOV 2026)</td>
                <td class="num mono">${fmtIdr(sumDebit)}</td>
                <td class="num mono">${fmtIdr(sumCredit)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:auto;padding:7px 10px;background:#f0f9ff;border-top:1px solid #bae6fd;display:flex;justify-content:space-between;align-items:center;font-size:10px;">
            <span style="color:#075985;"><strong>Sinkronisasi SAP FICO / Accurate:</strong> Batch GL siap dikirim setelah BA #EXT-2026-114 ditandatangani Dir Ops.</span>
            <span class="mono" style="color:#047857;font-weight:700;">Selisih: Rp 0</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#0369a1')} Payload Kepatuhan Pajak CoreTax XML (PMK 81/2024)</div>
          ${badge('XSD Valid v2.1', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
          <div class="cg-code-box">${coreTaxXml}</div>
          <div style="border:1px solid #cbd5e1;border-radius:3px;padding:7px 9px;background:#f8fafc;">
            <div style="font-size:10.3px;font-weight:700;color:#0f172a;margin-bottom:4px;">Prasyarat Biaya Pemusnahan Diakui Fiskal (Ps. 6 UU PPh)</div>
            <div class="cg-kv"><span class="cg-kv-k">Berita Acara Bertanda Tangan Lengkap</span><span class="cg-kv-v" style="color:#b45309;">3/4 Saksi &amp; Approver</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Daftar Nominatif Batch + HPP FIFO</span><span class="cg-kv-v" style="color:#047857;">Terlampir (2 Batch)</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Dokumentasi Foto &amp; Manifest KLHK</span><span class="cg-kv-v" style="color:#047857;">Terverifikasi SHA-256</span></div>
            <div class="cg-kv"><span class="cg-kv-k">Status Faktur Koreksi PPN Masukan</span><span class="cg-kv-v mono" style="color:#0369a1;">Draft CoreTax Siap Unggah</span></div>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom: Inventory Valuation Reconciliation by Frozen Category -->
    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('database', 13, '#0369a1')} Rekonsiliasi Valuasi Persediaan Cold-Chain per Kategori Produk (18 Cabang)</div>
        <span class="e-panel-sub">Cocok 100% dengan Total Aset Persediaan Rp ${TOTAL_VAL_M.toFixed(2).replace('.', ',')} Miliar</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table compact">
          <colgroup>
            <col style="width:74px;"><col style="width:240px;"><col style="width:70px;"><col style="width:94px;">
            <col style="width:128px;"><col style="width:150px;"><col style="width:140px;"><col style="width:96px;"><col>
          </colgroup>
          <thead>
            <tr>
              <th>Kode</th><th>Kategori Produk Cold-Chain</th><th class="num">SKU</th><th class="num">Tonase (Ton)</th>
              <th class="num">Valuasi (Rp M)</th><th>Porsi Nilai Persediaan</th><th>Rentang Suhu SOP</th>
              <th class="num">Susut MTD</th><th>Status NRV PSAK 14</th>
            </tr>
          </thead>
          <tbody>
            ${CATEGORY_VALUATION.map((c) => `<tr>
              <td class="mono" style="font-weight:700;color:#075985;">${esc(c.code)}</td>
              <td style="font-weight:600;">${esc(c.name)}</td>
              <td class="num mono">${c.skus}</td>
              <td class="num mono">${fmtNum(c.tons)} ton</td>
              <td class="num mono" style="font-weight:700;">Rp ${c.valM.toFixed(2).replace('.', ',')} M</td>
              <td>${renderCapacityBar(c.sharePct * 3.1, { warnAt: 95, critAt: 99, showLabel: false })}</td>
              <td class="mono" style="color:#0369a1;">${esc(c.tempBand)}</td>
              <td class="num mono" style="color:${c.shrinkPct > 0.30 ? '#b45309' : '#047857'};font-weight:600;">${fmtPct(c.shrinkPct, 2)}</td>
              <td>${badge(c.shrinkPct > 0.30 ? 'Cadangan NRV Aktif' : 'NRV Normal', c.shrinkPct > 0.30 ? 'warn' : 'ok')}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">TOTAL PERSEDIAAN NASIONAL (18 CABANG)</td>
              <td class="num mono">${CATEGORY_VALUATION.reduce((a, c) => a + c.skus, 0)}</td>
              <td class="num mono">${fmtNum(CATEGORY_VALUATION.reduce((a, c) => a + c.tons, 0))} ton</td>
              <td class="num mono">Rp ${TOTAL_VAL_M.toFixed(2).replace('.', ',')} M</td>
              <td class="mono">100,0%</td>
              <td colspan="3" style="text-align:right;color:#047857;">Terekonsiliasi dengan Buku Besar GL 1105-XX</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  `;

  return renderShell({
    activeSlug: 'p7',
    title: 'Jurnal PSAK 14, Valuasi Stok & Pajak CoreTax',
    actionsHtml: `
      <span class="e-btn">${ic('code', 11, '#334155')} Ekspor CoreTax XML</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Posting Jurnal ke GL</span>
    `,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 8: IMPOR EXCEL EPPLUS, AUDIT TRAIL WORM SHA-256 & SYNC CABANG
// ============================================================================
function renderPage8() {
  const excelRows = [
    { row: 1,     branch: 'BR-01', sku: 'DRY-UHT-1000', batch: 'L944', qty: '1.420 kg', exp: '18 Mei 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 2,     branch: 'BR-02', sku: 'CHZ-MOZ-2000', batch: 'L943', qty: '2.180 kg', exp: '04 Apr 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 3,     branch: 'BR-04', sku: 'MET-SHP-2000', batch: 'L941', qty: '960 kg',   exp: '22 Mar 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 1840,  branch: 'BR-05', sku: 'DRY-YGT-1000', batch: 'L939', qty: '740 kg',   exp: '12 Des 26', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 4128,  branch: 'BR-14', sku: 'DRY-UHT-1000', batch: 'L902', qty: '240 kg',   exp: '14 Nov 26', status: 'Flag FEFO', tone: 'warn', msg: 'Batch kedaluwarsa -> auto-routing BA' },
    { row: 6410,  branch: 'BR-08', sku: 'CHZ-CHD-2000', batch: 'L911', qty: '1.613 kg', exp: '09 Mar 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 7812,  branch: 'BR-15', sku: 'DRY-BTR-5000', batch: 'L887', qty: '115 kg',   exp: '29 Nov 26', status: 'Flag FEFO', tone: 'warn', msg: 'Hold QA excursion -> auto-routing BA' },
    { row: 9520,  branch: 'BR-09', sku: 'SEA-SHR-1000', batch: 'L915', qty: '1.289 kg', exp: '15 Feb 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 11204, branch: 'BR-17', sku: 'SEA-DOR-9999', batch: 'L950', qty: '80 kg',    exp: '11 Feb 27', status: 'Ditolak',   tone: 'bad',  msg: 'ERR_SKU_404: Kode SKU tak terdaftar' },
    { row: 13110, branch: 'BR-10', sku: 'MET-CHK-2000', batch: 'L918', qty: '1.826 kg', exp: '28 Jan 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 14910, branch: 'BR-18', sku: 'ICE-BLK-8000', batch: 'L929', qty: '-12 kg',   exp: '01 Jan 24', status: 'Ditolak',   tone: 'bad',  msg: 'ERR_QTY_NEG: Qty negatif & Exp invalid' },
    { row: 16200, branch: 'BR-06', sku: 'POT-WDG-2000', batch: 'L905', qty: '1.500 kg', exp: '14 Apr 27', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 17840, branch: 'BR-03', sku: 'DRY-MLK-1000', batch: 'L901', qty: '1.840 kg', exp: '05 Des 26', status: 'Valid',     tone: 'ok',   msg: 'Cocok master SKU · Dapper bulk OK' },
    { row: 18420, branch: 'BR-12', sku: 'POT-FFR-2500', batch: 'L925', qty: '2.098 kg', exp: '19 Feb 27', status: 'Valid',     tone: 'ok',   msg: 'Baris akhir selesai · 2,56 detik total' },
  ];

  const wormLogs = [
    { ts: '22 Nov 21:12:04', actor: 'SYSTEM-EPPLUS', action: 'BULK_IMPORT_COMMIT',  target: 'XLS-20261120-088 (18.418 OK / 2 Err)', hash: '8f4c19...d29a', prev: '7a2e01...9b14', ok: true },
    { ts: '22 Nov 20:48:19', actor: 'B. Wibowo',     action: 'KPI_RANK_PREVIEW',    target: 'Periode Nov 2026 · 18 Cabang',         hash: '7a2e01...9b14', prev: '3d91b4...6e02', ok: true },
    { ts: '20 Nov 16:32:11', actor: 'T. Ismail',     action: 'BA_DESTROY_SUBMIT',   target: '#EXT-2026-115 (BR-15 · 115 kg)',       hash: '3d91b4...6e02', prev: '9c04e8...11f7', ok: true },
    { ts: '19 Nov 16:05:44', actor: 'S. Permata',    action: 'BA_FINANCE_VERIFY',   target: '#EXT-2026-114 (HPP Rp 28,8 Jt)',       hash: '9c04e8...11f7', prev: '5b82f1...a30c', ok: true },
    { ts: '19 Nov 11:40:09', actor: 'A. Budiman',    action: 'BA_QA_WITNESS_SIGN',  target: '#EXT-2026-114 (4 Foto EXIF Sah)',      hash: '5b82f1...a30c', prev: '1e67c9...44d8', ok: true },
    { ts: '19 Nov 09:20:51', actor: 'R. Marlina',    action: 'HACCP_AUDIT_OPEN',    target: 'BR-17 Medan (Skor 78 · Pintu D-03)',   hash: '1e67c9...44d8', prev: '0f33a2...7c19', ok: true },
    { ts: '19 Nov 09:15:02', actor: 'H. Kusuma',     action: 'BA_DESTROY_SUBMIT',   target: '#EXT-2026-114 (BR-14 · 240 kg)',       hash: '0f33a2...7c19', prev: 'a812d0...2e55', ok: true },
    { ts: '18 Nov 17:42:30', actor: 'SYSTEM-HACCP',  action: 'TEMP_ALERT_TRIGGER',  target: 'BR-17 PT100-S5 Chiller +6,9 C',        hash: 'a812d0...2e55', prev: '6c44b9...10a1', ok: true },
    { ts: '18 Nov 14:18:15', actor: 'R. Dewi S.',    action: 'OPNAME_LOCK_BRANCH',  target: 'BR-02 Jakarta Cibitung (0 selisih)',   hash: '6c44b9...10a1', prev: '2d71e5...8f09', ok: true },
    { ts: '18 Nov 11:05:48', actor: 'A. Prasetyo',   action: 'OPNAME_LOCK_BRANCH',  target: 'BR-01 Surabaya Rungkut (0 selisih)',   hash: '2d71e5...8f09', prev: '9a11c3...5b77', ok: true },
  ];

  const hubs = [
    { hub: 'HQ-JKT01 (Cibitung)',   branches: 'BR-02, BR-05, BR-11',          db: 'SQL 2022 Primary', lag: '0 ms',  queue: '0',  sync: '100%', tone: 'ok' },
    { hub: 'HUB-SBY02 (Rungkut)',   branches: 'BR-01, BR-03, BR-07, BR-08',   db: 'AlwaysOn AG-SBY',  lag: '11 ms', queue: '0',  sync: '100%', tone: 'ok' },
    { hub: 'HUB-MDN03 (Sumatera)',  branches: 'BR-09, BR-15, BR-16, BR-17',   db: 'AlwaysOn AG-MDN',  lag: '24 ms', queue: '2',  sync: '99,9%',tone: 'ok' },
    { hub: 'HUB-MKS04 (Sulawesi)',  branches: 'BR-04, BR-13, BR-14',          db: 'AlwaysOn AG-MKS',  lag: '29 ms', queue: '1',  sync: '100%', tone: 'ok' },
    { hub: 'HUB-BPN05 (Kalimantan)',branches: 'BR-06, BR-10, BR-12, BR-18',   db: 'AlwaysOn AG-BPN',  lag: '32 ms', queue: '0',  sync: '100%', tone: 'ok' },
  ];

  const bodyHtml = `
    <!-- Top 4-Stage EPPlus High-Speed Excel Import Pipeline Strip -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
      <div class="e-kpi" style="border-left:3.5px solid #0369a1;">
        <div class="e-kpi-top"><span>TAHAP 1 · EPPlus STREAM PARSER</span>${badge('1,12 dtk', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">18.420 Baris</span><span class="mono" style="color:#0369a1;font-weight:700;">16.446 row/s</span></div>
        <div class="e-kpi-foot"><span>File: StockOpname_18Cabang_Nov26.xlsx (4,8 MB)</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #0284c7;">
        <div class="e-kpi-top"><span>TAHAP 2 · VALIDASI MASTER SKU</span>${badge('0,48 dtk', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">556 SKU</span><span class="mono" style="color:#be123c;font-weight:700;">2 Baris Ditolak</span></div>
        <div class="e-kpi-foot"><span>Auto-karantina baris gagal tanpa batalkan batch</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #d97706;">
        <div class="e-kpi-top"><span>TAHAP 3 · ENGINE FEFO &amp; SELISIH</span>${badge('0,34 dtk', 'warn')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">14 Batch</span><span class="mono" style="color:#b45309;font-weight:700;">2 Flag BA Auto</span></div>
        <div class="e-kpi-foot"><span>Deteksi otomatis batch #L902 &amp; #L887</span></div>
      </div>
      <div class="e-kpi" style="border-left:3.5px solid #047857;">
        <div class="e-kpi-top"><span>TAHAP 4 · DAPPER SqlBulkCopy</span>${badge('0,62 dtk', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">18.418 Masuk</span><span class="mono" style="color:#047857;font-weight:700;">Total 2,56 dtk</span></div>
        <div class="e-kpi-foot"><span>Commit transaksi SQL Server + WORM digest</span></div>
      </div>
    </div>

    <div class="cg-grid" style="grid-template-columns:1.05fr 1fr;flex:1;">
      <!-- Left: EPPlus Bulk Import Preview & Error Quarantine Grid -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#0369a1')} Pratinjau Impor Excel Massal — Batch XLS-20261120-088</div>
          <div style="display:flex;gap:5px;">
            ${badge('18.418 Valid', 'ok')}
            ${badge('2 Ditolak', 'bad')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.3px;">
            <colgroup>
              <col style="width:62px;"><col style="width:52px;"><col style="width:94px;"><col style="width:48px;">
              <col style="width:68px;"><col style="width:74px;"><col style="width:74px;"><col>
            </colgroup>
            <thead>
              <tr>
                <th class="num">Baris</th><th>Cbg</th><th>Kode SKU</th><th>Batch</th>
                <th class="num">Qty</th><th>Exp</th><th>Status</th><th>Hasil Validasi Master SKU</th>
              </tr>
            </thead>
            <tbody>
              ${excelRows.map((r) => `<tr class="${r.tone === 'bad' ? 'is-bad' : r.tone === 'warn' ? 'is-warn' : ''}">
                <td class="num mono" style="color:#64748b;">#${fmtNum(r.row)}</td>
                <td class="mono" style="font-weight:700;color:#075985;">${esc(r.branch)}</td>
                <td class="mono">${esc(r.sku)}</td>
                <td class="mono">${esc(r.batch)}</td>
                <td class="num mono" style="font-weight:600;">${esc(r.qty)}</td>
                <td class="mono">${esc(r.exp)}</td>
                <td>${badge(r.status, r.tone)}</td>
                <td style="color:${r.tone === 'bad' ? '#be123c' : '#334155'};font-weight:${r.tone === 'bad' ? '600' : '400'};">${esc(r.msg)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          <!-- Mapping & Validation Rules Box -->
          <div style="margin-top:auto;padding:10px 12px;background:#f8fafc;border-top:1px solid #cbd5e1;display:flex;flex-direction:column;gap:7px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10.5px;font-weight:700;color:#0f172a;">Konfigurasi Skema Template EPPlus v7.4 (ColdGate_Opname_v4.xlsx)</span>
              <span class="e-btn" style="height:20px;font-size:9.8px;">${ic('download', 10, '#334155')} Unduh 2 Baris Error (.xlsx)</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:9.8px;">
              <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:6px 8px;">
                <div style="color:#64748b;">Validasi Master SKU</div>
                <div style="font-weight:700;color:#047857;margin-top:2px;">Strict FK ke dbo.MasterSKU</div>
              </div>
              <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:6px 8px;">
                <div style="color:#64748b;">Kunci Duplikat Batch</div>
                <div style="font-weight:700;color:#0369a1;margin-top:2px;">Composite (Cabang+SKU+Batch)</div>
              </div>
              <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:6px 8px;">
                <div style="color:#64748b;">Mode Transaksi SQL</div>
                <div style="font-weight:700;color:#0f172a;margin-top:2px;">Partial Commit + Error Queue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right: WORM SHA-256 Immutable Audit Trail + SQL Branch Sync & RBAC -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#0369a1')} WORM Audit Trail SHA-256 (BPOM · HACCP · UU PDP PP 33/2026)</div>
            ${badge('Rantai Hash 100% Utuh', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.2px;">
              <colgroup>
                <col style="width:106px;"><col style="width:104px;"><col style="width:132px;"><col><col style="width:94px;">
              </colgroup>
              <thead>
                <tr><th>Waktu WIB</th><th>Aktor</th><th>Peristiwa</th><th>Objek &amp; Ringkasan</th><th>SHA-256</th></tr>
              </thead>
              <tbody>
                ${wormLogs.map((w) => `<tr>
                  <td class="mono" style="color:#475569;font-size:9.6px;">${esc(w.ts)}</td>
                  <td style="font-weight:600;">${esc(w.actor)}</td>
                  <td class="mono" style="font-size:9.5px;font-weight:700;color:#075985;">${esc(w.action)}</td>
                  <td style="color:#334155;">${esc(w.target)}</td>
                  <td class="mono" style="font-size:9.3px;color:#047857;">${esc(w.hash)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="height:294px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 13, '#0369a1')} Topologi Branch Sync API &amp; SQL Server AlwaysOn (18 Cabang)</div>
            ${badge('5 Hub Regional · 0 Offline', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table compact">
              <colgroup>
                <col style="width:146px;"><col style="width:176px;"><col style="width:118px;"><col style="width:54px;">
                <col style="width:48px;"><col style="width:58px;"><col style="width:72px;">
              </colgroup>
              <thead>
                <tr><th>Node Hub Regional</th><th>Cakupan Cabang</th><th>Replika SQL</th><th class="num">Lag</th><th class="num">Antre</th><th class="num">Sync</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${hubs.map((h) => `<tr>
                  <td style="font-weight:700;color:#0f172a;">${esc(h.hub)}</td>
                  <td class="mono" style="font-size:9.5px;color:#475569;">${esc(h.branches)}</td>
                  <td class="mono" style="font-size:9.5px;">${esc(h.db)}</td>
                  <td class="num mono" style="color:#047857;font-weight:600;">${esc(h.lag)}</td>
                  <td class="num mono">${esc(h.queue)}</td>
                  <td class="num mono" style="font-weight:700;">${esc(h.sync)}</td>
                  <td>${badge('Online', h.tone)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <div style="margin-top:auto;padding:7px 10px;background:#f8fafc;border-top:1px solid #cbd5e1;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#334155;">
              <span><strong>RBAC Active Directory:</strong> 5 Peran WPF (Dir Ops · Kontroler HQ · Auditor QA · Ka. Cabang · Admin Gudang) · MFA Wajib</span>
              ${badge('TLS 1.3 · VPN MPLS', 'accent')}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p8',
    title: 'Impor Excel EPPlus, WORM SHA-256 & Sync Cabang',
    actionsHtml: `
      <span class="e-btn">${ic('shield', 11, '#334155')} Verifikasi Rantai WORM</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Impor Excel Massal (.xlsx)</span>
    `,
    bodyHtml,
  });
}

export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
    { slug: 'p6', title: meta.pages[5].title, html: renderPage6() },
    { slug: 'p7', title: meta.pages[6].title, html: renderPage7() },
    { slug: 'p8', title: meta.pages[7].title, html: renderPage8() },
  ];
}
