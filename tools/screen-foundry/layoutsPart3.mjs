import {
  barChartSvg,
  dicomViewerSvg,
  esc,
  multiLineChartSvg,
  qrisSvg,
  sparklineSvg,
} from './svgGraphics.mjs';
import { seedNum, sidebarHtml, statusPill, topbarHtml, wrapHtml } from './shell.mjs';

// 17. BI EXECUTIVE SUITE — Analytics Charts + Regional Ranking + Scorecard
export function renderBiExecutive(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const s = seedNum(project.id);
  const vals = [54 + (s % 15), 62 + (s % 11), 59 + (s % 14), 74 + (s % 9), 79 + (s % 12), 88 + (s % 8)];
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div>${sparklineSvg(vals, project.brandColor)}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#0f6f3c">${esc(m1.value)}</div></div>${sparklineSvg([60, 64, 68, 72, 75, 79], '#0f6f3c')}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#9a5500">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Data Freshness</div><div class="kpi-val" style="font-size:15px;color:#0f6f3c">07:00 WIB</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:14px">
          <div class="card">
            <div class="card-hd"><span>6-Month Trajectory &amp; Benchmark</span><span class="mono sub-txt">REALIZATION VS TARGET</span></div>
            <div style="padding:10px 12px">${barChartSvg(vals, ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], project.brandColor, 5, false)}</div>
          </div>
          <div class="card">
            <div class="card-hd"><span>Performance Variance Curve</span><span class="mono sub-txt">CLICKHOUSE ENGINE</span></div>
            <div style="padding:10px 12px">${multiLineChartSvg(vals, [60, 64, 67, 70, 74, 78], ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], project.brandColor, '#94a3b8', false)}</div>
          </div>
        </div>

        <div class="card" style="flex:1">
          <div class="card-hd"><span>Ranked Segment &amp; Regional Breakdown</span><span class="mono sub-txt">${esc(project.standards.join(' · '))}</span></div>
          <table class="dt">
            <thead><tr><th>Code</th><th>Region / Segment / Driver</th><th>Insight Detail</th><th>Score / Value</th><th>Meta</th><th>Verdict</th></tr></thead>
            <tbody>
              ${items
                .map(
                  (it) => `<tr>
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
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 18. API SANDBOX & PROTOCOL STUDIO — Postman/Swagger-grade Split IDE
export function renderApiSandbox(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div style="background:#ffffff;border:1px solid #d0d5dd;border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:10px">
          <span class="mono" style="padding:4px 9px;background:${project.brandColor};color:#fff;border-radius:4px;font-weight:700;font-size:11px">POST</span>
          <span class="mono" style="font-size:12px;font-weight:600;flex:1">https://api.${esc(project.name.toLowerCase().replace(/\s+/g, ''))}.id/v2/${esc(items[0].code.toLowerCase())}</span>
          <span class="pill" style="background:#e8f6ee;color:#0f6f3c">200 OK · 42ms</span>
          <span class="mono sub-txt">${esc(m0.label)}: ${esc(m0.value)}</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Endpoint Collection &amp; Contract Tests</span><span class="mono sub-txt">${esc(m1.value)}</span></div>
            <div style="padding:10px;display:flex;flex-direction:column;gap:8px;flex:1">
              ${items
                .map(
                  (it, i) => `<div style="padding:10px 12px;border:1px solid ${i === 0 ? project.brandColor : '#e4e7ec'};border-radius:6px;background:${i === 0 ? '#eff4ff' : '#fff'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                    <span class="mono" style="font-weight:700;font-size:11px;color:${project.brandColor}">${esc(it.code)}</span>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                  <div class="mono" style="font-weight:700;font-size:11.5px">${esc(it.title)}</div>
                  <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div class="card" style="flex:1;display:flex;flex-direction:column">
              <div class="card-hd"><span>Signature / Schema Payload &amp; Live Diff</span><span class="mono sub-txt">${esc(m2.label)}: ${esc(m2.value)}</span></div>
              <pre class="mono" style="margin:0;padding:14px;background:#0e121a;color:#e2e8f0;font-size:11.5px;line-height:1.65;flex:1;white-space:pre-wrap">{
  "service": "${esc(project.name)}",
  "standard": "${esc(project.standards[0])}",
  "timestamp": "2026-11-20T14:22:18+07:00",
  "verification": "PASSED",
  "trace": "${esc(project.preview.snippet.replace(/"/g, "'"))}"
}</pre>
            </div>
            <div class="card" style="padding:12px 14px">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px">
                <strong>Latency Waterfall (42ms total)</strong>
                <span class="mono sub-txt">DNS 3ms · TLS 9ms · Sign 4ms · Upstream 26ms</span>
              </div>
              <div style="display:flex;height:10px;border-radius:4px;overflow:hidden;gap:2px">
                <div style="width:8%;background:#94a3b8"></div>
                <div style="width:22%;background:#38bdf8"></div>
                <div style="width:12%;background:#22c55e"></div>
                <div style="width:58%;background:${project.brandColor}"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 19. SCHEDULER & RESOURCE TAPE-CHART — Gantt Timeline Grid
export function renderSchedulerTape(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const slots = ['06:00 – 10:00', '10:00 – 14:00', '14:00 – 18:00', '18:00 – 22:00', '22:00 – 06:00'];
  const matrix = [
    [1, 1, 0, 1, 0],
    [0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0],
    [0, 1, 0, 1, 1],
  ];
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#9a5500">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#0f6f3c">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Conflict Guard</div><div class="kpi-val" style="color:#0f6f3c;font-size:15px">0 CLASHES</div></div></div>
        </div>

        <div class="card" style="flex:1;display:flex;flex-direction:column">
          <div class="card-hd">
            <span>Multi-Resource Allocation Tape Chart (WIB)</span>
            <span class="mono sub-txt">${esc(project.standards.join(' · '))}</span>
          </div>
          <div style="flex:1;display:grid;grid-template-columns:250px repeat(5,1fr);border-top:1px solid #eaecf0">
            <div style="padding:10px 12px;background:#f9fafb;font-weight:700;font-size:11px;border-right:1px solid #eaecf0;border-bottom:1px solid #eaecf0">RESOURCE / UNIT</div>
            ${slots.map((sl) => `<div class="mono" style="padding:10px;background:#f9fafb;font-weight:700;font-size:10.5px;border-right:1px solid #eaecf0;border-bottom:1px solid #eaecf0">${sl}</div>`).join('')}

            ${items
              .map(
                (it, r) => `<div style="padding:12px;border-right:1px solid #eaecf0;border-bottom:1px solid #eaecf0;background:#fff">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span class="mono" style="font-weight:700;font-size:11px;color:${project.brandColor}">${esc(it.code)}</span>
                  ${statusPill(it.status, it.tone).light}
                </div>
                <div style="font-weight:700;font-size:12px;margin-top:4px">${esc(it.title)}</div>
                <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
              </div>` +
                slots
                  .map((_, c) => {
                    const on = matrix[r][c] === 1;
                    const blockCol = it.tone === 'bad' ? '#dc2626' : it.tone === 'warn' ? '#d97706' : project.brandColor;
                    return `<div style="padding:8px;border-right:1px solid #eaecf0;border-bottom:1px solid #eaecf0;background:${on ? '#fafbfc' : '#ffffff'};display:flex;align-items:center">
                      ${
                        on
                          ? `<div style="width:100%;padding:8px 9px;border-radius:5px;background:${blockCol};color:#ffffff;font-size:10.5px;font-weight:600">
                              <div>${esc(it.value)}</div>
                              <div class="mono" style="font-size:9px;opacity:0.85">${esc(it.meta || 'LOCKED')}</div>
                            </div>`
                          : `<div class="mono" style="width:100%;text-align:center;font-size:10px;color:#98a2b3">Open</div>`
                      }
                    </div>`;
                  })
                  .join('')
              )
              .join('')}
          </div>
        </div>

        <div style="padding:10px 14px;background:#10141c;color:#cbd5e1;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px">
          SOLVER LOG: ${esc(project.preview.snippet)}
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 20. RADIOLOGY PACS VIEWER — Dark DICOM Imaging + CITO Worklist + Expertise
export function renderRadiologyPacs(project, spec) {
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, true)}
    <div class="main">
      ${topbarHtml(project, true)}
      <div class="content" style="display:grid;grid-template-columns:1.15fr 1fr;gap:14px">
        <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:13px">${esc(items[0].title)}</strong>
            <span class="pill" style="background:#331416;color:#f87171">CITO · STAT #1</span>
          </div>
          ${dicomViewerSvg()}
          <div style="padding:10px 12px;background:#090b0f;border:1px solid #262c38;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px;color:#93c5fd">
            ${esc(project.preview.snippet)}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="card">
            <div class="card-hd"><span>Regional RSUD Teleradiology Queue</span><span class="mono sub-txt">12 RSUD ONLINE</span></div>
            <table class="dt">
              <thead><tr><th>Modality</th><th>Study &amp; Origin</th><th>Triage</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700;color:#60a5fa">${esc(it.code)}</td>
                    <td><div style="font-weight:600;color:#f8fafc">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td>${statusPill(it.status, it.tone).dark}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
          <div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:8px">
            <div style="font-weight:700;font-size:12.5px">Structured Expertise Draft (SATUSEHAT ImagingStudy)</div>
            <div style="padding:10px;background:#0e1219;border:1px solid #262c38;border-radius:5px;font-size:12px;color:#cbd5e1;line-height:1.55">
              <strong>Temuan Klinis:</strong> Tampak lesi hiperdens regio MCA kiri · Evaluasi segera stroke iskemik akut. Disinkronkan ke RSUD Kupang via progressive lossless DICOMweb.
            </div>
            <div class="sub-txt" style="margin-top:auto">Verifier: dr. Sari Utami, Sp.Rad · Digital Sign BSrE Ready</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', true);
}

// 21. COMMUNITY, CIVIC & COHORT HUB — Clean Modern Community Platform
export function renderCommunityCivic(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div style="background:${project.brandColor};color:#ffffff;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="mono" style="font-size:10.5px;opacity:0.85">${esc(project.preview.envTag)}</div>
            <div style="font-size:19px;font-weight:700;margin-top:3px">${esc(project.preview.surfaceTitle)}</div>
          </div>
          <div style="display:flex;gap:24px;text-align:right">
            <div><div style="font-size:10.5px;opacity:0.8">${esc(m0.label)}</div><div class="mono" style="font-size:18px;font-weight:700">${esc(m0.value)}</div></div>
            <div><div style="font-size:10.5px;opacity:0.8">${esc(m1.label)}</div><div class="mono" style="font-size:18px;font-weight:700">${esc(m1.value)}</div></div>
            <div><div style="font-size:10.5px;opacity:0.8">${esc(m2.label)}</div><div class="mono" style="font-size:18px;font-weight:700">${esc(m2.value)}</div></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Verified Ledger, Submissions &amp; Community Feed</span><span class="mono sub-txt">REAL-TIME AUDITABLE</span></div>
            <div style="padding:12px;display:flex;flex-direction:column;gap:10px;flex:1">
              ${items
                .map(
                  (it) => `<div style="padding:12px 14px;border:1px solid #e4e7ec;border-radius:7px;background:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px">
                  <div style="display:flex;gap:12px;align-items:flex-start">
                    <span class="avatar" style="background:${project.brandColor};border-radius:6px">${esc(it.code.slice(0, 2))}</span>
                    <div>
                      <div style="font-weight:700;font-size:13px">${esc(it.title)}</div>
                      <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                    </div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div class="mono" style="font-weight:700;font-size:12.5px;margin-bottom:3px">${esc(it.value)}</div>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:13px">Governance Proof &amp; Ecosystem</div>
            <div style="padding:12px;background:#10141c;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">
              ${esc(project.preview.snippet)}
            </div>
            ${project.features
              .map((f, i) => `<div style="padding:8px 10px;background:#f8fafc;border:1px solid #eaecf0;border-radius:5px;font-size:11.5px"><strong class="mono" style="color:${project.brandColor}">0${i + 1}</strong> · ${esc(f)}</div>`)
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 22. TAX & CUSTOMS WORKBENCH — CoreTax DJP / Bea Cukai CEISA Form + XSD Guard
export function renderTaxCustoms(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#b42318">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Schema Gate</div><div class="kpi-val" style="font-size:15px;color:#0f6f3c">XSD STRICT</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Tax / Customs Line-Item Validation Table</span><span class="mono sub-txt">NPWP-16 · NITKU · HS-CODE</span></div>
            <table class="dt">
              <thead><tr><th>Code</th><th>Object / Entity / Tariff</th><th>Tax Base / Value</th><th>Rule</th><th>Validation</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700;color:${project.brandColor}">${esc(it.code)}</td>
                    <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                    <td class="mono sub-txt">${esc(it.meta || '-')}</td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="margin:auto 14px 14px;padding:12px;background:#0e121a;color:#93c5fd;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">
              ${esc(project.preview.snippet)}
            </div>
          </div>

          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:13px">MPN-G3 / Filing Package Preview</strong>
              ${qrisSvg(seedNum(project.id), 52)}
            </div>
            <div style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;line-height:1.5">
              ${esc(project.indonesiaContext)}
            </div>
            <div style="font-size:11px;font-weight:700;color:#667085">PRE-SUBMISSION GUARANTEES</div>
            ${project.features
              .map((f) => `<div style="font-size:11.5px;padding:7px 10px;border:1px solid #eaecf0;border-radius:5px;background:#fff">${esc(f)}</div>`)
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 23. CLINICAL PATHOLOGY LAB LIS — Reference Range Bars + Panic Alert
export function renderClinicLabLis(project, spec) {
  const items = project.preview.items;
  const ranges = [
    { name: 'Kalium (K+) Serum', val: '6.8 mmol/L', ref: '3.5 – 5.1', pct: 94, col: '#dc2626', flag: 'PANIC HIGH' },
    { name: 'HbA1c (HPLC)', val: '8.4 %', ref: '4.0 – 5.6', pct: 80, col: '#d97706', flag: 'HIGH' },
    { name: 'Hemoglobin (Hb)', val: '14.2 g/dL', ref: '13.0 – 17.0', pct: 52, col: '#0f6f3c', flag: 'NORMAL' },
    { name: 'Leukosit (WBC)', val: '7.4 10^3/uL', ref: '4.0 – 10.5', pct: 48, col: '#0f6f3c', flag: 'NORMAL' },
  ];
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div style="padding:12px 16px;background:#fdebec;border:1px solid #f6c0bc;border-left:4px solid #b42318;border-radius:6px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="color:#b42318">CRITICAL PANIC VALUE ALERT · ICU BED #04</strong>
            <div style="font-size:12px;color:#7a271a;margin-top:2px">${esc(project.preview.snippet)}</div>
          </div>
          <span class="btn-primary" style="background:#b42318">Log Physician Read-Back</span>
        </div>

        <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:13px">Reference Interval Distribution (ASTM/HL7 Bidirectional)</div>
            ${ranges
              .map(
                (r) => `<div style="padding:11px 12px;border:1px solid #e4e7ec;border-radius:6px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <strong>${r.name}</strong>
                  <span class="mono" style="font-weight:700;color:${r.col}">${r.val} <span class="sub-txt">(Ref ${r.ref})</span></span>
                </div>
                <div style="position:relative;height:10px;background:#e5e7eb;border-radius:5px">
                  <div style="position:absolute;left:28%;width:44%;height:100%;background:#bbf7d0"></div>
                  <div style="position:absolute;left:${r.pct}%;top:-3px;width:6px;height:16px;border-radius:2px;background:${r.col}"></div>
                </div>
              </div>`
              )
              .join('')}
          </div>

          <div class="card">
            <div class="card-hd"><span>Specimen &amp; Analyzer Queue</span><span class="mono sub-txt">LOINC MAPPED</span></div>
            <table class="dt">
              <thead><tr><th>Lab ID</th><th>Panel</th><th>Status</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700">${esc(it.code)}</td>
                    <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 24. WHATSAPP FLOW STUDIO — Visual Automation Node Graph + Phone Preview
export function renderWhatsappFlow(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content" style="display:grid;grid-template-columns:1.55fr 350px;gap:16px">
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val">${esc(m1.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#0f6f3c">${esc(m2.value)}</div></div></div>
          </div>

          <div class="card" style="padding:14px">
            <div style="font-weight:700;font-size:12.5px;margin-bottom:10px">Official Meta Cloud API Deterministic Flow Graph</div>
            <svg viewBox="0 0 640 165" width="100%" height="165" style="display:block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px">
              <line x1="145" y1="82" x2="185" y2="82" stroke="#047857" stroke-width="2"/>
              <line x1="325" y1="82" x2="365" y2="48" stroke="#047857" stroke-width="2"/>
              <line x1="325" y1="82" x2="365" y2="118" stroke="#d97706" stroke-width="2"/>
              <line x1="505" y1="48" x2="535" y2="48" stroke="#047857" stroke-width="2"/>
              <rect x="15" y="48" width="130" height="68" rx="6" fill="#fff" stroke="#047857" stroke-width="1.6"/>
              <text x="26" y="70" font-size="9.5" font-family="Cascadia Mono,monospace" fill="#047857" font-weight="700">01 TRIGGER</text>
              <text x="26" y="92" font-size="11.5" font-weight="700" fill="#14171f">WA Webhook In</text>
              <rect x="185" y="48" width="140" height="68" rx="6" fill="#fff" stroke="#0f52ba" stroke-width="1.6"/>
              <text x="196" y="70" font-size="9.5" font-family="Cascadia Mono,monospace" fill="#0f52ba" font-weight="700">02 CLASSIFIER</text>
              <text x="196" y="92" font-size="11.5" font-weight="700" fill="#14171f">Utility vs Auth</text>
              <rect x="365" y="18" width="140" height="58" rx="6" fill="#ecfdf5" stroke="#047857" stroke-width="1.5"/>
              <text x="376" y="40" font-size="9" font-family="Cascadia Mono,monospace" fill="#047857" font-weight="700">AUTO-RESOLVE</text>
              <text x="376" y="58" font-size="11" font-weight="700" fill="#14171f">Dynamic QRIS Link</text>
              <rect x="365" y="90" width="140" height="58" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.5"/>
              <text x="376" y="112" font-size="9" font-family="Cascadia Mono,monospace" fill="#9a5500" font-weight="700">ESCALATE CS</text>
              <text x="376" y="130" font-size="11" font-weight="700" fill="#14171f">Human Inbox + ERP</text>
              <rect x="535" y="18" width="90" height="58" rx="6" fill="#047857"/>
              <text x="580" y="52" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">200 PAID</text>
            </svg>
          </div>

          <div class="card" style="flex:1">
            <div class="card-hd"><span>Active Meta Conversation Templates</span><span class="mono sub-txt">COST-OPTIMIZED</span></div>
            <table class="dt">
              <thead><tr><th>Code</th><th>Flow &amp; Template</th><th>Metric</th><th>Status</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700;color:${project.brandColor}">${esc(it.code)}</td>
                    <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="border:6px solid #16181f;border-radius:26px;background:#ece5dd;overflow:hidden;display:flex;flex-direction:column">
          <div style="background:#075e54;color:#ffffff;padding:14px 16px">
            <div style="font-weight:700;font-size:13.5px">Official Business Verified</div>
            <div class="mono" style="font-size:10px;opacity:0.85">Meta Cloud API · Green Tick</div>
          </div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:10px;flex:1;font-size:12px">
            <div style="background:#ffffff;padding:10px 12px;border-radius:8px;max-width:90%">
              Halo Kak, tagihan pesanan <strong>#INV-8824</strong> sebesar <strong>Rp 185.000</strong> siap diselesaikan. Klik tombol di bawah untuk QRIS instan.
            </div>
            <div style="background:#dcf8c6;padding:8px 12px;border-radius:8px;align-self:flex-end;font-weight:600">
              Bayar via QRIS Sekarang
            </div>
            <div style="background:#ffffff;padding:10px 12px;border-radius:8px;text-align:center">
              ${qrisSvg(seedNum(project.id), 92)}
              <div style="font-weight:700;margin-top:6px;color:#047857">Lunas Terverifikasi (3.8s)</div>
            </div>
            <div style="margin-top:auto;padding:9px;background:#10141c;color:#cbd5e1;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:9.5px">
              ${esc(project.preview.snippet)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}
