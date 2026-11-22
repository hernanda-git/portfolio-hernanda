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
  id: 'ID-023',
  name: 'GrosirBahan B2B',
  reference: 'Shopify Plus B2B + Tokopedia Seller Enterprise',
  persona: 'Ir. Hendra Kusuma · Kepala Pengadaan · PT Wijaya Graha Konstruksi',
  pages: [
    { slug: 'p1', title: 'Katalog Principal & Harga Berjenjang' },
    { slug: 'p2', title: 'Antrean RFQ Instan & Negosiasi Principal' },
    { slug: 'p3', title: 'Kalkulator Tonase Truk & Rencana Muat' },
    { slug: 'p4', title: 'Manajemen Kredit TOP, Giro/VA & e-Faktur CoreTax' },
    { slug: 'p5', title: 'Surat Jalan Digital & Bukti Terima Mandor' },
  ],
};

// ============================================================================
// CUSTOM DOMAIN VECTOR ICONS & MATERIAL THUMBNAILS (ZERO EMOJI)
// ============================================================================
function domainIcon(name, size = 13, color = 'currentColor') {
  const paths = {
    truck: '<rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/>',
    creditCard: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    scale: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M3 7h18"/><path d="M5 7l-2 6h4l-2-6z"/><path d="M19 7l-2 6h4l-2-6z"/><line x1="8" y1="21" x2="16" y2="21"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9.01" y2="6"/><line x1="15" y1="6" x2="15.01" y2="6"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/><line x1="9" y1="14" x2="9.01" y2="14"/><line x1="15" y1="14" x2="15.01" y2="14"/><path d="M9 22v-4h6v4"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  };
  if (paths[name]) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${paths[name]}</svg>`;
  }
  return ic(name, size, color);
}

function skuThumbSvg(kind, size = 44) {
  const specs = {
    rebar: `
      <rect x="1" y="1" width="42" height="42" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
      <g stroke="#78350f" stroke-width="1.5" fill="none">
        <line x1="8" y1="34" x2="34" y2="8" stroke-width="3.2"/>
        <line x1="14" y1="36" x2="36" y2="14" stroke-width="2.6" stroke="#b45309"/>
        <line x1="7" y1="26" x2="26" y2="7" stroke-width="2.2" stroke="#92400e"/>
        <line x1="12" y1="26" x2="16" y2="30" stroke="#fffbeb" stroke-width="1.1"/>
        <line x1="18" y1="20" x2="22" y2="24" stroke="#fffbeb" stroke-width="1.1"/>
        <line x1="24" y1="14" x2="28" y2="18" stroke="#fffbeb" stroke-width="1.1"/>
      </g>
      <rect x="4" y="32" width="16" height="8" rx="1.5" fill="#78350f"/>
      <text x="12" y="38.2" text-anchor="middle" font-size="6.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fef3c7">D13</text>
    `,
    cement: `
      <rect x="1" y="1" width="42" height="42" rx="4" fill="#f5f2ed" stroke="#d6cfc4" stroke-width="1"/>
      <rect x="9" y="8" width="26" height="28" rx="2.5" fill="#e7e0d5" stroke="#57534e" stroke-width="1.4"/>
      <rect x="12" y="13" width="20" height="8" rx="1" fill="#b45309"/>
      <text x="22" y="19" text-anchor="middle" font-size="5.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">PCC 50</text>
      <line x1="12" y1="26" x2="32" y2="26" stroke="#78716c" stroke-width="1.2"/>
      <line x1="14" y1="30" x2="30" y2="30" stroke="#a8a29e" stroke-width="1.2"/>
      <path d="M9 11 L12 8 M35 11 L32 8 M9 33 L12 36 M35 33 L32 36" stroke="#57534e" stroke-width="1"/>
    `,
    grc: `
      <rect x="1" y="1" width="42" height="42" rx="4" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
      <polygon points="8,27 22,19 36,27 22,35" fill="#e2e8f0" stroke="#475569" stroke-width="1.2"/>
      <polygon points="8,22 22,14 36,22 22,30" fill="#f1f5f9" stroke="#334155" stroke-width="1.2"/>
      <polygon points="8,17 22,9 36,17 22,25" fill="#ffffff" stroke="#0369a1" stroke-width="1.4"/>
      <text x="22" y="19.5" text-anchor="middle" font-size="6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">9MM</text>
    `,
    steelc: `
      <rect x="1" y="1" width="42" height="42" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
      <path d="M12 12 H32 V17 H28 V15 H16 V29 H28 V27 H32 V32 H12 Z" fill="#047857" stroke="#064e3b" stroke-width="1.2"/>
      <line x1="17" y1="22" x2="31" y2="22" stroke="#047857" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="24" y="24.5" text-anchor="middle" font-size="5.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#065f46">C75</text>
    `,
    wiremesh: `
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#f5f2ed" stroke="#d6cfc4" stroke-width="1"/>
      <path d="M5 8 H19 M5 12 H19 M5 16 H19 M8 5 V19 M12 5 V19 M16 5 V19" stroke="#57534e" stroke-width="1.1"/>
    `,
    brick: `
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="4" y="7" width="16" height="10" rx="1" fill="#e2e8f0" stroke="#475569" stroke-width="1.1"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="#64748b" stroke-width="0.9"/>
      <line x1="12" y1="7" x2="12" y2="12" stroke="#64748b" stroke-width="0.9"/>
    `,
    pipe: `
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="#0369a1" stroke-width="2.2"/>
      <circle cx="12" cy="12" r="2.2" fill="#e0f2fe"/>
    `,
    roof: `
      <rect x="1" y="1" width="22" height="22" rx="3" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
      <polyline points="4 16 7 9 10 16 13 9 16 16 19 9" fill="none" stroke="#b45309" stroke-width="1.5"/>
    `,
  };
  const vb = size >= 32 ? '0 0 44 44' : '0 0 24 24';
  const body = specs[kind] || specs.wiremesh;
  return `<svg viewBox="${vb}" width="${size}" height="${size}" style="display:block;flex-shrink:0;">${body}</svg>`;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const PROJECT = {
  code: 'PRJ-KRW-02',
  name: 'Proyek Gudang Karawang Timur',
  company: 'PT Wijaya Graha Konstruksi',
  npwp: '0914.8273.1041.0000',
  creditLimit: 850000000,
  creditUsed: 340000000,
  creditRemaining: 510000000,
  topDays: 30,
  truckName: 'Fuso Tronton 6x4',
  truckCapTon: 20.0,
  truckTareTon: 7.6,
  jbiLimitTon: 27.6,
  lockHours: 24,
  freightGross: 2600000,
  cementUnloadCredit: 400000,
  freightNet: 2200000,
};

// Primary 4 Load Plan items matching Project Specification verbatim
const LOAD_PLAN_ITEMS = [
  {
    code: 'MAT-01',
    kind: 'rebar',
    title: 'Besi Beton Ulir 13mm SNI (12m)',
    shortTitle: 'Besi Ulir 13mm SNI',
    principal: 'PT Krakatau Steel (Cilegon)',
    depot: 'Pabrik Cilegon',
    subtitle: 'Pabrik Cilegon · Min 200 batang',
    unit: 'btg',
    minQty: 200,
    qty: 560,
    unitKg: 12.5,
    tier1Price: 126000,
    tier2Price: 121500,
    lockedPrice: 118500,
    retailPrice: 134500,
    status: 'Tersedia',
    tone: 'ok',
    meta: 'SNI 2052',
    bay: 'Bay A · Rak Baja 12m',
    bayColor: '#b45309',
    unloadOrder: 4,
    freightAlloc: 836957,
  },
  {
    code: 'MAT-02',
    kind: 'cement',
    title: 'Semen Portland 50kg (Sak)',
    shortTitle: 'Semen Portland 50kg',
    principal: 'PT Indocement Tiga Roda',
    depot: 'Depot Narogong',
    subtitle: '1 DO = 160 sak · Gratis bongkar Jabodetabek',
    unit: 'sak',
    minQty: 160,
    qty: 160,
    unitKg: 50.0,
    tier1Price: 64500,
    tier2Price: 62800,
    lockedPrice: 61200,
    retailPrice: 69500,
    status: '1 DO Siap',
    tone: 'ok',
    meta: '8,0 ton',
    bay: 'Bay B · Palet Tengah',
    bayColor: '#57534e',
    unloadOrder: 3,
    freightAlloc: 956522,
  },
  {
    code: 'MAT-03',
    kind: 'grc',
    title: 'Papan Semen GRC Board 9mm',
    shortTitle: 'GRC Board 9mm',
    principal: 'PT Bangunperkasa Adhitamasentra',
    depot: 'Pabrik Karawang',
    subtitle: '1220 x 2440 mm · Kemas palet',
    unit: 'lbr',
    minQty: 40,
    qty: 60,
    unitKg: 40.0,
    tier1Price: 151000,
    tier2Price: 146000,
    lockedPrice: 142000,
    retailPrice: 162000,
    status: 'Tersedia',
    tone: 'ok',
    meta: 'Principal',
    bay: 'Bay C · Palet Datar',
    bayColor: '#0369a1',
    unloadOrder: 2,
    freightAlloc: 286956,
  },
  {
    code: 'MAT-04',
    kind: 'steelc',
    title: 'Baja Ringan Kanal C75 0,75mm',
    shortTitle: 'Kanal C75 0,75mm',
    principal: 'PT NS BlueScope Lysaght',
    depot: 'Depot Bekasi',
    subtitle: 'Lead time 2 hari dari depot Bekasi',
    unit: 'btg',
    minQty: 100,
    qty: 200,
    unitKg: 5.0,
    tier1Price: 101000,
    tier2Price: 97000,
    lockedPrice: 94000,
    retailPrice: 108000,
    status: 'Lead 2h',
    tone: 'warn',
    meta: 'Zincalume',
    bay: 'Bay D · Ikat Atas',
    bayColor: '#047857',
    unloadOrder: 1,
    freightAlloc: 119565,
  },
];

// Full 14-SKU Multi-Depot Principal Catalog (Page 1 Matrix)
const CATALOG_SKUS = [
  { code: 'MAT-01', kind: 'rebar', name: 'Besi Beton Ulir 13mm SNI (12m)', principal: 'Krakatau Steel', depot: 'Cilegon', unit: 'btg', kg: 12.5, price: 118500, disc: '-11,9%', stkCilegon: 4820, stkBekasi: 1140, stkKarawang: 620, status: 'Tersedia', tone: 'ok', active: true },
  { code: 'MAT-02', kind: 'cement', name: 'Semen Portland 50kg (1 DO = 160 sak)', principal: 'Indocement', depot: 'Narogong', unit: 'sak', kg: 50.0, price: 61200, disc: '-11,9%', stkCilegon: 0, stkBekasi: 3200, stkKarawang: 2560, status: '1 DO Siap', tone: 'ok', active: true },
  { code: 'MAT-03', kind: 'grc', name: 'Papan Semen GRC Board 9mm (1220x2440)', principal: 'GRC Board ID', depot: 'Karawang', unit: 'lbr', kg: 40.0, price: 142000, disc: '-12,3%', stkCilegon: 0, stkBekasi: 410, stkKarawang: 1280, status: 'Tersedia', tone: 'ok', active: true },
  { code: 'MAT-04', kind: 'steelc', name: 'Baja Ringan Kanal C75 0,75mm (6m)', principal: 'BlueScope', depot: 'Bekasi', unit: 'btg', kg: 5.0, price: 94000, disc: '-13,0%', stkCilegon: 340, stkBekasi: 980, stkKarawang: 120, status: 'Lead 2h', tone: 'warn', active: true },
  { code: 'MAT-05', kind: 'wiremesh', name: 'Wiremesh M8 SNI Lembar (5,4 x 2,1m)', principal: 'Gunung Raja Paksi', depot: 'Cikarang', unit: 'lbr', kg: 42.8, price: 486000, disc: '-10,4%', stkCilegon: 210, stkBekasi: 540, stkKarawang: 390, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-06', kind: 'rebar', name: 'Besi Beton Polos 10mm SNI (12m)', principal: 'Master Steel', depot: 'Bekasi', unit: 'btg', kg: 7.4, price: 71800, disc: '-11,2%', stkCilegon: 1850, stkBekasi: 2940, stkKarawang: 840, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-07', kind: 'brick', name: 'Bata Ringan AAC 10cm (1 DO = 12,6 m3)', principal: 'Citicon', depot: 'Karawang', unit: 'm3', kg: 600, price: 645000, disc: '-12,8%', stkCilegon: 0, stkBekasi: 180, stkKarawang: 420, status: '1 DO Siap', tone: 'ok' },
  { code: 'MAT-08', kind: 'pipe', name: 'Pipa PVC AW 4 Inch (4m) SNI 06-0084', principal: 'Rucika', depot: 'Cikarang', unit: 'btg', kg: 7.2, price: 168500, disc: '-9,6%', stkCilegon: 420, stkBekasi: 1320, stkKarawang: 710, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-09', kind: 'roof', name: 'Atap Spandek Zincalume 0,40mm (6m)', principal: 'BlueScope', depot: 'Bekasi', unit: 'lbr', kg: 18.6, price: 312000, disc: '-11,5%', stkCilegon: 0, stkBekasi: 615, stkKarawang: 95, status: 'Stok Tipis', tone: 'warn' },
  { code: 'MAT-10', kind: 'cement', name: 'Mortar Perekat Bata Ringan 40kg', principal: 'MU-Weber', depot: 'Karawang', unit: 'sak', kg: 40.0, price: 96500, disc: '-10,8%', stkCilegon: 0, stkBekasi: 1450, stkKarawang: 1820, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-11', kind: 'rebar', name: 'Besi Beton Ulir 16mm SNI (12m)', principal: 'Krakatau Steel', depot: 'Cilegon', unit: 'btg', kg: 19.0, price: 181000, disc: '-11,6%', stkCilegon: 3150, stkBekasi: 780, stkKarawang: 410, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-12', kind: 'grc', name: 'Multiplek Phenolic Film 18mm Bekisting', principal: 'Korindo Plywood', depot: 'Cikarang', unit: 'lbr', kg: 32.5, price: 288000, disc: '-10,2%', stkCilegon: 0, stkBekasi: 860, stkKarawang: 540, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-13', kind: 'brick', name: 'Batu Split Cor 1-2cm Cuci (Per m3)', principal: 'Quarry Purwakarta', depot: 'Karawang', unit: 'm3', kg: 1450, price: 315000, disc: '-9,4%', stkCilegon: 0, stkBekasi: 0, stkKarawang: 920, status: 'Tersedia', tone: 'ok' },
  { code: 'MAT-14', kind: 'wiremesh', name: 'Besi H-Beam 200x200x8x12 (12m)', principal: 'Gunung Raja Paksi', depot: 'Cikarang', unit: 'btg', kg: 599, price: 7850000, disc: '-8,9%', stkCilegon: 45, stkBekasi: 112, stkKarawang: 68, status: 'Lead 2h', tone: 'warn' },
];

// 16-Row Operational RFQ Queue (Page 2)
const RFQS = [
  { id: 'RFQ-2026-1142', site: 'Gudang Karawang Timur', principal: 'Krakatau + 3 Principal', summary: 'D13 560btg, Semen 1DO, GRC 60, C75 200', ton: 18.4, value: 105672000, discPct: 12.1, lock: '23j 42m', status: 'Terkunci', tone: 'ok', selected: true },
  { id: 'RFQ-2026-1141', site: 'Gudang Karawang Timur', principal: 'Gunung Raja Paksi', summary: 'Wiremesh M8 220 lbr + WF 250 18 btg', ton: 16.8, value: 148920000, discPct: 10.8, lock: '18j 15m', status: 'Negosiasi', tone: 'warn' },
  { id: 'RFQ-2026-1139', site: 'Akses Tol Cikarang Barat', principal: 'Indocement Tiga Roda', summary: 'Semen Portland 50kg (2 DO = 320 sak)', ton: 16.0, value: 19584000, discPct: 11.9, lock: '14j 08m', status: 'Disetujui PO', tone: 'ok' },
  { id: 'RFQ-2026-1138', site: 'Gudang Karawang Timur', principal: 'Master Steel Mfg', summary: 'Besi Polos 10mm 900 btg + Begel 8mm', ton: 11.4, value: 84620000, discPct: 11.4, lock: '09j 50m', status: 'Negosiasi', tone: 'warn' },
  { id: 'RFQ-2026-1136', site: 'Pabrik Komponen Jababeka', principal: 'Citicon Nusantara', summary: 'Bata Ringan AAC 10cm (3 DO = 37,8 m3)', ton: 22.7, value: 24381000, discPct: 12.8, lock: '21j 30m', status: 'Terkunci', tone: 'ok' },
  { id: 'RFQ-2026-1134', site: 'Ruko Komersial Deltamas', principal: 'BlueScope Lysaght', summary: 'Spandek 0,40mm 140 lbr + Kanal C75 300', ton: 4.1, value: 71880000, discPct: 12.2, lock: '03j 12m', status: 'Kritis Lock', tone: 'bad', warn: true },
  { id: 'RFQ-2026-1131', site: 'Gudang Karawang Timur', principal: 'GRC Board Indonesia', summary: 'GRC Board 9mm 240 lbr + Sekrup 40 box', ton: 9.8, value: 36480000, discPct: 12.4, lock: '19j 05m', status: 'Terkunci', tone: 'ok' },
  { id: 'RFQ-2026-1129', site: 'Drainase Kawasan KIIC', principal: 'Wahana Duta (Rucika)', summary: 'Pipa PVC AW 4" 320 btg + Fitting', ton: 2.6, value: 62140000, discPct: 9.8, lock: '11j 40m', status: 'Disetujui PO', tone: 'ok' },
  { id: 'RFQ-2026-1127', site: 'Akses Tol Cikarang Barat', principal: 'Krakatau Steel', summary: 'Besi Ulir 16mm SNI 420 btg (Cilegon)', ton: 7.9, value: 76020000, discPct: 11.6, lock: '06j 22m', status: 'Negosiasi', tone: 'warn' },
  { id: 'RFQ-2026-1125', site: 'Pabrik Komponen Jababeka', principal: 'MU-Weber Indonesia', summary: 'Mortar Perekat 40kg 360 sak + Acian', ton: 14.4, value: 34740000, discPct: 10.8, lock: '16j 55m', status: 'Terkunci', tone: 'ok' },
  { id: 'RFQ-2026-1122', site: 'Gudang Karawang Timur', principal: 'Semen Gresik (SIG)', summary: 'Semen PCC 50kg (2 DO = 320 sak)', ton: 16.0, value: 19456000, discPct: 12.0, lock: 'Tuntas', status: 'Kirim DO', tone: 'info' },
  { id: 'RFQ-2026-1119', site: 'Ruko Komersial Deltamas', principal: 'Mulia Industrindo', summary: 'Granit Lantai 60x60 480 dus (Palet)', ton: 13.4, value: 68160000, discPct: 10.5, lock: 'Tuntas', status: 'Kirim DO', tone: 'info' },
  { id: 'RFQ-2026-1116', site: 'Drainase Kawasan KIIC', principal: 'Wika Beton Precast', summary: 'U-Ditch 80x80x120 24 unit + Cover', ton: 19.2, value: 58800000, discPct: 9.4, lock: 'Tuntas', status: 'Disetujui PO', tone: 'ok' },
  { id: 'RFQ-2026-1114', site: 'Gudang Karawang Timur', principal: 'Gunung Raja Paksi', summary: 'Plat Bordes 4,5mm 55 lbr + CNP 150', ton: 8.6, value: 92400000, discPct: 11.1, lock: '22j 10m', status: 'Menunggu CFO', tone: 'warn' },
  { id: 'RFQ-2026-1110', site: 'Pabrik Komponen Jababeka', principal: 'Krakatau Steel', summary: 'Besi Ulir 19mm SNI 300 btg (Cilegon)', ton: 8.0, value: 78900000, discPct: 11.7, lock: 'Tuntas', status: 'Selesai', tone: 'neutral' },
  { id: 'RFQ-2026-1107', site: 'Akses Tol Cikarang Barat', principal: 'Indocement Tiga Roda', summary: 'Semen Portland 50kg (3 DO = 480 sak)', ton: 24.0, value: 29376000, discPct: 12.1, lock: 'Tuntas', status: 'Selesai', tone: 'neutral' },
];

// Axle Load Distribution (Page 3)
const AXLES = [
  { id: 'Sumbu 1 (Depan)', loadTon: 4.60, maxTon: 6.00, zone: 'Kabin + Ujung Bay A' },
  { id: 'Sumbu 2 (Belakang A)', loadTon: 6.95, maxTon: 7.50, zone: 'Bay A + Bay B (Semen 1 DO)' },
  { id: 'Sumbu 3 (Belakang B)', loadTon: 6.85, maxTon: 7.50, zone: 'Bay C (GRC) + Bay D (C75)' },
];

// Invoice & CoreTax PPN 11% Ledger (Page 4)
// First 5 Open Invoices sum to EXACTLY Rp 340.000.000 (= creditUsed -> remaining Rp 510.000.000)
const INVOICES = [
  { no: 'INV-2026-1088', sj: 'SJ-KRW-2026-0842', principal: 'PT Krakatau Steel', issued: '27 Okt 26', due: '26 Nov 26', dueDays: 4, method: 'Giro BG-882914', dpp: 64864865, ppn: 7135135, total: 72000000, nsfp: '010.004-26.48192014', state: 'open', status: 'Tempo 4h', tone: 'bad', warn: true },
  { no: 'INV-2026-1094', sj: 'SJ-KRW-2026-0851', principal: 'PT Indocement TR', issued: '29 Okt 26', due: '28 Nov 26', dueDays: 6, method: 'SNAP VA Mandiri', dpp: 41846847, ppn: 4603153, total: 46450000, nsfp: '010.004-26.48192089', state: 'open', status: 'Tempo 6h', tone: 'warn', warn: true },
  { no: 'INV-2026-1109', sj: 'SJ-KRW-2026-0864', principal: 'PT Gunung Raja Paksi', issued: '07 Nov 26', due: '07 Des 26', dueDays: 15, method: 'SNAP VA BCA', dpp: 75675676, ppn: 8324324, total: 84000000, nsfp: '010.004-26.48192412', state: 'open', status: 'Aktif TOP', tone: 'info' },
  { no: 'INV-2026-1118', sj: 'SJ-KRW-2026-0873', principal: 'PT BlueScope Lysaght', issued: '14 Nov 26', due: '14 Des 26', dueDays: 22, method: 'Giro BG-882941', dpp: 62162162, ppn: 6837838, total: 69000000, nsfp: '010.004-26.48192775', state: 'open', status: 'Aktif TOP', tone: 'info' },
  { no: 'INV-2026-1126', sj: 'SJ-KRW-2026-0884', principal: 'PT GRC Board ID', issued: '19 Nov 26', due: '19 Des 26', dueDays: 27, method: 'SNAP VA Mandiri', dpp: 61756757, ppn: 6793243, total: 68550000, nsfp: '010.004-26.48193104', state: 'open', status: 'Aktif TOP', tone: 'info' },
  { no: 'DRF-2026-1142', sj: 'SJ-KRW-2026-0891', principal: 'Multi-Principal (PO #1142)', issued: '22 Nov 26', due: '22 Des 26', dueDays: 30, method: 'SNAP VA Mandiri', dpp: 105672000, ppn: 11623920, total: 117295920, nsfp: 'ANTRE CORETAX XML', state: 'queued', status: 'Antre PPN', tone: 'accent', selected: true },
  { no: 'INV-2026-1061', sj: 'SJ-KRW-2026-0804', principal: 'PT Krakatau Steel', issued: '14 Okt 26', due: '13 Nov 26', dueDays: 0, method: 'SNAP VA Mandiri', dpp: 112612613, ppn: 12387387, total: 125000000, nsfp: '010.004-26.48191102', state: 'paid', status: 'Lunas VA', tone: 'ok' },
  { no: 'INV-2026-1054', sj: 'SJ-KRW-2026-0791', principal: 'PT Indocement TR', issued: '10 Okt 26', due: '09 Nov 26', dueDays: 0, method: 'SNAP VA BCA', dpp: 52792793, ppn: 5807207, total: 58600000, nsfp: '010.004-26.48190944', state: 'paid', status: 'Lunas VA', tone: 'ok' },
  { no: 'INV-2026-1047', sj: 'SJ-KRW-2026-0778', principal: 'PT Citicon Nusantara', issued: '05 Okt 26', due: '04 Nov 26', dueDays: 0, method: 'Giro BG-882870', dpp: 39639640, ppn: 4360360, total: 44000000, nsfp: '010.004-26.48190618', state: 'paid', status: 'Kliring OK', tone: 'ok' },
  { no: 'INV-2026-1039', sj: 'SJ-KRW-2026-0762', principal: 'PT Master Steel Mfg', issued: '02 Okt 26', due: '01 Nov 26', dueDays: 0, method: 'SNAP VA Mandiri', dpp: 86400000, ppn: 9504000, total: 95904000, nsfp: '010.004-26.48190305', state: 'paid', status: 'Lunas VA', tone: 'ok' },
  { no: 'INV-2026-1031', sj: 'SJ-KRW-2026-0749', principal: 'PT Rucika Indonesia', issued: '28 Sep 26', due: '28 Okt 26', dueDays: 0, method: 'SNAP VA BCA', dpp: 46846847, ppn: 5153153, total: 52000000, nsfp: '010.004-26.48189871', state: 'paid', status: 'Lunas VA', tone: 'ok' },
];

// Digital Surat Jalan List (Page 5 — 13 rows)
const SJ_LIST = [
  { sj: 'SJ-KRW-2026-0891', po: 'PO-2026-1142', plate: 'B 9412 UXA', fleet: 'Fuso Tronton', driver: 'Slamet Riyadi', site: 'Karawang Timur', loadTon: 18.40, siteTon: 18.38, eta: '14:18 WIB', mandor: 'Dedi Supriadi', status: 'Diteken · PPN Antre', tone: 'ok', selected: true },
  { sj: 'SJ-KRW-2026-0890', po: 'PO-2026-1139', plate: 'B 9188 KDA', fleet: 'Fuso Tronton', driver: 'Agus Setiawan', site: 'Cikarang Barat', loadTon: 16.00, siteTon: 15.99, eta: '13:45 WIB', mandor: 'Yusuf Maulana', status: 'Bongkar Site', tone: 'info' },
  { sj: 'SJ-KRW-2026-0889', po: 'PO-2026-1136', plate: 'T 8741 DD', fleet: 'Tronton 20t', driver: 'Heri Purnomo', site: 'Jababeka II', loadTon: 18.90, siteTon: null, eta: 'ETA 16:20', mandor: 'Rudi Hartono', status: 'Tol Cikampek KM42', tone: 'warn' },
  { sj: 'SJ-KRW-2026-0888', po: 'PO-2026-1131', plate: 'B 9620 FVA', fleet: 'Fuso Fighter', driver: 'Darmawan', site: 'Karawang Timur', loadTon: 9.80, siteTon: null, eta: 'ETA 17:05', mandor: 'Dedi Supriadi', status: 'Muat Depot Bekasi', tone: 'neutral' },
  { sj: 'SJ-KRW-2026-0887', po: 'PO-2026-1129', plate: 'B 9034 SYA', fleet: 'Colt Diesel 8t', driver: 'Wahyudi', site: 'Kawasan KIIC', loadTon: 2.60, siteTon: 2.60, eta: '11:22 WIB', mandor: 'Bambang P.', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0886', po: 'PO-2026-1122', plate: 'B 9771 UWB', fleet: 'Fuso Tronton', driver: 'Suyanto', site: 'Karawang Timur', loadTon: 16.00, siteTon: 15.98, eta: '10:04 WIB', mandor: 'Dedi Supriadi', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0885', po: 'PO-2026-1119', plate: 'B 9502 KLA', fleet: 'Fuso Fighter', driver: 'M. Ridwan', site: 'Deltamas B3', loadTon: 13.40, siteTon: 13.39, eta: 'Kemarin', mandor: 'Ahmad Fauzi', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0884', po: 'PO-2026-1126', plate: 'B 9321 TXA', fleet: 'Fuso Fighter', driver: 'Taufik H.', site: 'Karawang Timur', loadTon: 11.20, siteTon: 11.20, eta: '19 Nov 26', mandor: 'Dedi Supriadi', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0881', po: 'PO-2026-1116', plate: 'B 9810 WXA', fleet: 'Flatbed 22t', driver: 'Joko Susilo', site: 'Kawasan KIIC', loadTon: 19.20, siteTon: 19.17, eta: '18 Nov 26', mandor: 'Bambang P.', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0879', po: 'PO-2026-1110', plate: 'A 9214 ZA', fleet: 'Colt Double 8t', driver: 'Endang S.', site: 'Jababeka II', loadTon: 8.00, siteTon: 7.99, eta: '17 Nov 26', mandor: 'Rudi Hartono', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0873', po: 'PO-2026-1118', plate: 'B 9208 MKA', fleet: 'Fuso Fighter', driver: 'Hendra P.', site: 'Karawang Timur', loadTon: 12.60, siteTon: 12.59, eta: '14 Nov 26', mandor: 'Dedi Supriadi', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0864', po: 'PO-2026-1109', plate: 'B 9445 QXA', fleet: 'Fuso Tronton', driver: 'Suharto', site: 'Karawang Timur', loadTon: 19.40, siteTon: 19.37, eta: '07 Nov 26', mandor: 'Dedi Supriadi', status: 'Selesai · NSFP OK', tone: 'ok' },
  { sj: 'SJ-KRW-2026-0851', po: 'PO-2026-1094', plate: 'T 8912 CC', fleet: 'Fuso Tronton', driver: 'Maman S.', site: 'Cikarang Barat', loadTon: 16.00, siteTon: 16.00, eta: '29 Okt 26', mandor: 'Yusuf Maulana', status: 'Selesai · NSFP OK', tone: 'ok' },
];

// ============================================================================
// DERIVED TOTALS & PROGRAMMATIC MATH VERIFICATION
// ============================================================================
const LOAD_TOTAL_KG = LOAD_PLAN_ITEMS.reduce((a, x) => a + x.qty * x.unitKg, 0);
const LOAD_TOTAL_TON = LOAD_TOTAL_KG / 1000;
const LOAD_UTIL_PCT = (LOAD_TOTAL_TON / PROJECT.truckCapTon) * 100;
const LOAD_MATERIAL_SUBTOTAL = LOAD_PLAN_ITEMS.reduce((a, x) => a + x.qty * x.lockedPrice, 0);
const LOAD_RETAIL_BENCHMARK = LOAD_PLAN_ITEMS.reduce((a, x) => a + x.qty * x.retailPrice, 0);
const LOAD_SAVINGS = LOAD_RETAIL_BENCHMARK - LOAD_MATERIAL_SUBTOTAL;
const LOAD_SAVINGS_PCT = (LOAD_SAVINGS / LOAD_RETAIL_BENCHMARK) * 100;
const LOAD_DPP = LOAD_MATERIAL_SUBTOTAL + PROJECT.freightNet;
const LOAD_PPN = Math.round(LOAD_DPP * 0.11);
const LOAD_GRAND_TOTAL = LOAD_DPP + LOAD_PPN;
const LOAD_FREIGHT_ALLOC_SUM = LOAD_PLAN_ITEMS.reduce((a, x) => a + x.freightAlloc, 0);

const AXLE_TOTAL_TON = Number(AXLES.reduce((a, x) => a + x.loadTon, 0).toFixed(2));
const OPEN_INVOICES = INVOICES.filter((i) => i.state === 'open');
const DUE_SOON_INVOICES = OPEN_INVOICES.filter((i) => i.dueDays <= 7);
const OPEN_TOTAL = OPEN_INVOICES.reduce((a, i) => a + i.total, 0);
const DUE_SOON_TOTAL = DUE_SOON_INVOICES.reduce((a, i) => a + i.total, 0);
const PAID_TOTAL = INVOICES.filter((i) => i.state === 'paid').reduce((a, i) => a + i.total, 0);
const RFQ_TOTAL_VALUE = RFQS.reduce((a, r) => a + r.value, 0);
const RFQ_TOTAL_TON = Number(RFQS.reduce((a, r) => a + r.ton, 0).toFixed(1));
const RFQ_LOCKED_CNT = RFQS.filter((r) => r.status === 'Terkunci').length;
const RFQ_NEGO_CNT = RFQS.filter((r) => r.status === 'Negosiasi' || r.status === 'Kritis Lock').length;
const SJ_TOTAL_TON = Number(SJ_LIST.reduce((a, s) => a + s.loadTon, 0).toFixed(1));

export function verifyMath() {
  if (LOAD_TOTAL_KG !== 18400) throw new Error(`LOAD_TOTAL_KG mismatch: ${LOAD_TOTAL_KG}`);
  if (Math.abs(LOAD_TOTAL_TON - 18.4) > 1e-6) throw new Error(`LOAD_TOTAL_TON mismatch: ${LOAD_TOTAL_TON}`);
  if (Math.abs(AXLE_TOTAL_TON - LOAD_TOTAL_TON) > 1e-6) {
    throw new Error(`AXLE_TOTAL_TON (${AXLE_TOTAL_TON}) !== LOAD_TOTAL_TON (${LOAD_TOTAL_TON})`);
  }
  if (PROJECT.freightGross - PROJECT.cementUnloadCredit !== PROJECT.freightNet) {
    throw new Error(`Freight net mismatch`);
  }
  if (LOAD_FREIGHT_ALLOC_SUM !== PROJECT.freightNet) {
    throw new Error(`Freight alloc sum (${LOAD_FREIGHT_ALLOC_SUM}) !== freightNet (${PROJECT.freightNet})`);
  }
  if (LOAD_MATERIAL_SUBTOTAL !== 103472000) throw new Error(`Material subtotal mismatch: ${LOAD_MATERIAL_SUBTOTAL}`);
  if (LOAD_DPP !== 105672000) throw new Error(`DPP mismatch: ${LOAD_DPP}`);
  if (LOAD_PPN !== 11623920) throw new Error(`PPN 11% mismatch: ${LOAD_PPN}`);
  if (LOAD_GRAND_TOTAL !== 117295920) throw new Error(`Grand total mismatch: ${LOAD_GRAND_TOTAL}`);

  // Verify every invoice row satisfies exact 11% PPN rounding and DPP+PPN=Total
  for (const inv of INVOICES) {
    const calcPpn = Math.round(inv.dpp * 0.11);
    if (calcPpn !== inv.ppn) throw new Error(`Invoice ${inv.no} PPN mismatch: ${calcPpn} vs ${inv.ppn}`);
    if (inv.dpp + inv.ppn !== inv.total) throw new Error(`Invoice ${inv.no} total mismatch`);
  }
  if (OPEN_TOTAL !== PROJECT.creditUsed) {
    throw new Error(`Open invoices (${OPEN_TOTAL}) !== creditUsed (${PROJECT.creditUsed})`);
  }
  if (PROJECT.creditLimit - PROJECT.creditUsed !== PROJECT.creditRemaining) {
    throw new Error(`Credit remaining math mismatch`);
  }
  if (DUE_SOON_TOTAL !== 118450000) throw new Error(`Due soon total mismatch: ${DUE_SOON_TOTAL}`);
  if (RFQS[0].value !== LOAD_DPP) throw new Error(`RFQ-1142 value (${RFQS[0].value}) !== LOAD_DPP (${LOAD_DPP})`);
  if (RFQS[0].ton !== LOAD_TOTAL_TON) throw new Error(`RFQ-1142 ton mismatch`);
  const queuedInv = INVOICES.find((i) => i.state === 'queued');
  if (!queuedInv || queuedInv.total !== LOAD_GRAND_TOTAL) {
    throw new Error(`Queued CoreTax draft invoice does not match PO-1142 grand total`);
  }
  if (SJ_LIST[0].loadTon !== LOAD_TOTAL_TON) throw new Error(`SJ-0891 loadTon mismatch`);
  if (Math.abs(SJ_TOTAL_TON - 181.5) > 1e-6) throw new Error(`SJ_TOTAL_TON mismatch: ${SJ_TOTAL_TON}`);
}

// ============================================================================
// DISTINCT B2B COMMERCE SHELL (SHOPIFY PLUS / TOKOPEDIA SELLER ENTERPRISE)
// Crisp Bright-White Merchandising Header + Warm Terracotta Brand Anchor (#b45309)
// ============================================================================

const EXTRA_CSS = `
  /* Override chrome defaults for distinct B2B Material Commerce Identity */
  :root {
    --gb-accent: #b45309;
    --gb-accent-dark: #92400e;
    --gb-accent-ink: #78350f;
    --gb-accent-soft: #fffbeb;
    --gb-accent-bd: #fcd34d;
    --gb-stone-50: #faf8f5;
    --gb-stone-100: #f4f1eb;
    --gb-stone-200: #e5dfd5;
    --gb-stone-300: #d1c8ba;
    --gb-ink: #1c1917;
    --gb-ink-2: #44403c;
    --gb-muted: #78716c;
  }

  .gb-topbar {
    height: 44px;
    background: #ffffff;
    border-top: 3px solid var(--gb-accent);
    border-bottom: 1px solid var(--gb-stone-200);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .gb-top-left, .gb-top-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .gb-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--gb-ink);
    white-space: nowrap;
  }
  .gb-logo-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: var(--gb-accent);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .gb-logo-sub {
    font-size: 9.5px;
    font-weight: 700;
    color: var(--gb-accent-ink);
    background: var(--gb-accent-soft);
    border: 1px solid var(--gb-accent-bd);
    padding: 1.5px 6px;
    border-radius: 3px;
    font-family: var(--e-mono);
  }
  .gb-project-select {
    height: 26px;
    padding: 0 9px;
    border-radius: 4px;
    background: var(--gb-stone-50);
    border: 1px solid var(--gb-stone-300);
    color: var(--gb-ink);
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .gb-search {
    height: 26px;
    width: 280px;
    padding: 0 9px;
    border-radius: 4px;
    background: var(--gb-stone-50);
    border: 1px solid var(--gb-stone-200);
    color: var(--gb-muted);
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .gb-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid var(--gb-stone-300);
    color: var(--gb-ink-2);
  }
  .gb-credit-pill {
    height: 26px;
    padding: 0 9px;
    border-radius: 4px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .gb-truck-pill {
    height: 26px;
    padding: 0 9px;
    border-radius: 4px;
    background: var(--gb-accent-soft);
    border: 1px solid var(--gb-accent-bd);
    color: var(--gb-accent-ink);
    font-size: 10.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .gb-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid var(--gb-stone-200);
    white-space: nowrap;
  }
  .gb-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #1c1917;
    color: #fef3c7;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Warm Alabaster Left Rail */
  .gb-rail {
    width: 198px;
    background: #ffffff;
    border-right: 1px solid var(--gb-stone-200);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 10px 0 8px;
  }
  .gb-nav-sec {
    padding: 0 9px 9px;
    margin-bottom: 7px;
    border-bottom: 1px solid #f0ece4;
  }
  .gb-nav-sec:last-of-type { border-bottom: 0; margin-bottom: 0; }
  .gb-nav-title {
    font-size: 9.2px;
    font-weight: 700;
    color: var(--gb-muted);
    letter-spacing: 0.04em;
    padding: 2px 6px 5px;
  }
  .gb-nav-item {
    height: 27px;
    padding: 0 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    color: var(--gb-ink-2);
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;
  }
  .gb-nav-item.is-active {
    background: var(--gb-accent-soft);
    color: var(--gb-accent-ink);
    font-weight: 700;
    border: 1px solid var(--gb-accent-bd);
  }
  .gb-nav-cnt {
    font-family: var(--e-mono);
    font-size: 9.5px;
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--gb-stone-100);
    color: var(--gb-ink-2);
    flex-shrink: 0;
  }
  .gb-nav-item.is-active .gb-nav-cnt {
    background: var(--gb-accent);
    color: #ffffff;
  }
  .gb-nav-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    font-weight: 700;
  }
  .gb-rail-foot {
    margin: 0 9px;
    padding: 8px 9px;
    border-radius: 4px;
    background: var(--gb-stone-50);
    border: 1px solid var(--gb-stone-200);
    font-size: 10px;
  }

  /* Subbar & Panel Harmonization */
  .gb-subbar {
    height: 38px;
    padding: 0 14px;
    background: #ffffff;
    border-bottom: 1px solid var(--gb-stone-200);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .e-panel {
    border-color: var(--gb-stone-200);
  }
  .e-panel-head {
    background: var(--gb-stone-50);
    border-bottom-color: var(--gb-stone-200);
  }
  .e-kpi {
    border-color: var(--gb-stone-200);
  }
  .e-badge-accent {
    background: var(--gb-accent-soft);
    color: var(--gb-accent-ink);
    border-color: var(--gb-accent-bd);
  }
  table.e-table th {
    background: var(--gb-stone-100);
    color: var(--gb-ink-2);
    border-bottom-color: var(--gb-stone-300);
  }
  table.e-table td {
    border-bottom-color: #efeae2;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbf9;
  }
  table.e-table tbody tr.is-selected {
    background: #fffbeb !important;
    box-shadow: inset 3px 0 0 var(--gb-accent);
  }
  table.e-table tfoot td {
    background: var(--gb-stone-100);
    border-top-color: var(--gb-stone-300);
  }
  .e-statusbar {
    background: var(--gb-stone-100);
    border-top-color: var(--gb-stone-200);
    color: var(--gb-ink-2);
  }

  /* Merchandising SKU Cards (Page 1) */
  .gb-sku-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    flex-shrink: 0;
  }
  .gb-sku-card {
    background: #ffffff;
    border: 1px solid var(--gb-stone-200);
    border-radius: 4px;
    padding: 9px 10px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }
  .gb-sku-card.is-picked {
    border-color: #d97706;
    box-shadow: inset 0 2px 0 #b45309;
  }
  .gb-tier-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
  .gb-tier-box {
    border: 1px solid var(--gb-stone-200);
    background: var(--gb-stone-50);
    border-radius: 3px;
    padding: 4px 5px;
    text-align: center;
  }
  .gb-tier-box.is-best {
    background: var(--gb-accent-soft);
    border-color: #f59e0b;
  }

  /* Filter Pills */
  .gb-chip {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid var(--gb-stone-300);
    background: #ffffff;
    color: var(--gb-ink-2);
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .gb-chip.is-on {
    background: var(--gb-accent);
    border-color: var(--gb-accent);
    color: #ffffff;
  }

  /* Fleet Tabs (Page 3) */
  .gb-fleet-tab {
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid var(--gb-stone-200);
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .gb-fleet-tab.is-active {
    background: var(--gb-accent-soft);
    border-color: var(--gb-accent);
    box-shadow: inset 0 2px 0 var(--gb-accent);
  }

  /* Stepper (Page 5) */
  .gb-stepper {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  .gb-step {
    border: 1px solid var(--gb-stone-200);
    background: var(--gb-stone-50);
    border-radius: 4px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .gb-step.is-done {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }
  .gb-step.is-current {
    background: var(--gb-accent-soft);
    border-color: #f59e0b;
  }
  .gb-step-num {
    width: 19px;
    height: 19px;
    border-radius: 3px;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  table.e-table-tight th, table.e-table-tight td {
    padding: 4px 5px;
  }
`;

function renderShell({ activeNav, breadcrumb, pageSubtitle, actionsHtml, contentHtml, statusRight }) {
  const navGroups = [
    {
      label: 'PENGADAAN B2B',
      items: [
        { id: 'katalog', icon: 'box', label: 'Katalog Principal', badge: '14 SKU' },
        { id: 'rfq', icon: 'tag', label: 'Antrean RFQ Instan', badge: '16' },
        { id: 'tonase', icon: 'truck', label: 'Kalkulator Tonase', badge: '92%' },
      ],
    },
    {
      label: 'FINANSIAL & PAJAK',
      items: [
        { id: 'kredit', icon: 'creditCard', label: 'Kredit TOP & VA', badge: '2 H-7', warn: true },
        { id: 'faktur', icon: 'receipt', label: 'e-Faktur CoreTax', badge: '11%' },
      ],
    },
    {
      label: 'LOGISTIK LAPANGAN',
      items: [
        { id: 'sj', icon: 'clipboard', label: 'Surat Jalan Digital', badge: '13 SJ' },
        { id: 'depot', icon: 'building', label: 'Jaringan Pabrik', badge: '6 Unit' },
      ],
    },
  ];

  const topbar = `<header class="gb-topbar">
    <div class="gb-top-left">
      <div class="gb-logo">
        <span class="gb-logo-mark">GB</span>
        <span>GrosirBahan B2B</span>
        <span class="gb-logo-sub">PRINCIPAL DIRECT</span>
      </div>
      <div class="gb-project-select">
        ${domainIcon('building', 12, '#b45309')}
        <span>${esc(PROJECT.name)}</span>
        ${ic('chevronDown', 11, '#78716c')}
      </div>
      <div class="gb-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#78716c')}
          <span class="trunc">Cari SKU, SNI 2052, Principal, No. PO / SJ...</span>
        </span>
        <span class="gb-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="gb-top-right">
      <div class="gb-credit-pill">
        <span class="dot dot-ok"></span>
        <span>TOP 30H · Sisa</span>
        <strong class="mono">Rp 510 jt</strong>
        <span style="color:#047857;font-size:9.5px;">/ 850 jt</span>
      </div>
      <div class="gb-truck-pill">
        ${domainIcon('truck', 12, '#78350f')}
        <span class="mono">18,4 / 20,0 ton</span>
        <span style="font-size:9.5px;font-weight:600;">(92%)</span>
      </div>
      <div class="gb-user">
        <span class="gb-avatar">HK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#1c1917;">Ir. Hendra Kusuma</div>
          <div style="font-size:9px;color:#78716c;">Kepala Pengadaan · PT WGK</div>
        </div>
      </div>
    </div>
  </header>`;

  const rail = `<aside class="gb-rail">
    <div>
      ${navGroups
        .map(
          (g) => `<div class="gb-nav-sec">
            <div class="gb-nav-title">${esc(g.label)}</div>
            ${g.items
              .map((it) => {
                const act = it.id === activeNav;
                return `<div class="gb-nav-item ${act ? 'is-active' : ''}">
                  <span style="display:inline-flex;align-items:center;gap:7px;min-width:0;">
                    ${domainIcon(it.icon, 13, act ? '#78350f' : '#78716c')}
                    <span class="trunc">${esc(it.label)}</span>
                  </span>
                  <span class="gb-nav-cnt ${it.warn ? 'warn' : ''}">${esc(it.badge)}</span>
                </div>`;
              })
              .join('')}
          </div>`
        )
        .join('')}
    </div>
    <div class="gb-rail-foot">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
        <span style="font-weight:700;color:#1c1917;">Plafon Kredit TOP</span>
        <span class="mono" style="font-weight:700;color:#047857;">40,0%</span>
      </div>
      <div style="height:6px;background:#e5dfd5;border-radius:2px;overflow:hidden;margin-bottom:5px;">
        <div style="width:40%;height:100%;background:#b45309;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#57534e;">
        <span>Pakai: <strong class="mono">340 jt</strong></span>
        <span>Limit: <strong class="mono">850 jt</strong></span>
      </div>
      <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5dfd5;font-size:9.2px;color:#57534e;display:flex;align-items:center;gap:5px;">
        <span class="dot dot-ok"></span>
        <span class="trunc">ERP Principal · SNAP VA · CoreTax</span>
      </div>
    </div>
  </aside>`;

  const subbar = `<div class="gb-subbar">
    <div class="e-crumb">
      <span>GrosirBahan</span>
      ${ic('chevronRight', 11, '#a8a29e')}
      <strong>${esc(breadcrumb)}</strong>
      <span style="color:#d1c8ba;">|</span>
      <span style="font-size:10.5px;color:#57534e;" class="trunc">${esc(pageSubtitle)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
      ${actionsHtml}
    </div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> ERP Principal Sync: 14:19 WIB (6 Pabrik Aktif)`,
      `Zona Kirim: Karawang Timur (68 km)`,
      `CoreTax DJP PPN 11%: Terhubung`,
    ],
    rightItems: statusRight || [
      `NPWP: ${PROJECT.npwp}`,
      `.NET 9 Modular Monolith · PostgreSQL 17 · SNAP VA`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `GrosirBahan B2B — ${breadcrumb}`,
    accent: '#b45309',
    accentSoft: '#fffbeb',
    accentInk: '#78350f',
    bg: '#faf8f5',
    surface: '#ffffff',
    surface2: '#f4f1eb',
    border: '#e5dfd5',
    borderStrong: '#d1c8ba',
    text: '#1c1917',
    text2: '#44403c',
    muted: '#78716c',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}
      <div class="e-shell-body">
        ${rail}
        <main class="e-main">
          ${subbar}
          <div class="e-content">${contentHtml}</div>
        </main>
      </div>
      ${footer}`,
  });
}

// ============================================================================
// PAGE 1: KATALOG PRINCIPAL & HARGA BERJENJANG (MERCHANDISING WORKSPACE)
// ============================================================================
function renderPage1() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Sisa Limit TOP 30 Hari</span>
        ${badge('Aktif', 'ok')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 510 jt</span>
        ${svgSparkline({ points: [420, 460, 445, 530, 495, 510], width: 68, height: 20, color: '#047857' })}
      </div>
      <div class="e-kpi-foot">
        <span>Terpakai Rp 340 jt / 850 jt</span>
        <span class="mono" style="color:#047857;font-weight:700;">60,0%</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Muatan Fuso Tronton</span>
        ${badge('Optimal', 'accent')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">18,4 / 20 ton</span>
        <span class="mono" style="font-size:11px;font-weight:700;color:#b45309;">92,0%</span>
      </div>
      <div class="e-kpi-foot">
        <span>Sisa ruang 1,60 ton (Anti-ODOL)</span>
        <span class="mono">4 SKU</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Harga Principal Terkunci</span>
        ${badge('Lock 24j', 'info')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">24 jam</span>
        <span class="mono" style="font-size:10.5px;color:#0369a1;font-weight:600;">23j 42m sisa</span>
      </div>
      <div class="e-kpi-foot">
        <span>Proteksi fluktuasi besi Cilegon</span>
        <span class="mono">SNI 2052</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Nilai PO Muatan Aktif (DPP)</span>
        ${badge('PO #1142', 'neutral')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 105,67 jt</span>
        ${svgSparkline({ points: [68, 74, 88, 92, 99, 105.6], width: 68, height: 20, color: '#b45309' })}
      </div>
      <div class="e-kpi-foot">
        <span>PPN 11% CoreTax: Rp 11,62 jt</span>
        <span class="mono">Total 117,3 jt</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Hemat vs Harga Ritel Toko</span>
        ${badge('-12,1%', 'ok')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">Rp 14,29 jt</span>
        <span class="mono" style="font-size:10.5px;color:#047857;font-weight:700;">Direct Factory</span>
      </div>
      <div class="e-kpi-foot">
        <span>Ritel Rp 117,76 jt vs Rp 103,47 jt</span>
        <span class="mono">Tier-3</span>
      </div>
    </div>
  </div>`;

  // 4 Hero Merchandising SKU Cards
  const skuCards = `<div class="gb-sku-grid">
    ${LOAD_PLAN_ITEMS.map((item) => {
      const sub = item.qty * item.lockedPrice;
      const ton = (item.qty * item.unitKg) / 1000;
      const savePct = (((item.retailPrice - item.lockedPrice) / item.retailPrice) * 100).toFixed(1).replace('.', ',');
      return `<div class="gb-sku-card is-picked">
        <div style="display:flex;align-items:flex-start;gap:9px;">
          ${skuThumbSvg(item.kind, 44)}
          <div style="min-width:0;flex:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:2px;">
              <span class="mono" style="font-size:9.8px;font-weight:700;color:#78350f;">${esc(item.code)} · ${esc(item.meta)}</span>
              ${badge(item.status, item.tone)}
            </div>
            <div style="font-size:11.5px;font-weight:700;color:#1c1917;line-height:1.25;" class="trunc">${esc(item.title)}</div>
            <div style="font-size:9.8px;color:#78716c;margin-top:2px;" class="trunc">${esc(item.subtitle)}</div>
          </div>
        </div>

        <div class="gb-tier-row">
          <div class="gb-tier-box">
            <div style="font-size:8.6px;color:#78716c;">Tier 1 (Ecer)</div>
            <div class="mono" style="font-size:9.8px;color:#57534e;text-decoration:line-through;">${fmtNum(item.tier1Price)}</div>
          </div>
          <div class="gb-tier-box">
            <div style="font-size:8.6px;color:#78716c;">Tier 2 (Proyek)</div>
            <div class="mono" style="font-size:9.8px;color:#44403c;font-weight:600;">${fmtNum(item.tier2Price)}</div>
          </div>
          <div class="gb-tier-box is-best">
            <div style="font-size:8.6px;color:#92400e;font-weight:700;">Tier 3 (Terkunci)</div>
            <div class="mono" style="font-size:10px;color:#78350f;font-weight:800;">${fmtNum(item.lockedPrice)}</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid #f0ece4;">
          <div>
            <div style="font-size:9.2px;color:#78716c;">Di Muatan: <strong style="color:#1c1917;" class="mono">${fmtNum(item.qty)} ${item.unit}</strong> (${ton.toFixed(2).replace('.', ',')} ton)</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#1c1917;">${fmtIdr(sub)}</div>
          </div>
          <span class="e-badge e-badge-ok">-${savePct}% Ritel</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;

  // Waterfall SVG (Pricing & Procurement Margin Breakdown)
  const wfBars = [
    { label: 'Harga Ritel Toko', val: LOAD_RETAIL_BENCHMARK, color: '#a8a29e', note: 'Rp 117,76 jt' },
    { label: 'Diskon Principal', val: -LOAD_SAVINGS, color: '#047857', note: '-Rp 14,29 jt' },
    { label: 'Netto Material', val: LOAD_MATERIAL_SUBTOTAL, color: '#b45309', note: 'Rp 103,47 jt' },
    { label: 'Ongkir Tronton Net', val: PROJECT.freightNet, color: '#0369a1', note: '+Rp 2,20 jt' },
    { label: 'PPN 11% CoreTax', val: LOAD_PPN, color: '#57534e', note: '+Rp 11,62 jt' },
    { label: 'Total Tagihan PO', val: LOAD_GRAND_TOTAL, color: '#1c1917', note: 'Rp 117,30 jt' },
  ];

  const wfHtml = wfBars
    .map((b) => {
      const pct = Math.min(100, (Math.abs(b.val) / LOAD_RETAIL_BENCHMARK) * 100);
      return `<div style="display:grid;grid-template-columns:112px 1fr 82px;align-items:center;gap:8px;margin-bottom:7px;">
        <span style="font-size:10px;font-weight:600;color:#44403c;" class="trunc">${esc(b.label)}</span>
        <div style="height:12px;background:#f4f1eb;border-radius:2px;overflow:hidden;">
          <div style="width:${pct.toFixed(1)}%;height:100%;background:${b.color};"></div>
        </div>
        <span class="mono num" style="font-size:10px;font-weight:700;color:${b.val < 0 ? '#047857' : '#1c1917'};">${esc(b.note)}</span>
      </div>`;
    })
    .join('');

  const bottomSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.85fr 1fr;gap:9px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${domainIcon('box', 13, '#b45309')}
          <span class="trunc">Matriks Katalog Principal & Stok Multi-Depot</span>
          <span class="e-panel-sub trunc">· ERP Real-Time</span>
        </div>
        <div style="display:flex;gap:5px;">
          <span class="gb-chip is-on">Semua (14)</span>
          <span class="gb-chip">Besi & Baja</span>
          <span class="gb-chip">Semen & Mortar</span>
          <span class="gb-chip">GRC & Pipa</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table e-table-tight">
          <thead>
            <tr>
              <th style="width:56px;">Kode</th>
              <th style="width:222px;">Material & Spesifikasi SNI</th>
              <th style="width:100px;">Principal</th>
              <th class="num" style="width:66px;">Berat/U</th>
              <th class="num" style="width:106px;">Harga Tier-3</th>
              <th class="num" style="width:54px;">Hemat</th>
              <th class="num" style="width:58px;">Cilegon</th>
              <th class="num" style="width:58px;">Bekasi</th>
              <th class="num" style="width:62px;">Karawang</th>
              <th style="width:76px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${CATALOG_SKUS.map(
              (s) => `<tr class="${s.active ? 'is-selected' : ''}">
                <td class="mono" style="font-weight:700;color:${s.active ? '#78350f' : '#44403c'};">${esc(s.code)}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                    ${skuThumbSvg(s.kind, 17)}
                    <span class="trunc" style="font-weight:${s.active ? '700' : '500'};">${esc(s.name)}</span>
                  </div>
                </td>
                <td style="color:#57534e;">${esc(s.principal)}</td>
                <td class="num mono">${s.kg >= 100 ? fmtNum(s.kg) : s.kg.toFixed(1).replace('.', ',')} kg</td>
                <td class="num mono" style="font-weight:700;">${fmtIdr(s.price)}</td>
                <td class="num mono" style="color:#047857;font-weight:600;">${esc(s.disc)}</td>
                <td class="num mono" style="color:${s.stkCilegon === 0 ? '#a8a29e' : '#1c1917'};">${s.stkCilegon === 0 ? '—' : fmtNum(s.stkCilegon)}</td>
                <td class="num mono">${s.stkBekasi === 0 ? '—' : fmtNum(s.stkBekasi)}</td>
                <td class="num mono" style="font-weight:600;">${fmtNum(s.stkKarawang)}</td>
                <td>${badge(s.status, s.tone)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">4 SKU Aktif di Rencana Muat PO-2026-1142 · Direct Principal</td>
              <td class="num mono">${fmtIdr(LOAD_MATERIAL_SUBTOTAL)}</td>
              <td class="num mono" style="color:#047857;">-${LOAD_SAVINGS_PCT.toFixed(1).replace('.', ',')}%</td>
              <td colspan="4" class="num mono" style="color:#78350f;">Muatan: 18,40 / 20,00 ton (92%)</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:8px 11px;background:#faf8f5;border-top:1px solid #e5dfd5;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#57534e;margin-top:auto;">
          <span><strong style="color:#1c1917;">Aturan Zona Kirim Karawang Timur:</strong> 1 DO Semen (160 sak / 8,0 ton) mendapat potongan bongkar Rp 400.000 otomatis.</span>
          <span class="mono" style="color:#78350f;font-weight:700;">Sync ERP: 420 ms · 0 Selisih Stok</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1.15;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('scale', 13, '#b45309')}
            <span>Waterfall Harga Principal vs Ritel</span>
          </div>
          ${badge('PO-2026-1142', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>${wfHtml}</div>
          <div style="padding:7px 9px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:10px;font-weight:700;color:#065f46;">Efisiensi Bersih Termasuk PPN & Ongkir</span>
            <span class="mono" style="font-size:11px;font-weight:800;color:#047857;">Rp 119,6 / kg angkut</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0.85;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('truck', 13, '#b45309')}
            <span>Ringkasan Rencana Muat & Otomasi Pajak</span>
          </div>
          <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">SIAP TERBIT PO</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          <div style="padding:8px 9px;background:#fffbeb;border:1px solid #fcd34d;border-radius:3px;font-size:10.5px;color:#78350f;line-height:1.4;">
            <strong>Load Plan:</strong> 1x Fuso Tronton (18,4 ton) menuju <strong>Proyek Karawang Timur</strong> · Faktur Pajak PPN 11% (<strong>${fmtIdr(LOAD_PPN)}</strong>) antre otomatis di CoreTax saat Surat Jalan diteken mandor.
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;font-size:10px;">
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="color:#78716c;font-size:9.2px;">Sisa Limit Setelah PO Ini</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#1c1917;">${fmtIdr(PROJECT.creditRemaining - LOAD_GRAND_TOTAL)}</div>
            </div>
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="color:#78716c;font-size:9.2px;">Estimasi Tiba Site</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">Besok · 08:30 WIB</div>
            </div>
          </div>
          <div style="display:flex;gap:7px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:26px;">${ic('check', 12, '#ffffff')} Ajukan PO & Surat Jalan</span>
            <span class="e-btn" style="height:26px;">${domainIcon('truck', 12, '#44403c')} Hitung Tonase</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeNav: 'katalog',
    breadcrumb: 'Katalog Principal & Harga Berjenjang',
    pageSubtitle: 'Harga langsung pabrik dengan volume tier, stok ERP real-time, dan kunci harga 24 jam',
    actionsHtml: `
      <span class="e-btn">${domainIcon('truck', 12, '#44403c')} Hitung Tonase Truk</span>
      <span class="e-btn e-btn-primary">${ic('check', 12, '#ffffff')} Ajukan PO & SJ</span>
    `,
    contentHtml: `${kpiStrip}${skuCards}${bottomSplit}`,
  });
}

// ============================================================================
// PAGE 2: ANTREAN RFQ INSTAN & NEGOSIASI PRINCIPAL (16-ROW GRID + INSPECTOR)
// ============================================================================
function renderPage2() {
  const topBar = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
    <div class="e-kpi" style="padding:7px 10px;">
      <div class="e-kpi-top"><span>Total Nilai Pipeline RFQ (16 Dok)</span>${badge('DPP', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(RFQ_TOTAL_VALUE)}</span><span class="mono" style="font-size:10px;color:#047857;font-weight:700;">-11,4% avg</span></div>
    </div>
    <div class="e-kpi" style="padding:7px 10px;">
      <div class="e-kpi-top"><span>Harga Terkunci (Siap PO)</span>${badge(`${RFQ_LOCKED_CNT} RFQ`, 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${RFQ_LOCKED_CNT} Dokumen</span><span class="mono" style="font-size:10px;color:#57534e;">Valid 24 jam</span></div>
    </div>
    <div class="e-kpi" style="padding:7px 10px;">
      <div class="e-kpi-top"><span>Negosiasi Aktif / Kritis Lock</span>${badge(`${RFQ_NEGO_CNT} Antre`, 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${RFQ_NEGO_CNT} RFQ</span><span class="mono" style="font-size:10px;color:#be123c;font-weight:700;">1 &lt; 4 jam</span></div>
    </div>
    <div class="e-kpi" style="padding:7px 10px;">
      <div class="e-kpi-top"><span>Akumulasi Tonase Pengadaan</span>${badge('Tronton', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${RFQ_TOTAL_TON.toFixed(1).replace('.', ',')} ton</span><span class="mono" style="font-size:10px;color:#78350f;">Est. 11 ritase</span></div>
    </div>
  </div>`;

  const revLogs = [
    { time: '14:12 WIB', actor: 'Budi Santoso (Krakatau Steel)', delta: 'D13 -> Rp 118.500/btg', note: 'Disetujui Tier-3 (560 btg) · Kunci 24 jam aktif', tone: 'ok' },
    { time: '13:58 WIB', actor: 'Ir. Hendra Kusuma (PT WGK)', delta: 'Counter Rp 118.000/btg', note: 'Bundling 1 DO Semen + GRC + C75 dalam 1 Tronton', tone: 'accent' },
    { time: '13:41 WIB', actor: 'Siti Rahma (Indocement DO)', delta: 'Semen 61.200 · Free Bongkar', note: 'Konfirmasi kuota DO Narogong #NRG-4418 siap muat', tone: 'ok' },
    { time: '13:25 WIB', actor: 'Robby Wijaya (BlueScope)', delta: 'Kanal C75 Rp 94.000/btg', note: 'Lead time 2 hari dari Depot Bekasi · Zincalume AZ100', tone: 'warn' },
    { time: '13:10 WIB', actor: 'Engine Harga GrosirBahan', delta: 'Auto-Split 4 Principal', note: 'Validasi kredit TOP Rp 510 jt cukup (need Rp 117,3 jt)', tone: 'info' },
  ];

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.78fr 1fr;gap:9px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${domainIcon('tag', 13, '#b45309')}
          <span>Antrean RFQ Instan & Kontrak Principal</span>
          <span class="e-panel-sub">· 16 transaksi aktif across 5 proyek</span>
        </div>
        <div style="display:flex;gap:5px;">
          <span class="gb-chip is-on">Semua (16)</span>
          <span class="gb-chip">Terkunci (4)</span>
          <span class="gb-chip">Negosiasi (4)</span>
          <span class="gb-chip">Kirim DO (2)</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table e-table-tight">
          <thead>
            <tr>
              <th style="width:102px;">Kode RFQ</th>
              <th style="width:110px;">Proyek Tujuan</th>
              <th style="width:108px;">Principal</th>
              <th style="width:154px;">Ringkasan Material</th>
              <th class="num" style="width:44px;">Ton</th>
              <th class="num" style="width:112px;">Nilai DPP</th>
              <th class="num" style="width:54px;">Disk.</th>
              <th style="width:56px;">Kunci</th>
              <th style="width:94px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${RFQS.map(
              (r) => `<tr class="${r.selected ? 'is-selected' : r.warn ? 'is-bad' : ''}">
                <td class="mono" style="font-weight:700;color:${r.selected ? '#78350f' : '#1c1917'};">${esc(r.id)}</td>
                <td class="trunc">${esc(r.site)}</td>
                <td class="trunc" style="color:#57534e;">${esc(r.principal)}</td>
                <td class="trunc">${esc(r.summary)}</td>
                <td class="num mono">${r.ton.toFixed(1).replace('.', ',')}</td>
                <td class="num mono" style="font-weight:700;">${fmtIdr(r.value)}</td>
                <td class="num mono" style="color:#047857;font-weight:600;">-${r.discPct.toFixed(1).replace('.', ',')}%</td>
                <td class="mono" style="font-size:9.8px;color:${r.warn ? '#be123c' : '#57534e'};font-weight:${r.warn ? '700' : '500'};">${esc(r.lock)}</td>
                <td>${badge(r.status, r.tone)}</td>
              </tr>`
            ).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total 16 Dokumen RFQ · Rata-rata SLA Respons Sales Principal: 11 menit</td>
              <td class="num mono">${RFQ_TOTAL_TON.toFixed(1).replace('.', ',')}</td>
              <td class="num mono">${fmtIdr(RFQ_TOTAL_VALUE)}</td>
              <td colspan="3" class="num mono" style="color:#047857;">Terpilih: RFQ-2026-1142</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:auto;padding:9px 11px;background:#faf8f5;border-top:1px solid #e5dfd5;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <div style="padding:6px 8px;background:#ffffff;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">SLA Respons Principal</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#1c1917;">11 menit <span style="font-size:9px;color:#047857;">(-4 mnt)</span></div>
          </div>
          <div style="padding:6px 8px;background:#ffffff;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">Rasio Konversi RFQ ke PO</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">78,4% <span style="font-size:9px;color:#57534e;">(12/16)</span></div>
          </div>
          <div style="padding:6px 8px;background:#ffffff;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">Hemat Negosiasi MTD</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#78350f;">Rp 114,8 jt</div>
          </div>
          <div style="padding:6px 8px;background:#ffffff;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">Kunci Harga Hangus</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">0 Dokumen</div>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('sliders', 13, '#b45309')}
          <span>Inspektor Negosiasi · RFQ-2026-1142</span>
        </div>
        ${badge('Terkunci 23j 42m', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
        <div style="padding:8px 9px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;font-weight:700;color:#1c1917;">Proyek Gudang Karawang Timur</div>
            <div style="font-size:9.8px;color:#57534e;">PIC Principal: Budi Santoso · Multi-Depot Consolidation</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:9px;color:#78716c;">Quote Hash</div>
            <div class="mono" style="font-size:9.8px;font-weight:700;color:#78350f;">QT-9F42-KRS</div>
          </div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;display:flex;justify-content:space-between;">
            <span>Rincian Harga Disepakati vs Ritel</span>
            <span class="mono" style="color:#047857;">Hemat ${fmtIdr(LOAD_SAVINGS)}</span>
          </div>
          <table class="e-table" style="border:1px solid #e5dfd5;">
            <thead>
              <tr>
                <th style="width:130px;">Material</th>
                <th class="num" style="width:52px;">Qty</th>
                <th class="num" style="width:74px;">Ritel</th>
                <th class="num" style="width:74px;">Final</th>
                <th class="num" style="width:94px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${LOAD_PLAN_ITEMS.map(
                (i) => `<tr>
                  <td class="trunc" style="font-weight:600;">${esc(i.shortTitle)}</td>
                  <td class="num mono">${i.qty}</td>
                  <td class="num mono" style="color:#78716c;text-decoration:line-through;">${fmtNum(i.retailPrice)}</td>
                  <td class="num mono" style="color:#78350f;font-weight:700;">${fmtNum(i.lockedPrice)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(i.qty * i.lockedPrice)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">Ongkir Tronton Net</div>
            <div class="mono" style="font-size:11px;font-weight:700;">${fmtIdr(PROJECT.freightNet)}</div>
            <div style="font-size:8.8px;color:#047857;">-400 rb bongkar DO</div>
          </div>
          <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
            <div style="font-size:9px;color:#78716c;">DPP + PPN 11%</div>
            <div class="mono" style="font-size:11px;font-weight:700;">${fmtIdr(LOAD_PPN)}</div>
            <div style="font-size:8.8px;color:#57534e;">CoreTax Auto-Queue</div>
          </div>
          <div style="padding:6px 8px;background:#fffbeb;border:1px solid #fcd34d;border-radius:3px;">
            <div style="font-size:9px;color:#92400e;font-weight:700;">Total Tagihan PO</div>
            <div class="mono" style="font-size:11px;font-weight:800;color:#78350f;">${fmtIdr(LOAD_GRAND_TOTAL)}</div>
            <div style="font-size:8.8px;color:#92400e;">TOP 30h · VA Mandiri</div>
          </div>
        </div>

        <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
          <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:5px;display:flex;justify-content:space-between;">
            <span>Log Revisi Penawaran (Audit Terstruktur)</span>
            <span class="mono" style="font-size:9.2px;color:#78716c;">5 peristiwa</span>
          </div>
          <div style="border:1px solid #e5dfd5;border-radius:4px;overflow:hidden;flex:1;display:flex;flex-direction:column;">
            ${revLogs
              .map(
                (l, idx) => `<div style="padding:6px 8px;border-bottom:${idx < revLogs.length - 1 ? '1px solid #efeae2' : '0'};background:${idx === 0 ? '#fffbeb' : '#ffffff'};">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:1.5px;">
                    <span style="font-size:10px;font-weight:700;color:#1c1917;" class="trunc">${esc(l.actor)}</span>
                    <span class="mono" style="font-size:9.2px;color:#78716c;flex-shrink:0;">${esc(l.time)}</span>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                    <span style="font-size:9.6px;color:#57534e;" class="trunc">${esc(l.note)}</span>
                    ${badge(l.delta, l.tone)}
                  </div>
                </div>`
              )
              .join('')}
          </div>
        </div>

        <div style="display:flex;gap:7px;padding-top:2px;">
          <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:27px;">${ic('check', 12, '#ffffff')} Konversi ke PO & Jadwal SJ</span>
          <span class="e-btn" style="height:27px;">${ic('download', 12, '#44403c')} PDF Quote</span>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeNav: 'rfq',
    breadcrumb: 'Antrean RFQ Instan & Negosiasi Principal',
    pageSubtitle: 'Negosiasi volume langsung ke tim sales pabrik dengan penguncian harga 24 jam dan validasi limit TOP',
    actionsHtml: `
      <span class="e-btn">${ic('filter', 12, '#44403c')} Filter Principal</span>
      <span class="e-btn e-btn-primary">${domainIcon('tag', 12, '#ffffff')} Buat RFQ Baru</span>
    `,
    contentHtml: `${topBar}${mainSplit}`,
  });
}

// ============================================================================
// PAGE 3: KALKULATOR TONASE TRUK & RENCANA MUAT ARMADA (ENGINEERING SURFACE)
// ============================================================================
function renderPage3() {
  const fleetTabs = [
    { name: 'Colt Diesel Engkel', cap: '4,0 ton · 3,1m', rate: 'Rp 780 rb', fit: 'Tidak Cukup', active: false },
    { name: 'Colt Diesel Double', cap: '8,0 ton · 4,2m', rate: 'Rp 1,25 jt', fit: 'Butuh 3 Unit', active: false },
    { name: 'Fuso Fighter 4x2', cap: '14,0 ton · 6,8m', rate: 'Rp 1,95 jt', fit: 'Butuh 2 Unit', active: false },
    { name: 'Fuso Tronton 6x4', cap: '20,0 ton · 9,2m', rate: 'Rp 2,20 jt net', fit: '92,0% OPTIMAL', active: true },
    { name: 'Wingbox Tronton', cap: '25,0 ton · 9,6m', rate: 'Rp 3,15 jt', fit: '73,6% (Lebih Mahal)', active: false },
  ];

  const fleetStrip = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;flex-shrink:0;">
    ${fleetTabs
      .map(
        (f) => `<div class="gb-fleet-tab ${f.active ? 'is-active' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
            <span style="font-size:11px;font-weight:700;color:${f.active ? '#78350f' : '#1c1917'};">${esc(f.name)}</span>
            ${f.active ? badge('AKTIF', 'accent') : `<span class="mono" style="font-size:9.2px;color:#78716c;">${esc(f.rate)}</span>`}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px;">
            <span class="mono" style="font-size:9.6px;color:#57534e;">${esc(f.cap)}</span>
            <span style="font-size:9.5px;font-weight:700;color:${f.active ? '#047857' : '#78716c'};">${esc(f.fit)}</span>
          </div>
        </div>`
      )
      .join('')}
  </div>`;

  // Precision CAD-style SVG Truck Blueprint (Side Elevation + Top-Down Flatbed + Axle Loads)
  const truckBlueprintSvg = `<svg viewBox="0 0 820 264" width="100%" height="264" style="display:block;">
    <rect x="0" y="0" width="820" height="264" fill="#faf8f5" rx="3" stroke="#e5dfd5" stroke-width="1"/>
    <!-- Subtle technical grid -->
    <g stroke="#ece6dc" stroke-width="0.7">
      <line x1="0" y1="40" x2="820" y2="40"/><line x1="0" y1="80" x2="820" y2="80"/>
      <line x1="0" y1="120" x2="820" y2="120"/><line x1="0" y1="160" x2="820" y2="160"/>
      <line x1="0" y1="200" x2="820" y2="200"/>
      <line x1="120" y1="0" x2="120" y2="264"/><line x1="260" y1="0" x2="260" y2="264"/>
      <line x1="400" y1="0" x2="400" y2="264"/><line x1="540" y1="0" x2="540" y2="264"/>
      <line x1="680" y1="0" x2="680" y2="264"/>
    </g>

    <!-- Title & Dimension Header -->
    <text x="14" y="18" font-size="10" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#78350f">TAMPAK SAMPING · FUSO TRONTON 6x4 (BAK 9,2m x 2,4m) · RAK BESI 12m OVERHANG LEGAL</text>
    <text x="806" y="18" text-anchor="end" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">CoG +0,14m · SEIMBANG · ZERO ODOL</text>

    <!-- Dimension Arrow for 9.2m Bed -->
    <line x1="206" y1="33" x2="774" y2="33" stroke="#78716c" stroke-width="1"/>
    <line x1="206" y1="28" x2="206" y2="38" stroke="#78716c" stroke-width="1"/>
    <line x1="774" y1="28" x2="774" y2="38" stroke="#78716c" stroke-width="1"/>
    <rect x="444" y="25" width="92" height="15" rx="2" fill="#ffffff" stroke="#d1c8ba"/>
    <text x="490" y="35.5" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">9.200 mm Bak</text>

    <!-- Truck Cab (Left) -->
    <path d="M46 154 L46 92 L92 66 L186 66 L186 154 Z" fill="#ffffff" stroke="#44403c" stroke-width="1.8"/>
    <path d="M56 96 L94 74 L132 74 L132 110 L56 110 Z" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.2"/>
    <rect x="142" y="74" width="34" height="36" rx="2" fill="#f4f1eb" stroke="#a8a29e" stroke-width="1"/>
    <rect x="46" y="132" width="140" height="14" fill="#b45309"/>
    <text x="116" y="142" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">B 9412 UXA</text>
    <!-- Cab Overhang Steel Rack for 12m Rebar -->
    <line x1="150" y1="66" x2="150" y2="48" stroke="#44403c" stroke-width="2"/>
    <line x1="186" y1="66" x2="186" y2="48" stroke="#44403c" stroke-width="2"/>
    <line x1="146" y1="48" x2="206" y2="48" stroke="#44403c" stroke-width="2"/>

    <!-- Chassis & Flatbed Deck -->
    <rect x="192" y="150" width="586" height="12" fill="#292524" rx="1"/>
    <rect x="42" y="154" width="150" height="8" fill="#44403c" rx="1"/>
    <!-- Steel Stanchions -->
    <rect x="204" y="54" width="4" height="96" fill="#57534e"/>
    <rect x="454" y="54" width="4" height="96" fill="#57534e"/>
    <rect x="770" y="54" width="4" height="96" fill="#57534e"/>

    <!-- CARGO BAY A: Besi Beton Ulir 13mm (12m bundel on lower rack extending forward onto cab rack) -->
    <rect x="148" y="124" width="622" height="24" rx="2" fill="#b45309" stroke="#78350f" stroke-width="1.3"/>
    <line x1="154" y1="132" x2="218" y2="132" stroke="#fef3c7" stroke-width="1" stroke-dasharray="5,3"/>
    <line x1="154" y1="140" x2="218" y2="140" stroke="#fef3c7" stroke-width="1" stroke-dasharray="5,3"/>
    <line x1="700" y1="132" x2="764" y2="132" stroke="#fef3c7" stroke-width="1" stroke-dasharray="5,3"/>
    <line x1="700" y1="140" x2="764" y2="140" stroke="#fef3c7" stroke-width="1" stroke-dasharray="5,3"/>
    <rect x="224" y="128" width="470" height="16" rx="2" fill="#78350f"/>
    <text x="459" y="139" text-anchor="middle" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fef3c7">BAY A · MAT-01 BESI ULIR 13mm (560 btg · 7,00 ton · Bongkar #4)</text>

    <!-- CARGO BAY B: Semen Portland 50kg (1 DO = 160 sak stacked on 4 pallets) -->
    <rect x="212" y="64" width="238" height="58" rx="2" fill="#57534e" stroke="#292524" stroke-width="1.3"/>
    <line x1="271" y1="64" x2="271" y2="122" stroke="#a8a29e" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="331" y1="64" x2="331" y2="122" stroke="#a8a29e" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="391" y1="64" x2="391" y2="122" stroke="#a8a29e" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="331" y="88" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">BAY B · MAT-02 SEMEN 50kg</text>
    <text x="331" y="103" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">1 DO = 160 sak · 8,00 ton (4 Palet)</text>

    <!-- CARGO BAY C: Papan Semen GRC Board 9mm (60 lembar flat pallet) -->
    <rect x="462" y="82" width="186" height="40" rx="2" fill="#0369a1" stroke="#0c4a6e" stroke-width="1.3"/>
    <line x1="468" y1="92" x2="642" y2="92" stroke="#bae6fd" stroke-width="0.8"/>
    <line x1="468" y1="102" x2="642" y2="102" stroke="#bae6fd" stroke-width="0.8"/>
    <line x1="468" y1="112" x2="642" y2="112" stroke="#bae6fd" stroke-width="0.8"/>
    <text x="555" y="99" text-anchor="middle" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">BAY C · MAT-03 GRC 9mm</text>
    <text x="555" y="113" text-anchor="middle" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#e0f2fe">60 lbr · 2,40 ton</text>

    <!-- CARGO BAY D: Baja Ringan Kanal C75 (200 btg top rear bundle, LIFO unload #1) -->
    <rect x="654" y="72" width="112" height="50" rx="2" fill="#047857" stroke="#064e3b" stroke-width="1.3"/>
    <text x="710" y="93" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">BAY D · C75</text>
    <text x="710" y="106" text-anchor="middle" font-size="8.6" font-family="ui-monospace,Consolas,monospace" fill="#d1fae5">200 btg · 1,00t</text>
    <text x="710" y="117" text-anchor="middle" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#a7f3d0">BONGKAR #1</text>

    <!-- Center of Gravity Marker (stops cleanly around Bay A label pill) -->
    <line x1="470" y1="48" x2="470" y2="124" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3,2"/>
    <line x1="470" y1="150" x2="470" y2="188" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3,2"/>
    <circle cx="470" cy="118" r="5" fill="#ffffff" stroke="#be123c" stroke-width="2"/>
    <circle cx="470" cy="118" r="2" fill="#be123c"/>
    <rect x="480" y="51" width="128" height="17" rx="2" fill="#fff1f2" stroke="#fecdd3"/>
    <text x="544" y="62.5" text-anchor="middle" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#be123c">Titik Berat CoG +0,14m</text>

    <!-- Wheels / 3 Axles -->
    <g>
      <!-- Front Axle -->
      <circle cx="118" cy="176" r="21" fill="#1c1917" stroke="#44403c" stroke-width="2"/>
      <circle cx="118" cy="176" r="9" fill="#d6d3d1"/>
      <circle cx="118" cy="176" r="3" fill="#44403c"/>
      <!-- Rear Tandem Axle 1 -->
      <circle cx="568" cy="176" r="21" fill="#1c1917" stroke="#44403c" stroke-width="2"/>
      <circle cx="568" cy="176" r="9" fill="#d6d3d1"/>
      <circle cx="568" cy="176" r="3" fill="#44403c"/>
      <!-- Rear Tandem Axle 2 -->
      <circle cx="654" cy="176" r="21" fill="#1c1917" stroke="#44403c" stroke-width="2"/>
      <circle cx="654" cy="176" r="9" fill="#d6d3d1"/>
      <circle cx="654" cy="176" r="3" fill="#44403c"/>
    </g>

    <!-- Road Baseline -->
    <line x1="20" y1="199" x2="800" y2="199" stroke="#78716c" stroke-width="1.5"/>

    <!-- Axle Load Callout Boxes (Spaced cleanly with zero text overlap) -->
    <rect x="20" y="208" width="182" height="46" rx="3" fill="#ffffff" stroke="#d1c8ba"/>
    <text x="30" y="222" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#44403c">SUMBU 1 (DEPAN)</text>
    <text x="192" y="222" text-anchor="end" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">4,60 / 6,00t</text>
    <rect x="30" y="230" width="162" height="6" rx="2" fill="#e5dfd5"/>
    <rect x="30" y="230" width="124" height="6" rx="2" fill="#047857"/>
    <text x="30" y="248" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#78716c">Utilisasi 76,7% · Aman</text>

    <!-- Summary Center Pill -->
    <rect x="212" y="208" width="212" height="46" rx="3" fill="#fffbeb" stroke="#f59e0b"/>
    <text x="318" y="223" text-anchor="middle" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#92400e">GVW (MUATAN + BERAT KOSONG)</text>
    <text x="318" y="242" text-anchor="middle" font-size="10.2" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#78350f">18,40 + 7,60 = 26,00t / 27,60t</text>

    <rect x="434" y="208" width="182" height="46" rx="3" fill="#ffffff" stroke="#d1c8ba"/>
    <text x="444" y="222" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#44403c">SUMBU 2 (TANDEM A)</text>
    <text x="606" y="222" text-anchor="end" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#b45309">6,95 / 7,50t</text>
    <rect x="444" y="230" width="162" height="6" rx="2" fill="#e5dfd5"/>
    <rect x="444" y="230" width="150" height="6" rx="2" fill="#b45309"/>
    <text x="444" y="248" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#78716c">Utilisasi 92,7% · Optimal</text>

    <rect x="626" y="208" width="182" height="46" rx="3" fill="#ffffff" stroke="#d1c8ba"/>
    <text x="636" y="222" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#44403c">SUMBU 3 (TANDEM B)</text>
    <text x="798" y="222" text-anchor="end" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#b45309">6,85 / 7,50t</text>
    <rect x="636" y="230" width="162" height="6" rx="2" fill="#e5dfd5"/>
    <rect x="636" y="230" width="148" height="6" rx="2" fill="#b45309"/>
    <text x="636" y="248" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#78716c">Utilisasi 91,3% · Optimal</text>
  </svg>`;

  // Milk-Run Multi-Depot Route Diagram SVG (Right Top)
  const routeSvg = `<svg viewBox="0 0 470 124" width="100%" height="124" style="display:block;">
    <rect x="0" y="0" width="470" height="124" fill="#faf8f5" rx="3" stroke="#e5dfd5"/>
    <!-- Corridor Line -->
    <line x1="48" y1="48" x2="422" y2="48" stroke="#d1c8ba" stroke-width="4"/>
    <line x1="48" y1="48" x2="422" y2="48" stroke="#b45309" stroke-width="2" stroke-dasharray="6,4"/>

    <!-- Node 1: Cilegon -->
    <circle cx="48" cy="48" r="10" fill="#b45309"/>
    <text x="48" y="51.5" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">1</text>
    <text x="48" y="25" text-anchor="middle" font-size="8.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#1c1917">Cilegon</text>
    <text x="48" y="74" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#78350f">+7,00t Besi</text>
    <text x="48" y="88" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#78716c">05:30 WIB</text>

    <!-- Node 2: Narogong -->
    <circle cx="172" cy="48" r="10" fill="#57534e"/>
    <text x="172" y="51.5" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">2</text>
    <text x="172" y="25" text-anchor="middle" font-size="8.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#1c1917">Narogong</text>
    <text x="172" y="74" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#44403c">+8,00t Semen</text>
    <text x="172" y="88" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#78716c">09:15 WIB</text>

    <!-- Node 3: Bekasi -->
    <circle cx="296" cy="48" r="10" fill="#0369a1"/>
    <text x="296" y="51.5" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">3</text>
    <text x="296" y="25" text-anchor="middle" font-size="8.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#1c1917">Bekasi/Krw</text>
    <text x="296" y="74" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#0369a1">+3,40t GRC/C75</text>
    <text x="296" y="88" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#78716c">11:40 WIB</text>

    <!-- Node 4: Site Karawang Timur -->
    <circle cx="422" cy="48" r="11" fill="#047857"/>
    <text x="422" y="51.5" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">S</text>
    <text x="422" y="25" text-anchor="middle" font-size="8.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#047857">Site Karawang</text>
    <text x="422" y="74" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">18,40t Bongkar</text>
    <text x="422" y="88" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#047857">ETA 14:15 WIB</text>

    <!-- Distance footer -->
    <rect x="14" y="100" width="442" height="17" rx="2" fill="#ffffff" stroke="#e5dfd5"/>
    <text x="235" y="111.5" text-anchor="middle" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#44403c">Total Koridor Tol JORR-Cikampek: 164 km · Zona Tarif Kontrak: Zona 2 Karawang Timur</text>
  </svg>`;

  const odolChecks = [
    { rule: 'Berat Bruto Kendaraan (GVW vs JBI Kemenhub)', val: '26,00 t / 27,60 t', status: 'Lulus', tone: 'ok' },
    { rule: 'Beban Sumbu Terberat (MST Jalan Kelas I)', val: '6,95 t / 8,00 t', status: 'Lulus', tone: 'ok' },
    { rule: 'Tinggi Muatan Maksimal (Batas Portal Tol)', val: '3,45 m / 4,20 m', status: 'Lulus', tone: 'ok' },
    { rule: 'Overhang Besi 12m (Rak Depan + Bendera Merah)', val: '1,40 m (Depan)', status: 'Terpasang', tone: 'ok' },
    { rule: 'Proteksi Hujan Semen & GRC (Terpal Ganda)', val: 'Terpal 2 Lapis', status: 'Terverifikasi', tone: 'ok' },
    { rule: 'Urutan Bongkar LIFO (Ringan di Atas/Belakang)', val: 'C75 -> GRC -> DO -> D13', status: 'Optimal', tone: 'accent' },
  ];

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.68fr 1fr;gap:9px;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1.12;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('truck', 13, '#b45309')}
            <span>Blueprint Distribusi Muatan & Beban Sumbu · Fuso Tronton 6x4</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            ${badge('18,40 / 20,00 ton (92%)', 'accent')}
            ${badge('Anti-ODOL PASS', 'ok')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          ${truckBlueprintSvg}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;">
            ${LOAD_PLAN_ITEMS.map((item) => {
              const ton = (item.qty * item.unitKg) / 1000;
              const share = (ton / LOAD_TOTAL_TON) * 100;
              return `<div style="padding:5px 8px;border:1px solid #e5dfd5;border-left:3px solid ${item.bayColor};border-radius:3px;background:#ffffff;">
                <div style="font-size:9.2px;font-weight:700;color:#1c1917;" class="trunc">${esc(item.bay)}</div>
                <div class="mono" style="font-size:10.5px;font-weight:700;color:${item.bayColor};">${ton.toFixed(2).replace('.', ',')} ton <span style="font-size:9px;color:#78716c;font-weight:500;">(${share.toFixed(1).replace('.', ',')}%)</span></div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0.88;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('scale', 13, '#b45309')}
            <span>Manifest Tonase & Alokasi Biaya Angkut Zona Karawang Timur</span>
          </div>
          <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">Rp 119,6/kg (vs Rp 265/kg LTL)</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:66px;">Kode</th>
                <th style="width:205px;">Material & Kemasan</th>
                <th class="num" style="width:72px;">Qty</th>
                <th class="num" style="width:68px;">Berat/U</th>
                <th class="num" style="width:74px;">Total Ton</th>
                <th class="num" style="width:62px;">% Bak</th>
                <th style="width:78px;">Bongkar</th>
                <th class="num" style="width:94px;">Alokasi Ongkir</th>
              </tr>
            </thead>
            <tbody>
              ${LOAD_PLAN_ITEMS.map((item) => {
                const ton = (item.qty * item.unitKg) / 1000;
                const capShare = (ton / PROJECT.truckCapTon) * 100;
                return `<tr>
                  <td class="mono" style="font-weight:700;color:#78350f;">${esc(item.code)}</td>
                  <td class="trunc" style="font-weight:600;">${esc(item.title)}</td>
                  <td class="num mono">${fmtNum(item.qty)} ${item.unit}</td>
                  <td class="num mono">${item.unitKg.toFixed(1).replace('.', ',')} kg</td>
                  <td class="num mono" style="font-weight:700;">${ton.toFixed(2).replace('.', ',')} t</td>
                  <td class="num mono">${capShare.toFixed(1).replace('.', ',')}%</td>
                  <td>${badge(`Urutan #${item.unloadOrder}`, item.unloadOrder === 1 ? 'ok' : 'neutral')}</td>
                  <td class="num mono">${fmtIdr(item.freightAlloc)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total Muatan Fuso Tronton (Potongan Bongkar DO Semen -Rp 400.000)</td>
                <td class="num mono">${LOAD_TOTAL_TON.toFixed(2).replace('.', ',')} t</td>
                <td class="num mono" style="color:#047857;">${LOAD_UTIL_PCT.toFixed(1).replace('.', ',')}%</td>
                <td>LIFO OK</td>
                <td class="num mono">${fmtIdr(LOAD_FREIGHT_ALLOC_SUM)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px solid #efeae2;">
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="display:flex;justify-content:space-between;font-size:9.3px;margin-bottom:4px;">
                <span style="color:#57534e;font-weight:600;">LTL Parsial 50% (10 ton)</span>
                <span class="mono" style="color:#78716c;font-weight:700;">Rp 265 / kg</span>
              </div>
              <div style="height:6px;background:#e5dfd5;border-radius:2px;"><div style="width:100%;height:100%;background:#a8a29e;"></div></div>
            </div>
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="display:flex;justify-content:space-between;font-size:9.3px;margin-bottom:4px;">
                <span style="color:#57534e;font-weight:600;">FTL Standar 75% (15 ton)</span>
                <span class="mono" style="color:#b45309;font-weight:700;">Rp 168 / kg</span>
              </div>
              <div style="height:6px;background:#e5dfd5;border-radius:2px;"><div style="width:63%;height:100%;background:#d97706;"></div></div>
            </div>
            <div style="padding:6px 8px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
              <div style="display:flex;justify-content:space-between;font-size:9.3px;margin-bottom:4px;">
                <span style="color:#065f46;font-weight:700;">FTL Optimal 92% (18,4t Aktif)</span>
                <span class="mono" style="color:#047857;font-weight:800;">Rp 119,6 / kg</span>
              </div>
              <div style="height:6px;background:#d1fae5;border-radius:2px;"><div style="width:45%;height:100%;background:#047857;"></div></div>
            </div>
          </div>
          <div style="padding:8px 11px;background:#faf8f5;border-top:1px solid #e5dfd5;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:auto;">
            <div style="font-size:9.5px;"><span style="color:#78716c;">Zona 1 Jabodetabek:</span> <strong class="mono">Rp 1,85 jt</strong></div>
            <div style="font-size:9.5px;"><span style="color:#92400e;font-weight:700;">Zona 2 Karawang (Aktif):</span> <strong class="mono" style="color:#78350f;">Rp 2,20 jt</strong></div>
            <div style="font-size:9.5px;"><span style="color:#78716c;">Zona 3 Purwakarta:</span> <strong class="mono">Rp 2,75 jt</strong></div>
            <div style="font-size:9.5px;"><span style="color:#78716c;">Zona 4 Bandung Raya:</span> <strong class="mono">Rp 3,60 jt</strong></div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1.05;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('mapPin', 13, '#b45309')}
            <span>Rute Milk-Run Multi-Depot & Jembatan Timbang</span>
          </div>
          ${badge('3 Titik Muat', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          ${routeSvg}
          <table class="e-table" style="border:1px solid #e5dfd5;">
            <thead>
              <tr>
                <th style="width:96px;">Titik Muat</th>
                <th style="width:128px;">Muatan & DO</th>
                <th class="num" style="width:66px;">Kumulatif</th>
                <th style="width:72px;">Gate Pass</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:600;">1. Cilegon</td>
                <td class="trunc">MAT-01 Besi D13 (560 btg)</td>
                <td class="num mono">7,00 ton</td>
                <td>${badge('GP-914A', 'ok')}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">2. Narogong</td>
                <td class="trunc">MAT-02 Semen (1 DO)</td>
                <td class="num mono">15,00 ton</td>
                <td>${badge('DO-4418', 'ok')}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">3. Bekasi/Krw</td>
                <td class="trunc">MAT-03 GRC + MAT-04 C75</td>
                <td class="num mono" style="font-weight:700;">18,40 ton</td>
                <td>${badge('GP-221C', 'warn')}</td>
              </tr>
              <tr class="is-selected">
                <td style="font-weight:700;color:#78350f;">4. Site Proyek</td>
                <td class="trunc" style="font-weight:700;">Gudang Karawang Bay 2</td>
                <td class="num mono" style="font-weight:700;color:#047857;">Bongkar</td>
                <td>${badge('14:15 WIB', 'accent')}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="font-size:9px;color:#78716c;">Armada & KIR Kemenhub</div>
              <div class="mono" style="font-size:10px;font-weight:700;color:#1c1917;">B 9412 UXA · KIR Aktif 2027</div>
            </div>
            <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;">
              <div style="font-size:9px;color:#78716c;">Pengemudi & Pelacakan GPS</div>
              <div style="font-size:10px;font-weight:700;color:#047857;">Slamet Riyadi · SIM B2 · Live</div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:0.95;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('shield', 13, '#047857')}
            <span>Validasi Keselamatan & Anti-ODOL Kemenhub</span>
          </div>
          ${badge('6 / 6 Lulus', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${odolChecks
              .map(
                (c) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px;background:#faf8f5;border:1px solid #efeae2;border-radius:3px;">
                  <div style="min-width:0;">
                    <div style="font-size:10px;font-weight:600;color:#1c1917;" class="trunc">${esc(c.rule)}</div>
                    <div class="mono" style="font-size:9.3px;color:#57534e;">${esc(c.val)}</div>
                  </div>
                  ${badge(c.status, c.tone)}
                </div>`
              )
              .join('')}
          </div>
          <div style="display:flex;gap:7px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:26px;">${ic('check', 12, '#ffffff')} Kunci Rencana Muat & Cetak SJ</span>
            <span class="e-btn" style="height:26px;">${ic('refresh', 12, '#44403c')} Optimasi Ulang</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeNav: 'tonase',
    breadcrumb: 'Kalkulator Tonase Truk & Rencana Muat Armada',
    pageSubtitle: 'Optimasi kapasitas Fuso Tronton 20 ton, distribusi beban sumbu anti-ODOL, dan konsolidasi multi-depot',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#44403c')} Unduh Manifest Load Plan</span>
      <span class="e-btn e-btn-primary">${domainIcon('truck', 12, '#ffffff')} Dispatch Armada B 9412 UXA</span>
    `,
    contentHtml: `${fleetStrip}${mainSplit}`,
  });
}

// ============================================================================
// PAGE 4: MANAJEMEN KREDIT TOP, GIRO/VA & E-FAKTUR CORETAX (FINANCIAL CONSOLE)
// ============================================================================
function renderPage4() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Plafon Kredit TOP 30 Hari</span>${badge('Grade A', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Rp 850 jt</span><span class="mono" style="font-size:10px;color:#57534e;">TOP 30/45h</span></div>
      <div class="e-kpi-foot"><span>Skor kolektibilitas: Lancar (0 hari telat)</span><span class="mono">PT WGK</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kredit Terpakai (5 Tagihan)</span>${badge('40,0%', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Rp 340 jt</span>${svgSparkline({ points: [280, 310, 395, 360, 340, 340], width: 62, height: 20, color: '#0369a1' })}</div>
      <div class="e-kpi-foot"><span>3 SNAP VA · 2 Bilyet Giro mundur</span><span class="mono">5 Inv</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Sisa Limit Tersedia</span>${badge('Aman', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">Rp 510 jt</span><span class="mono" style="font-size:10.5px;color:#047857;font-weight:700;">60,0%</span></div>
      <div class="e-kpi-foot"><span>Setelah PO #1142: Rp 392,70 jt</span><span class="mono">Cukup</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Jatuh Tempo &le; 7 Hari</span>${badge('2 Tagihan', 'bad')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">Rp 118,45 jt</span><span class="mono" style="font-size:10px;color:#be123c;font-weight:700;">H-4 &amp; H-6</span></div>
      <div class="e-kpi-foot"><span>Giro BG-882914 + VA Mandiri</span><span class="mono">26–28 Nov</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kepatuhan e-Faktur CoreTax</span>${badge('PPN 11%', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">10 / 10 Valid</span><span class="mono" style="font-size:10px;color:#78350f;font-weight:700;">+1 Antre</span></div>
      <div class="e-kpi-foot"><span>Lunas 30h: ${fmtIdr(PAID_TOTAL)}</span><span class="mono">XML DJP</span></div>
    </div>
  </div>`;

  const maturityChart = svgStackedBarChart({
    width: 750,
    height: 192,
    categories: ['M1 (23-29 Nov)', 'M2 (30-06 Des)', 'M3 (07-13 Des)', 'M4 (14-20 Des)', 'M5 (21-27 Des)', 'M6 (28-03 Jan)'],
    yMax: 160,
    yFormat: (v) => `${Math.round(v)} jt`,
    series: [
      { label: 'SNAP VA Mandiri / BCA', color: '#b45309', values: [46.45, 0, 84.0, 68.55, 117.3, 42.0] },
      { label: 'Kliring Bilyet Giro', color: '#0369a1', values: [72.0, 0, 0, 69.0, 0, 0] },
      { label: 'Proyeksi RFQ Baru', color: '#a8a29e', values: [0, 24.4, 36.5, 0, 19.6, 58.8] },
    ],
  });

  const middleRow = `<div style="height:294px;flex-shrink:0;display:grid;grid-template-columns:1.42fr 1fr;gap:9px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('activity', 13, '#b45309')}
          <span>Jadwal Jatuh Tempo Kredit TOP & Kliring Giro (6 Minggu)</span>
        </div>
        <span class="mono" style="font-size:9.8px;color:#57534e;">Puncak M1: Rp 118,45 jt · M4: Rp 137,55 jt</span>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
        ${maturityChart}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding-top:6px;border-top:1px solid #efeae2;">
          <div style="font-size:9.8px;color:#44403c;">
            <span style="color:#78716c;">Total Open SNAP VA:</span>
            <strong class="mono" style="margin-left:4px;">Rp 199,00 jt</strong>
          </div>
          <div style="font-size:9.8px;color:#44403c;">
            <span style="color:#78716c;">Total Open Giro:</span>
            <strong class="mono" style="margin-left:4px;">Rp 141,00 jt</strong>
          </div>
          <div style="font-size:9.8px;color:#047857;text-align:right;">
            <span>Puncak Eksposur:</span>
            <strong class="mono" style="margin-left:4px;">53,8% Plafon</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${domainIcon('creditCard', 13, '#b45309')}
          <span>Kanal Pembayaran SNAP VA, Giro & CoreTax</span>
        </div>
        ${badge('Auto-Reconcile', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:10.2px;font-weight:700;color:#1c1917;">SNAP VA Bank Mandiri (Corporate)</div>
              <div class="mono" style="font-size:10px;color:#78350f;font-weight:700;">88908 0914 8273 1041</div>
            </div>
            <div style="text-align:right;">
              ${badge('SLA < 18 dtk', 'ok')}
              <div style="font-size:8.8px;color:#78716c;margin-top:2px;">Limit restore instan</div>
            </div>
          </div>
          <div style="padding:6px 8px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:10.2px;font-weight:700;color:#1c1917;">SNAP VA Bank BCA (B2B Direct)</div>
              <div class="mono" style="font-size:10px;color:#0369a1;font-weight:700;">11204 0914 8273 1041</div>
            </div>
            <div style="text-align:right;">
              ${badge('Terhubung', 'info')}
              <div style="font-size:8.8px;color:#78716c;margin-top:2px;">BI-SNAP v2.1 OAuth</div>
            </div>
          </div>
          <div style="padding:6px 8px;background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:10.2px;font-weight:700;color:#9f1239;">Bilyet Giro Mundur Terdaftar (2 Lembar)</div>
              <div class="mono" style="font-size:9.6px;color:#be123c;">BG-882914 (26 Nov · 72 jt) · BG-882941 (14 Des · 69 jt)</div>
            </div>
            ${badge('SKNBI', 'bad')}
          </div>
        </div>

        <div style="padding:7px 8px;background:#fffbeb;border:1px solid #fcd34d;border-radius:3px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:10px;font-weight:700;color:#78350f;">Antrean Otomatis e-Faktur CoreTax XML</div>
            <div style="font-size:9.3px;color:#92400e;">DRF-2026-1142 (PPN Rp 11.623.920) siap terbit NSFP</div>
          </div>
          <span class="e-btn e-btn-primary" style="height:23px;">Upload XML</span>
        </div>
      </div>
    </div>
  </div>`;

  const ledgerTable = `<div class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${domainIcon('receipt', 13, '#b45309')}
        <span>Buku Besar Tagihan TOP 30 Hari, Bilyet Giro & Faktur Pajak PPN 11%</span>
      </div>
      <div style="display:flex;gap:5px;align-items:center;">
        <span class="gb-chip is-on">Semua (11)</span>
        <span class="gb-chip">Aktif TOP (5)</span>
        <span class="gb-chip">Antre CoreTax (1)</span>
        <span class="gb-chip">Lunas (5)</span>
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:102px;">No. Invoice</th>
            <th style="width:118px;">No. Surat Jalan</th>
            <th style="width:146px;">Principal</th>
            <th style="width:74px;">Terbit</th>
            <th style="width:76px;">Jatuh Tempo</th>
            <th style="width:114px;">Kanal Bayar</th>
            <th class="num" style="width:100px;">DPP (Rp)</th>
            <th class="num" style="width:90px;">PPN 11%</th>
            <th class="num" style="width:104px;">Total Tagihan</th>
            <th style="width:146px;">NSFP e-Faktur CoreTax</th>
            <th style="width:82px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${INVOICES.map(
            (inv) => `<tr class="${inv.selected ? 'is-selected' : inv.warn ? 'is-warn' : ''}">
              <td class="mono" style="font-weight:700;color:${inv.selected ? '#78350f' : '#1c1917'};">${esc(inv.no)}</td>
              <td class="mono" style="font-size:10px;color:#57534e;">${esc(inv.sj)}</td>
              <td class="trunc">${esc(inv.principal)}</td>
              <td class="mono" style="font-size:10px;">${esc(inv.issued)}</td>
              <td class="mono" style="font-size:10px;font-weight:${inv.warn ? '700' : '500'};color:${inv.warn ? '#be123c' : '#1c1917'};">${esc(inv.due)}</td>
              <td class="trunc" style="font-size:10px;">${esc(inv.method)}</td>
              <td class="num mono">${fmtIdr(inv.dpp)}</td>
              <td class="num mono" style="color:#57534e;">${fmtIdr(inv.ppn)}</td>
              <td class="num mono" style="font-weight:700;">${fmtIdr(inv.total)}</td>
              <td class="mono" style="font-size:9.6px;color:${inv.state === 'queued' ? '#b45309' : '#44403c'};font-weight:${inv.state === 'queued' ? '700' : '500'};">${esc(inv.nsfp)}</td>
              <td>${badge(inv.status, inv.tone)}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6">Rekonsiliasi Kredit TOP: 5 Tagihan Aktif = Rp 340.000.000 · Sisa Limit = Rp 510.000.000 · 5 Lunas = ${fmtIdr(PAID_TOTAL)}</td>
            <td class="num mono">${fmtIdr(OPEN_INVOICES.reduce((a, i) => a + i.dpp, 0))}</td>
            <td class="num mono">${fmtIdr(OPEN_INVOICES.reduce((a, i) => a + i.ppn, 0))}</td>
            <td class="num mono" style="color:#78350f;">${fmtIdr(OPEN_TOTAL)}</td>
            <td colspan="2" class="num mono" style="color:#047857;">Open Balance Terverifikasi</td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top:auto;padding:7px 11px;background:#faf8f5;border-top:1px solid #e5dfd5;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#57534e;">
        <span><strong style="color:#1c1917;">Status Rekonsiliasi Otomatis:</strong> BI-SNAP v2.1 (100% cocok) · CoreTax DJP XML v2.4 (0 penolakan) · Kolektibilitas TOP: Lancar (0 hari telat).</span>
        <span class="mono" style="color:#047857;font-weight:700;">SHA-256 Ledger Sync: 14:19 WIB</span>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeNav: 'kredit',
    breadcrumb: 'Manajemen Kredit TOP, Giro/VA & e-Faktur CoreTax',
    pageSubtitle: 'Kontrol plafon kredit TOP 30 hari, rekonsiliasi SNAP VA otomatis, jadwal kliring giro, dan faktur pajak PPN 11%',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#44403c')} Ekspor CoreTax XML</span>
      <span class="e-btn e-btn-primary">${domainIcon('creditCard', 12, '#ffffff')} Bayar via SNAP VA</span>
    `,
    contentHtml: `${kpiStrip}${middleRow}${ledgerTable}`,
  });
}

// ============================================================================
// PAGE 5: SURAT JALAN DIGITAL & BUKTI TERIMA MANDOR (FIELD VERIFICATION PORTAL)
// ============================================================================
function renderPage5() {
  const stepperPanel = `<div class="e-panel" style="flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${domainIcon('clipboard', 13, '#b45309')}
        <span>Pelacakan Real-Time · SJ-KRW-2026-0891 (PO-2026-1142 · Fuso Tronton B 9412 UXA)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="mono" style="font-size:10px;color:#57534e;">Timbang Depot: <strong>18,40 t</strong> · Timbang Site: <strong>18,38 t</strong> (-0,11% OK)</span>
        ${badge('SJ Diteken Mandor', 'ok')}
      </div>
    </div>
    <div class="e-panel-body" style="padding:8px 10px;">
      <div class="gb-stepper">
        <div class="gb-step is-done">
          <span class="gb-step-num" style="background:#047857;color:#fff;">1</span>
          <div style="min-width:0;">
            <div style="font-size:10.2px;font-weight:700;color:#065f46;">PO & DO Principal</div>
            <div class="mono" style="font-size:9px;color:#047857;">05:10 WIB · 4 Pabrik OK</div>
          </div>
        </div>
        <div class="gb-step is-done">
          <span class="gb-step-num" style="background:#047857;color:#fff;">2</span>
          <div style="min-width:0;">
            <div style="font-size:10.2px;font-weight:700;color:#065f46;">Timbang & Segel Muat</div>
            <div class="mono" style="font-size:9px;color:#047857;">11:48 WIB · 18,40 ton</div>
          </div>
        </div>
        <div class="gb-step is-done">
          <span class="gb-step-num" style="background:#047857;color:#fff;">3</span>
          <div style="min-width:0;">
            <div style="font-size:10.2px;font-weight:700;color:#065f46;">Transit Tol Cikampek</div>
            <div class="mono" style="font-size:9px;color:#047857;">13:32 WIB · GPS Terkunci</div>
          </div>
        </div>
        <div class="gb-step is-done">
          <span class="gb-step-num" style="background:#047857;color:#fff;">4</span>
          <div style="min-width:0;">
            <div style="font-size:10.2px;font-weight:700;color:#065f46;">Foto & Tanda Mandor</div>
            <div class="mono" style="font-size:9px;color:#047857;">14:18 WIB · Dedi Supriadi</div>
          </div>
        </div>
        <div class="gb-step is-current">
          <span class="gb-step-num" style="background:#b45309;color:#fff;">5</span>
          <div style="min-width:0;">
            <div style="font-size:10.2px;font-weight:700;color:#78350f;">e-Faktur CoreTax 11%</div>
            <div class="mono" style="font-size:9px;color:#92400e;">14:18:16 · Antre NSFP</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  // Crisp Technical Field Photo-Proof Viewport SVG (Mandor App Unloading Proof)
  const fieldPhotoSvg = `<svg viewBox="0 0 490 198" width="100%" height="198" style="display:block;">
    <rect x="0" y="0" width="490" height="198" rx="3" fill="#1c1917"/>
    <!-- Stylized Architectural Site Yard Scene (Warehouse Bay 2 + Flatbed + Material Stacks) -->
    <rect x="6" y="6" width="478" height="154" rx="2" fill="#e7e2d8"/>
    <!-- Sky & Warehouse Roof -->
    <rect x="6" y="6" width="478" height="62" fill="#d6d0c4"/>
    <polygon points="24,68 180,26 336,68" fill="#57534e" stroke="#292524" stroke-width="1.2"/>
    <rect x="34" y="68" width="292" height="58" fill="#a8a29e" stroke="#57534e" stroke-width="1"/>
    <!-- Warehouse Bay Doors -->
    <rect x="52" y="78" width="76" height="48" fill="#44403c"/>
    <text x="90" y="96" text-anchor="middle" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fef3c7">BAY 2 · BONGKAR</text>
    <rect x="148" y="78" width="76" height="48" fill="#57534e"/>
    <rect x="244" y="78" width="66" height="48" fill="#57534e"/>
    <!-- Concrete Yard Ground -->
    <rect x="6" y="126" width="478" height="34" fill="#c7bfb2"/>
    <line x1="6" y1="126" x2="484" y2="126" stroke="#78716c" stroke-width="1"/>

    <!-- Unloaded Material Stack 1: Rebar Bundles (MAT-01) -->
    <g transform="translate(26,114)">
      <rect x="0" y="16" width="146" height="20" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1"/>
      <line x1="6" y1="22" x2="140" y2="22" stroke="#f59e0b" stroke-width="1.2"/>
      <line x1="6" y1="27" x2="140" y2="27" stroke="#f59e0b" stroke-width="1.2"/>
      <line x1="6" y1="32" x2="140" y2="32" stroke="#f59e0b" stroke-width="1.2"/>
      <!-- Detection Bounding Box -->
      <rect x="-4" y="12" width="154" height="28" fill="none" stroke="#10b981" stroke-width="1.4" stroke-dasharray="4,2"/>
      <rect x="-4" y="-3" width="128" height="14" rx="1.5" fill="#065f46"/>
      <text x="2" y="7" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ecfdf5">MAT-01 · 560 btg SNI OK</text>
    </g>

    <!-- Unloaded Material Stack 2: Cement Pallets (MAT-02) -->
    <g transform="translate(194,94)">
      <rect x="0" y="16" width="96" height="40" rx="1" fill="#57534e" stroke="#292524" stroke-width="1"/>
      <line x1="0" y1="26" x2="96" y2="26" stroke="#a8a29e" stroke-width="0.9"/>
      <line x1="0" y1="36" x2="96" y2="36" stroke="#a8a29e" stroke-width="0.9"/>
      <line x1="0" y1="46" x2="96" y2="46" stroke="#a8a29e" stroke-width="0.9"/>
      <line x1="32" y1="16" x2="32" y2="56" stroke="#a8a29e" stroke-width="0.9"/>
      <line x1="64" y1="16" x2="64" y2="56" stroke="#a8a29e" stroke-width="0.9"/>
      <rect x="0" y="56" width="96" height="4" fill="#92400e"/>
      <!-- Detection Bounding Box -->
      <rect x="-4" y="12" width="104" height="50" fill="none" stroke="#10b981" stroke-width="1.4" stroke-dasharray="4,2"/>
      <rect x="-4" y="-3" width="114" height="14" rx="1.5" fill="#065f46"/>
      <text x="2" y="7" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ecfdf5">MAT-02 · 160 sak DO OK</text>
    </g>

    <!-- Parked Fuso Tronton Rear Silhouette (Right) -->
    <g transform="translate(324,70)">
      <rect x="0" y="16" width="144" height="54" rx="2" fill="#ffffff" stroke="#44403c" stroke-width="1.4"/>
      <rect x="8" y="24" width="128" height="22" fill="#0369a1" fill-opacity="0.2" stroke="#0369a1" stroke-width="1"/>
      <text x="72" y="38" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#0c4a6e">GRC 60 + C75 200 OK</text>
      <rect x="0" y="66" width="144" height="8" fill="#292524"/>
      <circle cx="34" cy="80" r="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5"/>
      <circle cx="108" cy="80" r="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5"/>
      <rect x="82" y="50" width="54" height="13" rx="1" fill="#b45309"/>
      <text x="109" y="59.5" text-anchor="middle" font-size="7.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fff">B 9412 UXA</text>
    </g>

    <!-- Top-Right EXIF Verified Pill -->
    <rect x="336" y="14" width="140" height="18" rx="2" fill="#064e3b" stroke="#10b981"/>
    <text x="406" y="26" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#a7f3d0">EXIF + GPS ANTI-SPOOF OK</text>

    <!-- Bottom Telemetry Watermark Bar -->
    <text x="14" y="176" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fef3c7">GPS -6.32284, 107.33758 · Karawang Timur (Akurasi 3,8m)</text>
    <text x="476" y="176" text-anchor="end" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#a7f3d0">22 NOV 2026 14:18:04 WIB</text>
    <text x="14" y="191" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">Perangkat: Android MandorApp v4.2 · SHA-256: 7e91c4a0f82d...b619</text>
    <text x="476" y="191" text-anchor="end" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#d6d3d1">4 / 4 Foto Segel Terunggah</text>
  </svg>`;

  const auditEvents = [
    { ts: '14:18:16', svc: 'CoreTax Bridge', event: 'Draft e-Faktur XML PPN 11% (Rp 11.623.920) masuk antrean NSFP', hash: 'xml_c91a4e', tone: 'accent', badgeTxt: 'Antre DJP' },
    { ts: '14:18:09', svc: 'ERP Principal', event: 'POD diterima · 4 pabrik sinkronisasi status DO Terkirim', hash: 'erp_4b821d', tone: 'ok', badgeTxt: '200 OK' },
    { ts: '14:18:04', svc: 'MandorApp Field', event: 'Dedi Supriadi menandatangani SJ-KRW-2026-0891 + 4 foto EXIF', hash: 'pod_7e91c4', tone: 'ok', badgeTxt: 'WORM Lock' },
    { ts: '13:36:22', svc: 'Timbang Site', event: 'Bruto 25,98t - Tara 7,60t = Netto 18,38t (selisih -0,11% aman)', hash: 'wb_18380k', tone: 'info', badgeTxt: 'Toleransi OK' },
    { ts: '11:48:11', svc: 'Depot Bekasi', event: 'Segel terpal ganda & rantai pengikat besi 12m terverifikasi', hash: 'sgl_9042a', tone: 'ok', badgeTxt: 'Segel Utuh' },
    { ts: '05:32:18', svc: 'Pabrik Cilegon', event: 'Gate-Out MAT-01 Besi Ulir 13mm SNI 560 btg (7,00 ton) selesai', hash: 'do_ks881a', tone: 'ok', badgeTxt: 'Gate-Out' },
  ];

  // QR SVG compact
  const qrSvg = `<svg viewBox="0 0 42 42" width="42" height="42" style="display:block;flex-shrink:0;">
    <rect x="0" y="0" width="42" height="42" fill="#ffffff" stroke="#d1c8ba"/>
    <rect x="4" y="4" width="11" height="11" fill="#1c1917"/><rect x="6" y="6" width="7" height="7" fill="#fff"/><rect x="8" y="8" width="3" height="3" fill="#1c1917"/>
    <rect x="27" y="4" width="11" height="11" fill="#1c1917"/><rect x="29" y="6" width="7" height="7" fill="#fff"/><rect x="31" y="8" width="3" height="3" fill="#1c1917"/>
    <rect x="4" y="27" width="11" height="11" fill="#1c1917"/><rect x="6" y="29" width="7" height="7" fill="#fff"/><rect x="8" y="31" width="3" height="3" fill="#1c1917"/>
    <rect x="18" y="5" width="3" height="3" fill="#1c1917"/><rect x="22" y="9" width="3" height="3" fill="#1c1917"/>
    <rect x="18" y="15" width="6" height="3" fill="#1c1917"/><rect x="8" y="18" width="4" height="4" fill="#1c1917"/>
    <rect x="18" y="21" width="4" height="4" fill="#b45309"/><rect x="26" y="18" width="5" height="3" fill="#1c1917"/>
    <rect x="34" y="19" width="4" height="6" fill="#1c1917"/><rect x="19" y="29" width="5" height="4" fill="#1c1917"/>
    <rect x="27" y="27" width="4" height="4" fill="#1c1917"/><rect x="33" y="32" width="5" height="5" fill="#1c1917"/>
    <rect x="26" y="34" width="4" height="3" fill="#1c1917"/>
  </svg>`;

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1.52fr 1fr;gap:9px;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <div class="e-panel" style="flex:1.25;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${domainIcon('truck', 13, '#b45309')}
            <span>Daftar Surat Jalan Digital & Bukti Serah Terima Proyek</span>
          </div>
          <div style="display:flex;gap:5px;">
            <span class="gb-chip is-on">Semua (13)</span>
            <span class="gb-chip">Dalam Perjalanan (2)</span>
            <span class="gb-chip">Diteken Mandor (11)</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-tight">
            <thead>
              <tr>
                <th style="width:118px;">No. Surat Jalan</th>
                <th style="width:88px;">Nopol</th>
                <th style="width:92px;">Sopir</th>
                <th style="width:104px;">Proyek Site</th>
                <th class="num" style="width:60px;">Muat</th>
                <th class="num" style="width:62px;">Site</th>
                <th style="width:74px;">Waktu</th>
                <th style="width:94px;">Mandor</th>
                <th style="width:124px;">Status SJ & PPN</th>
              </tr>
            </thead>
            <tbody>
              ${SJ_LIST.map(
                (s) => `<tr class="${s.selected ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:${s.selected ? '#78350f' : '#1c1917'};">${esc(s.sj)}</td>
                  <td class="mono" style="font-size:10px;">${esc(s.plate)}</td>
                  <td class="trunc">${esc(s.driver)}</td>
                  <td class="trunc" style="color:#57534e;">${esc(s.site)}</td>
                  <td class="num mono">${s.loadTon.toFixed(2).replace('.', ',')}t</td>
                  <td class="num mono" style="font-weight:600;color:${s.siteTon == null ? '#a8a29e' : '#047857'};">${s.siteTon == null ? '—' : s.siteTon.toFixed(2).replace('.', ',') + 't'}</td>
                  <td class="mono" style="font-size:9.8px;">${esc(s.eta)}</td>
                  <td class="trunc">${esc(s.mandor)}</td>
                  <td>${badge(s.status, s.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">${SJ_LIST.length} Surat Jalan Aktif & Terkirim · 100% Bukti Foto EXIF + GPS</td>
                <td class="num mono">${SJ_TOTAL_TON.toFixed(1).replace('.', ',')}t</td>
                <td class="num mono" style="color:#047857;">-0,08%</td>
                <td colspan="3" class="num mono" style="color:#78350f;">Toleransi Timbang SNI &plusmn;0,5%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="e-panel" style="flex:0.75;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('lock', 13, '#047857')}
            <span>Jejak Audit WORM SHA-256 · Surat Jalan ke e-Faktur CoreTax</span>
          </div>
          <span class="mono" style="font-size:9.5px;color:#047857;font-weight:700;">IMMUTABLE LEDGER</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:68px;">Waktu</th>
                <th style="width:108px;">Layanan</th>
                <th style="width:430px;">Peristiwa Operasional & Trigger</th>
                <th style="width:92px;">Digest</th>
                <th style="width:92px;">Hasil</th>
              </tr>
            </thead>
            <tbody>
              ${auditEvents
                .map(
                  (e) => `<tr>
                    <td class="mono" style="font-size:9.8px;color:#57534e;">${esc(e.ts)}</td>
                    <td style="font-weight:700;color:#1c1917;">${esc(e.svc)}</td>
                    <td class="trunc">${esc(e.event)}</td>
                    <td class="mono" style="font-size:9.5px;color:#78350f;">${esc(e.hash)}</td>
                    <td>${badge(e.badgeTxt, e.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${domainIcon('camera', 13, '#b45309')}
          <span>Lembar Bukti Terima & Foto Mandor · SJ-KRW-2026-0891</span>
        </div>
        ${badge('Terverifikasi', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 9px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:4px;">
          <div style="min-width:0;">
            <div style="font-size:11.5px;font-weight:800;color:#1c1917;">SURAT JALAN DIGITAL #SJ-KRW-2026-0891</div>
            <div style="font-size:9.8px;color:#57534e;">PO-2026-1142 · Sopir: Slamet Riyadi · Fuso Tronton <strong class="mono">B 9412 UXA</strong></div>
            <div class="mono" style="font-size:9.2px;color:#78350f;margin-top:2px;">Tujuan: Proyek Gudang Karawang Timur (Bay 2)</div>
          </div>
          ${qrSvg}
        </div>

        ${fieldPhotoSvg}

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
          <div style="padding:4px 6px;background:#fffbeb;border:1px solid #f59e0b;border-radius:3px;font-size:9px;font-weight:700;color:#78350f;text-align:center;">1. Bongkar Besi D13</div>
          <div style="padding:4px 6px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;font-size:9px;font-weight:600;color:#57534e;text-align:center;">2. Segel 1 DO Semen</div>
          <div style="padding:4px 6px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;font-size:9px;font-weight:600;color:#57534e;text-align:center;">3. Timbang 18,38t</div>
          <div style="padding:4px 6px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:3px;font-size:9px;font-weight:600;color:#57534e;text-align:center;">4. Fisik SJ + KTP</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;display:flex;justify-content:space-between;">
            <span>Verifikasi Fisik Material di Lapangan (4/4 Item Cocok)</span>
            <span class="mono" style="color:#047857;">Selisih Qty: 0</span>
          </div>
          <table class="e-table" style="border:1px solid #e5dfd5;">
            <thead>
              <tr>
                <th style="width:62px;">SKU</th>
                <th style="width:170px;">Material</th>
                <th class="num" style="width:64px;">Kirim</th>
                <th class="num" style="width:64px;">Terima</th>
                <th style="width:94px;">Kondisi Fisik</th>
              </tr>
            </thead>
            <tbody>
              ${LOAD_PLAN_ITEMS.map(
                (i) => `<tr>
                  <td class="mono" style="font-weight:700;color:#78350f;">${esc(i.code)}</td>
                  <td class="trunc" style="font-weight:600;">${esc(i.shortTitle)}</td>
                  <td class="num mono">${i.qty} ${i.unit}</td>
                  <td class="num mono" style="color:#047857;font-weight:700;">${i.qty} ${i.unit}</td>
                  <td>${badge('Utuh · SNI OK', 'ok')}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:8px;align-items:stretch;">
          <div style="padding:7px 9px;background:#faf8f5;border:1px solid #e5dfd5;border-radius:4px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-size:9.2px;color:#78716c;font-weight:700;">TANDA TANGAN MANDOR PROYEK</div>
            <svg viewBox="0 0 180 38" width="100%" height="36" style="display:block;margin:2px 0;">
              <path d="M12 28 C22 10, 34 8, 36 24 C38 30, 50 14, 62 18 C72 22, 68 30, 84 22 C98 15, 108 12, 114 25 C120 32, 138 14, 162 20" fill="none" stroke="#1c1917" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="8" y1="34" x2="172" y2="34" stroke="#d1c8ba" stroke-width="1"/>
            </svg>
            <div style="font-size:9.5px;font-weight:700;color:#1c1917;">Dedi Supriadi · Mandor Sipil</div>
            <div class="mono" style="font-size:8.6px;color:#047857;">OTP + Biometrik · 14:18:04 WIB</div>
          </div>

          <div style="padding:8px 9px;background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="font-size:9.5px;font-weight:700;color:#78350f;margin-bottom:3px;">TRIGGER OTOMATIS PAJAK PPN 11%</div>
              <div style="font-size:9.8px;color:#44403c;line-height:1.35;">
                SJ diteken memicu antrean <strong>CoreTax XML</strong> senilai <strong class="mono">${fmtIdr(LOAD_PPN)}</strong> dan memposting tagihan TOP 30h sebesar <strong class="mono">${fmtIdr(LOAD_GRAND_TOTAL)}</strong>.
              </div>
            </div>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:24px;">Cetak SJ PDF</span>
              <span class="e-btn" style="height:24px;">Lihat XML</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  return renderShell({
    activeNav: 'sj',
    breadcrumb: 'Surat Jalan Digital & Bukti Terima Lapangan Mandor',
    pageSubtitle: 'Verifikasi penerimaan material real-time dengan foto geotag, selisih jembatan timbang, dan trigger otomatis CoreTax PPN 11%',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#44403c')} Bundel POD + SJ</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 12, '#ffffff')} Terbitkan e-Faktur PPN</span>
    `,
    contentHtml: `${stepperPanel}${mainSplit}`,
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
