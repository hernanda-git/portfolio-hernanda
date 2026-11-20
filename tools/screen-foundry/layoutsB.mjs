// Layouts B (11 more genuinely distinct real-world product screen architectures).
import { esc } from './svgGraphics.mjs';
import { donutRing, hashSeed, monogram, pageWrap, pill, qrBlock, sparkPath } from './layoutsCore.mjs';

export function renderLayoutB(layout, project, pageSpec, theme, font, persona) {
  const c = project.brandColor;
  const c2 = theme.accent2;
  const seed = hashSeed(project.id + pageSpec.slug);
  const items = project.preview.items;
  const [m0, m1, m2] = project.preview.metrics;

  // ---------------------------------------------------------------------------
  // 12. GEO DISPATCH MAP (Full-bleed GIS map with floating route drawer + live GPS pins)
  // ---------------------------------------------------------------------------
  if (layout === 'geo-dispatch-map') {
    const dk = theme.dark;
    const waterBg = dk ? '#0b1623' : '#d8e9f5';
    const landBg = dk ? '#162433' : '#eef3e8';
    const landStroke = dk ? '#2d455e' : '#b7cbb4';
    const pins = [
      { x: 280, y: 210, code: items[0].code, lbl: items[0].value, col: c },
      { x: 560, y: 310, code: items[1].code, lbl: items[1].value, col: '#d97706' },
      { x: 840, y: 240, code: items[2].code, lbl: items[2].value, col: '#16a34a' },
      { x: 1020, y: 420, code: items[3].code, lbl: items[3].value, col: '#dc2626' },
    ];

    const body = `<div style="width:1280px;height:800px;position:relative;overflow:hidden;background:${waterBg}">
      <!-- Full-bleed stylized Indonesian GIS canvas -->
      <svg viewBox="0 0 1280 800" width="1280" height="800" style="position:absolute;inset:0;display:block">
        ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="800" stroke="${dk ? '#122233' : '#c6dced'}" stroke-width="1"/>`).join('')}
        ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1280" y2="${i * 80}" stroke="${dk ? '#122233' : '#c6dced'}" stroke-width="1"/>`).join('')}
        <!-- Stylized Archipelago / Corridor Landmass -->
        <path d="M120,170 Q320,130 520,210 T960,180 Q1140,210 1240,340 L1240,560 Q1010,510 820,580 T360,520 Q180,550 80,420 Z" fill="${landBg}" stroke="${landStroke}" stroke-width="2.5"/>
        <path d="M220,260 Q480,220 680,340 T1060,360" fill="none" stroke="${dk ? '#263a4f' : '#c8d6c2'}" stroke-width="18" stroke-linecap="round"/>
        <!-- Active corridor trajectory -->
        <path d="M280,210 C400,190 460,320 560,310 S740,200 840,240 S940,410 1020,420" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="10 6"/>
        ${pins.map((p) => `
          <circle cx="${p.x}" cy="${p.y}" r="22" fill="${p.col}" fill-opacity="0.18"/>
          <circle cx="${p.x}" cy="${p.y}" r="8" fill="${p.col}" stroke="#fff" stroke-width="2.5"/>
          <rect x="${p.x + 14}" y="${p.y - 20}" width="136" height="36" rx="6" fill="${theme.surface}" stroke="${p.col}" stroke-width="1.5"/>
          <text x="${p.x + 22}" y="${p.y - 5}" font-size="10" font-family="Cascadia Mono,monospace" font-weight="700" fill="${p.col}">${esc(p.code)}</text>
          <text x="${p.x + 22}" y="${p.y + 9}" font-size="10.5" font-weight="700" fill="${theme.text}">${esc(p.lbl)}</text>
        `).join('')}
      </svg>

      <!-- Floating Top Navigation Bar -->
      <div style="position:absolute;top:18px;left:18px;right:18px;height:52px;background:${theme.surface};border:1px solid ${theme.borderStrong};border-radius:10px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,0.14)">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 7)}
          <div>
            <strong class="hd" style="font-size:15px">${esc(project.name)} — ${esc(pageSpec.title)}</strong>
            <span class="mono muted" style="margin-left:10px">${esc(project.preview.envTag)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">GPS LIVE · WIB</span>
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </div>

      <!-- Floating Left Dispatch Drawer -->
      <aside style="position:absolute;top:86px;left:18px;bottom:84px;width:336px;background:${theme.surface};border:1px solid ${theme.borderStrong};border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 28px rgba(0,0,0,0.14)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong class="hd" style="font-size:14px">Unit &amp; Koridor Aktif</strong>
          <span class="mono muted">${esc(persona.split('·')[0])}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="padding:9px;background:${theme.surface2};border-radius:6px"><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-weight:700;font-size:16px;color:${c}">${esc(m0.value)}</div></div>
          <div style="padding:9px;background:${theme.surface2};border-radius:6px"><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-weight:700;font-size:16px">${esc(m1.value)}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex:1;overflow:hidden">
          ${items.map((it, i) => `
            <div style="padding:10px;background:${i === 0 ? theme.surface2 : theme.bg};border:1px solid ${i === 0 ? c : theme.border};border-radius:7px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="mono" style="font-size:10px;font-weight:700;color:${c}">${esc(it.code)}</span>
                ${pill(it.status, it.tone, dk)}
              </div>
              <div style="font-weight:700;font-size:12px;margin-top:3px" class="clamp1">${esc(it.title)}</div>
              <div class="muted clamp1">${esc(it.subtitle)}</div>
            </div>
          `).join('')}
        </div>
      </aside>

      <!-- Floating Bottom Telemetry Ribbon -->
      <div style="position:absolute;left:18px;right:18px;bottom:18px;height:52px;background:${theme.surface};border:1px solid ${theme.borderStrong};border-radius:10px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.12)">
        <span class="mono" style="font-size:11px;color:${c};font-weight:700">${esc(m2.label)}: ${esc(m2.value)}</span>
        <span class="mono muted" style="font-size:11px">${esc(project.preview.snippet.slice(0, 96))}</span>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 13. SCADA PLANT BLUEPRINT (Dark industrial P&ID process flow & digital readouts)
  // ---------------------------------------------------------------------------
  if (layout === 'scada-plant-blueprint') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#0a0e14;color:#e2e8f0">
      <header style="height:48px;background:#111722;border-bottom:2px solid #243248;padding:0 20px;display:flex;align-items:center;justify-content:space-between" class="mono">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="padding:3px 8px;background:#16a34a;color:#fff;border-radius:3px;font-size:10px;font-weight:700">PLC ONLINE</span>
          <strong style="font-size:14px">${esc(project.name.toUpperCase())} // ${esc(pageSpec.title.toUpperCase())}</strong>
        </div>
        <div style="display:flex;gap:16px;font-size:11px">
          <span style="color:#fbbf24">${esc(project.preview.envTag)}</span>
          <span style="color:#38bdf8">${esc(persona)}</span>
        </div>
      </header>

      <div style="flex:1;padding:16px 20px;display:grid;grid-template-columns:1fr 330px;gap:16px;overflow:hidden">
        <!-- Main P&ID Process Schematic -->
        <div style="background:#0d131c;border:1px solid #243248;border-radius:8px;padding:16px;display:flex;flex-direction:column;justify-content:space-between">
          <div style="display:flex;justify-content:space-between;align-items:center" class="mono">
            <span style="font-size:11px;color:#38bdf8;font-weight:700">DIAGRAM PROSES &amp; TELEMETRI REAL-TIME · ${esc(project.standards[0])}</span>
            <span style="font-size:10.5px;color:#94a3b8">SAMPLING: 500ms · MQTT / MODBUS</span>
          </div>

          <svg viewBox="0 0 880 410" width="100%" style="background:#070b10;border:1px solid #1c283a;border-radius:6px;margin:10px 0">
            <!-- Process Piping -->
            <path d="M120,120 H340 V210 H520 V120 H740" fill="none" stroke="#38bdf8" stroke-width="5"/>
            <path d="M120,300 H340 V210 M520,210 V300 H740" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="8 4"/>
            <!-- Nodes / Vessels -->
            ${[
              { x: 40, y: 72, w: 140, h: 96, title: 'STAGE 01 INTAKE', val: m0.value, col: '#22c55e' },
              { x: 40, y: 252, w: 140, h: 96, title: 'CADANGAN / AUX', val: 'STANDBY OK', col: '#38bdf8' },
              { x: 350, y: 155, w: 170, h: 112, title: 'CORE PROCESSOR', val: m1.value, col: c },
              { x: 690, y: 72, w: 150, h: 96, title: 'OUTPUT UTAMA', val: m2.value, col: '#22c55e' },
              { x: 690, y: 252, w: 150, h: 96, title: 'GUARD / LIMITER', val: '0.0 FAULT', col: '#f59e0b' },
            ].map((n) => `
              <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6" fill="#111926" stroke="${n.col}" stroke-width="2"/>
              <text x="${n.x + 12}" y="${n.y + 24}" font-size="9.5" font-family="Cascadia Mono,monospace" fill="#94a3b8">${esc(n.title)}</text>
              <text x="${n.x + 12}" y="${n.y + 56}" font-size="18" font-family="Cascadia Mono,monospace" font-weight="700" fill="${n.col}">${esc(n.val)}</text>
              <circle cx="${n.x + n.w - 16}" cy="${n.y + 18}" r="5" fill="${n.col}"/>
            `).join('')}
            <!-- Valve Markers -->
            <polygon points="245,112 265,120 245,128" fill="#22c55e"/>
            <polygon points="615,112 635,120 615,128" fill="#22c55e"/>
            <text x="230" y="102" font-size="9" font-family="Cascadia Mono,monospace" fill="#34d399">VLV-01 OPEN</text>
            <text x="595" y="102" font-size="9" font-family="Cascadia Mono,monospace" fill="#34d399">VLV-02 OPEN</text>
          </svg>

          <!-- Sensor Strip -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
            ${items.map((it) => `
              <div style="padding:10px;background:#111926;border:1px solid #243248;border-top:3px solid ${it.tone === 'bad' ? '#ef4444' : it.tone === 'warn' ? '#f59e0b' : '#22c55e'};border-radius:5px">
                <div class="mono" style="font-size:10px;color:#94a3b8">${esc(it.code)} · ${esc(it.meta || 'LIVE')}</div>
                <div class="mono" style="font-size:16px;font-weight:700;color:#fff;margin:3px 0">${esc(it.value)}</div>
                <div style="font-size:10.5px;color:#cbd5e1" class="clamp1">${esc(it.title)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Annunciator & Relay Controls -->
        <aside style="background:#0d131c;border:1px solid #243248;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:12px">
          <div class="mono" style="font-size:11px;color:#fbbf24;font-weight:700">ALARM ANNUNCIATOR &amp; RELAY</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" class="mono">
            <div style="padding:10px;background:#102a1d;border:1px solid #16a34a;border-radius:5px;text-align:center;color:#4ade80;font-size:11px;font-weight:700">PLN / DAYA OK</div>
            <div style="padding:10px;background:#2f2109;border:1px solid #f59e0b;border-radius:5px;text-align:center;color:#fbbf24;font-size:11px;font-weight:700">1 PERINGATAN</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;flex:1">
            ${project.features.map((f, i) => `
              <div style="padding:9px 10px;background:#111926;border-left:3px solid ${i === 0 ? c : '#38bdf8'};border-radius:4px;font-size:11.5px;color:#e2e8f0">${esc(f)}</div>
            `).join('')}
          </div>
          <div style="padding:11px;background:#05080c;border:1px solid #1e2d40;border-radius:5px;font-size:10px;color:#34d399" class="mono">
            ${esc(project.preview.snippet)}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <span class="btn-p" style="background:${c};justify-content:center">${esc(project.preview.primaryAction)}</span>
            <span class="btn-s" style="background:#192231;color:#e2e8f0;border-color:#334155;text-align:center">${esc(project.preview.secondaryAction)}</span>
          </div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 14. FLOORPLAN BAY / SPATIAL GRID (Overhead facility floorplan: bays, ponds, racks, kennels)
  // ---------------------------------------------------------------------------
  if (layout === 'floorplan-bay-grid') {
    const units = Array.from({ length: 12 }, (_, i) => {
      const src = items[i % items.length];
      const st = i === 3 || i === 9 ? 'warn' : i === 7 ? 'bad' : 'ok';
      return {
        code: `${src.code.split('-')[0]}-${String(i + 1).padStart(2, '0')}`,
        title: i < 4 ? src.title.split('—')[0].trim() : `Zona / Unit #${i + 1}`,
        val: i < 4 ? src.value : `${78 + ((i * 7 + seed) % 21)}%`,
        status: st === 'bad' ? 'Perhatian' : st === 'warn' ? 'Proses' : 'Optimal',
        tone: st,
      };
    });

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 7)}
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
            <div class="mono muted">${esc(project.preview.surfaceTitle)} · ${esc(project.preview.envTag)}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="mono muted">${esc(m0.label)}: <strong style="color:${c}">${esc(m0.value)}</strong></span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;padding:18px 24px;display:grid;grid-template-columns:1fr 335px;gap:18px;overflow:hidden">
        <!-- Spatial Overhead Architectural Grid -->
        <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:14.5px">Denah Spasial Live (12 Unit Aktif)</strong>
            <div style="display:flex;gap:12px;font-size:11px">
              <span><strong style="color:#16a34a">■</strong> Optimal (9)</span>
              <span><strong style="color:#d97706">■</strong> Proses / Antre (2)</span>
              <span><strong style="color:#dc2626">■</strong> Perlu Aksi (1)</span>
            </div>
          </div>

          <div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);gap:12px;padding:14px;background:${theme.surface2};border:1.5px dashed ${theme.borderStrong};border-radius:10px">
            ${units.map((u, idx) => {
              const col = u.tone === 'bad' ? '#dc2626' : u.tone === 'warn' ? '#d97706' : '#16a34a';
              return `<div style="background:${theme.surface};border:2px solid ${idx === 0 ? c : col};border-radius:8px;padding:12px;display:flex;flex-direction:column;justify-content:space-between">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="mono" style="font-size:10.5px;font-weight:700;color:${col}">${esc(u.code)}</span>
                  <span style="width:9px;height:9px;border-radius:50%;background:${col}"></span>
                </div>
                <div style="font-weight:700;font-size:12px;margin:6px 0" class="clamp1">${esc(u.title)}</div>
                <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:6px;border-top:1px solid ${theme.border}">
                  <span class="mono" style="font-weight:700;font-size:13px;color:${theme.text}">${esc(u.val)}</span>
                  <span style="font-size:10px;font-weight:600;color:${col}">${u.status}</span>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Selected Unit Inspector -->
        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:15px">Inspeksi Unit #01</strong>
            ${pill(items[0].status, items[0].tone, theme.dark)}
          </div>
          <div style="padding:14px;background:${c};color:#fff;border-radius:8px">
            <div class="mono" style="font-size:10px;opacity:0.85">${esc(items[0].code)} · ${esc(persona)}</div>
            <div style="font-weight:700;font-size:15px;margin-top:4px">${esc(items[0].title)}</div>
            <div style="font-size:11.5px;opacity:0.9;margin-top:4px">${esc(items[0].subtitle)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;padding:12px;background:${theme.surface2};border-radius:8px">
            ${donutRing(86, c, theme.border, 76, theme.text)}
            <div>
              <div class="muted">${esc(m1.label)}</div>
              <div class="mono" style="font-size:18px;font-weight:700">${esc(m1.value)}</div>
              <div class="muted" style="margin-top:3px">${esc(m2.label)}: ${esc(m2.value)}</div>
            </div>
          </div>
          <div style="padding:11px;background:#0d1118;color:#34d399;border-radius:6px;font-size:10px;line-height:1.5" class="mono">
            ${esc(project.preview.snippet)}
          </div>
          <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <span class="btn-s" style="text-align:center">${esc(project.preview.secondaryAction)}</span>
            <span class="btn-p" style="background:${c};justify-content:center">Tandai Siap</span>
          </div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 15. CBT EXAM / INTERACTIVE ASSESSMENT SIMULATOR (Questions + 1-25 navigator grid)
  // ---------------------------------------------------------------------------
  if (layout === 'cbt-exam-simulator') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:56px;background:${c};color:#fff;padding:0 26px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <strong class="hd" style="font-size:17px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
          <span class="mono" style="padding:3px 9px;background:rgba(255,255,255,0.18);border-radius:4px;font-size:11px">${esc(project.standards[0])}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px" class="mono">
          <span style="padding:5px 12px;background:rgba(0,0,0,0.28);border-radius:6px;font-weight:700;font-size:14px">SISA WAKTU 38:14</span>
          <span style="padding:6px 14px;background:#fff;color:${c};border-radius:6px;font-weight:700;font-size:12px">Kumpulkan</span>
        </div>
      </header>

      <div style="flex:1;padding:22px 26px;display:grid;grid-template-columns:1fr 320px;gap:22px;overflow:hidden">
        <div class="card" style="padding:26px 30px;display:flex;flex-direction:column;gap:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${theme.border};padding-bottom:12px">
            <span class="mono" style="font-weight:700;font-size:13px;color:${c}">SOAL / RUBRIK NO. 14 DARI 25 · BOBOT TINGGI (IRT 1.84)</span>
            <span class="pill" style="background:#fef3e0;color:#9a5400;border-color:#f4d39e">HOTS · ADAPTIF</span>
          </div>

          <div style="padding:16px 18px;background:${theme.surface2};border-left:4px solid ${c};border-radius:6px;font-size:14px;line-height:1.65">
            <strong>Studi Kasus / Evaluasi:</strong> ${esc(project.summary)} Berdasarkan parameter <em>${esc(items[0].title)}</em> (${esc(items[0].value)}), tentukan keputusan teknis atau jawaban yang paling tepat:
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;flex:1">
            ${[
              { k: 'A', t: project.features[0], chosen: false },
              { k: 'B', t: project.features[1], chosen: true },
              { k: 'C', t: project.features[2], chosen: false },
              { k: 'D', t: project.features[3], chosen: false },
            ].map((opt) => `
              <div style="padding:13px 16px;border-radius:8px;border:2px solid ${opt.chosen ? c : theme.border};background:${opt.chosen ? theme.surface2 : theme.surface};display:flex;align-items:center;gap:14px">
                <span class="mono" style="width:28px;height:28px;border-radius:14px;background:${opt.chosen ? c : theme.surface2};color:${opt.chosen ? '#fff' : theme.text};border:1px solid ${opt.chosen ? c : theme.borderStrong};display:inline-flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${opt.k}</span>
                <span style="font-size:13px;font-weight:${opt.chosen ? 700 : 500}">${esc(opt.t)}</span>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid ${theme.border}">
            <span class="btn-s">&lt;- Soal Sebelumnya</span>
            <span class="pill" style="background:#fef3e0;color:#9a5400;border-color:#f4d39e">Tandai Ragu-Ragu</span>
            <span class="btn-p" style="background:${c}">Soal Berikutnya -&gt;</span>
          </div>
        </div>

        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
          <strong class="hd" style="font-size:14.5px">Navigasi Nomor (1–25)</strong>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px" class="mono">
            ${Array.from({ length: 25 }, (_, i) => {
              const n = i + 1;
              const cur = n === 14;
              const ragu = n === 7 || n === 12;
              const done = n < 14 && !ragu;
              const bgc = cur ? c : ragu ? '#f59e0b' : done ? '#16a34a' : theme.surface2;
              const fgc = cur || ragu || done ? '#fff' : theme.muted;
              return `<div style="height:36px;border-radius:6px;background:${bgc};color:${fgc};border:1px solid ${cur ? c : theme.border};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px">${n}</div>`;
            }).join('')}
          </div>
          <div style="padding:12px;background:${theme.surface2};border-radius:8px;display:flex;flex-direction:column;gap:6px;font-size:11.5px">
            <div style="display:flex;justify-content:space-between"><span>${esc(m0.label)}</span><strong class="mono" style="color:${c}">${esc(m0.value)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>${esc(m1.label)}</span><strong class="mono">${esc(m1.value)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>${esc(m2.label)}</span><strong class="mono" style="color:#16a34a">${esc(m2.value)}</strong></div>
          </div>
          <div style="margin-top:auto;padding:12px;background:#0f141e;color:#e2e8f0;border-radius:7px;font-size:10px;line-height:1.5" class="mono">
            ${esc(project.preview.snippet)}
          </div>
        </aside>
      </div>
    </div>`.replace('{${\'\'}}', '');
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 16. SOCIAL / CREATOR / CATALOG MARKETPLACE (Visual media cards + right drawer)
  // ---------------------------------------------------------------------------
  if (layout === 'social-creator-marketplace') {
    const palette = [c, c2, '#0f766e', '#be185d', '#4338ca', '#b45309'];
    const cards = [
      ...items.map((it, i) => ({ code: it.code, title: it.title, sub: it.subtitle, val: it.value, status: it.status, tone: it.tone, col: palette[i % palette.length] })),
      { code: 'NEW-05', title: `Katalog Unggulan ${project.standards[0]}`, sub: 'Terverifikasi escrow & rating 4.9/5', val: m0.value, status: 'Populer', tone: 'ok', col: palette[4] },
      { code: 'NEW-06', title: `Paket Mitra ${project.name}`, sub: persona, val: m1.value, status: 'Aktif', tone: 'ok', col: palette[5] },
    ];

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:60px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 28px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:14px">
          ${monogram(project.name, c, 34, 9)}
          <div>
            <strong class="hd" style="font-size:17px">${esc(project.name)}</strong>
            <span class="muted" style="margin-left:10px">${esc(pageSpec.title)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="padding:7px 14px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:18px;font-size:11.5px;color:${theme.muted}">Cari katalog, kategori, atau lokasi...</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;padding:20px 28px;display:grid;grid-template-columns:1fr 320px;gap:20px;overflow:hidden">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:16px">
          ${cards.map((cd, i) => `
            <div class="card" style="display:flex;flex-direction:column">
              <div style="height:126px;background:${cd.col};color:#fff;padding:14px;display:flex;flex-direction:column;justify-content:space-between;position:relative">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="mono" style="padding:2px 7px;background:rgba(0,0,0,0.28);border-radius:4px;font-size:10px">${esc(cd.code)}</span>
                  <span class="mono" style="font-size:10.5px;font-weight:700">★ 4.${9 - (i % 2)}</span>
                </div>
                <div>
                  <div class="hd" style="font-size:18px;font-weight:700">${esc(cd.val)}</div>
                  <div style="font-size:10.5px;opacity:0.85">${esc(project.standards[i % project.standards.length])}</div>
                </div>
              </div>
              <div style="padding:12px 14px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="font-weight:700;font-size:13px;line-height:1.3">${esc(cd.title)}</div>
                  <div class="muted" style="margin-top:4px;line-height:1.4">${esc(cd.sub)}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid ${theme.border}">
                  ${pill(cd.status, cd.tone, theme.dark)}
                  <span style="font-size:11px;font-weight:700;color:${c}">Pilih -&gt;</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
          <strong class="hd" style="font-size:15.5px">Ringkasan Kampanye / Order</strong>
          <div style="padding:14px;background:${theme.surface2};border-radius:8px;display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between"><span class="muted">${esc(m0.label)}</span><strong class="mono" style="color:${c}">${esc(m0.value)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span class="muted">${esc(m1.label)}</span><strong class="mono">${esc(m1.value)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span class="muted">${esc(m2.label)}</span><strong class="mono" style="color:#16a34a">${esc(m2.value)}</strong></div>
          </div>
          <div style="font-size:12px;color:${theme.muted};line-height:1.55">${esc(project.indonesiaContext)}</div>
          <div style="padding:12px;background:#0d1118;color:#cbd5e1;border-radius:7px;font-size:10px;line-height:1.5" class="mono">
            ${esc(project.preview.snippet)}
          </div>
          <div style="margin-top:auto;padding:12px;background:${c};color:#fff;border-radius:8px;text-align:center;font-weight:700">
            ${esc(project.preview.secondaryAction)}
          </div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 17. ACCOUNTING LEDGER SHEET (Swiss double-entry journal + bank balances + Rp 0 variance)
  // ---------------------------------------------------------------------------
  if (layout === 'accounting-ledger-sheet') {
    const banks = [
      { n: 'Mandiri Kopra', bal: 'Rp 6,42 M', ok: true },
      { n: 'BCA KlikBisnis', bal: 'Rp 4,18 M', ok: true },
      { n: 'BRI Qlola', bal: 'Rp 2,85 M', ok: true },
      { n: 'BSI / OCBC H2H', bal: 'Rp 1,37 M', ok: true },
    ];
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:56px;background:${theme.surface};border-bottom:2px solid ${theme.text};padding:0 28px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <strong class="hd" style="font-size:18px;letter-spacing:-0.02em">${esc(project.name)}</strong>
          <span style="color:${theme.borderStrong}">/</span>
          <span style="font-weight:600">${esc(pageSpec.title)}</span>
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">SELISIH GL: Rp 0,00</span>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="padding:16px 28px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        ${banks.map((b, i) => `
          <div class="card" style="padding:14px 16px;border-left:4px solid ${i === 0 ? c : i === 1 ? '#0f766e' : i === 2 ? '#1d4ed8' : c2}">
            <div style="display:flex;justify-content:space-between;font-size:11px"><span class="muted">${b.n}</span><span class="mono" style="color:#16a34a;font-weight:700">SYNC OK</span></div>
            <div class="mono" style="font-size:21px;font-weight:700;margin-top:4px">${b.bal}</div>
          </div>
        `).join('')}
      </div>

      <main style="flex:1;padding:0 28px 20px;display:grid;grid-template-columns:1.65fr 1fr;gap:18px;overflow:hidden">
        <div class="card" style="display:flex;flex-direction:column">
          <div style="padding:11px 16px;background:${theme.surface2};border-bottom:1px solid ${theme.border};display:flex;justify-content:space-between;font-weight:700;font-size:12.5px">
            <span>Jurnal Buku Besar &amp; Rekonsiliasi Otomatis</span>
            <span class="mono muted">${esc(project.preview.envTag)}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:${theme.surface2};border-bottom:1px solid ${theme.borderStrong};text-align:left;font-size:10px;color:${theme.muted}">
                <th style="padding:9px 14px">NO. JURNAL</th>
                <th style="padding:9px 12px">AKUN &amp; URAIAN</th>
                <th style="padding:9px 12px;text-align:right">DEBIT / NILAI</th>
                <th style="padding:9px 14px;text-align:right">REKON</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it) => `
                <tr style="border-bottom:1px solid ${theme.border}">
                  <td class="mono" style="padding:12px 14px;font-weight:700;color:${c}">${esc(it.code)}</td>
                  <td style="padding:12px 12px"><div style="font-weight:700">${esc(it.title)}</div><div class="muted">${esc(it.subtitle)}</div></td>
                  <td class="mono" style="padding:12px 12px;text-align:right;font-weight:700">${esc(it.value)}</td>
                  <td style="padding:12px 14px;text-align:right">${pill(it.status, it.tone, theme.dark)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top:auto;padding:12px 16px;background:${theme.surface2};border-top:2px solid ${theme.borderStrong};display:flex;justify-content:space-between;font-weight:700" class="mono">
            <span>TOTAL TERREKONSILIASI (${esc(m0.label)})</span>
            <span style="color:${c}">${esc(m0.value)}</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card" style="padding:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <strong class="hd" style="font-size:13.5px">Arus Kas 7 Hari (${esc(m1.label)})</strong>
              <span class="mono" style="color:${c};font-weight:700">${esc(m1.value)}</span>
            </div>
            ${sparkPath([42, 58, 52, 74, 68, 91, 108], c, 380, 120)}
          </div>
          <div class="card" style="flex:1;padding:16px;display:flex;flex-direction:column;gap:10px">
            <strong class="hd" style="font-size:13.5px">Kepatuhan PSAK &amp; Pajak</strong>
            <div style="font-size:12px;color:${theme.muted};line-height:1.5">${esc(project.indonesiaContext)}</div>
            <div style="margin-top:auto;padding:11px;background:#0e121a;color:#34d399;border-radius:6px;font-size:10px" class="mono">${esc(project.preview.snippet)}</div>
          </div>
        </div>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 18. EMAIL / EXECUTIVE APPROVAL INBOX (Master-detail Superhuman/Linear queue)
  // ---------------------------------------------------------------------------
  if (layout === 'email-approval-inbox') {
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:360px 1fr;background:${theme.bg}">
      <aside style="background:${theme.surface};border-right:1px solid ${theme.borderStrong};display:flex;flex-direction:column">
        <div style="padding:16px 18px;border-bottom:1px solid ${theme.border};display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)}</strong>
            <div class="mono muted">${esc(pageSpec.title)} · 4 MENUNGGU</div>
          </div>
          <span class="mono" style="padding:3px 8px;background:${c};color:#fff;border-radius:4px;font-size:10.5px;font-weight:700">INBOX</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column">
          ${items.map((it, i) => `
            <div style="padding:14px 18px;border-bottom:1px solid ${theme.border};background:${i === 0 ? theme.surface2 : 'transparent'};border-left:4px solid ${i === 0 ? c : 'transparent'}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="mono" style="font-size:10.5px;font-weight:700;color:${c}">${esc(it.code)}</span>
                ${pill(it.status, it.tone, theme.dark)}
              </div>
              <div style="font-weight:700;font-size:13px;margin-top:5px">${esc(it.title)}</div>
              <div class="muted" style="margin-top:3px">${esc(it.subtitle)}</div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11.5px">
                <span class="mono" style="font-weight:700">${esc(it.value)}</span>
                <span class="mono muted">${esc(it.meta || 'SLA 2j')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </aside>

      <main style="padding:26px 34px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid ${theme.border};padding-bottom:16px">
          <div>
            <div class="mono" style="font-size:11px;color:${c};font-weight:700">${esc(items[0].code)} · ${esc(project.standards.join(' · '))}</div>
            <h1 class="hd" style="margin:6px 0 0;font-size:24px">${esc(items[0].title)}</h1>
            <div class="muted" style="margin-top:4px">Diajukan oleh ${esc(persona)} · ${esc(project.preview.envTag)}</div>
          </div>
          <div style="text-align:right">
            <div class="muted">Nilai / Dampak</div>
            <div class="mono" style="font-size:24px;font-weight:700;color:${c}">${esc(items[0].value)}</div>
          </div>
        </div>

        <!-- DoA Approval Stepper -->
        <div class="card" style="padding:16px 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${[
            { s: '01 Pemohon', d: 'Selesai · 09:12', ok: true },
            { s: '02 Verifikasi Sistem', d: 'Lolos Otomatis', ok: true },
            { s: '03 Persetujuan Anda', d: 'Menunggu Aksi', cur: true },
            { s: '04 Eksekusi & Audit', d: 'Terjadwal', ok: false },
          ].map((st) => `
            <div style="padding:10px 12px;border-radius:7px;background:${st.cur ? theme.surface2 : 'transparent'};border:1.5px solid ${st.cur ? c : st.ok ? '#16a34a' : theme.border}">
              <div class="mono" style="font-size:10px;font-weight:700;color:${st.cur ? c : st.ok ? '#16a34a' : theme.muted}">${st.s}</div>
              <div style="font-size:12px;font-weight:600;margin-top:3px">${st.d}</div>
            </div>
          `).join('')}
        </div>

        <div class="card" style="padding:20px;flex:1;display:flex;flex-direction:column;gap:14px">
          <div style="font-size:13.5px;line-height:1.65">${esc(project.summary)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${project.features.map((f, i) => `<div style="padding:10px 12px;background:${theme.surface2};border-radius:6px;font-size:12px"><strong class="mono" style="color:${c}">✓</strong> ${esc(f)}</div>`).join('')}
          </div>
          <div style="margin-top:auto;padding:12px;background:#0e121a;color:#34d399;border-radius:6px;font-size:10.5px" class="mono">${esc(project.preview.snippet)}</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="mono muted">Shortcut Keyboard: [A] Setujui · [R] Revisi · [D] Delegasi</span>
          <div style="display:flex;gap:10px">
            <span class="btn-s" style="color:#dc2626;border-color:#fca5a5">Tolak / Kembalikan</span>
            <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
            <span class="btn-p" style="background:#16a34a;padding:9px 22px;font-size:13px">${esc(project.preview.primaryAction)}</span>
          </div>
        </div>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 19. DAG PIPELINE / WORKFLOW CANVAS (n8n / Airflow / AI Router visual node graph)
  // ---------------------------------------------------------------------------
  if (layout === 'dag-pipeline-canvas') {
    const dk = theme.dark;
    const nodes = [
      { x: 34, y: 120, tag: '01 INGEST', title: project.architecture.client.slice(0, 22), ms: '12 ms', col: '#2563eb' },
      { x: 270, y: 50, tag: '02 GUARDRAIL', title: project.architecture.edge.slice(0, 22), ms: '8 ms', col: '#d97706' },
      { x: 270, y: 220, tag: '02B SCHEMA', title: project.standards[0].slice(0, 22), ms: '5 ms', col: '#7c3aed' },
      { x: 520, y: 135, tag: '03 CORE ENGINE', title: project.architecture.core.slice(0, 22), ms: '42 ms', col: c },
      { x: 755, y: 135, tag: '04 SINK / AUDIT', title: project.architecture.storage.slice(0, 22), ms: '9 ms', col: '#16a34a' },
    ];

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:54px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 7)}
          <strong class="hd" style="font-size:16px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">DAG AKTIF · 5 NODE</span>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;display:grid;grid-template-columns:1fr 310px;overflow:hidden">
        <!-- Dot-Grid Visual Workflow Canvas -->
        <div style="position:relative;padding:24px;background-image:radial-gradient(${theme.borderStrong} 1px, transparent 1px);background-size:20px 20px;display:flex;flex-direction:column;justify-content:space-between">
          <svg viewBox="0 0 940 370" width="100%" style="overflow:visible">
            <!-- Smooth Bezier Edges -->
            <path d="M214,165 C242,165 242,95 270,95" fill="none" stroke="${c}" stroke-width="2.5"/>
            <path d="M214,165 C242,165 242,265 270,265" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
            <path d="M460,95 C490,95 490,180 520,180" fill="none" stroke="${c}" stroke-width="2.5"/>
            <path d="M460,265 C490,265 490,180 520,180" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
            <path d="M710,180 H755" fill="none" stroke="#16a34a" stroke-width="3"/>
            ${nodes.map((n) => `
              <rect x="${n.x}" y="${n.y}" width="185" height="92" rx="9" fill="${theme.surface}" stroke="${n.col}" stroke-width="2.2"/>
              <rect x="${n.x}" y="${n.y}" width="185" height="24" rx="7" fill="${n.col}"/>
              <text x="${n.x + 10}" y="${n.y + 16}" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="#fff">${esc(n.tag)}</text>
              <text x="${n.x + 10}" y="${n.y + 52}" font-size="12" font-weight="700" fill="${theme.text}">${esc(n.title)}</text>
              <text x="${n.x + 10}" y="${n.y + 76}" font-size="10" font-family="Cascadia Mono,monospace" fill="#16a34a">● PASS · ${n.ms}</text>
            `).join('')}
          </svg>

          <!-- Execution Run Log Strip -->
          <div class="card" style="padding:14px 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            ${[m0, m1, m2].map((m) => `
              <div><div class="muted">${esc(m.label)}</div><div class="mono" style="font-size:18px;font-weight:700;color:${c}">${esc(m.value)}</div></div>
            `).join('')}
          </div>
        </div>

        <aside style="background:${theme.surface};border-left:1px solid ${theme.border};padding:18px;display:flex;flex-direction:column;gap:12px">
          <div class="mono muted" style="font-size:10px;font-weight:700">INSPEKTOR NODE · 03 CORE ENGINE</div>
          <strong class="hd" style="font-size:15px">${esc(project.architecture.core)}</strong>
          <div style="display:flex;flex-direction:column;gap:8px;flex:1">
            ${items.map((it) => `
              <div style="padding:10px;background:${theme.surface2};border-radius:6px;border:1px solid ${theme.border}">
                <div style="display:flex;justify-content:space-between"><span class="mono" style="font-size:10px;color:${c};font-weight:700">${esc(it.code)}</span>${pill(it.status, it.tone, dk)}</div>
                <div style="font-weight:600;font-size:12px;margin-top:3px">${esc(it.title)}</div>
                <div class="mono muted" style="margin-top:2px">${esc(it.value)}</div>
              </div>
            `).join('')}
          </div>
          <div style="padding:10px;background:#0d1118;color:#34d399;border-radius:6px;font-size:10px" class="mono">${esc(project.preview.snippet.slice(0, 128))}</div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 20. FORM WIZARD ONBOARDING (5-step Indonesian KPR/OSS/Tax/Halal submission + live calculator)
  // ---------------------------------------------------------------------------
  if (layout === 'form-wizard-onboarding') {
    const steps = ['Identitas & NIK/NPWP', 'Verifikasi Dokumen', 'Parameter & Kuota', 'Simulasi & Pajak', 'Tanda Tangan & Kirim'];
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:58px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 28px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 32, 7)}
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)} — ${esc(pageSpec.title)}</strong>
            <div class="mono muted">${esc(project.standards.join(' · '))}</div>
          </div>
        </div>
        <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">LANGKAH 3 DARI 5 · TERSIMPAN OTOMATIS</span>
      </header>

      <div style="flex:1;padding:24px 28px;display:grid;grid-template-columns:230px 1fr 320px;gap:22px;overflow:hidden">
        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px">
          <div class="mono muted" style="font-size:10px;font-weight:700">ALUR PENGAJUAN</div>
          ${steps.map((st, i) => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;background:${i === 2 ? theme.surface2 : 'transparent'};border:1px solid ${i === 2 ? c : 'transparent'}">
              <span class="mono" style="width:24px;height:24px;border-radius:12px;background:${i < 2 ? '#16a34a' : i === 2 ? c : theme.surface2};color:${i <= 2 ? '#fff' : theme.muted};display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i < 2 ? '✓' : i + 1}</span>
              <span style="font-size:12px;font-weight:${i === 2 ? 700 : 500};color:${i === 2 ? c : theme.text}">${st}</span>
            </div>
          `).join('')}
          <div style="margin-top:auto;padding-top:12px;border-top:1px solid ${theme.border};font-size:11px" class="muted">
            Enkripsi AES-256 · Patuh UU PDP No. 27/2022
          </div>
        </aside>

        <section class="card" style="padding:24px 28px;display:flex;flex-direction:column;gap:16px">
          <div>
            <h2 class="hd" style="margin:0;font-size:20px">Langkah 3: Parameter &amp; Validasi ${esc(project.standards[0])}</h2>
            <p class="muted" style="margin:4px 0 0">${esc(project.tagline)}</p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            ${items.map((it) => `
              <div style="display:flex;flex-direction:column;gap:5px">
                <label class="mono muted" style="font-size:10px;font-weight:700">${esc(it.code)} · ${esc(it.meta || 'FIELD WAJIB')}</label>
                <div style="padding:10px 12px;background:${theme.surface2};border:1.5px solid ${theme.borderStrong};border-radius:7px;display:flex;justify-content:space-between;align-items:center">
                  <span style="font-weight:600;font-size:12.5px" class="clamp1">${esc(it.title.slice(0, 26))}</span>
                  <strong class="mono" style="color:${c};font-size:12px">${esc(it.value)}</strong>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="padding:14px;background:${theme.surface2};border:1px dashed ${c};border-radius:8px">
            <div class="mono" style="font-size:10px;color:${c};font-weight:700;margin-bottom:8px">LAMPIRAN TERVERIFIKASI OTOMATIS (OCR &amp; HASH)</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ e-KTP / NPWP-16 Valid</span>
              <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ Dokumen ${esc(project.standards[0])} Lolos</span>
              <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ Rekening Bank Cocok</span>
            </div>
          </div>

          <div style="margin-top:auto;display:flex;justify-content:space-between;padding-top:14px;border-top:1px solid ${theme.border}">
            <span class="btn-s">&lt;- Kembali</span>
            <span class="btn-p" style="background:${c};padding:9px 22px">${esc(project.preview.primaryAction)} -&gt;</span>
          </div>
        </section>

        <aside class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px">
          <strong class="hd" style="font-size:15px">Kalkulator &amp; Kelayakan Live</strong>
          <div style="padding:14px;background:${c};color:#fff;border-radius:9px">
            <div class="mono" style="font-size:10px;opacity:0.85">${esc(m0.label.toUpperCase())}</div>
            <div class="mono" style="font-size:26px;font-weight:700;margin-top:4px">${esc(m0.value)}</div>
            <div style="font-size:11.5px;opacity:0.9;margin-top:6px">${esc(m1.label)}: ${esc(m1.value)}</div>
          </div>
          <div style="display:flex;justify-content:center;padding:8px 0">${donutRing(92, '#16a34a', theme.border, 94, theme.text)}</div>
          <div style="text-align:center;font-weight:700;font-size:12.5px">Skor Kelengkapan: 92% Siap Proses</div>
          <div style="margin-top:auto;padding:11px;background:#0e121a;color:#34d399;border-radius:6px;font-size:10px" class="mono">${esc(project.preview.snippet.slice(0, 118))}</div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 21. TRADING / FRAUD / SOC COMMAND TERMINAL (Bloomberg/Stockbit dark multi-pane)
  // ---------------------------------------------------------------------------
  if (layout === 'trading-fraud-terminal') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#080a0e;color:#e8edf5">
      <div style="height:32px;background:#0f131b;border-bottom:1px solid #222b3d;padding:0 16px;display:flex;align-items:center;gap:22px;font-size:10.5px;overflow:hidden" class="mono">
        <span style="color:#34d399;font-weight:700">● LIVE STREAM</span>
        <span>${esc(m0.label)}: <strong style="color:#38bdf8">${esc(m0.value)}</strong></span>
        <span>${esc(m1.label)}: <strong style="color:#fbbf24">${esc(m1.value)}</strong></span>
        <span>${esc(m2.label)}: <strong style="color:#f87171">${esc(m2.value)}</strong></span>
        <span style="margin-left:auto;color:#94a3b8">${esc(project.preview.envTag)}</span>
      </div>

      <header style="height:48px;background:#111620;border-bottom:1px solid #253046;padding:0 18px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          ${monogram(project.name, c, 28, 5)}
          <strong class="mono" style="font-size:14px">${esc(project.name.toUpperCase())} // ${esc(pageSpec.title.toUpperCase())}</strong>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s" style="background:#1a2232;color:#e2e8f0;border-color:#334155">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:#dc2626">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <main style="flex:1;padding:14px 18px;display:grid;grid-template-columns:1.25fr 1fr 310px;gap:14px;overflow:hidden">
        <!-- Entity Network & Velocity Graph -->
        <div style="background:#10151f;border:1px solid #232d42;border-radius:7px;padding:14px;display:flex;flex-direction:column;gap:12px">
          <div class="mono" style="font-size:10.5px;color:#f87171;font-weight:700">KORELASI ENTITAS &amp; ANOMALI REAL-TIME</div>
          <svg viewBox="0 0 480 250" width="100%" style="background:#080b10;border:1px solid #1d2638;border-radius:6px">
            ${[0, 1, 2, 3, 4].map((i) => {
              const y = 35 + i * 44;
              return `<line x1="88" y1="${y}" x2="235" y2="125" stroke="${i < 2 ? '#ef4444' : '#38bdf8'}" stroke-width="1.6" stroke-dasharray="${i < 2 ? '4 2' : ''}"/>
                <circle cx="78" cy="${y}" r="8" fill="#1e293b" stroke="${i < 2 ? '#ef4444' : '#38bdf8'}" stroke-width="2"/>
                <text x="16" y="${y + 4}" font-size="9" font-family="Cascadia Mono,monospace" fill="#94a3b8">ND-0${i + 1}</text>`;
            }).join('')}
            <circle cx="240" cy="125" r="32" fill="#7f1d1d" stroke="#f87171" stroke-width="2.5"/>
            <text x="240" y="122" text-anchor="middle" font-size="10" font-family="Cascadia Mono,monospace" font-weight="700" fill="#fff">${esc(items[0].code)}</text>
            <text x="240" y="136" text-anchor="middle" font-size="8.5" font-family="Cascadia Mono,monospace" fill="#fca5a5">SKOR 96</text>
            <line x1="272" y1="125" x2="360" y2="75" stroke="#fbbf24" stroke-width="2"/>
            <line x1="272" y1="125" x2="360" y2="175" stroke="#34d399" stroke-width="2"/>
            <rect x="360" y="54" width="108" height="42" rx="5" fill="#172033" stroke="#fbbf24"/>
            <text x="370" y="72" font-size="9" font-family="Cascadia Mono,monospace" fill="#fbbf24">TAHAN / BLOK</text>
            <text x="370" y="86" font-size="8.5" fill="#cbd5e1">${esc(items[0].value.slice(0, 12))}</text>
            <rect x="360" y="154" width="108" height="42" rx="5" fill="#172033" stroke="#34d399"/>
            <text x="370" y="172" font-size="9" font-family="Cascadia Mono,monospace" fill="#34d399">LAPORAN OTOMATIS</text>
            <text x="370" y="186" font-size="8.5" fill="#cbd5e1">${esc(project.standards[0].slice(0, 12))}</text>
          </svg>

          <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end">
            <div class="mono" style="font-size:10px;color:#94a3b8;margin-bottom:6px">KECEPATAN EVENT (60 MENIT TERAKHIR)</div>
            ${sparkPath([18, 22, 19, 25, 42, 88, 94, 72, 65, 58], '#f43f5e', 460, 110)}
          </div>
        </div>

        <!-- Depth / Risk Matrix -->
        <div style="background:#10151f;border:1px solid #232d42;border-radius:7px;padding:14px;display:flex;flex-direction:column;gap:10px">
          <div class="mono" style="font-size:10.5px;color:#38bdf8;font-weight:700">MATRIKS KEDALAMAN &amp; KEPUTUSAN</div>
          ${items.map((it, i) => `
            <div style="padding:11px;background:#161d2b;border:1px solid #263147;border-left:3px solid ${it.tone === 'bad' ? '#ef4444' : it.tone === 'warn' ? '#f59e0b' : '#22c55e'};border-radius:5px">
              <div style="display:flex;justify-content:space-between"><span class="mono" style="font-size:10px;color:#7dd3fc">${esc(it.code)}</span>${pill(it.status, it.tone, true)}</div>
              <div style="font-weight:700;font-size:12.5px;margin-top:4px">${esc(it.title)}</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">${esc(it.subtitle)}</div>
              <div style="margin-top:8px;height:5px;background:#0b0f17;border-radius:3px;overflow:hidden"><div style="width:${94 - i * 16}%;height:100%;background:${it.tone === 'bad' ? '#ef4444' : it.tone === 'warn' ? '#f59e0b' : '#22c55e'}"></div></div>
            </div>
          `).join('')}
        </div>

        <!-- Right Playbook & Console -->
        <aside style="background:#10151f;border:1px solid #232d42;border-radius:7px;padding:14px;display:flex;flex-direction:column;gap:12px">
          <div class="mono" style="font-size:10.5px;color:#fbbf24;font-weight:700">PLAYBOOK RESPONS CEPAT</div>
          <div style="padding:12px;background:#070a0f;border:1px solid #1e283b;border-radius:5px;font-size:10.5px;color:#34d399;line-height:1.55" class="mono">
            ${esc(project.preview.snippet)}
          </div>
          <div style="display:flex;flex-direction:column;gap:7px;flex:1">
            ${project.features.map((f) => `<div style="padding:8px 10px;background:#151c29;border-radius:5px;font-size:11px;color:#cbd5e1">▸ ${esc(f)}</div>`).join('')}
          </div>
          <div class="mono" style="font-size:10px;color:#94a3b8">Operator: ${esc(persona)}</div>
        </aside>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 22. CLINICAL EMR / VET PATIENT CHART (Sticky patient banner + vitals + SOAP + e-Resep)
  // ---------------------------------------------------------------------------
  const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
    <header style="height:64px;background:${c};color:#fff;padding:0 24px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:40px;height:40px;border-radius:20px;background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px" class="mono">RM</div>
        <div>
          <div class="hd" style="font-size:17px;font-weight:700">${esc(items[0].title)}</div>
          <div class="mono" style="font-size:10.5px;opacity:0.88">${esc(project.name)} · ${esc(pageSpec.title)} · ${esc(project.standards[0])}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="padding:4px 10px;background:#dc2626;border-radius:5px;font-size:11px;font-weight:700">ALERGI: SULFA</span>
        <span style="padding:6px 14px;background:#fff;color:${c};border-radius:6px;font-weight:700;font-size:12px">${esc(project.preview.primaryAction)}</span>
      </div>
    </header>

    <main style="flex:1;padding:18px 24px;display:grid;grid-template-columns:290px 1fr 310px;gap:18px;overflow:hidden">
      <!-- Left Vitals & Wave -->
      <aside class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <strong class="hd" style="font-size:14px">Tanda Vital &amp; Triase</strong>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${[m0, m1, m2, { label: 'Suhu / SpO2', value: '36.8°C · 98%' }].map((m) => `
            <div style="padding:10px;background:${theme.surface2};border-radius:7px">
              <div class="muted">${esc(m.label)}</div>
              <div class="mono" style="font-weight:700;font-size:14.5px;color:${c};margin-top:3px">${esc(m.value)}</div>
            </div>
          `).join('')}
        </div>
        <div style="padding:10px;background:#0c1412;border-radius:7px">
          <div class="mono" style="font-size:9.5px;color:#34d399;margin-bottom:4px">MONITOR TELEMETRI LIVE</div>
          <svg viewBox="0 0 240 66" width="100%">
            <polyline points="0,38 35,38 44,30 50,38 62,38 68,10 75,58 82,26 90,38 140,38 150,30 156,38 170,38 176,10 184,58 192,26 202,38 240,38" fill="none" stroke="#34d399" stroke-width="2"/>
          </svg>
        </div>
        <div style="margin-top:auto;font-size:11.5px;color:${theme.muted}">
          <div>Klinisi: <strong style="color:${theme.text}">${esc(persona)}</strong></div>
          <div style="margin-top:3px">Sinkronisasi: <strong style="color:#16a34a">${esc(project.standards.join(' · '))}</strong></div>
        </div>
      </aside>

      <!-- Center Structured SOAP Notes -->
      <section class="card" style="padding:20px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong class="hd" style="font-size:15.5px">Catatan Klinis Terstruktur (SOAP)</strong>
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">ICD-10 / FHIR VALID</span>
        </div>
        ${[
          { k: 'S — Subjektif', v: items[0].subtitle },
          { k: 'O — Objektif', v: `${items[1].title} · ${items[1].subtitle}` },
          { k: 'A — Asesmen & Kode', v: `${items[2].title} (${items[2].value})` },
          { k: 'P — Rencana & Terapi', v: project.features[0] },
        ].map((row) => `
          <div style="padding:12px 14px;background:${theme.surface2};border-left:4px solid ${c};border-radius:6px">
            <div class="mono" style="font-size:10px;font-weight:700;color:${c}">${row.k}</div>
            <div style="font-size:12.5px;margin-top:3px;line-height:1.45">${esc(row.v)}</div>
          </div>
        `).join('')}
        <div style="margin-top:auto;padding:11px;background:#0d1418;color:#34d399;border-radius:6px;font-size:10px" class="mono">
          ${esc(project.preview.snippet)}
        </div>
      </section>

      <!-- Right e-Resep / Tindakan Builder -->
      <aside class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">
        <strong class="hd" style="font-size:14.5px">e-Resep &amp; Tindakan (KFA)</strong>
        ${items.map((it) => `
          <div style="padding:10px 12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:7px">
            <div style="display:flex;justify-content:space-between"><span class="mono" style="font-size:10px;color:${c};font-weight:700">${esc(it.code)}</span>${pill(it.status, it.tone, theme.dark)}</div>
            <div style="font-weight:700;font-size:12px;margin-top:3px">${esc(it.title)}</div>
            <div class="mono muted" style="margin-top:2px">${esc(it.value)}</div>
          </div>
        `).join('')}
        <div style="margin-top:auto;padding:11px;background:${c};color:#fff;border-radius:7px;text-align:center;font-weight:700;font-size:12.5px">
          Kirim ke Farmasi &amp; Sinkron FHIR
        </div>
      </aside>
    </main>
  </div>`;
  return pageWrap(body, theme, font);
}
