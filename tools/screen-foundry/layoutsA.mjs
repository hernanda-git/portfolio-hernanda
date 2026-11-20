// Layouts A (11 genuinely distinct real-world product screen architectures).
import { esc } from './svgGraphics.mjs';
import { donutRing, hashSeed, monogram, pageWrap, pill, qrBlock, sparkPath } from './layoutsCore.mjs';

export function renderLayoutA(layout, project, pageSpec, theme, font, persona) {
  const c = project.brandColor;
  const c2 = theme.accent2;
  const seed = hashSeed(project.id + pageSpec.slug);
  const items = project.preview.items;
  const [m0, m1, m2] = project.preview.metrics;

  // ---------------------------------------------------------------------------
  // 1. POS TOUCH REGISTER (Visual SKU tile grid + right-hand serrated receipt)
  // ---------------------------------------------------------------------------
  if (layout === 'pos-touch-register') {
    const tiles = [
      ...items.map((it, i) => ({ code: it.code, name: it.title.split('—')[0].trim(), sub: it.meta || it.status, price: it.value, hot: i === 0 })),
      { code: 'SKU-05', name: `${project.standards[0]} Paket Utama`, sub: 'Terlaris', price: 'Rp 45.000', hot: true },
      { code: 'SKU-06', name: `Layanan Tambahan · ${items[1]?.meta || 'Reguler'}`, sub: 'Tersedia', price: 'Rp 28.000', hot: false },
      { code: 'SKU-07', name: `Bundel Promo ${project.name.split(' ')[0]}`, sub: 'Hemat 15%', price: 'Rp 82.000', hot: false },
      { code: 'SKU-08', name: `Ekspres / Prioritas Antrean`, sub: 'Kilat', price: 'Rp 19.500', hot: false },
      { code: 'SKU-09', name: `Addon Kemasan & Segel`, sub: 'Stok 140', price: 'Rp 8.000', hot: false },
    ];
    const tileColors = [c, c2, '#0f766e', '#b45309', '#1d4ed8', '#7c2d12', '#047857', '#6d28d9', '#be185d'];

    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:1fr 370px;background:${theme.bg}">
      <div style="display:flex;flex-direction:column;overflow:hidden;border-right:1px solid ${theme.borderStrong}">
        <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 20px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            ${monogram(project.name, c, 32, 7)}
            <div>
              <div class="hd" style="font-size:15px;font-weight:700">${esc(project.name)} · ${esc(pageSpec.title)}</div>
              <div class="mono muted">${esc(persona)} · ${esc(project.preview.envTag)}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="padding:6px 12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:6px;font-size:11.5px;color:${theme.muted}">Cari kode / scan barcode...</span>
            <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">OFFLINE SYNC OK</span>
          </div>
        </header>

        <div style="padding:12px 20px;display:flex;gap:8px;background:${theme.surface2};border-bottom:1px solid ${theme.border}">
          ${['Semua Item', 'Terlaris', project.standards[0], 'Paket & Promo', 'Layanan'].map((tab, i) => `
            <span style="padding:6px 14px;border-radius:6px;font-size:12px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? c : theme.surface};color:${i === 0 ? '#fff' : theme.text};border:1px solid ${i === 0 ? c : theme.border}">${esc(tab)}</span>
          `).join('')}
        </div>

        <div style="flex:1;padding:18px 20px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:14px">
          ${tiles.slice(0, 9).map((t, i) => {
            const tc = tileColors[(seed + i) % tileColors.length];
            return `<div style="background:${theme.surface};border:1.5px solid ${i === 0 ? c : theme.border};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;position:relative">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <div style="width:44px;height:44px;border-radius:8px;background:${tc};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cascadia Mono',monospace;font-weight:700;font-size:12px">${esc(t.code.slice(0, 4))}</div>
                ${t.hot ? `<span class="pill" style="background:#fef3e0;color:#9a5400;border-color:#f4d39e">POPULER</span>` : `<span class="mono muted">${esc(t.sub)}</span>`}
              </div>
              <div style="margin:10px 0 6px">
                <div style="font-weight:700;font-size:13.5px;line-height:1.25">${esc(t.name.slice(0, 36))}</div>
                <div class="muted" style="margin-top:2px">${esc(t.code)} · Siap proses</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px dashed ${theme.border}">
                <span class="mono" style="font-weight:700;font-size:14px;color:${c}">${esc(t.price)}</span>
                <span style="width:26px;height:26px;border-radius:6px;background:${c};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:15px">+</span>
              </div>
            </div>`;
          }).join('')}
        </div>

        <footer style="height:40px;background:${theme.surface};border-top:1px solid ${theme.border};padding:0 20px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px">
          <span class="mono muted">${esc(m0.label)}: <strong style="color:${theme.text}">${esc(m0.value)}</strong> · ${esc(m1.label)}: <strong style="color:${theme.text}">${esc(m1.value)}</strong></span>
          <span class="mono muted">Thermal Printer 80mm · Cash Drawer Terhubung</span>
        </footer>
      </div>

      <!-- Right-hand Live Receipt & Checkout -->
      <aside style="background:${theme.surface};display:flex;flex-direction:column;padding:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid ${theme.borderStrong}">
          <div>
            <div class="hd" style="font-size:16px;font-weight:700">Pesanan Aktif #POS-${1040 + (seed % 90)}</div>
            <div class="mono muted">Meja / Antrean · 14:22 WIB</div>
          </div>
          <span class="pill" style="background:${theme.surface2};color:${c};border-color:${theme.border}">4 ITEM</span>
        </div>

        <div style="flex:1;padding:12px 0;display:flex;flex-direction:column;gap:10px;overflow:hidden">
          ${items.map((it, i) => `
            <div style="padding:10px 12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:7px;display:flex;justify-content:space-between;gap:10px">
              <div style="min-width:0">
                <div style="font-weight:700;font-size:12px" class="clamp1">${i + 1}x ${esc(it.title)}</div>
                <div class="muted clamp1">${esc(it.subtitle)}</div>
              </div>
              <div class="mono" style="font-weight:700;font-size:12px;white-space:nowrap;color:${theme.text}">${esc(it.value)}</div>
            </div>
          `).join('')}

          <div style="margin-top:auto;padding:12px;background:${theme.bg};border:1px dashed ${theme.borderStrong};border-radius:7px;display:flex;flex-direction:column;gap:5px;font-size:12px">
            <div style="display:flex;justify-content:space-between"><span class="muted">Subtotal</span><span class="mono">Rp 248.000</span></div>
            <div style="display:flex;justify-content:space-between"><span class="muted">PB1 / PPN 11%</span><span class="mono">Rp 27.280</span></div>
            <div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid ${theme.border};font-size:16px;font-weight:700">
              <span>TOTAL BAYAR</span>
              <span class="mono" style="color:${c}">Rp 275.280</span>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div style="padding:10px;border:1.5px solid ${c};background:${theme.surface2};border-radius:7px;text-align:center;font-weight:700;font-size:12px;color:${c}">QRIS Dinamis</div>
          <div style="padding:10px;border:1px solid ${theme.borderStrong};border-radius:7px;text-align:center;font-weight:600;font-size:12px">Tunai / EDC</div>
        </div>
        <div style="padding:13px;background:${c};color:#fff;border-radius:8px;text-align:center;font-weight:700;font-size:14px;letter-spacing:0.01em">
          ${esc(project.preview.primaryAction)} · Rp 275.280
        </div>
      </aside>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 2. KDS KITCHEN / STATION TICKET BOARD (6 live elapsed-timer ticket cards)
  // ---------------------------------------------------------------------------
  if (layout === 'kds-kitchen-board') {
    const tickets = [
      { id: '#0412', elapsed: '11:42', tone: '#dc2626', tag: 'LEWAT SLA', title: items[0].title, sub: items[0].subtitle, lines: [items[0].value, project.features[0].slice(0, 42), 'Prioritas eskalasi supervisor'] },
      { id: '#0413', elapsed: '06:18', tone: '#d97706', tag: 'PROSES', title: items[1].title, sub: items[1].subtitle, lines: [items[1].value, project.features[1].slice(0, 42), 'Verifikasi kualitas akhir'] },
      { id: '#0414', elapsed: '03:54', tone: c, tag: 'AKTIF', title: items[2].title, sub: items[2].subtitle, lines: [items[2].value, project.features[2].slice(0, 42), 'Sesuai standar operasional'] },
      { id: '#0415', elapsed: '02:09', tone: '#16a34a', tag: 'BARU MASUK', title: items[3].title, sub: items[3].subtitle, lines: [items[3].value, project.features[3].slice(0, 42), 'Siap dikerjakan stasiun 2'] },
      { id: '#0416', elapsed: '01:27', tone: '#0284c7', tag: 'TERJADWAL', title: `Batch ${project.standards[0]} #2`, sub: 'Antrean otomatis sinkron real-time', lines: [m0.value, `Target ${m1.label}: ${m1.value}`, 'Cek kelengkapan dokumen'] },
      { id: '#0417', elapsed: '00:38', tone: '#16a34a', tag: 'SIAP AMBIL', title: `Konfirmasi ${project.name}`, sub: persona, lines: [m2.value, 'QR / BAST siap cetak', 'Notifikasi otomatis terkirim'] },
    ];

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#10141c;color:#edf2f7">
      <header style="height:54px;background:#090c12;border-bottom:1px solid #253045;padding:0 22px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="width:10px;height:10px;border-radius:50%;background:#22c55e"></span>
          <strong class="hd" style="font-size:16px">${esc(project.name)} — ${esc(pageSpec.title)}</strong>
          <span class="mono" style="padding:3px 9px;background:#182133;border:1px solid #2b3b59;border-radius:4px;font-size:10.5px;color:#7dd3fc">${esc(project.preview.envTag)}</span>
        </div>
        <div style="display:flex;gap:16px;align-items:center" class="mono">
          <span style="color:#f87171;font-weight:700">1 LEWAT SLA</span>
          <span style="color:#fbbf24;font-weight:700">2 PROSES</span>
          <span style="color:#34d399;font-weight:700">RATA2 4m 12d</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <main style="flex:1;padding:18px 22px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px">
        ${tickets.map((tk) => `
          <div style="background:#171d29;border:1.5px solid #2a354b;border-top:5px solid ${tk.tone};border-radius:9px;display:flex;flex-direction:column;overflow:hidden">
            <div style="padding:11px 14px;background:#1d2535;border-bottom:1px solid #2a354b;display:flex;justify-content:space-between;align-items:center">
              <div>
                <span class="mono" style="font-weight:700;font-size:14px;color:#fff">${tk.id}</span>
                <span style="margin-left:8px;padding:2px 7px;border-radius:4px;background:${tk.tone};color:#fff;font-size:9.5px;font-weight:700">${tk.tag}</span>
              </div>
              <span class="mono" style="font-size:16px;font-weight:700;color:${tk.tone}">${tk.elapsed}</span>
            </div>
            <div style="padding:13px 14px;flex:1;display:flex;flex-direction:column;gap:8px">
              <div style="font-weight:700;font-size:13.5px;color:#f8fafc">${esc(tk.title)}</div>
              <div style="font-size:11px;color:#94a3b8">${esc(tk.sub)}</div>
              <div style="margin-top:4px;display:flex;flex-direction:column;gap:6px">
                ${tk.lines.map((ln, idx) => `
                  <div style="display:flex;align-items:center;gap:8px;font-size:11.5px;padding:6px 8px;background:#111622;border-radius:5px;border:1px solid #242f45">
                    <span style="width:14px;height:14px;border-radius:3px;border:1.5px solid ${idx === 0 ? '#34d399' : '#64748b'};background:${idx === 0 ? '#065f46' : 'transparent'};display:inline-flex;align-items:center;justify-content:center;font-size:9px;color:#34d399">${idx === 0 ? 'v' : ''}</span>
                    <span class="clamp1">${esc(ln)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="padding:9px 14px;background:#131823;border-top:1px solid #242f45;display:flex;justify-content:space-between;align-items:center">
              <span class="mono" style="font-size:10px;color:#94a3b8">${esc(persona.split('·')[0])}</span>
              <span style="padding:4px 12px;border-radius:5px;background:${tk.tone};color:#fff;font-size:11px;font-weight:700">Tandai Selesai</span>
            </div>
          </div>
        `).join('')}
      </main>

      <footer style="height:42px;background:#090c12;border-top:1px solid #253045;padding:0 22px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8" class="mono">
        <span>STASIUN AKTIF: 6 TIKET · ${esc(project.standards.join(' · '))}</span>
        <span>${esc(project.preview.snippet.slice(0, 88))}</span>
      </footer>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 3. STADIUM / CARRIAGE / VENUE SEATING MAP (Curved seating bowl + ticket lock)
  // ---------------------------------------------------------------------------
  if (layout === 'stadium-seating-map') {
    const isTrain = project.sector === 'logistics' || project.name.toLowerCase().includes('whoosh');
    const seatDots = [];
    if (isTrain) {
      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 5; col++) {
          if (col === 2) continue;
          const x = 135 + row * 38;
          const y = 76 + col * 52;
          const st = (row * 7 + col * 3 + seed) % 9;
          const fill = (row === 4 && col === 1) || (row === 4 && col === 0) ? c : st < 4 ? '#cbd5e1' : '#16a34a';
          seatDots.push(`<rect x="${x}" y="${y}" width="26" height="34" rx="5" fill="${fill}" stroke="${theme.borderStrong}" stroke-width="1"/>`);
          seatDots.push(`<text x="${x + 13}" y="${y + 20}" text-anchor="middle" font-size="8.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="#fff">${row + 1}${['A', 'B', '', 'C', 'D'][col]}</text>`);
        }
      }
    } else {
      for (let ring = 0; ring < 5; ring++) {
        const radius = 108 + ring * 34;
        const count = 18 + ring * 5;
        for (let j = 0; j < count; j++) {
          const ang = Math.PI * 0.14 + (j / (count - 1)) * Math.PI * 0.72;
          const x = 350 + Math.cos(ang) * radius * 1.25;
          const y = 55 + Math.sin(ang) * radius * 0.92;
          const taken = (j * 5 + ring * 11 + seed) % 7 < 3;
          const chosen = ring === 1 && (j === 9 || j === 10);
          const col = chosen ? '#f59e0b' : taken ? '#94a3b8' : ring === 0 ? c : ring < 3 ? '#0f766e' : '#2563eb';
          seatDots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${col}"/>`);
        }
      }
    }

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:58px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 26px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 32, 8)}
          <div>
            <div class="hd" style="font-size:16px;font-weight:700">${esc(project.name)} · ${esc(pageSpec.title)}</div>
            <div class="mono muted">${esc(project.preview.surfaceTitle)}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="pill" style="background:#fef3e0;color:#9a5400;border-color:#f4d39e">KUNCI KURSI 07:42</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;padding:20px 26px;display:grid;grid-template-columns:1fr 350px;gap:20px;overflow:hidden">
        <div class="card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong class="hd" style="font-size:15px">${isTrain ? 'Denah Gerbong 4 — Premium Economy (Arah Bandung ->)' : 'Peta Kursi & Zona Interaktif — Live Inventory'}</strong>
              <div class="muted">Klik kursi atau zona untuk mengunci kuota dengan proteksi anti-bot</div>
            </div>
            <div style="display:flex;gap:12px;font-size:11px">
              <span><strong style="color:#16a34a">●</strong> Tersedia</span>
              <span><strong style="color:#f59e0b">●</strong> Dipilih (2)</span>
              <span><strong style="color:#94a3b8">●</strong> Terisi</span>
            </div>
          </div>

          <svg viewBox="0 0 700 390" width="100%" style="background:${theme.surface2};border:1px solid ${theme.border};border-radius:10px;margin:12px 0">
            ${isTrain
              ? `<rect x="70" y="42" width="560" height="310" rx="28" fill="${theme.surface}" stroke="${theme.borderStrong}" stroke-width="2"/>
                 <text x="350" y="212" text-anchor="middle" font-size="11" font-family="Cascadia Mono,monospace" fill="${theme.muted}">LORONG GERBONG 4 · KECEPATAN 350 KM/JAM · WIFI AKTIF</text>`
              : `<rect x="210" y="18" width="280" height="44" rx="8" fill="${c}"/>
                 <text x="350" y="45" text-anchor="middle" font-size="13" font-family="Cascadia Mono,monospace" font-weight="700" fill="#fff">PANGGUNG UTAMA / ARENA</text>`
            }
            ${seatDots.join('')}
          </svg>

          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">
            ${items.map((it, i) => `
              <div style="min-width:0;padding:10px;background:${theme.surface2};border:1px solid ${i === 0 ? c : theme.border};border-radius:7px">
                <div class="mono" style="font-size:10px;color:${c};font-weight:700">${esc(it.code)}</div>
                <div style="font-weight:700;font-size:12px;margin:2px 0" class="clamp1">${esc(it.title)}</div>
                <div class="mono clamp1" style="font-size:13px;font-weight:700">${esc(it.value)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:15px">Ringkasan Reservasi</strong>
            <span class="mono muted">${esc(project.id)}</span>
          </div>
          <div style="padding:14px;background:${c};color:#fff;border-radius:9px">
            <div class="mono" style="font-size:10px;opacity:0.85">${esc(project.standards[0])}</div>
            <div class="hd" style="font-size:18px;font-weight:700;margin-top:4px">${isTrain ? 'Gerbong 4 · Kursi 5A & 5B' : 'CAT 1 Front · Baris B #10-11'}</div>
            <div class="mono" style="font-size:12px;opacity:0.9;margin-top:6px">${esc(m0.label)}: ${esc(m0.value)}</div>
          </div>

          <div style="display:flex;justify-content:center;padding:10px;background:${theme.surface2};border:1px dashed ${theme.borderStrong};border-radius:8px;gap:14px;align-items:center">
            ${qrBlock(seed, 84, theme.dark ? '#111827' : '#0f172a')}
            <div>
              <div style="font-weight:700;font-size:12px">QR Dinamis 30 Detik</div>
              <div class="muted" style="margin-top:3px">Anti-calo &amp; terikat NIK pembeli</div>
              <div class="mono" style="font-size:10px;color:${c};margin-top:6px">TOTP VALID · WIB</div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:7px;font-size:12px">
            <div style="display:flex;justify-content:space-between"><span class="muted">2x Tiket Terpilih</span><span class="mono" style="font-weight:700">Rp 1.850.000</span></div>
            <div style="display:flex;justify-content:space-between"><span class="muted">Pajak Hiburan PB1 10%</span><span class="mono">Rp 185.000</span></div>
            <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid ${theme.border};font-size:15px;font-weight:700">
              <span>Total Bayar</span><span class="mono" style="color:${c}">Rp 2.035.000</span>
            </div>
          </div>

          <div style="margin-top:auto;padding:12px;background:${c};color:#fff;border-radius:8px;text-align:center;font-weight:700;font-size:13px">
            Lanjut Bayar via QRIS / VA ->
          </div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 4. GANTT TAPE CHART (14-day/slot horizontal reservation/operations matrix)
  // ---------------------------------------------------------------------------
  if (layout === 'gantt-tape-chart') {
    const cols = ['18 Nov', '19 Nov', '20 Nov', '21 Nov', '22 Nov', '23 Nov', '24 Nov', '25 Nov', '26 Nov', '27 Nov'];
    const rowNames = [
      items[0].title.slice(0, 26),
      items[1].title.slice(0, 26),
      items[2].title.slice(0, 26),
      items[3].title.slice(0, 26),
      `Unit #05 · ${project.standards[0]}`,
      `Unit #06 · Zona Prioritas`,
      `Unit #07 · Jadwal Reguler`,
      `Unit #08 · Cadangan Siaga`,
    ];
    const barColors = [c, '#0f766e', '#d97706', '#2563eb', '#be185d', '#4338ca'];

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 6)}
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)} — ${esc(pageSpec.title)}</strong>
            <div class="mono muted">${esc(project.preview.envTag)} · ${esc(persona)}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">0 BENTROK JADWAL</span>
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="padding:14px 24px;display:flex;gap:14px;background:${theme.surface2};border-bottom:1px solid ${theme.border}">
        ${[m0, m1, m2].map((m) => `
          <div style="padding:8px 14px;background:${theme.surface};border:1px solid ${theme.border};border-radius:6px;display:flex;gap:12px;align-items:baseline">
            <span class="muted">${esc(m.label)}</span>
            <strong class="mono" style="font-size:15px;color:${c}">${esc(m.value)}</strong>
          </div>
        `).join('')}
        <div style="margin-left:auto;display:flex;gap:12px;align-items:center;font-size:11px">
          <span><strong style="color:${c}">■</strong> Terkonfirmasi</span>
          <span><strong style="color:#0f766e">■</strong> Sedang Berjalan</span>
          <span><strong style="color:#d97706">■</strong> Menunggu Verifikasi</span>
        </div>
      </div>

      <main style="flex:1;padding:18px 24px;display:flex;flex-direction:column;overflow:hidden">
        <div class="card" style="flex:1;display:flex;flex-direction:column">
          <div style="display:grid;grid-template-columns:230px repeat(10,1fr);background:${theme.surface2};border-bottom:1px solid ${theme.borderStrong};font-size:11px;font-weight:700">
            <div style="padding:10px 14px;border-right:1px solid ${theme.border}">Unit / Sumber Daya</div>
            ${cols.map((d, idx) => `<div style="padding:10px 6px;text-align:center;border-right:1px solid ${theme.border};background:${idx === 2 ? c : 'transparent'};color:${idx === 2 ? '#fff' : theme.muted}">${d}</div>`).join('')}
          </div>

          <div style="flex:1;display:grid;grid-template-rows:repeat(8,1fr)">
            ${rowNames.map((rn, r) => {
              const start1 = (r * 2 + (seed % 3)) % 5;
              const span1 = 2 + ((r + seed) % 3);
              const start2 = Math.min(9, start1 + span1 + 1);
              const span2 = Math.max(1, 10 - start2 - (r % 2));
              const col1 = barColors[(r + seed) % barColors.length];
              const col2 = barColors[(r + seed + 2) % barColors.length];
              return `<div style="display:grid;grid-template-columns:230px 1fr;border-bottom:1px solid ${theme.border};align-items:center">
                <div style="padding:0 14px;border-right:1px solid ${theme.border};height:100%;display:flex;flex-direction:column;justify-content:center">
                  <div style="font-weight:600;font-size:12px" class="clamp1">${esc(rn)}</div>
                  <div class="mono muted" style="font-size:9.5px">${esc(items[r % items.length].code)} · ${esc(items[r % items.length].status)}</div>
                </div>
                <div style="position:relative;height:100%;display:grid;grid-template-columns:repeat(10,1fr)">
                  ${cols.map((_, ci) => `<div style="border-right:1px solid ${theme.border};background:${ci === 2 ? (theme.dark ? 'rgba(56,189,248,0.06)' : 'rgba(15,82,186,0.04)') : 'transparent'}"></div>`).join('')}
                  <div style="position:absolute;top:11px;bottom:11px;left:${start1 * 10 + 0.6}%;width:${span1 * 10 - 1.2}%;background:${col1};color:#fff;border-radius:5px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:600">
                    <span class="clamp1">${esc(items[r % items.length].value)} · ${esc(items[r % items.length].meta || 'Slot A')}</span>
                  </div>
                  ${start2 < 9 ? `<div style="position:absolute;top:11px;bottom:11px;left:${start2 * 10 + 0.6}%;width:${span2 * 10 - 1.2}%;background:${col2};color:#fff;border-radius:5px;padding:0 10px;display:flex;align-items:center;font-size:11px;font-weight:600;opacity:0.9">
                    <span class="clamp1">Batch #${r + 14} Terkunci</span>
                  </div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 5. DICOM RADIOLOGY / COMPUTER VISION QUAD VIEWPORT (Pitch-black clinical/vision HUD)
  // ---------------------------------------------------------------------------
  if (layout === 'dicom-radiology-pacs') {
    const isMedical = project.sector === 'healthcare';
    const panes = isMedical
      ? [
          { lbl: 'AXIAL THORAX PA · 120kV', det: 'AI NODULE 96.4%', box: [155, 86, 62, 54], col: '#ef4444' },
          { lbl: 'CORONAL LUNG WINDOW', det: 'INFILTRAT RUL', box: [120, 74, 54, 48], col: '#f59e0b' },
          { lbl: 'SAGITTAL SPINE RECON', det: 'ALIGNMENT OK', box: [168, 92, 44, 60], col: '#22c55e' },
          { lbl: '3D MIP VESSEL OVERLAY', det: 'CTR 0.48 NORMAL', box: [130, 80, 74, 56], col: '#38bdf8' },
        ]
      : [
          { lbl: `CAM-01 · ${items[0].code}`, det: `${items[0].status} · 97.2%`, box: [118, 72, 76, 68], col: '#ef4444' },
          { lbl: `CAM-02 · ${items[1].code}`, det: `${items[1].status} · 94.8%`, box: [164, 88, 66, 58], col: '#f59e0b' },
          { lbl: `CAM-03 · ${items[2].code}`, det: `${items[2].status} · 99.1%`, box: [96, 68, 70, 62], col: '#22c55e' },
          { lbl: `CAM-04 · ${items[3].code}`, det: `${items[3].status} · 98.4%`, box: [148, 78, 74, 62], col: '#38bdf8' },
        ];

    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:56px 1fr 330px;background:#05070a;color:#e2e8f0">
      <aside style="background:#0c1017;border-right:1px solid #1e2636;display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:12px" class="mono">
        <div style="width:34px;height:34px;border-radius:6px;background:${c};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${esc(project.name.slice(0, 2).toUpperCase())}</div>
        ${['WL', 'ZM', 'RL', 'AI', '3D', 'SG'].map((tool, i) => `
          <div style="width:36px;height:36px;border-radius:6px;background:${i === 3 ? '#1e3a5f' : '#141a24'};border:1px solid ${i === 3 ? '#38bdf8' : '#232c3d'};color:${i === 3 ? '#7dd3fc' : '#94a3b8'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700">${tool}</div>
        `).join('')}
      </aside>

      <div style="display:flex;flex-direction:column;overflow:hidden">
        <header style="height:44px;background:#0a0e14;border-bottom:1px solid #1e2636;padding:0 16px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px" class="mono">
          <span><strong style="color:#fff">${esc(project.name.toUpperCase())}</strong> · ${esc(pageSpec.title)} · ${esc(project.preview.envTag)}</span>
          <span style="color:#38bdf8">W/L: 1500 / -600 HU · 24 FPS</span>
        </header>

        <div style="flex:1;padding:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px">
          ${panes.map((p) => `
            <div style="background:#020305;border:1px solid #243045;border-radius:5px;position:relative;overflow:hidden;display:flex;flex-direction:column">
              <div style="padding:6px 10px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8" class="mono">
                <span>${esc(p.lbl)}</span>
                <span style="color:${p.col};font-weight:700">${esc(p.det)}</span>
              </div>
              <svg viewBox="0 0 340 210" width="100%" style="flex:1">
                <ellipse cx="170" cy="105" rx="108" ry="82" fill="#111827" stroke="#334155" stroke-width="1.5"/>
                <ellipse cx="132" cy="102" rx="42" ry="62" fill="#1e293b" opacity="0.85"/>
                <ellipse cx="208" cy="102" rx="42" ry="62" fill="#1e293b" opacity="0.85"/>
                <line x1="170" y1="22" x2="170" y2="188" stroke="#475569" stroke-width="2" stroke-dasharray="4 3"/>
                <rect x="${p.box[0]}" y="${p.box[1]}" width="${p.box[2]}" height="${p.box[3]}" fill="${p.col}" fill-opacity="0.16" stroke="${p.col}" stroke-width="2"/>
                <text x="${p.box[0]}" y="${p.box[1] - 5}" font-size="9" font-family="Cascadia Mono,monospace" font-weight="700" fill="${p.col}">${esc(p.det)}</text>
              </svg>
            </div>
          `).join('')}
        </div>
      </div>

      <aside style="background:#0c1017;border-left:1px solid #1e2636;padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong class="hd" style="font-size:14px;color:#fff">${isMedical ? 'Expertise & TTE Dokter' : 'Deteksi & Aksi PLC'}</strong>
          <span class="mono" style="font-size:10px;color:#38bdf8">${esc(project.id)}</span>
        </div>
        <div style="padding:10px 12px;background:#121926;border:1px solid #243045;border-radius:6px;font-size:11.5px">
          <div class="mono" style="font-size:9.5px;color:#94a3b8">${esc(persona)}</div>
          <div style="font-weight:700;color:#fff;margin-top:3px">${esc(items[0].title)}</div>
          <div style="color:#94a3b8;font-size:11px;margin-top:2px">${esc(items[0].subtitle)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex:1">
          ${items.map((it) => `
            <div style="padding:9px 10px;background:#111722;border-left:3px solid ${it.tone === 'bad' ? '#ef4444' : it.tone === 'warn' ? '#f59e0b' : '#22c55e'};border-radius:4px">
              <div style="display:flex;justify-content:space-between"><span class="mono" style="font-size:10px;color:#7dd3fc">${esc(it.code)}</span>${pill(it.status, it.tone, true)}</div>
              <div style="font-size:11.5px;font-weight:600;color:#f1f5f9;margin-top:3px">${esc(it.title)}</div>
              <div class="mono" style="font-size:10px;color:#94a3b8;margin-top:2px">${esc(it.value)}</div>
            </div>
          `).join('')}
        </div>
        <div style="padding:10px;background:#05080d;border:1px solid #1e293b;border-radius:5px;font-size:10px;color:#34d399" class="mono">${esc(project.preview.snippet.slice(0, 120))}</div>
        <div style="padding:11px;background:${c};color:#fff;border-radius:7px;text-align:center;font-weight:700;font-size:12.5px">${esc(project.preview.primaryAction)}</div>
      </aside>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 6. DOCUMENT REDLINE EDITOR (Notion/Word legal, notary, tax & policy studio)
  // ---------------------------------------------------------------------------
  if (layout === 'document-redline-editor') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:54px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 26px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 6)}
          <strong class="hd" style="font-size:15px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
          <span class="pill" style="background:#fef3e0;color:#9a5400;border-color:#f4d39e">DRAFT REV. 3 · TRACK CHANGES</span>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;padding:20px 30px;display:grid;grid-template-columns:220px 1fr 300px;gap:20px;overflow:hidden">
        <aside class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px">
          <div class="mono muted" style="font-size:10px;font-weight:700">STRUKTUR DOKUMEN</div>
          ${['Pasal 1 · Definisi & Ruang Lingkup', 'Pasal 4 · Kewajiban Kepatuhan', 'Pasal 9 · Mekanisme Pembayaran', 'Pasal 14 · Perlindungan Data', 'Lampiran A · Standar Teknis', 'Lembar Pengesahan & TTE'].map((s, i) => `
            <div style="padding:8px 10px;border-radius:6px;font-size:11.5px;font-weight:${i === 3 ? 700 : 500};background:${i === 3 ? theme.surface2 : 'transparent'};color:${i === 3 ? c : theme.text};border-left:3px solid ${i === 3 ? c : 'transparent'}">${s}</div>
          `).join('')}
          <div style="margin-top:auto;padding-top:12px;border-top:1px solid ${theme.border}">
            <div class="muted">Standar Rujukan</div>
            <div class="mono" style="font-size:10.5px;font-weight:700;color:${c};margin-top:4px">${esc(project.standards.join(' · '))}</div>
          </div>
        </aside>

        <!-- Clean Paper Document Sheet -->
        <article style="background:#fffdf8;color:#1e1b16;border:1px solid #d8cfc0;border-radius:6px;padding:30px 36px;box-shadow:0 8px 24px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:14px;overflow:hidden;font-family:Georgia,serif">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2b2620;padding-bottom:12px">
            <div>
              <div class="mono" style="font-size:10px;color:${c};font-weight:700">DOKUMEN RESMI · ${esc(project.id)} · ${esc(project.preview.envTag)}</div>
              <h1 style="margin:4px 0 0;font-size:21px">${esc(project.preview.surfaceTitle)}</h1>
            </div>
            ${qrBlock(seed, 52, '#1e1b16')}
          </div>

          <p style="margin:0;font-size:13.5px;line-height:1.7">
            <strong>Pasal 14.1 — Kepatuhan &amp; Verifikasi:</strong> Para pihak sepakat bahwa seluruh proses <em>${esc(project.tagline)}</em> dilaksanakan berdasarkan ketentuan ${esc(project.standards.join(', '))} yang berlaku di wilayah hukum Republik Indonesia.
          </p>

          <p style="margin:0;font-size:13.5px;line-height:1.7;padding:12px 14px;background:#faf5eb;border-left:3px solid ${c}">
            <strong>Pasal 14.2 — Tenggat &amp; Akuntabilitas:</strong> Penyampaian notifikasi insiden atau koreksi wajib dilakukan paling lambat
            <span style="background:#fee2e2;color:#991b1b;text-decoration:line-through;padding:1px 4px">7 (tujuh) hari kerja</span>
            <span style="background:#dcfce7;color:#166534;font-weight:700;padding:1px 5px">3 x 24 (tiga kali dua puluh empat) jam</span>
            sejak diketahui, disertai jejak audit kriptografi pada sistem ${esc(project.name)}.
          </p>

          <p style="margin:0;font-size:13px;line-height:1.65;color:#4a4339">
            <strong>Konteks Ekosistem:</strong> ${esc(project.indonesiaContext)}
          </p>

          <div style="margin-top:auto;padding-top:14px;border-top:1px solid #e2d9ca;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-family:'Segoe UI',sans-serif;font-size:11.5px">
            <div style="padding:10px;border:1px solid #d6cbb9;border-radius:5px">
              <div class="mono" style="font-size:9.5px;color:#6e6353">PIHAK PERTAMA · TERVERIFIKASI</div>
              <div style="font-weight:700;margin-top:4px">${esc(persona)}</div>
            </div>
            <div style="padding:10px;border:1px dashed ${c};border-radius:5px;background:#f8fafc">
              <div class="mono" style="font-size:9.5px;color:${c}">HASH INTEGRITAS SHA-256</div>
              <div class="mono" style="font-size:10px;margin-top:4px">e3b0c44298fc...9bf56d1c · VALID</div>
            </div>
          </div>
        </article>

        <!-- Margin Review Annotations -->
        <aside style="display:flex;flex-direction:column;gap:12px">
          <div class="card" style="padding:14px;border-left:4px solid #dc2626">
            <div style="display:flex;justify-content:space-between"><strong style="font-size:12px">Temuan Kritis · Pasal 14.2</strong>${pill('Koreksi', 'bad', theme.dark)}</div>
            <p class="muted" style="margin:6px 0 8px;line-height:1.45">${esc(items[0].title)} — ${esc(items[0].subtitle)}</p>
            <span class="btn-p" style="background:#16a34a;padding:4px 10px;font-size:11px">Terima Revisi AI</span>
          </div>
          ${items.slice(1, 4).map((it) => `
            <div class="card" style="padding:12px">
              <div style="display:flex;justify-content:space-between;align-items:center"><span class="mono" style="font-size:10px;color:${c};font-weight:700">${esc(it.code)}</span>${pill(it.status, it.tone, theme.dark)}</div>
              <div style="font-weight:700;font-size:12px;margin-top:4px">${esc(it.title)}</div>
              <div class="muted" style="margin-top:2px">${esc(it.subtitle)}</div>
            </div>
          `).join('')}
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 7. IDE CODE DIFF WORKBENCH (Authentic VS Code / JetBrains dark diff + terminal)
  // ---------------------------------------------------------------------------
  if (layout === 'ide-code-diff-workbench') {
    const slug = project.name.replace(/[^A-Za-z0-9]/g, '');
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#0d1117;color:#e6edf3">
      <header style="height:38px;background:#161b22;border-bottom:1px solid #30363d;padding:0 16px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="width:11px;height:11px;border-radius:50%;background:#ff5f56"></span>
          <span style="width:11px;height:11px;border-radius:50%;background:#ffbd2e"></span>
          <span style="width:11px;height:11px;border-radius:50%;background:#27c93f"></span>
          <span class="mono" style="margin-left:10px;font-weight:700">${esc(project.name)} Studio — ${esc(pageSpec.title)}</span>
        </div>
        <span class="mono" style="color:#8b949e">branch: main · ${esc(project.stack[0])} · ${esc(project.preview.envTag)}</span>
      </header>

      <div style="flex:1;display:grid;grid-template-columns:235px 1fr;overflow:hidden">
        <aside style="background:#0d1117;border-right:1px solid #30363d;padding:12px;font-size:12px;display:flex;flex-direction:column;gap:4px" class="mono">
          <div style="font-size:10px;color:#8b949e;margin-bottom:6px">EXPLORER · ${esc(slug.toUpperCase())}</div>
          ${[
            `v src/`,
            `  > Domain/`,
            `  * ${slug}Engine.cs`,
            `  * ${items[0].code.replace(/[^A-Za-z0-9]/g, '')}Handler.cs`,
            `  * ComplianceGuard.cs`,
            `v contracts/`,
            `  * ${project.standards[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}.yaml`,
            `v tests/`,
            `  * ${slug}Tests.cs (48 pass)`,
          ].map((f, i) => `<div style="padding:5px 8px;border-radius:4px;background:${i === 2 ? '#1f2937' : 'transparent'};color:${i === 2 ? '#58a6ff' : '#c9d1d9'}">${esc(f)}</div>`).join('')}

          <div style="margin-top:auto;padding-top:12px;border-top:1px solid #30363d;font-size:10.5px;color:#8b949e">
            <div style="color:#3fb950;font-weight:700">BUILD: 0 WARN / 0 ERR</div>
            <div style="margin-top:4px">${esc(m0.label)}: ${esc(m0.value)}</div>
            <div>${esc(m1.label)}: ${esc(m1.value)}</div>
          </div>
        </aside>

        <div style="display:flex;flex-direction:column;overflow:hidden">
          <div style="height:34px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;padding:0 12px;gap:14px;font-size:11.5px" class="mono">
            <span style="color:#fff;border-bottom:2px solid ${c};padding:7px 4px">${esc(slug)}Engine.cs (Diff)</span>
            <span style="color:#8b949e">ComplianceGuard.cs</span>
            <span style="color:#8b949e">schema.sql</span>
            <span style="margin-left:auto" class="btn-p" style="background:${c};padding:3px 10px">${esc(project.preview.primaryAction)}</span>
          </div>

          <!-- Split Side-by-Side Diff -->
          <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #30363d;font-size:11.5px;line-height:1.75;overflow:hidden" class="mono">
            <div style="border-right:1px solid #30363d;padding:12px 14px;background:#0d1117">
              <div style="color:#8b949e;margin-bottom:6px">--- SEBELUM (Legacy / Unverified)</div>
              <div><span style="color:#6e7681;margin-right:10px">12</span>public async Task&lt;Result&gt; ExecuteAsync(Req r) {</div>
              <div style="background:#3d1a1d;color:#ffa198;padding:0 6px"><span style="color:#f85149;margin-right:10px">13 -</span>  // Masalah: ${esc(project.problem.slice(0, 52))}</div>
              <div style="background:#3d1a1d;color:#ffa198;padding:0 6px"><span style="color:#f85149;margin-right:10px">14 -</span>  var raw = await _legacy.CallWithoutGuard(r);</div>
              <div style="background:#3d1a1d;color:#ffa198;padding:0 6px"><span style="color:#f85149;margin-right:10px">15 -</span>  return Result.Unverified(raw);</div>
              <div><span style="color:#6e7681;margin-right:10px">16</span>}</div>
              <div style="margin-top:12px;color:#8b949e">// Catatan Item Terdeteksi:</div>
              ${items.slice(0, 3).map((it) => `<div style="color:#d29922">// [${esc(it.code)}] ${esc(it.title.slice(0, 48))}</div>`).join('')}
            </div>

            <div style="padding:12px 14px;background:#0d1117">
              <div style="color:#3fb950;margin-bottom:6px">+++ SESUDAH (${esc(project.standards[0])} Verified)</div>
              <div><span style="color:#6e7681;margin-right:10px">12</span>public async Task&lt;Result&gt; ExecuteAsync(Req r, CancellationToken ct) {</div>
              <div style="background:#122d1e;color:#7ee787;padding:0 6px"><span style="color:#3fb950;margin-right:10px">13 +</span>  await _guard.ValidateAsync(r, "${esc(project.standards[0])}", ct);</div>
              <div style="background:#122d1e;color:#7ee787;padding:0 6px"><span style="color:#3fb950;margin-right:10px">14 +</span>  var tx = await _core.RunIdempotentAsync(r.Key, ct);</div>
              <div style="background:#122d1e;color:#7ee787;padding:0 6px"><span style="color:#3fb950;margin-right:10px">15 +</span>  await _audit.AppendWibAsync(tx, "${esc(project.id)}", ct);</div>
              <div style="background:#122d1e;color:#7ee787;padding:0 6px"><span style="color:#3fb950;margin-right:10px">16 +</span>  return Result.Verified(tx.Digest);</div>
              <div><span style="color:#6e7681;margin-right:10px">17</span>}</div>
            </div>
          </div>

          <!-- Integrated Terminal -->
          <div style="height:215px;background:#070a0f;padding:12px 16px;font-size:11px;line-height:1.65" class="mono">
            <div style="color:#8b949e;margin-bottom:6px">TERMINAL · VERIFICATION GATE (${esc(project.stack.join(' + '))})</div>
            <div style="color:#79c0ff">$ ${esc(project.preview.snippet)}</div>
            <div style="color:#3fb950;margin-top:6px">[PASS] ${esc(items[0].code)} · ${esc(items[0].title)} -> ${esc(items[0].value)} (${esc(items[0].status)})</div>
            <div style="color:#3fb950">[PASS] ${esc(items[1].code)} · ${esc(items[1].title)} -> ${esc(items[1].value)} (${esc(items[1].status)})</div>
            <div style="color:#d2a8ff;margin-top:4px">Summary: 0 warnings, 0 errors · ${esc(m2.label)}: ${esc(m2.value)} · Ready for Release</div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 8. API / POSTMAN / WEBHOOK INSPECTOR (3-pane HTTP & JSON workbench)
  // ---------------------------------------------------------------------------
  if (layout === 'api-postman-inspector') {
    const endpoint = `/v1/${project.id.toLowerCase()}/${items[0].code.toLowerCase()}`;
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:255px 1fr;background:${theme.bg}">
      <aside style="background:${theme.sidebarBg};color:${theme.sidebarText};padding:16px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.14)">
          ${monogram(project.name, c, 30, 6)}
          <div>
            <div class="hd" style="font-size:14.5px;font-weight:700">${esc(project.name)}</div>
            <div class="mono" style="font-size:9.5px;opacity:0.75">${esc(project.standards[0])}</div>
          </div>
        </div>
        <div class="mono" style="font-size:10px;opacity:0.65;margin-top:4px">KOLEKSI ENDPOINT</div>
        ${items.map((it, i) => `
          <div style="padding:9px 10px;border-radius:6px;background:${i === 0 ? 'rgba(255,255,255,0.16)' : 'transparent'};display:flex;align-items:center;gap:8px;font-size:11.5px">
            <span class="mono" style="font-size:9.5px;font-weight:700;padding:2px 5px;border-radius:3px;background:${i === 0 ? '#16a34a' : i === 1 ? '#2563eb' : '#d97706'};color:#fff">${i === 1 ? 'GET' : 'POST'}</span>
            <span class="clamp1">${esc(it.code)} · ${esc(it.title.slice(0, 20))}</span>
          </div>
        `).join('')}
        <div style="margin-top:auto;padding:12px;background:rgba(0,0,0,0.22);border-radius:7px;font-size:11px">
          <div class="mono" style="opacity:0.75">${esc(m0.label)}</div>
          <div class="mono" style="font-size:18px;font-weight:700;margin-top:2px">${esc(m0.value)}</div>
          <div class="mono" style="font-size:10px;opacity:0.75;margin-top:6px">${esc(persona)}</div>
        </div>
      </aside>

      <div style="display:flex;flex-direction:column;overflow:hidden">
        <div style="padding:14px 20px;background:${theme.surface};border-bottom:1px solid ${theme.border};display:flex;gap:10px;align-items:center">
          <span class="mono" style="padding:7px 12px;background:#16a34a;color:#fff;border-radius:6px;font-weight:700;font-size:12px">POST</span>
          <div class="mono" style="flex:1;padding:7px 14px;background:${theme.surface2};border:1px solid ${theme.borderStrong};border-radius:6px;font-size:12.5px">
            https://api.nusantara.id${esc(endpoint)}
          </div>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>

        <div style="flex:1;padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;overflow:hidden">
          <div class="card" style="display:flex;flex-direction:column">
            <div style="padding:10px 14px;background:${theme.surface2};border-bottom:1px solid ${theme.border};display:flex;justify-content:space-between;font-weight:700;font-size:12px">
              <span>Request Headers &amp; Payload</span>
              <span class="mono" style="color:${c}">HMAC-SHA256 SIGNED</span>
            </div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:10px;flex:1">
              <div style="font-size:11px;display:grid;grid-template-columns:145px 1fr;gap:6px;padding:10px;background:${theme.surface2};border-radius:6px" class="mono">
                <span class="muted">X-SIGNATURE</span><span>rsa256_9bf56d1c88...a2f</span>
                <span class="muted">X-TIMESTAMP</span><span>2026-11-20T14:22:08+07:00</span>
                <span class="muted">X-EXTERNAL-ID</span><span>${esc(project.id)}-${esc(items[0].code)}</span>
                <span class="muted">X-PARTNER-ID</span><span>${esc(project.standards[0])}</span>
              </div>
              <pre class="mono" style="margin:0;flex:1;padding:14px;background:#0d1117;color:#e6edf3;border-radius:7px;font-size:11px;line-height:1.6;white-space:pre-wrap">{
  "projectId": "${esc(project.id)}",
  "operation": "${esc(items[0].title)}",
  "standard": "${esc(project.standards[0])}",
  "value": "${esc(items[0].value)}",
  "idempotencyKey": "key_${seed % 9999}",
  "dataResidency": "ID-JKT-WIB"
}</pre>
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div style="padding:10px 14px;background:${theme.surface2};border-bottom:1px solid ${theme.border};display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:12px">
              <span>Live Response</span>
              <div style="display:flex;gap:8px" class="mono">
                <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">200 OK</span>
                <span class="muted">38 ms · 1.4 KB</span>
              </div>
            </div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1">
              <pre class="mono" style="margin:0;padding:14px;background:#0d1117;color:#7ee787;border-radius:7px;font-size:11px;line-height:1.6;white-space:pre-wrap">{
  "responseCode": "2002400",
  "responseMessage": "Successful · Terverifikasi",
  "status": "${esc(items[0].status)}",
  "trace": "${esc(project.preview.snippet.slice(0, 74))}",
  "sla": "${esc(m1.label)}: ${esc(m1.value)}"
}</pre>
              <div style="padding:12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:7px">
                <div class="mono muted" style="font-size:10px;margin-bottom:8px">LATENCY BREAKDOWN WATERFALL</div>
                ${[
                  { lb: 'TLS + Edge Auth', ms: '6 ms', w: 18, col: '#2563eb' },
                  { lb: 'Signature & Schema Gate', ms: '8 ms', w: 24, col: c },
                  { lb: 'Core Domain Execution', ms: '19 ms', w: 48, col: '#16a34a' },
                  { lb: 'Audit Log Commit', ms: '5 ms', w: 14, col: c2 },
                ].map((b) => `
                  <div style="display:grid;grid-template-columns:145px 1fr 48px;gap:8px;align-items:center;margin-bottom:6px;font-size:11px">
                    <span>${b.lb}</span>
                    <div style="height:8px;background:${theme.border};border-radius:4px;overflow:hidden"><div style="width:${b.w}%;height:100%;background:${b.col}"></div></div>
                    <span class="mono muted" style="text-align:right">${b.ms}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 9. LIVESTREAM COMMERCE / MEDIA BROADCAST STUDIO (9:16 video feed + GMV pulse)
  // ---------------------------------------------------------------------------
  if (layout === 'livestream-commerce-studio') {
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:360px 1fr 330px;background:#0e1018;color:#f1f5f9">
      <!-- 9:16 Vertical Live Feed Stage -->
      <div style="padding:20px;display:flex;align-items:center;justify-content:center;background:#080a10;border-right:1px solid #23283b">
        <div style="width:310px;height:740px;border-radius:26px;border:5px solid #2b3248;background:linear-gradient(180deg,#1f2937 0%,#111827 60%,#090d16 100%);overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.55);padding:5px 10px;border-radius:18px">
              <span style="width:8px;height:8px;border-radius:50%;background:#ef4444"></span>
              <span style="font-weight:700;font-size:11px">${esc(project.name)}</span>
            </div>
            <span class="mono" style="background:#dc2626;color:#fff;padding:4px 9px;border-radius:12px;font-size:10.5px;font-weight:700">LIVE · 12.4K</span>
          </div>

          <!-- Center Product Stage Visual -->
          <div style="text-align:center;padding:18px 12px">
            <div style="width:132px;height:132px;margin:0 auto;border-radius:20px;background:${c};display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,0.28)">
              <span class="mono" style="font-size:11px;opacity:0.85">ETALASE #01</span>
              <strong class="hd" style="font-size:22px;margin-top:4px">${esc(items[0].code)}</strong>
            </div>
            <div style="margin-top:12px;font-weight:700;font-size:14px">${esc(items[0].title)}</div>
            <div style="font-size:11px;color:#cbd5e1;margin-top:2px">${esc(items[0].subtitle)}</div>
          </div>

          <!-- Floating Comments & Pinned Card -->
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="font-size:11px;display:flex;flex-direction:column;gap:5px;opacity:0.92">
              <div style="background:rgba(0,0,0,0.5);padding:6px 10px;border-radius:10px"><strong style="color:#fbbf24">@nadia.jkt:</strong> Kak spill promo flash sale etalase 1!</div>
              <div style="background:rgba(0,0,0,0.5);padding:6px 10px;border-radius:10px"><strong style="color:#38bdf8">@bima_sby:</strong> Sudah checkout 2x via QRIS aman!</div>
              <div style="background:rgba(0,0,0,0.5);padding:6px 10px;border-radius:10px"><strong style="color:#34d399">@putri.bdg:</strong> Stok masih aman kak?</div>
            </div>
            <div style="background:#ffffff;color:#111827;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
              <div style="min-width:0">
                <div style="font-weight:700;font-size:11.5px" class="clamp1">${esc(items[0].title)}</div>
                <div class="mono" style="font-weight:700;font-size:13px;color:${c}">${esc(items[0].value)}</div>
              </div>
              <span style="padding:6px 12px;background:${c};color:#fff;border-radius:6px;font-weight:700;font-size:11px">BELI</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Broadcast Analytics & Flash Triggers -->
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="hd" style="font-size:19px;font-weight:700">${esc(pageSpec.title)}</div>
            <div class="mono" style="font-size:11px;color:#94a3b8">${esc(project.preview.envTag)} · ${esc(persona)}</div>
          </div>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${[m0, m1, m2].map((m, i) => `
            <div style="padding:14px;background:#161b29;border:1px solid #283149;border-top:3px solid ${i === 0 ? c : i === 1 ? '#34d399' : '#f59e0b'};border-radius:8px">
              <div style="font-size:11px;color:#94a3b8">${esc(m.label)}</div>
              <div class="mono" style="font-size:22px;font-weight:700;margin-top:4px">${esc(m.value)}</div>
            </div>
          `).join('')}
        </div>

        <div style="padding:16px;background:#161b29;border:1px solid #283149;border-radius:9px">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:12px">
            <strong>Kurva GMV &amp; Penonton Menit-ke-Menit</strong>
            <span class="mono" style="color:#34d399">+42% pasca Flash Voucher</span>
          </div>
          ${sparkPath([22, 34, 31, 48, 86, 74, 92, 118, 108, 134], c, 510, 125)}
        </div>

        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${items.map((it) => `
            <div style="padding:12px;background:#161b29;border:1px solid #283149;border-radius:8px;display:flex;flex-direction:column;justify-content:space-between">
              <div style="display:flex;justify-content:space-between"><span class="mono" style="font-size:10px;color:#7dd3fc">${esc(it.code)}</span>${pill(it.status, it.tone, true)}</div>
              <div style="font-weight:700;font-size:12.5px;margin:6px 0 2px">${esc(it.title)}</div>
              <div style="font-size:11px;color:#94a3b8">${esc(it.subtitle)}</div>
              <div class="mono" style="margin-top:8px;font-weight:700;color:#fbbf24">${esc(it.value)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Teleprompter & Host Control -->
      <aside style="background:#131724;border-left:1px solid #23283b;padding:20px;display:flex;flex-direction:column;gap:14px">
        <div class="hd" style="font-size:15px;font-weight:700">Skrip Host &amp; Trigger Promo</div>
        <div style="padding:14px;background:#1c2235;border-left:4px solid ${c};border-radius:6px;font-size:13px;line-height:1.6">
          <div class="mono" style="font-size:10px;color:#fbbf24;margin-bottom:6px">SEDANG TAYANG · 00:42:18</div>
          "${esc(project.summary)}"
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div class="mono" style="font-size:10px;color:#94a3b8">TOMBOL AKSI STUDIO</div>
          <div style="padding:11px;background:${c};color:#fff;border-radius:7px;font-weight:700;text-align:center">Pin Etalase #01 Sekarang</div>
          <div style="padding:11px;background:#d97706;color:#fff;border-radius:7px;font-weight:700;text-align:center">Drop Flash Voucher 5 Menit</div>
          <div style="padding:11px;background:#1e263a;border:1px solid #32405e;border-radius:7px;font-weight:600;text-align:center">${esc(project.preview.secondaryAction)}</div>
        </div>
        <div style="margin-top:auto;padding:12px;background:#0a0d14;border:1px solid #242d42;border-radius:6px;font-size:10.5px;color:#34d399" class="mono">
          ${esc(project.preview.snippet)}
        </div>
      </aside>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 10. WHATSAPP / OMNICHANNEL CHAT DESK (Real chat bubbles + embedded QRIS card)
  // ---------------------------------------------------------------------------
  if (layout === 'whatsapp-inbox-flow') {
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:295px 1fr 300px;background:${theme.bg}">
      <!-- Thread List -->
      <aside style="background:${theme.surface};border-right:1px solid ${theme.border};display:flex;flex-direction:column">
        <div style="padding:14px 16px;background:${c};color:#fff;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="hd" style="font-size:15px;font-weight:700">${esc(project.name)}</div>
            <div class="mono" style="font-size:10px;opacity:0.85">${esc(pageSpec.title)}</div>
          </div>
          <span class="mono" style="padding:3px 7px;background:rgba(255,255,255,0.2);border-radius:4px;font-size:10px">OFFICIAL API</span>
        </div>
        <div style="padding:10px 12px;border-bottom:1px solid ${theme.border}">
          <div style="padding:7px 10px;background:${theme.surface2};border-radius:6px;font-size:11.5px;color:${theme.muted}">Cari percakapan / nomor WA...</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column">
          ${items.map((it, i) => `
            <div style="padding:12px 14px;border-bottom:1px solid ${theme.border};background:${i === 0 ? theme.surface2 : 'transparent'};border-left:3px solid ${i === 0 ? c : 'transparent'}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <strong style="font-size:12.5px" class="clamp1">${esc(it.title.slice(0, 24))}</strong>
                <span class="mono muted" style="font-size:10px">14:2${i}</span>
              </div>
              <div class="muted clamp1" style="margin-top:3px">${esc(it.subtitle)}</div>
              <div style="display:flex;justify-content:space-between;margin-top:6px;align-items:center">
                <span class="mono" style="font-size:10.5px;color:${c};font-weight:700">${esc(it.value)}</span>
                ${pill(it.status, it.tone, theme.dark)}
              </div>
            </div>
          `).join('')}
        </div>
      </aside>

      <!-- Authentic Chat Thread -->
      <main style="display:flex;flex-direction:column;background:${theme.dark ? '#0d1418' : '#efeae2'}">
        <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 18px;display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:10px">
            ${monogram(items[0].title, '#0f766e', 34, 17)}
            <div>
              <strong style="font-size:13.5px">${esc(items[0].title)}</strong>
              <div class="mono muted">+62 812-****-4418 · Centang Hijau Aktif</div>
            </div>
          </div>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </header>

        <div style="flex:1;padding:20px 24px;display:flex;flex-direction:column;gap:12px;overflow:hidden">
          <div style="align-self:flex-start;max-width:74%;background:${theme.surface};padding:11px 14px;border-radius:0 10px 10px 10px;border:1px solid ${theme.border}">
            <div style="font-size:12.5px">Halo admin, saya ingin konfirmasi untuk <strong>${esc(items[0].title)}</strong>. Apakah status sudah siap diproses hari ini?</div>
            <div class="mono muted" style="text-align:right;font-size:9.5px;margin-top:4px">14:18 WIB</div>
          </div>

          <div style="align-self:flex-end;max-width:78%;background:${theme.dark ? '#075e54' : '#d9fdd3'};color:${theme.dark ? '#fff' : '#111b21'};padding:12px 14px;border-radius:10px 0 10px 10px;border:1px solid ${theme.dark ? '#0b7a6d' : '#b7e8b0'}">
            <div class="mono" style="font-size:9.5px;font-weight:700;opacity:0.75;margin-bottom:4px">AUTO-FLOW · ${esc(project.name.toUpperCase())}</div>
            <div style="font-size:12.5px">Siap! Data <strong>${esc(items[0].code)}</strong> sudah terverifikasi (${esc(items[0].subtitle)}). Silakan konfirmasi nominal di bawah:</div>
            <div style="margin-top:10px;padding:10px;background:${theme.surface};color:${theme.text};border-radius:7px;display:flex;align-items:center;gap:12px;border:1px solid ${theme.border}">
              ${qrBlock(seed, 56)}
              <div>
                <div style="font-weight:700;font-size:12px">${esc(items[0].value)} · ${esc(items[0].status)}</div>
                <div class="muted">${esc(project.standards[0])} · Tanpa biaya tambahan</div>
                <div style="margin-top:5px;display:flex;gap:6px">
                  <span style="padding:3px 9px;background:${c};color:#fff;border-radius:4px;font-size:10.5px;font-weight:700">SETUJU &amp; BAYAR</span>
                  <span style="padding:3px 9px;border:1px solid ${theme.borderStrong};border-radius:4px;font-size:10.5px">HUBUNGI CS</span>
                </div>
              </div>
            </div>
            <div class="mono" style="text-align:right;font-size:9.5px;opacity:0.7;margin-top:5px">14:19 WIB ✓✓</div>
          </div>

          <div style="align-self:flex-start;max-width:68%;background:${theme.surface};padding:11px 14px;border-radius:0 10px 10px 10px;border:1px solid ${theme.border}">
            <div style="font-size:12.5px"><strong>SETUJU</strong> — sudah saya scan QRIS barusan ya, terima kasih cepat sekali!</div>
            <div class="mono muted" style="text-align:right;font-size:9.5px;margin-top:4px">14:21 WIB</div>
          </div>

          <div style="margin-top:auto;padding:10px 12px;background:${theme.surface};border:1px solid ${theme.border};border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:${theme.muted}">
            <span>Ketik balasan atau pilih template Utility / Auth...</span>
            <span class="btn-p" style="background:${c};padding:5px 12px">Kirim</span>
          </div>
        </div>
      </main>

      <!-- Right CRM & Context Sidebar -->
      <aside style="background:${theme.surface};border-left:1px solid ${theme.border};padding:16px;display:flex;flex-direction:column;gap:12px">
        <div class="hd" style="font-size:14.5px;font-weight:700">Konteks ERP &amp; Guardrail</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="padding:10px;background:${theme.surface2};border-radius:6px"><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-weight:700;font-size:15px;color:${c}">${esc(m0.value)}</div></div>
          <div style="padding:10px;background:${theme.surface2};border-radius:6px"><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-weight:700;font-size:15px">${esc(m1.value)}</div></div>
        </div>
        <div style="padding:12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:7px;font-size:11.5px;line-height:1.5">
          <strong>Konteks Lokal:</strong> ${esc(project.indonesiaContext)}
        </div>
        <div style="padding:11px;background:#0e121a;color:#34d399;border-radius:6px;font-size:10px;line-height:1.5" class="mono">
          ${esc(project.preview.snippet)}
        </div>
        <div style="margin-top:auto;font-size:11px" class="muted">
          <div>Operator: <strong style="color:${theme.text}">${esc(persona)}</strong></div>
          <div style="margin-top:3px">UU PDP Opt-Out Guard: <strong style="color:#16a34a">AKTIF</strong></div>
        </div>
      </aside>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 11. KANBAN SPRINT / APPROVAL BOARD (4-column Trello/Linear cards)
  // ---------------------------------------------------------------------------
  const cols = [
    { name: 'Antrean Masuk', count: 3, col: '#64748b', cards: [items[1], { code: 'REQ-102', title: `Permintaan ${project.standards[0]}`, subtitle: 'Verifikasi otomatis lolos', value: m1.value, status: 'Menunggu', tone: 'neutral' }] },
    { name: 'Sedang Diproses', count: 4, col: c, cards: [items[0], { code: 'OPS-204', title: project.features[0].slice(0, 38), subtitle: persona, value: m0.value, status: 'Berjalan', tone: 'ok' }] },
    { name: 'Review & QA', count: 2, col: '#d97706', cards: [items[2], { code: 'QA-301', title: project.features[1].slice(0, 38), subtitle: 'Menunggu persetujuan', value: m2.value, status: 'Tinjau', tone: 'warn' }] },
    { name: 'Disetujui / Selesai', count: 14, col: '#16a34a', cards: [items[3], { code: 'RLS-409', title: `Audit ${project.name} Terkunci`, subtitle: 'Bukti & readback tercatat', value: '100% OK', status: 'Selesai', tone: 'ok' }] },
  ];

  const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
    <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px">
        ${monogram(project.name, c, 30, 7)}
        <div>
          <strong class="hd" style="font-size:16px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
          <div class="mono muted">${esc(project.preview.envTag)} · ${esc(persona)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
        <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
      </div>
    </header>

    <main style="flex:1;padding:18px 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;overflow:hidden">
      ${cols.map((col) => `
        <div style="background:${theme.surface2};border:1px solid ${theme.border};border-radius:9px;padding:12px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:2px solid ${col.col}">
            <strong style="font-size:12.5px">${col.name}</strong>
            <span class="mono" style="padding:2px 7px;background:${theme.surface};border-radius:4px;font-size:10.5px;font-weight:700">${col.count}</span>
          </div>
          ${col.cards.map((card, idx) => `
            <div class="card" style="padding:12px;display:flex;flex-direction:column;gap:8px;border-left:3px solid ${col.col}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="mono" style="font-size:10px;color:${c};font-weight:700">${esc(card.code)}</span>
                ${pill(card.status, card.tone, theme.dark)}
              </div>
              <div style="font-weight:700;font-size:12.5px;line-height:1.3">${esc(card.title)}</div>
              <div class="muted">${esc(card.subtitle)}</div>
              <div style="height:5px;background:${theme.surface2};border-radius:3px;overflow:hidden"><div style="width:${idx === 0 ? 78 : 45}%;height:100%;background:${col.col}"></div></div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid ${theme.border}">
                <span class="mono" style="font-weight:700;font-size:11.5px">${esc(card.value)}</span>
                ${monogram(card.code, col.col, 22, 11)}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </main>

    <footer style="height:40px;background:${theme.surface};border-top:1px solid ${theme.border};padding:0 24px;display:flex;justify-content:space-between;align-items:center;font-size:11px" class="mono muted">
      <span>${esc(project.standards.join(' · '))}</span>
      <span>${esc(project.preview.snippet.slice(0, 92))}</span>
    </footer>
  </div>`;
  return pageWrap(body, theme, font);
}
