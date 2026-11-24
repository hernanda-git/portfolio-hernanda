import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ProjectPageSpec } from '../data/projectPages';
import './tapnusa-surface.css';

type Rail = 'Tap transit' | 'QR lintas negara';
type Entry = { id: number; merchant: string; amount: number; rail: Rail | 'Isi saldo' };
type Step = 'review' | 'release' | 'posted';
type Batch = { id: number; entries: number[]; step: Step };
type Wallet = { entries: Entry[]; batches: Batch[]; audit: string[] };

const STORAGE = 'portfolio:tapnusa:v1';
const LIMIT = 500_000;
const RATE = 3_750;
const sources = [
  { name: 'MRT | Dukuh Atas -> Blok M', amount: 8_000 },
  { name: 'KRL | Sudirman -> Bogor', amount: 6_000 },
  { name: 'TransJakarta | Koridor 1', amount: 3_500 },
];
const initial: Wallet = {
  entries: [
    { id: 1, merchant: 'Isi saldo awal', amount: 150_000, rail: 'Isi saldo' },
    { id: 2, merchant: sources[1].name, amount: 6_000, rail: 'Tap transit' },
    { id: 3, merchant: sources[2].name, amount: 3_500, rail: 'Tap transit' },
  ],
  batches: [], audit: [],
};
const integer = new Intl.NumberFormat('id-ID');
const myrFormat = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (amount: number) => `Rp ${integer.format(amount)}`;
const ref = (id: number) => `TN-${String(id).padStart(4, '0')}`;
const batchRef = (id: number) => `STL-${String(id).padStart(3, '0')}`;
const stepLabels = { review: 'Menunggu pemeriksa', release: 'Menunggu rilis', posted: 'Diselesaikan' };
const isPayment = (entry: Entry) => entry.rail !== 'Isi saldo';
const total = (entries: Entry[]) => entries.reduce((sum, entry) => sum + entry.amount, 0);

function loadWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw) as Wallet;
  } catch { /* Storage can be disabled. */ }
  return initial;
}

export default function TapNusaSurface({ page }: { page: ProjectPageSpec }) {
  const [wallet, setWallet] = useState(loadWallet);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('Semua kanal');
  const [selected, setSelected] = useState<number>();
  const [rail, setRail] = useState<Rail | 'Isi saldo'>('Tap transit');
  const [station, setStation] = useState(0);
  const [subtotal, setSubtotal] = useState('12.00');
  const [topUp, setTopUp] = useState('50000');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(wallet)); } catch { /* In-memory operation still works. */ }
  }, [wallet]);

  const credits = wallet.entries.filter(entry => !isPayment(entry));
  const payments = wallet.entries.filter(isPayment);
  const balance = total(credits) - total(payments);
  const allocated = new Set(wallet.batches.flatMap(batch => batch.entries));
  const queued = payments.filter(entry => !allocated.has(entry.id));
  const active = wallet.batches.find(batch => batch.step !== 'posted');
  const postedIds = new Set(wallet.batches.filter(batch => batch.step === 'posted').flatMap(batch => batch.entries));
  const posted = payments.filter(entry => postedIds.has(entry.id));
  const lines = [...wallet.entries].reverse().filter(entry => filter === 'Semua kanal' || filter === entry.rail);
  const inspected = lines.find(entry => entry.id === selected) ?? lines[0];
  const myr = Number(subtotal);
  const amount = rail === 'Tap transit' ? sources[station].amount : rail === 'QR lintas negara' ? Math.round(myr * RATE) : Number(topUp);
  const merchant = rail === 'Tap transit' ? sources[station].name : rail === 'QR lintas negara' ? 'Kedai Sentral | Kuala Lumpur' : 'Isi saldo simulasi';

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isSafeInteger(amount) || amount <= 0 || (rail === 'QR lintas negara' && (myr < 0.01 || myr > 100))) {
      setFeedback('Masukkan nominal yang valid.');
      return;
    }
    if (rail === 'Isi saldo' ? amount + balance > LIMIT : amount > balance) {
      setFeedback(rail === 'Isi saldo' ? Saldo setelah isi ulang melebihi batas ${money(LIMIT)}. : 'Saldo tidak cukup. Isi saldo sebelum mencoba lagi.');
      return;
    }
    const id = (wallet.entries.at(-1)?.id ?? 0) + 1;
    setWallet({ ...wallet, entries: [...wallet.entries, { id, merchant, amount, rail }], audit: [...wallet.audit, `${ref(id)} | ${rail} | ${money(amount)}`] });
    setFeedback(`${ref(id)} | ${rail === 'Isi saldo' ? 'Saldo ditambahkan' : 'Pembayaran simulasi berhasil'}.`);
  }

  function advanceSettlement() {
    if (!active) {
      if (!queued.length) return;
      const id = (wallet.batches.at(-1)?.id ?? 0) + 1;
      setWallet({ ...wallet, batches: [...wallet.batches, { id, entries: queued.map(entry => entry.id), step: 'review' }], audit: [...wallet.audit, `${batchRef(id)} | Maker mengajukan ${queued.length} pembayaran`] });
      return;
    }
    const step = active.step === 'review' ? 'release' : 'posted';
    const message = step === 'release' ? 'Checker menyetujui batch' : 'Releaser menyelesaikan batch secara lokal';
    setWallet({ ...wallet, batches: wallet.batches.map(batch => batch.id === active.id ? { ...batch, step } : batch), audit: [...wallet.audit, `${batchRef(active.id)} | ${message}`] });
  }

  const metric = (label: string, value: string | number) => <div><span>{label}</span><strong>{value}</strong></div>;
  const status = (entry: Entry) => !isPayment(entry) ? 'Diterapkan' : postedIds.has(entry.id) ? 'Diselesaikan' : allocated.has(entry.id) ? 'Dalam batch' : 'Belum kliring';

  return <section className="tapnusa-surface">
    {page.slug === 'p1' && <>
      <div className="tapnusa-metrics">{metric('Saldo dompet', money(balance))}{metric('Nilai belum kliring', money(total(payments) - total(posted)))}{metric('Nilai terselesaikan', money(total(posted)))}</div>
      <section className="tapnusa-panel">
        <h2>Posisi per kanal</h2>
        <div className="tapnusa-scroll" tabIndex={0} aria-label="Tabel posisi per kanal"><table><thead><tr><th scope="col">Kanal</th><th scope="col">Transaksi</th><th scope="col">Nilai total</th><th scope="col">Belum kliring</th></tr></thead><tbody>
          {(['Tap transit', 'QR lintas negara'] as const).map(channel => {
            const rows = payments.filter(entry => entry.rail === channel);
            return <tr key={channel}><th scope="row">{channel}</th><td>{rows.length}</td><td>{money(total(rows))}</td><td>{money(total(rows.filter(entry => !postedIds.has(entry.id))))}</td></tr>;
          })}
        </tbody></table></div>
      </section>
    </>}

    {page.slug === 'p2' && <div className="tapnusa-grid">
      <section className="tapnusa-panel">
        <header><h2>Buku besar</h2><label>Kanal <select value={filter} onChange={e => setFilter(e.target.value)}>{['Semua kanal', 'Tap transit', 'QR lintas negara', 'Isi saldo'].map(value => <option key={value}>{value}</option>)}</select></label></header>
        {lines.length ? <div className="tapnusa-scroll" tabIndex={0} aria-label="Tabel buku besar"><table><thead><tr><th scope="col">Referensi</th><th scope="col">Tujuan</th><th scope="col">Perubahan saldo</th></tr></thead><tbody>{lines.map(entry => <tr key={entry.id}><th scope="row"><button type="button" className="tapnusa-link" aria-pressed={inspected?.id === entry.id} onClick={() => setSelected(entry.id)}>{ref(entry.id)}</button></th><td>{entry.merchant}</td><td>{isPayment(entry) ? '-' : '+'}{money(entry.amount)}</td></tr>)}</tbody></table></div> : <p>Tidak ada transaksi pada kanal ini.</p>}
      </section>
      <section className="tapnusa-panel">
        <h2>Detail transaksi</h2>
        {inspected ? <dl><div><dt>Referensi</dt><dd>{ref(inspected.id)}</dd></div><div><dt>Status</dt><dd>{status(inspected)}</dd></div><div><dt>Debit | {isPayment(inspected) ? 'Dompet komuter' : 'Kas simulasi'}</dt><dd>{money(inspected.amount)}</dd></div><div><dt>Kredit | {isPayment(inspected) ? 'Utang ke merchant' : 'Dompet komuter'}</dt><dd>{money(inspected.amount)}</dd></div></dl> : <p>Pilih kanal yang berisi transaksi.</p>}
      </section>
    </div>}

    {page.slug === 'p3' && <div className="tapnusa-grid">
      <section className="tapnusa-panel tapnusa-wallet">
        <h2>Dompet komuter</h2>
        <small>Saldo tersedia</small><strong className="tapnusa-balance">{money(balance)}</strong>
        <h3>Aktivitas terakhir</h3>
        <ul>{[...wallet.entries].reverse().slice(0, 4).map(entry => <li key={entry.id}><span>{entry.merchant}</span><b>{isPayment(entry) ? '-' : '+'}{money(entry.amount)}</b></li>)}</ul>
      </section>
      <form className="tapnusa-panel tapnusa-form" onSubmit={addEntry}>
        <h2>Simulasi pembayaran</h2>
        <label>Jenis transaksi<select value={rail} onChange={event => { setRail(event.target.value as typeof rail); setFeedback(''); }}><option>Tap transit</option><option>QR lintas negara</option><option>Isi saldo</option></select></label>
        {rail === 'Tap transit' && <label>Perjalanan<select value={station} onChange={e => setStation(Number(e.target.value))}>{sources.map((source, index) => <option key={source.name} value={index}>{source.name} | {money(source.amount)}</option>)}</select></label>}
        {rail === 'QR lintas negara' && <><label>Nominal merchant (MYR)<input required type="number" min="0.01" max="100" step="0.01" value={subtotal} onChange={e => setSubtotal(e.target.value)} /></label><p>{merchant} | Kurs tetap {money(RATE)} / MYR{Number.isFinite(myr) && myr > 0 ?  | MYR ${myrFormat.format(myr)} : ''}</p></>}
        {rail === 'Isi saldo' && <label>Nominal isi saldo (IDR)<input required type="number" min="1" max={LIMIT} step="1" value={topUp} onChange={e => setTopUp(e.target.value)} /></label>}
        <button type="submit" className="tapnusa-action">{rail === 'Tap transit' ? 'Simulasikan tap' : rail === 'Isi saldo' ? 'Tambahkan saldo' : 'Bayar QR'}{amount > 0 ?  | ${money(amount)} : ''}</button>
        <output aria-live="polite">{feedback}</output>
      </form>
    </div>}

    {page.slug === 'p4' && <div className="tapnusa-grid">
      <section className="tapnusa-panel">
        <h2>Antrean kliring</h2>
        <p>{queued.length} pembayaran baru | {money(total(queued))}</p>
        {active && <p><b>{batchRef(active.id)}</b> | {stepLabels[active.step]} | {money(total(payments.filter(entry => active.entries.includes(entry.id))))}</p>}
        <button type="button" className="tapnusa-action" onClick={advanceSettlement} disabled={!active && !queued.length}>{active ? active.step === 'review' ? 'Setujui sebagai Checker' : 'Selesaikan sebagai Releaser' : 'Ajukan sebagai Maker'}</button>
      </section>
      <section className="tapnusa-panel">
        <h2>Riwayat batch</h2>
        {wallet.batches.length ? <ul>{[...wallet.batches].reverse().map(batch => <li key={batch.id}><span>{batchRef(batch.id)} | {batch.entries.length} pembayaran</span><b>{stepLabels[batch.step]}</b></li>)}</ul> : <p>Belum ada batch yang diajukan.</p>}
      </section>
    </div>}

    {page.slug === 'p5' && <div className="tapnusa-grid">
      <section className="tapnusa-panel">
        <h2>Jejak audit lokal</h2>
        {wallet.audit.length ? <ol>{[...wallet.audit].reverse().map((event, index) => <li key={wallet.audit.length - index}>{event}</li>)}</ol> : <p>Belum ada tindakan pada sesi ini.</p>}
      </section>
      <section className="tapnusa-panel">
        <h2>Kontrol simulasi</h2>
        <dl><div><dt>Batas saldo dompet</dt><dd>{money(LIMIT)}</dd></div><div><dt>Persetujuan settlement</dt><dd>Maker -> Checker -> Releaser</dd></div><div><dt>Transaksi eksternal</dt><dd>Tidak dikirim</dd></div></dl>
        {!confirmReset ? <button type="button" className="tapnusa-link" onClick={() => setConfirmReset(true)}>Reset simulasi TapNusa</button> : <div className="tapnusa-confirm"><p>Hapus pembayaran dan persetujuan lokal?</p><button type="button" className="tapnusa-action" onClick={() => { setWallet(initial); setSelected(undefined); setFeedback(''); setConfirmReset(false); }}>Ya, reset</button><button type="button" className="tapnusa-link" onClick={() => setConfirmReset(false)}>Batal</button></div>}
      </section>
    </div>}
  </section>;
}
