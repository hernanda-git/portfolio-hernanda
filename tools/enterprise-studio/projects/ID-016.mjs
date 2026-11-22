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
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-016',
  name: 'EmasHaji Plan',
  reference: 'SAP S/4HANA Fiori Horizon + Workday Financial Management',
  persona: 'H. Ridwan Fadillah · VP Kustodian & Kepatuhan Syariah · PT EmasHaji Kustodi Syariah Tbk',
  pages: [
    { slug: 'p1', title: 'Ringkasan Eksekutif Kustodi Emas & Kesiapan Porsi' },
    { slug: 'p2', title: 'Buku Besar Gram & Persetujuan Pencairan (Maker-Checker)' },
    { slug: 'p3', title: 'Aplikasi Mobile Calon Jamaah (Trio Layar PWA & Kontrak API)' },
    { slug: 'p4', title: 'Katalog PPIU Resmi Kemenag & Kuota BPS-BPIH' },
    { slug: 'p5', title: 'Kepatuhan Syariah, Audit PSAK 101/102 & CoreTax XML' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================
const BUYBACK_PRICE = 1482000; // Rp 1.482.000 / gr (Antam Buyback)
const BUY_PRICE = 1509900;     // Rp 1.509.900 / gr (Antam Beli · Spread 1,85%)
const HAJI_PORSI_IDR = 25000000;
const HAJI_PORSI_GR = Number((HAJI_PORSI_IDR / BUYBACK_PRICE).toFixed(4)); // 16.8691 gr

const VAULTS = [
  { code: 'VLT-JKT-01', name: 'Brankas Utama Antam Pulogadung', city: 'Jakarta Timur', custodian: 'PT Antam UBPP LM', allocGr: 54210.40, physGr: 54290.40, bars: 1842, audit: '21 Nov 2026', status: 'Teraudit 1:1', tone: 'ok' },
  { code: 'VLT-JKT-02', name: 'Kustodian UBS & BSI Tower', city: 'Jakarta Selatan', custodian: 'BSI Custody / UBS', allocGr: 31840.25, physGr: 31885.25, bars: 1124, audit: '21 Nov 2026', status: 'Teraudit 1:1', tone: 'ok' },
  { code: 'VLT-SBY-01', name: 'Brankas Syariah Regional Jatim', city: 'Surabaya', custodian: 'Pegadaian Syariah', allocGr: 24620.80, physGr: 24655.80, bars: 896, audit: '20 Nov 2026', status: 'Teraudit 1:1', tone: 'ok' },
  { code: 'VLT-BDG-01', name: 'Kustodian Logam Mulia Jabar', city: 'Bandung', custodian: 'BSI Custody Jabar', allocGr: 15480.60, physGr: 15500.60, bars: 564, audit: '20 Nov 2026', status: 'Teraudit 1:1', tone: 'ok' },
  { code: 'VLT-MDN-01', name: 'Brankas Syariah Sumatera Utara', city: 'Medan', custodian: 'Pegadaian Syariah', allocGr: 10248.45, physGr: 10263.45, bars: 382, audit: '19 Nov 2026', status: 'Teraudit 1:1', tone: 'ok' },
  { code: 'VLT-MKS-01', name: 'Kustodian Regional KTI', city: 'Makassar', custodian: 'Bank Muamalat Vault', allocGr: 6440.00, physGr: 6445.00, bars: 248, audit: '19 Nov 2026', status: 'Buffer Siaga', tone: 'info' },
];

const COHORTS = [
  { label: 'Siap Setoran Awal (>= 16,87 gr / >= Rp 25 jt)', jamaah: 3418, gr: 68420.50, tone: 'ok', color: '#047857' },
  { label: 'Hampir Tercapai (12,00 - 16,86 gr · 75-99%)', jamaah: 3120, gr: 43180.00, tone: 'accent', color: '#9a5b00' },
  { label: 'Menabung Aktif (5,00 - 11,99 gr · 40-74%)', jamaah: 4862, gr: 24920.00, tone: 'info', color: '#0369a1' },
  { label: 'Fase Akumulasi Awal (< 5,00 gr · < 40%)', jamaah: 3420, gr: 6320.00, tone: 'neutral', color: '#78716c' },
];

const BPS_BANKS = [
  { code: 'BSI-451', name: 'Bank Syariah Indonesia (BSI)', porsiMtd: 248, slaMin: '11,4 mnt', rail: 'Host-to-Host ISO 8583', status: 'Online', tone: 'ok' },
  { code: 'BMI-147', name: 'Bank Muamalat Indonesia', porsiMtd: 82, slaMin: '14,8 mnt', rail: 'BI-FAST + SISKOHAT', status: 'Online', tone: 'ok' },
  { code: 'BCAS-536', name: 'BCA Syariah', porsiMtd: 54, slaMin: '12,1 mnt', rail: 'SNAP BI OpenAPI', status: 'Online', tone: 'ok' },
  { code: 'BMS-506', name: 'Bank Mega Syariah', porsiMtd: 42, slaMin: '16,5 mnt', rail: 'Host-to-Host ISO 8583', status: 'Online', tone: 'ok' },
  { code: 'BDS-011', name: 'Bank Danamon Syariah', porsiMtd: 34, slaMin: '18,2 mnt', rail: 'BI-FAST + SISKOHAT', status: 'Online', tone: 'ok' },
  { code: 'PDSB-517', name: 'Panin Dubai Syariah', porsiMtd: 26, slaMin: '21,4 mnt', rail: 'SNAP BI OpenAPI', status: 'Latensi +4s', tone: 'warn' },
];

const LEDGER_TX = [
  { id: 'TX-EH-2611-0841', time: '14:52:18', rek: 'REK-3171-0412', jamaah: 'H. Bambang Suryono', jenis: 'Porsi BPS-BPIH', grams: 16.8691, rate: BUYBACK_PRICE, kanal: 'BSI · Vault-JKT', doa: 'Tereksekusi', tone: 'ok' },
  { id: 'TX-EH-2611-0842', time: '14:49:04', rek: 'REK-3273-1189', jamaah: 'Siti Rahmawati', jenis: 'Auto-Nabung QRIS', grams: 0.7500, rate: BUY_PRICE, kanal: 'QRIS · Vault-BDG', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0843', time: '14:44:51', rek: 'REK-3578-0921', jamaah: 'M. Hendra Wijaya', jenis: 'Kunci PPIU #412', grams: 29.0000, rate: BUYBACK_PRICE, kanal: 'Escrow · Vault-SBY', doa: 'Siap Release', tone: 'info' },
  { id: 'TX-EH-2611-0844', time: '14:41:27', rek: 'REK-3174-0844', jamaah: 'Kel. Ahmad Fauzi', jenis: 'Porsi BPS-BPIH', grams: 18.4200, rate: BUYBACK_PRICE, kanal: 'BSI · Vault-JKT', doa: 'Menunggu Checker 2', tone: 'warn', selected: true },
  { id: 'TX-EH-2611-0845', time: '14:38:10', rek: 'REK-3175-2041', jamaah: 'Nurul Hidayah', jenis: 'Auto-Nabung VA', grams: 1.2500, rate: BUY_PRICE, kanal: 'VA BSI · Vault-JKT', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0846', time: '14:33:42', rek: 'REK-1271-0518', jamaah: 'Ir. Darmawan Putra', jenis: 'Cetak Antam 10 gr', grams: 10.0000, rate: BUYBACK_PRICE, kanal: 'Antam · Vault-MDN', doa: 'Menunggu Checker 1', tone: 'warn' },
  { id: 'TX-EH-2611-0847', time: '14:29:15', rek: 'REK-3201-4410', jamaah: 'Dewi Kartika Sari', jenis: 'Porsi BPS-BPIH', grams: 16.8691, rate: BUYBACK_PRICE, kanal: 'BMI · Vault-JKT', doa: 'Tereksekusi', tone: 'ok' },
  { id: 'TX-EH-2611-0848', time: '14:24:39', rek: 'REK-3515-1832', jamaah: 'dr. Arif Budiman', jenis: 'Kunci PPIU #108', grams: 26.5000, rate: BUYBACK_PRICE, kanal: 'Escrow · Vault-SBY', doa: 'Tereksekusi', tone: 'ok' },
  { id: 'TX-EH-2611-0849', time: '14:20:06', rek: 'REK-3172-3391', jamaah: 'Yusuf Maulana', jenis: 'Auto-Nabung QRIS', grams: 0.5000, rate: BUY_PRICE, kanal: 'QRIS · Vault-JKT', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0850', time: '14:15:48', rek: 'REK-7371-0274', jamaah: 'Hj. Andi Fatimah', jenis: 'Porsi BPS-BPIH', grams: 16.8691, rate: BUYBACK_PRICE, kanal: 'BSI · Vault-MKS', doa: 'Siap Release', tone: 'info' },
  { id: 'TX-EH-2611-0851', time: '14:11:22', rek: 'REK-3276-5120', jamaah: 'Rizky Ramadhan', jenis: 'Auto-Nabung QRIS', grams: 1.0000, rate: BUY_PRICE, kanal: 'QRIS · Vault-JKT', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0852', time: '14:07:55', rek: 'REK-3374-0619', jamaah: 'Tri Wahyuningsih', jenis: 'Kunci PPIU #219', grams: 24.0000, rate: BUYBACK_PRICE, kanal: 'Escrow · Vault-SBY', doa: 'Tertahan KYC', tone: 'bad', bad: true },
  { id: 'TX-EH-2611-0853', time: '14:02:14', rek: 'REK-3173-8824', jamaah: 'H. Agus Salim', jenis: 'Cetak Antam 5 gr', grams: 5.0000, rate: BUYBACK_PRICE, kanal: 'Antam · Vault-JKT', doa: 'Tereksekusi', tone: 'ok' },
  { id: 'TX-EH-2611-0854', time: '13:58:09', rek: 'REK-3271-1492', jamaah: 'Laila Majnunia', jenis: 'Auto-Nabung VA', grams: 0.8500, rate: BUY_PRICE, kanal: 'VA BCA · Vault-BDG', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0855', time: '13:52:33', rek: 'REK-3674-0943', jamaah: 'Fajar Nugroho', jenis: 'Porsi BPS-BPIH', grams: 16.8691, rate: BUYBACK_PRICE, kanal: 'BCAS · Vault-JKT', doa: 'Tereksekusi', tone: 'ok' },
  { id: 'TX-EH-2611-0856', time: '13:47:11', rek: 'REK-3573-2287', jamaah: 'Sri Mulyani W.', jenis: 'Auto-Nabung QRIS', grams: 0.6000, rate: BUY_PRICE, kanal: 'QRIS · Vault-SBY', doa: 'Lunas Otomatis', tone: 'ok' },
  { id: 'TX-EH-2611-0857', time: '13:41:46', rek: 'REK-1371-0408', jamaah: 'Zulkifli Hasanudin', jenis: 'Kunci PPIU #412', grams: 29.0000, rate: BUYBACK_PRICE, kanal: 'Escrow · Vault-MDN', doa: 'Menunggu Checker 2', tone: 'warn', warn: true },
  { id: 'TX-EH-2611-0858', time: '13:36:02', rek: 'REK-3174-6612', jamaah: 'Nadia Kusuma', jenis: 'Auto-Nabung QRIS', grams: 1.5000, rate: BUY_PRICE, kanal: 'QRIS · Vault-JKT', doa: 'Lunas Otomatis', tone: 'ok' },
];

const PPIU_LIST = [
  { code: 'PPIU-412', name: 'PT Safa Marwa Nusantara', sk: 'SK U.412/2025', paket: 'Umrah Syawal 9 Hr Direct CGK', targetGr: 29.0, locked: 214, quota: 240, escrowGr: 6206.00, status: 'Aktif 5-Pasti', tone: 'ok', selected: true },
  { code: 'PPIU-108', name: 'PT Al-Haramain Wisata Mulia', sk: 'SK U.108/2024', paket: 'Umrah Ramadhan 12 Hr CGK-JED', targetGr: 34.0, locked: 186, quota: 200, escrowGr: 6324.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-219', name: 'PT Zamzam Amanah Tour', sk: 'SK U.219/2025', paket: 'Umrah Reguler 9 Hr SUB-MED', targetGr: 24.0, locked: 152, quota: 180, escrowGr: 3648.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-305', name: 'PT Madinah Rahmah Travel', sk: 'SK U.305/2024', paket: 'Umrah Plus Thaif 10 Hr CGK', targetGr: 27.5, locked: 148, quota: 160, escrowGr: 4070.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-517', name: 'PT Qiblatain Persada Haji', sk: 'SK U.517/2025', paket: 'Umrah Ekonomi 9 Hr KNO-JED', targetGr: 23.0, locked: 138, quota: 150, escrowGr: 3174.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-624', name: 'PT Nabawi Berkah Abadi', sk: 'SK U.624/2025', paket: 'Umrah Keluarga 10 Hr CGK-MED', targetGr: 28.0, locked: 132, quota: 160, escrowGr: 3696.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-711', name: 'PT Baitullah Cipta Wisata', sk: 'SK U.711/2024', paket: 'Umrah Akhir Tahun 9 Hr SUB', targetGr: 25.5, locked: 124, quota: 140, escrowGr: 3162.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-803', name: 'PT Raudhah Sakinah Jaya', sk: 'SK U.803/2025', paket: 'Umrah VIP Hotel Pelataran 9 Hr', targetGr: 36.0, locked: 94, quota: 100, escrowGr: 3384.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-914', name: 'PT Mina Muzdalifah Tours', sk: 'SK U.914/2024', paket: 'Umrah Syawal 9 Hr UPG-JED', targetGr: 26.0, locked: 112, quota: 135, escrowGr: 2912.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-142', name: 'PT Ar-Rayan Syariah Travel', sk: 'SK U.142/2025', paket: 'Umrah Hemat 9 Hr CGK-JED', targetGr: 22.5, locked: 128, quota: 150, escrowGr: 2880.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-288', name: 'PT Hijrah Insan Mandiri', sk: 'SK U.288/2024', paket: 'Umrah Plus Al-Ula 11 Hr CGK', targetGr: 31.0, locked: 88, quota: 100, escrowGr: 2728.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-390', name: 'PT Darussalam Prima Tour', sk: 'SK U.390/2025', paket: 'Umrah Reguler 9 Hr BPN-JED', targetGr: 26.5, locked: 84, quota: 100, escrowGr: 2226.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-476', name: 'PT Firdaus Lintas Haramain', sk: 'SK U.476/2024', paket: 'Umrah Ramadhan Awal 10 Hr', targetGr: 30.0, locked: 76, quota: 90, escrowGr: 2280.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-559', name: 'PT Masyair Amanah Utama', sk: 'SK U.559/2025', paket: 'Umrah Reguler 9 Hr PLM-JED', targetGr: 24.0, locked: 72, quota: 90, escrowGr: 1728.00, status: 'Aktif 5-Pasti', tone: 'ok' },
  { code: 'PPIU-682', name: 'PT Kubah Hijau Nusantara', sk: 'SK U.682/2023', paket: 'Umrah Reguler 9 Hr SUB-JED', targetGr: 23.0, locked: 54, quota: 80, escrowGr: 1242.00, status: 'Audit Q4', tone: 'warn', warn: true },
  { code: 'PPIU-795', name: 'PT Sabilillah Global Wisata', sk: 'SK U.795/2023', paket: 'Umrah Transit 10 Hr CGK', targetGr: 22.0, locked: 40, quota: 80, escrowGr: 880.00, status: 'Review Izin', tone: 'bad', bad: true },
];

const COMPLIANCE_CONTROLS = [
  { code: 'SYR-01', reg: 'Fatwa DSN-MUI 77/2010', domain: 'Jual Beli Emas Tidak Tunai & Alokasi 1:1', owner: 'DPS Syariah', lastAudit: '18 Nov 2026', score: '100%', status: 'Patuh Penuh', tone: 'ok' },
  { code: 'PSAK-01', reg: 'PSAK 101 & 102 (IAI)', domain: 'Pemisahan Aset Wadiah & Laporan Syariah', owner: 'Akuntansi ERP', lastAudit: '21 Nov 2026', score: '100%', status: 'Balance Rp 0', tone: 'ok' },
  { code: 'TAX-22', reg: 'PMK 48/2023 · CoreTax', domain: 'Pemungutan PPh 22 Emas 0,25% & e-Bupot', owner: 'Tax & Treasury', lastAudit: '22 Nov 2026', score: '100%', status: 'Valid DJP', tone: 'ok' },
  { code: 'OJK-17', reg: 'POJK 17/2024 Bulion', domain: 'Rasio Cadangan Fisik >= 100% & Modal', owner: 'Kepatuhan OJK', lastAudit: '20 Nov 2026', score: '100,14%', status: 'Surplus +200g', tone: 'ok' },
  { code: 'KMG-05', reg: 'Permenag 5/2021', domain: 'Validasi Izin PPIU & Manifest SISKOPATUH', owner: 'Kemitraan PPIU', lastAudit: '22 Nov 2026', score: '14 / 16', status: '2 Review', tone: 'warn' },
  { code: 'BPH-01', reg: 'UU 8/2019 · BPS-BPIH', domain: 'Penyaluran Setoran Awal Porsi Rp 25 Juta', owner: 'Operasi Haji', lastAudit: '22 Nov 2026', score: '99,8%', status: '486 Porsi OK', tone: 'ok' },
  { code: 'PDP-27', reg: 'UU PDP No. 27/2022', domain: 'Enkripsi AES-256 NIK, KK & Paspor Jamaah', owner: 'InfoSec & DPO', lastAudit: '19 Nov 2026', score: '100%', status: 'Zero Leak', tone: 'ok' },
  { code: 'QRS-23', reg: 'PBI 23/2021 · QRIS', domain: 'Settlement Auto-Debit T+0 Biaya Rp 0', owner: 'Payment Ops', lastAudit: '22 Nov 2026', score: '99,72%', status: 'SLA OK', tone: 'ok' },
  { code: 'AUD-01', reg: 'ISAE 3402 Tipe II', domain: 'Stock Opname Batang Serial Antam/UBS', owner: 'KAP Independen', lastAudit: '15 Nov 2026', score: '5.056 btg', status: 'Wajar WTP', tone: 'ok' },
  { code: 'WRM-09', reg: 'ISO 27001 · WORM', domain: 'Rantai Bukti Jurnal & Persetujuan DoA', owner: 'Platform Ledger', lastAudit: '22 Nov 2026', score: '184.920', status: 'Hash Utuh', tone: 'ok' },
];

const WORM_LOGS = [
  { ts: '14:52:19 WIB', seq: '#184920', actor: 'BPS-GW-BSI', event: 'SPPH_ISSUED', ref: 'TX-EH-2611-0841', hash: 'sha256:9f4a8c...d21e', status: 'Verified' },
  { ts: '14:49:05 WIB', seq: '#184919', actor: 'QRIS-AUTO', event: 'GRAM_MINT_1TO1', ref: 'TX-EH-2611-0842', hash: 'sha256:3b71e2...88a4', status: 'Verified' },
  { ts: '14:45:00 WIB', seq: '#184918', actor: 'CORETAX-BOT', event: 'XML_PPH22_SIGN', ref: 'BUPOT-202611-016', hash: 'sha256:7d12f0...44c9', status: 'Verified' },
  { ts: '14:41:28 WIB', seq: '#184917', actor: 'CHK1-FADIL', event: 'DOA_APPROVE_L1', ref: 'TX-EH-2611-0844', hash: 'sha256:c04e91...9a17', status: 'Verified' },
  { ts: '14:30:00 WIB', seq: '#184916', actor: 'VAULT-SYNC', event: 'ANTAM_PROOF_143KG', ref: 'VLT-ALL-6-SITES', hash: 'sha256:5e88b3...1f62', status: 'Verified' },
  { ts: '14:15:49 WIB', seq: '#184915', actor: 'SISKOPATUH', event: 'PPIU_HEARTBEAT', ref: 'PPIU-412..795', hash: 'sha256:a19d47...70be', status: 'Verified' },
  { ts: '14:07:56 WIB', seq: '#184914', actor: 'KYC-DUKCAPIL', event: 'HOLD_MISMATCH', ref: 'TX-EH-2611-0852', hash: 'sha256:e42c19...3d05', status: 'Alert' },
];

// Computed Totals
const TOTAL_ALLOC_GR = Number(VAULTS.reduce((a, v) => a + v.allocGr, 0).toFixed(2));
const TOTAL_PHYS_GR = Number(VAULTS.reduce((a, v) => a + v.physGr, 0).toFixed(2));
const TOTAL_BUFFER_GR = Number((TOTAL_PHYS_GR - TOTAL_ALLOC_GR).toFixed(2));
const TOTAL_BARS = VAULTS.reduce((a, v) => a + v.bars, 0);
const TOTAL_AUM_IDR = Math.round(TOTAL_ALLOC_GR * BUYBACK_PRICE);
const TOTAL_PHYS_IDR = Math.round(TOTAL_PHYS_GR * BUYBACK_PRICE);
const TOTAL_BUFFER_IDR = Math.round(TOTAL_BUFFER_GR * BUYBACK_PRICE);
const CUSTODY_RATIO_PCT = (TOTAL_PHYS_GR / TOTAL_ALLOC_GR) * 100;

const TOTAL_JAMAAH = COHORTS.reduce((a, c) => a + c.jamaah, 0);
const TOTAL_COHORT_GR = Number(COHORTS.reduce((a, c) => a + c.gr, 0).toFixed(2));
const READY_JAMAAH = COHORTS[0].jamaah;

const TOTAL_PORSI_MTD = BPS_BANKS.reduce((a, b) => a + b.porsiMtd, 0);
const TOTAL_PORSI_IDR = TOTAL_PORSI_MTD * HAJI_PORSI_IDR;

const TOTAL_PPIU_LOCKED = PPIU_LIST.reduce((a, p) => a + p.locked, 0);
const TOTAL_PPIU_QUOTA = PPIU_LIST.reduce((a, p) => a + p.quota, 0);
const TOTAL_PPIU_ESCROW_GR = Number(PPIU_LIST.reduce((a, p) => a + p.escrowGr, 0).toFixed(2));
const TOTAL_PPIU_ESCROW_IDR = Math.round(TOTAL_PPIU_ESCROW_GR * BUYBACK_PRICE);
const ACTIVE_PPIU_COUNT = PPIU_LIST.filter((p) => p.tone === 'ok').length;

const LEDGER_TOTAL_GR = Number(LEDGER_TX.reduce((a, t) => a + t.grams, 0).toFixed(4));
const LEDGER_TOTAL_IDR = LEDGER_TX.reduce((a, t) => a + Math.round(t.grams * t.rate), 0);

// Tax / CoreTax figures (PMK 48/2023)
const DPP_PPH22 = 46840000000;
const PPH22_IDR = Math.round(DPP_PPH22 * 0.0025); // 117.100.000
const DPP_PPN_KUSTODI = 284800000;
const PPN_KUSTODI_IDR = Math.round(DPP_PPN_KUSTODI * 0.11); // 31.328.000
const TOTAL_TAX_IDR = PPH22_IDR + PPN_KUSTODI_IDR; // 148.428.000

// Selected Transaction Detail (Kel. Ahmad Fauzi — matches spec snippet exactly)
const FAUZI_TOTAL_GR = 18.4200;
const FAUZI_TOTAL_IDR = Math.round(FAUZI_TOTAL_GR * BUYBACK_PRICE); // 27.298.440
const FAUZI_BPIH_IDR = 25000000;
const FAUZI_BPIH_GR = 16.8691;
const FAUZI_RETAIN_GR = Number((FAUZI_TOTAL_GR - FAUZI_BPIH_GR).toFixed(4)); // 1.5509
const FAUZI_RETAIN_IDR = FAUZI_TOTAL_IDR - FAUZI_BPIH_IDR; // 2.298.440

export function verifyMath() {
  if (TOTAL_ALLOC_GR !== 142840.5) throw new Error(`TOTAL_ALLOC_GR mismatch: ${TOTAL_ALLOC_GR}`);
  if (TOTAL_PHYS_GR !== 143040.5) throw new Error(`TOTAL_PHYS_GR mismatch: ${TOTAL_PHYS_GR}`);
  if (TOTAL_BUFFER_GR !== 200) throw new Error(`TOTAL_BUFFER_GR mismatch: ${TOTAL_BUFFER_GR}`);
  if (TOTAL_AUM_IDR !== 211689621000) throw new Error(`TOTAL_AUM_IDR mismatch: ${TOTAL_AUM_IDR}`);
  if (TOTAL_AUM_IDR + TOTAL_BUFFER_IDR !== TOTAL_PHYS_IDR) {
    throw new Error(`PSAK 101 balance mismatch: ${TOTAL_AUM_IDR} + ${TOTAL_BUFFER_IDR} != ${TOTAL_PHYS_IDR}`);
  }
  if (TOTAL_JAMAAH !== 14820) throw new Error(`TOTAL_JAMAAH mismatch: ${TOTAL_JAMAAH}`);
  if (TOTAL_COHORT_GR !== TOTAL_ALLOC_GR) throw new Error(`Cohort gr mismatch: ${TOTAL_COHORT_GR} vs ${TOTAL_ALLOC_GR}`);
  if (TOTAL_PORSI_MTD !== 486) throw new Error(`TOTAL_PORSI_MTD mismatch: ${TOTAL_PORSI_MTD}`);
  if (TOTAL_PORSI_IDR !== 12150000000) throw new Error(`TOTAL_PORSI_IDR mismatch: ${TOTAL_PORSI_IDR}`);
  if (TOTAL_PPIU_LOCKED !== 1842) throw new Error(`TOTAL_PPIU_LOCKED mismatch: ${TOTAL_PPIU_LOCKED}`);
  if (ACTIVE_PPIU_COUNT !== 14) throw new Error(`ACTIVE_PPIU_COUNT mismatch: ${ACTIVE_PPIU_COUNT}`);
  if (TOTAL_PPIU_ESCROW_GR !== 50540) throw new Error(`TOTAL_PPIU_ESCROW_GR mismatch: ${TOTAL_PPIU_ESCROW_GR}`);
  for (const p of PPIU_LIST) {
    const expected = Number((p.locked * p.targetGr).toFixed(2));
    if (expected !== p.escrowGr) {
      throw new Error(`PPIU ${p.code} escrowGr mismatch: ${p.escrowGr} vs ${expected}`);
    }
  }
  if (FAUZI_TOTAL_IDR !== 27298440) throw new Error(`FAUZI_TOTAL_IDR mismatch: ${FAUZI_TOTAL_IDR}`);
  if (FAUZI_BPIH_IDR + FAUZI_RETAIN_IDR !== FAUZI_TOTAL_IDR) throw new Error('Fauzi journal imbalance');
  if (PPH22_IDR !== 117100000) throw new Error(`PPH22_IDR mismatch: ${PPH22_IDR}`);
  if (PPN_KUSTODI_IDR !== 31328000) throw new Error(`PPN_KUSTODI_IDR mismatch: ${PPN_KUSTODI_IDR}`);
  if (TOTAL_TAX_IDR !== 148428000) throw new Error(`TOTAL_TAX_IDR mismatch: ${TOTAL_TAX_IDR}`);
  if (TOTAL_BARS !== 5056) throw new Error(`TOTAL_BARS mismatch: ${TOTAL_BARS}`);
}

function fmtGr(n, digits = 2) {
  return n.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + ' gr';
}

function fmtIdrShort(n) {
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',') + ' jt';
  return fmtIdr(n);
}

// ============================================================================
// SAP FIORI HORIZON / WORKDAY ENTERPRISE SHELL (DISTINCT LIGHT-FIRST GOLD ERP)
// ============================================================================
const EXTRA_CSS = `
  .eh-shell-top {
    height: 40px;
    background: #ffffff;
    border-top: 3px solid #9a5b00;
    border-bottom: 1px solid #d6cfc2;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .eh-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 13px;
    color: #1c1917;
    letter-spacing: -0.015em;
    white-space: nowrap;
  }
  .eh-mark {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #9a5b00;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .eh-sep {
    width: 1px;
    height: 18px;
    background: #ded7ca;
    flex-shrink: 0;
  }
  .eh-select-chip {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #faf8f4;
    border: 1px solid #d6cfc2;
    color: #292524;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .eh-spot-chip {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #fdf6e7;
    border: 1px solid #e2c48a;
    color: #6e3f00;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .eh-search {
    height: 24px;
    width: 265px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f5f4f0;
    border: 1px solid #d6cfc2;
    color: #6b655d;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .eh-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbc3b4;
    color: #57534e;
  }
  .eh-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 8px;
    border-left: 1px solid #ded7ca;
    white-space: nowrap;
  }
  .eh-avatar {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #292524;
    color: #fdf6e7;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Fiori Module Ribbon */
  .eh-ribbon {
    height: 32px;
    background: #faf8f4;
    border-bottom: 1px solid #d6cfc2;
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .eh-tabs {
    display: flex;
    align-items: stretch;
    gap: 4px;
  }
  .eh-tab {
    padding: 0 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #57534e;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .eh-tab.is-active {
    color: #6e3f00;
    background: #ffffff;
    border-bottom-color: #9a5b00;
    font-weight: 700;
  }
  .eh-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #ede9e0;
    color: #44403c;
  }
  .eh-tab.is-active .eh-tab-cnt {
    background: #9a5b00;
    color: #ffffff;
  }
  .eh-ribbon-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 9.8px;
    color: #57534e;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Context Action Bar */
  .eh-actionbar {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid #e2ddd3;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .eh-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .eh-page-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #1c1917;
    letter-spacing: -0.01em;
  }
  .eh-page-sub {
    font-size: 10.5px;
    color: #6b655d;
  }

  /* Custom Table Header & Selected Row overrides for Warm Stone/Gold ERP */
  .e-panel {
    border-color: #dcd5c9;
    border-radius: 4px;
  }
  .e-panel-head {
    background: #faf8f4;
    border-bottom-color: #e2ddd3;
    height: 30px;
    padding: 0 10px;
  }
  table.e-table th {
    background: #f5f2eb;
    color: #44403c;
    border-bottom-color: #cbc3b4;
    padding: 4.5px 7px;
  }
  table.e-table td {
    padding: 4.5px 7px;
    border-bottom-color: #ece7de;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbf9;
  }
  table.e-table tfoot td {
    background: #f3efe6;
    border-top-color: #cbc3b4;
    color: #1c1917;
    padding: 5.5px 7px;
  }
  .e-badge-accent {
    background: #fdf6e7;
    color: #6e3f00;
    border-color: #e2c48a;
  }
  .e-kpi {
    border-color: #dcd5c9;
    padding: 7px 10px;
  }
  .e-kpi-val {
    font-size: 15.5px;
  }
  .e-statusbar {
    background: #ede9e0;
    border-top-color: #cbc3b4;
    color: #44403c;
    white-space: nowrap;
  }
  .e-status-group {
    gap: 10px;
    white-space: nowrap;
  }
  .e-status-item {
    white-space: nowrap;
  }
  table.e-table.e-table-tall td {
    padding: 6.2px 7px;
  }
  table.e-table.e-table-med td {
    padding: 5.5px 6px;
  }

  /* DoA Maker-Checker Stepper */
  .doa-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }
  .doa-step {
    border: 1px solid #e2ddd3;
    background: #faf8f4;
    border-radius: 3px;
    padding: 5px 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .doa-step.done {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }
  .doa-step.active {
    background: #fdf6e7;
    border-color: #9a5b00;
    box-shadow: inset 0 2px 0 #9a5b00;
  }
  .doa-step-num {
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 700;
    color: #6b655d;
  }
  .doa-step.done .doa-step-num { color: #047857; }
  .doa-step.active .doa-step-num { color: #9a5b00; }
  .doa-step-title {
    font-size: 10px;
    font-weight: 700;
    color: #1c1917;
    line-height: 1.2;
  }
  .doa-step-meta {
    font-size: 9px;
    color: #57534e;
  }

  /* Mobile Device Frame (Crisp Flat Architectural Bezel for Page 3) */
  .phone-frame {
    width: 322px;
    height: 100%;
    background: #1c1917;
    border: 2px solid #292524;
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  .phone-screen {
    flex: 1;
    background: #faf8f4;
    border-radius: 7px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #44403c;
  }
  .phone-status {
    height: 20px;
    background: #ffffff;
    border-bottom: 1px solid #ece7de;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 700;
    color: #1c1917;
    flex-shrink: 0;
  }
  .phone-appbar {
    padding: 7px 10px;
    background: #ffffff;
    border-bottom: 1px solid #e2ddd3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .phone-body {
    flex: 1;
    padding: 8px 9px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
  }
  .phone-card {
    background: #ffffff;
    border: 1px solid #e2ddd3;
    border-radius: 4px;
    padding: 7px 8px;
  }
  .phone-nav {
    height: 36px;
    background: #ffffff;
    border-top: 1px solid #e2ddd3;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    flex-shrink: 0;
  }
  .phone-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 8.5px;
    font-weight: 600;
    color: #6b655d;
  }
  .phone-nav-item.active {
    color: #9a5b00;
    font-weight: 700;
  }

  /* Code / CoreTax XML Panel */
  .xml-box {
    background: #1c1917;
    color: #e7e5e4;
    border: 1px solid #292524;
    border-radius: 3px;
    padding: 8px 10px;
    font-family: var(--e-mono);
    font-size: 9.7px;
    line-height: 1.42;
    overflow: hidden;
    white-space: pre;
  }
  .xt { color: #f59e0b; }
  .xa { color: #93c5fd; }
  .xv { color: #86efac; }
  .xc { color: #a8a29e; }
`;

function renderShell({
  activeSlug,
  pageTitle,
  pageSub,
  actionsHtml = '',
  contentHtml = '',
  statusNote = 'SISKOPATUH Kemenag: Sinkron 14:52 WIB',
}) {
  const tabs = [
    { slug: 'p1', label: 'Ringkasan Kustodi & Porsi', icon: 'layers', cnt: '142,8 kg' },
    { slug: 'p2', label: 'Buku Besar & DoA Pencairan', icon: 'fileText', cnt: '18' },
    { slug: 'p3', label: 'Aplikasi Mobile Jamaah (PWA)', icon: 'eye', cnt: '3 Layar' },
    { slug: 'p4', label: 'PPIU Kemenag & BPS-BPIH', icon: 'globe', cnt: '16 Mitra' },
    { slug: 'p5', label: 'Kepatuhan PSAK & CoreTax XML', icon: 'shield', cnt: '100%' },
  ];

  const bodyHtml = `
    <header class="eh-shell-top">
      <div style="display:flex;align-items:center;gap:9px;min-width:0;">
        <div class="eh-brand">
          <span class="eh-mark">EH</span>
          <span>EmasHaji Plan</span>
          <span style="font-size:10px;font-weight:600;color:#6b655d;padding-left:2px;">Enterprise Kustodi &amp; Haji ERP</span>
        </div>
        <span class="eh-sep"></span>
        <div class="eh-select-chip">
          ${ic('database', 11, '#9a5b00')}
          <span>PT EmasHaji Kustodi Syariah Tbk (KSEI-SYR-016)</span>
          ${ic('chevronDown', 10, '#6b655d')}
        </div>
        <div class="eh-select-chip">
          ${ic('clock', 11, '#57534e')}
          <span class="mono" style="font-size:10px;">1448 H / FY 2026 · Q4</span>
        </div>
        <div class="eh-spot-chip">
          <span class="dot dot-ok"></span>
          <span>BUYBACK ANTAM Rp 1.482.000/gr</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        <div class="eh-search">
          <span style="display:inline-flex;align-items:center;gap:5px;" class="trunc">
            ${ic('search', 11, '#78716c')}
            <span class="trunc">Cari No. Porsi, NIK, Serial Antam, PPIU...</span>
          </span>
          <span class="eh-kbd">Ctrl+K</span>
        </div>
        <div class="eh-user">
          <span class="eh-avatar">RF</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.5px;font-weight:700;color:#1c1917;">H. Ridwan Fadillah</div>
            <div style="font-size:9px;color:#6b655d;">VP Kustodian &amp; Syariah</div>
          </div>
        </div>
      </div>
    </header>

    <nav class="eh-ribbon">
      <div class="eh-tabs">
        ${tabs
          .map(
            (t) => `<div class="eh-tab ${t.slug === activeSlug ? 'is-active' : ''}">
              ${ic(t.icon, 12, t.slug === activeSlug ? '#9a5b00' : '#78716c')}
              <span>${esc(t.label)}</span>
              <span class="eh-tab-cnt">${esc(t.cnt)}</span>
            </div>`
          )
          .join('')}
      </div>
      <div class="eh-ribbon-meta">
        <span class="mono">Porsi: <strong>16,87 gr</strong></span>
        <span style="color:#cbc3b4;">|</span>
        <span class="mono">Spread: <strong>1,85%</strong></span>
        <span style="color:#cbc3b4;">|</span>
        <span style="display:inline-flex;align-items:center;gap:4px;color:#047857;font-weight:700;">
          <span class="dot dot-ok"></span>Kustodi 1:1 (${fmtPct(CUSTODY_RATIO_PCT, 2)})
        </span>
      </div>
    </nav>

    <div class="eh-actionbar">
      <div class="eh-title-row">
        <span class="eh-page-title">${esc(pageTitle)}</span>
        <span style="color:#cbc3b4;">/</span>
        <span class="eh-page-sub trunc">${esc(pageSub)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        ${actionsHtml}
      </div>
    </div>

    <main class="e-content" style="padding:9px 12px;gap:8px;">
      ${contentHtml}
    </main>

    <footer class="e-statusbar">
      <div class="e-status-group">
        <span class="e-status-item"><span class="dot dot-ok"></span><strong>${esc(statusNote)}</strong></span>
        <span class="e-status-item">6 Vault: 5.056 btg Antam/UBS 1:1</span>
        <span class="e-status-item">QRIS/VA: 99,72% (p95 118 ms)</span>
      </div>
      <div class="e-status-group">
        <span class="e-status-item">WORM #184920 (sha256:9f4a8c...d21e)</span>
        <span class="e-status-item">PSAK 101 · DSN-MUI 77/2010</span>
        <span class="e-status-item">22 Nov 2026 · 14:53 WIB</span>
      </div>
    </footer>
  `;

  return wrapEnterpriseHtml({
    title: `EmasHaji Plan — ${pageTitle}`,
    accent: '#9a5b00',
    accentSoft: '#fdf6e7',
    accentInk: '#6e3f00',
    bg: '#f5f4f0',
    surface: '#ffffff',
    surface2: '#faf8f4',
    border: '#dcd5c9',
    borderStrong: '#cbc3b4',
    text: '#1c1917',
    text2: '#44403c',
    muted: '#6b655d',
    extraCss: EXTRA_CSS,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1: RINGKASAN EKSEKUTIF KUSTODI EMAS & KESIAPAN PORSI
// ============================================================================
function renderPage1() {
  const kpiStrip = `
    <section class="e-kpi-strip" style="grid-template-columns: repeat(6, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Cadangan Emas Teralokasi</span>${ic('layers', 12, '#9a5b00')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtGr(TOTAL_ALLOC_GR, 2)}</span>
          ${svgSparkline({ points: [118, 121, 125, 129, 134, 138, 142.8], width: 58, height: 20, color: '#9a5b00' })}
        </div>
        <div class="e-kpi-foot"><span>Fisik 143.040,50 gr</span><span style="color:#047857;font-weight:700;">+200 gr buffer</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Nilai Likuidasi (AUM)</span>${ic('database', 12, '#047857')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtIdrShort(TOTAL_AUM_IDR)}</span>
          ${badge('+4,2% MoM', 'ok')}
        </div>
        <div class="e-kpi-foot"><span class="mono">Rp 211.689.621.000</span><span>Buyback Antam</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Jamaah Siap Porsi Haji</span>${ic('users', 12, '#047857')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtNum(READY_JAMAAH)}</span>
          ${badge('23,1% total', 'ok')}
        </div>
        <div class="e-kpi-foot"><span>Saldo &gt;= 16,87 gr</span><span>dari ${fmtNum(TOTAL_JAMAAH)} aktif</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Porsi BPS-BPIH (MTD)</span>${ic('checkCircle', 12, '#9a5b00')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtNum(TOTAL_PORSI_MTD)} porsi</span>
          ${badge(fmtIdrShort(TOTAL_PORSI_IDR), 'accent')}
        </div>
        <div class="e-kpi-foot"><span>6 Bank Syariah</span><span>SPPH avg 14,2 mnt</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Auto-Debit QRIS / VA</span>${ic('zap', 12, '#0369a1')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">12.640 trx</span>
          ${badge('99,72% OK', 'info')}
        </div>
        <div class="e-kpi-foot"><span>Biaya Admin Rp 0</span><span>Spread 1,85%</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rasio Kustodi Fisik 1:1</span>${ic('shield', 12, '#047857')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtPct(CUSTODY_RATIO_PCT, 2)}</span>
          ${badge('POJK 17 OK', 'ok')}
        </div>
        <div class="e-kpi-foot"><span>${fmtNum(TOTAL_BARS)} batang</span><span>DSN-MUI 77/2010</span></div>
      </div>
    </section>
  `;

  const goldPriceChart = svgMultiLineChart({
    width: 920,
    height: 260,
    xLabels: ['Des 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'Mei 26', 'Jun 26', 'Jul 26', 'Agu 26', 'Sep 26', 'Okt 26', 'Nov 26'],
    yMin: 1200,
    yMax: 1580,
    yTicks: 5,
    yFormat: (v) => `Rp ${Math.round(v)}rb`,
    series: [
      { label: 'Harga Beli Antam (Rp/gr)', color: '#9a5b00', area: true, dots: true, values: [1295, 1318, 1332, 1358, 1384, 1405, 1418, 1439, 1456, 1478, 1496, 1510] },
      { label: 'Harga Buyback Antam (Rp/gr)', color: '#047857', dots: true, values: [1270, 1293, 1307, 1332, 1358, 1378, 1391, 1412, 1429, 1450, 1468, 1482] },
      { label: 'Ekuivalen Inflasi Tunai 5% YoY', color: '#78716c', dashed: true, width: 1.4, values: [1270, 1275, 1280, 1285, 1291, 1296, 1301, 1307, 1312, 1318, 1323, 1329] },
    ],
    threshold: { value: 1378, label: 'Rata-rata Buyback 12B: Rp 1.378rb', color: '#047857' },
    annotations: [
      { index: 0, seriesIdx: 1, label: 'Des 25: Porsi perlu 19,69 gr', color: '#78716c', dy: 14 },
      { index: 11, seriesIdx: 0, label: 'Nov 26: Buyback Rp 1.482rb (16,87 gr)', color: '#9a5b00', dy: -28 },
    ],
  });

  const inflowChart = svgStackedBarChart({
    width: 560,
    height: 210,
    categories: ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov 26'],
    yFormat: (v) => `${Math.round(v / 1000)}kg`,
    series: [
      { label: 'Auto-Debit QRIS', color: '#9a5b00', values: [4820, 5240, 5690, 6120, 6680, 7420] },
      { label: 'Virtual Account Syariah', color: '#047857', values: [3140, 3420, 3680, 3910, 4290, 4680] },
      { label: 'Top-Up Korporasi / KBIHU', color: '#0369a1', values: [1920, 2080, 2240, 2410, 2650, 2940] },
    ],
  });

  const vaultRows = VAULTS.map((v) => {
    const buffer = v.physGr - v.allocGr;
    const valIdr = Math.round(v.allocGr * BUYBACK_PRICE);
    return `<tr>
      <td class="mono" style="font-weight:700;color:#6e3f00;">${esc(v.code)}</td>
      <td style="font-weight:600;">${esc(v.name)}</td>
      <td>${esc(v.custodian)}</td>
      <td class="num mono" style="font-weight:700;">${fmtGr(v.allocGr, 2)}</td>
      <td class="num mono" style="color:#047857;">+${fmtGr(buffer, 2)}</td>
      <td class="num mono">${fmtIdrShort(valIdr)}</td>
      <td class="num mono">${fmtNum(v.bars)}</td>
      <td>${badge(v.status, v.tone)}</td>
    </tr>`;
  }).join('');

  const cohortHtml = COHORTS.map((c) => {
    const pct = (c.jamaah / TOTAL_JAMAAH) * 100;
    return `<div style="display:flex;flex-direction:column;gap:3px;padding:6px 0;border-bottom:1px solid #ece7de;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <span style="font-size:10.5px;font-weight:600;color:#1c1917;">${esc(c.label)}</span>
        <span class="mono" style="font-size:10.2px;font-weight:700;color:#1c1917;">${fmtNum(c.jamaah)} jamaah · ${fmtGr(c.gr, 1)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;height:6px;background:#ece7de;border-radius:2px;overflow:hidden;">
          <div style="width:${pct.toFixed(1)}%;height:100%;background:${c.color};"></div>
        </div>
        <span class="mono" style="font-size:9.8px;color:#57534e;width:40px;text-align:right;">${fmtPct(pct, 1)}</span>
      </div>
    </div>`;
  }).join('');

  const contentHtml = `
    ${kpiStrip}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.55fr 1fr;gap:9px;">
      <!-- LEFT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex: 1.15;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#9a5b00')}<span>Keterbukaan Harga Emas Antam (Beli vs Buyback) &amp; Efisiensi Porsi Haji 12 Bulan</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('Spread Tetap 1,85%', 'accent')}
              ${badge('Sumber: UBPP LM Antam · 09:00 WIB', 'neutral')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 10px;">
            ${goldPriceChart}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding-top:6px;border-top:1px solid #ece7de;font-size:10.2px;">
              <div style="display:flex;justify-content:space-between;padding:2px 10px 2px 2px;border-right:1px solid #e2ddd3;">
                <span style="color:#6b655d;">Harga Beli Hari Ini</span>
                <strong class="mono">Rp 1.509.900/gr</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:2px 10px;border-right:1px solid #e2ddd3;">
                <span style="color:#6b655d;">Harga Buyback Bersih</span>
                <strong class="mono" style="color:#047857;">Rp 1.482.000/gr</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:2px 2px 2px 10px;">
                <span style="color:#6b655d;">Kebutuhan Porsi Rp 25 jt</span>
                <strong class="mono" style="color:#9a5b00;">16,8691 gr (-14,3% YoY)</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex: 1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#9a5b00')}<span>Rekonsiliasi Cadangan Fisik 1:1 per Brankas Kustodian (6 Lokasi Indonesia)</span></div>
            <span class="e-panel-sub mono">Opname Independen · Selisih Buku: 0,0000 gr</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:11%;">Kode</th>
                  <th style="width:24%;">Lokasi Brankas</th>
                  <th style="width:17%;">Mitra Kustodian</th>
                  <th class="num" style="width:12%;">Teralokasi</th>
                  <th class="num" style="width:10%;">Buffer</th>
                  <th class="num" style="width:10%;">Nilai AUM</th>
                  <th class="num" style="width:6%;">Batang</th>
                  <th style="width:10%;">Status</th>
                </tr>
              </thead>
              <tbody>${vaultRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL KONSOLIDASI 6 BRANKAS KUSTODIAN</td>
                  <td class="num mono">${fmtGr(TOTAL_ALLOC_GR, 2)}</td>
                  <td class="num mono" style="color:#047857;">+${fmtGr(TOTAL_BUFFER_GR, 2)}</td>
                  <td class="num mono">${fmtIdrShort(TOTAL_AUM_IDR)}</td>
                  <td class="num mono">${fmtNum(TOTAL_BARS)}</td>
                  <td>${badge('100,14% OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex: 1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#9a5b00')}<span>Akumulasi Emas Bulanan per Kanal Pembayaran (6 Bulan)</span></div>
            <span class="e-panel-sub mono">Nov 26: 15,04 kg</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            ${inflowChart}
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid #ece7de;font-size:10px;color:#57534e;">
              <span>Dominasi Auto-Debit QRIS: <strong style="color:#9a5b00;">49,3%</strong> dari total akumulasi</span>
              <span class="mono">Retensi Bulanan: <strong>94,6%</strong></span>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex: 1.15;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('users', 13, '#047857')}<span>Distribusi Kesiapan Porsi Jamaah (${fmtNum(TOTAL_JAMAAH)} Akun Aktif)</span></div>
            ${badge('Target Rp 25 jt', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:8px 11px;">
            <div>${cohortHtml}</div>
            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 9px;margin-top:6px;">
              <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:5px;display:flex;justify-content:space-between;">
                <span>Konektivitas Ekosistem GovTech &amp; Pembayaran</span>
                <span class="mono" style="color:#047857;">4/4 OPERASIONAL</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2ddd3;padding:4px 6px;border-radius:2px;">
                  <span>SISKOPATUH Kemenag</span><span class="mono" style="color:#047857;font-weight:700;">84 ms</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2ddd3;padding:4px 6px;border-radius:2px;">
                  <span>BPS-BPIH (6 Bank)</span><span class="mono" style="color:#047857;font-weight:700;">14,2 mnt</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2ddd3;padding:4px 6px;border-radius:2px;">
                  <span>Antam / UBS Custody</span><span class="mono" style="color:#047857;font-weight:700;">1:1 Sync</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2ddd3;padding:4px 6px;border-radius:2px;">
                  <span>QRIS ASPI / VA SNAP</span><span class="mono" style="color:#047857;font-weight:700;">99,72%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p1',
    pageTitle: 'Ringkasan Eksekutif Kustodi Emas & Kesiapan Porsi',
    pageSub: 'Konsolidasi 6 brankas fisik 1:1, kesiapan setoran awal Haji Rp 25 jt & arus auto-debit QRIS',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#57534e')}Sinkron Kurs Antam</span>
      <span class="e-btn">${ic('download', 11, '#57534e')}Unduh Laporan PSAK 101</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Otorisasi Batch Porsi (4)</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: BUKU BESAR GRAM & PERSETUJUAN PENCAIRAN (MAKER-CHECKER DOA)
// ============================================================================
function renderPage2() {
  const pendingDoa = LEDGER_TX.filter((t) => t.doa.includes('Menunggu') || t.doa.includes('Siap')).length;
  const heldKyc = LEDGER_TX.filter((t) => t.bad).length;

  const rowsHtml = LEDGER_TX.map((t) => {
    const val = Math.round(t.grams * t.rate);
    const cls = t.selected ? 'is-selected' : t.bad ? 'is-bad' : t.warn ? 'is-warn' : '';
    return `<tr class="${cls}">
      <td style="text-align:center;"><span class="cb ${t.selected ? 'checked' : ''}">${t.selected ? ic('check', 8, '#ffffff') : ''}</span></td>
      <td class="mono" style="font-weight:700;color:${t.selected ? '#6e3f00' : '#1c1917'};">${esc(t.id)}</td>
      <td class="mono" style="color:#57534e;">${esc(t.time)}</td>
      <td style="font-weight:600;">${esc(t.jamaah)}</td>
      <td>${esc(t.jenis)}</td>
      <td class="num mono" style="font-weight:700;">${t.grams.toFixed(4).replace('.', ',')}</td>
      <td class="num mono">${fmtIdr(val)}</td>
      <td style="color:#57534e;">${esc(t.kanal)}</td>
      <td>${badge(t.doa, t.tone)}</td>
    </tr>`;
  }).join('');

  const contentHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#ffffff;border:1px solid #dcd5c9;border-radius:4px;padding:6px 10px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-badge e-badge-accent">Semua Antrean (18)</span>
        <span class="e-badge e-badge-warn">Butuh Otorisasi DoA (${pendingDoa})</span>
        <span class="e-badge e-badge-bad">Tertahan e-KYC (${heldKyc})</span>
        <span class="e-badge e-badge-neutral">Porsi BPS-BPIH (5)</span>
        <span class="e-badge e-badge-neutral">Escrow PPIU (4)</span>
        <span class="e-badge e-badge-neutral">Auto-Nabung QRIS/VA (7)</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;font-size:10.5px;">
        <span class="mono">Total Gram Antrean: <strong>${fmtGr(LEDGER_TOTAL_GR, 4)}</strong></span>
        <span style="color:#cbc3b4;">|</span>
        <span class="mono">Nilai Batch: <strong style="color:#6e3f00;">${fmtIdr(LEDGER_TOTAL_IDR)}</strong></span>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.95fr 1fr;gap:9px;">
      <!-- LEFT: 18-ROW DENSE ACCOUNTING & APPROVAL GRID -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#9a5b00')}<span>Buku Besar Transaksi Gram &amp; Antrean Persetujuan DoA (18 Entri Aktif · 22 Nov 2026)</span></div>
          <span class="e-panel-sub mono">Sort: Waktu Terbaru · PostgreSQL Gram &amp; IDR Ledger</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-tall">
            <thead>
              <tr>
                <th style="width:3.5%;text-align:center;">#</th>
                <th style="width:13.5%;">ID Instruksi</th>
                <th style="width:7.5%;">WIB</th>
                <th style="width:15.5%;">Jamaah / Keluarga</th>
                <th style="width:13%;">Jenis Instruksi</th>
                <th class="num" style="width:9.5%;">Gram</th>
                <th class="num" style="width:13%;">Nilai Ekuivalen</th>
                <th style="width:12%;">Kanal / Vault</th>
                <th style="width:12.5%;">Status DoA</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="5">SUBTOTAL ANTREAN HALAMAN (18 INSTRUKSI TERVERIFIKASI)</td>
                <td class="num mono">${LEDGER_TOTAL_GR.toFixed(4).replace('.', ',')}</td>
                <td class="num mono">${fmtIdr(LEDGER_TOTAL_IDR)}</td>
                <td colspan="2" style="text-align:right;color:#047857;">Selisih Jurnal: Rp 0</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- RIGHT: DOA MAKER-CHECKER INSPECTOR & PSAK 101 JOURNAL -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Inspektor DoA · TX-EH-2611-0844</span></div>
          ${badge('Checker 2 Aktif', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;padding:9px 10px;">
          <!-- Jamaah Identity Card -->
          <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
              <div>
                <div style="font-size:12px;font-weight:700;color:#1c1917;">Kel. Ahmad Fauzi (REK-3174-0844)</div>
                <div style="font-size:9.8px;color:#57534e;">NIK 3174••••••••0844 · e-KYC Dukcapil Terverifikasi · Jakarta Selatan</div>
              </div>
              ${badge('Porsi 100% Siap', 'ok')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding-top:5px;border-top:1px solid #e2ddd3;">
              <div>
                <div style="font-size:9px;color:#6b655d;">Saldo Teralokasi</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#1c1917;">18,4200 gr</div>
              </div>
              <div>
                <div style="font-size:9px;color:#6b655d;">Nilai Likuidasi</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">${fmtIdr(FAUZI_TOTAL_IDR)}</div>
              </div>
              <div>
                <div style="font-size:9px;color:#6b655d;">Bank BPS-BPIH</div>
                <div style="font-size:11px;font-weight:700;color:#6e3f00;">BSI · KCP Fatmawati</div>
              </div>
            </div>
          </div>

          <!-- 4-Step DoA Maker-Checker Stepper -->
          <div>
            <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>Alur Persetujuan DoA (Delegation of Authority · Rp 25 jt)</span>
              <span class="mono" style="color:#9a5b00;">Tahap 3 / 4</span>
            </div>
            <div class="doa-steps">
              <div class="doa-step done">
                <span class="doa-step-num">01 · MAKER</span>
                <span class="doa-step-title">Aplikasi Jamaah</span>
                <span class="doa-step-meta">14:41 · PIN+Biometrik</span>
              </div>
              <div class="doa-step done">
                <span class="doa-step-num">02 · CHECKER 1</span>
                <span class="doa-step-title">Kustodi Vault-JKT</span>
                <span class="doa-step-meta">14:43 · Fadil (1:1 OK)</span>
              </div>
              <div class="doa-step active">
                <span class="doa-step-num">03 · CHECKER 2</span>
                <span class="doa-step-title">Validasi BPS-BPIH</span>
                <span class="doa-step-meta">Menunggu R. Fadillah</span>
              </div>
              <div class="doa-step">
                <span class="doa-step-num">04 · RELEASE</span>
                <span class="doa-step-title">Terbit SPPH Kemenag</span>
                <span class="doa-step-meta">Otomatis ISO 8583</span>
              </div>
            </div>
          </div>

          <!-- Double-Entry PSAK 101 / 102 Accounting Preview -->
          <div>
            <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;display:flex;justify-content:space-between;">
              <span>Entri Jurnal Ganda Otomatis (PSAK 101 · Wadiah Yad Amanah)</span>
              <span class="mono" style="color:#047857;">BALANCE Rp 0</span>
            </div>
            <table class="e-table" style="border:1px solid #e2ddd3;">
              <thead>
                <tr>
                  <th style="width:18%;">Akun COA</th>
                  <th style="width:42%;">Uraian Pos Akuntansi</th>
                  <th class="num" style="width:20%;">Debit (Rp)</th>
                  <th class="num" style="width:20%;">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="mono">2101.04</td>
                  <td>Kewajiban Titipan Emas Jamaah (18,42 gr)</td>
                  <td class="num mono">${fmtNum(FAUZI_TOTAL_IDR)}</td>
                  <td class="num mono">0</td>
                </tr>
                <tr>
                  <td class="mono">1104.12</td>
                  <td>Escrow Setoran Awal BPS-BPIH (BSI)</td>
                  <td class="num mono">0</td>
                  <td class="num mono">${fmtNum(FAUZI_BPIH_IDR)}</td>
                </tr>
                <tr>
                  <td class="mono">2101.09</td>
                  <td>Retensi Saldo Emas Sisa (1,5509 gr)</td>
                  <td class="num mono">0</td>
                  <td class="num mono">${fmtNum(FAUZI_RETAIN_IDR)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">TOTAL JURNAL SEIMBANG</td>
                  <td class="num mono">${fmtNum(FAUZI_TOTAL_IDR)}</td>
                  <td class="num mono">${fmtNum(FAUZI_TOTAL_IDR)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Allocated Antam Physical Bar Serials -->
          <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 9px;">
            <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:4px;display:flex;justify-content:space-between;">
              <span>Alokasi Serial Fisik Antam (Vault-JKT · CERT-88)</span>
              <span class="mono" style="color:#047857;">18,4200 gr Teraudit</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;font-size:10px;">
              <div style="display:flex;justify-content:space-between;">
                <span class="mono">ANT-JKT-88412 · CertiCard 999.9</span>
                <strong class="mono">10,0000 gr · Likuidasi</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span class="mono">ANT-JKT-88419 · CertiCard 999.9</span>
                <strong class="mono">5,0000 gr · Likuidasi</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span class="mono">FRAC-POOL-JKT-04 · Alokasi Pecahan</span>
                <strong class="mono">3,4200 gr (1,8691 liq / 1,5509 sisa)</strong>
              </div>
            </div>
          </div>

          <!-- Pre-Disbursement Compliance Evidence Checklist -->
          <div style="background:#ffffff;border:1px solid #e2ddd3;border-radius:3px;padding:7px 9px;">
            <div style="font-size:10px;font-weight:700;color:#44403c;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>Verifikasi Pra-Pencairan SISKOHAT &amp; e-KYC</span>
              <span class="mono" style="color:#047857;">4 / 4 LULUS</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:9.8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>1. Kesesuaian NIK &amp; Kartu Keluarga (Dukcapil)</span>
                ${badge('Cocok 100%', 'ok')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>2. Rekening Tabungan Haji BSI (7194008844)</span>
                ${badge('Aktif · Valid', 'ok')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>3. Bebas Sengketa &amp; Anti-Pencucian Uang (PPATK)</span>
                ${badge('Clear', 'ok')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>4. Estimasi Keberangkatan Kanwil DKI Jakarta</span>
                <span class="mono" style="font-weight:700;color:#6e3f00;">Kuota Reguler · ~24 Thn</span>
              </div>
            </div>
          </div>

          <!-- Audit Note & Decision CTA -->
          <div style="margin-top:auto;display:flex;flex-direction:column;gap:6px;padding-top:6px;border-top:1px solid #e2ddd3;">
            <div style="font-size:9.8px;color:#57534e;line-height:1.35;">
              <strong>Catatan Kepatuhan:</strong> Alokasi 18,4200 gr terverifikasi di Vault-JKT. Likuidasi 16,8691 gr mencukupi setoran awal Porsi Haji Rp 25.000.000 tanpa biaya penalti; sisa 1,5509 gr tetap tercatat atas nama jamaah.
            </div>
            <div style="display:flex;gap:6px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:28px;">${ic('check', 12, '#ffffff')}Setujui &amp; Kirim ke BPS-BPIH BSI</span>
              <span class="e-btn e-btn-danger" style="height:28px;">${ic('alert', 11, '#be123c')}Tahan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p2',
    pageTitle: 'Buku Besar Gram & Persetujuan Pencairan (Maker-Checker)',
    pageSub: 'Kontrol operasional pencairan porsi BPS-BPIH, penguncian PPIU Umrah, cetak fisik & jurnal ganda PSAK 101',
    actionsHtml: `
      <span class="e-btn">${ic('filter', 11, '#57534e')}Filter Entitas &amp; Vault</span>
      <span class="e-btn">${ic('download', 11, '#57534e')}Ekspor Jurnal CSV</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')}Kunci Periode Harian</span>
    `,
    contentHtml,
    statusNote: 'PostgreSQL Gram & IDR Ledger: 18 antrean aktif · DoA 4-mata aktif',
  });
}

// ============================================================================
// PAGE 3: APLIKASI MOBILE CALON JAMAAH (TRIO LAYAR PWA & KONTRAK API)
// ============================================================================
function renderPage3() {
  const miniInflationSvg = svgMultiLineChart({
    width: 280,
    height: 112,
    xLabels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5'],
    yMin: 18,
    yMax: 36,
    yTicks: 3,
    yFormat: (v) => `${Math.round(v)}jt`,
    series: [
      { label: 'Tabungan EmasHaji', color: '#9a5b00', area: true, dots: true, values: [21.0, 24.6, 28.4, 31.8, 34.8] },
      { label: 'Tunai Bank (Inflasi)', color: '#78716c', dashed: true, values: [20.0, 20.6, 21.1, 21.7, 22.2] },
    ],
    threshold: { value: 25, label: 'Porsi Rp 25 jt', color: '#047857' },
  });

  const phone1 = `
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-status"><span>14:52</span><span>5G · 92%</span></div>
        <div class="phone-appbar">
          <div>
            <div style="font-size:11px;font-weight:800;color:#1c1917;">EmasHaji · Tabungan Porsi &amp; Umrah</div>
            <div class="mono" style="font-size:8.6px;color:#6e3f00;font-weight:700;">BUYBACK ANTAM · Rp 1.482.000/gr</div>
          </div>
          <span class="e-badge e-badge-ok" style="font-size:8.5px;">e-KYC OK</span>
        </div>
        <div class="phone-body">
          <!-- Gold Balance Hero Card (Flat, Hairline, High Contrast) -->
          <div style="background:#292524;color:#faf8f4;border-radius:5px;padding:9px 10px;border-left:3px solid #d97706;">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#d6d3d1;">
              <span>Saldo Emas Fisik 1:1 · Vault-JKT</span>
              <span class="mono" style="color:#86efac;font-weight:700;">100% SIAP PORSI</span>
            </div>
            <div style="display:flex;align-items:baseline;justify-content:space-between;margin:4px 0 6px;">
              <span class="mono" style="font-size:19px;font-weight:800;color:#ffffff;">18,42 gr</span>
              <span class="mono" style="font-size:12px;font-weight:700;color:#fde68a;">Rp 27.298.440</span>
            </div>
            <div style="height:5px;background:#44403c;border-radius:2px;overflow:hidden;margin-bottom:4px;">
              <div style="width:100%;height:100%;background:#10b981;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#d6d3d1;">
              <span>Ambang Porsi Haji: 16,87 gr (Rp 25 jt)</span>
              <span class="mono" style="color:#86efac;">+1,55 gr surplus</span>
            </div>
          </div>

          <!-- Dual CTA Row -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="background:#9a5b00;color:#ffffff;border-radius:4px;padding:7px 8px;text-align:center;font-size:10.5px;font-weight:700;">Beli 0,5 Gram</div>
            <div style="background:#ffffff;color:#6e3f00;border:1px solid #9a5b00;border-radius:4px;padding:7px 8px;text-align:center;font-size:10.5px;font-weight:700;">Cek Porsi Kemenag</div>
          </div>

          <!-- Daily Transparent Spread Strip -->
          <div class="phone-card" style="padding:6px 8px;background:#fdf6e7;border-color:#e2c48a;">
            <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:#6e3f00;margin-bottom:3px;">
              <span>Transparansi Harga Antam/UBS Hari Ini</span>
              <span class="mono">Spread 1,85%</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9.5px;">
              <div>Beli: <strong class="mono">Rp 1.509.900/gr</strong></div>
              <div style="text-align:right;">Buyback: <strong class="mono" style="color:#047857;">Rp 1.482.000/gr</strong></div>
            </div>
          </div>

          <!-- 4 Core Spec Items -->
          <div style="font-size:9.5px;font-weight:700;color:#44403c;display:flex;justify-content:space-between;">
            <span>Portofolio &amp; Aktivitas Terkini</span>
            <span class="mono" style="color:#9a5b00;">4 Item Aktif</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:5px;">
            <div class="phone-card" style="padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;font-weight:700;color:#1c1917;">Auto-Nabung Bulanan</span>
                <span class="mono" style="font-size:10px;font-weight:700;color:#047857;">+0,750 gr</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#6b655d;margin-top:2px;">
                <span>GLD-301 · QRIS @ Rp 1.480.000</span>
                <span style="color:#047857;font-weight:700;">Lunas · Vault-JKT</span>
              </div>
            </div>

            <div class="phone-card" style="padding:6px 8px;border-left:2.5px solid #047857;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;font-weight:700;color:#1c1917;">Porsi Haji Reguler (Rp 25 jt)</span>
                <span class="e-badge e-badge-ok" style="font-size:8.2px;">Terpenuhi</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#6b655d;margin-top:2px;">
                <span>POR-001 · Saldo cukup setoran awal</span>
                <span class="mono" style="color:#1c1917;font-weight:600;">BPS-BPIH</span>
              </div>
            </div>

            <div class="phone-card" style="padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;font-weight:700;color:#1c1917;">Paket Umrah Syawal 9 Hari</span>
                <span class="mono" style="font-size:9.8px;font-weight:700;color:#6e3f00;">18,4 / 29 gr</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#6b655d;margin-top:2px;">
                <span>UMR-2027 · PPIU Resmi #412 · 63,5%</span>
                <span class="mono">Direct CGK</span>
              </div>
            </div>

            <div class="phone-card" style="padding:6px 8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;font-weight:700;color:#1c1917;">Sertifikat Fisik Kustodian</span>
                <span class="e-badge e-badge-ok" style="font-size:8.2px;">Teraudit 1:1</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#6b655d;margin-top:2px;">
                <span>CERT-88 · Serial Antam Vault-JKT</span>
                <span class="mono">999.9 LM</span>
              </div>
            </div>
          </div>

          <div style="margin-top:auto;background:#faf8f4;border:1px solid #dcd5c9;border-radius:4px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;font-size:8.8px;color:#44403c;">
            <span>Auto-Debit Berikutnya: <strong style="color:#1c1917;">5 Des 2026</strong></span>
            <span class="mono" style="color:#9a5b00;font-weight:700;">0,750 gr · QRIS Rp 0</span>
          </div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item active">${ic('layers', 11, '#9a5b00')}<span>Beranda</span></div>
          <div class="phone-nav-item">${ic('zap', 11, '#78716c')}<span>Beli</span></div>
          <div class="phone-nav-item">${ic('activity', 11, '#78716c')}<span>Target</span></div>
          <div class="phone-nav-item">${ic('lock', 11, '#78716c')}<span>Kustodi</span></div>
          <div class="phone-nav-item">${ic('users', 11, '#78716c')}<span>Akun</span></div>
        </div>
      </div>
    </div>
  `;

  const phone2 = `
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-status"><span>14:52</span><span>5G · 92%</span></div>
        <div class="phone-appbar">
          <div>
            <div style="font-size:11px;font-weight:800;color:#1c1917;">Kalkulator Target &amp; Kunci PPIU</div>
            <div style="font-size:8.8px;color:#6b655d;">Simulasi Inflasi vs Gram Emas 5 Tahun</div>
          </div>
          <span class="e-badge e-badge-accent" style="font-size:8.5px;">SISKOPATUH</span>
        </div>
        <div class="phone-body">
          <!-- Mode Switcher -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#ece7de;padding:3px;border-radius:4px;">
            <div style="background:#ffffff;color:#1c1917;font-size:9.5px;font-weight:700;text-align:center;padding:4px;border-radius:3px;">Porsi Haji (Rp 25 jt)</div>
            <div style="background:#9a5b00;color:#ffffff;font-size:9.5px;font-weight:700;text-align:center;padding:4px;border-radius:3px;">Umrah Syawal 2027</div>
          </div>

          <!-- Inflation vs Gold Mini Chart -->
          <div class="phone-card" style="padding:7px 8px;">
            <div style="font-size:9.5px;font-weight:700;color:#1c1917;margin-bottom:4px;">Proyeksi Daya Beli 5 Tahun (Rp Juta)</div>
            ${miniInflationSvg}
            <div style="font-size:8.8px;color:#57534e;margin-top:3px;border-top:1px solid #ece7de;padding-top:4px;">
              Menabung 0,75 gr/bln menjaga nilai tukar terhadap biaya haji &amp; tiket Umrah dibanding tabungan tunai.
            </div>
          </div>

          <!-- PPIU Official Package Lock -->
          <div class="phone-card" style="border-left:2.5px solid #9a5b00;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:10px;font-weight:700;color:#1c1917;">PT Safa Marwa Nusantara</span>
              <span class="e-badge e-badge-ok" style="font-size:8px;">PPIU #412</span>
            </div>
            <div style="font-size:8.8px;color:#57534e;margin:2px 0 5px;">Izin Kemenag SK U.412/2025 · 9 Hari Direct CGK-JED</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:#faf8f4;padding:5px;border-radius:3px;border:1px solid #ece7de;">
              <div><div style="font-size:8px;color:#6b655d;">Target</div><div class="mono" style="font-size:10px;font-weight:700;">29,00 gr</div></div>
              <div><div style="font-size:8px;color:#6b655d;">Terkumpul</div><div class="mono" style="font-size:10px;font-weight:700;color:#047857;">18,42 gr</div></div>
              <div><div style="font-size:8px;color:#6b655d;">Kurang</div><div class="mono" style="font-size:10px;font-weight:700;color:#9a5b00;">10,58 gr</div></div>
            </div>
            <div style="margin-top:6px;">
              ${renderCapacityBar(63.5, { warnAt: 95, critAt: 99 })}
            </div>
          </div>

          <!-- Auto-Debit QRIS Schedule -->
          <div class="phone-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:9.8px;font-weight:700;color:#1c1917;">Jadwal Auto-Debit Bulanan</span>
              <span class="e-badge e-badge-info" style="font-size:8px;">QRIS Aktif</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;border-bottom:1px solid #ece7de;">
              <span style="color:#6b655d;">Nominal Rutin</span><strong class="mono">0,7500 gr / tgl 5</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;border-bottom:1px solid #ece7de;">
              <span style="color:#6b655d;">Estimasi Lunas Umrah</span><strong class="mono">14 Bulan (Jan 2028)</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;">
              <span style="color:#6b655d;">Biaya Admin QRIS / VA</span><strong class="mono" style="color:#047857;">Rp 0 (Transparan)</strong>
            </div>
          </div>

          <div style="margin-top:auto;background:#9a5b00;color:#ffffff;border-radius:4px;padding:7px;text-align:center;font-size:10.5px;font-weight:700;">
            Kunci Harga Paket PPIU #412 Sekarang
          </div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item">${ic('layers', 11, '#78716c')}<span>Beranda</span></div>
          <div class="phone-nav-item">${ic('zap', 11, '#78716c')}<span>Beli</span></div>
          <div class="phone-nav-item active">${ic('activity', 11, '#9a5b00')}<span>Target</span></div>
          <div class="phone-nav-item">${ic('lock', 11, '#78716c')}<span>Kustodi</span></div>
          <div class="phone-nav-item">${ic('users', 11, '#78716c')}<span>Akun</span></div>
        </div>
      </div>
    </div>
  `;

  const phone3 = `
    <div class="phone-frame">
      <div class="phone-screen">
        <div class="phone-status"><span>14:52</span><span>5G · 92%</span></div>
        <div class="phone-appbar">
          <div>
            <div style="font-size:11px;font-weight:800;color:#1c1917;">Pencairan Porsi &amp; Kustodi 1:1</div>
            <div style="font-size:8.8px;color:#6b655d;">Direct Settlement BPS-BPIH &amp; Fisik</div>
          </div>
          <span class="e-badge e-badge-ok" style="font-size:8.5px;">CERT-88</span>
        </div>
        <div class="phone-body">
          <!-- Disbursement Destination -->
          <div class="phone-card" style="background:#ecfdf5;border-color:#a7f3d0;">
            <div style="font-size:9.2px;font-weight:700;color:#047857;margin-bottom:2px;">Tujuan Pencairan Terpilih</div>
            <div style="font-size:10.8px;font-weight:700;color:#1c1917;">Setoran Awal Porsi Haji · BPS-BPIH</div>
            <div style="font-size:8.8px;color:#44403c;">Bank Syariah Indonesia · KCP Fatmawati · SPPH Otomatis</div>
          </div>

          <!-- Execution Breakdown -->
          <div class="phone-card">
            <div style="font-size:9.8px;font-weight:700;color:#1c1917;margin-bottom:5px;">Rincian Konversi Gram ke Rupiah</div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;border-bottom:1px solid #ece7de;">
              <span style="color:#6b655d;">Saldo Emas Tersedia</span><strong class="mono">18,4200 gr</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;border-bottom:1px solid #ece7de;">
              <span style="color:#6b655d;">Gram Dilikuidasi (@ Rp 1.482rb)</span><strong class="mono" style="color:#9a5b00;">-16,8691 gr</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;border-bottom:1px solid #ece7de;">
              <span style="color:#6b655d;">Nominal Setoran Awal BPIH</span><strong class="mono" style="color:#047857;">Rp 25.000.000</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9.2px;padding:3px 0;">
              <span style="color:#6b655d;">Sisa Saldo Emas di Vault-JKT</span><strong class="mono">1,5509 gr (Rp 2,30 jt)</strong>
            </div>
          </div>

          <!-- Alternative Redemption Options -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
            <div class="phone-card" style="padding:6px 7px;">
              <div style="font-size:9px;font-weight:700;color:#1c1917;">Cetak Fisik Antam</div>
              <div style="font-size:8.3px;color:#6b655d;">Keping 5g / 10g + kurir berasuransi</div>
            </div>
            <div class="phone-card" style="padding:6px 7px;">
              <div style="font-size:9px;font-weight:700;color:#1c1917;">Transfer ke PPIU</div>
              <div style="font-size:8.3px;color:#6b655d;">Escrow aman hingga visa terbit</div>
            </div>
          </div>

          <!-- Digital Custody Certificate -->
          <div class="phone-card" style="background:#faf8f4;border:1px solid #cbc3b4;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:9.6px;font-weight:700;color:#6e3f00;">Sertifikat Kustodian 1:1 (CERT-88)</span>
              <span class="mono" style="font-size:8.5px;color:#047857;font-weight:700;">VERIFIED</span>
            </div>
            <div class="mono" style="font-size:8.6px;color:#44403c;line-height:1.45;">
              Pemilik : Kel. Ahmad Fauzi<br/>
              Serial  : ANT-JKT-88412 (10g), 88419 (5g)<br/>
              Lokasi  : Vault-JKT Antam Pulogadung<br/>
              Digest  : sha256:c04e91a8...9a17f2
            </div>
          </div>

          <div class="phone-card" style="background:#fdf6e7;border:1px solid #e2c48a;padding:6px 8px;">
            <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#6e3f00;">
              <span>Estimasi Terbit Nomor Validasi SPPH</span>
              <strong class="mono">~14 menit (H2H BSI)</strong>
            </div>
            <div style="font-size:8.3px;color:#57534e;margin-top:2px;">
              Dokumen SPPH &amp; bukti setor awal resmi otomatis tersimpan di menu Kustodi &amp; dikirim via email.
            </div>
          </div>

          <div style="margin-top:auto;background:#047857;color:#ffffff;border-radius:4px;padding:7px;text-align:center;font-size:10.5px;font-weight:700;">
            Konfirmasi Pencairan Porsi Rp 25 Juta
          </div>
        </div>
        <div class="phone-nav">
          <div class="phone-nav-item">${ic('layers', 11, '#78716c')}<span>Beranda</span></div>
          <div class="phone-nav-item">${ic('zap', 11, '#78716c')}<span>Beli</span></div>
          <div class="phone-nav-item">${ic('activity', 11, '#78716c')}<span>Target</span></div>
          <div class="phone-nav-item active">${ic('lock', 11, '#9a5b00')}<span>Kustodi</span></div>
          <div class="phone-nav-item">${ic('users', 11, '#78716c')}<span>Akun</span></div>
        </div>
      </div>
    </div>
  `;

  const apiRows = [
    { ep: 'POST /v1/auth/ekyc-dukcapil', svc: 'Edge JWT + e-KYC', p95: '162 ms', rate: '98,4%', status: 'Healthy' },
    { ep: 'GET  /v1/pricing/antam-spot', svc: 'Oracle Kurs Antam', p95: '42 ms', rate: '100,0%', status: 'Healthy' },
    { ep: 'POST /v1/ledger/gold-buy', svc: 'Gold Gram Ledger', p95: '84 ms', rate: '99,94%', status: 'Healthy' },
    { ep: 'POST /v1/qris/auto-debit', svc: 'QRIS / VA SNAP', p95: '118 ms', rate: '99,72%', status: 'Healthy' },
    { ep: 'GET  /v1/kemenag/ppiu/{id}', svc: 'SISKOPATUH Sync', p95: '148 ms', rate: '99,88%', status: 'Healthy' },
    { ep: 'POST /v1/escrow/ppiu-lock', svc: 'Escrow Gram Lock', p95: '96 ms', rate: '99,91%', status: 'Healthy' },
    { ep: 'POST /v1/bps-bpih/disburse', svc: 'H2H Bank Syariah', p95: '312 ms', rate: '99,80%', status: 'Healthy' },
    { ep: 'GET  /v1/custody/proof/{rek}', svc: 'Vault-JKT 1:1', p95: '64 ms', rate: '100,0%', status: 'Healthy' },
    { ep: 'POST /v1/cert/physical-mint', svc: 'Cetak Antam 5g/10g', p95: '194 ms', rate: '99,90%', status: 'Healthy' },
    { ep: 'GET  /v1/audit/worm-proof', svc: 'WORM SHA-256', p95: '58 ms', rate: '100,0%', status: 'Healthy' },
  ].map((r) => `<tr>
    <td class="mono" style="font-weight:600;color:#6e3f00;">${esc(r.ep)}</td>
    <td>${esc(r.svc)}</td>
    <td class="num mono">${esc(r.p95)}</td>
    <td class="num mono" style="color:#047857;font-weight:700;">${esc(r.rate)}</td>
    <td>${badge(r.status, 'ok')}</td>
  </tr>`).join('');

  const contentHtml = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1020px 1fr;gap:10px;">
      <!-- LEFT: 3-SCREEN MOBILE SUPERAPP TRIPTYCH -->
      <div class="e-panel" style="background:#ede9e0;">
        <div class="e-panel-head" style="background:#faf8f4;">
          <div class="e-panel-title">${ic('eye', 13, '#9a5b00')}<span>Pratinjau Aplikasi Mobile Calon Jamaah (Next.js PWA / .NET MAUI v3.14.2)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Akun Uji: Kel. Ahmad Fauzi (18,42 gr)', 'accent')}
            ${badge('3 Alur Inti End-to-End', 'neutral')}
          </div>
        </div>
        <div class="e-panel-body" style="padding:10px 10px;display:flex;align-items:stretch;justify-content:space-between;gap:9px;background:#ede9e0;">
          ${phone1}
          ${phone2}
          ${phone3}
        </div>
      </div>

      <!-- RIGHT: MOBILE TELEMETRY, API CONTRACT & ARCHITECTURE PANEL -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#9a5b00')}<span>Telemetri Aplikasi Mobile &amp; Konversi Jamaah</span></div>
            ${badge('v3.14.2 Prod', 'ok')}
          </div>
          <div class="e-panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:9px 10px;">
            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;color:#6b655d;">Crash-Free Sessions (30h)</div>
              <div class="mono" style="font-size:15px;font-weight:700;color:#047857;">99,96%</div>
              <div style="font-size:9px;color:#57534e;">PWA + .NET MAUI iOS/Android</div>
            </div>
            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;color:#6b655d;">Latensi API p95 Klien</div>
              <div class="mono" style="font-size:15px;font-weight:700;color:#1c1917;">118 ms</div>
              <div style="font-size:9px;color:#57534e;">Edge JWT + PostgreSQL Ledger</div>
            </div>
            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;color:#6b655d;">Keberhasilan Auto-Debit</div>
              <div class="mono" style="font-size:15px;font-weight:700;color:#9a5b00;">99,72%</div>
              <div style="font-size:9px;color:#57534e;">QRIS &amp; VA Syariah tanpa biaya</div>
            </div>
            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:7px 8px;">
              <div style="font-size:9.5px;color:#6b655d;">Lolos e-KYC Dukcapil</div>
              <div class="mono" style="font-size:15px;font-weight:700;color:#0369a1;">98,40%</div>
              <div style="font-size:9px;color:#57534e;">Liveness + OCR KTP &lt; 18 dtk</div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#9a5b00')}<span>Kontrak API Inti &amp; Kesehatan Endpoint</span></div>
            <span class="e-panel-sub mono">Node.js / .NET API</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table e-table-med">
              <thead>
                <tr>
                  <th style="width:37%;">Endpoint</th>
                  <th style="width:23%;">Layanan</th>
                  <th class="num" style="width:12%;">p95</th>
                  <th class="num" style="width:13%;">Sukses</th>
                  <th style="width:15%;">Status</th>
                </tr>
              </thead>
              <tbody>${apiRows}</tbody>
            </table>
          </div>
        </div>

        <div class="e-panel" style="flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#047857')}<span>Arsitektur 5-Lapis EmasHaji Plan</span></div>
            <span class="e-panel-sub mono">Zero Hidden Fee</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:5px;padding:8px 10px;font-size:10px;">
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#faf8f4;border:1px solid #e2ddd3;border-radius:2px;">
              <strong style="color:#6e3f00;">1. Client</strong><span>Next.js PWA / .NET MAUI (Calon Jamaah)</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#faf8f4;border:1px solid #e2ddd3;border-radius:2px;">
              <strong style="color:#6e3f00;">2. Edge Auth</strong><span>JWT Auth + Verifikasi e-KYC Dukcapil</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#faf8f4;border:1px solid #e2ddd3;border-radius:2px;">
              <strong style="color:#6e3f00;">3. Core Ledger</strong><span>Gold Gram Ledger + Target Planner Porsi</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#faf8f4;border:1px solid #e2ddd3;border-radius:2px;">
              <strong style="color:#6e3f00;">4. Integrasi</strong><span>Kustodian Antam/UBS · QRIS · SISKOPATUH</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#faf8f4;border:1px solid #e2ddd3;border-radius:2px;">
              <strong style="color:#6e3f00;">5. Storage</strong><span>PostgreSQL Gram &amp; IDR Double-Entry Ledger</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p3',
    pageTitle: 'Aplikasi Mobile Calon Jamaah (Trio Layar PWA & Kontrak API)',
    pageSub: 'Inspeksi end-to-end pengalaman tabungan gram pecahan, kalkulator inflasi Porsi/Umrah & pencairan BPS-BPIH',
    actionsHtml: `
      <span class="e-btn">${ic('sliders', 11, '#57534e')}Simulasi Kurs Antam</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')}Uji Alur Pencairan Sandbox</span>
    `,
    contentHtml,
    statusNote: 'Mobile PWA / .NET MAUI v3.14.2: 14.820 jamaah aktif · Crash-free 99,96%',
  });
}

// ============================================================================
// PAGE 4: KATALOG PPIU RESMI KEMENAG & PENYELARASAN KUOTA BPS-BPIH
// ============================================================================
function renderPage4() {
  const kpiStrip = `
    <section class="e-kpi-strip" style="grid-template-columns: repeat(5, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Mitra PPIU Resmi Kemenag</span>${ic('globe', 12, '#9a5b00')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${ACTIVE_PPIU_COUNT} / ${PPIU_LIST.length}</span>${badge('2 Review', 'warn')}</div>
        <div class="e-kpi-foot"><span>Terhubung SISKOPATUH</span><span>5-Pasti Umrah</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kursi Umrah Terkunci</span>${ic('users', 12, '#047857')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_PPIU_LOCKED)} kursi</span>${badge(fmtPct((TOTAL_PPIU_LOCKED / TOTAL_PPIU_QUOTA) * 100, 1), 'ok')}</div>
        <div class="e-kpi-foot"><span>Total kuota ${fmtNum(TOTAL_PPIU_QUOTA)}</span><span>Musim 1448 H</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Emas Escrow Paket PPIU</span>${ic('lock', 12, '#9a5b00')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtGr(TOTAL_PPIU_ESCROW_GR, 0)}</span>${badge('Teralokasi', 'accent')}</div>
        <div class="e-kpi-foot"><span class="mono">${fmtIdrShort(TOTAL_PPIU_ESCROW_IDR)}</span><span>Rilis bertahap T-14</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Bank BPS-BPIH Terhubung</span>${ic('database', 12, '#0369a1')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${BPS_BANKS.length} Bank</span>${badge('H2H Aktif', 'info')}</div>
        <div class="e-kpi-foot"><span>${fmtNum(TOTAL_PORSI_MTD)} porsi bulan ini</span><span>${fmtIdrShort(TOTAL_PORSI_IDR)}</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rata-rata Terbit SPPH</span>${ic('clock', 12, '#047857')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">14,2 mnt</span>${badge('SLA < 30m', 'ok')}</div>
        <div class="e-kpi-foot"><span>Nomor Validasi BPIH</span><span>Otomatis ke Aplikasi</span></div>
      </div>
    </section>
  `;

  const ppiuRows = PPIU_LIST.map((p) => {
    const valIdr = Math.round(p.escrowGr * BUYBACK_PRICE);
    const cls = p.selected ? 'is-selected' : p.bad ? 'is-bad' : p.warn ? 'is-warn' : '';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;color:${p.selected ? '#6e3f00' : '#1c1917'};">${esc(p.code)}</td>
      <td style="font-weight:600;">${esc(p.name)}</td>
      <td class="mono" style="color:#57534e;">${esc(p.sk)}</td>
      <td>${esc(p.paket)}</td>
      <td class="num mono">${p.targetGr.toFixed(1).replace('.', ',')} gr</td>
      <td class="num mono">${p.locked} / ${p.quota}</td>
      <td class="num mono" style="font-weight:700;">${fmtNum(p.escrowGr)} gr</td>
      <td class="num mono">${fmtIdrShort(valIdr)}</td>
      <td>${badge(p.status, p.tone)}</td>
    </tr>`;
  }).join('');

  const bankRows = BPS_BANKS.map((b) => {
    const val = b.porsiMtd * HAJI_PORSI_IDR;
    return `<tr>
      <td style="font-weight:600;">${esc(b.name)}</td>
      <td class="num mono" style="font-weight:700;">${b.porsiMtd}</td>
      <td class="num mono">${fmtIdrShort(val)}</td>
      <td class="num mono">${esc(b.slaMin)}</td>
      <td>${badge(b.status, b.tone)}</td>
    </tr>`;
  }).join('');

  const contentHtml = `
    ${kpiStrip}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.75fr 1fr;gap:9px;">
      <!-- LEFT: 16-ROW PPIU REGISTRY -->
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#9a5b00')}<span>Registri Mitra PPIU Resmi Kemenag &amp; Penguncian Escrow Gram (16 Penyelenggara)</span></div>
          <span class="e-panel-sub mono">Sinkronisasi SISKOPATUH · Update 14:15 WIB</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-med">
            <thead>
              <tr>
                <th style="width:8%;">Kode</th>
                <th style="width:18%;">Penyelenggara (PPIU)</th>
                <th style="width:10.5%;">No. SK Izin</th>
                <th style="width:17.5%;">Paket &amp; Rute</th>
                <th class="num" style="width:7%;">Target</th>
                <th class="num" style="width:9.5%;">Kursi</th>
                <th class="num" style="width:9%;">Escrow</th>
                <th class="num" style="width:9%;">Nilai</th>
                <th style="width:11.5%;">Status</th>
              </tr>
            </thead>
            <tbody>${ppiuRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL 16 MITRA PPIU TERINTEGRASI SISKOPATUH</td>
                <td class="num mono">${fmtNum(TOTAL_PPIU_LOCKED)}/${fmtNum(TOTAL_PPIU_QUOTA)}</td>
                <td class="num mono">${fmtNum(TOTAL_PPIU_ESCROW_GR)} gr</td>
                <td class="num mono">${fmtIdrShort(TOTAL_PPIU_ESCROW_IDR)}</td>
                <td>${badge('14 Aktif', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- RIGHT: BPS-BPIH BANK MATRIX + 5-PASTI ESCROW GOVERNANCE -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex: 0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('database', 13, '#0369a1')}<span>Penyaluran Setoran Awal Porsi BPS-BPIH (MTD)</span></div>
            <span class="e-panel-sub mono">Rp 25 jt / Porsi</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table e-table-med">
              <thead>
                <tr>
                  <th style="width:37%;">Bank BPS-BPIH</th>
                  <th class="num" style="width:12%;">Porsi</th>
                  <th class="num" style="width:20%;">Nominal</th>
                  <th class="num" style="width:15%;">SLA SPPH</th>
                  <th style="width:16%;">Kanal</th>
                </tr>
              </thead>
              <tbody>${bankRows}</tbody>
              <tfoot>
                <tr>
                  <td>TOTAL PENYALURAN MTD</td>
                  <td class="num mono">${fmtNum(TOTAL_PORSI_MTD)}</td>
                  <td class="num mono">${fmtIdrShort(TOTAL_PORSI_IDR)}</td>
                  <td class="num mono">14,2 mnt</td>
                  <td>${badge('100% OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#faf8f4;border-top:1px solid #e2ddd3;display:flex;justify-content:space-between;font-size:9.8px;color:#57534e;">
              <span>Antrean H2H SPPH Aktif: <strong style="color:#1c1917;">4 jamaah</strong></span>
              <span class="mono">Gagal Transfer (30h): <strong style="color:#047857;">0 transaksi</strong></span>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex: 1.15;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#047857')}<span>Verifikasi 5-Pasti &amp; Jadwal Rilis Escrow · PPIU-412</span></div>
            ${badge('SK U.412/2025', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;padding:10px 10px;gap:8px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;font-size:10px;">
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 9px;border-radius:3px;">
                <strong style="color:#047857;">1. Pasti Travel Berizin</strong>
                <div style="font-size:9.3px;color:#44403c;margin-top:2px;">SISKOPATUH Aktif s.d. 2028</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 9px;border-radius:3px;">
                <strong style="color:#047857;">2. Pasti Jadwal &amp; Kursi</strong>
                <div style="font-size:9.3px;color:#44403c;margin-top:2px;">214/240 terkunci blok maskapai</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 9px;border-radius:3px;">
                <strong style="color:#047857;">3. Pasti Terbang Direct</strong>
                <div style="font-size:9.3px;color:#44403c;margin-top:2px;">Garuda / Saudia CGK-JED</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 9px;border-radius:3px;">
                <strong style="color:#047857;">4. Pasti Hotel &amp; Visa</strong>
                <div style="font-size:9.3px;color:#44403c;margin-top:2px;">Makkah 180m · e-Visa Siskopatuh</div>
              </div>
            </div>

            <div style="background:#fdf6e7;border:1px solid #e2c48a;border-radius:3px;padding:9px 10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10.2px;font-weight:700;color:#6e3f00;margin-bottom:5px;">
                <span>5. Pasti Harga &amp; Kustodi 1:1 · PT Safa Marwa Nusantara</span>
                <span class="mono">6.206 gr Escrow</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:9.4px;color:#44403c;">
                <div>Keberangkatan<br/><strong class="mono" style="color:#1c1917;">14 Syawal 1448 H</strong></div>
                <div>Nilai Terlindung<br/><strong class="mono" style="color:#1c1917;">Rp 9,20 Miliar</strong></div>
                <div>Klaim Gagal<br/><strong class="mono" style="color:#047857;">0 kasus (100%)</strong></div>
              </div>
            </div>

            <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:9px 10px;">
              <div style="font-size:10px;font-weight:700;color:#1c1917;margin-bottom:6px;">Skema Pelepasan Escrow Emas (Anti Gagal Berangkat)</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:9.5px;">
                <div style="background:#fff;border:1px solid #dcd5c9;padding:6px 7px;border-radius:2px;">
                  <div class="mono" style="font-weight:700;color:#9a5b00;">T-30 Hari · 30%</div>
                  <div style="font-size:8.9px;color:#57534e;margin-top:2px;">DP Tiket &amp; Blok Hotel</div>
                </div>
                <div style="background:#fff;border:1px solid #dcd5c9;padding:6px 7px;border-radius:2px;">
                  <div class="mono" style="font-weight:700;color:#9a5b00;">T-14 Hari · 50%</div>
                  <div style="font-size:8.9px;color:#57534e;margin-top:2px;">Setelah e-Visa Terbit</div>
                </div>
                <div style="background:#fff;border:1px solid #dcd5c9;padding:6px 7px;border-radius:2px;">
                  <div class="mono" style="font-weight:700;color:#047857;">T+3 Pulang · 20%</div>
                  <div style="font-size:8.9px;color:#57534e;margin-top:2px;">Retensi Jaminan Layanan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p4',
    pageTitle: 'Katalog PPIU Resmi Kemenag & Penyelarasan Kuota BPS-BPIH',
    pageSub: 'Tata kelola mitra travel Umrah berizin SISKOPATUH, escrow gram anti-gagal berangkat & koneksi 6 bank BPS-BPIH',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#57534e')}Tarik Data SISKOPATUH</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 11, '#ffffff')}Audit Mitra PPIU-682</span>
    `,
    contentHtml,
    statusNote: 'SISKOPATUH & SISKOHAT Gateway: 14 PPIU aktif · 6 Bank BPS-BPIH online',
  });
}

// ============================================================================
// PAGE 5: KEPATUHAN SYARIAH, AUDIT PSAK 101/102 & PELAPORAN CORETAX XML
// ============================================================================
function renderPage5() {
  const kpiStrip = `
    <section class="e-kpi-strip" style="grid-template-columns: repeat(5, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kepatuhan Fatwa DSN-MUI</span>${ic('shield', 12, '#047857')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">100% Patuh</span>${badge('77/2010 OK', 'ok')}</div>
        <div class="e-kpi-foot"><span>Opini DPS Kuartal IV</span><span>Alokasi Fisik 1:1</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>PPh 22 Emas (PMK 48/2023)</span>${ic('fileText', 12, '#9a5b00')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(PPH22_IDR)}</span>${badge('0,25% DPP', 'accent')}</div>
        <div class="e-kpi-foot"><span class="mono">DPP Rp 46,84 M</span><span>e-Bupot CoreTax Valid</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>PPN Jasa Kustodi &amp; Cetak</span>${ic('layers', 12, '#0369a1')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(PPN_KUSTODI_IDR)}</span>${badge('11% PMK', 'info')}</div>
        <div class="e-kpi-foot"><span class="mono">Total Pajak Rp 148,4 jt</span><span>Faktur Pajak Siap</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Selisih Neraca PSAK 101</span>${ic('checkCircle', 12, '#047857')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">Rp 0</span>${badge('0,0000 gr', 'ok')}</div>
        <div class="e-kpi-foot"><span>Aset = Kewajiban + Buffer</span><span>Rekonsiliasi Harian</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rantai Log WORM SHA-256</span>${ic('lock', 12, '#1c1917')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">184.920 blk</span>${badge('Utuh 100%', 'ok')}</div>
        <div class="e-kpi-foot"><span>Immutable Audit Trail</span><span>ISO 27001 / UU PDP</span></div>
      </div>
    </section>
  `;

  const compRows = COMPLIANCE_CONTROLS.map((c) => `<tr>
    <td class="mono" style="font-weight:700;color:#6e3f00;">${esc(c.code)}</td>
    <td style="font-weight:600;">${esc(c.reg)}</td>
    <td>${esc(c.domain)}</td>
    <td style="color:#57534e;">${esc(c.owner)}</td>
    <td class="num mono" style="font-weight:700;">${esc(c.score)}</td>
    <td>${badge(c.status, c.tone)}</td>
  </tr>`).join('');

  const wormRows = WORM_LOGS.map((w) => `<tr>
    <td class="mono" style="color:#57534e;">${esc(w.ts)}</td>
    <td class="mono" style="font-weight:700;">${esc(w.seq)}</td>
    <td class="mono" style="color:#6e3f00;">${esc(w.actor)}</td>
    <td class="mono">${esc(w.event)}</td>
    <td class="mono">${esc(w.ref)}</td>
    <td class="mono" style="color:#0369a1;">${esc(w.hash)}</td>
    <td>${badge(w.status, w.status === 'Alert' ? 'bad' : 'ok')}</td>
  </tr>`).join('');

  const xmlSnippet = `<span class="xc">&lt;!-- CoreTax DJP e-Bupot PPh Pasal 22 Emas (PMK 48/2023) · Masa Nov 2026 --&gt;</span>
<span class="xt">&lt;CoreTaxBulkPPh22</span> <span class="xa">xmlns</span>=<span class="xv">"urn:djp:coretax:pph22:v2.4"</span> <span class="xa">masa</span>=<span class="xv">"2026-11"</span><span class="xt">&gt;</span>
  <span class="xt">&lt;Pemungut&gt;</span>
    <span class="xt">&lt;NPWP16&gt;</span><span class="xv">0941288401016000</span><span class="xt">&lt;/NPWP16&gt;</span>
    <span class="xt">&lt;Nama&gt;</span><span class="xv">PT EMASHAJI KUSTODI SYARIAH TBK</span><span class="xt">&lt;/Nama&gt;</span>
    <span class="xt">&lt;KodeObjekPajak&gt;</span><span class="xv">22-100-14</span><span class="xt">&lt;/KodeObjekPajak&gt;</span> <span class="xc">&lt;!-- Emas Batangan/Kustodi --&gt;</span>
  <span class="xt">&lt;/Pemungut&gt;</span>
  <span class="xt">&lt;RingkasanSetoran&gt;</span>
    <span class="xt">&lt;JumlahTransaksi&gt;</span><span class="xv">12640</span><span class="xt">&lt;/JumlahTransaksi&gt;</span>
    <span class="xt">&lt;DasarPengenaanPajak&gt;</span><span class="xv">46840000000</span><span class="xt">&lt;/DasarPengenaanPajak&gt;</span>
    <span class="xt">&lt;TarifPersen&gt;</span><span class="xv">0.25</span><span class="xt">&lt;/TarifPersen&gt;</span>
    <span class="xt">&lt;PPh22Terutang&gt;</span><span class="xv">117100000</span><span class="xt">&lt;/PPh22Terutang&gt;</span>
    <span class="xt">&lt;PPNJasaKustodi11Pct&gt;</span><span class="xv">31328000</span><span class="xt">&lt;/PPNJasaKustodi11Pct&gt;</span>
    <span class="xt">&lt;TotalKewajibanPajak&gt;</span><span class="xv">148428000</span><span class="xt">&lt;/TotalKewajibanPajak&gt;</span>
    <span class="xt">&lt;NomorNTPN&gt;</span><span class="xv">8841920411269901</span><span class="xt">&lt;/NomorNTPN&gt;</span>
  <span class="xt">&lt;/RingkasanSetoran&gt;</span>
  <span class="xt">&lt;TandaTanganElektronik&gt;</span>
    <span class="xt">&lt;Algoritma&gt;</span><span class="xv">BSrE-RSA-SHA256</span><span class="xt">&lt;/Algoritma&gt;</span>
    <span class="xt">&lt;Digest&gt;</span><span class="xv">7d12f0c84b9e31a40f82a19d47c21044c9</span><span class="xt">&lt;/Digest&gt;</span>
  <span class="xt">&lt;/TandaTanganElektronik&gt;</span>
<span class="xt">&lt;/CoreTaxBulkPPh22&gt;</span>`;

  const contentHtml = `
    ${kpiStrip}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.32fr 1fr;gap:9px;">
      <!-- LEFT COLUMN: COMPLIANCE MATRIX + WORM AUDIT LOG -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex: 1.35;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#9a5b00')}<span>Matriks Kontrol Kepatuhan Syariah, OJK Bulion, SISKOPATUH &amp; PSAK (10 Kontrol)</span></div>
            ${badge('9 Patuh · 1 Pantauan', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table e-table-med">
              <thead>
                <tr>
                  <th style="width:9.5%;">Kode</th>
                  <th style="width:22.5%;">Regulasi / Standar</th>
                  <th style="width:27.5%;">Cakupan Kontrol</th>
                  <th style="width:15.5%;">Pemilik</th>
                  <th class="num" style="width:11.5%;">Capaian</th>
                  <th style="width:13.5%;">Status</th>
                </tr>
              </thead>
              <tbody>${compRows}</tbody>
            </table>
          </div>
        </div>

        <div class="e-panel" style="flex: 1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#1c1917')}<span>Log Audit Kriptografis WORM SHA-256 (7 Blok Terbaru)</span></div>
            <span class="e-panel-sub mono">Append-Only Ledger · Zero Tamper</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table e-table-med">
              <thead>
                <tr>
                  <th style="width:15%;">Waktu</th>
                  <th style="width:11%;">Blok</th>
                  <th style="width:14%;">Aktor</th>
                  <th style="width:18%;">Peristiwa</th>
                  <th style="width:16%;">Referensi</th>
                  <th style="width:17%;">Digest SHA-256</th>
                  <th style="width:9%;">Status</th>
                </tr>
              </thead>
              <tbody>${wormRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: CORETAX XML PAYLOAD + PSAK 101 CUSTODY BALANCE SHEET -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div class="e-panel" style="flex: 1.28;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#9a5b00')}<span>Payload Pelaporan CoreTax XML · e-Bupot PPh 22 Emas</span></div>
            ${badge('Skema DJP v2.4 Valid', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
            <div class="xml-box" style="flex:1;">${xmlSnippet}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:9.6px;">
              <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:5px 7px;">
                <div style="color:#6b655d;font-size:8.8px;">Status Validasi XSD</div>
                <strong style="color:#047857;">0 Error · 0 Warning</strong>
              </div>
              <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:5px 7px;">
                <div style="color:#6b655d;font-size:8.8px;">Bukti Terima (NTTE)</div>
                <strong class="mono">DJP-261122-008419</strong>
              </div>
              <div style="background:#faf8f4;border:1px solid #e2ddd3;border-radius:3px;padding:5px 7px;">
                <div style="color:#6b655d;font-size:8.8px;">Penandatangan BSrE</div>
                <strong>H. Ridwan Fadillah</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex: 0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#047857')}<span>Neraca Kustodi Syariah Harian (PSAK 101 · 22 Nov 2026)</span></div>
            ${badge('Selisih Rp 0', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table e-table-med">
              <thead>
                <tr>
                  <th style="width:46%;">Pos Laporan Posisi Keuangan Syariah</th>
                  <th class="num" style="width:22%;">Ekuivalen Gram</th>
                  <th class="num" style="width:32%;">Nilai Wajar Buyback (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight:700;color:#6e3f00;">ASET KUSTODI FISIK (6 BRANKAS)</td>
                  <td class="num mono" style="font-weight:700;">${fmtGr(TOTAL_PHYS_GR, 2)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(TOTAL_PHYS_IDR)}</td>
                </tr>
                <tr>
                  <td style="padding-left:16px;">Aset Titipan Emas Antam/UBS (Wadiah)</td>
                  <td class="num mono">${fmtGr(TOTAL_ALLOC_GR, 2)}</td>
                  <td class="num mono">${fmtIdr(TOTAL_AUM_IDR)}</td>
                </tr>
                <tr>
                  <td style="padding-left:16px;">Cadangan Fisik Buffer Likuiditas T+0</td>
                  <td class="num mono">${fmtGr(TOTAL_BUFFER_GR, 2)}</td>
                  <td class="num mono">${fmtIdr(TOTAL_BUFFER_IDR)}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#047857;">KEWAJIBAN &amp; EKUITAS BUFFER</td>
                  <td class="num mono" style="font-weight:700;">${fmtGr(TOTAL_PHYS_GR, 2)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(TOTAL_PHYS_IDR)}</td>
                </tr>
                <tr>
                  <td style="padding-left:16px;">Hak Titipan Emas 14.820 Jamaah</td>
                  <td class="num mono">${fmtGr(TOTAL_ALLOC_GR, 2)}</td>
                  <td class="num mono">${fmtIdr(TOTAL_AUM_IDR)}</td>
                </tr>
                <tr>
                  <td style="padding-left:16px;">Ekuitas Cadangan Penyangga Kustodian</td>
                  <td class="num mono">${fmtGr(TOTAL_BUFFER_GR, 2)}</td>
                  <td class="num mono">${fmtIdr(TOTAL_BUFFER_IDR)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>SELISIH REKONSILIASI (ASET - KEWAJIBAN)</td>
                  <td class="num mono" style="color:#047857;">0,00 gr</td>
                  <td class="num mono" style="color:#047857;">Rp 0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeSlug: 'p5',
    pageTitle: 'Kepatuhan Syariah, Audit PSAK 101/102 & Pelaporan CoreTax XML',
    pageSub: 'Tata kelola Fatwa DSN-MUI 77/2010, POJK 17/2024 Bulion, e-Bupot PPh 22 PMK 48/2023 & rantai bukti WORM SHA-256',
    actionsHtml: `
      <span class="e-btn">${ic('download', 11, '#57534e')}Unduh Paket Audit DPS</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Kirim Batch CoreTax XML</span>
    `,
    contentHtml,
    statusNote: 'CoreTax DJP XML v2.4: Valid & Terverifikasi BSrE · PSAK 101 Balance Rp 0',
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
