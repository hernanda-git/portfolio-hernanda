import {
  esc,
  fmtNum,
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
} from '../charts.mjs';

export const meta = {
  id: 'ID-008',
  name: 'LokalEdge Vision',
  reference: 'Ignition SCADA Perspective + OSIsoft PI Vision',
  persona: 'Ir. Hendra Kusuma, S.T. · Kepala K3L & Otomasi · Plant Cikarang B',
  pages: [
    { slug: 'p1', title: 'Ruang Kontrol SCADA & Grid RTSP Real-Time' },
    { slug: 'p2', title: 'Inventaris 16 Kanal RTSP & Inspektor Kamera' },
    { slug: 'p3', title: 'Kalibrasi Poligon Zona ROI & Topologi Edge-PLC' },
    { slug: 'p4', title: 'Inspeksi Mutu Konveyor QA & OEE Jalur Kemas' },
    { slug: 'p5', title: 'Scorecard K3 Shift, Bukti Anonim & Klaster Edge' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================

const CAMERAS = [
  { code: 'CAM-01', loc: 'Gerbang Utama Kendaraan', zone: 'Loading Dock', model: 'YOLOv8m-APD-TRT', res: '1080p', fps: 28.0, latMs: 13.2, events: 2, plcTrig: 0, conf: 0.96, interlock: 'DO-01 Palang', status: 'Normal', tone: 'ok', x: 76, y: 74, dir: 45 },
  { code: 'CAM-02', loc: 'Loading Dock Bay 1', zone: 'Loading Dock', model: 'ForkliftProx-v3', res: '1080p', fps: 30.0, latMs: 14.1, events: 2, plcTrig: 0, conf: 0.95, interlock: 'DO-02 Strobe', status: 'Normal', tone: 'ok', x: 158, y: 66, dir: 90 },
  { code: 'CAM-03', loc: 'Loading Dock Bay 2', zone: 'Loading Dock', model: 'ForkliftProx-v3', res: '1080p', fps: 30.0, latMs: 13.8, events: 2, plcTrig: 0, conf: 0.93, interlock: 'DO-03 Strobe', status: 'Normal', tone: 'ok', x: 244, y: 66, dir: 90 },
  { code: 'CAM-04', loc: 'Loading Dock Bay 3', zone: 'Loading Dock', model: 'ForkliftProx-v3', res: '1080p', fps: 30.0, latMs: 14.4, events: 5, plcTrig: 2, conf: 0.94, interlock: 'DO-04 Strobe+Sirine', status: 'Pelanggaran', tone: 'bad', selected: true, note: 'Forklift 1,4 m dari jalur pejalan kaki', x: 330, y: 66, dir: 105 },
  { code: 'CAM-05', loc: 'Jalur Kemas Line 1A', zone: 'Jalur Kemas', model: 'DefectNet-Line2', res: '1080p', fps: 30.0, latMs: 11.6, events: 3, plcTrig: 3, conf: 0.92, interlock: 'Y05 Ejector 1A', status: 'Normal', tone: 'ok', x: 112, y: 174, dir: 0 },
  { code: 'CAM-06', loc: 'Jalur Kemas Line 2A', zone: 'Jalur Kemas', model: 'DefectNet-Line2', res: '1080p', fps: 30.0, latMs: 12.0, events: 4, plcTrig: 4, conf: 0.91, interlock: 'Y06 Ejector 2A', status: 'Normal', tone: 'ok', x: 222, y: 174, dir: 0 },
  { code: 'CAM-07', loc: 'Jalur Kemas Line 2B', zone: 'Jalur Kemas', model: 'DefectNet-Line2', res: '1080p', fps: 30.0, latMs: 11.8, events: 4, plcTrig: 4, conf: 0.89, interlock: 'Y07 PLC Eject', status: 'Peringatan', tone: 'warn', note: 'Tinta kode batch buram pada 4 karton', x: 318, y: 174, dir: 0 },
  { code: 'CAM-08', loc: 'Jalur Kemas Line 3A', zone: 'Jalur Kemas', model: 'DefectNet-Line2', res: '1080p', fps: 30.0, latMs: 12.1, events: 3, plcTrig: 3, conf: 0.94, interlock: 'Y08 Ejector 3A', status: 'Normal', tone: 'ok', x: 112, y: 232, dir: 0 },
  { code: 'CAM-09', loc: 'Area Pressing & Stamping', zone: 'Smelter & Press', model: 'YOLOv8m-APD-TRT', res: '1080p', fps: 28.0, latMs: 15.2, events: 5, plcTrig: 1, conf: 0.88, interlock: 'DO-09 Buzzer K3', status: 'Peringatan', tone: 'warn', note: 'Sarung tangan tahan panas terlepas', x: 432, y: 158, dir: 0 },
  { code: 'CAM-10', loc: 'Koridor Tungku Induksi', zone: 'Smelter & Press', model: 'HeatZone-APD-v2', res: '1080p', fps: 28.0, latMs: 15.6, events: 2, plcTrig: 0, conf: 0.95, interlock: 'DO-10 Lampu Zona', status: 'Normal', tone: 'ok', x: 432, y: 214, dir: 0 },
  { code: 'CAM-11', loc: 'Gerbang Gudang Kimia', zone: 'Gudang Kimia', model: 'PPE-ChemGate-v4', res: '1080p', fps: 24.0, latMs: 13.4, events: 2, plcTrig: 0, conf: 0.98, interlock: 'DO-11 Turnstile', status: 'Normal', tone: 'ok', note: 'Helm + kacamata terverifikasi 12 masuk', x: 74, y: 300, dir: -30 },
  { code: 'CAM-12', loc: 'Rak Penyimpanan B3', zone: 'Gudang Kimia', model: 'PPE-ChemGate-v4', res: '1080p', fps: 24.0, latMs: 13.9, events: 1, plcTrig: 0, conf: 0.96, interlock: 'DO-12 Exhaust', status: 'Normal', tone: 'ok', x: 168, y: 300, dir: -90 },
  { code: 'CAM-13', loc: 'Gudang Barang Jadi A', zone: 'Gudang Jadi', model: 'ForkliftProx-v3', res: '1080p', fps: 28.0, latMs: 14.0, events: 2, plcTrig: 0, conf: 0.93, interlock: 'DO-13 Strobe', status: 'Normal', tone: 'ok', x: 286, y: 300, dir: -90 },
  { code: 'CAM-14', loc: 'Workshop Maintenance', zone: 'Maintenance', model: 'YOLOv8m-APD-TRT', res: '1080p', fps: 28.0, latMs: 14.5, events: 2, plcTrig: 0, conf: 0.92, interlock: 'Log K3L Saja', status: 'Normal', tone: 'ok', x: 374, y: 300, dir: -90 },
  { code: 'CAM-15', loc: 'Airlock Ruang Dingin', zone: 'Ruang Dingin', model: 'ColdDoor-Timer', res: '720p', fps: 28.4, latMs: 10.8, events: 2, plcTrig: 0, conf: 0.97, interlock: 'DO-15 Alarm Pintu', status: 'Normal', tone: 'ok', note: 'Pintu terbuka 18 dtk / batas 45 dtk (-19,4 C)', x: 482, y: 302, dir: -135 },
  { code: 'CAM-16', loc: 'Ruang Panel & Trafo 20kV', zone: 'Utilitas & Panel', model: 'Intrusion-OT-v2', res: '1080p', fps: 28.0, latMs: 12.4, events: 1, plcTrig: 0, conf: 0.99, interlock: 'DO-16 Akses OT', status: 'Normal', tone: 'ok', x: 514, y: 66, dir: 145 },
];

const QA_LINES = [
  { line: 'Line 1A', cam: 'CAM-05', sku: 'Baut Baja M12 · Dus 20kg', inspected: 2640, inkBlur: 0, labelTilt: 2, sealOpen: 1, dented: 0, speedMs: 1.18, oee: 91.4, status: 'Normal', tone: 'ok' },
  { line: 'Line 2A', cam: 'CAM-06', sku: 'Flange Industri DN80', inspected: 2520, inkBlur: 1, labelTilt: 2, sealOpen: 1, dented: 0, speedMs: 1.21, oee: 89.8, status: 'Normal', tone: 'ok' },
  { line: 'Line 2B', cam: 'CAM-07', sku: 'Pelat Sambung S45C · Ekspor', inspected: 2860, inkBlur: 4, labelTilt: 0, sealOpen: 0, dented: 0, speedMs: 1.24, oee: 87.2, status: 'Periksa TIJ', tone: 'warn' },
  { line: 'Line 3A', cam: 'CAM-08', sku: 'Komponen Bracket Otomotif', inspected: 2480, inkBlur: 0, labelTilt: 1, sealOpen: 1, dented: 1, speedMs: 1.15, oee: 92.6, status: 'Normal', tone: 'ok' },
];

const QA_REJECT_LOGS = [
  { id: 'EJC-2B-0414', time: '19:41:12', line: 'Line 2B', cam: 'CAM-07', batch: 'CKR-261122-B4', defect: 'Tinta kode batch buram', metric: 'Kontras 31%', conf: '0,92', action: 'PLC-Y07 Eject', status: 'Karantina', tone: 'warn' },
  { id: 'EJC-2B-0413', time: '19:38:46', line: 'Line 2B', cam: 'CAM-07', batch: 'CKR-261122-B4', defect: 'Tinta kode batch buram', metric: 'Kontras 28%', conf: '0,94', action: 'PLC-Y07 Eject', status: 'Karantina', tone: 'warn' },
  { id: 'EJC-2B-0412', time: '19:34:09', line: 'Line 2B', cam: 'CAM-07', batch: 'CKR-261122-B4', defect: 'Tinta kode batch buram', metric: 'Kontras 34%', conf: '0,89', action: 'PLC-Y07 Eject', status: 'Karantina', tone: 'warn' },
  { id: 'EJC-2B-0411', time: '19:29:51', line: 'Line 2B', cam: 'CAM-07', batch: 'CKR-261122-B4', defect: 'Tinta kode batch buram', metric: 'Kontras 33%', conf: '0,90', action: 'PLC-Y07 Eject', status: 'Karantina', tone: 'warn' },
  { id: 'EJC-2A-0398', time: '19:14:22', line: 'Line 2A', cam: 'CAM-06', batch: 'CKR-261122-A7', defect: 'Label miring >3°', metric: 'Sudut 5,4°', conf: '0,95', action: 'PLC-Y06 Eject', status: 'Re-label', tone: 'info' },
  { id: 'EJC-3A-0394', time: '18:52:07', line: 'Line 3A', cam: 'CAM-08', batch: 'CKR-261122-C2', defect: 'Segel lakban terbuka', metric: 'Celah 18 mm', conf: '0,96', action: 'PLC-Y08 Eject', status: 'Re-seal', tone: 'info' },
  { id: 'EJC-1A-0389', time: '18:27:40', line: 'Line 1A', cam: 'CAM-05', batch: 'CKR-261122-D1', defect: 'Label miring >3°', metric: 'Sudut 4,8°', conf: '0,91', action: 'PLC-Y05 Eject', status: 'Re-label', tone: 'info' },
  { id: 'EJC-2A-0382', time: '17:58:15', line: 'Line 2A', cam: 'CAM-06', batch: 'CKR-261122-A6', defect: 'Segel lakban terbuka', metric: 'Celah 14 mm', conf: '0,93', action: 'PLC-Y06 Eject', status: 'Re-seal', tone: 'info' },
  { id: 'EJC-3A-0375', time: '17:31:04', line: 'Line 3A', cam: 'CAM-08', batch: 'CKR-261122-C1', defect: 'Karton penyok sudut', metric: 'Deform 11%', conf: '0,88', action: 'PLC-Y08 Eject', status: 'Ganti Dus', tone: 'neutral' },
  { id: 'EJC-1A-0368', time: '16:44:29', line: 'Line 1A', cam: 'CAM-05', batch: 'CKR-261122-D1', defect: 'Label miring >3°', metric: 'Sudut 4,2°', conf: '0,92', action: 'PLC-Y05 Eject', status: 'Re-label', tone: 'info' },
];

const HSE_ZONES = [
  { zone: 'Loading Dock Bay 1–4', cams: 'CAM-01..04', entries: 184, compliant: 179, violations: 5, helmPct: 98.9, vestPct: 99.5, specPct: 97.3, note: 'Jarak forklift Bay 3', tone: 'bad', status: 'Tindak Lanjut' },
  { zone: 'Jalur Kemas Line 1–3', cams: 'CAM-05..08', entries: 246, compliant: 245, violations: 1, helmPct: 99.6, vestPct: 100.0, specPct: 99.6, note: 'Tutup telinga ok', tone: 'ok', status: 'Patuh SMK3' },
  { zone: 'Gudang Bahan Kimia', cams: 'CAM-11..12', entries: 72, compliant: 72, violations: 0, helmPct: 100.0, vestPct: 100.0, specPct: 100.0, note: '12 masuk terakhir 100%', tone: 'ok', status: 'Patuh SMK3' },
  { zone: 'Area Smelter & Pressing', cams: 'CAM-09..10', entries: 158, compliant: 153, violations: 5, helmPct: 99.4, vestPct: 98.7, specPct: 96.8, note: 'Sarung tangan panas', tone: 'warn', status: 'Pengawasan' },
  { zone: 'Ruang Dingin & Airlock', cams: 'CAM-15', entries: 64, compliant: 64, violations: 0, helmPct: 100.0, vestPct: 100.0, specPct: 100.0, note: 'Jaket termal + pintu 18 dtk', tone: 'ok', status: 'Patuh SMK3' },
  { zone: 'Gudang Barang Jadi', cams: 'CAM-13', entries: 132, compliant: 131, violations: 1, helmPct: 99.2, vestPct: 100.0, specPct: 99.2, note: 'Rompi reflektif ok', tone: 'ok', status: 'Patuh SMK3' },
  { zone: 'Workshop Maintenance', cams: 'CAM-14', entries: 96, compliant: 95, violations: 1, helmPct: 99.0, vestPct: 99.0, specPct: 99.0, note: 'Kacamata gerinda ok', tone: 'ok', status: 'Patuh SMK3' },
  { zone: 'Ruang Panel & Utilitas', cams: 'CAM-16', entries: 48, compliant: 48, violations: 0, helmPct: 100.0, vestPct: 100.0, specPct: 100.0, note: 'Izin LOTO terverifikasi', tone: 'ok', status: 'Patuh SMK3' },
];

const ZONE_RULES = [
  { id: 'RULE-K3-01', cam: 'CAM-04', name: 'Batas Jarak Forklift Bay 3', type: 'FORKLIFT_PROXIMITY', thresh: '< 2,50 m', debounce: '6 frame', plc: 'DO-04 STROBE+SIRINE', channel: 'PLC + WA + TG', hits: 5, active: true, tone: 'bad' },
  { id: 'RULE-QA-02', cam: 'CAM-07', name: 'Inspeksi Tinta Batch Line 2B', type: 'BATCH_INK_BLUR', thresh: 'Kontras < 45%', debounce: '2 frame', plc: 'Y07 PNEUMATIC_EJECT', channel: 'PLC + QA HMI', hits: 4, active: false, tone: 'warn' },
  { id: 'RULE-K3-03', cam: 'CAM-09', name: 'APD Sarung Tangan Pressing', type: 'PPE_GLOVE_MISSING', thresh: 'Conf >= 0,85', debounce: '10 frame', plc: 'DO-09 BUZZER_K3', channel: 'PLC + WA K3', hits: 5, active: false, tone: 'warn' },
  { id: 'RULE-K3-04', cam: 'CAM-11', name: 'Wajib Helm & Kacamata Kimia', type: 'PPE_CHEM_GATE', thresh: 'Helm+Goggle', debounce: '5 frame', plc: 'DO-11 TURNSTILE_LOCK', channel: 'PLC + Log', hits: 0, active: false, tone: 'ok' },
  { id: 'RULE-QA-05', cam: 'CAM-06', name: 'Kemiringan Label Karton 2A', type: 'LABEL_TILT_ANGLE', thresh: '> 3,0 derajat', debounce: '2 frame', plc: 'Y06 PNEUMATIC_EJECT', channel: 'PLC + QA HMI', hits: 2, active: false, tone: 'ok' },
  { id: 'RULE-LOG-06', cam: 'CAM-15', name: 'Batas Buka Pintu Airlock', type: 'DOOR_OPEN_DURATION', thresh: '> 45 detik', debounce: '15 frame', plc: 'DO-15 COLD_ALARM', channel: 'PLC + TG Ops', hits: 0, active: false, tone: 'ok' },
  { id: 'RULE-K3-07', cam: 'CAM-10', name: 'Zona Radiasi Tungku Induksi', type: 'RED_ZONE_INTRUSION', thresh: 'Polygon ROI', debounce: '4 frame', plc: 'DO-10 BEACON_RED', channel: 'PLC + WA K3', hits: 0, active: false, tone: 'ok' },
  { id: 'RULE-OT-08', cam: 'CAM-16', name: 'Akses Tanpa LOTO Trafo 20kV', type: 'RESTRICTED_OT_ROOM', thresh: 'Conf >= 0,88', debounce: '8 frame', plc: 'DO-16 SEC_RELAY', channel: 'PLC + SOC OT', hits: 0, active: false, tone: 'ok' },
];

const EDGE_NODES = [
  { node: 'EDGE-GPU-02', role: 'Primary Inference (16 RTSP)', hw: 'NVIDIA RTX 5000 Ada 32GB · Xeon 16c', gpuPct: 68, vramTxt: '21,8 / 32 GB', tempC: 71, diskPct: 44, uptime: '48h 14j', status: 'Aktif Utama', tone: 'ok' },
  { node: 'EDGE-GPU-01', role: 'Warm HA Failover (<2 dtk)', hw: 'NVIDIA RTX 5000 Ada 32GB · Xeon 16c', gpuPct: 12, vramTxt: '6,4 / 32 GB', tempC: 44, diskPct: 41, uptime: '48h 14j', status: 'Siaga HA', tone: 'info' },
  { node: 'PLC-GW-01', role: '.NET Edge Agent + EMQX MQTT', hw: 'Advantech IPC · Dual NIC OT/IT', gpuPct: 24, vramTxt: '3,2 / 16 GB', tempC: 39, diskPct: 28, uptime: '92h 06j', status: 'S7-1500 OK', tone: 'ok' },
  { node: 'STORE-01', role: 'TimescaleDB + MinIO Lokal', hw: 'RAID-10 NVMe 8 TB · WORM 90 Hari', gpuPct: 31, vramTxt: '18,6 / 64 GB', tempC: 42, diskPct: 23, uptime: '92h 06j', status: 'Zero Cloud', tone: 'ok' },
];

const MQTT_FRAMES = [
  { ts: '19:42:08.412', topic: 'plant/cikarang/cam04/event', payload: '{"type":"FORKLIFT_PROXIMITY","zone":"BAY3","dist_m":1.4,"action":"STROBE_ON"}', plc: 'S7-DO04 ON', tone: 'bad' },
  { ts: '19:42:08.940', topic: 'plant/cikarang/notify/wa', payload: '{"group":"K3-SHIFT2-CKR","alarm":"ALM-8841","ack_sla_s":60,"sent_ms":528}', plc: 'WA 200 OK', tone: 'warn' },
  { ts: '19:41:12.188', topic: 'plant/cikarang/cam07/qa', payload: '{"type":"BATCH_INK_BLUR","line":"2B","reject_shift":4,"action":"PLC_EJECT"}', plc: 'S7-Y07 PULSE', tone: 'warn' },
  { ts: '19:39:44.095', topic: 'plant/cikarang/cam11/ppe', payload: '{"type":"PPE_GATE_PASS","zone":"CHEM","entries":12,"compliance":1.00}', plc: 'TURNSTILE OK', tone: 'ok' },
  { ts: '19:37:19.604', topic: 'plant/cikarang/cam15/door', payload: '{"type":"AIRLOCK_CYCLE","open_s":18,"limit_s":45,"temp_c":-19.4}', plc: 'NORMAL', tone: 'ok' },
  { ts: '19:31:02.311', topic: 'plant/cikarang/cam09/ppe', payload: '{"type":"PPE_GLOVE_WARN","zone":"PRESS","conf":0.88,"action":"BUZZER_3S"}', plc: 'S7-DO09 3S', tone: 'warn' },
];

// ============================================================================
// DERIVED AGGREGATES & MATHEMATICAL CONSISTENCY ASSERTION
// ============================================================================

const TOTAL_CAMS = CAMERAS.length;
const AVG_FPS = Number((CAMERAS.reduce((a, c) => a + c.fps, 0) / TOTAL_CAMS).toFixed(1));
const AVG_LAT_MS = Number((CAMERAS.reduce((a, c) => a + c.latMs, 0) / TOTAL_CAMS).toFixed(1));
const TOTAL_CAM_EVENTS = CAMERAS.reduce((a, c) => a + c.events, 0);
const TOTAL_PLC_TRIGS = CAMERAS.reduce((a, c) => a + c.plcTrig, 0);

const CAM_BAD_COUNT = CAMERAS.filter((c) => c.tone === 'bad').length;
const CAM_WARN_COUNT = CAMERAS.filter((c) => c.tone === 'warn').length;
const CAM_OK_COUNT = CAMERAS.filter((c) => c.tone === 'ok').length;

const QA_TOTAL_INSPECTED = QA_LINES.reduce((a, l) => a + l.inspected, 0);
const QA_SUM_INK = QA_LINES.reduce((a, l) => a + l.inkBlur, 0);
const QA_SUM_TILT = QA_LINES.reduce((a, l) => a + l.labelTilt, 0);
const QA_SUM_SEAL = QA_LINES.reduce((a, l) => a + l.sealOpen, 0);
const QA_SUM_DENT = QA_LINES.reduce((a, l) => a + l.dented, 0);
const QA_TOTAL_REJECTS = QA_SUM_INK + QA_SUM_TILT + QA_SUM_SEAL + QA_SUM_DENT;
const QA_TOTAL_GOOD = QA_TOTAL_INSPECTED - QA_TOTAL_REJECTS;
const QA_FPY_PCT = (QA_TOTAL_GOOD / QA_TOTAL_INSPECTED) * 100;
const QA_AVG_OEE = QA_LINES.reduce((a, l) => a + l.oee, 0) / QA_LINES.length;
const LINE2B_REJECTS = QA_LINES.find((l) => l.line === 'Line 2B').inkBlur;

const HSE_TOTAL_ENTRIES = HSE_ZONES.reduce((a, z) => a + z.entries, 0);
const HSE_TOTAL_COMPLIANT = HSE_ZONES.reduce((a, z) => a + z.compliant, 0);
const HSE_TOTAL_VIOLATIONS = HSE_ZONES.reduce((a, z) => a + z.violations, 0);
const HSE_COMPLIANCE_PCT = (HSE_TOTAL_COMPLIANT / HSE_TOTAL_ENTRIES) * 100;

export function verifyMath() {
  if (TOTAL_CAMS !== 16) throw new Error(`Expected 16 RTSP cameras, got ${TOTAL_CAMS}`);
  if (AVG_FPS !== 28.4) throw new Error(`Expected avg FPS 28.4, got ${AVG_FPS}`);
  if (CAM_BAD_COUNT + CAM_WARN_COUNT + CAM_OK_COUNT !== TOTAL_CAMS) {
    throw new Error('Camera status count mismatch');
  }
  if (TOTAL_CAM_EVENTS !== 42) throw new Error(`Expected 42 shift events, got ${TOTAL_CAM_EVENTS}`);
  if (TOTAL_PLC_TRIGS !== 17) throw new Error(`Expected 17 PLC triggers, got ${TOTAL_PLC_TRIGS}`);

  const qaCamTrigs = CAMERAS.filter((c) => c.zone === 'Jalur Kemas').reduce((a, c) => a + c.plcTrig, 0);
  if (qaCamTrigs !== QA_TOTAL_REJECTS) {
    throw new Error(`QA camera PLC triggers (${qaCamTrigs}) != QA total rejects (${QA_TOTAL_REJECTS})`);
  }
  if (QA_TOTAL_INSPECTED !== 10500) throw new Error(`Expected 10500 inspected cartons, got ${QA_TOTAL_INSPECTED}`);
  if (QA_TOTAL_REJECTS !== 14) throw new Error(`Expected 14 QA rejects, got ${QA_TOTAL_REJECTS}`);
  if (LINE2B_REJECTS !== 4) throw new Error(`Expected Line 2B rejects = 4, got ${LINE2B_REJECTS}`);

  for (const z of HSE_ZONES) {
    if (z.compliant + z.violations !== z.entries) {
      throw new Error(`HSE zone ${z.zone} compliant+violations != entries`);
    }
  }
  if (HSE_TOTAL_ENTRIES !== 1000) throw new Error(`Expected 1000 HSE entries, got ${HSE_TOTAL_ENTRIES}`);
  if (HSE_TOTAL_COMPLIANT !== 987) throw new Error(`Expected 987 HSE compliant, got ${HSE_TOTAL_COMPLIANT}`);
  if (HSE_TOTAL_VIOLATIONS !== 13) throw new Error(`Expected 13 HSE violations, got ${HSE_TOTAL_VIOLATIONS}`);
  if (Number(HSE_COMPLIANCE_PCT.toFixed(1)) !== 98.7) {
    throw new Error(`Expected 98.7% APD compliance, got ${HSE_COMPLIANCE_PCT}`);
  }
}

// ============================================================================
// DARK INDUSTRIAL SCADA THEME & SHARED CHROME (DISTINCT FROM LIGHT SAAS)
// ============================================================================

const SCADA_CSS = `
  :root {
    --sc-bg: #0e1319;
    --sc-surface: #141b24;
    --sc-surface-2: #1a2330;
    --sc-surface-3: #10161f;
    --sc-border: #273344;
    --sc-border-strong: #37475d;
    --sc-text: #e6edf6;
    --sc-text-2: #b5c4d8;
    --sc-muted: #8295ae;
    --sc-brand: #9a5b00;
    --sc-amber: #f59e0b;
    --sc-amber-soft: #2b1e0a;
    --sc-amber-bd: #7c4a08;
    --sc-ok: #34d399;
    --sc-ok-bg: #0a291f;
    --sc-ok-bd: #115e46;
    --sc-warn: #fbbf24;
    --sc-warn-bg: #2c1e08;
    --sc-warn-bd: #855209;
    --sc-bad: #fb7185;
    --sc-bad-bg: #32101a;
    --sc-bad-bd: #9f1239;
    --sc-info: #38bdf8;
    --sc-info-bg: #0c2438;
    --sc-info-bd: #0369a1;
  }

  /* Override light defaults from chrome.mjs into dark SCADA surfaces */
  .e-panel {
    background: var(--sc-surface);
    border: 1px solid var(--sc-border);
    border-radius: 3px;
  }
  .e-panel-head {
    height: 31px;
    padding: 0 10px;
    background: var(--sc-surface-2);
    border-bottom: 1px solid var(--sc-border);
  }
  .e-panel-title {
    color: var(--sc-text);
    font-size: 11.2px;
    font-weight: 700;
  }
  .e-panel-sub {
    color: var(--sc-muted);
    font-size: 9.8px;
  }
  .e-panel-body {
    padding: 8px 10px;
  }

  .e-kpi {
    background: var(--sc-surface);
    border: 1px solid var(--sc-border);
    border-radius: 3px;
    padding: 7px 9px;
  }
  .e-kpi-top { color: var(--sc-muted); font-size: 9.8px; }
  .e-kpi-val { color: var(--sc-text); font-size: 16.5px; }
  .e-kpi-foot { color: var(--sc-muted); font-size: 9.5px; }

  .e-btn {
    height: 24px;
    padding: 0 9px;
    border-radius: 2px;
    border: 1px solid var(--sc-border-strong);
    background: var(--sc-surface-2);
    color: var(--sc-text);
    font-size: 10.2px;
    font-weight: 600;
  }
  .e-btn-primary {
    background: var(--sc-brand);
    border-color: #c2780c;
    color: #ffffff;
  }
  .e-btn-danger {
    background: var(--sc-bad-bg);
    border-color: var(--sc-bad-bd);
    color: var(--sc-bad);
  }

  .e-badge {
    border-radius: 2px;
    font-size: 9.6px;
    padding: 1.5px 5.5px;
    font-weight: 700;
  }
  .e-badge-neutral { background: #1e2938; color: #cbd5e1; border-color: #36455a; }
  .e-badge-accent  { background: var(--sc-amber-soft); color: #fcd34d; border-color: var(--sc-amber-bd); }
  .e-badge-ok      { background: var(--sc-ok-bg); color: var(--sc-ok); border-color: var(--sc-ok-bd); }
  .e-badge-warn    { background: var(--sc-warn-bg); color: var(--sc-warn); border-color: var(--sc-warn-bd); }
  .e-badge-bad     { background: var(--sc-bad-bg); color: var(--sc-bad); border-color: var(--sc-bad-bd); }
  .e-badge-info    { background: var(--sc-info-bg); color: var(--sc-info); border-color: var(--sc-info-bd); }
  .e-badge-dark    { background: #0a0f14; color: #cbd5e1; border-color: #2c3a4d; }

  table.e-table th {
    background: #10161e;
    color: #93a7c0;
    border-bottom: 1px solid var(--sc-border-strong);
    font-size: 9.6px;
    padding: 5px 7px;
  }
  table.e-table td {
    color: var(--sc-text);
    border-bottom: 1px solid #1e2836;
    padding: 4.5px 7px;
    font-size: 10.5px;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #121922;
  }
  table.e-table tbody tr.is-selected {
    background: #271c0b !important;
    box-shadow: inset 2.5px 0 0 var(--sc-amber);
  }
  table.e-table tbody tr.is-warn {
    background: #22190a !important;
  }
  table.e-table tbody tr.is-bad {
    background: #281018 !important;
  }
  table.e-table tfoot td {
    background: #10161e;
    color: var(--sc-text);
    border-top: 1px solid var(--sc-border-strong);
    padding: 5.5px 7px;
    font-size: 10.4px;
  }

  /* SCADA Top Bar & Module Navigation Strip */
  .sc-topbar {
    height: 38px;
    background: #0a0e13;
    border-bottom: 1px solid #233042;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .sc-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 12.5px;
    color: #f8fafc;
    white-space: nowrap;
  }
  .sc-brand-mark {
    width: 24px;
    height: 24px;
    border-radius: 2px;
    background: var(--sc-brand);
    border: 1px solid #d9820b;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .sc-chip {
    height: 23px;
    padding: 0 8px;
    border-radius: 2px;
    background: #151d28;
    border: 1px solid #2b394d;
    color: #d4e0ee;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .sc-chip-amber {
    background: #281b07;
    border-color: #8a5308;
    color: #fcd34d;
  }
  .sc-chip-ok {
    background: #09261d;
    border-color: #146348;
    color: #6ee7b7;
  }

  .sc-navstrip {
    height: 34px;
    background: #121821;
    border-bottom: 1px solid var(--sc-border);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .sc-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
  }
  .sc-tab {
    height: 26px;
    padding: 0 10px;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #9bb0c9;
    font-size: 10.8px;
    font-weight: 600;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .sc-tab.is-active {
    background: #261b09;
    color: #fde68a;
    border-color: #9a5b00;
  }
  .sc-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 0.5px 4.5px;
    border-radius: 2px;
    background: #1d2735;
    color: #cbd5e1;
  }
  .sc-tab.is-active .sc-tab-cnt {
    background: #9a5b00;
    color: #ffffff;
  }
  .sc-tab-cnt-bad {
    background: #4c1121;
    color: #fda4af;
  }

  .sc-main {
    flex: 1;
    min-height: 0;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  .sc-alarm-bar {
    height: 32px;
    padding: 0 10px;
    border-radius: 3px;
    background: #2b1018;
    border: 1px solid #9f1239;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }

  .sc-footer {
    height: 24px;
    background: #0a0e13;
    border-top: 1px solid #233042;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.5px;
    color: #8498b2;
    flex-shrink: 0;
  }

  /* Camera Viewport Tile */
  .cam-tile {
    background: #0c1117;
    border: 1px solid #293647;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    min-width: 0;
  }
  .cam-tile-bad { border-color: #be123c; }
  .cam-tile-warn { border-color: #b45309; }
  .cam-tile-ok { border-color: #1f3344; }
  .cam-head {
    height: 24px;
    padding: 0 8px;
    background: #141c26;
    border-bottom: 1px solid #253244;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-shrink: 0;
  }
  .cam-foot {
    height: 23px;
    padding: 0 8px;
    background: #10161e;
    border-top: 1px solid #222e3e;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-family: var(--e-mono);
    font-size: 9.4px;
    color: #93a7c0;
    flex-shrink: 0;
  }

  .kv-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4.5px 0;
    border-bottom: 1px solid #1e2836;
    font-size: 10.4px;
  }
  .kv-row:last-child { border-bottom: 0; }
  .kv-k { color: var(--sc-muted); }
  .kv-v { color: var(--sc-text); font-weight: 600; text-align: right; }

  table.e-table.p2-cams td {
    padding: 8px 7px;
  }
  table.e-table.p5-nodes td {
    padding: 8.5px 7px;
  }

  .code-block {
    background: #0a0f15;
    border: 1px solid #253244;
    border-radius: 3px;
    padding: 7px 9px;
    font-family: var(--e-mono);
    font-size: 9.8px;
    line-height: 1.45;
    color: #cbd5e1;
    overflow: hidden;
  }
  .code-block-pre {
    white-space: pre;
  }
`;

function renderCapBarDark(pct, { warnAt = 75, critAt = 88, width = 34 } = {}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= critAt ? '#f43f5e' : clamped >= warnAt ? '#f59e0b' : '#10b981';
  return `<div style="display:flex;align-items:center;gap:6px;min-width:0;">
    <div style="flex:1;height:6px;background:#1f2a38;border-radius:2px;overflow:hidden;min-width:44px;">
      <div style="width:${clamped}%;height:100%;background:${color};"></div>
    </div>
    <span class="mono" style="font-size:9.8px;color:#cbd5e1;width:${width}px;text-align:right;flex-shrink:0;">${clamped.toFixed(0)}%</span>
  </div>`;
}

function renderScadaShell({ activeTab, pageTitle, rightActionsHtml = '', contentHtml }) {
  const tabs = [
    { id: 'p1', label: 'Grid Visi & Denah', icon: 'eye', cnt: '4 Live' },
    { id: 'p2', label: 'Kanal RTSP & Alarm', icon: 'activity', cnt: '16', bad: true },
    { id: 'p3', label: 'Kalibrasi ROI & PLC', icon: 'sliders', cnt: '8 Aturan' },
    { id: 'p4', label: 'Mutu Konveyor QA', icon: 'layers', cnt: '4 Reject' },
    { id: 'p5', label: 'Scorecard K3 & Klaster', icon: 'shield', cnt: '98,7%' },
  ];

  const tabsHtml = tabs
    .map(
      (t) => `<div class="sc-tab ${t.id === activeTab ? 'is-active' : ''}">
        ${ic(t.icon, 12, t.id === activeTab ? '#fbbf24' : '#7f93ad')}
        <span>${esc(t.label)}</span>
        <span class="sc-tab-cnt ${t.bad && t.id !== activeTab ? 'sc-tab-cnt-bad' : ''}">${esc(t.cnt)}</span>
      </div>`
    )
    .join('');

  const bodyHtml = `
    <header class="sc-topbar">
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        <div class="sc-brand">
          <span class="sc-brand-mark">LE</span>
          <span>LokalEdge Vision</span>
          <span style="color:#5c6f88;font-weight:400;">|</span>
          <span style="color:#cbd5e1;font-weight:600;font-size:11.2px;">Grid Visi Pabrik Cikarang B</span>
        </div>
        <span class="sc-chip sc-chip-amber mono" style="font-size:9.6px;">EDGE-GPU-02 · 16 KAMERA RTSP</span>
        <span class="sc-chip">
          ${ic('server', 11, '#94a3b8')}
          <span>PT Baja Logam Nusantara · GIIC Blok C-14</span>
        </span>
      </div>
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="sc-chip mono" style="font-size:9.6px;">
          ${ic('clock', 11, '#94a3b8')}
          <span>Shift 2 · 19:42:08 WIB</span>
        </span>
        <span class="sc-chip sc-chip-ok mono" style="font-size:9.6px;">
          <span class="dot dot-ok"></span>
          <span>PLC S7-1500 · MQTT 0 DROP</span>
        </span>
        <div style="display:flex;align-items:center;gap:6px;padding-left:7px;border-left:1px solid #263345;">
          <span style="width:22px;height:22px;border-radius:2px;background:#9a5b00;color:#fff;font-size:9.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">HK</span>
          <div style="line-height:1.15;">
            <div style="font-size:10.2px;font-weight:700;color:#f1f5f9;">Ir. Hendra Kusuma</div>
            <div style="font-size:8.8px;color:#8295ae;">Kepala K3L & Otomasi</div>
          </div>
        </div>
      </div>
    </header>

    <nav class="sc-navstrip">
      <div class="sc-tabs">${tabsHtml}</div>
      <div style="display:flex;align-items:center;gap:6px;">
        ${rightActionsHtml}
      </div>
    </nav>

    <main class="sc-main">
      ${contentHtml}
    </main>

    <footer class="sc-footer">
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="display:inline-flex;align-items:center;gap:5px;"><span class="dot dot-ok"></span>TensorRT 10.4 FP16 · 16/16 RTSP ONVIF Profile T</span>
        <span>TimescaleDB: 14,2 jt event (Retensi 90h)</span>
        <span>MinIO Lokal: 1,84 TB / 8,0 TB (Anonim)</span>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <span>Segmen OT: 10.42.8.0/24 · Air-Gapped On-Prem</span>
        <span style="color:#6ee7b7;">Cloud Egress: 0 KB/jam</span>
      </div>
    </footer>
  `;

  return wrapEnterpriseHtml({
    title: `LokalEdge Vision — ${pageTitle}`,
    accent: '#9a5b00',
    accentSoft: '#2b1e0a',
    accentInk: '#fcd34d',
    bg: '#0e1319',
    surface: '#141b24',
    surface2: '#1a2330',
    border: '#273344',
    borderStrong: '#37475d',
    text: '#e6edf6',
    text2: '#b5c4d8',
    muted: '#8295ae',
    extraCss: SCADA_CSS,
    bodyHtml,
  });
}

// ============================================================================
// CUSTOM INDUSTRIAL VECTOR SVGS (CAMERA FEEDS, FLOORPLAN, CALIBRATOR, P&ID)
// ============================================================================

function svgCam04Feed() {
  return `<svg viewBox="0 0 470 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;background:#0a0f15;">
    <!-- Perspective warehouse bay floor grid -->
    <polygon points="0,78 470,78 470,282 0,282" fill="#101720" />
    <rect x="0" y="0" width="470" height="78" fill="#151e2b" />
    <!-- Loading dock bay doors -->
    <rect x="24" y="14" width="110" height="64" fill="#1b2636" stroke="#2c3d54" stroke-width="1" />
    <line x1="24" y1="30" x2="134" y2="30" stroke="#263448" stroke-width="1" />
    <line x1="24" y1="46" x2="134" y2="46" stroke="#263448" stroke-width="1" />
    <line x1="24" y1="62" x2="134" y2="62" stroke="#263448" stroke-width="1" />
    <text x="79" y="11" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#8295ae">BAY-3 DOCK</text>

    <rect x="172" y="14" width="126" height="64" fill="#0d141d" stroke="#364861" stroke-width="1" />
    <text x="235" y="48" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#4f6480">TRUK KONTAINER · B 9421 UXR</text>

    <rect x="336" y="14" width="110" height="64" fill="#1b2636" stroke="#2c3d54" stroke-width="1" />
    <text x="391" y="11" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#8295ae">BAY-4 DOCK</text>

    <!-- Floor perspective lines -->
    <line x1="0" y1="126" x2="470" y2="126" stroke="#1b2635" stroke-width="1" />
    <line x1="0" y1="186" x2="470" y2="186" stroke="#1b2635" stroke-width="1" />
    <line x1="0" y1="246" x2="470" y2="246" stroke="#1b2635" stroke-width="1" />
    <line x1="120" y1="78" x2="40" y2="282" stroke="#1b2635" stroke-width="1" />
    <line x1="235" y1="78" x2="235" y2="282" stroke="#1b2635" stroke-width="1" />
    <line x1="350" y1="78" x2="430" y2="282" stroke="#1b2635" stroke-width="1" />

    <!-- Pedestrian Walkway Polygon (ROI Red Violation Zone) -->
    <polygon points="292,88 388,88 456,272 316,272" fill="#be123c" fill-opacity="0.16" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="6,3" />
    <text x="372" y="106" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">ROI: JALUR PEJALAN KAKI</text>

    <!-- Forklift Corridor Polygon -->
    <polygon points="56,96 276,96 296,266 18,266" fill="#d97706" fill-opacity="0.07" stroke="#b45309" stroke-width="1" stroke-dasharray="4,3" />
    <text x="148" y="112" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#d9820b">KORIDOR FORKLIFT B3</text>

    <!-- Forklift Isometric Silhouette Crossing Line -->
    <g transform="translate(154,132)">
      <!-- Forks + Pallet -->
      <rect x="86" y="56" width="52" height="10" fill="#475569" stroke="#94a3b8" stroke-width="1" />
      <rect x="92" y="24" width="44" height="32" fill="#7c4a08" stroke="#d9820b" stroke-width="1.2" />
      <line x1="92" y1="40" x2="136" y2="40" stroke="#9a5b00" stroke-width="1" />
      <!-- Mast -->
      <rect x="78" y="6" width="8" height="68" fill="#64748b" stroke="#cbd5e1" stroke-width="1" />
      <!-- Chassis -->
      <polygon points="10,42 78,42 78,74 4,74" fill="#b45309" stroke="#f59e0b" stroke-width="1.3" />
      <!-- Roll cage -->
      <polyline points="16,42 24,10 66,10 74,42" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <!-- Wheels -->
      <circle cx="22" cy="76" r="11" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
      <circle cx="64" cy="76" r="12" fill="#1e293b" stroke="#94a3b8" stroke-width="2" />
    </g>
    <!-- Bounding Box: Forklift -->
    <rect x="148" y="130" width="152" height="94" fill="none" stroke="#f43f5e" stroke-width="1.8" />
    <rect x="148" y="115" width="120" height="15" fill="#be123c" />
    <text x="153" y="125.5" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">FORKLIFT_04 · 0.96</text>

    <!-- Pedestrian Worker Silhouette (with anonymized face blur box + helmet) -->
    <g transform="translate(342,146)">
      <!-- Hardhat -->
      <path d="M10,12 Q18,2 26,12 Z" fill="#f59e0b" stroke="#fde68a" stroke-width="1" />
      <!-- Anonymized Head -->
      <rect x="12" y="12" width="12" height="10" rx="2" fill="#475569" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,1" />
      <!-- High-vis Vest -->
      <rect x="8" y="24" width="20" height="28" rx="2" fill="#10b981" stroke="#6ee7b7" stroke-width="1" />
      <line x1="8" y1="36" x2="28" y2="36" stroke="#fde68a" stroke-width="2" />
      <!-- Legs -->
      <rect x="10" y="52" width="7" height="24" fill="#334155" />
      <rect x="19" y="52" width="7" height="24" fill="#334155" />
    </g>
    <!-- Bounding Box: Pedestrian -->
    <rect x="338" y="142" width="44" height="86" fill="none" stroke="#34d399" stroke-width="1.6" />
    <rect x="312" y="127" width="96" height="15" fill="#047857" />
    <text x="316" y="137.5" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">PEJALAN · 0.94</text>

    <!-- Proximity Violation Vector Line -->
    <line x1="300" y1="186" x2="338" y2="186" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2" />
    <circle cx="300" cy="186" r="3" fill="#f43f5e" />
    <circle cx="338" cy="186" r="3" fill="#f43f5e" />
    <rect x="275" y="194" width="88" height="16" rx="2" fill="#32101a" stroke="#f43f5e" stroke-width="1" />
    <text x="319" y="205" text-anchor="middle" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">JARAK: 1,4 m</text>

    <!-- Bottom-Left & Bottom-Right Camera OSD (Clear of Bay-3 Dock Label) -->
    <rect x="8" y="256" width="166" height="18" rx="2" fill="#0a0f15" fill-opacity="0.92" stroke="#be123c" stroke-width="1" />
    <circle cx="17" cy="265" r="3.5" fill="#f43f5e" />
    <text x="25" y="268" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">ALARM AKTIF · STROBE_ON</text>

    <rect x="358" y="256" width="104" height="18" rx="2" fill="#0a0f15" fill-opacity="0.92" stroke="#2c3a4d" stroke-width="1" />
    <text x="410" y="268" text-anchor="middle" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">ANON_BLUR: AKTIF</text>
  </svg>`;
}

function svgCam07Feed() {
  return `<svg viewBox="0 0 470 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;background:#0a0f15;">
    <!-- Overhead conveyor bed -->
    <rect x="0" y="54" width="470" height="174" fill="#131c27" stroke="#2a384c" stroke-width="1.5" />
    <!-- Conveyor rollers -->
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${18 + i * 31}" y1="56" x2="${18 + i * 31}" y2="226" stroke="#1d293a" stroke-width="2" />`).join('')}
    <!-- Guide rails -->
    <rect x="0" y="64" width="470" height="7" fill="#334155" />
    <rect x="0" y="211" width="470" height="7" fill="#334155" />

    <!-- Inspection ROI Zone -->
    <rect x="148" y="76" width="184" height="130" fill="#f59e0b" fill-opacity="0.06" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="5,3" />
    <text x="240" y="90" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">ROI INSPEKSI TINTA &amp; SEGEL LINE 2B</text>

    <!-- Carton 1 (OK - Passed) -->
    <g transform="translate(26,96)">
      <rect x="0" y="0" width="96" height="92" rx="2" fill="#2c2419" stroke="#8c6d46" stroke-width="1.2" />
      <line x1="0" y1="46" x2="96" y2="46" stroke="#64748b" stroke-width="4" />
      <rect x="14" y="14" width="54" height="22" fill="#e2e8f0" />
      <text x="18" y="24" font-size="7" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">CKR-2611-B4</text>
      <rect x="18" y="27" width="42" height="5" fill="#0f172a" />
    </g>
    <rect x="22" y="92" width="104" height="100" fill="none" stroke="#10b981" stroke-width="1.5" />
    <rect x="22" y="78" width="66" height="14" fill="#047857" />
    <text x="26" y="88" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">OK · 0.97</text>

    <!-- Carton 2 (REJECT - Blurry Batch Code Ink) -->
    <g transform="translate(182,96)">
      <rect x="0" y="0" width="102" height="92" rx="2" fill="#32271a" stroke="#b45309" stroke-width="1.4" />
      <line x1="0" y1="46" x2="102" y2="46" stroke="#64748b" stroke-width="4" />
      <rect x="16" y="14" width="60" height="24" fill="#cbd5e1" />
      <!-- Simulated smudged ink -->
      <rect x="20" y="19" width="48" height="4" fill="#94a3b8" />
      <rect x="22" y="26" width="38" height="6" fill="#94a3b8" />
      <rect x="14" y="12" width="64" height="28" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="3,2" />
    </g>
    <rect x="178" y="92" width="110" height="100" fill="none" stroke="#f59e0b" stroke-width="2" />
    <rect x="178" y="194" width="138" height="15" fill="#b45309" />
    <text x="183" y="204.5" font-size="8.3" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">TINTA BURAM · 0.89</text>

    <!-- Carton 3 (Incoming OK) -->
    <g transform="translate(348,98)">
      <rect x="0" y="0" width="96" height="90" rx="2" fill="#2c2419" stroke="#8c6d46" stroke-width="1.2" />
      <line x1="0" y1="45" x2="96" y2="45" stroke="#64748b" stroke-width="4" />
      <rect x="14" y="14" width="54" height="22" fill="#e2e8f0" />
      <text x="18" y="24" font-size="7" font-family="ui-monospace,Consolas,monospace" fill="#0f172a">CKR-2611-B4</text>
      <rect x="18" y="27" width="42" height="5" fill="#0f172a" />
    </g>
    <rect x="344" y="94" width="104" height="98" fill="none" stroke="#10b981" stroke-width="1.5" />
    <rect x="344" y="80" width="66" height="14" fill="#047857" />
    <text x="348" y="90" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">OK · 0.96</text>

    <!-- Pneumatic Ejector Actuator Schematic at Bottom -->
    <rect x="196" y="232" width="76" height="36" rx="2" fill="#1e293b" stroke="#f59e0b" stroke-width="1.4" />
    <line x1="234" y1="216" x2="234" y2="232" stroke="#f59e0b" stroke-width="3" />
    <polygon points="228,220 240,220 234,210" fill="#f59e0b" />
    <text x="234" y="248" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">PLC-Y07 EJECT</text>
    <text x="234" y="261" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">4 REJECT SHIFT</text>

    <!-- Direction arrow -->
    <text x="14" y="22" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">PERINGATAN · 4 KARTON REJECT (TIJ-02B)</text>
    <text x="458" y="22" text-anchor="end" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">ARAH KONVEYOR &lt;-- 1,24 m/s</text>
  </svg>`;
}

function svgCam11Feed() {
  return `<svg viewBox="0 0 470 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;background:#0a0f15;">
    <!-- Chemical Warehouse Entrance Wall & Airlock -->
    <rect x="0" y="0" width="470" height="122" fill="#141e2a" />
    <rect x="0" y="122" width="470" height="160" fill="#0f1720" />
    <!-- Hazard Stripe Header -->
    <rect x="128" y="18" width="214" height="24" fill="#1b2635" stroke="#d9820b" stroke-width="1" />
    <text x="235" y="34" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">ZONA GUDANG KIMIA B3 · WAJIB APD</text>
    <!-- Double doors -->
    <rect x="150" y="48" width="84" height="74" fill="#1e2a3a" stroke="#334155" stroke-width="1" />
    <rect x="236" y="48" width="84" height="74" fill="#1e2a3a" stroke="#334155" stroke-width="1" />
    <!-- Turnstile Barrier -->
    <rect x="92" y="170" width="286" height="12" fill="#263448" stroke="#475569" stroke-width="1" />
    <rect x="224" y="160" width="22" height="34" rx="2" fill="#0a291f" stroke="#10b981" stroke-width="1.3" />
    <circle cx="235" cy="177" r="4.5" fill="#10b981" />

    <!-- ROI Verification Gate -->
    <polygon points="104,132 366,132 396,264 74,264" fill="#10b981" fill-opacity="0.06" stroke="#10b981" stroke-width="1.2" stroke-dasharray="5,3" />
    <text x="235" y="254" text-anchor="middle" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">ROI VERIFIKASI GERBANG · 12/12 PATUH (100% APD)</text>

    <!-- Worker 1 Verified -->
    <g transform="translate(148,118)">
      <path d="M12,12 Q22,0 32,12 Z" fill="#f59e0b" stroke="#fde68a" stroke-width="1" />
      <rect x="14" y="12" width="16" height="11" rx="2" fill="#475569" stroke="#38bdf8" stroke-width="1" />
      <rect x="10" y="25" width="24" height="34" rx="2" fill="#10b981" />
      <line x1="10" y1="39" x2="34" y2="39" stroke="#fde68a" stroke-width="2" />
      <rect x="12" y="59" width="8" height="28" fill="#334155" />
      <rect x="24" y="59" width="8" height="28" fill="#334155" />
    </g>
    <rect x="144" y="114" width="52" height="96" fill="none" stroke="#10b981" stroke-width="1.6" />
    <rect x="92" y="98" width="104" height="15" fill="#047857" />
    <text x="96" y="108.5" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">HELM+GOGGLE 0.98</text>

    <!-- Worker 2 Verified -->
    <g transform="translate(274,126)">
      <path d="M12,12 Q22,0 32,12 Z" fill="#f59e0b" stroke="#fde68a" stroke-width="1" />
      <rect x="14" y="12" width="16" height="11" rx="2" fill="#475569" stroke="#38bdf8" stroke-width="1" />
      <rect x="10" y="25" width="24" height="34" rx="2" fill="#10b981" />
      <line x1="10" y1="39" x2="34" y2="39" stroke="#fde68a" stroke-width="2" />
      <rect x="12" y="59" width="8" height="28" fill="#334155" />
      <rect x="24" y="59" width="8" height="28" fill="#334155" />
    </g>
    <rect x="270" y="122" width="52" height="96" fill="none" stroke="#10b981" stroke-width="1.6" />
    <rect x="270" y="106" width="104" height="15" fill="#047857" />
    <text x="274" y="116.5" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">HELM+GOGGLE 0.96</text>

    <!-- OSD -->
    <rect x="8" y="8" width="144" height="18" rx="2" fill="#0a291f" stroke="#10b981" stroke-width="1" />
    <text x="16" y="20" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">TURNSTILE: TERBUKA</text>
  </svg>`;
}

function svgCam15Feed() {
  return `<svg viewBox="0 0 470 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;background:#0a0f15;">
    <!-- Insulated Cold Room Airlock Corridor -->
    <rect x="0" y="0" width="470" height="282" fill="#0d1724" />
    <polygon points="88,42 382,42 470,0 0,0" fill="#152336" />
    <polygon points="88,218 382,218 470,282 0,282" fill="#111d2c" />
    <!-- Airlock Insulated Sliding Door Frame -->
    <rect x="116" y="46" width="238" height="170" fill="#18293e" stroke="#38bdf8" stroke-width="1.5" />
    <!-- Partially open door showing pallet jack passing -->
    <rect x="122" y="52" width="96" height="158" fill="#1e344e" stroke="#47668a" stroke-width="1" />
    <rect x="220" y="52" width="128" height="158" fill="#09131f" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,3" />
    <text x="284" y="72" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#7dd3fc">PINTU TERBUKA · 18 dtk</text>

    <!-- Pallet Silhouette Inside Airlock -->
    <rect x="242" y="138" width="84" height="58" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2" />
    <line x1="242" y1="166" x2="326" y2="166" stroke="#334155" stroke-width="1" />
    <text x="284" y="156" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#bae6fd">PALET COLD-09</text>
    <text x="284" y="184" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">PASS-THROUGH OK</text>

    <!-- Door Open Timer Progress Gauge -->
    <rect x="24" y="234" width="422" height="34" rx="2" fill="#101a26" stroke="#293d54" stroke-width="1" />
    <text x="34" y="248" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">DURASI PINTU AIRLOCK: 18 dtk / 45 dtk MAKS (40%)</text>
    <text x="436" y="248" text-anchor="end" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#38bdf8">SUHU: -19,4 C</text>
    <rect x="34" y="254" width="402" height="7" rx="1" fill="#1e293b" />
    <rect x="34" y="254" width="161" height="7" rx="1" fill="#10b981" />
    <line x1="355" y1="252" x2="355" y2="263" stroke="#f59e0b" stroke-width="1.5" />

    <!-- OSD -->
    <rect x="8" y="8" width="154" height="18" rx="2" fill="#0c2438" stroke="#0284c7" stroke-width="1" />
    <text x="16" y="20" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#7dd3fc">SENSOR PT100: -19,4 C</text>
    <rect x="346" y="8" width="116" height="18" rx="2" fill="#0a291f" stroke="#10b981" stroke-width="1" />
    <text x="404" y="20" text-anchor="middle" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">BATAS 45 dtk OK</text>
  </svg>`;
}

function svgPlantFloorplan() {
  const toneColor = (t) => (t === 'bad' ? '#f43f5e' : t === 'warn' ? '#f59e0b' : '#10b981');
  const camNodes = CAMERAS.map((c) => {
    const col = toneColor(c.tone);
    const num = c.code.replace('CAM-', '');
    const rad = (c.dir * Math.PI) / 180;
    const fx = c.x + Math.cos(rad) * 20;
    const fy = c.y + Math.sin(rad) * 20;
    const p1x = c.x + Math.cos(rad - 0.42) * 26;
    const p1y = c.y + Math.sin(rad - 0.42) * 26;
    const p2x = c.x + Math.cos(rad + 0.42) * 26;
    const p2y = c.y + Math.sin(rad + 0.42) * 26;
    return `
      <polygon points="${c.x},${c.y} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}" fill="${col}" fill-opacity="${c.tone === 'ok' ? '0.16' : '0.32'}" />
      ${c.tone !== 'ok' ? `<circle cx="${c.x}" cy="${c.y}" r="14" fill="none" stroke="${col}" stroke-width="1.2" stroke-dasharray="3,2" />` : ''}
      <circle cx="${c.x}" cy="${c.y}" r="9.5" fill="#0e141c" stroke="${col}" stroke-width="${c.tone === 'ok' ? '1.4' : '2'}" />
      <text x="${c.x}" y="${c.y + 3}" text-anchor="middle" font-size="7.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${col}">${num}</text>
    `;
  }).join('');

  return `<svg viewBox="0 0 560 338" width="100%" height="338" style="display:block;background:#0c1118;border:1px solid #222f40;border-radius:2px;">
    <!-- CAD Grid -->
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${40 * (i + 1)}" y1="0" x2="${40 * (i + 1)}" y2="338" stroke="#141d29" stroke-width="1" />`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${40 * (i + 1)}" x2="560" y2="${40 * (i + 1)}" stroke="#141d29" stroke-width="1" />`).join('')}

    <!-- Zone 1: Loading Dock Bay 1-4 -->
    <rect x="18" y="18" width="366" height="94" rx="2" fill="#131c27" stroke="#304157" stroke-width="1.2" />
    <text x="28" y="34" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">ZONA A · LOADING DOCK BAY 1–4</text>
    <rect x="292" y="24" width="84" height="16" rx="2" fill="#32101a" stroke="#be123c" stroke-width="1" />
    <text x="334" y="35" text-anchor="middle" font-size="7.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">BAY 3 ALARM</text>

    <!-- Zone 2: Ruang Panel & Edge Server -->
    <rect x="396" y="18" width="146" height="82" rx="2" fill="#131c27" stroke="#304157" stroke-width="1.2" />
    <text x="406" y="34" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">RUANG PANEL &amp; EDGE</text>
    <rect x="406" y="44" width="76" height="22" rx="2" fill="#261b09" stroke="#9a5b00" stroke-width="1" />
    <text x="444" y="58" text-anchor="middle" font-size="7.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">EDGE-GPU-02</text>

    <!-- Zone 3: Jalur Kemas Line 1-3 -->
    <rect x="18" y="124" width="366" height="128" rx="2" fill="#131c27" stroke="#304157" stroke-width="1.2" />
    <text x="28" y="140" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">ZONA B · JALUR KEMAS KONVEYOR LINE 1–3</text>
    <!-- Conveyor schematic tracks -->
    <text x="34" y="157" font-size="7.6" font-family="ui-monospace,Consolas,monospace" fill="#93a7c0">LINE 1A / 2A / 2B · 4 REJECT TIJ-02B</text>
    <rect x="34" y="164" width="332" height="20" fill="#1b2636" stroke="#374961" stroke-width="1" />
    <text x="34" y="216" font-size="7.6" font-family="ui-monospace,Consolas,monospace" fill="#93a7c0">LINE 3A · NORMAL (30 FPS)</text>
    <rect x="34" y="222" width="332" height="18" fill="#1b2636" stroke="#374961" stroke-width="1" />

    <!-- Zone 4: Smelter & Pressing -->
    <rect x="396" y="110" width="146" height="142" rx="2" fill="#191b22" stroke="#6b4b19" stroke-width="1.2" />
    <text x="406" y="126" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">SMELTER &amp; PRESS</text>
    <rect x="478" y="138" width="52" height="44" rx="2" fill="#291c0b" stroke="#9a5b00" stroke-width="1" />
    <text x="504" y="163" text-anchor="middle" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">PRESS-01</text>
    <rect x="478" y="192" width="52" height="44" rx="2" fill="#291c0b" stroke="#9a5b00" stroke-width="1" />
    <text x="504" y="217" text-anchor="middle" font-size="7.5" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">TUNGKU</text>

    <!-- Zone 5: Gudang Kimia B3 -->
    <rect x="18" y="264" width="194" height="58" rx="2" fill="#131c27" stroke="#304157" stroke-width="1.2" />
    <text x="28" y="279" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">GUDANG KIMIA B3 (100% APD)</text>

    <!-- Zone 6: Gudang Jadi & Workshop -->
    <rect x="224" y="264" width="190" height="58" rx="2" fill="#131c27" stroke="#304157" stroke-width="1.2" />
    <text x="234" y="279" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">GUDANG JADI &amp; WORKSHOP</text>

    <!-- Zone 7: Ruang Dingin Airlock -->
    <rect x="424" y="264" width="118" height="58" rx="2" fill="#0d1e2e" stroke="#0369a1" stroke-width="1.2" />
    <text x="432" y="279" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#7dd3fc">COLD -19,4 C</text>

    <!-- All 16 Camera Nodes & FOV Cones -->
    ${camNodes}
  </svg>`;
}

function svgRoiCalibrator() {
  return `<svg viewBox="0 0 730 432" width="100%" height="432" style="display:block;background:#0a0f15;border:1px solid #243244;border-radius:2px;">
    <!-- Calibrated perspective grid (homography floor plane) -->
    <rect x="0" y="0" width="730" height="92" fill="#121a25" />
    <rect x="0" y="92" width="730" height="340" fill="#0e151e" />
    <!-- Distance depth markers -->
    <line x1="0" y1="138" x2="730" y2="138" stroke="#1a2636" stroke-width="1" />
    <text x="10" y="134" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#5e7491">8,0 m</text>
    <line x1="0" y1="196" x2="730" y2="196" stroke="#1a2636" stroke-width="1" />
    <text x="10" y="192" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#5e7491">6,0 m</text>
    <line x1="0" y1="268" x2="730" y2="268" stroke="#1a2636" stroke-width="1" />
    <text x="10" y="264" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#5e7491">4,0 m</text>
    <line x1="0" y1="354" x2="730" y2="354" stroke="#1a2636" stroke-width="1" />
    <text x="10" y="350" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#5e7491">2,0 m</text>

    <!-- Perspective radial lines -->
    ${[110, 220, 365, 510, 620].map((x) => `<line x1="${x}" y1="92" x2="${x + (x - 365) * 0.55}" y2="432" stroke="#172231" stroke-width="1" />`).join('')}

    <!-- Bay 3 Dock Backdrop -->
    <rect x="54" y="18" width="180" height="74" fill="#192434" stroke="#2c3d54" stroke-width="1" />
    <text x="144" y="56" text-anchor="middle" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#7f93ad">PINTU BAY 3 · TERBUKA</text>
    <rect x="278" y="18" width="210" height="74" fill="#141e2b" stroke="#2c3d54" stroke-width="1" />
    <text x="383" y="56" text-anchor="middle" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#7f93ad">AREA BONGKAR PALET</text>
    <rect x="526" y="18" width="154" height="74" fill="#192434" stroke="#2c3d54" stroke-width="1" />
    <text x="603" y="56" text-anchor="middle" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="#7f93ad">PINTU AKSES KARYAWAN</text>

    <!-- Polygon 1: Koridor Forklift (Amber) -->
    <polygon points="88,118 418,118 468,402 36,402" fill="#d97706" fill-opacity="0.09" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="6,3" />
    <text x="236" y="138" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">POLIGON A · KORIDOR_FORKLIFT_B3 (4 TITIK)</text>

    <!-- Polygon 2: Zona Terlarang Pejalan Kaki (Crimson) -->
    <polygon points="452,118 616,118 706,402 496,402" fill="#be123c" fill-opacity="0.16" stroke="#f43f5e" stroke-width="2" />
    <text x="582" y="138" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">POLIGON B · ZONA_PEJALAN_KAKI</text>

    <!-- Safety Buffer Strip (2.5m minimum threshold band) -->
    <polygon points="418,118 452,118 496,402 468,402" fill="#f43f5e" fill-opacity="0.08" stroke="#fb7185" stroke-width="1" stroke-dasharray="3,3" />

    <!-- Draggable Vertex Handles on Polygon B -->
    ${[
      { x: 452, y: 118, lbl: 'V1(452,118)' },
      { x: 616, y: 118, lbl: 'V2(616,118)' },
      { x: 706, y: 402, lbl: 'V3(706,402)' },
      { x: 496, y: 402, lbl: 'V4(496,402)' },
    ]
      .map(
        (v) => `
      <rect x="${v.x - 5}" y="${v.y - 5}" width="10" height="10" fill="#0e1319" stroke="#fde68a" stroke-width="2" />
      <text x="${v.x + (v.x > 600 ? -8 : 8)}" y="${v.y + (v.y > 300 ? -10 : -8)}" text-anchor="${v.x > 600 ? 'end' : 'start'}" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#fde68a">${v.lbl}</text>
    `
      )
      .join('')}

    <!-- Vertex Handles on Polygon A -->
    ${[
      { x: 88, y: 118 },
      { x: 418, y: 118 },
      { x: 468, y: 402 },
      { x: 36, y: 402 },
    ]
      .map((v) => `<rect x="${v.x - 4}" y="${v.y - 4}" width="8" height="8" fill="#0e1319" stroke="#f59e0b" stroke-width="1.6" />`)
      .join('')}

    <!-- Simulated Detection Objects + Homography Distance Caliper -->
    <rect x="244" y="206" width="182" height="114" fill="#9a5b00" fill-opacity="0.16" stroke="#f43f5e" stroke-width="1.8" />
    <text x="252" y="222" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">OBJ_FORKLIFT · (x=4,1m, y=3,2m)</text>
    <circle cx="426" cy="274" r="4.5" fill="#f43f5e" />

    <rect x="536" y="218" width="66" height="108" fill="#10b981" fill-opacity="0.14" stroke="#34d399" stroke-width="1.8" />
    <text x="540" y="234" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">PEJALAN</text>
    <text x="540" y="246" font-size="8" font-family="ui-monospace,Consolas,monospace" fill="#a7f3d0">HELM OK</text>
    <circle cx="536" cy="274" r="4.5" fill="#34d399" />

    <!-- Distance Measurement Caliper -->
    <line x1="426" y1="274" x2="536" y2="274" stroke="#f43f5e" stroke-width="2.2" stroke-dasharray="4,2" />
    <rect x="434" y="284" width="114" height="30" rx="2" fill="#32101a" stroke="#f43f5e" stroke-width="1.2" />
    <text x="491" y="297" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">d = 1,40 m &lt; 2,50 m</text>
    <text x="491" y="309" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#fecdd3">TRIGGER: STROBE_ON</text>

    <!-- Bottom Calibration Metadata HUD -->
    <rect x="12" y="408" width="706" height="18" rx="2" fill="#0c121a" stroke="#243244" stroke-width="1" />
    <text x="20" y="420" font-size="8.4" font-family="ui-monospace,Consolas,monospace" fill="#9bb0c9">HOMOGRAFI H3x3: TERKALIBRASI · TINGGI LENSA 4,80 m · TILT 28,4 deg · RMSE 4,2 cm · PROYEKSI: 1920x1080</text>
  </svg>`;
}

function svgEdgePlcTopology() {
  const nodes = [
    { x: 14, w: 122, title: '16 KAMERA RTSP', sub: 'ONVIF Profile T', detail: 'H.264 1080p · 28,4 fps', col: '#38bdf8', bg: '#0c2438' },
    { x: 162, w: 136, title: 'EDGE-GPU-02', sub: 'TensorRT FP16', detail: 'RTX 5000 Ada · 9,2 ms', col: '#f59e0b', bg: '#2b1e0a' },
    { x: 324, w: 132, title: 'ZONE RULES', sub: '.NET Edge Agent', detail: 'Dedupe 15 dtk · ROI', col: '#f59e0b', bg: '#2b1e0a' },
    { x: 482, w: 120, title: 'MQTT + PLC', sub: 'Siemens S7-1500', detail: 'Strobe · Sirine · Eject', col: '#f43f5e', bg: '#32101a' },
    { x: 622, w: 100, title: 'STORE LOKAL', sub: 'TSDB + MinIO', detail: 'Anonim · 0 Cloud', col: '#34d399', bg: '#0a291f' },
  ];

  const boxes = nodes
    .map(
      (n) => `
    <rect x="${n.x}" y="30" width="${n.w}" height="82" rx="3" fill="${n.bg}" stroke="${n.col}" stroke-width="1.3" />
    <text x="${n.x + n.w / 2}" y="52" text-anchor="middle" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${n.col}">${n.title}</text>
    <text x="${n.x + n.w / 2}" y="70" text-anchor="middle" font-size="9" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="#e6edf6">${n.sub}</text>
    <text x="${n.x + n.w / 2}" y="94" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#9bb0c9">${n.detail}</text>
  `
    )
    .join('');

  const arrows = [
    [136, 162, '4 ms'],
    [298, 324, '11 ms'],
    [456, 482, '5 ms'],
    [602, 622, '8 ms'],
  ]
    .map(
      ([x1, x2, lbl]) => `
    <line x1="${x1}" y1="71" x2="${x2 - 4}" y2="71" stroke="#64748b" stroke-width="1.6" />
    <polygon points="${x2 - 5},67 ${x2},71 ${x2 - 5},75" fill="#94a3b8" />
    <text x="${(x1 + x2) / 2}" y="62" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#8295ae">${lbl}</text>
  `
    )
    .join('');

  return `<svg viewBox="0 0 736 168" width="100%" height="168" style="display:block;background:#0c1118;border:1px solid #222f40;border-radius:2px;">
    <text x="14" y="18" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">ALUR DETERMINISTIK KAMERA-KE-INTERLOCK PLC (TOTAL END-TO-END P95: 34 ms)</text>
    ${boxes}
    ${arrows}
    <!-- Secondary Notification Branch from Zone Rules to WA/Telegram -->
    <polyline points="390,112 390,144 482,144" fill="none" stroke="#64748b" stroke-width="1.3" stroke-dasharray="3,2" />
    <polygon points="478,140 484,144 478,148" fill="#94a3b8" />
    <rect x="484" y="128" width="238" height="28" rx="2" fill="#151e2a" stroke="#36475e" stroke-width="1" />
    <text x="603" y="145" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">ESKALASI SHIFT: WhatsApp + Telegram Bot (0,8 dtk)</text>
  </svg>`;
}

function svgConveyorPid() {
  return `<svg viewBox="0 0 620 238" width="100%" height="238" style="display:block;background:#0b1017;border:1px solid #222f40;border-radius:2px;">
    <!-- P&ID Title Strip -->
    <text x="12" y="18" font-size="8.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">P&amp;ID LINE 2B · INSPEKSI INKJET &amp; EJECTOR PNEUMATIK PLC-Y07</text>

    <!-- Main Conveyor Belt -->
    <rect x="24" y="102" width="572" height="36" rx="18" fill="#16212f" stroke="#3b4f69" stroke-width="1.5" />
    <circle cx="42" cy="120" r="11" fill="#0f1722" stroke="#64748b" stroke-width="1.6" />
    <circle cx="578" cy="120" r="11" fill="#0f1722" stroke="#64748b" stroke-width="1.6" />
    <line x1="56" y1="120" x2="564" y2="120" stroke="#28384d" stroke-width="1.5" stroke-dasharray="8,6" />

    <!-- Station 1: Thermal Inkjet Printer TIJ-02B -->
    <rect x="68" y="42" width="96" height="44" rx="2" fill="#2b1e0a" stroke="#f59e0b" stroke-width="1.3" />
    <text x="116" y="60" text-anchor="middle" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">INKJET TIJ-02B</text>
    <text x="116" y="74" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#fbbf24">NOZZLE PERIKSA</text>
    <line x1="116" y1="86" x2="116" y2="102" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2" />

    <!-- Station 2: Photoeye + Encoder -->
    <rect x="192" y="54" width="66" height="32" rx="2" fill="#132232" stroke="#38bdf8" stroke-width="1.2" />
    <text x="225" y="68" text-anchor="middle" font-size="8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#7dd3fc">PHOTOEYE</text>
    <text x="225" y="79" text-anchor="middle" font-size="7.4" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">1,24 m/s</text>
    <line x1="225" y1="86" x2="225" y2="102" stroke="#38bdf8" stroke-width="1.2" />

    <!-- Station 3: CAM-07 Global Shutter + LED Ring -->
    <rect x="284" y="34" width="114" height="52" rx="2" fill="#0a291f" stroke="#10b981" stroke-width="1.4" />
    <text x="341" y="52" text-anchor="middle" font-size="9" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">CAM-07 VISION</text>
    <text x="341" y="65" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">DefectNet TRT 8,4 ms</text>
    <text x="341" y="77" text-anchor="middle" font-size="7.6" font-family="ui-monospace,Consolas,monospace" fill="#34d399">30,0 fps · LED 5000K</text>
    <polygon points="341,86 318,104 364,104" fill="#10b981" fill-opacity="0.22" />

    <!-- Station 4: Pneumatic Ejector Cylinder PLC-Y07 -->
    <rect x="430" y="42" width="110" height="44" rx="2" fill="#32101a" stroke="#f43f5e" stroke-width="1.3" />
    <text x="485" y="60" text-anchor="middle" font-size="8.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">EJECTOR PLC-Y07</text>
    <text x="485" y="74" text-anchor="middle" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">6,2 bar · Sync +/-4 ms</text>
    <line x1="485" y1="86" x2="485" y2="102" stroke="#f43f5e" stroke-width="2.4" />

    <!-- Cartons on Conveyor -->
    <rect x="96" y="108" width="42" height="24" rx="2" fill="#3b2f1f" stroke="#a68356" stroke-width="1" />
    <rect x="318" y="108" width="46" height="24" rx="2" fill="#422a11" stroke="#f59e0b" stroke-width="1.5" />
    <text x="341" y="123" text-anchor="middle" font-size="7.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fde68a">BURAM</text>
    <rect x="520" y="108" width="42" height="24" rx="2" fill="#143528" stroke="#10b981" stroke-width="1.2" />
    <text x="541" y="123" text-anchor="middle" font-size="7.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#6ee7b7">LOLOS</text>

    <!-- Reject Bin Quarantine Below Ejector -->
    <line x1="485" y1="138" x2="485" y2="168" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="3,2" />
    <polygon points="480,164 490,164 485,172" fill="#f43f5e" />
    <rect x="424" y="174" width="124" height="48" rx="2" fill="#1b141a" stroke="#be123c" stroke-width="1.2" />
    <text x="486" y="192" text-anchor="middle" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">BIN KARANTINA QA</text>
    <text x="486" y="207" text-anchor="middle" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">4 / 50 Karton (8%)</text>

    <!-- Bottom Left PLC Interlock Signal Block -->
    <rect x="24" y="164" width="376" height="58" rx="2" fill="#111822" stroke="#263448" stroke-width="1" />
    <text x="34" y="181" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#94a3b8">TELEMETRI AKTUATOR S7-1500 · DB20 (LINE 2B)</text>
    <text x="34" y="197" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">Tekanan Pneumatik: 6,2 bar (OK)  |  Delay Eject: 412 ms  |  Missed Eject: 0</text>
    <text x="34" y="212" font-size="8.2" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">Rekomendasi QA: Bersihkan printhead TIJ-02B pada jeda pergantian palet</text>
  </svg>`;
}

function svgEvidenceThumb(kind) {
  if (kind === 'forklift') {
    return `<svg viewBox="0 0 184 96" width="184" height="96" style="display:block;background:#0a0f15;border:1px solid #9f1239;border-radius:2px;flex-shrink:0;">
      <rect x="0" y="34" width="184" height="62" fill="#111923" />
      <polygon points="108,36 152,36 176,94 118,94" fill="#be123c" fill-opacity="0.2" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3,2" />
      <rect x="44" y="42" width="52" height="36" fill="none" stroke="#f43f5e" stroke-width="1.3" />
      <rect x="50" y="54" width="34" height="18" fill="#b45309" />
      <rect x="132" y="46" width="22" height="38" fill="none" stroke="#34d399" stroke-width="1.2" />
      <rect x="138" y="50" width="10" height="8" fill="#64748b" stroke="#cbd5e1" stroke-width="0.8" />
      <line x1="96" y1="62" x2="132" y2="62" stroke="#f43f5e" stroke-width="1.4" stroke-dasharray="2,2" />
      <rect x="4" y="4" width="84" height="13" fill="#32101a" />
      <text x="8" y="13" font-size="7.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">WAJAH DIKABURKAN</text>
      <text x="180" y="90" text-anchor="end" font-size="7.4" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">1,4 m · 0,94</text>
    </svg>`;
  }
  if (kind === 'ink') {
    return `<svg viewBox="0 0 184 96" width="184" height="96" style="display:block;background:#0a0f15;border:1px solid #855209;border-radius:2px;flex-shrink:0;">
      <rect x="0" y="20" width="184" height="58" fill="#131c27" />
      <rect x="48" y="28" width="86" height="42" fill="#302519" stroke="#f59e0b" stroke-width="1.4" />
      <rect x="60" y="36" width="44" height="14" fill="#cbd5e1" />
      <rect x="64" y="40" width="34" height="5" fill="#94a3b8" />
      <rect x="57" y="33" width="50" height="20" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="2,2" />
      <rect x="4" y="4" width="96" height="13" fill="#2c1e08" />
      <text x="8" y="13" font-size="7.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">KODE BATCH BURAM</text>
      <text x="180" y="90" text-anchor="end" font-size="7.4" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">PLC-Y07 EJECT</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 184 96" width="184" height="96" style="display:block;background:#0a0f15;border:1px solid #855209;border-radius:2px;flex-shrink:0;">
    <rect x="0" y="30" width="184" height="66" fill="#141a22" />
    <rect x="20" y="26" width="54" height="54" fill="#251d14" stroke="#9a5b00" stroke-width="1" />
    <rect x="96" y="34" width="38" height="52" fill="none" stroke="#f59e0b" stroke-width="1.4" />
    <rect x="108" y="40" width="12" height="9" fill="#64748b" stroke="#cbd5e1" stroke-width="0.8" />
    <rect x="103" y="51" width="22" height="24" fill="#10b981" />
    <circle cx="98" cy="66" r="6" fill="none" stroke="#f43f5e" stroke-width="1.4" />
    <rect x="4" y="4" width="84" height="13" fill="#32101a" />
    <text x="8" y="13" font-size="7.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#fda4af">WAJAH DIKABURKAN</text>
    <text x="178" y="90" text-anchor="end" font-size="7.1" font-family="ui-monospace,Consolas,monospace" fill="#fcd34d">SARUNG TANGAN</text>
  </svg>`;
}

// ============================================================================
// PAGE 1: RUANG KONTROL SCADA & GRID RTSP REAL-TIME
// ============================================================================

function renderP1() {
  const rightActions = `
    <span class="e-btn">${ic('sliders', 11, '#cbd5e1')} Kalibrasi Zona</span>
    <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Konfirmasi Alarm</span>
  `;

  const mqttRows = MQTT_FRAMES.map(
    (m) => `<div style="display:grid;grid-template-columns:72px 150px 1fr 78px;gap:6px;align-items:center;padding:4px 0;border-bottom:1px solid #1b2431;font-family:var(--e-mono);font-size:9.3px;">
      <span style="color:#6f849f;">${esc(m.ts)}</span>
      <span class="trunc" style="color:#7dd3fc;">${esc(m.topic)}</span>
      <span class="trunc" style="color:#cbd5e1;">${esc(m.payload)}</span>
      <span style="text-align:right;">${badge(m.plc, m.tone)}</span>
    </div>`
  ).join('');

  const contentHtml = `
    <!-- ISA-18.2 Active Unacknowledged Interlock Alarm Strip -->
    <div class="sc-alarm-bar">
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        ${badge('KRITIS · UNACK', 'bad')}
        <span class="mono" style="color:#fda4af;font-weight:700;font-size:10.5px;">ALM-8841</span>
        <span class="trunc" style="color:#ffe4e6;font-weight:600;font-size:10.8px;">CAM-04 Loading Dock Bay 3 — Forklift melanggar batas jalur pejalan kaki (jarak 1,4 m · conf 0,94)</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span class="mono" style="color:#fcd34d;font-size:9.8px;">PLC DO-04: STROBE_ON · WA &amp; Telegram Terkirim</span>
        <span class="e-btn e-btn-danger" style="height:21px;font-size:9.6px;">${ic('bell', 11, '#fb7185')} Bisukan Sirine</span>
      </div>
    </div>

    <!-- 6-KPI Telemetry Strip -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(6, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kecepatan FPS Rata-rata</span>${badge('OK', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${AVG_FPS.toFixed(1).replace('.', ',')} fps</span>
          ${svgSparkline({ points: [27.9, 28.1, 28.3, 28.4, 28.2, 28.5, 28.4], color: '#34d399', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>16/16 RTSP TensorRT</span><span class="mono">p95 14,4 ms</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kepatuhan APD Shift 2</span>${badge('SMK3', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#34d399;">${fmtPct(HSE_COMPLIANCE_PCT, 1)}</span>
          ${svgSparkline({ points: [98.1, 98.4, 98.5, 98.8, 98.6, 98.7, 98.7], color: '#34d399', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>${fmtNum(HSE_TOTAL_COMPLIANT)} / ${fmtNum(HSE_TOTAL_ENTRIES)} masuk</span><span>${HSE_TOTAL_VIOLATIONS} deviasi</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Cacat Line-2B</span>${badge('PLC EJECT', 'warn')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fbbf24;">${LINE2B_REJECTS} karton</span>
          ${svgSparkline({ points: [0, 0, 1, 1, 2, 3, 4], color: '#f59e0b', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>Tinta batch buram</span><span class="mono">Total QA: ${QA_TOTAL_REJECTS}</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Interlock PLC Shift</span>${badge('AKTIF', 'bad')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fb7185;">${TOTAL_PLC_TRIGS} pemicu</span>
          ${svgSparkline({ points: [2, 4, 6, 9, 12, 15, 17], color: '#f43f5e', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>3 K3 + 14 QA Eject</span><span class="mono">S7-1500</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Beban EDGE-GPU-02</span>${badge('71 C', 'info')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">68%</span>
          ${svgSparkline({ points: [62, 65, 66, 69, 67, 68, 68], color: '#38bdf8', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>VRAM 21,8 / 32 GB</span><span class="mono">RTX 5000</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Event Shift &amp; Privasi</span>${badge('ON-PREM', 'accent')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${TOTAL_CAM_EVENTS} event</span>
          ${svgSparkline({ points: [5, 11, 18, 24, 31, 37, 42], color: '#f59e0b', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>100% Face-Blur Lokal</span><span class="mono">0 Cloud</span></div>
      </div>
    </div>

    <!-- Main Control Room Split: Left 61% Quad RTSP Feeds, Right 39% Floorplan + MQTT Stream -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.58fr 1fr;gap:9px;">
      <!-- Left: 2x2 Live RTSP Quad Matrix -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('eye', 13, '#f59e0b')}
            <span>Matriks Live Inference RTSP · Prioritas K3 &amp; QA (4 dari 16 Kanal)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${badge('2x2 QUAD', 'accent')}
            ${badge('NVDEC H.264', 'neutral')}
            <span class="e-panel-sub mono">Sinkronisasi NTP 0,4 ms</span>
          </div>
        </div>
        <div class="e-panel-body" style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;padding:8px;">
          <!-- CAM-04 -->
          <div class="cam-tile cam-tile-bad">
            <div class="cam-head">
              <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                <span class="dot dot-bad"></span>
                <span class="mono" style="font-weight:700;color:#fda4af;">CAM-04</span>
                <span class="trunc" style="color:#f8fafc;font-weight:600;font-size:10.3px;">Loading Dock Bay 3</span>
              </div>
              ${badge('Pelanggaran · 0,94', 'bad')}
            </div>
            <div style="flex:1;min-height:0;overflow:hidden;">${svgCam04Feed()}</div>
            <div class="cam-foot">
              <span>ForkliftProx-v3 · 30,0 fps · 14,4 ms</span>
              <span style="color:#fda4af;">DO-04: STROBE_ON</span>
            </div>
          </div>

          <!-- CAM-07 -->
          <div class="cam-tile cam-tile-warn">
            <div class="cam-head">
              <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                <span class="dot dot-warn"></span>
                <span class="mono" style="font-weight:700;color:#fcd34d;">CAM-07</span>
                <span class="trunc" style="color:#f8fafc;font-weight:600;font-size:10.3px;">Jalur Kemas Line 2B</span>
              </div>
              ${badge('4 Reject · PLC Eject', 'warn')}
            </div>
            <div style="flex:1;min-height:0;overflow:hidden;">${svgCam07Feed()}</div>
            <div class="cam-foot">
              <span>DefectNet-Line2 · 30,0 fps · 11,8 ms</span>
              <span style="color:#fcd34d;">Y07: EJECT AKTIF</span>
            </div>
          </div>

          <!-- CAM-11 -->
          <div class="cam-tile cam-tile-ok">
            <div class="cam-head">
              <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                <span class="dot dot-ok"></span>
                <span class="mono" style="font-weight:700;color:#6ee7b7;">CAM-11</span>
                <span class="trunc" style="color:#f8fafc;font-weight:600;font-size:10.3px;">Gerbang Gudang Kimia</span>
              </div>
              ${badge('100% APD · 24 fps', 'ok')}
            </div>
            <div style="flex:1;min-height:0;overflow:hidden;">${svgCam11Feed()}</div>
            <div class="cam-foot">
              <span>PPE-ChemGate-v4 · 24,0 fps · 13,4 ms</span>
              <span style="color:#6ee7b7;">12/12 Terverifikasi</span>
            </div>
          </div>

          <!-- CAM-15 -->
          <div class="cam-tile cam-tile-ok">
            <div class="cam-head">
              <div style="display:flex;align-items:center;gap:6px;min-width:0;">
                <span class="dot dot-ok"></span>
                <span class="mono" style="font-weight:700;color:#6ee7b7;">CAM-15</span>
                <span class="trunc" style="color:#f8fafc;font-weight:600;font-size:10.3px;">Airlock Ruang Dingin</span>
              </div>
              ${badge('18 dtk · -19,4 C', 'ok')}
            </div>
            <div style="flex:1;min-height:0;overflow:hidden;">${svgCam15Feed()}</div>
            <div class="cam-foot">
              <span>ColdDoor-Timer · 28,4 fps · 10,8 ms</span>
              <span style="color:#7dd3fc;">Batas 45 dtk · Normal</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Column: Schematic Plant Floorplan + Live MQTT Broker Stream -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.18;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('layers', 13, '#38bdf8')}
              <span>Denah Plant Cikarang B · 16 Kamera RTSP</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:9.6px;">
              <span style="color:#fb7185;" class="mono">${CAM_BAD_COUNT} Kritis</span>
              <span style="color:#fbbf24;" class="mono">${CAM_WARN_COUNT} Peringatan</span>
              <span style="color:#34d399;" class="mono">${CAM_OK_COUNT} Normal</span>
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            ${svgPlantFloorplan()}
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.5px;color:#8295ae;">
              <span>Segmen VLAN Kamera: <strong class="mono" style="color:#cbd5e1;">VLAN-42-CCTV</strong></span>
              <span>PLC Master: <strong class="mono" style="color:#6ee7b7;">10.42.8.20 (S7-1500)</strong></span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.92;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('terminal', 13, '#f59e0b')}
              <span>Stream MQTT Broker &amp; Pemicu PLC</span>
            </div>
            ${badge('EMQX · 142 msg/mnt', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            <div class="code-block" style="border-color:#9f1239;background:#160b10;color:#fecdd3;padding:5.5px 8px;font-size:9.2px;">
              <span style="color:#fb7185;font-weight:700;">MQTT</span> plant/cikarang/cam04/event -&gt; {"type":"FORKLIFT_PROXIMITY","zone":"BAY3","dist_m":1.4,"action":"STROBE_ON"}
            </div>
            <div style="display:flex;flex-direction:column;">
              ${mqttRows}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderScadaShell({
    activeTab: 'p1',
    pageTitle: meta.pages[0].title,
    rightActionsHtml: rightActions,
    contentHtml,
  });
}

// ============================================================================
// PAGE 2: INVENTARIS 16 KANAL RTSP & INSPEKTOR KAMERA
// ============================================================================

function renderP2() {
  const rightActions = `
    <span class="e-btn">${ic('refresh', 11, '#cbd5e1')} Uji Heartbeat ONVIF</span>
    <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Ekspor Log ISA-18.2 (CSV)</span>
  `;

  const rowsHtml = CAMERAS.map((c) => {
    const rowCls = c.selected ? 'is-selected' : c.tone === 'bad' ? 'is-bad' : c.tone === 'warn' ? 'is-warn' : '';
    return `<tr class="${rowCls}">
      <td class="mono" style="font-weight:700;color:${c.tone === 'bad' ? '#fda4af' : c.tone === 'warn' ? '#fcd34d' : '#7dd3fc'};">${esc(c.code)}</td>
      <td style="font-weight:600;">${esc(c.loc)}</td>
      <td style="color:#9bb0c9;">${esc(c.zone)}</td>
      <td class="mono" style="font-size:9.8px;color:#cbd5e1;">${esc(c.model)}</td>
      <td class="mono num">${c.fps.toFixed(1).replace('.', ',')}</td>
      <td class="mono num">${c.latMs.toFixed(1).replace('.', ',')} ms</td>
      <td class="mono num">${c.conf.toFixed(2).replace('.', ',')}</td>
      <td class="mono num" style="font-weight:700;">${c.events}</td>
      <td class="mono num" style="color:${c.plcTrig > 0 ? '#fcd34d' : '#64748b'};font-weight:${c.plcTrig > 0 ? '700' : '400'};">${c.plcTrig}</td>
      <td class="mono" style="font-size:9.6px;color:#9bb0c9;">${esc(c.interlock)}</td>
      <td>${badge(c.status, c.tone)}</td>
    </tr>`;
  }).join('');

  const spans = [
    { label: '1. RTSP Decode NVDEC', start: 0, dur: 4, color: '#38bdf8' },
    { label: '2. Resize & Norm CUDA', start: 4, dur: 2, color: '#0ea5e9' },
    { label: '3. TensorRT FP16 Inf', start: 6, dur: 9, color: '#f59e0b' },
    { label: '4. Homografi & ROI', start: 15, dur: 3, color: '#d97706' },
    { label: '5. Deduplicator 15 dtk', start: 18, dur: 2, color: '#a855f7' },
    { label: '6. MQTT -> S7-1500', start: 20, dur: 6, color: '#f43f5e' },
    { label: '7. Face-Blur + MinIO', start: 26, dur: 8, color: '#10b981' },
  ];

  const contentHtml = `
    <!-- Fleet Filter Bar -->
    <div style="height:32px;padding:0 10px;background:#141b24;border:1px solid #273344;border-radius:3px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-badge e-badge-accent">Semua Kanal (16)</span>
        <span class="e-badge e-badge-bad">Pelanggaran (${CAM_BAD_COUNT})</span>
        <span class="e-badge e-badge-warn">Peringatan (${CAM_WARN_COUNT})</span>
        <span class="e-badge e-badge-ok">Normal (${CAM_OK_COUNT})</span>
        <span style="color:#475569;">|</span>
        <span class="mono" style="font-size:9.8px;color:#9bb0c9;">Node: EDGE-GPU-02 · Bitrate Agregat: 54,8 Mbps LAN</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="height:22px;width:220px;padding:0 8px;border-radius:2px;background:#0e1319;border:1px solid #2c3a4d;display:flex;align-items:center;gap:6px;color:#7f93ad;font-size:10px;">
          ${ic('search', 11, '#64748b')}
          <span>Cari CAM-01..16, zona, atau coil PLC...</span>
        </div>
        ${badge('Dedupe Window: 15 dtk', 'neutral')}
      </div>
    </div>

    <!-- 5-KPI Fleet Summary -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kanal RTSP Aktif</span>${badge('100% UP', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">16 / 16</span><span class="mono" style="color:#34d399;font-size:10px;">0 drop frame</span></div>
        <div class="e-kpi-foot"><span>ONVIF Profile T</span><span>EDGE-GPU-02</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rata-rata Throughput</span>${badge('TENSORRT', 'info')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${AVG_FPS.toFixed(1).replace('.', ',')} fps</span><span class="mono" style="color:#38bdf8;font-size:10px;">454,4 fps total</span></div>
        <div class="e-kpi-foot"><span>FP16 Batch-4</span><span>Latensi ${AVG_LAT_MS.toFixed(1).replace('.', ',')} ms</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Event Shift 2</span>${badge('DEDUPED', 'accent')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">${TOTAL_CAM_EVENTS} event</span><span class="mono" style="color:#fcd34d;font-size:10px;">128 raw -&gt; 42</span></div>
        <div class="e-kpi-foot"><span>Rasio deduplikasi 67%</span><span>Tersimpan TSDB</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Pemicu PLC</span>${badge('INTERLOCK', 'bad')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val" style="color:#fb7185;">${TOTAL_PLC_TRIGS} aksi</span><span class="mono" style="color:#fda4af;font-size:10px;">3 K3 · 14 QA</span></div>
        <div class="e-kpi-foot"><span>Siemens S7-1500</span><span>Ack 100% &lt;40 ms</span></div>
      </div>
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Eskalasi Supervisor</span>${badge('WA + TG', 'ok')}</div>
        <div class="e-kpi-mid"><span class="e-kpi-val">0,8 dtk</span><span class="mono" style="color:#34d399;font-size:10px;">Median kirim</span></div>
        <div class="e-kpi-foot"><span>6 notifikasi shift</span><span>Cuplikan anonim</span></div>
      </div>
    </div>

    <!-- Main 2-Col Split: 16-Row Camera Table (66%) + Selected Camera Inspector (34%) -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.96fr 1fr;gap:9px;">
      <!-- Left: 16-Row Dense RTSP Inventory Table -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#f59e0b')}
            <span>Inventaris 16 Kanal RTSP &amp; Status Interlock Shift 2</span>
          </div>
          <span class="e-panel-sub mono">Baris aktif: CAM-04 (Klik untuk inspeksi latensi &amp; coil PLC)</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p2-cams">
            <colgroup>
              <col style="width:62px;" />
              <col style="width:176px;" />
              <col style="width:104px;" />
              <col style="width:124px;" />
              <col style="width:52px;" />
              <col style="width:66px;" />
              <col style="width:50px;" />
              <col style="width:52px;" />
              <col style="width:54px;" />
              <col style="width:130px;" />
              <col style="width:94px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Kanal</th>
                <th>Lokasi Kamera</th>
                <th>Zona</th>
                <th>Model TensorRT</th>
                <th class="num">FPS</th>
                <th class="num">Latensi</th>
                <th class="num">Conf</th>
                <th class="num">Event</th>
                <th class="num">PLC</th>
                <th>Target Interlock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td class="mono">TOTAL</td>
                <td>16 Kanal RTSP Aktif (EDGE-GPU-02)</td>
                <td>8 Zona</td>
                <td class="mono">6 Engine FP16</td>
                <td class="mono num">${AVG_FPS.toFixed(1).replace('.', ',')}</td>
                <td class="mono num">${AVG_LAT_MS.toFixed(1).replace('.', ',')} ms</td>
                <td class="mono num">0,94</td>
                <td class="mono num">${TOTAL_CAM_EVENTS}</td>
                <td class="mono num" style="color:#fcd34d;">${TOTAL_PLC_TRIGS}</td>
                <td class="mono">S7-1500 PROFINET</td>
                <td>${badge('1 KRITIS', 'bad')}</td>
              </tr>
            </tfoot>
          </table>
          <div style="padding:7px 10px;background:#10161f;border-top:1px solid #222e3e;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#9bb0c9;">
            <span>Distribusi Engine GPU: <strong class="mono" style="color:#e6edf6;">DefectNet-Line2 (4)</strong> · <strong class="mono" style="color:#e6edf6;">ForkliftProx-v3 (4)</strong> · <strong class="mono" style="color:#e6edf6;">YOLOv8m-APD (3)</strong> · <strong class="mono" style="color:#e6edf6;">PPE-ChemGate (2)</strong> · Lainnya (3)</span>
            <span class="mono" style="color:#6ee7b7;">Sinkronisasi Watchdog: OK</span>
          </div>
        </div>
      </section>

      <!-- Right: Selected Camera Inspector (CAM-04) -->
      <section class="e-panel">
        <div class="e-panel-head" style="background:#261219;border-bottom-color:#881337;">
          <div class="e-panel-title" style="color:#ffe4e6;">
            ${ic('alert', 13, '#fb7185')}
            <span>Inspektor Kanal · CAM-04 Bay 3</span>
          </div>
          ${badge('ALM-8841 AKTIF', 'bad')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;">
          <!-- Anonymized Snapshot & Metadata -->
          <div style="display:flex;gap:8px;align-items:stretch;">
            ${svgEvidenceThumb('forklift')}
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="font-size:11px;font-weight:700;color:#f8fafc;">Loading Dock Bay 3</div>
                <div class="mono" style="font-size:9.2px;color:#8295ae;margin-top:2px;">rtsp://10.42.8.104:554/stream1</div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px;">
                <div style="background:#10161f;border:1px solid #243244;border-radius:2px;padding:4px 6px;">
                  <div style="font-size:8.6px;color:#8295ae;">Jarak Terukur</div>
                  <div class="mono" style="font-size:12px;font-weight:700;color:#fb7185;">1,40 m</div>
                </div>
                <div style="background:#10161f;border:1px solid #243244;border-radius:2px;padding:4px 6px;">
                  <div style="font-size:8.6px;color:#8295ae;">Confidence</div>
                  <div class="mono" style="font-size:12px;font-weight:700;color:#fcd34d;">0,94</div>
                </div>
              </div>
            </div>
          </div>

          <!-- End-to-End Span Waterfall (34ms) -->
          <div style="background:#10161f;border:1px solid #243244;border-radius:3px;padding:7px 8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:10.2px;font-weight:700;color:#e6edf6;">Waterfall Latensi Kamera-ke-PLC</span>
              <span class="mono" style="font-size:9.6px;color:#34d399;">Total 34 ms (SLA &lt;100 ms)</span>
            </div>
            ${svgSpanWaterfall({ spans, totalMs: 36, width: 470, dark: true })}
          </div>

          <!-- PLC Coil & Escalation Readback -->
          <div style="background:#10161f;border:1px solid #243244;border-radius:3px;padding:7px 9px;">
            <div style="font-size:10.2px;font-weight:700;color:#e6edf6;margin-bottom:4px;">Readback Interlock PLC &amp; Eskalasi Shift</div>
            <div class="kv-row">
              <span class="kv-k">PLC Coil DO-04 (Strobe Bay 3)</span>
              <span class="kv-v mono" style="color:#fb7185;">HIGH (1) · 19:42:08</span>
            </div>
            <div class="kv-row">
              <span class="kv-k">PLC Coil DO-05 (Sirine 95 dB)</span>
              <span class="kv-v mono" style="color:#fcd34d;">PULSE 3 dtk · SELESAI</span>
            </div>
            <div class="kv-row">
              <span class="kv-k">WhatsApp Grup K3-Shift2</span>
              <span class="kv-v mono" style="color:#34d399;">TERKIRIM (528 ms)</span>
            </div>
            <div class="kv-row">
              <span class="kv-k">Telegram @spv_cikarang_bot</span>
              <span class="kv-v mono" style="color:#34d399;">TERKIRIM (312 ms)</span>
            </div>
            <div class="kv-row">
              <span class="kv-k">Bukti MinIO (Face-Blur SHA-256)</span>
              <span class="kv-v mono" style="color:#7dd3fc;">evd_8841_anon.webp</span>
            </div>
          </div>

          <!-- MQTT Frame Readback -->
          <div class="code-block" style="font-size:9.1px;padding:6px 8px;">
            <div style="color:#8295ae;margin-bottom:2px;"># Payload Terakhir (QoS 1 · Retained)</div>
            <div style="color:#fcd34d;">topic: plant/cikarang/cam04/event</div>
            <div style="color:#e6edf6;">{"type":"FORKLIFT_PROXIMITY","zone":"BAY3","dist_m":1.4,"action":"STROBE_ON"}</div>
          </div>

          <!-- Recent History Strip on CAM-04 -->
          <div style="background:#10161f;border:1px solid #243244;border-radius:3px;padding:6px 9px;">
            <div style="font-size:9.8px;font-weight:700;color:#cbd5e1;margin-bottom:3px;">Riwayat Kejadian CAM-04 Shift 2 (5 Event)</div>
            <div class="kv-row" style="padding:3px 0;font-size:9.6px;"><span class="mono" style="color:#fda4af;">19:42:08</span><span style="color:#e6edf6;">Forklift 1,4 m ke pejalan kaki</span><span class="mono" style="color:#fb7185;">UNACK</span></div>
            <div class="kv-row" style="padding:3px 0;font-size:9.6px;"><span class="mono" style="color:#9bb0c9;">17:18:44</span><span style="color:#cbd5e1;">Forklift 2,1 m · Strobe 5 dtk</span><span class="mono" style="color:#34d399;">ACK Spv</span></div>
            <div class="kv-row" style="padding:3px 0;font-size:9.6px;"><span class="mono" style="color:#9bb0c9;">15:09:12</span><span style="color:#cbd5e1;">Pejalan kaki keluar jalur (3 dtk)</span><span class="mono" style="color:#34d399;">ACK Spv</span></div>
          </div>

          <!-- Operator Actions -->
          <div style="display:flex;gap:6px;margin-top:auto;">
            <span class="e-btn e-btn-primary" style="flex:1;justify-content:center;">${ic('check', 11, '#ffffff')} Konfirmasi Alarm</span>
            <span class="e-btn" style="flex:1;justify-content:center;">${ic('sliders', 11, '#cbd5e1')} Edit Poligon ROI</span>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderScadaShell({
    activeTab: 'p2',
    pageTitle: meta.pages[1].title,
    rightActionsHtml: rightActions,
    contentHtml,
  });
}

// ============================================================================
// PAGE 3: KALIBRASI POLIGON ZONA ROI & TOPOLOGI EDGE-PLC
// ============================================================================

function renderP3() {
  const rightActions = `
    <span class="e-btn">${ic('play', 11, '#34d399')} Uji Simulasi Dry-Run</span>
    <span class="e-btn e-btn-primary">${ic('check', 11, '#ffffff')} Terapkan ke EDGE-GPU-02</span>
  `;

  const ruleListHtml = ZONE_RULES.map(
    (r) => `<div style="padding:7px 9px;border-radius:3px;border:1px solid ${r.active ? '#b86e00' : '#222f40'};background:${r.active ? '#241a09' : '#10161f'};display:flex;flex-direction:column;gap:3px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span class="mono" style="font-size:9.6px;font-weight:700;color:${r.active ? '#fcd34d' : '#7dd3fc'};">${esc(r.id)} · ${esc(r.cam)}</span>
        ${badge(r.hits > 0 ? `${r.hits} hit` : 'Siaga', r.tone)}
      </div>
      <div style="font-size:10.5px;font-weight:600;color:#f1f5f9;" class="trunc">${esc(r.name)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.2px;color:#8295ae;">
        <span class="mono">${esc(r.thresh)} · ${esc(r.debounce)}</span>
        <span class="mono" style="color:#9bb0c9;">${esc(r.plc.split(' ')[0])}</span>
      </div>
    </div>`
  ).join('');

  const dryRuns = [
    { id: 'SIM-904', scen: 'Forklift 1,4 m ke pejalan', exp: 'STROBE_ON', got: 'STROBE_ON (32 ms)', ok: true },
    { id: 'SIM-903', scen: 'Forklift 3,1 m koridor aman', exp: 'NO_TRIGGER', got: 'NO_TRIGGER', ok: true },
    { id: 'SIM-902', scen: 'Pejalan kaki <4 frame', exp: 'DEBOUNCED', got: 'DEBOUNCED (0)', ok: true },
    { id: 'SIM-901', scen: 'Duplikat dalam 15 detik', exp: 'SUPPRESSED', got: 'SUPPRESSED', ok: true },
  ];

  const dryRunRows = dryRuns
    .map(
      (d) => `<tr>
      <td class="mono" style="color:#7dd3fc;">${esc(d.id)}</td>
      <td>${esc(d.scen)}</td>
      <td class="mono" style="color:#34d399;">${esc(d.got)}</td>
      <td>${badge('LULUS', 'ok')}</td>
    </tr>`
    )
    .join('');

  const contentHtml = `
    <!-- Calibration Mode Subbar -->
    <div style="height:32px;padding:0 10px;background:#141b24;border:1px solid #273344;border-radius:3px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        ${badge('MODE KALIBRASI ROI', 'accent')}
        <span style="font-weight:700;color:#f8fafc;">RULE-K3-01 · Batas Jarak Forklift Bay 3 (CAM-04)</span>
        <span class="mono" style="font-size:9.8px;color:#8295ae;">Versi Aturan: v4.2 · Disahkan K3L 18 Nov 2026</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="e-badge e-badge-ok">Homografi Terkunci</span>
        <span class="e-badge e-badge-info">Modbus/S7 Mapped</span>
      </div>
    </div>

    <!-- 3-Column Engineering Workbench -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:305px 1.55fr 1fr;gap:9px;">
      <!-- Left: 8 Active Zone Rules -->
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('sliders', 13, '#f59e0b')}
            <span>Daftar Aturan Zona (8)</span>
          </div>
          ${badge('AKTIF', 'ok')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
          ${ruleListHtml}
        </div>
      </section>

      <!-- Center: ROI Polygon Calibrator + Edge-to-PLC Topology DAG -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.58;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('eye', 13, '#f59e0b')}
              <span>Editor Poligon ROI &amp; Kalibrasi Homografi Lantai · CAM-04</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              ${badge('Poligon: 2', 'neutral')}
              ${badge('Ambang: 2,50 m', 'bad')}
              ${badge('Grid: 2 m', 'info')}
            </div>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            ${svgRoiCalibrator()}
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#9bb0c9;">
              <span>Alat Aktif: <strong style="color:#fcd34d;">Sunting Titik Poligon (V1–V4)</strong> · Snap Grid 10 cm</span>
              <span class="mono">Kalibrasi Lensa: f=4,0 mm · Distorsi k1=-0,084</span>
            </div>
          </div>
        </section>

        <section class="e-panel" style="flex:0.82;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('gitBranch', 13, '#38bdf8')}
              <span>Topologi Pipeline Edge-to-PLC (On-Premises Air-Gapped)</span>
            </div>
            <span class="e-panel-sub mono">Zero Cloud Dependency · IEC 62443</span>
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:6px;">
            ${svgEdgePlcTopology()}
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:9.6px;color:#8295ae;">
              <span>Failover otomatis ke <strong class="mono" style="color:#cbd5e1;">EDGE-GPU-01</strong> bila heartbeat &gt; 1.500 ms</span>
              <span class="mono" style="color:#6ee7b7;">Status Ring OT: REDUNDAN</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: Rule Parameters & MQTT Payload Contract + Dry-Run Verification -->
      <div style="display:flex;flex-direction:column;gap:8px;min-height:0;">
        <section class="e-panel" style="flex:1.12;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('lock', 13, '#f59e0b')}
              <span>Parameter Deteksi &amp; Interlock PLC</span>
            </div>
            ${badge('RULE-K3-01', 'accent')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;gap:4px;">
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Tipe Aturan</span><span class="kv-v mono" style="color:#fcd34d;">FORKLIFT_PROXIMITY</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Model TensorRT</span><span class="kv-v mono">ForkliftProx-v3-fp16.engine</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Ambang Jarak Minimum</span><span class="kv-v mono" style="color:#fb7185;">2,50 meter (Lantai H3x3)</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Skor Confidence Min</span><span class="kv-v mono">0,82 (Forklift &amp; Pejalan)</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Debounce Frame Persisten</span><span class="kv-v mono">6 frame beruntun (200 ms)</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Cooldown Deduplicator</span><span class="kv-v mono">15 detik per zona</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Alamat Coil PLC S7-1500</span><span class="kv-v mono" style="color:#7dd3fc;">DB10.DBX4.0 (STROBE_ON)</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Alamat Sirine Bay 3</span><span class="kv-v mono" style="color:#7dd3fc;">DB10.DBX4.1 (HORN_3S)</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Protokol Sinkronisasi PLC</span><span class="kv-v mono">PROFINET RT · Cycle 10 ms</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Penerima Notifikasi</span><span class="kv-v">WA K3-Shift2 · TG @spv_ckr</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Kebijakan Privasi Snapshot</span><span class="kv-v" style="color:#34d399;">Auto Face-Blur + Plat Mask</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Status Shift Roster API</span><span class="kv-v mono" style="color:#34d399;">Tersinkron · 3 Supervisor</span></div>
            <div class="kv-row" style="padding:5.5px 0;"><span class="kv-k">Pengesahan Kalibrasi</span><span class="kv-v">Ir. Hendra Kusuma (K3L)</span></div>
          </div>
        </section>

        <section class="e-panel" style="flex:1;min-height:0;">
          <div class="e-panel-head">
            <div class="e-panel-title">
              ${ic('code', 13, '#34d399')}
              <span>Kontrak MQTT &amp; Uji Validasi Dry-Run</span>
            </div>
            ${badge('4/4 LULUS', 'ok')}
          </div>
          <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:7px;">
            <div class="code-block code-block-pre" style="font-size:9.2px;line-height:1.42;"><span style="color:#64748b;">// Topic: plant/cikarang/cam04/event (QoS 1)</span>
{
  <span style="color:#7dd3fc;">"type"</span>: <span style="color:#fcd34d;">"FORKLIFT_PROXIMITY"</span>,
  <span style="color:#7dd3fc;">"zone"</span>: <span style="color:#fcd34d;">"BAY3"</span>,
  <span style="color:#7dd3fc;">"dist_m"</span>: <span style="color:#fb7185;">1.4</span>, <span style="color:#7dd3fc;">"conf"</span>: <span style="color:#34d399;">0.94</span>,
  <span style="color:#7dd3fc;">"action"</span>: <span style="color:#fcd34d;">"STROBE_ON"</span>,
  <span style="color:#7dd3fc;">"anon_snapshot"</span>: <span style="color:#a7f3d0;">"minio://k3/evd_8841.webp"</span>
}</div>
            <table class="e-table" style="font-size:9.8px;">
              <colgroup>
                <col style="width:62px;" />
                <col />
                <col style="width:128px;" />
                <col style="width:58px;" />
              </colgroup>
              <thead>
                <tr><th>Uji</th><th>Skenario Rekaman</th><th>Hasil Mesin</th><th>Status</th></tr>
              </thead>
              <tbody>${dryRunRows}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;

  return renderScadaShell({
    activeTab: 'p3',
    pageTitle: meta.pages[2].title,
    rightActionsHtml: rightActions,
    contentHtml,
  });
}

// ============================================================================
// PAGE 4: INSPEKSI MUTU KONVEYOR QA & OEE JALUR KEMAS
// ============================================================================

function renderP4() {
  const rightActions = `
    <span class="e-btn">${ic('refresh', 11, '#cbd5e1')} Reset Penghitung Bin</span>
    <span class="e-btn e-btn-primary">${ic('fileText', 11, '#ffffff')} Laporan QA Batch Shift 2</span>
  `;

  const trendChart = svgMultiLineChart({
    width: 820,
    height: 222,
    dark: true,
    xLabels: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '19:42'],
    yMin: 360,
    yMax: 510,
    yTicks: 5,
    yFormat: (v) => `${Math.round(v)}`,
    threshold: { value: 450, label: 'Target 450 karton/jam', color: '#0369a1' },
    series: [
      { label: 'Line 2B (CAM-07)', color: '#f59e0b', area: true, dots: true, values: [462, 474, 480, 472, 468, 456, 444] },
      { label: 'Line 1A (CAM-05)', color: '#34d399', dots: true, values: [438, 448, 452, 446, 450, 444, 442] },
      { label: 'Line 2A (CAM-06)', color: '#38bdf8', dashed: true, values: [414, 424, 430, 426, 422, 418, 416] },
    ],
    annotations: [
      { index: 5, seriesIdx: 0, label: '19:29 TIJ-02B Buram (4 reject)', color: '#f59e0b', dy: -46 },
    ],
  });

  const defectStacked = svgStackedBarChart({
    width: 610,
    height: 170,
    dark: true,
    categories: QA_LINES.map((l) => `${l.line} (${l.cam})`),
    yMax: 6,
    yFormat: (v) => `${Math.round(v)}`,
    series: [
      { label: 'Tinta Buram', color: '#f59e0b', values: QA_LINES.map((l) => l.inkBlur) },
      { label: 'Label Miring >3 deg', color: '#38bdf8', values: QA_LINES.map((l) => l.labelTilt) },
      { label: 'Segel Terbuka', color: '#f43f5e', values: QA_LINES.map((l) => l.sealOpen) },
      { label: 'Karton Penyok', color: '#a855f7', values: QA_LINES.map((l) => l.dented) },
    ],
  });

  const qaLineRows = QA_LINES.map((l) => {
    const rej = l.inkBlur + l.labelTilt + l.sealOpen + l.dented;
    return `<tr class="${l.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;">${esc(l.line)} · ${esc(l.cam)}</td>
      <td class="mono num">${fmtNum(l.inspected)}</td>
      <td class="mono num" style="color:${l.inkBlur > 0 ? '#fcd34d' : '#64748b'};font-weight:${l.inkBlur > 0 ? '700' : '400'};">${l.inkBlur}</td>
      <td class="mono num">${l.labelTilt}</td>
      <td class="mono num">${l.sealOpen}</td>
      <td class="mono num">${l.dented}</td>
      <td class="mono num" style="font-weight:700;color:${rej >= 4 ? '#fbbf24' : '#e6edf6'};">${rej}</td>
      <td class="mono num">${l.oee.toFixed(1).replace('.', ',')}%</td>
      <td>${badge(l.status, l.tone)}</td>
    </tr>`;
  }).join('');

  const rejectLogRows = QA_REJECT_LOGS.map(
    (r) => `<tr class="${r.tone === 'warn' ? 'is-warn' : ''}">
      <td class="mono" style="color:#7dd3fc;">${esc(r.id)}</td>
      <td class="mono" style="color:#9bb0c9;">${esc(r.time)}</td>
      <td class="mono" style="font-weight:700;">${esc(r.line)} (${esc(r.cam)})</td>
      <td class="mono" style="font-size:9.6px;">${esc(r.batch)}</td>
      <td style="font-weight:600;">${esc(r.defect)}</td>
      <td class="mono num">${esc(r.metric)}</td>
      <td class="mono num">${esc(r.conf)}</td>
      <td class="mono" style="color:#fcd34d;">${esc(r.action)}</td>
      <td>${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const contentHtml = `
    <!-- 5-KPI QA & OEE Strip -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(5, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Karton Diinspeksi Shift 2</span>${badge('4 JALUR', 'info')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtNum(QA_TOTAL_INSPECTED)}</span>
          ${svgSparkline({ points: [1600, 3200, 4900, 6700, 8400, 9600, 10500], color: '#38bdf8', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>CAM-05..08 · 30 fps</span><span>Global Shutter</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Karton Lolos (Good)</span>${badge('FPY', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#34d399;">${fmtNum(QA_TOTAL_GOOD)}</span>
          <span class="mono" style="font-size:11px;font-weight:700;color:#6ee7b7;">${fmtPct(QA_FPY_PCT, 2)}</span>
        </div>
        <div class="e-kpi-foot"><span>Target FPY &gt;= 99,50%</span><span>Zero komplain</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Total Reject PLC Eject</span>${badge('OTOMATIS', 'warn')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fbbf24;">${QA_TOTAL_REJECTS} karton</span>
          <span class="mono" style="font-size:10px;color:#fcd34d;">0,13%</span>
        </div>
        <div class="e-kpi-foot"><span>Tinta ${QA_SUM_INK} · Label ${QA_SUM_TILT}</span><span>Segel ${QA_SUM_SEAL} · Penyok ${QA_SUM_DENT}</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Fokus Line-2B (CAM-07)</span>${badge('PERIKSA TIJ', 'warn')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fbbf24;">${LINE2B_REJECTS} karton</span>
          <span class="mono" style="font-size:10px;color:#fda4af;">TIJ-02B</span>
        </div>
        <div class="e-kpi-foot"><span>Batch CKR-261122-B4</span><span>4/4 ter-eject</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>OEE Jalur Kemas Rata-rata</span>${badge('TARGET 88%', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${fmtPct(QA_AVG_OEE, 1)}</span>
          ${svgSparkline({ points: [89.2, 90.4, 91.0, 90.6, 90.1, 89.9, 90.3], color: '#34d399', width: 64, height: 20 })}
        </div>
        <div class="e-kpi-foot"><span>Avail 95,4% · Perf 94,8%</span><span>Qual 99,87%</span></div>
      </div>
    </div>

    <!-- Upper Row: Throughput Trend + Defect Breakdown -->
    <div style="height:368px;display:grid;grid-template-columns:1.22fr 1fr;gap:9px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('activity', 13, '#f59e0b')}
            <span>Tren Throughput Konveyor per Jam &amp; Anomali Mutu (Shift 2)</span>
          </div>
          <span class="e-panel-sub mono">TimescaleDB 1-jam agregat · karton/jam</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${trendChart}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding-top:6px;border-top:1px solid #1e2836;">
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#8295ae;">Latensi Inferensi DefectNet</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#34d399;">8,4 ms <span style="font-size:9.2px;color:#8295ae;">(max 14 ms)</span></div>
            </div>
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#8295ae;">Akurasi Sinkronisasi Ejector</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#7dd3fc;">100,0% <span style="font-size:9.2px;color:#8295ae;">(14/14 tepat)</span></div>
            </div>
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9.2px;color:#8295ae;">Indikasi Root Cause Line 2B</div>
              <div style="font-size:10.4px;font-weight:700;color:#fcd34d;">Nozzle TIJ-02B Kering</div>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('layers', 13, '#38bdf8')}
            <span>Breakdown Kategori Cacat &amp; OEE per Jalur Kemas</span>
          </div>
          ${badge('TOTAL 14 REJECT', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${defectStacked}
          <table class="e-table" style="font-size:9.6px;">
            <colgroup>
              <col style="width:118px;" />
              <col style="width:62px;" />
              <col style="width:42px;" />
              <col style="width:42px;" />
              <col style="width:42px;" />
              <col style="width:42px;" />
              <col style="width:44px;" />
              <col style="width:52px;" />
              <col style="width:76px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Jalur</th><th class="num">Inspeksi</th><th class="num">Tinta</th><th class="num">Label</th><th class="num">Segel</th><th class="num">Penyok</th><th class="num">Rej</th><th class="num">OEE</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${qaLineRows}</tbody>
            <tfoot>
              <tr>
                <td>TOTAL 4 JALUR</td>
                <td class="mono num">${fmtNum(QA_TOTAL_INSPECTED)}</td>
                <td class="mono num" style="color:#fcd34d;">${QA_SUM_INK}</td>
                <td class="mono num">${QA_SUM_TILT}</td>
                <td class="mono num">${QA_SUM_SEAL}</td>
                <td class="mono num">${QA_SUM_DENT}</td>
                <td class="mono num" style="color:#fbbf24;">${QA_TOTAL_REJECTS}</td>
                <td class="mono num">${QA_AVG_OEE.toFixed(1).replace('.', ',')}%</td>
                <td>${badge('FPY 99,87%', 'ok')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>

    <!-- Lower Row: 10-Row QA Reject Log + Line 2B P&ID Conveyor Schematic -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.38fr 1fr;gap:9px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('alert', 13, '#fbbf24')}
            <span>Log Reject &amp; Aksi Ejector Pneumatik Terbaru (10 dari 14 Shift 2)</span>
          </div>
          <span class="e-panel-sub mono">Disorot: 4 karton tinta buram CAM-07 Line 2B</span>
        </div>
        <div class="e-panel-body-flush">
          <table class="e-table">
            <colgroup>
              <col style="width:86px;" />
              <col style="width:62px;" />
              <col style="width:118px;" />
              <col style="width:104px;" />
              <col style="width:136px;" />
              <col style="width:92px;" />
              <col style="width:46px;" />
              <col style="width:94px;" />
              <col style="width:78px;" />
            </colgroup>
            <thead>
              <tr>
                <th>ID Eject</th><th>Waktu</th><th>Jalur &amp; Cam</th><th>Kode Batch</th><th>Jenis Cacat</th><th class="num">Deviasi</th><th class="num">Conf</th><th>Aksi PLC</th><th>Status QA</th>
              </tr>
            </thead>
            <tbody>${rejectLogRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4">Menampilkan 10 kejadian terbaru dari total 14 karton ter-eject pada Shift 2</td>
                <td colspan="3" class="mono">4/4 Line 2B terekam snapshot lokal</td>
                <td colspan="2" style="text-align:right;" class="mono">0 Missed Eject</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('cpu', 13, '#34d399')}
            <span>Skema P&amp;ID Konveyor Line 2B &amp; Aktuator PLC-Y07</span>
          </div>
          ${badge('CAM-07 · LIVE', 'warn')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          ${svgConveyorPid()}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8295ae;">Encoder Sabuk</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#e6edf6;">1,24 m/s</div>
              <div style="font-size:8.6px;color:#6ee7b7;">Stabil · 2.860 dus</div>
            </div>
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#8295ae;">Tekanan Angin</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#7dd3fc;">6,2 bar</div>
              <div style="font-size:8.6px;color:#94a3b8;">Ambang &gt;= 5,5 bar</div>
            </div>
            <div style="background:#10161f;border:1px solid #855209;border-radius:2px;padding:6px 8px;">
              <div style="font-size:9px;color:#fcd34d;">Status Bin Karantina</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#fbbf24;">4 / 50 dus</div>
              <div style="font-size:8.6px;color:#fcd34d;">Siap verifikasi QC</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderScadaShell({
    activeTab: 'p4',
    pageTitle: meta.pages[3].title,
    rightActionsHtml: rightActions,
    contentHtml,
  });
}

// ============================================================================
// PAGE 5: SCORECARD K3 SHIFT, BUKTI ANONIM & KLASTER EDGE
// ============================================================================

function renderP5() {
  const rightActions = `
    <span class="e-btn">${ic('lock', 11, '#34d399')} Verifikasi WORM SHA-256</span>
    <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Scorecard SMK3 (PDF)</span>
  `;

  const hseRows = HSE_ZONES.map((z) => {
    const score = (z.compliant / z.entries) * 100;
    return `<tr class="${z.tone === 'bad' ? 'is-bad' : z.tone === 'warn' ? 'is-warn' : ''}">
      <td style="font-weight:600;">${esc(z.zone)}</td>
      <td class="mono" style="font-size:9.6px;color:#7dd3fc;">${esc(z.cams)}</td>
      <td class="mono num">${fmtNum(z.entries)}</td>
      <td class="mono num">${z.helmPct.toFixed(1).replace('.', ',')}%</td>
      <td class="mono num">${z.vestPct.toFixed(1).replace('.', ',')}%</td>
      <td class="mono num" style="font-weight:700;color:${score >= 99 ? '#34d399' : score >= 97.5 ? '#fcd34d' : '#fb7185'};">${score.toFixed(1).replace('.', ',')}%</td>
      <td class="mono num" style="color:${z.violations > 0 ? '#fda4af' : '#64748b'};font-weight:${z.violations > 0 ? '700' : '400'};">${z.violations}</td>
      <td>${badge(z.status, z.tone)}</td>
    </tr>`;
  }).join('');

  const evidenceCards = [
    {
      id: 'EVD-2026-8841',
      cam: 'CAM-04 · Loading Dock Bay 3',
      time: '19:42:08 WIB',
      title: 'Forklift melanggar jarak aman 1,4 m',
      hash: 'sha256:8f41c9e2...b01a',
      disp: 'Menunggu ACK Spv',
      tone: 'bad',
      thumb: 'forklift',
    },
    {
      id: 'EVD-2026-8839',
      cam: 'CAM-07 · Jalur Kemas Line 2B',
      time: '19:41:12 WIB',
      title: 'Tinta kode batch buram (karton ke-4)',
      hash: 'sha256:4a92d07e...c44f',
      disp: 'PLC-Y07 Ter-eject',
      tone: 'warn',
      thumb: 'ink',
    },
    {
      id: 'EVD-2026-8834',
      cam: 'CAM-09 · Area Pressing & Stamping',
      time: '18:56:40 WIB',
      title: 'Operator tanpa sarung tangan tahan panas',
      hash: 'sha256:1c77e3ab...92d1',
      disp: 'Ditegur & Patuh',
      tone: 'ok',
      thumb: 'glove',
    },
  ]
    .map(
      (e) => `<div style="display:flex;gap:10px;padding:7px 8px;background:#10161f;border:1px solid ${e.tone === 'bad' ? '#881337' : e.tone === 'warn' ? '#7c4a08' : '#222f40'};border-radius:3px;">
      ${svgEvidenceThumb(e.thumb)}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span class="mono" style="font-size:9.8px;font-weight:700;color:#fcd34d;">${esc(e.id)}</span>
            ${badge(e.disp, e.tone)}
          </div>
          <div style="font-size:10.8px;font-weight:700;color:#f8fafc;margin-top:3px;" class="trunc">${esc(e.title)}</div>
          <div style="font-size:9.6px;color:#9bb0c9;margin-top:2px;">${esc(e.cam)} · <span class="mono">${esc(e.time)}</span></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding-top:5px;border-top:1px solid #1e2836;font-family:var(--e-mono);font-size:9px;color:#7f93ad;">
          <span>${esc(e.hash)}</span>
          <span style="color:#6ee7b7;">Face-Blur 31px · MinIO Lokal</span>
        </div>
      </div>
    </div>`
    )
    .join('');

  const nodeRows = EDGE_NODES.map(
    (n) => `<tr>
      <td class="mono" style="font-weight:700;color:#fcd34d;">${esc(n.node)}</td>
      <td style="font-weight:600;">${esc(n.role)}</td>
      <td style="color:#9bb0c9;font-size:9.8px;">${esc(n.hw)}</td>
      <td>${renderCapBarDark(n.gpuPct, { warnAt: 75, critAt: 90 })}</td>
      <td class="mono num">${esc(n.vramTxt)}</td>
      <td class="mono num" style="color:${n.tempC >= 70 ? '#fbbf24' : '#34d399'};">${n.tempC} C</td>
      <td>${renderCapBarDark(n.diskPct, { warnAt: 75, critAt: 90 })}</td>
      <td class="mono num">${esc(n.uptime)}</td>
      <td>${badge(n.status, n.tone)}</td>
    </tr>`
  ).join('');

  const shiftCompareChart = svgStackedBarChart({
    width: 520,
    height: 146,
    dark: true,
    categories: ['Shift 1 (06-14)', 'Shift 2 (14-22)', 'Shift 3 (22-06)'],
    yMax: 32,
    yFormat: (v) => `${Math.round(v)}`,
    series: [
      { label: 'Deviasi APD', color: '#f59e0b', values: [9, 8, 5] },
      { label: 'Jarak Forklift', color: '#f43f5e', values: [4, 5, 2] },
      { label: 'Reject Konveyor QA', color: '#38bdf8', values: [11, 14, 9] },
    ],
  });

  const contentHtml = `
    <!-- 4-KPI HSE & Sovereignty Strip -->
    <div class="e-kpi-strip" style="grid-template-columns:repeat(4, 1fr);">
      <div class="e-kpi">
        <div class="e-kpi-top"><span>Skor Kepatuhan APD Shift 2</span>${badge('PP 50/2012 SMK3', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#34d399;">${fmtPct(HSE_COMPLIANCE_PCT, 1)}</span>
          <span class="mono" style="font-size:10.5px;color:#6ee7b7;">+0,4% vs Shift 1</span>
        </div>
        <div class="e-kpi-foot"><span>${fmtNum(HSE_TOTAL_COMPLIANT)} patuh · ${HSE_TOTAL_VIOLATIONS} deviasi</span><span>8 zona kerja</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Rekor Jam Kerja Aman (Zero LTI)</span>${badge('K3 HSE', 'ok')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">184 hari</span>
          <span class="mono" style="font-size:10.5px;color:#7dd3fc;">1.428.000 jam</span>
        </div>
        <div class="e-kpi-foot"><span>Plant Cikarang B · 350 pekerja</span><span>0 kecelakaan berat</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Cuplikan Anonim MinIO Lokal</span>${badge('PRIVASI OK', 'info')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val">${TOTAL_CAM_EVENTS} bukti</span>
          <span class="mono" style="font-size:10.5px;color:#34d399;">100% Face-Blur</span>
        </div>
        <div class="e-kpi-foot"><span>WORM SHA-256 · Retensi 90 hari</span><span>Disetujui Serikat &amp; HR</span></div>
      </div>

      <div class="e-kpi">
        <div class="e-kpi-top"><span>Kedaulatan Data On-Premises</span>${badge('AIR-GAPPED', 'accent')}</div>
        <div class="e-kpi-mid">
          <span class="e-kpi-val" style="color:#fcd34d;">100% Lokal</span>
          <span class="mono" style="font-size:10.5px;color:#6ee7b7;">0 KB Cloud</span>
        </div>
        <div class="e-kpi-foot"><span>Cikarang · Siap replikasi Karawang/Morowali</span><span>LAN 10 Gbps</span></div>
      </div>
    </div>

    <!-- Middle Row: 8-Zone HSE Scorecard Table + Anonymized Evidence Vault -->
    <div style="height:466px;display:grid;grid-template-columns:1.2fr 1fr;gap:9px;flex-shrink:0;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('shield', 13, '#34d399')}
            <span>Scorecard Kepatuhan K3 &amp; APD per Zona Kerja · Shift 2</span>
          </div>
          <span class="e-panel-sub mono">Standar Permenaker 08/2010 · 1.000 observasi masuk</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p2-cams">
            <colgroup>
              <col style="width:176px;" />
              <col style="width:90px;" />
              <col style="width:68px;" />
              <col style="width:64px;" />
              <col style="width:64px;" />
              <col style="width:68px;" />
              <col style="width:64px;" />
              <col style="width:104px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Zona Kerja Pabrik</th><th>Kamera</th><th class="num">Masuk</th><th class="num">Helm</th><th class="num">Rompi</th><th class="num">Skor K3</th><th class="num">Deviasi</th><th>Status SMK3</th>
              </tr>
            </thead>
            <tbody>${hseRows}</tbody>
            <tfoot>
              <tr>
                <td>AGREGAT PLANT CIKARANG B</td>
                <td class="mono">16 RTSP</td>
                <td class="mono num">${fmtNum(HSE_TOTAL_ENTRIES)}</td>
                <td class="mono num">99,4%</td>
                <td class="mono num">99,5%</td>
                <td class="mono num" style="color:#34d399;">${fmtPct(HSE_COMPLIANCE_PCT, 1)}</td>
                <td class="mono num" style="color:#fda4af;">${HSE_TOTAL_VIOLATIONS}</td>
                <td>${badge('TARGET >=98%', 'ok')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="padding:10px 11px;background:#10161f;border-top:1px solid #222f40;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="background:#141b24;border:1px solid #243244;border-radius:3px;padding:8px 10px;">
              <div style="font-size:10px;font-weight:700;color:#fcd34d;margin-bottom:4px;">Catatan Pengesahan Supervisor Shift 2</div>
              <div style="font-size:10px;color:#cbd5e1;line-height:1.4;">
                Gudang Kimia (12 masuk) &amp; Ruang Dingin mencatat 100% kepatuhan APD. Fokus briefing Shift 3: disiplin jarak forklift di Bay 3 &amp; pemakaian sarung tangan panas di Area Pressing.
              </div>
            </div>
            <div style="background:#141b24;border:1px solid #243244;border-radius:3px;padding:8px 10px;">
              <div style="font-size:10px;font-weight:700;color:#6ee7b7;margin-bottom:4px;">Protokol Privasi Pekerja (UU PDP &amp; Bipartit)</div>
              <div style="font-size:10px;color:#cbd5e1;line-height:1.4;">
                Wajah pekerja &amp; nomor pelat dikaburkan langsung di VRAM GPU sebelum penyimpanan disk. Tanpa pengenalan biometrik identitas individu; evaluasi murni per zona &amp; shift.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('lock', 13, '#f59e0b')}
            <span>Brankas Cuplikan Snapshot Teranonimisasi (MinIO Lokal)</span>
          </div>
          ${badge('WORM 90 HARI', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${evidenceCards}
          </div>
          <div style="padding:7px 9px;background:#0a291f;border:1px solid #146348;border-radius:3px;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#a7f3d0;">
            <span>Integritas Arsip Shift 2: <strong>42 / 42 berkas terverifikasi SHA-256</strong></span>
            <span class="mono">minio://plant-ckr-b/2026-11-22</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom Row: Edge GPU Cluster Health + Shift Comparison -->
    <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.58fr 1fr;gap:9px;">
      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('server', 13, '#38bdf8')}
            <span>Kesehatan Klaster Edge GPU, Broker MQTT &amp; Storage On-Premises</span>
          </div>
          <span class="e-panel-sub mono">Lokasi Rak: Ruang Kontrol Utama Cikarang B · UPS 98%</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table p2-cams">
            <colgroup>
              <col style="width:104px;" />
              <col style="width:176px;" />
              <col style="width:196px;" />
              <col style="width:94px;" />
              <col style="width:86px;" />
              <col style="width:54px;" />
              <col style="width:86px;" />
              <col style="width:62px;" />
              <col style="width:88px;" />
            </colgroup>
            <thead>
              <tr>
                <th>Node</th><th>Peran Layanan</th><th>Perangkat Keras</th><th>Beban GPU/CPU</th><th class="num">Memori</th><th class="num">Suhu</th><th>Disk</th><th class="num">Uptime</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${nodeRows}</tbody>
          </table>
          <div style="padding:7px 10px;background:#10161f;border-top:1px solid #222f40;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#9bb0c9;">
            <span>Sinkronisasi Klaster Regional: <strong style="color:#e6edf6;">Template model siap deploy ke Plant Karawang (KIIC) &amp; Smelter Morowali</strong></span>
            <span class="mono" style="color:#fcd34d;">TensorRT Engine v2026.11</span>
          </div>
        </div>
      </section>

      <section class="e-panel">
        <div class="e-panel-head">
          <div class="e-panel-title">
            ${ic('users', 13, '#f59e0b')}
            <span>Perbandingan Insiden &amp; Mutu Antar Shift (24 Jam)</span>
          </div>
          ${badge('SHIFT 2 AKTIF', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
          ${shiftCompareChart}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:5px 7px;">
              <div style="font-size:9px;color:#8295ae;">Shift 1 (06–14)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#cbd5e1;">98,3% APD</div>
              <div style="font-size:8.6px;color:#8295ae;">13 K3 · 11 QA</div>
            </div>
            <div style="background:#241a09;border:1px solid #9a5b00;border-radius:2px;padding:5px 7px;">
              <div style="font-size:9px;color:#fcd34d;">Shift 2 (Aktif)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#34d399;">98,7% APD</div>
              <div style="font-size:8.6px;color:#fcd34d;">13 K3 · 14 QA</div>
            </div>
            <div style="background:#10161f;border:1px solid #222f40;border-radius:2px;padding:5px 7px;">
              <div style="font-size:9px;color:#8295ae;">Shift 3 (Kemarin)</div>
              <div class="mono" style="font-size:11.5px;font-weight:700;color:#cbd5e1;">99,1% APD</div>
              <div style="font-size:8.6px;color:#8295ae;">7 K3 · 9 QA</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderScadaShell({
    activeTab: 'p5',
    pageTitle: meta.pages[4].title,
    rightActionsHtml: rightActions,
    contentHtml,
  });
}

// ============================================================================
// EXPORT PAGES
// ============================================================================

export function renderPages() {
  return [
    { slug: 'p1', title: meta.pages[0].title, html: renderP1() },
    { slug: 'p2', title: meta.pages[1].title, html: renderP2() },
    { slug: 'p3', title: meta.pages[2].title, html: renderP3() },
    { slug: 'p4', title: meta.pages[3].title, html: renderP4() },
    { slug: 'p5', title: meta.pages[4].title, html: renderP5() },
  ];
}
