// Core primitives, vector illustrations, and typography wrappers for the 32-layout Foundry.
import { esc } from './svgGraphics.mjs';

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pill(label, tone, dark) {
  const light = {
    ok: 'background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb;',
    warn: 'background:#fef3e0;color:#9a5400;border-color:#f4d39e;',
    bad: 'background:#fdebec;color:#b42318;border-color:#f5beb9;',
    neutral: 'background:#eef0f3;color:#475467;border-color:#d6dbe2;',
  };
  const dk = {
    ok: 'background:#0d2b1d;color:#34d399;border-color:#1a4f36;',
    warn: 'background:#2e210a;color:#fbbf24;border-color:#593f11;',
    bad: 'background:#331316;color:#f87171;border-color:#612026;',
    neutral: 'background:#212733;color:#94a3b8;border-color:#343d4e;',
  };
  const s = (dark ? dk : light)[tone] || (dark ? dk.neutral : light.neutral);
  return `<span class="pill" style="${s}">${esc(label)}</span>`;
}

export function monogram(name, color, size = 30, radius = 7) {
  const initials = name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ID';
  return `<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${color};color:#fff;font-family:'Cascadia Mono',monospace;font-weight:700;font-size:${Math.round(size * 0.38)}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;letter-spacing:-0.03em">${esc(initials)}</div>`;
}

export function qrBlock(seed, size = 76, fg = '#111827') {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
      const on = finder || ((seed * 31 + r * 17 + c * 13 + r * c * 7) % 11) > 4;
      if (on) cells.push(`<rect x="${4 + c * 8}" y="${4 + r * 8}" width="6.5" height="6.5" rx="1" fill="${fg}"/>`);
    }
  }
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" style="background:#fff;border:1px solid #d1d5db;border-radius:6px;display:block">${cells.join('')}</svg>`;
}

export function sparkPath(vals, color, w = 160, h = 42, fill = true) {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const span = max - min || 1;
  const pts = vals.map((v, i) => [
    4 + (i / (vals.length - 1)) * (w - 8),
    h - 5 - ((v - min) / span) * (h - 10),
  ]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `4,${h} ${line} ${(w - 4).toFixed(1)},${h}`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="display:block;overflow:visible">
    ${fill ? `<polygon points="${area}" fill="${color}" fill-opacity="0.14"/>` : ''}
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length - 1][0].toFixed(1)}" cy="${pts[pts.length - 1][1].toFixed(1)}" r="3.2" fill="${color}"/>
  </svg>`;
}

export function donutRing(pct, color, track, size = 78, textColor = '#111') {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" style="display:block">
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${track}" stroke-width="7"/>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 40 40)"/>
    <text x="40" y="44" text-anchor="middle" font-size="14" font-family="'Cascadia Mono',monospace" font-weight="700" fill="${textColor}">${pct}%</text>
  </svg>`;
}

export function pageWrap(body, theme, font, extraCss = '') {
  return `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 1280px; height: 800px; overflow: hidden;
    background: ${theme.bg}; color: ${theme.text};
    font-family: ${font.body}; font-size: 12.5px; line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  .hd { font-family: ${font.heading}; }
  .mono { font-family: ${font.mono}; font-variant-numeric: tabular-nums; }
  .muted { color: ${theme.muted}; font-size: 11px; }
  .pill { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 4px; border: 1px solid transparent; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
  .card { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 8px; overflow: hidden; }
  .btn-p { padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #fff; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
  .btn-s { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; background: ${theme.surface}; color: ${theme.text}; border: 1px solid ${theme.borderStrong}; white-space: nowrap; }
  .clamp1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  ${extraCss}
</style>
</head>
<body>${body}</body>
</html>`;
}
