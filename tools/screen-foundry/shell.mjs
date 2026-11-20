import { brandLogoSvg, esc } from './svgGraphics.mjs';

export function statusPill(status, tone) {
  const map = {
    ok: 'background:#e8f6ee;color:#0f6f3c;border-color:#bde5ce;',
    warn: 'background:#fef3e2;color:#9a5500;border-color:#f5d5a3;',
    bad: 'background:#fdebec;color:#b42318;border-color:#f6c0bc;',
    neutral: 'background:#f1f2f4;color:#475467;border-color:#dce0e5;',
  };
  const darkMap = {
    ok: 'background:#102a1d;color:#34d399;border-color:#1c4d35;',
    warn: 'background:#2f220c;color:#fbbf24;border-color:#573e13;',
    bad: 'background:#331416;color:#f87171;border-color:#5e2226;',
    neutral: 'background:#222732;color:#94a3b8;border-color:#333a48;',
  };
  return {
    light: `<span class="pill" style="${map[tone] || map.neutral}">${esc(status)}</span>`,
    dark: `<span class="pill" style="${darkMap[tone] || darkMap.neutral}">${esc(status)}</span>`,
  };
}

export function wrapHtml(bodyHtml, extraCss = '', dark = false) {
  const bg = dark ? '#0d1016' : '#f5f6f8';
  const fg = dark ? '#e8ecf3' : '#14171f';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    width: 1280px; height: 800px; overflow: hidden;
    background: ${bg}; color: ${fg};
    font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 12.5px; line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  .mono { font-family: "Cascadia Mono", "Consolas", monospace; overflow-wrap: anywhere; }
  pre, code { overflow-wrap: anywhere; word-break: break-word; }
  .serif { font-family: Georgia, "Times New Roman", serif; }
  .app-shell { display: grid; grid-template-columns: 222px 1fr; width: 1280px; height: 800px; }
  .sidebar {
    background: ${dark ? '#131720' : '#ffffff'};
    border-right: 1px solid ${dark ? '#232938' : '#e4e7ec'};
    display: flex; flex-direction: column; padding: 16px 14px;
  }
  .sb-brand { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid ${dark ? '#232938' : '#eaecf0'}; }
  .sb-name { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
  .sb-sub { font-size: 10.5px; color: ${dark ? '#7c869a' : '#667085'}; font-family: "Cascadia Mono", monospace; }
  .sb-nav { margin-top: 14px; display: flex; flex-direction: column; gap: 3px; flex: 1; }
  .sb-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 10px; border-radius: 5px; font-size: 12.5px; font-weight: 500;
    color: ${dark ? '#9aa4b6' : '#475467'};
  }
  .sb-item.active {
    background: ${dark ? '#1c2436' : '#eff4ff'};
    color: ${dark ? '#ffffff' : '#14171f'};
    font-weight: 600;
  }
  .sb-foot {
    padding-top: 12px; border-top: 1px solid ${dark ? '#232938' : '#eaecf0'};
    display: flex; align-items: center; gap: 8px;
  }
  .avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: "Cascadia Mono", monospace; font-size: 10.5px; font-weight: 700;
    color: #fff; flex-shrink: 0;
  }
  .main { display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    height: 54px; padding: 0 22px; flex-shrink: 0;
    background: ${dark ? '#131720' : '#ffffff'};
    border-bottom: 1px solid ${dark ? '#232938' : '#e4e7ec'};
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .tb-title { font-size: 15px; font-weight: 700; }
  .tb-env {
    font-family: "Cascadia Mono", monospace; font-size: 10.5px;
    padding: 3px 8px; border-radius: 4px;
    background: ${dark ? '#1d2330' : '#f2f4f7'};
    color: ${dark ? '#98a2b3' : '#475467'};
    border: 1px solid ${dark ? '#2c3445' : '#e4e7ec'};
  }
  .btn-primary {
    padding: 7px 13px; border-radius: 5px; font-size: 12px; font-weight: 600;
    color: #ffffff; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-ghost {
    padding: 6px 11px; border-radius: 5px; font-size: 12px; font-weight: 500;
    background: ${dark ? '#1b202c' : '#ffffff'};
    color: ${dark ? '#d0d5dd' : '#344054'};
    border: 1px solid ${dark ? '#2e3647' : '#d0d5dd'};
  }
  .content { flex: 1; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
  .card {
    background: ${dark ? '#141923' : '#ffffff'};
    border: 1px solid ${dark ? '#242b3a' : '#e4e7ec'};
    border-radius: 7px; overflow: hidden;
  }
  .card-hd {
    padding: 10px 14px;
    border-bottom: 1px solid ${dark ? '#242b3a' : '#eaecf0'};
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12.5px; font-weight: 600;
  }
  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi-card {
    background: ${dark ? '#141923' : '#ffffff'};
    border: 1px solid ${dark ? '#242b3a' : '#e4e7ec'};
    border-radius: 7px; padding: 12px 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .kpi-lbl { font-size: 11px; color: ${dark ? '#8b95a7' : '#667085'}; }
  .kpi-val { font-family: "Cascadia Mono", monospace; font-size: 19px; font-weight: 700; margin-top: 3px; }
  .pill {
    display: inline-flex; align-items: center; padding: 2px 7px;
    border-radius: 4px; border: 1px solid transparent;
    font-size: 10.5px; font-weight: 600; white-space: nowrap;
  }
  table.dt { width: 100%; border-collapse: collapse; font-size: 12px; }
  table.dt th {
    text-align: left; padding: 8px 12px; font-size: 10.5px; font-weight: 600;
    color: ${dark ? '#8b95a7' : '#667085'};
    background: ${dark ? '#10141d' : '#f9fafb'};
    border-bottom: 1px solid ${dark ? '#242b3a' : '#eaecf0'};
  }
  table.dt td {
    padding: 9px 12px; border-bottom: 1px solid ${dark ? '#1e2433' : '#f2f4f7'};
    vertical-align: middle;
  }
  .sub-txt { font-size: 11px; color: ${dark ? '#7e889b' : '#667085'}; }
  ${extraCss}
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function sidebarHtml(project, navItems, dark = false) {
  return `<aside class="sidebar">
    <div class="sb-brand">
      ${brandLogoSvg(project.name, project.brandColor)}
      <div>
        <div class="sb-name">${esc(project.name)}</div>
        <div class="sb-sub">${esc(project.standards[0] || project.platform)}</div>
      </div>
    </div>
    <nav class="sb-nav">
      ${navItems
        .map(
          (item, idx) => `<div class="sb-item ${idx === 0 ? 'active' : ''}" ${idx === 0 ? `style="border-left:3px solid ${project.brandColor};padding-left:8px"` : ''}>
            <span>${esc(item)}</span>
            ${idx === 0 ? `<span class="mono" style="font-size:10px;color:${project.brandColor}">LIVE</span>` : ''}
          </div>`
        )
        .join('')}
    </nav>
    <div class="sb-foot">
      <span class="avatar" style="background:${project.brandColor}">OP</span>
      <div>
        <div style="font-size:11.5px;font-weight:600">Jakarta Workspace</div>
        <div class="sub-txt">${esc(project.id)} · WIB (UTC+7)</div>
      </div>
    </div>
  </aside>`;
}

export function topbarHtml(project, dark = false) {
  return `<header class="topbar">
    <div style="display:flex;align-items:center;gap:12px">
      <span class="tb-title">${esc(project.preview.surfaceTitle)}</span>
      <span class="tb-env">${esc(project.preview.envTag)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="btn-ghost">${esc(project.preview.secondaryAction)}</span>
      <span class="btn-primary" style="background:${project.brandColor}">${esc(project.preview.primaryAction)}</span>
    </div>
  </header>`;
}

export function seedNum(id) {
  return parseInt(id.replace(/\D/g, ''), 10) || 1;
}
