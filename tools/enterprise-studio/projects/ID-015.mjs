import {
  esc,
  fmtNum,
  fmtIdr,
  fmtPct,
  ic,
  wrapEnterpriseHtml,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSparkline,
  svgSpanWaterfall,
} from '../charts.mjs';

export const meta = {
  id: 'ID-015',
  name: 'DeteksiQRIS',
  reference: 'CrowdStrike Falcon SIEM + SentinelOne Operations Center',
  persona: 'R. Aditya · Lead Fraud Ops SOC · PT Nusantara Pay Switch (PJP Lv.1)',
  pages: [
    { slug: 'p1', title: 'Komando Radar Fraud Real-Time' },
    { slug: 'p2', title: 'Meja Triase & Inspektor Payload gRPC' },
    { slug: 'p3', title: 'Graf Jaringan Mule & Farm Emulator' },
    { slug: 'p4', title: 'Mode Shadow & Replay Aturan 30 Hari' },
    { slug: 'p5', title: 'Kepatuhan BI TIKMI & Dossier STR PPATK' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY VERIFIED ACROSS P1-P5)
// ============================================================================
const STREAM_TELEMETRY = {
  tpsNow: 1840,
  p50Ms: 11,
  p95Ms: 22,
  p99Ms: 28,
  slaMs: 50,
  activeClusters: 2,
  accuracyPct: 99.4,
  fpRatePct: 0.18,
  kafkaLagMs: 12,
  redisHitPct: 99.98,
  clickhouseTx30d: 48620000,
};

const ALERTS = [
  {
    code: 'FRD-992',
    time: '14:12:09',
    channel: 'QRIS MPM',
    targetId: 'ID10294811',
    targetName: 'Toko Elektronik Cahaya Abadi',
    title: 'Klaster Fan-In Mule #14 (19 Pengirim)',
    subtitle: '19 akun -> 1 merchant baru dalam 4 menit',
    vector: 'Mule Fan-In 5M',
    amountIdr: 94500000,
    displayVal: 'Rp 94.500.000',
    score: 96,
    latencyMs: 26,
    status: 'Ditahan',
    tone: 'bad',
    cluster: 'KLS-14',
    ruleId: 'MULE_FAN_IN_5M',
    acquirer: 'PT Nusantara Pay (NNS 93600811)',
    holdId: 'HLD-261122-0992',
    strStatus: 'Siap Kirim GRIPS',
    strTone: 'warn',
    slaLeft: '46j 18m',
    selected: true,
  },
  {
    code: 'FRD-989',
    time: '14:09:44',
    channel: 'E-Wallet',
    targetId: 'DEV-MKS-8F4A',
    targetName: 'Farm Emulator Perangkat — Makassar',
    title: 'Farm Emulator Perangkat — Makassar',
    subtitle: '42 pendaftaran dompet berbagi satu hash IMEI',
    vector: 'Device Farm IMEI',
    amountIdr: 21000000,
    displayVal: '42 akun',
    score: 91,
    latencyMs: 19,
    status: 'Diblokir',
    tone: 'bad',
    cluster: 'KLS-09',
    ruleId: 'EMU_IMEI_COLLISION',
  },
  {
    code: 'FRD-984',
    time: '14:06:31',
    channel: 'QRIS MPM',
    targetId: 'ID10294603',
    targetName: 'Warung Kelontong Pak Slamet',
    title: 'Lonjakan Tiket QRIS Merchant (14x)',
    subtitle: 'Warung kelontong memproses Rp 10jt x 8',
    vector: 'Ticket Spike 14x',
    amountIdr: 80000000,
    displayVal: 'Rp 80.000.000',
    score: 78,
    latencyMs: 29,
    status: 'Tinjau',
    tone: 'warn',
    cluster: '-',
    ruleId: 'MERCHANT_TICKET_SPIKE',
  },
  {
    code: 'FRD-980',
    time: '14:02:18',
    channel: 'BI-FAST',
    targetId: 'USR-8841209',
    targetName: 'Dompet R. Saputra (JKT -> MDN)',
    title: 'Loncatan Lokasi Tidak Masuk Akal',
    subtitle: 'Transaksi Jakarta -> Medan dalam 11 menit',
    vector: 'Impossible Travel',
    amountIdr: 4200000,
    displayVal: 'Rp 4.200.000',
    score: 72,
    latencyMs: 20,
    status: 'Wajib OTP',
    tone: 'warn',
    cluster: '-',
    ruleId: 'GEO_VELOCITY_JUMP',
  },
  {
    code: 'FRD-978',
    time: '13:57:52',
    channel: 'QRIS MPM',
    targetId: 'ID10295104',
    targetName: 'CV Karya Logam Sejahtera',
    title: 'Indikasi Stiker QRIS Palsu (Quishing)',
    subtitle: 'NMID statis terdeteksi di 3 lokasi berbeda',
    vector: 'QRIS Sticker Swap',
    amountIdr: 34200000,
    displayVal: 'Rp 34.200.000',
    score: 93,
    latencyMs: 24,
    status: 'Ditahan',
    tone: 'bad',
    cluster: '-',
    ruleId: 'QRIS_GEO_CLONE',
    acquirer: 'PT Prima Switch ID (NNS 93600503)',
    holdId: 'HLD-261122-0978',
    strStatus: 'Draf Dossier',
    strTone: 'info',
    slaLeft: '51j 40m',
  },
  {
    code: 'FRD-976',
    time: '13:54:10',
    channel: 'QRIS MPM',
    targetId: 'ID10294990',
    targetName: 'Apotek Sehat Sentosa (Clone)',
    title: 'Replay Payload QRIS Dinamis Kedaluwarsa',
    subtitle: 'RRN duplikat diinjeksi ulang lintas terminal',
    vector: 'Dynamic QR Replay',
    amountIdr: 8400000,
    displayVal: 'Rp 8.400.000',
    score: 89,
    latencyMs: 21,
    status: 'Diblokir',
    tone: 'bad',
    cluster: '-',
    ruleId: 'SNAP_RRN_REPLAY',
  },
  {
    code: 'FRD-974',
    time: '13:49:05',
    channel: 'BI-FAST',
    targetId: 'ID10294420',
    targetName: 'UD Berkah Mandiri Grosir',
    title: 'Fan-Out Cepat ke 6 Rekening Baru',
    subtitle: 'Pecah dana Klaster #14 dalam 95 detik',
    vector: 'Mule Fan-Out 2M',
    amountIdr: 26800000,
    displayVal: 'Rp 26.800.000',
    score: 90,
    latencyMs: 28,
    status: 'Ditahan',
    tone: 'bad',
    cluster: 'KLS-14',
    ruleId: 'MULE_FAN_OUT_2M',
    acquirer: 'Bank Digital Nusantara (NNS 93600422)',
    holdId: 'HLD-261122-0974',
    strStatus: 'Siap Kirim GRIPS',
    strTone: 'warn',
    slaLeft: '46j 18m',
  },
  {
    code: 'FRD-973',
    time: '13:44:27',
    channel: 'QRIS MPM',
    targetId: 'ID10294115',
    targetName: 'Bengkel Motor Jaya Makmur',
    title: 'Pola Nominal Bulat Berulang Rp 5jt',
    subtitle: '5 transaksi identik dari kartu sumber serupa',
    vector: 'Round Amount Loop',
    amountIdr: 25000000,
    displayVal: 'Rp 25.000.000',
    score: 76,
    latencyMs: 25,
    status: 'Tinjau',
    tone: 'warn',
    cluster: '-',
    ruleId: 'ROUND_AMT_REPEAT',
  },
  {
    code: 'FRD-970',
    time: '13:38:19',
    channel: 'BI-FAST',
    targetId: 'VA-99018472',
    targetName: 'Top-Up Dompet Anonim #472',
    title: 'Proxy Exit Node & Perangkat Rooted',
    subtitle: 'Skrip otomatis via Magisk + VPN residensial',
    vector: 'Rooted Proxy Bot',
    amountIdr: 14500000,
    displayVal: 'Rp 14.500.000',
    score: 87,
    latencyMs: 22,
    status: 'Diblokir',
    tone: 'bad',
    cluster: '-',
    ruleId: 'ROOT_PROXY_BLOCK',
  },
  {
    code: 'FRD-969',
    time: '13:31:40',
    channel: 'QRIS MPM',
    targetId: 'ID10293988',
    targetName: 'Boutique Pesona Nusantara',
    title: 'Split Transaksi Tepat di Bawah CTR',
    subtitle: '3 pecahan Rp 5,5jt dalam 6 menit (structuring)',
    vector: 'Smurfing Split',
    amountIdr: 16500000,
    displayVal: 'Rp 16.500.000',
    score: 88,
    latencyMs: 27,
    status: 'Ditahan',
    tone: 'bad',
    cluster: '-',
    ruleId: 'CTR_STRUCTURING',
    acquirer: 'PT Nusantara Pay (NNS 93600811)',
    holdId: 'HLD-261122-0969',
    strStatus: 'Terkirim GRIPS',
    strTone: 'ok',
    slaLeft: 'Selesai',
  },
  {
    code: 'FRD-967',
    time: '13:26:12',
    channel: 'BI-FAST',
    targetId: 'ID10293844',
    targetName: 'Kedai Kopi Senja Kemang',
    title: 'Refund Berantai ke Rekening Berbeda',
    subtitle: 'Pengembalian dana dialihkan ke 4 rekening lain',
    vector: 'Refund Redirect',
    amountIdr: 11400000,
    displayVal: 'Rp 11.400.000',
    score: 74,
    latencyMs: 24,
    status: 'Tinjau',
    tone: 'warn',
    cluster: '-',
    ruleId: 'REFUND_MISMATCH',
  },
  {
    code: 'FRD-966',
    time: '13:21:08',
    channel: 'QRIS MPM',
    targetId: 'USR-7729401',
    targetName: 'Dompet D. Lestari (SBY -> BPN)',
    title: 'Perangkat Baru + Nominal 6x Rata-rata',
    subtitle: 'Login pertama Android baru diikuti QRIS tinggi',
    vector: 'New Device Spike',
    amountIdr: 3800000,
    displayVal: 'Rp 3.800.000',
    score: 68,
    latencyMs: 19,
    status: 'Wajib OTP',
    tone: 'warn',
    cluster: '-',
    ruleId: 'NEW_DEV_HIGH_TX',
  },
  {
    code: 'FRD-963',
    time: '13:14:55',
    channel: 'QRIS CPM',
    targetId: 'ID10293712',
    targetName: 'Kios Pulsa & PPOB Kilat',
    title: 'Anomali Settlement Dini Hari 9x',
    subtitle: 'Lonjakan volume luar jam operasional normal',
    vector: 'Off-Hours Burst',
    amountIdr: 12000000,
    displayVal: 'Rp 12.000.000',
    score: 86,
    latencyMs: 23,
    status: 'Ditahan',
    tone: 'bad',
    cluster: '-',
    ruleId: 'OFF_HOURS_BURST',
    acquirer: 'PT Artajasa Switch (NNS 93600112)',
    holdId: 'HLD-261122-0963',
    strStatus: 'Verifikasi KYC',
    strTone: 'info',
    slaLeft: '62j 05m',
  },
  {
    code: 'FRD-961',
    time: '13:09:30',
    channel: 'QRIS CPM',
    targetId: 'DEV-SBY-2C19',
    targetName: 'Bot Auto-Checkout Surabaya',
    title: 'Kecepatan 18 Tx/Menit dari 1 Perangkat',
    subtitle: 'Interval transaksi seragam 3,2 detik (non-human)',
    vector: 'Bot Velocity 18/m',
    amountIdr: 6100000,
    displayVal: 'Rp 6.100.000',
    score: 85,
    latencyMs: 18,
    status: 'Diblokir',
    tone: 'bad',
    cluster: '-',
    ruleId: 'VELOCITY_BOT_1M',
  },
  {
    code: 'FRD-959',
    time: '13:03:14',
    channel: 'QRIS MPM',
    targetId: 'ID10293401',
    targetName: 'Toko Bahan Bangunan Maju',
    title: 'Penerimaan Lintas 4 Provinsi 10 Menit',
    subtitle: 'QR statis dipindai serentak dari 4 kota besar',
    vector: 'Multi-City Scan',
    amountIdr: 18600000,
    displayVal: 'Rp 18.600.000',
    score: 71,
    latencyMs: 26,
    status: 'Tinjau',
    tone: 'warn',
    cluster: '-',
    ruleId: 'STATIC_QR_SPREAD',
  },
  {
    code: 'FRD-958',
    time: '12:58:02',
    channel: 'BI-FAST',
    targetId: 'USR-6618304',
    targetName: 'Dompet A. Wijaya (BDG -> DPS)',
    title: 'Loncatan Geovelocity 980 km dalam 9m',
    subtitle: 'Perubahan koordinat GPS dan IP seluler ekstrem',
    vector: 'Geo Jump 980km',
    amountIdr: 3000000,
    displayVal: 'Rp 3.000.000',
    score: 65,
    latencyMs: 21,
    status: 'Wajib OTP',
    tone: 'warn',
    cluster: '-',
    ruleId: 'GEO_VELOCITY_JUMP',
  },
];

// Selected trace FRD-992 inline gRPC spans (sum = 26 ms)
const FRD992_SPANS = [
  { label: 'gRPC Ingress & Auth', start: 0, dur: 2, color: '#38bdf8' },
  { label: 'Redis Velocity 5m', start: 2, dur: 5, color: '#0ea5e9' },
  { label: 'Mule Graph 2-Hop', start: 7, dur: 7, color: '#f59e0b' },
  { label: 'Geo & IMEI Check', start: 14, dur: 3, color: '#a855f7' },
  { label: 'ONNX Risk Scorer', start: 17, dur: 6, color: '#f04438' },
  { label: 'Rule Hold T+1 Emit', start: 23, dur: 3, color: '#ef4444' },
];

// Pipeline components health
const PIPELINE_NODES = [
  { name: 'Inline gRPC Scorer (.NET 9)', detail: '6 pod · JKT-DC1/DC2', p99: '28 ms', util: 54, status: 'Optimal', tone: 'ok' },
  { name: 'Redis Feature Store Cluster', detail: 'Hit 99,98% · 14,2 jt kunci', p99: '4,8 ms', util: 48, status: 'Optimal', tone: 'ok' },
  { name: 'Kafka Stream (qris.tx.in)', detail: '24 partisi · Lag 12 ms', p99: '12 ms', util: 61, status: 'Optimal', tone: 'ok' },
  { name: 'Mule Graph Worker (In-Mem)', detail: '2 klaster aktif · 65 node', p99: '7,1 ms', util: 72, status: 'Waspada', tone: 'warn' },
  { name: 'ClickHouse Cold + Replay', detail: '48,6 jt tx (30H) · WORM', p99: '38 ms', util: 41, status: 'Optimal', tone: 'ok' },
];

// MITRE F3 / BI TIKMI Attack Matrix (5 tactics x 3 techniques, total hits = 184)
const ATTACK_MATRIX = [
  {
    tactic: 'Akuisisi & Quishing',
    code: 'TA-01',
    items: [
      { id: 'T101', name: 'Stiker QRIS Palsu Fisik', hits: 14, sev: 'bad', rule: 'QRIS_GEO_CLONE' },
      { id: 'T102', name: 'Replay QR Dinamis', hits: 8, sev: 'bad', rule: 'SNAP_RRN_REPLAY' },
      { id: 'T103', name: 'Scan Lintas Provinsi', hits: 11, sev: 'warn', rule: 'STATIC_QR_SPREAD' },
    ],
  },
  {
    tactic: 'Pendaftaran & Bot',
    code: 'TA-02',
    items: [
      { id: 'T201', name: 'Farm Emulator IMEI', hits: 42, sev: 'bad', rule: 'EMU_IMEI_COLLISION' },
      { id: 'T202', name: 'Perangkat Root + Proxy', hits: 19, sev: 'bad', rule: 'ROOT_PROXY_BLOCK' },
      { id: 'T203', name: 'Velocity Bot >15/mnt', hits: 9, sev: 'warn', rule: 'VELOCITY_BOT_1M' },
    ],
  },
  {
    tactic: 'Pengambilalihan Akun',
    code: 'TA-03',
    items: [
      { id: 'T301', name: 'Impossible Travel GPS', hits: 16, sev: 'warn', rule: 'GEO_VELOCITY_JUMP' },
      { id: 'T302', name: 'Device Baru Tiket 6x', hits: 12, sev: 'warn', rule: 'NEW_DEV_HIGH_TX' },
      { id: 'T303', name: 'Anomali SIM Swap', hits: 3, sev: 'info', rule: 'MSISDN_SWAP_CHK' },
    ],
  },
  {
    tactic: 'Penampungan (Mule)',
    code: 'TA-04',
    items: [
      { id: 'T401', name: 'Klaster Fan-In >12 Akun', hits: 19, sev: 'bad', rule: 'MULE_FAN_IN_5M' },
      { id: 'T402', name: 'Merchant Baru Spike 14x', hits: 8, sev: 'warn', rule: 'MERCHANT_TICKET_SPIKE' },
      { id: 'T403', name: 'Off-Hours Burst Dini Hari', hits: 6, sev: 'bad', rule: 'OFF_HOURS_BURST' },
    ],
  },
  {
    tactic: 'Pencucian & Cashout',
    code: 'TA-05',
    items: [
      { id: 'T501', name: 'Fan-Out BI-FAST <2 mnt', hits: 6, sev: 'bad', rule: 'MULE_FAN_OUT_2M' },
      { id: 'T502', name: 'Split Bawah Ambang CTR', hits: 7, sev: 'bad', rule: 'CTR_STRUCTURING' },
      { id: 'T503', name: 'Refund ke Rekening Lain', hits: 4, sev: 'warn', rule: 'REFUND_MISMATCH' },
    ],
  },
];

// P3 Device Farm & Cluster Forensics (8 rows)
const DEVICE_SIGNATURES = [
  { hash: '8f4a91c0...d21c', model: 'LDPlayer 9 / SM-G973N', subnet: '103.164.52.14/24', wallets: 42, status: 'Diblokir', tone: 'bad' },
  { hash: '2c19e04b...a881', model: 'NoxPlayer / Pixel 4', subnet: '103.164.52.89/24', wallets: 11, status: 'Diblokir', tone: 'bad' },
  { hash: 'c410d92a...771b', model: 'BlueStacks 5 / OnePlus', subnet: '103.164.52.112', wallets: 8, status: 'Diblokir', tone: 'bad' },
  { hash: '9a71c3e2...4f09', model: 'Xiaomi Redmi 9 (Root)', subnet: '182.253.140.22', wallets: 7, status: 'Karantina', tone: 'warn' },
  { hash: '5e04b88d...c112', model: 'Samsung A14 (Cloned)', subnet: '114.122.71.104', wallets: 5, status: 'Pantau', tone: 'warn' },
  { hash: '6f21a03e...b504', model: 'Redmi Note 11 (Parallel)', subnet: '36.73.118.92', wallets: 4, status: 'Pantau', tone: 'warn' },
  { hash: '7b33a91e...990e', model: 'Oppo A54 (QR Swap)', subnet: '36.73.118.45', wallets: 3, status: 'Ditahan', tone: 'bad' },
  { hash: '1d88f64c...e302', model: 'Vivo Y21 (Normal)', subnet: '110.137.42.19', wallets: 1, status: 'Bersih', tone: 'ok' },
];

const CLUSTER_TIMELINE = [
  { t: '14:08:12', tag: 'INGRESS', tone: 'info', msg: 'Merchant baru ID10294811 (umur 3 hari) menerima scan QRIS pertama Rp 4.950.000.' },
  { t: '14:09:04', tag: 'VELOCITY', tone: 'warn', msg: 'Redis counter naik ke 7 pengirim unik dalam 52 detik (rata-rata baseline 0,4/jam).' },
  { t: '14:10:19', tag: 'GRAPH', tone: 'warn', msg: 'Mule Graph Detector mendeteksi 14 pengirim terhubung ke 2 perangkat penguji yang sama.' },
  { t: '14:11:28', tag: 'CRITICAL', tone: 'bad', msg: 'Pengirim ke-19 mencapai total akumulasi Rp 94.500.000; skor risiko ONNX menembus 96/100.' },
  { t: '14:11:51', tag: 'FAN-OUT', tone: 'bad', msg: 'Terdeteksi upaya transfer BI-FAST Rp 26.800.000 (FRD-974) ke 3 rekening penampung baru.' },
  { t: '14:12:09', tag: 'ACTION', tone: 'ok', msg: 'Rule [MULE_FAN_IN_5M] mengeksekusi HOLD_T1_SETTLEMENT dalam 26 ms; dana diamankan.' },
  { t: '14:12:14', tag: 'PPATK', tone: 'info', msg: 'Draf dossier LTKM/STR STR-2026-1122-0992 dibuat otomatis beserta bukti WORM SHA-256.' },
];

// P4 Shadow Mode 30-Day Rules & Confusion Matrix
const RULES_CATALOG = [
  { id: 'MULE_FAN_IN_5M', name: 'Detektor Fan-In Mule 5 Menit (V1)', mode: 'PROD', tone: 'ok', hits30d: 148, savedIdr: 2640000000, fpPct: 0.05, latMs: 4.1, status: 'Aktif' },
  { id: 'MULE_FAN_IN_5M_V2', name: 'Detektor Fan-In + Umur Merchant <=14H', mode: 'SHADOW', tone: 'info', hits30d: 182, savedIdr: 3480000000, fpPct: 0.07, latMs: 5.2, status: 'Siap Canary' },
  { id: 'EMU_IMEI_COLLISION', name: 'Kolisi Hash IMEI & Farm Emulator', mode: 'PROD', tone: 'ok', hits30d: 94, savedIdr: 980000000, fpPct: 0.02, latMs: 2.8, status: 'Aktif' },
  { id: 'QRIS_STICKER_SWAP_V2', name: 'Deteksi Stiker QRIS Palsu (Geo-Cluster)', mode: 'SHADOW', tone: 'info', hits30d: 58, savedIdr: 410000000, fpPct: 0.03, latMs: 3.4, status: 'Uji 30H' },
  { id: 'MERCHANT_TICKET_SPIKE', name: 'Lonjakan Tiket Merchant >10x Baseline', mode: 'PROD', tone: 'ok', hits30d: 66, savedIdr: 1210000000, fpPct: 0.04, latMs: 2.3, status: 'Aktif' },
  { id: 'MULE_FAN_OUT_2M', name: 'Pecah Dana BI-FAST Fan-Out <2 Menit', mode: 'PROD', tone: 'ok', hits30d: 44, savedIdr: 1090000000, fpPct: 0.02, latMs: 3.7, status: 'Aktif' },
  { id: 'GEO_VELOCITY_JUMP', name: 'Loncatan Lokasi >700 km/jam (OTP)', mode: 'PROD', tone: 'ok', hits30d: 39, savedIdr: 490000000, fpPct: 0.03, latMs: 1.9, status: 'Aktif' },
  { id: 'CTR_STRUCTURING', name: 'Smurfing & Pecahan Bawah Ambang CTR', mode: 'PROD', tone: 'ok', hits30d: 21, savedIdr: 430000000, fpPct: 0.02, latMs: 2.5, status: 'Aktif' },
  { id: 'STATIC_QR_SPREAD_V2', name: 'Anomali Scan QR Statis Multi-Kota', mode: 'SHADOW', tone: 'info', hits30d: 34, savedIdr: 170000000, fpPct: 0.01, latMs: 2.1, status: 'Uji 30H' },
  { id: 'GRAPH_2HOP_MULE_V3', name: 'Skor Graf 2-Hop Rekening Penampung', mode: 'CANARY', tone: 'warn', hits30d: 29, savedIdr: 310000000, fpPct: 0.02, latMs: 4.8, status: 'Canary 10%' },
];

const REPLAY_CONFUSION = {
  totalTx: 48620000,
  totalFraudActual: 486,
  prodV1: {
    tp: 412,
    fn: 74,
    fp: 87516,
    fpRate: 0.18,
    recallPct: 84.8,
    savedIdr: 6840000000,
    p99Ms: 28.0,
  },
  shadowV2: {
    tp: 468,
    fn: 18,
    fp: 116688,
    fpRate: 0.24,
    recallPct: 96.3,
    savedIdr: 8260000000,
    p99Ms: 29.8,
  },
};

// P5 BI TIKMI & WORM Audit
const TIKMI_DOMAINS = [
  { code: 'TIKMI-01', name: 'Keamanan Siber & Deteksi Anomali Real-Time', score: 98, ref: 'PBI 23/6/PBI/2021 Ps. 42' },
  { code: 'TIKMI-02', name: 'Manajemen Risiko Fraud QRIS & BI-FAST', score: 97, ref: 'PADG 24/1/2022 · SNAP BI' },
  { code: 'TIKMI-03', name: 'Ketahanan Kinerja & SLA Skoring (<50 ms)', score: 99, ref: 'SLA Inline P99 = 28 ms' },
  { code: 'TIKMI-04', name: 'Integritas Log WORM & Tata Kelola Hold T+1', score: 95, ref: 'Audit Trail SHA-256' },
  { code: 'TIKMI-05', name: 'Kepatuhan Pelaporan LTKM / STR ke PPATK', score: 93, ref: 'Per-PPATK 01/2021 (<3 HK)' },
];

const WORM_LOGS = [
  { ts: '14:12:09.412', actor: 'ENGINE/gRPC', action: 'HOLD_T1_SETTLEMENT · FRD-992 (Rp 94.500.000)', hash: 'e4b9c8...71a0' },
  { ts: '14:12:14.088', actor: 'SYSTEM/PPATK', action: 'GENERATE_STR_DRAFT · STR-2026-1122-0992', hash: '9c2f14...3b82' },
  { ts: '14:09:44.205', actor: 'ENGINE/gRPC', action: 'BLOCK_DEVICE_HASH · 8f4a91c0 (42 akun Makassar)', hash: '71a8d0...f41c' },
  { ts: '13:49:05.774', actor: 'ENGINE/gRPC', action: 'HOLD_T1_SETTLEMENT · FRD-974 (Rp 26.800.000)', hash: '3f6a92...8e15' },
  { ts: '13:33:11.019', actor: 'R.ADITYA/SOC', action: 'SUBMIT_GRIPS_STR · FRD-969 (Ack #GRP-88412)', hash: 'a82e09...c904' },
  { ts: '13:14:55.602', actor: 'ENGINE/gRPC', action: 'HOLD_T1_SETTLEMENT · FRD-963 (Rp 12.000.000)', hash: '5d10ab...44f9' },
];

// ============================================================================
// MATHEMATICAL CONSISTENCY ASSERTION
// ============================================================================
export function verifyMath() {
  const heldAlerts = ALERTS.filter((a) => a.status === 'Ditahan');
  const blockedAlerts = ALERTS.filter((a) => a.status === 'Diblokir');
  const reviewAlerts = ALERTS.filter((a) => a.status === 'Tinjau');
  const otpAlerts = ALERTS.filter((a) => a.status === 'Wajib OTP');

  const sumAmt = (arr) => arr.reduce((acc, x) => acc + x.amountIdr, 0);

  const heldSum = sumAmt(heldAlerts);
  const blockedSum = sumAmt(blockedAlerts);
  const reviewSum = sumAmt(reviewAlerts);
  const otpSum = sumAmt(otpAlerts);
  const grandSum = sumAmt(ALERTS);

  if (heldAlerts.length !== 5 || heldSum !== 184000000) {
    throw new Error(`Held settlement mismatch: count=${heldAlerts.length}, sum=${heldSum} (expected 5 / 184000000)`);
  }
  if (blockedSum !== 50000000) {
    throw new Error(`Blocked sum mismatch: ${blockedSum}`);
  }
  if (reviewSum !== 135000000) {
    throw new Error(`Review sum mismatch: ${reviewSum}`);
  }
  if (otpSum !== 11000000) {
    throw new Error(`OTP sum mismatch: ${otpSum}`);
  }
  if (grandSum !== heldSum + blockedSum + reviewSum + otpSum || grandSum !== 380000000) {
    throw new Error(`Grand alert sum mismatch: ${grandSum}`);
  }

  const chSum = (ch) => sumAmt(ALERTS.filter((a) => a.channel === ch));
  const channelsTotal = chSum('QRIS MPM') + chSum('BI-FAST') + chSum('QRIS CPM') + chSum('E-Wallet');
  if (channelsTotal !== grandSum) {
    throw new Error(`Channel sum mismatch: ${channelsTotal} vs ${grandSum}`);
  }

  const matrixHits = ATTACK_MATRIX.reduce(
    (acc, col) => acc + col.items.reduce((s, t) => s + t.hits, 0),
    0
  );
  if (matrixHits !== 184) {
    throw new Error(`Attack matrix hit sum mismatch: ${matrixHits}`);
  }

  const spanSum = FRD992_SPANS.reduce((acc, s) => acc + s.dur, 0);
  if (spanSum !== ALERTS[0].latencyMs || spanSum >= STREAM_TELEMETRY.slaMs) {
    throw new Error(`FRD-992 span sum mismatch: ${spanSum} vs ${ALERTS[0].latencyMs}`);
  }

  const prodRules = RULES_CATALOG.filter((r) => r.mode === 'PROD');
  const prodHitsSum = prodRules.reduce((acc, r) => acc + r.hits30d, 0);
  const prodSavedSum = prodRules.reduce((acc, r) => acc + r.savedIdr, 0);
  if (prodHitsSum !== REPLAY_CONFUSION.prodV1.tp) {
    throw new Error(`Prod rules TP mismatch: ${prodHitsSum} vs ${REPLAY_CONFUSION.prodV1.tp}`);
  }
  if (prodSavedSum !== REPLAY_CONFUSION.prodV1.savedIdr) {
    throw new Error(`Prod rules saved IDR mismatch: ${prodSavedSum} vs ${REPLAY_CONFUSION.prodV1.savedIdr}`);
  }

  if (
    REPLAY_CONFUSION.prodV1.tp + REPLAY_CONFUSION.prodV1.fn !== REPLAY_CONFUSION.totalFraudActual ||
    REPLAY_CONFUSION.shadowV2.tp + REPLAY_CONFUSION.shadowV2.fn !== REPLAY_CONFUSION.totalFraudActual
  ) {
    throw new Error('Replay confusion matrix actual fraud total mismatch');
  }
  if (REPLAY_CONFUSION.shadowV2.savedIdr - REPLAY_CONFUSION.prodV1.savedIdr !== 1420000000) {
    throw new Error('Shadow delta saved IDR mismatch');
  }

  const tikmiAvg = TIKMI_DOMAINS.reduce((acc, d) => acc + d.score, 0) / TIKMI_DOMAINS.length;
  if (Math.abs(tikmiAvg - 96.4) > 0.001) {
    throw new Error(`BI TIKMI avg mismatch: ${tikmiAvg}`);
  }
}

// ============================================================================
// DARK SOC DESIGN SYSTEM & SHELL (CrowdStrike Falcon / SentinelOne Inspired)
// ============================================================================
const SOC_CSS = `
  .e-badge {
    padding: 1.5px 6px;
    border-radius: 2px;
    font-size: 9.8px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  .e-badge-neutral { background: #182234; color: #cbd5e1; border-color: #2c3c55; }
  .e-badge-accent  { background: #361215; color: #fca5a5; border-color: #7a271a; }
  .e-badge-ok      { background: #07291e; color: #34d399; border-color: #065f46; }
  .e-badge-warn    { background: #2d1d06; color: #fbbf24; border-color: #78350f; }
  .e-badge-bad     { background: #361215; color: #f87171; border-color: #881337; }
  .e-badge-info    { background: #0b253a; color: #38bdf8; border-color: #075985; }
  .e-badge-dark    { background: #0a0f18; color: #94a3b8; border-color: #243247; }

  .e-panel {
    background: #101724;
    border: 1px solid #223047;
    border-radius: 3px;
  }
  .e-panel-head {
    height: 30px;
    padding: 0 10px;
    background: #141d2d;
    border-bottom: 1px solid #223047;
  }
  .e-panel-title {
    font-size: 11px;
    font-weight: 700;
    color: #f1f5f9;
  }
  .e-panel-sub {
    font-size: 9.8px;
    color: #8ea3be;
  }
  .e-panel-body {
    padding: 8px 10px;
  }

  .e-kpi {
    background: #101724;
    border: 1px solid #223047;
    border-radius: 3px;
    padding: 7px 10px;
  }
  .e-kpi.is-crit { border-left: 3px solid #f04438; }
  .e-kpi.is-warn { border-left: 3px solid #f59e0b; }
  .e-kpi.is-ok   { border-left: 3px solid #10b981; }
  .e-kpi.is-info { border-left: 3px solid #38bdf8; }
  .e-kpi-top { color: #8ea3be; font-size: 9.8px; }
  .e-kpi-val { color: #f8fafc; font-size: 16px; }
  .e-kpi-foot { color: #8ea3be; font-size: 9.5px; }

  .e-btn {
    height: 24px;
    padding: 0 9px;
    border-radius: 2px;
    border: 1px solid #2f415e;
    background: #162032;
    color: #e2e8f0;
    font-size: 10.2px;
    font-weight: 600;
  }
  .e-btn-primary {
    background: #b42318;
    border-color: #d92d20;
    color: #ffffff;
  }

  table.e-table {
    font-size: 10.5px;
  }
  table.e-table th {
    background: #131c2b;
    color: #8ea3be;
    font-size: 9.5px;
    padding: 5.5px 6px;
    border-bottom: 1px solid #283852;
  }
  table.e-table td {
    padding: 5px 6px;
    border-bottom: 1px solid #1a2436;
    color: #e2e8f0;
  }
  table.e-table.triage-table td {
    padding: 7.5px 6px;
  }
  table.e-table.rules-table td {
    padding: 6.5px 6px;
  }
  table.e-table.dev-table td {
    padding: 6px 6px;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #0d131f;
  }
  table.e-table tbody tr.is-selected {
    background: #2b1216 !important;
    box-shadow: inset 3px 0 0 #f04438;
  }
  table.e-table tfoot td {
    background: #141d2d;
    border-top: 1px solid #30425f;
    color: #f8fafc;
    padding: 6.5px 6px;
    font-size: 10.3px;
  }

  .soc-topbar {
    height: 38px;
    background: #070b12;
    border-bottom: 1px solid #1e2a3d;
    padding: 0 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .soc-top-grp {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .soc-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #f8fafc;
    font-weight: 800;
    font-size: 12.5px;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .soc-mark {
    width: 22px;
    height: 22px;
    border-radius: 2px;
    background: #b42318;
    border: 1px solid #f04438;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .soc-pill {
    height: 22px;
    padding: 0 7px;
    border-radius: 2px;
    background: #111927;
    border: 1px solid #25344d;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .soc-pill-live { background: #08241b; border-color: #065f46; color: #6ee7b7; }
  .soc-pill-crit { background: #2f1013; border-color: #881337; color: #fca5a5; }
  .soc-search {
    height: 23px;
    width: 280px;
    padding: 0 8px;
    border-radius: 2px;
    background: #101724;
    border: 1px solid #25344d;
    color: #8ea3be;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .soc-kbd {
    font-family: var(--e-mono);
    font-size: 8.8px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #070b12;
    border: 1px solid #30425f;
    color: #94a3b8;
  }
  .soc-body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .soc-rail {
    width: 58px;
    background: #070b12;
    border-right: 1px solid #1e2a3d;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8px 0;
    flex-shrink: 0;
  }
  .soc-rail-nav { display: flex; flex-direction: column; gap: 4px; }
  .soc-rail-item {
    position: relative;
    height: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #7c92b0;
    font-size: 9px;
    font-weight: 600;
    border-left: 3px solid transparent;
  }
  .soc-rail-item.is-active {
    background: #141d2d;
    color: #f8fafc;
    border-left-color: #f04438;
  }
  .soc-rail-cnt {
    position: absolute;
    top: 4px;
    right: 6px;
    padding: 0 4px;
    height: 13px;
    line-height: 13px;
    border-radius: 2px;
    font-family: var(--e-mono);
    font-size: 8.5px;
    font-weight: 700;
    background: #b42318;
    color: #ffffff;
  }
  .soc-rail-foot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #1a2436;
  }
  .soc-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .soc-subbar {
    height: 34px;
    padding: 0 11px;
    background: #0d131f;
    border-bottom: 1px solid #1f2b40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .soc-content {
    flex: 1;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
    background: #0a0e17;
  }
  .soc-footer {
    height: 24px;
    background: #070b12;
    border-top: 1px solid #1e2a3d;
    padding: 0 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: #8ea3be;
    flex-shrink: 0;
  }
  .soc-code {
    background: #070b12;
    border: 1px solid #223047;
    border-radius: 2px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.44;
    color: #cbd5e1;
    white-space: pre;
    overflow: hidden;
  }
  .diff-line { display: block; padding: 0 4px; margin: 0 -4px; }
  .diff-del { background: #2c1115; color: #fca5a5; }
  .diff-add { background: #08281d; color: #6ee7b7; }
  .diff-cmt { color: #7c92b0; }
  .syn-k { color: #38bdf8; }
  .syn-s { color: #a7f3d0; }
  .syn-n { color: #fbbf24; }
  .syn-t { color: #f87171; font-weight: 700; }

  .soc-snippet-bar {
    background: #220e12;
    border: 1px solid #7a271a;
    border-left: 3px solid #f04438;
    border-radius: 2px;
    padding: 5px 8px;
    font-family: var(--e-mono);
    font-size: 9.3px;
    line-height: 1.35;
    color: #fecaca;
    white-space: normal;
    word-break: break-word;
  }
  .soc-bar-track {
    height: 6px;
    background: #1a2436;
    border-radius: 2px;
    overflow: hidden;
    flex: 1;
  }
  .kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 10px;
  }
  .kv-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    border-bottom: 1px solid #1a2436;
    font-size: 10.1px;
  }
  .kv-k { color: #8ea3be; }
  .kv-v { color: #f1f5f9; font-weight: 600; }
`;

function socBadge(label, tone = 'neutral') {
  return `<span class="e-badge e-badge-${tone}">${esc(label)}</span>`;
}

function renderSocShell({ activeSlug, pageTitle, subtitlePill, rightActionsHtml, contentHtml }) {
  const navItems = [
    { slug: 'p1', label: 'Radar', icon: 'activity', cnt: null },
    { slug: 'p2', label: 'Triase', icon: 'alert', cnt: '16' },
    { slug: 'p3', label: 'Graf', icon: 'gitBranch', cnt: '2' },
    { slug: 'p4', label: 'Shadow', icon: 'sliders', cnt: null },
    { slug: 'p5', label: 'PPATK', icon: 'shield', cnt: '5' },
  ];

  const railHtml = navItems
    .map((n) => {
      const act = n.slug === activeSlug;
      return `<div class="soc-rail-item ${act ? 'is-active' : ''}">
        ${ic(n.icon, 16, act ? '#f87171' : '#7c92b0')}
        <span>${esc(n.label)}</span>
        ${n.cnt ? `<span class="soc-rail-cnt">${esc(n.cnt)}</span>` : ''}
      </div>`;
    })
    .join('');

  const bodyHtml = `
    <header class="soc-topbar">
      <div class="soc-top-grp">
        <div class="soc-brand">
          <span class="soc-mark">DQ</span>
          <span>DeteksiQRIS</span>
          <span style="color:#475569;font-weight:400;">|</span>
          <span style="font-size:10.5px;color:#94a3b8;font-weight:600;">Radar Fraud Real-Time</span>
        </div>
        <span class="soc-pill soc-pill-crit">
          <span class="dot dot-bad"></span>
          <span class="mono">TPS: 1.840/d · P99 SCORE: 28ms</span>
        </span>
        <span class="soc-pill">
          ${ic('layers', 11, '#94a3b8')}
          <span>PT Nusantara Pay Switch · PJP Lv.1</span>
        </span>
        <div class="soc-search">
          <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
            ${ic('search', 11, '#64748b')}
            <span class="trunc">Cari FRD-ID, NMID, hash IMEI, RRN SNAP BI...</span>
          </span>
          <span class="soc-kbd">Ctrl+K</span>
        </div>
      </div>
      <div class="soc-top-grp">
        <span class="soc-pill soc-pill-live">
          <span class="dot dot-ok"></span>
          <span class="mono">INLINE gRPC &lt;50ms</span>
        </span>
        <div style="display:flex;align-items:center;gap:6px;padding-left:8px;border-left:1px solid #1e2a3d;">
          <span style="width:22px;height:22px;border-radius:2px;background:#7a271a;border:1px solid #b42318;color:#fecaca;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">RA</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.2px;font-weight:700;color:#f1f5f9;">R. Aditya</div>
            <div style="font-size:8.8px;color:#8ea3be;">Lead Fraud Ops SOC</div>
          </div>
        </div>
      </div>
    </header>
    <div class="soc-body">
      <aside class="soc-rail">
        <div class="soc-rail-nav">${railHtml}</div>
        <div class="soc-rail-foot">
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#34d399;font-size:8.5px;font-family:var(--e-mono);">
            ${ic('lock', 13, '#34d399')}
            <span>WORM</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#38bdf8;font-size:8.5px;font-family:var(--e-mono);">
            <span class="dot dot-ok"></span>
            <span>SNAP</span>
          </div>
        </div>
      </aside>
      <div class="soc-main">
        <div class="soc-subbar">
          <div style="display:flex;align-items:center;gap:7px;min-width:0;">
            <span style="color:#64748b;font-size:10.5px;">SOC Fraud Ops</span>
            ${ic('chevronRight', 11, '#475569')}
            <strong style="color:#f8fafc;font-size:12px;">${esc(pageTitle)}</strong>
            ${subtitlePill ? `<span style="margin-left:4px;">${subtitlePill}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            ${rightActionsHtml}
          </div>
        </div>
        <main class="soc-content">${contentHtml}</main>
      </div>
    </div>
    <footer class="soc-footer">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="display:inline-flex;align-items:center;gap:5px;"><span class="dot dot-ok"></span> .NET 9 gRPC: 28ms P99 (SLA 50ms)</span>
        <span>Kafka qris.tx.in: lag 12ms</span>
        <span>Redis Features: 99,98% hit</span>
        <span>ClickHouse: 48,6 jt tx (30H)</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span>Standar: BI TIKMI · PPATK STR · SNAP BI v2.1</span>
        <span style="color:#cbd5e1;">WORM SHA-256: e4b9c8...71a0</span>
        <span style="color:#f8fafc;">22 Nov 2026 14:15:08 WIB</span>
      </div>
    </footer>
  `;

  return wrapEnterpriseHtml({
    title: `DeteksiQRIS — ${pageTitle}`,
    accent: '#b42318',
    accentSoft: '#361215',
    accentInk: '#fca5a5',
    bg: '#0a0e17',
    surface: '#101724',
    surface2: '#141d2d',
    border: '#223047',
    borderStrong: '#30425f',
    text: '#f1f5f9',
    text2: '#cbd5e1',
    muted: '#8ea3be',
    extraCss: SOC_CSS,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1 — KOMANDO RADAR FRAUD REAL-TIME (SOC EXECUTIVE & MITRE MATRIX)
// ============================================================================
function renderPage1() {
  const heldAlerts = ALERTS.filter((a) => a.status === 'Ditahan');
  const heldSum = heldAlerts.reduce((acc, a) => acc + a.amountIdr, 0);
  const blockedCount = ALERTS.filter((a) => a.status === 'Diblokir').length;
  const totalMatrixHits = ATTACK_MATRIX.reduce(
    (acc, col) => acc + col.items.reduce((s, t) => s + t.hits, 0),
    0
  );

  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Skor P99 Inline gRPC</span>${socBadge('SLA <50ms', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#34d399;">28 ms</span>
          ${svgSparkline({ points: [24, 25, 27, 26, 29, 27, 28, 26, 28], color: '#34d399', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>P50: 11 ms · P95: 22 ms</span><span class="mono">0 timeout</span></div>
      </div>
      <div class="e-kpi is-crit">
        <div class="e-kpi-top"><span>Klaster Sindikat Aktif</span>${socBadge('KRITIS', 'bad')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#f87171;">2 sindikat</span>
          ${svgSparkline({ points: [0, 0, 1, 1, 1, 1, 2, 2, 2], color: '#f04438', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>Mule #14 (19) · Farm #09 (42)</span><span class="mono">61 akun</span></div>
      </div>
      <div class="e-kpi is-warn">
        <div class="e-kpi-top"><span>Dana Ditahan (Hold T+1)</span>${socBadge('5 MID', 'warn')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fbbf24;">Rp 184 jt</span>
          ${svgSparkline({ points: [12, 28, 45, 62, 89, 89, 157, 184, 184], color: '#f59e0b', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>Exact: ${fmtIdr(heldSum)}</span><span class="mono">100% aman</span></div>
      </div>
      <div class="e-kpi is-info">
        <div class="e-kpi-top"><span>Arus Transaksi (TPS)</span>${socBadge('BI-FAST+QRIS', 'info')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">1.840 /d</span>
          ${svgSparkline({ points: [1320, 1480, 1610, 1540, 1790, 1920, 1880, 1810, 1840], color: '#38bdf8', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>QRIS 72% · BI-FAST 28%</span><span class="mono">Puncak 1.920</span></div>
      </div>
      <div class="e-kpi is-crit">
        <div class="e-kpi-top"><span>Insiden Terbuka (24J)</span>${socBadge('TRIASE', 'bad')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">16 kasus</span>
          ${svgSparkline({ points: [4, 6, 8, 9, 11, 13, 14, 15, 16], color: '#f87171', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>5 Tahan · ${blockedCount} Blokir · 4 Tinjau</span><span class="mono">3 OTP</span></div>
      </div>
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Presisi &amp; Kepatuhan</span>${socBadge('BI TIKMI', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">99,4%</span>
          ${svgSparkline({ points: [99.1, 99.2, 99.3, 99.3, 99.4, 99.4, 99.5, 99.4, 99.4], color: '#10b981', width: 68, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>False Positive: 0,18%</span><span class="mono">Skor 96,4</span></div>
      </div>
    </div>
  `;

  const chartSvg = svgMultiLineChart({
    width: 900,
    height: 248,
    dark: true,
    xLabels: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '13:30', '14:00', '14:15'],
    yMin: 0,
    yMax: 100,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)}`,
    threshold: { value: 50, label: 'SLA gRPC 50ms', color: '#f04438' },
    series: [
      { label: 'Skor Risiko Maks (0-100)', color: '#f04438', values: [42, 46, 51, 58, 54, 63, 72, 86, 88, 91, 96], area: true, dots: true, width: 2.1 },
      { label: 'Latensi P99 (ms)', color: '#38bdf8', values: [19, 21, 23, 24, 22, 25, 26, 27, 26, 29, 28], dots: true, width: 1.9 },
      { label: 'Latensi P50 (ms)', color: '#34d399', values: [9, 10, 10, 11, 10, 11, 11, 12, 11, 12, 11], dashed: true, width: 1.5 },
    ],
    annotations: [
      { index: 8, seriesIdx: 0, label: 'FRD-989 Emulator (91)', color: '#f59e0b', dy: -26 },
      { index: 10, seriesIdx: 0, label: 'FRD-992 Mule #14 (96)', color: '#f04438', dy: 14 },
    ],
  });

  const matrixCols = ATTACK_MATRIX.map((col) => {
    const tiles = col.items
      .map((t) => {
        const bg = t.sev === 'bad' ? '#281115' : t.sev === 'warn' ? '#241a0a' : '#0d2030';
        const bd = t.sev === 'bad' ? '#7a271a' : t.sev === 'warn' ? '#78350f' : '#075985';
        const clr = t.sev === 'bad' ? '#f87171' : t.sev === 'warn' ? '#fbbf24' : '#38bdf8';
        return `<div style="background:${bg};border:1px solid ${bd};border-radius:2px;padding:6px 7px;display:flex;flex-direction:column;gap:3px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
            <span class="mono" style="font-size:9px;color:${clr};font-weight:700;">${esc(t.id)}</span>
            <span class="mono" style="font-size:9.2px;font-weight:700;color:#f8fafc;background:#0a0e17;padding:0.5px 4px;border-radius:2px;border:1px solid ${bd};">${t.hits} hit</span>
          </div>
          <div style="font-size:10.1px;font-weight:700;color:#f1f5f9;line-height:1.25;">${esc(t.name)}</div>
          <div class="mono trunc" style="font-size:8.6px;color:#8ea3be;">${esc(t.rule)}</div>
        </div>`;
      })
      .join('');
    return `<div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
      <div style="padding:4px 6px;background:#141d2d;border:1px solid #25344d;border-radius:2px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:9.8px;font-weight:700;color:#e2e8f0;" class="trunc">${esc(col.tactic)}</span>
        <span class="mono" style="font-size:8.8px;color:#8ea3be;">${esc(col.code)}</span>
      </div>
      ${tiles}
    </div>`;
  }).join('');

  // Top 7 priority incidents so the right panel fills with zero dead space
  const priorityCards = ALERTS.slice(0, 7)
    .map((a) => {
      const barClr = a.tone === 'bad' ? '#f04438' : '#f59e0b';
      return `<div style="padding:5.5px 8px;background:${a.selected ? '#221014' : '#0d131f'};border:1px solid ${a.selected ? '#881337' : '#1f2b40'};border-left:3px solid ${barClr};border-radius:2px;display:flex;flex-direction:column;gap:2.5px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div style="display:flex;align-items:center;gap:6px;min-width:0;">
            <span class="mono" style="font-size:10px;font-weight:800;color:${barClr};">${esc(a.code)}</span>
            <span style="font-size:10.4px;font-weight:700;color:#f8fafc;" class="trunc">${esc(a.title)}</span>
          </div>
          ${socBadge(a.status, a.tone)}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:9.6px;">
          <span style="color:#94a3b8;" class="trunc">${esc(a.subtitle)}</span>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            <span class="mono" style="color:#f1f5f9;font-weight:700;">${esc(a.displayVal)}</span>
            <span class="mono" style="color:${barClr};font-weight:700;">Skor ${a.score}</span>
          </div>
        </div>
      </div>`;
    })
    .join('');

  const pipeRows = PIPELINE_NODES.map((p) => {
    const clr = p.tone === 'ok' ? '#10b981' : '#f59e0b';
    return `<div style="display:flex;flex-direction:column;gap:2.5px;padding:5px 0;border-bottom:1px solid #1a2436;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span style="font-size:10.3px;font-weight:700;color:#e2e8f0;display:inline-flex;align-items:center;gap:6px;">
          <span class="dot dot-${p.tone}"></span>${esc(p.name)}
        </span>
        <span class="mono" style="font-size:10px;color:${clr};font-weight:700;">${esc(p.p99)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:9.3px;color:#8ea3be;width:185px;" class="trunc">${esc(p.detail)}</span>
        <div class="soc-bar-track"><div style="width:${p.util}%;height:100%;background:${clr};"></div></div>
        <span class="mono" style="font-size:9.3px;color:#cbd5e1;width:30px;text-align:right;">${p.util}%</span>
      </div>
    </div>`;
  }).join('');

  const contentHtml = `
    ${kpiStrip}
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1.06;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#f87171')} <span>Telemetri Skoring Inline gRPC (&lt;50ms) &amp; Eskalasi Risiko</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${socBadge('06:00 - 14:15 WIB', 'neutral')}
              ${socBadge('SLA P99: 28ms / 50ms', 'ok')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>${chartSvg}</div>
            <div class="soc-snippet-bar">Rule Trigger [MULE_FAN_IN_5M]: dest_mid=ID10294811 senders=19 sum_idr=94500000 -&gt; ACTION=HOLD_T1_SETTLEMENT</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
              <div style="background:#0d131f;border:1px solid #1e2a3d;border-radius:2px;padding:5px 8px;">
                <div style="font-size:9px;color:#8ea3be;">Keputusan Otomatis</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#f8fafc;">99,82% <span style="color:#34d399;font-size:9.5px;">inline</span></div>
              </div>
              <div style="background:#0d131f;border:1px solid #1e2a3d;border-radius:2px;padding:5px 8px;">
                <div style="font-size:9px;color:#8ea3be;">Nilai Dicegah (Blok+Tahan)</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#fbbf24;">Rp 234.000.000</div>
              </div>
              <div style="background:#0d131f;border:1px solid #1e2a3d;border-radius:2px;padding:5px 8px;">
                <div style="font-size:9px;color:#8ea3be;">Kanal Paling Diserang</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#f87171;">QRIS MPM <span style="color:#8ea3be;font-size:9.5px;">(${ALERTS.filter((a) => a.channel === 'QRIS MPM').length} kasus)</span></div>
              </div>
              <div style="background:#0d131f;border:1px solid #1e2a3d;border-radius:2px;padding:5px 8px;">
                <div style="font-size:9px;color:#8ea3be;">Status Switch BI-FAST</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#34d399;">200 OK <span style="color:#8ea3be;font-size:9.5px;">(9 ms)</span></div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.94;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#f59e0b')} <span>Matriks Teknik Serangan Pembayaran (MITRE F3 · Taksonomi BI TIKMI)</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${socBadge('5 Taktik · 15 Detektor Aktif', 'neutral')}
              ${socBadge(`${totalMatrixHits} Hit / 24J`, 'bad')}
            </div>
          </div>
          <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px;align-content:start;">
            ${matrixCols}
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1.18;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#f04438')} <span>Antrean Insiden Prioritas &amp; Karantina Cepat</span></div>
            <span class="e-panel-sub">Urut skor tertinggi · 7 dari 16 kasus</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
            <div style="display:flex;flex-direction:column;gap:5px;">${priorityCards}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:#0d131f;border:1px solid #223047;border-radius:2px;padding:5px 8px;font-size:9.6px;">
              <span style="color:#94a3b8;">9 kasus lain (Skor 65-88) siap ditinjau di Meja Triase</span>
              <span class="mono" style="color:#38bdf8;font-weight:700;">Total Rp 380 jt -&gt;</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.82;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('cpu', 13, '#38bdf8')} <span>Kesehatan Pipeline Skoring Sub-50ms</span></div>
            ${socBadge('5/5 Node Sehat', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div>${pipeRows}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:#0d131f;border:1px solid #223047;border-radius:2px;padding:6px 8px;margin-top:4px;">
              <span style="font-size:9.8px;color:#cbd5e1;">Auto-Hold Settlement T+1 (Skor &gt;= 85)</span>
              ${socBadge('AKTIF · ENFORCED', 'ok')}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderSocShell({
    activeSlug: 'p1',
    pageTitle: 'Komando Radar Fraud Real-Time',
    subtitlePill: socBadge('2 SINDIKAT AKTIF · Rp 184 JT DITAHAN', 'bad'),
    rightActionsHtml: `
      <span class="e-btn">${ic('download', 11, '#cbd5e1')} Ekspor STR PPATK</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Tahan Settlement</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2 — MEJA TRIASE INSIDEN & INSPEKTOR PAYLOAD gRPC (16 ROWS + INSPECTOR)
// ============================================================================
function renderPage2() {
  const heldAlerts = ALERTS.filter((a) => a.status === 'Ditahan');
  const blockedAlerts = ALERTS.filter((a) => a.status === 'Diblokir');
  const reviewAlerts = ALERTS.filter((a) => a.status === 'Tinjau');
  const otpAlerts = ALERTS.filter((a) => a.status === 'Wajib OTP');
  const sumAmt = (arr) => arr.reduce((acc, a) => acc + a.amountIdr, 0);
  const grandTotal = sumAmt(ALERTS);
  const avgLat = (ALERTS.reduce((acc, a) => acc + a.latencyMs, 0) / ALERTS.length).toFixed(1).replace('.', ',');

  const chCount = (ch) => ALERTS.filter((a) => a.channel === ch).length;
  const chJt = (ch) =>
    (ALERTS.filter((a) => a.channel === ch).reduce((acc, a) => acc + a.amountIdr, 0) / 1000000)
      .toFixed(1)
      .replace('.', ',');

  const filterBar = `
    <div style="height:36px;background:#101724;border:1px solid #223047;border-radius:3px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:10px;font-weight:700;color:#8ea3be;display:inline-flex;align-items:center;gap:4px;">${ic('filter', 11, '#8ea3be')} Filter Aktif:</span>
        ${socBadge(`Semua Kanal (${ALERTS.length})`, 'accent')}
        ${socBadge(`QRIS MPM (${chCount('QRIS MPM')})`, 'neutral')}
        ${socBadge(`BI-FAST (${chCount('BI-FAST')})`, 'neutral')}
        ${socBadge(`QRIS CPM (${chCount('QRIS CPM')})`, 'neutral')}
        ${socBadge(`E-Wallet (${chCount('E-Wallet')})`, 'neutral')}
        ${socBadge('Skor >= 65', 'info')}
      </div>
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="mono" style="font-size:10px;color:#8ea3be;">Terpilih: <strong style="color:#f87171;">FRD-992</strong> (Skor 96)</span>
        <span class="e-btn">${ic('refresh', 11, '#cbd5e1')} Muat Ulang</span>
        <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Tahan Settlement Massal (5)</span>
      </div>
    </div>
  `;

  const rowsHtml = ALERTS.map((a) => {
    const cls = a.selected ? 'is-selected' : '';
    const scoreClr = a.score >= 85 ? '#f87171' : a.score >= 70 ? '#fbbf24' : '#38bdf8';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;color:${a.selected ? '#fca5a5' : '#f1f5f9'};">${esc(a.code)}</td>
      <td class="mono" style="color:#8ea3be;">${esc(a.time)}</td>
      <td>${socBadge(a.channel, a.channel === 'BI-FAST' ? 'info' : 'neutral')}</td>
      <td><div style="font-weight:600;color:#f1f5f9;" class="trunc">${esc(a.targetName)}</div></td>
      <td style="color:#cbd5e1;" class="trunc">${esc(a.vector)}</td>
      <td class="num mono" style="font-weight:700;color:#f8fafc;">${fmtIdr(a.amountIdr)}</td>
      <td class="num mono" style="font-weight:800;color:${scoreClr};">${a.score}</td>
      <td class="num mono" style="color:#34d399;">${a.latencyMs} ms</td>
      <td>${socBadge(a.status, a.tone)}</td>
    </tr>`;
  }).join('');

  const waterfallSvg = svgSpanWaterfall({
    spans: FRD992_SPANS,
    totalMs: 50,
    width: 550,
    dark: true,
  });

  // Syntax-colored JSON payload (richer & fills the inspector cleanly)
  const payloadHtml = `{
  <span class="syn-k">"protocol"</span>: <span class="syn-s">"SNAP_BI_QRIS_MPM_V2.1"</span>,
  <span class="syn-k">"case_id"</span>: <span class="syn-s">"FRD-992"</span>,
  <span class="syn-k">"rule_hit"</span>: <span class="syn-t">"MULE_FAN_IN_5M"</span>,
  <span class="syn-k">"dest_nmid"</span>: <span class="syn-s">"ID10294811"</span>,
  <span class="syn-k">"merchant_age_days"</span>: <span class="syn-n">3</span>,
  <span class="syn-k">"window_5m_senders"</span>: <span class="syn-n">19</span>,
  <span class="syn-k">"window_5m_sum_idr"</span>: <span class="syn-n">94500000</span>,
  <span class="syn-k">"redis_velocity_1m"</span>: <span class="syn-n">6</span>,
  <span class="syn-k">"acquirer_nns"</span>: <span class="syn-s">"93600811"</span>,
  <span class="syn-k">"rrn"</span>: <span class="syn-s">"2611221412098841"</span>,
  <span class="syn-k">"device_cluster_overlap"</span>: <span class="syn-n">0.84</span>,
  <span class="syn-k">"geo_centroid_spread_km"</span>: <span class="syn-n">1.4</span>,
  <span class="syn-k">"kyc_risk_tier"</span>: <span class="syn-s">"NEW_MERCHANT_HIGH"</span>,
  <span class="syn-k">"onnx_risk_score"</span>: <span class="syn-n">96.2</span>,
  <span class="syn-k">"decision"</span>: <span class="syn-t">"HOLD_T1_SETTLEMENT"</span>,
  <span class="syn-k">"ppatk_str_flag"</span>: <span class="syn-s">"RF-04_SMURFING_MULE"</span>,
  <span class="syn-k">"worm_sha256"</span>: <span class="syn-s">"e4b9c8a210f4...71a0"</span>
}`;

  const contentHtml = `
    ${filterBar}
    <div style="display:grid;grid-template-columns:1.52fr 1fr;gap:9px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#f87171')} <span>Antrean Triase Transaksi Berisiko Tinggi (16 Kasus Aktif · Live Stream)</span></div>
            <span class="e-panel-sub">Klik baris untuk inspeksi payload gRPC &amp; waterfall &lt;50ms</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table triage-table">
              <colgroup>
                <col style="width:72px;" />
                <col style="width:66px;" />
                <col style="width:78px;" />
                <col style="width:205px;" />
                <col style="width:130px;" />
                <col style="width:112px;" />
                <col style="width:46px;" />
                <col style="width:54px;" />
                <col style="width:82px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>WIB</th>
                  <th>Kanal</th>
                  <th>Merchant / Target Entitas</th>
                  <th>Vektor Anomali</th>
                  <th class="num">Nominal (Rp)</th>
                  <th class="num">Skor</th>
                  <th class="num">Latensi</th>
                  <th>Keputusan</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="5">Total 16 Kasus Terdeteksi (5 Ditahan · 4 Diblokir · 4 Tinjau · 3 Wajib OTP)</td>
                  <td class="num mono" style="color:#fbbf24;">${fmtIdr(grandTotal)}</td>
                  <td class="num mono">82,8</td>
                  <td class="num mono" style="color:#34d399;">${avgLat} ms</td>
                  <td>${socBadge('SLA OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#0d131f;border-top:1px solid #223047;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#94a3b8;">
              <span>Distribusi Kanal: <strong style="color:#f1f5f9;">QRIS MPM (Rp ${chJt('QRIS MPM')} jt)</strong> · BI-FAST (Rp ${chJt('BI-FAST')} jt) · E-Wallet (Rp ${chJt('E-Wallet')} jt) · QRIS CPM (Rp ${chJt('QRIS CPM')} jt)</span>
              <span class="mono" style="color:#34d399;">0 paket melewati batas 50ms</span>
            </div>
          </div>
        </section>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
          <div class="e-kpi is-crit">
            <div class="e-kpi-top"><span>Ditahan (Hold T+1)</span><span class="mono">5 kasus</span></div>
            <div class="e-kpi-val" style="font-size:14px;color:#f87171;">${fmtIdr(sumAmt(heldAlerts))}</div>
            <div class="e-kpi-foot"><span>Settlement dibekukan</span><span class="mono">48,4%</span></div>
          </div>
          <div class="e-kpi is-crit">
            <div class="e-kpi-top"><span>Diblokir (Pre-Auth)</span><span class="mono">4 kasus</span></div>
            <div class="e-kpi-val" style="font-size:14px;color:#fca5a5;">${fmtIdr(sumAmt(blockedAlerts))}</div>
            <div class="e-kpi-foot"><span>42 akun emulator ikut blok</span><span class="mono">13,2%</span></div>
          </div>
          <div class="e-kpi is-warn">
            <div class="e-kpi-top"><span>Dalam Tinjauan SOC</span><span class="mono">4 kasus</span></div>
            <div class="e-kpi-val" style="font-size:14px;color:#fbbf24;">${fmtIdr(sumAmt(reviewAlerts))}</div>
            <div class="e-kpi-foot"><span>Butuh verifikasi merchant</span><span class="mono">35,5%</span></div>
          </div>
          <div class="e-kpi is-info">
            <div class="e-kpi-top"><span>Tantangan Wajib OTP</span><span class="mono">3 kasus</span></div>
            <div class="e-kpi-val" style="font-size:14px;color:#38bdf8;">${fmtIdr(sumAmt(otpAlerts))}</div>
            <div class="e-kpi-foot"><span>Step-up biometrik/OTP</span><span class="mono">2,9%</span></div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0 0 278px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('zap', 13, '#f04438')} <span>Inspektor FRD-992 · Waterfall Latensi gRPC</span></div>
            ${socBadge('26 ms / 50 ms SLA', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;background:#1a1014;border:1px solid #7a271a;border-radius:2px;padding:6px 8px;">
              <div>
                <div style="font-size:11px;font-weight:700;color:#f8fafc;">Klaster Fan-In Mule #14 · ID10294811</div>
                <div style="font-size:9.6px;color:#fca5a5;">Toko Elektronik Cahaya Abadi · 19 pengirim dalam 4 menit</div>
              </div>
              <div style="text-align:right;">
                <div class="mono" style="font-size:12.5px;font-weight:800;color:#f87171;">Skor 96</div>
                <div class="mono" style="font-size:9.5px;color:#fbbf24;">Rp 94.500.000</div>
              </div>
            </div>
            <div>${waterfallSvg}</div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#38bdf8')} <span>Rule Trigger &amp; Payload SNAP BI / ISO-20022</span></div>
            ${socBadge('JSON · WORM Signed', 'neutral')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
            <div class="soc-snippet-bar">Rule Trigger [MULE_FAN_IN_5M]: dest_mid=ID10294811 senders=19 sum_idr=94500000 -&gt; ACTION=HOLD_T1_SETTLEMENT</div>
            <div class="soc-code" style="flex:1;">${payloadHtml}</div>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 124px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#fbbf24')} <span>Kontrol Karantina &amp; Eskalasi Kasus</span></div>
            ${socBadge('Hold ID: HLD-261122-0992', 'bad')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div class="kv-grid">
              <div class="kv-row"><span class="kv-k">Status Settlement</span><span class="kv-v" style="color:#f87171;">HOLD_T1_SETTLEMENT</span></div>
              <div class="kv-row"><span class="kv-k">Dossier PPATK</span><span class="kv-v mono">STR-2026-1122-0992</span></div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('lock', 11, '#fff')} Bekukan NMID Permanen</span>
              <span class="e-btn" style="flex:1;justify-content:center;">${ic('fileText', 11, '#38bdf8')} Buka Dossier STR</span>
              <span class="e-btn">${ic('gitBranch', 11, '#fbbf24')} Graf #14</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderSocShell({
    activeSlug: 'p2',
    pageTitle: 'Meja Triase Insiden & Inspektor Payload gRPC',
    subtitlePill: socBadge('16 KASUS · TOTAL Rp 380.000.000', 'warn'),
    rightActionsHtml: `
      <span class="e-btn">${ic('download', 11, '#cbd5e1')} Ekspor CSV Forensik</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Tahan Settlement</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3 — ANALISIS GRAF JARINGAN MULE & FORENSIK FARM EMULATOR
// ============================================================================
function renderPage3() {
  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi is-crit">
        <div class="e-kpi-top"><span>Klaster Sindikat Aktif</span>${socBadge('2 KLASTER', 'bad')}</div>
        <div class="e-kpi-val" style="color:#f87171;">Klaster #14 &amp; #09</div>
        <div class="e-kpi-foot"><span>Fan-In Mule + Farm Emulator</span><span class="mono">65 entitas graf</span></div>
      </div>
      <div class="e-kpi is-warn">
        <div class="e-kpi-top"><span>Total Arus Klaster Mule #14</span>${socBadge('HOLD T+1', 'warn')}</div>
        <div class="e-kpi-val" style="color:#fbbf24;">Rp 121.300.000</div>
        <div class="e-kpi-foot"><span>FRD-992 (94,5jt) + FRD-974 (26,8jt)</span><span class="mono">100% tercegat</span></div>
      </div>
      <div class="e-kpi is-crit">
        <div class="e-kpi-top"><span>Farm Emulator Makassar (#09)</span>${socBadge('DIBLOKIR', 'bad')}</div>
        <div class="e-kpi-val" style="color:#fca5a5;">42 dompet / 1 IMEI</div>
        <div class="e-kpi-foot"><span>Hash 8f4a91c0...d21c · LDPlayer</span><span class="mono">Rp 21.000.000</span></div>
      </div>
      <div class="e-kpi is-info">
        <div class="e-kpi-top"><span>Latensi Traversal Graf 2-Hop</span>${socBadge('IN-MEMORY', 'ok')}</div>
        <div class="e-kpi-val" style="color:#34d399;">7,1 ms</div>
        <div class="e-kpi-foot"><span>Redis Graph + .NET 9 Worker</span><span class="mono">Batas 15 ms</span></div>
      </div>
    </div>
  `;

  // Expanded Tactical Network Graph (900 x 615) — cleaner circles & wider sender cards
  const graphSvg = `
  <svg viewBox="0 0 900 615" width="100%" height="615" style="display:block;background:#070b12;border-radius:2px;">
    <defs>
      <pattern id="socGrid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#121b2b" stroke-width="1"/>
      </pattern>
      <marker id="arrRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f04438"/>
      </marker>
      <marker id="arrAmber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
      </marker>
      <marker id="arrCyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
      </marker>
    </defs>
    <rect width="900" height="615" fill="url(#socGrid)" />

    <!-- Cluster #14 Bounding Zone -->
    <rect x="14" y="14" width="872" height="378" rx="4" fill="#120b0f" fill-opacity="0.72" stroke="#7a271a" stroke-width="1.2" stroke-dasharray="5,4"/>
    <rect x="26" y="23" width="330" height="21" rx="2" fill="#361215" stroke="#b42318" stroke-width="1"/>
    <text x="34" y="37" fill="#fca5a5" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace">KLASTER #14 · MULE FAN-IN / FAN-OUT (FRD-992 &amp; FRD-974)</text>
    <rect x="706" y="23" width="168" height="21" rx="2" fill="#2d1d06" stroke="#b45309" stroke-width="1"/>
    <text x="714" y="37" fill="#fbbf24" font-size="10" font-weight="700" font-family="ui-monospace,Consolas,monospace">ACTION: HOLD_T1_SETTLEMENT</text>

    <!-- Fan-In Edges (Senders -> Merchant ID10294811) -->
    <line x1="184" y1="86" x2="386" y2="194" stroke="#f04438" stroke-width="1.6" marker-end="url(#arrRed)"/>
    <line x1="184" y1="140" x2="386" y2="200" stroke="#f04438" stroke-width="1.6" marker-end="url(#arrRed)"/>
    <line x1="184" y1="194" x2="382" y2="206" stroke="#f04438" stroke-width="2.2" marker-end="url(#arrRed)"/>
    <line x1="184" y1="248" x2="386" y2="214" stroke="#f04438" stroke-width="1.6" marker-end="url(#arrRed)"/>
    <line x1="184" y1="302" x2="388" y2="222" stroke="#f04438" stroke-width="1.6" marker-end="url(#arrRed)"/>
    <line x1="184" y1="354" x2="396" y2="232" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrAmber)"/>

    <!-- Edge Label Fan-In -->
    <rect x="220" y="191" width="144" height="23" rx="2" fill="#0a0e17" stroke="#b42318" stroke-width="1"/>
    <text x="292" y="206" text-anchor="middle" fill="#fecaca" font-size="9.6" font-weight="700" font-family="ui-monospace,Consolas,monospace">19 tx / 4m · Rp 94,5 jt</text>

    <!-- Sender Nodes (Left, wider 158px) -->
    <g font-family="system-ui,Segoe UI,sans-serif">
      <rect x="26" y="68" width="158" height="36" rx="3" fill="#131c2b" stroke="#30425f"/>
      <text x="36" y="83" fill="#f1f5f9" font-size="9.9" font-weight="700">USR-44102 · Dompet A</text>
      <text x="36" y="96" fill="#f87171" font-size="8.9" font-family="ui-monospace,Consolas,monospace">QRIS Rp 4.950.000 · 14:08</text>

      <rect x="26" y="122" width="158" height="36" rx="3" fill="#131c2b" stroke="#30425f"/>
      <text x="36" y="137" fill="#f1f5f9" font-size="9.9" font-weight="700">USR-44119 · Dompet B</text>
      <text x="36" y="150" fill="#f87171" font-size="8.9" font-family="ui-monospace,Consolas,monospace">QRIS Rp 5.000.000 · 14:09</text>

      <rect x="26" y="176" width="158" height="36" rx="3" fill="#131c2b" stroke="#30425f"/>
      <text x="36" y="191" fill="#f1f5f9" font-size="9.9" font-weight="700">USR-44184 · Dompet C</text>
      <text x="36" y="204" fill="#f87171" font-size="8.9" font-family="ui-monospace,Consolas,monospace">QRIS Rp 5.000.000 · 14:10</text>

      <rect x="26" y="230" width="158" height="36" rx="3" fill="#131c2b" stroke="#30425f"/>
      <text x="36" y="245" fill="#f1f5f9" font-size="9.9" font-weight="700">USR-44207 · Dompet D</text>
      <text x="36" y="258" fill="#f87171" font-size="8.9" font-family="ui-monospace,Consolas,monospace">QRIS Rp 4.900.000 · 14:10</text>

      <rect x="26" y="284" width="158" height="36" rx="3" fill="#131c2b" stroke="#30425f"/>
      <text x="36" y="299" fill="#f1f5f9" font-size="9.9" font-weight="700">USR-44251 · Dompet E</text>
      <text x="36" y="312" fill="#f87171" font-size="8.9" font-family="ui-monospace,Consolas,monospace">QRIS Rp 5.000.000 · 14:11</text>

      <rect x="26" y="336" width="158" height="36" rx="3" fill="#2d1d06" stroke="#b45309"/>
      <text x="105" y="352" text-anchor="middle" fill="#fbbf24" font-size="9.6" font-weight="700">+14 Pengirim Satelit</text>
      <text x="105" y="365" text-anchor="middle" fill="#fde68a" font-size="8.8" font-family="ui-monospace,Consolas,monospace">Akumulasi Rp 69.650.000</text>
    </g>

    <!-- Central Hub Node: Merchant ID10294811 (Larger crisp rings) -->
    <circle cx="452" cy="208" r="64" fill="#361215" stroke="#f04438" stroke-width="2.4"/>
    <circle cx="452" cy="208" r="55" fill="#1d0b0e" stroke="#b42318" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="452" y="186" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace">HUB MERCHANT</text>
    <text x="452" y="203" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800" font-family="ui-monospace,Consolas,monospace">ID10294811</text>
    <text x="452" y="219" text-anchor="middle" fill="#fbbf24" font-size="9.8" font-weight="700" font-family="ui-monospace,Consolas,monospace">Rp 94.500.000</text>
    <text x="452" y="234" text-anchor="middle" fill="#f87171" font-size="8.4" font-weight="700">UMUR 3H · SKOR 96</text>

    <!-- Fan-Out Edges (Merchant -> 3 Mule Cashout Accounts, Intercepted) -->
    <line x1="516" y1="186" x2="672" y2="114" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arrAmber)"/>
    <line x1="517" y1="208" x2="672" y2="208" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arrAmber)"/>
    <line x1="516" y1="230" x2="672" y2="302" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arrAmber)"/>

    <!-- Interception Shield Marker -->
    <rect x="546" y="193" width="110" height="30" rx="2" fill="#07291e" stroke="#10b981" stroke-width="1.3"/>
    <text x="601" y="206" text-anchor="middle" fill="#34d399" font-size="9" font-weight="800" font-family="ui-monospace,Consolas,monospace">HOLD T+1 AKTIF</text>
    <text x="601" y="218" text-anchor="middle" fill="#a7f3d0" font-size="8.3" font-family="ui-monospace,Consolas,monospace">26 ms · CEGAH CAIR</text>

    <!-- Fan-Out Target Nodes (Right) -->
    <g font-family="system-ui,Segoe UI,sans-serif">
      <rect x="680" y="88" width="190" height="52" rx="3" fill="#131c2b" stroke="#b45309" stroke-width="1.3"/>
      <text x="691" y="105" fill="#fbbf24" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">MULE-OUT-01 · BI-FAST</text>
      <text x="691" y="120" fill="#f1f5f9" font-size="10" font-weight="600">Rek. BCA ****8821 (Tersangka)</text>
      <text x="691" y="133" fill="#94a3b8" font-size="8.8" font-family="ui-monospace,Consolas,monospace">Upaya Rp 10.200.000 · DITAHAN</text>

      <rect x="680" y="182" width="190" height="52" rx="3" fill="#131c2b" stroke="#b45309" stroke-width="1.3"/>
      <text x="691" y="199" fill="#fbbf24" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">MULE-OUT-02 · BI-FAST</text>
      <text x="691" y="214" fill="#f1f5f9" font-size="10" font-weight="600">Rek. BRI ****4410 (FRD-974)</text>
      <text x="691" y="227" fill="#94a3b8" font-size="8.8" font-family="ui-monospace,Consolas,monospace">Upaya Rp 9.400.000 · DITAHAN</text>

      <rect x="680" y="276" width="190" height="52" rx="3" fill="#131c2b" stroke="#b45309" stroke-width="1.3"/>
      <text x="691" y="293" fill="#fbbf24" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">MULE-OUT-03 · BI-FAST</text>
      <text x="691" y="308" fill="#f1f5f9" font-size="10" font-weight="600">Rek. Mandiri ****9032</text>
      <text x="691" y="321" fill="#94a3b8" font-size="8.8" font-family="ui-monospace,Consolas,monospace">Upaya Rp 7.200.000 · DITAHAN</text>
    </g>

    <!-- Cluster #09 Bounding Zone (Bottom: Makassar Device Farm) -->
    <rect x="14" y="408" width="872" height="193" rx="4" fill="#0b1524" fill-opacity="0.88" stroke="#075985" stroke-width="1.2" stroke-dasharray="5,4"/>
    <rect x="26" y="418" width="342" height="21" rx="2" fill="#0b253a" stroke="#0284c7" stroke-width="1"/>
    <text x="34" y="432" fill="#38bdf8" font-size="10.2" font-weight="700" font-family="ui-monospace,Consolas,monospace">KLASTER #09 · FARM EMULATOR MAKASSAR (FRD-989)</text>
    <rect x="742" y="418" width="132" height="21" rx="2" fill="#361215" stroke="#b42318" stroke-width="1"/>
    <text x="750" y="432" fill="#f87171" font-size="10" font-weight="700" font-family="ui-monospace,Consolas,monospace">42/42 AKUN DIBLOKIR</text>

    <!-- Emulator Hub -> Proxy -> 42 Wallets -->
    <rect x="28" y="464" width="228" height="104" rx="3" fill="#131c2b" stroke="#f04438" stroke-width="1.6"/>
    <text x="40" y="484" fill="#f87171" font-size="9.5" font-weight="800" font-family="ui-monospace,Consolas,monospace">SHARED IMEI HASH (1 NODE)</text>
    <text x="40" y="502" fill="#f8fafc" font-size="11.2" font-weight="700" font-family="ui-monospace,Consolas,monospace">sha256:8f4a91c0...d21c</text>
    <text x="40" y="520" fill="#cbd5e1" font-size="9.6">Host: LDPlayer 9 · Android 11 x86</text>
    <text x="40" y="536" fill="#94a3b8" font-size="9.3" font-family="ui-monospace,Consolas,monospace">Sensor: Gyro=0.000 · MockGPS=ON</text>
    <text x="40" y="554" fill="#fbbf24" font-size="9.4" font-weight="700">Rule: EMU_IMEI_COLLISION (19 ms)</text>

    <line x1="256" y1="516" x2="342" y2="516" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#arrCyan)"/>

    <rect x="350" y="478" width="178" height="76" rx="3" fill="#131c2b" stroke="#38bdf8" stroke-width="1.3"/>
    <text x="361" y="497" fill="#38bdf8" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace">PROXY SUBNET · MAKASSAR</text>
    <text x="361" y="515" fill="#f8fafc" font-size="11.2" font-weight="700" font-family="ui-monospace,Consolas,monospace">103.164.52.0/24</text>
    <text x="361" y="532" fill="#94a3b8" font-size="9.3">ASN136106 · Rotasi Port 12 detik</text>
    <text x="361" y="546" fill="#fca5a5" font-size="8.9" font-family="ui-monospace,Consolas,monospace">Skor Reputasi IP: 94/100</text>

    <line x1="528" y1="500" x2="606" y2="474" stroke="#f04438" stroke-width="1.5" marker-end="url(#arrRed)"/>
    <line x1="528" y1="516" x2="606" y2="516" stroke="#f04438" stroke-width="1.5" marker-end="url(#arrRed)"/>
    <line x1="528" y1="532" x2="606" y2="558" stroke="#f04438" stroke-width="1.5" marker-end="url(#arrRed)"/>

    <rect x="614" y="454" width="256" height="36" rx="3" fill="#221014" stroke="#7a271a"/>
    <text x="625" y="476" fill="#fecaca" font-size="9.8" font-weight="700" font-family="ui-monospace,Consolas,monospace">Batch Registrasi #1 (16 akun) · BLOKIR</text>

    <rect x="614" y="498" width="256" height="36" rx="3" fill="#221014" stroke="#7a271a"/>
    <text x="625" y="520" fill="#fecaca" font-size="9.8" font-weight="700" font-family="ui-monospace,Consolas,monospace">Batch Registrasi #2 (14 akun) · BLOKIR</text>

    <rect x="614" y="542" width="256" height="36" rx="3" fill="#221014" stroke="#7a271a"/>
    <text x="625" y="564" fill="#fecaca" font-size="9.8" font-weight="700" font-family="ui-monospace,Consolas,monospace">Batch Uji QRIS #3 (12 akun · Rp 21jt)</text>
  </svg>
  `;

  const devRows = DEVICE_SIGNATURES.map(
    (d) => `<tr>
      <td class="mono" style="color:#38bdf8;font-weight:700;">${esc(d.hash)}</td>
      <td style="color:#f1f5f9;" class="trunc">${esc(d.model)}</td>
      <td class="mono" style="color:#94a3b8;">${esc(d.subnet)}</td>
      <td class="num mono" style="font-weight:700;color:${d.wallets >= 10 ? '#f87171' : '#f1f5f9'};">${d.wallets}</td>
      <td>${socBadge(d.status, d.tone)}</td>
    </tr>`
  ).join('');

  const timelineHtml = CLUSTER_TIMELINE.map((ev) => {
    return `<div style="display:grid;grid-template-columns:56px 66px 1fr;gap:6px;align-items:start;padding:7px 0;border-bottom:1px solid #1a2436;font-size:10.1px;">
      <span class="mono" style="color:#8ea3be;font-weight:600;">${esc(ev.t)}</span>
      <span>${socBadge(ev.tag, ev.tone)}</span>
      <span style="color:#e2e8f0;line-height:1.32;">${esc(ev.msg)}</span>
    </div>`;
  }).join('');

  const contentHtml = `
    ${kpiStrip}
    <div style="display:grid;grid-template-columns:1.58fr 1fr;gap:9px;flex:1;min-height:0;">
      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('gitBranch', 13, '#f87171')} <span>Kanvas Graf Jaringan Sindikat (Fan-In/Fan-Out Mule &amp; Device Farm)</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${socBadge('Depth: 2-Hop', 'info')}
            ${socBadge('65 Node · 71 Edge', 'neutral')}
            ${socBadge('Auto-Quarantine ON', 'ok')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div>${graphSvg}</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;">
            <div style="background:#0d131f;border:1px solid #223047;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8ea3be;">Sentralitas Hub ID10294811</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#f87171;">0,94 <span style="font-size:9.5px;color:#8ea3be;">(In-Degree 19)</span></div>
            </div>
            <div style="background:#0d131f;border:1px solid #223047;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8ea3be;">Rasio Fan-In / Umur MID</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#fbbf24;">19 : 3 hari <span style="font-size:9.5px;color:#8ea3be;">(Ekstrem)</span></div>
            </div>
            <div style="background:#0d131f;border:1px solid #223047;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8ea3be;">Kepadatan IMEI Makassar</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#38bdf8;">42 : 1 <span style="font-size:9.5px;color:#8ea3be;">(Ambang 3:1)</span></div>
            </div>
            <div style="background:#0d131f;border:1px solid #223047;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8ea3be;">Integritas Bukti Graf</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#34d399;">SHA-256 <span style="font-size:9.5px;color:#8ea3be;">Lampir STR</span></div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('cpu', 13, '#38bdf8')} <span>Forensik Sidik Jari Perangkat &amp; Emulator</span></div>
            ${socBadge('8 Sidik Jari Terpantau', 'neutral')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table dev-table">
              <colgroup>
                <col style="width:118px;" />
                <col style="width:146px;" />
                <col style="width:112px;" />
                <col style="width:48px;" />
                <col style="width:74px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Hash IMEI</th>
                  <th>Model / Emulator</th>
                  <th>Subnet IP</th>
                  <th class="num">Akun</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${devRows}</tbody>
            </table>
            <div style="padding:7px 9px;background:#0d131f;border-top:1px solid #223047;display:flex;justify-content:space-between;align-items:center;font-size:9.6px;">
              <span style="color:#94a3b8;">Sinyal Emulator: <strong style="color:#f8fafc;">QEMU x86, Gyro 0.000, MockGPS</strong></span>
              ${socBadge('Auto-Block Aktif', 'bad')}
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1.05;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('clock', 13, '#fbbf24')} <span>Linimasa Propagasi Sindikat — Klaster #14 (4 Menit)</span></div>
            ${socBadge('14:08 - 14:12 WIB', 'warn')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>${timelineHtml}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#0d131f;border:1px solid #223047;border-radius:2px;padding:7px 8px;">
              <div>
                <div style="font-size:8.8px;color:#8ea3be;">Deteksi ke Hold</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#34d399;">3m 57d (26 ms)</div>
              </div>
              <div>
                <div style="font-size:8.8px;color:#8ea3be;">Rekening Dibekukan</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#f87171;">1 MID + 3 Mule</div>
              </div>
              <div>
                <div style="font-size:8.8px;color:#8ea3be;">Eskalasi PPATK</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#fbbf24;">STR Siap Kirim</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderSocShell({
    activeSlug: 'p3',
    pageTitle: 'Analisis Graf Jaringan Mule & Forensik Perangkat',
    subtitlePill: socBadge('KLASTER #14 & #09 · 65 ENTITAS', 'bad'),
    rightActionsHtml: `
      <span class="e-btn">${ic('download', 11, '#cbd5e1')} Ekspor GraphML (PPATK)</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')} Isolasi Seluruh Klaster #14</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4 — MODE SHADOW & PENGUJIAN ATURAN 30 HARI (CLICKHOUSE REPLAY)
// ============================================================================
function renderPage4() {
  const prodRules = RULES_CATALOG.filter((r) => r.mode === 'PROD');
  const prodHits = prodRules.reduce((acc, r) => acc + r.hits30d, 0);
  const prodSaved = prodRules.reduce((acc, r) => acc + r.savedIdr, 0);

  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi is-info">
        <div class="e-kpi-top"><span>Dataset Replay ClickHouse</span>${socBadge('30 HARI', 'info')}</div>
        <div class="e-kpi-val">${fmtNum(REPLAY_CONFUSION.totalTx)}</div>
        <div class="e-kpi-foot"><span>23 Okt - 22 Nov 2026</span><span class="mono">486 fraud aktual</span></div>
      </div>
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Recall Mode Shadow V2</span>${socBadge('+11,5%', 'ok')}</div>
        <div class="e-kpi-val" style="color:#34d399;">96,3%</div>
        <div class="e-kpi-foot"><span>Prod V1: 84,8% (412 -&gt; 468)</span><span class="mono">+56 kasus</span></div>
      </div>
      <div class="e-kpi is-warn">
        <div class="e-kpi-top"><span>Dampak False Positive</span>${socBadge('+0,06%', 'warn')}</div>
        <div class="e-kpi-val" style="color:#fbbf24;">0,24%</div>
        <div class="e-kpi-foot"><span>Prod V1: 0,18% · Batas 0,35%</span><span class="mono">Dalam toleransi</span></div>
      </div>
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Tambahan Latensi P99</span>${socBadge('SLA <50ms', 'ok')}</div>
        <div class="e-kpi-val" style="color:#38bdf8;">+1,8 ms</div>
        <div class="e-kpi-foot"><span>28,0 ms -&gt; 29,8 ms P99</span><span class="mono">Margin 20,2 ms</span></div>
      </div>
      <div class="e-kpi is-crit">
        <div class="e-kpi-top"><span>Estimasi Dana Terselamatkan</span>${socBadge('DELTA 30H', 'ok')}</div>
        <div class="e-kpi-val" style="color:#34d399;">+Rp 1,42 M</div>
        <div class="e-kpi-foot"><span>Rp 6,84 M -&gt; Rp 8,26 M</span><span class="mono">Siap Canary 10%</span></div>
      </div>
    </div>
  `;

  const ruleRows = RULES_CATALOG.map((r) => {
    const sel = r.id === 'MULE_FAN_IN_5M_V2' ? 'is-selected' : '';
    return `<tr class="${sel}">
      <td class="mono" style="font-weight:700;color:${r.mode === 'SHADOW' ? '#38bdf8' : '#f1f5f9'};">${esc(r.id)}</td>
      <td style="color:#cbd5e1;" class="trunc">${esc(r.name)}</td>
      <td>${socBadge(r.mode, r.tone)}</td>
      <td class="num mono" style="font-weight:700;">${r.hits30d}</td>
      <td class="num mono" style="color:#34d399;font-weight:700;">${fmtIdr(r.savedIdr)}</td>
      <td class="num mono">${fmtPct(r.fpPct, 2)}</td>
      <td class="num mono">${r.latMs.toFixed(1).replace('.', ',')} ms</td>
    </tr>`;
  }).join('');

  const dslDiffHtml = `<span class="diff-line"><span class="syn-k">RULE</span> <span class="syn-n">MULE_FAN_IN_5M_V2</span> [MODE: SHADOW_REPLAY_30D]</span>` +
    `<span class="diff-line"><span class="syn-k">WHEN</span> channel IN (<span class="syn-s">"QRIS_MPM"</span>, <span class="syn-s">"QRIS_CPM"</span>, <span class="syn-s">"BI_FAST"</span>)</span>` +
    `<span class="diff-line diff-del">-  AND redis.distinct_senders(dest_mid, window=300s) &gt;= 15</span>` +
    `<span class="diff-line diff-add">+  AND redis.distinct_senders(dest_mid, window=300s) &gt;= 12</span>` +
    `<span class="diff-line diff-add">+  AND merchant.kyc_age_days(dest_mid) &lt;= 14</span>` +
    `<span class="diff-line diff-add">+  AND sum_idr(dest_mid, window=300s) &gt;= 45_000_000</span>` +
    `<span class="diff-line diff-add">+  AND graph.device_overlap_ratio(senders) &gt;= 0.40</span>` +
    `<span class="diff-line"><span class="syn-k">THEN</span></span>` +
    `<span class="diff-line">   EMIT_SCORE(<span class="syn-n">+42</span>), ACTION = <span class="syn-t">HOLD_T1_SETTLEMENT</span>,</span>` +
    `<span class="diff-line">   CREATE_PPATK_STR_DRAFT(flag=<span class="syn-s">"RF-04_SMURFING_MULE"</span>)</span>` +
    `<span class="diff-line diff-cmt">-- Replay 30H: +34 kasus mule tertangkap | +Rp 840.000.000 selamat | FP +0,02%</span>`;

  const replayChart = svgMultiLineChart({
    width: 610,
    height: 274,
    dark: true,
    xLabels: ['H-30', 'H-25', 'H-20', 'H-15', 'H-10', 'H-5', 'H-2', 'Hari Ini'],
    yMin: 70,
    yMax: 100,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)}%`,
    threshold: { value: 92, label: 'Target Recall 92%', color: '#10b981' },
    series: [
      { label: 'Recall Shadow V2 (%)', color: '#38bdf8', values: [94.8, 95.2, 95.6, 95.9, 96.1, 96.0, 96.4, 96.3], area: true, dots: true, width: 2.1 },
      { label: 'Recall Produksi V1 (%)', color: '#f59e0b', values: [83.2, 84.1, 83.9, 85.0, 84.6, 84.4, 84.9, 84.8], dots: true, width: 1.8 },
    ],
    annotations: [
      { index: 7, seriesIdx: 0, label: 'Shadow V2: 96,3%', color: '#38bdf8', dy: -22 },
      { index: 7, seriesIdx: 1, label: 'Prod V1: 84,8%', color: '#f59e0b', dy: 14 },
    ],
  });

  const pV1 = REPLAY_CONFUSION.prodV1;
  const sV2 = REPLAY_CONFUSION.shadowV2;

  const contentHtml = `
    ${kpiStrip}
    <div style="display:grid;grid-template-columns:1.34fr 1fr;gap:9px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1.10;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#38bdf8')} <span>Katalog Aturan Deteksi — Produksi vs Mode Shadow (10 Aturan)</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${socBadge('6 PROD', 'ok')}
              ${socBadge('3 SHADOW', 'info')}
              ${socBadge('1 CANARY', 'warn')}
            </div>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table rules-table">
              <colgroup>
                <col style="width:160px;" />
                <col style="width:225px;" />
                <col style="width:72px;" />
                <col style="width:58px;" />
                <col style="width:128px;" />
                <col style="width:62px;" />
                <col style="width:62px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode Aturan</th>
                  <th>Nama Detektor</th>
                  <th>Mode</th>
                  <th class="num">Hit 30H</th>
                  <th class="num">Selamat (30H)</th>
                  <th class="num">FP %</th>
                  <th class="num">Latensi</th>
                </tr>
              </thead>
              <tbody>${ruleRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Baseline 6 Aturan PROD Aktif (30 Hari Terakhir)</td>
                  <td class="num mono">${prodHits}</td>
                  <td class="num mono" style="color:#34d399;">${fmtIdr(prodSaved)}</td>
                  <td class="num mono">0,18%</td>
                  <td class="num mono">17,3 ms</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:6px 10px;background:#0d131f;border-top:1px solid #223047;display:flex;justify-content:space-between;font-size:9.6px;color:#94a3b8;">
              <span>Aturan Shadow dievaluasi asinkron pada mirror Kafka <span class="mono" style="color:#cbd5e1;">qris.tx.shadow</span> tanpa memblokir settlement.</span>
              <span class="mono" style="color:#38bdf8;">Zero Customer Impact</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.90;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#fbbf24')} <span>Diff DSL Aturan — MULE_FAN_IN_5M_V2 (Shadow vs Prod V1)</span></div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${socBadge('Zero-Impact Traffic', 'ok')}
              ${socBadge('Dry-Run 48,6 jt tx', 'info')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
            <div class="soc-code" style="flex:1;line-height:1.58;">${dslDiffHtml}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#8ea3be;">
              <span>Sintaks DSL tervalidasi · Kompilasi .NET 9 Expression Tree: <strong style="color:#34d399;">0,4 ms</strong></span>
              <span class="mono" style="color:#cbd5e1;">Commit: rule-20261122-v2</span>
            </div>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#38bdf8')} <span>Kurva Recall Replay 30 Hari (ClickHouse Backtest)</span></div>
            ${socBadge('Shadow V2 Unggul +11,5%', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
            <div>${replayChart}</div>
            <div style="display:flex;justify-content:space-between;padding:5px 8px;background:#0d131f;border:1px solid #223047;border-radius:2px;font-size:9.6px;color:#cbd5e1;">
              <span>Waktu eksekusi replay 48,6 jt baris di ClickHouse: <strong class="mono" style="color:#38bdf8;">18,4 detik</strong></span>
              <span class="mono" style="color:#34d399;">CPU 38%</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1.05;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('checkCircle', 13, '#34d399')} <span>Matriks Evaluasi &amp; Gerbang Promosi Canary</span></div>
            ${socBadge('LULUS 4/4 GERBANG', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
            <table class="e-table">
              <colgroup>
                <col style="width:196px;" />
                <col style="width:116px;" />
                <col style="width:124px;" />
                <col style="width:104px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Metrik Replay (30 Hari)</th>
                  <th class="num">Produksi V1</th>
                  <th class="num">Shadow V2</th>
                  <th class="num">Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>True Positive (Fraud Tertangkap)</td>
                  <td class="num mono">${fmtNum(pV1.tp)} kasus</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">${fmtNum(sV2.tp)} kasus</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">+${sV2.tp - pV1.tp}</td>
                </tr>
                <tr>
                  <td>False Negative (Fraud Lolos)</td>
                  <td class="num mono" style="color:#f87171;">${fmtNum(pV1.fn)} kasus</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">${fmtNum(sV2.fn)} kasus</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">${sV2.fn - pV1.fn}</td>
                </tr>
                <tr>
                  <td>Recall Deteksi (TP / 486 Aktual)</td>
                  <td class="num mono">84,8%</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">96,3%</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">+11,5%</td>
                </tr>
                <tr>
                  <td>False Positive (Batas &lt;= 0,35%)</td>
                  <td class="num mono">${fmtPct(pV1.fpRate, 2)}</td>
                  <td class="num mono" style="color:#fbbf24;">${fmtPct(sV2.fpRate, 2)}</td>
                  <td class="num mono" style="color:#fbbf24;">+0,06%</td>
                </tr>
                <tr>
                  <td>Latensi P99 Inline (SLA 50 ms)</td>
                  <td class="num mono">28,0 ms</td>
                  <td class="num mono" style="color:#38bdf8;">29,8 ms</td>
                  <td class="num mono">+1,8 ms</td>
                </tr>
                <tr>
                  <td style="font-weight:700;">Total Nilai Fraud Terselamatkan</td>
                  <td class="num mono">${fmtIdr(pV1.savedIdr)}</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">${fmtIdr(sV2.savedIdr)}</td>
                  <td class="num mono" style="color:#34d399;font-weight:700;">+Rp 1,42 M</td>
                </tr>
              </tbody>
            </table>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="padding:6px 8px;background:#07291e;border:1px solid #065f46;border-radius:2px;font-size:9.6px;color:#a7f3d0;display:flex;align-items:center;gap:6px;">
                ${ic('check', 12, '#34d399')} Latensi P99 &lt; 35 ms (29,8 ms)
              </div>
              <div style="padding:6px 8px;background:#07291e;border:1px solid #065f46;border-radius:2px;font-size:9.6px;color:#a7f3d0;display:flex;align-items:center;gap:6px;">
                ${ic('check', 12, '#34d399')} Persetujuan Risk BI TIKMI
              </div>
              <div style="padding:6px 8px;background:#07291e;border:1px solid #065f46;border-radius:2px;font-size:9.6px;color:#a7f3d0;display:flex;align-items:center;gap:6px;">
                ${ic('check', 12, '#34d399')} False Positive &lt;= 0,35% (0,24%)
              </div>
              <div style="padding:6px 8px;background:#07291e;border:1px solid #065f46;border-radius:2px;font-size:9.6px;color:#a7f3d0;display:flex;align-items:center;gap:6px;">
                ${ic('check', 12, '#34d399')} Zero Regression SNAP BI v2.1
              </div>
            </div>

            <div style="display:flex;gap:7px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('play', 11, '#fff')} Promosikan ke Canary 10%</span>
              <span class="e-btn">${ic('download', 11, '#cbd5e1')} Laporan Backtest</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderSocShell({
    activeSlug: 'p4',
    pageTitle: 'Pengujian Aturan Mode Shadow (Replay 30 Hari ClickHouse)',
    subtitlePill: socBadge('REPLAY 48,6 JT TX · SIAP PROMOSI CANARY', 'info'),
    rightActionsHtml: `
      <span class="e-btn">${ic('refresh', 11, '#cbd5e1')} Jalankan Ulang Replay</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Promosikan Shadow V2</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5 — KEPATUHAN BI TIKMI, PENAHANAN SETTLEMENT & DOSSIER STR PPATK
// ============================================================================
function renderPage5() {
  const heldAlerts = ALERTS.filter((a) => a.status === 'Ditahan');
  const heldTotal = heldAlerts.reduce((acc, a) => acc + a.amountIdr, 0);
  const tikmiAvg = (TIKMI_DOMAINS.reduce((acc, d) => acc + d.score, 0) / TIKMI_DOMAINS.length)
    .toFixed(1)
    .replace('.', ',');

  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Indeks Kesiapan BI TIKMI</span>${socBadge('MEMADAI', 'ok')}</div>
        <div class="e-kpi-val" style="color:#34d399;">${tikmiAvg} / 100</div>
        <div class="e-kpi-foot"><span>5 domain manajemen risiko</span><span class="mono">Audit Q4 2026</span></div>
      </div>
      <div class="e-kpi is-warn">
        <div class="e-kpi-top"><span>Dana Ditahan Aktif (Hold T+1)</span>${socBadge('5 MERCHANT', 'warn')}</div>
        <div class="e-kpi-val" style="color:#fbbf24;">${fmtIdr(heldTotal)}</div>
        <div class="e-kpi-foot"><span>Escrow sementara SNAP BI</span><span class="mono">0 sengketa</span></div>
      </div>
      <div class="e-kpi is-info">
        <div class="e-kpi-top"><span>Dossier STR PPATK (MTD)</span>${socBadge('GRIPS XML', 'info')}</div>
        <div class="e-kpi-val">18 laporan</div>
        <div class="e-kpi-foot"><span>16 terkirim · 2 siap kirim</span><span class="mono">Bulan Nov 2026</span></div>
      </div>
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Kepatuhan SLA STR (&lt;3 HK)</span>${socBadge('100% PATUH', 'ok')}</div>
        <div class="e-kpi-val" style="color:#34d399;">100,0%</div>
        <div class="e-kpi-foot"><span>Rata-rata pelaporan 14 jam</span><span class="mono">Per-PPATK 01/21</span></div>
      </div>
      <div class="e-kpi is-ok">
        <div class="e-kpi-top"><span>Segel Audit WORM</span>${socBadge('SHA-256', 'ok')}</div>
        <div class="e-kpi-val" style="color:#38bdf8;">Terverifikasi</div>
        <div class="e-kpi-foot"><span>Retensi 5 tahun · Immutable</span><span class="mono">0 tamper</span></div>
      </div>
    </div>
  `;

  const holdRows = heldAlerts
    .map((h) => {
      const sel = h.code === 'FRD-992' ? 'is-selected' : '';
      return `<tr class="${sel}">
        <td class="mono" style="font-weight:700;color:${h.code === 'FRD-992' ? '#fca5a5' : '#f1f5f9'};">${esc(h.code)}</td>
        <td class="mono" style="color:#38bdf8;">${esc(h.targetId)}</td>
        <td style="font-weight:600;color:#f1f5f9;" class="trunc">${esc(h.targetName)}</td>
        <td class="num mono" style="font-weight:700;color:#fbbf24;">${fmtIdr(h.amountIdr)}</td>
        <td>${socBadge(h.strStatus, h.strTone)}</td>
        <td class="mono" style="color:${h.slaLeft === 'Selesai' ? '#34d399' : '#cbd5e1'};">${esc(h.slaLeft)}</td>
      </tr>`;
    })
    .join('');

  const tikmiBars = TIKMI_DOMAINS.map(
    (d) => `<div style="display:flex;flex-direction:column;gap:3px;">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
        <span style="color:#e2e8f0;font-weight:600;"><span class="mono" style="color:#38bdf8;margin-right:5px;">${esc(d.code)}</span>${esc(d.name)}</span>
        <span class="mono" style="color:#34d399;font-weight:700;">${d.score}%</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="soc-bar-track"><div style="width:${d.score}%;height:100%;background:${d.score >= 95 ? '#10b981' : '#38bdf8'};"></div></div>
        <span class="mono" style="font-size:8.8px;color:#8ea3be;width:138px;text-align:right;" class="trunc">${esc(d.ref)}</span>
      </div>
    </div>`
  ).join('');

  const wormRows = WORM_LOGS.map(
    (w) => `<tr>
      <td class="mono" style="color:#8ea3be;">${esc(w.ts)}</td>
      <td class="mono" style="color:#38bdf8;font-weight:600;">${esc(w.actor)}</td>
      <td style="color:#e2e8f0;" class="trunc">${esc(w.action)}</td>
      <td class="mono" style="color:#34d399;">${esc(w.hash)}</td>
    </tr>`
  ).join('');

  // Syntax-colored GRIPS XML payload (richer & fills container cleanly)
  const gripsXmlHtml = `<span class="syn-k">&lt;LTKM_PPATK</span> version=<span class="syn-s">"GRIPS-2.4"</span> pjp_code=<span class="syn-s">"PJP-ID-00811"</span><span class="syn-k">&gt;</span>
  <span class="syn-k">&lt;Header&gt;</span>
    <span class="syn-k">&lt;ReportID&gt;</span><span class="syn-n">STR-2026-1122-0992</span><span class="syn-k">&lt;/ReportID&gt;</span>
    <span class="syn-k">&lt;FilingType&gt;</span><span class="syn-t">LTKM_STR_URGENT</span><span class="syn-k">&lt;/FilingType&gt;</span>
    <span class="syn-k">&lt;RedFlagCode&gt;</span>RF-04_SMURFING_MULE_CLUSTER<span class="syn-k">&lt;/RedFlagCode&gt;</span>
    <span class="syn-k">&lt;CaseRef&gt;</span>FRD-992<span class="syn-k">&lt;/CaseRef&gt;</span>
  <span class="syn-k">&lt;/Header&gt;</span>
  <span class="syn-k">&lt;SubjectMerchant</span> nmid=<span class="syn-s">"ID10294811"</span> age_days=<span class="syn-s">"3"</span><span class="syn-k">&gt;</span>
    <span class="syn-k">&lt;Name&gt;</span>Toko Elektronik Cahaya Abadi<span class="syn-k">&lt;/Name&gt;</span>
    <span class="syn-k">&lt;HoldReference&gt;</span>HLD-261122-0992<span class="syn-k">&lt;/HoldReference&gt;</span>
    <span class="syn-k">&lt;HeldAmountIDR&gt;</span><span class="syn-n">94500000</span><span class="syn-k">&lt;/HeldAmountIDR&gt;</span>
    <span class="syn-k">&lt;DistinctSenders5Min&gt;</span><span class="syn-n">19</span><span class="syn-k">&lt;/DistinctSenders5Min&gt;</span>
  <span class="syn-k">&lt;/SubjectMerchant&gt;</span>
  <span class="syn-k">&lt;ConnectedMuleAccounts</span> intercepted=<span class="syn-s">"true"</span><span class="syn-k">&gt;</span>
    <span class="syn-k">&lt;Account</span> bank=<span class="syn-s">"BCA"</span> mask=<span class="syn-s">"****8821"</span> idr=<span class="syn-s">"10200000"</span> <span class="syn-k">/&gt;</span>
    <span class="syn-k">&lt;Account</span> bank=<span class="syn-s">"BRI"</span> mask=<span class="syn-s">"****4410"</span> idr=<span class="syn-s">"9400000"</span> <span class="syn-k">/&gt;</span>
    <span class="syn-k">&lt;Account</span> bank=<span class="syn-s">"MDR"</span> mask=<span class="syn-s">"****9032"</span> idr=<span class="syn-s">"7200000"</span> <span class="syn-k">/&gt;</span>
  <span class="syn-k">&lt;/ConnectedMuleAccounts&gt;</span>
  <span class="syn-k">&lt;ComplianceOfficer&gt;</span>R. Aditya (Lead Fraud Ops SOC)<span class="syn-k">&lt;/ComplianceOfficer&gt;</span>
  <span class="syn-k">&lt;ForensicSeal</span> algo=<span class="syn-s">"SHA-256"</span><span class="syn-k">&gt;</span><span class="syn-s">e4b9c8a210f4d87c...71a0</span><span class="syn-k">&lt;/ForensicSeal&gt;</span>
<span class="syn-k">&lt;/LTKM_PPATK&gt;</span>`;

  const contentHtml = `
    ${kpiStrip}
    <div style="display:grid;grid-template-columns:1.28fr 1fr;gap:9px;flex:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:0.84;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 13, '#fbbf24')} <span>Penahanan Settlement Merchant Aktif (Hold T+1 SNAP BI · 5 Kasus)</span></div>
            ${socBadge('Total: Rp 184.000.000', 'warn')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table rules-table">
              <colgroup>
                <col style="width:72px;" />
                <col style="width:94px;" />
                <col style="width:210px;" />
                <col style="width:120px;" />
                <col style="width:124px;" />
                <col style="width:74px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kasus</th>
                  <th>NMID</th>
                  <th>Merchant Ditahan</th>
                  <th class="num">Dana Ditahan</th>
                  <th>Status STR PPATK</th>
                  <th>SLA 3 HK</th>
                </tr>
              </thead>
              <tbody>${holdRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Total 5 Penahanan Settlement T+1 Aktif</td>
                  <td class="num mono" style="color:#fbbf24;">${fmtIdr(heldTotal)}</td>
                  <td colspan="2">${socBadge('100% Sesuai PBI TIKMI', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#0b111c;border-top:1px solid #1e2a3d;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
              <div style="padding:5px 7px;background:#101724;border:1px solid #223047;border-radius:2px;">
                <div style="font-size:8.8px;color:#8ea3be;">Tahap 1 · Inline Hold</div>
                <div style="font-size:9.8px;font-weight:700;color:#34d399;">Hold T+1 Otomatis (&lt;50ms)</div>
              </div>
              <div style="padding:5px 7px;background:#101724;border:1px solid #223047;border-radius:2px;">
                <div style="font-size:8.8px;color:#8ea3be;">Tahap 2 · Verifikasi Dual-Control</div>
                <div style="font-size:9.8px;font-weight:700;color:#fbbf24;">Lead SOC + Compliance (&lt;24j)</div>
              </div>
              <div style="padding:5px 7px;background:#101724;border:1px solid #223047;border-radius:2px;">
                <div style="font-size:8.8px;color:#8ea3be;">Tahap 3 · Pelaporan Regulator</div>
                <div style="font-size:9.8px;font-weight:700;color:#38bdf8;">Kirim GRIPS STR (&lt;3 HK)</div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1.16;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#34d399')} <span>Penilaian Kepatuhan BI TIKMI &amp; Jejak Audit WORM Tak Terubah</span></div>
            ${socBadge('Skor Rata-Rata: 96,4%', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:9px;">
            <div style="display:flex;flex-direction:column;gap:7px;">${tikmiBars}</div>
            <div>
              <div style="font-size:9.8px;font-weight:700;color:#8ea3be;margin-bottom:4px;display:flex;justify-content:space-between;">
                <span>LOG AUDIT WORM TERBARU (APPEND-ONLY · RETENSI 5 TAHUN)</span>
                <span class="mono" style="color:#34d399;">Chain Verified</span>
              </div>
              <table class="e-table">
                <colgroup>
                  <col style="width:94px;" />
                  <col style="width:106px;" />
                  <col style="width:360px;" />
                  <col style="width:110px;" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Waktu WIB</th>
                    <th>Aktor</th>
                    <th>Peristiwa Kepatuhan</th>
                    <th>SHA-256</th>
                  </tr>
                </thead>
                <tbody>${wormRows}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#f87171')} <span>Dossier Kasus LTKM / STR PPATK — STR-2026-1122-0992</span></div>
          ${socBadge('SIAP KIRIM GRIPS', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="background:#1c0f13;border:1px solid #7a271a;border-radius:2px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:11.5px;font-weight:800;color:#f8fafc;">Kasus FRD-992 · Klaster Fan-In Mule #14</div>
              <div style="font-size:9.8px;color:#fca5a5;">Indikator PPATK RF-04: Akumulasi dana cepat dari 19 pengirim ke 1 merchant baru</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-size:13px;font-weight:800;color:#fbbf24;">Rp 94.500.000</div>
              <div class="mono" style="font-size:9px;color:#34d399;">Hold: HLD-261122-0992</div>
            </div>
          </div>

          <div class="kv-grid">
            <div class="kv-row"><span class="kv-k">Pelapor (PJP BI)</span><span class="kv-v">PT Nusantara Pay Switch</span></div>
            <div class="kv-row"><span class="kv-k">Sandi PJP / NNS</span><span class="kv-v mono">93600811</span></div>
            <div class="kv-row"><span class="kv-k">Merchant Terlapor</span><span class="kv-v">Toko Elektronik Cahaya Abadi</span></div>
            <div class="kv-row"><span class="kv-k">NMID / Umur KYC</span><span class="kv-v mono">ID10294811 (3 hari)</span></div>
            <div class="kv-row"><span class="kv-k">Jumlah Pengirim</span><span class="kv-v mono">19 akun unik (4 menit)</span></div>
            <div class="kv-row"><span class="kv-k">Batas Kirim STR</span><span class="kv-v mono" style="color:#fbbf24;">25 Nov 2026 (46j 18m)</span></div>
          </div>

          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="font-size:9.8px;font-weight:700;color:#8ea3be;">LAMPIRAN BUKTI FORENSIK TERVERIFIKASI (OTOMATIS)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="padding:6px 8px;background:#0d131f;border:1px solid #223047;border-radius:2px;font-size:9.6px;">
                <div style="font-weight:700;color:#f1f5f9;">1. GraphML Klaster #14</div>
                <div class="mono" style="font-size:8.8px;color:#34d399;">23 node · SHA-256 valid</div>
              </div>
              <div style="padding:6px 8px;background:#0d131f;border:1px solid #223047;border-radius:2px;font-size:9.6px;">
                <div style="font-weight:700;color:#f1f5f9;">2. Log 19 RRN SNAP BI</div>
                <div class="mono" style="font-size:8.8px;color:#34d399;">CSV+JSON · 148 KB</div>
              </div>
              <div style="padding:6px 8px;background:#0d131f;border:1px solid #223047;border-radius:2px;font-size:9.6px;">
                <div style="font-weight:700;color:#f1f5f9;">3. Bukti Hold T+1 Escrow</div>
                <div class="mono" style="font-size:8.8px;color:#34d399;">HLD-261122-0992.pdf</div>
              </div>
              <div style="padding:6px 8px;background:#0d131f;border:1px solid #223047;border-radius:2px;font-size:9.6px;">
                <div style="font-weight:700;color:#f1f5f9;">4. Profil e-KYC Merchant</div>
                <div class="mono" style="font-size:8.8px;color:#34d399;">KTP/NPWP Terenkripsi</div>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-height:0;">
            <div style="font-size:9.8px;font-weight:700;color:#8ea3be;display:flex;justify-content:space-between;">
              <span>PREVIEW PAYLOAD XML PORTAL GRIPS PPATK</span>
              <span class="mono" style="color:#38bdf8;">Schema GRIPS-2.4 Valid</span>
            </div>
            <div class="soc-code" style="flex:1;line-height:1.45;">${gripsXmlHtml}</div>
          </div>

          <div style="display:flex;gap:7px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('shield', 11, '#fff')} Kirim STR ke Portal GRIPS PPATK</span>
            <span class="e-btn">${ic('download', 11, '#cbd5e1')} Unduh Bundel PDF+XML</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderSocShell({
    activeSlug: 'p5',
    pageTitle: 'Kepatuhan BI TIKMI, Penahanan Settlement & Dossier STR PPATK',
    subtitlePill: socBadge('BI TIKMI 96,4 · 5 HOLD AKTIF · GRIPS XML', 'ok'),
    rightActionsHtml: `
      <span class="e-btn">${ic('download', 11, '#cbd5e1')} Paket Audit BI TIKMI</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 11, '#ffffff')} Ekspor STR PPATK</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// EXPORT RENDER PIPELINE
// ============================================================================
export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderPage1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderPage2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderPage3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderPage4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderPage5() },
  ];
}
