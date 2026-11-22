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
  id: 'ID-027',
  name: 'ReturnGuard ID',
  reference: 'SAP S/4HANA Fiori Horizon + ServiceNow Enterprise',
  persona: 'R. Kusuma · VP Risk & Reverse Logistics · PT Nusantara D2C Group',
  pages: [
    { slug: 'p1', title: 'Kokpit Eksekutif Risiko COD & Rasio RTS' },
    { slug: 'p2', title: 'Triase Order COD & Inspektor WA Business' },
    { slug: 'p3', title: 'Papan Kanban RMA & Denah Rak Gudang Retur' },
    { slug: 'p4', title: 'Forensik Video Packing vs Unboxing Sengketa' },
    { slug: 'p5', title: 'Mesin Aturan Risiko COD & Simulasi What-If' },
    { slug: 'p6', title: 'Rekonsiliasi COD 3PL, PSAK & CoreTax XML' },
    { slug: 'p7', title: 'Persetujuan DoA Maker-Checker & Klaim 3PL' },
    { slug: 'p8', title: 'Kepatuhan UU PDP, Audit WORM & Webhook 3PL' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY VERIFIED ACROSS P1–P8)
// ============================================================================
const ENTITIES = [
  {
    code: 'ENT-LVR',
    name: 'PT Lavera Beauty D2C',
    ordersCod: 4820,
    rtsCount: 289,
    heldMtd: 312,
    waSent: 680,
    waConfirmed: 564,
    ongkirSavedWeek: 4100000,
    ongkirSavedMtd: 14680000,
    codGrossIdr: 1687000000,
  },
  {
    code: 'ENT-KRY',
    name: 'PT Karya Apparel Nusantara',
    ordersCod: 3640,
    rtsCount: 248,
    heldMtd: 256,
    waSent: 540,
    waConfirmed: 440,
    ongkirSavedWeek: 3300000,
    ongkirSavedMtd: 12120000,
    codGrossIdr: 1237600000,
  },
  {
    code: 'ENT-SHT',
    name: 'PT Sehat Herba Mandiri',
    ordersCod: 2490,
    rtsCount: 152,
    heldMtd: 168,
    waSent: 340,
    waConfirmed: 281,
    ongkirSavedWeek: 2200000,
    ongkirSavedMtd: 7940000,
    codGrossIdr: 821700000,
  },
  {
    code: 'ENT-HMT',
    name: 'PT Distribusi HomeTech ID',
    ordersCod: 1550,
    rtsCount: 111,
    heldMtd: 124,
    waSent: 240,
    waConfirmed: 191,
    ongkirSavedWeek: 1800000,
    ongkirSavedMtd: 6860000,
    codGrossIdr: 728500000,
  },
];

const CARRIERS = [
  {
    code: 'JNT',
    name: 'J&T Express',
    orders: 5120,
    rts: 348,
    codGross: 1842000000,
    settled: 1698400000,
    disputeHold: 42600000,
    rtsFee: 101000000,
    slaDays: 'H+2',
    p95WebhookMs: 142,
    uptime: '99,94%',
  },
  {
    code: 'JNE',
    name: 'JNE Express',
    orders: 3480,
    rts: 205,
    codGross: 1264200000,
    settled: 1181900000,
    disputeHold: 24800000,
    rtsFee: 57500000,
    slaDays: 'H+3',
    p95WebhookMs: 188,
    uptime: '99,88%',
  },
  {
    code: 'NJV',
    name: 'Ninja Xpress',
    orders: 2350,
    rts: 158,
    codGross: 836400000,
    settled: 769200000,
    disputeHold: 21400000,
    rtsFee: 45800000,
    slaDays: 'H+2',
    p95WebhookMs: 126,
    uptime: '99,96%',
  },
  {
    code: 'SCP',
    name: 'SiCepat Ekspres',
    orders: 1550,
    rts: 89,
    codGross: 532200000,
    settled: 494500000,
    disputeHold: 11200000,
    rtsFee: 26500000,
    slaDays: 'H+2',
    p95WebhookMs: 164,
    uptime: '99,91%',
  },
];

const CORRIDORS = [
  { id: 'JKT', name: 'Jabodetabek & Banten', orders: 3850, rts: 135, x: 164, y: 166, tone: 'ok' },
  { id: 'JWA', name: 'Jabar, Jateng & Jatim', orders: 3620, rts: 174, x: 226, y: 178, tone: 'ok' },
  { id: 'SUM', name: 'Sumatera (MDN–PLM–LPG)', orders: 2140, rts: 167, x: 94, y: 112, tone: 'warn' },
  { id: 'KAL', name: 'Kalimantan (BPN–PNK–BDJ)', orders: 1210, rts: 115, x: 244, y: 112, tone: 'warn' },
  { id: 'SUL', name: 'Sulawesi (MKS–Kab. Bone)', orders: 1120, rts: 138, x: 326, y: 128, tone: 'bad' },
  { id: 'TIM', name: 'Bali, Nusra & Papua', orders: 560, rts: 71, x: 432, y: 156, tone: 'bad' },
];

// 18-row Operational Triage Queue (exact 14 COD held pre-shipment + 4 approved)
const COD_ORDERS = [
  { code: 'COD-512', orderNo: '#9921', entity: 'Lavera', dest: 'Kab. Bone, Sulsel', phone: '0813****892', carrier: 'J&T COD', rtrw: 'Tidak Ada', prevRts: 2, value: 485000, ongkirPp: 74000, score: 84, waState: 'Terkirim (12m)', status: 'Tahan / WA', tone: 'bad', held: true, selected: true },
  { code: 'COD-511', orderNo: '#9920', entity: 'Apparel', dest: 'Kab. Deli Serdang', phone: '0852****441', carrier: 'J&T COD', rtrw: 'Tidak Ada', prevRts: 3, value: 620000, ongkirPp: 68000, score: 91, waState: 'Belum Balas', tone: 'bad', status: 'Blokir Auto', held: true },
  { code: 'COD-510', orderNo: '#9919', entity: 'HomeTech', dest: 'Kota Sorong, Papua BD', phone: '0812****709', carrier: 'JNE COD', rtrw: 'Tidak Ada', prevRts: 1, value: 890000, ongkirPp: 142000, score: 88, waState: 'Terkirim (18m)', tone: 'bad', status: 'Blokir Auto', held: true },
  { code: 'COD-509', orderNo: '#9916', entity: 'Herba', dest: 'Kab. Ketapang, Kalbar', phone: '0857****118', carrier: 'Ninja COD', rtrw: 'Parsial', prevRts: 2, value: 340000, ongkirPp: 82000, score: 78, waState: 'Terkirim (24m)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-508', orderNo: '#9914', entity: 'Lavera', dest: 'Bekasi Utara, Jabar', phone: '0819****334', carrier: 'J&T COD', rtrw: 'RT 04/RW 11', prevRts: 0, value: 290000, ongkirPp: 22000, score: 22, waState: 'Balas "YA"', tone: 'ok', status: 'Kirim', held: false },
  { code: 'COD-507', orderNo: '#9912', entity: 'Apparel', dest: 'Kab. Luwu Timur, Sulsel', phone: '0821****602', carrier: 'J&T COD', rtrw: 'Tidak Ada', prevRts: 2, value: 410000, ongkirPp: 86000, score: 82, waState: 'Terkirim (31m)', tone: 'bad', status: 'Tahan / WA', held: true },
  { code: 'COD-506', orderNo: '#9910', entity: 'Lavera', dest: 'Kota Kupang, NTT', phone: '0853****910', carrier: 'JNE COD', rtrw: 'Tidak Ada', prevRts: 1, value: 525000, ongkirPp: 108000, score: 76, waState: 'Menunggu WA', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-505', orderNo: '#9908', entity: 'HomeTech', dest: 'Kab. Musi Banyuasin', phone: '0822****518', carrier: 'Ninja COD', rtrw: 'Tidak Ada', prevRts: 2, value: 740000, ongkirPp: 76000, score: 86, waState: 'Gagal Kirim', tone: 'bad', status: 'Blokir Auto', held: true },
  { code: 'COD-504', orderNo: '#9905', entity: 'Herba', dest: 'Kab. Sanggau, Kalbar', phone: '0815****274', carrier: 'J&T COD', rtrw: 'Parsial', prevRts: 1, value: 315000, ongkirPp: 78000, score: 67, waState: 'Terkirim (42m)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-503', orderNo: '#9903', entity: 'Apparel', dest: 'Depok, Jawa Barat', phone: '0878****115', carrier: 'SiCepat', rtrw: 'RT 02/RW 07', prevRts: 0, value: 265000, ongkirPp: 20000, score: 18, waState: 'Balas "YA"', tone: 'ok', status: 'Kirim', held: false },
  { code: 'COD-502', orderNo: '#9901', entity: 'Lavera', dest: 'Kab. Bireuen, Aceh', phone: '0852****803', carrier: 'JNE COD', rtrw: 'Tidak Ada', prevRts: 2, value: 460000, ongkirPp: 92000, score: 85, waState: 'Terkirim (48m)', tone: 'bad', status: 'Tahan / WA', held: true },
  { code: 'COD-501', orderNo: '#9898', entity: 'HomeTech', dest: 'Kab. Morowali, Sulteng', phone: '0813****449', carrier: 'J&T COD', rtrw: 'Tidak Ada', prevRts: 3, value: 950000, ongkirPp: 124000, score: 94, waState: 'Diblokir WA', tone: 'bad', status: 'Blokir Auto', held: true },
  { code: 'COD-500', orderNo: '#9896', entity: 'Apparel', dest: 'Kab. Rokan Hilir, Riau', phone: '0823****761', carrier: 'Ninja COD', rtrw: 'Parsial', prevRts: 1, value: 380000, ongkirPp: 66000, score: 69, waState: 'Terkirim (51m)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-499', orderNo: '#9894', entity: 'Herba', dest: 'Surabaya Barat, Jatim', phone: '0811****902', carrier: 'SiCepat', rtrw: 'RT 06/RW 03', prevRts: 0, value: 320000, ongkirPp: 28000, score: 19, waState: 'Auto-Lolos', tone: 'ok', status: 'Kirim', held: false },
  { code: 'COD-498', orderNo: '#9891', entity: 'Lavera', dest: 'Kab. Dompu, NTB', phone: '0859****227', carrier: 'J&T COD', rtrw: 'Tidak Ada', prevRts: 1, value: 430000, ongkirPp: 88000, score: 74, waState: 'Terkirim (1j)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-497', orderNo: '#9889', entity: 'Apparel', dest: 'Kab. Kutai Barat, Kaltim', phone: '0812****385', carrier: 'JNE COD', rtrw: 'Tidak Ada', prevRts: 1, value: 510000, ongkirPp: 96000, score: 77, waState: 'Terkirim (1j)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-496', orderNo: '#9886', entity: 'Lavera', dest: 'Kab. Ogan Ilir, Sumsel', phone: '0856****614', carrier: 'Ninja COD', rtrw: 'Parsial', prevRts: 1, value: 295000, ongkirPp: 58000, score: 64, waState: 'Terkirim (1j)', tone: 'warn', status: 'Tahan / WA', held: true },
  { code: 'COD-495', orderNo: '#9884', entity: 'HomeTech', dest: 'Bandung Wetan, Jabar', phone: '0817****091', carrier: 'JNE COD', rtrw: 'RT 01/RW 05', prevRts: 0, value: 640000, ongkirPp: 24000, score: 24, waState: 'Balas "YA"', tone: 'ok', status: 'Kirim', held: false },
];

// Scoring rules (first 4 rules triggered by COD-512 sum exactly to 84!)
const RISK_RULES = [
  { id: 'RL-01', name: 'Alamat Tanpa RT/RW & Nomor Rumah', layer: 'Address NLP', weight: 32, hit30d: 1842, precision: '94,2%', action: 'Hold / WA', active: true, hit512: true },
  { id: 'RL-02', name: 'Riwayat RTS >= 2x pada Nomor HP / Hash', layer: 'Graph History', weight: 28, hit30d: 1126, precision: '96,8%', action: 'Hold / Blokir', active: true, hit512: true },
  { id: 'RL-03', name: 'Koridor Luar Jawa Tier-3 (RTS >11%)', layer: 'Geo-Courier', weight: 14, hit30d: 2410, precision: '88,5%', action: 'Boost Skor', active: true, hit512: true },
  { id: 'RL-04', name: 'Nilai COD > Rp 400.000 Akun Pembeli Baru', layer: 'Order Velocity', weight: 10, hit30d: 1590, precision: '85,1%', action: 'Wajib WA', active: true, hit512: true },
  { id: 'RL-05', name: 'Ketidakcocokan Kecamatan vs Kodepos Kemendagri', layer: 'Address NLP', weight: 18, hit30d: 742, precision: '91,4%', action: 'Koreksi WA', active: true, hit512: false },
  { id: 'RL-06', name: 'Order Beruntun >= 3x dalam 20 Menit (Device ID)', layer: 'Fraud Graph', weight: 35, hit30d: 214, precision: '98,1%', action: 'Auto-Blokir', active: true, hit512: false },
  { id: 'RL-07', name: 'Jam Checkout Anomali (00:30 – 04:15 WIB)', layer: 'Behavioral', weight: 8, hit30d: 960, precision: '79,4%', action: 'Boost Skor', active: true, hit512: false },
  { id: 'RL-08', name: 'Nomor HP VoIP / Tidak Terdaftar WhatsApp', layer: 'WA API Probe', weight: 26, hit30d: 418, precision: '95,3%', action: 'Auto-Blokir', active: true, hit512: false },
  { id: 'RL-09', name: 'Kode Gagal Antar Kurir: "Alamat Fiktif (RT09)"', layer: '3PL Webhook', weight: 30, hit30d: 312, precision: '97,4%', action: 'Blacklist HP', active: true, hit512: false },
  { id: 'RL-10', name: 'Nama Penerima Karakter Acak / Single Token', layer: 'NLP Heuristic', weight: 12, hit30d: 528, precision: '83,7%', action: 'Wajib WA', active: true, hit512: false },
  { id: 'RL-11', name: 'Pembeli VIP (>= 3x COD Sukses Tanpa RTS)', layer: 'Whitelist', weight: -25, hit30d: 3890, precision: '99,2%', action: 'Fast-Track', active: true, hit512: false },
  { id: 'RL-12', name: 'Konfirmasi WA "YA" + Share Lokasi Pin GPS', layer: 'WA 2-Arah', weight: -40, hit30d: 1476, precision: '98,6%', action: 'Auto-Release', active: true, hit512: false },
];

// 5-Lane Kanban RMA Board (15 active cards on P3)
const RMA_CARDS = [
  // Lane 1: transit
  { id: 'RTS-094', lane: 'transit', awb: '#JP882491', title: 'Serum Retinol 30ml (x2)', route: 'Makassar -> Gudang JKT', carrier: 'J&T', reason: 'Penerima Menolak COD', value: 368000, age: 'H+2', grade: 'Menunggu', tone: 'warn', bin: 'INBOUND' },
  { id: 'RTS-093', lane: 'transit', awb: '#JN771042', title: 'Jaket Parka Canvas XL', route: 'Balikpapan -> Gudang JKT', carrier: 'JNE', reason: 'Alamat Tidak Ditemukan', value: 445000, age: 'H+3', grade: 'Menunggu', tone: 'warn', bin: 'INBOUND' },
  { id: 'RTS-092', lane: 'transit', awb: '#NV510288', title: 'Blender Portable Pro', route: 'Medan -> Gudang JKT', carrier: 'Ninja', reason: '3x Gagal Antar (CR04)', value: 520000, age: 'H+1', grade: 'Menunggu', tone: 'info', bin: 'INBOUND' },
  // Lane 2: dock
  { id: 'RTS-091', lane: 'dock', awb: '#JP882219', title: 'Bundle Sunscreen SPF50', route: 'Dock Retur B2 · JKT', carrier: 'J&T', reason: 'COD Ditolak Pembeli', value: 279000, age: '04j 12m', grade: 'Scan Dock', tone: 'info', bin: 'DOCK-B2' },
  { id: 'RTS-090', lane: 'dock', awb: '#SC339104', title: 'Kemeja Linen Sage M', route: 'Dock Retur B1 · JKT', carrier: 'SiCepat', reason: 'Penerima Pindah Alamat', value: 235000, age: '06j 40m', grade: 'Scan Dock', tone: 'info', bin: 'DOCK-B1' },
  { id: 'RTS-089', lane: 'dock', awb: '#JN770894', title: 'Madu Hutan Baduy 500g', route: 'Dock Retur B2 · JKT', carrier: 'JNE', reason: 'Kardus Penyok Transit', value: 195000, age: '08j 05m', grade: 'Cek Segel', tone: 'warn', bin: 'DOCK-B2' },
  // Lane 3: qc
  { id: 'RMA-118', lane: 'qc', awb: '#JP882190', title: 'Smart Air Purifier Mini', route: 'Meja QC-02 · Teknisi', carrier: 'J&T', reason: 'Klaim Unit Tidak Nyala', value: 780000, age: '02j 20m', grade: 'Uji Fungsi', tone: 'warn', bin: 'QC-LAB' },
  { id: 'RMA-117', lane: 'qc', awb: '#NV510112', title: 'Dress Midi Katun L', route: 'Meja QC-01 · Tekstil', carrier: 'Ninja', reason: 'Tukar Ukuran L -> M', value: 310000, age: '03j 45m', grade: 'Grade B', tone: 'info', bin: 'REPACK-R2' },
  { id: 'RTS-087', lane: 'qc', awb: '#JP882177', title: 'Set Skincare Glowing', route: 'Meja QC-03 · Segel', carrier: 'J&T', reason: 'RTS Luar Jawa (Palopo)', value: 420000, age: '01j 50m', grade: 'Grade A', tone: 'ok', bin: 'QC-PASS' },
  // Lane 4: dispute
  { id: 'RMA-114', lane: 'dispute', awb: '#JP881920', title: 'Klaim Salah Ukuran — Bandung', route: 'Video Packing Sesuai SKU-L', carrier: 'J&T', reason: 'Sengketa Menang · Video OK', value: 245000, age: 'Tutup', grade: 'Video OK', tone: 'ok', bin: 'DISP-WIN' },
  { id: 'RMA-115', lane: 'dispute', awb: '#JN770512', title: 'Klaim Paket Kosong — Medan', route: 'Berat Packing 640g vs 110g', carrier: 'JNE', reason: 'Eskalasi Klaim 3PL', value: 685000, age: '19j 10m', grade: 'Klaim 3PL', tone: 'bad', bin: 'DISP-3PL' },
  { id: 'RMA-116', lane: 'dispute', awb: '#NV509981', title: 'Klaim Botol Pecah — Jambi', route: 'Bubblewrap 4-Lapis Terbukti', carrier: 'Ninja', reason: 'Review Mediator', value: 340000, age: '11j 35m', grade: 'Bukti CCTV', tone: 'warn', bin: 'DISP-MED' },
  // Lane 5: restock
  { id: 'RTS-088', lane: 'restock', awb: '#JP882144', title: 'Paket Retur #JP882144', route: 'Gudang JKT · Segel Utuh', carrier: 'J&T', reason: 'Lulus QC · Restock Stok +1', value: 390000, age: 'Selesai', grade: 'Stok +1', tone: 'ok', bin: 'RAK-A04' },
  { id: 'RTS-086', lane: 'restock', awb: '#SC338810', title: 'Kaos Oversize Heavyweight', route: 'Gudang JKT · Repack OK', carrier: 'SiCepat', reason: 'Lulus QC · Restock Stok +2', value: 298000, age: 'Selesai', grade: 'Stok +2', tone: 'ok', bin: 'RAK-B11' },
  { id: 'RTS-085', lane: 'restock', awb: '#JN770408', title: 'Ekstrak Kunyit Curcuma', route: 'Gudang JKT · Exp 2028', carrier: 'JNE', reason: 'Lulus QC · Restock Stok +3', value: 360000, age: 'Selesai', grade: 'Stok +3', tone: 'ok', bin: 'RAK-C02' },
];

// Warehouse RMA Disposition Summary (sums to 800 MTD RTS packages!)
const RMA_DISPOSITION = [
  { grade: 'Grade A · Restock Layak Jual', units: 584, valueIdr: 184500000, binZone: 'RAK-A01..A12', tone: 'ok' },
  { grade: 'Grade B · Repackaging Kemasan', units: 112, valueIdr: 34200000, binZone: 'REPACK-R1..R4', tone: 'info' },
  { grade: 'Sengketa Klaim 3PL / Asuransi', units: 64, valueIdr: 28900000, binZone: 'KARANTINA-K1', tone: 'warn' },
  { grade: 'Grade C · Rusak / Write-Off DoA', units: 40, valueIdr: 12400000, binZone: 'SCRAP-S1', tone: 'bad' },
];

// Dispute Evidence Cases on P4 (8 rows)
const DISPUTE_CASES = [
  { id: 'RMA-114', city: 'Bandung', claim: 'Klaim Salah Ukuran (SKU-L)', carrier: 'J&T', packWt: '418 g', unboxWt: '416 g', videoMatch: '99,4%', amount: 245000, result: 'Sengketa Menang', tone: 'ok', selected: true },
  { id: 'RMA-115', city: 'Medan', claim: 'Paket Kosong / Isi Ditukar', carrier: 'JNE', packWt: '640 g', unboxWt: '110 g', videoMatch: 'Anomali', amount: 685000, result: 'Klaim Kurir 3PL', tone: 'warn' },
  { id: 'RMA-116', city: 'Jambi', claim: 'Botol Kaca Pecah Transit', carrier: 'Ninja', packWt: '512 g', unboxWt: '509 g', videoMatch: '97,8%', amount: 340000, result: 'Proses Mediator', tone: 'info' },
  { id: 'RMA-112', city: 'Makassar', claim: 'Item Kurang 1 Pcs Bundle', carrier: 'J&T', packWt: '385 g', unboxWt: '384 g', videoMatch: '99,1%', amount: 410000, result: 'Sengketa Menang', tone: 'ok' },
  { id: 'RMA-111', city: 'Surabaya', claim: 'Warna Tidak Sesuai Pesanan', carrier: 'SiCepat', packWt: '290 g', unboxWt: '290 g', videoMatch: '98,9%', amount: 275000, result: 'Sengketa Menang', tone: 'ok' },
  { id: 'RMA-109', city: 'Palembang', claim: 'Segel Rusak / Produk Bekas', carrier: 'J&T', packWt: '460 g', unboxWt: '458 g', videoMatch: '99,6%', amount: 520000, result: 'Sengketa Menang', tone: 'ok' },
  { id: 'RMA-107', city: 'Semarang', claim: 'Salah Varian Aroma', carrier: 'JNE', packWt: '310 g', unboxWt: '310 g', videoMatch: 'Mismatch', amount: 185000, result: 'Refund Pembeli', tone: 'bad' },
  { id: 'RMA-105', city: 'Pekanbaru', claim: 'Klaim Barang Tidak Sampai', carrier: 'Ninja', packWt: '720 g', unboxWt: 'POD GPS', videoMatch: '99,8%', amount: 615000, result: 'Sengketa Menang', tone: 'ok' },
];

// PSAK Double-Entry Settlement & RMA Journal (16 rows on P6 — strictly balanced!)
const LEDGER_ENTRIES = [
  { ref: 'JRN-2611-01', acct: '1102.01', name: 'Kas Bank BCA — Pencairan COD J&T', entity: 'Lavera & Grup', batch: 'STL-JNT-1122', debit: 1698400000, credit: 0, status: 'Rekon OK', tone: 'ok' },
  { ref: 'JRN-2611-02', acct: '1102.02', name: 'Kas Bank Mandiri — Pencairan COD JNE', entity: 'Lavera & Grup', batch: 'STL-JNE-1122', debit: 1181900000, credit: 0, status: 'Rekon OK', tone: 'ok' },
  { ref: 'JRN-2611-03', acct: '1102.03', name: 'Kas Bank BCA — Pencairan COD Ninja', entity: 'Apparel & Grup', batch: 'STL-NJV-1122', debit: 769200000, credit: 0, status: 'Rekon OK', tone: 'ok' },
  { ref: 'JRN-2611-04', acct: '1102.04', name: 'Kas Bank BNI — Pencairan COD SiCepat', entity: 'Herba & Grup', batch: 'STL-SCP-1122', debit: 494500000, credit: 0, status: 'Rekon OK', tone: 'ok' },
  { ref: 'JRN-2611-05', acct: '1135.10', name: 'Piutang Klaim & Sengketa 3PL (Ditahan)', entity: 'Konsolidasi', batch: 'DSP-3PL-P11', debit: 100000000, credit: 0, status: 'Tahan 3PL', tone: 'warn' },
  { ref: 'JRN-2611-06', acct: '5210.04', name: 'Beban Ongkir COD & Penalti Retur PP', entity: 'Konsolidasi', batch: 'FEE-RTS-P11', debit: 230800000, credit: 0, status: 'Terverifikasi', tone: 'ok' },
  { ref: 'JRN-2611-07', acct: '1120.01', name: 'Piutang COD Dalam Perjalanan (J&T)', entity: 'Konsolidasi', batch: 'CLG-JNT-P11', debit: 0, credit: 1842000000, status: 'Tutup Batch', tone: 'ok' },
  { ref: 'JRN-2611-08', acct: '1120.02', name: 'Piutang COD Dalam Perjalanan (JNE)', entity: 'Konsolidasi', batch: 'CLG-JNE-P11', debit: 0, credit: 1264200000, status: 'Tutup Batch', tone: 'ok' },
  { ref: 'JRN-2611-09', acct: '1120.03', name: 'Piutang COD Dalam Perjalanan (Ninja)', entity: 'Konsolidasi', batch: 'CLG-NJV-P11', debit: 0, credit: 836400000, status: 'Tutup Batch', tone: 'ok' },
  { ref: 'JRN-2611-10', acct: '1120.04', name: 'Piutang COD Dalam Perjalanan (SiCepat)', entity: 'Konsolidasi', batch: 'CLG-SCP-P11', debit: 0, credit: 532200000, status: 'Tutup Batch', tone: 'ok' },
  { ref: 'JRN-2611-11', acct: '4105.01', name: 'Retur Penjualan COD (PSAK 72 DPP)', entity: 'Konsolidasi', batch: 'NR-CTAX-114', debit: 260000000, credit: 0, status: 'CoreTax Siap', tone: 'info' },
  { ref: 'JRN-2611-12', acct: '2140.11', name: 'PPN Keluaran — Nota Retur 11% (DJP)', entity: 'Konsolidasi', batch: 'NR-CTAX-114', debit: 28600000, credit: 0, status: 'XML Valid', tone: 'ok' },
  { ref: 'JRN-2611-13', acct: '1120.99', name: 'Koreksi Piutang COD Batal / RTS Final', entity: 'Konsolidasi', batch: 'NR-CTAX-114', debit: 0, credit: 288600000, status: 'Terposting', tone: 'ok' },
  { ref: 'JRN-2611-14', acct: '1140.01', name: 'Persediaan Barang Dagang (Restock QC A)', entity: 'Gudang JKT', batch: 'RMA-RST-584', debit: 184500000, credit: 0, status: 'Stok +584', tone: 'ok' },
  { ref: 'JRN-2611-15', acct: '5190.02', name: 'Beban Kerusakan Kemasan & Write-Off C', entity: 'Gudang JKT', batch: 'DOA-WOF-040', debit: 12400000, credit: 0, status: 'Menunggu DoA', tone: 'warn' },
  { ref: 'JRN-2611-16', acct: '5101.00', name: 'Pemulihan HPP Retur & Cadangan RMA', entity: 'Konsolidasi', batch: 'RMA-COGS-11', debit: 0, credit: 196900000, status: 'Terposting', tone: 'ok' },
];

// DoA Maker-Checker-Approver Queue (16 rows on P7)
const DOA_QUEUE = [
  { id: 'DOA-2611-42', type: 'Write-Off & Klaim 3PL', entity: 'PT Lavera Beauty', desc: 'Batch 40 unit rusak transit + klaim J&T', amount: 38450000, maker: 'D. Santoso', checker: 'A. Wijaya', tier: 'L2 · VP Ops/Fin', sla: '02j 14m', status: 'Menunggu L2', tone: 'warn', selected: true },
  { id: 'DOA-2611-41', type: 'Nota Retur CoreTax', entity: 'PT Karya Apparel', desc: 'Posting 118 Nota Retur PPN P11', amount: 28600000, maker: 'S. Rahayu', checker: 'R. Hidayat', tier: 'L2 · Tax Mgr', sla: '04j 05m', status: 'Menunggu L2', tone: 'warn' },
  { id: 'DOA-2611-40', type: 'Blacklist Massal COD', entity: 'Konsolidasi Grup', desc: 'Blokir 24 nomor HP sindikat order fiktif', amount: 18920000, maker: 'F. Nugroho', checker: 'A. Wijaya', tier: 'L1 · Risk Mgr', sla: '01j 32m', status: 'Menunggu L1', tone: 'bad' },
  { id: 'DOA-2611-39', type: 'Klaim Paket Kosong', entity: 'PT Distribusi HomeTech', desc: 'Eskalasi ganti rugi JNE (#JN770512)', amount: 14250000, maker: 'D. Santoso', checker: 'M. Putri', tier: 'L1 · RMA Mgr', sla: '05j 48m', status: 'Menunggu L1', tone: 'warn' },
  { id: 'DOA-2611-38', type: 'Override Threshold', entity: 'PT Sehat Herba', desc: 'Turunkan batas blokir Sulawesi 75 -> 68', amount: 11400000, maker: 'F. Nugroho', checker: 'R. Kusuma', tier: 'L2 · VP Risk', sla: '03j 10m', status: 'Menunggu L2', tone: 'warn' },
  { id: 'DOA-2611-37', type: 'Restock Grade B', entity: 'PT Karya Apparel', desc: 'Re-packing 112 unit dus luar penyok', amount: 34200000, maker: 'B. Hartono', checker: 'A. Wijaya', tier: 'L2 · WH Head', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-36', type: 'Sengketa Video OK', entity: 'PT Lavera Beauty', desc: 'Penutupan RMA-114 & 18 klaim menang', amount: 7420000, maker: 'M. Putri', checker: 'A. Wijaya', tier: 'L1 · CS Lead', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-35', type: 'Refund Parsial COD', entity: 'PT Sehat Herba', desc: 'Pengembalian salah varian (#RMA-107)', amount: 1850000, maker: 'M. Putri', checker: 'S. Rahayu', tier: 'L1 · CS Lead', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-34', type: 'Whitelist Reseller', entity: 'PT Lavera Beauty', desc: 'Bebaskan limit COD 12 agen Makassar', amount: 22400000, maker: 'N. Lestari', checker: 'F. Nugroho', tier: 'L1 · Risk Mgr', sla: '06j 15m', status: 'Menunggu L1', tone: 'info' },
  { id: 'DOA-2611-33', type: 'Rekonsiliasi Selisih', entity: 'PT Distribusi HomeTech', desc: 'Selisih potongan ongkir Ninja batch 19', amount: 6840000, maker: 'S. Rahayu', checker: 'R. Hidayat', tier: 'L1 · Fin Mgr', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-32', type: 'Buka Blokir Manual', entity: 'PT Karya Apparel', desc: 'Permintaan sales lepas hold tanpa WA', amount: 4950000, maker: 'T. Prakoso', checker: 'F. Nugroho', tier: 'L1 · Risk Mgr', sla: 'Ditutup', status: 'Ditolak', tone: 'bad' },
  { id: 'DOA-2611-31', type: 'Settlement BI-FAST', entity: 'Konsolidasi Grup', desc: 'Penarikan dana COD SiCepat batch 1121', amount: 49450000, maker: 'S. Rahayu', checker: 'R. Hidayat', tier: 'L2 · Treasury', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-30', type: 'Klaim Asuransi 3PL', entity: 'PT Distribusi HomeTech', desc: 'Kerusakan 8 unit elektronik banjir hub', amount: 16800000, maker: 'D. Santoso', checker: 'B. Hartono', tier: 'L1 · RMA Mgr', sla: '02j 55m', status: 'Menunggu L1', tone: 'warn' },
  { id: 'DOA-2611-29', type: 'Hapus Stok Scrap', entity: 'PT Sehat Herba', desc: 'Pemusnahan 14 botol pecah berberita acara', amount: 3120000, maker: 'B. Hartono', checker: 'A. Wijaya', tier: 'L1 · WH Head', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-28', type: 'Template WA Baru', entity: 'Konsolidasi Grup', desc: 'Aktivasi template konfirmasi COD Tier-3', amount: 0, maker: 'N. Lestari', checker: 'F. Nugroho', tier: 'L1 · Risk Mgr', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
  { id: 'DOA-2611-27', type: 'Akses Unmask PII', entity: 'Audit Internal', desc: 'Dekripsi nomor HP 12 kasus fraud Sulsel', amount: 0, maker: 'H. Saputra', checker: 'R. Kusuma', tier: 'L2 · DPO/Legal', sla: 'Selesai', status: 'Disetujui', tone: 'ok' },
];

// WORM SHA-256 Audit Logs on P8 (14 rows)
const AUDIT_LOGS = [
  { seq: '#88421', ts: '14:28:12', actor: 'WA-Webhook-Bot', role: 'Sistem .NET 9', event: 'COD_WA_SENT', target: 'COD-512 · 0813****892', detail: 'Kirim konfirmasi COD Rp 485rb (Kab. Bone)', hash: '9f4a...7c21', tone: 'warn' },
  { seq: '#88420', ts: '14:27:49', actor: 'R. Kusuma', role: 'VP Risk & RMA', event: 'DOA_REVIEW_OPEN', target: 'DOA-2611-42', detail: 'Buka pemeriksaan write-off Rp 38.450.000', hash: '8b1d...4e90', tone: 'info' },
  { seq: '#88419', ts: '14:25:03', actor: 'WA-Webhook-Bot', role: 'Sistem .NET 9', event: 'COD_WA_APPROVED', target: 'COD-508 · 0819****334', detail: 'Balasan "YA" diterima · Auto-release packing', hash: '7c9e...1a44', tone: 'ok' },
  { seq: '#88418', ts: '14:21:18', actor: 'D. Santoso', role: 'QC Gudang JKT', event: 'RMA_RESTOCK_OK', target: 'RTS-088 · #JP882144', detail: 'Segel utuh · Lulus QC Grade A · Stok +1', hash: '6a2f...8b05', tone: 'ok' },
  { seq: '#88417', ts: '14:18:44', actor: 'M. Putri', role: 'CS Sengketa', event: 'DISPUTE_WON', target: 'RMA-114 · Bandung', detail: 'Video packing SKU-L cocok · Rp 245.000 menang', hash: '5d8c...2f71', tone: 'ok' },
  { seq: '#88416', ts: '14:14:09', actor: 'JNT-Webhook', role: '3PL Ingress', event: 'RTS_ARRIVED_WH', target: 'AWB #JP882219', detail: 'HMAC-SHA256 valid · 138 ms · Dock Retur B2', hash: '4e11...9c38', tone: 'info' },
  { seq: '#88415', ts: '14:10:55', actor: 'S. Rahayu', role: 'Tax & Finance', event: 'CORETAX_XML_GEN', target: 'NR-CTAX-114', detail: 'Bangun 118 Nota Retur PPN Rp 28.600.000', hash: '3b7a...6d12', tone: 'ok' },
  { seq: '#88414', ts: '14:06:22', actor: 'Risk-Engine-v4', role: 'Scoring API', event: 'COD_AUTO_BLOCK', target: 'COD-511 · 0852****441', detail: 'Skor 91 (3x RTS + Tanpa RT/RW) -> Blokir', hash: '2c40...5a89', tone: 'bad' },
  { seq: '#88413', ts: '14:01:47', actor: 'H. Saputra', role: 'DPO / Auditor', event: 'PII_UNMASK_LOG', target: 'Case-Sulsel-12', detail: 'Akses nomor penuh dgn tiket DOA-2611-27', hash: '1f93...3e64', tone: 'warn' },
  { seq: '#88412', ts: '13:56:31', actor: 'A. Wijaya', role: 'Spv QC & Risk', event: 'DOA_CHECKER_OK', target: 'DOA-2611-42', detail: 'Tanda tangan Checker · Teruskan ke VP L2', hash: '0a55...8f20', tone: 'ok' },
  { seq: '#88411', ts: '13:51:10', actor: 'F. Nugroho', role: 'Risk Analyst', event: 'RULE_SIM_RUN', target: 'Sim-Sulawesi-68', detail: 'Uji ambang skor 68 · Proyeksi RTS 5,1%', hash: 'f912...1b07', tone: 'info' },
  { seq: '#88410', ts: '13:45:02', actor: 'CCTV-Vault-JKT', role: 'Media Storage', event: 'VIDEO_HASH_SEAL', target: 'CAM04-261118-1422', detail: 'Kunci bukti packing WORM retensi 90 hari', hash: 'e844...7d93', tone: 'ok' },
  { seq: '#88409', ts: '13:39:19', actor: 'B. Hartono', role: 'WH Lead JKT', event: 'BIN_REPACK_POST', target: 'REPACK-R2 · 112u', detail: 'Pindah 112 unit Grade B ke jalur repack', hash: 'd731...4c51', tone: 'info' },
  { seq: '#88408', ts: '13:32:44', actor: 'JNE-Webhook', role: '3PL Ingress', event: 'COD_SETTLED_H3', target: 'STL-JNE-1122', detail: 'Batch pencairan Rp 1.181.900.000 terkonfirmasi', hash: 'c620...0a18', tone: 'ok' },
];

// ============================================================================
// DERIVED TOTALS & PROGRAMMATIC MATH VERIFICATION
// ============================================================================
const TOTAL_ORDERS = ENTITIES.reduce((a, e) => a + e.ordersCod, 0);
const TOTAL_RTS = ENTITIES.reduce((a, e) => a + e.rtsCount, 0);
const RTS_RATE_PCT = (TOTAL_RTS / TOTAL_ORDERS) * 100;
const TOTAL_WA_SENT = ENTITIES.reduce((a, e) => a + e.waSent, 0);
const TOTAL_WA_CONF = ENTITIES.reduce((a, e) => a + e.waConfirmed, 0);
const WA_CONF_PCT = (TOTAL_WA_CONF / TOTAL_WA_SENT) * 100;
const TOTAL_SAVED_WEEK = ENTITIES.reduce((a, e) => a + e.ongkirSavedWeek, 0);
const TOTAL_SAVED_MTD = ENTITIES.reduce((a, e) => a + e.ongkirSavedMtd, 0);
const TOTAL_COD_GROSS = ENTITIES.reduce((a, e) => a + e.codGrossIdr, 0);
const TOTAL_HELD_TODAY = COD_ORDERS.filter((o) => o.held).length;
const TOTAL_QUEUE_VALUE = COD_ORDERS.reduce((a, o) => a + o.value, 0);
const TOTAL_QUEUE_ONGKIR = COD_ORDERS.reduce((a, o) => a + o.ongkirPp, 0);
const TOTAL_SETTLED = CARRIERS.reduce((a, c) => a + c.settled, 0);
const TOTAL_DISPUTE_HOLD = CARRIERS.reduce((a, c) => a + c.disputeHold, 0);
const TOTAL_RTS_FEE = CARRIERS.reduce((a, c) => a + c.rtsFee, 0);
const TOTAL_DEBIT = LEDGER_ENTRIES.reduce((a, l) => a + l.debit, 0);
const TOTAL_CREDIT = LEDGER_ENTRIES.reduce((a, l) => a + l.credit, 0);
const TOTAL_RMA_UNITS = RMA_DISPOSITION.reduce((a, d) => a + d.units, 0);
const TOTAL_RMA_VALUE = RMA_DISPOSITION.reduce((a, d) => a + d.valueIdr, 0);
const TOTAL_DOA_EXPOSURE = DOA_QUEUE.reduce((a, d) => a + d.amount, 0);
const TOTAL_DOA_PENDING = DOA_QUEUE.filter((d) => d.status.startsWith('Menunggu')).length;

export function verifyMath() {
  if (TOTAL_ORDERS !== 12500) throw new Error(`TOTAL_ORDERS=${TOTAL_ORDERS}`);
  if (TOTAL_RTS !== 800) throw new Error(`TOTAL_RTS=${TOTAL_RTS}`);
  if (Math.abs(RTS_RATE_PCT - 6.4) > 0.001) throw new Error(`RTS_RATE_PCT=${RTS_RATE_PCT}`);
  if (Math.abs(WA_CONF_PCT - 82.0) > 0.001) throw new Error(`WA_CONF_PCT=${WA_CONF_PCT}`);
  if (TOTAL_SAVED_WEEK !== 11400000) throw new Error(`TOTAL_SAVED_WEEK=${TOTAL_SAVED_WEEK}`);
  if (TOTAL_HELD_TODAY !== 14) throw new Error(`TOTAL_HELD_TODAY=${TOTAL_HELD_TODAY}`);

  const cOrders = CARRIERS.reduce((a, c) => a + c.orders, 0);
  const cRts = CARRIERS.reduce((a, c) => a + c.rts, 0);
  const cGross = CARRIERS.reduce((a, c) => a + c.codGross, 0);
  if (cOrders !== TOTAL_ORDERS) throw new Error(`carrier orders ${cOrders} != ${TOTAL_ORDERS}`);
  if (cRts !== TOTAL_RTS) throw new Error(`carrier rts ${cRts} != ${TOTAL_RTS}`);
  if (cGross !== TOTAL_COD_GROSS) throw new Error(`carrier gross ${cGross} != ${TOTAL_COD_GROSS}`);
  if (TOTAL_SETTLED + TOTAL_DISPUTE_HOLD + TOTAL_RTS_FEE !== TOTAL_COD_GROSS) {
    throw new Error('Carrier settlement breakdown != TOTAL_COD_GROSS');
  }

  const rOrders = CORRIDORS.reduce((a, r) => a + r.orders, 0);
  const rRts = CORRIDORS.reduce((a, r) => a + r.rts, 0);
  if (rOrders !== TOTAL_ORDERS) throw new Error(`corridor orders ${rOrders} != ${TOTAL_ORDERS}`);
  if (rRts !== TOTAL_RTS) throw new Error(`corridor rts ${rRts} != ${TOTAL_RTS}`);

  const score512 = RISK_RULES.filter((r) => r.hit512).reduce((a, r) => a + r.weight, 0);
  if (score512 !== 84) throw new Error(`COD-512 rule sum=${score512} != 84`);

  if (TOTAL_RMA_UNITS !== TOTAL_RTS) throw new Error(`RMA disposition units ${TOTAL_RMA_UNITS} != ${TOTAL_RTS}`);
  if (TOTAL_DEBIT !== TOTAL_CREDIT) throw new Error(`Unbalanced ledger D=${TOTAL_DEBIT} C=${TOTAL_CREDIT}`);
  if (RMA_CARDS.length !== 15) throw new Error(`RMA_CARDS=${RMA_CARDS.length}`);
}

// ============================================================================
// SAP FIORI HORIZON / WORKDAY LIGHT-ENTERPRISE SHELL (BRAND HUE #9a5b00)
// ============================================================================
const EXTRA_CSS = `
  /* Custom SAP S/4HANA Fiori Horizon + ServiceNow Enterprise Shell */
  .rg-topbar {
    height: 40px;
    background: #ffffff;
    border-top: 3px solid var(--e-accent);
    border-bottom: 1px solid var(--e-border-strong);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .rg-top-left, .rg-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .rg-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: -0.015em;
    color: #1c1917;
    white-space: nowrap;
  }
  .rg-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: var(--e-accent);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .rg-vdiv {
    width: 1px;
    height: 18px;
    background: var(--e-border-strong);
    flex-shrink: 0;
  }
  .rg-picker {
    height: 25px;
    padding: 0 8px;
    border-radius: 3px;
    background: var(--e-surface-2);
    border: 1px solid var(--e-border-strong);
    color: #1c1917;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .rg-picker-accent {
    background: var(--e-accent-soft);
    border-color: #d9a45b;
    color: var(--e-accent-ink);
  }
  .rg-search {
    height: 25px;
    width: 245px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f5f3ef;
    border: 1px solid var(--e-border-strong);
    color: var(--e-muted);
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .rg-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid var(--e-border-strong);
    color: var(--e-text-2);
  }
  .rg-rts-pill {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #047857;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .rg-user {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid var(--e-border-strong);
    white-space: nowrap;
  }
  .rg-avatar {
    width: 23px;
    height: 23px;
    border-radius: 3px;
    background: #44403c;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Fiori Module Tabstrip */
  .rg-modbar {
    height: 34px;
    background: #f6f4ef;
    border-bottom: 1px solid var(--e-border-strong);
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .rg-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
    min-width: 0;
  }
  .rg-tab {
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.6px;
    font-weight: 600;
    color: #57534e;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .rg-tab.is-active {
    color: var(--e-accent-ink);
    background: #ffffff;
    border-bottom-color: var(--e-accent);
    border-left: 1px solid var(--e-border);
    border-right: 1px solid var(--e-border);
    font-weight: 700;
  }
  .rg-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #e7e2d9;
    color: #44403c;
  }
  .rg-tab.is-active .rg-tab-cnt {
    background: var(--e-accent);
    color: #ffffff;
  }
  .rg-tab-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .rg-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* Workspace Body */
  .rg-workspace {
    flex: 1;
    min-height: 0;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* Override table tones for warm Fiori enterprise look */
  table.e-table th {
    background: #f5f2ec;
    color: #44403c;
    border-bottom: 1px solid var(--e-border-strong);
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbf9;
  }
  table.e-table td {
    border-bottom: 1px solid #ece7df;
  }
  table.e-table tfoot td {
    background: #f3efe8;
    border-top: 1px solid var(--e-border-strong);
    color: #1c1917;
  }
  .e-badge-accent {
    background: var(--e-accent-soft);
    color: var(--e-accent-ink);
    border-color: #e4ba82;
  }
  .e-statusbar {
    background: #f0ece4;
    border-top: 1px solid var(--e-border-strong);
    color: #44403c;
  }

  /* Kanban Board Primitives */
  .kb-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    min-height: 0;
    flex: 1;
  }
  .kb-col {
    background: #f6f4ef;
    border: 1px solid var(--e-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .kb-col-head {
    height: 30px;
    padding: 0 9px;
    background: #eeeae1;
    border-bottom: 1px solid var(--e-border-strong);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10.5px;
    font-weight: 700;
    color: #1c1917;
    flex-shrink: 0;
  }
  .kb-col-body {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .kb-card {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-left: 3px solid var(--e-accent);
    border-radius: 3px;
    padding: 7px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .kb-card.ok { border-left-color: #047857; }
  .kb-card.warn { border-left-color: #b45309; }
  .kb-card.bad { border-left-color: #be123c; }
  .kb-card.info { border-left-color: #0369a1; }

  /* Stepper Primitives */
  .doa-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .doa-step {
    border: 1px solid var(--e-border);
    border-radius: 4px;
    padding: 8px 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .doa-step.done { border-top: 3px solid #047857; background: #fafdfb; }
  .doa-step.active { border-top: 3px solid var(--e-accent); background: #fffcf7; border-color: #d9a45b; }
  .doa-step.wait { border-top: 3px solid #a8a29e; background: #faf8f5; }

  /* Code / XML / WA Snippet Box */
  .rg-code {
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.42;
    background: #1c1917;
    color: #e7e5e4;
    padding: 8px 10px;
    border-radius: 3px;
    border: 1px solid #44403c;
    white-space: pre-wrap;
    word-break: break-word;
    overflow: hidden;
  }
  .rg-wa-box {
    background: #f4f9f5;
    border: 1px solid #a7f3d0;
    border-left: 3px solid #047857;
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 10.6px;
    color: #1c1917;
  }
  .rg-kv {
    display: grid;
    grid-template-columns: 118px 1fr;
    gap: 4px 8px;
    font-size: 10.5px;
    align-items: center;
  }
  .rg-kv-k {
    color: var(--e-muted);
    font-weight: 600;
  }
  .rg-kv-v {
    color: var(--e-text);
    font-weight: 600;
  }
`;

const TABS = [
  { slug: 'p1', label: 'Kokpit Eksekutif', icon: 'activity' },
  { slug: 'p2', label: 'Triase COD', icon: 'shield', cnt: String(TOTAL_HELD_TODAY), warn: true },
  { slug: 'p3', label: 'Papan RMA', icon: 'layers', cnt: String(RMA_CARDS.length) },
  { slug: 'p4', label: 'Forensik Video', icon: 'eye', cnt: '8' },
  { slug: 'p5', label: 'Aturan & Simulasi', icon: 'sliders' },
  { slug: 'p6', label: 'Rekon & CoreTax', icon: 'fileText' },
  { slug: 'p7', label: 'Persetujuan DoA', icon: 'checkCircle', cnt: String(TOTAL_DOA_PENDING), warn: true },
  { slug: 'p8', label: 'UU PDP & Webhook', icon: 'lock' },
];

function renderShell({ activeSlug, title, actionsHtml = '', contentHtml, footerRight = '' }) {
  const topbar = `<header class="rg-topbar">
    <div class="rg-top-left">
      <div class="rg-brand">
        <span class="rg-mark">RG</span>
        <span>ReturnGuard ID</span>
      </div>
      <div class="rg-vdiv"></div>
      <div class="rg-picker">
        ${ic('layers', 12, '#9a5b00')}
        <span>Entitas: PT Nusantara D2C Group (4 Brand)</span>
        ${ic('chevronDown', 11, '#6b645c')}
      </div>
      <div class="rg-picker rg-picker-accent">
        ${ic('clock', 11, '#6b3d00')}
        <span class="mono" style="font-size:10px;">FY2026 · P11 (Nov 2026)</span>
      </div>
      <div class="rg-search">
        <span style="display:inline-flex;align-items:center;gap:5px;" class="trunc">
          ${ic('search', 11, '#6b645c')}
          <span class="trunc">Cari Order #9921, AWB #JP882144, RMA...</span>
        </span>
        <span class="rg-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="rg-top-right">
      <div class="rg-rts-pill">
        <span class="dot dot-ok"></span>
        <span>RASIO RTS: 6,4% (TURUN DARI 19%)</span>
      </div>
      <div class="rg-user">
        <span class="rg-avatar">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#1c1917;">R. Kusuma</div>
          <div style="font-size:9px;color:#6b645c;">VP Risk &amp; Reverse Logistics</div>
        </div>
      </div>
    </div>
  </header>`;

  const modbar = `<nav class="rg-modbar">
    <div class="rg-tabs">
      ${TABS.map((t) => {
        const active = t.slug === activeSlug;
        return `<div class="rg-tab ${active ? 'is-active' : ''}">
          ${ic(t.icon, 12, active ? '#9a5b00' : '#6b645c')}
          <span>${esc(t.label)}</span>
          ${t.cnt ? `<span class="rg-tab-cnt ${t.warn && !active ? 'warn' : ''}">${esc(t.cnt)}</span>` : ''}
        </div>`;
      }).join('')}
    </div>
    <div class="rg-actions">${actionsHtml}</div>
  </nav>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><strong>ReturnGuard · Triase COD &amp; Papan RMA</strong>`,
      `<span>Stack: React · .NET 9 · PostgreSQL · WA Business API</span>`,
      `<span>3PL Live: J&amp;T · JNE · Ninja · SiCepat</span>`,
    ],
    rightItems: [
      footerRight || `<span>WORM SHA-256 Terverifikasi · UU PDP PP 33/2026</span>`,
      `<span>Cut-off: 22 Nov 2026 14:30 WIB</span>`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `${meta.name} — ${title}`,
    accent: '#9a5b00',
    accentSoft: '#fdf3e3',
    accentInk: '#6b3d00',
    bg: '#f4f2ee',
    surface: '#ffffff',
    surface2: '#faf8f4',
    border: '#ddd6cb',
    borderStrong: '#c5bbb0',
    text: '#1c1917',
    text2: '#44403c',
    muted: '#6b645c',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}${modbar}<main class="rg-workspace">${contentHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: KOKPIT EKSEKUTIF RISIKO COD & RASIO RTS
// ============================================================================
function renderPage1() {
  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Rasio RTS COD (P11)</span>${badge('Target < 8%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtPct(RTS_RATE_PCT)}</span>
        ${svgSparkline({ points: [19.0, 16.4, 13.8, 11.2, 9.4, 8.1, 7.2, 6.4], color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>Turun dari 19,0% pra-ReturnGuard</span><span class="mono">${fmtNum(TOTAL_RTS)}/${fmtNum(TOTAL_ORDERS)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Ditahan Pra-Kirim (Hari Ini)</span>${badge('Triase Aktif', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${TOTAL_HELD_TODAY} COD</span>
        ${svgSparkline({ points: [28, 24, 21, 19, 17, 16, 15, 14], color: '#9a5b00' })}
      </div>
      <div class="e-kpi-foot"><span>10 Tahan/WA · 4 Blokir Auto</span><span class="mono">MTD 860 COD</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Konfirmasi WA 2-Arah</span>${badge('Meta API OK', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtPct(WA_CONF_PCT, 0)}</span>
        ${svgSparkline({ points: [68, 71, 74, 76, 79, 80, 81, 82], color: '#0369a1' })}
      </div>
      <div class="e-kpi-foot"><span>Balas "YA" terverifikasi</span><span class="mono">${fmtNum(TOTAL_WA_CONF)}/${fmtNum(TOTAL_WA_SENT)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Hemat Ongkir PP (Minggu Ini)</span>${badge('+14,2% WoW', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 11,4 jt</span>
        ${svgSparkline({ points: [6.2, 7.1, 8.0, 8.9, 9.5, 10.1, 10.8, 11.4], color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>Akumulasi MTD P11</span><span class="mono">${fmtIdr(TOTAL_SAVED_MTD)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Nilai COD Bruto (P11)</span>${badge('4 Entitas', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 4,47 M</span>
        ${svgSparkline({ points: [3.6, 3.8, 3.9, 4.0, 4.1, 4.2, 4.35, 4.47], color: '#9a5b00' })}
      </div>
      <div class="e-kpi-foot"><span>Cair ke Bank: 92,6%</span><span class="mono">${fmtNum(TOTAL_ORDERS)} order</span></div>
    </div>
  </section>`;

  const trendChart = svgMultiLineChart({
    width: 820,
    height: 280,
    xLabels: ['09 Nov', '10 Nov', '11 Nov', '12 Nov', '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
    yMin: 0,
    yMax: 22,
    yTicks: 5,
    yFormat: (v) => `${v.toFixed(0)}%`,
    threshold: { value: 8.0, label: 'SLA RTS 8,0%', color: '#be123c' },
    series: [
      { label: 'Rasio RTS Aktual (%)', color: '#9a5b00', area: true, dots: true, values: [12.4, 11.8, 10.9, 10.2, 9.6, 9.1, 8.4, 7.9, 7.5, 7.2, 6.9, 6.7, 6.5, 6.4] },
      { label: 'RTS Luar Jawa (%)', color: '#b45309', dashed: true, values: [18.8, 18.1, 17.2, 16.0, 15.1, 14.3, 13.5, 12.8, 12.1, 11.6, 11.2, 10.9, 10.5, 10.2] },
      { label: 'Baseline Pra-Filter (%)', color: '#a8a29e', dashed: true, values: [19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0, 19.0] },
    ],
    annotations: [
      { index: 4, seriesIdx: 0, label: 'WA 2-Arah Aktif', color: '#047857', dy: -32 },
      { index: 12, seriesIdx: 0, label: 'Aktual P11: 6,4% (-12,6 pp)', color: '#9a5b00', dy: 18 },
    ],
  });

  // Custom Vector Schematic Map of Indonesia COD Risk Corridors
  const mapSvg = `<svg viewBox="0 0 540 272" width="100%" height="272" style="display:block;background:#faf8f4;border-radius:3px;border:1px solid #e7e1d7;">
    <defs>
      <pattern id="rgGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ece6dc" stroke-width="0.7" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="540" height="272" fill="url(#rgGrid)" />
    <!-- Stylized Archipelago Silhouettes (Sumatera, Jawa, Kalimantan, Sulawesi, Bali-Nusra, Papua) -->
    <path d="M44,68 L76,76 L106,106 L132,136 L136,154 L118,158 L92,132 L66,104 L42,84 Z" fill="#e7e0d4" stroke="#bfb5a4" stroke-width="1" />
    <path d="M142,172 L212,180 L272,186 L278,196 L208,194 L144,184 Z" fill="#e7e0d4" stroke="#bfb5a4" stroke-width="1" />
    <path d="M214,86 L264,82 L288,110 L274,146 L224,144 L208,116 Z" fill="#e7e0d4" stroke="#bfb5a4" stroke-width="1" />
    <path d="M306,100 L338,94 L350,114 L334,126 L342,154 L318,158 L314,132 L302,122 Z" fill="#fde6d2" stroke="#c2410c" stroke-width="1.2" />
    <path d="M288,188 L368,190 L388,198 L286,198 Z" fill="#e7e0d4" stroke="#bfb5a4" stroke-width="1" />
    <path d="M402,132 L478,140 L516,164 L498,188 L434,174 L406,156 Z" fill="#e7e0d4" stroke="#bfb5a4" stroke-width="1" />
    <!-- Hub-to-Corridor Shipping Arcs from JKT -->
    ${CORRIDORS.filter((c) => c.id !== 'JKT')
      .map((c) => {
        const stroke = c.tone === 'bad' ? '#be123c' : c.tone === 'warn' ? '#b45309' : '#047857';
        const cy = c.y + 10;
        const mx = (164 + c.x) / 2;
        const my = Math.min(176, cy) - 24;
        return `<path d="M 164 176 Q ${mx.toFixed(0)} ${my.toFixed(0)} ${c.x} ${cy}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-dasharray="3,2.5" opacity="0.85" />`;
      })
      .join('')}
    <!-- Corridor Nodes -->
    ${CORRIDORS.map((c) => {
      const rate = (c.rts / c.orders) * 100;
      const fill = c.tone === 'bad' ? '#be123c' : c.tone === 'warn' ? '#b45309' : '#047857';
      const r = c.id === 'JKT' ? 7 : 5.5;
      const cy = c.y + 10;
      const lx = c.id === 'SUM' ? c.x - 16 : c.id === 'SUL' ? c.x + 12 : c.id === 'TIM' ? c.x - 18 : c.x + 10;
      const ly = c.id === 'JWA' ? cy + 18 : c.id === 'JKT' ? cy + 20 : cy - 10;
      return `<g>
        <circle cx="${c.x}" cy="${cy}" r="${r + 4}" fill="${fill}" fill-opacity="0.16" />
        <circle cx="${c.x}" cy="${cy}" r="${r}" fill="${fill}" stroke="#ffffff" stroke-width="1.5" />
        <rect x="${lx - 2}" y="${ly - 10}" width="82" height="22" rx="2" fill="#ffffff" stroke="${fill}" stroke-width="0.9" />
        <text x="${lx + 3}" y="${ly - 1}" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#1c1917">${esc(c.id)} · ${fmtPct(rate)}</text>
        <text x="${lx + 3}" y="${ly + 9}" font-size="7.6" font-family="ui-monospace,Consolas,monospace" fill="#57534e">${fmtNum(c.rts)}/${fmtNum(c.orders)} RTS</text>
      </g>`;
    }).join('')}
    <!-- Legend -->
    <rect x="10" y="10" width="228" height="22" rx="2" fill="#ffffff" stroke="#ddd6cb" />
    <circle cx="22" cy="21" r="3.5" fill="#047857" /><text x="30" y="24" font-size="8.5" fill="#44403c">&lt;6% Aman</text>
    <circle cx="90" cy="21" r="3.5" fill="#b45309" /><text x="98" y="24" font-size="8.5" fill="#44403c">6–10% Pantau</text>
    <circle cx="170" cy="21" r="3.5" fill="#be123c" /><text x="178" y="24" font-size="8.5" fill="#44403c">&gt;10% Kritis</text>
    <rect x="10" y="240" width="520" height="22" rx="2" fill="#ffffff" stroke="#ddd6cb" />
    <text x="18" y="254" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">HUB: GUDANG JKT-CAKUNG · HOTSPOT: KAB. BONE (12,3%) · TOTAL 6 KORIDOR: 800 RTS / 12.500 ORDER</text>
  </svg>`;

  const entityTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:185px;">Entitas Brand D2C</th>
        <th class="num" style="width:74px;">Order COD</th>
        <th class="num" style="width:62px;">RTS</th>
        <th class="num" style="width:62px;">Rasio</th>
        <th class="num" style="width:74px;">WA "YA"</th>
        <th class="num" style="width:94px;">Hemat Minggu</th>
        <th class="num" style="width:100px;">Hemat MTD</th>
        <th class="num" style="width:118px;">COD Bruto (P11)</th>
      </tr>
    </thead>
    <tbody>
      ${ENTITIES.map((e) => {
        const rate = (e.rtsCount / e.ordersCod) * 100;
        const waR = (e.waConfirmed / e.waSent) * 100;
        return `<tr>
          <td><strong>${esc(e.name)}</strong></td>
          <td class="num mono">${fmtNum(e.ordersCod)}</td>
          <td class="num mono">${fmtNum(e.rtsCount)}</td>
          <td class="num mono">${badge(fmtPct(rate), rate >= 7 ? 'warn' : 'ok')}</td>
          <td class="num mono">${fmtPct(waR, 1)}</td>
          <td class="num mono">${fmtIdr(e.ongkirSavedWeek)}</td>
          <td class="num mono" style="color:#047857;font-weight:700;">${fmtIdr(e.ongkirSavedMtd)}</td>
          <td class="num mono">${fmtIdr(e.codGrossIdr)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>TOTAL KONSOLIDASI (4 ENTITAS)</td>
        <td class="num mono">${fmtNum(TOTAL_ORDERS)}</td>
        <td class="num mono">${fmtNum(TOTAL_RTS)}</td>
        <td class="num mono">${fmtPct(RTS_RATE_PCT)}</td>
        <td class="num mono">${fmtPct(WA_CONF_PCT, 1)}</td>
        <td class="num mono">${fmtIdr(TOTAL_SAVED_WEEK)}</td>
        <td class="num mono">${fmtIdr(TOTAL_SAVED_MTD)}</td>
        <td class="num mono">${fmtIdr(TOTAL_COD_GROSS)}</td>
      </tr>
    </tfoot>
  </table>`;

  const carrierTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:118px;">Kurir 3PL</th>
        <th class="num" style="width:66px;">Order</th>
        <th class="num" style="width:54px;">RTS</th>
        <th style="width:110px;">Tingkat RTS</th>
        <th class="num" style="width:106px;">Ongkir RTS PP</th>
        <th style="width:64px;">SLA Cair</th>
      </tr>
    </thead>
    <tbody>
      ${CARRIERS.map((c) => {
        const r = (c.rts / c.orders) * 100;
        return `<tr>
          <td><strong>${esc(c.name)}</strong></td>
          <td class="num mono">${fmtNum(c.orders)}</td>
          <td class="num mono">${fmtNum(c.rts)}</td>
          <td>${renderCapacityBar(r * 10, { warnAt: 65, critAt: 80, showLabel: false })}<span class="mono" style="font-size:9.5px;color:#44403c;">${fmtPct(r)}</span></td>
          <td class="num mono">${fmtIdr(c.rtsFee)}</td>
          <td>${badge(c.slaDays, 'neutral')}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>TOTAL 3PL</td>
        <td class="num mono">${fmtNum(TOTAL_ORDERS)}</td>
        <td class="num mono">${fmtNum(TOTAL_RTS)}</td>
        <td class="mono">${fmtPct(RTS_RATE_PCT)}</td>
        <td class="num mono">${fmtIdr(TOTAL_RTS_FEE)}</td>
        <td>H+2,3</td>
      </tr>
    </tfoot>
  </table>`;

  const contentHtml = `${kpiStrip}
    <div style="display:grid;grid-template-columns:1.42fr 1fr;gap:9px;height:330px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#9a5b00')}<span>Tren Rasio RTS COD 14 Hari vs SLA Korporat (8,0%)</span></div>
          <span class="e-panel-sub">Baseline 19,0% -&gt; Aktual 6,4% · Penurunan -12,6 pp</span>
        </div>
        <div class="e-panel-body" style="padding:7px 10px;">${trendChart}</div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#9a5b00')}<span>Peta Koridor Risiko COD Nusantara (6 Zona)</span></div>
          ${badge('Hotspot: Sulawesi 12,3%', 'bad')}
        </div>
        <div class="e-panel-body" style="padding:7px 9px;">${mapSvg}</div>
      </section>
    </div>
    <div style="display:grid;grid-template-columns:1.38fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#9a5b00')}<span>Ringkasan Performa COD &amp; Penghematan Ongkir per Entitas Brand</span></div>
          <span class="e-panel-sub">Konsolidasi P11 (01–22 Nov 2026)</span>
        </div>
        <div class="e-panel-body-flush">${entityTable}
          <div style="padding:10px 11px;border-top:1px solid #ddd6cb;background:#faf8f4;display:flex;flex-direction:column;gap:8px;flex:1;justify-content:space-between;">
            <div style="font-size:9.8px;font-weight:700;color:#44403c;">AKAR PENYEBAB PAKET RTS (800 KASUS P11) &amp; DAMPAK FILTER OTOMATIS</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
              <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">ALAMAT TANPA RT/RW</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#be123c;">312 pkt <span style="font-size:9.5px;color:#57534e;">(39,0%)</span></div>
                <div style="font-size:9.2px;color:#57534e;">1.842 anomali terdeteksi</div>
              </div>
              <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">PENERIMA TOLAK COD</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#b45309;">248 pkt <span style="font-size:9.5px;color:#57534e;">(31,0%)</span></div>
                <div style="font-size:9.2px;color:#57534e;">Turun -68% pasca WA "YA"</div>
              </div>
              <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">GAGAL ANTAR 3X (CR04)</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#9a5b00;">160 pkt <span style="font-size:9.5px;color:#57534e;">(20,0%)</span></div>
                <div style="font-size:9.2px;color:#57534e;">Dominan luar Jawa Tier-3</div>
              </div>
              <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">RESTOCK GRADE A</div>
                <div class="mono" style="font-size:13.5px;font-weight:800;color:#047857;">584 pkt <span style="font-size:9.5px;color:#57534e;">(73,0%)</span></div>
                <div style="font-size:9.2px;color:#57534e;">Stok pulih Rp 184,5 jt</div>
              </div>
            </div>
            <div style="font-size:9.8px;color:#57534e;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e7e1d7;padding-top:6px;">
              <span><strong>Alasan lain (80 pkt · 10,0%):</strong> Kemasan rusak transit (40) · Pembeli pindah/tidak aktif (40).</span>
              <span class="mono" style="font-weight:700;color:#047857;">Total 312+248+160+80 = 800 RTS</span>
            </div>
          </div>
        </div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#9a5b00')}<span>Perbandingan Kurir 3PL &amp; 4 Kasus Prioritas Hari Ini</span></div>
          <span class="e-panel-sub">Webhook Real-Time Aktif</span>
        </div>
        <div class="e-panel-body-flush">${carrierTable}
          <div style="padding:8px 10px;border-top:1px solid #ddd6cb;background:#faf8f4;display:flex;flex-direction:column;gap:5px;flex:1;justify-content:space-between;">
            <div style="font-size:9.6px;font-weight:700;color:#44403c;">SOROTAN OPERASIONAL LIVE (COD · RMA · RESTOCK)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="background:#ffffff;border:1px solid #fecdd3;border-left:3px solid #be123c;border-radius:3px;padding:5px 7px;">
                <div style="display:flex;justify-content:space-between;"><strong class="mono" style="font-size:9.6px;">COD-512 · #9921</strong>${badge('Risiko 84', 'bad')}</div>
                <div style="font-size:9.6px;color:#44403c;">Kab. Bone (Rp 485rb) · Tanpa RT/RW</div>
              </div>
              <div style="background:#ffffff;border:1px solid #a7f3d0;border-left:3px solid #047857;border-radius:3px;padding:5px 7px;">
                <div style="display:flex;justify-content:space-between;"><strong class="mono" style="font-size:9.6px;">COD-508 · #9914</strong>${badge('Risiko 22', 'ok')}</div>
                <div style="font-size:9.6px;color:#44403c;">Bekasi Utara (Rp 290rb) · Balas "YA"</div>
              </div>
              <div style="background:#ffffff;border:1px solid #a7f3d0;border-left:3px solid #047857;border-radius:3px;padding:5px 7px;">
                <div style="display:flex;justify-content:space-between;"><strong class="mono" style="font-size:9.6px;">RMA-114 · Bandung</strong>${badge('Video OK', 'ok')}</div>
                <div style="font-size:9.6px;color:#44403c;">Salah Ukuran (Rp 245rb) · Menang</div>
              </div>
              <div style="background:#ffffff;border:1px solid #a7f3d0;border-left:3px solid #047857;border-radius:3px;padding:5px 7px;">
                <div style="display:flex;justify-content:space-between;"><strong class="mono" style="font-size:9.6px;">RTS-088 · #JP882144</strong>${badge('Stok +1', 'ok')}</div>
                <div style="font-size:9.6px;color:#44403c;">Gudang JKT · Segel utuh · Lulus QC</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>`;

  return renderShell({
    activeSlug: 'p1',
    title: meta.pages[0].title,
    actionsHtml: `<span class="e-btn">${ic('download', 11)}Ekspor Laporan P11</span><span class="e-btn e-btn-primary">${ic('zap', 11)}Kirim Konfirmasi WA</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: TRIASE ORDER COD & INSPEKTOR WA BUSINESS (18-ROW GRID + INSPECTOR)
// ============================================================================
function renderPage2() {
  const toolbar = `<div class="e-panel" style="flex-shrink:0;">
    <div style="height:36px;padding:0 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#faf8f4;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-btn e-btn-primary">${ic('filter', 11)}Ditahan Pra-Kirim (${TOTAL_HELD_TODAY})</span>
        <span class="e-btn">Semua Antrean (18)</span>
        <span class="e-btn">Skor &gt;= 70 (11)</span>
        <span class="e-btn">Tanpa RT/RW (10)</span>
        <span class="e-btn">Kurir: Semua 3PL ${ic('chevronDown', 10)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-btn e-btn-danger">Blokir Massal (4)</span>
        <span class="e-btn">Restock Lulus QC</span>
        <span class="e-btn e-btn-primary">${ic('zap', 11)}Kirim Konfirmasi WA</span>
      </div>
    </div>
  </div>`;

  const rowsHtml = COD_ORDERS.map((o) => {
    const cls = o.selected ? 'is-selected' : o.score >= 85 ? 'is-bad' : o.score >= 70 ? 'is-warn' : '';
    const scoreTone = o.score >= 75 ? 'bad' : o.score >= 60 ? 'warn' : 'ok';
    return `<tr class="${cls}">
      <td style="text-align:center;padding:4.5px 2px;overflow:visible;text-overflow:clip;"><span class="cb ${o.selected ? 'checked' : ''}">${o.selected ? ic('check', 9, '#fff') : ''}</span></td>
      <td class="mono" style="font-weight:700;">${esc(o.code)}</td>
      <td class="mono">${esc(o.orderNo)}</td>
      <td>${esc(o.entity)}</td>
      <td>${esc(o.dest)}</td>
      <td class="mono" style="font-size:10px;">${esc(o.phone)}</td>
      <td>${esc(o.carrier)}</td>
      <td>${o.rtrw === 'Tidak Ada' ? `<span style="color:#be123c;font-weight:700;">${esc(o.rtrw)}</span>` : esc(o.rtrw)}</td>
      <td class="num mono">${o.prevRts > 0 ? `<strong style="color:#be123c;">${o.prevRts}x</strong>` : '0x'}</td>
      <td class="num mono">${fmtIdr(o.value)}</td>
      <td class="num mono" style="padding:4.5px 4px;overflow:visible;text-overflow:clip;">${badge('Risiko ' + o.score, scoreTone)}</td>
      <td>${esc(o.waState)}</td>
      <td>${badge(o.status, o.tone)}</td>
    </tr>`;
  }).join('');

  const tablePanel = `<section class="e-panel" style="min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Antrean Triase COD Pra-Kirim — Batch Sesi Siang (18 Order · 14 Ditahan)</span></div>
      <span class="e-panel-sub">Urut: Skor Risiko Tertinggi · Cut-off Pickup 16:00 WIB</span>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:24px;text-align:center;padding:5px 2px;"></th>
            <th style="width:62px;">Kode</th>
            <th style="width:50px;">Order</th>
            <th style="width:60px;">Entitas</th>
            <th style="width:128px;">Tujuan Pengiriman</th>
            <th style="width:82px;">HP (Masking)</th>
            <th style="width:68px;">Kurir 3PL</th>
            <th style="width:82px;">RT/RW</th>
            <th class="num" style="width:36px;">RTS</th>
            <th class="num" style="width:94px;">Nilai COD</th>
            <th class="num" style="width:80px;">Skor</th>
            <th style="width:86px;">Status WA</th>
            <th style="width:84px;">Keputusan</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr>
            <td></td>
            <td colspan="3">TOTAL 18 ORDER (14 HOLD)</td>
            <td colspan="4" class="mono">Ongkir PP Terlindungi: ${fmtIdr(TOTAL_QUEUE_ONGKIR)}</td>
            <td class="num mono">22x</td>
            <td class="num mono">${fmtIdr(TOTAL_QUEUE_VALUE)}</td>
            <td class="num mono">Avg 68</td>
            <td colspan="2" class="mono">14 Hold · 4 Kirim</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  const inspectorPanel = `<section class="e-panel" style="min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('eye', 13, '#9a5b00')}<span>Inspektor Risiko · COD-512 (Order #9921)</span></div>
      ${badge('Risiko 84 · Tahan / WA', 'bad')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 10px;background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;">
        <div>
          <div style="font-size:9.5px;color:#9f1239;font-weight:700;">SKOR RISIKO COD ENGINE</div>
          <div class="mono" style="font-size:20px;font-weight:800;color:#be123c;line-height:1.1;">84 <span style="font-size:11px;font-weight:600;">/ 100</span></div>
          <div style="font-size:9.5px;color:#881337;">Ambang Auto-Hold: &gt;= 70</div>
        </div>
        <div style="border-left:1px solid #fecdd3;padding-left:8px;">
          <div style="font-size:9.5px;color:#6b645c;font-weight:700;">EKSPOSUR FINANSIAL</div>
          <div class="mono" style="font-size:13px;font-weight:700;color:#1c1917;">COD Rp 485.000</div>
          <div style="font-size:9.8px;color:#44403c;">Ongkir PP J&amp;T: <strong>Rp 74.000</strong></div>
          <div style="font-size:9.5px;color:#6b645c;">Tujuan: Kab. Bone, Sulsel</div>
        </div>
      </div>

      <div>
        <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;">DEKOMPOSISI FAKTOR RISIKO (SUM = 84 POIN)</div>
        <table class="e-table" style="border:1px solid #ddd6cb;">
          <tbody>
            ${RISK_RULES.filter((r) => r.hit512)
              .map(
                (r) => `<tr>
                <td class="mono" style="width:58px;font-weight:700;color:#9a5b00;">${esc(r.id)}</td>
                <td>${esc(r.name)}</td>
                <td class="num mono" style="width:46px;color:#be123c;font-weight:700;">+${r.weight}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div>
        <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;">JEJAK 2X RIWAYAT RTS PADA NOMOR 0813****892</div>
        <table class="e-table" style="border:1px solid #ddd6cb;">
          <thead>
            <tr>
              <th style="width:72px;">Tanggal</th>
              <th style="width:62px;">Kurir</th>
              <th style="width:186px;">Kode Gagal Antar 3PL</th>
              <th class="num" style="width:82px;">COD</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="mono">14 Okt 26</td><td>J&amp;T</td><td>CR04 · Alamat tidak lengkap</td><td class="num mono">Rp 412.000</td></tr>
            <tr><td class="mono">29 Sep 26</td><td>Ninja</td><td>RT02 · Penerima menolak COD</td><td class="num mono">Rp 380.000</td></tr>
          </tbody>
        </table>
      </div>

      <div style="border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;background:#faf8f4;">
        <div style="font-size:9.8px;font-weight:700;color:#44403c;margin-bottom:4px;">VALIDASI ALAMAT KEMENDAGRI / KODEPOS</div>
        <div class="rg-kv">
          <span class="rg-kv-k">Alamat Mentah</span><span class="rg-kv-v" style="color:#be123c;">Jl. Ahmad Yani dkt pasar Watampone</span>
          <span class="rg-kv-k">Status RT/RW</span><span class="rg-kv-v">Tidak ditemukan · Patokan ambigu</span>
          <span class="rg-kv-k">Riwayat Nomor</span><span class="rg-kv-v mono">0813****892 · 2x RTS (J&amp;T, Ninja)</span>
          <span class="rg-kv-k">Order Lolos Ref</span><span class="rg-kv-v mono">COD-508 (#9914) Bekasi · Skor 22 OK</span>
        </div>
      </div>

      <div class="rg-wa-box">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <strong style="font-size:10px;color:#047857;">WHATSAPP BUSINESS API · KONFIRMASI OTOMATIS</strong>
          <span class="mono" style="font-size:9.2px;color:#047857;">wamid.HBgM6281...</span>
        </div>
        <div style="line-height:1.4;">WA Konfirmasi ke <span class="mono">0813****892</span>: &ldquo;Halo Kak, konfirmasi pesanan COD Rp 485.000 ke Kab. Bone? Balas YA untuk proses kirim.&rdquo;</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between;font-size:9.5px;color:#44403c;">
          <span>Status: <strong>Terkirim (Centang 2) · 12 mnt lalu</strong></span>
          <span>Batas Tunggu: <strong class="mono">01j 48m</strong></span>
        </div>
      </div>

      <div style="border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;background:#ffffff;">
        <div style="font-size:9.8px;font-weight:700;color:#44403c;margin-bottom:5px;">AKSI OPERATOR CS &amp; PEMBUATAN TIKET</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <span class="e-btn e-btn-primary" style="justify-content:center;">Kirim Ulang WA</span>
          <span class="e-btn" style="justify-content:center;">Minta DP QRIS 20%</span>
          <span class="e-btn" style="justify-content:center;">Loloskan Manual</span>
          <span class="e-btn e-btn-danger" style="justify-content:center;">Batalkan &amp; Blacklist</span>
        </div>
      </div>
    </div>
  </section>`;

  return renderShell({
    activeSlug: 'p2',
    title: meta.pages[1].title,
    actionsHtml: `<span class="e-btn">Impor Webhook Order</span><span class="e-btn e-btn-primary">${ic('zap', 11)}Kirim Konfirmasi WA (10)</span>`,
    contentHtml: `${toolbar}<div style="display:grid;grid-template-columns:1.88fr 1fr;gap:9px;flex:1;min-height:0;">${tablePanel}${inspectorPanel}</div>`,
  });
}

// ============================================================================
// PAGE 3: PAPAN KANBAN REVERSE LOGISTICS RMA & DENAH RAK GUDANG RETUR
// ============================================================================
function renderPage3() {
  const lanes = [
    { key: 'transit', title: '1. RTS Transit 3PL', badgeTone: 'warn' },
    { key: 'dock', title: '2. Diterima Dock Retur', badgeTone: 'info' },
    { key: 'qc', title: '3. Inspeksi QC & Video', badgeTone: 'accent' },
    { key: 'dispute', title: '4. Sengketa Klaim 3PL', badgeTone: 'bad' },
    { key: 'restock', title: '5. Lulus QC / Restock', badgeTone: 'ok' },
  ];

  const kanbanHtml = `<div class="kb-grid">
    ${lanes
      .map((l) => {
        const cards = RMA_CARDS.filter((c) => c.lane === l.key);
        const laneVal = cards.reduce((a, c) => a + c.value, 0);
        return `<div class="kb-col">
          <div class="kb-col-head">
            <span class="trunc">${esc(l.title)}</span>
            ${badge(String(cards.length) + ' pkt', l.badgeTone)}
          </div>
          <div style="padding:4px 9px;background:#faf8f4;border-bottom:1px solid #e7e1d7;display:flex;justify-content:space-between;font-size:9.5px;color:#6b645c;">
            <span>Nilai Lane</span><span class="mono" style="font-weight:700;color:#1c1917;">${fmtIdr(laneVal)}</span>
          </div>
          <div class="kb-col-body">
            ${cards
              .map(
                (c) => `<div class="kb-card ${c.tone}">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                  <span class="mono" style="font-size:10px;font-weight:800;color:#1c1917;">${esc(c.id)} · ${esc(c.awb)}</span>
                  ${badge(c.grade, c.tone)}
                </div>
                <div style="font-size:10.8px;font-weight:700;color:#1c1917;" class="trunc">${esc(c.title)}</div>
                <div style="font-size:9.8px;color:#57534e;" class="trunc">${esc(c.route)}</div>
                <div style="font-size:9.6px;color:#6b645c;background:#faf8f4;padding:3px 5px;border-radius:2px;border:1px solid #ece7df;" class="trunc">${esc(c.reason)}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.6px;margin-top:2px;">
                  <span class="mono" style="font-weight:700;color:#1c1917;">${fmtIdr(c.value)}</span>
                  <span class="mono" style="color:#6b645c;">${esc(c.carrier)} · ${esc(c.bin)} · ${esc(c.age)}</span>
                </div>
                <div style="height:3px;background:#ece7df;border-radius:2px;overflow:hidden;margin-top:2px;">
                  <div style="width:${c.tone === 'ok' ? '100%' : c.tone === 'bad' ? '82%' : c.tone === 'warn' ? '64%' : '45%'};height:100%;background:${c.tone === 'ok' ? '#047857' : c.tone === 'bad' ? '#be123c' : c.tone === 'warn' ? '#b45309' : '#0369a1'};"></div>
                </div>
              </div>`
              )
              .join('')}
          </div>
          <div style="padding:5px 8px;border-top:1px solid #e7e1d7;background:#ffffff;display:flex;justify-content:space-between;font-size:9.2px;color:#6b645c;flex-shrink:0;">
            <span>SLA Lane: &lt; 18 jam</span>
            <span class="mono" style="font-weight:700;color:#44403c;">${cards.length} aktif</span>
          </div>
        </div>`;
      })
      .join('')}
  </div>`;

  // Warehouse RMA Rack & Bin Blueprint SVG
  const warehouseSvg = `<svg viewBox="0 0 880 236" width="100%" height="236" style="display:block;background:#faf8f4;border:1px solid #e7e1d7;border-radius:3px;">
    <rect x="10" y="10" width="150" height="198" rx="3" fill="#f0f9ff" stroke="#0369a1" stroke-width="1.2" />
    <text x="18" y="26" font-size="9.5" font-weight="700" fill="#0369a1">DOCK INBOUND RETUR</text>
    <rect x="20" y="36" width="130" height="44" rx="2" fill="#ffffff" stroke="#7dd3fc" />
    <text x="28" y="54" font-size="9" font-weight="700" fill="#1c1917">DOCK-B1 (JNE / SiCepat)</text>
    <text x="28" y="68" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">RTS-090 · 18 pkt antre</text>
    <rect x="20" y="90" width="130" height="44" rx="2" fill="#ffffff" stroke="#7dd3fc" />
    <text x="28" y="108" font-size="9" font-weight="700" fill="#1c1917">DOCK-B2 (J&amp;T / Ninja)</text>
    <text x="28" y="122" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">RTS-091, RTS-089 · 24 pkt</text>
    <rect x="20" y="144" width="130" height="54" rx="2" fill="#fdf3e3" stroke="#9a5b00" />
    <text x="28" y="162" font-size="9" font-weight="700" fill="#6b3d00">SCANNER BARCODE + TIMBANG</text>
    <text x="28" y="176" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">Auto-link CCTV Packing</text>
    <text x="28" y="189" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#9a5b00">Throughput: 42 pkt/jam</text>

    <!-- Arrows -->
    <line x1="160" y1="108" x2="188" y2="108" stroke="#9a5b00" stroke-width="1.8" />
    <polygon points="188,104 196,108 188,112" fill="#9a5b00" />

    <!-- QC & Camera Inspection Zone -->
    <rect x="198" y="10" width="206" height="198" rx="3" fill="#fffbeb" stroke="#b45309" stroke-width="1.2" />
    <text x="208" y="26" font-size="9.5" font-weight="700" fill="#92400e">ZONA MEJA QC &amp; KAMERA 4K</text>
    <rect x="208" y="36" width="186" height="46" rx="2" fill="#ffffff" stroke="#fcd34d" />
    <text x="216" y="53" font-size="9" font-weight="700" fill="#1c1917">MEJA QC-01 · Tekstil &amp; Apparel</text>
    <text x="216" y="68" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">RMA-117 · Cek Tag &amp; Jahitan</text>
    <rect x="208" y="90" width="186" height="46" rx="2" fill="#ffffff" stroke="#fcd34d" />
    <text x="216" y="107" font-size="9" font-weight="700" fill="#1c1917">MEJA QC-02 · Elektronik HomeTech</text>
    <text x="216" y="122" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#44403c">RMA-118 · Uji Daya &amp; Serial</text>
    <rect x="208" y="144" width="186" height="54" rx="2" fill="#ecfdf5" stroke="#047857" />
    <text x="216" y="162" font-size="9" font-weight="700" fill="#047857">MEJA QC-03 · Segel Beauty &amp; Herba</text>
    <text x="216" y="176" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">RTS-088 (#JP882144) LULUS QC</text>
    <text x="216" y="189" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#047857">Auto-post WMS: Stok +1 Aktif</text>

    <line x1="404" y1="68" x2="432" y2="68" stroke="#047857" stroke-width="1.8" />
    <polygon points="432,64 440,68 432,72" fill="#047857" />
    <line x1="404" y1="158" x2="432" y2="158" stroke="#be123c" stroke-width="1.8" />
    <polygon points="432,154 440,158 432,162" fill="#be123c" />

    <!-- Restock Bins Grade A & B -->
    <rect x="442" y="10" width="240" height="114" rx="3" fill="#ecfdf5" stroke="#047857" stroke-width="1.2" />
    <text x="452" y="26" font-size="9.5" font-weight="700" fill="#047857">RAK RESTOCK LAYAK JUAL (GRADE A: 584 UNIT)</text>
    <rect x="452" y="34" width="68" height="36" rx="2" fill="#ffffff" stroke="#10b981" />
    <text x="458" y="49" font-size="8.5" font-weight="700" fill="#1c1917">RAK-A04</text>
    <text x="458" y="62" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#047857">RTS-088 +1</text>
    <rect x="528" y="34" width="68" height="36" rx="2" fill="#ffffff" stroke="#10b981" />
    <text x="534" y="49" font-size="8.5" font-weight="700" fill="#1c1917">RAK-B11</text>
    <text x="534" y="62" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#047857">RTS-086 +2</text>
    <rect x="604" y="34" width="68" height="36" rx="2" fill="#ffffff" stroke="#10b981" />
    <text x="610" y="49" font-size="8.5" font-weight="700" fill="#1c1917">RAK-C02</text>
    <text x="610" y="62" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#047857">RTS-085 +3</text>
    <rect x="452" y="78" width="220" height="36" rx="2" fill="#f0f9ff" stroke="#0369a1" />
    <text x="460" y="94" font-size="8.8" font-weight="700" fill="#0369a1">JALUR REPACKAGING (GRADE B: 112 UNIT)</text>
    <text x="460" y="107" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#44403c">REPACK-R1..R4 · Ganti Dus Luar &amp; Segel Baru</text>

    <!-- Quarantine & Dispute Vault -->
    <rect x="442" y="132" width="428" height="76" rx="3" fill="#fff1f2" stroke="#be123c" stroke-width="1.2" />
    <text x="452" y="148" font-size="9.5" font-weight="700" fill="#be123c">ZONA KARANTINA SENGKETA 3PL &amp; WRITE-OFF DOA (104 UNIT)</text>
    <rect x="452" y="156" width="200" height="42" rx="2" fill="#ffffff" stroke="#fda4af" />
    <text x="460" y="172" font-size="8.8" font-weight="700" fill="#1c1917">KARANTINA-K1 (64 unit · Sengketa)</text>
    <text x="460" y="186" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#be123c">RMA-115 (#JN770512) · Bukti Fisik Disegel</text>
    <rect x="660" y="156" width="200" height="42" rx="2" fill="#ffffff" stroke="#fda4af" />
    <text x="668" y="172" font-size="8.8" font-weight="700" fill="#1c1917">SCRAP-S1 (40 unit · Write-Off)</text>
    <text x="668" y="186" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#44403c">Menunggu DoA-2611-42 · Rp 12,4 jt</text>

    <!-- WMS Sync Card -->
    <rect x="692" y="10" width="178" height="114" rx="3" fill="#ffffff" stroke="#c5bbb0" />
    <text x="702" y="27" font-size="9.2" font-weight="700" fill="#9a5b00">SINKRONISASI WMS &amp; ERP</text>
    <text x="702" y="46" font-size="8.5" fill="#44403c">Gudang: JKT-Cakung B2</text>
    <text x="702" y="61" font-size="8.5" fill="#44403c">SLA Restock: &lt; 18 jam</text>
    <text x="702" y="76" font-size="8.5" fill="#44403c">Akurasi Bin: 99,7%</text>
    <text x="702" y="94" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">PEMULIHAN STOK P11:</text>
    <text x="702" y="110" font-size="11" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">Rp 184.500.000</text>
  </svg>`;

  const dispTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:176px;">Disposisi QC RMA (P11)</th>
        <th class="num" style="width:52px;">Unit</th>
        <th class="num" style="width:54px;">Porsi</th>
        <th class="num" style="width:104px;">Nilai Persediaan</th>
        <th style="width:94px;">Zona Rak</th>
      </tr>
    </thead>
    <tbody>
      ${RMA_DISPOSITION.map((d) => {
        const pct = (d.units / TOTAL_RMA_UNITS) * 100;
        return `<tr>
          <td><strong>${esc(d.grade)}</strong></td>
          <td class="num mono">${fmtNum(d.units)}</td>
          <td class="num mono">${fmtPct(pct)}</td>
          <td class="num mono">${fmtIdr(d.valueIdr)}</td>
          <td class="mono">${badge(d.binZone, d.tone)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>TOTAL RETUR P11 (SINKRON RTS)</td>
        <td class="num mono">${fmtNum(TOTAL_RMA_UNITS)}</td>
        <td class="num mono">100,0%</td>
        <td class="num mono">${fmtIdr(TOTAL_RMA_VALUE)}</td>
        <td class="mono">4 Zona</td>
      </tr>
    </tfoot>
  </table>`;

  const contentHtml = `<section class="e-panel" style="flex:1;min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 13, '#9a5b00')}<span>Papan Kanban Reverse Logistics RMA — Pelacakan Retur Paket ke Stok Layak Jual</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Gudang JKT-Cakung', 'accent')}
          ${badge('RTS-088: Lulus QC · Stok +1', 'ok')}
          ${badge('RMA-114: Sengketa Menang', 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;">${kanbanHtml}</div>
    </section>
    <div style="display:grid;grid-template-columns:1.42fr 1fr;gap:9px;height:290px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#9a5b00')}<span>Denah Alur Dock Retur, Meja QC &amp; Bin Karantina Gudang JKT</span></div>
          <span class="e-panel-sub">Real-Time WMS Bin Mapping</span>
        </div>
        <div class="e-panel-body" style="padding:6px 9px;">${warehouseSvg}</div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#9a5b00')}<span>Matriks Disposisi Stok Retur (800 Paket RTS P11)</span></div>
          <span class="e-panel-sub">Pemulihan Grade A: 73,0%</span>
        </div>
        <div class="e-panel-body-flush">${dispTable}
          <div style="padding:8px 10px;background:#faf8f4;border-top:1px solid #ece7df;font-size:10px;color:#44403c;flex:1;display:flex;align-items:center;justify-content:space-between;">
            <span><strong>Integrasi ERP:</strong> Setiap aksi <em>Restock Lulus QC</em> otomatis menerbitkan jurnal PSAK 14 &amp; tambah stok omnichannel.</span>
            <span class="e-btn e-btn-primary">Restock Lulus QC</span>
          </div>
        </div>
      </section>
    </div>`;

  return renderShell({
    activeSlug: 'p3',
    title: meta.pages[2].title,
    actionsHtml: `<span class="e-btn">Cetak Label Bin RMA</span><span class="e-btn e-btn-primary">${ic('check', 11)}Restock Lulus QC</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4: FORENSIK VIDEO PACKING GUDANG VS UNBOXING SENGKETA
// ============================================================================
function renderPage4() {
  const wonCases = DISPUTE_CASES.filter((c) => c.result === 'Sengketa Menang');
  const wonValue = wonCases.reduce((a, c) => a + c.amount, 0);
  const totalDispValue = DISPUTE_CASES.reduce((a, c) => a + c.amount, 0);

  const packingCameraSvg = `<svg viewBox="0 0 740 280" width="100%" height="296" style="display:block;background:#181614;border-radius:3px;">
    <!-- Camera HUD Frame -->
    <rect x="12" y="12" width="716" height="218" fill="#23201c" stroke="#44403c" stroke-width="1" />
    <!-- Top Overhead Table Schematic -->
    <rect x="120" y="36" width="500" height="170" rx="3" fill="#2e2a25" stroke="#57534e" stroke-dasharray="4,3" />
    <!-- Cardboard Box Open Top View -->
    <rect x="260" y="64" width="210" height="118" rx="2" fill="#7c5634" stroke="#b48352" stroke-width="1.5" />
    <rect x="274" y="76" width="182" height="94" rx="2" fill="#3f3730" stroke="#9a7149" />
    <!-- Folded Apparel SKU-L inside box -->
    <rect x="292" y="88" width="146" height="70" rx="3" fill="#57534e" stroke="#a8a29e" />
    <rect x="330" y="102" width="70" height="28" rx="2" fill="#ffffff" stroke="#10b981" stroke-width="1.8" />
    <text x="365" y="114" text-anchor="middle" font-size="9" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">SIZE: L</text>
    <text x="365" y="125" text-anchor="middle" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#047857">SKU-L-0482</text>
    <!-- AI Detection Bounding Box -->
    <rect x="322" y="95" width="86" height="42" fill="none" stroke="#10b981" stroke-width="1.6" stroke-dasharray="4,2" />
    <rect x="322" y="79" width="128" height="15" rx="2" fill="#047857" />
    <text x="327" y="90" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">OCR MATCH: SKU-L (99,4%)</text>
    <!-- Digital Scale Readout -->
    <rect x="498" y="64" width="110" height="58" rx="3" fill="#141210" stroke="#9a5b00" stroke-width="1.2" />
    <text x="506" y="80" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#d6d3d1">TIMBANGAN USB</text>
    <text x="506" y="106" font-size="18" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">418 g</text>
    <!-- Barcode Scanner Overlay -->
    <rect x="134" y="64" width="112" height="62" rx="3" fill="#141210" stroke="#57534e" />
    <text x="142" y="80" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">SCAN RESI J&amp;T</text>
    <text x="142" y="96" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">JP881920441</text>
    <text x="142" y="114" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">OPR: PACK-04-JKT</text>
    <!-- Burn-in Watermark Top -->
    <rect x="18" y="18" width="234" height="18" rx="2" fill="#0c0a09" opacity="0.88" />
    <circle cx="28" cy="27" r="3.5" fill="#10b981" />
    <text x="37" y="30" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#f5f5f4">CAM-PACK-04 · GUDANG JKT-CAKUNG</text>
    <rect x="490" y="18" width="232" height="18" rx="2" fill="#0c0a09" opacity="0.88" />
    <text x="716" y="30" text-anchor="end" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#fde68a">2026-11-18 14:22:09 WIB · WORM OK</text>
    <!-- Timeline Scrubber -->
    <rect x="12" y="238" width="716" height="32" rx="2" fill="#23201c" stroke="#44403c" />
    <rect x="24" y="250" width="692" height="6" rx="2" fill="#44403c" />
    <rect x="24" y="250" width="380" height="6" rx="2" fill="#9a5b00" />
    <circle cx="404" cy="253" r="5" fill="#fbbf24" stroke="#1c1917" stroke-width="1.5" />
    <text x="24" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">00:00 Scan Resi</text>
    <text x="200" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">00:18 Cek Tag SKU-L</text>
    <text x="374" y="246" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">00:34 Segel &amp; Timbang 418g</text>
    <text x="640" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">01:02 Selesai</text>
    <text x="24" y="266" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">SHA-256: e844a9c02b114f89d203...7d93 (Immutable Vault)</text>
  </svg>`;

  const unboxingVideoSvg = `<svg viewBox="0 0 740 280" width="100%" height="296" style="display:block;background:#181614;border-radius:3px;">
    <rect x="12" y="12" width="716" height="218" fill="#262320" stroke="#44403c" stroke-width="1" />
    <!-- Buyer Phone Frame Centerpiece -->
    <rect x="215" y="24" width="310" height="194" rx="4" fill="#35312c" stroke="#78716c" stroke-width="1.4" />
    <!-- Parcel & Label in Buyer Video -->
    <rect x="245" y="54" width="128" height="130" rx="2" fill="#6b5039" stroke="#a88464" />
    <rect x="260" y="72" width="98" height="58" rx="1" fill="#f5f5f4" stroke="#10b981" stroke-width="1.5" />
    <text x="309" y="89" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">J&amp;T EXPRESS</text>
    <text x="309" y="103" text-anchor="middle" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">JP881920441</text>
    <text x="309" y="117" text-anchor="middle" font-size="7.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">SEGEL UTUH</text>
    <!-- Extracted Garment Tag Frame -->
    <rect x="388" y="64" width="118" height="114" rx="2" fill="#524d47" stroke="#a8a29e" />
    <rect x="404" y="92" width="86" height="44" rx="2" fill="#ffffff" stroke="#10b981" stroke-width="1.8" />
    <text x="447" y="111" text-anchor="middle" font-size="10" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">TAG: L</text>
    <text x="447" y="126" text-anchor="middle" font-size="7.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#047857">MATCH SKU-L</text>
    <rect x="394" y="44" width="124" height="16" rx="2" fill="#047857" />
    <text x="400" y="55" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">KLAIM SALAH UKURAN GUGUR</text>
    <!-- Side Metadata Cards -->
    <rect x="24" y="46" width="174" height="148" rx="3" fill="#1c1917" stroke="#44403c" />
    <text x="34" y="64" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">ANALISIS METADATA EXIF</text>
    <text x="34" y="84" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Resolusi: 1080x1920 30fps</text>
    <text x="34" y="100" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Potongan Edit: 0 (Asli)</text>
    <text x="34" y="116" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">Resi Cocok: JP881920441</text>
    <text x="34" y="132" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">Tag Ukuran: L == Order L</text>
    <text x="34" y="148" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Selisih Berat: -2 g (0,4%)</text>
    <text x="34" y="172" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">VERDICT: SENGKETA MENANG</text>

    <rect x="540" y="46" width="176" height="148" rx="3" fill="#1c1917" stroke="#44403c" />
    <text x="550" y="64" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#93c5fd">PUTUSAN MEDIATOR</text>
    <text x="550" y="84" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Kasus: RMA-114 (Bandung)</text>
    <text x="550" y="100" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Nilai Klaim: Rp 245.000</text>
    <text x="550" y="116" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">Dana Dilepas ke Seller</text>
    <text x="550" y="132" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Durasi Sengketa: 14 jam</text>
    <text x="550" y="152" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">Paket Bukti PDF+MP4</text>
    <text x="550" y="168" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">Terkirim ke Portal Klaim</text>

    <rect x="18" y="18" width="240" height="18" rx="2" fill="#0c0a09" opacity="0.88" />
    <text x="26" y="30" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#f5f5f4">VIDEO UNBOXING PEMBELI · RMA-114</text>
    <rect x="492" y="18" width="230" height="18" rx="2" fill="#064e3b" />
    <text x="714" y="30" text-anchor="end" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">TERBUKTI SESUAI SKU-L · VIDEO OK</text>

    <rect x="12" y="238" width="716" height="32" rx="2" fill="#23201c" stroke="#44403c" />
    <rect x="24" y="250" width="692" height="6" rx="2" fill="#44403c" />
    <rect x="24" y="250" width="445" height="6" rx="2" fill="#047857" />
    <circle cx="469" cy="253" r="5" fill="#6ee7b7" stroke="#1c1917" stroke-width="1.5" />
    <text x="24" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">00:00 Tunjuk Resi</text>
    <text x="210" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">00:19 Buka Lakban</text>
    <text x="412" y="246" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">00:39 Frame Tag Ukuran L</text>
    <text x="646" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a8a29e">00:58 Akhir</text>
    <text x="24" y="266" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#e7e5e4">Sinkronisasi Frame-by-Frame Aktif · Bukti Klaim Terkunci untuk Mediator Marketplace &amp; 3PL</text>
  </svg>`;

  const matchChecks = [
    { item: 'Nomor Resi 3PL (Barcode OCR)', pack: 'JP881920441', unbox: 'JP881920441', status: 'Cocok 100%', tone: 'ok' },
    { item: 'SKU & Tag Ukuran Produk', pack: 'SKU-L-0482 (Size L)', unbox: 'Tag Size L Terbaca', status: 'Sesuai Order', tone: 'ok' },
    { item: 'Berat Paket vs Timbangan', pack: '418 gram (USB Scale)', unbox: '416 gram (Toleransi)', status: 'Delta -2 g OK', tone: 'ok' },
    { item: 'Keutuhan Segel & Lakban Brand', pack: 'Segel Utuh 14:22 WIB', unbox: 'Belum Terbuka Awal', status: 'Terverifikasi', tone: 'ok' },
    { item: 'Integritas Video & Timestamp', pack: 'WORM SHA-256 Valid', unbox: 'EXIF Tanpa Cut Edit', status: 'Valid Forensik', tone: 'ok' },
    { item: 'Klaim Pembeli vs Bukti', pack: 'Dikirim Ukuran L', unbox: 'Klaim: "Salah Ukuran"', status: 'Klaim Ditolak', tone: 'ok' },
  ];

  const contentHtml = `<div class="e-panel" style="flex-shrink:0;">
      <div style="height:40px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;background:#faf8f4;">
        <div style="display:flex;align-items:center;gap:8px;">
          ${badge('RMA-114', 'accent')}
          <strong style="font-size:12px;">Klaim Salah Ukuran — Bandung (Rp 245.000)</strong>
          <span style="color:#6b645c;">· Video packing gudang terbukti sesuai SKU-L · Kurir J&amp;T (#JP881920441)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Sengketa Menang · Video OK', 'ok')}
          <span class="e-btn">${ic('download', 11)}Unduh Paket Bukti PDF+MP4</span>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;height:352px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('play', 12, '#9a5b00')}<span>Kamera Overhead Meja Packing #04 — Gudang JKT</span></div>
          <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">418 g · SKU-L-0482</span>
        </div>
        <div class="e-panel-body" style="padding:8px;">${packingCameraSvg}</div>
      </section>
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 12, '#047857')}<span>Video Unboxing Pembeli — Perbandingan Frame Sinkron</span></div>
          <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">OCR Match 99,4%</span>
        </div>
        <div class="e-panel-body" style="padding:8px;">${unboxingVideoSvg}</div>
      </section>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1.32fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#9a5b00')}<span>Matriks Pencocokan Bukti Packing vs Unboxing (6 Titik)</span></div>
          ${badge('6/6 Terverifikasi', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:170px;">Parameter Forensik</th>
                <th style="width:146px;">Bukti Packing Gudang</th>
                <th style="width:146px;">Bukti Unboxing Pembeli</th>
                <th style="width:104px;">Hasil</th>
              </tr>
            </thead>
            <tbody>
              ${matchChecks
                .map(
                  (m) => `<tr>
                  <td><strong>${esc(m.item)}</strong></td>
                  <td class="mono" style="font-size:10px;">${esc(m.pack)}</td>
                  <td class="mono" style="font-size:10px;">${esc(m.unbox)}</td>
                  <td>${badge(m.status, m.tone)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:9px 11px;background:#faf8f4;border-top:1px solid #ddd6cb;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;flex:1;align-items:center;">
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 7px;">
              <div class="mono" style="font-size:9px;color:#6b645c;">18 NOV · 14:22</div>
              <div style="font-size:10px;font-weight:700;color:#1c1917;">Packing CCTV #04</div>
              <div style="font-size:9.2px;color:#047857;">SKU-L · 418 g WORM</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 7px;">
              <div class="mono" style="font-size:9px;color:#6b645c;">20 NOV · 11:04</div>
              <div style="font-size:10px;font-weight:700;color:#1c1917;">POD J&amp;T Bandung</div>
              <div style="font-size:9.2px;color:#44403c;">COD Rp 245rb lunas</div>
            </div>
            <div style="background:#ffffff;border:1px solid #fde68a;border-radius:3px;padding:6px 7px;">
              <div class="mono" style="font-size:9px;color:#b45309;">21 NOV · 09:15</div>
              <div style="font-size:10px;font-weight:700;color:#1c1917;">Klaim Pembeli</div>
              <div style="font-size:9.2px;color:#b45309;">Tuduhan salah ukuran</div>
            </div>
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:6px 7px;">
              <div class="mono" style="font-size:9px;color:#047857;">22 NOV · 14:18</div>
              <div style="font-size:10px;font-weight:700;color:#047857;">Putusan Menang</div>
              <div style="font-size:9.2px;color:#065f46;">Dana dilepas ke seller</div>
            </div>
          </div>
          <div style="padding:8px 11px;background:#ecfdf5;border-top:1px solid #a7f3d0;font-size:10.2px;color:#065f46;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
            <span><strong>Kesimpulan Otomatis:</strong> Bukti kamera packing &amp; timbangan USB mematahkan klaim salah ukuran. Dana Rp 245.000 dilindungi.</span>
            <span class="mono" style="font-weight:700;white-space:nowrap;">ID: EVD-114-OK</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Antrean Sengketa Klaim &amp; Rekap Kemenangan Bukti Video (8 Kasus)</span></div>
          <span class="e-panel-sub">Menang: ${wonCases.length}/8 Kasus (${fmtIdr(wonValue)})</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:68px;">Kode</th>
                <th style="width:76px;">Kota</th>
                <th style="width:186px;">Jenis Klaim Pembeli</th>
                <th style="width:58px;">3PL</th>
                <th class="num" style="width:64px;">Pack</th>
                <th class="num" style="width:64px;">Unbox</th>
                <th class="num" style="width:88px;">Nilai Klaim</th>
                <th style="width:112px;">Putusan</th>
              </tr>
            </thead>
            <tbody>
              ${DISPUTE_CASES.map(
                (d) => `<tr class="${d.selected ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;">${esc(d.id)}</td>
                  <td>${esc(d.city)}</td>
                  <td>${esc(d.claim)}</td>
                  <td>${esc(d.carrier)}</td>
                  <td class="num mono">${esc(d.packWt)}</td>
                  <td class="num mono">${esc(d.unboxWt)}</td>
                  <td class="num mono">${fmtIdr(d.amount)}</td>
                  <td>${badge(d.result, d.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6">TOTAL 8 SENGKETA AKTIF &amp; SELESAI (MENANG: ${fmtIdr(wonValue)})</td>
                <td class="num mono">${fmtIdr(totalDispValue)}</td>
                <td class="mono">5 Menang · 1 Refund</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>`;

  return renderShell({
    activeSlug: 'p4',
    title: meta.pages[3].title,
    actionsHtml: `<span class="e-btn">Sinkron CCTV Meja Packing</span><span class="e-btn e-btn-primary">${ic('fileText', 11)}Kirim Banding ke 3PL</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5: MESIN ATURAN RISIKO COD, SIMULASI WHAT-IF & TEMPLATE WA
// ============================================================================
function renderPage5() {
  const simChart = svgMultiLineChart({
    width: 740,
    height: 222,
    xLabels: ['Skor 55', 'Skor 60', 'Skor 64', 'Skor 68*', 'Skor 70', 'Skor 75', 'Skor 80', 'Skor 85'],
    yMin: 0,
    yMax: 16,
    yTicks: 4,
    yFormat: (v) => `${v.toFixed(0)}%`,
    threshold: { value: 8.0, label: 'Target SLA RTS 8,0%', color: '#be123c' },
    series: [
      { label: 'Proyeksi Rasio RTS (%)', color: '#9a5b00', area: true, dots: true, values: [4.2, 4.6, 4.9, 5.1, 6.4, 7.8, 10.4, 13.8] },
      { label: 'False Positive Hold (%)', color: '#0369a1', dots: true, values: [5.6, 3.8, 2.5, 1.8, 1.4, 0.9, 0.5, 0.2] },
    ],
    annotations: [
      { index: 3, seriesIdx: 0, label: 'Simulasi 68: RTS 5,1% (+Rp 4,8 jt)', color: '#047857', dy: -32 },
      { index: 4, seriesIdx: 0, label: 'Saat Ini (70): 6,4%', color: '#9a5b00', dy: 16 },
    ],
  });

  const decisionSvg = `<svg viewBox="0 0 740 130" width="100%" height="130" style="display:block;background:#faf8f4;border:1px solid #e7e1d7;border-radius:3px;">
    <!-- Node 1: Ingress -->
    <rect x="12" y="34" width="142" height="62" rx="3" fill="#ffffff" stroke="#9a5b00" stroke-width="1.5" />
    <text x="22" y="54" font-size="9.2" font-weight="700" fill="#9a5b00">ORDER COD MASUK</text>
    <text x="22" y="69" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">Webhook .NET 9 API</text>
    <text x="22" y="83" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#6b645c">p95 Scoring: 38 ms</text>
    <!-- Branches -->
    <line x1="154" y1="65" x2="196" y2="24" stroke="#047857" stroke-width="1.5" />
    <line x1="154" y1="65" x2="196" y2="65" stroke="#b45309" stroke-width="1.5" />
    <line x1="154" y1="65" x2="196" y2="106" stroke="#be123c" stroke-width="1.5" />
    <!-- Tier 1: Auto Approve -->
    <rect x="198" y="8" width="218" height="32" rx="3" fill="#ecfdf5" stroke="#047857" />
    <text x="208" y="21" font-size="8.8" font-weight="700" fill="#047857">SKOR 0 – 39 · RISIKO RENDAH (78,4%)</text>
    <text x="208" y="33" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">Auto-Approve -&gt; Cetak Resi 3PL Langsung</text>
    <!-- Tier 2: WA 2-Way -->
    <rect x="198" y="49" width="218" height="32" rx="3" fill="#fffbeb" stroke="#b45309" />
    <text x="208" y="62" font-size="8.8" font-weight="700" fill="#92400e">SKOR 40 – 69 · RISIKO SEDANG (14,7%)</text>
    <text x="208" y="74" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">Kirim WA Otomatis · Tunggu Balas "YA"</text>
    <!-- Tier 3: Hold / Block -->
    <rect x="198" y="90" width="218" height="32" rx="3" fill="#fff1f2" stroke="#be123c" />
    <text x="208" y="103" font-size="8.8" font-weight="700" fill="#be123c">SKOR &gt;= 70 · RISIKO TINGGI (6,9%)</text>
    <text x="208" y="115" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#1c1917">Tahan Pra-Kirim + Wajib WA / DP QRIS</text>
    <!-- Right Resolution -->
    <line x1="416" y1="65" x2="454" y2="44" stroke="#047857" stroke-width="1.3" />
    <line x1="416" y1="65" x2="454" y2="86" stroke="#be123c" stroke-width="1.3" />
    <line x1="416" y1="106" x2="454" y2="86" stroke="#be123c" stroke-width="1.3" />
    <rect x="456" y="14" width="270" height="44" rx="3" fill="#ffffff" stroke="#047857" />
    <text x="466" y="31" font-size="8.8" font-weight="700" fill="#047857">BALAS "YA" (82% KONVERSI) -&gt; KIRIM</text>
    <text x="466" y="46" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#44403c">Skor dikurangi -40 poin · Masuk antrean packing</text>
    <rect x="456" y="68" width="270" height="48" rx="3" fill="#ffffff" stroke="#be123c" />
    <text x="466" y="85" font-size="8.8" font-weight="700" fill="#be123c">TANPA BALASAN 6 JAM / TOLAK -&gt; BATAL</text>
    <text x="466" y="100" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#44403c">Hemat ongkir PP 100% · Stok kembali ke ERP</text>
  </svg>`;

  const rulesTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:46px;">Kode</th>
        <th style="width:236px;">Aturan Skoring COD Risk Engine v4.2</th>
        <th style="width:94px;">Lapisan</th>
        <th class="num" style="width:52px;">Bobot</th>
        <th class="num" style="width:60px;">Hit 30h</th>
        <th class="num" style="width:56px;">Presisi</th>
        <th style="width:90px;">Aksi</th>
      </tr>
    </thead>
    <tbody>
      ${RISK_RULES.map(
        (r) => `<tr class="${r.hit512 ? 'is-selected' : ''}">
          <td class="mono" style="font-weight:700;">${esc(r.id)}</td>
          <td><strong>${esc(r.name)}</strong></td>
          <td>${esc(r.layer)}</td>
          <td class="num mono" style="font-weight:700;color:${r.weight < 0 ? '#047857' : '#be123c'};">${r.weight > 0 ? '+' + r.weight : r.weight}</td>
          <td class="num mono">${fmtNum(r.hit30d)}</td>
          <td class="num mono">${esc(r.precision)}</td>
          <td>${badge(r.action, r.weight < 0 ? 'ok' : r.weight >= 25 ? 'bad' : 'warn')}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">12 ATURAN AKTIF (4 BARIS TERSOROT = PROFIL COD-512)</td>
        <td class="num mono">+84</td>
        <td class="num mono">15.108</td>
        <td class="num mono">92,1%</td>
        <td>Produksi</td>
      </tr>
    </tfoot>
  </table>`;

  const contentHtml = `<div style="display:grid;grid-template-columns:1.05fr 1.12fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#9a5b00')}<span>Matriks Bobot &amp; Aturan Deterministik COD Risk Engine v4.2</span></div>
          ${badge('12 Aturan Aktif', 'ok')}
        </div>
        <div class="e-panel-body-flush">${rulesTable}
          <div style="padding:10px 11px;background:#faf8f4;border-top:1px solid #ddd6cb;display:flex;flex-direction:column;gap:7px;flex:1;">
            <div style="font-size:10px;font-weight:700;color:#44403c;">KATALOG TEMPLATE WHATSAPP BUSINESS API (META APPROVED)</div>
            <div class="rg-wa-box" style="padding:7px 9px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <strong class="mono" style="font-size:9.6px;color:#047857;">tpl_cod_verify_luarjawa_v3</strong>
                ${badge('Konversi 82% · Approved', 'ok')}
              </div>
              <div style="font-size:10.2px;">&ldquo;Halo Kak {{1}}, konfirmasi pesanan COD {{2}} ke {{3}}? Balas <strong>YA</strong> untuk proses kirim atau kirim patokan RT/RW.&rdquo;</div>
            </div>
            <div class="rg-wa-box" style="padding:7px 9px;background:#fffbeb;border-color:#fde68a;border-left-color:#b45309;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <strong class="mono" style="font-size:9.6px;color:#92400e;">tpl_cod_highrisk_dp_qris_v2</strong>
                ${badge('Konversi 41% · Approved', 'warn')}
              </div>
              <div style="font-size:10.2px;">&ldquo;Halo Kak {{1}}, pesanan COD bernilai tinggi ke {{3}} memerlukan uang muka QRIS Rp 25.000 untuk aktivasi pengiriman prioritas.&rdquo;</div>
            </div>
            <div class="rg-wa-box" style="padding:7px 9px;background:#f0f9ff;border-color:#bae6fd;border-left-color:#0369a1;">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <strong class="mono" style="font-size:9.6px;color:#0369a1;">tpl_cod_reschedule_kurir_v1</strong>
                ${badge('Terselamatkan 63% · Approved', 'info')}
              </div>
              <div style="font-size:10.2px;">&ldquo;Kurir {{4}} gagal menemui penerima untuk resi {{5}}. Balas <strong>ANTAR</strong> untuk penjadwalan ulang sebelum paket diretur ke Gudang JKT.&rdquo;</div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="height:348px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#9a5b00')}<span>Simulator What-If Ambang Batas Auto-Hold (Replay 12.500 Order P11)</span></div>
            ${badge('Skenario Uji: Skor 70 -> 68', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
            ${simChart}
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;">
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;background:#faf8f4;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">PROYEKSI RTS</div>
                <div class="mono" style="font-size:14px;font-weight:800;color:#047857;">5,1% <span style="font-size:9.5px;">(-1,3 pp)</span></div>
              </div>
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;background:#faf8f4;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">TAMBAHAN HEMAT/BLN</div>
                <div class="mono" style="font-size:14px;font-weight:800;color:#047857;">+Rp 4,8 jt</div>
              </div>
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;background:#faf8f4;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">FALSE POSITIVE HOLD</div>
                <div class="mono" style="font-size:14px;font-weight:800;color:#b45309;">1,8% <span style="font-size:9.5px;">(+0,4 pp)</span></div>
              </div>
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;background:#faf8f4;">
                <div style="font-size:9.2px;color:#6b645c;font-weight:600;">PERSETUJUAN DOA</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#9a5b00;margin-top:2px;">DOA-2611-38</div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 13, '#9a5b00')}<span>Pohon Keputusan Eksekusi COD &amp; Eskalasi WA Otomatis</span></div>
            <span class="e-panel-sub">Deterministic DAG · Rollback 1-Klik</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            ${decisionSvg}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;">
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:8px 10px;background:#ffffff;">
                <div style="font-size:9.8px;font-weight:700;color:#1c1917;margin-bottom:4px;">POLA COD INDONESIA TERDETEKSI (P11)</div>
                <div class="rg-kv">
                  <span class="rg-kv-k">Tanpa RT/RW</span><span class="rg-kv-v mono">1.842 order (RTS 21,4%)</span>
                  <span class="rg-kv-k">HP &gt;=2x RTS</span><span class="rg-kv-v mono">1.126 order (RTS 44,8%)</span>
                  <span class="rg-kv-k">Kode CR04/RT09</span><span class="rg-kv-v mono">312 blokir otomatis</span>
                  <span class="rg-kv-k">Whitelist VIP</span><span class="rg-kv-v mono" style="color:#047857;">3.890 order (RTS 0,9%)</span>
                </div>
              </div>
              <div style="border:1px solid #ddd6cb;border-radius:3px;padding:8px 10px;background:#ffffff;">
                <div style="font-size:9.8px;font-weight:700;color:#1c1917;margin-bottom:4px;">PERFORMA PENGIRIMAN WA BUSINESS API</div>
                <div class="rg-kv">
                  <span class="rg-kv-k">Pesan Terkirim</span><span class="rg-kv-v mono">1.800 (99,6% delivered)</span>
                  <span class="rg-kv-k">Balas "YA"</span><span class="rg-kv-v mono" style="color:#047857;">1.476 (82,0% konversi)</span>
                  <span class="rg-kv-k">Median Respon</span><span class="rg-kv-v mono">14 menit 20 detik</span>
                  <span class="rg-kv-k">Biaya Meta/Order</span><span class="rg-kv-v mono">Rp 340 (ROI 217x)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>`;

  return renderShell({
    activeSlug: 'p5',
    title: meta.pages[4].title,
    actionsHtml: `<span class="e-btn">Jalankan Replay 30 Hari</span><span class="e-btn e-btn-primary">${ic('check', 11)}Ajukan Perubahan ke DoA</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 6: REKONSILIASI COD 3PL, JURNAL PSAK & FAKTUR RETUR CORETAX XML
// ============================================================================
function renderPage6() {
  const topStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>COD Bruto Terkumpul (4 Kurir)</span>${badge('FY2026 · P11', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_COD_GROSS)}</span></div>
      <div class="e-kpi-foot"><span>12.500 order COD terproses</span><span class="mono">100,0%</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Dana COD Cair ke Bank (BI-FAST)</span>${badge('Rekon Cocok', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${fmtIdr(TOTAL_SETTLED)}</span></div>
      <div class="e-kpi-foot"><span>BCA · Mandiri · BNI Treasury</span><span class="mono">${fmtPct((TOTAL_SETTLED / TOTAL_COD_GROSS) * 100)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Beban Ongkir &amp; Penalti Retur PP</span>${badge('Turun -66%', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TOTAL_RTS_FEE)}</span></div>
      <div class="e-kpi-foot"><span>Ditahan Sengketa 3PL: ${fmtIdr(TOTAL_DISPUTE_HOLD)}</span><span class="mono">5,2% bruto</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Nota Retur PPN 11% (CoreTax DJP)</span>${badge('XML Valid', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Rp 28.600.000</span></div>
      <div class="e-kpi-foot"><span>DPP Retur: Rp 260.000.000</span><span class="mono">118 Faktur</span></div>
    </div>
  </section>`;

  const ledgerTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:80px;">No. Jurnal</th>
        <th style="width:60px;">Akun</th>
        <th style="width:210px;">Nama Akun PSAK 72 / PSAK 14</th>
        <th style="width:92px;">Entitas</th>
        <th style="width:86px;">Batch Ref</th>
        <th class="num" style="width:116px;">Debit (IDR)</th>
        <th class="num" style="width:116px;">Kredit (IDR)</th>
        <th style="width:100px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${LEDGER_ENTRIES.map(
        (l) => `<tr>
          <td class="mono" style="font-weight:700;">${esc(l.ref)}</td>
          <td class="mono">${esc(l.acct)}</td>
          <td>${esc(l.name)}</td>
          <td>${esc(l.entity)}</td>
          <td class="mono" style="font-size:9.8px;">${esc(l.batch)}</td>
          <td class="num mono">${l.debit > 0 ? fmtIdr(l.debit) : '—'}</td>
          <td class="num mono">${l.credit > 0 ? fmtIdr(l.credit) : '—'}</td>
          <td>${badge(l.status, l.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5">TOTAL JURNAL GANDA PSAK (SEIMBANG / BALANCED)</td>
        <td class="num mono">${fmtIdr(TOTAL_DEBIT)}</td>
        <td class="num mono">${fmtIdr(TOTAL_CREDIT)}</td>
        <td>${badge('Selisih Rp 0', 'ok')}</td>
      </tr>
    </tfoot>
  </table>`;

  const coretaxXml = `<NotaRetur xmlns="urn:djp:coretax:efaktur:v2.4">
  <Header>
    <NPWPPenjual>0921847561042000</NPWPPenjual>
    <Entitas>PT Nusantara D2C Group (Konsolidasi)</Entitas>
    <MasaPajak>11</MasaPajak><TahunPajak>2026</TahunPajak>
    <BatchRef>NR-CTAX-114</BatchRef><JumlahDokumen>118</JumlahDokumen>
  </Header>
  <RingkasanPajak>
    <DasarPengenaanPajak>260000000</DasarPengenaanPajak>
    <TarifPPN>0.11</TarifPPN>
    <NilaiPPNRetur>28600000</NilaiPPNRetur>
    <AlasanRetur>COD_RTS_CONFIRMED_WH_JKT</AlasanRetur>
  </RingkasanPajak>
  <SignatureSHA256>3b7a91e4f0c2...6d12</SignatureSHA256>
</NotaRetur>`;

  const carrierReconTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:94px;">Kurir 3PL</th>
        <th class="num" style="width:112px;">Cair ke Bank</th>
        <th class="num" style="width:98px;">Ditahan Klaim</th>
        <th class="num" style="width:98px;">Biaya RTS PP</th>
        <th style="width:52px;">SLA</th>
      </tr>
    </thead>
    <tbody>
      ${CARRIERS.map(
        (c) => `<tr>
          <td><strong>${esc(c.name)}</strong></td>
          <td class="num mono" style="color:#047857;font-weight:700;">${fmtIdr(c.settled)}</td>
          <td class="num mono" style="color:#b45309;">${fmtIdr(c.disputeHold)}</td>
          <td class="num mono">${fmtIdr(c.rtsFee)}</td>
          <td>${badge(c.slaDays, 'neutral')}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td>TOTAL 3PL</td>
        <td class="num mono">${fmtIdr(TOTAL_SETTLED)}</td>
        <td class="num mono">${fmtIdr(TOTAL_DISPUTE_HOLD)}</td>
        <td class="num mono">${fmtIdr(TOTAL_RTS_FEE)}</td>
        <td>OK</td>
      </tr>
    </tfoot>
  </table>`;

  const contentHtml = `${topStrip}
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#9a5b00')}<span>Buku Besar Rekonsiliasi COD 3PL &amp; Jurnal Retur PSAK 72 / PSAK 14 (16 Baris)</span></div>
          ${badge('Auto-Post SAP S/4HANA FI', 'ok')}
        </div>
        <div class="e-panel-body-flush">${ledgerTable}
          <div style="padding:10px 11px;background:#faf8f4;border-top:1px solid #ddd6cb;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;flex:1;align-items:center;">
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">KONTROL BUKU BESAR PSAK</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#047857;">Debit == Kredit (Rp 0)</div>
              <div style="font-size:9.2px;color:#57534e;">Periode P11 terbuka s/d 30 Nov</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">MUTASI BANK BI-FAST / SNAP VA</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#1c1917;">4/4 Batch 3PL Cocok</div>
              <div style="font-size:9.2px;color:#57534e;">BCA · Mandiri · BNI Treasury</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:7px 9px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">STATUS E-FAKTUR CORETAX DJP</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#0369a1;">118 Nota Retur Valid</div>
              <div style="font-size:9.2px;color:#57534e;">PPN 11%: Rp 28.600.000</div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#9a5b00')}<span>Payload Ekspor Nota Retur PPN 11% — CoreTax XML (DJP)</span></div>
            ${badge('XSD v2.4 Valid', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
            <div class="rg-code" style="flex:1;">${esc(coretaxXml)}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#44403c;">
              <span>NPWP 16-Digit tervalidasi · Siap unggah portal CoreTax DJP</span>
              <span class="e-btn e-btn-primary">Ekspor XML Batch</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:242px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 13, '#9a5b00')}<span>Rekonsiliasi Pencairan Dana COD per Kurir 3PL</span></div>
            <span class="e-panel-sub">BI-FAST &amp; SNAP VA Match</span>
          </div>
          <div class="e-panel-body-flush">${carrierReconTable}
            <div style="padding:7px 10px;background:#faf8f4;border-top:1px solid #ece7df;font-size:9.8px;color:#44403c;flex:1;display:flex;align-items:center;justify-content:space-between;">
              <span>Selisih Bank Statement vs Manifest 3PL: <strong class="mono" style="color:#047857;">Rp 0 (100% cocok)</strong></span>
              <span class="e-btn">Unduh Rekon CSV</span>
            </div>
          </div>
        </section>
      </div>
    </div>`;

  return renderShell({
    activeSlug: 'p6',
    title: meta.pages[5].title,
    actionsHtml: `<span class="e-btn">Tarik Mutasi SNAP VA</span><span class="e-btn e-btn-primary">${ic('download', 11)}Posting CoreTax XML</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 7: PERSETUJUAN DOA (MAKER-CHECKER-APPROVER) & KLAIM KURIR 3PL
// ============================================================================
function renderPage7() {
  const stepperPanel = `<section class="e-panel" style="flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('checkCircle', 13, '#9a5b00')}<span>Alur Persetujuan DoA Maker-Checker-Approver · Tiket Aktif DOA-2611-42 (Write-Off &amp; Klaim J&amp;T · Rp 38.450.000)</span></div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('SLA Sisa 02j 14m', 'warn')}
        <span class="e-btn e-btn-danger">Tolak / Revisi</span>
        <span class="e-btn e-btn-primary">${ic('check', 11)}Setujui L2 (VP)</span>
      </div>
    </div>
    <div class="e-panel-body" style="padding:8px 10px;">
      <div class="doa-stepper">
        <div class="doa-step done">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:10.5px;color:#047857;">1. MAKER · PENGAJUAN</strong>
            ${badge('Selesai', 'ok')}
          </div>
          <div style="font-size:11px;font-weight:700;">D. Santoso · Staff RMA Gudang</div>
          <div style="font-size:9.6px;color:#57534e;">Lampiran: 40 foto rusak + berita acara J&amp;T</div>
          <div class="mono" style="font-size:9.4px;color:#047857;">22 Nov 11:18 WIB · Hash 4a8c...91</div>
        </div>
        <div class="doa-step done">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:10.5px;color:#047857;">2. CHECKER · VERIFIKASI QC</strong>
            ${badge('Disetujui', 'ok')}
          </div>
          <div style="font-size:11px;font-weight:700;">A. Wijaya · Spv QC &amp; Risiko</div>
          <div style="font-size:9.6px;color:#57534e;">Cocok dengan CCTV packing &amp; manifest 3PL</div>
          <div class="mono" style="font-size:9.4px;color:#047857;">22 Nov 13:56 WIB · Hash 0a55...20</div>
        </div>
        <div class="doa-step active">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:10.5px;color:#9a5b00;">3. APPROVER L2 · VP RISK/OPS</strong>
            ${badge('Menunggu Anda', 'warn')}
          </div>
          <div style="font-size:11px;font-weight:700;">R. Kusuma · VP Risk &amp; Reverse Logistics</div>
          <div style="font-size:9.6px;color:#57534e;">Wewenang DoA Rp 10 jt – Rp 50 jt · SLA 4 jam</div>
          <div class="mono" style="font-size:9.4px;color:#b45309;">Eskalasi otomatis ke CFO dalam 02j 14m</div>
        </div>
        <div class="doa-step wait">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:10.5px;color:#57534e;">4. POSTING ERP &amp; KLAIM 3PL</strong>
            ${badge('Otomatis', 'neutral')}
          </div>
          <div style="font-size:11px;font-weight:700;">SAP FI + Portal Klaim J&amp;T API</div>
          <div style="font-size:9.6px;color:#57534e;">Terbitkan jurnal write-off &amp; tagihan ganti rugi</div>
          <div class="mono" style="font-size:9.4px;color:#6b645c;">Menunggu tanda tangan L2</div>
        </div>
      </div>
    </div>
  </section>`;

  const doaTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:84px;">Tiket DoA</th>
        <th style="width:124px;">Kategori</th>
        <th style="width:118px;">Entitas</th>
        <th style="width:184px;">Ringkasan Permintaan</th>
        <th class="num" style="width:116px;">Eksposur</th>
        <th style="width:72px;">Maker</th>
        <th style="width:72px;">Checker</th>
        <th style="width:82px;">SLA</th>
        <th style="width:88px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${DOA_QUEUE.map(
        (d) => `<tr class="${d.selected ? 'is-selected' : d.status === 'Ditolak' ? 'is-bad' : ''}">
          <td class="mono" style="font-weight:700;">${esc(d.id)}</td>
          <td><strong>${esc(d.type)}</strong></td>
          <td>${esc(d.entity)}</td>
          <td>${esc(d.desc)}</td>
          <td class="num mono">${d.amount > 0 ? fmtIdr(d.amount) : 'Non-Fin'}</td>
          <td>${esc(d.maker)}</td>
          <td>${esc(d.checker)}</td>
          <td class="mono" style="font-size:9.6px;">${esc(d.sla)}</td>
          <td>${badge(d.status, d.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4">TOTAL ANTREAN DOA P11 (16 TIKET · ${TOTAL_DOA_PENDING} MENUNGGU)</td>
        <td class="num mono">${fmtIdr(TOTAL_DOA_EXPOSURE)}</td>
        <td colspan="4" class="mono">8 Disetujui · 7 Menunggu · 1 Ditolak</td>
      </tr>
    </tfoot>
  </table>`;

  const matrixTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:128px;">Jenis Keputusan</th>
        <th style="width:92px;">Batas Nilai</th>
        <th style="width:96px;">Approver</th>
        <th style="width:52px;">SLA</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>Restock / Repack B</strong></td><td class="mono">&lt;= Rp 10 jt</td><td>L1 · RMA Mgr</td><td class="mono">4 jam</td></tr>
      <tr><td><strong>Write-Off &amp; Klaim 3PL</strong></td><td class="mono">Rp 10–50 jt</td><td>L2 · VP Ops/Fin</td><td class="mono">4 jam</td></tr>
      <tr><td><strong>Nota Retur CoreTax</strong></td><td class="mono">&gt; Rp 25 jt</td><td>L2 · Tax Mgr</td><td class="mono">6 jam</td></tr>
      <tr><td><strong>Ubah Ambang Skor COD</strong></td><td class="mono">Semua</td><td>L2 · VP Risk</td><td class="mono">4 jam</td></tr>
      <tr><td><strong>Unmask PII Nomor HP</strong></td><td class="mono">Audit UU PDP</td><td>L2 · DPO/Legal</td><td class="mono">2 jam</td></tr>
      <tr><td><strong>Write-Off Korporat</strong></td><td class="mono">&gt; Rp 50 jt</td><td>L3 · CFO Grup</td><td class="mono">24 jam</td></tr>
    </tbody>
  </table>`;

  const contentHtml = `${stepperPanel}
    <div style="display:grid;grid-template-columns:1.9fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 13, '#9a5b00')}<span>Antrean Persetujuan DoA &amp; Eskalasi Klaim Kurir (16 Tiket Aktif &amp; Riwayat)</span></div>
          <span class="e-panel-sub">Segregasi Tugas Maker != Checker != Approver Terkunci</span>
        </div>
        <div class="e-panel-body-flush">${doaTable}
          <div style="padding:9px 11px;background:#faf8f4;border-top:1px solid #ddd6cb;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:1;align-items:center;">
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">ANTREAN L2 · VP RISK/OPS</div>
              <div class="mono" style="font-size:12.5px;font-weight:800;color:#9a5b00;">3 tiket · Rp 78,45 jt</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">ANTREAN L1 · RISK &amp; RMA MGR</div>
              <div class="mono" style="font-size:12.5px;font-weight:800;color:#b45309;">4 tiket · Rp 72,37 jt</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">MEDIAN WAKTU PERSETUJUAN</div>
              <div class="mono" style="font-size:12.5px;font-weight:800;color:#047857;">01j 48m (SLA 4j)</div>
            </div>
            <div style="background:#ffffff;border:1px solid #ddd6cb;border-radius:3px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#6b645c;font-weight:600;">KEPATUHAN SOD &amp; AUDIT</div>
              <div class="mono" style="font-size:12.5px;font-weight:800;color:#047857;">100% SHA-256</div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Matriks Kewenangan DoA Korporat (SK Direksi)</span></div>
            ${badge('v2026.2', 'accent')}
          </div>
          <div class="e-panel-body-flush">${matrixTable}
            <div style="padding:9px 10px;background:#faf8f4;border-top:1px solid #ece7df;flex:1;display:flex;flex-direction:column;gap:6px;">
              <div style="font-size:9.8px;font-weight:700;color:#1c1917;">KONTROL KEPATUHAN INTERNAL (SOD)</div>
              <div class="rg-kv">
                <span class="rg-kv-k">Self-Approval</span><span class="rg-kv-v" style="color:#047857;">Diblokir Keras (0 pelanggaran)</span>
                <span class="rg-kv-k">SLA Tepat Waktu</span><span class="rg-kv-v mono">96,8% (&lt; 4 jam)</span>
                <span class="rg-kv-k">Delegasi Aktif</span><span class="rg-kv-v">Tax Mgr -&gt; Deputy (22–24 Nov)</span>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="height:220px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#be123c')}<span>Ringkasan Klaim Ganti Rugi 3PL (P11)</span></div>
            <span class="mono" style="font-size:10px;font-weight:700;color:#9a5b00;">Rp 100,0 jt</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;">
            ${svgStackedBarChart({
              width: 470,
              height: 165,
              categories: ['J&T', 'JNE', 'Ninja', 'SiCepat'],
              yMax: 48,
              yFormat: (v) => `${Math.round(v)} jt`,
              series: [
                { label: 'Disetujui 3PL', color: '#047857', values: [26, 15, 13, 8] },
                { label: 'Proses Mediasi', color: '#9a5b00', values: [12, 7, 6, 2] },
                { label: 'Eskalasi DoA', color: '#be123c', values: [4.6, 2.8, 2.4, 1.2] },
              ],
            })}
          </div>
        </section>
      </div>
    </div>`;

  return renderShell({
    activeSlug: 'p7',
    title: meta.pages[6].title,
    actionsHtml: `<span class="e-btn">Kelola Delegasi Cuti</span><span class="e-btn e-btn-primary">${ic('checkCircle', 11)}Setujui Batch Terpilih</span>`,
    contentHtml,
  });
}

// ============================================================================
// PAGE 8: KEPATUHAN UU PDP PP 33/2026, AUDIT WORM SHA-256 & WEBHOOK 3PL
// ============================================================================
function renderPage8() {
  const topRow = `<div style="display:grid;grid-template-columns:1fr 1.22fr 1fr;gap:9px;height:244px;flex-shrink:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('lock', 13, '#9a5b00')}<span>Kepatuhan UU PDP (UU 27/2022 &amp; PP 33/2026)</span></div>
        ${badge('Patuh 100%', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
        <div class="rg-kv">
          <span class="rg-kv-k">Masking Nomor HP</span><span class="rg-kv-v mono">0813****892 (Default UI)</span>
          <span class="rg-kv-k">Enkripsi PII DB</span><span class="rg-kv-v mono">PostgreSQL AES-256-GCM</span>
          <span class="rg-kv-k">Retensi Video CCTV</span><span class="rg-kv-v">90 Hari -&gt; Auto-Purge WORM</span>
          <span class="rg-kv-k">Retensi Log Audit</span><span class="rg-kv-v">7 Tahun (UU KUP / CoreTax)</span>
          <span class="rg-kv-k">Lokasi Data (ID)</span><span class="rg-kv-v">DCI Jakarta JK5 (Sovereign)</span>
          <span class="rg-kv-k">Akses Unmask PII</span><span class="rg-kv-v">Wajib Tiket DoA L2 + Log</span>
          <span class="rg-kv-k">Hak Hapus Subjek</span><span class="rg-kv-v" style="color:#047857;">0 Tertunda (SLA 72 jam OK)</span>
        </div>
        <div style="margin-top:auto;padding:6px 8px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;font-size:9.8px;color:#065f46;">
          <strong>Verifikasi DPO:</strong> Seluruh payload WhatsApp &amp; webhook 3PL bebas NIK/NPWP pribadi pembeli.
        </div>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('server', 13, '#9a5b00')}<span>Kesehatan Webhook 3PL &amp; Konektor WA Business API</span></div>
        <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">DLQ: 0 event</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:128px;">Konektor Eksternal</th>
              <th style="width:82px;">Auth</th>
              <th class="num" style="width:66px;">p95</th>
              <th class="num" style="width:62px;">Uptime</th>
              <th style="width:74px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>J&amp;T Webhook v3</strong></td><td class="mono">HMAC-256</td><td class="num mono">142 ms</td><td class="num mono">99,94%</td><td>${badge('Sehat', 'ok')}</td></tr>
            <tr><td><strong>JNE COD Status API</strong></td><td class="mono">OAuth2</td><td class="num mono">188 ms</td><td class="num mono">99,88%</td><td>${badge('Sehat', 'ok')}</td></tr>
            <tr><td><strong>Ninja Xpress Hook</strong></td><td class="mono">HMAC-256</td><td class="num mono">126 ms</td><td class="num mono">99,96%</td><td>${badge('Sehat', 'ok')}</td></tr>
            <tr><td><strong>SiCepat Tracking</strong></td><td class="mono">API Key</td><td class="num mono">164 ms</td><td class="num mono">99,91%</td><td>${badge('Sehat', 'ok')}</td></tr>
            <tr><td><strong>Meta WA Cloud API</strong></td><td class="mono">Bearer</td><td class="num mono">218 ms</td><td class="num mono">99,98%</td><td>${badge('Sehat', 'ok')}</td></tr>
            <tr><td><strong>SAP S/4HANA &amp; CoreTax</strong></td><td class="mono">mTLS</td><td class="num mono">264 ms</td><td class="num mono">99,95%</td><td>${badge('Sinkron', 'info')}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('users', 13, '#9a5b00')}<span>Matriks RBAC &amp; Hak Akses Operasional</span></div>
        <span class="e-panel-sub">SSO SAML 2.0 + MFA</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:118px;">Peran (Role)</th>
              <th class="num" style="width:40px;">User</th>
              <th style="width:72px;">PII HP</th>
              <th style="width:82px;">DoA Tier</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>VP Risk &amp; RMA</strong></td><td class="num mono">2</td><td>Masking</td><td>${badge('L2 Approver', 'accent')}</td></tr>
            <tr><td><strong>Operator CS WA</strong></td><td class="num mono">14</td><td>Masking</td><td>${badge('Maker', 'neutral')}</td></tr>
            <tr><td><strong>QC Gudang RMA</strong></td><td class="num mono">9</td><td>Tanpa HP</td><td>${badge('Maker QC', 'neutral')}</td></tr>
            <tr><td><strong>Finance &amp; Tax</strong></td><td class="num mono">5</td><td>Masking</td><td>${badge('L2 Tax/Fin', 'info')}</td></tr>
            <tr><td><strong>DPO / Auditor</strong></td><td class="num mono">2</td><td>Unmask+DoA</td><td>${badge('Read WORM', 'ok')}</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>`;

  const auditTable = `<table class="e-table">
    <thead>
      <tr>
        <th style="width:58px;">Seq</th>
        <th style="width:62px;">WIB</th>
        <th style="width:104px;">Aktor</th>
        <th style="width:116px;">Event</th>
        <th style="width:128px;">Objek Target</th>
        <th style="width:236px;">Detail Transaksi Immutable</th>
        <th style="width:84px;">SHA-256</th>
      </tr>
    </thead>
    <tbody>
      ${AUDIT_LOGS.map(
        (a) => `<tr>
          <td class="mono" style="font-weight:700;">${esc(a.seq)}</td>
          <td class="mono">${esc(a.ts)}</td>
          <td><strong>${esc(a.actor)}</strong></td>
          <td>${badge(a.event, a.tone)}</td>
          <td class="mono" style="font-size:9.8px;">${esc(a.target)}</td>
          <td>${esc(a.detail)}</td>
          <td class="mono" style="font-size:9.6px;color:#047857;">${esc(a.hash)}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5">RANTAI HASH WORM TERVERIFIKASI: #88408 -&gt; #88421 · 0 ANOMALI</td>
        <td colspan="2" class="num mono" style="color:#047857;">S3 Object Lock Aktif</td>
      </tr>
    </tfoot>
  </table>`;

  const webhookJson = `{
  "event": "RTS_DELIVERED_WAREHOUSE",
  "carrier": "JNT_EXPRESS_ID",
  "awb": "JP882144",
  "rma_ref": "RTS-088",
  "warehouse": "JKT-CAKUNG-DOCK-B2",
  "seal_status": "INTACT_VERIFIED",
  "qc_disposition": "RESTOCK_GRADE_A",
  "wms_delta": "+1",
  "hmac_verified": true,
  "received_at": "2026-11-22T14:21:18+07:00"
}`;

  const spanChart = svgSpanWaterfall({
    width: 550,
    totalMs: 240,
    spans: [
      { label: 'HMAC Signature & Auth', start: 0, dur: 14, color: '#0369a1' },
      { label: 'COD Risk Scoring (.NET 9)', start: 14, dur: 38, color: '#9a5b00' },
      { label: 'PostgreSQL RMA Commit', start: 52, dur: 29, color: '#047857' },
      { label: 'WORM SHA-256 Chain', start: 81, dur: 19, color: '#57534e' },
      { label: 'Meta WA API Dispatch', start: 100, dur: 118, color: '#b45309' },
    ],
  });

  const contentHtml = `${topRow}
    <div style="display:grid;grid-template-columns:1.52fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Jejak Audit WORM Berantai SHA-256 (14 Kejadian Terakhir · Zero Tamper)</span></div>
          ${badge('Rantai Hash Valid · #88408–#88421', 'ok')}
        </div>
        <div class="e-panel-body-flush">${auditTable}</div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#9a5b00')}<span>Inspektor Payload 3PL Webhook (RTS-088 · #JP882144)</span></div>
            ${badge('HTTP 200 · HMAC OK', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            <div class="rg-code" style="flex:1;">${esc(webhookJson)}</div>
          </div>
        </section>

        <section class="e-panel" style="height:224px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#9a5b00')}<span>Waterfall Latensi Pipeline .NET 9 &amp; WA API (Total 218 ms)</span></div>
            <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">SLA &lt; 500 ms</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;">
            ${spanChart}
          </div>
        </section>
      </div>
    </div>`;

  return renderShell({
    activeSlug: 'p8',
    title: meta.pages[7].title,
    actionsHtml: `<span class="e-btn">Verifikasi Rantai SHA-256</span><span class="e-btn e-btn-primary">${ic('download', 11)}Unduh Paket Audit DPO</span>`,
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
    { slug: 'p6', title: meta.pages[5].title, html: renderPage6() },
    { slug: 'p7', title: meta.pages[6].title, html: renderPage7() },
    { slug: 'p8', title: meta.pages[7].title, html: renderPage8() },
  ];
}
