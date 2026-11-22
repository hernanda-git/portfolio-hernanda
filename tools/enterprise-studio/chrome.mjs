// Composable Enterprise & GovTech UI Chrome Primitives (1600x1000 @ 2x DPR)
// Provides clean reusable building blocks without enforcing a rigid layout template.

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function fmtNum(n) {
  return Math.round(n).toLocaleString('id-ID');
}

export function fmtIdr(n) {
  if (n === 0) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function fmtPct(n, digits = 1) {
  return n.toFixed(digits).replace('.', ',') + '%';
}

const ICONS = {
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  gitBranch: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
};

export function ic(name, size = 13, color = 'currentColor') {
  const path = ICONS[name] || ICONS.activity;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${path}</svg>`;
}

export function badge(label, tone = 'neutral') {
  return `<span class="e-badge e-badge-${tone}">${esc(label)}</span>`;
}

export function wrapEnterpriseHtml({
  title,
  accent = '#0f52ba',
  accentSoft = '#e8f0fe',
  accentInk = '#0b3d91',
  bg = '#f3f5f8',
  surface = '#ffffff',
  surface2 = '#f8fafc',
  border = '#d8dee6',
  borderStrong = '#c1cad6',
  text = '#0f172a',
  text2 = '#475569',
  muted = '#64748b',
  fontSans = '"Segoe UI", system-ui, -apple-system, sans-serif',
  fontMono = '"Cascadia Mono", "Consolas", ui-monospace, monospace',
  extraCss = '',
  bodyHtml = '',
}) {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  :root {
    --e-accent: ${accent};
    --e-accent-soft: ${accentSoft};
    --e-accent-ink: ${accentInk};
    --e-bg: ${bg};
    --e-surface: ${surface};
    --e-surface-2: ${surface2};
    --e-border: ${border};
    --e-border-strong: ${borderStrong};
    --e-text: ${text};
    --e-text-2: ${text2};
    --e-muted: ${muted};
    --e-ok: #047857;
    --e-ok-bg: #ecfdf5;
    --e-ok-bd: #a7f3d0;
    --e-warn: #b45309;
    --e-warn-bg: #fffbeb;
    --e-warn-bd: #fde68a;
    --e-bad: #be123c;
    --e-bad-bg: #fff1f2;
    --e-bad-bd: #fecdd3;
    --e-info: #0369a1;
    --e-info-bg: #f0f9ff;
    --e-info-bd: #bae6fd;
    --e-sans: ${fontSans};
    --e-mono: ${fontMono};
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: 1600px;
    height: 1000px;
    overflow: hidden;
    background: var(--e-bg);
    color: var(--e-text);
    font-family: var(--e-sans);
    font-size: 11.5px;
    line-height: 1.35;
    -webkit-font-smoothing: antialiased;
  }
  #canvas {
    width: 1600px;
    height: 1000px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--e-bg);
  }
  .mono {
    font-family: var(--e-mono);
    font-variant-numeric: tabular-nums;
  }
  .num {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .trunc {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Badges */
  .e-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1.5px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .e-badge-neutral { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
  .e-badge-accent  { background: var(--e-accent-soft); color: var(--e-accent-ink); border-color: #bfdbfe; }
  .e-badge-ok      { background: var(--e-ok-bg); color: var(--e-ok); border-color: var(--e-ok-bd); }
  .e-badge-warn    { background: var(--e-warn-bg); color: var(--e-warn); border-color: var(--e-warn-bd); }
  .e-badge-bad     { background: var(--e-bad-bg); color: var(--e-bad); border-color: var(--e-bad-bd); }
  .e-badge-info    { background: var(--e-info-bg); color: var(--e-info); border-color: var(--e-info-bd); }
  .e-badge-dark    { background: #0f172a; color: #e2e8f0; border-color: #334155; }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    display: inline-block;
    flex-shrink: 0;
  }
  .dot-ok { background: #10b981; }
  .dot-warn { background: #f59e0b; }
  .dot-bad { background: #ef4444; }
  .dot-info { background: #0284c7; }

  /* Panels */
  .e-panel {
    background: var(--e-surface);
    border: 1px solid var(--e-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .e-panel-head {
    height: 32px;
    padding: 0 11px;
    border-bottom: 1px solid var(--e-border);
    background: var(--e-surface-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
  }
  .e-panel-title {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--e-text);
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .e-panel-sub {
    font-size: 10px;
    color: var(--e-muted);
    font-weight: 500;
  }
  .e-panel-body {
    padding: 9px 11px;
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .e-panel-body-flush {
    padding: 0;
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Enterprise Buttons */
  .e-btn {
    height: 24px;
    padding: 0 9px;
    border-radius: 3px;
    border: 1px solid var(--e-border-strong);
    background: var(--e-surface);
    color: var(--e-text);
    font-size: 10.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  .e-btn-primary {
    background: var(--e-accent);
    border-color: var(--e-accent);
    color: #ffffff;
  }
  .e-btn-danger {
    background: var(--e-bad-bg);
    border-color: var(--e-bad-bd);
    color: var(--e-bad);
  }

  /* Enterprise Dense Table */
  table.e-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.8px;
    table-layout: fixed;
  }
  table.e-table th {
    text-align: left;
    padding: 5px 7px;
    background: #f1f5f9;
    color: #475569;
    font-size: 9.8px;
    font-weight: 700;
    border-bottom: 1px solid var(--e-border-strong);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  table.e-table th.num, table.e-table td.num {
    text-align: right;
  }
  table.e-table td {
    padding: 4.5px 7px;
    border-bottom: 1px solid #e6ebf1;
    vertical-align: middle;
    color: var(--e-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  table.e-table tbody tr:nth-child(even) {
    background: #fafcfe;
  }
  table.e-table tbody tr.is-selected {
    background: var(--e-accent-soft) !important;
    box-shadow: inset 2px 0 0 var(--e-accent);
  }
  table.e-table tbody tr.is-warn {
    background: #fffbeb !important;
  }
  table.e-table tbody tr.is-bad {
    background: #fff1f2 !important;
  }
  table.e-table tfoot td {
    padding: 6px 7px;
    background: #eef2f7;
    border-top: 1px solid var(--e-border-strong);
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
  }
  .cb {
    width: 12px;
    height: 12px;
    border: 1px solid #94a3b8;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .cb.checked {
    background: var(--e-accent);
    border-color: var(--e-accent);
    color: #fff;
  }

  /* Top Environment Header */
  .e-topbar {
    height: 38px;
    background: #0f172a;
    color: #f8fafc;
    border-bottom: 1px solid #1e293b;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }
  .e-topbar-left, .e-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .e-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 12.5px;
    letter-spacing: -0.01em;
    color: #ffffff;
    white-space: nowrap;
  }
  .e-brand-mark {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: var(--e-accent);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--e-mono);
    font-size: 10.5px;
    font-weight: 800;
  }
  .e-env-pill {
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #047857;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: var(--e-mono);
    font-size: 9.5px;
    font-weight: 700;
  }
  .e-tenant-box {
    height: 24px;
    padding: 0 8px;
    border-radius: 3px;
    background: #1e293b;
    border: 1px solid #334155;
    color: #e2e8f0;
    font-size: 10.8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .e-cmd-search {
    height: 24px;
    width: 290px;
    padding: 0 8px;
    border-radius: 3px;
    background: #1e293b;
    border: 1px solid #334155;
    color: #94a3b8;
    font-size: 10.5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .e-kbd {
    font-family: var(--e-mono);
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: #0f172a;
    border: 1px solid #475569;
    color: #cbd5e1;
  }
  .e-user-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid #334155;
    white-space: nowrap;
  }
  .e-avatar {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    background: #1d4ed8;
    color: #fff;
    font-size: 9.5px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Shell Body & Nested Tree Sidebar */
  .e-shell-body {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .e-sidebar {
    width: 214px;
    background: #ffffff;
    border-right: 1px solid var(--e-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 8px 0;
  }
  .e-nav-group {
    padding: 0 8px 8px;
    margin-bottom: 6px;
    border-bottom: 1px solid #eef2f6;
  }
  .e-nav-group:last-of-type {
    border-bottom: 0;
  }
  .e-nav-label {
    font-size: 9.2px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.04em;
    padding: 2px 6px 5px;
  }
  .e-nav-item {
    height: 26px;
    padding: 0 7px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    color: #334155;
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 1px;
  }
  .e-nav-item.is-active {
    background: var(--e-accent-soft);
    color: var(--e-accent-ink);
    font-weight: 700;
    box-shadow: inset 2.5px 0 0 var(--e-accent);
  }
  .e-nav-left {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .e-nav-cnt {
    font-family: var(--e-mono);
    font-size: 9.5px;
    padding: 1px 5px;
    border-radius: 2px;
    background: #f1f5f9;
    color: #475569;
    flex-shrink: 0;
  }
  .e-nav-cnt.warn {
    background: #fff1f2;
    color: #be123c;
    font-weight: 700;
  }
  .e-nav-item.is-active .e-nav-cnt {
    background: var(--e-accent);
    color: #ffffff;
  }
  .e-sidebar-foot {
    margin: 0 8px;
    padding: 8px;
    border-radius: 4px;
    background: #f8fafc;
    border: 1px solid var(--e-border);
    font-size: 10px;
  }

  /* Workspace Main Column */
  .e-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .e-subbar {
    height: 36px;
    padding: 0 14px;
    background: #ffffff;
    border-bottom: 1px solid var(--e-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
  }
  .e-crumb {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: var(--e-muted);
    min-width: 0;
  }
  .e-crumb strong {
    color: var(--e-text);
    font-size: 12.5px;
  }
  .e-content {
    flex: 1;
    min-height: 0;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    overflow: hidden;
  }

  /* KPI Strip */
  .e-kpi-strip {
    display: grid;
    gap: 8px;
    flex-shrink: 0;
  }
  .e-kpi {
    background: var(--e-surface);
    border: 1px solid var(--e-border);
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .e-kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 10px;
    color: var(--e-muted);
    font-weight: 600;
  }
  .e-kpi-mid {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
  }
  .e-kpi-val {
    font-family: var(--e-mono);
    font-size: 16.5px;
    font-weight: 700;
    color: var(--e-text);
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  .e-kpi-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 9.8px;
    color: var(--e-muted);
    gap: 4px;
  }

  /* Bottom Status Bar */
  .e-statusbar {
    height: 24px;
    background: #f1f5f9;
    border-top: 1px solid var(--e-border-strong);
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--e-mono);
    font-size: 9.8px;
    color: #475569;
    flex-shrink: 0;
  }
  .e-status-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .e-status-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  ${extraCss}
</style>
</head>
<body>
  <div id="canvas">${bodyHtml}</div>
</body>
</html>`;
}

export function renderEnvTopbar({
  mark,
  productName,
  envLabel = 'PROD-ID-JKT1',
  tenantName,
  searchPlaceholder,
  timeRange = '24 Jam Terakhir · WIB',
  healthText,
  userInitials,
  userName,
  userRole,
}) {
  return `<header class="e-topbar">
    <div class="e-topbar-left">
      <div class="e-brand">
        <span class="e-brand-mark">${esc(mark)}</span>
        <span>${esc(productName)}</span>
      </div>
      <span class="e-env-pill">${esc(envLabel)}</span>
      <div class="e-tenant-box">
        ${ic('layers', 12, '#93c5fd')}
        <span>${esc(tenantName)}</span>
        ${ic('chevronDown', 11, '#94a3b8')}
      </div>
      <div class="e-cmd-search">
        <span style="display:inline-flex;align-items:center;gap:6px;" class="trunc">
          ${ic('search', 12, '#64748b')}
          <span class="trunc">${esc(searchPlaceholder)}</span>
        </span>
        <span class="e-kbd">Ctrl+K</span>
      </div>
    </div>
    <div class="e-topbar-right">
      <div class="e-tenant-box">
        ${ic('clock', 11, '#94a3b8')}
        <span class="mono" style="font-size:10px;">${esc(timeRange)}</span>
      </div>
      <div class="e-tenant-box" style="background:#052e16;border-color:#166534;color:#86efac;">
        <span class="dot dot-ok"></span>
        <span class="mono" style="font-size:10px;">${esc(healthText)}</span>
      </div>
      <div class="e-user-chip">
        <span class="e-avatar">${esc(userInitials)}</span>
        <div style="line-height:1.15;">
          <div style="font-size:10.5px;font-weight:700;color:#f8fafc;">${esc(userName)}</div>
          <div style="font-size:9px;color:#94a3b8;">${esc(userRole)}</div>
        </div>
      </div>
    </div>
  </header>`;
}

export function renderTreeSidebar({ groups = [], activeId = '', footHtml = '' }) {
  const navHtml = groups
    .map(
      (g) => `<div class="e-nav-group">
        <div class="e-nav-label">${esc(g.label)}</div>
        ${g.items
          .map((item) => {
            const active = item.id === activeId;
            return `<div class="e-nav-item ${active ? 'is-active' : ''}">
              <div class="e-nav-left">
                ${ic(item.icon, 13, active ? 'var(--e-accent-ink)' : '#64748b')}
                <span class="trunc">${esc(item.label)}</span>
              </div>
              ${item.badge != null ? `<span class="e-nav-cnt ${item.badgeWarn ? 'warn' : ''}">${esc(item.badge)}</span>` : ''}
            </div>`;
          })
          .join('')}
      </div>`
    )
    .join('');

  return `<aside class="e-sidebar">
    <div>${navHtml}</div>
    ${footHtml ? `<div class="e-sidebar-foot">${footHtml}</div>` : ''}
  </aside>`;
}

export function renderStatusFooter({ leftItems = [], rightItems = [] }) {
  return `<footer class="e-statusbar">
    <div class="e-status-group">
      ${leftItems.map((x) => `<span class="e-status-item">${x}</span>`).join('')}
    </div>
    <div class="e-status-group">
      ${rightItems.map((x) => `<span class="e-status-item">${x}</span>`).join('')}
    </div>
  </footer>`;
}
