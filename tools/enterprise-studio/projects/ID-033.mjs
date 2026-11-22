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
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-033',
  name: 'eTender BUMN',
  reference: 'SAP S/4HANA Fiori Horizon + SAP Ariba Strategic Sourcing',
  persona: 'Ir. H. Darmawan · Ketua Pokja Pengadaan · PT Nusantara Energi Holding (Persero)',
  pages: [
    { slug: 'p1', title: 'Cockpit Pengadaan & Pagu RKAP BUMN' },
    { slug: 'p2', title: 'Meja Kerja Tender & Matriks Evaluasi TKDN' },
    { slug: 'p3', title: 'Ruang Pembukaan Penawaran Tertutup (RSA-4096 Vault)' },
    { slug: 'p4', title: 'Forensik Anti-Kolusi & Graf Afiliasi Vendor' },
    { slug: 'p5', title: 'Simulasi Skoring Teknis-Komersial & Kalkulator HEA TKDN' },
    { slug: 'p6', title: 'Prakualifikasi Vendor OSS-RBA, TKDN & Integrasi SAP/CoreTax' },
    { slug: 'p7', title: 'Matriks DoA, Persetujuan Berjenjang & Elsa Workflow' },
    { slug: 'p8', title: 'Audit BPK WORM SHA-256 & Pendamping Mobile Komite/Vendor' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// ============================================================================

const FOCUS_HPS = 4850000000; // Rp 4.850.000.000 (Rp 4,85 M)
const TKDN_MIN_REQ = 40.0;
const WEIGHT_TECH = 0.60;
const WEIGHT_COMM = 0.40;
const MAX_TKDN_PREF = 0.25; // Perpres 16/2018 & Permenperin 16/2011 (max 25% barang)

// 5 Vendor peserta Paket Utama PKT-2026-BUMN-0418 (Genset 1500 kVA Prime Power)
const GENSET_VENDORS_RAW = [
  {
    code: 'VND-01',
    name: 'PT Traktor Nusantara Prima',
    nib: '9120208411902',
    npwp: '0013489210091000',
    tkdnCert: '4812/SJ-IND.8/TKDN/04/2026',
    tkdnPct: 44.2,
    bidIdr: 4580000000,
    scores: { spec: 92, warranty: 92, exp: 92, hse: 94, delivery: 90 }, // 92.0 exact
    sha256: 'e4a9c71b2d80f43188c0a9d1b6423f7a',
    blobKb: 18420,
    uploadAt: '21 Nov 2026 14:18:09',
    ip: '114.79.42.118',
    pdfAuthor: 'R. Wijaya · PT TNP',
    collusionFlag: false,
    verdict: 'Rank #1',
    tone: 'ok',
    note: 'Di Bawah HPS · Lulus Teknis & TKDN',
  },
  {
    code: 'VND-02',
    name: 'PT Daya Energi Mandiri',
    nib: '9120105398124',
    npwp: '0024918230072000',
    tkdnCert: '5091/SJ-IND.8/TKDN/05/2026',
    tkdnPct: 41.0,
    bidIdr: 4710000000,
    scores: { spec: 89, warranty: 87, exp: 89, hse: 86, delivery: 88 }, // 88.0 exact
    sha256: '7b2f8e04c19a53d210ef4b88a129c0e4',
    blobKb: 16210,
    uploadAt: '21 Nov 2026 15:42:31',
    ip: '202.152.14.66',
    pdfAuthor: 'A. Kusuma · PT DEM',
    collusionFlag: false,
    verdict: 'Rank #2',
    tone: 'ok',
    note: 'Di Bawah HPS · Lulus Teknis & TKDN',
  },
  {
    code: 'VND-03',
    name: 'CV Karya Teknik Bersama',
    nib: '9120309921451',
    npwp: '0038124510044000',
    tkdnCert: '3910/SJ-IND.8/TKDN/02/2026',
    tkdnPct: 38.5,
    bidIdr: 4920000000, // +1.44% di atas HPS
    scores: { spec: 80, warranty: 78, exp: 78, hse: 80, delivery: 79 }, // 79.0 exact
    sha256: '3c19d4a7e5b0218f94ca11e27b48d931',
    blobKb: 12940,
    uploadAt: '21 Nov 2026 16:05:14',
    ip: '180.244.161.24',
    pdfAuthor: 'D. Pranoto · CV KTB',
    collusionFlag: false,
    verdict: 'Gugur (Lewat HPS)',
    tone: 'warn',
    note: '+1,4% HPS & TKDN < 40%',
  },
  {
    code: 'VND-04',
    name: 'PT Sinar Jaya Elektrika',
    nib: '9120206714008',
    npwp: '0049201180015000',
    tkdnCert: '4421/SJ-IND.8/TKDN/03/2026',
    tkdnPct: 40.8,
    bidIdr: 4640000000,
    scores: { spec: 84, warranty: 84, exp: 84, hse: 84, delivery: 84 }, // 84.0 exact
    sha256: '9f84a21c0e77b30952d1fa84e9021b6c',
    blobKb: 15110,
    uploadAt: '21 Nov 2026 16:48:12',
    ip: '103.144.82.19',
    pdfAuthor: 'B. Santoso (Acrobat 24.0)',
    collusionFlag: true,
    verdict: 'Indikasi Kolusi',
    tone: 'bad',
    note: 'Tahan Audit · IP & PDF Identik',
  },
  {
    code: 'VND-05',
    name: 'PT Cahaya Mandiri Teknik',
    nib: '9120206714099',
    npwp: '0049201940015000',
    tkdnCert: '4428/SJ-IND.8/TKDN/03/2026',
    tkdnPct: 40.4,
    bidIdr: 4825600000, // Exact 1.0400x of VND-04 (cover bid)
    scores: { spec: 83, warranty: 83, exp: 83, hse: 83, delivery: 83 }, // 83.0 exact
    sha256: '9f84b70d3c12e41861f0bc93d8152a4e',
    blobKb: 15118,
    uploadAt: '21 Nov 2026 16:49:54',
    ip: '103.144.82.19',
    pdfAuthor: 'B. Santoso (Acrobat 24.0)',
    collusionFlag: true,
    verdict: 'Indikasi Kolusi',
    tone: 'bad',
    note: 'Tahan Audit · Cover Bid 1,04x',
  },
];

// Compute exact technical, KP, HEA, commercial, and final scores
function computeTechScore(sc) {
  return Number(
    (sc.spec * 0.30 + sc.warranty * 0.20 + sc.exp * 0.20 + sc.hse * 0.15 + sc.delivery * 0.15).toFixed(2)
  );
}

const GENSET_VENDORS_STAGE1 = GENSET_VENDORS_RAW.map((v) => {
  const techScore = computeTechScore(v.scores);
  const kp = v.tkdnPct >= TKDN_MIN_REQ ? (v.tkdnPct / 100) * MAX_TKDN_PREF : 0;
  const heaIdr = Math.round(v.bidIdr * (1 - kp));
  const deltaHpsPct = ((v.bidIdr - FOCUS_HPS) / FOCUS_HPS) * 100;
  const eligible = !v.collusionFlag && v.bidIdr <= FOCUS_HPS && v.tkdnPct >= TKDN_MIN_REQ && techScore >= 75;
  return { ...v, techScore, kp, heaIdr, deltaHpsPct, eligible };
});

const LOWEST_ELIGIBLE_HEA = Math.min(
  ...GENSET_VENDORS_STAGE1.filter((v) => v.eligible).map((v) => v.heaIdr)
);

const GENSET_VENDORS = GENSET_VENDORS_STAGE1.map((v) => {
  const commScore = v.eligible ? Number(((LOWEST_ELIGIBLE_HEA / v.heaIdr) * 100).toFixed(2)) : 0;
  const finalScore = v.eligible
    ? Number((WEIGHT_TECH * v.techScore + WEIGHT_COMM * commScore).toFixed(2))
    : 0;
  return { ...v, commScore, finalScore };
});

// BoQ Forensic Line Items (VND-05 === exact 1.04x VND-04 across all 8 items!)
const BOQ_ITEMS = [
  { no: '01', desc: 'Unit Mesin Diesel Generator 1500 kVA Prime Power (50Hz)', hps: 2950000000, v1: 2810000000, v4: 2840000000 },
  { no: '02', desc: 'Alternator Brushless IP23 + AVR Digital Class H', hps: 680000000, v1: 645000000, v4: 650000000 },
  { no: '03', desc: 'Panel Sinkronisasi ATS/AMF + Breaker ACB 2500A', hps: 385000000, v1: 358000000, v4: 365000000 },
  { no: '04', desc: 'Silent Canopy Acoustic 75 dBA @ 7m (Fabrikasi Lokal)', hps: 290000000, v1: 268000000, v4: 275000000 },
  { no: '05', desc: 'Tangki Bahan Bakar Harian 3.000 L + Sistem Pemipaan', hps: 145000000, v1: 132000000, v4: 135000000 },
  { no: '06', desc: 'Kabel Power NYY/N2XSY 4x300 mm2 & Instalasi Tray', hps: 165000000, v1: 152000000, v4: 155000000 },
  { no: '07', desc: 'Pengujian Load Bank 110%, Commissioning & SLO ESDM', hps: 125000000, v1: 115000000, v4: 120000000 },
  { no: '08', desc: 'Pelatihan Operator K3, Suku Cadang 2.000 Jam & Garansi', hps: 110000000, v1: 100000000, v4: 100000000 },
].map((item) => ({
  ...item,
  v5: Math.round(item.v4 * 1.04),
  ratio: (Math.round(item.v4 * 1.04) / item.v4).toFixed(4),
}));

// 16 Active BUMN Procurement Packages across 6 Entities (Single Source of Truth)
const PACKAGES = [
  {
    code: 'PKT-2026-BUMN-0418',
    title: 'Pengadaan Genset 1500 kVA Prime Power + Panel ATS',
    entity: 'PT Nusantara Pembangkitan',
    cat: 'Capex Mesin',
    hpsIdr: 4850000000,
    bidIdr: 4580000000,
    tkdnPct: 44.2,
    vendors: 5,
    flags: 2,
    stage: 'Pembukaan Bid',
    doa: 'Tier 3',
    status: 'Tahan Audit (2)',
    tone: 'bad',
    selected: true,
  },
  {
    code: 'PKT-2026-BUMN-0412',
    title: 'Overhaul Turbin Uap Unit 2 PLTU Suralaya Barat',
    entity: 'PT Nusantara Pembangkitan',
    cat: 'Jasa O&M',
    hpsIdr: 14200000000,
    bidIdr: 13180000000,
    tkdnPct: 52.4,
    vendors: 6,
    flags: 0,
    stage: 'Evaluasi HEA',
    doa: 'Tier 4',
    status: 'Evaluasi HEA',
    tone: 'info',
  },
  {
    code: 'PKT-2026-BUMN-0409',
    title: 'Transformator Daya 60 MVA 150/20 kV + OLTC',
    entity: 'PT Nusantara Transmisi',
    cat: 'Capex Gardu',
    hpsIdr: 18600000000,
    bidIdr: 17420000000,
    tkdnPct: 48.6,
    vendors: 4,
    flags: 0,
    stage: 'Penetapan SPPBJ',
    doa: 'Tier 4',
    status: 'Masa Sanggah',
    tone: 'ok',
  },
  {
    code: 'PKT-2026-BUMN-0421',
    title: 'Sewa Armada Dump Truck 40T Tambang Muara Enim',
    entity: 'PT Nusantara Tambang',
    cat: 'Opex Tambang',
    hpsIdr: 9400000000,
    bidIdr: 8820000000,
    tkdnPct: 61.5,
    vendors: 7,
    flags: 1,
    stage: 'Pembukaan Bid',
    doa: 'Tier 3',
    status: 'Cek Afiliasi (1)',
    tone: 'warn',
  },
  {
    code: 'PKT-2026-BUMN-0425',
    title: 'Konveyor Batubara 1.200 TPH + Belt Fire-Retardant',
    entity: 'PT Nusantara Tambang',
    cat: 'Capex Tambang',
    hpsIdr: 11800000000,
    bidIdr: 10940000000,
    tkdnPct: 45.8,
    vendors: 5,
    flags: 0,
    stage: 'Evaluasi HEA',
    doa: 'Tier 4',
    status: 'Evaluasi HEA',
    tone: 'info',
  },
  {
    code: 'PKT-2026-BUMN-0429',
    title: 'Kabel Konduktor ACSR 240 mm2 Saluran 150 kV',
    entity: 'PT Nusantara Transmisi',
    cat: 'Material Jaringan',
    hpsIdr: 6750000000,
    bidIdr: 6290000000,
    tkdnPct: 68.0,
    vendors: 8,
    flags: 0,
    stage: 'Penetapan SPPBJ',
    doa: 'Tier 3',
    status: 'SPPBJ Terbit',
    tone: 'ok',
  },
  {
    code: 'PKT-2026-BUMN-0431',
    title: 'Heat Exchanger Shell & Tube Grade Alloy 825',
    entity: 'PT Nusantara Kilang',
    cat: 'Capex Kilang',
    hpsIdr: 12450000000,
    bidIdr: 11610000000,
    tkdnPct: 42.1,
    vendors: 4,
    flags: 0,
    stage: 'Evaluasi HEA',
    doa: 'Tier 4',
    status: 'Evaluasi HEA',
    tone: 'info',
  },
  {
    code: 'PKT-2026-BUMN-0434',
    title: 'Sistem SCADA RTU & Proteksi Relay IEC 61850',
    entity: 'PT Nusantara Transmisi',
    cat: 'Otomasi OT',
    hpsIdr: 5200000000,
    bidIdr: 4890000000,
    tkdnPct: 41.5,
    vendors: 5,
    flags: 0,
    stage: 'Pembukaan Bid',
    doa: 'Tier 3',
    status: 'Terbuka Vault',
    tone: 'info',
  },
  {
    code: 'PKT-2026-BUMN-0437',
    title: 'Docking & Perawatan Berkala Tugboat 2x1800 HP',
    entity: 'PT Nusantara Logistik',
    cat: 'Jasa Maritim',
    hpsIdr: 3900000000,
    bidIdr: 3620000000,
    tkdnPct: 74.2,
    vendors: 6,
    flags: 0,
    stage: 'Penetapan SPPBJ',
    doa: 'Tier 3',
    status: 'SPPBJ Terbit',
    tone: 'ok',
  },
  {
    code: 'PKT-2026-BUMN-0440',
    title: 'Katalis Hydrotreating Unit CDU-IV Balikpapan',
    entity: 'PT Nusantara Kilang',
    cat: 'Bahan Baku',
    hpsIdr: 15800000000,
    bidIdr: 14950000000,
    tkdnPct: 35.4,
    vendors: 3,
    flags: 0,
    stage: 'Evaluasi HEA',
    doa: 'Tier 4',
    status: 'Evaluasi HEA',
    tone: 'info',
  },
  {
    code: 'PKT-2026-BUMN-0442',
    title: 'Lisensi Keamanan Siber SOC SIEM & HSM Vault',
    entity: 'Holding Korporat & TI',
    cat: 'TI & Siber',
    hpsIdr: 4400000000,
    bidIdr: 4120000000,
    tkdnPct: 43.0,
    vendors: 5,
    flags: 0,
    stage: 'Penetapan SPPBJ',
    doa: 'Tier 3',
    status: 'Disetujui DoA',
    tone: 'ok',
  },
  {
    code: 'PKT-2026-BUMN-0445',
    title: 'Pompa Sentrifugal API 610 + Motor Ex-Proof 450 kW',
    entity: 'PT Nusantara Kilang',
    cat: 'Capex Kilang',
    hpsIdr: 6150000000,
    bidIdr: null,
    tkdnPct: 40.0,
    vendors: 6,
    flags: 0,
    stage: 'Aanwijzing',
    doa: 'Tier 3',
    status: 'Tersegel Vault',
    tone: 'neutral',
  },
  {
    code: 'PKT-2026-BUMN-0448',
    title: 'Jasa Pengerukan Alur Jetty Batubara 450.000 m3',
    entity: 'PT Nusantara Logistik',
    cat: 'Jasa Maritim',
    hpsIdr: 8200000000,
    bidIdr: null,
    tkdnPct: 65.0,
    vendors: 5,
    flags: 0,
    stage: 'Aanwijzing',
    doa: 'Tier 3',
    status: 'Tersegel Vault',
    tone: 'neutral',
  },
  {
    code: 'PKT-2026-BUMN-0451',
    title: 'Boiler Feed Pump Mechanical Seal & Instrumentation',
    entity: 'PT Nusantara Pembangkitan',
    cat: 'Suku Cadang',
    hpsIdr: 3150000000,
    bidIdr: null,
    tkdnPct: 41.0,
    vendors: 4,
    flags: 0,
    stage: 'Aanwijzing',
    doa: 'Tier 3',
    status: 'Aanwijzing',
    tone: 'neutral',
  },
  {
    code: 'PKT-2026-BUMN-0454',
    title: 'Rehabilitasi Jalan Hauling Tambang 18 km + Drainase',
    entity: 'PT Nusantara Tambang',
    cat: 'Sipil Tambang',
    hpsIdr: 7400000000,
    bidIdr: null,
    tkdnPct: 78.5,
    vendors: 9,
    flags: 0,
    stage: 'Prakualifikasi',
    doa: 'Tier 3',
    status: 'Verifikasi KYC',
    tone: 'neutral',
  },
  {
    code: 'PKT-2026-BUMN-0458',
    title: 'Migrasi Core ERP SAP S/4HANA & Integrasi CoreTax',
    entity: 'Holding Korporat & TI',
    cat: 'TI & ERP',
    hpsIdr: 6850000000,
    bidIdr: null,
    tkdnPct: 58.0,
    vendors: 4,
    flags: 0,
    stage: 'Prakualifikasi',
    doa: 'Tier 3',
    status: 'Verifikasi KYC',
    tone: 'neutral',
  },
];

// Derived Entity Rollups (Guaranteed equal to PACKAGES!)
const ENTITY_ORDER = [
  { name: 'PT Nusantara Pembangkitan', rkapIdr: 26000000000 },
  { name: 'PT Nusantara Transmisi', rkapIdr: 34000000000 },
  { name: 'PT Nusantara Kilang', rkapIdr: 38000000000 },
  { name: 'PT Nusantara Tambang', rkapIdr: 32000000000 },
  { name: 'PT Nusantara Logistik', rkapIdr: 16000000000 },
  { name: 'Holding Korporat & TI', rkapIdr: 14000000000 },
];

const ENTITIES = ENTITY_ORDER.map((e) => {
  const pkgs = PACKAGES.filter((p) => p.entity === e.name);
  const hpsIdr = pkgs.reduce((a, p) => a + p.hpsIdr, 0);
  const avgTkdn = pkgs.reduce((a, p) => a + p.tkdnPct, 0) / pkgs.length;
  const flags = pkgs.reduce((a, p) => a + p.flags, 0);
  const pctRkap = (hpsIdr / e.rkapIdr) * 100;
  return { ...e, count: pkgs.length, hpsIdr, avgTkdn, flags, pctRkap };
});

// 15 Vendor Master Registry for P6
const VENDOR_MASTER = [
  { code: 'VND-01', name: 'PT Traktor Nusantara Prima', nib: '9120208411902', npwp: '0013489210091000', pkp: 'PKP Aktif', tkdn: 44.2, valid: 'Apr 2029', lkpp: 'Bersih', limitM: 25, status: 'Terverifikasi', tone: 'ok', selected: true },
  { code: 'VND-02', name: 'PT Daya Energi Mandiri', nib: '9120105398124', npwp: '0024918230072000', pkp: 'PKP Aktif', tkdn: 41.0, valid: 'Mei 2029', lkpp: 'Bersih', limitM: 20, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-03', name: 'CV Karya Teknik Bersama', nib: '9120309921451', npwp: '0038124510044000', pkp: 'PKP Aktif', tkdn: 38.5, valid: 'Des 2026', lkpp: 'Bersih', limitM: 6, status: 'NIB < 30 Hari', tone: 'warn' },
  { code: 'VND-04', name: 'PT Sinar Jaya Elektrika', nib: '9120206714008', npwp: '0049201180015000', pkp: 'PKP Aktif', tkdn: 40.8, valid: 'Mar 2028', lkpp: 'Tahan SPI', limitM: 12, status: 'Ditahan Audit', tone: 'bad' },
  { code: 'VND-05', name: 'PT Cahaya Mandiri Teknik', nib: '9120206714099', npwp: '0049201940015000', pkp: 'PKP Aktif', tkdn: 40.4, valid: 'Mar 2028', lkpp: 'Tahan SPI', limitM: 10, status: 'Ditahan Audit', tone: 'bad' },
  { code: 'VND-06', name: 'PT Barata Industri Persero', nib: '9120001120491', npwp: '0010023140093000', pkp: 'PKP Aktif', tkdn: 62.4, valid: 'Okt 2029', lkpp: 'Bersih', limitM: 80, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-07', name: 'PT Trafoindo Prima Perkasa', nib: '9120104481203', npwp: '0014829100051000', pkp: 'PKP Aktif', tkdn: 54.8, valid: 'Agu 2029', lkpp: 'Bersih', limitM: 60, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-08', name: 'PT Kabelindo Murni Tbk', nib: '9120003389104', npwp: '0012940010038000', pkp: 'PKP Aktif', tkdn: 71.2, valid: 'Jan 2030', lkpp: 'Bersih', limitM: 50, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-09', name: 'PT Bukit Makmur Mandiri', nib: '9120107741298', npwp: '0019283740062000', pkp: 'PKP Aktif', tkdn: 64.0, valid: 'Jul 2029', lkpp: 'Bersih', limitM: 45, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-10', name: 'PT Dok & Perkapalan Kodja', nib: '9120002219405', npwp: '0011204890084000', pkp: 'PKP Aktif', tkdn: 76.5, valid: 'Nov 2029', lkpp: 'Bersih', limitM: 40, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-11', name: 'PT Rekayasa Otomasi Nusantara', nib: '9120209918231', npwp: '0028471920049000', pkp: 'PKP Aktif', tkdn: 43.6, valid: 'Jun 2029', lkpp: 'Bersih', limitM: 18, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-12', name: 'PT Krakatau Engineering', nib: '9120004419283', npwp: '0013849200077000', pkp: 'PKP Aktif', tkdn: 58.2, valid: 'Sep 2029', lkpp: 'Bersih', limitM: 75, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-13', name: 'PT Petrokimia Katalis ID', nib: '9120108847219', npwp: '0021948370055000', pkp: 'PKP Aktif', tkdn: 37.8, valid: 'Des 2026', lkpp: 'Bersih', limitM: 30, status: 'TKDN < 30 Hari', tone: 'warn' },
  { code: 'VND-14', name: 'PT Len Industri Siber', nib: '9120005519204', npwp: '0015928340081000', pkp: 'PKP Aktif', tkdn: 49.4, valid: 'Feb 2030', lkpp: 'Bersih', limitM: 35, status: 'Terverifikasi', tone: 'ok' },
  { code: 'VND-15', name: 'PT Mitra Pompa Industri', nib: '9120203349182', npwp: '0027491820066000', pkp: 'PKP Aktif', tkdn: 42.5, valid: 'Okt 2028', lkpp: 'Bersih', limitM: 22, status: 'Terverifikasi', tone: 'ok' },
];

// WAPU BUMN Tax & PSAK Journal Math for VND-01 PO Draft 4500198422
const PO_DPP = GENSET_VENDORS[0].bidIdr; // 4.580.000.000
const PO_PPN_WAPU = Math.round(PO_DPP * 0.11); // 503.800.000
const PO_PPH22 = Math.round(PO_DPP * 0.015); // 68.700.000
const PO_GROSS = PO_DPP + PO_PPN_WAPU; // 5.083.800.000
const PO_NET_VENDOR = PO_DPP - PO_PPH22; // 4.511.300.000

const PSAK_JOURNAL = [
  { acc: '1401-0210', label: 'Aset Dalam Penyelesaian — Genset 1500 kVA', dr: PO_DPP, cr: 0 },
  { acc: '1152-0110', label: 'PPN Masukan WAPU BUMN (11% · Faktur 030)', dr: PO_PPN_WAPU, cr: 0 },
  { acc: '2110-0014', label: 'Utang Usaha Vendor — PT Traktor Nusantara Prima', dr: 0, cr: PO_NET_VENDOR },
  { acc: '2131-0300', label: 'Utang PPN WAPU BUMN (Setor Kas Negara CoreTax)', dr: 0, cr: PO_PPN_WAPU },
  { acc: '2132-0220', label: 'Utang PPh Pasal 22 BUMN (1,5% · Bukti Potong)', dr: 0, cr: PO_PPH22 },
];

// Totals & KPIs
const TOTAL_PACKAGES = PACKAGES.length;
const TOTAL_HPS = PACKAGES.reduce((a, p) => a + p.hpsIdr, 0);
const TOTAL_RKAP = ENTITIES.reduce((a, e) => a + e.rkapIdr, 0);
const OPENED_PKGS = PACKAGES.filter((p) => p.bidIdr !== null);
const OPENED_HPS = OPENED_PKGS.reduce((a, p) => a + p.hpsIdr, 0);
const OPENED_BID = OPENED_PKGS.reduce((a, p) => a + p.bidIdr, 0);
const EFFICIENCY_SAVING = OPENED_HPS - OPENED_BID;
const EFFICIENCY_PCT = (EFFICIENCY_SAVING / OPENED_HPS) * 100;
const AVG_TKDN = PACKAGES.reduce((a, p) => a + p.tkdnPct, 0) / PACKAGES.length;
const TOTAL_FLAGS = PACKAGES.reduce((a, p) => a + p.flags, 0);

// Stage Counts for Kanban (must sum to TOTAL_PACKAGES)
const STAGES = [
  { key: 'Prakualifikasi', label: 'Prakualifikasi KYC', tone: 'neutral' },
  { key: 'Aanwijzing', label: 'Aanwijzing & Vault', tone: 'neutral' },
  { key: 'Pembukaan Bid', label: 'Pembukaan Sealed Bid', tone: 'bad' },
  { key: 'Evaluasi HEA', label: 'Evaluasi HEA TKDN', tone: 'info' },
  { key: 'Penetapan SPPBJ', label: 'SPPBJ & Masa Sanggah', tone: 'ok' },
].map((st) => ({
  ...st,
  items: PACKAGES.filter((p) => p.stage === st.key),
}));

// ============================================================================
// PROGRAMMATIC MATH VERIFICATION GATE
// ============================================================================
export function verifyMath() {
  if (TOTAL_PACKAGES !== 16) throw new Error(`Expected 16 packages, got ${TOTAL_PACKAGES}`);

  const entityHpsSum = ENTITIES.reduce((a, e) => a + e.hpsIdr, 0);
  if (entityHpsSum !== TOTAL_HPS) {
    throw new Error(`Entity HPS sum ${entityHpsSum} != TOTAL_HPS ${TOTAL_HPS}`);
  }
  const entityPkgSum = ENTITIES.reduce((a, e) => a + e.count, 0);
  if (entityPkgSum !== TOTAL_PACKAGES) {
    throw new Error(`Entity package count ${entityPkgSum} != ${TOTAL_PACKAGES}`);
  }
  const stagePkgSum = STAGES.reduce((a, s) => a + s.items.length, 0);
  if (stagePkgSum !== TOTAL_PACKAGES) {
    throw new Error(`Kanban stage sum ${stagePkgSum} != ${TOTAL_PACKAGES}`);
  }

  // Verify Focus Package BoQ sums
  const boqHps = BOQ_ITEMS.reduce((a, b) => a + b.hps, 0);
  const boqV1 = BOQ_ITEMS.reduce((a, b) => a + b.v1, 0);
  const boqV4 = BOQ_ITEMS.reduce((a, b) => a + b.v4, 0);
  const boqV5 = BOQ_ITEMS.reduce((a, b) => a + b.v5, 0);
  if (boqHps !== FOCUS_HPS) throw new Error(`BoQ HPS ${boqHps} != ${FOCUS_HPS}`);
  if (boqV1 !== GENSET_VENDORS[0].bidIdr) throw new Error(`BoQ V1 ${boqV1} != ${GENSET_VENDORS[0].bidIdr}`);
  if (boqV4 !== GENSET_VENDORS[3].bidIdr) throw new Error(`BoQ V4 ${boqV4} != ${GENSET_VENDORS[3].bidIdr}`);
  if (boqV5 !== GENSET_VENDORS[4].bidIdr) throw new Error(`BoQ V5 ${boqV5} != ${GENSET_VENDORS[4].bidIdr}`);

  // Verify technical scores & HEA math
  if (GENSET_VENDORS[0].techScore !== 92) throw new Error(`VND-01 techScore=${GENSET_VENDORS[0].techScore}`);
  if (GENSET_VENDORS[1].techScore !== 88) throw new Error(`VND-02 techScore=${GENSET_VENDORS[1].techScore}`);
  if (GENSET_VENDORS[0].heaIdr !== 4073910000) throw new Error(`VND-01 HEA=${GENSET_VENDORS[0].heaIdr}`);
  if (GENSET_VENDORS[1].heaIdr !== 4227225000) throw new Error(`VND-02 HEA=${GENSET_VENDORS[1].heaIdr}`);
  if (GENSET_VENDORS[0].finalScore !== 95.2) throw new Error(`VND-01 final=${GENSET_VENDORS[0].finalScore}`);
  if (GENSET_VENDORS[1].finalScore !== 91.35) throw new Error(`VND-02 final=${GENSET_VENDORS[1].finalScore}`);

  // Verify PSAK double-entry journal balance
  const sumDr = PSAK_JOURNAL.reduce((a, j) => a + j.dr, 0);
  const sumCr = PSAK_JOURNAL.reduce((a, j) => a + j.cr, 0);
  if (sumDr !== sumCr || sumDr !== PO_GROSS) {
    throw new Error(`PSAK Journal unbalanced: Dr=${sumDr} Cr=${sumCr} Gross=${PO_GROSS}`);
  }

  // Verify vendor registry statuses
  const vOk = VENDOR_MASTER.filter((v) => v.tone === 'ok').length;
  const vWarn = VENDOR_MASTER.filter((v) => v.tone === 'warn').length;
  const vBad = VENDOR_MASTER.filter((v) => v.tone === 'bad').length;
  if (vOk + vWarn + vBad !== 15 || vOk !== 11 || vWarn !== 2 || vBad !== 2) {
    throw new Error(`Vendor registry counts mismatch: ${vOk}/${vWarn}/${vBad}`);
  }
}

// ============================================================================
// SHARED SAP S/4HANA FIORI HORIZON + ARIBA ENTERPRISE SHELL
// ============================================================================

const MODULE_TABS = [
  { id: 'p1', label: 'Cockpit RKAP', icon: 'activity', cnt: '16' },
  { id: 'p2', label: 'Daftar Tender', icon: 'layers', cnt: '16' },
  { id: 'p3', label: 'RSA Bid Vault', icon: 'lock', cnt: '5 Bid' },
  { id: 'p4', label: 'Anti-Kolusi', icon: 'alert', cnt: '3', warn: true },
  { id: 'p5', label: 'Skoring & HEA TKDN', icon: 'sliders', cnt: '44,2%' },
  { id: 'p6', label: 'KYC Vendor & ERP/Tax', icon: 'database', cnt: '15' },
  { id: 'p7', label: 'DoA & Elsa Workflow', icon: 'gitBranch', cnt: 'Tier 3' },
  { id: 'p8', label: 'Audit BPK & Portal', icon: 'shield', cnt: 'WORM' },
];

const EXTRA_CSS = `
  /* SAP Fiori Horizon Inspired GovTech Shell — Brand #1f4e5f */
  .f-topbar {
    height: 36px;
    background: #143440;
    color: #f1f5f9;
    border-bottom: 1px solid #0e2630;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-top-l, .f-top-r {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .f-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 12.5px;
    color: #ffffff;
    white-space: nowrap;
  }
  .f-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #1f4e5f;
    border: 1px solid #3c7d94;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .f-pill-dark {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #1c4454;
    border: 1px solid #2f6275;
    color: #e2eff3;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-pill-hsm {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #0d3b2e;
    border: 1px solid #16654e;
    color: #86efac;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-search {
    height: 23px;
    width: 268px;
    padding: 0 8px;
    border-radius: 3px;
    background: #0e2630;
    border: 1px solid #2b5768;
    color: #9bb8c2;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  /* Horizontal Fiori Module Tab Strip */
  .f-modbar {
    height: 32px;
    background: #ffffff;
    border-bottom: 1px solid #cfd8dc;
    padding: 0 12px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .f-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
  }
  .f-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .f-tab.is-active {
    color: #143440;
    font-weight: 700;
    border-bottom-color: #1f4e5f;
    background: #f2f7f9;
  }
  .f-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 4.5px;
    border-radius: 2px;
    background: #eef2f5;
    color: #475569;
    font-weight: 700;
  }
  .f-tab.is-active .f-tab-cnt {
    background: #1f4e5f;
    color: #ffffff;
  }
  .f-tab-cnt.is-warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  /* Context Object Bar */
  .f-objbar {
    height: 36px;
    background: #f7f9fa;
    border-bottom: 1px solid #d5dde0;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-obj-l, .f-obj-r {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .f-obj-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
  }
  .f-obj-meta {
    font-size: 10.5px;
    color: #475569;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  /* Main Canvas Workspace: exact 872px height */
  .f-main {
    flex: 1;
    min-height: 0;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* Utility layouts */
  .f-grid { display: grid; gap: 9px; min-height: 0; min-width: 0; }
  .f-col { display: flex; flex-direction: column; gap: 9px; min-height: 0; min-width: 0; }
  .f-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .f-between { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }

  .f-kv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4.5px 0;
    border-bottom: 1px solid #edf1f4;
    font-size: 10.6px;
    gap: 8px;
  }
  .f-kv:last-child { border-bottom: 0; }
  .f-kv-k { color: #52636d; font-weight: 500; }
  .f-kv-v { color: #0f172a; font-weight: 600; text-align: right; }

  .f-alert-strip {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-left: 3px solid #be123c;
    border-radius: 3px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-info-strip {
    background: #eef5f7;
    border: 1px solid #bdd4dc;
    border-left: 3px solid #1f4e5f;
    border-radius: 3px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-code-box {
    background: #0f1f26;
    color: #d6e8ee;
    border: 1px solid #203b46;
    border-radius: 3px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    line-height: 1.42;
    overflow: hidden;
  }
  .f-kanban-col {
    background: #f6f8f9;
    border: 1px solid #dce3e6;
    border-radius: 3px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    overflow: hidden;
  }
  .f-kanban-card {
    background: #ffffff;
    border: 1px solid #d5dde0;
    border-radius: 3px;
    padding: 5px 6px;
    display: flex;
    flex-direction: column;
    gap: 2.5px;
  }
  .f-step {
    background: #ffffff;
    border: 1px solid #d5dde0;
    border-radius: 3px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
  }
  .f-step.is-done { border-top: 2.5px solid #047857; }
  .f-step.is-active { border-top: 2.5px solid #b45309; background: #fffdf7; }
  .f-step.is-wait { border-top: 2.5px solid #94a3b8; background: #f8fafb; }
  .f-phone {
    width: 316px;
    border: 2px solid #143440;
    border-radius: 8px;
    background: #f4f6f7;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  table.e-table.p2-dense td { padding: 7.2px 7px; }
  table.e-table.p6-dense td { padding: 7.4px 7px; }
  table.e-table.p8-dense td { padding: 5.5px 7px; }
`;

function fmtMiliar(n) {
  return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
}

function fmtJuta(n) {
  return 'Rp ' + fmtNum(n / 1e6) + ' Jt';
}

function renderShell({ activeTab, objTitle, objMetaHtml, actionsHtml, contentHtml }) {
  const tabsHtml = MODULE_TABS.map((t) => {
    const active = t.id === activeTab;
    return `<div class="f-tab ${active ? 'is-active' : ''}">
      ${ic(t.icon, 12.5, active ? '#1f4e5f' : '#64748b')}
      <span>${esc(t.label)}</span>
      <span class="f-tab-cnt ${t.warn ? 'is-warn' : ''}">${esc(t.cnt)}</span>
    </div>`;
  }).join('');

  const bodyHtml = `
    <header class="f-topbar">
      <div class="f-top-l">
        <div class="f-brand">
          <span class="f-mark">eT</span>
          <span>eTender BUMN</span>
        </div>
        <span class="e-env-pill" style="background:#103c4a;border-color:#2c697d;color:#93d6eb;">PROD-BUMN · INAPROC</span>
        <div class="f-pill-dark">
          ${ic('layers', 11.5, '#7cc4d9')}
          <span>PT Nusantara Energi Holding (Persero)</span>
          ${ic('chevronDown', 11, '#94a3b8')}
        </div>
        <div class="f-pill-dark">
          ${ic('clock', 11, '#94a3b8')}
          <span class="mono">TA 2026 · Q4 · RKAP-P</span>
        </div>
        <div class="f-search">
          <span class="f-row" style="gap:5px;">
            ${ic('search', 11.5, '#7fa0ad')}
            <span class="trunc">Cari paket RUP, kode tender, NIB OSS-RBA, NPWP...</span>
          </span>
          <span class="e-kbd">Ctrl+K</span>
        </div>
      </div>
      <div class="f-top-r">
        <div class="f-pill-hsm">
          <span class="dot dot-ok"></span>
          <span>RSA-4096 HSM · TERSEGEL</span>
        </div>
        <div class="e-user-chip" style="border-left-color:#265263;">
          <span class="e-avatar" style="background:#1f4e5f;border:1px solid #488ea6;">HD</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.3px;font-weight:700;color:#ffffff;">Ir. H. Darmawan</div>
            <div style="font-size:8.8px;color:#9bb8c2;">Ketua Pokja Pengadaan</div>
          </div>
        </div>
      </div>
    </header>

    <nav class="f-modbar">
      <div class="f-tabs">${tabsHtml}</div>
      <div class="f-row" style="font-size:10px;color:#52636d;">
        <span class="mono">NTP Stratum-1: 22 Nov 2026 10:04:18 WIB</span>
      </div>
    </nav>

    <section class="f-objbar">
      <div class="f-obj-l">
        <span class="f-obj-title">${esc(objTitle)}</span>
        <span style="color:#b8c6cb;">|</span>
        <div class="f-obj-meta">${objMetaHtml}</div>
      </div>
      <div class="f-obj-r">${actionsHtml}</div>
    </section>

    <main class="f-main">${contentHtml}</main>

    ${renderStatusFooter({
      leftItems: [
        '<span class="dot dot-ok"></span><span>.NET 9 Core API · PostgreSQL 16 + Encrypted Bid Blobs</span>',
        '<span>Elsa Workflow 3.2: 16 Paket Aktif</span>',
        '<span>OSS-RBA · P3DN · CoreTax · SAP RFC: OK</span>',
      ],
      rightItems: [
        '<span>WORM SHA-256 Chain: 0x8c4e...a91f (Terverifikasi)</span>',
        '<span>Kepatuhan: Perpres 16/2018 · PER-2/MBU/2023</span>',
      ],
    })}
  `;

  return wrapEnterpriseHtml({
    title: `eTender BUMN — ${objTitle}`,
    accent: '#1f4e5f',
    accentSoft: '#e6f0f3',
    accentInk: '#143440',
    bg: '#f2f5f6',
    surface: '#ffffff',
    surface2: '#f7f9fa',
    border: '#d5dde0',
    borderStrong: '#b8c6cb',
    text: '#0f172a',
    text2: '#3f515b',
    muted: '#5c6f7a',
    extraCss: EXTRA_CSS,
    bodyHtml,
  });
}

// ============================================================================
// PAGE 1: COCKPIT PENGADAAN & PAGU RKAP BUMN
// ============================================================================
function renderP1() {
  const kpiStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Paket Tender Aktif</span>${badge('6 Entitas', 'accent')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${TOTAL_PACKAGES} paket</span>
          ${svgSparkline({ points: [9, 11, 12, 14, 13, 15, 16], color: '#1f4e5f' })}
        </div>
        <div class="e-kpi-foot"><span>11 Terbuka · 5 Tersegel/KYC</span><span class="mono">TA 2026 Q4</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Pagu HPS Terdaftar</span>${badge(fmtPct((TOTAL_HPS / TOTAL_RKAP) * 100) + ' RKAP', 'info')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtMiliar(TOTAL_HPS)}</span>
          ${svgSparkline({ points: [92, 101, 110, 118, 125, 134, 139.7], color: '#0369a1' })}
        </div>
        <div class="e-kpi-foot"><span>Pagu RKAP Grup: ${fmtMiliar(TOTAL_RKAP)}</span><span class="mono">100% RUP</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Efisiensi Realisasi vs HPS</span>${badge('Hemat ' + fmtPct(EFFICIENCY_PCT), 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#047857;">${fmtMiliar(EFFICIENCY_SAVING)}</span>
          ${svgSparkline({ points: [4.2, 5.1, 5.8, 6.2, 6.0, 6.5, 6.6], color: '#047857' })}
        </div>
        <div class="e-kpi-foot"><span>11 Paket Terbuka (${fmtMiliar(OPENED_BID)})</span><span class="mono">Target ≥ 5%</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rata-Rata Capaian TKDN</span>${badge('Syarat ≥ 40%', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtPct(AVG_TKDN)}</span>
          ${svgSparkline({ points: [46.2, 47.8, 49.0, 50.1, 51.4, 52.8, 53.4], color: '#1f4e5f' })}
        </div>
        <div class="e-kpi-foot"><span>P3DN Kemenperin Terverifikasi</span><span class="mono">15/16 Lolos</span></div>
      </div>
      <div class="e-kpi" style="border-color:#fecdd3;background:#fffafa;">
        <div class="e-kpi-top"><span style="color:#be123c;">Bendera Anti-Kolusi Aktif</span>${badge('Eskalasi SPI', 'bad')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#be123c;">${TOTAL_FLAGS} kasus</span>
          ${svgSparkline({ points: [0, 1, 1, 0, 2, 2, 3], color: '#be123c' })}
        </div>
        <div class="e-kpi-foot"><span>2 di PKT-0418 · 1 di PKT-0421</span><span class="mono">Tahan Audit</span></div>
      </div>
    </div>
  `;

  const trendChart = svgMultiLineChart({
    width: 905,
    height: 238,
    xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
    yMin: 0,
    yMax: 24,
    yTicks: 4,
    yFormat: (v) => `Rp ${v} M`,
    threshold: { value: 16, label: 'Target Penyerapan Bulanan Rp 16 M', color: '#1f4e5f' },
    series: [
      { label: 'Pagu HPS Diterbitkan (Rp M)', color: '#1f4e5f', values: [9.4, 11.2, 13.8, 12.6, 15.4, 17.8, 16.2, 18.9, 19.6, 21.4, 22.8], area: true, dots: true },
      { label: 'Realisasi Penawaran Terendah (Rp M)', color: '#047857', values: [8.8, 10.5, 12.9, 11.8, 14.3, 16.5, 15.1, 17.6, 18.2, 19.9, 21.3], dots: true },
      { label: 'Efisiensi Akumulasi Bulanan (Rp M)', color: '#b45309', values: [0.6, 0.7, 0.9, 0.8, 1.1, 1.3, 1.1, 1.3, 1.4, 1.5, 1.5], dashed: true },
    ],
    annotations: [
      { index: 10, seriesIdx: 0, label: 'Puncak Q4: 16 Paket Aktif', color: '#1f4e5f', dy: -24 },
    ],
  });

  const entityRows = ENTITIES.map((e) => `
    <tr>
      <td style="font-weight:600;">${esc(e.name)}</td>
      <td class="num mono">${e.count}</td>
      <td class="num mono">${fmtMiliar(e.hpsIdr)}</td>
      <td class="num mono">${fmtMiliar(e.rkapIdr)}</td>
      <td>${renderCapacityBar(e.pctRkap, { warnAt: 85, critAt: 95 })}</td>
      <td class="num mono" style="color:#047857;font-weight:600;">${fmtPct(e.avgTkdn)}</td>
      <td class="num">${e.flags > 0 ? badge(e.flags + ' Flag', 'bad') : badge('Bersih', 'ok')}</td>
    </tr>
  `).join('');

  const kanbanCols = STAGES.map((st) => `
    <div class="f-kanban-col">
      <div class="f-between" style="padding-bottom:3px;border-bottom:1px solid #d5dde0;">
        <span style="font-size:9.8px;font-weight:700;color:#143440;" class="trunc">${esc(st.label)}</span>
        ${badge(String(st.items.length), st.tone)}
      </div>
      ${st.items
        .slice(0, 3)
        .map(
          (p) => `<div class="f-kanban-card" style="${p.selected ? 'border-color:#1f4e5f;background:#eef5f7;' : ''}">
          <div class="f-between">
            <span class="mono" style="font-size:9px;font-weight:700;color:#1f4e5f;">${esc(p.code.replace('PKT-2026-BUMN-', 'PKT-'))}</span>
            <span class="mono" style="font-size:9px;font-weight:700;">${fmtMiliar(p.hpsIdr)}</span>
          </div>
          <div class="trunc" style="font-size:9.8px;font-weight:600;color:#0f172a;">${esc(p.title)}</div>
          <div class="f-between" style="font-size:9px;color:#52636d;">
            <span>TKDN ${fmtPct(p.tkdnPct)}</span>
            ${p.flags > 0 ? '<span style="color:#be123c;font-weight:700;">Flag ' + p.flags + '</span>' : '<span>' + p.vendors + ' vendor</span>'}
          </div>
        </div>`
        )
        .join('')}
      ${st.items.length > 3 ? `<div style="font-size:9.2px;color:#52636d;text-align:center;font-weight:600;">+${st.items.length - 3} paket lainnya</div>` : ''}
    </div>
  `).join('');

  const vaultSchedule = [
    { code: 'PKT-0418', title: 'Genset 1500 kVA Prime Power', time: '10:00 WIB', quorum: '3/5 Kunci', status: 'Dibuka', tone: 'ok' },
    { code: 'PKT-0421', title: 'Sewa Armada Dump Truck 40T', time: '11:30 WIB', quorum: '3/5 Kunci', status: 'Dibuka', tone: 'ok' },
    { code: 'PKT-0434', title: 'SCADA RTU & Relay IEC 61850', time: '14:00 WIB', quorum: '3/5 Kunci', status: 'Siap Buka', tone: 'info' },
    { code: 'PKT-0445', title: 'Pompa Sentrifugal API 610', time: '23 Nov 09:00', quorum: '0/5 Kunci', status: 'Tersegel', tone: 'neutral' },
    { code: 'PKT-0448', title: 'Pengerukan Alur Jetty 450k m3', time: '24 Nov 10:00', quorum: '0/5 Kunci', status: 'Tersegel', tone: 'neutral' },
    { code: 'PKT-0451', title: 'Boiler Feed Pump Mech Seal', time: '25 Nov 09:30', quorum: '0/5 Kunci', status: 'Tersegel', tone: 'neutral' },
  ];

  const complianceAlerts = [
    { sev: 'KRITIS', tone: 'bad', code: 'AC-089', text: 'PKT-0418: VND-04 & VND-05 IP unggah 103.144.82.19 + metadata PDF identik.' },
    { sev: 'TINGGI', tone: 'warn', code: 'AC-091', text: 'PKT-0421: Indikasi kesamaan pengurus AHU pada 2 peserta sewa armada.' },
    { sev: 'SEDANG', tone: 'warn', code: 'HPS-03', text: 'PKT-0418: CV Karya Teknik Bersama (VND-03) melewati pagu HPS (+1,4%).' },
    { sev: 'INFO', tone: 'info', code: 'OSS-12', text: '2 vendor (VND-03, VND-13) sertifikat NIB/TKDN habis masa berlaku Des 2026.' },
    { sev: 'AUDIT', tone: 'ok', code: 'BPK-26', text: 'Seluruh 16 paket tersinkronisasi WORM SHA-256 & siap ekspor audit BPK.' },
  ];

  const contentHtml = `
    ${kpiStrip}
    <div class="f-grid" style="grid-template-columns:928px 1fr;height:368px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#1f4e5f')}<span>Tren Pagu HPS vs Realisasi Penawaran & Efisiensi Pengadaan (Jan–Nov 2026)</span></div>
          <div class="f-row">${badge('Efisiensi Kumulatif ' + fmtPct(EFFICIENCY_PCT), 'ok')}${badge('Target BUMN ≥ 5,0%', 'neutral')}</div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
          ${trendChart}
          <div class="f-grid" style="grid-template-columns:repeat(4,1fr);padding-top:6px;border-top:1px solid #e6ebf1;">
            <div>
              <div style="font-size:9.5px;color:#5c6f7a;">Total HPS 11 Paket Terbuka</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;">${fmtIdr(OPENED_HPS)}</div>
            </div>
            <div>
              <div style="font-size:9.5px;color:#5c6f7a;">Total Penawaran Terendah</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#1f4e5f;">${fmtIdr(OPENED_BID)}</div>
            </div>
            <div>
              <div style="font-size:9.5px;color:#5c6f7a;">Penghematan Negara (HPS-Bid)</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">${fmtIdr(EFFICIENCY_SAVING)}</div>
            </div>
            <div>
              <div style="font-size:9.5px;color:#5c6f7a;">Rata-rata Peserta / Paket</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;">${(PACKAGES.reduce((a, p) => a + p.vendors, 0) / TOTAL_PACKAGES).toFixed(1).replace('.', ',')} vendor</div>
            </div>
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#1f4e5f')}<span>Penyerapan Pagu RKAP & TKDN per Anak Perusahaan</span></div>
          <span class="e-panel-sub">6 Entitas Holding</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:27%;">Entitas Anak Usaha</th>
                <th class="num" style="width:6%;">Pkt</th>
                <th class="num" style="width:14%;">HPS Aktif</th>
                <th class="num" style="width:14%;">RKAP</th>
                <th style="width:19%;">Serapan</th>
                <th class="num" style="width:10%;">TKDN</th>
                <th class="num" style="width:10%;">Audit</th>
              </tr>
            </thead>
            <tbody>${entityRows}</tbody>
            <tfoot>
              <tr>
                <td>Total Konsolidasi Holding</td>
                <td class="num mono">${TOTAL_PACKAGES}</td>
                <td class="num mono">${fmtMiliar(TOTAL_HPS)}</td>
                <td class="num mono">${fmtMiliar(TOTAL_RKAP)}</td>
                <td class="mono">${fmtPct((TOTAL_HPS / TOTAL_RKAP) * 100)}</td>
                <td class="num mono">${fmtPct(AVG_TKDN)}</td>
                <td class="num mono" style="color:#be123c;">${TOTAL_FLAGS} Flag</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:8px 11px;font-size:10.2px;color:#475569;background:#f8fafb;border-top:1px solid #e6ebf1;margin-top:auto;">
            <div class="f-between">
              <span><strong>Kepatuhan P3DN Grup:</strong> Seluruh entitas melampaui target minimum TKDN BUMN 40,0% kecuali paket katalis kilang khusus (35,4% — dispensasi Kemenperin).</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="f-grid" style="grid-template-columns:760px 410px 1fr;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('gitBranch', 13, '#1f4e5f')}<span>Kanban Alur Pengadaan Tertutup (16 Paket Aktif)</span></div>
          <span class="e-panel-sub">Elsa Workflow State Engine</span>
        </div>
        <div class="e-panel-body">
          <div class="f-grid" style="grid-template-columns:repeat(5,1fr);height:100%;gap:6px;">
            ${kanbanCols}
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#1f4e5f')}<span>Jadwal Pembukaan Vault RSA-4096</span></div>
          ${badge('Quorum 3-of-5', 'accent')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:18%;">Kode</th>
                <th style="width:36%;">Nama Paket</th>
                <th style="width:26%;">Jadwal WIB</th>
                <th style="width:20%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${vaultSchedule
                .map(
                  (v, idx) => `<tr class="${idx === 0 ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(v.code)}</td>
                  <td class="trunc" style="font-weight:600;">${esc(v.title)}</td>
                  <td class="mono">${esc(v.time)}</td>
                  <td>${badge(v.status, v.tone)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:8px 10px;margin-top:auto;background:#eef5f7;border-top:1px solid #d5dde0;font-size:10px;color:#143440;">
            <strong>Catatan HSM:</strong> Kunci privat RSA tidak pernah keluar dari modul FIPS 140-3 Level 3 sebelum waktu NTP Stratum-1 tercapai.
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('alert', 13, '#be123c')}<span>Antrean Peringatan Tata Kelola & BPK</span></div>
          ${badge('5 Item', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
          ${complianceAlerts
            .map(
              (a) => `<div style="display:flex;align-items:flex-start;gap:7px;padding:5.5px 7px;border:1px solid #e2e8f0;border-radius:3px;background:${a.tone === 'bad' ? '#fffafa' : '#ffffff'};">
              <div style="flex-shrink:0;">${badge(a.sev, a.tone)}</div>
              <div style="min-width:0;font-size:10.2px;line-height:1.32;color:#1e293b;">
                <span class="mono" style="font-weight:700;color:#143440;">[${esc(a.code)}]</span> ${esc(a.text)}
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p1',
    objTitle: 'Cockpit Eksekutif Pengadaan & Tata Kelola RKAP BUMN',
    objMetaHtml: `${badge('TA 2026 Q4', 'accent')}<span>6 Anak Perusahaan · 16 Paket Aktif · Total HPS ${fmtMiliar(TOTAL_HPS)}</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('download', 11.5)}Ekspor Laporan BPK</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11.5, '#fff')}Buka Ruang Vault RSA</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: MEJA KERJA TENDER & MATRIKS EVALUASI TKDN (16-ROW GRID + INSPECTOR)
// ============================================================================
function renderP2() {
  const filterBar = `
    <div class="e-panel" style="flex-direction:row;align-items:center;justify-content:space-between;padding:6px 10px;height:38px;flex-shrink:0;">
      <div class="f-row" style="gap:7px;">
        <span style="font-size:10.5px;font-weight:700;color:#143440;">${ic('filter', 12, '#1f4e5f')} Filter Aktif:</span>
        ${badge('Entitas: Semua Holding (6)', 'accent')}
        ${badge('Tahun Anggaran: 2026', 'neutral')}
        ${badge('Syarat TKDN: ≥ 40%', 'neutral')}
        ${badge('Status Vault: Terbuka & Tersegel', 'neutral')}
        ${badge('Flag Kolusi: 3 Temuan', 'bad')}
      </div>
      <div class="f-row" style="font-size:10.2px;color:#52636d;">
        <span class="mono">Menampilkan 16 dari 16 paket · Diurutkan: Prioritas Audit & Jadwal</span>
      </div>
    </div>
  `;

  const pkgRows = PACKAGES.map((p) => {
    const diffStr =
      p.bidIdr !== null
        ? (((p.bidIdr - p.hpsIdr) / p.hpsIdr) * 100).toFixed(1).replace('.', ',') + '%'
        : 'Tersegel';
    const rowCls = p.selected ? 'is-selected' : p.flags > 0 ? 'is-warn' : '';
    return `<tr class="${rowCls}">
      <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(p.code.replace('PKT-2026-BUMN-', 'PKT-'))}</td>
      <td style="font-weight:${p.selected ? '700' : '600'};">${esc(p.title)}</td>
      <td style="color:#475569;">${esc(p.entity.replace('PT Nusantara ', 'PTN '))}</td>
      <td class="num mono">${fmtMiliar(p.hpsIdr)}</td>
      <td class="num mono" style="font-weight:600;color:${p.bidIdr ? '#0f172a' : '#64748b'};">${p.bidIdr ? fmtMiliar(p.bidIdr) : 'RSA-Locked'}</td>
      <td class="num mono" style="color:${p.bidIdr ? '#047857' : '#64748b'};font-weight:600;">${esc(diffStr)}</td>
      <td class="num mono" style="color:${p.tkdnPct >= 40 ? '#047857' : '#b45309'};font-weight:600;">${fmtPct(p.tkdnPct)}</td>
      <td class="num mono">${p.vendors}</td>
      <td>${badge(p.status, p.tone)}</td>
    </tr>`;
  }).join('');

  const focusVendorRows = GENSET_VENDORS.map((v) => {
    const shortVerdict =
      v.verdict === 'Gugur (Lewat HPS)' ? 'Lewat HPS' : v.verdict === 'Indikasi Kolusi' ? 'Kolusi (Tahan)' : v.verdict;
    return `<tr class="${v.collusionFlag ? 'is-bad' : v.verdict === 'Rank #1' ? 'is-selected' : v.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;">${esc(v.code)}</td>
      <td style="font-weight:600;">${esc(v.name)}</td>
      <td class="num mono">${v.techScore.toFixed(0)}</td>
      <td class="num mono">${fmtPct(v.tkdnPct)}</td>
      <td class="num mono">${fmtMiliar(v.bidIdr)}</td>
      <td class="num mono" style="font-weight:700;">${v.eligible ? v.finalScore.toFixed(2).replace('.', ',') : '—'}</td>
      <td>${badge(shortVerdict, v.tone)}</td>
    </tr>`;
  }).join('');

  const contentHtml = `
    ${filterBar}
    <div class="f-grid" style="grid-template-columns:1020px 1fr;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#1f4e5f')}<span>Register Paket Pengadaan BUMN & Status Evaluasi (16 Paket)</span></div>
          <span class="e-panel-sub">Klik baris untuk inspeksi rincian penawaran & HEA</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table p2-dense" style="font-size:10.5px;">
            <thead>
              <tr>
                <th style="width:9%;">Kode</th>
                <th style="width:29%;">Nama Paket Pengadaan</th>
                <th style="width:14%;">Entitas</th>
                <th class="num" style="width:10%;">Pagu HPS</th>
                <th class="num" style="width:10%;">Bid Terendah</th>
                <th class="num" style="width:7%;">Selisih</th>
                <th class="num" style="width:6.5%;">TKDN</th>
                <th class="num" style="width:4.5%;">Vnd</th>
                <th style="width:10%;">Status</th>
              </tr>
            </thead>
            <tbody>${pkgRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total 16 Paket Aktif (11 Terbuka · 5 Tersegel/KYC)</td>
                <td class="num mono">${fmtMiliar(TOTAL_HPS)}</td>
                <td class="num mono">${fmtMiliar(OPENED_BID)}</td>
                <td class="num mono" style="color:#047857;">-${fmtPct(EFFICIENCY_PCT)}</td>
                <td class="num mono">${fmtPct(AVG_TKDN)}</td>
                <td class="num mono">${PACKAGES.reduce((a, p) => a + p.vendors, 0)}</td>
                <td>${badge(TOTAL_FLAGS + ' Flag', 'bad')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:10px 11px;margin-top:auto;background:#f8fafb;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10.2px;color:#475569;">
            <span><strong>Integritas Anggaran:</strong> Seluruh pagu HPS terhubung ke RUP LKPP & Cost Center SAP S/4HANA (Encumbrance Check: Aktif).</span>
            <span class="mono">Hemat 11 Paket Terbuka: <strong style="color:#047857;">${fmtIdr(EFFICIENCY_SAVING)}</strong></span>
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head" style="background:#eef5f7;border-bottom-color:#c2d7df;">
          <div class="e-panel-title">${ic('eye', 13, '#1f4e5f')}<span>Inspektor Paket: PKT-2026-BUMN-0418</span></div>
          ${badge('TAHAP PEMBUKAAN BID', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#0f172a;">Pengadaan Genset 1500 kVA Prime Power + Panel ATS/AMF</div>
            <div style="font-size:10.2px;color:#52636d;">PT Nusantara Pembangkitan · PLTU Banten Unit 3 · DoA Tier 3 (Dirut)</div>
          </div>

          <div class="f-grid" style="grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="padding:6px 8px;border:1px solid #d5dde0;border-radius:3px;background:#f8fafb;">
              <div style="font-size:9.3px;color:#5c6f7a;">Pagu HPS Pemilik</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;">Rp 4,85 M</div>
              <div style="font-size:9px;color:#5c6f7a;">Rp 4.850.000.000</div>
            </div>
            <div style="padding:6px 8px;border:1px solid #a7f3d0;border-radius:3px;background:#ecfdf5;">
              <div style="font-size:9.3px;color:#047857;">Vendor Lolos / TKDN</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#047857;">5 Peserta</div>
              <div style="font-size:9px;color:#047857;">Syarat TKDN ≥ 40%</div>
            </div>
            <div style="padding:6px 8px;border:1px solid #fecdd3;border-radius:3px;background:#fff1f2;">
              <div style="font-size:9.3px;color:#be123c;">Bendera Audit</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#be123c;">1 IP Sama</div>
              <div style="font-size:9px;color:#be123c;">VND-04 & VND-05</div>
            </div>
          </div>

          <div class="f-alert-strip" style="padding:6px 8px;">
            <div style="font-size:10px;color:#881337;line-height:1.35;">
              <strong>Anti-Collusion Guard:</strong> VND-04 & VND-05 memiliki metadata PDF + subnet unggah identik (<span class="mono">103.144.82.19</span>) & pola harga <span class="mono">1,0400x</span> → Dieskalasi ke Komite & SPI.
            </div>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;overflow:hidden;">
            <div style="padding:5px 8px;background:#f1f5f9;border-bottom:1px solid #d5dde0;font-size:10px;font-weight:700;color:#143440;">
              Ringkasan 5 Peserta Penawaran (Setelah Pembukaan RSA Vault)
            </div>
            <table class="e-table" style="font-size:9.8px;">
              <thead>
                <tr>
                  <th style="width:11%;">Kode</th>
                  <th style="width:27%;">Vendor</th>
                  <th class="num" style="width:7%;">Tek</th>
                  <th class="num" style="width:10.5%;">TKDN</th>
                  <th class="num" style="width:13.5%;">Bid</th>
                  <th class="num" style="width:9.5%;">Skor</th>
                  <th style="width:21.5%;">Status</th>
                </tr>
              </thead>
              <tbody>${focusVendorRows}</tbody>
            </table>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:7px 9px;background:#f8fafb;">
            <div style="font-size:10.2px;font-weight:700;color:#143440;margin-bottom:4px;">Verifikasi Perhitungan HEA Pemenang Sementara (VND-01)</div>
            <div class="f-kv"><span class="f-kv-k">Harga Penawaran Bruto (VND-01)</span><span class="f-kv-v mono">${fmtIdr(GENSET_VENDORS[0].bidIdr)} (-5,6% HPS)</span></div>
            <div class="f-kv"><span class="f-kv-k">Sertifikat TKDN Kemenperin</span><span class="f-kv-v mono">44,2% (KP = 11,05%)</span></div>
            <div class="f-kv"><span class="f-kv-k">Harga Evaluasi Akhir (HEA)</span><span class="f-kv-v mono" style="color:#047857;">${fmtIdr(GENSET_VENDORS[0].heaIdr)}</span></div>
            <div class="f-kv"><span class="f-kv-k">Skor Gabungan (60% Tek + 40% HEA)</span><span class="f-kv-v mono" style="color:#1f4e5f;">95,20 (Unggul +3,85 vs Rank #2)</span></div>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:7px 9px;background:#ffffff;">
            <div style="font-size:10.2px;font-weight:700;color:#143440;margin-bottom:4px;">Kronologi Tahapan Paket (PKT-2026-BUMN-0418)</div>
            <div class="f-kv"><span class="f-kv-k">Pengumuman RUP &amp; Unduh RFP</span><span class="f-kv-v mono">10 Nov 2026 · 12 Peminat</span></div>
            <div class="f-kv"><span class="f-kv-k">Prakualifikasi KYC &amp; Aanwijzing</span><span class="f-kv-v mono">14 Nov 2026 · 5 Lolos</span></div>
            <div class="f-kv"><span class="f-kv-k">Pembukaan Vault RSA-4096 (3/5)</span><span class="f-kv-v mono" style="color:#047857;">22 Nov 10:00:31 WIB</span></div>
            <div class="f-kv"><span class="f-kv-k">Target Penetapan SPPBJ &amp; SAP PO</span><span class="f-kv-v mono">01 Des 2026 (Pasca Sanggah)</span></div>
          </div>

          <div class="f-between" style="margin-top:auto;padding-top:6px;border-top:1px solid #e2e8f0;">
            <span class="e-btn e-btn-danger">${ic('alert', 11.5, '#be123c')}Eskalasi SPI (VND-04/05)</span>
            <span class="e-btn e-btn-primary">${ic('check', 11.5, '#fff')}Lanjut Evaluasi HEA & DoA</span>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p2',
    objTitle: 'Meja Kerja Tender & Matriks Evaluasi TKDN',
    objMetaHtml: `${badge('HPS: Rp 4,85 M', 'accent')}<span>Fokus: PKT-2026-BUMN-0418 · Genset 1500 kVA Prime Power</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('alert', 11.5, '#be123c')}Cek Indikasi Kolusi</span>
      <span class="e-btn e-btn-primary">${ic('lock', 11.5, '#fff')}Buka Penawaran Tertutup</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3: RUANG PEMBUKAAN PENAWARAN TERTUTUP (RSA-4096 SEALED-BID VAULT)
// ============================================================================
function renderP3() {
  const custodians = [
    { name: 'Ir. H. Darmawan', role: 'Ketua Pokja Pengadaan', token: 'HSM-YUBI-0194', time: '10:00:08 WIB', share: 'SH-1 · 0x4f91...c82a', status: 'Terotorisasi', tone: 'ok' },
    { name: 'R. A. Puspitasari, MBA', role: 'VP Strategic Procurement', token: 'HSM-YUBI-0207', time: '10:00:19 WIB', share: 'SH-2 · 0x8a12...d04e', status: 'Terotorisasi', tone: 'ok' },
    { name: 'Drs. B. Hendrawan, Ak', role: 'Kepala Audit Internal (SPI)', token: 'HSM-YUBI-0118', time: '10:00:31 WIB', share: 'SH-3 · 0x1c77...f91b', status: 'Terotorisasi', tone: 'ok' },
    { name: 'S. M. Kartika, SH, MH', role: 'VP Legal & Tata Kelola', token: 'HSM-YUBI-0312', time: 'Standby Cadangan', share: 'SH-4 · Tersegel', status: 'Standby', tone: 'neutral' },
    { name: 'Ir. T. Gunawan, IPM', role: 'User Teknis Pembangkitan', token: 'HSM-YUBI-0405', time: 'Standby Cadangan', share: 'SH-5 · Tersegel', status: 'Standby', tone: 'neutral' },
  ];

  // Custom SVG Cryptographic Time-Locked Vault Schematic
  const vaultSvg = `
    <svg viewBox="0 0 618 392" width="100%" height="392" style="display:block;">
      <rect x="0" y="0" width="618" height="392" fill="#f7fafb" rx="3" stroke="#d5dde0" />

      <!-- Stage Headers -->
      <rect x="12" y="10" width="165" height="24" rx="2" fill="#e6f0f3" stroke="#bdd4dc" />
      <text x="94" y="25.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#143440">1. AMPLOP ENKRIPSI VENDOR</text>

      <rect x="208" y="10" width="202" height="24" rx="2" fill="#143440" />
      <text x="309" y="25.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">2. RSA-4096 TIME-LOCKED HSM VAULT</text>

      <rect x="441" y="10" width="165" height="24" rx="2" fill="#ecfdf5" stroke="#a7f3d0" />
      <text x="523" y="25.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#047857">3. DEKRIPSI & VALIDASI</text>

      <!-- Central HSM Vault Box -->
      <rect x="208" y="48" width="202" height="252" rx="4" fill="#0f252e" stroke="#1f4e5f" stroke-width="1.5" />
      <text x="309" y="69" text-anchor="middle" font-size="10" font-weight="700" fill="#93d6eb" font-family="ui-monospace,Consolas,monospace">THALES LUNA 7 · FIPS 140-3</text>
      <line x1="222" y1="78" x2="396" y2="78" stroke="#244c5b" stroke-width="1" />

      <!-- Time-Lock Gate -->
      <rect x="222" y="88" width="174" height="44" rx="3" fill="#163542" stroke="#2d6378" />
      <text x="232" y="104" font-size="9" font-weight="700" fill="#86efac" font-family="ui-monospace,Consolas,monospace">TIME-LOCK GATE: TERBUKA</text>
      <text x="232" y="118" font-size="8.6" fill="#cbd5e1" font-family="ui-monospace,Consolas,monospace">Jadwal: 22 Nov 2026 10:00:00</text>
      <text x="232" y="128" font-size="8.2" fill="#94a3b8" font-family="ui-monospace,Consolas,monospace">RFC 3161 TSA + NTP Stratum-1</text>

      <!-- Shamir Quorum Gate -->
      <rect x="222" y="142" width="174" height="54" rx="3" fill="#163542" stroke="#2d6378" />
      <text x="232" y="158" font-size="9" font-weight="700" fill="#fde68a" font-family="ui-monospace,Consolas,monospace">SHAMIR QUORUM: 3 / 5 VALID</text>
      <rect x="232" y="166" width="28" height="16" rx="2" fill="#047857" /><text x="246" y="177" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">K1</text>
      <rect x="265" y="166" width="28" height="16" rx="2" fill="#047857" /><text x="279" y="177" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">K2</text>
      <rect x="298" y="166" width="28" height="16" rx="2" fill="#047857" /><text x="312" y="177" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">K3</text>
      <rect x="331" y="166" width="28" height="16" rx="2" fill="#334155" /><text x="345" y="177" text-anchor="middle" font-size="8" fill="#94a3b8">K4</text>
      <rect x="364" y="166" width="28" height="16" rx="2" fill="#334155" /><text x="378" y="177" text-anchor="middle" font-size="8" fill="#94a3b8">K5</text>

      <!-- Cipher Engine -->
      <rect x="222" y="206" width="174" height="82" rx="3" fill="#102b36" stroke="#2d6378" />
      <text x="232" y="222" font-size="8.8" font-weight="700" fill="#e2eff3" font-family="ui-monospace,Consolas,monospace">DEKRIPSI HIBRIDA</text>
      <text x="232" y="236" font-size="8.3" fill="#93d6eb" font-family="ui-monospace,Consolas,monospace">• Key Wrap: RSA-4096 OAEP</text>
      <text x="232" y="249" font-size="8.3" fill="#93d6eb" font-family="ui-monospace,Consolas,monospace">• Payload : AES-256-GCM</text>
      <text x="232" y="262" font-size="8.3" fill="#93d6eb" font-family="ui-monospace,Consolas,monospace">• Digest  : SHA-256 Verified</text>
      <text x="232" y="275" font-size="8.3" fill="#86efac" font-family="ui-monospace,Consolas,monospace">• 5/5 Blob Integritas Utuh</text>

      <!-- Bottom WORM Anchor Box -->
      <rect x="12" y="316" width="594" height="64" rx="3" fill="#ffffff" stroke="#bdd4dc" />
      <text x="24" y="334" font-size="9.5" font-weight="700" fill="#143440">PENYEGELAN MERKLE ROOT & BERITA ACARA PEMBUKAAN PENAWARAN (BAPP)</text>
      <text x="24" y="350" font-size="8.8" fill="#334155" font-family="ui-monospace,Consolas,monospace">Merkle Root BAPP: 0x8c4e91a03f7b2289d140e5c8a21f44b07e6c90a1d82f3104c9a1b2e47f0a91f</text>
      <text x="24" y="366" font-size="8.8" fill="#047857" font-family="ui-monospace,Consolas,monospace">Status Anti-Tamper: ZERO MODIFIKASI PASCA-UNGGAH · Siap Ekspor Bukti Audit BPK (PDF/A-3 + JSON-LD)</text>

      <!-- 5 Vendor Envelopes (Left) + Arrows + Decrypted Outputs (Right) -->
      ${GENSET_VENDORS.map((v, i) => {
        const y = 48 + i * 52;
        const strokeC = v.collusionFlag ? '#be123c' : v.tone === 'warn' ? '#b45309' : '#047857';
        const fillR = v.collusionFlag ? '#fff1f2' : v.tone === 'warn' ? '#fffbeb' : '#ecfdf5';
        return `
          <rect x="12" y="${y}" width="165" height="44" rx="3" fill="#ffffff" stroke="#b8c6cb" />
          <text x="20" y="${y + 15}" font-size="9.5" font-weight="700" fill="#143440" font-family="ui-monospace,Consolas,monospace">${esc(v.code)} · AES-GCM</text>
          <text x="20" y="${y + 27}" font-size="8.4" fill="#475569">${esc(v.name.slice(0, 24))}</text>
          <text x="20" y="${y + 38}" font-size="7.8" fill="#64748b" font-family="ui-monospace,Consolas,monospace">sha256:${esc(v.sha256.slice(0, 14))}…</text>

          <line x1="177" y1="${y + 22}" x2="208" y2="${y + 22}" stroke="#1f4e5f" stroke-width="1.4" />
          <polygon points="203,${y + 18} 208,${y + 22} 203,${y + 26}" fill="#1f4e5f" />

          <line x1="410" y1="${y + 22}" x2="441" y2="${y + 22}" stroke="${strokeC}" stroke-width="1.4" />
          <polygon points="436,${y + 18} 441,${y + 22} 436,${y + 26}" fill="${strokeC}" />

          <rect x="441" y="${y}" width="165" height="44" rx="3" fill="${fillR}" stroke="${strokeC}" />
          <text x="449" y="${y + 15}" font-size="9.8" font-weight="700" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">${esc(fmtMiliar(v.bidIdr))}</text>
          <text x="449" y="${y + 27}" font-size="8.3" fill="#334155">TKDN ${esc(fmtPct(v.tkdnPct))} · ${esc(v.deltaHpsPct >= 0 ? '+' : '')}${esc(v.deltaHpsPct.toFixed(1).replace('.', ','))}% HPS</text>
          <text x="449" y="${y + 38}" font-size="8.2" font-weight="700" fill="${strokeC}">${esc(v.verdict.toUpperCase())}</text>
        `;
      }).join('')}
    </svg>
  `;

  const contentHtml = `
    <div class="f-info-strip" style="height:60px;">
      <div class="f-row" style="gap:14px;">
        <div style="width:36px;height:36px;border-radius:4px;background:#1f4e5f;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${ic('lock', 18, '#ffffff')}
        </div>
        <div>
          <div style="font-size:12.5px;font-weight:700;color:#143440;">Upacara Pembukaan Penawaran Tertutup · PKT-2026-BUMN-0418 (Genset 1500 kVA)</div>
          <div style="font-size:10.3px;color:#3f515b;">Jadwal Kunci Waktu: <strong class="mono">22 Nov 2026 10:00:00 WIB</strong> · Status: <strong style="color:#047857;">TERBUKA SAH (Quorum Shamir 3/5 Tercapai pukul 10:00:31 WIB)</strong> · Pagu HPS: <strong class="mono">Rp 4.850.000.000</strong></div>
        </div>
      </div>
      <div class="f-row">
        ${badge('mTLS Mutual Cert OK', 'ok')}
        ${badge('5/5 Ciphertext Utuh', 'ok')}
        ${badge('2 Flag Kolusi Otomatis', 'bad')}
      </div>
    </div>

    <div class="f-grid" style="grid-template-columns:420px 642px 1fr;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('key', 13, '#1f4e5f')}<span>Otorisasi Kunci Shamir Komite (Quorum 3-of-5)</span></div>
          ${badge('3/5 Sah', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          ${custodians
            .map(
              (c) => `<div style="padding:7px 9px;border:1px solid ${c.tone === 'ok' ? '#a7f3d0' : '#dce3e6'};border-radius:3px;background:${c.tone === 'ok' ? '#f4fcf8' : '#f8fafb'};">
              <div class="f-between">
                <span style="font-weight:700;font-size:11px;color:#0f172a;">${esc(c.name)}</span>
                ${badge(c.status, c.tone)}
              </div>
              <div style="font-size:10px;color:#475569;margin-top:1px;">${esc(c.role)}</div>
              <div class="f-between mono" style="font-size:9.3px;color:#52636d;margin-top:4px;padding-top:4px;border-top:1px dashed #d5dde0;">
                <span>Token: ${esc(c.token)}</span>
                <span>${esc(c.time)}</span>
              </div>
              <div class="mono" style="font-size:9px;color:#1f4e5f;margin-top:2px;">Key Share: ${esc(c.share)}</div>
            </div>`
            )
            .join('')}

          <div style="margin-top:auto;padding:8px 9px;background:#f7f9fa;border:1px solid #d5dde0;border-radius:3px;">
            <div style="font-size:10.2px;font-weight:700;color:#143440;margin-bottom:4px;">Spesifikasi Kriptografi & Sesi mTLS</div>
            <div class="f-kv"><span class="f-kv-k">Algoritma Enkripsi Kunci</span><span class="f-kv-v mono">RSA-4096 OAEP-SHA256</span></div>
            <div class="f-kv"><span class="f-kv-k">Enkripsi Dokumen Penawaran</span><span class="f-kv-v mono">AES-256-GCM (Authenticated)</span></div>
            <div class="f-kv"><span class="f-kv-k">Skema Quorum Komite</span><span class="f-kv-v mono">Shamir Secret Sharing (3-of-5)</span></div>
            <div class="f-kv"><span class="f-kv-k">Stempel Waktu Hukum</span><span class="f-kv-v mono">BSrE RFC 3161 TSA</span></div>
            <div class="f-kv"><span class="f-kv-k">ID Sesi Pembukaan</span><span class="f-kv-v mono">CEREMONY-0418-20261122</span></div>
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#1f4e5f')}<span>Arsitektur Time-Locked Bid Vault & Pipeline Dekripsi</span></div>
          <span class="e-panel-sub">Zero-Knowledge Sebelum Jadwal Komite</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          ${vaultSvg}
          <div style="border:1px solid #d5dde0;border-radius:3px;overflow:hidden;flex:1;display:flex;flex-direction:column;">
            <div style="padding:5px 8px;background:#f1f5f9;border-bottom:1px solid #d5dde0;font-size:10px;font-weight:700;color:#143440;">
              Verifikasi Integritas Blob Enkripsi (PostgreSQL Encrypted Bid Vault)
            </div>
            <table class="e-table" style="font-size:9.8px;">
              <thead>
                <tr>
                  <th style="width:12%;">Kode</th>
                  <th style="width:28%;">SHA-256 Ciphertext</th>
                  <th class="num" style="width:14%;">Ukuran</th>
                  <th style="width:26%;">Waktu Unggah TSA</th>
                  <th style="width:20%;">Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                ${GENSET_VENDORS.map(
                  (v) => `<tr>
                    <td class="mono" style="font-weight:700;">${esc(v.code)}</td>
                    <td class="mono" style="color:#475569;">${esc(v.sha256.slice(0, 18))}…</td>
                    <td class="num mono">${fmtNum(v.blobKb)} KB</td>
                    <td class="mono">${esc(v.uploadAt)}</td>
                    <td>${badge('Hash Valid', 'ok')}</td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#1f4e5f')}<span>Hasil Pembukaan Harga & Berita Acara (BAPP)</span></div>
          ${badge('HPS Rp 4,85 M', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <table class="e-table" style="font-size:10px;">
            <thead>
              <tr>
                <th style="width:14%;">Kode</th>
                <th style="width:36%;">Peserta</th>
                <th class="num" style="width:26%;">Penawaran (Rp)</th>
                <th class="num" style="width:12%;">vs HPS</th>
                <th style="width:12%;">Hasil</th>
              </tr>
            </thead>
            <tbody>
              ${GENSET_VENDORS.map(
                (v) => `<tr class="${v.collusionFlag ? 'is-bad' : v.verdict === 'Rank #1' ? 'is-selected' : v.tone === 'warn' ? 'is-warn' : ''}">
                  <td class="mono" style="font-weight:700;">${esc(v.code)}</td>
                  <td class="trunc" style="font-weight:600;">${esc(v.name)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(v.bidIdr)}</td>
                  <td class="num mono" style="color:${v.deltaHpsPct > 0 ? '#b45309' : '#047857'};font-weight:600;">${v.deltaHpsPct > 0 ? '+' : ''}${v.deltaHpsPct.toFixed(1).replace('.', ',')}%</td>
                  <td>${badge(v.collusionFlag ? 'Tahan' : v.tone === 'warn' ? 'Gugur' : 'Lolos', v.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:8px 10px;background:#f8fafb;">
            <div class="f-between" style="margin-bottom:5px;">
              <span style="font-size:10.5px;font-weight:700;color:#143440;">Ringkasan Statistik Pembukaan Bid</span>
              ${badge('Otomatis Terhitung', 'info')}
            </div>
            <div class="f-kv"><span class="f-kv-k">Pagu HPS Pemilik Pekerjaan</span><span class="f-kv-v mono">${fmtIdr(FOCUS_HPS)}</span></div>
            <div class="f-kv"><span class="f-kv-k">Penawaran Terendah Sah (VND-01)</span><span class="f-kv-v mono" style="color:#047857;">${fmtIdr(GENSET_VENDORS[0].bidIdr)} (-5,6%)</span></div>
            <div class="f-kv"><span class="f-kv-k">Penawaran Tertinggi (VND-03 · Gugur)</span><span class="f-kv-v mono" style="color:#b45309;">${fmtIdr(GENSET_VENDORS[2].bidIdr)} (+1,4%)</span></div>
            <div class="f-kv"><span class="f-kv-k">Peserta Ditahan Anti-Kolusi</span><span class="f-kv-v mono" style="color:#be123c;">2 Peserta (VND-04 & VND-05)</span></div>
          </div>

          <div style="border:1px solid #bdd4dc;border-radius:3px;padding:8px 10px;background:#eef5f7;flex:1;display:flex;flex-direction:column;gap:5px;">
            <div class="f-between">
              <span style="font-size:10.5px;font-weight:700;color:#143440;">Berita Acara Pembukaan Penawaran (BAPP)</span>
              ${badge('BSrE e-Sign', 'ok')}
            </div>
            <div style="font-size:10px;color:#334155;line-height:1.4;">
              Nomor: <strong class="mono">BA-0418/POKJA-NEH/XI/2026</strong><br/>
              Pembukaan 5 amplop penawaran tertutup dilakukan secara elektronik dengan quorum 3/5 kunci Shamir tanpa kebocoran pra-jadwal. Anomali kolusi VND-04 &amp; VND-05 dicatat permanen dalam lampiran BAPP.
            </div>
            <div style="background:#ffffff;border:1px solid #c2d7df;border-radius:3px;padding:5px 8px;">
              <div class="f-kv"><span class="f-kv-k">Ketua Pokja (Ir. H. Darmawan)</span><span class="f-kv-v">${badge('BSrE Sah', 'ok')}</span></div>
              <div class="f-kv"><span class="f-kv-k">VP Procurement (R. A. Puspitasari)</span><span class="f-kv-v">${badge('BSrE Sah', 'ok')}</span></div>
              <div class="f-kv"><span class="f-kv-k">Kepala SPI (Drs. B. Hendrawan)</span><span class="f-kv-v">${badge('BSrE Sah', 'ok')}</span></div>
            </div>
            <div class="f-code-box" style="margin-top:auto;">
              <div>SIG_CHAIR : ecdsa-p384:99a14f0c...71e2 (VALID)</div>
              <div>SIG_SPI   : ecdsa-p384:3d02b81a...49c0 (VALID)</div>
              <div>TSA_PROOF : BSrE-2026-11-22T03:00:31Z</div>
            </div>
            <div class="f-between" style="padding-top:4px;">
              <span class="e-btn">${ic('download', 11)}Unduh BAPP PDF/A</span>
              <span class="e-btn e-btn-primary">${ic('shield', 11, '#fff')}Segel ke WORM Ledger</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p3',
    objTitle: 'Ruang Pembukaan Penawaran Tertutup (RSA-4096 Sealed-Bid Vault)',
    objMetaHtml: `${badge('QUORUM 3-OF-5 TERCAPAI', 'ok')}<span>PKT-2026-BUMN-0418 · 5 Amplop Terdekripsi · Zero Pre-Leakage</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11.5)}Verifikasi Ulang SHA-256</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 11.5, '#fff')}Terbitkan BAPP Digital</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4: FORENSIK ANTI-KOLUSI & GRAF AFILIASI VENDOR
// ============================================================================
function renderP4() {
  const graphSvg = `
    <svg viewBox="0 0 806 382" width="100%" height="382" style="display:block;">
      <rect x="0" y="0" width="806" height="382" fill="#f8fafb" rx="3" stroke="#d5dde0" />

      <!-- Zone Labels -->
      <rect x="12" y="10" width="236" height="22" rx="2" fill="#ecfdf5" stroke="#a7f3d0" />
      <text x="130" y="24.5" text-anchor="middle" font-size="9.3" font-weight="700" fill="#047857">KLUSTER BERSIH — INDEPENDEN (3 VENDOR)</text>

      <rect x="262" y="10" width="532" height="22" rx="2" fill="#fff1f2" stroke="#fecdd3" />
      <text x="528" y="24.5" text-anchor="middle" font-size="9.3" font-weight="700" fill="#be123c">KLUSTER INDIKASI KOLUSI / COVER BIDDING — SKOR RISIKO 96/100 (ESKALASI SPI)</text>

      <!-- Divider -->
      <line x1="255" y1="36" x2="255" y2="372" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3" />

      <!-- Left Clean Nodes -->
      <rect x="22" y="54" width="214" height="76" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.5" />
      <text x="32" y="72" font-size="10.2" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">VND-01 · RANK #1 (BERSIH)</text>
      <text x="32" y="87" font-size="10" font-weight="700" fill="#0f172a">PT Traktor Nusantara Prima</text>
      <text x="32" y="102" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">IP: 114.79.42.118 (AS7713)</text>
      <text x="32" y="116" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">Bid: Rp 4,58 M · Risiko: 4/100</text>

      <rect x="22" y="156" width="214" height="76" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.5" />
      <text x="32" y="174" font-size="10.2" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">VND-02 · RANK #2 (BERSIH)</text>
      <text x="32" y="189" font-size="10" font-weight="700" fill="#0f172a">PT Daya Energi Mandiri</text>
      <text x="32" y="204" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">IP: 202.152.14.66 (AS4761)</text>
      <text x="32" y="218" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">Bid: Rp 4,71 M · Risiko: 6/100</text>

      <rect x="22" y="258" width="214" height="76" rx="4" fill="#ffffff" stroke="#b45309" stroke-width="1.5" />
      <text x="32" y="276" font-size="10.2" font-weight="700" fill="#b45309" font-family="ui-monospace,Consolas,monospace">VND-03 · GUGUR LEWAT HPS</text>
      <text x="32" y="291" font-size="10" font-weight="700" fill="#0f172a">CV Karya Teknik Bersama</text>
      <text x="32" y="306" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">IP: 180.244.161.24 (AS17974)</text>
      <text x="32" y="320" font-size="8.6" fill="#475569" font-family="ui-monospace,Consolas,monospace">Bid: Rp 4,92 M · Risiko: 11/100</text>

      <!-- Right Collusion Graph: VND-04 (Left) <-- 5 Shared Evidence Nodes --> VND-05 (Right) -->
      <!-- Edges first -->
      ${[76, 134, 192, 250, 308]
        .map(
          (cy) => `
        <line x1="414" y1="192" x2="458" y2="${cy}" stroke="#be123c" stroke-width="1.6" stroke-dasharray="4,2" />
        <line x1="600" y1="${cy}" x2="644" y2="192" stroke="#be123c" stroke-width="1.6" stroke-dasharray="4,2" />
      `
        )
        .join('')}

      <!-- VND-04 Node -->
      <rect x="268" y="130" width="148" height="124" rx="4" fill="#fff1f2" stroke="#be123c" stroke-width="2" />
      <rect x="268" y="130" width="148" height="22" rx="3" fill="#be123c" />
      <text x="342" y="144.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff" font-family="ui-monospace,Consolas,monospace">VND-04 · DITAHAN</text>
      <text x="278" y="168" font-size="10" font-weight="700" fill="#0f172a">PT Sinar Jaya</text>
      <text x="278" y="181" font-size="10" font-weight="700" fill="#0f172a">Elektrika</text>
      <text x="278" y="198" font-size="8.4" fill="#475569" font-family="ui-monospace,Consolas,monospace">Bid: Rp 4,64 M</text>
      <text x="278" y="211" font-size="8.4" fill="#475569" font-family="ui-monospace,Consolas,monospace">Unggah: 16:48:12</text>
      <text x="278" y="224" font-size="8.4" fill="#be123c" font-weight="700" font-family="ui-monospace,Consolas,monospace">Base Bid (1,0000x)</text>
      <text x="278" y="241" font-size="8.2" fill="#881337" font-family="ui-monospace,Consolas,monospace">NIB: 9120206714008</text>

      <!-- VND-05 Node -->
      <rect x="642" y="130" width="148" height="124" rx="4" fill="#fff1f2" stroke="#be123c" stroke-width="2" />
      <rect x="642" y="130" width="148" height="22" rx="3" fill="#be123c" />
      <text x="716" y="144.5" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff" font-family="ui-monospace,Consolas,monospace">VND-05 · DITAHAN</text>
      <text x="652" y="168" font-size="10" font-weight="700" fill="#0f172a">PT Cahaya Mandiri</text>
      <text x="652" y="181" font-size="10" font-weight="700" fill="#0f172a">Teknik</text>
      <text x="652" y="198" font-size="8.4" fill="#475569" font-family="ui-monospace,Consolas,monospace">Bid: Rp 4,8256 M</text>
      <text x="652" y="211" font-size="8.4" fill="#475569" font-family="ui-monospace,Consolas,monospace">Unggah: 16:49:54</text>
      <text x="652" y="224" font-size="8.4" fill="#be123c" font-weight="700" font-family="ui-monospace,Consolas,monospace">Cover Bid (1,0400x)</text>
      <text x="652" y="241" font-size="8.2" fill="#881337" font-family="ui-monospace,Consolas,monospace">NIB: 9120206714099</text>

      <!-- 5 Shared Forensic Evidence Bridge Nodes -->
      <rect x="456" y="54" width="146" height="44" rx="3" fill="#ffffff" stroke="#be123c" stroke-width="1.3" />
      <text x="529" y="70" text-anchor="middle" font-size="8.6" font-weight="700" fill="#be123c">1. IP & SUBNET IDENTIK (+28)</text>
      <text x="529" y="83" text-anchor="middle" font-size="8.5" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">103.144.82.19/32</text>
      <text x="529" y="93" text-anchor="middle" font-size="7.6" fill="#64748b">Delta waktu unggah 01m 42d</text>

      <rect x="456" y="112" width="146" height="44" rx="3" fill="#ffffff" stroke="#be123c" stroke-width="1.3" />
      <text x="529" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#be123c">2. METADATA PDF SAMA (+24)</text>
      <text x="529" y="141" text-anchor="middle" font-size="8.5" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">Author: B. Santoso</text>
      <text x="529" y="151" text-anchor="middle" font-size="7.6" fill="#64748b">Acrobat 24.0 · XMP ID mirip</text>

      <rect x="456" y="170" width="146" height="44" rx="3" fill="#ffffff" stroke="#be123c" stroke-width="1.3" />
      <text x="529" y="186" text-anchor="middle" font-size="8.6" font-weight="700" fill="#be123c">3. POLA HARGA BOQ (+22)</text>
      <text x="529" y="199" text-anchor="middle" font-size="8.5" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">Rasio konstan 1,0400x</text>
      <text x="529" y="209" text-anchor="middle" font-size="7.6" fill="#64748b">8/8 pos BoQ selisih tepat +4%</text>

      <rect x="456" y="228" width="146" height="44" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="1.3" />
      <text x="529" y="244" text-anchor="middle" font-size="8.6" font-weight="700" fill="#b45309">4. TLS JA3 & PERANGKAT (+12)</text>
      <text x="529" y="257" text-anchor="middle" font-size="8.3" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">ja3:771,4865-4866…</text>
      <text x="529" y="267" text-anchor="middle" font-size="7.6" fill="#64748b">Chrome 131 Win11 identik</text>

      <rect x="456" y="286" width="146" height="44" rx="3" fill="#ffffff" stroke="#b45309" stroke-width="1.3" />
      <text x="529" y="302" text-anchor="middle" font-size="8.6" font-weight="700" fill="#b45309">5. AFILIASI DOMISILI (+10)</text>
      <text x="529" y="315" text-anchor="middle" font-size="8.3" fill="#0f172a" font-family="ui-monospace,Consolas,monospace">Ruko Mega Glodok Lt.4</text>
      <text x="529" y="325" text-anchor="middle" font-size="7.6" fill="#64748b">Komisaris AHU alamat sama</text>

      <!-- Bottom Legend -->
      <text x="272" y="362" font-size="8.8" fill="#881337" font-weight="600">Total Bobot Indikator Forensik: 28 + 24 + 22 + 12 + 10 = 96 / 100 (Ambang Eskalasi SPI ≥ 65)</text>
    </svg>
  `;

  const metadataDiff = [
    { attr: 'Alamat IP Publik Unggah', v4: '103.144.82.19 (ISP Biznet JKT)', v5: '103.144.82.19 (ISP Biznet JKT)', match: 'IDENTIK', tone: 'bad' },
    { attr: 'Waktu Unggah ke Vault', v4: '21 Nov 2026 16:48:12 WIB', v5: '21 Nov 2026 16:49:54 WIB', match: 'Δ 01m 42d', tone: 'bad' },
    { attr: 'PDF Author & XMP Creator', v4: 'B. Santoso · Acrobat Pro 24.0', v5: 'B. Santoso · Acrobat Pro 24.0', match: 'IDENTIK', tone: 'bad' },
    { attr: 'XLSX BoQ LastModifiedBy', v4: 'budi.santoso@sinarjaya.co.id', v5: 'budi.santoso@sinarjaya.co.id', match: 'IDENTIK', tone: 'bad' },
    { attr: 'TLS JA3 Client Fingerprint', v4: '771,4865-4866-4867-49195', v5: '771,4865-4866-4867-49195', match: 'IDENTIK', tone: 'bad' },
    { attr: 'Rasio Harga 8 Item BoQ', v4: 'Basis 1,0000x (Rp 4,640 M)', v5: 'Tepat 1,0400x (Rp 4,8256 M)', match: '+4,00% FLAT', tone: 'bad' },
    { attr: 'KPP NPWP & Alamat Kantor', v4: 'KPP Taman Sari · Glodok Lt.4', v5: 'KPP Taman Sari · Glodok Lt.4', match: 'SATU GEDUNG', tone: 'warn' },
    { attr: 'Beneficial Owner (AHU)', v4: 'Hendra Wijaya (Dirut)', v5: 'Dewi Wijaya (Komisaris)', match: 'AFILIASI', tone: 'warn' },
  ];

  const boqRows = BOQ_ITEMS.map((b) => `
    <tr>
      <td class="mono" style="color:#64748b;">${b.no}</td>
      <td class="trunc" style="font-weight:500;">${esc(b.desc)}</td>
      <td class="num mono">${fmtJuta(b.hps)}</td>
      <td class="num mono" style="color:#047857;">${fmtJuta(b.v1)}</td>
      <td class="num mono" style="background:#fff5f6;">${fmtJuta(b.v4)}</td>
      <td class="num mono" style="background:#fff5f6;">${fmtJuta(b.v5)}</td>
      <td class="num mono" style="color:#be123c;font-weight:700;background:#fff1f2;">${b.ratio}x</td>
    </tr>
  `).join('');

  const contentHtml = `
    <div class="f-alert-strip" style="height:56px;">
      <div class="f-row" style="gap:12px;">
        <div style="width:34px;height:34px;border-radius:4px;background:#be123c;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${ic('alert', 17, '#ffffff')}
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:#881337;">KASUS ESKALASI ANTI-KOLUSI: CASE-AC-2026-089 · PKT-2026-BUMN-0418 (Genset 1500 kVA)</div>
          <div style="font-size:10.2px;color:#9f1239;">Terdeteksi indikasi kuat persekongkolan horizontal (cover bidding) antara <strong>VND-04 (PT Sinar Jaya Elektrika)</strong> & <strong>VND-05 (PT Cahaya Mandiri Teknik)</strong> · Skor Forensik: <strong>96/100</strong>.</div>
        </div>
      </div>
      <div class="f-row">
        ${badge('Status: TAHAN AUDIT SPI', 'bad')}
        ${badge('Rujukan: UU 5/1999 Ps. 22', 'neutral')}
      </div>
    </div>

    <div class="f-grid" style="grid-template-columns:830px 1fr;flex:1;min-height:0;">
      <div class="f-col">
        <div class="e-panel" style="height:426px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('globe', 13, '#be123c')}<span>Graf Resolusi Entitas & Jejaring Afiliasi Peserta Tender</span></div>
            <span class="e-panel-sub">5 Peserta · 5 Jembatan Bukti Forensik</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;">
            ${graphSvg}
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#be123c')}<span>Audit Pola Harga BoQ (Deteksi Cover-Bid Markup Konstan 1,0400x)</span></div>
            ${badge('8/8 Pos Identik +4,00%', 'bad')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:9.9px;">
              <thead>
                <tr>
                  <th style="width:5%;">No</th>
                  <th style="width:41%;">Uraian Pos Bill of Quantities (Genset 1500 kVA)</th>
                  <th class="num" style="width:11%;">HPS</th>
                  <th class="num" style="width:11%;">VND-01</th>
                  <th class="num" style="width:11%;">VND-04</th>
                  <th class="num" style="width:11%;">VND-05</th>
                  <th class="num" style="width:10%;">V5 / V4</th>
                </tr>
              </thead>
              <tbody>${boqRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total Penawaran BoQ (Terverifikasi 100%)</td>
                  <td class="num mono">${fmtMiliar(FOCUS_HPS)}</td>
                  <td class="num mono" style="color:#047857;">${fmtMiliar(GENSET_VENDORS[0].bidIdr)}</td>
                  <td class="num mono" style="color:#be123c;">${fmtMiliar(GENSET_VENDORS[3].bidIdr)}</td>
                  <td class="num mono" style="color:#be123c;">Rp 4,826 M</td>
                  <td class="num mono" style="color:#be123c;">1,0400x</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="f-col">
        <div class="e-panel" style="height:412px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#1f4e5f')}<span>Inspektor Diff Metadata Digital (VND-04 vs VND-05)</span></div>
            ${badge('6 Kecocokan Eksak', 'bad')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:27%;">Atribut Forensik</th>
                  <th style="width:29%;">VND-04 (PT Sinar Jaya)</th>
                  <th style="width:29%;">VND-05 (PT Cahaya Mandiri)</th>
                  <th style="width:15%;">Temuan</th>
                </tr>
              </thead>
              <tbody>
                ${metadataDiff
                  .map(
                    (m) => `<tr class="${m.tone === 'bad' ? 'is-bad' : 'is-warn'}">
                    <td style="font-weight:600;">${esc(m.attr)}</td>
                    <td class="mono" style="font-size:9.3px;">${esc(m.v4)}</td>
                    <td class="mono" style="font-size:9.3px;">${esc(m.v5)}</td>
                    <td>${badge(m.match, m.tone)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;margin-top:auto;background:#f8fafb;border-top:1px solid #d5dde0;">
              <div class="f-code-box">
                <div>[ANTI-COLLUSION ENGINE v3.4] Paket: PKT-2026-BUMN-0418</div>
                <div>MATCH_RULE_01: SameIPv4(103.144.82.19) &amp;&amp; UploadDelta(102s &lt; 300s) =&gt; +28</div>
                <div>MATCH_RULE_02: SamePDFAuthor("B. Santoso") &amp;&amp; SameXLSXEditor =&gt; +24</div>
                <div>MATCH_RULE_03: BoQConstantRatio(stddev=0.0000, ratio=1.0400) =&gt; +22</div>
                <div style="color:#fda4af;">ACTION: AUTO_HOLD_VENDORS([VND-04, VND-05]) -&gt; ESCALATE_SPI_AND_KOMITE</div>
              </div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#1f4e5f')}<span>Tindakan Komite Pengadaan, SPI & Usulan Sanksi Daftar Hitam</span></div>
            ${badge('SLA Klarifikasi 48 Jam', 'warn')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <div style="border:1px solid #d5dde0;border-radius:3px;padding:8px 10px;background:#f8fafb;">
              <div class="f-kv"><span class="f-kv-k">Dampak pada Peringkat Evaluasi</span><span class="f-kv-v" style="color:#047857;">VND-01 & VND-02 Tetap Sah (Independen)</span></div>
              <div class="f-kv"><span class="f-kv-k">Status Cek Daftar Hitam INAPROC/LKPP</span><span class="f-kv-v mono">Belum Terdaftar → Draf Usulan Sanksi 2 Thn</span></div>
              <div class="f-kv"><span class="f-kv-k">Pencairan Jaminan Penawaran (1% HPS)</span><span class="f-kv-v mono" style="color:#be123c;">Rp 48.500.000 × 2 = Rp 97.000.000</span></div>
              <div class="f-kv"><span class="f-kv-k">Pemeriksa SPI Ditugaskan</span><span class="f-kv-v">Drs. B. Hendrawan, Ak (Kepala SPI)</span></div>
              <div class="f-kv"><span class="f-kv-k">Dasar Hukum Gugur & Pelaporan</span><span class="f-kv-v">Perpres 16/2018 Ps. 78 · UU 5/1999 Ps. 22</span></div>
            </div>

            <div style="font-size:10.3px;color:#334155;line-height:1.4;padding:6px 8px;border-left:3px solid #1f4e5f;background:#eef5f7;border-radius:2px;">
              <strong>Keputusan Sementara Pokja:</strong> Diskualifikasi VND-04 & VND-05 pasca-klarifikasi tertulis, cairkan jaminan penawaran, lanjutkan proses penetapan pemenang ke <strong>VND-01 (PT Traktor Nusantara Prima)</strong> tanpa tender ulang karena ≥ 2 penawaran sah tersisa.
            </div>

            <div class="f-between" style="margin-top:auto;padding-top:6px;border-top:1px solid #e2e8f0;">
              <span class="e-btn">${ic('download', 11.5)}Ekspor Paket Bukti KPPU/SPI</span>
              <div class="f-row">
                <span class="e-btn e-btn-danger">${ic('alert', 11.5, '#be123c')}Usulkan Daftar Hitam</span>
                <span class="e-btn e-btn-primary">${ic('check', 11.5, '#fff')}Setujui Diskualifikasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p4',
    objTitle: 'Forensik Anti-Kolusi & Graf Afiliasi Vendor',
    objMetaHtml: `${badge('CASE-AC-2026-089', 'bad')}<span>Skor Anomali 96/100 · Deteksi IP, Metadata PDF & Pola Markup BoQ</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 11.5)}Berita Acara Klarifikasi</span>
      <span class="e-btn e-btn-danger">${ic('shield', 11.5, '#be123c')}Kirim Berkas ke SPI & Legal</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5: SIMULASI SKORING TEKNIS-KOMERSIAL & KALKULATOR HEA TKDN
// ============================================================================
function renderP5() {
  const policyBar = `
    <div class="f-info-strip" style="height:44px;padding:6px 10px;">
      <div class="f-row" style="gap:10px;font-size:10.5px;">
        <span style="font-weight:700;color:#143440;">Formula Evaluasi Sistem Nilai (Perpres 16/2018 & Permenperin 16/2011):</span>
        ${badge('Bobot Teknis 60%', 'accent')}
        ${badge('Bobot Komersial HEA 40%', 'accent')}
        ${badge('Preferensi TKDN Maks 25%', 'ok')}
        <span class="mono" style="font-size:10px;color:#143440;">KP = TKDN% × 25% · HEA = (1 - KP) × Bid · Lulus Teknis ≥ 75</span>
      </div>
      <span class="mono" style="font-size:10.2px;font-weight:700;color:#143440;">Pagu HPS: ${fmtIdr(FOCUS_HPS)}</span>
    </div>
  `;

  const matrixRows = GENSET_VENDORS.map((v) => `
    <tr class="${v.verdict === 'Rank #1' ? 'is-selected' : v.collusionFlag ? 'is-bad' : v.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;">${esc(v.code)}</td>
      <td style="font-weight:600;">${esc(v.name)}</td>
      <td class="num mono">${v.scores.spec}</td>
      <td class="num mono">${v.scores.warranty}</td>
      <td class="num mono">${v.scores.exp}</td>
      <td class="num mono">${v.scores.hse}</td>
      <td class="num mono">${v.scores.delivery}</td>
      <td class="num mono" style="font-weight:700;color:#143440;">${v.techScore.toFixed(1).replace('.', ',')}</td>
      <td class="num mono">${fmtIdr(v.bidIdr)}</td>
      <td class="num mono" style="color:${v.tkdnPct >= 40 ? '#047857' : '#b45309'};font-weight:600;">${fmtPct(v.tkdnPct)}</td>
      <td class="num mono">${fmtPct(v.kp * 100, 2)}</td>
      <td class="num mono" style="font-weight:700;color:#1f4e5f;">${fmtIdr(v.heaIdr)}</td>
      <td class="num mono">${v.eligible ? v.commScore.toFixed(2).replace('.', ',') : '—'}</td>
      <td class="num mono" style="font-weight:800;font-size:11px;color:${v.verdict === 'Rank #1' ? '#047857' : '#0f172a'};">${v.eligible ? v.finalScore.toFixed(2).replace('.', ',') : 'Gugur/Tahan'}</td>
      <td>${badge(v.verdict, v.tone)}</td>
    </tr>
  `).join('');

  // Custom SVG Horizontal Comparison Bar Chart: Raw Bid vs HEA vs HPS Threshold
  // Dedicated right-hand value column prevents ANY label collision with the HPS dashed line!
  const maxBarVal = 5100000000;
  const barX0 = 186;
  const barWMax = 452;
  const hpsX = barX0 + (FOCUS_HPS / maxBarVal) * barWMax;
  const valColX = 656;

  const heaChartSvg = `
    <svg viewBox="0 0 854 388" width="100%" height="388" style="display:block;">
      <rect x="0" y="0" width="854" height="388" fill="#ffffff" />
      <!-- Legend -->
      <rect x="186" y="8" width="10" height="8" rx="1" fill="#94a3b8" />
      <text x="200" y="15.5" font-size="9.5" font-weight="600" fill="#334155">Harga Penawaran Bruto (Bid)</text>
      <rect x="366" y="8" width="10" height="8" rx="1" fill="#1f4e5f" />
      <text x="380" y="15.5" font-size="9.5" font-weight="600" fill="#334155">Harga Evaluasi Akhir (HEA TKDN)</text>
      <line x1="564" y1="12" x2="584" y2="12" stroke="#be123c" stroke-width="1.6" stroke-dasharray="4,2" />
      <text x="590" y="15.5" font-size="9.5" font-weight="700" fill="#be123c">Pagu HPS Rp 4,85 M</text>

      <!-- Value Column Header -->
      <text x="${valColX}" y="35" font-size="9" font-weight="700" fill="#475569" font-family="ui-monospace,Consolas,monospace">NILAI BID &amp; HEA (RP)</text>

      <!-- Grid X ticks -->
      ${[0, 1, 2, 3, 4, 5].map((m) => {
        const x = barX0 + ((m * 1e9) / maxBarVal) * barWMax;
        return `
          <line x1="${x.toFixed(1)}" y1="42" x2="${x.toFixed(1)}" y2="356" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="${m > 0 ? '2,3' : ''}" />
          <text x="${x.toFixed(1)}" y="374" text-anchor="middle" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#64748b">Rp ${m} M</text>
        `;
      }).join('')}

      <!-- Vendor Bars -->
      ${GENSET_VENDORS.map((v, i) => {
        const y = 50 + i * 60;
        const wBid = (v.bidIdr / maxBarVal) * barWMax;
        const wHea = (v.heaIdr / maxBarVal) * barWMax;
        const heaColor = v.collusionFlag ? '#fda4af' : v.tone === 'warn' ? '#fcd34d' : i === 0 ? '#047857' : '#1f4e5f';
        const bidColor = v.collusionFlag ? '#fecdd3' : v.tone === 'warn' ? '#fde68a' : '#cbd5e1';
        return `
          <text x="178" y="${y + 16}" text-anchor="end" font-size="10.2" font-weight="700" fill="#0f172a">${esc(v.code)} · ${esc(v.name.slice(0, 18))}</text>
          <text x="178" y="${y + 30}" text-anchor="end" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#52636d">TKDN ${esc(fmtPct(v.tkdnPct))} · ${esc(v.verdict)}</text>

          <!-- Bid bar -->
          <rect x="${barX0}" y="${y + 4}" width="${wBid.toFixed(1)}" height="15" rx="2" fill="${bidColor}" />
          <text x="${valColX}" y="${y + 15}" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="#334155">Bid: ${esc(fmtMiliar(v.bidIdr))} (${v.deltaHpsPct >= 0 ? '+' : ''}${v.deltaHpsPct.toFixed(1).replace('.', ',')}%)</text>

          <!-- HEA bar -->
          <rect x="${barX0}" y="${y + 23}" width="${wHea.toFixed(1)}" height="16" rx="2" fill="${heaColor}" />
          <text x="${valColX}" y="${y + 35}" font-size="9.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${v.collusionFlag ? '#be123c' : i === 0 ? '#047857' : '#143440'}">HEA: ${esc(fmtMiliar(v.heaIdr))}${v.kp > 0 ? ' (-' + fmtPct(v.kp * 100, 1) + ')' : ' (Gugur)'}</text>
        `;
      }).join('')}

      <!-- HPS Vertical Threshold Line -->
      <line x1="${hpsX.toFixed(1)}" y1="40" x2="${hpsX.toFixed(1)}" y2="358" stroke="#be123c" stroke-width="1.8" stroke-dasharray="5,3" />
      <rect x="${(hpsX - 38).toFixed(1)}" y="24" width="76" height="15" rx="2" fill="#be123c" />
      <text x="${hpsX.toFixed(1)}" y="34.5" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">HPS 4,85 M</text>
    </svg>
  `;

  // What-If Weight Sensitivity Scenarios (Calculated mathematically!)
  const v1 = GENSET_VENDORS[0];
  const v2 = GENSET_VENDORS[1];
  const noTkdnComm2 = Number(((v1.bidIdr / v2.bidIdr) * 100).toFixed(2));
  const scenarios = [
    {
      name: 'Skenario Aktif (60% Tek / 40% HEA)',
      s1: (0.60 * v1.techScore + 0.40 * v1.commScore).toFixed(2),
      s2: (0.60 * v2.techScore + 0.40 * v2.commScore).toFixed(2),
      winner: 'VND-01',
      active: true,
    },
    {
      name: 'Teknis Ketat (70% Tek / 30% HEA)',
      s1: (0.70 * v1.techScore + 0.30 * v1.commScore).toFixed(2),
      s2: (0.70 * v2.techScore + 0.30 * v2.commScore).toFixed(2),
      winner: 'VND-01',
    },
    {
      name: 'Seimbang (50% Tek / 50% HEA)',
      s1: (0.50 * v1.techScore + 0.50 * v1.commScore).toFixed(2),
      s2: (0.50 * v2.techScore + 0.50 * v2.commScore).toFixed(2),
      winner: 'VND-01',
    },
    {
      name: 'Tanpa Preferensi TKDN (60/40 Bruto)',
      s1: (0.60 * v1.techScore + 0.40 * 100).toFixed(2),
      s2: (0.60 * v2.techScore + 0.40 * noTkdnComm2).toFixed(2),
      winner: 'VND-01',
    },
  ];

  const contentHtml = `
    ${policyBar}
    <div class="e-panel" style="height:242px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('sliders', 13, '#1f4e5f')}<span>Matriks Evaluasi Teknis (5 Sub-Kriteria) & Komersial Berbasis HEA TKDN</span></div>
        <div class="f-row">${badge('2 Peserta Sah', 'ok')}${badge('1 Gugur HPS', 'warn')}${badge('2 Ditahan Audit', 'bad')}</div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table" style="font-size:10px;">
          <thead>
            <tr>
              <th style="width:5.5%;">Kode</th>
              <th style="width:15%;">Nama Vendor</th>
              <th class="num" style="width:4.5%;">Spek<br/>30%</th>
              <th class="num" style="width:4.5%;">Gar<br/>20%</th>
              <th class="num" style="width:4.5%;">Peng<br/>20%</th>
              <th class="num" style="width:4.5%;">K3<br/>15%</th>
              <th class="num" style="width:4.5%;">Jdw<br/>15%</th>
              <th class="num" style="width:5.5%;">Skor<br/>Teknis</th>
              <th class="num" style="width:10.5%;">Penawaran<br/>Bruto</th>
              <th class="num" style="width:5.5%;">TKDN</th>
              <th class="num" style="width:5.5%;">KP</th>
              <th class="num" style="width:10.5%;">HEA<br/>(Net TKDN)</th>
              <th class="num" style="width:5.5%;">Skor<br/>Kom</th>
              <th class="num" style="width:6.5%;">Skor<br/>Akhir</th>
              <th style="width:7.5%;">Status</th>
            </tr>
          </thead>
          <tbody>${matrixRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="8">Acuan Evaluasi: HEA Terendah Sah = ${fmtIdr(LOWEST_ELIGIBLE_HEA)} (VND-01) · Penghematan Kontrak = ${fmtIdr(FOCUS_HPS - v1.bidIdr)} (-5,6% HPS)</td>
              <td class="num mono">${fmtIdr(FOCUS_HPS)}</td>
              <td class="num mono">≥ 40%</td>
              <td colspan="5" style="text-align:right;color:#047857;">Calon Pemenang: VND-01 PT Traktor Nusantara Prima (Skor 95,20)</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="f-grid" style="grid-template-columns:878px 1fr;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#1f4e5f')}<span>Visualisasi Penawaran Bruto vs Harga Evaluasi Akhir (HEA) & Batas HPS</span></div>
          <span class="e-panel-sub">Dampak Insentif Preferensi TKDN P3DN</span>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;">
          ${heaChartSvg}
          <div style="font-size:10px;color:#475569;padding-top:6px;border-top:1px solid #e6ebf1;display:flex;justify-content:space-between;">
            <span><strong>Catatan Audit BPK:</strong> Preferensi harga TKDN hanya digunakan untuk menentukan peringkat HEA; nilai kontrak PO tetap sebesar penawaran bruto <strong>${fmtIdr(v1.bidIdr)}</strong>.</span>
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#047857')}<span>Simulasi Sensitivitas Bobot (What-If Committee Simulator)</span></div>
          ${badge('Pemenang Stabil 4/4', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <table class="e-table" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:48%;">Skenario Pembobotan</th>
                <th class="num" style="width:15%;">VND-01</th>
                <th class="num" style="width:15%;">VND-02</th>
                <th class="num" style="width:11%;">Margin</th>
                <th style="width:11%;">Rank #1</th>
              </tr>
            </thead>
            <tbody>
              ${scenarios
                .map((s) => {
                  const margin = (Number(s.s1) - Number(s.s2)).toFixed(2).replace('.', ',');
                  return `<tr class="${s.active ? 'is-selected' : ''}">
                    <td style="font-weight:${s.active ? '700' : '500'};">${esc(s.name)}</td>
                    <td class="num mono" style="font-weight:700;color:#047857;">${s.s1.replace('.', ',')}</td>
                    <td class="num mono">${s.s2.replace('.', ',')}</td>
                    <td class="num mono" style="color:#1f4e5f;">+${margin}</td>
                    <td>${badge(s.winner, 'ok')}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>

          <div style="border:1px solid #a7f3d0;border-radius:3px;padding:9px 10px;background:#f4fcf8;">
            <div class="f-between" style="margin-bottom:4px;">
              <span style="font-size:10.8px;font-weight:700;color:#047857;">Rekomendasi Berita Acara Hasil Evaluasi (BAHE)</span>
              ${badge('Siap Kirim DoA Tier 3', 'ok')}
            </div>
            <div style="font-size:10.2px;color:#1e293b;line-height:1.42;">
              <strong>PT Traktor Nusantara Prima (VND-01)</strong> unggul konsisten di seluruh skenario sensitivitas dengan penawaran <strong>${fmtIdr(v1.bidIdr)}</strong> (hemat <strong>${fmtIdr(FOCUS_HPS - v1.bidIdr)}</strong> di bawah HPS), sertifikat TKDN terverifikasi <strong>44,2%</strong>, dan skor teknis tertinggi <strong>92,0</strong>.
            </div>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:8px 10px;background:#ffffff;">
            <div style="font-size:10.3px;font-weight:700;color:#143440;margin-bottom:5px;">Profil Sub-Kriteria Teknis Pemenang (VND-01 · Skor Teknis 92,0)</div>
            ${[
              { lbl: 'Spesifikasi Prime Power 1500 kVA (30%)', val: 92 },
              { lbl: 'Garansi, Suku Cadang & Purna Jual (20%)', val: 92 },
              { lbl: 'Pengalaman Kontrak Pembangkit Sejenis (20%)', val: 92 },
              { lbl: 'Sertifikasi K3, ISO 45001 & Teknisi (15%)', val: 94 },
              { lbl: 'Jadwal Pengiriman & Commissioning (15%)', val: 90 },
            ]
              .map(
                (k) => `<div style="display:grid;grid-template-columns:255px 1fr;align-items:center;gap:8px;margin-bottom:4px;font-size:9.8px;">
                <span class="trunc" style="color:#334155;">${esc(k.lbl)}</span>
                ${renderCapacityBar(k.val, { warnAt: 101, critAt: 101 })}
              </div>`
              )
              .join('')}
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:8px 10px;background:#f8fafb;margin-top:auto;">
            <div class="f-kv"><span class="f-kv-k">Efisiensi Kontrak vs HPS</span><span class="f-kv-v mono" style="color:#047857;">${fmtIdr(FOCUS_HPS - v1.bidIdr)} (5,57%)</span></div>
            <div class="f-kv"><span class="f-kv-k">Keunggulan Skor vs Rank #2</span><span class="f-kv-v mono">+3,85 poin (95,20 vs 91,35)</span></div>
            <div class="f-kv"><span class="f-kv-k">Nilai Komitmen Kontrak Lokal (TKDN)</span><span class="f-kv-v mono">${fmtIdr(Math.round(v1.bidIdr * (v1.tkdnPct / 100)))}</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p5',
    objTitle: 'Simulasi Skoring Teknis-Komersial & Kalkulator HEA TKDN',
    objMetaHtml: `${badge('SKOR VND-01: 95,20 (RANK #1)', 'ok')}<span>PKT-2026-BUMN-0418 · Bobot 60/40 · Preferensi TKDN Maks 25%</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('download', 11.5)}Ekspor Kertas Kerja BAHE</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 11.5, '#fff')}Kunci Hasil & Ajukan DoA</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 6: PRAKUALIFIKASI VENDOR KYC, OSS-RBA, TKDN & INTEGRASI ERP/CORETAX
// ============================================================================
function renderP6() {
  const gatewayStrip = `
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="e-kpi" style="padding:6px 10px;">
        <div class="e-kpi-top"><span>OSS-RBA BKPM (NIB & KBLI)</span>${badge('200 OK · 142ms', 'ok')}</div>
        <div class="f-between" style="margin-top:2px;">
          <span class="mono" style="font-size:13px;font-weight:700;">15/15 Tersinkron</span>
          <span style="font-size:9.8px;color:#b45309;font-weight:600;">1 NIB Hampir Habis</span>
        </div>
      </div>
      <div class="e-kpi" style="padding:6px 10px;">
        <div class="e-kpi-top"><span>P3DN Kemenperin (Sertifikat TKDN)</span>${badge('200 OK · 198ms', 'ok')}</div>
        <div class="f-between" style="margin-top:2px;">
          <span class="mono" style="font-size:13px;font-weight:700;">Rata-rata 52,2%</span>
          <span style="font-size:9.8px;color:#047857;font-weight:600;">13/15 ≥ 40%</span>
        </div>
      </div>
      <div class="e-kpi" style="padding:6px 10px;">
        <div class="e-kpi-top"><span>DJP CoreTax (NPWP 16 & Status PKP)</span>${badge('200 OK · 164ms', 'ok')}</div>
        <div class="f-between" style="margin-top:2px;">
          <span class="mono" style="font-size:13px;font-weight:700;">15/15 PKP Aktif</span>
          <span style="font-size:9.8px;color:#1f4e5f;font-weight:600;">WAPU Kode 030</span>
        </div>
      </div>
      <div class="e-kpi" style="padding:6px 10px;">
        <div class="e-kpi-top"><span>SAP S/4HANA MM/FI & INAPROC</span>${badge('RFC Aktif · 48ms', 'ok')}</div>
        <div class="f-between" style="margin-top:2px;">
          <span class="mono" style="font-size:13px;font-weight:700;">PO Draft Siap</span>
          <span style="font-size:9.8px;color:#be123c;font-weight:600;">2 Tahan Daftar Hitam</span>
        </div>
      </div>
    </div>
  `;

  const vendorRows = VENDOR_MASTER.map((v) => `
    <tr class="${v.selected ? 'is-selected' : v.tone === 'bad' ? 'is-bad' : v.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(v.code)}</td>
      <td style="font-weight:${v.selected ? '700' : '600'};">${esc(v.name)}</td>
      <td class="mono" style="font-size:9.8px;">${esc(v.nib)}</td>
      <td class="mono" style="font-size:9.5px;">${esc(v.npwp)}</td>
      <td class="num mono" style="color:${v.tkdn >= 40 ? '#047857' : '#b45309'};font-weight:700;">${fmtPct(v.tkdn)}</td>
      <td class="mono" style="font-size:9.8px;">${esc(v.valid)}</td>
      <td>${badge(v.lkpp, v.lkpp === 'Bersih' ? 'ok' : 'bad')}</td>
      <td class="num mono">Rp ${v.limitM} M</td>
      <td>${badge(v.status, v.tone)}</td>
    </tr>
  `).join('');

  const journalRows = PSAK_JOURNAL.map((j) => `
    <tr>
      <td class="mono" style="color:#1f4e5f;font-weight:700;">${esc(j.acc)}</td>
      <td class="trunc" style="font-weight:500;">${esc(j.label)}</td>
      <td class="num mono" style="color:${j.dr > 0 ? '#0f172a' : '#94a3b8'};font-weight:${j.dr > 0 ? '600' : '400'};">${j.dr > 0 ? fmtIdr(j.dr) : '—'}</td>
      <td class="num mono" style="color:${j.cr > 0 ? '#0f172a' : '#94a3b8'};font-weight:${j.cr > 0 ? '600' : '400'};">${j.cr > 0 ? fmtIdr(j.cr) : '—'}</td>
    </tr>
  `).join('');

  const contentHtml = `
    ${gatewayStrip}
    <div class="f-grid" style="grid-template-columns:986px 1fr;flex:1;min-height:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 13, '#1f4e5f')}<span>Master Registry Prakualifikasi KYC Vendor, OSS-RBA, PKP & TKDN (15 Vendor)</span></div>
          <div class="f-row">${badge('11 Terverifikasi', 'ok')}${badge('2 Perlu Pembaruan', 'warn')}${badge('2 Ditahan Audit', 'bad')}</div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table p6-dense" style="font-size:10.2px;">
            <thead>
              <tr>
                <th style="width:6.5%;">Kode</th>
                <th style="width:21.5%;">Nama Badan Usaha</th>
                <th style="width:12.5%;">NIB OSS-RBA</th>
                <th style="width:14.5%;">NPWP 16-Digit</th>
                <th class="num" style="width:6.5%;">TKDN</th>
                <th style="width:8.5%;">Berlaku</th>
                <th style="width:8.5%;">LKPP</th>
                <th class="num" style="width:7.5%;">Limit</th>
                <th style="width:14%;">Status KYC</th>
              </tr>
            </thead>
            <tbody>${vendorRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total 15 Vendor Terdaftar pada Kategori Pengadaan Energi & Mesin</td>
                <td class="num mono">52,2%</td>
                <td colspan="2">13 Bersih · 2 Tahan</td>
                <td class="num mono">Rp ${VENDOR_MASTER.reduce((a, v) => a + v.limitM, 0)} M</td>
                <td>${badge('Sinkron Live', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:10px 11px;margin-top:auto;background:#f8fafb;border-top:1px solid #d5dde0;font-size:10.1px;color:#475569;">
            <strong>Aturan Prakualifikasi Otomatis:</strong> Vendor dengan NIB kedaluwarsa, status PKP dicabut CoreTax, atau masuk Daftar Hitam INAPROC diblokir otomatis pada tahap unduh dokumen tender (RFP).
          </div>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head" style="background:#eef5f7;border-bottom-color:#c2d7df;">
          <div class="e-panel-title">${ic('database', 13, '#1f4e5f')}<span>Pra-Posting SAP PO & CoreTax WAPU · VND-01</span></div>
          ${badge('PO Draft #4500198422', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <div style="border:1px solid #d5dde0;border-radius:3px;padding:7px 9px;background:#f8fafb;">
            <div class="f-between" style="margin-bottom:3px;">
              <span style="font-size:11px;font-weight:700;color:#0f172a;">PT Traktor Nusantara Prima</span>
              ${badge('KYC 100% Lolos', 'ok')}
            </div>
            <div class="f-kv"><span class="f-kv-k">NIB OSS-RBA / KBLI 46591</span><span class="f-kv-v mono">9120208411902 (Aktif · Risiko Menengah)</span></div>
            <div class="f-kv"><span class="f-kv-k">NPWP 16 CoreTax / Status PKP</span><span class="f-kv-v mono">0013489210091000 · PKP Valid</span></div>
            <div class="f-kv"><span class="f-kv-k">Tanda Sah TKDN Kemenperin</span><span class="f-kv-v mono">4812/SJ-IND.8/TKDN/04/2026 (44,2%)</span></div>
            <div class="f-kv"><span class="f-kv-k">SAP Vendor ID / WBS Cost Center</span><span class="f-kv-v mono">10048291 · CC-PLTU-3041</span></div>
          </div>

          <div style="border:1px solid #bdd4dc;border-radius:3px;padding:7px 9px;background:#eef5f7;">
            <div style="font-size:10.3px;font-weight:700;color:#143440;margin-bottom:4px;">Kalkulasi Pajak Pemungut BUMN (WAPU · PMK 8/PMK.03/2021)</div>
            <div class="f-kv"><span class="f-kv-k">Nilai Kontrak / DPP (VND-01)</span><span class="f-kv-v mono">${fmtIdr(PO_DPP)}</span></div>
            <div class="f-kv"><span class="f-kv-k">PPN 11% WAPU (Kode Faktur 030 · Setor BUMN)</span><span class="f-kv-v mono">${fmtIdr(PO_PPN_WAPU)}</span></div>
            <div class="f-kv"><span class="f-kv-k">Bruto Faktur Pajak (DPP + PPN)</span><span class="f-kv-v mono">${fmtIdr(PO_GROSS)}</span></div>
            <div class="f-kv"><span class="f-kv-k">Potongan PPh Pasal 22 BUMN (1,5% × DPP)</span><span class="f-kv-v mono" style="color:#be123c;">-${fmtIdr(PO_PPH22)}</span></div>
            <div class="f-kv" style="border-top:1px solid #9ab9c5;padding-top:5px;"><span class="f-kv-k" style="font-weight:700;color:#143440;">Net Transfer ke Rekening Vendor</span><span class="f-kv-v mono" style="color:#047857;font-size:11.5px;">${fmtIdr(PO_NET_VENDOR)}</span></div>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;overflow:hidden;">
            <div style="padding:5px 8px;background:#f1f5f9;border-bottom:1px solid #d5dde0;font-size:10px;font-weight:700;color:#143440;display:flex;justify-content:space-between;">
              <span>Jurnal Akrual & Komitmen PSAK (SAP FI)</span>
              <span class="mono" style="color:#047857;">SEIMBANG</span>
            </div>
            <table class="e-table" style="font-size:9.3px;">
              <thead>
                <tr>
                  <th style="width:17%;">Akun GL</th>
                  <th style="width:41%;">Deskripsi Akun</th>
                  <th class="num" style="width:21%;">Debit (Rp)</th>
                  <th class="num" style="width:21%;">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody>${journalRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total Jurnal (Dr === Cr)</td>
                  <td class="num mono">${fmtIdr(PO_GROSS)}</td>
                  <td class="num mono">${fmtIdr(PO_GROSS)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="border:1px solid #d5dde0;border-radius:3px;padding:6px 9px;background:#ffffff;display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#334155;">
            <span><strong>Validasi Pra-Posting SAP S/4HANA:</strong> Budget WBS CC-PLTU-3041 tersedia · Tidak ada blokir pajak.</span>
            ${badge('Siap Posting PO', 'ok')}
          </div>

          <div class="f-code-box" style="margin-top:auto;">
            <div>&lt;TaxInvoice xmlns="urn:djp:coretax:efaktur:v2"&gt;</div>
            <div>  &lt;TrxCode&gt;030&lt;/TrxCode&gt;&lt;BuyerNPWP&gt;0010002940093000&lt;/BuyerNPWP&gt;</div>
            <div>  &lt;SellerNPWP&gt;0013489210091000&lt;/SellerNPWP&gt;&lt;DPP&gt;4580000000&lt;/DPP&gt;</div>
            <div>  &lt;PPN&gt;503800000&lt;/PPN&gt;&lt;PPh22&gt;68700000&lt;/PPh22&gt;&lt;TKDN&gt;44.2&lt;/TKDN&gt;</div>
            <div>&lt;/TaxInvoice&gt; <span style="color:#86efac;">// XSD Valid · Siap Generate saat SPPBJ</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p6',
    objTitle: 'Prakualifikasi KYC Vendor, OSS-RBA, TKDN & Integrasi SAP/CoreTax',
    objMetaHtml: `${badge('15 VENDOR TERVERIFIKASI API', 'ok')}<span>Validasi Real-Time BKPM OSS-RBA · P3DN Kemenperin · DJP CoreTax · SAP MM/FI</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 11.5)}Sinkronisasi Ulang OSS & CoreTax</span>
      <span class="e-btn e-btn-primary">${ic('database', 11.5, '#fff')}Buat Draft PO SAP S/4HANA</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 7: MATRIKS DOA, PERSETUJUAN BERJENJANG & ELSA WORKFLOW ENGINE
// ============================================================================
function renderP7() {
  const doaSteps = [
    { step: '1. Maker', actor: 'Ir. H. Darmawan', role: 'Ketua Pokja Pengadaan', status: 'Selesai', time: '22 Nov 10:12 WIB', cls: 'is-done', tone: 'ok', note: 'BAHE & HEA 95,20 Terkunci' },
    { step: '2. Verifikator Teknis', actor: 'Ir. T. Gunawan, IPM', role: 'VP Engineering Pembangkitan', status: 'Selesai', time: '22 Nov 10:28 WIB', cls: 'is-done', tone: 'ok', note: 'Spek 1500 kVA & SLO Valid' },
    { step: '3. Checker Kepatuhan', actor: 'Drs. B. Hendrawan, Ak', role: 'Kepala SPI & Legal Korporat', status: 'Ditinjau', time: 'SLA: Sisa 3j 15m', cls: 'is-active', tone: 'warn', note: 'Validasi Diskualifikasi VND-04/05' },
    { step: '4. Approver Keuangan', actor: 'N. Rachmawati, CFA', role: 'Direktur Keuangan & Risiko', status: 'Menunggu', time: 'Otomatis Pasca-SPI', cls: 'is-wait', tone: 'neutral', note: 'Cek RKAP & WAPU Rp 4,58 M' },
    { step: '5. Final Sign-Off', actor: 'Dr. A. Suryaputra', role: 'Direktur Utama (Tier 3)', status: 'Menunggu', time: 'Target 23 Nov 15:00', cls: 'is-wait', tone: 'neutral', note: 'Otorisasi SPPBJ & SAP PO' },
  ];

  const elsaDagSvg = `
    <svg viewBox="0 0 886 338" width="100%" height="338" style="display:block;">
      <rect x="0" y="0" width="886" height="338" fill="#f8fafb" rx="3" stroke="#d5dde0" />
      <text x="14" y="21" font-size="9.5" font-weight="700" fill="#143440" font-family="ui-monospace,Consolas,monospace">ELSA WORKFLOW DEFINITION: eTender-SealedBid-v4.2 · INSTANCE #WF-0418-9921 (RUNNING)</text>

      <!-- Main Horizontal Flow Connectors -->
      <line x1="126" y1="88" x2="156" y2="88" stroke="#047857" stroke-width="1.8" />
      <line x1="286" y1="88" x2="316" y2="88" stroke="#047857" stroke-width="1.8" />
      <line x1="452" y1="88" x2="482" y2="88" stroke="#047857" stroke-width="1.8" />
      <line x1="628" y1="88" x2="658" y2="88" stroke="#b45309" stroke-width="1.8" />
      <line x1="794" y1="88" x2="824" y2="88" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" />

      <!-- Branch from Prakualifikasi down to 3 Parallel API Gates -->
      <line x1="221" y1="120" x2="221" y2="152" stroke="#047857" stroke-width="1.4" />
      <line x1="76" y1="152" x2="366" y2="152" stroke="#047857" stroke-width="1.4" />
      <line x1="76" y1="152" x2="76" y2="168" stroke="#047857" stroke-width="1.4" />
      <line x1="221" y1="152" x2="221" y2="168" stroke="#047857" stroke-width="1.4" />
      <line x1="366" y1="152" x2="366" y2="168" stroke="#047857" stroke-width="1.4" />

      <!-- Branch from Anti-Collusion Guard down to SPI Escalation Subflow -->
      <line x1="555" y1="120" x2="555" y2="168" stroke="#be123c" stroke-width="1.8" stroke-dasharray="4,2" />
      <polygon points="551,163 555,169 559,163" fill="#be123c" />

      <!-- Branch from DoA Tier 3 down to Masa Sanggah -> SPPBJ -> SAP PO -->
      <line x1="726" y1="120" x2="726" y2="250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="726" y1="250" x2="646" y2="250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="510" y1="292" x2="466" y2="292" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="330" y1="292" x2="286" y2="292" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" />

      <!-- TOP ROW NODES -->
      <!-- 1. RUP -->
      <rect x="14" y="54" width="112" height="66" rx="4" fill="#ecfdf5" stroke="#047857" stroke-width="1.5" />
      <text x="22" y="71" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">STEP 01 · DONE</text>
      <text x="22" y="86" font-size="10" font-weight="700" fill="#0f172a">Pengumuman RUP</text>
      <text x="22" y="100" font-size="8.4" fill="#475569">HPS Rp 4,85 M</text>
      <text x="22" y="112" font-size="8" fill="#047857" font-family="ui-monospace,Consolas,monospace">10 Nov 09:00</text>

      <!-- 2. Prakualifikasi -->
      <rect x="156" y="54" width="130" height="66" rx="4" fill="#ecfdf5" stroke="#047857" stroke-width="1.5" />
      <text x="164" y="71" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">STEP 02 · DONE</text>
      <text x="164" y="86" font-size="10" font-weight="700" fill="#0f172a">Prakualifikasi KYC</text>
      <text x="164" y="100" font-size="8.4" fill="#475569">5/5 Vendor Lolos</text>
      <text x="164" y="112" font-size="8" fill="#047857" font-family="ui-monospace,Consolas,monospace">3 API Paralel OK</text>

      <!-- 3. Time-Locked Vault -->
      <rect x="316" y="54" width="136" height="66" rx="4" fill="#ecfdf5" stroke="#047857" stroke-width="1.5" />
      <text x="324" y="71" font-size="8.5" font-weight="700" fill="#047857" font-family="ui-monospace,Consolas,monospace">STEP 03 · DONE</text>
      <text x="324" y="86" font-size="10" font-weight="700" fill="#0f172a">RSA-4096 Bid Vault</text>
      <text x="324" y="100" font-size="8.4" fill="#475569">Quorum 3/5 Shamir</text>
      <text x="324" y="112" font-size="8" fill="#047857" font-family="ui-monospace,Consolas,monospace">22 Nov 10:00:31</text>

      <!-- 4. Anti-Collusion + HEA -->
      <rect x="482" y="54" width="146" height="66" rx="4" fill="#fffbeb" stroke="#b45309" stroke-width="2" />
      <text x="490" y="71" font-size="8.5" font-weight="700" fill="#b45309" font-family="ui-monospace,Consolas,monospace">STEP 04 · ACTIVE GATE</text>
      <text x="490" y="86" font-size="10" font-weight="700" fill="#0f172a">Anti-Kolusi &amp; HEA</text>
      <text x="490" y="100" font-size="8.4" fill="#475569">Rank #1: VND-01 (95,2)</text>
      <text x="490" y="112" font-size="8" fill="#be123c" font-weight="700" font-family="ui-monospace,Consolas,monospace">2 Flag -&gt; Branch SPI</text>

      <!-- 5. DoA Tier 3 -->
      <rect x="658" y="54" width="136" height="66" rx="4" fill="#eef5f7" stroke="#1f4e5f" stroke-width="1.6" />
      <text x="666" y="71" font-size="8.5" font-weight="700" fill="#1f4e5f" font-family="ui-monospace,Consolas,monospace">STEP 05 · IN REVIEW</text>
      <text x="666" y="86" font-size="10" font-weight="700" fill="#0f172a">DoA Tier 3 (5 Tahap)</text>
      <text x="666" y="100" font-size="8.4" fill="#475569">2/5 Selesai · Di SPI</text>
      <text x="666" y="112" font-size="8" fill="#1f4e5f" font-family="ui-monospace,Consolas,monospace">SoD Guard: Enforced</text>

      <!-- 6. End indicator -->
      <rect x="824" y="68" width="48" height="38" rx="4" fill="#f1f5f9" stroke="#94a3b8" />
      <text x="848" y="90" text-anchor="middle" font-size="8.5" font-weight="700" fill="#475569">WORM</text>

      <!-- PARALLEL KYC NODES -->
      <rect x="14" y="168" width="124" height="44" rx="3" fill="#ffffff" stroke="#a7f3d0" />
      <text x="22" y="184" font-size="8.8" font-weight="700" fill="#047857">OSS-RBA BKPM</text>
      <text x="22" y="198" font-size="8" fill="#475569" font-family="ui-monospace,Consolas,monospace">NIB &amp; KBLI: 5/5 OK</text>

      <rect x="159" y="168" width="124" height="44" rx="3" fill="#ffffff" stroke="#a7f3d0" />
      <text x="167" y="184" font-size="8.8" font-weight="700" fill="#047857">P3DN Kemenperin</text>
      <text x="167" y="198" font-size="8" fill="#475569" font-family="ui-monospace,Consolas,monospace">TKDN ≥40%: 4/5 OK</text>

      <rect x="304" y="168" width="124" height="44" rx="3" fill="#ffffff" stroke="#a7f3d0" />
      <text x="312" y="184" font-size="8.8" font-weight="700" fill="#047857">CoreTax &amp; LKPP</text>
      <text x="312" y="198" font-size="8" fill="#475569" font-family="ui-monospace,Consolas,monospace">PKP &amp; Blacklist OK</text>

      <!-- SPI EXCEPTION BRANCH -->
      <rect x="466" y="168" width="212" height="58" rx="4" fill="#fff1f2" stroke="#be123c" stroke-width="1.6" />
      <text x="476" y="185" font-size="8.8" font-weight="700" fill="#be123c" font-family="ui-monospace,Consolas,monospace">EXCEPTION SUBFLOW · SPI HOLD</text>
      <text x="476" y="200" font-size="9.6" font-weight="700" fill="#881337">Investigasi VND-04 &amp; VND-05</text>
      <text x="476" y="214" font-size="8.3" fill="#9f1239">CASE-AC-2026-089 · Tahan Jaminan Rp 97 Jt</text>

      <!-- BOTTOM POST-APPROVAL PIPELINE -->
      <rect x="510" y="262" width="136" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-dasharray="4,2" />
      <text x="518" y="279" font-size="8.5" font-weight="700" fill="#64748b" font-family="ui-monospace,Consolas,monospace">STEP 06 · QUEUED</text>
      <text x="518" y="294" font-size="9.8" font-weight="700" fill="#334155">Masa Sanggah 5 HK</text>
      <text x="518" y="308" font-size="8.2" fill="#64748b">Publikasi Portal Vendor</text>

      <rect x="330" y="262" width="136" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-dasharray="4,2" />
      <text x="338" y="279" font-size="8.5" font-weight="700" fill="#64748b" font-family="ui-monospace,Consolas,monospace">STEP 07 · QUEUED</text>
      <text x="338" y="294" font-size="9.8" font-weight="700" fill="#334155">Terbit SPPBJ &amp; Kontrak</text>
      <text x="338" y="308" font-size="8.2" fill="#64748b">e-Meterai + BSrE Dirut</text>

      <rect x="14" y="262" width="272" height="60" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-dasharray="4,2" />
      <text x="24" y="279" font-size="8.5" font-weight="700" fill="#64748b" font-family="ui-monospace,Consolas,monospace">STEP 08 · ERP AUTO-DISPATCH</text>
      <text x="24" y="294" font-size="9.8" font-weight="700" fill="#334155">SAP S/4HANA PO #4500198422 &amp; CoreTax</text>
      <text x="24" y="308" font-size="8.2" fill="#64748b">Posting Komitmen Rp 4,58 M + PPN WAPU 11% + Arsip BPK</text>
    </svg>
  `;

  const doaTiers = [
    { tier: 'Tier 1', range: '≤ Rp 500 Juta', maker: 'Staf Pokja', checker: 'Manajer Pengadaan', approver: 'VP Procurement', sla: '2 HK', active: false },
    { tier: 'Tier 2', range: 'Rp 500 Jt – 2 M', maker: 'Ketua Pokja', checker: 'VP Legal + User', approver: 'SVP Supply Chain', sla: '3 HK', active: false },
    { tier: 'Tier 3', range: 'Rp 2 M – 10 M', maker: 'Ketua Pokja', checker: 'Kepala SPI & Legal', approver: 'Dirkeu & Dirut', sla: '5 HK', active: true },
    { tier: 'Tier 4', range: 'Rp 10 M – 50 M', maker: 'Komite Tender', checker: 'Kepala SPI & Kom. Risiko', approver: 'Rapat Direksi (BoD)', sla: '7 HK', active: false },
    { tier: 'Tier 5', range: '> Rp 50 Miliar', maker: 'Komite Strategis', checker: 'Komite Audit Dekom', approver: 'Direksi + Persetujuan Dekom', sla: '12 HK', active: false },
  ];

  const slaQueue = [
    { id: 'PKT-0418', title: 'Genset 1500 kVA Prime Power', nilai: 'Rp 4,58 M', stage: 'Checker SPI', sla: 'Sisa 3j 15m', tone: 'warn' },
    { id: 'PKT-0409', title: 'Trafo Daya 60 MVA 150/20 kV', nilai: 'Rp 17,42 M', stage: 'Rapat Direksi', sla: 'Sisa 1h 4j', tone: 'info' },
    { id: 'PKT-0421', title: 'Sewa Dump Truck 40T Tambang', nilai: 'Rp 8,82 M', stage: 'Klarifikasi SPI', sla: 'Sisa 6j 40m', tone: 'warn' },
    { id: 'PKT-0412', title: 'Overhaul Turbin Uap Unit 2', nilai: 'Rp 13,18 M', stage: 'Verifikasi Teknis', sla: 'Sisa 2h 0j', tone: 'ok' },
    { id: 'PKT-0442', title: 'Lisensi SOC SIEM & HSM Vault', nilai: 'Rp 4,12 M', stage: 'Sign-Off Dirut', sla: 'Sisa 5j 10m', tone: 'ok' },
    { id: 'PKT-0434', title: 'Sistem SCADA RTU & Relay IEC 61850', nilai: 'Rp 4,89 M', stage: 'Verifikasi Teknis', sla: 'Sisa 1h 8j', tone: 'ok' },
  ];

  const contentHtml = `
    <div class="e-panel" style="height:142px;flex-shrink:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('users', 13, '#1f4e5f')}<span>Alur Persetujuan Berjenjang DoA (Maker-Checker-Approver) · PKT-2026-BUMN-0418 · Nilai Rp 4,58 M</span></div>
        <div class="f-row">${badge('Tier 3: Kewenangan Dirut', 'accent')}${badge('SoD Enforcement: Aktif', 'ok')}</div>
      </div>
      <div class="e-panel-body" style="padding:8px 10px;">
        <div class="f-grid" style="grid-template-columns:repeat(5,1fr);gap:8px;height:100%;">
          ${doaSteps
            .map(
              (s) => `<div class="f-step ${s.cls}">
              <div class="f-between">
                <span style="font-size:9.8px;font-weight:700;color:#143440;">${esc(s.step)}</span>
                ${badge(s.status, s.tone)}
              </div>
              <div style="font-size:10.8px;font-weight:700;color:#0f172a;" class="trunc">${esc(s.actor)}</div>
              <div style="font-size:9.3px;color:#52636d;" class="trunc">${esc(s.role)}</div>
              <div class="f-between" style="margin-top:auto;font-size:9px;color:#475569;padding-top:3px;border-top:1px dashed #e2e8f0;">
                <span class="trunc">${esc(s.note)}</span>
                <span class="mono" style="flex-shrink:0;">${esc(s.time)}</span>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>

    <div class="f-grid" style="grid-template-columns:910px 1fr;flex:1;min-height:0;">
      <div class="f-col">
        <div class="e-panel" style="height:386px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('gitBranch', 13, '#1f4e5f')}<span>Elsa Workflow Orchestration DAG (State Machine Eksekusi Tender)</span></div>
            <span class="e-panel-sub">Event-Driven · .NET 9 Worker + PostgreSQL Persistence</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;">
            ${elsaDagSvg}
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('clock', 13, '#1f4e5f')}<span>Antrean Persetujuan DoA & Eskalasi SLA Aktif</span></div>
            ${badge('6 Menunggu Otorisasi', 'info')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.2px;">
              <thead>
                <tr>
                  <th style="width:12%;">Kode</th>
                  <th style="width:36%;">Paket Pengadaan</th>
                  <th class="num" style="width:14%;">Nilai Bid</th>
                  <th style="width:20%;">Tahap Saat Ini</th>
                  <th style="width:18%;">Status SLA</th>
                </tr>
              </thead>
              <tbody>
                ${slaQueue
                  .map(
                    (q, idx) => `<tr class="${idx === 0 ? 'is-selected' : ''}">
                    <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(q.id)}</td>
                    <td style="font-weight:600;">${esc(q.title)}</td>
                    <td class="num mono" style="font-weight:700;">${esc(q.nilai)}</td>
                    <td>${esc(q.stage)}</td>
                    <td>${badge(q.sla, q.tone)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="f-col">
        <div class="e-panel" style="height:262px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#1f4e5f')}<span>Matriks Delegasi Wewenang (DoA) Berdasarkan Pagu HPS</span></div>
            <span class="e-panel-sub">SK Direksi No. 014/2026</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:12%;">Tier</th>
                  <th style="width:22%;">Rentang HPS</th>
                  <th style="width:21%;">Checker</th>
                  <th style="width:33%;">Approver Akhir</th>
                  <th class="num" style="width:12%;">SLA</th>
                </tr>
              </thead>
              <tbody>
                ${doaTiers
                  .map(
                    (d) => `<tr class="${d.active ? 'is-selected' : ''}">
                    <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(d.tier)}</td>
                    <td class="mono" style="font-weight:600;">${esc(d.range)}</td>
                    <td>${esc(d.checker)}</td>
                    <td style="font-weight:${d.active ? '700' : '500'};">${esc(d.approver)}</td>
                    <td class="num mono">${esc(d.sla)}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;margin-top:auto;background:#eef5f7;border-top:1px solid #d5dde0;font-size:10px;color:#143440;">
              <strong>Segregation of Duties (SoD):</strong> Sistem menolak keras apabila ID pengguna Maker sama dengan Checker atau Approver (tervalidasi via Azure AD / SSO BUMN).
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 13, '#1f4e5f')}<span>Kontrol Delegasi Cuti (Plt) & Aturan Eskalasi Otomatis</span></div>
            ${badge('2 Plt Aktif', 'neutral')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
            <div style="border:1px solid #d5dde0;border-radius:3px;padding:8px 10px;background:#f8fafb;">
              <div style="font-size:10.3px;font-weight:700;color:#143440;margin-bottom:4px;">Delegasi Sementara Terdaftar (Terkunci Waktu)</div>
              <div class="f-kv"><span class="f-kv-k">VP Legal (S. M. Kartika) → Plt. A. Wibowo</span><span class="f-kv-v mono">20–24 Nov 2026</span></div>
              <div class="f-kv"><span class="f-kv-k">SVP Supply Chain → Plt. R. A. Puspitasari</span><span class="f-kv-v mono">21–23 Nov 2026</span></div>
              <div class="f-kv"><span class="f-kv-k">Batas Maksimum Nilai Delegasi Plt</span><span class="f-kv-v mono">Hanya s/d Tier 3 (Rp 10 M)</span></div>
            </div>

            <div style="border:1px solid #fde68a;border-radius:3px;padding:8px 10px;background:#fffbeb;">
              <div style="font-size:10.3px;font-weight:700;color:#92400e;margin-bottom:4px;">Aturan Eskalasi SLA Otomatis (Elsa Timer)</div>
              <div style="font-size:10px;color:#78350f;line-height:1.45;">
                • <strong>T-4 Jam SLA:</strong> Notifikasi push ke Aplikasi Mobile Approver & WhatsApp Enterprise.<br/>
                • <strong>Lewat SLA +24 Jam:</strong> Eskalasi otomatis ke atasan langsung + catatan keterlambatan pada dashboard KPI Direksi.<br/>
                • <strong>Flag Kolusi &gt; 65:</strong> Mengunci otomatis tombol Approval Final sampai Kepala SPI mengunggah Berita Acara Klarifikasi.
              </div>
            </div>

            <div class="f-between" style="margin-top:auto;padding-top:6px;border-top:1px solid #e2e8f0;">
              <span class="e-btn">${ic('bell', 11.5)}Kirim Pengingat SPI</span>
              <span class="e-btn e-btn-primary">${ic('play', 11.5, '#fff')}Simulasi Jalur DoA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p7',
    objTitle: 'Matriks DoA, Persetujuan Berjenjang & Elsa Workflow Engine',
    objMetaHtml: `${badge('TIER 3 · DIRUT', 'accent')}<span>PKT-2026-BUMN-0418 · Tahap 3/5 (Checker SPI) · SoD Terverifikasi</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 11.5)}Riwayat Revisi SK DoA</span>
      <span class="e-btn e-btn-primary">${ic('check', 11.5, '#fff')}Tinjau Antrean Saya</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 8: AUDIT BPK WORM SHA-256 & PENDAMPING MOBILE KOMITE / PORTAL VENDOR
// ============================================================================
function renderP8() {
  const wormEvents = [
    { seq: '0418-16', time: '22 Nov 10:28:14', actor: 'Ir. T. Gunawan (VP Eng)', action: 'Persetujuan Verifikator Teknis (Tahap 2/5 DoA)', hash: '8c4e91a0...7f0a91f', status: 'WORM Valid' },
    { seq: '0418-15', time: '22 Nov 10:12:04', actor: 'Ir. H. Darmawan (Pokja)', action: 'Kunci Kertas Kerja BAHE & Pengajuan DoA Tier 3', hash: '71b2d409...2c8e11a', status: 'WORM Valid' },
    { seq: '0418-14', time: '22 Nov 10:04:19', actor: 'Elsa HEA Engine', action: 'Kalkulasi HEA TKDN: VND-01 Rank #1 (95,20)', hash: '4f09a81e...91d2b0c', status: 'WORM Valid' },
    { seq: '0418-13', time: '22 Nov 10:01:02', actor: 'Anti-Collusion Guard', action: 'Eskalasi CASE-AC-2026-089 (VND-04 & VND-05)', hash: '9e22c714...a014f8d', status: 'WORM Valid' },
    { seq: '0418-12', time: '22 Nov 10:00:34', actor: 'HSM Thales Luna 7', action: 'Dekripsi 5/5 Amplop RSA-4096 & Terbit BAPP', hash: '3a84f0c1...6e91d42', status: 'WORM Valid' },
    { seq: '0418-11', time: '22 Nov 10:00:31', actor: 'Drs. B. Hendrawan (SPI)', action: 'Otorisasi Shamir Share #3 (Quorum 3-of-5 Sah)', hash: 'c107b29e...44f8a12', status: 'WORM Valid' },
    { seq: '0418-10', time: '22 Nov 10:00:19', actor: 'R. A. Puspitasari (VP)', action: 'Otorisasi Shamir Share #2 (Token HSM-YUBI-0207)', hash: '5d91e04b...88c2a01', status: 'WORM Valid' },
    { seq: '0418-09', time: '22 Nov 10:00:08', actor: 'Ir. H. Darmawan (Pokja)', action: 'Otorisasi Shamir Share #1 (Token HSM-YUBI-0194)', hash: 'a218f90c...11b4e73', status: 'WORM Valid' },
    { seq: '0418-08', time: '21 Nov 16:49:54', actor: 'VND-05 (PT Cahaya)', action: 'Unggah Blob Penawaran Enkripsi (15.118 KB · TSA)', hash: '9f84b70d...d8152a4', status: 'Flagged IP' },
    { seq: '0418-07', time: '21 Nov 16:48:12', actor: 'VND-04 (PT Sinar Jaya)', action: 'Unggah Blob Penawaran Enkripsi (15.110 KB · TSA)', hash: '9f84a21c...e9021b6', status: 'Flagged IP' },
    { seq: '0418-06', time: '21 Nov 16:05:14', actor: 'VND-03 (CV Karya Tek)', action: 'Unggah Blob Penawaran Enkripsi (12.940 KB · TSA)', hash: '3c19d4a7...7b48d93', status: 'WORM Valid' },
    { seq: '0418-05', time: '21 Nov 15:42:31', actor: 'VND-02 (PT Daya Energi)', action: 'Unggah Blob Penawaran Enkripsi (16.210 KB · TSA)', hash: '7b2f8e04...a129c0e', status: 'WORM Valid' },
    { seq: '0418-04', time: '21 Nov 14:18:09', actor: 'VND-01 (PT Traktor)', action: 'Unggah Blob Penawaran Enkripsi (18.420 KB · TSA)', hash: 'e4a9c71b...b6423f7', status: 'WORM Valid' },
    { seq: '0418-03', time: '14 Nov 14:30:00', actor: 'Pokja & 5 Peserta', action: 'Penetapan Berita Acara Aanwijzing & Addendum #1', hash: '6b82e10a...33f1c88', status: 'WORM Valid' },
    { seq: '0418-02', time: '12 Nov 11:15:40', actor: 'OSS-RBA / P3DN / CoreTax', action: 'Verifikasi Otomatis NIB, PKP & Sertifikat TKDN', hash: '2d44c9b1...5a09e41', status: 'WORM Valid' },
    { seq: '0418-01', time: '10 Nov 09:00:00', actor: 'Sistem RUP & HSM', action: 'Publikasi Paket, Kunci Publik RSA & Segel HPS', hash: '00f1a48c...99c0e11', status: 'Genesis OK' },
  ];

  const contentHtml = `
    <div class="f-grid" style="grid-template-columns:1012px 1fr;flex:1;min-height:0;">
      <div class="f-col">
        <div class="f-grid" style="grid-template-columns:repeat(4,1fr);height:106px;flex-shrink:0;">
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Perpres 16/2018 & LKPP</span>${badge('Patuh', 'ok')}</div>
            <div class="e-kpi-val" style="color:#047857;">99,4%</div>
            <div class="e-kpi-foot"><span>Sealed Bid & Masa Sanggah</span><span class="mono">INAPROC</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Permen BUMN PER-2/2023</span>${badge('100% Patuh', 'ok')}</div>
            <div class="e-kpi-val">16 / 16</div>
            <div class="e-kpi-foot"><span>Tata Kelola GCG & DoA SoD</span><span class="mono">Holding</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>P3DN / TKDN Kemenperin</span>${badge('Target ≥ 40%', 'ok')}</div>
            <div class="e-kpi-val">${fmtPct(AVG_TKDN)}</div>
            <div class="e-kpi-foot"><span>Preferensi HEA Tervalidasi</span><span class="mono">P3DN API</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Audit BPK & UU PDP</span>${badge('WORM Aktif', 'accent')}</div>
            <div class="e-kpi-val">10 Thn</div>
            <div class="e-kpi-foot"><span>Retensi S3 Object Lock</span><span class="mono">PP 33/2026</span></div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 13, '#1f4e5f')}<span>Jejak Audit Permanen WORM SHA-256 (Siap Ekspor Pemeriksaan BPK & SPI)</span></div>
            <div class="f-row">${badge('16/16 Rantai Hash Valid', 'ok')}${badge('Merkle Root: 0x8c4e...a91f', 'neutral')}</div>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table p8-dense" style="font-size:10px;">
              <thead>
                <tr>
                  <th style="width:9%;">Seq ID</th>
                  <th style="width:15%;">Timestamp WIB</th>
                  <th style="width:20%;">Aktor & Peran</th>
                  <th style="width:31%;">Peristiwa & Bukti Kriptografis</th>
                  <th style="width:15%;">Hash SHA-256</th>
                  <th style="width:10%;">Integritas</th>
                </tr>
              </thead>
              <tbody>
                ${wormEvents
                  .map(
                    (ev) => `<tr class="${ev.status === 'Flagged IP' ? 'is-bad' : ''}">
                    <td class="mono" style="font-weight:700;color:#1f4e5f;">${esc(ev.seq)}</td>
                    <td class="mono" style="font-size:9.5px;">${esc(ev.time)}</td>
                    <td style="font-weight:600;">${esc(ev.actor)}</td>
                    <td class="trunc">${esc(ev.action)}</td>
                    <td class="mono" style="font-size:9.3px;color:#475569;">${esc(ev.hash)}</td>
                    <td>${badge(ev.status, ev.status === 'Flagged IP' ? 'bad' : 'ok')}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>

            <div style="padding:10px 11px;margin-top:auto;background:#f8fafb;border-top:1px solid #d5dde0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
              <div style="font-size:10.1px;color:#334155;">
                <strong>Paket Ekspor Audit BPK (Bundel Tersegel):</strong> Berisi Dokumen RUP, HPS, 5 Blob Enkripsi Asli, Log Quorum Shamir, BAPP, Bukti Forensik Anti-Kolusi, BAHE TKDN & Rantai Hash WORM (<span class="mono">ZIP-A3 · 84,6 MB · SHA-256 Signed</span>).
              </div>
              <span class="e-btn e-btn-primary" style="flex-shrink:0;">${ic('download', 11.5, '#fff')}Ekspor Bundel BPK</span>
            </div>
          </div>
        </div>
      </div>

      <div class="f-col">
        <div class="e-panel" style="height:492px;flex-shrink:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('key', 13, '#1f4e5f')}<span>Aplikasi Mobile Komite Approver (iOS / Android)</span></div>
            ${badge('FIDO2 Biometrik', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#eef3f5;">
            <!-- Realistic Mobile Companion Frame -->
            <div class="f-phone">
              <div style="background:#143440;color:#fff;padding:7px 10px;display:flex;justify-content:space-between;font-size:9.2px;font-family:var(--e-mono);">
                <span>10:04 WIB</span>
                <span>5G · mTLS OK</span>
              </div>
              <div style="background:#1f4e5f;color:#fff;padding:9px 11px;">
                <div style="font-size:9.2px;color:#b2d8e5;">eTender BUMN · Mobile Approver</div>
                <div style="font-size:12px;font-weight:700;margin-top:1px;">Otorisasi DoA & Kunci Shamir</div>
              </div>
              <div style="padding:9px;display:flex;flex-direction:column;gap:7px;">
                <div style="background:#ffffff;border:1px solid #d5dde0;border-radius:4px;padding:8px;">
                  <div class="f-between">
                    <span class="mono" style="font-size:9.3px;font-weight:700;color:#1f4e5f;">PKT-2026-BUMN-0418</span>
                    ${badge('Tier 3', 'accent')}
                  </div>
                  <div style="font-size:10.8px;font-weight:700;color:#0f172a;margin-top:2px;">Genset 1500 kVA Prime Power</div>
                  <div style="font-size:9.3px;color:#52636d;margin-top:2px;">Calon Pemenang: PT Traktor Nusantara</div>
                  <div class="f-between" style="margin-top:6px;padding-top:5px;border-top:1px solid #eef2f5;">
                    <div>
                      <div style="font-size:8.6px;color:#64748b;">Nilai Kontrak</div>
                      <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">Rp 4,58 M</div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-size:8.6px;color:#64748b;">Skor HEA / TKDN</div>
                      <div class="mono" style="font-size:11.5px;font-weight:700;">95,20 · 44,2%</div>
                    </div>
                  </div>
                </div>

                <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:4px;padding:7px 8px;">
                  <div style="font-size:9.3px;font-weight:700;color:#be123c;">Peringatan SPI Terlampir</div>
                  <div style="font-size:9px;color:#881337;margin-top:2px;">VND-04 &amp; VND-05 ditahan otomatis (IP &amp; metadata PDF identik · 1,04x BoQ).</div>
                </div>

                <div style="background:#ffffff;border:1px solid #d5dde0;border-radius:4px;padding:7px 8px;">
                  <div style="font-size:9.2px;font-weight:700;color:#143440;margin-bottom:3px;">Status Kunci & Tanda Tangan</div>
                  <div class="f-kv" style="padding:2.5px 0;font-size:9.2px;"><span class="f-kv-k">Shamir Quorum</span><span class="f-kv-v mono" style="color:#047857;">3/5 Terverifikasi</span></div>
                  <div class="f-kv" style="padding:2.5px 0;font-size:9.2px;"><span class="f-kv-k">Hardware Key</span><span class="f-kv-v mono">Passkey + FaceID</span></div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:6px;margin-top:2px;">
                  <div style="text-align:center;padding:7px 4px;border-radius:3px;background:#fff1f2;border:1px solid #fecdd3;color:#be123c;font-size:9.8px;font-weight:700;">Tahan / Revisi</div>
                  <div style="text-align:center;padding:7px 4px;border-radius:3px;background:#1f4e5f;color:#ffffff;font-size:9.8px;font-weight:700;">Setujui via FaceID</div>
                </div>
              </div>
            </div>

            <!-- Mobile Spec Side Column -->
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;">
              <div style="background:#ffffff;border:1px solid #d5dde0;border-radius:3px;padding:8px 9px;">
                <div style="font-size:10.2px;font-weight:700;color:#143440;margin-bottom:4px;">Keamanan Perangkat Komite</div>
                <div style="font-size:9.6px;color:#475569;line-height:1.45;">
                  • <strong>FIDO2 / WebAuthn:</strong> Kunci privat tersimpan di Secure Enclave.<br/>
                  • <strong>Zero Screenshot:</strong> Proteksi layar FLAG_SECURE aktif.<br/>
                  • <strong>Offline Queue:</strong> Tanda tangan tersinkron saat koneksi pulih.
                </div>
              </div>
              <div style="background:#ffffff;border:1px solid #d5dde0;border-radius:3px;padding:8px 9px;">
                <div style="font-size:10.2px;font-weight:700;color:#143440;margin-bottom:4px;">Antrean Mobile Aktif</div>
                <div class="f-kv" style="font-size:9.5px;"><span class="f-kv-k">Menunggu SPI</span><span class="f-kv-v mono">2 Paket</span></div>
                <div class="f-kv" style="font-size:9.5px;"><span class="f-kv-k">Menunggu Dirut</span><span class="f-kv-v mono">1 Paket</span></div>
                <div class="f-kv" style="font-size:9.5px;"><span class="f-kv-k">Rerata Waktu Sign</span><span class="f-kv-v mono">18 menit</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head" style="background:#eef5f7;">
            <div class="e-panel-title">${ic('globe', 13, '#1f4e5f')}<span>Portal Eksternal Vendor — Bukti Tanda Terima RSA-4096</span></div>
            ${badge('Tampilan Vendor', 'info')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
            <div class="f-between">
              <div>
                <div style="font-size:11.2px;font-weight:700;color:#0f172a;">PT Traktor Nusantara Prima (VND-01)</div>
                <div style="font-size:9.8px;color:#52636d;">Portal Rekanan BUMN · Nomor Tanda Terima: <span class="mono">RCPT-0418-VND01</span></div>
              </div>
              ${badge('Lolos Evaluasi', 'ok')}
            </div>

            <div style="border:1px solid #d5dde0;border-radius:3px;padding:7px 9px;background:#f8fafb;">
              <div class="f-kv"><span class="f-kv-k">Waktu Unggah Terverifikasi TSA</span><span class="f-kv-v mono">21 Nov 2026 14:18:09 WIB</span></div>
              <div class="f-kv"><span class="f-kv-k">Sidik Jari Enkripsi (SHA-256)</span><span class="f-kv-v mono">e4a9c71b2d80f431…b6423f7a</span></div>
              <div class="f-kv"><span class="f-kv-k">Sertifikat TKDN Terdaftar</span><span class="f-kv-v mono" style="color:#047857;">44,2% (Memenuhi Syarat ≥ 40%)</span></div>
              <div class="f-kv"><span class="f-kv-k">Tahap Berikutnya</span><span class="f-kv-v">Menunggu Pengumuman Pemenang &amp; Masa Sanggah 5 HK</span></div>
            </div>

            <div class="f-between" style="margin-top:auto;">
              <span style="font-size:9.6px;color:#52636d;">Vendor tidak dapat melihat rincian penawaran peserta lain sebelum pengumuman resmi.</span>
              <span class="e-btn">${ic('download', 11)}Unduh Bukti Enkripsi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p8',
    objTitle: 'Kepatuhan Audit BPK, WORM SHA-256 Ledger & Pendamping Mobile/Vendor',
    objMetaHtml: `${badge('SIAP AUDIT BPK', 'ok')}<span>16 Entri Rantai Hash Terverifikasi · Retensi 10 Tahun · Portal Komite & Rekanan</span>`,
    actionsHtml: `
      <span class="e-btn">${ic('checkCircle', 11.5, '#047857')}Validasi Rantai Merkle</span>
      <span class="e-btn e-btn-primary">${ic('download', 11.5, '#fff')}Ekspor Paket Audit BPK</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// EXPORT RENDER PIPELINE
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
