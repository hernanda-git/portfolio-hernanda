import {
  cctvSceneSvg,
  esc,
  multiLineChartSvg,
  qrisSvg,
  sparklineSvg,
  waveformSvg,
} from './svgGraphics.mjs';
import { seedNum, sidebarHtml, statusPill, topbarHtml, wrapHtml } from './shell.mjs';

// 1. MOBILE TRIO — Studio 3-iPhone Showcase (distinct per mobile product!)
export function renderMobileTrio(project, spec) {
  const s = seedNum(project.id);
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const nav = spec.nav || ['Beranda', 'Aksi', 'Riwayat'];

  const phoneFrame = (title, body, activeTabIdx) => `
    <div class="phone">
      <div class="phone-status">
        <span>09:41</span>
        <span class="mono">5G · 100%</span>
      </div>
      <div class="phone-head" style="background:${project.brandColor}">
        <div class="mono" style="font-size:9px;opacity:0.85">${esc(project.name.toUpperCase())}</div>
        <div style="font-size:15px;font-weight:700;margin-top:2px">${esc(title)}</div>
      </div>
      <div class="phone-body">${body}</div>
      <div class="phone-tabs">
        ${nav
          .map(
            (n, i) => `<div class="phone-tab ${i === activeTabIdx ? 'on' : ''}" style="${i === activeTabIdx ? `color:${project.brandColor};border-top:2px solid ${project.brandColor}` : ''}">${esc(n)}</div>`
          )
          .join('')}
      </div>
    </div>`;

  const screen1 = `
    <div class="p-hero-card" style="border-left:3px solid ${project.brandColor}">
      <div class="sub-txt">${esc(m0.label)}</div>
      <div class="mono" style="font-size:21px;font-weight:700;margin:2px 0 6px">${esc(m0.value)}</div>
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:#475467;border-top:1px solid #eaecf0;padding-top:6px">
        <span>${esc(m1.label)}: <strong>${esc(m1.value)}</strong></span>
        <span>${esc(m2.label)}: <strong>${esc(m2.value)}</strong></span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div class="p-cta" style="background:${project.brandColor};color:#fff">${esc(project.preview.primaryAction)}</div>
      <div class="p-cta" style="background:#f2f4f7;color:#14171f">${esc(project.preview.secondaryAction)}</div>
    </div>
    <div style="font-size:10.5px;font-weight:700;color:#667085;margin-top:2px">AKTIVITAS TERBARU</div>
    ${items
      .slice(0, 3)
      .map(
        (it) => `<div class="p-row">
        <div style="min-width:0">
          <div style="font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</div>
          <div class="sub-txt" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.subtitle)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="mono" style="font-size:11px;font-weight:700">${esc(it.value)}</div>
          ${statusPill(it.status, it.tone).light}
        </div>
      </div>`
      )
      .join('')}`;

  const screen2 = `
    <div style="text-align:center;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
      <div class="mono" style="font-size:10px;color:#475467;margin-bottom:8px">${esc(project.preview.envTag)}</div>
      ${qrisSvg(s, 118)}
      <div style="font-size:12px;font-weight:700;margin-top:8px">${esc(project.preview.primaryAction)}</div>
      <div class="sub-txt" style="margin-top:2px">${esc(items[0].title)}</div>
    </div>
    <div class="p-detail-box">
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px solid #eaecf0">
        <span class="sub-txt">Referensi</span><strong class="mono">${esc(items[0].code)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px solid #eaecf0">
        <span class="sub-txt">Nominal / Nilai</span><strong class="mono">${esc(items[0].value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0">
        <span class="sub-txt">Standar</span><strong class="mono">${esc(project.standards[0])}</strong>
      </div>
    </div>
    <div class="p-cta" style="background:${project.brandColor};color:#fff;padding:10px">Konfirmasi &amp; Verifikasi</div>`;

  const screen3 = `
    <div class="p-hero-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11px;font-weight:700">Ringkasan &amp; Tren</span>
        <span class="mono" style="font-size:10px;color:${project.brandColor}">${esc(m1.value)}</span>
      </div>
      ${sparklineSvg([28, 36, 33, 48, 55, 62, 74], project.brandColor, 260, 48)}
    </div>
    ${items
      .map(
        (it) => `<div class="p-row">
        <div>
          <div style="font-size:11px;font-weight:600">${esc(it.code)} · ${esc(it.title.slice(0, 22))}</div>
          <div class="sub-txt">${esc(it.meta || it.status)}</div>
        </div>
        <strong class="mono" style="font-size:11px">${esc(it.value)}</strong>
      </div>`
      )
      .join('')}
    <div style="margin-top:auto;padding:8px;background:#11151d;color:#d0d8e8;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:9.5px;line-height:1.4">
      ${esc(project.preview.snippet.slice(0, 118))}
    </div>`;

  const body = `
    <div class="studio-canvas">
      <div class="studio-head">
        <div>
          <div class="mono" style="font-size:11px;color:${project.brandColor};font-weight:700">${esc(project.id)} · MOBILE APPLICATION UI/UX (${esc(project.standards.join(' · '))})</div>
          <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin-top:2px">${esc(project.name)} — ${esc(project.tagline)}</div>
        </div>
        <span class="tb-env">${esc(project.stack.slice(0, 3).join(' · '))}</span>
      </div>
      <div class="trio-row">
        ${phoneFrame(project.preview.surfaceTitle.split('·')[1] || 'Beranda Utama', screen1, 0)}
        ${phoneFrame(project.preview.primaryAction, screen2, 1)}
        ${phoneFrame('Riwayat & Bukti Digital', screen3, 2)}
      </div>
    </div>`;

  const css = `
    .studio-canvas { width:1280px; height:800px; padding:26px 36px 24px; background:#eff1f5; display:flex; flex-direction:column; gap:20px; }
    .studio-head { display:flex; justify-content:space-between; align-items:flex-end; }
    .trio-row { flex:1; display:grid; grid-template-columns:repeat(3, 1fr); gap:28px; align-items:stretch; }
    .phone {
      background:#ffffff; border:6px solid #16181f; border-radius:28px; overflow:hidden;
      display:flex; flex-direction:column;
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
    }
    .phone-status { height:26px; padding:0 18px; background:#16181f; color:#fff; font-size:10px; font-weight:600; display:flex; align-items:center; justify-content:space-between; }
    .phone-head { padding:14px 16px 16px; color:#fff; }
    .phone-body { flex:1; padding:14px; display:flex; flex-direction:column; gap:10px; background:#f8f9fb; overflow:hidden; }
    .phone-tabs { height:42px; background:#fff; border-top:1px solid #e4e7ec; display:grid; grid-template-columns:repeat(3, 1fr); }
    .phone-tab { display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:600; color:#667085; }
    .p-hero-card { background:#fff; border:1px solid #e4e7ec; border-radius:8px; padding:11px 12px; }
    .p-cta { text-align:center; padding:8px; border-radius:6px; font-size:11px; font-weight:600; }
    .p-row { background:#fff; border:1px solid #e4e7ec; border-radius:7px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .p-detail-box { background:#fff; border:1px solid #e4e7ec; border-radius:7px; padding:8px 10px; }
  `;
  return wrapHtml(body, css, false);
}

// 2. SAAS GATEWAY — High-craft Enterprise Control Plane (Charts + Pools + Policy)
export function renderSaasGateway(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const sA = spec.seriesA || [240, 260, 215, 230, 198, 210, 184];
  const sB = spec.seriesB || [320, 310, 305, 318, 295, 290, 285];
  const labels = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'];
  const items = project.preview.items;

  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card">
            <div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div>
            ${sparklineSvg([4, 5, 5, 6, 6, 6], project.brandColor)}
          </div>
          <div class="kpi-card">
            <div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val">${esc(m1.value)}</div></div>
            ${sparklineSvg(sA, '#0f6f3c')}
          </div>
          <div class="kpi-card">
            <div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#9a5500">${esc(m2.value)}</div></div>
            ${sparklineSvg([12, 24, 18, 35, 29, 42], '#d97706')}
          </div>
          <div class="kpi-card">
            <div><div class="kpi-lbl">Compliance Posture</div><div class="kpi-val" style="color:#0f6f3c">99.94%</div></div>
            ${sparklineSvg([98, 99, 99, 100, 99, 100], '#0f6f3c')}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:14px;flex:1;min-height:0">
          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div class="card">
              <div class="card-hd">
                <span>Real-Time Latency &amp; SLA Telemetry (WIB)</span>
                <span class="mono sub-txt">P50 solid · P95 dashed</span>
              </div>
              <div style="padding:10px 12px">${multiLineChartSvg(sA, sB, labels, project.brandColor, '#94a3b8', false)}</div>
            </div>

            <div class="card" style="flex:1">
              <div class="card-hd">
                <span>Active Execution Pools &amp; Pipelines</span>
                <span class="mono sub-txt">${esc(project.standards.join(' · '))}</span>
              </div>
              <table class="dt">
                <thead><tr><th>Code</th><th>Pool / Model Route</th><th>Metric</th><th>Quota / Meta</th><th>Status</th></tr></thead>
                <tbody>
                  ${items
                    .map(
                      (it) => `<tr>
                      <td class="mono" style="font-weight:700;color:#475467">${esc(it.code)}</td>
                      <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
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

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd">
              <span>Live Policy &amp; Trace Inspector</span>
              <span class="pill" style="background:#e8f6ee;color:#0f6f3c">ACTIVE</span>
            </div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1">
              <div style="padding:12px;background:#10141c;color:#e2e8f0;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:11px;line-height:1.55">
                <div style="color:#60a5fa;margin-bottom:4px">// Live Gateway Trace</div>
                ${esc(project.preview.snippet)}
              </div>
              <div style="font-size:11px;font-weight:700;color:#667085">ENFORCED CAPABILITIES</div>
              ${project.features
                .map(
                  (f, i) => `<div style="padding:9px 10px;background:#f9fafb;border:1px solid #eaecf0;border-radius:5px;display:flex;gap:8px;align-items:flex-start">
                  <span class="mono" style="color:${project.brandColor};font-weight:700;flex-shrink:0;white-space:nowrap">0${i + 1}</span>
                  <span style="font-size:11.5px;color:#344054">${esc(f)}</span>
                </div>`
                )
                .join('')}
              <div style="margin-top:auto;padding-top:10px;border-top:1px solid #eaecf0;display:flex;justify-content:space-between;font-size:11px">
                <span class="sub-txt">Core Engine</span>
                <strong class="mono">${esc(project.architecture.core)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 3. LEGAL / COMPLIANCE DOCUMENT REVIEW — Rendered A4 Document + Stamp + Audit Panel
export function renderLegalDocumentReview(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content" style="display:grid;grid-template-columns:1.25fr 1fr;gap:16px">
        <div class="card" style="display:flex;flex-direction:column;background:#fbfbf9">
          <div class="card-hd" style="background:#ffffff">
            <span>Document Preview — ${esc(project.preview.surfaceTitle)}</span>
            <span class="mono sub-txt">SHA-256 VERIFIED · LTV</span>
          </div>
          <div style="padding:22px 28px;flex:1;display:flex;flex-direction:column;gap:14px;background:#ffffff;margin:14px;border:1px solid #dcdcd4;border-radius:4px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #14171f;padding-bottom:12px">
              <div>
                <div class="mono" style="font-size:10px;color:#667085">${esc(project.preview.envTag)}</div>
                <div class="serif" style="font-size:18px;font-weight:700;margin-top:3px">${esc(project.name)} — Official Compliance Dossier</div>
                <div class="sub-txt" style="margin-top:2px">Jurisdiction: Republic of Indonesia · ${esc(project.standards.join(' / '))}</div>
              </div>
              <div style="border:2px solid ${project.brandColor};padding:6px 10px;border-radius:4px;text-align:center">
                <div class="mono" style="font-size:8.5px;color:${project.brandColor};font-weight:700">DIGITAL SEAL</div>
                <div class="mono" style="font-size:10px;font-weight:700">Rp 10.000 / BSrE</div>
                <div class="mono" style="font-size:8px;color:#667085">VERIFIED 2026</div>
              </div>
            </div>

            <div class="serif" style="font-size:12.5px;line-height:1.65;color:#1f242f">
              <p style="margin:0 0 10px"><strong>Section 1 · Scope &amp; Statutory Binding.</strong> ${esc(project.summary)}</p>
              <div style="padding:10px 12px;background:#fef3e2;border-left:3px solid #d97706;margin:10px 0">
                <div class="mono" style="font-size:10px;color:#9a5500;font-weight:700">HIGHLIGHTED CLAUSE · ${esc(items[0].code)}</div>
                <div style="font-family:Segoe UI,sans-serif;font-size:12px;margin-top:2px"><strong>${esc(items[0].title)}</strong> — ${esc(items[0].subtitle)}</div>
              </div>
              <div style="padding:10px 12px;background:#fdebec;border-left:3px solid #b42318;margin:10px 0">
                <div class="mono" style="font-size:10px;color:#b42318;font-weight:700">ACTION REQUIRED · ${esc(items[1].code)}</div>
                <div style="font-family:Segoe UI,sans-serif;font-size:12px;margin-top:2px"><strong>${esc(items[1].title)}</strong> — ${esc(items[1].subtitle)}</div>
              </div>
              <p style="margin:10px 0 0"><strong>Section 2 · Regulatory Context.</strong> ${esc(project.indonesiaContext)}</p>
            </div>

            <div style="margin-top:auto;padding-top:12px;border-top:1px dashed #cbd5e1;display:flex;justify-content:space-between;align-items:center">
              <div class="mono" style="font-size:10px;color:#667085">${esc(project.preview.snippet.slice(0, 74))}</div>
              ${qrisSvg(seedNum(project.id), 48)}
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="font-size:16px">${esc(m0.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="font-size:16px;color:#b42318">${esc(m1.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="font-size:16px;color:#9a5500">${esc(m2.value)}</div></div></div>
          </div>

          <div class="card" style="flex:1;display:flex;flex-direction:column">
            <div class="card-hd">
              <span>Clause &amp; Verification Findings</span>
              <span class="mono sub-txt">4 CHECKS</span>
            </div>
            <div style="padding:12px;display:flex;flex-direction:column;gap:10px;flex:1">
              ${items
                .map(
                  (it) => `<div style="padding:10px 12px;border:1px solid #e4e7ec;border-radius:6px;background:#fff">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span class="mono" style="font-size:11px;font-weight:700;color:${project.brandColor}">${esc(it.code)} · ${esc(it.meta || 'AUDIT')}</span>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                  <div style="font-weight:600;font-size:12.5px">${esc(it.title)}</div>
                  <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                </div>`
                )
                .join('')}
              <div style="margin-top:auto;padding:10px 12px;background:#10141c;color:#e2e8f0;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px">
                ${esc(project.preview.snippet)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 4. AUDIO WAVEFORM QA — Voice/Call Center QA Studio
export function renderAudioWaveformQa(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div class="card">
          <div class="card-hd">
            <span>Diarized Audio Waveform — ${esc(items[0].title)} (06:14 WIB)</span>
            <span class="mono" style="color:${project.brandColor}">ASR ID-JAV · 99.1% CONF · PII AUTO-BLEEP ON</span>
          </div>
          <div style="padding:12px 14px">${waveformSvg(project.brandColor, '#64748b')}</div>
        </div>

        <div style="display:grid;grid-template-columns:1.35fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Audited Call Queue &amp; Transcripts</span><span class="mono sub-txt">100% COVERAGE</span></div>
            <table class="dt">
              <thead><tr><th>Call ID</th><th>Interaction &amp; Dialect</th><th>QA Score</th><th>Sentiment</th><th>State</th></tr></thead>
              <tbody>
                ${items
                  .map(
                    (it) => `<tr>
                    <td class="mono" style="font-weight:700">${esc(it.code)}</td>
                    <td><div style="font-weight:600">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                    <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                    <td class="sub-txt">${esc(it.meta || '-')}</td>
                    <td>${statusPill(it.status, it.tone).light}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <div style="margin:auto 14px 14px;padding:11px 13px;background:#f8fafc;border-left:3px solid ${project.brandColor};border-radius:4px;font-size:12px">
              <div class="mono" style="font-size:10px;color:${project.brandColor};font-weight:700">VERIFIED COMPLIANCE EXCERPT</div>
              <div style="margin-top:3px">${esc(project.preview.snippet)}</div>
            </div>
          </div>

          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:12px">
            <div style="font-weight:700;font-size:13px">OJK &amp; Quality Rubric Breakdown</div>
            ${[
              { k: m0.label, v: m0.value, pct: 100, c: '#0f6f3c' },
              { k: m1.label, v: m1.value, pct: 96, c: project.brandColor },
              { k: 'Identity Verification (KYC)', v: '98.2%', pct: 98, c: '#0f6f3c' },
              { k: 'PII / OTP Audio Bleeping', v: '100% clean', pct: 100, c: '#0f6f3c' },
              { k: m2.label, v: m2.value, pct: 42, c: '#d97706' },
            ]
              .map(
                (r) => `<div>
                <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px">
                  <span>${esc(r.k)}</span><strong class="mono">${esc(r.v)}</strong>
                </div>
                <div style="height:7px;background:#eaecf0;border-radius:4px;overflow:hidden">
                  <div style="width:${r.pct}%;height:100%;background:${r.c}"></div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 5. CODE IDE & DIFF WORKBENCH — Dark Engineering IDE + Diff + Test Runner
export function renderCodeIdeDiff(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, true)}
    <div class="main">
      ${topbarHtml(project, true)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:#60a5fa">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#34d399">${esc(m1.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#fbbf24">${esc(m2.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Gate Verdict</div><div class="kpi-val" style="color:#34d399">ENFORCED</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.1fr 1.3fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Inspection Targets &amp; Checks</span><span class="mono sub-txt">4 ITEMS</span></div>
            <div style="padding:10px;display:flex;flex-direction:column;gap:8px;flex:1">
              ${items
                .map(
                  (it, i) => `<div style="padding:10px 12px;border-radius:5px;background:${i === 0 ? '#1b2436' : '#10141c'};border:1px solid ${i === 0 ? '#3b82f6' : '#242b3a'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
                    <span class="mono" style="font-size:11px;color:#60a5fa;font-weight:700">${esc(it.code)}</span>
                    ${statusPill(it.status, it.tone).dark}
                  </div>
                  <div style="font-weight:600;font-size:12px;color:#f1f5f9">${esc(it.title)}</div>
                  <div class="sub-txt" style="margin-top:2px">${esc(it.subtitle)}</div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div class="card" style="flex:1;display:flex;flex-direction:column">
              <div class="card-hd">
                <span class="mono" style="font-size:11.5px">${esc(project.name.toLowerCase().replace(/\s+/g, '-'))}/pipeline.diff</span>
                <span class="mono" style="font-size:10.5px;color:#34d399">UTF-8 · LF · STRICT</span>
              </div>
              <div class="mono" style="padding:14px;font-size:11.5px;line-height:1.65;background:#0b0e14;flex:1">
                <div style="color:#64748b">01  // ${esc(project.name)} — ${esc(project.tagline)}</div>
                <div style="color:#64748b">02  // Standards: ${esc(project.standards.join(', '))}</div>
                <div style="background:#2d1519;color:#fca5a5;padding:1px 6px;margin:4px 0">03 - [Legacy] Unverified direct execution / blocking schema lock</div>
                <div style="background:#102a1d;color:#6ee7b7;padding:1px 6px;margin:4px 0">04 + [Guarded] ${esc(project.architecture.core)}</div>
                <div style="background:#102a1d;color:#6ee7b7;padding:1px 6px;margin:4px 0">05 + [Integration] ${esc(project.architecture.integration)}</div>
                <div style="color:#93c5fd;margin-top:6px">06  policy.Enforce("${esc(items[0].code)}", strict: true);</div>
                <div style="color:#cbd5e1">07  // Output: ${esc(items[0].value)} -> ${esc(items[0].status)}</div>
              </div>
            </div>

            <div class="card">
              <div class="card-hd"><span class="mono" style="font-size:11px">TERMINAL · LIVE VERIFICATION GATE</span><span class="mono" style="color:#34d399;font-size:10.5px">EXIT 0</span></div>
              <pre class="mono" style="margin:0;padding:12px 14px;background:#080a0f;color:#e2e8f0;font-size:11px;line-height:1.55;white-space:pre-wrap">${esc(project.preview.snippet)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', true);
}

// 6. CLINICAL EMR WORKSTATION — Medical-grade Hospital EMR + Vitals + FHIR
export function renderClinicalEmr(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, false)}
    <div class="main">
      ${topbarHtml(project, false)}
      <div class="content">
        <div style="background:#ffffff;border:1px solid #d0d5dd;border-left:4px solid ${project.brandColor};border-radius:6px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:14px">
            <span class="avatar" style="width:38px;height:38px;font-size:13px;background:${project.brandColor}">BS</span>
            <div>
              <div style="font-size:15px;font-weight:700">Tn. Budi Santoso · 48 Th · Laki-laki <span class="mono sub-txt" style="margin-left:8px">RM-2026-008412 · IHS P1000482910</span></div>
              <div class="sub-txt" style="margin-top:2px">Penjamin: BPJS Kesehatan Kelas 1 (Aktif) · DPJP: dr. Hendra Wijaya, Sp.PD</div>
            </div>
          </div>
          <span class="pill" style="background:#fdebec;color:#b42318;border-color:#f6c0bc">ALERGI: PENICILLIN</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          <div class="kpi-card"><div><div class="kpi-lbl">Tekanan Darah</div><div class="kpi-val" style="color:#9a5500">138/84</div></div><span class="mono sub-txt">mmHg</span></div>
          <div class="kpi-card"><div><div class="kpi-lbl">Denyut Nadi / SpO2</div><div class="kpi-val" style="color:#0f6f3c">78 / 98%</div></div>${sparklineSvg([74, 76, 82, 79, 77, 78], project.brandColor, 64, 24)}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:${project.brandColor}">${esc(m0.value)}</div></div></div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val">${esc(m1.value)}</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:14px;flex:1;min-height:0">
          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Catatan Klinis Terstruktur (SOAP &amp; Diagnosis)</span><span class="pill" style="background:#e8f6ee;color:#0f6f3c">SATUSEHAT FHIR R4</span></div>
            <div style="padding:12px 14px;display:flex;flex-direction:column;gap:10px;flex:1">
              ${items
                .map(
                  (it) => `<div style="padding:11px 13px;border:1px solid #e4e7ec;border-radius:6px;background:#fafbfc;display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
                  <div style="display:flex;gap:10px">
                    <span class="mono" style="padding:2px 7px;background:${project.brandColor};color:#fff;border-radius:4px;font-size:10.5px;font-weight:700;height:fit-content">${esc(it.code)}</span>
                    <div>
                      <div style="font-weight:700;font-size:12.5px">${esc(it.title)}</div>
                      <div style="font-size:12px;color:#475467;margin-top:2px">${esc(it.subtitle)}</div>
                    </div>
                  </div>
                  <div style="text-align:right;flex-shrink:0">
                    <div class="mono" style="font-size:11px;font-weight:700;margin-bottom:3px">${esc(it.value)}</div>
                    ${statusPill(it.status, it.tone).light}
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>FHIR Bundle &amp; BPJS Interoperability</span><span class="mono sub-txt">${esc(m2.value)}</span></div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1">
              <div style="padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px">
                <div style="font-weight:700;color:#166534;font-size:12px">Kemenkes SATUSEHAT Sync Ready</div>
                <div class="sub-txt" style="color:#15803d;margin-top:2px">Encounter, Condition (ICD-10), Observation &amp; KFA MedicationRequest validated.</div>
              </div>
              <div style="padding:12px;background:#10141c;color:#cbd5e1;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:10.5px;line-height:1.55">
                ${esc(project.preview.snippet)}
              </div>
              <div style="font-size:11px;font-weight:700;color:#667085">CLINICAL SAFEGUARDS</div>
              ${project.features
                .slice(0, 3)
                .map((f) => `<div style="font-size:11.5px;padding:6px 0;border-bottom:1px solid #eaecf0;color:#344054">${esc(f)}</div>`)
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', false);
}

// 7. SOC THREAT OPS — Dark Security, Fraud & UU PDP Defense Console
export function renderSocThreatOps(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, true)}
    <div class="main">
      ${topbarHtml(project, true)}
      <div class="content">
        <div class="kpi-row">
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:#f87171">${esc(m0.value)}</div></div>${sparklineSvg([12, 19, 15, 28, 41, 37], '#f87171')}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#fbbf24">${esc(m1.value)}</div></div>${sparklineSvg([4, 3, 5, 2, 3, 2], '#fbbf24')}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#34d399">${esc(m2.value)}</div></div>${sparklineSvg([22, 24, 19, 18, 21, 19], '#34d399')}</div>
          <div class="kpi-card"><div><div class="kpi-lbl">Containment SLA</div><div class="kpi-val" style="color:#60a5fa">AUTO-GUARD</div></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:14px;flex:1;min-height:0">
          <div style="display:flex;flex-direction:column;gap:14px;min-height:0">
            <div class="card">
              <div class="card-hd"><span>Threat &amp; Anomaly Velocity (24h Rolling Window)</span><span class="mono" style="color:#f87171;font-size:10.5px">LIVE TELEMETRY</span></div>
              <div style="padding:10px 12px">${multiLineChartSvg([14, 18, 24, 62, 48, 39, 37], [12, 14, 15, 16, 15, 14, 14], ['00h', '04h', '08h', '12h', '16h', '20h', 'Now'], '#f87171', '#64748b', true)}</div>
            </div>

            <div class="card" style="flex:1">
              <div class="card-hd"><span>Active Security &amp; Compliance Incident Queue</span><span class="mono sub-txt">${esc(project.standards.join(' · '))}</span></div>
              <table class="dt">
                <thead><tr><th>Case</th><th>Detection &amp; Vector</th><th>Severity</th><th>Action</th></tr></thead>
                <tbody>
                  ${items
                    .map(
                      (it) => `<tr>
                      <td class="mono" style="font-weight:700;color:#93c5fd">${esc(it.code)}</td>
                      <td><div style="font-weight:600;color:#f8fafc">${esc(it.title)}</div><div class="sub-txt">${esc(it.subtitle)}</div></td>
                      <td class="mono" style="font-weight:700">${esc(it.value)}</td>
                      <td>${statusPill(it.status, it.tone).dark}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card" style="display:flex;flex-direction:column">
            <div class="card-hd"><span>Forensic Payload &amp; Playbook</span><span class="pill" style="background:#331416;color:#f87171">P1 ACTIVE</span></div>
            <div style="padding:14px;display:flex;flex-direction:column;gap:12px;flex:1">
              <div style="padding:12px;background:#090c11;border:1px solid #2b3242;border-radius:6px;font-family:Cascadia Mono,monospace;font-size:11px;line-height:1.55;color:#fca5a5">
                ${esc(project.preview.snippet)}
              </div>
              <div style="font-size:11px;font-weight:700;color:#8b95a7">AUTOMATED CONTAINMENT CONTROLS</div>
              ${project.features
                .map(
                  (f) => `<div style="padding:9px 10px;background:#10141d;border:1px solid #232a38;border-radius:5px;font-size:11.5px;color:#cbd5e1">${esc(f)}</div>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', true);
}

// 8. CCTV VISION GRID — Dark Edge AI 2x2 Industrial Camera Wall
export function renderCctvVisionGrid(project, spec) {
  const [m0, m1, m2] = project.preview.metrics;
  const items = project.preview.items;
  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#38bdf8'];
  const body = `<div class="app-shell">
    ${sidebarHtml(project, spec.nav, true)}
    <div class="main">
      ${topbarHtml(project, true)}
      <div class="content" style="display:grid;grid-template-columns:1.65fr 1fr;gap:14px">
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m0.label)}</div><div class="kpi-val" style="color:#34d399">${esc(m0.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m1.label)}</div><div class="kpi-val" style="color:#60a5fa">${esc(m1.value)}</div></div></div>
            <div class="kpi-card"><div><div class="kpi-lbl">${esc(m2.label)}</div><div class="kpi-val" style="color:#fbbf24">${esc(m2.value)}</div></div></div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1">
            ${items
              .map(
                (it, idx) => `<div class="card" style="padding:10px;display:flex;flex-direction:column;gap:8px">
                ${cctvSceneSvg(it.code, it.title.slice(0, 20), `${it.value} · ${it.meta || '94%'}`, colors[idx % 4])}
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="font-size:11.5px;font-weight:600">${esc(it.title)}</div>
                  ${statusPill(it.status, it.tone).dark}
                </div>
                <div class="sub-txt">${esc(it.subtitle)}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>

        <div class="card" style="display:flex;flex-direction:column">
          <div class="card-hd"><span>Edge Inference &amp; PLC Event Stream</span><span class="mono" style="color:#34d399;font-size:10px">ON-PREM GPU</span></div>
          <div style="padding:14px;display:flex;flex-direction:column;gap:10px;flex:1">
            <div style="padding:11px;background:#090c11;border:1px solid #2b3242;border-radius:5px;font-family:Cascadia Mono,monospace;font-size:10.5px;color:#fbbf24;line-height:1.5;overflow-wrap:anywhere;word-break:break-word">
              ${esc(project.preview.snippet)}
            </div>
            <div style="font-size:11px;font-weight:700;color:#8b95a7;margin-top:4px">ACTIVE DETECTION MODELS</div>
            ${project.features
              .map(
                (f, i) => `<div style="padding:10px;background:#10141d;border:1px solid #232a38;border-radius:5px">
                <div class="mono" style="font-size:10px;color:#60a5fa">MODEL-0${i + 1} · TENSORRT</div>
                <div style="font-size:11.5px;margin-top:3px;color:#e2e8f0">${esc(f)}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return wrapHtml(body, '', true);
}
