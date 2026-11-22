import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { ProjectPageSpec } from '../data/projectPages';
import type { ConceptProject, PreviewItem } from '../data/projectTypes';
import {
  changeWork, createScenario, days, getSurface, getWork, loadScenario, periods, roles,
  scenarioKey, stageLabel, stages,
} from './atlas-model';
import type { RecordWork, Role, Scenario, Stage, WorkAction } from './atlas-model';
import './atlas-surface.css';

interface Props { project: ConceptProject; page: ProjectPageSpec }
interface Workspace {
  project: ConceptProject;
  page: ProjectPageSpec;
  scenario: Scenario;
  items: PreviewItem[];
  selected: PreviewItem;
  select: (code: string) => void;
  apply: (action: WorkAction, code?: string) => void;
}

const phaseAction: Record<Stage, { stage: Stage; label: string }> = {
  open: { stage: 'active', label: 'Mulai penanganan' },
  active: { stage: 'review', label: 'Ajukan review' },
  review: { stage: 'done', label: 'Setujui & selesaikan' },
  done: { stage: 'active', label: 'Buka kembali' },
};
const phaseTone: Record<Stage, string> = { open: 'neutral', active: 'accent', review: 'warn', done: 'ok' };
const numbers = new Intl.NumberFormat('id-ID');
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const datetime = new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' });

export default function AtlasSurface(props: Props) {
  return <ScenarioSurface key={props.project.id} {...props} />;
}

function ScenarioSurface({ project, page }: Props) {
  const [scenario, setScenario] = useState(() => loadScenario(project));
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<boolean>();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const items = project.preview.items;
  const selected = items.find((item) => item.code === scenario.selected) ?? items[0];
  const spec = getSurface(project.id, page);

  useEffect(() => {
    try {
      localStorage.setItem(scenarioKey(project.id), JSON.stringify(scenario));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [project.id, scenario]);

  const work: Workspace = {
    project, page, scenario, items, selected,
    select: (code) => setScenario((current) => current.selected === code ? current : { ...current, selected: code }),
    apply: (action, code = selected.code) => {
      const at = new Date().toISOString();
      setScenario((current) => changeWork(current, code, page.slug, action, at));
      setNotice(`${code} · ${action.label}`);
    },
  };

  return (
    <section className="atlas-surface" aria-label={spec.title}>
      <header className="atlas-workbar">
        <div>
          <p className="atlas-eyebrow">{project.preview.surfaceTitle}</p>
          <h2>{spec.title}</h2>
        </div>
        <div className="atlas-storage">
          <Badge tone={saved === false ? 'warn' : 'neutral'}>{saved === false ? 'Penyimpanan lokal tidak tersedia' : saved ? 'Tersimpan di perangkat ini' : 'Membuka penyimpanan'}</Badge>
          <button className="atlas-text-button" type="button" onClick={() => setConfirmReset(!confirmReset)} aria-expanded={confirmReset}>Reset skenario</button>
        </div>
      </header>
      {confirmReset && (
        <div className="atlas-confirm">
          <p>Hapus progres, catatan, dan riwayat lokal untuk proyek ini?</p>
          <button type="button" className="atlas-button" onClick={() => setConfirmReset(false)}>Batal</button>
          <button type="button" className="atlas-button" data-kind="danger" onClick={() => {
            setScenario(createScenario(project));
            setResetVersion((version) => version + 1);
            setConfirmReset(false);
            setNotice('Skenario lokal dikembalikan ke kondisi awal.');
          }}>Hapus progres lokal</button>
        </div>
      )}
      <p className="atlas-notice" role="status">{notice}</p>
      <div key={`${page.slug}-${resetVersion}`}>
        {spec.view === 'table' && <TableView work={work} />}
        {spec.view === 'board' && <BoardView work={work} />}
        {spec.view === 'review' && <ReviewView work={work} />}
        {spec.view === 'journal' && <JournalView work={work} />}
        {spec.view === 'analytics' && <AnalyticsView work={work} />}
        {(spec.view === 'topology' || spec.view === 'map') && <TopologyView work={work} map={spec.view === 'map'} link={spec.link} />}
        {spec.view === 'compare' && <CompareView work={work} />}
        {spec.view === 'audit' && <AuditView work={work} checks={spec.checks} />}
        {spec.view === 'wizard' && <WizardView work={work} />}
        {spec.view === 'mobile' && <MobileView work={work} />}
        {spec.view === 'exchange' && <ExchangeView work={work} />}
        {spec.view === 'matrix' && <MatrixView work={work} />}
        {spec.view === 'schedule' && <ScheduleView work={work} />}
        {spec.view === 'allocation' && <AllocationView work={work} />}
        {spec.view === 'calculator' && <CalculatorView work={work} model={spec.model} />}
      </div>
    </section>
  );
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className="atlas-badge" data-tone={tone}>{children}</span>;
}

function Phase({ stage }: { stage: Stage }) {
  return <Badge tone={phaseTone[stage]}>{stageLabel[stage]}</Badge>;
}

function Panel({ title, actions, children, className = '' }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`atlas-panel ${className}`}>
      <div className="atlas-panel-head"><h3>{title}</h3>{actions}</div>
      {children}
    </section>
  );
}

function RecordSelect({ work }: { work: Workspace }) {
  return (
    <label className="atlas-field atlas-record-select">
      <span>Rekaman</span>
      <select value={work.selected.code} onChange={(event) => work.select(event.target.value)}>
        {work.items.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}
      </select>
    </label>
  );
}

function PhaseButton({ work, code }: { work: Workspace; code: string }) {
  const current = getWork(work.scenario, code).stage;
  const next = phaseAction[current];
  return (
    <button className="atlas-button" data-kind={current === 'done' ? undefined : 'primary'} type="button" onClick={() => {
      work.apply({ label: next.label, patch: { stage: next.stage } }, code);
    }}>{next.label}</button>
  );
}

function RecordFacts({ item, record }: { item: PreviewItem; record: RecordWork }) {
  return (
    <>
      <div className="atlas-inline"><span className="atlas-code">{item.code}</span><Phase stage={record.stage} /></div>
      <h4>{item.title}</h4>
      <p>{item.subtitle}</p>
      <dl className="atlas-facts">
        <div><dt>Nilai sumber</dt><dd>{item.value}</dd></div>
        <div><dt>Status sumber</dt><dd><Badge tone={item.tone}>{item.status}</Badge></dd></div>
        {item.meta && <div><dt>Rujukan</dt><dd>{item.meta}</dd></div>}
        {record.linkedCode && <div><dt>Rekaman tertaut</dt><dd className="atlas-code">{record.linkedCode}</dd></div>}
        {record.assignedRole && <div><dt>Peran tertugas</dt><dd>{record.assignedRole}</dd></div>}
        {record.slot && <div><dt>Slot lokal</dt><dd>{days[record.slot.day]} · {periods[record.slot.period]}</dd></div>}
        {record.allocation && <div><dt>Tempat dialokasikan</dt><dd>{record.allocation}</dd></div>}
      </dl>
      {record.calculation && <div className="atlas-evidence"><strong>Hasil hitung tersimpan</strong><p>{record.calculation}</p></div>}
    </>
  );
}

function NoteForm({ work, record }: { work: Workspace; record: RecordWork }) {
  const [note, setNote] = useState(record.note ?? '');
  const change = note.trim();
  return (
    <form className="atlas-form" onSubmit={(event) => {
      event.preventDefault();
      if (change !== (record.note ?? '')) work.apply({ label: change ? 'Catatan disimpan' : 'Catatan dikosongkan', detail: change || undefined, patch: { note: change || undefined } });
    }}>
      <label className="atlas-field"><span>Catatan penanganan</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1200} rows={3} /></label>
      <button type="submit" className="atlas-button" disabled={change === (record.note ?? '')}>Simpan catatan</button>
    </form>
  );
}

function ActivityLog({ work, all = false }: { work: Workspace; all?: boolean }) {
  const entries = all ? work.scenario.activity : work.scenario.activity.filter(({ code }) => code === work.selected.code);
  return (
    <details className="atlas-history">
      <summary>Riwayat {all ? 'proyek' : 'rekaman'} <span>{entries.length}</span></summary>
      {entries.length === 0 ? <p>Belum ada perubahan lokal.</p> : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <span className="atlas-code">{all ? `${entry.code} · ` : ''}{entry.page.toUpperCase()} · {datetime.format(new Date(entry.at))}</span>
              <strong>{entry.label}</strong>
              {entry.detail && <p>{entry.detail}</p>}
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}

function Inspector({ work, actions = true, notes = true }: { work: Workspace; actions?: boolean; notes?: boolean }) {
  const record = getWork(work.scenario, work.selected.code);
  return (
    <Panel title="Inspektor rekaman" className="atlas-inspector">
      <div className="atlas-pad atlas-stack">
        <RecordFacts item={work.selected} record={record} />
        {actions && <div><PhaseButton work={work} code={work.selected.code} /></div>}
        {notes ? <NoteForm key={`${work.selected.code}:${record.note ?? ''}`} work={work} record={record} /> : record.note && <p className="atlas-record-note">{record.note}</p>}
        <ActivityLog work={work} />
      </div>
    </Panel>
  );
}

function RecordTable({ work, items }: { work: Workspace; items: PreviewItem[] }) {
  if (!items.length) return <p className="atlas-empty">Tidak ada rekaman yang cocok. Ubah istilah atau filter pencarian.</p>;
  return (
    <div className="atlas-table-scroll">
      <table className="atlas-table">
        <thead><tr><th scope="col">Rekaman</th><th scope="col">Nilai</th><th scope="col">Status sumber</th><th scope="col">Progres lokal</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.code} data-selected={item.code === work.selected.code}>
              <th scope="row"><button className="atlas-row-button" type="button" aria-pressed={item.code === work.selected.code} onClick={() => work.select(item.code)}><span className="atlas-code">{item.code}</span><span>{item.title}</span></button></th>
              <td>{item.value}</td><td><Badge tone={item.tone}>{item.status}</Badge></td><td><Phase stage={getWork(work.scenario, item.code).stage} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableView({ work }: { work: Workspace }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Stage | 'all'>('all');
  const words = query.trim().toLocaleLowerCase('id-ID').split(/\s+/);
  const visible = work.items.filter((item) => {
    const stage = getWork(work.scenario, item.code).stage;
    const searchable = [item.code, item.title, item.subtitle, item.value, item.status, item.meta, stageLabel[stage]].join(' ').toLocaleLowerCase('id-ID');
    return (filter === 'all' || stage === filter) && words.every((word) => searchable.includes(word));
  });
  return (
    <div className="atlas-split">
      <Panel title="Register rekaman" actions={<Badge>{visible.length} / {work.items.length}</Badge>}>
        <div className="atlas-filters">
          <label className="atlas-field"><span>Cari rekaman</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kode, nama, atau rujukan" /></label>
          <label className="atlas-field"><span>Progres</span><select value={filter} onChange={(event) => setFilter(event.target.value as Stage | 'all')}><option value="all">Semua progres</option>{stages.map((stage) => <option key={stage} value={stage}>{stageLabel[stage]}</option>)}</select></label>
        </div>
        <RecordTable work={work} items={visible} />
        {visible.length > 0 && !visible.some((item) => item.code === work.selected.code) && <p className="atlas-help atlas-pad">Pilihan {work.selected.code} di inspektor berada di luar hasil filter.</p>}
      </Panel>
      <Inspector work={work} />
    </div>
  );
}

function BoardView({ work }: { work: Workspace }) {
  return (
    <div className="atlas-stack">
      <div className="atlas-board" aria-label="Tahapan antrean">
        {stages.map((stage) => {
          const items = work.items.filter((item) => getWork(work.scenario, item.code).stage === stage);
          return (
            <Panel key={stage} title={stageLabel[stage]} className="atlas-lane" actions={<Badge tone={phaseTone[stage]}>{items.length}</Badge>}>
              <div className="atlas-lane-items">
                {items.length === 0 && <p>Belum ada rekaman.</p>}
                {items.map((item) => <article className="atlas-board-card" key={item.code} data-selected={item.code === work.selected.code}>
                  <button className="atlas-row-button" aria-pressed={item.code === work.selected.code} type="button" onClick={() => work.select(item.code)}><span className="atlas-code">{item.code}</span><span>{item.title}</span></button>
                  <Badge tone={item.tone}>{item.status}</Badge>
                  <PhaseButton work={work} code={item.code} />
                </article>)}
              </div>
            </Panel>
          );
        })}
      </div>
      <Inspector work={work} actions={false} />
    </div>
  );
}

function ReviewView({ work }: { work: Workspace }) {
  const queue = work.items.filter((item) => getWork(work.scenario, item.code).stage === 'review');
  const others = work.items.filter((item) => getWork(work.scenario, item.code).stage !== 'review');
  return (
    <div className="atlas-split">
      <Panel title="Kotak masuk lokal" actions={<Badge tone="warn">{queue.length} menunggu</Badge>}>
        {queue.length === 0 && <p className="atlas-empty">Belum ada pengajuan. Pilih rekaman dan ajukan hasil penanganannya untuk review.</p>}
        <div className="atlas-inbox">
          {[...queue, ...others].map((item) => (
            <button key={item.code} type="button" className="atlas-inbox-item" aria-pressed={item.code === work.selected.code} onClick={() => work.select(item.code)}>
              <span><span className="atlas-code">{item.code}</span><strong>{item.title}</strong></span><Phase stage={getWork(work.scenario, item.code).stage} />
            </button>
          ))}
        </div>
      </Panel>
      <ReviewDecision key={work.selected.code} work={work} />
    </div>
  );
}

function ReviewDecision({ work }: { work: Workspace }) {
  const record = getWork(work.scenario, work.selected.code);
  const [reason, setReason] = useState('');
  const detail = reason.trim();
  const decide = (action: WorkAction) => { work.apply(action); setReason(''); };
  return (
    <Panel title="Meja keputusan">
      <div className="atlas-pad atlas-stack">
        <RecordFacts item={work.selected} record={record} />
        {record.revision && <div className="atlas-evidence"><strong>Draf untuk ditinjau</strong><p>{record.revision}</p></div>}
        {record.note && <p className="atlas-record-note">{record.note}</p>}
        {record.stage === 'review' ? (
          <div className="atlas-form">
            <label className="atlas-field"><span>Catatan keputusan</span><textarea rows={3} maxLength={1200} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Wajib untuk meminta perbaikan" /></label>
            <div className="atlas-inline">
              <button className="atlas-button" type="button" disabled={!detail} onClick={() => decide({ label: 'Dikembalikan untuk perbaikan', detail, patch: { stage: 'active' } })}>Minta perbaikan</button>
              <button className="atlas-button" type="button" data-kind="primary" onClick={() => decide({ label: phaseAction.review.label, detail: detail || undefined, patch: { stage: 'done' } })}>{phaseAction.review.label}</button>
            </div>
          </div>
        ) : <div><PhaseButton work={work} code={work.selected.code} /></div>}
        {record.stage !== 'review' && <NoteForm key={record.note} work={work} record={record} />}
        <ActivityLog work={work} />
      </div>
    </Panel>
  );
}

const sourceBands = [
  { key: 'bad', label: 'Kritis' }, { key: 'warn', label: 'Perlu perhatian' },
  { key: 'ok', label: 'Baik' }, { key: 'neutral', label: 'Netral' },
] as const;

function AnalyticsView({ work }: { work: Workspace }) {
  const [group, setGroup] = useState<'stage' | 'source'>('stage');
  const [filter, setFilter] = useState<string>();
  const groups = group === 'stage' ? stages.map((key) => ({ key, label: stageLabel[key], tone: phaseTone[key] })) : sourceBands.map(({ key, label }) => ({ key, label, tone: key }));
  const getBand = (item: PreviewItem) => group === 'stage' ? getWork(work.scenario, item.code).stage : item.tone ?? 'neutral';
  const visible = filter ? work.items.filter((item) => getBand(item) === filter) : work.items;
  return (
    <div className="atlas-stack">
      <div className="atlas-metrics" aria-label="Indikator sumber contoh">
        {work.project.preview.metrics.map((metric) => <div className="atlas-metric" key={metric.label}><span>{metric.label}</span><strong data-tone={metric.tone}>{metric.value}</strong><small>Data contoh</small></div>)}
      </div>
      <div className="atlas-split">
        <div className="atlas-stack">
          <Panel title="Distribusi rekaman" actions={<label className="atlas-field atlas-short-field"><span>Kelompokkan menurut</span><select value={group} onChange={(event) => { setGroup(event.target.value as 'stage' | 'source'); setFilter(undefined); }}><option value="stage">Progres lokal</option><option value="source">Tingkat perhatian sumber</option></select></label>}>
            <div className="atlas-pad atlas-bars">
              <p className="atlas-help">Pilih baris untuk menyaring rincian di bawah.</p>
              {groups.map(({ key, label, tone }) => {
                const count = work.items.filter((item) => getBand(item) === key).length;
                return <button type="button" className="atlas-bar-row" key={key} aria-pressed={filter === key} onClick={() => setFilter(filter === key ? undefined : key)}><span>{label}</span><span className="atlas-bar-track" aria-hidden="true"><span style={{ width: `${count / work.items.length * 100}%` }} data-tone={tone} /></span><strong>{count}</strong></button>;
              })}
            </div>
          </Panel>
          <Panel title={filter ? groups.find(({ key }) => key === filter)?.label ?? 'Rincian' : 'Semua rekaman'} actions={filter && <button type="button" className="atlas-text-button" onClick={() => setFilter(undefined)}>Hapus filter</button>}><RecordTable work={work} items={visible} /></Panel>
        </div>
        <Inspector work={work} />
      </div>
    </div>
  );
}

function TopologyView({ work, map, link }: { work: Workspace; map: boolean; link: string }) {
  const linked = getWork(work.scenario, work.selected.code).linkedCode;
  return (
    <div className="atlas-split">
      <Panel title={map ? 'Peta skematik' : 'Diagram relasi'}>
        <div className="atlas-pad atlas-stack">
          <p className="atlas-help">{map ? 'Denah ilustratif tanpa koordinat geografis.' : 'Diagram relasi rekaman, bukan topologi layanan aktif.'} Pilih simpul untuk memeriksa atau mencatat hubungan lokal.</p>
          <div className={map ? 'atlas-map' : 'atlas-graph'}>
            {!map && <div className="atlas-graph-cap"><span>Rekaman sumber</span></div>}
            <div className="atlas-nodes">
              {work.items.map((item, index) => {
                const record = getWork(work.scenario, item.code);
                return (
                  <button type="button" className="atlas-node" key={item.code} aria-pressed={work.selected.code === item.code} data-linked={linked === item.code} onClick={() => work.select(item.code)}>
                    <span className="atlas-node-meta"><span className="atlas-code">{item.code}</span><small>{map ? `Z${index + 1}` : `0${index + 1}`}</small></span>
                    <strong>{item.title}</strong>
                    <Badge tone={item.tone}>{item.status}</Badge>
                    {record.linkedCode && <span className="atlas-code">→ {record.linkedCode}</span>}
                    {linked === item.code && <Badge tone="accent">Tujuan relasi terpilih</Badge>}
                  </button>
                );
              })}
            </div>
            {!map && <div className="atlas-graph-cap"><span>Tindak lanjut lokal</span></div>}
          </div>
          <LinkForm key={work.selected.code} work={work} label={link} />
        </div>
      </Panel>
      <Inspector work={work} />
    </div>
  );
}

function LinkForm({ work, label }: { work: Workspace; label: string }) {
  const oldLink = getWork(work.scenario, work.selected.code).linkedCode ?? '';
  const [target, setTarget] = useState(oldLink);
  let cursor = work.page.layout === 'dag-pipeline-canvas' ? target : '';
  let cycle = false;
  for (let hops = 0; cursor && hops <= work.items.length; hops++) {
    if (cursor === work.selected.code) {
      cycle = true;
      break;
    }
    cursor = getWork(work.scenario, cursor).linkedCode ?? '';
  }
  cycle ||= Boolean(cursor);
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (target === oldLink || cycle) return;
    work.apply({ label: target ? 'Relasi lokal disimpan' : 'Relasi lokal dilepas', detail: target ? `${work.selected.code} → ${target}` : `${work.selected.code} × ${oldLink}`, patch: { linkedCode: target || undefined } });
  };
  return (
    <form className="atlas-form atlas-inline-form" onSubmit={save}>
      <label className="atlas-field"><span>{label}</span><select value={target} onChange={(event) => setTarget(event.target.value)}><option value="">Tidak ditautkan</option>{work.items.filter((item) => item.code !== work.selected.code).map((item) => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}</select></label>
      <button className="atlas-button" type="submit" disabled={target === oldLink || cycle}>Simpan relasi</button>
      {cycle && <p className="atlas-help" role="alert">Relasi ini membentuk alur melingkar. Pilih rekaman lain.</p>}
    </form>
  );
}

function CompareView({ work }: { work: Workspace }) {
  return (
    <div className="atlas-split">
      <Panel title="Meja perbandingan">
        <div className="atlas-pad atlas-stack"><RecordSelect work={work} /><CompareForm key={work.selected.code} work={work} /></div>
      </Panel>
      <Inspector work={work} actions={false} />
    </div>
  );
}

function CompareForm({ work }: { work: Workspace }) {
  const record = getWork(work.scenario, work.selected.code);
  const original = work.selected.subtitle;
  const [draft, setDraft] = useState(record.revision ?? original);
  const candidate = draft.trim();
  const changed = candidate !== original && candidate.length > 0;
  let left = 0;
  let right = 0;
  if (changed) {
    while (original[left] && original[left] === candidate[left]) left++;
    while (right < Math.min(original.length, candidate.length) - left && original.at(-1 - right) === candidate.at(-1 - right)) right++;
  }
  const samePrefix = original.slice(0, left);
  const sameSuffix = right ? original.slice(-right) : '';
  return (
    <form className="atlas-form" onSubmit={(event) => {
      event.preventDefault();
      if (!changed) return;
      work.apply({ label: 'Usulan diajukan untuk review', detail: candidate, patch: { revision: candidate, stage: 'review' } });
    }}>
      <div className="atlas-diff">
        <div className="atlas-evidence"><strong>Teks sumber</strong><p>{changed ? <>{samePrefix}<del>{original.slice(left, original.length - right)}</del>{sameSuffix}</> : original}</p></div>
        <div className="atlas-evidence"><strong>Pratinjau usulan</strong><p>{changed ? <>{samePrefix}<ins>{candidate.slice(left, candidate.length - right)}</ins>{sameSuffix}</> : 'Belum ada perubahan dari teks sumber.'}</p></div>
      </div>
      <label className="atlas-field"><span>Usulan perubahan</span><textarea rows={5} maxLength={1200} value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
      <div className="atlas-inline">
        <button className="atlas-button" type="button" disabled={!changed || candidate === record.revision} onClick={() => work.apply({ label: 'Draf revisi disimpan', detail: candidate, patch: { revision: candidate, stage: 'active' } })}>Simpan draf</button>
        <button className="atlas-button" type="submit" data-kind="primary" disabled={!changed || (candidate === record.revision && record.stage === 'review')}>Ajukan usulan</button>
      </div>
    </form>
  );
}

function AuditView({ work, checks }: { work: Workspace; checks: readonly string[] }) {
  return (
    <div className="atlas-split">
      <Panel title="Pemeriksaan bukti lokal">
        <div className="atlas-pad atlas-stack"><RecordSelect work={work} /><AuditForm key={work.selected.code} work={work} checks={checks} /><ActivityLog work={work} all /></div>
      </Panel>
      <Inspector work={work} actions={false} />
    </div>
  );
}

function AuditForm({ work, checks }: { work: Workspace; checks: readonly string[] }) {
  const record = getWork(work.scenario, work.selected.code);
  const recorded = record.checks?.[work.page.slug] ?? [];
  const [checked, setChecked] = useState(recorded);
  const complete = checked.length === checks.length;
  const changed = recorded.length !== checked.length || checked.some((index) => !recorded.includes(index));
  const patch = { checks: { ...record.checks, [work.page.slug]: checked } };
  return (
    <div className="atlas-form">
      <fieldset className="atlas-checks"><legend>{checked.length} dari {checks.length} butir diperiksa</legend>
        {checks.map((check, index) => <label key={check}><input type="checkbox" checked={checked.includes(index)} onChange={(event) => setChecked(event.target.checked ? [...checked, index] : checked.filter((checkIndex) => checkIndex !== index))} /><span>{check}</span></label>)}
      </fieldset>
      <div className="atlas-inline">
        <button className="atlas-button" type="button" disabled={!changed} onClick={() => work.apply({ label: 'Checklist disimpan', detail: `${checked.length}/${checks.length} butir`, patch })}>Simpan checklist</button>
        <button className="atlas-button" data-kind="primary" type="button" disabled={!complete || (record.stage === 'done' && !changed)} onClick={() => work.apply({ label: 'Pemeriksaan lokal diselesaikan', detail: checks.join(' · '), patch: { ...patch, stage: 'done' } })}>Selesaikan pemeriksaan</button>
      </div>
    </div>
  );
}

function WizardView({ work }: { work: Workspace }) {
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="atlas-split">
      <Panel title="Pengisian bertahap">
        <div className="atlas-pad atlas-stack">
          <ol className="atlas-steps" aria-label="Langkah pengisian">{['Pilih rekaman', 'Isi temuan', 'Konfirmasi'].map((label, index) => <li key={label} aria-current={index === step ? 'step' : undefined} data-passed={index < step || submitted}><span>{index + 1}</span>{label}</li>)}</ol>
          {submitted ? <><p className="atlas-result"><strong>Temuan {work.selected.code} diajukan.</strong><br />Catatan dan status review kini tersedia pada halaman lain proyek ini.</p><button className="atlas-button" type="button" onClick={() => { setStep(0); setSubmitted(false); setNote(''); }}>Periksa rekaman lain</button></> : (
            <form className="atlas-form" onSubmit={(event) => {
              event.preventDefault();
              if (step === 0) { setStep(1); return; }
              if (!note.trim()) return;
              if (step === 1) { setStep(2); return; }
              work.apply({ label: 'Temuan diajukan untuk review', detail: note.trim(), patch: { note: note.trim(), stage: 'review' } });
              setSubmitted(true);
            }}>
              {step === 0 && <RecordSelect work={work} />}
              {step === 1 && <label className="atlas-field"><span>Temuan dan tindak lanjut</span><textarea required rows={5} maxLength={1200} value={note} onChange={(event) => setNote(event.target.value)} /></label>}
              {step === 2 && <div className="atlas-evidence"><strong>{work.selected.code} · {work.selected.title}</strong><p>{note.trim()}</p></div>}
              <div className="atlas-inline">
                {step > 0 && <button className="atlas-button" type="button" onClick={() => setStep(step - 1)}>Kembali</button>}
                <button className="atlas-button" type="submit" data-kind="primary" disabled={step > 0 && !note.trim()}>{step === 2 ? 'Kirim ke review lokal' : 'Lanjut'}</button>
              </div>
            </form>
          )}
        </div>
      </Panel>
      <Inspector work={work} actions={false} notes={false} />
    </div>
  );
}

function MobileView({ work }: { work: Workspace }) {
  const [detail, setDetail] = useState(false);
  return (
    <div className="atlas-split atlas-mobile-layout">
      <Panel title="Kartu rekaman" className="atlas-phone">
        <div className="atlas-pad atlas-stack">
          <div className="atlas-wallet-card"><span className="atlas-code">{work.selected.code} · CONTOH</span><strong>{work.selected.value}</strong><span>{work.selected.title}</span><Badge tone={work.selected.tone}>{work.selected.status}</Badge></div>
          <button className="atlas-button" type="button" aria-expanded={detail} onClick={() => setDetail(!detail)}>{detail ? 'Tutup detail kartu' : 'Lihat detail kartu'}</button>
          {detail && <div className="atlas-stack"><RecordFacts item={work.selected} record={getWork(work.scenario, work.selected.code)} /><PhaseButton work={work} code={work.selected.code} /></div>}
        </div>
      </Panel>
      <Panel title="Riwayat rekaman">
        <div className="atlas-inbox">
          {work.items.map((item) => <button className="atlas-inbox-item" key={item.code} type="button" aria-pressed={item.code === work.selected.code} onClick={() => { work.select(item.code); setDetail(true); }}><span><span className="atlas-code">{item.code}</span><strong>{item.title}</strong></span><span>{item.value}</span></button>)}
        </div>
        <div className="atlas-pad atlas-stack"><Phase stage={getWork(work.scenario, work.selected.code).stage} /><ActivityLog work={work} /></div>
      </Panel>
    </div>
  );
}

function ExchangeView({ work }: { work: Workspace }) {
  const [format, setFormat] = useState<'fields' | 'json'>('fields');
  const item = work.selected;
  const fixture = { id: item.code, title: item.title, description: item.subtitle, value: item.value, status: item.status, ...(item.meta && { reference: item.meta }) };
  return (
    <div className="atlas-split">
      <Panel title="Pembaca snapshot" actions={<Badge>Hanya baca</Badge>}>
        <div className="atlas-pad atlas-stack">
          <p className="atlas-help">Snapshot dibentuk dari rekaman contoh ini. Tidak ada pengiriman permintaan atau koneksi eksternal.</p>
          <RecordSelect work={work} />
          <div className="atlas-inline" role="group" aria-label="Format snapshot">
            <button className="atlas-button" type="button" aria-pressed={format === 'fields'} onClick={() => setFormat('fields')}>Kolom data</button>
            <button className="atlas-button" type="button" aria-pressed={format === 'json'} onClick={() => setFormat('json')}>JSON lokal</button>
          </div>
          {format === 'json' ? <pre className="atlas-json">{JSON.stringify(fixture, null, 2)}</pre> : <RecordFacts item={item} record={getWork(work.scenario, item.code)} />}
          <div><button className="atlas-button" type="button" data-kind="primary" onClick={() => work.apply({ label: 'Snapshot ditinjau', detail: item.title, patch: { stage: 'review' } })} disabled={getWork(work.scenario, item.code).stage === 'review'}>Tandai sudah ditinjau</button></div>
        </div>
      </Panel>
      <Inspector work={work} actions={false} />
    </div>
  );
}

function MatrixView({ work }: { work: Workspace }) {
  return (
    <div className="atlas-split">
      <Panel title="Penanggung jawab tinjauan">
        <div className="atlas-pad atlas-stack"><p className="atlas-help">Penugasan ini hanya catatan skenario; tidak mengubah akses sistem.</p><RecordSelect work={work} /></div>
        <RoleForm key={work.selected.code} work={work} />
      </Panel>
      <Inspector work={work} />
    </div>
  );
}

const roleScopes: Record<Role, readonly string[]> = {
  Operator: ['Lihat rekaman', 'Catat temuan'],
  Penelaah: ['Lihat rekaman', 'Catat temuan', 'Verifikasi bukti'],
  Penyetuju: ['Lihat rekaman', 'Verifikasi bukti', 'Ambil keputusan'],
};

function RoleForm({ work }: { work: Workspace }) {
  const record = getWork(work.scenario, work.selected.code);
  const [role, setRole] = useState<Role | ''>(record.assignedRole ?? '');
  return (
    <form className="atlas-pad atlas-form" onSubmit={(event) => {
      event.preventDefault();
      if (role && role !== record.assignedRole) work.apply({ label: 'Peran penanggung jawab disimpan', detail: role, patch: { assignedRole: role } });
    }}>
      <fieldset className="atlas-role-grid"><legend>Pilih peran skenario</legend>{roles.map((name) => <label className="atlas-role" key={name} data-selected={role === name}><span><input type="radio" name="atlas-role" value={name} checked={role === name} onChange={() => setRole(name)} />{name}</span><small>{roleScopes[name].join(' · ')}</small></label>)}</fieldset>
      <button className="atlas-button" type="submit" data-kind="primary" disabled={!role || role === record.assignedRole}>Simpan penugasan</button>
    </form>
  );
}

function JournalView({ work }: { work: Workspace }) {
  const grams = work.project.id === 'ID-016';
  const unit = grams ? 'g' : 'IDR';
  const format = (amount: number) => grams ? `${numbers.format(amount / 1000)} g` : currency.format(amount);
  const total = work.scenario.journal.reduce((sum, entry) => sum + entry.amount, 0);
  return (
    <div className="atlas-stack">
      <div className="atlas-split">
        <Panel title="Register sumber"><RecordTable work={work} items={work.items} /></Panel>
        <Panel title="Posting jurnal lokal" actions={<Badge>{unit}</Badge>}>
          <JournalForm key={work.selected.code} work={work} format={format} grams={grams} />
        </Panel>
      </div>
      <Panel title="Jurnal yang telah diposting" actions={<Badge tone={total ? 'ok' : 'neutral'}>{total ? 'Debit = kredit' : 'Belum ada posting'}</Badge>}>
        {work.scenario.journal.length === 0 ? <p className="atlas-empty">Pilih rekaman sumber dan buat pasangan debit/kredit pertama.</p> : (
          <div className="atlas-table-scroll">
            <table className="atlas-table atlas-journal">
              <thead><tr><th scope="col">Rekaman / memo</th><th scope="col">Akun</th><th scope="col">Debit</th><th scope="col">Kredit</th></tr></thead>
              {work.scenario.journal.map((entry) => (
                <tbody key={entry.id}><tr><th scope="rowgroup" rowSpan={2}><button type="button" className="atlas-row-button" onClick={() => work.select(entry.code)}><span className="atlas-code">{entry.code} · {datetime.format(new Date(entry.at))}</span><span>{entry.memo}</span></button></th><td>{entry.debit}</td><td>{format(entry.amount)}</td><td>—</td></tr><tr><td>{entry.credit}</td><td>—</td><td>{format(entry.amount)}</td></tr></tbody>
              ))}
              <tfoot><tr><th scope="row" colSpan={2}>Total</th><td>{format(total)}</td><td>{format(total)}</td></tr></tfoot>
            </table>
          </div>
        )}
        <div className="atlas-pad"><ActivityLog work={work} all /></div>
      </Panel>
    </div>
  );
}

function JournalForm({ work, grams, format }: { work: Workspace; grams: boolean; format: (amount: number) => string }) {
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');
  const [size, setSize] = useState('');
  const [memo, setMemo] = useState('');
  const [preview, setPreview] = useState(false);
  const amount = Math.round(Number(size) * (grams ? 1000 : 1));
  const distinct = debit.trim().toLowerCase() !== credit.trim().toLowerCase();
  const ready = debit.trim() && credit.trim() && distinct && Number.isSafeInteger(amount) && amount > 0 && memo.trim();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    if (!preview) { setPreview(true); return; }
    work.apply({ label: 'Pasangan jurnal diposting', detail: `${format(amount)} · ${memo.trim()}`, entry: { debit: debit.trim(), credit: credit.trim(), amount, memo: memo.trim() } });
    setPreview(false); setSize(''); setMemo('');
  };
  return (
    <form className="atlas-pad atlas-form" onSubmit={submit}>
      <p className="atlas-help"><span className="atlas-code">{work.selected.code}</span> · {work.selected.title}</p>
      {preview ? <div className="atlas-evidence"><strong>Pratinjau pasangan seimbang</strong><dl className="atlas-facts"><div><dt>Debit · {debit.trim()}</dt><dd>{format(amount)}</dd></div><div><dt>Kredit · {credit.trim()}</dt><dd>{format(amount)}</dd></div></dl><p>{memo.trim()}</p></div> : (
        <>
          <div className="atlas-form-grid">
            <label className="atlas-field"><span>Akun debit</span><input required value={debit} maxLength={50} onChange={(event) => setDebit(event.target.value)} /></label>
            <label className="atlas-field"><span>Akun kredit</span><input required value={credit} maxLength={50} onChange={(event) => setCredit(event.target.value)} /></label>
          </div>
          {!distinct && debit.trim() && credit.trim() && <p className="atlas-help">Pilih dua akun yang berbeda.</p>}
          <label className="atlas-field"><span>{grams ? 'Berat (g)' : 'Nominal (Rp)'}</span><input type="number" inputMode={grams ? 'decimal' : 'numeric'} required min={grams ? 0.001 : 1} max={999999999999} step={grams ? 0.001 : 1} value={size} onChange={(event) => setSize(event.target.value)} /></label>
          <label className="atlas-field"><span>Memo jurnal</span><input required maxLength={160} value={memo} onChange={(event) => setMemo(event.target.value)} /></label>
        </>
      )}
      <div className="atlas-inline">
        {preview && <button type="button" className="atlas-button" onClick={() => setPreview(false)}>Ubah isian</button>}
        <button className="atlas-button" data-kind="primary" type="submit" disabled={!ready}>{preview ? 'Posting pasangan' : 'Tinjau pasangan'}</button>
      </div>
    </form>
  );
}

function ScheduleView({ work }: { work: Workspace }) {
  const [choice, setChoice] = useState<{ day: number; period: number }>();
  const record = getWork(work.scenario, work.selected.code);
  const booked = (day: number, period: number) => work.items.find((item) => {
    const slot = getWork(work.scenario, item.code).slot;
    return slot?.day === day && slot.period === period;
  });
  const day = choice?.day;
  const period = choice?.period;
  const occupied = day !== undefined && period !== undefined ? booked(day, period) : undefined;
  return (
    <div className="atlas-split">
      <Panel title="Minggu contoh">
        <div className="atlas-pad atlas-stack"><RecordSelect work={work} /><p className="atlas-help">Pilih slot kosong untuk {work.selected.code}. Satu rekaman per slot; jadwal tidak terhubung ke kalender luar.</p></div>
        <div className="atlas-table-scroll">
          <table className="atlas-table atlas-schedule">
            <thead><tr><th scope="col">Slot</th>{days.map((name) => <th key={name} scope="col">{name}</th>)}</tr></thead>
            <tbody>{periods.map((time, row) => <tr key={time}><th scope="row">{time}</th>{days.map((name, col) => {
              const item = booked(col, row);
              return <td key={name}><button type="button" className="atlas-slot" data-booked={!!item} aria-label={`${name} ${time}${item ? ` · ${item.code}` : ' · kosong'}`} aria-pressed={day === col && period === row} onClick={() => setChoice({ day: col, period: row })}>{item ? item.code : '+'}</button></td>;
            })}</tr>)}</tbody>
          </table>
        </div>
        <div className="atlas-pad atlas-stack">
          {choice && <p className="atlas-help">{days[choice.day]} · {periods[choice.period]}{occupied ? ` · sudah ditempati ${occupied.code}` : ' · kosong'}</p>}
          <div className="atlas-inline">
            <button type="button" className="atlas-button" data-kind="primary" disabled={!choice || !!occupied} onClick={() => {
              if (!choice || occupied) return;
              work.apply({ label: 'Slot lokal dijadwalkan', detail: `${days[choice.day]} · ${periods[choice.period]}`, patch: { slot: choice } });
              setChoice(undefined);
            }}>Simpan jadwal</button>
            <button type="button" className="atlas-button" disabled={!record.slot} onClick={() => work.apply({ label: 'Slot lokal dilepas', patch: { slot: undefined } })}>Lepas jadwal rekaman</button>
          </div>
        </div>
      </Panel>
      <Inspector work={work} />
    </div>
  );
}

const allocationRows = [
  ['A1', 'A2', 'A3', 'A4'],
  ['B1', 'B2', 'B3', 'B4'],
  ['C1', 'C2', 'C3', 'C4'],
] as const;

function AllocationView({ work }: { work: Workspace }) {
  const [choice, setChoice] = useState('');
  const allocated = getWork(work.scenario, work.selected.code).allocation;
  const unit = work.project.id === 'ID-100' ? 'Kamar' : 'Kursi';
  const locations = new Map(
    work.items.flatMap((item) => {
      const allocation = getWork(work.scenario, item.code).allocation;
      return allocation ? [[allocation, item.code] as const] : [];
    }),
  );
  const owner = locations.get(choice);
  return (
    <div className="atlas-split">
      <Panel title={`Denah ${unit.toLowerCase()} contoh`} actions={<Badge>{12 - locations.size} kosong</Badge>}>
        <div className="atlas-pad atlas-stack">
          <RecordSelect work={work} />
          <p className="atlas-help">Alokasikan satu {unit.toLowerCase()} per rekaman. Tempat ini tidak terhubung ke inventaris atau pemesanan nyata.</p>
          <div className="atlas-allocation" role="group" aria-label={`Denah ${unit.toLowerCase()}`}>
            {allocationRows.flatMap((row) => row.map((location) => <button
              key={location}
              type="button"
              className="atlas-slot"
              data-booked={locations.has(location)}
              aria-label={`${unit} ${location} · ${locations.get(location) ?? 'kosong'}`}
              aria-pressed={choice === location}
              onClick={() => setChoice(location)}
            ><strong>{location}</strong><small>{locations.get(location) ?? 'Kosong'}</small></button>))}
          </div>
          {choice && <p className="atlas-help">{unit} {choice} · {owner ? `dialokasikan untuk ${owner}` : `siap dialokasikan ke ${work.selected.code}`}</p>}
          <div className="atlas-inline">
            <button type="button" className="atlas-button" data-kind="primary" disabled={!choice || !!owner} onClick={() => {
              if (!choice || owner) return;
              work.apply({ label: allocated ? 'Alokasi lokal dipindahkan' : 'Alokasi lokal disimpan', detail: `${unit} ${choice}`, patch: { allocation: choice } });
            }}>Simpan alokasi</button>
            <button type="button" className="atlas-button" disabled={!allocated} onClick={() => work.apply({ label: 'Alokasi lokal dilepas', detail: `${unit} ${allocated}`, patch: { allocation: undefined } })}>Lepas alokasi rekaman</button>
          </div>
          <ActivityLog work={work} all />
        </div>
      </Panel>
      <Inspector work={work} actions={false} />
    </div>
  );
}

function CalculatorView({ work, model }: { work: Workspace; model: 'tax' | 'margin' }) {
  return <div className="atlas-split"><Panel title="Masukan dan hasil perhitungan"><div className="atlas-pad atlas-stack"><RecordSelect work={work} /><CalculatorForm key={work.selected.code} work={work} model={model} /></div></Panel><Inspector work={work} actions={false} /></div>;
}

function CalculatorForm({ work, model }: { work: Workspace; model: 'tax' | 'margin' }) {
  const [base, setBase] = useState(model === 'margin' ? work.selected.value.replace(/[^0-9]/g, '') : '');
  const [rate, setRate] = useState(model === 'tax' ? '10' : '8');
  const [cost, setCost] = useState('');
  const [result, setResult] = useState<{ rows: [string, string][]; detail: string }>();
  const update = (setter: (value: string) => void, value: string) => { setter(value); setResult(undefined); };
  const run = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(base);
    const percentage = Number(rate);
    const fee = Math.round(amount * percentage / 100);
    const total = Number(cost);
    const rows: [string, string][] = model === 'tax' ? [
      ['Nominal dasar', currency.format(amount)], ['Pembanding 20%', currency.format(Math.round(amount * 0.2))],
      [`Tarif contoh ${numbers.format(percentage)}%`, currency.format(fee)], ['Selisih dari pembanding', currency.format(Math.round(amount * 0.2) - fee)],
    ] : [
      ['Harga jual', currency.format(amount)], ['Biaya produk', currency.format(total)], ['Biaya kanal', currency.format(fee)],
      ['Margin bersih', `${currency.format(amount - total - fee)} (${numbers.format((amount - total - fee) / amount * 100)}%)`],
    ];
    setResult({ rows, detail: rows.map(([name, value]) => `${name}: ${value}`).join(' · ') });
  };
  return (
    <form className="atlas-form" onSubmit={run}>
      <p className="atlas-help">{model === 'tax' ? 'Bandingkan tarif hipotetis dengan tarif contoh 20%. Ini bukan penetapan pajak.' : 'Kurangi biaya produk dan persentase biaya kanal dari harga jual. Isian biaya tidak berasal dari kanal eksternal.'}</p>
      <label className="atlas-field"><span>{model === 'tax' ? 'Nominal dasar (Rp)' : 'Harga jual (Rp)'}</span><input type="number" inputMode="numeric" required min={1} max={999999999999} value={base} onChange={(event) => update(setBase, event.target.value)} /></label>
      <label className="atlas-field"><span>{model === 'tax' ? 'Tarif skenario (%)' : 'Biaya kanal (%)'}</span><input type="number" inputMode="decimal" required min={0} max={100} step={0.01} value={rate} onChange={(event) => update(setRate, event.target.value)} /></label>
      {model === 'margin' && <label className="atlas-field"><span>Biaya produk (Rp)</span><input type="number" inputMode="numeric" required min={0} max={999999999999} value={cost} onChange={(event) => update(setCost, event.target.value)} /></label>}
      <button className="atlas-button" data-kind="primary" type="submit">Hitung skenario</button>
      {result && <div className="atlas-evidence atlas-stack" aria-live="polite"><dl className="atlas-facts">{result.rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><button className="atlas-button" type="button" disabled={getWork(work.scenario, work.selected.code).calculation === result.detail} onClick={() => work.apply({ label: 'Hasil perhitungan disimpan', detail: result.detail, patch: { calculation: result.detail } })}>Simpan hasil perhitungan</button></div>}
    </form>
  );
}
