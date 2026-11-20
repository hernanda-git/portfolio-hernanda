import {
  barChartSvg,
  esc,
  mapCanvasSvg,
  productThumbSvg,
  qrisSvg,
  scadaSchematicSvg,
  sparklineSvg,
} from './svgGraphics.mjs';
import { seedNum, sidebarHtml, statusPill, topbarHtml, wrapHtml } from './shell.mjs';

// 9. E-COMMERCE PIM & OMNICHANNEL STORE — Product Cards + Channel Stock Sync
export function renderEcommercePim(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div>${sparklineSvg([44, 52, 61, 58, 72, 84], project.brandColor)}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#0f6f3c">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#9a5500">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Connected Channels</div><div class="kpi-val">3 Live</div></div><span class="mono sub-txt">TKP·SHP·TTK</span></div>
        </div>

        <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Catalog &amp; Fulfillment SKU Grid</span><span class="mono sub-txt">LIVE STOCK RESERVATION</span></div>
            <div style="padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1">
              ${items
                .map(
                  (it, idx) => `<div style="border:1px solid #e4e7ec;border-radius:7px;padding:10px;background:#fff;display:flex;flex-direction:column;gap:8px">
                  ${productThumbSvg(idx + seedNum(project.id), project.brandColor)}
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="mono sub-txt" style="font-weight:700">${esc(it.code)}</span>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                  <div style="font-weight:700;font-size:12.5px">${esc(it.title)}</div>
                  <div class="sub-txt">${esc(it.subtitle)}</div>
                  <div style="margin-top:auto;padding-top:8px;border-top:1px solid #f2f4f7;display:flex;justify-content:space-between;align-items:center">
                    <strong class="mono" style="font-size:13px;color:${project.brandColor}">${esc(it.value)}</strong>
                    <span class="mono sub-txt">${esc(it.meta || 'Synced')}</span>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Channel Allocation &amp; Linter</span><span class="pill" style="background:#e8f6ee;color:#0f6f3c">SYNC OK</span></div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1">
              ${[
                { ch: 'Tokopedia Official Store', pct: 86, val: '99.4% Synced' },
                { ch: 'TikTok Shop Live Stock', pct: 74, val: 'Buffer Guard On' },
                { ch: 'Shopee Mall Warehouse', pct: 92, val: 'Instant Ready' },
              ]
                .map(
                  (c) => `<div>
                  <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px">
                    <span style="font-weight:600">${c.ch}</span><span class="mono sub-txt">${c.val}</span>
                  </div>
                  <div style="height:7px;background:#eaecf0;border-radius:4px;overflow:hidden"><div style="width:${c.pct}%;height:100%;background:${project.brandColor}"></div></div>
                </div>`
                )
                .join('')}
              <div style="padding:12px;background:#10141c;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.5;margin-top:4px">
                ${esc(project.preview.snippet)}
              </div>
              <div style="margin-top:auto;font-size:11.5px;color:#475467;padding:10px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:6px">
                <strong>Indonesia Market Fit:</strong> ${esc(project.indonesiaContext)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 10. GIS SATELLITE & DISPATCH MAP — Cartographic Map + Floating Telemetry + Unit List
export function renderGisSatelliteMap(project, spec) {
  const dark = spec.variant === 'pit';
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, dark)}
    <div class="main">
      ${topbarHtml(project, dark)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${dark ? '#38bdf8' : project.brandColor}">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:${dark ? '#fbbf24' : '#9a5500'}">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Geo Layer</div><div class="kpi-val" style="font-size:15px">PostGIS Live</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="padding:12px;display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:12.5px">Live Spatial Operations Map — ${esc(project.name)}</strong>
              <span class="mono sub-txt">WGS84 · INDONESIA · 5s POLL</span>
            </div>
            ${mapCanvasSvg(spec.variant, project.brandColor, items)}
            <div style="padding:10px 12px;background:${dark ? '#0b0e14' : '#f8fafc'};border:1px solid ${dark ? '#252c3b' : '#e2e8f0'};border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px;color:${dark ? '#cbd5e1' : '#334155'}">
              ${esc(project.preview.snippet)}
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Active Tracked Nodes &amp; Zones</span><span class="mono sub-txt">4 PRIORITY</span></div>
            <div style="padding:10px;display:flex;flex-direction:column;gap:8px;flex:1">
              ${items
                .map(
                  (it, i) => `<div style="padding:10px 12px;border:1px solid ${i === 0 ? project.brandColor : dark ? '#242b3a' : '#e4e7ec'};border-radius:6px;background:${dark ? '#10141c' : '#ffffff'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                    <span class="mono" style="font-weight:700;font-size:11px;color:${dark ? '#60a5fa' : project.brandColor}">${esc(it.code)}</span>
                    ${dark ? statusPill(it.status, it.tone).dark : statusPill(it.status, it.tone).light}
                  </div>
                  <div style="font-weight:600;font-size:12px">${esc(it.title)}</div>
                  <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                  <div style="display:flex;justify-content:space-between;margin-top:6px;font-family:Cascadia Mono,monospace;font-size:10.5px">
                    <strong>${esc(it.value)}</strong>
                    <span class="sub-txt">${esc(it.meta || '')}</span>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', dark);
}

// 11. BANKING & TREASURY WORKSTATION — Multi-Bank Balances + Cashflow + Double-Entry Ledger
export function renderBankingTreasury(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const bankStrip =
    spec.variant === 'payroll'
      ? [
          { b: 'PT Mitra Utama JKT', v: 'Rp 4,18 M', sub: '412 Staff · TER A/B/C' },
          { b: 'PT Mitra Logistik SBY', v: 'Rp 2,11 M', sub: '280 Staff · BCA H2H' },
          { b: 'BPJS Kes + TK Pool', v: 'Rp 584 jt', sub: 'SIPP / Edabu Ready' },
          { b: 'PPh 21 TER Reserve', v: 'Rp 618 jt', sub: 'CoreTax Unifikasi' },
        ]
      : [
          { b: 'Bank Mandiri Corp', v: 'Rp 6,42 M', sub: 'SNAP BI v2 · Active' },
          { b: 'BCA Corporate VA', v: 'Rp 4,85 M', sub: 'Auto-Recon 99.1%' },
          { b: 'BNI & BRI Corridor', v: 'Rp 2,18 M', sub: 'BI-FAST Instant' },
          { b: 'OCBC NISP H2H', v: 'Rp 1,37 M', sub: 'PGP Encrypted' },
        ];

  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          ${bankStrip
            .map(
              (bk, idx) => `<div class="kpi-card" style="${idx === 0 ? `border-top:3px solid ${project.brandColor}` : ''}">
              <div>
                <div class="kpi-lbl">${esc(bk.b)}</div>
                <div class="kpi-val" style="font-size:17px">${esc(bk.v)}</div>
                <div class="sub-txt" style="margin-top:2px">${esc(bk.sub)}</div>
              </div>
            </div>`
            )
            .join('')}
        </div>

        <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd">
              <span>Double-Entry Settlement &amp; Disbursement Ledger</span>
              <span class="mono" style="color:#0f6f3c;font-size:11px">TRIAL BALANCE DELTA: Rp 0</span>
            </div>
            <table class="dt">
              <thead><tr><th>Ref ID</th><th>Counterparty / Batch</th><th>Channel</th><th style="text-align:right">Amount (IDR)</th><th>State</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700;color:#475467">${esc(it.code)}</td>
                    <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td class="mono sub-txt">${esc(it.meta || 'BI-FAST')}</td>
                    <td class="mono" style="text-align:right;font-weight:700">${esc(it.value)}</td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="margin:auto 14px 14px;padding:10px 12px;background:#10141c;color:#cbd5e1;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px">
              ${esc(project.preview.snippet)}
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Liquidity &amp; Settlement Velocity</span><span class="mono sub-txt">${esc(m0.value)}</span></div>
            <div style="padding:12px 14px;display:flex;flex-direction:column;gap:12px;flex:1">
              ${barChartSvg([62, 74, 68, 89, 82, 95], ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], project.brandColor, 5, false)}
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div style="padding:9px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:5px">
                  <div class="sub-txt">${esc(m1.label)}</div>
                  <div class="mono" style="font-weight:700;font-size:14px;color:#0f6f3c;margin-top:2px">${esc(m1.value)}</div>
                </div>
                <div style="padding:9px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:5px">
                  <div class="sub-txt">${esc(m2.label)}</div>
                  <div class="mono" style="font-weight:700;font-size:14px;color:#9a5500;margin-top:2px">${esc(m2.value)}</div>
                </div>
              </div>
              <div style="margin-top:auto;padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;font-size:11.5px;color:#166534">
                <strong>Governance:</strong> Maker-Checker-Releaser dual sign-off enforced prior to BI-FAST / SNAP release.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 12. POS & TOUCH KIOSK TERMINAL — Authentic Cashier Grid + Thermal Receipt + Dynamic QRIS
export function renderPosTerminal(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const s = seedNum(project.id);
  const body = `
    <div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#eef1f4">
      <header style="height:54px;background:${project.brandColor};color:#ffffff;padding:0 22px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <strong style="font-size:16px">${esc(project.preview.surfaceTitle)}</strong>
          <span class="mono" style="font-size:10.5px;padding:3px 8px;background:rgba(255,255,255,0.18);border-radius:4px">${esc(project.preview.envTag)}</span>
        </div>
        <div class="mono" style="font-size:11.5px;display:flex;gap:18px">
          <span>${esc(m0.label)}: <strong>${esc(m0.value)}</strong></span>
          <span>${esc(m1.label)}: <strong>${esc(m1.value)}</strong></span>
          <span>${esc(m2.label)}: <strong>${esc(m2.value)}</strong></span>
        </div>
      </header>

      <div style="flex:1;display:grid;grid-template-columns:1.6fr 390px;overflow:hidden">
        <div style="padding:18px 20px;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;gap:8px">
            ${(spec.nav || ['Utama', 'Populer', 'Paket', 'Lainnya'])
              .map(
                (t, i) => `<span style="padding:8px 16px;border-radius:6px;font-size:12.5px;font-weight:600;background:${i === 0 ? project.brandColor : '#ffffff'};color:${i === 0 ? '#ffffff' : '#344054'};border:1px solid ${i === 0 ? project.brandColor : '#d0d5dd'}">${esc(t)}</span>`
              )
              .join('')}
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;flex:1">
            ${items
              .map(
                (it, idx) => `<div style="background:#ffffff;border:1px solid #d8dde6;border-left:4px solid ${idx === 0 ? project.brandColor : '#cbd5e1'};border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span class="mono" style="font-size:11px;font-weight:700;color:#667085">${esc(it.code)} · ${esc(it.meta || 'READY')}</span>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                  <div style="font-size:15px;font-weight:700">${esc(it.title)}</div>
                  <div class="sub-txt" style="margin-top:4px;font-size:12px">${esc(it.subtitle)}</div>
                  <div style="margin-top:12px">${productThumbSvg(idx + s, project.brandColor)}</div>
                </div>
                <div style="margin-top:14px;padding-top:10px;border-top:1px solid #eaecf0;display:flex;justify-content:space-between;align-items:center">
                  <span class="mono" style="font-size:16px;font-weight:700;color:${project.brandColor}">${esc(it.value)}</span>
                  <span style="padding:5px 12px;background:#f2f4f7;border-radius:5px;font-size:11.5px;font-weight:600">+ Tambah</span>
                </div>
              </div>`
              )
              .join('')}
          </div>

          <div style="padding:10px 14px;background:#ffffff;border:1px solid #d8dde6;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:11px;color:#344054">
            HARDWARE &amp; SYNC: ${esc(project.preview.snippet)}
          </div>
        </div>

        <aside style="background:#ffffff;border-left:1px solid #d0d5dd;padding:18px;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #14171f;padding-bottom:10px;margin-bottom:12px">
              <div>
                <div style="font-size:14px;font-weight:700">Struk / Tiket Aktif</div>
                <div class="mono sub-txt">POS #01 · 20-NOV-2026 WIB</div>
              </div>
              <span class="pill" style="background:#e8f6ee;color:#0f6f3c">OFFLINE SAFE</span>
            </div>

            ${items
              .slice(0, 3)
              .map(
                (it, idx) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #d0d5dd;font-size:12px">
                <div><strong>${idx === 0 ? '2x' : '1x'} ${esc(it.title.slice(0, 26))}</strong><div class="sub-txt">${esc(it.code)} · ${esc(it.meta || '')}</div></div>
                <span class="mono" style="font-weight:700">${esc(it.value)}</span>
              </div>`
              )
              .join('')}

            <div style="margin-top:14px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;gap:14px">
              ${qrisSvg(s, 84)}
              <div>
                <div style="font-weight:700;font-size:12.5px">QRIS Dinamis / Verifikasi</div>
                <div class="sub-txt" style="margin-top:3px">Nominal &amp; pajak terkunci otomatis. Menunggu konfirmasi callback instan.</div>
                <div class="mono" style="font-size:10.5px;color:${project.brandColor};margin-top:6px;font-weight:700">${esc(project.standards[0])}</div>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;padding:8px 0;border-top:2px solid #14171f">
              <span>TOTAL SETTLEMENT</span>
              <span class="mono" style="color:${project.brandColor}">${esc(m0.value)}</span>
            </div>
            <div style="padding:12px;background:${project.brandColor};color:#ffffff;text-align:center;border-radius:6px;font-size:13.5px;font-weight:700">
              ${esc(project.preview.primaryAction)}
            </div>
            <div style="padding:9px;background:#f2f4f7;color:#14171f;text-align:center;border-radius:6px;font-size:12px;font-weight:600">
              ${esc(project.preview.secondaryAction)}
            </div>
          </div>
        </aside>
      </div>
    </div>`;
  return wrapHtml(body, '', false);
}

// 13. KANBAN ENTERPRISE APPROVAL & WORKFLOW BOARD — 4 Rich Swimlanes
export function renderKanbanBoard(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const cols = [
    { name: '01 · Intake & Triage', cards: [items[0], { ...items[2], code: items[2].code + '-B', status: 'Queued', tone: 'neutral' }] },
    { name: '02 · Verification / SLA', cards: [items[1]] },
    { name: '03 · Executive / Final Sign', cards: [items[2]] },
    { name: '04 · Completed & Synced', cards: [items[3]] },
  ];
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div style="display:flex;gap:12px">
          <div class="kpi-card" style="flex:1"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="font-size:17px">${esc(m0.value)}</div></div></div>
          <div class="kpi-card" style="flex:1"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="font-size:17px;color:${project.brandColor}">${esc(m1.value)}</div></div></div>
          <div class="kpi-card" style="flex:1"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="font-size:17px;color:#0f6f3c">${esc(m2.value)}</div></div></div>
          <div class="kpi-card" style="flex:1"><div><div class="kpi-lbl">Workflow Engine</div><div class="kpi-val" style="font-size:14px">${esc(project.standards[0])}</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;flex:1;min-height:0">
          ${cols
            .map(
              (col, ci) => `<div style="background:#eef1f5;border:1px solid #dde2ea;border-radius:7px;padding:10px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:6px;border-bottom:2px solid ${ci === 1 ? project.brandColor : '#cbd5e1'}">
                <strong style="font-size:11.5px">${esc(col.name)}</strong>
                <span class="mono sub-txt">${col.cards.length}</span>
              </div>
              ${col.cards
                .map(
                  (c) => `<div style="background:#ffffff;border:1px solid #dce1e8;border-radius:6px;padding:11px;display:flex;flex-direction:column;gap:6px">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span class="mono" style="font-size:10.5px;font-weight:700;color:${project.brandColor}">${esc(c.code)}</span>
                    ${statusPill(c.status, c.tone).light}
                  </div>
                  <div style="font-weight:700;font-size:12.5px;line-height:1.35">${esc(c.title)}</div>
                  <div class="sub-txt">${esc(c.subtitle)}</div>
                  <div style="margin-top:4px;padding-top:7px;border-top:1px solid #f2f4f7;display:flex;justify-content:space-between;align-items:center;font-family:Cascadia Mono,monospace;font-size:11px">
                    <strong>${esc(c.value)}</strong>
                    <span class="sub-txt">${esc(c.meta || 'SLA OK')}</span>
                  </div>
                </div>`
                )
                .join('')}
            </div>`
            )
            .join('')}
        </div>

        <div style="padding:9px 14px;background:#10141c;color:#cbd5e1;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px">
          EVENT BUS: ${esc(project.preview.snippet)}
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 14. DESKTOP WINDOWS / WPF ENTERPRISE ERP — Classic Dense High-Craft Desktop App
export function renderDesktopWinErp(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `
    <div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#f3f4f6">
      <div style="height:30px;background:#1b1f27;color:#e5e7eb;padding:0 14px;display:flex;align-items:center;justify-content:space-between;font-size:11.5px">
        <span style="font-weight:600">${esc(project.name)} Enterprise Desktop (.NET 8 WPF) — ${esc(project.preview.surfaceTitle)}</span>
        <span class="mono" style="font-size:10px;color:#9ca3af">${esc(project.preview.envTag)}</span>
      </div>
      <div style="height:30px;background:#ffffff;border-bottom:1px solid #d1d5db;padding:0 14px;display:flex;align-items:center;gap:18px;font-size:11.5px;color:#374151">
        <span><strong>File</strong></span><span>Master Data</span><span>Transactions</span><span>Compliance</span><span>Excel / EPPlus</span><span>Audit Log</span><span>Help</span>
      </div>
      <div style="height:40px;background:#f9fafb;border-bottom:1px solid #d1d5db;padding:0 14px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:8px;align-items:center">
          <span class="btn-primary" style="background:${project.brandColor};padding:5px 11px">${esc(project.preview.primaryAction)}</span>
          <span class="btn-ghost" style="padding:4px 10px">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-ghost" style="padding:4px 10px">Filter Grid</span>
          <span class="btn-ghost" style="padding:4px 10px">Export XLSX</span>
        </div>
        <div class="mono" style="font-size:11px;display:flex;gap:16px">
          <span>${esc(m0.label)}: <strong style="color:${project.brandColor}">${esc(m0.value)}</strong></span>
          <span>${esc(m1.label)}: <strong>${esc(m1.value)}</strong></span>
          <span>${esc(m2.label)}: <strong style="color:#9a5500">${esc(m2.value)}</strong></span>
        </div>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:210px 1fr;overflow:hidden">
        <aside style="background:#ffffff;border-right:1px solid #d1d5db;padding:12px">
          <div class="mono" style="font-size:10px;font-weight:700;color:#6b7280;margin-bottom:8px">MODULE EXPLORER</div>
          ${spec.nav
            .map(
              (n, i) => `<div style="padding:7px 9px;border-radius:4px;margin-bottom:3px;font-size:12px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? '#eff4ff' : 'transparent'};color:${i === 0 ? project.brandColor : '#374151'}">${i === 0 ? '▸ ' : '· '}${esc(n)}</div>`
            )
            .join('')}
          <div style="margin-top:18px;padding:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:5px;font-size:11px">
            <div class="mono" style="font-size:10px;color:#6b7280;font-weight:700">SQL SERVER SYNC</div>
            <div style="margin-top:4px;color:#0f6f3c;font-weight:600">Connected · 0ms drift</div>
            <div class="sub-txt" style="margin-top:2px">${esc(project.architecture.storage)}</div>
          </div>
        </aside>

        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden">
          <div class="card" style="flex:1;display:flex;flex-direction:column">
            <div class="card-hd">
              <span>Operational Register Grid — ${esc(project.preview.surfaceTitle)}</span>
              <span class="mono sub-txt">SORTED BY PRIORITY · READ/WRITE LOCKED</span>
            </div>
            <table class="dt">
              <thead><tr><th>Code</th><th>Entity / Asset / Branch</th><th>Operational Detail</th><th>Metric / Value</th><th>Tag</th><th>Status</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it, idx) => `<tr style="background:${idx === 0 ? '#f0f6ff' : idx % 2 === 1 ? '#fafbfc' : '#ffffff'}">
                    <td class="mono" style="font-weight:700;color:${project.brandColor}">${esc(it.code)}</td>
                    <td style="font-weight:600">${esc(it.title)}</td>
                    <td class="sub-txt">${esc(it.subtitle)}</td>
                    <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                    <td class="mono sub-txt">${esc(it.meta || '-')}</td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="margin-top:auto;padding:12px;background:#f8fafc;border-top:1px solid #e4e7ec;display:grid;grid-template-columns:1.3fr 1fr;gap:14px">
              <div style="padding:10px 12px;background:#10141c;color:#e2e8f0;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.5">
                ${esc(project.preview.snippet)}
              </div>
              <div style="font-size:11.5px;color:#374151">
                <strong>Architecture Note:</strong> ${esc(project.summary)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style="height:26px;background:${project.brandColor};color:#ffffff;padding:0 14px;display:flex;align-items:center;justify-content:space-between;font-family:Cascadia Mono,monospace;font-size:10px">
        <span>READY · ${esc(project.stack.join(' · '))}</span>
        <span>STANDARDS: ${esc(project.standards.join(' | '))}</span>
      </footer>
    </div>`;
  return wrapHtml(body, '', false);
}

// 15. SCADA INDUSTRIAL CONTROL ROOM — Dark Plant Schematic + Live Gauges + Alarm Log
export function renderScadaPlant(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, true)}
    <div class="main">
      ${topbarHtml(project, true)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:#34d399">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#38bdf8">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#fbbf24">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">PLC / MQTT Link</div><div class="kpi-val" style="color:#34d399;font-size:16px">ONLINE 50Hz</div></div></div>
        </div>

        <div class="card" style="padding:12px">
          ${scadaSchematicSvg(spec.variant, project.brandColor, items)}
        </div>

        <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card">
            <div class="card-hd"><span>Equipment Telemetry &amp; Threshold Alarms</span><span class="mono sub-txt">TIMESCALEDB HISTORIAN</span></div>
            <table class="dt">
              <thead><tr><th>Node</th><th>Equipment / Zone</th><th>Reading</th><th>Status</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700;color:#38bdf8">${esc(it.code)}</td>
                    <td><div style="font-weight:600;color:#f1f5f9">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                    <td>${statusPill(it.status, it.tone).dark}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
            <div style="font-weight:700;font-size:12.5px">Live Telemetry &amp; Compliance Feed</div>
            <div style="padding:12px;background:#080b10;border:1px solid #262c38;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px;color:#34d399;line-height:1.55">
              ${esc(project.preview.snippet)}
            </div>
            <div class="sub-txt" style="line-height:1.5">${esc(project.indonesiaContext)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', true);
}

// 16. GOV.UK / INA DIGITAL PUBLIC SERVICE PORTAL — Authoritative Civic Clarity
export function renderGovDpiPortal(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `
    <div style="width:1280px;height:800px;display:flex;flex-direction:column;background:#f5f6f7">
      <header style="height:64px;background:#111317;color:#ffffff;padding:0 36px;border-bottom:4px solid ${project.brandColor};display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:32px;height:32px;border:2px solid #ffffff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:Cascadia Mono,monospace;font-weight:700;font-size:12px">ID</div>
          <div>
            <div style="font-size:16px;font-weight:700">${esc(project.name)} · Portal Layanan Digital Terpadu</div>
            <div class="mono" style="font-size:10px;color:#9ca3af">${esc(project.preview.envTag)}</div>
          </div>
        </div>
        <div style="display:flex;gap:18px;font-size:12px">
          ${spec.nav.map((n, i) => `<span style="${i === 0 ? 'font-weight:700;border-bottom:2px solid #fff;padding-bottom:3px' : 'opacity:0.75'}">${esc(n)}</span>`).join('')}
        </div>
      </header>

      <div style="flex:1;padding:24px 36px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div>
            <div class="mono" style="font-size:11px;color:${project.brandColor};font-weight:700">DIGITAL PUBLIC INFRASTRUCTURE · ${esc(project.standards.join(' · '))}</div>
            <h1 class="serif" style="margin:4px 0 0;font-size:24px">${esc(project.preview.surfaceTitle)}</h1>
          </div>
          <div style="display:flex;gap:8px">
            <span class="btn-ghost">${esc(project.preview.secondaryAction)}</span>
            <span class="btn-primary" style="background:${project.brandColor}">${esc(project.preview.primaryAction)}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#0f6f3c">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val">${esc(m2.value)}</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:18px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Status Layanan &amp; Verifikasi Transparan</span><span class="mono sub-txt">TERAUDIT BSrE / UU PDP</span></div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:10px;flex:1">
              ${items
                .map(
                  (it, i) => `<div style="padding:12px 14px;border:1px solid #dce1e8;border-left:4px solid ${it.tone === 'warn' ? '#d97706' : it.tone === 'bad' ? '#dc2626' : project.brandColor};border-radius:4px;background:#ffffff;display:flex;justify-content:space-between;align-items:center;gap:12px">
                  <div>
                    <div class="mono sub-txt" style="font-weight:700">TAHAP 0${i + 1} · ${esc(it.code)}</div>
                    <div style="font-size:13.5px;font-weight:700;margin-top:2px">${esc(it.title)}</div>
                    <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div class="mono" style="font-weight:700;margin-bottom:4px">${esc(it.value)}</div>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:13.5px">Bukti Verifikasi &amp; Transparansi Publik</div>
            <div style="padding:12px;background:#10141c;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">
              ${esc(project.preview.snippet)}
            </div>
            <div style="font-size:12px;color:#344054;line-height:1.55">${esc(project.indonesiaContext)}</div>
            <div style="margin-top:auto;padding-top:10px;border-top:1px solid #e4e7ec;display:flex;justify-content:space-between;align-items:center">
              <div class="sub-txt"><strong>Arsitektur:</strong> ${esc(project.architecture.core)}</div>
              ${qrisSvg(seedNum(project.id), 52)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  return wrapHtml(body, '', false);
}
