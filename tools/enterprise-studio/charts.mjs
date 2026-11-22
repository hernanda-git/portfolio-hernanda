// Enterprise SVG Data Visualization Library (Zero-Dependency, Vector-Crisp @ 2x DPR)
// Every chart includes explicit axes, gridlines, tabular labels, legends, and optional SLA thresholds.

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function svgMultiLineChart({
  width = 740,
  height = 235,
  xLabels = [],
  series = [],
  yMin = 0,
  yMax = 1000,
  yTicks = 5,
  yUnit = '',
  yFormat = null,
  threshold = null, // { value, label, color }
  annotations = [], // [{ index, seriesIdx, label, color, dy }]
  dark = false,
}) {
  const padL = 52;
  const padR = 16;
  const padT = 26;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const count = Math.max(2, xLabels.length);

  const gridStroke = dark ? '#263042' : '#e2e8f0';
  const axisText = dark ? '#94a3b8' : '#64748b';
  const bg = dark ? '#0b1220' : '#ffffff';

  const xPos = (i) => padL + (i / (count - 1)) * plotW;
  const yPos = (v) => {
    const clamped = Math.max(yMin, Math.min(yMax, v));
    return padT + plotH - ((clamped - yMin) / (yMax - yMin || 1)) * plotH;
  };

  let gridSvg = '';
  for (let i = 0; i <= yTicks; i++) {
    const val = yMin + ((yMax - yMin) / yTicks) * i;
    const y = yPos(val);
    const lbl = yFormat ? yFormat(val) : `${Math.round(val)}${yUnit ? ' ' + yUnit : ''}`;
    gridSvg += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="${gridStroke}" stroke-width="1" ${i > 0 ? 'stroke-dasharray="2,3"' : ''} />`;
    gridSvg += `<text x="${padL - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="${axisText}">${esc(lbl)}</text>`;
  }

  let xSvg = '';
  const step = xLabels.length > 10 ? Math.ceil(xLabels.length / 8) : 1;
  xLabels.forEach((lbl, idx) => {
    if (idx % step !== 0 && idx !== xLabels.length - 1) return;
    const x = xPos(idx);
    xSvg += `<line x1="${x.toFixed(1)}" y1="${padT + plotH}" x2="${x.toFixed(1)}" y2="${padT + plotH + 4}" stroke="${gridStroke}" stroke-width="1" />`;
    xSvg += `<text x="${x.toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="9.5" font-family="ui-monospace,Consolas,monospace" fill="${axisText}">${esc(lbl)}</text>`;
  });

  let threshSvg = '';
  if (threshold) {
    const ty = yPos(threshold.value);
    const tc = threshold.color || '#be123c';
    threshSvg += `<line x1="${padL}" y1="${ty.toFixed(1)}" x2="${width - padR}" y2="${ty.toFixed(1)}" stroke="${tc}" stroke-width="1.2" stroke-dasharray="5,3" />`;
    const badgeW = Math.min(200, Math.max(78, threshold.label.length * 5.8 + 12));
    threshSvg += `<rect x="${width - padR - badgeW}" y="${(ty - 14).toFixed(1)}" width="${badgeW}" height="14" rx="2" fill="${tc}" />`;
    threshSvg += `<text x="${width - padR - badgeW + 6}" y="${(ty - 4).toFixed(1)}" font-size="8.5" font-weight="600" font-family="ui-monospace,Consolas,monospace" fill="#ffffff">${esc(threshold.label)}</text>`;
  }

  let seriesSvg = '';
  series.forEach((s) => {
    const pts = s.values.map((v, idx) => `${xPos(idx).toFixed(1)},${yPos(v).toFixed(1)}`);
    if (s.area) {
      const areaPts = `${padL.toFixed(1)},${(padT + plotH).toFixed(1)} ${pts.join(' ')} ${xPos(s.values.length - 1).toFixed(1)},${(padT + plotH).toFixed(1)}`;
      seriesSvg += `<polygon points="${areaPts}" fill="${s.color}" fill-opacity="${dark ? '0.16' : '0.10'}" />`;
    }
    seriesSvg += `<polyline fill="none" stroke="${s.color}" stroke-width="${s.width || 1.9}" ${s.dashed ? 'stroke-dasharray="4,3"' : ''} points="${pts.join(' ')}" />`;
    if (s.dots) {
      s.values.forEach((v, idx) => {
        seriesSvg += `<circle cx="${xPos(idx).toFixed(1)}" cy="${yPos(v).toFixed(1)}" r="2.3" fill="${bg}" stroke="${s.color}" stroke-width="1.5" />`;
      });
    }
  });

  let annSvg = '';
  annotations.forEach((a) => {
    const s = series[a.seriesIdx ?? 0];
    if (!s || s.values[a.index] == null) return;
    const x = xPos(a.index);
    const y = yPos(s.values[a.index]);
    const c = a.color || '#b45309';
    const boxW = Math.max(115, a.label.length * 5.4 + 14);
    const boxX = Math.max(padL + 4, Math.min(width - padR - boxW - 4, x - boxW / 2));
    const boxY = Math.max(4, y + (a.dy ?? -28));
    annSvg += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(boxY + 15).toFixed(1)}" stroke="${c}" stroke-width="1" stroke-dasharray="2,2" />`;
    annSvg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${c}" stroke="${bg}" stroke-width="1.5" />`;
    annSvg += `<rect x="${boxX.toFixed(1)}" y="${boxY.toFixed(1)}" width="${boxW.toFixed(1)}" height="16" rx="2" fill="${dark ? '#1e293b' : '#fffbeb'}" stroke="${c}" stroke-width="1" />`;
    annSvg += `<text x="${(boxX + 6).toFixed(1)}" y="${(boxY + 11).toFixed(1)}" font-size="8.8" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="${dark ? '#fde68a' : '#92400e'}">${esc(a.label)}</text>`;
  });

  // Top-left legend strip
  let legendSvg = '';
  let lx = padL;
  series.forEach((s) => {
    legendSvg += `<rect x="${lx}" y="6" width="10" height="3" rx="1" fill="${s.color}" />`;
    legendSvg += `<text x="${lx + 14}" y="11" font-size="9.5" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="${dark ? '#cbd5e1' : '#334155'}">${esc(s.label)}</text>`;
    lx += s.label.length * 5.8 + 28;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;overflow:visible;">
    ${gridSvg}
    ${xSvg}
    ${threshSvg}
    ${seriesSvg}
    ${annSvg}
    ${legendSvg}
  </svg>`;
}

export function svgSparkline({ points = [], width = 76, height = 22, color = '#0f52ba', fill = true }) {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = fill
    ? `<polygon points="0,${height} ${pts.join(' ')} ${width},${height}" fill="${color}" fill-opacity="0.12" />`
    : '';
  const last = pts[pts.length - 1].split(',');
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block;flex-shrink:0;">
    ${area}
    <polyline fill="none" stroke="${color}" stroke-width="1.5" points="${pts.join(' ')}" />
    <circle cx="${last[0]}" cy="${last[1]}" r="2" fill="${color}" />
  </svg>`;
}

export function svgStackedBarChart({
  width = 500,
  height = 190,
  categories = [],
  series = [],
  yMax = null,
  yFormat = (v) => String(v),
  dark = false,
}) {
  const padL = 48;
  const padR = 12;
  const padT = 24;
  const padB = 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const totals = categories.map((_, ci) => series.reduce((a, s) => a + (s.values[ci] || 0), 0));
  const maxV = yMax ?? Math.max(...totals, 1) * 1.15;
  const gridStroke = dark ? '#263042' : '#e2e8f0';
  const axisText = dark ? '#94a3b8' : '#64748b';

  let out = '';
  for (let i = 0; i <= 4; i++) {
    const v = (maxV / 4) * i;
    const y = padT + plotH - (v / maxV) * plotH;
    out += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="${gridStroke}" stroke-width="1" ${i > 0 ? 'stroke-dasharray="2,3"' : ''} />`;
    out += `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="${axisText}">${esc(yFormat(v))}</text>`;
  }

  const slotW = plotW / Math.max(1, categories.length);
  const barW = Math.min(34, slotW * 0.56);

  categories.forEach((cat, ci) => {
    const cx = padL + slotW * ci + (slotW - barW) / 2;
    let acc = 0;
    series.forEach((s) => {
      const val = s.values[ci] || 0;
      const h = (val / maxV) * plotH;
      const y = padT + plotH - ((acc + val) / maxV) * plotH;
      out += `<rect x="${cx.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0.5, h).toFixed(1)}" fill="${s.color}" />`;
      acc += val;
    });
    out += `<text x="${(cx + barW / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="9" font-family="ui-monospace,Consolas,monospace" fill="${axisText}">${esc(cat)}</text>`;
  });

  let lx = padL;
  series.forEach((s) => {
    out += `<rect x="${lx}" y="6" width="8" height="8" rx="1" fill="${s.color}" />`;
    out += `<text x="${lx + 11}" y="13.5" font-size="9" font-weight="600" font-family="system-ui,Segoe UI,sans-serif" fill="${dark ? '#cbd5e1' : '#334155'}">${esc(s.label)}</text>`;
    lx += s.label.length * 5.6 + 22;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;">${out}</svg>`;
}

export function svgSpanWaterfall({ spans = [], totalMs = 500, width = 440, dark = false }) {
  const rowH = 24;
  const labelW = 136;
  const durW = 54;
  const barAreaW = width - labelW - durW - 10;
  const h = spans.length * rowH + 22;
  const line = dark ? '#263042' : '#e2e8f0';
  const txt = dark ? '#cbd5e1' : '#1e293b';
  const muted = dark ? '#94a3b8' : '#64748b';

  let out = '';
  // Scale header ticks
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    const x = labelW + f * barAreaW;
    out += `<line x1="${x.toFixed(1)}" y1="14" x2="${x.toFixed(1)}" y2="${h}" stroke="${line}" stroke-width="1" stroke-dasharray="2,2" />`;
    out += `<text x="${x.toFixed(1)}" y="10" text-anchor="${f === 1 ? 'end' : 'middle'}" font-size="8.5" font-family="ui-monospace,Consolas,monospace" fill="${muted}">${Math.round(totalMs * f)}ms</text>`;
  });

  spans.forEach((sp, i) => {
    const y = 18 + i * rowH;
    const x = labelW + (sp.start / totalMs) * barAreaW;
    const bw = Math.max(4, (sp.dur / totalMs) * barAreaW);
    out += `<text x="2" y="${y + 13}" font-size="9.8" font-weight="500" font-family="system-ui,Segoe UI,sans-serif" fill="${txt}">${esc(sp.label)}</text>`;
    out += `<rect x="${x.toFixed(1)}" y="${y + 4}" width="${bw.toFixed(1)}" height="12" rx="2" fill="${sp.color}" />`;
    out += `<text x="${width - 2}" y="${y + 13}" text-anchor="end" font-size="9.5" font-weight="600" font-family="ui-monospace,Consolas,monospace" fill="${txt}">${sp.dur} ms</text>`;
  });

  return `<svg viewBox="0 0 ${width} ${h}" width="100%" height="${h}" style="display:block;">${out}</svg>`;
}

export function renderCapacityBar(pct, { warnAt = 75, critAt = 90, showLabel = true } = {}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = clamped >= critAt ? '#be123c' : clamped >= warnAt ? '#b45309' : '#047857';
  return `<div style="display:flex;align-items:center;gap:6px;min-width:0;">
    <div style="flex:1;height:6px;background:#e2e8f0;border-radius:2px;overflow:hidden;min-width:46px;">
      <div style="width:${clamped}%;height:100%;background:${color};"></div>
    </div>
    ${showLabel ? `<span class="mono" style="font-size:10px;color:#334155;width:32px;text-align:right;flex-shrink:0;">${clamped.toFixed(0)}%</span>` : ''}
  </div>`;
}
