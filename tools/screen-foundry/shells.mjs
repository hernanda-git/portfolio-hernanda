// 10 genuinely distinct application shell architectures (not one repeated 222px sidebar!).
import { brandLogoSvg, esc, qrisSvg, sparklineSvg } from './svgGraphics.mjs';
import { FONTS, THEMES } from './themes.mjs';
import { renderHeroWidget } from './widgets.mjs';

function pill(status, tone, dark) {
  const light = {
    ok: 'background:#e8f6ee;color:#0f6f3c;border-color:#bde5ce;',
    warn: 'background:#fef3e2;color:#9a5500;border-color:#f5d5a3;',
    bad: 'background:#fdebec;color:#b42318;border-color:#f6c0bc;',
    neutral: 'background:#f1f2f4;color:#475467;border-color:#dce0e5;',
  };
  const dk = {
    ok: 'background:#0f2a1d;color:#34d399;border-color:#1c4d35;',
    warn: 'background:#2f220c;color:#fbbf24;border-color:#573e13;',
    bad: 'background:#331416;color:#f87171;border-color:#5e2226;',
    neutral: 'background:#222732;color:#94a3b8;border-color:#333a48;',
  };
  const st = (dark ? dk : light)[tone] || (dark ? dk.neutral : light.neutral);
  return `<span class="pill" style="${st}">${esc(status)}</span>`;
}

function pageWrap(body, theme, font, extraCss = '') {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin:0; padding:0; width:1280px; height:800px; overflow:hidden;
    background:${theme.bg}; color:${theme.text};
    font-family:${font.body}; font-size:12.5px; line-height:1.4;
    -webkit-font-smoothing:antialiased;
  }
  .hd { font-family:${font.heading}; }
  .mono { font-family:${font.mono}; overflow-wrap:anywhere; }
  .muted { color:${theme.muted}; font-size:11px; }
  .pill { display:inline-flex; align-items:center; padding:2px 7px; border-radius:4px; border:1px solid transparent; font-size:10.5px; font-weight:600; white-space:nowrap; }
  .card { background:${theme.surface}; border:1px solid ${theme.border}; border-radius:8px; overflow:hidden; }
  .card-hd { padding:10px 14px; border-bottom:1px solid ${theme.border}; display:flex; justify-content:space-between; align-items:center; font-weight:700; font-size:12.5px; }
  .btn-p { padding:7px 14px; border-radius:6px; font-size:12px; font-weight:600; color:#fff; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
  .btn-s { padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500; background:${theme.surface}; color:${theme.text}; border:1px solid ${theme.borderStrong}; white-space:nowrap; }
  table.dt { width:100%; border-collapse:collapse; font-size:12px; }
  table.dt th { text-align:left; padding:8px 12px; font-size:10px; font-weight:700; color:${theme.muted}; background:${theme.surface2}; border-bottom:1px solid ${theme.border}; }
  table.dt td { padding:9px 12px; border-bottom:1px solid ${theme.border}; vertical-align:middle; }
  ${extraCss}
</style>
</head>
<body>${body}</body>
</html>`;
}

function itemsTable(project, theme) {
  return `<table class="dt">
    <thead><tr><th>Kode</th><th>Aktivitas / Catatan</th><th>Metrik</th><th>Info</th><th>Status</th></tr></thead>
    <tbody>
      ${project.preview.items.map((it) => `<tr>
        <td class="mono" style="font-weight:700;color:${project.brandColor};white-space:nowrap">${esc(it.code)}</td>
        <td><div style="font-weight:600">${esc(it.title)}</div><div class="muted">${esc(it.subtitle)}</div></td>
        <td class="mono" style="font-weight:700;white-space:nowrap">${esc(it.value)}</td>
        <td class="mono muted" style="white-space:nowrap">${esc(it.meta || '-')}</td>
        <td>${pill(it.status, it.tone, theme.dark)}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

export function renderTasteScreen(project, taste) {
  const theme = THEMES[taste.theme] || THEMES['studio-daylight'];
  const font = FONTS[taste.font] || FONTS['swiss-geometric'];
  const seed = parseInt(project.id.replace(/\D/g, ''), 10) || 1;
  const heroWidget = renderHeroWidget(taste.widget, project, theme, seed);
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const c = project.brandColor;
  const nav = taste.nav || ['Overview', 'Operations', 'Analytics', 'Compliance'];

  // -------------------------------------------------------------------------
  // SHELL 1: TOP-NAV EDITORIAL (No sidebar! Clean horizontal nav like Stripe Docs / Wise / Mercury)
  // -------------------------------------------------------------------------
  if (taste.shell === 'top-nav-editorial') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column">
      <header style="height:58px;background:${theme.surface};border-bottom:2px solid ${theme.borderStrong};padding:0 34px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${brandLogoSvg(project.name, c)}
          <strong class="hd" style="font-size:16px">${esc(project.name)}</strong>
          <span style="height:18px;width:1px;background:${theme.border}"></span>
          <div style="display:flex;gap:18px;font-size:12.5px">
            ${nav.map((n, i) => `<span style="font-weight:${i === 0 ? 700 : 500};color:${i === 0 ? c : theme.muted}">${esc(n)}</span>`).join('')}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="mono muted">${esc(taste.persona)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <main style="flex:1;padding:22px 34px;display:flex;flex-direction:column;gap:16px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid ${theme.border};padding-bottom:14px">
          <div>
            <div class="mono" style="font-size:10.5px;color:${c};font-weight:700">${esc(project.preview.envTag)} · ${esc(project.standards.join(' · '))}</div>
            <h1 class="hd" style="margin:4px 0 0;font-size:24px;letter-spacing:-0.02em">${esc(project.preview.surfaceTitle)}</h1>
          </div>
          <div style="display:flex;gap:22px">
            <div><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-size:19px;font-weight:700;color:${c}">${esc(m0.value)}</div></div>
            <div><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-size:19px;font-weight:700">${esc(m1.value)}</div></div>
            <div><div class="muted">${esc(m2.label)}</div><div class="mono" style="font-size:19px;font-weight:700;color:${theme.accent2}">${esc(m2.value)}</div></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:18px;flex:1;min-height:0">
          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div class="card" style="padding:12px">${heroWidget}</div>
            <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
          </div>

          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong class="hd" style="font-size:14px">Verifikasi &amp; Konteks Indonesia</strong>
              <span class="mono muted">${esc(project.id)}</span>
            </div>
            <div style="font-size:12.5px;color:${theme.muted};line-height:1.55">${esc(project.indonesiaContext)}</div>
            <div style="padding:12px;background:#0e121a;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">${esc(project.preview.snippet)}</div>
            <div style="display:flex;flex-direction:column;gap:7px;margin-top:4px">
              ${project.features.map((f, i) => `<div style="padding:8px 10px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:5px;font-size:11.5px"><strong class="mono" style="color:${c}">0${i + 1}</strong> · ${esc(f)}</div>`).join('')}
            </div>
            <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid ${theme.border}">
              <span class="mono muted">${esc(project.architecture.core)}</span>
              ${qrisSvg(seed, 44)}
            </div>
          </div>
        </div>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 2: SLIM 58px ICON RAIL (Like Figma / Slack / Linear / Datadog)
  // -------------------------------------------------------------------------
  if (taste.shell === 'icon-rail-narrow') {
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:58px 1fr">
      <aside style="background:${c};display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:14px">
        <div style="width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.2);color:#fff;font-family:Cascadia Mono,monospace;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center">${esc(project.name.slice(0, 2).toUpperCase())}</div>
        ${nav.slice(0, 5).map((n, i) => `<div style="width:36px;height:36px;border-radius:7px;background:${i === 0 ? '#ffffff' : 'rgba(255,255,255,0.12)'};color:${i === 0 ? c : '#ffffff'};font-family:Cascadia Mono,monospace;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${esc(n.slice(0, 2).toUpperCase())}</div>`).join('')}
        <div style="margin-top:auto;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,0.28);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${esc(taste.persona.slice(0, 2).toUpperCase())}</div>
      </aside>

      <div style="display:flex;flex-direction:column;overflow:hidden">
        <header style="height:52px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 22px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:12px">
            <strong class="hd" style="font-size:15.5px">${esc(project.preview.surfaceTitle)}</strong>
            <span class="pill" style="background:${theme.surface2};color:${theme.muted};border-color:${theme.border}">${esc(project.preview.envTag)}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
            <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
          </div>
        </header>

        <div style="flex:1;padding:18px 22px;display:grid;grid-template-columns:1.55fr 1fr;gap:16px;overflow:hidden">
          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
              ${[m0, m1, m2].map((m, idx) => `<div class="card" style="padding:12px 14px;border-top:3px solid ${idx === 0 ? c : idx === 1 ? '#16a34a' : theme.accent2}">
                <div class="muted">${esc(m.label)}</div>
                <div class="mono" style="font-size:19px;font-weight:700;margin-top:3px">${esc(m.value)}</div>
              </div>`).join('')}
            </div>
            <div class="card" style="padding:12px">${heroWidget}</div>
            <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Inspector · ${esc(taste.persona)}</span><span class="mono muted">${esc(project.id)}</span></div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:10px;flex:1">
              ${items.map((it) => `<div style="padding:10px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:6px">
                <div style="display:flex;justify-content:space-between;align-items:center"><span class="mono" style="font-size:10.5px;color:${c};font-weight:700">${esc(it.code)}</span>${pill(it.status, it.tone, theme.dark)}</div>
                <div style="font-weight:700;font-size:12px;margin-top:3px">${esc(it.title)}</div>
                <div class="muted">${esc(it.subtitle)}</div>
              </div>`).join('')}
              <div style="margin-top:auto;padding:10px 12px;background:#0b0e14;color:#cbd5e1;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10px">${esc(project.preview.snippet)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 3: BRAND-SATURATED SIDEBAR (Like Shopify / Xero / Freshworks / Emerald Sharia)
  // -------------------------------------------------------------------------
  if (taste.shell === 'split-sidebar-brand') {
    const sbBg = theme.sidebarIsBrand ? theme.sidebarBg : c;
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:236px 1fr">
      <aside style="background:${sbBg};color:#ffffff;padding:18px 16px;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.16)">
          <div style="width:30px;height:30px;border-radius:6px;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-family:Cascadia Mono,monospace;font-weight:700">${esc(project.name.slice(0, 2).toUpperCase())}</div>
          <div>
            <div class="hd" style="font-size:15px;font-weight:700">${esc(project.name)}</div>
            <div class="mono" style="font-size:10px;opacity:0.75">${esc(project.standards[0])}</div>
          </div>
        </div>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:4px;flex:1">
          ${nav.map((n, i) => `<div style="padding:9px 12px;border-radius:6px;font-size:12.5px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? 'rgba(255,255,255,0.18)' : 'transparent'}">${esc(n)}</div>`).join('')}
        </div>
        <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.16);font-size:11px">
          <div style="font-weight:700">${esc(taste.persona)}</div>
          <div class="mono" style="font-size:10px;opacity:0.75">${esc(project.id)} · WIB</div>
        </div>
      </aside>

      <div style="display:flex;flex-direction:column;overflow:hidden">
        <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.preview.surfaceTitle)}</strong>
            <span class="mono muted" style="margin-left:10px">${esc(project.preview.envTag)}</span>
          </div>
          <div style="display:flex;gap:8px">
            <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
            <span class="btn-p" style="background:${sbBg}">${esc(project.preview.primaryAction)}</span>
          </div>
        </header>

        <div style="flex:1;padding:18px 24px;display:flex;flex-direction:column;gap:14px;overflow:hidden">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
            ${[m0, m1, m2].map((m, i) => `<div class="card" style="padding:13px 16px;display:flex;justify-content:space-between;align-items:center">
              <div><div class="muted">${esc(m.label)}</div><div class="mono" style="font-size:20px;font-weight:700;color:${i === 0 ? c : theme.text};margin-top:2px">${esc(m.value)}</div></div>
              ${sparklineSvg([30 + i * 7, 38, 36, 48, 52, 61], i === 0 ? c : theme.accent2, 74, 28)}
            </div>`).join('')}
          </div>
          <div class="card" style="padding:12px">${heroWidget}</div>
          <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 4: FLOATING CENTERED CARDS (Like Wise / Brex / Ramp / Monzo Web)
  // -------------------------------------------------------------------------
  if (taste.shell === 'floating-topbar-cards') {
    const body = `<div style="width:1280px;height:800px;padding:18px 42px;display:flex;flex-direction:column;gap:16px">
      <header class="card" style="padding:12px 20px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${brandLogoSvg(project.name, c)}
          <div>
            <strong class="hd" style="font-size:15px">${esc(project.name)}</strong>
            <div class="mono muted">${esc(taste.persona)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          ${nav.map((n, i) => `<span style="padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;background:${i === 0 ? c : 'transparent'};color:${i === 0 ? '#fff' : theme.muted}">${esc(n)}</span>`).join('')}
        </div>
        <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
      </header>

      <div style="display:grid;grid-template-columns:1.15fr 1.45fr;gap:16px;flex:1;min-height:0">
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card" style="padding:18px;background:${c};color:#ffffff">
            <div class="mono" style="font-size:10px;opacity:0.85">${esc(project.preview.envTag)}</div>
            <div class="hd" style="font-size:21px;font-weight:700;margin-top:4px">${esc(project.preview.surfaceTitle)}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2)">
              <div><div style="font-size:10.5px;opacity:0.8">${esc(m0.label)}</div><div class="mono" style="font-size:20px;font-weight:700">${esc(m0.value)}</div></div>
              <div><div style="font-size:10.5px;opacity:0.8">${esc(m1.label)}</div><div class="mono" style="font-size:20px;font-weight:700">${esc(m1.value)}</div></div>
            </div>
          </div>
          <div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:8px">
            <div style="font-weight:700;font-size:12.5px">Aktivitas Live &amp; Transaksi</div>
            ${items.map((it) => `<div style="padding:9px 10px;border:1px solid ${theme.border};border-radius:6px;display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div><div style="font-weight:600;font-size:12px">${esc(it.title)}</div><div class="muted">${esc(it.subtitle)}</div></div>
              <div style="text-align:right;flex-shrink:0"><div class="mono" style="font-weight:700;font-size:11.5px">${esc(it.value)}</div>${pill(it.status, it.tone, theme.dark)}</div>
            </div>`).join('')}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card" style="padding:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <strong class="hd" style="font-size:13.5px">Visualisasi &amp; Intelijen Operasional</strong>
              <span class="mono muted">${esc(m2.label)}: ${esc(m2.value)}</span>
            </div>
            ${heroWidget}
          </div>
          <div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:10px">
            <div style="font-weight:700;font-size:12.5px">Log Sistem &amp; Bukti Kepatuhan</div>
            <div style="padding:12px;background:#0e121a;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">${esc(project.preview.snippet)}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto">
              ${project.features.slice(0, 2).map((f) => `<div style="padding:9px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:5px;font-size:11px">${esc(f)}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 5: DARK EDGE-TO-EDGE COMMAND HUD (Like Grafana / Bloomberg / SpaceX / NOC)
  // -------------------------------------------------------------------------
  if (taste.shell === 'dark-command-hud') {
    const dk = theme.dark ? theme : THEMES['bloomberg-obsidian'];
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column">
      <header style="height:46px;background:${dk.surface};border-bottom:1px solid ${dk.borderStrong};padding:0 18px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="width:10px;height:10px;border-radius:50%;background:#22c55e"></span>
          <strong class="mono" style="font-size:13px">${esc(project.name.toUpperCase())} // ${esc(project.preview.surfaceTitle)}</strong>
          <span class="mono" style="font-size:10px;padding:2px 7px;background:${dk.surface2};border:1px solid ${dk.border};border-radius:3px;color:${dk.accent2}">${esc(project.preview.envTag)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="mono muted">${esc(taste.persona)}</span>
          <span class="btn-p" style="background:${c};padding:5px 11px">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid ${dk.border};background:${dk.surface2}">
        ${[
          m0,
          m1,
          m2,
          { label: 'TELEMETRY LINK', value: 'ONLINE 99.98%', tone: 'ok' },
        ].map((m, i) => `<div style="padding:10px 18px;border-right:1px solid ${dk.border}">
          <div class="mono muted" style="font-size:9.5px">${esc(m.label)}</div>
          <div class="mono" style="font-size:18px;font-weight:700;color:${i === 0 ? '#38bdf8' : i === 2 ? dk.accent2 : '#34d399'}">${esc(m.value)}</div>
        </div>`).join('')}
      </div>

      <div style="flex:1;padding:14px 18px;display:grid;grid-template-columns:1.55fr 1fr;gap:14px;overflow:hidden">
        <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
          <div class="card" style="padding:12px">${heroWidget}</div>
          <div class="card" style="flex:1">${itemsTable(project, dk)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card" style="padding:14px">
            <div class="mono" style="font-size:10px;color:${dk.accent2};font-weight:700;margin-bottom:6px">LIVE EVENT STREAM // ${esc(project.id)}</div>
            <pre class="mono" style="margin:0;padding:12px;background:#06080c;border:1px solid ${dk.border};border-radius:5px;color:#34d399;font-size:10.5px;line-height:1.55;white-space:pre-wrap">${esc(project.preview.snippet)}</pre>
          </div>
          <div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:8px">
            <div class="mono" style="font-size:10px;color:${dk.muted};font-weight:700">OPERATIONAL GUARDRAILS</div>
            ${project.features.map((f, i) => `<div style="padding:9px 10px;background:${dk.surface2};border-left:3px solid ${i === 0 ? c : dk.accent2};border-radius:3px;font-size:11.5px">${esc(f)}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, dk, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 6: MACOS FLOATING STUDIO WINDOW (Like Linear Desktop / Postman / TablePlus / Raycast)
  // -------------------------------------------------------------------------
  if (taste.shell === 'mac-window-studio') {
    const body = `<div style="width:1280px;height:800px;padding:24px 32px;background:${theme.bg};display:flex">
      <div style="flex:1;background:${theme.surface};border:1px solid ${theme.borderStrong};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 22px 48px rgba(0,0,0,0.18)">
        <div style="height:40px;background:${theme.surface2};border-bottom:1px solid ${theme.border};padding:0 16px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="width:11px;height:11px;border-radius:50%;background:#ef4444"></span>
            <span style="width:11px;height:11px;border-radius:50%;background:#f59e0b"></span>
            <span style="width:11px;height:11px;border-radius:50%;background:#22c55e"></span>
            <span class="mono" style="margin-left:10px;font-size:11.5px;font-weight:700">${esc(project.name)} — ${esc(project.preview.surfaceTitle)}</span>
          </div>
          <span class="mono muted">${esc(project.preview.envTag)}</span>
        </div>

        <div style="flex:1;display:grid;grid-template-columns:208px 1fr;overflow:hidden">
          <aside style="background:${theme.sidebarBg};border-right:1px solid ${theme.border};padding:14px;display:flex;flex-direction:column">
            <div class="mono muted" style="font-size:9.5px;font-weight:700;margin-bottom:8px">WORKSPACE</div>
            ${nav.map((n, i) => `<div style="padding:7px 9px;border-radius:5px;margin-bottom:3px;font-size:12px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? c : 'transparent'};color:${i === 0 ? '#fff' : theme.sidebarText}">${esc(n)}</div>`).join('')}
            <div style="margin-top:auto;padding-top:10px;border-top:1px solid ${theme.border};font-size:10.5px">
              <div style="font-weight:700">${esc(taste.persona)}</div>
              <div class="mono muted">${esc(project.stack[0])}</div>
            </div>
          </aside>

          <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;overflow:hidden">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;gap:16px">
                <div><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-size:17px;font-weight:700;color:${c}">${esc(m0.value)}</div></div>
                <div><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-size:17px;font-weight:700">${esc(m1.value)}</div></div>
                <div><div class="muted">${esc(m2.label)}</div><div class="mono" style="font-size:17px;font-weight:700;color:${theme.accent2}">${esc(m2.value)}</div></div>
              </div>
              <div style="display:flex;gap:8px">
                <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
                <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
              </div>
            </div>
            <div class="card" style="padding:12px">${heroWidget}</div>
            <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 7: WINDOWS RIBBON ENTERPRISE ERP (Authentic .NET WPF Desktop Suite)
  // -------------------------------------------------------------------------
  if (taste.shell === 'windows-ribbon-erp') {
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column">
      <div style="height:28px;background:${c};color:#fff;padding:0 14px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px">
        <strong>${esc(project.name)} (.NET 8 Desktop ERP) — ${esc(taste.persona)}</strong>
        <span class="mono" style="font-size:10px">${esc(project.preview.envTag)}</span>
      </div>
      <div style="height:36px;background:${theme.surface};border-bottom:1px solid ${theme.borderStrong};padding:0 14px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:14px;font-size:11.5px">
          ${nav.map((n, i) => `<span style="font-weight:${i === 0 ? 700 : 500};color:${i === 0 ? c : theme.muted}">${esc(n)}</span>`).join('')}
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s" style="padding:4px 10px">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c};padding:4px 11px">${esc(project.preview.primaryAction)}</span>
        </div>
      </div>

      <div style="flex:1;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden">
        <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:12px">
          <div class="card" style="padding:10px">${heroWidget}</div>
          <div class="card" style="padding:12px;display:flex;flex-direction:column;justify-content:space-between">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              ${[m0, m1, m2].map((m) => `<div style="padding:8px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:4px"><div class="muted">${esc(m.label)}</div><div class="mono" style="font-weight:700;font-size:14px;color:${c}">${esc(m.value)}</div></div>`).join('')}
            </div>
            <div style="padding:10px;background:#0f131b;color:#e2e8f0;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10px;line-height:1.5">${esc(project.preview.snippet)}</div>
          </div>
        </div>
        <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
      </div>

      <footer style="height:24px;background:${theme.surface2};border-top:1px solid ${theme.borderStrong};padding:0 14px;display:flex;justify-content:space-between;align-items:center;font-family:Cascadia Mono,monospace;font-size:10px;color:${theme.muted}">
        <span>SQL SERVER CONNECTED · ${esc(project.stack.join(' · '))}</span>
        <span>${esc(project.standards.join(' | '))}</span>
      </footer>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 8: BENTO EXECUTIVE STUDIO (Asymmetric Modular Bento Grid — Vercel/Apple style)
  // -------------------------------------------------------------------------
  if (taste.shell === 'bento-executive') {
    const body = `<div style="width:1280px;height:800px;padding:22px 28px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:12px">
          ${brandLogoSvg(project.name, c)}
          <div>
            <div class="hd" style="font-size:19px;font-weight:700;letter-spacing:-0.02em">${esc(project.name)} · ${esc(project.preview.surfaceTitle.split('·')[1] || project.tagline)}</div>
            <div class="mono muted">${esc(project.preview.envTag)} · ${esc(taste.persona)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:300px 1.25fr 1fr;grid-template-rows:1fr 1.15fr;gap:14px;min-height:0">
        <div class="card" style="padding:18px;background:${c};color:#fff;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div class="mono" style="font-size:10px;opacity:0.8">${esc(m0.label.toUpperCase())}</div>
            <div class="mono" style="font-size:32px;font-weight:700;margin-top:6px">${esc(m0.value)}</div>
            <div style="font-size:12px;opacity:0.9;margin-top:8px;line-height:1.45">${esc(project.tagline)}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.2)">
            <div><div style="font-size:10px;opacity:0.8">${esc(m1.label)}</div><div class="mono" style="font-size:15px;font-weight:700">${esc(m1.value)}</div></div>
            <div><div style="font-size:10px;opacity:0.8">${esc(m2.label)}</div><div class="mono" style="font-size:15px;font-weight:700">${esc(m2.value)}</div></div>
          </div>
        </div>

        <div class="card" style="grid-column:span 2;padding:14px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between">
            <strong class="hd" style="font-size:13.5px">Modul Visual Utama</strong>
            <span class="mono muted">${esc(project.standards.join(' · '))}</span>
          </div>
          <div style="flex:1;display:flex;align-items:center">${heroWidget}</div>
        </div>

        <div class="card" style="grid-column:span 2;display:flex;flex-direction:column">
          <div class="card-hd"><span>Daftar Operasional</span><span class="mono muted">${esc(project.id)}</span></div>
          ${itemsTable(project, theme)}
        </div>

        <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
          <strong class="hd" style="font-size:13px">Jejak Verifikasi &amp; Konteks</strong>
          <div style="padding:11px;background:#0d1118;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10px;line-height:1.5">${esc(project.preview.snippet)}</div>
          <div class="muted" style="line-height:1.5">${esc(project.indonesiaContext)}</div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 9: MOBILE ASYMMETRIC EDITORIAL (Editorial left column + 2 rich devices right)
  // -------------------------------------------------------------------------
  if (taste.shell === 'mobile-asymmetric') {
    const body = `<div style="width:1280px;height:800px;padding:30px 40px;display:grid;grid-template-columns:410px 1fr;gap:34px;align-items:stretch">
      <div style="display:flex;flex-direction:column;justify-content:space-between;padding:12px 0">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
            ${brandLogoSvg(project.name, c)}
            <span class="mono" style="font-size:11px;color:${c};font-weight:700">${esc(project.id)} · ${esc(project.platform.toUpperCase())}</span>
          </div>
          <h1 class="hd" style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-0.02em">${esc(project.name)}</h1>
          <p style="font-size:14.5px;color:${theme.muted};margin:10px 0 20px;line-height:1.5">${esc(project.summary)}</p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">
            <div class="card" style="padding:12px"><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-size:18px;font-weight:700;color:${c}">${esc(m0.value)}</div></div>
            <div class="card" style="padding:12px"><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-size:18px;font-weight:700">${esc(m1.value)}</div></div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            ${project.features.slice(0, 3).map((f) => `<div style="padding:9px 11px;background:${theme.surface};border:1px solid ${theme.border};border-left:3px solid ${c};border-radius:5px;font-size:11.5px">${esc(f)}</div>`).join('')}
          </div>
        </div>

        <div style="padding-top:14px;border-top:1px solid ${theme.border};display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:700;font-size:12px">${esc(taste.persona)}</div><div class="mono muted">${esc(project.stack.slice(0, 2).join(' · '))}</div></div>
          <span class="pill" style="background:${theme.surface};border-color:${theme.borderStrong}">${esc(project.standards[0])}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:stretch">
        <div style="background:${theme.surface};border:6px solid ${theme.dark ? '#384152' : '#18181b'};border-radius:30px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,0.16)">
          <div style="height:26px;background:${theme.dark ? '#0f131b' : '#18181b'};color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px"><span>09:41</span><span class="mono">5G · 100%</span></div>
          <div style="padding:18px 16px;background:${c};color:#fff">
            <div class="mono" style="font-size:9.5px;opacity:0.85">${esc(project.preview.envTag)}</div>
            <div class="hd" style="font-size:17px;font-weight:700;margin-top:3px">${esc(project.preview.surfaceTitle.split('·')[1] || project.name)}</div>
            <div class="mono" style="font-size:24px;font-weight:700;margin-top:10px">${esc(m0.value)}</div>
          </div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:9px;flex:1;background:${theme.surface2}">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="padding:9px;background:${c};color:#fff;border-radius:6px;text-align:center;font-weight:700;font-size:11px">${esc(project.preview.primaryAction)}</div>
              <div style="padding:9px;background:${theme.surface};border:1px solid ${theme.borderStrong};border-radius:6px;text-align:center;font-weight:600;font-size:11px">${esc(project.preview.secondaryAction)}</div>
            </div>
            ${items.map((it) => `<div style="padding:9px 10px;background:${theme.surface};border:1px solid ${theme.border};border-radius:7px;display:flex;justify-content:space-between;align-items:center;gap:6px">
              <div style="min-width:0"><div style="font-weight:600;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</div><div class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.subtitle)}</div></div>
              <div style="text-align:right;flex-shrink:0"><div class="mono" style="font-size:11px;font-weight:700">${esc(it.value)}</div>${pill(it.status, it.tone, theme.dark)}</div>
            </div>`).join('')}
          </div>
        </div>

        <div style="background:${theme.surface};border:6px solid ${theme.dark ? '#384152' : '#18181b'};border-radius:30px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,0.16)">
          <div style="height:26px;background:${theme.dark ? '#0f131b' : '#18181b'};color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px"><span>09:41</span><span class="mono">${esc(m2.value)}</span></div>
          <div style="padding:16px;border-bottom:1px solid ${theme.border}">
            <div class="mono" style="font-size:9.5px;color:${c};font-weight:700">${esc(nav[1] || 'DETAIL & VERIFIKASI').toUpperCase()}</div>
            <div class="hd" style="font-size:16px;font-weight:700;margin-top:2px">${esc(project.preview.primaryAction)}</div>
          </div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1;background:${theme.surface2}">
            <div style="padding:10px;background:${theme.surface};border:1px solid ${theme.border};border-radius:8px;text-align:center">
              ${qrisSvg(seed, 108)}
              <div style="font-weight:700;font-size:12px;margin-top:6px">${esc(items[0].title)}</div>
              <div class="muted">${esc(items[0].subtitle)}</div>
            </div>
            <div style="padding:10px;background:${theme.surface};border:1px solid ${theme.border};border-radius:8px">
              <div class="muted" style="margin-bottom:4px">Tren 7 Hari · ${esc(m1.label)}</div>
              ${sparklineSvg([24, 38, 34, 51, 58, 66, 79], c, 260, 44)}
            </div>
            <div style="margin-top:auto;padding:10px;background:#0d1118;color:#cbd5e1;border-radius:7px;font-family:Cascadia Mono,monospace;font-size:9.5px;line-height:1.45">${esc(project.preview.snippet.slice(0, 128))}</div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // -------------------------------------------------------------------------
  // SHELL 10 (DEFAULT): SWISS SPLIT WORKBENCH (Crisp light/dark split with bold header rule)
  // -------------------------------------------------------------------------
  const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:220px 1fr">
    <aside style="background:${theme.sidebarBg};border-right:1px solid ${theme.border};padding:16px 14px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid ${theme.border}">
        ${brandLogoSvg(project.name, c)}
        <div><div class="hd" style="font-size:14px;font-weight:700">${esc(project.name)}</div><div class="mono muted" style="font-size:9.5px">${esc(project.standards[0])}</div></div>
      </div>
      <nav style="margin-top:14px;display:flex;flex-direction:column;gap:3px;flex:1">
        ${nav.map((n, i) => `<div style="padding:8px 10px;border-radius:5px;font-size:12px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? theme.surface : 'transparent'};border-left:${i === 0 ? `3px solid ${c}` : '3px solid transparent'};color:${i === 0 ? theme.text : theme.muted}">${esc(n)}</div>`).join('')}
      </nav>
      <div style="padding-top:10px;border-top:1px solid ${theme.border};font-size:11px">
        <div style="font-weight:700">${esc(taste.persona)}</div>
        <div class="mono muted">${esc(project.id)}</div>
      </div>
    </aside>

    <div style="display:flex;flex-direction:column;overflow:hidden">
      <header style="height:54px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 22px;display:flex;align-items:center;justify-content:space-between">
        <div><strong class="hd" style="font-size:15.5px">${esc(project.preview.surfaceTitle)}</strong> <span class="mono muted" style="margin-left:8px">${esc(project.preview.envTag)}</span></div>
        <div style="display:flex;gap:8px"><span class="btn-s">${esc(project.preview.secondaryAction)}</span><span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span></div>
      </header>
      <div style="flex:1;padding:18px 22px;display:flex;flex-direction:column;gap:14px;overflow:hidden">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${[m0, m1, m2].map((m, i) => `<div class="card" style="padding:12px 14px"><div class="muted">${esc(m.label)}</div><div class="mono" style="font-size:19px;font-weight:700;color:${i === 0 ? c : theme.text};margin-top:2px">${esc(m.value)}</div></div>`).join('')}
        </div>
        <div class="card" style="padding:12px">${heroWidget}</div>
        <div class="card" style="flex:1">${itemsTable(project, theme)}</div>
      </div>
    </div>
  </div>`;
  return pageWrap(body, theme, font);
}
