export const STORAGE_KEY = 'portfolio.treasury.v1';
export const SNAPSHOT = '18 Nov 2026 | 14:33 WIB';

export const banks = [
  { name: 'BCA', channel: 'SNAP BI', account: '** 2910', idr: 4_682_000_000, hold: 110_000_000, usd: 92_400, cutoff: '16:30', stamp: '14:32:56', maxAge: 60 },
  { name: 'Mandiri', channel: 'SNAP BI', account: '** 4073', idr: 3_985_000_000, hold: 325_000_000, usd: 47_100, cutoff: '16:00', stamp: '14:32:55', maxAge: 60 },
  { name: 'BNI', channel: 'SNAP BI', account: '** 1752', idr: 2_196_000_000, hold: 0, usd: 0, cutoff: '15:30', stamp: '14:32:48', maxAge: 90 },
  { name: 'BRI', channel: 'SNAP BI', account: '** 8356', idr: 1_274_000_000, hold: 42_000_000, usd: 0, cutoff: '15:30', stamp: '14:32:52', maxAge: 90 },
  { name: 'OCBC', channel: 'File H2H', account: '** 5601', idr: 2_683_000_000, hold: 60_000_000, usd: 18_500, cutoff: '15:00', stamp: '14:30:00', maxAge: 300 },
] as const;

export type Bank = (typeof banks)[number];
export const fundingBank = banks[1];
export const cutoffOrder = [...banks].sort((a, b) => a.cutoff.localeCompare(b.cutoff));

export function dataAge(bank: Bank) {
  const [hour, minute, second] = bank.stamp.split(':').map(Number);
  return (14 - hour) * 3600 + (33 - minute) * 60 - second;
}

const receiptSeeds = [
  ['BCA', 'Nusa Rantai Dingin', 185_000_000, 185_000_000],
  ['Mandiri', 'Arus Raya Distribusi', 72_500_000, 72_500_000],
  ['BNI', 'Maju Guna Transpor', 22_050_000, 22_500_000],
  ['BCA', 'Kapas Tiga Gudang', 46_700_000, 46_700_000],
  ['BRI', 'Lintas Kota Pangan', 18_450_000, 18_450_000],
  ['BCA', 'Gema Kargo Laut', 32_740_000, 32_740_000],
  ['Mandiri', 'Sentra Kemasan Baru', 11_600_000, null],
  ['BNI', 'Tiga Pilar Truk', 58_100_000, 58_100_000],
  ['BRI', 'Pandu Nusantara', 24_300_000, 24_300_000],
  ['BCA', 'Bina Kirim Utama', 67_250_000, 67_000_000],
  ['Mandiri', 'Kota Mas Depo', 94_425_000, 94_425_000],
  ['BCA', 'Alur Terminal Barat', 41_600_000, 41_600_000],
  ['BNI', 'Griya Pangan Ritel', 8_740_000, 8_740_000],
  ['BRI', 'Bumi Pendingin', 17_850_000, null],
  ['BCA', 'Langkah Distribusi', 33_800_000, 33_800_000],
  ['Mandiri', 'Serambi Angkutan', 6_150_000, 6_200_000],
] as const;

export const receipts = receiptSeeds.map(([bank, payer, paid, expected], index) => ({
  bank, payer, paid, expected, ref: `VA-${9921 - index}`, time: `14:${32 - index}:00`,
  invoiceRef: expected === null ? null : `INV-26-${8812 - index}`,
}));
export type Receipt = (typeof receipts)[number];
export const receiptCash = receipts.reduce((total, receipt) => total + receipt.paid, 0);

interface Invoice { ref: string; payer: string; amount: number }
const invoices: Invoice[] = [
  ...receipts.flatMap(r => r.invoiceRef === null || r.expected === null ? [] : [{ ref: r.invoiceRef, payer: r.payer, amount: r.expected }]),
  { ref: 'INV-26-8821', payer: 'Sentra Kemasan Baru', amount: 11_600_000 },
  { ref: 'INV-26-8822', payer: 'Sentra Kemasan Baru', amount: 12_300_000 },
  { ref: 'INV-26-8830', payer: 'Bumi Pendingin', amount: 18_050_000 },
];

export function invoiceOptions(receipt: Receipt, state: TreasuryState) {
  return invoices.filter(invoice => invoice.payer === receipt.payer &&
    (receipt.invoiceRef === null || invoice.ref === receipt.invoiceRef) &&
    !Object.entries(state.posts).some(([ref, post]) => ref !== receipt.ref && post.invoice.ref === invoice.ref));
}

const transferSeeds = [
  ['Samudra Prima', 'BCA', 52_800_000], ['Angkut Setara', 'BNI', 41_250_000],
  ['Pusaka Suku Cadang', 'BRI', 39_600_000], ['Cipta Rak Industri', 'OCBC', 38_450_000],
  ['Tiga Menara Sejuk', 'BCA', 36_800_000], ['Sumber Ban Armada', 'BRI', 35_200_000],
  ['Mandala Terminal', 'BNI', 32_000_000], ['Pantura Sewa Gudang', 'Mandiri', 28_000_000],
  ['Karya Bongkar Muat', 'BCA', 25_500_000], ['Daya Tagih Persada', 'OCBC', 24_600_000],
  ['Kanal Palet Raya', 'Mandiri', 18_200_000], ['Dwi Cipta Pendingin', 'BCA', 16_400_000],
  ['Gema Seragam Kerja', 'BCA', 2_100_000], ['Inovasi Meter', 'BRI', 400_000],
] as const;
export const transfers = transferSeeds.map(([vendor, bank, amount], index) => ({ vendor, bank, amount, ref: `AP-26-${8041 + index}` }));

const principal = transfers.reduce((total, transfer) => total + transfer.amount, 0);
const feePerInstruction = 2_500;
const fees = transfers.length * feePerInstruction;
export const batch = { ref: 'BCH-412', principal, feePerInstruction, fees, debit: principal + fees };

export const roles = {
  maker: { label: 'Maker', person: 'Sari', team: 'Treasury Ops' },
  checker: { label: 'Checker', person: 'Budi', team: 'AP Control' },
  releaser: { label: 'Releaser', person: 'Ratih', team: 'Group Treasury' },
} as const;
export type Role = keyof typeof roles;
export const roleOrder: readonly Role[] = ['maker', 'checker', 'releaser'];
export type BatchStage = 'draft' | 'review' | 'ready' | 'released';
export const batchStages = {
  draft: { label: 'Draf', tone: 'neutral', role: 'maker', count: 0 },
  review: { label: 'Menunggu checker', tone: 'warn', role: 'checker', count: 1 },
  ready: { label: 'Siap rilis', tone: 'accent', role: 'releaser', count: 2 },
  released: { label: 'Dirilis lokal', tone: 'ok', role: null, count: 3 },
} as const;

export const assumptionFields = [
  { key: 'rate', label: 'Kurs USD/IDR (Rp per USD)', min: 10_000, max: 25_000 },
  { key: 'shock', label: 'Guncangan kurs (+/- Rp)', min: 0, max: 5_000 },
  { key: 'delay', label: 'Bagian piutang berisiko tertunda (%)', min: 0, max: 100 },
  { key: 'floor', label: 'Buffer minimum (Rp juta)', min: 0, max: 20_000 },
] as const;

type Assumptions = Record<(typeof assumptionFields)[number]['key'], number>;
export const defaultAssumptions: Assumptions = { rate: 16_250, shock: 350, delay: 100, floor: 10_500 };

export type Command =
  | { type: 'submit'; role: 'maker' }
  | { type: 'approve' | 'return'; role: 'checker' }
  | { type: 'release'; role: 'releaser'; confirmed: true }
  | { type: 'auto-post' }
  | { type: 'post'; receiptRef: string; invoiceRef: string; note: string };

interface Posting { invoice: Invoice; note: string; applied: number; remaining: number; unapplied: number }
interface AuditEntry { type: 'batch' | 'receipt'; subject: string; actor: string; description: string }
export interface TreasuryState {
  stage: BatchStage;
  posts: Record<string, Posting>;
  audit: AuditEntry[];
  commands: Command[];
  assumptions: Assumptions;
}

export function initialState(): TreasuryState {
  return { stage: 'draft', posts: {}, audit: [], commands: [], assumptions: { ...defaultAssumptions } };
}

export function bankPosition(bank: Bank, stage: BatchStage) {
  const funded = bank.name === fundingBank.name;
  const booked = bank.idr - (funded && stage === 'released' ? batch.debit : 0);
  const reserve = funded && (stage === 'review' || stage === 'ready') ? batch.debit : 0;
  return { booked, reserve, freeBeforeReserve: booked - bank.hold, available: booked - bank.hold - reserve };
}

export function cashPosition(stage: BatchStage) {
  return banks.reduce((total, bank) => {
    const position = bankPosition(bank, stage);
    return { booked: total.booked + position.booked, holds: total.holds + bank.hold, reserve: total.reserve + position.reserve,
      available: total.available + position.available, usd: total.usd + bank.usd };
  }, { booked: 0, holds: 0, reserve: 0, available: 0, usd: 0 });
}

export function canFundBatch() {
  return bankPosition(fundingBank, 'draft').available >= batch.debit && '14:33' < fundingBank.cutoff;
}

function postingFor(receipt: Receipt, invoice: Invoice, note: string): Posting {
  const applied = Math.min(receipt.paid, invoice.amount);
  return { invoice, note, applied, remaining: invoice.amount - applied, unapplied: receipt.paid - applied };
}

export function exactUnposted(state: TreasuryState) {
  return receipts.filter(r => r.paid === r.expected && !state.posts[r.ref]);
}

function record(state: TreasuryState, command: Command, change: Partial<TreasuryState>, event: AuditEntry): TreasuryState {
  return { ...state, ...change, commands: [...state.commands, command], audit: [...state.audit, event] };
}

function changeStage(state: TreasuryState, command: Extract<Command, { role: Role }>, stage: BatchStage, description: string) {
  return record(state, command, { stage }, { type: 'batch', subject: batch.ref, actor: roles[command.role].person, description });
}

export function applyCommand(state: TreasuryState, command: Command): TreasuryState {
  switch (command.type) {
    case 'submit':
      return command.role === 'maker' && state.stage === 'draft' && canFundBatch()
        ? changeStage(state, command, 'review', 'Batch diajukan; dana dicadangkan.') : state;
    case 'approve':
      return command.role === 'checker' && state.stage === 'review'
        ? changeStage(state, command, 'ready', 'Instruksi vendor disetujui; cadangan dipertahankan.') : state;
    case 'return':
      return command.role === 'checker' && state.stage === 'review'
        ? changeStage(state, command, 'draft', 'Batch dikembalikan ke Maker; cadangan dibatalkan.') : state;
    case 'release':
      return command.role === 'releaser' && command.confirmed === true && state.stage === 'ready' && canFundBatch()
        ? changeStage(state, command, 'released', 'Debit diposting ke saldo Mandiri lokal; cadangan ditutup.') : state;
    case 'auto-post': {
      const posts = { ...state.posts };
      let count = 0;
      for (const receipt of exactUnposted(state)) {
        const invoice = invoiceOptions(receipt, { ...state, posts })[0];
        if (!invoice || invoice.amount !== receipt.paid) continue;
        posts[receipt.ref] = postingFor(receipt, invoice, 'Pencocokan tepat otomatis.');
        count++;
      }
      return count ? record(state, command, { posts }, { type: 'receipt', subject: 'VA-1811', actor: 'Treasury Ops', description: `${count} mutasi cocok tepat diposting ke ERP lokal.` }) : state;
    }
    case 'post': {
      const receipt = receipts.find(row => row.ref === command.receiptRef);
      if (!receipt || state.posts[receipt.ref]) return state;
      const invoice = invoiceOptions(receipt, state).find(candidate => candidate.ref === command.invoiceRef);
      const note = command.note.trim();
      if (!invoice || note.length > 200 || (receipt.expected !== receipt.paid && !note)) return state;
      const post = postingFor(receipt, invoice, note || 'Pencocokan tepat dikonfirmasi.');
      const description = post.remaining ? `Pembayaran parsial -> ${invoice.ref}; sisa piutang terbuka.` : post.unapplied
        ? `Pembayaran -> ${invoice.ref}; kelebihan masuk kredit belum dialokasikan.` : `Pembayaran diposting -> ${invoice.ref}; faktur lunas.`;
      return record(state, command, { posts: { ...state.posts, [receipt.ref]: post } }, { type: 'receipt', subject: receipt.ref, actor: 'Treasury Ops', description });
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCommand(value: unknown): value is Command {
  if (!isObject(value)) return false;
  switch (value.type) {
    case 'submit': return value.role === 'maker';
    case 'approve': case 'return': return value.role === 'checker';
    case 'release': return value.role === 'releaser' && value.confirmed === true;
    case 'auto-post': return true;
    case 'post': return typeof value.receiptRef === 'string' && typeof value.invoiceRef === 'string' && typeof value.note === 'string';
    default: return false;
  }
}

export function validAssumption(field: (typeof assumptionFields)[number], value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= field.min && value <= field.max;
}

export function restoreState(serialized: string | null): TreasuryState {
  let state = initialState();
  if (serialized === null) return state;
  const saved: unknown = JSON.parse(serialized);
  if (!isObject(saved)) return state;
  if (Array.isArray(saved.commands)) {
    for (const command of saved.commands) {
      if (isCommand(command)) state = applyCommand(state, command);
    }
  }
  const assumptions = saved.assumptions;
  if (isObject(assumptions)) {
    for (const field of assumptionFields) {
      const value = assumptions[field.key];
      if (validAssumption(field, value)) state.assumptions[field.key] = value;
    }
  }
  return state;
}

export const intradayMoves = [132, -85, 208, -150, -205, 190, 35, 240, -80, 65].map(n => n * 1_000_000);
export const cashTimes = ['08:00', '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', '13:20', '14:00', '14:33'];
export function intradayCash(stage: BatchStage) {
  const values = [cashPosition('draft').booked - intradayMoves.reduce((sum, move) => sum + move, 0)];
  for (const move of intradayMoves) values.push(values[values.length - 1] + move);
  if (stage === 'released') values[values.length - 1] -= batch.debit;
  return values;
}

const forecastFlows = [
  ['18 Nov', 0, 0, 0],
  ['19 Nov', 735, 1250, 330],
  ['20 Nov', 620, 1950, 480],
  ['23 Nov', 1240, 780, 360],
  ['24 Nov', 510, 920, 500],
  ['25 Nov', 960, 540, 600],
] as const;

export function projectLiquidity(state: TreasuryState) {
  const cash = cashPosition(state.stage);
  // Add reservations back to the opening figure, then count the pending debit once on D+0.
  const opening = cash.available + cash.reserve;
  let base = opening;
  let stress = opening;
  const rows = forecastFlows.map(([date, inc, out, atRisk], index) => {
    const incoming = inc * 1_000_000;
    const outgoing = out * 1_000_000 + (index === 0 ? cash.reserve : 0);
    const delayed = atRisk * state.assumptions.delay * 10_000;
    base += incoming - outgoing;
    stress += incoming - outgoing - delayed;
    return { date, incoming, outgoing, delayed, base, stress };
  });
  const floor = state.assumptions.floor * 1_000_000;
  const trough = rows.reduce((min, day) => day.stress < min.stress ? day : min);
  return { opening, floor, rows, trough, gap: Math.max(0, floor - trough.stress), firstBreach: rows.find(day => day.stress < floor), usd: cash.usd };
}

interface ConnectorEvent {
  id: string; time: string; artifact: string; title: string; result: string; tone: 'ok' | 'warn'; detail: string;
}

const h2hEvents: ConnectorEvent[] = [
  { id: 'h2h-ingest', time: '14:30:12', artifact: 'H2H-OCBC-1430', title: 'Rekonsiliasi saldo file', result: 'Diterapkan', tone: 'ok', detail: 'Kontrol simulasi mencocokkan jumlah record dan saldo akhir. Snapshot OCBC mengambil saldo dari file 14:30.' },
  { id: 'h2h-manifest', time: '14:30:09', artifact: 'H2H-OCBC-1430', title: 'Pemeriksaan manifest dan integritas', result: 'Valid', tone: 'ok', detail: 'Manifest contoh dan status integritas dinyatakan valid pada dataset demo. Tidak ada file atau kunci asli yang digunakan.' },
  { id: 'h2h-duplicate', time: '14:29:32', artifact: 'H2H-OCBC-1400', title: 'File sudah pernah diterapkan', result: 'Duplikat', tone: 'warn', detail: 'Identitas file ditemukan pada riwayat ingest. File dilewati; tidak ada perubahan saldo atau record tambahan.' },
];

export function connectorEvents(bank: Bank): ConnectorEvent[] {
  if (bank.channel === 'File H2H') return h2hEvents;
  const artifact = `BAL-${bank.name}-1811`;
  return [
    { id: `${bank.name}-merge`, time: '14:33:00', artifact: 'POS-1811-1433', title: 'Saldo digabungkan ke snapshot', result: 'Diterapkan', tone: 'ok', detail: `Saldo ${bank.name} diambil dari respons contoh terakhir dan sumber serta waktunya dipertahankan.` },
    { id: `${bank.name}-validate`, time: bank.stamp, artifact, title: 'Respons SNAP BI tervalidasi', result: 'Diterima', tone: 'ok', detail: 'Bukti contoh mencatat pemeriksaan identitas konektor, tanda tangan respons, dan kemutakhiran sebelum saldo diterapkan. Tidak ada permintaan jaringan.' },
  ];
}
