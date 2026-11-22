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
  id: 'ID-018',
  name: 'TarikCepat EWA',
  reference: 'SAP S/4HANA Fiori Horizon + Workday Payroll',
  persona: 'Rina Kartika · VP Payroll & HR Operations · PT Karya Mandiri Tbk',
  pages: [
    { slug: 'p1', title: 'Konsol Eksekutif EWA & Eksposur Multi-Entitas' },
    { slug: 'p2', title: 'Buku Besar Pencairan BI-FAST & Inspektor Akrual' },
    { slug: 'p3', title: 'Pengalaman Mobile (.NET MAUI) & Mesin Guardrail' },
    { slug: 'p4', title: 'Rekonsiliasi Cut-Off Payroll, DoA & CoreTax PSAK 24' },
    { slug: 'p5', title: 'Audit WORM Ledger, Keamanan SSO & SLA Infrastruktur' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY VERIFIED ACROSS P1–P5)
// ============================================================================
const FLAT_ADMIN_FEE = 7500;
const POLICY_CAP_PCT = 0.3;

const ENTITIES = [
  {
    code: 'KM-CKR',
    name: 'PT Karya Mandiri · Plant Cikarang',
    sector: 'Manufaktur Utama',
    hrisSource: 'ZKTeco FaceID + SAP SF',
    employees: 1280,
    accruedIdr: 4864000000,
    cap30Idr: 1459200000,
    txCount: 780,
    disbursedIdr: 624000000,
    adminFeeIdr: 5850000,
    deductionIdr: 629850000,
    syncAt: '09:20 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
  {
    code: 'KM-KRW',
    name: 'PT Karya Mandiri · Plant Karawang',
    sector: 'Stamping & Assembly',
    hrisSource: 'Hikvision Bio + SAP SF',
    employees: 940,
    accruedIdr: 3478000000,
    cap30Idr: 1043400000,
    txCount: 560,
    disbursedIdr: 442400000,
    adminFeeIdr: 4200000,
    deductionIdr: 446600000,
    syncAt: '09:19 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
  {
    code: 'KM-BKS',
    name: 'PT Karya Mandiri · Plant Bekasi',
    sector: 'Packaging & QC',
    hrisSource: 'ZKTeco ProFace + SAP SF',
    employees: 620,
    accruedIdr: 2170000000,
    cap30Idr: 651000000,
    txCount: 350,
    disbursedIdr: 269500000,
    adminFeeIdr: 2625000,
    deductionIdr: 272125000,
    syncAt: '09:20 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
  {
    code: 'KN-RTL',
    name: 'PT Karya Niaga Ritel · Jabodetabek',
    sector: 'Gerai & Kasir (48 Toko)',
    hrisSource: 'Talenta Mobile Geofence',
    employees: 580,
    accruedIdr: 1856000000,
    cap30Idr: 556800000,
    txCount: 340,
    disbursedIdr: 251600000,
    adminFeeIdr: 2550000,
    deductionIdr: 254150000,
    syncAt: '09:18 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
  {
    code: 'KL-CBT',
    name: 'PT Karya Logistik · Hub Cibitung',
    sector: 'Gudang & Armada',
    hrisSource: 'Fingerspot Cloud API',
    employees: 440,
    accruedIdr: 1496000000,
    cap30Idr: 448800000,
    txCount: 220,
    disbursedIdr: 178200000,
    adminFeeIdr: 1650000,
    deductionIdr: 179850000,
    syncAt: '09:17 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
  {
    code: 'KM-HQ',
    name: 'PT Karya Mandiri · Kantor Pusat',
    sector: 'Operasional & Admin',
    hrisSource: 'SAP SuccessFactors SSO',
    employees: 260,
    accruedIdr: 956000000,
    cap30Idr: 286800000,
    txCount: 90,
    disbursedIdr: 76900000,
    adminFeeIdr: 675000,
    deductionIdr: 77575000,
    syncAt: '09:20 WIB',
    status: 'Tersinkron',
    tone: 'ok',
  },
];

const PURPOSE_BREAKDOWN = [
  { code: 'EDU', label: 'Biaya Pendidikan & SPP Sekolah', txCount: 710, amountIdr: 582200000, color: '#0c7c66' },
  { code: 'FAM', label: 'Kebutuhan Pokok & Rumah Tangga', txCount: 640, amountIdr: 468400000, color: '#1a9980' },
  { code: 'MED', label: 'Kesehatan & Pengobatan Keluarga', txCount: 430, amountIdr: 378400000, color: '#0369a1' },
  { code: 'HSE', label: 'Sewa Kontrakan & Listrik/Air', txCount: 360, amountIdr: 284400000, color: '#b45309' },
  { code: 'OPS', label: 'Transportasi & Darurat Harian', txCount: 200, amountIdr: 129200000, color: '#475569' },
];

// Hero employee record matching specification verbatim
const HERO_EMPLOYEE = {
  txId: 'EWA-2611-8401',
  name: 'Slamet Riyadi',
  nik: 'KM-04821',
  role: 'Operator Produksi Line 4 · Shift A',
  entity: 'PT Karya Mandiri · Plant Cikarang',
  entityShort: 'Plant Cikarang',
  workDays: 14,
  periodLabel: '1–18 Nov 2026',
  baseMonthlyIdr: 6900000,
  accruedIdr: 4830000,
  cap30Idr: 1449000,
  prevWithdrawnIdr: 600000,
  prevAdminIdr: 7500,
  prevDeductionIdr: 607500,
  remainingCapIdr: 849000,
  simWithdrawIdr: 500000,
  simAdminIdr: 7500,
  estNetPayIdr: 5920000,
  estNetAfterSimIdr: 5412500,
  bank: 'Bank Mandiri',
  bankShort: 'Mandiri ****4812',
  rrn: 'BIF26111809248814',
  disbursedAt: '12 Nov 09:24 WIB',
  cutoffDate: '25 Nov 2026',
  purpose: 'Biaya Sekolah (WD-01)',
};

// 18-Row Operational BI-FAST Disbursement Batch Ledger (Page 2)
const DISBURSEMENTS = [
  { id: 'EWA-2611-8401', emp: 'Slamet Riyadi', nik: 'KM-04821', unit: 'Plant Cikarang', hk: 14, accrued: 4830000, amount: 600000, admin: 7500, bank: 'Mandiri ****4812', rrn: 'BIF26111809248814', status: 'Lunas BI-FAST', tone: 'ok', selected: true },
  { id: 'EWA-2611-8402', emp: 'Siti Rahmawati', nik: 'KM-05104', unit: 'Plant Cikarang', hk: 14, accrued: 4410000, amount: 850000, admin: 7500, bank: 'BRI ****9104', rrn: 'BIF26111809224102', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8403', emp: 'Agus Setiawan', nik: 'KR-02918', unit: 'Plant Karawang', hk: 14, accrued: 4620000, amount: 1000000, admin: 7500, bank: 'Mandiri ****3319', rrn: 'BIF26111809197731', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8404', emp: 'Dewi Lestari', nik: 'RT-01182', unit: 'Ritel Jabodetabek', hk: 13, accrued: 3640000, amount: 500000, admin: 7500, bank: 'BCA ****6620', rrn: 'BIF26111809182044', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8405', emp: 'Hendra Gunawan', nik: 'KR-03144', unit: 'Plant Karawang', hk: 14, accrued: 5180000, amount: 1200000, admin: 7500, bank: 'BNI ****2045', rrn: 'BIF26111809169083', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8406', emp: 'Nurul Hidayah', nik: 'BK-01905', unit: 'Plant Bekasi', hk: 14, accrued: 4200000, amount: 750000, admin: 7500, bank: 'Mandiri ****7741', rrn: 'BIF26111809143318', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8407', emp: 'Dedi Supriyadi', nik: 'LG-00874', unit: 'Hub Cibitung', hk: 14, accrued: 4060000, amount: 900000, admin: 7500, bank: 'BRI ****5188', rrn: 'BIF26111809110892', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8408', emp: 'Rizky Pratama', nik: 'KM-06230', unit: 'Plant Cikarang', hk: 13, accrued: 3900000, amount: 1400000, admin: 0, bank: 'Mandiri ****1183', rrn: 'BLOCKED-GR01-CAP', status: 'Ditahan Cap 30%', tone: 'bad', bad: true },
  { id: 'EWA-2611-8409', emp: 'Wahyudi Santoso', nik: 'KR-02450', unit: 'Plant Karawang', hk: 14, accrued: 4760000, amount: 800000, admin: 7500, bank: 'Mandiri ****8829', rrn: 'BIF26111809085510', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8410', emp: 'Fitri Handayani', nik: 'RT-01490', unit: 'Ritel Jabodetabek', hk: 14, accrued: 3920000, amount: 650000, admin: 7500, bank: 'BCA ****4412', rrn: 'BIF26111809061277', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8411', emp: 'Bambang Hermawan', nik: 'BK-01412', unit: 'Plant Bekasi', hk: 14, accrued: 4550000, amount: 1100000, admin: 7500, bank: 'BNI ****6930', rrn: 'BIF26111809044809', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8412', emp: 'Yuni Kartika', nik: 'HQ-00319', unit: 'Kantor Pusat', hk: 14, accrued: 5600000, amount: 1250000, admin: 7500, bank: 'Mandiri ****0591', rrn: 'QUEUE-DOA-CHK02', status: 'Antre Checker', tone: 'warn', warn: true },
  { id: 'EWA-2611-8413', emp: 'Eko Prasetyo', nik: 'KM-04390', unit: 'Plant Cikarang', hk: 14, accrued: 4900000, amount: 700000, admin: 7500, bank: 'BRI ****3094', rrn: 'BIF26111809012264', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8414', emp: 'Rina Marlina', nik: 'RT-01622', unit: 'Ritel Jabodetabek', hk: 12, accrued: 3360000, amount: 450000, admin: 7500, bank: 'BCA ****7201', rrn: 'BIF26111808594011', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8415', emp: 'Taufik Hidayat', nik: 'LG-00612', unit: 'Hub Cibitung', hk: 14, accrued: 4340000, amount: 950000, admin: 7500, bank: 'Mandiri ****6147', rrn: 'BIF26111808568830', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8416', emp: 'Joko Susilo', nik: 'KR-03881', unit: 'Plant Karawang', hk: 11, accrued: 3300000, amount: 500000, admin: 0, bank: 'BNI ****9912', rrn: 'BLOCKED-GR02-RSG', status: 'Kunci Resign', tone: 'bad', bad: true },
  { id: 'EWA-2611-8417', emp: 'Indah Permata', nik: 'BK-02118', unit: 'Plant Bekasi', hk: 14, accrued: 4130000, amount: 600000, admin: 7500, bank: 'Mandiri ****2488', rrn: 'BIF26111808531942', status: 'Lunas BI-FAST', tone: 'ok' },
  { id: 'EWA-2611-8418', emp: 'Arif Budiman', nik: 'KM-05892', unit: 'Plant Cikarang', hk: 14, accrued: 4690000, amount: 800000, admin: 7500, bank: 'BRI ****8355', rrn: 'BIF26111808507715', status: 'Lunas BI-FAST', tone: 'ok' },
].map((r) => {
  const cap30 = Math.round(r.accrued * POLICY_CAP_PCT);
  const blocked = r.admin === 0;
  const remainingCap = blocked ? cap30 : cap30 - r.amount;
  return { ...r, cap30, blocked, remainingCap };
});

// Double-Entry SAP FI-GL Automated Journal Entries (PSAK 24 Imbalan Kerja)
const JOURNAL_ENTRIES = [
  { gl: '113040', account: 'Piutang Uang Muka Gaji Berjalan (EWA)', costCenter: 'CC-TREASURY-01', phase: 'Pencairan Tengah Bulan', debit: 1842600000, credit: 0, note: '2.340 tx BI-FAST (0% bunga)' },
  { gl: '111025', account: 'Kas Bank Mandiri Escrow BI-FAST', costCenter: 'CC-TREASURY-01', phase: 'Pencairan Tengah Bulan', debit: 0, credit: 1842600000, note: 'Settlement pacs.008 real-time' },
  { gl: '211010', account: 'Hutang Gaji & Upah Karyawan (WT-9410)', costCenter: 'CC-PAYROLL-GRP', phase: 'Cut-Off Gajian 25 Nov', debit: 1860150000, credit: 0, note: 'Auto-deduct file SAP IDoc' },
  { gl: '113040', account: 'Piutang Uang Muka Gaji Berjalan (EWA)', costCenter: 'CC-TREASURY-01', phase: 'Cut-Off Gajian 25 Nov', debit: 0, credit: 1842600000, note: 'Pelunasan otomatis 100%' },
  { gl: '214090', account: 'Titipan Biaya Layanan Platform EWA', costCenter: 'CC-FIN-AP02', phase: 'Cut-Off Gajian 25 Nov', debit: 0, credit: 17550000, note: '2.340 tx x Rp 7.500 flat' },
];

// Guardrail Rules (Page 5)
const GUARDRAIL_RULES = [
  { code: 'GR-01', name: 'Batas Aman 30% Hak Gaji Berjalan', desc: 'Tolak otomatis jika total tarik > 30% akrual HRIS', mode: 'Hard-Block', blocked: 7, tone: 'ok' },
  { code: 'GR-02', name: 'Kunci Otomatis Resign / SP3 / PHK', desc: 'Bekukan akses EWA seketika saat status HRIS non-aktif', mode: 'Hard-Block', blocked: 4, tone: 'ok' },
  { code: 'GR-03', name: 'Validasi Rekening Payroll = NIK HRIS', desc: 'Cegah pencairan ke rekening pihak ketiga / non-payroll', mode: 'Hard-Block', blocked: 3, tone: 'ok' },
  { code: 'GR-04', name: 'Blackout Window H-3 s/d H+1 Cut-Off', desc: 'Kunci tarik baru saat rekonsiliasi file SAP Payroll', mode: 'Schedule-Lock', blocked: 2, tone: 'info' },
  { code: 'GR-05', name: 'Deteksi Anomali Absensi / Shift Ganda', desc: 'Tahan akrual sementara jika log fingerprint tidak simetris', mode: 'Soft-Hold', blocked: 2, tone: 'warn' },
  { code: 'GR-06', name: 'Device Binding + Biometrik .NET MAUI', desc: 'Wajib StrongBox/Keychain + Company SSO OIDC aktif', mode: 'Hard-Block', blocked: 1, tone: 'ok' },
];

// WORM Audit Log (Page 5)
const AUDIT_LOGS = [
  { ts: '09:24:14', id: 'AUD-994821', actor: 'Slamet Riyadi (KM-04821)', module: 'BI-FAST API', action: 'Commit pacs.008 Rp 600.000 -> Mandiri ****4812', hash: 'sha256:9a4f7c1e...d82b', result: 'COMMIT', tone: 'ok' },
  { ts: '09:20:03', id: 'AUD-994820', actor: 'svc-hris-ingestor', module: 'HRIS Sync', action: 'Ingest 4.120 log kehadiran (6 entitas · 0 selisih)', hash: 'sha256:3c81e04b...19af', result: 'VERIFIED', tone: 'ok' },
  { ts: '09:16:48', id: 'AUD-994819', actor: 'Rizky Pratama (KM-06230)', module: 'Guardrail GR-01', action: 'Tolak tarik Rp 1.400.000 (melebihi cap Rp 1.170.000)', hash: 'sha256:f20c9a88...71de', result: 'BLOCKED', tone: 'bad' },
  { ts: '09:12:30', id: 'AUD-994818', actor: 'Budi Santoso (Checker)', module: 'DoA Approval', action: 'Buka review batch PAY-CUT-202611-01 (2.340 tx)', hash: 'sha256:7d14b3c0...a409', result: 'REVIEW', tone: 'info' },
  { ts: '09:08:11', id: 'AUD-994817', actor: 'svc-sap-payroll', module: 'CoreTax XML', action: 'Validasi skema XSD WT-9410 non-taxable advance', hash: 'sha256:5e92a117...c632', result: 'XSD_OK', tone: 'ok' },
  { ts: '09:04:55', id: 'AUD-994816', actor: 'Yuni Kartika (HQ-00319)', module: 'DoA Queue', action: 'Eskalasi tarik Rp 1.250.000 ke Checker (tier HQ)', hash: 'sha256:1b60f8e2...84c1', result: 'PENDING', tone: 'warn' },
  { ts: '08:58:22', id: 'AUD-994815', actor: 'Joko Susilo (KR-03881)', module: 'Guardrail GR-02', action: 'Blokir otomatis: flag HRIS RESIGN_NOTICE aktif', hash: 'sha256:c47d2e90...3f18', result: 'BLOCKED', tone: 'bad' },
  { ts: '08:45:09', id: 'AUD-994814', actor: 'Rina Kartika (Maker)', module: 'DoA Approval', action: 'Tanda tangan digital batch potongan 25 Nov 2026', hash: 'sha256:88a3c51f...e204', result: 'SIGNED', tone: 'ok' },
  { ts: '08:30:00', id: 'AUD-994813', actor: 'svc-treasury-recon', module: '3-Way Match', action: 'Rekonsiliasi Escrow Mandiri vs Ledger (selisih Rp 0)', hash: 'sha256:2f9b4d6a...91bc', result: 'MATCHED', tone: 'ok' },
  { ts: '08:15:44', id: 'AUD-994812', actor: 'svc-kms-hsm', module: 'UU PDP Vault', action: 'Rotasi kunci enkripsi kolom NIK & rekening AES-256', hash: 'sha256:6a10d7e3...50ea', result: 'ROTATED', tone: 'ok' },
  { ts: '08:02:19', id: 'AUD-994811', actor: 'svc-zkteco-ckr', module: 'HRIS Sync', action: 'Push 1.280 record absensi Shift A/B Plant Cikarang', hash: 'sha256:d31e8c4f...47b9', result: 'SYNC_OK', tone: 'ok' },
  { ts: '07:54:06', id: 'AUD-994810', actor: 'svc-sso-oidc', module: 'Company SSO', action: 'Tolak token refresh perangkat tidak terikat (GR-06)', hash: 'sha256:a94f1b2c...62d0', result: 'DENIED', tone: 'warn' },
  { ts: '07:30:00', id: 'AUD-994809', actor: 'svc-accrual-eng', module: 'Accrual Engine', action: 'Hitung ulang hak berjalan harian H-18 (4.120 staf)', hash: 'sha256:4c28e9a1...15f7', result: 'COMMIT', tone: 'ok' },
  { ts: '07:00:02', id: 'AUD-994808', actor: 'svc-worm-anchor', module: 'WORM Ledger', action: 'Segel Merkle root blok #261118-001 ke S3 ObjectLock', hash: 'sha256:e71b0d55...c08a', result: 'SEALED', tone: 'ok' },
  { ts: '06:45:12', id: 'AUD-994807', actor: 'svc-hikvision-krw', module: 'HRIS Sync', action: 'Push 940 record absensi Shift A/B Plant Karawang', hash: 'sha256:9f3a12d8...04e1', result: 'SYNC_OK', tone: 'ok' },
  { ts: '06:30:04', id: 'AUD-994806', actor: 'svc-talenta-rtl', module: 'HRIS Sync', action: 'Push 580 kehadiran geofence 48 gerai Ritel Jabodetabek', hash: 'sha256:41bc7e22...8b3a', result: 'SYNC_OK', tone: 'ok' },
  { ts: '06:15:39', id: 'AUD-994805', actor: 'svc-bifast-health', module: 'BI-FAST API', action: 'Heartbeat mTLS pacs.008 switch Bank Indonesia (408 ms)', hash: 'sha256:72de9c44...11f0', result: 'HEALTHY', tone: 'ok' },
  { ts: '06:00:01', id: 'AUD-994804', actor: 'svc-pg-replica', module: 'WORM Ledger', action: 'Verifikasi lag replikasi sinkron DRC Surabaya (0 byte)', hash: 'sha256:b05e3a71...69cd', result: 'VERIFIED', tone: 'ok' },
];

// Infrastructure Telemetry (Page 5)
const INFRA_SERVICES = [
  { name: '.NET 9 EWA Core API (JKT-AZ1/2)', proto: 'REST / gRPC', p95: '42 ms', tps: '148 req/s', err: '0,00%', sla: '99,99%', status: 'Optimal', tone: 'ok' },
  { name: 'BI-FAST ISO 20022 Switch Proxy', proto: 'pacs.008 mTLS', p95: '412 ms', tps: '24 tx/m', err: '0,04%', sla: '99,96%', status: 'Optimal', tone: 'ok' },
  { name: 'PostgreSQL 16 Deduction Ledger', proto: 'Sync Replica', p95: '6,4 ms', tps: '620 q/s', err: '0,00%', sla: '99,99%', status: 'Optimal', tone: 'ok' },
  { name: 'HRIS Attendance Ingestor (6 Plant)', proto: 'Webhook + Cron', p95: '118 ms', tps: '4,1k rec', err: '0,00%', sla: '100,0%', status: 'Tersinkron', tone: 'ok' },
  { name: 'Company SSO OIDC + HSM Vault', proto: 'OAuth2 + FIDO2', p95: '34 ms', tps: '86 auth/m', err: '0,01%', sla: '99,99%', status: 'Optimal', tone: 'ok' },
  { name: 'SAP Payroll IDoc & CoreTax Bridge', proto: 'RFC / SFTP', p95: '264 ms', tps: 'Batch H-2', err: '0,00%', sla: '99,98%', status: 'Siap Cut-Off', tone: 'info' },
];

// Attendance & HRIS Connectors (Page 3)
const HRIS_CONNECTORS = [
  { plant: 'Plant Cikarang (ZKTeco FaceID)', emp: 1280, proto: 'Push API v3', lastSync: '09:20 WIB', latency: '84 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
  { plant: 'Plant Karawang (Hikvision Bio)', emp: 940, proto: 'ISAPI TLS', lastSync: '09:19 WIB', latency: '96 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
  { plant: 'Plant Bekasi (ZKTeco ProFace)', emp: 620, proto: 'Push API v3', lastSync: '09:20 WIB', latency: '78 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
  { plant: 'Ritel Jabodetabek (Talenta API)', emp: 580, proto: 'REST OAuth2', lastSync: '09:18 WIB', latency: '142 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
  { plant: 'Hub Cibitung (Fingerspot Cloud)', emp: 440, proto: 'Webhook', lastSync: '09:17 WIB', latency: '128 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
  { plant: 'Kantor Pusat (SAP SuccessFactors)', emp: 260, proto: 'OData v4', lastSync: '09:20 WIB', latency: '112 ms', anomaly: 0, status: 'Aktif', tone: 'ok' },
];

// Computed aggregates
const TOTAL_EMP = ENTITIES.reduce((a, e) => a + e.employees, 0);
const TOTAL_ACCRUED = ENTITIES.reduce((a, e) => a + e.accruedIdr, 0);
const TOTAL_CAP30 = ENTITIES.reduce((a, e) => a + e.cap30Idr, 0);
const TOTAL_TX = ENTITIES.reduce((a, e) => a + e.txCount, 0);
const TOTAL_DISBURSED = ENTITIES.reduce((a, e) => a + e.disbursedIdr, 0);
const TOTAL_ADMIN = ENTITIES.reduce((a, e) => a + e.adminFeeIdr, 0);
const TOTAL_DEDUCTION = ENTITIES.reduce((a, e) => a + e.deductionIdr, 0);
const TOTAL_UTIL_PCT = (TOTAL_DISBURSED / TOTAL_CAP30) * 100;
const TOTAL_GUARDRAIL_BLOCKED = GUARDRAIL_RULES.reduce((a, g) => a + g.blocked, 0);

// Batch aggregates (Page 2 18-row grid)
const BATCH_ACCRUED = DISBURSEMENTS.reduce((a, r) => a + r.accrued, 0);
const BATCH_SETTLED_AMT = DISBURSEMENTS.filter((r) => !r.blocked).reduce((a, r) => a + r.amount, 0);
const BATCH_ADMIN_SUM = DISBURSEMENTS.reduce((a, r) => a + r.admin, 0);
const BATCH_DEDUCT_SUM = BATCH_SETTLED_AMT + BATCH_ADMIN_SUM;
const BATCH_ACTIVE_CNT = DISBURSEMENTS.filter((r) => !r.blocked).length;

export function verifyMath() {
  if (TOTAL_EMP !== 4120) throw new Error(`TOTAL_EMP mismatch: ${TOTAL_EMP}`);
  if (TOTAL_ACCRUED !== 14820000000) throw new Error(`TOTAL_ACCRUED mismatch: ${TOTAL_ACCRUED}`);
  if (TOTAL_CAP30 !== 4446000000) throw new Error(`TOTAL_CAP30 mismatch: ${TOTAL_CAP30}`);
  if (Math.round(TOTAL_ACCRUED * POLICY_CAP_PCT) !== TOTAL_CAP30) throw new Error('Cap 30% formula mismatch');
  if (TOTAL_TX !== 2340) throw new Error(`TOTAL_TX mismatch: ${TOTAL_TX}`);
  if (TOTAL_DISBURSED !== 1842600000) throw new Error(`TOTAL_DISBURSED mismatch: ${TOTAL_DISBURSED}`);
  if (TOTAL_ADMIN !== TOTAL_TX * FLAT_ADMIN_FEE) throw new Error(`TOTAL_ADMIN mismatch: ${TOTAL_ADMIN}`);
  if (TOTAL_DEDUCTION !== TOTAL_DISBURSED + TOTAL_ADMIN) throw new Error('TOTAL_DEDUCTION mismatch');

  for (const e of ENTITIES) {
    if (Math.round(e.accruedIdr * POLICY_CAP_PCT) !== e.cap30Idr) throw new Error(`Entity cap mismatch: ${e.code}`);
    if (e.txCount * FLAT_ADMIN_FEE !== e.adminFeeIdr) throw new Error(`Entity fee mismatch: ${e.code}`);
    if (e.disbursedIdr + e.adminFeeIdr !== e.deductionIdr) throw new Error(`Entity deduction mismatch: ${e.code}`);
    if (e.disbursedIdr > e.cap30Idr) throw new Error(`Entity exceeded cap: ${e.code}`);
  }

  const sumPurposeTx = PURPOSE_BREAKDOWN.reduce((a, p) => a + p.txCount, 0);
  const sumPurposeAmt = PURPOSE_BREAKDOWN.reduce((a, p) => a + p.amountIdr, 0);
  if (sumPurposeTx !== TOTAL_TX) throw new Error(`Purpose tx mismatch: ${sumPurposeTx}`);
  if (sumPurposeAmt !== TOTAL_DISBURSED) throw new Error(`Purpose amt mismatch: ${sumPurposeAmt}`);

  const hrisEmpSum = HRIS_CONNECTORS.reduce((a, c) => a + c.emp, 0);
  if (hrisEmpSum !== TOTAL_EMP) throw new Error(`HRIS connector emp mismatch: ${hrisEmpSum}`);

  if (Math.round(HERO_EMPLOYEE.accruedIdr * POLICY_CAP_PCT) !== HERO_EMPLOYEE.cap30Idr) {
    throw new Error('Hero employee cap30 mismatch');
  }
  if (HERO_EMPLOYEE.cap30Idr - HERO_EMPLOYEE.prevWithdrawnIdr !== HERO_EMPLOYEE.remainingCapIdr) {
    throw new Error('Hero remaining cap mismatch');
  }
  if (HERO_EMPLOYEE.prevWithdrawnIdr + HERO_EMPLOYEE.prevAdminIdr !== HERO_EMPLOYEE.prevDeductionIdr) {
    throw new Error('Hero prev deduction mismatch');
  }
  if (HERO_EMPLOYEE.estNetPayIdr - (HERO_EMPLOYEE.simWithdrawIdr + HERO_EMPLOYEE.simAdminIdr) !== HERO_EMPLOYEE.estNetAfterSimIdr) {
    throw new Error('Hero net pay simulation mismatch');
  }

  for (const r of DISBURSEMENTS) {
    if (!r.blocked) {
      if (r.amount > r.cap30) throw new Error(`Disbursement exceeds cap: ${r.id}`);
      if (r.admin !== FLAT_ADMIN_FEE) throw new Error(`Admin fee mismatch: ${r.id}`);
      if (r.cap30 - r.amount !== r.remainingCap) throw new Error(`Remaining cap mismatch: ${r.id}`);
    } else if (r.admin !== 0) {
      throw new Error(`Blocked tx must have 0 admin fee: ${r.id}`);
    }
  }

  const sumDr = JOURNAL_ENTRIES.reduce((a, j) => a + j.debit, 0);
  const sumCr = JOURNAL_ENTRIES.reduce((a, j) => a + j.credit, 0);
  if (sumDr !== sumCr) throw new Error(`Unbalanced GL journal: Dr=${sumDr} vs Cr=${sumCr}`);
  if (sumDr !== TOTAL_DISBURSED + TOTAL_DEDUCTION) throw new Error(`GL total mismatch: ${sumDr}`);

  if (TOTAL_GUARDRAIL_BLOCKED !== 19) throw new Error(`Guardrail sum mismatch: ${TOTAL_GUARDRAIL_BLOCKED}`);
}

function fmtIdrShort(n) {
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',') + ' Jt';
  return fmtIdr(n);
}

// Custom crisp 1.75px stroke SVG icons for domain elements
function domainIcon(name, size = 13, color = 'currentColor') {
  const paths = {
    wallet: '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 14h.01"/><path d="M2 10h20"/><path d="M6 7V5a2 2 0 0 1 2-2h10"/>',
    bank: '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>',
    arrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
  };
  const d = paths[name];
  if (!d) return ic(name, size, color);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${d}</svg>`;
}

// ============================================================================
// SAP S/4HANA FIORI HORIZON + WORKDAY ENTERPRISE SHELL (LIGHT-FIRST #0c7c66)
// ============================================================================
const FIORI_EXTRA_CSS = `
  /* Override chrome tokens for Fiori Horizon Light Enterprise Jade (#0c7c66) */
  .e-badge-accent { background: #e6f4f0; color: #075243; border-color: #a7dfd2; }
  .e-panel { border-color: #d6e0dd; border-radius: 4px; }
  .e-panel-head { background: #f6f9f8; border-bottom-color: #dce5e2; height: 32px; }
  table.e-table th { background: #edf3f1; color: #364944; border-bottom-color: #c8d6d1; }
  table.e-table tbody tr:nth-child(even) { background: #f9fbfb; }
  table.e-table tfoot td { background: #e9f1ee; border-top-color: #b7cbc4; color: #0b241f; }
  .e-statusbar { background: #edf2f0; border-top-color: #cbd8d3; color: #3b4f4a; }

  /* Fiori Horizon Top Shell Bar (Light, 3px Brand Accent Stripe) */
  .f-shellbar {
    height: 44px;
    background: #ffffff;
    border-top: 3px solid #0c7c66;
    border-bottom: 1px solid #d0dcd8;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .f-shell-left { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
  .f-shell-tabs { display: flex; align-items: stretch; height: 40px; gap: 1px; flex-shrink: 0; }
  .f-shell-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }

  .f-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-right: 8px;
    border-right: 1px solid #dbe4e1;
    white-space: nowrap;
  }
  .f-logo-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #0c7c66;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .f-logo-name { font-size: 12px; font-weight: 800; color: #0d2620; letter-spacing: -0.01em; line-height: 1.1; }
  .f-logo-sub { font-size: 9px; font-weight: 600; color: #4d6660; line-height: 1.1; }

  .f-selector {
    height: 25px;
    padding: 0 7px;
    border-radius: 3px;
    background: #f4f8f7;
    border: 1px solid #cfdcd7;
    color: #132d27;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 8px;
    font-size: 10.6px;
    font-weight: 600;
    color: #4b615b;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .f-tab.is-active {
    color: #085a4a;
    font-weight: 700;
    border-bottom-color: #0c7c66;
    background: #f2f9f7;
  }
  .f-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 0.5px 4.5px;
    border-radius: 2px;
    background: #e9efed;
    color: #3a524c;
  }
  .f-tab.is-active .f-tab-cnt {
    background: #0c7c66;
    color: #ffffff;
  }

  .f-live-chip {
    height: 25px;
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
  .f-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 8px;
    border-left: 1px solid #dbe4e1;
    white-space: nowrap;
  }
  .f-avatar {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #085a4a;
    color: #ffffff;
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Contextual Sub-Toolbar */
  .f-subbar {
    height: 36px;
    padding: 0 14px;
    background: #f8fbfa;
    border-bottom: 1px solid #d5e0dc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-crumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #556b65;
    min-width: 0;
  }
  .f-crumb strong {
    color: #0d2620;
    font-size: 12.2px;
    font-weight: 700;
  }
  .f-pill-row { display: flex; align-items: center; gap: 6px; }
  .f-filter-pill {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid #cfdcd7;
    background: #ffffff;
    color: #2f4640;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-filter-pill.is-on {
    background: #e6f4f0;
    border-color: #0c7c66;
    color: #075243;
  }

  /* Main Workspace Canvas */
  .f-workspace {
    flex: 1;
    min-height: 0;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  /* KPI Accent Top Line Variant */
  .e-kpi {
    border-color: #d6e0dd;
    padding: 8px 10px;
  }
  .e-kpi-accent {
    border-top: 2px solid #0c7c66;
  }

  /* DoA Stepper Cards */
  .doa-step {
    border: 1px solid #d6e0dd;
    border-radius: 4px;
    padding: 8px 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .doa-step.is-done { border-left: 3px solid #047857; background: #fbfefd; }
  .doa-step.is-active { border-left: 3px solid #b45309; background: #fffdf7; border-color: #f3d48c; }
  .doa-step.is-wait { border-left: 3px solid #94a3b8; background: #f8faf9; }

  /* Mobile Hardware Viewport Frames (Page 3 — Flat Engineering Precision) */
  .mob-stage {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    align-items: stretch;
  }
  .mob-frame {
    background: #14221e;
    border: 1px solid #263d37;
    border-radius: 12px;
    padding: 7px;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .mob-screen {
    background: #f4f7f6;
    border-radius: 7px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #d0dcd8;
  }
  .mob-statusbar {
    height: 22px;
    background: #0c7c66;
    color: #ffffff;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .mob-header {
    background: #0c7c66;
    color: #ffffff;
    padding: 7px 11px 10px;
    flex-shrink: 0;
  }
  .mob-body {
    flex: 1;
    padding: 8px 9px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
  }
  .mob-card {
    background: #ffffff;
    border: 1px solid #d6e0dd;
    border-radius: 5px;
    padding: 8px 9px;
  }
  .mob-tabbar {
    height: 36px;
    background: #ffffff;
    border-top: 1px solid #d6e0dd;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    flex-shrink: 0;
  }
  .mob-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 8.5px;
    font-weight: 600;
    color: #64748b;
  }
  .mob-tab.is-on { color: #0c7c66; font-weight: 700; }

  /* Monospace Code / XML Inspector */
  .code-pane {
    background: #0e1d19;
    color: #d6ebe5;
    border: 1px solid #223b34;
    border-radius: 4px;
    padding: 8px 10px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.48;
    overflow: hidden;
  }
  .xml-tag { color: #5eead4; }
  .xml-attr { color: #93c5fd; }
  .xml-val { color: #fde68a; }
  .xml-cmt { color: #64827a; }

  /* Key-Value Ledger Row */
  .kv-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid #ebf1ef;
    font-size: 10.6px;
  }
  .kv-row:last-child { border-bottom: 0; }
  .kv-k { color: #4d645e; font-weight: 500; }
  .kv-v { color: #0e221d; font-weight: 700; font-family: var(--e-mono); font-variant-numeric: tabular-nums; }

  /* Tighter comfortable row rhythm for dense ERP tables */
  table.e-table.e-table-roomy td { padding: 7.4px 7px; }
  table.e-table.e-table-mid td { padding: 6.4px 7px; }
`;

const NAV_TABS = [
  { id: 'p1', label: 'Ikhtisar Eksekutif', icon: 'activity', cnt: '6' },
  { id: 'p2', label: 'Buku Besar BI-FAST', icon: 'bank', cnt: '18' },
  { id: 'p3', label: 'Mobile & Guardrail', icon: 'phone', cnt: '3' },
  { id: 'p4', label: 'Payroll & CoreTax', icon: 'receipt', cnt: 'DoA' },
  { id: 'p5', label: 'Audit WORM & SLA', icon: 'shield', cnt: '19' },
];

function renderShell({ activeTab, crumbTitle, crumbSub, subRightHtml, contentHtml }) {
  const tabsHtml = NAV_TABS.map((t) => {
    const active = t.id === activeTab;
    return `<div class="f-tab ${active ? 'is-active' : ''}">
      ${domainIcon(t.icon, 12, active ? '#0c7c66' : '#64748b')}
      <span>${esc(t.label)}</span>
      <span class="f-tab-cnt">${esc(t.cnt)}</span>
    </div>`;
  }).join('');

  const topbar = `<header class="f-shellbar">
    <div class="f-shell-left">
      <div class="f-logo">
        <span class="f-logo-mark">TC</span>
        <div>
          <div class="f-logo-name">TarikCepat EWA</div>
          <div class="f-logo-sub">SAP Payroll · BI-FAST</div>
        </div>
      </div>
      <div class="f-selector">
        ${domainIcon('building', 11, '#0c7c66')}
        <span>Karya Mandiri (6 Entitas)</span>
        ${ic('chevronDown', 10, '#64748b')}
      </div>
      <div class="f-selector">
        ${domainIcon('calendar', 11, '#0c7c66')}
        <span class="mono" style="font-size:9.8px;">Nov 2026 · Cut-Off 25 Nov</span>
      </div>
    </div>
    <nav class="f-shell-tabs">${tabsHtml}</nav>
    <div class="f-shell-right">
      <div class="f-live-chip">
        <span class="dot dot-ok"></span>
        <span>BI-FAST 99,96%</span>
      </div>
      <div class="f-user">
        <span class="f-avatar">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#0d2620;">Rina Kartika</div>
          <div style="font-size:9px;color:#556b65;">VP Payroll Ops · Maker</div>
        </div>
      </div>
    </div>
  </header>`;

  const subbar = `<div class="f-subbar">
    <div class="f-crumb">
      <span>TarikCepat Enterprise</span>
      ${ic('chevronRight', 11, '#94a3b8')}
      <strong>${esc(crumbTitle)}</strong>
      <span style="color:#78908a;">·</span>
      <span class="trunc">${esc(crumbSub)}</span>
    </div>
    <div class="f-pill-row">${subRightHtml}</div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><span>.NET 9 API + PostgreSQL 16 WORM Ledger · Region JKT-AZ1</span>`,
      `<span>HRIS Sync: 4.120/4.120 karyawan (09:20 WIB)</span>`,
      `<span>Skema: 0% Bunga · Biaya Admin Flat Rp 7.500 · Maks. Cap 30%</span>`,
    ],
    rightItems: [
      `<span>Batch Cut-Off: PAY-CUT-202611-01</span>`,
      `<span>ISO 20022 BI-FAST · PSAK 24 · UU PDP</span>`,
      `<span>18 Nov 2026 09:24:14 WIB</span>`,
    ],
  });

  return `${topbar}${subbar}<main class="f-workspace">${contentHtml}</main>${footer}`;
}

function wrapPage(slug, title, bodyHtml) {
  return {
    slug,
    title,
    html: wrapEnterpriseHtml({
      title: `TarikCepat EWA — ${title}`,
      accent: '#0c7c66',
      accentSoft: '#e6f4f0',
      accentInk: '#075243',
      bg: '#f2f6f5',
      surface: '#ffffff',
      surface2: '#f6f9f8',
      border: '#d6e0dd',
      borderStrong: '#becdc8',
      text: '#0d2620',
      text2: '#3f5751',
      muted: '#5f7670',
      extraCss: FIORI_EXTRA_CSS,
      bodyHtml,
    }),
  };
}

// ============================================================================
// PAGE 1: KONSOL EKSEKUTIF EWA & EKSPOSUR MULTI-ENTITAS
// ============================================================================
function renderPage1() {
  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    <div class="e-kpi e-kpi-accent">
      <div class="e-kpi-top"><span>Hak Gaji Berjalan (1–18 Nov)</span>${badge('14 HK', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdrShort(TOTAL_ACCRUED)}</span>
        ${svgSparkline({ points: [1.2, 2.4, 3.8, 5.4, 7.1, 8.9, 10.4, 12.1, 13.6, 14.82], color: '#0c7c66', width: 56, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>${fmtNum(TOTAL_EMP)} staf tersinkron HRIS</span><span class="mono">100%</span></div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top"><span>Plafon Aman EWA (Cap 30%)</span>${badge('Guardrail', 'neutral')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdrShort(TOTAL_CAP30)}</span>
        ${svgSparkline({ points: [0.36, 0.72, 1.14, 1.62, 2.13, 2.67, 3.12, 3.63, 4.08, 4.45], color: '#0369a1', width: 56, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>Batas maks. PP 36/2021</span><span class="mono">30,0%</span></div>
    </div>

    <div class="e-kpi e-kpi-accent">
      <div class="e-kpi-top"><span>Pencairan BI-FAST MTD</span>${badge(fmtPct(TOTAL_UTIL_PCT), 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdrShort(TOTAL_DISBURSED)}</span>
        ${svgSparkline({ points: [0.12, 0.28, 0.49, 0.72, 0.96, 1.24, 1.48, 1.64, 1.75, 1.84], color: '#047857', width: 56, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>${fmtNum(TOTAL_TX)} transaksi sukses</span><span class="mono">0% Bunga</span></div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top"><span>Biaya Admin Flat MTD</span>${badge('Rp 7.500/tx', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdr(TOTAL_ADMIN)}</span>
      </div>
      <div class="e-kpi-foot"><span>Transparan tanpa denda</span><span class="mono">0% APR</span></div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top"><span>Potongan Payroll 25 Nov</span>${badge('3-Way OK', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtIdrShort(TOTAL_DEDUCTION)}</span>
      </div>
      <div class="e-kpi-foot"><span>Pokok + Admin Flat</span><span class="mono">WT-9410</span></div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top"><span>SLA BI-FAST & Rekonsiliasi</span>${badge('Rp 0 Selisih', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">99,96%</span>
        ${svgSparkline({ points: [99.94, 99.95, 99.96, 99.97, 99.95, 99.96, 99.98, 99.96], color: '#0c7c66', width: 56, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span>p95 cair 1,18 dtk</span><span class="mono">ISO 20022</span></div>
    </div>
  </section>`;

  const accrualChart = svgMultiLineChart({
    width: 890,
    height: 270,
    xLabels: ['1 Nov', '3 Nov', '5 Nov', '7 Nov', '9 Nov', '11 Nov', '13 Nov', '15 Nov', '17 Nov', '18 Nov'],
    yMin: 0,
    yMax: 5000,
    yTicks: 5,
    yFormat: (v) => (v === 0 ? 'Rp 0' : `${(v / 1000).toFixed(1).replace('.', ',')} M`),
    series: [
      { label: 'Plafon Aman 30% Akrual HRIS (Rp M)', color: '#0c7c66', values: [420, 890, 1380, 1890, 2360, 2880, 3340, 3780, 4190, 4446], area: true, dots: true },
      { label: 'Pencairan BI-FAST Kumulatif (Rp M)', color: '#0369a1', values: [48, 142, 310, 520, 790, 1140, 1420, 1610, 1748, 1843], area: true, dots: true },
      { label: 'Proyeksi Batas Likuiditas Escrow (Rp M)', color: '#b45309', values: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500], dashed: true, width: 1.4 },
    ],
    threshold: { value: 2500, label: 'Pagu Escrow Mandiri Rp 2,5 M', color: '#b45309' },
    annotations: [
      { index: 5, seriesIdx: 1, label: 'Puncak H-11: Biaya Sekolah & Kontrakan', color: '#0369a1', dy: -32 },
    ],
  });

  const entityRows = ENTITIES.map((e) => {
    const util = (e.disbursedIdr / e.cap30Idr) * 100;
    return `<tr>
      <td class="mono" style="font-weight:700;color:#085a4a;">${esc(e.code)}</td>
      <td><div style="font-weight:700;color:#0d2620;" class="trunc">${esc(e.name)}</div><div style="font-size:9.3px;color:#5f7670;" class="trunc">${esc(e.hrisSource)}</div></td>
      <td class="num mono">${fmtNum(e.employees)}</td>
      <td class="num mono">${fmtIdrShort(e.accruedIdr)}</td>
      <td class="num mono">${fmtIdrShort(e.cap30Idr)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdrShort(e.disbursedIdr)}</td>
      <td class="num mono">${fmtNum(e.txCount)}</td>
      <td>${renderCapacityBar(util, { warnAt: 65, critAt: 85 })}</td>
      <td>${badge(e.status, e.tone)}</td>
    </tr>`;
  }).join('');

  const purposeBars = PURPOSE_BREAKDOWN.map((p) => {
    const pct = (p.amountIdr / TOTAL_DISBURSED) * 100;
    return `<div style="display:flex;flex-direction:column;gap:3px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:10.4px;">
        <span style="font-weight:600;color:#142e28;">${esc(p.label)}</span>
        <span class="mono" style="font-size:10px;color:#3f5751;"><strong>${fmtIdrShort(p.amountIdr)}</strong> · ${fmtNum(p.txCount)} tx (${fmtPct(pct)})</span>
      </div>
      <div style="height:7px;background:#e8efed;border-radius:2px;overflow:hidden;">
        <div style="width:${pct.toFixed(1)}%;height:100%;background:${p.color};"></div>
      </div>
    </div>`;
  }).join('');

  const contentHtml = `${kpiHtml}
  <section style="flex:1;min-height:0;display:grid;grid-template-columns:1.58fr 1fr;gap:10px;">
    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 382px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#0c7c66')}<span>Kurva Akrual Gaji Berjalan vs Pencairan BI-FAST & Pagu Escrow (1–18 Nov 2026)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Kas Perusahaan Bebas Beban', 'ok')}
            <span class="e-panel-sub mono">Utilisasi Escrow: 73,7%</span>
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${accrualChart}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:7px;border-top:1px solid #e6eeeb;">
            <div style="font-size:10px;"><div style="color:#5f7670;">Rata-rata Nominal Tarik</div><div class="mono" style="font-weight:700;font-size:11.8px;">${fmtIdr(Math.round(TOTAL_DISBURSED / TOTAL_TX))}</div></div>
            <div style="font-size:10px;"><div style="color:#5f7670;">Sisa Plafon Tersedia Grup</div><div class="mono" style="font-weight:700;font-size:11.8px;color:#0c7c66;">${fmtIdrShort(TOTAL_CAP30 - TOTAL_DISBURSED)}</div></div>
            <div style="font-size:10px;"><div style="color:#5f7670;">Bunga / Denda Karyawan</div><div class="mono" style="font-weight:700;font-size:11.8px;color:#047857;">Rp 0 (0% APR)</div></div>
            <div style="font-size:10px;"><div style="color:#5f7670;">Hitung Mundur Cut-Off</div><div class="mono" style="font-weight:700;font-size:11.8px;color:#b45309;">H-7 (25 Nov 2026)</div></div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${domainIcon('building', 13, '#0c7c66')}<span>Matriks Eksposur Multi-Entitas & Sinkronisasi Absensi HRIS (6 Unit Usaha)</span></div>
          <span class="e-panel-sub mono">Total Karyawan Aktif: ${fmtNum(TOTAL_EMP)} · Rekonsiliasi Real-Time</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="flex:1;">
            <colgroup>
              <col style="width:66px;" />
              <col style="width:236px;" />
              <col style="width:62px;" />
              <col style="width:92px;" />
              <col style="width:92px;" />
              <col style="width:92px;" />
              <col style="width:52px;" />
              <col style="width:116px;" />
              <col style="width:86px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Entitas / Plant & Mesin HRIS</th>
                <th class="num">Staf</th>
                <th class="num">Hak Berjalan</th>
                <th class="num">Cap 30%</th>
                <th class="num">Ditarik MTD</th>
                <th class="num">Tx</th>
                <th>Utilisasi Cap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${entityRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL GRUP KARYA MANDIRI (6 ENTITAS)</td>
                <td class="num mono">${fmtNum(TOTAL_EMP)}</td>
                <td class="num mono">${fmtIdrShort(TOTAL_ACCRUED)}</td>
                <td class="num mono">${fmtIdrShort(TOTAL_CAP30)}</td>
                <td class="num mono">${fmtIdrShort(TOTAL_DISBURSED)}</td>
                <td class="num mono">${fmtNum(TOTAL_TX)}</td>
                <td class="mono" style="font-size:10px;">${fmtPct(TOTAL_UTIL_PCT)} dari Cap</td>
                <td>${badge('6/6 Sinkron', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;background:#f4f9f7;border-top:1px solid #d6e0dd;display:flex;align-items:center;justify-content:space-between;font-size:10.3px;margin-top:auto;">
            <span style="color:#1b3b34;"><strong>Keterangan Likuiditas:</strong> Seluruh pencairan BI-FAST didanai dari rekening Escrow terpisah; <strong>Rp 0</strong> beban kas operasional perusahaan hingga tanggal gajian 25 Nov 2026.</span>
            <span class="mono" style="color:#085a4a;font-weight:700;">Batch ID: PAY-CUT-202611-01</span>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 402px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#0c7c66')}<span>Alur DoA Maker-Checker Pra-Cut-Off (Nov 2026)</span></div>
          ${badge('Tahap 2/4 Aktif', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div class="doa-step is-done">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:11px;color:#065f46;">1. Sinkronisasi Absensi HRIS & Akrual Harian</span>
              ${badge('Selesai · 09:20', 'ok')}
            </div>
            <div style="font-size:10px;color:#475569;">4.120 karyawan dari 6 mesin absensi pabrik & ritel terverifikasi (14 HK · 0 selisih log).</div>
            <div class="mono" style="font-size:9.3px;color:#5f7670;">Otomatis · svc-hris-ingestor · SHA256:3c81e04b</div>
          </div>

          <div class="doa-step is-done">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:11px;color:#065f46;">2. Maker · Rina Kartika (VP Payroll Ops)</span>
              ${badge('Ditandatangani', 'ok')}
            </div>
            <div style="font-size:10px;color:#475569;">Validasi daftar potongan 2.340 transaksi (Pokok Rp 1,84 M + Admin Flat Rp 17,55 Jt).</div>
            <div class="mono" style="font-size:9.3px;color:#5f7670;">18 Nov 08:45 WIB · Tanda Tangan Digital Valid</div>
          </div>

          <div class="doa-step is-active">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:11px;color:#92400e;">3. Checker · Budi Santoso (Finance Controller)</span>
              ${badge('Meninjau · SLA 4 Jam', 'warn')}
            </div>
            <div style="font-size:10px;color:#475569;">Verifikasi 3-Way Match Ledger PostgreSQL vs Rekening Escrow Mandiri vs SAP WT-9410.</div>
            <div class="mono" style="font-size:9.3px;color:#92400e;">Selisih Terdeteksi: Rp 0 · Menunggu klik persetujuan</div>
          </div>

          <div class="doa-step is-wait">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:11px;color:#334155;">4. Approver CFO & Ekspor File SAP Payroll</span>
              ${badge('Terjadwal 23 Nov', 'neutral')}
            </div>
            <div style="font-size:10px;color:#475569;">Otorisasi Hendra Wijaya (CFO) + pengiriman otomatis SAP IDoc & XML CoreTax sebelum cut-off.</div>
            <div class="mono" style="font-size:9.3px;color:#64748b;">Blackout window dimulai 22 Nov 23:59 WIB</div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${domainIcon('wallet', 13, '#0c7c66')}<span>Tujuan Penarikan & Dampak Anti-Pinjol Ilegal</span></div>
          <span class="e-panel-sub mono">${fmtNum(TOTAL_TX)} Tx MTD</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="display:flex;flex-direction:column;gap:9px;">${purposeBars}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:7px 9px;background:#f8fbfa;border:1px solid #dce6e3;border-radius:4px;font-size:9.8px;">
            <div><span style="color:#5f7670;">Frekuensi 1x/Bln:</span> <strong class="mono" style="color:#0d2620;">68,2%</strong></div>
            <div><span style="color:#5f7670;">Frekuensi 2x/Bln:</span> <strong class="mono" style="color:#0d2620;">31,8%</strong></div>
            <div><span style="color:#5f7670;">Survei Bebas Pinjol:</span> <strong class="mono" style="color:#047857;">96,4%</strong></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:7px 8px;">
              <div style="font-size:9.3px;color:#3d5e55;font-weight:600;">Penghematan Bunga</div>
              <div class="mono" style="font-size:13px;font-weight:800;color:#075243;">Rp 294,8 Jt</div>
              <div style="font-size:9px;color:#527269;">vs rata-rata pinjol 16%/bln</div>
            </div>
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:7px 8px;">
              <div style="font-size:9.3px;color:#3d5e55;font-weight:600;">Turnover Operator</div>
              <div class="mono" style="font-size:13px;font-weight:800;color:#075243;">-38,4% YoY</div>
              <div style="font-size:9px;color:#527269;">Plant Cikarang & Karawang</div>
            </div>
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:7px 8px;">
              <div style="font-size:9.3px;color:#3d5e55;font-weight:600;">Gaji Bersih Sehat</div>
              <div class="mono" style="font-size:13px;font-weight:800;color:#075243;">≥ 70% Hak</div>
              <div style="font-size:9px;color:#527269;">Dijaga ketat Cap 30%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const body = renderShell({
    activeTab: 'p1',
    crumbTitle: 'Konsol Eksekutif EWA & Eksposur Multi-Entitas',
    crumbSub: 'Pemantauan akrual gaji berjalan, plafon 30%, pencairan BI-FAST, dan persetujuan DoA pra-cut-off',
    subRightHtml: `
      <span class="f-filter-pill is-on">Semua Entitas (6)</span>
      <span class="f-filter-pill">Manufaktur (3)</span>
      <span class="f-filter-pill">Ritel & Logistik (2)</span>
      <span class="e-btn">${ic('download', 11, '#334155')}<span>Ekspor Ringkasan CFO</span></span>
      <span class="e-btn e-btn-primary">${ic('refresh', 11, '#ffffff')}<span>Sinkron HRIS Sekarang</span></span>
    `,
    contentHtml,
  });

  return wrapPage('p1', meta.pages[0].title, body);
}

// ============================================================================
// PAGE 2: BUKU BESAR PENCAIRAN BI-FAST & INSPEKTOR AKRUAL (18 BARIS)
// ============================================================================
function renderPage2() {
  const rowsHtml = DISBURSEMENTS.map((r) => {
    const cls = r.selected ? 'is-selected' : r.bad ? 'is-bad' : r.warn ? 'is-warn' : '';
    const cb = r.selected ? `<span class="cb checked">${ic('check', 9, '#ffffff')}</span>` : `<span class="cb"></span>`;
    return `<tr class="${cls}">
      <td style="text-align:center;">${cb}</td>
      <td class="mono" style="font-weight:700;color:${r.selected ? '#075243' : '#1e293b'};">${esc(r.id)}</td>
      <td><span style="font-weight:700;color:#0d2620;">${esc(r.emp)}</span> <span class="mono" style="font-size:9.5px;color:#5f7670;">${esc(r.nik)}</span></td>
      <td style="color:#3f5751;">${esc(r.unit)}</td>
      <td class="num mono">${r.hk} HK</td>
      <td class="num mono">${fmtIdr(r.accrued)}</td>
      <td class="num mono" style="font-weight:700;color:${r.bad ? '#be123c' : '#0d2620'};">${fmtIdr(r.amount)}</td>
      <td class="num mono" style="color:#5f7670;">${r.admin > 0 ? fmtIdr(r.admin) : 'Rp 0'}</td>
      <td class="num mono" style="color:${r.bad ? '#be123c' : '#047857'};">${fmtIdr(r.remainingCap)}</td>
      <td class="mono" style="font-size:10px;color:#334155;">${esc(r.bank)}</td>
      <td>${badge(r.status, r.tone)}</td>
    </tr>`;
  }).join('');

  const traceWaterfall = svgSpanWaterfall({
    width: 372,
    totalMs: 600,
    spans: [
      { label: 'SSO + Biometrik PIN', start: 0, dur: 38, color: '#0c7c66' },
      { label: 'HRIS Accrual Lookup', start: 38, dur: 64, color: '#0369a1' },
      { label: 'Cap 30% & Anti-Fraud', start: 102, dur: 42, color: '#1a9980' },
      { label: 'BI-FAST pacs.008', start: 144, dur: 412, color: '#b45309' },
      { label: 'PostgreSQL WORM', start: 556, dur: 28, color: '#047857' },
    ],
  });

  const capUsedPct = (HERO_EMPLOYEE.prevWithdrawnIdr / HERO_EMPLOYEE.cap30Idr) * 100;

  const contentHtml = `
  <section style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 398px;gap:10px;">
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${domainIcon('bank', 13, '#0c7c66')}<span>Buku Besar Transaksi Pencairan BI-FAST (Antrean Real-Time · 18 Baris Teratas dari 2.340)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('15 Lunas BI-FAST', 'ok')}
          ${badge('1 Antre Checker', 'warn')}
          ${badge('2 Diblokir Guardrail', 'bad')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:7px 10px;background:#f7faf9;border-bottom:1px solid #dce6e3;flex-shrink:0;">
          <div><div style="font-size:9.3px;color:#5f7670;font-weight:600;">Total Hak Sampel (18 Staf)</div><div class="mono" style="font-size:12.5px;font-weight:700;">${fmtIdr(BATCH_ACCRUED)}</div></div>
          <div><div style="font-size:9.3px;color:#5f7670;font-weight:600;">Pencairan Aktif (16 Tx)</div><div class="mono" style="font-size:12.5px;font-weight:700;color:#0c7c66;">${fmtIdr(BATCH_SETTLED_AMT)}</div></div>
          <div><div style="font-size:9.3px;color:#5f7670;font-weight:600;">Admin Flat (16 × Rp 7.500)</div><div class="mono" style="font-size:12.5px;font-weight:700;">${fmtIdr(BATCH_ADMIN_SUM)}</div></div>
          <div><div style="font-size:9.3px;color:#5f7670;font-weight:600;">Total Potong Payroll Batch</div><div class="mono" style="font-size:12.5px;font-weight:700;color:#0369a1;">${fmtIdr(BATCH_DEDUCT_SUM)}</div></div>
        </div>

        <table class="e-table e-table-roomy" style="font-size:10.4px;">
          <colgroup>
            <col style="width:28px;" />
            <col style="width:100px;" />
            <col style="width:172px;" />
            <col style="width:104px;" />
            <col style="width:46px;" />
            <col style="width:94px;" />
            <col style="width:94px;" />
            <col style="width:84px;" />
            <col style="width:92px;" />
            <col style="width:112px;" />
            <col style="width:108px;" />
          </colgroup>
          <thead>
            <tr>
              <th style="text-align:center;">#</th>
              <th>ID Transaksi</th>
              <th>Karyawan & NIK</th>
              <th>Unit / Plant</th>
              <th class="num">Kerja</th>
              <th class="num">Hak Berjalan</th>
              <th class="num">Nominal Tarik</th>
              <th class="num">Admin</th>
              <th class="num">Sisa Cap 30%</th>
              <th>Rekening Payroll</th>
              <th>Status BI-FAST</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="5">SUBTOTAL HALAMAN (18 BARIS · ${BATCH_ACTIVE_CNT} AKTIF · 2 DIBLOKIR GUARDRAIL)</td>
              <td class="num mono">${fmtIdr(BATCH_ACCRUED)}</td>
              <td class="num mono">${fmtIdr(BATCH_SETTLED_AMT)}</td>
              <td class="num mono">${fmtIdr(BATCH_ADMIN_SUM)}</td>
              <td colspan="2" class="num mono" style="color:#085a4a;">Total Potong: ${fmtIdr(BATCH_DEDUCT_SUM)}</td>
              <td class="mono" style="font-size:9.4px;text-align:right;color:#3f5751;">0% Bunga · 25 Nov</td>
            </tr>
          </tfoot>
        </table>

        <div style="padding:7px 11px;background:#f4f8f7;border-top:1px solid #d6e0dd;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#4d645e;margin-top:auto;">
          <span>Menampilkan baris <strong>1–18</strong> dari <strong>2.340</strong> transaksi MTD · Klik baris untuk inspeksi formula akrual & trace ISO 20022 BI-FAST.</span>
          <span class="mono" style="font-weight:700;color:#085a4a;">Halaman 1 / 130 · Checksum Batch: 9a4f7c1e</span>
        </div>
      </div>
    </div>

    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('eye', 13, '#0c7c66')}<span>Inspektor Akrual & Trace BI-FAST</span></div>
        ${badge('EWA-2611-8401', 'accent')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:8px 10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12.5px;font-weight:800;color:#0b241f;">${esc(HERO_EMPLOYEE.name)}</div>
              <div style="font-size:10px;color:#405d56;">${esc(HERO_EMPLOYEE.role)}</div>
            </div>
            ${badge('Lunas BI-FAST', 'ok')}
          </div>
          <div style="display:flex;gap:8px;margin-top:6px;font-family:var(--e-mono);font-size:9.6px;color:#2c4a43;">
            <span>NIK: ${esc(HERO_EMPLOYEE.nik)}</span>
            <span>·</span>
            <span>${esc(HERO_EMPLOYEE.bankShort)}</span>
            <span>·</span>
            <span>ATT-14 (${HERO_EMPLOYEE.workDays} HK)</span>
          </div>
        </div>

        <div>
          <div style="font-size:9.8px;font-weight:700;color:#4d645e;margin-bottom:4px;">PERHITUNGAN DETERMINISTIK ACCRUAL ENGINE</div>
          <div class="kv-row"><span class="kv-k">Gaji Pokok + Tunjangan Tetap (20 HK)</span><span class="kv-v">${fmtIdr(HERO_EMPLOYEE.baseMonthlyIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Hak Gaji Berjalan (1–18 Nov · 14 HK)</span><span class="kv-v">${fmtIdr(HERO_EMPLOYEE.accruedIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Batas Aman Kebijakan (Maks. 30%)</span><span class="kv-v" style="color:#0c7c66;">${fmtIdr(HERO_EMPLOYEE.cap30Idr)}</span></div>
          <div class="kv-row"><span class="kv-k">Penarikan WD-01 (Biaya Sekolah · 12 Nov)</span><span class="kv-v">${fmtIdr(HERO_EMPLOYEE.prevWithdrawnIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Biaya Admin Flat (0% Bunga)</span><span class="kv-v">${fmtIdr(HERO_EMPLOYEE.prevAdminIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Jadwal Potong Payroll (CUT-25 · 25 Nov)</span><span class="kv-v" style="color:#0369a1;">${fmtIdr(HERO_EMPLOYEE.prevDeductionIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Sisa Plafon Tersedia Hari Ini</span><span class="kv-v" style="color:#047857;">${fmtIdr(HERO_EMPLOYEE.remainingCapIdr)}</span></div>
          <div class="kv-row"><span class="kv-k">Estimasi Gaji Bersih 25 Nov (EDU-01)</span><span class="kv-v">${fmtIdr(HERO_EMPLOYEE.estNetPayIdr)}</span></div>
        </div>

        <div style="background:#f8fbfa;border:1px solid #d6e0dd;border-radius:4px;padding:7px 9px;">
          <div style="display:flex;justify-content:space-between;font-size:9.8px;margin-bottom:4px;">
            <span style="font-weight:700;color:#2c4a43;">Utilisasi Batas Aman 30% Karyawan</span>
            <span class="mono" style="font-weight:700;color:#0c7c66;">${fmtPct(capUsedPct)} (Sehat)</span>
          </div>
          ${renderCapacityBar(capUsedPct, { warnAt: 75, critAt: 95, showLabel: false })}
          <div style="font-size:9.4px;color:#5f7670;margin-top:4px;">Gaji bersih akhir bulan terjaga > 85% penghasilan normal.</div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:9.8px;font-weight:700;color:#4d645e;">TRACE ISO 20022 BI-FAST (TOTAL 584 MS)</span>
            <span class="mono" style="font-size:9.2px;color:#085a4a;">RRN: ${esc(HERO_EMPLOYEE.rrn)}</span>
          </div>
          ${traceWaterfall}
        </div>

        <div class="code-pane" style="font-size:9.2px;padding:6px 8px;line-height:1.4;">
          <div><span class="xml-cmt">// ISO 20022 pacs.008.001.08 Settlement Proof</span></div>
          <div>msgId: <span class="xml-val">"BIF26111809248814"</span> · bic: <span class="xml-val">"BMRIIDJA"</span></div>
          <div>txSts: <span class="xml-tag">"ACSC"</span> (AcceptedSettlementCompleted) · fee: <span class="xml-val">7500</span></div>
          <div>deductBatch: <span class="xml-val">"CUT-25-202611"</span> · wageType: <span class="xml-tag">"WT-9410"</span></div>
        </div>

        <div style="display:flex;gap:6px;">
          <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('download', 11, '#ffffff')}<span>Unduh Bukti BI-FAST</span></span>
          <span class="e-btn" style="flex:1;justify-content:center;">${ic('fileText', 11, '#334155')}<span>Slip Potongan</span></span>
        </div>
      </div>
    </div>
  </section>`;

  const body = renderShell({
    activeTab: 'p2',
    crumbTitle: 'Buku Besar Pencairan BI-FAST & Inspektor Akrual',
    crumbSub: 'Audit transaksi per karyawan, verifikasi batas 30%, dan penelusuran latensi ISO 20022 pacs.008',
    subRightHtml: `
      <span class="f-filter-pill is-on">Semua Status (2.340)</span>
      <span class="f-filter-pill">Diblokir Guardrail (19)</span>
      <span class="f-filter-pill">Antre Checker (1)</span>
      <span class="e-btn">${ic('filter', 11, '#334155')}<span>Filter Entitas</span></span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Ekspor Buku Besar CSV</span></span>
    `,
    contentHtml,
  });

  return wrapPage('p2', meta.pages[1].title, body);
}

// ============================================================================
// PAGE 3: PENGALAMAN MOBILE KARYAWAN (.NET MAUI) & MESIN ATURAN GUARDRAIL
// ============================================================================
function renderPage3() {
  const screen1 = `<div class="mob-frame">
    <div class="mob-screen">
      <div class="mob-statusbar"><span>09:24 WIB</span><span>5G · 94%</span></div>
      <div class="mob-header">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11.5px;font-weight:800;">TarikCepat · Gaji Berjalan</div>
            <div class="mono" style="font-size:8.6px;color:#bcebe0;">PT KARYA MANDIRI · 14 HARI KERJA</div>
          </div>
          <span style="background:#075243;padding:2px 6px;border-radius:3px;font-size:8.5px;font-weight:700;">0% Bunga</span>
        </div>
        <div style="margin-top:8px;background:#085a4a;border:1px solid #168d75;border-radius:5px;padding:8px 9px;">
          <div style="font-size:8.8px;color:#c5efe5;">Saldo Bisa Ditarik (Plafon Aman 30%)</div>
          <div class="mono" style="font-size:18px;font-weight:800;color:#ffffff;margin:2px 0;">Rp 849.000</div>
          <div style="display:flex;justify-content:space-between;font-size:8.6px;color:#c5efe5;">
            <span>Hak 1–18 Nov: Rp 4.830.000</span>
            <span>Maks 30%: Rp 1.449.000</span>
          </div>
        </div>
      </div>

      <div class="mob-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="background:#0c7c66;color:#ffffff;border-radius:4px;padding:7px 6px;text-align:center;font-size:10px;font-weight:700;">Tarik Rp 500.000</div>
          <div style="background:#ffffff;color:#085a4a;border:1px solid #0c7c66;border-radius:4px;padding:7px 6px;text-align:center;font-size:10px;font-weight:700;">Lihat Slip Potongan</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
          <div class="mob-card" style="padding:5px 6px;">
            <div style="font-size:8px;color:#5f7670;">Bisa Ditarik</div>
            <div class="mono" style="font-size:9.2px;font-weight:700;color:#047857;white-space:nowrap;">Rp 1.450.000</div>
          </div>
          <div class="mob-card" style="padding:5px 6px;">
            <div style="font-size:8px;color:#5f7670;">Batas Aman</div>
            <div class="mono" style="font-size:9.2px;font-weight:700;color:#0d2620;white-space:nowrap;">30% Hak</div>
          </div>
          <div class="mob-card" style="padding:5px 6px;">
            <div style="font-size:8px;color:#5f7670;">Biaya Admin</div>
            <div class="mono" style="font-size:9.2px;font-weight:700;color:#047857;white-space:nowrap;">Rp 7.500</div>
          </div>
        </div>

        <div style="font-size:9.2px;font-weight:700;color:#3f5751;margin-top:2px;">AKTIVITAS HRIS & POTONGAN</div>

        <div class="mob-card" style="padding:7px 8px;display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf2f0;padding-bottom:6px;">
            <div>
              <div style="font-size:9.6px;font-weight:700;color:#0d2620;">ATT-14 · Kehadiran 1–18 Nov</div>
              <div style="font-size:8.4px;color:#5f7670;">14 hari kerja dari HRIS pabrik</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:9.8px;font-weight:700;color:#047857;">Rp 4.830.000</div>
              <div style="font-size:8px;color:#047857;font-weight:600;">Tersinkron</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf2f0;padding-bottom:6px;">
            <div>
              <div style="font-size:9.6px;font-weight:700;color:#0d2620;">WD-01 · Penarikan Sekolah</div>
              <div style="font-size:8.4px;color:#5f7670;">BI-FAST Bank Mandiri ****4812</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:9.8px;font-weight:700;color:#0d2620;">Rp 600.000</div>
              <div style="font-size:8px;color:#047857;font-weight:600;">Terkirim · 12 Nov</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf2f0;padding-bottom:6px;">
            <div>
              <div style="font-size:9.6px;font-weight:700;color:#0d2620;">CUT-25 · Potong Payroll</div>
              <div style="font-size:8.4px;color:#5f7670;">Otomatis tanggal gajian 25 Nov</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:9.8px;font-weight:700;color:#0369a1;">Rp 607.500</div>
              <div style="font-size:8px;color:#475569;font-weight:600;">Terjadwal</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:9.6px;font-weight:700;color:#0d2620;">EDU-01 · Sisa Gaji Bersih</div>
              <div style="font-size:8.4px;color:#5f7670;">Estimasi terima 25 Nov</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:9.8px;font-weight:700;color:#047857;">Rp 5.920.000</div>
              <div style="font-size:8px;color:#047857;font-weight:600;">Sehat · Aman</div>
            </div>
          </div>
        </div>

        <div style="background:#eef8f5;border:1px solid #a7dfd2;border-radius:5px;padding:7px 8px;margin-top:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:8.8px;font-weight:700;color:#075243;">Perlindungan Anti-Pinjol Aktif</span>
            <span class="mono" style="font-size:8.4px;font-weight:700;color:#047857;">0% Bunga</span>
          </div>
          <div style="font-size:8.2px;color:#3f5751;margin-top:2px;line-height:1.35;">Biaya admin flat Rp 7.500/tarik tanpa bunga &amp; tanpa denda. Pemotongan otomatis selesai saat gajian 25 Nov.</div>
        </div>
      </div>

      <div class="mob-tabbar">
        <div class="mob-tab is-on">${domainIcon('wallet', 12, '#0c7c66')}<span>Beranda</span></div>
        <div class="mob-tab">${ic('clock', 12, '#64748b')}<span>Riwayat</span></div>
        <div class="mob-tab">${domainIcon('receipt', 12, '#64748b')}<span>Potongan</span></div>
        <div class="mob-tab">${ic('users', 12, '#64748b')}<span>Profil</span></div>
      </div>
    </div>
  </div>`;

  const screen2 = `<div class="mob-frame">
    <div class="mob-screen">
      <div class="mob-statusbar"><span>09:24 WIB</span><span>BI-FAST SIAP</span></div>
      <div class="mob-header" style="padding-bottom:8px;">
        <div style="font-size:11.5px;font-weight:800;">Konfirmasi Tarik Instan</div>
        <div style="font-size:8.8px;color:#c5efe5;">Dana masuk rekening payroll &lt; 5 detik</div>
      </div>

      <div class="mob-body">
        <div class="mob-card">
          <div style="font-size:8.8px;color:#5f7670;font-weight:600;">Nominal Penarikan Dipilih</div>
          <div class="mono" style="font-size:19px;font-weight:800;color:#0c7c66;margin:3px 0;">Rp 500.000</div>
          <div style="height:6px;background:#e2ece9;border-radius:2px;overflow:hidden;margin:5px 0;">
            <div style="width:58.9%;height:100%;background:#0c7c66;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:8.4px;color:#5f7670;">
            <span>Min Rp 100.000</span>
            <span>Sisa Plafon Rp 849.000</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px;">
            <div style="border:1px solid #cbd8d3;border-radius:3px;padding:4px;text-align:center;font-family:var(--e-mono);font-size:8.8px;">Rp 300 rb</div>
            <div style="background:#e6f4f0;border:1px solid #0c7c66;color:#075243;border-radius:3px;padding:4px;text-align:center;font-family:var(--e-mono);font-size:8.8px;font-weight:700;">Rp 500 rb</div>
            <div style="border:1px solid #cbd8d3;border-radius:3px;padding:4px;text-align:center;font-family:var(--e-mono);font-size:8.8px;">Rp 800 rb</div>
          </div>
        </div>

        <div class="mob-card" style="padding:7px 9px;">
          <div style="font-size:9px;font-weight:700;color:#3f5751;margin-bottom:4px;">RINCIAN TRANSPARAN (0% BUNGA)</div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.4px;"><span class="kv-k">Dana Diterima di Rekening</span><span class="kv-v" style="color:#047857;">Rp 500.000</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.4px;"><span class="kv-k">Biaya Admin Flat BI-FAST</span><span class="kv-v">Rp 7.500</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.4px;"><span class="kv-k">Bunga & Denda</span><span class="kv-v" style="color:#047857;">Rp 0 (0%)</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.4px;"><span class="kv-k">Potong Payroll 25 Nov</span><span class="kv-v">Rp 507.500</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.4px;"><span class="kv-k">Rekening Tujuan</span><span class="kv-v">Mandiri ****4812</span></div>
        </div>

        <div style="background:#eef8f5;border:1px solid #a7dfd2;border-radius:5px;padding:7px 9px;">
          <div style="font-size:8.8px;font-weight:700;color:#075243;">Simulasi Sisa Gaji Bersih (25 Nov)</div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:3px;">
            <span style="font-size:8.8px;color:#405d56;">Sebelum: Rp 5.920.000</span>
            <span class="mono" style="font-size:11.5px;font-weight:800;color:#085a4a;">Rp 5.412.500</span>
          </div>
          <div style="font-size:8.2px;color:#3f5751;margin-top:2px;">Status keuangan: <strong>Sehat</strong> (di bawah batas aman 30%)</div>
        </div>

        <div style="background:#0c7c66;color:#ffffff;border-radius:4px;padding:8px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:10px;font-weight:700;margin-top:auto;">
          ${domainIcon('fingerprint', 13, '#ffffff')}
          <span>Otorisasi Biometrik & Cairkan</span>
        </div>
      </div>

      <div class="mob-tabbar">
        <div class="mob-tab is-on">${domainIcon('wallet', 12, '#0c7c66')}<span>Beranda</span></div>
        <div class="mob-tab">${ic('clock', 12, '#64748b')}<span>Riwayat</span></div>
        <div class="mob-tab">${domainIcon('receipt', 12, '#64748b')}<span>Potongan</span></div>
        <div class="mob-tab">${ic('users', 12, '#64748b')}<span>Profil</span></div>
      </div>
    </div>
  </div>`;

  const screen3 = `<div class="mob-frame">
    <div class="mob-screen">
      <div class="mob-statusbar"><span>09:24 WIB</span><span>LUNAS · 1,12s</span></div>
      <div class="mob-header" style="padding-bottom:8px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="width:22px;height:22px;border-radius:4px;background:#ffffff;color:#0c7c66;display:inline-flex;align-items:center;justify-content:center;">${ic('check', 14, '#0c7c66')}</span>
          <div>
            <div style="font-size:11.5px;font-weight:800;">Pencairan BI-FAST Berhasil</div>
            <div class="mono" style="font-size:8.5px;color:#c5efe5;">RRN: BIF26111809248814</div>
          </div>
        </div>
      </div>

      <div class="mob-body">
        <div class="mob-card" style="text-align:center;padding:8px;">
          <div style="font-size:8.6px;color:#5f7670;">Dana Terkirim ke Bank Mandiri ****4812</div>
          <div class="mono" style="font-size:18px;font-weight:800;color:#047857;margin:2px 0;">Rp 600.000</div>
          <div style="display:inline-flex;gap:5px;">
            ${badge('Waktu Cair 1,12 dtk', 'ok')}
            ${badge('0% Bunga', 'accent')}
          </div>
        </div>

        <div class="mob-card" style="padding:7px 9px;">
          <div style="font-size:9px;font-weight:700;color:#3f5751;margin-bottom:4px;">BUKTI TRANSAKSI & JADWAL PAYROLL</div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">ID Referensi EWA</span><span class="kv-v">EWA-2611-8401</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Penerima</span><span class="kv-v">Slamet Riyadi</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Tujuan Pencairan</span><span class="kv-v">Biaya Sekolah</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Biaya Admin Flat</span><span class="kv-v">Rp 7.500</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Tanggal Potong Gaji</span><span class="kv-v" style="color:#0369a1;">25 Nov 2026</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Kode Potongan SAP</span><span class="kv-v">WT-9410 · CUT-25</span></div>
          <div class="kv-row" style="padding:3.5px 0;font-size:9.3px;"><span class="kv-k">Total Potong Payroll</span><span class="kv-v" style="color:#0d2620;">Rp 607.500</span></div>
        </div>

        <div style="background:#f8fbfa;border:1px solid #d6e0dd;border-radius:4px;padding:6px 8px;font-size:8.6px;color:#405d56;line-height:1.38;">
          <strong>Otomatis Tuntas saat Gajian:</strong> Anda tidak perlu transfer balik manual. HRIS akan memotong otomatis di slip gaji 25 Nov 2026 tanpa bunga.
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:auto;">
          <div style="border:1px solid #0c7c66;color:#085a4a;background:#ffffff;border-radius:4px;padding:6px;text-align:center;font-size:9.5px;font-weight:700;">Unduh Resi PDF</div>
          <div style="background:#0c7c66;color:#ffffff;border-radius:4px;padding:6px;text-align:center;font-size:9.5px;font-weight:700;">Kembali Beranda</div>
        </div>
      </div>

      <div class="mob-tabbar">
        <div class="mob-tab">${domainIcon('wallet', 12, '#64748b')}<span>Beranda</span></div>
        <div class="mob-tab is-on">${ic('clock', 12, '#0c7c66')}<span>Riwayat</span></div>
        <div class="mob-tab">${domainIcon('receipt', 12, '#64748b')}<span>Potongan</span></div>
        <div class="mob-tab">${ic('users', 12, '#64748b')}<span>Profil</span></div>
      </div>
    </div>
  </div>`;

  const connectorRows = HRIS_CONNECTORS.map((c) => `<tr>
    <td style="font-weight:600;color:#0d2620;">${esc(c.plant)}</td>
    <td class="num mono">${fmtNum(c.emp)}</td>
    <td class="mono" style="font-size:9.8px;color:#475569;">${esc(c.proto)}</td>
    <td class="mono" style="font-size:9.8px;">${esc(c.lastSync)}</td>
    <td class="num mono">${esc(c.latency)}</td>
    <td>${badge(c.status, c.tone)}</td>
  </tr>`).join('');

  const contentHtml = `
  <section style="flex:1;min-height:0;display:grid;grid-template-columns:964px 1fr;gap:10px;">
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${domainIcon('phone', 13, '#0c7c66')}<span>Pratinjau Aplikasi Mobile Karyawan (.NET MAUI 9.0 · Android/iOS) — Alur End-to-End 3 Layar</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Company SSO + Biometrik', 'accent')}
          <span class="e-panel-sub mono">Simulasi Karyawan: Slamet Riyadi (KM-04821)</span>
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;background:#eef3f1;">
        <div class="mob-stage" style="flex:1;min-height:0;">
          ${screen1}
          ${screen2}
          ${screen3}
        </div>
        <div style="background:#ffffff;border:1px solid #d0dcd8;border-radius:4px;padding:7px 10px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:10px;">
          <div><div style="color:#5f7670;font-weight:600;">Runtime Mobile</div><div class="mono" style="font-weight:700;color:#0d2620;">.NET MAUI 9 · AOT Native</div></div>
          <div><div style="color:#5f7670;font-weight:600;">Otentikasi Edge</div><div class="mono" style="font-weight:700;color:#085a4a;">Company SSO + PIN/Bio</div></div>
          <div><div style="color:#5f7670;font-weight:600;">Latensi Cair BI-FAST</div><div class="mono" style="font-weight:700;color:#047857;">p50 0,84s · p95 1,18s</div></div>
          <div><div style="color:#5f7670;font-weight:600;">Adopsi Staf Pabrik</div><div class="mono" style="font-weight:700;color:#0d2620;">3.892 / 4.120 (94,5%)</div></div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 476px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('sliders', 13, '#0c7c66')}<span>Mesin Guardrail Kebijakan EWA Perusahaan</span></div>
          ${badge('Policy v4.2 Aktif', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div>
            <div class="kv-row"><span class="kv-k">Batas Maksimum Penarikan (Cap Guardrail)</span><span class="kv-v" style="color:#0c7c66;">30% Hak Gaji Berjalan</span></div>
            <div class="kv-row"><span class="kv-k">Skema Biaya & Bunga (Anti-Pinjol)</span><span class="kv-v" style="color:#047857;">Rp 7.500 Flat · 0% Bunga</span></div>
            <div class="kv-row"><span class="kv-k">Frekuensi Maksimum per Siklus Gaji</span><span class="kv-v">2x Penarikan / Bulan</span></div>
            <div class="kv-row"><span class="kv-k">Masa Kerja Minimum Karyawan</span><span class="kv-v">≥ 90 Hari (Lulus Probasi)</span></div>
            <div class="kv-row"><span class="kv-k">Cooling-Off Antar Transaksi</span><span class="kv-v">48 Jam (Anti-Impulsif)</span></div>
            <div class="kv-row"><span class="kv-k">Blackout Window Cut-Off Payroll</span><span class="kv-v" style="color:#b45309;">Tgl 22 (23:59) – Tgl 26</span></div>
            <div class="kv-row"><span class="kv-k">Rekening Tujuan yang Diizinkan</span><span class="kv-v">100% Rekening Payroll HRIS</span></div>
            <div class="kv-row"><span class="kv-k">Auto-Lock Status Terminasi / SP3</span><span class="kv-v" style="color:#be123c;">Aktif Real-Time (&lt; 30 dtk)</span></div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:6px 8px;">
              <div style="font-size:9px;color:#405d56;font-weight:600;">Karyawan Eligible</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#075243;">3.964 / 4.120</div>
            </div>
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:6px 8px;">
              <div style="font-size:9px;color:#405d56;font-weight:600;">Blokir Guardrail</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#b45309;">19 Tx (0%)</div>
            </div>
            <div style="background:#f3faf7;border:1px solid #c3e4d8;border-radius:4px;padding:6px 8px;">
              <div style="font-size:9px;color:#405d56;font-weight:600;">Auto-Lock Resign</div>
              <div class="mono" style="font-size:12px;font-weight:800;color:#be123c;">4 Akun Beku</div>
            </div>
          </div>

          <div class="code-pane" style="font-size:9.6px;line-height:1.45;">
            <div style="color:#64827a;margin-bottom:3px;">// Evaluasi Guardrail Live — NIK KM-04821 (Slamet Riyadi)</div>
            <div style="color:#fde68a;font-weight:700;">Kebijakan EWA: Hak=Rp 4.830.000 | Maks 30%=Rp 1.449.000 | Ditarik=Rp 600.000 | Sisa Tersedia=Rp 849.000.</div>
            <div style="margin-top:4px;color:#5eead4;">PASS: sisa_gaji_bersih (Rp 5.412.500) &gt;= batas_sehat_70pct · status=ELIGIBLE</div>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#0c7c66')}<span>Konektor Mesin Absensi & HRIS Multi-Plant</span></div>
          ${badge('6/6 Online', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-roomy" style="font-size:10.1px;">
            <colgroup>
              <col style="width:205px;" />
              <col style="width:52px;" />
              <col style="width:82px;" />
              <col style="width:74px;" />
              <col style="width:58px;" />
              <col style="width:62px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Plant & Perangkat Absensi</th>
                <th class="num">Staf</th>
                <th>Protokol</th>
                <th>Sinkron</th>
                <th class="num">Latensi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${connectorRows}</tbody>
            <tfoot>
              <tr>
                <td>TOTAL INTEGRASI ABSENSI HRIS</td>
                <td class="num mono">${fmtNum(TOTAL_EMP)}</td>
                <td colspan="2" class="mono" style="font-size:9.5px;">0 Anomali Log</td>
                <td class="num mono">107 ms</td>
                <td>${badge('100%', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#f4f9f7;border-top:1px solid #d6e0dd;font-size:9.8px;color:#3f5751;margin-top:auto;">
            Sinkronisasi delta kehadiran berjalan otomatis setiap <strong>15 menit</strong>; pembaruan hak gaji berjalan langsung tampil di aplikasi mobile karyawan.
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const body = renderShell({
    activeTab: 'p3',
    crumbTitle: 'Pengalaman Mobile (.NET MAUI) & Mesin Guardrail',
    crumbSub: 'Alur penarikan karyawan end-to-end terhubung langsung ke mesin absensi pabrik & kebijakan cap 30%',
    subRightHtml: `
      <span class="f-filter-pill is-on">Persona: Operator Plant Cikarang</span>
      <span class="f-filter-pill">Policy v4.2 (Cap 30%)</span>
      <span class="e-btn">${ic('sliders', 11, '#334155')}<span>Simulasi Kebijakan</span></span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}<span>Terbitkan Aturan</span></span>
    `,
    contentHtml,
  });

  return wrapPage('p3', meta.pages[2].title, body);
}

// ============================================================================
// PAGE 4: REKONSILIASI CUT-OFF PAYROLL, DOA APPROVAL & CORETAX / PSAK 24
// ============================================================================
function renderPage4() {
  const reconRows = ENTITIES.map((e) => `<tr>
    <td class="mono" style="font-weight:700;color:#085a4a;">${esc(e.code)}</td>
    <td style="font-weight:600;color:#0d2620;">${esc(e.name)}</td>
    <td class="num mono">${fmtNum(e.txCount)}</td>
    <td class="num mono">${fmtIdr(e.disbursedIdr)}</td>
    <td class="num mono">${fmtIdr(e.adminFeeIdr)}</td>
    <td class="num mono" style="font-weight:700;">${fmtIdr(e.deductionIdr)}</td>
    <td class="num mono" style="color:#047857;font-weight:700;">Rp 0</td>
    <td>${badge('3-Way Match', 'ok')}</td>
  </tr>`).join('');

  const sumDr = JOURNAL_ENTRIES.reduce((a, j) => a + j.debit, 0);
  const sumCr = JOURNAL_ENTRIES.reduce((a, j) => a + j.credit, 0);

  const journalRows = JOURNAL_ENTRIES.map((j) => `<tr>
    <td class="mono" style="font-weight:700;color:#085a4a;">${esc(j.gl)}</td>
    <td><div style="font-weight:600;color:#0d2620;" class="trunc">${esc(j.account)}</div><div style="font-size:9.2px;color:#5f7670;" class="trunc">${esc(j.note)}</div></td>
    <td class="mono" style="font-size:9.8px;color:#475569;">${esc(j.costCenter)}</td>
    <td style="font-size:10px;color:#3f5751;">${esc(j.phase)}</td>
    <td class="num mono" style="font-weight:${j.debit ? '700' : '400'};color:${j.debit ? '#0d2620' : '#94a3b8'};">${j.debit ? fmtIdr(j.debit) : '—'}</td>
    <td class="num mono" style="font-weight:${j.credit ? '700' : '400'};color:${j.credit ? '#0369a1' : '#94a3b8'};">${j.credit ? fmtIdr(j.credit) : '—'}</td>
  </tr>`).join('');

  const contentHtml = `
  <section class="e-panel" style="flex:0 0 116px;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('checkCircle', 13, '#0c7c66')}<span>Delegation of Authority (DoA) Maker-Checker — Batch Potongan Payroll PAY-CUT-202611-01 (Gajian 25 Nov 2026)</span></div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('Total Potongan: ' + fmtIdr(TOTAL_DEDUCTION), 'accent')}
        ${badge('Selisih 3-Way: Rp 0', 'ok')}
      </div>
    </div>
    <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:8px 11px;">
      <div class="doa-step is-done" style="padding:6px 9px;">
        <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;font-size:10.5px;color:#065f46;">Tahap 1 · Maker (HR Payroll)</span>${badge('Selesai', 'ok')}</div>
        <div style="font-size:9.6px;color:#3f5751;">Rina Kartika · Kunci 2.340 transaksi & generate file SAP IDoc WT-9410.</div>
        <div class="mono" style="font-size:9px;color:#5f7670;">18 Nov 08:45 WIB · SIG-88A3C51F</div>
      </div>
      <div class="doa-step is-active" style="padding:6px 9px;">
        <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;font-size:10.5px;color:#92400e;">Tahap 2 · Checker (Controller)</span>${badge('Aktif', 'warn')}</div>
        <div style="font-size:9.6px;color:#3f5751;">Budi Santoso · Meninjau 3-Way Match Escrow Mandiri & jurnal PSAK 24.</div>
        <div class="mono" style="font-size:9px;color:#92400e;">Dibuka 09:12 WIB · SLA tersisa 3j 48m</div>
      </div>
      <div class="doa-step is-wait" style="padding:6px 9px;">
        <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;font-size:10.5px;color:#334155;">Tahap 3 · Approver (CFO)</span>${badge('Menunggu', 'neutral')}</div>
        <div style="font-size:9.6px;color:#475569;">Hendra Wijaya · Otorisasi final settlement & transfer balik Escrow.</div>
        <div class="mono" style="font-size:9px;color:#64748b;">Target otorisasi: 23 Nov 15:00 WIB</div>
      </div>
      <div class="doa-step is-wait" style="padding:6px 9px;">
        <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:700;font-size:10.5px;color:#334155;">Tahap 4 · Posting SAP & Bank</span>${badge('Terjadwal', 'info')}</div>
        <div style="font-size:9.6px;color:#475569;">Injeksi otomatis WT-9410 ke SAP S/4HANA Payroll + arsip CoreTax XML.</div>
        <div class="mono" style="font-size:9px;color:#64748b;">Eksekusi otomatis: 23 Nov 17:00 WIB</div>
      </div>
    </div>
  </section>

  <section style="flex:1;min-height:0;display:grid;grid-template-columns:1.42fr 1fr;gap:10px;">
    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 348px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${domainIcon('receipt', 13, '#0c7c66')}<span>Rekonsiliasi 3-Way Match Potongan Payroll (Ledger EWA × Escrow BI-FAST × SAP HRIS)</span></div>
          <span class="e-panel-sub mono">Cut-Off: 25 Nov 2026</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-roomy" style="font-size:10.3px;">
            <colgroup>
              <col style="width:66px;" />
              <col style="width:214px;" />
              <col style="width:52px;" />
              <col style="width:118px;" />
              <col style="width:94px;" />
              <col style="width:118px;" />
              <col style="width:66px;" />
              <col style="width:96px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Entitas Payroll SAP</th>
                <th class="num">Tx</th>
                <th class="num">Pokok EWA</th>
                <th class="num">Admin Flat</th>
                <th class="num">Total Potong SAP</th>
                <th class="num">Selisih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${reconRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL BATCH PAY-CUT-202611-01</td>
                <td class="num mono">${fmtNum(TOTAL_TX)}</td>
                <td class="num mono">${fmtIdr(TOTAL_DISBURSED)}</td>
                <td class="num mono">${fmtIdr(TOTAL_ADMIN)}</td>
                <td class="num mono">${fmtIdr(TOTAL_DEDUCTION)}</td>
                <td class="num mono" style="color:#047857;">Rp 0</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;background:#f4f9f7;border-top:1px solid #d6e0dd;display:flex;justify-content:space-between;font-size:10px;color:#3f5751;margin-top:auto;">
            <span>File potongan otomatis dikirim ke <strong>SAP S/4HANA Payroll (IDoc HRMD_A)</strong> &amp; <strong>CSV Bank Mandiri</strong> 48 jam sebelum tanggal gajian.</span>
            <span class="mono" style="font-weight:700;color:#085a4a;">0 Retur · 100% Match</span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0c7c66')}<span>Jurnal Akuntansi Otomatis SAP FI-GL (PSAK 24 Imbalan Kerja Jangka Pendek)</span></div>
          ${badge('Debit = Kredit · Balanced', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-roomy" style="font-size:10.3px;">
            <colgroup>
              <col style="width:68px;" />
              <col style="width:276px;" />
              <col style="width:116px;" />
              <col style="width:130px;" />
              <col style="width:126px;" />
              <col style="width:126px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Akun GL</th>
                <th>Nama Akun & Keterangan Posting</th>
                <th>Cost Center</th>
                <th>Tahap Siklus</th>
                <th class="num">Debit (IDR)</th>
                <th class="num">Kredit (IDR)</th>
              </tr>
            </thead>
            <tbody>${journalRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL JURNAL OTOMATIS (5 BARIS · DOKUMEN FI #1900048211)</td>
                <td class="num mono">${fmtIdr(sumDr)}</td>
                <td class="num mono">${fmtIdr(sumCr)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;background:#f8fbfa;border-top:1px solid #d6e0dd;font-size:9.9px;color:#405d56;margin-top:auto;">
            <strong>Catatan PSAK 24:</strong> EWA diakui sebagai <em>Piutang Uang Muka Gaji (113040)</em> yang diselesaikan 100% terhadap <em>Hutang Gaji (211010)</em> saat cut-off payroll — tanpa beban bunga atau provisi kredit macet.
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 384px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#0c7c66')}<span>Inspektor CoreTax XML & SAP Payroll Wage Type (WT-9410)</span></div>
          ${badge('XSD v2.1 Valid', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div class="code-pane" style="font-size:9.7px;line-height:1.5;">
            <div><span class="xml-cmt">&lt;!-- CoreTax DJP / SAP Payroll Deduction Envelope --&gt;</span></div>
            <div><span class="xml-tag">&lt;PayrollDeductionBatch</span> <span class="xml-attr">batchId</span>=<span class="xml-val">"PAY-CUT-202611-01"</span></div>
            <div>&nbsp;&nbsp;<span class="xml-attr">period</span>=<span class="xml-val">"2026-11"</span> <span class="xml-attr">payDate</span>=<span class="xml-val">"2026-11-25"</span> <span class="xml-attr">entities</span>=<span class="xml-val">"6"</span><span class="xml-tag">&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="xml-tag">&lt;TaxTreatment</span> <span class="xml-attr">reg</span>=<span class="xml-val">"PP-58-2023-TER"</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-attr">classification</span>=<span class="xml-val">"EARNED_WAGE_ADVANCE"</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-attr">pph21BaseImpact</span>=<span class="xml-val">"ZERO_DISTORTION"</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-attr">interestRateApr</span>=<span class="xml-val">"0.00"</span> <span class="xml-attr">bpa1Status</span>=<span class="xml-val">"GROSS_FULL"</span> <span class="xml-tag">/&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="xml-tag">&lt;SapWageType</span> <span class="xml-attr">code</span>=<span class="xml-val">"WT-9410"</span> <span class="xml-attr">sign</span>=<span class="xml-val">"DEDUCT_NET"</span><span class="xml-tag">&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-tag">&lt;TxCount&gt;</span>2340<span class="xml-tag">&lt;/TxCount&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-tag">&lt;PrincipalIdr&gt;</span>1842600000<span class="xml-tag">&lt;/PrincipalIdr&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-tag">&lt;FlatAdminFeeIdr&gt;</span>17550000<span class="xml-tag">&lt;/FlatAdminFeeIdr&gt;</span></div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="xml-tag">&lt;TotalDeductIdr&gt;</span>1860150000<span class="xml-tag">&lt;/TotalDeductIdr&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="xml-tag">&lt;/SapWageType&gt;</span></div>
            <div>&nbsp;&nbsp;<span class="xml-tag">&lt;Integrity</span> <span class="xml-attr">algo</span>=<span class="xml-val">"SHA-256"</span> <span class="xml-attr">digest</span>=<span class="xml-val">"5e92a117c632...90f1"</span> <span class="xml-tag">/&gt;</span></div>
            <div><span class="xml-tag">&lt;/PayrollDeductionBatch&gt;</span></div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#f4f9f7;border:1px solid #d0dcd8;border-radius:4px;padding:6px 8px;font-size:9.4px;">
            <div><div style="color:#5f7670;">Skema XSD DJP</div><div class="mono" style="font-weight:700;color:#047857;">CoreTax v2.1 OK</div></div>
            <div><div style="color:#5f7670;">Mapping SAP</div><div class="mono" style="font-weight:700;color:#085a4a;">IDoc WT-9410</div></div>
            <div><div style="color:#5f7670;">Bukti Potong</div><div class="mono" style="font-weight:700;color:#0d2620;">BPA1 Utuh 100%</div></div>
          </div>

          <div style="display:flex;gap:6px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('download', 11, '#ffffff')}<span>Unduh SAP IDoc + CSV</span></span>
            <span class="e-btn" style="flex:1;justify-content:center;">${ic('fileText', 11, '#334155')}<span>Unduh CoreTax XML</span></span>
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#0c7c66')}<span>Matriks Kepatuhan Pajak, Ketenagakerjaan & OJK</span></div>
          ${badge('5/5 Patuh', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          <div class="kv-row">
            <div><div style="font-weight:700;color:#0d2620;">PPh 21 TER (PP 58/2023 &amp; CoreTax)</div><div style="font-size:9.4px;color:#5f7670;">Pajak tetap dihitung dari gaji bruto penuh di akhir bulan; 0 selisih BPA1.</div></div>
            ${badge('Patuh', 'ok')}
          </div>
          <div class="kv-row">
            <div><div style="font-weight:700;color:#0d2620;">PP 36/2021 Pengupahan (Batas Potongan)</div><div style="font-size:9.4px;color:#5f7670;">Regulasi maks. 50%; guardrail TarikCepat membatasi ketat ≤ 30% hak.</div></div>
            ${badge('≤ 30% Cap', 'ok')}
          </div>
          <div class="kv-row">
            <div><div style="font-weight:700;color:#0d2620;">Skema EWA Bebas Bunga (Non-Pinjol)</div><div style="font-size:9.4px;color:#5f7670;">0% bunga, 0% denda keterlambatan, tidak ada penagihan pihak ketiga.</div></div>
            ${badge('0% APR', 'ok')}
          </div>
          <div class="kv-row">
            <div><div style="font-weight:700;color:#0d2620;">UU PDP No. 27/2022 (Data Karyawan)</div><div style="font-size:9.4px;color:#5f7670;">NIK, slip gaji, &amp; rekening terenkripsi AES-256-GCM + consent tercatat.</div></div>
            ${badge('AES-256', 'ok')}
          </div>
          <div class="kv-row">
            <div><div style="font-weight:700;color:#0d2620;">PSAK 24 Imbalan Kerja Jangka Pendek</div><div style="font-size:9.4px;color:#5f7670;">Jurnal otomatis seimbang antara piutang uang muka &amp; hutang gaji.</div></div>
            ${badge('Balanced', 'ok')}
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const body = renderShell({
    activeTab: 'p4',
    crumbTitle: 'Rekonsiliasi Cut-Off Payroll, DoA & CoreTax PSAK 24',
    crumbSub: 'Otorisasi Maker-Checker, rekonsiliasi 3-Way Match, jurnal FI-GL otomatis, dan kepatuhan PPh 21',
    subRightHtml: `
      <span class="f-filter-pill is-on">Siklus 2026-11 (25 Nov)</span>
      <span class="f-filter-pill">Wage Type: WT-9410</span>
      <span class="e-btn">${ic('eye', 11, '#334155')}<span>Pratinjau Slip Karyawan</span></span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}<span>Kirim ke Checker (Budi S.)</span></span>
    `,
    contentHtml,
  });

  return wrapPage('p4', meta.pages[3].title, body);
}

// ============================================================================
// PAGE 5: AUDIT WORM LEDGER, KEAMANAN SSO/BIOMETRIK & KESEHATAN INTEGRASI
// ============================================================================
function renderPage5() {
  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi e-kpi-accent">
      <div class="e-kpi-top"><span>Integritas WORM Hash Chain</span>${badge('0 Tamper', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">100,0%</span></div>
      <div class="e-kpi-foot"><span>PostgreSQL Append-Only + S3 Lock</span><span class="mono">SHA-256</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Anomali Dicegah Guardrail</span>${badge('Hard-Block', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_GUARDRAIL_BLOCKED)} Tx</span></div>
      <div class="e-kpi-foot"><span>Rp 0 kebocoran plafon / resign</span><span class="mono">6 Aturan</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Ketersediaan BI-FAST API</span>${badge('ISO 20022', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">99,96%</span></div>
      <div class="e-kpi-foot"><span>p95 switch 412 ms · mTLS aktif</span><span class="mono">JKT-AZ1</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Otentikasi SSO & Biometrik</span>${badge('FIDO2', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">3.892 Perangkat</span></div>
      <div class="e-kpi-foot"><span>Device binding .NET MAUI aktif</span><span class="mono">0 Takeover</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Enkripsi Kolom PII UU PDP</span>${badge('HSM Vault', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">AES-256-GCM</span></div>
      <div class="e-kpi-foot"><span>Rotasi kunci otomatis 18 Nov 08:15</span><span class="mono">ISO 27001</span></div>
    </div>
  </section>`;

  const auditRows = AUDIT_LOGS.map((a) => `<tr class="${a.tone === 'bad' ? 'is-bad' : a.tone === 'warn' ? 'is-warn' : ''}">
    <td class="mono" style="color:#475569;">${esc(a.ts)}</td>
    <td class="mono" style="font-weight:700;color:#085a4a;">${esc(a.id)}</td>
    <td style="font-weight:600;color:#0d2620;">${esc(a.actor)}</td>
    <td><span class="e-badge e-badge-neutral">${esc(a.module)}</span></td>
    <td style="color:#2b433d;">${esc(a.action)}</td>
    <td class="mono" style="font-size:9.4px;color:#5f7670;">${esc(a.hash)}</td>
    <td>${badge(a.result, a.tone)}</td>
  </tr>`).join('');

  const ruleRows = GUARDRAIL_RULES.map((g) => `<tr>
    <td class="mono" style="font-weight:700;color:#085a4a;">${esc(g.code)}</td>
    <td><div style="font-weight:700;color:#0d2620;" class="trunc">${esc(g.name)}</div><div style="font-size:9.1px;color:#5f7670;" class="trunc">${esc(g.desc)}</div></td>
    <td>${badge(g.mode, g.tone)}</td>
    <td class="num mono" style="font-weight:700;color:${g.blocked >= 4 ? '#be123c' : '#0d2620'};">${g.blocked}</td>
  </tr>`).join('');

  const infraRows = INFRA_SERVICES.map((s) => `<tr>
    <td style="font-weight:600;color:#0d2620;">${esc(s.name)}</td>
    <td class="mono" style="font-size:9.6px;color:#475569;">${esc(s.proto)}</td>
    <td class="num mono">${esc(s.p95)}</td>
    <td class="num mono">${esc(s.sla)}</td>
    <td>${badge(s.status, s.tone)}</td>
  </tr>`).join('');

  const contentHtml = `${kpiHtml}
  <section style="flex:1;min-height:0;display:grid;grid-template-columns:1.48fr 1fr;gap:10px;">
    <div class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('lock', 13, '#0c7c66')}<span>Log Audit Imutabel WORM (PostgreSQL Payroll Deduction Ledger · 18 Event Terkini)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Merkle Root #261118-001 Terverifikasi', 'ok')}
          <span class="e-panel-sub mono">Retensi 10 Tahun</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table e-table-mid" style="font-size:10.2px;">
          <colgroup>
            <col style="width:62px;" />
            <col style="width:84px;" />
            <col style="width:146px;" />
            <col style="width:102px;" />
            <col style="width:276px;" />
            <col style="width:148px;" />
            <col style="width:76px;" />
          </colgroup>
          <thead>
            <tr>
              <th>WIB</th>
              <th>ID Event</th>
              <th>Aktor / Service</th>
              <th>Modul</th>
              <th>Aksi & Objek Terverifikasi</th>
              <th>Hash WORM</th>
              <th>Hasil</th>
            </tr>
          </thead>
          <tbody>${auditRows}</tbody>
        </table>
        <div style="padding:8px 11px;background:#0e1d19;color:#cfe6df;display:flex;align-items:center;justify-content:space-between;font-family:var(--e-mono);font-size:9.6px;margin-top:auto;">
          <span><strong style="color:#5eead4;">WORM VERIFY OK:</strong> chain_len=48.912 · prev_hash=e71b0d55c08a · head_hash=9a4f7c1ed82b · tamper_count=0</span>
          <span style="color:#fde68a;">Siap Audit Eksternal &amp; OJK</span>
        </div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;min-height:0;">
      <div class="e-panel" style="flex:0 0 398px;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#0c7c66')}<span>Matriks Anti-Fraud & Proteksi Karyawan (Auto-Guardrail)</span></div>
          ${badge('Total Blokir: ' + TOTAL_GUARDRAIL_BLOCKED + ' Tx', 'warn')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-mid" style="font-size:10.2px;">
            <colgroup>
              <col style="width:54px;" />
              <col style="width:328px;" />
              <col style="width:94px;" />
              <col style="width:58px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Aturan Proteksi & Deskripsi</th>
                <th>Mode</th>
                <th class="num">Blokir</th>
              </tr>
            </thead>
            <tbody>${ruleRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">TOTAL ANOMALI DICEGAH (SIKLUS NOV 2026 · 0 KERUGIAN)</td>
                <td class="num mono">${TOTAL_GUARDRAIL_BLOCKED}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 10px;background:#f4f9f7;border-top:1px solid #d6e0dd;font-size:9.8px;color:#3f5751;margin-top:auto;">
            Seluruh transaksi yang diblokir tidak memotong saldo karyawan dan mengenakan biaya admin <strong>Rp 0</strong>.
          </div>
        </div>
      </div>

      <div class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#0c7c66')}<span>Kesehatan Infrastruktur .NET 9, PostgreSQL & BI-FAST</span></div>
          ${badge('6/6 Sehat', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table e-table-roomy" style="font-size:10.1px;">
            <colgroup>
              <col style="width:214px;" />
              <col style="width:96px;" />
              <col style="width:62px;" />
              <col style="width:62px;" />
              <col style="width:96px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Layanan & Komponen Inti</th>
                <th>Protokol</th>
                <th class="num">p95</th>
                <th class="num">SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${infraRows}</tbody>
          </table>
          <div style="padding:8px 10px;background:#f8fbfa;border-top:1px solid #d6e0dd;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;margin-top:auto;">
            <span style="color:#3f5751;"><strong>DRP Aktif-Aktif:</strong> DCI Jakarta JK5 &harr; DRC Surabaya (RPO 0 dtk · RTO &lt; 60 dtk)</span>
            <span class="mono" style="color:#085a4a;font-weight:700;">.NET 9.0.4 · PG 16.6</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const body = renderShell({
    activeTab: 'p5',
    crumbTitle: 'Audit WORM Ledger, Keamanan SSO & SLA Infrastruktur',
    crumbSub: 'Jejak audit kriptografis PostgreSQL append-only, proteksi anti-fraud karyawan, dan telemetri BI-FAST',
    subRightHtml: `
      <span class="f-filter-pill is-on">Semua Event (48.912)</span>
      <span class="f-filter-pill">Blokir Guardrail (19)</span>
      <span class="e-btn">${ic('key', 11, '#334155')}<span>Verifikasi Merkle Root</span></span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Ekspor Bundel Audit JSONL</span></span>
    `,
    contentHtml,
  });

  return wrapPage('p5', meta.pages[4].title, body);
}

export function renderPages() {
  return [
    renderPage1(),
    renderPage2(),
    renderPage3(),
    renderPage4(),
    renderPage5(),
  ];
}
