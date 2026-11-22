import assert from 'node:assert/strict';
import { badge, esc, fmtIdr, fmtNum, fmtPct, renderEnvTopbar, renderStatusFooter, wrapEnterpriseHtml } from '../chrome.mjs';
import { svgMultiLineChart } from '../charts.mjs';

const views = [
  ['Likuiditas', 'Posisi Kas & Cutoff Multi-Bank'],
  ['Rekonsiliasi', 'Rekonsiliasi Virtual Account & Piutang ERP'],
  ['Pencairan', 'Pencairan BI-FAST & Otorisasi Berjenjang'],
  ['Konektivitas', 'Konektivitas SNAP BI & Kontrol Host-to-Host'],
  ['Eksposur Valas', 'Proyeksi Likuiditas 5 Hari & Sensitivitas USD'],
];

export const meta = {
  id: 'ID-012',
  name: 'KasirTreasury BI',
  reference: 'Kyriba Treasury Workstation + Bloomberg Treasury & Risk',
  persona: 'Ratih Pradipta · Group Treasurer · PT Sagara Logistik Nusantara',
  pages: views.map(([, title], i) => ({ slug: `p${i + 1}`, title })),
};

const banks = [
  { name: 'BCA', channel: 'SNAP BI', account: '•• 2910', idr: 4_682_000_000, hold: 110_000_000, usd: 92_400, cutoff: '16:30', stamp: '14:32:56', lag: 36 },
  { name: 'Mandiri', channel: 'SNAP BI', account: '•• 4073', idr: 3_985_000_000, hold: 325_000_000, usd: 47_100, cutoff: '16:00', stamp: '14:32:55', lag: 38 },
  { name: 'BNI', channel: 'SNAP BI', account: '•• 1752', idr: 2_196_000_000, hold: 0, usd: 0, cutoff: '15:30', stamp: '14:32:48', lag: 64 },
  { name: 'BRI', channel: 'SNAP BI', account: '•• 8356', idr: 1_274_000_000, hold: 42_000_000, usd: 0, cutoff: '15:30', stamp: '14:32:52', lag: 51 },
  { name: 'OCBC', channel: 'File H2H', account: '•• 5601', idr: 2_683_000_000, hold: 60_000_000, usd: 18_500, cutoff: '15:00', stamp: '14:30:00', lag: 180 },
];

const receipts = [
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
].map(([bank, payer, paid, invoice], i) => ({ bank, payer, paid, invoice, ref: `VA-${9921 - i}`, time: `14:${32 - i}:00`, invoiceRef: invoice === null ? '—' : `INV-26-${8812 - i}` }));

const transfers = [
  ['Samudra Prima', 'BCA', 52_800_000], ['Angkut Setara', 'BNI', 41_250_000],
  ['Pusaka Suku Cadang', 'BRI', 39_600_000], ['Cipta Rak Industri', 'OCBC', 38_450_000],
  ['Tiga Menara Sejuk', 'BCA', 36_800_000], ['Sumber Ban Armada', 'BRI', 35_200_000],
  ['Mandala Terminal', 'BNI', 32_000_000], ['Pantura Sewa Gudang', 'Mandiri', 28_000_000],
  ['Karya Bongkar Muat', 'BCA', 25_500_000], ['Daya Tagih Persada', 'OCBC', 24_600_000],
  ['Kanal Palet Raya', 'Mandiri', 18_200_000], ['Dwi Cipta Pendingin', 'BCA', 16_400_000],
  ['Pesisir Rute Ekspres', 'BRI', 14_000_000], ['Akses Lift Barang', 'BNI', 7_500_000],
  ['Gema Seragam Kerja', 'BCA', 2_100_000], ['Inovasi Meter', 'BRI', 400_000],
];

const sum = (rows, field) => rows.reduce((total, row) => total + field(row), 0);
const cash = sum(banks, b => b.idr);
const holds = sum(banks, b => b.hold);
const available = cash - holds;
const usd = sum(banks, b => b.usd);
const rate = 16_250;
const floor = 10_500_000_000;
const receipt = receipts[2];
const variance = receipt.paid - receipt.invoice;
const exceptions = receipts.filter(r => r.paid !== r.invoice);
const receiptCash = sum(receipts, r => r.paid);
const principal = sum(transfers, t => t[2]);
const fee = 2_500;
const debit = principal + transfers.length * fee;
const payer = banks[1];

const intradayMoves = [132, -85, 208, -150, -205, 190, 35, 240, -80, 65].map(n => n * 1_000_000);
const hourly = [cash - sum(intradayMoves, n => n)];
for (const movement of intradayMoves) hourly.push(hourly.at(-1) + movement);

const forecast = [
  ['18 Nov', 0, debit, 245_000_000],
  ['19 Nov', 735_000_000, 1_250_000_000, 330_000_000],
  ['20 Nov', 620_000_000, 1_950_000_000, 480_000_000],
  ['23 Nov', 1_240_000_000, 780_000_000, 360_000_000],
  ['24 Nov', 510_000_000, 920_000_000, 500_000_000],
  ['25 Nov', 960_000_000, 540_000_000, 600_000_000],
];

const projection = forecast.map(([date, incoming, outgoing, delayed], i) => ({
  date, incoming, outgoing, delayed,
  base: available + sum(forecast.slice(0, i + 1), ([, inc, out]) => inc - out),
  stress: available + sum(forecast.slice(0, i + 1), ([, inc, out, gap]) => inc - out - gap),
}));
const trough = projection.reduce((min, day) => day.stress < min.stress ? day : min);
const firstBreach = projection.find(day => day.stress < floor);
const bn = n => n / 1e9;
const compact = n => `Rp ${bn(n).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} miliar`;
const dollars = n => `USD ${fmtNum(n)}`;
const tone = (text, kind = 'neutral') => badge(text, kind);
const metric = (label, value, note) => `<div class="kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
const strip = (...items) => `<div class="strip">${items.join('')}</div>`;
const panel = (title, tag, body, cls = '') => `<section class="e-panel ${cls}"><header class="panelhead"><h2>${title}</h2><span>${tag}</span></header><div class="e-panel-body-flush">${body}</div></section>`;
const note = (label, text) => `<div class="note"><strong>${label}</strong><p>${text}</p></div>`;
const fields = (rows) => `<dl>${rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`;

function grid(columns, rows, { selected = -1, footer = '' } = {}) {
  return `<table class="e-table"><colgroup>${columns.map(([, width]) => `<col style="width:${width}%">`).join('')}</colgroup>
    <thead><tr>${columns.map(([title, , numeric]) => `<th${numeric ? ' class="num"' : ''}>${title}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row, i) => `<tr${i === selected ? ' class="is-selected"' : ''}>${row.map((cell, j) => `<td${columns[j][2] ? ' class="num mono"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}</tbody>${footer ? `<tfoot><tr><td colspan="${columns.length}">${footer}</td></tr></tfoot>` : ''}</table>`;
}

function cashDesk() {
  const chart = svgMultiLineChart({ width: 984, height: 273, yMin: 13, yMax: 15, yTicks: 4, yFormat: n => n.toLocaleString('id-ID'),
    xLabels: ['08:00', '08:40', '09:20', '10:00', '10:40', '11:20', '12:00', '12:40', '13:20', '14:00', '14:33'],
    series: [{ label: 'Saldo buku', color: '#087f6d', values: hourly.map(bn), area: true, dots: true }],
    annotations: [{ index: 8, seriesIdx: 0, label: 'Penerimaan +Rp 240 juta', color: '#0c6458', dy: -22 }],
  });
  const balances = grid([['Bank / akun', 18], ['Jalur', 13], ['Saldo IDR', 18, true], ['Dana ditahan', 17, true], ['Dapat dipakai', 18, true], ['Saldo USD', 16, true]],
    banks.map(b => [`<b>${b.name}</b> <span class="muted">${b.account}</span>`, b.channel, fmtIdr(b.idr), fmtIdr(b.hold), fmtIdr(b.idr - b.hold), b.usd ? dollars(b.usd) : '—']),
    { footer: `5 rekening IDR · 3 rekening USD &nbsp; / &nbsp; Buku ${fmtIdr(cash)} &nbsp; / &nbsp; Tersedia ${fmtIdr(available)}` });
  return `${strip(metric('SALDO BUKU · IDR', compact(cash), 'Kas 5 bank; rekening USD terpisah'), metric('DANA OPERASIONAL', compact(available), `Setelah ${fmtIdr(holds)} dana ditahan`), metric('SALDO USD', dollars(usd), `Setara ${fmtIdr(usd * rate)} pada kurs skenario`), metric('BATCH MENUNGGU RILIS', fmtIdr(debit), 'BCH-412 · termasuk biaya simulasi'))}
    <div class="split cash"><div class="stack">${panel('01 / Pergerakan kas intrahari', 'IDR miliar · 08:00–14:33 WIB', `<div class="chart">${chart}</div>`)}${panel('02 / Posisi rekening', 'Saldo buku vs saldo bebas pakai', balances)}</div>
    ${panel('Batas pemrosesan hari ini', 'WIB', `<div class="padded">${banks.slice().sort((a, b) => a.cutoff.localeCompare(b.cutoff)).map(b => `<div class="cutoff"><time>${b.cutoff}</time><div><b>${b.name}</b><small>${b.channel} · posisi ${b.stamp}</small></div>${b.channel === 'File H2H' ? tone('Berkala', 'warn') : tone('Intrahari', 'ok')}</div>`).join('')}${note('15:00 · Tutup file OCBC', 'File saldo berikutnya tidak diasumsikan masuk ke posisi sebelum cutoff.')}${note('16:00 · Dana batch Mandiri', `Setelah rilis BCH-412, saldo bebas pakai Mandiri menjadi <b>${fmtIdr(payer.idr - payer.hold - debit)}</b>.`)}</div>`, 'cutoffs')}</div>`;
}

function reconciliation() {
  const table = grid([['Waktu', 10], ['Ref. VA', 11], ['Pembayar', 21], ['Bank', 10], ['Faktur ERP', 13], ['Kredit', 19, true], ['Status', 16]], receipts.map(r => [r.time, `<b>${r.ref}</b>`, r.payer, r.bank, r.invoiceRef, fmtIdr(r.paid), r.invoice === null ? tone('Tanpa faktur', 'bad') : r.paid !== r.invoice ? tone('Selisih', 'warn') : tone('Cocok', 'ok')]),
    { selected: 2, footer: `${receipts.length} mutasi dalam batch · Total kredit ${fmtIdr(receiptCash)} · ${exceptions.length} eksepsi belum diposting` });
  return `${strip(metric('MUTASI MASUK', fmtIdr(receiptCash), 'Batch VA-1811 · 4 bank'), metric('COCOK TEPAT', `${receipts.length - exceptions.length} / ${receipts.length}`, 'Berdasarkan nominal dan referensi faktur'), metric('EKSEPSI', exceptions.length, 'Tidak diposting otomatis'), metric('SELANG PEMANTAUAN', '1 menit', 'Cap waktu penerimaan bank'))}
    <div class="split workbench">${panel('Mutasi masuk / VA-1811', 'Semua bank · 14:17–14:32 WIB', table)}${panel('Inspektor eksepsi', tone('Kurang bayar', 'warn'), `<div class="padded"><div class="doc"><span class="overline">${receipt.ref} / ${receipt.bank}</span><h3>${receipt.payer}</h3><p>Faktur ${receipt.invoiceRef} · dokumen AR dibuka</p></div>${fields([['Kredit dari bank', fmtIdr(receipt.paid)], ['Nilai piutang', fmtIdr(receipt.invoice)], ['Kredit − piutang', fmtIdr(variance)]])}<ol class="trail"><li><b>Terima mutasi</b><small>14:30:00 · Referensi bank berpadanan</small></li><li><b>Temukan faktur ERP</b><small>14:30:02 · Nominal tidak sama</small></li><li><b>Tahan jurnal</b><small>14:30:03 · Menunggu bukti dari tim AR</small></li></ol>${note('Keputusan berikutnya', 'Minta bukti potong atau pelunasan selisih. Piutang tetap terbuka; sistem tidak menyimpulkan alasan kurang bayar dari nominal saja.')}</div>`)}</div>`;
}

function disbursement() {
  const after = payer.idr - payer.hold - debit;
  const table = grid([['No.', 6], ['Faktur', 15], ['Vendor', 31], ['Bank', 12], ['Pokok', 18, true], ['Status', 18]], transfers.map(([vendor, bank, amount], i) => [String(i + 1).padStart(2, '0'), `AP-26-${8041 + i}`, vendor, bank, fmtIdr(amount), tone('Siap rilis', 'info')]),
    { footer: `${transfers.length} instruksi · ${fmtIdr(principal)} pokok · ${fmtIdr(transfers.length * fee)} biaya · ${fmtIdr(debit)} total debit` });
  return `<div class="approval">${[['01 / MAKER', 'Sari · Treasury Ops', '13:51 · Batch diajukan'], ['02 / CHECKER', 'Budi · AP Control', '14:13 · Daftar vendor disetujui'], ['03 / RELEASER', 'Ratih · Group Treasury', 'Menunggu persetujuan · cutoff 16:00']].map(([label, name, status], i) => `<div${i === 2 ? ' class="active"' : ''}><span>${label}</span><strong>${name}</strong><small>${status}</small></div>`).join('')}</div>
    <div class="split workbench">${panel('BCH-412 / Instruksi BI-FAST', 'Mandiri · Pembayaran vendor', table)}${panel('Kontrol sebelum rilis', tone('Belum dikirim', 'warn'), `<div class="padded"><div class="doc"><span class="overline">Debit rekening Mandiri ${payer.account}</span><h3>${fmtIdr(debit)}</h3><p>Pokok dan biaya batch simulasi</p></div>${fields([['Dana sebelum rilis', fmtIdr(payer.idr - payer.hold)], ['Pokok instruksi', fmtIdr(principal)], ['Biaya per instruksi', fmtIdr(fee)], ['Dana sesudah rilis', fmtIdr(after)]])}<ol class="trail"><li><b>Pemisahan tugas</b><small>Maker, checker, dan releaser adalah tiga identitas berbeda.</small></li><li><b>Periksa saldo tersedia</b><small>Penahanan bank tidak dihitung sebagai dana bebas.</small></li><li><b>Cek ulang status bank sebelum mengirim ulang</b><small>Jangan menggandakan instruksi saat respons belum diketahui.</small></li></ol>${note('Rilis berikutnya', 'Batch tetap di antrean hingga releaser menyetujui. Tidak ada transaksi yang dikirim dari pratinjau ini.')}</div>`)}</div>`;
}

function connectivity() {
  const routes = grid([['Bank', 12], ['Kanal', 14], ['Dokumen / akses', 25], ['Posisi terakhir', 17], ['Ambang usia', 13], ['Status', 19]], banks.map(b => [b.name, b.channel, b.channel === 'File H2H' ? 'File saldo terenkripsi' : 'Ringkasan saldo · mTLS', b.stamp, `${b.lag} dtk`, tone('Dalam SLA', 'ok')]));
  const events = grid([['Waktu WIB', 14], ['Aktor', 19], ['Artefak', 22], ['Hasil kontrol', 33], ['Keputusan', 12]], [
    ['14:33:00', 'Treasury ledger', 'POS-1811-1433', 'Snapshot 5 rekening disimpan', tone('Tercatat', 'ok')],
    ...banks.filter(b => b.channel === 'SNAP BI').sort((a, b) => b.stamp.localeCompare(a.stamp)).map(b => [b.stamp, `${b.name} / SNAP`, `BAL-${b.name}-1811`, 'Respons tervalidasi sebelum merge', tone('Diterima', 'ok')]),
    ['14:30:12', 'File ingest', 'H2H-OCBC-1430', 'Jumlah record dan saldo akhir cocok', tone('Diterima', 'ok')],
    ['14:30:09', 'File ingest', 'H2H-OCBC-1430', 'Manifest dan integritas file valid', tone('Valid', 'ok')],
    ['14:29:32', 'File ingest', 'H2H-OCBC-1400', 'File telah diterapkan pada snapshot sebelumnya', tone('Duplikat', 'warn')],
  ]);
  const channels = [['01', 'SNAP BI', 'BCA · Mandiri · BNI · BRI', 'API posisi rekening'], ['02', 'Host-to-host', 'OCBC · file terjadwal', 'Validasi manifest & jumlah record'], ['03', 'Posisi kas', 'Sumber dan usia dipertahankan', 'Snapshot hanya setelah lolos kontrol']];
  return `<div class="approval channels">${channels.map(([n, label, scope, control]) => `<div><span>${n} / SUMBER</span><strong>${label}</strong><b>${scope}</b><small>${control}</small></div>`).join('')}</div><div class="split cash"><div class="stack">${panel('Inventaris jalur saldo', 'Ambang usia dari snapshot 14:33 WIB', routes)}${panel('Jejak ingest / 14:29–14:33', 'Bukti penerimaan & deduplikasi', events)}</div>${panel('Matriks kontrol konektor', 'Akses & perubahan', `<div class="padded">${note('Treasury Ops · Operator', 'Lihat saldo dan umur data. Tidak memiliki akses ke material kunci atau konfigurasi konektor.')}${note('Connectivity Admin · Maker', 'Ajukan perubahan jadwal dan rotasi identitas. Aktivasi memerlukan persetujuan Security.')}${note('Security Approver · Checker', 'Validasi perubahan, periode berlaku dan bukti pemisahan tugas.')}${note('Gagal validasi · Karantina', 'Tahan file terbaru. Tampilkan posisi terakhir dengan cap sumber dan usia; jangan anggap saldo diperbarui.')}${note('Ketidaksesuaian saldo · Rekonsiliasi', 'Pertahankan snapshot sebelumnya hingga selisih dijelaskan dan disetujui oleh Treasury Control.')}</div>`)}</div>`;
}

function exposure() {
  const chart = svgMultiLineChart({ width: 942, height: 265, xLabels: projection.map(p => p.date), yMin: 8, yMax: 15, yTicks: 7,
    series: [{ label: 'Dasar', color: '#087f6d', values: projection.map(p => bn(p.base)), dots: true }, { label: 'Stres penerimaan', color: '#b96c23', values: projection.map(p => bn(p.stress)), dots: true }],
    threshold: { value: bn(floor), label: 'Buffer minimum Rp 10,50 miliar', color: '#a33045' },
  });
  const table = grid([['Tanggal', 12], ['Masuk', 17, true], ['Keluar', 17, true], ['Tertunda / stres', 17, true], ['Kas dasar', 18, true], ['Kas stres', 19, true]], projection.map(p => [p.date, fmtIdr(p.incoming), fmtIdr(p.outgoing), fmtIdr(p.delayed), fmtIdr(p.base), fmtIdr(p.stress)]),
    { selected: projection.indexOf(trough), footer: `Posisi awal ${fmtIdr(available)} · Saldo USD tidak termasuk proyeksi kas operasional IDR` });
  const fx = grid([['USD/IDR', 25, true], ['Nilai setara', 43, true], ['Delta IDR', 32, true]], [-350, 0, 350].map(change => [fmtNum(rate + change), fmtIdr(usd * (rate + change)), fmtIdr(usd * change)]));
  return `${strip(metric('KAS IDR AWAL', compact(available), 'Sebelum pencairan BCH-412'), metric('BUFFER MINIMUM', compact(floor), 'Batas internal CFO'), metric('TITIK TERENDAH · STRES', compact(trough.stress), `${trough.date} · skenario penerimaan tertunda`), metric('KEBUTUHAN TAMBAHAN', fmtIdr(floor - trough.stress), 'Agar tetap di atas buffer sepanjang horizon'))}
    <div class="split cash"><div class="stack">${panel('Proyeksi kas bebas pakai', 'IDR miliar · D+0 hingga D+5 hari kerja', `<div class="chart">${chart}</div>`)}${panel('Asumsi arus per hari kerja', 'Skenario, bukan saldo aktual', table)}</div><div class="stack">${panel('Sensitivitas nilai kas USD', `${dollars(usd)} · kurs skenario`, fx)}${panel('Keputusan likuiditas', tone(`Pelanggaran mulai ${firstBreach.date}`, 'warn'), `<div class="padded">${note('Percepat piutang yang sudah terverifikasi', 'Tinjau penerimaan terbesar sebelum buffer terlewati. Jangan menghitung mutasi VA yang belum punya faktur.')}${note('Siapkan fasilitas likuiditas cadangan', `Diperlukan tambahan minimal <b>${fmtIdr(floor - trough.stress)}</b> untuk menutup titik rendah skenario stres.`)}${note('Pisahkan eksposur kurs dari likuiditas', `Perubahan Rp 350/USD menggeser valuasi sebesar <b>${fmtIdr(usd * 350)}</b>, bukan menambah saldo IDR yang dapat dipakai.`)}</div>`)}</div></div>`;
}

const css = `
  .e-topbar { background:#112c30; border-bottom:2px solid #4dbca7; }
  .e-brand-mark,.e-avatar { background:#087f6d; }
  .ribbon { display:flex; gap:16px; align-items:stretch; padding:0 28px; background:#173b40; color:#d4e7e4; height:50px; flex:none; }
  .ribbon span { display:flex; align-items:center; gap:9px; padding:0 17px; font-weight:650; font-size:12px; }
  .ribbon span.active { color:#fff; background:#205359; box-shadow:inset 0 -3px #69d8b7; }
  .ribbon em { font:11px var(--e-mono); font-style:normal; color:#97c4bd; }
  .work { display:flex; flex:1; flex-direction:column; gap:14px; padding:20px 28px 16px; min-height:0; }
  .heading { display:flex; align-items:end; justify-content:space-between; }
  .overline { text-transform:uppercase; letter-spacing:.10em; color:#37706b; font-weight:700; font-size:10.5px; }
  h1,h2,h3,p,dl,dd,ol { margin:0; }
  h1 { font-size:29px; line-height:1.2; letter-spacing:-.035em; }
  h2 { font-size:13.5px; } h3 { font-size:22px; letter-spacing:-.03em; }
  .stamp,.muted { color:#526c6d; } .stamp { font:11px var(--e-mono); }
  .strip,.approval { display:grid; gap:10px; grid-template-columns:repeat(4,minmax(0,1fr)); }
  .kpi,.approval > div { background:#fafffd; border:1px solid #cbdcd5; padding:12px 15px; display:grid; gap:4px; }
  .kpi { border-top:3px solid #398e7d; }
  .kpi span,.approval span { font:700 10px var(--e-mono); letter-spacing:.07em; color:#315f5b; }
  .kpi strong { font:700 23px var(--e-mono); letter-spacing:-.06em; color:#103f39; }
  small,.kpi small { color:#526c6d; font-size:11px; }
  .split { display:grid; min-height:0; gap:14px; flex:1; }
  .split.cash { grid-template-columns:minmax(0,2.65fr) minmax(0,1fr); }
  .split.workbench { grid-template-columns:minmax(0,2.4fr) minmax(0,1fr); }
  .stack { display:flex; flex-direction:column; gap:14px; min-width:0; }
  .e-panel { min-width:0; align-self:start; }
  .stack .e-panel { align-self:stretch; }
  .panelhead { min-height:39px; display:flex; gap:12px; align-items:center; justify-content:space-between; padding:0 13px; border-bottom:1px solid #cbdcd5; background:#f3faf7; }
  .panelhead > span { font-size:11px; color:#4b6867; }
  .chart { padding:6px 14px 0; }
  table.e-table { font-size:11.5px; }
  table.e-table th { background:#ebf3ef; color:#375452; font-size:10.5px; }
  table.e-table td { padding:6px 9px; height:30px; }
  .workbench table.e-table tbody td { height:35px; }
  table.e-table th { padding:7px 9px; }
  table.e-table tfoot td { background:#eaf5ee; font-weight:700; color:#275c50; padding:8px 10px; }
  .padded { padding:14px; display:grid; gap:12px; }
  .cutoff { display:grid; grid-template-columns:50px 1fr auto; gap:12px; align-items:center; min-height:45px; border-bottom:1px solid #dce6e1; }
  .cutoff time { color:#175b52; font:700 15px var(--e-mono); }
  .cutoff small,.trail small { display:block; }
  .doc { padding:14px; background:#eff7f2; border:1px solid #d4e5da; display:grid; gap:4px; }
  .doc p,.note p { line-height:1.55; color:#406160; font-size:12px; }
  .note { padding:10px 12px; background:#f7faf8; border-left:3px solid #78a99b; }
  .note strong { font-size:12px; display:block; margin-bottom:4px; }
  dl div { display:flex; justify-content:space-between; gap:10px; padding:9px 0; border-bottom:1px solid #dce6e1; font-size:12px; }
  dd { font:700 12px var(--e-mono); color:#174d46; white-space:nowrap; }
  .trail { padding-left:20px; display:grid; gap:13px; }
  .trail li::marker { color:#087f6d; font-weight:700; }
  .trail small { line-height:1.5; margin-top:2px; }
  .approval { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .approval strong { font-size:16px; }
  .approval .active { background:#fff9ee; border-color:#cba36d; }
  .channels > div { border-left:4px solid #328676; }
`;

const designs = [cashDesk, reconciliation, disbursement, connectivity, exposure];

export function verifyMath() {
  assert.equal(cash, 14_820_000_000);
  assert.equal(available, 14_283_000_000);
  assert.equal(hourly.at(-1), cash);
  assert.equal(variance, -450_000);
  assert.equal(exceptions.length, 5);
  assert.equal(new Set(receipts.map(r => r.ref)).size, receipts.length);
  assert.equal(debit - principal, 40_000);
  assert.ok(debit < payer.idr - payer.hold, 'Batch exceeds available funding');
  assert.equal(projection[0].base, available - debit);
  assert.equal(projection.at(-1).base - projection.at(-1).stress, sum(forecast, day => day[3]));
  assert.equal(firstBreach.date, '24 Nov');
  assert.equal(usd * 350, 55_300_000);
}

export function renderPages() {
  return meta.pages.map((page, i) => ({ ...page, html: wrapEnterpriseHtml({
    title: `${meta.name} — ${page.title}`, accent: '#087f6d', accentSoft: '#dcefe6', accentInk: '#104f43',
    bg: '#eaf1ed', surface2: '#f2f8f5', border: '#cbdcd5', text: '#162f32', extraCss: css,
    bodyHtml: `${renderEnvTopbar({ mark: 'KT', productName: meta.name, envLabel: 'SIMULASI · FIKTIF', tenantName: 'PT Sagara Logistik Nusantara', searchPlaceholder: 'Cari rekening, faktur, atau batch', timeRange: '18 Nov 2026 · WIB', healthText: '5 jalur monitor', userInitials: 'RP', userName: 'Ratih Pradipta', userRole: 'Group Treasurer' })}
      <nav class="ribbon" aria-label="Modul treasury">${views.map(([name], j) => `<span${i === j ? ' class="active" aria-current="page"' : ''}><em>0${j + 1}</em>${name}</span>`).join('')}</nav>
      <main class="work"><div class="heading"><div><span class="overline">Treasury / ${views[i][0]}</span><h1>${esc(page.title)}</h1></div><span class="stamp">POS-1811-1433 &nbsp; / &nbsp; 18 NOV 2026 · 14:33 WIB</span></div>${designs[i]()}</main>
      ${renderStatusFooter({ leftItems: ['Snapshot konsolidasi · 14:33 WIB', 'IDR & USD · 5 bank'], rightItems: ['Dataset fiktif', 'Workbench Treasury · ID-012'] })}`,
  }) }));
}
