// Crisp, domain-authentic SVG visual generators for 1280x800 UI/UX product screenshots.

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function brandLogoSvg(name, color) {
  const letters = name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'ID';
  return `<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="6" fill="${color}"/>
    <rect x="2" y="2" width="22" height="22" rx="4.5" stroke="rgba(255,255,255,0.28)" stroke-width="1"/>
    <text x="13" y="16.5" text-anchor="middle" fill="#ffffff" font-family="Cascadia Mono, Consolas, monospace" font-size="10.5" font-weight="700">${esc(letters)}</text>
  </svg>`;
}

export function sparklineSvg(values, color, w = 88, h = 28) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 4) + 2;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const last = pts.split(' ').pop().split(',');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
    <polyline points="${pts}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="${color}"/>
  </svg>`;
}

export function multiLineChartSvg(seriesA, seriesB, labels, colorA, colorB, dark = false) {
  const W = 540;
  const H = 175;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const cw = W - padL - padR;
  const ch = H - padT - padB;
  const all = [...seriesA, ...seriesB];
  const max = Math.max(...all) * 1.12;
  const min = Math.min(...all) * 0.82;
  const span = max - min || 1;
  const toPts = (arr) =>
    arr.map((v, i) => [
      padL + (i / (arr.length - 1)) * cw,
      padT + ch - ((v - min) / span) * ch,
    ]);
  const pA = toPts(seriesA);
  const pB = toPts(seriesB);
  const line = (pts) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaA = `${padL},${padT + ch} ${line(pA)} ${padL + cw},${padT + ch}`;
  const gridCol = dark ? '#2a303c' : '#e7e7e2';
  const txtCol = dark ? '#8b93a3' : '#7a7a72';

  let grids = '';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * ch;
    const val = Math.round(max - (i / 4) * span);
    grids += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="${gridCol}" stroke-width="1"/>
      <text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9.5" font-family="Cascadia Mono, monospace" fill="${txtCol}">${val}</text>`;
  }
  const xLbls = labels
    .map((lb, i) => {
      const x = padL + (i / (labels.length - 1)) * cw;
      return `<text x="${x.toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono, monospace" fill="${txtCol}">${esc(lb)}</text>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block">
    ${grids}
    <polygon points="${areaA}" fill="${colorA}" fill-opacity="${dark ? '0.14' : '0.08'}"/>
    <polyline points="${line(pB)}" fill="none" stroke="${colorB}" stroke-width="1.6" stroke-dasharray="4 3"/>
    <polyline points="${line(pA)}" fill="none" stroke="${colorA}" stroke-width="2.2"/>
    ${pA.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${colorA}"/>`).join('')}
    ${xLbls}
  </svg>`;
}

export function barChartSvg(values, labels, color, highlightIdx = -1, dark = false) {
  const W = 520;
  const H = 168;
  const padL = 32;
  const padB = 24;
  const padT = 12;
  const cw = W - padL - 12;
  const ch = H - padT - padB;
  const max = Math.max(...values) * 1.15 || 100;
  const slot = cw / values.length;
  const bw = Math.min(34, slot * 0.56);
  const gridCol = dark ? '#2a303c' : '#e7e7e2';
  const mutedBar = dark ? '#343b49' : '#d5d5ce';
  const txtCol = dark ? '#8b93a3' : '#75756d';

  let out = '';
  for (let i = 0; i <= 3; i++) {
    const y = padT + (i / 3) * ch;
    out += `<line x1="${padL}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="${gridCol}" stroke-width="1"/>`;
  }
  values.forEach((v, i) => {
    const bh = (v / max) * ch;
    const x = padL + i * slot + (slot - bw) / 2;
    const y = padT + ch - bh;
    const fill = i === highlightIdx || (highlightIdx === -1 && i === values.length - 1) ? color : mutedBar;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${fill}"/>
      <text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-family="Cascadia Mono, monospace" fill="${txtCol}">${v}</text>
      <text x="${(x + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="9.5" font-family="Cascadia Mono, monospace" fill="${txtCol}">${esc(labels[i] || '')}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block">${out}</svg>`;
}

export function qrisSvg(seed = 1, size = 104) {
  let cells = '';
  const n = 15;
  const cell = size / n;
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inFinder =
        (r < 4 && c < 4) || (r < 4 && c >= n - 4) || (r >= n - 4 && c < 4);
      if (inFinder) continue;
      if (rnd() > 0.48) {
        cells += `<rect x="${(c * cell).toFixed(1)}" y="${(r * cell).toFixed(1)}" width="${(cell + 0.2).toFixed(1)}" height="${(cell + 0.2).toFixed(1)}" fill="#141413"/>`;
      }
    }
  }
  const finder = (x, y) => `
    <rect x="${x}" y="${y}" width="${cell * 3.8}" height="${cell * 3.8}" fill="#141413"/>
    <rect x="${x + cell * 0.65}" y="${y + cell * 0.65}" width="${cell * 2.5}" height="${cell * 2.5}" fill="#ffffff"/>
    <rect x="${x + cell * 1.25}" y="${y + cell * 1.25}" width="${cell * 1.3}" height="${cell * 1.3}" fill="#141413"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:#fff;padding:6px;border:1px solid #d4d4cc;border-radius:4px">
    ${finder(0, 0)}
    ${finder(size - cell * 3.8, 0)}
    ${finder(0, size - cell * 3.8)}
    ${cells}
  </svg>`;
}

export function mapCanvasSvg(variant, brandColor, items) {
  // Rich cartographic SVG tailored to Indonesian geographies
  const bg = variant === 'pit' ? '#1c1f26' : variant === 'mangrove' ? '#eef5f2' : '#eef2f6';
  const land = variant === 'pit' ? '#272c35' : variant === 'mangrove' ? '#d7e8df' : '#ffffff';
  const stroke = variant === 'pit' ? '#3b4252' : '#cbd5e1';
  const txtCol = variant === 'pit' ? '#e2e8f0' : '#1e293b';

  let geo = '';
  if (variant === 'archipelago' || variant === 'java') {
    geo = `
      <path d="M40,210 Q110,190 190,220 T350,235 T520,255 T680,248 L670,295 Q510,305 340,285 T150,270 L35,250 Z" fill="${land}" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M120,75 Q220,45 310,95 T430,110 L400,175 Q290,185 180,155 Z" fill="${land}" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M475,85 Q540,70 595,125 L560,185 Q495,165 470,130 Z" fill="${land}" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M88,236 Q240,248 410,258 T625,264" fill="none" stroke="${brandColor}" stroke-width="2.5" stroke-dasharray="6 3"/>
      <path d="M260,135 Q390,170 530,135" fill="none" stroke="#0c7c66" stroke-width="2" stroke-dasharray="4 3"/>
    `;
  } else if (variant === 'pit') {
    geo = `
      <ellipse cx="350" cy="180" rx="280" ry="130" fill="none" stroke="#3b4252" stroke-width="1.5"/>
      <ellipse cx="350" cy="180" rx="215" ry="96" fill="#222730" stroke="#475569" stroke-width="1.4"/>
      <ellipse cx="350" cy="180" rx="145" ry="62" fill="#1b1f27" stroke="#64748b" stroke-width="1.2"/>
      <ellipse cx="350" cy="180" rx="75" ry="30" fill="#15181f" stroke="#94a3b8" stroke-width="1"/>
      <path d="M85,245 Q175,205 265,178 T440,142 T620,108" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <path d="M130,105 Q250,145 350,180 T560,240" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 3"/>
    `;
  } else if (variant === 'watershed') {
    geo = `
      <path d="M50,330 Q180,260 280,210 T460,120 T650,45" fill="none" stroke="#0284c7" stroke-width="12" stroke-opacity="0.22"/>
      <path d="M50,330 Q180,260 280,210 T460,120 T650,45" fill="none" stroke="#0284c7" stroke-width="3.2"/>
      <path d="M190,340 Q270,275 340,215 T490,150" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <rect x="240" y="185" width="76" height="46" rx="4" fill="#fef3c7" stroke="#d97706" fill-opacity="0.7"/>
      <rect x="425" y="96" width="84" height="48" rx="4" fill="#fee2e2" stroke="#dc2626" fill-opacity="0.7"/>
    `;
  } else if (variant === 'ndvi' || variant === 'mangrove') {
    const blocks = [
      { x: 65, y: 55, w: 140, h: 95, c: '#15803d', lb: 'BLK-A12 · 0.82' },
      { x: 215, y: 55, w: 150, h: 95, c: '#d97706', lb: 'BLK-B04 · 0.58' },
      { x: 375, y: 55, w: 135, h: 95, c: '#16a34a', lb: 'BLK-A15 · 0.79' },
      { x: 520, y: 55, w: 120, h: 95, c: '#0d9488', lb: 'PLASMA · 0.84' },
      { x: 65, y: 162, w: 195, h: 110, c: '#166534', lb: 'DIV-I · 0.85' },
      { x: 270, y: 162, w: 175, h: 110, c: '#dc2626', lb: 'BLK-C09 · ALERT' },
      { x: 455, y: 162, w: 185, h: 110, c: '#15803d', lb: 'DIV-IV · 0.81' },
    ];
    geo = blocks
      .map(
        (b) => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="4" fill="${b.c}" fill-opacity="0.22" stroke="${b.c}" stroke-width="1.6"/>
        <text x="${b.x + 10}" y="${b.y + 22}" font-size="10.5" font-family="Cascadia Mono, monospace" font-weight="600" fill="${b.c}">${b.lb}</text>`
      )
      .join('');
  } else {
    // Urban / Port / EV Swap Grid
    geo = `
      <path d="M0,90 H700 M0,180 H700 M0,270 H700 M140,0 V360 M280,0 V360 M420,0 V360 M560,0 V360" stroke="${stroke}" stroke-width="1"/>
      <path d="M60,300 L190,210 L350,220 L480,115 L630,130" fill="none" stroke="${brandColor}" stroke-width="2.5"/>
      <path d="M120,75 L280,145 L440,260 L600,235" fill="none" stroke="#0c7c66" stroke-width="2" stroke-dasharray="5 3"/>
      <rect x="295" y="130" width="110" height="72" rx="6" fill="${brandColor}" fill-opacity="0.09" stroke="${brandColor}" stroke-dasharray="4 2"/>
    `;
  }

  const pinCoords = [
    [135, 224],
    [295, 160],
    [455, 132],
    [585, 218],
  ];

  const pins = items
    .map((it, idx) => {
      const [px, py] = pinCoords[idx % pinCoords.length];
      const col = it.tone === 'bad' ? '#dc2626' : it.tone === 'warn' ? '#d97706' : brandColor;
      return `<g>
        <circle cx="${px}" cy="${py}" r="14" fill="${col}" fill-opacity="0.16"/>
        <circle cx="${px}" cy="${py}" r="6.5" fill="${col}" stroke="#ffffff" stroke-width="2"/>
        <rect x="${px - 54}" y="${py - 32}" width="108" height="20" rx="3" fill="${variant === 'pit' ? '#14171d' : '#ffffff'}" stroke="${col}" stroke-width="1.2"/>
        <text x="${px}" y="${py - 19}" text-anchor="middle" font-size="9" font-family="Cascadia Mono, monospace" font-weight="600" fill="${txtCol}">${esc(it.code)} · ${esc(it.status.slice(0, 10))}</text>
      </g>`;
    })
    .join('');

  return `<svg viewBox="0 0 700 345" width="100%" height="345" style="display:block;background:${bg};border-radius:6px;border:1px solid ${stroke}">
    <defs>
      <pattern id="ggrid" width="35" height="35" patternUnits="userSpaceOnUse">
        <path d="M 35 0 L 0 0 0 35" fill="none" stroke="${stroke}" stroke-opacity="0.35" stroke-width="0.7"/>
      </pattern>
    </defs>
    <rect width="700" height="345" fill="url(#ggrid)"/>
    ${geo}
    ${pins}
  </svg>`;
}

export function scadaSchematicSvg(variant, brandColor, items) {
  const nodes = [
    { x: 34, y: 42, w: 148, h: 86, it: items[0] },
    { x: 222, y: 42, w: 158, h: 86, it: items[1] },
    { x: 420, y: 42, w: 152, h: 86, it: items[2] },
    { x: 612, y: 42, w: 148, h: 86, it: items[3] },
  ];
  const pipeCol = '#38bdf8';
  const nodeCol = (tone) =>
    tone === 'bad' ? '#f87171' : tone === 'warn' ? '#fbbf24' : '#34d399';

  const labelByVariant = {
    smelter: 'PROCESS FLOW: ORE DRYER -> ROTARY KILN -> ELECTRIC FURNACE -> BAGHOUSE CEMS',
    pond: 'AQUACULTURE LOOP: WATER INTAKE -> POND SENSORS (DO/pH) -> KINCIR RELAY -> GENSET',
    solar: 'PV TOPOLOGY: ROOF STRING A/B -> SUNGROW INVERTERS -> ZERO-EXPORT METER -> PLN GRID',
    dcim: 'POWER & COOLING: PLN DUAL BUS -> ROTARY UPS A/B -> HIGH-DENSITY GPU RACKS -> CRAC',
    cold: 'THERMAL CHAIN: BLAST FREEZER -> REEFER PROBES -> DOOR GEOFENCE -> HACCP AUDIT',
    mill: 'PKS FLOW: WEIGHBRIDGE SERIAL -> RAMP GRADING -> STERILIZER -> CPO / BIOGAS',
  };

  const boxes = nodes
    .map((n, idx) => {
      const c = nodeCol(n.it.tone);
      return `<g>
        ${idx < 3 ? `<line x1="${n.x + n.w}" y1="${n.y + 43}" x2="${nodes[idx + 1].x}" y2="${n.y + 43}" stroke="${pipeCol}" stroke-width="2.2"/>
          <polygon points="${nodes[idx + 1].x},${n.y + 43} ${nodes[idx + 1].x - 7},${n.y + 38} ${nodes[idx + 1].x - 7},${n.y + 48}" fill="${pipeCol}"/>` : ''}
        <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="5" fill="#181c24" stroke="${c}" stroke-width="1.6"/>
        <rect x="${n.x}" y="${n.y}" width="${n.w}" height="22" rx="4" fill="#222834"/>
        <circle cx="${n.x + 12}" cy="${n.y + 11}" r="3.5" fill="${c}"/>
        <text x="${n.x + 22}" y="${n.y + 14.5}" font-size="9.5" font-family="Cascadia Mono, monospace" font-weight="600" fill="#cbd5e1">${esc(n.it.code)}</text>
        <text x="${n.x + 12}" y="${n.y + 48}" font-size="16" font-family="Cascadia Mono, monospace" font-weight="700" fill="${c}">${esc(n.it.value)}</text>
        <text x="${n.x + 12}" y="${n.y + 66}" font-size="9.5" font-family="Segoe UI, sans-serif" fill="#94a3b8">${esc(n.it.title.slice(0, 22))}</text>
        <text x="${n.x + 12}" y="${n.y + 79}" font-size="8.5" font-family="Cascadia Mono, monospace" fill="#64748b">${esc(n.it.status)}</text>
      </g>`;
    })
    .join('');

  return `<svg viewBox="0 0 794 184" width="100%" height="184" style="display:block;background:#101319;border:1px solid #262c38;border-radius:6px">
    <text x="18" y="24" font-size="9.5" font-family="Cascadia Mono, monospace" fill="#64748b">${esc(labelByVariant[variant] || labelByVariant.cold)}</text>
    ${boxes}
    <path d="M34,158 L110,148 L190,154 L270,142 L350,146 L430,138 L510,144 L590,136 L670,142 L760,135" fill="none" stroke="${brandColor}" stroke-width="2"/>
    <text x="18" y="174" font-size="9" font-family="Cascadia Mono, monospace" fill="#475569">HISTORIAN TRACE (LAST 60M) · POLL 5000ms · PROTOCOL ACTIVE</text>
  </svg>`;
}

export function cctvSceneSvg(camCode, label, boxText, alertColor) {
  return `<svg viewBox="0 0 340 165" width="100%" height="165" style="display:block;background:#11151c;border:1px solid #28303e;border-radius:5px">
    <path d="M0,122 L340,122 M60,122 L120,42 M280,122 L220,42 M120,42 L220,42" stroke="#222a38" stroke-width="1.2"/>
    <rect x="42" y="54" width="54" height="68" fill="#1a212e" stroke="#2b3547"/>
    <rect x="242" y="50" width="60" height="72" fill="#1a212e" stroke="#2b3547"/>
    <rect x="116" y="44" width="108" height="84" fill="${alertColor}" fill-opacity="0.12" stroke="${alertColor}" stroke-width="2" stroke-dasharray="5 3"/>
    <rect x="116" y="28" width="128" height="16" fill="${alertColor}"/>
    <text x="122" y="39" font-size="9.5" font-family="Cascadia Mono, monospace" font-weight="700" fill="#ffffff">${esc(boxText)}</text>
    <circle cx="14" cy="14" r="3.5" fill="#ef4444"/>
    <text x="24" y="17.5" font-size="9.5" font-family="Cascadia Mono, monospace" fill="#e2e8f0">${esc(camCode)} · ${esc(label)}</text>
    <text x="330" y="156" text-anchor="end" font-size="8.5" font-family="Cascadia Mono, monospace" fill="#64748b">28.4 FPS · ONNX EDGE</text>
  </svg>`;
}

export function waveformSvg(colorA, colorB) {
  let bars = '';
  for (let i = 0; i < 92; i++) {
    const hA = 8 + Math.abs(Math.sin(i * 0.42) * 34 + Math.cos(i * 0.9) * 14);
    const hB = 6 + Math.abs(Math.cos(i * 0.31) * 26 + Math.sin(i * 1.1) * 10);
    const x = 14 + i * 7.2;
    const isFlag = i >= 54 && i <= 64;
    bars += `<rect x="${x.toFixed(1)}" y="${(54 - hA / 2).toFixed(1)}" width="4" height="${hA.toFixed(1)}" rx="1.5" fill="${isFlag ? '#dc2626' : colorA}" fill-opacity="${isFlag ? '0.95' : '0.78'}"/>`;
    bars += `<rect x="${x.toFixed(1)}" y="${(108 - hB / 2).toFixed(1)}" width="4" height="${hB.toFixed(1)}" rx="1.5" fill="${colorB}" fill-opacity="0.65"/>`;
  }
  return `<svg viewBox="0 0 690 142" width="100%" height="142" style="display:block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
    <rect x="400" y="10" width="84" height="122" fill="#fee2e2" fill-opacity="0.55" stroke="#fca5a5" stroke-dasharray="3 2"/>
    <text x="442" y="23" text-anchor="middle" font-size="8.5" font-family="Cascadia Mono, monospace" font-weight="700" fill="#b91c1c">FLAGGED 02:14</text>
    <text x="14" y="19" font-size="9" font-family="Cascadia Mono, monospace" fill="#64748b">CH-1 AGENT (DIARIZED ID)</text>
    <text x="14" y="88" font-size="9" font-family="Cascadia Mono, monospace" fill="#64748b">CH-2 CUSTOMER</text>
    ${bars}
  </svg>`;
}

export function productThumbSvg(idx, color) {
  const shapes = [
    `<rect x="48" y="14" width="44" height="58" rx="4" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="1.6"/><rect x="56" y="26" width="28" height="16" rx="2" fill="${color}"/><line x1="56" y1="52" x2="84" y2="52" stroke="${color}" stroke-width="1.4"/>`,
    `<circle cx="70" cy="43" r="24" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="1.6"/><rect x="54" y="34" width="32" height="18" rx="3" fill="${color}"/>`,
    `<polygon points="70,12 104,32 104,64 70,78 36,64 36,32" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-width="1.6"/><polyline points="36,32 70,48 104,32" fill="none" stroke="${color}" stroke-width="1.4"/><line x1="70" y1="48" x2="70" y2="78" stroke="${color}" stroke-width="1.4"/>`,
    `<rect x="36" y="22" width="68" height="44" rx="5" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-width="1.6"/><circle cx="56" cy="44" r="9" fill="${color}"/><line x1="72" y1="39" x2="94" y2="39" stroke="${color}" stroke-width="2"/><line x1="72" y1="49" x2="88" y2="49" stroke="${color}" stroke-width="1.5"/>`,
  ];
  return `<svg viewBox="0 0 140 88" width="100%" height="88" style="display:block;background:#f8f9fa;border-radius:4px;border:1px solid #e5e7eb">${shapes[idx % shapes.length]}</svg>`;
}

export function dicomViewerSvg() {
  return `<svg viewBox="0 0 420 330" width="100%" height="330" style="display:block;background:#090b0f;border:1px solid #262c38;border-radius:5px">
    <ellipse cx="210" cy="168" rx="118" ry="132" fill="#131822" stroke="#334155" stroke-width="1.6"/>
    <ellipse cx="164" cy="158" rx="44" ry="86" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
    <ellipse cx="256" cy="158" rx="44" ry="86" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
    <rect x="202" y="54" width="16" height="224" rx="6" fill="#2c374b"/>
    <circle cx="246" cy="112" r="22" fill="#ef4444" fill-opacity="0.18" stroke="#f87171" stroke-width="1.8" stroke-dasharray="4 2"/>
    <line x1="268" y1="112" x2="338" y2="86" stroke="#f87171" stroke-width="1.3"/>
    <text x="342" y="88" font-size="9.5" font-family="Cascadia Mono, monospace" fill="#fca5a5">ROI #1 · 18.4mm</text>
    <text x="14" y="22" font-size="9.5" font-family="Cascadia Mono, monospace" fill="#94a3b8">STUDY: CT/CR-2026-441 · W/L: 400/40</text>
    <text x="14" y="316" font-size="9" font-family="Cascadia Mono, monospace" fill="#64748b">RSUD KUPANG -> TELERADIOLOGY JKT · 512x512 LOSSLESS</text>
  </svg>`;
}
