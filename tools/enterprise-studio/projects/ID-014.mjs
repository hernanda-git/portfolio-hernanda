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
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-014',
  name: 'BPRCore Cloud',
  reference: 'SAP S/4HANA Fiori Horizon + Temenos Transact Desktop',
  persona: 'Ir. Hendra Wijaya · Pimpinan Operasional · PT BPR Nusantara Jaya (Sandi OJK 601842)',
  pages: [
    { slug: 'p1', title: 'Ringkasan Eksekutif & Konsolidasi Cabang' },
    { slug: 'p2', title: 'Stasiun Teller Keyboard-First & Mutasi Kas' },
    { slug: 'p3', title: 'Portofolio Kredit, Aging Kolektibilitas & PPAP' },
    { slug: 'p4', title: 'Validator & Generator Pelaporan OJK SLIK & APOLO' },
    { slug: 'p5', title: 'Batch EOD Akrual, General Ledger & Trial Balance' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY RECONCILED ACROSS P1–P5)
// ============================================================================

const BRANCHES = [
  { code: '001', name: 'KC Bekasi (Kantor Pusat Ops)', type: 'KC', fas: 812, bd: 14620000000, npl: 418420000, dpk: 16920000000, ppap: 389140000, lagMs: 14, offlineQ: 0, wal: 'LSN 4A/91F0C', partMb: 1840, sync: 'Sinkron', tone: 'ok' },
  { code: '002', name: 'KCP Cikarang Utara', type: 'KCP', fas: 624, bd: 10940000000, npl: 361020000, dpk: 12680000000, ppap: 316280000, lagMs: 28, offlineQ: 0, wal: 'LSN 4A/91E94', partMb: 1392, sync: 'Sinkron', tone: 'ok' },
  { code: '003', name: 'KCP Karawang Barat', type: 'KCP', fas: 496, bd: 8640000000, npl: 285120000, dpk: 9960000000, ppap: 249150000, lagMs: 42, offlineQ: 0, wal: 'LSN 4A/91E20', partMb: 1128, sync: 'Sinkron', tone: 'ok' },
  { code: '004', name: 'KCP Tambun Selatan', type: 'KCP', fas: 364, bd: 5680000000, npl: 176080000, dpk: 6720000000, ppap: 158890000, lagMs: 36, offlineQ: 0, wal: 'LSN 4A/91DE8', partMb: 842, sync: 'Sinkron', tone: 'ok' },
  { code: '005', name: 'KCP Cibitung', type: 'KCP', fas: 268, bd: 4240000000, npl: 132480000, dpk: 4940000000, ppap: 119760000, lagMs: 64, offlineQ: 0, wal: 'LSN 4A/91D72', partMb: 618, sync: 'Sinkron', tone: 'ok' },
  { code: '006', name: 'KK Pasar Baru Bekasi', type: 'KK', fas: 162, bd: 2620000000, npl: 84800000, dpk: 3080000000, ppap: 75200000, lagMs: 118, offlineQ: 0, wal: 'LSN 4A/91C4A', partMb: 394, sync: 'Stabil-4G', tone: 'info' },
  { code: '007', name: 'KK Kawasan Jababeka', type: 'KK', fas: 114, bd: 1860000000, npl: 58400000, dpk: 2120000000, ppap: 53800000, lagMs: 84, offlineQ: 0, wal: 'LSN 4A/91C08', partMb: 286, sync: 'Sinkron', tone: 'ok' },
];

const KOLEKTIBILITAS = [
  { kol: 'Kol-1', label: 'Lancar', dpd: '0 DPD', fas: 2584, bd: 43923680000, rate: '0,5% Umum', ppap: 219618400, tone: 'ok', color: '#1d4ed8' },
  { kol: 'Kol-2', label: 'DPK', dpd: '1–90 DPD', fas: 178, bd: 3160000000, rate: '10% Net NLA', ppap: 268400000, tone: 'warn', color: '#d97706' },
  { kol: 'Kol-3', label: 'Kurang Lancar', dpd: '91–120 DPD', fas: 44, bd: 782400000, rate: '50% Net NLA', ppap: 312960000, tone: 'bad', color: '#ea580c' },
  { kol: 'Kol-4', label: 'Diragukan', dpd: '121–180 DPD', fas: 21, bd: 438920000, rate: '75% Net NLA', ppap: 298465600, tone: 'bad', color: '#be123c' },
  { kol: 'Kol-5', label: 'Macet', dpd: '>180 DPD', fas: 13, bd: 295000000, rate: '100% Net NLA', ppap: 262776000, tone: 'bad', color: '#881337' },
];

const DOA_QUEUE = [
  {
    id: 'DOA-2611-084',
    title: 'Pencairan KMK — PT Karya Baja Cikarang',
    branch: 'KCP Cikarang [002]',
    nominal: 450000000,
    maker: 'R. Kurnia (AO)',
    checker: 'D. Pratama (Kasi)',
    approver: 'Dir. Bisnis',
    step: 2,
    sla: 'Sisa 18 mnt',
    tone: 'warn',
    tag: 'Plafon > Rp 300jt',
  },
  {
    id: 'DOA-2611-083',
    title: 'Restrukturisasi Kol-2 — KRD-8744 Ibu Ratna',
    branch: 'KC Bekasi [001]',
    nominal: 18200000,
    maker: 'B. Santoso (AO)',
    checker: 'H. Wijaya (Pinca)',
    approver: 'Komite Kredit',
    step: 2,
    sla: 'Sisa 42 mnt',
    tone: 'accent',
    tag: 'Resched 12B',
  },
  {
    id: 'DOA-2611-082',
    title: 'Override Limit Kas Teller TLR-02 (+Rp 150jt)',
    branch: 'KCP Karawang [003]',
    nominal: 150000000,
    maker: 'N. Lestari (TLR)',
    checker: 'S. Mulyadi (Spv)',
    approver: 'Pinca Karawang',
    step: 3,
    sla: 'Menunggu PIN',
    tone: 'info',
    tag: 'Vault Dual-Key',
  },
  {
    id: 'DOA-2611-081',
    title: 'Pencairan Deposito Break — DEP-1988 CV Maju',
    branch: 'KC Bekasi [001]',
    nominal: 200000000,
    maker: 'S. Rahmawati',
    checker: 'H. Wijaya (Pinca)',
    approver: 'Pinca Bekasi',
    step: 3,
    sla: 'Siap Otorisasi',
    tone: 'ok',
    tag: 'Penalti 0,5%',
  },
];

// Page 2: Teller TLR-01 Siti Rahmawati (20 transactions, mathematically reconciled)
const TELLER_OPENING_CASH = 225000000;
const TELLER_LIMIT_CASH = 500000000;

const TELLER_TX = [
  { ref: 'TRX-2011-0142', time: '14:48:12', sandi: '310', acct: 'KRD-8821', nasabah: 'CV Berkah Jaya (Angsuran KMK)', channel: 'Tunai', cashIn: 12450000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok', selected: true },
  { ref: 'TRX-2011-0141', time: '14:42:05', sandi: '201', acct: 'DEP-2190', nasabah: 'H. Santoso (ARO Deposito 6B · 5,75%)', channel: 'Pindah Buku', cashIn: 0, cashOut: 0, nonCash: 500000000, auth: 'Spv-01 OK', tone: 'ok' },
  { ref: 'TRX-2011-0140', time: '14:35:48', sandi: '101', acct: 'TAB-4410', nasabah: 'UD Sumber Rejeki (Setor Tabungan)', channel: 'Tunai', cashIn: 38500000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0139', time: '14:28:19', sandi: '102', acct: 'TAB-4102', nasabah: 'CV Karya Mandiri (Tarik Tunai Kas)', channel: 'Tunai', cashIn: 0, cashOut: 25000000, nonCash: 0, auth: 'Spv-01 OK', tone: 'warn' },
  { ref: 'TRX-2011-0138', time: '14:19:02', sandi: '410', acct: 'QRS-1120', nasabah: 'Settlement QRIS Pasar Baru (42 trx)', channel: 'QRIS-BI', cashIn: 0, cashOut: 0, nonCash: 68400000, auth: 'Auto-Batch', tone: 'info' },
  { ref: 'TRX-2011-0137', time: '14:11:34', sandi: '310', acct: 'KRD-8744', nasabah: 'Ibu Ratna (Bayar Sebagian DPK 34D)', channel: 'Tunai', cashIn: 2400000, cashOut: 0, nonCash: 0, auth: 'AO-Verified', tone: 'warn' },
  { ref: 'TRX-2011-0136', time: '13:58:21', sandi: '101', acct: 'TAB-4388', nasabah: 'Koperasi Makmur Bekasi (Setor Tunai)', channel: 'Tunai', cashIn: 27000000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0135', time: '13:47:09', sandi: '312', acct: 'KRD-8510', nasabah: 'PT Sinar Logam (Auto-Debet Angsuran)', channel: 'Pindah Buku', cashIn: 0, cashOut: 0, nonCash: 84600000, auth: 'System-GL', tone: 'info' },
  { ref: 'TRX-2011-0134', time: '13:34:55', sandi: '102', acct: 'TAB-4195', nasabah: 'Bpk. Suparman (Tarik Tunai Tabungan)', channel: 'Tunai', cashIn: 0, cashOut: 12500000, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0133', time: '13:22:40', sandi: '101', acct: 'TAB-4512', nasabah: 'Toko Besi Jaya Abadi (Setor Tunai)', channel: 'Tunai', cashIn: 42800000, cashOut: 0, nonCash: 0, auth: 'Spv-01 OK', tone: 'ok' },
  { ref: 'TRX-2011-0132', time: '13:09:16', sandi: '205', acct: 'DEP-2041', nasabah: 'Ibu Kartini (Pencairan Bunga Deposito)', channel: 'Tunai', cashIn: 0, cashOut: 3700000, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0131', time: '11:52:08', sandi: '310', acct: 'KRD-8605', nasabah: 'Bengkel Harapan Motor (Angsuran KI)', channel: 'Tunai', cashIn: 6850000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0130', time: '11:39:44', sandi: '102', acct: 'TAB-4280', nasabah: 'Apotek Sentosa Bekasi (Tarik Tunai)', channel: 'Tunai', cashIn: 0, cashOut: 18000000, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0129', time: '11:24:11', sandi: '108', acct: 'PBK-0812', nasabah: 'RS Cikarang Medika (Pindah Buku Payroll)', channel: 'Pindah Buku', cashIn: 0, cashOut: 0, nonCash: 54500000, auth: 'Spv-01 OK', tone: 'info' },
  { ref: 'TRX-2011-0128', time: '11:08:53', sandi: '101', acct: 'TAB-4601', nasabah: 'Klinik Sehat Bekasi (Setor Harian)', channel: 'Tunai', cashIn: 19450000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0127', time: '10:51:27', sandi: '301', acct: 'KRD-9004', nasabah: 'Bpk. Hendri Wijaya (Pencairan Mikro)', channel: 'Tunai', cashIn: 0, cashOut: 20000000, nonCash: 0, auth: 'Pinca-OK', tone: 'accent' },
  { ref: 'TRX-2011-0126', time: '10:36:04', sandi: '310', acct: 'KRD-8912', nasabah: 'CV Mitra Pangan Nusantara (Angsuran)', channel: 'Tunai', cashIn: 16200000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0125', time: '10:18:39', sandi: '410', acct: 'QRS-1121', nasabah: 'Settlement QRIS Jababeka (29 trx)', channel: 'QRIS-BI', cashIn: 0, cashOut: 0, nonCash: 35000000, auth: 'Auto-Batch', tone: 'info' },
  { ref: 'TRX-2011-0124', time: '09:54:12', sandi: '102', acct: 'TAB-4330', nasabah: 'Bpk. Dedi Kurniawan (Tarik Tunai)', channel: 'Tunai', cashIn: 0, cashOut: 12000000, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
  { ref: 'TRX-2011-0123', time: '09:32:07', sandi: '101', acct: 'TAB-4690', nasabah: 'Paguyuban Pasar Induk (Setor Tunai)', channel: 'Tunai', cashIn: 19000000, cashOut: 0, nonCash: 0, auth: 'Auto-OK', tone: 'ok' },
];

const CASH_DENOMS = [
  { label: 'Rp 100.000', unit: 100000, qty: 2140, kind: 'Kertas' },
  { label: 'Rp 50.000', unit: 50000, qty: 1620, kind: 'Kertas' },
  { label: 'Rp 20.000', unit: 20000, qty: 740, kind: 'Kertas' },
  { label: 'Rp 10.000', unit: 10000, qty: 520, kind: 'Kertas' },
  { label: 'Rp 5.000', unit: 5000, qty: 480, kind: 'Kertas' },
  { label: 'Rp 2.000', unit: 2000, qty: 380, kind: 'Kertas' },
  { label: 'Rp 1.000', unit: 1000, qty: 240, kind: 'Kertas' },
  { label: 'Rp 500', unit: 500, qty: 100, kind: 'Logam' },
];

// Page 3: Credit Portfolio Priority Grid (18 facilities from 2.840 total)
const LOANS = [
  { id: 'KRD-8821', debitur: 'CV Berkah Jaya', produk: 'KMK · 36B', branch: '001', plafon: 350000000, bd: 241500000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM Ruko', taksasi: 520000000, ppap: 1207500 },
  { id: 'KRD-8744', debitur: 'Ibu Ratna (Pasar Baru)', produk: 'Mikro · Mingguan', branch: '001', plafon: 45000000, bd: 18200000, dpd: 34, kol: 'Kol-2', tone: 'warn', agunan: 'SHGB Kios', taksasi: 32000000, ppap: 1020000, selected: true },
  { id: 'KRD-8690', debitur: 'PT Sinar Logam Utama', produk: 'KI · 48B', branch: '002', plafon: 850000000, bd: 612000000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM Pabrik', taksasi: 1350000000, ppap: 3060000 },
  { id: 'KRD-8612', debitur: 'UD Karya Tani Makmur', produk: 'KMK · 24B', branch: '003', plafon: 220000000, bd: 148600000, dpd: 96, kol: 'Kol-3', tone: 'bad', agunan: 'SHM Gudang', taksasi: 195000000, ppap: 49300000, warn: true },
  { id: 'KRD-8548', debitur: 'CV Mitra Pangan Nusantara', produk: 'KMK · 36B', branch: '001', plafon: 420000000, bd: 294800000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM Tanah', taksasi: 610000000, ppap: 1474000 },
  { id: 'KRD-8491', debitur: 'Bpk. Agus Setiawan', produk: 'Kredit Multiguna', branch: '004', plafon: 125000000, bd: 89400000, dpd: 48, kol: 'Kol-2', tone: 'warn', agunan: 'SHM Rumah', taksasi: 165000000, ppap: 3840000 },
  { id: 'KRD-8432', debitur: 'Toko Bangunan Harapan', produk: 'KMK · 24B', branch: '002', plafon: 300000000, bd: 186500000, dpd: 134, kol: 'Kol-4', tone: 'bad', agunan: 'SHM + BPKB', taksasi: 210000000, ppap: 91875000, bad: true },
  { id: 'KRD-8389', debitur: 'Klinik Medika Tambun', produk: 'KI · 60B', branch: '004', plafon: 600000000, bd: 472000000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM Klinik', taksasi: 920000000, ppap: 2360000 },
  { id: 'KRD-8315', debitur: 'CV Trans Jaya Ekspedisi', produk: 'KI Armada', branch: '003', plafon: 480000000, bd: 214000000, dpd: 108, kol: 'Kol-3', tone: 'bad', agunan: 'BPKB 4 Truk', taksasi: 260000000, ppap: 68500000, warn: true },
  { id: 'KRD-8274', debitur: 'Ibu Siti Aminah (Konveksi)', produk: 'Mikro · 18B', branch: '006', plafon: 75000000, bd: 41800000, dpd: 21, kol: 'Kol-2', tone: 'warn', agunan: 'BPKB Mobil', taksasi: 68000000, ppap: 2140000 },
  { id: 'KRD-8210', debitur: 'H. Ridwan (Agen Sembako)', produk: 'KMK · 24B', branch: '005', plafon: 260000000, bd: 164200000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'Deposito', taksasi: 200000000, ppap: 0 },
  { id: 'KRD-8162', debitur: 'Bengkel Las Mandiri', produk: 'Mikro · 24B', branch: '005', plafon: 90000000, bd: 54600000, dpd: 212, kol: 'Kol-5', tone: 'bad', agunan: 'BPKB Pick-Up', taksasi: 42000000, ppap: 44100000, bad: true },
  { id: 'KRD-8118', debitur: 'CV Graha Elektrikal', produk: 'KMK · 36B', branch: '007', plafon: 380000000, bd: 258000000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM Kantor', taksasi: 540000000, ppap: 1290000 },
  { id: 'KRD-8084', debitur: 'Apotek Prima Karawang', produk: 'KMK · 24B', branch: '003', plafon: 180000000, bd: 112400000, dpd: 62, kol: 'Kol-2', tone: 'warn', agunan: 'SHGB Ruko', taksasi: 220000000, ppap: 4620000 },
  { id: 'KRD-8041', debitur: 'Bpk. Bambang Sutrisno', produk: 'Multiguna ASN', branch: '001', plafon: 150000000, bd: 98500000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SK PNS + SHM', taksasi: 240000000, ppap: 492500 },
  { id: 'KRD-7992', debitur: 'UD Mandiri Kemasan', produk: 'KI · 36B', branch: '007', plafon: 320000000, bd: 162800000, dpd: 146, kol: 'Kol-4', tone: 'bad', agunan: 'Mesin + SHGB', taksasi: 180000000, ppap: 86850000, bad: true },
  { id: 'KRD-7948', debitur: 'Koperasi Karyawan Jababeka', produk: 'KMK · 36B', branch: '002', plafon: 500000000, bd: 342000000, dpd: 0, kol: 'Kol-1', tone: 'ok', agunan: 'SHM + Cessie', taksasi: 710000000, ppap: 1710000 },
  { id: 'KRD-7895', debitur: 'Bpk. Wahyu Hidayat', produk: 'Mikro · 12B', branch: '006', plafon: 35000000, bd: 24500000, dpd: 194, kol: 'Kol-5', tone: 'bad', agunan: 'BPKB Motor 2', taksasi: 18000000, ppap: 20000000, bad: true },
];

const RATNA_HISTORY = [
  { tgl: '16 Nov 2026', ke: '29/36', tagihan: 1185000, bayar: 2400000, dpd: '34 DPD', note: 'Bayar sebagian (loket)', tone: 'warn' },
  { tgl: '09 Nov 2026', ke: '28/36', tagihan: 1185000, bayar: 0, dpd: '41 DPD', note: 'Tunggakan · Visit AO', tone: 'bad' },
  { tgl: '02 Nov 2026', ke: '27/36', tagihan: 1185000, bayar: 0, dpd: '34 DPD', note: 'Janji bayar 16 Nov', tone: 'bad' },
  { tgl: '26 Okt 2026', ke: '26/36', tagihan: 1185000, bayar: 0, dpd: '27 DPD', note: 'SP-1 Terkirim', tone: 'warn' },
  { tgl: '19 Okt 2026', ke: '25/36', tagihan: 1185000, bayar: 600000, dpd: '20 DPD', note: 'Parsial Rp 600rb', tone: 'warn' },
  { tgl: '12 Okt 2026', ke: '24/36', tagihan: 1185000, bayar: 1185000, dpd: '0 DPD', note: 'Lunas tepat waktu', tone: 'ok' },
];

// Page 4: OJK SLIK, APOLO & LPS Segments
const SLIK_SEGMENTS = [
  { seg: 'SLIK-F01', name: 'Fasilitas Kredit / Pembiayaan Aktif', rows: 2840, err: 0, warn: 1, sha: '9f4a82c1e0', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'SLIK-D01', name: 'Data Pokok Debitur Perorangan (NIK)', rows: 2412, err: 0, warn: 1, sha: '7c1b39d4a2', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'SLIK-D02', name: 'Data Pokok Debitur Badan Usaha (NPWP)', rows: 194, err: 0, warn: 0, sha: '3e8f10b7c9', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'SLIK-A01', name: 'Data Agunan & Pengikatan Hak Tanggungan', rows: 2618, err: 0, warn: 1, sha: '6a2d55e1f4', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'SLIK-M01', name: 'Pengurus & Pemilik Badan Usaha', rows: 286, err: 0, warn: 0, sha: '1d9c44a8b3', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'SLIK-P01', name: 'Data Penjamin (Personal / Corporate)', rows: 62, err: 0, warn: 0, sha: '5b7e20c6d1', scope: 'SLIK', status: '100% Bersih', tone: 'ok' },
  { seg: 'APOLO-0100', name: 'Laporan Posisi Keuangan (Neraca BPR)', rows: 148, err: 0, warn: 0, sha: '8e3a19f0c5', scope: 'APOLO', status: 'Seimbang GL', tone: 'ok' },
  { seg: 'APOLO-0200', name: 'Laporan Laba Rugi & Penghasilan Komp.', rows: 64, err: 0, warn: 0, sha: '2f6c78d1e2', scope: 'APOLO', status: 'Seimbang GL', tone: 'ok' },
  { seg: 'APOLO-0600', name: 'Daftar Rincian Kredit & PPAP PSAK 71', rows: 2840, err: 0, warn: 0, sha: '4c0e93a7b8', scope: 'APOLO', status: 'Klop F01', tone: 'ok' },
  { seg: 'LPS-SCV', name: 'Single Customer View Simpanan Dijamin', rows: 6924, err: 0, warn: 0, sha: '0a5d61b9e7', scope: 'LPS', status: 'Aman <=6,75%', tone: 'ok' },
];

const OJK_RULES = [
  { id: 'SLIK-R01', rule: 'Validasi NIK 16-Digit & Match Dukcapil (D01)', result: '2.412 / 2.412 NIK valid & aktif', ms: '412 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'SLIK-R02', rule: 'Cross-Check Baki Debet F01 vs Neraca APOLO-0100', result: 'Rp 48.600.000.000 === Rp 48.600.000.000 (Delta Rp 0)', ms: '84 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'SLIK-R03', rule: 'Konsistensi Plafon Awal >= Baki Debet (F01)', result: '2.840 fasilitas konsisten (0 anomali)', ms: '36 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'SLIK-R04', rule: 'Validasi Sandi Dati II, Sektor Ekonomi & Gol. Debitur', result: '2.840 kode referensi OJK 2026 valid', ms: '62 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'SLIK-R05', rule: 'Relasi Agunan A01 & Nilai NJOP / Taksasi Independen', result: '2.618 agunan terikat (1 warning tgl taksasi >24B)', ms: '95 ms', tone: 'warn', status: '1 WARN' },
  { id: 'APOLO-R01', rule: 'Persamaan Neraca & Kecukupan PPAP Wajib (POJK 33)', result: 'PPAP Terbentuk Rp 1.362.220.000 (100,0% Wajib)', ms: '58 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'APOLO-R02', rule: 'Batas Maksimum Pemberian Kredit (BMPK) & KPMM >= 12%', result: 'CAR 22,40% · BMPK Terkait 6,20% · Non-Terkait 14,1%', ms: '41 ms', tone: 'ok', status: 'LOLOS' },
  { id: 'LPS-R01', rule: 'Kepatuhan Suku Bunga Simpanan vs TBP LPS BPR (6,75%)', result: '6.924 rekening (Max Depo 6,25% · 100% Dijamin LPS)', ms: '73 ms', tone: 'ok', status: 'LOLOS' },
];

const OJK_SUBMISSIONS = [
  { period: 'Nov 2026', paket: 'SLIK + APOLO + LPS', receipt: 'DRAFT-SIAP-UNGGAH', officer: 'H. Wijaya', ts: '20 Nov 2026 15:02', status: 'Siap Ekspor', tone: 'accent' },
  { period: 'Okt 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20261106-601842', officer: 'H. Wijaya', ts: '06 Nov 2026 09:14', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Sep 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20261007-601842', officer: 'D. Pratama', ts: '07 Okt 2026 10:42', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Agu 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20260905-601842', officer: 'H. Wijaya', ts: '05 Sep 2026 08:55', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Jul 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20260806-601842', officer: 'H. Wijaya', ts: '06 Agu 2026 11:18', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Jun 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20260707-601842', officer: 'D. Pratama', ts: '07 Jul 2026 09:30', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Mei 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20260605-601842', officer: 'H. Wijaya', ts: '05 Jun 2026 09:08', status: 'Diterima OJK', tone: 'ok' },
  { period: 'Apr 2026', paket: 'SLIK + APOLO + LPS', receipt: 'TT-OJK-20260506-601842', officer: 'D. Pratama', ts: '06 Mei 2026 10:15', status: 'Diterima OJK', tone: 'ok' },
];

// Page 5: EOD Batch Journals (14 rows = 7 balanced pairs) & Trial Balance (12 COA groups)
const EOD_JOURNALS = [
  { jid: 'EOD-261120-001', coa: '118.01', akun: 'Bunga Kredit YMH Diterima (Akrual Harian)', br: 'KONS', debit: 34860000, kredit: 0, ref: 'AKR-KRD-2840' },
  { jid: 'EOD-261120-001', coa: '401.01', akun: 'Pendapatan Bunga Kredit Yang Diberikan', br: 'KONS', debit: 0, kredit: 34860000, ref: 'AKR-KRD-2840' },
  { jid: 'EOD-261120-002', coa: '504.01', akun: 'Beban Penyisihan Penghapusan Aktiva (PPAP)', br: 'KONS', debit: 14220000, kredit: 0, ref: 'PPAP-PSAK71', highlight: true },
  { jid: 'EOD-261120-002', coa: '116.01', akun: 'Cadangan PPAP Kredit (Kontra Aktiva)', br: 'KONS', debit: 0, kredit: 14220000, ref: 'PPAP-PSAK71', highlight: true },
  { jid: 'EOD-261120-003', coa: '501.02', akun: 'Beban Bunga Deposito Berjangka (2.306 Bilyet)', br: 'KONS', debit: 18640000, kredit: 0, ref: 'AKR-DEP-2306' },
  { jid: 'EOD-261120-003', coa: '205.02', akun: 'Bunga Deposito YMH Dibayar', br: 'KONS', debit: 0, kredit: 18640000, ref: 'AKR-DEP-2306' },
  { jid: 'EOD-261120-004', coa: '501.01', akun: 'Beban Bunga Tabungan Nasabah (4.618 Rek)', br: 'KONS', debit: 6920000, kredit: 0, ref: 'AKR-TAB-4618' },
  { jid: 'EOD-261120-004', coa: '205.01', akun: 'Bunga Tabungan YMH Dibayar', br: 'KONS', debit: 0, kredit: 6920000, ref: 'AKR-TAB-4618' },
  { jid: 'EOD-261120-005', coa: '205.02', akun: 'Bunga Deposito YMH Dibayar (Potong PPh)', br: 'KONS', debit: 3728000, kredit: 0, ref: 'TAX-PPH42' },
  { jid: 'EOD-261120-005', coa: '210.04', akun: 'Hutang Pajak PPh Final Pasal 4(2) 20%', br: 'KONS', debit: 0, kredit: 3728000, ref: 'TAX-PPH42' },
  { jid: 'EOD-261120-006', coa: '208.01', akun: 'Pendapatan Provisi Kredit Tangguhan (EIR)', br: 'KONS', debit: 4172000, kredit: 0, ref: 'PSAK71-EIR' },
  { jid: 'EOD-261120-006', coa: '402.01', akun: 'Pendapatan Provisi & Komisi Kredit', br: 'KONS', debit: 0, kredit: 4172000, ref: 'PSAK71-EIR' },
  { jid: 'EOD-261120-007', coa: '105.02', akun: 'Giro Pada Bank Umum Penyelenggara QRIS', br: '001', debit: 45900000, kredit: 0, ref: 'QRIS-STL-71' },
  { jid: 'EOD-261120-007', coa: '201.05', akun: 'Dana Settlement Merchant QRIS BPR', br: '001', debit: 0, kredit: 45900000, ref: 'QRIS-STL-71' },
];

const TRIAL_BALANCE = [
  { coa: '101', name: 'Kas Kantor & Vault 7 Unit', grp: 'Aktiva', debit: 3420000000, kredit: 0 },
  { coa: '105', name: 'Penempatan Bank Lain (Giro & Depo)', grp: 'Aktiva', debit: 11840000000, kredit: 0 },
  { coa: '115', name: 'Kredit Yang Diberikan (2.840 Fas)', grp: 'Aktiva', debit: 48600000000, kredit: 0 },
  { coa: '116', name: 'Cadangan PPAP Kredit (Kontra)', grp: 'Kontra', debit: 0, kredit: 1362220000 },
  { coa: '118', name: 'Bunga YMH Diterima & Aktiva Lain', grp: 'Aktiva', debit: 1482220000, kredit: 0 },
  { coa: '130', name: 'Aset Tetap & Inventaris (Net)', grp: 'Aktiva', debit: 2840000000, kredit: 0 },
  { coa: '201', name: 'Tabungan Nasabah (4.618 Rek)', grp: 'DPK', debit: 0, kredit: 21840000000 },
  { coa: '202', name: 'Deposito Berjangka (2.306 Bilyet)', grp: 'DPK', debit: 0, kredit: 34580000000 },
  { coa: '210', name: 'Kewajiban Segera, Akrual & Pajak', grp: 'Kewajiban', debit: 0, kredit: 1420000000 },
  { coa: '301', name: 'Modal Disetor & Cadangan Umum', grp: 'Ekuitas', debit: 0, kredit: 7280000000 },
  { coa: '401', name: 'Pendapatan Bunga & Provisi (YTD)', grp: 'Pendapatan', debit: 0, kredit: 7840000000 },
  { coa: '501', name: 'Beban Bunga, PPAP & Ops (YTD)', grp: 'Beban', debit: 6140000000, kredit: 0 },
];

// Derived aggregates
const TOTAL_FAS = BRANCHES.reduce((a, b) => a + b.fas, 0);
const TOTAL_BD = BRANCHES.reduce((a, b) => a + b.bd, 0);
const TOTAL_NPL = BRANCHES.reduce((a, b) => a + b.npl, 0);
const TOTAL_DPK = BRANCHES.reduce((a, b) => a + b.dpk, 0);
const TOTAL_PPAP = BRANCHES.reduce((a, b) => a + b.ppap, 0);
const NPL_RATIO = (TOTAL_NPL / TOTAL_BD) * 100;
const LDR_RATIO = (TOTAL_BD / TOTAL_DPK) * 100;
const BOPO_RATIO = (6140000000 / 7840000000) * 100;

const TELLER_CASH_IN = TELLER_TX.reduce((a, t) => a + t.cashIn, 0);
const TELLER_CASH_OUT = TELLER_TX.reduce((a, t) => a + t.cashOut, 0);
const TELLER_NON_CASH = TELLER_TX.reduce((a, t) => a + t.nonCash, 0);
const TELLER_CLOSING_CASH = TELLER_OPENING_CASH + TELLER_CASH_IN - TELLER_CASH_OUT;
const DENOM_TOTAL = CASH_DENOMS.reduce((a, d) => a + d.unit * d.qty, 0);

const SLIK_ONLY = SLIK_SEGMENTS.filter((s) => s.scope === 'SLIK');
const TOTAL_SLIK_ROWS = SLIK_ONLY.reduce((a, s) => a + s.rows, 0);
const TOTAL_SLIK_ERR = SLIK_SEGMENTS.reduce((a, s) => a + s.err, 0);
const TOTAL_SLIK_WARN = SLIK_SEGMENTS.reduce((a, s) => a + s.warn, 0);

const EOD_DEBIT = EOD_JOURNALS.reduce((a, j) => a + j.debit, 0);
const EOD_KREDIT = EOD_JOURNALS.reduce((a, j) => a + j.kredit, 0);
const TB_DEBIT = TRIAL_BALANCE.reduce((a, t) => a + t.debit, 0);
const TB_KREDIT = TRIAL_BALANCE.reduce((a, t) => a + t.kredit, 0);

export function verifyMath() {
  if (TOTAL_FAS !== 2840) throw new Error(`Branch TOTAL_FAS=${TOTAL_FAS} !== 2840`);
  if (TOTAL_BD !== 48600000000) throw new Error(`Branch TOTAL_BD=${TOTAL_BD} !== 48600000000`);
  if (TOTAL_NPL !== 1516320000) throw new Error(`Branch TOTAL_NPL=${TOTAL_NPL} !== 1516320000`);
  if (Math.abs(NPL_RATIO - 3.12) > 0.0001) throw new Error(`NPL_RATIO=${NPL_RATIO} !== 3.12`);
  if (TOTAL_DPK !== 56420000000) throw new Error(`Branch TOTAL_DPK=${TOTAL_DPK} !== 56420000000`);
  if (TOTAL_PPAP !== 1362220000) throw new Error(`Branch TOTAL_PPAP=${TOTAL_PPAP} !== 1362220000`);

  const kolFas = KOLEKTIBILITAS.reduce((a, k) => a + k.fas, 0);
  const kolBd = KOLEKTIBILITAS.reduce((a, k) => a + k.bd, 0);
  const kolNpl = KOLEKTIBILITAS.slice(2).reduce((a, k) => a + k.bd, 0);
  const kolPpap = KOLEKTIBILITAS.reduce((a, k) => a + k.ppap, 0);
  if (kolFas !== TOTAL_FAS) throw new Error(`Kol fas=${kolFas} !== ${TOTAL_FAS}`);
  if (kolBd !== TOTAL_BD) throw new Error(`Kol bd=${kolBd} !== ${TOTAL_BD}`);
  if (kolNpl !== TOTAL_NPL) throw new Error(`Kol npl=${kolNpl} !== ${TOTAL_NPL}`);
  if (kolPpap !== TOTAL_PPAP) throw new Error(`Kol ppap=${kolPpap} !== ${TOTAL_PPAP}`);

  if (TELLER_CLOSING_CASH !== DENOM_TOTAL) {
    throw new Error(`Teller cash mismatch: closing=${TELLER_CLOSING_CASH} vs denom=${DENOM_TOTAL}`);
  }
  if (TELLER_CLOSING_CASH !== 318450000) {
    throw new Error(`Unexpected teller closing cash=${TELLER_CLOSING_CASH}`);
  }

  const f01 = SLIK_SEGMENTS.find((s) => s.seg === 'SLIK-F01');
  if (!f01 || f01.rows !== TOTAL_FAS) throw new Error(`SLIK F01 rows mismatch`);
  if (TOTAL_SLIK_ERR !== 0) throw new Error(`SLIK error count must be 0`);
  if (TOTAL_SLIK_ROWS !== 8412) throw new Error(`SLIK total rows=${TOTAL_SLIK_ROWS} !== 8412`);

  if (EOD_DEBIT !== EOD_KREDIT) throw new Error(`EOD journal unbalanced: D=${EOD_DEBIT} K=${EOD_KREDIT}`);
  if (TB_DEBIT !== TB_KREDIT) throw new Error(`Trial balance unbalanced: D=${TB_DEBIT} K=${TB_KREDIT}`);
  const tbKredit = TRIAL_BALANCE.find((t) => t.coa === '115');
  const tbPpap = TRIAL_BALANCE.find((t) => t.coa === '116');
  const tbTab = TRIAL_BALANCE.find((t) => t.coa === '201');
  const tbDep = TRIAL_BALANCE.find((t) => t.coa === '202');
  if (tbKredit.debit !== TOTAL_BD) throw new Error(`TB 115 mismatch`);
  if (tbPpap.kredit !== TOTAL_PPAP) throw new Error(`TB 116 mismatch`);
  if (tbTab.kredit + tbDep.kredit !== TOTAL_DPK) throw new Error(`TB DPK mismatch`);
}

// ============================================================================
// SHARED SAP FIORI HORIZON / DESKTOP WPF BANKING SHELL
// ============================================================================

function fmtM(n) {
  return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
}

function fmtJt(n) {
  return 'Rp ' + (n / 1e6).toFixed(2).replace('.', ',') + ' jt';
}

const BPR_CSS = `
  /* Light-First SAP Fiori Horizon + Desktop WPF Banking Chrome */
  .bpr-shell-top {
    height: 36px;
    background: #ffffff;
    border-top: 3px solid #1d4ed8;
    border-bottom: 1px solid #cbd5e1;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .bpr-top-left, .bpr-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .bpr-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 12.5px;
    color: #0f172a;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
  .bpr-logo-box {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #1d4ed8;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .bpr-sep {
    width: 1px;
    height: 16px;
    background: #cbd5e1;
    flex-shrink: 0;
  }
  .bpr-entity-pick {
    height: 24px;
    padding: 0 8px;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    background: #f8fafc;
    color: #0f172a;
    font-size: 10.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .bpr-ojk-tag {
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    color: #1e3a8a;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }
  .bpr-date-pill {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .bpr-link-pill {
    height: 24px;
    padding: 0 7px;
    border-radius: 3px;
    background: #f8fafc;
    border: 1px solid #d6dee8;
    color: #334155;
    font-family: var(--e-mono);
    font-size: 9.5px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .bpr-op {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid #cbd5e1;
    white-space: nowrap;
  }
  .bpr-op-av {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #1e3a8a;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Module Ribbon + WPF F-Key Bar */
  .bpr-ribbon {
    height: 30px;
    background: #f1f5f9;
    border-bottom: 1px solid #cbd5e1;
    padding: 0 12px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .bpr-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
  }
  .bpr-tab {
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
  .bpr-tab.is-active {
    background: #ffffff;
    color: #1d4ed8;
    border-bottom-color: #1d4ed8;
    border-left: 1px solid #cbd5e1;
    border-right: 1px solid #cbd5e1;
    font-weight: 700;
  }
  .bpr-tcode {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 0.5px 4px;
    border-radius: 2px;
    background: #e2e8f0;
    color: #334155;
    font-weight: 700;
  }
  .bpr-tab.is-active .bpr-tcode {
    background: #dbeafe;
    color: #1e3a8a;
  }
  .bpr-fkeys {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: #475569;
    white-space: nowrap;
  }
  .bpr-fkey {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .bpr-keycap {
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #94a3b8;
    color: #0f172a;
  }

  /* Page Sub-header */
  .bpr-subhead {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid #d6dee8;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .bpr-subhead-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
  }
  .bpr-subhead-sub {
    font-size: 10.5px;
    font-weight: 500;
    color: #64748b;
  }

  /* Desktop WPF Status Bar */
  .bpr-status {
    height: 24px;
    background: #e8eef5;
    border-top: 1px solid #bcc7d6;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    flex-shrink: 0;
  }
  .bpr-status-tag {
    background: #1e3a8a;
    color: #ffffff;
    padding: 1px 6px;
    border-radius: 2px;
    font-weight: 700;
    font-size: 9.2px;
    white-space: nowrap;
  }

  /* Utility layouts */
  .bpr-grid-2 {
    display: grid;
    gap: 9px;
    flex: 1;
    min-height: 0;
    min-width: 0;
  }
  .bpr-col-stack {
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-height: 0;
    min-width: 0;
  }
  .bpr-kv-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
  }
  .bpr-kv {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .bpr-kv-lbl {
    font-size: 9.5px;
    color: #64748b;
    font-weight: 600;
  }
  .bpr-kv-val {
    font-size: 11px;
    color: #0f172a;
    font-weight: 700;
  }
  .bpr-input-box {
    height: 24px;
    padding: 0 7px;
    border: 1px solid #bcc7d6;
    border-radius: 3px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
  }
  .bpr-input-box.is-focus {
    border-color: #1d4ed8;
    background: #eff6ff;
    color: #1e3a8a;
  }
  .bpr-input-box.is-readonly {
    background: #f1f5f9;
    color: #334155;
  }
  .bpr-stepper {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .bpr-step {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9.5px;
    font-weight: 600;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #475569;
    white-space: nowrap;
  }
  .bpr-step.done {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #047857;
  }
  .bpr-step.active {
    background: #eff6ff;
    border-color: #1d4ed8;
    color: #1e3a8a;
  }
  .bpr-step-line {
    height: 1.5px;
    width: 10px;
    background: #cbd5e1;
    flex-shrink: 0;
  }
  .bpr-step-line.done {
    background: #10b981;
  }
  .bpr-filter-bar {
    height: 29px;
    padding: 0 10px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .bpr-pill-tab {
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .bpr-pill-tab.active {
    background: #eff6ff;
    color: #1e3a8a;
    border-color: #bfdbfe;
  }
  .bpr-code-box {
    background: #0f172a;
    color: #e2e8f0;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.48;
    padding: 8px 10px;
    border-radius: 3px;
    overflow: hidden;
    white-space: pre;
  }
  .bpr-banner-ok {
    padding: 6px 10px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 3px;
    color: #065f46;
    font-family: var(--e-mono);
    font-size: 10.2px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .bpr-kpi-accent {
    border-top: 2.5px solid #1d4ed8;
  }
  .bpr-kpi-ok {
    border-top: 2.5px solid #047857;
  }
  .bpr-kpi-warn {
    border-top: 2.5px solid #b45309;
  }
  .bpr-kpi-bad {
    border-top: 2.5px solid #be123c;
  }
  table.e-table.tight th {
    padding: 4.5px 6px;
  }
  table.e-table.tight td {
    padding: 4px 6px;
  }
  table.e-table.tight tfoot td {
    padding: 5px 6px;
  }
  table.e-table.comfy td {
    padding: 5.5px 6px;
  }
  table.e-table.comfy th {
    padding: 5px 6px;
  }
  table.e-table.comfy tfoot td {
    padding: 6px 6px;
  }
`;

const MODULES = [
  { id: 'p1', tcode: 'EX-01', label: 'Ringkasan & Cabang', icon: 'layers' },
  { id: 'p2', tcode: 'TL-02', label: 'Teller & Kas Loket', icon: 'zap' },
  { id: 'p3', tcode: 'KR-03', label: 'Kredit & PPAP', icon: 'sliders' },
  { id: 'p4', tcode: 'SL-04', label: 'OJK SLIK & APOLO', icon: 'shield' },
  { id: 'p5', tcode: 'EO-05', label: 'Batch EOD & GL', icon: 'database' },
];

function renderBprShell({ activeId, pageTitle, pageSubtitle, actionsHtml, contentHtml, statusNote }) {
  const topbar = `<header class="bpr-shell-top">
    <div class="bpr-top-left">
      <div class="bpr-logo">
        <span class="bpr-logo-box">BC</span>
        <span>BPRCore Cloud</span>
        <span style="font-size:9.8px;font-weight:600;color:#64748b;">.NET 8 WPF Core</span>
      </div>
      <span class="bpr-sep"></span>
      <span class="bpr-ojk-tag">SANDI OJK: 601842</span>
      <div class="bpr-entity-pick">
        ${ic('layers', 12, '#1d4ed8')}
        <span>PT BPR Nusantara Jaya — KC Bekasi [001] · Konsolidasi 7 Unit</span>
        ${ic('chevronDown', 11, '#64748b')}
      </div>
    </div>
    <div class="bpr-top-right">
      <div class="bpr-date-pill">
        <span class="dot dot-ok"></span>
        <span>TGL EOD: 20-NOV-2026 · SIAP OJK</span>
      </div>
      <div class="bpr-link-pill">
        <span class="dot dot-ok"></span>
        <span>SQL-GL · Dukcapil · QRIS · OJK</span>
      </div>
      <div class="bpr-op">
        <span class="bpr-op-av">HW</span>
        <div style="line-height:1.12;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;">Ir. Hendra Wijaya</div>
          <div style="font-size:9px;color:#64748b;">Pimpinan Operasional · Level DoA-3</div>
        </div>
      </div>
    </div>
  </header>`;

  const ribbon = `<nav class="bpr-ribbon">
    <div class="bpr-tabs">
      ${MODULES.map((m) => {
        const active = m.id === activeId;
        return `<div class="bpr-tab ${active ? 'is-active' : ''}">
          <span class="bpr-tcode">${m.tcode}</span>
          ${ic(m.icon, 12, active ? '#1d4ed8' : '#64748b')}
          <span>${esc(m.label)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="bpr-fkeys">
      <span class="bpr-fkey"><span class="bpr-keycap">F2</span>Setor</span>
      <span class="bpr-fkey"><span class="bpr-keycap">F3</span>Tarik</span>
      <span class="bpr-fkey"><span class="bpr-keycap">F4</span>Angsuran</span>
      <span class="bpr-fkey"><span class="bpr-keycap">F8</span>Validasi SLIK</span>
      <span class="bpr-fkey"><span class="bpr-keycap">F9</span>EOD Akrual</span>
    </div>
  </nav>`;

  const subhead = `<div class="bpr-subhead">
    <div class="bpr-subhead-title">
      <span>${esc(pageTitle)}</span>
      <span class="bpr-sep"></span>
      <span class="bpr-subhead-sub">${esc(pageSubtitle)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:7px;">${actionsHtml}</div>
  </div>`;

  const footer = `<footer class="bpr-status">
    <div class="e-status-group">
      <span class="bpr-status-tag">CORE-GL LIVE</span>
      <span class="e-status-item"><span class="dot dot-ok"></span>SQL Server 2022 Partitioned GL (db-bpr-prod01)</span>
      <span class="e-status-item">Telerik WPF v2026.3 · Dapper ORM</span>
      <span class="e-status-item">${esc(statusNote)}</span>
    </div>
    <div class="e-status-group">
      <span class="e-status-item">Periode Buku: Nov 2026</span>
      <span class="e-status-item">WORM Audit Hash: sha256:8e3a19f0c5</span>
      <span class="e-status-item">20 Nov 2026 · 15:04:18 WIB</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `BPRCore Cloud — ${pageTitle}`,
    accent: '#1d4ed8',
    accentSoft: '#eff6ff',
    accentInk: '#1e3a8a',
    bg: '#eef2f6',
    surface: '#ffffff',
    surface2: '#f7f9fc',
    border: '#d6dee8',
    borderStrong: '#bcc7d6',
    extraCss: BPR_CSS,
    bodyHtml: `${topbar}${ribbon}${subhead}<main class="e-content">${contentHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: RINGKASAN EKSEKUTIF & KONSOLIDASI CABANG
// ============================================================================

function renderPage1() {
  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,minmax(0,1fr));">
    <div class="e-kpi bpr-kpi-accent">
      <div class="e-kpi-top"><span>Total Baki Debet</span>${badge('2.840 Fas', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtM(TOTAL_BD)}</span>
        ${svgSparkline({ points: [43.2, 44.1, 44.8, 45.5, 46.2, 46.9, 47.4, 48.0, 48.6], color: '#1d4ed8', width: 62, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>YoY +12,4%</span><span class="mono">7 Unit Kerja</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>NPL Gross (Kol 3–5)</span>${badge('Aman <5%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">${fmtPct(NPL_RATIO, 2)}</span>
        ${svgSparkline({ points: [3.68, 3.55, 3.49, 3.41, 3.35, 3.28, 3.22, 3.16, 3.12], color: '#047857', width: 62, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>Nominal ${fmtM(TOTAL_NPL)}</span><span class="mono">78 Fas NPL</span></div>
    </div>
    <div class="e-kpi bpr-kpi-accent">
      <div class="e-kpi-top"><span>Total DPK (Tab + Depo)</span>${badge('6.924 Rek', 'neutral')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtM(TOTAL_DPK)}</span>
        ${svgSparkline({ points: [51.0, 51.8, 52.4, 53.1, 53.9, 54.6, 55.2, 55.8, 56.42], color: '#0369a1', width: 62, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>Tab Rp 21,84 M</span><span class="mono">Depo Rp 34,58 M</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Rasio LDR Konsolidasi</span>${badge('Sehat', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtPct(LDR_RATIO, 2)}</span>
        ${svgSparkline({ points: [84.7, 85.1, 85.5, 85.7, 85.7, 85.9, 85.9, 86.0, 86.14], color: '#047857', width: 62, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>Batas Ideal 78–92%</span><span class="mono">Cash 14,82%</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Cadangan PPAP Terbentuk</span>${badge('100% Wajib', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtM(TOTAL_PPAP)}</span>
      </div>
      <div class="e-kpi-foot"><span>EOD +Rp 14,22 jt</span><span class="mono">PSAK 71 OK</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Validator OJK SLIK</span>${badge('Siap OJK', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">0 baris</span>
        <span class="e-badge e-badge-ok">6/6 Segmen</span>
      </div>
      <div class="e-kpi-foot"><span>8.412 baris lolos</span><span class="mono">APOLO Klop</span></div>
    </div>
  </section>`;

  const trendChart = svgMultiLineChart({
    width: 870,
    height: 262,
    xLabels: ['Des 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'Mei 26', 'Jun 26', 'Jul 26', 'Agu 26', 'Sep 26', 'Okt 26', 'Nov 26'],
    yMin: 0,
    yMax: 7.5,
    yTicks: 5,
    yFormat: (v) => v.toFixed(1).replace('.', ',') + '%',
    threshold: { value: 5.0, label: 'Batas Maks. NPL OJK (5,00%)', color: '#be123c' },
    series: [
      { label: 'NPL Gross Konsolidasi (%)', values: [3.84, 3.76, 3.68, 3.62, 3.55, 3.49, 3.41, 3.35, 3.28, 3.22, 3.16, 3.12], color: '#1d4ed8', area: true, dots: true, width: 2.1 },
      { label: 'NPL Nett Setelah PPAP (%)', values: [1.48, 1.42, 1.39, 1.34, 1.30, 1.25, 1.21, 1.16, 1.12, 1.08, 1.04, 0.98], color: '#047857', dots: true, width: 1.8 },
      { label: 'Rasio DPK / Kol-2 (%)', values: [5.40, 5.55, 5.72, 5.88, 6.02, 5.94, 6.18, 6.24, 6.36, 6.42, 6.48, 6.50], color: '#d97706', dashed: true, width: 1.7 },
    ],
    annotations: [
      { index: 11, seriesIdx: 0, label: 'Nov 26: NPL 3,12% (Rp 1,52 M)', color: '#1e3a8a', dy: -28 },
    ],
  });

  const kolMixHtml = `<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;">
    ${KOLEKTIBILITAS.map((k) => {
      const pct = (k.bd / TOTAL_BD) * 100;
      return `<div style="padding:5px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${k.color};border-radius:3px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;font-weight:700;color:#0f172a;">${k.kol} ${k.label}</span>
          <span class="mono" style="font-size:9.8px;font-weight:700;color:${k.color};">${fmtPct(pct, 2)}</span>
        </div>
        <div class="mono" style="font-size:10.8px;font-weight:700;color:#0f172a;margin-top:2px;">${k.bd >= 1e9 ? fmtM(k.bd) : fmtJt(k.bd)}</div>
        <div style="font-size:9.2px;color:#64748b;display:flex;justify-content:space-between;margin-top:1px;">
          <span>${fmtNum(k.fas)} fas</span>
          <span class="mono">${k.dpd}</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;

  const branchTable = `<table class="e-table tight">
    <colgroup>
      <col style="width:52px" />
      <col style="width:205px" />
      <col style="width:54px" />
      <col style="width:118px" />
      <col style="width:118px" />
      <col style="width:66px" />
      <col style="width:68px" />
      <col style="width:106px" />
      <col style="width:76px" />
    </colgroup>
    <thead>
      <tr>
        <th>Kode</th>
        <th>Unit Kerja / Cabang</th>
        <th class="num">Fas</th>
        <th class="num">Baki Debet</th>
        <th class="num">Total DPK</th>
        <th class="num">LDR</th>
        <th class="num">NPL</th>
        <th class="num">PPAP Wajib</th>
        <th>Sync GL</th>
      </tr>
    </thead>
    <tbody>
      ${BRANCHES.map((b, idx) => {
        const nplP = (b.npl / b.bd) * 100;
        const ldrP = (b.bd / b.dpk) * 100;
        return `<tr class="${idx === 0 ? 'is-selected' : ''}">
          <td class="mono" style="font-weight:700;">${b.code}</td>
          <td style="font-weight:${idx === 0 ? '700' : '600'};">${esc(b.name)}</td>
          <td class="num mono">${fmtNum(b.fas)}</td>
          <td class="num mono">${fmtIdr(b.bd)}</td>
          <td class="num mono">${fmtIdr(b.dpk)}</td>
          <td class="num mono">${fmtPct(ldrP, 1)}</td>
          <td class="num mono" style="font-weight:700;color:${nplP >= 3.25 ? '#b45309' : '#047857'};">${fmtPct(nplP, 2)}</td>
          <td class="num mono">${fmtIdr(b.ppap)}</td>
          <td>${badge(b.sync, b.tone)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td class="mono">ALL</td>
        <td>KONSOLIDASI 7 UNIT BPR</td>
        <td class="num mono">${fmtNum(TOTAL_FAS)}</td>
        <td class="num mono">${fmtIdr(TOTAL_BD)}</td>
        <td class="num mono">${fmtIdr(TOTAL_DPK)}</td>
        <td class="num mono">${fmtPct(LDR_RATIO, 1)}</td>
        <td class="num mono" style="color:#047857;">${fmtPct(NPL_RATIO, 2)}</td>
        <td class="num mono">${fmtIdr(TOTAL_PPAP)}</td>
        <td>${badge('0 Antre', 'ok')}</td>
      </tr>
    </tfoot>
  </table>`;

  const doaHtml = DOA_QUEUE.map((d) => {
    const s1 = 'done';
    const s2 = d.step >= 3 ? 'done' : 'active';
    const s3 = d.step >= 3 ? 'active' : '';
    return `<div style="padding:8px 10px;border-bottom:1px solid #e6ebf1;display:flex;flex-direction:column;gap:5px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <div style="min-width:0;">
          <span class="mono" style="font-size:9.6px;color:#1d4ed8;font-weight:700;margin-right:5px;">${d.id}</span>
          <span style="font-size:11px;font-weight:700;color:#0f172a;">${esc(d.title)}</span>
        </div>
        ${badge(d.sla, d.tone)}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;">
        <span>${esc(d.branch)} · ${esc(d.tag)}</span>
        <span class="mono" style="font-weight:700;color:#0f172a;">${fmtIdr(d.nominal)}</span>
      </div>
      <div class="bpr-stepper">
        <span class="bpr-step ${s1}">${ic('check', 10, '#047857')} Maker: ${esc(d.maker)}</span>
        <span class="bpr-step-line ${s1}"></span>
        <span class="bpr-step ${s2}">${d.step >= 3 ? ic('check', 10, '#047857') : ic('clock', 10, '#1d4ed8')} Checker: ${esc(d.checker)}</span>
        <span class="bpr-step-line ${s2 === 'done' ? 'done' : ''}"></span>
        <span class="bpr-step ${s3}">${esc(d.approver)}</span>
      </div>
    </div>`;
  }).join('');

  const tksMetrics = [
    { name: 'KPMM / CAR (Modal Minimum OJK >= 12%)', val: '22,40%', pct: 84, barWarn: 95, barCrit: 99, note: 'Modal Inti Rp 7,28 M · Sangat Sehat', tone: 'ok' },
    { name: 'Cash Ratio / Likuiditas (Min OJK >= 5%)', val: '14,82%', pct: 74, barWarn: 95, barCrit: 99, note: 'Alat Likuid Rp 8,36 M vs Hutang Lancar', tone: 'ok' },
    { name: 'BOPO Operasional (Batas Sehat <= 85%)', val: fmtPct(BOPO_RATIO, 2), pct: 78.3, barWarn: 82, barCrit: 88, note: 'Beban Rp 6,14 M / Pendapatan Rp 7,84 M', tone: 'ok' },
    { name: 'KAP — Kualitas Aktiva Produktif (<= 5%)', val: '2,48%', pct: 49.6, barWarn: 75, barCrit: 90, note: 'PPAP Terbentuk 100,0% dari Wajib OJK', tone: 'ok' },
    { name: 'BMPK Pihak Terkait (Batas OJK <= 10%)', val: '6,20%', pct: 62, barWarn: 80, barCrit: 95, note: '0 Pelanggaran · 0 Pelampauan BMPK', tone: 'ok' },
    { name: 'Suku Bunga Deposito Max vs TBP LPS (6,75%)', val: '6,25%', pct: 92.6, barWarn: 96, barCrit: 100, note: '2.306 Bilyet · 100% Dijamin Penuh LPS', tone: 'ok' },
  ];

  const tksHtml = tksMetrics
    .map(
      (m) => `<div style="padding:5.5px 0;border-bottom:1px solid #eef2f6;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="font-size:10.4px;font-weight:700;color:#0f172a;">${esc(m.name)}</span>
          <span class="mono" style="font-size:11px;font-weight:700;color:#047857;">${esc(m.val)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;">${renderCapacityBar(m.pct, { warnAt: m.barWarn, critAt: m.barCrit, showLabel: false })}</div>
          <span style="font-size:9.4px;color:#64748b;white-space:nowrap;">${esc(m.note)}</span>
        </div>
      </div>`
    )
    .join('');

  const content = `${kpiStrip}
  <div class="bpr-grid-2" style="grid-template-columns:1.58fr 1fr;">
    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.12;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#1d4ed8')}<span>Tren Kualitas Kredit (NPL Gross, NPL Nett & DPK) — 12 Bulan Terakhir</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('POJK 33/2018 & PSAK 71', 'accent')}
            ${badge('Target NPL < 3,50%', 'ok')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          ${trendChart}
          ${kolMixHtml}
        </div>
      </section>

      <section class="e-panel" style="flex:0.88;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#1d4ed8')}<span>Konsolidasi Portofolio & Likuiditas 7 Unit Kerja (KC, KCP & Kantor Kas)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="e-panel-sub">Replikasi SQL Server GL Real-Time</span>
            ${badge('7/7 Online', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          ${branchTable}
          <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#334155;">
            <span><strong>Rekonsiliasi Cabang:</strong> Selisih Antar-Kantor (RAK) = <span class="mono" style="color:#047857;font-weight:700;">Rp 0</span></span>
            <span><strong>Laba Berjalan YTD:</strong> <span class="mono" style="color:#1e3a8a;font-weight:700;">Rp 1.700.000.000</span> (ROA 2,98% · ROE 23,35%)</span>
          </div>
        </div>
      </section>
    </div>

    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.06;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#1d4ed8')}<span>Antrean Otorisasi DoA (Maker-Checker Dual Control)</span></div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('4 Menunggu', 'warn')}
            ${badge('18 Selesai Hari Ini', 'neutral')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div>${doaHtml}</div>
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#475569;">
            <span>Kewenangan Pinca: maks. Rp 300jt · Direksi: > Rp 300jt</span>
            <span class="mono" style="font-weight:700;color:#1d4ed8;">Audit Log Aktif</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.94;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#047857')}<span>Tingkat Kesehatan BPR (TKS OJK) & Kepatuhan LPS</span></div>
          ${badge('Peringkat Komposit 1 (Sangat Sehat)', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:6px 11px;">
          ${tksHtml}
        </div>
      </section>
    </div>
  </div>`;

  return renderBprShell({
    activeId: 'p1',
    pageTitle: 'BPRCore · Cabang Bekasi — Ringkasan Eksekutif & Konsolidasi 7 Unit',
    pageSubtitle: 'Posisi Keuangan Intraday, Kualitas Aktiva Produktif (Kol 1–5) & Kepatuhan OJK/LPS',
    actionsHtml: `<span class="e-btn">${ic('fileText', 12, '#334155')}Validasi File SLIK</span><span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')}Jalankan EOD Akrual</span>`,
    contentHtml: content,
    statusNote: 'Baki Debet Rp 48,60 M | NPL 3,12% | 0 Error SLIK | Trial Balance Seimbang',
  });
}

// ============================================================================
// PAGE 2: STASIUN TELLER KEYBOARD-FIRST & MUTASI KAS
// ============================================================================

function renderPage2() {
  const limitPct = (TELLER_CLOSING_CASH / TELLER_LIMIT_CASH) * 100;

  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,minmax(0,1fr));">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kas Awal Loket TLR-01</span>${badge('08:00 WIB', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TELLER_OPENING_CASH)}</span></div>
      <div class="e-kpi-foot"><span>Drop Vault #VLT-01</span><span class="mono">Dual-Key OK</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Total Setoran Tunai</span>${badge('9 Trx', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">+${fmtIdr(TELLER_CASH_IN)}</span></div>
      <div class="e-kpi-foot"><span>Tabungan & Angsuran</span><span class="mono">Tervalidasi</span></div>
    </div>
    <div class="e-kpi bpr-kpi-warn">
      <div class="e-kpi-top"><span>Total Penarikan Tunai</span>${badge('6 Trx', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">-${fmtIdr(TELLER_CASH_OUT)}</span></div>
      <div class="e-kpi-foot"><span>Tarik & Cair Mikro</span><span class="mono">Spv-01 OK</span></div>
    </div>
    <div class="e-kpi bpr-kpi-accent">
      <div class="e-kpi-top"><span>Saldo Akhir Kas Fisik</span>${badge(fmtPct(limitPct, 1) + ' Limit', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#1e3a8a;">${fmtIdr(TELLER_CLOSING_CASH)}</span></div>
      <div class="e-kpi-foot"><span>Batas Maks Rp 500 jt</span><span class="mono">Selisih Rp 0</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Pindah Buku & QRIS</span>${badge('5 Trx', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(TELLER_NON_CASH)}</span></div>
      <div class="e-kpi-foot"><span>ARO Depo + QRIS BI</span><span class="mono">Non-Tunai</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Integrasi Loket Aktif</span>${badge('Online', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:14px;color:#047857;">Dukcapil · QRIS</span></div>
      <div class="e-kpi-foot"><span>Passbook Printer COM3</span><span class="mono">Latency 42ms</span></div>
    </div>
  </section>`;

  const txTable = `<table class="e-table comfy">
    <colgroup>
      <col style="width:94px" />
      <col style="width:56px" />
      <col style="width:40px" />
      <col style="width:72px" />
      <col style="width:205px" />
      <col style="width:82px" />
      <col style="width:96px" />
      <col style="width:96px" />
      <col style="width:86px" />
    </colgroup>
    <thead>
      <tr>
        <th>No. Referensi</th>
        <th>Waktu</th>
        <th>Sandi</th>
        <th>No. Rek</th>
        <th>Nasabah & Keterangan Transaksi</th>
        <th>Kanal</th>
        <th class="num">Masuk (Rp)</th>
        <th class="num">Keluar / PBK</th>
        <th>Otorisasi</th>
      </tr>
    </thead>
    <tbody>
      ${TELLER_TX.map((t) => {
        const masuk = t.cashIn > 0 ? fmtNum(t.cashIn) : '—';
        const keluar = t.cashOut > 0 ? fmtNum(t.cashOut) : t.nonCash > 0 ? fmtNum(t.nonCash) : '—';
        const keluarCls = t.cashOut > 0 ? 'color:#b45309;font-weight:700;' : t.nonCash > 0 ? 'color:#0369a1;font-weight:600;' : 'color:#94a3b8;';
        return `<tr class="${t.selected ? 'is-selected' : ''}">
          <td class="mono" style="font-size:10px;font-weight:${t.selected ? '700' : '500'};">${t.ref}</td>
          <td class="mono" style="color:#64748b;font-size:10px;">${t.time}</td>
          <td class="mono" style="font-weight:700;color:#1e3a8a;">${t.sandi}</td>
          <td class="mono" style="font-weight:700;">${t.acct}</td>
          <td style="font-weight:${t.selected ? '700' : '500'};">${esc(t.nasabah)}</td>
          <td><span class="e-badge e-badge-${t.channel === 'Tunai' ? 'neutral' : t.channel === 'QRIS-BI' ? 'info' : 'accent'}">${t.channel}</span></td>
          <td class="num mono" style="${t.cashIn > 0 ? 'color:#047857;font-weight:700;' : 'color:#94a3b8;'}">${masuk}</td>
          <td class="num mono" style="${keluarCls}">${keluar}</td>
          <td>${badge(t.auth, t.tone)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5">TOTAL MUTASI LOKET TLR-01 (20 TRX · PBK Rp 742,5 jt)</td>
        <td class="mono">KLOP</td>
        <td class="num mono" style="color:#047857;">${fmtNum(TELLER_CASH_IN)}</td>
        <td class="num mono" style="color:#b45309;">${fmtNum(TELLER_CASH_OUT)}</td>
        <td class="mono" style="color:#1e3a8a;">100% OK</td>
      </tr>
    </tfoot>
  </table>`;

  const sigSvg = `<svg viewBox="0 0 180 34" width="140" height="28" style="display:block;background:#ffffff;border:1px solid #cbd5e1;border-radius:2px;">
    <path d="M12 24 C20 6, 30 6, 34 22 C37 14, 46 11, 52 21 C58 12, 68 8, 76 19 C84 26, 94 9, 108 18 C118 24, 132 10, 148 16 C156 19, 162 15, 168 14" fill="none" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="10" y1="28" x2="170" y2="28" stroke="#cbd5e1" stroke-width="0.8" stroke-dasharray="2,2"/>
  </svg>`;

  const denomLeft = CASH_DENOMS.slice(0, 4);
  const denomRight = CASH_DENOMS.slice(4);

  const renderDenomMini = (rows) => `<table class="e-table tight">
    <thead>
      <tr><th>Pecahan</th><th class="num">Jml</th><th class="num">Nominal (Rp)</th></tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (d) => `<tr>
            <td class="mono" style="font-weight:700;">${d.label}</td>
            <td class="num mono">${fmtNum(d.qty)}</td>
            <td class="num mono" style="font-weight:600;">${fmtNum(d.unit * d.qty)}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>`;

  const content = `${kpiStrip}
  <div class="bpr-grid-2" style="grid-template-columns:1.38fr 1fr;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('zap', 13, '#1d4ed8')}<span>Buku Harian Mutasi Teller — TLR-01 Siti Rahmawati (KC Bekasi)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Shift Pagi–Sore', 'neutral')}
          ${badge('Auto-Journal GL Aktif', 'ok')}
        </div>
      </div>
      <div class="bpr-filter-bar">
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="bpr-pill-tab active">Semua (20)</span>
          <span class="bpr-pill-tab">Tunai (15)</span>
          <span class="bpr-pill-tab">Angsuran Kredit (5)</span>
          <span class="bpr-pill-tab">Deposito (2)</span>
          <span class="bpr-pill-tab">QRIS (2)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#475569;">
          <span class="bpr-keycap">↑/↓</span><span>Pilih Baris</span>
          <span class="bpr-keycap">F6</span><span>Cetak Passbook</span>
          <span class="bpr-keycap">F7</span><span>Reprint Slip</span>
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        ${txTable}
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d6dee8;display:flex;align-items:center;justify-content:space-between;font-size:10px;">
          <span style="color:#334155;"><strong>Deposito Highlight:</strong> <span class="mono" style="color:#1e3a8a;font-weight:700;">DEP-2190 H. Santoso</span> · ARO Pokok Rp 500.000.000 · Bunga 5,75% (Aman di bawah TBP LPS 6,75%)</span>
          ${badge('Zero Selisih Kas', 'ok')}
        </div>
      </div>
    </section>

    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.34;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('terminal', 13, '#1d4ed8')}<span>Form Posting Cepat [F4 · Bayar Angsuran Kredit]</span></div>
          ${badge('Sandi 310 · Kol-1 Lancar', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div style="padding:7px 9px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:11.5px;font-weight:700;color:#1e3a8a;">KRD-8821 — CV Berkah Jaya (Kredit Modal Kerja)</div>
              <div style="font-size:9.8px;color:#334155;">Plafon Rp 350.000.000 · Agunan SHM · Tenor 36B · 0 DPD · Angsuran ke-13</div>
            </div>
            ${badge('Kol-1 Lancar', 'ok')}
          </div>

          <div class="bpr-kv-grid">
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Baki Debet Sebelum Bayar</span>
              <div class="bpr-input-box is-readonly mono"><span>Rp</span><span>251.200.000</span></div>
            </div>
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Baki Debet Sesudah Posting</span>
              <div class="bpr-input-box is-readonly mono" style="color:#047857;"><span>Rp</span><span>241.500.000</span></div>
            </div>
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Angsuran Pokok (Sandi 310-P)</span>
              <div class="bpr-input-box is-focus mono"><span>Rp</span><span>9.700.000</span></div>
            </div>
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Bunga Berjalan (Efektif 13,2%)</span>
              <div class="bpr-input-box is-focus mono"><span>Rp</span><span>2.750.000</span></div>
            </div>
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Denda Keterlambatan (0 DPD)</span>
              <div class="bpr-input-box is-readonly mono"><span>Rp</span><span>0</span></div>
            </div>
            <div class="bpr-kv">
              <span class="bpr-kv-lbl">Total Diterima Tunai Loket</span>
              <div class="bpr-input-box mono" style="border-color:#047857;background:#ecfdf5;color:#065f46;font-weight:800;"><span>Rp</span><span>12.450.000</span></div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 9px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
            <div style="font-size:10px;line-height:1.45;">
              <div style="font-weight:700;color:#0f172a;">Validasi Identitas Penyetor & Spesimen CIF</div>
              <div class="mono" style="color:#047857;font-weight:700;">NIK 3275041208810004 · DUKCAPIL MATCH 100%</div>
              <div style="color:#64748b;">Kuasa Direktur: H. Ahmad Fauzi · KTP Elektronik Valid</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px;color:#64748b;margin-bottom:2px;">Spesimen Tanda Tangan CIF</div>
              ${sigSvg}
            </div>
          </div>

          <div>
            <div style="font-size:9.8px;font-weight:700;color:#475569;margin-bottom:4px;">Pratinjau Ayat Jurnal Double-Entry (Immutable GL Auto-Post)</div>
            <table class="e-table tight" style="border:1px solid #d6dee8;">
              <thead>
                <tr><th>COA</th><th>Nama Akun GL</th><th class="num">Debit</th><th class="num">Kredit</th></tr>
              </thead>
              <tbody>
                <tr><td class="mono">101.01</td><td>Kas Teller TLR-01 Bekasi</td><td class="num mono" style="font-weight:700;">12.450.000</td><td class="num mono">—</td></tr>
                <tr><td class="mono">115.01</td><td>Kredit Modal Kerja (KRD-8821)</td><td class="num mono">—</td><td class="num mono" style="font-weight:700;">9.700.000</td></tr>
                <tr><td class="mono">401.01</td><td>Pendapatan Bunga Kredit</td><td class="num mono">—</td><td class="num mono" style="font-weight:700;">2.750.000</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid #e2e8f0;">
            <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">Journal Delta: Rp 0 · Otorisasi: Auto-OK (&lt; Rp 25jt)</span>
            <div style="display:flex;gap:6px;">
              <span class="e-btn"><span class="bpr-keycap">F6</span>Validasi Buku</span>
              <span class="e-btn e-btn-primary"><span class="bpr-keycap" style="background:#1e3a8a;color:#fff;border-color:#60a5fa;">Ctrl+↵</span>Posting</span>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.64;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#047857')}<span>Rekonsiliasi Fisik Pecahan Kas Loket TLR-01</span></div>
          ${badge('KLOP · Rp 318.450.000', 'ok')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #d6dee8;">
            <div style="border-right:1px solid #d6dee8;">${renderDenomMini(denomLeft)}</div>
            <div>${renderDenomMini(denomRight)}</div>
          </div>
          <div style="padding:7px 10px;background:#f8fafc;border-bottom:1px solid #d6dee8;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;font-size:9.8px;color:#334155;">
              <span><strong>Utilisasi Limit Kas Teller TLR-01</strong> (Batas Maks. Rp 500.000.000)</span>
              <span class="mono" style="font-weight:700;color:#1e3a8a;">${fmtPct(limitPct, 1)} · Sisa Headroom Rp 181,55 jt</span>
            </div>
            ${renderCapacityBar(limitPct, { warnAt: 80, critAt: 95, showLabel: false })}
          </div>
          <div style="padding:6px 10px;background:#ecfdf5;display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:10px;color:#065f46;font-weight:700;">
            <span>Fisik Kas: ${fmtIdr(DENOM_TOTAL)}</span>
            <span>Buku Kas GL: ${fmtIdr(TELLER_CLOSING_CASH)}</span>
            <span>Selisih: Rp 0</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderBprShell({
    activeId: 'p2',
    pageTitle: 'Stasiun Teller Keyboard-First — Loket TLR-01 KC Bekasi',
    pageSubtitle: 'Operasional Tabungan, Deposito Berjangka, Angsuran Kredit & Settlement QRIS Real-Time',
    actionsHtml: `<span class="e-btn">${ic('refresh', 12, '#334155')}Tutup Kas Sementara</span><span class="e-btn e-btn-primary">${ic('zap', 12, '#ffffff')}Transaksi Baru [F2]</span>`,
    contentHtml: content,
    statusNote: 'Teller TLR-01: Siti Rahmawati | Kas Fisik Rp 318.450.000 (63,7% Limit) | Selisih Kas Rp 0',
  });
}

// ============================================================================
// PAGE 3: PORTOFOLIO KREDIT, AGING KOLEKTIBILITAS & PPAP PSAK 71
// ============================================================================

function renderPage3() {
  const bucketStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,minmax(0,1fr));">
    ${KOLEKTIBILITAS.map((k) => {
      const share = (k.bd / TOTAL_BD) * 100;
      const cls = k.tone === 'ok' ? 'bpr-kpi-accent' : k.tone === 'warn' ? 'bpr-kpi-warn' : 'bpr-kpi-bad';
      return `<div class="e-kpi ${cls}">
        <div class="e-kpi-top"><span>${k.kol} · ${k.label} (${k.dpd})</span>${badge(fmtNum(k.fas) + ' fas', k.tone)}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="font-size:15.5px;">${k.bd >= 1e9 ? fmtM(k.bd) : fmtJt(k.bd)}</span>
          <span class="mono" style="font-size:11px;font-weight:700;color:${k.color};">${fmtPct(share, 2)}</span>
        </div>
        <div class="e-kpi-foot"><span>Tarif ${k.rate}</span><span class="mono">PPAP ${fmtJt(k.ppap)}</span></div>
      </div>`;
    }).join('')}
  </section>`;

  const sampleBd = LOANS.reduce((a, l) => a + l.bd, 0);
  const samplePlafon = LOANS.reduce((a, l) => a + l.plafon, 0);
  const samplePpap = LOANS.reduce((a, l) => a + l.ppap, 0);

  const loanTable = `<table class="e-table comfy">
    <colgroup>
      <col style="width:74px" />
      <col style="width:176px" />
      <col style="width:94px" />
      <col style="width:36px" />
      <col style="width:96px" />
      <col style="width:96px" />
      <col style="width:48px" />
      <col style="width:58px" />
      <col style="width:86px" />
      <col style="width:86px" />
    </colgroup>
    <thead>
      <tr>
        <th>No. Kredit</th>
        <th>Nama Debitur</th>
        <th>Produk</th>
        <th>Unit</th>
        <th class="num">Plafon</th>
        <th class="num">Baki Debet</th>
        <th class="num">DPD</th>
        <th>Kol</th>
        <th>Agunan</th>
        <th class="num">PPAP Wajib</th>
      </tr>
    </thead>
    <tbody>
      ${LOANS.map((l) => {
        const rowCls = l.selected ? 'is-selected' : l.bad ? 'is-bad' : l.warn ? 'is-warn' : '';
        return `<tr class="${rowCls}">
          <td class="mono" style="font-weight:700;color:#1e3a8a;">${l.id}</td>
          <td style="font-weight:${l.selected ? '700' : '600'};">${esc(l.debitur)}</td>
          <td style="color:#475569;font-size:10px;">${esc(l.produk)}</td>
          <td class="mono" style="color:#64748b;">${l.branch}</td>
          <td class="num mono">${fmtNum(l.plafon)}</td>
          <td class="num mono" style="font-weight:700;">${fmtNum(l.bd)}</td>
          <td class="num mono" style="font-weight:700;color:${l.dpd > 90 ? '#be123c' : l.dpd > 0 ? '#b45309' : '#047857'};">${l.dpd}</td>
          <td>${badge(l.kol, l.tone)}</td>
          <td style="font-size:10px;color:#334155;">${esc(l.agunan)}</td>
          <td class="num mono">${fmtNum(l.ppap)}</td>
        </tr>`;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4">SUBTOTAL 18 SAMPEL PRIORITAS (DARI 2.840 FASILITAS)</td>
        <td class="num mono">${fmtNum(samplePlafon)}</td>
        <td class="num mono">${fmtNum(sampleBd)}</td>
        <td class="num mono">NPL</td>
        <td class="mono" style="color:#047857;">3,12%</td>
        <td class="mono">PPAP</td>
        <td class="num mono">${fmtNum(samplePpap)}</td>
      </tr>
    </tfoot>
  </table>`;

  const ratnaHistTable = `<table class="e-table tight" style="border:1px solid #d6dee8;">
    <colgroup>
      <col style="width:76px" />
      <col style="width:44px" />
      <col style="width:76px" />
      <col style="width:76px" />
      <col style="width:62px" />
      <col style="width:146px" />
    </colgroup>
    <thead>
      <tr><th>Tanggal</th><th>Ke</th><th class="num">Tagihan</th><th class="num">Realisasi</th><th>DPD</th><th>Keterangan</th></tr>
    </thead>
    <tbody>
      ${RATNA_HISTORY.map(
        (r) => `<tr>
          <td class="mono" style="font-size:9.8px;">${r.tgl}</td>
          <td class="mono" style="font-size:9.8px;">${r.ke}</td>
          <td class="num mono">${fmtNum(r.tagihan)}</td>
          <td class="num mono" style="font-weight:700;color:${r.bayar > 0 ? '#047857' : '#be123c'};">${fmtNum(r.bayar)}</td>
          <td>${badge(r.dpd, r.tone)}</td>
          <td style="font-size:9.8px;color:#475569;">${esc(r.note)}</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>`;

  const content = `${bucketStrip}
  <div class="bpr-grid-2" style="grid-template-columns:1.45fr 1fr;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('sliders', 13, '#1d4ed8')}<span>Daftar Portofolio Kredit Aktif, Aging DPD & Pencadangan PPAP</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('NPL Gross 3,12%', 'ok')}
          ${badge('PPAP Konsolidasi Rp 1.362.220.000', 'accent')}
        </div>
      </div>
      <div class="bpr-filter-bar">
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="bpr-pill-tab active">Prioritas Monitoring (18 / 2.840)</span>
          <span class="bpr-pill-tab">DPK Kol-2 (178)</span>
          <span class="bpr-pill-tab">NPL Kol 3–5 (78)</span>
          <span class="bpr-pill-tab">Jatuh Tempo &lt;30H (42)</span>
        </div>
        <span class="mono" style="font-size:9.8px;color:#64748b;">Mesin Aging: POJK 33/2018 + PSAK 71 ECL</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        ${loanTable}
        <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #d6dee8;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#334155;">
          <span><strong>Total Konsolidasi 2.840 Fasilitas:</strong> Baki Debet <span class="mono" style="font-weight:700;">${fmtIdr(TOTAL_BD)}</span> · PPAP Wajib & Terbentuk <span class="mono" style="font-weight:700;color:#047857;">${fmtIdr(TOTAL_PPAP)}</span></span>
          <span class="mono" style="color:#1e3a8a;font-weight:700;">Selisih PPAP EOD: +Rp 14.220.000</span>
        </div>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('eye', 13, '#1d4ed8')}<span>Inspektor Kredit & Kalkulator PPAP — KRD-8744</span></div>
        ${badge('Kol-2 DPK · 34 DPD', 'warn')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;justify-content:space-between;">
        <div style="padding:7px 9px;background:#fffbeb;border:1px solid #fde68a;border-radius:3px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;font-weight:700;color:#0f172a;">Ibu Ratna — Kredit Mikro Pasar Baru</span>
            <span class="mono" style="font-size:11px;font-weight:700;color:#b45309;">Baki Debet Rp 18.200.000</span>
          </div>
          <div style="font-size:10px;color:#475569;margin-top:2px;">CIF 001-048291 · NIK 3275025406780009 (Dukcapil Valid) · Plafon Rp 45.000.000 · Angsuran Mingguan Rp 1.185.000 · AO: Budi Santoso</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;">
          <div style="padding:5px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;">Suku Bunga</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">18,0% p.a.</div>
          </div>
          <div style="padding:5px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;">Sisa Tenor</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">7 Minggu</div>
          </div>
          <div style="padding:5px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;">Rasio LTV</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#047857;">56,9% Aman</div>
          </div>
          <div style="padding:5px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
            <div style="font-size:9px;color:#64748b;font-weight:600;">Kol Bulan Lalu</div>
            <div class="mono" style="font-size:11px;font-weight:700;color:#1d4ed8;">Kol-1 Lancar</div>
          </div>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-bottom:5px;display:flex;justify-content:space-between;">
            <span>Perhitungan PPAP & Agunan (POJK 33/2018 & PSAK 71 Stage 2)</span>
            <span class="mono" style="font-size:9.8px;color:#1d4ed8;">Otomatis EOD</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:10.5px;">
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed #e2e8f0;">
              <span style="color:#475569;">1. Baki Debet Posisi 20 Nov 2026</span>
              <span class="mono" style="font-weight:700;">Rp 18.200.000</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed #e2e8f0;">
              <span style="color:#475569;">2. Agunan SHGB Kios Pasar Baru (Taksasi Rp 32.000.000)</span>
              <span class="mono" style="color:#0369a1;font-weight:600;">NLA 25%: Rp 8.000.000</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed #e2e8f0;">
              <span style="color:#475569;">3. Dasar Pembentukan PPAP (Baki Debet − NLA Diperhitungkan)</span>
              <span class="mono" style="font-weight:700;">Rp 10.200.000</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:3px;">
              <span style="font-weight:700;color:#1e3a8a;">4. PPAP Wajib Kol-2 (10% × Dasar PPAP · Stage 2 ECL)</span>
              <span class="mono" style="font-weight:800;color:#1e3a8a;">Rp 1.020.000</span>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-bottom:5px;display:flex;justify-content:space-between;">
            <span>Alur DoA Restrukturisasi / Penanganan DPK (Rescheduling 12B)</span>
            ${badge('Tahap 2/4 · SLA 42 mnt', 'accent')}
          </div>
          <div class="bpr-stepper" style="flex-wrap:nowrap;">
            <span class="bpr-step done">${ic('check', 10, '#047857')}01 Visit AO</span>
            <span class="bpr-step-line done"></span>
            <span class="bpr-step active">${ic('clock', 10, '#1d4ed8')}02 Kasi Kredit</span>
            <span class="bpr-step-line"></span>
            <span class="bpr-step">03 Pinca</span>
            <span class="bpr-step-line"></span>
            <span class="bpr-step">04 Adendum SLIK</span>
          </div>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
          <div style="font-size:10.5px;font-weight:700;color:#0f172a;margin-bottom:5px;">Riwayat 6 Pembayaran Angsuran Terakhir (Mingguan)</div>
          ${ratnaHistTable}
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid #e2e8f0;">
          <span style="font-size:9.8px;color:#475569;">Flag SLIK F01: <strong>00 (Belum Restrukturisasi)</strong></span>
          <div style="display:flex;gap:6px;">
            <span class="e-btn">${ic('fileText', 11, '#334155')}Cetak SP-2</span>
            <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Setujui Usulan Resched</span>
          </div>
        </div>
      </div>
    </section>
  </div>`;

  return renderBprShell({
    activeId: 'p3',
    pageTitle: 'Portofolio Kredit, Mesin Aging Kolektibilitas 1–5 & Pencadangan PPAP',
    pageSubtitle: 'Pemantauan Kualitas Aktiva Produktif, Valuasi Agunan & Kepatuhan PSAK 71 / POJK 33',
    actionsHtml: `<span class="e-btn">${ic('download', 12, '#334155')}Ekspor Nominatif Kredit</span><span class="e-btn e-btn-primary">${ic('refresh', 12, '#ffffff')}Recalc Aging & PPAP</span>`,
    contentHtml: content,
    statusNote: '2.840 Fasilitas | BD Rp 48,60 M | NPL 3,12% | PPAP Rp 1,36 M',
  });
}

// ============================================================================
// PAGE 4: VALIDATOR & GENERATOR PELAPORAN OJK SLIK, APOLO & LPS
// ============================================================================

function renderPage4() {
  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,minmax(0,1fr));">
    <div class="e-kpi bpr-kpi-accent">
      <div class="e-kpi-top"><span>Periode Pelaporan</span>${badge('Bulanan', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Nov 2026</span></div>
      <div class="e-kpi-foot"><span>Batas OJK: 10 Des 2026</span><span class="mono">H-20</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Segmen SLIK Lolos</span>${badge('100% Valid', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">6 / 6</span></div>
      <div class="e-kpi-foot"><span>F01, D01, D02, A01, M01, P01</span><span class="mono">v2.4</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Baris SLIK</span>${badge('2.840 F01', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_SLIK_ROWS)}</span></div>
      <div class="e-kpi-foot"><span>+ 6.924 Rek SCV LPS</span><span class="mono">NIK Valid</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Error Kritis SLIK</span>${badge('Siap Unggah', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${TOTAL_SLIK_ERR} baris</span></div>
      <div class="e-kpi-foot"><span>0 Reject Portal OJK</span><span class="mono">0% Error</span></div>
    </div>
    <div class="e-kpi bpr-kpi-warn">
      <div class="e-kpi-top"><span>Warning Non-Blocking</span>${badge('Opsional', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">${TOTAL_SLIK_WARN} baris</span></div>
      <div class="e-kpi-foot"><span>Update Taksasi & Alamat</span><span class="mono">Non-Fatal</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Klop F01 vs APOLO</span>${badge('Delta Rp 0', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="font-size:15px;color:#047857;">Rp 48,60 M</span></div>
      <div class="e-kpi-foot"><span>Neraca 0100 === Daftar 0600</span><span class="mono">SEIMBANG</span></div>
    </div>
  </section>`;

  const segTable = `<table class="e-table comfy">
    <colgroup>
      <col style="width:92px" />
      <col style="width:248px" />
      <col style="width:66px" />
      <col style="width:48px" />
      <col style="width:48px" />
      <col style="width:88px" />
      <col style="width:94px" />
    </colgroup>
    <thead>
      <tr>
        <th>Segmen</th>
        <th>Deskripsi Paket Pelaporan Resmi</th>
        <th class="num">Baris</th>
        <th class="num">Error</th>
        <th class="num">Warn</th>
        <th>SHA-256</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${SLIK_SEGMENTS.map(
        (s, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
          <td class="mono" style="font-weight:700;color:${s.scope === 'SLIK' ? '#1e3a8a' : s.scope === 'APOLO' ? '#0369a1' : '#047857'};">${s.seg}</td>
          <td style="font-weight:${i === 0 ? '700' : '500'};">${esc(s.name)}</td>
          <td class="num mono" style="font-weight:700;">${fmtNum(s.rows)}</td>
          <td class="num mono" style="color:#047857;font-weight:700;">${s.err}</td>
          <td class="num mono" style="color:${s.warn > 0 ? '#b45309' : '#64748b'};font-weight:${s.warn > 0 ? '700' : '400'};">${s.warn}</td>
          <td class="mono" style="font-size:9.5px;color:#64748b;">${s.sha}</td>
          <td>${badge(s.status, s.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">TOTAL PAKET SLIK (6 SEGMEN) + APOLO (3 FORM) + LPS SCV</td>
        <td class="num mono">8.412 SLIK</td>
        <td class="num mono" style="color:#047857;">0</td>
        <td class="num mono" style="color:#b45309;">3</td>
        <td class="mono">WORM-OK</td>
        <td>${badge('SIAP OJK', 'ok')}</td>
      </tr>
    </tfoot>
  </table>`;

  const rulesTable = `<table class="e-table tight">
    <colgroup>
      <col style="width:76px" />
      <col style="width:270px" />
      <col style="width:250px" />
      <col style="width:58px" />
      <col style="width:68px" />
    </colgroup>
    <thead>
      <tr><th>Kode Rule</th><th>Aturan Validasi OJK / LPS</th><th>Hasil Pemeriksaan Real-Time</th><th class="num">Waktu</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${OJK_RULES.map(
        (r) => `<tr>
          <td class="mono" style="font-weight:700;color:#1e3a8a;">${r.id}</td>
          <td style="font-weight:600;">${esc(r.rule)}</td>
          <td style="font-size:10px;color:#334155;">${esc(r.result)}</td>
          <td class="num mono" style="color:#64748b;font-size:9.8px;">${r.ms}</td>
          <td>${badge(r.status, r.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>`;

  const slikRawLines = [
    `<span style="color:#93c5fd;font-weight:700;">H|0102|601842|2026|11|F01|2840|2840</span>`,
    `D|601842|001|<span style="color:#6ee7b7;">KRD-8821</span>|00102184|1|P05|20250514|20280514|IDR|13.20|350000000|<span style="color:#fde68a;">241500000</span>|1|0|0|00`,
    `D|601842|001|<span style="color:#fca5a5;">KRD-8744</span>|00104829|1|P09|20260412|20270112|IDR|18.00|45000000|<span style="color:#fde68a;">18200000</span>|2|34|4740000|00`,
    `D|601842|002|<span style="color:#6ee7b7;">KRD-8690</span>|00201944|1|P06|20241120|20281120|IDR|12.50|850000000|<span style="color:#fde68a;">612000000</span>|1|0|0|00`,
    `D|601842|003|<span style="color:#fca5a5;">KRD-8612</span>|00302811|1|P05|20250210|20270210|IDR|14.00|220000000|<span style="color:#fde68a;">148600000</span>|3|96|18420000|00`,
    `D|601842|001|<span style="color:#6ee7b7;">KRD-8548</span>|00103105|1|P05|20250801|20280801|IDR|13.00|420000000|<span style="color:#fde68a;">294800000</span>|1|0|0|00`,
    `D|601842|004|<span style="color:#fde68a;">KRD-8491</span>|00401290|1|P08|20250318|20280318|IDR|15.25|125000000|<span style="color:#fde68a;">89400000</span>|2|48|4120000|00`,
    `D|601842|002|<span style="color:#fca5a5;">KRD-8432</span>|00204119|1|P05|20240905|20260905|IDR|14.50|300000000|<span style="color:#fde68a;">186500000</span>|4|134|31200000|00`,
    `D|601842|004|<span style="color:#6ee7b7;">KRD-8389</span>|00405512|1|P06|20250115|20300115|IDR|12.75|600000000|<span style="color:#fde68a;">472000000</span>|1|0|0|00`,
    `D|601842|003|<span style="color:#fca5a5;">KRD-8315</span>|00306240|1|P06|20240610|20280610|IDR|13.75|480000000|<span style="color:#fde68a;">214000000</span>|3|108|26800000|00`,
    `D|601842|005|<span style="color:#6ee7b7;">KRD-8210</span>|00501108|1|P05|20250922|20270922|IDR|11.50|260000000|<span style="color:#fde68a;">164200000</span>|1|0|0|00`,
  ].join('\n');

  const historyTable = `<table class="e-table tight">
    <colgroup>
      <col style="width:66px" />
      <col style="width:118px" />
      <col style="width:162px" />
      <col style="width:74px" />
      <col style="width:118px" />
      <col style="width:94px" />
    </colgroup>
    <thead>
      <tr><th>Periode</th><th>Paket Laporan</th><th>No. Tanda Terima OJK</th><th>Pelapor</th><th>Waktu Unggah</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${OJK_SUBMISSIONS.map(
        (h, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
          <td class="mono" style="font-weight:700;">${h.period}</td>
          <td style="font-size:10px;">${esc(h.paket)}</td>
          <td class="mono" style="font-size:9.8px;color:#1e3a8a;font-weight:600;">${h.receipt}</td>
          <td style="font-size:10px;">${esc(h.officer)}</td>
          <td class="mono" style="font-size:9.6px;color:#64748b;">${h.ts}</td>
          <td>${badge(h.status, h.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>`;

  const content = `${kpiStrip}
  <div class="bpr-grid-2" style="grid-template-columns:1.18fr 1fr;">
    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.14;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#1d4ed8')}<span>Matriks Segmen Pelaporan Resmi OJK SLIK, APOLO & SCV LPS (10 Paket)</span></div>
          ${badge('Batch SLIK-11 · Nov 2026', 'accent')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          ${segTable}
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d6dee8;display:flex;justify-content:space-between;font-size:9.8px;color:#334155;">
            <span><strong>Integritas Paket:</strong> SLIK 6 Segmen (8.412 baris) · APOLO 3 Form (3.052 baris) · LPS SCV (6.924 rek)</span>
            <span class="mono" style="color:#047857;font-weight:700;">0 Error · Siap Ekspor</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.86;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#047857')}<span>Mesin Validator Skema OJK & Cross-Check Neraca Otomatis</span></div>
          ${badge('7 Lolos · 1 Warning Minor', 'ok')}
        </div>
        <div class="e-panel-body-flush">${rulesTable}</div>
      </section>
    </div>

    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.08;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#1d4ed8')}<span>Pratinjau Raw File SLIK Segmen F01 (Pipe-Delimited Spec OJK v2.4)</span></div>
          ${badge('0102.601842.2026.11.F01.txt', 'neutral')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;justify-content:space-between;">
          <div style="display:flex;flex-wrap:wrap;gap:5px;font-family:var(--e-mono);font-size:9.2px;color:#475569;">
            <span class="e-badge e-badge-neutral">[1]Flag</span>
            <span class="e-badge e-badge-neutral">[2]SandiLJK</span>
            <span class="e-badge e-badge-neutral">[3]Cabang</span>
            <span class="e-badge e-badge-accent">[4]NoRek</span>
            <span class="e-badge e-badge-neutral">[5]CIF</span>
            <span class="e-badge e-badge-neutral">[11]Bunga</span>
            <span class="e-badge e-badge-neutral">[12]Plafon</span>
            <span class="e-badge e-badge-warn">[13]BakiDebet</span>
            <span class="e-badge e-badge-neutral">[14]Kol</span>
            <span class="e-badge e-badge-neutral">[15]DPD</span>
          </div>

          <div class="bpr-code-box">${slikRawLines}</div>

          <div style="padding:7px 9px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;display:flex;flex-direction:column;gap:4px;">
            <div style="display:flex;justify-content:space-between;font-size:10px;">
              <span style="font-weight:700;color:#0f172a;">Paket Enkripsi SLIK Client OJK (AES-256 + Digital Seal)</span>
              ${badge('Siap Unggah Portal SLIK', 'ok')}
            </div>
            <div class="mono" style="font-size:9.6px;color:#334155;display:flex;justify-content:space-between;">
              <span>File: 0102_601842_202611_SLIK_ALL.zip.enc (2,48 MB)</span>
              <span>SHA-256: 9f4a82c1e0b7...4d21</span>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:2px;">
            <span style="font-size:10px;color:#047857;font-weight:700;">Cross-Check: Total Baki Debet F01 (2.840 baris) === Neraca APOLO-0100</span>
            <div style="display:flex;gap:6px;">
              <span class="e-btn">${ic('download', 11, '#334155')}Unduh .ZIP SLIK</span>
              <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')}Generate & Enkripsi</span>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.92;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('clock', 13, '#1d4ed8')}<span>Riwayat Pengiriman & Tanda Terima Resmi OJK / LPS (8 Bulan)</span></div>
          ${badge('0 Denda Keterlambatan', 'ok')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          ${historyTable}
          <div style="padding:7px 10px;background:#ecfdf5;border-top:1px solid #a7f3d0;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#065f46;font-weight:600;">
            <span>Kepatuhan Penyampaian OJK 2026: 100% Tepat Waktu sebelum tanggal 10</span>
            <span class="mono" style="font-weight:700;">LPS SCV 6.924 Rek OK</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderBprShell({
    activeId: 'p4',
    pageTitle: 'Validator & Generator Pelaporan OJK SLIK, APOLO & SCV LPS',
    pageSubtitle: 'Verifikasi Otomatis 6 Segmen SLIK, Laporan Bulanan APOLO BPR & Simpanan Dijamin LPS',
    actionsHtml: `<span class="e-btn">${ic('refresh', 12, '#334155')}Validasi Ulang [F8]</span><span class="e-btn e-btn-primary">${ic('download', 12, '#ffffff')}Bangun Paket OJK (1-Klik)</span>`,
    contentHtml: content,
    statusNote: 'SLIK-11 Nov 2026: 8.412 Baris | 0 Error Kritis | F01 vs APOLO Delta Rp 0 | Siap Ekspor OJK',
  });
}

// ============================================================================
// PAGE 5: BATCH EOD AKRUAL, GENERAL LEDGER & REKONSILIASI TRIAL BALANCE
// ============================================================================

function renderPage5() {
  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,minmax(0,1fr));">
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Status Batch EOD</span>${badge('7/7 Selesai', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">SIAP TUTUP</span></div>
      <div class="e-kpi-foot"><span>Durasi Total 48,2 dtk</span><span class="mono">20-NOV-2026</span></div>
    </div>
    <div class="e-kpi bpr-kpi-accent">
      <div class="e-kpi-top"><span>Fasilitas Diproses</span>${badge('100% Sukses', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_FAS)}</span></div>
      <div class="e-kpi-foot"><span>0 Gagal · 0 Terlewati</span><span class="mono">EOD Engine</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Akrual Bunga Kredit</span>${badge('Harian', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">Rp 34,86 jt</span></div>
      <div class="e-kpi-foot"><span>COA 118.01 / 401.01</span><span class="mono">Otomatis</span></div>
    </div>
    <div class="e-kpi bpr-kpi-warn">
      <div class="e-kpi-top"><span>Selisih PPAP Harian</span>${badge('PSAK 71', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">+Rp 14,22 jt</span></div>
      <div class="e-kpi-foot"><span>Saldo PPAP Rp 1,36 M</span><span class="mono">COA 504.01</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Mutasi GL EOD</span>${badge('7 Pasang', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtJt(EOD_DEBIT)}</span></div>
      <div class="e-kpi-foot"><span>Immutable Double-Entry</span><span class="mono">D === K</span></div>
    </div>
    <div class="e-kpi bpr-kpi-ok">
      <div class="e-kpi-top"><span>Trial Balance Delta</span>${badge('SEIMBANG', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">Rp 0</span></div>
      <div class="e-kpi-foot"><span>Total TB Rp 74,32 M</span><span class="mono">7/7 Unit OK</span></div>
    </div>
  </section>`;

  const eodWaterfall = svgSpanWaterfall({
    width: 840,
    totalMs: 48200,
    spans: [
      { label: '01 Cut-Off Teller & Vault', start: 0, dur: 4100, color: '#1d4ed8' },
      { label: '02 Akrual Bunga Kredit (2.840)', start: 4100, dur: 11800, color: '#2563eb' },
      { label: '03 Akrual DPK & PPh 4(2)', start: 15900, dur: 8400, color: '#0284c7' },
      { label: '04 Aging Kol 1–5 & PPAP', start: 24300, dur: 9600, color: '#d97706' },
      { label: '05 Amortisasi Provisi PSAK71', start: 33900, dur: 4800, color: '#047857' },
      { label: '06 Posting Immutable GL', start: 38700, dur: 5900, color: '#1e3a8a' },
      { label: '07 Snapshot TB & WORM Seal', start: 44600, dur: 3600, color: '#059669' },
    ],
  });

  const journalTable = `<table class="e-table tight">
    <colgroup>
      <col style="width:104px" />
      <col style="width:56px" />
      <col style="width:274px" />
      <col style="width:46px" />
      <col style="width:104px" />
      <col style="width:104px" />
      <col style="width:94px" />
    </colgroup>
    <thead>
      <tr>
        <th>No. Jurnal</th>
        <th>COA</th>
        <th>Nama Akun General Ledger (Immutable)</th>
        <th>Unit</th>
        <th class="num">Debit (Rp)</th>
        <th class="num">Kredit (Rp)</th>
        <th>Batch Ref</th>
      </tr>
    </thead>
    <tbody>
      ${EOD_JOURNALS.map(
        (j) => `<tr class="${j.highlight ? 'is-warn' : ''}">
          <td class="mono" style="font-size:9.8px;color:#1e3a8a;font-weight:600;">${j.jid}</td>
          <td class="mono" style="font-weight:700;">${j.coa}</td>
          <td style="font-weight:${j.highlight ? '700' : '500'};">${esc(j.akun)}</td>
          <td class="mono" style="color:#64748b;font-size:9.8px;">${j.br}</td>
          <td class="num mono" style="${j.debit > 0 ? 'font-weight:700;color:#0f172a;' : 'color:#94a3b8;'}">${j.debit > 0 ? fmtNum(j.debit) : '—'}</td>
          <td class="num mono" style="${j.kredit > 0 ? 'font-weight:700;color:#1e3a8a;' : 'color:#94a3b8;'}">${j.kredit > 0 ? fmtNum(j.kredit) : '—'}</td>
          <td class="mono" style="font-size:9.5px;color:#475569;">${j.ref}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4">TOTAL JURNAL OTOMATIS EOD (7 PASANGAN DOUBLE-ENTRY · IMMUTABLE WORM)</td>
        <td class="num mono">${fmtNum(EOD_DEBIT)}</td>
        <td class="num mono">${fmtNum(EOD_KREDIT)}</td>
        <td class="mono" style="color:#047857;">DELTA Rp 0</td>
      </tr>
    </tfoot>
  </table>`;

  const tbTable = `<table class="e-table tight">
    <colgroup>
      <col style="width:46px" />
      <col style="width:236px" />
      <col style="width:74px" />
      <col style="width:128px" />
      <col style="width:128px" />
    </colgroup>
    <thead>
      <tr>
        <th>COA</th>
        <th>Kelompok Akun Neraca Percobaan</th>
        <th>Kategori</th>
        <th class="num">Saldo Debit (Rp)</th>
        <th class="num">Saldo Kredit (Rp)</th>
      </tr>
    </thead>
    <tbody>
      ${TRIAL_BALANCE.map(
        (t) => `<tr class="${t.coa === '115' || t.coa === '116' ? 'is-selected' : ''}">
          <td class="mono" style="font-weight:700;color:#1e3a8a;">${t.coa}</td>
          <td style="font-weight:${t.coa === '115' || t.coa === '116' ? '700' : '500'};">${esc(t.name)}</td>
          <td><span class="e-badge e-badge-${t.grp === 'Aktiva' ? 'accent' : t.grp === 'DPK' ? 'info' : t.grp === 'Kontra' ? 'warn' : 'neutral'}">${t.grp}</span></td>
          <td class="num mono" style="${t.debit > 0 ? 'font-weight:700;' : 'color:#94a3b8;'}">${t.debit > 0 ? fmtNum(t.debit) : '—'}</td>
          <td class="num mono" style="${t.kredit > 0 ? 'font-weight:700;color:#1e3a8a;' : 'color:#94a3b8;'}">${t.kredit > 0 ? fmtNum(t.kredit) : '—'}</td>
        </tr>`
      ).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">TOTAL TRIAL BALANCE KONSOLIDASI (DELTA = Rp 0)</td>
        <td class="num mono">${fmtNum(TB_DEBIT)}</td>
        <td class="num mono">${fmtNum(TB_KREDIT)}</td>
      </tr>
    </tfoot>
  </table>`;

  const syncTable = `<table class="e-table comfy">
    <colgroup>
      <col style="width:42px" />
      <col style="width:176px" />
      <col style="width:102px" />
      <col style="width:66px" />
      <col style="width:64px" />
      <col style="width:74px" />
      <col style="width:82px" />
    </colgroup>
    <thead>
      <tr><th>Unit</th><th>Cabang / Kantor Kas</th><th>WAL Checkpoint</th><th class="num">Lag</th><th class="num">Queue</th><th class="num">Partisi</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${BRANCHES.map(
        (b) => `<tr>
          <td class="mono" style="font-weight:700;">${b.code}</td>
          <td style="font-weight:600;">${esc(b.name)}</td>
          <td class="mono" style="font-size:9.6px;color:#475569;">${b.wal}</td>
          <td class="num mono" style="color:${b.lagMs > 100 ? '#b45309' : '#047857'};font-weight:600;">${b.lagMs} ms</td>
          <td class="num mono" style="color:#047857;font-weight:700;">${b.offlineQ}</td>
          <td class="num mono" style="color:#475569;">${fmtNum(b.partMb)} MB</td>
          <td>${badge(b.sync, b.tone)}</td>
        </tr>`
      ).join('')}
    </tbody>
  </table>`;

  const content = `${kpiStrip}
  <div class="bpr-grid-2" style="grid-template-columns:1.28fr 1fr;">
    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:0.86;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('play', 13, '#047857')}<span>Pipeline Eksekusi Batch End-of-Day (EOD) — 7 Tahap Terurut</span></div>
          ${badge('Run #EOD-20261120 · 48,2 dtk', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${eodWaterfall}
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;">
            <div style="padding:4px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
              <div style="font-size:8.8px;color:#64748b;font-weight:600;">Worker Engine</div>
              <div class="mono" style="font-size:10px;font-weight:700;color:#0f172a;">.NET 8 Dapper Batch</div>
            </div>
            <div style="padding:4px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
              <div style="font-size:8.8px;color:#64748b;font-weight:600;">SQL Isolation</div>
              <div class="mono" style="font-size:10px;font-weight:700;color:#1e3a8a;">SERIALIZABLE GL</div>
            </div>
            <div style="padding:4px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
              <div style="font-size:8.8px;color:#64748b;font-weight:600;">Window Eksekusi</div>
              <div class="mono" style="font-size:10px;font-weight:700;color:#0f172a;">15:00:12 – 15:01:00</div>
            </div>
            <div style="padding:4px 7px;background:#f8fafc;border:1px solid #d6dee8;border-radius:3px;">
              <div style="font-size:8.8px;color:#64748b;font-weight:600;">Arsip WORM</div>
              <div class="mono" style="font-size:10px;font-weight:700;color:#047857;">SQL Snapshot + S3-ID</div>
            </div>
          </div>
          <div class="bpr-banner-ok">
            <span>EOD Accrual Check: 2.840 fasilitas diproses | Selisih PPAP +Rp 14.220.000 | Trial Balance Delta = Rp 0 (SEIMBANG).</span>
            <span style="white-space:nowrap;">WORM LOCKED</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:1.14;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 13, '#1d4ed8')}<span>Jurnal Double-Entry Otomatis EOD (General Ledger Tak Dapat Diubah)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Append-Only Ledger', 'accent')}
            ${badge('Debit === Kredit', 'ok')}
          </div>
        </div>
        <div class="e-panel-body-flush">${journalTable}</div>
      </section>
    </div>

    <div class="bpr-col-stack">
      <section class="e-panel" style="flex:1.14;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#1d4ed8')}<span>Neraca Percobaan (Trial Balance) Konsolidasi — 20 Nov 2026</span></div>
          ${badge('Delta Rp 0 · Seimbang', 'ok')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          ${tbTable}
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d6dee8;display:flex;justify-content:space-between;font-size:9.8px;color:#334155;">
            <span><strong>Laba Berjalan YTD:</strong> <span class="mono" style="color:#047857;font-weight:700;">Rp 1.700.000.000</span></span>
            <span><strong>Aktiva Net:</strong> <span class="mono" style="font-weight:700;">Rp 66.820.000.000</span></span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.86;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#047857')}<span>SQL Server Partitioned GL & Resiliensi Store-and-Forward Cabang</span></div>
          ${badge('0 Antrean Offline', 'ok')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          ${syncTable}
          <div style="padding:6px 10px;background:#f8fafc;border-top:1px solid #d6dee8;display:flex;justify-content:space-between;font-size:9.6px;color:#475569;">
            <span>Mode Resiliensi: Local SQLite Write-Ahead Buffer (tahan putus jaringan 72 jam)</span>
            <span class="mono" style="color:#047857;font-weight:700;">Total 6,50 GB</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderBprShell({
    activeId: 'p5',
    pageTitle: 'Batch Akrual End-of-Day (EOD), Jurnal GL & Rekonsiliasi Trial Balance',
    pageSubtitle: 'Proses Tutup Buku Harian, Pembukuan Double-Entry Tak Dapat Diubah & Replikasi 7 Unit Kerja',
    actionsHtml: `<span class="e-btn">${ic('download', 12, '#334155')}Ekspor Neraca & Jurnal</span><span class="e-btn e-btn-primary">${ic('lock', 12, '#ffffff')}Kunci Tanggal Buku 20 Nov</span>`,
    contentHtml: content,
    statusNote: 'EOD 2.840 Fas | PPAP +Rp 14,22 jt | TB Delta Rp 0 (SEIMBANG)',
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
