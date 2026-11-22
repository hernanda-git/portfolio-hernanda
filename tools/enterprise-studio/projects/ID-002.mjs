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
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-002',
  name: 'NusaRAG Legal',
  reference: 'Thomson Reuters Practical Law + RelativityOne Legal Review Workbench',
  persona: 'R. Suryadi, S.H., LL.M. · Senior Legal Counsel · PT Bank Nusantara Tbk',
  pages: [
    { slug: 'p1', title: 'Matriks Audit Klausul & Register Kontrak' },
    { slug: 'p2', title: 'Komparator Redline Dwibahasa EN-ID' },
    { slug: 'p3', title: 'Checklist DPA UU PDP & Batas 3x24 Jam' },
    { slug: 'p4', title: 'Korpus JDIH & Mesin Hybrid RAG pgvector' },
    { slug: 'p5', title: 'Memo Risiko Hukum, Partner Sign-Off & e-Meterai' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================
const MATTER = {
  code: 'MATTER-2026-884',
  title: 'Master Service Agreement — Cloud Core Banking & Disaster Recovery',
  counterparty: 'SingTel Cloud Enterprise Pte. Ltd. (Singapura)',
  client: 'PT Bank Nusantara Tbk (KBMI 3 · Diawasi OJK)',
  docName: 'MSA_SingTel_CoreCloud_v4.2_Bilingual.docx',
  pages: 42,
  totalClauses: 48,
  auditedClauses: 48,
  contractMonths: 36,
  contractValueIdr: 48000000000,
  annualFeeIdr: 16000000000,
  enLiabilityCapIdr: 16000000000, // 100% of 12-month fees (EN text)
  idLiabilityCapIdr: 2400000000, // 15% of 12-month fees (mistranslated ID text)
  bilingualExposureDeltaIdr: 13600000000,
  memoNumber: '084/LEG-CORP/XI/2026',
  emeteraiSerial: 'ID-PERURI-2026-8841-902A',
  wormHash: 'sha256:9d4a81e2c07b55f8e1a30944b6d2c19a7f1c',
};

const MATTER_DOCS = [
  { name: 'MSA_SingTel_CoreCloud_v4.2_Bilingual.docx', type: 'Kontrak Induk', units: 48, risk: '6 Tinggi', tone: 'bad', active: true },
  { name: 'Lampiran_B_DPA_UU_PDP_v2.1.docx', type: 'Lampiran DPA', units: 18, risk: '4 Blocker', tone: 'bad', active: false },
  { name: 'Lampiran_C_SLA_Tier4_CoreBanking.pdf', type: 'Lampiran SLA', units: 14, risk: '2 Revisi', tone: 'warn', active: false },
  { name: 'Form_SelfAssessment_POJK11_2022.xlsx', type: 'Kepatuhan OJK', units: 9, risk: 'Patuh', tone: 'ok', active: false },
];

// Exact 48-clause statutory distribution
const REGULATION_BREAKDOWN = [
  { code: 'UU 27/2022', name: 'UU PDP No. 27/2022', total: 18, high: 3, warn: 3, ok: 12 },
  { code: 'UU 24/2009', name: 'UU 24/2009 & Dwibahasa', total: 6, high: 2, warn: 0, ok: 4 },
  { code: 'POJK 11/22', name: 'POJK 11/2022 & TI Bank', total: 8, high: 1, warn: 2, ok: 5 },
  { code: 'KUHPerdata', name: 'KUHPerdata Buku III', total: 12, high: 0, warn: 2, ok: 10 },
  { code: 'UU CK/BANI', name: 'UU Cipta Kerja & BANI', total: 4, high: 0, warn: 0, ok: 4 },
];

// 16 priority clauses rendered in Page 1 register (includes all 6 high-risk, 5 key revisions, 5 verified compliant)
const PRIORITY_CLAUSES = [
  { code: 'CL-14.2', title: 'Transfer Data Lintas Negara', sub: 'Belum mencantumkan dasar kecukupan Pasal 56 UU PDP & persetujuan eksplisit', law: 'UU 27/2022 Ps. 56', lang: 'Selaras', riskLabel: 'Risiko Tinggi', status: 'Ditandai', tone: 'bad', selected: true, pdpHigh: true, bilingualDiff: false, exposure: 'Sanksi 2% Rev' },
  { code: 'CL-19.1', title: 'Bahasa yang Berlaku (Prevailing)', sub: 'Teks Inggris dinyatakan mengungguli Bahasa Indonesia — melanggar Pasal 31', law: 'UU 24/2009 Ps. 31', lang: 'Selisih EN/ID', riskLabel: 'Tidak Patuh', status: 'Ditandai', tone: 'bad', pdpHigh: false, bilingualDiff: true, exposure: 'Batal Demi Hukum' },
  { code: 'CL-11.3', title: 'Batas Ganti Rugi (Liability Cap)', sub: 'EN: excluding indirect (100% fee); ID: termasuk kerugian tak langsung (15%)', law: 'UU 24/2009 · KUHPer', lang: 'Selisih EN/ID', riskLabel: 'Risiko Tinggi', status: 'Ditandai', tone: 'bad', pdpHigh: false, bilingualDiff: true, exposure: 'Rp 13,6 Miliar' },
  { code: 'CL-06.3', title: 'Penunjukan DPO & Sub-Pemroses', sub: 'Vendor menunjuk sub-prosesor tanpa persetujuan tertulis Pengendali Data', law: 'UU 27/2022 Ps. 52-53', lang: 'Selaras', riskLabel: 'Risiko Tinggi', status: 'Ditandai', tone: 'bad', pdpHigh: true, bilingualDiff: false, exposure: 'Celah DPA' },
  { code: 'CL-17.2', title: 'Retensi & Pemusnahan Data', sub: 'Tidak menetapkan jadwal penghapusan bersertifikat pasca terminasi 30 hari', law: 'UU 27/2022 Ps. 44', lang: 'Selaras', riskLabel: 'Risiko Tinggi', status: 'Ditandai', tone: 'bad', pdpHigh: true, bilingualDiff: false, exposure: 'Celah DPA' },
  { code: 'CL-09.2', title: 'Hak Audit OJK, BPK & Bank', sub: 'Membatasi hak pemeriksaan regulator hanya 1x/2 tahun dengan biaya bank', law: 'POJK 11/2022 Ps. 21', lang: 'Selaras', riskLabel: 'Risiko Tinggi', status: 'Ditandai', tone: 'bad', pdpHigh: false, bilingualDiff: false, exposure: 'Temuan OJK' },
  { code: 'CL-08.4', title: 'Batas Notifikasi Kebocoran Data', sub: 'Tertulis 7 hari kerja; UU PDP mewajibkan pemberitahuan tertulis 3x24 jam', law: 'UU 27/2022 Ps. 46', lang: 'Selaras', riskLabel: 'Aturan 3x24j', status: 'Revisi', tone: 'warn', pdpHigh: false, bilingualDiff: false, exposure: 'Blocker DPA' },
  { code: 'CL-14.5', title: 'Enkripsi BYOK & Lokasi Server DCI', sub: 'Kunci HSM masih dikelola bersama; perlu pemisahan tenant di DCI JK5', law: 'UU 27/2022 Ps. 35', lang: 'Selaras', riskLabel: 'Perlu Revisi', status: 'Revisi', tone: 'warn', pdpHigh: false, bilingualDiff: false, exposure: 'Kontrol Teknis' },
  { code: 'CL-16.4', title: 'Exit Strategy & Transisi Cloud', sub: 'Masa transisi 30 hari terlalu singkat untuk migrasi Core Banking (min. 90h)', law: 'POJK 11/2022 Ps. 28', lang: 'Selaras', riskLabel: 'Perlu Revisi', status: 'Revisi', tone: 'warn', pdpHigh: false, bilingualDiff: false, exposure: 'Kontinuitas' },
  { code: 'CL-12.5', title: 'Keadaan Kahar (Force Majeure)', sub: 'Definisi siber-insiden dimasukkan sebagai force majeure sepihak vendor', law: 'KUHPerdata Ps. 1245', lang: 'Selaras', riskLabel: 'Perlu Revisi', status: 'Revisi', tone: 'warn', pdpHigh: false, bilingualDiff: false, exposure: 'Klausul Baku' },
  { code: 'CL-15.1', title: 'Hak Kekayaan Intelektual & API', sub: 'Kepemilikan skema konfigurasi kustom bank belum ditegaskan milik Klien', law: 'KUHPerdata Ps. 1338', lang: 'Selaras', riskLabel: 'Perlu Revisi', status: 'Revisi', tone: 'warn', pdpHigh: false, bilingualDiff: false, exposure: 'Aset IP' },
  { code: 'CL-22.0', title: 'Klausul Arbitrase BANI', sub: 'Kedudukan Jakarta, hukum RI, dan Bahasa Indonesia sudah sepenuhnya sesuai', law: 'UU 30/1999 · BANI', lang: 'Selaras', riskLabel: 'Patuh', status: 'Terverifikasi', tone: 'ok', pdpHigh: false, bilingualDiff: false, exposure: 'Terkendali' },
  { code: 'CL-04.1', title: 'Lingkup Layanan & SLA 99,95%', sub: 'Kredit layanan berjenjang dan RPO 15 menit sesuai standar tier-4', law: 'POJK 11/2022 Ps. 14', lang: 'Selaras', riskLabel: 'Patuh', status: 'Terverifikasi', tone: 'ok', pdpHigh: false, bilingualDiff: false, exposure: 'Terkendali' },
  { code: 'CL-19.4', title: 'Domisili Hukum & Pajak PPh 26', sub: 'Pemotongan PPh Pasal 26 dan SKD DGT-1 Singapura tercantum lengkap', law: 'KUHPerdata · UU PPh', lang: 'Selaras', riskLabel: 'Patuh', status: 'Terverifikasi', tone: 'ok', pdpHigh: false, bilingualDiff: false, exposure: 'Terkendali' },
  { code: 'CL-21.3', title: 'Kerahasiaan & Rahasia Bank', sub: 'Kewajiban non-disclosure berlaku 5 tahun pasca berakhirnya perjanjian', law: 'UU Perbankan Ps. 40', lang: 'Selaras', riskLabel: 'Patuh', status: 'Terverifikasi', tone: 'ok', pdpHigh: false, bilingualDiff: false, exposure: 'Terkendali' },
  { code: 'CL-03.2', title: 'Kepatuhan Ketenagakerjaan & TKA', sub: 'Tenaga ahli on-site wajib memenuhi izin kerja sesuai UU Cipta Kerja', law: 'UU 6/2023 Cipta', lang: 'Selaras', riskLabel: 'Patuh', status: 'Terverifikasi', tone: 'ok', pdpHigh: false, bilingualDiff: false, exposure: 'Terkendali' },
];

// 18 mandatory DPA checklist controls (14 Terpenuhi + 4 Blocker = 18)
const DPA_CHECKLIST = [
  { code: 'DPA-01', req: 'Dasar Pemrosesan Sah & Kontraktual', law: 'UU PDP Ps. 20(2)', clause: 'CL-04.1', status: 'Terpenuhi', tone: 'ok', action: 'Terverifikasi otomatis' },
  { code: 'DPA-02', req: 'Pembatasan Tujuan Pemrosesan Spesifik', law: 'UU PDP Ps. 21', clause: 'CL-04.3', status: 'Terpenuhi', tone: 'ok', action: 'Terverifikasi otomatis' },
  { code: 'DPA-03', req: 'Klasifikasi Data Pribadi Spesifik (Keuangan/KYC)', law: 'UU PDP Ps. 4(2)', clause: 'CL-05.1', status: 'Terpenuhi', tone: 'ok', action: 'Lampiran B Tabel 1 OK' },
  { code: 'DPA-04', req: 'Mekanisme Persetujuan Eksplisit Subjek Data', law: 'UU PDP Ps. 22', clause: 'CL-05.4', status: 'Terpenuhi', tone: 'ok', action: 'Terverifikasi otomatis' },
  { code: 'DPA-05', req: 'Pemenuhan Hak Akses & Salinan Data Subjek', law: 'UU PDP Ps. 5–7', clause: 'CL-07.1', status: 'Terpenuhi', tone: 'ok', action: 'SLA respons 3x24 jam OK' },
  { code: 'DPA-06', req: 'Hak Perbaikan, Penghapusan & Penarikan', law: 'UU PDP Ps. 8–9', clause: 'CL-07.4', status: 'Terpenuhi', tone: 'ok', action: 'API purge tersedia' },
  { code: 'DPA-07', req: 'Batas Peran Pengendali vs Prosesor Data', law: 'UU PDP Ps. 51', clause: 'CL-06.1', status: 'Terpenuhi', tone: 'ok', action: 'Terverifikasi otomatis' },
  { code: 'DPA-08', req: 'Penunjukan Pejabat Pelindung Data (DPO/PPDP)', law: 'UU PDP Ps. 53', clause: 'CL-06.3', status: 'Blocker', tone: 'bad', action: 'Wajib cantumkan kontak DPO resmi vendor' },
  { code: 'DPA-09', req: 'Kewajiban DPIA (Penilaian Dampak Pemrosesan)', law: 'UU PDP Ps. 34', clause: 'CL-10.2', status: 'Terpenuhi', tone: 'ok', action: 'DPIA Q4-2026 dilampirkan' },
  { code: 'DPA-10', req: 'Keamanan Teknis, Enkripsi AES-256 & ISO 27001', law: 'UU PDP Ps. 35', clause: 'CL-14.5', status: 'Terpenuhi', tone: 'ok', action: 'Sertifikat aktif s.d. 2028' },
  { code: 'DPA-11', req: 'Rekaman Aktivitas Pemrosesan (RoPA / Audit Log)', law: 'UU PDP Ps. 31', clause: 'CL-10.4', status: 'Terpenuhi', tone: 'ok', action: 'Log WORM 5 tahun aktif' },
  { code: 'DPA-12', req: 'Pengendalian Sub-Prosesor & Daftar Terbuka', law: 'UU PDP Ps. 52', clause: 'CL-06.3', status: 'Terpenuhi', tone: 'ok', action: 'Daftar 3 sub-prosesor ada (perlu hak veto)' },
  { code: 'DPA-13', req: 'Notifikasi Tertulis Kebocoran Data Maks. 3x24 Jam', law: 'UU PDP Ps. 46(1)', clause: 'CL-08.4', status: 'Blocker', tone: 'bad', action: 'Ubah 7 hari kerja -> maks. 3x24 jam (vendor T+6j)' },
  { code: 'DPA-14', req: 'Dasar Kecukupan Transfer Data Lintas Negara', law: 'UU PDP Ps. 56', clause: 'CL-14.2', status: 'Blocker', tone: 'bad', action: 'Tambahkan klausul kecukupan SG + BCR + consent' },
  { code: 'DPA-15', req: 'Retensi, Pengembalian & Pemusnahan Bersertifikat', law: 'UU PDP Ps. 44', clause: 'CL-17.2', status: 'Blocker', tone: 'bad', action: 'Tetapkan pemusnahan NIST 800-88 dalam 30 hari' },
  { code: 'DPA-16', req: 'Hak Pemeriksaan Pengendali & Regulator OJK', law: 'POJK 11/2022 Ps. 21', clause: 'CL-09.2', status: 'Terpenuhi', tone: 'ok', action: 'Klausul akses ada (revisi frekuensi di MSA)' },
  { code: 'DPA-17', req: 'Penempatan Pusat Data Utama di Wilayah RI', law: 'PP 71/2019 Ps. 20', clause: 'CL-14.1', status: 'Terpenuhi', tone: 'ok', action: 'Primary DCI Jakarta JK5 terverifikasi' },
  { code: 'DPA-18', req: 'Indemnifikasi & Tanggung Jawab Pelanggaran Data', law: 'UU PDP Ps. 12', clause: 'CL-11.5', status: 'Terpenuhi', tone: 'ok', action: 'Selaraskan cap dengan revisi CL-11.3' },
];

// JDIH Corpus Index (10 rows summing EXACTLY to 312 docs, 48.210 pasal, 192.840 chunks)
const JDIH_CORPUS = [
  { id: 'JDIH-01', reg: 'UU No. 27 Tahun 2022 — Pelindungan Data Pribadi', docs: 1, pasal: 76, chunks: 304, source: 'jdih.setneg.go.id', sync: '22 Nov 04:00', citations: 18, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-02', reg: 'UU No. 24 Tahun 2009 — Bahasa & Perpres 63/2019', docs: 2, pasal: 118, chunks: 472, source: 'jdih.kemendikbud', sync: '22 Nov 04:00', citations: 6, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-03', reg: 'KUHPerdata (BW) — Buku I–IV & Perikatan Komersial', docs: 1, pasal: 1993, chunks: 7972, source: 'jdih.bphn.go.id', sync: '22 Nov 04:00', citations: 12, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-04', reg: 'UU No. 6 Tahun 2023 — Penetapan Perppu Cipta Kerja', docs: 1, pasal: 186, chunks: 744, source: 'jdih.setneg.go.id', sync: '22 Nov 04:00', citations: 2, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-05', reg: 'POJK No. 11/POJK.03/2022 — Penyelenggaraan TI Bank', docs: 4, pasal: 142, chunks: 568, source: 'jdih.ojk.go.id', sync: '22 Nov 04:02', citations: 8, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-06', reg: 'PP No. 71 Tahun 2019 — Penyelenggaraan Sistem Elektronik', docs: 2, pasal: 102, chunks: 408, source: 'jdih.komdigi.go.id', sync: '22 Nov 04:02', citations: 4, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-07', reg: 'Permenkominfo No. 5/2020 — PSE Lingkup Privat', docs: 3, pasal: 64, chunks: 256, source: 'jdih.komdigi.go.id', sync: '22 Nov 04:03', citations: 3, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-08', reg: 'UU No. 30/1999 Arbitrase & Peraturan BANI 2022', docs: 2, pasal: 129, chunks: 516, source: 'jdih.bphn.go.id', sync: '22 Nov 04:03', citations: 2, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-09', reg: 'UU Perbankan, Pajak PPh 26 & Peraturan BI/OJK Terkait', docs: 24, pasal: 2480, chunks: 9920, source: 'jdih.ojk / bi.go.id', sync: '22 Nov 04:05', citations: 5, status: 'Aktif', tone: 'ok' },
  { id: 'JDIH-10', reg: 'Kompilasi PP, Perpres, Permen & Yurisprudensi MA', docs: 272, pasal: 42920, chunks: 171680, source: 'jdih.mahkamahagung', sync: '22 Nov 04:08', citations: 9, status: 'Aktif', tone: 'ok' },
];

// Hybrid RAG Pipeline Span Waterfall (sums EXACTLY to 318 ms)
const RAG_SPANS = [
  { label: '1. Normalisasi Teks & Pasal', start: 0, dur: 14, color: '#1f4e5f' },
  { label: '2. RBAC Matter Isolation RLS', start: 14, dur: 12, color: '#2b6b80' },
  { label: '3. BM25 Lexical Index JDIH', start: 26, dur: 28, color: '#1e5478' },
  { label: '4. pgvector HNSW (dim=1024)', start: 54, dur: 64, color: '#146c43' },
  { label: '5. Legal Cross-Encoder Rerank', start: 118, dur: 142, color: '#9a5806' },
  { label: '6. Citation Verifier & SHA-256', start: 260, dur: 58, color: '#9b1c2e' },
];

const HIGH_RISK_FINDINGS = PRIORITY_CLAUSES.filter((c) => c.tone === 'bad');

export function verifyMath() {
  const sumRegTotal = REGULATION_BREAKDOWN.reduce((a, r) => a + r.total, 0);
  const sumRegHigh = REGULATION_BREAKDOWN.reduce((a, r) => a + r.high, 0);
  const sumRegWarn = REGULATION_BREAKDOWN.reduce((a, r) => a + r.warn, 0);
  const sumRegOk = REGULATION_BREAKDOWN.reduce((a, r) => a + r.ok, 0);

  if (sumRegTotal !== MATTER.totalClauses || sumRegTotal !== 48) {
    throw new Error(`Clause total mismatch: ${sumRegTotal}`);
  }
  if (sumRegHigh + sumRegWarn + sumRegOk !== sumRegTotal) {
    throw new Error(`Severity sum mismatch: ${sumRegHigh}+${sumRegWarn}+${sumRegOk} != ${sumRegTotal}`);
  }
  if (sumRegHigh !== 6 || HIGH_RISK_FINDINGS.length !== 6) {
    throw new Error(`High-risk count mismatch: reg=${sumRegHigh}, list=${HIGH_RISK_FINDINGS.length}`);
  }
  const pdpHighCount = PRIORITY_CLAUSES.filter((c) => c.pdpHigh).length;
  const bilingualCount = PRIORITY_CLAUSES.filter((c) => c.bilingualDiff).length;
  if (pdpHighCount !== 3) throw new Error(`UU PDP high gap mismatch: ${pdpHighCount}`);
  if (bilingualCount !== 2) throw new Error(`Bilingual diff count mismatch: ${bilingualCount}`);

  if (MATTER.contractValueIdr / (MATTER.contractMonths / 12) !== MATTER.annualFeeIdr) {
    throw new Error('Annual fee mismatch');
  }
  if (MATTER.enLiabilityCapIdr - MATTER.idLiabilityCapIdr !== MATTER.bilingualExposureDeltaIdr) {
    throw new Error('Bilingual exposure delta mismatch');
  }

  const dpaPass = DPA_CHECKLIST.filter((d) => d.tone === 'ok').length;
  const dpaFail = DPA_CHECKLIST.filter((d) => d.tone === 'bad').length;
  if (DPA_CHECKLIST.length !== 18 || dpaPass !== 14 || dpaFail !== 4) {
    throw new Error(`DPA checklist mismatch: total=${DPA_CHECKLIST.length}, pass=${dpaPass}, fail=${dpaFail}`);
  }

  const sumDocs = JDIH_CORPUS.reduce((a, c) => a + c.docs, 0);
  const sumPasal = JDIH_CORPUS.reduce((a, c) => a + c.pasal, 0);
  const sumChunks = JDIH_CORPUS.reduce((a, c) => a + c.chunks, 0);
  if (sumDocs !== 312) throw new Error(`JDIH docs mismatch: ${sumDocs}`);
  if (sumPasal !== 48210) throw new Error(`JDIH pasal mismatch: ${sumPasal}`);
  if (sumChunks !== 192840) throw new Error(`JDIH chunks mismatch: ${sumChunks}`);

  const sumRagMs = RAG_SPANS.reduce((a, s) => a + s.dur, 0);
  if (sumRagMs !== 318) throw new Error(`RAG span sum mismatch: ${sumRagMs}`);
}

const DPA_PASS_COUNT = DPA_CHECKLIST.filter((d) => d.tone === 'ok').length;
const DPA_FAIL_COUNT = DPA_CHECKLIST.filter((d) => d.tone === 'bad').length;
const DPA_PCT = (DPA_PASS_COUNT / DPA_CHECKLIST.length) * 100;
const TOTAL_HIGH = REGULATION_BREAKDOWN.reduce((a, r) => a + r.high, 0);
const TOTAL_WARN = REGULATION_BREAKDOWN.reduce((a, r) => a + r.warn, 0);
const TOTAL_OK = REGULATION_BREAKDOWN.reduce((a, r) => a + r.ok, 0);

// Custom editorial legal icons (1.5px stroke, zero emoji)
function legalIcon(name, size = 14, color = 'currentColor') {
  const paths = {
    scale: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 7h6l-3-7z"/><path d="M19 7l-3 7h6l-3-7z"/><path d="M8 21h8"/>',
    splitDiff: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="6" y1="8" x2="9.5" y2="8"/><line x1="6" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="8" x2="18" y2="8"/><line x1="14.5" y1="12" x2="18" y2="12"/><line x1="14.5" y1="16" x2="17" y2="16"/>',
    bookLaw: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/>',
    stamp: '<path d="M5 20h14"/><path d="M6 17h12v-2a2 2 0 0 0-2-2h-2v-3a3 3 0 1 0-4 0v3H8a2 2 0 0 0-2 2v2z"/>',
    checklist: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    penSign: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  };
  if (paths[name]) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${paths[name]}</svg>`;
  }
  return ic(name, size, color);
}

// ============================================================================
// EDITORIAL LEGAL SHELL (DISTINCT FROM ID-001: ALABASTER PAPER + FOREST-SLATE CHROME + HORIZONTAL STAGE TABS + 44PX ICON RAIL)
// ============================================================================
const SHARED_LEGAL_CSS = `
  :root {
    --nr-paper: #ffffff;
    --nr-alabaster: #faf9f6;
    --nr-linen: #f3f1eb;
    --nr-stone: #ece8df;
    --nr-border: #ddd8cd;
    --nr-border-strong: #c5beb0;
    --nr-chrome: #163642;
    --nr-chrome-2: #1e4656;
    --nr-chrome-bd: #2a596c;
    --nr-accent: #1f4e5f;
    --nr-accent-soft: #e8f1f4;
    --nr-accent-ink: #143642;
    --nr-ink: #162127;
    --nr-ink-2: #415058;
    --nr-muted: #68767e;
    --nr-bad: #9b1c2e;
    --nr-bad-bg: #fdf2f3;
    --nr-bad-bd: #f0c2c9;
    --nr-warn: #9a5806;
    --nr-warn-bg: #fef9ec;
    --nr-warn-bd: #efd59a;
    --nr-ok: #146c43;
    --nr-ok-bg: #eef8f2;
    --nr-ok-bd: #b3dec5;
    --nr-info: #1e5478;
    --nr-info-bg: #eef5fa;
    --nr-info-bd: #bdd5e6;
    --nr-serif: "Georgia", "Cambria", "Times New Roman", serif;
  }

  /* Override chrome.mjs semantic tokens to warm editorial legal palette */
  :root {
    --e-accent: var(--nr-accent);
    --e-accent-soft: var(--nr-accent-soft);
    --e-accent-ink: var(--nr-accent-ink);
    --e-bg: var(--nr-alabaster);
    --e-surface: var(--nr-paper);
    --e-surface-2: var(--nr-linen);
    --e-border: var(--nr-border);
    --e-border-strong: var(--nr-border-strong);
    --e-text: var(--nr-ink);
    --e-text-2: var(--nr-ink-2);
    --e-muted: var(--nr-muted);
    --e-ok: var(--nr-ok);
    --e-ok-bg: var(--nr-ok-bg);
    --e-ok-bd: var(--nr-ok-bd);
    --e-warn: var(--nr-warn);
    --e-warn-bg: var(--nr-warn-bg);
    --e-warn-bd: var(--nr-warn-bd);
    --e-bad: var(--nr-bad);
    --e-bad-bg: var(--nr-bad-bg);
    --e-bad-bd: var(--nr-bad-bd);
    --e-info: var(--nr-info);
    --e-info-bg: var(--nr-info-bg);
    --e-info-bd: var(--nr-info-bd);
  }

  .serif { font-family: var(--nr-serif); }

  /* Top Legal Matter Bar */
  .nr-topbar {
    height: 40px;
    background: var(--nr-chrome);
    color: #f4f7f8;
    border-bottom: 1px solid #0e252e;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .nr-top-left, .nr-top-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .nr-brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: -0.01em;
    color: #ffffff;
    white-space: nowrap;
  }
  .nr-seal {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: #ffffff;
    color: var(--nr-chrome);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--nr-serif);
    font-size: 12px;
    font-weight: 800;
    border: 1px solid #c9d9df;
  }
  .nr-vsep {
    width: 1px;
    height: 18px;
    background: var(--nr-chrome-bd);
    flex-shrink: 0;
  }
  .nr-matter-pill {
    height: 25px;
    padding: 0 9px;
    border-radius: 3px;
    background: var(--nr-chrome-2);
    border: 1px solid var(--nr-chrome-bd);
    color: #e9f2f5;
    font-size: 10.8px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }
  .nr-matter-code {
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 700;
    color: #a8d8e6;
  }
  .nr-bilingual-tag {
    padding: 2px 7px;
    border-radius: 2px;
    background: #2b1d12;
    border: 1px solid #8a642c;
    color: #f7dfb2;
    font-family: var(--e-mono);
    font-size: 9.4px;
    font-weight: 700;
    white-space: nowrap;
  }
  .nr-corpus-tag {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #103227;
    border: 1px solid #246850;
    color: #a7e8cb;
    font-family: var(--e-mono);
    font-size: 9.6px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .nr-counsel {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid var(--nr-chrome-bd);
    white-space: nowrap;
  }
  .nr-avatar {
    width: 23px;
    height: 23px;
    border-radius: 3px;
    background: #2e677c;
    border: 1px solid #5793a8;
    color: #ffffff;
    font-family: var(--nr-serif);
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal Stage Navigation Strip */
  .nr-tabbar {
    height: 34px;
    background: var(--nr-linen);
    border-bottom: 1px solid var(--nr-border-strong);
    padding: 0 14px 0 56px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .nr-tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
  }
  .nr-tab {
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--nr-ink-2);
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .nr-tab.is-active {
    background: var(--nr-paper);
    color: var(--nr-accent-ink);
    border-bottom-color: var(--nr-accent);
    border-left: 1px solid var(--nr-border);
    border-right: 1px solid var(--nr-border);
    font-weight: 700;
  }
  .nr-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 2px;
    background: var(--nr-stone);
    color: var(--nr-ink-2);
  }
  .nr-tab-cnt.bad { background: var(--nr-bad-bg); color: var(--nr-bad); border: 1px solid var(--nr-bad-bd); }
  .nr-tab.is-active .nr-tab-cnt { background: var(--nr-accent); color: #ffffff; border-color: transparent; }
  .nr-tabbar-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Body Shell with 44px Left Legal Tool Rail */
  .nr-body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .nr-rail {
    width: 44px;
    background: var(--nr-linen);
    border-right: 1px solid var(--nr-border-strong);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    flex-shrink: 0;
  }
  .nr-rail-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  .nr-rail-btn {
    width: 30px;
    height: 30px;
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--nr-ink-2);
    border: 1px solid transparent;
    position: relative;
  }
  .nr-rail-btn.is-active {
    background: var(--nr-accent);
    color: #ffffff;
    border-color: var(--nr-accent-ink);
  }
  .nr-rail-dot {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--nr-bad);
  }

  /* Main Workspace Surface */
  .nr-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
    background: var(--nr-alabaster);
  }

  /* Editorial Legal Briefing Ribbon (flat paper strip with hairline dividers) */
  .nr-ribbon {
    background: var(--nr-paper);
    border: 1px solid var(--nr-border-strong);
    border-radius: 3px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    flex-shrink: 0;
  }
  .nr-ribbon-cell {
    padding: 7px 11px;
    border-right: 1px solid var(--nr-border);
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .nr-ribbon-cell:last-child { border-right: 0; }
  .nr-ribbon-lbl {
    font-size: 9.6px;
    font-weight: 700;
    color: var(--nr-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .nr-ribbon-val {
    font-family: var(--e-mono);
    font-size: 15.5px;
    font-weight: 700;
    color: var(--nr-ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .nr-ribbon-sub {
    font-size: 9.6px;
    color: var(--nr-ink-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Tables tuned to warm editorial parchment */
  table.e-table th {
    background: var(--nr-linen);
    color: var(--nr-ink-2);
    border-bottom: 1px solid var(--nr-border-strong);
    font-size: 9.6px;
    padding: 5px 7px;
  }
  table.e-table td {
    border-bottom: 1px solid #ebe6dc;
    color: var(--nr-ink);
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fcfbf8;
  }
  table.e-table tbody tr.is-selected {
    background: var(--nr-accent-soft) !important;
    box-shadow: inset 3px 0 0 var(--nr-accent);
  }
  table.e-table tbody tr.is-bad {
    background: #fef8f8 !important;
  }
  table.e-table tbody tr.is-warn {
    background: #fefcf5 !important;
  }
  table.e-table tfoot td {
    background: var(--nr-linen);
    border-top: 1px solid var(--nr-border-strong);
    color: var(--nr-ink);
  }

  .e-panel {
    border-color: var(--nr-border-strong);
    border-radius: 3px;
  }
  .e-panel-head {
    background: var(--nr-linen);
    border-bottom-color: var(--nr-border);
    height: 31px;
  }
  .e-panel-sub {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .e-btn {
    border-color: var(--nr-border-strong);
    background: var(--nr-paper);
    color: var(--nr-ink);
  }
  .e-btn-primary {
    background: var(--nr-accent);
    border-color: var(--nr-accent-ink);
    color: #ffffff;
  }

  /* Formal Legal Excerpt & Citation Cards */
  .nr-excerpt {
    background: #fcfbf8;
    border: 1px solid var(--nr-border);
    border-left: 3px solid var(--nr-accent);
    padding: 8px 10px;
    border-radius: 2px;
    font-family: var(--nr-serif);
    font-size: 11px;
    line-height: 1.48;
    color: var(--nr-ink);
  }
  .nr-cite-box {
    background: var(--nr-info-bg);
    border: 1px solid var(--nr-info-bd);
    border-radius: 3px;
    padding: 8px 10px;
  }
  .nr-redline-del {
    background: var(--nr-bad-bg);
    color: var(--nr-bad);
    text-decoration: line-through;
    padding: 0 2px;
    border-radius: 2px;
  }
  .nr-redline-ins {
    background: var(--nr-ok-bg);
    color: var(--nr-ok);
    border-bottom: 1.5px solid var(--nr-ok);
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 600;
  }
  .nr-redline-drift {
    background: var(--nr-warn-bg);
    color: #7c4300;
    border-bottom: 1.5px dashed var(--nr-warn);
    padding: 0 3px;
    border-radius: 2px;
    font-weight: 600;
  }

  /* Bottom Chain-of-Custody Status Bar */
  .nr-statusbar {
    height: 24px;
    background: var(--nr-stone);
    border-top: 1px solid var(--nr-border-strong);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: var(--nr-ink-2);
    flex-shrink: 0;
  }
  .nr-status-grp {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .nr-status-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
`;

function renderLegalShell({ activeSlug, actionsHtml, contentHtml, extraCss = '' }) {
  const tabs = [
    { slug: 'p1', icon: 'fileText', label: 'Matriks Audit Klausul', cnt: '48/48', bad: false },
    { slug: 'p2', icon: 'splitDiff', label: 'Redline Dwibahasa EN-ID', cnt: '2 selisih', bad: true },
    { slug: 'p3', icon: 'checklist', label: 'Checklist DPA UU PDP', cnt: '4 blocker', bad: true },
    { slug: 'p4', icon: 'bookLaw', label: 'Korpus JDIH & RAG', cnt: '48,2k pasal', bad: false },
    { slug: 'p5', icon: 'stamp', label: 'Memo Risiko & e-Meterai', cnt: 'Draf Final', bad: false },
  ];

  const topbar = `<header class="nr-topbar">
    <div class="nr-top-left">
      <div class="nr-brand">
        <span class="nr-seal">NR</span>
        <span>NusaRAG Legal</span>
      </div>
      <span class="nr-vsep"></span>
      <div class="nr-matter-pill">
        ${legalIcon('scale', 12, '#a8d8e6')}
        <span class="nr-matter-code">${esc(MATTER.code)}</span>
        <span style="color:#d2e2e8;">·</span>
        <span style="font-weight:600;color:#ffffff;">MSA Cloud Core Banking — SingTel Cloud Pte. Ltd.</span>
        ${ic('chevronDown', 11, '#8fb2bf')}
      </div>
      <span class="nr-bilingual-tag">DWIBAHASA ID/EN · UU 24/2009</span>
    </div>
    <div class="nr-top-right">
      <div class="nr-corpus-tag">
        <span class="dot dot-ok"></span>
        <span>JDIH Sync 04:00 WIB · 48.210 Pasal</span>
      </div>
      <div class="nr-matter-pill" style="padding:0 8px;">
        ${ic('lock', 11, '#a8d8e6')}
        <span class="mono" style="font-size:9.6px;">Isolasi Matter: RBAC-L3</span>
      </div>
      <div class="nr-counsel">
        <span class="nr-avatar">RS</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.4px;font-weight:700;color:#ffffff;">R. Suryadi, S.H., LL.M.</div>
          <div style="font-size:9px;color:#a5c2cc;">Senior Legal Counsel · Bank Nusantara</div>
        </div>
      </div>
    </div>
  </header>`;

  const tabbar = `<nav class="nr-tabbar">
    <div class="nr-tabs">
      ${tabs
        .map((t) => {
          const active = t.slug === activeSlug;
          return `<div class="nr-tab ${active ? 'is-active' : ''}">
            ${legalIcon(t.icon, 12.5, active ? '#143642' : '#586870')}
            <span>${esc(t.label)}</span>
            <span class="nr-tab-cnt ${t.bad && !active ? 'bad' : ''}">${esc(t.cnt)}</span>
          </div>`;
        })
        .join('')}
    </div>
    <div class="nr-tabbar-actions">${actionsHtml}</div>
  </nav>`;

  const rail = `<aside class="nr-rail">
    <div class="nr-rail-group">
      ${tabs
        .map((t) => {
          const active = t.slug === activeSlug;
          return `<div class="nr-rail-btn ${active ? 'is-active' : ''}" title="${esc(t.label)}">
            ${legalIcon(t.icon, 15, active ? '#ffffff' : '#4a5b63')}
            ${t.bad && !active ? '<span class="nr-rail-dot"></span>' : ''}
          </div>`;
        })
        .join('')}
    </div>
    <div class="nr-rail-group">
      <div class="nr-rail-btn" title="Brankas Terenkripsi S3">${ic('lock', 14, '#4a5b63')}</div>
      <div class="nr-rail-btn" title="Pencarian Pasal Ctrl+K">${ic('search', 14, '#4a5b63')}</div>
      <div class="nr-rail-btn" title="Pengaturan RBAC Matter">${ic('sliders', 14, '#4a5b63')}</div>
    </div>
  </aside>`;

  const footer = `<footer class="nr-statusbar">
    <div class="nr-status-grp">
      <span class="nr-status-item"><span class="dot dot-ok"></span><strong>Hybrid RAG:</strong> BM25 + PostgreSQL pgvector (p95 318 ms)</span>
      <span class="nr-status-item">${ic('fileText', 11, '#415058')} C# Docx Engine v4.2 (OOXML Track Changes)</span>
      <span class="nr-status-item">${ic('shield', 11, '#146c43')} UU PDP 27/2022 · UU 24/2009 · POJK 11/2022</span>
    </div>
    <div class="nr-status-grp">
      <span class="nr-status-item">${legalIcon('stamp', 11, '#1f4e5f')} Peruri e-Meterai: Terhubung</span>
      <span class="nr-status-item">WORM: <strong>${esc(MATTER.wormHash.slice(0, 22))}…7f1c</strong></span>
      <span class="nr-status-item">22 Nov 2026 · 10:04 WIB</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `NusaRAG Legal — ${tabs.find((t) => t.slug === activeSlug)?.label || ''}`,
    accent: '#1f4e5f',
    accentSoft: '#e8f1f4',
    accentInk: '#143642',
    bg: '#faf9f6',
    surface: '#ffffff',
    surface2: '#f3f1eb',
    border: '#ddd8cd',
    borderStrong: '#c5beb0',
    text: '#162127',
    text2: '#415058',
    muted: '#68767e',
    extraCss: SHARED_LEGAL_CSS + '\n' + extraCss,
    bodyHtml: `${topbar}${tabbar}<div class="nr-body">${rail}<main class="nr-main">${contentHtml}</main></div>${footer}`,
  });
}

// ============================================================================
// PAGE 1 — MATRIKS AUDIT KLAUSUL & REGISTER KONTRAK (PRIMARY HERO WORKBENCH)
// ============================================================================
function renderPage1() {
  const ribbon = `<section class="nr-ribbon">
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Klausul Diaudit (MSA)</span>${badge('100% Selesai', 'ok')}</div>
      <div class="nr-ribbon-val">48 / 48</div>
      <div class="nr-ribbon-sub">42 halaman DOCX · 35 patuh · 7 revisi · 6 tinggi</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Celah UU PDP No. 27/2022</span>${badge('Kritis', 'bad')}</div>
      <div class="nr-ribbon-val" style="color:var(--nr-bad);">3 tinggi</div>
      <div class="nr-ribbon-sub">CL-14.2 Ps. 56 · CL-06.3 Ps. 53 · CL-17.2 Ps. 44</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Selisih Makna EN / ID</span>${badge('UU 24/2009', 'warn')}</div>
      <div class="nr-ribbon-val" style="color:var(--nr-warn);">2 klausul</div>
      <div class="nr-ribbon-sub">CL-19.1 Prevailing · CL-11.3 Cap Rp 13,6 M</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Kelengkapan Lampiran DPA</span>${badge('4 Blocker', 'bad')}</div>
      <div class="nr-ribbon-val">${DPA_PASS_COUNT} / ${DPA_CHECKLIST.length} <span style="font-size:11px;color:var(--nr-muted);font-weight:600;">(${fmtPct(DPA_PCT)})</span></div>
      <div class="nr-ribbon-sub">Notifikasi insiden tertulis 7 hari (wajib 3x24 jam)</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Nilai Kontrak & Eksposur</span>${badge('36 Bulan', 'info')}</div>
      <div class="nr-ribbon-val" style="font-size:14.5px;">${fmtIdr(MATTER.contractValueIdr)}</div>
      <div class="nr-ribbon-sub">Selisih cap liabilitas EN vs ID: ${fmtIdr(MATTER.bilingualExposureDeltaIdr)}</div>
    </div>
  </section>`;

  const docListHtml = MATTER_DOCS.map((d) => `
    <div style="padding:6px 8px;border:1px solid ${d.active ? 'var(--nr-accent)' : 'var(--nr-border)'};background:${d.active ? 'var(--nr-accent-soft)' : '#ffffff'};border-radius:3px;display:flex;flex-direction:column;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span class="trunc" style="font-weight:700;font-size:10.5px;color:${d.active ? 'var(--nr-accent-ink)' : 'var(--nr-ink)'};">${esc(d.name)}</span>
        ${badge(d.risk, d.tone)}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.5px;color:var(--nr-muted);">
        <span>${esc(d.type)}</span>
        <span class="mono">${d.units} unit tinjauan</span>
      </div>
    </div>
  `).join('');

  const regBarsHtml = REGULATION_BREAKDOWN.map((r) => {
    const pHigh = (r.high / r.total) * 100;
    const pWarn = (r.warn / r.total) * 100;
    const pOk = (r.ok / r.total) * 100;
    return `<div style="display:flex;flex-direction:column;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:10.2px;">
        <span style="font-weight:600;color:var(--nr-ink);">${esc(r.name)}</span>
        <span class="mono" style="font-size:9.6px;color:var(--nr-ink-2);">${r.total} kl · <strong style="color:var(--nr-bad);">${r.high}T</strong> · <strong style="color:var(--nr-warn);">${r.warn}R</strong> · <strong style="color:var(--nr-ok);">${r.ok}P</strong></span>
      </div>
      <div style="height:8px;width:100%;display:flex;border-radius:2px;overflow:hidden;background:var(--nr-stone);border:1px solid var(--nr-border);">
        ${r.high > 0 ? `<div style="width:${pHigh.toFixed(1)}%;background:var(--nr-bad);"></div>` : ''}
        ${r.warn > 0 ? `<div style="width:${pWarn.toFixed(1)}%;background:#d98218;"></div>` : ''}
        ${r.ok > 0 ? `<div style="width:${pOk.toFixed(1)}%;background:#1e8554;"></div>` : ''}
      </div>
    </div>`;
  }).join('');

  const clauseRowsHtml = PRIORITY_CLAUSES.map((c) => {
    const trCls = c.selected ? 'is-selected' : c.tone === 'bad' ? 'is-bad' : c.tone === 'warn' ? 'is-warn' : '';
    return `<tr class="${trCls}">
      <td class="mono" style="font-weight:700;color:${c.selected ? 'var(--nr-accent-ink)' : 'var(--nr-ink)'};">${esc(c.code)}</td>
      <td style="white-space:normal;line-height:1.26;padding-top:4px;padding-bottom:4px;">
        <div style="font-weight:700;font-size:10.6px;color:var(--nr-ink);">${esc(c.title)}</div>
        <div class="trunc" style="font-size:9.4px;color:var(--nr-ink-2);">${esc(c.sub)}</div>
      </td>
      <td class="mono" style="font-size:9.6px;color:var(--nr-info);font-weight:600;">${esc(c.law)}</td>
      <td>${c.bilingualDiff ? badge('Selisih EN/ID', 'warn') : '<span style="font-size:9.8px;color:var(--nr-muted);">Selaras</span>'}</td>
      <td>${badge(c.riskLabel, c.tone)}</td>
      <td>${badge(c.status, c.tone === 'bad' ? 'bad' : c.tone === 'warn' ? 'warn' : 'ok')}</td>
    </tr>`;
  }).join('');

  const content = `${ribbon}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:288px 1fr 412px;gap:9px;">
    <!-- LEFT COLUMN: BUNDEL DOKUMEN + SEBARAN REGULASI + ESKALASI -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#1f4e5f')}<span>Bundel Dokumen</span></div>
          <span class="mono e-panel-sub">4 berkas · 89 unit</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
          ${docListHtml}
        </div>
      </section>

      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${legalIcon('bookLaw', 13, '#1f4e5f')}<span>Sebaran 48 Klausul</span></div>
          <span class="mono e-panel-sub">6T · 7R · 35P</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          ${regBarsHtml}
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid var(--nr-border);font-size:9.4px;color:var(--nr-muted);">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span class="dot" style="background:var(--nr-bad);"></span>Tinggi (${TOTAL_HIGH})</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span class="dot" style="background:#d98218;"></span>Revisi (${TOTAL_WARN})</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span class="dot" style="background:#1e8554;"></span>Patuh (${TOTAL_OK})</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('users', 13, '#1f4e5f')}<span>Eskalasi & Gate Persetujuan</span></div>
          ${badge('Tertahan', 'bad')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;font-size:10.2px;">
          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 7px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">
              <div><strong>1. Audit Legal Counsel</strong><div style="font-size:9.2px;color:var(--nr-muted);">R. Suryadi, S.H. · 48/48 klausul</div></div>
              ${badge('Selesai', 'ok')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 7px;background:var(--nr-bad-bg);border:1px solid var(--nr-bad-bd);border-radius:2px;">
              <div><strong style="color:var(--nr-bad);">2. Persetujuan DPO (UU PDP)</strong><div style="font-size:9.2px;color:var(--nr-ink-2);">Dra. N. Kartika · 3 celah tinggi + Ps. 46</div></div>
              ${badge('Blocker', 'bad')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 7px;background:#ffffff;border:1px solid var(--nr-border);border-radius:2px;">
              <div><strong>3. Partner & Direksi Sign-Off</strong><div style="font-size:9.2px;color:var(--nr-muted);">Target tanda tangan: 28 Nov 2026</div></div>
              ${badge('Menunggu', 'neutral')}
            </div>
          </div>
          <div style="font-size:9.5px;color:var(--nr-muted);border-top:1px solid var(--nr-border);padding-top:5px;display:flex;justify-content:space-between;">
            <span>Kebijakan Bank:</span>
            <strong style="color:var(--nr-bad);">0 Risiko Tinggi sebelum e-Meterai</strong>
          </div>
        </div>
      </section>
    </div>

    <!-- CENTER COLUMN: DENSE 16-ROW CLAUSE AUDIT REGISTER -->
    <section class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#1f4e5f')}<span>Register Audit Pasal-demi-Pasal — MSA Cloud Core Banking</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="e-badge e-badge-accent">Semua (48)</span>
          <span class="e-badge e-badge-bad">Tinggi (6)</span>
          <span class="e-badge e-badge-warn">Revisi (7)</span>
          <span class="e-badge e-badge-neutral">Selisih EN/ID (2)</span>
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table" style="flex:1;">
          <thead>
            <tr>
              <th style="width:64px;">Kode</th>
              <th>Klausul & Ringkasan Temuan Hukum</th>
              <th style="width:138px;">Sitasi Regulasi</th>
              <th style="width:86px;">Dwibahasa</th>
              <th style="width:94px;">Penilaian</th>
              <th style="width:86px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${clauseRowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Menampilkan 16 klausul prioritas dari 48 / 48 klausul teraudit (32 rutin Patuh)</td>
              <td class="mono" style="color:var(--nr-warn);">2 selisih</td>
              <td class="mono" style="color:var(--nr-bad);">6T · 7R · 35P</td>
              <td class="mono" style="color:var(--nr-ok);">100% JDIH</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- RIGHT COLUMN: STATUTORY INSPECTOR FOR SELECTED CLAUSE CL-14.2 -->
    <section class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${legalIcon('scale', 13, '#9b1c2e')}<span>Inspektor Klausul · CL-14.2</span></div>
        ${badge('Risiko Tinggi · UU PDP', 'bad')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding-bottom:6px;border-bottom:1px solid var(--nr-border);">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:var(--nr-ink);">Transfer Data Pribadi Lintas Negara</div>
            <div style="font-size:9.8px;color:var(--nr-muted);">Halaman 27 · Bab XIV (Keamanan & Lokasi Data) · Sub-pasal 14.2</div>
          </div>
          <span class="mono" style="font-size:9.5px;padding:2px 6px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">Skor RAG: 0,96</span>
        </div>

        <div>
          <div style="font-size:9.6px;font-weight:700;color:var(--nr-muted);margin-bottom:4px;">KUTIPAN KONTRAK SAAT INI (DRAF VENDOR v4.2)</div>
          <div class="nr-excerpt">
            “<strong>14.2.</strong> Penyedia Layanan berhak mereplikasi dan memproses Data Transaksi serta Data Nasabah pada pusat data cadangan di Singapura atau wilayah lain yang ditentukan Penyedia Layanan demi efisiensi operasional tanpa pemberitahuan tertulis terlebih dahulu kepada Bank.”
          </div>
        </div>

        <div class="nr-cite-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-weight:700;font-size:10.4px;color:var(--nr-info);display:inline-flex;align-items:center;gap:5px;">
              ${ic('checkCircle', 12, '#1e5478')} Sitasi Terverifikasi JDIH
            </span>
            <span class="mono" style="font-size:9.2px;color:var(--nr-info);">UU No. 27/2022 · Ps. 56(1)–(4)</span>
          </div>
          <div class="serif" style="font-size:10.5px;line-height:1.42;color:var(--nr-ink);">
            “Pengendali Data Pribadi wajib memastikan negara tempat kedudukan penerima memiliki tingkat Pelindungan Data Pribadi yang setara atau lebih tinggi; apabila tidak terpenuhi, wajib memastikan pelindungan yang memadai dan bersifat mengikat, atau memperoleh persetujuan Subjek Data Pribadi.”
          </div>
          <div style="margin-top:5px;display:flex;justify-content:space-between;font-size:9.2px;color:var(--nr-ink-2);" class="mono">
            <span>BM25: 0,94 · pgvector: 0,96</span>
            <span>Hash: jdih:27-2022-p56#a4c</span>
          </div>
        </div>

        <div>
          <div style="font-size:9.6px;font-weight:700;color:var(--nr-muted);margin-bottom:4px;">ANALISIS CELAH & DAMPAK KEPATUHAN</div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:10.2px;color:var(--nr-ink);">
            <div style="display:flex;gap:6px;"><span style="color:var(--nr-bad);font-weight:700;">1.</span><span><strong>Frasa “wilayah lain”:</strong> Membuka transfer lintas batas tanpa daftar negara pasti dan uji kecukupan Pasal 56 ayat (2).</span></div>
            <div style="display:flex;gap:6px;"><span style="color:var(--nr-bad);font-weight:700;">2.</span><span><strong>Konflik POJK 11/2022:</strong> Replikasi DR luar negeri bank umum wajib persetujuan OJK & pencatatan di RBTI.</span></div>
            <div style="display:flex;gap:6px;"><span style="color:var(--nr-warn);font-weight:700;">3.</span><span><strong>Notifikasi Terkait (CL-08.4):</strong> Harus disinkronkan dengan batas pemberitahuan tertulis <strong>3x24 jam</strong> Pasal 46 ayat (1).</span></div>
          </div>
        </div>

        <div style="flex:1;display:flex;flex-direction:column;min-height:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:9.6px;font-weight:700;color:var(--nr-ok);">USULAN REDAKSI REDLINE (OOXML TRACK CHANGES)</span>
            <span class="mono" style="font-size:9.2px;color:var(--nr-muted);">Siap injeksi DOCX</span>
          </div>
          <div class="nr-excerpt" style="border-left-color:var(--nr-ok);background:#f9fcfa;flex:1;font-size:10.4px;">
            “<strong>14.2.</strong> Replikasi Data Pribadi ke luar wilayah RI <span class="nr-redline-del">pada wilayah lain tanpa pemberitahuan</span> <span class="nr-redline-ins">hanya diizinkan ke pusat data Singapura yang memenuhi tingkat kecukupan setara Pasal 56 UU PDP, dengan persetujuan tertulis Bank, izin OJK, serta Binding Corporate Rules (Lampiran B)</span>.”
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding-top:6px;border-top:1px solid var(--nr-border);">
          <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 12, '#ffffff')} Terapkan Redline ke DOCX</span>
          <span class="e-btn">${legalIcon('splitDiff', 12, '#1f4e5f')} Bandingkan EN/ID</span>
        </div>
      </div>
    </section>
  </div>`;

  return renderLegalShell({
    activeSlug: 'p1',
    actionsHtml: `
      <span class="e-btn">${ic('download', 12, '#1f4e5f')} Ekspor Redline DOCX</span>
      <span class="e-btn e-btn-primary">${ic('checkCircle', 12, '#ffffff')} Verifikasi Sitasi</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 2 — KOMPARATOR REDLINE DWIBAHASA EN-ID & DETEKTOR SELISIH MAKNA
// ============================================================================
function renderPage2() {
  const toolbar = `<section style="height:38px;background:var(--nr-paper);border:1px solid var(--nr-border-strong);border-radius:3px;padding:0 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:10.5px;font-weight:700;color:var(--nr-muted);margin-right:2px;">Lompat Klausul:</span>
      <span class="e-badge e-badge-bad" style="padding:3px 7px;">CL-19.1 Prevailing (TIDAK PATUH)</span>
      <span class="e-badge e-badge-bad" style="padding:3px 7px;">CL-11.3 Ganti Rugi (SELISIH Rp 13,6 M)</span>
      <span class="e-badge e-badge-warn" style="padding:3px 7px;">CL-08.4 Notifikasi 3x24j (REVISI)</span>
      <span class="e-badge e-badge-neutral" style="padding:3px 7px;">CL-14.2 Transfer Data</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;font-size:10px;">
      <span style="display:inline-flex;align-items:center;gap:4px;"><span class="nr-redline-del" style="font-size:9.5px;">Hapus</span></span>
      <span style="display:inline-flex;align-items:center;gap:4px;"><span class="nr-redline-ins" style="font-size:9.5px;">Sisip UU</span></span>
      <span style="display:inline-flex;align-items:center;gap:4px;"><span class="nr-redline-drift" style="font-size:9.5px;">Selisih Makna EN/ID</span></span>
      <span class="mono" style="padding:2px 6px;background:var(--nr-accent-soft);color:var(--nr-accent-ink);border:1px solid #b5cdd6;border-radius:2px;font-weight:700;">OOXML Track Changes: AKTIF</span>
    </div>
  </section>`;

  const trackedEdits = [
    { id: 'CHG-01', clause: 'CL-19.1', op: 'w:del + w:ins', desc: 'Balikkan prevailing language ke Bahasa Indonesia', author: 'R. Suryadi', status: 'Wajib', tone: 'bad' },
    { id: 'CHG-02', clause: 'CL-11.3', op: 'w:del + w:ins', desc: 'Koreksi "termasuk" -> "mengecualikan" (selaras EN)', author: 'R. Suryadi', status: 'Wajib', tone: 'bad' },
    { id: 'CHG-03', clause: 'CL-11.3', op: 'w:del + w:ins', desc: 'Samakan cap liabilitas 100% biaya 12 bln (Rp 16 M)', author: 'R. Suryadi', status: 'Wajib', tone: 'bad' },
    { id: 'CHG-04', clause: 'CL-08.4', op: 'w:del + w:ins', desc: 'Ubah 7 hari kerja -> maks. 3x24 jam (Ps. 46 UU PDP)', author: 'N. Kartika', status: 'Wajib', tone: 'warn' },
    { id: 'CHG-05', clause: 'CL-14.2', op: 'w:ins', desc: 'Tambahkan syarat kecukupan Ps. 56 & izin OJK', author: 'N. Kartika', status: 'Wajib', tone: 'bad' },
    { id: 'CHG-06', clause: 'CL-06.3', op: 'w:ins', desc: 'Wajib persetujuan tertulis sub-prosesor & kontak DPO', author: 'R. Suryadi', status: 'Siap', tone: 'ok' },
    { id: 'CHG-07', clause: 'CL-17.2', op: 'w:ins', desc: 'Sertifikat pemusnahan NIST 800-88 dalam 30 hari', author: 'R. Suryadi', status: 'Siap', tone: 'ok' },
  ];

  const content = `${toolbar}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 418px;gap:9px;">
    <!-- LEFT: SIDE-BY-SIDE BILINGUAL LEGAL DOCUMENT SHEET -->
    <section class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${legalIcon('splitDiff', 13, '#1f4e5f')}<span>Lembar Redline Dwibahasa Berdampingan — MSA_SingTel_CoreCloud_v4.2_Bilingual.docx</span></div>
        <span class="mono e-panel-sub">Deteksi Semantik: 2 Selisih Kritis · 1 Konflik Tenggat</span>
      </div>
      <div class="e-panel-body-flush" style="background:#ffffff;">
        <!-- Bilingual Column Header -->
        <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--nr-border-strong);background:var(--nr-linen);flex-shrink:0;">
          <div style="padding:5px 12px;border-right:1px solid var(--nr-border-strong);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.4px;color:var(--nr-accent-ink);">KOLOM A · TEKS BAHASA INDONESIA (WAJIB UU NO. 24/2009)</span>
            ${badge('Bahasa Resmi RI', 'accent')}
          </div>
          <div style="padding:5px 12px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.4px;color:var(--nr-ink-2);">KOLOM B · ENGLISH COUNTERPART TEXT (VENDOR DRAFT)</span>
            ${badge('Teks Pendamping', 'neutral')}
          </div>
        </div>

        <!-- Clause Pair 1: CL-19.1 Prevailing Language -->
        <div style="border-bottom:1.5px solid var(--nr-border-strong);flex:1;display:flex;flex-direction:column;min-height:0;">
          <div style="padding:3.5px 12px;background:#fdf6f7;border-bottom:1px solid var(--nr-bad-bd);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.3px;color:var(--nr-bad);">PASAL 19.1 — BAHASA YANG BERLAKU (PREVAILING LANGUAGE) · Halaman 38</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${badge('Tidak Patuh UU 24/2009 Ps. 31', 'bad')}
              ${badge('Selisih Makna #1 · Skor 42%', 'bad')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;flex:1;">
            <div class="serif" style="padding:7px 12px;border-right:1px solid var(--nr-border-strong);font-size:10.7px;line-height:1.44;color:var(--nr-ink);">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§19.1(a) — Redline Terapan (OOXML)</div>
              “Perjanjian ini dibuat dalam Bahasa Indonesia dan Bahasa Inggris. Apabila terdapat perbedaan penafsiran di antara kedua versi bahasa tersebut, maka <span class="nr-redline-del">versi Bahasa Inggris akan berlaku mutlak</span> <span class="nr-redline-ins">versi Bahasa Indonesia wajib berlaku dan mengungguli sesuai Pasal 31 ayat (1) UU No. 24 Tahun 2009 &amp; Perpres 63/2019, dan teks Inggris disesuaikan agar selaras</span>.”
            </div>
            <div class="serif" style="padding:7px 12px;font-size:10.7px;line-height:1.44;color:var(--nr-ink);background:#fcfbf9;">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§19.1(a) — Original Vendor Clause</div>
              “This Agreement is executed in Indonesian and English. In the event of any inconsistency or conflict of interpretation between the two language versions, <span class="nr-redline-drift">the English version shall prevail and govern exclusively</span> and the Indonesian text shall be deemed automatically amended to conform.”
            </div>
          </div>
        </div>

        <!-- Clause Pair 2: CL-11.3 Limitation of Liability (Massive Semantic Drift!) -->
        <div style="border-bottom:1.5px solid var(--nr-border-strong);flex:1.12;display:flex;flex-direction:column;min-height:0;">
          <div style="padding:3.5px 12px;background:#fef9ec;border-bottom:1px solid var(--nr-warn-bd);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.3px;color:var(--nr-warn);">PASAL 11.3 — BATAS TANGGUNG JAWAB & GANTI RUGI (LIABILITY CAP) · Halaman 21</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${badge('Selisih Eksposur: Rp 13.600.000.000', 'bad')}
              ${badge('Selisih Makna #2 · Skor 58%', 'warn')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;flex:1;">
            <div class="serif" style="padding:7px 12px;border-right:1px solid var(--nr-border-strong);font-size:10.7px;line-height:1.44;color:var(--nr-ink);">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§11.3(b) — Terjemahan Bermasalah + Koreksi Redline</div>
              “Tanggung jawab agregat Penyedia atas klaim kerugian <span class="nr-redline-drift">termasuk kerugian tidak langsung</span> <span class="nr-redline-ins">(mengecualikan kerugian tidak langsung kecuali pelanggaran UU PDP Pasal 12)</span> dibatasi paling tinggi <span class="nr-redline-del">15% biaya tahunan (Rp 2,4 M)</span> <span class="nr-redline-ins">100% total biaya 12 bulan terakhir (Rp 16.000.000.000)</span>.”
            </div>
            <div class="serif" style="padding:7px 12px;font-size:10.7px;line-height:1.44;color:var(--nr-ink);background:#fcfbf9;">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§11.3(b) — Original English Clause</div>
              “Provider’s aggregate liability under this Agreement, <span class="nr-redline-drift">excluding indirect, consequential, or punitive damages</span>, shall in no event exceed <span class="nr-redline-drift">100% of the Service Fees paid during the preceding 12-month period</span> (IDR 16,000,000,000).”
              <div style="margin-top:4px;padding:3px 6px;background:var(--nr-warn-bg);border:1px solid var(--nr-warn-bd);border-radius:2px;font-family:var(--e-sans);font-size:9.2px;color:var(--nr-warn);">
                <strong>Inversi Makna:</strong> <em>“excluding”</em> diterjemahkan <em>“termasuk”</em> &amp; plafon <strong>100% vs 15%</strong> (-Rp 13,6 M hak klaim Bank).
              </div>
            </div>
          </div>
        </div>

        <!-- Clause Pair 3: CL-08.4 Breach Notification 3x24h -->
        <div style="border-bottom:1.5px solid var(--nr-border-strong);flex:0.96;display:flex;flex-direction:column;min-height:0;">
          <div style="padding:3.5px 12px;background:#f4f7f8;border-bottom:1px solid var(--nr-border);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.3px;color:var(--nr-accent-ink);">PASAL 8.4 — BATAS NOTIFIKASI KEBOCORAN DATA PRIBADI (BREACH NOTICE) · Halaman 15</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${badge('Konflik Tenggat UU PDP Ps. 46', 'warn')}
              ${badge('Selaras Bahasa · 94%', 'ok')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;flex:1;">
            <div class="serif" style="padding:7px 12px;border-right:1px solid var(--nr-border-strong);font-size:10.7px;line-height:1.44;color:var(--nr-ink);">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§8.4 — Penyelarasan Batas 3x24 Jam UU PDP</div>
              “Dalam hal terjadi kegagalan pelindungan Data Pribadi, Penyedia wajib menyampaikan pemberitahuan tertulis dalam waktu <span class="nr-redline-del">paling lambat 7 (tujuh) hari kerja</span> <span class="nr-redline-ins">awal 6 jam dan laporan tertulis lengkap maksimal 3 x 24 jam sesuai Pasal 46 ayat (1) UU No. 27/2022</span> kepada Bank dan DPO.”
            </div>
            <div class="serif" style="padding:7px 12px;font-size:10.7px;line-height:1.44;color:var(--nr-ink);background:#fcfbf9;">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§8.4 — English Counterpart (Synchronized Redline)</div>
              “In the event of a Personal Data breach, Provider shall issue written notice within <span class="nr-redline-del">seven (7) business days</span> <span class="nr-redline-ins">initial six (6) hours and complete written report no later than 3 x 24 hours pursuant to Art. 46(1) Law No. 27/2022 (UU PDP)</span> to the Bank and DPO.”
            </div>
          </div>
        </div>

        <!-- Clause Pair 4: CL-14.2 Cross-Border Data Transfer -->
        <div style="flex:0.96;display:flex;flex-direction:column;min-height:0;">
          <div style="padding:3.5px 12px;background:#fdf6f7;border-bottom:1px solid var(--nr-bad-bd);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:700;font-size:10.3px;color:var(--nr-bad);">PASAL 14.2 — TRANSFER DATA PRIBADI LINTAS NEGARA (CROSS-BORDER) · Halaman 27</span>
            <div style="display:flex;gap:6px;align-items:center;">
              ${badge('Celah Kecukupan UU PDP Ps. 56', 'bad')}
              ${badge('Selaras Bahasa · 92%', 'ok')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;flex:1;">
            <div class="serif" style="padding:7px 12px;border-right:1px solid var(--nr-border-strong);font-size:10.7px;line-height:1.44;color:var(--nr-ink);">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§14.2 — Redline Pembatasan Wilayah &amp; Kecukupan Ps. 56</div>
              “Replikasi Data Nasabah ke luar wilayah RI <span class="nr-redline-del">pada Singapura atau wilayah lain tanpa pemberitahuan</span> <span class="nr-redline-ins">hanya diizinkan ke pusat data Singapura yang memenuhi kecukupan Pasal 56 UU PDP, izin OJK, serta Binding Corporate Rules (Lampiran B)</span>.”
            </div>
            <div class="serif" style="padding:7px 12px;font-size:10.7px;line-height:1.44;color:var(--nr-ink);background:#fcfbf9;">
              <div style="font-family:var(--e-mono);font-size:8.8px;color:var(--nr-muted);margin-bottom:2px;">§14.2 — English Counterpart (Synchronized Redline)</div>
              “Replication of Customer Data outside Indonesia <span class="nr-redline-del">to Singapore or any other region without prior notice</span> <span class="nr-redline-ins">is restricted solely to Singapore DR facility meeting Art. 56 UU PDP adequacy, OJK approval, and executed BCR (Schedule B)</span>.”
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RIGHT INSPECTOR: SEMANTIC METER + STATUTORY ANCHOR + OOXML CHANGE LOG -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('activity', 13, '#1f4e5f')}<span>Meter Ekuivalensi Semantik EN-ID</span></div>
          <span class="mono e-panel-sub">Ambang >= 90%</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:10.3px;margin-bottom:2px;">
              <strong>CL-19.1 · Bahasa yang Berlaku</strong>
              <span class="mono" style="color:var(--nr-bad);font-weight:700;">42% · Kritis</span>
            </div>
            ${renderCapacityBar(42, { warnAt: 1, critAt: 1, showLabel: false })}
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:10.3px;margin-bottom:2px;">
              <strong>CL-11.3 · Batas Ganti Rugi (100% vs 15%)</strong>
              <span class="mono" style="color:var(--nr-bad);font-weight:700;">58% · Selisih Material</span>
            </div>
            ${renderCapacityBar(58, { warnAt: 1, critAt: 1, showLabel: false })}
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:10.3px;margin-bottom:2px;">
              <strong>CL-08.4 · Notifikasi Kebocoran Data</strong>
              <span class="mono" style="color:var(--nr-ok);font-weight:700;">94% · Konflik UU</span>
            </div>
            ${renderCapacityBar(94, { warnAt: 96, critAt: 99, showLabel: false })}
          </div>
          <div style="padding:7px 9px;background:var(--nr-bad-bg);border:1px solid var(--nr-bad-bd);border-radius:3px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;color:var(--nr-bad);font-weight:600;">Dampak Finansial Selisih CL-11.3</span>
            <span class="mono" style="font-size:12px;font-weight:700;color:var(--nr-bad);">${fmtIdr(MATTER.bilingualExposureDeltaIdr)}</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${legalIcon('bookLaw', 13, '#1f4e5f')}<span>Yurisprudensi & Dasar Hukum Dwibahasa</span></div>
          ${badge('JDIH Verified', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;font-size:10.1px;">
          <div class="nr-cite-box" style="padding:6px 8px;">
            <div style="font-weight:700;color:var(--nr-info);">UU No. 24 Tahun 2009 · Pasal 31 ayat (1) & (2)</div>
            <div class="serif" style="font-size:10px;margin-top:2px;">Bahasa Indonesia wajib digunakan dalam nota kesepahaman atau perjanjian yang melibatkan badan hukum Indonesia.</div>
          </div>
          <div style="padding:6px 8px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:3px;">
            <div style="font-weight:700;color:var(--nr-ink);">Perpres No. 63 Tahun 2019 · Pasal 26 ayat (3)</div>
            <div style="font-size:9.8px;color:var(--nr-ink-2);margin-top:2px;">Bahasa asing hanya berfungsi sebagai padanan terjemahan untuk menyamakan pemahaman; para pihak wajib menyepakati bahasa acuan yang tidak meniadakan kewajiban Bahasa Indonesia.</div>
          </div>
          <div style="padding:6px 8px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:3px;">
            <div style="font-weight:700;color:var(--nr-ink);">Putusan MA No. 601 K/Pdt/2015 (Nine AM vs Bangun Karya)</div>
            <div style="font-size:9.8px;color:var(--nr-ink-2);margin-top:2px;">Menguatkan pembatalan perjanjian komersial yang mengabaikan kewajiban bahasa sesuai Pasal 1320 & 1337 KUHPerdata.</div>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#1f4e5f')}<span>Antrean Track-Changes (C# Docx Engine)</span></div>
          <span class="mono e-panel-sub">7 revisi OOXML</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:68px;">Pasal</th>
                <th>Ringkasan Revisi OOXML</th>
                <th style="width:66px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${trackedEdits
                .map(
                  (e) => `<tr>
                    <td class="mono" style="font-weight:700;">${esc(e.clause)}</td>
                    <td class="trunc" title="${esc(e.desc)}">${esc(e.desc)}</td>
                    <td>${badge(e.status, e.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>`;

  return renderLegalShell({
    activeSlug: 'p2',
    actionsHtml: `
      <span class="e-btn">${ic('copy', 12, '#1f4e5f')} Salin Teks Bersih</span>
      <span class="e-btn e-btn-primary">${ic('download', 12, '#ffffff')} Ekspor Redline DOCX (7 Revisi)</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 3 — CHECKLIST KELENGKAPAN DPA UU PDP & BATAS NOTIFIKASI 3x24 JAM
// ============================================================================
function renderPage3() {
  const ribbon = `<section class="nr-ribbon">
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Kesiapan DPA UU PDP</span>${badge('Belum Siap', 'bad')}</div>
      <div class="nr-ribbon-val">${DPA_PASS_COUNT} / ${DPA_CHECKLIST.length} <span style="font-size:11px;color:var(--nr-muted);">(${fmtPct(DPA_PCT)})</span></div>
      <div class="nr-ribbon-sub">Lampiran_B_DPA_UU_PDP_v2.1.docx</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Item Blocker Wajib</span>${badge('Tahan TTD', 'bad')}</div>
      <div class="nr-ribbon-val" style="color:var(--nr-bad);">${DPA_FAIL_COUNT} item</div>
      <div class="nr-ribbon-sub">Ps. 53 DPO · Ps. 46 3x24j · Ps. 56 · Ps. 44</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Batas Notifikasi Kebocoran</span>${badge('Melanggar', 'bad')}</div>
      <div class="nr-ribbon-val" style="color:var(--nr-warn);">3 x 24 Jam</div>
      <div class="nr-ribbon-sub">Draf vendor: 7 hari (168 jam — +96 jam berlebih)</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Klasifikasi Data Diproses</span>${badge('Pasal 4(2)', 'info')}</div>
      <div class="nr-ribbon-val" style="font-size:13.5px;">Data Spesifik</div>
      <div class="nr-ribbon-sub">Keuangan Nasabah, NIK, Biometrik KYC (2,4 Jt)</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Eksposur Sanksi UU PDP</span>${badge('Pasal 57(3)', 'warn')}</div>
      <div class="nr-ribbon-val" style="font-size:13.5px;color:var(--nr-bad);">Maks. 2% Pendapatan</div>
      <div class="nr-ribbon-sub">Denda administratif + penghentian pemrosesan</div>
    </div>
  </section>`;

  // Custom precision SVG: 3x24h Statutory Breach Notification Timeline vs 7-Day Vendor Draft
  const breachTimelineSvg = `<svg viewBox="0 0 486 156" width="100%" height="156" style="display:block;">
    <!-- Background scale bands -->
    <rect x="14" y="14" width="218" height="106" fill="#eef8f2" stroke="#b3dec5" stroke-width="1" rx="2" />
    <rect x="232" y="14" width="240" height="106" fill="#fdf2f3" stroke="#f0c2c9" stroke-width="1" rx="2" />
    <text x="22" y="27" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#146c43">ZONA PATUH UU PDP (0 – 72 JAM / 3 x 24 JAM)</text>
    <text x="240" y="27" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#9b1c2e">ZONA PELANGGARAN HUKUM (&gt; 72 JAM)</text>

    <!-- Mandatory 72h vertical cutoff -->
    <line x1="232" y1="10" x2="232" y2="132" stroke="#9b1c2e" stroke-width="1.6" stroke-dasharray="4,2" />
    <rect x="182" y="128" width="100" height="16" rx="2" fill="#9b1c2e" />
    <text x="232" y="139" text-anchor="middle" font-size="8.6" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">BATAS 72 JAM (PS. 46)</text>

    <!-- Track 1: Mandat UU PDP (72 jam) -->
    <text x="22" y="47" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#162127">Target Redline NusaRAG (Patuh Ps. 46):</text>
    <rect x="22" y="53" width="210" height="15" rx="2" fill="#146c43" />
    <rect x="22" y="53" width="28" height="15" rx="2" fill="#1f4e5f" />
    <rect x="50" y="53" width="66" height="15" fill="#1e5478" />
    <rect x="116" y="53" width="58" height="15" fill="#2b7a5b" />
    <text x="36" y="63.5" text-anchor="middle" font-size="7.8" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">6j</text>
    <text x="83" y="63.5" text-anchor="middle" font-size="7.8" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">24j Forensik</text>
    <text x="145" y="63.5" text-anchor="middle" font-size="7.8" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">48j Draf</text>
    <text x="203" y="63.5" text-anchor="middle" font-size="7.8" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">72j Kirim</text>

    <!-- Track 2: Kontrak Vendor Saat Ini (168 jam / 7 hari) -->
    <text x="22" y="87" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#9b1c2e">Draf Kontrak Vendor (CL-08.4):</text>
    <text x="240" y="87" font-size="8.6" font-weight="700" font-family="Consolas,monospace" fill="#9b1c2e">Melampaui +96 Jam dari Batas UU PDP</text>
    <rect x="22" y="93" width="438" height="15" rx="2" fill="#9b1c2e" fill-opacity="0.88" />
    <text x="242" y="103.5" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">168 JAM (7 HARI KERJA) — MELAMPAUI BATAS UU PDP +96 JAM</text>

    <!-- X Axis Ticks -->
    <text x="22" y="150" font-size="8.5" font-family="Consolas,monospace" fill="#68767e">0j</text>
    <text x="92" y="150" font-size="8.5" font-family="Consolas,monospace" fill="#68767e">24j</text>
    <text x="162" y="150" font-size="8.5" font-family="Consolas,monospace" fill="#68767e">48j</text>
    <text x="342" y="150" font-size="8.5" font-family="Consolas,monospace" fill="#9b1c2e">120j (5h)</text>
    <text x="458" y="150" text-anchor="end" font-size="8.5" font-family="Consolas,monospace" fill="#9b1c2e">168j (7h)</text>
  </svg>`;

  // Custom precision SVG: Cross-Border Data Transfer Map (Pasal 56 UU PDP)
  const crossBorderSvg = `<svg viewBox="0 0 486 122" width="100%" height="122" style="display:block;">
    <!-- Node 1: DCI Jakarta -->
    <rect x="8" y="16" width="138" height="72" rx="3" fill="#eef8f2" stroke="#146c43" stroke-width="1.3" />
    <text x="18" y="32" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#146c43">PRIMARY · WILAYAH RI</text>
    <text x="18" y="47" font-size="10.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#162127">DCI Jakarta JK5</text>
    <text x="18" y="61" font-size="9" font-family="Segoe UI,sans-serif" fill="#415058">Core Banking DB + Vault</text>
    <text x="18" y="76" font-size="8.5" font-family="Consolas,monospace" fill="#146c43">PP 71/2019: PATUH</text>

    <!-- Arrow 1 -> 2 -->
    <line x1="146" y1="52" x2="178" y2="52" stroke="#9a5806" stroke-width="1.6" />
    <polygon points="178,48 186,52 178,56" fill="#9a5806" />
    <text x="165" y="43" text-anchor="middle" font-size="8" font-weight="700" font-family="Consolas,monospace" fill="#9a5806">TLS 1.3</text>

    <!-- Node 2: SingTel SG -->
    <rect x="186" y="16" width="144" height="72" rx="3" fill="#fef9ec" stroke="#9a5806" stroke-width="1.3" />
    <text x="196" y="32" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#9a5806">DR SITE · SINGAPURA</text>
    <text x="196" y="47" font-size="10.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#162127">SingTel Cloud SG-W</text>
    <text x="196" y="61" font-size="9" font-family="Segoe UI,sans-serif" fill="#415058">PDPA SG (Setara) + BCR</text>
    <text x="196" y="76" font-size="8.5" font-family="Consolas,monospace" fill="#9a5806">WAJIB IZIN OJK &amp; PS. 56</text>

    <!-- Arrow 2 -> 3 (Blocked) -->
    <line x1="330" y1="52" x2="360" y2="52" stroke="#9b1c2e" stroke-width="1.6" stroke-dasharray="3,2" />
    <polygon points="360,48 368,52 360,56" fill="#9b1c2e" />
    <text x="348" y="43" text-anchor="middle" font-size="8" font-weight="700" font-family="Consolas,monospace" fill="#9b1c2e">BLOKIR</text>

    <!-- Node 3: Undefined Region -->
    <rect x="368" y="16" width="110" height="72" rx="3" fill="#fdf2f3" stroke="#9b1c2e" stroke-width="1.3" stroke-dasharray="4,2" />
    <text x="377" y="32" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#9b1c2e">DILARANG PS. 56</text>
    <text x="377" y="47" font-size="10" font-weight="700" font-family="Segoe UI,sans-serif" fill="#9b1c2e">“Wilayah Lain”</text>
    <text x="377" y="61" font-size="8.8" font-family="Segoe UI,sans-serif" fill="#415058">Sub-prosesor tak</text>
    <text x="377" y="73" font-size="8.8" font-family="Segoe UI,sans-serif" fill="#415058">terdaftar di DPA</text>

    <!-- Legend Footer -->
    <text x="8" y="110" font-size="8.8" font-family="Segoe UI,sans-serif" fill="#415058">Rekomendasi: Hapus frasa “wilayah lain” pada CL-14.2, kunci kunci enkripsi BYOK di HSM Jakarta, lampirkan SCC/BCR.</text>
  </svg>`;

  const dpaRows = DPA_CHECKLIST.map((d) => {
    const cls = d.tone === 'bad' ? 'is-bad' : '';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;color:${d.tone === 'bad' ? 'var(--nr-bad)' : 'var(--nr-ink)'};">${esc(d.code)}</td>
      <td style="font-weight:${d.tone === 'bad' ? '700' : '500'};">${esc(d.req)}</td>
      <td class="mono" style="font-size:9.5px;color:var(--nr-info);font-weight:600;">${esc(d.law)}</td>
      <td class="mono" style="font-size:9.6px;">${esc(d.clause)}</td>
      <td>${badge(d.status, d.tone)}</td>
      <td class="trunc" style="font-size:10px;color:${d.tone === 'bad' ? 'var(--nr-bad)' : 'var(--nr-ink-2)'};">${esc(d.action)}</td>
    </tr>`;
  }).join('');

  const content = `${ribbon}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 512px;gap:9px;">
    <!-- LEFT: FULL 18-ITEM DPA CHECKLIST MATRIX -->
    <section class="e-panel" style="min-height:0;">
      <div class="e-panel-head">
        <div class="e-panel-title">${legalIcon('checklist', 13, '#1f4e5f')}<span>Matriks Kelengkapan Data Processing Agreement (18 Kontrol Wajib UU PDP)</span></div>
        <div style="display:flex;gap:6px;">
          ${badge('14 Terpenuhi', 'ok')}
          ${badge('4 Blocker Wajib', 'bad')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <table class="e-table" style="flex:1;">
          <thead>
            <tr>
              <th style="width:62px;">Kode</th>
              <th style="width:302px;">Persyaratan Wajib DPA</th>
              <th style="width:124px;">Dasar Hukum</th>
              <th style="width:64px;">Klausul</th>
              <th style="width:82px;">Status</th>
              <th>Catatan Verifikasi / Tindakan Korektif</th>
            </tr>
          </thead>
          <tbody>
            ${dpaRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total Evaluasi DPA UU PDP No. 27/2022 &amp; POJK 11/2022: 18 Kontrol Wajib</td>
              <td colspan="2" class="mono" style="text-align:right;"><span style="color:var(--nr-ok);">14 Terpenuhi</span> · <span style="color:var(--nr-bad);">4 Blocker</span> · <span style="color:var(--nr-accent-ink);">Skor Kepatuhan: ${fmtPct(DPA_PCT)}</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- RIGHT: 3x24H BREACH NOTIFICATION TIMELINE + CROSS-BORDER FLOW -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1.1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('clock', 13, '#9b1c2e')}<span>Kepatuhan Batas Notifikasi Kebocoran 3 x 24 Jam</span></div>
          ${badge('UU PDP Ps. 46(1)', 'bad')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          ${breachTimelineSvg}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9.8px;">
            <div style="padding:6px 8px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:3px;">
              <div style="font-weight:700;color:var(--nr-ink);">Isi Wajib Pemberitahuan (Ps. 46 ayat 2)</div>
              <div style="color:var(--nr-ink-2);margin-top:2px;">1) Data Pribadi yang terungkap · 2) Waktu & kronologi kejadian · 3) Upaya penanganan & pemulihan dampak.</div>
            </div>
            <div style="padding:6px 8px;background:var(--nr-bad-bg);border:1px solid var(--nr-bad-bd);border-radius:3px;">
              <div style="font-weight:700;color:var(--nr-bad);">Kewajiban Pelaporan Ganda Bank</div>
              <div style="color:var(--nr-ink-2);margin-top:2px;">Lembaga Pengawas PDP & Subjek Data (<= 72 jam) + Pelaporan Insiden Siber OJK (POJK 11/2022 Ps. 49 <= 24 jam).</div>
            </div>
          </div>
          <div class="nr-cite-box" style="padding:6px 8px;font-size:9.8px;">
            <strong>Klausul Wajib Sisipan (Lampiran B §6.2):</strong> Penyedia Layanan wajib memberi notifikasi awal ke SOC & DPO Bank dalam <strong>6 jam</strong> agar Bank memiliki ruang <strong>66 jam</strong> untuk forensik & pemberitahuan tertulis sebelum batas 3x24 jam berakhir.
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.95;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('globe', 13, '#1f4e5f')}<span>Peta Transfer Data Lintas Negara (Pasal 56 UU PDP)</span></div>
          ${badge('Uji Kecukupan', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          ${crossBorderSvg}
          <table class="e-table" style="border:1px solid var(--nr-border);">
            <thead>
              <tr>
                <th style="width:124px;">Safeguard Pasal 56</th>
                <th>Status Evaluasi SingTel SG-West</th>
                <th style="width:78px;">Keputusan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:600;">Kecukupan Yurisdiksi</td>
                <td>PDPA SG setara — perlu lampiran pernyataan tertulis</td>
                <td>${badge('Lengkapi', 'warn')}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">Klausul Mengikat (BCR)</td>
                <td>Belum dilampirkan dalam DPA v2.1</td>
                <td>${badge('Blocker', 'bad')}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">Kunci Enkripsi BYOK</td>
                <td>HSM tetap berada di Jakarta (DCI JK5)</td>
                <td>${badge('Terpenuhi', 'ok')}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">Persetujuan OJK RBTI</td>
                <td>Pengajuan izin DR luar negeri dijadwalkan Des 2026</td>
                <td>${badge('Proses', 'info')}</td>
              </tr>
            </tbody>
          </table>
          <div style="padding:5px 8px;background:var(--nr-warn-bg);border:1px solid var(--nr-warn-bd);border-radius:2px;font-size:9.6px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:var(--nr-warn);">Status Transfer Lintas Negara:</strong>
            <span class="mono" style="color:var(--nr-bad);font-weight:700;">TERTAHAN · 2 dari 4 Safeguard belum lengkap</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderLegalShell({
    activeSlug: 'p3',
    actionsHtml: `
      <span class="e-btn">${ic('fileText', 12, '#1f4e5f')} Unduh Lampiran DPA (.XLSX)</span>
      <span class="e-btn e-btn-primary">${ic('zap', 12, '#ffffff')} Sisipkan 4 Klausul Blocker ke MSA</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 4 — KORPUS REGULASI JDIH & MESIN HYBRID RAG (BM25 + PGVECTOR)
// ============================================================================
function renderPage4() {
  const ribbon = `<section class="nr-ribbon">
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Korpus JDIH Terindeks</span>${badge('312 Regulasi', 'ok')}</div>
      <div class="nr-ribbon-val">${fmtNum(48210)} pasal</div>
      <div class="nr-ribbon-sub">Sinkronisasi JDIH otomatis harian 04:00 WIB</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Vektor PostgreSQL pgvector</span>${badge('HNSW m=16', 'info')}</div>
      <div class="nr-ribbon-val">${fmtNum(192840)} chunk</div>
      <div class="nr-ribbon-sub">Dimensi 1024 · Indeks BM25 + Cosine RRF</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Latensi Hybrid RAG (p95)</span>${badge('SLA <= 500ms', 'ok')}</div>
      <div class="nr-ribbon-val">318 ms</div>
      <div class="nr-ribbon-sub">BM25 28 ms · pgvector 64 ms · Rerank 142 ms</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Akurasi Verifikasi Sitasi</span>${badge('0 Halusinasi', 'ok')}</div>
      <div class="nr-ribbon-val">99,4%</div>
      <div class="nr-ribbon-sub">48/48 klausul tertaut ke hash pasal JDIH resmi</div>
    </div>
    <div class="nr-ribbon-cell">
      <div class="nr-ribbon-lbl"><span>Isolasi Matter (RBAC)</span>${badge('RLS Strict', 'accent')}</div>
      <div class="nr-ribbon-val" style="font-size:13.5px;">Zero Cross-Leak</div>
      <div class="nr-ribbon-sub">Enkripsi S3 KMS-ID per Matter · FastAPI Gateway</div>
    </div>
  </section>`;

  const latencyChart = svgMultiLineChart({
    width: 472,
    height: 196,
    xLabels: ['10 Nov', '11 Nov', '12 Nov', '13 Nov', '14 Nov', '15 Nov', '16 Nov', '17 Nov', '18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov'],
    series: [
      { label: 'p95 Hybrid RAG (ms)', color: '#1f4e5f', values: [338, 355, 368, 330, 315, 308, 348, 362, 329, 322, 335, 324, 318], area: true, dots: true },
      { label: 'p50 Hybrid RAG (ms)', color: '#146c43', values: [184, 192, 196, 179, 172, 168, 190, 195, 182, 178, 186, 181, 176], dashed: false },
      { label: 'pgvector HNSW (ms)', color: '#9a5806', values: [70, 74, 78, 68, 64, 62, 71, 75, 67, 66, 69, 66, 64], dashed: true },
    ],
    yMin: 0,
    yMax: 560,
    yTicks: 4,
    yUnit: 'ms',
    threshold: { value: 500, label: 'Batas SLA 500 ms', color: '#9b1c2e' },
    annotations: [{ index: 12, seriesIdx: 0, label: 'Hari ini: 318 ms', color: '#1f4e5f', dy: -26 }],
  });

  const waterfallSvg = svgSpanWaterfall({
    spans: RAG_SPANS,
    totalMs: 318,
    width: 404,
  });

  const topChunks = [
    { rank: '#1', cite: 'UU 27/2022 Ps. 56(1)-(2)', snippet: 'Transfer Data Pribadi ke luar wilayah hukum RI wajib memenuhi kesetaraan tingkat pelindungan…', bm25: '0,94', vec: '0,96', rrf: '0,958', hash: 'a4c91e' },
    { rank: '#2', cite: 'UU 27/2022 Ps. 56(3)-(4)', snippet: 'Apabila kesetaraan tidak terpenuhi, wajib pelindungan mengikat atau persetujuan Subjek Data…', bm25: '0,91', vec: '0,94', rrf: '0,931', hash: 'b82d04' },
    { rank: '#3', cite: 'POJK 11/2022 Ps. 21(1)', snippet: 'Bank wajib memastikan penyedia jasa TI memberikan akses pemeriksaan kepada OJK dan auditor…', bm25: '0,86', vec: '0,89', rrf: '0,884', hash: '71f3c2' },
    { rank: '#4', cite: 'PP 71/2019 Ps. 20(2)', snippet: 'Penyelenggara Sistem Elektronik Lingkup Publik & Sektor Keuangan wajib mengelola pusat data RI…', bm25: '0,82', vec: '0,87', rrf: '0,852', hash: 'c05a77' },
    { rank: '#5', cite: 'UU 27/2022 Ps. 46(1)', snippet: 'Dalam hal terjadi kegagalan pelindungan Data Pribadi, pemberitahuan tertulis paling lambat 3x24 jam…', bm25: '0,79', vec: '0,85', rrf: '0,829', hash: '39e1ab' },
  ];

  const totalDocs = JDIH_CORPUS.reduce((a, c) => a + c.docs, 0);
  const totalPasal = JDIH_CORPUS.reduce((a, c) => a + c.pasal, 0);
  const totalChunks = JDIH_CORPUS.reduce((a, c) => a + c.chunks, 0);
  const totalCites = JDIH_CORPUS.reduce((a, c) => a + c.citations, 0);

  const content = `${ribbon}
  <div style="display:grid;grid-template-columns:922px 1fr;gap:9px;height:368px;flex-shrink:0;">
    <!-- TOP LEFT: HYBRID RAG LATENCY + SPAN WATERFALL -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('activity', 13, '#1f4e5f')}<span>Telemetri Hybrid RAG (BM25 + pgvector) & Waterfall Eksekusi Query</span></div>
        <span class="mono e-panel-sub">FastAPI Python 3.12 · PostgreSQL 16 pgvector</span>
      </div>
      <div class="e-panel-body" style="display:grid;grid-template-columns:476px 1fr;gap:12px;">
        <div style="display:flex;flex-direction:column;justify-content:space-between;">
          <div style="font-size:10px;font-weight:700;color:var(--nr-ink-2);margin-bottom:2px;">Tren Latensi Retrieval 13 Hari Terakhir (ms)</div>
          ${latencyChart}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;">
            <div style="padding:5px 7px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-muted);">Recall@10 JDIH</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:var(--nr-ok);">98,6%</div>
            </div>
            <div style="padding:5px 7px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-muted);">Bobot RRF Hybrid</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:var(--nr-accent-ink);">0,45 BM25 / 0,55 Vec</div>
            </div>
            <div style="padding:5px 7px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-muted);">Citation Hash Match</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:var(--nr-ok);">100% (48/48)</div>
            </div>
          </div>
        </div>
        <div style="border-left:1px solid var(--nr-border);padding-left:11px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
              <span style="font-size:10px;font-weight:700;color:var(--nr-ink-2);">Trace Pipeline Query · CL-14.2</span>
              <span class="mono" style="font-size:10px;font-weight:700;color:var(--nr-accent-ink);">Total: 318 ms</span>
            </div>
            ${waterfallSvg}
          </div>
          <div style="padding:7px 9px;background:#fcfbf8;border:1px solid var(--nr-border);border-radius:3px;font-size:9.6px;color:var(--nr-ink-2);">
            <div style="font-weight:700;color:var(--nr-ink);margin-bottom:2px;">Arsitektur Isolasi & Verifikasi</div>
            <div>Setiap kueri melewati <strong>RBAC Row-Level Security (RLS)</strong> berdasarkan <span class="mono">matter_id</span> sebelum membaca vektor JDIH read-only dan brankas kontrak terenkripsi S3.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TOP RIGHT: LIVE GROUNDING & CITATION VERIFIER -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('search', 13, '#1f4e5f')}<span>Verifikator Sitasi Langsung (Query CL-14.2)</span></div>
        ${badge('Top-5 Terverifikasi', 'ok')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
        <div style="padding:5px 8px;background:var(--nr-linen);border:1px solid var(--nr-border-strong);border-radius:3px;font-family:var(--e-mono);font-size:9.8px;color:var(--nr-ink);display:flex;justify-content:space-between;align-items:center;">
          <span class="trunc">Q: "transfer data pribadi lintas negara bank komersial DR Singapura"</span>
          <span style="color:var(--nr-ok);font-weight:700;">5/5 VALID</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;flex:1;">
          ${topChunks
            .map(
              (ch) => `<div style="padding:5px 8px;background:#ffffff;border:1px solid var(--nr-border);border-left:2.5px solid var(--nr-accent);border-radius:2px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                  <span style="font-weight:700;font-size:10.2px;color:var(--nr-accent-ink);"><span class="mono" style="color:var(--nr-muted);margin-right:4px;">${ch.rank}</span>${esc(ch.cite)}</span>
                  <span class="mono" style="font-size:9.2px;color:var(--nr-ink-2);">BM25 ${ch.bm25} · Vec ${ch.vec} · <strong style="color:var(--nr-ok);">RRF ${ch.rrf}</strong></span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;">
                  <span class="trunc serif" style="font-size:9.8px;color:var(--nr-ink-2);">${esc(ch.snippet)}</span>
                  <span class="mono" style="font-size:8.8px;color:var(--nr-info);flex-shrink:0;">sha:${ch.hash}</span>
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>
    </section>
  </div>

  <!-- BOTTOM ROW: FULL-WIDTH 10-ROW JDIH CORPUS INDEX TABLE -->
  <section class="e-panel" style="flex:1;min-height:0;">
    <div class="e-panel-head">
      <div class="e-panel-title">${legalIcon('bookLaw', 13, '#1f4e5f')}<span>Katalog Indeks Korpus Regulasi JDIH & Status Sinkronisasi PostgreSQL pgvector</span></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="mono e-panel-sub">Sumber Resmi: Setneg · BPHN · OJK · Komdigi · Mahkamah Agung</span>
        ${badge('Indeks HNSW Optimal', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table" style="flex:1;">
        <thead>
          <tr>
            <th style="width:74px;">ID Indeks</th>
            <th>Korpus Peraturan Perundang-Undangan Indonesia</th>
            <th class="num" style="width:82px;">Dokumen</th>
            <th class="num" style="width:94px;">Jumlah Pasal</th>
            <th class="num" style="width:106px;">Chunk pgvector</th>
            <th style="width:155px;">Sumber Otoritatif JDIH</th>
            <th style="width:110px;">Sinkron Terakhir</th>
            <th class="num" style="width:108px;">Sitasi di Matter</th>
            <th style="width:74px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${JDIH_CORPUS.map(
            (c) => `<tr>
              <td class="mono" style="font-weight:700;color:var(--nr-accent-ink);">${esc(c.id)}</td>
              <td style="font-weight:600;">${esc(c.reg)}</td>
              <td class="num mono">${fmtNum(c.docs)}</td>
              <td class="num mono" style="font-weight:600;">${fmtNum(c.pasal)}</td>
              <td class="num mono">${fmtNum(c.chunks)}</td>
              <td class="mono" style="font-size:9.6px;color:var(--nr-info);">${esc(c.source)}</td>
              <td class="mono" style="font-size:9.6px;">${esc(c.sync)}</td>
              <td class="num mono" style="font-weight:700;color:var(--nr-ink);">${c.citations} sitasi</td>
              <td>${badge(c.status, c.tone)}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total Korpus Hukum Indonesia Terverifikasi dalam Klaster NusaRAG Legal</td>
            <td class="num mono">${fmtNum(totalDocs)}</td>
            <td class="num mono">${fmtNum(totalPasal)}</td>
            <td class="num mono">${fmtNum(totalChunks)}</td>
            <td class="mono">5 Gerbang JDIH Aktif</td>
            <td class="mono">22 Nov 04:08</td>
            <td class="num mono">${totalCites} sitasi</td>
            <td class="mono" style="color:var(--nr-ok);">100% OK</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  return renderLegalShell({
    activeSlug: 'p4',
    actionsHtml: `
      <span class="e-btn">${ic('refresh', 12, '#1f4e5f')} Sinkron Ulang JDIH</span>
      <span class="e-btn e-btn-primary">${ic('database', 12, '#ffffff')} Uji Kueri Hybrid RAG</span>
    `,
    contentHtml: content,
  });
}

// ============================================================================
// PAGE 5 — EKSPOR MEMO RISIKO HUKUM, TANDA TANGAN PARTNER & E-METERAI PERURI
// ============================================================================
function renderPage5() {
  const topStrip = `<section style="height:38px;background:var(--nr-paper);border:1px solid var(--nr-border-strong);border-radius:3px;padding:0 11px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:8px;">
      ${legalIcon('stamp', 14, '#1f4e5f')}
      <span style="font-weight:700;font-size:11.5px;">Memorandum Risiko Hukum Siap Tanda Tangan Partner & Direksi</span>
      <span class="mono" style="font-size:10px;color:var(--nr-muted);">No. ${esc(MATTER.memoNumber)}</span>
      ${badge('Klasifikasi: Rahasia Korporat', 'bad')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <span class="mono" style="font-size:9.8px;color:var(--nr-ok);font-weight:700;">Peruri e-Meterai API: Terhubung (Saldo Kuota: 142 keping)</span>
      ${badge('Siap Ekspor PDF/DOCX', 'ok')}
    </div>
  </section>`;

  const deliverables = [
    { name: 'Memo_Risiko_Hukum_MATTER-2026-884.pdf', engine: 'PDF/A-2b + Digital Sign', size: '1,42 MB', status: 'Siap TTD', tone: 'ok' },
    { name: 'MSA_SingTel_v4.2_Redline_ID-EN.docx', engine: 'C# Docx Engine (7 OOXML)', size: '864 KB', status: 'Siap Kirim', tone: 'ok' },
    { name: 'Lampiran_DPA_UU_PDP_18Kontrol.xlsx', engine: 'OpenXML Sheet + Sitasi', size: '312 KB', status: '4 Blocker', tone: 'warn' },
    { name: 'Paket_Bukti_Sitasi_JDIH_WORM.json', engine: 'SHA-256 Audit Bundle', size: '198 KB', status: 'Terkunci', tone: 'info' },
  ];

  const auditLogs = [
    { time: '10:03:48', actor: 'R. Suryadi, S.H.', action: 'Kunci Draf Memo Risiko No. 084/LEG-CORP/XI/2026', hash: '9d4a…7f1c' },
    { time: '09:58:12', actor: 'C# Docx Engine', action: 'Kompilasi 7 revisi OOXML (w:ins / w:del) ke DOCX dwibahasa', hash: '8c12…3e09' },
    { time: '09:51:04', actor: 'NusaRAG Verifier', action: 'Verifikasi hash 69 sitasi JDIH pada 48/48 klausul (0 halusinasi)', hash: '7a04…9b42' },
    { time: '09:44:29', actor: 'Dra. N. Kartika', action: 'Tandai 4 blocker DPA UU PDP (Ps. 44, 46, 53, 56)', hash: '6f91…2d8a' },
    { time: '09:38:15', actor: 'Bilingual Diff', action: 'Deteksi selisih CL-19.1 Prevailing & CL-11.3 Cap Rp 13,6 M', hash: '5e23…1a7f' },
    { time: '09:35:40', actor: 'pgvector Index', action: 'Tautkan 48 klausul ke korpus JDIH v2026.11 (48.210 pasal)', hash: '4f88…6b21' },
    { time: '09:32:02', actor: 'RBAC Vault S3', action: 'Unggah & isolasi MSA_SingTel_CoreCloud_v4.2_Bilingual.docx', hash: '4b19…0c6e' },
    { time: '09:30:11', actor: 'Matter API', action: 'Inisialisasi MATTER-2026-884 dengan kebijakan RLS Strict', hash: '3a01…8e5d' },
  ];

  const content = `${topStrip}
  <div style="flex:1;min-height:0;display:grid;grid-template-columns:926px 1fr;gap:9px;">
    <!-- LEFT: FORMAL INDONESIAN LEGAL RISK MEMORANDUM PAPER PREVIEW -->
    <section class="e-panel" style="min-height:0;background:#ece8df;">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('fileText', 13, '#1f4e5f')}<span>Pratinjau Dokumen Resmi — Memorandum Risiko Hukum (A4 Editorial)</span></div>
        <span class="mono e-panel-sub">Halaman 1 dari 6 · Font: Georgia Legal · Margin Standar Korporat</span>
      </div>
      <div class="e-panel-body" style="padding:10px 14px;background:#ece8df;display:flex;flex-direction:column;">
        <div style="flex:1;background:#ffffff;border:1px solid #c5beb0;border-top:4px solid var(--nr-accent);padding:14px 18px;display:flex;flex-direction:column;justify-content:space-between;gap:9px;">
          <!-- Formal Letterhead -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:8px;border-bottom:2px solid var(--nr-ink);">
            <div>
              <div style="font-size:9.2px;font-weight:700;letter-spacing:0.08em;color:var(--nr-accent);">DIVISI LEGAL KORPORAT & KEPATUHAN · PT BANK NUSANTARA TBK</div>
              <div class="serif" style="font-size:15.5px;font-weight:700;color:var(--nr-ink);margin-top:2px;">MEMORANDUM RISIKO HUKUM & REKOMENDASI REVISI KONTRAK</div>
            </div>
            <div style="text-align:right;" class="mono">
              <div style="font-size:9.8px;font-weight:700;color:var(--nr-bad);">RAHASIA · PRIVILEGED</div>
              <div style="font-size:9.5px;color:var(--nr-ink-2);">No: ${esc(MATTER.memoNumber)}</div>
              <div style="font-size:9.2px;color:var(--nr-muted);">Jakarta, 22 November 2026</div>
            </div>
          </div>

          <!-- Memo Meta Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:10.3px;padding-bottom:7px;border-bottom:1px solid var(--nr-border);">
            <div><span style="color:var(--nr-muted);display:inline-block;width:72px;">Kepada</span>: <strong>Direksi & Komite Risiko TI PT Bank Nusantara Tbk</strong></div>
            <div><span style="color:var(--nr-muted);display:inline-block;width:72px;">Matter ID</span>: <span class="mono" style="font-weight:700;">${esc(MATTER.code)}</span> (Dwibahasa ID/EN)</div>
            <div><span style="color:var(--nr-muted);display:inline-block;width:72px;">Dari</span>: R. Suryadi, S.H., LL.M. & DPO (Dra. N. Kartika)</div>
            <div><span style="color:var(--nr-muted);display:inline-block;width:72px;">Nilai / Tenor</span>: <strong class="mono">${fmtIdr(MATTER.contractValueIdr)}</strong> / 36 Bulan</div>
            <div style="grid-column:span 2;"><span style="color:var(--nr-muted);display:inline-block;width:72px;">Perihal</span>: <strong>Uji Kepatuhan MSA Cloud Core Banking — SingTel Cloud Enterprise Pte. Ltd.</strong></div>
          </div>

          <!-- Executive Legal Opinion -->
          <div style="padding:7px 10px;background:var(--nr-bad-bg);border:1px solid var(--nr-bad-bd);border-left:3px solid var(--nr-bad);border-radius:2px;">
            <div style="font-size:10px;font-weight:700;color:var(--nr-bad);margin-bottom:2px;">I. OPINI HUKUM & REKOMENDASI KEPUTUSAN</div>
            <div class="serif" style="font-size:10.7px;line-height:1.42;color:var(--nr-ink);">
              Berdasarkan audit menyeluruh terhadap <strong>48 dari 48 klausul</strong> terhadap UU PDP No. 27/2022, UU No. 24/2009, KUHPerdata, dan POJK 11/2022, Divisi Legal <strong>TIDAK MEREKOMENDASIKAN penandatanganan draf v4.2</strong> sebelum vendor menyetujui <strong>6 revisi Risiko Tinggi</strong> (termasuk koreksi selisih ganti rugi dwibahasa sebesar <strong>Rp 13,6 Miliar</strong>) serta <strong>percepatan batas notifikasi kebocoran data dari 7 hari kerja menjadi maksimal 3 x 24 jam</strong> (Pasal 46 UU PDP).
            </div>
          </div>

          <!-- Section II: All 6 High Risk Findings Table -->
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--nr-accent-ink);margin-bottom:4px;">II. RINGKASAN 6 TEMUAN RISIKO TINGGI & DAMPAK HUKUM (WAJIB REVISI SEBELUM TTD)</div>
            <table class="e-table" style="border:1px solid var(--nr-border-strong);">
              <thead>
                <tr>
                  <th style="width:60px;">Klausul</th>
                  <th style="width:196px;">Isu Hukum Utama</th>
                  <th style="width:124px;">Dasar Hukum JDIH</th>
                  <th>Tindakan Korektif Wajib (Redline OOXML)</th>
                  <th style="width:112px;">Eksposur</th>
                </tr>
              </thead>
              <tbody>
                ${HIGH_RISK_FINDINGS.map(
                  (f) => `<tr>
                    <td class="mono" style="font-weight:700;color:var(--nr-bad);">${esc(f.code)}</td>
                    <td style="font-weight:600;">${esc(f.title)}</td>
                    <td class="mono" style="font-size:9.3px;color:var(--nr-info);">${esc(f.law)}</td>
                    <td class="trunc" style="font-size:10px;">${esc(f.sub)}</td>
                    <td class="mono" style="font-size:9.4px;font-weight:700;color:var(--nr-bad);">${esc(f.exposure)}</td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
            <div style="margin-top:4px;font-size:9.5px;color:var(--nr-warn);font-weight:600;">
              Catatan Tambahan DPA Wajib: CL-08.4 (Revisi) wajib mengubah tenggat notifikasi kebocoran data 7 hari kerja menjadi &lt;= 3x24 jam (Pasal 46 UU PDP).
            </div>
          </div>

          <!-- Section III: Negotiating Action Plan -->
          <div style="padding:7px 10px;background:var(--nr-linen);border:1px solid var(--nr-border);border-radius:2px;">
            <div style="font-size:10px;font-weight:700;color:var(--nr-accent-ink);margin-bottom:4px;">III. RENCANA TINDAK LANJUT NEGOSIASI & SYARAT PENANDATANGANAN</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:9.8px;color:var(--nr-ink);">
              <div style="background:#ffffff;border:1px solid var(--nr-border);padding:6px 8px;border-radius:2px;">
                <strong style="color:var(--nr-accent-ink);">1. Counter-Redline (24 Nov)</strong>
                <div style="color:var(--nr-ink-2);margin-top:2px;">Kirim berkas <span class="mono">MSA_Redline_ID-EN.docx</span> (7 OOXML Track Changes) ke tim legal SingTel Singapura.</div>
              </div>
              <div style="background:#ffffff;border:1px solid var(--nr-border);padding:6px 8px;border-radius:2px;">
                <strong style="color:var(--nr-accent-ink);">2. Penutupan 4 Blocker DPA (26 Nov)</strong>
                <div style="color:var(--nr-ink-2);margin-top:2px;">DPO memverifikasi lampiran BCR Singapura, kontak DPO vendor, sertifikat NIST 800-88, dan SLA 6j/3x24j.</div>
              </div>
              <div style="background:#ffffff;border:1px solid var(--nr-border);padding:6px 8px;border-radius:2px;">
                <strong style="color:var(--nr-accent-ink);">3. TTD Direksi & e-Meterai (28 Nov)</strong>
                <div style="color:var(--nr-ink-2);margin-top:2px;">Setelah skor DPA 18/18 &amp; 0 Risiko Tinggi, jalankan TTD BSrE + pembubuhan Peruri e-Meterai Rp 10.000.</div>
              </div>
            </div>
          </div>

          <!-- Section III: Signature Block & Peruri e-Meterai Seal -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 196px;gap:8px;padding-top:8px;border-top:1px solid var(--nr-border-strong);">
            <div style="padding:7px 8px;border:1px solid var(--nr-ok-bd);background:var(--nr-ok-bg);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-ok);font-weight:700;">DISUSUN & DIVERIFIKASI</div>
              <div class="serif" style="font-size:11px;font-weight:700;margin:6px 0 2px;">R. Suryadi, S.H., LL.M.</div>
              <div style="font-size:9px;color:var(--nr-ink-2);">Senior Legal Counsel</div>
              <div class="mono" style="font-size:8.6px;color:var(--nr-ok);margin-top:4px;">Signed · 22 Nov 10:03 WIB</div>
            </div>
            <div style="padding:7px 8px;border:1px solid var(--nr-warn-bd);background:var(--nr-warn-bg);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-warn);font-weight:700;">PENINJAUAN DPO (UU PDP)</div>
              <div class="serif" style="font-size:11px;font-weight:700;margin:6px 0 2px;">Dra. N. Kartika, CIPP/A</div>
              <div style="font-size:9px;color:var(--nr-ink-2);">Data Protection Officer</div>
              <div class="mono" style="font-size:8.6px;color:var(--nr-warn);margin-top:4px;">Menunggu revisi 4 blocker</div>
            </div>
            <div style="padding:7px 8px;border:1px solid var(--nr-border);background:var(--nr-linen);border-radius:2px;">
              <div style="font-size:9px;color:var(--nr-muted);font-weight:700;">PERSETUJUAN DIREKSI</div>
              <div class="serif" style="font-size:11px;font-weight:700;margin:6px 0 2px;">H. Wibowo, S.H., M.H.</div>
              <div style="font-size:9px;color:var(--nr-ink-2);">Direktur Kepatuhan & Legal</div>
              <div class="mono" style="font-size:8.6px;color:var(--nr-muted);margin-top:4px;">Antrean TTD Digital BSrE</div>
            </div>
            <div style="padding:7px 8px;border:1.5px dashed var(--nr-accent);background:var(--nr-accent-soft);border-radius:2px;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9px;font-weight:800;color:var(--nr-accent-ink);">PERURI e-METERAI</span>
                <span class="mono" style="font-size:8.8px;font-weight:700;color:var(--nr-accent);">Rp 10.000</span>
              </div>
              <div class="mono" style="font-size:8.4px;color:var(--nr-ink);line-height:1.3;">
                <div>SN: ${esc(MATTER.emeteraiSerial)}</div>
                <div>Mode: Stamping Final MSA</div>
              </div>
              <div style="font-size:8.6px;font-weight:700;color:var(--nr-ok);">API Peruri · Tervalidasi</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RIGHT COLUMN: EXPORT PACKAGES + APPROVAL WORKFLOW + WORM AUDIT LOG -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('download', 13, '#1f4e5f')}<span>Paket Ekspor C# Docx Engine v4.2</span></div>
          <span class="mono e-panel-sub">4 artefak siap</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <thead>
              <tr>
                <th>Nama Berkas Ekspor</th>
                <th style="width:136px;">Format Engine</th>
                <th class="num" style="width:62px;">Ukuran</th>
                <th style="width:74px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${deliverables
                .map(
                  (d) => `<tr>
                    <td class="mono trunc" style="font-size:9.6px;font-weight:600;">${esc(d.name)}</td>
                    <td style="font-size:9.8px;color:var(--nr-ink-2);">${esc(d.engine)}</td>
                    <td class="num mono" style="font-size:9.6px;">${esc(d.size)}</td>
                    <td>${badge(d.status, d.tone)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="e-panel" style="flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${legalIcon('penSign', 13, '#1f4e5f')}<span>Alur Persetujuan Partner & Isolasi Matter</span></div>
          ${badge('Tahap 2 / 4', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;font-size:10.1px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--nr-ok-bg);border:1px solid var(--nr-ok-bd);border-radius:3px;">
            <div><strong>Tahap 1 · Audit Klausul & Redline Dwibahasa</strong><div style="font-size:9.3px;color:var(--nr-ink-2);">R. Suryadi, S.H. · 48/48 klausul terverifikasi JDIH</div></div>
            ${badge('Disetujui', 'ok')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--nr-warn-bg);border:1px solid var(--nr-warn-bd);border-radius:3px;">
            <div><strong>Tahap 2 · Validasi DPO & Counter-Redline Vendor</strong><div style="font-size:9.3px;color:var(--nr-ink-2);">Dra. N. Kartika · Tunggu respons SingTel atas 4 blocker DPA</div></div>
            ${badge('Aktif', 'warn')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#ffffff;border:1px solid var(--nr-border);border-radius:3px;">
            <div><strong>Tahap 3 · Tanda Tangan Managing Partner & Direksi</strong><div style="font-size:9.3px;color:var(--nr-muted);">H. Wibowo, S.H., M.H. · Sertifikat Elektronik BSrE / Privy</div></div>
            ${badge('Antre', 'neutral')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#ffffff;border:1px solid var(--nr-border);border-radius:3px;">
            <div><strong>Tahap 4 · Pembubuhan Peruri e-Meterai & Arsip WORM</strong><div style="font-size:9.3px;color:var(--nr-muted);">Penyimpanan S3 Terenkripsi KMS-ID · Retensi 10 tahun</div></div>
            ${badge('Otomatis', 'info')}
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('lock', 13, '#1f4e5f')}<span>Jejak Audit Imutabel (WORM SHA-256 · Encrypted S3)</span></div>
          <span class="mono e-panel-sub">Zero Tamper</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="flex:1;">
            <thead>
              <tr>
                <th style="width:66px;">WIB</th>
                <th style="width:108px;">Aktor / Mesin</th>
                <th>Aktivitas Tercatat</th>
                <th style="width:74px;">Hash</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs
                .map(
                  (l) => `<tr>
                    <td class="mono" style="font-size:9.5px;color:var(--nr-muted);">${esc(l.time)}</td>
                    <td style="font-weight:600;font-size:10px;">${esc(l.actor)}</td>
                    <td class="trunc" style="font-size:10px;">${esc(l.action)}</td>
                    <td class="mono" style="font-size:9.3px;color:var(--nr-info);">${esc(l.hash)}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>`;

  return renderLegalShell({
    activeSlug: 'p5',
    actionsHtml: `
      <span class="e-btn">${legalIcon('stamp', 12, '#1f4e5f')} Uji Stamping e-Meterai</span>
      <span class="e-btn e-btn-primary">${ic('download', 12, '#ffffff')} Ekspor Paket Memo & Redline</span>
    `,
    contentHtml: content,
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
