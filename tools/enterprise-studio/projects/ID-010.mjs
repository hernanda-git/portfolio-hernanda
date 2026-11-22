import {
  esc,
  fmtNum,
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
  id: 'ID-010',
  name: 'TaniPredict AI',
  reference: 'SAP S/4HANA Fiori Horizon + PostGIS Enterprise GIS',
  persona: 'Ir. Hendra Wijaya · Kepala Agronomi & GIS · PT Rimba Sawit Nusantara Tbk',
  pages: [
    { slug: 'p1', title: 'Komando Kebun, Prakiraan TBS 30h & Neraca PKS' },
    { slug: 'p2', title: 'Matriks 18 Blok Agronomi & Inspektor Anomali NDVI' },
    { slug: 'p3', title: 'Peta Spasial NDVI Sentinel-2, BMKG & Alih Rute' },
    { slug: 'p4', title: 'Kepatuhan Poligon EUDR Pasca-2020 & Otorisasi DoA' },
    { slug: 'p5', title: 'Inspeksi Agronom Offline & Kalibrasi Model Yield' },
  ],
};

// ============================================================================
// SINGLE SOURCE OF TRUTH DATASET (100% MATHEMATICALLY CONSISTENT ACROSS P1-P5)
// ============================================================================
const BLOCKS = [
  // Divisi I — Katingan Utara (3.240 Ha | 4.890 ton)
  { code: 'BLK-A04', div: 'Divisi I', group: 'Inti', areaHa: 920, tt: 2016, ndvi: 0.82, delta: 0.02, rain7d: 34, est30dTon: 1420, prodTha: 22.4, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/A04' },
  { code: 'BLK-A08', div: 'Divisi I', group: 'Inti', areaHa: 1060, tt: 2015, ndvi: 0.80, delta: 0.01, rain7d: 38, est30dTon: 1580, prodTha: 21.8, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/A08' },
  { code: 'BLK-A11', div: 'Divisi I', group: 'Inti', areaHa: 950, tt: 2017, ndvi: 0.79, delta: 0.00, rain7d: 32, est30dTon: 1370, prodTha: 20.9, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/A11' },
  { code: 'BLK-A12', div: 'Divisi I', group: 'Inti', areaHa: 310, tt: 2016, ndvi: 0.81, delta: 0.03, rain7d: 29, est30dTon: 520, prodTha: 24.2, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'Puncak Panen', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/A12' },

  // Divisi II — Katingan Tengah (3.315 Ha | 4.200 ton | 2 blok stres)
  { code: 'BLK-B01', div: 'Divisi II', group: 'Inti', areaHa: 1040, tt: 2014, ndvi: 0.78, delta: -0.01, rain7d: 44, est30dTon: 1440, prodTha: 20.4, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/B01' },
  { code: 'BLK-B04', div: 'Divisi II', group: 'Inti', areaHa: 245, tt: 2012, ndvi: 0.54, delta: -0.14, rain7d: 19, est30dTon: 275, prodTha: 16.1, status: 'Inspeksi', tone: 'warn', eudr: 'Lolos EUDR', meta: 'Ganoderma/Kering', stress: true, reroute: false, selected: true, farmers: 0, hgu: 'HGU-KTG-04/B04' },
  { code: 'BLK-B07', div: 'Divisi II', group: 'Inti', areaHa: 890, tt: 2013, ndvi: 0.59, delta: -0.11, rain7d: 21, est30dTon: 960, prodTha: 16.4, status: 'Stres Kering', tone: 'warn', eudr: 'Lolos EUDR', meta: 'Defisit Air', stress: true, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/B07' },
  { code: 'BLK-B10', div: 'Divisi II', group: 'Inti', areaHa: 1140, tt: 2015, ndvi: 0.77, delta: 0.00, rain7d: 42, est30dTon: 1525, prodTha: 19.8, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/B10' },

  // Divisi III — Tepian Sungai (3.185 Ha | 3.940 ton | 1 blok stres, 1 alih rute)
  { code: 'BLK-C02', div: 'Divisi III', group: 'Inti', areaHa: 980, tt: 2015, ndvi: 0.76, delta: -0.01, rain7d: 68, est30dTon: 1290, prodTha: 19.2, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG Waspada', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/C02' },
  { code: 'BLK-C05', div: 'Divisi III', group: 'Inti', areaHa: 765, tt: 2011, ndvi: 0.61, delta: -0.09, rain7d: 26, est30dTon: 815, prodTha: 16.0, status: 'Stres Tajuk', tone: 'warn', eudr: 'Lolos EUDR', meta: 'Ulat Api', stress: true, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/C05' },
  { code: 'BLK-C07', div: 'Divisi III', group: 'Inti', areaHa: 1020, tt: 2016, ndvi: 0.75, delta: 0.00, rain7d: 74, est30dTon: 1345, prodTha: 19.5, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'Jalan Basah', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/C07' },
  { code: 'BLK-C09', div: 'Divisi III', group: 'Inti', areaHa: 420, tt: 2014, ndvi: 0.69, delta: -0.03, rain7d: 85, est30dTon: 490, prodTha: 17.8, status: 'Tertunda', tone: 'bad', eudr: 'Lolos EUDR', meta: 'Jembatan #2', stress: false, reroute: true, farmers: 0, hgu: 'HGU-KTG-04/C09' },

  // Divisi IV — Selatan Gambut (2.080 Ha | 2.560 ton)
  { code: 'BLK-E01', div: 'Divisi IV', group: 'Inti', areaHa: 1120, tt: 2018, ndvi: 0.79, delta: 0.01, rain7d: 51, est30dTon: 1410, prodTha: 18.9, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'Tinggi Muka Air OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/E01' },
  { code: 'BLK-E04', div: 'Divisi IV', group: 'Inti', areaHa: 960, tt: 2019, ndvi: 0.77, delta: 0.02, rain7d: 49, est30dTon: 1150, prodTha: 17.6, status: 'Optimal', tone: 'ok', eudr: 'Lolos EUDR', meta: 'BMKG OK', stress: false, reroute: false, farmers: 0, hgu: 'HGU-KTG-04/E04' },

  // Plasma Koperasi Makmur (1.240 Ha | 1.540 ton | 86 petani/poligon)
  { code: 'BLK-D02', div: 'Kop. Makmur', group: 'Plasma', areaHa: 180, tt: 2016, ndvi: 0.78, delta: 0.01, rain7d: 41, est30dTon: 245, prodTha: 19.8, status: 'Lolos EUDR', tone: 'ok', eudr: 'Lolos EUDR', meta: '48 petani', stress: false, reroute: false, farmers: 48, hgu: 'SHM-KM-01/D02' },
  { code: 'BLK-D05', div: 'Kop. Makmur', group: 'Plasma', areaHa: 1060, tt: 2017, ndvi: 0.76, delta: 0.00, rain7d: 46, est30dTon: 1295, prodTha: 18.4, status: 'Lolos EUDR', tone: 'ok', eudr: 'Lolos EUDR', meta: '38 petani', stress: false, reroute: false, farmers: 38, hgu: 'SHM-KM-02/D05' },

  // Plasma Koperasi Harapan Jaya (1.140 Ha | 1.320 ton | 62 petani/poligon)
  { code: 'BLK-P01', div: 'Kop. Harapan', group: 'Plasma', areaHa: 620, tt: 2018, ndvi: 0.77, delta: 0.01, rain7d: 43, est30dTon: 720, prodTha: 17.9, status: 'Lolos EUDR', tone: 'ok', eudr: 'Lolos EUDR', meta: '34 petani', stress: false, reroute: false, farmers: 34, hgu: 'SHM-HJ-01/P01' },
  { code: 'BLK-P04', div: 'Kop. Harapan', group: 'Plasma', areaHa: 520, tt: 2019, ndvi: 0.75, delta: 0.00, rain7d: 47, est30dTon: 600, prodTha: 17.4, status: 'Lolos EUDR', tone: 'ok', eudr: 'Lolos EUDR', meta: '28 petani', stress: false, reroute: false, farmers: 28, hgu: 'SHM-HJ-02/P04' },
];

const MILL_LINES = [
  { id: 'PKS-KTG-01A', name: 'PKS Katingan I — Line A (45 t/jam)', cap30d: 10500, alloc30d: 9620, oer: 22.8, ffa: 2.4, queueTrk: 14, status: 'Optimal', tone: 'ok' },
  { id: 'PKS-KTG-01B', name: 'PKS Katingan I — Line B (30 t/jam)', cap30d: 7500, alloc30d: 6480, oer: 22.4, ffa: 2.6, queueTrk: 9, status: 'Optimal', tone: 'ok' },
  { id: 'PKS-MTR-KSG', name: 'PKS Mitra Kasongan (Toll Milling)', cap30d: 2000, alloc30d: 1860, oer: 21.9, ffa: 2.9, queueTrk: 4, status: 'Tinggi 93%', tone: 'warn' },
  { id: 'BUF-RST-C09', name: 'Buffer Alih Rute (BLK-C09 / Restan)', cap30d: 1000, alloc30d: 490, oer: 21.2, ffa: 3.1, queueTrk: 6, status: 'Alih Rute', tone: 'info' },
];

const DOA_MEMOS = [
  { docNo: 'DOA-PN-2026-1142', desc: 'Alokasi Panen 30h & Kuota Timbangan PKS (18.450 ton)', maker: 'R. Gunawan', checker: 'H. Wijaya', stage: 'GM Operasional', tone: 'warn', status: 'Tunggu Final' },
  { docNo: 'DOA-RT-2026-1141', desc: 'Alih Rute 14 Dump Truck BLK-C09 via Jembatan #4', maker: 'D. Santoso', checker: 'H. Wijaya', stage: 'Disetujui', tone: 'ok', status: 'Aktif' },
  { docNo: 'DOA-AG-2026-1139', desc: 'Tindakan Isolasi Ganoderma & Sensus Pokok BLK-B04', maker: 'R. Gunawan', checker: 'Dr. S. Lestari', stage: 'Disetujui', tone: 'ok', status: 'SPK Terbit' },
  { docNo: 'DOA-EU-2026-1138', desc: 'Paket GeoJSON EUDR 148 Poligon Lot EXP-EU-2026-114', maker: 'A. Prasetyo', checker: 'N. Kartika', stage: 'Direktur Ops', tone: 'info', status: 'Siap TTE' },
  { docNo: 'DOA-PK-2026-1135', desc: 'Kontrak Olah Eksternal PKS Mitra Kasongan (1.860 ton)', maker: 'M. Yusuf', checker: 'F. Hidayat', stage: 'Disetujui', tone: 'ok', status: 'Aktif' },
];

const EUDR_CLUSTERS = [
  { id: 'HGU-KTG-01', name: 'Divisi I — Katingan Utara (HGU Inti)', type: 'HGU Inti', legal: 'SK HGU 42/BPN/2014', polygons: 1, areaHa: 3240, overlapHa: 0.0, hash: '9f2a..41c8', dds: 'Siap TRACES', tone: 'ok' },
  { id: 'HGU-KTG-02', name: 'Divisi II — Katingan Tengah (HGU Inti)', type: 'HGU Inti', legal: 'SK HGU 42/BPN/2014', polygons: 1, areaHa: 3315, overlapHa: 0.0, hash: '8e1b..77a4', dds: 'Siap TRACES', tone: 'ok' },
  { id: 'HGU-KTG-03', name: 'Divisi III — Tepian Sungai (HGU Inti)', type: 'HGU Inti', legal: 'SK HGU 42/BPN/2014', polygons: 1, areaHa: 3185, overlapHa: 0.0, hash: '7c4d..19e2', dds: 'Siap TRACES', tone: 'ok' },
  { id: 'HGU-KTG-04', name: 'Divisi IV — Selatan Gambut (HGU Inti)', type: 'HGU Inti', legal: 'SK HGU 43/BPN/2017', polygons: 1, areaHa: 2080, overlapHa: 0.0, hash: '5b9f..83d1', dds: 'Siap TRACES', tone: 'ok' },
  { id: 'KT-KM-01', name: 'Plasma Koperasi Makmur — Blok D02', type: 'Plasma SHM', legal: 'STDB-KTG-2024-011', polygons: 48, areaHa: 180, overlapHa: 0.0, hash: '4a81..f02c', dds: 'Lolos EUDR', tone: 'ok', selected: true },
  { id: 'KT-KM-02', name: 'Plasma Koperasi Makmur — D05 Utara', type: 'Plasma SHM', legal: 'STDB-KTG-2024-012', polygons: 10, areaHa: 260, overlapHa: 0.0, hash: '3d72..c914', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-KM-03', name: 'Plasma Koperasi Makmur — D05 Tengah', type: 'Plasma SHM', legal: 'STDB-KTG-2024-013', polygons: 8, areaHa: 220, overlapHa: 0.0, hash: '2c63..a80b', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-KM-04', name: 'Plasma Koperasi Makmur — D05 Selatan', type: 'Plasma SHM', legal: 'STDB-KTG-2024-014', polygons: 7, areaHa: 210, overlapHa: 0.0, hash: '1b54..e71a', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-KM-05', name: 'Plasma Koperasi Makmur — D05 Timur', type: 'Plasma SHM', legal: 'STDB-KTG-2024-015', polygons: 7, areaHa: 195, overlapHa: 0.0, hash: '0a45..d629', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-KM-06', name: 'Plasma Koperasi Makmur — D05 Barat', type: 'Plasma SHM', legal: 'STDB-KTG-2024-016', polygons: 6, areaHa: 175, overlapHa: 0.0, hash: 'f936..b538', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-HJ-01', name: 'Plasma Koperasi Harapan — P01 Utara', type: 'Plasma SHM', legal: 'STDB-KTG-2025-004', polygons: 18, areaHa: 320, overlapHa: 0.0, hash: 'e827..9447', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-HJ-02', name: 'Plasma Koperasi Harapan — P01 Selatan', type: 'Plasma SHM', legal: 'STDB-KTG-2025-005', polygons: 16, areaHa: 300, overlapHa: 0.0, hash: 'd718..8356', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-HJ-03', name: 'Plasma Koperasi Harapan — P04 Barat', type: 'Plasma SHM', legal: 'STDB-KTG-2025-006', polygons: 15, areaHa: 280, overlapHa: 0.0, hash: 'c609..7265', dds: 'Lolos EUDR', tone: 'ok' },
  { id: 'KT-HJ-04', name: 'Plasma Koperasi Harapan — P04 Timur', type: 'Plasma SHM', legal: 'STDB-KTG-2025-007', polygons: 13, areaHa: 240, overlapHa: 0.0, hash: 'b5fa..6174', dds: 'Lolos EUDR', tone: 'ok' },
];

const FIELD_PINS = [
  { id: 'PIN-2611-084', time: '18 Nov 10:14', block: 'BLK-B04', agro: 'R. Gunawan', symptom: 'Ganoderma boninense (Pelepah sengkleh)', sev: 'Tinggi', sevTone: 'bad', rtk: '±0,4 m', ndviAdj: '-0,14', sync: 'Tersinkron', syncTone: 'ok', action: 'Parit isolasi 1,5m + sensus', selected: true },
  { id: 'PIN-2611-083', time: '18 Nov 09:48', block: 'BLK-C09', agro: 'D. Santoso', symptom: 'Genangan jalan angkut 62 cm (Jemb. #2)', sev: 'Tinggi', sevTone: 'bad', rtk: '±0,6 m', ndviAdj: '-0,03', sync: 'Tersinkron', syncTone: 'ok', action: 'Alih rute Jembatan #4' },
  { id: 'PIN-2611-082', time: '18 Nov 09:12', block: 'BLK-B07', agro: 'R. Gunawan', symptom: 'Defisit air & nekrosis ujung daun (K)', sev: 'Sedang', sevTone: 'warn', rtk: '±0,5 m', ndviAdj: '-0,11', sync: 'Antre Offline', syncTone: 'warn', action: 'Koreksi dosis KCl 2,5 kg/pkk' },
  { id: 'PIN-2611-081', time: '18 Nov 08:35', block: 'BLK-C05', agro: 'T. Wibowo', symptom: 'Serangan ulat api Setothosea asigna', sev: 'Sedang', sevTone: 'warn', rtk: '±0,7 m', ndviAdj: '-0,09', sync: 'Antre Offline', syncTone: 'warn', action: 'Fogging bio-insektisida Bt' },
  { id: 'PIN-2611-080', time: '18 Nov 07:52', block: 'BLK-B04', agro: 'M. Fahri', symptom: 'Tubuh buah Ganoderma pangkal batang', sev: 'Tinggi', sevTone: 'bad', rtk: '±0,4 m', ndviAdj: '-0,13', sync: 'Antre Offline', syncTone: 'warn', action: 'Tandai pokok tumbang/sanitasi' },
  { id: 'PIN-2611-079', time: '17 Nov 16:40', block: 'BLK-A12', agro: 'S. Hartono', symptom: 'Verifikasi puncak buah matang (AKP 1:4)', sev: 'Normal', sevTone: 'ok', rtk: '±0,5 m', ndviAdj: '+0,03', sync: 'Tersinkron', syncTone: 'ok', action: 'Tambah 2 regu pemanen' },
  { id: 'PIN-2611-078', time: '17 Nov 15:18', block: 'BLK-D02', agro: 'A. Prasetyo', symptom: 'Validasi patok batas SHM Plasma #31-48', sev: 'Normal', sevTone: 'ok', rtk: '±0,3 m', ndviAdj: '+0,01', sync: 'Tersinkron', syncTone: 'ok', action: 'Unggah ke PostGIS EUDR' },
  { id: 'PIN-2611-077', time: '17 Nov 14:05', block: 'BLK-C07', agro: 'D. Santoso', symptom: 'Kepadatan gulma piringan pasca hujan', sev: 'Rendah', sevTone: 'info', rtk: '±0,8 m', ndviAdj: '0,00', sync: 'Tersinkron', syncTone: 'ok', action: 'Jadwal semprot piringan W47' },
  { id: 'PIN-2611-076', time: '17 Nov 11:22', block: 'BLK-E01', agro: 'B. Kurnia', symptom: 'Piezometer gambut TMA -52 cm (Ideal)', sev: 'Normal', sevTone: 'ok', rtk: '±0,5 m', ndviAdj: '+0,01', sync: 'Tersinkron', syncTone: 'ok', action: 'Pertahankan sekat kanal #7' },
  { id: 'PIN-2611-075', time: '16 Nov 16:08', block: 'BLK-B01', agro: 'R. Gunawan', symptom: 'Sensus buah hitam & brondolan piringan', sev: 'Normal', sevTone: 'ok', rtk: '±0,6 m', ndviAdj: '-0,01', sync: 'Tersinkron', syncTone: 'ok', action: 'Mutu panen lulus (OER >22%)' },
  { id: 'PIN-2611-074', time: '16 Nov 13:45', block: 'BLK-P01', agro: 'A. Prasetyo', symptom: 'Audit kepatuhan pupuk Koperasi Harapan', sev: 'Normal', sevTone: 'ok', rtk: '±0,5 m', ndviAdj: '+0,01', sync: 'Tersinkron', syncTone: 'ok', action: 'Catatan STDB diperbarui' },
  { id: 'PIN-2611-073', time: '16 Nov 10:15', block: 'BLK-A08', agro: 'S. Hartono', symptom: 'Kalibrasi taksasi janjang (BJR 19,4 kg)', sev: 'Normal', sevTone: 'ok', rtk: '±0,4 m', ndviAdj: '+0,01', sync: 'Tersinkron', syncTone: 'ok', action: 'Perbarui bobot XGBoost' },
];

const REROUTE_DISPATCH = [
  { unit: 'DT-04 (8T)', from: 'C09 TPH 01-06', via: 'Koridor Timur (Jemb. #4)', extraKm: '+4,8 km', eta: '+26m', loadTon: 42, status: 'Berjalan', tone: 'ok' },
  { unit: 'DT-09 (8T)', from: 'C09 TPH 07-12', via: 'Koridor Timur (Jemb. #4)', extraKm: '+4,8 km', eta: '+28m', loadTon: 44, status: 'Berjalan', tone: 'ok' },
  { unit: 'DT-12 (8T)', from: 'C09 TPH 13-18', via: 'Koridor Timur (Jemb. #4)', extraKm: '+5,1 km', eta: '+31m', loadTon: 38, status: 'Muat TPH', tone: 'info' },
  { unit: 'DT-15 (8T)', from: 'C09 TPH 19-24', via: 'Staging Yard Div III', extraKm: '+2,2 km', eta: '+14m', loadTon: 36, status: 'Antre WB', tone: 'warn' },
];

// Derived aggregates
const TOTAL_AREA_HA = BLOCKS.reduce((s, b) => s + b.areaHa, 0);
const TOTAL_EST_30D = BLOCKS.reduce((s, b) => s + b.est30dTon, 0);
const STRESS_BLOCKS = BLOCKS.filter((b) => b.stress);
const REROUTE_BLOCKS = BLOCKS.filter((b) => b.reroute);
const WEIGHTED_NDVI = BLOCKS.reduce((s, b) => s + b.ndvi * b.areaHa, 0) / TOTAL_AREA_HA;
const TOTAL_MILL_CAP = MILL_LINES.reduce((s, m) => s + m.cap30d, 0);
const TOTAL_MILL_ALLOC = MILL_LINES.reduce((s, m) => s + m.alloc30d, 0);
const MILL_UTIL_PCT = (TOTAL_MILL_ALLOC / TOTAL_MILL_CAP) * 100;
const PLASMA_POLYGONS = EUDR_CLUSTERS.filter((c) => c.type === 'Plasma SHM').reduce((s, c) => s + c.polygons, 0);
const HGU_POLYGONS = EUDR_CLUSTERS.filter((c) => c.type === 'HGU Inti').reduce((s, c) => s + c.polygons, 0);
const EUDR_AREA_HA = EUDR_CLUSTERS.reduce((s, c) => s + c.areaHa, 0);
const EUDR_OVERLAP_HA = EUDR_CLUSTERS.reduce((s, c) => s + c.overlapHa, 0);
const SYNCED_PINS = FIELD_PINS.filter((p) => p.sync === 'Tersinkron').length;
const QUEUED_PINS = FIELD_PINS.filter((p) => p.sync === 'Antre Offline').length;

// Division Rollup
const DIV_ORDER = ['Divisi I', 'Divisi II', 'Divisi III', 'Divisi IV', 'Kop. Makmur', 'Kop. Harapan'];
const DIV_ROLLUP = DIV_ORDER.map((divName) => {
  const rows = BLOCKS.filter((b) => b.div === divName);
  const areaHa = rows.reduce((s, b) => s + b.areaHa, 0);
  const est30dTon = rows.reduce((s, b) => s + b.est30dTon, 0);
  const avgNdvi = rows.reduce((s, b) => s + b.ndvi * b.areaHa, 0) / areaHa;
  const stressCnt = rows.filter((b) => b.stress).length;
  const rerouteCnt = rows.filter((b) => b.reroute).length;
  return {
    div: divName,
    group: rows[0].group,
    blocks: rows.length,
    areaHa,
    est30dTon,
    avgNdvi,
    stressCnt,
    rerouteCnt,
    sharePct: (est30dTon / TOTAL_EST_30D) * 100,
  };
});

export function verifyMath() {
  if (BLOCKS.length !== 18) throw new Error(`Expected 18 blocks, got ${BLOCKS.length}`);
  if (TOTAL_AREA_HA !== 14200) throw new Error(`Total area mismatch: ${TOTAL_AREA_HA} != 14200`);
  if (TOTAL_EST_30D !== 18450) throw new Error(`Total est30dTon mismatch: ${TOTAL_EST_30D} != 18450`);
  if (STRESS_BLOCKS.length !== 3) throw new Error(`Stress blocks mismatch: ${STRESS_BLOCKS.length} != 3`);
  if (REROUTE_BLOCKS.length !== 1) throw new Error(`Reroute blocks mismatch: ${REROUTE_BLOCKS.length} != 1`);
  if (TOTAL_MILL_CAP !== 21000) throw new Error(`Mill cap mismatch: ${TOTAL_MILL_CAP} != 21000`);
  if (TOTAL_MILL_ALLOC !== TOTAL_EST_30D) throw new Error(`Mill alloc ${TOTAL_MILL_ALLOC} != est30d ${TOTAL_EST_30D}`);
  if (PLASMA_POLYGONS !== 148) throw new Error(`Plasma polygons mismatch: ${PLASMA_POLYGONS} != 148`);
  if (HGU_POLYGONS !== 4) throw new Error(`HGU polygons mismatch: ${HGU_POLYGONS} != 4`);
  if (EUDR_AREA_HA !== TOTAL_AREA_HA) throw new Error(`EUDR area ${EUDR_AREA_HA} != ${TOTAL_AREA_HA}`);
  if (EUDR_OVERLAP_HA !== 0) throw new Error(`EUDR overlap must be 0, got ${EUDR_OVERLAP_HA}`);
  const divArea = DIV_ROLLUP.reduce((s, d) => s + d.areaHa, 0);
  const divTon = DIV_ROLLUP.reduce((s, d) => s + d.est30dTon, 0);
  if (divArea !== TOTAL_AREA_HA) throw new Error(`Div area rollup mismatch: ${divArea}`);
  if (divTon !== TOTAL_EST_30D) throw new Error(`Div ton rollup mismatch: ${divTon}`);
  const farmersBlockSum = BLOCKS.reduce((s, b) => s + b.farmers, 0);
  if (farmersBlockSum !== PLASMA_POLYGONS) throw new Error(`Block farmers ${farmersBlockSum} != ${PLASMA_POLYGONS}`);
  if (SYNCED_PINS + QUEUED_PINS !== FIELD_PINS.length) throw new Error(`Pin sync total mismatch`);
  if (SYNCED_PINS !== 9 || QUEUED_PINS !== 3) throw new Error(`Expected 9 synced / 3 queued pins`);
}

// ============================================================================
// SAP S/4HANA FIORI HORIZON ENTERPRISE SHELL (LIGHT-FIRST, #2D6A4F ANCHOR)
// ============================================================================
const EXTRA_CSS = `
  /* Fiori Horizon Light Enterprise Shell */
  .tp-topbar {
    height: 38px;
    background: #ffffff;
    border-top: 3px solid #2d6a4f;
    border-bottom: 1px solid #d6dbd5;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .tp-top-left, .tp-top-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .tp-brand {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: -0.02em;
    color: #14201a;
    white-space: nowrap;
  }
  .tp-brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #2d6a4f;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .tp-sep {
    width: 1px;
    height: 18px;
    background: #d6dbd5;
    flex-shrink: 0;
  }
  .tp-selector {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f8f9f7;
    border: 1px solid #c9d1c8;
    color: #14201a;
    font-size: 10.6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .tp-selector-accent {
    background: #e6f2ec;
    border-color: #a3cbb7;
    color: #1b4332;
  }
  .tp-search {
    height: 24px;
    width: 264px;
    padding: 0 8px;
    border-radius: 3px;
    background: #f4f5f3;
    border: 1px solid #c9d1c8;
    color: #5f7067;
    font-size: 10.3px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .tp-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 0 4px;
    border-radius: 2px;
    background: #ffffff;
    border: 1px solid #c9d1c8;
    color: #3e4e46;
  }
  .tp-user {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding-left: 8px;
    border-left: 1px solid #d6dbd5;
    white-space: nowrap;
  }
  .tp-avatar {
    width: 23px;
    height: 23px;
    border-radius: 3px;
    background: #1b4332;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Second-tier Fiori Horizon Module Tab Bar */
  .tp-navstrip {
    height: 34px;
    background: #f8f9f7;
    border-bottom: 1px solid #d6dbd5;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .tp-tabs {
    display: flex;
    align-items: stretch;
    height: 34px;
    gap: 2px;
  }
  .tp-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    font-size: 11px;
    font-weight: 600;
    color: #4b5d53;
    border-bottom: 2.5px solid transparent;
    white-space: nowrap;
  }
  .tp-tab.is-active {
    color: #1b4332;
    background: #ffffff;
    border-bottom-color: #2d6a4f;
    font-weight: 700;
  }
  .tp-tab-cnt {
    font-family: var(--e-mono);
    font-size: 9.2px;
    padding: 0.5px 5px;
    border-radius: 2px;
    background: #e8ece8;
    color: #3e4e46;
  }
  .tp-tab.is-active .tp-tab-cnt {
    background: #2d6a4f;
    color: #ffffff;
  }
  .tp-tab-cnt.warn {
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  }
  .tp-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* Main Workspace */
  .tp-workspace {
    flex: 1;
    min-height: 0;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
    background: #f4f5f3;
  }

  /* Override accents to botanical forest-emerald */
  .e-badge-accent {
    background: #e6f2ec;
    color: #1b4332;
    border-color: #a3cbb7;
  }
  table.e-table th {
    background: #f2f5f2;
    color: #3e4e46;
    border-bottom: 1px solid #c3ccc3;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fafbf9;
  }
  table.e-table tbody tr.is-selected {
    background: #e6f2ec !important;
    box-shadow: inset 3px 0 0 #2d6a4f;
  }
  table.e-table tfoot td {
    background: #edf2ee;
    border-top: 1px solid #bcc5bc;
    color: #14201a;
  }
  .e-statusbar {
    background: #ecefe9;
    border-top: 1px solid #c8d0c7;
    color: #3e4e46;
  }

  /* Custom Enterprise Components */
  .tp-filterbar {
    height: 36px;
    background: #ffffff;
    border: 1px solid #d6dbd5;
    border-radius: 4px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .tp-chip-row {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }
  .tp-chip {
    height: 22px;
    padding: 0 8px;
    border-radius: 3px;
    border: 1px solid #d6dbd5;
    background: #f8f9f7;
    color: #3e4e46;
    font-size: 10.2px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .tp-chip.is-on {
    background: #2d6a4f;
    border-color: #2d6a4f;
    color: #ffffff;
  }
  .tp-chip.is-warn {
    background: #fffbeb;
    border-color: #fde68a;
    color: #b45309;
  }

  /* DoA Maker-Checker Horizontal Stepper */
  .tp-stepper {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .tp-step {
    border: 1px solid #d6dbd5;
    border-radius: 3px;
    padding: 7px 8px;
    background: #f8f9f7;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .tp-step.is-done {
    background: #f2f9f5;
    border-color: #a3cbb7;
  }
  .tp-step.is-curr {
    background: #fffbeb;
    border-color: #f59e0b;
    box-shadow: inset 3px 0 0 #d97706;
  }
  .tp-step-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.6px;
    font-weight: 700;
    color: #3e4e46;
  }
  .tp-step-title {
    font-size: 10.8px;
    font-weight: 700;
    color: #14201a;
  }
  .tp-step-meta {
    font-size: 9.5px;
    color: #5f7067;
    font-family: var(--e-mono);
  }

  /* Alert Row inside Panels */
  .tp-alert-item {
    border: 1px solid #d6dbd5;
    border-left-width: 3px;
    border-radius: 3px;
    padding: 6px 9px;
    background: #ffffff;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .tp-alert-warn { border-left-color: #d97706; background: #fffdf7; }
  .tp-alert-bad  { border-left-color: #be123c; background: #fff9fa; }
  .tp-alert-info { border-left-color: #0369a1; background: #f8fcff; }

  /* Comfortable row density variants for tables that fill tall panels */
  table.e-table.tp-table-lg td { padding: 7.5px 7px; }
  table.e-table.tp-table-xl td { padding: 9.5px 8px; }
  table.e-table.tp-table-md td { padding: 6.5px 7px; }

  /* Monospace Code / SQL / GeoJSON Box */
  .tp-codebox {
    background: #14201a;
    color: #d8e6df;
    border: 1px solid #26382f;
    border-radius: 3px;
    padding: 8px 10px;
    font-family: var(--e-mono);
    font-size: 9.2px;
    line-height: 1.44;
    white-space: pre;
    overflow: hidden;
  }
  .tp-code-kw { color: #74c69d; font-weight: 700; }
  .tp-code-str { color: #fde68a; }
  .tp-code-num { color: #93c5fd; }
  .tp-code-com { color: #84a595; }

  /* GIS Layer Switch */
  .tp-layer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-bottom: 1px solid #e7ece7;
    gap: 6px;
  }
  .tp-layer-row:last-child { border-bottom: 0; }
  .tp-toggle {
    width: 24px;
    height: 13px;
    border-radius: 999px;
    background: #cbd5e1;
    position: relative;
    flex-shrink: 0;
  }
  .tp-toggle.on { background: #2d6a4f; }
  .tp-toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #ffffff;
  }
  .tp-toggle.on::after { left: 13px; }

  /* Field Mobile Device Frame (Flat Enterprise Hairline) */
  .tp-phone {
    width: 278px;
    height: 742px;
    background: #ffffff;
    border: 2px solid #24332c;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }
  .tp-phone-sys {
    height: 22px;
    background: #1b4332;
    color: #d8f3dc;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9px;
    flex-shrink: 0;
  }
  .tp-phone-hdr {
    padding: 8px 10px;
    background: #f8f9f7;
    border-bottom: 1px solid #d6dbd5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .tp-phone-body {
    flex: 1;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
    background: #f4f5f3;
  }
  .tp-phone-card {
    background: #ffffff;
    border: 1px solid #d6dbd5;
    border-radius: 4px;
    padding: 7px 8px;
  }
  .tp-phone-foot {
    height: 38px;
    background: #ffffff;
    border-top: 1px solid #d6dbd5;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-shrink: 0;
  }
`;

function customIcon(kind, size = 13, color = 'currentColor') {
  const paths = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cloudRain: '<line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    wifiOff: '<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    satellite: '<path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',
    smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  };
  const d = paths[kind] || paths.leaf;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${d}</svg>`;
}

function fmtNdvi(v) {
  return v.toFixed(2).replace('.', ',');
}
function fmtDelta(v) {
  const sign = v > 0 ? '+' : '';
  return sign + v.toFixed(2).replace('.', ',');
}

function renderFioriShell({ activeTab, title, workspaceHtml, primaryLabel = 'Jalankan Prediksi 30h', secondaryLabel = 'Ekspor GeoJSON EUDR', statusNote = 'PostGIS Check: 148 poligon plasma lulus baseline pra-2020 (0 deforestasi)' }) {
  const tabs = [
    { id: 'p1', label: 'Komando Kebun & PKS', icon: ic('activity', 12), cnt: '18.450 t', warn: false },
    { id: 'p2', label: 'Matriks Blok & NDVI', icon: ic('layers', 12), cnt: '18 blok', warn: false },
    { id: 'p3', label: 'Peta Spasial & BMKG', icon: customIcon('compass', 12), cnt: 'S2 18 Nov', warn: false },
    { id: 'p4', label: 'Kepatuhan EUDR & DoA', icon: ic('shield', 12), cnt: '148/148', warn: false },
    { id: 'p5', label: 'Inspeksi Agronom Offline', icon: customIcon('smartphone', 12), cnt: '3 antre', warn: true },
  ];

  const topbar = `<header class="tp-topbar">
    <div class="tp-top-left">
      <div class="tp-brand">
        <span class="tp-brand-mark">${customIcon('leaf', 13, '#ffffff')}</span>
        <span>TaniPredict AI</span>
      </div>
      <span class="tp-sep"></span>
      <div class="tp-selector tp-selector-accent">
        ${ic('layers', 11, '#1b4332')}
        <span>PT Rimba Sawit Nusantara Tbk · Kebun Katingan (14.200 Ha)</span>
        ${ic('chevronDown', 11, '#2d6a4f')}
      </div>
      <div class="tp-selector">
        ${customIcon('satellite', 11, '#2d6a4f')}
        <span class="mono" style="font-size:10px;">PASS SENTINEL-2 18 NOV · SIKLUS NOV 2026</span>
      </div>
      <div class="tp-search">
        <span style="display:inline-flex;align-items:center;gap:5px;" class="trunc">
          ${ic('search', 11, '#5f7067')}
          <span class="trunc">Cari kode blok, HGU, poligon plasma, DOA...</span>
        </span>
        <span class="tp-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="tp-top-right">
      <div class="tp-selector" style="background:#ecfdf5;border-color:#a7f3d0;color:#047857;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:9.8px;">PostGIS 3.4 · BMKG Live · PKS Bridge</span>
      </div>
      <div class="tp-user">
        <span class="tp-avatar">HW</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#14201a;">Ir. Hendra Wijaya</div>
          <div style="font-size:9px;color:#5f7067;">Kepala Agronomi &amp; GIS · KTG</div>
        </div>
      </div>
    </div>
  </header>`;

  const navstrip = `<nav class="tp-navstrip">
    <div class="tp-tabs">
      ${tabs
        .map(
          (t) => `<div class="tp-tab ${t.id === activeTab ? 'is-active' : ''}">
            ${t.icon}
            <span>${esc(t.label)}</span>
            <span class="tp-tab-cnt ${t.warn && t.id !== activeTab ? 'warn' : ''}">${esc(t.cnt)}</span>
          </div>`
        )
        .join('')}
    </div>
    <div class="tp-actions">
      <span class="e-btn">${ic('download', 11, '#2d6a4f')} ${esc(secondaryLabel)}</span>
      <span class="e-btn e-btn-primary">${ic('play', 11, '#ffffff')} ${esc(primaryLabel)}</span>
    </div>
  </nav>`;

  const footer = renderStatusFooter({
    leftItems: [
      `<span class="dot dot-ok"></span> <span>${esc(statusNote)}</span>`,
      `<span>CRS: EPSG:4326 / UTM 49S</span>`,
      `<span>Sentinel-2 L2A Cloud: 4,2%</span>`,
    ],
    rightItems: [
      `<span>Model: XGBoost-Yield v4.2 (R² 0,91)</span>`,
      `<span>Sinkron PKS: 18 Nov 2026 10:28 WIB</span>`,
    ],
  });

  return wrapEnterpriseHtml({
    title: `TaniPredict AI — ${title}`,
    accent: '#2d6a4f',
    accentSoft: '#e6f2ec',
    accentInk: '#1b4332',
    bg: '#f4f5f3',
    surface: '#ffffff',
    surface2: '#f8f9f7',
    border: '#d6dbd5',
    borderStrong: '#bcc5bc',
    text: '#14201a',
    text2: '#3e4e46',
    muted: '#5f7067',
    extraCss: EXTRA_CSS,
    bodyHtml: `${topbar}${navstrip}<main class="tp-workspace">${workspaceHtml}</main>${footer}`,
  });
}

// ============================================================================
// PAGE 1: KOMANDO KEBUN, PRAKIRAAN TBS 30 HARI & NERACA PKS
// ============================================================================
function renderPage1() {
  const kpis = [
    { label: 'Est. TBS Panen (30 Hari)', val: `${fmtNum(TOTAL_EST_30D)} ton`, sub: 'Inti 15.590 t · Plasma 2.860 t', tone: 'ok', badgeTxt: '+4,8% vs Okt', spark: [560, 585, 610, 598, 625, 648, 632, 662] },
    { label: 'Utilisasi Kapasitas PKS', val: fmtPct(MILL_UTIL_PCT, 1), sub: `${fmtNum(TOTAL_MILL_ALLOC)} / ${fmtNum(TOTAL_MILL_CAP)} ton (30h)`, tone: 'ok', badgeTxt: 'OER 22,5%', spark: [82, 84, 85, 86, 89, 87, 88, 87.9] },
    { label: 'Rata-rata NDVI Tajuk', val: WEIGHTED_NDVI.toFixed(3).replace('.', ','), sub: 'Pass Sentinel-2A 18 Nov · 14.200 Ha', tone: 'ok', badgeTxt: 'Tajuk Sehat', spark: [0.74, 0.75, 0.75, 0.76, 0.77, 0.76, 0.762] },
    { label: 'Blok Stres / Anomali', val: `${STRESS_BLOCKS.length} blok`, sub: 'BLK-B04, BLK-B07, BLK-C05 (1.900 Ha)', tone: 'warn', badgeTxt: '1 Alih Rute', spark: [1, 1, 2, 2, 3, 3, 3] },
    { label: 'Hujan BMKG Katingan (7h)', val: '118 mm', sub: 'Puncak 85 mm di Divisi III (C09)', tone: 'info', badgeTxt: 'Waspada Banjir', spark: [12, 18, 14, 22, 41, 68, 85] },
    { label: 'Poligon EUDR Pasca-2020', val: '100% bersih', sub: `${PLASMA_POLYGONS} plasma + ${HGU_POLYGONS} HGU · 0 deforestasi`, tone: 'ok', badgeTxt: 'TRACES Ready', spark: [98, 99, 99, 100, 100, 100] },
  ];

  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(6,1fr);">
    ${kpis
      .map(
        (k) => `<div class="e-kpi">
          <div class="e-kpi-top">
            <span class="trunc">${esc(k.label)}</span>
            ${badge(k.badgeTxt, k.tone)}
          </div>
          <div class="e-kpi-mid">
            <div class="e-kpi-val">${esc(k.val)}</div>
            ${svgSparkline({ points: k.spark, width: 64, height: 20, color: k.tone === 'warn' ? '#b45309' : k.tone === 'info' ? '#0369a1' : '#2d6a4f' })}
          </div>
          <div class="e-kpi-foot"><span class="trunc">${esc(k.sub)}</span></div>
        </div>`
      )
      .join('')}
  </section>`;

  // 30-day TBS forecast chart (10 key checkpoints spanning 19 Nov -> 18 Des)
  const forecastChart = svgMultiLineChart({
    width: 930,
    height: 248,
    xLabels: ['19 Nov', '22 Nov', '25 Nov', '28 Nov', '01 Des', '04 Des', '07 Des', '10 Des', '13 Des', '18 Des'],
    series: [
      { label: 'Prediksi Total TBS Masuk (t/hari)', values: [575, 595, 620, 648, 668, 652, 630, 608, 588, 570], color: '#2d6a4f', area: true, dots: true, width: 2.1 },
      { label: 'Kontribusi Kebun Inti (t/hari)', values: [485, 502, 524, 548, 565, 550, 532, 514, 496, 480], color: '#0369a1', area: false, dots: false, width: 1.6 },
      { label: 'Batas Aman Antrean Restan (t/hari)', values: [540, 540, 540, 540, 540, 540, 540, 540, 540, 540], color: '#94a3b8', dashed: true, width: 1.2 },
    ],
    yMin: 350,
    yMax: 760,
    yTicks: 4,
    yUnit: 't',
    threshold: { value: 700, label: 'Kapasitas PKS 700 t/hari', color: '#be123c' },
    annotations: [
      { index: 0, seriesIdx: 0, label: 'Alih Rute C09 (-24 t/h)', color: '#be123c', dy: -30 },
      { index: 4, seriesIdx: 0, label: 'Puncak Div I (668 t/h)', color: '#2d6a4f', dy: -28 },
    ],
  });

  const divRowsHtml = DIV_ROLLUP.map(
    (d) => `<tr>
      <td><strong>${esc(d.div)}</strong> <span style="color:#5f7067;font-size:9.5px;">(${d.blocks} blk)</span></td>
      <td>${badge(d.group, d.group === 'Plasma' ? 'info' : 'neutral')}</td>
      <td class="num mono">${fmtNum(d.areaHa)}</td>
      <td class="num mono">${fmtNdvi(d.avgNdvi)}</td>
      <td class="num mono"><strong>${fmtNum(d.est30dTon)}</strong></td>
      <td>${d.stressCnt > 0 ? badge(`${d.stressCnt} Stres`, 'warn') : d.rerouteCnt > 0 ? badge('Alih Rute', 'bad') : badge('Optimal', 'ok')}</td>
    </tr>`
  ).join('');

  const millRowsHtml = MILL_LINES.map((m) => {
    const util = (m.alloc30d / m.cap30d) * 100;
    return `<tr>
      <td><div style="font-weight:700;color:#14201a;" class="trunc">${esc(m.name)}</div><div class="mono" style="font-size:9.2px;color:#5f7067;">${esc(m.id)} · Antre ${m.queueTrk} truk</div></td>
      <td class="num mono">${fmtNum(m.cap30d)}</td>
      <td class="num mono"><strong>${fmtNum(m.alloc30d)}</strong></td>
      <td style="width:140px;">${renderCapacityBar(util, { warnAt: 88, critAt: 95 })}</td>
      <td class="num mono">${m.oer.toFixed(1).replace('.', ',')}%</td>
      <td>${badge(m.status, m.tone)}</td>
    </tr>`;
  }).join('');

  const doaRowsHtml = DOA_MEMOS.map(
    (m) => `<tr>
      <td class="mono" style="font-weight:700;color:#1b4332;">${esc(m.docNo)}</td>
      <td class="trunc">${esc(m.desc)}</td>
      <td class="trunc">${esc(m.maker)} / ${esc(m.checker)}</td>
      <td>${badge(m.status, m.tone)}</td>
    </tr>`
  ).join('');

  const workspaceHtml = `${kpiHtml}
  <div style="display:grid;grid-template-columns:1.52fr 1fr;gap:10px;height:408px;flex-shrink:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('activity', 13, '#2d6a4f')} <span>Proyeksi Kedatangan TBS Harian vs Kapasitas Olah PKS (19 Nov – 18 Des 2026)</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('XGBoost + Sentinel-2 NDVI + BMKG', 'accent')}
          ${badge('Akurasi Backtest MAPE 3,4%', 'ok')}
        </div>
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>${forecastChart}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:8px;border-top:1px solid #e6ebe6;">
          <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.5px;color:#5f7067;font-weight:600;">Rata-rata Masuk Harian</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#14201a;">615,0 ton/hari</div>
            <div style="font-size:9.2px;color:#047857;">Margin aman 85 t/hari</div>
          </div>
          <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.5px;color:#5f7067;font-weight:600;">Puncak Panen (01 Des)</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#1b4332;">668,0 ton/hari</div>
            <div style="font-size:9.2px;color:#5f7067;">95,4% kapasitas efektif</div>
          </div>
          <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.5px;color:#5f7067;font-weight:600;">Beban Plasma Kemitraan</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#0369a1;">2.860 ton (15,5%)</div>
            <div style="font-size:9.2px;color:#5f7067;">148 petani · 2 koperasi</div>
          </div>
          <div style="background:#fffdf7;border:1px solid #fde68a;border-radius:3px;padding:6px 8px;">
            <div style="font-size:9.5px;color:#92400e;font-weight:600;">Risiko Restan Curah Hujan</div>
            <div class="mono" style="font-size:13px;font-weight:700;color:#b45309;">490 ton (BLK-C09)</div>
            <div style="font-size:9.2px;color:#92400e;">Dialihkan via Jembatan #4</div>
          </div>
        </div>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 13, '#2d6a4f')} <span>Neraca Divisi Inti &amp; Kemitraan Plasma (14.200 Ha)</span></div>
        <span class="e-panel-sub">6 Unit · 18 Blok</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:142px;">Unit / Divisi</th>
              <th style="width:68px;">Skema</th>
              <th class="num" style="width:72px;">Luas (Ha)</th>
              <th class="num" style="width:62px;">NDVI</th>
              <th class="num" style="width:82px;">Est. 30h (t)</th>
              <th style="width:88px;">Kondisi</th>
            </tr>
          </thead>
          <tbody>${divRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td>TOTAL KEBUN</td>
              <td>Inti+Plsm</td>
              <td class="num mono">${fmtNum(TOTAL_AREA_HA)}</td>
              <td class="num mono">${WEIGHTED_NDVI.toFixed(2).replace('.', ',')}</td>
              <td class="num mono">${fmtNum(TOTAL_EST_30D)}</td>
              <td>3 Stres · 1 Rute</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 10px;display:flex;flex-direction:column;gap:5px;background:#f8f9f7;border-top:1px solid #d6dbd5;">
          <div style="font-size:9.8px;font-weight:700;color:#3e4e46;display:flex;align-items:center;justify-content:space-between;">
            <span>PERINGATAN DINI &amp; ESKALASI OPERASIONAL (3 AKTIF)</span>
            <span class="mono" style="color:#5f7067;">Update 10:24 WIB</span>
          </div>
          <div class="tp-alert-item tp-alert-warn" style="padding:5px 8px;">
            <div style="min-width:0;">
              <div style="font-size:10.2px;font-weight:700;color:#14201a;">BLK-B04 (245 Ha) — NDVI turun -0,14 · Dugaan Stres Kering / Ganoderma</div>
              <div style="font-size:9.2px;color:#5f7067;">Pin agronom #084 terkonfirmasi; proyeksi 16,1 t/ha; SPK isolasi aktif.</div>
            </div>
            ${badge('Inspeksi', 'warn')}
          </div>
          <div class="tp-alert-item tp-alert-bad" style="padding:5px 8px;">
            <div style="min-width:0;">
              <div style="font-size:10.2px;font-weight:700;color:#14201a;">BLK-C09 (420 Ha) — Jalan angkut tergenang pasca hujan BMKG 85 mm</div>
              <div style="font-size:9.2px;color:#5f7067;">Jembatan #2 ditutup sementara; 14 truk dialihkan ke Koridor Timur (#4).</div>
            </div>
            ${badge('Alih Rute', 'bad')}
          </div>
          <div class="tp-alert-item tp-alert-info" style="padding:5px 8px;">
            <div style="min-width:0;">
              <div style="font-size:10.2px;font-weight:700;color:#14201a;">BLK-B07 &amp; BLK-C05 (1.655 Ha) — Defisit Air (-0,11) &amp; Ulat Api (-0,09)</div>
              <div style="font-size:9.2px;color:#5f7067;">Pin offline #082 &amp; #081 antre uplink; dosis KCl &amp; fogging Bt dijadwalkan.</div>
            </div>
            ${badge('Pantau', 'info')}
          </div>
        </div>
      </div>
    </section>
  </div>

  <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:10px;flex:1;min-height:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${customIcon('truck', 13, '#2d6a4f')} <span>Kapasitas Olah PKS &amp; Sinkronisasi Timbangan Jembatan (Weighbridge)</span></div>
        <span class="e-panel-sub">Total Alokasi ${fmtNum(TOTAL_MILL_ALLOC)} / ${fmtNum(TOTAL_MILL_CAP)} ton</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table tp-table-xl">
          <thead>
            <tr>
              <th>Fasilitas Pengolahan / Line PKS</th>
              <th class="num" style="width:76px;">Kap. 30h</th>
              <th class="num" style="width:76px;">Alokasi</th>
              <th style="width:140px;">Utilisasi</th>
              <th class="num" style="width:62px;">OER</th>
              <th style="width:86px;">Status</th>
            </tr>
          </thead>
          <tbody>${millRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td>TOTAL NERACA OLAH PKS (30 HARI)</td>
              <td class="num mono">${fmtNum(TOTAL_MILL_CAP)}</td>
              <td class="num mono">${fmtNum(TOTAL_MILL_ALLOC)}</td>
              <td class="mono" style="font-size:10.2px;">${fmtPct(MILL_UTIL_PCT, 1)} Terisi</td>
              <td class="num mono">22,5%</td>
              <td>Seimbang</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:10px 11px;background:#f8f9f7;border-top:1px solid #d6dbd5;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
          <div>
            <div style="font-size:9.4px;color:#5f7067;font-weight:600;">Tiket Timbang Hari Ini (WB-01/02)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#14201a;">74 truk · 592,4 ton</div>
            <div style="font-size:9.2px;color:#047857;">Deviasi vs prediksi: -1,2%</div>
          </div>
          <div>
            <div style="font-size:9.4px;color:#5f7067;font-weight:600;">Rata-rata Asam Lemak Bebas (ALB/FFA)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#14201a;">2,58% (Batas &lt; 3,5%)</div>
            <div style="font-size:9.2px;color:#5f7067;">Restan &lt; 24 jam di semua line</div>
          </div>
          <div>
            <div style="font-size:9.4px;color:#5f7067;font-weight:600;">Estimasi Produksi CPO (30 Hari)</div>
            <div class="mono" style="font-size:12px;font-weight:700;color:#1b4332;">4.151 ton CPO</div>
            <div style="font-size:9.2px;color:#047857;">Siap kontrak ekspor EU-114</div>
          </div>
        </div>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('checkCircle', 13, '#2d6a4f')} <span>Tata Kelola DoA (Maker-Checker) Rencana Panen &amp; Alokasi Truk</span></div>
        ${badge('SAP DoA Matrix v2.4', 'accent')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;justify-content:space-between;">
        <div class="tp-stepper">
          <div class="tp-step is-done">
            <div class="tp-step-head"><span>1. MODEL AI</span>${ic('check', 11, '#047857')}</div>
            <div class="tp-step-title">XGBoost + NDVI</div>
            <div class="tp-step-meta">18 Nov 06:00 WIB</div>
          </div>
          <div class="tp-step is-done">
            <div class="tp-step-head"><span>2. MAKER</span>${ic('check', 11, '#047857')}</div>
            <div class="tp-step-title">Asisten Kepala</div>
            <div class="tp-step-meta">R. Gunawan · OK</div>
          </div>
          <div class="tp-step is-done">
            <div class="tp-step-head"><span>3. CHECKER</span>${ic('check', 11, '#047857')}</div>
            <div class="tp-step-title">Manajer PKS &amp; GIS</div>
            <div class="tp-step-meta">H. Wijaya · OK</div>
          </div>
          <div class="tp-step is-curr">
            <div class="tp-step-head"><span>4. APPROVER</span>${ic('clock', 11, '#b45309')}</div>
            <div class="tp-step-title">GM Operasional</div>
            <div class="tp-step-meta">SLA 14:00 WIB</div>
          </div>
        </div>
        <div style="border:1px solid #d6dbd5;border-radius:3px;overflow:hidden;flex:1;">
          <table class="e-table tp-table-md">
            <thead>
              <tr>
                <th style="width:128px;">No. Dokumen DoA</th>
                <th>Uraian Keputusan Operasional</th>
                <th style="width:136px;">Maker / Checker</th>
                <th style="width:94px;">Status</th>
              </tr>
            </thead>
            <tbody>${doaRowsHtml}</tbody>
          </table>
        </div>
      </div>
    </section>
  </div>`;

  return renderFioriShell({
    activeTab: 'p1',
    title: meta.pages[0].title,
    workspaceHtml,
  });
}

// ============================================================================
// PAGE 2: MATRIKS 18 BLOK AGRONOMI & INSPEKTOR ANOMALI NDVI
// ============================================================================
function renderPage2() {
  const rowsHtml = BLOCKS.map((b) => {
    const rowCls = b.selected ? 'is-selected' : b.reroute ? 'is-bad' : b.stress ? 'is-warn' : '';
    const deltaColor = b.delta <= -0.08 ? '#be123c' : b.delta < 0 ? '#b45309' : b.delta > 0 ? '#047857' : '#5f7067';
    const ndviBg = b.ndvi >= 0.78 ? '#1b4332' : b.ndvi >= 0.70 ? '#40916c' : b.ndvi >= 0.62 ? '#d97706' : '#be123c';
    return `<tr class="${rowCls}">
      <td class="mono" style="font-weight:700;color:#14201a;">${esc(b.code)}</td>
      <td class="trunc"><strong>${esc(b.div)}</strong> <span style="color:#5f7067;font-size:9.5px;">${b.group === 'Plasma' ? '· Plasma' : ''}</span></td>
      <td class="num mono">${fmtNum(b.areaHa)}</td>
      <td class="num mono" style="color:#5f7067;">${b.tt}</td>
      <td>
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="width:8px;height:8px;border-radius:2px;background:${ndviBg};display:inline-block;flex-shrink:0;"></span>
          <span class="mono" style="font-weight:700;">${fmtNdvi(b.ndvi)}</span>
        </div>
      </td>
      <td class="num mono" style="font-weight:700;color:${deltaColor};">${fmtDelta(b.delta)}</td>
      <td class="num mono" style="${b.rain7d >= 70 ? 'color:#be123c;font-weight:700;' : ''}">${b.rain7d} mm</td>
      <td class="num mono"><strong>${fmtNum(b.est30dTon)}</strong></td>
      <td class="num mono">${b.prodTha.toFixed(1).replace('.', ',')}</td>
      <td>${badge(b.status, b.tone)}</td>
      <td class="trunc" style="color:#3e4e46;font-size:10px;"><span style="color:#047857;font-weight:700;">EUDR OK</span> · ${esc(b.meta)}</td>
    </tr>`;
  }).join('');

  // 90-day NDVI trajectory for BLK-B04
  const b04Chart = svgMultiLineChart({
    width: 416,
    height: 158,
    xLabels: ['25 Agu', '14 Sep', '04 Okt', '24 Okt', '04 Nov', '18 Nov'],
    series: [
      { label: 'NDVI BLK-B04', values: [0.71, 0.70, 0.69, 0.68, 0.64, 0.54], color: '#be123c', area: true, dots: true, width: 2.0 },
      { label: 'Baseline Divisi II', values: [0.77, 0.77, 0.78, 0.77, 0.77, 0.77], color: '#2d6a4f', dashed: true, width: 1.4 },
    ],
    yMin: 0.42,
    yMax: 0.86,
    yTicks: 4,
    yFormat: (v) => v.toFixed(2).replace('.', ','),
    threshold: { value: 0.62, label: 'Ambang Stres 0,62', color: '#b45309' },
    annotations: [
      { index: 5, seriesIdx: 0, label: '0,54 (-0,14 / 14h)', color: '#be123c', dy: 10 },
    ],
  });

  const workspaceHtml = `<div class="tp-filterbar">
    <div class="tp-chip-row">
      <span style="font-size:10.5px;font-weight:700;color:#14201a;margin-right:4px;">Filter Matriks:</span>
      <span class="tp-chip is-on">Semua Blok (18)</span>
      <span class="tp-chip">Divisi Inti (14)</span>
      <span class="tp-chip">Plasma Kemitraan (4)</span>
      <span class="tp-chip is-warn">${ic('alert', 11, '#b45309')} Anomali Stres (3)</span>
      <span class="tp-chip" style="background:#fff1f2;border-color:#fecdd3;color:#be123c;">Alih Rute Hujan (1)</span>
      <span class="tp-chip">Pass Sentinel-2: 18 Nov 2026</span>
    </div>
    <div class="tp-chip-row">
      <span class="mono" style="font-size:10px;color:#3e4e46;">Total Terfilter: <strong>14.200 Ha</strong> · <strong>18.450 ton</strong></span>
      <span class="e-btn">${ic('filter', 11, '#3e4e46')} Kolom</span>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 446px;gap:10px;flex:1;min-height:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('layers', 13, '#2d6a4f')} <span>Ledger Operasional 18 Blok Kebun Katingan — Sentinel-2 NDVI, BMKG &amp; Proyeksi 30 Hari</span></div>
        <span class="e-panel-sub">Klik baris untuk inspeksi spektral &amp; SPK agronomi</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <table class="e-table tp-table-lg">
          <thead>
            <tr>
              <th style="width:74px;">Kode Blok</th>
              <th style="width:142px;">Divisi / Plasma</th>
              <th class="num" style="width:74px;">Luas (Ha)</th>
              <th class="num" style="width:48px;">TT</th>
              <th style="width:76px;">NDVI</th>
              <th class="num" style="width:62px;">Delta 14h</th>
              <th class="num" style="width:72px;">Hujan 7h</th>
              <th class="num" style="width:82px;">Est. 30h (t)</th>
              <th class="num" style="width:74px;">t/ha/thn</th>
              <th style="width:102px;">Status</th>
              <th>EUDR &amp; Catatan Lapangan</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr>
              <td>18 BLOK</td>
              <td>4 Divisi + 2 Koperasi</td>
              <td class="num mono">${fmtNum(TOTAL_AREA_HA)}</td>
              <td class="num mono">2015</td>
              <td class="mono">${WEIGHTED_NDVI.toFixed(2).replace('.', ',')}</td>
              <td class="num mono">-0,01</td>
              <td class="num mono">45 mm</td>
              <td class="num mono">${fmtNum(TOTAL_EST_30D)}</td>
              <td class="num mono">19,3</td>
              <td>3 Stres · 1 Rute</td>
              <td>100% Poligon Lolos EUDR (0 Deforestasi)</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:7px 11px;background:#f8f9f7;border-top:1px solid #d6dbd5;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#3e4e46;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#1b4332;display:inline-block;"></span> Optimal (&ge;0,78)</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#40916c;display:inline-block;"></span> Normal (0,70–0,77)</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#d97706;display:inline-block;"></span> Waspada (0,62–0,69)</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#be123c;display:inline-block;"></span> Anomali Stres (&lt;0,62)</span>
          </div>
          <span class="mono" style="color:#1b4332;font-weight:700;">Baris Aktif: BLK-B04 (Divisi II · 245 Ha)</span>
        </div>
      </div>
    </section>

    <section class="e-panel">
      <div class="e-panel-head" style="background:#fffdf7;border-bottom-color:#fde68a;">
        <div class="e-panel-title">${ic('alert', 13, '#b45309')} <span>Inspektor Blok: BLK-B04 · Divisi II</span></div>
        ${badge('Inspeksi Prioritas', 'warn')}
      </div>
      <div class="e-panel-body" style="display:flex;flex-direction:column;gap:9px;justify-content:space-between;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:7px;border-bottom:1px solid #e6ebe6;">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#14201a;">Divisi II — Blok B04 (245 Ha · TT 2012)</div>
            <div class="mono" style="font-size:9.6px;color:#5f7067;">HGU-KTG-04/B04 · 33.810 pokok · Mineral Podsolik</div>
          </div>
          ${badge('16,1 t/ha', 'warn')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#9f1239;font-weight:700;">NDVI 18 Nov</div>
            <div class="mono" style="font-size:13.5px;font-weight:700;color:#be123c;">0,54</div>
            <div class="mono" style="font-size:9px;color:#be123c;">Δ -0,14</div>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#92400e;font-weight:700;">NDWI Air</div>
            <div class="mono" style="font-size:13.5px;font-weight:700;color:#b45309;">-0,08</div>
            <div class="mono" style="font-size:9px;color:#b45309;">Defisit</div>
          </div>
          <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#5f7067;font-weight:700;">Hujan 7h</div>
            <div class="mono" style="font-size:13.5px;font-weight:700;color:#14201a;">19 mm</div>
            <div class="mono" style="font-size:9px;color:#5f7067;">Suhu 33,8°C</div>
          </div>
          <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 7px;">
            <div style="font-size:9px;color:#5f7067;font-weight:700;">Est. 30 Hari</div>
            <div class="mono" style="font-size:13.5px;font-weight:700;color:#14201a;">275 t</div>
            <div class="mono" style="font-size:9px;color:#be123c;">-48 t vs target</div>
          </div>
        </div>

        <div style="border:1px solid #e2e7e1;border-radius:3px;padding:6px 6px 2px;background:#ffffff;">
          <div style="font-size:10px;font-weight:700;color:#3e4e46;margin-bottom:3px;padding:0 4px;display:flex;justify-content:space-between;">
            <span>Trajektori NDVI 90 Hari (Sentinel-2 L2A 10m)</span>
            <span class="mono" style="color:#be123c;">Anomali Terdeteksi 04 Nov</span>
          </div>
          ${b04Chart}
        </div>

        <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:8px 9px;">
          <div style="font-size:10.2px;font-weight:700;color:#14201a;margin-bottom:5px;display:flex;align-items:center;justify-content:space-between;">
            <span>Diagnosis Gabungan AI &amp; Pin Lapangan</span>
            ${badge('Pin #084 & #080', 'info')}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:10px;color:#3e4e46;">
            <div style="display:flex;justify-content:space-between;"><span>1. Infeksi Busuk Pangkal Batang (<em>Ganoderma boninense</em>)</span><strong class="mono" style="color:#be123c;">68%</strong></div>
            <div style="height:5px;background:#e2e8f0;border-radius:2px;overflow:hidden;"><div style="width:68%;height:100%;background:#be123c;"></div></div>
            <div style="display:flex;justify-content:space-between;margin-top:2px;"><span>2. Stres Kekeringan Mikro &amp; Defisit KCl</span><strong class="mono" style="color:#b45309;">32%</strong></div>
            <div style="height:5px;background:#e2e8f0;border-radius:2px;overflow:hidden;"><div style="width:32%;height:100%;background:#d97706;"></div></div>
          </div>
        </div>

        <div style="background:#ffffff;border:1px solid #d6dbd5;border-radius:3px;padding:8px 9px;">
          <div style="font-size:10.2px;font-weight:700;color:#14201a;margin-bottom:5px;">Rekomendasi Intervensi Agronomi (SPK #DOA-AG-1139)</div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:10px;color:#3e4e46;">
            <div style="display:flex;gap:6px;align-items:flex-start;">${ic('check', 11, '#2d6a4f')} <span>Sensus 100% pokok terinfeksi di Sub-Blok B04-Barat (estimasi 412 pokok terdampak).</span></div>
            <div style="display:flex;gap:6px;align-items:flex-start;">${ic('check', 11, '#2d6a4f')} <span>Buat parit isolasi kedalaman 1,5 m &amp; aplikasi agen hayati <em>Trichoderma</em> sp.</span></div>
            <div style="display:flex;gap:6px;align-items:flex-start;">${ic('check', 11, '#2d6a4f')} <span>Tambahan pupuk KCl 2,5 kg/pokok untuk pemulihan tajuk 60 hari (+32 t/bln).</span></div>
          </div>
        </div>

        <div style="background:#f2f9f5;border:1px solid #a3cbb7;border-radius:3px;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;">
          <div>
            <div style="font-weight:700;color:#1b4332;">Otorisasi SPK Agronomi Disetujui</div>
            <div class="mono" style="color:#3e4e46;">Maker: R. Gunawan · Checker: Dr. S. Lestari</div>
          </div>
          <span class="e-btn e-btn-primary">${ic('eye', 11, '#ffffff')} Buka Pin Foto</span>
        </div>
      </div>
    </section>
  </div>`;

  return renderFioriShell({
    activeTab: 'p2',
    title: meta.pages[1].title,
    workspaceHtml,
  });
}

// ============================================================================
// PAGE 3: PETA SPASIAL NDVI SENTINEL-2, RADAR BMKG & ALIH RUTE EVAKUASI
// ============================================================================
function renderEstateGisMapSvg() {
  // High-precision vector GIS choropleth map of Kebun Katingan (14.200 Ha)
  // Color helper by NDVI
  const ndviFill = (v, reroute) => {
    if (reroute) return '#d4a373';
    if (v >= 0.80) return '#1b4332';
    if (v >= 0.77) return '#2d6a4f';
    if (v >= 0.74) return '#40916c';
    if (v >= 0.65) return '#74c69d';
    if (v >= 0.58) return '#e9c46a';
    return '#e76f51';
  };

  // 18 interlocking organic estate parcels (coordinates inside 900x710)
  const parcels = [
    // Divisi I (North)
    { code: 'BLK-A04', ndvi: 0.82, pts: '95,78 265,68 282,162 115,176', cx: 188, cy: 122, txt: '#ffffff' },
    { code: 'BLK-A08', ndvi: 0.80, pts: '265,68 460,64 472,160 282,162', cx: 368, cy: 115, txt: '#ffffff' },
    { code: 'BLK-A11', ndvi: 0.79, pts: '460,64 645,74 632,170 472,160', cx: 552, cy: 118, txt: '#ffffff' },
    { code: 'BLK-A12', ndvi: 0.81, pts: '645,74 792,92 778,184 632,170', cx: 712, cy: 132, txt: '#ffffff' },

    // Divisi II (Central West/Mid)
    { code: 'BLK-B01', ndvi: 0.78, pts: '115,176 282,162 296,288 108,302', cx: 198, cy: 235, txt: '#ffffff' },
    { code: 'BLK-B04', ndvi: 0.54, pts: '282,162 410,161 422,276 296,288', cx: 352, cy: 224, txt: '#14201a', alert: 'STRES -0,14' },
    { code: 'BLK-B07', ndvi: 0.59, pts: '410,161 568,165 556,282 422,276', cx: 488, cy: 222, txt: '#14201a', alert: 'STRES -0,11' },
    { code: 'BLK-B10', ndvi: 0.77, pts: '568,165 778,184 762,298 556,282', cx: 668, cy: 234, txt: '#ffffff' },

    // Divisi III (River Corridor — Sungai Katingan cuts east-west-south)
    { code: 'BLK-C02', ndvi: 0.76, pts: '108,302 296,288 308,422 122,438', cx: 208, cy: 364, txt: '#ffffff' },
    { code: 'BLK-C05', ndvi: 0.61, pts: '296,288 456,278 468,408 308,422', cx: 382, cy: 350, txt: '#14201a', alert: 'STRES -0,09' },
    { code: 'BLK-C07', ndvi: 0.75, pts: '456,278 618,288 608,418 468,408', cx: 536, cy: 348, txt: '#ffffff' },
    { code: 'BLK-C09', ndvi: 0.69, pts: '618,288 796,304 784,432 608,418', cx: 702, cy: 336, txt: '#14201a', reroute: true, alert: 'BANJIR 85mm' },

    // Divisi IV (South Peat)
    { code: 'BLK-E01', ndvi: 0.79, pts: '122,438 345,420 356,565 142,578', cx: 242, cy: 500, txt: '#ffffff' },
    { code: 'BLK-E04', ndvi: 0.77, pts: '345,420 538,414 542,562 356,565', cx: 446, cy: 492, txt: '#ffffff' },

    // Plasma Koperasi Makmur (South-East SHM Cluster)
    { code: 'BLK-D02', ndvi: 0.78, pts: '538,414 662,422 658,524 542,520', cx: 600, cy: 472, txt: '#ffffff', plasma: true },
    { code: 'BLK-D05', ndvi: 0.76, pts: '662,422 818,438 806,566 658,562', cx: 736, cy: 498, txt: '#ffffff', plasma: true },

    // Plasma Koperasi Harapan Jaya (Far South SHM Cluster)
    { code: 'BLK-P01', ndvi: 0.77, pts: '208,574 485,564 492,654 224,660', cx: 352, cy: 612, txt: '#ffffff', plasma: true },
    { code: 'BLK-P04', ndvi: 0.75, pts: '485,564 762,564 748,656 492,654', cx: 622, cy: 612, txt: '#ffffff', plasma: true },
  ];

  // Grid lines (Lat/Lon graticule)
  let graticule = '';
  [140, 320, 500, 680, 840].forEach((x, idx) => {
    const lon = ['113°18\'E', '113°20\'E', '113°22\'E', '113°24\'E', '113°26\'E'][idx];
    graticule += `<line x1="${x}" y1="24" x2="${x}" y2="690" stroke="#cfd8cf" stroke-width="0.7" stroke-dasharray="3,4" />`;
    graticule += `<text x="${x}" y="16" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#5f7067">${lon}</text>`;
  });
  [90, 230, 370, 510, 645].forEach((y, idx) => {
    const lat = ['1°52\'S', '1°54\'S', '1°56\'S', '1°58\'S', '2°00\'S'][idx];
    graticule += `<line x1="56" y1="${y}" x2="884" y2="${y}" stroke="#cfd8cf" stroke-width="0.7" stroke-dasharray="3,4" />`;
    graticule += `<text x="50" y="${y + 3}" text-anchor="end" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="#5f7067">${lat}</text>`;
  });

  // Parcel Polygons
  const parcelsSvg = parcels
    .map((p) => {
      const fill = ndviFill(p.ndvi, p.reroute);
      const stroke = p.plasma ? '#0284c7' : p.reroute ? '#be123c' : '#ffffff';
      const strokeW = p.plasma ? '2' : p.reroute ? '2.2' : '1.4';
      const dash = p.plasma ? 'stroke-dasharray="5,3"' : '';
      return `<g>
        <polygon points="${p.pts}" fill="${fill}" fill-opacity="0.88" stroke="${stroke}" stroke-width="${strokeW}" ${dash} />
        ${p.reroute ? `<polygon points="${p.pts}" fill="url(#floodHatch)" />` : ''}
        <text x="${p.cx}" y="${p.cy - 4}" text-anchor="middle" font-size="10.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="${p.txt}">${p.code}</text>
        <text x="${p.cx}" y="${p.cy + 10}" text-anchor="middle" font-size="9.2" font-family="ui-monospace,Consolas,monospace" fill="${p.txt}" fill-opacity="0.92">NDVI ${fmtNdvi(p.ndvi)}</text>
        ${p.alert ? `<rect x="${p.cx - 44}" y="${p.cy + 16}" width="88" height="14" rx="2" fill="${p.reroute ? '#be123c' : '#92400e'}" /><text x="${p.cx}" y="${p.cy + 26}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">${p.alert}</text>` : ''}
      </g>`;
    })
    .join('');

  // River Sungai Katingan + Flood Zone + Haul Roads + Detour Route + PKS Mill + Field Pins
  const infraSvg = `
    <!-- Sungai Katingan -->
    <path d="M 66,466 C 190,446 310,432 458,415 C 578,402 686,408 864,394" fill="none" stroke="#0284c7" stroke-width="8" stroke-linecap="round" stroke-opacity="0.72" />
    <path d="M 66,466 C 190,446 310,432 458,415 C 578,402 686,408 864,394" fill="none" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" />
    <text x="152" y="453" font-size="8.8" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="#0369a1" stroke="#ffffff" stroke-width="2.6" paint-order="stroke" transform="rotate(-5 152 453)">Sungai Katingan</text>

    <!-- Main Haul Roads (Solid White-Cased Slate) -->
    <polyline points="282,66 296,288 308,422 356,565" fill="none" stroke="#1e293b" stroke-width="3.2" />
    <polyline points="282,66 296,288 308,422 356,565" fill="none" stroke="#f8fafc" stroke-width="1.3" />
    <polyline points="112,296 456,280 618,288 790,302" fill="none" stroke="#1e293b" stroke-width="3.2" />
    <polyline points="112,296 456,280 618,288 790,302" fill="none" stroke="#f8fafc" stroke-width="1.3" />

    <!-- Blocked Segment at Jembatan #2 -->
    <line x1="668" y1="376" x2="668" y2="412" stroke="#be123c" stroke-width="3.5" stroke-dasharray="3,2" />
    <g transform="translate(668,408)">
      <circle r="9.5" fill="#be123c" stroke="#ffffff" stroke-width="2" />
      <text x="0" y="3.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#ffffff">X</text>
      <rect x="-52" y="12" width="104" height="15" rx="2" fill="#881337" />
      <text x="0" y="22.5" text-anchor="middle" font-size="8.3" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">JEMB #2 DITUTUP</text>
    </g>

    <!-- Active Detour Route via Koridor Timur / Jembatan #4 -->
    <polyline points="712,340 832,334 832,456 592,450 472,414" fill="none" stroke="#d97706" stroke-width="3.4" stroke-dasharray="7,4" />
    <g transform="translate(832,400)">
      <rect x="-46" y="-9" width="92" height="16" rx="2" fill="#b45309" stroke="#ffffff" stroke-width="1" />
      <text x="0" y="2" text-anchor="middle" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">JEMB #4 (+4,8 km)</text>
    </g>

    <!-- PKS Katingan Mill Complex -->
    <g transform="translate(464,412)">
      <rect x="-13" y="-13" width="26" height="26" rx="4" fill="#14201a" stroke="#ffffff" stroke-width="2" />
      <text x="0" y="3.5" text-anchor="middle" font-size="8.5" font-weight="800" font-family="ui-monospace,Consolas,monospace" fill="#74c69d">PKS</text>
      <rect x="-56" y="-32" width="112" height="15" rx="2" fill="#14201a" />
      <text x="0" y="-21.5" text-anchor="middle" font-size="8.5" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">PKS KATINGAN (700 t/h)</text>
    </g>

    <!-- Field Agronomist GPS Pins -->
    <g transform="translate(334,200)">
      <circle r="6" fill="#be123c" stroke="#ffffff" stroke-width="1.8" />
      <text x="9" y="3" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#14201a">PIN-084</text>
    </g>
    <g transform="translate(468,196)">
      <circle r="5.5" fill="#d97706" stroke="#ffffff" stroke-width="1.8" />
      <text x="8" y="3" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#14201a">PIN-082</text>
    </g>
    <g transform="translate(362,324)">
      <circle r="5.5" fill="#d97706" stroke="#ffffff" stroke-width="1.8" />
      <text x="8" y="3" font-size="8.4" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#14201a">PIN-081</text>
    </g>

    <!-- North Arrow & Scale Bar -->
    <g transform="translate(848,54)">
      <circle r="15" fill="#ffffff" stroke="#bcc5bc" stroke-width="1" />
      <polygon points="0,-10 4,5 0,2 -4,5" fill="#1b4332" />
      <text x="0" y="-12" text-anchor="middle" font-size="8" font-weight="800" fill="#14201a">U</text>
    </g>
    <g transform="translate(72,672)">
      <rect x="0" y="0" width="120" height="6" fill="#ffffff" stroke="#3e4e46" stroke-width="1" />
      <rect x="0" y="0" width="40" height="6" fill="#14201a" />
      <rect x="80" y="0" width="40" height="6" fill="#14201a" />
      <text x="0" y="-4" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#3e4e46">0</text>
      <text x="60" y="-4" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#3e4e46">2 km</text>
      <text x="120" y="-4" text-anchor="middle" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#3e4e46">4 km</text>
      <text x="142" y="6" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="#3e4e46">Skala 1:45.000</text>
    </g>
  `;

  return `<svg viewBox="0 0 900 695" width="100%" height="695" style="display:block;background:#eef3ec;">
    <defs>
      <pattern id="floodHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#0369a1" stroke-width="2.2" stroke-opacity="0.55" />
      </pattern>
    </defs>
    <!-- Outer Forest Buffer (KLHK Baseline 2020 Non-Plantation) -->
    <rect x="0" y="0" width="900" height="695" fill="#e7efe5" />
    ${graticule}
    <!-- Outer HGU Perimeter -->
    <polygon points="88,70 800,84 824,442 768,664 214,668 112,444 98,298" fill="none" stroke="#1b4332" stroke-width="1.6" stroke-dasharray="6,4" />
    ${parcelsSvg}
    ${infraSvg}
  </svg>`;
}

function renderPage3() {
  const rainBarSvg = svgStackedBarChart({
    width: 332,
    height: 168,
    categories: ['12N', '13N', '14N', '15N', '16N', '17N', '18N'],
    series: [
      { label: 'Div I–II (mm)', values: [8, 12, 6, 14, 18, 24, 19], color: '#40916c' },
      { label: 'Div III Sungai (mm)', values: [14, 18, 12, 26, 38, 62, 85], color: '#0369a1' },
    ],
    yMax: 120,
    yFormat: (v) => `${Math.round(v)}`,
  });

  const rerouteRowsHtml = REROUTE_DISPATCH.map(
    (r) => `<tr>
      <td class="mono" style="font-weight:700;">${esc(r.unit)}</td>
      <td class="trunc">${esc(r.from)}</td>
      <td class="num mono">${esc(r.eta)}</td>
      <td>${badge(r.status, r.tone)}</td>
    </tr>`
  ).join('');

  const layers = [
    { name: 'Sentinel-2 L2A NDVI (Band 8/4 · 10m)', meta: 'Pass 18 Nov 09:42 · Cloud 4,2%', on: true, dot: '#2d6a4f' },
    { name: 'Batas Poligon HGU Inti (4 Poligon)', meta: 'PostGIS EPSG:4326 · Valid', on: true, dot: '#1b4332' },
    { name: 'Poligon Plasma SHM/STDB (148 Poligon)', meta: 'Baseline Hutan 2020: 0 Overlap', on: true, dot: '#0284c7' },
    { name: 'Radar Curah Hujan BMKG & Genangan', meta: 'AWS Katingan · 85 mm / 24j', on: true, dot: '#0369a1' },
    { name: 'Koridor Evakuasi & Jembatan Angkut', meta: '1 Jembatan Ditutup · 1 Detour', on: true, dot: '#d97706' },
    { name: 'Pin Inspeksi Agronom Offline (12 Pin)', meta: 'RTK-GNSS ±0,5 m · SQLite Sync', on: true, dot: '#be123c' },
    { name: 'Kontur Elevasi & Piezometer Gambut', meta: 'DEMNAS 8m · Divisi IV TMA', on: false, dot: '#64748b' },
  ];

  const workspaceHtml = `<div class="tp-filterbar">
    <div class="tp-chip-row">
      <span style="font-size:10.5px;font-weight:700;color:#14201a;">Mode Spasial:</span>
      <span class="tp-chip is-on">Peta Panas NDVI Tajuk</span>
      <span class="tp-chip">Indeks Air NDWI</span>
      <span class="tp-chip">Radar Hujan BMKG</span>
      <span class="tp-chip">Verifikasi EUDR 2020</span>
      <span class="tp-chip is-warn">Koridor Alih Rute (BLK-C09)</span>
    </div>
    <div class="tp-chip-row">
      <span class="mono" style="font-size:9.8px;color:#3e4e46;">Scene: S2A_MSIL2A_20261118T024211 · Rasterio COG Tile 38 ms</span>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:296px 1fr 354px;gap:10px;flex:1;min-height:0;">
    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1.15;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('layers', 13, '#2d6a4f')} <span>Tumpukan Layer GIS (PostGIS)</span></div>
          <span class="e-panel-sub">6/7 Aktif</span>
        </div>
        <div class="e-panel-body-flush" style="padding:4px 0;">
          ${layers
            .map(
              (l) => `<div class="tp-layer-row">
                <div style="display:flex;align-items:flex-start;gap:7px;min-width:0;">
                  <span style="width:9px;height:9px;border-radius:2px;background:${l.dot};margin-top:3px;flex-shrink:0;"></span>
                  <div style="min-width:0;">
                    <div style="font-size:10.4px;font-weight:700;color:#14201a;" class="trunc">${esc(l.name)}</div>
                    <div class="mono" style="font-size:9px;color:#5f7067;">${esc(l.meta)}</div>
                  </div>
                </div>
                <span class="tp-toggle ${l.on ? 'on' : ''}"></span>
              </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="e-panel" style="flex:0.95;">
        <div class="e-panel-head">
          <div class="e-panel-title">${customIcon('satellite', 13, '#2d6a4f')} <span>Skala NDVI &amp; Pipeline Raster</span></div>
          ${badge('10 m/px', 'accent')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div>
            <div style="font-size:9.8px;font-weight:700;color:#3e4e46;margin-bottom:4px;">Klasifikasi Kesehatan Tajuk NDVI</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);height:12px;border-radius:2px;overflow:hidden;border:1px solid #bcc5bc;">
              <div style="background:#e76f51;"></div>
              <div style="background:#e9c46a;"></div>
              <div style="background:#74c69d;"></div>
              <div style="background:#40916c;"></div>
              <div style="background:#1b4332;"></div>
            </div>
            <div class="mono" style="display:flex;justify-content:space-between;font-size:9px;color:#5f7067;margin-top:3px;">
              <span>&lt;0,58 Stres</span><span>0,65</span><span>0,74</span><span>&ge;0,80 Puncak</span>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;">Cloud Mask (SCL)</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#047857;">4,2% Bersih</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;">PostGIS ST_Intersects</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#14201a;">14,2 ms</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;">Rasterio Zonal Stats</div>
              <div class="mono" style="font-size:11.2px;font-weight:700;color:#14201a;">18 blk · 1,8 dtk</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;">Pass Berikutnya</div>
              <div class="mono" style="font-size:12px;font-weight:700;color:#1b4332;">23 Nov (5h)</div>
            </div>
          </div>
          <div style="font-size:9.6px;color:#3e4e46;background:#f2f9f5;border:1px solid #a3cbb7;border-radius:3px;padding:6px 8px;">
            <strong>Garis Putus Biru:</strong> Klaster 148 poligon plasma SHM/STDB (Kop. Makmur &amp; Kop. Harapan) lulus baseline pra-2020.
          </div>
        </div>
      </section>
    </div>

    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${customIcon('compass', 13, '#2d6a4f')} <span>Peta Spasial Kebun Katingan (14.200 Ha) — Choropleth NDVI, Genangan &amp; Koridor PKS</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${badge('WGS 84 / UTM 49S', 'neutral')}
          ${badge('18 Poligon Blok', 'accent')}
        </div>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div style="flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#e7efe5;">
          ${renderEstateGisMapSvg()}
        </div>
        <div style="height:36px;padding:0 11px;background:#ffffff;border-top:1px solid #d6dbd5;display:flex;align-items:center;justify-content:space-between;font-size:9.8px;color:#3e4e46;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:3px;background:#0284c7;display:inline-block;"></span> Sungai Katingan</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:3px;background:#d97706;display:inline-block;"></span> Alih Rute Jemb. #4</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:999px;background:#be123c;display:inline-block;"></span> Pin Stres/Banjir</span>
          </div>
          <span class="mono">Kursor: -1.9482°S, 113.3641°E · Elevasi 38 m dpl</span>
        </div>
      </div>
    </section>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="height:348px;flex-shrink:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${customIcon('cloudRain', 13, '#0369a1')} <span>Hidrologi &amp; Prakiraan BMKG (7h)</span></div>
          ${badge('AWS Katingan', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div>${rainBarSvg}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;padding:5px 6px;">
              <div style="font-size:9px;color:#0369a1;font-weight:700;">Hujan 24j Div III</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#0c4a6e;">85 mm</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 6px;">
              <div style="font-size:9px;color:#5f7067;font-weight:700;">Prakiraan 48j</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#14201a;">32 mm</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 6px;">
              <div style="font-size:9px;color:#5f7067;font-weight:700;">Kelembapan</div>
              <div class="mono" style="font-size:12.5px;font-weight:700;color:#14201a;">86% RH</div>
            </div>
          </div>
          <div style="font-size:9.6px;color:#0c4a6e;background:#f0f9ff;border:1px solid #bae6fd;border-radius:3px;padding:6px 8px;">
            <strong>Peringatan BMKG Kalteng:</strong> Potensi hujan intensitas sedang (25–40 mm) sore ini pukul 15:00–19:00 WIB di DAS Katingan.
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:1;min-height:0;">
        <div class="e-panel-head" style="background:#fff9fa;border-bottom-color:#fecdd3;">
          <div class="e-panel-title">${customIcon('truck', 13, '#be123c')} <span>Alih Rute Evakuasi · BLK-C09</span></div>
          ${badge('Jembatan #2', 'bad')}
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <div style="padding:8px 10px;display:flex;flex-direction:column;gap:6px;">
            <div class="tp-alert-item tp-alert-bad">
              <div>
                <div style="font-size:10.4px;font-weight:700;color:#881337;">Jembatan #2 Ditutup — Genangan 62 cm</div>
                <div style="font-size:9.5px;color:#5f7067;">420 Ha (490 ton/30h) dialihkan via Koridor Timur (Jembatan #4). Dampak restan: 0 ton hilang.</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 7px;">
                <div style="font-size:9px;color:#5f7067;">Jarak Tambahan</div>
                <div class="mono" style="font-size:12px;font-weight:700;color:#b45309;">+4,8 km / rit</div>
              </div>
              <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:5px 7px;">
                <div style="font-size:9px;color:#5f7067;">Armada Dialihkan</div>
                <div class="mono" style="font-size:12px;font-weight:700;color:#14201a;">14 Dump Truck</div>
              </div>
            </div>
          </div>
          <div style="flex:1;border-top:1px solid #d6dbd5;">
            <table class="e-table tp-table-lg">
              <thead>
                <tr>
                  <th style="width:76px;">Unit Truk</th>
                  <th>Asal TPH</th>
                  <th class="num" style="width:46px;">ETA</th>
                  <th style="width:78px;">Status</th>
                </tr>
              </thead>
              <tbody>${rerouteRowsHtml}</tbody>
            </table>
          </div>
          <div style="padding:7px 10px;background:#f8f9f7;border-top:1px solid #d6dbd5;display:flex;align-items:center;justify-content:space-between;font-size:9.6px;">
            <span class="mono" style="color:#3e4e46;">DOA-RT-2026-1141 · Aktif</span>
            <span class="e-btn e-btn-primary">Kirim Rute ke Supir</span>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderFioriShell({
    activeTab: 'p3',
    title: meta.pages[2].title,
    workspaceHtml,
    primaryLabel: 'Sinkron Radar BMKG',
  });
}

// ============================================================================
// PAGE 4: KEPATUHAN POLIGON EUDR PASCA-2020 & OTORISASI DOA EKSPOR
// ============================================================================
function renderPage4() {
  const kpis = [
    { label: 'Poligon Plasma Teruji', val: `${PLASMA_POLYGONS} poligon`, sub: 'Kop. Makmur (86) · Kop. Harapan (62)', tone: 'ok', badgeTxt: '100% Valid' },
    { label: 'Poligon HGU Inti', val: `${HGU_POLYGONS} poligon`, sub: 'Divisi I – IV · 11.820 Ha', tone: 'ok', badgeTxt: 'SK BPN Sah' },
    { label: 'Overlap Deforestasi >2020', val: '0,00 Ha', sub: 'Baseline JRC Forest 2020 & KLHK', tone: 'ok', badgeTxt: '0 Pelanggaran' },
    { label: 'Legalitas SHM / STDB', val: '100% lengkap', sub: '148 STDB terverifikasi Dinas Perkebunan', tone: 'ok', badgeTxt: 'ISPO Ready' },
    { label: 'Lot Ekspor CPO Aktif', val: '4.200 ton', sub: 'EXP-EU-2026-114 · Rotterdam (Cargill)', tone: 'info', badgeTxt: 'Tunggu TTE' },
  ];

  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    ${kpis
      .map(
        (k) => `<div class="e-kpi">
          <div class="e-kpi-top"><span class="trunc">${esc(k.label)}</span>${badge(k.badgeTxt, k.tone)}</div>
          <div class="e-kpi-mid"><div class="e-kpi-val">${esc(k.val)}</div></div>
          <div class="e-kpi-foot"><span class="trunc">${esc(k.sub)}</span></div>
        </div>`
      )
      .join('')}
  </section>`;

  const clusterRowsHtml = EUDR_CLUSTERS.map(
    (c) => `<tr class="${c.selected ? 'is-selected' : ''}">
      <td class="mono" style="font-weight:700;color:#1b4332;">${esc(c.id)}</td>
      <td class="trunc"><strong>${esc(c.name)}</strong></td>
      <td>${badge(c.type, c.type === 'Plasma SHM' ? 'info' : 'neutral')}</td>
      <td class="mono" style="font-size:9.8px;color:#3e4e46;">${esc(c.legal)}</td>
      <td class="num mono"><strong>${c.polygons}</strong></td>
      <td class="num mono">${fmtNum(c.areaHa)}</td>
      <td class="num mono" style="color:#047857;font-weight:700;">0,00</td>
      <td class="mono" style="font-size:9.4px;color:#5f7067;">${esc(c.hash)}</td>
      <td>${badge(c.dds, c.tone)}</td>
    </tr>`
  ).join('');

  const doaSigners = [
    { role: '1. GIS Analyst (Maker)', person: 'A. Prasetyo, S.Si', check: 'PostGIS ST_IsValid + ST_Intersects 0,00 Ha', time: '18 Nov 08:15', status: 'Disetujui', tone: 'ok' },
    { role: '2. Kepala Agronomi (Checker)', person: 'Ir. Hendra Wijaya', check: 'Validasi 148 STDB Petani Plasma & HGU', time: '18 Nov 09:02', status: 'Disetujui', tone: 'ok' },
    { role: '3. Sustainability & Legal', person: 'N. Kartika, S.H.', check: 'EUDR Art. 9 + ISPO Permentan 38/2020', time: '18 Nov 09:44', status: 'Disetujui', tone: 'ok' },
    { role: '4. Direktur Operasional', person: 'B. Darmawan, MBA', check: 'Penandatanganan DDS TRACES NT (TTE BSrE)', time: 'SLA 15:00 WIB', status: 'Menunggu TTE', tone: 'warn' },
  ];

  const sqlAndGeojson = `<span class="tp-code-com">-- PostGIS 3.4 Audit: Baseline Tutupan Hutan 31 Des 2020 (JRC + KLHK)</span>
<span class="tp-code-kw">SELECT</span> <span class="tp-code-num">COUNT</span>(p.id) <span class="tp-code-kw">AS</span> total_plasma,
       <span class="tp-code-num">ROUND</span>(<span class="tp-code-num">SUM</span>(ST_Area(ST_Intersection(p.geom, f.geom))/<span class="tp-code-num">10000</span>)::<span class="tp-code-kw">numeric</span>, <span class="tp-code-num">4</span>) <span class="tp-code-kw">AS</span> deforest_ha
<span class="tp-code-kw">FROM</span> eudr_plasma_polygons p <span class="tp-code-kw">LEFT JOIN</span> forest_loss_post2020 f
  <span class="tp-code-kw">ON</span> ST_Intersects(p.geom, f.geom) <span class="tp-code-kw">WHERE</span> p.estate_id = <span class="tp-code-str">'KTG-04'</span>;
<span class="tp-code-com">-- RESULT: total_plasma = 148 | deforest_ha = 0.0000 | violations = 0</span>

{ <span class="tp-code-str">"type"</span>: <span class="tp-code-str">"FeatureCollection"</span>, <span class="tp-code-str">"crs"</span>: <span class="tp-code-str">"EPSG:4326"</span>,
  <span class="tp-code-str">"dds_lot"</span>: <span class="tp-code-str">"EXP-EU-2026-114"</span>, <span class="tp-code-str">"commodity_hs"</span>: <span class="tp-code-str">"1511.10.00 (CPO)"</span>,
  <span class="tp-code-str">"features_count"</span>: <span class="tp-code-num">152</span>, <span class="tp-code-str">"worm_sha256"</span>: <span class="tp-code-str">"4a81f02c9e7b11a4...d891e20a"</span>,
  <span class="tp-code-str">"sample_polygon"</span>: { <span class="tp-code-str">"id"</span>: <span class="tp-code-str">"KT-KM-01/D02-048"</span>, <span class="tp-code-str">"coords"</span>: [[<span class="tp-code-num">113.364112</span>, <span class="tp-code-num">-1.948204</span>]] } }`;

  const workspaceHtml = `${kpiHtml}
  <div style="display:grid;grid-template-columns:1fr 556px;gap:10px;flex:1;min-height:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${ic('shield', 13, '#2d6a4f')} <span>Ledger Verifikasi Poligon EUDR (Regulation EU 2023/1115) — 152 Poligon Kebun &amp; Plasma</span></div>
        <span class="e-panel-sub">Cut-off Date: 31 Des 2020 · PostGIS WORM Audit</span>
      </div>
      <div class="e-panel-body-flush" style="justify-content:space-between;">
        <div style="padding:7px 10px;background:#f8f9f7;border-bottom:1px solid #d6dbd5;display:flex;align-items:center;justify-content:space-between;">
          <div class="tp-chip-row">
            <span class="tp-chip is-on">Semua Klaster (14)</span>
            <span class="tp-chip">HGU Inti (4)</span>
            <span class="tp-chip">Plasma SHM/STDB (10 Klaster · 148 Poligon)</span>
          </div>
          ${badge('0 Pelanggaran Deforestasi', 'ok')}
        </div>
        <table class="e-table">
          <thead>
            <tr>
              <th style="width:86px;">Kode Klaster</th>
              <th>Unit HGU / Kelompok Tani Plasma</th>
              <th style="width:86px;">Kategori</th>
              <th style="width:128px;">Referensi Legal</th>
              <th class="num" style="width:62px;">Poligon</th>
              <th class="num" style="width:74px;">Luas (Ha)</th>
              <th class="num" style="width:70px;">Defor (Ha)</th>
              <th style="width:104px;">WORM Hash</th>
              <th style="width:104px;">Status DDS</th>
            </tr>
          </thead>
          <tbody>${clusterRowsHtml}</tbody>
          <tfoot>
            <tr>
              <td>14 KLASTER</td>
              <td>TOTAL TERVERIFIKASI (4 HGU + 148 PLASMA)</td>
              <td>100% Sah</td>
              <td class="mono">BPN + STDB</td>
              <td class="num mono">${HGU_POLYGONS + PLASMA_POLYGONS}</td>
              <td class="num mono">${fmtNum(EUDR_AREA_HA)}</td>
              <td class="num mono" style="color:#047857;">0,00</td>
              <td class="mono">SHA-256 OK</td>
              <td>100% Bersih</td>
            </tr>
          </tfoot>
        </table>
        <div style="padding:8px 11px;background:#f2f9f5;border-top:1px solid #a3cbb7;display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#1b4332;">
          <span><strong>PostGIS Check:</strong> 148 poligon plasma diuji terhadap baseline tutupan hutan 2020 &rarr; <strong>0 pelanggaran deforestasi</strong> (toleransi topologi 0,0001° WGS 84).</span>
          <span class="mono" style="font-weight:700;">Lot: EXP-EU-2026-114</span>
        </div>
      </div>
    </section>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1.08;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('checkCircle', 13, '#2d6a4f')} <span>Gerbang Otorisasi DoA (Maker-Checker) &amp; DDS TRACES NT</span></div>
          ${badge('DOA-EU-2026-1138', 'info')}
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div class="tp-stepper">
            <div class="tp-step is-done">
              <div class="tp-step-head"><span>1. GIS</span>${ic('check', 11, '#047857')}</div>
              <div class="tp-step-title">PostGIS Check</div>
              <div class="tp-step-meta">152 Poligon OK</div>
            </div>
            <div class="tp-step is-done">
              <div class="tp-step-head"><span>2. AGRONOMI</span>${ic('check', 11, '#047857')}</div>
              <div class="tp-step-title">Audit STDB</div>
              <div class="tp-step-meta">148 Petani OK</div>
            </div>
            <div class="tp-step is-done">
              <div class="tp-step-head"><span>3. LEGAL</span>${ic('check', 11, '#047857')}</div>
              <div class="tp-step-title">EUDR Art. 9</div>
              <div class="tp-step-meta">ISPO/RSPO OK</div>
            </div>
            <div class="tp-step is-curr">
              <div class="tp-step-head"><span>4. TTE BSrE</span>${ic('clock', 11, '#b45309')}</div>
              <div class="tp-step-title">Direktur Ops</div>
              <div class="tp-step-meta">Kirim EU Portal</div>
            </div>
          </div>

          <div style="border:1px solid #d6dbd5;border-radius:3px;overflow:hidden;">
            <table class="e-table">
              <thead>
                <tr>
                  <th style="width:140px;">Otoritas DoA</th>
                  <th style="width:118px;">Pejabat</th>
                  <th>Verifikasi</th>
                  <th style="width:92px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${doaSigners
                  .map(
                    (s) => `<tr>
                      <td style="font-weight:700;font-size:10px;">${esc(s.role)}</td>
                      <td class="trunc" style="font-size:10px;">${esc(s.person)}</td>
                      <td class="trunc" style="font-size:9.6px;color:#3e4e46;">${esc(s.check)}</td>
                      <td>${badge(s.status, s.tone)}</td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;font-weight:600;">Pembeli Ekspor Eropa</div>
              <div style="font-size:10.5px;font-weight:700;color:#14201a;">Cargill Europe BV</div>
              <div class="mono" style="font-size:9px;color:#5f7067;">Port of Rotterdam</div>
            </div>
            <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#5f7067;font-weight:600;">Komoditas &amp; Kode HS</div>
              <div class="mono" style="font-size:10.5px;font-weight:700;color:#14201a;">CPO · 1511.10.00</div>
              <div class="mono" style="font-size:9px;color:#5f7067;">Volume 4.200 ton</div>
            </div>
            <div style="background:#f2f9f5;border:1px solid #a3cbb7;border-radius:3px;padding:6px 7px;">
              <div style="font-size:9px;color:#1b4332;font-weight:600;">Integritas Paket DDS</div>
              <div class="mono" style="font-size:10.5px;font-weight:700;color:#047857;">RFC 7946 Valid</div>
              <div class="mono" style="font-size:9px;color:#1b4332;">6-Digit WGS 84</div>
            </div>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.92;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('code', 13, '#2d6a4f')} <span>Audit Spasial PostGIS 3.4 &amp; Payload GeoJSON EUDR</span></div>
          <span class="e-panel-sub">WORM SHA-256 Sealed</span>
        </div>
        <div class="e-panel-body" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <div class="tp-codebox">${sqlAndGeojson}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span class="mono" style="font-size:9.6px;color:#3e4e46;">Arsip: EUDR_KTG04_EXP114_152poly.geojson (2,48 MB)</span>
            <div style="display:flex;gap:6px;">
              <span class="e-btn">${ic('copy', 11, '#3e4e46')} Salin Hash</span>
              <span class="e-btn e-btn-primary">${ic('download', 11, '#ffffff')} Unduh Paket DDS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderFioriShell({
    activeTab: 'p4',
    title: meta.pages[3].title,
    workspaceHtml,
    primaryLabel: 'Kirim DDS ke TRACES NT',
    secondaryLabel: 'Unduh GeoJSON (152 Poligon)',
  });
}

// ============================================================================
// PAGE 5: INSPEKSI AGRONOM OFFLINE & KALIBRASI MODEL YIELD
// ============================================================================
function renderPalmDiagnosticSvg() {
  // Clean vector botanical diagnostic schematic of oil palm Ganoderma basal stem rot
  return `<svg viewBox="0 0 246 138" width="100%" height="138" style="display:block;background:#16221c;border-radius:3px;">
    <!-- Grid overlay -->
    <line x1="0" y1="35" x2="246" y2="35" stroke="#263c30" stroke-width="0.7" />
    <line x1="0" y1="70" x2="246" y2="70" stroke="#263c30" stroke-width="0.7" />
    <line x1="0" y1="105" x2="246" y2="105" stroke="#263c30" stroke-width="0.7" />
    <line x1="82" y1="0" x2="82" y2="138" stroke="#263c30" stroke-width="0.7" />
    <line x1="164" y1="0" x2="164" y2="138" stroke="#263c30" stroke-width="0.7" />

    <!-- Ground line -->
    <rect x="0" y="114" width="246" height="24" fill="#233128" />
    <line x1="0" y1="114" x2="246" y2="114" stroke="#52796f" stroke-width="1" />

    <!-- Oil Palm Trunk -->
    <path d="M 114,114 L 117,44 L 129,44 L 132,114 Z" fill="#5c4d3c" stroke="#8a755d" stroke-width="1" />
    <!-- Drooping Fronds (Pelepah Sengkleh - Ganoderma Symptom) -->
    <path d="M 123,44 Q 82,22 44,46" fill="none" stroke="#52b788" stroke-width="3" stroke-linecap="round" />
    <path d="M 123,44 Q 164,22 202,46" fill="none" stroke="#52b788" stroke-width="3" stroke-linecap="round" />
    <path d="M 123,46 Q 78,44 56,82" fill="none" stroke="#e9c46a" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 123,46 Q 168,44 190,82" fill="none" stroke="#e9c46a" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 123,48 Q 96,62 84,102" fill="none" stroke="#e76f51" stroke-width="3" stroke-linecap="round" />
    <!-- Unopened Spear Leaves (Daun Tombak) -->
    <line x1="123" y1="44" x2="119" y2="12" stroke="#95d5b2" stroke-width="2.5" stroke-linecap="round" />
    <line x1="123" y1="44" x2="127" y2="14" stroke="#95d5b2" stroke-width="2.5" stroke-linecap="round" />

    <!-- Ganoderma Fruiting Body at Basal Stem -->
    <ellipse cx="112" cy="108" rx="9" ry="4" fill="#d97706" stroke="#fef3c7" stroke-width="1" />
    <ellipse cx="133" cy="110" rx="8" ry="3.5" fill="#d97706" stroke="#fef3c7" stroke-width="1" />

    <!-- AI Detection Bounding Boxes -->
    <rect x="46" y="42" width="154" height="58" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-dasharray="4,2" />
    <rect x="46" y="30" width="112" height="12" fill="#b45309" />
    <text x="50" y="39" font-size="7.8" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">PELEPAH SENGKLEH 89%</text>

    <rect x="98" y="98" width="50" height="20" fill="none" stroke="#ef4444" stroke-width="1.4" />
    <rect x="150" y="100" width="90" height="12" fill="#be123c" />
    <text x="154" y="109" font-size="7.6" font-weight="700" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">BASIDIOKARPA 92%</text>

    <!-- Watermark Telemetry -->
    <text x="6" y="12" font-size="7.8" font-family="ui-monospace,Consolas,monospace" fill="#95d5b2">CAM-FIELD · BLK-B04 · RTK ±0,4m</text>
    <text x="6" y="131" font-size="7.6" font-family="ui-monospace,Consolas,monospace" fill="#cbd5e1">-1.9482°S 113.3641°E · 18 NOV 2026 10:14 WIB</text>
  </svg>`;
}

function renderPage5() {
  const kpis = [
    { label: 'Pin Inspeksi Agronom (7h)', val: `${FIELD_PINS.length} pin`, sub: 'Tersebar di 10 blok (Inti & Plasma)', tone: 'accent', badgeTxt: 'Ground-Truth' },
    { label: 'Status Sinkronisasi SQLite', val: `${SYNCED_PINS} / ${FIELD_PINS.length}`, sub: `${QUEUED_PINS} paket terenkripsi antre sinyal 4G`, tone: 'warn', badgeTxt: `${QUEUED_PINS} Offline` },
    { label: 'Temuan Hama & Ganoderma', val: '4 kasus', sub: 'BLK-B04 (2), BLK-B07 (1), BLK-C05 (1)', tone: 'bad', badgeTxt: 'SPK Aktif' },
    { label: 'Akurasi Lokasi GNSS RTK', val: '±0,52 m', sub: 'Validasi patok & pokok terinfeksi', tone: 'ok', badgeTxt: 'EPSG:4326' },
    { label: 'Kalibrasi XGBoost Yield', val: 'R² 0,91', sub: 'MAPE turun 4,9% -> 3,4% pasca pin', tone: 'ok', badgeTxt: 'Model v4.2' },
  ];

  const kpiHtml = `<section class="e-kpi-strip" style="grid-template-columns:repeat(5,1fr);">
    ${kpis
      .map(
        (k) => `<div class="e-kpi">
          <div class="e-kpi-top"><span class="trunc">${esc(k.label)}</span>${badge(k.badgeTxt, k.tone)}</div>
          <div class="e-kpi-mid"><div class="e-kpi-val">${esc(k.val)}</div></div>
          <div class="e-kpi-foot"><span class="trunc">${esc(k.sub)}</span></div>
        </div>`
      )
      .join('')}
  </section>`;

  const pinRowsHtml = FIELD_PINS.map(
    (p) => `<tr class="${p.selected ? 'is-selected' : p.sync === 'Antre Offline' ? 'is-warn' : ''}">
      <td class="mono" style="font-weight:700;color:#1b4332;">${esc(p.id)}</td>
      <td class="mono" style="font-weight:700;">${esc(p.block)}</td>
      <td class="trunc">${esc(p.agro)}</td>
      <td class="trunc">${esc(p.symptom)}</td>
      <td>${badge(p.sev, p.sevTone)}</td>
      <td class="num mono">${esc(p.rtk)}</td>
      <td>${badge(p.sync, p.syncTone)}</td>
      <td class="trunc" style="color:#3e4e46;font-size:10px;">${esc(p.action)}</td>
    </tr>`
  ).join('');

  const featureWeights = [
    { name: 'Delta NDVI Sentinel-2 (14h)', pct: 34, color: '#2d6a4f' },
    { name: 'Curah Hujan & VPD BMKG (30h)', pct: 24, color: '#0369a1' },
    { name: 'Umur Tanam & Histori BJR Blok', pct: 18, color: '#40916c' },
    { name: 'Pin Inspeksi Stres Agronom (Offline)', pct: 15, color: '#d97706' },
    { name: 'Indeks Air NDWI & TMA Gambut', pct: 9, color: '#64748b' },
  ];

  const workspaceHtml = `${kpiHtml}
  <div style="display:grid;grid-template-columns:602px 1fr;gap:10px;flex:1;min-height:0;">
    <section class="e-panel">
      <div class="e-panel-head">
        <div class="e-panel-title">${customIcon('smartphone', 13, '#2d6a4f')} <span>Aplikasi Mobile Agronom (Offline-First PWA / Android)</span></div>
        ${badge('Mode Tanpa Sinyal · SQLite', 'warn')}
      </div>
      <div class="e-panel-body" style="display:flex;align-items:center;justify-content:center;gap:14px;background:#ecefe9;">
        <!-- Mobile Frame 1: Field Inspection Pin Capture -->
        <div class="tp-phone">
          <div class="tp-phone-sys">
            <span>10:14 WIB · OFFLINE</span>
            <span>RTK ±0,4m · BAT 84%</span>
          </div>
          <div class="tp-phone-hdr">
            <div>
              <div style="font-size:11.5px;font-weight:800;color:#14201a;">Pin Inspeksi #084</div>
              <div class="mono" style="font-size:9px;color:#5f7067;">BLK-B04 · Divisi II · Baris 18</div>
            </div>
            ${badge('Tinggi', 'bad')}
          </div>
          <div class="tp-phone-body">
            ${renderPalmDiagnosticSvg()}
            <div class="tp-phone-card">
              <div style="font-size:9.2px;font-weight:700;color:#5f7067;margin-bottom:3px;">GEJALA TERIDENTIFIKASI (ON-DEVICE AI)</div>
              <div style="font-size:10.5px;font-weight:700;color:#14201a;">Busuk Pangkal Batang (<em>Ganoderma</em>)</div>
              <div style="font-size:9.5px;color:#3e4e46;margin-top:2px;">3 pelepah bawah sengkleh, 2 daun tombak belum membuka, basidiokarpa aktif di pangkal.</div>
            </div>
            <div class="tp-phone-card" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div>
                <div style="font-size:8.8px;color:#5f7067;">Indeks NDVI Piksel</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#be123c;">0,54 (-0,14)</div>
              </div>
              <div>
                <div style="font-size:8.8px;color:#5f7067;">Kelembapan Tanah</div>
                <div class="mono" style="font-size:11.5px;font-weight:700;color:#b45309;">18% (Kering)</div>
              </div>
              <div>
                <div style="font-size:8.8px;color:#5f7067;">No. Pokok / Jalur</div>
                <div class="mono" style="font-size:10.5px;font-weight:700;color:#14201a;">J18-P042</div>
              </div>
              <div>
                <div style="font-size:8.8px;color:#5f7067;">Skala Risiko</div>
                <div class="mono" style="font-size:10.5px;font-weight:700;color:#be123c;">Stadium 3/4</div>
              </div>
            </div>
            <div class="tp-phone-card" style="background:#fffdf7;border-color:#fde68a;">
              <div style="font-size:9.2px;font-weight:700;color:#92400e;">TINDAKAN LAPANGAN LANGSUNG</div>
              <div style="font-size:9.6px;color:#3e4e46;margin-top:2px;">Tandai pita merah pada pokok, jadwalkan parit isolasi 1,5m &amp; sensus 25 pokok sekitar.</div>
            </div>
            <div class="tp-phone-card">
              <div style="display:flex;justify-content:space-between;font-size:9.4px;">
                <span style="color:#5f7067;">Agronom Pelapor</span>
                <strong>R. Gunawan (NIP 10482)</strong>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:9.4px;margin-top:3px;">
                <span style="color:#5f7067;">Lampiran Foto Geotag</span>
                <span class="mono" style="color:#047857;">3 foto (1,4 MB)</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:9.4px;margin-top:3px;">
                <span style="color:#5f7067;">Status Enkripsi Lokal</span>
                <span class="mono" style="color:#1b4332;">AES-256 SQLite</span>
              </div>
            </div>
          </div>
          <div class="tp-phone-foot">
            <span class="e-btn" style="flex:1;justify-content:center;">+ Foto Baru</span>
            <span class="e-btn e-btn-primary" style="flex:1.2;justify-content:center;">Simpan Pin Offline</span>
          </div>
        </div>

        <!-- Mobile Frame 2: Offline Queue & MBTiles Sync Manager -->
        <div class="tp-phone">
          <div class="tp-phone-sys">
            <span>10:16 WIB · NO-4G</span>
            <span>CACHE 42,6 MB</span>
          </div>
          <div class="tp-phone-hdr">
            <div>
              <div style="font-size:11.5px;font-weight:800;color:#14201a;">Antrean Sinkronisasi</div>
              <div class="mono" style="font-size:9px;color:#5f7067;">3 Paket Menunggu Uplink</div>
            </div>
            ${badge('3 Antre', 'warn')}
          </div>
          <div class="tp-phone-body">
            <div class="tp-phone-card" style="background:#f2f9f5;border-color:#a3cbb7;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:9.5px;font-weight:700;color:#1b4332;">Peta Offline MBTiles Aktif</span>
                ${badge('18 Nov', 'ok')}
              </div>
              <div style="font-size:9.5px;color:#3e4e46;">NDVI Sentinel-2 + Batas 18 Blok + 148 Poligon Plasma tersimpan penuh di perangkat.</div>
              <div class="mono" style="font-size:9px;color:#1b4332;margin-top:4px;">Ukuran: 42,6 MB · Valid s/d 25 Nov</div>
            </div>

            <div style="font-size:9.4px;font-weight:700;color:#3e4e46;padding:2px 2px 0;">ANTREAN UPLOAD KE .NET API (3)</div>

            <div class="tp-phone-card" style="border-left:3px solid #d97706;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:700;font-size:10px;">PIN-2611-082 · BLK-B07</span>
                ${badge('Antre', 'warn')}
              </div>
              <div style="font-size:9.5px;color:#3e4e46;margin-top:2px;">Defisit air &amp; nekrosis ujung daun (K)</div>
              <div class="mono" style="font-size:8.8px;color:#5f7067;margin-top:3px;">09:12 WIB · 2 foto (920 KB) · RTK ±0,5m</div>
            </div>

            <div class="tp-phone-card" style="border-left:3px solid #d97706;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:700;font-size:10px;">PIN-2611-081 · BLK-C05</span>
                ${badge('Antre', 'warn')}
              </div>
              <div style="font-size:9.5px;color:#3e4e46;margin-top:2px;">Serangan ulat api Setothosea asigna</div>
              <div class="mono" style="font-size:8.8px;color:#5f7067;margin-top:3px;">08:35 WIB · 3 foto (1,2 MB) · RTK ±0,7m</div>
            </div>

            <div class="tp-phone-card" style="border-left:3px solid #be123c;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="mono" style="font-weight:700;font-size:10px;">PIN-2611-080 · BLK-B04</span>
                ${badge('Prioritas', 'bad')}
              </div>
              <div style="font-size:9.5px;color:#3e4e46;margin-top:2px;">Tubuh buah Ganoderma pangkal batang</div>
              <div class="mono" style="font-size:8.8px;color:#5f7067;margin-top:3px;">07:52 WIB · 4 foto (1,8 MB) · RTK ±0,4m</div>
            </div>

            <div style="font-size:9.4px;font-weight:700;color:#3e4e46;padding:2px 2px 0;">RIWAYAT TERSINKRON (9 TERAKHIR)</div>
            <div class="tp-phone-card">
              <div style="display:flex;justify-content:space-between;font-size:9.4px;padding-bottom:4px;border-bottom:1px solid #ecefe9;">
                <span class="mono" style="font-weight:700;">PIN-084 · BLK-B04</span>
                <span style="color:#047857;font-weight:700;">200 OK · PostGIS</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:9.4px;padding-top:4px;">
                <span class="mono" style="font-weight:700;">PIN-083 · BLK-C09</span>
                <span style="color:#047857;font-weight:700;">200 OK · PostGIS</span>
              </div>
            </div>

            <div class="tp-phone-card" style="background:#f8f9f7;">
              <div style="font-size:9.2px;color:#5f7067;">Auto-Sync Starlink Pos Divisi II</div>
              <div class="mono" style="font-size:9.6px;font-weight:700;color:#14201a;margin-top:2px;">Jarak ke Pos Wi-Fi: 1,4 km · Est. 11:30</div>
            </div>
          </div>
          <div class="tp-phone-foot">
            <span class="e-btn" style="flex:1;justify-content:center;">Cek Sinyal</span>
            <span class="e-btn e-btn-primary" style="flex:1.2;justify-content:center;">Sinkron Paksa (3)</span>
          </div>
        </div>
      </div>
    </section>

    <div style="display:flex;flex-direction:column;gap:9px;min-height:0;">
      <section class="e-panel" style="flex:1.45;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${customIcon('mapPin', 13, '#2d6a4f')} <span>Antrean Triage Pin Inspeksi Agronom (12 Catatan Lapangan Aktif)</span></div>
          <span class="e-panel-sub">9 Tersinkron PostGIS · 3 Antre Offline</span>
        </div>
        <div class="e-panel-body-flush" style="justify-content:space-between;">
          <table class="e-table">
            <thead>
              <tr>
                <th style="width:96px;">ID Pin</th>
                <th style="width:68px;">Blok</th>
                <th style="width:88px;">Agronom</th>
                <th>Gejala Hama / Penyakit / Kendala</th>
                <th style="width:74px;">Tingkat</th>
                <th class="num" style="width:62px;">RTK</th>
                <th style="width:94px;">Sync</th>
                <th style="width:168px;">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>${pinRowsHtml}</tbody>
          </table>
          <div style="padding:6px 10px;background:#f8f9f7;border-top:1px solid #d6dbd5;display:flex;justify-content:space-between;font-size:9.8px;color:#3e4e46;">
            <span>Semua pin foto tersimpan dengan koordinat WGS 84 + checksum SHA-256 untuk audit ISPO &amp; agronomi.</span>
            <span class="mono" style="font-weight:700;color:#1b4332;">Total: 12 Pin (9 Sync / 3 Offline)</span>
          </div>
        </div>
      </section>

      <section class="e-panel" style="flex:0.88;min-height:0;">
        <div class="e-panel-head">
          <div class="e-panel-title">${ic('cpu', 13, '#2d6a4f')} <span>Kalibrasi Umpan Balik Ground-Truth ke XGBoost Yield Regressor</span></div>
          ${badge('Pipeline Python GeoPandas + .NET API', 'accent')}
        </div>
        <div class="e-panel-body" style="display:grid;grid-template-columns:1.25fr 1fr;gap:12px;">
          <div style="display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-size:10px;font-weight:700;color:#14201a;margin-bottom:4px;">Bobot Fitur Model Prediksi Panen 30 Hari (SHAP)</div>
            <div style="display:flex;flex-direction:column;gap:7px;">
              ${featureWeights
                .map(
                  (f) => `<div>
                    <div style="display:flex;justify-content:space-between;font-size:9.8px;margin-bottom:2px;">
                      <span style="color:#3e4e46;font-weight:600;">${esc(f.name)}</span>
                      <span class="mono" style="font-weight:700;color:#14201a;">${f.pct}%</span>
                    </div>
                    <div style="height:6px;background:#e6ebe6;border-radius:2px;overflow:hidden;">
                      <div style="width:${f.pct * 2.5}%;max-width:100%;height:100%;background:${f.color};"></div>
                    </div>
                  </div>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;justify-content:space-between;border-left:1px solid #e2e7e1;padding-left:12px;">
            <div style="font-size:10px;font-weight:700;color:#14201a;">Performa Backtest vs Timbangan PKS (6 Bulan)</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
              <div style="background:#f2f9f5;border:1px solid #a3cbb7;border-radius:3px;padding:7px 8px;">
                <div style="font-size:9px;color:#1b4332;font-weight:700;">MAPE 30 Hari</div>
                <div class="mono" style="font-size:14.5px;font-weight:700;color:#047857;">3,4%</div>
                <div style="font-size:9px;color:#3e4e46;">Turun dari 4,9%</div>
              </div>
              <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:7px 8px;">
                <div style="font-size:9px;color:#5f7067;font-weight:700;">MAE Tonase</div>
                <div class="mono" style="font-size:14.5px;font-weight:700;color:#14201a;">628 t</div>
                <div style="font-size:9px;color:#5f7067;">Dari 18.450 ton</div>
              </div>
              <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:7px 8px;">
                <div style="font-size:9px;color:#5f7067;font-weight:700;">Koefisien R²</div>
                <div class="mono" style="font-size:14.5px;font-weight:700;color:#1b4332;">0,914</div>
                <div style="font-size:9px;color:#5f7067;">18 blok terkalibrasi</div>
              </div>
              <div style="background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:7px 8px;">
                <div style="font-size:9px;color:#5f7067;font-weight:700;">Latensi Inferensi</div>
                <div class="mono" style="font-size:14.5px;font-weight:700;color:#14201a;">4,2 dtk</div>
                <div style="font-size:9px;color:#5f7067;">Batch GeoPandas</div>
              </div>
            </div>
            <div class="mono" style="font-size:9.3px;color:#3e4e46;background:#f8f9f7;border:1px solid #d6dbd5;border-radius:3px;padding:6px 8px;">
              Run #20261118-0600 · Sentinel-2 + BMKG + 9 Pin Sync &rarr; .NET API /v1/yield/forecast (200 OK)
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  return renderFioriShell({
    activeTab: 'p5',
    title: meta.pages[4].title,
    workspaceHtml,
    primaryLabel: 'Kalibrasi Ulang Model',
    secondaryLabel: 'Ekspor Log Inspeksi CSV',
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
