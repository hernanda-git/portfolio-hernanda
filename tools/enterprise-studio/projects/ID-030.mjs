import {
  esc,
  fmtNum,
  fmtIdr,
  ic,
  badge,
  wrapEnterpriseHtml,
} from '../chrome.mjs';
import {
  svgMultiLineChart,
  svgSparkline,
  svgStackedBarChart,
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-030',
  name: 'CoreTax Bridge',
  reference: 'RelativityOne + Thomson Reuters ONESOURCE Tax Compliance',
  persona: 'R. Hendrawan, BKP · Head of Tax Compliance · PT Nusantara Distribusi Terpadu Tbk',
  pages: [
    { slug: 'p1', title: 'Komando Kepatuhan & Posisi SPT Masa' },
    { slug: 'p2', title: 'Meja Kerja Faktur Keluaran & Inspektor NITKU' },
    { slug: 'p3', title: 'Studio Redline XML CoreTax & Validasi XSD v2.4' },
    { slug: 'p4', title: 'Kalkulator Paritas DPP Nilai Lain 11/12 & Guard Pembulatan' },
    { slug: 'p5', title: 'Rekonsiliasi SPT Masa PPN, Retur & BUP-23 Unifikasi' },
    { slug: 'p6', title: 'Otorisasi Berjenjang (Maker-Checker-Approver) & DoA' },
    { slug: 'p7', title: 'Audit Trail WORM SHA-256, Kepatuhan DJP & RBAC' },
    { slug: 'p8', title: 'Pemindai QR Faktur Masukan & Konsol Integrasi ERP' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY VERIFIED ACROSS P1-P8)
// ============================================================================
const ENTITY = {
  name: 'PT Nusantara Distribusi Terpadu Tbk',
  npwp16: '0162849102000000',
  nitkuPusat: '0162849102000000000000',
  kpp: 'KPP Wajib Pajak Besar Dua (092)',
  masaPajak: 'Nov 2026',
  xsdVersion: 'CoreTax XSD v2.4',
  batchId: 'CTB-202611-0162-OUT',
  dueDate: '31 Des 2026',
  daysLeft: 9,
};

// 6 Cabang PKP — totals reconcile to 1.248 faktur, 1.244 valid, 4 error XSD, PPN Bruto Rp 861.000.000
const BRANCHES = [
  { nitkuSuffix: '000000', name: 'Kantor Pusat Jakarta', erp: 'SAP S/4HANA', total: 428, valid: 427, errXsd: 1, ppnBruto: 302400000, status: '1 Error Pembulatan', tone: 'warn' },
  { nitkuSuffix: '000001', name: 'Cabang Surabaya (Rungkut)', erp: 'SAP S/4HANA', total: 264, valid: 263, errXsd: 1, ppnBruto: 184600000, status: '1 Error Kode HS/Barang', tone: 'warn' },
  { nitkuSuffix: '000002', name: 'Cabang Medan (KIM II)', erp: 'Accurate 5', total: 186, valid: 185, errXsd: 1, ppnBruto: 128500000, status: '1 Error NITKU 22-Digit', tone: 'bad' },
  { nitkuSuffix: '000003', name: 'Cabang Semarang (Terboyo)', erp: 'SAP S/4HANA', total: 152, valid: 152, errXsd: 0, ppnBruto: 104200000, status: '100% Lulus XSD', tone: 'ok' },
  { nitkuSuffix: '000004', name: 'Cabang Makassar (KIMA)', erp: 'SQL Server AP/AR', total: 124, valid: 123, errXsd: 1, ppnBruto: 81900000, status: '1 Error Format Tanggal', tone: 'warn' },
  { nitkuSuffix: '000005', name: 'Cabang Balikpapan (Kariangau)', erp: 'Accurate 5', total: 94, valid: 94, errXsd: 0, ppnBruto: 59400000, status: '100% Lulus XSD', tone: 'ok' },
];

// SPT Masa PPN Reconciliation (exact Rp 312.400.000 = Rp 312,4 jt)
const SPT_PPN = {
  ppnKeluaranBruto: 861000000,
  returPenjualanDocs: 6,
  returPenjualanPpn: 14200000,
  ppnKeluaranNeto: 846800000, // 861.000.000 - 14.200.000
  masukanBuckets: [
    { label: 'Faktur Masukan Masa Nov 2026', docs: 324, ppn: 412600000, status: 'Terverifikasi QR', tone: 'ok' },
    { label: 'Faktur Masukan Masa Okt 2026', docs: 82, ppn: 94200000, status: 'Dikreditkan', tone: 'ok' },
    { label: 'FM-882 · Masa Agu 2026 (Batas 3 Bln)', docs: 12, ppn: 27600000, status: 'Kreditkan Segera', tone: 'warn' },
  ],
  ppnMasukanTotal: 534400000, // 412.600.000 + 94.200.000 + 27.600.000
  ppnKurangBayar: 312400000, // 846.800.000 - 534.400.000
};

// BUP-23 Bukti Potong Unifikasi PPh 23 — exact 38 baris, Rp 41.800.000 PPh (2% dari DPP Rp 2.090.000.000)
const BUP23_GROUPS = [
  { kop: '24-104-01', nama: 'Jasa Teknik & Rekayasa Industri', baris: 9, dpp: 640000000, tarif: 2, pph: 12800000, status: 'XML Siap', tone: 'ok' },
  { kop: '24-104-02', nama: 'Jasa Manajemen & Konsultasi ERP', baris: 6, dpp: 480000000, tarif: 2, pph: 9600000, status: 'XML Siap', tone: 'ok' },
  { kop: '24-104-12', nama: 'Jasa Ekspedisi, Kargo & Logistik', baris: 12, dpp: 520000000, tarif: 2, pph: 10400000, status: 'XML Siap', tone: 'ok' },
  { kop: '24-104-37', nama: 'Jasa Perawatan Mesin & Kalibrasi', baris: 7, dpp: 290000000, tarif: 2, pph: 5800000, status: 'XML Siap', tone: 'ok' },
  { kop: '24-100-01', nama: 'Sewa Harta & Armada Forklift', baris: 4, dpp: 160000000, tarif: 2, pph: 3200000, status: 'XML Siap', tone: 'ok' },
];

// Helper for exact CoreTax PMK 131/2024 math
function calcCoreTax(hargaJual, trxCode) {
  if (trxCode === '04') {
    const dppLain = Math.round((hargaJual * 11) / 12);
    const ppn = Math.round(dppLain * 0.12);
    return { dppLain, ppn };
  }
  if (trxCode === '01') {
    return { dppLain: hargaJual, ppn: Math.round(hargaJual * 0.12) };
  }
  const dppLain = Math.round((hargaJual * 11) / 12);
  return { dppLain, ppn: 0 };
}

// 22-row Operational Faktur Keluaran Workbench (includes FP-040, FP-041 + all 4 XSD errors)
const INVOICES_RAW = [
  { code: 'FP-040', buyer: 'PT Nusantara Logistik', cabang: 'JKT · 000000', npwp16: '0184920144092000', nitku22: '0184920144092000000000', trx: '04', erp: 'SAP', hargaJual: 84200000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-041', buyer: 'CV Sumber Makmur — Cabang Medan', cabang: 'MDN · 000002', npwp16: '0941283741220000', nitku22: '0941283741220000', trx: '04', erp: 'Accurate 5', hargaJual: 19500000, status: 'Perbaiki NITKU', tone: 'bad', errCode: 'XSD-NITKU-22', selected: true },
  { code: 'FP-042', buyer: 'PT Sinergi Baja Prima Tbk', cabang: 'SBY · 000001', npwp16: '0133094821054000', nitku22: '0133094821054000000001', trx: '04', erp: 'SAP', hargaJual: 142500000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-043', buyer: 'PT Karya Pangan Sentosa', cabang: 'SMG · 000003', npwp16: '0219485732081000', nitku22: '0219485732081000000000', trx: '04', erp: 'SAP', hargaJual: 63800000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-044', buyer: 'PT Pelabuhan Samudra Timur', cabang: 'MKS · 000004', npwp16: '0150284910033000', nitku22: '0150284910033000000004', trx: '04', erp: 'SQL Server', hargaJual: 96400000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-045', buyer: 'PT Kalimas Energi Nusantara', cabang: 'BPN · 000005', npwp16: '0192837465012000', nitku22: '0192837465012000000002', trx: '04', erp: 'Accurate 5', hargaJual: 118000000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-058', buyer: 'PT Cipta Medika Farma', cabang: 'JKT · 000000', npwp16: '0167483920045000', nitku22: '0167483920045000000000', trx: '04', erp: 'SAP', hargaJual: 52600000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-063', buyer: 'PT Mitra Manufaktur Cikarang (KB)', cabang: 'JKT · 000000', npwp16: '0144920381077000', nitku22: '0144920381077000000003', trx: '07', erp: 'SAP', hargaJual: 165000000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-071', buyer: 'PT Graha Konstruksi Mandiri', cabang: 'SBY · 000001', npwp16: '0283940123062000', nitku22: '0283940123062000000000', trx: '04', erp: 'SAP', hargaJual: 74900000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-087', buyer: 'PT Dharma Teknik Elektrindo', cabang: 'SBY · 000001', npwp16: '0311294857041000', nitku22: '0311294857041000000001', trx: '04', erp: 'SAP', hargaJual: 38400000, status: 'Error Kode Brg', tone: 'bad', errCode: 'XSD-OPT-CODE' },
  { code: 'FP-094', buyer: 'PT Agro Sawit Sumatera', cabang: 'MDN · 000002', npwp16: '0177829304019000', nitku22: '0177829304019000000000', trx: '04', erp: 'Accurate 5', hargaJual: 129300000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-102', buyer: 'PT Prestise Otomotif Premium', cabang: 'JKT · 000000', npwp16: '0129384756098000', nitku22: '0129384756098000000000', trx: '01', erp: 'SAP', hargaJual: 210000000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-112', buyer: 'PT Surya Distribusi Nasional', cabang: 'JKT · 000000', npwp16: '0158392014088000', nitku22: '0158392014088000000005', trx: '04', erp: 'SAP', hargaJual: 47250000, status: 'Selisih DPP', tone: 'bad', errCode: 'XSD-ROUND-04' },
  { code: 'FP-129', buyer: 'PT Mandiri Kemasan Lestari', cabang: 'SMG · 000003', npwp16: '0244819203071000', nitku22: '0244819203071000000000', trx: '04', erp: 'SAP', hargaJual: 58700000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-146', buyer: 'PT Prima Coldchain Indonesia', cabang: 'SBY · 000001', npwp16: '0188392011055000', nitku22: '0188392011055000000002', trx: '04', erp: 'SAP', hargaJual: 91600000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-168', buyer: 'PT Borneo Tambang Sejahtera', cabang: 'BPN · 000005', npwp16: '0199482716028000', nitku22: '0199482716028000000001', trx: '04', erp: 'Accurate 5', hargaJual: 134000000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-194', buyer: 'CV Celebes Niaga Abadi', cabang: 'MKS · 000004', npwp16: '0847291038064000', nitku22: '0847291038064000000000', trx: '04', erp: 'SQL Server', hargaJual: 24800000, status: 'Format Tgl', tone: 'bad', errCode: 'XSD-ISO-DATE' },
  { code: 'FP-205', buyer: 'PT Inti Logam Nusantara', cabang: 'SMG · 000003', npwp16: '0166293847039000', nitku22: '0166293847039000000000', trx: '04', erp: 'SAP', hargaJual: 88900000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-214', buyer: 'PT Sentosa Kargo Maritim', cabang: 'SBY · 000001', npwp16: '0173920184051000', nitku22: '0173920184051000000002', trx: '04', erp: 'SAP', hargaJual: 67500000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-228', buyer: 'PT Pratama Kimia Tekstil', cabang: 'SMG · 000003', npwp16: '0239184756014000', nitku22: '0239184756014000000000', trx: '04', erp: 'SAP', hargaJual: 104400000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-241', buyer: 'PT Kencana Plastik Batam (KB)', cabang: 'JKT · 000000', npwp16: '0191827364092000', nitku22: '0191827364092000000001', trx: '07', erp: 'SAP', hargaJual: 82000000, status: 'XML Valid', tone: 'ok', errCode: null },
  { code: 'FP-259', buyer: 'PT Andalas Perkasa Distribusi', cabang: 'MDN · 000002', npwp16: '0264819203087000', nitku22: '0264819203087000000000', trx: '04', erp: 'Accurate 5', hargaJual: 76200000, status: 'XML Valid', tone: 'ok', errCode: null },
];

const INVOICES = INVOICES_RAW.map((r) => {
  const { dppLain, ppn } = calcCoreTax(r.hargaJual, r.trx);
  return { ...r, dppLain, ppn };
});

// 14-row Rounding Parity Audit Dataset (P4) — exact arithmetic verification
const ROUNDING_AUDIT = [
  { code: 'FP-040', buyer: 'PT Nusantara Logistik', lines: 14, hargaJual: 84200000, erpDpp: 77183333, ctDpp: 77183333, erpPpn: 9262000, ctPpn: 9262000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-041', buyer: 'CV Sumber Makmur (MDN)', lines: 5, hargaJual: 19500000, erpDpp: 17875000, ctDpp: 17875000, erpPpn: 2145000, ctPpn: 2145000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-042', buyer: 'PT Sinergi Baja Prima Tbk', lines: 22, hargaJual: 142500000, erpDpp: 130625000, ctDpp: 130625000, erpPpn: 15675000, ctPpn: 15675000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-043', buyer: 'PT Karya Pangan Sentosa', lines: 11, hargaJual: 63800000, erpDpp: 58483334, ctDpp: 58483333, erpPpn: 7018000, ctPpn: 7018000, guard: 'Auto-Absorb Rp 1', tone: 'info' },
  { code: 'FP-044', buyer: 'PT Pelabuhan Samudra Timur', lines: 9, hargaJual: 96400000, erpDpp: 88366667, ctDpp: 88366667, erpPpn: 10604000, ctPpn: 10604000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-058', buyer: 'PT Cipta Medika Farma', lines: 17, hargaJual: 52600000, erpDpp: 48216667, ctDpp: 48216667, erpPpn: 5786000, ctPpn: 5786000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-071', buyer: 'PT Graha Konstruksi Mandiri', lines: 8, hargaJual: 74900000, erpDpp: 68658334, ctDpp: 68658333, erpPpn: 8239000, ctPpn: 8239000, guard: 'Auto-Absorb Rp 1', tone: 'info' },
  { code: 'FP-094', buyer: 'PT Agro Sawit Sumatera', lines: 19, hargaJual: 129300000, erpDpp: 118525000, ctDpp: 118525000, erpPpn: 14223000, ctPpn: 14223000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-112', buyer: 'PT Surya Distribusi Nasional', lines: 34, hargaJual: 47250000, erpDpp: 43312518, ctDpp: 43312500, erpPpn: 5197502, ctPpn: 5197500, guard: 'Blokir (> Rp 1)', tone: 'bad' },
  { code: 'FP-129', buyer: 'PT Mandiri Kemasan Lestari', lines: 12, hargaJual: 58700000, erpDpp: 53808333, ctDpp: 53808333, erpPpn: 6457000, ctPpn: 6457000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-146', buyer: 'PT Prima Coldchain Indonesia', lines: 15, hargaJual: 91600000, erpDpp: 83966667, ctDpp: 83966667, erpPpn: 10076000, ctPpn: 10076000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-205', buyer: 'PT Inti Logam Nusantara', lines: 13, hargaJual: 88900000, erpDpp: 81491666, ctDpp: 81491667, erpPpn: 9779000, ctPpn: 9779000, guard: 'Auto-Absorb Rp 1', tone: 'info' },
  { code: 'FP-214', buyer: 'PT Sentosa Kargo Maritim', lines: 10, hargaJual: 67500000, erpDpp: 61875000, ctDpp: 61875000, erpPpn: 7425000, ctPpn: 7425000, guard: 'Exact Match', tone: 'ok' },
  { code: 'FP-228', buyer: 'PT Pratama Kimia Tekstil', lines: 16, hargaJual: 104400000, erpDpp: 95700000, ctDpp: 95700000, erpPpn: 11484000, ctPpn: 11484000, guard: 'Exact Match', tone: 'ok' },
];

// 12 Expiring Faktur Masukan (FM-882) — sum = 12 docs, Rp 27.600.000
const FM882_GROUPS = [
  { id: 'FM-882-01..03', vendor: 'PT Baja Sejahtera Abadi', masa: 'Agu 2026', docs: 3, ppn: 8400000, deadline: '30 Nov 2026', qr: 'SAH' },
  { id: 'FM-882-04..06', vendor: 'PT Kimia Industri Sentosa', masa: 'Agu 2026', docs: 3, ppn: 7250000, deadline: '30 Nov 2026', qr: 'SAH' },
  { id: 'FM-882-07..08', vendor: 'PT Armada Ekspedisi Prima', masa: 'Agu 2026', docs: 2, ppn: 5150000, deadline: '30 Nov 2026', qr: 'SAH' },
  { id: 'FM-882-09..10', vendor: 'PT Energi Listrik Kawasan', masa: 'Agu 2026', docs: 2, ppn: 4100000, deadline: '30 Nov 2026', qr: 'SAH' },
  { id: 'FM-882-11..12', vendor: 'CV Kemasan Karton Jaya', masa: 'Agu 2026', docs: 2, ppn: 2700000, deadline: '30 Nov 2026', qr: 'SAH' },
];

// ERP Connectors (P8) — sums to 1.248 Faktur Keluaran
const ERP_CONNECTORS = [
  { name: 'SAP S/4HANA Prod (RFC)', host: 'sap-prd-jkt.nusantara.internal', mode: 'Live RFC · 5 mnt', docs: 844, latencyMs: 118, errRate: '0,24%', status: 'Terhubung', tone: 'ok' },
  { name: 'Accurate 5 Enterprise', host: 'acc-api-mdn-bpn.nusantara.id', mode: 'REST Polling · 15 mnt', docs: 280, latencyMs: 184, errRate: '0,36%', status: 'Terhubung', tone: 'ok' },
  { name: 'SQL Server AP/AR (MKS)', host: 'sql-mks02.nusantara.id:1433', mode: 'CDC View · 30 mnt', docs: 124, latencyMs: 92, errRate: '0,81%', status: 'Degraded', tone: 'warn' },
  { name: 'EPPlus Excel Ingest API', host: 'POST /api/v2/ingest/xlsx', mode: 'Ad-hoc Upload (BUP)', docs: 38, latencyMs: 64, errRate: '0,00%', status: 'Siaga', tone: 'info' },
];

export function verifyMath() {
  const sumTotal = BRANCHES.reduce((a, b) => a + b.total, 0);
  const sumValid = BRANCHES.reduce((a, b) => a + b.valid, 0);
  const sumErr = BRANCHES.reduce((a, b) => a + b.errXsd, 0);
  const sumPpnBruto = BRANCHES.reduce((a, b) => a + b.ppnBruto, 0);

  if (sumTotal !== 1248) throw new Error(`Expected 1248 total invoices, got ${sumTotal}`);
  if (sumValid !== 1244) throw new Error(`Expected 1244 valid invoices, got ${sumValid}`);
  if (sumErr !== 4) throw new Error(`Expected 4 XSD errors, got ${sumErr}`);
  if (sumValid + sumErr !== sumTotal) throw new Error('Valid + Error != Total');
  if (sumPpnBruto !== SPT_PPN.ppnKeluaranBruto) throw new Error('Branch PPN sum != SPT PPN Bruto');

  if (SPT_PPN.ppnKeluaranBruto - SPT_PPN.returPenjualanPpn !== SPT_PPN.ppnKeluaranNeto) {
    throw new Error('PPN Keluaran Neto mismatch');
  }
  const sumMasukan = SPT_PPN.masukanBuckets.reduce((a, b) => a + b.ppn, 0);
  if (sumMasukan !== SPT_PPN.ppnMasukanTotal) throw new Error('PPN Masukan bucket sum mismatch');
  if (SPT_PPN.ppnKeluaranNeto - SPT_PPN.ppnMasukanTotal !== SPT_PPN.ppnKurangBayar) {
    throw new Error('PPN Kurang Bayar mismatch');
  }
  if (SPT_PPN.ppnKurangBayar !== 312400000) throw new Error('Expected Rp 312.400.000 PPN Kurang Bayar');

  const bupRows = BUP23_GROUPS.reduce((a, b) => a + b.baris, 0);
  const bupDpp = BUP23_GROUPS.reduce((a, b) => a + b.dpp, 0);
  const bupPph = BUP23_GROUPS.reduce((a, b) => a + b.pph, 0);
  if (bupRows !== 38) throw new Error(`Expected 38 BUP-23 rows, got ${bupRows}`);
  if (bupPph !== 41800000) throw new Error(`Expected Rp 41.800.000 BUP-23 PPh, got ${bupPph}`);
  if (Math.round(bupDpp * 0.02) !== bupPph) throw new Error('BUP-23 2% PPh mismatch');

  const fp040 = INVOICES.find((x) => x.code === 'FP-040');
  if (!fp040 || fp040.dppLain !== 77183333 || fp040.ppn !== 9262000) {
    throw new Error(`FP-040 spec math mismatch: ${JSON.stringify(fp040)}`);
  }
  const xsdErrsInGrid = INVOICES.filter((x) => x.errCode !== null).length;
  if (xsdErrsInGrid !== 4) throw new Error(`Expected 4 XSD error rows in grid, got ${xsdErrsInGrid}`);

  const fmDocs = FM882_GROUPS.reduce((a, b) => a + b.docs, 0);
  const fmPpn = FM882_GROUPS.reduce((a, b) => a + b.ppn, 0);
  if (fmDocs !== 12 || fmPpn !== 27600000) {
    throw new Error(`FM-882 mismatch: docs=${fmDocs}, ppn=${fmPpn}`);
  }

  const erpOutDocs = ERP_CONNECTORS.slice(0, 3).reduce((a, c) => a + c.docs, 0);
  if (erpOutDocs !== 1248) throw new Error(`ERP connector outbound docs (${erpOutDocs}) != 1248`);

  for (const r of ROUNDING_AUDIT) {
    const calc = calcCoreTax(r.hargaJual, '04');
    if (calc.dppLain !== r.ctDpp || calc.ppn !== r.ctPpn) {
      throw new Error(`Rounding audit math error on ${r.code}`);
    }
  }
  return true;
}

// ============================================================================
// EDITORIAL LEGAL / REGULATORY WORKBENCH CHROME (RELATIVITYONE + ONESOURCE)
// ============================================================================
const EXTRA_CSS = `
  :root {
    --legal-serif: Georgia, "Cambria", "Times New Roman", serif;
    --legal-ink: #161b26;
    --legal-paper: #faf9f6;
    --legal-desk: #f2eee6;
    --legal-ribbon: #ebe5d9;
    --legal-rule: #d8d0c0;
    --legal-rule-strong: #bfb5a1;
    --legal-navy: #1e3a8a;
    --legal-navy-dark: #152238;
    --legal-navy-soft: #e6ecf8;
    --legal-brass: #a8833e;
    --legal-brass-soft: #f7f1e3;
    --legal-burgundy: #881337;
    --legal-forest: #14532d;
  }

  .ct-topbar {
    height: 40px;
    background: var(--legal-navy-dark);
    color: #f8f6f1;
    border-bottom: 2px solid var(--legal-brass);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .ct-top-left, .ct-top-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .ct-seal {
    width: 24px;
    height: 24px;
    border-radius: 2px;
    background: var(--legal-navy);
    border: 1px solid var(--legal-brass);
    color: #faf6eb;
    font-family: var(--legal-serif);
    font-weight: 700;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
  .ct-brand-title {
    font-family: var(--legal-serif);
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .ct-brand-sub {
    font-size: 9.8px;
    color: #cbd5e1;
    border-left: 1px solid #334155;
    padding-left: 8px;
    white-space: nowrap;
  }
  .ct-pkp-chip {
    height: 24px;
    padding: 0 8px;
    background: #1e2d47;
    border: 1px solid #334a6e;
    border-radius: 2px;
    color: #e2e8f0;
    font-size: 10.5px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ct-xsd-pill {
    padding: 2px 7px;
    border-radius: 2px;
    background: #133928;
    border: 1px solid #2b6e4e;
    color: #bbf7d0;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    white-space: nowrap;
  }
  .ct-due-pill {
    padding: 2px 7px;
    border-radius: 2px;
    background: #3b2a10;
    border: 1px solid #a8833e;
    color: #fde68a;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    white-space: nowrap;
  }

  .ct-ribbon {
    height: 32px;
    background: var(--legal-ribbon);
    border-bottom: 1px solid var(--legal-rule-strong);
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .ct-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
    min-width: 0;
  }
  .ct-tab {
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.6px;
    font-weight: 600;
    color: #3f4756;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .ct-tab.is-active {
    background: var(--legal-paper);
    color: var(--legal-navy);
    border-bottom: 2px solid var(--legal-navy);
    border-left: 1px solid var(--legal-rule-strong);
    border-right: 1px solid var(--legal-rule-strong);
    font-weight: 700;
  }
  .ct-tab-num {
    font-family: var(--e-mono);
    font-size: 9px;
    color: #6b7280;
  }
  .ct-tab.is-active .ct-tab-num {
    color: var(--legal-navy);
    font-weight: 700;
  }
  .ct-ribbon-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .ct-workspace {
    flex: 1;
    min-height: 0;
    padding: 9px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--legal-desk);
    overflow: hidden;
  }
  .ct-serif {
    font-family: var(--legal-serif);
    letter-spacing: -0.01em;
  }
  .e-panel {
    background: var(--legal-paper);
    border: 1px solid var(--legal-rule);
    border-radius: 3px;
  }
  .e-panel-head {
    height: 30px;
    padding: 0 10px;
    background: #f3efe6;
    border-bottom: 1px solid var(--legal-rule);
  }
  .e-panel-title {
    font-size: 11.2px;
    font-weight: 700;
    color: var(--legal-ink);
  }
  .e-kpi {
    background: var(--legal-paper);
    border: 1px solid var(--legal-rule);
    border-radius: 3px;
    padding: 7px 10px;
  }
  .e-kpi-val {
    font-size: 16px;
    color: var(--legal-ink);
  }
  table.e-table th {
    background: #efeae0;
    color: #3b4454;
    border-bottom: 1px solid var(--legal-rule-strong);
    padding: 4.5px 6px;
    font-size: 9.6px;
  }
  table.e-table td {
    padding: 4px 6px;
    border-bottom: 1px solid #e7e1d5;
    font-size: 10.5px;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #f6f3ec;
  }
  table.e-table tfoot td {
    background: #ebe5d8;
    border-top: 1px solid var(--legal-rule-strong);
    padding: 5px 6px;
    font-size: 10.5px;
  }

  .ct-statute {
    background: #f7f3e8;
    border: 1px solid #d5c7a7;
    border-left: 3px solid var(--legal-brass);
    border-radius: 2px;
    padding: 6px 8px;
    font-size: 10px;
    color: #2d3440;
    line-height: 1.38;
  }
  .ct-statute-head {
    font-family: var(--legal-serif);
    font-weight: 700;
    font-size: 10.4px;
    color: #5c4314;
    margin-bottom: 2px;
  }

  .xml-pane {
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.42;
    background: #fcfbf8;
    color: #1e293b;
  }
  .xml-line {
    display: flex;
    align-items: baseline;
    padding: 1px 8px 1px 0;
    border-bottom: 1px solid #f2eee6;
    white-space: pre;
  }
  .xml-ln {
    width: 28px;
    text-align: right;
    padding-right: 7px;
    color: #8b8577;
    user-select: none;
    flex-shrink: 0;
    border-right: 1px solid #e6dfd1;
    margin-right: 8px;
    font-size: 9px;
  }
  .xml-del {
    background: #fdecef;
    color: #881337;
    border-left: 2.5px solid #be123c;
  }
  .xml-add {
    background: #eaf7ef;
    color: #14532d;
    border-left: 2.5px solid #15803d;
  }
  .xml-tag { color: #1e3a8a; font-weight: 600; }
  .xml-err-mark {
    background: #fecdd3;
    color: #881337;
    padding: 0 3px;
    border-radius: 2px;
    font-weight: 700;
    text-decoration: line-through;
  }
  .xml-fix-mark {
    background: #bbf7d0;
    color: #14532d;
    padding: 0 3px;
    border-radius: 2px;
    font-weight: 700;
  }

  .ct-phone {
    background: #faf9f6;
    border: 2px solid #243044;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
  .ct-phone-notch {
    height: 22px;
    background: #152238;
    color: #e2e8f0;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    flex-shrink: 0;
  }
  .ct-phone-body {
    flex: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .ct-footer {
    height: 24px;
    background: #e5dfd2;
    border-top: 1px solid var(--legal-rule-strong);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: #3b4454;
    flex-shrink: 0;
  }
  .ct-foot-grp {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ct-kv-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 3.5px 0;
    border-bottom: 1px solid #ece6da;
    font-size: 10.2px;
  }
  .ct-kv-row:last-child { border-bottom: 0; }
  .ct-kv-k { color: #5d6675; }
  .ct-kv-v { color: #161b26; font-weight: 600; }
  .ct-facet-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3.5px 6px;
    border-radius: 2px;
    font-size: 10.2px;
    color: #334155;
  }
  .ct-facet-item.is-on {
    background: var(--legal-navy-soft);
    color: var(--legal-navy);
    font-weight: 700;
  }
`;

const MODULES = [
  { slug: 'p1', num: '01', short: 'Komando SPT', icon: 'activity' },
  { slug: 'p2', num: '02', short: 'Faktur & NITKU', icon: 'fileText' },
  { slug: 'p3', num: '03', short: 'Redline XML/XSD', icon: 'code' },
  { slug: 'p4', num: '04', short: 'DPP 11/12 Guard', icon: 'sliders' },
  { slug: 'p5', num: '05', short: 'SPT & BUP-23', icon: 'layers' },
  { slug: 'p6', num: '06', short: 'Otorisasi DoA', icon: 'users' },
  { slug: 'p7', num: '07', short: 'Audit WORM & RBAC', icon: 'shield' },
  { slug: 'p8', num: '08', short: 'QR & ERP Sync', icon: 'server' },
];

function renderShell(activeSlug, title, rightRibbonHtml, workspaceHtml, footerNote = '') {
  const topbar = `<header class="ct-topbar">
    <div class="ct-top-left">
      <span class="ct-seal">CB</span>
      <span class="ct-brand-title">CoreTax Bridge</span>
      <span class="ct-brand-sub">Studio Kepatuhan Pajak &amp; Konversi XML CoreTax DJP</span>
      <div class="ct-pkp-chip">
        ${ic('shield', 11, '#d6b36a')}
        <strong>${esc(ENTITY.name)}</strong>
        <span class="mono" style="color:#93c5fd;">PKP-${ENTITY.npwp16}</span>
      </div>
    </div>
    <div class="ct-top-right">
      <span class="ct-xsd-pill">${esc(ENTITY.xsdVersion)} · AKTIF</span>
      <span class="ct-due-pill">SPT Masa ${esc(ENTITY.masaPajak)} · H-${ENTITY.daysLeft}</span>
      <div style="display:flex;align-items:center;gap:6px;padding-left:8px;border-left:1px solid #334155;">
        <span style="width:22px;height:22px;border-radius:2px;background:#1e3a8a;border:1px solid #93c5fd;color:#fff;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">RH</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.2px;font-weight:700;color:#ffffff;">R. Hendrawan, BKP</div>
          <div style="font-size:8.8px;color:#cbd5e1;">Head of Tax Compliance</div>
        </div>
      </div>
    </div>
  </header>`;

  const ribbon = `<nav class="ct-ribbon">
    <div class="ct-tabs">
      ${MODULES.map((m) => {
        const active = m.slug === activeSlug;
        return `<div class="ct-tab ${active ? 'is-active' : ''}">
          <span class="ct-tab-num">${m.num}</span>
          ${ic(m.icon, 11, active ? '#1e3a8a' : '#64748b')}
          <span>${esc(m.short)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="ct-ribbon-actions">${rightRibbonHtml}</div>
  </nav>`;

  const footer = `<footer class="ct-footer">
    <div class="ct-foot-grp">
      <span><span class="dot dot-ok" style="margin-right:4px;"></span>XSD Engine .NET 9 · CoreTax_TaxInvoice_v2.4.xsd</span>
      <span>Ledger: PostgreSQL Tax Vault (WORM Retensi 10 Thn)</span>
      <span>Batch: ${ENTITY.batchId}</span>
    </div>
    <div class="ct-foot-grp">
      ${footerNote ? `<span>${esc(footerNote)}</span>` : ''}
      <span>WORM Head: sha256:9d4a7c2e..f810</span>
      <span>22 Nov 2026 · 14:32 WIB</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `CoreTax Bridge — ${title}`,
    accent: '#1e3a8a',
    accentSoft: '#e6ecf8',
    accentInk: '#172e6e',
    bg: '#f2eee6',
    surface: '#faf9f6',
    surface2: '#f3efe6',
    border: '#d8d0c0',
    borderStrong: '#bfb5a1',
    text: '#161b26',
    text2: '#3b4454',
    muted: '#5d6675',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}${ribbon}<main class="ct-workspace">${workspaceHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: KOMANDO KEPATUHAN & POSISI SPT MASA (EXECUTIVE COMMAND COCKPIT)
// ============================================================================
function renderPage1() {
  const days = ['02 Nov', '04 Nov', '06 Nov', '08 Nov', '10 Nov', '12 Nov', '14 Nov', '16 Nov', '18 Nov', '20 Nov', '22 Nov'];
  const chart = svgMultiLineChart({
    width: 890,
    height: 242,
    xLabels: days,
    yMin: 0,
    yMax: 160,
    yTicks: 4,
    yFormat: (v) => `${Math.round(v)} dok`,
    threshold: { value: 138, label: 'Kapasitas Validasi SLA (138/hr)', color: '#a8833e' },
    series: [
      { label: 'Faktur Keluaran Valid (XML)', color: '#1e3a8a', area: true, dots: true, values: [92, 108, 114, 98, 126, 118, 104, 132, 121, 119, 112] },
      { label: 'Faktur Masukan Terverifikasi QR', color: '#166534', width: 1.7, values: [34, 41, 38, 29, 44, 39, 35, 42, 46, 38, 32] },
      { label: 'Error XSD Tertangkap Pra-Unggah', color: '#9f1239', dashed: true, width: 1.6, values: [6, 4, 2, 1, 5, 3, 1, 2, 4, 2, 4] },
    ],
    annotations: [
      { index: 4, seriesIdx: 0, label: 'Lonjakan Ingest SAP: 126 dok', color: '#1e3a8a', dy: -26 },
      { index: 10, seriesIdx: 2, label: '4 baris perlu perbaikan', color: '#9f1239', dy: -28 },
    ],
  });

  const priorityItems = [
    { code: 'FP-040', title: 'PT Nusantara Logistik (DPP Nilai Lain)', sub: 'NPWP-16 + NITKU 000000 terverifikasi · PPN 11% efektif', val: fmtIdr(84200000), st: 'XML Valid', tone: 'ok', law: 'PMK 131/2024 Ps. 3' },
    { code: 'FP-041', title: 'CV Sumber Makmur — Cabang Medan', sub: 'NITKU 22 digit kurang akhiran kode cabang (16 digit)', val: fmtIdr(19500000), st: 'Perbaiki NITKU', tone: 'bad', law: 'PER-11/PJ/2025' },
    { code: 'BUP-23', title: 'Bukti Potong Unifikasi PPh 23 (38 baris)', sub: 'Seluruh NPWP-16 vendor aktif & cocok · Tarif 2%', val: fmtIdr(41800000), st: 'XML Siap', tone: 'ok', law: 'PER-24/PJ/2021' },
    { code: 'FM-882', title: 'Faktur Masukan — Kedaluwarsa Bulan Depan', sub: '12 faktur Masa Agu 2026 mendekati batas 3 bulan', val: fmtIdr(27600000), st: 'Kreditkan', tone: 'warn', law: 'UU PPN Ps. 9(9)' },
  ];

  const html = `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#faf9f6;border:1px solid #d8d0c0;border-left:3.5px solid #1e3a8a;border-radius:3px;padding:7px 12px;flex-shrink:0;">
      <div>
        <div class="ct-serif" style="font-size:15px;font-weight:700;color:#161b26;">Komando Kepatuhan CoreTax · Batch SPT Masa November 2026</div>
        <div style="font-size:10.3px;color:#5d6675;">Konsolidasi 6 Unit NITKU Cabang PKP · Sumber ERP: SAP S/4HANA, Accurate 5, SQL Server AP/AR · Validasi Skema CoreTax DJP XSD v2.4</div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="text-align:right;">
          <div style="font-size:9.3px;color:#5d6675;font-weight:600;">BATAS PENYETORAN &amp; PELAPORAN</div>
          <div class="mono" style="font-size:11.5px;font-weight:700;color:#881337;">31 Des 2026 · 23:59 WIB (H-9)</div>
        </div>
        <div style="text-align:right;padding-left:12px;border-left:1px solid #d8d0c0;">
          <div style="font-size:9.3px;color:#5d6675;font-weight:600;">KPP ADMINISTRASI</div>
          <div style="font-size:10.8px;font-weight:700;color:#161b26;">${esc(ENTITY.kpp)}</div>
        </div>
      </div>
    </div>

    <div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Faktur Valid XSD v2.4</span>${badge('99,68%', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">1.244 / 1.248</span>
          ${svgSparkline({ points: [91, 94, 96, 97, 98.2, 99.1, 99.68], width: 66, height: 20, color: '#166534' })}
        </div>
        <div class="e-kpi-foot"><span>6 cabang NITKU aktif</span><span class="mono">0 ditolak DJP</span></div>
      </div>
      <div class="e-kpi" style="border-color:#e5b4bd;background:#fdf6f7;">
        <div class="e-kpi-top"><span style="color:#881337;">Error XSD Pra-Unggah</span>${badge('Blokir Ekspor', 'bad')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#9f1239;">4 baris</span>
          ${svgSparkline({ points: [19, 14, 11, 9, 6, 5, 4], width: 66, height: 20, color: '#9f1239' })}
        </div>
        <div class="e-kpi-foot"><span>NITKU · Kode Brg · DPP · Tgl</span><span class="mono">FP-041 prioritas</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>PPN Keluaran Neto</span>${badge('1.244 dok', 'accent')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtIdr(SPT_PPN.ppnKeluaranNeto)}</span>
        </div>
        <div class="e-kpi-foot"><span>Bruto Rp 861,0 jt</span><span class="mono">Retur -Rp 14,2 jt</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>PPN Masukan Dikreditkan</span>${badge('418 dok', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtIdr(SPT_PPN.ppnMasukanTotal)}</span>
        </div>
        <div class="e-kpi-foot"><span>Termasuk FM-882 (12 dok)</span><span class="mono">Rp 27,6 jt Agu</span></div>
      </div>
      <div class="e-kpi" style="border-color:#b8c7e8;background:#f3f6fc;">
        <div class="e-kpi-top"><span style="color:#1e3a8a;">PPN Kurang Bayar (SPT)</span>${badge('Rp 312,4 jt', 'accent')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#1e3a8a;">${fmtIdr(SPT_PPN.ppnKurangBayar)}</span>
        </div>
        <div class="e-kpi-foot"><span>Keluaran Neto - Masukan</span><span class="mono">Siap ID Billing</span></div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.58fr 1fr;gap:9px;">
      <!-- Left Column -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:0 0 284px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#1e3a8a')}<span>Tren Konversi ERP ke XML CoreTax &amp; Deteksi Error XSD (Nov 2026)</span></div>
            <span class="e-panel-sub mono">Total Ingest: 1.248 Keluaran · 418 Masukan · 38 BUP-23</span>
          </div>
          <div class="e-panel-body" style="padding:6px 10px;">
            ${chart}
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#1e3a8a')}<span>Kesiapan Batch per Unit Cabang PKP (NITKU 22-Digit)</span></div>
            <span class="e-panel-sub">NPWP Pusat: <span class="mono">${ENTITY.npwp16}</span></span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:92px;" />
                <col style="width:205px;" />
                <col style="width:110px;" />
                <col style="width:60px;" />
                <col style="width:60px;" />
                <col style="width:48px;" />
                <col style="width:130px;" />
                <col style="width:155px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Akhiran NITKU</th>
                  <th>Unit Cabang PKP</th>
                  <th>Sumber ERP</th>
                  <th class="num">Total</th>
                  <th class="num">Valid</th>
                  <th class="num">Err</th>
                  <th class="num">PPN Bruto</th>
                  <th>Status Validasi</th>
                </tr>
              </thead>
              <tbody>
                ${BRANCHES.map((b) => `<tr class="${b.errXsd > 0 && b.tone === 'bad' ? 'is-bad' : ''}">
                  <td class="mono" style="font-weight:700;color:#1e3a8a;">.${b.nitkuSuffix}</td>
                  <td style="font-weight:600;">${esc(b.name)}</td>
                  <td style="color:#5d6675;">${esc(b.erp)}</td>
                  <td class="num mono">${fmtNum(b.total)}</td>
                  <td class="num mono" style="color:#166534;font-weight:600;">${fmtNum(b.valid)}</td>
                  <td class="num mono" style="color:${b.errXsd ? '#9f1239' : '#64748b'};font-weight:${b.errXsd ? '700' : '400'};">${b.errXsd}</td>
                  <td class="num mono" style="font-weight:600;">${fmtIdr(b.ppnBruto)}</td>
                  <td>${badge(b.status, b.tone)}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL KONSOLIDASI 6 CABANG PKP</td>
                  <td class="num mono">1.248</td>
                  <td class="num mono">1.244</td>
                  <td class="num mono" style="color:#9f1239;">4</td>
                  <td class="num mono">${fmtIdr(SPT_PPN.ppnKeluaranBruto)}</td>
                  <td>${badge('99,68% Siap Ekspor', 'accent')}</td>
                </tr>
              </tfoot>
            </table>
            <!-- Compact Transaction Regime Summary Strip (eliminates dead bottom space) -->
            <div style="margin-top:auto;padding:8px 10px;border-top:1px solid #e5dfd2;background:#f7f4ec;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:2px;padding:6px 8px;">
                <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#5d6675;"><span>Kode 04 · DPP Nilai Lain (11/12)</span><strong class="mono" style="color:#1e3a8a;">1.162 dok</strong></div>
                <div style="font-size:10px;color:#334155;margin-top:2px;">PPN Efektif 11% · <span class="mono">93,1%</span> dari volume batch</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:2px;padding:6px 8px;">
                <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#5d6675;"><span>Kode 01 · BKP Mewah (12% Penuh)</span><strong class="mono" style="color:#881337;">48 dok</strong></div>
                <div style="font-size:10px;color:#334155;margin-top:2px;">Tarif penuh PMK 131 · <span class="mono">3,8%</span> dari volume batch</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:2px;padding:6px 8px;">
                <div style="display:flex;justify-content:space-between;font-size:9.5px;color:#5d6675;"><span>Kode 07 · Kawasan Berikat (0%)</span><strong class="mono" style="color:#166534;">38 dok</strong></div>
                <div style="font-size:10px;color:#334155;margin-top:2px;">Fasilitas BC 4.0 · <span class="mono">3,1%</span> dari volume batch</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('alert', 13, '#881337')}<span>Antrean Triage Dokumen Kritis SPT Masa</span></div>
            <span class="e-panel-sub">4 Sorotan Utama</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;padding:8px 10px;">
            ${priorityItems.map((it) => `
              <div style="padding:7px 9px;border:1px solid ${it.tone === 'bad' ? '#e5b4bd' : it.tone === 'warn' ? '#e6cf99' : '#dcd4c5'};background:${it.tone === 'bad' ? '#fdf6f7' : it.tone === 'warn' ? '#fdf9ee' : '#ffffff'};border-radius:3px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:2px;">
                  <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                    <span class="mono" style="font-size:10px;font-weight:700;color:#1e3a8a;background:#e6ecf8;padding:1px 5px;border-radius:2px;">${esc(it.code)}</span>
                    <span style="font-size:10.8px;font-weight:700;color:#161b26;" class="trunc">${esc(it.title)}</span>
                  </div>
                  ${badge(it.st, it.tone)}
                </div>
                <div style="font-size:9.8px;color:#475569;margin-bottom:4px;">${esc(it.sub)}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.8px;">
                  <span class="mono" style="color:#5c4314;background:#f7f1e3;padding:1px 5px;border-radius:2px;border:1px solid #dfd1b0;">${esc(it.law)}</span>
                  <span class="mono" style="font-size:11.2px;font-weight:700;color:#161b26;">${esc(it.val)}</span>
                </div>
              </div>
            `).join('')}

            <div class="ct-statute" style="margin-top:auto;">
              <div class="ct-statute-head">Cuplikan XML Lolos XSD · FP-040 (DPP Nilai Lain 11/12)</div>
              <div class="mono" style="font-size:9.1px;color:#14532d;background:#eef8f2;padding:4px 6px;border-radius:2px;border:1px solid #b7dfc7;word-break:break-all;">&lt;TaxInvoice&gt;&lt;TIN&gt;0162849102000000&lt;/TIN&gt;&lt;TrxCode&gt;04&lt;/TrxCode&gt;&lt;OtherTaxBase&gt;77183333&lt;/OtherTaxBase&gt;&lt;VAT&gt;9262000&lt;/VAT&gt;&lt;/TaxInvoice&gt; -&gt; XSD PASS</div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 198px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('clock', 13, '#1e3a8a')}<span>Jadwal Tutup Buku &amp; Pelaporan CoreTax DJP</span></div>
            ${badge('Tahap 3 / 5', 'accent')}
          </div>
          <div class="e-panel-body" style="padding:6px 10px;display:flex;flex-direction:column;gap:2px;">
            <div class="ct-kv-row" style="padding:3px 0;"><span class="ct-kv-k">1. Ingest ERP &amp; Pemetaan Kode 04 (11/12)</span>${badge('Selesai · 1.248 dok', 'ok')}</div>
            <div class="ct-kv-row" style="padding:3px 0;"><span class="ct-kv-k">2. Validasi XSD v2.4 &amp; Cek NITKU 22-Digit</span>${badge('4 Error Tersisa', 'bad')}</div>
            <div class="ct-kv-row" style="padding:3px 0;"><span class="ct-kv-k">3. Kredit Faktur Masukan FM-882 (Batas 3 Bln)</span>${badge('Menunggu Aksi', 'warn')}</div>
            <div class="ct-kv-row" style="padding:3px 0;"><span class="ct-kv-k">4. Sign-Off Tax Manager &amp; CFO (Sertel DJP)</span>${badge('Terjadwal 26 Nov', 'neutral')}</div>
            <div class="ct-kv-row" style="padding:3px 0;"><span class="ct-kv-k">5. Unggah Batch XML &amp; Setor NTPN Rp 312,4 jt</span>${badge('Target 28 Nov', 'neutral')}</div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p1',
    meta.pages[0].title,
    `<span class="e-btn">${ic('refresh', 11, '#1e3a8a')}Verifikasi NITKU</span>
     <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}Validasi &amp; Ekspor XML</span>`,
    html,
    'SPT Masa Nov 2026 · PPN Kurang Bayar Rp 312.400.000'
  );
}

// ============================================================================
// PAGE 2: MEJA KERJA FAKTUR KELUARAN & INSPEKTOR NITKU (3-PANE WORKBENCH)
// ============================================================================
function renderPage2() {
  const sliceHarga = INVOICES.reduce((a, r) => a + r.hargaJual, 0);
  const sliceDpp = INVOICES.reduce((a, r) => a + r.dppLain, 0);
  const slicePpn = INVOICES.reduce((a, r) => a + r.ppn, 0);

  const html = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:208px 1fr 338px;gap:9px;">
      <!-- Left Facet & Filter Rail (RelativityOne Binder) -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('filter', 12, '#1e3a8a')}<span>Filter Faset Batch</span></div>
          <span class="mono" style="font-size:9.5px;color:#1e3a8a;font-weight:700;">1.248</span>
        </div>
        <div class="e-panel-body" style="padding:8px;display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="font-size:9.2px;font-weight:700;color:#5d6675;margin-bottom:3px;letter-spacing:0.03em;">STATUS VALIDASI XSD v2.4</div>
            <div class="ct-facet-item is-on"><span>Semua Dokumen Batch</span><span class="mono">1.248</span></div>
            <div class="ct-facet-item"><span>Lulus XSD &amp; Siap Unggah</span><span class="mono" style="color:#166534;font-weight:700;">1.244</span></div>
            <div class="ct-facet-item" style="background:#fdf0f2;color:#9f1239;font-weight:700;"><span>Gagal XSD (Wajib Perbaiki)</span><span class="mono">4</span></div>
          </div>

          <div style="border-top:1px solid #e5dfd2;padding-top:7px;">
            <div style="font-size:9.2px;font-weight:700;color:#5d6675;margin-bottom:3px;letter-spacing:0.03em;">KODE TRANSAKSI CORETAX</div>
            <div class="ct-facet-item"><span>04 · DPP Nilai Lain (11/12)</span><span class="mono">1.162</span></div>
            <div class="ct-facet-item"><span>01 · Barang Mewah (12%)</span><span class="mono">48</span></div>
            <div class="ct-facet-item"><span>07 · Kawasan Berikat (0%)</span><span class="mono">38</span></div>
          </div>

          <div style="border-top:1px solid #e5dfd2;padding-top:7px;">
            <div style="font-size:9.2px;font-weight:700;color:#5d6675;margin-bottom:3px;letter-spacing:0.03em;">VALIDITAS NITKU 22-DIGIT</div>
            <div class="ct-facet-item"><span>NITKU Terverifikasi DJP</span><span class="mono">1.247</span></div>
            <div class="ct-facet-item" style="color:#9f1239;font-weight:600;"><span>Akhiran Cabang Kosong</span><span class="mono">1</span></div>
          </div>

          <div style="border-top:1px solid #e5dfd2;padding-top:7px;">
            <div style="font-size:9.2px;font-weight:700;color:#5d6675;margin-bottom:3px;letter-spacing:0.03em;">SUMBER SISTEM ERP</div>
            <div class="ct-facet-item"><span>SAP S/4HANA (RFC)</span><span class="mono">844</span></div>
            <div class="ct-facet-item"><span>Accurate 5 Enterprise</span><span class="mono">280</span></div>
            <div class="ct-facet-item"><span>SQL Server AP/AR</span><span class="mono">124</span></div>
          </div>

          <div style="border-top:1px solid #e5dfd2;padding-top:7px;">
            <div style="font-size:9.2px;font-weight:700;color:#5d6675;margin-bottom:3px;letter-spacing:0.03em;">RINGKASAN UJI XSD TERAKHIR</div>
            <div class="ct-kv-row" style="font-size:9.7px;"><span class="ct-kv-k">Waktu Eksekusi</span><span class="ct-kv-v mono">42 ms</span></div>
            <div class="ct-kv-row" style="font-size:9.7px;"><span class="ct-kv-k">Cache PKP DJP</span><span class="ct-kv-v mono">4.812</span></div>
            <div class="ct-kv-row" style="font-size:9.7px;"><span class="ct-kv-k">Faktur Duplikat</span><span class="ct-kv-v mono" style="color:#166534;">0</span></div>
          </div>

          <div class="ct-statute" style="margin-top:auto;">
            <div class="ct-statute-head">Kaidah NITKU 22-Digit</div>
            PMK 112/2022 &amp; PER-06/PJ/2024 mewajibkan format <span class="mono">NPWP16 + 6 digit</span> kode TKU cabang pada tag <span class="mono">&lt;BuyerIdtku&gt;</span> untuk seluruh transaksi PKP.
          </div>
        </div>
      </section>

      <!-- Center 22-Row High-Density Math-Verified Grid -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('fileText', 13, '#1e3a8a')}<span>Daftar Faktur Pajak Keluaran · Batch SPT Masa Nov 2026</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Tampil 22 Sampel + 4 Error XSD', 'neutral')}
            ${badge('Dipilih: FP-041', 'bad')}
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:60px;" />
              <col style="width:196px;" />
              <col style="width:154px;" />
              <col style="width:32px;" />
              <col style="width:104px;" />
              <col style="width:104px;" />
              <col style="width:94px;" />
              <col style="width:104px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Lawan Transaksi &amp; Cabang</th>
                <th>NITKU Pembeli (22-Digit)</th>
                <th>Kd</th>
                <th class="num">Harga Jual</th>
                <th class="num">DPP Nilai Lain</th>
                <th class="num">PPN 12%</th>
                <th>Status XSD</th>
              </tr>
            </thead>
            <tbody>
              ${INVOICES.map((r) => {
                const cls = r.selected ? 'is-selected' : r.tone === 'bad' ? 'is-bad' : '';
                const nitkuBad = r.nitku22.length !== 22;
                return `<tr class="${cls}">
                  <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(r.code)}</td>
                  <td><div style="font-weight:600;color:#161b26;" class="trunc">${esc(r.buyer)}</div></td>
                  <td class="mono" style="font-size:9.5px;color:${nitkuBad ? '#9f1239' : '#334155'};font-weight:${nitkuBad ? '700' : '400'};">${esc(r.nitku22)}${nitkuBad ? ' [!16d]' : ''}</td>
                  <td class="mono" style="font-weight:700;">${r.trx}</td>
                  <td class="num mono">${fmtIdr(r.hargaJual)}</td>
                  <td class="num mono">${fmtIdr(r.dppLain)}</td>
                  <td class="num mono" style="font-weight:600;">${fmtIdr(r.ppn)}</td>
                  <td>${badge(r.status, r.tone)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">SUBTOTAL 22 BARIS TAMPIL (BATCH PENUH: 1.248 DOK · PPN RP 861,0 JT)</td>
                <td class="num mono">${fmtIdr(sliceHarga)}</td>
                <td class="num mono">${fmtIdr(sliceDpp)}</td>
                <td class="num mono">${fmtIdr(slicePpn)}</td>
                <td>${badge('4 Error XSD', 'bad')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- Right Contextual NITKU & Statutory Dossier Inspector -->
      <section class="e-panel">
        <div class="e-panel-head" style="background:#fdf2f4;border-bottom-color:#e5b4bd;">
          <div class="e-panel-title" style="color:#881337;">${ic('alert', 13, '#881337')}<span>Inspektor Dokumen · FP-041</span></div>
          ${badge('XSD-NITKU-22', 'bad')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:7px;">
          <div>
            <div class="ct-serif" style="font-size:13.5px;font-weight:700;color:#161b26;">CV Sumber Makmur — Cabang Medan</div>
            <div style="font-size:9.8px;color:#5d6675;">Dokumen Sumber: <span class="mono">ACC5-INV-MDN-2026-4418</span> · 19 Nov 2026</div>
          </div>

          <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 8px;">
            <div style="font-size:9.3px;font-weight:700;color:#5d6675;margin-bottom:4px;">BEDAH STRUKTUR NITKU 22-DIGIT (PEMBELI)</div>
            <div style="display:flex;gap:4px;margin-bottom:5px;">
              <div style="flex:1;background:#eef6ff;border:1px solid #bfdbfe;border-radius:2px;padding:4px 6px;">
                <div style="font-size:8.4px;color:#1e3a8a;font-weight:700;">NPWP-16 (VALID)</div>
                <div class="mono" style="font-size:10.8px;font-weight:700;color:#161b26;">0941283741220000</div>
              </div>
              <div style="width:92px;background:#fdecef;border:1px dashed #be123c;border-radius:2px;padding:4px 6px;">
                <div style="font-size:8.4px;color:#9f1239;font-weight:700;">AKHIRAN (6D)</div>
                <div class="mono" style="font-size:10.8px;font-weight:700;color:#9f1239;">KOSONG!</div>
              </div>
            </div>
            <div style="font-size:9.6px;color:#881337;line-height:1.35;">
              Skema <span class="mono">CoreTax_TaxInvoice_v2.4.xsd</span> menolak panjang 16 digit pada elemen <span class="mono">&lt;BuyerIdtku&gt;</span>.
            </div>
          </div>

          <div style="background:#eef8f2;border:1px solid #a7d7bc;border-radius:3px;padding:7px 8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
              <span style="font-size:9.3px;font-weight:700;color:#14532d;">USULAN REMEDIASI OTOMATIS</span>
              ${badge('Cocok Direktori DJP', 'ok')}
            </div>
            <div class="mono" style="font-size:11.2px;font-weight:700;color:#14532d;margin-bottom:3px;">0941283741220000<span style="background:#bbf7d0;padding:0 3px;">000002</span></div>
            <div style="font-size:9.6px;color:#1e4631;">TKU Terdaftar: Kawasan Industri Medan II, Deli Serdang (Status PKP: AKTIF).</div>
            <div style="margin-top:6px;display:flex;gap:6px;">
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#fff')}Terapkan NITKU 000002</span>
              <span class="e-btn">${ic('code', 11, '#1e3a8a')}Lihat Redline</span>
            </div>
          </div>

          <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 8px;">
            <div style="font-size:9.3px;font-weight:700;color:#5d6675;margin-bottom:3px;">RINCIAN HITUNG PPN (KODE 04 · 11/12)</div>
            <div class="ct-kv-row"><span class="ct-kv-k">Harga Jual / Penggantian</span><span class="ct-kv-v mono">${fmtIdr(19500000)}</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">DPP Nilai Lain (11/12)</span><span class="ct-kv-v mono">${fmtIdr(17875000)}</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">PPN Terutang (12% × DPP)</span><span class="ct-kv-v mono" style="color:#1e3a8a;">${fmtIdr(2145000)}</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Paritas Pembulatan</span>${badge('Exact Rp 0', 'ok')}</div>
          </div>

          <!-- Line Item Breakdown from Accurate 5 -->
          <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 8px;">
            <div style="font-size:9.3px;font-weight:700;color:#5d6675;margin-bottom:4px;">BARIS BARANG SUMBER ERP (ACCURATE 5)</div>
            <div class="ct-kv-row" style="font-size:9.7px;"><span class="ct-kv-k">1. Pipa Galvanis 4" (HS 730890 · 30 btg)</span><span class="ct-kv-v mono">Rp 13.500.000</span></div>
            <div class="ct-kv-row" style="font-size:9.7px;"><span class="ct-kv-k">2. Fitting Elbow Flange (HS 730799 · 50 pcs)</span><span class="ct-kv-v mono">Rp 6.000.000</span></div>
            <div class="ct-kv-row" style="font-size:9.8px;font-weight:700;"><span class="ct-kv-k" style="color:#161b26;font-weight:700;">Total Harga Jual (2 Item)</span><span class="ct-kv-v mono">Rp 19.500.000</span></div>
          </div>

          <div class="ct-statute" style="margin-top:auto;">
            <div class="ct-statute-head">Dasar Hukum · PER-11/PJ/2025 Lampiran B</div>
            Penyerahan ke unit cabang pembeli wajib mencantumkan NITKU 22 digit sesuai lokasi pengiriman. Kesalahan NITKU memicu kode tolak <span class="mono">ERR_CT_4012</span> saat unggah batch.
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell(
    'p2',
    meta.pages[1].title,
    `<span class="e-btn">${ic('search', 11, '#1e3a8a')}Cek Direktori NITKU DJP</span>
     <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Perbaiki 4 Error XSD</span>`,
    html,
    'Inspektor Aktif: FP-041 · CV Sumber Makmur (Cabang Medan)'
  );
}

// ============================================================================
// PAGE 3: STUDIO REDLINE XML CORETAX & VALIDASI XSD v2.4 (VISUAL CENTERPIECE)
// ============================================================================
function renderPage3() {
  const leftLines = [
    { ln: 34, html: '<span class="xml-tag">&lt;TaxInvoiceBulk</span> xmlns="urn:djp:coretax:v2.4"<span class="xml-tag">&gt;</span>' },
    { ln: 35, html: '  <span class="xml-tag">&lt;TIN&gt;</span>0162849102000000<span class="xml-tag">&lt;/TIN&gt;</span>' },
    { ln: 36, html: '  <span class="xml-tag">&lt;ListOfTaxInvoice&gt;</span>' },
    { ln: 37, html: '    <span class="xml-tag">&lt;TaxInvoice&gt;</span>  <span style="color:#64748b;">&lt;!-- Baris #41: FP-041 --&gt;</span>' },
    { ln: 38, html: '      <span class="xml-tag">&lt;TaxInvoiceDate&gt;</span>2026-11-19<span class="xml-tag">&lt;/TaxInvoiceDate&gt;</span>' },
    { ln: 39, html: '      <span class="xml-tag">&lt;TaxInvoiceOpt&gt;</span>Normal<span class="xml-tag">&lt;/TaxInvoiceOpt&gt;</span>' },
    { ln: 40, html: '      <span class="xml-tag">&lt;TrxCode&gt;</span>04<span class="xml-tag">&lt;/TrxCode&gt;</span>' },
    { ln: 41, html: '      <span class="xml-tag">&lt;RefDesc&gt;</span>ACC5-INV-MDN-2026-4418<span class="xml-tag">&lt;/RefDesc&gt;</span>' },
    { ln: 42, html: '      <span class="xml-tag">&lt;SellerIdtku&gt;</span>0162849102000000000002<span class="xml-tag">&lt;/SellerIdtku&gt;</span>' },
    { ln: 43, html: '      <span class="xml-tag">&lt;BuyerTin&gt;</span>0941283741220000<span class="xml-tag">&lt;/BuyerTin&gt;</span>' },
    { ln: 44, cls: 'xml-del', html: '      <span class="xml-tag">&lt;BuyerIdtku&gt;</span><span class="xml-err-mark">0941283741220000</span><span class="xml-tag">&lt;/BuyerIdtku&gt;</span> <span style="color:#9f1239;">&lt;!-- 16d != 22d --&gt;</span>' },
    { ln: 45, html: '      <span class="xml-tag">&lt;BuyerName&gt;</span>CV SUMBER MAKMUR - CABANG MEDAN<span class="xml-tag">&lt;/BuyerName&gt;</span>' },
    { ln: 46, html: '      <span class="xml-tag">&lt;BuyerEmail&gt;</span>tax.mdn@sumbermakmur.co.id<span class="xml-tag">&lt;/BuyerEmail&gt;</span>' },
    { ln: 47, html: '      <span class="xml-tag">&lt;ListOfGoodService&gt;</span>' },
    { ln: 48, html: '        <span class="xml-tag">&lt;GoodService&gt;</span>' },
    { ln: 49, cls: 'xml-del', html: '          <span class="xml-tag">&lt;Opt&gt;</span><span class="xml-err-mark">BKP</span><span class="xml-tag">&lt;/Opt&gt;</span> <span style="color:#9f1239;">&lt;!-- Enum wajib: A | B --&gt;</span>' },
    { ln: 50, html: '          <span class="xml-tag">&lt;Code&gt;</span>730890<span class="xml-tag">&lt;/Code&gt;</span>' },
    { ln: 51, html: '          <span class="xml-tag">&lt;Name&gt;</span>Pipa Galvanis Industrial 4 Inch<span class="xml-tag">&lt;/Name&gt;</span>' },
    { ln: 52, html: '          <span class="xml-tag">&lt;Qty&gt;</span>30<span class="xml-tag">&lt;/Qty&gt;</span><span class="xml-tag">&lt;Price&gt;</span>13500000<span class="xml-tag">&lt;/Price&gt;</span>' },
    { ln: 53, cls: 'xml-del', html: '          <span class="xml-tag">&lt;OtherTaxBase&gt;</span><span class="xml-err-mark">12375000.00</span><span class="xml-tag">&lt;/OtherTaxBase&gt;</span>' },
    { ln: 54, html: '          <span class="xml-tag">&lt;VATRate&gt;</span>12<span class="xml-tag">&lt;/VATRate&gt;</span><span class="xml-tag">&lt;VAT&gt;</span>1485000<span class="xml-tag">&lt;/VAT&gt;</span>' },
    { ln: 55, html: '        <span class="xml-tag">&lt;/GoodService&gt;</span>' },
    { ln: 56, html: '        <span class="xml-tag">&lt;GoodService&gt;</span>' },
    { ln: 57, html: '          <span class="xml-tag">&lt;Opt&gt;</span>A<span class="xml-tag">&lt;/Opt&gt;</span><span class="xml-tag">&lt;Code&gt;</span>730799<span class="xml-tag">&lt;/Code&gt;</span>' },
    { ln: 58, html: '          <span class="xml-tag">&lt;Name&gt;</span>Fitting Elbow Flange 4 Inch<span class="xml-tag">&lt;/Name&gt;</span>' },
    { ln: 59, html: '          <span class="xml-tag">&lt;Qty&gt;</span>50<span class="xml-tag">&lt;/Qty&gt;</span><span class="xml-tag">&lt;Price&gt;</span>6000000<span class="xml-tag">&lt;/Price&gt;</span>' },
    { ln: 60, html: '          <span class="xml-tag">&lt;OtherTaxBase&gt;</span>5500000<span class="xml-tag">&lt;/OtherTaxBase&gt;</span><span class="xml-tag">&lt;VAT&gt;</span>660000<span class="xml-tag">&lt;/VAT&gt;</span>' },
    { ln: 61, html: '        <span class="xml-tag">&lt;/GoodService&gt;</span>' },
    { ln: 62, html: '      <span class="xml-tag">&lt;/ListOfGoodService&gt;</span>' },
    { ln: 63, html: '    <span class="xml-tag">&lt;/TaxInvoice&gt;</span>' },
  ];

  const rightLines = [
    { ln: 34, html: '<span class="xml-tag">&lt;TaxInvoiceBulk</span> xmlns="urn:djp:coretax:v2.4"<span class="xml-tag">&gt;</span>' },
    { ln: 35, html: '  <span class="xml-tag">&lt;TIN&gt;</span>0162849102000000<span class="xml-tag">&lt;/TIN&gt;</span>' },
    { ln: 36, html: '  <span class="xml-tag">&lt;ListOfTaxInvoice&gt;</span>' },
    { ln: 37, html: '    <span class="xml-tag">&lt;TaxInvoice&gt;</span>  <span style="color:#166534;">&lt;!-- Baris #41: LULUS XSD --&gt;</span>' },
    { ln: 38, html: '      <span class="xml-tag">&lt;TaxInvoiceDate&gt;</span>2026-11-19<span class="xml-tag">&lt;/TaxInvoiceDate&gt;</span>' },
    { ln: 39, html: '      <span class="xml-tag">&lt;TaxInvoiceOpt&gt;</span>Normal<span class="xml-tag">&lt;/TaxInvoiceOpt&gt;</span>' },
    { ln: 40, html: '      <span class="xml-tag">&lt;TrxCode&gt;</span>04<span class="xml-tag">&lt;/TrxCode&gt;</span>' },
    { ln: 41, html: '      <span class="xml-tag">&lt;RefDesc&gt;</span>ACC5-INV-MDN-2026-4418<span class="xml-tag">&lt;/RefDesc&gt;</span>' },
    { ln: 42, html: '      <span class="xml-tag">&lt;SellerIdtku&gt;</span>0162849102000000000002<span class="xml-tag">&lt;/SellerIdtku&gt;</span>' },
    { ln: 43, html: '      <span class="xml-tag">&lt;BuyerTin&gt;</span>0941283741220000<span class="xml-tag">&lt;/BuyerTin&gt;</span>' },
    { ln: 44, cls: 'xml-add', html: '      <span class="xml-tag">&lt;BuyerIdtku&gt;</span>0941283741220000<span class="xml-fix-mark">000002</span><span class="xml-tag">&lt;/BuyerIdtku&gt;</span>' },
    { ln: 45, html: '      <span class="xml-tag">&lt;BuyerName&gt;</span>CV SUMBER MAKMUR - CABANG MEDAN<span class="xml-tag">&lt;/BuyerName&gt;</span>' },
    { ln: 46, html: '      <span class="xml-tag">&lt;BuyerEmail&gt;</span>tax.mdn@sumbermakmur.co.id<span class="xml-tag">&lt;/BuyerEmail&gt;</span>' },
    { ln: 47, html: '      <span class="xml-tag">&lt;ListOfGoodService&gt;</span>' },
    { ln: 48, html: '        <span class="xml-tag">&lt;GoodService&gt;</span>' },
    { ln: 49, cls: 'xml-add', html: '          <span class="xml-tag">&lt;Opt&gt;</span><span class="xml-fix-mark">A</span><span class="xml-tag">&lt;/Opt&gt;</span> <span style="color:#166534;">&lt;!-- A = Barang Kena Pajak --&gt;</span>' },
    { ln: 50, html: '          <span class="xml-tag">&lt;Code&gt;</span>730890<span class="xml-tag">&lt;/Code&gt;</span>' },
    { ln: 51, html: '          <span class="xml-tag">&lt;Name&gt;</span>Pipa Galvanis Industrial 4 Inch<span class="xml-tag">&lt;/Name&gt;</span>' },
    { ln: 52, html: '          <span class="xml-tag">&lt;Qty&gt;</span>30<span class="xml-tag">&lt;/Qty&gt;</span><span class="xml-tag">&lt;Price&gt;</span>13500000<span class="xml-tag">&lt;/Price&gt;</span>' },
    { ln: 53, cls: 'xml-add', html: '          <span class="xml-tag">&lt;OtherTaxBase&gt;</span><span class="xml-fix-mark">12375000</span><span class="xml-tag">&lt;/OtherTaxBase&gt;</span>' },
    { ln: 54, html: '          <span class="xml-tag">&lt;VATRate&gt;</span>12<span class="xml-tag">&lt;/VATRate&gt;</span><span class="xml-tag">&lt;VAT&gt;</span>1485000<span class="xml-tag">&lt;/VAT&gt;</span>' },
    { ln: 55, html: '        <span class="xml-tag">&lt;/GoodService&gt;</span>' },
    { ln: 56, html: '        <span class="xml-tag">&lt;GoodService&gt;</span>' },
    { ln: 57, html: '          <span class="xml-tag">&lt;Opt&gt;</span>A<span class="xml-tag">&lt;/Opt&gt;</span><span class="xml-tag">&lt;Code&gt;</span>730799<span class="xml-tag">&lt;/Code&gt;</span>' },
    { ln: 58, html: '          <span class="xml-tag">&lt;Name&gt;</span>Fitting Elbow Flange 4 Inch<span class="xml-tag">&lt;/Name&gt;</span>' },
    { ln: 59, html: '          <span class="xml-tag">&lt;Qty&gt;</span>50<span class="xml-tag">&lt;/Qty&gt;</span><span class="xml-tag">&lt;Price&gt;</span>6000000<span class="xml-tag">&lt;/Price&gt;</span>' },
    { ln: 60, html: '          <span class="xml-tag">&lt;OtherTaxBase&gt;</span>5500000<span class="xml-tag">&lt;/OtherTaxBase&gt;</span><span class="xml-tag">&lt;VAT&gt;</span>660000<span class="xml-tag">&lt;/VAT&gt;</span>' },
    { ln: 61, html: '        <span class="xml-tag">&lt;/GoodService&gt;</span>' },
    { ln: 62, html: '      <span class="xml-tag">&lt;/ListOfGoodService&gt;</span>' },
    { ln: 63, html: '    <span class="xml-tag">&lt;/TaxInvoice&gt;</span>' },
  ];

  const errQueue = [
    { id: 'FP-041', rule: 'XSD-NITKU-22', xpath: '.../TaxInvoice[41]/BuyerIdtku', msg: 'Panjang 16 digit; wajib pola [0-9]{22}', fix: 'Tambah akhiran 000002', active: true },
    { id: 'FP-087', rule: 'XSD-OPT-CODE', xpath: '.../TaxInvoice[87]/GoodService[2]/Code', msg: 'Kode HS 6-digit kosong pada item jasa', fix: 'Map kode jasa 000000', active: false },
    { id: 'FP-112', rule: 'XSD-ROUND-04', xpath: '.../TaxInvoice[112]/OtherTaxBase', msg: 'Selisih DPP Nilai Lain Rp 18 (> toleransi Rp 1)', fix: 'Rekalkulasi 11/12 header', active: false },
    { id: 'FP-194', rule: 'XSD-ISO-DATE', xpath: '.../TaxInvoice[194]/TaxInvoiceDate', msg: 'Format DD/MM/YYYY tidak sesuai xs:date', fix: 'Konversi ke 2026-11-21', active: false },
  ];

  const html = `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#faf9f6;border:1px solid #d8d0c0;border-radius:3px;padding:6px 11px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="ct-serif" style="font-size:14px;font-weight:700;color:#161b26;">Studio Redline XML CoreTax DJP</span>
        <span class="mono" style="font-size:10px;background:#efeae0;padding:2px 7px;border-radius:2px;border:1px solid #d5ccb9;">BATCH-PKP0162-202611-OUT.xml (4,82 MB)</span>
        <span class="mono" style="font-size:10px;color:#1e3a8a;font-weight:700;">Schema: CoreTax_TaxInvoice_v2.4.xsd</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('1.244 XSD PASS', 'ok')}
        ${badge('4 XSD FAIL (3 patch di FP-041)', 'bad')}
        ${badge('Validator: .NET 9 XmlSchemaSet (42 ms)', 'info')}
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:2.05fr 1fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <section class="e-panel" style="border-color:#e5b4bd;">
            <div class="e-panel-head" style="background:#fdf2f4;border-bottom-color:#e5b4bd;">
              <div class="e-panel-title" style="color:#881337;">${ic('alert', 12, '#881337')}<span>Payload Mentah ERP · FP-041 (GAGAL XSD)</span></div>
              ${badge('3 Pelanggaran Skema', 'bad')}
            </div>
            <div class="e-panel-body-flush xml-pane" style="padding:3px 0;">
              ${leftLines.map((l) => `<div class="xml-line ${l.cls || ''}"><span class="xml-ln">${l.ln}</span><span>${l.html}</span></div>`).join('')}
            </div>
          </section>

          <section class="e-panel" style="border-color:#a7d7bc;">
            <div class="e-panel-head" style="background:#eef8f2;border-bottom-color:#a7d7bc;">
              <div class="e-panel-title" style="color:#14532d;">${ic('checkCircle', 12, '#14532d')}<span>Payload Remediasi CoreTax Bridge (LULUS XSD)</span></div>
              ${badge('XSD v2.4 PASS', 'ok')}
            </div>
            <div class="e-panel-body-flush xml-pane" style="padding:3px 0;">
              ${rightLines.map((l) => `<div class="xml-line ${l.cls || ''}"><span class="xml-ln">${l.ln}</span><span>${l.html}</span></div>`).join('')}
            </div>
          </section>
        </div>

        <section class="e-panel" style="flex:0 0 182px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('terminal', 12, '#1e3a8a')}<span>Antrean 4 Error XSD Batch Nov 2026 &amp; Verifikasi Kanonik FP-040</span></div>
            <span class="e-panel-sub mono">Auto-Patch Tersedia untuk 4 / 4 Baris</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:66px;" />
                <col style="width:105px;" />
                <col style="width:230px;" />
                <col style="width:270px;" />
                <col style="width:185px;" />
                <col style="width:94px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Faktur</th>
                  <th>Kode XSD</th>
                  <th>XPath Elemen Gagal</th>
                  <th>Diagnosis Skema CoreTax v2.4</th>
                  <th>Usulan Remediasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${errQueue.map((e) => `<tr class="${e.active ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(e.id)}</td>
                  <td class="mono" style="color:#9f1239;font-weight:700;">${esc(e.rule)}</td>
                  <td class="mono" style="font-size:9.5px;">${esc(e.xpath)}</td>
                  <td>${esc(e.msg)}</td>
                  <td style="color:#14532d;font-weight:600;">${esc(e.fix)}</td>
                  <td>${badge(e.active ? 'Sedang Diulas' : 'Siap Patch', e.active ? 'accent' : 'warn')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 282px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 12, '#1e3a8a')}<span>Definisi Skema XSD v2.4 (Baris 44, 49, 53)</span></div>
            ${badge('Strict Mode', 'accent')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
            <div style="background:#162032;color:#e2e8f0;border-radius:3px;padding:7px 9px;font-family:var(--e-mono);font-size:9.3px;line-height:1.45;">
              <div style="color:#93c5fd;">&lt;xs:simpleType name="NITKUType"&gt;</div>
              <div>&nbsp;&nbsp;&lt;xs:restriction base="xs:string"&gt;</div>
              <div style="color:#fde68a;">&nbsp;&nbsp;&nbsp;&nbsp;&lt;xs:pattern value="[0-9]{22}"/&gt;</div>
              <div>&nbsp;&nbsp;&lt;/xs:restriction&gt;</div>
              <div style="color:#93c5fd;">&lt;/xs:simpleType&gt;</div>
              <div style="color:#86efac;margin-top:4px;">&lt;!-- OtherTaxBase wajib xs:integer tanpa desimal --&gt;</div>
            </div>
            <div class="ct-kv-row"><span class="ct-kv-k">Aturan #1 (L44)</span><span class="ct-kv-v mono" style="color:#9f1239;">BuyerIdtku: 16 != 22 digit</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Aturan #2 (L49)</span><span class="ct-kv-v mono" style="color:#9f1239;">Opt: "BKP" bukan enum A|B</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Aturan #3 (L53)</span><span class="ct-kv-v mono" style="color:#9f1239;">OtherTaxBase: xs:integer</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Checksum Setelah Patch</span><span class="ct-kv-v mono" style="color:#14532d;">XSD PASS · 0 Warning</span></div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 12, '#5c4314')}<span>Panel Sitasi Regulasi &amp; Klausul Hukum</span></div>
            <span class="e-panel-sub">Formal DJP</span>
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:7px;">
            <div class="ct-statute">
              <div class="ct-statute-head">1. UU PPN Pasal 13 ayat (5) &amp; (9)</div>
              Faktur Pajak yang tidak memuat identitas pembeli lengkap dan benar (NPWP-16 &amp; NITKU-22) berstatus Faktur Pajak Tidak Lengkap dan dikenai sanksi 1% dari DPP sesuai Pasal 14 ayat (4) UU KUP.
            </div>
            <div class="ct-statute">
              <div class="ct-statute-head">2. PMK 131 Tahun 2024 Pasal 3 ayat (2)</div>
              Untuk penyerahan BKP/JKP non-mewah (Kode <span class="mono">04</span>), nilai <span class="mono">&lt;OtherTaxBase&gt;</span> dihitung sebesar 11/12 dari Harga Jual dan dibulatkan ke Rupiah penuh sebelum dikalikan PPN 12%.
            </div>
            <div class="ct-statute">
              <div class="ct-statute-head">3. PER-06/PJ/2024 · Penetapan NITKU 22-Digit</div>
              Nomor Identitas Tempat Kegiatan Usaha (NITKU) menggantikan NPWP cabang lama; elemen <span class="mono">&lt;BuyerIdtku&gt;</span> wajib tepat 22 digit numerik tanpa tanda pemisah.
            </div>
            <div class="ct-statute" style="margin-top:auto;">
              <div class="ct-statute-head">4. Bukti Output Kanonik FP-040 (Terverifikasi)</div>
              <div class="mono" style="font-size:9px;color:#14532d;margin-top:3px;word-break:break-all;">&lt;TaxInvoice&gt;&lt;TIN&gt;0162849102000000&lt;/TIN&gt;&lt;TrxCode&gt;04&lt;/TrxCode&gt;&lt;OtherTaxBase&gt;77183333&lt;/OtherTaxBase&gt;&lt;VAT&gt;9262000&lt;/VAT&gt;&lt;/TaxInvoice&gt; -&gt; XSD PASS</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p3',
    meta.pages[2].title,
    `<span class="e-btn">${ic('play', 11, '#1e3a8a')}Uji Validasi XSD Ulang</span>
     <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Terapkan Patch &amp; Kunci XML</span>`,
    html,
    'Redline Diff: FP-041 · 3 Pelanggaran Skema Teratasi'
  );
}

// ============================================================================
// PAGE 4: KALKULATOR PARITAS DPP NILAI LAIN 11/12 & GUARD PEMBULATAN
// ============================================================================
function renderPage4() {
  const sumHarga = ROUNDING_AUDIT.reduce((a, r) => a + r.hargaJual, 0);
  const sumErpDpp = ROUNDING_AUDIT.reduce((a, r) => a + r.erpDpp, 0);
  const sumCtDpp = ROUNDING_AUDIT.reduce((a, r) => a + r.ctDpp, 0);
  const sumCtPpn = ROUNDING_AUDIT.reduce((a, r) => a + r.ctPpn, 0);

  // Fixed yMax=32 (>27 max bar) and wide 880px width so bars never collide with legend
  const driftChart = svgStackedBarChart({
    width: 880,
    height: 192,
    categories: ['JKT .000', 'SBY .001', 'MDN .002', 'SMG .003', 'MKS .004', 'BPN .005'],
    yMax: 32,
    yFormat: (v) => `Rp ${Math.round(v)}`,
    series: [
      { label: 'Selisih Auto-Absorb (<= Rp 1/dok)', color: '#1e3a8a', values: [9, 6, 4, 3, 2, 0] },
      { label: 'Blokir Guard (> Rp 1/dok · FP-112)', color: '#9f1239', values: [18, 0, 0, 0, 0, 0] },
    ],
  });

  const html = `
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:8px;flex-shrink:0;">
      <div style="background:#faf9f6;border:1px solid #d5c7a7;border-left:3.5px solid #a8833e;border-radius:3px;padding:7px 11px;">
        <div class="ct-serif" style="font-size:13px;font-weight:700;color:#5c4314;">Formula Resmi DPP Nilai Lain CoreTax (PMK 131/2024)</div>
        <div class="mono" style="font-size:10.8px;font-weight:700;color:#161b26;margin-top:2px;">DPP Nilai Lain = (11 / 12) × Harga Jual &nbsp;·&nbsp; PPN = 12% × DPP = 11,00% Efektif</div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Paritas Batch (1.248 Dok)</span>${badge('99,92% Lulus', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">1.247 / 1.248</span></div>
        <div class="e-kpi-foot"><span>1 blokir pembulatan (FP-112)</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Akumulasi Drift Pembulatan</span>${badge('Batas Rp 500', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">Rp 42</span></div>
        <div class="e-kpi-foot"><span>Rp 24 absorb · Rp 18 blokir</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Mode Rounding Guard</span>${badge('Half-Up Header', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">&lt;= Rp 1 / dok</span></div>
        <div class="e-kpi-foot"><span>Sesuai CoreTax XML v2.4</span></div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.52fr 1fr;gap:9px;">
      <!-- Left -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('sliders', 12, '#1e3a8a')}<span>Audit Paritas Pembulatan ERP (Line-Sum) vs CoreTax XML (Header 11/12)</span></div>
            <span class="e-panel-sub">14 Sampel Multi-Baris</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:58px;" />
                <col style="width:168px;" />
                <col style="width:36px;" />
                <col style="width:100px;" />
                <col style="width:100px;" />
                <col style="width:100px;" />
                <col style="width:56px;" />
                <col style="width:90px;" />
                <col style="width:116px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Pembeli</th>
                  <th class="num">Brs</th>
                  <th class="num">Harga Jual</th>
                  <th class="num">DPP ERP</th>
                  <th class="num">DPP CoreTax</th>
                  <th class="num">Delta</th>
                  <th class="num">PPN 12%</th>
                  <th>Guard Action</th>
                </tr>
              </thead>
              <tbody>
                ${ROUNDING_AUDIT.map((r) => {
                  const delta = r.erpDpp - r.ctDpp;
                  return `<tr class="${r.tone === 'bad' ? 'is-bad' : ''}">
                    <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(r.code)}</td>
                    <td style="font-weight:600;">${esc(r.buyer)}</td>
                    <td class="num mono">${r.lines}</td>
                    <td class="num mono">${fmtIdr(r.hargaJual)}</td>
                    <td class="num mono">${fmtIdr(r.erpDpp)}</td>
                    <td class="num mono" style="font-weight:600;">${fmtIdr(r.ctDpp)}</td>
                    <td class="num mono" style="color:${Math.abs(delta) > 1 ? '#9f1239' : delta !== 0 ? '#1d4ed8' : '#166534'};font-weight:700;">${delta === 0 ? '0' : (delta > 0 ? '+' : '') + delta}</td>
                    <td class="num mono" style="font-weight:600;">${fmtIdr(r.ctPpn)}</td>
                    <td>${badge(r.guard, r.tone)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL 14 SAMPEL AUDIT</td>
                  <td class="num mono">${fmtIdr(sumHarga)}</td>
                  <td class="num mono">${fmtIdr(sumErpDpp)}</td>
                  <td class="num mono">${fmtIdr(sumCtDpp)}</td>
                  <td class="num mono" style="color:#9f1239;">+${sumErpDpp - sumCtDpp}</td>
                  <td class="num mono">${fmtIdr(sumCtPpn)}</td>
                  <td>${badge('1 Blokir · Rp 18', 'bad')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 236px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 12, '#1e3a8a')}<span>Distribusi Selisih Pembulatan per Cabang NITKU (Rupiah Absolut)</span></div>
            <span class="e-panel-sub mono">Total Batch Drift: Rp 42 &lt; Ambang Rp 500 (AMAN)</span>
          </div>
          <div class="e-panel-body" style="padding:6px 10px;">
            ${driftChart}
          </div>
        </section>
      </div>

      <!-- Right -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 318px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('zap', 12, '#1e3a8a')}<span>Simulasi What-If Rezim PPN (Kasus FP-040)</span></div>
            ${badge('Harga Jual Rp 84,2 jt', 'accent')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
            <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-weight:700;color:#1e3a8a;">Kode 04 · Non-Mewah DPP Nilai Lain (Aktif)</span>
                ${badge('PPN Efektif 11%', 'ok')}
              </div>
              <div class="ct-kv-row"><span class="ct-kv-k">Harga Jual (14 item logistik)</span><span class="ct-kv-v mono">Rp 84.200.000</span></div>
              <div class="ct-kv-row"><span class="ct-kv-k">11/12 × 84.200.000 (Exact Float)</span><span class="ct-kv-v mono">77.183.333,3333</span></div>
              <div class="ct-kv-row"><span class="ct-kv-k">&lt;OtherTaxBase&gt; Dibulatkan</span><span class="ct-kv-v mono" style="color:#14532d;">Rp 77.183.333</span></div>
              <div class="ct-kv-row"><span class="ct-kv-k">&lt;VAT&gt; = 12% × 77.183.333</span><span class="ct-kv-v mono" style="color:#1e3a8a;font-size:11.5px;">Rp 9.262.000</span></div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
              <div style="background:#f8f5ee;border:1px solid #dcd4c5;border-radius:3px;padding:7px;">
                <div style="font-size:9.8px;font-weight:700;color:#881337;margin-bottom:3px;">Kode 01 · BKP Mewah (12%)</div>
                <div style="font-size:9.5px;color:#5d6675;">DPP Penuh 100%</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#161b26;margin:2px 0;">PPN Rp 10.104.000</div>
                <div style="font-size:9px;color:#881337;">+Rp 842.000 vs Kode 04</div>
              </div>
              <div style="background:#f8f5ee;border:1px solid #dcd4c5;border-radius:3px;padding:7px;">
                <div style="font-size:9.8px;font-weight:700;color:#14532d;margin-bottom:3px;">Kode 07 · Kawasan Berikat</div>
                <div style="font-size:9.5px;color:#5d6675;">PPN Tidak Dipungut</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#161b26;margin:2px 0;">PPN Rp 0</div>
                <div style="font-size:9px;color:#14532d;">Wajib Endorsement BC 4.0</div>
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head" style="background:#fdf2f4;border-bottom-color:#e5b4bd;">
            <div class="e-panel-title" style="color:#881337;">${ic('alert', 12, '#881337')}<span>Bedah Anomali Pembulatan · FP-112 (34 Baris)</span></div>
            ${badge('Selisih +Rp 18', 'bad')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
            <div class="ct-kv-row"><span class="ct-kv-k">Penyebab Drift</span><span class="ct-kv-v">SAP membulatkan 11/12 per baris (34 item)</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">DPP ERP (Sum 34 Baris)</span><span class="ct-kv-v mono">Rp 43.312.518</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">DPP CoreTax Header (11/12)</span><span class="ct-kv-v mono" style="color:#14532d;">Rp 43.312.500</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Dampak PPN (ERP vs CoreTax)</span><span class="ct-kv-v mono" style="color:#9f1239;">Rp 5.197.502 vs Rp 5.197.500 (+Rp 2)</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Kebijakan Rounding Guard</span>${badge('Auto-Adjust Baris #34 (-Rp 18)', 'accent')}</div>

            <!-- Compact Drift Attribution Mini-Table -->
            <div style="border:1px solid #dfd7c7;border-radius:3px;overflow:hidden;margin-top:2px;">
              <table class="e-table">
                <colgroup>
                  <col style="width:155px;" />
                  <col style="width:76px;" />
                  <col style="width:94px;" />
                  <col style="width:94px;" />
                  <col style="width:62px;" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Kelompok Item FP-112</th>
                    <th class="num">Baris</th>
                    <th class="num">ERP Sum</th>
                    <th class="num">CoreTax</th>
                    <th class="num">Drift</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Baris #01–#18 (Suku Cadang)</td><td class="num mono">18</td><td class="num mono">Rp 22.916.678</td><td class="num mono">Rp 22.916.667</td><td class="num mono" style="color:#9f1239;">+11</td></tr>
                  <tr><td>Baris #19–#33 (Bahan Kemas)</td><td class="num mono">15</td><td class="num mono">Rp 18.791.673</td><td class="num mono">Rp 18.791.667</td><td class="num mono" style="color:#9f1239;">+6</td></tr>
                  <tr class="is-selected"><td style="font-weight:700;">Baris #34 (Penyeimbang)</td><td class="num mono">1</td><td class="num mono">Rp 1.604.167</td><td class="num mono">Rp 1.604.166</td><td class="num mono" style="color:#9f1239;">+1</td></tr>
                </tbody>
              </table>
            </div>

            <div class="ct-statute" style="margin-top:auto;">
              <div class="ct-statute-head">Jurnal Penyesuaian Otomatis (PSAK 212)</div>
              Selisih <span class="mono">Rp 2</span> pada PPN &amp; <span class="mono">Rp 18</span> pada DPP Nilai Lain otomatis diposting ke akun <span class="mono">629100 · Selisih Pembulatan Pajak</span> agar GL SAP tetap 100% cocok dengan SPT CoreTax.
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p4',
    meta.pages[3].title,
    `<span class="e-btn">${ic('sliders', 11, '#1e3a8a')}Atur Toleransi Guard</span>
     <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}Rekalkulasi FP-112 &amp; Kunci</span>`,
    html,
    'Rounding Guard: 1.247 Lulus · 1 Blokir (FP-112 +Rp 18)'
  );
}

// ============================================================================
// PAGE 5: REKONSILIASI SPT MASA PPN, RETUR & BUP-23 UNIFIKASI
// ============================================================================
function renderPage5() {
  const bupTotalRows = BUP23_GROUPS.reduce((a, b) => a + b.baris, 0);
  const bupTotalDpp = BUP23_GROUPS.reduce((a, b) => a + b.dpp, 0);
  const bupTotalPph = BUP23_GROUPS.reduce((a, b) => a + b.pph, 0);
  const totalMasukanDocs = SPT_PPN.masukanBuckets.reduce((a, b) => a + b.docs, 0);

  const glTieOut = [
    { gl: '214100', akun: 'PPN Keluaran (Bruto 1.244 Faktur)', erp: 861000000, xml: 861000000, st: 'Cocok 100%' },
    { gl: '214105', akun: 'Nota Retur Penjualan (6 Dokumen)', erp: -14200000, xml: -14200000, st: 'Cocok 100%' },
    { gl: '115200', akun: 'PPN Masukan Dikreditkan (418 Dok)', erp: -534400000, xml: -534400000, st: 'Cocok 100%' },
    { gl: '214199', akun: 'Utang PPN SPT Masa Nov 2026 (Neto)', erp: 312400000, xml: 312400000, st: 'Siap Setor' },
    { gl: '214203', akun: 'Utang PPh 23 Unifikasi (38 BUP-23)', erp: 41800000, xml: 41800000, st: 'Siap Setor' },
  ];

  const html = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex-shrink:0;">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>I. PPN Keluaran Neto</span>${badge('1.244 FP - 6 Retur', 'neutral')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(SPT_PPN.ppnKeluaranNeto)}</span></div>
        <div class="e-kpi-foot"><span>Bruto Rp 861.000.000</span><span class="mono">Retur -Rp 14.200.000</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>II. PPN Masukan Dikreditkan</span>${badge(`${totalMasukanDocs} Dokumen`, 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(SPT_PPN.ppnMasukanTotal)}</span></div>
        <div class="e-kpi-foot"><span>Nov + Okt + Agu (FM-882)</span><span class="mono">100% QR Valid</span></div>
      </div>
      <div class="e-kpi" style="border-color:#1e3a8a;background:#f0f4fc;">
        <div class="e-kpi-top"><span style="color:#1e3a8a;">III. PPN Kurang Bayar (I - II)</span>${badge('KAP 411211-100', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#1e3a8a;">${fmtIdr(SPT_PPN.ppnKurangBayar)}</span></div>
        <div class="e-kpi-foot"><span>ID Billing MPN G3 Siap</span><span class="mono">Rp 312,4 jt</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>IV. PPh 23 Unifikasi (BUP-23)</span>${badge('38 Baris · XML Siap', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtIdr(bupTotalPph)}</span></div>
        <div class="e-kpi-foot"><span>DPP Jasa Rp 2,09 M · 2%</span><span class="mono">KAP 411124-104</span></div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.08fr 1fr;gap:9px;">
      <!-- Left -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 218px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 12, '#1e3a8a')}<span>Rekonsiliasi Trial Balance ERP (SAP GL) vs XML CoreTax</span></div>
            ${badge('Selisih Rp 0', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:62px;" />
                <col style="width:230px;" />
                <col style="width:118px;" />
                <col style="width:118px;" />
                <col style="width:62px;" />
                <col style="width:94px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Akun GL</th>
                  <th>Pos Rekonsiliasi SPT Masa</th>
                  <th class="num">Saldo ERP</th>
                  <th class="num">Batch XML</th>
                  <th class="num">Selisih</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${glTieOut.map((g) => `<tr class="${g.gl === '214199' ? 'is-selected' : ''}">
                  <td class="mono" style="font-weight:700;color:#1e3a8a;">${g.gl}</td>
                  <td style="font-weight:${g.gl === '214199' ? '700' : '500'};">${esc(g.akun)}</td>
                  <td class="num mono">${g.erp < 0 ? '-' + fmtIdr(Math.abs(g.erp)) : fmtIdr(g.erp)}</td>
                  <td class="num mono">${g.xml < 0 ? '-' + fmtIdr(Math.abs(g.xml)) : fmtIdr(g.xml)}</td>
                  <td class="num mono" style="color:#166534;font-weight:700;">Rp 0</td>
                  <td>${badge(g.st, 'ok')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 176px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 12, '#1e3a8a')}<span>Komposisi Pajak Masukan Dikreditkan (Form B2)</span></div>
            <span class="e-panel-sub mono">Total: ${totalMasukanDocs} Dok · ${fmtIdr(SPT_PPN.ppnMasukanTotal)}</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:280px;" />
                <col style="width:74px;" />
                <col style="width:130px;" />
                <col style="width:120px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kelompok Masa Faktur Masukan</th>
                  <th class="num">Dokumen</th>
                  <th class="num">PPN Masukan</th>
                  <th>Status Kredit</th>
                </tr>
              </thead>
              <tbody>
                ${SPT_PPN.masukanBuckets.map((m) => `<tr class="${m.tone === 'warn' ? 'is-warn' : ''}">
                  <td style="font-weight:600;">${esc(m.label)}</td>
                  <td class="num mono">${fmtNum(m.docs)}</td>
                  <td class="num mono" style="font-weight:600;">${fmtIdr(m.ppn)}</td>
                  <td>${badge(m.status, m.tone)}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL PAJAK MASUKAN DAPAT DIKREDITKAN</td>
                  <td class="num mono">${totalMasukanDocs}</td>
                  <td class="num mono">${fmtIdr(SPT_PPN.ppnMasukanTotal)}</td>
                  <td>${badge('Rekonsiliasi OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head" style="background:#f7f1e3;border-bottom-color:#dfd1b0;">
            <div class="e-panel-title" style="color:#5c4314;">${ic('lock', 12, '#5c4314')}<span>Draf Kode Billing DJP (MPN G3) &amp; Riwayat Pelunasan NTPN</span></div>
            ${badge('Total Setor: Rp 354.200.000', 'accent')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:8px 9px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:9.3px;font-weight:700;color:#1e3a8a;">BILLING #1 · PPN (411211-100)</span>
                  ${badge('Siap Bayar', 'accent')}
                </div>
                <div class="mono" style="font-size:13.5px;font-weight:700;color:#161b26;margin:4px 0;">0312 6112 4908 4412</div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Nominal Setor</span><span class="ct-kv-v mono" style="color:#1e3a8a;">${fmtIdr(SPT_PPN.ppnKurangBayar)}</span></div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Bank Persepsi</span><span class="ct-kv-v">Bank Mandiri MPN G3</span></div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Masa / Batas Setor</span><span class="ct-kv-v mono">Nov 2026 · 31 Des</span></div>
              </div>
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:8px 9px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:9.3px;font-weight:700;color:#14532d;">BILLING #2 · PPh 23 (411124-104)</span>
                  ${badge('Siap Bayar', 'ok')}
                </div>
                <div class="mono" style="font-size:13.5px;font-weight:700;color:#161b26;margin:4px 0;">0312 6112 4908 4495</div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Nominal Setor</span><span class="ct-kv-v mono" style="color:#14532d;">${fmtIdr(bupTotalPph)}</span></div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Bank Persepsi</span><span class="ct-kv-v">Bank Mandiri MPN G3</span></div>
                <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Masa / Batas Setor</span><span class="ct-kv-v mono">Nov 2026 · 15 Des</span></div>
              </div>
            </div>

            <div style="border:1px solid #dfd7c7;border-radius:3px;overflow:hidden;margin-top:auto;">
              <table class="e-table">
                <colgroup>
                  <col style="width:94px;" />
                  <col style="width:170px;" />
                  <col style="width:146px;" />
                  <col style="width:120px;" />
                  <col style="width:96px;" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Masa Lalu</th>
                    <th>No. NTPN MPN G3</th>
                    <th>No. BPE CoreTax</th>
                    <th class="num">Total Setor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="font-weight:600;">Okt 2026</td><td class="mono">84F2A19C04E7B211</td><td class="mono">BPE-2610-0162-092</td><td class="num mono">Rp 328.900.000</td><td>${badge('Lunas · Lapor', 'ok')}</td></tr>
                  <tr><td style="font-weight:600;">Sep 2026</td><td class="mono">39C8E44A17D09B54</td><td class="mono">BPE-2609-0162-092</td><td class="num mono">Rp 294.150.000</td><td>${badge('Lunas · Lapor', 'ok')}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <!-- Right -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 342px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 12, '#1e3a8a')}<span>Bukti Potong Unifikasi PPh 23 (BUP-23 · 38 Baris)</span></div>
            ${badge('100% NPWP Vendor Aktif', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:76px;" />
                <col style="width:215px;" />
                <col style="width:44px;" />
                <col style="width:118px;" />
                <col style="width:44px;" />
                <col style="width:106px;" />
                <col style="width:76px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Kode Objek</th>
                  <th>Jenis Jasa / Penghasilan</th>
                  <th class="num">Brs</th>
                  <th class="num">Total DPP</th>
                  <th class="num">Tarif</th>
                  <th class="num">PPh 23</th>
                  <th>XML</th>
                </tr>
              </thead>
              <tbody>
                ${BUP23_GROUPS.map((g) => `<tr>
                  <td class="mono" style="font-weight:700;color:#1e3a8a;">${g.kop}</td>
                  <td style="font-weight:600;">${esc(g.nama)}</td>
                  <td class="num mono">${g.baris}</td>
                  <td class="num mono">${fmtIdr(g.dpp)}</td>
                  <td class="num mono">${g.tarif}%</td>
                  <td class="num mono" style="font-weight:700;">${fmtIdr(g.pph)}</td>
                  <td>${badge(g.status, g.tone)}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">TOTAL BUKTI POTONG UNIFIKASI (BUP-23)</td>
                  <td class="num mono">${bupTotalRows}</td>
                  <td class="num mono">${fmtIdr(bupTotalDpp)}</td>
                  <td class="num mono">2%</td>
                  <td class="num mono">${fmtIdr(bupTotalPph)}</td>
                  <td>${badge('XSD PASS', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:8px 10px;margin-top:auto;">
              <div class="ct-statute">
                <div class="ct-statute-head">Validasi Unifikasi CoreTax · BUP-23 (38 Vendor Terverifikasi)</div>
                Seluruh 38 bukti potong telah melewati uji silang status NPWP-16 / NITKU lawan transaksi serta kode objek pajak sesuai <span class="mono">CoreTax_Unifikasi_v2.4.xsd</span>. Berkas XML siap tanda tangan sertifikat elektronik DJP.
              </div>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('refresh', 12, '#881337')}<span>Daftar Nota Retur Penjualan Pengurang PPN Keluaran (6 Dok)</span></div>
            <span class="e-panel-sub mono">Total Pengurang: -Rp 14.200.000</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:94px;" />
                <col style="width:195px;" />
                <col style="width:86px;" />
                <col style="width:115px;" />
                <col style="width:105px;" />
                <col style="width:86px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>No. Retur</th>
                  <th>Pembeli</th>
                  <th>Ref. Faktur</th>
                  <th class="num">DPP Retur</th>
                  <th class="num">PPN Retur</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="mono" style="font-weight:700;">NR-2611-01</td><td>PT Sinergi Baja Prima Tbk</td><td class="mono">FP-018</td><td class="num mono">Rp 32.083.333</td><td class="num mono" style="color:#9f1239;">-Rp 3.850.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">NR-2611-02</td><td>PT Karya Pangan Sentosa</td><td class="mono">FP-024</td><td class="num mono">Rp 24.583.333</td><td class="num mono" style="color:#9f1239;">-Rp 2.950.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">NR-2611-03</td><td>PT Agro Sawit Sumatera</td><td class="mono">FP-031</td><td class="num mono">Rp 20.833.333</td><td class="num mono" style="color:#9f1239;">-Rp 2.500.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">NR-2611-04</td><td>PT Graha Konstruksi Mandiri</td><td class="mono">FP-037</td><td class="num mono">Rp 16.666.667</td><td class="num mono" style="color:#9f1239;">-Rp 2.000.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">NR-2611-05</td><td>PT Mandiri Kemasan Lestari</td><td class="mono">FP-052</td><td class="num mono">Rp 15.000.000</td><td class="num mono" style="color:#9f1239;">-Rp 1.800.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
                <tr><td class="mono" style="font-weight:700;">NR-2611-06</td><td>PT Inti Logam Nusantara</td><td class="mono">FP-061</td><td class="num mono">Rp 9.166.667</td><td class="num mono" style="color:#9f1239;">-Rp 1.100.000</td><td>${badge('Terkunci', 'ok')}</td></tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL 6 NOTA RETUR PENJUALAN</td>
                  <td class="num mono">Rp 118.333.333</td>
                  <td class="num mono" style="color:#9f1239;">-Rp 14.200.000</td>
                  <td>${badge('XML Valid', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:8px 10px;margin-top:auto;">
              <div class="ct-statute">
                <div class="ct-statute-head">Verifikasi Silang e-Retur CoreTax (PMK 65/2010 &amp; PER-11/PJ/2025)</div>
                Keenam Nota Retur telah terikat otomatis dengan nomor referensi Faktur Pajak asal dan dikonfirmasi oleh pembeli melalui portal CoreTax sehingga sah mengurangi PPN Keluaran Masa November 2026.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p5',
    meta.pages[4].title,
    `<span class="e-btn">${ic('download', 11, '#1e3a8a')}Ekspor Kertas Kerja XLSX</span>
     <span class="e-btn e-btn-primary">${ic('lock', 11, '#ffffff')}Terbitkan ID Billing MPN G3</span>`,
    html,
    'Rekonsiliasi GL vs CoreTax: Selisih Rp 0 · Total Setor Rp 354.200.000'
  );
}

// ============================================================================
// PAGE 6: OTORISASI BERJENJANG (MAKER-CHECKER-APPROVER) & TATA KELOLA DoA
// ============================================================================
function renderPage6() {
  const workflowSvg = `<svg viewBox="0 0 1540 124" width="100%" height="124" style="display:block;">
    <defs>
      <marker id="arrNavy" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e3a8a" />
      </marker>
      <marker id="arrGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
    </defs>
    <rect x="6" y="14" width="346" height="96" rx="3" fill="#eef8f2" stroke="#166534" stroke-width="1.3" />
    <rect x="6" y="14" width="346" height="22" rx="2" fill="#166534" />
    <text x="16" y="29" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">TAHAP 1 · INGEST ERP &amp; PRA-VALIDASI XSD</text>
    <text x="342" y="29" text-anchor="end" font-size="9.5" font-weight="700" fill="#bbf7d0" font-family="Consolas,monospace">SELESAI</text>
    <text x="16" y="54" font-size="11.5" font-weight="700" fill="#161b26" font-family="Georgia,serif">CoreTax Bridge Automated Engine</text>
    <text x="16" y="72" font-size="10" fill="#3b4454" font-family="Segoe UI,system-ui,sans-serif">1.248 Faktur Keluaran · 38 BUP-23 · 418 Masukan</text>
    <text x="16" y="92" font-size="9.5" fill="#166534" font-family="Consolas,monospace">22 Nov 08:15 WIB · Durasi 4,2 dtk · 4 Error Ditandai</text>
    <line x1="352" y1="62" x2="394" y2="62" stroke="#1e3a8a" stroke-width="1.8" marker-end="url(#arrNavy)" />

    <rect x="398" y="14" width="346" height="96" rx="3" fill="#eef4fd" stroke="#1e3a8a" stroke-width="1.8" />
    <rect x="398" y="14" width="346" height="22" rx="2" fill="#1e3a8a" />
    <text x="408" y="29" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">TAHAP 2 · MAKER (TAX SPECIALIST)</text>
    <text x="734" y="29" text-anchor="end" font-size="9.5" font-weight="700" fill="#fde68a" font-family="Consolas,monospace">AKTIF</text>
    <text x="408" y="54" font-size="11.5" font-weight="700" fill="#161b26" font-family="Georgia,serif">D. Kusuma, A.Md.Pjk · Tax Specialist</text>
    <text x="408" y="72" font-size="10" fill="#3b4454" font-family="Segoe UI,system-ui,sans-serif">Remediasi 4 Error XSD (FP-041 NITKU, FP-112 DPP)</text>
    <text x="408" y="92" font-size="9.5" fill="#1e3a8a" font-family="Consolas,monospace">SLA Berjalan: 02j 14m / 08j 00m · SoD Terverifikasi</text>
    <line x1="744" y1="62" x2="786" y2="62" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arrGray)" />

    <rect x="790" y="14" width="346" height="96" rx="3" fill="#faf9f6" stroke="#c4bba8" stroke-width="1.2" />
    <rect x="790" y="14" width="346" height="22" rx="2" fill="#525b6b" />
    <text x="800" y="29" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">TAHAP 3 · CHECKER (HEAD OF TAX)</text>
    <text x="1126" y="29" text-anchor="end" font-size="9.5" font-weight="700" fill="#e2e8f0" font-family="Consolas,monospace">MENUNGGU</text>
    <text x="800" y="54" font-size="11.5" font-weight="700" fill="#161b26" font-family="Georgia,serif">R. Hendrawan, BKP · Head of Tax</text>
    <text x="800" y="72" font-size="10" fill="#3b4454" font-family="Segoe UI,system-ui,sans-serif">Verifikasi Rekonsiliasi GL vs SPT &amp; Kredit FM-882</text>
    <text x="800" y="92" font-size="9.5" fill="#64748b" font-family="Consolas,monospace">Eskalasi Otomatis: &gt; 24 Jam ke VP Finance</text>
    <line x1="1136" y1="62" x2="1178" y2="62" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arrGray)" />

    <rect x="1182" y="14" width="352" height="96" rx="3" fill="#faf9f6" stroke="#a8833e" stroke-width="1.3" />
    <rect x="1182" y="14" width="352" height="22" rx="2" fill="#78581f" />
    <text x="1192" y="29" font-size="10.5" font-weight="700" fill="#ffffff" font-family="Segoe UI,system-ui,sans-serif">TAHAP 4 · APPROVER (CFO · SERTEL DJP)</text>
    <text x="1524" y="29" text-anchor="end" font-size="9.5" font-weight="700" fill="#fde68a" font-family="Consolas,monospace">TIER &gt; 250 JT</text>
    <text x="1192" y="54" font-size="11.5" font-weight="700" fill="#161b26" font-family="Georgia,serif">Ir. H. Suryaputra · Direktur Keuangan</text>
    <text x="1192" y="72" font-size="10" fill="#3b4454" font-family="Segoe UI,system-ui,sans-serif">Tanda Tangan Passphrase P12 &amp; Rilis Batch XML</text>
    <text x="1192" y="92" font-size="9.5" fill="#78581f" font-family="Consolas,monospace">Wajib untuk PPN Kurang Bayar &gt; Rp 250.000.000</text>
  </svg>`;

  const approvals = [
    { id: 'APR-2611-01', paket: 'Batch XML Faktur Keluaran Nov 2026 (1.248 dok)', nilai: 861000000, tier: 'Tier 3 (> 250 jt)', maker: 'D. Kusuma', approver: 'H. Suryaputra', sla: '02j 14m / 08j', st: 'Perbaikan Maker', tone: 'warn' },
    { id: 'APR-2611-02', paket: 'Batch XML BUP-23 Unifikasi PPh 23 (38 baris)', nilai: 41800000, tier: 'Tier 1 (< 50 jt)', maker: 'A. Pratiwi', approver: 'R. Hendrawan', sla: '01j 05m / 06j', st: 'Siap Checker', tone: 'accent' },
    { id: 'APR-2611-03', paket: 'Kredit Faktur Masukan FM-882 Masa Agu (12 dok)', nilai: 27600000, tier: 'Tier 1 (< 50 jt)', maker: 'M. Rizky', approver: 'R. Hendrawan', sla: '04j 40m / 06j', st: 'Jatuh Tempo Dekat', tone: 'bad' },
    { id: 'APR-2611-04', paket: 'Paket 6 Nota Retur Penjualan Nov 2026', nilai: 14200000, tier: 'Tier 1 (< 50 jt)', maker: 'D. Kusuma', approver: 'R. Hendrawan', sla: 'Selesai', st: 'Disetujui', tone: 'ok' },
    { id: 'APR-2611-05', paket: 'Draf Setoran PPN Kurang Bayar (MPN G3)', nilai: 312400000, tier: 'Tier 3 (> 250 jt)', maker: 'D. Kusuma', approver: 'H. Suryaputra', sla: 'Terkunci', st: 'Menunggu Batch #1', tone: 'neutral' },
    { id: 'APR-2611-06', paket: 'Override Pembulatan DPP FP-112 (-Rp 18)', nilai: 47250000, tier: 'Tier 2 (50-250 jt)', maker: 'D. Kusuma', approver: 'S. Wulandari', sla: '00j 38m / 04j', st: 'Menunggu Checker', tone: 'accent' },
    { id: 'APR-2611-07', paket: 'Koreksi Master NITKU CV Sumber Makmur (.000002)', nilai: 19500000, tier: 'Governance', maker: 'D. Kusuma', approver: 'R. Hendrawan', sla: '00j 22m / 04j', st: 'Menunggu Checker', tone: 'accent' },
    { id: 'APR-2611-08', paket: 'Kredit Faktur Masukan Masa Nov 2026 (324 dok)', nilai: 412600000, tier: 'Tier 3 (> 250 jt)', maker: 'M. Rizky', approver: 'H. Suryaputra', sla: 'Selesai', st: 'Disetujui', tone: 'ok' },
    { id: 'APR-2611-09', paket: 'Kredit Faktur Masukan Masa Okt 2026 (82 dok)', nilai: 94200000, tier: 'Tier 2 (50-250 jt)', maker: 'M. Rizky', approver: 'S. Wulandari', sla: 'Selesai', st: 'Disetujui', tone: 'ok' },
    { id: 'APR-2610-14', paket: 'SPT Masa Pembetulan Ke-1 Okt 2026 (Cabang SBY)', nilai: 68400000, tier: 'Tier 2 (50-250 jt)', maker: 'A. Pratiwi', approver: 'S. Wulandari', sla: 'Selesai', st: 'Dilaporkan DJP', tone: 'ok' },
    { id: 'APR-2610-11', paket: 'Pembaruan Master NITKU 18 Vendor Baru', nilai: 0, tier: 'Governance', maker: 'M. Rizky', approver: 'R. Hendrawan', sla: 'Selesai', st: 'Disetujui', tone: 'ok' },
    { id: 'APR-2610-08', paket: 'Setoran PPN Kurang Bayar & BPE Okt 2026', nilai: 328900000, tier: 'Tier 3 (> 250 jt)', maker: 'D. Kusuma', approver: 'H. Suryaputra', sla: 'Selesai', st: 'Lunas NTPN', tone: 'ok' },
  ];

  const html = `
    <section class="e-panel" style="flex:0 0 162px;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('gitBranch', 12, '#1e3a8a')}<span>Alur Persetujuan Berjenjang (Maker — Checker — Approver) · Batch SPT Masa Nov 2026</span></div>
        <div style="display:flex;gap:6px;">
          ${badge('Segregation of Duties (SoD): 0 Pelanggaran', 'ok')}
          ${badge('Eskalasi SLA Aktif', 'accent')}
        </div>
      </div>
      <div class="e-panel-body" style="padding:4px 10px;">
        ${workflowSvg}
      </div>
    </section>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.62fr 1fr;gap:9px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 12, '#1e3a8a')}<span>Antrean Otorisasi Paket Pajak &amp; Status SLA</span></div>
          <span class="e-panel-sub">12 Paket Aktif &amp; Historis Terkini</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:86px;" />
              <col style="width:242px;" />
              <col style="width:108px;" />
              <col style="width:104px;" />
              <col style="width:84px;" />
              <col style="width:94px;" />
              <col style="width:106px;" />
              <col style="width:120px;" />
            </colgroup>
            <thead>
              <tr>
                <th>ID Paket</th>
                <th>Deskripsi Paket Otorisasi</th>
                <th class="num">Nilai Pajak/DPP</th>
                <th>Tier DoA</th>
                <th>Maker</th>
                <th>Approver</th>
                <th>SLA Berjalan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${approvals.map((a, idx) => `<tr class="${idx === 0 ? 'is-selected' : a.tone === 'bad' ? 'is-bad' : ''}">
                <td class="mono" style="font-weight:700;color:#1e3a8a;">${esc(a.id)}</td>
                <td style="font-weight:600;">${esc(a.paket)}</td>
                <td class="num mono">${a.nilai ? fmtIdr(a.nilai) : '—'}</td>
                <td style="font-size:9.6px;color:#475569;">${esc(a.tier)}</td>
                <td>${esc(a.maker)}</td>
                <td style="font-weight:600;">${esc(a.approver)}</td>
                <td class="mono" style="font-size:9.6px;">${esc(a.sla)}</td>
                <td>${badge(a.st, a.tone)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          <div style="padding:9px 10px;margin-top:auto;border-top:1px solid #e5dfd2;background:#f7f4ec;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.3px;font-weight:700;color:#5d6675;">TIER 1 (&lt; Rp 50 Juta)</div>
                <div style="font-size:10.5px;font-weight:700;color:#161b26;margin:2px 0;">Maker → Head of Tax</div>
                <div style="font-size:9.5px;color:#5d6675;">SLA 6 jam · BUP-23, Retur, Kredit FM</div>
              </div>
              <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.3px;font-weight:700;color:#5d6675;">TIER 2 (Rp 50 jt – Rp 250 jt)</div>
                <div style="font-size:10.5px;font-weight:700;color:#161b26;margin:2px 0;">Maker → Head of Tax → VP Finance</div>
                <div style="font-size:9.5px;color:#5d6675;">SLA 12 jam · Pembetulan SPT &amp; Override</div>
              </div>
              <div style="background:#eef4fd;border:1px solid #b8c7e8;border-radius:3px;padding:7px 9px;">
                <div style="font-size:9.3px;font-weight:700;color:#1e3a8a;">TIER 3 (&gt; Rp 250 Juta / SPT Induk)</div>
                <div style="font-size:10.5px;font-weight:700;color:#1e3a8a;margin:2px 0;">Maker → Head of Tax → CFO (Sertel)</div>
                <div style="font-size:9.5px;color:#3b4454;">SLA 24 jam · Rilis XML &amp; ID Billing MPN G3</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 286px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('key', 12, '#5c4314')}<span>Brankas Sertifikat Elektronik DJP (P12 / Passphrase)</span></div>
            ${badge('HSM Aktif', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:9px 10px;display:flex;flex-direction:column;gap:5px;">
            <div style="background:#eef8f2;border:1px solid #a7d7bc;border-radius:3px;padding:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10.4px;font-weight:700;color:#14532d;">Sertifikat Penandatangan Utama</span>
                <span class="mono" style="font-size:9.5px;font-weight:700;color:#14532d;">Sisa 412 Hari</span>
              </div>
              <div class="ct-serif" style="font-size:12.5px;font-weight:700;color:#161b26;margin:3px 0;">Ir. H. Suryaputra (Direktur Keuangan)</div>
              <div class="mono" style="font-size:9.2px;color:#3b4454;">Serial: DJP-CA-2025-8841-992A-0162 · Berlaku s.d. 08 Jan 2028</div>
            </div>
            <div class="ct-kv-row"><span class="ct-kv-k">Penyimpanan Kunci Privat</span><span class="ct-kv-v">Azure Key Vault HSM (ID-JKT)</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Otentikasi Penandatanganan</span><span class="ct-kv-v">MFA TOTP + Passphrase Terpisah</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Pemegang Kuasa Cadangan (Plt.)</span><span class="ct-kv-v">S. Wulandari, SE, Ak (VP Finance)</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Status Delegasi Cuti Saat Ini</span>${badge('Tidak Aktif · CFO Hadir', 'neutral')}</div>
            <div class="ct-kv-row"><span class="ct-kv-k">Surat Kuasa Khusus DJP (PMK 229)</span><span class="ct-kv-v mono">SKK-0162/XI/2026 · Sah</span></div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('shield', 12, '#1e3a8a')}<span>Kontrol Pemisahan Tugas (SoD) &amp; Log Eskalasi</span></div>
            ${badge('Enforced', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:5px;">
            <div class="ct-kv-row"><span class="ct-kv-k">Maker tidak dapat menyetujui batch sendiri</span>${badge('Blokir Keras', 'ok')}</div>
            <div class="ct-kv-row"><span class="ct-kv-k">Edit XML setelah Checker → reset ke Tahap 2</span>${badge('Otomatis', 'ok')}</div>
            <div class="ct-kv-row"><span class="ct-kv-k">Pengingat H-5 Batas Kredit FM-882</span>${badge('Email + Teams', 'info')}</div>
            <div class="ct-kv-row"><span class="ct-kv-k">Tanda Tangan Terakhir (APR-2611-08)</span><span class="ct-kv-v mono">22 Nov 11:04 WIB</span></div>
            <div class="ct-kv-row"><span class="ct-kv-k">Rata-Rata Siklus Persetujuan Nov</span><span class="ct-kv-v mono" style="color:#166534;">03j 18m (SLA 12j)</span></div>
            <div class="ct-statute" style="margin-top:auto;">
              <div class="ct-statute-head">Kepatuhan Tata Kelola (COBIT &amp; PMK 112/2022)</div>
              Setiap persetujuan batch merekam tanda tangan kriptografis pengguna, alamat IP intranet, dan hash berkas XML ke ledger WORM sebelum tombol unggah portal CoreTax DJP dibuka.
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p6',
    meta.pages[5].title,
    `<span class="e-btn">${ic('users', 11, '#1e3a8a')}Atur Delegasi Cuti</span>
     <span class="e-btn e-btn-primary">${ic('checkCircle', 11, '#ffffff')}Setujui Paket BUP-23</span>`,
    html,
    'DoA Engine: 0 Pelanggaran SoD · Sertifikat Elektronik DJP Aktif'
  );
}

// ============================================================================
// PAGE 7: AUDIT TRAIL WORM SHA-256, KEPATUHAN DJP & KONSOL RBAC
// ============================================================================
function renderPage7() {
  const auditLogs = [
    { ts: '22 Nov 14:28:11', aktor: 'D. Kusuma (Maker)', aksi: 'XML_PATCH_PREVIEW', obj: 'FP-041 (NITKU 000002)', prev: 'a71c..9e04', curr: '9d4a..f810', st: 'CHAIN OK' },
    { ts: '22 Nov 14:19:42', aktor: 'CoreTax XSD Engine', aksi: 'XSD_VALIDATE_BATCH', obj: 'CTB-202611-OUT (1.248)', prev: '4c82..11b9', curr: 'a71c..9e04', st: 'CHAIN OK' },
    { ts: '22 Nov 13:55:08', aktor: 'R. Hendrawan (Head)', aksi: 'SPT_GL_RECONCILE', obj: 'GL 214100/115200 (Rp 0)', prev: '8f01..33d2', curr: '4c82..11b9', st: 'CHAIN OK' },
    { ts: '22 Nov 13:41:19', aktor: 'A. Pratiwi (Maker)', aksi: 'BUP23_XML_GENERATE', obj: 'BUP-23 (38 brs · 41,8 jt)', prev: '2e94..77a1', curr: '8f01..33d2', st: 'CHAIN OK' },
    { ts: '22 Nov 13:12:04', aktor: 'M. Rizky (AP Tax)', aksi: 'QR_SCAN_FM_BATCH', obj: 'FM-882 (12 dok · Agu 26)', prev: '5b30..c418', curr: '2e94..77a1', st: 'CHAIN OK' },
    { ts: '22 Nov 11:48:33', aktor: 'Rounding Guard .NET', aksi: 'ROUND_ABSORB_RULE', obj: 'FP-043, FP-071, FP-205', prev: '1d76..88e0', curr: '5b30..c418', st: 'CHAIN OK' },
    { ts: '22 Nov 11:48:31', aktor: 'Rounding Guard .NET', aksi: 'ROUND_BLOCK_ALERT', obj: 'FP-112 (+Rp 18 > Rp 1)', prev: '7a19..55f3', curr: '1d76..88e0', st: 'CHAIN OK' },
    { ts: '22 Nov 11:04:10', aktor: 'H. Suryaputra (CFO)', aksi: 'APPROVE_FM_NOV', obj: '324 Dok Masukan (412,6 jt)', prev: '3e65..09c7', curr: '7a19..55f3', st: 'CHAIN OK' },
    { ts: '22 Nov 10:22:15', aktor: 'SAP RFC Connector', aksi: 'ERP_INGEST_DELTA', obj: '844 Faktur (JKT/SBY/SMG)', prev: '9c04..61d4', curr: '3e65..09c7', st: 'CHAIN OK' },
    { ts: '22 Nov 09:40:02', aktor: 'Accurate 5 Poller', aksi: 'ERP_INGEST_DELTA', obj: '280 Faktur (MDN/BPN)', prev: '6f28..42a9', curr: '9c04..61d4', st: 'CHAIN OK' },
    { ts: '22 Nov 09:15:47', aktor: 'SQL Server CDC', aksi: 'ERP_INGEST_DELTA', obj: '124 Faktur (MKS)', prev: '0b51..e312', curr: '6f28..42a9', st: 'CHAIN OK' },
    { ts: '21 Nov 17:30:00', aktor: 'R. Hendrawan (Head)', aksi: 'APPROVE_NOTA_RETUR', obj: '6 Nota Retur (-14,2 jt)', prev: 'd412..89b5', curr: '0b51..e312', st: 'CHAIN OK' },
    { ts: '21 Nov 16:04:22', aktor: 'UU PDP Masker', aksi: 'PII_TOKENIZE_EXPORT', obj: 'Audit Pack Eksternal KAP', prev: 'e883..12c0', curr: 'd412..89b5', st: 'CHAIN OK' },
    { ts: '21 Nov 14:18:05', aktor: 'S. Wulandari (VP)', aksi: 'APPROVE_FM_OKT', obj: '82 Dok Masukan (94,2 jt)', prev: 'c310..77f4', curr: 'e883..12c0', st: 'CHAIN OK' },
    { ts: '21 Nov 11:50:19', aktor: 'NITKU Sync Job', aksi: 'DJP_DIRECTORY_SYNC', obj: '4.812 PKP Cache Diperbarui', prev: 'b902..44a1', curr: 'c310..77f4', st: 'CHAIN OK' },
    { ts: '21 Nov 08:00:01', aktor: 'WORM Verifier Cron', aksi: 'MERKLE_DAILY_SEAL', obj: 'Blok #148.904 Tersegel', prev: '771a..90e2', curr: 'b902..44a1', st: 'CHAIN OK' },
  ];

  const regs = [
    { law: 'UU KUP Pasal 28 (11)', scope: 'Retensi Arsip XML Pajak 10 Thn', control: 'PostgreSQL + S3 Object Lock', score: '100%' },
    { law: 'PMK 131/2024 & HPP', scope: 'Rumus DPP 11/12 & PPN 12%', control: 'Rounding Guard & Uji Paritas', score: '99,9%' },
    { law: 'PER-11/PJ/2025', scope: 'Skema XML v2.4 CoreTax DJP', control: 'Pra-Validasi .NET 9 XSD', score: '99,7%' },
    { law: 'PMK 112/2022 NITKU', scope: 'NPWP-16 & NITKU 22-Digit', control: 'Lookup DJP + Blokir Ekspor', score: '99,9%' },
    { law: 'UU PDP (PP 33/2026)', scope: 'Proteksi NIK/NPWP & Log Akses', control: 'Masking Kolom & AES-256', score: '100%' },
    { law: 'PMK 81/2024 CoreTax', scope: 'Tata Kelola Sertel & Kuasa', control: 'HSM MFA + SoD 3-Tingkat', score: '100%' },
    { law: 'ISO 27001 A.12.4', scope: 'Logging Imutabel & Integritas', control: 'Rantai Hash WORM SHA-256', score: '100%' },
  ];

  const rbac = [
    { role: 'Tax Specialist (Maker)', ingest: 'Ya', patch: 'Ya', approve: 'Tidak', sertel: 'Tidak', audit: 'Baca' },
    { role: 'Head of Tax (Checker)', ingest: 'Ya', patch: 'Ya', approve: 'Tier 1-2', sertel: 'Tidak', audit: 'Baca' },
    { role: 'Direktur Keuangan (CFO)', ingest: 'Baca', patch: 'Tidak', approve: 'Semua Tier', sertel: 'HSM MFA', audit: 'Baca' },
    { role: 'Auditor Internal / KAP', ingest: 'Baca', patch: 'Tidak', approve: 'Tidak', sertel: 'Tidak', audit: 'Ekspor WORM' },
    { role: 'IT ERP Administrator', ingest: 'Konfig', patch: 'Tidak', approve: 'Tidak', sertel: 'Tidak', audit: 'Sistem' },
  ];

  const html = `
    <div style="display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:8px;flex-shrink:0;">
      <div style="background:#152238;color:#f8f6f1;border:1px solid #2d3f5e;border-left:3.5px solid #a8833e;border-radius:3px;padding:7px 11px;">
        <div style="display:flex;align-items:center;gap:6px;font-size:10px;color:#fde68a;font-weight:700;">${ic('lock', 11, '#fde68a')}<span>BRANKAS BUKTI KRIPTOGRAFI WORM SHA-256 (UU KUP PS. 28 AYAT 11)</span></div>
        <div class="mono" style="font-size:10.5px;color:#e2e8f0;margin-top:3px;">Chain Head: 9d4a7c2e8b1044f1a290c8e3d771b50a4c91e6f810 · 148.920 blok imutabel</div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Integritas Rantai Hash</span>${badge('Terverifikasi', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#166534;">100,00%</span></div>
        <div class="e-kpi-foot"><span>Verifikasi terakhir 14:30 WIB</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Retensi Arsip XML Vault</span>${badge('WORM Lock', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">10 Tahun</span></div>
        <div class="e-kpi-foot"><span>4,82 GB terenkripsi AES-256</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Akses Tidak Sah (30 Hari)</span>${badge('0 Insiden', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">0</span></div>
        <div class="e-kpi-foot"><span>RBAC Least-Privilege + MFA</span></div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 1fr;gap:9px;">
      <!-- Left: 16-row Chained SHA-256 Audit Table -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('shield', 12, '#1e3a8a')}<span>Jejak Audit Imutabel (Write-Once Read-Many · Rantai SHA-256)</span></div>
          <span class="e-panel-sub mono">Append-Only PostgreSQL Tax Ledger</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:104px;" />
              <col style="width:136px;" />
              <col style="width:142px;" />
              <col style="width:184px;" />
              <col style="width:80px;" />
              <col style="width:80px;" />
              <col style="width:76px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Waktu (WIB)</th>
                <th>Aktor / Layanan</th>
                <th>Peristiwa Sistem</th>
                <th>Objek Pajak / Batch</th>
                <th>Prev Hash</th>
                <th>Curr Hash</th>
                <th>Bukti</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.map((l, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
                <td class="mono" style="font-size:9.5px;">${esc(l.ts)}</td>
                <td style="font-weight:600;">${esc(l.aktor)}</td>
                <td class="mono" style="font-size:9.4px;color:#1e3a8a;font-weight:600;">${esc(l.aksi)}</td>
                <td>${esc(l.obj)}</td>
                <td class="mono" style="font-size:9.2px;color:#64748b;">${esc(l.prev)}</td>
                <td class="mono" style="font-size:9.2px;color:#161b26;font-weight:700;">${esc(l.curr)}</td>
                <td>${badge(l.st, 'ok')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          <div style="padding:8px 10px;margin-top:auto;">
            <div class="ct-statute">
              <div class="ct-statute-head">Kesiapan Pemeriksaan Pajak DJP (SP2DK / Audit Lapangan)</div>
              Paket bukti elektronik (berkas XML terkirim, BPE/NTTE CoreTax, kertas kerja rekonsiliasi GL, dan rantai hash WORM) dapat diekspor dalam 1 klik sebagai arsip tersegel untuk pemeriksa pajak KPP Wajib Pajak Besar Dua.
            </div>
          </div>
        </div>
      </section>

      <!-- Right: Regulatory Matrix + RBAC Console + UU PDP Masking -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:0 0 296px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('fileText', 12, '#5c4314')}<span>Matriks Kepatuhan Regulasi Perpajakan &amp; Data RI</span></div>
            ${badge('7 Regulasi Aktif', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:138px;" />
                <col style="width:198px;" />
                <col style="width:186px;" />
                <col style="width:54px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Dasar Hukum</th>
                  <th>Kewajiban Inti</th>
                  <th>Kontrol Teknis</th>
                  <th class="num">Skor</th>
                </tr>
              </thead>
              <tbody>
                ${regs.map((r) => `<tr>
                  <td style="font-weight:700;color:#5c4314;">${esc(r.law)}</td>
                  <td>${esc(r.scope)}</td>
                  <td style="font-size:9.8px;color:#3b4454;">${esc(r.control)}</td>
                  <td class="num mono" style="font-weight:700;color:#166534;">${r.score}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('lock', 12, '#1e3a8a')}<span>Matriks Hak Akses RBAC &amp; Kebijakan Masking UU PDP</span></div>
            ${badge('5 Peran Aktif', 'accent')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:162px;" />
                <col style="width:68px;" />
                <col style="width:68px;" />
                <col style="width:86px;" />
                <col style="width:82px;" />
                <col style="width:94px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Peran Pengguna</th>
                  <th>Ingest</th>
                  <th>Patch</th>
                  <th>Otorisasi</th>
                  <th>Sertel</th>
                  <th>Audit</th>
                </tr>
              </thead>
              <tbody>
                ${rbac.map((u) => `<tr>
                  <td style="font-weight:600;">${esc(u.role)}</td>
                  <td>${badge(u.ingest, u.ingest === 'Tidak' ? 'neutral' : 'info')}</td>
                  <td>${badge(u.patch, u.patch === 'Ya' ? 'warn' : 'neutral')}</td>
                  <td>${badge(u.approve, u.approve === 'Tidak' ? 'neutral' : 'accent')}</td>
                  <td>${badge(u.sertel, u.sertel === 'HSM MFA' ? 'ok' : 'neutral')}</td>
                  <td style="font-size:9.8px;font-weight:600;">${esc(u.audit)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <div style="padding:8px 10px;margin-top:auto;border-top:1px solid #e5dfd2;background:#f7f4ec;display:flex;flex-direction:column;gap:4px;">
              <div style="font-size:9.3px;font-weight:700;color:#5d6675;">KEBIJAKAN MASKING PII EKSPOR (UU PDP PP 33/2026)</div>
              <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">NIK / NPWP Orang Pribadi (Vendor BUP-23)</span><span class="ct-kv-v mono">3174****0004 (Mask Eksternal)</span></div>
              <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Passphrase Sertel &amp; Kunci API ERP</span><span class="ct-kv-v mono">HSM Sealed · Zero Plaintext</span></div>
              <div class="ct-kv-row" style="font-size:9.8px;"><span class="ct-kv-k">Enkripsi At-Rest &amp; In-Transit</span><span class="ct-kv-v mono">AES-256-GCM · TLS 1.3 mTLS</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p7',
    meta.pages[6].title,
    `<span class="e-btn">${ic('checkCircle', 11, '#166534')}Verifikasi Rantai Hash</span>
     <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}Ekspor Paket Audit SP2DK</span>`,
    html,
    'WORM Vault: 148.920 Blok · Retensi 10 Thn UU KUP Ps. 28(11)'
  );
}

// ============================================================================
// PAGE 8: PEMINDAI QR FAKTUR MASUKAN MOBILE & KONSOL INTEGRASI ERP
// ============================================================================
function renderPage8() {
  const pipelineSpans = [
    { label: '1. SAP RFC / ERP Extract', start: 0, dur: 118, color: '#1e3a8a' },
    { label: '2. NITKU-22 DJP Lookup', start: 118, dur: 64, color: '#0369a1' },
    { label: '3. DPP 11/12 Rounding Guard', start: 182, dur: 19, color: '#a8833e' },
    { label: '4. CoreTax XSD v2.4 Validate', start: 201, dur: 42, color: '#166534' },
    { label: '5. PostgreSQL WORM Commit', start: 243, dur: 27, color: '#334155' },
  ];

  const qrSvg = `<svg viewBox="0 0 84 84" width="76" height="76" style="display:block;flex-shrink:0;background:#fff;padding:4px;border:1px solid #cbd5e1;border-radius:2px;">
    <rect x="4" y="4" width="22" height="22" fill="none" stroke="#161b26" stroke-width="4"/>
    <rect x="10" y="10" width="10" height="10" fill="#161b26"/>
    <rect x="58" y="4" width="22" height="22" fill="none" stroke="#161b26" stroke-width="4"/>
    <rect x="64" y="10" width="10" height="10" fill="#161b26"/>
    <rect x="4" y="58" width="22" height="22" fill="none" stroke="#161b26" stroke-width="4"/>
    <rect x="10" y="64" width="10" height="10" fill="#161b26"/>
    <rect x="34" y="6" width="6" height="6" fill="#161b26"/><rect x="44" y="6" width="6" height="12" fill="#161b26"/>
    <rect x="34" y="18" width="12" height="6" fill="#161b26"/><rect x="34" y="32" width="16" height="6" fill="#1e3a8a"/>
    <rect x="8" y="34" width="10" height="6" fill="#161b26"/><rect x="22" y="38" width="8" height="12" fill="#161b26"/>
    <rect x="56" y="34" width="10" height="10" fill="#161b26"/><rect x="70" y="36" width="10" height="6" fill="#161b26"/>
    <rect x="36" y="44" width="14" height="8" fill="#161b26"/><rect x="56" y="50" width="8" height="14" fill="#161b26"/>
    <rect x="34" y="58" width="8" height="12" fill="#161b26"/><rect x="46" y="62" width="10" height="16" fill="#161b26"/>
    <rect x="66" y="60" width="14" height="6" fill="#161b26"/><rect x="62" y="70" width="18" height="8" fill="#161b26"/>
  </svg>`;

  const recentScans = [
    { vendor: 'PT Kimia Industri Sentosa', no: '040026..1882401', ppn: 'Rp 2.450.000', time: '14:26' },
    { vendor: 'PT Armada Ekspedisi Prima', no: '040026..1882398', ppn: 'Rp 1.920.000', time: '14:19' },
    { vendor: 'PT Energi Listrik Kawasan', no: '040026..1882384', ppn: 'Rp 2.050.000', time: '14:11' },
  ];

  const html = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.24fr;gap:10px;">
      <!-- Left: Companion Mobile App Deck -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('eye', 12, '#1e3a8a')}<span>Aplikasi Pendamping AP/Pajak · Pemindai QR &amp; Radar Batas 3 Bulan</span></div>
          ${badge('iOS / Android Offline-First', 'accent')}
        </div>
        <div class="e-panel-body" style="padding:10px;display:flex;flex-direction:column;gap:9px;background:#ece6da;">
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <!-- Phone 1: Live QR Faktur Masukan Scanner -->
            <div class="ct-phone">
              <div class="ct-phone-notch">
                <span>14:32 WIB</span>
                <span>CoreTax QR · AP</span>
                <span>5G · 94%</span>
              </div>
              <div class="ct-phone-body">
                <div style="background:#152238;color:#fff;border-radius:3px;padding:7px 8px;">
                  <div style="font-size:9px;color:#93c5fd;font-weight:700;">PEMINDAI QR FAKTUR MASUKAN</div>
                  <div style="font-size:11.5px;font-weight:700;">Verifikasi XML DJP Real-Time</div>
                </div>

                <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:3px;padding:8px;display:flex;align-items:center;gap:9px;">
                  ${qrSvg}
                  <div style="min-width:0;">
                    ${badge('QR DJP SAH', 'ok')}
                    <div style="font-size:10.5px;font-weight:700;color:#161b26;margin-top:4px;">PT Baja Sejahtera Abadi</div>
                    <div class="mono" style="font-size:9px;color:#5d6675;">0400260018824109</div>
                    <div class="mono" style="font-size:11px;font-weight:700;color:#14532d;margin-top:3px;">PPN Rp 2.800.000</div>
                  </div>
                </div>

                <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:3px;padding:7px 8px;">
                  <div style="font-size:9px;font-weight:700;color:#5d6675;margin-bottom:3px;">UJI SILANG OTOMATIS</div>
                  <div class="ct-kv-row" style="font-size:9.5px;padding:2.5px 0;"><span class="ct-kv-k">Tanda Tangan DJP</span><span class="ct-kv-v" style="color:#166534;">Valid</span></div>
                  <div class="ct-kv-row" style="font-size:9.5px;padding:2.5px 0;"><span class="ct-kv-k">NPWP-16 Pembeli</span><span class="ct-kv-v" style="color:#166534;">Cocok</span></div>
                  <div class="ct-kv-row" style="font-size:9.5px;padding:2.5px 0;"><span class="ct-kv-k">Status Duplikasi</span><span class="ct-kv-v" style="color:#166534;">Unik</span></div>
                  <div class="ct-kv-row" style="font-size:9.5px;padding:2.5px 0;"><span class="ct-kv-k">PO / GR SAP AP</span><span class="ct-kv-v mono">PO-45001982</span></div>
                  <div class="ct-kv-row" style="font-size:9.5px;padding:2.5px 0;"><span class="ct-kv-k">Masa Pengkreditan</span><span class="ct-kv-v">Nov 2026</span></div>
                </div>

                <!-- Recent QR Scan Queue (fills phone cleanly) -->
                <div style="background:#f6f3ec;border:1px solid #dfd7c7;border-radius:3px;padding:6px 7px;display:flex;flex-direction:column;gap:4px;">
                  <div style="font-size:8.8px;font-weight:700;color:#5d6675;">PINDAIAN QR TERAKHIR (HARI INI)</div>
                  ${recentScans.map((s) => `<div style="background:#ffffff;border:1px solid #e5dfd2;border-radius:2px;padding:4px 6px;">
                    <div style="display:flex;justify-content:space-between;font-size:9.2px;">
                      <strong style="color:#161b26;" class="trunc">${esc(s.vendor)}</strong>
                      <span class="mono" style="color:#166534;font-weight:700;">${esc(s.ppn)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8.6px;color:#5d6675;margin-top:1px;">
                      <span class="mono">${esc(s.no)}</span>
                      <span class="mono">${esc(s.time)} WIB · SAH</span>
                    </div>
                  </div>`).join('')}
                </div>

                <div style="margin-top:auto;display:flex;flex-direction:column;gap:4px;">
                  <div class="e-btn e-btn-primary" style="width:100%;justify-content:center;height:26px;">${ic('check', 11, '#fff')}Masukkan ke Form B2 (Kredit)</div>
                  <div style="font-size:8.9px;color:#5d6675;text-align:center;">Antrean Offline Tersinkron: 418 / 418 Dok</div>
                </div>
              </div>
            </div>

            <!-- Phone 2: FM-882 3-Month Credit Window Radar -->
            <div class="ct-phone">
              <div class="ct-phone-notch">
                <span>14:32 WIB</span>
                <span>Radar FM-882</span>
                <span>5G · 94%</span>
              </div>
              <div class="ct-phone-body">
                <div style="background:#7c2d12;color:#fff;border-radius:3px;padding:7px 8px;">
                  <div style="font-size:9px;color:#fde68a;font-weight:700;">PENGINGAT BATAS 3 BULAN (PS. 9 AYAT 9)</div>
                  <div style="font-size:11.5px;font-weight:700;">FM-882 · 12 Dok Kedaluwarsa!</div>
                </div>

                <div style="background:#fdf9ee;border:1px solid #e6cf99;border-radius:3px;padding:7px 8px;">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;">
                    <span style="font-size:9.3px;font-weight:700;color:#9a5508;">TOTAL PPN BERISIKO HANGUS</span>
                    <span class="mono" style="font-size:9px;color:#9f1239;font-weight:700;">Batas 30 Nov</span>
                  </div>
                  <div class="mono" style="font-size:15px;font-weight:700;color:#161b26;margin-top:2px;">Rp 27.600.000</div>
                  <div style="font-size:9px;color:#5d6675;">Faktur Masukan Masa Pajak Agustus 2026</div>
                </div>

                <div style="display:flex;flex-direction:column;gap:5px;flex:1;min-height:0;">
                  ${FM882_GROUPS.map((g) => `<div style="background:#ffffff;border:1px solid #dfd7c7;border-radius:2px;padding:6px 7px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:9.6px;font-weight:700;color:#161b26;" class="trunc">${esc(g.vendor)}</span>
                      <span class="mono" style="font-size:9px;color:#1e3a8a;font-weight:700;">${g.docs} dok</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:9.3px;margin-top:2px;">
                      <span class="mono" style="color:#5d6675;">${esc(g.id)} · QR ${g.qr}</span>
                      <span class="mono" style="font-weight:700;color:#9a5508;">${fmtIdr(g.ppn)}</span>
                    </div>
                  </div>`).join('')}
                </div>

                <div class="ct-statute" style="padding:5px 7px;font-size:9px;">
                  <strong style="color:#5c4314;">UU PPN Ps. 9 ayat (9):</strong> Pajak Masukan dapat dikreditkan paling lambat 3 bulan setelah berakhirnya masa pajak.
                </div>

                <div class="e-btn e-btn-primary" style="width:100%;justify-content:center;height:26px;">${ic('zap', 11, '#fff')}Kreditkan 12 Dok ke Masa Nov</div>
              </div>
            </div>
          </div>

          <div style="background:#faf9f6;border:1px solid #d8d0c0;border-radius:3px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;font-size:10px;">
            <span><strong>Integrasi QR Faktur Masukan:</strong> 418 dok terverifikasi bulan ini · 0 faktur fiktif</span>
            <span class="mono" style="color:#9a5508;font-weight:700;">FM-882: 12 dok = Rp 27.600.000</span>
          </div>
        </div>
      </section>

      <!-- Right: ERP Connector Health, Pipeline Telemetry & Master Config Console -->
      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <section class="e-panel" style="flex:0 0 228px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('server', 12, '#1e3a8a')}<span>Konektor Langsung ERP &amp; File Ingest API (.NET 9 + EPPlus)</span></div>
            <span class="e-panel-sub mono">Sinkronisasi Terakhir: 14:30 WIB</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <colgroup>
                <col style="width:182px;" />
                <col style="width:180px;" />
                <col style="width:124px;" />
                <col style="width:54px;" />
                <col style="width:66px;" />
                <col style="width:62px;" />
                <col style="width:88px;" />
              </colgroup>
              <thead>
                <tr>
                  <th>Konektor ERP / Ingest</th>
                  <th>Endpoint / Host</th>
                  <th>Jadwal &amp; Mode</th>
                  <th class="num">Dok</th>
                  <th class="num">Latensi</th>
                  <th class="num">Err %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${ERP_CONNECTORS.map((c) => `<tr class="${c.tone === 'warn' ? 'is-warn' : ''}">
                  <td style="font-weight:700;">${esc(c.name)}</td>
                  <td class="mono" style="font-size:9.3px;color:#475569;">${esc(c.host)}</td>
                  <td style="font-size:9.8px;">${esc(c.mode)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtNum(c.docs)}</td>
                  <td class="num mono">${c.latencyMs} ms</td>
                  <td class="num mono">${c.errRate}</td>
                  <td>${badge(c.status, c.tone)}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">TOTAL INGEST KELUARAN (3 ERP) + BUP-23 (EPPLUS)</td>
                  <td class="num mono">1.286</td>
                  <td class="num mono">p95 184ms</td>
                  <td class="num mono">0,31%</td>
                  <td>${badge('3 OK · 1 Warn', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 214px;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 12, '#1e3a8a')}<span>Profil Latensi Pipeline Konversi ERP → XML CoreTax (Per Batch 100 Dok)</span></div>
            <span class="e-panel-sub mono">Total End-to-End: 270 ms · Target SLA &lt; 500 ms</span>
          </div>
          <div class="e-panel-body" style="padding:8px 12px;">
            ${svgSpanWaterfall({ spans: pipelineSpans, totalMs: 300, width: 760 })}
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('database', 12, '#1e3a8a')}<span>Konfigurasi Master Skema, Cache NITKU &amp; Antrean Webhook</span></div>
            ${badge('PostgreSQL 16 + Redis', 'info')}
          </div>
          <div class="e-panel-body" style="padding:9px 11px;display:flex;flex-direction:column;gap:8px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="font-size:9.4px;font-weight:700;color:#5d6675;">CACHE DIREKTORI NPWP-16 &amp; NITKU</div>
                <div class="ct-kv-row"><span class="ct-kv-k">Total Entitas Lawan Transaksi</span><span class="ct-kv-v mono">4.812 PKP</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Cache Hit Rate Lookup NITKU</span><span class="ct-kv-v mono" style="color:#166534;">98,4%</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Pemetaan Kode Barang HS 6-Digit</span><span class="ct-kv-v mono">1.640 SKU Aktif</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Jadwal Refresh Direktori DJP</span><span class="ct-kv-v mono">Setiap 02:00 WIB</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Kapasitas PostgreSQL Tax Vault</span><span style="width:120px;">${renderCapacityBar(38)}</span></div>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;border-left:1px solid #e5dfd2;padding-left:12px;">
                <div style="font-size:9.4px;font-weight:700;color:#5d6675;">TELEMETRI ANTREAN &amp; DEAD-LETTER</div>
                <div class="ct-kv-row"><span class="ct-kv-k">Webhook SAP Status Callback</span>${badge('200 OK · 99,9%', 'ok')}</div>
                <div class="ct-kv-row"><span class="ct-kv-k">Dead-Letter Queue (SQL MKS)</span>${badge('1 Pesan · FP-194', 'warn')}</div>
                <div class="ct-kv-row"><span class="ct-kv-k">Sinkronisasi EPPlus Template</span><span class="ct-kv-v mono">v2.4.1-CoreTax</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Kebijakan Retry &amp; Backoff</span><span class="ct-kv-v mono">3× Eksponensial</span></div>
                <div class="ct-kv-row"><span class="ct-kv-k">Beban CPU Worker .NET 9</span><span style="width:120px;">${renderCapacityBar(29)}</span></div>
              </div>
            </div>

            <div class="ct-statute" style="margin-top:auto;">
              <div class="ct-statute-head">Diagnostik Degraded · SQL Server AP/AR (Cabang Makassar)</div>
              Terdeteksi 1 baris format tanggal non-ISO (<span class="mono">21/11/2026</span>) pada <span class="mono">FP-194</span> yang masuk ke Dead-Letter Queue. Konektor CDC tetap mengalirkan 123 faktur lainnya secara normal tanpa menghentikan batch.
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell(
    'p8',
    meta.pages[7].title,
    `<span class="e-btn">${ic('refresh', 11, '#1e3a8a')}Sinkronkan 3 ERP Sekarang</span>
     <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}Unduh Template EPPlus v2.4</span>`,
    html,
    'ERP Ingest: 1.248 Keluaran + 38 BUP-23 · QR Masukan: 418 Terverifikasi'
  );
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
