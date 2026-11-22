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
  id: 'ID-034',
  name: 'AsetTrack QR',
  reference: 'SAP S/4HANA FI-AA (Fiori Horizon) + ServiceNow HAM Pro',
  persona: 'R. Kusuma · Fixed Asset Controller · PT Nusantara Infrastruktur & Medika Tbk',
  pages: [
    { slug: 'p1', title: 'Kokpit Aset Tetap & Opname Q4 2026' },
    { slug: 'p2', title: 'Register Aset Tetap & Inspektor Kartu Aset' },
    { slug: 'p3', title: 'Peta Fasilitas UHF RFID & Rekonsiliasi Opname' },
    { slug: 'p4', title: 'Mesin Penyusutan Ganda PSAK 16 vs Fiskal UU PPh' },
    { slug: 'p5', title: 'Jurnal GL Otomatis, Rekonsiliasi ERP & CoreTax XML' },
    { slug: 'p6', title: 'BAST Digital, Custody Pemegang & Alur DoA Approval' },
    { slug: 'p7', title: 'Companion Mobile Opname (.NET MAUI) & Cetak Label Zebra' },
    { slug: 'p8', title: 'Kepatuhan Audit PSAK 16, WORM SHA-256 & Integrasi' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// ============================================================================

const LOCATIONS = [
  {
    code: 'HQ-JKT',
    name: 'HQ Jakarta (Menara Nusantara)',
    entity: 'PT Nusantara Tbk (Induk)',
    units: 1420,
    verified: 1384,
    inTransit: 34,
    missing: 2,
    costIdr: 14800000000,
    accumKomIdr: 6100000000,
    nbvKomIdr: 8700000000,
    nbvFisIdr: 8320000000,
    rfidGates: 4,
    lastSync: '19 Nov 09:41',
  },
  {
    code: 'WH-CKR',
    name: 'Gudang & Kawasan Cikarang',
    entity: 'PT Nusantara Logistik',
    units: 980,
    verified: 952,
    inTransit: 25,
    missing: 3,
    costIdr: 16450000000,
    accumKomIdr: 6650000000,
    nbvKomIdr: 9800000000,
    nbvFisIdr: 9410000000,
    rfidGates: 6,
    lastSync: '19 Nov 09:44',
  },
  {
    code: 'DC-JKT',
    name: 'Data Center Cyber 1 Jakarta',
    entity: 'PT Nusantara Tbk (Induk)',
    units: 410,
    verified: 406,
    inTransit: 4,
    missing: 0,
    costIdr: 10200000000,
    accumKomIdr: 3900000000,
    nbvKomIdr: 6300000000,
    nbvFisIdr: 5950000000,
    rfidGates: 3,
    lastSync: '19 Nov 09:45',
  },
  {
    code: 'PL-SBY',
    name: 'Pabrik & Depo Surabaya',
    entity: 'PT Nusantara Logistik',
    units: 860,
    verified: 821,
    inTransit: 33,
    missing: 6,
    costIdr: 11100000000,
    accumKomIdr: 4500000000,
    nbvKomIdr: 6600000000,
    nbvFisIdr: 6380000000,
    rfidGates: 5,
    lastSync: '19 Nov 09:38',
  },
  {
    code: 'RS-BDG',
    name: 'RS Medika Nusantara Bandung',
    entity: 'PT Medika Nusantara',
    units: 680,
    verified: 654,
    inTransit: 24,
    missing: 2,
    costIdr: 7500000000,
    accumKomIdr: 2900000000,
    nbvKomIdr: 4600000000,
    nbvFisIdr: 4490000000,
    rfidGates: 4,
    lastSync: '19 Nov 09:40',
  },
  {
    code: 'LB-SMG',
    name: 'Kampus & Lab Teknik Semarang',
    entity: 'Yayasan Pendidikan Nusantara',
    units: 470,
    verified: 449,
    inTransit: 20,
    missing: 1,
    costIdr: 4200000000,
    accumKomIdr: 1800000000,
    nbvKomIdr: 2400000000,
    nbvFisIdr: 2370000000,
    rfidGates: 2,
    lastSync: '19 Nov 09:32',
  },
];

const TAX_CLASSES = [
  {
    id: 'KEL-1',
    name: 'Kelompok 1 — Bukan Bangunan',
    examples: 'Laptop, PC, Server, Scanner QR/RFID, Peralatan Kantor',
    komLife: '4–5 th (GL)',
    fisLife: '4 th (25% GL)',
    units: 2180,
    costIdr: 13600000000,
    nbvKomIdr: 6420000000,
    nbvFisIdr: 5840000000,
    deprKomNov: 118400000,
    deprFisNov: 134250000,
    coaExp: '5104-101',
    coaAcc: '1209-101',
    color: '#374151',
  },
  {
    id: 'KEL-2',
    name: 'Kelompok 2 — Bukan Bangunan',
    examples: 'Forklift Electric, Kendaraan Ops, Alat Medis, UPS',
    komLife: '8–10 th (GL)',
    fisLife: '8 th (12,5% GL)',
    units: 1490,
    costIdr: 19250000000,
    nbvKomIdr: 10880000000,
    nbvFisIdr: 10320000000,
    deprKomNov: 146200000,
    deprFisNov: 155400000,
    coaExp: '5104-102',
    coaAcc: '1209-102',
    color: '#0f766e',
  },
  {
    id: 'KEL-3',
    name: 'Kelompok 3 — Bukan Bangunan',
    examples: 'Mesin Produksi Berat, Chiller Sentral, Genset 1 MW',
    komLife: '15–16 th (GL)',
    fisLife: '16 th (6,25% GL)',
    units: 640,
    costIdr: 13800000000,
    nbvKomIdr: 8650000000,
    nbvFisIdr: 8410000000,
    deprKomNov: 74600000,
    deprFisNov: 76900000,
    coaExp: '5104-103',
    coaAcc: '1209-103',
    color: '#1d4ed8',
  },
  {
    id: 'KEL-4',
    name: 'Kelompok 4 — Bukan Bangunan',
    examples: 'Overhead Crane, Tangki Industri, Jembatan Timbang',
    komLife: '20 th (GL)',
    fisLife: '20 th (5% GL)',
    units: 185,
    costIdr: 4900000000,
    nbvKomIdr: 3150000000,
    nbvFisIdr: 3090000000,
    deprKomNov: 22100000,
    deprFisNov: 21800000,
    coaExp: '5104-104',
    coaAcc: '1209-104',
    color: '#64748b',
  },
  {
    id: 'BGN-P',
    name: 'Bangunan Permanen',
    examples: 'Gudang Cikarang, Gedung RS Medika, Lab Teknik',
    komLife: '20–25 th (GL)',
    fisLife: '20 th (5% GL)',
    units: 215,
    costIdr: 10600000000,
    nbvKomIdr: 7980000000,
    nbvFisIdr: 7940000000,
    deprKomNov: 41200000,
    deprFisNov: 39800000,
    coaExp: '5104-105',
    coaAcc: '1209-105',
    color: '#475569',
  },
  {
    id: 'BGN-N',
    name: 'Bangunan Tidak Permanen',
    examples: 'Pos Keamanan, Kanopi Loading Dock, Ruang Modular',
    komLife: '10 th (GL)',
    fisLife: '10 th (10% GL)',
    units: 110,
    costIdr: 2100000000,
    nbvKomIdr: 1320000000,
    nbvFisIdr: 1320000000,
    deprKomNov: 10300000,
    deprFisNov: 10000000,
    coaExp: '5104-106',
    coaAcc: '1209-106',
    color: '#94a3b8',
  },
];

// 18-row high-density Fixed Asset Master Registry (Page 2)
const ASSETS = [
  {
    code: 'AST-1042',
    name: 'Forklift Electric 3T Toyota 8FBE30',
    kel: 'Kel. 2 (8 th)',
    komLife: '10 th',
    loc: 'WH-CKR',
    locShort: 'Cikarang',
    custodian: 'Bambang W. (WH)',
    bast: 'BAST #218',
    acqDate: '12 Jan 2023',
    cost: 420000000,
    nbvKom: 248000000,
    nbvFis: 223125000,
    deprKom: 3500000,
    deprFis: 4375000,
    lastScan: '19 Nov 09:12',
    tagType: 'UHF+QR',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-2819',
    name: 'ThinkPad X1 Carbon Gen 12 (32GB)',
    kel: 'Kel. 1 (4 th)',
    komLife: '4 th',
    loc: 'HQ-JKT',
    locShort: 'HQ JKT',
    custodian: 'Dimas A. (IT)',
    bast: 'BAST #441',
    acqDate: '04 Feb 2025',
    cost: 29400000,
    nbvKom: 14200000,
    nbvFis: 14200000,
    deprKom: 612500,
    deprFis: 612500,
    lastScan: '18 Nov 16:40',
    tagType: 'QR Label',
    status: 'Dipegang',
    tone: 'ok',
  },
  {
    code: 'AST-0891',
    name: 'Server Rack HPE DL380 Gen11 (2U)',
    kel: 'Kel. 1 (4 th)',
    komLife: '5 th',
    loc: 'DC-JKT',
    locShort: 'DC-JKT',
    custodian: 'Tim Infra DC',
    bast: 'BAST #109',
    acqDate: '15 Jun 2024',
    cost: 196000000,
    nbvKom: 112000000,
    nbvFis: 89833000,
    deprKom: 3266667,
    deprFis: 4083333,
    lastScan: '19 Nov 09:44',
    tagType: 'UHF+QR',
    status: 'Pajak Tangguh',
    tone: 'info',
    selected: true,
  },
  {
    code: 'AST-3310',
    name: 'Laser Barcode Terminal Zebra MC93 #19',
    kel: 'Kel. 1 (4 th)',
    komLife: '4 th',
    loc: 'PL-SBY',
    locShort: 'SBY',
    custodian: 'Arif H. (Depo)',
    bast: 'BAST #302',
    acqDate: '10 Sep 2024',
    cost: 18400000,
    nbvKom: 6800000,
    nbvFis: 6800000,
    deprKom: 383333,
    deprFis: 383333,
    lastScan: '14 Okt 11:05',
    tagType: 'UHF+QR',
    status: 'Hilang',
    tone: 'bad',
    bad: true,
  },
  {
    code: 'AST-1108',
    name: 'USG 4D GE Voluson E10 — Poli Obsgyn',
    kel: 'Kel. 2 (8 th)',
    komLife: '8 th',
    loc: 'RS-BDG',
    locShort: 'RS BDG',
    custodian: 'dr. Kartika (Med)',
    bast: 'BAST #194',
    acqDate: '20 Mar 2023',
    cost: 860000000,
    nbvKom: 516000000,
    nbvFis: 472500000,
    deprKom: 8958333,
    deprFis: 8958333,
    lastScan: '19 Nov 08:50',
    tagType: 'UHF+QR',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-0614',
    name: 'Genset Cummins 1000 kVA Prime',
    kel: 'Kel. 3 (16 th)',
    komLife: '15 th',
    loc: 'DC-JKT',
    locShort: 'DC-JKT',
    custodian: 'Fajar R. (Fac)',
    bast: 'BAST #082',
    acqDate: '08 Nov 2022',
    cost: 1480000000,
    nbvKom: 1085000000,
    nbvFis: 1110000000,
    deprKom: 8222222,
    deprFis: 7708333,
    lastScan: '19 Nov 09:42',
    tagType: 'RFID Metal',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-1925',
    name: 'CNC Milling 5-Axis Mazak Variaxis',
    kel: 'Kel. 3 (16 th)',
    komLife: '16 th',
    loc: 'PL-SBY',
    locShort: 'SBY',
    custodian: 'Hendra P. (Prod)',
    bast: 'BAST #266',
    acqDate: '19 Jul 2022',
    cost: 1920000000,
    nbvKom: 1410000000,
    nbvFis: 1410000000,
    deprKom: 10000000,
    deprFis: 10000000,
    lastScan: '19 Nov 08:15',
    tagType: 'RFID Metal',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-2407',
    name: 'Overhead Crane Demag 10T Bay-02',
    kel: 'Kel. 4 (20 th)',
    komLife: '20 th',
    loc: 'WH-CKR',
    locShort: 'Cikarang',
    custodian: 'Surya D. (WH)',
    bast: 'BAST #147',
    acqDate: '03 Apr 2021',
    cost: 1240000000,
    nbvKom: 899000000,
    nbvFis: 899000000,
    deprKom: 5166667,
    deprFis: 5166667,
    lastScan: '19 Nov 09:10',
    tagType: 'RFID Metal',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-2944',
    name: 'Spektrofotometer UV-Vis Shimadzu',
    kel: 'Kel. 2 (8 th)',
    komLife: '8 th',
    loc: 'LB-SMG',
    locShort: 'SMG',
    custodian: 'Ir. Nuning (Lab)',
    bast: 'BAST #389',
    acqDate: '11 Mei 2024',
    cost: 215000000,
    nbvKom: 152000000,
    nbvFis: 148200000,
    deprKom: 2239583,
    deprFis: 2239583,
    lastScan: '19 Nov 07:55',
    tagType: 'QR Label',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-3105',
    name: 'MacBook Pro 16 M3 Max — Tim Desain',
    kel: 'Kel. 1 (4 th)',
    komLife: '4 th',
    loc: 'HQ-JKT',
    locShort: 'HQ JKT',
    custodian: 'Nadia S. (Prod)',
    bast: 'BAST #452',
    acqDate: '18 Agu 2024',
    cost: 54000000,
    nbvKom: 28100000,
    nbvFis: 28100000,
    deprKom: 1125000,
    deprFis: 1125000,
    lastScan: '17 Nov 15:20',
    tagType: 'QR Label',
    status: 'Pindah Lokasi',
    tone: 'warn',
    warn: true,
  },
  {
    code: 'AST-1488',
    name: 'UPS APC Symmetra PX 160 kVA',
    kel: 'Kel. 2 (8 th)',
    komLife: '10 th',
    loc: 'DC-JKT',
    locShort: 'DC-JKT',
    custodian: 'Tim Infra DC',
    bast: 'BAST #114',
    acqDate: '22 Jan 2023',
    cost: 640000000,
    nbvKom: 418000000,
    nbvFis: 366667000,
    deprKom: 5333333,
    deprFis: 6666667,
    lastScan: '19 Nov 09:44',
    tagType: 'UHF+QR',
    status: 'Pajak Tangguh',
    tone: 'info',
  },
  {
    code: 'AST-0519',
    name: 'Gedung Gudang Logistik Cikarang Blok B',
    kel: 'Bgn. Perm (20 th)',
    komLife: '25 th',
    loc: 'WH-CKR',
    locShort: 'Cikarang',
    custodian: 'GA Properti',
    bast: 'SHGB #4401',
    acqDate: '01 Feb 2021',
    cost: 4850000000,
    nbvKom: 3748000000,
    nbvFis: 3516250000,
    deprKom: 16166667,
    deprFis: 20208333,
    lastScan: '19 Nov 09:00',
    tagType: 'Plakat QR',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-2671',
    name: 'Ventilator ICU Drager Evita V600',
    kel: 'Kel. 2 (8 th)',
    komLife: '8 th',
    loc: 'RS-BDG',
    locShort: 'RS BDG',
    custodian: 'Ns. Rina (ICU)',
    bast: 'BAST #311',
    acqDate: '09 Okt 2023',
    cost: 390000000,
    nbvKom: 242000000,
    nbvFis: 242000000,
    deprKom: 4062500,
    deprFis: 4062500,
    lastScan: '19 Nov 09:18',
    tagType: 'UHF+QR',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-3089',
    name: 'Toyota Innova Zenix Hybrid — Ops Dir',
    kel: 'Kel. 2 (8 th)',
    komLife: '8 th',
    loc: 'HQ-JKT',
    locShort: 'HQ JKT',
    custodian: 'Pool GA HQ',
    bast: 'BAST #419',
    acqDate: '14 Mar 2024',
    cost: 528000000,
    nbvKom: 368000000,
    nbvFis: 368000000,
    deprKom: 5500000,
    deprFis: 5500000,
    lastScan: '19 Nov 08:30',
    tagType: 'UHF Windshield',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-2204',
    name: 'Switch Core Cisco Nexus 9336C-FX2',
    kel: 'Kel. 1 (4 th)',
    komLife: '5 th',
    loc: 'DC-JKT',
    locShort: 'DC-JKT',
    custodian: 'Tim NetOps',
    bast: 'BAST #277',
    acqDate: '27 Mei 2024',
    cost: 168000000,
    nbvKom: 99000000,
    nbvFis: 80500000,
    deprKom: 2800000,
    deprFis: 3500000,
    lastScan: '19 Nov 09:44',
    tagType: 'UHF+QR',
    status: 'Pajak Tangguh',
    tone: 'info',
  },
  {
    code: 'AST-3412',
    name: 'Thermal Printer Zebra ZT411 Industrial',
    kel: 'Kel. 1 (4 th)',
    komLife: '4 th',
    loc: 'WH-CKR',
    locShort: 'Cikarang',
    custodian: 'GA Labeling',
    bast: 'BAST #460',
    acqDate: '02 Apr 2025',
    cost: 36000000,
    nbvKom: 22500000,
    nbvFis: 22500000,
    deprKom: 750000,
    deprFis: 750000,
    lastScan: '19 Nov 09:41',
    tagType: 'QR Label',
    status: 'Terverifikasi',
    tone: 'ok',
  },
  {
    code: 'AST-3388',
    name: 'Oscilloscope Tektronix MSO44 500MHz',
    kel: 'Kel. 2 (8 th)',
    komLife: '8 th',
    loc: 'LB-SMG',
    locShort: 'SMG',
    custodian: 'Dr. Bagus (Lab)',
    bast: 'BAST #433',
    acqDate: '12 Jan 2024',
    cost: 144000000,
    nbvKom: 94500000,
    nbvFis: 94500000,
    deprKom: 1500000,
    deprFis: 1500000,
    lastScan: '16 Nov 14:12',
    tagType: 'QR Label',
    status: 'Servis Kalibrasi',
    tone: 'warn',
    warn: true,
  },
  {
    code: 'AST-1755',
    name: 'Chiller Trane CenTraVac 350 TR',
    kel: 'Kel. 3 (16 th)',
    komLife: '16 th',
    loc: 'RS-BDG',
    locShort: 'RS BDG',
    custodian: 'Eng. RS BDG',
    bast: 'BAST #204',
    acqDate: '05 Jun 2022',
    cost: 1150000000,
    nbvKom: 842000000,
    nbvFis: 842000000,
    deprKom: 5989583,
    deprFis: 5989583,
    lastScan: '19 Nov 08:40',
    tagType: 'RFID Metal',
    status: 'Terverifikasi',
    tone: 'ok',
  },
];

// Double-Entry GL Journal Lines for Batch JRN-DEP-202611-001 (Page 5)
const GL_JOURNAL_LINES = [
  { line: 1, coa: '5104-101', account: 'Beban Penyusutan — Aset Kel. 1 (IT & Peralatan)', cc: 'CC-CORP', debit: 118400000, credit: 0, ref: 'PSAK16-K1' },
  { line: 2, coa: '5104-102', account: 'Beban Penyusutan — Aset Kel. 2 (Alat Berat/Medis)', cc: 'CC-OPS', debit: 146200000, credit: 0, ref: 'PSAK16-K2' },
  { line: 3, coa: '5104-103', account: 'Beban Penyusutan — Aset Kel. 3 (Mesin & Genset)', cc: 'CC-PROD', debit: 74600000, credit: 0, ref: 'PSAK16-K3' },
  { line: 4, coa: '5104-104', account: 'Beban Penyusutan — Aset Kel. 4 (Crane & Berat)', cc: 'CC-WH', debit: 22100000, credit: 0, ref: 'PSAK16-K4' },
  { line: 5, coa: '5104-105', account: 'Beban Penyusutan — Bangunan Permanen', cc: 'CC-PROP', debit: 41200000, credit: 0, ref: 'PSAK16-BP' },
  { line: 6, coa: '5104-106', account: 'Beban Penyusutan — Bangunan Non-Permanen', cc: 'CC-PROP', debit: 10300000, credit: 0, ref: 'PSAK16-BN' },
  { line: 7, coa: '1209-101', account: 'Akum. Penyusutan — Aset Kel. 1 (IT & Peralatan)', cc: 'BAL-SHT', debit: 0, credit: 118400000, ref: 'PSAK16-K1' },
  { line: 8, coa: '1209-102', account: 'Akum. Penyusutan — Aset Kel. 2 (Alat Berat/Medis)', cc: 'BAL-SHT', debit: 0, credit: 146200000, ref: 'PSAK16-K2' },
  { line: 9, coa: '1209-103', account: 'Akum. Penyusutan — Aset Kel. 3 (Mesin & Genset)', cc: 'BAL-SHT', debit: 0, credit: 74600000, ref: 'PSAK16-K3' },
  { line: 10, coa: '1209-104', account: 'Akum. Penyusutan — Aset Kel. 4 (Crane & Berat)', cc: 'BAL-SHT', debit: 0, credit: 22100000, ref: 'PSAK16-K4' },
  { line: 11, coa: '1209-105', account: 'Akum. Penyusutan — Bangunan Permanen', cc: 'BAL-SHT', debit: 0, credit: 41200000, ref: 'PSAK16-BP' },
  { line: 12, coa: '1209-106', account: 'Akum. Penyusutan — Bangunan Non-Permanen', cc: 'BAL-SHT', debit: 0, credit: 10300000, ref: 'PSAK16-BN' },
  { line: 13, coa: '5302-001', account: 'Beban Pajak Tangguhan (22% × Selisih Rp 25,35 jt)', cc: 'CC-TAX', debit: 5577000, credit: 0, ref: 'PSAK46-DT' },
  { line: 14, coa: '2205-001', account: 'Liabilitas Pajak Tangguhan — Beda Temporer Aset', cc: 'BAL-SHT', debit: 0, credit: 5577000, ref: 'PSAK46-DT' },
  { line: 15, coa: '1102-001', account: 'Bank Mandiri Ops — Hasil Lelang AST-0412 + PPN 16D', cc: 'CC-TREAS', debit: 160950000, credit: 0, ref: 'DISP-0412' },
  { line: 16, coa: '1209-102', account: 'Hapus Akum. Penyusutan AST-0412 (Hilux 2019)', cc: 'BAL-SHT', debit: 276500000, credit: 0, ref: 'DISP-0412' },
  { line: 17, coa: '1202-102', account: 'Pelepasan Harga Perolehan AST-0412 (Hilux 2019)', cc: 'BAL-SHT', debit: 0, credit: 395000000, ref: 'DISP-0412' },
  { line: 18, coa: '2104-016', account: 'Utang PPN Pasal 16D (11% × Rp 145.000.000)', cc: 'CC-TAX', debit: 0, credit: 15950000, ref: 'EFK-16D' },
  { line: 19, coa: '4201-003', account: 'Laba Pelepasan Aset Tetap (Komersial)', cc: 'CC-CORP', debit: 0, credit: 26500000, ref: 'DISP-0412' },
];

// Monthly Commercial vs Fiscal Depreciation 2026 (in Rp Juta)
const MONTHS_2026 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
const DEPR_KOM_SERIES = [386.4, 389.2, 392.0, 395.8, 399.1, 401.5, 404.2, 406.9, 408.8, 410.6, 412.8];
const DEPR_FIS_SERIES = [408.1, 411.4, 415.0, 419.6, 422.8, 426.1, 429.3, 431.9, 434.2, 436.0, 438.15];

// Derived aggregates
const TOTAL_UNITS = LOCATIONS.reduce((a, l) => a + l.units, 0);
const TOTAL_VERIFIED = LOCATIONS.reduce((a, l) => a + l.verified, 0);
const TOTAL_IN_TRANSIT = LOCATIONS.reduce((a, l) => a + l.inTransit, 0);
const TOTAL_MISSING = LOCATIONS.reduce((a, l) => a + l.missing, 0);
const TOTAL_COST = LOCATIONS.reduce((a, l) => a + l.costIdr, 0);
const TOTAL_ACCUM_KOM = LOCATIONS.reduce((a, l) => a + l.accumKomIdr, 0);
const TOTAL_NBV_KOM = LOCATIONS.reduce((a, l) => a + l.nbvKomIdr, 0);
const TOTAL_NBV_FIS = LOCATIONS.reduce((a, l) => a + l.nbvFisIdr, 0);
const TOTAL_DEPR_KOM_NOV = TAX_CLASSES.reduce((a, c) => a + c.deprKomNov, 0);
const TOTAL_DEPR_FIS_NOV = TAX_CLASSES.reduce((a, c) => a + c.deprFisNov, 0);
const DIFF_TEMP_NOV = TOTAL_DEPR_KOM_NOV - TOTAL_DEPR_FIS_NOV; // -25,350,000
const DEFERRED_TAX_NOV = Math.round(Math.abs(DIFF_TEMP_NOV) * 0.22); // 5,577,000
const OPNAME_PCT = (TOTAL_VERIFIED / TOTAL_UNITS) * 100; // 96.80497%

const SAMPLE_COST_SUM = ASSETS.reduce((a, x) => a + x.cost, 0);
const SAMPLE_NBV_KOM_SUM = ASSETS.reduce((a, x) => a + x.nbvKom, 0);
const SAMPLE_NBV_FIS_SUM = ASSETS.reduce((a, x) => a + x.nbvFis, 0);

const GL_TOTAL_DEBIT = GL_JOURNAL_LINES.reduce((a, l) => a + l.debit, 0);
const GL_TOTAL_CREDIT = GL_JOURNAL_LINES.reduce((a, l) => a + l.credit, 0);

export function verifyMath() {
  if (TOTAL_UNITS !== 4820) throw new Error(`TOTAL_UNITS=${TOTAL_UNITS}, expected 4820`);
  if (TOTAL_VERIFIED !== 4666) throw new Error(`TOTAL_VERIFIED=${TOTAL_VERIFIED}, expected 4666`);
  if (TOTAL_MISSING !== 14) throw new Error(`TOTAL_MISSING=${TOTAL_MISSING}, expected 14`);
  if (TOTAL_VERIFIED + TOTAL_IN_TRANSIT + TOTAL_MISSING !== TOTAL_UNITS) {
    throw new Error('Opname status partition mismatch');
  }
  if (Math.round(OPNAME_PCT * 10) / 10 !== 96.8) {
    throw new Error(`OPNAME_PCT=${OPNAME_PCT.toFixed(2)}, expected 96.8`);
  }
  if (TOTAL_COST !== 64250000000) throw new Error(`TOTAL_COST=${TOTAL_COST}`);
  if (TOTAL_COST - TOTAL_ACCUM_KOM !== TOTAL_NBV_KOM) throw new Error('Cost - Accum != NBV Kom');
  if (TOTAL_NBV_KOM !== 38400000000) throw new Error(`TOTAL_NBV_KOM=${TOTAL_NBV_KOM}, expected 38.4M`);
  if (TOTAL_NBV_FIS !== 36920000000) throw new Error(`TOTAL_NBV_FIS=${TOTAL_NBV_FIS}`);

  const classUnits = TAX_CLASSES.reduce((a, c) => a + c.units, 0);
  const classCost = TAX_CLASSES.reduce((a, c) => a + c.costIdr, 0);
  const classNbvKom = TAX_CLASSES.reduce((a, c) => a + c.nbvKomIdr, 0);
  const classNbvFis = TAX_CLASSES.reduce((a, c) => a + c.nbvFisIdr, 0);

  if (classUnits !== TOTAL_UNITS) throw new Error(`classUnits=${classUnits} vs ${TOTAL_UNITS}`);
  if (classCost !== TOTAL_COST) throw new Error(`classCost=${classCost} vs ${TOTAL_COST}`);
  if (classNbvKom !== TOTAL_NBV_KOM) throw new Error(`classNbvKom=${classNbvKom} vs ${TOTAL_NBV_KOM}`);
  if (classNbvFis !== TOTAL_NBV_FIS) throw new Error(`classNbvFis=${classNbvFis} vs ${TOTAL_NBV_FIS}`);

  if (TOTAL_DEPR_KOM_NOV !== 412800000) throw new Error(`DeprKomNov=${TOTAL_DEPR_KOM_NOV}`);
  if (TOTAL_DEPR_FIS_NOV !== 438150000) throw new Error(`DeprFisNov=${TOTAL_DEPR_FIS_NOV}`);
  if (DIFF_TEMP_NOV !== -25350000) throw new Error(`DiffTempNov=${DIFF_TEMP_NOV}`);
  if (DEFERRED_TAX_NOV !== 5577000) throw new Error(`DeferredTaxNov=${DEFERRED_TAX_NOV}`);

  if (GL_TOTAL_DEBIT !== GL_TOTAL_CREDIT) {
    throw new Error(`GL Journal unbalanced: Dr=${GL_TOTAL_DEBIT} Cr=${GL_TOTAL_CREDIT}`);
  }
  if (GL_TOTAL_DEBIT !== 855827000) {
    throw new Error(`GL_TOTAL_DEBIT=${GL_TOTAL_DEBIT}, expected 855827000`);
  }
}

// ============================================================================
// CUSTOM ENTERPRISE SHELL & HELPER COMPONENTS (SAP FIORI HORIZON / WPF STYLE)
// ============================================================================

function fmtMiliar(n) {
  return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
}
function fmtJuta(n) {
  const jt = n / 1e6;
  const dec = Math.abs(jt) < 100 ? 1 : 1;
  return 'Rp ' + jt.toFixed(dec).replace('.', ',') + ' jt';
}

// Extra crisp stroke SVG icons specific to Fixed Assets, QR, RFID, Printing, Tax
const EXTRA_ICONS = {
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="18" y2="21"/>',
  rfid: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="19" r="1.2"/><path d="M2 8.82a15 15 0 0 1 20 0"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/>',
  scale: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M5 7h14"/><path d="M5 7l-3 7h6l-3-7z"/><path d="M19 7l-3 7h6l-3-7z"/><line x1="8" y1="21" x2="16" y2="21"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  signature: '<path d="M3 17c3-2 4-7 7-7 2 0 2 5 4 5s3-3 5-3"/><line x1="3" y1="21" x2="21" y2="21"/>',
  smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
};

function eic(name, size = 13, color = 'currentColor') {
  if (EXTRA_ICONS[name]) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${EXTRA_ICONS[name]}</svg>`;
  }
  return ic(name, size, color);
}

// Deterministic crisp vector QR code SVG generator (no external assets)
function renderQrSvg(seedStr, size = 68, darkColor = '#111827') {
  const n = 17;
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const cell = size / n;
  let rects = '';
  const isFinder = (r, c) =>
    (r < 5 && c < 5) || (r < 5 && c >= n - 5) || (r >= n - 5 && c < 5);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let on = false;
      if (isFinder(r, c)) {
        const lr = r >= n - 5 ? r - (n - 5) : r;
        const lc = c >= n - 5 ? c - (n - 5) : c;
        on = lr === 0 || lr === 4 || lc === 0 || lc === 4 || (lr === 2 && lc === 2);
      } else if (r === 5 || c === 5) {
        on = (r + c) % 2 === 0;
      } else {
        const v = Math.imul(hash ^ (r * 31 + c * 17), 2654435761) >>> 0;
        on = (v & 7) < 4;
      }
      if (on) {
        rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${(cell + 0.15).toFixed(2)}" height="${(cell + 0.15).toFixed(2)}" fill="${darkColor}" />`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;background:#ffffff;flex-shrink:0;">${rects}</svg>`;
}

const RAIL_MODULES = [
  { id: 'p1', short: 'Kokpit', icon: 'activity' },
  { id: 'p2', short: 'Register', icon: 'box' },
  { id: 'p3', short: 'RFID Map', icon: 'map' },
  { id: 'p4', short: 'PSAK/Tax', icon: 'scale' },
  { id: 'p5', short: 'Jurnal GL', icon: 'book' },
  { id: 'p6', short: 'BAST/DoA', icon: 'signature' },
  { id: 'p7', short: 'Mobile/QR', icon: 'smartphone' },
  { id: 'p8', short: 'Audit/Sys', icon: 'shield' },
];

const EXTRA_CSS = `
  /* Custom SAP Fiori Horizon / .NET 8 WPF Fixed Asset Shell */
  .at-topbar {
    height: 38px;
    background: #1f2937;
    color: #f9fafb;
    border-bottom: 1px solid #111827;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .at-top-left, .at-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .at-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 12.5px;
    color: #ffffff;
    white-space: nowrap;
  }
  .at-logo-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #374151;
    border: 1px solid #6b7280;
    color: #f9fafb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .at-pill {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #2b3544;
    border: 1px solid #4b5563;
    color: #e5e7eb;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .at-pill-period {
    background: #134e4a;
    border-color: #0f766e;
    color: #ccfbf1;
    font-family: var(--e-mono);
    font-size: 9.8px;
  }
  .at-search {
    height: 23px;
    width: 265px;
    padding: 0 8px;
    border-radius: 3px;
    background: #111827;
    border: 1px solid #374151;
    color: #9ca3af;
    font-size: 10.2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .at-rail {
    width: 62px;
    background: #ffffff;
    border-right: 1px solid var(--e-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 6px 4px;
    flex-shrink: 0;
  }
  .at-rail-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
  }
  .at-rail-btn {
    width: 100%;
    padding: 6px 2px;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #4b5563;
    font-size: 9px;
    font-weight: 600;
    border: 1px solid transparent;
    text-align: center;
  }
  .at-rail-btn.is-active {
    background: #eef1f5;
    color: #111827;
    border-color: #cbd5e1;
    box-shadow: inset 3px 0 0 #374151;
    font-weight: 700;
  }
  .at-rail-foot {
    width: 100%;
    padding: 5px 3px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-family: var(--e-mono);
    font-size: 8.5px;
    color: #6b7280;
    line-height: 1.3;
  }
  .at-subbar {
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
  .at-seg {
    display: inline-flex;
    border: 1px solid var(--e-border-strong);
    border-radius: 3px;
    overflow: hidden;
    background: #f8fafc;
  }
  .at-seg-item {
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    border-right: 1px solid var(--e-border);
    white-space: nowrap;
  }
  .at-seg-item:last-child { border-right: 0; }
  .at-seg-item.is-on {
    background: #374151;
    color: #ffffff;
  }
  .at-kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
    font-size: 10.5px;
  }
  .at-kv-label {
    font-size: 9.2px;
    color: #64748b;
    font-weight: 600;
  }
  .at-kv-val {
    font-weight: 600;
    color: #111827;
  }
  .at-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 7px 0;
  }
  .at-code-box {
    background: #111827;
    color: #e5e7eb;
    font-family: var(--e-mono);
    font-size: 9.4px;
    line-height: 1.42;
    padding: 8px 10px;
    border-radius: 3px;
    border: 1px solid #374151;
    white-space: pre;
    overflow: hidden;
  }
  .xml-tag { color: #93c5fd; }
  .xml-attr { color: #fcd34d; }
  .xml-val { color: #86efac; }
  .xml-com { color: #9ca3af; }
  .at-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    flex-shrink: 0;
  }
  .at-step {
    background: #ffffff;
    border: 1px solid var(--e-border);
    border-radius: 4px;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .at-step.is-done {
    border-left: 3px solid #047857;
  }
  .at-step.is-now {
    border-left: 3px solid #374151;
    background: #f8fafc;
  }
  .at-step.is-wait {
    border-left: 3px solid #cbd5e1;
  }
  .at-phone {
    background: #1f2937;
    border: 2px solid #374151;
    border-radius: 14px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .at-phone-screen {
    background: #f8fafc;
    border-radius: 8px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #4b5563;
  }
  .at-doc-paper {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    padding: 11px 13px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    height: 100%;
  }
  .at-zebra-label {
    background: #f3f4f6;
    border: 1.5px dashed #6b7280;
    border-radius: 4px;
    padding: 9px 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  table.at-dense th, table.at-dense td {
    padding: 4px 5px !important;
  }
  table.at-dense tfoot td {
    padding: 5px 5px !important;
  }
`;

function renderShell({ activeId, pageTitle, breadcrumb, subRightHtml, contentHtml, footRight = 'WPF .NET 8.0.10 · SQL Server 2022 · Sync 18ms' }) {
  const railHtml = `<nav class="at-rail">
    <div class="at-rail-list">
      ${RAIL_MODULES.map((m) => {
        const active = m.id === activeId;
        return `<div class="at-rail-btn ${active ? 'is-active' : ''}">
          ${eic(m.icon, 15, active ? '#111827' : '#64748b')}
          <span>${esc(m.short)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="at-rail-foot">
      <div>WPF</div>
      <div style="color:#047857;font-weight:700;">ONLINE</div>
    </div>
  </nav>`;

  const topbarHtml = `<header class="at-topbar">
    <div class="at-top-left">
      <div class="at-logo">
        <span class="at-logo-mark">${eic('qr', 13, '#ffffff')}</span>
        <span>AsetTrack QR</span>
        <span style="font-size:9.5px;color:#9ca3af;font-weight:500;">Enterprise Fixed Asset &amp; Tax Ledger</span>
      </div>
      <span class="at-pill at-pill-period">OPNAME Q4 2026 · NOV OPEN</span>
      <div class="at-pill">
        ${eic('building', 11, '#9ca3af')}
        <span>PT Nusantara Infrastruktur &amp; Medika Tbk (4 Entitas · 6 Lokasi)</span>
        ${ic('chevronDown', 11, '#9ca3af')}
      </div>
      <div class="at-search">
        <span style="display:inline-flex;align-items:center;gap:5px;">
          ${ic('search', 11, '#6b7280')}
          <span>Cari Kode AST-, EPC RFID, BAST, COA...</span>
        </span>
        <span class="e-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="at-top-right">
      <div class="at-pill" style="background:#064e3b;border-color:#047857;color:#a7f3d0;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">4.820 Aset · 24 Gate RFID</span>
      </div>
      <div class="e-user-chip">
        <span class="e-avatar" style="background:#374151;border:1px solid #6b7280;">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.3px;font-weight:700;color:#f9fafb;">R. Kusuma, Ak., CA</div>
          <div style="font-size:9px;color:#9ca3af;">Fixed Asset Controller</div>
        </div>
      </div>
    </div>
  </header>`;

  const subbarHtml = `<div class="at-subbar">
    <div class="e-crumb">
      <span>AsetTrack QR</span>
      ${ic('chevronRight', 12, '#94a3b8')}
      <span>${esc(breadcrumb)}</span>
      ${ic('chevronRight', 12, '#94a3b8')}
      <strong>${esc(pageTitle)}</strong>
    </div>
    <div style="display:flex;align-items:center;gap:7px;">${subRightHtml}</div>
  </div>`;

  const footerHtml = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> Buku Ganda Aktif: PSAK 16 (Komersial) &amp; UU PPh PMK 72/2023 (Fiskal Kel. 1-4)`,
      `Periode Fiskal: Nov 2026 (Tutup Buku H-11)`,
      `Zebra ZT411: 3 Printer Siap`,
    ],
    rightItems: [
      `WORM Anchor: sha256:c21f...9a04`,
      footRight,
    ],
  });

  return wrapEnterpriseHtml({
    title: `AsetTrack QR — ${pageTitle}`,
    accent: '#374151',
    accentSoft: '#eef1f5',
    accentInk: '#111827',
    bg: '#f3f5f8',
    surface: '#ffffff',
    surface2: '#f8fafc',
    border: '#d6dce5',
    borderStrong: '#bec7d4',
    text: '#111827',
    text2: '#374151',
    muted: '#64748b',
    extraCss: EXTRA_CSS,
    bodyHtml: `
      ${topbarHtml}
      <div class="e-shell-body">
        ${railHtml}
        <main class="e-main">
          ${subbarHtml}
          <div class="e-content">${contentHtml}</div>
          ${footerHtml}
        </main>
      </div>
    `,
  });
}

// ============================================================================
// PAGE 1: KOKPIT ASET TETAP & OPNAME Q4 2026
// ============================================================================
function renderPage1() {
  const kpiHtml = `<div class="e-kpi-strip" style="grid-template-columns: repeat(5, 1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Total Aset Tetap Aktif</span>
        ${badge('4 Entitas', 'neutral')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_UNITS)} unit</span>
        ${svgSparkline({ points: [4510, 4580, 4630, 4712, 4778, 4820], color: '#374151', width: 64, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span>Harga Perolehan</span>
        <span class="mono" style="font-weight:700;color:#111827;">${fmtMiliar(TOTAL_COST)}</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Nilai Buku Net (Komersial)</span>
        ${badge('PSAK 16', 'accent')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 38,4 M</span>
        ${svgSparkline({ points: [39.9, 39.6, 39.2, 38.9, 38.7, 38.4], color: '#1d4ed8', width: 64, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span>Akum. Penyusutan</span>
        <span class="mono">${fmtMiliar(TOTAL_ACCUM_KOM)}</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Nilai Buku Fiskal (UU PPh)</span>
        ${badge('PMK 72/2023', 'info')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtMiliar(TOTAL_NBV_FIS)}</span>
        ${svgSparkline({ points: [38.7, 38.3, 37.9, 37.5, 37.2, 36.92], color: '#0f766e', width: 64, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span>Beda Temporer Kum.</span>
        <span class="mono" style="color:#0369a1;font-weight:700;">Rp 1,48 M</span>
      </div>
    </div>

    <div class="e-kpi">
      <div class="e-kpi-top">
        <span>Lulus Opname Q4 2026</span>
        ${badge('Target 95%', 'ok')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">96,8%</span>
        ${svgSparkline({ points: [48.2, 66.5, 79.4, 88.1, 94.3, 96.8], color: '#047857', width: 64, height: 20 })}
      </div>
      <div class="e-kpi-foot">
        <span>${fmtNum(TOTAL_VERIFIED)} terverifikasi</span>
        <span class="mono">${TOTAL_IN_TRANSIT} transit/servis</span>
      </div>
    </div>

    <div class="e-kpi" style="border-color:#fecdd3;background:#fffafa;">
      <div class="e-kpi-top">
        <span style="color:#be123c;">Belum Ditemukan (Selisih)</span>
        ${badge('Investigasi', 'bad')}
      </div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#be123c;">${TOTAL_MISSING} unit</span>
        <span class="mono" style="font-size:10px;color:#be123c;font-weight:700;">NBV Rp 142,6 jt</span>
      </div>
      <div class="e-kpi-foot">
        <span>Tertinggi: Depo SBY (6)</span>
        <span style="color:#be123c;font-weight:600;">BAP H-4</span>
      </div>
    </div>
  </div>`;

  const deprChart = svgMultiLineChart({
    width: 830,
    height: 245,
    xLabels: MONTHS_2026,
    yMin: 370,
    yMax: 458,
    yTicks: 5,
    yFormat: (v) => `Rp ${Math.round(v)} jt`,
    threshold: { value: 450, label: 'Pagu Rp 450 jt/bln', color: '#b45309' },
    series: [
      { label: 'Penyusutan Fiskal UU PPh (Kel. 1–4 & Bgn)', values: DEPR_FIS_SERIES, color: '#0f766e', area: true, dots: true, width: 2 },
      { label: 'Penyusutan Komersial PSAK 16 (GL)', values: DEPR_KOM_SERIES, color: '#374151', area: false, dots: true, width: 2 },
    ],
    annotations: [
      { index: 9, seriesIdx: 0, label: 'Nov 2026: Fiskal Rp 438,15 jt (+Rp 25,35 jt)', color: '#0f766e', dy: -22 },
      { index: 10, seriesIdx: 1, label: 'Komersial Nov: Rp 412,80 jt', color: '#374151', dy: 14 },
    ],
  });

  const locRows = LOCATIONS.map((l) => {
    const pct = (l.verified / l.units) * 100;
    return `<tr>
      <td><span class="mono" style="font-weight:700;">${esc(l.code)}</span></td>
      <td style="font-weight:600;">${esc(l.name)}</td>
      <td class="num mono">${fmtNum(l.units)}</td>
      <td class="num mono" style="color:#047857;font-weight:600;">${fmtNum(l.verified)}</td>
      <td class="num mono">${l.inTransit}</td>
      <td class="num mono" style="color:${l.missing > 0 ? '#be123c' : '#64748b'};font-weight:${l.missing > 0 ? '700' : '400'};">${l.missing}</td>
      <td>${renderCapacityBar(pct, { warnAt: 101, critAt: 101 })}</td>
      <td class="num mono" style="font-weight:600;">${fmtMiliar(l.nbvKomIdr)}</td>
      <td class="num mono" style="color:#0f766e;">${fmtMiliar(l.nbvFisIdr)}</td>
    </tr>`;
  }).join('');

  const classBars = TAX_CLASSES.map((c) => {
    const share = (c.nbvKomIdr / TOTAL_NBV_KOM) * 100;
    const diffNov = c.deprKomNov - c.deprFisNov;
    return `<div style="padding:6px 0;border-bottom:1px solid #eef2f6;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <span style="width:8px;height:8px;border-radius:2px;background:${c.color};flex-shrink:0;"></span>
          <span style="font-weight:700;font-size:10.8px;color:#111827;" class="trunc">${esc(c.name)}</span>
          <span class="mono" style="font-size:9.5px;color:#64748b;">(${fmtNum(c.units)} unit)</span>
        </div>
        <div class="mono" style="font-size:10.5px;font-weight:700;color:#111827;white-space:nowrap;">${fmtMiliar(c.nbvKomIdr)} <span style="font-weight:500;color:#64748b;">(${fmtPct(share)})</span></div>
      </div>
      <div style="height:6px;background:#e2e8f0;border-radius:2px;overflow:hidden;margin-bottom:3px;">
        <div style="width:${share.toFixed(1)}%;height:100%;background:${c.color};"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#64748b;">
        <span>Fiskal: ${esc(c.fisLife)} · Kom: ${esc(c.komLife)}</span>
        <span class="mono">Nov Selisih: <strong style="color:${diffNov < 0 ? '#0369a1' : '#047857'};">${diffNov < 0 ? '-' : '+'}${fmtJuta(Math.abs(diffNov))}</strong></span>
      </div>
    </div>`;
  }).join('');

  const alertsHtml = [
    {
      code: 'AST-3310',
      title: 'Laser Barcode Terminal #19 — Tidak Terpindai di Opname Q4',
      detail: 'Lokasi terakhir: Pabrik & Depo Surabaya · Pemegang: Arif H. · NBV Rp 6,8 jt · Eskalasi BAP Kehilangan.',
      tag: 'Hilang',
      tone: 'bad',
    },
    {
      code: 'AST-0891',
      title: 'Server Rack HPE DL380 Gen11 — Selisih Pajak Tangguhan',
      detail: 'DC Cyber 1 · Masa manfaat Komersial 5 th vs Fiskal Kel. 1 (4 th) · Beda temporer akum. Rp 22,17 jt.',
      tag: 'PSAK 46',
      tone: 'info',
    },
    {
      code: 'AST-3105',
      title: 'MacBook Pro 16 M3 Max — Terpindai di Lokasi Berbeda (Tanpa BAST)',
      detail: 'Terdaftar HQ JKT Lt. 8, terdeteksi Handheld Cikarang · Perlu BAST Mutasi Antar-Cabang.',
      tag: 'Mutasi',
      tone: 'warn',
    },
    {
      code: 'JRN-11',
      title: 'Draft Jurnal Penyusutan Nov 2026 Siap Posting ke ERP GL',
      detail: 'Komersial Rp 412.800.000 | Fiskal Rp 438.150.000 | Liabilitas Pajak Tangguhan Rp 5.577.000.',
      tag: 'Siap Post',
      tone: 'ok',
    },
  ]
    .map(
      (a) => `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:6px 8px;border:1px solid #e5e7eb;border-radius:3px;background:#fafbfc;">
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <span class="mono" style="font-size:9.8px;font-weight:700;color:#374151;">${esc(a.code)}</span>
            <span style="font-size:10.5px;font-weight:700;color:#111827;" class="trunc">${esc(a.title)}</span>
          </div>
          <div style="font-size:9.8px;color:#475569;line-height:1.3;">${esc(a.detail)}</div>
        </div>
        ${badge(a.tag, a.tone)}
      </div>`
    )
    .join('');

  const contentHtml = `
    ${kpiHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.42fr 1fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex: 0 0 326px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${eic('scale', 13, '#374151')} Tren Penyusutan Ganda 2026: Komersial (PSAK 16) vs Fiskal (UU PPh)</div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('Selisih Nov: -Rp 25,35 jt', 'info')}
              ${badge('DTL 22%: Rp 5,58 jt', 'neutral')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
            ${deprChart}
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 9px;display:flex;align-items:center;justify-content:space-between;font-size:10px;">
              <span class="mono" style="color:#111827;font-weight:600;">Penyusutan Nov 2026: Komersial Rp 412.800.000 | Fiskal Rp 438.150.000 | Selisih Pajak Tangguhan tercatat.</span>
              <span style="color:#047857;font-weight:700;">Rekonsiliasi 0 Selisih</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${eic('building', 13, '#374151')} Matriks Opname Q4 2026 &amp; Nilai Buku per Lokasi / Entitas</div>
            <span class="e-panel-sub">6 Lokasi Aktif · 24 Gate UHF RFID · Sinkron Offline .NET MAUI</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:68px;" />
                <col style="width:205px;" />
                <col style="width:56px;" />
                <col style="width:64px;" />
                <col style="width:54px;" />
                <col style="width:52px;" />
                <col style="width:128px;" />
                <col style="width:94px;" />
                <col style="width:94px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Lokasi / Cabang</th>
                  <th class="num">Total</th>
                  <th class="num">Lulus</th>
                  <th class="num">Mutasi</th>
                  <th class="num">Hilang</th>
                  <th>Capaian Opname</th>
                  <th class="num">NBV Komersial</th>
                  <th class="num">NBV Fiskal</th>
                </tr>
              </thead>
              <tbody>${locRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2">TOTAL KONSOLIDASI (6 LOKASI)</td>
                  <td class="num mono">${fmtNum(TOTAL_UNITS)}</td>
                  <td class="num mono" style="color:#047857;">${fmtNum(TOTAL_VERIFIED)}</td>
                  <td class="num mono">${TOTAL_IN_TRANSIT}</td>
                  <td class="num mono" style="color:#be123c;">${TOTAL_MISSING}</td>
                  <td class="mono" style="color:#047857;">96,8% Lulus</td>
                  <td class="num mono">${fmtMiliar(TOTAL_NBV_KOM)}</td>
                  <td class="num mono" style="color:#0f766e;">${fmtMiliar(TOTAL_NBV_FIS)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:auto;padding:8px 11px;background:#f8fafc;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:10px;">
              <div><div class="at-kv-label">Batas Akhir Opname Q4</div><div class="mono" style="font-weight:700;color:#111827;">28 November 2026 (H-9)</div></div>
              <div><div class="at-kv-label">Audit Eksternal KAP</div><div class="mono" style="font-weight:700;color:#047857;">Siap Uji Petik · 100% QR/RFID</div></div>
              <div><div class="at-kv-label">Sync Handheld Terakhir</div><div class="mono" style="font-weight:700;color:#0f766e;">19 Nov 09:45 WIB (14 Device)</div></div>
            </div>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex: 0 0 368px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#374151')} Komposisi Nilai Buku per Kelompok UU PPh</div>
            ${badge('PMK 72/2023', 'neutral')}
          </div>
          <div class="e-panel-body" style="padding:5px 11px;">
            ${classBars}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#be123c')} Tindak Lanjut Audit &amp; Anomali Opname Q4</div>
            ${badge('4 Prioritas', 'warn')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            ${alertsHtml}
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeId: 'p1',
    breadcrumb: 'Eksekutif & Pengendalian',
    pageTitle: 'Kokpit Aset Tetap & Opname Q4 2026',
    subRightHtml: `
      <div class="at-seg">
        <span class="at-seg-item is-on">Konsolidasi Grup</span>
        <span class="at-seg-item">PSAK 16</span>
        <span class="at-seg-item">Fiskal UU PPh</span>
      </div>
      <span class="e-btn">${eic('printer', 12, '#374151')} Cetak Batch QR</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} Posting Penyusutan</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: REGISTER ASET TETAP & INSPEKTOR KARTU ASET
// ============================================================================
function renderPage2() {
  const filterBar = `<div class="e-panel" style="flex-shrink:0;">
    <div style="padding:6px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:#f8fafc;">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;">
        <span class="e-btn" style="background:#ffffff;">${ic('filter', 11, '#374151')} Kelompok: <strong>Semua (Kel. 1–4 &amp; Bgn)</strong> ${ic('chevronDown', 10)}</span>
        <span class="e-btn" style="background:#ffffff;">Lokasi: <strong>6 Cabang</strong> ${ic('chevronDown', 10)}</span>
        <span class="e-btn" style="background:#ffffff;">Status Opname Q4: <strong>Semua (4.820)</strong> ${ic('chevronDown', 10)}</span>
        <span class="e-btn" style="background:#eef1f5;border-color:#94a3b8;color:#111827;">${eic('scale', 11, '#374151')} Tampilkan Selisih Pajak Tangguhan</span>
        <span class="e-btn" style="background:#fff1f2;border-color:#fecdd3;color:#be123c;">Hilang: 14</span>
      </div>
      <div class="mono" style="font-size:10px;color:#475569;">
        Menampilkan <strong>18</strong> aset prioritas dari <strong>4.820</strong> register · Subtotal NBV: <strong>${fmtMiliar(SAMPLE_NBV_KOM_SUM)}</strong>
      </div>
    </div>
  </div>`;

  const rowsHtml = ASSETS.map((a) => {
    const cls = a.selected ? 'is-selected' : a.bad ? 'is-bad' : a.warn ? 'is-warn' : '';
    return `<tr class="${cls}">
      <td><span class="cb ${a.selected ? 'checked' : ''}">${a.selected ? ic('check', 9, '#ffffff') : ''}</span></td>
      <td class="mono" style="font-weight:700;color:#111827;">${esc(a.code)}</td>
      <td style="font-weight:600;">${esc(a.name)}</td>
      <td class="mono" style="font-size:9.8px;color:#475569;">${esc(a.kel)}</td>
      <td>${esc(a.locShort)}</td>
      <td>${esc(a.custodian)}</td>
      <td class="num mono">${fmtIdr(a.cost)}</td>
      <td class="num mono" style="font-weight:700;">${fmtIdr(a.nbvKom)}</td>
      <td class="num mono" style="color:#0f766e;">${fmtIdr(a.nbvFis)}</td>
      <td class="mono" style="font-size:9.5px;color:#64748b;">${esc(a.lastScan)}</td>
      <td>${badge(a.status, a.tone)}</td>
    </tr>`;
  }).join('');

  const sel = ASSETS.find((x) => x.selected) || ASSETS[2];
  const diffSel = sel.nbvKom - sel.nbvFis; // 22,167,000
  const dtlSel = Math.round(diffSel * 0.22); // 4,876,740

  const inspectorHtml = `<section class="e-panel" style="height:100%;">
    <div class="e-panel-head" style="background:#1f2937;color:#ffffff;border-bottom-color:#111827;">
      <div class="e-panel-title" style="color:#ffffff;">${eic('qr', 13, '#e5e7eb')} Inspektor Kartu Aset · ${esc(sel.code)}</div>
      ${badge('Pajak Tangguh', 'info')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
      <div style="display:flex;gap:10px;align-items:center;padding:8px;border:1px solid #d6dce5;border-radius:4px;background:#f8fafc;">
        <div style="padding:4px;background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;">
          ${renderQrSvg('AST-0891|HPE-DL380-G11|DC-JKT', 64, '#111827')}
        </div>
        <div style="min-width:0;flex:1;">
          <div style="font-size:12px;font-weight:700;color:#111827;margin-bottom:2px;">${esc(sel.name)}</div>
          <div class="mono" style="font-size:9.6px;color:#475569;margin-bottom:4px;">SN: SGH428X9KL · EPC: 3034-257B-F400-0891</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            ${badge('DC Cyber 1 · Rak B-04', 'neutral')}
            ${badge('UHF RFID + QR', 'ok')}
            ${badge('BAST #109', 'accent')}
          </div>
        </div>
      </div>

      <div>
        <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.03em;">Identitas Perolehan &amp; Capex</div>
        <div class="at-kv-grid">
          <div><div class="at-kv-label">No. PO Capex</div><div class="at-kv-val mono">PO-CAPEX-2024-0418</div></div>
          <div><div class="at-kv-label">Tanggal Kapitalisasi</div><div class="at-kv-val mono">15 Jun 2024</div></div>
          <div><div class="at-kv-label">Vendor / Integrator</div><div class="at-kv-val">PT Mitra Integrasi Info</div></div>
          <div><div class="at-kv-label">Cost Center / Entitas</div><div class="at-kv-val mono">CC-INFRA · Induk</div></div>
          <div><div class="at-kv-label">No. Faktur Pajak</div><div class="at-kv-val mono">010.004-24.88192014</div></div>
          <div><div class="at-kv-label">Asuransi All-Risk</div><div class="at-kv-val" style="color:#047857;">Aktif s/d Jun 2027</div></div>
        </div>
      </div>

      <div class="at-divider"></div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.03em;">Komparasi Buku Ganda (PSAK 16 vs UU PPh)</span>
          <span class="mono" style="font-size:9.5px;color:#0369a1;font-weight:700;">Beda Temporer Aktif</span>
        </div>
        <table class="e-table" style="border:1px solid #e2e8f0;">
          <thead>
            <tr>
              <th style="width:42%;">Parameter</th>
              <th class="num" style="width:29%;">Komersial</th>
              <th class="num" style="width:29%;">Fiskal (Kel. 1)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Masa Manfaat</td><td class="num mono">5 Th (60 bln)</td><td class="num mono">4 Th (48 bln)</td></tr>
            <tr><td>Metode / Tarif</td><td class="num mono">GL · 20%/th</td><td class="num mono">GL · 25%/th</td></tr>
            <tr><td>Harga Perolehan</td><td class="num mono">${fmtIdr(sel.cost)}</td><td class="num mono">${fmtIdr(sel.cost)}</td></tr>
            <tr><td>Beban Nov 2026</td><td class="num mono">${fmtIdr(sel.deprKom)}</td><td class="num mono" style="color:#0f766e;">${fmtIdr(sel.deprFis)}</td></tr>
            <tr><td style="font-weight:700;">NBV per 30 Nov 26</td><td class="num mono" style="font-weight:700;">${fmtIdr(sel.nbvKom)}</td><td class="num mono" style="font-weight:700;color:#0f766e;">${fmtIdr(sel.nbvFis)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:6px;padding:6px 8px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;font-size:10px;display:flex;justify-content:space-between;">
          <span style="color:#0369a1;">Selisih NBV: <strong class="mono">${fmtIdr(diffSel)}</strong></span>
          <span style="color:#0369a1;">DTL (22%): <strong class="mono">${fmtIdr(dtlSel)}</strong></span>
        </div>
      </div>

      <div class="at-divider"></div>

      <div>
        <div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.03em;">Jejak Custody &amp; Opname Terakhir</div>
        <div style="display:flex;flex-direction:column;gap:5px;font-size:10px;">
          <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
            <span><strong>Opname Q4 2026</strong> · RFID Gate DC-02 (-46 dBm)</span>
            <span class="mono" style="color:#047857;font-weight:700;">19 Nov 09:44</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
            <span><strong>BAST #109</strong> · Serah Terima Tim Infra DC</span>
            <span class="mono" style="color:#475569;">18 Jun 2024</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
            <span><strong>Cetak Label Metal-Tag</strong> · Zebra ZT411-HQ</span>
            <span class="mono" style="color:#475569;">16 Jun 2024</span>
          </div>
        </div>
      </div>

      <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <span class="e-btn" style="justify-content:center;">${eic('printer', 11)} Cetak Ulang QR</span>
        <span class="e-btn" style="justify-content:center;">${eic('signature', 11)} Mutasi BAST</span>
        <span class="e-btn e-btn-primary" style="justify-content:center;">${eic('scale', 11, '#fff')} Jadwal Fiskal</span>
      </div>
    </div>
  </section>`;

  const contentHtml = `
    ${filterBar}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1fr 404px;gap:9px;">
      <section class="e-panel" style="height:100%;">
        <div class="e-panel-head">
          <div class="e-panel-title">${eic('box', 13, '#374151')} Register Induk Aset Tetap (Fixed Asset Sub-Ledger)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="e-panel-sub">Urut: Kode Aset · Kurs IDR</span>
            ${badge('18 Baris Sampel Aktif', 'neutral')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table at-dense" style="font-size:10.1px;">
            <colgroup>
              <col style="width:24px;" />
              <col style="width:68px;" />
              <col style="width:194px;" />
              <col style="width:94px;" />
              <col style="width:58px;" />
              <col style="width:96px;" />
              <col style="width:120px;" />
              <col style="width:118px;" />
              <col style="width:118px;" />
              <col style="width:78px;" />
              <col style="width:102px;" />
            </colgroup>
            <thead>
              <tr>
                <th><span class="cb"></span></th>
                <th>Kode</th>
                <th>Deskripsi Aset Tetap</th>
                <th>Kelompok PPh</th>
                <th>Lokasi</th>
                <th>Pemegang</th>
                <th class="num">Perolehan</th>
                <th class="num">NBV Komersial</th>
                <th class="num">NBV Fiskal</th>
                <th>Scan Q4</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="6">SUBTOTAL 18 ASET TERPILIH (TOTAL 4.820 ASET = Rp 38,40 M NBV)</td>
                <td class="num mono">${fmtIdr(SAMPLE_COST_SUM)}</td>
                <td class="num mono">${fmtIdr(SAMPLE_NBV_KOM_SUM)}</td>
                <td class="num mono" style="color:#0f766e;">${fmtIdr(SAMPLE_NBV_FIS_SUM)}</td>
                <td colspan="2" class="mono" style="text-align:right;">Selisih: ${fmtIdr(SAMPLE_NBV_KOM_SUM - SAMPLE_NBV_FIS_SUM)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      ${inspectorHtml}
    </div>
  `;

  return renderShell({
    activeId: 'p2',
    breadcrumb: 'Master Data Aset',
    pageTitle: 'Register Aset Tetap & Inspektor Kartu Aset',
    subRightHtml: `
      <span class="e-btn">${ic('download', 11)} Ekspor Excel / CSV</span>
      <span class="e-btn">${eic('printer', 11)} Cetak Batch Label (12)</span>
      <span class="e-btn e-btn-primary">+ Kapitalisasi PO Capex</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3: PETA FASILITAS UHF RFID & REKONSILIASI OPNAME (VISUAL CENTERPIECE #1)
// ============================================================================
function renderPage3() {
  // Architectural CAD-style SVG Floorplan of Gudang & Kawasan Cikarang + UHF RFID Portals
  const floorplanSvg = `<svg viewBox="0 0 960 600" width="100%" height="100%" style="display:block;background:#f8fafc;">
    <defs>
      <pattern id="grid20" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.7"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="960" height="600" fill="url(#grid20)" />

    <!-- Outer Building Shell -->
    <rect x="20" y="18" width="920" height="564" fill="#ffffff" stroke="#374151" stroke-width="2.5" rx="3" />
    <text x="34" y="38" font-size="11.2" font-weight="700" font-family="Segoe UI,system-ui,sans-serif" fill="#111827">DENAH LANTAI 1 — GUDANG &amp; KAWASAN INDUSTRI CIKARANG (BLOK B · 6.400 m²) · FREKUENSI UHF 920–925 MHz SDPPI</text>
    <text x="926" y="38" text-anchor="end" font-size="9.5" font-family="Consolas,monospace" fill="#64748b">SKALA 1:250 · 6 PORTAL RFID AKTIF</text>

    <!-- ZONE A: Receiving & Loading Dock -->
    <rect x="36" y="54" width="214" height="224" fill="#f0fdf4" stroke="#047857" stroke-width="1.5" rx="2" />
    <text x="48" y="74" font-size="10.5" font-weight="700" fill="#065f46">ZONA A · RECEIVING &amp; DOCK</text>
    <text x="48" y="88" font-size="9" font-family="Consolas,monospace" fill="#047857">142 / 142 Aset (100% Lulus)</text>
    <rect x="48" y="104" width="56" height="36" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
    <text x="76" y="125" text-anchor="middle" font-size="8.5" font-family="Consolas,monospace" fill="#374151">DOCK 01</text>
    <rect x="114" y="104" width="56" height="36" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
    <text x="142" y="125" text-anchor="middle" font-size="8.5" font-family="Consolas,monospace" fill="#374151">DOCK 02</text>
    <rect x="180" y="104" width="58" height="36" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
    <text x="209" y="125" text-anchor="middle" font-size="8.5" font-family="Consolas,monospace" fill="#374151">TIMBANG</text>
    <rect x="48" y="154" width="190" height="44" fill="#ffffff" stroke="#a7f3d0" stroke-width="1"/>
    <text x="143" y="173" text-anchor="middle" font-size="8.8" font-weight="700" fill="#065f46">AREA QC &amp; TAGGING CAPEX BARU</text>
    <text x="143" y="187" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#475569">18 Unit PO Baru Menunggu Label QR</text>
    <!-- RFID Portal Gate-01 -->
    <circle cx="143" cy="278" r="44" fill="none" stroke="#0f766e" stroke-width="1" stroke-dasharray="4,3"/>
    <rect x="103" y="270" width="80" height="16" fill="#0f766e" rx="2"/>
    <text x="143" y="281" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-01</text>

    <!-- ZONE B: Heavy Equipment & Forklift Bay -->
    <rect x="268" y="54" width="382" height="224" fill="#f8fafc" stroke="#374151" stroke-width="1.5" rx="2" />
    <text x="280" y="74" font-size="10.5" font-weight="700" fill="#111827">ZONA B · ALAT BERAT, CRANE &amp; CHARGING FORKLIFT</text>
    <text x="280" y="88" font-size="9" font-family="Consolas,monospace" fill="#475569">318 / 322 Aset (98,8% · 4 Servis Rutin)</text>
    <rect x="284" y="104" width="110" height="28" fill="#e2e8f0" stroke="#94a3b8"/>
    <text x="339" y="122" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#1e293b">RAK HEAVY B-01</text>
    <rect x="284" y="142" width="110" height="28" fill="#e2e8f0" stroke="#94a3b8"/>
    <text x="339" y="160" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#1e293b">RAK HEAVY B-02</text>
    <rect x="284" y="180" width="110" height="28" fill="#e2e8f0" stroke="#94a3b8"/>
    <text x="339" y="198" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#1e293b">BAY CRANE 10T</text>
    <rect x="284" y="218" width="110" height="28" fill="#e2e8f0" stroke="#94a3b8"/>
    <text x="339" y="236" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#1e293b">CHARGING BAY</text>
    <!-- Live Asset Beacon AST-1042 -->
    <circle cx="462" cy="144" r="24" fill="#dcfce7" stroke="#047857" stroke-width="1" stroke-dasharray="3,2"/>
    <circle cx="462" cy="144" r="6" fill="#047857" stroke="#ffffff" stroke-width="2"/>
    <rect x="476" y="122" width="160" height="40" fill="#ffffff" stroke="#047857" stroke-width="1.2" rx="2"/>
    <text x="484" y="138" font-size="9" font-weight="700" font-family="Consolas,monospace" fill="#065f46">AST-1042 · FORKLIFT 3T</text>
    <text x="484" y="152" font-size="8.3" font-family="Consolas,monospace" fill="#374151">RSSI -42dBm · Verified 09:12</text>
    <!-- Overhead Crane Beacon AST-2407 -->
    <circle cx="430" cy="214" r="5.5" fill="#047857" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="444" y="198" width="152" height="32" fill="#ffffff" stroke="#64748b" stroke-width="1" rx="2"/>
    <text x="452" y="212" font-size="8.8" font-weight="700" font-family="Consolas,monospace" fill="#111827">AST-2407 · CRANE 10T</text>
    <text x="452" y="224" font-size="8.2" font-family="Consolas,monospace" fill="#047857">RFID Metal OK · 09:10</text>
    <!-- RFID Gate-02 -->
    <rect x="422" y="270" width="80" height="16" fill="#0f766e" rx="2"/>
    <text x="462" y="281" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-02</text>

    <!-- ZONE C: IT Cage & Labeling Room -->
    <rect x="668" y="54" width="256" height="224" fill="#f0f9ff" stroke="#0369a1" stroke-width="1.5" rx="2" />
    <text x="680" y="74" font-size="10.5" font-weight="700" fill="#0c4a6e">ZONA C · IT CAGE &amp; LABEL ZEBRA</text>
    <text x="680" y="88" font-size="9" font-family="Consolas,monospace" fill="#0369a1">184 / 186 Aset (98,9% · 2 Mutasi)</text>
    <rect x="682" y="104" width="106" height="62" fill="#ffffff" stroke="#7dd3fc"/>
    <text x="735" y="130" text-anchor="middle" font-size="9" font-weight="700" fill="#0c4a6e">RUANG SERVER</text>
    <text x="735" y="145" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#475569">42 Unit · Lock</text>
    <rect x="800" y="104" width="110" height="62" fill="#ffffff" stroke="#7dd3fc"/>
    <text x="855" y="130" text-anchor="middle" font-size="9" font-weight="700" fill="#0c4a6e">STASIUN ZEBRA</text>
    <text x="855" y="145" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#047857">ZT411 · AST-3412</text>
    <!-- Unauthorized location mismatch alert -->
    <circle cx="712" cy="214" r="18" fill="#fef3c7" stroke="#b45309" stroke-width="1" stroke-dasharray="3,2"/>
    <circle cx="712" cy="214" r="5.5" fill="#b45309" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="728" y="194" width="182" height="40" fill="#fffbeb" stroke="#b45309" stroke-width="1.2" rx="2"/>
    <text x="736" y="210" font-size="8.8" font-weight="700" font-family="Consolas,monospace" fill="#92400e">AST-3105 · MACBOOK PRO 16</text>
    <text x="736" y="224" font-size="8.2" font-family="Consolas,monospace" fill="#b45309">MISMATCH: Terdaftar HQ JKT!</text>
    <rect x="756" y="270" width="80" height="16" fill="#0f766e" rx="2"/>
    <text x="796" y="281" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-06</text>

    <!-- Main Corridor Aisle -->
    <rect x="36" y="294" width="888" height="36" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="6,4"/>
    <text x="480" y="316" text-anchor="middle" font-size="9.6" font-weight="700" font-family="Consolas,monospace" fill="#475569">KORIDOR UTAMA FORKLIFT &amp; LINTASAN SCAN HANDHELD ZEBRA TC26  (LEBAR 4,5 m)</text>

    <!-- ZONE D: Cold Storage & Medical Calibration -->
    <rect x="36" y="346" width="290" height="220" fill="#f8fafc" stroke="#374151" stroke-width="1.5" rx="2" />
    <rect x="140" y="338" width="80" height="16" fill="#0f766e" rx="2"/>
    <text x="180" y="349" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-03</text>
    <text x="48" y="372" font-size="10.5" font-weight="700" fill="#111827">ZONA D · KALIBRASI &amp; PERALATAN LAB</text>
    <text x="48" y="386" font-size="9" font-family="Consolas,monospace" fill="#047857">168 / 172 Aset (97,7% · 4 Kalibrasi)</text>
    <rect x="50" y="402" width="126" height="60" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="113" y="427" text-anchor="middle" font-size="8.8" font-weight="700" fill="#374151">RUANG KALIBRASI</text>
    <text x="113" y="442" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#64748b">Suhu 21°C · 64 Unit</text>
    <rect x="188" y="402" width="124" height="60" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="250" y="427" text-anchor="middle" font-size="8.8" font-weight="700" fill="#374151">CADANGAN MEDIS</text>
    <text x="250" y="442" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#64748b">104 Unit · Tersegel</text>

    <!-- ZONE E: Staging Mutasi & Karantina Selisih (ALERT ZONE) -->
    <rect x="344" y="346" width="306" height="220" fill="#fff1f2" stroke="#be123c" stroke-width="1.6" rx="2" />
    <rect x="456" y="338" width="80" height="16" fill="#be123c" rx="2"/>
    <text x="496" y="349" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-04</text>
    <text x="356" y="372" font-size="10.5" font-weight="700" fill="#9f1239">ZONA E · STAGING MUTASI &amp; SELISIH OPNAME</text>
    <text x="356" y="386" font-size="9" font-family="Consolas,monospace" fill="#be123c">86 / 98 Aset · 3 UNIT BELUM DITEMUKAN!</text>
    <rect x="358" y="402" width="126" height="62" fill="#ffffff" stroke="#fda4af"/>
    <text x="421" y="425" text-anchor="middle" font-size="8.8" font-weight="700" fill="#9f1239">STAGING MUTASI</text>
    <text x="421" y="440" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#475569">9 Unit Tunggu BAST</text>
    <!-- Missing Asset Alert Marker -->
    <circle cx="514" cy="434" r="18" fill="#ffe4e6" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3,2"/>
    <circle cx="514" cy="434" r="6" fill="#be123c" stroke="#ffffff" stroke-width="2"/>
    <rect x="528" y="402" width="110" height="62" fill="#ffffff" stroke="#be123c" stroke-width="1.2" rx="2"/>
    <text x="535" y="418" font-size="8.4" font-weight="700" font-family="Consolas,monospace" fill="#be123c">3 UNIT HILANG</text>
    <text x="535" y="431" font-size="8" font-family="Consolas,monospace" fill="#374151">AST-2984 · Scan</text>
    <text x="535" y="443" font-size="8" font-family="Consolas,monospace" fill="#374151">AST-3011 · Palet</text>
    <text x="535" y="455" font-size="8" font-family="Consolas,monospace" fill="#374151">AST-3192 · Tab</text>

    <!-- ZONE F: Disposal / Write-Off Quarantine -->
    <rect x="668" y="346" width="256" height="220" fill="#f8fafc" stroke="#475569" stroke-width="1.5" rx="2" />
    <rect x="756" y="338" width="80" height="16" fill="#0f766e" rx="2"/>
    <text x="796" y="349" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">RFID GATE-05</text>
    <text x="680" y="372" font-size="10.5" font-weight="700" fill="#111827">ZONA F · KARANTINA LELANG &amp; SCRAP</text>
    <text x="680" y="386" font-size="9" font-family="Consolas,monospace" fill="#475569">54 / 60 Aset (6 Menunggu DoA CFO)</text>
    <rect x="682" y="402" width="228" height="62" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="692" y="422" font-size="9" font-weight="700" fill="#111827">BATCH LELANG Q4-2026 (#DSP-019)</text>
    <text x="692" y="437" font-size="8.3" font-family="Consolas,monospace" fill="#475569">12 Laptop Tua + 2 Genset · NBV Rp 18,4 jt</text>
    <text x="692" y="451" font-size="8.3" font-family="Consolas,monospace" fill="#047857">Status: Siap Berita Acara Pemusnahan</text>

    <!-- Legend Strip inside floorplan bottom -->
    <rect x="48" y="514" width="266" height="38" fill="#ffffff" stroke="#e2e8f0" rx="2"/>
    <circle cx="62" cy="533" r="5" fill="#047857"/>
    <text x="72" y="536" font-size="8.5" fill="#374151">Terverifikasi</text>
    <circle cx="136" cy="533" r="5" fill="#b45309"/>
    <text x="146" y="536" font-size="8.5" fill="#374151">Pindah No-BAST</text>
    <circle cx="236" cy="533" r="5" fill="#be123c"/>
    <text x="246" y="536" font-size="8.5" fill="#374151">Hilang/Alert</text>

    <rect x="358" y="514" width="280" height="38" fill="#ffffff" stroke="#fda4af" rx="2"/>
    <text x="368" y="530" font-size="8.6" font-weight="700" fill="#9f1239">GATE-04 EXIT ALERT (08:42 WIB):</text>
    <text x="368" y="544" font-size="8.3" font-family="Consolas,monospace" fill="#374151">EPC 3034-...-3192 melintas tanpa Gate Pass</text>

    <rect x="682" y="514" width="228" height="38" fill="#ffffff" stroke="#e2e8f0" rx="2"/>
    <text x="692" y="530" font-size="8.6" font-weight="700" fill="#111827">TOTAL CIKARANG: 952 / 980 (97,1%)</text>
    <text x="692" y="544" font-size="8.3" font-family="Consolas,monospace" fill="#0f766e">Reader Uptime: 99,94% · LLRP v1.1</text>
  </svg>`;

  const rfidStream = [
    { time: '09:44:18', epc: '3034-257B-0891', code: 'AST-0891', gate: 'DC-GATE-02', rssi: '-46 dBm', res: 'COCOK', tone: 'ok' },
    { time: '09:41:05', epc: '3034-257B-3412', code: 'AST-3412', gate: 'CKR-HH-04', rssi: '-38 dBm', res: 'COCOK', tone: 'ok' },
    { time: '09:38:52', epc: '3034-257B-3105', code: 'AST-3105', gate: 'CKR-GATE-02', rssi: '-51 dBm', res: 'PINDAH', tone: 'warn' },
    { time: '09:12:30', epc: '3034-257B-1042', code: 'AST-1042', gate: 'CKR-GATE-02', rssi: '-42 dBm', res: 'COCOK', tone: 'ok' },
    { time: '09:10:11', epc: '3034-257B-2407', code: 'AST-2407', gate: 'CKR-ANT-B3', rssi: '-49 dBm', res: 'COCOK', tone: 'ok' },
    { time: '08:42:09', epc: '3034-257B-3192', code: 'AST-3192', gate: 'CKR-GATE-04', rssi: '-58 dBm', res: 'NO PASS', tone: 'bad' },
    { time: '08:15:44', epc: '3034-257B-1925', code: 'AST-1925', gate: 'SBY-GATE-01', rssi: '-44 dBm', res: 'COCOK', tone: 'ok' },
    { time: '07:55:21', epc: '3034-257B-2944', code: 'AST-2944', gate: 'SMG-HH-01', rssi: '-36 dBm', res: 'COCOK', tone: 'ok' },
  ];

  const exceptions = [
    { code: 'AST-3310', item: 'Barcode Terminal #19', loc: 'PL-SBY', nbv: 'Rp 6,8 jt', issue: 'Hilang >30h', act: 'BAP Hilang', tone: 'bad' },
    { code: 'AST-3192', item: 'Rugged Tab Active', loc: 'WH-CKR', nbv: 'Rp 8,4 jt', issue: 'No Gate Pass', act: 'Cek CCTV', tone: 'bad' },
    { code: 'AST-2984', item: 'Handheld RFD40 #07', loc: 'WH-CKR', nbv: 'Rp 19,2 jt', issue: 'Tak Terpindai', act: 'Lacak GA', tone: 'bad' },
    { code: 'AST-3011', item: 'Pallet Stacker 1.5T', loc: 'WH-CKR', nbv: 'Rp 46,5 jt', issue: 'Tag Rusak', act: 'Cetak Tag', tone: 'warn' },
    { code: 'AST-3105', item: 'MacBook Pro 16 M3', loc: 'HQ→CKR', nbv: 'Rp 28,1 jt', issue: 'Tanpa BAST', act: 'Auto BAST', tone: 'warn' },
    { code: 'AST-3208', item: 'Infusion Pump TE-171', loc: 'RS-BDG', nbv: 'Rp 11,4 jt', issue: 'Pindah Ruang', act: 'Update Rak', tone: 'warn' },
    { code: 'AST-3341', item: 'Proyektor Epson L520', loc: 'LB-SMG', nbv: 'Rp 16,2 jt', issue: 'Tak Terpindai', act: 'Konfirm PIC', tone: 'bad' },
  ];

  const contentHtml = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.62fr 1fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${eic('rfid', 13, '#0f766e')} Peta Fasilitas &amp; Telemetri Gate UHF RFID — Gudang Cikarang (WH-CKR)</div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('6 Gate Aktif', 'ok')}
              ${badge('952 / 980 Terverifikasi (97,1%)', 'neutral')}
              ${badge('3 Hilang · 1 Mismatch', 'bad')}
            </div>
          </div>
          <div class="e-panel-body" style="padding:6px;">
            ${floorplanSvg}
          </div>
        </section>

        <div class="e-kpi-strip" style="grid-template-columns: repeat(4, 1fr);">
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Kecepatan Scan UHF</span>${badge('Impinj R700', 'info')}</div>
            <div class="e-kpi-val">840 tag/dtk</div>
            <div class="e-kpi-foot"><span>Mode Multi-Tag Bulk</span><span class="mono">922,5 MHz</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Antrean Sync Offline</span>${badge('SQLite WAL', 'ok')}</div>
            <div class="e-kpi-val">0 konflik</div>
            <div class="e-kpi-foot"><span>14 Handheld TC26</span><span class="mono">Last: 18 dtk</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Pindah Lokasi Tanpa BAST</span>${badge('Perlu Aksi', 'warn')}</div>
            <div class="e-kpi-val" style="color:#b45309;">6 unit</div>
            <div class="e-kpi-foot"><span>Auto-draft Mutasi</span><span class="mono">6 Lokasi</span></div>
          </div>
          <div class="e-kpi">
            <div class="e-kpi-top"><span>Selisih Hilang (Nasional)</span>${badge('Investigasi', 'bad')}</div>
            <div class="e-kpi-val" style="color:#be123c;">14 unit</div>
            <div class="e-kpi-foot"><span>Batas Tutup Opname</span><span class="mono">28 Nov 2026</span></div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">
        <section class="e-panel" style="flex: 0 0 364px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f766e')} Aliran Scan Gate RFID &amp; Handheld Live</div>
            ${badge('LLRP Stream', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table at-dense">
              <colgroup>
                <col style="width:66px;" />
                <col style="width:74px;" />
                <col style="width:104px;" />
                <col style="width:68px;" />
                <col style="width:76px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>WIB</th>
                  <th>Aset</th>
                  <th>Reader/Gate</th>
                  <th class="num">RSSI</th>
                  <th>Validasi</th>
                </tr>
              </thead>
              <tbody>
                ${rfidStream
                  .map(
                    (s) => `<tr class="${s.tone === 'bad' ? 'is-bad' : s.tone === 'warn' ? 'is-warn' : ''}">
                      <td class="mono" style="font-size:9.6px;">${s.time}</td>
                      <td class="mono" style="font-weight:700;">${s.code}</td>
                      <td class="mono" style="font-size:9.6px;">${s.gate}</td>
                      <td class="num mono" style="font-size:9.6px;">${s.rssi}</td>
                      <td>${badge(s.res, s.tone)}</td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#be123c')} Meja Rekonsiliasi Selisih Opname Q4</div>
            ${badge('14 Hilang · 6 Mutasi', 'bad')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table at-dense" style="font-size:10.1px;">
              <colgroup>
                <col style="width:68px;" />
                <col style="width:128px;" />
                <col style="width:56px;" />
                <col style="width:72px;" />
                <col style="width:94px;" />
                <col style="width:82px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Aset</th>
                  <th>Lokasi</th>
                  <th class="num">NBV</th>
                  <th>Temuan</th>
                  <th>Disposisi</th>
                </tr>
              </thead>
              <tbody>
                ${exceptions
                  .map(
                    (e) => `<tr class="${e.tone === 'bad' ? 'is-bad' : 'is-warn'}">
                      <td class="mono" style="font-weight:700;">${e.code}</td>
                      <td>${esc(e.item)}</td>
                      <td class="mono" style="font-size:9.3px;">${e.loc}</td>
                      <td class="num mono">${e.nbv}</td>
                      <td>${badge(e.issue, e.tone)}</td>
                      <td><span class="e-btn" style="height:19px;padding:0 5px;font-size:9.1px;">${esc(e.act)}</span></td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeId: 'p3',
    breadcrumb: 'Opname Fisik Q4 2026',
    pageTitle: 'Peta Fasilitas UHF RFID & Rekonsiliasi Opname',
    subRightHtml: `
      <div class="at-seg">
        <span class="at-seg-item">HQ JKT</span>
        <span class="at-seg-item is-on">WH Cikarang</span>
        <span class="at-seg-item">DC Cyber 1</span>
        <span class="at-seg-item">Depo SBY</span>
        <span class="at-seg-item">RS BDG</span>
      </div>
      <span class="e-btn">${ic('refresh', 11)} Tarik Sync Handheld</span>
      <span class="e-btn e-btn-danger">Terbitkan BAP Selisih (14)</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4: MESIN PENYUSUTAN GANDA PSAK 16 VS FISKAL UU PPH (SURFACE #2)
// ============================================================================
function renderPage4() {
  const paramStrip = `<div class="e-panel" style="flex-shrink:0;">
    <div style="padding:6px 11px;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;">
      <div style="display:flex;align-items:center;gap:12px;font-size:10.5px;">
        <span><strong>Periode Hitung:</strong> <span class="mono">November 2026 (11/12)</span></span>
        <span><strong>Dasar Komersial:</strong> PSAK 16 (Garis Lurus / Nilai Residu)</span>
        <span><strong>Dasar Fiskal:</strong> UU PPh Ps. 11 &amp; PMK 72/2023 (Kel. 1–4)</span>
        <span><strong>Tarif PPh Badan:</strong> <span class="mono" style="font-weight:700;color:#0369a1;">22% (UU HPP)</span></span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('Beda Temporer Nov: -Rp 25.350.000', 'info')}
        ${badge('DTL Nov (22%): Rp 5.577.000', 'accent')}
      </div>
    </div>
  </div>`;

  const classRows = TAX_CLASSES.map((c) => {
    const diff = c.deprKomNov - c.deprFisNov;
    const dtl = Math.round(diff * -0.22);
    const shortKom = c.komLife.replace(' (GL)', '');
    const shortFis = c.fisLife.replace(' GL)', ')');
    return `<tr>
      <td style="font-weight:700;">${esc(c.id)}</td>
      <td>${esc(c.name)}</td>
      <td class="num mono">${fmtNum(c.units)}</td>
      <td class="mono" style="font-size:9.5px;">${esc(shortKom)}</td>
      <td class="mono" style="font-size:9.5px;color:#0f766e;">${esc(shortFis)}</td>
      <td class="num mono" style="font-weight:600;">${fmtIdr(c.deprKomNov)}</td>
      <td class="num mono" style="color:#0f766e;font-weight:600;">${fmtIdr(c.deprFisNov)}</td>
      <td class="num mono" style="color:${diff < 0 ? '#0369a1' : '#047857'};font-weight:700;">${diff < 0 ? '-' : '+'}${fmtIdr(Math.abs(diff))}</td>
      <td class="num mono">${dtl >= 0 ? fmtIdr(dtl) : '-' + fmtIdr(Math.abs(dtl))}</td>
    </tr>`;
  }).join('');

  // Stacked bar comparing commercial vs fiscal depreciation across classes (in Rp Juta)
  const stackedSvg = svgStackedBarChart({
    width: 610,
    height: 162,
    categories: ['Kel. 1', 'Kel. 2', 'Kel. 3', 'Kel. 4', 'Bgn Perm', 'Bgn Non'],
    yMax: 180,
    yFormat: (v) => `${Math.round(v)} jt`,
    series: [
      { label: 'Beban Komersial Nov (Rp jt)', values: [118.4, 146.2, 74.6, 22.1, 41.2, 10.3], color: '#374151' },
      { label: 'Selisih Lebih Fiskal (Rp jt)', values: [15.85, 9.2, 2.3, 0, 0, 0], color: '#0f766e' },
    ],
  });

  // Sample 12-row Multi-Year Asset Depreciation Schedule
  const sampleAssets12 = ASSETS.slice(0, 12);
  const sampleSchedule = sampleAssets12.map((a) => {
    const diffBln = a.deprKom - a.deprFis;
    const diffNbv = a.nbvKom - a.nbvFis;
    return `<tr class="${a.selected ? 'is-selected' : ''}">
      <td class="mono" style="font-weight:700;">${a.code}</td>
      <td style="font-weight:600;">${esc(a.name)}</td>
      <td class="mono" style="font-size:9.6px;">${a.acqDate}</td>
      <td class="mono" style="font-size:9.6px;">${a.komLife} vs ${a.kel}</td>
      <td class="num mono">${fmtIdr(a.cost)}</td>
      <td class="num mono">${fmtIdr(a.deprKom)}</td>
      <td class="num mono" style="color:#0f766e;">${fmtIdr(a.deprFis)}</td>
      <td class="num mono" style="color:${diffBln < 0 ? '#0369a1' : '#475569'};font-weight:${diffBln !== 0 ? '700' : '400'};">${diffBln === 0 ? 'Rp 0' : (diffBln < 0 ? '-' : '+') + fmtIdr(Math.abs(diffBln))}</td>
      <td class="num mono" style="font-weight:600;">${fmtIdr(a.nbvKom)}</td>
      <td class="num mono" style="color:#0f766e;">${fmtIdr(a.nbvFis)}</td>
      <td>${diffNbv !== 0 ? badge('DTL PSAK 46', 'info') : badge('Sinkron', 'ok')}</td>
    </tr>`;
  }).join('');
  const s12Cost = sampleAssets12.reduce((a, x) => a + x.cost, 0);
  const s12DeprK = sampleAssets12.reduce((a, x) => a + x.deprKom, 0);
  const s12DeprF = sampleAssets12.reduce((a, x) => a + x.deprFis, 0);
  const s12NbvK = sampleAssets12.reduce((a, x) => a + x.nbvKom, 0);
  const s12NbvF = sampleAssets12.reduce((a, x) => a + x.nbvFis, 0);

  const contentHtml = `
    ${paramStrip}
    <div style="display:grid;grid-template-columns: 1.52fr 1fr;gap:9px;flex: 0 0 342px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${eic('scale', 13, '#374151')} Ringkasan Beban Penyusutan Ganda Nov 2026 per Kelompok</div>
          ${badge('Komersial Rp 412,8 jt · Fiskal Rp 438,15 jt', 'neutral')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table at-dense" style="font-size:10.1px;">
            <colgroup>
              <col style="width:48px;" />
              <col style="width:162px;" />
              <col style="width:46px;" />
              <col style="width:58px;" />
              <col style="width:82px;" />
              <col style="width:104px;" />
              <col style="width:104px;" />
              <col style="width:104px;" />
              <col style="width:92px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Kelompok Fiskal</th>
                <th class="num">Unit</th>
                <th>Kom.</th>
                <th>Fiskal PPh</th>
                <th class="num">Depr. Kom</th>
                <th class="num">Depr. Fiskal</th>
                <th class="num">Beda Temp.</th>
                <th class="num">Pajak 22%</th>
              </tr>
            </thead>
            <tbody>${classRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL NOV 2026 (6 KELOMPOK)</td>
                <td class="num mono">${fmtNum(TOTAL_UNITS)}</td>
                <td colspan="2" class="mono">Tarif PPh 22%</td>
                <td class="num mono">${fmtIdr(TOTAL_DEPR_KOM_NOV)}</td>
                <td class="num mono" style="color:#0f766e;">${fmtIdr(TOTAL_DEPR_FIS_NOV)}</td>
                <td class="num mono" style="color:#0369a1;">-${fmtIdr(Math.abs(DIFF_TEMP_NOV))}</td>
                <td class="num mono" style="color:#0369a1;">${fmtIdr(DEFERRED_TAX_NOV)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 11px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto;">
            <div>
              <div class="at-kv-label">Beda Temporer Kumulatif (NBV)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#111827;">Rp 1.480.000.000</div>
            </div>
            <div>
              <div class="at-kv-label">Saldo Liabilitas Pajak Tangguhan</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0369a1;">Rp 325.600.000</div>
            </div>
            <div>
              <div class="at-kv-label">Koreksi Fiskal Negatif (SPT 1771)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#0f766e;">-Rp 25.350.000 / bln</div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex: 0 0 208px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f766e')} Divergensi Beban Nov 2026 per Kelompok</div>
            <span class="e-panel-sub">Fiskal lebih cepat pada Kel. 1 &amp; 2</span>
          </div>
          <div class="e-panel-body" style="padding:5px 10px;">
            ${stackedSvg}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 13, '#374151')} Kalkulator Laba/Rugi Pelepasan Aset (AST-0412)</div>
            ${badge('PPN Pasal 16D', 'warn')}
          </div>
          <div class="e-panel-body" style="padding:6px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;font-size:10.2px;">
              <span><strong>AST-0412</strong> · Toyota Hilux 2019 (Lelang)</span>
              <span class="mono" style="font-weight:700;">Jual: Rp 145.000.000</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
              <div style="padding:4px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
                <div class="at-kv-label">NBV Komersial</div>
                <div class="mono" style="font-weight:700;font-size:10.5px;">Rp 118.500.000</div>
                <div style="font-size:9.1px;color:#047857;font-weight:700;">Laba: +Rp 26,5 jt</div>
              </div>
              <div style="padding:4px 6px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:3px;">
                <div class="at-kv-label">NBV Fiskal (Kel. 2)</div>
                <div class="mono" style="font-weight:700;font-size:10.5px;color:#0f766e;">Rp 110.200.000</div>
                <div style="font-size:9.1px;color:#0f766e;font-weight:700;">Laba Fis: +Rp 34,8 jt</div>
              </div>
              <div style="padding:4px 6px;background:#fffbeb;border:1px solid #fde68a;border-radius:3px;">
                <div class="at-kv-label">PPN 16D (11%)</div>
                <div class="mono" style="font-weight:700;font-size:10.5px;color:#b45309;">Rp 15.950.000</div>
                <div style="font-size:9.1px;color:#92400e;">Kode Faktur 090</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${eic('book', 13, '#374151')} Kertas Kerja Penyusutan Ganda per Unit Aset (Lampiran 1A SPT &amp; Audit PSAK 16)</div>
        <span class="e-panel-sub">Menampilkan 12 aset lintas kelompok · Perhitungan pro-rata bulanan otomatis</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table at-dense">
          <colgroup>
            <col style="width:72px;" />
            <col style="width:228px;" />
            <col style="width:82px;" />
            <col style="width:136px;" />
            <col style="width:120px;" />
            <col style="width:100px;" />
            <col style="width:100px;" />
            <col style="width:102px;" />
            <col style="width:120px;" />
            <col style="width:120px;" />
            <col style="width:94px;" />
          </colgroup>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Aset Tetap</th>
              <th>Tgl Perolehan</th>
              <th>Komersial vs Fiskal</th>
              <th class="num">Harga Perolehan</th>
              <th class="num">Beban Kom.</th>
              <th class="num">Beban Fiskal</th>
              <th class="num">Selisih Bln</th>
              <th class="num">NBV Komersial</th>
              <th class="num">NBV Fiskal</th>
              <th>Status PSAK 46</th>
            </tr>
          </thead>
          <tbody>${sampleSchedule}</tbody>
          <tfoot>
            <tr>
              <td colspan="4">SUBTOTAL 12 ASET SAMPEL KERTAS KERJA</td>
              <td class="num mono">${fmtIdr(s12Cost)}</td>
              <td class="num mono">${fmtIdr(s12DeprK)}</td>
              <td class="num mono" style="color:#0f766e;">${fmtIdr(s12DeprF)}</td>
              <td class="num mono" style="color:#0369a1;">-${fmtIdr(Math.abs(s12DeprK - s12DeprF))}</td>
              <td class="num mono">${fmtIdr(s12NbvK)}</td>
              <td class="num mono" style="color:#0f766e;">${fmtIdr(s12NbvF)}</td>
              <td class="mono" style="color:#0369a1;">6 DTL Aktif</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  `;

  return renderShell({
    activeId: 'p4',
    breadcrumb: 'Akuntansi & Perpajakan',
    pageTitle: 'Mesin Penyusutan Ganda PSAK 16 vs Fiskal UU PPh',
    subRightHtml: `
      <span class="e-btn">${ic('download', 11)} Ekspor Lampiran 1A SPT</span>
      <span class="e-btn">${ic('sliders', 11)} Simulasi Saldo Menurun</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#fff')} Jalankan Kalkulasi Nov 2026</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5: JURNAL GL OTOMATIS, REKONSILIASI ERP & CORETAX XML
// ============================================================================
function renderPage5() {
  const glRows = GL_JOURNAL_LINES.map((l) => {
    const isTax = l.ref.startsWith('PSAK46') || l.ref === 'EFK-16D';
    const isDisp = l.ref === 'DISP-0412';
    return `<tr class="${isTax ? 'is-selected' : isDisp ? 'is-warn' : ''}">
      <td class="mono" style="color:#64748b;">${String(l.line).padStart(2, '0')}</td>
      <td class="mono" style="font-weight:700;">${l.coa}</td>
      <td>${esc(l.account)}</td>
      <td class="mono" style="font-size:9.5px;color:#475569;">${l.cc}</td>
      <td class="num mono" style="font-weight:${l.debit ? '600' : '400'};color:${l.debit ? '#111827' : '#94a3b8'};">${l.debit ? fmtIdr(l.debit) : '—'}</td>
      <td class="num mono" style="font-weight:${l.credit ? '600' : '400'};color:${l.credit ? '#0f766e' : '#94a3b8'};">${l.credit ? fmtIdr(l.credit) : '—'}</td>
      <td class="mono" style="font-size:9.3px;">${badge(l.ref, isTax ? 'info' : isDisp ? 'warn' : 'neutral')}</td>
    </tr>`;
  }).join('');

  const reconRows = [
    { coa: '1202-101', name: 'Aset Tetap — Kel. 1 (IT & Kantor)', sub: 13600000000, gl: 13600000000 },
    { coa: '1202-102', name: 'Aset Tetap — Kel. 2 (Alat Berat/Medis)', sub: 19250000000, gl: 19250000000 },
    { coa: '1202-103', name: 'Aset Tetap — Kel. 3 (Mesin & Genset)', sub: 13800000000, gl: 13800000000 },
    { coa: '1202-104', name: 'Aset Tetap — Kel. 4 (Crane & Berat)', sub: 4900000000, gl: 4900000000 },
    { coa: '1202-105', name: 'Bangunan Permanen & Non-Permanen', sub: 12700000000, gl: 12700000000 },
    { coa: '1209-ALL', name: 'Akumulasi Penyusutan (Kredit)', sub: -25850000000, gl: -25850000000 },
  ];

  const coretaxXml = `<span class="xml-com">&lt;!-- CoreTax DJP · Lampiran 1A Penyusutan Fiskal --&gt;</span>
<span class="xml-tag">&lt;CoreTaxAssetDepr</span> <span class="xml-attr">versi</span>=<span class="xml-val">"2.1"</span> <span class="xml-attr">npwp16</span>=<span class="xml-val">"0019284710092000"</span><span class="xml-tag">&gt;</span>
  <span class="xml-tag">&lt;MasaPajak&gt;</span><span class="xml-val">2026-11</span><span class="xml-tag">&lt;/MasaPajak&gt;</span>
  <span class="xml-tag">&lt;DasarHukum&gt;</span><span class="xml-val">PMK-72/PMK.03/2023</span><span class="xml-tag">&lt;/DasarHukum&gt;</span>
  <span class="xml-tag">&lt;RingkasanFiskal&gt;</span>
    <span class="xml-tag">&lt;JumlahUnit&gt;</span><span class="xml-val">4820</span><span class="xml-tag">&lt;/JumlahUnit&gt;</span>
    <span class="xml-tag">&lt;DeprKomersial&gt;</span><span class="xml-val">412800000</span><span class="xml-tag">&lt;/DeprKomersial&gt;</span>
    <span class="xml-tag">&lt;DeprFiskal&gt;</span><span class="xml-val">438150000</span><span class="xml-tag">&lt;/DeprFiskal&gt;</span>
    <span class="xml-tag">&lt;KoreksiNegatif&gt;</span><span class="xml-val">-25350000</span><span class="xml-tag">&lt;/KoreksiNegatif&gt;</span>
    <span class="xml-tag">&lt;DTL_PSAK46_22Pct&gt;</span><span class="xml-val">5577000</span><span class="xml-tag">&lt;/DTL_PSAK46_22Pct&gt;</span>
  <span class="xml-tag">&lt;/RingkasanFiskal&gt;</span>
  <span class="xml-tag">&lt;KelompokAset</span> <span class="xml-attr">kode</span>=<span class="xml-val">"KEL-1"</span> <span class="xml-attr">tarif</span>=<span class="xml-val">"25%"</span><span class="xml-tag">&gt;</span>
    <span class="xml-tag">&lt;Unit&gt;</span><span class="xml-val">2180</span><span class="xml-tag">&lt;/Unit&gt;</span>
    <span class="xml-tag">&lt;BebanBulan&gt;</span><span class="xml-val">134250000</span><span class="xml-tag">&lt;/BebanBulan&gt;</span>
  <span class="xml-tag">&lt;/KelompokAset&gt;</span>
  <span class="xml-tag">&lt;Pelepasan16D</span> <span class="xml-attr">aset</span>=<span class="xml-val">"AST-0412"</span><span class="xml-tag">&gt;</span>
    <span class="xml-tag">&lt;KodeFaktur&gt;</span><span class="xml-val">090</span><span class="xml-tag">&lt;/KodeFaktur&gt;</span>
    <span class="xml-tag">&lt;DPP&gt;</span><span class="xml-val">145000000</span><span class="xml-tag">&lt;/DPP&gt;</span>
    <span class="xml-tag">&lt;PPN11&gt;</span><span class="xml-val">15950000</span><span class="xml-tag">&lt;/PPN11&gt;</span>
    <span class="xml-tag">&lt;LabaFiskal&gt;</span><span class="xml-val">34800000</span><span class="xml-tag">&lt;/LabaFiskal&gt;</span>
  <span class="xml-tag">&lt;/Pelepasan16D&gt;</span>
  <span class="xml-tag">&lt;SignatureSHA256&gt;</span><span class="xml-val">c21f8a94...9a04</span><span class="xml-tag">&lt;/SignatureSHA256&gt;</span>
<span class="xml-tag">&lt;/CoreTaxAssetDepr&gt;</span>`;

  const contentHtml = `
    <div class="e-kpi-strip" style="grid-template-columns: repeat(4, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Batch Jurnal Aktif</span>${badge('Seimbang · 19 Baris', 'ok')}</div>
        <div class="e-kpi-val">JRN-DEP-202611</div>
        <div class="e-kpi-foot"><span>Total Debit = Kredit</span><span class="mono" style="font-weight:700;">${fmtIdr(GL_TOTAL_DEBIT)}</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Beban Penyusutan PSAK 16</span>${badge('6 Akun COA', 'neutral')}</div>
        <div class="e-kpi-val">${fmtIdr(TOTAL_DEPR_KOM_NOV)}</div>
        <div class="e-kpi-foot"><span>Fiskal Nov 2026</span><span class="mono" style="color:#0f766e;">${fmtIdr(TOTAL_DEPR_FIS_NOV)}</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Pajak Tangguhan (PSAK 46)</span>${badge('22% UU HPP', 'info')}</div>
        <div class="e-kpi-val" style="color:#0369a1;">${fmtIdr(DEFERRED_TAX_NOV)}</div>
        <div class="e-kpi-foot"><span>Dr 5302-001 / Cr 2205-001</span><span class="mono">Otomatis</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Laba Pelepasan &amp; PPN 16D</span>${badge('AST-0412', 'warn')}</div>
        <div class="e-kpi-val" style="color:#047857;">Rp 26.500.000</div>
        <div class="e-kpi-foot"><span>PPN Keluaran 090 (11%)</span><span class="mono">Rp 15.950.000</span></div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.52fr 1fr;gap:9px;">
      <section class="e-panel" style="height:100%;">
        <div class="e-panel-head">
          <div class="e-panel-title">${eic('book', 13, '#374151')} Entri Jurnal Buku Besar (Double-Entry GL — SAP FI-AA / Accurate)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Selisih: Rp 0', 'ok')}
            ${badge('Siap Posting ERP', 'accent')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:28px;" />
              <col style="width:74px;" />
              <col style="width:316px;" />
              <col style="width:68px;" />
              <col style="width:112px;" />
              <col style="width:112px;" />
              <col style="width:86px;" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Akun COA</th>
                <th>Deskripsi Akun Buku Besar</th>
                <th>Cost Ctr</th>
                <th class="num">Debit (IDR)</th>
                <th class="num">Kredit (IDR)</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>${glRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">TOTAL BATCH JURNAL (SEIMBANG / BALANCED)</td>
                <td class="num mono">${fmtIdr(GL_TOTAL_DEBIT)}</td>
                <td class="num mono" style="color:#0f766e;">${fmtIdr(GL_TOTAL_CREDIT)}</td>
                <td class="mono" style="color:#047857;">BAL = 0</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex: 0 0 288px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('checkCircle', 13, '#047857')} Rekonsiliasi Sub-Ledger Aset vs GL ERP</div>
            ${badge('Varian Rp 0', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:70px;" />
                <col style="width:186px;" />
                <col style="width:108px;" />
                <col style="width:108px;" />
                <col style="width:64px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>COA</th>
                  <th>Akun Kontrol Aset Tetap</th>
                  <th class="num">Sub-Ledger</th>
                  <th class="num">Saldo GL ERP</th>
                  <th class="num">Varian</th>
                </tr>
              </thead>
              <tbody>
                ${reconRows
                  .map(
                    (r) => `<tr>
                      <td class="mono" style="font-weight:700;">${r.coa}</td>
                      <td>${esc(r.name)}</td>
                      <td class="num mono">${fmtMiliar(r.sub)}</td>
                      <td class="num mono">${fmtMiliar(r.gl)}</td>
                      <td class="num mono" style="color:#047857;font-weight:700;">Rp 0</td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">NILAI BUKU NET KONSOLIDASI</td>
                  <td class="num mono">${fmtMiliar(TOTAL_NBV_KOM)}</td>
                  <td class="num mono">${fmtMiliar(TOTAL_NBV_KOM)}</td>
                  <td class="num mono" style="color:#047857;">COCOK</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:auto;padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9.8px;color:#374151;">
              <span>Tutup Buku SAP FI-AA Periode 11/2026: <strong>Siap Kunci</strong></span>
              <span class="mono" style="color:#047857;font-weight:700;">Varian 6 COA: Rp 0</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#374151')} Payload XML CoreTax DJP (Lampiran 1A &amp; Faktur 16D)</div>
            <div style="display:flex;gap:5px;">
              ${badge('XSD Valid', 'ok')}
              <span class="e-btn" style="height:20px;font-size:9.5px;">${ic('copy', 10)} Salin XML</span>
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
            <div class="at-code-box" style="flex:1;">${coretaxXml}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;padding:5px 8px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
              <span style="color:#065f46;font-weight:600;">SAP OData RFC Bridge: Terhubung · Siap Posting Otomatis ke Periode 11/2026</span>
              <span class="mono" style="color:#047857;font-weight:700;">HTTP 200 · 42 ms</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeId: 'p5',
    breadcrumb: 'Integrasi Buku Besar & Pajak',
    pageTitle: 'Jurnal GL Otomatis, Rekonsiliasi ERP & CoreTax XML',
    subRightHtml: `
      <span class="e-btn">${ic('download', 11)} Unduh CoreTax XML</span>
      <span class="e-btn">${ic('fileText', 11)} Voucher Jurnal PDF</span>
      <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Posting Batch ke SAP FI-AA</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 6: BAST DIGITAL, CUSTODY PEMEGANG & ALUR DOA APPROVAL
// ============================================================================
function renderPage6() {
  const stepperHtml = `<div class="at-stepper">
    <div class="at-step is-done">
      <div>
        <div style="font-size:9.5px;color:#047857;font-weight:700;">TAHAP 1 · MAKER</div>
        <div style="font-size:11.5px;font-weight:700;color:#111827;">GA Asset Officer</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">Dwi Santoso · 18 Nov 14:10</div>
      </div>
      ${badge('Selesai', 'ok')}
    </div>
    <div class="at-step is-done">
      <div>
        <div style="font-size:9.5px;color:#047857;font-weight:700;">TAHAP 2 · CHECKER</div>
        <div style="font-size:11.5px;font-weight:700;color:#111827;">IT / Dept Head Pemegang</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">Eko Prasetyo · 18 Nov 15:22</div>
      </div>
      ${badge('Disetujui', 'ok')}
    </div>
    <div class="at-step is-now">
      <div>
        <div style="font-size:9.5px;color:#374151;font-weight:700;">TAHAP 3 · CONTROLLER</div>
        <div style="font-size:11.5px;font-weight:700;color:#111827;">Fixed Asset Controller</div>
        <div class="mono" style="font-size:9.2px;color:#b45309;">R. Kusuma · SLA 02j 14m lagi</div>
      </div>
      ${badge('Menunggu', 'warn')}
    </div>
    <div class="at-step is-wait">
      <div>
        <div style="font-size:9.5px;color:#64748b;font-weight:700;">TAHAP 4 · APPROVER (DoA &gt;50jt)</div>
        <div style="font-size:11.5px;font-weight:700;color:#111827;">VP General Affairs / CFO</div>
        <div class="mono" style="font-size:9.2px;color:#64748b;">Otomatis TTE &amp; e-Meterai</div>
      </div>
      ${badge('Antre', 'neutral')}
    </div>
  </div>`;

  const approvals = [
    { id: 'DOA-2611-441', type: 'BAST Custody', asset: 'AST-2819 · ThinkPad X1 Carbon', nbv: 14200000, req: 'Dimas Aditya (IT)', stage: 'TTE Selesai', sla: '00j 00m', status: 'Sah & Aktif', tone: 'ok', selected: true },
    { id: 'DOA-2611-440', type: 'Write-Off Hilang', asset: 'AST-3310 · Barcode Terminal #19', nbv: 6800000, req: 'Arif H. (SBY)', stage: 'Controller 3/4', sla: '02j 14m', status: 'Review BAP', tone: 'bad', bad: true },
    { id: 'DOA-2611-439', type: 'Mutasi Lokasi', asset: 'AST-3105 · MacBook Pro 16 M3', nbv: 28100000, req: 'Nadia S. (HQ→CKR)', stage: 'Checker 2/4', sla: '04j 30m', status: 'Menunggu', tone: 'warn', warn: true },
    { id: 'DOA-2611-438', type: 'Pelepasan Lelang', asset: 'AST-0412 · Toyota Hilux 2019', nbv: 118500000, req: 'Pool GA HQ', stage: 'CFO Approved', sla: 'Selesai', status: 'Posting GL', tone: 'ok' },
    { id: 'DOA-2611-437', type: 'BAST Custody', asset: 'AST-3418 · Dell Precision 5690', nbv: 42500000, req: 'Hendra P. (SBY)', stage: 'Checker 2/4', sla: '06j 12m', status: 'Menunggu', tone: 'warn' },
    { id: 'DOA-2611-436', type: 'Kapitalisasi PO', asset: 'PO-2611-091 · 12x Rack Switch', nbv: 312000000, req: 'Tim Infra DC', stage: 'VP GA 4/4', sla: '01j 40m', status: 'Eskalasi', tone: 'warn' },
    { id: 'DOA-2611-435', type: 'BAST Custody', asset: 'AST-2671 · Ventilator Drager', nbv: 242000000, req: 'Ns. Rina (BDG)', stage: 'TTE Selesai', sla: 'Selesai', status: 'Sah & Aktif', tone: 'ok' },
    { id: 'DOA-2611-434', type: 'Servis Eksternal', asset: 'AST-3388 · Oscilloscope MSO44', nbv: 94500000, req: 'Dr. Bagus (SMG)', stage: 'Gate Pass OK', sla: 'Selesai', status: 'Di Vendor', tone: 'info' },
    { id: 'DOA-2611-433', type: 'BAST Kembali', asset: 'AST-2104 · ThinkPad T14s Gen4', nbv: 9800000, req: 'Offboard: Wibowo', stage: 'GA Check 1/2', sla: '03j 05m', status: 'Cek Fisik', tone: 'warn' },
    { id: 'DOA-2611-432', type: 'Pelepasan Scrap', asset: 'BATCH-DSP-019 (14 Unit Rusak)', nbv: 18400000, req: 'GA Cikarang', stage: 'CFO 4/4', sla: '05j 50m', status: 'Menunggu', tone: 'warn' },
    { id: 'DOA-2611-431', type: 'Mutasi Cost Ctr', asset: 'AST-1108 · USG 4D GE Voluson', nbv: 516000000, req: 'RS Medika BDG', stage: 'TTE Selesai', sla: 'Selesai', status: 'Sah & Aktif', tone: 'ok' },
    { id: 'DOA-2611-430', type: 'BAST Custody', asset: 'AST-3412 · Printer Zebra ZT411', nbv: 22500000, req: 'GA Labeling CKR', stage: 'TTE Selesai', sla: 'Selesai', status: 'Sah & Aktif', tone: 'ok' },
    { id: 'DOA-2611-429', type: 'Revaluasi PSAK', asset: 'AST-0519 · Gudang Cikarang B', nbv: 3748000000, req: 'KJPP Independen', stage: 'Audit Komite', sla: '18j 00m', status: 'Review KAP', tone: 'info' },
    { id: 'DOA-2611-428', type: 'BAST Custody', asset: 'AST-1042 · Forklift Electric 3T', nbv: 248000000, req: 'Bambang W. (WH)', stage: 'TTE Selesai', sla: 'Selesai', status: 'Sah & Aktif', tone: 'ok' },
  ];

  const bastPreview = `<div class="at-doc-paper">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111827;padding-bottom:7px;">
      <div>
        <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:0.04em;">PT NUSANTARA INFRASTRUKTUR &amp; MEDIKA TBK</div>
        <div style="font-size:13.5px;font-weight:800;color:#111827;">BERITA ACARA SERAH TERIMA ASET TETAP (BAST)</div>
        <div class="mono" style="font-size:9.8px;color:#374151;">Nomor: BAST/GA/2026/XI/0441 · Tanggal: 18 November 2026</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${renderQrSvg('BAST/GA/2026/XI/0441|AST-2819|DIMAS', 50, '#111827')}
      </div>
    </div>

    <div style="font-size:10.3px;color:#374151;line-height:1.45;">
      Pada hari ini, Rabu tanggal <strong>18 November 2026</strong>, telah dilakukan serah terima penguasaan fisik (custody) aset tetap perusahaan antara <strong>Pihak Pertama (General Affairs)</strong> dan <strong>Pihak Kedua (Pemegang Aset)</strong> dengan rincian:
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;padding:7px 9px;border-radius:3px;font-size:10px;">
      <div>
        <div class="at-kv-label">PIHAK PERTAMA (PENYERAH)</div>
        <div style="font-weight:700;color:#111827;">Dwi Santoso</div>
        <div style="color:#475569;">NIP 19890412-084 · GA Asset Officer HQ</div>
      </div>
      <div>
        <div class="at-kv-label">PIHAK KEDUA (PEMEGANG ASET)</div>
        <div style="font-weight:700;color:#111827;">Dimas Aditya Pratama</div>
        <div style="color:#475569;">NIP 19930821-219 · Sr. Infra Engineer (IT)</div>
      </div>
    </div>

    <table class="e-table at-dense" style="border:1px solid #cbd5e1;">
      <thead>
        <tr>
          <th style="width:72px;">Kode Aset</th>
          <th>Spesifikasi &amp; Nomor Seri</th>
          <th style="width:84px;">Kel. Fiskal</th>
          <th class="num" style="width:108px;">NBV Saat Ini</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="mono" style="font-weight:700;">AST-2819</td>
          <td><strong>ThinkPad X1 Carbon Gen 12</strong> · 32GB/1TB · SN: PF4M91X2</td>
          <td class="mono">Kel. 1 (4th)</td>
          <td class="num mono" style="font-weight:700;">Rp 14.200.000</td>
        </tr>
      </tbody>
    </table>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:9.8px;">
      <div style="padding:5px 7px;border:1px solid #e2e8f0;border-radius:3px;">
        <div class="at-kv-label">Kelengkapan Fisik</div>
        <div style="color:#047857;font-weight:600;">Charger 65W, Tas, Stiker QR</div>
      </div>
      <div style="padding:5px 7px;border:1px solid #e2e8f0;border-radius:3px;">
        <div class="at-kv-label">Kondisi Inspeksi</div>
        <div style="color:#111827;font-weight:600;">Baik (Skor 98/100)</div>
      </div>
      <div style="padding:5px 7px;border:1px solid #e2e8f0;border-radius:3px;">
        <div class="at-kv-label">Lokasi Penempatan</div>
        <div style="color:#111827;font-weight:600;">HQ Jakarta · Lt. 12 IT</div>
      </div>
    </div>

    <div style="font-size:9.6px;color:#475569;background:#f8fafc;border-left:3px solid #374151;padding:6px 8px;line-height:1.4;">
      <strong>Klausul Custody:</strong> Pemegang aset wajib menjaga keamanan fisik, tidak memindahtangankan tanpa BAST Mutasi, dan wajib mengembalikan aset saat berakhirnya hubungan kerja (Offboarding HRIS terblokir hingga clearance BAST terbit).
    </div>

    <div style="border:1px solid #e2e8f0;border-radius:3px;padding:7px 9px;background:#fafcfe;display:flex;flex-direction:column;gap:5px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:9.6px;font-weight:700;color:#374151;">JEJAK VERIFIKASI ELEKTRONIK &amp; LAMPIRAN BUKTI</span>
        ${badge('HRIS Clearance Hook: AKTIF', 'ok')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9.4px;color:#475569;">
        <div><strong>Foto Serah Terima:</strong> <span class="mono">2 JPG (Geotag -6.224, 106.822)</span></div>
        <div><strong>Verifikasi QR Fisik:</strong> <span class="mono" style="color:#047857;">Cocok · Scanner MAUI</span></div>
        <div><strong>No. Seri e-Meterai:</strong> <span class="mono">EMTR-2026-8841-9920</span></div>
        <div><strong>Status Peruri / BSrE:</strong> <span class="mono" style="color:#047857;">Tersertifikasi Valid</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;padding-top:6px;border-top:1px dashed #cbd5e1;">
      <div style="text-align:center;">
        <div style="font-size:9.2px;color:#64748b;margin-bottom:3px;">Pihak Pertama · GA Asset Officer</div>
        <svg width="120" height="36" viewBox="0 0 120 36" style="display:block;margin:0 auto;">
          <path d="M12 26 C24 8, 36 28, 48 16 C56 8, 64 26, 76 18 C88 12, 96 22, 108 16" fill="none" stroke="#1f2937" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <div style="font-size:10px;font-weight:700;color:#111827;">Dwi Santoso</div>
        <div class="mono" style="font-size:8.6px;color:#047857;">TTE Terverifikasi · 18 Nov 14:10</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:9.2px;color:#64748b;margin-bottom:3px;">Pihak Kedua · Pemegang Aset</div>
        <svg width="120" height="36" viewBox="0 0 120 36" style="display:block;margin:0 auto;">
          <path d="M16 24 C28 12, 34 26, 46 12 C54 22, 68 28, 80 14 C90 10, 98 24, 108 20" fill="none" stroke="#1f2937" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <div style="font-size:10px;font-weight:700;color:#111827;">Dimas Aditya Pratama</div>
        <div class="mono" style="font-size:8.6px;color:#047857;">TTE Mobile MAUI · 18 Nov 16:40</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:5px;border-top:1px solid #e2e8f0;font-size:9px;color:#64748b;">
      <span class="mono">SHA-256: 7f91e4a0c3b8...4d19 · WORM Archive</span>
      <span style="color:#047857;font-weight:700;">Sah Secara Hukum · UU ITE</span>
    </div>
  </div>`;

  const contentHtml = `
    ${stepperHtml}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 1.44fr 1fr;gap:9px;">
      <section class="e-panel" style="height:100%;">
        <div class="e-panel-head">
          <div class="e-panel-title">${eic('signature', 13, '#374151')} Antrean Persetujuan DoA (BAST, Mutasi, Pelepasan &amp; Write-Off)</div>
          <div style="display:flex;gap:6px;">
            ${badge('5 Menunggu Aksi Anda', 'warn')}
            ${badge('1 Eskalasi SLA', 'bad')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table at-dense" style="font-size:10.1px;">
            <colgroup>
              <col style="width:88px;" />
              <col style="width:94px;" />
              <col style="width:178px;" />
              <col style="width:118px;" />
              <col style="width:108px;" />
              <col style="width:96px;" />
              <col style="width:62px;" />
              <col style="width:82px;" />
            </colgroup>
            <thead>
              <tr>
                <th>No. Pengajuan</th>
                <th>Jenis</th>
                <th>Objek Aset Tetap</th>
                <th class="num">Nilai Buku</th>
                <th>Pemohon / PIC</th>
                <th>Tahap DoA</th>
                <th>SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${approvals
                .map(
                  (r) => `<tr class="${r.selected ? 'is-selected' : r.bad ? 'is-bad' : r.warn ? 'is-warn' : ''}">
                    <td class="mono" style="font-weight:700;">${r.id}</td>
                    <td>${esc(r.type)}</td>
                    <td style="font-weight:600;">${esc(r.asset)}</td>
                    <td class="num mono">${fmtIdr(r.nbv)}</td>
                    <td>${esc(r.req)}</td>
                    <td class="mono" style="font-size:9.5px;">${esc(r.stage)}</td>
                    <td class="mono" style="font-size:9.5px;color:${r.sla.startsWith('01') || r.sla.startsWith('02') ? '#be123c' : '#475569'};font-weight:${r.sla.startsWith('01') || r.sla.startsWith('02') ? '700' : '400'};">${r.sla}</td>
                    <td>${badge(r.status, r.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="e-panel" style="height:100%;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#374151')} Pratinjau Dokumen BAST Digital · #441</div>
          <div style="display:flex;gap:5px;">
            <span class="e-btn" style="height:20px;font-size:9.5px;">${ic('download', 10)} PDF TTE</span>
            <span class="e-btn e-btn-primary" style="height:20px;font-size:9.5px;">Setujui Terpilih</span>
          </div>
        </div>
        <div class="e-panel-body" style="background:#eef2f6;padding:10px;">
          ${bastPreview}
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeId: 'p6',
    breadcrumb: 'Tata Kelola & Custody',
    pageTitle: 'BAST Digital, Custody Pemegang & Alur DoA Approval',
    subRightHtml: `
      <span class="e-btn">${ic('users', 11)} Matriks Delegasi DoA</span>
      <span class="e-btn e-btn-primary">+ Buat BAST Serah Terima Baru</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 7: COMPANION MOBILE OPNAME (.NET MAUI) & CETAK LABEL ZEBRA
// ============================================================================
function renderPage7() {
  // Frame 1: Android Rugged Handheld (.NET MAUI QR/UHF RFID Scanner)
  const phone1 = `<div class="at-phone">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 8px 6px;color:#e5e7eb;font-family:var(--e-mono);font-size:9.5px;">
      <span>ZEBRA TC26 · .NET MAUI</span>
      <span>09:45 WIB · UHF 98%</span>
    </div>
    <div class="at-phone-screen">
      <div style="background:#1f2937;color:#ffffff;padding:8px 11px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11.5px;font-weight:700;">Opname Q4 · Gudang Cikarang</div>
          <div class="mono" style="font-size:9px;color:#9ca3af;">Mode Offline SQLite · 952 / 980 (97,1%)</div>
        </div>
        ${badge('UHF ON', 'ok')}
      </div>

      <!-- Viewfinder Simulation -->
      <div style="margin:9px;background:#111827;border-radius:6px;padding:12px;position:relative;color:#f9fafb;border:1px solid #374151;">
        <div style="display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:8.8px;color:#86efac;margin-bottom:8px;">
          <span>SCANNER: QR + UHF EPC-96</span>
          <span>RSSI: -42 dBm (1,2 m)</span>
        </div>
        <div style="display:flex;align-items:center;gap:11px;border:1.5px solid #10b981;border-radius:4px;padding:9px;background:#1f2937;">
          <div style="padding:3px;background:#ffffff;border-radius:2px;">
            ${renderQrSvg('AST-1042|FORKLIFT-3T|WH-CKR', 54, '#111827')}
          </div>
          <div style="min-width:0;">
            <div style="font-family:var(--e-mono);font-size:12px;font-weight:800;color:#86efac;">AST-1042 TERDETEKSI</div>
            <div style="font-size:10.5px;font-weight:600;color:#ffffff;">Forklift Electric 3T Toyota</div>
            <div style="font-size:9px;color:#cbd5e1;">Lokasi Sesuai: WH-CKR · Zona B</div>
            <div style="font-family:var(--e-mono);font-size:8.8px;color:#93c5fd;margin-top:2px;">NBV: Rp 248.000.000 · Kel. 2</div>
          </div>
        </div>
        <div style="margin-top:8px;">
          <div style="display:flex;justify-content:space-between;font-size:8.8px;color:#9ca3af;margin-bottom:3px;">
            <span>Kekuatan Sinyal Geiger RFID</span>
            <span class="mono" style="color:#86efac;">94% Sangat Dekat</span>
          </div>
          <div style="height:6px;background:#374151;border-radius:2px;overflow:hidden;">
            <div style="width:94%;height:100%;background:#10b981;"></div>
          </div>
        </div>
      </div>

      <!-- Condition quick select -->
      <div style="padding:0 9px;display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:9.8px;font-weight:700;color:#374151;">Kondisi Fisik Saat Opname</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;">
          <div style="padding:6px;text-align:center;border-radius:3px;background:#ecfdf5;border:1.5px solid #047857;color:#065f46;font-weight:700;font-size:10px;">Baik (Normal)</div>
          <div style="padding:6px;text-align:center;border-radius:3px;background:#ffffff;border:1px solid #cbd5e1;color:#475569;font-size:10px;">Rusak Ringan</div>
          <div style="padding:6px;text-align:center;border-radius:3px;background:#ffffff;border:1px solid #cbd5e1;color:#475569;font-size:10px;">Perlu Servis</div>
        </div>
      </div>

      <!-- Recent Offline Queue inside phone -->
      <div style="padding:9px;flex:1;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;justify-content:space-between;font-size:9.8px;font-weight:700;color:#374151;">
          <span>Log Scan Offline (Antrean Sync)</span>
          <span class="mono" style="color:#047857;">428 Tersinkron</span>
        </div>
        ${[
          { c: 'AST-1042', n: 'Forklift Electric 3T', t: '09:12', s: 'Cocok', tone: 'ok' },
          { c: 'AST-2407', n: 'Overhead Crane 10T', t: '09:10', s: 'Cocok', tone: 'ok' },
          { c: 'AST-3105', n: 'MacBook Pro 16 M3', t: '09:04', s: 'Pindah!', tone: 'warn' },
          { c: 'AST-3412', n: 'Printer Zebra ZT411', t: '08:58', s: 'Cocok', tone: 'ok' },
          { c: 'AST-0519', n: 'Gudang Blok B', t: '08:51', s: 'Cocok', tone: 'ok' },
          { c: 'AST-3192', n: 'Rugged Tab Active', t: '08:42', s: 'No-Pass', tone: 'bad' },
          { c: 'AST-1488', n: 'UPS APC 160 kVA', t: '08:36', s: 'Cocok', tone: 'ok' },
          { c: 'AST-0891', n: 'Server HPE DL380', t: '08:31', s: 'Cocok', tone: 'ok' },
        ]
          .map(
            (x) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 7px;background:#ffffff;border:1px solid #e2e8f0;border-radius:3px;font-size:9.8px;">
              <div><span class="mono" style="font-weight:700;">${x.c}</span> · ${esc(x.n)}</div>
              <div style="display:flex;align-items:center;gap:5px;"><span class="mono" style="color:#64748b;font-size:9px;">${x.t}</span>${badge(x.s, x.tone)}</div>
            </div>`
          )
          .join('')}
      </div>

      <div style="padding:8px 9px;background:#ffffff;border-top:1px solid #d6dce5;display:grid;grid-template-columns:1fr 1.3fr;gap:6px;">
        <div style="padding:7px;text-align:center;border:1px solid #cbd5e1;border-radius:3px;font-weight:700;font-size:10px;color:#374151;">Foto Bukti</div>
        <div style="padding:7px;text-align:center;background:#374151;color:#ffffff;border-radius:3px;font-weight:700;font-size:10px;">Konfirmasi Terverifikasi</div>
      </div>
    </div>
  </div>`;

  // Frame 2: Mobile BAST Handover & Digital Signature (.NET MAUI)
  const phone2 = `<div class="at-phone">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 8px 6px;color:#e5e7eb;font-family:var(--e-mono);font-size:9.5px;">
      <span>iOS / ANDROID · .NET MAUI</span>
      <span>09:45 WIB · LTE</span>
    </div>
    <div class="at-phone-screen">
      <div style="background:#1f2937;color:#ffffff;padding:8px 11px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11.5px;font-weight:700;">Serah Terima BAST #441</div>
          <div class="mono" style="font-size:9px;color:#9ca3af;">Custody Pemegang · Tanda Tangan Digital</div>
        </div>
        ${badge('HQ JKT', 'accent')}
      </div>

      <div style="padding:9px;display:flex;flex-direction:column;gap:8px;flex:1;">
        <div style="background:#ffffff;border:1px solid #d6dce5;border-radius:4px;padding:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span class="mono" style="font-weight:700;color:#111827;">AST-2819</span>
            ${badge('Kel. 1 · NBV Rp 14,2 jt', 'neutral')}
          </div>
          <div style="font-size:11px;font-weight:700;color:#111827;">ThinkPad X1 Carbon Gen 12</div>
          <div style="font-size:9.5px;color:#475569;margin-top:2px;">Pemegang: <strong>Dimas Aditya Pratama</strong> (IT Ops)</div>
        </div>

        <!-- Checklist -->
        <div style="background:#ffffff;border:1px solid #d6dce5;border-radius:4px;padding:8px;">
          <div style="font-size:9.8px;font-weight:700;color:#374151;margin-bottom:5px;">Checklist Kelengkapan Fisik (4/4)</div>
          ${[
            'Unit Laptop & Layar Bebas Cacat (SN: PF4M91X2)',
            'Adaptor USB-C 65W Original + Kabel Daya',
            'Stiker QR Silver-Polyester Terpasang di Chasis',
            'Enkripsi BitLocker & MDM Perusahaan Aktif',
          ]
            .map(
              (c) => `<div style="display:flex;align-items:center;gap:6px;font-size:9.6px;color:#111827;padding:2.5px 0;">
                <span class="cb checked">${ic('check', 8, '#ffffff')}</span>
                <span>${esc(c)}</span>
              </div>`
            )
            .join('')}
        </div>

        <!-- Evidence Photo Preview SVG -->
        <div style="background:#ffffff;border:1px solid #d6dce5;border-radius:4px;padding:8px;">
          <div style="display:flex;justify-content:space-between;font-size:9.8px;font-weight:700;color:#374151;margin-bottom:5px;">
            <span>Foto Bukti Geotag (2 Terlampir)</span>
            <span class="mono" style="font-size:9px;color:#047857;">-6.2241, 106.8219</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="height:56px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px;color:#475569;">
              ${eic('qr', 18, '#374151')}
              <span class="mono" style="margin-top:3px;">IMG_0441_TAG.jpg</span>
            </div>
            <div style="height:56px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px;color:#475569;">
              ${eic('box', 18, '#374151')}
              <span class="mono" style="margin-top:3px;">IMG_0441_UNIT.jpg</span>
            </div>
          </div>
        </div>

        <!-- Stylus Signature Pad -->
        <div style="background:#ffffff;border:1px solid #94a3b8;border-radius:4px;padding:8px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#475569;">
            <strong>Tanda Tangan Pemegang Aset</strong>
            <span style="color:#0369a1;">Ulangi</span>
          </div>
          <svg viewBox="0 0 260 66" width="100%" height="62" style="display:block;background:#fafcfe;border:1px dashed #cbd5e1;border-radius:2px;">
            <path d="M26 44 C44 16, 56 50, 74 22 C86 38, 104 48, 126 24 C142 12, 158 46, 182 32 C198 24, 214 38, 234 28" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="16" y1="54" x2="244" y2="54" stroke="#cbd5e1" stroke-width="1"/>
          </svg>
          <div class="mono" style="font-size:8.6px;color:#64748b;">Dimas Aditya Pratama · Timestamp WIB Terkunci</div>
        </div>
      </div>

      <div style="padding:8px 9px;background:#ffffff;border-top:1px solid #d6dce5;">
        <div style="padding:7.5px;text-align:center;background:#047857;color:#ffffff;border-radius:3px;font-weight:700;font-size:10.5px;">Sah &amp; Terbitkan BAST Digital</div>
      </div>
    </div>
  </div>`;

  // Right Column: Zebra ZT411 ZPL II Label Designer & Print Queue
  const zplSnippet = `^XA
^PW400^LL200^LH0,0
^FO14,12^A0N,18,18^FDPT NUSANTARA TBK — FIXED ASSET^FS
^FO14,34^GB372,2,2^FS
^FO14,44^BQN,2,4^FDQA,AST-1042|WH-CKR|KEL2^FS
^FO128,48^A0N,26,26^FDAST-1042^FS
^FO128,78^A0N,16,16^FDForklift Electric 3T Toyota^FS
^FO128,100^A0N,15,15^FDLoc: WH-CKR  Kel.2 (8th)^FS
^FO128,122^A0N,14,14^FDEPC: 3034-257B-F400-1042^FS
^RFW,H,1,12,1^FD3034257BF400104200000001^FS
^PQ12,0,1,Y^XZ`;

  const zebraPanel = `<div style="display:flex;flex-direction:column;gap:9px;height:100%;min-height:0;">
    <section class="e-panel" style="flex: 0 0 218px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${eic('printer', 13, '#374151')} Pratinjau Label Industri (50×25 mm · Silver Polyester + UHF)</div>
        ${badge('300 DPI', 'neutral')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
        <div class="at-zebra-label">
          <div style="padding:4px;background:#ffffff;border:1px solid #9ca3af;">
            ${renderQrSvg('AST-1042|WH-CKR|KEL2|EPC', 74, '#111827')}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:9px;font-weight:700;letter-spacing:0.05em;color:#374151;border-bottom:1.5px solid #111827;padding-bottom:2px;margin-bottom:4px;">PT NUSANTARA INFRASTRUKTUR &amp; MEDIKA TBK</div>
            <div class="mono" style="font-size:16px;font-weight:800;color:#111827;line-height:1.1;">AST-1042</div>
            <div style="font-size:10.5px;font-weight:700;color:#1f2937;margin-top:2px;">Forklift Electric 3T Toyota 8FBE30</div>
            <div class="mono" style="font-size:9.2px;color:#475569;margin-top:2px;">LOC: WH-CKR · KEL. 2 (8 TH) · ACQ: 2023-01</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              ${badge('UHF EPC-96 ENCODED', 'ok')}
              <span class="mono" style="font-size:9px;color:#374151;">3034-257B-F400-1042</span>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:9.8px;color:#475569;">
          <span>Media: <strong>3M Silver Matte On-Metal UHF</strong> (Tahan Panas 120°C)</span>
          <span class="mono" style="color:#047857;font-weight:700;">Verifikasi Encode: OK</span>
        </div>
      </div>
    </section>

    <section class="e-panel" style="flex: 0 0 264px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('code', 13, '#374151')} Buffer Perintah ZPL II + RFID Encoder (^RFW)</div>
        ${badge('TCP/9100 Raw', 'info')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
        <div class="at-code-box" style="flex:1;font-size:9.6px;">${esc(zplSnippet)}</div>
      </div>
    </section>

    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${eic('printer', 13, '#0f766e')} Antrean Printer Label Zebra Multi-Lokasi</div>
        ${badge('6 Online', 'ok')}
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <colgroup>
            <col style="width:128px;" />
            <col style="width:94px;" />
            <col style="width:76px;" />
            <col style="width:96px;" />
            <col style="width:84px;" />
          </colgroup>
          <thead>
            <tr>
              <th>Printer Zebra</th>
              <th>IP / Lokasi</th>
              <th class="num">Batch</th>
              <th>Sisa Ribbon</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="is-selected">
              <td style="font-weight:700;">ZT411-RFID-CKR</td>
              <td class="mono" style="font-size:9.4px;">10.24.8.41</td>
              <td class="num mono">12 label</td>
              <td>${renderCapacityBar(78, { warnAt: 101, critAt: 101 })}</td>
              <td>${badge('Mencetak', 'info')}</td>
            </tr>
            <tr>
              <td style="font-weight:700;">ZT411-RFID-HQ</td>
              <td class="mono" style="font-size:9.4px;">10.10.4.18</td>
              <td class="num mono">48 label</td>
              <td>${renderCapacityBar(64, { warnAt: 101, critAt: 101 })}</td>
              <td>${badge('Siap', 'ok')}</td>
            </tr>
            <tr>
              <td style="font-weight:700;">ZD621R-SBY</td>
              <td class="mono" style="font-size:9.4px;">10.32.2.15</td>
              <td class="num mono">6 label</td>
              <td>${renderCapacityBar(22, { warnAt: 15, critAt: 10 })}</td>
              <td>${badge('Ribbon 22%', 'warn')}</td>
            </tr>
            <tr>
              <td style="font-weight:700;">ZD621R-RSBDG</td>
              <td class="mono" style="font-size:9.4px;">10.41.5.22</td>
              <td class="num mono">0 label</td>
              <td>${renderCapacityBar(91, { warnAt: 101, critAt: 101 })}</td>
              <td>${badge('Siap', 'ok')}</td>
            </tr>
            <tr>
              <td style="font-weight:700;">ZT411-DCJKT</td>
              <td class="mono" style="font-size:9.4px;">10.12.9.08</td>
              <td class="num mono">8 label</td>
              <td>${renderCapacityBar(84, { warnAt: 101, critAt: 101 })}</td>
              <td>${badge('Siap', 'ok')}</td>
            </tr>
            <tr>
              <td style="font-weight:700;">ZD621R-LBSMG</td>
              <td class="mono" style="font-size:9.4px;">10.52.1.14</td>
              <td class="num mono">4 label</td>
              <td>${renderCapacityBar(73, { warnAt: 101, critAt: 101 })}</td>
              <td>${badge('Siap', 'ok')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>`;

  const contentHtml = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns: 446px 446px 1fr;gap:11px;">
      ${phone1}
      ${phone2}
      ${zebraPanel}
    </div>
  `;

  return renderShell({
    activeId: 'p7',
    breadcrumb: 'Operasi Lapangan & Pelabelan',
    pageTitle: 'Companion Mobile Opname (.NET MAUI) & Cetak Label Zebra',
    subRightHtml: `
      <span class="e-btn">${ic('refresh', 11)} Kalibrasi Media RFID</span>
      <span class="e-btn e-btn-primary">${eic('printer', 11, '#fff')} Cetak Batch QR &amp; Encode RFID (78)</span>
    `,
    contentHtml,
  });
}

// ============================================================================
// PAGE 8: KEPATUHAN AUDIT PSAK 16, WORM SHA-256 & INTEGRASI SISTEM
// ============================================================================
function renderPage8() {
  const complianceItems = [
    { std: 'PSAK 16 — Aset Tetap', scope: 'Kapitalisasi, masa manfaat, penurunan nilai & penghentian pengakuan', score: 99, status: 'Patuh', tone: 'ok' },
    { std: 'PSAK 46 — Pajak Penghasilan', scope: 'Pengakuan Liabilitas Pajak Tangguhan (DTL 22%) atas beda temporer', score: 100, status: 'Patuh', tone: 'ok' },
    { std: 'UU PPh & PMK 72/2023', scope: 'Pengelompokan Fiskal Kel. 1–4 & Bangunan + Lampiran 1A SPT', score: 100, status: 'Patuh', tone: 'ok' },
    { std: 'PPN Pasal 16D (Faktur 090)', scope: 'Pemungutan PPN 11% atas penjualan/lelang aktiva semula tidak dijual', score: 100, status: 'Patuh', tone: 'ok' },
    { std: 'UU PDP PP 33/2026 (Custody)', scope: 'Enkripsi NIK/NIP pemegang BAST & retensi dokumen 10 tahun', score: 96, status: 'Audit Q4', tone: 'info' },
  ];

  const rbacRows = [
    { role: 'GA Asset Officer', reg: 'Buat/Edit', opname: 'Scan', bast: 'Maker', depr: 'Baca', disp: 'Usul', sod: 'OK' },
    { role: 'Pemegang / PIC', reg: 'Milik Sendiri', opname: 'Konfirm', bast: 'TTE', depr: '—', disp: '—', sod: 'OK' },
    { role: 'FA Accountant', reg: 'Kapitalisasi', opname: 'Baca', bast: 'Baca', depr: 'Run/Post', disp: 'Jurnal', sod: 'OK' },
    { role: 'Tax Specialist', reg: 'Map Kel. PPh', opname: 'Baca', bast: 'Baca', depr: 'Fiskal/XML', disp: 'PPN 16D', sod: 'OK' },
    { role: 'VP GA / CFO', reg: 'Baca', opname: 'Baca', bast: 'Approver', depr: 'Approve', disp: 'Approve', sod: 'OK' },
    { role: 'Auditor KAP/IA', reg: 'Read-Only', opname: 'Read-Only', bast: 'Read-Only', depr: 'Read-Only', disp: 'WORM Log', sod: 'Isolasi' },
  ];

  const integrations = [
    { sys: 'SAP S/4HANA FI-AA (OData)', dir: 'Bidirectional', freq: 'Real-time', lat: '42 ms', ok: '99,98%', tone: 'ok' },
    { sys: 'CoreTax DJP XML Exporter', dir: 'Outbound', freq: 'Bulanan/SPT', lat: '118 ms', ok: 'XSD 2.1', tone: 'ok' },
    { sys: '.NET MAUI Offline Sync API', dir: 'Bidirectional', freq: 'Delta 15 dtk', lat: '28 ms', ok: '14 Device', tone: 'ok' },
    { sys: 'Impinj LLRP RFID Middleware', dir: 'Inbound', freq: 'Stream', lat: '12 ms', ok: '24 Gate', tone: 'ok' },
    { sys: 'Zebra ZPL Print Spooler', dir: 'Outbound', freq: 'On-Demand', lat: '19 ms', ok: '4 Printer', tone: 'ok' },
    { sys: 'HRIS / Active Directory', dir: 'Inbound', freq: 'Per Jam', lat: '64 ms', ok: 'Offboard Lock', tone: 'info' },
  ];

  const wormLogs = [
    { ts: '19 Nov 09:44:18', seq: '#89412', actor: 'SYSTEM-RFID', entity: 'DC-JKT', ev: 'RFID_OPNAME_VERIFIED', obj: 'AST-0891', hash: 'c21f8a94...9a04', prev: '9b4e1102...3c81', status: 'Terverifikasi' },
    { ts: '19 Nov 09:38:52', seq: '#89411', actor: 'CKR-GATE-02', entity: 'WH-CKR', ev: 'LOCATION_MISMATCH_FLAG', obj: 'AST-3105', hash: '9b4e1102...3c81', prev: '7d10fa66...e290', status: 'Terverifikasi' },
    { ts: '19 Nov 09:15:00', seq: '#89410', actor: 'R. Kusuma', entity: 'KONSOLIDASI', ev: 'DEPR_DUAL_CALC_LOCK', obj: 'PER-2026-11', hash: '7d10fa66...e290', prev: '4a82bc19...01f7', status: 'Terverifikasi' },
    { ts: '19 Nov 09:12:30', seq: '#89409', actor: 'Bambang W.', entity: 'WH-CKR', ev: 'OPNAME_QR_SCAN_OK', obj: 'AST-1042', hash: '4a82bc19...01f7', prev: 'e8193d04...66a2', status: 'Terverifikasi' },
    { ts: '19 Nov 08:42:09', seq: '#89408', actor: 'CKR-GATE-04', entity: 'WH-CKR', ev: 'GATE_EXIT_NO_PASS', obj: 'AST-3192', hash: 'e8193d04...66a2', prev: '2c557b88...9d14', status: 'Alert' },
    { ts: '18 Nov 17:20:44', seq: '#89407', actor: 'CFO (H. Wijaya)', entity: 'HQ-JKT', ev: 'DISPOSAL_DOA_APPROVED', obj: 'AST-0412', hash: '2c557b88...9d14', prev: '5f301e72...b409', status: 'Terverifikasi' },
    { ts: '18 Nov 16:40:12', seq: '#89406', actor: 'Dimas Aditya', entity: 'HQ-JKT', ev: 'BAST_SIGNED_TTE', obj: 'BAST-#441', hash: '5f301e72...b409', prev: 'a1049c33...88e1', status: 'Terverifikasi' },
    { ts: '18 Nov 15:10:05', seq: '#89405', actor: 'Tax Engine', entity: 'KONSOLIDASI', ev: 'CORETAX_XML_VALIDATED', obj: 'L1A-2026-11', hash: 'a1049c33...88e1', prev: '6b228f51...10c9', status: 'Terverifikasi' },
    { ts: '18 Nov 14:28:19', seq: '#89404', actor: 'GA Labeling', entity: 'WH-CKR', ev: 'ZPL_RFID_BATCH_PRINT', obj: 'BATCH-12', hash: '6b228f51...10c9', prev: '1f994a27...77b3', status: 'Terverifikasi' },
    { ts: '18 Nov 11:05:31', seq: '#89403', actor: 'Arif H.', entity: 'PL-SBY', ev: 'MISSING_ASSET_ESCALATED', obj: 'AST-3310', hash: '1f994a27...77b3', prev: '8e031d64...45a0', status: 'Alert' },
    { ts: '18 Nov 09:48:11', seq: '#89402', actor: 'SAP-BRIDGE', entity: 'KONSOLIDASI', ev: 'GL_SUBLEDGER_RECON_ZERO', obj: 'COA-1202', hash: '8e031d64...45a0', prev: '3c77a012...19e8', status: 'Terverifikasi' },
    { ts: '17 Nov 16:22:09', seq: '#89401', actor: 'Ns. Rina', entity: 'RS-BDG', ev: 'OPNAME_MEDICAL_CALIB_OK', obj: 'AST-2671', hash: '3c77a012...19e8', prev: 'd409e811...f02b', status: 'Terverifikasi' },
  ];

  const contentHtml = `
    <div style="display:grid;grid-template-columns: 1.05fr 1.15fr 1fr;gap:9px;flex: 0 0 388px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 13, '#047857')} Kesiapan Audit KAP / Regulasi Indonesia</div>
          ${badge('Skor 99,0%', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          ${complianceItems
            .map(
              (c) => `<div style="padding:6px 8px;border:1px solid #e2e8f0;border-radius:3px;background:#fafbfc;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
                  <span style="font-weight:700;font-size:10.6px;color:#111827;">${esc(c.std)}</span>
                  ${badge(c.status, c.tone)}
                </div>
                <div style="font-size:9.5px;color:#475569;margin-bottom:4px;">${esc(c.scope)}</div>
                ${renderCapacityBar(c.score, { warnAt: 101, critAt: 101 })}
              </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#374151')} Matriks RBAC &amp; Segregasi Tugas (SoD)</div>
          ${badge('0 Pelanggaran SoD', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:112px;" />
              <col style="width:74px;" />
              <col style="width:66px;" />
              <col style="width:68px;" />
              <col style="width:70px;" />
              <col style="width:68px;" />
              <col style="width:56px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Peran (Role)</th>
                <th>Register</th>
                <th>Opname</th>
                <th>BAST</th>
                <th>Penyusutan</th>
                <th>Disposal</th>
                <th>SoD</th>
              </tr>
            </thead>
            <tbody>
              ${rbacRows
                .map(
                  (r) => `<tr>
                    <td style="font-weight:700;">${esc(r.role)}</td>
                    <td style="font-size:9.6px;">${esc(r.reg)}</td>
                    <td style="font-size:9.6px;">${esc(r.opname)}</td>
                    <td style="font-size:9.6px;">${esc(r.bast)}</td>
                    <td style="font-size:9.6px;">${esc(r.depr)}</td>
                    <td style="font-size:9.6px;">${esc(r.disp)}</td>
                    <td>${badge(r.sod, r.sod === 'Isolasi' ? 'info' : 'ok')}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:8px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto;font-size:9.8px;color:#374151;line-height:1.4;">
            <strong>Aturan Anti-Fraud SoD:</strong> Pembuat usulan penghapusan aset (<em>Maker</em>) tidak dapat menyetujui Write-Off (<em>Approver</em>) maupun memposting jurnal pembalikan GL. Seluruh tanda tangan BAST diverifikasi via AD/SSO &amp; MFA.
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 13, '#0f766e')} Kesehatan Integrasi &amp; Sinkronisasi</div>
          ${badge('6 / 6 Aktif', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:166px;" />
              <col style="width:74px;" />
              <col style="width:62px;" />
              <col style="width:86px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Konektor Sistem</th>
                <th>Frekuensi</th>
                <th class="num">Latensi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${integrations
                .map(
                  (i) => `<tr>
                    <td style="font-weight:600;">${esc(i.sys)}</td>
                    <td style="font-size:9.5px;color:#475569;">${esc(i.freq)}</td>
                    <td class="num mono" style="font-size:9.5px;">${i.lat}</td>
                    <td>${badge(i.ok, i.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
          <div style="padding:8px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;margin-top:auto;display:flex;justify-content:space-between;font-size:9.8px;">
            <span>SQL Server 2022 AlwaysOn (JKT-DR)</span>
            <span class="mono" style="color:#047857;font-weight:700;">RPO 0 dtk · Sync OK</span>
          </div>
        </div>
      </section>
    </div>

    <section class="e-panel" style="flex:1;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('key', 13, '#374151')} Log Audit WORM SHA-256 Tak Terubah (Immutable Asset Lifecycle Chain)</div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Rantai Hash Utuh: 89.412 Blok', 'ok')}
          <span class="e-btn" style="height:20px;font-size:9.5px;">${ic('download', 10)} Ekspor Paket Audit KAP</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <colgroup>
            <col style="width:110px;" />
            <col style="width:64px;" />
            <col style="width:118px;" />
            <col style="width:94px;" />
            <col style="width:188px;" />
            <col style="width:96px;" />
            <col style="width:162px;" />
            <col style="width:162px;" />
            <col style="width:96px;" />
          </colgroup>
          <thead>
            <tr>
              <th>Timestamp WIB</th>
              <th>Blok</th>
              <th>Aktor / Sistem</th>
              <th>Entitas/Site</th>
              <th>Jenis Peristiwa Audit</th>
              <th>Objek ID</th>
              <th>Hash Blok (SHA-256)</th>
              <th>Hash Sebelumnya</th>
              <th>Integritas</th>
            </tr>
          </thead>
          <tbody>
            ${wormLogs
              .map(
                (w) => `<tr class="${w.status === 'Alert' ? 'is-warn' : ''}">
                  <td class="mono" style="font-size:9.6px;">${w.ts}</td>
                  <td class="mono" style="color:#64748b;">${w.seq}</td>
                  <td style="font-weight:600;">${esc(w.actor)}</td>
                  <td class="mono" style="font-size:9.6px;">${esc(w.entity)}</td>
                  <td class="mono" style="font-size:9.6px;font-weight:700;color:#111827;">${w.ev}</td>
                  <td class="mono" style="font-weight:700;">${w.obj}</td>
                  <td class="mono" style="font-size:9.4px;color:#0f766e;">sha256:${w.hash}</td>
                  <td class="mono" style="font-size:9.4px;color:#64748b;">sha256:${w.prev}</td>
                  <td>${badge(w.status, w.status === 'Alert' ? 'warn' : 'ok')}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  return renderShell({
    activeId: 'p8',
    breadcrumb: 'Kepatuhan, Keamanan & Sistem',
    pageTitle: 'Kepatuhan Audit PSAK 16, WORM SHA-256 & Integrasi',
    subRightHtml: `
      <span class="e-btn">${ic('checkCircle', 11)} Verifikasi Rantai SHA-256</span>
      <span class="e-btn e-btn-primary">${ic('download', 11, '#fff')} Unduh Berkas Audit KAP 2026</span>
    `,
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
