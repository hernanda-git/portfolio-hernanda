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
  id: 'ID-005',
  name: 'DokterScribe ID',
  reference: 'Epic Systems Hyperspace (StoryBoard + NoteWriter) + Nuance DAX Copilot',
  persona: 'dr. Ratna Kusuma, Sp.PD-KEMD · Poli Penyakit Dalam · RSUPN Dr. Cipto Mangunkusumo',
  pages: [
    { slug: 'p1', title: 'Ruang Konsultasi & Dikte SOAP Real-Time' },
    { slug: 'p2', title: 'Antrean Poliklinik Shift & Meja Koder ICD-10' },
    { slug: 'p3', title: 'Integrasi SIMRS & Inspektor SATUSEHAT FHIR R4' },
    { slug: 'p4', title: 'Privasi Audio Zero-Retention & Audit UU PDP' },
    { slug: 'p5', title: 'Pendamping Tablet Dokter & Analitik Beban Kerja Poli' },
  ],
};

// ============================================================================
// CUSTOM CLINICAL STROKE SVG ICONS (ZERO EMOJI)
// ============================================================================
const MED_ICONS = {
  stethoscope:
    '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  mic:
    '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  pill:
    '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  heartPulse:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  clipboardCheck:
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  tablet:
    '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  trashLock:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  hospital:
    '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>',
  penSign:
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  waveform:
    '<line x1="4" y1="10" x2="4" y2="14"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="16" y1="7" x2="16" y2="17"/><line x1="20" y1="10" x2="20" y2="14"/>',
};

function medIc(name, size = 13, color = 'currentColor') {
  const path = MED_ICONS[name];
  if (!path) return ic(name, size, color);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${path}</svg>`;
}

// ============================================================================
// SINGLE SOURCE OF TRUTH CLINICAL DATASET (MATHEMATICALLY VERIFIED ACROSS P1-P5)
// ============================================================================
const ACTIVE_PATIENT = {
  name: 'Tn. Bambang Suryadi',
  initials: 'BS',
  sexAge: 'Laki-laki · 58 th (14 Mei 1968)',
  rm: '04-88-21-94',
  ihsId: 'P02478391042',
  bpjs: '0001847291042 (Kelas 1)',
  sep: '0112R0011126V008412',
  encounterId: 'ENC-20261122-08412',
  poli: 'Poli Penyakit Dalam · R.04',
  doctor: 'dr. Ratna Kusuma, Sp.PD-KEMD',
  doctorShort: 'dr. Ratna Kusuma',
  sip: 'SIP 446/2194/DPMPTSP',
  ihsPractitioner: 'N10009842112',
  allergy: 'Sulfonamida (Kotrimoksazol)',
  allergyReaction: 'Ruam makulopapular · Risiko Sedang',
  draftSec: 8.2,
  audioDuration: '04:18',
  ramBufferMb: 4.1,
};

const SHIFT_STATUS = {
  signed: 38,
  pending: 9,
  coder: 4,
  active: 3,
};

const SHIFT_PAYERS = {
  bpjs: 46,
  asuransi: 5,
  umum: 3,
};

const HOURLY_SHIFT = {
  hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
  signed: [7, 9, 8, 7, 4, 3],
  pending: [0, 1, 2, 2, 2, 2],
  coder: [0, 0, 1, 1, 1, 1],
  active: [0, 0, 0, 0, 0, 3],
};

// 16 operational encounters from the 54-patient shift (Poli Penyakit Dalam)
const ENCOUNTERS = [
  { no: 'A-039', rm: '04-88-21-94', name: 'Tn. Bambang Suryadi', payer: 'BPJS JKN', sep: '...V008412', cc: 'Sering haus 2 mgg, kesemutan kaki', icd: 'E11.9, I10', cbg: 'Q-5-44-0', tariff: 312400, draftSec: 8.2, fhirStatus: 'Menunggu TTD', fhirTone: 'accent', audio: 'RAM 4,1 MB', audioTone: 'info', selected: true },
  { no: 'A-038', rm: '04-71-09-12', name: 'Ny. Siti Rahmawati', payer: 'BPJS JKN', sep: '...V008409', cc: 'Nyeri ulu hati, mual 5 hari', icd: 'K21.9, K29.7', cbg: 'Q-5-44-0', tariff: 298500, draftSec: 7.6, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-037', rm: '03-92-44-81', name: 'Tn. Hendra Wijaya', payer: 'BPJS JKN', sep: '...V008405', cc: 'Kontrol DM2 + ulkus pedis kanan', icd: 'E11.621', cbg: 'Q-5-44-1', tariff: 418200, draftSec: 9.1, fhirStatus: 'Revisi Koder', fhirTone: 'warn', audio: '0 KB (Purged)', audioTone: 'ok', warn: true },
  { no: 'A-036', rm: '04-12-65-30', name: 'Ny. Endang Lestari', payer: 'BPJS JKN', sep: '...V008398', cc: 'Berdebar, BB turun 4 kg / 1 bln', icd: 'E05.90', cbg: 'Q-5-44-0', tariff: 342000, draftSec: 8.4, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-035', rm: '04-55-18-07', name: 'Tn. Agus Salim', payer: 'BPJS JKN', sep: '...V008391', cc: 'Bengkak tungkai, CKD stage 3b', icd: 'N18.3, I10', cbg: 'Q-5-44-1', tariff: 446800, draftSec: 8.8, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-034', rm: '02-88-30-19', name: 'Ny. Kartini Susanto', payer: 'Asuransi', sep: 'COB-88412', cc: 'Nyeri sendi lutut bilateral pagi', icd: 'M17.0', cbg: 'Q-5-44-0', tariff: 365000, draftSec: 7.4, fhirStatus: 'Menunggu TTD', fhirTone: 'info', audio: 'RAM 3,6 MB', audioTone: 'info' },
  { no: 'A-033', rm: '04-63-72-44', name: 'Tn. Dedi Kurniawan', payer: 'BPJS JKN', sep: '...V008384', cc: 'Batuk berdahak 3 mgg, keringat mlm', icd: 'A15.0', cbg: 'Q-5-44-1', tariff: 394500, draftSec: 8.5, fhirStatus: 'Revisi Koder', fhirTone: 'warn', audio: '0 KB (Purged)', audioTone: 'ok', warn: true },
  { no: 'A-032', rm: '04-19-83-56', name: 'Ny. Rina Marlina', payer: 'BPJS JKN', sep: '...V008377', cc: 'Pusing tengkuk, TD 158/94 mmHg', icd: 'I10, E78.0', cbg: 'Q-5-44-0', tariff: 312400, draftSec: 7.9, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-031', rm: '03-77-14-62', name: 'Tn. Sutrisno Hadi', payer: 'BPJS JKN', sep: '...V008369', cc: 'Lemas, Hb 9,2 g/dL, kontrol anemia', icd: 'D50.9', cbg: 'Q-5-44-0', tariff: 328600, draftSec: 8.0, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-030', rm: '04-41-90-18', name: 'Ny. Yuliana Dewi', payer: 'Umum', sep: 'UMM-11220', cc: 'Kontrol rutin DM gestasional pasca', icd: 'O24.4', cbg: 'NON-CBG', tariff: 275000, draftSec: 7.2, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-029', rm: '04-05-27-93', name: 'Tn. Ridwan Kamilan', payer: 'BPJS JKN', sep: '...V008360', cc: 'Sesak aktivitas, riw. PJK & HT', icd: 'I50.9, I10', cbg: 'Q-5-44-1', tariff: 462000, draftSec: 9.4, fhirStatus: 'Revisi Koder', fhirTone: 'warn', audio: '0 KB (Purged)', audioTone: 'ok', warn: true },
  { no: 'A-028', rm: '03-64-51-28', name: 'Ny. Nurhayati', payer: 'BPJS JKN', sep: '...V008352', cc: 'Demam 4 hari, trombosit 98.000', icd: 'A91', cbg: 'Q-5-44-1', tariff: 378400, draftSec: 8.3, fhirStatus: 'Menunggu TTD', fhirTone: 'info', audio: 'RAM 3,9 MB', audioTone: 'info' },
  { no: 'A-027', rm: '04-82-11-05', name: 'Tn. Joko Prasetyo', payer: 'BPJS JKN', sep: '...V008344', cc: 'Asam urat 9,4 mg/dL, nyeri MTP-1', icd: 'M10.9', cbg: 'Q-5-44-0', tariff: 289000, draftSec: 7.5, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-026', rm: '04-30-69-77', name: 'Ny. Mulyani Putri', payer: 'BPJS JKN', sep: '...V008338', cc: 'Kontrol dislipidemia, LDL 168 mg/dL', icd: 'E78.0', cbg: 'Q-5-44-0', tariff: 294200, draftSec: 7.8, fhirStatus: 'Terkirim 201', fhirTone: 'ok', audio: '0 KB (Purged)', audioTone: 'ok' },
  { no: 'A-025', rm: '02-91-40-11', name: 'Tn. Arifin Hakim', payer: 'Asuransi', sep: 'COB-88394', cc: 'Fatty liver ringan, SGOT/SGPT naik', icd: 'K76.0', cbg: 'Q-5-44-0', tariff: 348000, draftSec: 8.1, fhirStatus: 'Menunggu TTD', fhirTone: 'info', audio: 'RAM 3,2 MB', audioTone: 'info' },
  { no: 'A-040', rm: '04-89-02-31', name: 'Ny. Wahyuni Sari', payer: 'BPJS JKN', sep: '...V008415', cc: 'Sedang anamnesis · kontrol tiroid', icd: 'E03.9*', cbg: 'Q-5-44-0', tariff: 312400, draftSec: 8.0, fhirStatus: 'Dikte Aktif', fhirTone: 'accent', audio: 'Streaming', audioTone: 'info' },
];

const SHIFT_TOTAL_CLAIM_IDR = 17842600;

// Page 3: FHIR R4 Bundle Resources (9 resources)
const FHIR_RESOURCES = [
  { idx: 1, type: 'Encounter', id: 'enc-08412', profile: 'ID-Core Encounter', summary: 'Poli Penyakit Dalam · finished', code: 'AMB', status: '201 Valid', tone: 'ok' },
  { idx: 2, type: 'Condition', id: 'cnd-08412-1', profile: 'ICD-10 Utama', summary: 'DM Tipe 2 tanpa komplikasi', code: 'E11.9', status: '201 Valid', tone: 'ok', selected: true },
  { idx: 3, type: 'Condition', id: 'cnd-08412-2', profile: 'ICD-10 Sekunder', summary: 'Hipertensi esensial (primer)', code: 'I10', status: '201 Valid', tone: 'ok' },
  { idx: 4, type: 'Observation', id: 'obs-08412-td', profile: 'LOINC Vital Sign', summary: 'Tekanan Darah 142/88 mmHg', code: '85354-9', status: '201 Valid', tone: 'warn' },
  { idx: 5, type: 'Observation', id: 'obs-08412-gdp', profile: 'LOINC Glukosa', summary: 'Glukosa Darah Puasa 214 mg/dL', code: '1558-6', status: '201 Valid', tone: 'warn' },
  { idx: 6, type: 'Observation', id: 'obs-08412-imt', profile: 'LOINC Antropometri', summary: 'Indeks Massa Tubuh 27,4 kg/m²', code: '39156-5', status: '201 Valid', tone: 'ok' },
  { idx: 7, type: 'MedicationRequest', id: 'med-08412-1', profile: 'KFA e-Resep', summary: 'Metformin HCl 500 mg (2x1 pc)', code: '93000412', status: '201 Valid', tone: 'ok', selected: true },
  { idx: 8, type: 'MedicationRequest', id: 'med-08412-2', profile: 'KFA e-Resep', summary: 'Amlodipine Besylate 5 mg (1x1)', code: '93001108', status: '201 Valid', tone: 'ok' },
  { idx: 9, type: 'Consent', id: 'cns-08412-pdp', profile: 'UU PDP & PMK 24', summary: 'Persetujuan Rekam & TTE BSrE', code: 'ACTIVE', status: 'Signed', tone: 'ok' },
];

const PIPELINE_SPANS = [
  { label: 'SignalR Audio Finalize', start: 0, dur: 140, color: '#0c7c66' },
  { label: 'Clinical NER Bahasa ID', start: 140, dur: 420, color: '#0d9488' },
  { label: 'SOAP Structurer LLM', start: 560, dur: 680, color: '#0369a1' },
  { label: 'ICD-10 & KFA Mapper', start: 1240, dur: 210, color: '#0284c7' },
  { label: 'SIMRS HL7v2/FHIR Ack', start: 1450, dur: 190, color: '#0f766e' },
  { label: 'SATUSEHAT Bundle POST', start: 1640, dur: 340, color: '#047857' },
  { label: 'Audio RAM Zero-Purge', start: 1980, dur: 45, color: '#be123c' },
];

const ID_CLINICAL_MAP = [
  { abbr: 'OS', meaning: 'Orang Sakit (Pasien)', target: 'Patient.subject', code: 'IHS P02478391042', acc: '99,6%' },
  { abbr: 'KU', meaning: 'Keluhan Utama / Keadaan Umum', target: 'Encounter.reason', code: 'SNOMED 404684003', acc: '98,9%' },
  { abbr: 'TD', meaning: 'Tekanan Darah (Sistol/Diastol)', target: 'Observation', code: 'LOINC 85354-9', acc: '99,8%' },
  { abbr: 'RPD', meaning: 'Riwayat Penyakit Dahulu', target: 'Condition (history)', code: 'ICD-10 E11.9/I10', acc: '97,8%' },
  { abbr: 'GDP', meaning: 'Glukosa Darah Puasa', target: 'Observation', code: 'LOINC 1558-6', acc: '99,4%' },
  { abbr: 'IMT', meaning: 'Indeks Massa Tubuh', target: 'Observation', code: 'LOINC 39156-5', acc: '99,7%' },
  { abbr: '2x1 pc', meaning: 'Dua kali sehari sesudah makan', target: 'Dosage.timing', code: 'FHIR BID + PC', acc: '99,1%' },
  { abbr: 'DM2', meaning: 'Diabetes Melitus Tipe 2', target: 'Condition.code', code: 'ICD-10 E11.9', acc: '98,4%' },
  { abbr: 'HT', meaning: 'Hipertensi Esensial Primer', target: 'Condition.code', code: 'ICD-10 I10', acc: '98,7%' },
];

const RECENT_BUNDLES = [
  { time: '11:02:18', enc: 'ENC-08409', res: '9 res', simrs: 'MSA|AA', satu: '201 Created', ms: '318 ms' },
  { time: '10:54:41', enc: 'ENC-08405', res: '11 res', simrs: 'MSA|AA', satu: '201 Created', ms: '364 ms' },
  { time: '10:47:05', enc: 'ENC-08398', res: '8 res', simrs: 'MSA|AA', satu: '201 Created', ms: '295 ms' },
  { time: '10:39:22', enc: 'ENC-08391', res: '10 res', simrs: 'MSA|AA', satu: '201 Created', ms: '342 ms' },
  { time: '10:31:09', enc: 'ENC-08384', res: '9 res', simrs: 'MSA|AA', satu: '201 Created', ms: '329 ms' },
];

// Page 4: Privacy & Compliance
const COMPLIANCE_CONTROLS = [
  { code: 'PDP-16', reg: 'UU PDP Ps. 16(2)', control: 'Minimisasi & Pembatasan Tujuan Data', evidence: 'Audio dihapus 0 KB pasca-TTD; hanya EMR disimpan', status: 'LULUS' },
  { code: 'PDP-20', reg: 'UU PDP Ps. 20(2)', control: 'Persetujuan Sah & Eksplisit Pasien', evidence: 'FHIR Consent tertaut No. RM + timestamp 100%', status: 'LULUS' },
  { code: 'PDP-35', reg: 'UU PDP Ps. 35', control: 'Perlindungan Data Spesifik (Kesehatan)', evidence: 'Enkripsi TLS 1.3 + AES-256-GCM ephemeral key', status: 'LULUS' },
  { code: 'PDP-43', reg: 'UU PDP Ps. 43', control: 'Pemusnahan Data Setelah Masa Retensi', evidence: 'ZeroizeMemory() + WORM SHA-256 receipt', status: 'LULUS' },
  { code: 'PMK-29', reg: 'PMK 24/2022 Ps. 29', control: 'Keamanan & Kerahasiaan RME RS', evidence: 'Inferensi Whisper on-premise RS (0 egress publik)', status: 'LULUS' },
  { code: 'PMK-32', reg: 'PMK 24/2022 Ps. 32', control: 'Integrasi Wajib SATUSEHAT Kemenkes', evidence: 'Bundle FHIR R4 100% lolos validator ID-Core', status: 'LULUS' },
  { code: 'TTE-01', reg: 'UU ITE & BSrE', control: 'Tanda Tangan Elektronik Dokter (SIP)', evidence: 'Penandatanganan BSrE + TSA BSSN valid 38/38', status: 'LULUS' },
  { code: 'ISO-27', reg: 'ISO/IEC 27799', control: 'Audit Trail Immutable & RBAC Klinis', evidence: 'Append-only WORM ledger + RBAC per poli', status: 'LULUS' },
];

const PURGE_LOGS = [
  { id: 'WRM-2211-038', time: '11:02:19', enc: 'ENC-08409', doc: 'dr. Ratna Kusuma', dur: '04:06', ramMb: 3.9, diskKb: 0, method: 'Zeroize + KeyShred', hash: '9f84a2c1...e71b', ok: true },
  { id: 'WRM-2211-037', time: '10:54:42', enc: 'ENC-08405', doc: 'dr. Ratna Kusuma', dur: '05:12', ramMb: 4.9, diskKb: 0, method: 'Zeroize + KeyShred', hash: '7c31d804...4a92', ok: true },
  { id: 'WRM-2211-036', time: '10:47:06', enc: 'ENC-08398', doc: 'dr. Ratna Kusuma', dur: '03:54', ramMb: 3.7, diskKb: 0, method: 'Zeroize + KeyShred', hash: '4b90e512...8f30', ok: true },
  { id: 'WRM-2211-035', time: '10:39:23', enc: 'ENC-08391', doc: 'dr. Ratna Kusuma', dur: '04:48', ramMb: 4.5, diskKb: 0, method: 'Zeroize + KeyShred', hash: 'd216f7a9...1c04', ok: true },
  { id: 'WRM-2211-034', time: '10:31:10', enc: 'ENC-08384', doc: 'dr. Ratna Kusuma', dur: '04:22', ramMb: 4.1, diskKb: 0, method: 'Zeroize + KeyShred', hash: 'a845c0e3...6d21', ok: true },
  { id: 'WRM-2211-033', time: '10:22:48', enc: 'ENC-08377', doc: 'dr. Ratna Kusuma', dur: '03:40', ramMb: 3.5, diskKb: 0, method: 'Zeroize + KeyShred', hash: '1e79b44d...9b58', ok: true },
  { id: 'WRM-2211-032', time: '10:15:12', enc: 'ENC-08369', doc: 'dr. Ratna Kusuma', dur: '04:10', ramMb: 4.0, diskKb: 0, method: 'Zeroize + KeyShred', hash: '6a02f18c...3e77', ok: true },
  { id: 'WRM-2211-031', time: '10:07:35', enc: 'ENC-08360', doc: 'dr. Ratna Kusuma', dur: '05:04', ramMb: 4.8, diskKb: 0, method: 'Zeroize + KeyShred', hash: 'f398a6d1...2a19', ok: true },
  { id: 'WRM-2211-030', time: '09:58:51', enc: 'ENC-08352', doc: 'dr. Ratna Kusuma', dur: '04:36', ramMb: 4.4, diskKb: 0, method: 'Zeroize + KeyShred', hash: '8c54d2b7...0f63', ok: true },
  { id: 'WRM-2211-029', time: '09:50:14', enc: 'ENC-08344', doc: 'dr. Ratna Kusuma', dur: '04:12', ramMb: 4.0, diskKb: 0, method: 'Zeroize + KeyShred', hash: '3d11e9a5...5c48', ok: true },
];

// Page 5: 8-Polyclinic Rollout & Overtime Reduction Analytics
const POLYCLINICS = [
  { name: 'Penyakit Dalam', docs: 8, patientsDay: 368, draftSec: 8.2, icdAcc: 96.4, otBefore: 9.5, otAfter: 0.8, savedHrsMo: 312, status: 'Optimal', tone: 'ok' },
  { name: 'Jantung & Pembuluh', docs: 6, patientsDay: 252, draftSec: 8.6, icdAcc: 96.1, otBefore: 8.8, otAfter: 0.9, savedHrsMo: 236, status: 'Optimal', tone: 'ok' },
  { name: 'Saraf / Neurologi', docs: 5, patientsDay: 215, draftSec: 8.9, icdAcc: 95.2, otBefore: 9.1, otAfter: 1.1, savedHrsMo: 198, status: 'Optimal', tone: 'ok' },
  { name: 'Anak / Pediatri', docs: 6, patientsDay: 284, draftSec: 7.9, icdAcc: 96.0, otBefore: 8.2, otAfter: 0.7, savedHrsMo: 224, status: 'Optimal', tone: 'ok' },
  { name: 'Obstetri & Ginekologi', docs: 5, patientsDay: 210, draftSec: 8.4, icdAcc: 95.6, otBefore: 8.0, otAfter: 0.9, savedHrsMo: 182, status: 'Optimal', tone: 'ok' },
  { name: 'Paru & Respirasi', docs: 4, patientsDay: 186, draftSec: 8.1, icdAcc: 95.8, otBefore: 8.4, otAfter: 0.8, savedHrsMo: 164, status: 'Optimal', tone: 'ok' },
  { name: 'Bedah Umum', docs: 4, patientsDay: 165, draftSec: 8.7, icdAcc: 94.9, otBefore: 7.8, otAfter: 1.0, savedHrsMo: 156, status: 'Kalibrasi', tone: 'info' },
  { name: 'THT-KL', docs: 4, patientsDay: 160, draftSec: 7.8, icdAcc: 95.5, otBefore: 7.4, otAfter: 0.7, savedHrsMo: 152, status: 'Optimal', tone: 'ok' },
];

// Derived verified aggregates
const SHIFT_TOTAL = SHIFT_STATUS.signed + SHIFT_STATUS.pending + SHIFT_STATUS.coder + SHIFT_STATUS.active;
const ENCOUNTERS_SUBTOTAL_IDR = ENCOUNTERS.reduce((a, e) => a + e.tariff, 0);
const PURGE_SUBTOTAL_MB = Number(PURGE_LOGS.reduce((a, p) => a + p.ramMb, 0).toFixed(1));
const PIPELINE_TOTAL_MS = PIPELINE_SPANS.reduce((a, s) => a + s.dur, 0);
const TOTAL_DOCS = POLYCLINICS.reduce((a, p) => a + p.docs, 0);
const TOTAL_PATIENTS_DAY = POLYCLINICS.reduce((a, p) => a + p.patientsDay, 0);
const TOTAL_SAVED_HRS = POLYCLINICS.reduce((a, p) => a + p.savedHrsMo, 0);
const WEIGHTED_DRAFT_SEC =
  POLYCLINICS.reduce((a, p) => a + p.draftSec * p.patientsDay, 0) / TOTAL_PATIENTS_DAY;
const WEIGHTED_ICD_ACC =
  POLYCLINICS.reduce((a, p) => a + p.icdAcc * p.patientsDay, 0) / TOTAL_PATIENTS_DAY;

export function verifyMath() {
  // 1. Shift totals across status, payer, and hourly breakdown
  const statusSum = SHIFT_STATUS.signed + SHIFT_STATUS.pending + SHIFT_STATUS.coder + SHIFT_STATUS.active;
  const payerSum = SHIFT_PAYERS.bpjs + SHIFT_PAYERS.asuransi + SHIFT_PAYERS.umum;
  const sumH = (arr) => arr.reduce((a, b) => a + b, 0);
  const hourlySigned = sumH(HOURLY_SHIFT.signed);
  const hourlyPending = sumH(HOURLY_SHIFT.pending);
  const hourlyCoder = sumH(HOURLY_SHIFT.coder);
  const hourlyActive = sumH(HOURLY_SHIFT.active);
  const hourlyTotal = hourlySigned + hourlyPending + hourlyCoder + hourlyActive;

  if (statusSum !== 54) throw new Error(`Shift status sum mismatch: ${statusSum}`);
  if (payerSum !== statusSum) throw new Error(`Shift payer sum mismatch: ${payerSum} vs ${statusSum}`);
  if (hourlySigned !== SHIFT_STATUS.signed) throw new Error(`Hourly signed mismatch: ${hourlySigned}`);
  if (hourlyPending !== SHIFT_STATUS.pending) throw new Error(`Hourly pending mismatch: ${hourlyPending}`);
  if (hourlyCoder !== SHIFT_STATUS.coder) throw new Error(`Hourly coder mismatch: ${hourlyCoder}`);
  if (hourlyActive !== SHIFT_STATUS.active) throw new Error(`Hourly active mismatch: ${hourlyActive}`);
  if (hourlyTotal !== statusSum) throw new Error(`Hourly total mismatch: ${hourlyTotal}`);

  // 2. Encounter table subtotal & validity
  if (ENCOUNTERS.length !== 16) throw new Error(`Expected 16 encounters, got ${ENCOUNTERS.length}`);
  if (ENCOUNTERS_SUBTOTAL_IDR !== 5577400) {
    throw new Error(`ENCOUNTERS_SUBTOTAL_IDR mismatch: ${ENCOUNTERS_SUBTOTAL_IDR}`);
  }
  if (SHIFT_TOTAL_CLAIM_IDR < ENCOUNTERS_SUBTOTAL_IDR) {
    throw new Error('Shift total claim cannot be less than 16-row subtotal');
  }

  // 3. FHIR Bundle & Pipeline Waterfall consistency
  if (FHIR_RESOURCES.length !== 9) throw new Error(`Expected 9 FHIR resources, got ${FHIR_RESOURCES.length}`);
  if (PIPELINE_TOTAL_MS !== 2025) throw new Error(`PIPELINE_TOTAL_MS mismatch: ${PIPELINE_TOTAL_MS}`);
  const lastSpan = PIPELINE_SPANS[PIPELINE_SPANS.length - 1];
  if (lastSpan.start + lastSpan.dur !== PIPELINE_TOTAL_MS) {
    throw new Error(`Span end mismatch: ${lastSpan.start + lastSpan.dur} vs ${PIPELINE_TOTAL_MS}`);
  }

  // 4. Zero-retention audio purge & compliance invariant
  if (PURGE_LOGS.some((p) => p.diskKb !== 0)) throw new Error('Zero-retention violated: non-zero diskKb');
  if (PURGE_SUBTOTAL_MB !== 41.8) throw new Error(`PURGE_SUBTOTAL_MB mismatch: ${PURGE_SUBTOTAL_MB}`);
  if (COMPLIANCE_CONTROLS.some((c) => c.status !== 'LULUS')) throw new Error('Compliance control failed');

  // 5. Polyclinic rollout aggregates
  if (TOTAL_DOCS !== 42) throw new Error(`TOTAL_DOCS mismatch: ${TOTAL_DOCS}`);
  if (TOTAL_PATIENTS_DAY !== 1840) throw new Error(`TOTAL_PATIENTS_DAY mismatch: ${TOTAL_PATIENTS_DAY}`);
  if (TOTAL_SAVED_HRS !== 1624) throw new Error(`TOTAL_SAVED_HRS mismatch: ${TOTAL_SAVED_HRS}`);
  if (Number(WEIGHTED_DRAFT_SEC.toFixed(1)) !== 8.3) {
    throw new Error(`WEIGHTED_DRAFT_SEC mismatch: ${WEIGHTED_DRAFT_SEC.toFixed(2)}`);
  }
  if (Number(WEIGHTED_ICD_ACC.toFixed(1)) !== 95.8) {
    throw new Error(`WEIGHTED_ICD_ACC mismatch: ${WEIGHTED_ICD_ACC.toFixed(2)}`);
  }
}

// ============================================================================
// BESPOKE CLINICAL EMR SHELL CSS & CHROME (EPIC HYPERSPACE + MEDICAL TEAL)
// ============================================================================
const CLINICAL_CSS = `
  /* Bespoke Clinical EMR Shell — Cool Mist & Medical Teal (#0c7c66) */
  .cs-topbar {
    height: 38px;
    background: #064e40;
    color: #f0fdfa;
    border-bottom: 1px solid #04382e;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .cs-top-l, .cs-top-r {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .cs-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .cs-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #0c7c66;
    border: 1px solid #14b898;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .cs-env {
    background: #083d33;
    border: 1px solid #13856f;
    color: #86efdc;
    padding: 2px 7px;
    border-radius: 3px;
    font-family: var(--e-mono);
    font-size: 9.4px;
    font-weight: 700;
    white-space: nowrap;
  }
  .cs-hosp {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #0a5f4f;
    border: 1px solid #178671;
    color: #e6fffa;
    font-size: 10.6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .cs-pill-live {
    height: 23px;
    padding: 0 8px;
    border-radius: 3px;
    background: #053b31;
    border: 1px solid #127c68;
    color: #a7f3d0;
    font-family: var(--e-mono);
    font-size: 9.6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .cs-doc-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid #12715e;
    white-space: nowrap;
  }
  .cs-doc-av {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #0f766e;
    border: 1px solid #2dd4bf;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Epic Hyperspace Activity Tab Strip */
  .cs-tabs {
    height: 34px;
    background: #ffffff;
    border-bottom: 1px solid #c9dcd8;
    padding: 0 12px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .cs-tab-list {
    display: flex;
    align-items: stretch;
    gap: 2px;
  }
  .cs-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    font-size: 11px;
    font-weight: 600;
    color: #46635d;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .cs-tab.is-active {
    color: #085445;
    background: #f0f9f7;
    border-bottom: 2.5px solid #0c7c66;
    font-weight: 700;
  }
  .cs-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #e6f0ee;
    color: #36564f;
    font-weight: 700;
  }
  .cs-tab.is-active .cs-tab-cnt {
    background: #0c7c66;
    color: #ffffff;
  }
  .cs-tab-ctx {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10.4px;
    color: #3b5953;
    white-space: nowrap;
  }
  .cs-pt-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 3px;
    background: #f2f8f6;
    border: 1px solid #cbe0db;
    font-weight: 600;
    color: #0f2421;
  }

  /* Main body & Footer */
  .cs-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .cs-footer {
    height: 24px;
    background: #e6f0ee;
    border-top: 1px solid #bed3ce;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.6px;
    color: #36524d;
    flex-shrink: 0;
  }
  .cs-foot-grp {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cs-foot-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  /* Clinical overrides for crisp teal accents */
  .e-badge-accent {
    background: #e5f5f1;
    color: #075948;
    border-color: #9ed8cb;
  }
  .e-panel-head {
    background: #f4f9f8;
    border-bottom-color: #d0e1dd;
  }
  table.e-table th {
    background: #eef5f3;
    color: #35524c;
    border-bottom-color: #bfd4cf;
  }
  table.e-table td {
    border-bottom-color: #e4eeec;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #f9fcfb;
  }
  table.e-table tfoot td {
    background: #eaf3f1;
    border-top-color: #b7cfc9;
  }

  /* Patient StoryBoard Left Rail (Epic Hyperspace Style) */
  .sb-rail {
    width: 240px;
    background: #f5faf9;
    border-right: 1px solid #c5dad5;
    padding: 9px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .sb-card {
    background: #ffffff;
    border: 1px solid #d1e2de;
    border-radius: 4px;
    padding: 7px 8px;
  }
  .sb-sec-title {
    font-size: 9.5px;
    font-weight: 700;
    color: #46655f;
    letter-spacing: 0.03em;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sb-allergy {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-left: 3px solid #be123c;
    border-radius: 3px;
    padding: 6px 8px;
  }
  .sb-vital-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }
  .sb-vital-cell {
    background: #f6faf9;
    border: 1px solid #dce9e6;
    border-radius: 3px;
    padding: 4px 6px;
  }
  .sb-vital-cell.warn {
    background: #fffbeb;
    border-color: #fde68a;
  }

  /* Clinical Transcript & SOAP Cards */
  .tr-turn {
    padding: 6px 10px;
    border-bottom: 1px solid #e7f0ee;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .tr-turn:nth-child(even) {
    background: #fafdfc;
  }
  .tr-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-size: 9.8px;
  }
  .tr-spk-doc {
    color: #085445;
    font-weight: 700;
  }
  .tr-spk-pt {
    color: #0369a1;
    font-weight: 700;
  }
  .hl-s { background: #e6f4f0; color: #065f46; padding: 0 3px; border-radius: 2px; font-weight: 600; }
  .hl-o { background: #fffbeb; color: #92400e; padding: 0 3px; border-radius: 2px; font-weight: 600; border: 1px solid #fde68a; }
  .hl-a { background: #f0f9ff; color: #075985; padding: 0 3px; border-radius: 2px; font-weight: 600; }
  .hl-p { background: #ecfdf5; color: #047857; padding: 0 3px; border-radius: 2px; font-weight: 600; }

  .soap-box {
    border: 1px solid #d1e2de;
    border-radius: 4px;
    background: #ffffff;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .soap-box.is-warn {
    border-color: #f5c97b;
    background: #fffdf7;
  }
  .soap-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .soap-letter {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    background: #0c7c66;
    color: #ffffff;
    font-family: var(--e-mono);
    font-size: 11px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .soap-letter.warn {
    background: #b45309;
  }
  .cite-pill {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #eef5f3;
    border: 1px solid #cadcd8;
    color: #35544e;
  }

  /* Clinical JSON Inspector (Light Clinical Surface) */
  .fhir-code {
    background: #f6faf9;
    font-family: var(--e-mono);
    font-size: 10px;
    line-height: 1.44;
    padding: 8px 10px;
    color: #102a27;
    overflow: hidden;
    flex: 1;
  }
  .fc-ln { color: #8aa59f; display: inline-block; width: 22px; user-select: none; }
  .fc-k  { color: #085445; font-weight: 600; }
  .fc-s  { color: #0369a1; }
  .fc-n  { color: #b45309; font-weight: 600; }
  .fc-c  { color: #64748b; }
  .fc-hl { background: #e4f5f0; display: block; margin: 0 -10px; padding: 0 10px; border-left: 2.5px solid #0c7c66; }

  /* Hardware Tablet Frame (Page 5) */
  .tablet-bezel {
    background: #172a27;
    border: 1px solid #0e1c1a;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .tablet-screen {
    background: #f2f8f6;
    border: 1px solid #2b4944;
    border-radius: 4px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

function renderClinicalShell({ activeTab, title, bodyContent }) {
  const tabs = [
    { id: 'p1', icon: 'mic', label: 'Ruang Konsultasi & Dikte', cnt: 'LIVE' },
    { id: 'p2', icon: 'clipboardCheck', label: 'Antrean Poli & Koder ICD-10', cnt: String(SHIFT_TOTAL) },
    { id: 'p3', icon: 'code', label: 'Inspektor SATUSEHAT FHIR R4', cnt: '9 res' },
    { id: 'p4', icon: 'shield', label: 'Privasi Audio & Audit UU PDP', cnt: '0 KB' },
    { id: 'p5', icon: 'tablet', label: 'Tablet Dokter & ROI Poli', cnt: `${POLYCLINICS.length} poli` },
  ];

  const topbar = `<header class="cs-topbar">
    <div class="cs-top-l">
      <div class="cs-brand">
        <span class="cs-mark">DS</span>
        <span>DokterScribe ID</span>
      </div>
      <span class="cs-env">SIMRS TERHUBUNG · DRAF FHIR R4</span>
      <div class="cs-hosp">
        ${medIc('hospital', 12, '#86efdc')}
        <span>RSUPN Dr. Cipto Mangunkusumo · Poli Penyakit Dalam</span>
        ${ic('chevronDown', 11, '#86efdc')}
      </div>
    </div>
    <div class="cs-top-r">
      <div class="cs-pill-live">
        <span class="dot dot-ok"></span>
        <span>SignalR TLS 1.3 · Whisper Med ID v3.2</span>
      </div>
      <div class="cs-pill-live">
        ${ic('lock', 11, '#86efdc')}
        <span>Audio: Hapus Otomatis (0 KB Disk)</span>
      </div>
      <div class="cs-doc-chip">
        <span class="cs-doc-av">RK</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#ffffff;">${esc(ACTIVE_PATIENT.doctor)}</div>
          <div style="font-size:9px;color:#99e6d8;">${esc(ACTIVE_PATIENT.sip)} · Shift Pagi</div>
        </div>
      </div>
    </div>
  </header>`;

  const tabBar = `<nav class="cs-tabs">
    <div class="cs-tab-list">
      ${tabs
        .map((t) => {
          const act = t.id === activeTab;
          return `<div class="cs-tab ${act ? 'is-active' : ''}">
            ${medIc(t.icon, 13, act ? '#0c7c66' : '#5b7872')}
            <span>${esc(t.label)}</span>
            <span class="cs-tab-cnt">${esc(t.cnt)}</span>
          </div>`;
        })
        .join('')}
    </div>
    <div class="cs-tab-ctx">
      <div class="cs-pt-chip">
        ${medIc('stethoscope', 12, '#0c7c66')}
        <span>${esc(ACTIVE_PATIENT.name)}</span>
        <span class="mono" style="color:#46655f;font-size:10px;">RM ${esc(ACTIVE_PATIENT.rm)}</span>
      </div>
      <span class="mono" style="font-size:10px;color:#46655f;">22 Nov 2026 · 11:04 WIB</span>
    </div>
  </nav>`;

  const footer = `<footer class="cs-footer">
    <div class="cs-foot-grp">
      <span class="cs-foot-item"><span class="dot dot-ok"></span>SIMRS HL7/FHIR Bridge: Terhubung (18 ms)</span>
      <span class="cs-foot-item"><span class="dot dot-ok"></span>SATUSEHAT R4 OAuth2: Valid (JKT-OnPrem)</span>
      <span class="cs-foot-item">Whisper Medical ID: WER 3,1% · Latensi Draf 8,2 dtk</span>
    </div>
    <div class="cs-foot-grp">
      <span class="cs-foot-item">Kepatuhan: UU PDP No. 27/2022 · PMK 24/2022 · ICD-10 / KFA</span>
      <span class="cs-foot-item">TTE BSrE: Aktif</span>
    </div>
  </footer>`;

  return wrapEnterpriseHtml({
    title: `DokterScribe ID — ${title}`,
    accent: '#0c7c66',
    accentSoft: '#e5f5f1',
    accentInk: '#075948',
    bg: '#eef5f3',
    surface: '#ffffff',
    surface2: '#f4f9f8',
    border: '#cfe0dc',
    borderStrong: '#b5cbc6',
    text: '#0f2421',
    text2: '#35524c',
    muted: '#57736d',
    extraCss: CLINICAL_CSS,
    bodyHtml: `${topbar}${tabBar}<main class="cs-body">${bodyContent}</main>${footer}`,
  });
}

// ============================================================================
// CUSTOM CLINICAL VECTOR SVGs (WAVEFORM, ZERO-RETENTION ARCHITECTURE, QR)
// ============================================================================
function svgClinicalWaveform({ width = 406, height = 74 }) {
  // Deterministic dual-channel speaker diarization bars (Doctor teal, Patient slate-blue)
  const docHeights = [6, 14, 22, 18, 10, 4, 2, 2, 3, 2, 2, 12, 20, 24, 16, 8, 3, 2, 2, 2, 15, 21, 19, 12, 5, 2, 2, 11, 22, 26, 20, 14, 18, 24, 16, 10, 14, 22, 18, 12, 8];
  const ptHeights  = [2, 2, 3, 2, 4, 14, 22, 25, 19, 12, 6, 2, 2, 3, 2, 8, 18, 24, 20, 14, 3, 2, 2, 3, 14, 23, 18, 4, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2];
  const count = docHeights.length;
  const padL = 44;
  const padR = 8;
  const plotW = width - padL - padR;
  const step = plotW / count;

  let bars = '';
  for (let i = 0; i < count; i++) {
    const x = padL + i * step + 1;
    const bw = Math.max(3, step - 3);
    const dh = docHeights[i];
    const ph = ptHeights[i];
    bars += `<rect x="${x.toFixed(1)}" y="${(25 - dh / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${dh}" rx="1" fill="${dh > 5 ? '#0c7c66' : '#cbe0db'}" />`;
    bars += `<rect x="${x.toFixed(1)}" y="${(50 - ph / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${ph}" rx="1" fill="${ph > 5 ? '#0369a1' : '#d2e2ec'}" />`;
  }

  // Entity marker ticks along top ruler
  const tags = [
    { x: padL + 5.5 * step, lbl: 'S', c: '#0c7c66' },
    { x: padL + 16.5 * step, lbl: 'O', c: '#b45309' },
    { x: padL + 28.5 * step, lbl: 'A', c: '#0369a1' },
    { x: padL + 36.5 * step, lbl: 'P', c: '#047857' },
  ];
  const tagSvg = tags
    .map(
      (t) => `<line x1="${t.x.toFixed(1)}" y1="11" x2="${t.x.toFixed(1)}" y2="62" stroke="${t.c}" stroke-width="1" stroke-dasharray="2,2" />
      <rect x="${(t.x - 7).toFixed(1)}" y="1" width="14" height="11" rx="2" fill="${t.c}" />
      <text x="${t.x.toFixed(1)}" y="9.2" text-anchor="middle" font-size="8" font-weight="700" font-family="Consolas,monospace" fill="#ffffff">${t.lbl}</text>`
    )
    .join('');

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">
    <rect x="0" y="0" width="${width}" height="${height}" fill="#f6faf9" />
    <line x1="${padL}" y1="25" x2="${width - padR}" y2="25" stroke="#dce9e6" stroke-width="1" />
    <line x1="${padL}" y1="50" x2="${width - padR}" y2="50" stroke="#dce9e6" stroke-width="1" />
    <text x="4" y="28" font-size="8.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#085445">Dokter</text>
    <text x="4" y="53" font-size="8.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0369a1">Pasien</text>
    ${bars}
    ${tagSvg}
    <text x="${padL}" y="71" font-size="8.2" font-family="Consolas,monospace" fill="#5b7872">00:00</text>
    <text x="${(padL + plotW * 0.33).toFixed(1)}" y="71" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#5b7872">01:25</text>
    <text x="${(padL + plotW * 0.66).toFixed(1)}" y="71" text-anchor="middle" font-size="8.2" font-family="Consolas,monospace" fill="#5b7872">02:50</text>
    <text x="${width - padR}" y="71" text-anchor="end" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#0c7c66">04:18 LIVE</text>
  </svg>`;
}

function svgZeroRetentionArchitecture() {
  return `<svg viewBox="0 0 804 294" width="100%" height="294" style="display:block;">
    <defs>
      <marker id="arrTeal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0c7c66" />
      </marker>
      <marker id="arrRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#be123c" />
      </marker>
      <marker id="arrBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0369a1" />
      </marker>
    </defs>

    <!-- On-Premise Hospital Sovereign Boundary -->
    <rect x="172" y="8" width="444" height="202" rx="4" fill="#f2faf8" stroke="#0c7c66" stroke-width="1.2" stroke-dasharray="5,3" />
    <rect x="182" y="2" width="276" height="15" rx="2" fill="#064e40" />
    <text x="190" y="12.5" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#a7f3d0">ZONA ON-PREMISE RSUPN (0 EGRESS AUDIO KE CLOUD)</text>

    <!-- Node 1: Mikrofon Meja Dokter -->
    <rect x="10" y="42" width="136" height="92" rx="4" fill="#ffffff" stroke="#b5cbc6" stroke-width="1.2" />
    <rect x="10" y="42" width="136" height="20" rx="3" fill="#0c7c66" />
    <text x="18" y="55" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ffffff">1. Meja Dokter / Tablet</text>
    <text x="18" y="76" font-size="9" font-weight="600" font-family="Segoe UI,sans-serif" fill="#0f2421">PCM 16 kHz Mono</text>
    <text x="18" y="90" font-size="8.5" font-family="Consolas,monospace" fill="#46655f">SRTP / TLS 1.3</text>
    <text x="18" y="104" font-size="8.5" font-family="Consolas,monospace" fill="#46655f">Consent: Signed</text>
    <text x="18" y="120" font-size="8.3" font-weight="700" font-family="Segoe UI,sans-serif" fill="#047857">Tanpa Cache Lokal</text>

    <!-- Arrow 1 -> 2 -->
    <line x1="146" y1="88" x2="184" y2="88" stroke="#0c7c66" stroke-width="1.6" marker-end="url(#arrTeal)" />
    <text x="165" y="81" text-anchor="middle" font-size="7.8" font-family="Consolas,monospace" fill="#085445">WSS</text>

    <!-- Node 2: SignalR Ephemeral RAM Hub -->
    <rect x="188" y="34" width="194" height="108" rx="4" fill="#ffffff" stroke="#0c7c66" stroke-width="1.4" />
    <rect x="188" y="34" width="194" height="20" rx="3" fill="#085445" />
    <text x="196" y="47" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ffffff">2. .NET 9 SignalR Ephemeral Hub</text>
    <text x="196" y="68" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0f2421">RAM Ring-Buffer (mlockall)</text>
    <text x="196" y="82" font-size="8.4" font-family="Consolas,monospace" fill="#46655f">Enkripsi: AES-256-GCM Ephemeral</text>
    <text x="196" y="96" font-size="8.4" font-family="Consolas,monospace" fill="#46655f">Swap: DISABLED · Hard TTL: 20m</text>
    <rect x="196" y="106" width="178" height="26" rx="3" fill="#fff1f2" stroke="#fecdd3" />
    <text x="203" y="117" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#be123c">TRIGGER TTD -&gt; ZeroizeMemory()</text>
    <text x="203" y="128" font-size="8" font-family="Segoe UI,sans-serif" fill="#9f1239">Kunci sesi dimusnahkan 45 ms pasca-TTD</text>

    <!-- Arrow 2 -> 3 -->
    <line x1="382" y1="88" x2="416" y2="88" stroke="#0c7c66" stroke-width="1.6" marker-end="url(#arrTeal)" />
    <text x="399" y="81" text-anchor="middle" font-size="7.8" font-family="Consolas,monospace" fill="#085445">IPC</text>

    <!-- Node 3: Whisper Medical ID + Clinical NER -->
    <rect x="420" y="34" width="184" height="108" rx="4" fill="#ffffff" stroke="#b5cbc6" stroke-width="1.2" />
    <rect x="420" y="34" width="184" height="20" rx="3" fill="#0369a1" />
    <text x="428" y="47" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ffffff">3. Whisper Med ID &amp; SOAP NER</text>
    <text x="428" y="68" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0f2421">GPU On-Premise (H100 ID)</text>
    <text x="428" y="82" font-size="8.4" font-family="Consolas,monospace" fill="#46655f">Diarisasi Dokter / Pasien</text>
    <text x="428" y="96" font-size="8.4" font-family="Consolas,monospace" fill="#46655f">Output: Teks SOAP + ICD-10</text>
    <text x="428" y="112" font-size="8.4" font-family="Consolas,monospace" fill="#047857">Disk Write: 0 byte (Read-Only FS)</text>
    <text x="428" y="126" font-size="8.4" font-family="Consolas,monospace" fill="#047857">Training Opt-Out: Enforced</text>

    <!-- Blocked Disk Storage Callout inside On-Prem -->
    <rect x="232" y="158" width="372" height="40" rx="3" fill="#fff1f2" stroke="#be123c" stroke-width="1.2" stroke-dasharray="3,2" />
    <text x="242" y="174" font-size="8.8" font-weight="700" font-family="Segoe UI,sans-serif" fill="#be123c">DIBLOKIR: Penyimpanan Audio Disk / S3 / NAS (0 KB)</text>
    <text x="242" y="188" font-size="8" font-family="Consolas,monospace" fill="#881337">syscall open()/write() audio diblokir AppArmor + tmpfs non-persistent</text>
    <line x1="295" y1="142" x2="295" y2="158" stroke="#be123c" stroke-width="1.2" stroke-dasharray="2,2" />
    <line x1="512" y1="142" x2="512" y2="158" stroke="#be123c" stroke-width="1.2" stroke-dasharray="2,2" />

    <!-- Arrow 3 -> 4 (SIMRS & SATUSEHAT) -->
    <line x1="604" y1="76" x2="646" y2="76" stroke="#0369a1" stroke-width="1.6" marker-end="url(#arrBlue)" />
    <rect x="611" y="59" width="28" height="13" rx="2" fill="#ffffff" stroke="#bae6fd" stroke-width="0.8" />
    <text x="625" y="68.5" text-anchor="middle" font-size="7.8" font-weight="700" font-family="Consolas,monospace" fill="#0369a1">FHIR</text>

    <!-- Node 4: Signed EMR & SATUSEHAT -->
    <rect x="650" y="34" width="144" height="84" rx="4" fill="#ffffff" stroke="#0369a1" stroke-width="1.2" />
    <rect x="650" y="34" width="144" height="20" rx="3" fill="#075985" />
    <text x="658" y="47" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ffffff">4. SIMRS &amp; SATUSEHAT</text>
    <text x="658" y="68" font-size="8.6" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0f2421">Hanya EMR Tertandatangan</text>
    <text x="658" y="82" font-size="8.2" font-family="Consolas,monospace" fill="#46655f">SOAP + ICD-10 + KFA</text>
    <text x="658" y="96" font-size="8.2" font-family="Consolas,monospace" fill="#46655f">TTE BSrE + Consent ID</text>
    <text x="658" y="110" font-size="8.2" font-weight="700" font-family="Consolas,monospace" fill="#047857">HTTP 201 Created</text>

    <!-- Arrow 2 -> 5 (WORM Audit Receipt) -->
    <path d="M 218 142 L 218 248 L 646 248" fill="none" stroke="#be123c" stroke-width="1.4" stroke-dasharray="4,2" marker-end="url(#arrRed)" />
    <rect x="272" y="236" width="296" height="22" rx="3" fill="#ffffff" stroke="#f5c97b" />
    <text x="282" y="250" font-size="8.5" font-weight="700" font-family="Consolas,monospace" fill="#92400e">Bukti Kriptografis: SHA-256(SessionKey + WipeTimestamp)</text>

    <!-- Node 5: WORM Destruction Ledger -->
    <rect x="650" y="212" width="144" height="72" rx="4" fill="#ffffff" stroke="#047857" stroke-width="1.3" />
    <rect x="650" y="212" width="144" height="20" rx="3" fill="#047857" />
    <text x="658" y="225" font-size="9" font-weight="700" font-family="Segoe UI,sans-serif" fill="#ffffff">5. WORM Audit Ledger</text>
    <text x="658" y="245" font-size="8.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0f2421">Bukti Hapus Append-Only</text>
    <text x="658" y="259" font-size="8.2" font-family="Consolas,monospace" fill="#46655f">Retensi Bukti: 5 Tahun</text>
    <text x="658" y="273" font-size="8.2" font-family="Consolas,monospace" fill="#047857">Siap Inspeksi DPO / BSSN</text>

    <!-- Legend Bottom Left -->
    <rect x="10" y="224" width="186" height="60" rx="3" fill="#ffffff" stroke="#cfe0dc" />
    <text x="18" y="238" font-size="8.5" font-weight="700" font-family="Segoe UI,sans-serif" fill="#0f2421">Kunci Aliran Data</text>
    <line x1="18" y1="250" x2="38" y2="250" stroke="#0c7c66" stroke-width="2" />
    <text x="44" y="253" font-size="8.2" font-family="Segoe UI,sans-serif" fill="#35524c">Audio RAM Terenkripsi</text>
    <line x1="18" y1="264" x2="38" y2="264" stroke="#0369a1" stroke-width="2" />
    <text x="44" y="267" font-size="8.2" font-family="Segoe UI,sans-serif" fill="#35524c">Teks Terstruktur FHIR R4</text>
    <line x1="18" y1="278" x2="38" y2="278" stroke="#be123c" stroke-width="1.5" stroke-dasharray="3,2" />
    <text x="44" y="281" font-size="8.2" font-family="Segoe UI,sans-serif" fill="#35524c">Event Zeroize &amp; Hash WORM</text>
  </svg>`;
}

function svgQrCode(size = 86) {
  // Deterministic crisp vector QR code matrix (15x15) representing SATUSEHAT Mobile AVS link
  const pattern = [
    '111110101011111',
    '100010010010001',
    '101010111010101',
    '100010100010001',
    '111110101011111',
    '000000011000000',
    '101101101101011',
    '010010010010100',
    '110111011011010',
    '000000101100101',
    '111110010110110',
    '100010110001001',
    '101010101110111',
    '100010010011010',
    '111110111001101',
  ];
  const cell = size / 15;
  let rects = '';
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (pattern[r][c] === '1') {
        rects += `<rect x="${(c * cell).toFixed(1)}" y="${(r * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="#064e40" />`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;background:#ffffff;border:3px solid #ffffff;border-radius:2px;">${rects}</svg>`;
}

// ============================================================================
// PAGE 1: RUANG KONSULTASI & DIKTE SOAP REAL-TIME (EPIC HYPERSPACE STYLE)
// ============================================================================
function renderPage1() {
  const transcript = [
    { t: '00:12', spk: 'Dokter', isDoc: true, soap: 'S', text: 'Selamat pagi Pak Bambang, bagaimana kondisi dua minggu terakhir sejak kontrol terakhir?' },
    { t: '00:24', spk: 'Pasien', isDoc: false, soap: 'S', html: 'Pagi Dok. Ini saya <span class="hl-s">sering haus 2 minggu</span> terakhir, malam sering bangun kencing, sama <span class="hl-s">kesemutan di kedua kaki malam hari</span>.' },
    { t: '00:52', spk: 'Dokter', isDoc: true, soap: 'S', html: 'Baik, <span class="hl-s">KU</span> polidipsia dan parestesia pedis. Obat rutin Metformin dan Amlodipine diminum teratur?' },
    { t: '01:15', spk: 'Pasien', isDoc: false, soap: 'S', html: 'Seminggu terakhir Metformin agak bolong Dok, stok habis. <span class="hl-s">RPD</span> saya memang kencing manis dan darah tinggi.' },
    { t: '01:48', spk: 'Dokter', isDoc: true, soap: 'O', html: 'Saya cek hasil triage perawat tadi: <span class="hl-o">TD 142/88 mmHg</span>, <span class="hl-o">GDP 214 mg/dL</span>, dan <span class="hl-o">IMT 27,4</span>. Nadi 82, saturasi 98%.' },
    { t: '02:26', spk: 'Dokter', isDoc: true, soap: 'O', html: 'Tes monofilamen di telapak kaki kanan-kiri terasa agak berkurang ya Pak? Jantung dan paru suara napas bersih.' },
    { t: '03:04', spk: 'Dokter', isDoc: true, soap: 'A', html: 'Kesimpulan hari ini <span class="hl-a">DM Tipe 2 tanpa komplikasi (E11.9)</span> gula darah belum terkontrol, dan <span class="hl-a">Hipertensi esensial (I10)</span>.' },
    { t: '03:46', spk: 'Dokter', isDoc: true, soap: 'P', html: 'Resep saya lanjutkan <span class="hl-p">Metformin 500mg 2x1</span> sesudah makan, <span class="hl-p">Amlodipine 5mg 1x1</span> pagi, tambah Mecobalamin, dan <span class="hl-p">cek HbA1c</span> sebelum kontrol 2 minggu lagi.' },
    { t: '04:08', spk: 'Pasien', isDoc: false, soap: 'P', html: 'Baik Dok, terima kasih. Nanti saya tebus obatnya di farmasi dan daftar <span class="hl-p">cek lab HbA1c</span> sebelum kontrol tanggal 6.' },
  ];

  const storyboard = `<aside class="sb-rail">
    <!-- Patient Header Card -->
    <div class="sb-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div style="width:32px;height:32px;border-radius:4px;background:#0c7c66;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ACTIVE_PATIENT.initials}</div>
        <div style="min-width:0;">
          <div style="font-size:12px;font-weight:700;color:#0f2421;" class="trunc">${esc(ACTIVE_PATIENT.name)}</div>
          <div style="font-size:9.8px;color:#46655f;">${esc(ACTIVE_PATIENT.sexAge)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:64px 1fr;row-gap:2px;font-size:9.8px;">
        <span style="color:#57736d;">No. RM</span><span class="mono" style="font-weight:700;">${esc(ACTIVE_PATIENT.rm)}</span>
        <span style="color:#57736d;">IHS ID</span><span class="mono">${esc(ACTIVE_PATIENT.ihsId)}</span>
        <span style="color:#57736d;">BPJS JKN</span><span class="mono" style="font-size:9.3px;">${esc(ACTIVE_PATIENT.bpjs)}</span>
        <span style="color:#57736d;">No. SEP</span><span class="mono" style="font-size:9.2px;">${esc(ACTIVE_PATIENT.sep)}</span>
      </div>
    </div>

    <!-- Allergy Alert -->
    <div class="sb-allergy">
      <div style="display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:800;color:#be123c;">
        ${ic('alert', 11, '#be123c')}
        <span>ALERGI OBAT TERCATAT</span>
      </div>
      <div style="font-size:10.5px;font-weight:700;color:#881337;margin-top:2px;">${esc(ACTIVE_PATIENT.allergy)}</div>
      <div style="font-size:9.5px;color:#9f1239;">${esc(ACTIVE_PATIENT.allergyReaction)}</div>
    </div>

    <!-- Vital Signs Triage -->
    <div class="sb-card">
      <div class="sb-sec-title">
        <span>TANDA VITAL TRIAGE</span>
        <span class="mono" style="font-size:9px;color:#57736d;">10:52 WIB</span>
      </div>
      <div class="sb-vital-grid">
        <div class="sb-vital-cell warn">
          <div style="font-size:9px;color:#92400e;font-weight:600;">TD (mmHg)</div>
          <div class="mono" style="font-size:12px;font-weight:800;color:#b45309;">142/88</div>
        </div>
        <div class="sb-vital-cell warn">
          <div style="font-size:9px;color:#92400e;font-weight:600;">GDP (mg/dL)</div>
          <div class="mono" style="font-size:12px;font-weight:800;color:#b45309;">214</div>
        </div>
        <div class="sb-vital-cell">
          <div style="font-size:9px;color:#57736d;">Nadi / RR</div>
          <div class="mono" style="font-size:11px;font-weight:700;">82 / 18</div>
        </div>
        <div class="sb-vital-cell">
          <div style="font-size:9px;color:#57736d;">Suhu / SpO2</div>
          <div class="mono" style="font-size:11px;font-weight:700;">36,6° / 98%</div>
        </div>
        <div class="sb-vital-cell warn">
          <div style="font-size:9px;color:#92400e;font-weight:600;">IMT (kg/m²)</div>
          <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">27,4</div>
        </div>
        <div class="sb-vital-cell">
          <div style="font-size:9px;color:#57736d;">Skor Nyeri</div>
          <div class="mono" style="font-size:11px;font-weight:700;">2 / 10</div>
        </div>
      </div>
    </div>

    <!-- Active Problems (RPD) -->
    <div class="sb-card">
      <div class="sb-sec-title">
        <span>MASALAH AKTIF (RPD)</span>
        <span class="mono" style="font-size:9px;">3 ICD-10</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;font-size:10px;">
        <div style="display:flex;justify-content:space-between;gap:4px;">
          <span class="trunc"><strong>E11.9</strong> DM Tipe 2</span>
          <span class="mono" style="color:#57736d;font-size:9.3px;">2021</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:4px;">
          <span class="trunc"><strong>I10</strong> Hipertensi Esensial</span>
          <span class="mono" style="color:#57736d;font-size:9.3px;">2022</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:4px;">
          <span class="trunc"><strong>E78.0</strong> Dislipidemia Ringan</span>
          <span class="mono" style="color:#57736d;font-size:9.3px;">2023</span>
        </div>
      </div>
    </div>

    <!-- Lab Trends -->
    <div class="sb-card">
      <div class="sb-sec-title">
        <span>TREN LAB KLINIS (6 BLN)</span>
        <span class="mono" style="font-size:9px;">LIS</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div>
            <div style="font-size:9.5px;color:#57736d;">HbA1c (Target &lt;7%)</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;">8,4% <span style="font-size:9px;font-weight:500;">(↑0,5)</span></div>
          </div>
          ${svgSparkline({ points: [7.6, 7.8, 7.9, 8.1, 8.4], width: 72, height: 22, color: '#b45309' })}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div>
            <div style="font-size:9.5px;color:#57736d;">GDP Serial (mg/dL)</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;">214 <span style="font-size:9px;font-weight:500;">(↑18)</span></div>
          </div>
          ${svgSparkline({ points: [158, 172, 184, 196, 214], width: 72, height: 22, color: '#be123c' })}
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:4px;border-top:1px solid #e6f0ee;font-size:9.6px;">
          <span>eGFR: <strong class="mono" style="color:#047857;">86</strong></span>
          <span>Kreat: <strong class="mono">0,94</strong></span>
          <span>LDL: <strong class="mono">118</strong></span>
        </div>
      </div>
    </div>

    <!-- Routine Meds -->
    <div class="sb-card">
      <div class="sb-sec-title">
        <span>OBAT RUTIN AKTIF (KFA)</span>
        <span class="mono" style="font-size:9px;">3 item</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;font-size:9.8px;">
        <div style="display:flex;justify-content:space-between;"><span>Metformin 500 mg</span><span class="mono" style="color:#085445;font-weight:600;">2x1 pc</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Amlodipine 5 mg</span><span class="mono" style="color:#085445;font-weight:600;">1x1 pagi</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Simvastatin 10 mg</span><span class="mono" style="color:#46655f;">1x1 mlm</span></div>
      </div>
    </div>

    <!-- Consent Box -->
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:6px 8px;margin-top:auto;">
      <div style="display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;color:#047857;">
        ${ic('checkCircle', 11, '#047857')}
        <span>Consent UU PDP Terverifikasi</span>
      </div>
      <div style="font-size:9.2px;color:#065f46;margin-top:2px;">Audio hanya di RAM · Hapus otomatis saat dokter klik TTD.</div>
    </div>
  </aside>`;

  const workspace = `<div style="flex:1;min-width:0;min-height:0;padding:9px 11px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">
    <!-- Encounter Action Header -->
    <div style="height:48px;background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
      <div style="min-width:0;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="font-size:13px;font-weight:700;color:#0f2421;">DokterScribe · Poli Penyakit Dalam</span>
          ${badge('ENCOUNTER #08412', 'accent')}
          ${badge('BPJS JKN · RAWAT JALAN', 'neutral')}
        </div>
        <div style="font-size:10px;color:#57736d;margin-top:1px;">Konsultasi aktif sejak 10:58 WIB · Durasi dikte <strong class="mono" style="color:#0f2421;">04:18</strong> · Ruang Periksa 04</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="display:flex;align-items:center;gap:6px;background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 9px;">
          <div style="text-align:right;line-height:1.2;">
            <div style="font-size:9px;color:#57736d;">Waktu Draf</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#047857;">8,2 dtk</div>
          </div>
          <div style="width:1px;height:22px;background:#cfe0dc;"></div>
          <div style="text-align:right;line-height:1.2;">
            <div style="font-size:9px;color:#57736d;">Kode ICD-10</div>
            <div class="mono" style="font-size:11.5px;font-weight:700;color:#085445;">E11.9 / I10</div>
          </div>
          <div style="width:1px;height:22px;background:#cfe0dc;"></div>
          <div style="text-align:right;line-height:1.2;">
            <div style="font-size:9px;color:#57736d;">Status Audio</div>
            <div style="font-size:10.5px;font-weight:700;color:#35524c;">Hapus otomatis</div>
          </div>
        </div>
        <div class="e-btn">${ic('refresh', 11, '#085445')}<span>Cek Ulang ICD-10</span></div>
        <div class="e-btn e-btn-primary">${medIc('penSign', 11, '#ffffff')}<span>Tanda Tangan &amp; Kirim FHIR</span></div>
      </div>
    </div>

    <!-- 3-Column Clinical Grid -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:420px 1fr 340px;gap:9px;">
      <!-- Col 1: Live SignalR Audio & Diarized Transcript -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${medIc('waveform', 13, '#0c7c66')}
            <span>Transkrip Medis Real-Time (Bahasa ID)</span>
          </div>
          ${badge('SIGNALR · RAM 4,1 MB', 'ok')}
        </div>
        <div class="e-panel-body-flush">
          <div style="padding:7px 9px 5px;border-bottom:1px solid #d5e5e1;background:#f6faf9;flex-shrink:0;">
            ${svgClinicalWaveform({ width: 400, height: 74 })}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;font-size:9.4px;color:#46655f;">
              <span><strong>NER Aktif:</strong> <span class="hl-s">S</span> Keluhan · <span class="hl-o">O</span> Vital · <span class="hl-a">A</span> Diagnosis · <span class="hl-p">P</span> Terapi</span>
              <span class="mono">WER 3,1%</span>
            </div>
          </div>
          <div style="flex:1;min-height:0;overflow:hidden;">
            ${transcript
              .map(
                (item) => `<div class="tr-turn">
                  <div class="tr-meta">
                    <span><span class="mono" style="color:#57736d;margin-right:5px;">[${item.t}]</span><span class="${item.isDoc ? 'tr-spk-doc' : 'tr-spk-pt'}">${item.spk}</span></span>
                    <span class="cite-pill">→ ${item.soap}</span>
                  </div>
                  <div style="font-size:10.5px;line-height:1.38;color:#142f2b;">${item.html || esc(item.text)}</div>
                </div>`
              )
              .join('')}
          </div>
          <div style="height:34px;padding:0 10px;background:#f0f7f5;border-top:1px solid #cfe0dc;display:flex;align-items:center;justify-content:space-between;font-size:9.6px;color:#35524c;flex-shrink:0;">
            <span><strong>14</strong> singkatan klinis ID dipetakan (OS, KU, TD, RPD, GDP)</span>
            <span class="mono" style="color:#047857;font-weight:700;">0 KB Disk</span>
          </div>
        </div>
      </section>

      <!-- Col 2: Structured SOAP NoteWriter -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${medIc('clipboardCheck', 13, '#0c7c66')}
            <span>Draf Catatan SOAP Terstruktur (Siap TTD)</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            ${badge('4/4 Lengkap', 'ok')}
            ${badge('FHIR R4 Ready', 'accent')}
          </div>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:7px;">
          <!-- S -->
          <div class="soap-box">
            <div class="soap-head">
              <div style="display:flex;align-items:center;gap:6px;">
                <span class="soap-letter">S</span>
                <strong style="font-size:11.2px;">Subjective — Keluhan Utama &amp; Anamnesis</strong>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span class="cite-pill">[00:24]</span>
                <span class="cite-pill">[01:15]</span>
                ${badge('Terverifikasi · ID-Med', 'ok')}
              </div>
            </div>
            <div style="font-size:10.7px;line-height:1.42;color:#17332e;">
              <strong>Keluhan Utama:</strong> OS mengeluh <strong>sering haus 2 minggu</strong> terakhir disertai nokturia (3–4x/malam) dan <strong>kesemutan pada kedua kaki malam hari</strong>. Kepatuhan Metformin kurang teratur 7 hari terakhir (obat habis).
            </div>
            <div style="font-size:10.1px;color:#46655f;display:flex;gap:12px;">
              <span><strong>RPD:</strong> DM Tipe 2 (2021), Hipertensi esensial (2022)</span>
              <span><strong>Alergi:</strong> Sulfonamida</span>
            </div>
          </div>

          <!-- O -->
          <div class="soap-box is-warn">
            <div class="soap-head">
              <div style="display:flex;align-items:center;gap:6px;">
                <span class="soap-letter warn">O</span>
                <strong style="font-size:11.2px;">Objective — Tanda Vital &amp; Pemeriksaan Fisik</strong>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span class="cite-pill">[01:48]</span>
                <span class="cite-pill">[02:26]</span>
                ${badge('GDP Tinggi · FHIR Obs', 'warn')}
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:2px 0;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:3px 6px;">
                <div style="font-size:8.8px;color:#92400e;">Tekanan Darah</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">142/88 mmHg</div>
              </div>
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:3px 6px;">
                <div style="font-size:8.8px;color:#92400e;">GDP (Puasa)</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">214 mg/dL</div>
              </div>
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:3px 6px;">
                <div style="font-size:8.8px;color:#92400e;">IMT</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#b45309;">27,4 kg/m²</div>
              </div>
              <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:3px 6px;">
                <div style="font-size:8.8px;color:#57736d;">Nadi · SpO2</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#0f2421;">82 · 98%</div>
              </div>
            </div>
            <div style="font-size:10.5px;line-height:1.4;color:#17332e;">
              <strong>KU:</strong> Tampak sakit ringan, kompos mentis (GCS E4V5M6). Cor/Pulmo dalam batas normal. <strong>Ekstremitas:</strong> sensibilitas monofilamen 10g menurun ringan bilateral distal pedis; ulkus (-), edema (-).
            </div>
          </div>

          <!-- A -->
          <div class="soap-box">
            <div class="soap-head">
              <div style="display:flex;align-items:center;gap:6px;">
                <span class="soap-letter">A</span>
                <strong style="font-size:11.2px;">Assessment — Diagnosis Kerja &amp; Koding Klinis</strong>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span class="cite-pill">[03:04]</span>
                ${badge('E11.9, I10 · INA-CBG', 'ok')}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:10.6px;color:#17332e;">
              <div style="display:flex;align-items:center;justify-content:space-between;background:#f4f9f8;padding:4px 7px;border-radius:3px;border:1px solid #d5e5e1;">
                <span><strong>Utama:</strong> DM Tipe 2 tanpa komplikasi (glikemik belum terkontrol)</span>
                <span class="mono" style="font-weight:700;color:#085445;">E11.9</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;background:#f4f9f8;padding:4px 7px;border-radius:3px;border:1px solid #d5e5e1;">
                <span><strong>Sekunder:</strong> Hipertensi esensial (primer) belum capai target &lt;130/80</span>
                <span class="mono" style="font-weight:700;color:#085445;">I10</span>
              </div>
              <div style="font-size:9.8px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:3px 7px;">
                <strong>Catatan CDI Koder:</strong> Evaluasi neuropati diabetik (<strong>E11.40</strong>) pada kontrol lanjutan bila parestesia menetap.
              </div>
            </div>
          </div>

          <!-- P -->
          <div class="soap-box" style="flex:1;justify-content:space-between;">
            <div>
              <div class="soap-head" style="margin-bottom:4px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="soap-letter">P</span>
                  <strong style="font-size:11.2px;">Plan — Terapi e-Resep KFA, Penunjang &amp; Kontrol</strong>
                </div>
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="cite-pill">[03:46]</span>
                  ${badge('e-Resep Siap · Kode KFA', 'ok')}
                </div>
              </div>
              <div style="font-size:10.5px;line-height:1.42;color:#17332e;">
                <strong>1. Terapi:</strong> Metformin HCl 500 mg (2x1 pc, 60 tab) · Amlodipine 5 mg (1x1 pagi, 30 tab) · Mecobalamin 500 mcg (1x1, 30 kap).<br/>
                <strong>2. Lab Penunjang:</strong> Cek <strong>HbA1c</strong>, GDP/GD2PP, Profil Lipid, dan Kreatinin/eGFR.<br/>
                <strong>3. Edukasi &amp; Kontrol:</strong> Kepatuhan obat, diet DM 1.700 kkal, perawatan kaki diabetik, kontrol Poli Dalam <strong>14 hari (6 Des 2026)</strong>.
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px;">
                <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 6px;">
                  <div style="font-size:8.8px;color:#57736d;">Order Lab LIS</div>
                  <div class="mono" style="font-size:9.8px;font-weight:700;color:#085445;">HbA1c · GDP · Lipid</div>
                </div>
                <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 6px;">
                  <div style="font-size:8.8px;color:#57736d;">Antrean e-Resep Farmasi</div>
                  <div class="mono" style="font-size:9.8px;font-weight:700;color:#085445;">3 Item KFA Siap</div>
                </div>
                <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 6px;">
                  <div style="font-size:8.8px;color:#57736d;">Surat Kontrol BPJS</div>
                  <div class="mono" style="font-size:9.8px;font-weight:700;color:#085445;">6 Des 2026 (R.04)</div>
                </div>
              </div>
            </div>
            <div style="margin-top:6px;padding:5px 7px;background:#0f2421;color:#d1fae5;border-radius:3px;font-family:var(--e-mono);font-size:9.4px;line-height:1.35;">
              FHIR MedicationRequest: KFA 93000412 (Metformin HCl 500 mg) | Condition: ICD-10 E11.9 | Consent: Signed
            </div>
          </div>
        </div>
      </section>

      <!-- Col 3: ICD-10 Coding, e-Resep KFA & FHIR Readiness -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <!-- ICD-10 & INA-CBG Panel -->
        <section class="e-panel" style="flex:1.18;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('layers', 13, '#0c7c66')}
              <span>Saran ICD-10 &amp; INA-CBGs</span>
            </div>
            ${badge('Q-5-44-0', 'info')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            <div style="border:1px solid #9ed8cb;background:#f0f9f7;border-radius:3px;padding:6px 7px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:800;font-size:11.5px;color:#075948;">E11.9 · Utama</span>
                ${badge('Skor 97%', 'ok')}
              </div>
              <div style="font-size:10.3px;font-weight:600;margin-top:2px;">DM Tipe 2 tanpa komplikasi</div>
              <div style="font-size:9.5px;color:#46655f;margin-top:1px;">Rasional: RPD DM2 + GDP 214 mg/dL + Metformin.</div>
            </div>

            <div style="border:1px solid #d1e2de;background:#ffffff;border-radius:3px;padding:6px 7px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:800;font-size:11.5px;color:#0f2421;">I10 · Sekunder</span>
                ${badge('Skor 95%', 'ok')}
              </div>
              <div style="font-size:10.3px;font-weight:600;margin-top:2px;">Hipertensi esensial (primer)</div>
              <div style="font-size:9.5px;color:#46655f;margin-top:1px;">Rasional: RPD HT + TD 142/88 + Amlodipine 5 mg.</div>
            </div>

            <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:3px;padding:6px 7px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:800;font-size:11px;color:#92400e;">E11.40 · Alternatif CDI</span>
                ${badge('Skor 74%', 'warn')}
              </div>
              <div style="font-size:9.6px;color:#92400e;margin-top:2px;">Kesemutan malam + monofilamen menurun (verifikasi koder).</div>
            </div>

            <div style="display:flex;justify-content:space-between;font-size:9.8px;padding:4px 6px;background:#f4f9f8;border:1px solid #d5e5e1;border-radius:3px;">
              <span>ICD-9-CM: <strong class="mono">89.03, 90.59</strong></span>
              <span>Tarif: <strong class="mono" style="color:#085445;">Rp 312.400</strong></span>
            </div>
          </div>
        </section>

        <!-- e-Resep KFA Panel -->
        <section class="e-panel" style="flex:0.95;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${medIc('pill', 13, '#0c7c66')}
              <span>e-Resep &amp; Kode KFA</span>
            </div>
            ${badge('0 Interaksi', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border:1px solid #dce9e6;border-radius:3px;">
              <div>
                <div style="font-size:10.4px;font-weight:700;">Metformin HCl 500 mg</div>
                <div class="mono" style="font-size:9.2px;color:#57736d;">KFA 93000412 · 2x1 pc · 60 tab</div>
              </div>
              ${badge('Aman', 'ok')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border:1px solid #dce9e6;border-radius:3px;">
              <div>
                <div style="font-size:10.4px;font-weight:700;">Amlodipine Besylate 5 mg</div>
                <div class="mono" style="font-size:9.2px;color:#57736d;">KFA 93001108 · 1x1 pagi · 30 tab</div>
              </div>
              ${badge('Aman', 'ok')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border:1px solid #dce9e6;border-radius:3px;">
              <div>
                <div style="font-size:10.4px;font-weight:700;">Mecobalamin 500 mcg</div>
                <div class="mono" style="font-size:9.2px;color:#57736d;">KFA 93004215 · 1x1 · 30 kap</div>
              </div>
              ${badge('Aman', 'ok')}
            </div>
            <div style="font-size:9.4px;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:4px 6px;">
              <strong>Cek Alergi Lulus:</strong> Seluruh item bebas gugus Sulfonamida.
            </div>
          </div>
        </section>

        <!-- SATUSEHAT FHIR Readiness Panel -->
        <section class="e-panel" style="flex:0.87;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('checkCircle', 13, '#0c7c66')}
              <span>Kesiapan Bundle FHIR R4</span>
            </div>
            ${badge('9/9 Valid', 'ok')}
          </div>
          <div class="e-panel-body-flush">
            <table class="e-table" style="font-size:10px;">
              <tbody>
                <tr><td style="width:140px;font-weight:600;">Encounter</td><td class="mono">AMB · R.04</td><td style="width:62px;text-align:right;">${badge('Valid', 'ok')}</td></tr>
                <tr><td style="width:140px;font-weight:600;">Condition (2)</td><td class="mono">E11.9, I10</td><td style="width:62px;text-align:right;">${badge('Valid', 'ok')}</td></tr>
                <tr><td style="width:140px;font-weight:600;">Observation (3)</td><td class="mono">TD, GDP, IMT</td><td style="width:62px;text-align:right;">${badge('Valid', 'ok')}</td></tr>
                <tr><td style="width:140px;font-weight:600;">MedicationRequest (2)</td><td class="mono">KFA 93000412</td><td style="width:62px;text-align:right;">${badge('Valid', 'ok')}</td></tr>
                <tr><td style="width:140px;font-weight:600;">Consent UU PDP</td><td class="mono">TTE BSrE</td><td style="width:62px;text-align:right;">${badge('Signed', 'ok')}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>`;

  return renderClinicalShell({
    activeTab: 'p1',
    title: meta.pages[0].title,
    bodyContent: `<div style="flex:1;min-height:0;display:flex;overflow:hidden;">${storyboard}${workspace}</div>`,
  });
}

// ============================================================================
// PAGE 2: ANTREAN POLIKLINIK SHIFT & MEJA KODER ICD-10 / INA-CBGs
// ============================================================================
function renderPage2() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Total Pasien Shift Pagi</span>${badge('40–70 TARGET', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${SHIFT_TOTAL} pasien</span>
        ${svgSparkline({ points: [7, 10, 11, 10, 7, 9], width: 64, height: 20, color: '#0c7c66' })}
      </div>
      <div class="e-kpi-foot"><span>${SHIFT_PAYERS.bpjs} BPJS JKN · ${SHIFT_PAYERS.asuransi} Asuransi · ${SHIFT_PAYERS.umum} Umum</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Rerata Waktu Draf SOAP</span>${badge('-98,1%', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">8,2 dtk</span>
        ${svgSparkline({ points: [9.4, 8.9, 8.6, 8.4, 8.3, 8.2], width: 64, height: 20, color: '#047857' })}
      </div>
      <div class="e-kpi-foot"><span>vs 7,4 mnt ketik manual · Hemat 5,8 jam/shift</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Akurasi Koding ICD-10 Awal</span>${badge('CDI AKTIF', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">96,4%</span>
        <span class="mono" style="font-size:10px;color:#b45309;font-weight:700;">4 kueri koder</span>
      </div>
      <div class="e-kpi-foot"><span>52/54 kode diterima tanpa revisi mayor</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Bundle SATUSEHAT FHIR R4</span>${badge('HTTP 201', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${SHIFT_STATUS.signed} / ${SHIFT_STATUS.signed}</span>
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">100,0%</span>
      </div>
      <div class="e-kpi-foot"><span>9 menunggu TTD dokter · 0 gagal skema</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Retensi Audio di Disk</span>${badge('UU PDP OK', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#085445;">0 byte</span>
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">38/38 Purged</span>
      </div>
      <div class="e-kpi-foot"><span>Hanya 3 sesi aktif &amp; 9 pra-TTD di RAM</span></div>
    </div>
  </div>`;

  const filterBar = `<div style="height:32px;background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span class="e-badge e-badge-accent">Semua Shift (${SHIFT_TOTAL})</span>
      <span class="e-badge e-badge-ok">Terkirim FHIR (${SHIFT_STATUS.signed})</span>
      <span class="e-badge e-badge-info">Menunggu TTD (${SHIFT_STATUS.pending})</span>
      <span class="e-badge e-badge-warn">Revisi Koder CDI (${SHIFT_STATUS.coder})</span>
      <span class="e-badge e-badge-neutral">Konsultasi Aktif (${SHIFT_STATUS.active})</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:10.4px;">
      <span style="color:#46655f;">Estimasi Klaim Shift (54 pasien): <strong class="mono" style="color:#0f2421;">${fmtIdr(SHIFT_TOTAL_CLAIM_IDR)}</strong></span>
      <div class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')}<span>Ekspor Batch INA-CBGs</span></div>
    </div>
  </div>`;

  const rowsHtml = ENCOUNTERS.map((e) => {
    const cls = e.selected ? 'is-selected' : e.warn ? 'is-warn' : '';
    return `<tr class="${cls}">
      <td class="mono" style="font-weight:700;">${esc(e.no)}</td>
      <td><div style="font-weight:700;color:#0f2421;" class="trunc">${esc(e.name)}</div><div class="mono" style="font-size:9.3px;color:#57736d;">RM ${esc(e.rm)}</div></td>
      <td><div style="font-weight:600;font-size:10px;">${esc(e.payer)}</div><div class="mono" style="font-size:9px;color:#57736d;">${esc(e.sep)}</div></td>
      <td class="trunc" title="${esc(e.cc)}">${esc(e.cc)}</td>
      <td class="mono" style="font-weight:700;color:#085445;">${esc(e.icd)}</td>
      <td><span class="mono" style="font-size:9.8px;color:#46655f;">${esc(e.cbg)}</span> · <strong class="mono">${fmtIdr(e.tariff)}</strong></td>
      <td class="num mono">${e.draftSec.toFixed(1).replace('.', ',')} dtk</td>
      <td>${badge(e.fhirStatus, e.fhirTone)}</td>
      <td>${badge(e.audio, e.audioTone)}</td>
    </tr>`;
  }).join('');

  const mainGrid = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 448px;gap:10px;">
    <!-- Left: 16-Row Operational Encounter Grid -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${medIc('clipboardCheck', 13, '#0c7c66')}
          <span>Antrean &amp; Daftar Kunjungan Poli Penyakit Dalam (16 Prioritas dari ${SHIFT_TOTAL} Pasien Shift)</span>
        </div>
        <span class="e-panel-sub">Urutan terbaru · Klik baris untuk inspeksi CDI</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10.3px;">
          <thead>
            <tr>
              <th style="width:58px;">No.</th>
              <th style="width:166px;">Pasien &amp; No. RM</th>
              <th style="width:104px;">Penjamin / SEP</th>
              <th style="width:198px;">Keluhan Utama (Ekstraksi S)</th>
              <th style="width:94px;">ICD-10</th>
              <th style="width:160px;">Grup INA-CBG &amp; Tarif</th>
              <th class="num" style="width:66px;">Draf</th>
              <th style="width:104px;">Status FHIR</th>
              <th style="width:104px;">Status Audio</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="5">Subtotal 16 Kunjungan Prioritas (dari ${SHIFT_TOTAL} pasien shift pagi)</td>
              <td class="mono">${fmtIdr(ENCOUNTERS_SUBTOTAL_IDR)}</td>
              <td class="num mono">8,2 dtk</td>
              <td colspan="2" style="text-align:right;" class="mono">Total Shift (54): ${fmtIdr(SHIFT_TOTAL_CLAIM_IDR)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- Right Column: CDI Coding Inspector + Hourly Shift Chart -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1.18;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('eye', 13, '#0c7c66')}
            <span>Inspektor Koder RM (CDI) · RM ${esc(ACTIVE_PATIENT.rm)}</span>
          </div>
          ${badge('A-039 TERPILIH', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#f4f9f8;border:1px solid #cfe0dc;border-radius:3px;">
            <div>
              <div style="font-weight:700;font-size:11.5px;">${esc(ACTIVE_PATIENT.name)} · BPJS Kelas 1</div>
              <div class="mono" style="font-size:9.5px;color:#57736d;">SEP ${esc(ACTIVE_PATIENT.sep)} · ${esc(ACTIVE_PATIENT.doctorShort)}</div>
            </div>
            ${badge('Pra-TTD', 'accent')}
          </div>

          <div style="border:1px solid #f5c97b;background:#fffbeb;border-radius:4px;padding:7px 9px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="font-size:10.6px;color:#92400e;">Kueri Spesifisitas Diagnosis (CDI)</strong>
              ${badge('Potensi +Rp 77.200', 'warn')}
            </div>
            <div style="font-size:10px;line-height:1.4;color:#78350f;">
              Transkrip <span class="mono">[00:24]</span> menyebut <em>"kesemutan di kedua kaki malam hari"</em> dan Objective mencatat <em>"monofilamen 10g menurun ringan"</em>. Konfirmasi apakah memenuhi <strong>E11.40</strong> (DM2 dengan neuropati) alih-alih <strong>E11.9</strong>.
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
              <div style="background:#ffffff;border:1px solid #e6d3a7;border-radius:3px;padding:5px 7px;">
                <div style="font-size:9px;color:#57736d;">Draf Saat Ini (E11.9 + I10)</div>
                <div class="mono" style="font-size:11px;font-weight:700;">Q-5-44-0 · Rp 312.400</div>
              </div>
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:3px;padding:5px 7px;">
                <div style="font-size:9px;color:#065f46;">Bila Konfirmasi (E11.40 + I10)</div>
                <div class="mono" style="font-size:11px;font-weight:700;color:#047857;">Q-5-44-1 · Rp 389.600</div>
              </div>
            </div>
          </div>

          <div style="flex:1;">
            <div style="font-size:9.8px;font-weight:700;color:#35524c;margin-bottom:4px;">Kode ICD-10 &amp; Prosedur ICD-9-CM Terlampir</div>
            <table class="e-table" style="font-size:10px;">
              <thead>
                <tr><th style="width:66px;">Kode</th><th style="width:66px;">Tipe</th><th>Deskripsi Klinis</th><th style="width:54px;">Skor</th></tr>
              </thead>
              <tbody>
                <tr><td class="mono" style="font-weight:700;color:#085445;">E11.9</td><td>Utama</td><td>DM Tipe 2 tanpa komplikasi</td><td class="mono">97%</td></tr>
                <tr><td class="mono" style="font-weight:700;">I10</td><td>Sekunder</td><td>Hipertensi esensial primer</td><td class="mono">95%</td></tr>
                <tr><td class="mono" style="font-weight:700;">89.03</td><td>ICD-9</td><td>Evaluasi &amp; wawancara lengkap</td><td class="mono">99%</td></tr>
                <tr><td class="mono" style="font-weight:700;">90.59</td><td>ICD-9</td><td>Pemeriksaan kimia darah / HbA1c</td><td class="mono">98%</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:6px 7px;background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;font-size:9.4px;">
            <div><span style="color:#57736d;">SEP BPJS:</span> <strong style="color:#047857;">Valid</strong></div>
            <div><span style="color:#57736d;">Resume SOAP:</span> <strong style="color:#047857;">4/4 OK</strong></div>
            <div><span style="color:#57736d;">TTE Dokter:</span> <strong style="color:#085445;">Siap TTD</strong></div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:6px;">
            <div class="e-btn">Kirim Kueri ke Dokter</div>
            <div class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')}<span>Validasi Koding INA-CBG</span></div>
          </div>
        </div>
      </section>

      <section class="e-panel" style="height:262px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#0c7c66')}
            <span>Distribusi Pasien per Jam (Shift 08:00–13:00 WIB)</span>
          </div>
          <span class="mono" style="font-size:10px;font-weight:700;color:#085445;">Σ = ${SHIFT_TOTAL}</span>
        </div>
        <div class="e-panel-body" style="padding:6px 8px;display:flex;flex-direction:column;justify-content:space-between;">
          ${svgStackedBarChart({
            width: 428,
            height: 186,
            categories: HOURLY_SHIFT.hours,
            yMax: 12,
            series: [
              { label: 'FHIR 201 (38)', color: '#0c7c66', values: HOURLY_SHIFT.signed },
              { label: 'Pra-TTD (9)', color: '#0284c7', values: HOURLY_SHIFT.pending },
              { label: 'Koder (4)', color: '#d97706', values: HOURLY_SHIFT.coder },
              { label: 'Aktif (3)', color: '#64748b', values: HOURLY_SHIFT.active },
            ],
          })}
          <div style="display:flex;justify-content:space-between;font-size:9.6px;color:#46655f;padding-top:4px;border-top:1px solid #e4eeec;">
            <span>Puncak 10:00 WIB: <strong>11 pasien/jam</strong></span>
            <span>Lembur ketik EMR pasca-shift: <strong style="color:#047857;">0 menit</strong></span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderClinicalShell({
    activeTab: 'p2',
    title: meta.pages[1].title,
    bodyContent: `<div style="flex:1;min-height:0;padding:9px 11px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">${kpiStrip}${filterBar}${mainGrid}</div>`,
  });
}

function svgClinicalWaterfall({ spans = [], totalMs = 2025, width = 330 }) {
  const rowH = 24;
  const labelW = 130;
  const durW = 48;
  const barAreaW = width - labelW - durW - 10;
  const h = spans.length * rowH + 22;
  let out = '';
  // Crisp non-overlapping ticks: 0ms, 1.0s, 2.0s
  [
    { f: 0, lbl: '0 ms', anchor: 'start' },
    { f: 0.5, lbl: '1.000 ms', anchor: 'middle' },
    { f: 1, lbl: `${fmtNum(totalMs)} ms`, anchor: 'end' },
  ].forEach((t) => {
    const x = labelW + t.f * barAreaW;
    out += `<line x1="${x.toFixed(1)}" y1="14" x2="${x.toFixed(1)}" y2="${h}" stroke="#dce9e6" stroke-width="1" stroke-dasharray="2,2" />`;
    out += `<text x="${x.toFixed(1)}" y="10" text-anchor="${t.anchor}" font-size="8.4" font-family="Consolas,monospace" fill="#57736d">${esc(t.lbl)}</text>`;
  });
  spans.forEach((sp, i) => {
    const y = 18 + i * rowH;
    const x = labelW + (sp.start / totalMs) * barAreaW;
    const bw = Math.max(4, (sp.dur / totalMs) * barAreaW);
    out += `<text x="2" y="${y + 13}" font-size="9.6" font-weight="500" font-family="Segoe UI,sans-serif" fill="#0f2421">${esc(sp.label)}</text>`;
    out += `<rect x="${x.toFixed(1)}" y="${y + 4}" width="${bw.toFixed(1)}" height="12" rx="2" fill="${sp.color}" />`;
    out += `<text x="${width - 2}" y="${y + 13}" text-anchor="end" font-size="9.3" font-weight="700" font-family="Consolas,monospace" fill="#0f2421">${sp.dur} ms</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${h}" width="100%" height="${h}" style="display:block;">${out}</svg>`;
}

// ============================================================================
// PAGE 3: INTEGRASI SIMRS & INSPEKTOR BUNDLE SATUSEHAT FHIR R4
// ============================================================================
function renderPage3() {
  const headerStrip = `<div style="height:48px;background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:0 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:10px;min-width:0;">
      <div>
        <div style="display:flex;align-items:center;gap:7px;">
          <strong style="font-size:12.5px;">Bundle SATUSEHAT FHIR R4 (Transaction)</strong>
          <span class="mono" style="font-size:10.5px;color:#085445;background:#e5f5f1;padding:1px 6px;border-radius:3px;border:1px solid #9ed8cb;">urn:uuid:bdl-rscm-20261122-08412</span>
          ${badge('9/9 Resource Valid ID-Core', 'ok')}
        </div>
        <div style="font-size:9.8px;color:#57736d;margin-top:1px;">
          IHS Patient: <strong class="mono">${ACTIVE_PATIENT.ihsId}</strong> · IHS Practitioner: <strong class="mono">${ACTIVE_PATIENT.ihsPractitioner}</strong> · Target: SIMRS RSCM (HL7v2/FHIR) + Kemenkes SATUSEHAT
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:7px;">
      <div class="e-btn">${ic('copy', 11, '#085445')}<span>Salin JSON</span></div>
      <div class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')}<span>Validasi Profil ID-Core</span></div>
    </div>
  </div>`;

  const resRows = FHIR_RESOURCES.map(
    (r) => `<tr class="${r.selected ? 'is-selected' : ''}">
      <td class="mono" style="width:26px;color:#57736d;">${r.idx}</td>
      <td><div style="font-weight:700;color:#0f2421;">${esc(r.type)}</div><div class="mono" style="font-size:9px;color:#57736d;">${esc(r.id)}</div></td>
      <td class="mono" style="font-size:9.8px;color:#085445;font-weight:600;">${esc(r.code)}</td>
      <td style="text-align:right;">${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const fhirJsonLines = [
    { ln: 1, html: '{' },
    { ln: 2, html: '  <span class="fc-k">"resourceType"</span>: <span class="fc-s">"Bundle"</span>, <span class="fc-k">"type"</span>: <span class="fc-s">"transaction"</span>,' },
    { ln: 3, html: '  <span class="fc-k">"timestamp"</span>: <span class="fc-s">"2026-11-22T11:04:12+07:00"</span>,' },
    { ln: 4, html: '  <span class="fc-k">"entry"</span>: [' },
    { ln: 5, html: '    { <span class="fc-c">// Entry #2 · Diagnosis Utama (ICD-10)</span>' },
    { ln: 6, html: '      <span class="fc-k">"resource"</span>: {' },
    { ln: 7, hl: true, html: '        <span class="fc-k">"resourceType"</span>: <span class="fc-s">"Condition"</span>, <span class="fc-k">"id"</span>: <span class="fc-s">"cnd-08412-1"</span>,' },
    { ln: 8, html: '        <span class="fc-k">"clinicalStatus"</span>: { <span class="fc-k">"coding"</span>: [{ <span class="fc-k">"code"</span>: <span class="fc-s">"active"</span> }] },' },
    { ln: 9, hl: true, html: '        <span class="fc-k">"code"</span>: { <span class="fc-k">"coding"</span>: [{ <span class="fc-k">"system"</span>: <span class="fc-s">"http://hl7.org/fhir/sid/icd-10"</span>,' },
    { ln: 10, hl: true, html: '          <span class="fc-k">"code"</span>: <span class="fc-s">"E11.9"</span>, <span class="fc-k">"display"</span>: <span class="fc-s">"Type 2 diabetes mellitus without complications"</span> }] },' },
    { ln: 11, html: '        <span class="fc-k">"subject"</span>: { <span class="fc-k">"reference"</span>: <span class="fc-s">"Patient/P02478391042"</span> },' },
    { ln: 12, html: '        <span class="fc-k">"encounter"</span>: { <span class="fc-k">"reference"</span>: <span class="fc-s">"Encounter/enc-08412"</span> }' },
    { ln: 13, html: '      }, <span class="fc-k">"request"</span>: { <span class="fc-k">"method"</span>: <span class="fc-s">"POST"</span>, <span class="fc-k">"url"</span>: <span class="fc-s">"Condition"</span> }' },
    { ln: 14, html: '    },' },
    { ln: 15, html: '    { <span class="fc-c">// Entry #5 · Observation Tanda Vital / Lab (LOINC)</span>' },
    { ln: 16, html: '      <span class="fc-k">"resource"</span>: {' },
    { ln: 17, html: '        <span class="fc-k">"resourceType"</span>: <span class="fc-s">"Observation"</span>, <span class="fc-k">"status"</span>: <span class="fc-s">"final"</span>,' },
    { ln: 18, html: '        <span class="fc-k">"code"</span>: { <span class="fc-k">"coding"</span>: [{ <span class="fc-k">"system"</span>: <span class="fc-s">"http://loinc.org"</span>, <span class="fc-k">"code"</span>: <span class="fc-s">"1558-6"</span> }] },' },
    { ln: 19, html: '        <span class="fc-k">"valueQuantity"</span>: { <span class="fc-k">"value"</span>: <span class="fc-n">214</span>, <span class="fc-k">"unit"</span>: <span class="fc-s">"mg/dL"</span> },' },
    { ln: 20, html: '        <span class="fc-k">"interpretation"</span>: [{ <span class="fc-k">"coding"</span>: [{ <span class="fc-k">"code"</span>: <span class="fc-s">"H"</span>, <span class="fc-k">"display"</span>: <span class="fc-s">"High"</span> }] }]' },
    { ln: 21, html: '      }, <span class="fc-k">"request"</span>: { <span class="fc-k">"method"</span>: <span class="fc-s">"POST"</span>, <span class="fc-k">"url"</span>: <span class="fc-s">"Observation"</span> }' },
    { ln: 22, html: '    },' },
    { ln: 23, html: '    { <span class="fc-c">// Entry #7 · e-Resep Kemenkes KFA (MedicationRequest)</span>' },
    { ln: 24, html: '      <span class="fc-k">"resource"</span>: {' },
    { ln: 25, hl: true, html: '        <span class="fc-k">"resourceType"</span>: <span class="fc-s">"MedicationRequest"</span>, <span class="fc-k">"intent"</span>: <span class="fc-s">"order"</span>,' },
    { ln: 26, hl: true, html: '        <span class="fc-k">"medicationCodeableConcept"</span>: { <span class="fc-k">"coding"</span>: [{' },
    { ln: 27, hl: true, html: '          <span class="fc-k">"system"</span>: <span class="fc-s">"http://sys-ids.kemkes.go.id/kfa"</span>, <span class="fc-k">"code"</span>: <span class="fc-s">"93000412"</span>,' },
    { ln: 28, hl: true, html: '          <span class="fc-k">"display"</span>: <span class="fc-s">"Metformin HCl 500 mg Tablet Salut Selaput"</span> }] },' },
    { ln: 29, html: '        <span class="fc-k">"dosageInstruction"</span>: [{ <span class="fc-k">"text"</span>: <span class="fc-s">"2x1 tablet sesudah makan (pc)"</span>,' },
    { ln: 30, html: '          <span class="fc-k">"timing"</span>: { <span class="fc-k">"repeat"</span>: { <span class="fc-k">"frequency"</span>: <span class="fc-n">2</span>, <span class="fc-k">"period"</span>: <span class="fc-n">1</span>, <span class="fc-k">"periodUnit"</span>: <span class="fc-s">"d"</span> } } }],' },
    { ln: 31, html: '        <span class="fc-k">"dispenseRequest"</span>: { <span class="fc-k">"quantity"</span>: { <span class="fc-k">"value"</span>: <span class="fc-n">60</span>, <span class="fc-k">"unit"</span>: <span class="fc-s">"TAB"</span> } }' },
    { ln: 32, html: '      }, <span class="fc-k">"request"</span>: { <span class="fc-k">"method"</span>: <span class="fc-s">"POST"</span>, <span class="fc-k">"url"</span>: <span class="fc-s">"MedicationRequest"</span> }' },
    { ln: 33, html: '    },' },
    { ln: 34, html: '    { <span class="fc-c">// Entry #9 · Consent Privasi UU PDP &amp; Audio Zero-Retention</span>' },
    { ln: 35, html: '      <span class="fc-k">"resource"</span>: {' },
    { ln: 36, html: '        <span class="fc-k">"resourceType"</span>: <span class="fc-s">"Consent"</span>, <span class="fc-k">"status"</span>: <span class="fc-s">"active"</span>, <span class="fc-k">"scope"</span>: <span class="fc-s">"patient-privacy"</span>,' },
    { ln: 37, html: '        <span class="fc-k">"policyRule"</span>: { <span class="fc-k">"text"</span>: <span class="fc-s">"UU-PDP-27-2022 · AUDIO-ZERO-RETENTION · TTE-BSRE"</span> }' },
    { ln: 38, html: '      }' },
    { ln: 39, html: '    }' },
    { ln: 40, html: '  ]' },
    { ln: 41, html: '}' },
  ];

  const mainCols = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:346px 664px 1fr;gap:9px;">
    <!-- Col 1: Bundle Resource Tree + Span Waterfall -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('layers', 13, '#0c7c66')}
            <span>Resource Bundle FHIR (9 Entri)</span>
          </div>
          ${badge('R4.0.1', 'accent')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.1px;">
            <thead>
              <tr><th style="width:28px;">#</th><th>Resource &amp; ID</th><th style="width:74px;">Kode</th><th style="width:72px;text-align:right;">Status</th></tr>
            </thead>
            <tbody>${resRows}</tbody>
          </table>
          <div style="padding:7px 9px;background:#f4f9f8;border-top:1px solid #cfe0dc;display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9.3px;color:#35524c;">
            <span>Profil: <strong class="mono">ID-Core R4</strong></span>
            <span>Payload: <strong class="mono">6,84 KB</strong></span>
            <span>Skema: <strong style="color:#047857;">0 Error · 0 Warn</strong></span>
            <span>OAuth2: <strong style="color:#047857;">Token Aktif</strong></span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="height:262px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('clock', 13, '#0c7c66')}
            <span>Waterfall Pipeline Pasca-TTD</span>
          </div>
          <span class="mono" style="font-size:10px;font-weight:700;color:#047857;">${fmtNum(PIPELINE_TOTAL_MS)} ms</span>
        </div>
        <div class="e-panel-body" style="padding:7px 9px;display:flex;flex-direction:column;justify-content:space-between;">
          ${svgClinicalWaterfall({ spans: PIPELINE_SPANS, totalMs: PIPELINE_TOTAL_MS, width: 326 })}
          <div style="font-size:9.3px;color:#46655f;display:flex;justify-content:space-between;padding-top:4px;border-top:1px solid #e4eeec;">
            <span>Target SLA Pasca-TTD: &lt;3.000 ms</span>
            <strong style="color:#047857;">LULUS (-32,5%)</strong>
          </div>
        </div>
      </section>
    </div>

    <!-- Col 2: Syntax-Highlighted FHIR R4 JSON Payload Inspector -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('code', 13, '#0c7c66')}
          <span>Inspektor Payload FHIR R4 (Profil SATUSEHAT ID-Core)</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          ${badge('JSON R4', 'accent')}
          ${badge('0 Validation Errors', 'ok')}
        </div>
      </div>
      <div class="e-panel-body-flush">
        <div class="fhir-code">
          ${fhirJsonLines
            .map(
              (l) =>
                `<div class="${l.hl ? 'fc-hl' : ''}"><span class="fc-ln">${String(l.ln).padStart(2, ' ')}</span>${l.html}</div>`
            )
            .join('')}
        </div>
        <div style="background:#064e40;color:#d1fae5;padding:7px 10px;font-family:var(--e-mono);font-size:9.6px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <span>POST /fhir-r4/v1 · <strong>HTTP/2 201 Created</strong> (340 ms) · X-IHS-Tx: ihs-94d8f21a</span>
          <span style="color:#86efdc;">SIMRS Ack: MSA|AA|MSG08412</span>
        </div>
      </div>
    </section>

    <!-- Col 3: Indonesian Clinical Abbreviation Mapping + Latency Chart + Delivery Log -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="height:316px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${medIc('stethoscope', 13, '#0c7c66')}
            <span>Pemetaan Singkatan Klinis ID → FHIR</span>
          </div>
          ${badge('9 Inti', 'accent')}
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:9.9px;">
            <thead>
              <tr><th style="width:52px;">Singk.</th><th style="width:176px;">Makna Klinis ID</th><th>Target &amp; Kode Standar</th><th class="num" style="width:50px;">Akur.</th></tr>
            </thead>
            <tbody>
              ${ID_CLINICAL_MAP.map(
                (m) => `<tr>
                  <td class="mono" style="font-weight:800;color:#085445;">${esc(m.abbr)}</td>
                  <td class="trunc">${esc(m.meaning)}</td>
                  <td class="mono" style="font-size:9.3px;color:#35524c;">${esc(m.code)}</td>
                  <td class="num mono" style="color:#047857;font-weight:700;">${esc(m.acc)}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="e-panel" style="height:244px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#0c7c66')}
            <span>Latensi Sinkronisasi SATUSEHAT &amp; SIMRS (WIB)</span>
          </div>
          ${badge('SLA < 800 ms', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:6px 8px;">
          ${svgMultiLineChart({
            width: 530,
            height: 194,
            xLabels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
            yMin: 0,
            yMax: 1000,
            yTicks: 4,
            yUnit: 'ms',
            threshold: { value: 800, label: 'Batas SLA 800 ms', color: '#be123c' },
            series: [
              { label: 'SATUSEHAT p95', color: '#0369a1', values: [420, 485, 560, 512, 468, 494, 448], area: true, dots: true },
              { label: 'SATUSEHAT p50', color: '#0c7c66', values: [265, 298, 342, 326, 290, 315, 284], dots: true },
              { label: 'SIMRS Bridge p95', color: '#b45309', values: [148, 174, 212, 190, 165, 182, 158], dashed: true },
            ],
          })}
        </div>
      </section>

      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('server', 13, '#0c7c66')}
            <span>Log Pengiriman Bundle Terbaru</span>
          </div>
          <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">100% Sukses</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table" style="font-size:10px;">
            <thead>
              <tr><th style="width:68px;">Waktu</th><th style="width:82px;">Encounter</th><th style="width:58px;">Isi</th><th style="width:72px;">SIMRS</th><th>SATUSEHAT</th><th class="num" style="width:60px;">Latensi</th></tr>
            </thead>
            <tbody>
              ${RECENT_BUNDLES.map(
                (b) => `<tr>
                  <td class="mono">${b.time}</td>
                  <td class="mono" style="font-weight:700;">${b.enc}</td>
                  <td class="mono">${b.res}</td>
                  <td class="mono" style="color:#085445;">${b.simrs}</td>
                  <td>${badge(b.satu, 'ok')}</td>
                  <td class="num mono">${b.ms}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>`;

  return renderClinicalShell({
    activeTab: 'p3',
    title: meta.pages[2].title,
    bodyContent: `<div style="flex:1;min-height:0;padding:9px 11px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">${headerStrip}${mainCols}</div>`,
  });
}

// ============================================================================
// PAGE 4: PRIVASI AUDIO ZERO-RETENTION, ENKRIPSI & AUDIT UU PDP / PMK 24
// ============================================================================
function renderPage4() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Audio Tersimpan di Disk</span>${badge('ZERO-RETENTION', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">0 KB</span>
        <span class="mono" style="font-size:9.8px;color:#085445;">tmpfs mlock</span>
      </div>
      <div class="e-kpi-foot"><span>Tidak ada berkas WAV/MP3 di disk atau S3</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Penghapusan Audio Shift Ini</span>${badge('VERIFIED', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${SHIFT_STATUS.signed} / ${SHIFT_STATUS.signed}</span>
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">100,0%</span>
      </div>
      <div class="e-kpi-foot"><span>Rata-rata waktu wipe: 45 ms pasca-TTD</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Bukti Purge 30 Hari Terakhir</span>${badge('WORM SHA-256', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">1.428 / 1.428</span>
        <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">0 anomali</span>
      </div>
      <div class="e-kpi-foot"><span>100% buffer terhapus · 0 sesi yatim</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Inferensi Lokal (Sovereign)</span>${badge('ON-PREM GPU', 'info')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">100,0%</span>
        <span class="mono" style="font-size:9.8px;color:#0369a1;font-weight:700;">0 Egress PII</span>
      </div>
      <div class="e-kpi-foot"><span>Whisper Med ID berjalan di DC RSUPN</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Kepatuhan UU PDP &amp; PMK 24</span>${badge('AUDIT LULUS', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">${COMPLIANCE_CONTROLS.length} / ${COMPLIANCE_CONTROLS.length}</span>
        <span class="mono" style="font-size:9.8px;color:#047857;font-weight:700;">TTE BSrE OK</span>
      </div>
      <div class="e-kpi-foot"><span>Inspeksi DPO RS: 22 Nov 2026</span></div>
    </div>
  </div>`;

  const midRow = `<div style="height:376px;display:grid;grid-template-columns:832px 1fr;gap:9px;flex-shrink:0;">
    <!-- Left: Zero-Retention Architecture SVG -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('shield', 13, '#0c7c66')}
          <span>Arsitektur Siklus Hidup Audio Zero-Retention (Ephemeral RAM → Cryptographic Wipe)</span>
        </div>
        ${badge('AES-256-GCM + MLOCK', 'accent')}
      </div>
      <div class="e-panel-body" style="padding:7px 9px;display:flex;flex-direction:column;justify-content:space-between;">
        ${svgZeroRetentionArchitecture()}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding-top:6px;border-top:1px solid #e4eeec;">
          <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 7px;">
            <div style="font-size:8.8px;color:#57736d;">Proteksi Memori</div>
            <div class="mono" style="font-size:9.8px;font-weight:700;color:#0f2421;">mlockall() No-Swap</div>
          </div>
          <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 7px;">
            <div style="font-size:8.8px;color:#57736d;">Batas TTL Maksimum</div>
            <div class="mono" style="font-size:9.8px;font-weight:700;color:#0f2421;">20 Menit Auto-Wipe</div>
          </div>
          <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 7px;">
            <div style="font-size:8.8px;color:#57736d;">Metode Penghapusan</div>
            <div class="mono" style="font-size:9.8px;font-weight:700;color:#be123c;">Zeroize + KeyShred</div>
          </div>
          <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:4px 7px;">
            <div style="font-size:8.8px;color:#57736d;">Sertifikat Penandatangan</div>
            <div class="mono" style="font-size:9.8px;font-weight:700;color:#047857;">TTE BSrE · TSA BSSN</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Right: Regulatory Matrix -->
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">
          ${ic('lock', 13, '#0c7c66')}
          <span>Matriks Kepatuhan UU PDP &amp; PMK 24/2022</span>
        </div>
        ${badge('8/8 LULUS', 'ok')}
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table" style="font-size:10px;">
          <thead>
            <tr>
              <th style="width:62px;">Kode</th>
              <th style="width:128px;">Regulasi</th>
              <th style="width:210px;">Kontrol Teknis</th>
              <th>Bukti Otomatis</th>
              <th style="width:64px;text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${COMPLIANCE_CONTROLS.map(
              (c) => `<tr>
                <td class="mono" style="font-weight:700;color:#085445;">${esc(c.code)}</td>
                <td style="font-weight:600;">${esc(c.reg)}</td>
                <td class="trunc">${esc(c.control)}</td>
                <td class="trunc" style="color:#46655f;">${esc(c.evidence)}</td>
                <td style="text-align:right;">${badge(c.status, 'ok')}</td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
        <div style="padding:8px 10px;background:#f4f9f8;border-top:1px solid #cfe0dc;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#35524c;">
          <div><strong>Pejabat Pelindung Data (DPO RS):</strong> dr. Hendra Gunawan, MARS · <span class="mono">Sertifikat Audit #DPO-2026-1122</span></div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('Audit Berikutnya: 22 Feb 2027', 'neutral')}
            <div class="e-btn">${ic('download', 10, '#085445')}<span>Unduh Paket DPO</span></div>
          </div>
        </div>
      </div>
    </section>
  </div>`;

  const ledgerPanel = `<section class="e-panel" style="flex:1;">
    <div class="e-panel-head">
      <div class="e-panel-title">
        ${medIc('trashLock', 13, '#0c7c66')}
        <span>Buku Besar WORM Bukti Penghapusan Audio (Zero-Retention Destruction Ledger — 10 Terbaru dari ${SHIFT_STATUS.signed} Shift Ini)</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${badge('HASH-CHAINED SHA-256', 'accent')}
        ${badge('0 KB SISA DISK', 'ok')}
      </div>
    </div>
    <div class="e-panel-body-flush">
      <table class="e-table" style="font-size:10.3px;">
        <thead>
          <tr>
            <th style="width:118px;">ID Bukti WORM</th>
            <th style="width:82px;">Waktu TTD</th>
            <th style="width:98px;">No. Encounter</th>
            <th style="width:152px;">Dokter Penandatangan</th>
            <th class="num" style="width:84px;">Durasi</th>
            <th class="num" style="width:112px;">RAM Dihapus</th>
            <th class="num" style="width:96px;">Disk Tersisa</th>
            <th style="width:162px;">Metode Purge</th>
            <th>SHA-256 Proof Hash</th>
            <th style="width:108px;text-align:right;">Verifikasi</th>
          </tr>
        </thead>
        <tbody>
          ${PURGE_LOGS.map(
            (p) => `<tr>
              <td class="mono" style="font-weight:700;color:#085445;">${esc(p.id)}</td>
              <td class="mono">${esc(p.time)}</td>
              <td class="mono" style="font-weight:600;">${esc(p.enc)}</td>
              <td>${esc(p.doc)}</td>
              <td class="num mono">${esc(p.dur)}</td>
              <td class="num mono">${p.ramMb.toFixed(1).replace('.', ',')} MB</td>
              <td class="num mono" style="color:#047857;font-weight:700;">${p.diskKb} KB</td>
              <td class="mono" style="font-size:9.8px;color:#46655f;">${esc(p.method)}</td>
              <td class="mono" style="font-size:9.8px;color:#35524c;">${esc(p.hash)}</td>
              <td style="text-align:right;">${badge('Terverifikasi', 'ok')}</td>
            </tr>`
          ).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">Subtotal 10 Bukti Terbaru (Shift Pagi: ${SHIFT_STATUS.signed}/${SHIFT_STATUS.signed} Terhapus Kriptografis)</td>
            <td class="num mono">${PURGE_SUBTOTAL_MB.toFixed(1).replace('.', ',')} MB</td>
            <td class="num mono" style="color:#047857;">0 KB</td>
            <td colspan="3" style="text-align:right;" class="mono">Total Shift (38 sesi): 158,6 MB RAM Zeroized · 0 KB Disk</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>`;

  return renderClinicalShell({
    activeTab: 'p4',
    title: meta.pages[3].title,
    bodyContent: `<div style="flex:1;min-height:0;padding:9px 11px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">${kpiStrip}${midRow}${ledgerPanel}</div>`,
  });
}

// ============================================================================
// PAGE 5: PENDAMPING TABLET DOKTER & ANALITIK BEBAN KERJA POLIKLINIK
// ============================================================================
function renderPage5() {
  const kpiStrip = `<div class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Cakupan Poliklinik RS</span>${badge('PRODUKSI', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${POLYCLINICS.length} poli</span>
        <span class="mono" style="font-size:10px;color:#085445;font-weight:700;">${TOTAL_DOCS} dokter</span>
      </div>
      <div class="e-kpi-foot"><span>Meja dokter desktop + tablet pendamping</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Volume Rawat Jalan / Hari</span>${badge('84,2% BPJS', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtNum(TOTAL_PATIENTS_DAY)}</span>
        ${svgSparkline({ points: [1480, 1590, 1660, 1740, 1795, 1840], width: 64, height: 20, color: '#0c7c66' })}
      </div>
      <div class="e-kpi-foot"><span>Rata-rata 43,8 pasien / dokter / shift</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Rerata Waktu Draf Multi-Poli</span>${badge('TERTIMBANG', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#047857;">${WEIGHTED_DRAFT_SEC.toFixed(1).replace('.', ',')} dtk</span>
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">vs 7,4 mnt</span>
      </div>
      <div class="e-kpi-foot"><span>Penurunan waktu ketik EMR sebesar 85,1%</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Akurasi ICD-10 Multi-Poli</span>${badge('VERIFIED', 'ok')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val">${fmtPct(WEIGHTED_ICD_ACC, 1)}</span>
        <span class="mono" style="font-size:10px;color:#085445;font-weight:700;">+14,2% CDI</span>
      </div>
      <div class="e-kpi-foot"><span>Validasi koder INA-CBGs lintas 8 poli</span></div>
    </div>
    <div class="e-kpi">
      <div class="e-kpi-top"><span>Penghematan Lembur EMR</span>${badge('ROI KLINIS', 'accent')}</div>
      <div class="e-kpi-mid">
        <span class="e-kpi-val" style="color:#085445;">${fmtNum(TOTAL_SAVED_HRS)} jam</span>
        <span class="mono" style="font-size:10px;color:#047857;font-weight:700;">/ bulan</span>
      </div>
      <div class="e-kpi-foot"><span>Setara ~38,7 jam / dokter / bulan kembali</span></div>
    </div>
  </div>`;

  const mainSplit = `<div style="flex:1;min-height:0;display:grid;grid-template-columns:748px 1fr;gap:10px;">
    <!-- Left Column: Framed Doctor Companion Tablet + Patient AVS -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="height:508px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${medIc('tablet', 13, '#0c7c66')}
            <span>Tablet Pendamping Dokter (Mode Konsultasi &amp; Visite Bebas-Ketik)</span>
          </div>
          ${badge('SYNC SIGNALR · LOW LATENCY', 'accent')}
        </div>
        <div class="e-panel-body" style="padding:8px;display:flex;flex-direction:column;">
          <div class="tablet-bezel">
            <div class="tablet-screen">
              <!-- Tablet Status Bar -->
              <div style="height:26px;background:#064e40;color:#e6fffa;padding:0 10px;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;flex-shrink:0;">
                <span style="font-weight:700;">DokterScribe Tablet · Poli Dalam R.04</span>
                <span class="mono" style="color:#86efdc;">Wi-Fi RS TLS 1.3 · RAM Ephemeral · 86%</span>
              </div>

              <!-- Tablet Active Patient & Live Recording Strip -->
              <div style="padding:8px 10px;background:#ffffff;border-bottom:1px solid #cfe0dc;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
                <div>
                  <div style="font-size:12px;font-weight:700;color:#0f2421;">${esc(ACTIVE_PATIENT.name)} <span style="font-weight:500;color:#57736d;">(58 th, L)</span></div>
                  <div style="font-size:9.8px;color:#46655f;">RM <strong class="mono">${ACTIVE_PATIENT.rm}</strong> · BPJS Kelas 1 · <span style="color:#be123c;font-weight:700;">Alergi: Sulfonamida</span></div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:3px;background:#fff1f2;border:1px solid #fecdd3;color:#be123c;font-family:var(--e-mono);font-size:10px;font-weight:700;">
                    <span class="dot dot-bad"></span>
                    <span>MEREKAM · 04:18</span>
                  </div>
                </div>
              </div>

              <!-- Compact Voice Waveform & Quick Voice Commands -->
              <div style="padding:6px 10px;background:#f5faf9;border-bottom:1px solid #d5e5e1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
                <div style="flex:1;">${svgClinicalWaveform({ width: 390, height: 56 })}</div>
                <div style="width:236px;display:flex;flex-direction:column;gap:4px;">
                  <div style="font-size:9.2px;font-weight:700;color:#46655f;">PERINTAH SUARA CEPAT TERDETEKSI</div>
                  <div style="font-size:9.8px;background:#ffffff;border:1px solid #cfe0dc;border-radius:3px;padding:3px 6px;color:#085445;">"Tambahkan order lab HbA1c"</div>
                  <div style="font-size:9.8px;background:#ffffff;border:1px solid #cfe0dc;border-radius:3px;padding:3px 6px;color:#085445;">"Kunci diagnosis E11.9 &amp; I10"</div>
                </div>
              </div>

              <!-- Tablet 2x2 Quick-Glance SOAP Grid -->
              <div style="flex:1;padding:8px 10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:7px;min-height:0;">
                <div style="background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:7px 8px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:700;color:#085445;font-size:10.5px;">S · Subjective</span>
                    ${badge('Terverifikasi', 'ok')}
                  </div>
                  <div style="font-size:10.1px;color:#17332e;line-height:1.38;">Sering haus 2 minggu, nokturia 3–4x/mlm, kesemutan kaki malam hari. Metformin bolong 7 hari.</div>
                  <div class="mono" style="font-size:9px;color:#57736d;">ID-Med NER · [00:24, 01:15]</div>
                </div>

                <div style="background:#fffdf7;border:1px solid #f5c97b;border-radius:4px;padding:7px 8px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:700;color:#92400e;font-size:10.5px;">O · Objective</span>
                    ${badge('GDP Tinggi', 'warn')}
                  </div>
                  <div style="font-size:10.1px;color:#17332e;line-height:1.38;"><strong>TD 142/88 mmHg</strong> · <strong>GDP 214 mg/dL</strong> · IMT 27,4 · SpO2 98% · Monofilamen distal menurun ringan.</div>
                  <div class="mono" style="font-size:9px;color:#92400e;">FHIR Observation · LOINC Valid</div>
                </div>

                <div style="background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:7px 8px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:700;color:#085445;font-size:10.5px;">A · Assessment</span>
                    ${badge('E11.9, I10', 'ok')}
                  </div>
                  <div style="font-size:10.1px;color:#17332e;line-height:1.38;">DM Tipe 2 tanpa komplikasi (glikemik belum terkontrol) + Hipertensi esensial primer.</div>
                  <div class="mono" style="font-size:9px;color:#57736d;">INA-CBG Q-5-44-0 · Rp 312.400</div>
                </div>

                <div style="background:#ffffff;border:1px solid #cfe0dc;border-radius:4px;padding:7px 8px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:700;color:#085445;font-size:10.5px;">P · Plan &amp; e-Resep</span>
                    ${badge('Kode KFA', 'ok')}
                  </div>
                  <div style="font-size:10.1px;color:#17332e;line-height:1.38;">Metformin 500mg 2x1 (KFA 93000412), Amlodipine 5mg 1x1, Mecobalamin, cek HbA1c, kontrol 14 hari.</div>
                  <div class="mono" style="font-size:9px;color:#047857;">0 Interaksi · Aman Non-Sulfa</div>
                </div>
              </div>

              <!-- Tablet Bottom One-Tap Action Bar -->
              <div style="height:40px;background:#ffffff;border-top:1px solid #cfe0dc;padding:0 10px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                <div class="e-btn e-btn-danger">${medIc('trashLock', 11, '#be123c')}<span>Batal &amp; Hapus Audio</span></div>
                <div style="display:flex;align-items:center;gap:7px;">
                  <div class="e-btn">Cek Ulang ICD-10</div>
                  <div class="e-btn e-btn-primary" style="height:28px;padding:0 12px;font-size:11px;">${medIc('penSign', 12, '#ffffff')}<span>Tanda Tangan &amp; Kirim FHIR</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Left: Patient After-Visit Summary (Bahasa Awam + QR SATUSEHAT Mobile) -->
      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('fileText', 13, '#0c7c66')}
            <span>Ringkasan Pasien Otomatis (After-Visit Summary · Bahasa Awam)</span>
          </div>
          ${badge('SIAP CETAK / SATUSEHAT MOBILE', 'ok')}
        </div>
        <div class="e-panel-body" style="display:grid;grid-template-columns:1fr 164px;gap:12px;align-items:center;">
          <div style="display:flex;flex-direction:column;gap:6px;font-size:10.4px;color:#17332e;">
            <div style="background:#f4f9f8;border:1px solid #d1e2de;border-radius:3px;padding:6px 8px;">
              <strong style="color:#085445;">Jadwal Minum Obat Harian:</strong><br/>
              • <strong>Metformin 500 mg:</strong> 1 tablet pagi &amp; 1 tablet malam <em>sesudah makan</em> (jangan terputus).<br/>
              • <strong>Amlodipine 5 mg:</strong> 1 tablet pagi hari untuk menjaga tekanan darah stabil.<br/>
              • <strong>Mecobalamin 500 mcg:</strong> 1 kapsul malam hari untuk membantu keluhan kesemutan kaki.
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:5px 7px;font-size:9.8px;">
                <strong style="color:#92400e;">Persiapan Kontrol (6 Des 2026)</strong><br/>
                Puasa 8–10 jam sebelum cek darah <strong>HbA1c &amp; GDP</strong> di Lab Poli.
              </div>
              <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:5px 7px;font-size:9.8px;">
                <strong style="color:#be123c;">Tanda Bahaya (Ke IGD)</strong><br/>
                Lemas hebat, keringat dingin, luka kaki bernanah, atau nyeri dada.
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:#f4f9f8;border:1px solid #cfe0dc;border-radius:4px;padding:8px;">
            ${svgQrCode(84)}
            <div style="text-align:center;line-height:1.25;">
              <div style="font-size:9.6px;font-weight:700;color:#085445;">SATUSEHAT Mobile</div>
              <div class="mono" style="font-size:8.6px;color:#57736d;">e-Resep · Antrean Farmasi</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Right Column: Documentation Time Trend + 8-Polyclinic Table -->
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="height:292px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#0c7c66')}
            <span>Tren Waktu Dokumentasi EMR per Pasien (Minggu 1 – Minggu 8 Rollout)</span>
          </div>
          ${badge('TURUN 7,4 → 1,1 MNT', 'ok')}
        </div>
        <div class="e-panel-body" style="padding:7px 9px;">
          ${svgMultiLineChart({
            width: 782,
            height: 236,
            xLabels: ['M1 (Pra)', 'M2 (Pilot)', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8 (Kini)'],
            yMin: 0,
            yMax: 8,
            yTicks: 4,
            yUnit: 'mnt',
            yFormat: (v) => v.toFixed(1).replace('.', ',') + ' mnt',
            threshold: { value: 1.5, label: 'Target SLA 1,5 mnt', color: '#047857' },
            annotations: [
              { index: 1, seriesIdx: 1, label: 'Go-Live Poli Dalam & Jantung', color: '#0369a1', dy: -34 },
              { index: 6, seriesIdx: 1, label: 'Kini: 1,1 mnt (Draf 8,3 dtk)', color: '#0c7c66', dy: -46 },
            ],
            series: [
              { label: 'Baseline Ketik EMR Manual', color: '#94a3b8', values: [7.4, 7.3, 7.5, 7.4, 7.2, 7.4, 7.3, 7.4], dashed: true },
              { label: 'Dengan DokterScribe ID (Draf + TTD)', color: '#0c7c66', values: [7.4, 3.8, 2.4, 1.8, 1.5, 1.3, 1.2, 1.1], area: true, dots: true, width: 2.2 },
            ],
          })}
        </div>
      </section>

      <section class="e-panel" style="flex:1;">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${medIc('hospital', 13, '#0c7c66')}
            <span>Performa Adopsi &amp; Penghematan Lembur EMR — 8 Poliklinik Rawat Jalan</span>
          </div>
          <span class="mono" style="font-size:10px;color:#085445;font-weight:700;">Total: ${fmtNum(TOTAL_SAVED_HRS)} jam/bln</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table" style="font-size:10.4px;">
            <thead>
              <tr>
                <th style="width:162px;">Poliklinik</th>
                <th class="num" style="width:52px;">Dokter</th>
                <th class="num" style="width:72px;">Pasien/Hr</th>
                <th class="num" style="width:66px;">Draf</th>
                <th class="num" style="width:72px;">ICD-10</th>
                <th style="width:136px;">Lembur EMR (Jam/Mgg)</th>
                <th class="num" style="width:86px;">Hemat/Bln</th>
                <th style="width:82px;text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${POLYCLINICS.map((p) => {
                const redPct = Math.round(((p.otBefore - p.otAfter) / p.otBefore) * 100);
                return `<tr>
                  <td style="padding:7.5px 7px;font-weight:700;color:#0f2421;">${esc(p.name)}</td>
                  <td style="padding:7.5px 7px;" class="num mono">${p.docs}</td>
                  <td style="padding:7.5px 7px;" class="num mono">${fmtNum(p.patientsDay)}</td>
                  <td style="padding:7.5px 7px;color:#085445;font-weight:600;" class="num mono">${p.draftSec.toFixed(1).replace('.', ',')} dtk</td>
                  <td style="padding:7.5px 7px;color:#047857;font-weight:700;" class="num mono">${fmtPct(p.icdAcc, 1)}</td>
                  <td style="padding:7.5px 7px;">
                    <div style="display:flex;align-items:center;gap:5px;">
                      <span class="mono" style="font-size:9.6px;color:#64748b;text-decoration:line-through;">${p.otBefore.toFixed(1).replace('.', ',')}j</span>
                      <span class="mono" style="font-size:10px;font-weight:700;color:#047857;">→ ${p.otAfter.toFixed(1).replace('.', ',')}j</span>
                      <span class="mono" style="font-size:9px;color:#085445;">(-${redPct}%)</span>
                    </div>
                  </td>
                  <td style="padding:7.5px 7px;font-weight:700;" class="num mono">${fmtNum(p.savedHrsMo)} jam</td>
                  <td style="padding:7.5px 7px;text-align:right;">${badge(p.status, p.tone)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td>Total / Rerata (${POLYCLINICS.length} Poli)</td>
                <td class="num mono">${TOTAL_DOCS}</td>
                <td class="num mono">${fmtNum(TOTAL_PATIENTS_DAY)}</td>
                <td class="num mono">${WEIGHTED_DRAFT_SEC.toFixed(1).replace('.', ',')} dtk</td>
                <td class="num mono">${fmtPct(WEIGHTED_ICD_ACC, 1)}</td>
                <td class="mono" style="color:#047857;">Penurunan Lembur -90%</td>
                <td class="num mono">${fmtNum(TOTAL_SAVED_HRS)} jam</td>
                <td style="text-align:right;">${badge('8/8 Aktif', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="padding:9px 11px;background:#f4f9f8;border-top:1px solid #cfe0dc;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div>
              <div style="font-size:9.5px;color:#57736d;margin-bottom:3px;">Adopsi Tanda Tangan Satu Klik</div>
              ${renderCapacityBar(94, { warnAt: 101, critAt: 101 })}
            </div>
            <div>
              <div style="font-size:9.5px;color:#57736d;margin-bottom:3px;">Penggunaan Tablet Pendamping Visite</div>
              ${renderCapacityBar(81, { warnAt: 101, critAt: 101 })}
            </div>
            <div>
              <div style="font-size:9.5px;color:#57736d;margin-bottom:3px;">Kepatuhan Zero-Retention Audio</div>
              ${renderCapacityBar(100, { warnAt: 101, critAt: 101 })}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderClinicalShell({
    activeTab: 'p5',
    title: meta.pages[4].title,
    bodyContent: `<div style="flex:1;min-height:0;padding:9px 11px;display:flex;flex-direction:column;gap:8px;overflow:hidden;">${kpiStrip}${mainSplit}</div>`,
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
