import type { LayoutId, ProjectPageSlug, ProjectPageSpec } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';

export const stages = ['open', 'active', 'review', 'done'] as const;
export type Stage = (typeof stages)[number];
export const stageLabel: Record<Stage, string> = {
  open: 'Belum ditangani', active: 'Dikerjakan', review: 'Menunggu review', done: 'Selesai',
};

export const roles = ['Operator', 'Penelaah', 'Penyetuju'] as const;
export type Role = (typeof roles)[number];
export const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;
export const periods = ['08:00', '10:00', '13:00', '15:00'] as const;
export interface Slot { day: number; period: number }

export interface RecordWork {
  stage: Stage;
  note?: string;
  revision?: string;
  calculation?: string;
  checks?: Partial<Record<ProjectPageSlug, number[]>>;
  linkedCode?: string;
  assignedRole?: Role;
  slot?: Slot;
  allocation?: string;
}

interface Activity {
  id: string;
  at: string;
  code: string;
  page: ProjectPageSlug;
  label: string;
  detail?: string;
}

export interface JournalEntry {
  id: string;
  code: string;
  at: string;
  debit: string;
  credit: string;
  amount: number;
  memo: string;
}

export interface Scenario {
  selected: string;
  records: Record<string, RecordWork>;
  activity: Activity[];
  journal: JournalEntry[];
}

export function createScenario(project: ConceptProject): Scenario {
  return { selected: project.preview.items[0].code, records: {}, activity: [], journal: [] };
}

export function getWork(scenario: Scenario, code: string): RecordWork {
  return scenario.records[code] ?? { stage: 'open' };
}

export function changeWork(scenario: Scenario, code: string, page: ProjectPageSlug, action: WorkAction, at: string): Scenario {
  const activity: Activity = {
    id: `${at}-${scenario.activity.length}`, at,
    code, page, label: action.label, detail: action.detail,
  };
  return {
    ...scenario,
    selected: code,
    records: action.patch ? {
      ...scenario.records,
      [code]: { ...getWork(scenario, code), ...action.patch },
    } : scenario.records,
    activity: [activity, ...scenario.activity],
    journal: action.entry ? [{ ...action.entry, id: activity.id, at: activity.at, code }, ...scenario.journal] : scenario.journal,
  };
}

export interface WorkAction {
  label: string;
  detail?: string;
  patch?: Partial<RecordWork>;
  entry?: Omit<JournalEntry, 'id' | 'at' | 'code'>;
}

export function scenarioKey(projectId: string): string {
  return `portfolio.atlas.v1.${projectId}`;
}

export function loadScenario(project: ConceptProject): Scenario {
  const seed = createScenario(project);
  try {
    const raw = localStorage.getItem(scenarioKey(project.id));
    if (!raw) return seed;
    const saved = JSON.parse(raw) as Partial<Scenario> | null;
    if (!saved?.records || !Array.isArray(saved.activity) || !Array.isArray(saved.journal)) return seed;
    return {
      selected: project.preview.items.find((item) => item.code === saved.selected)?.code ?? seed.selected,
      records: saved.records,
      activity: saved.activity,
      journal: saved.journal,
    };
  } catch {
    return seed;
  }
}

type SurfaceSpec =
  | { view: 'table' | 'board' | 'analytics' | 'compare' | 'exchange' | 'review' | 'journal' | 'schedule' | 'wizard' | 'mobile' | 'matrix' | 'allocation'; title: string }
  | { view: 'topology' | 'map'; title: string; link: string }
  | { view: 'audit'; title: string; checks: readonly [string, string, string] }
  | { view: 'calculator'; title: string; model: 'tax' | 'margin' };

const reviewChecks = ['Rincian sumber diperiksa', 'Catatan temuan terdokumentasi', 'Tindak lanjut sudah ditentukan'] as const;

const layoutSurfaces: Record<LayoutId, SurfaceSpec> = {
  'pos-touch-register': { view: 'table', title: 'Register transaksi' },
  'kds-kitchen-board': { view: 'board', title: 'Antrean dapur' },
  'stadium-seating-map': { view: 'allocation', title: 'Alokasi tempat dan ketersediaan' },
  'gantt-tape-chart': { view: 'schedule', title: 'Alokasi jadwal kerja' },
  'dicom-radiology-pacs': { view: 'compare', title: 'Perbandingan temuan dan anotasi' },
  'document-redline-editor': { view: 'compare', title: 'Teks sumber dan draf revisi' },
  'ide-code-diff-workbench': { view: 'compare', title: 'Diff perubahan lokal' },
  'api-postman-inspector': { view: 'exchange', title: 'Inspektor snapshot data contoh' },
  'livestream-commerce-studio': { view: 'board', title: 'Antrean agenda dan produk' },
  'whatsapp-inbox-flow': { view: 'review', title: 'Kotak masuk tindak lanjut' },
  'kanban-sprint-board': { view: 'board', title: 'Papan alur kerja' },
  'geo-dispatch-map': { view: 'map', title: 'Peta skematik penugasan', link: 'Titik alih penugasan' },
  'scada-plant-blueprint': { view: 'map', title: 'Zona operasi dan inspeksi', link: 'Zona inspeksi lanjutan' },
  'floorplan-bay-grid': { view: 'map', title: 'Denah lokasi kerja', link: 'Lokasi alternatif' },
  'cbt-exam-simulator': { view: 'wizard', title: 'Alur pengisian dan pemeriksaan' },
  'social-creator-marketplace': { view: 'table', title: 'Direktori dan riwayat tindak lanjut' },
  'accounting-ledger-sheet': { view: 'journal', title: 'Register dan jurnal berpasangan' },
  'email-approval-inbox': { view: 'review', title: 'Kotak masuk persetujuan' },
  'dag-pipeline-canvas': { view: 'topology', title: 'Peta alur dan dependensi', link: 'Rekaman dependensi' },
  'form-wizard-onboarding': { view: 'wizard', title: 'Formulir pemeriksaan bertahap' },
  'trading-fraud-terminal': { view: 'table', title: 'Register sinyal dan triase' },
  'clinical-emr-chart': { view: 'compare', title: 'Catatan klinis dan anotasi tinjauan' },
  'calendar-schedule-week': { view: 'schedule', title: 'Kalender mingguan' },
  'executive-bento-brief': { view: 'analytics', title: 'Ringkasan indikator dan progres' },
  'audit-compliance-dossier': { view: 'audit', title: 'Dossier bukti dan checklist', checks: reviewChecks },
  'settings-rbac-matrix': { view: 'matrix', title: 'Matriks penugasan peran' },
  'mobile-hero-nfc-card': { view: 'mobile', title: 'Kartu digital dan riwayat' },
  'mobile-trio-journey': { view: 'wizard', title: 'Alur pengalaman tiga langkah' },
  'mobile-field-tablet-split': { view: 'wizard', title: 'Pencatatan lapangan' },
  'mobile-boarding-ticket': { view: 'mobile', title: 'Pas digital dan detail perjalanan' },
  'mobile-chat-commerce': { view: 'review', title: 'Antrean percakapan dan pesanan' },
  'mobile-biometric-wallet': { view: 'mobile', title: 'Dompet contoh dan riwayat' },
};

type EnterpriseSurfaces = Record<'p1' | 'p2' | 'p3' | 'p4' | 'p5', SurfaceSpec>;
const enterpriseSurfaces: Record<string, EnterpriseSurfaces | undefined> = {
  'ID-001': {
    p1: { view: 'analytics', title: 'Kesehatan pool dan progres penanganan' },
    p2: { view: 'table', title: 'Register telemetri dan inspektor' },
    p3: { view: 'topology', title: 'Topologi pool dan rute cadangan', link: 'Pool cadangan untuk simulasi' },
    p4: { view: 'audit', title: 'Checklist kepatuhan pool', checks: ['Klasifikasi data dicatat', 'Kebijakan redaksi ditinjau', 'Hak akses ditinjau'] },
    p5: { view: 'compare', title: 'Draf redaksi dan perbandingan' },
  },
  'ID-002': {
    p1: { view: 'table', title: 'Register klausul' },
    p2: { view: 'compare', title: 'Pembanding klausul dan usulan perubahan' },
    p3: { view: 'audit', title: 'Checklist DPA', checks: ['Dasar pemrosesan diperiksa', 'Tenggat notifikasi dicatat', 'Tanggung jawab para pihak diperiksa'] },
    p4: { view: 'exchange', title: 'Inspektor snapshot referensi klausul' },
    p5: { view: 'review', title: 'Persetujuan memo risiko' },
  },
  'ID-003': {
    p1: { view: 'analytics', title: 'Distribusi temuan audit panggilan' },
    p2: { view: 'board', title: 'Antrean audit panggilan' },
    p3: { view: 'compare', title: 'Temuan sumber dan anotasi sensor' },
    p4: { view: 'topology', title: 'Alur tinjauan audit', link: 'Panggilan pembanding' },
    p5: { view: 'review', title: 'Inbox tindak lanjut coaching' },
  },
  'ID-004': {
    p1: { view: 'board', title: 'Jalur kerja migrasi' },
    p2: { view: 'table', title: 'Inventaris modul dan catatan kontrak' },
    p3: { view: 'compare', title: 'Usulan perubahan dan perbandingan' },
    p4: { view: 'topology', title: 'Worktree dan dependensi gate', link: 'Lane yang perlu diverifikasi dahulu' },
    p5: { view: 'review', title: 'Review hasil migrasi' },
  },
  'ID-005': {
    p1: { view: 'compare', title: 'Catatan SOAP contoh dan revisi' },
    p2: { view: 'board', title: 'Antrean pemeriksaan catatan poliklinik' },
    p3: { view: 'exchange', title: 'Inspektor data contoh untuk tinjauan integrasi' },
    p4: { view: 'audit', title: 'Dossier privasi catatan', checks: ['Status persetujuan diperiksa', 'Kebijakan retensi diperiksa', 'Bukti akses ditinjau'] },
    p5: { view: 'analytics', title: 'Beban pemeriksaan catatan' },
  },
  'ID-006': {
    p1: { view: 'analytics', title: 'Distribusi catatan ancaman' },
    p2: { view: 'board', title: 'Triase catatan pertahanan' },
    p3: { view: 'matrix', title: 'Penanggung jawab tinjauan kebijakan' },
    p4: { view: 'table', title: 'Register temuan pertahanan yang sudah dicatat' },
    p5: { view: 'audit', title: 'Dossier bukti penanganan', checks: ['Kategori insiden ditinjau', 'Keputusan mitigasi didokumentasikan', 'Penanggung jawab tindak lanjut ditentukan'] },
  },
  'ID-007': {
    p1: { view: 'table', title: 'Register objek potong' },
    p2: { view: 'review', title: 'Review klasifikasi dan sitasi' },
    p3: { view: 'calculator', title: 'Perbandingan tarif pemotongan contoh', model: 'tax' },
    p4: { view: 'topology', title: 'Peta referensi kertas kerja', link: 'Rekaman rujukan pembanding' },
    p5: { view: 'exchange', title: 'Inspektor kertas kerja lokal' },
  },
  'ID-008': {
    p1: { view: 'map', title: 'Denah zona inspeksi pabrik', link: 'Zona tindak lanjut' },
    p2: { view: 'table', title: 'Inventaris kanal kamera contoh' },
    p3: { view: 'topology', title: 'Topologi zona dan referensi inspeksi', link: 'Kanal rujukan' },
    p4: { view: 'board', title: 'Antrean tindak lanjut inspeksi mutu' },
    p5: { view: 'analytics', title: 'Scorecard temuan inspeksi' },
  },
  'ID-009': {
    p1: { view: 'analytics', title: 'Kesiapan katalog dan progres review' },
    p2: { view: 'table', title: 'Register SKU dan inspektor katalog' },
    p3: { view: 'compare', title: 'Usulan teks katalog untuk review' },
    p4: { view: 'calculator', title: 'Kalkulator margin kanal', model: 'margin' },
    p5: { view: 'audit', title: 'Checklist kesiapan feed', checks: ['Rujukan registrasi dicatat', 'Klaim produk sudah ditinjau', 'Rincian pengiriman diperiksa'] },
  },
  'ID-010': {
    p1: { view: 'analytics', title: 'Indikator kebun dan anomali blok' },
    p2: { view: 'table', title: 'Register blok agronomi contoh' },
    p3: { view: 'map', title: 'Peta skematik alih rute blok', link: 'Blok tujuan alih rute' },
    p4: { view: 'audit', title: 'Checklist kepatuhan poligon', checks: ['Batas poligon ditinjau', 'Baseline dibandingkan', 'Catatan otorisasi diperiksa'] },
    p5: { view: 'wizard', title: 'Formulir hasil inspeksi blok' },
  },
  'ID-011': {
    p1: { view: 'analytics', title: 'Posisi kliring dan tindak lanjut' },
    p2: { view: 'journal', title: 'Jurnal transaksi QRIS Tap' },
    p3: { view: 'mobile', title: 'Dompet komuter dan struk contoh' },
    p4: { view: 'review', title: 'Kotak masuk review settlement' },
    p5: { view: 'audit', title: 'Checklist kepatuhan transaksi', checks: ['Rujukan transaksi diperiksa', 'Bukti pencatatan diverifikasi', 'Catatan rekonsiliasi ditinjau'] },
  },
};

export function getSurface(projectId: string, page: ProjectPageSpec): SurfaceSpec {
  if (page.layout !== 'enterprise-bespoke') return layoutSurfaces[page.layout];
  const pages = enterpriseSurfaces[projectId];
  return pages && page.slug in pages
    ? pages[page.slug as keyof EnterpriseSurfaces]
    : layoutSurfaces['executive-bento-brief'];
}
