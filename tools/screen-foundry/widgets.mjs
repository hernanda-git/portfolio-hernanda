// 28 genuinely distinct, domain-exact SVG hero visual widgets so every product looks bespoke.
import {
  barChartSvg,
  cctvSceneSvg,
  dicomViewerSvg,
  esc,
  mapCanvasSvg,
  multiLineChartSvg,
  productThumbSvg,
  qrisSvg,
  scadaSchematicSvg,
  waveformSvg,
} from './svgGraphics.mjs';

export function renderHeroWidget(widgetType, project, theme, seed) {
  const c = project.brandColor;
  const c2 = theme.accent2;
  const dark = theme.dark;
  const bg = theme.surface2;
  const bd = theme.border;
  const tx = theme.text;
  const mu = theme.muted;
  const items = project.preview.items;

  switch (widgetType) {
    case 'latency-dual':
      return multiLineChartSvg(
        [340 - (seed % 40), 312, 286, 304, 260, 238, 198 + (seed % 25)],
        [420, 408, 392, 400, 378, 365, 352],
        ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'],
        c,
        mu,
        dark
      );

    case 'bilingual-redline':
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-family:Georgia,serif;font-size:11.5px;line-height:1.55">
        <div style="padding:12px;background:${theme.surface};border:1px solid ${bd};border-radius:5px">
          <div style="font-family:Cascadia Mono,monospace;font-size:9.5px;color:${c};font-weight:700;margin-bottom:6px">BAHASA INDONESIA (PREVAILING · UU 24/2009)</div>
          <p style="margin:0 0 8px">Pasal 14.2 — Pemroses Data wajib memberitahukan kegagalan pelindungan data pribadi secara tertulis dalam waktu paling lambat <mark style="background:#fef08a;padding:0 3px">3 x 24 jam</mark>.</p>
          <p style="margin:0;color:${mu}">Pasal 22 — Sengketa diselesaikan melalui arbitrase BANI berkedudukan di Jakarta.</p>
        </div>
        <div style="padding:12px;background:${theme.surface};border:1px solid ${bd};border-radius:5px">
          <div style="font-family:Cascadia Mono,monospace;font-size:9.5px;color:#dc2626;font-weight:700;margin-bottom:6px">ENGLISH COUNTERPART (2 DRIFT CONFLICTS)</div>
          <p style="margin:0 0 8px">Clause 14.2 — Processor shall notify breaches within <mark style="background:#fecaca;color:#991b1b;padding:0 3px">7 business days</mark> [CONFLICT: Art. 46 UU PDP].</p>
          <p style="margin:0;color:${mu}">Clause 19.1 — <mark style="background:#fecaca;color:#991b1b;padding:0 3px">English text shall prevail</mark> [NON-COMPLIANT].</p>
        </div>
      </div>`;

    case 'audio-waveform':
      return waveformSvg(c, mu);

    case 'code-diff':
      return `<div style="background:#0a0d13;border:1px solid #242b3a;border-radius:6px;padding:12px 14px;font-family:Cascadia Mono,monospace;font-size:11px;line-height:1.65;color:#cbd5e1">
        <div style="color:#64748b">@@ -14,6 +14,8 @@ ${esc(project.name)} / ${esc(items[0].code)}</div>
        <div style="background:#2e1418;color:#fca5a5;padding:1px 6px">- ${esc(items[0].subtitle)}</div>
        <div style="background:#0f2b1e;color:#6ee7b7;padding:1px 6px">+ [Verified] ${esc(project.architecture.core)}</div>
        <div style="background:#0f2b1e;color:#6ee7b7;padding:1px 6px">+ [Standard] ${esc(project.standards.join(' | '))}</div>
        <div style="color:#93c5fd;margin-top:6px">$ ${esc(project.preview.snippet.split('\n')[0])}</div>
      </div>`;

    case 'ecg-soap':
      return `<svg viewBox="0 0 640 130" width="100%" height="130" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        <path d="M0,32H640 M0,65H640 M0,98H640 M80,0V130 M160,0V130 M240,0V130 M320,0V130 M400,0V130 M480,0V130 M560,0V130" stroke="${bd}" stroke-width="0.8"/>
        <polyline points="0,72 52,72 64,62 72,72 88,72 96,24 106,104 116,54 128,72 195,72 206,62 214,72 232,72 240,22 250,104 260,54 274,72 345,72 356,62 366,72 384,72 392,24 402,102 412,54 426,72 505,72 518,62 528,72 544,72 552,24 562,104 574,56 590,72 640,72" fill="none" stroke="${c}" stroke-width="2.2"/>
        <text x="14" y="20" font-size="10" font-family="Cascadia Mono,monospace" font-weight="700" fill="${c}">LEAD II · 78 BPM · SpO2 98% · TD 138/84 mmHg · SATUSEHAT FHIR R4</text>
      </svg>`;

    case 'radar-spider':
      return `<svg viewBox="0 0 520 180" width="100%" height="180" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        <g transform="translate(135,92)">
          <polygon points="0,-68 59,-34 59,34 0,68 -59,34 -59,-34" fill="none" stroke="${bd}" stroke-width="1"/>
          <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="${bd}" stroke-width="1"/>
          <polygon points="0,-60 48,-24 42,28 0,52 -52,22 -44,-30" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="2"/>
          <text x="0" y="-73" text-anchor="middle" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">PROMPT-INJ</text>
          <text x="66" y="-28" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">ID-SLANG</text>
          <text x="66" y="34" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">TOOL-ACL</text>
          <text x="0" y="79" text-anchor="middle" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">PII-EXFIL</text>
          <text x="-66" y="34" text-anchor="end" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">RAG-POISON</text>
          <text x="-66" y="-28" text-anchor="end" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${mu}">JAILBREAK</text>
        </g>
        <g transform="translate(275,24)">
          <text x="0" y="14" font-size="11" font-weight="700" fill="${tx}">${esc(project.name)} Coverage Matrix</text>
          <rect x="0" y="30" width="215" height="24" rx="4" fill="${theme.surface}" stroke="${bd}"/>
          <text x="10" y="46" font-size="10" font-family="Cascadia Mono,monospace" fill="${c}">99.8% Adversarial Hold Rate</text>
          <rect x="0" y="64" width="215" height="24" rx="4" fill="${theme.surface}" stroke="${bd}"/>
          <text x="10" y="80" font-size="10" font-family="Cascadia Mono,monospace" fill="${c2}">${esc(items[0].code)} · ${esc(items[0].status)}</text>
          <rect x="0" y="98" width="215" height="24" rx="4" fill="${theme.surface}" stroke="${bd}"/>
          <text x="10" y="114" font-size="10" font-family="Cascadia Mono,monospace" fill="${mu}">${esc(project.standards.join(' · '))}</text>
        </g>
      </svg>`;

    case 'cctv-wall': {
      const cols = ['#ef4444', '#f59e0b', '#22c55e', '#38bdf8'];
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${items.map((it, i) => cctvSceneSvg(it.code, it.title.slice(0, 18), `${it.value} · ${it.meta || '95%'}`, cols[i % 4])).join('')}
      </div>`;
    }

    case 'mule-network':
      return `<svg viewBox="0 0 600 185" width="100%" height="185" style="display:block;background:#0b0f17;border:1px solid #242c3e;border-radius:6px">
        <text x="14" y="20" font-size="9.5" font-family="Cascadia Mono,monospace" fill="#f87171">DETECTED MULE FAN-IN RING #14 · 19 SENDERS -> 1 NEW MERCHANT IN 4 MIN</text>
        ${[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 40 + i * 24;
          return `<line x1="98" y1="${y}" x2="295" y2="98" stroke="#f87171" stroke-width="1.3" stroke-dasharray="4 2"/>
            <circle cx="90" cy="${y}" r="7" fill="#1e293b" stroke="#fbbf24" stroke-width="1.5"/>
            <text x="18" y="${y + 3}" font-size="8.5" font-family="Cascadia Mono,monospace" fill="#94a3b8">ACC-0${i + 1}</text>`;
        }).join('')}
        <circle cx="300" cy="98" r="26" fill="#7f1d1d" stroke="#f87171" stroke-width="2.2"/>
        <text x="300" y="95" text-anchor="middle" font-size="9" font-family="Cascadia Mono,monospace" font-weight="700" fill="#fff">MID-992</text>
        <text x="300" y="108" text-anchor="middle" font-size="8" font-family="Cascadia Mono,monospace" fill="#fca5a5">SCORE 96</text>
        <line x1="326" y1="98" x2="465" y2="62" stroke="#38bdf8" stroke-width="1.6"/>
        <line x1="326" y1="98" x2="465" y2="136" stroke="#38bdf8" stroke-width="1.6"/>
        <rect x="465" y="44" width="118" height="36" rx="4" fill="#172033" stroke="#f87171"/>
        <text x="475" y="60" font-size="9" font-family="Cascadia Mono,monospace" fill="#fca5a5">HOLD Rp 94.5 jt</text>
        <text x="475" y="73" font-size="8" fill="#94a3b8">T+1 Frozen</text>
        <rect x="465" y="118" width="118" height="36" rx="4" fill="#172033" stroke="#38bdf8"/>
        <text x="475" y="134" font-size="9" font-family="Cascadia Mono,monospace" fill="#7dd3fc">PPATK STR Draft</text>
        <text x="475" y="147" font-size="8" fill="#94a3b8">BI TIKMI Ready</text>
      </svg>`;

    case 'radial-gauge': {
      const scoreVal = project.preview.metrics[0].value;
      return `<div style="display:grid;grid-template-columns:220px 1fr;gap:14px;align-items:center;padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        <svg viewBox="0 0 200 135" width="200" height="135">
          <path d="M 22 112 A 78 78 0 0 1 178 112" fill="none" stroke="${bd}" stroke-width="14" stroke-linecap="round"/>
          <path d="M 22 112 A 78 78 0 0 1 162 66" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>
          <text x="100" y="96" text-anchor="middle" font-size="22" font-family="Cascadia Mono,monospace" font-weight="700" fill="${tx}">${esc(scoreVal)}</text>
          <text x="100" y="116" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono,monospace" fill="${mu}">${esc(project.preview.metrics[0].label.toUpperCase())}</text>
        </svg>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${items.map((it, i) => `<div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
              <span style="font-weight:600">${esc(it.title.slice(0, 34))}</span>
              <strong class="mono" style="color:${c}">${esc(it.value)}</strong>
            </div>
            <div style="height:6px;background:${bd};border-radius:3px;overflow:hidden"><div style="width:${92 - i * 14}%;height:100%;background:${i === 3 ? c2 : c}"></div></div>
          </div>`).join('')}
        </div>
      </div>`;
    }

    case 'corridor-hub':
      return `<svg viewBox="0 0 600 175" width="100%" height="175" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        ${[
          { lb: 'SINGAPORE (SGD)', y: 30, rate: 'Rp 11.840' },
          { lb: 'MALAYSIA (MYR)', y: 74, rate: 'Rp 3.585' },
          { lb: 'TAIWAN (TWD)', y: 118, rate: 'Rp 490' },
          { lb: 'JAPAN (JPY)', y: 158, rate: 'Rp 104' },
        ].map((src) => `
          <rect x="16" y="${src.y - 16}" width="150" height="28" rx="4" fill="${theme.surface}" stroke="${bd}"/>
          <text x="26" y="${src.y + 1}" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="${tx}">${src.lb}</text>
          <path d="M166,${src.y - 2} C230,${src.y - 2} 230,90 278,90" fill="none" stroke="${c}" stroke-width="1.8"/>
        `).join('')}
        <rect x="278" y="54" width="136" height="72" rx="6" fill="${c}"/>
        <text x="346" y="84" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">BI-FAST NEXUS</text>
        <text x="346" y="102" text-anchor="middle" font-size="9" font-family="Cascadia Mono,monospace" fill="rgba(255,255,255,0.85)">AVG 4.2 SEC · 0.45%</text>
        <line x1="414" y1="90" x2="458" y2="55" stroke="#16a34a" stroke-width="2"/>
        <line x1="414" y1="90" x2="458" y2="125" stroke="#16a34a" stroke-width="2"/>
        <rect x="458" y="34" width="126" height="40" rx="4" fill="${theme.surface}" stroke="#16a34a"/>
        <text x="468" y="52" font-size="10" font-weight="700" fill="${tx}">BRI / BNI / Mandiri</text>
        <text x="468" y="65" font-size="8.5" font-family="Cascadia Mono,monospace" fill="#16a34a">INSTANT IDR CREDIT</text>
        <rect x="458" y="106" width="126" height="40" rx="4" fill="${theme.surface}" stroke="${c2}"/>
        <text x="468" y="124" font-size="10" font-weight="700" fill="${tx}">PPATK IFTI Ledger</text>
        <text x="468" y="137" font-size="8.5" font-family="Cascadia Mono,monospace" fill="${c2}">AUTO SCREENED</text>
      </svg>`;

    case 'milestone-vault':
      return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        ${items.map((it, i) => `<div style="padding:10px;background:${theme.surface};border:1px solid ${i === 0 ? c : bd};border-top:3px solid ${i < 2 ? '#16a34a' : i === 2 ? c : mu};border-radius:5px">
          <div style="font-family:Cascadia Mono,monospace;font-size:9.5px;color:${mu}">STAGE 0${i + 1} · ${esc(it.code)}</div>
          <div style="font-weight:700;font-size:12px;margin:4px 0">${esc(it.title.slice(0, 24))}</div>
          <div style="font-family:Cascadia Mono,monospace;font-size:13px;font-weight:700;color:${c}">${esc(it.value)}</div>
          <div style="font-size:10px;color:${mu};margin-top:4px">${esc(it.status)}</div>
        </div>`).join('')}
      </div>`;

    case 'truck-load':
      return `<div style="padding:14px;background:${bg};border:1px solid ${bd};border-radius:6px;display:grid;grid-template-columns:1.2fr 1fr;gap:14px;align-items:center">
        <div>
          <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:${c};font-weight:700;margin-bottom:6px">FUSO TRONTON LOAD OPTIMIZER · 18.4 / 20.0 TON (92%)</div>
          <div style="height:36px;background:${theme.surface};border:2px solid ${tx};border-radius:4px;display:flex;overflow:hidden">
            <div style="width:42%;background:${c};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">Besi 13mm (8.4t)</div>
            <div style="width:36%;background:${c2};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">Semen 1 DO (8.0t)</div>
            <div style="width:14%;background:#16a34a;color:#fff;font-size:9.5px;font-weight:700;display:flex;align-items:center;justify-content:center">GRC</div>
          </div>
          <div style="font-size:11px;color:${mu};margin-top:6px">Free bongkar Jabodetabek · TOP 30 Hari · Faktur Pajak PPN auto-queued</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${productThumbSvg(seed, c)}
          ${productThumbSvg(seed + 1, c2)}
        </div>
      </div>`;

    case 'oee-rings':
      return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        ${[
          { lb: 'Availability', pct: 89, col: c },
          { lb: 'Performance', pct: 93, col: '#16a34a' },
          { lb: 'Quality Yield', pct: 98, col: c2 },
        ].map((g) => `<div style="text-align:center;padding:8px;background:${theme.surface};border:1px solid ${bd};border-radius:5px">
          <svg viewBox="0 0 90 90" width="76" height="76">
            <circle cx="45" cy="45" r="34" fill="none" stroke="${bd}" stroke-width="8"/>
            <circle cx="45" cy="45" r="34" fill="none" stroke="${g.col}" stroke-width="8" stroke-dasharray="${(g.pct * 2.13).toFixed(0)} 220" transform="rotate(-90 45 45)"/>
            <text x="45" y="49" text-anchor="middle" font-size="14" font-family="Cascadia Mono,monospace" font-weight="700" fill="${tx}">${g.pct}%</text>
          </svg>
          <div style="font-size:11px;font-weight:700;margin-top:2px">${g.lb}</div>
        </div>`).join('')}
      </div>`;

    case 'branch-heatmap': {
      const cities = ['SBY', 'JKT', 'SMG', 'BDG', 'DPS', 'MKS', 'MDN', 'BPN', 'PLM', 'PKU', 'YOG', 'MLG', 'BTM', 'MDO', 'PTK', 'BJM', 'LPG', 'SMD'];
      return `<div style="padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:${mu};margin-bottom:8px">18-BRANCH NATIONAL OPERATIONS MATRIX (RANK · TEMP · HYGIENE)</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">
          ${cities.map((ct, idx) => {
            const score = 97 - idx * 1.1;
            const bgc = idx < 5 ? '#dcfce7' : idx < 13 ? '#eff6ff' : idx < 16 ? '#fef3c7' : '#fee2e2';
            const fgc = idx < 5 ? '#166534' : idx < 13 ? '#1e40af' : idx < 16 ? '#92400e' : '#991b1b';
            return `<div style="padding:6px 8px;border-radius:4px;background:${bgc};color:${fgc};display:flex;justify-content:space-between;font-family:Cascadia Mono,monospace;font-size:10px;font-weight:700">
              <span>${ct}</span><span>${score.toFixed(0)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    case 'container-yard':
      return `<div style="padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:${c};font-weight:700;margin-bottom:8px">TANJUNG PRIOK TERMINAL 3 — YARD BLOCK BAY STACKING &amp; DUAL-TX SLOTS</div>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px">
          ${Array.from({ length: 24 }, (_, i) => {
            const st = i % 7 === 0 ? '#dc2626' : i % 3 === 0 ? c : i % 2 === 0 ? '#0d9488' : bd;
            return `<div style="height:26px;border-radius:3px;background:${st};color:#fff;font-family:Cascadia Mono,monospace;font-size:8.5px;display:flex;align-items:center;justify-content:center">${st === bd ? '' : `B${i + 1}`}</div>`;
          }).join('')}
        </div>
      </div>`;

    case 'fuel-siphon':
      return `<svg viewBox="0 0 600 160" width="100%" height="160" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        <rect x="332" y="18" width="90" height="118" fill="#ef4444" fill-opacity="0.16" stroke="#ef4444" stroke-dasharray="4 2"/>
        <text x="377" y="32" text-anchor="middle" font-size="9" font-family="Cascadia Mono,monospace" font-weight="700" fill="#dc2626">-42L SIPHON</text>
        <polyline points="20,42 120,48 220,55 320,62 346,64 366,112 480,115 580,119" fill="none" stroke="${c}" stroke-width="2.6"/>
        <circle cx="366" cy="112" r="5" fill="#dc2626"/>
        <text x="18" y="22" font-size="10" font-family="Cascadia Mono,monospace" font-weight="700" fill="${tx}">ULTRASONIC TANK LEVEL (L) · ENGINE OFF @ PANTURA SUBANG</text>
        <text x="18" y="148" font-size="9" font-family="Cascadia Mono,monospace" fill="${mu}">08:00 (230L) -> 12:00 (214L) -> 12:06 (172L ALERT) -> 4G DASHCAM CLIP SAVED</text>
      </svg>`;

    case 'ev-battery-slots':
      return `<div style="padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:${c};font-weight:700;margin-bottom:8px">CABINET #042 LIVE 12-BAY LFP BATTERY MATRIX (SoC % &amp; BMS HEALTH)</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">
          ${[98, 96, 94, 42, 68, 100, 95, 51, 99, 18, 92, 0].map((soc, i) => {
            const col = soc === 0 ? '#dc2626' : soc >= 90 ? '#16a34a' : soc >= 50 ? '#d97706' : '#64748b';
            return `<div style="padding:8px;background:${theme.surface};border:1.5px solid ${col};border-radius:5px;text-align:center">
              <div style="font-family:Cascadia Mono,monospace;font-size:8.5px;color:${mu}">BAY ${i + 1}</div>
              <div style="font-family:Cascadia Mono,monospace;font-size:13px;font-weight:700;color:${col}">${soc === 0 ? 'LOCK' : soc + '%'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    case 'solar-strings':
      return `<div style="padding:12px;background:#0e1218;border:1px solid #262e3d;border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:#fbbf24;margin-bottom:8px">CIKARANG ROOFTOP 1.8 MWp — 16 DC STRING ARRAY TELEMETRY (AMPS)</div>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
          ${[11.4, 11.2, 11.5, 0.2, 11.3, 11.1, 10.9, 11.4, 10.2, 10.1, 9.8, 10.4, 11.3, 11.2, 11.0, 11.4].map((amp, i) => {
            const fault = amp < 2;
            const col = fault ? '#ef4444' : amp < 10.5 ? '#f59e0b' : '#22c55e';
            return `<div style="padding:8px 4px;background:#161c26;border:1.5px solid ${col};border-radius:4px;text-align:center">
              <div style="font-family:Cascadia Mono,monospace;font-size:8px;color:#94a3b8">STR-${i + 1}</div>
              <div style="font-family:Cascadia Mono,monospace;font-size:11.5px;font-weight:700;color:${col}">${amp}A</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    case 'shrimp-ponds':
      return `<div style="padding:12px;background:#0b131c;border:1px solid #1e3346;border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:#38bdf8;margin-bottom:8px">BLOK TAMBAK LAMPUNG — 8 INTENSIVE VANNAMEI PONDS (DO mg/L · pH · KINCIR)</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${[
            { id: 'PND-01', do: '5.6', ph: '7.9', ok: true },
            { id: 'PND-02', do: '5.4', ph: '7.8', ok: true },
            { id: 'PND-03', do: '5.1', ph: '7.8', ok: true },
            { id: 'PND-04', do: '3.9', ph: '7.6', warn: true },
            { id: 'PND-05', do: '5.5', ph: '7.9', ok: true },
            { id: 'PND-06', do: '5.2', ph: '7.8', ok: true },
            { id: 'PND-07', do: '5.3', ph: '7.9', ok: true },
            { id: 'PND-08', do: '4.1', ph: '8.2', bad: true },
          ].map((p) => {
            const col = p.bad ? '#ef4444' : p.warn ? '#f59e0b' : '#38bdf8';
            return `<div style="padding:8px;background:#11202e;border:1.5px solid ${col};border-radius:5px">
              <div style="font-family:Cascadia Mono,monospace;font-size:9px;color:#94a3b8">${p.id}</div>
              <div style="font-family:Cascadia Mono,monospace;font-size:13px;font-weight:700;color:${col}">DO ${p.do}</div>
              <div style="font-family:Cascadia Mono,monospace;font-size:8.5px;color:#cbd5e1">pH ${p.ph} · Kincir ON</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    case 'bengkel-bays':
      return `<div style="padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:${c};font-weight:700;margin-bottom:8px">BENGKEL BINTARO — 8 HYDRAULIC LIFT BAYS FLOORPLAN</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${[
            { b: 'BAY 01', car: 'B 1120 KJA', st: 'Spooring', col: '#16a34a' },
            { b: 'BAY 02', car: 'B 2184 SZT', st: 'Innova 70%', col: c },
            { b: 'BAY 03', car: 'F 1842 AB', st: 'Ganti Oli', col: '#16a34a' },
            { b: 'BAY 04', car: 'OPEN LIFT', st: 'Available', col: mu },
            { b: 'BAY 05', car: 'B 1940 KLP', st: 'WA Approved', col: c },
            { b: 'BAY 06', car: 'B 2891 UY', st: 'AC Flush', col: '#16a34a' },
            { b: 'BAY 07', car: 'D 1182 ABC', st: 'Wait WA', col: '#d97706' },
            { b: 'BAY 08', car: 'B 1441 ZQ', st: 'Road Test', col: '#0284c7' },
          ].map((x) => `<div style="padding:8px;background:${theme.surface};border:1.5px solid ${x.col};border-radius:5px">
            <div style="font-family:Cascadia Mono,monospace;font-size:8.5px;color:${mu}">${x.b}</div>
            <div style="font-family:Cascadia Mono,monospace;font-size:11px;font-weight:700;color:${tx}">${x.car}</div>
            <div style="font-size:9.5px;font-weight:600;color:${x.col}">${x.st}</div>
          </div>`).join('')}
        </div>
      </div>`;

    case 'dcim-racks':
      return `<div style="padding:12px;background:#0b0f17;border:1px solid #222b3d;border-radius:6px">
        <div style="font-family:Cascadia Mono,monospace;font-size:10px;color:#38bdf8;margin-bottom:8px">HALL B AI-GPU COLOCATION — RACK THERMAL &amp; kW HEATMAP (PUE 1.38)</div>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px">
          ${[14, 16, 18, 24, 22, 15, 13, 17, 15, 19, 21, 25, 18, 14, 16, 12].map((kw, i) => {
            const col = kw >= 23 ? '#ef4444' : kw >= 19 ? '#f59e0b' : '#22c55e';
            return `<div style="padding:7px 4px;background:#131926;border-top:3px solid ${col};border-radius:3px;text-align:center">
              <div style="font-family:Cascadia Mono,monospace;font-size:8px;color:#94a3b8">B${String(i + 1).padStart(2, '0')}</div>
              <div style="font-family:Cascadia Mono,monospace;font-size:11px;font-weight:700;color:${col}">${kw}kW</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    case 'medallion-dag':
      return `<svg viewBox="0 0 640 135" width="100%" height="135" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        <line x1="150" y1="68" x2="215" y2="68" stroke="${c}" stroke-width="2"/>
        <line x1="365" y1="68" x2="430" y2="68" stroke="${c}" stroke-width="2"/>
        <rect x="20" y="30" width="130" height="76" rx="6" fill="${theme.surface}" stroke="#b45309" stroke-width="1.8"/>
        <text x="32" y="54" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="#b45309">01 BRONZE</text>
        <text x="32" y="76" font-size="11.5" font-weight="700" fill="${tx}">ERP + API Raw</text>
        <text x="32" y="94" font-size="9" fill="${mu}">SQL Server · Shopee</text>
        <rect x="215" y="30" width="150" height="76" rx="6" fill="${theme.surface}" stroke="#64748b" stroke-width="1.8"/>
        <text x="227" y="54" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="#64748b">02 SILVER</text>
        <text x="227" y="76" font-size="11.5" font-weight="700" fill="${tx}">dbt Clean &amp; Dedup</text>
        <text x="227" y="94" font-size="9" fill="${mu}">DuckDB · Rp Parity OK</text>
        <rect x="430" y="30" width="190" height="76" rx="6" fill="${c}"/>
        <text x="444" y="54" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="rgba(255,255,255,0.85)">03 GOLD · 07:00 WIB</text>
        <text x="444" y="76" font-size="12" font-weight="700" fill="#fff">Executive P&amp;L &amp; Margin</text>
        <text x="444" y="94" font-size="9" fill="rgba(255,255,255,0.8)">47/48 Fresh · Rp 0 Delta</text>
      </svg>`;

    case 'ciliwung-profile':
      return `<svg viewBox="0 0 640 165" width="100%" height="165" style="display:block;background:${bg};border:1px solid ${bd};border-radius:6px">
        <path d="M20,38 L190,68 L380,104 L590,126 L590,150 L20,150 Z" fill="#0284c7" fill-opacity="0.16"/>
        <polyline points="20,38 190,68 380,104 590,126" fill="none" stroke="#0284c7" stroke-width="3"/>
        <circle cx="80" cy="48" r="6" fill="#d97706"/><text x="80" y="32" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono,monospace" font-weight="700" fill="#b45309">KATULAMPA 140cm (S3)</text>
        <circle cx="240" cy="77" r="6" fill="#0284c7"/><text x="240" y="61" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono,monospace" fill="${tx}">DEPOK +2.5h</text>
        <circle cx="405" cy="107" r="6" fill="#16a34a"/><text x="405" y="91" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono,monospace" fill="#166534">MANGGARAI 740cm</text>
        <circle cx="555" cy="122" r="6" fill="#0284c7"/><text x="555" y="106" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono,monospace" fill="${tx}">PLUIT 3/4 PUMP</text>
      </svg>`;

    case 'rtl-maui-preview':
      return `<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:12px">
        <pre style="margin:0;padding:12px;background:#0d1117;color:#93c5fd;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55;white-space:pre-wrap">${esc(project.preview.snippet)}</pre>
        <div dir="rtl" style="padding:12px;background:${theme.surface};border:2px solid ${c};border-radius:10px">
          <div style="font-size:10px;font-family:Cascadia Mono,monospace;color:${c};margin-bottom:6px">MAUI 9 · RTL ARABIC PREVIEW</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:6px">نموذج فحص الموقع الميداني</div>
          <div style="padding:7px;background:${bg};border:1px solid ${bd};border-radius:4px;font-size:11px;margin-bottom:6px">موقع التفتيش: المنطقة الصناعية</div>
          <div style="padding:7px;background:${c};color:#fff;border-radius:4px;text-align:center;font-size:11px;font-weight:700">إرسال التقرير الميداني</div>
        </div>
      </div>`;

    case 'lab-ranges':
      return `<div style="display:flex;flex-direction:column;gap:8px;padding:12px;background:${bg};border:1px solid ${bd};border-radius:6px">
        ${[
          { n: 'Kalium (K+) Serum', v: '6.8 mmol/L', ref: '3.5–5.1', p: 93, col: '#dc2626' },
          { n: 'HbA1c HPLC', v: '8.4 %', ref: '4.0–5.6', p: 79, col: '#d97706' },
          { n: 'Hemoglobin (Hb)', v: '14.2 g/dL', ref: '13.0–17.0', p: 52, col: '#16a34a' },
        ].map((r) => `<div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><strong>${r.n}</strong><span class="mono" style="color:${r.col};font-weight:700">${r.v} (${r.ref})</span></div>
          <div style="position:relative;height:9px;background:${bd};border-radius:4px"><div style="position:absolute;left:28%;width:44%;height:100%;background:#bbf7d0"></div><div style="position:absolute;left:${r.p}%;top:-3px;width:6px;height:15px;border-radius:2px;background:${r.col}"></div></div>
        </div>`).join('')}
      </div>`;

    case 'dicom-scan':
      return dicomViewerSvg();

    case 'scada-smelter':
      return scadaSchematicSvg('smelter', c, items);

    case 'scada-cold':
      return scadaSchematicSvg('cold', c, items);

    case 'scada-mill':
      return scadaSchematicSvg('mill', c, items);

    case 'map-java':
      return mapCanvasSvg('java', c, items);

    case 'map-pit':
      return mapCanvasSvg('pit', c, items);

    case 'map-ndvi':
      return mapCanvasSvg('ndvi', c, items);

    case 'map-mangrove':
      return mapCanvasSvg('mangrove', c, items);

    case 'bar-regional':
    default: {
      const vals = [52 + (seed % 16), 61 + (seed % 12), 58 + (seed % 15), 73 + (seed % 11), 81 + (seed % 9), 89 + (seed % 8)];
      const lbs = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      return barChartSvg(vals, lbs, c, 5, dark);
    }
  }
}

export { qrisSvg, productThumbSvg };
