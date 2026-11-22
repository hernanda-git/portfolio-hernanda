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
  id: 'ID-031',
  name: 'GajiNusa HRIS',
  reference: 'Stripe Sigma + Adyen Treasury + Institutional Banking Ledger',
  persona: 'R. Hendrawan · VP Payroll & Tax Compliance · Mitra Nusantara Holding',
  pages: [
    { slug: 'p1', title: 'Kokpit Payroll Multi-PT & Likuiditas Kas' },
    { slug: 'p2', title: 'Buku Besar Gaji & Inspektor Kalkulasi Staf' },
    { slug: 'p3', title: 'Mesin PPh 21 TER & Rekonsiliasi Desember Ps. 17' },
    { slug: 'p4', title: 'Plafon BPJS, Tapera & Kepatuhan UMP/UMK 38 Provinsi' },
    { slug: 'p5', title: 'Jurnal GL ERP, Bank H2H & Payload CoreTax XML' },
    { slug: 'p6', title: 'Otorisasi CFO, DoA & Triage Selisih >5%' },
    { slug: 'p7', title: 'Kepatuhan UU PDP, Vault Enkripsi & Audit WORM' },
    { slug: 'p8', title: 'Portal ESS Mobile, Slip QuestPDF & Sinkron Biometrik' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (MATHEMATICALLY VERIFIED ACROSS P1-P8)
// ============================================================================
const ENTITIES = [
  {
    code: 'PT-01',
    name: 'PT Mitra Utama Jakarta',
    city: 'DKI Jakarta',
    umk: 5396761,
    staff: 412,
    pokokTetap: 2380000000,
    tunjInsentif: 1948000000,
    lembur: 142000000,
    grossUp: 230000000,
    bruto: 4700000000,
    pph21: 378400000,
    bpjsEmp: 89600000,
    bpjsCo: 231400000,
    bpjsKes: 109400000,
    bpjsJht: 135600000,
    bpjsJp: 63200000,
    bpjsJkkJkm: 12800000,
    taperaEmp: 34000000,
    taperaCo: 6800000,
    potLain: 18000000,
    net: 4180000000,
    prevNet: 4122300000,
    momPct: 1.4,
    bank: 'BCA KlikBISNIS',
    railCode: 'BCA-AC-2611',
    escrowIdr: 5200000000,
    jkkRate: '0,24%',
    status: 'Seimbang',
    tone: 'ok',
    meta: '0 err',
    anomalies: 0,
  },
  {
    code: 'PT-02',
    name: 'PT Mitra Logistik Surabaya',
    city: 'Surabaya, Jatim',
    umk: 4961753,
    staff: 280,
    pokokTetap: 1210000000,
    tunjInsentif: 718000000,
    lembur: 342000000,
    grossUp: 60000000,
    bruto: 2330000000,
    pph21: 148200000,
    bpjsEmp: 46200000,
    bpjsCo: 129800000,
    bpjsKes: 56800000,
    bpjsJht: 68970000,
    bpjsJp: 31430000,
    bpjsJkkJkm: 18800000,
    taperaEmp: 17000000,
    taperaCo: 3400000,
    potLain: 8600000,
    net: 2110000000,
    prevNet: 1950090000,
    momPct: 8.2,
    bank: 'Mandiri Kopra MCM',
    railCode: 'MDR-MCM-2611',
    escrowIdr: 2650000000,
    jkkRate: '0,89%',
    status: 'Tinjau 3',
    tone: 'warn',
    meta: '+8,2%',
    anomalies: 3,
  },
  {
    code: 'PT-03',
    name: 'PT Mitra Karya Nusantara',
    city: 'Bandung & Semarang',
    umk: 4482914,
    staff: 150,
    pokokTetap: 610000000,
    tunjInsentif: 534000000,
    lembur: 66000000,
    grossUp: 50000000,
    bruto: 1260000000,
    pph21: 91400000,
    bpjsEmp: 24200000,
    bpjsCo: 63000000,
    bpjsKes: 29800000,
    bpjsJht: 34830000,
    bpjsJp: 15770000,
    bpjsJkkJkm: 6800000,
    taperaEmp: 9000000,
    taperaCo: 1800000,
    potLain: 5400000,
    net: 1130000000,
    prevNet: 1114400000,
    momPct: 1.4,
    bank: 'BNI Direct H2H',
    railCode: 'BNI-DIR-2611',
    escrowIdr: 1450000000,
    jkkRate: '0,54%',
    status: 'Seimbang',
    tone: 'ok',
    meta: '0 err',
    anomalies: 0,
  },
];

const BPJS_PROGRAMS = [
  { code: 'BPJS-KES', name: 'BPJS Kesehatan (Edabu)', coRate: '4,0%', empRate: '1,0%', cap: 'Rp 12.000.000', baseIdr: 3920000000, coIdr: 156800000, empIdr: 39200000, file: 'EDABU_NOV26.csv', status: 'Siap Edabu', tone: 'ok' },
  { code: 'TK-JHT', name: 'Jaminan Hari Tua (JHT)', coRate: '3,7%', empRate: '2,0%', cap: 'Tanpa Plafon', baseIdr: 4200000000, coIdr: 155400000, empIdr: 84000000, file: 'SIPP_TK_NOV26.csv', status: 'Siap SIPP', tone: 'ok' },
  { code: 'TK-JP', name: 'Jaminan Pensiun (JP)', coRate: '2,0%', empRate: '1,0%', cap: 'Rp 10.042.300', baseIdr: 3680000000, coIdr: 73600000, empIdr: 36800000, file: 'SIPP_TK_NOV26.csv', status: 'Auto-Cap', tone: 'ok' },
  { code: 'TK-JKK', name: 'Jaminan Kecelakaan Kerja', coRate: '0,24-0,89%', empRate: '0%', cap: 'Tanpa Plafon', baseIdr: 4200000000, coIdr: 25800000, empIdr: 0, file: 'SIPP_TK_NOV26.csv', status: 'Risiko Unit', tone: 'info' },
  { code: 'TK-JKM', name: 'Jaminan Kematian (JKM)', coRate: '0,3%', empRate: '0%', cap: 'Tanpa Plafon', baseIdr: 4200000000, coIdr: 12600000, empIdr: 0, file: 'SIPP_TK_NOV26.csv', status: 'Siap SIPP', tone: 'ok' },
];

const GL_ENTRIES = [
  { side: 'D', acc: '6110-01', cc: 'ALL-HOLDING', name: 'Beban Gaji Pokok & Tunjangan Tetap', amount: 4200000000, ref: 'PR-2611-BASE' },
  { side: 'D', acc: '6110-02', cc: 'ALL-HOLDING', name: 'Beban Tunjangan Tidak Tetap & Insentif', amount: 3200000000, ref: 'PR-2611-ALW' },
  { side: 'D', acc: '6120-01', cc: 'PT02-WH-SBY', name: 'Beban Lembur Shift & Operasional', amount: 550000000, ref: 'PR-2611-OVT' },
  { side: 'D', acc: '6125-01', cc: 'EXEC-GRP', name: 'Beban Tunjangan Pajak PPh 21 (Gross-Up)', amount: 340000000, ref: 'PR-2611-GUP' },
  { side: 'D', acc: '6130-01', cc: 'ALL-HOLDING', name: 'Beban Iuran BPJS Kesehatan & TK (Entitas)', amount: 424200000, ref: 'PR-2611-BPJS' },
  { side: 'D', acc: '6130-02', cc: 'ALL-HOLDING', name: 'Beban Simpanan Tapera Entitas (0,5%)', amount: 12000000, ref: 'PR-2611-TPR' },
  { side: 'K', acc: '1110-01', cc: 'PT01-JKT', name: 'Kas/Bank Payroll BCA Auto-Credit (412 Staf)', amount: 4180000000, ref: 'BCA-AC-2611' },
  { side: 'K', acc: '1110-02', cc: 'PT02-SBY', name: 'Kas/Bank Payroll Mandiri Kopra MCM (280 Staf)', amount: 2110000000, ref: 'MDR-MCM-2611' },
  { side: 'K', acc: '1110-03', cc: 'PT03-BDG', name: 'Kas/Bank Payroll BNI Direct H2H (150 Staf)', amount: 1130000000, ref: 'BNI-DIR-2611' },
  { side: 'K', acc: '2110-01', cc: 'TAX-DJP', name: 'Utang PPh 21 TER Masa Nov 2026 (CoreTax)', amount: 618000000, ref: 'CTAX-21-2611' },
  { side: 'K', acc: '2120-01', cc: 'STAT-BPJS', name: 'Utang BPJS Kesehatan & TK (Entitas + Staf)', amount: 584200000, ref: 'SIPP-EDB-2611' },
  { side: 'K', acc: '2130-01', cc: 'STAT-TPR', name: 'Utang Simpanan Tapera (Entitas + Staf)', amount: 72000000, ref: 'TPR-2611' },
  { side: 'K', acc: '2140-01', cc: 'KOP-EMP', name: 'Utang Titipan Koperasi & Pinjaman Staf', amount: 32000000, ref: 'KOP-2611' },
];

const COST_CENTERS = [
  { code: 'CC-101', name: 'Engineering & Produk (PT-01)', staff: 198, ctc: 2498200000, pct: 28.6, erp: 'SAP-S4' },
  { code: 'CC-102', name: 'Enterprise Sales & HQ (PT-01)', staff: 214, ctc: 2440000000, pct: 28.0, erp: 'SAP-S4' },
  { code: 'CC-201', name: 'Gudang & Armada SBY (PT-02)', staff: 280, ctc: 2463200000, pct: 28.2, erp: 'SAP-S4' },
  { code: 'CC-301', name: 'Cabang Bandung & SMG (PT-03)', staff: 150, ctc: 1324800000, pct: 15.2, erp: 'Accurate' },
];

// Deterministic employee calculation helper
function makeEmpRow({ id, name, pt, unit, role, ptkp, terCat, terRate, tetap, bruto, prevBruto, potLain = 0, bank, flag = null, selected = false }) {
  const pph21 = Math.round((bruto * terRate) / 100);
  const kesEmp = Math.round(Math.min(tetap, 12000000) * 0.01);
  const jhtEmp = Math.round(tetap * 0.02);
  const jpEmp = Math.round(Math.min(tetap, 10042300) * 0.01);
  const bpjsEmp = kesEmp + jhtEmp + jpEmp;
  const taperaEmp = Math.round(tetap * 0.025);
  const net = bruto - pph21 - bpjsEmp - taperaEmp - potLain;
  const deltaPct = ((bruto - prevBruto) / prevBruto) * 100;
  return {
    id, name, pt, unit, role, ptkp, terCat, terRate, tetap, bruto, prevBruto,
    pph21, kesEmp, jhtEmp, jpEmp, bpjsEmp, taperaEmp, potLain, net, deltaPct, bank, flag, selected,
    capJpApplied: tetap > 10042300,
    capKesApplied: tetap > 12000000,
  };
}

const PAYROLL_ROWS = [
  makeEmpRow({ id: 'EMP-0412', name: 'Bagus Prakoso', pt: 'PT-01', unit: 'Engineering', role: 'Sr. Cloud Architect', ptkp: 'K/1', terCat: 'B', terRate: 7.0, tetap: 14500000, bruto: 18500000, prevBruto: 18500000, potLain: 0, bank: 'BCA', selected: true }),
  makeEmpRow({ id: 'EMP-0518', name: 'Darmawan Santoso', pt: 'PT-02', unit: 'Gudang SBY-A', role: 'Kepala Gudang Shift A', ptkp: 'K/2', terCat: 'B', terRate: 5.0, tetap: 9800000, bruto: 14950000, prevBruto: 13200000, potLain: 250000, bank: 'Mandiri', flag: 'warn' }),
  makeEmpRow({ id: 'EMP-0524', name: 'Hendra Wijaya', pt: 'PT-02', unit: 'Gudang SBY-B', role: 'Kepala Gudang Shift B', ptkp: 'K/1', terCat: 'B', terRate: 5.0, tetap: 9400000, bruto: 14150000, prevBruto: 12800000, potLain: 0, bank: 'Mandiri', flag: 'warn' }),
  makeEmpRow({ id: 'EMP-0531', name: 'Slamet Riyadi', pt: 'PT-02', unit: 'Cold-Chain SBY', role: 'Kepala Gudang Cold', ptkp: 'K/3', terCat: 'C', terRate: 4.0, tetap: 9200000, bruto: 13480000, prevBruto: 12400000, potLain: 150000, bank: 'Mandiri', flag: 'warn' }),
  makeEmpRow({ id: 'EMP-0008', name: 'Ratna Kusuma Dewi', pt: 'PT-01', unit: 'Finance & Tax', role: 'Head of Treasury', ptkp: 'K/2', terCat: 'B', terRate: 14.0, tetap: 28000000, bruto: 36400000, prevBruto: 36400000, potLain: 0, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0114', name: 'Fajar Nugroho', pt: 'PT-01', unit: 'Product Core', role: 'Lead Backend .NET', ptkp: 'TK/0', terCat: 'A', terRate: 9.0, tetap: 16200000, bruto: 21500000, prevBruto: 21200000, potLain: 350000, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0189', name: 'Nadia Kartika Sari', pt: 'PT-01', unit: 'People Ops', role: 'Payroll Specialist', ptkp: 'TK/1', terCat: 'A', terRate: 4.0, tetap: 9600000, bruto: 11800000, prevBruto: 11800000, potLain: 0, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0231', name: 'Irfan Hakim', pt: 'PT-01', unit: 'Enterprise Sales', role: 'Account Director', ptkp: 'K/3', terCat: 'C', terRate: 11.0, tetap: 21000000, bruto: 28200000, prevBruto: 27400000, potLain: 500000, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0304', name: 'Dewi Anggraini', pt: 'PT-01', unit: 'Legal & Compliance', role: 'Corporate Tax Counsel', ptkp: 'K/0', terCat: 'A', terRate: 10.0, tetap: 18400000, bruto: 24600000, prevBruto: 24600000, potLain: 0, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0465', name: 'Yusuf Ramadhan', pt: 'PT-01', unit: 'IT Security', role: 'SecOps Engineer', ptkp: 'TK/0', terCat: 'A', terRate: 7.0, tetap: 13200000, bruto: 16800000, prevBruto: 16500000, potLain: 0, bank: 'BCA' }),
  makeEmpRow({ id: 'EMP-0560', name: 'Agus Setiawan', pt: 'PT-02', unit: 'Armada Jatim', role: 'Fleet Supervisor', ptkp: 'K/1', terCat: 'B', terRate: 2.0, tetap: 7600000, bruto: 9450000, prevBruto: 9200000, potLain: 200000, bank: 'Mandiri' }),
  makeEmpRow({ id: 'EMP-0612', name: 'Siti Rahmawati', pt: 'PT-02', unit: 'Admin Logistik', role: 'Dispatch Coordinator', ptkp: 'TK/0', terCat: 'A', terRate: 1.5, tetap: 6400000, bruto: 7850000, prevBruto: 7850000, potLain: 0, bank: 'Mandiri' }),
  makeEmpRow({ id: 'EMP-0648', name: 'Bambang Triyono', pt: 'PT-02', unit: 'Gudang SBY-A', role: 'Operator Forklift Sr.', ptkp: 'K/2', terCat: 'B', terRate: 0.75, tetap: 5800000, bruto: 7250000, prevBruto: 7050000, potLain: 100000, bank: 'Mandiri' }),
  makeEmpRow({ id: 'EMP-0705', name: 'Rizky Maulana', pt: 'PT-03', unit: 'Cabang Bandung', role: 'Branch Ops Manager', ptkp: 'K/1', terCat: 'B', terRate: 8.0, tetap: 15800000, bruto: 20400000, prevBruto: 20400000, potLain: 0, bank: 'BNI' }),
  makeEmpRow({ id: 'EMP-0742', name: 'Lestari Wulandari', pt: 'PT-03', unit: 'Cabang Semarang', role: 'Sr. Accounting Lead', ptkp: 'K/0', terCat: 'A', terRate: 5.0, tetap: 10800000, bruto: 13200000, prevBruto: 13200000, potLain: 250000, bank: 'BNI' }),
  makeEmpRow({ id: 'EMP-0788', name: 'Eko Prasetyo', pt: 'PT-03', unit: 'Teknisi Lapangan', role: 'Field Service Lead', ptkp: 'K/2', terCat: 'B', terRate: 1.5, tetap: 7200000, bruto: 8900000, prevBruto: 8650000, potLain: 0, bank: 'BNI' }),
];

// 14 December Pasal 17 Reconciliation Adjustments (Exact match to spec: "14 penyesuaian")
const DEC_RECON_ROWS = [
  { id: 'EMP-0008', name: 'Ratna Kusuma Dewi', pt: 'PT-01', ptkp: 'K/2', trigger: 'Bonus Q3 + Gross-Up', ytdBruto: 478400000, ytdTer: 61820000, psl17Due: 68450000, type: 'Kurang Potong' },
  { id: 'EMP-0231', name: 'Irfan Hakim', pt: 'PT-01', ptkp: 'K/3', trigger: 'Komisi Sales Q4', ytdBruto: 368200000, ytdTer: 37910000, psl17Due: 42380000, type: 'Kurang Potong' },
  { id: 'EMP-0412', name: 'Bagus Prakoso', pt: 'PT-01', ptkp: 'K/1', trigger: 'THR 1x + Lembur Proy.', ytdBruto: 240500000, ytdTer: 16835000, psl17Due: 18940000, type: 'Kurang Potong' },
  { id: 'EMP-0114', name: 'Fajar Nugroho', pt: 'PT-01', ptkp: 'TK/0', trigger: 'THR + Kenaikan Jul', ytdBruto: 274800000, ytdTer: 23140000, psl17Due: 25620000, type: 'Kurang Potong' },
  { id: 'EMP-0518', name: 'Darmawan Santoso', pt: 'PT-02', ptkp: 'K/2', trigger: 'Lonjakan Lembur Nov', ytdBruto: 174200000, ytdTer: 7480000, psl17Due: 8610000, type: 'Kurang Potong' },
  { id: 'EMP-0524', name: 'Hendra Wijaya', pt: 'PT-02', ptkp: 'K/1', trigger: 'Lonjakan Lembur Nov', ytdBruto: 168500000, ytdTer: 7120000, psl17Due: 8040000, type: 'Kurang Potong' },
  { id: 'EMP-0304', name: 'Dewi Anggraini', pt: 'PT-01', ptkp: 'K/0', trigger: 'Mutasi PT-03 -> PT-01', ytdBruto: 312000000, ytdTer: 29450000, psl17Due: 27840000, type: 'Lebih Potong' },
  { id: 'EMP-0705', name: 'Rizky Maulana', pt: 'PT-03', ptkp: 'K/1', trigger: 'Mutasi PT-01 -> PT-03', ytdBruto: 256400000, ytdTer: 19620000, psl17Due: 18480000, type: 'Lebih Potong' },
  { id: 'EMP-0192', name: 'Dimas Arya Putra', pt: 'PT-01', ptkp: 'TK/0', trigger: 'Masuk Kerja Mei 2026', ytdBruto: 128000000, ytdTer: 7680000, psl17Due: 4920000, type: 'Lebih Potong' },
  { id: 'EMP-0589', name: 'Wahyu Hidayat', pt: 'PT-02', ptkp: 'K/2', trigger: 'Resign Efektif Des', ytdBruto: 118400000, ytdTer: 4210000, psl17Due: 2890000, type: 'Lebih Potong' },
  { id: 'EMP-0341', name: 'Siska Permata', pt: 'PT-01', ptkp: 'K/1', trigger: 'Revisi PTKP Lahir Anak', ytdBruto: 198600000, ytdTer: 12940000, psl17Due: 11860000, type: 'Lebih Potong' },
  { id: 'EMP-0742', name: 'Lestari Wulandari', pt: 'PT-03', ptkp: 'K/0', trigger: 'THR + Insentif Audit', ytdBruto: 171600000, ytdTer: 8420000, psl17Due: 9280000, type: 'Kurang Potong' },
  { id: 'EMP-0531', name: 'Slamet Riyadi', pt: 'PT-02', ptkp: 'K/3', trigger: 'Lembur Cold-Chain', ytdBruto: 162400000, ytdTer: 5890000, psl17Due: 6520000, type: 'Kurang Potong' },
  { id: 'EMP-0619', name: 'Arif Budiman', pt: 'PT-02', ptkp: 'TK/1', trigger: 'Mutasi Antar-Cabang', ytdBruto: 142800000, ytdTer: 6140000, psl17Due: 5620000, type: 'Lebih Potong' },
].map((r) => ({ ...r, diff: r.psl17Due - r.ytdTer }));

const VARIANCE_CASES = [
  {
    id: 'VAR-2611-01', empId: 'EMP-0518', name: 'Darmawan Santoso', role: 'Kepala Gudang Shift A', pt: 'PT-02',
    prevBruto: 13200000, currBruto: 14950000, diffIdr: 1750000, diffPct: 13.3, otHours: 42, prevOt: 18,
    reason: 'Peak 11.11 & bongkar 14 kontainer Perak (SPL #2611-084)', bioSync: '100% Match (FP-SBY-01)',
    status: 'Tinjau Controller', tone: 'warn',
  },
  {
    id: 'VAR-2611-02', empId: 'EMP-0524', name: 'Hendra Wijaya', role: 'Kepala Gudang Shift B', pt: 'PT-02',
    prevBruto: 12800000, currBruto: 14150000, diffIdr: 1350000, diffPct: 10.5, otHours: 36, prevOt: 16,
    reason: 'Shift malam pengiriman lintas pulau (SPL #2611-089)', bioSync: '100% Match (FP-SBY-02)',
    status: 'Tinjau Controller', tone: 'warn',
  },
  {
    id: 'VAR-2611-03', empId: 'EMP-0531', name: 'Slamet Riyadi', role: 'Kepala Gudang Cold-Chain', pt: 'PT-02',
    prevBruto: 12400000, currBruto: 13480000, diffIdr: 1080000, diffPct: 8.7, otHours: 31, prevOt: 14,
    reason: 'Stock opname cold-storage & chiller (SPL #2611-092)', bioSync: '100% Match (FP-SBY-03)',
    status: 'Tinjau Controller', tone: 'warn',
  },
  {
    id: 'VAR-2611-04', empId: 'EMP-0231', name: 'Irfan Hakim', role: 'Account Director', pt: 'PT-01',
    prevBruto: 27400000, currBruto: 28200000, diffIdr: 800000, diffPct: 2.9, otHours: 0, prevOt: 0,
    reason: 'Insentif closing kontrak enterprise Q4 (VP Sales OK)', bioSync: 'N/A (Exempt)',
    status: 'Lolos Otomatis', tone: 'ok',
  },
  {
    id: 'VAR-2611-05', empId: 'EMP-0114', name: 'Fajar Nugroho', role: 'Lead Backend .NET', pt: 'PT-01',
    prevBruto: 21200000, currBruto: 21500000, diffIdr: 300000, diffPct: 1.4, otHours: 6, prevOt: 2,
    reason: 'On-call rilis migrasi CoreTax XML v2.4', bioSync: '100% Match (JKT-HQ)',
    status: 'Lolos Otomatis', tone: 'ok',
  },
  {
    id: 'VAR-2611-06', empId: 'EMP-0788', name: 'Eko Prasetyo', role: 'Field Service Lead', pt: 'PT-03',
    prevBruto: 8650000, currBruto: 8900000, diffIdr: 250000, diffPct: 2.9, otHours: 9, prevOt: 5,
    reason: 'Tunjangan dinas luar kota Semarang-Solo', bioSync: '100% Match (GPS-ESS)',
    status: 'Lolos Otomatis', tone: 'ok',
  },
  {
    id: 'VAR-2611-07', empId: 'EMP-0560', name: 'Agus Setiawan', role: 'Fleet Supervisor', pt: 'PT-02',
    prevBruto: 9200000, currBruto: 9450000, diffIdr: 250000, diffPct: 2.7, otHours: 8, prevOt: 4,
    reason: 'Koordinasi rute tambahan Surabaya-Malang', bioSync: '100% Match (FP-SBY-01)',
    status: 'Lolos Otomatis', tone: 'ok',
  },
  {
    id: 'VAR-2611-08', empId: 'EMP-0648', name: 'Bambang Triyono', role: 'Operator Forklift Sr.', pt: 'PT-02',
    prevBruto: 7050000, currBruto: 7250000, diffIdr: 200000, diffPct: 2.8, otHours: 7, prevOt: 3,
    reason: 'Tambahan shift bongkar rak dingin Blok A', bioSync: '100% Match (FP-SBY-01)',
    status: 'Lolos Otomatis', tone: 'ok',
  },
];

// Computed verified aggregates
const TOTAL_STAFF = ENTITIES.reduce((a, e) => a + e.staff, 0);
const TOTAL_BRUTO = ENTITIES.reduce((a, e) => a + e.bruto, 0);
const TOTAL_PPH21 = ENTITIES.reduce((a, e) => a + e.pph21, 0);
const TOTAL_BPJS_EMP = ENTITIES.reduce((a, e) => a + e.bpjsEmp, 0);
const TOTAL_BPJS_CO = ENTITIES.reduce((a, e) => a + e.bpjsCo, 0);
const TOTAL_BPJS = TOTAL_BPJS_EMP + TOTAL_BPJS_CO;
const TOTAL_TAPERA_EMP = ENTITIES.reduce((a, e) => a + e.taperaEmp, 0);
const TOTAL_TAPERA_CO = ENTITIES.reduce((a, e) => a + e.taperaCo, 0);
const TOTAL_TAPERA = TOTAL_TAPERA_EMP + TOTAL_TAPERA_CO;
const TOTAL_POT_LAIN = ENTITIES.reduce((a, e) => a + e.potLain, 0);
const TOTAL_NET = ENTITIES.reduce((a, e) => a + e.net, 0);
const TOTAL_CTC = TOTAL_BRUTO + TOTAL_BPJS_CO + TOTAL_TAPERA_CO;
const TOTAL_ANOMALIES = ENTITIES.reduce((a, e) => a + e.anomalies, 0);
const SUM_DEC_KURANG = DEC_RECON_ROWS.filter((r) => r.diff > 0).reduce((a, r) => a + r.diff, 0);
const SUM_DEC_LEBIH = DEC_RECON_ROWS.filter((r) => r.diff < 0).reduce((a, r) => a + r.diff, 0);
const NET_DEC_ADJ = SUM_DEC_KURANG + SUM_DEC_LEBIH;

export function verifyMath() {
  if (TOTAL_STAFF !== 842) throw new Error(`Staff mismatch: ${TOTAL_STAFF}`);
  if (TOTAL_NET !== 7420000000) throw new Error(`Net mismatch: ${TOTAL_NET}`);
  if (TOTAL_PPH21 !== 618000000) throw new Error(`PPh21 mismatch: ${TOTAL_PPH21}`);
  if (TOTAL_BPJS !== 584200000) throw new Error(`BPJS mismatch: ${TOTAL_BPJS}`);
  if (TOTAL_ANOMALIES !== 3) throw new Error(`Anomalies mismatch: ${TOTAL_ANOMALIES}`);
  if (DEC_RECON_ROWS.length !== 14) throw new Error(`Dec recon count mismatch: ${DEC_RECON_ROWS.length}`);

  // Entity-level Bruto -> Net & BPJS sub-program sums
  for (const e of ENTITIES) {
    const sumBrutoParts = e.pokokTetap + e.tunjInsentif + e.lembur + e.grossUp;
    if (sumBrutoParts !== e.bruto) throw new Error(`${e.code} bruto parts mismatch: ${sumBrutoParts} vs ${e.bruto}`);
    const calcNet = e.bruto - e.pph21 - e.bpjsEmp - e.taperaEmp - e.potLain;
    if (calcNet !== e.net) throw new Error(`${e.code} net mismatch: ${calcNet} vs ${e.net}`);
    const sumBpjsParts = e.bpjsKes + e.bpjsJht + e.bpjsJp + e.bpjsJkkJkm;
    if (sumBpjsParts !== e.bpjsCo + e.bpjsEmp) throw new Error(`${e.code} bpjs subparts mismatch: ${sumBpjsParts} vs ${e.bpjsCo + e.bpjsEmp}`);
  }

  // BPJS program totals match entity totals across both axes
  const bpjsProgCo = BPJS_PROGRAMS.reduce((a, p) => a + p.coIdr, 0);
  const bpjsProgEmp = BPJS_PROGRAMS.reduce((a, p) => a + p.empIdr, 0);
  if (bpjsProgCo !== TOTAL_BPJS_CO) throw new Error(`BPJS program co mismatch: ${bpjsProgCo} vs ${TOTAL_BPJS_CO}`);
  if (bpjsProgEmp !== TOTAL_BPJS_EMP) throw new Error(`BPJS program emp mismatch: ${bpjsProgEmp} vs ${TOTAL_BPJS_EMP}`);
  if (ENTITIES.reduce((a, e) => a + e.bpjsKes, 0) !== 196000000) throw new Error('BPJS Kes cross-sum mismatch');
  if (ENTITIES.reduce((a, e) => a + e.bpjsJht, 0) !== 239400000) throw new Error('BPJS JHT cross-sum mismatch');
  if (ENTITIES.reduce((a, e) => a + e.bpjsJp, 0) !== 110400000) throw new Error('BPJS JP cross-sum mismatch');
  if (ENTITIES.reduce((a, e) => a + e.bpjsJkkJkm, 0) !== 38400000) throw new Error('BPJS JKK+JKM cross-sum mismatch');

  // Cost centers match total CTC & total staff
  const ccCtc = COST_CENTERS.reduce((a, c) => a + c.ctc, 0);
  const ccStaff = COST_CENTERS.reduce((a, c) => a + c.staff, 0);
  if (ccCtc !== TOTAL_CTC) throw new Error(`CC CTC mismatch: ${ccCtc} vs ${TOTAL_CTC}`);
  if (ccStaff !== TOTAL_STAFF) throw new Error(`CC Staff mismatch: ${ccStaff} vs ${TOTAL_STAFF}`);

  // GL double-entry Debit === Kredit === Total CTC
  const sumDebit = GL_ENTRIES.filter((g) => g.side === 'D').reduce((a, g) => a + g.amount, 0);
  const sumCredit = GL_ENTRIES.filter((g) => g.side === 'K').reduce((a, g) => a + g.amount, 0);
  if (sumDebit !== sumCredit) throw new Error(`GL imbalanced: D=${sumDebit} K=${sumCredit}`);
  if (sumDebit !== TOTAL_CTC) throw new Error(`GL vs CTC mismatch: ${sumDebit} vs ${TOTAL_CTC}`);

  // EMP-0412 exact spec snippet assertion
  const emp412 = PAYROLL_ROWS.find((r) => r.id === 'EMP-0412');
  if (!emp412 || emp412.bruto !== 18500000 || emp412.pph21 !== 1295000) {
    throw new Error(`EMP-0412 spec mismatch`);
  }

  // Every payroll row net check
  for (const r of PAYROLL_ROWS) {
    const check = r.bruto - r.pph21 - r.bpjsEmp - r.taperaEmp - r.potLain;
    if (check !== r.net) throw new Error(`Row ${r.id} net mismatch`);
  }
}

function fmtIdrShort(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2).replace('.', ',')} M`;
  if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(1).replace('.', ',')} jt`;
  return `${sign}${fmtIdr(abs)}`;
}

// ============================================================================
// DISTINCT INSTITUTIONAL TREASURY CHROME (HORIZONTAL 2-TIER SWISS LEDGER)
// ============================================================================
const NAV_TABS = [
  { id: 'p1', icon: 'activity', label: 'Kokpit Multi-PT', cnt: '3 PT' },
  { id: 'p2', icon: 'users', label: 'Buku Besar', cnt: '842' },
  { id: 'p3', icon: 'sliders', label: 'PPh 21 TER', cnt: '14 Des' },
  { id: 'p4', icon: 'globe', label: 'BPJS & UMK', cnt: '38 Prov' },
  { id: 'p5', icon: 'database', label: 'GL & Bank H2H', cnt: 'Rp 7,42M' },
  { id: 'p6', icon: 'checkCircle', label: 'Otorisasi CFO', cnt: '3 >5%', warn: true },
  { id: 'p7', icon: 'shield', label: 'Audit WORM', cnt: 'SHA-256' },
  { id: 'p8', icon: 'fileText', label: 'ESS Mobile', cnt: '842 PDF' },
];

const EXTRA_BASE_CSS = `
  .gn-top {
    height: 36px;
    background: #062c24;
    color: #f0fdf9;
    border-bottom: 1px solid #0d4a3d;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .gn-top-l, .gn-top-r { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .gn-mark {
    width: 22px; height: 22px; border-radius: 3px;
    background: #0c7c66; border: 1px solid #34d399;
    color: #ffffff; font-family: var(--e-mono); font-size: 10.5px; font-weight: 800;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .gn-title { font-weight: 700; font-size: 12.5px; letter-spacing: -0.01em; color: #ffffff; white-space: nowrap; }
  .gn-pill-env {
    background: #0b4a3c; color: #6ee7b7; border: 1px solid #10b981;
    padding: 1.5px 6px; border-radius: 3px; font-family: var(--e-mono); font-size: 9.2px; font-weight: 700; white-space: nowrap;
  }
  .gn-chip-dark {
    height: 23px; padding: 0 8px; border-radius: 3px;
    background: #0b3d32; border: 1px solid #165e4e; color: #d1fae5;
    font-size: 10.2px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
  }
  .gn-search {
    height: 23px; width: 250px; padding: 0 8px; border-radius: 3px;
    background: #04211b; border: 1px solid #165e4e; color: #99d5c5;
    font-size: 10px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
  }
  .gn-tabs {
    height: 32px;
    background: #ffffff;
    border-bottom: 1px solid #c6d5ce;
    padding: 0 12px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .gn-tab-list { display: flex; align-items: stretch; gap: 2px; min-width: 0; }
  .gn-tab {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 0 8px; font-size: 10.5px; font-weight: 600; color: #475569;
    border-bottom: 2px solid transparent; white-space: nowrap;
  }
  .gn-tab.is-active {
    color: #065243; font-weight: 700; border-bottom-color: #0c7c66; background: #effaf6;
  }
  .gn-tab-cnt {
    font-family: var(--e-mono); font-size: 8.8px; padding: 0.5px 4.5px;
    border-radius: 2px; background: #edf3f0; color: #475569; font-weight: 700;
  }
  .gn-tab.is-active .gn-tab-cnt { background: #0c7c66; color: #ffffff; }
  .gn-tab-cnt.is-warn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .gn-subbar {
    height: 34px; padding: 0 14px; background: #f8fbf9;
    border-bottom: 1px solid #cfd9d4;
    display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-shrink: 0;
  }
  .gn-main {
    flex: 1; min-height: 0; padding: 9px 12px;
    display: flex; flex-direction: column; gap: 8px; overflow: hidden;
  }
  .e-panel { border-color: #cfd9d4; }
  .e-panel-head { height: 30px; background: #f4f8f6; border-bottom-color: #cfd9d4; }
  .e-kpi { border-color: #cfd9d4; padding: 7px 10px; }
  .e-kpi-val { font-size: 16px; }
  table.e-table th { background: #edf3f0; color: #334155; border-bottom-color: #bccbc4; padding: 4.5px 6px; font-size: 9.6px; }
  table.e-table td { padding: 4px 6px; border-bottom-color: #e4ece8; font-size: 10.3px; }
  table.e-table tbody tr:nth-child(even) { background: #f9fcfa; }
  table.e-table tfoot td { background: #e8f1ed; border-top-color: #a9bfb5; padding: 5px 6px; font-size: 10.2px; }
  .gn-kv { display: flex; justify-content: space-between; align-items: center; padding: 3.5px 0; border-bottom: 1px solid #edf2ef; font-size: 10.4px; }
  .gn-kv:last-child { border-bottom: 0; }
  .gn-kv-k { color: #52645d; }
  .gn-kv-v { font-family: var(--e-mono); font-weight: 700; color: #0f172a; white-space: nowrap; }
  .gn-sec-h { font-size: 9.6px; font-weight: 700; color: #065243; letter-spacing: 0.03em; text-transform: uppercase; margin: 0 0 5px; }
  .gn-code {
    background: #0a1f1a; color: #d1fae5; border: 1px solid #164e41; border-radius: 3px;
    font-family: var(--e-mono); font-size: 9.2px; line-height: 1.4; padding: 7px 9px;
    overflow: hidden; white-space: pre;
  }
  .e-statusbar { background: #eaf0ed; border-top-color: #c2d1ca; color: #334155; }
`;

function buildPage({ activeId, title, subtitle, actionsHtml, contentHtml, extraCss = '' }) {
  const topbar = `<header class="gn-top">
    <div class="gn-top-l">
      <span class="gn-mark">GN</span>
      <span class="gn-title">GajiNusa HRIS</span>
      <span class="gn-pill-env">NOV 2026 · TER PP 58/2023</span>
      <div class="gn-chip-dark">
        ${ic('layers', 11, '#6ee7b7')}
        <span>Mitra Nusantara Holding (3 PT · 842 Staf)</span>
        ${ic('chevronDown', 10, '#6ee7b7')}
      </div>
      <div class="gn-search">
        <span class="trunc" style="display:inline-flex;align-items:center;gap:5px;">
          ${ic('search', 11, '#6ee7b7')}
          <span class="trunc">Cari EMP-ID, NIK, NPWP16, Batch Bank...</span>
        </span>
        <span class="e-kbd" style="background:#062c24;border-color:#1c6e5c;color:#a7f3d0;">Ctrl+K</span>
      </div>
    </div>
    <div class="gn-top-r">
      <div class="gn-chip-dark">
        ${ic('clock', 11, '#6ee7b7')}
        <span class="mono" style="font-size:9.8px;">Cut-off Bank: 25 Nov 15:00 WIB</span>
      </div>
      <div class="gn-chip-dark" style="background:#052e16;border-color:#15803d;color:#86efac;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">CoreTax &amp; H2H OK</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding-left:8px;border-left:1px solid #165e4e;white-space:nowrap;">
        <span style="width:21px;height:21px;border-radius:3px;background:#0c7c66;color:#fff;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">RH</span>
        <div style="line-height:1.12;">
          <div style="font-size:10.2px;font-weight:700;color:#ffffff;">R. Hendrawan</div>
          <div style="font-size:8.8px;color:#99d5c5;">VP Payroll &amp; Tax</div>
        </div>
      </div>
    </div>
  </header>`;

  const tabs = `<nav class="gn-tabs">
    <div class="gn-tab-list">
      ${NAV_TABS.map((t) => {
        const active = t.id === activeId;
        return `<div class="gn-tab ${active ? 'is-active' : ''}">
          ${ic(t.icon, 12, active ? '#0c7c66' : '#64748b')}
          <span>${esc(t.label)}</span>
          <span class="gn-tab-cnt ${t.warn && !active ? 'is-warn' : ''}">${esc(t.cnt)}</span>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
      ${badge('SQL Vault AES-256', 'ok')}
      ${badge('.NET 9', 'neutral')}
    </div>
  </nav>`;

  const subbar = `<div class="gn-subbar">
    <div class="e-crumb">
      <span style="font-weight:600;color:#0c7c66;">Payroll Periode Nov 2026</span>
      ${ic('chevronRight', 12, '#94a3b8')}
      <strong>${esc(title)}</strong>
      <span style="color:#64748b;font-size:10.5px;margin-left:4px;">— ${esc(subtitle)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
      ${actionsHtml}
    </div>
  </div>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span><strong>Deterministic Engine .NET 9</strong> (0 selisih pembulatan)`,
      `Batch: <strong class="mono">GN-202611-HLD-03</strong>`,
      `Plafon JP: <strong>Rp 10.042.300</strong> · BPJS Kes: <strong>Rp 12.000.000</strong>`,
    ],
    rightItems: [
      `WORM SHA-256: <span class="mono">8a4f..c91e</span>`,
      `Tersinkron: 22 Nov 2026 14:32 WIB`,
      `UU PDP PP 33/2026 Compliant`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `GajiNusa HRIS — ${title}`,
    accent: '#0c7c66',
    accentSoft: '#e3f5f0',
    accentInk: '#065243',
    bg: '#f2f5f3',
    surface: '#ffffff',
    surface2: '#f4f8f6',
    border: '#cfd9d4',
    borderStrong: '#b2c4bc',
    extraCss: EXTRA_BASE_CSS + extraCss,
    bodyHtml: `${topbar}${tabs}${subbar}<main class="gn-main">${contentHtml}</main>${footer}`,
  });
}

// ============================================================================
// P1: KOKPIT PAYROLL MULTI-PT & LIKUIDITAS KAS
// ============================================================================
function renderP1() {
  const kpiStrip = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Transfer Net (3 PT)</span>${badge('Siap Escrow', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#065243;">Rp 7,42 M</span>
        ${svgSparkline({ points: [6.88, 6.94, 7.02, 7.09, 7.19, 7.42], color: '#0c7c66', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span class="mono">${fmtIdr(TOTAL_NET)}</span><span style="color:#047857;font-weight:700;">+3,2% MoM</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>PPh 21 TER (Kat A/B/C)</span>${badge('CoreTax', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 618 jt</span>
        ${svgSparkline({ points: [574, 581, 588, 596, 604, 618], color: '#0369a1', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span class="mono">${fmtIdr(TOTAL_PPH21)}</span><span>Efektif 7,45% Bruto</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>BPJS Kes + TK (SIPP/Edabu)</span>${badge('Auto-Cap', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 584,2 jt</span>
        ${svgSparkline({ points: [572, 575, 578, 580, 582, 584.2], color: '#047857', width: 68, height: 20 })}
      </div>
      <div class="e-kpi-foot"><span class="mono">PT 424,2jt · Staf 160jt</span><span>Tapera 72jt</span></div>
    </div>
    <div class="e-kpi" style="border-color:#fcd34d;background:#fffdf5;">
      <div class="e-kpi-top"><span style="color:#92400e;">Tanda Selisih &gt;5% (Gate CFO)</span>${badge('Tinjau 3', 'warn')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#b45309;">3 Staf</span>
        <span class="mono" style="font-size:11px;font-weight:700;color:#b45309;">PT-02 +8,2%</span>
      </div>
      <div class="e-kpi-foot"><span>Kepala Gudang SBY (Lembur)</span><span style="color:#b45309;font-weight:700;">Blokir Rilis</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Simulasi Rekonsiliasi Des Ps. 17</span>${badge('Simulasi', 'neutral')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">14 Staf</span>
        <span class="mono" style="font-size:10.5px;font-weight:700;color:#0369a1;">8 KB · 6 LB</span>
      </div>
      <div class="e-kpi-foot"><span>Est. Kurang Potong Net</span><span class="mono" style="font-weight:700;color:#be123c;">+${fmtIdrShort(NET_DEC_ADJ)}</span></div>
    </div>
  </section>`;

  // Multi-PT Table — zero truncated Rupiah numbers!
  const ptTable = `<div class="e-panel" style="flex:0 0 auto;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('layers', 13, '#0c7c66')} Konsolidasi Payroll Multi-PT — Periode Nov 2026</div>
      <span class="e-panel-sub mono">842 Karyawan · 0 Selisih Pembulatan · Satuan Rupiah Penuh</span>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table p1-pt-table">
        <thead>
          <tr>
            <th style="width:27%;">Entitas PT &amp; Rail Bank</th>
            <th class="num" style="width:6%;">Staf</th>
            <th class="num" style="width:15%;">Bruto (Rp)</th>
            <th class="num" style="width:13%;">PPh 21 (Rp)</th>
            <th class="num" style="width:13%;">Pot. Staf* (Rp)</th>
            <th class="num" style="width:15%;">Transfer Net (Rp)</th>
            <th style="width:11%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${ENTITIES.map((e) => `<tr class="${e.tone === 'warn' ? 'is-warn' : ''}">
            <td>
              <div style="font-weight:700;color:#0f172a;">${esc(e.code)} · ${esc(e.name)}</div>
              <div style="font-size:9.1px;color:#64748b;">${esc(e.bank)} · JKK ${e.jkkRate} · MoM <span class="mono" style="color:${e.momPct > 5 ? '#b45309' : '#047857'};font-weight:700;">+${fmtPct(e.momPct)}</span></div>
            </td>
            <td class="num mono">${e.staff}</td>
            <td class="num mono">${fmtNum(e.bruto)}</td>
            <td class="num mono">${fmtNum(e.pph21)}</td>
            <td class="num mono">${fmtNum(e.bpjsEmp + e.taperaEmp + e.potLain)}</td>
            <td class="num mono" style="font-weight:700;color:#065243;">${fmtNum(e.net)}</td>
            <td>${badge(e.status, e.tone)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL KONSOLIDASI HOLDING</td>
            <td class="num mono">${TOTAL_STAFF}</td>
            <td class="num mono">${fmtNum(TOTAL_BRUTO)}</td>
            <td class="num mono">${fmtNum(TOTAL_PPH21)}</td>
            <td class="num mono">${fmtNum(TOTAL_BPJS_EMP + TOTAL_TAPERA_EMP + TOTAL_POT_LAIN)}</td>
            <td class="num mono" style="color:#065243;">${fmtNum(TOTAL_NET)}</td>
            <td>${badge('3 Tinjau', 'warn')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>`;

  // 6-Month Cashflow Chart — clean non-overlapping annotation & threshold
  const trendChart = `<div class="e-panel" style="flex:1;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('activity', 13, '#0c7c66')} Tren Arus Kas Payroll &amp; Beban Pajak (Jun–Nov 2026)</div>
      <span class="e-panel-sub">Satuan: Miliar Rupiah (Rp M) · Batas Deviasi +5%</span>
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
      ${svgMultiLineChart({
        width: 680,
        height: 215,
        xLabels: ['Jun 26', 'Jul 26', 'Ags 26', 'Sep 26', 'Okt 26', 'Nov 26'],
        yMin: 0,
        yMax: 10.2,
        yTicks: 5,
        yFormat: (v) => `Rp ${v.toFixed(1).replace('.', ',')}M`,
        threshold: { value: 9.0, label: 'Pagu Anggaran SDM Rp 9,00M', color: '#b45309' },
        series: [
          { label: 'Total Bruto', color: '#0c7c66', values: [7.68, 7.76, 7.85, 7.94, 8.04, 8.29], area: true, dots: true },
          { label: 'Transfer Net Bank', color: '#0369a1', values: [6.88, 6.94, 7.02, 7.09, 7.19, 7.42], dots: true },
          { label: 'PPh 21 TER + BPJS', color: '#b45309', values: [1.14, 1.15, 1.16, 1.17, 1.18, 1.20], dashed: true, dots: true },
        ],
        annotations: [
          { index: 5, seriesIdx: 1, label: 'PT-02 Lembur 11.11 (+Rp 159jt)', color: '#b45309', dy: 28 },
        ],
      })}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding-top:6px;border-top:1px solid #e6eee9;font-size:9.8px;color:#475569;">
        <span class="trunc">*Pot. Staf = BPJS Karyawan Rp 160jt + Tapera Rp 60jt + Koperasi Rp 32jt (Total Rp 252jt).</span>
        <span class="mono" style="font-weight:700;color:#065243;white-space:nowrap;flex-shrink:0;">CTC Nov: Rp 8,73 M</span>
      </div>
    </div>
  </div>`;

  // Center: Cost-to-Company Waterfall + 3 Flagged Anomalies
  const waterfallItems = [
    { lbl: 'Gaji Pokok & Tetap', val: 4200, color: '#0c7c66', pct: 48.1 },
    { lbl: 'Tunjangan & Insentif', val: 3200, color: '#0e9f82', pct: 36.7 },
    { lbl: 'Lembur Shift & Ops', val: 550, color: '#d97706', pct: 6.3 },
    { lbl: 'Gross-Up PPh 21', val: 340, color: '#0284c7', pct: 3.9 },
    { lbl: 'BPJS + Tapera Entitas', val: 436.2, color: '#334155', pct: 5.0 },
  ];
  const waterfallHtml = `<div class="e-panel" style="flex:0 0 auto;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('sliders', 13, '#0c7c66')} Struktur Cost-to-Company (Rp 8,73 M)</div>
      <span class="e-panel-sub mono">Bruto → Net</span>
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:5.5px;">
      ${waterfallItems.map((w) => `<div>
        <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
          <span style="font-weight:600;color:#1e293b;">${esc(w.lbl)}</span>
          <span class="mono" style="font-weight:700;color:#0f172a;">Rp ${w.val.toFixed(1).replace('.', ',')} jt <span style="color:#64748b;font-weight:500;">(${w.pct.toFixed(1).replace('.', ',')}%)</span></span>
        </div>
        <div style="height:6.5px;background:#e8f0ec;border-radius:2px;overflow:hidden;">
          <div style="width:${Math.min(100, w.pct * 1.95).toFixed(1)}%;height:100%;background:${w.color};"></div>
        </div>
      </div>`).join('')}
      <div style="margin-top:3px;padding:6px 8px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
        <div class="gn-kv"><span class="gn-kv-k">Total Cost-to-Company (Debit GL)</span><span class="gn-kv-v">${fmtIdr(TOTAL_CTC)}</span></div>
        <div class="gn-kv"><span class="gn-kv-k">(-) Iuran Entitas BPJS &amp; Tapera</span><span class="gn-kv-v" style="color:#64748b;">-${fmtIdr(TOTAL_BPJS_CO + TOTAL_TAPERA_CO)}</span></div>
        <div class="gn-kv"><span class="gn-kv-k">(-) PPh 21 TER + Potongan Staf</span><span class="gn-kv-v" style="color:#be123c;">-${fmtIdr(TOTAL_PPH21 + TOTAL_BPJS_EMP + TOTAL_TAPERA_EMP + TOTAL_POT_LAIN)}</span></div>
        <div class="gn-kv" style="padding-top:4px;"><span style="font-weight:700;color:#065243;">(=) Total Transfer Net Bank</span><span class="gn-kv-v" style="color:#065243;font-size:11.2px;">${fmtIdr(TOTAL_NET)}</span></div>
      </div>
    </div>
  </div>`;

  const anomalyBox = `<div class="e-panel" style="flex:1;">
    <div class="e-panel-head" style="background:#fffbeb;border-bottom-color:#fde68a;">
      <div class="e-panel-title" style="color:#92400e;">${ic('alert', 13, '#b45309')} Peringatan Selisih Gaji &gt;5% (Pra-CFO)</div>
      ${badge('3 Aktif', 'warn')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;justify-content:space-between;">
      ${VARIANCE_CASES.slice(0, 3).map((v) => `<div style="padding:7px 8px;border:1px solid #fde68a;background:#fffdf7;border-radius:3px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <span style="font-weight:700;color:#0f172a;font-size:10.4px;"><span class="mono" style="color:#0c7c66;">${v.empId}</span> · ${esc(v.name)}</span>
          ${badge(`+${v.diffPct.toFixed(1).replace('.', ',')}%`, 'warn')}
        </div>
        <div style="font-size:9.6px;color:#475569;margin-bottom:3px;">${esc(v.role)} · ${v.pt} · Lembur <strong class="mono">${v.otHours} jam</strong> (Okt: ${v.prevOt} jam)</div>
        <div style="display:flex;justify-content:space-between;font-size:9.5px;padding-top:3px;border-top:1px dashed #fcd34d;">
          <span class="mono" style="color:#64748b;">Okt ${fmtIdr(v.prevBruto)} → Nov <strong style="color:#92400e;">${fmtIdr(v.currBruto)}</strong></span>
          <span class="mono" style="color:#047857;font-weight:700;">Bio OK</span>
        </div>
      </div>`).join('')}
      <div style="font-size:9.5px;color:#475569;padding:5px 7px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;display:flex;justify-content:space-between;align-items:center;gap:6px;">
        <span class="trunc">Cek <span class="mono" style="font-weight:700;color:#065243;">EMP-0412</span>: Bruto 18,5jt · K/1 (7%) → PPh 1.295.000</span>
        ${badge('Cap JP', 'ok')}
      </div>
    </div>
  </div>`;

  // Right: Bank H2H Rails & Statutory Calendar
  const bankRails = `<div class="e-panel" style="flex:0 0 auto;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('server', 13, '#0c7c66')} Likuiditas Escrow &amp; Bank H2H</div>
      ${badge('3/3 Online', 'ok')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6.5px;">
      ${ENTITIES.map((e) => {
        const util = (e.net / e.escrowIdr) * 100;
        return `<div style="padding:6.5px 8px;border:1px solid #d5e0db;border-radius:3px;background:#fafdfb;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span style="font-weight:700;font-size:10.4px;color:#0f172a;">${esc(e.bank)}</span>
            <span class="mono" style="font-size:9.1px;color:#065243;font-weight:700;">${e.railCode}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#475569;margin-bottom:4px;">
            <span>${e.code} (${e.staff} rek)</span>
            <span class="mono" style="font-weight:700;color:#0f172a;">${fmtIdr(e.net)}</span>
          </div>
          ${renderCapacityBar(util, { warnAt: 85, critAt: 95 })}
          <div style="display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-top:2px;">
            <span>Escrow: <span class="mono">${fmtIdrShort(e.escrowIdr)}</span></span>
            <span style="color:#047857;font-weight:600;">Surplus ${fmtIdrShort(e.escrowIdr - e.net)}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  const statutoryCal = `<div class="e-panel" style="flex:1;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('clock', 13, '#0c7c66')} Tenggat Statutory &amp; Rilis</div>
      <span class="e-panel-sub">Nov–Des 2026</span>
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:4px;">
      ${[
        { d: '23 Nov', t: 'Tutup Triage Selisih >5% (PT-02)', s: 'Aktif', tone: 'warn' },
        { d: '24 Nov', t: 'Tanda Tangan Digital CFO (DoA)', s: 'Antre', tone: 'info' },
        { d: '25 Nov', t: 'Kunci Batch & Auto-Credit Bank', s: 'H-3', tone: 'ok' },
        { d: '10 Des', t: 'Setor BPJS (Edabu) & TK (SIPP)', s: 'Rp 584,2jt', tone: 'neutral' },
        { d: '15 Des', t: 'Setor & Lapor CoreTax PPh 21', s: 'Rp 618jt', tone: 'neutral' },
        { d: '22 Des', t: 'Finalisasi Ps. 17 & 1721-A1', s: '14 Staf', tone: 'info' },
      ].map((c) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:5px;padding:3.5px 0;border-bottom:1px solid #edf2ef;">
        <div style="display:flex;align-items:center;gap:5px;min-width:0;">
          <span class="mono" style="font-size:9.2px;font-weight:700;color:#065243;background:#e3f5f0;padding:1.5px 4.5px;border-radius:2px;flex-shrink:0;">${c.d}</span>
          <span class="trunc" style="font-size:9.8px;color:#1e293b;font-weight:500;">${esc(c.t)}</span>
        </div>
        ${badge(c.s, c.tone)}
      </div>`).join('')}
    </div>
  </div>`;

  const bodyGrid = `<section style="flex:1;min-height:0;display:grid;grid-template-columns:1.52fr 0.92fr 0.74fr;gap:9px;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">${ptTable}${trendChart}</div>
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">${waterfallHtml}${anomalyBox}</div>
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;min-width:0;">${bankRails}${statutoryCal}</div>
  </section>`;

  return buildPage({
    activeId: 'p1',
    title: 'Kokpit Payroll Multi-PT & Likuiditas Kas',
    subtitle: 'Konsolidasi 3 Entitas PT · Mesin PPh 21 TER PP 58/2023 & Plafon BPJS',
    actionsHtml: `<span class="e-btn">${ic('alert', 12, '#b45309')} Audit Selisih &gt;5% (3)</span>
      <span class="e-btn">${ic('download', 12)} Ekspor Ringkasan CFO</span>
      <span class="e-btn e-btn-primary">${ic('lock', 12, '#fff')} Kunci &amp; Buat File Bank</span>`,
    contentHtml: `${kpiStrip}${bodyGrid}`,
    extraCss: `.p1-pt-table th, .p1-pt-table td { padding: 4px 5px; font-size: 9.8px; }`,
  });
}

// ============================================================================
// P2: BUKU BESAR GAJI & INSPEKTOR KALKULASI KARYAWAN
// ============================================================================
function renderP2() {
  const emp412 = PAYROLL_ROWS[0];
  const sampleBruto = PAYROLL_ROWS.reduce((a, r) => a + r.bruto, 0);
  const samplePph = PAYROLL_ROWS.reduce((a, r) => a + r.pph21, 0);
  const sampleBpjs = PAYROLL_ROWS.reduce((a, r) => a + r.bpjsEmp + r.taperaEmp, 0);
  const sampleNet = PAYROLL_ROWS.reduce((a, r) => a + r.net, 0);

  const filterRail = `<aside class="e-panel" style="width:190px;flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('filter', 12, '#0c7c66')} Filter Buku Besar</div>
      <span class="mono" style="font-size:9.5px;color:#0c7c66;font-weight:700;">842</span>
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
      <div>
        <div class="gn-sec-h">Entitas PT</div>
        ${[
          { lbl: 'Semua Entitas', cnt: 842, active: true },
          { lbl: 'PT-01 Mitra Utama', cnt: 412 },
          { lbl: 'PT-02 Logistik SBY', cnt: 280, warn: true },
          { lbl: 'PT-03 Karya Nus.', cnt: 150 },
        ].map((f) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:3.5px 6px;border-radius:3px;margin-bottom:2px;background:${f.active ? '#e3f5f0' : 'transparent'};color:${f.active ? '#065243' : '#334155'};font-weight:${f.active ? 700 : 500};font-size:10.2px;">
          <span class="trunc">${esc(f.lbl)}</span>
          <span class="mono" style="font-size:9.5px;color:${f.warn ? '#b45309' : '#64748b'};font-weight:700;">${f.cnt}</span>
        </div>`).join('')}
      </div>
      <div style="border-top:1px solid #e4ece8;padding-top:7px;">
        <div class="gn-sec-h">Kategori PPh 21 TER</div>
        ${[
          { lbl: 'TER A (TK/0, TK/1, K/0)', cnt: 318 },
          { lbl: 'TER B (TK/2, K/1, K/2)', cnt: 412 },
          { lbl: 'TER C (K/3)', cnt: 112 },
        ].map((f) => `<div style="display:flex;justify-content:space-between;padding:2.5px 4px;font-size:9.9px;color:#334155;">
          <span>${esc(f.lbl)}</span><span class="mono" style="font-weight:700;">${f.cnt}</span>
        </div>`).join('')}
      </div>
      <div style="border-top:1px solid #e4ece8;padding-top:7px;">
        <div class="gn-sec-h">Bendera Kontrol</div>
        ${[
          { lbl: 'Selisih Gaji >5% MoM', cnt: '3', tone: 'warn' },
          { lbl: 'Plafon JP Rp 10,04jt', cnt: '312', tone: 'ok' },
          { lbl: 'Plafon BPJS Kes 12jt', cnt: '248', tone: 'ok' },
          { lbl: 'Skema Gross-Up PPh', cnt: '44', tone: 'info' },
          { lbl: 'Mutasi Antar-PT 2026', cnt: '6', tone: 'neutral' },
        ].map((f) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:2.5px 2px;font-size:9.9px;">
          <span class="trunc" style="color:#334155;">${esc(f.lbl)}</span>${badge(f.cnt, f.tone)}
        </div>`).join('')}
      </div>
      <div style="border-top:1px solid #e4ece8;padding-top:7px;">
        <div class="gn-sec-h">Distribusi Bank Payroll</div>
        ${[
          { b: 'BCA Auto-Credit', c: '412 rek', v: '56,3%' },
          { b: 'Mandiri Kopra', c: '280 rek', v: '28,4%' },
          { b: 'BNI Direct H2H', c: '150 rek', v: '15,3%' },
        ].map((x) => `<div style="display:flex;justify-content:space-between;padding:2.5px 2px;font-size:9.7px;color:#334155;">
          <span>${x.b}</span><span class="mono" style="font-weight:700;color:#065243;">${x.c}</span>
        </div>`).join('')}
      </div>
      <div style="border-top:1px solid #e4ece8;padding-top:7px;">
        <div class="gn-sec-h">Integritas Batch</div>
        <div style="padding:7px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;font-size:9.5px;line-height:1.45;color:#334155;">
          <div><strong style="color:#065243;">100% Terhitung</strong> (1,42 dtk)</div>
          <div>0 NIK/NPWP16 tak valid</div>
          <div>0 staf di bawah UMK prov.</div>
          <div class="mono" style="margin-top:4px;color:#64748b;">Rule: PP58-2023-v2.6</div>
        </div>
      </div>
    </div>
  </aside>`;

  const ledgerTable = `<div class="e-panel" style="flex:1;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('database', 13, '#0c7c66')} Buku Besar Gaji Deterministik — Sampel Aktif 16 dari 842 Karyawan</div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('EMP-0412 Terpilih', 'accent')}
        ${badge('3 Flag >5%', 'warn')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:9%;">ID Staf</th>
            <th style="width:18%;">Nama &amp; Jabatan</th>
            <th style="width:6%;">PT</th>
            <th style="width:7%;">PTKP</th>
            <th class="num" style="width:7%;">TER</th>
            <th class="num" style="width:12%;">Bruto Nov</th>
            <th class="num" style="width:11%;">PPh 21 TER</th>
            <th class="num" style="width:11%;">BPJS+Tapera</th>
            <th class="num" style="width:12%;">Transfer Net</th>
            <th class="num" style="width:7%;">MoM</th>
          </tr>
        </thead>
        <tbody>
          ${PAYROLL_ROWS.map((r) => `<tr class="${r.selected ? 'is-selected' : r.flag === 'warn' ? 'is-warn' : ''}">
            <td class="mono" style="font-weight:700;color:#065243;">${r.id}</td>
            <td>
              <div class="trunc" style="font-weight:700;color:#0f172a;">${esc(r.name)}</div>
              <div class="trunc" style="font-size:9.1px;color:#64748b;">${esc(r.role)}</div>
            </td>
            <td class="mono">${r.pt}</td>
            <td class="mono">${r.ptkp} <span style="color:#64748b;">(${r.terCat})</span></td>
            <td class="num mono" style="font-weight:600;">${r.terRate.toFixed(r.terRate % 1 === 0 ? 1 : 2).replace('.', ',')}%</td>
            <td class="num mono">${fmtIdr(r.bruto)}</td>
            <td class="num mono" style="color:#92400e;">${fmtIdr(r.pph21)}</td>
            <td class="num mono">${fmtIdr(r.bpjsEmp + r.taperaEmp)}</td>
            <td class="num mono" style="font-weight:700;color:#065243;">${fmtIdr(r.net)}</td>
            <td class="num mono" style="font-weight:700;color:${r.deltaPct > 5 ? '#b45309' : r.deltaPct > 0 ? '#047857' : '#64748b'};">${r.deltaPct > 0 ? '+' : ''}${r.deltaPct.toFixed(1).replace('.', ',')}%</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">SUBTOTAL 16 SAMPEL TERLIHAT (TOTAL 842 STAF: BRUTO Rp 8,29M · NET Rp 7,42M)</td>
            <td class="num mono">${fmtIdr(sampleBruto)}</td>
            <td class="num mono">${fmtIdr(samplePph)}</td>
            <td class="num mono">${fmtIdr(sampleBpjs)}</td>
            <td class="num mono" style="color:#065243;">${fmtIdr(sampleNet)}</td>
            <td class="num mono">+2,4%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>`;

  const inspector = `<aside class="e-panel" style="width:366px;flex-shrink:0;">
    <div class="e-panel-head" style="background:#effaf6;">
      <div class="e-panel-title" style="color:#065243;">${ic('eye', 13, '#0c7c66')} Inspektor Kalkulasi: EMP-0412</div>
      ${badge('Terverifikasi', 'ok')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
      <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;">${esc(emp412.name)}</div>
            <div style="font-size:9.8px;color:#475569;">${esc(emp412.role)} · PT-01 Mitra Utama Jakarta</div>
          </div>
          ${badge('PTKP K/1 · TER B', 'accent')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;padding-top:6px;border-top:1px solid #d5e0db;font-size:9.6px;">
          <div>NPWP16: <span class="mono" style="font-weight:700;">317408•••00412</span></div>
          <div>Rekening: <span class="mono" style="font-weight:700;">BCA ••••4821</span></div>
        </div>
      </div>

      <div>
        <div class="gn-sec-h">1. Rincian Penghasilan Bruto</div>
        <div class="gn-kv"><span class="gn-kv-k">Gaji Pokok</span><span class="gn-kv-v">Rp 12.000.000</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Tunjangan Tetap Jabatan</span><span class="gn-kv-v">Rp 2.500.000</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Tunjangan Cloud &amp; On-Call</span><span class="gn-kv-v">Rp 4.000.000</span></div>
        <div class="gn-kv" style="background:#effaf6;padding:4px 6px;border-radius:2px;"><span style="font-weight:700;color:#065243;">Total Penghasilan Bruto</span><span class="gn-kv-v" style="color:#065243;">${fmtIdr(emp412.bruto)}</span></div>
      </div>

      <div>
        <div class="gn-sec-h">2. Mesin PPh 21 TER (PP 58/2023)</div>
        <div class="gn-code">Input  : Bruto = Rp 18.500.000 | PTKP = K/1
Lookup : Tabel TER Kategori B [16,95jt..19,35jt]
Tarif  : 7,0% (efektif bulanan non-Desember)
Hitung : Rp 18.500.000 x 7,0% = Rp 1.295.000</div>
      </div>

      <div>
        <div class="gn-sec-h">3. Pemotongan BPJS &amp; Tapera (Auto-Cap)</div>
        <div class="gn-kv"><span class="gn-kv-k">BPJS Kesehatan 1% <span style="color:#0c7c66;font-weight:700;">(Cap 12 jt)</span></span><span class="gn-kv-v">${fmtIdr(emp412.kesEmp)}</span></div>
        <div class="gn-kv"><span class="gn-kv-k">BPJS TK - JHT 2% (Upah Tetap 14,5 jt)</span><span class="gn-kv-v">${fmtIdr(emp412.jhtEmp)}</span></div>
        <div class="gn-kv"><span class="gn-kv-k">BPJS TK - JP 1% <span style="color:#0c7c66;font-weight:700;">(Cap 10.042.300)</span></span><span class="gn-kv-v">${fmtIdr(emp412.jpEmp)}</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Tapera Karyawan 2,5% (Upah Tetap)</span><span class="gn-kv-v">${fmtIdr(emp412.taperaEmp)}</span></div>
      </div>

      <div style="padding:8px 10px;background:#062c24;color:#ffffff;border-radius:3px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-size:10px;color:#99d5c5;font-weight:600;">TAKE-HOME PAY (TRANSFER BCA)</span>
          <span class="mono" style="font-size:16px;font-weight:800;color:#6ee7b7;">${fmtIdr(emp412.net)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9.2px;color:#a7f3d0;margin-top:4px;padding-top:4px;border-top:1px solid #165e4e;">
          <span>Iuran Entitas: BPJS Rp 1.217.346 + Tapera Rp 72.500</span>
          <span class="mono">PDF AES-256 Siap</span>
        </div>
      </div>
    </div>
  </aside>`;

  return buildPage({
    activeId: 'p2',
    title: 'Buku Besar Gaji & Inspektor Kalkulasi Staf',
    subtitle: 'Verifikasi baris-per-baris Bruto, TER Kat A/B/C, Plafon BPJS & Net Transfer',
    actionsHtml: `<span class="e-btn">${ic('refresh', 12)} Hitung Ulang Batch</span>
      <span class="e-btn">${ic('download', 12)} Ekspor Excel EPPlus</span>
      <span class="e-btn e-btn-primary">${ic('fileText', 12, '#fff')} Pratinjau Slip QuestPDF</span>`,
    contentHtml: `<section style="flex:1;min-height:0;display:flex;gap:9px;">${filterRail}${ledgerTable}${inspector}</section>`,
  });
}

// ============================================================================
// P3: MESIN PPh 21 TER & REKONSILIASI DESEMBER PASAL 17
// ============================================================================
function renderP3() {
  const terCurvePanel = `<div class="e-panel" style="flex:1.14;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('activity', 13, '#0c7c66')} Kurva Tarif Efektif Rata-Rata (TER A/B/C · PP 58/2023)</div>
      <span class="e-panel-sub">Bruto Bulanan Rp 5 jt – Rp 80 jt · Pin: EMP-0412</span>
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
      ${svgMultiLineChart({
        width: 680,
        height: 220,
        xLabels: ['5 jt', '10 jt', '15 jt', '18,5 jt', '25 jt', '35 jt', '50 jt', '65 jt', '80 jt'],
        yMin: 0,
        yMax: 26,
        yTicks: 5,
        yFormat: (v) => `${v.toFixed(0)}%`,
        series: [
          { label: 'TER Kategori A (TK/0, K/0)', color: '#be123c', values: [0, 2.0, 6.0, 8.0, 10.0, 14.0, 18.0, 21.0, 23.0], dots: true },
          { label: 'TER Kategori B (K/1, K/2)', color: '#0c7c66', values: [0, 1.5, 5.0, 7.0, 9.0, 13.0, 17.0, 20.0, 22.0], area: true, dots: true },
          { label: 'TER Kategori C (K/3)', color: '#0369a1', values: [0, 1.0, 4.0, 6.0, 8.0, 12.0, 16.0, 19.0, 21.0], dashed: true, dots: true },
        ],
        annotations: [
          { index: 3, seriesIdx: 1, label: 'EMP-0412 · Rp 18,5jt → TER B 7,0%', color: '#0c7c66', dy: -26 },
        ],
      })}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding-top:6px;border-top:1px solid #e4ece8;">
        <div style="padding:5px 7px;background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;">
          <div style="font-size:9.3px;font-weight:700;color:#be123c;">KATEGORI A (318 STAF)</div>
          <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">Rp 198,6 jt <span style="font-size:9.3px;color:#64748b;">(32,1%)</span></div>
        </div>
        <div style="padding:5px 7px;background:#effaf6;border:1px solid #a7f3d0;border-radius:3px;">
          <div style="font-size:9.3px;font-weight:700;color:#065243;">KATEGORI B (412 STAF)</div>
          <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">Rp 324,8 jt <span style="font-size:9.3px;color:#64748b;">(52,6%)</span></div>
        </div>
        <div style="padding:5px 7px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;">
          <div style="font-size:9.3px;font-weight:700;color:#0369a1;">KATEGORI C (112 STAF)</div>
          <div class="mono" style="font-size:12px;font-weight:700;color:#0f172a;">Rp 94,6 jt <span style="font-size:9.3px;color:#64748b;">(15,3%)</span></div>
        </div>
      </div>
    </div>
  </div>`;

  const grossUpPanel = `<div class="e-panel" style="flex:0.86;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('code', 13, '#0c7c66')} Mesin Konvergensi Gross-Up &amp; Mutasi Antar-PT (1721-A1)</div>
      ${badge('Iterasi Deterministik', 'ok')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;justify-content:space-between;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
        <div style="padding:6.5px 8px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div class="gn-sec-h">Ringkasan Simulasi Des Ps. 17</div>
          <div class="gn-kv"><span class="gn-kv-k">Total Penyesuaian</span><span class="gn-kv-v">14 Staf</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Kurang Potong (8 staf)</span><span class="gn-kv-v" style="color:#be123c;">+${fmtIdr(SUM_DEC_KURANG)}</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Lebih Potong (6 staf)</span><span class="gn-kv-v" style="color:#047857;">${fmtIdr(SUM_DEC_LEBIH)}</span></div>
          <div class="gn-kv"><span style="font-weight:700;">Net Koreksi Des</span><span class="gn-kv-v" style="color:#065243;">+${fmtIdr(NET_DEC_ADJ)}</span></div>
        </div>
        <div style="padding:6.5px 8px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div class="gn-sec-h">Lapisan Tarif Progresif Ps. 17</div>
          <div class="gn-kv"><span class="gn-kv-k">0 – Rp 60 jt PKP</span><span class="gn-kv-v">5%</span></div>
          <div class="gn-kv"><span class="gn-kv-k">&gt;60 jt – Rp 250 jt</span><span class="gn-kv-v">15%</span></div>
          <div class="gn-kv"><span class="gn-kv-k">&gt;250 jt – Rp 500 jt</span><span class="gn-kv-v">25%</span></div>
          <div class="gn-kv"><span class="gn-kv-k">&gt;500 jt – Rp 5 M</span><span class="gn-kv-v">30%</span></div>
        </div>
      </div>

      <div style="padding:6px 8px;background:#effaf6;border:1px solid #a7f3d0;border-radius:3px;display:flex;justify-content:space-between;align-items:center;font-size:9.6px;">
        <div><strong style="color:#065243;">Kontinuitas Mutasi Antar-PT 2026:</strong> 6 staf pindah PT-01/02/03 — kredit pajak 1721-A1 PT asal ditautkan otomatis agar tidak dobel potong.</div>
        ${badge('6 Link 1721-A1', 'ok')}
      </div>

      <div>
        <div class="gn-sec-h">Trace Konvergensi Gross-Up Otomatis (EMP-0008 · PT-01 · TER B)</div>
        <div class="gn-code">Base Net-Target : Rp 31.304.000 | PTKP K/2 (TER B)
Iter 1 : Bruto = 31.304.000 / (1 - 0,13) = 35.981.609 → TER B 14%
Iter 2 : Bruto = 31.304.000 / (1 - 0,14) = 36.400.000 → TER B 14% (CONVERGED)
Result : Tunj. PPh = Rp 5.096.000 | PPh 21 = Rp 5.096.000 | Selisih = Rp 0
Mutasi : EMP-0304 (PT-03 → PT-01) | Bupot 1721-A1 PT-03 dikreditkan otomatis!</div>
      </div>
    </div>
  </div>`;

  const decTable = `<div class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('fileText', 13, '#0c7c66')} Pratinjau Penyesuaian Tahunan PPh 21 Desember (Pasal 17 · 14 Penyesuaian Aktif)</div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('8 Kurang Potong', 'bad')}
        ${badge('6 Lebih Potong (Restitusi Gaji)', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:8%;">ID Staf</th>
            <th style="width:15%;">Nama Karyawan</th>
            <th style="width:5%;">PT</th>
            <th style="width:6%;">PTKP</th>
            <th style="width:18%;">Pemicu Rekonsiliasi</th>
            <th class="num" style="width:13%;">Bruto YTD (Est.)</th>
            <th class="num" style="width:12%;">TER Jan–Nov</th>
            <th class="num" style="width:12%;">Terutang Ps. 17</th>
            <th class="num" style="width:11%;">Koreksi Des</th>
          </tr>
        </thead>
        <tbody>
          ${DEC_RECON_ROWS.map((r) => `<tr>
            <td class="mono" style="font-weight:700;color:#065243;">${r.id}</td>
            <td style="font-weight:600;">${esc(r.name)}</td>
            <td class="mono">${r.pt}</td>
            <td class="mono">${r.ptkp}</td>
            <td class="trunc" style="color:#475569;">${esc(r.trigger)}</td>
            <td class="num mono">${fmtIdr(r.ytdBruto)}</td>
            <td class="num mono">${fmtIdr(r.ytdTer)}</td>
            <td class="num mono" style="font-weight:700;">${fmtIdr(r.psl17Due)}</td>
            <td class="num mono" style="font-weight:700;color:${r.diff > 0 ? '#be123c' : '#047857'};">${r.diff > 0 ? '+' : ''}${fmtIdr(r.diff)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">TOTAL 14 PENYESUAIAN PASAL 17 DESEMBER (828 STAF LAINNYA: SELISIH &lt;Rp 150rb / NIHIL)</td>
            <td class="num mono">${fmtIdr(DEC_RECON_ROWS.reduce((a, r) => a + r.ytdBruto, 0))}</td>
            <td class="num mono">${fmtIdr(DEC_RECON_ROWS.reduce((a, r) => a + r.ytdTer, 0))}</td>
            <td class="num mono">${fmtIdr(DEC_RECON_ROWS.reduce((a, r) => a + r.psl17Due, 0))}</td>
            <td class="num mono" style="color:#be123c;">+${fmtIdr(NET_DEC_ADJ)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>`;

  return buildPage({
    activeId: 'p3',
    title: 'Mesin PPh 21 TER & Rekonsiliasi Desember Pasal 17',
    subtitle: 'PMK 168/2023 · Rumus Gross-Up Iteratif · Kontinuitas Bukti Potong 1721-A1 Antar-PT',
    actionsHtml: `<span class="e-btn">${ic('play', 12)} Simulasi Ulang Desember</span>
      <span class="e-btn">${ic('download', 12)} Ekspor Draf 1721-A1</span>
      <span class="e-btn e-btn-primary">${ic('check', 12, '#fff')} Kunci Tabel TER 2026</span>`,
    contentHtml: `<section style="display:flex;gap:9px;height:340px;flex-shrink:0;">${terCurvePanel}${grossUpPanel}</section>${decTable}`,
    extraCss: `table.e-table td { padding: 3.2px 6px; font-size: 10.1px; }`,
  });
}

// ============================================================================
// P4: PLAFON BPJS, TAPERA & KEPATUHAN UMP/UMK 38 PROVINSI
// ============================================================================
function renderP4() {
  const mapSvg = `<svg viewBox="0 0 740 256" width="100%" height="256" style="display:block;background:#f4f9f7;border:1px solid #d5e0db;border-radius:3px;">
    <defs>
      <pattern id="gnGrid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2ece7" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="740" height="256" fill="url(#gnGrid)" />
    <!-- Sumatra -->
    <polygon points="48,44 88,56 148,120 178,162 156,176 106,124 42,72" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.2"/>
    <!-- Jawa -->
    <polygon points="184,184 248,190 318,198 374,202 378,216 308,214 232,206 182,197" fill="#0c7c66" fill-opacity="0.22" stroke="#0c7c66" stroke-width="1.6"/>
    <!-- Bali & Nusa Tenggara -->
    <polygon points="386,206 416,208 468,214 516,216 514,224 456,223 384,216" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.1"/>
    <!-- Kalimantan -->
    <polygon points="274,62 352,52 398,84 382,146 326,156 272,132 260,92" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.2"/>
    <!-- Sulawesi -->
    <polygon points="424,76 468,72 476,92 452,114 472,140 456,172 434,164 436,124 416,102" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.2"/>
    <!-- Maluku -->
    <polygon points="512,90 544,96 552,134 524,146 506,122" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.1"/>
    <!-- Papua -->
    <polygon points="572,110 636,102 706,132 714,180 652,186 602,160 566,142" fill="#d9ebe3" stroke="#7fb39e" stroke-width="1.2"/>

    <!-- Active Hub Corridors -->
    <line x1="212" y1="192" x2="236" y2="201" stroke="#0c7c66" stroke-width="1.8" stroke-dasharray="3,2"/>
    <line x1="236" y1="201" x2="294" y2="202" stroke="#0c7c66" stroke-width="1.8" stroke-dasharray="3,2"/>
    <line x1="294" y1="202" x2="344" y2="205" stroke="#b45309" stroke-width="1.8" stroke-dasharray="3,2"/>

    <!-- Medan -->
    <circle cx="82" cy="74" r="4" fill="#64748b"/>
    <rect x="14" y="16" width="122" height="28" rx="2" fill="#ffffff" stroke="#b2c4bc"/>
    <text x="20" y="28" font-size="8.5" font-weight="700" fill="#0f172a">Sumut · UMK Medan</text>
    <text x="20" y="39" font-size="8.4" font-family="Consolas,monospace" fill="#475569">Rp 4.014.072 (Ref)</text>
    <line x1="82" y1="70" x2="72" y2="44" stroke="#94a3b8" stroke-width="1"/>

    <!-- DKI Jakarta (PT-01) — widened box so 0 Pelanggaran never clips -->
    <circle cx="212" cy="192" r="6" fill="#0c7c66" stroke="#ffffff" stroke-width="2"/>
    <rect x="34" y="212" width="182" height="34" rx="2" fill="#062c24" stroke="#0c7c66"/>
    <text x="42" y="225" font-size="8.8" font-weight="700" fill="#6ee7b7">PT-01 · DKI Jakarta (412 Staf)</text>
    <text x="42" y="238" font-size="8.5" font-family="Consolas,monospace" fill="#ffffff">UMP Rp 5.396.761 · 0 Pelanggaran</text>
    <line x1="212" y1="198" x2="188" y2="212" stroke="#0c7c66" stroke-width="1.2"/>

    <!-- Bandung / Semarang (PT-03) -->
    <circle cx="236" cy="201" r="5" fill="#0369a1" stroke="#ffffff" stroke-width="1.8"/>
    <circle cx="294" cy="202" r="5" fill="#0369a1" stroke="#ffffff" stroke-width="1.8"/>
    <rect x="184" y="120" width="166" height="34" rx="2" fill="#ffffff" stroke="#0369a1"/>
    <text x="191" y="133" font-size="8.8" font-weight="700" fill="#0369a1">PT-03 · Bandung &amp; SMG (150)</text>
    <text x="191" y="146" font-size="8.5" font-family="Consolas,monospace" fill="#0f172a">UMK BDG 4,48jt · SMG 3,45jt</text>
    <line x1="236" y1="196" x2="248" y2="154" stroke="#0369a1" stroke-width="1.1"/>
    <line x1="294" y1="197" x2="288" y2="154" stroke="#0369a1" stroke-width="1.1"/>

    <!-- Surabaya (PT-02) -->
    <circle cx="344" cy="205" r="6" fill="#b45309" stroke="#ffffff" stroke-width="2"/>
    <rect x="366" y="154" width="168" height="34" rx="2" fill="#fffbeb" stroke="#b45309"/>
    <text x="373" y="167" font-size="8.8" font-weight="700" fill="#92400e">PT-02 · Surabaya (280 Staf)</text>
    <text x="373" y="180" font-size="8.5" font-family="Consolas,monospace" fill="#0f172a">UMK Rp 4.961.753 · JKK 0,89%</text>
    <line x1="348" y1="201" x2="386" y2="188" stroke="#b45309" stroke-width="1.2"/>

    <!-- Balikpapan & Registri -->
    <circle cx="378" cy="110" r="4" fill="#64748b"/>
    <rect x="394" y="18" width="138" height="28" rx="2" fill="#ffffff" stroke="#b2c4bc"/>
    <text x="401" y="30" font-size="8.5" font-weight="700" fill="#0f172a">Kaltim · UMK Balikpapan</text>
    <text x="401" y="41" font-size="8.4" font-family="Consolas,monospace" fill="#475569">Rp 3.701.508 (Terindeks)</text>
    <line x1="378" y1="106" x2="412" y2="46" stroke="#94a3b8" stroke-width="1"/>

    <circle cx="442" cy="154" r="4" fill="#64748b"/>
    <rect x="550" y="22" width="174" height="44" rx="2" fill="#ffffff" stroke="#b2c4bc"/>
    <text x="558" y="36" font-size="9" font-weight="700" fill="#065243">Registri UMP/UMK 2026</text>
    <text x="558" y="49" font-size="8.5" font-family="Consolas,monospace" fill="#0f172a">38 Provinsi · 514 Kab/Kota</text>
    <text x="558" y="60" font-size="8.3" fill="#047857">SK Gubernur 2026 · 0 Di Bawah UMK</text>
  </svg>`;

  const topRow = `<section style="display:grid;grid-template-columns:1.25fr 0.95fr;gap:9px;height:330px;flex-shrink:0;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('globe', 13, '#0c7c66')} Peta Kepatuhan UMP/UMK 38 Provinsi &amp; Lokasi Kerja Holding</div>
        ${badge('38/38 Provinsi Aktif', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
        ${mapSvg}
        <div style="display:flex;justify-content:space-between;font-size:9.9px;color:#334155;">
          <span>Floor Gaji Pokok Terendah Holding: <strong class="mono" style="color:#065243;">Rp 5.450.000</strong> (101,0% UMP DKI · 109,8% UMK SBY)</span>
          <span class="mono" style="color:#047857;font-weight:700;">Kepatuhan Pengupahan: 100%</span>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('sliders', 13, '#0c7c66')} Matriks Plafon Upah BPJS &amp; Tapera (Otomatis)</div>
        <span class="e-panel-sub">PP 58/2023 · BPJS 2026</span>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        ${[
          { name: 'BPJS Kesehatan (4% Entitas + 1% Staf)', cap: 'Plafon Rp 12.000.000', hit: '248 dari 842 staf terkena cap (29,5%)', pct: 29.5, sum: 'Rp 196.000.000' },
          { name: 'BPJS TK · Jaminan Pensiun (2% + 1%)', cap: 'Plafon Rp 10.042.300', hit: '312 dari 842 staf terkena cap (37,1%)', pct: 37.1, sum: 'Rp 110.400.000' },
          { name: 'BPJS TK · JHT (3,7% + 2,0%)', cap: 'Tanpa Plafon Upah', hit: 'Upah Tetap 842 staf = Rp 4,20 M', pct: 100, sum: 'Rp 239.400.000' },
          { name: 'BPJS TK · JKK (0,24-0,89%) & JKM (0,30%)', cap: 'Ditanggung Entitas 100%', hit: 'PT-01 0,24% · PT-02 0,89% · PT-03 0,54%', pct: 61, sum: 'Rp 38.400.000' },
          { name: 'Simpanan Tapera (0,5% Entitas + 2,5% Staf)', cap: 'Kohort Terdaftar', hit: 'Basis iuran terdaftar Rp 2,40 M', pct: 57, sum: 'Rp 72.000.000' },
        ].map((g) => `<div style="padding:5px 8px;border:1px solid #d9e4df;border-radius:3px;background:#fafdfb;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span style="font-weight:700;font-size:10.2px;color:#0f172a;">${esc(g.name)}</span>
            <span class="mono" style="font-weight:700;color:#065243;font-size:10.4px;">${g.sum}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:9.2px;color:#64748b;margin-bottom:3px;">
            <span>${esc(g.hit)}</span>
            <span class="mono" style="color:#0c7c66;font-weight:700;">${esc(g.cap)}</span>
          </div>
          <div style="height:4.5px;background:#e4ece8;border-radius:2px;overflow:hidden;">
            <div style="width:${g.pct}%;height:100%;background:#0c7c66;"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;

  const bottomRow = `<section style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 0.62fr;gap:9px;">
    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#0c7c66')} Rekonsiliasi Iuran BPJS Kesehatan &amp; TK (Program × Entitas · Total Rp 584.200.000)</div>
        ${badge('SIPP + Edabu Sinkron', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:9%;">Kode</th>
              <th style="width:20%;">Program Statutory</th>
              <th style="width:13%;">Tarif PT / Staf</th>
              <th style="width:12%;">Plafon Upah</th>
              <th class="num" style="width:12%;">Iuran Entitas</th>
              <th class="num" style="width:12%;">Potongan Staf</th>
              <th class="num" style="width:12%;">Total Setor</th>
              <th style="width:10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${BPJS_PROGRAMS.map((p) => `<tr>
              <td class="mono" style="font-weight:700;color:#065243;">${p.code}</td>
              <td style="font-weight:600;">${esc(p.name)}</td>
              <td class="mono">${p.coRate} / ${p.empRate}</td>
              <td class="mono">${p.cap}</td>
              <td class="num mono">${fmtIdr(p.coIdr)}</td>
              <td class="num mono">${fmtIdr(p.empIdr)}</td>
              <td class="num mono" style="font-weight:700;">${fmtIdr(p.coIdr + p.empIdr)}</td>
              <td>${badge(p.status, p.tone)}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">TOTAL BPJS KESEHATAN + TK (3 PT · 842 KARYAWAN)</td>
              <td class="num mono">${fmtIdr(TOTAL_BPJS_CO)}</td>
              <td class="num mono">${fmtIdr(TOTAL_BPJS_EMP)}</td>
              <td class="num mono" style="color:#065243;">${fmtIdr(TOTAL_BPJS)}</td>
              <td>${badge('Cocok', 'ok')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top:1px solid #c2d1ca;">
          <div style="padding:5px 9px;background:#f4f8f6;border-bottom:1px solid #d5e0db;display:flex;justify-content:space-between;align-items:center;">
            <span class="gn-sec-h" style="margin:0;">Rincian Silang BPJS &amp; Tapera Per Entitas PT (Cross-Footed)</span>
            <span class="mono" style="font-size:9.3px;color:#065243;font-weight:700;">Validasi NIK Dukcapil: 842/842 Match</span>
          </div>
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:22%;">Entitas PT</th>
                <th class="num" style="width:13%;">Kesehatan</th>
                <th class="num" style="width:13%;">JHT</th>
                <th class="num" style="width:13%;">JP (Cap)</th>
                <th class="num" style="width:12%;">JKK + JKM</th>
                <th class="num" style="width:14%;">Total BPJS</th>
                <th class="num" style="width:13%;">Tapera (3%)</th>
              </tr>
            </thead>
            <tbody>
              ${ENTITIES.map((e) => `<tr>
                <td style="font-weight:700;">${e.code} · ${esc(e.city)} <span class="mono" style="color:#64748b;font-weight:500;">(${e.staff})</span></td>
                <td class="num mono">${fmtIdr(e.bpjsKes)}</td>
                <td class="num mono">${fmtIdr(e.bpjsJht)}</td>
                <td class="num mono">${fmtIdr(e.bpjsJp)}</td>
                <td class="num mono">${fmtIdr(e.bpjsJkkJkm)}</td>
                <td class="num mono" style="font-weight:700;color:#065243;">${fmtIdr(e.bpjsCo + e.bpjsEmp)}</td>
                <td class="num mono">${fmtIdr(e.taperaCo + e.taperaEmp)}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL KONSOLIDASI HOLDING</td>
                <td class="num mono">Rp 196.000.000</td>
                <td class="num mono">Rp 239.400.000</td>
                <td class="num mono">Rp 110.400.000</td>
                <td class="num mono">Rp 38.400.000</td>
                <td class="num mono" style="color:#065243;">${fmtIdr(TOTAL_BPJS)}</td>
                <td class="num mono">${fmtIdr(TOTAL_TAPERA)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('download', 13, '#0c7c66')} Paket Ekspor SIPP, Edabu &amp; Tapera</div>
        <span class="e-panel-sub mono">Checksum SHA-256</span>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
        ${[
          { f: 'SIPP_TK_HLD_202611.csv', rows: '842 baris · JHT/JP/JKK/JKM · NPP 01928471', amt: 'Rp 388.200.000', hash: 'sha256:4c91..88f2', st: 'Siap Unggah' },
          { f: 'EDABU_KES_HLD_202611.csv', rows: '842 peserta + 1.124 tanggungan · BU-011294', amt: 'Rp 196.000.000', hash: 'sha256:7d14..3a09', st: 'Siap Unggah' },
          { f: 'TAPERA_SITARA_202611.xlsx', rows: '548 peserta terdaftar (0,5% PT + 2,5% Staf)', amt: 'Rp 72.000.000', hash: 'sha256:9e02..b71c', st: 'Siap Unggah' },
        ].map((x) => `<div style="padding:8px 9px;border:1px solid #cfd9d4;border-radius:3px;background:#fafdfb;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mono" style="font-weight:700;font-size:10.1px;color:#065243;">${x.f}</span>
            ${badge(x.st, 'ok')}
          </div>
          <div style="font-size:9.5px;color:#475569;margin:3px 0;">${x.rows}</div>
          <div style="display:flex;justify-content:space-between;font-size:9.6px;padding-top:3px;border-top:1px solid #e6eee9;">
            <span class="mono" style="font-weight:700;color:#0f172a;">${x.amt}</span>
            <span class="mono" style="color:#64748b;">${x.hash}</span>
          </div>
        </div>`).join('')}
        <div class="gn-code" style="font-size:8.9px;padding:7px 9px;">VA_BPJS_TK  : 88888-01928471-001 (Rp 388.200.000)
VA_BPJS_KES : 88888-01129400-002 (Rp 196.000.000)
VA_TAPERA   : 89012-00482190-003 (Rp  72.000.000)
Validasi NIK Dukcapil: 842/842 MATCH (0% Reject)
Jatuh Tempo Setor Statutory: 10 Desember 2026</div>
      </div>
    </div>
  </section>`;

  return buildPage({
    activeId: 'p4',
    title: 'Plafon BPJS, Tapera & Kepatuhan UMP/UMK 38 Provinsi',
    subtitle: 'Penegakan Plafon JP Rp 10.042.300 & BPJS Kes Rp 12.000.000 · Siap Unggah SIPP & Edabu',
    actionsHtml: `<span class="e-btn">${ic('refresh', 12)} Sinkron Tabel UMK 2026</span>
      <span class="e-btn">${ic('download', 12)} Unduh CSV SIPP &amp; Edabu</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 12, '#fff')} Buat Kode Billing VA</span>`,
    contentHtml: `${topRow}${bottomRow}`,
  });
}

// ============================================================================
// P5: JURNAL GL ERP, BANK H2H & PAYLOAD CORETAX XML
// ============================================================================
function renderP5() {
  const sumD = GL_ENTRIES.filter((g) => g.side === 'D').reduce((a, g) => a + g.amount, 0);
  const sumK = GL_ENTRIES.filter((g) => g.side === 'K').reduce((a, g) => a + g.amount, 0);

  const bankCards = `<section style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;flex-shrink:0;">
    ${ENTITIES.map((e) => `<div class="e-panel">
      <div class="e-panel-head" style="background:${e.tone === 'warn' ? '#fffbeb' : '#f4f8f6'};">
        <div class="e-panel-title">${ic('server', 12, e.tone === 'warn' ? '#b45309' : '#0c7c66')} ${esc(e.bank)} · ${e.code}</div>
        ${badge(e.tone === 'warn' ? 'Menunggu Tinjau' : 'Siap H2H', e.tone)}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <span style="font-size:10px;color:#475569;">${esc(e.name)}</span>
          <span class="mono" style="font-size:15px;font-weight:800;color:#065243;">${fmtIdr(e.net)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#64748b;">
          <span>Jumlah Instruksi: <strong class="mono" style="color:#0f172a;">${e.staff} rekening</strong></span>
          <span>Format: <strong class="mono" style="color:#0f172a;">${e.code === 'PT-01' ? 'BCA Fixed-Width' : e.code === 'PT-02' ? 'MCM CSV v3' : 'BNI ISO20022'}</strong></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9.4px;padding-top:4px;border-top:1px solid #e6eee9;">
          <span class="mono" style="color:#64748b;">Batch: ${e.railCode}</span>
          <span style="color:#047857;font-weight:700;">BI-FAST Fallback Aktif</span>
        </div>
      </div>
    </div>`).join('')}
  </section>`;

  const glTable = `<div class="e-panel" style="flex:1.28;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('layers', 13, '#0c7c66')} Jurnal Cost-Center Multi-PT ke GL ERP (SAP S/4HANA / Accurate · PSAK 24)</div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('Debit = Kredit (Rp 0 Selisih)', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush" style="justify-content:space-between;">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:10%;">No. Akun</th>
            <th style="width:14%;">Cost Center</th>
            <th style="width:36%;">Nama Akun Buku Besar (COA)</th>
            <th style="width:12%;">Referensi</th>
            <th class="num" style="width:14%;">Debit (Rp)</th>
            <th class="num" style="width:14%;">Kredit (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${GL_ENTRIES.map((g) => `<tr>
            <td class="mono" style="font-weight:700;color:#065243;">${g.acc}</td>
            <td class="mono" style="color:#475569;">${g.cc}</td>
            <td style="font-weight:${g.side === 'D' ? 600 : 500};padding-left:${g.side === 'K' ? '16px' : '6px'};">${esc(g.name)}</td>
            <td class="mono" style="color:#64748b;">${g.ref}</td>
            <td class="num mono" style="font-weight:700;color:#0f172a;">${g.side === 'D' ? fmtIdr(g.amount) : '—'}</td>
            <td class="num mono" style="font-weight:700;color:#0369a1;">${g.side === 'K' ? fmtIdr(g.amount) : '—'}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4">TOTAL JURNAL KONSOLIDASI PERIODE NOV 2026 (SEIMBANG / BALANCED)</td>
            <td class="num mono" style="color:#065243;">${fmtIdr(sumD)}</td>
            <td class="num mono" style="color:#065243;">${fmtIdr(sumK)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="border-top:1px solid #c2d1ca;">
        <div style="padding:5px 9px;background:#f4f8f6;border-bottom:1px solid #d5e0db;display:flex;justify-content:space-between;align-items:center;">
          <span class="gn-sec-h" style="margin:0;">Alokasi Cost-Center Chargeback Multi-PT (Total Beban SDM Rp 8.726.200.000)</span>
          <span class="mono" style="font-size:9.2px;color:#065243;font-weight:700;">Idempotency: GL-2611-HLD-01</span>
        </div>
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:12%;">Kode CC</th>
              <th style="width:34%;">Unit Bisnis / Cost Center</th>
              <th class="num" style="width:10%;">Staf</th>
              <th class="num" style="width:18%;">Alokasi Beban CTC</th>
              <th style="width:14%;">Porsi Holding</th>
              <th style="width:12%;">Target ERP</th>
            </tr>
          </thead>
          <tbody>
            ${COST_CENTERS.map((c) => `<tr>
              <td class="mono" style="font-weight:700;color:#065243;">${c.code}</td>
              <td style="font-weight:600;">${esc(c.name)}</td>
              <td class="num mono">${c.staff}</td>
              <td class="num mono" style="font-weight:700;">${fmtIdr(c.ctc)}</td>
              <td>${renderCapacityBar(c.pct, { warnAt: 50, critAt: 80 })}</td>
              <td>${badge(c.erp, 'info')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;

  const payloadPanel = `<div class="e-panel" style="flex:0.82;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('code', 13, '#0c7c66')} Inspektor Payload CoreTax XML &amp; Bank H2H</div>
      ${badge('XSD v2.4 VALID', 'ok')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
      <div>
        <div class="gn-sec-h">1. CoreTax DJP — Bukti Potong Bulanan (BPA1 XML)</div>
        <div class="gn-code" style="font-size:8.9px;">&lt;Bp21Bulk xmlns="urn:djp:coretax:bp21:v2.4"&gt;
  &lt;TinPemotong&gt;0130844920910000&lt;/TinPemotong&gt;
  &lt;MasaPajak&gt;11&lt;/MasaPajak&gt;&lt;TahunPajak&gt;2026&lt;/TahunPajak&gt;
  &lt;JumlahBupot&gt;842&lt;/JumlahBupot&gt;
  &lt;TotalBruto&gt;8290000000&lt;/TotalBruto&gt;
  &lt;TotalPPh21&gt;618000000&lt;/TotalPPh21&gt;
  &lt;Item id="EMP-0412"&gt;
    &lt;Nik&gt;3174081405910002&lt;/Nik&gt;&lt;Ptkp&gt;K/1&lt;/Ptkp&gt;
    &lt;KodeObjek&gt;21-100-01&lt;/KodeObjek&gt;&lt;TarifTer&gt;7.00&lt;/TarifTer&gt;
    &lt;Bruto&gt;18500000&lt;/Bruto&gt;&lt;PPh&gt;1295000&lt;/PPh&gt;
  &lt;/Item&gt;
&lt;/Bp21Bulk&gt;</div>
      </div>
      <div>
        <div class="gn-sec-h">2. BCA KlikBISNIS Auto-Credit Fixed-Width (PT-01 · 412 Trx)</div>
        <div class="gn-code" style="font-size:8.9px;">H|0001|PT MITRA UTAMA JKT|20261125|00412|000041800000000|IDR
D|0001|5270482190|BAGUS PRAKOSO      |000000016332077|GAJI NOV26
D|0002|5270811422|RATNA KUSUMA DEWI  |000000030188077|GAJI NOV26
T|CHK|SHA256=9f2a8c41e0b77c3d1190f42e8a1b5c0d|ERR=0</div>
      </div>
      <div>
        <div class="gn-sec-h">3. Mandiri Kopra MCM (PT-02) &amp; BNI ISO 20022 pain.001 (PT-03)</div>
        <div class="gn-code" style="font-size:8.9px;">[MCM-PT02] P,20261125,1420091847221,280,2110000000.00,IDR
           1420018842100,DARMAWAN SANTOSO,13315500,IBU,GAJI NOV26
[BNI-PT03] &lt;MsgId&gt;BNI-DIR-2611&lt;/MsgId&gt;&lt;NbOfTxs&gt;150&lt;/NbOfTxs&gt;
           &lt;CtrlSum&gt;1130000000.00&lt;/CtrlSum&gt;&lt;SvcLvl&gt;BIFAST&lt;/SvcLvl&gt;</div>
      </div>
      <div style="padding:7px 9px;background:#effaf6;border:1px solid #a7f3d0;border-radius:3px;font-size:9.6px;">
        <div style="display:flex;justify-content:space-between;font-weight:700;color:#065243;">
          <span>Validasi Integrasi ERP, Bank H2H &amp; DJP</span>
          <span class="mono">100% Lolos Skema</span>
        </div>
        <div style="color:#334155;margin-top:2px;">Seluruh 3 berkas bank dan paket BPA1 CoreTax terkunci dalam hash SHA-256; pelepasan H2H dieksekusi otomatis pasca tanda tangan FIDO2 CFO.</div>
      </div>
    </div>
  </div>`;

  return buildPage({
    activeId: 'p5',
    title: 'Jurnal GL ERP, Bank H2H & Payload CoreTax XML',
    subtitle: 'Double-Entry Cost-Center PSAK 24 · Multi-Bank Auto-Credit (BCA/Mandiri/BNI) · CoreTax BPA1',
    actionsHtml: `<span class="e-btn">${ic('code', 12)} Validasi XSD CoreTax</span>
      <span class="e-btn">${ic('download', 12)} Unduh File Bank (3 PT)</span>
      <span class="e-btn e-btn-primary">${ic('play', 12, '#fff')} Posting Jurnal GL ERP</span>`,
    contentHtml: `${bankCards}<section style="flex:1;min-height:0;display:flex;gap:9px;">${glTable}${payloadPanel}</section>`,
    extraCss: `table.e-table td { padding: 3.6px 6px; font-size: 10px; }`,
  });
}

// ============================================================================
// P6: OTORISASI CFO, DOA & TRIAGE SELISIH >5%
// ============================================================================
function renderP6() {
  const gateSteps = [
    { step: 'TAHAP 1 · MAKER', role: 'Payroll Specialist', actor: 'Nadia Kartika Sari', time: '22 Nov 09:14 WIB', status: 'Selesai', tone: 'ok', detail: '842 staf terhitung · 0 error NIK/UMK' },
    { step: 'TAHAP 2 · TAX REVIEW', role: 'Tax Compliance Lead', actor: 'Dewi Anggraini', time: '22 Nov 11:02 WIB', status: 'Disetujui', tone: 'ok', detail: 'TER A/B/C & 14 simulasi Ps. 17 valid' },
    { step: 'TAHAP 3 · CONTROLLER', role: 'Finance Controller', actor: 'R. Hendrawan', time: 'SLA: 18 jam lagi', status: 'Tinjau 3 >5%', tone: 'warn', detail: '3 kepala gudang PT-02 lembur +8,2%' },
    { step: 'TAHAP 4 · APPROVER', role: 'Chief Financial Officer', actor: 'H. Wijaya (CFO)', time: 'Menunggu Tahap 3', status: 'Terkunci', tone: 'neutral', detail: 'Tanda tangan BSSN/Passkey + Rilis Bank' },
  ];

  const pipelinePanel = `<section class="e-panel" style="flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('gitBranch', 13, '#0c7c66')} Alur Otorisasi Rilis Payroll (Maker-Checker-Controller-CFO · Segregation of Duties)</div>
      <span class="e-panel-sub mono">Total Rilis: Rp 7.420.000.000 · Kebijakan DoA Tier-3 (&gt;Rp 5 M)</span>
    </div>
    <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${gateSteps.map((s) => `<div style="padding:7.5px 10px;border:1px solid ${s.tone === 'warn' ? '#f59e0b' : s.tone === 'ok' ? '#6ee7b7' : '#cfd9d4'};background:${s.tone === 'warn' ? '#fffbeb' : s.tone === 'ok' ? '#f3fcf8' : '#f8fafc'};border-radius:3px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span class="mono" style="font-size:9.1px;font-weight:700;color:#475569;">${s.step}</span>
          ${badge(s.status, s.tone)}
        </div>
        <div style="font-weight:700;font-size:11.1px;color:#0f172a;">${esc(s.actor)}</div>
        <div style="font-size:9.5px;color:#475569;">${esc(s.role)} · <span class="mono">${s.time}</span></div>
        <div style="margin-top:5px;padding-top:4px;border-top:1px solid rgba(0,0,0,0.07);font-size:9.5px;color:#334155;">${esc(s.detail)}</div>
      </div>`).join('')}
    </div>
  </section>`;

  const varianceTable = `<div class="e-panel" style="flex:1.26;min-width:0;">
    <div class="e-panel-head" style="background:#fffbeb;">
      <div class="e-panel-title" style="color:#92400e;">${ic('alert', 13, '#b45309')} Triage Audit Selisih Gaji &gt;5% (Perbandingan Okt vs Nov 2026)</div>
      ${badge('3 Menunggu · 5 Lolos Otomatis', 'warn')}
    </div>
    <div class="e-panel-body-flush" style="justify-content:space-between;">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:11%;">Kasus / ID</th>
            <th style="width:17%;">Karyawan &amp; PT</th>
            <th class="num" style="width:12%;">Bruto Okt</th>
            <th class="num" style="width:12%;">Bruto Nov</th>
            <th class="num" style="width:8%;">Varians</th>
            <th style="width:24%;">Justifikasi &amp; Bukti Biometrik</th>
            <th style="width:16%;">Keputusan</th>
          </tr>
        </thead>
        <tbody>
          ${VARIANCE_CASES.map((v) => `<tr class="${v.tone === 'warn' ? 'is-warn' : ''}">
            <td>
              <div class="mono" style="font-weight:700;color:#065243;">${v.empId}</div>
              <div class="mono" style="font-size:8.6px;color:#64748b;">${v.id}</div>
            </td>
            <td>
              <div style="font-weight:700;">${esc(v.name)}</div>
              <div style="font-size:9px;color:#64748b;">${v.pt} · ${esc(v.role)}</div>
            </td>
            <td class="num mono">${fmtIdr(v.prevBruto)}</td>
            <td class="num mono" style="font-weight:700;">${fmtIdr(v.currBruto)}</td>
            <td class="num mono" style="font-weight:700;color:${v.diffPct > 5 ? '#b45309' : '#047857'};">+${v.diffPct.toFixed(1).replace('.', ',')}%</td>
            <td>
              <div class="trunc" style="font-size:9.6px;color:#1e293b;">${esc(v.reason)}</div>
              <div class="mono" style="font-size:8.9px;color:#047857;">${esc(v.bioSync)} · Lembur ${v.otHours}j</div>
            </td>
            <td>${badge(v.status, v.tone)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="padding:8px 10px;background:#f8fbf9;border-top:1px solid #d5e0db;display:grid;grid-template-columns:1.15fr 0.85fr;gap:10px;">
        <div>
          <div class="gn-sec-h">Verifikasi Formula Lembur Kepmenaker 102/2004</div>
          <div style="font-size:9.6px;color:#334155;line-height:1.45;">Upah sejam = 1/173 × Upah Tetap. Jam ke-1 hari kerja (1,5×), jam ke-2+ (2,0×), hari libur resmi (2×/3×/4×). Seluruh 109 jam lembur 3 kepala gudang PT-02 cocok 100% dengan log mesin sidik jari <span class="mono">FP-SBY-01..03</span> dan SPL bertanda tangan Kepala Cabang.</div>
        </div>
        <div style="padding:6px 8px;background:#ffffff;border:1px solid #cfd9d4;border-radius:3px;">
          <div class="gn-sec-h">Dampak Finansial 3 Kasus PT-02</div>
          <div class="gn-kv"><span class="gn-kv-k">Total Kenaikan Bruto (3 Staf)</span><span class="gn-kv-v" style="color:#b45309;">+Rp 4.180.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Tambahan PPh 21 TER</span><span class="gn-kv-v">+Rp 198.200</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Batas Toleransi Otomatis</span><span class="gn-kv-v">&le; 5,0% MoM</span></div>
        </div>
      </div>
    </div>
  </div>`;

  const doaPanel = `<div class="e-panel" style="flex:0.84;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('lock', 13, '#0c7c66')} Matriks Delegation of Authority (DoA) &amp; Eskalasi</div>
      ${badge('SoD Aktif', 'ok')}
    </div>
    <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:24%;">Tier Nilai Batch</th>
            <th style="width:26%;">Checker Wajib</th>
            <th style="width:27%;">Approver Final</th>
            <th style="width:23%;">Otentikasi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono" style="font-weight:700;">&le; Rp 1,0 M</td>
            <td>Payroll Manager</td>
            <td>Head of Finance</td>
            <td>${badge('MFA TOTP', 'neutral')}</td>
          </tr>
          <tr>
            <td class="mono" style="font-weight:700;">Rp 1 M – 5 M</td>
            <td>Tax Lead + Controller</td>
            <td>VP Finance / Dir. PT</td>
            <td>${badge('Passkey FIDO2', 'info')}</td>
          </tr>
          <tr class="is-selected">
            <td class="mono" style="font-weight:700;color:#065243;">&gt; Rp 5,0 M (Aktif)</td>
            <td>Tax + Controller</td>
            <td><strong>CFO + Treasury</strong></td>
            <td>${badge('FIDO2 + E-Sign', 'ok')}</td>
          </tr>
          <tr>
            <td class="mono" style="font-weight:700;">Override &gt;5%</td>
            <td>Head of Ops Cabang</td>
            <td>Finance Controller</td>
            <td>${badge('Bukti SPL+Bio', 'warn')}</td>
          </tr>
        </tbody>
      </table>

      <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
        <div class="gn-sec-h">Komposisi Bruto Per Entitas PT (Nov 2026 · Satuan Miliar Rp)</div>
        ${svgStackedBarChart({
          width: 520,
          height: 205,
          categories: ['PT-01 Jakarta (412)', 'PT-02 Surabaya (280)', 'PT-03 BDG/SMG (150)'],
          yMax: 5200,
          yFormat: (v) => `Rp ${(v / 1000).toFixed(1).replace('.', ',')}M`,
          series: [
            { label: 'Gaji & Tetap', color: '#0c7c66', values: [2380, 1210, 610] },
            { label: 'Tunjangan & Insentif', color: '#38a189', values: [1948, 718, 534] },
            { label: 'Lembur + GrossUp', color: '#d97706', values: [372, 402, 116] },
          ],
        })}
        <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;font-size:9.5px;color:#334155;">
          <strong>Kontrol Anti-Fraud (SoD):</strong> Sistem menolak tanda tangan jika <em>Maker ID === Approver ID</em> atau jika terdapat perubahan nomor rekening karyawan dalam 72 jam terakhir tanpa persetujuan HR Director (terdeteksi: <strong class="mono" style="color:#047857;">0 perubahan anomali</strong>).
        </div>
      </div>
    </div>
  </div>`;

  return buildPage({
    activeId: 'p6',
    title: 'Otorisasi CFO, DoA & Triage Selisih >5%',
    subtitle: 'Segregation of Duties · Validasi Biometrik Lembur PT-02 · Gerbang Tanda Tangan Digital CFO',
    actionsHtml: `<span class="e-btn">${ic('eye', 12)} Lihat Lampiran SPL (3)</span>
      <span class="e-btn">${ic('check', 12, '#047857')} Setujui 3 Selisih PT-02</span>
      <span class="e-btn e-btn-primary">${ic('key', 12, '#fff')} Teruskan ke CFO (FIDO2)</span>`,
    contentHtml: `${pipelinePanel}<section style="flex:1;min-height:0;display:flex;gap:9px;">${varianceTable}${doaPanel}</section>`,
    extraCss: `table.e-table td { padding: 3.8px 6px; font-size: 10px; }`,
  });
}

// ============================================================================
// P7: KEPATUHAN UU PDP, VAULT ENKRIPSI & AUDIT WORM SHA-256
// ============================================================================
function renderP7() {
  const posture = `<section class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kepatuhan UU PDP (PP 33/2026)</span>${badge('Teraudit', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#065243;">100%</span><span class="mono" style="font-size:10px;color:#047857;">842/842 Consent</span></div>
      <div class="e-kpi-foot"><span>Data Gaji, NIK, NPWP Terklasifikasi</span><span>Retensi 10 Thn UU KUP</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>SQL Server Encrypted Vault</span>${badge('HSM Active', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">AES-256-GCM</span><span class="mono" style="font-size:10px;color:#0369a1;">Always Encrypted</span></div>
      <div class="e-kpi-foot"><span>Rotasi CMK: 14 Hari Lalu</span><span>0 Akses Plaintext DBA</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Rantai Audit WORM SHA-256</span>${badge('Utuh', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">14.892 Log</span><span class="mono" style="font-size:10px;color:#047857;">0 Tamper</span></div>
      <div class="e-kpi-foot"><span class="mono">Head: 8a4f91e2..c91e</span><span>Append-Only Object Lock</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Akses Dekripsi Slip Gaji (30 Hr)</span>${badge('Diawasi', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">1.694 Kali</span><span class="mono" style="font-size:10px;color:#047857;">0 Pelanggaran</span></div>
      <div class="e-kpi-foot"><span>MFA Wajib utk Akses Bulk</span><span>SIEM Alert Aktif</span></div>
    </div>
  </section>`;

  const wormEvents = [
    { seq: '#14892', time: '14:32:08', actor: 'R. Hendrawan', action: 'REVIEW_VARIANCE_PT02', obj: 'VAR-2611-01..03', hash: '8a4f91e2..c91e', st: 'Verified' },
    { seq: '#14891', time: '14:18:44', actor: 'System.CoreTax', action: 'GENERATE_BPA1_XML', obj: 'CTAX-21-2611 (842)', hash: '3d71b04a..92f1', st: 'Verified' },
    { seq: '#14890', time: '13:55:19', actor: 'System.QuestPDF', action: 'ENCRYPT_PAYSLIP_BATCH', obj: '842 PDF AES-256', hash: '7c22e819..10ab', st: 'Verified' },
    { seq: '#14889', time: '11:02:31', actor: 'Dewi Anggraini', action: 'APPROVE_TAX_STAGE2', obj: 'GN-202611-HLD-03', hash: 'f190c44d..6e32', st: 'Verified' },
    { seq: '#14888', time: '10:41:05', actor: 'System.Engine', action: 'RUN_DEC_PSL17_SIM', obj: '14 Penyesuaian Des', hash: '2b84a10f..44cd', st: 'Verified' },
    { seq: '#14887', time: '09:38:52', actor: 'Nadia Kartika', action: 'EXPORT_SIPP_EDABU', obj: 'Rp 584.200.000', hash: '9a05d721..8b14', st: 'Verified' },
    { seq: '#14886', time: '09:14:20', actor: 'Nadia Kartika', action: 'SUBMIT_PAYROLL_STAGE1', obj: '3 PT · Rp 7,42 M', hash: '6e11f390..5a77', st: 'Verified' },
    { seq: '#14885', time: '08:50:11', actor: 'BioSync.Daemon', action: 'INGEST_BIOMETRIC_SBY', obj: 'FP-SBY-01..03 (280)', hash: '1d49c882..3f20', st: 'Verified' },
    { seq: '#14884', time: '08:12:04', actor: 'R. Hendrawan', action: 'VERIFY_UMK_TABLE_2026', obj: '38 Prov · 514 Kab', hash: '5c83b114..0e98', st: 'Verified' },
    { seq: '#14883', time: '21 Nov 17:40', actor: 'H. Wijaya (CFO)', action: 'ROTATE_FIDO2_SIGNKEY', obj: 'HSM-KEY-CFO-26Q4', hash: 'a402e763..7d11', st: 'Verified' },
    { seq: '#14882', time: '21 Nov 16:05', actor: 'Ext.Auditor.KAP', action: 'READ_MASKED_LEDGER', obj: 'Scope: Q3-2026 Only', hash: '0f91d228..c431', st: 'Verified' },
    { seq: '#14881', time: '21 Nov 14:22', actor: 'Dewi Anggraini', action: 'VALIDATE_NPWP16_BULK', obj: '842/842 Match DJP', hash: '8b34a551..2a19', st: 'Verified' },
    { seq: '#14880', time: '20 Nov 16:48', actor: 'HR.Director', action: 'APPROVE_BANK_CHANGE', obj: 'EMP-0742 (BNI Verified)', hash: '4e60c910..f812', st: 'Verified' },
    { seq: '#14879', time: '20 Nov 11:15', actor: 'System.HSM', action: 'VERIFY_CMK_ENCLAVE', obj: 'SQL Always Encrypted', hash: 'c217d304..6b5e', st: 'Verified' },
    { seq: '#14878', time: '19 Nov 09:00', actor: 'System.Cron', action: 'SYNC_BPJS_CAP_2026', obj: 'JP Rp 10.042.300', hash: '91ab7e52..11c4', st: 'Verified' },
  ];

  const wormTable = `<div class="e-panel" style="flex:1.22;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('shield', 13, '#0c7c66')} Jejak Audit Kriptografis WORM SHA-256 (15 Kejadian Terbaru · Immutable Hash-Chain)</div>
      ${badge('Chain Integrity 100%', 'ok')}
    </div>
    <div class="e-panel-body-flush" style="justify-content:space-between;">
      <table class="e-table">
        <thead>
          <tr>
            <th style="width:9%;">Seq</th>
            <th style="width:13%;">Waktu WIB</th>
            <th style="width:15%;">Aktor</th>
            <th style="width:23%;">Aksi Sistem</th>
            <th style="width:16%;">Objek / Scope</th>
            <th style="width:14%;">SHA-256 Hash</th>
            <th style="width:10%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${wormEvents.map((ev) => `<tr>
            <td class="mono" style="font-weight:700;color:#065243;">${ev.seq}</td>
            <td class="mono" style="color:#475569;">${ev.time}</td>
            <td style="font-weight:600;">${esc(ev.actor)}</td>
            <td class="mono" style="font-size:9.4px;color:#0f172a;">${ev.action}</td>
            <td class="trunc" style="color:#475569;">${esc(ev.obj)}</td>
            <td class="mono" style="font-size:9px;color:#0369a1;">${ev.hash}</td>
            <td>${badge(ev.st, 'ok')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="padding:7px 10px;background:#f4f8f6;border-top:1px solid #d5e0db;font-size:9.6px;display:flex;justify-content:space-between;align-items:center;">
        <span>Setiap modifikasi komponen gaji, tarif TER, dan file bank ditulis ke WORM Object-Lock (Compliance Mode · retensi 10 tahun).</span>
        <span class="mono" style="font-weight:700;color:#065243;">Merkle Root: 0,18 dtk</span>
      </div>
    </div>
  </div>`;

  const rbacMatrix = [
    { role: 'HR Payroll Admin', gaji: 'EDIT', exec: 'MASKED', tax: 'VIEW', bank: 'GEN', ctax: 'GEN', worm: 'READ' },
    { role: 'Tax Specialist', gaji: 'MASKED', exec: 'DENY', tax: 'EDIT', bank: 'DENY', ctax: 'SIGN', worm: 'READ' },
    { role: 'HRBP Entitas PT', gaji: 'PT-ONLY', exec: 'DENY', tax: 'VIEW', bank: 'DENY', ctax: 'DENY', worm: 'DENY' },
    { role: 'Finance Controller', gaji: 'VIEW', exec: 'MASKED', tax: 'VIEW', bank: 'CHECK', ctax: 'VIEW', worm: 'READ' },
    { role: 'Treasury Releaser', gaji: 'DENY', exec: 'DENY', tax: 'DENY', bank: 'RELEASE', ctax: 'DENY', worm: 'READ' },
    { role: 'CFO Holding', gaji: 'VIEW', exec: 'VIEW', tax: 'SIGN', bank: 'APPROVE', ctax: 'SIGN', worm: 'READ' },
    { role: 'DPO / Legal UU PDP', gaji: 'MASKED', exec: 'DENY', tax: 'VIEW', bank: 'DENY', ctax: 'VIEW', worm: 'AUDIT' },
    { role: 'Auditor Ekst. KAP', gaji: 'MASKED', exec: 'DENY', tax: 'VIEW', bank: 'DENY', ctax: 'VIEW', worm: 'VERIFY' },
  ];
  const chip = (v) => {
    const tone = v === 'DENY' ? 'bad' : v === 'MASKED' ? 'warn' : v === 'RELEASE' || v === 'APPROVE' || v === 'SIGN' || v === 'VERIFY' || v === 'AUDIT' ? 'ok' : 'neutral';
    return badge(v, tone);
  };

  const rightCol = `<div style="flex:0.88;display:flex;flex-direction:column;gap:9px;min-width:0;min-height:0;">
    <div class="e-panel" style="flex:1.18;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('key', 13, '#0c7c66')} Matriks RBAC Zero-Trust &amp; Field-Level Masking</div>
        <span class="e-panel-sub">8 Peran · Always Encrypted</span>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:24%;">Peran RBAC</th>
              <th style="width:13%;">Gaji Staf</th>
              <th style="width:12%;">Direksi</th>
              <th style="width:12%;">TER/Ps17</th>
              <th style="width:14%;">Bank H2H</th>
              <th style="width:12%;">CoreTax</th>
              <th style="width:13%;">WORM</th>
            </tr>
          </thead>
          <tbody>
            ${rbacMatrix.map((r) => `<tr>
              <td style="font-weight:700;">${esc(r.role)}</td>
              <td>${chip(r.gaji)}</td>
              <td>${chip(r.exec)}</td>
              <td>${chip(r.tax)}</td>
              <td>${chip(r.bank)}</td>
              <td>${chip(r.ctax)}</td>
              <td>${chip(r.worm)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="e-panel" style="flex:0.82;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('lock', 13, '#0c7c66')} Proteksi Data Pribadi (UU PDP) &amp; Enkripsi Kolom</div>
        ${badge('HSM FIPS 140-3', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
        <div class="gn-kv"><span class="gn-kv-k">Kolom Terenkripsi (Always Encrypted)</span><span class="gn-kv-v">NIK, NPWP16, NoRek, GajiPokok</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Kebijakan Password Slip PDF (QuestPDF)</span><span class="gn-kv-v">AES-256 (NIK6 + DDMMYYYY)</span></div>
        <div class="gn-kv"><span class="gn-kv-k">DPO (Data Protection Officer) Terdaftar</span><span class="gn-kv-v">dpo@mitranusantara.co.id</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Residency Server &amp; Backup DR</span><span class="gn-kv-v">DCI Jakarta JK5 + JKT-DC2</span></div>
        <div class="gn-kv"><span class="gn-kv-k">Notifikasi Insiden UU PDP (&le;72 Jam)</span><span class="gn-kv-v" style="color:#047857;">0 Insiden · SIEM Aktif</span></div>
        <div style="padding:6px 8px;background:#effaf6;border:1px solid #a7f3d0;border-radius:3px;font-size:9.5px;color:#065243;">
          <strong>Zero-Leakage Guarantee:</strong> DBA infrastruktur dan layanan CI/CD tidak memegang Column Master Key (CMK); seluruh dekripsi terjadi hanya di memori enclave aplikasi .NET 9 terotentikasi.
        </div>
      </div>
    </div>
  </div>`;

  return buildPage({
    activeId: 'p7',
    title: 'Kepatuhan UU PDP, Vault Enkripsi & Audit WORM',
    subtitle: 'UU PDP PP 33/2026 · SQL Server Always Encrypted · Immutable SHA-256 Hash-Chain',
    actionsHtml: `<span class="e-btn">${ic('checkCircle', 12, '#047857')} Verifikasi Rantai SHA-256</span>
      <span class="e-btn">${ic('download', 12)} Paket Bukti Audit KAP</span>
      <span class="e-btn e-btn-primary">${ic('key', 12, '#fff')} Rotasi Kunci HSM</span>`,
    contentHtml: `${posture}<section style="flex:1;min-height:0;display:flex;gap:9px;">${wormTable}${rightCol}</section>`,
    extraCss: `table.e-table td { padding: 3.6px 6px; font-size: 9.9px; }`,
  });
}

// ============================================================================
// P8: PORTAL ESS MOBILE, SLIP QUESTPDF & SINKRON BIOMETRIK
// ============================================================================
function renderP8() {
  const emp412 = PAYROLL_ROWS[0];

  const phone1 = `<div style="width:322px;flex-shrink:0;background:#0f172a;border-radius:16px;padding:10px;display:flex;flex-direction:column;border:2px solid #334155;">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 8px 8px;color:#cbd5e1;font-family:var(--e-mono);font-size:9.5px;">
      <span>14:32</span>
      <span style="width:66px;height:12px;background:#020617;border-radius:999px;display:inline-block;"></span>
      <span>5G · 94%</span>
    </div>
    <div style="flex:1;background:#f4f8f6;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;">
      <div style="background:#062c24;color:#ffffff;padding:11px 13px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-size:10px;color:#6ee7b7;font-weight:700;">GajiNusa ESS · Slip Terenkripsi</span>
          <span class="mono" style="font-size:9px;background:#0c7c66;padding:1.5px 6px;border-radius:2px;">NOV 2026</span>
        </div>
        <div style="font-size:9.8px;color:#a7f3d0;">Take-Home Pay (BCA ••••4821)</div>
        <div class="mono" style="font-size:21px;font-weight:800;letter-spacing:-0.02em;margin:2px 0;">${fmtIdr(emp412.net)}</div>
        <div style="font-size:9.4px;color:#d1fae5;">Bagus Prakoso · EMP-0412 · PT Mitra Utama JKT</div>
      </div>

      <div style="padding:9px 10px;display:flex;flex-direction:column;gap:7px;flex:1;">
        <div style="background:#ffffff;border:1px solid #cfd9d4;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Penerimaan (Bruto)</div>
          <div class="gn-kv"><span class="gn-kv-k">Gaji Pokok</span><span class="gn-kv-v">Rp 12.000.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Tunjangan Tetap</span><span class="gn-kv-v">Rp 2.500.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Tunjangan Cloud</span><span class="gn-kv-v">Rp 4.000.000</span></div>
          <div class="gn-kv"><span style="font-weight:700;">Total Bruto</span><span class="gn-kv-v" style="color:#065243;">Rp 18.500.000</span></div>
        </div>

        <div style="background:#ffffff;border:1px solid #cfd9d4;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Potongan Pajak &amp; Statutory</div>
          <div class="gn-kv"><span class="gn-kv-k">PPh 21 TER B (7,0%)</span><span class="gn-kv-v" style="color:#be123c;">-Rp 1.295.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS Kes 1% (Cap 12jt)</span><span class="gn-kv-v">-Rp 120.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS JHT 2%</span><span class="gn-kv-v">-Rp 290.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS JP 1% (Cap 10,04jt)</span><span class="gn-kv-v">-Rp 100.423</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Tapera Karyawan 2,5%</span><span class="gn-kv-v">-Rp 362.500</span></div>
        </div>

        <div style="background:#effaf6;border:1px solid #a7f3d0;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Iuran Ditanggung Perusahaan (Benefit)</div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS Kes + TK Entitas</span><span class="gn-kv-v" style="color:#047857;">+Rp 1.217.346</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Simpanan Tapera Entitas (0,5%)</span><span class="gn-kv-v" style="color:#047857;">+Rp 72.500</span></div>
          <div class="gn-kv"><span style="font-weight:700;color:#065243;">Total Paket Kompensasi</span><span class="gn-kv-v" style="color:#065243;">Rp 19.789.846</span></div>
        </div>

        <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div style="background:#0c7c66;color:#fff;text-align:center;padding:7px;border-radius:3px;font-weight:700;font-size:10px;">Unduh PDF AES-256</div>
          <div style="background:#ffffff;border:1px solid #b2c4bc;color:#065243;text-align:center;padding:7px;border-radius:3px;font-weight:700;font-size:10px;">Tanya HR Payroll</div>
        </div>
      </div>
    </div>
  </div>`;

  const phone2 = `<div style="width:322px;flex-shrink:0;background:#0f172a;border-radius:16px;padding:10px;display:flex;flex-direction:column;border:2px solid #334155;">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 8px 8px;color:#cbd5e1;font-family:var(--e-mono);font-size:9.5px;">
      <span>14:32</span>
      <span style="width:66px;height:12px;background:#020617;border-radius:999px;display:inline-block;"></span>
      <span>5G · 94%</span>
    </div>
    <div style="flex:1;background:#f4f8f6;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;">
      <div style="background:#ffffff;border-bottom:1px solid #cfd9d4;padding:10px 13px;">
        <div style="font-size:9.4px;font-weight:700;color:#0c7c66;">PAJAK &amp; KEHADIRAN BIOMETRIK</div>
        <div style="font-size:12.8px;font-weight:700;color:#0f172a;">Bukti Potong 1721-A1 &amp; YTD</div>
      </div>

      <div style="padding:9px 10px;display:flex;flex-direction:column;gap:7px;flex:1;">
        <div style="background:#effaf6;border:1px solid #a7f3d0;border-radius:4px;padding:8px 9px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-weight:700;font-size:10.3px;color:#065243;">Status PTKP: K/1 (TER B)</span>
            ${badge('CoreTax Sync', 'ok')}
          </div>
          <div class="gn-kv"><span class="gn-kv-k">Bruto YTD (Jan–Nov)</span><span class="gn-kv-v">Rp 222.000.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">PPh 21 TER Dipotong</span><span class="gn-kv-v">Rp 16.835.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Est. Koreksi Des Ps. 17</span><span class="gn-kv-v" style="color:#b45309;">+Rp 2.105.000</span></div>
        </div>

        <div style="background:#ffffff;border:1px solid #cfd9d4;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Kartu Kepesertaan Aktif</div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS Kesehatan</span><span class="gn-kv-v" style="color:#047857;">00021984••• (Aktif)</span></div>
          <div class="gn-kv"><span class="gn-kv-k">BPJS TK (JHT+JP)</span><span class="gn-kv-v" style="color:#047857;">21048829••• (Aktif)</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Saldo Est. JHT YTD</span><span class="gn-kv-v">Rp 46.820.000</span></div>
        </div>

        <div style="background:#ffffff;border:1px solid #cfd9d4;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Log Absensi Biometrik (Nov 2026)</div>
          <div class="gn-kv"><span class="gn-kv-k">Hari Kerja Hadir</span><span class="gn-kv-v">21 / 21 Hari</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Keterlambatan</span><span class="gn-kv-v" style="color:#047857;">0 Menit</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Lembur Disetujui</span><span class="gn-kv-v">0 Jam (Exempt)</span></div>
        </div>

        <div style="background:#ffffff;border:1px solid #cfd9d4;border-radius:4px;padding:7px 9px;">
          <div class="gn-sec-h">Simulasi THR 2027 &amp; Hak Cuti</div>
          <div class="gn-kv"><span class="gn-kv-k">Estimasi THR (1× Upah Tetap)</span><span class="gn-kv-v" style="color:#065243;">Rp 14.500.000</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Sisa Cuti Tahunan 2026</span><span class="gn-kv-v">7 / 12 Hari</span></div>
        </div>

        <div style="margin-top:auto;padding:8px 9px;background:#062c24;color:#d1fae5;border-radius:4px;font-size:9.2px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;color:#6ee7b7;">QR Verifikasi DJP BPA1</div>
            <div class="mono" style="font-size:8.5px;">ID: 21-2611-0412-VRF</div>
          </div>
          <div style="width:34px;height:34px;background:#ffffff;border-radius:2px;padding:3px;">
            <svg viewBox="0 0 24 24" width="28" height="28"><rect x="1" y="1" width="7" height="7" fill="#062c24"/><rect x="16" y="1" width="7" height="7" fill="#062c24"/><rect x="1" y="16" width="7" height="7" fill="#062c24"/><rect x="10" y="10" width="4" height="4" fill="#0c7c66"/><rect x="16" y="16" width="3" height="3" fill="#062c24"/><rect x="20" y="20" width="3" height="3" fill="#062c24"/><rect x="10" y="2" width="3" height="5" fill="#062c24"/><rect x="10" y="17" width="4" height="6" fill="#062c24"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  const bioDevices = [
    { id: 'FP-JKT-HQ1', loc: 'Menara Thamrin Lt. 18 (PT-01)', model: 'ZKTeco ProFace X', emp: 268, sync: '14:31 WIB', st: 'Online', tone: 'ok' },
    { id: 'FP-JKT-HQ2', loc: 'Menara Thamrin Lt. 19 (PT-01)', model: 'ZKTeco ProFace X', emp: 144, sync: '14:31 WIB', st: 'Online', tone: 'ok' },
    { id: 'FP-SBY-01', loc: 'Gudang Rungkut Blok A (PT-02)', model: 'Hikvision MinMoe', emp: 124, sync: '14:30 WIB', st: 'Online', tone: 'ok' },
    { id: 'FP-SBY-02', loc: 'Gudang Rungkut Blok B (PT-02)', model: 'Hikvision MinMoe', emp: 98, sync: '14:30 WIB', st: 'Online', tone: 'ok' },
    { id: 'FP-SBY-03', loc: 'Cold-Storage Perak (PT-02)', model: 'Hikvision MinMoe', emp: 58, sync: '14:29 WIB', st: 'Online', tone: 'ok' },
    { id: 'FP-BDG-SMG', loc: 'Cabang Bandung & SMG (PT-03)', model: 'ZKTeco + GPS ESS', emp: 150, sync: '14:31 WIB', st: 'Online', tone: 'ok' },
  ];

  const webhookLogs = [
    { t: '14:31:12', src: 'FP-SBY-01', evt: 'SPL_OVERTIME_MATCH', msg: 'EMP-0518 · 42 jam lembur terverifikasi sidik jari' },
    { t: '14:30:44', src: 'FP-SBY-02', evt: 'SPL_OVERTIME_MATCH', msg: 'EMP-0524 · 36 jam shift malam terverifikasi' },
    { t: '14:29:50', src: 'FP-SBY-03', evt: 'SPL_OVERTIME_MATCH', msg: 'EMP-0531 · 31 jam opname cold-chain terverifikasi' },
    { t: '14:28:15', src: 'QuestPDF', evt: 'PDF_BATCH_SEALED', msg: '842 slip gaji AES-256 selesai dibuat (4,8 dtk · 0 err)' },
    { t: '14:25:03', src: 'FP-BDG-SMG', evt: 'GPS_GEOFENCE_OK', msg: '150 presensi cabang Bandung & Semarang sinkron' },
  ];

  const rightTelemetry = `<div style="flex:1;display:flex;flex-direction:column;gap:9px;min-width:0;min-height:0;">
    <div class="e-panel" style="flex:0 0 auto;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#0c7c66')} Distribusi Slip Gaji Terenkripsi (QuestPDF · 842 Karyawan)</div>
        ${badge('Siap Kirim Tgl 25', 'ok')}
      </div>
      <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div style="font-size:9.5px;color:#475569;font-weight:600;">PDF Terenkripsi</div>
          <div class="mono" style="font-size:17px;font-weight:800;color:#065243;">842 / 842</div>
          <div style="font-size:9.2px;color:#047857;">Render: 4,8 detik</div>
        </div>
        <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div style="font-size:9.5px;color:#475569;font-weight:600;">Kanal ESS Mobile</div>
          <div class="mono" style="font-size:17px;font-weight:800;color:#0f172a;">794 Staf</div>
          <div style="font-size:9.2px;color:#64748b;">94,3% aktif login</div>
        </div>
        <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div style="font-size:9.5px;color:#475569;font-weight:600;">Email + WA Fallback</div>
          <div class="mono" style="font-size:17px;font-weight:800;color:#0f172a;">48 Staf</div>
          <div style="font-size:9.2px;color:#64748b;">Operator lapangan</div>
        </div>
        <div style="padding:7px 9px;background:#f4f8f6;border:1px solid #cfd9d4;border-radius:3px;">
          <div style="font-size:9.5px;color:#475569;font-weight:600;">Tingkat Baca (Okt)</div>
          <div class="mono" style="font-size:17px;font-weight:800;color:#047857;">99,4%</div>
          <div style="font-size:9.2px;color:#64748b;">0 tiket salah hitung</div>
        </div>
      </div>
    </div>

    <div class="e-panel" style="flex:1;min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('cpu', 13, '#0c7c66')} Telemetri Integrasi Mesin Absensi Biometrik (6 Lokasi · 842 Staf)</div>
        ${badge('6/6 Terminal Online', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:14%;">ID Terminal</th>
              <th style="width:31%;">Lokasi &amp; Entitas</th>
              <th style="width:20%;">Perangkat</th>
              <th class="num" style="width:9%;">Staf</th>
              <th style="width:14%;">Sinkron Terakhir</th>
              <th style="width:12%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${bioDevices.map((d) => `<tr>
              <td class="mono" style="font-weight:700;color:#065243;">${d.id}</td>
              <td style="font-weight:600;">${esc(d.loc)}</td>
              <td style="color:#475569;">${esc(d.model)}</td>
              <td class="num mono">${d.emp}</td>
              <td class="mono">${d.sync}</td>
              <td>${badge(d.st, d.tone)}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">TOTAL CAKUPAN BIOMETRIK &amp; LEMBUR OTOMATIS</td>
              <td class="num mono">842</td>
              <td colspan="2" class="mono" style="color:#047857;">0 log tertunda · Webhook Aktif</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top:1px solid #c2d1ca;">
          <div style="padding:5px 9px;background:#f4f8f6;border-bottom:1px solid #d5e0db;display:flex;justify-content:space-between;align-items:center;">
            <span class="gn-sec-h" style="margin:0;">Aliran Webhook Sinkronisasi Absensi &amp; Render QuestPDF</span>
            <span class="mono" style="font-size:9.2px;color:#047857;font-weight:700;">Latency p95: 42 ms</span>
          </div>
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:13%;">Waktu</th>
                <th style="width:15%;">Sumber</th>
                <th style="width:24%;">Tipe Event</th>
                <th style="width:48%;">Ringkasan Muatan Terverifikasi</th>
              </tr>
            </thead>
            <tbody>
              ${webhookLogs.map((w) => `<tr>
                <td class="mono" style="color:#475569;">${w.t}</td>
                <td class="mono" style="font-weight:700;color:#065243;">${w.src}</td>
                <td class="mono" style="font-size:9.3px;">${w.evt}</td>
                <td class="trunc" style="color:#334155;">${esc(w.msg)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="e-panel" style="flex:0 0 auto;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#0c7c66')} Kebijakan Keamanan Portal Karyawan &amp; Anti-Phishing</div>
        <span class="e-panel-sub">QuestPDF 2026.1 · TLS 1.3</span>
      </div>
      <div class="e-panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:9.8px;color:#334155;">
        <div>
          <div class="gn-kv"><span class="gn-kv-k">Enkripsi Dokumen PDF</span><span class="gn-kv-v">AES-256 + Watermark NIK</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Tanda Tangan Digital Slip</span><span class="gn-kv-v">X.509 Perusahaan + QR</span></div>
        </div>
        <div>
          <div class="gn-kv"><span class="gn-kv-k">Otentikasi ESS Mobile</span><span class="gn-kv-v">Biometrik FaceID / Sidik Jari</span></div>
          <div class="gn-kv"><span class="gn-kv-k">Batas Unduh Ulang Slip</span><span class="gn-kv-v">Tercatat di WORM Audit</span></div>
        </div>
      </div>
    </div>
  </div>`;

  return buildPage({
    activeId: 'p8',
    title: 'Portal ESS Mobile, Slip QuestPDF & Sinkron Biometrik',
    subtitle: 'Pengalaman Self-Service Karyawan (iOS/Android) · Distribusi Slip AES-256 · 6 Terminal Absensi',
    actionsHtml: `<span class="e-btn">${ic('refresh', 12)} Tarik Log Biometrik</span>
      <span class="e-btn">${ic('eye', 12)} Uji Kirim Slip (EMP-0412)</span>
      <span class="e-btn e-btn-primary">${ic('play', 12, '#fff')} Jadwalkan Kirim 842 Slip</span>`,
    contentHtml: `<section style="flex:1;min-height:0;display:flex;gap:12px;align-items:stretch;">${phone1}${phone2}${rightTelemetry}</section>`,
    extraCss: `table.e-table td { padding: 3.8px 6px; font-size: 9.9px; }`,
  });
}

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
