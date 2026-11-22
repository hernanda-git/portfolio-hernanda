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
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-021',
  name: 'TokoSync Omni',
  reference: 'Shopify Plus Organization Admin + Tokopedia Seller Center Enterprise',
  persona: 'Nadia Kusuma · Head of Omnichannel Operations · PT Lumina Botanika Nusantara',
  pages: [
    { slug: 'p1', title: 'Pusat Kendali Omnichannel & Penjaga Flash Sale' },
    { slug: 'p2', title: 'Matriks Stok Multi-Channel & Kunci Buffer Redis Lua' },
    { slug: 'p3', title: 'Meja Wave-Picking & Cetak AWB Thermal Massal' },
    { slug: 'p4', title: 'Rekonsiliasi Escrow, Margin Waterfall & Sanggah Biaya' },
    { slug: 'p5', title: 'Routing Multi-Gudang & Optimasi Ongkir Nusantara' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const CHANNELS = [
  { id: 'tiktok', name: 'TikTok Shop', short: 'TT', color: '#111827', bg: '#f1f5f9', bd: '#cbd5e1', orders: 246, gmv: 51660000, webhookMs: 118, quotaPct: 62, status: 'Flash Sale', tone: 'warn', apiVer: 'TTS OpenAPI v202409' },
  { id: 'shopee', name: 'Shopee Mall', short: 'SP', color: '#c2410c', bg: '#fff7ed', bd: '#fed7aa', orders: 184, gmv: 37720000, webhookMs: 142, quotaPct: 54, status: 'Tersinkron', tone: 'ok', apiVer: 'Shopee OpenAPI v2' },
  { id: 'tokopedia', name: 'Tokopedia', short: 'TP', color: '#047857', bg: '#ecfdf5', bd: '#a7f3d0', orders: 118, gmv: 24780000, webhookMs: 164, quotaPct: 41, status: 'Tersinkron', tone: 'ok', apiVer: 'Tokopedia FS-API v2' },
  { id: 'lazada', name: 'Lazada Mall', short: 'LZ', color: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe', orders: 42, gmv: 8400000, webhookMs: 186, quotaPct: 24, status: 'Tersinkron', tone: 'ok', apiVer: 'Lazada OpenAPI v2' },
  { id: 'webstore', name: 'Webstore Brand', short: 'WS', color: '#0e6b5e', bg: '#e7f5f2', bd: '#99d5cb', orders: 28, gmv: 5900000, webhookMs: 48, quotaPct: 12, status: 'Tersinkron', tone: 'ok', apiVer: 'Webhook Internal .NET 9' },
];

const HOURS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
];

const HOURLY_ORDERS = {
  tiktok:    [4, 2, 1, 1, 2, 3, 5, 8, 12, 16, 18, 22, 54, 42, 34, 22], // sum = 246
  shopee:    [3, 2, 1, 1, 2, 3, 6, 9, 14, 17, 19, 21, 24, 23, 21, 18], // sum = 184
  tokopedia: [2, 1, 1, 0, 1, 2, 4, 7, 10, 13, 14, 15, 13, 12, 12, 11], // sum = 118
  other:     [1, 1, 0, 0, 1, 1, 2, 4, 6, 8, 9, 9, 8, 7, 7, 6],         // sum = 70 (42 LZ + 28 WS)
};

const WAREHOUSES = [
  {
    code: 'Gdg-JKT',
    name: 'Gudang Cakung (Jakarta Timur)',
    region: 'Jabodetabek, Jabar, Banten, Kalbar',
    orders: 378,
    gmv: 78620000,
    utilPct: 78,
    packers: 14,
    skuCoverage: '48 / 48 SKU',
    nextCutoff: '15:00 WIB (J&T)',
    savingsMtd: 3120000,
    avgShipLocal: 9000,
    avgShipSingle: 11200,
    printer: 'Zebra ZD421-JKT-01',
    status: 'Sibuk · Flash',
    tone: 'warn',
  },
  {
    code: 'Gdg-SBY',
    name: 'Gudang Rungkut (Surabaya)',
    region: 'Jatim, Jateng, Bali, NTB, Sulawesi',
    orders: 164,
    gmv: 34040000,
    utilPct: 61,
    packers: 7,
    skuCoverage: '46 / 48 SKU',
    nextCutoff: '16:00 WIB (SiCepat)',
    savingsMtd: 6940000,
    avgShipLocal: 11500,
    avgShipSingle: 23800,
    printer: 'Xprinter XP-420B-SBY',
    status: 'Normal',
    tone: 'ok',
  },
  {
    code: 'Gdg-MDN',
    name: 'Gudang KIM II (Medan)',
    region: 'Sumut, Aceh, Riau, Sumbar, Sumsel',
    orders: 76,
    gmv: 15800000,
    utilPct: 44,
    packers: 4,
    skuCoverage: '42 / 48 SKU',
    nextCutoff: '16:30 WIB (JNE)',
    savingsMtd: 4760000,
    avgShipLocal: 13000,
    avgShipSingle: 29500,
    printer: 'Zebra ZD220-MDN',
    status: 'Normal',
    tone: 'ok',
  },
];

const WAVES = [
  { id: 'WV-14', code: 'ORD-882', courier: 'J&T Express', channel: 'TikTok Shop', wh: 'Gdg-JKT', pkgs: 142, printed: 142, packed: 118, readyToPrint: 0, value: 28450000, cutoff: 'Pickup 15:00 WIB', slaLeft: '42 mnt', status: 'Packing', tone: 'ok' },
  { id: 'WV-15', code: 'ORD-881', courier: 'GoSend Instant', channel: 'Shopee Mall', wh: 'Gdg-JKT', pkgs: 18, printed: 18, packed: 11, readyToPrint: 0, value: 6120000, cutoff: 'SLA 90 menit', slaLeft: 'Mendesak', status: 'Mendesak', tone: 'warn' },
  { id: 'WV-16', code: 'ORD-883', courier: 'SiCepat REG/BEST', channel: 'Multi-Channel', wh: 'Gdg-JKT / SBY', pkgs: 128, printed: 104, packed: 92, readyToPrint: 24, value: 26880000, cutoff: 'Pickup 16:00 WIB', slaLeft: '1 jam 42 mnt', status: 'Siap Cetak', tone: 'info' },
  { id: 'WV-17', code: 'ORD-884', courier: 'JNE REG/YES', channel: 'Multi-Channel', wh: 'Gdg-SBY / MDN', pkgs: 124, printed: 106, packed: 89, readyToPrint: 18, value: 25190000, cutoff: 'Pickup 16:30 WIB', slaLeft: '2 jam 12 mnt', status: 'Siap Cetak', tone: 'info' },
];

const DISPATCHED_MORNING_PKGS = 206;
const DISPATCHED_MORNING_VAL = 41820000;

const PRIORITY_ITEMS = [
  { code: 'ORD-882', channel: 'tiktok', title: 'TikTok Shop — Wave #14 (J&T Express)', sub: '142 paket · 118/142 dipindai · Pickup 15:00 WIB', wh: 'Gdg-JKT', value: 'Rp 28.450.000', status: 'Packing', tone: 'ok', action: 'Pantau Wave' },
  { code: 'ORD-881', channel: 'shopee', title: 'Shopee Mall — Instant GoSend Prioritas', sub: '18 pesanan mendesak · Sisa SLA 90 menit', wh: 'Gdg-JKT', value: 'Rp 6.120.000', status: 'Mendesak', tone: 'warn', action: 'Prioritaskan' },
  { code: 'SKU-109', channel: 'tiktok', title: 'Serum Niacinamide 30ml (Flash Sale)', sub: 'Fisik 18 · Dipesan 14 · Buffer dikunci di Shopee/Tokped', wh: '3 Gudang', value: '18 / 500 pcs', status: 'Kunci Buffer', tone: 'warn', action: 'Audit Lock' },
  { code: 'SET-44', channel: 'tokopedia', title: 'Payout Tokopedia #TP-1119 (Anomali)', sub: 'Selisih subsidi voucher & bebas ongkir pada 3 pesanan', wh: 'Finance', value: '-Rp 184.200', status: 'Sanggah', tone: 'bad', action: 'Auto-Tiket' },
  { code: 'ORD-883', channel: 'shopee', title: 'Wave #16 — SiCepat REG & BEST Batch Sore', sub: '128 paket · 24 resi AWB menunggu cetak thermal', wh: 'JKT · SBY', value: 'Rp 26.880.000', status: 'Siap Cetak', tone: 'info', action: 'Cetak 24 AWB' },
  { code: 'ORD-884', channel: 'tokopedia', title: 'Wave #17 — JNE REG & YES Koridor Timur/Barat', sub: '124 paket · 18 resi AWB menunggu cetak thermal', wh: 'SBY · MDN', value: 'Rp 25.190.000', status: 'Siap Cetak', tone: 'info', action: 'Cetak 18 AWB' },
  { code: 'SKU-114', channel: 'tiktok', title: 'Sunscreen Hybrid SPF50+ 50ml (Bundling Live)', sub: 'Fisik 26 · Dipesan 19 · Tersedia 7 khusus TikTok', wh: '3 Gudang', value: '26 / 400 pcs', status: 'Kunci Buffer', tone: 'warn', action: 'Atur Buffer' },
  { code: 'RTG-209', channel: 'lazada', title: 'Split-Routing Otomatis Koridor Surabaya & Medan', sub: '240 pesanan dialihkan dari JKT · Hemat ongkir 38,4%', wh: 'SBY · MDN', value: 'Rp 49.840.000', status: 'Optimal', tone: 'ok', action: 'Lihat Rute' },
];

// 15-SKU Master Inventory Sync Matrix (Page 2)
// Invariant: physical === jkt + sby + mdn; avail = physical - reserved; each channel qty <= avail; lockedCount === 6
const SKUS = [
  { code: 'SKU-109', name: 'Serum Niacinamide 10% 30ml (Flash)', cat: 'Serum · Flash Live', icon: 'dropper', tint: '#0e6b5e', jkt: 12, sby: 4, mdn: 2, physical: 18, reserved: 14, buffer: 15, tokped: 0, tiktok: 4, shopee: 0, lazada: 0, rule: 'Lock <=15 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, selected: true, ean: '8997210481092', price: 149000, hpp: 54000 },
  { code: 'SKU-114', name: 'Sunscreen Hybrid SPF50+ PA++++ 50ml', cat: 'UV Care · Bundling', icon: 'tube', tint: '#d97706', jkt: 15, sby: 7, mdn: 4, physical: 26, reserved: 19, buffer: 12, tokped: 0, tiktok: 7, shopee: 0, lazada: 0, rule: 'Lock <=12 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, ean: '8997210481146', price: 118000, hpp: 43000 },
  { code: 'SKU-121', name: 'Barrier Ceramide Repair Gel 50g', cat: 'Moisturizer', icon: 'jar', tint: '#0284c7', jkt: 18, sby: 8, mdn: 3, physical: 29, reserved: 21, buffer: 10, tokped: 0, tiktok: 8, shopee: 0, lazada: 0, rule: 'Lock <=10 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, ean: '8997210481214', price: 165000, hpp: 61000 },
  { code: 'SKU-103', name: 'Cica Calming Micellar Cleanser 120ml', cat: 'Cleanser', icon: 'pump', tint: '#059669', jkt: 142, sby: 64, mdn: 34, physical: 240, reserved: 38, buffer: 15, tokped: 187, tiktok: 202, shopee: 187, lazada: 140, rule: 'Buffer 15 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481030', price: 95000, hpp: 32000 },
  { code: 'SKU-105', name: 'PHA Gentle Exfoliating Toner 100ml', cat: 'Toner', icon: 'mist', tint: '#7c3aed', jkt: 96, sby: 48, mdn: 22, physical: 166, reserved: 28, buffer: 15, tokped: 123, tiktok: 138, shopee: 123, lazada: 90, rule: 'Buffer 15 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481054', price: 125000, hpp: 44000 },
  { code: 'SKU-118', name: 'Retinol 0.3% Encapsulated Night Serum', cat: 'Anti-Aging · Flash', icon: 'dropper', tint: '#be123c', jkt: 11, sby: 6, mdn: 3, physical: 20, reserved: 14, buffer: 10, tokped: 0, tiktok: 6, shopee: 0, lazada: 0, rule: 'Lock <=10 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, ean: '8997210481184', price: 189000, hpp: 69000 },
  { code: 'SKU-124', name: 'Mugwort Clay Pore Detox Mask 60g', cat: 'Masker', icon: 'jar', tint: '#15803d', jkt: 118, sby: 54, mdn: 28, physical: 200, reserved: 24, buffer: 12, tokped: 164, tiktok: 176, shopee: 164, lazada: 120, rule: 'Buffer 12 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481245', price: 112000, hpp: 38000 },
  { code: 'SKU-127', name: 'Peptide Firming Eye Cream 15ml', cat: 'Eye Care', icon: 'tube', tint: '#0e6b5e', jkt: 14, sby: 5, mdn: 3, physical: 22, reserved: 13, buffer: 10, tokped: 0, tiktok: 9, shopee: 0, lazada: 0, rule: 'Lock <=10 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, ean: '8997210481276', price: 155000, hpp: 52000 },
  { code: 'SKU-131', name: 'Hyaluronic 5D Hydration Essence 80ml', cat: 'Essence', icon: 'mist', tint: '#0369a1', jkt: 134, sby: 62, mdn: 30, physical: 226, reserved: 31, buffer: 15, tokped: 180, tiktok: 195, shopee: 180, lazada: 135, rule: 'Buffer 15 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481313', price: 139000, hpp: 48000 },
  { code: 'SKU-135', name: 'Vitamin C 15% Brightening Booster 20ml', cat: 'Serum', icon: 'dropper', tint: '#ea580c', jkt: 88, sby: 42, mdn: 18, physical: 148, reserved: 22, buffer: 12, tokped: 114, tiktok: 126, shopee: 114, lazada: 85, rule: 'Buffer 12 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481351', price: 159000, hpp: 56000 },
  { code: 'SKU-139', name: 'Lip Barrier Peptide Treatment 10g', cat: 'Lip Care · Flash', icon: 'tube', tint: '#db2777', jkt: 16, sby: 7, mdn: 2, physical: 25, reserved: 17, buffer: 10, tokped: 0, tiktok: 8, shopee: 0, lazada: 0, rule: 'Lock <=10 · TikTok Only', status: 'Kunci Buffer', tone: 'warn', locked: true, ean: '8997210481399', price: 79000, hpp: 25000 },
  { code: 'SKU-142', name: 'Centella Daily Soothing Gel Lotion 150ml', cat: 'Body & Face', icon: 'pump', tint: '#047857', jkt: 164, sby: 78, mdn: 38, physical: 280, reserved: 29, buffer: 20, tokped: 231, tiktok: 251, shopee: 231, lazada: 180, rule: 'Buffer 20 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481429', price: 135000, hpp: 46000 },
  { code: 'SKU-148', name: 'Paket Glowing Hemat 3-in-1 (Bundling)', cat: 'Bundle Promo', icon: 'box', tint: '#0e6b5e', jkt: 72, sby: 34, mdn: 14, physical: 120, reserved: 26, buffer: 10, tokped: 84, tiktok: 94, shopee: 84, lazada: 60, rule: 'Komponen Atomik', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481481', price: 329000, hpp: 124000 },
  { code: 'SKU-152', name: 'Refill Pouch Micellar Cleanser 250ml', cat: 'Eco Refill', icon: 'pouch', tint: '#0d9488', jkt: 112, sby: 56, mdn: 24, physical: 192, reserved: 18, buffer: 15, tokped: 159, tiktok: 174, shopee: 159, lazada: 115, rule: 'Buffer 15 pcs/Ch', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481528', price: 145000, hpp: 47000 },
  { code: 'SKU-156', name: 'Travel Kit Barrier Essentials (4 Mini)', cat: 'Travel Set', icon: 'box', tint: '#4f46e5', jkt: 84, sby: 38, mdn: 18, physical: 140, reserved: 16, buffer: 10, tokped: 114, tiktok: 124, shopee: 114, lazada: 82, rule: 'Komponen Atomik', status: 'Tersinkron', tone: 'ok', locked: false, ean: '8997210481566', price: 179000, hpp: 64000 },
];

// Wave #14 Bin Pick-List (Page 3 Left — 10 rack bins)
const PICK_BINS = [
  { bin: 'A1-02', sku: 'SKU-109', name: 'Serum Niacinamide 30ml', req: 58, picked: 52, status: '6 tersisa', tone: 'warn' },
  { bin: 'A1-04', sku: 'SKU-114', name: 'Sunscreen Hybrid SPF50+', req: 46, picked: 46, status: 'Selesai', tone: 'ok' },
  { bin: 'B2-01', sku: 'SKU-121', name: 'Barrier Ceramide Gel 50g', req: 34, picked: 28, status: '6 tersisa', tone: 'warn' },
  { bin: 'B2-06', sku: 'SKU-103', name: 'Cica Micellar Cleanser', req: 28, picked: 28, status: 'Selesai', tone: 'ok' },
  { bin: 'C1-03', sku: 'SKU-148', name: 'Paket Glowing 3-in-1', req: 24, picked: 18, status: '6 tersisa', tone: 'warn' },
  { bin: 'C2-08', sku: 'SKU-118', name: 'Retinol 0.3% Night Serum', req: 19, picked: 19, status: 'Selesai', tone: 'ok' },
  { bin: 'D1-01', sku: 'SKU-131', name: 'Hyaluronic 5D Essence', req: 16, picked: 10, status: '6 tersisa', tone: 'warn' },
  { bin: 'D3-04', sku: 'SKU-139', name: 'Lip Barrier Peptide 10g', req: 15, picked: 15, status: 'Selesai', tone: 'ok' },
  { bin: 'D3-09', sku: 'SKU-124', name: 'Mugwort Clay Detox Mask', req: 14, picked: 14, status: 'Selesai', tone: 'ok' },
  { bin: 'E1-02', sku: 'SKU-135', name: 'Vitamin C 15% Booster', req: 12, picked: 12, status: 'Selesai', tone: 'ok' },
];

// Batch AWB Print Queue (Page 3 Center - showing 14 rows from the 42 ready-to-print AWB queue + selected preview order)
const AWB_QUEUE = [
  { ord: 'TT-261122-88241', ch: 'tiktok', courier: 'J&T REG', awb: 'JP8492014482', buyer: 'Ratna Sari · Jaksel', wh: 'Gdg-JKT', gr: 420, st: 'Pratinjau', tone: 'accent', selected: true },
  { ord: 'SP-261122-41908', ch: 'shopee', courier: 'SiCepat', awb: '004281920411', buyer: 'Budi Santoso · Bekasi', wh: 'Gdg-JKT', gr: 360, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TP-261122-77412', ch: 'tokopedia', courier: 'SiCepat', awb: '004281920412', buyer: 'Dian Pratiwi · Depok', wh: 'Gdg-JKT', gr: 510, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TT-261122-88304', ch: 'tiktok', courier: 'SiCepat', awb: '004281920413', buyer: 'Aulia Rahman · Bandung', wh: 'Gdg-JKT', gr: 280, st: 'Siap Cetak', tone: 'info' },
  { ord: 'SP-261122-41942', ch: 'shopee', courier: 'SiCepat', awb: '004281920414', buyer: 'Mega Putri · Sidoarjo', wh: 'Gdg-SBY', gr: 440, st: 'Siap Cetak', tone: 'info' },
  { ord: 'LZ-261122-19034', ch: 'lazada', courier: 'JNE REG', awb: 'JN26118840219', buyer: 'Hendra Wijaya · Malang', wh: 'Gdg-SBY', gr: 620, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TP-261122-77455', ch: 'tokopedia', courier: 'JNE YES', awb: 'JN26118840220', buyer: 'Siti Aminah · Denpasar', wh: 'Gdg-SBY', gr: 390, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TT-261122-88319', ch: 'tiktok', courier: 'JNE REG', awb: 'JN26118840221', buyer: 'Rizky Pratama · Medan', wh: 'Gdg-MDN', gr: 310, st: 'Siap Cetak', tone: 'info' },
  { ord: 'SP-261122-41971', ch: 'shopee', courier: 'SiCepat', awb: '004281920415', buyer: 'Novi Kartika · Tangerang', wh: 'Gdg-JKT', gr: 480, st: 'Siap Cetak', tone: 'info' },
  { ord: 'WS-261122-05118', ch: 'webstore', courier: 'JNE YES', awb: 'JN26118840222', buyer: 'Fajar Nugroho · Semarang', wh: 'Gdg-SBY', gr: 550, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TP-261122-77489', ch: 'tokopedia', courier: 'SiCepat', awb: '004281920416', buyer: 'Laras Wibowo · Bogor', wh: 'Gdg-JKT', gr: 290, st: 'Siap Cetak', tone: 'info' },
  { ord: 'TT-261122-88352', ch: 'tiktok', courier: 'JNE REG', awb: 'JN26118840223', buyer: 'Taufik Hidayat · Pekanbaru', wh: 'Gdg-MDN', gr: 460, st: 'Siap Cetak', tone: 'info' },
  { ord: 'SP-261122-42005', ch: 'shopee', courier: 'SiCepat', awb: '004281920417', buyer: 'Intan Permata · Surabaya', wh: 'Gdg-SBY', gr: 340, st: 'Siap Cetak', tone: 'info' },
  { ord: 'LZ-261122-19077', ch: 'lazada', courier: 'JNE REG', awb: 'JN26118840224', buyer: 'Dimas Arya · Palembang', wh: 'Gdg-MDN', gr: 520, st: 'Siap Cetak', tone: 'info' },
];

// Escrow Reconciliation & Fee Waterfall (Page 4)
const WATERFALL = [
  { label: 'GMV Bruto', short: 'GMV Bruto', amount: 486240000, type: 'start', color: '#0e6b5e' },
  { label: 'Diskon Seller', short: 'Diskon Seller', amount: -18420000, type: 'neg', color: '#d97706' },
  { label: 'Subsidi Voucher', short: 'Subsidi MP', amount: 9240000, type: 'pos', color: '#047857' },
  { label: 'Komisi Platform', short: 'Komisi MP', amount: -29110400, type: 'neg', color: '#be123c' },
  { label: 'Bebas Ongkir', short: 'Bebas Ongkir', amount: -14812000, type: 'neg', color: '#e11d48' },
  { label: 'Layanan & Afiliasi', short: 'Layanan/Afil', amount: -8710000, type: 'neg', color: '#9f1239' },
  { label: 'Estimasi Bersih', short: 'Estimasi Net', amount: 424427600, type: 'end', color: '#0369a1' },
];

const PAYOUT_BATCHES = [
  { batch: '#TP-1119', ch: 'tokopedia', name: 'Tokopedia', orders: 448, expected: 94280000, actual: 94095800, diff: -184200, status: 'Sanggah (3)', tone: 'bad', selected: true },
  { batch: '#TT-8842', ch: 'tiktok', name: 'TikTok Shop', orders: 912, expected: 162410600, actual: 162410600, diff: 0, status: 'Cocok 100%', tone: 'ok' },
  { batch: '#SP-4410', ch: 'shopee', name: 'Shopee Mall', orders: 684, expected: 118645000, actual: 118645000, diff: 0, status: 'Cocok 100%', tone: 'ok' },
  { batch: '#LZ-2208', ch: 'lazada', name: 'Lazada Mall', orders: 186, expected: 29812000, actual: 29812000, diff: 0, status: 'Cocok 100%', tone: 'ok' },
  { batch: '#WS-0912', ch: 'webstore', name: 'Webstore', orders: 110, expected: 19280000, actual: 19280000, diff: 0, status: 'Cocok 100%', tone: 'ok' },
];

const ESCROW_LEDGER = [
  { inv: 'INV/261119/TP/4489102', ch: 'tokopedia', gmv: 648000, feeSys: 78500, exp: 569500, act: 495000, diff: -74500, note: 'Subsidi voucher 50% MP gagal kredit', status: 'Sanggah', tone: 'bad', bad: true },
  { inv: 'INV/261119/TP/4489218', ch: 'tokopedia', gmv: 524000, feeSys: 64800, exp: 459200, act: 397000, diff: -62200, note: 'Potongan Bebas Ongkir ganda 2x', status: 'Sanggah', tone: 'bad', bad: true },
  { inv: 'INV/261120/TP/4489504', ch: 'tokopedia', gmv: 418000, feeSys: 51500, exp: 366500, act: 319000, diff: -47500, note: 'Selisih subsidi bundling Flash', status: 'Sanggah', tone: 'bad', bad: true },
  { inv: 'TT/261120/88420194', ch: 'tiktok', gmv: 329000, feeSys: 42770, exp: 286230, act: 286230, diff: 0, note: 'Komisi 6% + Afiliasi 7% sesuai', status: 'Cocok', tone: 'ok' },
  { inv: 'SP/261120/44109812', ch: 'shopee', gmv: 462000, feeSys: 55440, exp: 406560, act: 406560, diff: 0, note: 'Admin Mall + Ongkir XTRA OK', status: 'Cocok', tone: 'ok' },
  { inv: 'TT/261120/88420311', ch: 'tiktok', gmv: 298000, feeSys: 35760, exp: 262240, act: 262240, diff: 0, note: 'Subsidi Live Flash dikreditkan', status: 'Cocok', tone: 'ok' },
  { inv: 'TP/261120/4489610', ch: 'tokopedia', gmv: 355000, feeSys: 42600, exp: 312400, act: 312400, diff: 0, note: 'Power Merchant PRO tier sesuai', status: 'Cocok', tone: 'ok' },
  { inv: 'LZ/261120/22081440', ch: 'lazada', gmv: 274000, feeSys: 32880, exp: 241120, act: 241120, diff: 0, note: 'LazMall komisi & cashback OK', status: 'Cocok', tone: 'ok' },
  { inv: 'WS/261120/09120088', ch: 'webstore', gmv: 518000, feeSys: 10360, exp: 507640, act: 507640, diff: 0, note: 'Xendit VA BCA MDR 2,0% cocok', status: 'Cocok', tone: 'ok' },
  { inv: 'SP/261121/44110209', ch: 'shopee', gmv: 384000, feeSys: 46080, exp: 337920, act: 337920, diff: 0, note: 'Voucher koin & ongkir XTRA OK', status: 'Cocok', tone: 'ok' },
];

// Multi-Warehouse Corridor Shipping Savings (Page 5)
const CORRIDORS = [
  { name: 'Jatim & SBY', wh: 'Gdg-SBY', singleCost: 22000, multiCost: 10000, ordersMtd: 340, saveMtd: 4080000 },
  { name: 'Sumut & MDN', wh: 'Gdg-MDN', singleCost: 29000, multiCost: 12000, ordersMtd: 180, saveMtd: 3060000 },
  { name: 'Bali & NTB', wh: 'Gdg-SBY', singleCost: 27000, multiCost: 14000, ordersMtd: 130, saveMtd: 1690000 },
  { name: 'Riau & Sumsel', wh: 'Gdg-MDN', singleCost: 28000, multiCost: 18000, ordersMtd: 170, saveMtd: 1700000 },
  { name: 'Jateng & DIY', wh: 'Gdg-SBY', singleCost: 19000, multiCost: 12500, ordersMtd: 180, saveMtd: 1170000 },
  { name: 'Jabar & Banten', wh: 'Gdg-JKT', singleCost: 12000, multiCost: 9000, ordersMtd: 1040, saveMtd: 3120000 },
];

const ROUTING_RULES = [
  { id: 'R-01', name: 'Zona Provinsi Otomatis', cond: 'Sumut/Riau/Sumsel -> Gdg-MDN; Jatim/Bali/Sulawesi -> Gdg-SBY', hit: '240 order', ms: '1,8 ms', status: 'Aktif', tone: 'ok' },
  { id: 'R-02', name: 'Kunci Instant Radius 15 km', cond: 'Kurir GoSend/Grab Instant wajib rute gudang dalam kota <=15 km', hit: '18 order', ms: '1,1 ms', status: 'Prioritas', tone: 'warn' },
  { id: 'R-03', name: 'Fallback Stok Sekunder', cond: 'Jika stok lokal < buffer -> fallback Gdg-JKT bila ongkir <= Rp 18 rb', hit: '14 order', ms: '2,4 ms', status: 'Aktif', tone: 'ok' },
  { id: 'R-04', name: 'Cut-Off Dinamis 15:00 WIB', cond: 'Jika beban packer Gdg-JKT >85%, alihkan pesanan Jateng ke Gdg-SBY', hit: '9 order', ms: '2,1 ms', status: 'Aktif', tone: 'ok' },
  { id: 'R-05', name: 'Anti-Split Bundling Live', cond: 'SKU-148 & SKU-156 wajib dikirim 1 paket utuh dari gudang stok lengkap', hit: '31 order', ms: '1,5 ms', status: 'Terkunci', tone: 'info' },
];

// ============================================================================
// MATHEMATICAL CONSISTENCY VERIFIER
// ============================================================================
export function verifyMath() {
  const sumChOrders = CHANNELS.reduce((a, c) => a + c.orders, 0);
  const sumChGmv = CHANNELS.reduce((a, c) => a + c.gmv, 0);
  const sumWhOrders = WAREHOUSES.reduce((a, w) => a + w.orders, 0);
  const sumWhGmv = WAREHOUSES.reduce((a, w) => a + w.gmv, 0);
  const sumWhSavings = WAREHOUSES.reduce((a, w) => a + w.savingsMtd, 0);
  const sumCorridorSavings = CORRIDORS.reduce((a, c) => a + c.saveMtd, 0);

  if (sumChOrders !== 618) throw new Error(`Orders mismatch: channels=${sumChOrders}`);
  if (sumWhOrders !== sumChOrders) throw new Error(`Warehouse orders=${sumWhOrders} vs ${sumChOrders}`);
  if (sumChGmv !== 128460000) throw new Error(`GMV mismatch: ${sumChGmv}`);
  if (sumWhGmv !== sumChGmv) throw new Error(`Warehouse GMV=${sumWhGmv} vs ${sumChGmv}`);
  if (sumWhSavings !== 14820000) throw new Error(`WH savings=${sumWhSavings}`);
  if (sumCorridorSavings !== sumWhSavings) throw new Error(`Corridor savings=${sumCorridorSavings} vs ${sumWhSavings}`);

  // Hourly velocity sums
  const hTT = HOURLY_ORDERS.tiktok.reduce((a, v) => a + v, 0);
  const hSP = HOURLY_ORDERS.shopee.reduce((a, v) => a + v, 0);
  const hTP = HOURLY_ORDERS.tokopedia.reduce((a, v) => a + v, 0);
  const hOT = HOURLY_ORDERS.other.reduce((a, v) => a + v, 0);
  if (hTT !== 246 || hSP !== 184 || hTP !== 118 || hOT !== 70) {
    throw new Error(`Hourly sum mismatch: ${hTT},${hSP},${hTP},${hOT}`);
  }

  // Waves & print queue
  const wavePkgs = WAVES.reduce((a, w) => a + w.pkgs, 0);
  const waveVal = WAVES.reduce((a, w) => a + w.value, 0);
  const readyPrint = WAVES.reduce((a, w) => a + w.readyToPrint, 0);
  if (wavePkgs !== 412) throw new Error(`Wave pkgs=${wavePkgs}`);
  if (wavePkgs + DISPATCHED_MORNING_PKGS !== sumChOrders) throw new Error(`Wave+Dispatched=${wavePkgs + DISPATCHED_MORNING_PKGS}`);
  if (waveVal + DISPATCHED_MORNING_VAL !== sumChGmv) throw new Error(`Wave+Dispatched val=${waveVal + DISPATCHED_MORNING_VAL}`);
  if (readyPrint !== 42) throw new Error(`Ready print=${readyPrint}`);

  // SKU atomic inventory invariants
  let lockedCnt = 0;
  for (const s of SKUS) {
    if (s.jkt + s.sby + s.mdn !== s.physical) {
      throw new Error(`SKU ${s.code} physical mismatch`);
    }
    const avail = s.physical - s.reserved;
    if (avail < 0) throw new Error(`SKU ${s.code} oversell detected`);
    if (Math.max(s.tokped, s.tiktok, s.shopee, s.lazada) > avail) {
      throw new Error(`SKU ${s.code} channel qty exceeds available`);
    }
    if (s.locked) lockedCnt++;
  }
  if (lockedCnt !== 6) throw new Error(`Locked SKU count=${lockedCnt}`);

  // Waterfall & Escrow Payout reconciliation
  const wfNet = WATERFALL.slice(0, -1).reduce((a, x) => a + x.amount, 0);
  if (wfNet !== WATERFALL[WATERFALL.length - 1].amount) {
    throw new Error(`Waterfall net=${wfNet} vs ${WATERFALL[WATERFALL.length - 1].amount}`);
  }
  const sumBatchExp = PAYOUT_BATCHES.reduce((a, b) => a + b.expected, 0);
  const sumBatchAct = PAYOUT_BATCHES.reduce((a, b) => a + b.actual, 0);
  const sumBatchDiff = PAYOUT_BATCHES.reduce((a, b) => a + b.diff, 0);
  const sumLedgerDiff = ESCROW_LEDGER.reduce((a, r) => a + r.diff, 0);
  if (sumBatchExp !== wfNet) throw new Error(`Batch expected=${sumBatchExp} vs wfNet=${wfNet}`);
  if (sumBatchAct - sumBatchExp !== sumBatchDiff) throw new Error(`Batch diff mismatch`);
  if (sumBatchDiff !== -184200) throw new Error(`Batch diff=${sumBatchDiff}`);
  if (sumLedgerDiff !== sumBatchDiff) throw new Error(`Ledger diff=${sumLedgerDiff} vs ${sumBatchDiff}`);
}

const TOTAL_ORDERS = CHANNELS.reduce((a, c) => a + c.orders, 0);
const TOTAL_GMV = CHANNELS.reduce((a, c) => a + c.gmv, 0);
const TOTAL_READY_AWB = WAVES.reduce((a, w) => a + w.readyToPrint, 0);
const TOTAL_WAVE_PKGS = WAVES.reduce((a, w) => a + w.pkgs, 0);
const TOTAL_SAVINGS = WAREHOUSES.reduce((a, w) => a + w.savingsMtd, 0);

// ============================================================================
// CUSTOM COMMERCE VECTOR ICONS & SHARED CHROME (SHOPIFY PLUS / TOKOPEDIA STYLE)
// ============================================================================

function chChip(chId, labelOverride = null) {
  const map = {
    tiktok: { lbl: 'TikTok', color: '#111827', bg: '#f1f5f9', bd: '#cbd5e1', dot: '#111827' },
    shopee: { lbl: 'Shopee', color: '#c2410c', bg: '#fff7ed', bd: '#fed7aa', dot: '#ea580c' },
    tokopedia: { lbl: 'Tokopedia', color: '#047857', bg: '#ecfdf5', bd: '#a7f3d0', dot: '#059669' },
    lazada: { lbl: 'Lazada', color: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe', dot: '#2563eb' },
    webstore: { lbl: 'Webstore', color: '#0e6b5e', bg: '#e7f5f2', bd: '#99d5cb', dot: '#0e6b5e' },
  };
  const c = map[chId] || map.webstore;
  return `<span class="ts-ch-chip" style="background:${c.bg};color:${c.color};border-color:${c.bd};"><span class="ts-ch-dot" style="background:${c.dot};"></span>${esc(labelOverride || c.lbl)}</span>`;
}

function skuThumbSvg(type, tint = '#0e6b5e', size = 28) {
  const shapes = {
    dropper: `<rect x="11" y="4" width="6" height="4" rx="1" fill="${tint}"/><rect x="10" y="8" width="8" height="2.5" rx="0.8" fill="#475569"/><rect x="8.5" y="11" width="11" height="13" rx="2.5" fill="${tint}" fill-opacity="0.18" stroke="${tint}" stroke-width="1.5"/><rect x="10.5" y="14.5" width="7" height="5" rx="0.8" fill="#ffffff" stroke="${tint}" stroke-width="0.9"/>`,
    tube: `<path d="M9 5h10l-1.5 14h-7L9 5z" fill="${tint}" fill-opacity="0.18" stroke="${tint}" stroke-width="1.5" stroke-linejoin="round"/><rect x="11" y="19" width="6" height="4" rx="1" fill="${tint}"/><line x1="10.5" y1="10" x2="17.5" y2="10" stroke="${tint}" stroke-width="1.2"/>`,
    jar: `<rect x="7" y="7" width="14" height="4" rx="1.5" fill="${tint}"/><rect x="6.5" y="11" width="15" height="11" rx="2.5" fill="${tint}" fill-opacity="0.16" stroke="${tint}" stroke-width="1.5"/><rect x="9.5" y="14" width="9" height="4.5" rx="0.8" fill="#ffffff" stroke="${tint}" stroke-width="0.9"/>`,
    pump: `<path d="M12 5h6v2h-3v3h-3V5z" fill="#475569"/><rect x="8.5" y="10" width="11" height="13" rx="2.5" fill="${tint}" fill-opacity="0.18" stroke="${tint}" stroke-width="1.5"/><rect x="10.5" y="14" width="7" height="5" rx="0.8" fill="#ffffff" stroke="${tint}" stroke-width="0.9"/>`,
    mist: `<rect x="11.5" y="4.5" width="5" height="3.5" rx="1" fill="#475569"/><rect x="9" y="8.5" width="10" height="14.5" rx="2" fill="${tint}" fill-opacity="0.16" stroke="${tint}" stroke-width="1.5"/><circle cx="14" cy="15.5" r="2.6" fill="#ffffff" stroke="${tint}" stroke-width="1"/>`,
    pouch: `<path d="M8 7l2-2h8l2 2 1 15H7L8 7z" fill="${tint}" fill-opacity="0.16" stroke="${tint}" stroke-width="1.5" stroke-linejoin="round"/><rect x="10" y="11.5" width="8" height="5.5" rx="1" fill="#ffffff" stroke="${tint}" stroke-width="0.9"/>`,
    box: `<rect x="6.5" y="7" width="15" height="15" rx="1.8" fill="${tint}" fill-opacity="0.16" stroke="${tint}" stroke-width="1.5"/><line x1="6.5" y1="12" x2="21.5" y2="12" stroke="${tint}" stroke-width="1.2"/><line x1="14" y1="7" x2="14" y2="22" stroke="${tint}" stroke-width="1.2"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" style="display:block;flex-shrink:0;background:#f8faf9;border:1px solid #d7e0dc;border-radius:4px;">${shapes[type] || shapes.box}</svg>`;
}

const CUSTOM_CSS = `
  /* Light-first Modern Commerce Workspace — Shopify Plus / Tokopedia Seller Enterprise */
  .ts-topbar {
    height: 44px;
    background: #ffffff;
    border-top: 3px solid #0e6b5e;
    border-bottom: 1px solid #d7e0dc;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .ts-top-left, .ts-top-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .ts-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 13.5px;
    letter-spacing: -0.02em;
    color: #0b241f;
    white-space: nowrap;
  }
  .ts-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #0e6b5e;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 11px;
    font-weight: 800;
  }
  .ts-store-pill {
    height: 26px;
    padding: 0 9px;
    border-radius: 4px;
    background: #f4f7f6;
    border: 1px solid #cfdcd6;
    color: #16332d;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ts-search {
    height: 26px;
    width: 300px;
    padding: 0 9px;
    border-radius: 4px;
    background: #f7f9f8;
    border: 1px solid #d5dfda;
    color: #64748b;
    font-size: 10.8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ts-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .ts-guard-pill {
    height: 24px;
    padding: 0 8px;
    border-radius: 4px;
    background: #e7f5f2;
    border: 1px solid #99d5cb;
    color: #08473e;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ts-user-box {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid #dce4e0;
    white-space: nowrap;
  }
  .ts-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #08473e;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Light Commerce Sidebar Rail */
  .ts-rail {
    width: 196px;
    background: #fafcfb;
    border-right: 1px solid #d7e0dc;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 9px 0 8px;
  }
  .ts-nav-grp {
    padding: 0 8px 7px;
    margin-bottom: 6px;
    border-bottom: 1px solid #e6eeea;
  }
  .ts-nav-grp:last-of-type { border-bottom: 0; }
  .ts-nav-lbl {
    font-size: 9.2px;
    font-weight: 700;
    color: #5b706a;
    letter-spacing: 0.04em;
    padding: 2px 6px 5px;
  }
  .ts-nav-item {
    height: 27px;
    padding: 0 7px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    color: #293d38;
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;
  }
  .ts-nav-item.is-active {
    background: #e7f5f2;
    color: #08473e;
    font-weight: 700;
    box-shadow: inset 3px 0 0 #0e6b5e;
  }
  .ts-nav-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 3px;
    background: #edf2f0;
    color: #3f554f;
    flex-shrink: 0;
  }
  .ts-nav-cnt.warn { background: #fff1f2; color: #be123c; font-weight: 700; }
  .ts-nav-item.is-active .ts-nav-cnt { background: #0e6b5e; color: #ffffff; }

  .ts-rail-foot {
    margin: 0 8px;
    padding: 8px;
    border-radius: 4px;
    background: #ffffff;
    border: 1px solid #d7e0dc;
    font-size: 10px;
  }

  /* Subbar */
  .ts-subbar {
    height: 38px;
    padding: 0 12px;
    background: #ffffff;
    border-bottom: 1px solid #d7e0dc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }

  /* Alert ribbon */
  .ts-alert-bar {
    height: 30px;
    padding: 0 10px;
    background: #f0faf7;
    border: 1px solid #a7dfd4;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 10.8px;
    color: #08473e;
    flex-shrink: 0;
  }

  /* Channel chips */
  .ts-ch-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1.5px 6px;
    border-radius: 3px;
    font-size: 9.8px;
    font-weight: 700;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .ts-ch-dot {
    width: 5.5px;
    height: 5.5px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  /* Refine base panel & table borders to crisp commerce mint-slate */
  .e-panel { border-color: #d7e0dc; }
  .e-panel-head { background: #fafcfb; border-bottom-color: #e2eae6; height: 32px; }
  .e-kpi { border-color: #d7e0dc; padding: 8px 10px; }
  table.e-table th { background: #f4f7f6; color: #3f554f; border-bottom-color: #cfdcd6; }
  table.e-table td { border-bottom-color: #eaeff0; }
  table.e-table tbody tr:nth-child(even) { background: #fbfdfd; }
  table.e-table tfoot td { background: #eef4f2; border-top-color: #c5d5ce; }
  .e-statusbar { background: #f4f7f6; border-top-color: #d7e0dc; color: #3f554f; }
  .e-badge-accent { background: #e7f5f2; color: #08473e; border-color: #99d5cb; }

  /* Code / Redis Lua block */
  .ts-code {
    background: #f6f9f8;
    border: 1px solid #cfdcd6;
    border-radius: 4px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.42;
    color: #102a24;
  }

  /* Thermal Label Paper */
  .ts-awb-paper {
    background: #ffffff;
    border: 2px solid #0f172a;
    border-radius: 2px;
    color: #0f172a;
    font-family: var(--e-sans);
    display: flex;
    flex-direction: column;
  }
`;

function renderShell({ activeNav, pageTitle, breadcrumb, actionsHtml, contentHtml, statusRight }) {
  const navGroups = [
    {
      label: 'OPERASIONAL HARIAN',
      items: [
        { id: 'p1', icon: 'activity', label: 'Pusat Kendali', badge: String(TOTAL_ORDERS) },
        { id: 'p3', icon: 'layers', label: 'Wave & Cetak AWB', badge: String(TOTAL_READY_AWB) },
        { id: 'p5', icon: 'globe', label: 'Routing 3 Gudang', badge: '3' },
      ],
    },
    {
      label: 'KATALOG & STOK',
      items: [
        { id: 'p2', icon: 'database', label: 'Matriks Stok SKU', badge: '6 Lock', warn: true },
        { id: 'cat', icon: 'sliders', label: 'Bundling & Promo', badge: '14' },
        { id: 'api', icon: 'zap', label: 'Konektor Channel', badge: '5/5' },
      ],
    },
    {
      label: 'KEUANGAN & AUDIT',
      items: [
        { id: 'p4', icon: 'fileText', label: 'Rekonsiliasi Escrow', badge: '3', warn: true },
        { id: 'log', icon: 'shield', label: 'Audit Log Redis', badge: null },
      ],
    },
  ];

  const sidebarHtml = `<aside class="ts-rail">
    <div>
      ${navGroups
        .map(
          (g) => `<div class="ts-nav-grp">
            <div class="ts-nav-lbl">${esc(g.label)}</div>
            ${g.items
              .map((it) => {
                const active = it.id === activeNav;
                return `<div class="ts-nav-item ${active ? 'is-active' : ''}">
                  <div class="e-nav-left">
                    ${ic(it.icon, 13, active ? '#08473e' : '#5b706a')}
                    <span class="trunc">${esc(it.label)}</span>
                  </div>
                  ${it.badge ? `<span class="ts-nav-cnt ${it.warn ? 'warn' : ''}">${esc(it.badge)}</span>` : ''}
                </div>`;
              })
              .join('')}
          </div>`
        )
        .join('')}
    </div>
    <div class="ts-rail-foot">
      <div style="display:flex;align-items:center;justify-content:space-between;font-weight:700;color:#0b241f;margin-bottom:5px;">
        <span>Status 3 Gudang</span>
        <span class="mono" style="color:#047857;font-size:9px;">ONLINE</span>
      </div>
      ${WAREHOUSES.map(
        (w) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:2.5px 0;border-top:1px solid #edf2f0;">
          <span style="display:inline-flex;align-items:center;gap:5px;font-weight:600;color:#293d38;"><span class="dot ${w.tone === 'warn' ? 'dot-warn' : 'dot-ok'}"></span>${esc(w.code)}</span>
          <span class="mono" style="font-size:9.5px;color:#475569;">${w.orders} ord · ${w.utilPct}%</span>
        </div>`
      ).join('')}
      <div style="margin-top:6px;padding-top:5px;border-top:1px solid #d7e0dc;display:flex;justify-content:space-between;color:#5b706a;font-size:9.2px;">
        <span>Redis Lua p95</span>
        <span class="mono" style="font-weight:700;color:#0e6b5e;">0,84 ms</span>
      </div>
    </div>
  </aside>`;

  const topbarHtml = `<header class="ts-topbar">
    <div class="ts-top-left">
      <div class="ts-brand">
        <span class="ts-mark">TS</span>
        <span>TokoSync Omni</span>
      </div>
      <div class="ts-store-pill">
        ${ic('layers', 12, '#0e6b5e')}
        <span>PT Lumina Botanika Nusantara · 5 Channel</span>
        ${ic('chevronDown', 11, '#64748b')}
      </div>
      <div class="ts-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#64748b')}
          <span class="trunc">Cari SKU, Order ID, No. Resi AWB, Tiket Sanggah...</span>
        </span>
        <span class="ts-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="ts-top-right">
      <div class="ts-guard-pill">
        <span class="dot dot-ok"></span>
        <span>3 GUDANG · PENJAGA FLASH SALE AKTIF</span>
      </div>
      <div class="ts-store-pill" style="font-family:var(--e-mono);font-size:10px;">
        ${ic('clock', 11, '#64748b')}
        <span>22 Nov 2026 · 14:18 WIB</span>
      </div>
      <div class="ts-user-box">
        <span class="ts-avatar">NK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#0b241f;">Nadia Kusuma</div>
          <div style="font-size:9px;color:#5b706a;">Head of Omnichannel Ops</div>
        </div>
      </div>
    </div>
  </header>`;

  const footerHtml = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><span>.NET 9 Core API · Redis Lua Lock 0,84 ms p95</span>`,
      `<span>RabbitMQ Fanout: 0 DLQ · 18.420 lock/jam</span>`,
      `<span>PostgreSQL Primary (ID-JKT1): Sinkron</span>`,
    ],
    rightItems: [
      `<span>${esc(statusRight || 'Shopee · TikTok · Tokopedia · Lazada API v2')}</span>`,
      `<span>TokoSync Omni v4.8.2</span>`,
    ],
  });

  const bodyHtml = `
    ${topbarHtml}
    <div class="e-shell-body">
      ${sidebarHtml}
      <main class="e-main">
        <div class="ts-subbar">
          <div class="e-crumb">
            <span>TokoSync</span>
            ${ic('chevronRight', 11, '#94a3b8')}
            <span>${esc(breadcrumb)}</span>
            ${ic('chevronRight', 11, '#94a3b8')}
            <strong>${esc(pageTitle)}</strong>
          </div>
          <div style="display:flex;align-items:center;gap:7px;">
            ${actionsHtml}
          </div>
        </div>
        <div class="e-content">
          ${contentHtml}
        </div>
      </main>
    </div>
    ${footerHtml}
  `;

  return wrapEnterpriseHtml({
    title: `TokoSync Omni — ${pageTitle}`,
    accent: '#0e6b5e',
    accentSoft: '#e7f5f2',
    accentInk: '#08473e',
    bg: '#f4f6f5',
    surface: '#ffffff',
    surface2: '#fafcfb',
    border: '#d7e0dc',
    borderStrong: '#c1cfc9',
    text: '#0b241f',
    text2: '#3f554f',
    muted: '#5b706a',
    extraCss: CUSTOM_CSS,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1: PUSAT KENDALI OMNICHANNEL & PENJAGA FLASH SALE
// ============================================================================
function renderPage1() {
  const velocityChart = svgMultiLineChart({
    width: 810,
    height: 224,
    xLabels: HOURS,
    yMin: 0,
    yMax: 70,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)} ord`,
    threshold: { value: 44, label: 'Burst 44/j', color: '#b45309' },
    annotations: [
      { index: 12, seriesIdx: 0, label: '12:00 Flash Sale TikTok (54 ord/jam)', color: '#0e6b5e', dy: -26 },
    ],
    series: [
      { label: 'TikTok Shop (246)', values: HOURLY_ORDERS.tiktok, color: '#0e6b5e', area: true, dots: true, width: 2.1 },
      { label: 'Shopee Mall (184)', values: HOURLY_ORDERS.shopee, color: '#ea580c', width: 1.8 },
      { label: 'Tokopedia (118)', values: HOURLY_ORDERS.tokopedia, color: '#059669', width: 1.7 },
      { label: 'Lazada + Web (70)', values: HOURLY_ORDERS.other, color: '#2563eb', dashed: true, width: 1.5 },
    ],
  });

  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Pesanan Hari Ini</span>${badge('+34,2%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_ORDERS)} order</span>
        ${svgSparkline({ points: [18, 26, 31, 42, 54, 88, 99, 84, 74, 57], color: '#0e6b5e' })}
      </div>
      <div class="e-kpi-foot"><span>GMV Bruto Hari Ini</span><span class="mono" style="font-weight:700;color:#0b241f;">${fmtIdr(TOTAL_GMV)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Risiko Oversell</span>${badge('0 Penalti', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">0 SKU</span>
        ${svgSparkline({ points: [0, 0, 0, 0, 0, 0, 0, 0], color: '#047857', fill: false })}
      </div>
      <div class="e-kpi-foot"><span>Redis Lua Atomic Lock</span><span class="mono" style="font-weight:700;color:#047857;">18.420 lock/jam</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Antrean Fulfillment Aktif</span>${badge('4 Wave', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_WAVE_PKGS)} paket</span>
        ${svgSparkline({ points: [110, 148, 210, 290, 360, 412], color: '#0369a1' })}
      </div>
      <div class="e-kpi-foot"><span>Siap Cetak Thermal</span><span class="mono" style="font-weight:700;color:#0369a1;">${TOTAL_READY_AWB} Resi AWB</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Selisih Biaya Escrow</span>${badge('Auto-Tiket', 'bad')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#be123c;">-Rp 184.200</span>
        ${svgSparkline({ points: [0, 0, 47, 109, 184], color: '#be123c' })}
      </div>
      <div class="e-kpi-foot"><span>Payout #TP-1119</span><span class="mono" style="font-weight:700;color:#be123c;">3 Pesanan</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>SKU Kunci Buffer Flash</span>${badge('Proteksi ON', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">6 SKU</span>
        ${svgSparkline({ points: [2, 2, 3, 4, 6, 6], color: '#b45309' })}
      </div>
      <div class="e-kpi-foot"><span>Hemat Ongkir 3 Gudang</span><span class="mono" style="font-weight:700;color:#047857;">Rp 14,82 jt/bln</span></div>
    </div>
  </div>`;

  const channelHealthRows = CHANNELS.map(
    (c) => `<div style="display:grid;grid-template-columns:102px 52px 88px 44px 1fr 68px;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid #edf2f0;">
      <div>${chChip(c.id, c.name)}</div>
      <div class="mono num" style="font-weight:700;color:#0b241f;font-size:10px;">${c.orders} ord</div>
      <div class="mono num" style="font-size:9.8px;color:#3f554f;">${fmtIdr(c.gmv)}</div>
      <div class="mono num" style="font-size:9.8px;color:#047857;">${c.webhookMs} ms</div>
      <div style="min-width:0;">${renderCapacityBar(c.quotaPct, { warnAt: 70, critAt: 85 })}</div>
      <div style="text-align:right;">${badge(c.status, c.tone)}</div>
    </div>`
  ).join('');

  const priorityTableRows = PRIORITY_ITEMS.map(
    (it, idx) => `<tr class="${it.tone === 'bad' ? 'is-bad' : idx === 2 ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#08473e;">${esc(it.code)}</td>
      <td>${chChip(it.channel)}</td>
      <td>
        <div style="font-weight:700;color:#0b241f;font-size:10.8px;" class="trunc">${esc(it.title)}</div>
        <div style="font-size:9.5px;color:#5b706a;" class="trunc">${esc(it.sub)}</div>
      </td>
      <td class="mono" style="font-size:10px;color:#3f554f;">${esc(it.wh)}</td>
      <td class="mono num" style="font-weight:700;color:${it.tone === 'bad' ? '#be123c' : '#0b241f'};">${esc(it.value)}</td>
      <td>${badge(it.status, it.tone)}</td>
      <td style="text-align:right;"><span class="e-btn" style="height:20px;font-size:9.5px;padding:0 6px;">${esc(it.action)}</span></td>
    </tr>`
  ).join('');

  const warehouseCards = WAREHOUSES.map((w) => {
    const share = ((w.orders / TOTAL_ORDERS) * 100).toFixed(1).replace('.', ',');
    return `<div style="padding:8px 10px;border:1px solid #d7e0dc;border-radius:4px;background:#fafcfb;margin-bottom:7px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="mono" style="font-weight:800;font-size:11px;color:#08473e;">${esc(w.code)}</span>
          <span style="font-weight:600;color:#0b241f;font-size:10.8px;">${esc(w.name)}</span>
        </div>
        ${badge(w.status, w.tone)}
      </div>
      <div style="display:grid;grid-template-columns:1.05fr 1.15fr 0.72fr 1.32fr;gap:6px;margin-bottom:5px;font-size:10px;white-space:nowrap;">
        <div><span style="color:#5b706a;">Pesanan:</span> <strong class="mono">${w.orders} (${share}%)</strong></div>
        <div><span style="color:#5b706a;">GMV:</span> <strong class="mono">${fmtIdr(w.gmv)}</strong></div>
        <div><span style="color:#5b706a;">Packer:</span> <strong class="mono">${w.packers} org</strong></div>
        <div style="text-align:right;"><span style="color:#5b706a;">Cut-off:</span> <strong class="mono">${esc(w.nextCutoff)}</strong></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:9.5px;color:#5b706a;width:72px;flex-shrink:0;">Beban Packing</span>
        <div style="flex:1;">${renderCapacityBar(w.utilPct, { warnAt: 75, critAt: 90 })}</div>
        <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">Hemat ${fmtIdr(w.savingsMtd)}/bln</span>
      </div>
    </div>`;
  }).join('');

  const contentHtml = `
    <div class="ts-alert-bar">
      <div style="display:flex;align-items:center;gap:7px;">
        ${ic('shield', 14, '#0e6b5e')}
        <strong>Penjaga Flash Sale TikTok 12.12 Aktif:</strong>
        <span>6 SKU sensitif terkunci buffer di Shopee & Tokopedia · 0 oversell · 42 resi AWB Wave #16/#17 siap dicetak sebelum cut-off 15:00 WIB.</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span class="mono" style="font-size:9.8px;font-weight:700;">Redis Lock TTL: 45s</span>
        ${badge('SLA 98,7%', 'ok')}
      </div>
    </div>

    ${kpiStrip}

    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;height:332px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0e6b5e')}<span>Kecepatan Pesanan Per Jam & Lonjakan Flash Sale (00:00–15:00 WIB)</span></div>
          <span class="e-panel-sub mono">Total Terverifikasi: ${fmtNum(TOTAL_ORDERS)} order · ${fmtIdr(TOTAL_GMV)}</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          ${velocityChart}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding-top:6px;border-top:1px solid #e6eeea;">
            <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 7px;">
              <div style="font-size:9.2px;color:#5b706a;">TikTok Shop (39,8%)</div>
              <div class="mono" style="font-size:11px;font-weight:700;color:#0b241f;">246 ord · Rp 51,66 jt</div>
            </div>
            <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 7px;">
              <div style="font-size:9.2px;color:#5b706a;">Shopee Mall (29,8%)</div>
              <div class="mono" style="font-size:11px;font-weight:700;color:#0b241f;">184 ord · Rp 37,72 jt</div>
            </div>
            <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 7px;">
              <div style="font-size:9.2px;color:#5b706a;">Tokopedia (19,1%)</div>
              <div class="mono" style="font-size:11px;font-weight:700;color:#0b241f;">118 ord · Rp 24,78 jt</div>
            </div>
            <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 7px;">
              <div style="font-size:9.2px;color:#5b706a;">Lazada + Webstore (11,3%)</div>
              <div class="mono" style="font-size:11px;font-weight:700;color:#0b241f;">70 ord · Rp 14,30 jt</div>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('zap', 13, '#0e6b5e')}<span>Sinkronisasi API Channel & Kunci Redis Lua</span></div>
          ${badge('5/5 Terhubung', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:grid;grid-template-columns:102px 52px 88px 44px 1fr 68px;gap:6px;padding-bottom:4px;border-bottom:1px solid #cfdcd6;font-size:9.2px;font-weight:700;color:#5b706a;">
              <span>Channel</span><span class="num">Order</span><span class="num">GMV</span><span class="num">p95</span><span>Kuota API</span><span style="text-align:right;">Status</span>
            </div>
            ${channelHealthRows}
          </div>
          <div class="ts-code" style="margin-top:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
              <span style="font-weight:700;color:#08473e;">REDIS LUA ATOMIC STOCK LOCK · LIVE</span>
              <span style="color:#047857;font-weight:700;">0,84 ms · 0 Oversell</span>
            </div>
            <div style="color:#1e293b;">Redis Stock Lock: SKU-109 fisik=18 dipesan=14 -&gt; Tersedia=4 di TikTok, 0 di Shopee/Tokopedia (aturan buffer).</div>
          </div>
        </div>
      </section>
    </div>

    <div style="display:grid;grid-template-columns:1.42fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0e6b5e')}<span>Meja Fulfillment Omnichannel & Antrean Insiden Aktif</span></div>
          <span class="e-panel-sub">8 item prioritas · Sinkronisasi real-time</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:74px;">Kode</th>
                <th style="width:82px;">Channel</th>
                <th>Tugas / Item Operasional</th>
                <th style="width:76px;">Gudang</th>
                <th class="num" style="width:106px;">Nilai / Kuota</th>
                <th style="width:94px;">Status</th>
                <th style="width:94px;text-align:right;">Tindakan</th>
              </tr>
            </thead>
            <tbody>${priorityTableRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total Hari Ini: 412 paket di 4 Wave aktif + 206 paket telah diserahkan kurir (Batch Pagi)</td>
                <td class="mono num">${fmtNum(TOTAL_ORDERS)} order</td>
                <td colspan="2" style="text-align:right;color:#047857;">0 SKU Risiko Oversell</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#0e6b5e')}<span>Distribusi Multi-Gudang (Jabodetabek · Surabaya · Medan)</span></div>
          <span class="e-panel-sub mono">Total Hemat ${fmtIdr(TOTAL_SAVINGS)}/bln</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>${warehouseCards}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#e7f5f2;border:1px solid #99d5cb;border-radius:4px;font-size:10.2px;color:#08473e;">
            <span><strong>Routing Otomatis Aktif:</strong> 240 pesanan luar Jabodetabek dipenuhi langsung dari Gdg-SBY &amp; Gdg-MDN.</span>
            <span class="mono" style="font-weight:800;white-space:nowrap;">-38,4% Ongkir</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeNav: 'p1',
    breadcrumb: 'Operasional Harian',
    pageTitle: 'Meja Fulfillment Omnichannel',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 12, '#3f554f')} Atur Ulang Buffer</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 12, '#ffffff')} Cetak ${TOTAL_READY_AWB} Resi AWB</span>
    `,
    contentHtml,
    statusRight: 'Tokopedia · TikTok · Shopee · Lazada · 3PL',
  });
}

// ============================================================================
// PAGE 2: MATRIKS STOK MULTI-CHANNEL & KUNCI BUFFER REDIS LUA
// ============================================================================
function renderPage2() {
  const sumPhys = SKUS.reduce((a, s) => a + s.physical, 0);
  const sumRes = SKUS.reduce((a, s) => a + s.reserved, 0);
  const sumTP = SKUS.reduce((a, s) => a + s.tokped, 0);
  const sumTT = SKUS.reduce((a, s) => a + s.tiktok, 0);
  const sumSP = SKUS.reduce((a, s) => a + s.shopee, 0);
  const sumLZ = SKUS.reduce((a, s) => a + s.lazada, 0);

  const skuRows = SKUS.map((s) => {
    const avail = s.physical - s.reserved;
    const rowCls = s.selected ? 'is-selected' : s.locked ? 'is-warn' : '';
    return `<tr class="${rowCls}">
      <td style="padding:4px 7px;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          ${skuThumbSvg(s.icon, s.tint, 28)}
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:5px;">
              <span class="mono" style="font-size:9.8px;font-weight:700;color:#08473e;">${esc(s.code)}</span>
              <span style="font-weight:700;color:#0b241f;font-size:10.8px;" class="trunc">${esc(s.name)}</span>
            </div>
            <div style="font-size:9.2px;color:#5b706a;" class="trunc">${esc(s.cat)} · JKT ${s.jkt} · SBY ${s.sby} · MDN ${s.mdn}</div>
          </div>
        </div>
      </td>
      <td class="mono num" style="font-weight:700;">${fmtNum(s.physical)}</td>
      <td class="mono num" style="color:${s.locked ? '#b45309' : '#475569'};font-weight:600;">${fmtNum(s.reserved)}</td>
      <td class="mono num" style="font-weight:700;color:${avail <= s.buffer ? '#be123c' : '#047857'};">${fmtNum(avail)}</td>
      <td class="mono num" style="color:${s.tokped === 0 ? '#be123c' : '#0b241f'};font-weight:${s.tokped === 0 ? '700' : '500'};">${s.tokped === 0 ? '0 (Lock)' : fmtNum(s.tokped)}</td>
      <td class="mono num" style="font-weight:700;color:#08473e;">${fmtNum(s.tiktok)}</td>
      <td class="mono num" style="color:${s.shopee === 0 ? '#be123c' : '#0b241f'};font-weight:${s.shopee === 0 ? '700' : '500'};">${s.shopee === 0 ? '0 (Lock)' : fmtNum(s.shopee)}</td>
      <td class="mono num" style="color:${s.lazada === 0 ? '#94a3b8' : '#0b241f'};">${s.lazada === 0 ? '0' : fmtNum(s.lazada)}</td>
      <td style="font-size:9.8px;color:#3f554f;">${esc(s.rule)}</td>
      <td>${badge(s.status, s.tone)}</td>
    </tr>`;
  }).join('');

  const lockWaterfall = svgSpanWaterfall({
    width: 368,
    totalMs: 28,
    spans: [
      { label: '1. Webhook TikTok Ingest', start: 0, dur: 4.1, color: '#0369a1' },
      { label: '2. Redis Lua EVALSHA Lock', start: 4.1, dur: 0.8, color: '#0e6b5e' },
      { label: '3. RabbitMQ Fanout Event', start: 4.9, dur: 2.9, color: '#d97706' },
      { label: '4. Push Qty=0 ke Shopee', start: 7.8, dur: 11.4, color: '#ea580c' },
      { label: '5. Push Qty=0 ke Tokopedia', start: 7.8, dur: 16.2, color: '#059669' },
    ],
  });

  const sel = SKUS[0]; // SKU-109
  const marginPct = (((sel.price - sel.hpp) / sel.price) * 100).toFixed(1).replace('.', ',');

  const contentHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;height:32px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="e-btn e-btn-primary" style="height:26px;">Semua SKU Aktif (15)</span>
        <span class="e-btn" style="height:26px;border-color:#fde68a;background:#fffbeb;color:#b45309;">Kunci Buffer Flash (6)</span>
        <span class="e-btn" style="height:26px;">Tersinkron Normal (9)</span>
        <span class="e-btn" style="height:26px;">${ic('filter', 11, '#5b706a')} Gudang: Semua (3)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">Auto-Lock Flash Sale: AKTIF</span>
        <span class="e-btn" style="height:26px;">${ic('refresh', 11, '#0e6b5e')} Sinkron Paksa 4 Channel</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 396px;gap:10px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#0e6b5e')}<span>Matriks Sinkronisasi Stok Master Multi-Channel (Redis Atomic Counters)</span></div>
          <span class="e-panel-sub mono">0 Oversell · Update sub-detik via RabbitMQ</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th>Produk &amp; Distribusi 3 Gudang</th>
                <th class="num" style="width:48px;">Fisik</th>
                <th class="num" style="width:56px;">Dipesan</th>
                <th class="num" style="width:60px;">Tersedia</th>
                <th class="num" style="width:74px;">Tokopedia</th>
                <th class="num" style="width:58px;">TikTok</th>
                <th class="num" style="width:74px;">Shopee</th>
                <th class="num" style="width:50px;">Lazada</th>
                <th style="width:124px;">Aturan Buffer</th>
                <th style="width:86px;">Status</th>
              </tr>
            </thead>
            <tbody>${skuRows}</tbody>
            <tfoot>
              <tr>
                <td>Total 15 SKU Katalog Inti (6 Terkunci Buffer Flash)</td>
                <td class="mono num">${fmtNum(sumPhys)}</td>
                <td class="mono num">${fmtNum(sumRes)}</td>
                <td class="mono num" style="color:#047857;">${fmtNum(sumPhys - sumRes)}</td>
                <td class="mono num">${fmtNum(sumTP)}</td>
                <td class="mono num" style="color:#08473e;">${fmtNum(sumTT)}</td>
                <td class="mono num">${fmtNum(sumSP)}</td>
                <td class="mono num">${fmtNum(sumLZ)}</td>
                <td colspan="2" style="text-align:right;color:#047857;">Invarian Aman 100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#0e6b5e')}<span>Inspektor Kunci Stok · ${esc(sel.code)}</span></div>
          ${badge('Kunci Buffer', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;padding:8px;background:#fafcfb;border:1px solid #d7e0dc;border-radius:4px;">
            ${skuThumbSvg(sel.icon, sel.tint, 44)}
            <div style="min-width:0;flex:1;">
              <div style="font-weight:800;font-size:12px;color:#0b241f;">${esc(sel.name)}</div>
              <div class="mono" style="font-size:9.5px;color:#5b706a;margin-top:2px;">EAN-13: ${sel.ean} · Batch #LB-2611A</div>
              <div style="display:flex;gap:10px;margin-top:4px;font-size:10px;">
                <span>Harga: <strong class="mono">${fmtIdr(sel.price)}</strong></span>
                <span>HPP: <strong class="mono">${fmtIdr(sel.hpp)}</strong></span>
                <span style="color:#047857;font-weight:700;">Margin ${marginPct}%</span>
              </div>
            </div>
          </div>

          <div style="border:1px solid #d7e0dc;border-radius:4px;padding:8px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10.2px;font-weight:700;color:#0b241f;margin-bottom:6px;">
              <span>Alokasi Stok Fisik (18 pcs) vs Reservasi (14 pcs)</span>
              <span class="mono" style="color:#b45309;">Sisa 4 pcs</span>
            </div>
            <div style="display:flex;height:12px;border-radius:3px;overflow:hidden;border:1px solid #cfdcd6;margin-bottom:6px;">
              <div style="width:77.8%;background:#b45309;" title="Dipesan 14"></div>
              <div style="width:22.2%;background:#0e6b5e;" title="Tersedia TikTok 4"></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:9.8px;">
              <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 6px;">
                <div style="color:#5b706a;">Gdg-JKT</div>
                <div class="mono" style="font-weight:700;">12 pcs (9 res)</div>
              </div>
              <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 6px;">
                <div style="color:#5b706a;">Gdg-SBY</div>
                <div class="mono" style="font-weight:700;">4 pcs (3 res)</div>
              </div>
              <div style="background:#f7f9f8;border:1px solid #dce4e0;border-radius:3px;padding:4px 6px;">
                <div style="color:#5b706a;">Gdg-MDN</div>
                <div class="mono" style="font-weight:700;">2 pcs (2 res)</div>
              </div>
            </div>
          </div>

          <div>
            <div style="font-size:10.2px;font-weight:700;color:#0b241f;margin-bottom:4px;display:flex;justify-content:space-between;">
              <span>Eksekusi Skrip Redis Lua (Atomik Sub-Detik)</span>
              <span class="mono" style="font-size:9.2px;color:#0e6b5e;">SHA1: f8a2c91d</span>
            </div>
            <div class="ts-code">
              <div style="color:#0e6b5e;font-weight:700;">EVALSHA f8a2c91d 1 inv:SKU-109 14 15 "TIKTOK_FLASH"</div>
              <div>local avail = redis.call("GET", KEYS[1]) - ARGV[1]</div>
              <div>if avail &lt;= tonumber(ARGV[2]) then</div>
              <div>&nbsp;&nbsp;return { tiktok=avail, shopee=0, tokped=0, lazada=0 }</div>
              <div>end</div>
              <div style="margin-top:4px;padding-top:4px;border-top:1px dashed #c1cfc9;color:#047857;font-weight:700;">=&gt; OK 0,84ms | fisik=18 dipesan=14 -&gt; TikTok=4, Shopee=0, Tokped=0</div>
            </div>
          </div>

          <div style="border:1px solid #d7e0dc;border-radius:4px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;font-size:10.2px;font-weight:700;color:#0b241f;margin-bottom:4px;">
              <span>Jejak Propagasi Kunci ke Marketplace</span>
              <span class="mono" style="font-size:9.5px;color:#047857;">Total 24,0 ms</span>
            </div>
            ${lockWaterfall}
          </div>

          <div style="border:1px solid #d7e0dc;border-radius:4px;padding:7px 9px;background:#fafcfb;">
            <div style="font-size:10.2px;font-weight:700;color:#0b241f;margin-bottom:5px;">Log Push API Terakhir (SKU-109)</div>
            <div class="mono" style="font-size:9.4px;display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;"><span>14:17:48 · Shopee setStock(0)</span><span style="color:#047857;font-weight:700;">200 OK · 11ms</span></div>
              <div style="display:flex;justify-content:space-between;"><span>14:17:48 · Tokopedia setStock(0)</span><span style="color:#047857;font-weight:700;">200 OK · 16ms</span></div>
              <div style="display:flex;justify-content:space-between;"><span>14:17:48 · Lazada setStock(0)</span><span style="color:#047857;font-weight:700;">200 OK · 14ms</span></div>
              <div style="display:flex;justify-content:space-between;"><span>14:17:48 · TikTok setStock(4)</span><span style="color:#0e6b5e;font-weight:700;">200 OK · 9ms</span></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <span class="e-btn" style="justify-content:center;">${ic('sliders', 11, '#3f554f')} Ubah Batas Buffer</span>
            <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('refresh', 11, '#ffffff')} Sinkronkan SKU-109</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeNav: 'p2',
    breadcrumb: 'Katalog & Stok',
    pageTitle: 'Matriks Stok Multi-Channel & Kunci Buffer Redis Lua',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#3f554f')} Ekspor CSV Stok</span>
      <span class="e-btn e-btn-primary">${ic('lock', 12, '#ffffff')} Atur Ulang Buffer Flash</span>
    `,
    contentHtml,
    statusRight: 'Redis Cluster 7.2 · Lua Script Atomic Guard',
  });
}

// ============================================================================
// PAGE 3: MEJA WAVE-PICKING & CETAK AWB THERMAL MASSAL
// ============================================================================
function renderBarcodeSvg(width = 310, height = 44) {
  const bars = [2,1,3,1,1,2,4,1,2,1,1,3,2,1,2,2,1,3,1,1,2,3,1,2,1,2,3,1,1,2,2,1,3,2,1,2,1,3,1,2,2,1,1,3,2,1,2,2,1,3,1,2,1,2,3,1,2];
  let x = 8;
  let rects = '';
  bars.forEach((w, i) => {
    const bw = w * 2.4;
    if (i % 2 === 0 && x + bw < width - 8) {
      rects += `<rect x="${x.toFixed(1)}" y="2" width="${bw.toFixed(1)}" height="${height - 4}" fill="#0f172a"/>`;
    }
    x += bw;
  });
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">${rects}</svg>`;
}

function renderQrSvg(size = 64) {
  const pat = [
    '11111110101101111111',
    '10000010011001000001',
    '10111010110101011101',
    '10111010001101011101',
    '10111010100101011101',
    '10000010111001000001',
    '11111110101011111111',
    '00000000110100000000',
    '10110111001110101101',
    '01001001110011010010',
    '11011100101101101101',
    '00100111010010011010',
    '11101010111010110101',
    '00000000100110001100',
    '11111110111010101011',
    '10000010010101110100',
    '10111010101110011011',
    '10111010110001010110',
    '10000010001110101001',
    '11111110110101110101',
  ];
  const cell = size / 20;
  let rects = `<rect width="${size}" height="${size}" fill="#ffffff"/>`;
  pat.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '1') {
        rects += `<rect x="${(c * cell).toFixed(1)}" y="${(r * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="#0f172a"/>`;
      }
    }
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;flex-shrink:0;">${rects}</svg>`;
}

function renderPage3() {
  const waveCards = WAVES.map(
    (w, idx) => `<div class="e-kpi" style="${idx === 0 ? 'border-color:#0e6b5e;background:#f4fbf9;' : ''}">
      <div class="e-kpi-top">
        <span class="mono" style="font-weight:800;color:#08473e;">${esc(w.id)} · ${esc(w.courier)}</span>
        ${badge(w.status, w.tone)}
      </div>
      <div class="e-kpi-mid" style="margin:2px 0;">
        <span class="e-kpi-val" style="font-size:15.5px;">${w.pkgs} paket</span>
        <span class="mono" style="font-size:10.5px;font-weight:700;color:#0b241f;">${fmtIdr(w.value)}</span>
      </div>
      <div class="e-kpi-foot">
        <span>${esc(w.wh)} · ${esc(w.cutoff)}</span>
        <span class="mono" style="font-weight:700;color:${w.readyToPrint > 0 ? '#0369a1' : w.tone === 'warn' ? '#b45309' : '#047857'};">${w.readyToPrint > 0 ? `${w.readyToPrint} AWB siap cetak` : esc(w.slaLeft)}</span>
      </div>
    </div>`
  ).join('');

  const pickRows = PICK_BINS.map(
    (b) => `<tr>
      <td class="mono" style="font-weight:800;color:#08473e;">${esc(b.bin)}</td>
      <td>
        <div style="font-weight:700;font-size:10.5px;color:#0b241f;" class="trunc">${esc(b.name)}</div>
        <div class="mono" style="font-size:9px;color:#5b706a;">${esc(b.sku)}</div>
      </td>
      <td class="mono num" style="font-weight:700;">${b.picked} / ${b.req}</td>
      <td style="text-align:right;">${badge(b.status, b.tone)}</td>
    </tr>`
  ).join('');

  const awbRows = AWB_QUEUE.map(
    (q) => `<tr class="${q.selected ? 'is-selected' : ''}">
      <td style="width:24px;"><span class="cb checked">${ic('check', 9, '#ffffff')}</span></td>
      <td>
        <div class="mono" style="font-weight:700;font-size:10.2px;color:#0b241f;">${esc(q.ord)}</div>
        <div style="font-size:9.2px;color:#5b706a;" class="trunc">${esc(q.buyer)}</div>
      </td>
      <td>${chChip(q.ch)}</td>
      <td>
        <div style="font-weight:700;font-size:10px;color:#0b241f;">${esc(q.courier)}</div>
        <div class="mono" style="font-size:9px;color:#5b706a;">${esc(q.awb)}</div>
      </td>
      <td class="mono" style="font-size:9.8px;">${esc(q.wh)}</td>
      <td class="mono num" style="font-size:9.8px;">${q.gr} g</td>
      <td style="text-align:right;">${badge(q.st, q.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);height:84px;">
      ${waveCards}
    </div>

    <div style="display:grid;grid-template-columns:420px 1fr 392px;gap:10px;flex:1;min-height:0;">
      <!-- LEFT: WAVE PICK-LIST + PRINTER SPOOLERS -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#0e6b5e')}<span>Wave #14 · Pick-List Rak Gdg-JKT</span></div>
            ${badge('118 / 142 Dipindai', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <div style="padding:7px 10px;background:#fafcfb;border-bottom:1px solid #e2eae6;">
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;">
                <span><strong>J&amp;T Express · TikTok Shop</strong> (Cut-off 15:00 WIB)</span>
                <span class="mono" style="font-weight:700;color:#0e6b5e;">83,1%</span>
              </div>
              ${renderCapacityBar(83.1, { warnAt: 95, critAt: 99, showLabel: false })}
              <div style="display:flex;justify-content:space-between;font-size:9.4px;color:#5b706a;margin-top:4px;">
                <span>Picker: R. Fadli, S. Wulandari, M. Ilham</span>
                <span class="mono">266 pcs total · 24 pcs sisa</span>
              </div>
            </div>
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:48px;">Rak</th>
                  <th>Produk &amp; SKU</th>
                  <th class="num" style="width:78px;">Dipindai</th>
                  <th style="width:70px;text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>${pickRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total 10 Lokasi Rak Wave #14</td>
                  <td class="mono num">242 / 266</td>
                  <td style="text-align:right;color:#0e6b5e;">91,0% Pcs</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#fafcfb;border-top:1px solid #e2eae6;display:flex;justify-content:space-between;align-items:center;font-size:9.6px;color:#3f554f;">
              <span>Scanner Barcode Aktif: <strong>3/3 Unit RF</strong></span>
              <span class="mono" style="color:#047857;font-weight:700;">0 Salah Pindai</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:184px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 13, '#0e6b5e')}<span>Spooler Printer Thermal ZPL II (100×150 mm)</span></div>
            ${badge('3 Online', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:4px;padding:7px 10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:4.5px 7px;background:#f4fbf9;border:1px solid #a7dfd4;border-radius:3px;">
              <div>
                <div style="font-weight:700;font-size:10.3px;">Zebra ZD421-JKT-01 <span class="mono" style="color:#5b706a;font-weight:500;">(10.14.2.18:9100)</span></div>
                <div style="font-size:9.2px;color:#5b706a;">Gdg-JKT · 203 DPI · Kertas sisa 312 label</div>
              </div>
              <span class="mono" style="font-weight:700;color:#047857;font-size:10px;">Siap · 16 antre</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:4.5px 7px;background:#fafcfb;border:1px solid #dce4e0;border-radius:3px;">
              <div>
                <div style="font-weight:700;font-size:10.3px;">Xprinter XP-420B-SBY <span class="mono" style="color:#5b706a;font-weight:500;">(10.14.6.22:9100)</span></div>
                <div style="font-size:9.2px;color:#5b706a;">Gdg-SBY · 203 DPI · Kertas sisa 440 label</div>
              </div>
              <span class="mono" style="font-weight:700;color:#0369a1;font-size:10px;">Siap · 18 antre</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:4.5px 7px;background:#fafcfb;border:1px solid #dce4e0;border-radius:3px;">
              <div>
                <div style="font-weight:700;font-size:10.3px;">Zebra ZD220-MDN <span class="mono" style="color:#5b706a;font-weight:500;">(10.14.9.11:9100)</span></div>
                <div style="font-size:9.2px;color:#5b706a;">Gdg-MDN · 203 DPI · Kertas sisa 280 label</div>
              </div>
              <span class="mono" style="font-weight:700;color:#0369a1;font-size:10px;">Siap · 8 antre</span>
            </div>
          </div>
        </section>
      </div>

      <!-- CENTER: BATCH AWB QUEUE -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#0e6b5e')}<span>Antrean Batch Cetak AWB Massal</span></div>
          <span class="e-panel-sub mono">42 resi (24 SiCepat · 18 JNE)</span>
        </div>
        <div class="e-panel-body-flush">
          <div style="padding:6px 10px;background:#f4f7f6;border-bottom:1px solid #d7e0dc;display:flex;align-items:center;justify-content:space-between;font-size:10px;">
            <div style="display:flex;gap:6px;align-items:center;">
              <span class="e-badge e-badge-accent">Urut: Cut-off Kurir</span>
              <span class="e-badge e-badge-neutral">Format: ZPL II 100x150mm</span>
              <span class="e-badge e-badge-ok">Auto-Manifest: ON</span>
            </div>
            <span class="mono" style="color:#08473e;font-weight:700;">Menampilkan 14 dari 42 resi</span>
          </div>
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:24px;"></th>
                <th>No. Pesanan &amp; Penerima</th>
                <th style="width:74px;">Channel</th>
                <th style="width:112px;">Kurir &amp; AWB</th>
                <th style="width:66px;">Gudang</th>
                <th class="num" style="width:52px;">Berat</th>
                <th style="width:78px;text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>${awbRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">Batch Siap Spool: 24 SiCepat (Wave #16) + 18 JNE (Wave #17)</td>
                <td colspan="3" class="mono" style="text-align:right;color:#08473e;">Total 42 Label · 18,4 kg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- RIGHT: LIVE 100x150 THERMAL AWB VECTOR PREVIEW -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 13, '#0e6b5e')}<span>Pratinjau Label AWB Thermal (100×150 mm)</span></div>
          <span class="mono" style="font-size:9.5px;color:#08473e;font-weight:700;">ZPL II · 203 DPI</span>
        </div>
        <div class="e-panel-body" style="background:#eef2f0;display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:10px 14px;">
          <div class="ts-awb-paper">
            <!-- Header Kurir & Channel -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:2px solid #0f172a;">
              <div>
                <div style="font-size:15px;font-weight:900;letter-spacing:-0.02em;">J&amp;T EXPRESS</div>
                <div class="mono" style="font-size:9px;font-weight:700;">REGULER · TIKTOK SHOP OFFICIAL</div>
              </div>
              <div style="text-align:right;">
                <div style="background:#0f172a;color:#ffffff;font-family:var(--e-mono);font-size:12px;font-weight:800;padding:2px 7px;">EZ-JKT-04A</div>
                <div class="mono" style="font-size:8.5px;margin-top:2px;">WAVE #14 · GDG-JKT</div>
              </div>
            </div>

            <!-- Main AWB Barcode -->
            <div style="padding:7px 10px 5px;border-bottom:1.5px solid #0f172a;text-align:center;">
              ${renderBarcodeSvg(320, 44)}
              <div class="mono" style="font-size:12px;font-weight:800;letter-spacing:0.12em;margin-top:2px;">JP8492014482</div>
            </div>

            <!-- Sort Hub & Payment Strip -->
            <div style="display:grid;grid-template-columns:1.2fr 1fr;border-bottom:1.5px solid #0f172a;">
              <div style="padding:6px 10px;border-right:1.5px solid #0f172a;">
                <div style="font-size:8.5px;font-weight:700;color:#475569;">KODE SORTIR TUJUAN</div>
                <div class="mono" style="font-size:17px;font-weight:900;line-height:1.1;">JKT-S04-KBY</div>
              </div>
              <div style="padding:6px 10px;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#f8fafc;">
                <div class="mono" style="font-size:11px;font-weight:900;border:1.5px solid #0f172a;padding:2px 8px;">NON-COD · LUNAS</div>
                <div class="mono" style="font-size:8.8px;margin-top:3px;">Berat: 420 gr · 1/1 Koli</div>
              </div>
            </div>

            <!-- Penerima & QR -->
            <div style="display:flex;gap:10px;padding:8px 10px;border-bottom:1.5px solid #0f172a;">
              <div style="flex:1;min-width:0;">
                <div style="font-size:8.5px;font-weight:800;letter-spacing:0.04em;">PENERIMA:</div>
                <div style="font-size:11.5px;font-weight:800;margin-top:1px;">Ibu Ratna Sari (+62 812-8841-****)</div>
                <div style="font-size:9.8px;line-height:1.35;margin-top:2px;">Jl. Dharmawangsa Raya No. 18B, Kel. Pulo, Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160</div>
              </div>
              ${renderQrSvg(62)}
            </div>

            <!-- Pengirim -->
            <div style="padding:6px 10px;border-bottom:1.5px solid #0f172a;font-size:9.5px;display:flex;justify-content:space-between;">
              <div><strong>PENGIRIM:</strong> PT Lumina Botanika Nusantara (Gdg-JKT Cakung)</div>
              <div class="mono" style="font-weight:700;">Ref: TT-261122-88241</div>
            </div>

            <!-- Item Packing Manifest -->
            <div style="padding:9px 10px;font-size:9.6px;">
              <div style="font-weight:800;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin-bottom:5px;display:flex;justify-content:space-between;">
                <span>ISI PAKET (SKU / RAK)</span>
                <span>QTY</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:3px 0;">
                <span><strong>[A1-02]</strong> SKU-109 · Serum Niacinamide 10% 30ml (Flash)</span>
                <strong class="mono">2 pcs</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:3px 0;">
                <span><strong>[B2-01]</strong> SKU-121 · Barrier Ceramide Repair Gel 50g</span>
                <strong class="mono">1 pcs</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:3px 0;color:#475569;">
                <span><strong>[BUB-M]</strong> Bubble Wrap Tebal + Kardus Mailer 20x15</span>
                <strong class="mono">1 set</strong>
              </div>
              <div style="margin-top:8px;padding-top:7px;border-top:1px dashed #64748b;display:flex;justify-content:space-between;align-items:center;font-family:var(--e-mono);font-size:8.6px;">
                <span>QC PACKER: R. FADLI · PINDAI BARCODE OK</span>
                <span style="border:1px solid #0f172a;padding:1px 5px;font-weight:800;">FRAGILE · CAIRAN</span>
              </div>
            </div>

            <!-- Secondary Manifest Barcode -->
            <div style="padding:6px 14px 4px;border-top:1.5px solid #0f172a;text-align:center;">
              ${renderBarcodeSvg(310, 26)}
              <div class="mono" style="font-size:8.8px;font-weight:700;margin-top:2px;">ORDER REF: TT-261122-88241 · MANIFEST #MNF-14-JKT</div>
            </div>

            <!-- Footer Label -->
            <div style="padding:6px 10px;border-top:1.5px solid #0f172a;background:#f8fafc;display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:8.5px;font-weight:700;">
              <span>TokoSync AWB Engine · Wajib Video Unboxing</span>
              <span>Cetak: 22/11 14:18 WIB</span>
            </div>
          </div>

          <div style="background:#ffffff;border:1px solid #d7e0dc;border-radius:4px;padding:8px 10px;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;">
              <span style="color:#5b706a;">Target Spooler:</span>
              <strong class="mono" style="color:#08473e;">Zebra ZD421-JKT-01 (TCP/9100)</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px;">
              <span style="color:#5b706a;">Estimasi Waktu Cetak 42 Resi:</span>
              <strong class="mono" style="color:#047857;">14,2 detik (3 label/dtk)</strong>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:2px;">
              <span class="e-btn" style="justify-content:center;">Unduh PDF Batch</span>
              <span class="e-btn e-btn-primary" style="justify-content:center;">Kirim ke Zebra ZPL</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeNav: 'p3',
    breadcrumb: 'Operasional Harian',
    pageTitle: 'Meja Wave-Picking & Cetak AWB Thermal Massal',
    actionsHtml: `
      <span class="e-btn">${ic('checkCircle', 12, '#047857')} Konfirmasi Serah Terima Kurir</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 12, '#ffffff')} Cetak ${TOTAL_READY_AWB} Resi AWB (ZPL II)</span>
    `,
    contentHtml,
    statusRight: 'AWB Thermal ZPL II · J&T · SiCepat · JNE · GoSend',
  });
}

// ============================================================================
// PAGE 4: REKONSILIASI ESCROW, MARGIN WATERFALL & SANGGAH BIAYA
// ============================================================================
function renderWaterfallSvg(width = 738, height = 258) {
  const padL = 62;
  const padR = 14;
  const padT = 26;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = 520000000;
  const yPos = (v) => padT + plotH - (v / maxVal) * plotH;

  let out = '';
  for (let i = 0; i <= 4; i++) {
    const v = (maxVal / 4) * i;
    const y = yPos(v);
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="#e2eae6" stroke-width="1" ${i > 0 ? 'stroke-dasharray="2,3"' : ''}/>`;
    out += `<text x="${padL - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#5b706a">Rp ${Math.round(v / 1000000)} jt</text>`;
  }

  const slotW = plotW / WATERFALL.length;
  const barW = Math.min(62, slotW * 0.62);
  let running = 0;

  WATERFALL.forEach((step, i) => {
    const cx = padL + slotW * i + (slotW - barW) / 2;
    let yTop, yBot;
    if (step.type === 'start' || step.type === 'end') {
      yTop = yPos(step.amount);
      yBot = yPos(0);
      running = step.amount;
    } else {
      const prev = running;
      running += step.amount;
      yTop = yPos(Math.max(prev, running));
      yBot = yPos(Math.min(prev, running));
    }
    const barH = Math.max(5, yBot - yTop);
    out += `<rect x="${cx.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${step.color}" />`;

    // Connector line to next bar
    if (i < WATERFALL.length - 1) {
      const connY = yPos(running);
      const nextX = padL + slotW * (i + 1) + (slotW - barW) / 2;
      out += `<line x1="${(cx + barW).toFixed(1)}" y1="${connY.toFixed(1)}" x2="${nextX.toFixed(1)}" y2="${connY.toFixed(1)}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>`;
    }

    // Value label above bar
    const sign = step.type === 'pos' ? '+' : step.type === 'neg' ? '-' : '';
    const jt = (Math.abs(step.amount) / 1000000).toFixed(1).replace('.', ',');
    const lblText = `${sign}Rp ${jt} jt`;
    out += `<text x="${(cx + barW / 2).toFixed(1)}" y="${(yTop - 6).toFixed(1)}" text-anchor="middle" font-size="9.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${step.color}">${esc(lblText)}</text>`;

    // X label
    out += `<text x="${(cx + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="9.5" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="#293d38">${esc(step.short)}</text>`;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">${out}</svg>`;
}

function renderPage4() {
  const sumOrders = PAYOUT_BATCHES.reduce((a, b) => a + b.orders, 0);
  const sumExp = PAYOUT_BATCHES.reduce((a, b) => a + b.expected, 0);
  const sumAct = PAYOUT_BATCHES.reduce((a, b) => a + b.actual, 0);
  const sumDiff = PAYOUT_BATCHES.reduce((a, b) => a + b.diff, 0);
  const totalDeduct = WATERFALL[0].amount - sumExp; // 61,812,400
  const effFeePct = fmtPct((totalDeduct / WATERFALL[0].amount) * 100, 2);

  const batchRows = PAYOUT_BATCHES.map(
    (b) => `<tr class="${b.selected ? 'is-bad' : ''}">
      <td class="mono" style="font-weight:700;color:${b.diff < 0 ? '#be123c' : '#08473e'};">${esc(b.batch)}</td>
      <td>${chChip(b.ch, b.name)}</td>
      <td class="mono num">${fmtNum(b.orders)}</td>
      <td class="mono num">${fmtIdr(b.expected)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(b.actual)}</td>
      <td class="mono num" style="font-weight:700;color:${b.diff < 0 ? '#be123c' : '#047857'};">${b.diff === 0 ? 'Rp 0' : '-' + fmtIdr(Math.abs(b.diff))}</td>
      <td style="text-align:right;">${badge(b.status, b.tone)}</td>
    </tr>`
  ).join('');

  const ledgerRows = ESCROW_LEDGER.map(
    (r) => `<tr class="${r.bad ? 'is-bad' : ''}">
      <td class="mono" style="font-weight:700;font-size:10px;color:${r.bad ? '#be123c' : '#0b241f'};">${esc(r.inv)}</td>
      <td>${chChip(r.ch)}</td>
      <td class="mono num">${fmtIdr(r.gmv)}</td>
      <td class="mono num" style="color:#5b706a;">-${fmtIdr(r.feeSys)}</td>
      <td class="mono num">${fmtIdr(r.exp)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(r.act)}</td>
      <td class="mono num" style="font-weight:800;color:${r.diff < 0 ? '#be123c' : '#047857'};">${r.diff === 0 ? 'Rp 0' : '-' + fmtIdr(Math.abs(r.diff))}</td>
      <td style="font-size:9.8px;color:${r.bad ? '#9f1239' : '#3f554f'};" class="trunc">${esc(r.note)}</td>
      <td style="text-align:right;">${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const disputedOrders = ESCROW_LEDGER.filter((r) => r.diff < 0);

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>GMV Bruto Batch Nov W3</span>${badge(`${fmtNum(sumOrders)} Order`, 'neutral')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(WATERFALL[0].amount)}</span></div>
        <div class="e-kpi-foot"><span>Periode Settlement</span><span class="mono">15–21 Nov 2026</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Potongan &amp; Subsidi Bersih</span>${badge(effFeePct + ' Efektif', 'warn')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">-${fmtIdr(totalDeduct)}</span></div>
        <div class="e-kpi-foot"><span>Komisi + Ongkir + Layanan - Subsidi</span><span class="mono">5 Channel</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Aktual Cair ke Rekening Giro</span>${badge('99,96% Cocok', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${fmtIdr(sumAct)}</span></div>
        <div class="e-kpi-foot"><span>Estimasi Sistem TokoSync</span><span class="mono" style="font-weight:700;">${fmtIdr(sumExp)}</span></div>
      </div>
      <div class="e-kpi" style="border-color:#fecdd3;background:#fff8f9;">
        <div class="e-kpi-top"><span style="color:#9f1239;">Selisih Escrow Terdeteksi</span>${badge('SET-44 · Sanggah', 'bad')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">-${fmtIdr(Math.abs(sumDiff))}</span></div>
        <div class="e-kpi-foot"><span>3 Pesanan di Tokopedia #TP-1119</span><span class="mono" style="font-weight:700;color:#be123c;">Auto-Tiket Aktif</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.02fr 1fr;gap:10px;height:344px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0e6b5e')}<span>Waterfall Margin &amp; Potongan Biaya Marketplace (Batch Nov W3)</span></div>
          <span class="e-panel-sub mono">Margin Net setelah MP: 87,29%</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          ${renderWaterfallSvg(680, 256)}
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:#f4f7f6;border:1px solid #dce4e0;border-radius:3px;font-size:10px;">
            <span><strong>Komponen Terbesar:</strong> Komisi Kategori 5,99% (Rp 29,11 jt) · Bebas Ongkir 3,05% (Rp 14,81 jt)</span>
            <span class="mono" style="font-weight:700;color:#08473e;">Audit 100%</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#0e6b5e')}<span>Rekonsiliasi Batch Pencairan per Marketplace</span></div>
          <span class="e-panel-sub mono">5 Batch Settlement</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:64px;">Batch</th>
                <th style="width:98px;">Channel</th>
                <th class="num" style="width:44px;">Ord</th>
                <th class="num" style="width:118px;">Estimasi</th>
                <th class="num" style="width:118px;">Aktual Bank</th>
                <th class="num" style="width:88px;">Selisih</th>
                <th style="width:80px;text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody style="line-height:1.85;">${batchRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total 5 Batch Nov W3</td>
                <td class="mono num">${fmtNum(sumOrders)}</td>
                <td class="mono num">${fmtIdr(sumExp)}</td>
                <td class="mono num">${fmtIdr(sumAct)}</td>
                <td class="mono num" style="color:#be123c;">-${fmtIdr(Math.abs(sumDiff))}</td>
                <td style="text-align:right;color:#be123c;">1 Anomali</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;background:#fafcfb;border-top:1px solid #e2eae6;display:flex;flex-direction:column;gap:7px;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:10px;">
              <div style="background:#ffffff;border:1px solid #d7e0dc;border-radius:3px;padding:6px 8px;">
                <div style="color:#5b706a;font-size:9.2px;">Order Cocok 100%</div>
                <div class="mono" style="font-weight:800;font-size:12px;color:#047857;">2.337 / 2.340</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d7e0dc;border-radius:3px;padding:6px 8px;">
                <div style="color:#5b706a;font-size:9.2px;">Klaim Terpulihkan MTD</div>
                <div class="mono" style="font-weight:800;font-size:12px;color:#0e6b5e;">Rp 1.428.500</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d7e0dc;border-radius:3px;padding:6px 8px;">
                <div style="color:#5b706a;font-size:9.2px;">Rata-rata Resolusi Sanggah</div>
                <div class="mono" style="font-weight:800;font-size:12px;color:#0b241f;">2,4 Hari Kerja</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.6px;color:#3f554f;">
              <span>Rekening Mutasi Terhubung: <strong>BCA Giro ****8821</strong> &amp; <strong>Mandiri Giro ****4109</strong></span>
              <span class="mono" style="color:#047857;font-weight:700;">Auto-Match 14:15 WIB</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div style="display:grid;grid-template-columns:1.96fr 1fr;gap:10px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('search', 13, '#0e6b5e')}<span>Ledger Audit Pesanan &amp; Detektor Otomatis Selisih Escrow</span></div>
          <span class="e-panel-sub">3 anomali diurutkan teratas · Pencocokan rekening mutasi BCA &amp; Mandiri</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:142px;">No. Invoice / Order</th>
                <th style="width:90px;">Channel</th>
                <th class="num" style="width:86px;">GMV</th>
                <th class="num" style="width:88px;">Biaya Sys</th>
                <th class="num" style="width:86px;">Estimasi</th>
                <th class="num" style="width:86px;">Aktual</th>
                <th class="num" style="width:94px;">Selisih</th>
                <th>Catatan Rekonsiliasi</th>
                <th style="width:72px;text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>${ledgerRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="6">Total Selisih Teridentifikasi pada Batch #TP-1119 (3 Invoice)</td>
                <td class="mono num" style="color:#be123c;">-${fmtIdr(Math.abs(sumDiff))}</td>
                <td colspan="2" style="text-align:right;color:#08473e;">Auto-Tiket #SET-44 Terkirim</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head" style="background:#fff5f6;border-bottom-color:#fecdd3;">
          <div class="e-panel-title" style="color:#9f1239;">${ic('alert', 13, '#be123c')}<span>Inspektor Auto-Tiket Sanggah · SET-44</span></div>
          ${badge('Tokopedia #TP-1119', 'bad')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="padding:8px 10px;background:#fff1f2;border:1px solid #fecdd3;border-radius:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;color:#9f1239;font-size:11px;">Total Klaim Kekurangan Pencairan</span>
              <span class="mono" style="font-weight:800;font-size:14px;color:#be123c;">-Rp 184.200</span>
            </div>
            <div style="font-size:9.8px;color:#881337;margin-top:3px;">Penyebab: Subsidi voucher kampanye 50% &amp; potongan Bebas Ongkir ganda tidak sesuai perjanjian Seller Center.</div>
          </div>

          <div style="border:1px solid #d7e0dc;border-radius:4px;overflow:hidden;">
            <div style="padding:5px 8px;background:#f4f7f6;border-bottom:1px solid #d7e0dc;font-size:9.8px;font-weight:700;color:#3f554f;">Rincian 3 Pesanan Bermasalah</div>
            ${disputedOrders
              .map(
                (d) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid #edf2f0;font-size:9.8px;">
                  <div>
                    <div class="mono" style="font-weight:700;color:#0b241f;">${esc(d.inv)}</div>
                    <div style="font-size:9.2px;color:#5b706a;">${esc(d.note)}</div>
                  </div>
                  <span class="mono" style="font-weight:800;color:#be123c;">-${fmtIdr(Math.abs(d.diff))}</span>
                </div>`
              )
              .join('')}
          </div>

          <div class="ts-code" style="font-size:9.4px;">
            <div><strong>Tiket Seller Care:</strong> CASE-TP-20261122-9104</div>
            <div><strong>SLA Eskalasi:</strong> 48 Jam Kerja (Terkirim 11:42 WIB)</div>
            <div><strong>Bukti SHA-256:</strong> 4c91e8a0f2b7...94a1 (JSON + CSV Escrow)</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <span class="e-btn" style="justify-content:center;">${ic('download', 11, '#3f554f')} Unduh Bukti CSV</span>
            <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('checkCircle', 11, '#ffffff')} Pantau Eskalasi</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeNav: 'p4',
    breadcrumb: 'Keuangan & Audit',
    pageTitle: 'Rekonsiliasi Escrow, Margin Waterfall & Sanggah Biaya',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#3f554f')} Ekspor Jurnal Rekonsiliasi</span>
      <span class="e-btn e-btn-primary">${ic('refresh', 12, '#ffffff')} Tarik Mutasi Settlement API</span>
    `,
    contentHtml,
    statusRight: 'Rekonsiliasi Payout · Audit Escrow Otomatis',
  });
}

// ============================================================================
// PAGE 5: ROUTING MULTI-GUDANG & OPTIMASI ONGKIR NUSANTARA
// ============================================================================
function renderIndonesiaRoutingMapSvg() {
  return `<svg viewBox="0 0 816 376" width="100%" height="376" style="display:block;background:#f7faf9;border:1px solid #d7e0dc;border-radius:4px;">
    <defs>
      <pattern id="tsGrid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e6eeea" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="816" height="376" fill="url(#tsGrid)"/>

    <!-- Stylized Crisp Architectural Cartography of Indonesia -->
    <!-- Sumatra -->
    <path d="M 52 54 L 84 44 L 122 86 L 166 132 L 204 188 L 222 224 L 200 242 L 168 214 L 126 164 L 84 114 L 46 74 Z" fill="#dfece7" stroke="#9ab8ae" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- Java -->
    <path d="M 224 252 L 272 246 L 348 252 L 424 258 L 466 266 L 458 282 L 396 280 L 314 276 L 236 270 Z" fill="#dfece7" stroke="#9ab8ae" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- Bali & Nusa Tenggara -->
    <path d="M 476 268 L 502 270 L 500 282 L 474 280 Z M 512 272 L 548 274 L 546 284 L 510 282 Z M 558 275 L 614 272 L 612 284 L 556 285 Z" fill="#dfece7" stroke="#9ab8ae" stroke-width="1.3" stroke-linejoin="round"/>
    <!-- Kalimantan -->
    <path d="M 322 104 L 386 84 L 444 98 L 462 144 L 434 198 L 368 202 L 320 176 L 308 134 Z" fill="#dfece7" stroke="#9ab8ae" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- Sulawesi -->
    <path d="M 510 112 L 568 106 L 584 122 L 546 136 L 562 178 L 544 218 L 520 212 L 516 168 L 496 146 Z" fill="#dfece7" stroke="#9ab8ae" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- Maluku & Papua (East) -->
    <path d="M 656 144 L 748 164 L 788 188 L 782 224 L 722 216 L 672 184 Z" fill="#e6f0ec" stroke="#b0c7bf" stroke-width="1.2" stroke-linejoin="round"/>

    <!-- Service Coverage Rings around 3 Warehouses -->
    <circle cx="112" cy="96" r="64" fill="#0e6b5e" fill-opacity="0.06" stroke="#0e6b5e" stroke-width="1" stroke-dasharray="4,3"/>
    <circle cx="256" cy="254" r="56" fill="#0e6b5e" fill-opacity="0.08" stroke="#0e6b5e" stroke-width="1.2" stroke-dasharray="4,3"/>
    <circle cx="426" cy="264" r="68" fill="#0e6b5e" fill-opacity="0.06" stroke="#0e6b5e" stroke-width="1" stroke-dasharray="4,3"/>

    <!-- Routing Arcs from Warehouses to Regional Demand Clusters -->
    <!-- From Gdg-MDN (112, 96) -->
    <path d="M 112 96 Q 152 128 166 154" fill="none" stroke="#0e6b5e" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M 112 96 Q 158 168 192 204" fill="none" stroke="#0e6b5e" stroke-width="1.8" stroke-dasharray="4,3"/>
    <!-- From Gdg-JKT (256, 254) -->
    <path d="M 256 254 Q 278 274 292 266" fill="none" stroke="#0e6b5e" stroke-width="2"/>
    <path d="M 256 254 Q 294 198 342 158" fill="none" stroke="#0369a1" stroke-width="1.6" stroke-dasharray="4,3"/>
    <!-- From Gdg-SBY (426, 264) -->
    <path d="M 426 264 Q 382 246 352 258" fill="none" stroke="#0e6b5e" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M 426 264 Q 460 282 488 274" fill="none" stroke="#0e6b5e" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M 426 264 Q 486 226 530 202" fill="none" stroke="#0369a1" stroke-width="1.6" stroke-dasharray="4,3"/>

    <!-- Demand Destination Nodes -->
    <circle cx="166" cy="154" r="4.5" fill="#ffffff" stroke="#0e6b5e" stroke-width="2"/>
    <text x="176" y="148" font-size="9.2" font-weight="700" fill="#293d38">Pekanbaru</text>
    <text x="176" y="159" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#047857">Rp 18 rb (-36%)</text>

    <circle cx="192" cy="204" r="4.5" fill="#ffffff" stroke="#0e6b5e" stroke-width="2"/>
    <text x="116" y="216" font-size="9.2" font-weight="700" fill="#293d38">Palembang</text>
    <text x="116" y="227" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#047857">Rp 18 rb</text>

    <circle cx="342" cy="158" r="4.5" fill="#ffffff" stroke="#0369a1" stroke-width="2"/>
    <text x="352" y="156" font-size="9.2" font-weight="700" fill="#293d38">Pontianak / BJM</text>
    <text x="352" y="167" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">Via Gdg-JKT</text>

    <circle cx="352" cy="258" r="4.5" fill="#ffffff" stroke="#0e6b5e" stroke-width="2"/>
    <text x="328" y="242" font-size="9.2" font-weight="700" fill="#293d38">Semarang</text>

    <circle cx="488" cy="274" r="4.5" fill="#ffffff" stroke="#0e6b5e" stroke-width="2"/>
    <text x="504" y="294" font-size="9.2" font-weight="700" fill="#293d38">Denpasar</text>
    <text x="504" y="305" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#047857">Rp 14 rb (-48%)</text>

    <circle cx="530" cy="202" r="4.5" fill="#ffffff" stroke="#0369a1" stroke-width="2"/>
    <text x="542" y="200" font-size="9.2" font-weight="700" fill="#293d38">Makassar</text>
    <text x="542" y="211" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#047857">Via Gdg-SBY (-41%)</text>

    <!-- 3 Active Warehouse Hub Markers + Callout Boxes -->
    <!-- Gdg-MDN -->
    <circle cx="112" cy="96" r="7" fill="#0e6b5e" stroke="#ffffff" stroke-width="2"/>
    <rect x="148" y="42" width="144" height="46" rx="4" fill="#ffffff" stroke="#0e6b5e" stroke-width="1.3"/>
    <text x="156" y="57" font-size="10.2" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#08473e">Gdg-MDN · KIM II</text>
    <text x="156" y="70" font-size="9.2" fill="#293d38">76 order · Utilisasi 44%</text>
    <text x="156" y="82" font-size="9" font-family="ui-monospace,Consolas,monospace" font-weight="700" fill="#047857">Hemat Rp 4,76 jt/bln</text>
    <line x1="119" y1="92" x2="148" y2="72" stroke="#0e6b5e" stroke-width="1.2"/>

    <!-- Gdg-JKT -->
    <circle cx="256" cy="254" r="8" fill="#0e6b5e" stroke="#ffffff" stroke-width="2.2"/>
    <rect x="64" y="294" width="166" height="48" rx="4" fill="#ffffff" stroke="#0e6b5e" stroke-width="1.5"/>
    <text x="72" y="309" font-size="10.2" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#08473e">Gdg-JKT · Cakung (Hub Utama)</text>
    <text x="72" y="322" font-size="9.2" fill="#293d38">378 order (61,2%) · 14 Packer</text>
    <text x="72" y="334" font-size="9" font-family="ui-monospace,Consolas,monospace" font-weight="700" fill="#b45309">Wave #14 &amp; Instant GoSend</text>
    <line x1="250" y1="260" x2="220" y2="294" stroke="#0e6b5e" stroke-width="1.2"/>

    <!-- Gdg-SBY -->
    <circle cx="426" cy="264" r="7.5" fill="#0e6b5e" stroke="#ffffff" stroke-width="2"/>
    <rect x="330" y="308" width="144" height="48" rx="4" fill="#ffffff" stroke="#0e6b5e" stroke-width="1.3"/>
    <text x="338" y="323" font-size="10.2" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#08473e">Gdg-SBY · Rungkut</text>
    <text x="338" y="336" font-size="9.2" fill="#293d38">164 order (26,5%) · Util 61%</text>
    <text x="338" y="348" font-size="9" font-family="ui-monospace,Consolas,monospace" font-weight="700" fill="#047857">Hemat Rp 6,94 jt/bln</text>
    <line x1="422" y1="272" x2="404" y2="308" stroke="#0e6b5e" stroke-width="1.2"/>

    <!-- Top-Right Map Legend Card -->
    <rect x="614" y="14" width="188" height="82" rx="4" fill="#ffffff" stroke="#cfdcd6" stroke-width="1"/>
    <text x="624" y="30" font-size="9.5" font-weight="800" fill="#0b241f">TOPOLOGI COURIER ROUTER</text>
    <circle cx="630" cy="46" r="4.5" fill="#0e6b5e"/>
    <text x="642" y="49" font-size="9.2" fill="#293d38">Gudang Fulfillment Aktif (3)</text>
    <line x1="624" y1="64" x2="638" y2="64" stroke="#0e6b5e" stroke-width="1.8" stroke-dasharray="3,2"/>
    <text x="642" y="67" font-size="9.2" fill="#293d38">Rute Zona Lokal (Hemat 38%)</text>
    <line x1="624" y1="81" x2="638" y2="81" stroke="#0369a1" stroke-width="1.6" stroke-dasharray="3,2"/>
    <text x="642" y="84" font-size="9.2" fill="#293d38">Koridor Lintas Pulau Terdekat</text>
  </svg>`;
}

function renderCorridorCompareChart(width = 504, height = 216) {
  const padL = 50;
  const padR = 12;
  const padT = 26;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxV = 32000;
  const yPos = (v) => padT + plotH - (v / maxV) * plotH;

  let out = '';
  for (let i = 0; i <= 4; i++) {
    const v = (maxV / 4) * i;
    const y = yPos(v);
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="#e2eae6" stroke-width="1" ${i > 0 ? 'stroke-dasharray="2,3"' : ''}/>`;
    out += `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#5b706a">Rp ${Math.round(v / 1000)}rb</text>`;
  }

  const slotW = plotW / CORRIDORS.length;
  const bw = 18;
  CORRIDORS.forEach((c, idx) => {
    const cx = padL + slotW * idx + slotW / 2;
    const y1 = yPos(c.singleCost);
    const y2 = yPos(c.multiCost);
    out += `<rect x="${(cx - bw - 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${bw}" height="${(padT + plotH - y1).toFixed(1)}" rx="1.5" fill="#cbd5e1"/>`;
    out += `<rect x="${(cx + 2).toFixed(1)}" y="${y2.toFixed(1)}" width="${bw}" height="${(padT + plotH - y2).toFixed(1)}" rx="1.5" fill="#0e6b5e"/>`;
    out += `<text x="${cx.toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="8.8" font-weight="600" fill="#293d38">${esc(c.name.split(' ')[0])}</text>`;
  });

  // Legend
  out += `<rect x="${padL}" y="6" width="9" height="9" rx="1" fill="#cbd5e1"/><text x="${padL + 13}" y="14" font-size="9.2" font-weight="600" fill="#475569">1 Gudang JKT Saja</text>`;
  out += `<rect x="${padL + 124}" y="6" width="9" height="9" rx="1" fill="#0e6b5e"/><text x="${padL + 137}" y="14" font-size="9.2" font-weight="600" fill="#08473e">3 Gudang TokoSync (-38,4%)</text>`;

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">${out}</svg>`;
}

function renderPage5() {
  const whDetailCards = WAREHOUSES.map((w) => {
    const share = ((w.orders / TOTAL_ORDERS) * 100).toFixed(1).replace('.', ',');
    return `<div style="padding:7.5px 9px;border:1px solid #d7e0dc;border-radius:4px;background:#fafcfb;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
        <div>
          <span class="mono" style="font-weight:800;font-size:11px;color:#08473e;">${esc(w.code)}</span>
          <span style="font-weight:700;font-size:10.8px;color:#0b241f;margin-left:5px;">${esc(w.name)}</span>
        </div>
        ${badge(w.status, w.tone)}
      </div>
      <div style="font-size:9.4px;color:#5b706a;margin-bottom:5px;">Zona Layanan: ${esc(w.region)}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;font-size:9.6px;margin-bottom:5px;">
        <div style="background:#ffffff;border:1px solid #e2eae6;border-radius:3px;padding:3.5px 6px;">
          <div style="color:#5b706a;font-size:8.6px;">Order Hari Ini</div>
          <div class="mono" style="font-weight:700;">${w.orders} (${share}%)</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2eae6;border-radius:3px;padding:3.5px 6px;">
          <div style="color:#5b706a;font-size:8.6px;">Ongkir Rata-rata</div>
          <div class="mono" style="font-weight:700;color:#047857;">${fmtIdr(w.avgShipLocal)}</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2eae6;border-radius:3px;padding:3.5px 6px;">
          <div style="color:#5b706a;font-size:8.6px;">Ketersediaan SKU</div>
          <div class="mono" style="font-weight:700;">${esc(w.skuCoverage)}</div>
        </div>
        <div style="background:#ffffff;border:1px solid #e2eae6;border-radius:3px;padding:3.5px 6px;">
          <div style="color:#5b706a;font-size:8.6px;">Hemat / Bulan</div>
          <div class="mono" style="font-weight:700;color:#0e6b5e;">${fmtIdr(w.savingsMtd)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:9.2px;color:#5b706a;">Utilisasi (${w.packers} packer · ${esc(w.printer)})</span>
        <div style="flex:1;">${renderCapacityBar(w.utilPct, { warnAt: 75, critAt: 90 })}</div>
      </div>
    </div>`;
  }).join('');

  const ruleRows = ROUTING_RULES.map(
    (r) => `<tr>
      <td class="mono" style="font-weight:800;color:#08473e;">${esc(r.id)}</td>
      <td style="font-weight:700;color:#0b241f;">${esc(r.name)}</td>
      <td style="font-size:9.8px;color:#3f554f;" class="trunc">${esc(r.cond)}</td>
      <td class="mono num" style="font-weight:700;">${esc(r.hit)}</td>
      <td class="mono num" style="color:#047857;">${esc(r.ms)}</td>
      <td style="text-align:right;">${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const corridorSummary = CORRIDORS.map(
    (c) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:9.6px;padding:2.5px 0;border-bottom:1px solid #edf2f0;">
      <span><strong>${esc(c.name)}</strong> <span class="mono" style="color:#5b706a;">(${esc(c.wh)})</span></span>
      <span class="mono" style="color:#047857;font-weight:700;">${fmtIdr(c.multiCost)} vs ${fmtIdr(c.singleCost)} · Hemat ${fmtIdr(c.saveMtd)}</span>
    </div>`
  ).join('');

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Penghematan Ongkir MTD</span>${badge('-38,4% Biaya', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${fmtIdr(TOTAL_SAVINGS)}</span></div>
        <div class="e-kpi-foot"><span>vs Skema 1 Gudang JKT</span><span class="mono">2.040 Paket Regional</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Pesanan Terdistribusi Regional</span>${badge('SBY + MDN', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">240 / 618 order</span></div>
        <div class="e-kpi-foot"><span>Porsi Luar Jabodetabek</span><span class="mono" style="font-weight:700;">38,8% Hari Ini</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Latensi Keputusan Courier Router</span>${badge('RabbitMQ OK', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">6,4 ms</span></div>
        <div class="e-kpi-foot"><span>p95 Evaluasi 5 Aturan</span><span class="mono">0 Antrean Macet</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>SLA Pengiriman Antarpulau</span>${badge('Target >=97%', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#0e6b5e;">1,6 Hari</span></div>
        <div class="e-kpi-foot"><span>Memangkas 2,3 hari transit</span><span class="mono">JNE · J&amp;T · SiCepat</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:840px 1fr;gap:10px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:452px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('globe', 13, '#0e6b5e')}<span>Topologi Routing 3 Gudang &amp; Koridor Pengiriman Nusantara</span></div>
            <span class="e-panel-sub mono">Gdg-JKT (378) · Gdg-SBY (164) · Gdg-MDN (76)</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            ${renderIndonesiaRoutingMapSvg()}
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#3f554f;">
              <span><strong>Konektor 3PL Aktif:</strong> J&amp;T Express · SiCepat · JNE · GoSend/Grab Instant · Auto-tarif API real-time</span>
              <span class="mono" style="font-weight:700;color:#08473e;">Total: 618 order · Rp 128,46 jt</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 13, '#0e6b5e')}<span>Mesin Aturan Routing Otomatis (.NET 9 Courier Router)</span></div>
            <span class="e-panel-sub mono">5 Aturan Aktif · Evaluasi Deterministik</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:46px;">ID</th>
                  <th style="width:176px;">Nama Aturan Routing</th>
                  <th>Kondisi Eksekusi</th>
                  <th class="num" style="width:74px;">Hit Hari Ini</th>
                  <th class="num" style="width:52px;">p95</th>
                  <th style="width:72px;text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>${ruleRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">RabbitMQ Worker Pool: 8 consumer aktif · 0 Dead-Letter · 0 Fallback gagal</td>
                  <td class="mono num">312 rute</td>
                  <td class="mono num" style="color:#047857;">6,4 ms</td>
                  <td style="text-align:right;color:#047857;">Optimal</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:412px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 13, '#0e6b5e')}<span>Kinerja &amp; Kapasitas 3 Gudang Aktif</span></div>
            ${badge('Semua Normal', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;padding:8px 10px;">
            ${whDetailCards}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0e6b5e')}<span>Perbandingan Ongkir: 1 Gudang vs 3 Gudang</span></div>
            <span class="e-panel-sub mono">Hemat ${fmtIdr(TOTAL_SAVINGS)}/bln</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
            ${renderCorridorCompareChart(504, 174)}
            <div>${corridorSummary}</div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeNav: 'p5',
    breadcrumb: 'Operasional Harian',
    pageTitle: 'Routing Multi-Gudang & Optimasi Ongkir Nusantara',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 12, '#3f554f')} Simulasi Tarif Kurir</span>
      <span class="e-btn e-btn-primary">${ic('gitBranch', 12, '#ffffff')} Tambah Aturan Routing</span>
    `,
    contentHtml,
    statusRight: 'Courier Router .NET 9 · 3 Gudang · 3PL API',
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
