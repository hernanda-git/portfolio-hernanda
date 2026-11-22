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
  svgSpanWaterfall,
  renderCapacityBar,
} from '../charts.mjs';

export const meta = {
  id: 'ID-003',
  name: 'SuaraCS QA',
  reference: 'LangSmith Enterprise + Genesys Cloud CX Quality + Datadog Telemetry',
  persona: 'D. Kusuma · Lead QA & Compliance Supervisor · PT Bank Nusantara Mandiri',
  pages: [
    { slug: 'p1', title: 'Pusat Kendali Audit & Telemetri ASR Dialek' },
    { slug: 'p2', title: 'Antrean Audit Panggilan & Inspektor Cepat' },
    { slug: 'p3', title: 'Studio Forensik Audio, Diarization & Sensor PII' },
    { slug: 'p4', title: 'Pipeline AI, Guardrail OJK & Atribusi Biaya' },
    { slug: 'p5', title: 'Antrean Coaching <5 Menit & Kepatuhan WORM PDP' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const SHIFT_INFO = {
  code: 'SHIFT-PAGI',
  window: '07:00–15:00 WIB',
  date: '22 Nov 2026',
  tenant: 'PT Bank Nusantara Mandiri · CC Jakarta & Bandung',
  totalIncoming: 1420,
  totalAudited: 1420,
  uniquePiiCalls: 312,
  avgDurationSec: 342, // 05m 42d
  avgQaScore: 88.6,
  slaCoachingTargetMin: 5,
  slaCoachingAvgSec: 168, // 02m 48d
  modelVersion: 'Whisper-ID v3.4-ct2',
  scorerVersion: '.NET 9 RubricEngine v2.8',
};

// 6 Service Queues — calls sum = 1,420; ojkPass sum = 1,369 (96.4%); violations = 51; escalations = 19; costIdr = 2,840,000
const SERVICE_QUEUES = [
  {
    id: 'Q-CC-QRIS',
    name: 'Kartu Kredit & Sanggah QRIS',
    pbxGroup: 'Genesys-CC-01',
    calls: 340,
    ojkPass: 326,
    violations: 14,
    escalations: 5,
    avgScore: 86.4,
    piiSegments: 118,
    costGpu: 340000,
    costNer: 136000,
    costScorer: 122400,
    costStorage: 81600,
    costIdr: 680000,
    tone: 'warn',
  },
  {
    id: 'Q-KLAIM-RI',
    name: 'Klaim Asuransi & Rawat Inap',
    pbxGroup: 'Avaya-INS-02',
    calls: 280,
    ojkPass: 273,
    violations: 7,
    escalations: 3,
    avgScore: 91.2,
    piiSegments: 76,
    costGpu: 280000,
    costNer: 112000,
    costScorer: 100800,
    costStorage: 67200,
    costIdr: 560000,
    tone: 'ok',
  },
  {
    id: 'Q-BIFAST',
    name: 'BI-FAST & Reset Mobile Token',
    pbxGroup: 'Genesys-DIG-03',
    calls: 260,
    ojkPass: 254,
    violations: 6,
    escalations: 2,
    avgScore: 90.8,
    piiSegments: 114,
    costGpu: 260000,
    costNer: 104000,
    costScorer: 93600,
    costStorage: 62400,
    costIdr: 520000,
    tone: 'ok',
  },
  {
    id: 'Q-BANCA',
    name: 'Penawaran Bancassurance',
    pbxGroup: 'Genesys-SLS-04',
    calls: 220,
    ojkPass: 205,
    violations: 15,
    escalations: 6,
    avgScore: 81.5,
    piiSegments: 42,
    costGpu: 220000,
    costNer: 88000,
    costScorer: 79200,
    costStorage: 52800,
    costIdr: 440000,
    tone: 'bad',
  },
  {
    id: 'Q-KPR-CICIL',
    name: 'KPR, Cicilan & Restrukturisasi',
    pbxGroup: 'Avaya-CRD-05',
    calls: 190,
    ojkPass: 184,
    violations: 6,
    escalations: 2,
    avgScore: 89.4,
    piiSegments: 44,
    costGpu: 190000,
    costNer: 76000,
    costScorer: 68400,
    costStorage: 45600,
    costIdr: 380000,
    tone: 'ok',
  },
  {
    id: 'Q-WEALTH',
    name: 'Nasabah Prioritas & Wealth',
    pbxGroup: 'Genesys-VIP-06',
    calls: 130,
    ojkPass: 127,
    violations: 3,
    escalations: 1,
    avgScore: 93.7,
    piiSegments: 24,
    costGpu: 130000,
    costNer: 52000,
    costScorer: 46800,
    costStorage: 31200,
    costIdr: 260000,
    tone: 'ok',
  },
];

// 6 Dialect & Acoustic Channel Cohorts — calls sum = 1,420
const DIALECT_COHORTS = [
  { code: 'ID-BAKU', label: 'Bahasa Indonesia Percakapan Baku', calls: 486, wer: 4.1, conf: 0.96, rtf: '0,003x', ojkAcc: 98.4, status: 'Optimal', tone: 'ok' },
  { code: 'ID-JAWA', label: 'Campur-Kode ID + Jawa (Ngoko/Krama)', calls: 318, wer: 5.8, conf: 0.94, rtf: '0,004x', ojkAcc: 97.1, status: 'Optimal', tone: 'ok' },
  { code: 'ID-ENG', label: 'Campur-Kode ID + Inggris Perbankan', calls: 264, wer: 5.2, conf: 0.95, rtf: '0,004x', ojkAcc: 97.6, status: 'Optimal', tone: 'ok' },
  { code: 'ID-SUNDA', label: 'Campur-Kode ID + Sunda (Priangan)', calls: 172, wer: 6.4, conf: 0.92, rtf: '0,004x', ojkAcc: 96.2, status: 'Stabil', tone: 'ok' },
  { code: 'ID-REG', label: 'Dialek Regional (Melayu/Minang/Bugis)', calls: 112, wer: 7.9, conf: 0.89, rtf: '0,005x', ojkAcc: 94.8, status: 'Pantau', tone: 'warn' },
  { code: 'PSTN-8K', label: 'Jalur PSTN 8kHz / Noise Lingkungan', calls: 68, wer: 9.6, conf: 0.85, rtf: '0,006x', ojkAcc: 92.6, status: 'Denoise+', tone: 'warn' },
];

// Hourly telemetry (07:00 - 14:00 WIB) — volumes sum = 1,420
const HOURLY_LABELS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
const HOURLY_VOLUME = [118, 164, 212, 238, 206, 174, 168, 140];
const HOURLY_OJK_PCT = [98.3, 97.6, 96.7, 93.8, 95.6, 97.1, 96.4, 97.2];
const HOURLY_SENTIMENT_POS = [86.2, 84.5, 81.0, 74.8, 79.4, 83.1, 82.6, 85.0];

// PII Audio Bleep Categories — count sum = 418 across 312 unique calls, 0 leaked
const PII_CATEGORIES = [
  { code: 'PII-AUD-01', label: 'Kode OTP 6-Digit / Token SMS', count: 164, method: 'Tone 1 kHz + Zero-PCM', avgMs: '410 ms', leak: 0, regulation: 'POJK 11/2022 · PCI-DSS' },
  { code: 'PII-AUD-02', label: 'Nama Ibu Kandung (KYC Verbal)', count: 112, method: 'Tone 1 kHz + Redact Teks', avgMs: '820 ms', leak: 0, regulation: 'UU PDP Ps. 4(2)' },
  { code: 'PII-AUD-03', label: 'Kode CVV / CVC 3-Digit Kartu', count: 78, method: 'Hard Mute + Tone 1 kHz', avgMs: '380 ms', leak: 0, regulation: 'PCI-DSS v4.0 Req 3.2' },
  { code: 'PII-AUD-04', label: 'NIK 16-Digit / Nomor KTP', count: 41, method: 'Tone 1 kHz + Tokenisasi', avgMs: '1.140 ms', leak: 0, regulation: 'UU PDP Ps. 4(2)' },
  { code: 'PII-AUD-05', label: 'Nomor Rekening & PIN Verbal', count: 23, method: 'Hard Mute + WORM Lock', avgMs: '690 ms', leak: 0, regulation: 'POJK 22/2023 · UU PDP' },
];

// 16 Realistic Call Audit Records (P2 Operational Grid)
const CALL_LOGS = [
  { code: 'CALL-9019', time: '10:18:42', topic: 'Penawaran Bancassurance', agent: 'Agen Dewi', unit: 'Bancassurance', dialect: 'ID Baku', dur: '07m 28d', sent: 'Eskalasi', sentTone: 'bad', pii: 0, score: 42, status: 'Pelanggaran', tone: 'bad', selected: true, note: 'Tidak membacakan hak cooling-off OJK 14 hari kerja' },
  { code: 'CALL-9015', time: '10:16:09', topic: 'Sanggah Transaksi QRIS', agent: 'Agen Bima', unit: 'Kartu & QRIS', dialect: 'ID / Inggris', dur: '05m 51d', sent: 'Kecewa', sentTone: 'warn', pii: 1, score: 68, status: 'Coaching', tone: 'warn', note: 'Melewatkan info SLA penyelesaian sengketa 14 hari kerja' },
  { code: 'CALL-9021', time: '10:15:33', topic: 'Reset Mobile Token', agent: 'Agen Fajar', unit: 'BI-FAST', dialect: 'ID / Sunda', dur: '05m 42d', sent: 'Netral', sentTone: 'info', pii: 3, score: 91, status: 'Disensor', tone: 'ok', note: 'Nasabah sebut OTP, Ibu Kandung & CVV; otomatis disensor 1kHz' },
  { code: 'CALL-9012', time: '10:14:18', topic: 'Klaim Rawat Inap', agent: 'Agen Rina', unit: 'Klaim RI', dialect: 'ID / Jawa', dur: '06m 14d', sent: 'Tenang', sentTone: 'ok', pii: 1, score: 94, status: 'Lulus', tone: 'ok', note: 'Verifikasi polis & disclaimer manfaat dibacakan lengkap' },
  { code: 'CALL-9024', time: '10:12:55', topic: 'Penawaran Bancassurance', agent: 'Agen Dimas', unit: 'Bancassurance', dialect: 'ID / Jawa', dur: '08m 04d', sent: 'Eskalasi', sentTone: 'bad', pii: 0, score: 47, status: 'Pelanggaran', tone: 'bad', note: 'Menyamakan premi unit-link dengan tabungan berjangka' },
  { code: 'CALL-9023', time: '10:11:40', topic: 'Gagal Transfer BI-FAST', agent: 'Agen Nabila', unit: 'BI-FAST', dialect: 'ID Baku', dur: '04m 36d', sent: 'Kecewa', sentTone: 'warn', pii: 2, score: 89, status: 'Disensor', tone: 'ok', note: 'Rekening & OTP disensor; nomor tiket BI-FAST disampaikan' },
  { code: 'CALL-9022', time: '10:09:12', topic: 'Cicilan 0% Kartu Kredit', agent: 'Agen Hendra', unit: 'Kartu & QRIS', dialect: 'ID / Inggris', dur: '05m 19d', sent: 'Netral', sentTone: 'info', pii: 2, score: 71, status: 'Coaching', tone: 'warn', note: 'Biaya admin konversi cicilan Rp 50rb tidak disebut di awal' },
  { code: 'CALL-9020', time: '10:07:48', topic: 'Restrukturisasi KPR', agent: 'Agen Sari', unit: 'KPR & Cicilan', dialect: 'ID / Sunda', dur: '09m 12d', sent: 'Tenang', sentTone: 'ok', pii: 1, score: 95, status: 'Lulus', tone: 'ok', note: 'Simulasi bunga berjenjang & hak nasabah sesuai POJK' },
  { code: 'CALL-9018', time: '10:05:27', topic: 'Blokir Kartu Hilang', agent: 'Agen Yoga', unit: 'Kartu & QRIS', dialect: 'ID / Jawa', dur: '03m 48d', sent: 'Cemas', sentTone: 'warn', pii: 2, score: 96, status: 'Disensor', tone: 'ok', note: 'Respons darurat <40 detik; ibu kandung & NIK disensor' },
  { code: 'CALL-9017', time: '10:03:54', topic: 'Sanggah Transaksi QRIS', agent: 'Agen Rahmat', unit: 'Kartu & QRIS', dialect: 'PSTN 8kHz', dur: '06m 45d', sent: 'Eskalasi', sentTone: 'bad', pii: 0, score: 54, status: 'Pelanggaran', tone: 'bad', note: 'Nada suara tinggi; melewati prosedur eskalasi supervisor' },
  { code: 'CALL-9016', time: '10:01:30', topic: 'Penutupan Polis Jiwa', agent: 'Agen Putu', unit: 'Klaim RI', dialect: 'ID Regional', dur: '07m 05d', sent: 'Kecewa', sentTone: 'warn', pii: 1, score: 74, status: 'Coaching', tone: 'warn', note: 'Penjelasan nilai tunai surrender kurang jelas di menit 04:20' },
  { code: 'CALL-9014', time: '09:58:19', topic: 'Pembukaan Rekening Prioritas', agent: 'Agen Citra', unit: 'Wealth', dialect: 'ID / Inggris', dur: '06m 31d', sent: 'Tenang', sentTone: 'ok', pii: 1, score: 97, status: 'Lulus', tone: 'ok', note: 'Profil risiko & disclaimer produk investasi lengkap (0.98)' },
  { code: 'CALL-9013', time: '09:55:44', topic: 'Aktivasi Limit Kartu Kredit', agent: 'Agen Bayu', unit: 'Kartu & QRIS', dialect: 'ID Baku', dur: '04m 15d', sent: 'Netral', sentTone: 'info', pii: 2, score: 92, status: 'Disensor', tone: 'ok', note: 'CVV & OTP disensor otomatis; verifikasi KYC 3 lapis lulus' },
  { code: 'CALL-9011', time: '09:53:08', topic: 'Klaim Cashless RS Mitra', agent: 'Agen Melati', unit: 'Klaim RI', dialect: 'ID / Jawa', dur: '05m 38d', sent: 'Tenang', sentTone: 'ok', pii: 1, score: 93, status: 'Lulus', tone: 'ok', note: 'Koordinasi surat jaminan awal & konfirmasi kamar kelas I' },
  { code: 'CALL-9010', time: '09:50:22', topic: 'Penawaran Bancassurance', agent: 'Agen Bagas', unit: 'Bancassurance', dialect: 'ID / Sunda', dur: '06m 52d', sent: 'Kecewa', sentTone: 'warn', pii: 0, score: 66, status: 'Coaching', tone: 'warn', note: 'Membacakan disclaimer OJK terlalu cepat (>210 kata/menit)' },
  { code: 'CALL-9009', time: '09:47:15', topic: 'Ubah Nomor HP Mobile Bank', agent: 'Agen Intan', unit: 'BI-FAST', dialect: 'ID Baku', dur: '04m 54d', sent: 'Tenang', sentTone: 'ok', pii: 2, score: 95, status: 'Disensor', tone: 'ok', note: 'KTP & Ibu Kandung disensor; validasi video KYC terjadwal' },
];

// CALL-9019 Detailed Rubric (P2 Right Inspector) — sum = 42 / 100
const CALL_9019_RUBRIC = [
  { code: 'R-01', name: 'Salam, Nama Agen & Pemberitahuan Rekaman', max: 10, score: 9, status: 'Lulus', tone: 'ok', conf: '0.98' },
  { code: 'R-02', name: 'Verifikasi Identitas Nasabah (KYC 2 Faktor)', max: 20, score: 16, status: 'Parsial', tone: 'warn', conf: '0.93' },
  { code: 'R-03', name: 'Transparansi Premi, Biaya Akuisisi & Risiko', max: 20, score: 8, status: 'Kurang', tone: 'warn', conf: '0.91' },
  { code: 'R-04', name: 'Disclaimer Hak Cooling-Off 14 Hari OJK', max: 25, score: 0, status: 'GAGAL', tone: 'bad', conf: '0.99' },
  { code: 'R-05', name: 'Empati, Tempo Bicara & Kontrol Eskalasi', max: 15, score: 6, status: 'Kurang', tone: 'bad', conf: '0.94' },
  { code: 'R-06', name: 'Konfirmasi Persetujuan & Nomor Tiket', max: 10, score: 3, status: 'Kurang', tone: 'warn', conf: '0.95' },
];

// CALL-9021 Detailed Rubric (P3 Forensic Studio) — sum = 91 / 100
const CALL_9021_RUBRIC = [
  { code: 'R-01', name: 'Salam & Pemberitahuan Rekaman Panggilan', max: 10, score: 10, status: 'Lulus', tone: 'ok', time: '00:14' },
  { code: 'R-02', name: 'Verifikasi KYC Berlapis & Anti-Social Eng.', max: 20, score: 19, status: 'Lulus', tone: 'ok', time: '01:48' },
  { code: 'R-03', name: 'Prosedur Reset Mobile Token & Edukasi OTP', max: 25, score: 22, status: 'Lulus', tone: 'ok', time: '02:36' },
  { code: 'R-04', name: 'Kontrol PII Verbal + Sensor Audio 1 kHz', max: 20, score: 18, status: 'Disensor', tone: 'ok', time: '03:35' },
  { code: 'R-05', name: 'Artikulasi Campur-Kode ID/Sunda & Empati', max: 15, score: 13, status: 'Lulus', tone: 'ok', time: '04:05' },
  { code: 'R-06', name: 'Konfirmasi SLA Aktivasi & Penutupan', max: 10, score: 9, status: 'Lulus', tone: 'ok', time: '05:18' },
];

// CALL-9021 Acoustic Pipeline Waterfall — sum = 1,380 ms
const CALL_9021_SPANS = [
  { label: 'SIPREC RTP Demux', start: 0, dur: 42, color: '#0e6b5e' },
  { label: 'Silero VAD + Denoise', start: 42, dur: 68, color: '#0d9488' },
  { label: 'Pyannote Diarization', start: 110, dur: 185, color: '#0369a1' },
  { label: 'Whisper-ID v3.4 ASR', start: 295, dur: 640, color: '#0e6b5e' },
  { label: 'IndoBERT PII NER', start: 935, dur: 115, color: '#b45309' },
  { label: 'SoX 1kHz Bleep Mask', start: 1050, dur: 88, color: '#be123c' },
  { label: '.NET Rubric Scorer', start: 1138, dur: 192, color: '#047857' },
  { label: 'ClickHouse + Webhook', start: 1330, dur: 50, color: '#475569' },
];

// CALL-9021 Masked PII Segments
const CALL_9021_BLEEPS = [
  { id: 'BLK-01', range: '01:18.2 – 01:21.8', type: 'OTP 6-Digit SMS', speaker: 'CH-1 Nasabah', method: '1 kHz Tone', hash: 'sha256:8f4a..91c2' },
  { id: 'BLK-02', range: '02:04.5 – 02:08.9', type: 'Nama Ibu Kandung', speaker: 'CH-1 Nasabah', method: '1 kHz Tone', hash: 'sha256:3c7d..e40a' },
  { id: 'BLK-03', range: '03:31.0 – 03:34.6', type: 'CVV 3-Digit Kartu', speaker: 'CH-1 Nasabah', method: 'Hard Mute+Tone', hash: 'sha256:b19e..55f8' },
];

// OJK & UU PDP Guardrail Rules (P4 Table — 10 rules)
const GUARDRAIL_RULES = [
  { id: 'OJK-01', name: 'Hak Cooling-Off Polis 14 Hari Kerja', clause: 'POJK 22/2023 Ps. 31', scope: 'Bancassurance', action: 'CRITICAL_FLAG', hits: 15, f1: '98,4%', tone: 'bad' },
  { id: 'OJK-02', name: 'Info SLA Sanggah QRIS / Kartu 14 HK', clause: 'POJK 22/2023 Ps. 42', scope: 'Kartu & QRIS', action: 'COACHING_5M', hits: 14, f1: '97,8%', tone: 'warn' },
  { id: 'OJK-03', name: 'Pemberitahuan Rekaman di 30 Detik Awal', clause: 'POJK 22/2023 Ps. 19', scope: 'Semua Kanal', action: 'SCORE_DEDUCT', hits: 9, f1: '99,2%', tone: 'ok' },
  { id: 'OJK-04', name: 'Larangan Mis-selling Unit-Link = Tabungan', clause: 'SEOJK 5/2022', scope: 'Bancassurance', action: 'CRITICAL_FLAG', hits: 6, f1: '96,9%', tone: 'bad' },
  { id: 'OJK-05', name: 'Transparansi Biaya Admin & Bunga Cicilan', clause: 'POJK 22/2023 Ps. 24', scope: 'KPR & Kartu', action: 'COACHING_5M', hits: 7, f1: '97,1%', tone: 'warn' },
  { id: 'PDP-01', name: 'Deteksi & Bleep 1kHz Kode OTP 6-Digit', clause: 'POJK 11/2022 · PCI', scope: 'Semua Kanal', action: 'AUTO_BLEEP', hits: 164, f1: '99,6%', tone: 'ok' },
  { id: 'PDP-02', name: 'Sensor Verbal Nama Ibu Kandung (KYC)', clause: 'UU PDP Ps. 4(2)', scope: 'Semua Kanal', action: 'AUTO_BLEEP', hits: 112, f1: '98,9%', tone: 'ok' },
  { id: 'PDP-03', name: 'Sensor Keras CVV/CVC 3-Digit Kartu', clause: 'PCI-DSS v4.0 3.2', scope: 'Kartu & QRIS', action: 'AUTO_BLEEP', hits: 78, f1: '99,4%', tone: 'ok' },
  { id: 'PDP-04', name: 'Tokenisasi NIK 16-Digit & No. Rekening', clause: 'UU PDP Ps. 4(2)', scope: 'Semua Kanal', action: 'AUTO_BLEEP', hits: 64, f1: '99,1%', tone: 'ok' },
  { id: 'ESC-01', name: 'Deteksi Eskalasi Emosi / Nada Tinggi >15d', clause: 'SLA Internal CC', scope: 'Semua Kanal', action: 'COACHING_5M', hits: 19, f1: '95,7%', tone: 'warn' },
];

// Coaching Queue Summary (P5) — active(6) + scheduled(6) + completed(7) = 19 cases
const COACHING_COUNTS = { active: 6, scheduled: 6, completed: 7 };
const SUPERVISOR_LOAD = [
  { name: 'D. Kusuma', total: 5, active: 2, avgSla: '02m 34d' },
  { name: 'R. Hidayat', total: 5, active: 2, avgSla: '02m 49d' },
  { name: 'S. Wulandari', total: 5, active: 2, avgSla: '02m 56d' },
  { name: 'A. Pratiwi', total: 4, active: 0, avgSla: '02m 52d' },
];

const COACHING_CASES = [
  { call: 'CALL-9019', agent: 'Agen Dewi', team: 'Banca-JKT-2', reason: 'Melewatkan hak cooling-off OJK 14 HK', score: 42, wait: '01m 42d', slaOk: true, spv: 'D. Kusuma', state: 'Aktif', tone: 'bad' },
  { call: 'CALL-9024', agent: 'Agen Dimas', team: 'Banca-JKT-1', reason: 'Mis-selling premi unit-link vs tabungan', score: 47, wait: '02m 15d', slaOk: true, spv: 'R. Hidayat', state: 'Aktif', tone: 'bad' },
  { call: 'CALL-9017', agent: 'Agen Rahmat', team: 'QRIS-BDG-3', reason: 'Eskalasi emosi + tanpa transfer supervisor', score: 54, wait: '02m 44d', slaOk: true, spv: 'S. Wulandari', state: 'Aktif', tone: 'bad' },
  { call: 'CALL-9015', agent: 'Agen Bima', team: 'QRIS-JKT-1', reason: 'Tidak menyebut SLA sanggah 14 hari kerja', score: 68, wait: '03m 08d', slaOk: true, spv: 'D. Kusuma', state: 'Aktif', tone: 'warn' },
  { call: 'CALL-9010', agent: 'Agen Bagas', team: 'Banca-BDG-2', reason: 'Tempo baca disclaimer OJK >210 kata/mnt', score: 66, wait: '03m 29d', slaOk: true, spv: 'R. Hidayat', state: 'Aktif', tone: 'warn' },
  { call: 'CALL-9004', agent: 'Agen Kevin', team: 'Banca-JKT-2', reason: 'Verifikasi KYC hanya 1 faktor (kurang DOB)', score: 59, wait: '04m 06d', slaOk: true, spv: 'S. Wulandari', state: 'Aktif', tone: 'warn' },
  { call: 'CALL-9022', agent: 'Agen Hendra', team: 'CC-JKT-4', reason: 'Biaya konversi cicilan tidak dijelaskan', score: 71, wait: '01m 55d', slaOk: true, spv: 'A. Pratiwi', state: 'Dijadwalkan', tone: 'info' },
  { call: 'CALL-9016', agent: 'Agen Putu', team: 'Klaim-BDG-1', reason: 'Kurang jelas jelaskan nilai tunai polis', score: 74, wait: '02m 31d', slaOk: true, spv: 'A. Pratiwi', state: 'Dijadwalkan', tone: 'info' },
  { call: 'CALL-8998', agent: 'Agen Taufik', team: 'KPR-JKT-2', reason: 'Bunga floating KPR pasca-fix tidak disebut', score: 63, wait: '02m 58d', slaOk: true, spv: 'D. Kusuma', state: 'Dijadwalkan', tone: 'info' },
  { call: 'CALL-8991', agent: 'Agen Lestari', team: 'BI-FAST-1', reason: 'Salah sebut estimasi refund BI-FAST', score: 69, wait: '03m 12d', slaOk: true, spv: 'R. Hidayat', state: 'Dijadwalkan', tone: 'info' },
  { call: 'CALL-8985', agent: 'Agen Gilang', team: 'CC-BDG-2', reason: 'Tidak konfirmasi alamat kirim kartu baru', score: 72, wait: '03m 45d', slaOk: true, spv: 'S. Wulandari', state: 'Dijadwalkan', tone: 'info' },
  { call: 'CALL-8979', agent: 'Agen Nadia', team: 'Wealth-JKT', reason: 'Profil risiko obligasi tidak dibacakan ulang', score: 70, wait: '04m 19d', slaOk: true, spv: 'D. Kusuma', state: 'Dijadwalkan', tone: 'info' },
];

const WORM_LOGS = [
  { ts: '10:19:04', actor: 'suaracs-bleeper-02', action: 'WORM_SEAL_WAV', call: 'CALL-9021', note: '3 segmen PII disensor · raw PCM dihapus 18d', hash: '8f4a..91c2', tone: 'ok' },
  { ts: '10:18:59', actor: 'ojk-rubric-worker', action: 'ESCALATE_COACH', call: 'CALL-9019', note: 'POJK 22/2023 Ps. 31 gagal · tiket CO-4412', hash: '2b7c..0e19', tone: 'bad' },
  { ts: '10:14:22', actor: 'd.kusuma@bnm.co.id', action: 'UNMASK_DENIED', call: 'CALL-9021', note: 'Akses audio asli ditolak (butuh approval DPO)', hash: '9e11..44a0', tone: 'warn' },
  { ts: '10:02:11', actor: 'dpo-audit-bot', action: 'RETENTION_VERIFY', call: 'BATCH-10H', note: '1.420 objek WORM terverifikasi · retensi 5 thn', hash: '6d5f..c318', tone: 'ok' },
  { ts: '09:45:00', actor: 'clickhouse-sync', action: 'EXPORT_OJK_PKG', call: 'RPT-20261122', note: 'Ringkasan kepatuhan shift pagi terkirim ke GRC', hash: '4a90..77b1', tone: 'info' },
];

// ============================================================================
// MATHEMATICAL CONSISTENCY VERIFICATION (THROWS ON ANY MISMATCH)
// ============================================================================
export function verifyMath() {
  const sumQueueCalls = SERVICE_QUEUES.reduce((a, q) => a + q.calls, 0);
  const sumOjkPass = SERVICE_QUEUES.reduce((a, q) => a + q.ojkPass, 0);
  const sumViolations = SERVICE_QUEUES.reduce((a, q) => a + q.violations, 0);
  const sumEscalations = SERVICE_QUEUES.reduce((a, q) => a + q.escalations, 0);
  const sumQueuePii = SERVICE_QUEUES.reduce((a, q) => a + q.piiSegments, 0);
  const sumCost = SERVICE_QUEUES.reduce((a, q) => a + q.costIdr, 0);
  const sumCostParts = SERVICE_QUEUES.reduce(
    (a, q) => a + q.costGpu + q.costNer + q.costScorer + q.costStorage,
    0
  );
  const sumDialectCalls = DIALECT_COHORTS.reduce((a, d) => a + d.calls, 0);
  const sumHourlyCalls = HOURLY_VOLUME.reduce((a, v) => a + v, 0);
  const sumPiiCat = PII_CATEGORIES.reduce((a, p) => a + p.count, 0);
  const sumOjkRuleHits = GUARDRAIL_RULES.filter((r) => r.id.startsWith('OJK-')).reduce((a, r) => a + r.hits, 0);
  const sumPdpRuleHits = GUARDRAIL_RULES.filter((r) => r.id.startsWith('PDP-')).reduce((a, r) => a + r.hits, 0);
  const sumCoaching = COACHING_COUNTS.active + COACHING_COUNTS.scheduled + COACHING_COUNTS.completed;
  const sumSupervisorLoad = SUPERVISOR_LOAD.reduce((a, s) => a + s.total, 0);
  const sumSupervisorActive = SUPERVISOR_LOAD.reduce((a, s) => a + s.active, 0);
  const score9019 = CALL_9019_RUBRIC.reduce((a, r) => a + r.score, 0);
  const max9019 = CALL_9019_RUBRIC.reduce((a, r) => a + r.max, 0);
  const score9021 = CALL_9021_RUBRIC.reduce((a, r) => a + r.score, 0);
  const max9021 = CALL_9021_RUBRIC.reduce((a, r) => a + r.max, 0);
  const spanTotal = CALL_9021_SPANS.reduce((a, s) => a + s.dur, 0);

  if (sumQueueCalls !== SHIFT_INFO.totalAudited) throw new Error(`sumQueueCalls=${sumQueueCalls}`);
  if (sumDialectCalls !== SHIFT_INFO.totalAudited) throw new Error(`sumDialectCalls=${sumDialectCalls}`);
  if (sumHourlyCalls !== SHIFT_INFO.totalAudited) throw new Error(`sumHourlyCalls=${sumHourlyCalls}`);
  if (sumOjkPass + sumViolations !== SHIFT_INFO.totalAudited) {
    throw new Error(`ojkPass+violations=${sumOjkPass + sumViolations}`);
  }
  if (Number(((sumOjkPass / SHIFT_INFO.totalAudited) * 100).toFixed(1)) !== 96.4) {
    throw new Error(`OJK pct mismatch: ${(sumOjkPass / SHIFT_INFO.totalAudited) * 100}`);
  }
  if (sumEscalations !== 19) throw new Error(`sumEscalations=${sumEscalations}`);
  if (sumCoaching !== sumEscalations) throw new Error(`sumCoaching=${sumCoaching} vs ${sumEscalations}`);
  if (sumSupervisorLoad !== sumEscalations || sumSupervisorActive !== COACHING_COUNTS.active) {
    throw new Error(`supervisorLoad=${sumSupervisorLoad}/${sumSupervisorActive}`);
  }
  if (sumQueuePii !== 418 || sumPiiCat !== 418 || sumPdpRuleHits !== 418) {
    throw new Error(`PII mismatch: queue=${sumQueuePii}, cat=${sumPiiCat}, rules=${sumPdpRuleHits}`);
  }
  if (sumOjkRuleHits !== sumViolations) {
    throw new Error(`OJK rule hits=${sumOjkRuleHits} vs violations=${sumViolations}`);
  }
  if (sumCost !== 2840000 || sumCostParts !== sumCost) {
    throw new Error(`Cost mismatch: sumCost=${sumCost}, parts=${sumCostParts}`);
  }
  if (score9019 !== 42 || max9019 !== 100) throw new Error(`CALL-9019 rubric=${score9019}/${max9019}`);
  if (score9021 !== 91 || max9021 !== 100) throw new Error(`CALL-9021 rubric=${score9021}/${max9021}`);
  if (spanTotal !== 1380) throw new Error(`CALL-9021 spanTotal=${spanTotal}`);
}

const TOTAL_CALLS = SERVICE_QUEUES.reduce((a, q) => a + q.calls, 0);
const TOTAL_OJK_PASS = SERVICE_QUEUES.reduce((a, q) => a + q.ojkPass, 0);
const TOTAL_VIOLATIONS = SERVICE_QUEUES.reduce((a, q) => a + q.violations, 0);
const TOTAL_ESCALATIONS = SERVICE_QUEUES.reduce((a, q) => a + q.escalations, 0);
const TOTAL_PII = PII_CATEGORIES.reduce((a, p) => a + p.count, 0);
const TOTAL_COST_IDR = SERVICE_QUEUES.reduce((a, q) => a + q.costIdr, 0);
const OJK_PCT = (TOTAL_OJK_PASS / TOTAL_CALLS) * 100;

// ============================================================================
// CUSTOM INLINE SVG ICONS (DOMAIN-SPECIFIC AUDIO / QA / COMPLIANCE)
// ============================================================================
function scIcon(name, size = 13, color = 'currentColor') {
  const paths = {
    waveform: '<line x1="3" y1="10" x2="3" y2="14"/><line x1="7" y1="6" x2="7" y2="18"/><line x1="11" y1="3" x2="11" y2="21"/><line x1="15" y1="7" x2="15" y2="17"/><line x1="19" y1="5" x2="19" y2="19"/><line x1="22" y1="10" x2="22" y2="14"/>',
    headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    micOff: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    phoneCall: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    volumeX: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  };
  if (paths[name]) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${paths[name]}</svg>`;
  }
  return ic(name, size, color);
}

// ============================================================================
// DISTINCT SUARACS QA SHELL (LIGHT MINERAL TOPBAR + HORIZONTAL TABS + 52PX RAIL)
// ============================================================================
const EXTRA_CSS = `
  :root {
    --s-accent: #0e6b5e;
    --s-accent-soft: #e6f4f1;
    --s-accent-ink: #08483f;
    --s-accent-bd: #9fd3c9;
    --s-bg: #f2f5f4;
    --s-surface: #ffffff;
    --s-surface-2: #f7faf9;
    --s-border: #d4dedb;
    --s-border-strong: #b8c7c2;
  }

  .s-shell {
    width: 1600px;
    height: 1000px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--s-bg);
  }

  /* Row 1: Crisp Light Mineral Utility Bar with 3px Pine-Teal Identity Stripe */
  .s-utilbar {
    height: 38px;
    background: #ffffff;
    border-top: 3px solid var(--s-accent);
    border-bottom: 1px solid var(--s-border);
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .s-util-left, .s-util-right {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .s-logo {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 13px;
    color: #0b2420;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }
  .s-logo-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: var(--s-accent);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .s-shift-tag {
    background: var(--s-accent-soft);
    color: var(--s-accent-ink);
    border: 1px solid var(--s-accent-bd);
    padding: 2px 7px;
    border-radius: 3px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    white-space: nowrap;
  }
  .s-tenant-pill {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f7faf9;
    border: 1px solid var(--s-border);
    color: #1e293b;
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .s-search {
    height: 24px;
    width: 280px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f7faf9;
    border: 1px solid var(--s-border-strong);
    color: #64748b;
    font-size: 10.3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .s-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid var(--s-border-strong);
    color: #475569;
  }
  .s-live-chip {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-family: var(--e-mono);
    font-size: 9.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .s-operator {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-left: 9px;
    border-left: 1px solid var(--s-border);
    white-space: nowrap;
  }
  .s-op-badge {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #0b2420;
    color: #e6f4f1;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Row 2: Horizontal Module Tab Bar */
  .s-tabbar {
    height: 34px;
    background: #f7faf9;
    border-bottom: 1px solid var(--s-border-strong);
    padding: 0 14px 0 0;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .s-tabs-left {
    display: flex;
    align-items: stretch;
    gap: 0;
    padding-left: 52px;
  }
  .s-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 13px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    border-right: 1px solid #e2eae7;
    white-space: nowrap;
  }
  .s-tab.is-active {
    background: #ffffff;
    color: var(--s-accent-ink);
    font-weight: 700;
    box-shadow: inset 0 -2.5px 0 var(--s-accent);
  }
  .s-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #e6eeec;
    color: #334155;
  }
  .s-tab.is-active .s-tab-cnt {
    background: var(--s-accent);
    color: #ffffff;
  }
  .s-tab-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .s-tab-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Body: 52px Vertical Telemetry Rail + Main Content Workspace */
  .s-body {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }
  .s-rail {
    width: 52px;
    background: #ffffff;
    border-right: 1px solid var(--s-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 8px;
    flex-shrink: 0;
  }
  .s-rail-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }
  .s-rail-item {
    width: 34px;
    height: 34px;
    border-radius: 4px;
    border: 1px solid transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #475569;
    position: relative;
  }
  .s-rail-item.is-active {
    background: var(--s-accent-soft);
    border-color: var(--s-accent-bd);
    color: var(--s-accent-ink);
  }
  .s-rail-lbl {
    font-family: var(--e-mono);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .s-rail-dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    position: absolute;
    top: 3px;
    right: 3px;
  }

  .s-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  /* Accent Override for Chrome Primitives */
  .e-badge-accent {
    background: var(--s-accent-soft);
    color: var(--s-accent-ink);
    border-color: var(--s-accent-bd);
  }
  .e-panel {
    border-color: var(--s-border);
  }
  .e-panel-head {
    height: 30px;
    background: var(--s-surface-2);
    border-bottom-color: var(--s-border);
  }
  table.e-table th {
    background: #eef4f2;
    color: #334155;
    border-bottom-color: var(--s-border-strong);
  }
  table.e-table tbody tr.is-selected {
    background: var(--s-accent-soft) !important;
    box-shadow: inset 2.5px 0 0 var(--s-accent);
  }
  .e-statusbar {
    background: #e9f0ee;
    border-top-color: var(--s-border-strong);
    color: #2c413c;
  }

  /* Helper Grids & Compact Rows */
  .s-row {
    display: flex;
    gap: 8px;
    min-height: 0;
    min-width: 0;
  }
  .s-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    min-width: 0;
  }
  .s-kpi-card {
    background: #ffffff;
    border: 1px solid var(--s-border);
    border-radius: 4px;
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .s-kpi-card.is-accent {
    border-top: 2.5px solid var(--s-accent);
  }
  .s-kpi-card.is-warn {
    border-top: 2.5px solid #b45309;
  }
  .s-kpi-card.is-bad {
    border-top: 2.5px solid #be123c;
  }
  .s-kv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid #edf2f0;
    font-size: 10.6px;
    gap: 8px;
  }
  .s-kv:last-child {
    border-bottom: 0;
  }
  .s-kv-k {
    color: #475569;
  }
  .s-kv-v {
    font-weight: 600;
    color: #0f172a;
    text-align: right;
  }
  .s-pill-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: nowrap;
  }
  .s-filter-pill {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid var(--s-border-strong);
    background: #ffffff;
    color: #334155;
    font-size: 10px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .s-filter-pill.is-active {
    background: var(--s-accent);
    border-color: var(--s-accent);
    color: #ffffff;
  }
  .s-transcript-turn {
    padding: 5.5px 8px;
    border-bottom: 1px solid #e8efec;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 10.6px;
    line-height: 1.38;
  }
  .s-transcript-turn.is-masked {
    background: #fff8f8;
    border-left: 2.5px solid #be123c;
  }
  .s-transcript-turn.is-ojk {
    background: #f0faf7;
    border-left: 2.5px solid #0e6b5e;
  }
  .s-bleep-chip {
    display: inline-block;
    padding: 0 4px;
    border-radius: 2px;
    background: #be123c;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
  }
  .s-ojk-chip {
    display: inline-block;
    padding: 0 4px;
    border-radius: 2px;
    background: #0e6b5e;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 9.2px;
    font-weight: 700;
  }
  .s-score-bar {
    height: 5px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
    flex: 1;
  }
`;

const TABS = [
  { id: 'p1', label: 'Pusat Kendali', icon: 'activity', cnt: null },
  { id: 'p2', label: 'Antrean Audit', icon: 'phoneCall', cnt: fmtNum(TOTAL_CALLS) },
  { id: 'p3', label: 'Studio Forensik Audio', icon: 'waveform', cnt: 'CALL-9021' },
  { id: 'p4', label: 'Pipeline & Guardrail OJK', icon: 'gitBranch', cnt: '10 Aturan' },
  { id: 'p5', label: 'Coaching & WORM PDP', icon: 'shieldCheck', cnt: `${TOTAL_ESCALATIONS} Eskalasi`, warn: true },
];

function renderShell({ activeTab, primaryAction, secondaryAction, contentHtml, railActive = 'asr' }) {
  const railNodes = [
    { id: 'sip', lbl: 'SIP', icon: 'phoneCall', dot: '#10b981' },
    { id: 'mq', lbl: 'MQ', icon: 'layers', dot: '#10b981' },
    { id: 'asr', lbl: 'ASR', icon: 'waveform', dot: '#10b981' },
    { id: 'pii', lbl: 'PII', icon: 'micOff', dot: '#0e6b5e' },
    { id: 'ojk', lbl: 'OJK', icon: 'shieldCheck', dot: '#f59e0b' },
    { id: 'ch', lbl: 'CH', icon: 'database', dot: '#10b981' },
  ];

  return wrapEnterpriseHtml({
    title: `SuaraCS QA · ${TABS.find((t) => t.id === activeTab)?.label || ''}`,
    accent: '#0e6b5e',
    accentSoft: '#e6f4f1',
    accentInk: '#08483f',
    bg: '#f2f5f4',
    surface: '#ffffff',
    surface2: '#f7faf9',
    border: '#d4dedb',
    borderStrong: '#b8c7c2',
    extraCss: EXTRA_CSS,
    bodyHtml: `<div class="s-shell">
      <header class="s-utilbar">
        <div class="s-util-left">
          <div class="s-logo">
            <span class="s-logo-mark">${scIcon('waveform', 13, '#ffffff')}</span>
            <span>SuaraCS QA</span>
          </div>
          <span class="s-shift-tag">${SHIFT_INFO.code} · ${fmtNum(TOTAL_CALLS)} PANGGILAN DINILAI</span>
          <div class="s-tenant-pill">
            ${scIcon('headset', 12, '#0e6b5e')}
            <span>${esc(SHIFT_INFO.tenant)}</span>
            ${ic('chevronDown', 11, '#64748b')}
          </div>
          <div class="s-search">
            <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
              ${ic('search', 11, '#64748b')}
              <span class="trunc">Cari CALL-ID, agen, klausul POJK, atau token PII...</span>
            </span>
            <span class="s-kbd">Ctrl+K</span>
          </div>
        </div>
        <div class="s-util-right">
          <div class="s-tenant-pill mono" style="font-size:9.8px;">
            ${ic('clock', 11, '#475569')}
            <span>${SHIFT_INFO.date} · ${SHIFT_INFO.window}</span>
          </div>
          <div class="s-live-chip">
            <span class="dot dot-ok"></span>
            <span>${SHIFT_INFO.modelVersion} · 4x A100 OK</span>
          </div>
          <div class="s-operator">
            <span class="s-op-badge">DK</span>
            <div style="line-height:1.15;">
              <div style="font-size:10.5px;font-weight:700;color:#0f172a;">D. Kusuma</div>
              <div style="font-size:9px;color:#64748b;">Lead QA Supervisor</div>
            </div>
          </div>
        </div>
      </header>

      <nav class="s-tabbar">
        <div class="s-tabs-left">
          ${TABS.map((t) => {
            const active = t.id === activeTab;
            return `<div class="s-tab ${active ? 'is-active' : ''}">
              ${scIcon(t.icon, 12, active ? '#0e6b5e' : '#64748b')}
              <span>${esc(t.label)}</span>
              ${t.cnt ? `<span class="s-tab-cnt ${t.warn && !active ? 'warn' : ''}">${esc(t.cnt)}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
        <div class="s-tab-actions">
          ${secondaryAction ? `<span class="e-btn">${scIcon(secondaryAction.icon, 11, '#0e6b5e')} ${esc(secondaryAction.label)}</span>` : ''}
          ${primaryAction ? `<span class="e-btn e-btn-primary">${scIcon(primaryAction.icon, 11, '#ffffff')} ${esc(primaryAction.label)}</span>` : ''}
        </div>
      </nav>

      <div class="s-body">
        <aside class="s-rail">
          <div class="s-rail-group">
            ${railNodes
              .map(
                (n) => `<div class="s-rail-item ${n.id === railActive ? 'is-active' : ''}">
                  <span class="s-rail-dot" style="background:${n.dot};"></span>
                  ${scIcon(n.icon, 13, n.id === railActive ? '#08483f' : '#64748b')}
                  <span class="s-rail-lbl">${n.lbl}</span>
                </div>`
              )
              .join('')}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:8px;border-top:1px solid #e2eae7;width:36px;">
            <span class="mono" style="font-size:8.5px;font-weight:700;color:#0e6b5e;">100%</span>
            <span style="font-size:7.5px;color:#64748b;text-align:center;line-height:1.1;">AUDIT<br/>SHIFT</span>
          </div>
        </aside>

        <main class="s-main">${contentHtml}</main>
      </div>

      <footer class="e-statusbar">
        <div class="e-status-group">
          <span class="e-status-item"><span class="dot dot-ok"></span>SIPREC Genesys/Avaya: 128 kanal aktif</span>
          <span class="e-status-item">RabbitMQ q.audio.ingest: 4 antre (p95 1,38 dtk)</span>
          <span class="e-status-item">ClickHouse: ${fmtNum(TOTAL_CALLS)} panggilan terindeks</span>
          <span class="e-status-item">PII Bleep: ${fmtNum(TOTAL_PII)} segmen · 0 bocor</span>
        </div>
        <div class="e-status-group">
          <span class="e-status-item">Sovereign AI · DCI Jakarta JK5</span>
          <span class="e-status-item">POJK 22/2023 · UU PDP · WORM SHA-256</span>
        </div>
      </footer>
    </div>`,
  });
}

// ============================================================================
// PAGE 1: PUSAT KENDALI AUDIT & TELEMETRI ASR DIALEK
// ============================================================================
function renderPage1() {
  const kpis = [
    {
      label: 'Cakupan Audit Panggilan',
      val: '100,0%',
      sub: `${fmtNum(TOTAL_CALLS)} / ${fmtNum(SHIFT_INFO.totalIncoming)} rekaman`,
      tag: badge('vs <2% manual', 'accent'),
      spark: [99.8, 100, 100, 100, 100, 100, 100, 100],
      color: '#0e6b5e',
      cls: 'is-accent',
    },
    {
      label: 'Kepatuhan Disclaimer OJK',
      val: fmtPct(OJK_PCT, 1),
      sub: `${fmtNum(TOTAL_OJK_PASS)} lulus · ${TOTAL_VIOLATIONS} pelanggaran`,
      tag: badge('SLA ≥ 95,0%', 'ok'),
      spark: HOURLY_OJK_PCT,
      color: '#047857',
      cls: 'is-accent',
    },
    {
      label: 'Antrean Risiko Eskalasi',
      val: `${TOTAL_ESCALATIONS} kasus`,
      sub: 'Rerata respons coaching 02m 48d',
      tag: badge('SLA < 5 mnt', 'warn'),
      spark: [1, 2, 3, 5, 3, 2, 2, 1],
      color: '#b45309',
      cls: 'is-warn',
    },
    {
      label: 'Segmen PII Audio Disensor',
      val: `${fmtNum(TOTAL_PII)} segmen`,
      sub: `Di ${SHIFT_INFO.uniquePiiCalls} panggilan · 0 lolos`,
      tag: badge('Tone 1 kHz OK', 'ok'),
      spark: [34, 48, 62, 74, 58, 51, 49, 42],
      color: '#0369a1',
      cls: 'is-accent',
    },
    {
      label: 'Biaya Komputasi AI (Shift)',
      val: fmtIdr(TOTAL_COST_IDR),
      sub: 'Rp 2.000 / panggilan · On-Prem GPU',
      tag: badge('-68% vs Cloud', 'accent'),
      spark: [236, 328, 424, 476, 412, 348, 336, 280],
      color: '#0e6b5e',
      cls: 'is-accent',
    },
  ];

  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    ${kpis
      .map(
        (k) => `<div class="s-kpi-card ${k.cls}">
          <div class="e-kpi-top">
            <span class="trunc">${esc(k.label)}</span>
            ${k.tag}
          </div>
          <div class="e-kpi-mid">
            <span class="e-kpi-val">${esc(k.val)}</span>
            ${svgSparkline({ points: k.spark, width: 70, height: 22, color: k.color })}
          </div>
          <div class="e-kpi-foot">
            <span class="trunc">${esc(k.sub)}</span>
          </div>
        </div>`
      )
      .join('')}
  </div>`;

  // Main Compliance + Sentiment Trend Chart
  const trendSvg = svgMultiLineChart({
    width: 890,
    height: 214,
    xLabels: HOURLY_LABELS,
    yMin: 70,
    yMax: 105,
    yTicks: 4,
    yFormat: (v) => `${Math.round(v)}%`,
    threshold: { value: 95, label: 'SLA OJK 95%', color: '#be123c' },
    series: [
      { label: 'Kepatuhan Disclaimer OJK (%)', values: HOURLY_OJK_PCT, color: '#0e6b5e', area: true, dots: true, width: 2.2 },
      { label: 'Sentimen Nasabah Positif/Netral (%)', values: HOURLY_SENTIMENT_POS, color: '#0369a1', dashed: true, dots: true, width: 1.7 },
    ],
    annotations: [
      { index: 3, seriesIdx: 0, label: '10:00 WIB · Lonjakan pelanggaran cooling-off Bancassurance (93,8%)', color: '#b45309', dy: 22 },
    ],
  });

  // Hourly Volume Mini Bar Strip SVG
  const volSvg = svgStackedBarChart({
    width: 890,
    height: 102,
    categories: HOURLY_LABELS,
    yMax: 260,
    yFormat: (v) => `${Math.round(v)}`,
    series: [
      { label: 'Lulus OJK', values: [116, 160, 205, 223, 197, 169, 162, 137], color: '#0e6b5e' },
      { label: 'Pelanggaran / Coaching', values: [2, 4, 7, 15, 9, 5, 6, 3], color: '#be123c' },
    ],
  });

  // Mini Pipeline Status Strip for Right Top
  const stages = [
    { name: 'SIPREC Ingest', val: '128 ch', sub: 'G.711 / Opus', tone: 'ok' },
    { name: 'RabbitMQ Bus', val: '4 antre', sub: '0 DLQ', tone: 'ok' },
    { name: 'Whisper-ID GPU', val: '64% util', sub: '4x A100-40G', tone: 'ok' },
    { name: 'PII Bleeper', val: '418 mask', sub: '0 bocor', tone: 'ok' },
    { name: 'ClickHouse', val: '18 ms p95', sub: '1.420 baris', tone: 'ok' },
  ];

  const html = `
    ${kpiStrip}
    <div class="s-row" style="flex:1;">
      <!-- LEFT COLUMN (60%) -->
      <div class="s-col" style="flex:0 0 59.5%;">
        <section class="e-panel" style="flex:0 0 368px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('activity', 13, '#0e6b5e')}
              <span>Tren Kepatuhan OJK, Sentimen & Volume Audit per Jam (Shift Pagi)</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('Total 1.420 panggilan', 'neutral')}
              ${badge('Anomali 10:00 WIB', 'warn')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:4px;padding:6px 10px;">
            <div>${trendSvg}</div>
            <div style="border-top:1px solid #e6eeec;padding-top:3px;">${volSvg}</div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('waveform', 13, '#0e6b5e')}
              <span>Akurasi Model ASR Dialek Daerah & Campur-Kode (${SHIFT_INFO.modelVersion})</span>
            </div>
            <span class="e-panel-sub mono">Rerata WER 5,6% · Conf 0,93 · RTF 0,004x</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:11%;">Kode</th>
                  <th style="width:36%;">Kohort Dialek & Kanal Audio</th>
                  <th class="num" style="width:11%;">Panggilan</th>
                  <th class="num" style="width:9%;">WER</th>
                  <th class="num" style="width:10%;">Conf ASR</th>
                  <th class="num" style="width:11%;">Akurasi OJK</th>
                  <th style="width:12%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${DIALECT_COHORTS.map(
                  (d) => `<tr style="height:38px;">
                    <td class="mono" style="font-weight:700;color:#08483f;">${d.code}</td>
                    <td style="font-weight:500;">${esc(d.label)}</td>
                    <td class="num mono">${fmtNum(d.calls)}</td>
                    <td class="num mono" style="color:${d.wer >= 7.5 ? '#b45309' : '#0f172a'};font-weight:600;">${fmtPct(d.wer, 1)}</td>
                    <td class="num mono">${d.conf.toFixed(2).replace('.', ',')}</td>
                    <td class="num mono" style="font-weight:600;">${fmtPct(d.ojkAcc, 1)}</td>
                    <td>${badge(d.status, d.tone)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total Kohort Terverifikasi (100% Cakupan)</td>
                  <td class="num mono">${fmtNum(TOTAL_CALLS)}</td>
                  <td class="num mono">5,6%</td>
                  <td class="num mono">0,93</td>
                  <td class="num mono">96,4%</td>
                  <td>${badge('Sovereign OK', 'ok')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;background:#f7faf9;border-top:1px solid #d4dedb;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#334155;">
              <span>Korpus Fine-Tune: <strong>4.200 jam perbankan ID · Jawa · Sunda · Istilah BI-FAST/QRIS/OJK</strong></span>
              <span class="mono" style="color:#08483f;font-weight:700;">Drift Mingguan: 0,12%</span>
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT COLUMN (40.5%) -->
      <div class="s-col" style="flex:1;">
        <section class="e-panel" style="flex:0 0 116px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('cpu', 13, '#0e6b5e')}
              <span>Kesehatan Pipeline Ingest & Inferensi Sovereign</span>
            </div>
            ${badge('End-to-End p95: 1,38 dtk', 'ok')}
          </div>
          <div class="e-panel-body" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:8px 10px;">
            ${stages
              .map(
                (st) => `<div style="border:1px solid #d4dedb;border-radius:3px;padding:6px 7px;background:#f9fbfa;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                    <span style="font-size:9.5px;font-weight:700;color:#334155;" class="trunc">${esc(st.name)}</span>
                    <span class="dot dot-ok"></span>
                  </div>
                  <div class="mono" style="font-size:12.5px;font-weight:700;color:#08483f;margin-top:3px;">${esc(st.val)}</div>
                  <div class="mono" style="font-size:9px;color:#64748b;">${esc(st.sub)}</div>
                </div>`
              )
              .join('')}
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 284px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('headset', 13, '#0e6b5e')}
              <span>Distribusi Audit & Risiko OJK per Unit Layanan</span>
            </div>
            <span class="e-panel-sub">6 Antrean PBX</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:38%;">Antrean Layanan</th>
                  <th class="num" style="width:12%;">Call</th>
                  <th class="num" style="width:14%;">OJK %</th>
                  <th class="num" style="width:12%;">Pelang.</th>
                  <th class="num" style="width:12%;">Eskal.</th>
                  <th class="num" style="width:12%;">Skor</th>
                </tr>
              </thead>
              <tbody>
                ${SERVICE_QUEUES.map((q) => {
                  const pct = (q.ojkPass / q.calls) * 100;
                  return `<tr class="${q.tone === 'bad' ? 'is-bad' : q.tone === 'warn' ? 'is-warn' : ''}">
                    <td style="font-weight:600;">${esc(q.name)}</td>
                    <td class="num mono">${fmtNum(q.calls)}</td>
                    <td class="num mono" style="font-weight:700;color:${pct < 95 ? '#be123c' : '#047857'};">${fmtPct(pct, 1)}</td>
                    <td class="num mono">${q.violations}</td>
                    <td class="num mono" style="font-weight:700;color:${q.escalations >= 5 ? '#be123c' : '#334155'};">${q.escalations}</td>
                    <td class="num mono">${q.avgScore.toFixed(1).replace('.', ',')}</td>
                  </tr>`;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total Shift Pagi</td>
                  <td class="num mono">${fmtNum(TOTAL_CALLS)}</td>
                  <td class="num mono">${fmtPct(OJK_PCT, 1)}</td>
                  <td class="num mono">${TOTAL_VIOLATIONS}</td>
                  <td class="num mono">${TOTAL_ESCALATIONS}</td>
                  <td class="num mono">88,6</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('alert', 13, '#be123c')}
              <span>Sorotan Panggilan Kritis & Verifikasi Terbaru</span>
            </div>
            ${badge('4 Kasus Prioritas', 'neutral')}
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:5px;">
            ${[
              { code: 'CALL-9019', title: 'Penawaran Bancassurance — Agen Dewi', desc: 'Tidak membacakan hak cooling-off OJK 14 hari kerja', val: '42/100', st: 'Pelanggaran', tone: 'bad' },
              { code: 'CALL-9015', title: 'Sanggah Transaksi QRIS — Agen Bima', desc: 'Melewatkan info SLA penyelesaian sengketa 14 hari', val: '68/100', st: 'Coaching', tone: 'warn' },
              { code: 'CALL-9021', title: 'Reset Mobile Token — Agen Fajar', desc: 'Nasabah sebut OTP, Ibu Kandung & CVV; otomatis disensor 1kHz', val: '91/100', st: 'Disensor', tone: 'ok' },
              { code: 'CALL-9012', title: 'Klaim Rawat Inap — Agen Rina', desc: 'Campur-kode ID/Jawa · 06m 14d · disclaimer lengkap', val: '94/100', st: 'Lulus', tone: 'ok' },
            ]
              .map(
                (item) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border:1px solid ${item.tone === 'bad' ? '#fecdd3' : item.tone === 'warn' ? '#fde68a' : '#dce6e3'};border-radius:3px;background:${item.tone === 'bad' ? '#fff5f6' : item.tone === 'warn' ? '#fffdf5' : '#fbfdfc'};">
                  <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span class="mono" style="font-size:10px;font-weight:700;color:#08483f;">${item.code}</span>
                      <span style="font-size:10.8px;font-weight:700;color:#0f172a;" class="trunc">${esc(item.title)}</span>
                    </div>
                    <div style="font-size:9.8px;color:#475569;margin-top:1px;" class="trunc">${esc(item.desc)}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                    <span class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">${item.val}</span>
                    ${badge(item.st, item.tone)}
                  </div>
                </div>`
              )
              .join('')}
            <div style="background:#0b2420;color:#d1fae5;border-radius:3px;padding:6px 9px;font-family:var(--e-mono);font-size:9px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
              <span>[02:14] "Hak masa mempelajari polis 14 hari kerja." -&gt; OJK_COOLING_OFF_CHECK: PASS</span>
              <span style="color:#6ee7b7;font-weight:700;flex-shrink:0;">conf 0.97</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p1',
    railActive: 'asr',
    secondaryAction: { icon: 'micOff', label: 'Sensor Segmen PII' },
    primaryAction: { icon: 'play', label: 'Nilai Batch Berikutnya' },
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 2: ANTREAN AUDIT PANGGILAN (16-ROW GRID) & INSPEKTOR CEPAT
// ============================================================================
function renderPage2() {
  const sampleAvgScore = (CALL_LOGS.reduce((a, c) => a + c.score, 0) / CALL_LOGS.length).toFixed(1).replace('.', ',');
  const samplePiiTotal = CALL_LOGS.reduce((a, c) => a + c.pii, 0);

  // Mini sentiment trajectory for CALL-9019 (escalating frustration)
  const sentSvg = svgMultiLineChart({
    width: 490,
    height: 122,
    xLabels: ['00:00', '01:30', '03:00', '04:30', '06:00', '07:28'],
    yMin: -100,
    yMax: 100,
    yTicks: 4,
    yFormat: (v) => (v > 0 ? `+${v}` : `${v}`),
    threshold: { value: -40, label: 'Eskalasi -40', color: '#be123c' },
    series: [
      { label: 'Sentimen Nasabah', values: [22, 14, -18, -56, -74, -68], color: '#be123c', area: true, dots: true, width: 2 },
      { label: 'Ketenangan Agen', values: [64, 52, 28, 12, -8, 6], color: '#0e6b5e', dashed: true, dots: true, width: 1.6 },
    ],
  });

  const html = `
    <!-- Filter & Batch Action Bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:#ffffff;border:1px solid #d4dedb;border-radius:4px;padding:6px 10px;flex-shrink:0;">
      <div class="s-pill-bar">
        <span class="s-filter-pill is-active">Semua Panggilan <span class="mono">1.420</span></span>
        <span class="s-filter-pill">Pelanggaran OJK <span class="mono" style="color:#be123c;">51</span></span>
        <span class="s-filter-pill">Risiko Eskalasi <span class="mono" style="color:#b45309;">19</span></span>
        <span class="s-filter-pill">Disensor PII <span class="mono" style="color:#0e6b5e;">312</span></span>
        <span class="s-filter-pill">Campur-Kode Dialek <span class="mono">866</span></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:10.3px;color:#475569;">
        <span class="mono">Urut: Risiko Tertinggi</span>
        <span class="e-btn">${ic('filter', 11, '#475569')} Filter Unit PBX</span>
        <span class="e-btn">${ic('download', 11, '#475569')} Ekspor CSV ClickHouse</span>
      </div>
    </div>

    <div class="s-row" style="flex:1;">
      <!-- LEFT 16-ROW DENSE OPERATIONAL GRID (64%) -->
      <section class="e-panel" style="flex:0 0 64%;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${scIcon('phoneCall', 13, '#0e6b5e')}
            <span>Aliran Audit Pasca-Panggilan (16 Sampel Prioritas dari 1.420 Shift Pagi)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Dipilih: CALL-9019', 'bad')}
            <span class="e-panel-sub mono">Diperbarui 10:19:08 WIB</span>
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:10.5%;">Kode Call</th>
                <th style="width:8.5%;">WIB</th>
                <th style="width:23%;">Topik Layanan & Agen</th>
                <th style="width:12.5%;">Dialek ASR</th>
                <th class="num" style="width:8.5%;">Durasi</th>
                <th style="width:10%;">Sentimen</th>
                <th class="num" style="width:6.5%;">PII</th>
                <th class="num" style="width:8%;">Skor</th>
                <th style="width:12.5%;">Status QA</th>
              </tr>
            </thead>
            <tbody>
              ${CALL_LOGS.map((c) => {
                const rowCls = c.selected
                  ? 'is-selected'
                  : c.tone === 'bad'
                    ? 'is-bad'
                    : c.tone === 'warn'
                      ? 'is-warn'
                      : '';
                return `<tr class="${rowCls}" style="height:40px;">
                  <td class="mono" style="font-weight:700;color:#08483f;">${c.code}</td>
                  <td class="mono" style="color:#475569;">${c.time}</td>
                  <td>
                    <div style="font-weight:700;color:#0f172a;line-height:1.2;" class="trunc">${esc(c.topic)}</div>
                    <div style="font-size:9.6px;color:#475569;line-height:1.2;" class="trunc">${esc(c.agent)} · ${esc(c.unit)}</div>
                  </td>
                  <td style="font-size:10px;color:#334155;">${esc(c.dialect)}</td>
                  <td class="num mono">${c.dur}</td>
                  <td>${badge(c.sent, c.sentTone)}</td>
                  <td class="num mono" style="font-weight:${c.pii > 0 ? '700' : '400'};color:${c.pii > 0 ? '#0e6b5e' : '#94a3b8'};">${c.pii > 0 ? `${c.pii}x` : '—'}</td>
                  <td class="num mono" style="font-weight:700;color:${c.score < 60 ? '#be123c' : c.score < 80 ? '#b45309' : '#047857'};">${c.score}/100</td>
                  <td>${badge(c.status, c.tone)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Rekap 16 Baris Tampil · Total Shift: ${fmtNum(TOTAL_CALLS)} panggilan diaudit (100%)</td>
                <td class="num mono">05m 42d</td>
                <td></td>
                <td class="num mono">${samplePiiTotal}x</td>
                <td class="num mono">${sampleAvgScore}</td>
                <td>${badge('96,4% OJK', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- RIGHT QUICK INSPECTOR FOR CALL-9019 (36%) -->
      <div class="s-col" style="flex:1;">
        <section class="e-panel" style="flex:0 0 156px;">
          <div class="e-panel-head" style="background:#fff1f2;border-bottom-color:#fecdd3;">
            <div class="e-panel-title" style="color:#9f1239;">
              ${ic('alert', 13, '#be123c')}
              <span>Inspektor Cepat: CALL-9019 · Pelanggaran OJK</span>
            </div>
            <span class="mono" style="font-size:12px;font-weight:800;color:#be123c;">42 / 100</span>
          </div>
          <div class="e-panel-body" style="padding:7px 10px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:10.2px;">
              <div class="s-kv"><span class="s-kv-k">Agen / Tim</span><span class="s-kv-v">Agen Dewi · Banca-JKT-2</span></div>
              <div class="s-kv"><span class="s-kv-k">PBX / SIP ID</span><span class="s-kv-v mono">GEN-99412-08</span></div>
              <div class="s-kv"><span class="s-kv-k">Produk Dibahas</span><span class="s-kv-v">Bancassurance Proteksi+</span></div>
              <div class="s-kv"><span class="s-kv-k">ASR & Durasi</span><span class="s-kv-v mono">ID Baku · 07m 28d</span></div>
            </div>
            <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:6px 8px;font-size:10px;color:#881337;">
              <strong>Temuan Kritis POJK 22/2023 Ps. 31:</strong> Agen menyelesaikan persetujuan verbal polis pada menit <span class="mono">06:41</span> tanpa membacakan hak masa mempelajari polis (cooling-off) 14 hari kerja dan membandingkan imbal hasil dengan deposito.
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 164px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('activity', 13, '#be123c')}
              <span>Kurva Sentimen & Eskalasi Emosi (CALL-9019)</span>
            </div>
            ${badge('Puncak -74 @ 06:00', 'bad')}
          </div>
          <div class="e-panel-body" style="padding:5px 8px;">
            ${sentSvg}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('shieldCheck', 13, '#0e6b5e')}
              <span>Rincian Penilaian Rubrik OJK (6 Butir · Total 42/100)</span>
            </div>
            <span class="e-panel-sub mono">Auto-Scored 1,24 dtk</span>
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:11%;">Kode</th>
                  <th style="width:52%;">Kriteria Rubrik Kepatuhan</th>
                  <th class="num" style="width:16%;">Skor</th>
                  <th style="width:21%;">Hasil</th>
                </tr>
              </thead>
              <tbody>
                ${CALL_9019_RUBRIC.map(
                  (r) => `<tr class="${r.tone === 'bad' ? 'is-bad' : ''}">
                    <td class="mono" style="font-weight:700;">${r.code}</td>
                    <td style="font-weight:500;">${esc(r.name)}</td>
                    <td class="num mono" style="font-weight:700;color:${r.score === 0 ? '#be123c' : '#0f172a'};">${r.score} / ${r.max}</td>
                    <td>${badge(r.status, r.tone)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">Total Skor Kepatuhan CALL-9019</td>
                  <td class="num mono" style="color:#be123c;">42 / 100</td>
                  <td>${badge('Eskalasi <5m', 'bad')}</td>
                </tr>
              </tfoot>
            </table>
            <div style="padding:7px 10px;border-top:1px solid #e6eeec;background:#ffffff;display:flex;flex-direction:column;gap:4px;">
              <div style="font-size:10px;font-weight:700;color:#08483f;display:flex;align-items:center;justify-content:space-between;">
                <span>Rekomendasi Aksi Coaching Supervisor (3 Poin Wajib)</span>
                ${badge('Auto-Generated', 'accent')}
              </div>
              <div style="font-size:9.8px;color:#334155;line-height:1.35;">
                1. Wajibkan role-play ulang frasa hak <em>cooling-off</em> 14 hari kerja (POJK 22/2023 Ps. 31).<br/>
                2. Koreksi larangan menyamakan premi unit-link dengan tabungan berjangka (SEOJK 5/2022).<br/>
                3. Terapkan eskalasi hangat ke supervisor saat sentimen nasabah turun di bawah -40 pada menit 04:30.
              </div>
            </div>
            <div style="padding:8px 10px;border-top:1px solid #d4dedb;background:#f7faf9;display:flex;flex-direction:column;gap:6px;">
              <div style="font-family:var(--e-mono);font-size:9.5px;background:#ffffff;border:1px solid #d4dedb;border-radius:3px;padding:5px 7px;color:#334155;">
                <strong style="color:#be123c;">[06:38] Agen Dewi:</strong> "Iya Bu, langsung aktif hari ini seperti tabungan biasa, nanti polisnya dikirim email."<br/>
                <span style="color:#08483f;">-&gt; OJK_COOLING_OFF_CHECK: FAIL (tidak ditemukan frasa 14 hari kerja)</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-size:10px;color:#475569;">Tiket Coaching: <strong class="mono" style="color:#0f172a;">CO-4412</strong> · Sisa SLA <strong class="mono" style="color:#be123c;">03m 18d</strong></span>
                <div style="display:flex;gap:5px;">
                  <span class="e-btn">${scIcon('waveform', 11, '#0e6b5e')} Buka Forensik</span>
                  <span class="e-btn e-btn-primary">${ic('users', 11, '#ffffff')} Mulai Coaching</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderShell({
    activeTab: 'p2',
    railActive: 'ojk',
    secondaryAction: { icon: 'micOff', label: 'Sensor Segmen PII' },
    primaryAction: { icon: 'play', label: 'Nilai Batch Berikutnya' },
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 3: STUDIO FORENSIK AUDIO, DIARIZATION & SENSOR PII (CALL-9021)
// ============================================================================
function buildStereoWaveformSvg() {
  const W = 1480;
  const H = 210;
  const padL = 78;
  const padR = 16;
  const plotW = W - padL - padR;
  const totalSec = 342; // 05:42
  const xOf = (sec) => padL + (sec / totalSec) * plotW;

  // Deterministic pseudo-random acoustic envelope for Agen (CH-0) and Nasabah (CH-1)
  const bars = 185;
  const stepW = plotW / bars;

  // Bleep masked intervals in seconds: [78.2-81.8], [124.5-128.9], [211.0-214.6]
  const bleeps = [
    { start: 78.2, end: 81.8, label: 'BLEEP 1kHz · OTP 6-DIGIT', id: 'BLK-01' },
    { start: 124.5, end: 128.9, label: 'BLEEP 1kHz · IBU KANDUNG', id: 'BLK-02' },
    { start: 211.0, end: 214.6, label: 'MUTE+1kHz · CVV 3-DIGIT', id: 'BLK-03' },
  ];

  // OJK verification checkpoints
  const markers = [
    { sec: 14, label: 'R-01 Salam & Rekam', color: '#047857' },
    { sec: 108, label: 'R-02 Verifikasi KYC', color: '#047857' },
    { sec: 156, label: 'R-03 Edukasi Anti-OTP', color: '#0e6b5e' },
    { sec: 318, label: 'R-06 SLA & Penutup', color: '#047857' },
  ];

  let out = '';

  // Background lanes (tightened vertically to fit 210px cleanly)
  out += `<rect x="${padL}" y="20" width="${plotW}" height="58" fill="#f8fbfa" stroke="#dce6e3" stroke-width="1" />`;
  out += `<rect x="${padL}" y="83" width="${plotW}" height="58" fill="#f8fafc" stroke="#dce6e3" stroke-width="1" />`;
  out += `<rect x="${padL}" y="146" width="${plotW}" height="52" fill="#ffffff" stroke="#dce6e3" stroke-width="1" />`;

  // Lane labels on left
  out += `<text x="8" y="45" font-size="9.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#08483f">CH-0 Agen</text>`;
  out += `<text x="8" y="58" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#64748b">Fajar · EXT412</text>`;

  out += `<text x="8" y="108" font-size="9.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#0369a1">CH-1 Nasabah</text>`;
  out += `<text x="8" y="121" font-size="8.8" font-family="ui-monospace,Consolas,monospace" fill="#64748b">+62-812-**-4418</text>`;

  out += `<text x="8" y="169" font-size="9.5" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#334155">Sentimen</text>`;
  out += `<text x="8" y="182" font-size="8.6" font-family="ui-monospace,Consolas,monospace" fill="#64748b">-1.0 s/d +1.0</text>`;

  // Time gridlines every 30s
  for (let s = 0; s <= totalSec; s += 30) {
    const x = xOf(s);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    out += `<line x1="${x.toFixed(1)}" y1="16" x2="${x.toFixed(1)}" y2="198" stroke="#e2eae7" stroke-width="1" stroke-dasharray="2,3" />`;
    out += `<text x="${x.toFixed(1)}" y="12" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#64748b">${mm}:${ss}</text>`;
  }

  // Centerlines for audio channels and sentiment 0
  out += `<line x1="${padL}" y1="49" x2="${W - padR}" y2="49" stroke="#d4dedb" stroke-width="1" />`;
  out += `<line x1="${padL}" y1="112" x2="${W - padR}" y2="112" stroke="#cbd5e1" stroke-width="1" />`;
  out += `<line x1="${padL}" y1="172" x2="${W - padR}" y2="172" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3" />`;

  // Generate stereo waveform bars
  for (let i = 0; i < bars; i++) {
    const sec = (i / bars) * totalSec;
    const x = padL + i * stepW + 1;
    const bw = Math.max(2, stepW - 2.2);

    const inBleep = bleeps.some((b) => sec >= b.start && sec <= b.end);

    const agentSpeaking =
      (sec >= 2 && sec <= 28) ||
      (sec >= 48 && sec <= 72) ||
      (sec >= 84 && sec <= 118) ||
      (sec >= 134 && sec <= 184) ||
      (sec >= 220 && sec <= 264) ||
      (sec >= 286 && sec <= 338);
    const custSpeaking =
      (sec >= 25 && sec <= 52) ||
      (sec >= 70 && sec <= 86) ||
      (sec >= 116 && sec <= 136) ||
      (sec >= 182 && sec <= 222) ||
      (sec >= 262 && sec <= 290);

    const waveA = Math.abs(Math.sin(i * 0.65) * 0.6 + Math.cos(i * 1.9) * 0.4);
    const waveC = Math.abs(Math.cos(i * 0.55) * 0.55 + Math.sin(i * 2.3) * 0.45);

    const hA = agentSpeaking ? 5 + waveA * 19 : 2;
    const hC = inBleep ? 16 : custSpeaking ? 5 + waveC * 20 : 2;

    out += `<rect x="${x.toFixed(1)}" y="${(49 - hA).toFixed(1)}" width="${bw.toFixed(1)}" height="${(hA * 2).toFixed(1)}" rx="1" fill="${agentSpeaking ? '#0e6b5e' : '#cbd5e1'}" />`;
    out += `<rect x="${x.toFixed(1)}" y="${(112 - hC).toFixed(1)}" width="${bw.toFixed(1)}" height="${(hC * 2).toFixed(1)}" rx="1" fill="${inBleep ? '#be123c' : custSpeaking ? '#0369a1' : '#cbd5e1'}" />`;
  }

  // Red PII Bleep Overlays across CH-1 with clear top tags
  bleeps.forEach((b) => {
    const x1 = xOf(b.start);
    const x2 = xOf(b.end);
    const w = Math.max(12, x2 - x1);
    const cx = x1 + w / 2;
    const pillW = 136;
    const pillX = Math.max(padL + 2, Math.min(W - padR - pillW, cx - pillW / 2));
    out += `<rect x="${x1.toFixed(1)}" y="83" width="${w.toFixed(1)}" height="58" fill="#be123c" fill-opacity="0.18" stroke="#be123c" stroke-width="1.3" />`;
    out += `<rect x="${pillX.toFixed(1)}" y="85" width="${pillW}" height="15" rx="2" fill="#be123c" />`;
    out += `<text x="${(pillX + pillW / 2).toFixed(1)}" y="95.5" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">${b.label}</text>`;
  });

  // OJK Checkpoints on CH-0
  markers.forEach((m) => {
    const x = xOf(m.sec);
    const pillW = m.label.length * 5.2 + 12;
    const pillX = Math.max(padL + 2, Math.min(W - padR - pillW, x - pillW / 2));
    out += `<line x1="${x.toFixed(1)}" y1="20" x2="${x.toFixed(1)}" y2="78" stroke="${m.color}" stroke-width="1.2" stroke-dasharray="3,2" />`;
    out += `<rect x="${pillX.toFixed(1)}" y="22" width="${pillW.toFixed(1)}" height="14" rx="2" fill="#ecfdf5" stroke="${m.color}" stroke-width="1" />`;
    out += `<text x="${(pillX + pillW / 2).toFixed(1)}" y="32" text-anchor="middle" font-size="8.2" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#065f46">${m.label}</text>`;
  });

  // Sentiment curve in bottom lane (y from 152 [+1] to 192 [-1], mid 172 [0])
  const sentPts = [
    [0, 0.1], [20, 0.2], [45, -0.35], [75, -0.45], [95, -0.2], [125, -0.1],
    [160, 0.15], [195, 0.25], [220, 0.1], [260, 0.45], [300, 0.65], [342, 0.72],
  ];
  const poly = sentPts.map(([s, v]) => `${xOf(s).toFixed(1)},${(172 - v * 19).toFixed(1)}`).join(' ');
  const area = `${xOf(0).toFixed(1)},172 ${poly} ${xOf(342).toFixed(1)},172`;
  out += `<polygon points="${area}" fill="#0e6b5e" fill-opacity="0.12" />`;
  out += `<polyline points="${poly}" fill="none" stroke="#0e6b5e" stroke-width="1.8" />`;
  sentPts.forEach(([s, v]) => {
    out += `<circle cx="${xOf(s).toFixed(1)}" cy="${(172 - v * 19).toFixed(1)}" r="2.4" fill="#ffffff" stroke="${v < 0 ? '#b45309' : '#0e6b5e'}" stroke-width="1.5" />`;
  });

  // Active Playhead at 02:07.4 (127.4s)
  const px = xOf(127.4);
  out += `<line x1="${px.toFixed(1)}" y1="14" x2="${px.toFixed(1)}" y2="200" stroke="#0f172a" stroke-width="1.6" />`;
  out += `<polygon points="${(px - 5).toFixed(1)},14 ${(px + 5).toFixed(1)},14 ${px.toFixed(1)},20" fill="#0f172a" />`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block;">${out}</svg>`;
}

function renderPage3() {
  const turns = [
    {
      ts: '00:14',
      spk: 'CH-0 Agen Fajar',
      spkColor: '#08483f',
      conf: '0.98',
      cls: 'is-ojk',
      text: 'Selamat pagi Bank Nusantara Mandiri, dengan Fajar. Mohon izin panggilan ini direkam untuk peningkatan kualitas layanan sesuai ketentuan OJK. Ada yang bisa dibantu, Pak?',
      tag: '<span class="s-ojk-chip">R-01 SALAM_REKAM: PASS</span>',
    },
    {
      ts: '00:32',
      spk: 'CH-1 Nasabah',
      spkColor: '#0369a1',
      conf: '0.94',
      cls: '',
      text: 'Pagi Kang Fajar, aduh pun mobile token saya teh ke-blokir habis ganti HP baru. Tadi mau transfer BI-FAST buat bayar supplier malah gagal terus.',
      tag: '<span class="e-badge e-badge-neutral">ID+Sunda · Sentimen -0,35</span>',
    },
    {
      ts: '01:18',
      spk: 'CH-1 Nasabah',
      spkColor: '#0369a1',
      conf: '0.97',
      cls: 'is-masked',
      text: 'Ini barusan masuk SMS kode angkanya <span class="s-bleep-chip">[OTP_BLEEP_1KHZ · 3,6d]</span>, perlu saya bacain gak Kang biar cepet ke-reset?',
      tag: '<span class="e-badge e-badge-bad">BLK-01 Disensor Otomatis</span>',
    },
    {
      ts: '01:23',
      spk: 'CH-0 Agen Fajar',
      spkColor: '#08483f',
      conf: '0.98',
      cls: 'is-ojk',
      text: 'Jangan disebutkan Pak! Kode OTP bersifat rahasia dan tidak pernah diminta petugas bank. Sistem kami otomatis menyensor rekaman bagian tersebut demi keamanan akun Bapak.',
      tag: '<span class="s-ojk-chip">R-03 ANTI_OTP_EDU: PASS</span>',
    },
    {
      ts: '01:48',
      spk: 'CH-0 Agen Fajar',
      spkColor: '#08483f',
      conf: '0.97',
      cls: 'is-ojk',
      text: 'Untuk verifikasi KYC, mohon konfirmasi tanggal lahir, kota domisili sesuai KTP, dan transaksi terakhir BI-FAST Bapak tanpa menyebut PIN atau OTP.',
      tag: '<span class="s-ojk-chip">R-02 KYC_VERIFY: PASS</span>',
    },
    {
      ts: '02:04',
      spk: 'CH-1 Nasabah',
      spkColor: '#0369a1',
      conf: '0.96',
      cls: 'is-masked',
      text: 'Oh siap-siap Kang, maaf. Untuk verifikasi tanggal lahir 14 Mei 1984, nama ibu kandung <span class="s-bleep-chip">[IBU_KANDUNG_BLEEP · 4,4d]</span>, alamat Bandung Wetan.',
      tag: '<span class="e-badge e-badge-bad">BLK-02 Disensor Otomatis</span>',
    },
    {
      ts: '03:31',
      spk: 'CH-1 Nasabah',
      spkColor: '#0369a1',
      conf: '0.97',
      cls: 'is-masked',
      text: 'Di belakang kartu debit saya ada tiga angka <span class="s-bleep-chip">[CVV_HARD_MUTE · 3,6d]</span> itu juga gak perlu ya?',
      tag: '<span class="e-badge e-badge-bad">BLK-03 Disensor Otomatis</span>',
    },
    {
      ts: '04:12',
      spk: 'CH-0 Agen Fajar',
      spkColor: '#08483f',
      conf: '0.96',
      cls: 'is-ojk',
      text: 'Betul Pak, CVV juga rahasia. Reset mobile token sudah diproses dengan tiket DIG-88412, aktif maksimal 15 menit. Bapak berhak atas perlindungan data sesuai UU PDP.',
      tag: '<span class="s-ojk-chip">R-06 SLA_CONFIRM: PASS</span>',
    },
    {
      ts: '05:18',
      spk: 'CH-1 Nasabah',
      spkColor: '#0369a1',
      conf: '0.95',
      cls: '',
      text: 'Hatur nuhun pisan Kang Fajar, jelas banget penjelasannya. Nanti saya tunggu 15 menit lalu coba login ulang mobile banking-nya.',
      tag: '<span class="e-badge e-badge-ok">ID+Sunda · Sentimen +0,72</span>',
    },
  ];

  const waterfallSvg = svgSpanWaterfall({
    spans: CALL_9021_SPANS,
    totalMs: 1380,
    width: 400,
  });

  const html = `
    <!-- TOP AUDIO FORENSIC STUDIO PANEL -->
    <section class="e-panel" style="flex:0 0 294px;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${scIcon('waveform', 13, '#0e6b5e')}
          <span>Studio Forensik Audio Stereo & Sensor PII: CALL-9021 (Reset Mobile Token — Agen Fajar)</span>
          ${badge('Skor 91 / 100', 'ok')}
          ${badge('3 Segmen PII Disensor', 'bad')}
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="s-filter-pill is-active mono">CALL-9021 · Disensor</span>
          <span class="s-filter-pill mono">CALL-9019 · Pelanggaran</span>
          <span class="s-filter-pill mono">CALL-9012 · Lulus</span>
        </div>
      </div>
      <div class="e-panel-body" style="padding:6px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:4px;">
        <div>${buildStereoWaveformSvg()}</div>
        <!-- Transport & Acoustic Control Strip -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4.5px 9px;background:#f7faf9;border:1px solid #d4dedb;border-radius:3px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="e-btn e-btn-primary">${scIcon('pause', 11, '#ffffff')} Putar Audio Tersensor</span>
            <span class="mono" style="font-size:11px;font-weight:700;color:#0f172a;">02:07.4 <span style="color:#64748b;font-weight:500;">/ 05:42.0</span></span>
            <span class="e-btn mono" style="font-size:10px;">1.25x</span>
            <span class="e-btn" style="background:#fff1f2;border-color:#fecdd3;color:#9f1239;">${ic('lock', 11, '#be123c')} Audio Asli Terhapus (&lt;30 dtk · UU PDP)</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-family:var(--e-mono);font-size:9.8px;color:#334155;">
            <span>Dialek: <strong>ID + Sunda</strong></span>
            <span>ASR Conf: <strong>0,96</strong></span>
            <span>SNR: <strong>21,4 dB</strong></span>
            <span>WORM: <strong style="color:#08483f;">wav-9021-masked.enc</strong></span>
          </div>
        </div>
      </div>
    </section>

    <!-- BOTTOM 3-COLUMN FORENSIC SPLIT -->
    <div class="s-row" style="flex:1;">
      <!-- COL 1: DIARIZED TRANSCRIPT (45%) -->
      <section class="e-panel" style="flex:0 0 45%;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('fileText', 13, '#0e6b5e')}
            <span>Transkrip Diarized Sinkron (Whisper-ID v3.4 + Token Bleep PII)</span>
          </div>
          <span class="e-panel-sub mono">9 giliran kunci · 0 kata PII tersimpan</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div>
            ${turns
              .map(
                (t) => `<div class="s-transcript-turn ${t.cls}" style="padding:5px 8px;font-size:10.2px;line-height:1.33;">
                  <div style="width:40px;flex-shrink:0;">
                    <div class="mono" style="font-size:9.8px;font-weight:700;color:#475569;">${t.ts}</div>
                    <div class="mono" style="font-size:8.4px;color:#64748b;">c:${t.conf}</div>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:1.5px;">
                      <span style="font-size:9.8px;font-weight:700;color:${t.spkColor};">${esc(t.spk)}</span>
                      ${t.tag}
                    </div>
                    <div style="color:#1e293b;">${t.text}</div>
                  </div>
                </div>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- COL 2: WATERFALL LATENCY + MASKED SEGMENTS TABLE (29%) -->
      <div class="s-col" style="flex:0 0 29%;">
        <section class="e-panel" style="flex:0 0 264px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('cpu', 13, '#0e6b5e')}
              <span>Waterfall Latensi Pipeline Audio</span>
            </div>
            <span class="mono" style="font-size:10px;font-weight:700;color:#08483f;">Total 1.380 ms</span>
          </div>
          <div class="e-panel-body" style="padding:7px 9px;">
            ${waterfallSvg}
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('micOff', 13, '#be123c')}
              <span>Manifest Segmen Bleep PII (3 Segmen)</span>
            </div>
            ${badge('SHA-256 WORM', 'ok')}
          </div>
          <div class="e-panel-body-flush" style="justify-content:space-between;">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:15%;">ID</th>
                  <th style="width:33%;">Rentang Waktu</th>
                  <th style="width:30%;">Entitas PII</th>
                  <th style="width:22%;">SHA-256</th>
                </tr>
              </thead>
              <tbody>
                ${CALL_9021_BLEEPS.map(
                  (b) => `<tr style="height:31px;">
                    <td class="mono" style="font-weight:700;color:#be123c;">${b.id}</td>
                    <td class="mono" style="font-size:9.6px;">${b.range}</td>
                    <td style="font-weight:600;">${esc(b.type)}</td>
                    <td class="mono" style="font-size:9.4px;color:#475569;">${b.hash.replace('sha256:', '')}</td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
            <div style="padding:7px 10px;border-top:1px solid #e6eeec;background:#ffffff;display:flex;flex-direction:column;gap:3px;font-size:9.8px;">
              <div class="s-kv" style="padding:2.5px 0;"><span class="s-kv-k">Metode Masking Akustik</span><span class="s-kv-v mono">SoX 1 kHz + Zero-PCM</span></div>
              <div class="s-kv" style="padding:2.5px 0;"><span class="s-kv-k">Audit Kebocoran Transkrip/WAV</span><span class="s-kv-v mono" style="color:#047857;">0 byte terdeteksi</span></div>
              <div class="s-kv" style="padding:2.5px 0;"><span class="s-kv-k">Kebijakan Retensi WORM</span><span class="s-kv-v mono">5 Tahun · POJK 22/2023</span></div>
            </div>
            <div style="padding:7px 10px;background:#f7faf9;border-top:1px solid #d4dedb;font-size:10px;color:#334155;display:flex;justify-content:space-between;align-items:center;">
              <span>Audio Raw PCM: <strong>Dihapus (Shredded)</strong></span>
              <span class="mono" style="color:#047857;font-weight:700;">t+18 detik</span>
            </div>
          </div>
        </section>
      </div>

      <!-- COL 3: RUBRIC SCORECARD + CRM WEBHOOK ACTION (26%) -->
      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${scIcon('shieldCheck', 13, '#0e6b5e')}
            <span>Kartu Skor Rubrik CALL-9021</span>
          </div>
          <span class="mono" style="font-size:12px;font-weight:800;color:#047857;">91 / 100</span>
        </div>
        <div class="e-panel-body" style="padding:8px 10px;display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
          <div style="display:flex;flex-direction:column;gap:7px;">
            ${CALL_9021_RUBRIC.map((r) => {
              const pct = Math.round((r.score / r.max) * 100);
              return `<div style="border:1px solid #dce6e3;border-radius:3px;padding:6px 8px;background:#fbfdfc;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
                  <span style="font-size:10.2px;font-weight:600;color:#0f172a;" class="trunc"><span class="mono" style="color:#08483f;font-weight:700;">${r.code}</span> ${esc(r.name)}</span>
                  <span class="mono" style="font-size:10.5px;font-weight:700;color:#047857;flex-shrink:0;">${r.score}/${r.max}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="s-score-bar"><div style="width:${pct}%;height:100%;background:#0e6b5e;"></div></div>
                  <span class="mono" style="font-size:9px;color:#64748b;width:32px;text-align:right;">@${r.time}</span>
                </div>
              </div>`;
            }).join('')}
          </div>

          <div style="border:1px solid #d4dedb;border-radius:3px;padding:7px 8px;background:#f7faf9;">
            <div style="font-size:9.6px;font-weight:700;color:#475569;margin-bottom:5px;">Entitas & Istilah Perbankan Terdeteksi</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${badge('BI-FAST', 'accent')}
              ${badge('Mobile Token', 'accent')}
              ${badge('KYC 3-Lapis', 'ok')}
              ${badge('Anti-OTP', 'ok')}
              ${badge('UU PDP', 'info')}
              ${badge('ID+Sunda', 'neutral')}
            </div>
          </div>

          <div style="border-top:1px solid #d4dedb;padding-top:7px;display:flex;flex-direction:column;gap:5px;">
            <div class="s-kv"><span class="s-kv-k">Webhook CRM Tiket</span><span class="s-kv-v mono" style="color:#047857;">HTTP 200 · DIG-88412</span></div>
            <div class="s-kv"><span class="s-kv-k">Status Kalibrasi QA</span><span class="s-kv-v">${badge('Terverifikasi Otomatis', 'ok')}</span></div>
            <div style="display:flex;gap:6px;margin-top:2px;">
              <span class="e-btn" style="flex:1;justify-content:center;">${ic('download', 11, '#0e6b5e')} Unduh Paket Bukti</span>
              <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#ffffff')} Sahkan Audit</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeTab: 'p3',
    railActive: 'pii',
    secondaryAction: { icon: 'download', label: 'Ekspor Transkrip Tersensor' },
    primaryAction: { icon: 'shieldCheck', label: 'Sahkan & Kunci WORM' },
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 4: PIPELINE AI, GUARDRAIL OJK & ATRIBUSI BIAYA (CONTROL PLANE)
// ============================================================================
function buildPipelineDagSvg() {
  const W = 1480;
  const H = 204;

  const nodes = [
    { x: 14, y: 46, w: 204, h: 112, tag: 'EDGE INGEST', title: 'Genesys / Avaya SIPREC', m1: '128 kanal · G.711/Opus', m2: '1.420 panggilan / shift', m3: 'TLS 1.3 · 0% packet loss', color: '#0369a1', bg: '#f0f9ff', bd: '#bae6fd' },
    { x: 262, y: 46, w: 196, h: 112, tag: 'MESSAGE BUS', title: 'RabbitMQ Cluster (3 Node)', m1: 'q.audio.ingest: 4 antre', m2: 'Throughput: 178 call/jam', m3: 'DLQ: 0 · ACK 100%', color: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
    { x: 502, y: 24, w: 234, h: 76, tag: 'PYTORCH GPU POOL', title: 'Whisper-ID v3.4 + Diarization', m1: '4x A100-40GB · DCI JKT-JK5', m2: 'WER 5,6% · p95 640 ms', m3: '', color: '#0e6b5e', bg: '#e6f4f1', bd: '#9fd3c9' },
    { x: 502, y: 112, w: 234, h: 76, tag: 'ZERO-LEAK PII GATE', title: 'IndoBERT NER + SoX 1kHz', m1: '418 segmen disensor · 0 bocor', m2: 'Raw PCM shred < 30 detik', m3: '', color: '#be123c', bg: '#fff1f2', bd: '#fecdd3' },
    { x: 782, y: 46, w: 222, h: 112, tag: '.NET 9 WORKER', title: 'OJK Rubric & Sentiment Engine', m1: '10 Guardrail POJK/PDP aktif', m2: 'Kepatuhan: 96,4% · p95 192ms', m3: 'Auto-trigger Coaching <5m', color: '#047857', bg: '#ecfdf5', bd: '#a7f3d0' },
    { x: 1048, y: 24, w: 200, h: 76, tag: 'OLAP ANALYTICS', title: 'ClickHouse Cluster', m1: '1.420 baris shift terindeks', m2: 'Query p95: 18 ms', m3: '', color: '#0e6b5e', bg: '#f7faf9', bd: '#b8c7c2' },
    { x: 1048, y: 112, w: 200, h: 76, tag: 'IMMUTABLE ARCHIVE', title: 'MinIO WORM Masked WAV', m1: 'SHA-256 Object Lock 5 Thn', m2: 'Audio bersih PII 100%', m3: '', color: '#334155', bg: '#f8fafc', bd: '#cbd5e1' },
    { x: 1290, y: 46, w: 176, h: 112, tag: 'ACTION OUTPUT', title: 'CRM & Coaching Queue', m1: '19 tiket eskalasi aktif', m2: 'Webhook HTTP 200 (99,9%)', m3: 'SLA Supervisor < 5 mnt', color: '#0e6b5e', bg: '#e6f4f1', bd: '#9fd3c9' },
  ];

  let out = `<defs>
    <marker id="arr-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0e6b5e" />
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#be123c" />
    </marker>
  </defs>`;

  // Subtle Sovereign Boundary Frame around GPU + PII + Worker + Storage
  out += `<rect x="488" y="4" width="774" height="196" rx="5" fill="#f7faf9" stroke="#9fd3c9" stroke-width="1.2" stroke-dasharray="5,3" />`;
  out += `<text x="502" y="16" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#08483f">ZONA SOVEREIGN AI ON-PREMISE · DCI JAKARTA JK5 (ZERO EXTERNAL LLM EGRESS)</text>`;

  // Edges with crisp pill backdrops behind labels
  const edges = [
    { d: 'M 218 102 L 260 102', lbl: 'PCM 16k', lx: 239, ly: 91, c: '#0e6b5e', m: 'arr-teal' },
    { d: 'M 458 102 C 480 102, 480 62, 500 62', lbl: 'Batch', lx: 478, ly: 76, c: '#0e6b5e', m: 'arr-teal' },
    { d: 'M 458 102 C 480 102, 480 150, 500 150', lbl: 'Audio', lx: 478, ly: 132, c: '#be123c', m: 'arr-red' },
    { d: 'M 736 62 C 758 62, 758 92, 780 92', lbl: 'JSON', lx: 758, ly: 74, c: '#0e6b5e', m: 'arr-teal' },
    { d: 'M 736 150 C 758 150, 758 114, 780 114', lbl: 'Clean', lx: 758, ly: 135, c: '#be123c', m: 'arr-red' },
    { d: 'M 1004 92 C 1026 92, 1026 62, 1046 62', lbl: 'OLAP', lx: 1025, ly: 74, c: '#0e6b5e', m: 'arr-teal' },
    { d: 'M 1004 114 C 1026 114, 1026 150, 1046 150', lbl: 'WORM', lx: 1025, ly: 135, c: '#0e6b5e', m: 'arr-teal' },
    { d: 'M 1248 62 C 1270 62, 1270 102, 1288 102', lbl: 'Alert', lx: 1268, ly: 80, c: '#0e6b5e', m: 'arr-teal' },
  ];

  edges.forEach((e) => {
    const pw = e.lbl.length * 5.2 + 8;
    out += `<path d="${e.d}" fill="none" stroke="${e.c}" stroke-width="1.6" marker-end="url(#${e.m})" />`;
    out += `<rect x="${(e.lx - pw / 2).toFixed(1)}" y="${(e.ly - 9).toFixed(1)}" width="${pw.toFixed(1)}" height="12" rx="2" fill="#ffffff" stroke="${e.c}" stroke-width="0.6" stroke-opacity="0.4" />`;
    out += `<text x="${e.lx}" y="${e.ly}" text-anchor="middle" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${e.c}">${e.lbl}</text>`;
  });

  // Render nodes
  nodes.forEach((n) => {
    out += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="4" fill="#ffffff" stroke="${n.bd}" stroke-width="1.3" />`;
    out += `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="20" rx="3" fill="${n.bg}" />`;
    out += `<line x1="${n.x}" y1="${n.y + 20}" x2="${n.x + n.w}" y2="${n.y + 20}" stroke="${n.bd}" stroke-width="1" />`;
    out += `<circle cx="${n.x + 10}" cy="${n.y + 10}" r="3.2" fill="${n.color}" />`;
    out += `<text x="${n.x + 18}" y="${n.y + 13}" font-size="8.5" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="${n.color}">${n.tag}</text>`;
    out += `<text x="${n.x + 9}" y="${n.y + 36}" font-size="10.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#0f172a">${esc(n.title)}</text>`;
    out += `<text x="${n.x + 9}" y="${n.y + 53}" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#334155">${esc(n.m1)}</text>`;
    out += `<text x="${n.x + 9}" y="${n.y + 68}" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#475569">${esc(n.m2)}</text>`;
    if (n.m3) {
      out += `<text x="${n.x + 9}" y="${n.y + 84}" font-size="9.5" font-weight="600" font-family="ui-monospace,Consolas,monospace" fill="${n.color}">${esc(n.m3)}</text>`;
    }
  });

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block;">${out}</svg>`;
}

function renderPage4() {
  const costChart = svgStackedBarChart({
    width: 615,
    height: 222,
    categories: ['Kartu/QRIS', 'Klaim RI', 'BI-FAST', 'Bancassur.', 'KPR/Cicil', 'Wealth'],
    yMax: 760000,
    yFormat: (v) => `Rp ${Math.round(v / 1000)}rb`,
    series: [
      { label: 'Whisper-ID GPU', values: SERVICE_QUEUES.map((q) => q.costGpu), color: '#0e6b5e' },
      { label: 'Diarization & PII NER', values: SERVICE_QUEUES.map((q) => q.costNer), color: '#0369a1' },
      { label: '.NET Rubric Scorer', values: SERVICE_QUEUES.map((q) => q.costScorer), color: '#b45309' },
      { label: 'ClickHouse + WORM', values: SERVICE_QUEUES.map((q) => q.costStorage), color: '#64748b' },
    ],
  });

  const sumGpu = SERVICE_QUEUES.reduce((a, q) => a + q.costGpu, 0);
  const sumNer = SERVICE_QUEUES.reduce((a, q) => a + q.costNer, 0);
  const sumScorer = SERVICE_QUEUES.reduce((a, q) => a + q.costScorer, 0);
  const sumStorage = SERVICE_QUEUES.reduce((a, q) => a + q.costStorage, 0);

  const html = `
    <!-- TOP FULL-WIDTH ORCHESTRATION DAG -->
    <section class="e-panel" style="flex:0 0 248px;">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('gitBranch', 13, '#0e6b5e')}
          <span>Topologi Orkestrasi Suara, Guardrail Sovereign AI & Aliran Penyensoran PII</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('Zero External Egress', 'ok')}
          ${badge('100% On-Premise JKT-JK5', 'accent')}
          <span class="e-panel-sub mono">RTF 0,004x · 4x NVIDIA A100-40GB</span>
        </div>
      </div>
      <div class="e-panel-body" style="padding:6px 10px;">
        ${buildPipelineDagSvg()}
      </div>
    </section>

    <!-- BOTTOM SPLIT: GUARDRAIL CATALOG (57%) + IDR COST ATTRIBUTION (43%) -->
    <div class="s-row" style="flex:1;">
      <section class="e-panel" style="flex:0 0 57%;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${scIcon('shieldCheck', 13, '#0e6b5e')}
            <span>Katalog Guardrail Kepatuhan OJK, Sensor PII UU PDP & Deteksi Eskalasi (10 Aturan Aktif)</span>
          </div>
          <span class="e-panel-sub mono">Policy Bundle v2026.11.2 · Signed</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:9%;">Kode</th>
                <th style="width:34%;">Aturan Evaluasi & Guardrail</th>
                <th style="width:17%;">Dasar Regulasi</th>
                <th style="width:13%;">Aksi Mesin</th>
                <th class="num" style="width:9%;">Temuan</th>
                <th class="num" style="width:9%;">F1 Skor</th>
                <th style="width:9%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${GUARDRAIL_RULES.map(
                (r) => `<tr style="height:37px;">
                  <td class="mono" style="font-weight:700;color:#08483f;">${r.id}</td>
                  <td style="font-weight:600;">${esc(r.name)}</td>
                  <td class="mono" style="font-size:9.6px;color:#475569;">${esc(r.clause)}</td>
                  <td>${badge(r.action, r.action === 'AUTO_BLEEP' ? 'accent' : r.tone)}</td>
                  <td class="num mono" style="font-weight:700;">${fmtNum(r.hits)}</td>
                  <td class="num mono">${r.f1}</td>
                  <td>${badge('Aktif', 'ok')}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total Deteksi Shift: 51 Pelanggaran OJK · 418 Bleep PII · 19 Eskalasi Emosi</td>
                <td class="num mono">488</td>
                <td class="num mono">98,3%</td>
                <td>${badge('Zero Drift', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#ffffff;border-top:1px solid #e6eeec;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#334155;">
            <span><strong>Rilis Terakhir:</strong> <span class="mono">v2026.11.2</span> (18 Nov 2026 · tambah kamus frasa cooling-off Bancassurance &amp; dialek Sunda)</span>
            <span class="mono" style="color:#047857;font-weight:700;">Regresi 1.000/1.000 LULUS</span>
          </div>
          <div style="padding:8px 10px;background:#f7faf9;border-top:1px solid #d4dedb;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:10px;">
            <div style="border:1px solid #d4dedb;border-radius:3px;background:#ffffff;padding:6px 8px;">
              <div style="color:#64748b;font-weight:600;">Kalibrasi Gold-Set QA</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#08483f;margin-top:2px;">Cohen κ = 0,91</div>
              <div style="font-size:9.4px;color:#475569;">500 panggilan divalidasi supervisor</div>
            </div>
            <div style="border:1px solid #d4dedb;border-radius:3px;background:#ffffff;padding:6px 8px;">
              <div style="color:#64748b;font-weight:600;">False-Negative PII Audio</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#047857;margin-top:2px;">0,00% (0/418)</div>
              <div style="font-size:9.4px;color:#475569;">Dual-pass Whisper + acoustic regex</div>
            </div>
            <div style="border:1px solid #d4dedb;border-radius:3px;background:#ffffff;padding:6px 8px;">
              <div style="color:#64748b;font-weight:600;">Utilisasi Cluster GPU</div>
              <div style="margin-top:5px;">${renderCapacityBar(64, { warnAt: 75, critAt: 90 })}</div>
              <div style="font-size:9.4px;color:#475569;margin-top:2px;">Cadangan 36% untuk lonjakan akhir bulan</div>
            </div>
          </div>
        </div>
      </section>

      <!-- RIGHT: IDR COST ATTRIBUTION BY BUSINESS UNIT (43%) -->
      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('database', 13, '#0e6b5e')}
            <span>Atribusi Biaya Komputasi AI (IDR) per Unit Layanan</span>
          </div>
          <span class="mono" style="font-size:11px;font-weight:700;color:#08483f;">${fmtIdr(TOTAL_COST_IDR)} / shift</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div style="padding:6px 8px 2px;">${costChart}</div>
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:31%;">Unit Layanan</th>
                <th class="num" style="width:17%;">GPU ASR</th>
                <th class="num" style="width:16%;">NER/PII</th>
                <th class="num" style="width:16%;">Scorer</th>
                <th class="num" style="width:20%;">Total Shift</th>
              </tr>
            </thead>
            <tbody>
              ${SERVICE_QUEUES.map(
                (q) => `<tr style="height:35px;">
                  <td style="font-weight:600;">${esc(q.name)}</td>
                  <td class="num mono">${fmtIdr(q.costGpu)}</td>
                  <td class="num mono">${fmtIdr(q.costNer)}</td>
                  <td class="num mono">${fmtIdr(q.costScorer)}</td>
                  <td class="num mono" style="font-weight:700;color:#08483f;">${fmtIdr(q.costIdr)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td>Total Shift (+Storage ${fmtIdr(sumStorage)})</td>
                <td class="num mono">${fmtIdr(sumGpu)}</td>
                <td class="num mono">${fmtIdr(sumNer)}</td>
                <td class="num mono">${fmtIdr(sumScorer)}</td>
                <td class="num mono">${fmtIdr(TOTAL_COST_IDR)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#e6f4f1;border-top:1px solid #9fd3c9;display:flex;justify-content:space-between;align-items:center;font-size:10.2px;color:#08483f;">
            <span>Proyeksi 30 Hari (2 Shift/Hari · ~85.200 panggilan)</span>
            <strong class="mono">${fmtIdr(TOTAL_COST_IDR * 60)}</strong>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderShell({
    activeTab: 'p4',
    railActive: 'mq',
    secondaryAction: { icon: 'sliders', label: 'Uji Regresi Rubrik' },
    primaryAction: { icon: 'zap', label: 'Deploy Policy v2026.11' },
    contentHtml: html,
  });
}

// ============================================================================
// PAGE 5: ANTREAN COACHING <5 MENIT & KEPATUHAN WORM UU PDP
// ============================================================================
function renderPage5() {
  const complianceChecks = [
    { item: 'Kedaulatan Data & Inferensi On-Premise', proof: 'DCI Jakarta JK5 · 0 panggilan keluar RI', std: 'Sovereign AI', status: 'Patuh', tone: 'ok' },
    { item: 'Penghapusan Audio Asli Pasca-Bleep', proof: 'Shred otomatis < 30 detik (rerata 18 dtk)', std: 'UU PDP Ps. 39', status: 'Patuh', tone: 'ok' },
    { item: 'Penyimpanan Bukti Audio WORM 5 Tahun', proof: 'MinIO Object Lock + SHA-256 manifest', std: 'POJK 22/2023', status: 'Patuh', tone: 'ok' },
    { item: 'Kontrol Akses Dual-Approval DPO', proof: '1 upaya akses unmasked ditolak shift ini', std: 'ISO 27001 A.9', status: 'Terkunci', tone: 'ok' },
    { item: 'Enkripsi Jalur SIPREC & Webhook CRM', proof: 'mTLS 1.3 · rotasi sertifikat 90 hari', std: 'PCI-DSS v4.0', status: 'Patuh', tone: 'ok' },
  ];

  const html = `
    <!-- TOP GOVERNANCE SUMMARY STRIP -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4,1fr);">
      <div class="s-kpi-card is-bad">
        <div class="e-kpi-top"><span>Antrean Coaching Eskalasi (Shift Pagi)</span>${badge('SLA < 5 mnt', 'warn')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_ESCALATIONS} kasus</span><span class="mono" style="font-size:10.5px;color:#be123c;font-weight:700;">6 aktif · 6 antre · 7 selesai</span></div>
        <div class="e-kpi-foot"><span>100% tertangani dalam batas SLA 5 menit (rerata 02m 48d)</span></div>
      </div>
      <div class="s-kpi-card is-accent">
        <div class="e-kpi-top"><span>Penyensoran PII Audio Otomatis</span>${badge('0 Kebocoran', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${fmtNum(TOTAL_PII)} segmen</span><span class="mono" style="font-size:10.5px;color:#047857;font-weight:700;">312 panggilan unik</span></div>
        <div class="e-kpi-foot"><span>OTP 164 · Ibu Kandung 112 · CVV 78 · NIK 41 · Rek/PIN 23</span></div>
      </div>
      <div class="s-kpi-card is-accent">
        <div class="e-kpi-top"><span>Integritas Arsip WORM Audio</span>${badge('SHA-256 Verified', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">1.420 objek</span><span class="mono" style="font-size:10.5px;color:#08483f;font-weight:700;">Retensi 5 Tahun</span></div>
        <div class="e-kpi-foot"><span>Audio mentah dihapus permanen &lt;30 detik pasca-bleep</span></div>
      </div>
      <div class="s-kpi-card is-accent">
        <div class="e-kpi-top"><span>Kesiapan Laporan Audit OJK</span>${badge('POJK 22/2023', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">96,4% patuh</span><span class="mono" style="font-size:10.5px;color:#047857;font-weight:700;">5/5 Kontrol Lulus</span></div>
        <div class="e-kpi-foot"><span>Paket ekspor GRC otomatis setiap akhir shift (15:00 WIB)</span></div>
      </div>
    </div>

    <div class="s-row" style="flex:1;">
      <!-- LEFT: SUPERVISOR COACHING QUEUE (56%) -->
      <section class="e-panel" style="flex:0 0 56%;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('users', 13, '#be123c')}
            <span>Antrean Coaching Supervisor Real-Time (12 Kasus Aktif & Dijadwalkan dari 19 Total)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('7 Selesai Diverifikasi', 'ok')}
            ${badge('Target SLA < 05m 00d', 'warn')}
          </div>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:11%;">Kode</th>
                <th style="width:17%;">Agen & Tim</th>
                <th style="width:31%;">Pemicu Pelanggaran / Eskalasi</th>
                <th class="num" style="width:8%;">Skor</th>
                <th class="num" style="width:10%;">Waktu SLA</th>
                <th style="width:11%;">Supervisor</th>
                <th style="width:12%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${COACHING_CASES.map(
                (c) => `<tr class="${c.state === 'Aktif' && c.score < 55 ? 'is-bad' : c.state === 'Aktif' ? 'is-warn' : ''}" style="height:44px;">
                  <td class="mono" style="font-weight:700;color:#08483f;">${c.call}</td>
                  <td>
                    <div style="font-weight:700;color:#0f172a;">${esc(c.agent)}</div>
                    <div class="mono" style="font-size:9.2px;color:#64748b;">${esc(c.team)}</div>
                  </td>
                  <td style="font-weight:500;">${esc(c.reason)}</td>
                  <td class="num mono" style="font-weight:700;color:${c.score < 60 ? '#be123c' : '#b45309'};">${c.score}</td>
                  <td class="num mono" style="font-weight:700;color:#047857;">${c.wait}</td>
                  <td style="font-size:10px;color:#334155;">${esc(c.spv)}</td>
                  <td>${badge(c.state, c.tone)}</td>
                </tr>`
              ).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Rekap Total Eskalasi Shift Pagi: ${COACHING_COUNTS.active} Aktif + ${COACHING_COUNTS.scheduled} Dijadwalkan + ${COACHING_COUNTS.completed} Selesai = ${TOTAL_ESCALATIONS} Kasus</td>
                <td class="num mono">61,8</td>
                <td class="num mono">02m 48d</td>
                <td colspan="2">${badge('100% Dalam SLA 5m', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="padding:7px 10px;background:#ffffff;border-top:1px solid #e6eeec;">
            <div style="font-size:9.6px;font-weight:700;color:#475569;margin-bottom:5px;display:flex;justify-content:space-between;">
              <span>Distribusi Beban Coaching Supervisor Shift Pagi (Total 19 Kasus)</span>
              <span class="mono" style="color:#08483f;">4 Supervisor On-Duty</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
              ${SUPERVISOR_LOAD.map(
                (s) => `<div style="border:1px solid #d4dedb;border-radius:3px;padding:5px 7px;background:#f9fbfa;display:flex;flex-direction:column;gap:2px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:10px;font-weight:700;color:#0f172a;">${esc(s.name)}</span>
                    <span class="mono" style="font-size:10px;font-weight:700;color:#08483f;">${s.total} kasus</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-family:var(--e-mono);font-size:9px;color:#475569;">
                    <span>${s.active} aktif</span>
                    <span style="color:#047857;">SLA ${s.avgSla}</span>
                  </div>
                </div>`
              ).join('')}
            </div>
          </div>

          <div style="padding:8px 10px;background:#f7faf9;border-top:1px solid #d4dedb;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.2px;">
            <div style="color:#334155;">
              <strong>Ringkasan 7 Kasus Coaching Selesai:</strong> Rata-rata durasi coaching <strong>4m 15d</strong> · 100% agen menandatangani ulang komitmen skrip OJK · 0 pengulangan pelanggaran pada 3 panggilan berikutnya.
            </div>
            <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Berita Acara</span>
          </div>
        </div>
      </section>

      <!-- RIGHT: PII BREAKDOWN + WORM AUDIT LOG + COMPLIANCE MATRIX (44%) -->
      <div class="s-col" style="flex:1;">
        <section class="e-panel" style="flex:0 0 242px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('micOff', 13, '#0e6b5e')}
              <span>Rincian Penyensoran PII Audio (UU PDP & PCI-DSS)</span>
            </div>
            ${badge('418 / 418 Tersensor', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:37%;">Kategori Data Pribadi</th>
                  <th class="num" style="width:12%;">Segmen</th>
                  <th style="width:27%;">Metode Bleeping</th>
                  <th style="width:24%;">Dasar Regulasi</th>
                </tr>
              </thead>
              <tbody>
                ${PII_CATEGORIES.map(
                  (p) => `<tr style="height:31px;">
                    <td style="font-weight:600;">${esc(p.label)}</td>
                    <td class="num mono" style="font-weight:700;color:#08483f;">${fmtNum(p.count)}</td>
                    <td class="mono" style="font-size:9.6px;">${esc(p.method)}</td>
                    <td class="mono" style="font-size:9.4px;color:#475569;">${esc(p.regulation)}</td>
                  </tr>`
                ).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total Segmen PII Disensor (0 Lolos)</td>
                  <td class="num mono">${fmtNum(TOTAL_PII)}</td>
                  <td colspan="2" class="mono" style="color:#047857;">100,0% Terverifikasi Otomatis</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:0 0 242px;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('lock', 13, '#0e6b5e')}
              <span>Log Audit Immutabel WORM & Kontrol Akses DPO</span>
            </div>
            <span class="e-panel-sub mono">Append-Only · SHA-256</span>
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:13%;">WIB</th>
                  <th style="width:22%;">Aksi</th>
                  <th style="width:16%;">Objek</th>
                  <th style="width:34%;">Keterangan Bukti</th>
                  <th style="width:15%;">Digest</th>
                </tr>
              </thead>
              <tbody>
                ${WORM_LOGS.map(
                  (w) => `<tr style="height:36px;">
                    <td class="mono" style="color:#475569;">${w.ts}</td>
                    <td>${badge(w.action, w.tone)}</td>
                    <td class="mono" style="font-weight:700;color:#08483f;">${w.call}</td>
                    <td style="font-size:10px;">${esc(w.note)}</td>
                    <td class="mono" style="font-size:9.4px;color:#64748b;">${w.hash}</td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="e-panel" style="flex:1;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${scIcon('shieldCheck', 13, '#0e6b5e')}
              <span>Matriks Kesiapan Audit OJK, UU PDP & Sovereign AI</span>
            </div>
            ${badge('Siap Audit Eksternal', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:36%;">Kontrol Kepatuhan</th>
                  <th style="width:35%;">Bukti Terukur</th>
                  <th style="width:16%;">Standar</th>
                  <th style="width:13%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${complianceChecks
                  .map(
                    (c) => `<tr style="height:36px;">
                      <td style="font-weight:600;">${esc(c.item)}</td>
                      <td style="font-size:10px;color:#334155;">${esc(c.proof)}</td>
                      <td class="mono" style="font-size:9.5px;color:#08483f;">${esc(c.std)}</td>
                      <td>${badge(c.status, c.tone)}</td>
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
    activeTab: 'p5',
    railActive: 'ch',
    secondaryAction: { icon: 'lock', label: 'Verifikasi WORM SHA-256' },
    primaryAction: { icon: 'download', label: 'Ekspor Paket Audit OJK' },
    contentHtml: html,
  });
}

// ============================================================================
// EXPORT RENDER PAGES
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
