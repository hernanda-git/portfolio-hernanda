import {
  esc,
  fmtNum,
  fmtIdr,
  ic,
  badge,
  wrapEnterpriseHtml,
  renderStatusFooter,
} from '../chrome.mjs';
import {
  svgStackedBarChart,
  svgSpanWaterfall,
} from '../charts.mjs';

export const meta = {
  id: 'ID-022',
  name: 'KopiPOS Cloud',
  reference: 'Toast POS + Square for Restaurants',
  persona: 'Rina Wulandari · Store Manager & Senior Barista · Kopi Nusantara Kemang',
  pages: [
    { slug: 'p1', title: 'Terminal Kasir Touch POS & Layar QRIS Dinamis' },
    { slug: 'p2', title: 'Layar Barista & Kitchen Display System (KDS)' },
    { slug: 'p3', title: 'Mesin Resep BOM, Potong Gram & Stok FEFO' },
    { slug: 'p4', title: 'Settlement Shift Kasir, PB1 10% & Rekonsiliasi' },
    { slug: 'p5', title: 'Armada Multi-Outlet & SQLite Offline-First Sync' },
  ],
};

// ============================================================================
// CUSTOM HOSPITALITY & POS VECTOR ICONS (1.75px stroke, zero emoji)
// ============================================================================
const POS_ICONS = {
  coffee:
    '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>',
  printer:
    '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h4v4h-4z"/><path d="M14 20h1"/><path d="M20 14h1"/>',
  monitor:
    '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  store:
    '<path d="M3 9l2-5h14l2 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  wifiOff:
    '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  split:
    '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  wallet:
    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  scale:
    '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-2 7h4l-2-7z"/><path d="M19 7l-2 7h4l-2-7z"/><line x1="8" y1="21" x2="16" y2="21"/>',
};

function pic(name, size = 14, color = 'currentColor') {
  const path = POS_ICONS[name];
  if (!path) return ic(name, size, color);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${path}</svg>`;
}

function renderStockBar(pct, tone = 'ok') {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = tone === 'bad' ? '#be123c' : tone === 'warn' ? '#b45309' : '#047857';
  return `<div style="display:flex;align-items:center;gap:6px;min-width:0;">
    <div style="flex:1;height:6px;background:#e7e2da;border-radius:2px;overflow:hidden;min-width:44px;">
      <div style="width:${clamped}%;height:100%;background:${color};"></div>
    </div>
    <span class="mono" style="font-size:10px;color:#44403c;width:30px;text-align:right;flex-shrink:0;">${clamped}%</span>
  </div>`;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% RECONCILED ACROSS P1–P5)
// ============================================================================

const MENU_ITEMS = [
  { code: 'MN-01', cat: 'Espresso', name: 'Es Kopi Susu Aren (Large)', sub: 'Less ice · Oat milk (+Rp 8.000)', basePrice: 28000, modPrice: 8000, price: 36000, bom: '18g biji · 180ml oat', cogsPct: '31,7%', station: 'KDS Barista', stockTag: 'Tersedia', inCart: 1, accent: '#7c2d12' },
  { code: 'MN-02', cat: 'Manual Brew', name: 'Manual Brew V60 Gayo', sub: 'Panas · Single origin batch #12', basePrice: 38000, modPrice: 0, price: 38000, bom: '15g biji · 240ml air', cogsPct: '22,1%', station: 'KDS Barista', stockTag: 'Batch #12', inCart: 1, accent: '#9a3412' },
  { code: 'MN-03', cat: 'Pastry', name: 'Croissant Butter Almond', sub: 'Hangatkan · Etalase pastry', basePrice: 32000, modPrice: 0, price: 32000, bom: '1 pcs · 12g almond', cogsPct: '35,9%', station: 'KDS Kitchen', stockTag: 'Sisa 6', inCart: 1, accent: '#b45309' },
  { code: 'MN-04', cat: 'Non-Kopi', name: 'Matcha Latte Ceremonial', sub: 'Dingin · Gula normal · Uji', basePrice: 42000, modPrice: 0, price: 42000, bom: '4g bubuk · 180ml susu', cogsPct: '28,6%', station: 'KDS Barista', stockTag: 'Tersedia', inCart: 0, accent: '#047857' },
  { code: 'MN-05', cat: 'Espresso', name: 'Iced Americano Arabica', sub: 'Double shot · House blend 70/30', basePrice: 26000, modPrice: 0, price: 26000, bom: '18g biji · 120g es', cogsPct: '24,7%', station: 'KDS Barista', stockTag: 'Tersedia', inCart: 0, accent: '#7c2d12' },
  { code: 'MN-06', cat: 'Espresso', name: 'Caffe Latte Hazelnut', sub: 'Panas · Sirup Monin 15ml', basePrice: 38000, modPrice: 0, price: 38000, bom: '18g biji · 180ml susu', cogsPct: '30,4%', station: 'KDS Barista', stockTag: 'Tersedia', inCart: 0, accent: '#7c2d12' },
  { code: 'MN-07', cat: 'Manual Brew', name: 'Japanese Iced Kalita Toraja', sub: 'Dingin · Flash brew 16g', basePrice: 40000, modPrice: 0, price: 40000, bom: '16g biji · 110g es', cogsPct: '21,5%', station: 'KDS Barista', stockTag: 'Batch #09', inCart: 0, accent: '#9a3412' },
  { code: 'MN-08', cat: 'Non-Kopi', name: 'Dark Chocolate Valrhona 70%', sub: 'Dingin · Oat milk opsional', basePrice: 40000, modPrice: 0, price: 40000, bom: '24g cokelat · 180ml', cogsPct: '33,8%', station: 'KDS Barista', stockTag: 'Tersedia', inCart: 0, accent: '#57534e' },
  { code: 'MN-09', cat: 'Pastry', name: 'Smoked Beef Ciabatta Melt', sub: 'Panggang oven 200°C · 3 menit', basePrice: 48000, modPrice: 0, price: 48000, bom: '1 roti · 60g daging', cogsPct: '36,2%', station: 'KDS Kitchen', stockTag: 'Sisa 9', inCart: 0, accent: '#b45309' },
  { code: 'MN-10', cat: 'Pastry', name: 'Pain au Chocolat French Butter', sub: 'Hangatkan · Etalase pastry', basePrice: 30000, modPrice: 0, price: 30000, bom: '1 pcs pastry', cogsPct: '36,0%', station: 'KDS Kitchen', stockTag: 'Sisa 4', inCart: 0, accent: '#b45309' },
  { code: 'MN-11', cat: 'Bundling', name: 'Paket Pagi Kopi Aren + Croissant', sub: 'Promo Dine-In & GoFood Hemat', basePrice: 58000, modPrice: 0, price: 58000, bom: '18g biji · 1 croissant', cogsPct: '32,5%', station: 'Barista + Kit', stockTag: 'Promo', inCart: 0, accent: '#0369a1' },
  { code: 'MN-12', cat: 'Karyawan', name: 'Paket Subsidi Karyawan #A', sub: 'Kupon HR Rp 30.000 · 1x/hari', basePrice: 30000, modPrice: 0, price: 30000, bom: '18g biji · 1 roti', cogsPct: '34,0%', station: 'Barista + Kit', stockTag: 'Kupon HR', inCart: 0, accent: '#047857' },
];

// Active Cart (#KMG-0418) matches spec snippet verbatim:
// Subtotal Rp 106.000 + PB1 10% Rp 10.600 = Rp 116.600
const ACTIVE_BILL_ITEMS = [
  { code: 'MN-01', name: 'Es Kopi Susu Aren (Large)', qty: 1, unitPrice: 36000, mods: 'Less ice · Oat milk (+Rp 8.000) · Aren 75%', bomNote: '18g House Blend · 180ml Oatside · 20ml Aren · 1 Cup 16oz', station: 'BARISTA' },
  { code: 'MN-02', name: 'Manual Brew V60 Gayo', qty: 1, unitPrice: 38000, mods: 'Panas · Single origin batch #12 · Rasio 1:16', bomNote: '15g V60 Gayo Natural · 1 Filter Paper V60 · 1 Hot Cup 8oz', station: 'BARISTA' },
  { code: 'MN-03', name: 'Croissant Butter Almond', qty: 1, unitPrice: 32000, mods: 'Hangatkan oven 180°C (90 detik) · Sajikan piring', bomNote: '1 pcs Butter Croissant · 12g Almond Slice', station: 'KITCHEN' },
];

const BILL_SUBTOTAL = ACTIVE_BILL_ITEMS.reduce((a, x) => a + x.qty * x.unitPrice, 0);
const BILL_PB1 = Math.round(BILL_SUBTOTAL * 0.1);
const BILL_TOTAL = BILL_SUBTOTAL + BILL_PB1;

// KDS Completed Orders (6 tickets averaging exactly 222 seconds = 3m 42d)
const KDS_COMPLETED = [
  { id: '#KMG-0416', channel: 'Dine-In #04', items: '2x Kopi Susu Aren, 1x Matcha', station: 'Barista', secs: 195, barista: 'Dimas R.' },
  { id: '#GF-8819', channel: 'GoFood', items: '3x Iced Americano, 2x Croissant', station: 'Barista+Kit', secs: 240, barista: 'Rina W.' },
  { id: '#KMG-0415', channel: 'Takeaway', items: '1x V60 Gayo, 1x Pain au Chocolat', station: 'Barista+Kit', secs: 210, barista: 'Dimas R.' },
  { id: '#GR-4408', channel: 'GrabFood', items: '2x Dark Choco Oat, 1x Ciabatta', station: 'Barista+Kit', secs: 258, barista: 'Farhan M.' },
  { id: '#KMG-0414', channel: 'Kupon HR', items: '1x Paket Subsidi Karyawan #A', station: 'Barista', secs: 189, barista: 'Rina W.' },
  { id: '#KMG-0413', channel: 'Dine-In #11', items: '2x Hazelnut Latte, 1x Almond Croissant', station: 'Barista+Kit', secs: 240, barista: 'Farhan M.' },
];

// KDS Active Tickets (4 Barista + 2 Kitchen)
const KDS_BARISTA_TICKETS = [
  {
    id: '#KMG-0418',
    channel: 'DINE-IN · MEJA 07',
    chanColor: '#0369a1',
    timer: '01:18',
    slaTone: 'ok',
    slaLabel: 'DALAM SLA',
    customer: 'Dimas A. (Tier Roaster) · QRIS Menunggu',
    cupStickers: '2 stiker tercetak',
    bomTotal: '33g biji · 180ml oat',
    note: 'Sajikan V60 Gayo bersamaan dengan Croissant dari Stasiun Kitchen.',
    lines: [
      { qty: 1, title: 'Es Kopi Susu Aren (L)', mods: ['Less Ice (-40g)', 'Ganti Susu Oatside 180ml (+Rp 8.000)', 'Gula Aren 75% (20ml) · Cup 16oz'], done: true },
      { qty: 1, title: 'Manual Brew V60 Gayo', mods: ['Panas 92°C · Single Origin Batch #12', 'Resep 15g kopi : 240ml air · Target seduh 2m30d'], done: false },
    ],
  },
  {
    id: '#GF-8821',
    channel: 'GOFOOD · DRIVER TIBA',
    chanColor: '#047857',
    timer: '05:19',
    slaTone: 'bad',
    slaLabel: 'LEWAT SLA >5M',
    customer: 'Driver: Hendra (B 4821 KTZ) · Prioritas #1',
    cupStickers: '3 stiker + seal bag',
    bomTotal: '40g biji · 360ml susu',
    note: 'Driver menunggu di pick-up counter. Pastikan segel anti-tumpah terpasang.',
    lines: [
      { qty: 2, title: 'Es Kopi Susu Aren (L)', mods: ['Es Terpisah (Cup 16oz + Cup Es)', 'Normal Sugar · Fresh Milk Greenfields'], done: true },
      { qty: 1, title: 'Matcha Latte Ceremonial', mods: ['Dingin · Extra Matcha (+2g = total 6g Uji)', 'Ganti Susu Oatside 180ml · Whisk 25 detik'], done: false },
    ],
  },
  {
    id: '#GR-4410',
    channel: 'GRABFOOD · AUTO-SYNC',
    chanColor: '#047857',
    timer: '03:44',
    slaTone: 'warn',
    slaLabel: 'DEKAT SLA 4M',
    customer: 'Order #GR-4410 · Promo Hemat Pagi',
    cupStickers: '2 stiker tercetak',
    bomTotal: '36g biji · 180ml susu',
    note: 'Tanpa sedotan plastik (request pelanggan di aplikasi GrabFood).',
    lines: [
      { qty: 1, title: 'Caffe Latte Hazelnut', mods: ['Panas · Sirup Hazelnut Monin 15ml', 'No Foam · Double Hot Cup Sleeve'], done: true },
      { qty: 1, title: 'Iced Americano Arabica', mods: ['Double Shot 18g House Blend · Less Ice', 'Tanpa Gula Cair · Seal Lid Rapat'], done: false },
    ],
  },
  {
    id: '#KMG-0417',
    channel: 'TAKEAWAY · KASIR #1',
    chanColor: '#7c2d12',
    timer: '02:06',
    slaTone: 'ok',
    slaLabel: 'DALAM SLA',
    customer: 'Nadia Putri · QRIS Lunas (RRN 041764)',
    cupStickers: '2 stiker tercetak',
    bomTotal: '16g biji · 24g cokelat',
    note: 'Masukkan ke paper carrier isi 2 cup + tisu kering.',
    lines: [
      { qty: 1, title: 'Japanese Iced Kalita Toraja', mods: ['Batch #09 · 16g kopi : 110g es batu + 130ml air', 'Tuang 3-pour bloom 35 detik'], done: false },
      { qty: 1, title: 'Dark Chocolate Valrhona 70%', mods: ['Dingin · Ganti Susu Oatside 180ml', 'Less Sweet · Larutkan 24g bubuk dgn air 85°C'], done: false },
    ],
  },
];

const KDS_KITCHEN_TICKETS = [
  {
    id: '#KMG-0418',
    channel: 'DINE-IN · MEJA 07',
    chanColor: '#0369a1',
    timer: '01:18',
    slaTone: 'ok',
    slaLabel: 'OVEN AKTIF',
    stationNote: 'Deck Oven #1 · 180°C · Sinkron Meja 07',
    lines: [
      { qty: 1, title: 'Croissant Butter Almond', mods: ['Hangatkan 90 detik · Piring Keramik', 'Potong dua · Tabur almond ekstra (12g)'], done: false },
    ],
  },
  {
    id: '#GF-8821',
    channel: 'GOFOOD · DRIVER TIBA',
    chanColor: '#047857',
    timer: '04:12',
    slaTone: 'warn',
    slaLabel: 'PACKAGING',
    stationNote: 'Toaster #2 · Paper Box + Segel Keamanan',
    lines: [
      { qty: 1, title: 'Smoked Beef Ciabatta Melt', mods: ['Panggang 3m · Tanpa Acar · Saus terpisah'], done: true },
      { qty: 1, title: 'Pain au Chocolat French Butter', mods: ['Hangatkan 60 detik · Kraft Bag + Segel GoFood'], done: false },
    ],
  },
];

// Page 3: 14-Row Raw Material FEFO Inventory & BOM Deduction
const INGREDIENTS = [
  { code: 'ING-01', name: 'House Blend Arabica Gayo 70/30', batch: 'BCH-2611A', exp: '2027-01-18', unit: 'g', awal: 18500, used: 2045, sisa: 16455, par: 6000, hpp: 260, status: 'Aman', tone: 'ok', selected: true },
  { code: 'ING-02', name: 'Single Origin V60 Gayo Natural', batch: 'BCH-2612', exp: '2026-12-28', unit: 'g', awal: 3200, used: 435, sisa: 2765, par: 1500, hpp: 420, status: 'Aman', tone: 'ok' },
  { code: 'ING-03', name: 'Susu Oatside Barista Blend 1L', batch: 'OAT-1109', exp: '2026-12-14', unit: 'ml', awal: 24000, used: 7920, sisa: 16080, par: 12000, hpp: 24, status: 'Aman', tone: 'ok' },
  { code: 'ING-04', name: 'Susu Fresh Milk Greenfields 1L', batch: 'GRF-2211', exp: '2026-11-29', unit: 'ml', awal: 32000, used: 11880, sisa: 20120, par: 15000, hpp: 18, status: 'FEFO 7h', tone: 'warn' },
  { code: 'ING-05', name: 'Gula Aren Cair Organik Banten', batch: 'ARN-1114', exp: '2027-02-05', unit: 'ml', awal: 8500, used: 1420, sisa: 7080, par: 3000, hpp: 38, status: 'Aman', tone: 'ok' },
  { code: 'ING-06', name: 'Bubuk Matcha Ceremonial Uji', batch: 'MTC-1028', exp: '2027-03-10', unit: 'g', awal: 680, used: 112, sisa: 568, par: 600, hpp: 1850, status: 'Bawah Par', tone: 'bad' },
  { code: 'ING-07', name: 'Butter Croissant Almond (Pastry)', batch: 'PST-2211', exp: '2026-11-23', unit: 'pcs', awal: 24, used: 18, sisa: 6, par: 10, hpp: 11500, status: 'Sisa 6 · Par', tone: 'bad' },
  { code: 'ING-08', name: 'Pain au Chocolat French Butter', batch: 'PST-2211', exp: '2026-11-23', unit: 'pcs', awal: 18, used: 14, sisa: 4, par: 8, hpp: 10800, status: 'Sisa 4 · Par', tone: 'bad' },
  { code: 'ING-09', name: 'Roti Ciabatta Sourdough + Beef', batch: 'KIT-2211', exp: '2026-11-25', unit: 'pcs', awal: 20, used: 11, sisa: 9, par: 8, hpp: 17400, status: 'Aman', tone: 'ok' },
  { code: 'ING-10', name: 'Cokelat Bubuk Valrhona 70% Dark', batch: 'VLR-0921', exp: '2027-04-15', unit: 'g', awal: 2800, used: 384, sisa: 2416, par: 1000, hpp: 540, status: 'Aman', tone: 'ok' },
  { code: 'ING-11', name: 'Sirup Hazelnut Monin 700ml', batch: 'MNN-0812', exp: '2027-06-30', unit: 'ml', awal: 4200, used: 420, sisa: 3780, par: 1400, hpp: 220, status: 'Aman', tone: 'ok' },
  { code: 'ING-12', name: 'Cup PET 16oz + Dome Lid + Straw', batch: 'PKG-1102', exp: 'Non-Exp', unit: 'pcs', awal: 1200, used: 108, sisa: 1092, par: 400, hpp: 1390, status: 'Aman', tone: 'ok' },
  { code: 'ING-13', name: 'Paper Hot Cup 8oz Double Wall', batch: 'PKG-1104', exp: 'Non-Exp', unit: 'pcs', awal: 800, used: 44, sisa: 756, par: 300, hpp: 1150, status: 'Aman', tone: 'ok' },
  { code: 'ING-14', name: 'Es Batu Kristal Food-Grade RO', batch: 'ICE-2211', exp: '2026-11-22', unit: 'g', awal: 45000, used: 14600, sisa: 30400, par: 15000, hpp: 3, status: 'Aman', tone: 'ok' },
].map((x) => ({
  ...x,
  nilaiStok: Math.round(x.sisa * x.hpp),
  pctCap: Math.min(100, Math.round((x.sisa / x.awal) * 100)),
}));

// BOM Breakdown for MN-01 Es Kopi Susu Aren (Large + Oat Milk)
const BOM_MN01 = [
  { ing: 'House Blend Arabica Gayo 70/30', qty: '18 g', unitCost: 'Rp 260/g', total: 4680, rule: 'Base Espresso (Double Ristretto)' },
  { ing: 'Susu Oatside Barista Blend', qty: '180 ml', unitCost: 'Rp 24/ml', total: 4320, rule: 'Modifier Swap (+Rp 8.000, -Fresh Milk)' },
  { ing: 'Gula Aren Cair Organik Banten', qty: '20 ml', unitCost: 'Rp 38/ml', total: 760, rule: 'Modifier 75% Aren (Default 25ml)' },
  { ing: 'Es Batu Kristal Food-Grade RO', qty: '90 g', unitCost: 'Rp 3/g', total: 270, rule: 'Modifier Less Ice (-40g dari 130g)' },
  { ing: 'Cup PET 16oz + Dome Lid + Straw', qty: '1 pcs', unitCost: 'Rp 1.390/pc', total: 1390, rule: 'Kemasan Takeaway / Iced Large' },
];

const MODIFIER_DELTAS = [
  { mod: 'Ganti Susu Oatside', bomDelta: '-180ml Fresh · +180ml Oat', hppDelta: '+Rp 1.080', priceDelta: '+Rp 8.000' },
  { mod: 'Tambah Extra Shot', bomDelta: '+18g House Blend Arabica', hppDelta: '+Rp 4.680', priceDelta: '+Rp 7.000' },
  { mod: 'Less Ice (-40g Es)', bomDelta: '-40g Es Kristal RO', hppDelta: '-Rp 120', priceDelta: 'Rp 0' },
];

// Page 4: Shift Pagi Settlement (Outlet Kemang #KMG, Exact Omzet Rp 4.820.000)
const PAYMENT_CHANNELS = [
  { method: 'QRIS Dinamis (BCA SNAP)', tx: 54, netto: 2140000, pb1: 214000, bruto: 2354000, feePct: '0,70%', feeIdr: 16478, netSettle: 2337522, status: 'Auto-Settled', tone: 'ok' },
  { method: 'GoFood (Promo + Komisi)', tx: 22, netto: 980000, pb1: 98000, bruto: 1078000, feePct: '20,0%', feeIdr: 196000, netSettle: 882000, status: 'Rekon H+1', tone: 'info' },
  { method: 'GrabFood (Promo + Komisi)', tx: 16, netto: 720000, pb1: 72000, bruto: 792000, feePct: '20,0%', feeIdr: 144000, netSettle: 648000, status: 'Rekon H+1', tone: 'info' },
  { method: 'Tunai (Laci Kasir #1)', tx: 14, netto: 520000, pb1: 52000, bruto: 572000, feePct: '0,00%', feeIdr: 0, netSettle: 572000, status: 'Klop Rp 0', tone: 'ok' },
  { method: 'Kartu Debit / Kredit EDC', tx: 7, netto: 310000, pb1: 31000, bruto: 341000, feePct: '1,50%', feeIdr: 5115, netSettle: 335885, status: 'Batch #04', tone: 'ok' },
  { method: 'Kupon Subsidi Karyawan HR', tx: 5, netto: 150000, pb1: 15000, bruto: 165000, feePct: '0,00%', feeIdr: 0, netSettle: 165000, status: 'Tagih Payroll', tone: 'neutral' },
];

// Hourly Sales Breakdown (8 hours 07:00–14:00, sums exactly to Rp 4.820.000 netto)
const HOURLY_LABELS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
const HOURLY_POS = [280, 560, 620, 440, 320, 410, 290, 200]; // 3.120 rb
const HOURLY_OJOL = [110, 260, 310, 220, 190, 270, 210, 130]; // 1.700 rb

// Cash Drawer Denomination Count (Modal Awal 500.000 + Tunai Bruto 572.000 = 1.072.000)
const CASH_DENOMS = [
  { label: 'Rp 100.000', value: 100000, qty: 5 },
  { label: 'Rp 50.000', value: 50000, qty: 7 },
  { label: 'Rp 20.000', value: 20000, qty: 7 },
  { label: 'Rp 10.000', value: 10000, qty: 5 },
  { label: 'Rp 5.000', value: 5000, qty: 4 },
  { label: 'Rp 2.000', value: 2000, qty: 5 },
  { label: 'Rp 1.000', value: 1000, qty: 2 },
].map((d) => ({ ...d, subtotal: d.value * d.qty }));

const SHIFT_MODAL_AWAL = 500000;

const RECENT_RECEIPTS = [
  { no: '#KMG-0418', time: '10:14', channel: 'Dine-In #07', pay: 'QRIS Dinamis', ref: 'RRN 261122041891', netto: 106000, pb1: 10600, total: 116600, bom: '33g biji · 180ml oat', sync: 'Synced', tone: 'ok' },
  { no: '#GF-8821', time: '10:11', channel: 'GoFood', pay: 'GoFood Wallet', ref: 'GF-ID-8821902', netto: 192000, pb1: 19200, total: 211200, bom: '40g biji · 2 pastry', sync: 'Synced', tone: 'ok' },
  { no: '#GR-4410', time: '10:08', channel: 'GrabFood', pay: 'GrabPay', ref: 'GR-ID-4410218', netto: 64000, pb1: 6400, total: 70400, bom: '36g biji · 180ml susu', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0417', time: '10:04', channel: 'Takeaway', pay: 'QRIS Dinamis', ref: 'RRN 261122041764', netto: 80000, pb1: 8000, total: 88000, bom: '16g biji · 24g cokelat', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0416', time: '09:58', channel: 'Dine-In #04', pay: 'QRIS Dinamis', ref: 'RRN 261122041602', netto: 114000, pb1: 11400, total: 125400, bom: '36g biji · 4g matcha', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0415', time: '09:52', channel: 'Takeaway', pay: 'Tunai Kasir', ref: 'CSH-0415-KMG1', netto: 68000, pb1: 6800, total: 74800, bom: '15g biji · 1 pastry', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0414', time: '09:47', channel: 'Karyawan', pay: 'Kupon HR', ref: 'EMP-084-SARI', netto: 30000, pb1: 3000, total: 33000, bom: '18g biji · 1 roti', sync: 'Synced', tone: 'info' },
  { no: '#KMG-0413', time: '09:41', channel: 'Dine-In #11', pay: 'Kartu EDC', ref: 'APPR 884219', netto: 108000, pb1: 10800, total: 118800, bom: '36g biji · 1 croissant', sync: 'Synced', tone: 'ok' },
  { no: '#GF-8819', time: '09:34', channel: 'GoFood', pay: 'GoFood Wallet', ref: 'GF-ID-8819440', netto: 142000, pb1: 14200, total: 156200, bom: '54g biji · 2 croissant', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0412', time: '09:29', channel: 'Takeaway', pay: 'QRIS Dinamis', ref: 'RRN 261122041209', netto: 58000, pb1: 5800, total: 63800, bom: '18g biji · 1 croissant', sync: 'Synced', tone: 'ok' },
  { no: '#KMG-0411', time: '09:22', channel: 'Dine-In #02', pay: 'QRIS Dinamis', ref: 'RRN 261122041152', netto: 76000, pb1: 7600, total: 83600, bom: '30g biji · 180ml susu', sync: 'Synced', tone: 'ok' },
];

// Page 5: 12 Multi-Outlet Fleet & Offline-First SQLite WAL Sync Telemetry
const OUTLETS = [
  { code: 'OUT-01', name: 'Kemang Raya (Kasir #1 & #2)', area: 'Jaksel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 42d', omzet: 4820000, pb1: 482000, bomVar: '-0,42%', hw: '3/3 Siap', syncAgo: '2 dtk lalu', selected: true },
  { code: 'OUT-02', name: 'Senopati Flagship Roastery', area: 'Jaksel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 55d', omzet: 6940000, pb1: 694000, bomVar: '-0,31%', hw: '3/3 Siap', syncAgo: '4 dtk lalu' },
  { code: 'OUT-03', name: 'SCBD Pacific Place Kiosk', area: 'Jaksel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 18d', omzet: 6250000, pb1: 625000, bomVar: '-0,24%', hw: '3/3 Siap', syncAgo: '3 dtk lalu' },
  { code: 'OUT-04', name: 'Mall Kota Kasablanka LG', area: 'Jaksel', net: 'OFFLINE-SAFE', netTone: 'warn', walQ: 24, kdsAvg: '4m 05d', omzet: 4680000, pb1: 468000, bomVar: '-0,48%', hw: '3/3 Lokal', syncAgo: '18 mnt lalu', warn: true },
  { code: 'OUT-05', name: 'Pondok Indah Mall 2', area: 'Jaksel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 48d', omzet: 5410000, pb1: 541000, bomVar: '-0,52%', hw: '3/3 Siap', syncAgo: '5 dtk lalu' },
  { code: 'OUT-06', name: 'Menteng Sabang Heritage', area: 'Jakpus', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 36d', omzet: 4320000, pb1: 432000, bomVar: '-0,29%', hw: '3/3 Siap', syncAgo: '2 dtk lalu' },
  { code: 'OUT-07', name: 'Kuningan City Cloud Kitchen', area: 'Jaksel', net: 'Online · 5G Bkp', netTone: 'info', walQ: 0, kdsAvg: '3m 24d', omzet: 4180000, pb1: 418000, bomVar: '-0,61%', hw: '3/3 Siap', syncAgo: '6 dtk lalu' },
  { code: 'OUT-08', name: 'PIK Avenue Promenade', area: 'Jakut', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '4m 01d', omzet: 4950000, pb1: 495000, bomVar: '-0,38%', hw: '3/3 Siap', syncAgo: '3 dtk lalu' },
  { code: 'OUT-09', name: 'Kelapa Gading Boulevard', area: 'Jakut', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 50d', omzet: 3860000, pb1: 386000, bomVar: '-0,44%', hw: '2/3 Kertas', syncAgo: '5 dtk lalu' },
  { code: 'OUT-10', name: 'Bintaro Xchange Park', area: 'Tangsel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 31d', omzet: 3420000, pb1: 342000, bomVar: '-0,35%', hw: '3/3 Siap', syncAgo: '4 dtk lalu' },
  { code: 'OUT-11', name: 'BSD The Breeze Courtyard', area: 'Tangsel', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 29d', omzet: 3210000, pb1: 321000, bomVar: '-0,22%', hw: '3/3 Siap', syncAgo: '3 dtk lalu' },
  { code: 'OUT-12', name: 'Depok Margonda Express', area: 'Depok', net: 'Online · Fiber', netTone: 'ok', walQ: 0, kdsAvg: '3m 15d', omzet: 2640000, pb1: 264000, bomVar: '-0,39%', hw: '3/3 Siap', syncAgo: '4 dtk lalu' },
];

// ============================================================================
// MATHEMATICAL CONSISTENCY ASSERTIONS
// ============================================================================
export function verifyMath() {
  if (BILL_SUBTOTAL !== 106000) throw new Error(`Bill subtotal mismatch: ${BILL_SUBTOTAL}`);
  if (BILL_PB1 !== 10600) throw new Error(`Bill PB1 mismatch: ${BILL_PB1}`);
  if (BILL_TOTAL !== 116600) throw new Error(`Bill total mismatch: ${BILL_TOTAL}`);

  const avgSec = KDS_COMPLETED.reduce((a, x) => a + x.secs, 0) / KDS_COMPLETED.length;
  if (avgSec !== 222) throw new Error(`KDS avg prep mismatch: ${avgSec}s (expected 222s)`);

  const bomHpp = BOM_MN01.reduce((a, x) => a + x.total, 0);
  if (bomHpp !== 11420) throw new Error(`MN-01 BOM HPP mismatch: ${bomHpp}`);

  const beanUsed = INGREDIENTS[0].used + INGREDIENTS[1].used;
  if (beanUsed !== 2480) throw new Error(`Bean shift usage mismatch: ${beanUsed}`);

  const parAlerts = INGREDIENTS.filter((x) => x.sisa <= x.par).length;
  if (parAlerts !== 3) throw new Error(`Par alert count mismatch: ${parAlerts}`);

  const sumTx = PAYMENT_CHANNELS.reduce((a, c) => a + c.tx, 0);
  const sumNetto = PAYMENT_CHANNELS.reduce((a, c) => a + c.netto, 0);
  const sumPb1 = PAYMENT_CHANNELS.reduce((a, c) => a + c.pb1, 0);
  const sumBruto = PAYMENT_CHANNELS.reduce((a, c) => a + c.bruto, 0);
  if (sumTx !== 118) throw new Error(`Shift tx mismatch: ${sumTx}`);
  if (sumNetto !== 4820000) throw new Error(`Shift netto mismatch: ${sumNetto}`);
  if (sumPb1 !== 482000) throw new Error(`Shift PB1 mismatch: ${sumPb1}`);
  if (sumBruto !== 5302000) throw new Error(`Shift bruto mismatch: ${sumBruto}`);

  const sumHourlyPos = HOURLY_POS.reduce((a, v) => a + v, 0) * 1000;
  const sumHourlyOjol = HOURLY_OJOL.reduce((a, v) => a + v, 0) * 1000;
  if (sumHourlyPos + sumHourlyOjol !== sumNetto) {
    throw new Error(`Hourly sum mismatch: ${sumHourlyPos + sumHourlyOjol} vs ${sumNetto}`);
  }

  const cashCount = CASH_DENOMS.reduce((a, d) => a + d.subtotal, 0);
  const expectedCash = SHIFT_MODAL_AWAL + PAYMENT_CHANNELS[3].bruto;
  if (cashCount !== expectedCash) throw new Error(`Cash count mismatch: ${cashCount} vs ${expectedCash}`);

  const fleetOmzet = OUTLETS.reduce((a, o) => a + o.omzet, 0);
  const fleetPb1 = OUTLETS.reduce((a, o) => a + o.pb1, 0);
  const fleetWalQ = OUTLETS.reduce((a, o) => a + o.walQ, 0);
  if (OUTLETS[0].omzet !== sumNetto) throw new Error(`Outlet Kemang cross-page omzet mismatch`);
  if (fleetOmzet !== 54680000) throw new Error(`Fleet omzet mismatch: ${fleetOmzet}`);
  if (fleetPb1 !== 5468000) throw new Error(`Fleet PB1 mismatch: ${fleetPb1}`);
  if (fleetWalQ !== 24) throw new Error(`Fleet WAL queue mismatch: ${fleetWalQ}`);
}

const TOTAL_STOCK_VAL = INGREDIENTS.reduce((a, x) => a + x.nilaiStok, 0);
const TOTAL_TX = PAYMENT_CHANNELS.reduce((a, c) => a + c.tx, 0);
const TOTAL_NETTO = PAYMENT_CHANNELS.reduce((a, c) => a + c.netto, 0);
const TOTAL_PB1 = PAYMENT_CHANNELS.reduce((a, c) => a + c.pb1, 0);
const TOTAL_BRUTO = PAYMENT_CHANNELS.reduce((a, c) => a + c.bruto, 0);
const TOTAL_FEE = PAYMENT_CHANNELS.reduce((a, c) => a + c.feeIdr, 0);
const TOTAL_NET_SETTLE = PAYMENT_CHANNELS.reduce((a, c) => a + c.netSettle, 0);
const TOTAL_CASH_PHYSICAL = CASH_DENOMS.reduce((a, d) => a + d.subtotal, 0);
const FLEET_OMZET = OUTLETS.reduce((a, o) => a + o.omzet, 0);
const FLEET_PB1 = OUTLETS.reduce((a, o) => a + o.pb1, 0);
const FLEET_WALQ = OUTLETS.reduce((a, o) => a + o.walQ, 0);
const MN01_HPP = BOM_MN01.reduce((a, x) => a + x.total, 0);

// ============================================================================
// DETERMINISTIC VECTOR SVG QRIS CODE (21x21 crisp modules)
// ============================================================================
function renderQrisSvg(size = 152) {
  const n = 21;
  const cell = size / n;
  const grid = Array.from({ length: n }, () => Array(n).fill(0));

  const placeFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = border || inner ? 1 : 0;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, n - 7);
  placeFinder(n - 7, 0);

  for (let i = 8; i < n - 8; i++) {
    grid[6][i] = i % 2 === 0 ? 1 : 0;
    grid[i][6] = i % 2 === 0 ? 1 : 0;
  }

  let seed = 4181166;
  const inFinder = (r, c) =>
    (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8) || r === 6 || c === 6;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c)) continue;
      if (r >= 9 && r <= 11 && c >= 9 && c <= 11) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      grid[r][c] = (seed >> 16) % 2;
    }
  }

  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${(cell + 0.15).toFixed(2)}" height="${(cell + 0.15).toFixed(2)}" fill="#1c1917"/>`;
      }
    }
  }
  const cx = (9 * cell).toFixed(1);
  const cw = (3 * cell).toFixed(1);

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;background:#ffffff;border:6px solid #ffffff;border-radius:3px;">
    <rect x="0" y="0" width="${size}" height="${size}" fill="#ffffff"/>
    ${rects}
    <rect x="${cx}" y="${cx}" width="${cw}" height="${cw}" rx="2" fill="#7c2d12"/>
    <text x="${(size / 2).toFixed(1)}" y="${(size / 2 + 3.5).toFixed(1)}" text-anchor="middle" font-size="8.5" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">QR</text>
  </svg>`;
}

// ============================================================================
// SHARED SHELL: WARM ESPRESSO TOPBAR + COMPACT TOUCH MODULE RAIL
// ============================================================================
const EXTRA_CSS = `
  .pos-topbar {
    height: 42px;
    background: #1d1613;
    color: #faf8f5;
    border-bottom: 1px solid #332721;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .pos-top-left, .pos-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .pos-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: -0.01em;
    color: #ffffff;
    white-space: nowrap;
  }
  .pos-brand-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #7c2d12;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pos-chip {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #2b211d;
    border: 1px solid #44352e;
    color: #e7e5e4;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .pos-chip-ok {
    background: #063829;
    border-color: #047857;
    color: #a7f3d0;
  }
  .pos-chip-warn {
    background: #451a03;
    border-color: #b45309;
    color: #fde68a;
  }
  .pos-shell {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .pos-rail {
    width: 66px;
    background: #261d19;
    border-right: 1px solid #3a2d27;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 8px 5px;
    flex-shrink: 0;
  }
  .pos-rail-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .pos-rail-btn {
    width: 100%;
    height: 52px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #a8a29e;
    font-size: 9.2px;
    font-weight: 600;
    border: 1px solid transparent;
    text-align: center;
    position: relative;
  }
  .pos-rail-btn.is-active {
    background: #7c2d12;
    color: #ffffff;
    border-color: #9a3412;
  }
  .pos-rail-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    font-family: var(--e-mono);
    font-size: 8.5px;
    font-weight: 700;
    padding: 0 4px;
    border-radius: 999px;
    background: #b45309;
    color: #ffffff;
    line-height: 1.4;
  }
  .pos-rail-foot {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 8px;
    border-top: 1px solid #3a2d27;
  }
  .pos-hw-pill {
    width: 100%;
    padding: 4px 2px;
    border-radius: 3px;
    background: #1d1613;
    border: 1px solid #3a2d27;
    color: #d6d3d1;
    font-family: var(--e-mono);
    font-size: 8.2px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .pos-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--e-bg);
  }
  .pos-subbar {
    height: 36px;
    padding: 0 12px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .pos-tab-strip {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .pos-cat-tab {
    height: 26px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid var(--e-border);
    background: #ffffff;
    color: #44403c;
    font-size: 10.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .pos-cat-tab.is-active {
    background: #7c2d12;
    border-color: #7c2d12;
    color: #ffffff;
  }
  .pos-cat-cnt {
    font-family: var(--e-mono);
    font-size: 9.5px;
    padding: 0 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.08);
  }
  .pos-cat-tab.is-active .pos-cat-cnt {
    background: rgba(255, 255, 255, 0.22);
    color: #ffffff;
  }

  /* POS Menu Tile */
  .pos-menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
    flex: 1;
    min-height: 0;
  }
  .pos-tile {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-radius: 5px;
    padding: 9px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }
  .pos-tile.is-incart {
    border-color: #7c2d12;
    background: #fffaf7;
    box-shadow: inset 3px 0 0 #7c2d12;
  }
  .pos-tile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .pos-tile-sku {
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    color: #78716c;
  }
  .pos-tile-qty {
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 3px;
    background: #7c2d12;
    color: #ffffff;
  }
  .pos-tile-name {
    font-size: 12.2px;
    font-weight: 700;
    color: #1c1917;
    line-height: 1.25;
    margin-top: 4px;
  }
  .pos-tile-sub {
    font-size: 10px;
    color: #57534e;
    margin-top: 2px;
  }
  .pos-tile-mid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 3px;
    background: #faf8f5;
    border: 1px solid #ece6de;
    font-family: var(--e-mono);
    font-size: 9.2px;
    color: #57534e;
  }
  .pos-tile-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
    padding-top: 6px;
    border-top: 1px dashed #e7e2da;
  }
  .pos-tile-price {
    font-family: var(--e-mono);
    font-size: 13.8px;
    font-weight: 800;
    color: #1c1917;
  }
  .pos-tile-bom {
    font-family: var(--e-mono);
    font-size: 9.1px;
    color: #5c1f0a;
    background: #fef2eb;
    padding: 1.5px 5px;
    border-radius: 2px;
    border: 1px solid #f5c2a8;
  }

  /* Modifier Chips */
  .mod-chip {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid #d6cec4;
    background: #faf8f5;
    color: #44403c;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .mod-chip.is-on {
    background: #fef2eb;
    border-color: #7c2d12;
    color: #5c1f0a;
    font-weight: 700;
  }

  /* KDS Dark Kitchen Surface */
  .kds-surface {
    background: #14110f;
    color: #f5f5f4;
  }
  .kds-surface table.e-table th {
    background: #261f1b;
    color: #a8a29e;
    border-bottom-color: #3a302a;
  }
  .kds-surface table.e-table td {
    border-bottom-color: #332a24;
    color: #e7e5e4;
  }
  .kds-surface table.e-table tbody tr:nth-child(odd) {
    background: #1f1a17 !important;
  }
  .kds-surface table.e-table tbody tr:nth-child(even) {
    background: #26201c !important;
  }
  .kds-card {
    background: #1f1a17;
    border: 1px solid #3a302a;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
  }
  .kds-card-head {
    padding: 7px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-bottom: 1px solid #3a302a;
  }
  .kds-card-ok { border-top: 3px solid #10b981; }
  .kds-card-warn { border-top: 3px solid #f59e0b; }
  .kds-card-bad { border-top: 3px solid #f43f5e; }
  .kds-timer {
    font-family: var(--e-mono);
    font-size: 15px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 3px;
  }
  .kds-timer-ok { background: #064e3b; color: #6ee7b7; border: 1px solid #047857; }
  .kds-timer-warn { background: #451a03; color: #fcd34d; border: 1px solid #b45309; }
  .kds-timer-bad { background: #4c0519; color: #fda4af; border: 1px solid #be123c; }
  .kds-line {
    padding: 6px 8px;
    border-radius: 3px;
    background: #29221e;
    border: 1px solid #3d332c;
    margin-bottom: 6px;
  }
  .kds-line.is-done {
    background: #17231e;
    border-color: #065f46;
  }

  /* Warm Table Overrides */
  table.e-table th {
    background: #f5f2ed;
    color: #57534e;
    border-bottom-color: #d6cec4;
  }
  table.e-table td {
    border-bottom-color: #ece6de;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbfa;
  }
  table.e-table tfoot td {
    background: #f0ebe3;
    border-top-color: #c9bfb3;
    color: #1c1917;
  }
  .e-statusbar {
    background: #ebe5dc;
    border-top-color: #cfc5b8;
    color: #44403c;
  }
  .e-badge-accent {
    background: #fef2eb;
    color: #7c2d12;
    border-color: #f5c2a8;
  }
`;

function renderPosShell({ activeTab, pageTitle, topRightNote, darkMain = false, bodyHtml }) {
  const tabs = [
    { id: 'p1', icon: 'coffee', label: 'Kasir' },
    { id: 'p2', icon: 'flame', label: 'KDS', badge: '6' },
    { id: 'p3', icon: 'scale', label: 'BOM Stok', badge: '3' },
    { id: 'p4', icon: 'receipt', label: 'Shift' },
    { id: 'p5', icon: 'store', label: 'Outlet', badge: '1' },
  ];

  const topbar = `<header class="pos-topbar">
    <div class="pos-top-left">
      <div class="pos-brand">
        <span class="pos-brand-mark">${pic('coffee', 14, '#ffffff')}</span>
        <span>KopiPOS Cloud</span>
      </div>
      <span class="pos-chip" style="background:#332721;border-color:#574238;color:#fed7aa;">
        ${pic('store', 12, '#fdba74')}
        <span>Outlet Kemang — Kasir #1</span>
      </span>
      <span class="pos-chip pos-chip-ok">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">SINKRON AKTIF · SQLITE WAL 0 TERTUNDA</span>
      </span>
      <span class="pos-chip">
        ${pic('printer', 12, '#a7f3d0')}
        <span class="mono" style="font-size:9.8px;">ESC/POS 80mm SIAP</span>
      </span>
    </div>
    <div class="pos-top-right">
      <span class="pos-chip">
        ${ic('clock', 11, '#a8a29e')}
        <span class="mono" style="font-size:9.8px;">Shift Pagi · 22 Nov 2026 · 10:14 WIB</span>
      </span>
      ${topRightNote || ''}
      <div class="e-user-chip" style="border-left-color:#3a2d27;">
        <span class="e-avatar" style="background:#7c2d12;">RW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#faf8f5;">Rina Wulandari</div>
          <div style="font-size:9px;color:#a8a29e;">Kasir #1 · Store Manager</div>
        </div>
      </div>
    </div>
  </header>`;

  const rail = `<nav class="pos-rail">
    <div class="pos-rail-group">
      ${tabs
        .map(
          (t) => `<div class="pos-rail-btn ${t.id === activeTab ? 'is-active' : ''}">
            ${pic(t.icon, 16, t.id === activeTab ? '#ffffff' : '#a8a29e')}
            <span>${esc(t.label)}</span>
            ${t.badge ? `<span class="pos-rail-badge">${esc(t.badge)}</span>` : ''}
          </div>`
        )
        .join('')}
    </div>
    <div class="pos-rail-foot">
      <div class="pos-hw-pill">
        <span class="dot dot-ok"></span>
        <span>SQLITE</span>
      </div>
      <div class="pos-hw-pill">
        <span class="dot dot-ok"></span>
        <span>QRIS</span>
      </div>
      <div class="pos-hw-pill">
        <span class="dot dot-ok"></span>
        <span>TM-T82</span>
      </div>
    </div>
  </nav>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> SQLite WAL Edge v3.46 (0 tertunda)`,
      `${ic('database', 11, '#7c2d12')} .NET 9 Cloud API: 48 ms`,
      `${pic('printer', 11, '#047857')} Epson TM-T82X + Stiker XP-365B`,
      `${pic('qr', 11, '#0369a1')} Acquirer BCA SNAP QRIS · PB1 10% Aktif`,
    ],
    rightItems: [
      `PT Kopi Nusantara Sejahtera · 12 Outlet JABODETABEK`,
      `Build v4.8.2-maui`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `KopiPOS Cloud — ${pageTitle}`,
    accent: '#7c2d12',
    accentSoft: '#fef2eb',
    accentInk: '#5c1f0a',
    bg: '#f5f2ed',
    surface: '#ffffff',
    surface2: '#faf8f5',
    border: '#dfd8cf',
    borderStrong: '#c9bfb3',
    text: '#1c1917',
    text2: '#44403c',
    muted: '#6b645c',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}
      <div class="pos-shell">
        ${rail}
        <main class="pos-main ${darkMain ? 'kds-surface' : ''}">${bodyHtml}</main>
      </div>
      ${footer}`,
  });
}

// ============================================================================
// PAGE 1: TERMINAL KASIR TOUCH POS & LAYAR QRIS DINAMIS
// ============================================================================
function renderPage1() {
  const categories = [
    { name: 'Semua Menu', cnt: 12, active: true },
    { name: 'Espresso & Susu', cnt: 4 },
    { name: 'Manual Brew', cnt: 2 },
    { name: 'Non-Kopi', cnt: 2 },
    { name: 'Pastry & Oven', cnt: 3 },
    { name: 'Kupon Karyawan', cnt: 1 },
  ];

  const menuTilesHtml = MENU_ITEMS.map(
    (m) => `<div class="pos-tile ${m.inCart > 0 ? 'is-incart' : ''}" style="border-top:2.5px solid ${m.accent};">
      <div>
        <div class="pos-tile-top">
          <span class="pos-tile-sku">${esc(m.code)} · ${esc(m.cat)}</span>
          ${
            m.inCart > 0
              ? `<span class="pos-tile-qty">${m.inCart}x</span>`
              : `<span class="e-badge ${m.stockTag.startsWith('Sisa') ? 'e-badge-warn' : m.stockTag === 'Promo' ? 'e-badge-info' : 'e-badge-neutral'}" style="font-size:9px;padding:1px 5px;">${esc(m.stockTag)}</span>`
          }
        </div>
        <div class="pos-tile-name">${esc(m.name)}</div>
        <div class="pos-tile-sub trunc">${esc(m.sub)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        <div class="pos-tile-mid">
          <span>${esc(m.station)}</span>
          <span>HPP ${esc(m.cogsPct)}</span>
        </div>
        <div class="pos-tile-foot">
          <div class="pos-tile-price">${fmtIdr(m.price)}</div>
          <span class="pos-tile-bom">${esc(m.bom)}</span>
        </div>
      </div>
    </div>`
  ).join('');

  const billItemsHtml = ACTIVE_BILL_ITEMS.map(
    (item) => `<div style="padding:7.5px 10px;border-bottom:1px solid #ece6de;display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
      <div style="min-width:0;flex:1;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="mono" style="font-size:10px;font-weight:700;color:#7c2d12;background:#fef2eb;border:1px solid #f5c2a8;padding:0 4px;border-radius:2px;">${item.qty}x</span>
          <span style="font-size:11.5px;font-weight:700;color:#1c1917;">${esc(item.name)}</span>
          <span class="e-badge ${item.station === 'BARISTA' ? 'e-badge-accent' : 'e-badge-warn'}" style="font-size:8.6px;padding:0 4px;">${esc(item.station)}</span>
        </div>
        <div style="font-size:9.8px;color:#57534e;margin-top:2px;">${esc(item.mods)}</div>
        <div class="mono" style="font-size:9px;color:#78716c;margin-top:2px;">BOM: ${esc(item.bomNote)}</div>
      </div>
      <div class="mono" style="font-size:12px;font-weight:700;color:#1c1917;white-space:nowrap;">${fmtIdr(item.qty * item.unitPrice)}</div>
    </div>`
  ).join('');

  const bodyHtml = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:960px 1fr;gap:10px;padding:10px 12px;overflow:hidden;">
      <!-- LEFT: TOUCH POS CATALOG & QUICK MODIFIER ENGINE -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
        <!-- Shift Quick Metrics + Search -->
        <div style="display:grid;grid-template-columns:1fr 158px 136px 142px;gap:8px;flex-shrink:0;">
          <div style="background:#ffffff;border:1px solid var(--e-border);border-radius:4px;padding:0 10px;height:44px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:7px;color:#78716c;font-size:11px;">
              ${ic('search', 14, '#7c2d12')}
              <span>Cari menu, SKU (MN-01), barcode pastry, atau kupon karyawan...</span>
            </div>
            <span class="mono" style="font-size:9.5px;padding:2px 6px;border-radius:3px;background:#f5f2ed;border:1px solid #d6cec4;color:#57534e;">F2 / SCAN</span>
          </div>
          <div class="e-kpi" style="padding:5px 9px;height:44px;justify-content:center;">
            <div style="font-size:9.2px;color:var(--e-muted);font-weight:600;">Omzet Shift Pagi</div>
            <div class="mono" style="font-size:13.5px;font-weight:800;color:#1c1917;">${fmtIdr(TOTAL_NETTO)}</div>
          </div>
          <div class="e-kpi" style="padding:5px 9px;height:44px;justify-content:center;">
            <div style="font-size:9.2px;color:var(--e-muted);font-weight:600;">Rata Siap KDS</div>
            <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">3m 42d</div>
          </div>
          <div class="e-kpi" style="padding:5px 9px;height:44px;justify-content:center;">
            <div style="font-size:9.2px;color:var(--e-muted);font-weight:600;">Antrean Sync</div>
            <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">0 tertunda</div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
          <div class="pos-tab-strip">
            ${categories
              .map(
                (c) => `<div class="pos-cat-tab ${c.active ? 'is-active' : ''}">
                  <span>${esc(c.name)}</span>
                  <span class="pos-cat-cnt">${c.cnt}</span>
                </div>`
              )
              .join('')}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Dine-In · Meja 07', 'accent')}
            ${badge('GoFood / GrabFood Auto-Accept', 'ok')}
          </div>
        </div>

        <!-- 4x3 Touch Menu Grid -->
        <div class="pos-menu-grid">
          ${menuTilesHtml}
        </div>

        <!-- Bottom Quick Modifier & Live BOM Engine Bar -->
        <div class="e-panel" style="height:166px;flex-shrink:0;">
          <div class="e-panel-head" style="height:30px;">
            <div class="e-panel-title">
              ${ic('sliders', 13, '#7c2d12')}
              <span>Modifier Cepat &amp; Potong Resep BOM — MN-01 Es Kopi Susu Aren (Large)</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="mono" style="font-size:9.8px;color:#57534e;">HPP Est: <strong>${fmtIdr(MN01_HPP)}</strong> (31,7%)</span>
              ${badge('Auto-Deduct SQLite', 'ok')}
            </div>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div style="display:grid;grid-template-columns:1fr 1.05fr;gap:10px;">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:nowrap;">
                <span style="font-size:9.8px;font-weight:700;color:#78716c;width:36px;flex-shrink:0;white-space:nowrap;">Susu:</span>
                <span class="mod-chip">Fresh Milk (+0)</span>
                <span class="mod-chip is-on">Oatside (+Rp 8.000)</span>
                <span class="mod-chip">Almond (+Rp 9.000)</span>
                <span class="mod-chip">Soy (+Rp 6.000)</span>
              </div>
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:nowrap;">
                <span style="font-size:9.8px;font-weight:700;color:#78716c;width:48px;flex-shrink:0;white-space:nowrap;">Es/Gula:</span>
                <span class="mod-chip">Normal Ice</span>
                <span class="mod-chip is-on">Less Ice (-40g)</span>
                <span class="mod-chip is-on">Aren 75% (20ml)</span>
                <span class="mod-chip">Extra Shot (+Rp 7.000)</span>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:8px;padding-top:6px;border-top:1px solid #ece6de;">
              <div style="background:#faf8f5;border:1px solid #e7e2da;border-radius:4px;padding:6px 9px;">
                <div style="font-size:9.2px;font-weight:700;color:#7c2d12;margin-bottom:2px;">PRATINJAU POTONG STOK BOM STRUK #KMG-0418 (SAAT LUNAS)</div>
                <div class="mono" style="font-size:9.6px;color:#1c1917;display:flex;gap:10px;flex-wrap:nowrap;">
                  <span>-18g House Blend</span>
                  <span>-15g V60 Gayo</span>
                  <span>-180ml Oatside</span>
                  <span>-20ml Aren</span>
                  <span>-1 Croissant</span>
                </div>
              </div>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:6px 9px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div>
                  <div style="font-size:9.2px;font-weight:700;color:#047857;">KUPON SUBSIDI KARYAWAN &amp; PROMO</div>
                  <div style="font-size:9.6px;color:#166534;">Siap scan ID Karyawan (Rp 30.000) · Pajak PB1 10% otomatis</div>
                </div>
                <span class="e-btn" style="border-color:#047857;color:#047857;background:#ffffff;height:24px;">Scan Kupon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: ACTIVE BILL (#KMG-0418) + CUSTOMER-FACING QRIS SECONDARY SCREEN -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0;">
        <!-- Active Order Bill Panel -->
        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head" style="height:34px;background:#fef2eb;border-bottom-color:#f5c2a8;">
            <div class="e-panel-title" style="color:#5c1f0a;">
              ${pic('receipt', 14, '#7c2d12')}
              <span>Struk #KMG-0418</span>
              <span class="e-badge e-badge-accent">Dine-In · Meja 07</span>
            </div>
            <span class="mono" style="font-size:9.8px;color:#5c1f0a;font-weight:600;">Dimas A. · Tier Roaster</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <div>
              <!-- Order Type & Routing Mode Strip -->
              <div style="padding:6px 10px;background:#faf8f5;border-bottom:1px solid #ece6de;display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <div style="display:flex;gap:4px;">
                  <span class="mod-chip is-on" style="height:21px;font-size:9.5px;">Dine-In</span>
                  <span class="mod-chip" style="height:21px;font-size:9.5px;">Takeaway</span>
                  <span class="mod-chip" style="height:21px;font-size:9.5px;">GoFood</span>
                  <span class="mod-chip" style="height:21px;font-size:9.5px;">GrabFood</span>
                </div>
                <span class="mono" style="font-size:9.3px;color:#047857;font-weight:700;">+116 Poin Member</span>
              </div>
              ${billItemsHtml}
              <!-- Order Notes & Station Routing Confirmation -->
              <div style="padding:7px 10px;background:#fffaf7;border-bottom:1px solid #f5e2d7;display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.5px;">
                  <span style="font-weight:700;color:#7c2d12;">Catatan KDS &amp; Rute Stasiun</span>
                  <span class="mono" style="color:#57534e;">2 Barista · 1 Kitchen · 2 Stiker Cup</span>
                </div>
                <div style="font-size:9.8px;color:#44403c;background:#ffffff;border:1px solid #e7e2da;border-radius:3px;padding:4px 7px;">
                  &ldquo;Sajikan V60 Gayo bersamaan dengan Croissant Almond hangat di Meja 07.&rdquo;
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.4px;color:#047857;">
                  <span>Printer ESC/POS TM-T82X: Siap cetak struk &amp; nomor antrean</span>
                  <span class="mono" style="font-weight:700;">WAL Commit: 6 ms</span>
                </div>
              </div>
            </div>

            <!-- Calculation & Payment Action Block -->
            <div style="padding:9px 11px;background:#faf8f5;border-top:1px solid var(--e-border);">
              <div style="display:grid;grid-template-columns:1fr auto;row-gap:3px;font-size:10.8px;margin-bottom:7px;">
                <span style="color:#57534e;">Subtotal (3 item · 2 Barista, 1 Kitchen)</span>
                <span class="mono" style="font-weight:600;color:#1c1917;text-align:right;">${fmtIdr(BILL_SUBTOTAL)}</span>
                <span style="color:#57534e;">Pajak Restoran PB1 (10,0%)</span>
                <span class="mono" style="font-weight:600;color:#1c1917;text-align:right;">${fmtIdr(BILL_PB1)}</span>
                <span style="color:#57534e;">Service Charge (0% · Counter Service)</span>
                <span class="mono" style="font-weight:600;color:#78716c;text-align:right;">Rp 0</span>
                <div style="grid-column:1/-1;border-top:1px solid #d6cec4;margin:3px 0;"></div>
                <span style="font-size:12.5px;font-weight:800;color:#1c1917;">Total Tagihan Pelanggan</span>
                <span class="mono" style="font-size:16px;font-weight:800;color:#7c2d12;text-align:right;">${fmtIdr(BILL_TOTAL)}</span>
              </div>

              <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:6px;margin-bottom:6px;">
                <div class="e-btn e-btn-primary" style="height:34px;justify-content:center;font-size:11.5px;border-radius:4px;">
                  ${pic('qr', 14, '#ffffff')}
                  <span>Bayar QRIS Dinamis</span>
                </div>
                <div class="e-btn" style="height:34px;justify-content:center;font-size:11.2px;border-radius:4px;border-color:#7c2d12;color:#7c2d12;background:#fef2eb;">
                  ${pic('flame', 14, '#7c2d12')}
                  <span>Kirim ke Barista</span>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
                <div class="e-btn" style="height:26px;justify-content:center;font-size:10.2px;">${pic('wallet', 12, '#44403c')} Tunai Pas</div>
                <div class="e-btn" style="height:26px;justify-content:center;font-size:10.2px;">${pic('split', 12, '#44403c')} Split Bill</div>
                <div class="e-btn" style="height:26px;justify-content:center;font-size:10.2px;">${pic('printer', 12, '#44403c')} Cetak Draf</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Screen Preview: Layar Pelanggan QRIS Dinamis -->
        <div class="e-panel" style="height:326px;flex-shrink:0;border-color:#44352e;background:#1d1613;color:#faf8f5;">
          <div class="e-panel-head" style="height:30px;background:#2b211d;border-bottom-color:#44352e;">
            <div class="e-panel-title" style="color:#faf8f5;font-size:11px;">
              ${pic('monitor', 13, '#fdba74')}
              <span>Layar Pelanggan (Display #2) — QRIS Dinamis</span>
            </div>
            <span class="e-badge" style="background:#064e3b;color:#6ee7b7;border-color:#047857;font-size:9.2px;">WEBHOOK INSTAN · 04:42</span>
          </div>
          <div class="e-panel-body" style="padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
            <div style="display:grid;grid-template-columns:168px 1fr;gap:12px;align-items:center;">
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                ${renderQrisSvg(152)}
                <div class="mono" style="font-size:8.8px;color:#d6d3d1;">NMID: ID1024319884201</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
                <div>
                  <div style="font-size:9.2px;color:#a8a29e;font-weight:700;letter-spacing:0.04em;">MERCHANT TERVERIFIKASI BI-SNAP</div>
                  <div style="font-size:13.2px;font-weight:800;color:#ffffff;">KOPI NUSANTARA KEMANG</div>
                </div>
                <div style="background:#2b211d;border:1px solid #44352e;border-radius:4px;padding:7px 9px;">
                  <div style="font-size:9.2px;color:#d6d3d1;">Nominal QRIS Dinamis (Sudah PB1 10%)</div>
                  <div class="mono" style="font-size:21px;font-weight:800;color:#fdba74;line-height:1.15;">${fmtIdr(BILL_TOTAL)}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:9.8px;">
                  <div style="background:#261d19;border:1px solid #3a2d27;border-radius:3px;padding:4px 7px;">
                    <div style="color:#a8a29e;font-size:8.8px;">Acquirer</div>
                    <div class="mono" style="color:#faf8f5;font-weight:700;">BCA QRIS SNAP</div>
                  </div>
                  <div style="background:#261d19;border:1px solid #3a2d27;border-radius:3px;padding:4px 7px;">
                    <div style="color:#a8a29e;font-size:8.8px;">Status Lunas</div>
                    <div class="mono" style="color:#6ee7b7;font-weight:700;">SIAP KONFIRMASI</div>
                  </div>
                </div>
              </div>
            </div>
            <div style="background:#140f0d;border:1px solid #3a2d27;border-radius:3px;padding:6px 9px;font-family:var(--e-mono);font-size:9.2px;color:#d6d3d1;line-height:1.38;">
              Struk #KMG-0418 | Subtotal Rp 106.000 + PB1 10% Rp 10.600 = Rp 116.600 | QRIS Dinamis Lunas -&gt; Stok BOM Terpotong.
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return renderPosShell({
    activeTab: 'p1',
    pageTitle: meta.pages[0].title,
    topRightNote: `<span class="pos-chip" style="background:#3a2016;border-color:#7c2d12;color:#fed7aa;">${pic('tag', 11, '#fdba74')} PB1 10% · QRIS Dinamis</span>`,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 2: LAYAR BARISTA & KITCHEN DISPLAY SYSTEM (KDS DUAL-STATION)
// ============================================================================
function renderPage2() {
  const baristaCards = KDS_BARISTA_TICKETS.map((t) => {
    const linesHtml = t.lines
      .map(
        (l) => `<div class="kds-line ${l.done ? 'is-done' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <div style="display:flex;align-items:center;gap:6px;min-width:0;">
              <span class="mono" style="font-size:11px;font-weight:800;background:#7c2d12;color:#ffffff;padding:1px 5px;border-radius:2px;">${l.qty}x</span>
              <span style="font-size:12px;font-weight:700;color:${l.done ? '#a7f3d0' : '#ffffff'};${l.done ? 'text-decoration:line-through;' : ''}">${esc(l.title)}</span>
            </div>
            ${l.done ? `<span class="mono" style="font-size:9px;color:#34d399;font-weight:700;">SELESAI</span>` : `<span class="mono" style="font-size:9px;color:#fbbf24;font-weight:700;">SEDANG SEDUH</span>`}
          </div>
          <div style="margin-top:4px;padding-left:28px;display:flex;flex-direction:column;gap:2.5px;">
            ${l.mods.map((m) => `<div style="font-size:10.3px;color:${l.done ? '#6ee7b7' : '#fed7aa'};">&bull; ${esc(m)}</div>`).join('')}
          </div>
        </div>`
      )
      .join('');

    return `<div class="kds-card kds-card-${t.slaTone}">
      <div class="kds-card-head" style="background:#261f1b;">
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="mono" style="font-size:13.5px;font-weight:800;color:#ffffff;">${esc(t.id)}</span>
            <span style="font-size:9px;font-weight:700;padding:1.5px 6px;border-radius:2px;background:${t.chanColor};color:#ffffff;">${esc(t.channel)}</span>
          </div>
          <div style="font-size:10px;color:#d6d3d1;margin-top:2px;" class="trunc">${esc(t.customer)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="kds-timer kds-timer-${t.slaTone}">${esc(t.timer)}</div>
          <div style="font-size:8.6px;font-weight:700;color:${t.slaTone === 'bad' ? '#fda4af' : t.slaTone === 'warn' ? '#fcd34d' : '#6ee7b7'};margin-top:2px;">${esc(t.slaLabel)}</div>
        </div>
      </div>
      <div style="padding:9px 10px;flex:1;display:flex;flex-direction:column;justify-content:space-between;min-height:0;gap:6px;">
        <div>${linesHtml}</div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <div style="background:#181411;border:1px solid #3a302a;border-left:2.5px solid #d97706;border-radius:3px;padding:6px 8px;font-size:10px;color:#fde68a;">
            <strong style="color:#fdba74;">Catatan Barista:</strong> ${esc(t.note)}
          </div>
          <div style="border-top:1px solid #3a302a;padding-top:7px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <div class="mono" style="font-size:9.3px;color:#a8a29e;">
              <div>BOM: <span style="color:#e7e5e4;">${esc(t.bomTotal)}</span></div>
              <div>${esc(t.cupStickers)}</div>
            </div>
            <div style="height:30px;padding:0 13px;border-radius:3px;background:${t.slaTone === 'bad' ? '#be123c' : '#047857'};color:#ffffff;font-size:10.5px;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
              ${ic('check', 13, '#ffffff')} BUMP SIAP
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  const kitchenCards = KDS_KITCHEN_TICKETS.map((t) => {
    const linesHtml = t.lines
      .map(
        (l) => `<div class="kds-line ${l.done ? 'is-done' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="mono" style="font-size:10.5px;font-weight:800;background:#b45309;color:#ffffff;padding:1px 5px;border-radius:2px;">${l.qty}x</span>
              <span style="font-size:11.4px;font-weight:700;color:${l.done ? '#a7f3d0' : '#ffffff'};">${esc(l.title)}</span>
            </div>
            <span class="mono" style="font-size:9px;color:${l.done ? '#34d399' : '#fcd34d'};font-weight:700;">${l.done ? 'SIAP PACK' : 'OVEN'}</span>
          </div>
          <div style="margin-top:3px;padding-left:26px;">
            ${l.mods.map((m) => `<div style="font-size:9.8px;color:#fde68a;">&bull; ${esc(m)}</div>`).join('')}
          </div>
        </div>`
      )
      .join('');

    return `<div class="kds-card kds-card-${t.slaTone}">
      <div class="kds-card-head" style="background:#261f1b;">
        <div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="mono" style="font-size:12.5px;font-weight:800;color:#ffffff;">${esc(t.id)}</span>
            <span style="font-size:8.8px;font-weight:700;padding:1.5px 5px;border-radius:2px;background:${t.chanColor};color:#ffffff;">${esc(t.channel)}</span>
          </div>
          <div style="font-size:9.5px;color:#a8a29e;margin-top:2px;">${esc(t.stationNote)}</div>
        </div>
        <div class="kds-timer kds-timer-${t.slaTone}" style="font-size:13.5px;">${esc(t.timer)}</div>
      </div>
      <div style="padding:7px 9px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
        <div>${linesHtml}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:5px;border-top:1px solid #3a302a;">
          <span style="font-size:9.2px;color:#a8a29e;">Sinkron dgn Barista: Aktif</span>
          <span style="height:24px;padding:0 10px;border-radius:3px;background:#047857;color:#ffffff;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">${ic('check', 12, '#ffffff')} BUMP KITCHEN</span>
        </div>
      </div>
    </div>`;
  }).join('');

  const completedRows = KDS_COMPLETED.map((c) => {
    const mm = Math.floor(c.secs / 60);
    const ss = String(c.secs % 60).padStart(2, '0');
    const over = c.secs > 240;
    return `<tr>
      <td class="mono" style="color:#fed7aa;font-weight:700;">${esc(c.id)}</td>
      <td style="color:#e7e5e4;">${esc(c.channel)}</td>
      <td style="color:#d6d3d1;">${esc(c.items)}</td>
      <td class="mono num" style="color:${over ? '#fcd34d' : '#6ee7b7'};font-weight:700;">${mm}m ${ss}d</td>
    </tr>`;
  }).join('');

  const bodyHtml = `
    <!-- KDS Dark Telemetry Subbar -->
    <div style="height:40px;padding:0 12px;background:#1c1714;border-bottom:1px solid #332a24;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:12.5px;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:6px;">
          ${pic('flame', 15, '#fdba74')}
          Kitchen &amp; Barista Display System (KDS Dual-Station)
        </span>
        <span class="mono" style="font-size:10px;padding:2px 7px;border-radius:3px;background:#7c2d12;color:#ffffff;font-weight:700;">STASIUN BARISTA: 4 TIKET</span>
        <span class="mono" style="font-size:10px;padding:2px 7px;border-radius:3px;background:#92400e;color:#fde68a;font-weight:700;">STASIUN KITCHEN: 2 TIKET</span>
        <span class="mono" style="font-size:10px;padding:2px 7px;border-radius:3px;background:#4c0519;color:#fda4af;border:1px solid #be123c;font-weight:700;">1 TIKET &gt; SLA 5M</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="mono" style="font-size:10.5px;color:#6ee7b7;font-weight:700;">Rata Siap Shift: 3m 42d (Target &lt; 4m 00d)</span>
        <span class="mono" style="font-size:9.8px;padding:3px 8px;border-radius:3px;background:#29221e;border:1px solid #44372f;color:#d6d3d1;">LAN Broadcast: 9 ms · Stiker XP-365B OK</span>
      </div>
    </div>

    <!-- KDS Split Board -->
    <div style="flex:1;min-height:0;padding:10px 12px;display:grid;grid-template-columns:1012px 1fr;gap:10px;overflow:hidden;">
      <!-- LEFT: STASIUN BARISTA (2x2 LARGE TOUCH TICKETS) -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="font-size:11px;font-weight:700;color:#fed7aa;letter-spacing:0.03em;">STASIUN BARISTA #1 — ESPRESSO MACHINE, MANUAL BREW V60 &amp; COLD BAR</div>
          <div class="mono" style="font-size:9.8px;color:#a8a29e;">Auto-Routing: Minuman -&gt; KDS-BAR-01 + Printer Stiker Cup</div>
        </div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:9px;">
          ${baristaCards}
        </div>
      </div>

      <!-- RIGHT: STASIUN KITCHEN/PASTRY + RECALL LOG + SLA DISTRIBUTION -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="font-size:11px;font-weight:700;color:#fde68a;letter-spacing:0.03em;">STASIUN KITCHEN &amp; PASTRY #2 — OVEN &amp; PACKAGING</div>
          <span class="mono" style="font-size:9.5px;color:#a8a29e;">KDS-KIT-02</span>
        </div>

        <div style="display:grid;grid-template-rows:164px 226px;gap:8px;height:398px;flex-shrink:0;">
          ${kitchenCards}
        </div>

        <!-- Recall & SLA Verification Panel -->
        <div class="e-panel" style="flex:1;min-height:0;background:#1f1a17;border-color:#3a302a;">
          <div class="e-panel-head" style="height:30px;background:#261f1b;border-bottom-color:#3a302a;">
            <div class="e-panel-title" style="color:#faf8f5;font-size:11px;">
              ${ic('clock', 12, '#6ee7b7')}
              <span>Recall Tiket Selesai &amp; Audit SLA (6 Terakhir)</span>
            </div>
            <span class="mono" style="font-size:9.8px;color:#6ee7b7;font-weight:700;">Rata: 3m 42d</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:78px;">Tiket</th>
                  <th style="width:76px;">Channel</th>
                  <th>Ringkasan Item</th>
                  <th class="num" style="width:62px;">Durasi</th>
                </tr>
              </thead>
              <tbody>${completedRows}</tbody>
            </table>

            <!-- SLA Compliance Distribution Bar -->
            <div style="padding:8px 10px;background:#1c1714;border-top:1px solid #3a302a;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#d6d3d1;">
                <span style="font-weight:700;">Distribusi SLA Shift Pagi (118 Struk Selesai)</span>
                <span class="mono" style="color:#6ee7b7;font-weight:700;">93,2% Dalam Target &lt; 4m</span>
              </div>
              <div style="height:9px;border-radius:2px;overflow:hidden;display:flex;background:#29221e;">
                <div style="width:68%;background:#059669;" title="< 3m"></div>
                <div style="width:25.2%;background:#d97706;" title="3m - 4m"></div>
                <div style="width:6.8%;background:#e11d48;" title="> 4m"></div>
              </div>
              <div class="mono" style="display:flex;justify-content:space-between;font-size:9px;color:#a8a29e;">
                <span>&lt;3m: 80 struk (68%)</span>
                <span>3–4m: 30 struk (25,2%)</span>
                <span style="color:#fda4af;">&gt;4m: 8 struk (6,8%)</span>
              </div>
            </div>

            <div style="padding:8px 10px;background:#181411;border-top:1px solid #3a302a;display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
              <div>
                <div style="font-size:9px;color:#a8a29e;">Barista Espresso</div>
                <div class="mono" style="font-size:12.5px;font-weight:700;color:#6ee7b7;">2m 54d</div>
              </div>
              <div>
                <div style="font-size:9px;color:#a8a29e;">Manual Brew V60</div>
                <div class="mono" style="font-size:12.5px;font-weight:700;color:#fcd34d;">3m 58d</div>
              </div>
              <div>
                <div style="font-size:9px;color:#a8a29e;">Kitchen / Oven</div>
                <div class="mono" style="font-size:12.5px;font-weight:700;color:#6ee7b7;">3m 18d</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return renderPosShell({
    activeTab: 'p2',
    pageTitle: meta.pages[1].title,
    darkMain: true,
    topRightNote: `<span class="pos-chip pos-chip-warn">${pic('flame', 11, '#fcd34d')} 1 Tiket Lewat SLA</span>`,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 3: MESIN RESEP BOM, POTONG GRAM & STOK FEFO BAHAN BAKU
// ============================================================================
function renderPage3() {
  const ingRows = INGREDIENTS.map(
    (x) => `<tr class="${x.selected ? 'is-selected' : x.tone === 'bad' ? 'is-bad' : x.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#5c1f0a;">${esc(x.code)}</td>
      <td>
        <div style="font-weight:600;color:#1c1917;" class="trunc">${esc(x.name)}</div>
        <div class="mono" style="font-size:9px;color:#78716c;">Batch ${esc(x.batch)} · Exp ${esc(x.exp)}</div>
      </td>
      <td class="mono num">${fmtNum(x.awal)} ${x.unit}</td>
      <td class="mono num" style="color:#be123c;font-weight:600;">-${fmtNum(x.used)} ${x.unit}</td>
      <td class="mono num" style="font-weight:700;">${fmtNum(x.sisa)} ${x.unit}</td>
      <td class="mono num" style="color:#57534e;">${fmtNum(x.par)} ${x.unit}</td>
      <td>${renderStockBar(x.pctCap, x.tone)}</td>
      <td class="mono num">${fmtIdr(x.hpp)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(x.nilaiStok)}</td>
      <td>${badge(x.status, x.tone)}</td>
    </tr>`
  ).join('');

  const bomRows = BOM_MN01.map(
    (b) => `<tr>
      <td>
        <div style="font-weight:600;color:#1c1917;" class="trunc">${esc(b.ing)}</div>
        <div style="font-size:9px;color:#78716c;" class="trunc">${esc(b.rule)}</div>
      </td>
      <td class="mono num" style="font-weight:700;color:#7c2d12;">${esc(b.qty)}</td>
      <td class="mono num" style="color:#57534e;">${esc(b.unitCost)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(b.total)}</td>
    </tr>`
  ).join('');

  const modDeltaRows = MODIFIER_DELTAS.map(
    (m) => `<tr>
      <td style="font-weight:600;color:#1c1917;">${esc(m.mod)}</td>
      <td class="mono" style="font-size:9.3px;color:#57534e;">${esc(m.bomDelta)}</td>
      <td class="mono num" style="color:#7c2d12;font-weight:600;">${esc(m.hppDelta)}</td>
      <td class="mono num" style="color:#047857;font-weight:700;">${esc(m.priceDelta)}</td>
    </tr>`
  ).join('');

  const bodyHtml = `
    <div class="pos-subbar">
      <div class="e-crumb">
        <span>Inventori &amp; HPP</span>
        ${ic('chevronRight', 12, '#a8a29e')}
        <strong>Mesin Resep BOM (Satuan Gram/ml) &amp; Stok FEFO Outlet Kemang</strong>
      </div>
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="e-badge e-badge-warn">3 Bahan Di Bawah Par Level</span>
        <span class="e-btn">${ic('download', 12, '#44403c')} Ekspor Kartu Stok</span>
        <span class="e-btn e-btn-primary">${pic('box', 12, '#ffffff')} Buat PO Restock Sentral</span>
      </div>
    </div>

    <div class="e-content">
      <!-- 5 KPI Strip -->
      <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Total Nilai Stok Outlet</span>${pic('box', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_STOCK_VAL)}</span></div>
          <div class="e-kpi-foot"><span>14 SKU aktif · Metode FEFO</span><span style="color:#047857;font-weight:600;">Terrekonsiliasi</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Pemakaian Biji Kopi Shift</span>${pic('coffee', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">2.480 g</span></div>
          <div class="e-kpi-foot"><span>2.045g House + 435g V60 Gayo</span><span class="mono">138 shot</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Rata COGS / HPP Menu</span>${pic('scale', 13, '#047857')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">28,4%</span></div>
          <div class="e-kpi-foot"><span>Target HPP &le; 32,0%</span><span style="color:#047857;font-weight:600;">-3,6% hemat</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Peringatan Par Level</span>${ic('alert', 13, '#be123c')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">3 SKU</span></div>
          <div class="e-kpi-foot"><span>Matcha, Croissant (6), Pain (4)</span><span style="color:#be123c;font-weight:600;">Order PO</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Varians Stok Opname</span>${ic('checkCircle', 13, '#047857')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">-0,42%</span></div>
          <div class="e-kpi-foot"><span>Toleransi shrinkage &lt; 1,0%</span><span style="color:#047857;font-weight:600;">Wajar</span></div>
        </div>
      </div>

      <!-- Main Split: 14-Row FEFO Ledger + Right Recipe BOM Inspector -->
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:1012px 1fr;gap:10px;">
        <div class="e-panel">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('layers', 13, '#7c2d12')}
              <span>Kartu Stok Bahan Baku FEFO &amp; Pemotongan Otomatis Shift Pagi (14 SKU)</span>
            </div>
            <span class="e-panel-sub">Potongan real-time per struk lunas + modifier</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.3px;">
              <thead>
                <tr>
                  <th style="width:58px;">SKU</th>
                  <th style="width:228px;">Bahan Baku &amp; Batch FEFO</th>
                  <th class="num" style="width:84px;">Stok Awal</th>
                  <th class="num" style="width:86px;">Terpotong</th>
                  <th class="num" style="width:84px;">Sisa Stok</th>
                  <th class="num" style="width:74px;">Par Level</th>
                  <th style="width:92px;">Sisa %</th>
                  <th class="num" style="width:74px;">HPP/Unit</th>
                  <th class="num" style="width:96px;">Nilai Stok</th>
                  <th style="width:92px;">Status</th>
                </tr>
              </thead>
              <tbody>${ingRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL 14 BAHAN BAKU OUTLET KEMANG</td>
                  <td class="mono num" style="color:#be123c;">118 Struk</td>
                  <td colspan="4" class="mono" style="font-size:9.6px;color:#57534e;">Sinkron SQLite WAL -&gt; PostgreSQL HQ (0 selisih)</td>
                  <td class="mono num">${fmtIdr(TOTAL_STOCK_VAL)}</td>
                  <td>${badge('3 Par', 'bad')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Right Inspector: Recipe BOM Tree + Modifier Delta + Ojol Promo Margin -->
        <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
          <div class="e-panel" style="flex:1;min-height:0;">
            <div class="e-panel-head" style="background:#fef2eb;border-bottom-color:#f5c2a8;">
              <div class="e-panel-title" style="color:#5c1f0a;">
                ${pic('coffee', 13, '#7c2d12')}
                <span>Inspektor Resep BOM: MN-01</span>
              </div>
              <span class="e-badge e-badge-accent">Oat Milk + Less Ice</span>
            </div>
            <div class="e-panel-body-flush" style="justify-content:space-between;">
              <div>
                <div style="padding:7px 10px;border-bottom:1px solid #ece6de;background:#faf8f5;">
                  <div style="font-size:11.8px;font-weight:800;color:#1c1917;">Es Kopi Susu Aren (Large)</div>
                  <div style="font-size:9.6px;color:#57534e;margin-top:1px;">Modifier aktif: Ganti Susu Oatside (+Rp 8.000) · Less Ice (-40g) · Aren 75%</div>
                </div>
                <table class="e-table" style="font-size:9.9px;">
                  <thead>
                    <tr>
                      <th>Komponen BOM &amp; Aturan Modifier</th>
                      <th class="num" style="width:58px;">Takaran</th>
                      <th class="num" style="width:84px;">HPP Unit</th>
                      <th class="num" style="width:72px;">Biaya</th>
                    </tr>
                  </thead>
                  <tbody>${bomRows}</tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3">TOTAL HPP / COGS PER CUP (MN-01 + OAT)</td>
                      <td class="mono num" style="color:#7c2d12;">${fmtIdr(MN01_HPP)}</td>
                    </tr>
                  </tfoot>
                </table>

                <!-- Modifier Delta Rules -->
                <div style="padding:6px 10px 3px;font-size:9.4px;font-weight:700;color:#78716c;background:#faf8f5;border-top:1px solid #e7e2da;border-bottom:1px solid #e7e2da;">
                  MATRIKS DELTA POTONGAN BOM PER MODIFIER
                </div>
                <table class="e-table" style="font-size:9.5px;">
                  <thead>
                    <tr>
                      <th style="width:128px;">Modifier</th>
                      <th>Delta Stok BOM</th>
                      <th class="num" style="width:68px;">Delta HPP</th>
                      <th class="num" style="width:70px;">Add-On</th>
                    </tr>
                  </thead>
                  <tbody>${modDeltaRows}</tbody>
                </table>
              </div>

              <div style="padding:8px 10px;background:#faf8f5;border-top:1px solid var(--e-border);display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
                <div style="background:#ffffff;border:1px solid #dfd8cf;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:9px;color:#78716c;">Harga Dine-In</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#1c1917;">Rp 36.000</div>
                </div>
                <div style="background:#ffffff;border:1px solid #dfd8cf;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:9px;color:#78716c;">Gross Profit</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#047857;">Rp 24.580</div>
                </div>
                <div style="background:#ffffff;border:1px solid #dfd8cf;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:9px;color:#78716c;">Margin / HPP</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#7c2d12;">68,3%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- GoFood/GrabFood Promo vs BOM Margin Reconciliation -->
          <div class="e-panel" style="height:244px;flex-shrink:0;">
            <div class="e-panel-head" style="height:30px;">
              <div class="e-panel-title">
                ${pic('tag', 13, '#047857')}
                <span>Rekonsiliasi Promo GoFood / GrabFood vs BOM</span>
              </div>
              <span class="e-badge e-badge-ok">Anti-Bocor HPP</span>
            </div>
            <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="font-size:9.8px;color:#57534e;">Simulasi per cup <strong>MN-01 + Oat Milk</strong> pada channel aggregator agar promo tidak memakan modal biji &amp; susu:</div>
              <div style="display:grid;grid-template-columns:1fr auto;row-gap:3.5px;font-size:10.2px;background:#faf8f5;border:1px solid #e7e2da;border-radius:4px;padding:6px 9px;">
                <span>Harga Jual Aplikasi (Markup 19,4%)</span>
                <span class="mono" style="font-weight:700;">Rp 43.000</span>
                <span style="color:#be123c;">Potongan Komisi Platform (20,0%)</span>
                <span class="mono" style="color:#be123c;font-weight:700;">-Rp 8.600</span>
                <span style="color:#b45309;">Co-Funding Promo Merchant (Paket Hemat)</span>
                <span class="mono" style="color:#b45309;font-weight:700;">-Rp 3.000</span>
                <span style="color:#57534e;">Net Diterima Outlet (Sebelum HPP)</span>
                <span class="mono" style="font-weight:700;">Rp 31.400</span>
                <span style="color:#7c2d12;">Potongan Stok BOM Aktual (18g + 180ml Oat)</span>
                <span class="mono" style="color:#7c2d12;font-weight:700;">-${fmtIdr(MN01_HPP)}</span>
                <div style="grid-column:1/-1;border-top:1px solid #d6cec4;margin:2px 0;"></div>
                <span style="font-weight:800;color:#047857;">Laba Bersih Aktual Channel Ojol</span>
                <span class="mono" style="font-weight:800;color:#047857;">Rp 19.980 (63,6%)</span>
              </div>
              <div style="font-size:9.4px;color:#57534e;display:flex;align-items:center;justify-content:space-between;">
                <span>Aturan Floor Margin: &ge; 55,0%</span>
                <span class="mono" style="color:#047857;font-weight:700;">STATUS: AMAN DISETUJUI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return renderPosShell({
    activeTab: 'p3',
    pageTitle: meta.pages[2].title,
    topRightNote: `<span class="pos-chip pos-chip-warn">${ic('alert', 11, '#fcd34d')} 3 Bahan Di Bawah Par</span>`,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 4: SETTLEMENT SHIFT KASIR, PAJAK PB1 10% & REKONSILIASI QRIS / OJOL
// ============================================================================
function renderPage4() {
  const hourlyChart = svgStackedBarChart({
    width: 680,
    height: 198,
    categories: HOURLY_LABELS,
    series: [
      { label: 'POS Langsung (QRIS · Tunai · EDC · Kupon)', color: '#7c2d12', values: HOURLY_POS },
      { label: 'Aggregator Ojol (GoFood · GrabFood)', color: '#d97706', values: HOURLY_OJOL },
    ],
    yMax: 1100,
    yFormat: (v) => `Rp ${Math.round(v)}rb`,
  });

  const payRows = PAYMENT_CHANNELS.map(
    (c) => `<tr>
      <td style="font-weight:600;color:#1c1917;">${esc(c.method)}</td>
      <td class="mono num">${c.tx}</td>
      <td class="mono num">${fmtIdr(c.netto)}</td>
      <td class="mono num" style="color:#57534e;">${fmtIdr(c.pb1)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(c.bruto)}</td>
      <td class="mono num" style="color:${c.feeIdr > 0 ? '#be123c' : '#78716c'};">${c.feeIdr > 0 ? '-' + fmtIdr(c.feeIdr) : 'Rp 0'}</td>
      <td class="mono num" style="font-weight:700;color:#047857;">${fmtIdr(c.netSettle)}</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>`
  ).join('');

  const receiptRows = RECENT_RECEIPTS.map(
    (r, idx) => `<tr class="${idx === 0 ? 'is-selected' : ''}">
      <td class="mono" style="font-weight:700;color:#7c2d12;">${esc(r.no)}</td>
      <td class="mono" style="color:#57534e;">${esc(r.time)}</td>
      <td>${esc(r.channel)}</td>
      <td>${esc(r.pay)}</td>
      <td class="mono" style="font-size:9.5px;color:#57534e;">${esc(r.ref)}</td>
      <td class="mono num">${fmtIdr(r.netto)}</td>
      <td class="mono num" style="color:#57534e;">${fmtIdr(r.pb1)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(r.total)}</td>
      <td class="mono" style="font-size:9.3px;color:#57534e;">${esc(r.bom)}</td>
      <td>${badge(r.sync, r.tone)}</td>
    </tr>`
  ).join('');

  const denomRows = CASH_DENOMS.map(
    (d) => `<div style="display:grid;grid-template-columns:92px 54px 1fr;align-items:center;padding:3.5px 0;border-bottom:1px dashed #e7e2da;font-size:10.3px;">
      <span class="mono" style="font-weight:600;color:#1c1917;">${esc(d.label)}</span>
      <span class="mono" style="color:#7c2d12;font-weight:700;text-align:center;">&times; ${d.qty}</span>
      <span class="mono num" style="font-weight:700;color:#1c1917;">${fmtIdr(d.subtotal)}</span>
    </div>`
  ).join('');

  const bodyHtml = `
    <div class="pos-subbar">
      <div class="e-crumb">
        <span>Keuangan &amp; Tutup Shift</span>
        ${ic('chevronRight', 12, '#a8a29e')}
        <strong>Settlement Shift Pagi (#SHF-KMG-20261122-01) · Pajak PB1 10% &amp; Z-Report</strong>
      </div>
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="e-badge e-badge-ok">Laci Kas Klop (Selisih Rp 0)</span>
        <span class="e-btn">${pic('printer', 12, '#44403c')} Cetak X/Z-Report ESC/POS</span>
        <span class="e-btn e-btn-primary">${ic('lock', 12, '#ffffff')} Tutup Shift &amp; Setor</span>
      </div>
    </div>

    <div class="e-content">
      <!-- 5 KPI Strip -->
      <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Omzet Netto Shift</span>${pic('receipt', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_NETTO)}</span></div>
          <div class="e-kpi-foot"><span>Outlet Kemang · 07:00–15:00</span><span style="color:#047857;font-weight:600;">+12,4% DoD</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Pajak Restoran PB1 10%</span>${ic('shield', 13, '#0369a1')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_PB1)}</span></div>
          <div class="e-kpi-foot"><span>Siap setor e-PB1 Bapenda DKI</span><span class="mono">10,0%</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Total Bruto Diterima</span>${pic('wallet', 13, '#047857')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_BRUTO)}</span></div>
          <div class="e-kpi-foot"><span>Net Settlement Bank: ${fmtIdr(TOTAL_NET_SETTLE)}</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Struk Lunas &amp; Basket</span>${ic('activity', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_TX} struk</span></div>
          <div class="e-kpi-foot"><span>Rata keranjang: ${fmtIdr(Math.round(TOTAL_NETTO / TOTAL_TX))}</span><span class="mono">0 void</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Selisih Laci Kasir #1</span>${ic('checkCircle', 13, '#047857')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">Rp 0</span></div>
          <div class="e-kpi-foot"><span>Fisik ${fmtIdr(TOTAL_CASH_PHYSICAL)} (incl. modal)</span><span style="color:#047857;font-weight:600;">KLOP</span></div>
        </div>
      </div>

      <!-- Top Middle Row: Hourly Revenue Chart + Payment Channel Reconciliation -->
      <div style="display:grid;grid-template-columns:690px 1fr;gap:10px;height:252px;flex-shrink:0;">
        <div class="e-panel">
          <div class="e-panel-head" style="height:30px;">
            <div class="e-panel-title">
              ${ic('activity', 13, '#7c2d12')}
              <span>Distribusi Omzet Netto Per Jam — POS Langsung vs Ojol (Rp 4.820.000)</span>
            </div>
            <span class="e-badge e-badge-accent">Puncak 09:00 · Rp 930rb</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px 6px;">
            ${hourlyChart}
          </div>
        </div>

        <div class="e-panel">
          <div class="e-panel-head" style="height:30px;">
            <div class="e-panel-title">
              ${pic('qr', 13, '#7c2d12')}
              <span>Rekonsiliasi Kanal Pembayaran, MDR &amp; Komisi (6 Metode)</span>
            </div>
            <span class="e-panel-sub">Potongan MDR/Komisi: ${fmtIdr(TOTAL_FEE)}</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:168px;">Kanal Pembayaran</th>
                  <th class="num" style="width:36px;">Tx</th>
                  <th class="num" style="width:88px;">Netto</th>
                  <th class="num" style="width:74px;">PB1 10%</th>
                  <th class="num" style="width:88px;">Bruto</th>
                  <th class="num" style="width:82px;">MDR/Kom</th>
                  <th class="num" style="width:94px;">Net Terima</th>
                  <th style="width:84px;">Status</th>
                </tr>
              </thead>
              <tbody>${payRows}</tbody>
              <tfoot>
                <tr>
                  <td>TOTAL SHIFT PAGI</td>
                  <td class="mono num">${TOTAL_TX}</td>
                  <td class="mono num">${fmtIdr(TOTAL_NETTO)}</td>
                  <td class="mono num">${fmtIdr(TOTAL_PB1)}</td>
                  <td class="mono num">${fmtIdr(TOTAL_BRUTO)}</td>
                  <td class="mono num" style="color:#be123c;">-${fmtIdr(TOTAL_FEE)}</td>
                  <td class="mono num" style="color:#047857;">${fmtIdr(TOTAL_NET_SETTLE)}</td>
                  <td>${badge('Klop', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Bottom Row: 11-Row Receipt Audit Log + Cash Drawer Denomination Count -->
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:1080px 1fr;gap:10px;">
        <div class="e-panel">
          <div class="e-panel-head" style="height:30px;">
            <div class="e-panel-title">
              ${ic('fileText', 13, '#7c2d12')}
              <span>Audit Log Struk Terbaru, Referensi QRIS RRN &amp; Status Sinkronisasi BOM (11 Terakhir)</span>
            </div>
            <span class="e-panel-sub">SQLite WAL -&gt; PostgreSQL HQ: 100% terverifikasi</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:84px;">No. Struk</th>
                  <th style="width:48px;">Jam</th>
                  <th style="width:86px;">Channel</th>
                  <th style="width:96px;">Pembayaran</th>
                  <th style="width:136px;">Ref RRN / Order ID</th>
                  <th class="num" style="width:86px;">Netto</th>
                  <th class="num" style="width:74px;">PB1 10%</th>
                  <th class="num" style="width:88px;">Total</th>
                  <th style="width:144px;">Potongan BOM</th>
                  <th style="width:74px;">Sync</th>
                </tr>
              </thead>
              <tbody>${receiptRows}</tbody>
            </table>
            <div style="padding:7px 10px;background:#faf8f5;border-top:1px solid #dfd8cf;display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:9.5px;color:#57534e;">
              <span>Menampilkan 11 dari 118 struk shift · Total PB1 10% terbukukan: <strong style="color:#1c1917;">${fmtIdr(TOTAL_PB1)}</strong></span>
              <span>e-PB1 Bapenda Export Ready · 0 Struk Gagal Sync</span>
            </div>
          </div>
        </div>

        <div class="e-panel">
          <div class="e-panel-head" style="height:30px;background:#fef2eb;border-bottom-color:#f5c2a8;">
            <div class="e-panel-title" style="color:#5c1f0a;">
              ${pic('wallet', 13, '#7c2d12')}
              <span>Hitung Fisik Laci Kasir &amp; Z-Report</span>
            </div>
            <span class="e-badge e-badge-ok">KLOP</span>
          </div>
          <div class="e-panel-body" style="padding:8px 11px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>
              ${denomRows}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f5f2ed;border:1px solid #dfd8cf;border-radius:4px;padding:6px 8px;font-size:9.6px;">
              <div><span style="color:#78716c;">Void / Batal:</span> <strong class="mono" style="color:#047857;">0 struk</strong></div>
              <div><span style="color:#78716c;">Refund:</span> <strong class="mono" style="color:#047857;">Rp 0</strong></div>
              <div><span style="color:#78716c;">Kupon HR:</span> <strong class="mono" style="color:#1c1917;">5 kupon</strong></div>
              <div><span style="color:#78716c;">No-Sale Open:</span> <strong class="mono" style="color:#047857;">0 kali</strong></div>
            </div>
            <div style="background:#faf8f5;border:1px solid #dfd8cf;border-radius:4px;padding:7px 9px;display:grid;grid-template-columns:1fr auto;row-gap:3px;font-size:10.2px;">
              <span style="color:#57534e;">Modal Awal Laci Shift</span>
              <span class="mono" style="font-weight:600;">${fmtIdr(SHIFT_MODAL_AWAL)}</span>
              <span style="color:#57534e;">Penjualan Tunai Bruto (14 tx)</span>
              <span class="mono" style="font-weight:600;">${fmtIdr(PAYMENT_CHANNELS[3].bruto)}</span>
              <span style="font-weight:800;color:#1c1917;">Total Fisik Laci Terhitung</span>
              <span class="mono" style="font-weight:800;color:#047857;">${fmtIdr(TOTAL_CASH_PHYSICAL)}</span>
            </div>
            <div class="mono" style="font-size:9px;color:#57534e;background:#f5f2ed;border:1px solid #dfd8cf;border-radius:3px;padding:5px 8px;">
              <div>Z-REPORT SHA-256: <strong style="color:#1c1917;">8c4e1b9a...f207e4</strong></div>
              <div>Verifikasi PIN Supervisor: <strong>Budi Santoso (Area Mgr)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return renderPosShell({
    activeTab: 'p4',
    pageTitle: meta.pages[3].title,
    topRightNote: `<span class="pos-chip pos-chip-ok">${ic('checkCircle', 11, '#6ee7b7')} Z-Report Siap Tutup</span>`,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 5: ARMADA MULTI-OUTLET & SQLITE OFFLINE-FIRST SYNC TELEMETRY
// ============================================================================
function renderPage5() {
  const outletRows = OUTLETS.map(
    (o) => `<tr class="${o.selected ? 'is-selected' : o.warn ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#5c1f0a;">${esc(o.code)}</td>
      <td>
        <div style="font-weight:600;color:#1c1917;" class="trunc">${esc(o.name)}</div>
        <div style="font-size:9.2px;color:#78716c;">Area ${esc(o.area)}</div>
      </td>
      <td>${badge(o.net, o.netTone)}</td>
      <td class="mono num" style="font-weight:700;color:${o.walQ > 0 ? '#b45309' : '#047857'};">${o.walQ} tx</td>
      <td class="mono num">${esc(o.kdsAvg)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(o.omzet)}</td>
      <td class="mono num" style="color:#57534e;">${fmtIdr(o.pb1)}</td>
      <td class="mono num" style="color:#57534e;">${esc(o.bomVar)}</td>
      <td><span class="e-badge ${o.hw.startsWith('2/3') ? 'e-badge-warn' : 'e-badge-ok'}" style="font-size:9.2px;">${esc(o.hw)}</span></td>
      <td class="mono" style="font-size:9.5px;color:${o.warn ? '#b45309' : '#57534e'};">${esc(o.syncAgo)}</td>
    </tr>`
  ).join('');

  const syncWaterfall = svgSpanWaterfall({
    width: 486,
    totalMs: 110,
    spans: [
      { label: '1. Commit SQLite WAL Lokal', start: 0, dur: 6, color: '#047857' },
      { label: '2. Cetak ESC/POS 80mm USB', start: 6, dur: 18, color: '#7c2d12' },
      { label: '3. Broadcast KDS Barista LAN', start: 6, dur: 9, color: '#b45309' },
      { label: '4. Worker Delta Push (.NET 9)', start: 18, dur: 48, color: '#0369a1' },
      { label: '5. PostgreSQL HQ + BOM Ledger', start: 66, dur: 24, color: '#5c1f0a' },
      { label: '6. ACK & Bersihkan Antrean', start: 90, dur: 12, color: '#047857' },
    ],
  });

  const hwRows = [
    { dev: 'Printer Struk Kasir', model: 'Epson TM-T82X · USB', metric: 'Kertas 78% · Cutter OK', status: 'Siap', tone: 'ok' },
    { dev: 'Printer Stiker Cup', model: 'Xprinter XP-365B · LAN', metric: 'Label 340 pcs · Thermal OK', status: 'Siap', tone: 'ok' },
    { dev: 'Layar QRIS #2', model: 'USB-C 10.1" IPS Touch', metric: 'Display 60Hz · SNAP OK', status: 'Aktif', tone: 'ok' },
    { dev: 'KDS Barista & Kit', model: '2x Tablet 15" · LAN', metric: 'WebSocket 9 ms · 6 tiket', status: 'Aktif', tone: 'ok' },
    { dev: 'SQLite Local Edge', model: 'kopipos_kmg1.db (WAL)', metric: '42,8 MB · 0 antrean', status: 'Sinkron', tone: 'ok' },
  ]
    .map(
      (h) => `<tr>
        <td style="font-weight:600;color:#1c1917;">${esc(h.dev)}</td>
        <td class="mono" style="font-size:9.3px;color:#57534e;">${esc(h.model)}</td>
        <td class="mono" style="font-size:9.3px;color:#44403c;">${esc(h.metric)}</td>
        <td>${badge(h.status, h.tone)}</td>
      </tr>`
    )
    .join('');

  const bodyHtml = `
    <div class="pos-subbar">
      <div class="e-crumb">
        <span>Operasional HQ &amp; Edge Sync</span>
        ${ic('chevronRight', 12, '#a8a29e')}
        <strong>Monitoring 12 Outlet JABODETABEK, SQLite Offline-First &amp; Periferal ESC/POS</strong>
      </div>
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="e-badge e-badge-warn">1 Outlet Mode Offline-Safe (Kota Kasablanka · 24 tx aman)</span>
        <span class="e-btn">${ic('refresh', 12, '#44403c')} Paksa Re-Sync Semua</span>
      </div>
    </div>

    <div class="e-content">
      <!-- 5 KPI Strip -->
      <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Total Omzet 12 Outlet</span>${pic('store', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(FLEET_OMZET)}</span></div>
          <div class="e-kpi-foot"><span>PB1 10%: ${fmtIdr(FLEET_PB1)}</span><span style="color:#047857;font-weight:600;">Shift Pagi</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Status Koneksi Armada</span>${pic('wifi', 13, '#047857')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">11 Online · 1 Off</span></div>
          <div class="e-kpi-foot"><span>100% kasir tetap beroperasi</span><span style="color:#047857;font-weight:600;">0 Downtime</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Antrean SQLite WAL Global</span>${ic('database', 13, '#b45309')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">${FLEET_WALQ} tx</span></div>
          <div class="e-kpi-foot"><span>Tersimpan lokal di OUT-04 Kokas</span><span class="mono">SHA-256 OK</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Latensi Sync Edge &rarr; HQ</span>${ic('zap', 13, '#0369a1')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">48 ms</span></div>
          <div class="e-kpi-foot"><span>.NET 9 Cloud API · PostgreSQL</span><span style="color:#047857;font-weight:600;">p95 92 ms</span></div>
        </div>
        <div class="e-kpi">
          <div class="e-kpi-top"><span>Periferal ESC/POS &amp; KDS</span>${pic('printer', 13, '#7c2d12')}</div>
          <div class="e-kpi-mid"><span class="e-kpi-val">35 / 36 Siap</span></div>
          <div class="e-kpi-foot"><span>1 kertas menipis (Kelapa Gading)</span><span class="mono">97,2%</span></div>
        </div>
      </div>

      <!-- Main Split: 12-Outlet Fleet Table + Right Sync Waterfall & Offline Incident -->
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:972px 1fr;gap:10px;">
        <div class="e-panel">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${pic('store', 13, '#7c2d12')}
              <span>Armada Outlet PT Kopi Nusantara Sejahtera (12 Lokasi Aktif)</span>
            </div>
            <span class="e-panel-sub">Klik outlet untuk inspeksi perangkat &amp; antrean WAL</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table" style="font-size:10.3px;">
              <thead>
                <tr>
                  <th style="width:58px;">Kode</th>
                  <th style="width:210px;">Nama Outlet &amp; Area</th>
                  <th style="width:106px;">Jaringan</th>
                  <th class="num" style="width:64px;">WAL Q</th>
                  <th class="num" style="width:64px;">Avg KDS</th>
                  <th class="num" style="width:102px;">Omzet Shift</th>
                  <th class="num" style="width:86px;">PB1 10%</th>
                  <th class="num" style="width:66px;">Var BOM</th>
                  <th style="width:80px;">Perangkat</th>
                  <th style="width:82px;">Sync Akhir</th>
                </tr>
              </thead>
              <tbody>${outletRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL ARMADA 12 OUTLET JABODETABEK</td>
                  <td class="mono num" style="color:#b45309;">${FLEET_WALQ} tx</td>
                  <td class="mono num">3m 39d</td>
                  <td class="mono num">${fmtIdr(FLEET_OMZET)}</td>
                  <td class="mono num">${fmtIdr(FLEET_PB1)}</td>
                  <td class="mono num">-0,39%</td>
                  <td>${badge('35/36 OK', 'ok')}</td>
                  <td class="mono">Live</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:8px 11px;background:#faf8f5;border-top:1px solid #dfd8cf;display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:9.4px;color:#57534e;">
              <span>Kebijakan Edge Sync: Batch 5 dtk · Retensi SQLite 30 hari · Enkripsi AES-256 + Idempotency Key</span>
              <span style="color:#047857;font-weight:700;">PostgreSQL HQ Primary: Sehat (0 Konflik BOM)</span>
            </div>
          </div>
        </div>

        <!-- Right: Offline-First Incident Card + Sync Waterfall + Local Hardware -->
        <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
          <!-- Active Offline-Safe Resilience Box -->
          <div class="e-panel" style="height:178px;flex-shrink:0;border-color:#d97706;background:#fffbeb;">
            <div class="e-panel-head" style="height:30px;background:#fef3c7;border-bottom-color:#fcd34d;">
              <div class="e-panel-title" style="color:#92400e;">
                ${pic('wifiOff', 13, '#b45309')}
                <span>Ketahanan Offline-First: OUT-04 Kota Kasablanka</span>
              </div>
              <span class="e-badge e-badge-warn">ISP MAL PUTUS 18M</span>
            </div>
            <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;font-size:10.2px;color:#451a03;">
              <div>Koneksi fiber ISP Mall Kota Kasablanka terputus pukul <strong>09:56 WIB</strong>. Terminal kasir otomatis berpindah ke <strong>SQLite Local WAL Mode</strong> tanpa menghentikan transaksi maupun cetak struk ESC/POS.</div>
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
                <div style="background:#ffffff;border:1px solid #fde68a;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:8.8px;color:#92400e;">Antrean WAL Aman</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#b45309;">24 Struk</div>
                </div>
                <div style="background:#ffffff;border:1px solid #fde68a;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:8.8px;color:#92400e;">BOM Terpotong Lokal</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#047857;">100% Utuh</div>
                </div>
                <div style="background:#ffffff;border:1px solid #fde68a;border-radius:3px;padding:5px 7px;">
                  <div style="font-size:8.8px;color:#92400e;">Auto-Replay Queue</div>
                  <div class="mono" style="font-size:12.5px;font-weight:800;color:#0369a1;">Idempotent</div>
                </div>
              </div>
              <div class="mono" style="font-size:9.2px;color:#78350f;">Fallback aktif: Tunai + EDC 4G + QRIS Statis · KDS tetap jalan via Wi-Fi LAN lokal.</div>
            </div>
          </div>

          <!-- Edge-to-Cloud Sync Waterfall -->
          <div class="e-panel" style="height:224px;flex-shrink:0;">
            <div class="e-panel-head" style="height:30px;">
              <div class="e-panel-title">
                ${ic('gitBranch', 13, '#7c2d12')}
                <span>Pipeline Transaksi Offline-First &rarr; Cloud HQ (102 ms)</span>
              </div>
              <span class="e-badge e-badge-ok">Commit Lokal 6 ms</span>
            </div>
            <div class="e-panel-body" style="padding:8px 10px;">
              ${syncWaterfall}
            </div>
          </div>

          <!-- Periferal Hardware Matrix (Outlet Kemang) -->
          <div class="e-panel" style="flex:1;min-height:0;">
            <div class="e-panel-head" style="height:30px;">
              <div class="e-panel-title">
                ${pic('printer', 13, '#7c2d12')}
                <span>Kesehatan Periferal Edge — OUT-01 Kemang</span>
              </div>
              <span class="e-panel-sub">Agent v4.8.2</span>
            </div>
            <div class="e-panel-body-flush">
              <table class="e-table" style="font-size:9.8px;">
                <thead>
                  <tr>
                    <th style="width:112px;">Perangkat</th>
                    <th style="width:148px;">Model / Antarmuka</th>
                    <th>Telemetri</th>
                    <th style="width:74px;">Status</th>
                  </tr>
                </thead>
                <tbody>${hwRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return renderPosShell({
    activeTab: 'p5',
    pageTitle: meta.pages[4].title,
    topRightNote: `<span class="pos-chip pos-chip-warn">${pic('wifiOff', 11, '#fcd34d')} 1 Outlet Offline-Safe</span>`,
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
  ];
}
