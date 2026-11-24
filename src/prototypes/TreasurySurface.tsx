import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode, Ref } from 'react';
import type { ProjectPageSpec } from '../data/projectPages';
import {
  applyCommand, assumptionFields, bankPosition, banks, batch, batchStages, canFundBatch, cashPosition, cashTimes,
  connectorEvents, cutoffOrder, dataAge, exactUnposted, fundingBank, initialState, intradayCash, invoiceOptions,
  projectLiquidity, receiptCash, receipts, restoreState, roleOrder, roles, SNAPSHOT, STORAGE_KEY, transfers, validAssumption,
} from './treasury-model';
import type { Bank, Command, Receipt, Role, TreasuryState } from './treasury-model';
import './treasury-surface.css';

type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'accent';
type Assumptions = TreasuryState['assumptions'];
type RunCommand = (command: Command) => void;
const integer = new Intl.NumberFormat('id-ID');
const billion = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tickFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const idr = (amount: number) => `${amount < 0 ? '-' : ''}Rp ${integer.format(Math.abs(amount))}`;
const compact = (amount: number) => `${amount < 0 ? '-' : ''}Rp ${billion.format(Math.abs(amount) / 1e9)} miliar`;
const usd = (amount: number) => `USD ${integer.format(amount)}`;
const signed = (amount: number) => `${amount > 0 ? '+' : ''}${idr(amount)}`;

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className="treasury-badge" data-tone={tone}>{children}</span>;
}

function Panel({ title, meta, children, headingRef }: { title: string; meta?: ReactNode; children: ReactNode; headingRef?: Ref<HTMLHeadingElement> }) {
  const labelId = useId();
  return <section className="treasury-panel" aria-labelledby={labelId}>
    <header className="treasury-panel-header">
      <h2 id={labelId} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>{title}</h2>
      {meta && <div className="treasury-panel-meta">{meta}</div>}
    </header>
    {children}
  </section>;
}

function Metric({ label, value, note, tone }: { label: string; value: ReactNode; note: ReactNode; tone?: Tone }) {
  return <div className="treasury-metric" data-tone={tone}>
    <dt>{label}</dt><dd>{value}</dd><dd className="treasury-metric-note">{note}</dd>
  </div>;
}

function Fields({ items }: { items: [string, ReactNode][] }) {
  return <dl className="treasury-fields">
    {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
}

type Column = readonly [label: string, numeric?: true];

function DataTable({ label, columns, children }: { label: string; columns: readonly Column[]; children: ReactNode }) {
  return <>
    <p className="treasury-scroll-note">Geser tabel untuk melihat kolom lain.</p>
    <div className="treasury-table-wrap" tabIndex={0} role="region" aria-label={label}>
      <table className="treasury-table">
        <thead><tr>{columns.map(([title, numeric]) => <th key={title} scope="col" data-numeric={numeric}>{title}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </>;
}

function DataRow({ columns, cells, selected }: { columns: readonly Column[]; cells: ReactNode[]; selected?: boolean }) {
  return <tr data-selected={selected || undefined}>{cells.map((cell, index) => index === 0
    ? <th scope="row" key={columns[index][0]}>{cell}</th>
    : <td key={columns[index][0]} data-numeric={columns[index][1]}>{cell}</td>)}</tr>;
}

function InspectButton({ children, selected, onClick, label }: { children: ReactNode; selected: boolean; onClick: () => void; label: string }) {
  return <button type="button" className="treasury-inspect" aria-label={label} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

function AuditTrail({ state, type }: { state: TreasuryState; type: 'batch' | 'receipt' }) {
  const events = state.audit.map((entry, index) => ({ ...entry, sequence: index + 1 })).filter(event => event.type === type).reverse();
  return <Panel title={type === 'batch' ? 'Audit otorisasi' : 'Jurnal rekonsiliasi'} meta={`${events.length} tindakan lokal`}>
    {events.length === 0
      ? <p className="treasury-empty">{type === 'batch' ? 'Belum ada tindakan atas batch.' : 'Belum ada posting ke ERP lokal.'}</p>
      : <ol className="treasury-audit">{events.map(event => <li key={event.sequence}>
        <span className="treasury-code">#{String(event.sequence).padStart(2, '0')}</span>
        <div><strong>{event.actor} | {event.subject}</strong><p>{event.description}</p></div>
      </li>)}</ol>}
  </Panel>;
}

interface PlotSeries { label: string; values: number[]; color: 'base' | 'stress' }

function LiquidityChart({ labels, series, floor, caption }: { labels: readonly string[]; series: PlotSeries[]; floor?: number; caption: string }) {
  const points = series.flatMap(line => line.values);
  if (floor !== undefined) points.push(floor);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const step = Math.max(250_000_000, Math.ceil((max - min) / 750_000_000) * 250_000_000);
  const lower = Math.floor(min / step) * step;
  const upper = Math.max(lower + step, Math.ceil(max / step) * step);
  const ticks = Array.from({ length: (upper - lower) / step + 1 }, (_, index) => lower + index * step);
  const x = (index: number) => 53 + (499 * index) / (labels.length - 1);
  const y = (value: number) => 140 - ((value - lower) * 126) / (upper - lower);
  return <figure className="treasury-chart">
    <svg viewBox="0 0 578 174" aria-hidden="true" focusable="false">
      {ticks.map(value => <g key={value}>
        <line className="treasury-chart-grid" x1="53" x2="552" y1={y(value)} y2={y(value)} />
        <text className="treasury-chart-label" x="44" y={y(value) + 5} textAnchor="end">{tickFormat.format(value / 1e9)}</text>
      </g>)}
      {labels.map((label, index) => (labels.length <= 6 || index % 2 === 0) && <text className="treasury-chart-label" key={label} x={x(index)} y="165" textAnchor="middle">{label}</text>)}
      {floor !== undefined && <line className="treasury-chart-floor" x1="53" x2="552" y1={y(floor)} y2={y(floor)} />}
      {series.map(line => <g className="treasury-series" data-series={line.color} key={line.color}>
        <polyline points={line.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')} />
        {line.values.map((value, index) => <circle key={labels[index]} cx={x(index)} cy={y(value)} r="3.7" />)}
      </g>)}
    </svg>
    <figcaption>
      <div className="treasury-chart-legend">{series.map(line => <span className="treasury-series" data-series={line.color} key={line.color}>{line.label}</span>)}
        {floor !== undefined && <span className="treasury-series" data-series="floor">Buffer minimum</span>}
      </div>
      <span>{caption}</span>
    </figcaption>
  </figure>;
}

const cashColumns = [['Bank / akun'], ['Jalur'], ['Saldo buku IDR', true], ['Tersedia IDR', true], ['Saldo USD', true]] as const;

const intradayColumns = [['Waktu WIB'], ['Saldo buku IDR', true]] as const;

function CashPage({ state }: { state: TreasuryState }) {
  const [channel, setChannel] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [bankName, setBankName] = useState<Bank['name']>('Mandiri');
  const inspection = useRef<HTMLHeadingElement>(null);
  const visibleBanks = banks.filter(bank => (channel === 'all' || bank.channel === channel) && (currency === 'all' || bank.usd > 0));
  const selected = visibleBanks.find(bank => bank.name === bankName) ?? visibleBanks[0];
  const cash = cashPosition(state.stage);
  const chart = intradayCash(state.stage);
  const selectedPosition = bankPosition(selected, state.stage);
  const stage = batchStages[state.stage];
  return <>
    <dl className="treasury-metrics">
      <Metric label="Saldo buku | IDR" value={compact(cash.booked)} note={`${banks.length} bank | ${idr(cash.booked)}`} />
      <Metric label="Dana operasional" value={compact(cash.available)} note={`${idr(cash.holds)} ditahan bank`} tone="accent" />
      <Metric label="Saldo kas | USD" value={usd(cash.usd)} note={`Setara ${idr(cash.usd * state.assumptions.rate)}`} />
      <Metric label={`Batch ${batch.ref}`} value={idr(batch.debit)} note={<Badge tone={stage.tone}>{stage.label}</Badge>} />
    </dl>
    <div className="treasury-split">
      <div className="treasury-stack">
        <Panel title="Posisi rekening" meta={`${visibleBanks.length} dari ${banks.length} bank`}>
          <div className="treasury-toolbar">
            <label>Jalur konektor<select value={channel} onChange={event => setChannel(event.target.value)}>
              <option value="all">Semua jalur</option><option>SNAP BI</option><option>File H2H</option>
            </select></label>
            <label>Mata uang<select value={currency} onChange={event => setCurrency(event.target.value)}>
              <option value="all">Semua rekening</option><option value="USD">Punya saldo USD</option>
            </select></label>
          </div>
          <DataTable label="Saldo rekening multi-bank" columns={cashColumns}>
            {visibleBanks.map(bank => {
              const position = bankPosition(bank, state.stage);
              return <DataRow key={bank.name} columns={cashColumns} selected={selected.name === bank.name} cells={[
                <><InspectButton label={`Periksa rekening ${bank.name}`} selected={selected.name === bank.name} onClick={() => { setBankName(bank.name); inspection.current?.focus(); }}>{bank.name}</InspectButton><small>{bank.account}</small></>,
                bank.channel, idr(position.booked), idr(position.available), bank.usd ? usd(bank.usd) : '-',
              ]} />;
            })}
          </DataTable>
        </Panel>
        <Panel title="Pergerakan kas intrahari" meta="IDR miliar">
          <LiquidityChart labels={cashTimes} series={[{ label: 'Saldo buku', values: chart, color: 'base' }]}
            caption={`${cashTimes[0]} ${idr(chart[0])} ke ${cashTimes[cashTimes.length - 1]} ${idr(cash.booked)}`} />
          <details className="treasury-chart-details">
            <summary>Lihat data saldo intrahari</summary>
            <DataTable label="Data saldo buku intrahari" columns={intradayColumns}>
              {cashTimes.map((time, index) => <DataRow key={time} columns={intradayColumns} cells={[time, idr(chart[index])]} />)}
            </DataTable>
          </details>
        </Panel>
      </div>
      <aside className="treasury-stack" aria-label="Detail rekening dan cutoff">
        <Panel title="Inspektor rekening" meta={selected.channel} headingRef={inspection}>
          <div className="treasury-padded">
            <div className="treasury-keyline"><span className="treasury-code">{selected.name} {selected.account}</span><strong>{idr(selectedPosition.available)}</strong><p>Dana bebas pakai saat ini</p></div>
            <Fields items={[
              ['Saldo buku IDR', idr(selectedPosition.booked)], ['Ditahan bank', idr(selected.hold)],
              ['Cadangan BI-FAST', idr(selectedPosition.reserve)], ['Saldo USD', selected.usd ? usd(selected.usd) : '-'],
              ['Posisi sumber', `${selected.stamp} WIB`], ['Cutoff simulasi', `${selected.cutoff} WIB`],
            ]} />
            {selected.name === fundingBank.name && <p className="treasury-note">{state.stage === 'released'
              ? `${idr(batch.debit)} telah didebit dari Mandiri dalam simulasi.`
              : `Dana bebas pakai setelah batch dirilis: ${idr(selectedPosition.freeBeforeReserve - batch.debit)}.`}</p>}
          </div>
        </Panel>
        <Panel title="Batas pemrosesan" meta="WIB">
          <ul className="treasury-cutoffs">{cutoffOrder.map(bank => <li key={bank.name}>
            <time>{bank.cutoff}</time><div><strong>{bank.name}</strong><small>{bank.channel}</small></div>
            <Badge tone={bank.channel === 'File H2H' ? 'warn' : 'ok'}>{bank.channel === 'File H2H' ? 'Berkala' : 'Intrahari'}</Badge>
          </li>)}</ul>
        </Panel>
      </aside>
    </div>
  </>;
}

const receiptColumns = [['Mutasi VA'], ['Bank / waktu'], ['Faktur ERP'], ['Kredit kas', true], ['Status']] as const;
const receiptStatus = {
  posted: { label: 'Diposting', tone: 'ok' },
  exact: { label: 'Cocok tepat', tone: 'accent' },
  missing: { label: 'Tanpa faktur', tone: 'bad' },
  variance: { label: 'Selisih', tone: 'warn' },
} as const;

function getReceiptStatus(receipt: Receipt, state: TreasuryState) {
  if (state.posts[receipt.ref]) return 'posted';
  if (receipt.invoiceRef === null) return 'missing';
  return receipt.paid === receipt.expected ? 'exact' : 'variance';
}

function ReceiptDetail({ receipt, state, run }: { receipt: Receipt; state: TreasuryState; run: RunCommand }) {
  const [invoiceRef, setInvoiceRef] = useState(receipt.invoiceRef ?? '');
  const [note, setNote] = useState('');
  const post = state.posts[receipt.ref];
  const options = invoiceOptions(receipt, state);
  const invoice = post?.invoice ?? options.find(option => option.ref === invoiceRef);
  const difference = invoice ? receipt.paid - invoice.amount : null;
  const manual = receipt.expected !== receipt.paid;
  return <div className="treasury-padded">
    <div className="treasury-keyline"><span className="treasury-code">{receipt.ref} / {receipt.bank}</span><strong>{receipt.payer}</strong><p>{receipt.time} WIB | Kredit sudah tercermin di saldo bank.</p></div>
    {!post && <p className="treasury-note" data-tone={manual ? 'warn' : undefined}>{receipt.invoiceRef === null
      ? 'Referensi faktur belum ditemukan. Pilih piutang pembayar ini sebelum memposting.'
      : manual ? 'Nominal berbeda. Kurang bayar menyisakan piutang; lebih bayar menjadi kredit belum dialokasikan.'
        : 'Referensi dan nominal cocok. Posting melunasi piutang tanpa menambah saldo bank lagi.'}</p>}
    <Fields items={[
      ['Kredit dari bank', idr(receipt.paid)],
      ['Nilai faktur', invoice ? idr(invoice.amount) : '-'],
      ['Kredit - faktur', difference === null ? '-' : signed(difference)],
      ...(post ? [
        ['Faktur ERP', post.invoice.ref], ['Dialokasikan', idr(post.applied)],
        ['Sisa piutang', idr(post.remaining)], ['Kredit belum dialokasikan', idr(post.unapplied)],
      ] as [string, ReactNode][] : []),
    ]} />
    {post ? <p className="treasury-note" data-tone="ok"><strong>Catatan jurnal:</strong> {post.note}</p> : <form className="treasury-form" onSubmit={event => {
      event.preventDefault();
      if (invoice) run({ type: 'post', receiptRef: receipt.ref, invoiceRef: invoice.ref, note });
    }}>
      {receipt.invoiceRef === null ? <label>Faktur ERP<select required value={invoiceRef} onChange={event => setInvoiceRef(event.target.value)}>
        <option value="">Pilih faktur...</option>{options.map(option => <option key={option.ref} value={option.ref}>{option.ref} | {idr(option.amount)}</option>)}
      </select></label> : <p>Faktur ERP: <span className="treasury-code">{receipt.invoiceRef}</span></p>}
      {manual && <label>Catatan keputusan<textarea required maxLength={200} rows={2} value={note} onChange={event => setNote(event.target.value)} /></label>}
      <button type="submit" className="treasury-button primary" disabled={!invoice || (manual && !note.trim())}>Posting ke ERP lokal</button>
    </form>}
  </div>;
}

function ReconciliationPage({ state, run }: { state: TreasuryState; run: RunCommand }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeRef, setActiveRef] = useState('VA-9919');
  const inspection = useRef<HTMLHeadingElement>(null);
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = receipts.filter(receipt => {
    const status = getReceiptStatus(receipt, state);
    const post = state.posts[receipt.ref];
    const searchable = `${receipt.ref} ${receipt.payer} ${receipt.bank} ${post?.invoice.ref ?? receipt.invoiceRef ?? ''}`.toLowerCase();
    return terms.every(term => searchable.includes(term)) && (filter === 'all' || filter === status || (filter === 'exceptions' && (status === 'missing' || status === 'variance')));
  });
  const selected = visible.find(receipt => receipt.ref === activeRef) ?? visible[0];
  const posted = Object.values(state.posts);
  const exactCount = exactUnposted(state).length;
  const openExceptions = receipts.length - posted.length - exactCount;
  const applied = posted.reduce((total, post) => total + post.applied, 0);
  return <>
    <dl className="treasury-metrics">
      <Metric label="Mutasi masuk" value={idr(receiptCash)} note={`${receipts.length} kredit kas | VA-1811`} />
      <Metric label="Dialokasikan ke piutang" value={idr(applied)} note={`${posted.length} mutasi diposting ke ERP`} tone="ok" />
      <Metric label="Cocok tanpa selisih" value={exactCount} note="Siap diposting otomatis" tone="accent" />
      <Metric label="Eksepsi terbuka" value={openExceptions} note="Butuh pemeriksaan atau faktur" tone={openExceptions ? 'warn' : 'ok'} />
    </dl>
    <div className="treasury-split">
      <div className="treasury-stack">
        <Panel title="Mutasi masuk / VA-1811" meta={`${visible.length} dari ${receipts.length} mutasi`}>
          <div className="treasury-toolbar">
            <label className="treasury-grow">Cari mutasi VA<input type="search" value={search} placeholder="VA, pembayar, bank, faktur" onChange={event => setSearch(event.target.value)} /></label>
            <label>Status mutasi<select value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="all">Semua status</option><option value="exceptions">Semua eksepsi</option><option value="exact">Cocok tepat</option>
              <option value="missing">Tanpa faktur</option><option value="variance">Selisih</option><option value="posted">Diposting</option>
            </select></label>
          </div>
          <div className="treasury-toolbar treasury-bulk">
            <button type="button" className="treasury-button secondary" disabled={!exactCount} onClick={() => run({ type: 'auto-post' })}>Posting semua cocok tepat ({exactCount})</button>
            <p>Berlaku untuk seluruh batch VA, bukan hanya hasil filter. Eksepsi tetap ditahan.</p>
          </div>
          {visible.length ? <DataTable label="Mutasi dan piutang Virtual Account" columns={receiptColumns}>
            {visible.map(receipt => {
              const status = receiptStatus[getReceiptStatus(receipt, state)];
              const isSelected = selected?.ref === receipt.ref;
              return <DataRow key={receipt.ref} columns={receiptColumns} selected={isSelected} cells={[
                <><InspectButton label={`Periksa ${receipt.ref}`} selected={isSelected} onClick={() => { setActiveRef(receipt.ref); inspection.current?.focus(); }}>{receipt.ref}</InspectButton><small>{receipt.payer}</small></>,
                <>{receipt.bank}<small>{receipt.time}</small></>, state.posts[receipt.ref]?.invoice.ref ?? receipt.invoiceRef ?? '-', idr(receipt.paid),
                <Badge tone={status.tone}>{status.label}</Badge>,
              ]} />;
            })}
          </DataTable> : <p className="treasury-empty">Tidak ada mutasi untuk pencarian dan filter ini.</p>}
        </Panel>
        <AuditTrail state={state} type="receipt" />
      </div>
      <aside aria-label="Detail mutasi VA">
        <Panel title="Inspektor rekonsiliasi" headingRef={inspection} meta={selected && <Badge tone={receiptStatus[getReceiptStatus(selected, state)].tone}>{receiptStatus[getReceiptStatus(selected, state)].label}</Badge>}>
          {selected ? <ReceiptDetail key={selected.ref} receipt={selected} state={state} run={run} /> : <p className="treasury-empty">Pilih mutasi setelah menyesuaikan pencarian.</p>}
        </Panel>
      </aside>
    </div>
  </>;
}

const transferColumns = [['Faktur / vendor'], ['Bank tujuan'], ['Pokok', true], ['Status instruksi']] as const;

function PayoutPage({ state, run }: { state: TreasuryState; run: RunCommand }) {
  const [role, setRole] = useState<Role>('maker');
  const [confirmed, setConfirmed] = useState(false);
  const authorization = useRef<HTMLHeadingElement>(null);
  const status = batchStages[state.stage];
  const position = bankPosition(fundingBank, state.stage);
  const afterRelease = position.freeBeforeReserve - (state.stage === 'released' ? 0 : batch.debit);
  const actionable = status.role === role;
  return <>
    <ol className="treasury-steps" aria-label="Tahapan otorisasi BI-FAST">
      {roleOrder.map((key, index) => {
        const actor = roles[key];
        const done = index < status.count;
        const active = index === status.count;
        return <li key={key} data-active={active || undefined} aria-current={active ? 'step' : undefined}>
          <span className="treasury-code">0{index + 1} / {actor.label}</span><strong>{actor.person} | {actor.team}</strong>
          <Badge tone={done ? 'ok' : active ? 'accent' : 'neutral'}>{done ? 'Selesai' : active ? 'Giliran saat ini' : 'Menunggu'}</Badge>
        </li>;
      })}
    </ol>
    <dl className="treasury-metrics">
      <Metric label="Total debit batch" value={idr(batch.debit)} note={`${transfers.length} instruksi | termasuk biaya`} />
      <Metric label="Dana bebas pakai Mandiri" value={idr(position.available)} note={`${idr(position.reserve)} cadangan batch`} tone="accent" />
      <Metric label="Dana setelah rilis" value={idr(afterRelease)} note={state.stage === 'released' ? 'Sudah diposting ke saldo lokal' : 'Proyeksi jika seluruh batch dirilis'} />
      <Metric label="Status batch" value={<Badge tone={status.tone}>{status.label}</Badge>} note={`Cutoff Mandiri ${fundingBank.cutoff} WIB`} />
    </dl>
    <div className="treasury-split treasury-split-leading">
      <aside className="treasury-stack" aria-label="Kontrol dan audit BI-FAST">
        <Panel title="Otorisasi simulasi" headingRef={authorization} meta={<Badge tone={status.tone}>{status.label}</Badge>}>
          <div className="treasury-padded">
            <p>Maker mencadangkan dana. Checker mengesahkan instruksi. Releaser mengubah cadangan menjadi debit lokal.</p>
            <Fields items={[
              ['Saldo buku Mandiri', idr(position.booked)], ['Ditahan bank', idr(fundingBank.hold)], ['Cadangan batch', idr(position.reserve)],
              ['Cutoff dan dana', canFundBatch() ? 'Lolos pemeriksaan' : 'Tidak memenuhi syarat'],
            ]} />
            {state.stage === 'released' ? <p className="treasury-note" data-tone="ok">Debit selesai. Batch ini tidak dapat dirilis ulang. Tidak ada dana atau instruksi yang dikirim ke bank.</p>
              : <div className="treasury-form">
                <label>Peran simulasi<select value={role} onChange={event => { setRole(event.target.value as Role); setConfirmed(false); }}>
                  {roleOrder.map(key => <option key={key} value={key}>{roles[key].label} | {roles[key].person}</option>)}
                </select></label>
                {!actionable && status.role && <p className="treasury-note">Pilih {roles[status.role].label} | {roles[status.role].person} untuk menjalankan tahap ini.</p>}
                {state.stage === 'draft' && <button type="button" className="treasury-button primary" disabled={!actionable || !canFundBatch()} onClick={() => {
                  if (role === 'maker') { run({ type: 'submit', role }); authorization.current?.focus(); }
                }}>Ajukan batch</button>}
                {state.stage === 'review' && <div className="treasury-actions">
                  <button type="button" className="treasury-button primary" disabled={!actionable} onClick={() => {
                    if (role === 'checker') { run({ type: 'approve', role }); authorization.current?.focus(); }
                  }}>Setujui batch</button>
                  <button type="button" className="treasury-button secondary" disabled={!actionable} onClick={() => {
                    if (role === 'checker') { run({ type: 'return', role }); authorization.current?.focus(); }
                  }}>Kembalikan ke Maker</button>
                </div>}
                {state.stage === 'ready' && <>
                  <label className="treasury-checkbox"><input type="checkbox" checked={confirmed} disabled={!actionable} onChange={event => setConfirmed(event.target.checked)} />Saya konfirmasi debit lokal {idr(batch.debit)}.</label>
                  <button type="button" className="treasury-button primary" disabled={!actionable || !confirmed || !canFundBatch()} onClick={() => {
                    if (role === 'releaser' && confirmed) { run({ type: 'release', role, confirmed: true }); authorization.current?.focus(); }
                  }}>Rilis batch lokal</button>
                </>}
              </div>}
          </div>
        </Panel>
        <AuditTrail state={state} type="batch" />
      </aside>
      <Panel title={`${batch.ref} / Instruksi BI-FAST`} meta={`Sumber: Mandiri ${fundingBank.account}`}>
        <DataTable label="Instruksi pembayaran vendor" columns={transferColumns}>
          {transfers.map(transfer => <DataRow key={transfer.ref} columns={transferColumns} cells={[
            <>{transfer.ref}<small>{transfer.vendor}</small></>, transfer.bank, idr(transfer.amount), <Badge tone={status.tone}>{status.label}</Badge>,
          ]} />)}
        </DataTable>
        <div className="treasury-panel-footer"><p>{idr(batch.principal)} pokok + {idr(batch.fees)} biaya ({idr(batch.feePerInstruction)} per instruksi).</p></div>
      </Panel>
    </div>
  </>;
}

const connectorColumns = [['Konektor'], ['Kanal'], ['Posisi terakhir'], ['Usia / ambang'], ['Status']] as const;

function ConnectivityPage() {
  const [bankName, setBankName] = useState<Bank['name']>('OCBC');
  const [eventId, setEventId] = useState('');
  const inspection = useRef<HTMLHeadingElement>(null);
  const bank = banks.find(candidate => candidate.name === bankName) ?? banks[4];
  const isFile = bank.channel === 'File H2H';
  const events = connectorEvents(bank);
  const event = events.find(entry => entry.id === eventId) ?? events[0];
  return <>
    <dl className="treasury-metrics">
      <Metric label="Jalur SNAP BI" value="4 bank" note="Respons saldo REST | contoh lokal" />
      <Metric label="File host-to-host" value="1 bank" note="OCBC | contoh file terjadwal" />
      <Metric label="Konektor dalam SLA" value={`${banks.filter(item => dataAge(item) <= item.maxAge).length} / ${banks.length}`} note="Usia dihitung dari waktu snapshot" tone="ok" />
      <Metric label="Mode jaringan" value="Nonaktif" note="Tidak memanggil API atau server bank" tone="accent" />
    </dl>
    <div className="treasury-split">
      <div className="treasury-stack">
        <Panel title="Inventaris jalur saldo" meta="Snapshot POS-1811-1433">
          <DataTable label="Konektor bank dan pemantauan SLA" columns={connectorColumns}>
            {banks.map(item => {
              const age = dataAge(item);
              const withinSla = age <= item.maxAge;
              return <DataRow key={item.name} columns={connectorColumns} selected={item.name === bank.name} cells={[
                <InspectButton label={`Periksa konektor ${item.name}`} selected={item.name === bank.name} onClick={() => { setBankName(item.name); setEventId(''); inspection.current?.focus(); }}>{item.name}</InspectButton>,
                item.channel, `${item.stamp} WIB`, `${age} / ${item.maxAge} dtk`, <Badge tone={withinSla ? 'ok' : 'warn'}>{withinSla ? 'Dalam SLA' : 'Lewat SLA'}</Badge>,
              ]} />;
            })}
          </DataTable>
        </Panel>
        <Panel title={`Jejak ingest / ${bank.name}`} meta={`${events.length} kejadian lokal`}>
          <ul className="treasury-event-list">{events.map(entry => <li key={entry.id}>
            <button type="button" className="treasury-event" aria-pressed={event.id === entry.id} onClick={() => { setEventId(entry.id); inspection.current?.focus(); }}>
              <time>{entry.time}</time><span><strong>{entry.title}</strong><small>{entry.artifact}</small></span><Badge tone={entry.tone}>{entry.result}</Badge>
            </button>
          </li>)}</ul>
        </Panel>
      </div>
      <aside aria-label="Detail konektor dan bukti kontrol">
        <Panel title="Inspektor konektivitas" meta={bank.channel} headingRef={inspection}>
          <div className="treasury-padded">
            <div className="treasury-keyline"><span className="treasury-code">{bank.name} / {event.artifact}</span><strong>{event.title}</strong><p>{event.time} WIB | {event.result}</p></div>
            <p className="treasury-note" data-tone={event.tone}>{event.detail}</p>
            <Fields items={[
              ['Sumber saldo', isFile ? 'File saldo H2H' : 'Ringkasan SNAP BI'],
              ['Kontrol tercatat', isFile ? 'Manifest, integritas dan deduplikasi' : 'Identitas, tanda tangan dan usia data'],
              ['Usia snapshot', `${dataAge(bank)} dtk dari ambang ${bank.maxAge} dtk`],
              ['Dampak ke snapshot', event.tone === 'warn' ? 'Tidak ada perubahan' : 'POS-1811-1433'],
            ]} />
            <p>Akses perubahan konfigurasi dan material kunci tidak tersedia di prototipe ini.</p>
          </div>
        </Panel>
      </aside>
    </div>
  </>;
}

const forecastColumns = [['Hari kerja'], ['Masuk', true], ['Keluar', true], ['Tertunda', true], ['Kas dasar', true], ['Kas stres', true]] as const;
const fxColumns = [['Kurs USD/IDR'], ['Ekuivalen IDR', true], ['Perubahan IDR', true]] as const;

function ForecastPage({ state, onSave }: { state: TreasuryState; onSave: (assumptions: Assumptions) => void }) {
  const model = projectLiquidity(state);
  const { rate, shock } = state.assumptions;
  const [draft, setDraft] = useState(() => Object.fromEntries(assumptionFields.map(field => [field.key, String(state.assumptions[field.key])])));
  const [error, setError] = useState('');
  function applyAssumptions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const changes = { ...state.assumptions };
    for (const field of assumptionFields) {
      const value = Number(draft[field.key]);
      if (!draft[field.key]?.trim() || !validAssumption(field, value)) {
        setError(`${field.label} harus berupa angka bulat antara ${integer.format(field.min)} dan ${integer.format(field.max)}.`);
        return;
      }
      changes[field.key] = value;
    }
    setError('');
    onSave(changes);
  }
  const openingNote = state.stage === 'released' ? 'Setelah debit BI-FAST diposting' : state.stage === 'draft' ? 'Tidak termasuk batch yang masih draf' : 'Sebelum pencairan cadangan D+0';
  return <>
    <dl className="treasury-metrics">
      <Metric label="Kas IDR awal" value={compact(model.opening)} note={openingNote} />
      <Metric label="Buffer minimum" value={compact(model.floor)} note="Batas kas internal dari skenario" />
      <Metric label="Titik terendah | stres" value={compact(model.trough.stress)} note={`${model.trough.date} | penerimaan tertunda`} tone={model.gap ? 'warn' : 'ok'} />
      <Metric label="Dana tambahan" value={idr(model.gap)} note={model.firstBreach ? `Di bawah buffer mulai ${model.firstBreach.date}` : 'Kas stres tetap di atas atau sama dengan buffer'} tone={model.gap ? 'bad' : 'ok'} />
    </dl>
    <div className="treasury-split treasury-split-leading">
      <aside className="treasury-stack" aria-label="Asumsi dan sensitivitas USD">
        <Panel title="Asumsi skenario" meta="Dapat disesuaikan">
          <form className="treasury-padded treasury-form" onSubmit={applyAssumptions}>
            {assumptionFields.map(field => <label key={field.key}>{field.label}<input type="number" inputMode="numeric" required min={field.min} max={field.max} step={1}
              value={draft[field.key]} onChange={event => { const value = event.target.value; setDraft(current => ({ ...current, [field.key]: value })); }} /></label>)}
            <button type="submit" className="treasury-button primary">Terapkan asumsi</button>
            {error && <p role="alert" className="treasury-note" data-tone="bad">{error}</p>}
          </form>
        </Panel>
        <Panel title="Sensitivitas nilai kas USD" meta={usd(model.usd)}>
          <DataTable label="Kurs USD dan ekuivalen rupiah" columns={fxColumns}>
            {[-shock, 0, shock].map((change, index) => <DataRow key={index} columns={fxColumns} selected={index === 1} cells={[
              <>{integer.format(rate + change)}<small>{['Kurs turun', 'Kurs dasar', 'Kurs naik'][index]}</small></>, idr(model.usd * (rate + change)), signed(model.usd * change),
            ]} />)}
          </DataTable>
        </Panel>
      </aside>
      <div className="treasury-stack">
        <Panel title="Proyeksi kas bebas pakai" meta="IDR miliar | D+0 sampai D+5">
          <LiquidityChart labels={model.rows.map(row => row.date)} series={[
            { label: 'Dasar', values: model.rows.map(row => row.base), color: 'base' },
            { label: 'Stres penerimaan', values: model.rows.map(row => row.stress), color: 'stress' },
          ]} floor={model.floor} caption={`Buffer ${idr(model.floor)} | titik stres terendah ${idr(model.trough.stress)}`} />
        </Panel>
        <Panel title="Arus kas per hari kerja" meta="Skenario, bukan saldo aktual">
          <DataTable label="Rincian proyeksi likuiditas lima hari" columns={forecastColumns}>
            {model.rows.map((day, index) => <DataRow key={day.date} columns={forecastColumns} selected={day === model.trough} cells={[
              <>D+{index}<small>{day.date}</small></>, idr(day.incoming), idr(day.outgoing), idr(day.delayed), idr(day.base),
              <>{idr(day.stress)}{day.stress < model.floor && <small>Di bawah buffer</small>}</>,
            ]} />)}
          </DataTable>
          <div className="treasury-panel-footer"><p>Penerimaan yang tertunda tidak pulih dalam horizon ini. Saldo USD tidak menambah buffer kas IDR.</p></div>
        </Panel>
      </div>
    </div>
  </>;
}

function loadState() {
  try {
    return restoreState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return initialState();
  }
}

export default function TreasurySurface({ page }: { page: ProjectPageSpec }) {
  const [state, setState] = useState(loadState);
  const [saved, setSaved] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [message, setMessage] = useState('');
  const resetButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ commands: state.commands, assumptions: state.assumptions }));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [state]);
  useEffect(() => {
    if (confirmReset) cancelButton.current?.focus();
  }, [confirmReset]);

  function run(command: Command) {
    const next = applyCommand(state, command);
    if (next === state) {
      setMessage('Tindakan tidak diterapkan. Periksa syarat pada tahap ini.');
      return;
    }
    setState(next);
    setMessage(next.audit[next.audit.length - 1].description);
  }
  function closeReset(reset: boolean) {
    if (reset) {
      setState(initialState());
      setEpoch(current => current + 1);
      setMessage('Simulasi dikembalikan ke kondisi awal pada semua halaman Treasury.');
    }
    setConfirmReset(false);
    resetButton.current?.focus();
  }
  function saveAssumptions(assumptions: Assumptions) {
    setState(current => ({ ...current, assumptions }));
    setMessage('Asumsi disimpan. Proyeksi likuiditas dan sensitivitas USD telah dihitung ulang.');
  }

  return <div className="treasury-surface" data-treasury-page={page.slug}>
    <div className="treasury-utility">
      <span className="treasury-code">{SNAPSHOT}</span>
      <div><span className="treasury-storage">{saved ? 'Data fiktif | tersimpan di peramban ini' : 'Penyimpanan tidak tersedia | perubahan hanya untuk sesi ini'}</span>
        <button type="button" className="treasury-button secondary" ref={resetButton} aria-expanded={confirmReset} onClick={() => setConfirmReset(current => !current)}>Reset simulasi</button></div>
    </div>
    {confirmReset && <div className="treasury-reset" role="group" aria-label="Konfirmasi reset simulasi">
      <p><strong>Kembalikan Treasury ke kondisi awal?</strong> Posting VA, status dan audit batch, serta asumsi di semua halaman akan dihapus.</p>
      <div className="treasury-actions"><button type="button" className="treasury-button secondary" ref={cancelButton} onClick={() => closeReset(false)}>Batal</button>
        <button type="button" className="treasury-button danger" onClick={() => closeReset(true)}>Reset data demo</button></div>
    </div>}
    <div className="treasury-feedback" role="status">{message}</div>
    <div className="treasury-stack" key={`${page.slug}-${epoch}`}>
      {page.slug === 'p1' && <CashPage state={state} />}
      {page.slug === 'p2' && <ReconciliationPage state={state} run={run} />}
      {page.slug === 'p3' && <PayoutPage state={state} run={run} />}
      {page.slug === 'p4' && <ConnectivityPage />}
      {page.slug === 'p5' && <ForecastPage state={state} onSave={saveAssumptions} />}
    </div>
  </div>;
}
