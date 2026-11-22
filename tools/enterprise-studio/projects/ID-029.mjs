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
  id: 'ID-029',
  name: 'AlurApprove 80+',
  reference: 'SAP S/4HANA Fiori Horizon + ServiceNow Flow Designer + Workday',
  persona: 'Ir. Hendra Wijaya · VP Mining Operations · PT Nusantara Heavy Industries Tbk',
  pages: [
    { slug: 'p1', title: 'Kokpit Eksekutif & SLA 84 Aplikasi' },
    { slug: 'p2', title: 'Inbox Eksekutif & Form Key-Value Adaptif' },
    { slug: 'p3', title: 'Desainer Alur Elsa Workflow v3 & Simulasi' },
    { slug: 'p4', title: 'Matriks DoA & Substitusi Pejabat Sementara (Pjs)' },
    { slug: 'p5', title: 'Anggaran Capex/Opex, PSAK & Kepatuhan CoreTax' },
    { slug: 'p6', title: 'Katalog 84 Aplikasi & RabbitMQ Transactional Outbox' },
    { slug: 'p7', title: 'Audit Trail WORM SHA-256, ISO 27001 & UU PDP' },
    { slug: 'p8', title: 'Companion Mobile Eksekutif, Teams & WhatsApp' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P8)
// ============================================================================

const APP_DOMAINS = [
  { id: 'erp', name: 'ERP & Supply Chain', apps: 18, color: '#0f52ba', approved30d: 4210, pending: 4 },
  { id: 'fin', name: 'Finance, Tax & Treasury', apps: 14, color: '#0369a1', approved30d: 3180, pending: 3 },
  { id: 'prc', name: 'Procurement & Vendor', apps: 12, color: '#047857', approved30d: 2640, pending: 3 },
  { id: 'hr', name: 'HRIS & People Ops', apps: 16, color: '#6d28d9', approved30d: 2190, pending: 2 },
  { id: 'it', name: 'IT, IAM & Security', apps: 15, color: '#b45309', approved30d: 1740, pending: 3 },
  { id: 'lgl', name: 'Legal, GRC & HSE', apps: 9, color: '#475569', approved30d: 860, pending: 3 },
];

const ENTITIES = [
  { code: 'NHI-HE', name: 'PT Nusantara Heavy Equipment', apps: 22, pendingMine: 4, pendingOther: 2, pendingIdr: 3633000000, processed30d: 4480, slaMedianH: 3.1, slaCompliance: 96.4 },
  { code: 'TMO-MN', name: 'PT Trakindo Mining Ops', apps: 18, pendingMine: 3, pendingOther: 1, pendingIdr: 2998000000, processed30d: 3620, slaMedianH: 3.6, slaCompliance: 94.2 },
  { code: 'EDM-PW', name: 'PT Energi Daya Mandiri', apps: 14, pendingMine: 2, pendingOther: 1, pendingIdr: 1380000000, processed30d: 2410, slaMedianH: 3.4, slaCompliance: 95.8 },
  { code: 'LAB-LG', name: 'PT Logistik Alat Berat', apps: 12, pendingMine: 1, pendingOther: 1, pendingIdr: 560000000, processed30d: 1890, slaMedianH: 2.9, slaCompliance: 97.6 },
  { code: 'KFG-FN', name: 'PT Karya Finansial Grup', apps: 10, pendingMine: 1, pendingOther: 1, pendingIdr: 890000000, processed30d: 1460, slaMedianH: 3.8, slaCompliance: 93.5 },
  { code: 'HSS-HQ', name: 'Holding Shared Services', apps: 8, pendingMine: 1, pendingOther: 0, pendingIdr: 189000000, processed30d: 960, slaMedianH: 2.6, slaCompliance: 98.4 },
];

// 18 active items: 12 waiting directly on executive ("mine") + 6 parallel/Pjs ("delegated") = 18 items, Rp 9.650.000.000
const APPROVAL_ITEMS = [
  { docId: 'PO-2026-9914', code: 'SAP-PO', title: 'Capex Sparepart Excavator PC2000', source: 'Fleet-ERP', dept: 'Mining Ops', entity: 'TMO-MN', amount: 1420000000, displayVal: 'Rp 1,42 M', tier: 'Tier-3 VP', tone: 'warn', slaText: 'SLA 4j', slaPct: 78, scope: 'mine', selected: true, requester: 'Agus Rahman', submitted: '08:14 WIB', elsaInst: 'elsa-9914-v42' },
  { docId: 'TRV-2026-4418', code: 'HR-TRV', title: 'Perjalanan Dinas Audit Balikpapan', source: 'HRIS-Core', dept: '3 Karyawan', entity: 'HSS-HQ', amount: 28500000, displayVal: 'Rp 28,5 jt', tier: 'Tier-2 Mgr', tone: 'ok', slaText: 'SLA 18j', slaPct: 24, scope: 'mine', requester: 'Teguh Wibowo', submitted: '08:22 WIB', elsaInst: 'elsa-4418-v42' },
  { docId: 'INC-2026-882', code: 'IT-ACC', title: 'Akses Read-Only DB Produksi JIT (4j)', source: 'IAM-Portal', dept: 'Tiket #INC-882', entity: 'NHI-HE', amount: 0, displayVal: '4 Jam · JIT', tier: 'Review Sec', tone: 'warn', slaText: 'SLA 1j', slaPct: 86, scope: 'mine', requester: 'Fajar Nugroho', submitted: '09:05 WIB', elsaInst: 'elsa-0882-v42' },
  { docId: 'PR-2026-3105', code: 'FIN-PR', title: 'Perpanjangan Komitmen Cloud Tahunan', source: 'e-Proc', dept: '2/3 Direksi', entity: 'EDM-PW', amount: 680000000, displayVal: 'Rp 680 jt', tier: 'Teken Final', tone: 'ok', slaText: 'Elsa v3', slaPct: 35, scope: 'mine', requester: 'Dwi Prasetyo', submitted: 'Kemarin 16:40', elsaInst: 'elsa-3105-v42' },
  { docId: 'CAP-2026-7721', code: 'SAP-CPX', title: 'Overhaul Engine Dump Truck HD785-7', source: 'Fleet-ERP', dept: 'Site Sangatta', entity: 'NHI-HE', amount: 1850000000, displayVal: 'Rp 1,85 M', tier: 'Tier-4 CFO', tone: 'warn', slaText: 'SLA 2j', slaPct: 84, scope: 'mine', requester: 'Bambang H.', submitted: '07:48 WIB', elsaInst: 'elsa-7721-v42' },
  { docId: 'TAX-2026-1190', code: 'TAX-COR', title: 'Otorisasi Pembayaran PPN Masa Okt', source: 'CoreTax-Bridge', dept: 'Holding Tax', entity: 'NHI-HE', amount: 940000000, displayVal: 'Rp 940 jt', tier: 'Tier-3 VP', tone: 'ok', slaText: 'SLA 9j', slaPct: 42, scope: 'mine', requester: 'Siti Rahmawati', submitted: '07:30 WIB', elsaInst: 'elsa-1190-v42' },
  { docId: 'CNT-2026-5082', code: 'LGL-CNT', title: 'Addendum Kontrak Sewa Gudang Cakung', source: 'DMS-Legal', dept: 'Logistik', entity: 'LAB-LG', amount: 465000000, displayVal: 'Rp 465 jt', tier: 'Tier-3 VP', tone: 'ok', slaText: 'SLA 14j', slaPct: 31, scope: 'mine', requester: 'Nadia Permata', submitted: 'Kemarin 15:12', elsaInst: 'elsa-5082-v42' },
  { docId: 'PRC-2026-6640', code: 'EP-BID', title: 'Penunjukan Vendor Ban OTR 27.00R49', source: 'e-Proc', dept: 'Procurement', entity: 'TMO-MN', amount: 1120000000, displayVal: 'Rp 1,12 M', tier: 'Tier-3 VP', tone: 'bad', slaText: 'Lewat 1j', slaPct: 100, scope: 'mine', requester: 'Rina Kusuma', submitted: 'Kemarin 11:05', elsaInst: 'elsa-6640-v42', bad: true },
  { docId: 'PAM-2026-3319', code: 'IT-PAM', title: 'Elevasi Root Cluster RabbitMQ Prod', source: 'IAM-Portal', dept: 'Infra SRE', entity: 'NHI-HE', amount: 0, displayVal: '2 Jam · PAM', tier: 'Review Sec', tone: 'bad', slaText: 'SLA 35m', slaPct: 92, scope: 'mine', requester: 'Rizky Mahendra', submitted: '09:18 WIB', elsaInst: 'elsa-3319-v42', warn: true },
  { docId: 'TRE-2026-8120', code: 'FIN-TRF', title: 'Transfer Modal Kerja Cabang Banjarmasin', source: 'Treasury-H2H', dept: 'Finance Ops', entity: 'EDM-PW', amount: 750000000, displayVal: 'Rp 750 jt', tier: 'Tier-3 VP', tone: 'ok', slaText: 'SLA 6j', slaPct: 58, scope: 'mine', requester: 'Lestari Putri', submitted: '08:02 WIB', elsaInst: 'elsa-8120-v42' },
  { docId: 'HR-2026-2914', code: 'HR-REC', title: 'Persetujuan MPP 4 Senior Geotech Eng', source: 'HRIS-Core', dept: 'Talent Acq', entity: 'TMO-MN', amount: 186000000, displayVal: 'Rp 186 jt', tier: 'Tier-3 VP', tone: 'ok', slaText: 'SLA 22j', slaPct: 18, scope: 'mine', requester: 'Maya Anggraini', submitted: 'Kemarin 14:20', elsaInst: 'elsa-2914-v42' },
  { docId: 'CMM-2026-4102', code: 'OPS-WO', title: 'Kalibrasi Overhead Crane Balikpapan', source: 'Plant-CMMS', dept: 'Workshop', entity: 'HSS-HQ', amount: 142500000, displayVal: 'Rp 142,5 jt', tier: 'Tier-2 Mgr', tone: 'ok', slaText: 'SLA 16j', slaPct: 28, scope: 'mine', requester: 'Yusuf Hidayat', submitted: 'Kemarin 17:04', elsaInst: 'elsa-4102-v42' },
  // 6 Parallel / Pjs Monitored items
  { docId: 'PO-2026-9908', code: 'SAP-PO', title: 'Pembelian Pelumas Hidrolik 40 Drum', source: 'Fleet-ERP', dept: 'Site Samarinda', entity: 'TMO-MN', amount: 248000000, displayVal: 'Rp 248 jt', tier: 'Pjs Aktif', tone: 'info', slaText: 'SLA 11j', slaPct: 40, scope: 'delegated', requester: 'Dedi Kurniawan', submitted: '07:15 WIB', elsaInst: 'elsa-9908-v42' },
  { docId: 'PRC-2026-6629', code: 'EP-RFQ', title: 'Lisensi SAP Fiori & BTP Tambahan', source: 'e-Proc', dept: 'IT Corp', entity: 'NHI-HE', amount: 520000000, displayVal: 'Rp 520 jt', tier: 'Paralel 1/2', tone: 'info', slaText: 'SLA 15j', slaPct: 33, scope: 'delegated', requester: 'Dwi Prasetyo', submitted: 'Kemarin 13:50', elsaInst: 'elsa-6629-v42' },
  { docId: 'HSE-2026-1488', code: 'HSE-PTW', title: 'Izin Kerja Hot-Work Tangki Solar #4', source: 'HSE-Permit', dept: 'Site Morowali', entity: 'EDM-PW', amount: 0, displayVal: 'Safety · PTW', tier: 'Pjs Aktif', tone: 'warn', slaText: 'SLA 3j', slaPct: 75, scope: 'delegated', requester: 'Arif Budiman', submitted: '08:40 WIB', elsaInst: 'elsa-1488-v42' },
  { docId: 'FA-2026-0891', code: 'FIN-AST', title: 'Penghapusan 2 Unit Forklift Rusak Berat', source: 'FixedAsset-Pro', dept: 'Asset Mgmt', entity: 'NHI-HE', amount: 315000000, displayVal: 'Rp 315 jt', tier: 'Paralel 2/3', tone: 'ok', slaText: 'SLA 20j', slaPct: 22, scope: 'delegated', requester: 'Wahyu Saputra', submitted: 'Kemarin 10:18', elsaInst: 'elsa-0891-v42' },
  { docId: 'CRM-2026-7310', code: 'SLS-DSC', title: 'Diskon Khusus Kontrak Mining 12 Bulan', source: 'CRM-DealDesk', dept: 'Commercial', entity: 'KFG-FN', amount: 890000000, displayVal: 'Rp 890 jt', tier: 'Pjs Aktif', tone: 'warn', slaText: 'SLA 5j', slaPct: 68, scope: 'delegated', requester: 'Rama Prakasa', submitted: '06:55 WIB', elsaInst: 'elsa-7310-v42' },
  { docId: 'WMS-2026-5521', code: 'LOG-ADJ', title: 'Penyesuaian Stok Opname Suku Cadang', source: 'WMS-Bpn', dept: 'Warehouse', entity: 'LAB-LG', amount: 95000000, displayVal: 'Rp 95 jt', tier: 'Paralel 1/2', tone: 'ok', slaText: 'SLA 19j', slaPct: 26, scope: 'delegated', requester: 'Eko Purnomo', submitted: 'Kemarin 16:08', elsaInst: 'elsa-5521-v42' },
];

// Budget Encumbrance (12 cost centers; pendingApproval sums to exact Rp 9.650.000.000)
const COST_CENTERS = [
  { cc: 'CC-4101', name: 'Mining Fleet Spareparts (PC2000/HD785)', entity: 'TMO-MN', paguQ4: 18500000000, postedYtd: 12480000000, pending: 2540000000, coreTax: 'Faktur OK', tone: 'ok' },
  { cc: 'CC-4108', name: 'Heavy Engine Rebuild & Overhaul', entity: 'NHI-HE', paguQ4: 14200000000, postedYtd: 10120000000, pending: 1850000000, coreTax: 'Faktur OK', tone: 'warn' },
  { cc: 'CC-2204', name: 'Cloud, SAP BTP & Enterprise Licensing', entity: 'EDM-PW', paguQ4: 9600000000, postedYtd: 6840000000, pending: 1200000000, coreTax: 'e-Faktur', tone: 'ok' },
  { cc: 'CC-1102', name: 'Holding Tax Compliance & PPN Masa', entity: 'NHI-HE', paguQ4: 8400000000, postedYtd: 5920000000, pending: 940000000, coreTax: 'XML v2.1', tone: 'ok' },
  { cc: 'CC-5301', name: 'Commercial Rebate & Mining DealDesk', entity: 'KFG-FN', paguQ4: 6800000000, postedYtd: 4610000000, pending: 890000000, coreTax: 'Cek PPh23', tone: 'warn' },
  { cc: 'CC-3105', name: 'Treasury Cabang Kalimantan Selatan', entity: 'EDM-PW', paguQ4: 7200000000, postedYtd: 4950000000, pending: 750000000, coreTax: 'BI-FAST', tone: 'ok' },
  { cc: 'CC-6102', name: 'Logistik, Sewa Gudang & Distribusi', entity: 'LAB-LG', paguQ4: 5400000000, postedYtd: 3420000000, pending: 560000000, coreTax: 'Faktur OK', tone: 'ok' },
  { cc: 'CC-1409', name: 'Fixed Asset Write-Off & Restrukturisasi', entity: 'NHI-HE', paguQ4: 3200000000, postedYtd: 1840000000, pending: 315000000, coreTax: 'BA Aset', tone: 'info' },
  { cc: 'CC-4212', name: 'Site Samarinda Lubricants & Consumables', entity: 'TMO-MN', paguQ4: 4100000000, postedYtd: 2780000000, pending: 248000000, coreTax: 'Faktur OK', tone: 'ok' },
  { cc: 'CC-7103', name: 'Talent Acquisition & Technical MPP', entity: 'TMO-MN', paguQ4: 2900000000, postedYtd: 1960000000, pending: 186000000, coreTax: 'Non-PPN', tone: 'ok' },
  { cc: 'CC-4401', name: 'Workshop Balikpapan Calibration & Tools', entity: 'HSS-HQ', paguQ4: 2400000000, postedYtd: 1580000000, pending: 142500000, coreTax: 'Faktur OK', tone: 'ok' },
  { cc: 'CC-7208', name: 'Corporate Internal Audit & Travel', entity: 'HSS-HQ', paguQ4: 1800000000, postedYtd: 1120000000, pending: 28500000, coreTax: 'Non-PPN', tone: 'ok' },
];

// Double-Entry Pre-Posting Journal for PO-2026-9914 (Balanced exact Rupiah)
const JOURNAL_PO9914 = [
  { acct: '1420-01', desc: 'Aset Dalam Penyelesaian - Sparepart PC2000', psak: 'PSAK 16', dr: 1420000000, cr: 0 },
  { acct: '1161-01', desc: 'PPN Masukan Dapat Dikreditkan (11%)', psak: 'UU HPP', dr: 156200000, cr: 0 },
  { acct: '2110-02', desc: 'Hutang Usaha - PT Komatsu Parts Indonesia', psak: 'PSAK 71', dr: 0, cr: 1547800000 },
  { acct: '2140-03', desc: 'Utang PPh Pasal 23 Jasa & Instalasi (2%)', psak: 'CoreTax', dr: 0, cr: 28400000 },
];

// RabbitMQ Outbox 24h Telemetry (16 displayed top apps + 68 lainnya = 84 apps; sum msg24h = 48.620)
const CONNECTED_APPS = [
  { app: 'Fleet-ERP (SAP S/4HANA)', domain: 'ERP', proto: 'AMQP + REST', key: 'fleet-erp.po.*', msg24h: 8420, acked: 8418, retry: 2, dlq: 0, p95ms: 112, status: 'Aktif', tone: 'ok' },
  { app: 'e-Proc (Ariba/Coupa)', domain: 'Proc', proto: 'AMQP + HMAC', key: 'eproc.pr.*', msg24h: 6180, acked: 6176, retry: 3, dlq: 1, p95ms: 148, status: 'Aktif', tone: 'ok' },
  { app: 'HRIS-Core (SuccessFactors)', domain: 'HRIS', proto: 'AMQP + Webhook', key: 'hris.leave.*', msg24h: 5940, acked: 5939, retry: 1, dlq: 0, p95ms: 96, status: 'Aktif', tone: 'ok' },
  { app: 'IAM-Portal (SailPoint/AD)', domain: 'IT/Sec', proto: 'AMQP + gRPC', key: 'iam.jit.*', msg24h: 4810, acked: 4808, retry: 2, dlq: 0, p95ms: 74, status: 'Aktif', tone: 'ok' },
  { app: 'CoreTax-Bridge v2.1', domain: 'Finance', proto: 'AMQP + XML', key: 'tax.coretax.*', msg24h: 3290, acked: 3285, retry: 4, dlq: 1, p95ms: 194, status: 'Retry 4', tone: 'warn' },
  { app: 'Treasury-H2H (BI-FAST)', domain: 'Finance', proto: 'AMQP + ISO20022', key: 'treasury.trf.*', msg24h: 2860, acked: 2859, retry: 1, dlq: 0, p95ms: 138, status: 'Aktif', tone: 'ok' },
  { app: 'DMS-Legal ContractHub', domain: 'Legal', proto: 'AMQP + REST', key: 'legal.addendum.*', msg24h: 1940, acked: 1940, retry: 0, dlq: 0, p95ms: 121, status: 'Aktif', tone: 'ok' },
  { app: 'Plant-CMMS Balikpapan', domain: 'ERP', proto: 'AMQP + REST', key: 'cmms.wo.*', msg24h: 1780, acked: 1778, retry: 2, dlq: 0, p95ms: 162, status: 'Aktif', tone: 'ok' },
  { app: 'CRM-DealDesk Mining', domain: 'Sales', proto: 'AMQP + REST', key: 'crm.discount.*', msg24h: 1620, acked: 1618, retry: 2, dlq: 0, p95ms: 134, status: 'Aktif', tone: 'ok' },
  { app: 'HSE-Permit To Work', domain: 'HSE', proto: 'AMQP + MQTT', key: 'hse.ptw.*', msg24h: 1490, acked: 1490, retry: 0, dlq: 0, p95ms: 88, status: 'Aktif', tone: 'ok' },
  { app: 'WMS-Balikpapan Parts', domain: 'ERP', proto: 'AMQP + REST', key: 'wms.adj.*', msg24h: 1360, acked: 1358, retry: 1, dlq: 1, p95ms: 185, status: 'DLQ 1', tone: 'bad' },
  { app: 'FixedAsset-Pro IFRS', domain: 'Finance', proto: 'AMQP + REST', key: 'asset.writeoff.*', msg24h: 1120, acked: 1120, retry: 0, dlq: 0, p95ms: 109, status: 'Aktif', tone: 'ok' },
  { app: 'ITSM-ServiceDesk', domain: 'IT/Sec', proto: 'AMQP + Webhook', key: 'itsm.chg.*', msg24h: 1080, acked: 1079, retry: 1, dlq: 0, p95ms: 118, status: 'Aktif', tone: 'ok' },
  { app: 'Payroll-Engine ID', domain: 'HRIS', proto: 'AMQP + mTLS', key: 'payroll.offcycle.*', msg24h: 920, acked: 920, retry: 0, dlq: 0, p95ms: 92, status: 'Aktif', tone: 'ok' },
  { app: 'VendorPortal e-Invoice', domain: 'Proc', proto: 'AMQP + REST', key: 'vendor.inv.*', msg24h: 840, acked: 838, retry: 2, dlq: 0, p95ms: 154, status: 'Aktif', tone: 'ok' },
  { app: '68 Aplikasi Internal Lainnya', domain: 'Multi', proto: 'AMQP Topic Bus', key: '*.approval.*', msg24h: 4970, acked: 4965, retry: 3, dlq: 2, p95ms: 129, status: '68/68 Up', tone: 'ok' },
];

// Omnichannel 30-day approval reconciliation (sums to exact 14.820 approvals = sum of ENTITIES.processed30d = sum of APP_DOMAINS.approved30d)
const CHANNELS_30D = [
  { channel: 'Web Executive Inbox (SSO + MFA)', approvals: 6140, medianMin: 184, mfaPct: 100.0, sharePct: 41.4, status: 'Primer' },
  { channel: 'Mobile Companion (iOS / Android Biometrik)', approvals: 4480, medianMin: 62, mfaPct: 100.0, sharePct: 30.2, status: 'Aktif' },
  { channel: 'Microsoft Teams Adaptive Card (SSO)', approvals: 2690, medianMin: 48, mfaPct: 100.0, sharePct: 18.2, status: 'Aktif' },
  { channel: 'WhatsApp Business Deep-Link (OTP + FaceID)', approvals: 1210, medianMin: 39, mfaPct: 100.0, sharePct: 8.2, status: 'Aktif' },
  { channel: 'Email Digest Action Link (SSO Wajib)', approvals: 300, medianMin: 412, mfaPct: 100.0, sharePct: 2.0, status: 'Fallback' },
];

export function verifyMath() {
  const totalAppsDomain = APP_DOMAINS.reduce((a, d) => a + d.apps, 0);
  const totalAppsEntity = ENTITIES.reduce((a, e) => a + e.apps, 0);
  if (totalAppsDomain !== 84) throw new Error(`Math mismatch totalAppsDomain=${totalAppsDomain}`);
  if (totalAppsEntity !== 84) throw new Error(`Math mismatch totalAppsEntity=${totalAppsEntity}`);

  const mineItems = APPROVAL_ITEMS.filter((x) => x.scope === 'mine');
  const otherItems = APPROVAL_ITEMS.filter((x) => x.scope === 'delegated');
  if (mineItems.length !== 12) throw new Error(`Math mismatch mineItems=${mineItems.length}`);
  if (otherItems.length !== 6) throw new Error(`Math mismatch otherItems=${otherItems.length}`);

  const sumEntityMine = ENTITIES.reduce((a, e) => a + e.pendingMine, 0);
  const sumEntityOther = ENTITIES.reduce((a, e) => a + e.pendingOther, 0);
  if (sumEntityMine !== 12) throw new Error(`Math mismatch sumEntityMine=${sumEntityMine}`);
  if (sumEntityOther !== 6) throw new Error(`Math mismatch sumEntityOther=${sumEntityOther}`);

  const sumQueueIdr = APPROVAL_ITEMS.reduce((a, x) => a + x.amount, 0);
  const sumEntityIdr = ENTITIES.reduce((a, e) => a + e.pendingIdr, 0);
  const sumCostCenterPending = COST_CENTERS.reduce((a, c) => a + c.pending, 0);
  if (sumQueueIdr !== 9650000000) throw new Error(`Math mismatch sumQueueIdr=${sumQueueIdr}`);
  if (sumEntityIdr !== sumQueueIdr) throw new Error(`Math mismatch sumEntityIdr=${sumEntityIdr} vs ${sumQueueIdr}`);
  if (sumCostCenterPending !== sumQueueIdr) throw new Error(`Math mismatch sumCostCenterPending=${sumCostCenterPending} vs ${sumQueueIdr}`);

  const sumDomain30d = APP_DOMAINS.reduce((a, d) => a + d.approved30d, 0);
  const sumEntity30d = ENTITIES.reduce((a, e) => a + e.processed30d, 0);
  const sumChannel30d = CHANNELS_30D.reduce((a, c) => a + c.approvals, 0);
  if (sumDomain30d !== 14820) throw new Error(`Math mismatch sumDomain30d=${sumDomain30d}`);
  if (sumEntity30d !== sumDomain30d) throw new Error(`Math mismatch sumEntity30d=${sumEntity30d}`);
  if (sumChannel30d !== sumDomain30d) throw new Error(`Math mismatch sumChannel30d=${sumChannel30d}`);

  const sumDr = JOURNAL_PO9914.reduce((a, j) => a + j.dr, 0);
  const sumCr = JOURNAL_PO9914.reduce((a, j) => a + j.cr, 0);
  if (sumDr !== 1576200000 || sumCr !== sumDr) throw new Error(`Unbalanced journal Dr=${sumDr} Cr=${sumCr}`);

  const sumMsg = CONNECTED_APPS.reduce((a, x) => a + x.msg24h, 0);
  const sumAck = CONNECTED_APPS.reduce((a, x) => a + x.acked, 0);
  const sumRetry = CONNECTED_APPS.reduce((a, x) => a + x.retry, 0);
  const sumDlq = CONNECTED_APPS.reduce((a, x) => a + x.dlq, 0);
  if (sumMsg !== 48620) throw new Error(`Math mismatch sumMsg=${sumMsg}`);
  if (sumAck + sumRetry + sumDlq !== sumMsg) throw new Error(`Outbox conservation mismatch ${sumAck}+${sumRetry}+${sumDlq} != ${sumMsg}`);
}

const TOTAL_APPS = 84;
const TOTAL_MINE = APPROVAL_ITEMS.filter((x) => x.scope === 'mine').length;
const TOTAL_QUEUE_IDR = APPROVAL_ITEMS.reduce((a, x) => a + x.amount, 0);
const TOTAL_MINE_IDR = APPROVAL_ITEMS.filter((x) => x.scope === 'mine').reduce((a, x) => a + x.amount, 0);
const TOTAL_30D = APP_DOMAINS.reduce((a, d) => a + d.approved30d, 0);
const TOTAL_PAGU_Q4 = COST_CENTERS.reduce((a, c) => a + c.paguQ4, 0);
const TOTAL_POSTED_YTD = COST_CENTERS.reduce((a, c) => a + c.postedYtd, 0);
const TOTAL_MSG_24H = CONNECTED_APPS.reduce((a, x) => a + x.msg24h, 0);
const TOTAL_ACK_24H = CONNECTED_APPS.reduce((a, x) => a + x.acked, 0);
const TOTAL_RETRY_24H = CONNECTED_APPS.reduce((a, x) => a + x.retry, 0);
const TOTAL_DLQ_24H = CONNECTED_APPS.reduce((a, x) => a + x.dlq, 0);

function fmtCompactIdr(n) {
  if (n === 0) return 'Non-Fin';
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2).replace('.', ',') + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' jt';
  return fmtIdr(n);
}

// ============================================================================
// SAP FIORI HORIZON / WORKDAY LIGHT-COBALT ARCHITECTURAL SHELL (DISTINCT FROM ID-001)
// ============================================================================

const FIORI_EXTRA_CSS = `
  /* SAP S/4HANA Fiori Horizon Light-Cobalt Shell */
  .f-top-accent {
    height: 3px;
    background: #0f52ba;
    flex-shrink: 0;
  }
  .f-header {
    height: 39px;
    background: #ffffff;
    border-bottom: 1px solid #d5dde8;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .f-header-left, .f-header-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .f-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: -0.02em;
    color: #0c1c36;
    white-space: nowrap;
  }
  .f-logo-mark {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #0f52ba;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .f-divider {
    width: 1px;
    height: 18px;
    background: #d5dde8;
    flex-shrink: 0;
  }
  .f-chip {
    height: 25px;
    padding: 0 8px;
    border-radius: 4px;
    background: #f4f7fb;
    border: 1px solid #d5dde8;
    color: #1e293b;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .f-chip-accent {
    background: #e8f0fe;
    border-color: #bfdbfe;
    color: #0b3d91;
  }
  .f-chip-ok {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #047857;
  }
  .f-search {
    height: 25px;
    width: 295px;
    padding: 0 9px;
    border-radius: 4px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #64748b;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .f-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .f-user {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid #d5dde8;
  }
  .f-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #0b3d91;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Fiori Module Tab Ribbon */
  .f-nav {
    height: 32px;
    background: #f8fafd;
    border-bottom: 1px solid #d5dde8;
    padding: 0 14px;
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
    min-width: 0;
  }
  .f-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    font-size: 10.8px;
    font-weight: 600;
    color: #475569;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .f-tab.is-active {
    color: #0b3d91;
    background: #ffffff;
    border-bottom-color: #0f52ba;
    font-weight: 700;
  }
  .f-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 0.5px 4.5px;
    border-radius: 2px;
    background: #e2e8f0;
    color: #334155;
  }
  .f-tab.is-active .f-tab-cnt {
    background: #0f52ba;
    color: #ffffff;
  }
  .f-tab-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  /* Subbar & Workspace */
  .f-subbar {
    height: 34px;
    padding: 0 14px;
    background: #ffffff;
    border-bottom: 1px solid #dce3ec;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .f-workspace {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background: #eef2f6;
  }

  /* Custom Compact Utilities */
  .kv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .kv-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    padding: 5px 7px;
    min-width: 0;
  }
  .kv-lbl {
    font-size: 9.2px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 1px;
  }
  .kv-val {
    font-size: 10.8px;
    color: #0f172a;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* DoA Maker-Checker Stepper */
  .doa-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }
  .doa-step {
    border: 1px solid #d8dee6;
    border-radius: 3px;
    padding: 5px 6px;
    background: #f8fafc;
  }
  .doa-step.is-done {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }
  .doa-step.is-curr {
    background: #e8f0fe;
    border-color: #0f52ba;
  }

  /* Facet Rail */
  .facet-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3.5px 6px;
    border-radius: 3px;
    font-size: 10.3px;
    color: #334155;
  }
  .facet-item.is-active {
    background: #e8f0fe;
    color: #0b3d91;
    font-weight: 700;
  }

  /* Code / JSON Block */
  .code-box {
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #1e293b;
    border-radius: 3px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.6px;
    line-height: 1.42;
    overflow: hidden;
    white-space: pre;
  }
  .code-k { color: #7dd3fc; }
  .code-s { color: #86efac; }
  .code-n { color: #fcd34d; }
  .code-c { color: #94a3b8; }

  /* Mobile Hardware Frame (p8) - radius <= 12px for unslop strict */
  .m-device {
    width: 304px;
    height: 100%;
    background: #0f172a;
    border-radius: 12px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    border: 2px solid #334155;
    flex-shrink: 0;
  }
  .m-screen {
    flex: 1;
    min-height: 0;
    background: #f4f7fb;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .m-statusbar {
    height: 20px;
    background: #0f52ba;
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
`;

const NAV_TABS = [
  { id: 'p1', label: 'Kokpit SLA', icon: 'activity', cnt: '84' },
  { id: 'p2', label: 'Inbox Eksekutif', icon: 'checkCircle', cnt: '12', warn: true },
  { id: 'p3', label: 'Elsa Workflow', icon: 'gitBranch' },
  { id: 'p4', label: 'Matriks DoA & Pjs', icon: 'users', cnt: '4 Pjs' },
  { id: 'p5', label: 'Anggaran & CoreTax', icon: 'fileText' },
  { id: 'p6', label: '84 App & RabbitMQ', icon: 'server', cnt: '99,9%' },
  { id: 'p7', label: 'Audit WORM ISO', icon: 'shield' },
  { id: 'p8', label: 'Mobile, WA & Teams', icon: 'bell' },
];

function renderFioriShell({ activeTab, breadcrumb, pageTitle, rightActionsHtml, contentHtml, footerRight }) {
  const tabsHtml = NAV_TABS.map((t) => {
    const active = t.id === activeTab;
    return `<div class="f-tab ${active ? 'is-active' : ''}">
      ${ic(t.icon, 12, active ? '#0f52ba' : '#64748b')}
      <span>${esc(t.label)}</span>
      ${t.cnt ? `<span class="f-tab-cnt ${t.warn && !active ? 'warn' : ''}">${esc(t.cnt)}</span>` : ''}
    </div>`;
  }).join('');

  return `
    <div class="f-top-accent"></div>
    <header class="f-header">
      <div class="f-header-left">
        <div class="f-logo">
          <span class="f-logo-mark">AA</span>
          <span>AlurApprove 80+</span>
        </div>
        <span class="f-chip f-chip-accent mono">DOA v4.2</span>
        <div class="f-divider"></div>
        <div class="f-chip">
          ${ic('layers', 12, '#0f52ba')}
          <span>PT Nusantara Heavy Industries Tbk (6 Entitas)</span>
          ${ic('chevronDown', 11, '#64748b')}
        </div>
        <div class="f-chip">
          ${ic('clock', 11, '#475569')}
          <span class="mono" style="font-size:10px;">FY2026-Q4 · Nov 2026</span>
        </div>
        <div class="f-search">
          <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
            ${ic('search', 12, '#64748b')}
            <span class="trunc">Cari No. PO, Cost Center, NIK Pjs, Routing Key...</span>
          </span>
          <span class="f-kbd">Ctrl+K</span>
        </div>
      </div>
      <div class="f-header-right">
        <div class="f-chip f-chip-ok">
          <span class="dot dot-ok"></span>
          <span class="mono" style="font-size:10px;">RabbitMQ Outbox · 84/84 App</span>
        </div>
        <div class="f-user">
          <span class="f-avatar">HW</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.6px;font-weight:700;color:#0c1c36;">Ir. Hendra Wijaya</div>
            <div style="font-size:9.2px;color:#64748b;">VP Mining Ops · Tier-3 DoA</div>
          </div>
        </div>
      </div>
    </header>
    <nav class="f-nav">
      <div class="f-tabs">${tabsHtml}</div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-badge e-badge-info mono">Elsa v3.2.4</span>
        <span class="e-badge e-badge-ok mono">ISO 27001 WORM</span>
      </div>
    </nav>
    <div class="f-subbar">
      <div class="e-crumb">
        <span>AlurApprove 80+</span>
        ${ic('chevronRight', 11, '#94a3b8')}
        <span>${esc(breadcrumb)}</span>
        ${ic('chevronRight', 11, '#94a3b8')}
        <strong>${esc(pageTitle)}</strong>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">${rightActionsHtml}</div>
    </div>
    <main class="f-workspace">${contentHtml}</main>
    ${renderStatusFooter({
      leftItems: [
        '<span class="dot dot-ok"></span> .NET 9 Modular Monolith · Node JKT-PROD-01/02',
        'SQL Server 2022 AlwaysOn · Outbox Lag p95: 118 ms',
        'SSO Corporate SAML 2.0 + Biometric MFA Aktif',
      ],
      rightItems: footerRight || [
        'Matriks DoA v4.2 (SK Direksi #042/NHI/2026)',
        '22 Nov 2026 · 09:24:18 WIB',
      ],
    })}
  `;
}

// ============================================================================
// PAGE 1: KOKPIT EKSEKUTIF & SLA 84 APLIKASI
// ============================================================================
function renderP1() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(6, 1fr);">
    <div class="e-kpi" style="border-left:3px solid #b45309;">
      <div class="e-kpi-top"><span>Menunggu Aksi Anda</span>${badge('2 Kritis', 'bad')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${TOTAL_MINE} item</span>
        ${svgSparkline({ points: [18, 16, 19, 15, 14, 13, 12], color: '#b45309' })}
      </div>
      <div class="e-kpi-foot"><span>+6 dipantau (Pjs/Paralel)</span><span class="mono">Total 18</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #0f52ba;">
      <div class="e-kpi-top"><span>Nilai Eksposur Antrean</span>${badge('Q4 FY26', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">Rp 9,65 M</span>
        ${svgSparkline({ points: [7.2, 8.4, 9.1, 10.2, 8.9, 9.4, 9.65], color: '#0f52ba' })}
      </div>
      <div class="e-kpi-foot"><span>Aksi Anda: Rp 7,58 M</span><span class="mono">6 Entitas</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #047857;">
      <div class="e-kpi-top"><span>Aplikasi Terhubung</span>${badge('100% Up', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${TOTAL_APPS} app</span>
        ${svgSparkline({ points: [78, 79, 80, 81, 82, 84, 84], color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>6 domain bisnis</span><span class="mono">AMQP+REST</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #047857;">
      <div class="e-kpi-top"><span>Median SLA Eksekutif</span>${badge('Target ≤4j', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">3,4 jam</span>
        ${svgSparkline({ points: [5.2, 4.8, 4.3, 3.9, 3.7, 3.5, 3.4], color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>Turun -34% dr Q3</span><span class="mono">p95 7,8j</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #0369a1;">
      <div class="e-kpi-top"><span>Callback Outbox (24j)</span>${badge('99,94%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_MSG_24H)}</span>
        ${svgSparkline({ points: [41, 44, 43, 46, 47, 48, 48.6], color: '#0369a1' })}
      </div>
      <div class="e-kpi-foot"><span>Retry: ${TOTAL_RETRY_24H} · DLQ: ${TOTAL_DLQ_24H}</span><span class="mono">Idemp OK</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #6d28d9;">
      <div class="e-kpi-top"><span>Persetujuan 30 Hari</span>${badge('4 Pjs Aktif', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_30D)}</span>
        ${svgSparkline({ points: [420, 465, 510, 495, 530, 548, 562], color: '#6d28d9' })}
      </div>
      <div class="e-kpi-foot"><span>0 pelanggaran SoD</span><span class="mono">WORM OK</span></div>
    </div>
  </div>`;

  const trendSvg = svgMultiLineChart({
    width: 820,
    height: 215,
    xLabels: ['09 Nov', '10 Nov', '11 Nov', '12 Nov', '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
    yMin: 0,
    yMax: 800,
    yTicks: 4,
    yFormat: (v) => `${Math.round(v)}`,
    threshold: { value: 650, label: 'Kapasitas Antrean Puncak (650/hr)', color: '#b45309' },
    series: [
      { label: 'Disetujui Otomatis/Eksekutif', color: '#0f52ba', area: true, dots: true, values: [442, 498, 512, 476, 534, 412, 368, 524, 582, 548, 612, 594, 568, 624] },
      { label: 'Eskalasi SLA / Pjs', color: '#b45309', dashed: true, values: [38, 44, 51, 36, 48, 29, 22, 45, 62, 54, 71, 49, 44, 42] },
      { label: 'Ditolak / Dikembalikan', color: '#be123c', values: [18, 22, 19, 24, 21, 14, 11, 26, 29, 24, 31, 27, 23, 21] },
    ],
    annotations: [
      { index: 7, seriesIdx: 0, label: 'Closing Capex Q4 (+14% vol)', color: '#0f52ba', dy: -26 },
    ],
  });

  const stackedSvg = svgStackedBarChart({
    width: 820,
    height: 175,
    categories: ['ERP/SAP (18)', 'Fin/Tax (14)', 'e-Proc (12)', 'HRIS (16)', 'IT/IAM (15)', 'Legal/HSE (9)'],
    yFormat: (v) => fmtNum(v),
    series: [
      { label: 'Tier-1/2 Mgr', color: '#93c5fd', values: [2240, 1480, 1320, 1490, 980, 410] },
      { label: 'Tier-3 VP', color: '#0f52ba', values: [1420, 1180, 940, 560, 610, 320] },
      { label: 'Tier-4 Direksi', color: '#0c1c36', values: [550, 520, 380, 140, 150, 130] },
    ],
  });

  // Heatmap matrix: 6 entities x 5 SLA buckets
  const heatData = [
    { ent: 'PT Nusantara Heavy Eq.', c: [2, 1, 2, 1, 0], val: 'Rp 3,63 M', med: '3,1j' },
    { ent: 'PT Trakindo Mining Ops', c: [1, 2, 0, 0, 1], val: 'Rp 3,00 M', med: '3,6j' },
    { ent: 'PT Energi Daya Mandiri', c: [1, 1, 1, 0, 0], val: 'Rp 1,38 M', med: '3,4j' },
    { ent: 'PT Logistik Alat Berat', c: [0, 0, 2, 0, 0], val: 'Rp 560 jt', med: '2,9j' },
    { ent: 'PT Karya Finansial Grup', c: [0, 1, 1, 0, 0], val: 'Rp 890 jt', med: '3,8j' },
    { ent: 'Holding Shared Services', c: [0, 0, 1, 0, 0], val: 'Rp 189 jt', med: '2,6j' },
  ];
  const cellBg = (colIdx, n) => {
    if (n === 0) return 'background:#f8fafc;color:#94a3b8;';
    if (colIdx === 4) return 'background:#be123c;color:#ffffff;font-weight:700;';
    if (colIdx === 3) return 'background:#fef3c7;color:#92400e;font-weight:700;';
    if (colIdx === 0) return 'background:#dbeafe;color:#0b3d91;font-weight:700;';
    return 'background:#e8f0fe;color:#0f52ba;font-weight:700;';
  };

  const heatmapRows = heatData.map((r) => `<tr>
    <td style="font-weight:600;">${esc(r.ent)}</td>
    ${r.c.map((v, idx) => `<td class="mono" style="text-align:center;${cellBg(idx, v)}">${v}</td>`).join('')}
    <td class="num mono" style="font-weight:600;">${r.val}</td>
    <td class="num mono">${r.med}</td>
  </tr>`).join('');

  const liveFeed = [
    { time: '09:24:06', ev: 'OUTBOX_ACK', tone: 'ok', txt: 'Fleet-ERP PO-2026-9902 callback 200 OK (94ms) · exchange=approval.events' },
    { time: '09:21:44', ev: 'SLA_ALERT', tone: 'bad', txt: 'PRC-2026-6640 (Ban OTR Rp 1,12 M) lewat batas SLA 4j — eskalasi WA aktif' },
    { time: '09:18:12', ev: 'PAM_JIT', tone: 'warn', txt: 'PAM-2026-3319 elevasi root RabbitMQ menunggu approval Security + VP Infra' },
    { time: '09:11:30', ev: 'PJS_ROUTE', tone: 'info', txt: 'PO-2026-9908 dialihkan otomatis ke Pjs GM Kaltim (SK #PJS-2026-118)' },
    { time: '09:04:19', ev: 'QUORUM_2/3', tone: 'ok', txt: 'PR-2026-3105 (Komitmen Cloud Rp 680 jt) telah disetujui CFO & CIO' },
    { time: '08:52:03', ev: 'SOD_GUARD', tone: 'bad', txt: 'Blokir otomatis self-approval user d.prasetyo pada e-Proc #PRC-6629' },
    { time: '08:44:11', ev: 'TAX_VALID', tone: 'ok', txt: 'CoreTax XML v2.1 NPWP 16-digit PO-2026-9914 lolos verifikasi DJP' },
    { time: '08:36:25', ev: 'TEAMS_CARD', tone: 'accent', txt: 'Notifikasi Adaptive Card terkirim ke VP Mining Ops & CFO Holding' },
  ];

  const entityCards = ENTITIES.map((e) => `
    <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 8px;display:flex;flex-direction:column;gap:3px;min-width:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span class="mono" style="font-size:9.5px;font-weight:700;color:#0f52ba;">${esc(e.code)}</span>
        <span class="mono" style="font-size:9.3px;color:#047857;font-weight:600;">${fmtPct(e.slaCompliance)} SLA</span>
      </div>
      <div class="trunc" style="font-size:10.3px;font-weight:700;color:#0c1c36;">${esc(e.name)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.5px;color:#475569;">
        <span>${e.apps} app · <strong>${e.pendingMine + e.pendingOther}</strong> antre</span>
        <span class="mono" style="font-weight:700;color:#0f172a;">${fmtCompactIdr(e.pendingIdr)}</span>
      </div>
    </div>
  `).join('');

  const contentHtml = `
    ${kpiStrip}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.22fr 0.98fr;gap:9px;">
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1.14;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f52ba')} Tren Volume Persetujuan, Eskalasi & Penolakan (14 Hari Terakhir)</div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('Median 3,4 jam', 'ok')}
              ${badge('Total 30h: 14.820', 'accent')}
            </div>
          </div>
          <div class="e-panel-body" style="padding:6px 10px;">${trendSvg}</div>
        </div>
        <div class="e-panel" style="flex:0.96;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Distribusi Persetujuan 30 Hari per Domain Aplikasi & Tier DoA (84 Aplikasi)</div>
            <span class="e-panel-sub mono">Total = 14.820 transaksi</span>
          </div>
          <div class="e-panel-body" style="padding:5px 10px;">${stackedSvg}</div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1.02;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('clock', 13, '#b45309')} Radar Aging SLA Antrean Aktif (6 Entitas · 18 Item)</div>
            ${badge('1 Lewat SLA', 'bad')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:32%;">Entitas Grup</th>
                  <th style="width:9%;text-align:center;">&lt;2j</th>
                  <th style="width:9%;text-align:center;">2-4j</th>
                  <th style="width:10%;text-align:center;">4-12j</th>
                  <th style="width:10%;text-align:center;">12-24j</th>
                  <th style="width:9%;text-align:center;">Breach</th>
                  <th class="num" style="width:13%;">Nilai</th>
                  <th class="num" style="width:8%;">Med</th>
                </tr>
              </thead>
              <tbody>${heatmapRows}</tbody>
              <tfoot>
                <tr>
                  <td>Konsolidasi Grup (18 Item)</td>
                  <td class="mono" style="text-align:center;">4</td>
                  <td class="mono" style="text-align:center;">5</td>
                  <td class="mono" style="text-align:center;">7</td>
                  <td class="mono" style="text-align:center;">1</td>
                  <td class="mono" style="text-align:center;color:#be123c;">1</td>
                  <td class="num mono">Rp 9,65 M</td>
                  <td class="num mono">3,4j</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:auto;padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;">
              <div class="kv-box" style="background:#ffffff;"><div class="kv-lbl">Ambang Normal (&lt;4j)</div><div class="kv-val mono" style="color:#047857;">9 item · 50,0%</div></div>
              <div class="kv-box" style="background:#ffffff;"><div class="kv-lbl">Pengingat WA/Teams</div><div class="kv-val mono" style="color:#b45309;">8 item · Auto-Nudge</div></div>
              <div class="kv-box" style="background:#fff1f2;border-color:#fecdd3;"><div class="kv-lbl" style="color:#be123c;">Eskalasi Breach</div><div class="kv-val mono" style="color:#be123c;">1 item · PRC-6640</div></div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('zap', 13, '#0f52ba')} Feed Orkestrasi Real-Time (Elsa + RabbitMQ + SoD)</div>
            <span class="e-panel-sub mono">Stream Live · WIB</span>
          </div>
          <div class="e-panel-body" style="padding:6px 10px;display:flex;flex-direction:column;gap:5px;">
            ${liveFeed.map((f) => `
              <div style="display:flex;align-items:flex-start;gap:7px;padding:4px 6px;background:#f8fafc;border:1px solid #e5ebf2;border-radius:3px;">
                <span class="mono" style="font-size:9.3px;color:#64748b;flex-shrink:0;margin-top:1px;">${f.time}</span>
                <span style="flex-shrink:0;">${badge(f.ev, f.tone)}</span>
                <span class="trunc" style="font-size:10.3px;color:#1e293b;">${esc(f.txt)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(6, 1fr);gap:8px;flex-shrink:0;">${entityCards}</div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Kokpit Eksekutif & SLA 84 Aplikasi',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p1',
      breadcrumb: 'Tata Kelola Eksekutif',
      pageTitle: 'Kokpit Eksekutif & SLA 84 Aplikasi',
      rightActionsHtml: `
        <span class="e-btn">${ic('refresh', 11)} Sinkronkan 84 App</span>
        <span class="e-btn">${ic('download', 11)} Ekspor Laporan Direksi</span>
        <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Buka 12 Aksi Mendesak</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 2: INBOX EKSEKUTIF TERPADU & FORM KEY-VALUE ADAPTIF (18 ROWS + INSPECTOR)
// ============================================================================
function renderP2() {
  const facetRail = `<aside class="e-panel" style="width:186px;flex-shrink:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('filter', 12, '#0f52ba')} Filter Antrean</div>
      <span class="mono" style="font-size:9.5px;color:#0f52ba;font-weight:700;">Reset</span>
    </div>
    <div class="e-panel-body" style="padding:7px 8px;display:flex;flex-direction:column;gap:9px;">
      <div>
        <div style="font-size:9.3px;font-weight:700;color:#64748b;margin-bottom:4px;">CAKUPAN AKSI</div>
        <div class="facet-item is-active"><span>Semua Antrean Aktif</span><span class="mono">18</span></div>
        <div class="facet-item"><span>Menunggu Aksi Anda</span><span class="mono" style="color:#b45309;font-weight:700;">12</span></div>
        <div class="facet-item"><span>Delegasi Pjs / Paralel</span><span class="mono">6</span></div>
        <div class="facet-item"><span>Lewat SLA / Kritis</span><span class="mono" style="color:#be123c;font-weight:700;">3</span></div>
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
        <div style="font-size:9.3px;font-weight:700;color:#64748b;margin-bottom:4px;">DOMAIN SUMBER (84 APP)</div>
        ${APP_DOMAINS.map((d) => `
          <div class="facet-item">
            <span class="trunc" style="display:inline-flex;align-items:center;gap:5px;">
              <span style="width:6px;height:6px;border-radius:50%;background:${d.color};flex-shrink:0;"></span>
              <span class="trunc">${esc(d.name.split('&')[0].trim())}</span>
            </span>
            <span class="mono">${d.pending}</span>
          </div>
        `).join('')}
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
        <div style="font-size:9.3px;font-weight:700;color:#64748b;margin-bottom:4px;">TIER WEWENANG DOA</div>
        <div class="facet-item"><span>Tier-4 CFO / Direksi</span><span class="mono">2</span></div>
        <div class="facet-item"><span>Tier-3 VP (Anda)</span><span class="mono">7</span></div>
        <div class="facet-item"><span>Tier-2 Mgr / Review Sec</span><span class="mono">4</span></div>
        <div class="facet-item"><span>Substitusi Pjs / Paralel</span><span class="mono">5</span></div>
      </div>
      <div style="border-top:1px solid #e2e8f0;padding-top:7px;">
        <div style="font-size:9.3px;font-weight:700;color:#64748b;margin-bottom:4px;">STATUS DELEGASI PJS</div>
        <div class="kv-box" style="background:#ecfdf5;border-color:#a7f3d0;">
          <div class="kv-lbl" style="color:#047857;">Status Kehadiran HRIS</div>
          <div class="kv-val" style="color:#047857;">Aktif · Tidak Cuti</div>
          <div style="font-size:9px;color:#475569;margin-top:2px;">Jadwal Pjs berikut: 04 Des</div>
        </div>
      </div>
      <div style="margin-top:auto;background:#f8fafc;border:1px solid #d5dde8;border-radius:3px;padding:7px;">
        <div style="font-size:9.5px;font-weight:700;color:#0c1c36;margin-bottom:3px;">Plafon Wewenang Anda</div>
        <div class="mono" style="font-size:12px;font-weight:700;color:#0f52ba;">Rp 2.000.000.000</div>
        <div style="font-size:9.3px;color:#64748b;margin-top:2px;">Capex/PO Mining Ops · SK DoA v4.2. Nilai &gt; Rp 1 M paralel CFO.</div>
      </div>
    </div>
  </aside>`;

  const queueRows = APPROVAL_ITEMS.map((item, idx) => {
    const rowCls = item.selected ? 'is-selected' : item.bad ? 'is-bad' : item.warn ? 'is-warn' : '';
    const checked = idx === 0 || idx === 1 || idx === 3;
    return `<tr class="${rowCls}">
      <td style="text-align:center;"><span class="cb ${checked ? 'checked' : ''}">${checked ? ic('check', 9, '#fff') : ''}</span></td>
      <td><span class="e-badge e-badge-neutral mono" style="font-size:9.2px;">${esc(item.code)}</span></td>
      <td>
        <div class="trunc" style="font-weight:${item.selected ? '700' : '600'};color:#0c1c36;">${esc(item.title)}</div>
        <div class="trunc" style="font-size:9.2px;color:#64748b;">${esc(item.docId)} · ${esc(item.source)} · ${esc(item.dept)}</div>
      </td>
      <td class="mono" style="font-size:9.8px;">${esc(item.entity)}</td>
      <td class="num mono" style="font-weight:700;color:${item.amount >= 1e9 ? '#0b3d91' : '#0f172a'};">${esc(item.displayVal)}</td>
      <td>${badge(item.tier, item.tone)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:5px;">
          <div style="flex:1;height:5px;background:#e2e8f0;border-radius:2px;overflow:hidden;">
            <div style="width:${item.slaPct}%;height:100%;background:${item.slaPct >= 90 ? '#be123c' : item.slaPct >= 75 ? '#b45309' : '#047857'};"></div>
          </div>
          <span class="mono" style="font-size:9.3px;width:44px;text-align:right;color:${item.slaPct >= 90 ? '#be123c' : '#334155'};">${esc(item.slaText)}</span>
        </div>
      </td>
    </tr>`;
  }).join('');

  const centerQueue = `<section class="e-panel" style="flex:1;min-width:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Antrean Persetujuan Terpadu (18 Item · 12 Aksi Anda + 6 Paralel/Pjs)</div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-badge e-badge-accent mono">3 Terpilih · Rp 2,13 M</span>
        <span class="e-btn e-btn-primary" style="height:21px;font-size:10px;">${ic('check', 10, '#fff')} Setujui Terpilih (3)</span>
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table" style="font-size:10.4px;">
        <thead>
          <tr>
            <th style="width:4%;text-align:center;"><span class="cb"></span></th>
            <th style="width:10%;">Kode</th>
            <th style="width:36%;">Dokumen &amp; Aplikasi Sumber</th>
            <th style="width:10%;">Entitas</th>
            <th class="num" style="width:13%;">Nilai / Durasi</th>
            <th style="width:12%;">Tahap DoA</th>
            <th style="width:15%;">Status SLA</th>
          </tr>
        </thead>
        <tbody>${queueRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="4">Total Konsolidasi 18 Item Aktif (12 Aksi Anda: ${fmtIdr(TOTAL_MINE_IDR)} · 6 Pjs/Paralel: ${fmtIdr(TOTAL_QUEUE_IDR - TOTAL_MINE_IDR)})</td>
            <td class="num mono" style="color:#0b3d91;">${fmtCompactIdr(TOTAL_QUEUE_IDR)}</td>
            <td colspan="2" class="num mono" style="font-size:9.8px;">Exact: ${fmtIdr(TOTAL_QUEUE_IDR)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  const rightInspector = `<aside class="e-panel" style="width:438px;flex-shrink:0;">
    <div class="e-panel-head" style="background:#f0f6ff;">
      <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')} Inspektor Form Key-Value Adaptif</div>
      <span class="e-badge e-badge-warn mono">PO-2026-9914 · SLA 4j</span>
    </div>
    <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
      <div style="border-bottom:1px solid #e2e8f0;padding-bottom:7px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px;">
          <span class="e-badge e-badge-accent mono">SAP-PO · Fleet-ERP</span>
          <span class="mono" style="font-size:9.5px;color:#64748b;">Schema: capex-po-v4.json</span>
        </div>
        <div style="font-size:13px;font-weight:800;color:#0c1c36;">Capex Sparepart Excavator PC2000</div>
        <div style="font-size:10.3px;color:#475569;margin-top:2px;">Pengadaan Undercarriage &amp; Hydraulic Pump PC2000-8 Unit #EX-14 Site Sangatta (Urgent Overhaul Q4).</div>
      </div>

      <div>
        <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">DATA FORM DINAMIS (RENDER OTOMATIS DARI PAYLOAD RABBITMQ)</div>
        <div class="kv-grid">
          <div class="kv-box"><div class="kv-lbl">Nilai PO (Excl. PPN 11%)</div><div class="kv-val mono" style="color:#0b3d91;">Rp 1.420.000.000</div></div>
          <div class="kv-box"><div class="kv-lbl">Total Bruto (+PPN -PPh23)</div><div class="kv-val mono">Rp 1.547.800.000</div></div>
          <div class="kv-box"><div class="kv-lbl">Vendor Terdaftar</div><div class="kv-val">PT Komatsu Parts Indonesia</div></div>
          <div class="kv-box"><div class="kv-lbl">NPWP 16-Digit (CoreTax)</div><div class="kv-val mono">0130-4821-9041-0000</div></div>
          <div class="kv-box"><div class="kv-lbl">Cost Center / WBS</div><div class="kv-val mono">CC-4101 · WBS-MN-26Q4</div></div>
          <div class="kv-box"><div class="kv-lbl">Pemohon / Dept</div><div class="kv-val">Agus Rahman · Mining Ops</div></div>
        </div>
      </div>

      <div style="background:#f8fafc;border:1px solid #d5dde8;border-radius:3px;padding:7px 8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;margin-bottom:4px;">
          <span style="font-weight:700;color:#0c1c36;">Ketersediaan Pagu Capex CC-4101 (Q4)</span>
          <span class="mono" style="color:#047857;font-weight:700;">Sisa Rp 3,48 M · Aman</span>
        </div>
        ${renderCapacityBar(81.2, { warnAt: 75, critAt: 90 })}
        <div style="display:flex;justify-content:space-between;font-size:9.2px;color:#64748b;margin-top:3px;">
          <span>Posted: Rp 12,48 M</span>
          <span>Pending (+PO ini): Rp 2,54 M</span>
          <span>Pagu: Rp 18,50 M</span>
        </div>
      </div>

      <div>
        <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">JEJAK DOA MAKER-CHECKER-APPROVER (ELSA INSTANCE #9914)</div>
        <div class="doa-stepper">
          <div class="doa-step is-done">
            <div style="font-size:9px;font-weight:700;color:#047857;">1. MAKER</div>
            <div class="trunc" style="font-size:10px;font-weight:700;">Agus R.</div>
            <div class="mono" style="font-size:8.8px;color:#047857;">08:14 OK</div>
          </div>
          <div class="doa-step is-done">
            <div style="font-size:9px;font-weight:700;color:#047857;">2. CHECKER</div>
            <div class="trunc" style="font-size:10px;font-weight:700;">Rina K.</div>
            <div class="mono" style="font-size:8.8px;color:#047857;">08:41 OK</div>
          </div>
          <div class="doa-step is-curr">
            <div style="font-size:9px;font-weight:700;color:#0f52ba;">3. TIER-3 VP</div>
            <div class="trunc" style="font-size:10px;font-weight:700;">Hendra W.</div>
            <div class="mono" style="font-size:8.8px;color:#b45309;">Menunggu</div>
          </div>
          <div class="doa-step">
            <div style="font-size:9px;font-weight:700;color:#64748b;">4. TIER-4 CFO</div>
            <div class="trunc" style="font-size:10px;font-weight:700;">Budi S.</div>
            <div class="mono" style="font-size:8.8px;color:#64748b;">&gt;Rp 1M</div>
          </div>
        </div>
      </div>

      <div>
        <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">LAMPIRAN TERVERIFIKASI (SHA-256) &amp; NOTIFIKASI</div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;font-size:10px;">
            <span style="display:inline-flex;align-items:center;gap:5px;">${ic('fileText', 11, '#0f52ba')} <strong>RFQ_Komatsu_PC2000_Rev2.pdf</strong></span>
            <span class="mono" style="font-size:9px;color:#047857;">2,4 MB · Valid</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;font-size:10px;">
            <span style="display:inline-flex;align-items:center;gap:5px;">${ic('fileText', 11, '#0f52ba')} <strong>BA_Kerusakan_Hydraulic_EX14.pdf</strong></span>
            <span class="mono" style="font-size:9px;color:#047857;">1,1 MB · Valid</span>
          </div>
        </div>
      </div>

      <div style="background:#f8fafc;border:1px solid #d5dde8;border-left:3px solid #047857;border-radius:3px;padding:6px 8px;">
        <div style="display:flex;justify-content:space-between;font-size:9.3px;margin-bottom:2px;">
          <span style="font-weight:700;color:#0c1c36;">Catatan Checker · Rina Kusuma (Procurement)</span>
          <span class="mono" style="color:#64748b;">08:41 WIB</span>
        </div>
        <div style="font-size:9.8px;color:#334155;line-height:1.35;">Harga kontrak sole-agent sesuai katalog Q4 (-4,2% vs penawaran awal). Stok Sangatta kritis, mohon prioritas approval sebelum 12:00 WIB.</div>
      </div>

      <div style="margin-top:auto;border-top:1px solid #d5dde8;padding-top:8px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.6px;color:#475569;">
          <span>Callback: <span class="mono" style="color:#0c1c36;font-weight:600;">fleet-erp.po.approved</span></span>
          <span>Notif: WA + MS Teams</span>
        </div>
        <div style="display:grid;grid-template-columns:1.25fr 1fr 0.8fr;gap:6px;">
          <span class="e-btn e-btn-primary" style="justify-content:center;height:28px;">${ic('check', 12, '#fff')} Setujui (MFA)</span>
          <span class="e-btn" style="justify-content:center;height:28px;">${ic('users', 12, '#0f52ba')} Delegasi Pjs</span>
          <span class="e-btn e-btn-danger" style="justify-content:center;height:28px;">Kembalikan</span>
        </div>
      </div>
    </div>
  </aside>`;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Inbox Eksekutif Terpadu & Form Adaptif',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p2',
      breadcrumb: 'Operasional Harian',
      pageTitle: 'Inbox Eksekutif Terpadu (84 Aplikasi)',
      rightActionsHtml: `
        <span class="e-btn">${ic('sliders', 11)} Mode Delegasi Pjs</span>
        <span class="e-btn">${ic('users', 11)} Delegasikan / Kembalikan</span>
        <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Setujui Terpilih (3)</span>
      `,
      contentHtml: `<div style="flex:1;min-height:0;display:flex;gap:9px;">${facetRail}${centerQueue}${rightInspector}</div>`,
    }),
  });
}

// ============================================================================
// PAGE 3: DESAINER ALUR ELSA WORKFLOW V3 & SIMULASI ROUTING DAG
// ============================================================================
function renderP3() {
  // Crisp architectural SVG DAG Canvas (1060 x 560)
  const dagSvg = `<svg viewBox="0 0 1040 540" width="100%" height="535" style="display:block;background:#fbfcfe;border:1px solid #dce3ec;border-radius:3px;">
    <defs>
      <pattern id="dotgrid" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
      </pattern>
      <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f52ba"/>
      </marker>
      <marker id="arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
      </marker>
      <marker id="arr-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#b45309"/>
      </marker>
      <marker id="arr-ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#047857"/>
      </marker>
    </defs>
    <rect width="1040" height="540" fill="url(#dotgrid)" />

    <!-- Swimlane Headers -->
    <rect x="0" y="0" width="205" height="26" fill="#eff4fb" stroke="#d5dde8"/>
    <text x="102" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">1. INGEST &amp; VALIDASI</text>

    <rect x="205" y="0" width="225" height="26" fill="#eff4fb" stroke="#d5dde8"/>
    <text x="317" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">2. ATURAN DOA &amp; CEK SOD</text>

    <rect x="430" y="0" width="250" height="26" fill="#eff4fb" stroke="#d5dde8"/>
    <text x="555" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">3. CABANG PARALEL &amp; PJS</text>

    <rect x="680" y="0" width="165" height="26" fill="#eff4fb" stroke="#d5dde8"/>
    <text x="762" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">4. KONSENSUS QUORUM</text>

    <rect x="845" y="0" width="195" height="26" fill="#eff4fb" stroke="#d5dde8"/>
    <text x="942" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">5. OUTBOX CALLBACK</text>

    <!-- Swimlane Dividers -->
    <line x1="205" y1="26" x2="205" y2="540" stroke="#e2e8f0" stroke-dasharray="4,4"/>
    <line x1="430" y1="26" x2="430" y2="540" stroke="#e2e8f0" stroke-dasharray="4,4"/>
    <line x1="680" y1="26" x2="680" y2="540" stroke="#e2e8f0" stroke-dasharray="4,4"/>
    <line x1="845" y1="26" x2="845" y2="540" stroke="#e2e8f0" stroke-dasharray="4,4"/>

    <!-- Connectors -->
    <path d="M 186 112 L 228 112" stroke="#0f52ba" stroke-width="2" fill="none" marker-end="url(#arr-blue)"/>
    <path d="M 317 156 L 317 204" stroke="#0f52ba" stroke-width="2" fill="none" marker-end="url(#arr-blue)"/>

    <!-- Decision Fork to Parallel Branches (Active Path: > Rp 1 M) -->
    <path d="M 408 248 L 430 248 L 430 112 L 456 112" stroke="#0f52ba" stroke-width="2.2" fill="none" marker-end="url(#arr-blue)"/>
    <path d="M 408 248 L 456 248" stroke="#0f52ba" stroke-width="2.2" fill="none" marker-end="url(#arr-blue)"/>
    <path d="M 408 248 L 430 248 L 430 374 L 456 374" stroke="#0f52ba" stroke-width="2.2" fill="none" marker-end="url(#arr-blue)"/>

    <!-- Low-value fast-track branch (dashed inactive for PO-9914) -->
    <path d="M 317 294 L 317 458 L 762 458 L 762 292" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3" fill="none" marker-end="url(#arr-slate)"/>
    <rect x="332" y="446" width="142" height="18" rx="2" fill="#f1f5f9" stroke="#cbd5e1"/>
    <text x="403" y="458" text-anchor="middle" font-size="8.8" font-family="Consolas,monospace" fill="#475569">&le; Rp 250 jt (Fast-Track)</text>

    <!-- Active Branch Label (positioned clear of TIMEOUT box) -->
    <rect x="406" y="168" width="84" height="17" rx="2" fill="#e8f0fe" stroke="#0f52ba"/>
    <text x="448" y="179" text-anchor="middle" font-size="8.4" font-weight="700" font-family="Consolas,monospace" fill="#0b3d91">&gt; Rp 1 M</text>

    <!-- Parallel Join to Quorum -->
    <path d="M 656 112 L 680 112 L 680 242 L 696 242" stroke="#0f52ba" stroke-width="2" fill="none" marker-end="url(#arr-blue)"/>
    <path d="M 656 248 L 696 248" stroke="#0f52ba" stroke-width="2" fill="none" marker-end="url(#arr-blue)"/>
    <path d="M 656 374 L 680 374 L 680 256 L 696 256" stroke="#0f52ba" stroke-width="2" fill="none" marker-end="url(#arr-blue)"/>

    <!-- SLA Escalation Loop from VP Mining -->
    <path d="M 576 154 L 576 178" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3,2" fill="none" marker-end="url(#arr-warn)"/>

    <!-- Quorum to Outbox + Audit -->
    <path d="M 828 248 L 866 248" stroke="#047857" stroke-width="2.2" fill="none" marker-end="url(#arr-ok)"/>
    <path d="M 944 294 L 944 352" stroke="#047857" stroke-width="1.8" fill="none" marker-end="url(#arr-ok)"/>
    <path d="M 944 202 L 944 148" stroke="#0f52ba" stroke-width="1.8" fill="none" marker-end="url(#arr-blue)"/>

    <!-- NODE 1: RabbitMQ Trigger -->
    <g transform="translate(18, 68)">
      <rect width="168" height="88" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.8"/>
      <rect width="168" height="22" rx="3" fill="#ecfdf5"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#047857" font-family="Consolas,monospace">TRIGGER · RABBITMQ</text>
      <text x="9" y="40" font-size="11" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Ingest Approval Event</text>
      <text x="9" y="55" font-size="9.3" fill="#475569" font-family="Consolas,monospace">fleet-erp.po.requested</text>
      <rect x="9" y="64" width="70" height="16" rx="2" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="44" y="75" text-anchor="middle" font-size="8.6" font-weight="700" fill="#047857" font-family="Consolas,monospace">08:14:02 OK</text>
      <text x="159" y="75" text-anchor="end" font-size="8.6" fill="#64748b" font-family="Consolas,monospace">14 ms</text>
    </g>

    <!-- NODE 2: Schema & Budget Guard -->
    <g transform="translate(228, 68)">
      <rect width="180" height="88" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.8"/>
      <rect width="180" height="22" rx="3" fill="#ecfdf5"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#047857" font-family="Consolas,monospace">GUARD · SCHEMA + SOD</text>
      <text x="9" y="40" font-size="11" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Validasi Form &amp; Cek SoD</text>
      <text x="9" y="55" font-size="9.3" fill="#475569" font-family="Consolas,monospace">capex-po-v4 + CC-4101</text>
      <rect x="9" y="64" width="90" height="16" rx="2" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="54" y="75" text-anchor="middle" font-size="8.6" font-weight="700" fill="#047857" font-family="Consolas,monospace">Pagu &amp; SoD PASS</text>
      <text x="171" y="75" text-anchor="end" font-size="8.6" fill="#64748b" font-family="Consolas,monospace">42 ms</text>
    </g>

    <!-- NODE 3: SELECTED DoA Threshold Gate -->
    <g transform="translate(228, 204)">
      <rect width="180" height="90" rx="4" fill="#e8f0fe" stroke="#0f52ba" stroke-width="2.4"/>
      <rect width="180" height="22" rx="3" fill="#0f52ba"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#ffffff" font-family="Consolas,monospace">GATE · DOA_THRESHOLD</text>
      <text x="9" y="40" font-size="11" font-weight="800" fill="#0c1c36" font-family="Segoe UI,sans-serif">Evaluasi Matriks DoA v4.2</text>
      <text x="9" y="55" font-size="9.2" fill="#1e3a8a" font-family="Consolas,monospace">Amount &gt; 1_000_000_000</text>
      <rect x="9" y="65" width="96" height="16" rx="2" fill="#ffffff" stroke="#0f52ba"/>
      <text x="57" y="76" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0b3d91" font-family="Consolas,monospace">DIPILIH · INSPEKTOR</text>
      <text x="171" y="76" text-anchor="end" font-size="8.6" fill="#0b3d91" font-family="Consolas,monospace">18 ms</text>
    </g>

    <!-- NODE 4A: Parallel Branch 1 - VP Mining Ops + Timer -->
    <g transform="translate(456, 68)">
      <rect width="200" height="86" rx="4" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>
      <rect width="200" height="22" rx="3" fill="#fef3c7"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#92400e" font-family="Consolas,monospace">APPROVAL · TIER-3 VP</text>
      <text x="9" y="40" font-size="11" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">VP Mining Ops (Hendra W.)</text>
      <text x="9" y="55" font-size="9.2" fill="#78350f" font-family="Consolas,monospace">Timer SLA: 4j · Auto-Pjs</text>
      <rect x="9" y="63" width="94" height="16" rx="2" fill="#ffffff" stroke="#f59e0b"/>
      <text x="56" y="74" text-anchor="middle" font-size="8.6" font-weight="700" fill="#b45309" font-family="Consolas,monospace">MENUNGGU AKSI</text>
      <text x="191" y="74" text-anchor="end" font-size="8.6" fill="#92400e" font-family="Consolas,monospace">Sisa 52m</text>
    </g>

    <!-- Sub-node Timer Pjs -->
    <g transform="translate(500, 178)">
      <rect width="152" height="32" rx="3" fill="#ffffff" stroke="#b45309" stroke-dasharray="3,2"/>
      <text x="76" y="14" text-anchor="middle" font-size="8.6" font-weight="700" fill="#b45309" font-family="Consolas,monospace">TIMEOUT &gt; 4 JAM</text>
      <text x="76" y="26" text-anchor="middle" font-size="8.6" fill="#475569" font-family="Segoe UI,sans-serif">Auto-Pjs + WA Escalation</text>
    </g>

    <!-- NODE 4B: Parallel Branch 2 - CFO -->
    <g transform="translate(456, 224)">
      <rect width="200" height="82" rx="4" fill="#ffffff" stroke="#0f52ba" stroke-width="1.6"/>
      <rect width="200" height="22" rx="3" fill="#eff6ff"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#0b3d91" font-family="Consolas,monospace">APPROVAL · TIER-4 CFO</text>
      <text x="9" y="40" font-size="11" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">CFO Holding (Budi Santoso)</text>
      <text x="9" y="54" font-size="9.2" fill="#475569" font-family="Consolas,monospace">Capex &gt; Rp 1 M · Teams Card</text>
      <rect x="9" y="61" width="90" height="15" rx="2" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="54" y="71.5" text-anchor="middle" font-size="8.5" font-weight="600" fill="#334155" font-family="Consolas,monospace">SIAP PARALEL</text>
    </g>

    <!-- NODE 4C: Parallel Branch 3 - Tax Compliance -->
    <g transform="translate(456, 334)">
      <rect width="200" height="82" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.6"/>
      <rect width="200" height="22" rx="3" fill="#ecfdf5"/>
      <text x="9" y="14" font-size="9.2" font-weight="700" fill="#047857" font-family="Consolas,monospace">CHECK · TAX &amp; CORETAX</text>
      <text x="9" y="40" font-size="11" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Verifikasi NPWP &amp; PPh 23</text>
      <text x="9" y="54" font-size="9.2" fill="#475569" font-family="Consolas,monospace">Siti Rahmawati · Otomatis</text>
      <rect x="9" y="61" width="82" height="15" rx="2" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="50" y="71.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="#047857" font-family="Consolas,monospace">08:44 PASS</text>
    </g>

    <!-- NODE 5: Consensus Join -->
    <g transform="translate(696, 204)">
      <rect width="132" height="88" rx="4" fill="#ffffff" stroke="#0f52ba" stroke-width="1.8"/>
      <rect width="132" height="22" rx="3" fill="#e8f0fe"/>
      <text x="8" y="14" font-size="9" font-weight="700" fill="#0b3d91" font-family="Consolas,monospace">JOIN · QUORUM</text>
      <text x="8" y="40" font-size="10.8" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Semua Wajib</text>
      <text x="8" y="54" font-size="9.2" fill="#475569" font-family="Consolas,monospace">3/3 Cabang OK</text>
      <rect x="8" y="64" width="76" height="16" rx="2" fill="#fffbeb" stroke="#fde68a"/>
      <text x="46" y="75" text-anchor="middle" font-size="8.5" font-weight="700" fill="#b45309" font-family="Consolas,monospace">1/3 SELESAI</text>
    </g>

    <!-- NODE 6A: Outbox Publisher -->
    <g transform="translate(866, 204)">
      <rect width="156" height="90" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.8"/>
      <rect width="156" height="22" rx="3" fill="#ecfdf5"/>
      <text x="8" y="14" font-size="9" font-weight="700" fill="#047857" font-family="Consolas,monospace">SQL OUTBOX TX</text>
      <text x="8" y="40" font-size="10.8" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Publish Callback</text>
      <text x="8" y="54" font-size="8.9" fill="#475569" font-family="Consolas,monospace">approval.events</text>
      <text x="8" y="68" font-size="8.7" fill="#047857" font-family="Consolas,monospace">At-Least-Once + HMAC</text>
      <text x="8" y="81" font-size="8.5" fill="#64748b" font-family="Consolas,monospace">Retry 5x Exp Backoff</text>
    </g>

    <!-- NODE 6B: Notification Fanout -->
    <g transform="translate(866, 68)">
      <rect width="156" height="78" rx="4" fill="#ffffff" stroke="#0369a1" stroke-width="1.5"/>
      <rect width="156" height="20" rx="3" fill="#f0f9ff"/>
      <text x="8" y="13" font-size="8.8" font-weight="700" fill="#0369a1" font-family="Consolas,monospace">NOTIFY FANOUT</text>
      <text x="8" y="38" font-size="10.4" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">WA + Teams + Push</text>
      <text x="8" y="52" font-size="8.8" fill="#475569" font-family="Consolas,monospace">PII Redacted (UU PDP)</text>
      <text x="8" y="66" font-size="8.5" fill="#0369a1" font-family="Consolas,monospace">Deep-Link TTL 15m</text>
    </g>

    <!-- NODE 6C: WORM Audit Commit -->
    <g transform="translate(866, 354)">
      <rect width="156" height="78" rx="4" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect width="156" height="20" rx="3" fill="#f1f5f9"/>
      <text x="8" y="13" font-size="8.8" font-weight="700" fill="#334155" font-family="Consolas,monospace">WORM SHA-256</text>
      <text x="8" y="38" font-size="10.4" font-weight="700" fill="#0c1c36" font-family="Segoe UI,sans-serif">Seal Audit Ledger</text>
      <text x="8" y="52" font-size="8.8" fill="#475569" font-family="Consolas,monospace">ISO 27001 Annex A.8</text>
      <text x="8" y="66" font-size="8.5" fill="#475569" font-family="Consolas,monospace">Block #198.413 Ready</text>
    </g>

    <!-- Legend Strip Bottom-Left -->
    <rect x="18" y="494" width="540" height="32" rx="3" fill="#ffffff" stroke="#d5dde8"/>
    <circle cx="34" cy="510" r="4" fill="#047857"/><text x="44" y="513" font-size="9.5" fill="#334155" font-family="Segoe UI,sans-serif">Selesai (Pass)</text>
    <circle cx="136" cy="510" r="4" fill="#b45309"/><text x="146" y="513" font-size="9.5" fill="#334155" font-family="Segoe UI,sans-serif">Menunggu Aksi / SLA</text>
    <circle cx="272" cy="510" r="4" fill="#0f52ba"/><text x="282" y="513" font-size="9.5" fill="#334155" font-family="Segoe UI,sans-serif">Node Terpilih / Aktif</text>
    <line x1="406" y1="510" x2="430" y2="510" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/><text x="438" y="513" font-size="9.5" fill="#64748b" font-family="Segoe UI,sans-serif">Cabang Tidak Terpicu</text>
  </svg>`;

  const waterfallSvg = svgSpanWaterfall({
    width: 448,
    totalMs: 220,
    spans: [
      { label: 'RabbitMQ Consume', start: 0, dur: 14, color: '#047857' },
      { label: 'JSON Schema Bind', start: 14, dur: 18, color: '#0369a1' },
      { label: 'Budget & SoD SQL', start: 32, dur: 42, color: '#0f52ba' },
      { label: 'Elsa DoA Eval v4.2', start: 74, dur: 18, color: '#6d28d9' },
      { label: 'Pjs HRIS Lookup', start: 92, dur: 26, color: '#b45309' },
      { label: 'WA/Teams Enqueue', start: 118, dur: 64, color: '#0369a1' },
      { label: 'Outbox TX Commit', start: 182, dur: 36, color: '#047857' },
    ],
  });

  const contentHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 10px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="e-badge e-badge-accent mono">WF-CAPEX-MINING-V4.2</span>
        <span style="font-weight:700;color:#0c1c36;">Alur Persetujuan Capex &amp; PO Alat Berat (&gt; Rp 250 jt)</span>
        ${badge('Published · Aktif', 'ok')}
        <span class="mono" style="font-size:10px;color:#64748b;">1.428 eksekusi (30h) · 0 error · Median 3,4j</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-btn">${ic('code', 11)} JSON Definisi</span>
        <span class="e-btn">${ic('play', 11, '#047857')} Simulasi PO-2026-9914</span>
        <span class="e-btn e-btn-primary">Publikasikan Revisi v4.3</span>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 472px;gap:9px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('gitBranch', 13, '#0f52ba')} Kanvas Visual Elsa Workflow v3 — Live Instance Overlay (#elsa-9914-v42)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Parallel Fork + SLA Timer', 'info')}
            <span class="mono" style="font-size:9.8px;color:#64748b;">Zoom 100%</span>
          </div>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
          ${dagSvg}
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;">
            <div class="kv-box"><div class="kv-lbl">Total Definisi Aktif</div><div class="kv-val mono">38 Workflow · 84 App</div></div>
            <div class="kv-box"><div class="kv-lbl">Instance Berjalan Saat Ini</div><div class="kv-val mono" style="color:#0f52ba;">18 Instance Aktif</div></div>
            <div class="kv-box"><div class="kv-lbl">Tingkat Eskalasi Pjs (30h)</div><div class="kv-val mono">6,4% (948 item)</div></div>
            <div class="kv-box"><div class="kv-lbl">Kompensasi Rollback Error</div><div class="kv-val mono" style="color:#047857;">0 kegagalan</div></div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1.15;">
          <div class="e-panel-head" style="background:#f0f6ff;">
            <div class="e-panel-title">${ic('sliders', 13, '#0f52ba')} Properti Node: DOA_THRESHOLD_GATE</div>
            ${badge('C# Expression', 'accent')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:7px;">
            <div class="kv-grid">
              <div class="kv-box"><div class="kv-lbl">Activity Type</div><div class="kv-val mono">AlurApprove.DoaSwitch</div></div>
              <div class="kv-box"><div class="kv-lbl">Matriks Referensi</div><div class="kv-val mono">DOA_MATRIX_V4_2</div></div>
              <div class="kv-box"><div class="kv-lbl">Timeout Eskalasi</div><div class="kv-val mono">PT4H (Auto-Pjs HRIS)</div></div>
              <div class="kv-box"><div class="kv-lbl">Idempotency Key</div><div class="kv-val mono">docId + schemaVer</div></div>
            </div>
            <div style="font-size:9.5px;font-weight:700;color:#475569;">EKSPRESI ROUTING ELSA (C# / LIQUID)</div>
            <div class="code-box"><span class="code-c">// Evaluasi nilai transaksi &amp; pencegahan SoD</span>
<span class="code-k">if</span> (Input.MakerNik == Doa.ResolveApprover(Input.CostCenter))
  <span class="code-k">return</span> Outcome(<span class="code-s">"SOD_BLOCK_ESCALATE_VP"</span>);

<span class="code-k">if</span> (Input.AmountIdr &gt; <span class="code-n">1_000_000_000m</span> &amp;&amp; Input.Category == <span class="code-s">"CAPEX"</span>)
  <span class="code-k">return</span> ForkParallel(<span class="code-s">"TIER3_VP_MINING"</span>, <span class="code-s">"TIER4_CFO"</span>, <span class="code-s">"TAX_CORETAX"</span>);

<span class="code-k">return</span> Input.AmountIdr &lt;= <span class="code-n">250_000_000m</span>
  ? Outcome(<span class="code-s">"FAST_TRACK_MGR"</span>) : Outcome(<span class="code-s">"SERIAL_GM_VP"</span>);</div>
            <div style="font-size:9.5px;font-weight:700;color:#475569;">BINDING DYNAMIC FORM SCHEMA (KEY-VALUE ADAPTIF)</div>
            <div class="code-box">{ <span class="code-k">"schemaId"</span>: <span class="code-s">"capex-po-v4"</span>, <span class="code-k">"maskOnChat"</span>: [<span class="code-s">"vendorBankAcct"</span>, <span class="code-s">"unitPriceNet"</span>],
  <span class="code-k">"requiredAttachments"</span>: [<span class="code-s">"RFQ_COMPARISON"</span>, <span class="code-s">"BA_TECHNICAL"</span>] }</div>
            <div class="kv-grid" style="margin-top:auto;">
              <div class="kv-box"><div class="kv-lbl">Retry &amp; Backoff Callback</div><div class="kv-val mono">5x Exp (2s..60s) &rarr; DLQ</div></div>
              <div class="kv-box"><div class="kv-lbl">Aksi Kompensasi Penolakan</div><div class="kv-val mono">Release Lock CC-4101</div></div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:0.85;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#047857')} Trace Simulasi Eksekusi — PO-2026-9914</div>
            <span class="e-badge e-badge-ok mono">Total 218 ms</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;">
            ${waterfallSvg}
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Desainer Alur Elsa Workflow v3',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p3',
      breadcrumb: 'Mesin Orkestrasi',
      pageTitle: 'Desainer Alur Elsa Workflow v3 & Simulasi Routing',
      rightActionsHtml: `
        <span class="e-btn">${ic('copy', 11)} Duplikasi Alur</span>
        <span class="e-btn">${ic('eye', 11)} Diff Versi v4.1 vs v4.2</span>
        <span class="e-btn e-btn-primary">${ic('play', 11, '#fff')} Jalankan Uji Regresi</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 4: MATRIKS DOA & SUBSTITUSI PEJABAT SEMENTARA (PJS) + SOD GUARD
// ============================================================================
function renderP4() {
  const doaMatrix = [
    { cat: 'Capex Alat Berat & Overhaul', code: 'CAPEX-HE', t1: 'Checker', t2: 'Review', t3: 'Wajib (≤1M)', t4: 'Paralel >1M', t5: 'Wajib >5M', t6: 'RUPS >15M', sla: '4j / 8j' },
    { cat: 'PO Sparepart & Operasional', code: 'OPEX-PO', t1: 'Final ≤50jt', t2: 'Final ≤250jt', t3: 'Final ≤1M', t4: 'Wajib >1M', t5: 'Wajib >5M', t6: 'Info', sla: '4j / 12j' },
    { cat: 'Kontrak Cloud, Lisensi & IT', code: 'IT-PROC', t1: 'Checker', t2: 'Review', t3: 'VP IT + Fin', t4: 'Quorum 2/3', t5: 'Wajib >3M', t6: 'Komite IT', sla: '8j / 24j' },
    { cat: 'Akses DB Produksi JIT / PAM', code: 'IAM-JIT', t1: 'Pemohon', t2: 'Lead SRE', t3: 'SecOps + VP', t4: 'Audit Log', t5: 'N/A', t6: 'N/A', sla: '1j Kritis' },
    { cat: 'Otorisasi Pajak & CoreTax PPN', code: 'TAX-COR', t1: 'Tax Prep', t2: 'Tax Mgr', t3: 'VP Tax', t4: 'CFO Final', t5: '>10M Only', t6: 'N/A', sla: '6j / 12j' },
    { cat: 'Transfer Treasury & Modal Kerja', code: 'FIN-TRF', t1: 'Maker', t2: 'Checker', t3: 'VP Treas', t4: 'Dual Sign', t5: 'Dual >5M', t6: 'Dewan >25M', sla: '2j / 6j' },
    { cat: 'Addendum Kontrak & Sewa Aset', code: 'LGL-CNT', t1: 'Drafting', t2: 'Legal Mgr', t3: 'VP Legal', t4: 'CFO >500jt', t5: 'CEO >3M', t6: 'N/A', sla: '12j / 24j' },
    { cat: 'Perjalanan Dinas & Audit Lapangan', code: 'HR-TRV', t1: 'Final ≤15jt', t2: 'Final ≤50jt', t3: 'VP >50jt', t4: 'Luar Negeri', t5: 'N/A', t6: 'N/A', sla: '18j' },
    { cat: 'Penghapusan Aset Tetap (Write-Off)', code: 'FIN-AST', t1: 'BA Fisik', t2: 'Asset Mgr', t3: 'VP Ops', t4: 'CFO + Audit', t5: 'Wajib >1M', t6: 'RUPS >10M', sla: '24j' },
    { cat: 'Izin Kerja Kritis / Hot-Work HSE', code: 'HSE-PTW', t1: 'HSE Insp', t2: 'Site Mgr', t3: 'KTT / Pjs', t4: 'N/A', t5: 'N/A', t6: 'N/A', sla: '2j Kritis' },
    { cat: 'Penyesuaian Kredit Limit Pelanggan', code: 'SLS-CRD', t1: 'AR Analyst', t2: 'Credit Mgr', t3: 'VP Comm', t4: 'CFO >2M', t5: 'Komite >10M', t6: 'N/A', sla: '8j / 16j' },
    { cat: 'Sponsorship, Hibah & Program CSR Grup', code: 'COR-CSR', t1: 'CorComm', t2: 'GA Mgr', t3: 'VP CorSec', t4: 'CFO >250jt', t5: 'CEO >1M', t6: 'Dewan >5M', sla: '24j' },
  ];

  const cellStyle = (txt) => {
    if (txt === 'N/A' || txt === 'Info') return 'color:#94a3b8;';
    if (txt.includes('Paralel') || txt.includes('Quorum') || txt.includes('Dual') || txt.includes('SecOps')) return 'background:#e8f0fe;color:#0b3d91;font-weight:700;';
    if (txt.includes('Wajib') || txt.includes('Final')) return 'background:#ecfdf5;color:#047857;font-weight:600;';
    if (txt.includes('RUPS') || txt.includes('Dewan') || txt.includes('Komite')) return 'background:#fffbeb;color:#92400e;font-weight:700;';
    return 'color:#334155;';
  };

  const pjsList = [
    { sk: 'SK-PJS-2026-118', orig: 'Ir. Gunawan (GM Kaltim)', pjs: 'Dedi Kurniawan (Dep. GM)', period: '18–26 Nov 2026', plafon: 'Rp 500 jt', apps: 'Fleet-ERP, WMS', bar: 62, status: 'Aktif', tone: 'ok' },
    { sk: 'SK-PJS-2026-121', orig: 'Rama Prakasa (VP Comm)', pjs: 'Andi Saputra (GM Sales)', period: '20–25 Nov 2026', plafon: 'Rp 1,00 M', apps: 'CRM-DealDesk', bar: 45, status: 'Aktif', tone: 'ok' },
    { sk: 'SK-PJS-2026-124', orig: 'Dr. Surya (KTT Morowali)', pjs: 'Arif Budiman (HSE Lead)', period: '21–24 Nov 2026', plafon: 'Non-Fin PTW', apps: 'HSE-Permit', bar: 50, status: 'Aktif', tone: 'info' },
    { sk: 'SK-PJS-2026-125', orig: 'Nadia Permata (VP Legal)', pjs: 'Haryo Wibowo (Sr. Counsel)', period: '22–23 Nov 2026', plafon: 'Rp 500 jt', apps: 'DMS-Legal', bar: 20, status: 'Aktif', tone: 'ok' },
    { sk: 'SK-PJS-2026-129', orig: 'Budi Santoso (CFO)', pjs: 'Lestari Putri (VP Treas)', period: '28 Nov–02 Des', plafon: 'Rp 2,50 M', apps: 'Treasury, CoreTax', bar: 0, status: 'Terjadwal', tone: 'neutral' },
    { sk: 'SK-PJS-2026-131', orig: 'Ir. Hendra Wijaya (VP Ops)', pjs: 'Agus Rahman (GM Mining)', period: '04–08 Des 2026', plafon: 'Rp 1,00 M', apps: 'Fleet-ERP, e-Proc', bar: 0, status: 'Cek HRIS', tone: 'warn' },
    { sk: 'SK-PJS-2026-133', orig: 'Rina Kusuma (Head Proc)', pjs: 'Taufik Hidayat (Sr. Buyer)', period: '09–13 Des 2026', plafon: 'Rp 250 jt', apps: 'e-Proc, Vendor', bar: 0, status: 'Terjadwal', tone: 'neutral' },
    { sk: 'SK-PJS-2026-135', orig: 'Dwi Prasetyo (Cloud Arch)', pjs: 'Fajar Nugroho (Sec Lead)', period: '15–19 Des 2026', plafon: 'Non-Fin PAM', apps: 'IAM-Portal', bar: 0, status: 'Cek HRIS', tone: 'warn' },
  ];

  const sodRules = [
    { id: 'SOD-01', rule: 'Maker != Checker != Approver (3-Eyes Capex)', scope: '84 Aplikasi', blocked30d: 14, status: 'Enforced' },
    { id: 'SOD-02', rule: 'Larangan Delegasi Melingkar (A -> B -> A)', scope: 'Modul Pjs HRIS', blocked30d: 3, status: 'Enforced' },
    { id: 'SOD-03', rule: 'Pemisahan Vendor Master vs PO Approver', scope: 'SAP + e-Proc', blocked30d: 6, status: 'Enforced' },
    { id: 'SOD-04', rule: 'Wajib Dual-Approval SecOps untuk Akses JIT/PAM', scope: 'IAM-Portal', blocked30d: 2, status: 'Enforced' },
    { id: 'SOD-05', rule: 'Dual-Control Perubahan Plafon Matriks DoA', scope: 'AlurApprove Admin', blocked30d: 0, status: 'Enforced' },
  ];

  const contentHtml = `
    <div class="e-panel" style="flex:1.12;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#0f52ba')} Matriks Delegation of Authority (DoA) Korporat v4.2 — SK Direksi #042/NHI/2026</div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('12 Kategori Transaksi', 'accent')}
          ${badge('6 Tier Wewenang', 'neutral')}
          ${badge('Berlaku 6 Entitas', 'ok')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table" style="font-size:10.3px;">
          <thead>
            <tr>
              <th style="width:22%;">Kategori Transaksi</th>
              <th style="width:8%;">Kode</th>
              <th style="width:10.5%;">Tier-1 Mgr (≤50jt)</th>
              <th style="width:10.5%;">Tier-2 GM (≤250jt)</th>
              <th style="width:11%;">Tier-3 VP (≤1M)</th>
              <th style="width:11%;">Tier-4 CFO (≤5M)</th>
              <th style="width:10%;">Tier-5 CEO (≤15M)</th>
              <th style="width:9.5%;">Tier-6 RUPS</th>
              <th class="num" style="width:7.5%;">SLA</th>
            </tr>
          </thead>
          <tbody>
            ${doaMatrix.map((r, i) => `<tr class="${i === 0 ? 'is-selected' : ''}">
              <td style="font-weight:700;color:#0c1c36;">${esc(r.cat)}</td>
              <td class="mono" style="font-size:9.5px;color:#0f52ba;">${esc(r.code)}</td>
              <td style="${cellStyle(r.t1)}">${esc(r.t1)}</td>
              <td style="${cellStyle(r.t2)}">${esc(r.t2)}</td>
              <td style="${cellStyle(r.t3)}">${esc(r.t3)}</td>
              <td style="${cellStyle(r.t4)}">${esc(r.t4)}</td>
              <td style="${cellStyle(r.t5)}">${esc(r.t5)}</td>
              <td style="${cellStyle(r.t6)}">${esc(r.t6)}</td>
              <td class="num mono" style="font-weight:600;">${esc(r.sla)}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">Total 12 Kategori DoA Korporat · Efektif 01 Jan 2026 (SK Direksi #042/NHI/2026) · Sinkron 84 Aplikasi</td>
              <td colspan="3" class="num mono" style="color:#047857;">Audit Terakhir: 15 Nov 2026 (Lulus)</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div style="flex:0.88;min-height:0;display:grid;grid-template-columns:1.32fr 0.68fr;gap:9px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 13, '#0f52ba')} Registri Substitusi Pejabat Sementara (Pjs) &amp; Sinkronisasi Cuti HRIS</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('4 Pjs Aktif · 4 Terjadwal', 'ok')}
            <span class="e-btn" style="height:21px;font-size:10px;">+ Buat SK Pjs Baru</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.1px;">
            <thead>
              <tr>
                <th style="width:14%;">No. SK Pjs</th>
                <th style="width:19%;">Pejabat Asli (Cuti/Dinas)</th>
                <th style="width:19%;">Pejabat Pjs Penerima</th>
                <th style="width:14%;">Periode Berlaku</th>
                <th class="num" style="width:11%;">Plafon Pjs</th>
                <th style="width:12%;">Cakupan App</th>
                <th style="width:11%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${pjsList.map((p) => `<tr>
                <td class="mono" style="font-weight:600;color:#0b3d91;">${esc(p.sk)}</td>
                <td>${esc(p.orig)}</td>
                <td style="font-weight:600;">${esc(p.pjs)}</td>
                <td class="mono" style="font-size:9.5px;">${esc(p.period)}</td>
                <td class="num mono" style="font-weight:700;">${esc(p.plafon)}</td>
                <td style="font-size:9.8px;color:#475569;">${esc(p.apps)}</td>
                <td>${badge(p.status, p.tone)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head" style="background:#fffbeb;">
          <div class="e-panel-title">${ic('lock', 13, '#b45309')} Guard Segregation of Duties (SoD) &amp; Simulasi</div>
          ${badge('25 Blokir / 30h', 'warn')}
        </div>
        <div class="e-panel-body" style="padding:7px 9px;display:flex;flex-direction:column;gap:6px;">
          ${sodRules.map((s) => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 7px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;">
              <div style="min-width:0;">
                <div style="font-size:10.2px;font-weight:700;color:#0c1c36;" class="trunc"><span class="mono" style="color:#0f52ba;">${s.id}</span> · ${esc(s.rule)}</div>
                <div style="font-size:9.2px;color:#64748b;">Cakupan: ${esc(s.scope)} · Diblokir 30h: <strong class="mono">${s.blocked30d}x</strong></div>
              </div>
              ${badge(s.status, 'ok')}
            </div>
          `).join('')}
          <div style="margin-top:auto;background:#e8f0fe;border:1px solid #bfdbfe;border-radius:3px;padding:7px 8px;">
            <div style="font-size:9.6px;font-weight:700;color:#0b3d91;margin-bottom:3px;">UJI SIMULASI DOA: CAPEX-HE · Rp 1.420.000.000 · TMO-MN</div>
            <div style="font-size:10px;color:#1e293b;">Hasil: <strong>Maker</strong> (Agus R.) → <strong>Checker</strong> (Rina K.) → <strong>Paralel [VP Mining + CFO + Tax]</strong> · SLA 4 jam · Konflik SoD: <strong style="color:#047857;">0 (Lolos)</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Matriks DoA & Substitusi Pejabat Sementara (Pjs)',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p4',
      breadcrumb: 'Tata Kelola Korporat',
      pageTitle: 'Matriks Delegation of Authority (DoA) & Substitusi Pjs',
      rightActionsHtml: `
        <span class="e-btn">${ic('refresh', 11)} Sinkron Cuti HRIS</span>
        <span class="e-btn">${ic('download', 11)} Unduh SK DoA v4.2 (PDF)</span>
        <span class="e-btn e-btn-primary">${ic('users', 11, '#fff')} Ajukan Revisi Matriks</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 5: ANGGARAN CAPEX/OPEX, PSAK & KEPATUHAN CORETAX
// ============================================================================
function renderP5() {
  const totalAvail = TOTAL_PAGU_Q4 - TOTAL_POSTED_YTD - TOTAL_QUEUE_IDR;
  const totalUtilPct = ((TOTAL_POSTED_YTD + TOTAL_QUEUE_IDR) / TOTAL_PAGU_Q4) * 100;

  const kpis = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Pagu Q4 (12 Cost Center)</span>${badge('FY2026', 'neutral')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtCompactIdr(TOTAL_PAGU_Q4)}</span></div>
      <div class="e-kpi-foot"><span>Exact: ${fmtIdr(TOTAL_PAGU_Q4)}</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Realisasi Posted SAP GL</span>${badge('PSAK 16/71', 'accent')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">${fmtCompactIdr(TOTAL_POSTED_YTD)}</span></div>
      <div class="e-kpi-foot"><span>${fmtPct((TOTAL_POSTED_YTD / TOTAL_PAGU_Q4) * 100)} dari pagu Q4</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #b45309;">
      <div class="e-kpi-top"><span>Komitmen Pending AlurApprove</span>${badge('18 Item', 'warn')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#b45309;">${fmtCompactIdr(TOTAL_QUEUE_IDR)}</span></div>
      <div class="e-kpi-foot"><span>Rekonsiliasi 100% dgn Inbox</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #047857;">
      <div class="e-kpi-top"><span>Sisa Pagu Tersedia (Free)</span>${badge(fmtPct(100 - totalUtilPct), 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#047857;">${fmtCompactIdr(totalAvail)}</span></div>
      <div class="e-kpi-foot"><span>Utilisasi gab.: ${fmtPct(totalUtilPct)}</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #0369a1;">
      <div class="e-kpi-top"><span>Validasi CoreTax &amp; NPWP 16</span>${badge('XML v2.1', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">100% Valid</span></div>
      <div class="e-kpi-foot"><span>PPN 11% + PPh 23 terverifikasi</span></div>
    </div>
  </div>`;

  const ccRows = COST_CENTERS.map((c, idx) => {
    const sisa = c.paguQ4 - c.postedYtd - c.pending;
    const util = ((c.postedYtd + c.pending) / c.paguQ4) * 100;
    return `<tr class="${idx === 0 ? 'is-selected' : ''}">
      <td class="mono" style="font-weight:700;color:#0f52ba;">${esc(c.cc)}</td>
      <td style="font-weight:600;color:#0c1c36;">${esc(c.name)}</td>
      <td class="mono" style="font-size:9.6px;">${esc(c.entity)}</td>
      <td class="num mono">${fmtCompactIdr(c.paguQ4)}</td>
      <td class="num mono">${fmtCompactIdr(c.postedYtd)}</td>
      <td class="num mono" style="font-weight:700;color:#b45309;">${fmtCompactIdr(c.pending)}</td>
      <td class="num mono" style="color:#047857;font-weight:600;">${fmtCompactIdr(sisa)}</td>
      <td>${renderCapacityBar(util, { warnAt: 80, critAt: 92 })}</td>
      <td>${badge(c.coreTax, c.tone)}</td>
    </tr>`;
  }).join('');

  const sumDr = JOURNAL_PO9914.reduce((a, j) => a + j.dr, 0);
  const sumCr = JOURNAL_PO9914.reduce((a, j) => a + j.cr, 0);

  const contentHtml = `
    ${kpis}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 0.82fr;gap:9px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Kontrol Komitmen Anggaran (Encumbrance) &amp; Chargeback Cost Center (12 Unit)</div>
          <span class="e-panel-sub mono">Sinkron SAP S/4HANA FM-BCS · Real-Time</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.3px;">
            <thead>
              <tr>
                <th style="width:8.5%;">CC</th>
                <th style="width:23%;">Nama Cost Center / Program</th>
                <th style="width:7.5%;">Entitas</th>
                <th class="num" style="width:10.5%;">Pagu Q4</th>
                <th class="num" style="width:10.5%;">Posted GL</th>
                <th class="num" style="width:10%;">Pending</th>
                <th class="num" style="width:10%;">Sisa Pagu</th>
                <th style="width:9.5%;">Utilisasi</th>
                <th style="width:10.5%;">CoreTax</th>
              </tr>
            </thead>
            <tbody>${ccRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total Konsolidasi 12 Cost Center (6 Entitas)</td>
                <td class="num mono">${fmtCompactIdr(TOTAL_PAGU_Q4)}</td>
                <td class="num mono">${fmtCompactIdr(TOTAL_POSTED_YTD)}</td>
                <td class="num mono" style="color:#b45309;">${fmtCompactIdr(TOTAL_QUEUE_IDR)}</td>
                <td class="num mono" style="color:#047857;">${fmtCompactIdr(totalAvail)}</td>
                <td class="num mono">${fmtPct(totalUtilPct)}</td>
                <td>${badge('Balanced', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:auto;padding:8px 10px;background:#f8fafc;border-top:1px solid #d5dde8;display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
            <div class="kv-box" style="background:#ffffff;">
              <div class="kv-lbl">Aturan Budget Hard-Stop SAP FM-BCS</div>
              <div class="kv-val">Blokir otomatis jika Utilisasi &gt; 100% tanpa Memo CFO</div>
            </div>
            <div class="kv-box" style="background:#ffffff;">
              <div class="kv-lbl">Rekonsiliasi Chargeback Intercompany</div>
              <div class="kv-val mono" style="color:#047857;">6 Entitas · 0 Selisih Eliminasi</div>
            </div>
            <div class="kv-box" style="background:#ffffff;">
              <div class="kv-lbl">Status PPN Masukan &amp; Bukti Potong PPh 23</div>
              <div class="kv-val mono" style="color:#0b3d91;">100% Sinkron CoreTax DJP</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1.06;">
          <div class="e-panel-head" style="background:#f0f6ff;">
            <div class="e-panel-title">${ic('fileText', 13, '#0f52ba')} Simulasi Jurnal Pra-Posting PSAK — PO-2026-9914</div>
            ${badge('Dr = Cr · Balance', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.1px;">
              <thead>
                <tr>
                  <th style="width:14%;">Akun GL</th>
                  <th style="width:38%;">Deskripsi Pos Akuntansi</th>
                  <th style="width:12%;">Standar</th>
                  <th class="num" style="width:18%;">Debit (IDR)</th>
                  <th class="num" style="width:18%;">Kredit (IDR)</th>
                </tr>
              </thead>
              <tbody>
                ${JOURNAL_PO9914.map((j) => `<tr>
                  <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(j.acct)}</td>
                  <td style="font-weight:500;">${esc(j.desc)}</td>
                  <td><span class="e-badge e-badge-neutral mono" style="font-size:9px;">${esc(j.psak)}</span></td>
                  <td class="num mono">${j.dr ? fmtNum(j.dr) : '—'}</td>
                  <td class="num mono">${j.cr ? fmtNum(j.cr) : '—'}</td>
                </tr>`).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">Total Jurnal Seimbang (Selisih = Rp 0)</td>
                  <td class="num mono">${fmtNum(sumDr)}</td>
                  <td class="num mono">${fmtNum(sumCr)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div class="kv-box"><div class="kv-lbl">Pembayaran Host-to-Host</div><div class="kv-val mono">Mandiri MCM / BI-FAST</div></div>
              <div class="kv-box"><div class="kv-lbl">Termin &amp; Retensi</div><div class="kv-val mono">NET 30 · 0% Retensi</div></div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:0.94;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('code', 13, '#0369a1')} Validator CoreTax XML v2.1 &amp; e-Faktur DJP</div>
            ${badge('Schema Valid', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;gap:6px;">
            <div class="code-box">&lt;<span class="code-k">TaxInvoice</span> <span class="code-s">version="CoreTax-2.1"</span>&gt;
  &lt;<span class="code-k">SellerTIN</span>&gt;<span class="code-n">0130482190410000</span>&lt;/<span class="code-k">SellerTIN</span>&gt; <span class="code-c">&lt;!-- PKP Aktif --&gt;</span>
  &lt;<span class="code-k">BuyerTIN</span>&gt;<span class="code-n">0100284910920000</span>&lt;/<span class="code-k">BuyerTIN</span>&gt;  <span class="code-c">&lt;!-- PT TMO-MN --&gt;</span>
  &lt;<span class="code-k">TaxBaseIdr</span>&gt;<span class="code-n">1420000000</span>&lt;/<span class="code-k">TaxBaseIdr</span>&gt;
  &lt;<span class="code-k">VAT11Idr</span>&gt;<span class="code-n">156200000</span>&lt;/<span class="code-k">VAT11Idr</span>&gt; &lt;<span class="code-k">WHT23Idr</span>&gt;<span class="code-n">28400000</span>&lt;/<span class="code-k">WHT23Idr</span>&gt;
  &lt;<span class="code-k">ApprovalRef</span>&gt;<span class="code-s">ELSA-9914-DOA-V42</span>&lt;/<span class="code-k">ApprovalRef</span>&gt;
&lt;/<span class="code-k">TaxInvoice</span>&gt;</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:5px 8px;">
              <span style="font-weight:700;">Status KSWP &amp; PKP Vendor: VALID (DJP API 200 OK)</span>
              <span class="mono">NITKU Terverifikasi</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:auto;">
              <div class="kv-box"><div class="kv-lbl">NSFP / e-Faktur</div><div class="kv-val mono" style="color:#047857;">010.008-26.9914</div></div>
              <div class="kv-box"><div class="kv-lbl">Objek PPh 23 (2%)</div><div class="kv-val mono">Rp 28.400.000</div></div>
              <div class="kv-box"><div class="kv-lbl">Bukti Potong Unifikasi</div><div class="kv-val mono" style="color:#0b3d91;">Auto-Draft OK</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Anggaran Capex/Opex, PSAK & CoreTax',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p5',
      breadcrumb: 'Keuangan & Perpajakan',
      pageTitle: 'Komitmen Anggaran Capex/Opex, Jurnal PSAK & Kepatuhan CoreTax',
      rightActionsHtml: `
        <span class="e-btn">${ic('refresh', 11)} Rekonsiliasi SAP GL</span>
        <span class="e-btn">${ic('download', 11)} Ekspor CoreTax XML</span>
        <span class="e-btn e-btn-primary">${ic('check', 11, '#fff')} Kunci Pagu Terpilih</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 6: KATALOG 84 APLIKASI & RABBITMQ TRANSACTIONAL OUTBOX
// ============================================================================
function renderP6() {
  const topoSvg = `<svg viewBox="0 0 510 175" width="100%" height="172" style="display:block;">
    <defs>
      <marker id="m6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f52ba"/>
      </marker>
      <marker id="m6ok" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#047857"/>
      </marker>
      <marker id="m6bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#be123c"/>
      </marker>
    </defs>

    <!-- 84 Apps box -->
    <rect x="6" y="18" width="110" height="122" rx="4" fill="#f8fafc" stroke="#0f52ba" stroke-width="1.5"/>
    <text x="61" y="36" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0b3d91" font-family="Segoe UI,sans-serif">84 Aplikasi Sumber</text>
    <rect x="14" y="44" width="94" height="18" rx="2" fill="#e8f0fe"/><text x="61" y="56" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#0b3d91">SAP / Fleet-ERP</text>
    <rect x="14" y="66" width="94" height="18" rx="2" fill="#e8f0fe"/><text x="61" y="78" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#0b3d91">e-Proc / CoreTax</text>
    <rect x="14" y="88" width="94" height="18" rx="2" fill="#e8f0fe"/><text x="61" y="100" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#0b3d91">HRIS / IAM-PAM</text>
    <rect x="14" y="110" width="94" height="18" rx="2" fill="#f1f5f9"/><text x="61" y="122" text-anchor="middle" font-size="8.6" font-family="Consolas,monospace" fill="#475569">+78 App Lainnya</text>

    <!-- Arrow Ingest -->
    <path d="M 116 62 L 154 62" stroke="#0f52ba" stroke-width="1.8" marker-end="url(#m6)"/>
    <text x="135" y="55" text-anchor="middle" font-size="8" font-family="Consolas,monospace" fill="#475569">AMQP</text>

    <!-- .NET 9 Modular Monolith + SQL Outbox -->
    <rect x="156" y="14" width="154" height="130" rx="4" fill="#eff6ff" stroke="#0f52ba" stroke-width="1.8"/>
    <text x="233" y="32" text-anchor="middle" font-size="9.4" font-weight="800" fill="#0c1c36" font-family="Segoe UI,sans-serif">.NET 9 Modular Monolith</text>
    <rect x="166" y="40" width="134" height="36" rx="3" fill="#ffffff" stroke="#93c5fd"/>
    <text x="233" y="55" text-anchor="middle" font-size="8.8" font-weight="700" fill="#0b3d91" font-family="Segoe UI,sans-serif">Elsa Workflow Engine v3</text>
    <text x="233" y="68" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#475569">ACID Transaction Scope</text>

    <rect x="166" y="86" width="134" height="48" rx="3" fill="#ecfdf5" stroke="#047857"/>
    <text x="233" y="101" text-anchor="middle" font-size="8.8" font-weight="700" fill="#047857" font-family="Consolas,monospace">SQL OutboxMessages</text>
    <text x="233" y="114" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#334155">Lag p95: 118 ms</text>
    <text x="233" y="126" text-anchor="middle" font-size="8.1" font-family="Consolas,monospace" fill="#047857">Relay Worker (4 Pods)</text>

    <!-- Arrow Outbox to RabbitMQ Exchange -->
    <path d="M 310 108 L 350 76" stroke="#047857" stroke-width="1.8" marker-end="url(#m6ok)"/>

    <!-- RabbitMQ Exchange -->
    <rect x="352" y="22" width="150" height="72" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.8"/>
    <text x="427" y="39" text-anchor="middle" font-size="9.2" font-weight="800" fill="#047857" font-family="Consolas,monospace">approval.events</text>
    <text x="427" y="53" text-anchor="middle" font-size="8.4" fill="#475569" font-family="Consolas,monospace">Topic Exchange · Quorum</text>
    <text x="427" y="67" text-anchor="middle" font-size="8.4" fill="#047857" font-family="Consolas,monospace">Ack: 48.591 (99,94%)</text>
    <text x="427" y="82" text-anchor="middle" font-size="8.2" fill="#475569" font-family="Consolas,monospace">HMAC-SHA256 Signed</text>

    <!-- DLQ box -->
    <path d="M 427 94 L 427 118" stroke="#be123c" stroke-width="1.5" stroke-dasharray="3,2" marker-end="url(#m6bad)"/>
    <rect x="352" y="120" width="150" height="36" rx="4" fill="#fff1f2" stroke="#fecdd3"/>
    <text x="427" y="135" text-anchor="middle" font-size="8.8" font-weight="700" fill="#be123c" font-family="Consolas,monospace">dlq.callback.retry</text>
    <text x="427" y="148" text-anchor="middle" font-size="8.2" fill="#9f1239" font-family="Consolas,monospace">Retry: 24 · DLQ: 5</text>

    <!-- Callback Return Arrow -->
    <path d="M 352 152 L 61 152 L 61 142" stroke="#047857" stroke-width="1.4" stroke-dasharray="4,2" fill="none" marker-end="url(#m6ok)"/>
    <text x="206" y="166" text-anchor="middle" font-size="8.4" font-family="Consolas,monospace" fill="#047857">Guaranteed Callback Idempoten ke 84 Aplikasi Sumber</text>
  </svg>`;

  const throughputSvg = svgMultiLineChart({
    width: 560,
    height: 172,
    xLabels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    yMin: 0,
    yMax: 280,
    yTicks: 4,
    yUnit: 'ms',
    threshold: { value: 250, label: 'Batas SLA Outbox Lag (250 ms)', color: '#be123c' },
    series: [
      { label: 'Outbox Relay Lag p95 (ms)', color: '#0f52ba', area: true, dots: true, values: [92, 84, 98, 148, 134, 162, 128, 118] },
      { label: 'Callback Ack Latency p50 (ms)', color: '#047857', values: [48, 44, 52, 74, 68, 82, 64, 58] },
    ],
  });

  const appRows = CONNECTED_APPS.map((a, idx) => `<tr class="${idx === 0 ? 'is-selected' : a.dlq > 0 && idx < 15 ? 'is-warn' : ''}">
    <td style="font-weight:${idx === 15 ? '700' : '600'};color:#0c1c36;">${esc(a.app)}</td>
    <td><span class="e-badge e-badge-neutral" style="font-size:9px;">${esc(a.domain)}</span></td>
    <td class="mono" style="font-size:9.3px;color:#475569;">${esc(a.key)}</td>
    <td class="num mono">${fmtNum(a.msg24h)}</td>
    <td class="num mono" style="color:#047857;">${fmtNum(a.acked)}</td>
    <td class="num mono" style="color:${a.retry > 0 ? '#b45309' : '#64748b'};">${a.retry}</td>
    <td class="num mono" style="color:${a.dlq > 0 ? '#be123c' : '#64748b'};font-weight:${a.dlq > 0 ? '700' : '400'};">${a.dlq}</td>
    <td class="num mono">${a.p95ms} ms</td>
    <td>${badge(a.status, a.tone)}</td>
  </tr>`).join('');

  const contentHtml = `
    <div style="display:grid;grid-template-columns:1.05fr 1.12fr 0.72fr;gap:9px;height:218px;flex-shrink:0;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('server', 12, '#0f52ba')} Topologi RabbitMQ Transactional Outbox</div>
          ${badge('Cluster 3-Node', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:5px 8px;">${topoSvg}</div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 12, '#0f52ba')} Latensi Outbox Relay &amp; Callback Ack (24 Jam)</div>
          <span class="e-panel-sub mono">p95 = 118 ms</span>
        </div>
        <div class="e-panel-body" style="padding:5px 8px;">${throughputSvg}</div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('database', 12, '#047857')} Ringkasan Pengiriman 24j</div>
          ${badge('99,94% OK', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:7px 9px;display:flex;flex-direction:column;gap:5px;">
          <div class="kv-grid">
            <div class="kv-box"><div class="kv-lbl">Total Published</div><div class="kv-val mono">${fmtNum(TOTAL_MSG_24H)}</div></div>
            <div class="kv-box"><div class="kv-lbl">Callback Acked</div><div class="kv-val mono" style="color:#047857;">${fmtNum(TOTAL_ACK_24H)}</div></div>
            <div class="kv-box"><div class="kv-lbl">Antrean Retry</div><div class="kv-val mono" style="color:#b45309;">${TOTAL_RETRY_24H} msg</div></div>
            <div class="kv-box"><div class="kv-lbl">Dead-Letter (DLQ)</div><div class="kv-val mono" style="color:#be123c;">${TOTAL_DLQ_24H} msg</div></div>
          </div>
          <div class="kv-box">
            <div class="kv-lbl">Idempotency Deduplication (Redis + SQL)</div>
            <div class="kv-val mono" style="color:#0b3d91;">312 duplikat dicegah · 0 double-post</div>
          </div>
          <div style="margin-top:auto;display:flex;gap:5px;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:23px;">Replay 5 DLQ</span>
            <span class="e-btn" style="flex:1;justify-content:center;height:23px;">Cek Quorum</span>
          </div>
        </div>
      </div>
    </div>

    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.45fr 0.85fr;gap:9px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#0f52ba')} Registri 84 Aplikasi Terhubung &amp; Telemetri Callback RabbitMQ</div>
          <span class="e-panel-sub mono">84/84 Aktif · 15 Top Volume + 68 Agregat</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.1px;">
            <thead>
              <tr>
                <th style="width:24%;">Aplikasi Sumber</th>
                <th style="width:9%;">Domain</th>
                <th style="width:17%;">Routing Key Pattern</th>
                <th class="num" style="width:9%;">Msg 24j</th>
                <th class="num" style="width:9%;">Acked</th>
                <th class="num" style="width:7%;">Retry</th>
                <th class="num" style="width:6%;">DLQ</th>
                <th class="num" style="width:9%;">Lag p95</th>
                <th style="width:10%;">Status</th>
              </tr>
            </thead>
            <tbody>${appRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total 84 Aplikasi Terhubung (100% Aktif)</td>
                <td class="num mono">${fmtNum(TOTAL_MSG_24H)}</td>
                <td class="num mono" style="color:#047857;">${fmtNum(TOTAL_ACK_24H)}</td>
                <td class="num mono" style="color:#b45309;">${TOTAL_RETRY_24H}</td>
                <td class="num mono" style="color:#be123c;">${TOTAL_DLQ_24H}</td>
                <td class="num mono">118 ms</td>
                <td>${badge('99,94%', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="e-panel">
        <div class="e-panel-head" style="background:#f0f6ff;">
          <div class="e-panel-title">${ic('terminal', 13, '#0f52ba')} Inspektor Live Outbox &amp; Payload Callback</div>
          ${badge('HMAC-SHA256', 'accent')}
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:8px;">
          <div style="background:#0c1c36;color:#93c5fd;border-radius:3px;padding:7px 9px;font-family:var(--e-mono);font-size:9.6px;line-height:1.45;">
            <div style="color:#6ee7b7;font-weight:700;margin-bottom:2px;">&gt; OUTBOX_PUBLISHED · ACK 200 OK (94 ms)</div>
            RabbitMQ Outbox Published -&gt; exchange="approval.events" routingKey="fleet-erp.po.approved" | docId=PO-2026-9914
          </div>
          <div>
            <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">EVENT ENVELOPE JSON (CALLBACK TERJAMIN)</div>
            <div class="code-box">{
  <span class="code-k">"eventId"</span>: <span class="code-s">"evt_019a7c2e-9914-7b11-a042"</span>,
  <span class="code-k">"exchange"</span>: <span class="code-s">"approval.events"</span>,
  <span class="code-k">"routingKey"</span>: <span class="code-s">"fleet-erp.po.approved"</span>,
  <span class="code-k">"docId"</span>: <span class="code-s">"PO-2026-9914"</span>,
  <span class="code-k">"entity"</span>: <span class="code-s">"TMO-MN"</span>,
  <span class="code-k">"decision"</span>: <span class="code-s">"APPROVED_TIER3_VP"</span>,
  <span class="code-k">"approverNik"</span>: <span class="code-s">"NHI-00418"</span>,
  <span class="code-k">"amountIdr"</span>: <span class="code-n">1420000000</span>,
  <span class="code-k">"doaVersion"</span>: <span class="code-s">"4.2"</span>,
  <span class="code-k">"wormHash"</span>: <span class="code-s">"sha256:8f4e2a9c...b71d"</span>
}</div>
          </div>
          <div>
            <div style="font-size:9.5px;font-weight:700;color:#475569;margin-bottom:4px;">TABEL SQL SERVER: dbo.OutboxMessages (TERBARU)</div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:9.6px;">
              <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
                <span class="mono"><strong>#9914</strong> · fleet-erp.po.approved</span>
                <span class="mono" style="color:#047857;font-weight:700;">DISPATCHED · 0 retry</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#fffbeb;border:1px solid #fde68a;border-radius:3px;">
                <span class="mono"><strong>#1190</strong> · tax.coretax.authorized</span>
                <span class="mono" style="color:#b45309;font-weight:700;">RETRY 2/5 · 503 DJP</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;">
                <span class="mono"><strong>#5521</strong> · wms.adj.approved</span>
                <span class="mono" style="color:#be123c;font-weight:700;">DLQ · Timeout VPN Bpn</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
                <span class="mono"><strong>#3105</strong> · eproc.pr.quorum_ok</span>
                <span class="mono" style="color:#047857;font-weight:700;">DISPATCHED · 82 ms</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;">
                <span class="mono"><strong>#0882</strong> · iam.jit.escalated</span>
                <span class="mono" style="color:#047857;font-weight:700;">DISPATCHED · 61 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Katalog 84 Aplikasi & RabbitMQ Transactional Outbox',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p6',
      breadcrumb: 'Integrasi & Messaging',
      pageTitle: 'Katalog 84 Aplikasi Terhubung & RabbitMQ Transactional Outbox',
      rightActionsHtml: `
        <span class="e-btn">${ic('key', 11)} Rotasi HMAC Secret</span>
        <span class="e-btn">${ic('refresh', 11)} Replay DLQ (5)</span>
        <span class="e-btn e-btn-primary">+ Daftarkan Aplikasi #85</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 7: AUDIT TRAIL WORM SHA-256, ISO 27001 & KEPATUHAN UU PDP
// ============================================================================
function renderP7() {
  const complianceCards = `<div class="e-kpi-strip" style="grid-template-columns:repeat(4, 1fr);">
    <div class="e-kpi" style="border-left:3px solid #047857;">
      <div class="e-kpi-top"><span>ISO/IEC 27001:2022 Annex A.8/A.9</span>${badge('98,6% Patuh', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">112 / 114 Kontrol</span></div>
      <div class="e-kpi-foot"><span>Audit Surveillance Nov 2026</span><span class="mono">0 Mayor</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #0f52ba;">
      <div class="e-kpi-top"><span>UU PDP No. 27/2022 &amp; PP 33/2026</span>${badge('Zero Leak', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">100% Redaksi Chat</span></div>
      <div class="e-kpi-foot"><span>NIK, NPWP &amp; Gaji ter-masking</span><span class="mono">WA/Teams</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #0369a1;">
      <div class="e-kpi-top"><span>Audit Eksternal KAP &amp; OJK POJK 15</span>${badge('Siap Ekspor', 'info')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">7 Tahun Retensi</span></div>
      <div class="e-kpi-foot"><span>WORM S3 Object Lock ID-JKT</span><span class="mono">Immutable</span></div>
    </div>
    <div class="e-kpi" style="border-left:3px solid #047857;">
      <div class="e-kpi-top"><span>Verifikasi Hash Chain WORM</span>${badge('VALID', 'ok')}</div>
      <div class="e-kpi-mid"><span class="e-kpi-val">#198.412 Blok</span></div>
      <div class="e-kpi-foot"><span>SHA-256 + Timestamp RFC 3161</span><span class="mono">0 Tamper</span></div>
    </div>
  </div>`;

  const auditRows = [
    { seq: '#198.412', ts: '09:24:06', ev: 'OUTBOX_ACKED', tone: 'ok', actor: 'System Relay Worker', doc: 'PO-2026-9902', ch: 'RabbitMQ AMQP', hash: '8f4e2a9c...b71d' },
    { seq: '#198.411', ts: '09:21:44', ev: 'SLA_ESCALATED', tone: 'bad', actor: 'Elsa Timer Engine', doc: 'PRC-2026-6640', ch: 'WA + Teams Alert', hash: '7c19d401...3e92' },
    { seq: '#198.410', ts: '09:18:12', ev: 'PAM_REQUESTED', tone: 'warn', actor: 'Rizky Mahendra (SRE)', doc: 'PAM-2026-3319', ch: 'IAM-Portal gRPC', hash: '6b82f11a...9c40' },
    { seq: '#198.409', ts: '09:11:30', ev: 'PJS_SUBSTITUTED', tone: 'info', actor: 'Dedi Kurniawan (Pjs)', doc: 'PO-2026-9908', ch: 'HRIS SK #118', hash: '5a03c8e7...1d28' },
    { seq: '#198.408', ts: '09:04:19', ev: 'APPROVAL_SIGNED', tone: 'ok', actor: 'Budi Santoso (CFO)', doc: 'PR-2026-3105', ch: 'Teams Card + SSO', hash: '4d91a3b2...7f15' },
    { seq: '#198.407', ts: '08:52:03', ev: 'SOD_VIOLATION_BLK', tone: 'bad', actor: 'Dwi Prasetyo (IT)', doc: 'PRC-2026-6629', ch: 'Web Portal SSO', hash: '3e77b6c4...0a84' },
    { seq: '#198.406', ts: '08:44:11', ev: 'TAX_CHECK_PASS', tone: 'ok', actor: 'Siti Rahmawati (Tax)', doc: 'PO-2026-9914', ch: 'CoreTax XML v2.1', hash: '2c58e9a1...6e33', selected: true },
    { seq: '#198.405', ts: '08:41:02', ev: 'CHECKER_VERIFIED', tone: 'ok', actor: 'Rina Kusuma (Proc)', doc: 'PO-2026-9914', ch: 'Web Portal MFA', hash: '1b44d2f8...8c19' },
    { seq: '#198.404', ts: '08:22:18', ev: 'APPROVAL_SIGNED', tone: 'ok', actor: 'Agus Rahman (GM)', doc: 'PO-2026-9899', ch: 'iOS FaceID App', hash: '0a12f7e3...4b90' },
    { seq: '#198.403', ts: '08:14:02', ev: 'DOC_INGESTED', tone: 'neutral', actor: 'Fleet-ERP Connector', doc: 'PO-2026-9914', ch: 'RabbitMQ AMQP', hash: '9f88c3d1...2a77' },
    { seq: '#198.402', ts: '07:58:40', ev: 'APPROVAL_SIGNED', tone: 'ok', actor: 'Nadia Permata (VP)', doc: 'CNT-2026-5079', ch: 'Web Portal + PKI', hash: '8e65b1a9...5f41' },
    { seq: '#198.401', ts: '07:45:12', ev: 'PJS_ACTIVATED', tone: 'info', actor: 'HRIS Sync Daemon', doc: 'SK-PJS-2026-125', ch: 'HRIS Webhook', hash: '7d31a0c8...9e02' },
    { seq: '#198.400', ts: '07:30:05', ev: 'SCHEMA_PUBLISHED', tone: 'accent', actor: 'H. Pratama (Arch)', doc: 'WF-CAPEX-V4.2', ch: 'Elsa Studio RBAC', hash: '6c19e4b7...3d56' },
    { seq: '#198.399', ts: '07:12:49', ev: 'APPROVAL_SIGNED', tone: 'ok', actor: 'Lestari Putri (VP)', doc: 'TRE-2026-8114', ch: 'Android Passkey', hash: '5b04d9a2...1c88' },
    { seq: '#198.398', ts: '07:05:31', ev: 'OUTBOX_ACKED', tone: 'ok', actor: 'System Relay Worker', doc: 'TRE-2026-8114', ch: 'BI-FAST H2H', hash: '4a92c1e6...8d04' },
    { seq: '#198.397', ts: '06:55:14', ev: 'PJS_SUBSTITUTED', tone: 'info', actor: 'Andi Saputra (Pjs)', doc: 'CRM-2026-7310', ch: 'HRIS SK #121', hash: '3f81b0d5...7c29' },
    { seq: '#198.396', ts: '06:48:02', ev: 'WORM_SEAL_DAILY', tone: 'accent', actor: 'Compliance Daemon', doc: 'MERKLE-20261122', ch: 'S3 Object Lock', hash: '2e70a9c4...6b18' },
  ];

  const maskRules = [
    { field: 'NIK Karyawan & NPWP Pribadi', web: 'Tampil (RBAC)', chat: 'Masking (****-9041)', law: 'UU PDP Ps. 4(2)' },
    { field: 'Nomor Rekening & Gaji/Bonus', web: 'Finance Only', chat: 'Diblokir Total', law: 'PP 33/2026' },
    { field: 'Lampiran Kontrak & RFQ PDF', web: 'Watermark + TTL', chat: 'Deep-Link SSO 15m', law: 'ISO 27001 A.8' },
    { field: 'Kredensial JIT / PAM Ticket', web: 'Vault Ephemeral', chat: 'Ringkasan Tiket Saja', law: 'ISO 27001 A.9' },
    { field: 'Data Medis & Cuti Sakit HRIS', web: 'HR Medical Only', chat: 'Diblokir Total', law: 'PMK 24/2022' },
    { field: 'Token OTP & Sesi Biometrik', web: 'Hash SHA-256', chat: 'Tidak Pernah Log', law: 'POJK 15/2024' },
  ];

  const contentHtml = `
    ${complianceCards}
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.45fr 0.85fr;gap:9px;">
      <div class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#0f52ba')} Buku Besar Audit Tak Terubah (WORM SHA-256 Ledger — 17 Entri Terbaru)</div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Append-Only SQL + S3 Lock', 'ok')}
            <span class="e-btn" style="height:21px;font-size:10px;">${ic('download', 10)} Paket Bukti Audit KAP</span>
          </div>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10.1px;">
            <thead>
              <tr>
                <th style="width:10%;">Blok #</th>
                <th style="width:9%;">WIB</th>
                <th style="width:18%;">Jenis Peristiwa</th>
                <th style="width:20%;">Aktor / Sistem</th>
                <th style="width:13%;">Dokumen</th>
                <th style="width:15%;">Kanal &amp; Auth</th>
                <th style="width:15%;">SHA-256 Chain</th>
              </tr>
            </thead>
            <tbody>
              ${auditRows.map((r) => `<tr class="${r.selected ? 'is-selected' : r.tone === 'bad' ? 'is-bad' : ''}">
                <td class="mono" style="font-weight:700;color:#0b3d91;">${esc(r.seq)}</td>
                <td class="mono" style="color:#475569;">${esc(r.ts)}</td>
                <td>${badge(r.ev, r.tone)}</td>
                <td style="font-weight:600;">${esc(r.actor)}</td>
                <td class="mono" style="font-weight:600;">${esc(r.doc)}</td>
                <td style="color:#475569;">${esc(r.ch)}</td>
                <td class="mono" style="font-size:9.3px;color:#047857;">${esc(r.hash)}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Total 198.412 Blok WORM Terverifikasi · Penyimpanan Immutable DCI Jakarta JK5</td>
                <td colspan="2" class="num mono" style="color:#047857;">0 Anomali · RFC 3161 OK</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <div class="e-panel" style="flex:1.05;">
          <div class="e-panel-head" style="background:#ecfdf5;">
            <div class="e-panel-title">${ic('shield', 13, '#047857')} Verifikator Rantai Kriptografi — Blok #198.406</div>
            ${badge('CHAIN VALID', 'ok')}
          </div>
          <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:7px;">
            <div style="display:flex;flex-direction:column;gap:5px;">
              <div class="kv-box">
                <div class="kv-lbl">Previous Block Hash (#198.405 · Checker Rina K.)</div>
                <div class="kv-val mono" style="font-size:9.4px;color:#475569;">1b44d2f890e4a11c72b85094e31fa02c7d41e8c19</div>
              </div>
              <div style="text-align:center;font-family:var(--e-mono);font-size:9px;color:#047857;font-weight:700;">▼ SHA-256(PrevHash || Payload || RFC3161_TS) ▼</div>
              <div class="kv-box" style="background:#ecfdf5;border-color:#a7f3d0;">
                <div class="kv-lbl" style="color:#047857;">Current Block Hash (#198.406 · Tax Check PO-2026-9914)</div>
                <div class="kv-val mono" style="font-size:9.4px;color:#047857;">2c58e9a14f70b82d61c39a55e804f119b2a7e6e33</div>
              </div>
            </div>
            <div class="kv-grid">
              <div class="kv-box"><div class="kv-lbl">Sertifikat Penandatangan</div><div class="kv-val mono">Corporate PKI / TTE BSrE</div></div>
              <div class="kv-box"><div class="kv-lbl">Otoritas Waktu (TSA)</div><div class="kv-val mono">tsa.nhi.co.id (RFC 3161)</div></div>
              <div class="kv-box"><div class="kv-lbl">IP &amp; Device Fingerprint</div><div class="kv-val mono">10.42.18.91 · Corp-MDM</div></div>
              <div class="kv-box"><div class="kv-lbl">Kebijakan Retensi WORM</div><div class="kv-val mono">7 Tahun · Locked Nov 2033</div></div>
            </div>
            <div class="kv-box" style="margin-top:auto;">
              <div class="kv-lbl">Merkle Root Harian (Anchor S3 Object Lock · 22 Nov 2026)</div>
              <div class="kv-val mono" style="font-size:9.3px;color:#0b3d91;">merkle:9e2f8a10c4b77d21f0a5e9c8341b6d02 · Verified 09:24 WIB</div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('eye', 13, '#0f52ba')} Kebijakan Masking PII UU PDP (WA &amp; Teams)</div>
            ${badge('PP 33/2026', 'accent')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:9.8px;">
              <thead>
                <tr>
                  <th style="width:34%;">Atribut Sensitif</th>
                  <th style="width:21%;">Portal Web</th>
                  <th style="width:25%;">Notif WA / Teams</th>
                  <th style="width:20%;">Dasar Hukum</th>
                </tr>
              </thead>
              <tbody>
                ${maskRules.map((m) => `<tr>
                  <td style="font-weight:600;">${esc(m.field)}</td>
                  <td>${esc(m.web)}</td>
                  <td style="color:#0b3d91;font-weight:600;">${esc(m.chat)}</td>
                  <td class="mono" style="font-size:9px;">${esc(m.law)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Audit Trail WORM SHA-256, ISO 27001 & UU PDP',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p7',
      breadcrumb: 'Keamanan & Kepatuhan',
      pageTitle: 'Audit Trail WORM SHA-256, ISO 27001:2022 & Tata Kelola UU PDP',
      rightActionsHtml: `
        <span class="e-btn">${ic('shield', 11)} Verifikasi Seluruh Rantai</span>
        <span class="e-btn e-btn-primary">${ic('download', 11, '#fff')} Ekspor Bundle Audit ISO</span>
      `,
      contentHtml,
    }),
  });
}

// ============================================================================
// PAGE 8: COMPANION MOBILE EKSEKUTIF (iOS/ANDROID), MS TEAMS & WHATSAPP
// ============================================================================
function renderP8() {
  const mobileInbox = `
    <div class="m-device">
      <div class="m-screen">
        <div class="m-statusbar">
          <span>09:24 WIB</span>
          <span>AlurApprove iOS</span>
          <span>5G · 94%</span>
        </div>
        <div style="background:#0f52ba;color:#ffffff;padding:8px 10px 9px;flex-shrink:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:12px;font-weight:800;">Inbox Eksekutif</span>
            <span style="font-size:9px;background:#0b3d91;padding:2px 6px;border-radius:3px;" class="mono">FaceID OK</span>
          </div>
          <div style="font-size:9.5px;color:#dbeafe;margin-top:2px;">12 menunggu aksi · 84 aplikasi aktif</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-top:7px;">
            <div style="background:#0b3d91;border-radius:3px;padding:4px 6px;">
              <div style="font-size:8px;color:#bfdbfe;">Aksi Anda</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;">12 item</div>
            </div>
            <div style="background:#0b3d91;border-radius:3px;padding:4px 6px;">
              <div style="font-size:8px;color:#bfdbfe;">Eksposur</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;">Rp 7,58M</div>
            </div>
            <div style="background:#0b3d91;border-radius:3px;padding:4px 6px;">
              <div style="font-size:8px;color:#bfdbfe;">SLA Med</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;">3,4 jam</div>
            </div>
          </div>
        </div>
        <div style="padding:7px 8px;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:9px;color:#64748b;font-weight:700;">
            <span>PRIORITAS TINGGI (SWIPE)</span>
            <span class="mono" style="color:#047857;">Cache Offline OK</span>
          </div>
          ${APPROVAL_ITEMS.slice(0, 5).map((item, idx) => `
            <div style="background:#ffffff;border:1px solid ${idx === 0 ? '#0f52ba' : '#d5dde8'};border-left:3px solid ${item.tone === 'warn' ? '#b45309' : '#047857'};border-radius:4px;padding:6px 7px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <span class="mono" style="font-size:8.8px;font-weight:700;color:#0f52ba;">${esc(item.code)} · ${esc(item.source)}</span>
                <span class="mono" style="font-size:8.6px;color:${item.slaPct >= 75 ? '#b45309' : '#047857'};font-weight:700;">${esc(item.slaText)}</span>
              </div>
              <div class="trunc" style="font-size:10.3px;font-weight:700;color:#0c1c36;margin-top:2px;">${esc(item.title)}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:3px;">
                <span class="mono" style="font-size:10.2px;font-weight:700;color:#0b3d91;">${esc(item.displayVal)}</span>
                ${badge(item.tier, item.tone)}
              </div>
            </div>
          `).join('')}
          <div style="margin-top:auto;background:#0f52ba;color:#ffffff;border-radius:4px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:700;">
            <span>Setujui Cepat 3 Item (Rp 2,13 M)</span>
            <span>FaceID &rarr;</span>
          </div>
        </div>
      </div>
    </div>`;

  const mobileDetail = `
    <div class="m-device">
      <div class="m-screen">
        <div class="m-statusbar" style="background:#0c1c36;">
          <span>09:24 WIB</span>
          <span>Android MDM · Passkey</span>
          <span>Wi-Fi · 89%</span>
        </div>
        <div style="background:#ffffff;border-bottom:1px solid #d5dde8;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <div class="mono" style="font-size:9px;color:#0f52ba;font-weight:700;">SAP-PO · PO-2026-9914</div>
            <div style="font-size:11.2px;font-weight:800;color:#0c1c36;">Capex Sparepart PC2000</div>
          </div>
          ${badge('SLA 4j', 'warn')}
        </div>
        <div style="padding:7px 8px;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;">
          <div style="background:#e8f0fe;border:1px solid #bfdbfe;border-radius:4px;padding:7px 8px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:8.6px;color:#0b3d91;font-weight:700;">NILAI TRANSAKSI (EXCL. PPN)</div>
              <div class="mono" style="font-size:14px;font-weight:800;color:#0c1c36;">Rp 1.420.000.000</div>
            </div>
            <span class="e-badge e-badge-ok mono">Pagu Aman</span>
          </div>

          <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 8px;display:flex;flex-direction:column;gap:4px;font-size:9.6px;">
            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Aplikasi Sumber</span><span style="font-weight:700;">Fleet-ERP (SAP)</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Vendor</span><span style="font-weight:700;">PT Komatsu Parts ID</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Cost Center</span><span class="mono" style="font-weight:700;">CC-4101 · Mining</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">CoreTax NPWP</span><span class="mono" style="color:#047857;font-weight:700;">Valid (PKP Aktif)</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Pemohon</span><span style="font-weight:600;">Agus Rahman</span></div>
          </div>

          <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 8px;">
            <div style="font-size:8.8px;font-weight:700;color:#64748b;margin-bottom:4px;">PROGRES DOA (TAHAP 3 DARI 4)</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9px;">
              <span style="color:#047857;font-weight:700;">Maker OK</span>
              <span>&rarr;</span>
              <span style="color:#047857;font-weight:700;">Checker OK</span>
              <span>&rarr;</span>
              <span style="color:#0f52ba;font-weight:800;">VP (Anda)</span>
              <span>&rarr;</span>
              <span style="color:#64748b;">CFO</span>
            </div>
          </div>

          <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 8px;font-size:9.3px;">
            <div style="font-weight:700;color:#0c1c36;margin-bottom:3px;">Lampiran Terverifikasi (2 PDF)</div>
            <div style="color:#0f52ba;" class="trunc">1. RFQ_Komatsu_PC2000_Rev2.pdf (2,4 MB)</div>
            <div style="color:#0f52ba;" class="trunc">2. BA_Kerusakan_Hydraulic_EX14.pdf (1,1 MB)</div>
          </div>

          <div style="background:#ffffff;border:1px solid #d5dde8;border-radius:4px;padding:6px 8px;font-size:9.2px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="font-weight:700;color:#0c1c36;">Utilisasi Pagu CC-4101</span>
              <span class="mono" style="color:#047857;font-weight:700;">81,2% · Sisa Rp 3,48M</span>
            </div>
            ${renderCapacityBar(81.2, { warnAt: 75, critAt: 90, showLabel: false })}
            <div style="color:#475569;margin-top:4px;line-height:1.3;">Catatan Rina K.: Harga sole-agent -4,2% vs penawaran awal; stok Sangatta kritis.</div>
          </div>

          <div style="margin-top:auto;background:#ffffff;border:1px solid #0f52ba;border-radius:4px;padding:7px 8px;display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9px;color:#0b3d91;font-weight:700;">
              <span>TANDA TANGAN BIOMETRIK</span>
              <span class="mono">WORM #198.413</span>
            </div>
            <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:5px;">
              <span class="e-btn e-btn-primary" style="justify-content:center;height:26px;">Setujui (Passkey)</span>
              <span class="e-btn" style="justify-content:center;height:26px;">Delegasi Pjs</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const channelRows = CHANNELS_30D.map((c) => `<tr>
    <td style="font-weight:600;color:#0c1c36;">${esc(c.channel)}</td>
    <td class="num mono" style="font-weight:700;">${fmtNum(c.approvals)}</td>
    <td class="num mono">${fmtPct(c.sharePct)}</td>
    <td class="num mono" style="color:#047857;font-weight:600;">${c.medianMin} mnt</td>
    <td class="num mono">${fmtPct(c.mfaPct)}</td>
    <td>${badge(c.status, c.status === 'Primer' ? 'accent' : c.status === 'Aktif' ? 'ok' : 'neutral')}</td>
  </tr>`).join('');

  const contentHtml = `
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:652px 1fr;gap:10px;">
      <div class="e-panel" style="background:#e6ecf4;">
        <div class="e-panel-head" style="background:#ffffff;">
          <div class="e-panel-title">${ic('globe', 13, '#0f52ba')} Pratinjau Aplikasi Mobile Eksekutif (iOS FaceID &amp; Android Passkey · Offline-First)</div>
          ${badge('MDM Intune Verified', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:10px;display:flex;align-items:stretch;justify-content:center;gap:12px;">
          ${mobileInbox}
          ${mobileDetail}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;flex:1.08;min-height:0;">
          <!-- MS Teams Adaptive Card -->
          <div class="e-panel">
            <div class="e-panel-head" style="background:#eef2ff;">
              <div class="e-panel-title">${ic('layers', 12, '#4338ca')} Microsoft Teams Adaptive Card</div>
              ${badge('Bot SSO Aktif', 'accent')}
            </div>
            <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
              <div style="border-left:3px solid #4338ca;background:#f8fafc;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:3px;padding:8px;display:flex;flex-direction:column;gap:5px;flex:1;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:10.5px;font-weight:800;color:#0c1c36;">AlurApprove Bot · Permintaan DoA</span>
                  <span class="mono" style="font-size:9px;color:#b45309;font-weight:700;">SLA 4j</span>
                </div>
                <div style="font-size:11.5px;font-weight:700;color:#0f52ba;">Capex Sparepart Excavator PC2000</div>
                <div style="font-size:9.8px;color:#334155;display:grid;grid-template-columns:92px 1fr;gap:2px 6px;">
                  <span style="color:#64748b;">Dokumen:</span><span class="mono" style="font-weight:600;">PO-2026-9914</span>
                  <span style="color:#64748b;">Aplikasi:</span><span>Fleet-ERP (Mining Ops)</span>
                  <span style="color:#64748b;">Nilai PO:</span><span class="mono" style="font-weight:700;">Rp 1.420.000.000</span>
                  <span style="color:#64748b;">Status DoA:</span><span>Tier-3 VP (Menunggu Anda)</span>
                  <span style="color:#64748b;">PII Guard:</span><span style="color:#047857;font-weight:600;">NPWP/Rekening Ter-masking</span>
                </div>
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;font-size:9.2px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <span style="font-weight:700;color:#0c1c36;">Jejak Quorum Elsa v3</span>
                    <span class="mono" style="color:#047857;font-weight:700;">Checker &amp; Tax OK</span>
                  </div>
                  <div style="color:#475569;">Menunggu: VP Mining Ops (Anda) + CFO Holding · Auto-Pjs aktif bila &gt; 4 jam.</div>
                </div>
                <div style="margin-top:auto;display:flex;gap:5px;padding-top:6px;">
                  <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;height:24px;">Setujui (SSO)</span>
                  <span class="e-btn" style="flex:1;justify-content:center;height:24px;">Delegasi Pjs</span>
                </div>
              </div>
            </div>
          </div>

          <!-- WhatsApp Business Enterprise Alert -->
          <div class="e-panel">
            <div class="e-panel-head" style="background:#ecfdf5;">
              <div class="e-panel-title">${ic('bell', 12, '#047857')} WhatsApp Business Enterprise Alert</div>
              ${badge('Verified Official', 'ok')}
            </div>
            <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;background:#f4f7f5;">
              <div style="background:#ffffff;border:1px solid #bbf7d0;border-left:3px solid #047857;border-radius:4px;padding:8px 9px;display:flex;flex-direction:column;gap:5px;flex:1;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:10.3px;font-weight:800;color:#047857;">NHI AlurApprove Official</span>
                  <span class="mono" style="font-size:9px;color:#64748b;">08:45 WIB</span>
                </div>
                <div style="font-size:10px;color:#1e293b;line-height:1.45;">
                  Yth. <strong>Ir. Hendra Wijaya</strong>,<br/>
                  Terdapat permintaan persetujuan prioritas:<br/>
                  • Dokumen: <span class="mono">PO-2026-9914</span> (Fleet-ERP)<br/>
                  • Nilai: <strong class="mono">Rp 1,42 M</strong> · Batas SLA: <strong>4 jam</strong><br/>
                  • Status: Checker &amp; Tax telah lolos.
                </div>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:5px 7px;font-size:9.2px;color:#475569;">
                  Demi kepatuhan <strong>UU PDP</strong>, detail lampiran &amp; rekening tidak dikirim via chat. Buka tautan terenkripsi (berlaku 15 menit):
                  <div class="mono" style="color:#0f52ba;font-weight:700;margin-top:2px;">https://approve.nhi.co.id/t/9914-x8k2</div>
                </div>
                <div style="display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:8.8px;color:#64748b;padding:3px 2px;">
                  <span>Terkirim 08:45 · Dibaca 08:47</span>
                  <span style="color:#047857;font-weight:700;">TLS 1.3 · No-PII OK</span>
                </div>
                <div style="margin-top:auto;display:flex;gap:5px;">
                  <span class="e-btn" style="flex:1;justify-content:center;height:23px;color:#047857;border-color:#a7f3d0;">Buka di App (FaceID)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="e-panel" style="flex:0.92;">
          <div class="e-panel-head">
            <div class="e-panel-title">${ic('activity', 13, '#0f52ba')} Telemetri Adopsi Omnichannel &amp; Kecepatan Respon Eksekutif (30 Hari)</div>
            <span class="e-panel-sub mono">Total = 14.820 persetujuan · 100% MFA/Biometrik</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10.3px;">
              <thead>
                <tr>
                  <th style="width:40%;">Kanal Eksekutif</th>
                  <th class="num" style="width:12%;">Disetujui</th>
                  <th class="num" style="width:11%;">Porsi</th>
                  <th class="num" style="width:13%;">Med. Respon</th>
                  <th class="num" style="width:12%;">MFA/Bio</th>
                  <th style="width:12%;">Status</th>
                </tr>
              </thead>
              <tbody>${channelRows}</tbody>
              <tfoot>
                <tr>
                  <td>Konsolidasi Seluruh Kanal (30 Hari)</td>
                  <td class="num mono">${fmtNum(TOTAL_30D)}</td>
                  <td class="num mono">100,0%</td>
                  <td class="num mono" style="color:#047857;">3,4 jam</td>
                  <td class="num mono">100,0%</td>
                  <td>${badge('Rekonsiliasi OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:auto;padding:8px 10px;background:#f8fafc;border-top:1px solid #d5dde8;display:flex;flex-direction:column;gap:5px;">
              <div style="display:flex;justify-content:space-between;font-size:9.6px;font-weight:700;color:#0c1c36;">
                <span>Komposisi Adopsi Kanal Eksekutif (14.820 Transaksi · 30 Hari)</span>
                <span class="mono" style="color:#0f52ba;">56,6% Non-Web (Mobile + Teams + WA)</span>
              </div>
              <div style="display:flex;height:10px;border-radius:3px;overflow:hidden;border:1px solid #cbd5e1;">
                <div style="width:41.4%;background:#0f52ba;" title="Web 41,4%"></div>
                <div style="width:30.2%;background:#047857;" title="Mobile 30,2%"></div>
                <div style="width:18.2%;background:#4338ca;" title="Teams 18,2%"></div>
                <div style="width:8.2%;background:#0369a1;" title="WA 8,2%"></div>
                <div style="width:2.0%;background:#94a3b8;" title="Email 2,0%"></div>
              </div>
              <div style="display:flex;gap:12px;font-size:9.2px;color:#475569;">
                <span><span style="display:inline-block;width:7px;height:7px;background:#0f52ba;margin-right:4px;"></span>Web 41,4%</span>
                <span><span style="display:inline-block;width:7px;height:7px;background:#047857;margin-right:4px;"></span>Mobile 30,2%</span>
                <span><span style="display:inline-block;width:7px;height:7px;background:#4338ca;margin-right:4px;"></span>Teams 18,2%</span>
                <span><span style="display:inline-block;width:7px;height:7px;background:#0369a1;margin-right:4px;"></span>WA 8,2%</span>
                <span><span style="display:inline-block;width:7px;height:7px;background:#94a3b8;margin-right:4px;"></span>Email 2,0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return wrapEnterpriseHtml({
    title: 'AlurApprove 80+ — Companion Mobile Eksekutif, MS Teams & WhatsApp',
    extraCss: FIORI_EXTRA_CSS,
    bodyHtml: renderFioriShell({
      activeTab: 'p8',
      breadcrumb: 'Kanal Eksekutif Omnichannel',
      pageTitle: 'Companion Mobile (iOS/Android), Microsoft Teams & WhatsApp Enterprise',
      rightActionsHtml: `
        <span class="e-btn">${ic('bell', 11)} Uji Kirim Notifikasi WA</span>
        <span class="e-btn e-btn-primary">${ic('lock', 11, '#fff')} Kebijakan Biometrik MDM</span>
      `,
      contentHtml,
    }),
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
