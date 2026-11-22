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
  id: 'ID-026',
  name: 'ApotekPOS eResep',
  reference: 'Toast POS + Square for Retail + Mews PMS (Clinical Pharmacy Edition)',
  persona: 'apt. Lestari Wijaya, S.Farm · Apoteker Penanggung Jawab (SIPA 446/2025/JKT-S)',
  pages: [
    { slug: 'p1', title: 'Kasir Meja Resep & Pengambilan Batch FEFO' },
    { slug: 'p2', title: 'Papan Antrean & Dispatch Meja Racik (KDS Farmasi)' },
    { slug: 'p3', title: 'Studio Racikan, Tuslah & Pratinjau Etiket Termal' },
    { slug: 'p4', title: 'Kartu Stok FEFO, Matriks Kedaluwarsa & Denah Rak' },
    { slug: 'p5', title: 'Buku Psikotropika, OOT & Pelaporan SIPNAP Kemenkes' },
    { slug: 'p6', title: 'Settlement Shift Kasir, QRIS/BPJS & CoreTax PPN' },
    { slug: 'p7', title: 'Skrining Interaksi Obat (DDI), DoA & Audit WORM' },
    { slug: 'p8', title: 'Integrasi SATUSEHAT KFA, Perangkat & Kiosk Pasien' },
  ],
};

// ============================================================================
// CUSTOM PHARMACY POS VECTOR ICONS (1.75px stroke, zero emoji)
// ============================================================================
const RX_ICONS = {
  pos: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="7" y1="20" x2="17" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="7" y1="9" x2="11" y2="9"/><line x1="14" y1="9" x2="17" y2="9"/><line x1="7" y1="12" x2="17" y2="12"/>',
  kds: '<rect x="3" y="3" width="7" height="8" rx="1"/><rect x="14" y="3" width="7" height="8" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  mortar: '<path d="M4 11h16l-2 7a3 3 0 0 1-3 2H9a3 3 0 0 1-3-2l-2-7z"/><path d="M15 4l-4 7"/><line x1="8" y1="20" x2="16" y2="20"/>',
  shelf: '<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>',
  sipnap: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  clinical: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M8 10h2l1.5-2 1.5 4 1.5-2H16"/>',
  device: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="9" y1="6" x2="15" y2="6"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  barcode: '<line x1="3" y1="5" x2="3" y2="19"/><line x1="7" y1="5" x2="7" y2="19"/><line x1="10" y1="5" x2="10" y2="19"/><line x1="14" y1="5" x2="14" y2="19"/><line x1="17" y1="5" x2="17" y2="19"/><line x1="21" y1="5" x2="21" y2="19"/>',
  pill: '<path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7l-8.5 8.5a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>',
  qris: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/>',
  thermometer: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  rx: '<path d="M4 5h5a3 3 0 0 1 0 6H4V5z"/><path d="M4 11v8"/><path d="M8 11l6 8"/><path d="M14 14l5 5"/><path d="M19 14l-5 5"/>',
};

function pic(name, size = 14, color = 'currentColor') {
  const path = RX_ICONS[name];
  if (!path) return ic(name, size, color);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${path}</svg>`;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATH-VERIFIED ACROSS P1-P8)
// Reference Timestamp: Minggu, 22 November 2026 · 14:18 WIB
// ============================================================================

const RX_CHANNELS = [
  { label: 'Resep Dokter Umum / Klinik', count: 32, pct: 43.2 },
  { label: 'Resep Spesialis & Racikan', count: 18, pct: 24.3 },
  { label: 'e-Resep BPJS PRB / Kronis', count: 16, pct: 21.6 },
  { label: 'Resep Psikotropika / OOT', count: 8, pct: 10.8 },
];

const KDS_COMPLETED_TODAY = 62;

const KDS_LANES = [
  {
    id: 'skrining',
    title: '1. Skrining Klinis APJ',
    sla: 'Target <= 4 mnt',
    tone: 'info',
    tickets: [
      { rx: 'RX-261122-074', patient: 'Ny. Aminah (52 th)', dokter: 'dr. Hendra K. · SIP 446/112', type: 'Resep + OOT', elapsed: '02:14', slaState: 'ok', items: 4, note: 'Terkunci: Alprazolam 0.5mg wajib SIP+NIK', tags: ['FEFO #1', 'Wajib SIPNAP'] },
      { rx: 'RX-261122-073', patient: 'Tn. Bambang S. (61 th)', dokter: 'dr. Rina Sp.JP · SIP 446/894', type: 'BPJS PRB', elapsed: '03:48', slaState: 'warn', items: 3, note: 'Cek DDI Mayor: Warfarin 2mg + Aspirin 80mg', tags: ['DDI Mayor', 'BPJS PRB'] },
      { rx: 'RX-261122-072', patient: 'An. Keisha P. (6 th)', dokter: 'dr. Dewi Sp.A · SIP 446/305', type: 'Racikan Puyer', elapsed: '01:22', slaState: 'ok', items: 2, note: 'Cek dosis pediatri BB 18 kg · ISPA akut', tags: ['Pediatri', 'Racikan'] },
    ],
  },
  {
    id: 'racik',
    title: '2. Pengambilan FEFO & Racik',
    sla: 'Target <= 15 mnt',
    tone: 'warn',
    tickets: [
      { rx: 'RX-261122-071', patient: 'An. Rafa M. (4 th)', dokter: 'dr. Dewi Sp.A · SIP 446/305', type: 'Racikan Puyer', elapsed: '08:42', slaState: 'ok', items: 6, note: 'RAC-09 (10 bks) · Mortar #1 TTK Dimas', tags: ['RAC-09', 'FEFO AMX2604'], progress: 72 },
      { rx: 'RX-261122-070', patient: 'Ny. Siti Rahayu (44 th)', dokter: 'dr. Bagus Sp.KK · SIP 446/619', type: 'Racikan Salep', elapsed: '14:10', slaState: 'warn', items: 3, note: 'Pot 20g Hidrokortison + Mikonazol 2%', tags: ['Salep 20g', 'BUD 30h'], progress: 84 },
      { rx: 'RX-261122-069', patient: 'Tn. Agus Wijaya (58 th)', dokter: 'dr. Rina Sp.JP · SIP 446/894', type: 'Kronis 30h', elapsed: '06:05', slaState: 'ok', items: 4, note: 'Amlodipine 10mg + Simvastatin 20mg + Metformin', tags: ['FEFO #1', 'Rak A-04'], progress: 55 },
      { rx: 'RX-261122-068', patient: 'Ny. Maria L. (37 th)', dokter: 'dr. Yoga Sp.PD · SIP 446/518', type: 'CITO Chiller', elapsed: '04:19', slaState: 'bad', items: 2, note: 'Insulin Glargine Pen (Chiller 4,2°C) + Ice Pack', tags: ['CITO', 'Cold-Chain'], progress: 65 },
    ],
  },
  {
    id: 'etiket',
    title: '3. Cetak Etiket & Cek Ganda',
    sla: 'Target <= 3 mnt',
    tone: 'accent',
    tickets: [
      { rx: 'RX-261122-067', patient: 'Tn. Dedi Kurniawan (49 th)', dokter: 'dr. Hendra K. · SIP 446/112', type: 'Resep Umum', elapsed: '01:55', slaState: 'ok', items: 3, note: 'Zebra ZD220: 3 stiker etiket putih tercetak', tags: ['ZPL OK', 'Cek APJ'] },
      { rx: 'RX-261122-066', patient: 'Ny. Yuliana T. (63 th)', dokter: 'dr. Yoga Sp.PD · SIP 446/518', type: 'BPJS PRB', elapsed: '02:38', slaState: 'ok', items: 5, note: 'Verifikasi nomor batch & aturan pakai insulin', tags: ['5 Etiket', 'KFA Push'] },
      { rx: 'RX-261122-065', patient: 'Tn. Fajar H. (29 th)', dokter: 'dr. Nadia Sp.KJ · SIP 446/771', type: 'Psikotropika', elapsed: '03:12', slaState: 'warn', items: 2, note: 'Diazepam 2mg · Foto KTP + SIP tersimpan', tags: ['SIPNAP OK', 'OTP APJ'] },
    ],
  },
  {
    id: 'serah',
    title: '4. Siap Serah & Konseling PIO',
    sla: 'Panggil Loket PIO',
    tone: 'ok',
    tickets: [
      { rx: 'RX-261122-064', patient: 'Ny. Kartini (55 th)', dokter: 'dr. Rina Sp.JP · SIP 446/894', type: 'Resep Umum', elapsed: '00:52', slaState: 'ok', items: 3, note: 'Lunas QRIS Rp 148.500 · Panggil Antrean R-064', tags: ['LUNAS QRIS', 'Loket PIO'] },
      { rx: 'RX-261122-063', patient: 'An. Bima A. (7 th)', dokter: 'dr. Dewi Sp.A · SIP 446/305', type: 'Sirup Kering', elapsed: '01:34', slaState: 'ok', items: 2, note: 'Cefadroxil rekonstitusi 60ml · Edukasi BUD 7h', tags: ['LUNAS TUNAI', 'PIO Wajib'] },
    ],
  },
];

// Active Cart on P1 (Meja Resep #01 — RX-261122-074)
const POS_CATALOG = [
  { code: 'KFA-01', kfa: '93001042', name: 'Amoxicillin 500mg Strip (10 Tab)', batch: 'AMX2604', exp: '08/2027', days: 264, price: 14500, stock: 142, cls: 'Keras', badgeTxt: 'FEFO #1', tone: 'ok', signa: '3x1 Sesudah Makan' },
  { code: 'KFA-02', kfa: '93000815', name: 'Paracetamol 500mg Box', batch: 'PCM2511', exp: '01/2027', days: 54, price: 8000, stock: 28, cls: 'Bebas', badgeTxt: 'Alert FEFO', tone: 'warn', signa: 'Bila Demam' },
  { code: 'RAC-09', kfa: 'RAC-PUY-09', name: 'Racikan Puyer Anak (10 Bungkus)', batch: 'MULTI-FEFO', exp: 'BUD 14h', days: 14, price: 34000, stock: 99, cls: 'Racikan', badgeTxt: 'Verif APJ', tone: 'ok', signa: '3x1 Bungkus' },
  { code: 'OOT-04', kfa: '93009904', name: 'Alprazolam 0.5mg (Psikotropika)', batch: 'ALP2602', exp: '06/2027', days: 205, price: 42000, stock: 34, cls: 'Psikotropika', badgeTxt: 'Wajib SIPNAP', tone: 'bad', signa: '1x1 Malam', locked: true },
  { code: 'KFA-07', kfa: '93004120', name: 'Ambroxol HCl 30mg Strip (10 Tab)', batch: 'AMB2609', exp: '09/2027', days: 298, price: 9500, stock: 186, cls: 'Keras', badgeTxt: 'FEFO #1', tone: 'ok', signa: '3x1 Sesudah Makan' },
  { code: 'KFA-08', kfa: '93002711', name: 'Amlodipine 10mg Strip (10 Tab)', batch: 'AML2610', exp: '10/2027', days: 329, price: 12000, stock: 210, cls: 'Keras', badgeTxt: 'FEFO #1', tone: 'ok', signa: '1x1 Pagi' },
  { code: 'KFA-09', kfa: '93001902', name: 'Omeprazole 20mg Kapsul Strip', batch: 'OMP2512', exp: '12/2026', days: 26, price: 16500, stock: 19, cls: 'Keras', badgeTxt: 'Exp 26h', tone: 'bad', signa: '2x1 Sebelum Makan' },
  { code: 'KFA-11', kfa: '93005118', name: 'Metformin HCl 500mg Strip', batch: 'MTF2703', exp: '03/2028', days: 472, price: 7500, stock: 315, cls: 'Keras', badgeTxt: 'BPJS PRB', tone: 'info', signa: '2x1 Bersama Makan' },
  { code: 'KFA-14', kfa: '93006204', name: 'Cetirizine 10mg Strip (10 Tab)', batch: 'CTZ2605', exp: '05/2027', days: 174, price: 11000, stock: 164, cls: 'Keras', badgeTxt: 'FEFO #1', tone: 'ok', signa: '1x1 Malam' },
  { code: 'KFA-15', kfa: '93007410', name: 'Insulin Glargine 100 IU Pen', batch: 'INS2512', exp: '01/2027', days: 44, price: 168000, stock: 14, cls: 'Cold-Chain', badgeTxt: 'Chiller 4°C', tone: 'warn', signa: '1x 12 Unit SC' },
  { code: 'KFA-18', kfa: '93003382', name: 'Simvastatin 20mg Strip (10 Tab)', batch: 'SMV2704', exp: '04/2028', days: 506, price: 13500, stock: 240, cls: 'Keras', badgeTxt: 'FEFO #1', tone: 'ok', signa: '1x1 Malam' },
  { code: 'KFA-22', kfa: '93008819', name: 'Cefadroxil 500mg Sirup Kering', batch: 'CEF2601', exp: '01/2027', days: 48, price: 24500, stock: 22, cls: 'Keras', badgeTxt: 'Alert FEFO', tone: 'warn', signa: '2x1 Cth (HABISKAN)' },
];

const POS_CART_ACTIVE = [
  { code: 'KFA-01', title: 'Amoxicillin 500mg Strip (10 Tab)', sub: 'Batch AMX2604 · Exp 08/2027 · Wajib Resep', qty: 1, unitPrice: 14500, status: 'FEFO #1', tone: 'ok', signa: '3x1 Sesudah Makan (HABISKAN)' },
  { code: 'KFA-02', title: 'Paracetamol 500mg Box', sub: 'Batch PCM2511 · Exp 01/2027 · Dekat Exp (54h)', qty: 1, unitPrice: 8000, status: 'Alert FEFO', tone: 'warn', signa: '3x1 bila demam >38°C' },
  { code: 'RAC-09', title: 'Racikan Puyer Anak (10 Bungkus)', sub: 'Bahan Rp 24.500 + Tuslah Rp 6.000 + Embalase Rp 3.500', qty: 1, unitPrice: 34000, status: 'Racikan', tone: 'ok', signa: '3x1 Bungkus sesudah makan' },
  { code: 'KFA-07', title: 'Ambroxol HCl 30mg Strip (10 Tab)', sub: 'Batch AMB2609 · Exp 09/2027 · Ekspektoran', qty: 1, unitPrice: 9500, status: 'FEFO #1', tone: 'ok', signa: '3x1 Sesudah Makan' },
];

const POS_CART_LOCKED = {
  code: 'OOT-04',
  title: 'Alprazolam 0.5mg (Psikotropika)',
  sub: 'Batch ALP2602 · Wajib SIP Dokter + Pemindaian NIK Pasien',
  estPrice: 42000,
  status: 'Wajib SIPNAP',
  tone: 'bad',
  meta: 'Audit Log',
};

// P3: Compounding BOM for RAC-09 (exact sum = Rp 24.500 bahan + Rp 6.000 tuslah + Rp 3.500 embalase = Rp 34.000)
const RACIKAN_BOM = [
  { kfa: '93001042', bahan: 'Amoxicillin Trihydrate 500mg', dosisPerBks: '125 mg', totalButuh: '1.250 mg (2,5 tab)', ambilQty: 3, satuan: 'Tab', batch: 'AMX2604', exp: '08/2027', hppUnit: 1500 },
  { kfa: '93000815', bahan: 'Paracetamol 500mg Kaplet', dosisPerBks: '150 mg', totalButuh: '1.500 mg (3,0 tab)', ambilQty: 3, satuan: 'Tab', batch: 'PCM2511', exp: '01/2027', hppUnit: 800 },
  { kfa: '93004120', bahan: 'Ambroxol HCl 30mg Tablet', dosisPerBks: '7,5 mg', totalButuh: '75 mg (2,5 tab)', ambilQty: 3, satuan: 'Tab', batch: 'AMB2609', exp: '09/2027', hppUnit: 1000 },
  { kfa: '93006204', bahan: 'Cetirizine HCl 10mg Tablet', dosisPerBks: '2,5 mg', totalButuh: '25 mg (2,5 tab)', ambilQty: 3, satuan: 'Tab', batch: 'CTZ2605', exp: '05/2027', hppUnit: 2200 },
  { kfa: '93004490', bahan: 'Salbutamol Sulfate 2mg Tablet', dosisPerBks: '1,0 mg', totalButuh: '10 mg (5,0 tab)', ambilQty: 5, satuan: 'Tab', batch: 'SLB2608', exp: '08/2027', hppUnit: 900 },
  { kfa: '93000108', bahan: 'Saccharum Lactis (SL) q.s. + Perkamen', dosisPerBks: '200 mg', totalButuh: '2.000 mg + 10 lbr', ambilQty: 1, satuan: 'Pkt', batch: 'EXL2612', exp: '12/2027', hppUnit: 3500 },
];
const RACIKAN_TUSLAH = 6000;
const RACIKAN_EMBALASE = 3500;

// P4: FEFO Stock Card Master (16 Batches — EXACTLY 5 batches < 60 days!)
const FEFO_BATCHES = [
  { kfa: '93001902', sku: 'KFA-09', name: 'Omeprazole 20mg Kapsul Strip', batch: 'OMP2512', rak: 'B-02-1', qty: 19, unit: 'Strip', exp: '18/12/2026', daysLeft: 26, hpp: 12500, status: 'Kritis <30h', tone: 'bad', pbf: 'PT Enseval Putera' },
  { kfa: '93001450', sku: 'KFA-19', name: 'Vitamin C 500mg IPI Botol (45 Tab)', batch: 'VTM2512', rak: 'C-01-4', qty: 34, unit: 'Botol', exp: '28/12/2026', daysLeft: 36, hpp: 6800, status: 'Alert <60h', tone: 'warn', pbf: 'PT Kimia Farma TD' },
  { kfa: '93007410', sku: 'KFA-15', name: 'Insulin Glargine 100 IU Pen (Chiller)', batch: 'INS2512', rak: 'CH-01-A', qty: 14, unit: 'Pen', exp: '05/01/2027', daysLeft: 44, hpp: 142000, status: 'Alert <60h', tone: 'warn', pbf: 'PT Anugrah Argon' },
  { kfa: '93008819', sku: 'KFA-22', name: 'Cefadroxil 500mg Sirup Kering 60ml', batch: 'CEF2601', rak: 'B-04-2', qty: 22, unit: 'Botol', exp: '09/01/2027', daysLeft: 48, hpp: 18500, status: 'Alert <60h', tone: 'warn', pbf: 'PT Parit Padang' },
  { kfa: '93000815', sku: 'KFA-02', name: 'Paracetamol 500mg Box (10 Strip)', batch: 'PCM2511', rak: 'C-02-1', qty: 28, unit: 'Box', exp: '15/01/2027', daysLeft: 54, hpp: 5900, status: 'Alert <60h', tone: 'warn', pbf: 'PT Dos Ni Roha', selected: true },
  { kfa: '93005514', sku: 'KFA-24', name: 'Azithromycin 500mg Kaplet Strip', batch: 'AZT2601', rak: 'A-01-3', qty: 46, unit: 'Strip', exp: '28/01/2027', daysLeft: 67, hpp: 22000, status: 'Pantau <90h', tone: 'info', pbf: 'PT Enseval Putera' },
  { kfa: '93004910', sku: 'KFA-25', name: 'Dexamethasone 0.5mg Strip (10 Tab)', batch: 'DEX2602', rak: 'A-03-2', qty: 112, unit: 'Strip', exp: '08/02/2027', daysLeft: 78, hpp: 2400, status: 'Pantau <90h', tone: 'info', pbf: 'PT Bina San Prima' },
  { kfa: '93006802', sku: 'KFA-26', name: 'Captopril 25mg Strip (10 Tab)', batch: 'CPT2602', rak: 'A-04-1', qty: 95, unit: 'Strip', exp: '15/02/2027', daysLeft: 85, hpp: 3100, status: 'Pantau <90h', tone: 'info', pbf: 'PT Kimia Farma TD' },
  { kfa: '93006204', sku: 'KFA-14', name: 'Cetirizine HCl 10mg Strip (10 Tab)', batch: 'CTZ2605', rak: 'A-02-4', qty: 164, unit: 'Strip', exp: '15/05/2027', daysLeft: 174, hpp: 6400, status: 'FEFO #1', tone: 'ok', pbf: 'PT Mensa Bina' },
  { kfa: '93009904', sku: 'OOT-04', name: 'Alprazolam 0.5mg Strip (Lemari Ganda)', batch: 'ALP2602', rak: 'LK-01-A', qty: 34, unit: 'Strip', exp: '15/06/2027', daysLeft: 205, hpp: 28500, status: 'Kunci APJ', tone: 'bad', pbf: 'PT Kimia Farma TD' },
  { kfa: '93001042', sku: 'KFA-01', name: 'Amoxicillin 500mg Strip (10 Tab)', batch: 'AMX2604', rak: 'A-01-1', qty: 142, unit: 'Strip', exp: '13/08/2027', daysLeft: 264, hpp: 9800, status: 'FEFO #1', tone: 'ok', pbf: 'PT Enseval Putera' },
  { kfa: '93004490', sku: 'KFA-16', name: 'Salbutamol 2mg Strip (10 Tab)', batch: 'SLB2608', rak: 'A-02-2', qty: 130, unit: 'Strip', exp: '20/08/2027', daysLeft: 271, hpp: 4200, status: 'FEFO #1', tone: 'ok', pbf: 'PT Parit Padang' },
  { kfa: '93004120', sku: 'KFA-07', name: 'Ambroxol HCl 30mg Strip (10 Tab)', batch: 'AMB2609', rak: 'A-02-3', qty: 186, unit: 'Strip', exp: '16/09/2027', daysLeft: 298, hpp: 5400, status: 'FEFO #1', tone: 'ok', pbf: 'PT Dos Ni Roha' },
  { kfa: '93002711', sku: 'KFA-08', name: 'Amlodipine 10mg Strip (10 Tab)', batch: 'AML2610', rak: 'A-04-3', qty: 210, unit: 'Strip', exp: '17/10/2027', daysLeft: 329, hpp: 7200, status: 'FEFO #1', tone: 'ok', pbf: 'PT Anugrah Argon' },
  { kfa: '93005118', sku: 'KFA-11', name: 'Metformin HCl 500mg Strip (10 Tab)', batch: 'MTF2703', rak: 'A-05-1', qty: 315, unit: 'Strip', exp: '08/03/2028', daysLeft: 472, hpp: 4600, status: 'FEFO #1', tone: 'ok', pbf: 'PT Kimia Farma TD' },
  { kfa: '93003382', sku: 'KFA-18', name: 'Simvastatin 20mg Strip (10 Tab)', batch: 'SMV2704', rak: 'A-05-2', qty: 240, unit: 'Strip', exp: '11/04/2028', daysLeft: 506, hpp: 8100, status: 'FEFO #1', tone: 'ok', pbf: 'PT Enseval Putera' },
];

// P5: SIPNAP Psikotropika, Narkotika & OOT Ledger (16 controlled SKUs, 0 selisih)
const SIPNAP_LEDGER = [
  { code: 'PSI-01', kfa: '93009904', name: 'Alprazolam 0.5mg Tablet', gol: 'Psikotropika IV', batch: 'ALP2602', awal: 400, masuk: 100, keluar: 160, akhir: 340, fisik: 340, unit: 'Tab', pbf: 'Kimia Farma TD', selected: true },
  { code: 'PSI-02', kfa: '93009908', name: 'Alprazolam 1mg Tablet', gol: 'Psikotropika IV', batch: 'ALP2605', awal: 200, masuk: 0, keluar: 65, akhir: 135, fisik: 135, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'PSI-03', kfa: '93009912', name: 'Diazepam 2mg Tablet', gol: 'Psikotropika IV', batch: 'DZP2603', awal: 300, masuk: 100, keluar: 112, akhir: 288, fisik: 288, unit: 'Tab', pbf: 'Indofarma Global' },
  { code: 'PSI-04', kfa: '93009916', name: 'Clobazam 10mg Tablet', gol: 'Psikotropika IV', batch: 'CLB2604', awal: 180, masuk: 100, keluar: 94, akhir: 186, fisik: 186, unit: 'Tab', pbf: 'Enseval Putera' },
  { code: 'PSI-05', kfa: '93009921', name: 'Lorazepam 1mg Tablet', gol: 'Psikotropika IV', batch: 'LRZ2601', awal: 150, masuk: 50, keluar: 48, akhir: 152, fisik: 152, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'PSI-06', kfa: '93009930', name: 'Phenobarbital 30mg Tablet', gol: 'Psikotropika IV', batch: 'PHB2606', awal: 240, masuk: 0, keluar: 70, akhir: 170, fisik: 170, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'PSI-07', kfa: '93009934', name: 'Estazolam 1mg Tablet', gol: 'Psikotropika IV', batch: 'EST2604', awal: 120, masuk: 50, keluar: 42, akhir: 128, fisik: 128, unit: 'Tab', pbf: 'Enseval Putera' },
  { code: 'PSI-08', kfa: '93009939', name: 'Clonazepam 2mg Tablet', gol: 'Psikotropika IV', batch: 'CLN2605', awal: 100, masuk: 0, keluar: 26, akhir: 74, fisik: 74, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'NAR-01', kfa: '93009801', name: 'Codeine HCl 10mg Tablet', gol: 'Narkotika III', batch: 'COD2603', awal: 200, masuk: 100, keluar: 86, akhir: 214, fisik: 214, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'NAR-02', kfa: '93009804', name: 'Codeine HCl 20mg Tablet', gol: 'Narkotika III', batch: 'COD2607', awal: 120, masuk: 0, keluar: 38, akhir: 82, fisik: 82, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'OOT-01', kfa: '93009710', name: 'Tramadol HCl 50mg Kapsul', gol: 'OOT BPOM', batch: 'TRM2604', awal: 350, masuk: 150, keluar: 190, akhir: 310, fisik: 310, unit: 'Kap', pbf: 'Anugrah Argon' },
  { code: 'OOT-02', kfa: '93009714', name: 'Trihexyphenidyl 2mg Tablet', gol: 'OOT BPOM', batch: 'THP2602', awal: 300, masuk: 100, keluar: 145, akhir: 255, fisik: 255, unit: 'Tab', pbf: 'Parit Padang' },
  { code: 'OOT-03', kfa: '93009722', name: 'Amitriptyline 25mg Tablet', gol: 'OOT BPOM', batch: 'AMT2605', awal: 260, masuk: 100, keluar: 108, akhir: 252, fisik: 252, unit: 'Tab', pbf: 'Bina San Prima' },
  { code: 'OOT-04', kfa: '93009731', name: 'Chlorpromazine 100mg Tablet', gol: 'OOT BPOM', batch: 'CPZ2603', awal: 180, masuk: 0, keluar: 52, akhir: 128, fisik: 128, unit: 'Tab', pbf: 'Kimia Farma TD' },
  { code: 'OOT-05', kfa: '93009740', name: 'Haloperidol 1.5mg Tablet', gol: 'OOT BPOM', batch: 'HLP2606', awal: 220, masuk: 50, keluar: 64, akhir: 206, fisik: 206, unit: 'Tab', pbf: 'Indofarma Global' },
  { code: 'OOT-06', kfa: '93009748', name: 'Dextromethorphan HBr 15mg Tab', gol: 'OOT BPOM', batch: 'DXM2602', awal: 280, masuk: 100, keluar: 124, akhir: 256, fisik: 256, unit: 'Tab', pbf: 'Mensa Bina' },
];

// P6: Financial Settlement & PSAK Double-Entry (Shift Berjalan 22 Nov 2026)
const SHIFT_TENDERS = [
  { channel: 'Tunai Laci Kasir', tx: 58, expected: 6845000, actual: 6845000, status: 'Sesuai (Rp 0)', tone: 'ok' },
  { channel: 'QRIS Dinamis (SNAP BI)', tx: 46, expected: 5420000, actual: 5420000, status: 'Settled T+0', tone: 'ok' },
  { channel: 'EDC Debit / Kartu', tx: 22, expected: 2910000, actual: 2910000, status: 'Batch #042 OK', tone: 'ok' },
  { channel: 'Piutang Klaim BPJS PRB', tx: 22, expected: 3250000, actual: 3250000, status: 'SEP Terverif', tone: 'info' },
];

const CASH_DENOMS = [
  { nominal: 100000, label: 'Rp 100.000', qty: 38 },
  { nominal: 50000, label: 'Rp 50.000', qty: 44 },
  { nominal: 20000, label: 'Rp 20.000', qty: 52 },
  { nominal: 10000, label: 'Rp 10.000', qty: 48 },
  { nominal: 5000, label: 'Rp 5.000', qty: 45 },
  { nominal: 2000, label: 'Rp 2.000', qty: 35 },
  { nominal: 1000, label: 'Rp 1.000', qty: 24 },
  { nominal: 500, label: 'Rp 500 (Koin)', qty: 12 },
];
const MODAL_AWAL_LACI = 1000000;

const HOURLY_REVENUE = {
  slots: ['07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21'],
  // Values in thousands of IDR (Rp rb); sum across all 4 series = 18.425 (Rp 18.425.000)
  tunai: [680, 1240, 1185, 1320, 940, 880, 600],      // sum = 6845
  qris:  [490, 960, 1010, 1120, 740, 680, 420],       // sum = 5420
  edc:   [210, 520, 540, 610, 410, 380, 240],         // sum = 2910
  bpjs:  [340, 780, 690, 620, 420, 260, 140],         // sum = 3250
};

const PSAK_JOURNAL = [
  { akun: '1101', nama: 'Kas Laci Kasir (Setoran Shift)', debit: 6845000, kredit: 0, ref: 'SHF-261122-01' },
  { akun: '1104', nama: 'Bank Settlement QRIS & EDC Mandiri', debit: 8330000, kredit: 0, ref: 'SNAP-042-OK' },
  { akun: '1121', nama: 'Piutang Klaim BPJS PRB / Apotek Online', debit: 3250000, kredit: 0, ref: 'PRB-2211-22' },
  { akun: '5101', nama: 'Beban Pokok Penjualan Obat (FEFO)', debit: 12180000, kredit: 0, ref: 'HPP-FEFO-148' },
  { akun: '4101', nama: 'Pendapatan Penjualan Resep & Racikan', debit: 0, kredit: 9450000, ref: 'RX-74-REC' },
  { akun: '4102', nama: 'Pendapatan Penjualan OTC / Bebas', debit: 0, kredit: 6495000, ref: 'OTC-86-REC' },
  { akun: '4105', nama: 'Pendapatan Jasa Tuslah & Embalase', debit: 0, kredit: 975000, ref: 'TSL-RAC-18' },
  { akun: '2108', nama: 'Utang PPN Keluaran 11% (CoreTax XML)', debit: 0, kredit: 1505000, ref: 'FP-010-2611' },
  { akun: '1141', nama: 'Persediaan Barang Farmasi (Kartu Stok)', debit: 0, kredit: 12180000, ref: 'INV-OUT-FEFO' },
];

// P7: Clinical DDI Alerts & Maker-Checker DoA
const DDI_QUEUE = [
  { rx: 'RX-261122-073', pasien: 'Tn. Bambang S.', pasangan: 'Warfarin 2mg + Aspirin 80mg', sev: 'MAYOR', tone: 'bad', mekanisme: 'Risiko perdarahan GI & INR >3,5', maker: 'TTK Dimas R.', status: 'Tahan · Konf. dr. Rina' },
  { rx: 'RX-261122-074', pasien: 'Ny. Aminah', pasangan: 'Alprazolam 0.5mg (Psiko IV)', sev: 'SIPNAP LOCK', tone: 'bad', mekanisme: 'Wajib SIP Dokter + pindai NIK e-KTP', maker: 'TTK Sari N.', status: 'Menunggu OTP APJ' },
  { rx: 'RX-261122-059', pasien: 'Tn. Slamet H.', pasangan: 'Simvastatin + Clarithromycin', sev: 'KONTRA', tone: 'bad', mekanisme: 'Inhibisi CYP3A4 -> risiko rabdomiolisis', maker: 'TTK Dimas R.', status: 'Ganti Azithromycin' },
  { rx: 'RX-261122-054', pasien: 'Ny. Ratna D.', pasangan: 'Captopril 25mg + Ibuprofen', sev: 'MODERAT', tone: 'warn', mekanisme: 'NSAID turunkan efek antihipertensi', maker: 'TTK Bagus A.', status: 'Ganti Paracetamol' },
  { rx: 'RX-261122-051', pasien: 'An. Rafa M.', pasangan: 'Amoxicillin Racikan (14 kg)', sev: 'VERIF DOSIS', tone: 'info', mekanisme: '26,8 mg/kg/hari (aman rentang 20–40)', maker: 'TTK Dimas R.', status: 'Disetujui APJ Lestari' },
  { rx: 'RX-261122-048', pasien: 'Tn. Hendro W.', pasangan: 'Metformin + Glibenclamide', sev: 'MODERAT', tone: 'warn', mekanisme: 'Potensi hipoglikemia bila telat makan', maker: 'TTK Sari N.', status: 'Konseling PIO OK' },
  { rx: 'RX-261122-043', pasien: 'Ny. Dewi A.', pasangan: 'Ciprofloxacin + Antasida', sev: 'MODERAT', tone: 'warn', mekanisme: 'Kelasi kation turunkan absorpsi 75%', maker: 'TTK Bagus A.', status: 'Jeda >=2 Jam Etiket' },
  { rx: 'RX-261122-039', pasien: 'Tn. Wahyu P.', pasangan: 'Amiodarone + Digoxin 0.25mg', sev: 'MAYOR', tone: 'bad', mekanisme: 'Kadar Digoxin plasma naik 2x (toksik)', maker: 'TTK Dimas R.', status: 'Turun Dosis 50% OK' },
  { rx: 'RX-261122-034', pasien: 'Ny. Sri M.', pasangan: 'Omeprazole + Clopidogrel', sev: 'MODERAT', tone: 'warn', mekanisme: 'Inhibisi CYP2C19 hambat antiplatelet', maker: 'TTK Sari N.', status: 'Ganti Pantoprazole' },
];

const DOA_MATRIX = [
  { role: 'APJ Pemegang SIPA', person: 'apt. Lestari Wijaya', fefoOverride: 'Ya (Wajib Alasan)', ootRelease: 'Ya (Biometrik)', racikanVerify: 'Approver Final', voidTx: 'Tanpa Batas', sipnapSign: 'Tanda Tangan ESIGN' },
  { role: 'Apoteker Pendamping', person: 'apt. Reza Mahendra', fefoOverride: 'Ya (<30h saja)', ootRelease: 'Delegasi Shift', racikanVerify: 'Approver Final', voidTx: '<= Rp 2.000.000', sipnapSign: 'Checker / Draft' },
  { role: 'TTK Meja Racik', person: 'Dimas R., A.Md.Farm', fefoOverride: 'Diblokir Sistem', ootRelease: 'Terkunci (403)', racikanVerify: 'Maker / Peracik', voidTx: 'Diblokir', sipnapSign: 'Input Kartu Stok' },
  { role: 'TTK Kasir Resep', person: 'Sari N., A.Md.Farm', fefoOverride: 'Diblokir Sistem', ootRelease: 'Terkunci (403)', racikanVerify: 'Baca Saja', voidTx: 'Minta Otorisasi', sipnapSign: 'Baca Saja' },
  { role: 'Admin Gudang PBF', person: 'Rudi Hartono', fefoOverride: 'Retur PBF Saja', ootRelease: 'Terkunci (403)', racikanVerify: 'Tidak Ada Akses', voidTx: 'Diblokir', sipnapSign: 'Faktur Masuk PBF' },
  { role: 'Kasir OTC Frontliner', person: 'Nanda Putri', fefoOverride: 'Diblokir Sistem', ootRelease: 'Terkunci (403)', racikanVerify: 'Tidak Ada Akses', voidTx: 'Diblokir', sipnapSign: 'Tidak Ada Akses' },
];

const WORM_LOGS = [
  { ts: '14:17:42', actor: 'apt. Lestari (APJ)', event: 'SIPNAP_LOCK_TRIGGER', target: 'RX-261122-074 · Alprazolam 0.5mg', hash: 'sha256:9e4b1c...7f2a', tone: 'bad' },
  { ts: '14:15:18', actor: 'TTK Dimas R.', event: 'FEFO_BATCH_PICK', target: 'RAC-09 · AMX2604 (3 tab) + PCM2511 (3 tab)', hash: 'sha256:4a8d0f...2c91', tone: 'ok' },
  { ts: '14:12:04', actor: 'apt. Lestari (APJ)', event: 'DDI_INTERVENTION_OK', target: 'RX-261122-059 · Clarithromycin -> Azithromycin', hash: 'sha256:7c1e9b...5d08', tone: 'warn' },
  { ts: '14:08:51', actor: 'SATUSEHAT_BRIDGE', event: 'FHIR_DISPENSE_201', target: 'MedicationDispense/md-261122-064 · KFA OK', hash: 'sha256:2f6a3e...8a14', tone: 'info' },
  { ts: '14:03:29', actor: 'apt. Lestari (APJ)', event: 'SIPNAP_DISPENSE_OK', target: 'RX-261122-065 · Diazepam 2mg (10 tab) · SIP+NIK', hash: 'sha256:b3d91a...4e60', tone: 'ok' },
  { ts: '13:57:11', actor: 'SYSTEM_CHILLER_IOT', event: 'COLD_CHAIN_PROBE', target: 'Chiller CH-01 · 4,2°C (Batas 2,0–8,0°C)', hash: 'sha256:61c4e8...9b33', tone: 'ok' },
];

// P8: Integrations & Peripherals
const INTEGRATIONS = [
  { name: 'SATUSEHAT FHIR R4 (MedicationDispense)', proto: 'REST OAuth2 · TLS 1.3', p95: '184 ms', sync: '74/74 Resep', queue: '0 Antre', status: 'Online', tone: 'ok' },
  { name: 'BPOM Master KFA & NIE Verifier', proto: 'HTTPS Sync · Delta', p95: '112 ms', sync: '98.420 SKU', queue: 'Sinkron 06:00', status: 'Aktif', tone: 'ok' },
  { name: 'Kemenkes SIPNAP Reporting Gateway', proto: 'XML/CSV Signed API', p95: '248 ms', sync: '0 Selisih', queue: 'Siap Kirim', status: 'Verified', tone: 'ok' },
  { name: 'QRIS Dinamis SNAP BI (Bank Mandiri)', proto: 'SNAP BI v1.1 Webhook', p95: '142 ms', sync: '46 Tx · 100%', queue: '0 Pending', status: 'Settled', tone: 'ok' },
  { name: 'BPJS Apotek Online (PRB & Kronis)', proto: 'REST WS-BPJS v2.1', p95: '416 ms', sync: '16 SEP OK', queue: '0 Retry', status: 'Degraded p95', tone: 'warn' },
  { name: 'Dukcapil / IKD Verifikator NIK OOT', proto: 'mTLS Masked Lookup', p95: '164 ms', sync: '64 NIK Valid', queue: '0 Gagal', status: 'Online', tone: 'ok' },
  { name: 'CoreTax DJP e-Faktur Digunggung', proto: 'Batch XML Signed', p95: '218 ms', sync: 'Rp 1,505 jt', queue: 'Shift #01 OK', status: 'Siap Kirim', tone: 'ok' },
  { name: 'PostgreSQL Master <- SQLite Lokal WPF', proto: 'WAL Logical Sync', p95: '18 ms', sync: '100% Replikasi', queue: '0 Lag', status: 'Offline-Safe', tone: 'ok' },
];

// ============================================================================
// DERIVED TOTALS & PROGRAMMATIC MATH VERIFICATION
// ============================================================================
const TOTAL_RESEP_TODAY = RX_CHANNELS.reduce((a, c) => a + c.count, 0);
const ACTIVE_KDS_COUNT = KDS_LANES.reduce((a, l) => a + l.tickets.length, 0);
const POS_CART_SUBTOTAL = POS_CART_ACTIVE.reduce((a, i) => a + i.qty * i.unitPrice, 0);
const POS_CART_PPN = Math.round(POS_CART_SUBTOTAL * 0.11);
const POS_CART_TOTAL = POS_CART_SUBTOTAL + POS_CART_PPN;
const RACIKAN_BAHAN_TOTAL = RACIKAN_BOM.reduce((a, b) => a + b.ambilQty * b.hppUnit, 0);
const RACIKAN_GRAND_TOTAL = RACIKAN_BAHAN_TOTAL + RACIKAN_TUSLAH + RACIKAN_EMBALASE;
const NEAR_EXP_60_COUNT = FEFO_BATCHES.filter((b) => b.daysLeft < 60).length;
const NEAR_EXP_90_COUNT = FEFO_BATCHES.filter((b) => b.daysLeft >= 60 && b.daysLeft <= 90).length;
const TOTAL_INV_VALUE = FEFO_BATCHES.reduce((a, b) => a + b.qty * b.hpp, 0);
const TOTAL_SIPNAP_SELISIH = SIPNAP_LEDGER.reduce((a, r) => a + Math.abs(r.fisik - r.akhir), 0);
const SHIFT_TOTAL_EXPECTED = SHIFT_TENDERS.reduce((a, t) => a + t.expected, 0);
const SHIFT_TOTAL_ACTUAL = SHIFT_TENDERS.reduce((a, t) => a + t.actual, 0);
const SHIFT_TOTAL_TX = SHIFT_TENDERS.reduce((a, t) => a + t.tx, 0);
const CASH_DRAWER_GROSS = CASH_DENOMS.reduce((a, d) => a + d.nominal * d.qty, 0);
const CASH_DRAWER_NET = CASH_DRAWER_GROSS - MODAL_AWAL_LACI;
const JOURNAL_DEBIT = PSAK_JOURNAL.reduce((a, j) => a + j.debit, 0);
const JOURNAL_KREDIT = PSAK_JOURNAL.reduce((a, j) => a + j.kredit, 0);

export function verifyMath() {
  if (TOTAL_RESEP_TODAY !== 74) throw new Error(`TOTAL_RESEP_TODAY=${TOTAL_RESEP_TODAY}, expected 74`);
  if (KDS_COMPLETED_TODAY + ACTIVE_KDS_COUNT !== TOTAL_RESEP_TODAY) {
    throw new Error(`KDS sum ${KDS_COMPLETED_TODAY + ACTIVE_KDS_COUNT} !== ${TOTAL_RESEP_TODAY}`);
  }
  if (POS_CART_SUBTOTAL !== 66000) throw new Error(`POS_CART_SUBTOTAL=${POS_CART_SUBTOTAL}`);
  if (POS_CART_PPN !== 7260) throw new Error(`POS_CART_PPN=${POS_CART_PPN}`);
  if (POS_CART_TOTAL !== 73260) throw new Error(`POS_CART_TOTAL=${POS_CART_TOTAL}`);
  if (RACIKAN_BAHAN_TOTAL !== 24500) throw new Error(`RACIKAN_BAHAN_TOTAL=${RACIKAN_BAHAN_TOTAL}`);
  if (RACIKAN_GRAND_TOTAL !== 34000) throw new Error(`RACIKAN_GRAND_TOTAL=${RACIKAN_GRAND_TOTAL}`);
  const racCartItem = POS_CART_ACTIVE.find((x) => x.code === 'RAC-09');
  if (!racCartItem || racCartItem.unitPrice !== RACIKAN_GRAND_TOTAL) {
    throw new Error(`RAC-09 price mismatch between P1 and P3`);
  }
  if (NEAR_EXP_60_COUNT !== 5) throw new Error(`NEAR_EXP_60_COUNT=${NEAR_EXP_60_COUNT}, expected 5`);
  for (const row of SIPNAP_LEDGER) {
    if (row.awal + row.masuk - row.keluar !== row.akhir) {
      throw new Error(`SIPNAP balance error on ${row.code}`);
    }
    if (row.fisik !== row.akhir) {
      throw new Error(`SIPNAP physical mismatch on ${row.code}`);
    }
  }
  if (TOTAL_SIPNAP_SELISIH !== 0) throw new Error(`TOTAL_SIPNAP_SELISIH=${TOTAL_SIPNAP_SELISIH}`);
  if (SHIFT_TOTAL_EXPECTED !== 18425000 || SHIFT_TOTAL_ACTUAL !== 18425000) {
    throw new Error(`Shift settlement total mismatch: ${SHIFT_TOTAL_EXPECTED} vs ${SHIFT_TOTAL_ACTUAL}`);
  }
  if (CASH_DRAWER_NET !== SHIFT_TENDERS[0].actual) {
    throw new Error(`Cash drawer net ${CASH_DRAWER_NET} !== Tunai ${SHIFT_TENDERS[0].actual}`);
  }
  const sumHourly =
    (HOURLY_REVENUE.tunai.reduce((a, v) => a + v, 0) +
      HOURLY_REVENUE.qris.reduce((a, v) => a + v, 0) +
      HOURLY_REVENUE.edc.reduce((a, v) => a + v, 0) +
      HOURLY_REVENUE.bpjs.reduce((a, v) => a + v, 0)) *
    1000;
  if (sumHourly !== SHIFT_TOTAL_EXPECTED) {
    throw new Error(`Hourly chart sum ${sumHourly} !== Shift total ${SHIFT_TOTAL_EXPECTED}`);
  }
  if (JOURNAL_DEBIT !== JOURNAL_KREDIT) {
    throw new Error(`PSAK Journal unbalanced: Debit=${JOURNAL_DEBIT} Kredit=${JOURNAL_KREDIT}`);
  }
  if (JOURNAL_DEBIT !== 30605000) {
    throw new Error(`PSAK Journal total=${JOURNAL_DEBIT}`);
  }
}

// ============================================================================
// DISTINCTIVE CLINICAL POS / WPF SHELL CHROME (Emerald Ribbon + 68px Icon Rail)
// ============================================================================
const NAV_ITEMS = [
  { id: 'p1', key: 'F1', icon: 'pos', label: 'Kasir POS', badge: '74' },
  { id: 'p2', key: 'F2', icon: 'kds', label: 'Antrean KDS', badge: '12' },
  { id: 'p3', key: 'F3', icon: 'mortar', label: 'Racikan', badge: '18' },
  { id: 'p4', key: 'F4', icon: 'shelf', label: 'Stok FEFO', badge: '5!', warn: true },
  { id: 'p5', key: 'F5', icon: 'sipnap', label: 'SIPNAP', badge: '0' },
  { id: 'p6', key: 'F6', icon: 'cash', label: 'Shift Kas', badge: 'OK' },
  { id: 'p7', key: 'F7', icon: 'clinical', label: 'DDI & DoA', badge: '2!', warn: true },
  { id: 'p8', key: 'F8', icon: 'device', label: 'Integrasi', badge: '8/8' },
];

const EXTRA_CSS = `
  /* ApotekPOS WPF Clinical Touch Chrome — Flat, High-Contrast, Zero Gradient */
  .ap-ribbon {
    height: 42px;
    background: #064e3b;
    color: #ecfdf5;
    border-bottom: 1px solid #043b2c;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .ap-ribbon-l, .ap-ribbon-r {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ap-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 13px;
    color: #ffffff;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .ap-logo-box {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #10b981;
    color: #052e16;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-weight: 800;
    font-size: 11px;
  }
  .ap-pill {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #053b2c;
    border: 1px solid #0d6e53;
    color: #d1fae5;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .ap-pill-strict {
    background: #047857;
    border-color: #34d399;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 9.6px;
    font-weight: 700;
  }
  .ap-search {
    height: 26px;
    width: 270px;
    padding: 0 9px;
    border-radius: 3px;
    background: #04382a;
    border: 1px solid #0e6f54;
    color: #a7f3d0;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .ap-apj-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid #0d6e53;
    white-space: nowrap;
  }
  .ap-apj-av {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #d1fae5;
    color: #064e3b;
    font-size: 10px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Left Touch Icon Rail (68px) */
  .ap-body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .ap-rail {
    width: 68px;
    background: #0a2920;
    border-right: 1px solid #064e3b;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6px 4px;
    flex-shrink: 0;
  }
  .ap-rail-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ap-rail-btn {
    position: relative;
    height: 62px;
    border-radius: 4px;
    padding: 6px 3px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #9ec5b7;
    font-size: 9.2px;
    font-weight: 600;
    text-align: center;
    border: 1px solid transparent;
  }
  .ap-rail-btn.is-active {
    background: #047857;
    border-color: #34d399;
    color: #ffffff;
  }
  .ap-rail-key {
    position: absolute;
    top: 3px;
    left: 4px;
    font-family: var(--e-mono);
    font-size: 8px;
    color: #6ea895;
  }
  .ap-rail-btn.is-active .ap-rail-key { color: #a7f3d0; }
  .ap-rail-cnt {
    position: absolute;
    top: 3px;
    right: 3px;
    font-family: var(--e-mono);
    font-size: 8px;
    font-weight: 700;
    padding: 0 3.5px;
    border-radius: 2px;
    background: #124234;
    color: #a7f3d0;
  }
  .ap-rail-cnt.warn {
    background: #be123c;
    color: #ffffff;
  }
  .ap-rail-btn.is-active .ap-rail-cnt {
    background: #064e3b;
    color: #ffffff;
  }
  .ap-rail-foot {
    padding: 6px 3px;
    border-top: 1px solid #134436;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #86efac;
    font-family: var(--e-mono);
    font-size: 8.4px;
    text-align: center;
  }

  /* Workspace Subbar & Content */
  .ap-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .ap-subbar {
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
  .ap-content {
    flex: 1;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Touch POS SKU Tiles */
  .pos-tile {
    background: #ffffff;
    border: 1px solid #cfd9d4;
    border-radius: 4px;
    padding: 7px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
    min-width: 0;
  }
  .pos-tile.is-in-cart {
    border-color: #047857;
    background: #f2fbf7;
    box-shadow: inset 3px 0 0 #047857;
  }
  .pos-tile.is-warn {
    border-color: #d97706;
    background: #fffdf5;
    box-shadow: inset 3px 0 0 #d97706;
  }
  .pos-tile.is-locked {
    border-color: #be123c;
    background: #fff5f6;
    box-shadow: inset 3px 0 0 #be123c;
  }
  .pos-cat-chip {
    height: 23px;
    padding: 0 9px;
    border-radius: 3px;
    border: 1px solid #c5d3cc;
    background: #ffffff;
    color: #334e44;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .pos-cat-chip.is-active {
    background: #047857;
    border-color: #047857;
    color: #ffffff;
  }

  /* KDS Lane Ticket */
  .kds-lane {
    background: #edf2ef;
    border: 1px solid #cbd7d1;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .kds-lane-head {
    height: 34px;
    padding: 0 9px;
    background: #ffffff;
    border-bottom: 1px solid #cbd7d1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .kds-lane-body {
    padding: 7px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .kds-card {
    background: #ffffff;
    border: 1px solid #cfd9d4;
    border-radius: 4px;
    padding: 7px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .kds-card.sev-bad { border-left: 3px solid #be123c; }
  .kds-card.sev-warn { border-left: 3px solid #d97706; }
  .kds-card.sev-ok { border-left: 3px solid #047857; }

  /* Realistic Thermal Etiket Sticker */
  .etiket-paper {
    background: #ffffff;
    border: 1.5px solid #1e293b;
    border-radius: 3px;
    padding: 8px 10px;
    color: #0f172a;
    font-family: var(--e-sans);
  }
  .etiket-blue {
    background: #f0f9ff;
    border: 1.5px solid #0369a1;
    border-radius: 3px;
    padding: 7px 10px;
    color: #0c4a6e;
  }

  /* KV Row */
  .kv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 3.5px 0;
    border-bottom: 1px dashed #dde6e1;
    font-size: 10.6px;
  }
  .kv:last-child { border-bottom: 0; }
  .kv-k { color: var(--e-muted); font-weight: 500; }
  .kv-v { color: var(--e-text); font-weight: 700; text-align: right; }

  /* Kiosk Bezel */
  .kiosk-frame {
    background: #0f1f1a;
    border: 2px solid #1f3d33;
    border-radius: 6px;
    padding: 8px;
    color: #f0fdf4;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

function apotekShell({ activeNav, title, subtitle, actionsHtml = '', contentHtml = '' }) {
  const ribbon = `<header class="ap-ribbon">
    <div class="ap-ribbon-l">
      <div class="ap-logo">
        <span class="ap-logo-box">Rx</span>
        <span>ApotekPOS eResep</span>
      </div>
      <span class="ap-pill ap-pill-strict">FEFO KETAT · LOG SIPNAP AKTIF</span>
      <div class="ap-pill">
        ${pic('rx', 12, '#6ee7b7')}
        <span>Apotek Sehat Nusantara · Meja Resep #01</span>
      </div>
      <div class="ap-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#6ee7b7')}
          <span class="trunc">Scan GS1 Batch / Kode KFA / No. Resep / NIK...</span>
        </span>
        <span class="e-kbd" style="background:#064e3b;border-color:#10b981;color:#d1fae5;">F9</span>
      </div>
    </div>
    <div class="ap-ribbon-r">
      <div class="ap-pill">
        ${pic('printer', 12, '#86efac')}
        <span class="mono" style="font-size:9.8px;">Zebra ZD220 OK</span>
      </div>
      <div class="ap-pill">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">SATUSEHAT KFA · 22 Nov 2026 14:18 WIB</span>
      </div>
      <div class="ap-apj-chip">
        <span class="ap-apj-av">LW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#ffffff;">apt. Lestari Wijaya, S.Farm</div>
          <div class="mono" style="font-size:8.8px;color:#a7f3d0;">APJ · SIPA 446/2025/JKT-S</div>
        </div>
      </div>
    </div>
  </header>`;

  const rail = `<nav class="ap-rail">
    <div class="ap-rail-list">
      ${NAV_ITEMS.map((item) => {
        const active = item.id === activeNav;
        return `<div class="ap-rail-btn ${active ? 'is-active' : ''}">
          <span class="ap-rail-key">${item.key}</span>
          ${item.badge ? `<span class="ap-rail-cnt ${item.warn ? 'warn' : ''}">${esc(item.badge)}</span>` : ''}
          ${pic(item.icon, 17, active ? '#ffffff' : '#9ec5b7')}
          <span style="line-height:1.15;">${esc(item.label)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="ap-rail-foot">
      ${pic('thermometer', 13, '#6ee7b7')}
      <div>CH-01</div>
      <div style="color:#ffffff;font-weight:700;">4,2°C</div>
    </div>
  </nav>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> <span>.NET 8 WPF Hybrid v4.8.2 · SQLite WAL -> PostgreSQL 16 (0 ms lag)</span>`,
      `<span>Shift Pagi-Siang · 148 Struk (74 Resep + 74 OTC)</span>`,
      `<span>FEFO Strict Engine: <strong style="color:#047857;">ENFORCED</strong></span>`,
    ],
    rightItems: [
      `<span>SIPNAP Nov 2026: <strong style="color:#047857;">0 Selisih</strong></span>`,
      `<span>Printer: Zebra ZD220 + Epson TM-T82X</span>`,
      `<span>WORM SHA-256 Active</span>`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `ApotekPOS eResep — ${title}`,
    accent: '#047857',
    accentSoft: '#ecfdf5',
    accentInk: '#065f46',
    bg: '#f4f6f5',
    surface: '#ffffff',
    surface2: '#f8faf9',
    border: '#d3ddd8',
    borderStrong: '#b4c5bc',
    text: '#0f1f1a',
    text2: '#354b43',
    muted: '#5c7269',
    extraCss: EXTRA_CSS,
    bodyHtml: `
      ${ribbon}
      <div class="ap-body">
        ${rail}
        <div class="ap-main">
          <div class="ap-subbar">
            <div class="e-crumb">
              <span>ApotekPOS · Meja Resep — APJ apt. Lestari</span>
              ${ic('chevronRight', 12, '#8da39a')}
              <strong>${esc(title)}</strong>
              ${subtitle ? `<span style="color:#5c7269;margin-left:6px;font-size:10.5px;">${esc(subtitle)}</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              ${actionsHtml}
            </div>
          </div>
          <div class="ap-content">${contentHtml}</div>
        </div>
      </div>
      ${footer}
    `,
  });
}

// Helper for tiny barcode SVG (deterministic Code128 visual)
function svgBarcode(code, width = 180, height = 26) {
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 2, 3, 1, 2, 2, 1, 1, 3, 1, 2, 1, 2, 2];
  let x = 2;
  let bars = '';
  for (let i = 0; i < widths.length && x < width - 4; i++) {
    const w = widths[(i + code.length) % widths.length] * 1.4;
    if (i % 2 === 0) {
      bars += `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="#0f172a" />`;
    }
    x += w + 0.7;
  }
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block;">${bars}</svg>`;
}

// ============================================================================
// PAGE 1: KASIR MEJA RESEP & PENGAMBILAN BATCH FEFO (Toast/Square POS Split)
// ============================================================================
function renderP1() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Resep Hari Ini</span>${badge('74 resep', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">74 resep</span>
        ${svgSparkline({ points: [8, 16, 29, 41, 52, 63, 74], width: 68, height: 20, color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>62 selesai · 12 di antrean KDS</span><span class="mono">Racikan: 18</span></div>
    </div>
    <div class="e-kpi" style="border-color:#f59e0b;background:#fffdf7;">
      <div class="e-kpi-top"><span>Dekat Exp &lt;60h</span>${badge('5 batch', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">${NEAR_EXP_60_COUNT} batch</span>
        ${svgSparkline({ points: [9, 8, 7, 7, 6, 5, 5], width: 68, height: 20, color: '#b45309' })}
      </div>
      <div class="e-kpi-foot"><span>Prioritas keluar FEFO otomatis</span><span class="mono">1 Kritis &lt;30h</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Selisih SIPNAP</span>${badge('0 selisih', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">${TOTAL_SIPNAP_SELISIH} selisih</span>
        ${svgSparkline({ points: [0, 0, 0, 0, 0, 0, 0], width: 68, height: 20, color: '#047857', fill: false })}
      </div>
      <div class="e-kpi-foot"><span>${SIPNAP_LEDGER.length} item Psiko/Narko/OOT sinkron</span><span class="mono">Kunci APJ ON</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Omzet Shift Berjalan</span>${badge('QRIS + Tunai + BPJS', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdr(SHIFT_TOTAL_ACTUAL)}</span>
        ${svgSparkline({ points: [1720, 3500, 3425, 3670, 2510, 2200, 1400], width: 68, height: 20, color: '#0369a1' })}
      </div>
      <div class="e-kpi-foot"><span>${SHIFT_TOTAL_TX} transaksi terverifikasi</span><span class="mono">Selisih Rp 0</span></div>
    </div>
  </div>`;

  const catalogTiles = POS_CATALOG.map((item) => {
    const inCart = POS_CART_ACTIVE.some((c) => c.code === item.code);
    const cls = item.locked ? 'is-locked' : inCart ? 'is-in-cart' : item.days < 60 ? 'is-warn' : '';
    return `<div class="pos-tile ${cls}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span class="mono" style="font-size:9.5px;font-weight:700;color:#475569;">${esc(item.code)} · ${esc(item.kfa)}</span>
        ${badge(item.badgeTxt, item.tone)}
      </div>
      <div style="font-size:11.2px;font-weight:700;color:#0f1f1a;line-height:1.25;">${esc(item.name)}</div>
      <div style="font-size:9.6px;color:#5c7269;display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span class="mono">Lot ${esc(item.batch)}</span>
        <span class="mono">Exp ${esc(item.exp)}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid #e6eeea;margin-top:2px;">
        <span class="mono" style="font-size:11.8px;font-weight:800;color:${item.locked ? '#be123c' : '#047857'};">${item.locked ? 'Terkunci' : fmtIdr(item.price)}</span>
        <span class="mono" style="font-size:9.4px;color:#475569;">Stok ${item.stock} · ${esc(item.cls)}</span>
      </div>
    </div>`;
  }).join('');

  const cartRows = POS_CART_ACTIVE.map((c, idx) => `
    <div style="padding:7px 9px;border-bottom:1px solid #e3ebe7;background:${idx % 2 === 1 ? '#f9fbfa' : '#ffffff'};">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <span class="mono" style="font-size:9.8px;font-weight:700;color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;padding:1px 5px;border-radius:2px;">${esc(c.code)}</span>
          <strong class="trunc" style="font-size:11.2px;">${esc(c.title)}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          ${badge(c.status, c.tone)}
          <span class="mono" style="font-size:11.6px;font-weight:800;min-width:74px;text-align:right;">${fmtIdr(c.unitPrice * c.qty)}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:3px;font-size:9.8px;color:#5c7269;">
        <span class="trunc">${esc(c.sub)}</span>
        <span class="mono" style="color:#0f1f1a;flex-shrink:0;">Etiket: ${esc(c.signa)}</span>
      </div>
    </div>
  `).join('');

  const content = `
    ${kpiStrip}
    <div style="display:grid;grid-template-columns:1.38fr 1fr;gap:9px;flex:1;min-height:0;">
      <!-- LEFT: Touch Catalog & Active e-Resep Context -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${pic('barcode', 14, '#047857')} Katalog KFA BPOM & Pemilihan Batch FEFO Otomatis</div>
          <div style="display:flex;align-items:center;gap:5px;">
            <span class="pos-cat-chip is-active">Semua (12)</span>
            <span class="pos-cat-chip">Wajib Resep</span>
            <span class="pos-cat-chip">Racikan</span>
            <span class="pos-cat-chip">Alert Exp &lt;60h (5)</span>
            <span class="pos-cat-chip" style="border-color:#fecdd3;color:#be123c;background:#fff1f2;">Psikotropika / OOT</span>
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <!-- Active Prescription Strip -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;gap:10px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:10px;min-width:0;">
              ${pic('rx', 18, '#047857')}
              <div style="line-height:1.3;">
                <div style="font-size:11.3px;font-weight:700;color:#064e3b;">e-Resep Aktif: <span class="mono">RX-261122-074</span> · Ny. Aminah (52 th · RM-004819)</div>
                <div style="font-size:10px;color:#065f46;">Dokter: <strong>dr. Hendra Kusuma</strong> · SIP <span class="mono">446/112/Dinkes-JKT/2024</span> · Poli Penyakit Dalam · Alergi: <strong style="color:#be123c;">Sulfonamida</strong></div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              ${badge('SATUSEHAT KFA Terhubung', 'ok')}
              ${badge('FEFO Kunci Batch #1', 'accent')}
            </div>
          </div>

          <!-- 3x4 Touch-Ergonomic SKU Grid -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:7px;flex:1;min-height:0;">
            ${catalogTiles}
          </div>

          <!-- Thermal Etiket Live Snippet Bar -->
          <div style="padding:6px 9px;background:#f8faf9;border:1px solid #cbd7d1;border-radius:4px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:7px;min-width:0;">
              ${pic('printer', 14, '#047857')}
              <span class="mono trunc" style="font-size:10px;color:#0f1f1a;"><strong>Cetak Etiket:</strong> Ny. Aminah | Amoxicillin 500mg | 3x sehari 1 kaplet sesudah makan (HABISKAN) | Batch AMX2604.</span>
            </div>
            <span class="e-badge e-badge-ok">4 Label Siap</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Live Bill, Psikotropika Lock Gate & Split Payment Terminal -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${pic('pos', 14, '#047857')} Rincian Meja Resep #01 · RX-261122-074</div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('4 Item FEFO + 1 Terkunci', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div>
            ${cartRows}
            <!-- Locked Psikotropika Item Gate -->
            <div style="margin:7px 9px;padding:8px 9px;background:#fff1f2;border:1px solid #fda4af;border-radius:4px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  ${ic('lock', 13, '#be123c')}
                  <span class="mono" style="font-size:9.8px;font-weight:700;color:#be123c;">${POS_CART_LOCKED.code}</span>
                  <strong style="font-size:11px;color:#881337;">${esc(POS_CART_LOCKED.title)}</strong>
                </div>
                <div style="display:flex;align-items:center;gap:5px;">
                  ${badge(POS_CART_LOCKED.status, 'bad')}
                  <span class="mono" style="font-size:11px;font-weight:800;color:#be123c;">Terkunci</span>
                </div>
              </div>
              <div style="font-size:9.8px;color:#9f1239;margin-top:3px;">${esc(POS_CART_LOCKED.sub)}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:5px;margin-top:6px;">
                <div style="background:#ffffff;border:1px solid #fecdd3;border-radius:3px;padding:3px 6px;font-size:9.5px;">
                  <div style="color:#9f1239;font-size:8.5px;font-weight:600;">SIP DOKTER (KKI)</div>
                  <div class="mono" style="font-weight:700;color:#047857;">446/112 · VALID</div>
                </div>
                <div style="background:#ffffff;border:1px solid #fecdd3;border-radius:3px;padding:3px 6px;font-size:9.5px;">
                  <div style="color:#9f1239;font-size:8.5px;font-weight:600;">NIK PASIEN (e-KTP)</div>
                  <div class="mono" style="font-weight:700;color:#be123c;">Menunggu Pindai...</div>
                </div>
                <div class="e-btn e-btn-danger" style="height:auto;padding:0 8px;">Buka via OTP APJ</div>
              </div>
            </div>

            <!-- Clinical Quick Screening & PIO Counseling Box (fills POS bill body richly) -->
            <div style="margin:7px 9px;padding:7px 9px;background:#f8faf9;border:1px solid #d3ddd8;border-radius:4px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                <span style="font-size:10.3px;font-weight:700;color:#065f46;display:inline-flex;align-items:center;gap:5px;">${pic('clinical', 13, '#047857')} Skrining Klinis Cepat &amp; Catatan PIO (Ny. Aminah)</span>
                ${badge('Alergi Aman', 'ok')}
              </div>
              <div class="kv"><span class="kv-k">Cek Interaksi Obat (DDI 4 Item Aktif)</span><span class="kv-v" style="color:#047857;">0 Interaksi Mayor</span></div>
              <div class="kv"><span class="kv-k">Cek Alergi Pasien (Sulfonamida)</span><span class="kv-v" style="color:#047857;">Bebas Gol. Sulfa · Aman</span></div>
              <div class="kv"><span class="kv-k">Edukasi Wajib PIO di Loket</span><span class="kv-v">Habiskan Amoxicillin 10 kaplet (3x1)</span></div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:6px;">
                <span class="e-btn" style="justify-content:center;font-size:9.8px;">Uang Pas</span>
                <span class="e-btn mono" style="justify-content:center;font-size:9.8px;">Rp 75.000</span>
                <span class="e-btn mono" style="justify-content:center;font-size:9.8px;">Rp 100.000</span>
                <span class="e-btn" style="justify-content:center;font-size:9.8px;">Split Bayar</span>
              </div>
            </div>
          </div>

          <!-- Financial Summary + Split Payment Touch Pad -->
          <div style="border-top:1px solid #cbd7d1;background:#f8faf9;padding:9px 11px;display:flex;flex-direction:column;gap:7px;">
            <div>
              <div class="kv"><span class="kv-k">Subtotal Obat &amp; Racikan Tervalidasi (4 item)</span><span class="kv-v mono">${fmtIdr(POS_CART_SUBTOTAL)}</span></div>
              <div class="kv"><span class="kv-k">Termasuk Tuslah &amp; Embalase Racikan RAC-09</span><span class="kv-v mono" style="color:#047857;">Rp 9.500 (inkl.)</span></div>
              <div class="kv"><span class="kv-k">PPN Keluaran 11% (CoreTax e-Faktur)</span><span class="kv-v mono">${fmtIdr(POS_CART_PPN)}</span></div>
              <div class="kv" style="padding-top:6px;border-top:1px solid #b4c5bc;border-bottom:0;">
                <span style="font-size:12.5px;font-weight:800;color:#0f1f1a;">TOTAL TAGIHAN AKTIF</span>
                <span class="mono" style="font-size:18px;font-weight:800;color:#047857;">${fmtIdr(POS_CART_TOTAL)}</span>
              </div>
            </div>

            <!-- Payment Method Selector -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
              <div style="padding:6px 5px;border:1.5px solid #047857;background:#ecfdf5;border-radius:4px;text-align:center;">
                <div style="font-size:10px;font-weight:700;color:#065f46;display:flex;align-items:center;justify-content:center;gap:4px;">${pic('qris', 12, '#047857')} QRIS</div>
                <div class="mono" style="font-size:8.6px;color:#047857;">SNAP BI Aktif</div>
              </div>
              <div style="padding:6px 5px;border:1px solid #cbd7d1;background:#ffffff;border-radius:4px;text-align:center;">
                <div style="font-size:10px;font-weight:700;color:#334e44;">Tunai</div>
                <div class="mono" style="font-size:8.6px;color:#64748b;">Laci RJ11</div>
              </div>
              <div style="padding:6px 5px;border:1px solid #cbd7d1;background:#ffffff;border-radius:4px;text-align:center;">
                <div style="font-size:10px;font-weight:700;color:#334e44;">EDC Debit</div>
                <div class="mono" style="font-size:8.6px;color:#64748b;">Mandiri/BCA</div>
              </div>
              <div style="padding:6px 5px;border:1px solid #bae6fd;background:#f0f9ff;border-radius:4px;text-align:center;">
                <div style="font-size:10px;font-weight:700;color:#0369a1;">BPJS PRB</div>
                <div class="mono" style="font-size:8.6px;color:#0369a1;">Klaim SEP</div>
              </div>
            </div>

            <!-- Primary Touch CTA Row -->
            <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:6px;">
              <div class="e-btn" style="height:34px;justify-content:center;font-size:11px;">${ic('download', 13, '#065f46')} Ekspor SIPNAP</div>
              <div class="e-btn e-btn-primary" style="height:34px;justify-content:center;font-size:11.5px;font-weight:700;">${pic('printer', 14, '#ffffff')} Cetak Etiket &amp; Bayar (${fmtIdr(POS_CART_TOTAL)})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p1',
    title: 'Kasir Meja Resep & Pengambilan Batch FEFO',
    subtitle: 'Terminal Touch WPF · Penguncian Batch First-Expired-First-Out & Verifikasi Psikotropika',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 12, '#047857')} Tarik e-Resep SATUSEHAT</span>
      <span class="e-btn">${ic('download', 12, '#047857')} Ekspor SIPNAP</span>
      <span class="e-btn e-btn-primary">${pic('printer', 12, '#ffffff')} Cetak Etiket &amp; Bayar</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 2: PAPAN ANTREAN & DISPATCH MEJA RACIK (KDS FARMASI)
// ============================================================================
function renderP2() {
  const lanesHtml = KDS_LANES.map((lane) => {
    const cards = lane.tickets.map((t) => {
      const sevCls = t.slaState === 'bad' ? 'sev-bad' : t.slaState === 'warn' ? 'sev-warn' : 'sev-ok';
      const timerTone = t.slaState === 'bad' ? 'bad' : t.slaState === 'warn' ? 'warn' : 'ok';
      return `<div class="kds-card ${sevCls}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:5px;">
          <span class="mono" style="font-size:10.5px;font-weight:800;color:#0f1f1a;">${esc(t.rx)}</span>
          <span class="e-badge e-badge-${timerTone} mono">${ic('clock', 10, 'currentColor')} ${esc(t.elapsed)}</span>
        </div>
        <div style="font-size:11.2px;font-weight:700;color:#0f1f1a;">${esc(t.patient)}</div>
        <div style="font-size:9.6px;color:#5c7269;">${esc(t.dokter)} · <strong>${esc(t.type)}</strong> (${t.items} item)</div>
        <div style="padding:4px 6px;background:#f8faf9;border:1px solid #e1eae5;border-radius:3px;font-size:9.7px;color:#273e36;line-height:1.3;">${esc(t.note)}</div>
        ${
          t.progress != null
            ? `<div style="margin-top:2px;">${renderCapacityBar(t.progress, { warnAt: 85, critAt: 96 })}</div>`
            : ''
        }
        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:2px;">
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            ${t.tags.map((tg) => badge(tg, tg.includes('SIPNAP') || tg.includes('DDI') || tg.includes('CITO') ? 'bad' : tg.includes('BPJS') || tg.includes('Chiller') ? 'info' : 'ok')).join('')}
          </div>
          <span style="font-size:9.2px;font-weight:700;color:#047857;">Lanjut &rarr;</span>
        </div>
      </div>`;
    }).join('');

    return `<div class="kds-lane">
      <div class="kds-lane-head">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <strong style="font-size:11.2px;color:#0f1f1a;" class="trunc">${esc(lane.title)}</strong>
          ${badge(String(lane.tickets.length), lane.tone)}
        </div>
        <span class="mono" style="font-size:9.3px;color:#5c7269;">${esc(lane.sla)}</span>
      </div>
      <div class="kds-lane-body">
        ${cards}
        ${
          lane.id === 'serah'
            ? `<div style="margin-top:auto;background:#ffffff;border:1px solid #a7f3d0;border-radius:4px;padding:8px 9px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                  <strong style="font-size:10.3px;color:#065f46;">Serah Terakhir (62 Selesai Hari Ini)</strong>
                  ${badge('TV Antrean ON', 'ok')}
                </div>
                <div class="kv"><span class="kv-k mono">R-062 · Tn. Hendro W.</span><span class="kv-v mono" style="color:#047857;">14:11 · 5m 40d</span></div>
                <div class="kv"><span class="kv-k mono">R-061 · Ny. Ratna D.</span><span class="kv-v mono" style="color:#047857;">14:06 · 7m 12d</span></div>
                <div class="kv"><span class="kv-k mono">R-060 · Tn. Slamet H.</span><span class="kv-v mono" style="color:#047857;">13:58 · 11m 05d</span></div>
                <div class="kv"><span class="kv-k mono">R-059 · An. Farhan</span><span class="kv-v mono" style="color:#047857;">13:51 · 14m 20d</span></div>
              </div>`
            : ''
        }
      </div>
    </div>`;
  }).join('');

  const content = `
    <!-- Top Live Dispatch KPI & SLA Summary Ribbon -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Resep Hari Ini</span>${badge('100% Terlacak', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_RESEP_TODAY}</span><span class="mono" style="font-size:10px;color:#047857;">62 Selesai · 12 Aktif</span></div>
        <div class="e-kpi-foot"><span>Umum 32 · Racikan 18 · BPJS 16 · OOT 8</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Median Waktu Non-Racik</span>${badge('SLA <= 10m', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">6m 18d</span><span class="mono" style="font-size:10px;color:#047857;">p95: 9m 12d</span></div>
        <div class="e-kpi-foot"><span>Standar PMK 73/2016: &lt;= 15 menit</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Median Waktu Racikan</span>${badge('SLA <= 20m', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">14m 45d</span><span class="mono" style="font-size:10px;color:#b45309;">p95: 19m 30d</span></div>
        <div class="e-kpi-foot"><span>2 Mortar Aktif + Timbangan 0,01g</span></div>
      </div>
      <div class="e-kpi" style="border-color:#fda4af;background:#fff5f6;">
        <div class="e-kpi-top"><span>Antrean CITO / DDI Tahan</span>${badge('2 Perlu APJ', 'bad')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">2 resep</span><span class="mono" style="font-size:10px;color:#be123c;">RX-073 &amp; RX-074</span></div>
        <div class="e-kpi-foot"><span>1 DDI Mayor Warfarin · 1 Lock SIPNAP</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kepatuhan Konseling PIO</span>${badge('PMK 73 OK', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">98,4%</span><span class="mono" style="font-size:10px;color:#0369a1;">61/62 Resep</span></div>
        <div class="e-kpi-foot"><span>Wajib untuk Antibiotik, Insulin &amp; OOT</span></div>
      </div>
    </div>

    <!-- 4-Column Pharmacy KDS Kanban Board -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;flex:1;min-height:0;">
      ${lanesHtml}
    </div>

    <!-- Bottom Station Load & Dispensing Throughput Bar -->
    <div class="e-panel" style="flex:0 0 112px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${pic('mortar', 14, '#047857')} Beban Stasiun Kerja Meja Racik &amp; Alokasi Petugas Shift Pagi-Siang</div>
        <span class="e-panel-sub">Pembaruan real-time SignalR · Sinkron layar TV antrean ruang tunggu</span>
      </div>
      <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:center;">
        <div style="border-right:1px solid #e1eae5;padding-right:10px;">
          <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:4px;"><strong>Meja Skrining APJ</strong><span class="mono" style="color:#047857;">apt. Lestari</span></div>
          ${renderCapacityBar(64, { warnAt: 80, critAt: 95 })}
          <div style="font-size:9.4px;color:#5c7269;margin-top:3px;">3 menunggu · Rata-rata skrining 2m 10d</div>
        </div>
        <div style="border-right:1px solid #e1eae5;padding-right:10px;">
          <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:4px;"><strong>Stasiun Racik #1 (Puyer)</strong><span class="mono" style="color:#b45309;">TTK Dimas R.</span></div>
          ${renderCapacityBar(82, { warnAt: 80, critAt: 95 })}
          <div style="font-size:9.4px;color:#5c7269;margin-top:3px;">Aktif: RAC-09 (10 bks) · Mortar &amp; Blender steril</div>
        </div>
        <div style="border-right:1px solid #e1eae5;padding-right:10px;">
          <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:4px;"><strong>Stasiun Racik #2 (Salep/Kaps)</strong><span class="mono" style="color:#047857;">TTK Bagus A.</span></div>
          ${renderCapacityBar(58, { warnAt: 80, critAt: 95 })}
          <div style="font-size:9.4px;color:#5c7269;margin-top:3px;">Aktif: RX-070 Pot 20g · Timbangan kalibrasi OK</div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:4px;"><strong>Loket PIO &amp; Printer Etiket</strong><span class="mono" style="color:#047857;">apt. Reza M.</span></div>
          ${renderCapacityBar(46, { warnAt: 80, critAt: 95 })}
          <div style="font-size:9.4px;color:#5c7269;margin-top:3px;">2 siap serah · Zebra ZD220: 148 label tersisa</div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p2',
    title: 'Papan Antrean & Dispatch Meja Racik (KDS Farmasi)',
    subtitle: '4-Tahap Alur Pelayanan Resep PMK 73/2016 · Monitor SLA Real-Time & Beban Stasiun',
    actionsHtml: `
      <span class="e-btn">${ic('bell', 12, '#047857')} Panggil Antrean R-064</span>
      <span class="e-btn">${ic('filter', 12, '#047857')} Filter: Semua (12 Aktif)</span>
      <span class="e-btn e-btn-primary">${pic('rx', 12, '#ffffff')} + Terima e-Resep Baru</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 3: STUDIO RACIKAN, TUSLAH & PRATINJAU ETIKET TERMAL (Engineering #1)
// ============================================================================
function renderP3() {
  const formulas = [
    { id: 'RAC-09', name: 'Puyer Anak ISPA & Demam (10 Bks)', patient: 'An. Rafa M. (4 th · 14 kg)', dokter: 'dr. Dewi Sp.A', price: 34000, bud: '14 Hari', active: true },
    { id: 'RAC-10', name: 'Salep Dermatitis Alergi (Pot 20g)', patient: 'Ny. Siti Rahayu (44 th)', dokter: 'dr. Bagus Sp.KK', price: 48500, bud: '30 Hari', active: false },
    { id: 'RAC-11', name: 'Kapsul Batuk & Bronkodilator (15 Kap)', patient: 'Tn. Sugianto (58 th)', dokter: 'dr. Yoga Sp.PD', price: 41000, bud: '30 Hari', active: false },
    { id: 'RAC-12', name: 'Puyer Diare & Zinc Pediatri (12 Bks)', patient: 'An. Keisha P. (6 th · 18 kg)', dokter: 'dr. Dewi Sp.A', price: 29500, bud: '14 Hari', active: false },
    { id: 'RAC-13', name: 'Rekonstitusi Sirup Kering Cefadroxil', patient: 'An. Bima A. (7 th · 22 kg)', dokter: 'dr. Dewi Sp.A', price: 28000, bud: '7 Hari (Chiller)', active: false },
  ];

  const bomRows = RACIKAN_BOM.map((b) => {
    const sub = b.ambilQty * b.hppUnit;
    return `<tr>
      <td class="mono" style="color:#475569;">${esc(b.kfa)}</td>
      <td style="font-weight:600;">${esc(b.bahan)}</td>
      <td class="mono num">${esc(b.dosisPerBks)}</td>
      <td class="mono">${esc(b.totalButuh)}</td>
      <td class="mono num" style="font-weight:700;color:#047857;">${b.ambilQty} ${esc(b.satuan)}</td>
      <td class="mono">${esc(b.batch)}</td>
      <td class="mono">${esc(b.exp)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(sub)}</td>
    </tr>`;
  }).join('');

  const zplPayload = `^XA
^PW464^LL320^LH0,0
^FO16,12^A0N,22,22^FDAPOTEK SEHAT NUSANTARA^FS
^FO16,36^A0N,15,15^FDAPJ: apt. Lestari Wijaya | SIPA 446/2025^FS
^FO16,56^GB432,2,2^FS
^FO16,66^A0N,20,20^FDNy. Aminah (RX-261122-074)^FS
^FO16,92^A0N,22,22^FDAmoxicillin 500mg (10 Kaplet)^FS
^FO16,120^A0N,19,19^FD3x SEHARI 1 KAPLET SESUDAH MAKAN^FS
^FO16,144^A0N,18,18^FD(HABISKAN) | BATCH AMX2604 EXP 08/27^FS
^FO16,174^BY2,2,42^BCN,42,Y,N,N^FDAMX2604-074^FS
^XZ`;

  const content = `
    <div style="display:grid;grid-template-columns:295px 1fr 375px;gap:9px;flex:1;min-height:0;">
      <!-- COL 1: Daftar Formula & Cek Dosis Pediatri -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('mortar', 14, '#047857')} Antrean Formula Racikan (5)</div>
            ${badge('18 hari ini', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:5px;">
            ${formulas.map((f) => `
              <div style="padding:5.5px 8px;border-radius:4px;border:1px solid ${f.active ? '#047857' : '#d5ded9'};background:${f.active ? '#ecfdf5' : '#ffffff'};${f.active ? 'box-shadow:inset 3px 0 0 #047857;' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="mono" style="font-size:9.8px;font-weight:800;color:#065f46;">${esc(f.id)}</span>
                  <span class="mono" style="font-size:10.3px;font-weight:700;color:#0f1f1a;">${fmtIdr(f.price)}</span>
                </div>
                <div style="font-size:10.7px;font-weight:700;color:#0f1f1a;margin-top:1px;">${esc(f.name)}</div>
                <div style="font-size:9.3px;color:#5c7269;margin-top:1px;">${esc(f.patient)} · ${esc(f.dokter)}</div>
                <div style="display:flex;justify-content:space-between;margin-top:3px;">
                  ${badge('BUD ' + f.bud, f.active ? 'ok' : 'neutral')}
                  <span style="font-size:9.1px;font-weight:600;color:#047857;">${f.active ? 'Sedang Diedit' : 'Buka BOM'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pediatric Dose Safety Validator -->
        <div class="e-panel" style="flex:0 0 236px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('clinical', 14, '#047857')} Kalkulator Dosis Pediatri</div>
            ${badge('AMAN', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:7px 9px;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div class="kv" style="padding:2.5px 0;"><span class="kv-k">Pasien / Usia / BB</span><span class="kv-v mono">An. Rafa · 4th · 14kg</span></div>
              <div class="kv" style="padding:2.5px 0;"><span class="kv-k">Amoxicillin (375mg/h)</span><span class="kv-v mono" style="color:#047857;">26,8 mg/kg/h OK</span></div>
              <div class="kv" style="padding:2.5px 0;"><span class="kv-k">Paracetamol (450mg/h)</span><span class="kv-v mono" style="color:#047857;">10,7 mg/kg/x OK</span></div>
              <div class="kv" style="padding:2.5px 0;"><span class="kv-k">Salbutamol (3,0mg/h)</span><span class="kv-v mono" style="color:#047857;">0,07 mg/kg/x OK</span></div>
              <div class="kv" style="padding:2.5px 0;"><span class="kv-k">Cetirizine (7,5mg/h)</span><span class="kv-v mono" style="color:#b45309;">Pantau kantuk</span></div>
            </div>
            <div style="padding:5px 7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;font-size:9.3px;color:#065f46;line-height:1.3;">
              <strong>Validasi APJ:</strong> Seluruh dosis dalam rentang terapi pediatri (Pionas BPOM). Bebas inkompatibilitas fisik.
            </div>
          </div>
        </div>
      </div>

      <!-- COL 2: BOM Bahan Baku FEFO + Waterfall Tuslah/Embalase -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('pill', 14, '#047857')} Komposisi BOM Racikan RAC-09 · 10 Bungkus Puyer Anak (Pembulatan FEFO Otomatis)</div>
            <div style="display:flex;gap:5px;">
              ${badge('Auto-FEFO Aktif', 'ok')}
              ${badge('BUD 14 Hari · 06/12/2026', 'info')}
            </div>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:76px;">Kode KFA</th>
                  <th style="width:190px;">Nama Bahan Aktif / Eksipien</th>
                  <th class="num" style="width:66px;">Dosis/Bks</th>
                  <th style="width:118px;">Kebutuhan Total</th>
                  <th class="num" style="width:62px;">Ambil</th>
                  <th style="width:74px;">Batch FEFO</th>
                  <th style="width:64px;">Exp</th>
                  <th class="num" style="width:82px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${bomRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="7">Total Komponen Bahan Baku Obat &amp; Eksipien (6 Baris FEFO)</td>
                  <td class="mono num">${fmtIdr(RACIKAN_BAHAN_TOTAL)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Cost Structure & Tuslah/Embalase Breakdown -->
            <div style="padding:10px 11px;display:flex;flex-direction:column;justify-content:space-between;gap:9px;flex:1;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div style="border:1px solid #d5ded9;border-radius:4px;padding:9px 10px;background:#f8faf9;display:flex;flex-direction:column;justify-content:space-between;">
                  <div>
                    <div style="font-size:11px;font-weight:700;color:#0f1f1a;margin-bottom:6px;">Kalkulasi Harga Jual Racikan (RAC-09)</div>
                    <div class="kv"><span class="kv-k">1. Total Bahan Baku (6 Item FEFO)</span><span class="kv-v mono">${fmtIdr(RACIKAN_BAHAN_TOTAL)}</span></div>
                    <div class="kv"><span class="kv-k">2. Jasa Profesi APJ / Tuslah Racikan</span><span class="kv-v mono">${fmtIdr(RACIKAN_TUSLAH)}</span></div>
                    <div class="kv"><span class="kv-k">3. Embalase (Perkamen + Klip + Stiker)</span><span class="kv-v mono">${fmtIdr(RACIKAN_EMBALASE)}</span></div>
                    <div class="kv"><span class="kv-k">4. Pembulatan Fraksi Sisa Tablet</span><span class="kv-v mono" style="color:#047857;">Tercatat ke Kartu Stok</span></div>
                    <div class="kv" style="border-top:1px solid #047857;border-bottom:0;padding-top:6px;margin-top:3px;">
                      <span style="font-weight:800;color:#065f46;">HARGA FINAL KE POS KASIR</span>
                      <span class="mono" style="font-size:15.5px;font-weight:800;color:#047857;">${fmtIdr(RACIKAN_GRAND_TOTAL)}</span>
                    </div>
                  </div>
                  <div style="font-size:9.5px;color:#5c7269;margin-top:5px;">Sinkron otomatis ke baris <span class="mono">RAC-09</span> di layar Kasir Meja Resep #01.</div>
                </div>

                <!-- Proportion Breakdown Bar SVG -->
                <div style="border:1px solid #d5ded9;border-radius:4px;padding:9px 10px;background:#ffffff;">
                  <div style="font-size:11px;font-weight:700;color:#0f1f1a;margin-bottom:4px;">Struktur Biaya &amp; Komposisi 5 Formula Aktif</div>
                  ${svgStackedBarChart({
                    width: 340,
                    height: 174,
                    categories: ['RAC-09', 'RAC-10', 'RAC-11', 'RAC-12', 'RAC-13'],
                    yMax: 55,
                    yFormat: (v) => `Rp ${Math.round(v)}rb`,
                    series: [
                      { label: 'Bahan FEFO', color: '#047857', values: [24.5, 36.0, 29.5, 20.0, 21.5] },
                      { label: 'Tuslah APJ', color: '#0369a1', values: [6.0, 8.0, 7.5, 6.0, 4.0] },
                      { label: 'Embalase', color: '#d97706', values: [3.5, 4.5, 4.0, 3.5, 2.5] },
                    ],
                  })}
                </div>
              </div>

              <!-- USP <795> Beyond Use Date & Timbangan Log Strip -->
              <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8px;padding:8px 10px;background:#f8faf9;border:1px solid #d5ded9;border-radius:4px;">
                <div style="font-size:9.8px;color:#354b43;line-height:1.35;">
                  <strong style="color:#065f46;">Standar BUD Racikan Non-Steril (USP &lt;795&gt; / FI VI):</strong> Sediaan serbuk bagi (puyer) tanpa air berlaku maks. 25% sisa waktu kedaluwarsa terpendek (<span class="mono">PCM2511 · 54h</span>) -> ditetapkan <strong>14 hari (06/12/2026)</strong>.
                </div>
                <div style="border-left:1px solid #d5ded9;padding-left:9px;font-size:9.8px;color:#354b43;line-height:1.35;">
                  <strong style="color:#0f1f1a;">Kalibrasi Timbangan Analitik #1:</strong> Mettler Toledo 0,01g · Terkalibrasi 07:05 WIB · Deviasi <span class="mono" style="color:#047857;">+0,002g (PASS)</span>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SOP Compounding Checklist -->
        <div class="e-panel" style="flex:0 0 140px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('checkCircle', 14, '#047857')} Protokol CPOB Peracikan &amp; Pencatatan Batch</div>
            ${badge('4/4 Langkah Terverifikasi', 'ok')}
          </div>
          <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            <div style="padding:7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;">
              <div style="font-size:9.8px;font-weight:700;color:#065f46;">1. Sterilisasi Mortar</div>
              <div style="font-size:9.4px;color:#354b43;margin-top:3px;">Alkohol 70% · Meja #1 siap · 14:09 WIB</div>
            </div>
            <div style="padding:7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;">
              <div style="font-size:9.8px;font-weight:700;color:#065f46;">2. Pindai Barcode Batch</div>
              <div style="font-size:9.4px;color:#354b43;margin-top:3px;">6/6 lot FEFO dipindai &amp; dikurangi dari stok</div>
            </div>
            <div style="padding:7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;">
              <div style="font-size:9.8px;font-weight:700;color:#065f46;">3. Gerus &amp; Bagi 10 Bks</div>
              <div style="font-size:9.4px;color:#354b43;margin-top:3px;">Bobot rata-rata 382 mg/bks (CV 1,8%)</div>
            </div>
            <div style="padding:7px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;">
              <div style="font-size:9.8px;font-weight:700;color:#92400e;">4. Verifikasi Akhir APJ</div>
              <div style="font-size:9.4px;color:#78350f;margin-top:3px;">Menunggu stempel cetak stiker etiket</div>
            </div>
          </div>
        </div>
      </div>

      <!-- COL 3: Thermal Etiket 80x50mm Live Preview + ZPL Payload -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('printer', 14, '#047857')} Pratinjau Stiker Etiket Termal (80 × 50 mm)</div>
            ${badge('Zebra ZD220', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <!-- White Sticker: Obat Dalam (Exact Spec Snippet) -->
            <div>
              <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">ETIKET PUTIH — OBAT DALAM (RX-261122-074)</div>
              <div class="etiket-paper">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid #0f172a;padding-bottom:4px;">
                  <div>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.02em;">APOTEK SEHAT NUSANTARA</div>
                    <div style="font-size:8.6px;color:#334155;">Jl. Kesehatan Raya No. 48 Jakarta · Telp (021) 5584-210</div>
                    <div class="mono" style="font-size:8.4px;color:#065f46;font-weight:700;">APJ: apt. Lestari Wijaya, S.Farm · SIPA 446/2025/JKT-S</div>
                  </div>
                  <div class="mono" style="font-size:9px;text-align:right;font-weight:700;">
                    <div>22/11/2026</div>
                    <div>No. 074</div>
                  </div>
                </div>
                <div style="margin-top:5px;display:flex;justify-content:space-between;align-items:baseline;">
                  <strong style="font-size:11.5px;">Ny. Aminah</strong>
                  <span class="mono" style="font-size:9px;">Batch: AMX2604 · Exp: 08/2027</span>
                </div>
                <div style="font-size:11px;font-weight:700;color:#047857;margin-top:2px;">Amoxicillin 500mg Strip (10 Kaplet)</div>
                <div style="margin-top:4px;padding:4px 6px;background:#f1f5f9;border:1px solid #0f172a;text-align:center;">
                  <div style="font-size:11.2px;font-weight:800;">3x SEHARI 1 KAPLET SESUDAH MAKAN</div>
                  <div style="font-size:9.8px;font-weight:800;color:#be123c;letter-spacing:0.04em;">ANTIBIOTIK — HARUS DIHABISKAN</div>
                </div>
                <div style="margin-top:5px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
                  ${svgBarcode('AMX2604-074', 180, 22)}
                  <div class="mono" style="font-size:8.4px;text-align:right;">KFA 93001042<br/>BUD: Sesuai Exp</div>
                </div>
              </div>
            </div>

            <!-- White Sticker: Puyer Racikan RAC-09 -->
            <div>
              <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">ETIKET PUTIH — PUYER RACIKAN (RAC-09 · 10 BKS)</div>
              <div class="etiket-paper">
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:3px;font-size:9px;">
                  <strong>An. Rafa M. (4 th · 14 kg)</strong>
                  <span class="mono">BUD: 06/12/2026 (14h)</span>
                </div>
                <div style="font-size:10.5px;font-weight:700;margin-top:3px;">Racikan Puyer Anak (10 Bungkus) · dr. Dewi Sp.A</div>
                <div style="font-size:10.8px;font-weight:800;text-align:center;margin:4px 0;padding:3px;background:#ecfdf5;border:1px solid #047857;">3x SEHARI 1 BUNGKUS SESUDAH MAKAN</div>
                <div style="font-size:8.7px;color:#334155;display:flex;justify-content:space-between;">
                  <span>Simpan di tempat kering &lt;25°C</span>
                  <span class="mono">RAC-09 · Verif APJ</span>
                </div>
              </div>
            </div>

            <!-- Blue Sticker: Obat Luar Example -->
            <div>
              <div style="font-size:9.5px;font-weight:700;color:#0369a1;margin-bottom:4px;">ETIKET BIRU — OBAT LUAR (RAC-10 SALEP 20G)</div>
              <div class="etiket-blue">
                <div style="display:flex;justify-content:space-between;font-size:9.5px;font-weight:700;">
                  <span>Ny. Siti Rahayu · Salep Racikan 20g</span>
                  <span class="mono">OBAT LUAR</span>
                </div>
                <div style="font-size:10px;font-weight:700;margin-top:2px;">Oleskan tipis 2x sehari pada area lesi · BUD 30 hari</div>
              </div>
            </div>

            <!-- ZPL Thermal Command Buffer -->
            <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
              <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:3px;display:flex;justify-content:space-between;">
                <span>RAW ZPL II BUFFER (USB001 · 203 DPI)</span>
                <span class="mono" style="color:#047857;">382 bytes · Ready</span>
              </div>
              <pre class="mono" style="margin:0;padding:7px 8px;background:#0f1f1a;color:#a7f3d0;border-radius:4px;font-size:8.7px;line-height:1.35;overflow:hidden;flex:1;">${esc(zplPayload)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p3',
    title: 'Studio Racikan, Kalkulator Tuslah & Pratinjau Etiket Termal',
    subtitle: 'Perhitungan Fraksi Tablet FEFO, Cek Dosis Pediatri & Cetak Langsung Zebra ZPL II',
    actionsHtml: `
      <span class="e-btn">${ic('copy', 12, '#047857')} Duplikat Formula</span>
      <span class="e-btn">${pic('printer', 12, '#047857')} Uji Cetak 1 Stiker</span>
      <span class="e-btn e-btn-primary">${ic('check', 12, '#ffffff')} Simpan ke POS (Rp 34.000)</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 4: KARTU STOK FEFO, MATRIKS KEDALUWARSA & DENAH RAK FARMASI
// ============================================================================
function renderP4() {
  const safeCount = FEFO_BATCHES.filter((b) => b.daysLeft > 90).length;

  // Visual Pharmacy Shelf & Cold-Chain Blueprint SVG
  const rackSvg = `<svg viewBox="0 0 760 156" width="100%" height="156" style="display:block;">
    <rect x="0" y="0" width="760" height="156" rx="4" fill="#f8faf9" stroke="#cbd7d1" />
    <!-- Zone A: Obat Keras / Resep Fast Moving -->
    <rect x="12" y="12" width="246" height="132" rx="3" fill="#ffffff" stroke="#047857" stroke-width="1.3" />
    <rect x="12" y="12" width="246" height="22" rx="2" fill="#ecfdf5" />
    <text x="20" y="27" font-size="10" font-weight="700" fill="#065f46" font-family="Segoe UI,sans-serif">ZONA A · OBAT KERAS (RESEP &amp; KRONIS)</text>
    ${[
      { x: 20, y: 42, id: 'A-01-1', sku: 'AMX2604', st: '#047857', bg: '#ecfdf5', d: '264h' },
      { x: 98, y: 42, id: 'A-01-3', sku: 'AZT2601', st: '#0369a1', bg: '#f0f9ff', d: '67h' },
      { x: 176, y: 42, id: 'A-02-2', sku: 'SLB2608', st: '#047857', bg: '#ecfdf5', d: '271h' },
      { x: 20, y: 90, id: 'A-02-3', sku: 'AMB2609', st: '#047857', bg: '#ecfdf5', d: '298h' },
      { x: 98, y: 90, id: 'A-04-3', sku: 'AML2610', st: '#047857', bg: '#ecfdf5', d: '329h' },
      { x: 176, y: 90, id: 'A-05-1', sku: 'MTF2703', st: '#047857', bg: '#ecfdf5', d: '472h' },
    ]
      .map(
        (b) => `
      <rect x="${b.x}" y="${b.y}" width="72" height="40" rx="3" fill="${b.bg}" stroke="${b.st}" stroke-width="1" />
      <text x="${b.x + 6}" y="${b.y + 14}" font-size="9" font-weight="700" fill="${b.st}" font-family="Consolas,monospace">${b.id}</text>
      <text x="${b.x + 6}" y="${b.y + 26}" font-size="8.5" fill="#0f1f1a" font-family="Consolas,monospace">${b.sku}</text>
      <text x="${b.x + 66}" y="${b.y + 35}" text-anchor="end" font-size="8" font-weight="700" fill="${b.st}" font-family="Consolas,monospace">${b.d}</text>`
      )
      .join('')}

    <!-- Zone B & C: Alert FEFO Priority Shelf -->
    <rect x="270" y="12" width="218" height="132" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1.3" />
    <rect x="270" y="12" width="218" height="22" rx="2" fill="#fffbeb" />
    <text x="278" y="27" font-size="10" font-weight="700" fill="#92400e" font-family="Segoe UI,sans-serif">ZONA B/C · PRIORITAS FEFO (&lt;60 HARI)</text>
    ${[
      { x: 278, y: 42, id: 'B-02-1', sku: 'OMP2512', st: '#be123c', bg: '#fff1f2', d: '26h KRITIS' },
      { x: 382, y: 42, id: 'C-01-4', sku: 'VTM2512', st: '#b45309', bg: '#fffbeb', d: '36h ALERT' },
      { x: 278, y: 90, id: 'B-04-2', sku: 'CEF2601', st: '#b45309', bg: '#fffbeb', d: '48h ALERT' },
      { x: 382, y: 90, id: 'C-02-1', sku: 'PCM2511', st: '#b45309', bg: '#fffbeb', d: '54h AKTIF' },
    ]
      .map(
        (b) => `
      <rect x="${b.x}" y="${b.y}" width="98" height="40" rx="3" fill="${b.bg}" stroke="${b.st}" stroke-width="1.2" />
      <text x="${b.x + 6}" y="${b.y + 14}" font-size="9" font-weight="700" fill="${b.st}" font-family="Consolas,monospace">${b.id}</text>
      <text x="${b.x + 6}" y="${b.y + 26}" font-size="8.5" fill="#0f1f1a" font-family="Consolas,monospace">${b.sku}</text>
      <text x="${b.x + 92}" y="${b.y + 35}" text-anchor="end" font-size="8" font-weight="700" fill="${b.st}" font-family="Consolas,monospace">${b.d}</text>`
      )
      .join('')}

    <!-- Zone CH: Cold Chain Chiller 2-8C -->
    <rect x="500" y="12" width="122" height="132" rx="3" fill="#f0f9ff" stroke="#0369a1" stroke-width="1.3" />
    <rect x="500" y="12" width="122" height="22" rx="2" fill="#e0f2fe" />
    <text x="508" y="27" font-size="9.5" font-weight="700" fill="#0369a1" font-family="Segoe UI,sans-serif">CHILLER 2–8°C</text>
    <text x="561" y="64" text-anchor="middle" font-size="22" font-weight="800" fill="#0369a1" font-family="Consolas,monospace">4,2°C</text>
    <text x="561" y="80" text-anchor="middle" font-size="8.8" fill="#0c4a6e" font-family="Segoe UI,sans-serif">Sensor IoT OK · RH 54%</text>
    <rect x="509" y="92" width="104" height="40" rx="3" fill="#ffffff" stroke="#d97706" stroke-width="1.2" />
    <text x="515" y="106" font-size="8.8" font-weight="700" fill="#b45309" font-family="Consolas,monospace">CH-01-A · INS2512</text>
    <text x="515" y="118" font-size="8.5" fill="#0f1f1a" font-family="Segoe UI,sans-serif">Insulin Glargine (14)</text>
    <text x="515" y="128" font-size="8" font-weight="700" fill="#b45309" font-family="Consolas,monospace">Exp 44h · Alert FEFO</text>

    <!-- Zone LK: Lemari Ganda Psikotropika/Narkotika -->
    <rect x="634" y="12" width="114" height="132" rx="3" fill="#fff1f2" stroke="#be123c" stroke-width="1.4" />
    <rect x="634" y="12" width="114" height="22" rx="2" fill="#ffe4e6" />
    <text x="642" y="27" font-size="9.5" font-weight="700" fill="#be123c" font-family="Segoe UI,sans-serif">LEMARI GANDA</text>
    <text x="691" y="56" text-anchor="middle" font-size="10.5" font-weight="800" fill="#881337" font-family="Consolas,monospace">KUNCI APJ</text>
    <text x="691" y="70" text-anchor="middle" font-size="8.6" fill="#9f1239" font-family="Segoe UI,sans-serif">Psikotropika &amp; Narko</text>
    <rect x="642" y="82" width="98" height="50" rx="3" fill="#ffffff" stroke="#be123c" stroke-width="1" />
    <text x="648" y="96" font-size="8.6" font-weight="700" fill="#be123c" font-family="Consolas,monospace">LK-01-A · 16 SKU</text>
    <text x="648" y="109" font-size="8.4" fill="#0f1f1a" font-family="Segoe UI,sans-serif">Alprazolam, Codeine,</text>
    <text x="648" y="121" font-size="8.4" fill="#0f1f1a" font-family="Segoe UI,sans-serif">Diazepam · 0 Selisih</text>
  </svg>`;

  const rowsHtml = FEFO_BATCHES.map((b) => {
    const trCls = b.selected ? 'is-selected' : b.daysLeft < 30 ? 'is-bad' : b.daysLeft < 60 ? 'is-warn' : '';
    return `<tr class="${trCls}">
      <td class="mono" style="color:#475569;">${esc(b.kfa)}</td>
      <td style="font-weight:600;">${esc(b.name)}</td>
      <td class="mono" style="font-weight:700;">${esc(b.batch)}</td>
      <td class="mono">${esc(b.rak)}</td>
      <td class="mono num" style="font-weight:700;">${b.qty} ${esc(b.unit)}</td>
      <td class="mono">${esc(b.exp)}</td>
      <td class="mono num" style="font-weight:700;color:${b.daysLeft < 30 ? '#be123c' : b.daysLeft < 60 ? '#b45309' : '#047857'};">${b.daysLeft} h</td>
      <td class="mono num">${fmtIdr(b.hpp)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(b.qty * b.hpp)}</td>
      <td>${badge(b.status, b.tone)}</td>
    </tr>`;
  }).join('');

  const content = `
    <!-- Top Row: Rack Blueprint (left) + Expiry Bucket Summary (right) -->
    <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:9px;flex:0 0 202px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${pic('shelf', 14, '#047857')} Denah Rak Gudang Farmasi, Chiller 2–8°C &amp; Lemari Ganda APJ</div>
          ${badge('16 Batch Aktif Terpetakan', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:6px 8px;">${rackSvg}</div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('alert', 14, '#b45309')} Matriks Bucket Kedaluwarsa FEFO &amp; Nilai Persediaan</div>
          <span class="mono" style="font-size:10px;font-weight:700;color:#047857;">Total: ${fmtIdr(TOTAL_INV_VALUE)}</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
            <div style="padding:7px;background:#fffbeb;border:1px solid #f59e0b;border-radius:4px;">
              <div style="font-size:9.6px;font-weight:700;color:#92400e;">Dekat Exp &lt;60 Hari</div>
              <div class="mono" style="font-size:19px;font-weight:800;color:#b45309;margin:2px 0;">${NEAR_EXP_60_COUNT} batch</div>
              <div style="font-size:9px;color:#78350f;">1 Kritis &lt;30h (OMP2512)</div>
            </div>
            <div style="padding:7px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;">
              <div style="font-size:9.6px;font-weight:700;color:#0369a1;">Pantau 61–90 Hari</div>
              <div class="mono" style="font-size:19px;font-weight:800;color:#0369a1;margin:2px 0;">${NEAR_EXP_90_COUNT} batch</div>
              <div style="font-size:9px;color:#0c4a6e;">Ajukan retur PBF H-45</div>
            </div>
            <div style="padding:7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;">
              <div style="font-size:9.6px;font-weight:700;color:#065f46;">Aman &gt;90 Hari</div>
              <div class="mono" style="font-size:19px;font-weight:800;color:#047857;margin:2px 0;">${safeCount} batch</div>
              <div style="font-size:9px;color:#065f46;">Rotasi FEFO normal</div>
            </div>
          </div>
          <div style="padding:6px 8px;background:#f8faf9;border:1px solid #d5ded9;border-radius:4px;font-size:9.8px;color:#354b43;display:flex;justify-content:space-between;align-items:center;">
            <span><strong>Kebijakan FEFO Strict:</strong> Kasir dilarang memindai batch baru sebelum batch terlama di rak habis atau dikarantina APJ.</span>
            ${badge('0 Pelanggaran FEFO', 'ok')}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: 16-Row Dense Kartu Stok Table + Selected Batch Inspector -->
    <div style="display:grid;grid-template-columns:1fr 315px;gap:9px;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 14, '#047857')} Kartu Stok Master per Batch (Urut FEFO — Kedaluwarsa Terdekat di Atas)</div>
          <div style="display:flex;gap:5px;">
            ${badge('16 Batch Ditampilkan', 'neutral')}
            ${badge('5 Batch <60h', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:76px;">Kode KFA</th>
                <th style="width:215px;">Nama Sediaan Farmasi</th>
                <th style="width:78px;">No. Batch</th>
                <th style="width:62px;">Rak/Bin</th>
                <th class="num" style="width:72px;">Sisa Stok</th>
                <th style="width:74px;">Exp Date</th>
                <th class="num" style="width:54px;">Sisa</th>
                <th class="num" style="width:78px;">HPP Unit</th>
                <th class="num" style="width:94px;">Nilai Stok</th>
                <th style="width:90px;">Status FEFO</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL 16 BATCH AKTIF (5 BATCH &lt;60H · 3 BATCH 61–90H · 8 BATCH AMAN)</td>
                <td class="mono num">${fmtNum(FEFO_BATCHES.reduce((a, b) => a + b.qty, 0))} unit</td>
                <td colspan="3" class="num">Total Nilai Persediaan (HPP)</td>
                <td class="mono num">${fmtIdr(TOTAL_INV_VALUE)}</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Right Batch Inspector & Kartu Stok Mutation Trail -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 14, '#047857')} Inspektor Batch: PCM2511</div>
          ${badge('Alert FEFO', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          <div>
            <div style="font-size:12px;font-weight:800;color:#0f1f1a;">Paracetamol 500mg Box (10 Strip)</div>
            <div class="mono" style="font-size:9.8px;color:#5c7269;">KFA 93000815 · NIE BPOM GBL9812415604A1</div>
            <div style="margin-top:7px;">
              <div class="kv"><span class="kv-k">Nomor Batch / Lot</span><span class="kv-v mono">PCM2511</span></div>
              <div class="kv"><span class="kv-k">Tanggal Kedaluwarsa</span><span class="kv-v mono" style="color:#b45309;">15/01/2027 (54 hari)</span></div>
              <div class="kv"><span class="kv-k">Lokasi Penyimpanan</span><span class="kv-v mono">Rak C-02-1 (Suhu 23°C)</span></div>
              <div class="kv"><span class="kv-k">Distributor PBF</span><span class="kv-v">PT Dos Ni Roha</span></div>
              <div class="kv"><span class="kv-k">No. Faktur PBF</span><span class="kv-v mono">DNR-2025-11842</span></div>
              <div class="kv"><span class="kv-k">Sisa Stok / HPP</span><span class="kv-v mono">28 Box · Rp 165.200</span></div>
            </div>
            <div style="margin-top:7px;padding:6px 8px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;font-size:9.5px;color:#92400e;line-height:1.35;">
              <strong>Rekomendasi FEFO (H-54):</strong> Rata-rata keluar 3,2 box/minggu (est. habis 8 minggu). Prioritaskan untuk racikan &amp; OTC; ajukan retur PBF bila sisa &gt;8 box pada H-30.
            </div>
          </div>

          <div style="border-top:1px solid #d5ded9;padding-top:7px;">
            <div style="font-size:10.4px;font-weight:700;color:#0f1f1a;margin-bottom:5px;">Riwayat Mutasi Kartu Stok (5 Terakhir)</div>
            <table class="e-table" style="font-size:9.7px;">
              <thead>
                <tr><th style="width:52px;">Tgl</th><th>Referensi</th><th class="num" style="width:38px;">Qty</th><th class="num" style="width:40px;">Sisa</th></tr>
              </thead>
              <tbody>
                <tr><td class="mono">22/11</td><td>RX-074 (POS #1)</td><td class="mono num" style="color:#be123c;">-1</td><td class="mono num">28</td></tr>
                <tr><td class="mono">22/11</td><td>RAC-09 (3 Tab)</td><td class="mono num" style="color:#be123c;">-0,3</td><td class="mono num">29</td></tr>
                <tr><td class="mono">21/11</td><td>OTC Shift Sore</td><td class="mono num" style="color:#be123c;">-4</td><td class="mono num">29</td></tr>
                <tr><td class="mono">19/11</td><td>Resep Klinik</td><td class="mono num" style="color:#be123c;">-7</td><td class="mono num">33</td></tr>
                <tr><td class="mono">02/11</td><td>PBF Masuk DNR</td><td class="mono num" style="color:#047857;">+40</td><td class="mono num">40</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <span class="e-btn" style="justify-content:center;">Ajukan Retur PBF</span>
            <span class="e-btn e-btn-primary" style="justify-content:center;">Cetak Kartu Stok</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p4',
    title: 'Kartu Stok FEFO, Matriks Kedaluwarsa & Denah Rak Farmasi',
    subtitle: 'Pelacakan Lot BPOM KFA · Peringatan Otomatis <90 Hari & Pemantauan Cold-Chain 2–8°C',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#047857')} Ekspor Kartu Stok PDF/XLSX</span>
      <span class="e-btn">${ic('refresh', 12, '#047857')} Stock Opname Cepat</span>
      <span class="e-btn e-btn-primary">+ Penerimaan Faktur PBF</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 5: BUKU PSIKOTROPIKA, OOT & PELAPORAN SIPNAP KEMENKES
// ============================================================================
function renderP5() {
  const sipnapRows = SIPNAP_LEDGER.map((r) => `
    <tr class="${r.selected ? 'is-selected' : ''}">
      <td class="mono" style="font-weight:700;color:#be123c;">${esc(r.code)}</td>
      <td style="font-weight:600;">${esc(r.name)}</td>
      <td>${badge(r.gol, r.gol.includes('Narkotika') ? 'bad' : r.gol.includes('Psikotropika') ? 'warn' : 'info')}</td>
      <td class="mono">${esc(r.batch)}</td>
      <td class="mono num">${fmtNum(r.awal)}</td>
      <td class="mono num" style="color:#047857;">+${fmtNum(r.masuk)}</td>
      <td class="mono num" style="color:#be123c;">-${fmtNum(r.keluar)}</td>
      <td class="mono num" style="font-weight:800;">${fmtNum(r.akhir)}</td>
      <td class="mono num" style="font-weight:700;">${fmtNum(r.fisik)}</td>
      <td class="mono num" style="color:#047857;font-weight:800;">0</td>
      <td class="trunc" style="color:#5c7269;">${esc(r.pbf)}</td>
    </tr>
  `).join('');

  const sumAwal = SIPNAP_LEDGER.reduce((a, r) => a + r.awal, 0);
  const sumMasuk = SIPNAP_LEDGER.reduce((a, r) => a + r.masuk, 0);
  const sumKeluar = SIPNAP_LEDGER.reduce((a, r) => a + r.keluar, 0);
  const sumAkhir = SIPNAP_LEDGER.reduce((a, r) => a + r.akhir, 0);

  const sipnapXml = `<SIPNAP_REPORT periode="2026-11" sarana="APT-3174-00842">
  <APJ nama="apt. Lestari Wijaya, S.Farm" sipa="446/2025/JKT-S"/>
  <ITEM kode_kfa="93009904" nama="Alprazolam 0.5mg Tab" gol="PSI-IV">
    <SALDO_AWAL>400</SALDO_AWAL><MASUK_PBF>100</MASUK_PBF>
    <KELUAR_RESEP>160</KELUAR_RESEP><SALDO_AKHIR>340</SALDO_AKHIR>
    <SELISIH>0</SELISIH><BATCH>ALP2602</BATCH>
  </ITEM>
  <INTEGRITY alg="SHA-256">9e4b1c88a42d0f71...c3b7f2a</INTEGRITY>
</SIPNAP_REPORT>`;

  const content = `
    <!-- Top Regulatory Banner + KPIs -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi" style="border-color:#047857;background:#ecfdf5;">
        <div class="e-kpi-top"><span>Status Buku SIPNAP Nov 2026</span>${badge('0 SELISIH', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${SIPNAP_LEDGER.length} / ${SIPNAP_LEDGER.length} Cocok</span><span class="mono" style="font-size:10px;color:#065f46;">Batas Lapor: 10 Des</span></div>
        <div class="e-kpi-foot"><span>PMK 3/2015 &amp; PerBPOM 10/2019 OOT</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Pengeluaran Bulan Ini</span>${badge('100% SIP+NIK', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(sumKeluar)} tab</span><span class="mono" style="font-size:10px;color:#0369a1;">64 Resep Terverif</span></div>
        <div class="e-kpi-foot"><span>8 Resep Psiko/OOT pada hari ini</span></div>
      </div>
      <div class="e-kpi" style="border-color:#fda4af;background:#fff5f6;">
        <div class="e-kpi-top"><span>Gerbang Kunci Lemari Ganda</span>${badge('1 RESEP TAHAN', 'bad')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#be123c;">RX-074 Lock</span><span class="mono" style="font-size:10px;color:#be123c;">Alprazolam 0.5mg</span></div>
        <div class="e-kpi-foot"><span>Menunggu pindai NIK Pasien + OTP APJ</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Segel Audit WORM SHA-256</span>${badge('IMMUTABLE', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">1.284 log</span><span class="mono" style="font-size:10px;color:#047857;">Chain Valid</span></div>
        <div class="e-kpi-foot"><span>Arsip digital 5 tahun (UU Kesehatan)</span></div>
      </div>
    </div>

    <!-- Main 2-Column SIPNAP Ledger + Locked OOT Verification Inspector -->
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;flex:1;min-height:0;">
      <!-- LEFT: 12-Row Exact Balance Ledger -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${pic('sipnap', 14, '#047857')} Buku Bantu Narkotika, Psikotropika &amp; OOT — Periode November 2026</div>
          <div style="display:flex;gap:5px;">
            ${badge('Saldo Awal + Masuk - Keluar = Akhir', 'accent')}
            ${badge('Opname Fisik 0 Selisih', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:58px;">Kode</th>
                <th style="width:185px;">Nama Obat Terkendali</th>
                <th style="width:98px;">Golongan</th>
                <th style="width:68px;">Batch</th>
                <th class="num" style="width:54px;">Awal</th>
                <th class="num" style="width:56px;">Masuk</th>
                <th class="num" style="width:58px;">Keluar</th>
                <th class="num" style="width:56px;">Akhir</th>
                <th class="num" style="width:54px;">Fisik</th>
                <th class="num" style="width:46px;">Sel.</th>
                <th style="width:105px;">Pemasok PBF</th>
              </tr>
            </thead>
            <tbody>${sipnapRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL MUTASI ${SIPNAP_LEDGER.length} OBAT TERKENDALI (NOV 2026)</td>
                <td class="mono num">${fmtNum(sumAwal)}</td>
                <td class="mono num" style="color:#047857;">+${fmtNum(sumMasuk)}</td>
                <td class="mono num" style="color:#be123c;">-${fmtNum(sumKeluar)}</td>
                <td class="mono num">${fmtNum(sumAkhir)}</td>
                <td class="mono num">${fmtNum(sumAkhir)}</td>
                <td class="mono num" style="color:#047857;">0</td>
                <td>${badge('Siap Ekspor', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Bottom Audit Note -->
          <div style="padding:8px 11px;background:#f8faf9;border-top:1px solid #d5ded9;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:auto;">
            <div style="padding:6px 8px;background:#ffffff;border:1px solid #d5ded9;border-radius:3px;">
              <div style="font-size:9.3px;color:#5c7269;font-weight:700;">FAKTUR PBF TERVERIFIKASI</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f1f1a;margin-top:2px;">SP Khusus Narkotika/Psiko (SP-2611-08)</div>
              <div class="mono" style="font-size:9.2px;color:#047857;">${fmtNum(sumMasuk)} unit masuk · Cocok e-Faktur</div>
            </div>
            <div style="padding:6px 8px;background:#ffffff;border:1px solid #d5ded9;border-radius:3px;">
              <div style="font-size:9.3px;color:#5c7269;font-weight:700;">VERIFIKASI RESEP ASLI</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f1f1a;margin-top:2px;">64/64 Resep Bermaterai / Digital</div>
              <div class="mono" style="font-size:9.2px;color:#047857;">0 Resep Copy diulang tanpa dokter</div>
            </div>
            <div style="padding:6px 8px;background:#ffffff;border:1px solid #d5ded9;border-radius:3px;">
              <div style="font-size:9.3px;color:#5c7269;font-weight:700;">PEMERIKSAAN BPOM / DINKES</div>
              <div style="font-size:10.5px;font-weight:700;color:#0f1f1a;margin-top:2px;">Paket Inspeksi Siap 1-Klik</div>
              <div class="mono" style="font-size:9.2px;color:#0369a1;">Format sipnap.kemkes.go.id v3.4</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Dual-Lock OOT Verification Gate & SIPNAP Export Preview -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head" style="background:#fff1f2;border-bottom-color:#fecdd3;">
            <div class="e-panel-title" style="color:#881337;">${ic('lock', 14, '#be123c')} Verifikasi Penyerahan Terkunci · OOT-04</div>
            ${badge('Wajib SIP + NIK', 'bad')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
            <div style="padding:7px 9px;background:#fff5f6;border:1px solid #fda4af;border-radius:4px;">
              <div style="font-size:11.5px;font-weight:800;color:#881337;">Alprazolam 0.5mg Tablet (10 Tab · Batch ALP2602)</div>
              <div style="font-size:9.8px;color:#9f1239;margin-top:2px;">Resep <span class="mono">RX-261122-074</span> · Pasien: Ny. Aminah (52 th) · Golongan Psikotropika IV</div>
            </div>

            <div>
              <div class="kv"><span class="kv-k">1. Validasi SIP Dokter (KKI / SATUSEHAT)</span><span class="kv-v">${badge('VALID · 446/112', 'ok')}</span></div>
              <div class="kv"><span class="kv-k">   Nama Dokter Penulis Resep</span><span class="kv-v">dr. Hendra Kusuma (Aktif s.d. 2028)</span></div>
              <div class="kv"><span class="kv-k">2. Pemindaian e-KTP / NIK Pasien</span><span class="kv-v">${badge('PERLU PINDAI', 'bad')}</span></div>
              <div class="kv"><span class="kv-k">   NIK Tersimpan (Masked UU PDP)</span><span class="kv-v mono">317409******0004 (Verif Fisik)</span></div>
              <div class="kv"><span class="kv-k">3. Cek Anti Doctor-Shopping (30 Hari)</span><span class="kv-v mono" style="color:#047857;">0 Penebusan Sebelumnya · Aman</span></div>
              <div class="kv"><span class="kv-k">4. Otorisasi Biometrik / PIN APJ</span><span class="kv-v">${badge('apt. Lestari (Menunggu)', 'warn')}</span></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:2px;">
              <span class="e-btn" style="justify-content:center;">Pindai e-KTP / QR IKD</span>
              <span class="e-btn e-btn-primary" style="justify-content:center;">${ic('key', 12, '#ffffff')} Buka Kunci (OTP APJ)</span>
            </div>

            <!-- Recent Verified Controlled Releases Today -->
            <div style="border-top:1px solid #d5ded9;padding-top:7px;margin-top:auto;">
              <div style="font-size:10.1px;font-weight:700;color:#0f1f1a;margin-bottom:4px;">Penyerahan Psikotropika/OOT Terakhir Hari Ini (Terverifikasi)</div>
              <table class="e-table" style="font-size:9.6px;">
                <thead>
                  <tr><th style="width:92px;">Resep</th><th>Obat &amp; Qty</th><th style="width:94px;">Verifikasi</th></tr>
                </thead>
                <tbody>
                  <tr><td class="mono">RX-261122-065</td><td>Diazepam 2mg (10 tab)</td><td>${badge('SIP+NIK OK', 'ok')}</td></tr>
                  <tr><td class="mono">RX-261122-052</td><td>Clobazam 10mg (10 tab)</td><td>${badge('SIP+NIK OK', 'ok')}</td></tr>
                  <tr><td class="mono">RX-261122-041</td><td>Tramadol 50mg (6 kap)</td><td>${badge('SIP+NIK OK', 'ok')}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SIPNAP XML Export Preview -->
        <div class="e-panel" style="flex:0 0 250px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 14, '#047857')} Payload Ekspor SIPNAP Kemenkes (XML/CSV)</div>
            ${badge('Schema v3.4 OK', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            <pre class="mono" style="margin:0;padding:8px 9px;background:#0f1f1a;color:#a7f3d0;border-radius:4px;font-size:8.9px;line-height:1.38;flex:1;overflow:hidden;">${esc(sipnapXml)}</pre>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="mono" style="font-size:9.3px;color:#5c7269;">File: SIPNAP_317400842_202611.xml</span>
              <span class="e-btn e-btn-primary" style="height:22px;">${ic('download', 11, '#ffffff')} Ekspor &amp; Kirim SIPNAP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p5',
    title: 'Buku Psikotropika, OOT & Pelaporan SIPNAP Kemenkes',
    subtitle: 'Pengawasan Lemari Ganda APJ · Wajib SIP Dokter + NIK Pasien & Ekspor SIPNAP 1-Klik',
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 12, '#047857')} Berita Acara Opname</span>
      <span class="e-btn e-btn-primary">${ic('download', 12, '#ffffff')} Ekspor SIPNAP Nov 2026</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 6: SETTLEMENT SHIFT KASIR, QRIS/BPJS & CORETAX PPN (PSAK Double-Entry)
// ============================================================================
function renderP6() {
  const denomRows = CASH_DENOMS.map((d) => `
    <tr>
      <td class="mono" style="font-weight:700;">${esc(d.label)}</td>
      <td class="mono num">${d.qty} ${d.nominal <= 500 ? 'kpg' : 'lbr'}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(d.nominal * d.qty)}</td>
    </tr>
  `).join('');

  const tenderRows = SHIFT_TENDERS.map((t) => `
    <tr>
      <td style="font-weight:700;">${esc(t.channel)}</td>
      <td class="mono num">${t.tx}</td>
      <td class="mono num">${fmtIdr(t.expected)}</td>
      <td class="mono num" style="font-weight:700;">${fmtIdr(t.actual)}</td>
      <td class="mono num" style="color:#047857;font-weight:700;">Rp 0</td>
      <td>${badge(t.status, t.tone)}</td>
    </tr>
  `).join('');

  const journalRows = PSAK_JOURNAL.map((j) => `
    <tr>
      <td class="mono" style="font-weight:700;color:#065f46;">${esc(j.akun)}</td>
      <td style="font-weight:500;">${esc(j.nama)}</td>
      <td class="mono num" style="font-weight:${j.debit ? 700 : 400};color:${j.debit ? '#0f1f1a' : '#94a3b8'};">${j.debit ? fmtIdr(j.debit) : '—'}</td>
      <td class="mono num" style="font-weight:${j.kredit ? 700 : 400};color:${j.kredit ? '#047857' : '#94a3b8'};">${j.kredit ? fmtIdr(j.kredit) : '—'}</td>
      <td class="mono" style="color:#5c7269;">${esc(j.ref)}</td>
    </tr>
  `).join('');

  const content = `
    <!-- Top 5 Financial Shift KPI Cards -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Penjualan Bruto Shift</span>${badge('148 Struk', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(SHIFT_TOTAL_ACTUAL)}</span></div>
        <div class="e-kpi-foot"><span>Resep Rp 9,45jt · OTC Rp 6,49jt</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Setoran Tunai Bersih</span>${badge('Selisih Rp 0', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(CASH_DRAWER_NET)}</span></div>
        <div class="e-kpi-foot"><span>Fisik Rp 7.845.000 - Modal Rp 1jt</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>QRIS SNAP BI + EDC</span>${badge('T+0 Settled', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(5420000 + 2910000)}</span></div>
        <div class="e-kpi-foot"><span>46 QRIS · 22 EDC Mandiri/BCA</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Piutang Klaim BPJS PRB</span>${badge('22 SEP OK', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#0369a1;">${fmtIdr(3250000)}</span></div>
        <div class="e-kpi-foot"><span>Tervalidasi Apotek Online BPJS</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>PPN Keluaran 11%</span>${badge('CoreTax XML', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(1505000)}</span></div>
        <div class="e-kpi-foot"><span>Margin Kotor Net: 28,0% (HPP 12,18jt)</span></div>
      </div>
    </div>

    <!-- Main 2-Column Settlement & Accounting Workspace -->
    <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:9px;flex:1;min-height:0;">
      <!-- LEFT: Tender Recon + Cash Denomination Counter + Hourly Revenue Chart -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:0 0 218px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('cash', 14, '#047857')} Rekonsiliasi Multi-Tender Shift Pagi–Siang (Meja #01 &amp; #02)</div>
            ${badge('VARIANS: Rp 0', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:175px;">Kanal Pembayaran</th>
                  <th class="num" style="width:44px;">Tx</th>
                  <th class="num" style="width:105px;">Sistem POS</th>
                  <th class="num" style="width:105px;">Aktual/Bank</th>
                  <th class="num" style="width:66px;">Selisih</th>
                  <th style="width:105px;">Status</th>
                </tr>
              </thead>
              <tbody>${tenderRows}</tbody>
              <tfoot>
                <tr>
                  <td>TOTAL SETTLEMENT SHIFT</td>
                  <td class="mono num">${SHIFT_TOTAL_TX}</td>
                  <td class="mono num">${fmtIdr(SHIFT_TOTAL_EXPECTED)}</td>
                  <td class="mono num">${fmtIdr(SHIFT_TOTAL_ACTUAL)}</td>
                  <td class="mono num" style="color:#047857;">Rp 0</td>
                  <td>${badge('Cocok 100%', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:285px 1fr;gap:8px;flex:1;min-height:0;">
          <!-- Physical Cash Drawer Denomination Counter -->
          <div class="e-panel">
            <div class="e-panel-head">
              <div class="e-panel-title">Hitung Fisik Laci Kasir</div>
              <span class="mono" style="font-size:9.4px;color:#047857;">RJ11 Open</span>
            </div>
            <div class="e-panel-body-flush">
              <table class="e-table" style="font-size:10px;">
                <thead>
                  <tr><th>Pecahan</th><th class="num" style="width:62px;">Qty</th><th class="num" style="width:92px;">Jumlah</th></tr>
                </thead>
                <tbody>${denomRows}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2">Fisik Laci (incl. Modal Rp 1jt)</td>
                    <td class="mono num">${fmtIdr(CASH_DRAWER_GROSS)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="color:#047857;">Setoran Bersih Tunai</td>
                    <td class="mono num" style="color:#047857;">${fmtIdr(CASH_DRAWER_NET)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Hourly Stacked Revenue Chart -->
          <div class="e-panel">
            <div class="e-panel-head">
              <div class="e-panel-title">Omzet per Slot Jam &amp; Kanal Bayar</div>
              <span class="mono" style="font-size:9.5px;color:#5c7269;">Total Rp 18.425 rb</span>
            </div>
            <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
              ${svgStackedBarChart({
                width: 410,
                height: 225,
                categories: HOURLY_REVENUE.slots,
                yMax: 4200,
                yFormat: (v) => `${(v / 1000).toFixed(1)}jt`,
                series: [
                  { label: 'Tunai', color: '#047857', values: HOURLY_REVENUE.tunai },
                  { label: 'QRIS', color: '#0369a1', values: HOURLY_REVENUE.qris },
                  { label: 'EDC', color: '#d97706', values: HOURLY_REVENUE.edc },
                  { label: 'BPJS PRB', color: '#6366f1', values: HOURLY_REVENUE.bpjs },
                ],
              })}
              <div style="padding:6px 8px;background:#f8faf9;border:1px solid #d5ded9;border-radius:3px;font-size:9.6px;color:#354b43;">
                Puncak layanan pada <strong>13:00–15:00 WIB</strong> (Rp 3,67 jt) dipicu resep keluar poliklinik spesialis &amp; penebusan BPJS PRB.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: PSAK Double-Entry Journal + CoreTax XML & SNAP BI Feed -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 14, '#047857')} Jurnal Otomatis PSAK Double-Entry (Shift #01 · 22 Nov 2026)</div>
            ${badge('DEBIT = KREDIT (BALANCED)', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:48px;">Akun</th>
                  <th>Nama Perkiraan (COA Apotek)</th>
                  <th class="num" style="width:102px;">Debit</th>
                  <th class="num" style="width:102px;">Kredit</th>
                  <th style="width:112px;">Ref Bukti</th>
                </tr>
              </thead>
              <tbody>${journalRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2">TOTAL JURNAL OTOMATIS (BALANCED)</td>
                  <td class="mono num">${fmtIdr(JOURNAL_DEBIT)}</td>
                  <td class="mono num" style="color:#047857;">${fmtIdr(JOURNAL_KREDIT)}</td>
                  <td>${badge('Selisih Rp 0', 'ok')}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Margin & Basket Summary Strip -->
            <div style="margin:9px 10px 0;padding:7px 9px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div>
                <div style="font-size:9px;color:#065f46;font-weight:700;">LABA KOTOR SHIFT (NET PPN)</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">Rp 4.740.000</div>
                <div style="font-size:8.8px;color:#065f46;">Pendapatan Net 16,92jt - HPP 12,18jt</div>
              </div>
              <div style="border-left:1px solid #a7f3d0;padding-left:8px;">
                <div style="font-size:9px;color:#065f46;font-weight:700;">GROSS MARGIN / TUSLAH</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">28,0% · Rp 975rb</div>
                <div style="font-size:8.8px;color:#065f46;">Kontribusi racikan &amp; embalase</div>
              </div>
              <div style="border-left:1px solid #a7f3d0;padding-left:8px;">
                <div style="font-size:9px;color:#065f46;font-weight:700;">RATA-RATA BASKET (148 TX)</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">Rp 124.493</div>
                <div style="font-size:8.8px;color:#065f46;">Resep Rp 127,7rb · OTC Rp 87,8rb</div>
              </div>
            </div>

            <!-- CoreTax & QRIS Settlement Status Cards -->
            <div style="padding:9px 10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto;">
              <div style="border:1px solid #d5ded9;border-radius:4px;padding:8px 9px;background:#f8faf9;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <strong style="font-size:10.6px;color:#0f1f1a;">Batch CoreTax XML (DJP)</strong>
                  ${badge('Digunggung OK', 'ok')}
                </div>
                <div class="kv"><span class="kv-k">DPP Obat Kena PPN</span><span class="kv-v mono">Rp 13.681.818</span></div>
                <div class="kv"><span class="kv-k">PPN 11% (Faktur Digunggung)</span><span class="kv-v mono">Rp 1.505.000</span></div>
                <div class="kv"><span class="kv-k">Obat Dibebaskan PPN (JKN/PRB)</span><span class="kv-v mono">Rp 3.238.182</span></div>
              </div>
              <div style="border:1px solid #d5ded9;border-radius:4px;padding:8px 9px;background:#f8faf9;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <strong style="font-size:10.6px;color:#0f1f1a;">QRIS SNAP BI Settlement</strong>
                  ${badge('46/46 Sukses', 'ok')}
                </div>
                <div class="kv"><span class="kv-k">Merchant NMID</span><span class="kv-v mono">ID1025048192841</span></div>
                <div class="kv"><span class="kv-k">Total QRIS Bruto</span><span class="kv-v mono">${fmtIdr(5420000)}</span></div>
                <div class="kv"><span class="kv-k">MDR 0,7% (Estimasi)</span><span class="kv-v mono">Rp 37.940</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Close-Out Approval Bar -->
        <div class="e-panel" style="flex:0 0 110px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 14, '#047857')} Otorisasi Tutup Shift &amp; Serah Terima Kasir</div>
            <span class="mono" style="font-size:9.6px;color:#047857;">Maker: TTK Sari N. -> Checker: apt. Lestari</span>
          </div>
          <div class="e-panel-body" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:10.4px;color:#354b43;line-height:1.4;">
              Rekonsiliasi laci tunai, batch EDC <span class="mono">#042</span>, QRIS SNAP BI, dan klaim BPJS PRB telah cocok 100% tanpa selisih. Menutup shift akan mengunci buku kas dan mengirim batch XML ke CoreTax &amp; ERP akuntansi.
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <span class="e-btn">Cetak Z-Report 80mm</span>
              <span class="e-btn e-btn-primary">Kunci &amp; Tutup Shift #01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p6',
    title: 'Settlement Shift Kasir, Rekonsiliasi QRIS/BPJS & CoreTax PPN',
    subtitle: 'Hitung Fisik Laci Kasir, Jurnal Otomatis PSAK Double-Entry & Ekspor Faktur Digunggung',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#047857')} Unduh CoreTax XML</span>
      <span class="e-btn">${pic('printer', 12, '#047857')} Cetak Laporan Shift</span>
      <span class="e-btn e-btn-primary">${ic('check', 12, '#ffffff')} Sahkan Tutup Shift</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 7: SKRINING INTERAKSI OBAT (DDI), MATRIKS DoA & AUDIT WORM SHA-256
// ============================================================================
function renderP7() {
  const ddiRows = DDI_QUEUE.map((d) => `
    <tr class="${d.tone === 'bad' ? 'is-bad' : d.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;">${esc(d.rx)}</td>
      <td style="font-weight:600;">${esc(d.pasien)}</td>
      <td style="font-weight:700;color:#0f1f1a;">${esc(d.pasangan)}</td>
      <td>${badge(d.sev, d.tone)}</td>
      <td style="color:#354b43;">${esc(d.mekanisme)}</td>
      <td style="font-weight:600;color:${d.tone === 'bad' ? '#be123c' : '#047857'};">${esc(d.status)}</td>
    </tr>
  `).join('');

  const doaRows = DOA_MATRIX.map((r, i) => `
    <tr class="${i === 0 ? 'is-selected' : ''}">
      <td><div style="font-weight:700;color:#0f1f1a;">${esc(r.role)}</div><div style="font-size:9.2px;color:#5c7269;">${esc(r.person)}</div></td>
      <td class="mono" style="font-size:9.8px;">${esc(r.fefoOverride)}</td>
      <td>${badge(r.ootRelease, r.ootRelease.includes('Terkunci') ? 'bad' : r.ootRelease.includes('Biometrik') ? 'ok' : 'warn')}</td>
      <td style="font-size:10px;">${esc(r.racikanVerify)}</td>
      <td class="mono" style="font-size:9.8px;">${esc(r.voidTx)}</td>
    </tr>
  `).join('');

  const wormRows = WORM_LOGS.map((l) => `
    <div style="padding:5.5px 8px;border-bottom:1px solid #e3ebe7;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;">
      <div style="display:flex;align-items:center;gap:7px;min-width:0;">
        <span class="mono" style="color:#5c7269;flex-shrink:0;">${esc(l.ts)}</span>
        ${badge(l.event, l.tone)}
        <span class="trunc" style="color:#0f1f1a;"><strong>${esc(l.actor)}</strong> — ${esc(l.target)}</span>
      </div>
      <span class="mono" style="font-size:9.2px;color:#065f46;flex-shrink:0;">${esc(l.hash)}</span>
    </div>
  `).join('');

  const content = `
    <!-- Top Chart: Clinical Volume vs DDI Intervention & Dispensing Time -->
    <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:9px;flex:0 0 232px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 14, '#047857')} Tren Volume Resep vs Intervensi Klinis APJ &amp; SLA Layanan (7 Hari)</div>
          <span class="e-panel-sub">Target SLA Non-Racik &lt;= 10 mnt · Zero Adverse Drug Event</span>
        </div>
        <div class="e-panel-body" style="padding:5px 8px;">
          ${svgMultiLineChart({
            width: 820,
            height: 184,
            xLabels: ['16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
            yMin: 0,
            yMax: 105,
            yTicks: 4,
            yFormat: (v) => `${Math.round(v)}`,
            threshold: { value: 80, label: 'Kapasitas Shift 80 Resep', color: '#b45309' },
            series: [
              { label: 'Total Resep/Hari', color: '#047857', values: [62, 71, 68, 79, 75, 69, 74], area: true, dots: true },
              { label: 'Resep Racikan', color: '#0369a1', values: [14, 19, 16, 21, 17, 15, 18], dots: true },
              { label: 'Alert DDI Dicegah', color: '#be123c', values: [5, 8, 6, 9, 7, 5, 9], dashed: true, dots: true },
            ],
            annotations: [{ index: 6, seriesIdx: 0, label: 'Hari ini: 74 resep (9 DDI dicegah)', color: '#047857', dy: -22 }],
          })}
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 14, '#047857')} Ringkasan Keselamatan Pasien &amp; Kepatuhan UU PDP</div>
          ${badge('PMK 73/2016 · PP 33/2026', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
            <div style="padding:7px;background:#fff1f2;border:1px solid #fecdd3;border-radius:4px;">
              <div style="font-size:9.5px;color:#9f1239;font-weight:700;">DDI Kontra / Mayor Dicegah</div>
              <div class="mono" style="font-size:18px;font-weight:800;color:#be123c;">3 kasus</div>
              <div style="font-size:9px;color:#881337;">100% dikonfirmasi ke dokter</div>
            </div>
            <div style="padding:7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;">
              <div style="font-size:9.5px;color:#065f46;font-weight:700;">Enkripsi PII/NIK Pasien</div>
              <div class="mono" style="font-size:18px;font-weight:800;color:#047857;">AES-256</div>
              <div style="font-size:9px;color:#065f46;">Masking otomatis di struk &amp; log</div>
            </div>
          </div>
          <div>
            <div class="kv"><span class="kv-k">Basis Data Interaksi Klinis</span><span class="kv-v mono">Pionas BPOM + DrugBank v5.1</span></div>
            <div class="kv"><span class="kv-k">Verifikasi SIPA APJ Aktif</span><span class="kv-v mono" style="color:#047857;">446/2025/JKT-S (Valid 2029)</span></div>
            <div class="kv"><span class="kv-k">Kebijakan Override FEFO / OOT</span><span class="kv-v">Wajib Dual-Auth (Maker TTK + APJ)</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: DDI Queue (Left) + DoA RBAC & WORM Audit Log (Right) -->
    <div style="display:grid;grid-template-columns:1.18fr 1fr;gap:9px;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${pic('clinical', 14, '#be123c')} Antrean Skrining Interaksi Obat (DDI) &amp; Intervensi Klinis APJ</div>
          ${badge('9 Terdeteksi Hari Ini · 2 Aktif', 'warn')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:106px;">No. Resep</th>
                <th style="width:104px;">Pasien</th>
                <th style="width:176px;">Pasangan Obat / Pemicu</th>
                <th style="width:88px;">Tingkat</th>
                <th>Mekanisme Klinis</th>
                <th style="width:136px;">Keputusan APJ</th>
              </tr>
            </thead>
            <tbody>${ddiRows}</tbody>
          </table>

          <!-- Active Clinical Action Card -->
          <div style="margin:8px 10px;padding:8px 10px;background:#fff5f6;border:1px solid #fda4af;border-radius:4px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;">
            <div style="line-height:1.35;">
              <div style="font-size:10.8px;font-weight:800;color:#881337;">Tindak Lanjut Wajib: RX-261122-073 (Tn. Bambang S.) — Warfarin 2mg + Aspirin 80mg</div>
              <div style="font-size:9.8px;color:#9f1239;">Rekomendasi APJ: Hubungi dr. Rina Sp.JP via telepon terrekam untuk konfirmasi indikasi dual-terapi katup mekanik atau tunda Aspirin + cek INR &lt;7 hari.</div>
            </div>
            <div style="display:flex;gap:5px;flex-shrink:0;">
              <span class="e-btn">Catat Konfirmasi Dokter</span>
              <span class="e-btn e-btn-primary">Sahkan Intervensi</span>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('users', 14, '#047857')} Matriks Wewenang (DoA / RBAC Farmasi)</div>
            ${badge('Maker-Checker Aktif', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:142px;">Peran &amp; Petugas</th>
                  <th style="width:105px;">Override FEFO</th>
                  <th style="width:102px;">Buka OOT/Psiko</th>
                  <th style="width:94px;">Racikan</th>
                  <th style="width:88px;">Batas Void</th>
                </tr>
              </thead>
              <tbody>${doaRows}</tbody>
            </table>
            <div style="padding:6px 9px;background:#f8faf9;border-top:1px solid #d5ded9;font-size:9.4px;color:#354b43;margin-top:auto;">
              <strong>Delegasi SIPA (PMK 73/2016):</strong> Saat APJ cuti/izin, kewenangan rilis Psikotropika dialihkan otomatis ke Apoteker Pendamping bersertifikat SIPA aktif dengan log audit WORM.
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:0 0 218px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 14, '#047857')} Jejak Audit WORM SHA-256 (Tidak Dapat Diubah)</div>
            ${badge('Chain Verified', 'ok')}
          </div>
          <div class="e-panel-body-flush">${wormRows}</div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p7',
    title: 'Skrining Interaksi Obat (DDI), Otorisasi DoA & Audit WORM SHA-256',
    subtitle: 'Keselamatan Pasien PMK 73/2016 · Maker-Checker APJ/TTK & Pelindungan Data Kesehatan UU PDP',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#047857')} Ekspor Log Audit BPOM</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 12, '#ffffff')} Tinjau 2 Otorisasi Tertunda</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 8: INTEGRASI SATUSEHAT KFA, PERANGKAT KERAS & KIOSK PASIEN
// ============================================================================
function renderP8() {
  const intRows = INTEGRATIONS.map((x) => `
    <tr>
      <td style="font-weight:700;">${esc(x.name)}</td>
      <td class="mono" style="color:#475569;font-size:9.8px;">${esc(x.proto)}</td>
      <td class="mono num" style="font-weight:700;">${esc(x.p95)}</td>
      <td class="mono">${esc(x.sync)}</td>
      <td class="mono" style="color:#065f46;">${esc(x.queue)}</td>
      <td>${badge(x.status, x.tone)}</td>
    </tr>
  `).join('');

  // Architecture SVG Topology Diagram
  const archSvg = `<svg viewBox="0 0 790 162" width="100%" height="162" style="display:block;">
    <rect x="0" y="0" width="790" height="162" rx="4" fill="#f8faf9" stroke="#cbd7d1" />
    <!-- Node 1: Client WPF -->
    <rect x="14" y="24" width="166" height="114" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.5" />
    <rect x="14" y="24" width="166" height="22" rx="3" fill="#047857" />
    <text x="97" y="39" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">CLIENT · .NET 8 WPF</text>
    <text x="24" y="64" font-size="9.5" font-weight="700" fill="#0f1f1a" font-family="Segoe UI,sans-serif">Kasir Meja Resep #01–02</text>
    <text x="24" y="80" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• SQLite WAL Offline-First</text>
    <text x="24" y="95" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• Zebra ZD220 ZPL Bridge</text>
    <text x="24" y="110" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• Honeywell GS1 Scanner</text>
    <text x="24" y="125" font-size="8.8" fill="#047857" font-weight="700" font-family="Consolas,monospace">● 0 ms local latency</text>

    <!-- Arrow 1->2 -->
    <line x1="180" y1="81" x2="212" y2="81" stroke="#047857" stroke-width="1.8" />
    <polygon points="212,77 220,81 212,85" fill="#047857" />

    <!-- Node 2: Edge APJ API -->
    <rect x="220" y="24" width="162" height="114" rx="4" fill="#ffffff" stroke="#0369a1" stroke-width="1.5" />
    <rect x="220" y="24" width="162" height="22" rx="3" fill="#0369a1" />
    <text x="301" y="39" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">EDGE · APJ VERIFY API</text>
    <text x="230" y="64" font-size="9.5" font-weight="700" fill="#0f1f1a" font-family="Segoe UI,sans-serif">Role &amp; SIPA Gatekeeper</text>
    <text x="230" y="80" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• Biometrik / OTP APJ</text>
    <text x="230" y="95" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• DDI Clinical Engine</text>
    <text x="230" y="110" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• WORM SHA-256 Signer</text>
    <text x="230" y="125" font-size="8.8" fill="#0369a1" font-weight="700" font-family="Consolas,monospace">● p95 14 ms · mTLS</text>

    <!-- Arrow 2->3 -->
    <line x1="382" y1="81" x2="414" y2="81" stroke="#0369a1" stroke-width="1.8" />
    <polygon points="414,77 422,81 414,85" fill="#0369a1" />

    <!-- Node 3: Core Engine & PostgreSQL -->
    <rect x="422" y="24" width="168" height="114" rx="4" fill="#ffffff" stroke="#065f46" stroke-width="1.5" />
    <rect x="422" y="24" width="168" height="22" rx="3" fill="#064e3b" />
    <text x="506" y="39" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,sans-serif">CORE · FEFO + SIPNAP</text>
    <text x="432" y="64" font-size="9.5" font-weight="700" fill="#0f1f1a" font-family="Segoe UI,sans-serif">PostgreSQL 16 Ledger</text>
    <text x="432" y="80" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• FEFO Lot Lock Engine</text>
    <text x="432" y="95" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• Racikan BOM &amp; Tuslah</text>
    <text x="432" y="110" font-size="8.8" fill="#475569" font-family="Consolas,monospace">• SIPNAP &amp; PSAK Books</text>
    <text x="432" y="125" font-size="8.8" fill="#047857" font-weight="700" font-family="Consolas,monospace">● 0 Selisih · WAL OK</text>

    <!-- Arrow 3->4 -->
    <line x1="590" y1="54" x2="622" y2="42" stroke="#047857" stroke-width="1.5" />
    <line x1="590" y1="81" x2="622" y2="81" stroke="#047857" stroke-width="1.5" />
    <line x1="590" y1="108" x2="622" y2="120" stroke="#047857" stroke-width="1.5" />

    <!-- Node 4: External GovTech & Payment Bridges -->
    <rect x="622" y="18" width="154" height="36" rx="3" fill="#ecfdf5" stroke="#047857" />
    <text x="630" y="33" font-size="9" font-weight="700" fill="#065f46" font-family="Segoe UI,sans-serif">SATUSEHAT FHIR + KFA</text>
    <text x="630" y="46" font-size="8.4" fill="#047857" font-family="Consolas,monospace">98.420 SKU · 184 ms</text>

    <rect x="622" y="63" width="154" height="36" rx="3" fill="#fffbeb" stroke="#d97706" />
    <text x="630" y="78" font-size="9" font-weight="700" fill="#92400e" font-family="Segoe UI,sans-serif">SIPNAP &amp; BPJS Apotek</text>
    <text x="630" y="91" font-size="8.4" fill="#b45309" font-family="Consolas,monospace">XML v3.4 · 16 SEP OK</text>

    <rect x="622" y="108" width="154" height="36" rx="3" fill="#f0f9ff" stroke="#0369a1" />
    <text x="630" y="123" font-size="9" font-weight="700" fill="#0369a1" font-family="Segoe UI,sans-serif">QRIS SNAP BI &amp; CoreTax</text>
    <text x="630" y="136" font-size="8.4" fill="#0369a1" font-family="Consolas,monospace">46 Tx Settled · PPN OK</text>
  </svg>`;

  const content = `
    <div style="display:grid;grid-template-columns:1.34fr 1fr;gap:9px;flex:1;min-height:0;">
      <!-- LEFT: Architecture Topology + GovTech API Table + Latency Waterfall -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:0 0 206px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 14, '#047857')} Topologi Arsitektur Offline-First (.NET 8 WPF · SQLite -> PostgreSQL · GovTech)</div>
            ${badge('SLA 99,97% · Offline-Safe', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:6px 8px;">${archSvg}</div>
        </div>

        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('globe', 14, '#047857')} Kesehatan Endpoint SATUSEHAT KFA, BPOM, SIPNAP &amp; QRIS SNAP BI</div>
            ${badge('7 Online · 1 Degraded p95', 'warn')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:230px;">Layanan Integrasi</th>
                  <th style="width:142px;">Protokol</th>
                  <th class="num" style="width:66px;">p95</th>
                  <th style="width:94px;">Volume</th>
                  <th style="width:88px;">Antrean</th>
                  <th style="width:94px;">Status</th>
                </tr>
              </thead>
              <tbody>${intRows}</tbody>
            </table>
          </div>
        </div>

        <div class="e-panel" style="flex:0 0 198px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('zap', 14, '#047857')} Profil Latensi End-to-End Transaksi e-Resep (Total: 342 ms)</div>
            <span class="mono" style="font-size:9.6px;color:#047857;">Target UX POS &lt; 500 ms</span>
          </div>
          <div class="e-panel-body" style="padding:6px 10px;">
            ${svgSpanWaterfall({
              width: 780,
              totalMs: 360,
              spans: [
                { label: '1. Scan GS1 & Parse Batch', start: 0, dur: 18, color: '#047857' },
                { label: '2. FEFO Lot Lock (SQLite)', start: 18, dur: 24, color: '#059669' },
                { label: '3. Skrining DDI & Dosis', start: 42, dur: 38, color: '#0369a1' },
                { label: '4. SATUSEHAT KFA FHIR', start: 80, dur: 184, color: '#d97706' },
                { label: '5. ZPL Etiket & Struk', start: 264, dur: 78, color: '#065f46' },
              ],
            })}
          </div>
        </div>
      </div>

      <!-- RIGHT: Companion Patient Self-Check-In Kiosk + WPF Hardware Peripherals -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <!-- Patient Queue & Self-Service Kiosk Frame -->
        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('device', 14, '#047857')} Pratinjau Kiosk Antrean Pasien 10&quot; (Ruang Tunggu Apotek)</div>
            ${badge('Tersinkron SignalR', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <div class="kiosk-frame" style="flex:1;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1b4336;padding-bottom:6px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:20px;height:20px;border-radius:3px;background:#10b981;color:#052e16;font-family:var(--e-mono);font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;">Rx</span>
                  <span style="font-size:11.5px;font-weight:700;color:#ffffff;">APOTEK SEHAT NUSANTARA · STATUS ANTREAN RESEP</span>
                </div>
                <span class="mono" style="font-size:10px;color:#6ee7b7;">14:18 WIB</span>
              </div>

              <!-- Now Calling Banner -->
              <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:7px;">
                <div style="background:#047857;border:1px solid #34d399;border-radius:4px;padding:9px 10px;">
                  <div style="font-size:9.2px;font-weight:700;color:#d1fae5;letter-spacing:0.04em;">SIAP DIAMBIL · LOKET PIO #1</div>
                  <div class="mono" style="font-size:26px;font-weight:800;color:#ffffff;line-height:1.1;margin:3px 0;">R-064</div>
                  <div style="font-size:10px;color:#ecfdf5;">Ny. Kar***i · Lunas QRIS · Konseling APJ</div>
                </div>
                <div style="background:#13352b;border:1px solid #26604e;border-radius:4px;padding:9px 10px;">
                  <div style="font-size:9.2px;font-weight:700;color:#a7f3d0;letter-spacing:0.04em;">SEDANG DIRACIK · EST. 6 MNT</div>
                  <div class="mono" style="font-size:26px;font-weight:800;color:#fde68a;line-height:1.1;margin:3px 0;">R-071</div>
                  <div style="font-size:10px;color:#d1fae5;">An. Raf* M. · Puyer Racikan 10 Bks (72%)</div>
                </div>
              </div>

              <!-- Queue List inside Kiosk -->
              <div style="background:#112921;border:1px solid #1e4b3d;border-radius:4px;padding:7px 9px;display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;justify-content:space-between;font-size:9.8px;padding-bottom:3px;border-bottom:1px solid #1e4b3d;">
                  <span class="mono" style="color:#6ee7b7;font-weight:700;">R-063 · An. Bim* A.</span>
                  <span style="color:#86efac;font-weight:700;">SIAP DIAMBIL · LOKET PIO #2</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9.8px;padding-bottom:3px;border-bottom:1px solid #1e4b3d;">
                  <span class="mono" style="color:#e2e8f0;font-weight:700;">R-067 · Tn. Ded* K.</span>
                  <span style="color:#93c5fd;">CETAK ETIKET &amp; CEK APJ (2 mnt)</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9.8px;padding-bottom:3px;border-bottom:1px solid #1e4b3d;">
                  <span class="mono" style="color:#e2e8f0;font-weight:700;">R-070 · Ny. Sit* R.</span>
                  <span style="color:#fde68a;">PROSES RACIK SALEP (5 mnt)</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9.8px;">
                  <span class="mono" style="color:#e2e8f0;font-weight:700;">R-074 · Ny. Ami***h</span>
                  <span style="color:#fca5a5;">VERIFIKASI RESEP DI MEJA APJ</span>
                </div>
              </div>

              <!-- Self Check-In Prompt -->
              <div style="display:flex;align-items:center;justify-content:space-between;background:#0a1d17;border:1px dashed #34d399;border-radius:4px;padding:7px 9px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  ${pic('qris', 20, '#6ee7b7')}
                  <div>
                    <div style="font-size:10.4px;font-weight:700;color:#ffffff;">Punya e-Resep SATUSEHAT / BPJS?</div>
                    <div style="font-size:9.2px;color:#a7f3d0;">Pindai QR e-Resep di bawah layar untuk ambil nomor antrean otomatis.</div>
                  </div>
                </div>
                <span class="mono" style="font-size:9.5px;font-weight:700;padding:4px 8px;background:#047857;color:#ffffff;border-radius:3px;">PINDAI QR</span>
              </div>

              <!-- Kiosk Action Bar & PIO Info Ticker -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:auto;">
                <div style="background:#13352b;border:1px solid #26604e;border-radius:4px;padding:6px 8px;text-align:center;font-size:9.8px;font-weight:700;color:#ecfdf5;">Cek Status Resep via No. HP</div>
                <div style="background:#13352b;border:1px solid #26604e;border-radius:4px;padding:6px 8px;text-align:center;font-size:9.8px;font-weight:700;color:#a7f3d0;">Panggil Konseling Apoteker (Gratis)</div>
              </div>
              <div style="background:#081611;border-top:1px solid #1b4336;padding:5px 8px;border-radius:3px;font-size:9px;color:#86efac;display:flex;justify-content:space-between;">
                <span>INFO PIO: Antibiotik wajib dihabiskan sesuai aturan · Insulin simpan di chiller 2–8°C</span>
                <span class="mono" style="color:#6ee7b7;">APJ Siaga</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hardware Peripherals Telemetry Panel -->
        <div class="e-panel" style="flex:0 0 282px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${pic('printer', 14, '#047857')} Jembatan Perangkat Keras WPF (Meja Resep #01)</div>
            ${badge('5/5 Perangkat Siap', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
            <div class="kv">
              <div><strong style="color:#0f1f1a;">Zebra ZD220 Thermal Etiket (80x50mm)</strong><div class="mono" style="font-size:9px;color:#5c7269;">USB001 · ZPL II · Sisa Roll: 148 Stiker (84%)</div></div>
              ${badge('Siap Cetak', 'ok')}
            </div>
            <div class="kv">
              <div><strong style="color:#0f1f1a;">Epson TM-T82X Struk Kasir + Laci RJ11</strong><div class="mono" style="font-size:9px;color:#5c7269;">COM3 · ESC/POS · Kertas 80mm Normal</div></div>
              ${badge('Terkunci', 'ok')}
            </div>
            <div class="kv">
              <div><strong style="color:#0f1f1a;">Honeywell Voyager 1472g 2D Scanner</strong><div class="mono" style="font-size:9px;color:#5c7269;">HID-POS · Parser GS1 DataMatrix (GTIN+Lot+Exp)</div></div>
              ${badge('Aktif', 'ok')}
            </div>
            <div class="kv">
              <div><strong style="color:#0f1f1a;">Sensor Suhu Chiller Vaksin/Insulin IoT</strong><div class="mono" style="font-size:9px;color:#5c7269;">MQTT Broker Lokal · 4,2°C · Batas 2,0–8,0°C</div></div>
              ${badge('4,2°C OK', 'info')}
            </div>
            <div class="kv">
              <div><strong style="color:#0f1f1a;">Pembaca e-KTP / Biometrik APJ USB</strong><div class="mono" style="font-size:9px;color:#5c7269;">PC/SC Reader · Untuk gerbang Psikotropika SIPNAP</div></div>
              ${badge('Standby', 'ok')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return apotekShell({
    activeNav: 'p8',
    title: 'Integrasi SATUSEHAT KFA, Perangkat Keras & Kiosk Antrean Pasien',
    subtitle: 'Arsitektur Offline-First .NET 8 WPF, Telemetri API GovTech & Jembatan Printer Termal ZPL',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 12, '#047857')} Sinkron Master KFA BPOM</span>
      <span class="e-btn e-btn-primary">${pic('printer', 12, '#ffffff')} Diagnostik Semua Perangkat</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// EXPORT ALL 8 ENTERPRISE SCREENS
// ============================================================================
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
