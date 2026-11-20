// Layouts C (4 desktop/analytical/admin + 6 completely distinct mobile/hardware compositions).
import { esc } from './svgGraphics.mjs';
import { donutRing, hashSeed, monogram, pageWrap, pill, qrBlock, sparkPath } from './layoutsCore.mjs';

export function renderLayoutC(layout, project, pageSpec, theme, font, persona) {
  const c = project.brandColor;
  const c2 = theme.accent2;
  const seed = hashSeed(project.id + pageSpec.slug);
  const items = project.preview.items;
  const [m0, m1, m2] = project.preview.metrics;

  // ---------------------------------------------------------------------------
  // 23. CALENDAR SCHEDULE WEEK (7-day time-grid scheduler with colored blocks)
  // ---------------------------------------------------------------------------
  if (layout === 'calendar-schedule-week') {
    const days = ['Sen 18', 'Sel 19', 'Rab 20', 'Kam 21', 'Jum 22', 'Sab 23'];
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const blocks = [
      { d: 0, top: 8, h: 118, col: c, title: items[0].title.slice(0, 22), sub: items[0].value },
      { d: 1, top: 70, h: 140, col: '#0f766e', title: items[1].title.slice(0, 22), sub: items[1].value },
      { d: 2, top: 24, h: 156, col: c, title: items[2].title.slice(0, 22), sub: items[2].status },
      { d: 2, top: 240, h: 112, col: '#d97706', title: `Review ${project.standards[0]}`, sub: m1.value },
      { d: 3, top: 110, h: 135, col: '#2563eb', title: items[3].title.slice(0, 22), sub: items[3].value },
      { d: 4, top: 48, h: 120, col: '#be185d', title: `Batch ${project.name.split(' ')[0]}`, sub: m0.value },
      { d: 5, top: 165, h: 115, col: '#16a34a', title: 'Audit & Rekonsiliasi', sub: '100% Siap' },
    ];

    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:56px;background:${theme.surface};border-bottom:1px solid ${theme.border};padding:0 24px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 30, 7)}
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)} · ${esc(pageSpec.title)}</strong>
            <div class="mono muted">NOVEMBER 2026 · WIB (UTC+7) · ${esc(persona)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">0 KONFLIK SLOT</span>
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;padding:18px 24px;display:grid;grid-template-columns:1fr 300px;gap:18px;overflow:hidden">
        <div class="card" style="display:flex;flex-direction:column">
          <div style="display:grid;grid-template-columns:68px repeat(6,1fr);background:${theme.surface2};border-bottom:1px solid ${theme.borderStrong};font-size:11.5px;font-weight:700">
            <div style="padding:10px 8px;border-right:1px solid ${theme.border};text-align:center" class="mono muted">WIB</div>
            ${days.map((d, i) => `<div style="padding:10px;text-align:center;border-right:1px solid ${theme.border};color:${i === 2 ? c : theme.text};background:${i === 2 ? theme.surface : 'transparent'}">${d}</div>`).join('')}
          </div>
          <div style="flex:1;display:grid;grid-template-columns:68px repeat(6,1fr);position:relative">
            <div style="border-right:1px solid ${theme.border};display:grid;grid-template-rows:repeat(7,1fr);background:${theme.surface2}">
              ${hours.map((h) => `<div class="mono muted" style="padding:6px 8px;font-size:10px;border-bottom:1px solid ${theme.border}">${h}</div>`).join('')}
            </div>
            ${days.map((_, di) => `
              <div style="position:relative;border-right:1px solid ${theme.border};display:grid;grid-template-rows:repeat(7,1fr)">
                ${hours.map(() => `<div style="border-bottom:1px solid ${theme.border}"></div>`).join('')}
                ${blocks.filter((b) => b.d === di).map((b) => `
                  <div style="position:absolute;left:5px;right:5px;top:${b.top}px;height:${b.h}px;background:${b.col};color:#fff;border-radius:7px;padding:9px 10px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 10px rgba(0,0,0,0.12)">
                    <div style="font-weight:700;font-size:11.5px;line-height:1.25">${esc(b.title)}</div>
                    <div class="mono" style="font-size:10px;opacity:0.9">${esc(b.sub)}</div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <aside class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
          <strong class="hd" style="font-size:15px">Detail Slot Aktif</strong>
          <div style="padding:13px;background:${c};color:#fff;border-radius:8px">
            <div class="mono" style="font-size:10px;opacity:0.85">RABU, 20 NOV · 09:00–12:00 WIB</div>
            <div style="font-weight:700;font-size:14px;margin-top:4px">${esc(items[0].title)}</div>
            <div style="font-size:11px;opacity:0.9;margin-top:3px">${esc(items[0].subtitle)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;flex:1">
            ${[m0, m1, m2].map((m) => `
              <div style="padding:10px 12px;background:${theme.surface2};border-radius:6px;display:flex;justify-content:space-between;align-items:center">
                <span class="muted">${esc(m.label)}</span>
                <strong class="mono" style="color:${c}">${esc(m.value)}</strong>
              </div>
            `).join('')}
          </div>
          <div style="padding:10px;background:#0e121a;color:#34d399;border-radius:6px;font-size:10px" class="mono">${esc(project.preview.snippet.slice(0, 120))}</div>
        </aside>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 24. EXECUTIVE BENTO BRIEF (Asymmetric editorial BI + 6-region Indonesia comparison + cohort)
  // ---------------------------------------------------------------------------
  if (layout === 'executive-bento-brief') {
    const regions = [
      { n: 'Jabodetabek', p: 92 },
      { n: 'Jawa Timur', p: 84 },
      { n: 'Jawa Barat', p: 78 },
      { n: 'Sumatera', p: 66 },
      { n: 'Kalimantan', p: 61 },
      { n: 'Sulawesi & Bali', p: 72 },
    ];
    const body = `<div style="width:1280px;height:800px;padding:22px 28px;display:flex;flex-direction:column;gap:16px;background:${theme.bg}">
      <header style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 34, 8)}
          <div>
            <div class="hd" style="font-size:21px;font-weight:700;letter-spacing:-0.02em">${esc(project.name)} — ${esc(pageSpec.title)}</div>
            <div class="mono muted">${esc(project.preview.envTag)} · ${esc(persona)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <span class="btn-s">${esc(project.preview.secondaryAction)}</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <div style="flex:1;display:grid;grid-template-columns:340px 1fr 330px;grid-template-rows:1.05fr 1fr;gap:16px;min-height:0">
        <!-- Giant Typographic Hero Tile -->
        <div class="card" style="padding:22px;background:${c};color:#fff;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div class="mono" style="font-size:10.5px;opacity:0.85">${esc(m0.label.toUpperCase())}</div>
            <div class="mono" style="font-size:40px;font-weight:700;margin-top:8px;letter-spacing:-0.03em">${esc(m0.value)}</div>
            <p style="margin:10px 0 0;font-size:12.5px;opacity:0.9;line-height:1.5">${esc(project.tagline)}</p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.22)">
            <div><div style="font-size:10px;opacity:0.8">${esc(m1.label)}</div><div class="mono" style="font-size:17px;font-weight:700">${esc(m1.value)}</div></div>
            <div><div style="font-size:10px;opacity:0.8">${esc(m2.label)}</div><div class="mono" style="font-size:17px;font-weight:700">${esc(m2.value)}</div></div>
          </div>
        </div>

        <!-- Trend Curve Card -->
        <div class="card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:15px">Pertumbuhan &amp; Efisiensi Kuartalan</strong>
            <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">+18.4% QoQ</span>
          </div>
          ${sparkPath([34, 41, 39, 56, 63, 72, 69, 86, 94], c, 510, 155)}
          <div class="mono muted" style="display:flex;justify-content:space-between;font-size:10px">
            <span>MAR</span><span>APR</span><span>MEI</span><span>JUN</span><span>JUL</span><span>AGS</span><span>SEP</span><span>OKT</span><span>NOV</span>
          </div>
        </div>

        <!-- Donut Efficiency Tile -->
        <div class="card" style="padding:18px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center">
          <strong class="hd" style="font-size:14.5px">Indeks Kinerja &amp; SLA</strong>
          ${donutRing(94, c, theme.border, 128, theme.text)}
          <div style="font-size:12px;color:${theme.muted}">${esc(project.standards.join(' · '))}</div>
        </div>

        <!-- 6-Region Indonesia Breakdown -->
        <div class="card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between">
          <strong class="hd" style="font-size:14.5px">Sebaran Regional Indonesia</strong>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${regions.map((r, i) => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px"><span>${r.n}</span><strong class="mono">${r.p}%</strong></div>
                <div style="height:7px;background:${theme.surface2};border-radius:4px;overflow:hidden"><div style="width:${r.p}%;height:100%;background:${i === 0 ? c : i < 3 ? '#0f766e' : c2}"></div></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Key Findings Grid -->
        <div class="card" style="grid-column:span 2;padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${items.map((it) => `
            <div style="padding:12px 14px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:8px;display:flex;flex-direction:column;justify-content:space-between">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="mono" style="font-size:10.5px;font-weight:700;color:${c}">${esc(it.code)}</span>
                ${pill(it.status, it.tone, theme.dark)}
              </div>
              <div style="font-weight:700;font-size:13px;margin:5px 0 2px">${esc(it.title)}</div>
              <div class="muted">${esc(it.subtitle)}</div>
              <div class="mono" style="margin-top:8px;font-weight:700;font-size:14px;color:${theme.text}">${esc(it.value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 25. AUDIT & COMPLIANCE DOSSIER (Official governance pillar scorecard + evidence seals)
  // ---------------------------------------------------------------------------
  if (layout === 'audit-compliance-dossier') {
    const pillars = [
      { n: `Pilar 1 · Kepatuhan ${project.standards[0]}`, pct: 98, st: 'Lulus Penuh' },
      { n: `Pilar 2 · Integritas Data & Residensi WIB`, pct: 94, st: 'Terverifikasi' },
      { n: `Pilar 3 · Keamanan Akses & Jejak Audit WORM`, pct: 91, st: 'Patuh' },
      { n: `Pilar 4 · Kesiapan Pelaporan & Bukti Dukung`, pct: 86, st: '1 Tindak Lanjut' },
    ];
    const body = `<div style="width:1280px;height:800px;display:flex;flex-direction:column;background:${theme.bg}">
      <header style="height:60px;background:${theme.sidebarBg};color:${theme.sidebarText};padding:0 28px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 32, 6)}
          <div>
            <strong class="hd" style="font-size:16px">${esc(project.name)} — ${esc(pageSpec.title)}</strong>
            <div class="mono" style="font-size:10px;opacity:0.8">DOSSIER AUDIT RESMI · ${esc(project.standards.join(' | '))}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="mono" style="padding:4px 10px;background:#16a34a;color:#fff;border-radius:4px;font-size:11px;font-weight:700">SKOR KEPATUHAN: 92.3 / 100</span>
          <span class="btn-p" style="background:${c}">${esc(project.preview.primaryAction)}</span>
        </div>
      </header>

      <main style="flex:1;padding:22px 28px;display:grid;grid-template-columns:1.25fr 1fr;gap:22px;overflow:hidden">
        <section class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:16px">Evaluasi Pilar &amp; Indikator Kepatuhan</strong>
            <span class="mono muted">${esc(persona)}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${pillars.map((pl, i) => `
              <div style="padding:14px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:8px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <strong style="font-size:13px">${esc(pl.n)}</strong>
                  <span class="mono" style="font-weight:700;color:${i === 3 ? '#d97706' : '#16a34a'}">${pl.pct}% · ${pl.st}</span>
                </div>
                <div style="height:10px;background:${theme.surface};border-radius:5px;overflow:hidden;border:1px solid ${theme.border}">
                  <div style="width:${pl.pct}%;height:100%;background:${i === 3 ? '#d97706' : c}"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:auto;padding:13px;background:#0e121a;color:#34d399;border-radius:7px;font-size:10.5px" class="mono">
            ${esc(project.preview.snippet)}
          </div>
        </section>

        <section style="display:flex;flex-direction:column;gap:16px">
          <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:10px;flex:1">
            <strong class="hd" style="font-size:15px">Bukti Dukung &amp; Lampiran Kriptografi</strong>
            ${items.map((it) => `
              <div style="padding:11px 12px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:7px;display:flex;justify-content:space-between;align-items:center;gap:10px">
                <div style="min-width:0">
                  <div style="font-weight:700;font-size:12.5px" class="clamp1">${esc(it.title)}</div>
                  <div class="muted clamp1">${esc(it.subtitle)}</div>
                </div>
                ${pill(it.status, it.tone, theme.dark)}
              </div>
            `).join('')}
          </div>
          <div class="card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;gap:14px">
            <div>
              <div class="mono" style="font-size:10px;color:${c};font-weight:700">VERIFIKASI DIGITAL · WORM SEAL</div>
              <div style="font-weight:700;font-size:13px;margin-top:3px">Siap Ekspor Dossier Auditor / Regulator</div>
              <div class="muted" style="margin-top:2px">SHA-256: 9bf56d1c...72bbd49a · WIB</div>
            </div>
            ${qrBlock(seed, 66)}
          </div>
        </section>
      </main>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 26. SETTINGS & RBAC MATRIX (Role-Permission table + API Keys + Webhook status)
  // ---------------------------------------------------------------------------
  if (layout === 'settings-rbac-matrix') {
    const perms = [
      `Kelola Modul ${project.name}`,
      `Eksekusi ${project.preview.primaryAction}`,
      `Verifikasi Standar ${project.standards[0]}`,
      `Akses Data PII / Ekspor Audit`,
      `Konfigurasi Webhook & API Keys`,
      `Override / Rollback Darurat`,
    ];
    const body = `<div style="width:1280px;height:800px;display:grid;grid-template-columns:235px 1fr;background:${theme.bg}">
      <aside style="background:${theme.surface};border-right:1px solid ${theme.border};padding:20px 16px;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid ${theme.border}">
          ${monogram(project.name, c, 30, 7)}
          <div><strong class="hd" style="font-size:14.5px">${esc(project.name)}</strong><div class="mono muted">PENGATURAN</div></div>
        </div>
        ${['Matriks Peran & RBAC', 'Kunci API & Sertifikat', 'Webhook & Integrasi', 'Kebijakan UU PDP', 'Audit Log Sistem', 'Penagihan & Kuota'].map((m, i) => `
          <div style="padding:9px 12px;border-radius:6px;font-size:12.5px;font-weight:${i === 0 ? 700 : 500};background:${i === 0 ? theme.surface2 : 'transparent'};color:${i === 0 ? c : theme.text};border-left:3px solid ${i === 0 ? c : 'transparent'}">${m}</div>
        `).join('')}
        <div style="margin-top:auto;padding-top:12px;border-top:1px solid ${theme.border};font-size:11px" class="muted">
          <div>Admin: <strong style="color:${theme.text}">${esc(persona)}</strong></div>
          <div class="mono" style="margin-top:4px">OIDC / SSO AKTIF</div>
        </div>
      </aside>

      <main style="padding:24px 30px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h1 class="hd" style="margin:0;font-size:21px">${esc(pageSpec.title)}</h1>
            <div class="muted">Kontrol akses berbasis peran (RBAC), kunci integrasi, dan residensi data Indonesia</div>
          </div>
          <span class="btn-p" style="background:${c}">Simpan Kebijakan</span>
        </div>

        <div class="card">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:${theme.surface2};border-bottom:1px solid ${theme.borderStrong};text-align:center">
                <th style="text-align:left;padding:11px 16px">HAK AKSES / KAPABILITAS</th>
                <th style="padding:11px 12px">SUPERADMIN</th>
                <th style="padding:11px 12px">APPROVER</th>
                <th style="padding:11px 12px">OPERATOR</th>
                <th style="padding:11px 12px">AUDITOR (RO)</th>
              </tr>
            </thead>
            <tbody>
              ${perms.map((p, r) => `
                <tr style="border-bottom:1px solid ${theme.border};text-align:center">
                  <td style="text-align:left;padding:11px 16px;font-weight:600">${esc(p)}</td>
                  <td><span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ Penuh</span></td>
                  <td>${r < 4 ? `<span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ Setuju</span>` : `<span class="muted">—</span>`}</td>
                  <td>${r < 2 ? `<span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">✓ Aksi</span>` : `<span class="muted">—</span>`}</td>
                  <td><span class="pill" style="background:#eef0f3;color:#475467;border-color:#d6dbe2">Baca Saja</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1">
          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">
            <strong class="hd" style="font-size:14px">Kunci Integrasi &amp; Token (${esc(project.standards[0])})</strong>
            <div style="padding:10px 12px;background:${theme.surface2};border-radius:6px;display:flex;justify-content:space-between" class="mono">
              <span>pk_live_${esc(project.id.toLowerCase())}_••••84a2</span><span style="color:#16a34a;font-weight:700">AKTIF</span>
            </div>
            <div style="padding:10px 12px;background:${theme.surface2};border-radius:6px;display:flex;justify-content:space-between" class="mono">
              <span>whsec_hmac_••••9bf5</span><span style="color:#16a34a;font-weight:700">TEROTASI</span>
            </div>
          </div>
          <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px">
            <strong class="hd" style="font-size:14px">Stack &amp; Kepatuhan Sistem</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${project.stack.map((s) => `<span class="pill" style="background:${theme.surface2};color:${theme.text};border-color:${theme.border}">${esc(s)}</span>`).join('')}
            </div>
            <div class="mono muted" style="margin-top:auto">${esc(project.preview.snippet.slice(0, 100))}</div>
          </div>
        </div>
      </main>
    </div>`.replace('{${\'\'}}', '');
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 27. MOBILE HERO + PHYSICAL EMBOSSED NFC/RFID SMARTCARD (Zero 2-phone clone!)
  // ---------------------------------------------------------------------------
  if (layout === 'mobile-hero-nfc-card') {
    const body = `<div style="width:1280px;height:800px;padding:34px 48px;display:grid;grid-template-columns:1.05fr 350px 330px;gap:30px;align-items:center;background:${theme.bg}">
      <!-- Left Physical Embossed Smartcard + Editorial Spec -->
      <div style="display:flex;flex-direction:column;gap:22px">
        <div>
          <span class="mono" style="font-size:11px;font-weight:700;color:${c}">${esc(project.id)} · ${esc(pageSpec.title.toUpperCase())}</span>
          <h1 class="hd" style="margin:6px 0 10px;font-size:32px;line-height:1.15">${esc(project.name)}</h1>
          <p style="margin:0;font-size:14px;color:${theme.muted};line-height:1.55">${esc(project.summary)}</p>
        </div>

        <!-- Physical Embossed NFC / RFID Smartcard -->
        <div style="width:410px;height:248px;border-radius:18px;background:linear-gradient(135deg,${c} 0%,#0f172a 100%);color:#fff;padding:24px 26px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 22px 44px rgba(0,0,0,0.22);position:relative;overflow:hidden">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:18px;letter-spacing:0.02em">${esc(project.name)}</strong>
            <span class="mono" style="font-size:10.5px;padding:3px 9px;background:rgba(255,255,255,0.18);border-radius:12px">${esc(project.standards[0])}</span>
          </div>
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:46px;height:34px;border-radius:6px;background:linear-gradient(135deg,#facc15,#ca8a04);border:1px solid rgba(255,255,255,0.4)"></div>
            <span class="mono" style="font-size:11px;opacity:0.8">NFC TAP · CONTACTLESS READY</span>
          </div>
          <div>
            <div class="mono" style="font-size:17px;letter-spacing:0.14em;font-weight:700">6281 •••• •••• ${1000 + (seed % 8999)}</div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;opacity:0.85">
              <span>${esc(persona.toUpperCase())}</span>
              <span class="mono">EXP 11/29</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${project.standards.map((s) => `<span class="pill" style="background:${theme.surface};border-color:${theme.borderStrong};color:${theme.text}">${esc(s)}</span>`).join('')}
        </div>
      </div>

      <!-- Center Sleek Single Phone Frame -->
      <div style="height:690px;background:${theme.surface};border:7px solid #18181b;border-radius:36px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,0.18)">
        <div style="height:28px;background:#18181b;color:#fff;padding:0 20px;display:flex;justify-content:space-between;align-items:center;font-size:10px" class="mono">
          <span>09:41 WIB</span><span>5G · NFC</span>
        </div>
        <div style="padding:20px 18px;background:${c};color:#fff">
          <div class="mono" style="font-size:10px;opacity:0.85">${esc(m0.label.toUpperCase())}</div>
          <div class="mono" style="font-size:28px;font-weight:700;margin-top:4px">${esc(m0.value)}</div>
          <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="padding:8px;background:#fff;color:${c};border-radius:7px;text-align:center;font-weight:700;font-size:11.5px">${esc(project.preview.primaryAction)}</div>
            <div style="padding:8px;background:rgba(255,255,255,0.18);color:#fff;border-radius:7px;text-align:center;font-weight:600;font-size:11.5px">${esc(project.preview.secondaryAction)}</div>
          </div>
        </div>
        <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:9px;background:${theme.surface2}">
          <div class="mono muted" style="font-size:10px;font-weight:700">TRANSAKSI &amp; TAP TERKINI</div>
          ${items.map((it) => `
            <div style="padding:10px 12px;background:${theme.surface};border:1px solid ${theme.border};border-radius:9px;display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div style="min-width:0"><div style="font-weight:700;font-size:12px" class="clamp1">${esc(it.title)}</div><div class="muted clamp1">${esc(it.subtitle)}</div></div>
              <div style="text-align:right;flex-shrink:0"><div class="mono" style="font-weight:700;font-size:11.5px;color:${c}">${esc(it.value)}</div>${pill(it.status, it.tone, theme.dark)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Live Receipt & Telemetry Card -->
      <aside class="card" style="padding:20px;display:flex;flex-direction:column;gap:14px;height:690px">
        <div style="text-align:center;padding-bottom:14px;border-bottom:1px dashed ${theme.borderStrong}">
          <div style="width:46px;height:46px;margin:0 auto;border-radius:23px;background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700">✓</div>
          <div class="hd" style="font-size:16px;font-weight:700;margin-top:8px">Tap / Transaksi Berhasil</div>
          <div class="mono muted">Sub-detik · 240 ms · WIB</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:9px;font-size:12px">
          <div style="display:flex;justify-content:space-between"><span class="muted">Kode Referensi</span><strong class="mono">${esc(items[0].code)}</strong></div>
          <div style="display:flex;justify-content:space-between"><span class="muted">${esc(m1.label)}</span><strong class="mono">${esc(m1.value)}</strong></div>
          <div style="display:flex;justify-content:space-between"><span class="muted">${esc(m2.label)}</span><strong class="mono" style="color:${c}">${esc(m2.value)}</strong></div>
        </div>
        <div style="margin:8px auto">${qrBlock(seed, 118)}</div>
        <div style="margin-top:auto;padding:12px;background:#0e121a;color:#34d399;border-radius:7px;font-size:10px;line-height:1.5" class="mono">
          ${esc(project.preview.snippet)}
        </div>
      </aside>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 28. MOBILE TRIO JOURNEY (3-step horizontal user flow across 3 connected phones)
  // ---------------------------------------------------------------------------
  if (layout === 'mobile-trio-journey') {
    const steps = [
      { n: '01', lbl: 'Pilih & Pindai', title: items[0].title, val: m0.value, cta: project.preview.primaryAction },
      { n: '02', lbl: 'Konfirmasi & Bayar', title: items[1].title, val: items[0].value, cta: 'Konfirmasi Biometrik' },
      { n: '03', lbl: 'Bukti & Status Live', title: items[2].title, val: 'TERVERIFIKASI', cta: 'Unduh Bukti PDF' },
    ];
    const body = `<div style="width:1280px;height:800px;padding:24px 36px;display:flex;flex-direction:column;gap:20px;background:${theme.bg}">
      <header style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:12px">
          ${monogram(project.name, c, 34, 9)}
          <div>
            <strong class="hd" style="font-size:20px">${esc(project.name)} — Alur Pengguna Mobile (${esc(pageSpec.title)})</strong>
            <div class="mono muted">${esc(persona)} · ${esc(project.standards.join(' · '))}</div>
          </div>
        </div>
        <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">3 LANGKAH END-TO-END</span>
      </header>

      <div style="flex:1;display:grid;grid-template-columns:1fr 34px 1fr 34px 1fr;align-items:center">
        ${steps.map((st, idx) => `
          <div style="height:640px;background:${theme.surface};border:6px solid ${theme.dark ? '#334155' : '#1f2937'};border-radius:32px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 18px 36px rgba(0,0,0,0.14)">
            <div style="height:26px;background:#1f2937;color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px" class="mono">
              <span>09:4${idx + 1}</span><span>LANGKAH ${st.n}</span>
            </div>
            <div style="padding:16px;background:${idx === 2 ? '#16a34a' : c};color:#fff">
              <div class="mono" style="font-size:10px;opacity:0.85">TAHAP ${st.n} · ${st.lbl.toUpperCase()}</div>
              <div class="hd" style="font-size:17px;font-weight:700;margin-top:4px">${esc(st.title.slice(0, 32))}</div>
              <div class="mono" style="font-size:22px;font-weight:700;margin-top:8px">${esc(st.val)}</div>
            </div>
            <div style="padding:14px;flex:1;background:${theme.surface2};display:flex;flex-direction:column;gap:10px">
              ${idx === 1
                ? `<div style="padding:12px;background:${theme.surface};border-radius:9px;text-align:center;border:1px solid ${theme.border}">
                    <div style="display:flex;justify-content:center">${qrBlock(seed + idx, 118)}</div>
                    <div style="font-weight:700;font-size:12px;margin-top:8px">Scan QRIS / Konfirmasi PIN</div>
                    <div class="muted">${esc(project.standards[0])}</div>
                  </div>`
                : items.slice(0, 3).map((it) => `
                  <div style="padding:10px;background:${theme.surface};border:1px solid ${theme.border};border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                    <div style="min-width:0"><div style="font-weight:700;font-size:11.5px" class="clamp1">${esc(it.title)}</div><div class="muted clamp1">${esc(it.subtitle)}</div></div>
                    <strong class="mono" style="font-size:11px;color:${c};flex-shrink:0">${esc(it.value)}</strong>
                  </div>
                `).join('')
              }
              <div style="margin-top:auto;padding:11px;background:${idx === 2 ? '#16a34a' : c};color:#fff;border-radius:8px;text-align:center;font-weight:700;font-size:12px">${esc(st.cta)}</div>
            </div>
          </div>
          ${idx < 2 ? `<div style="text-align:center;font-size:22px;font-weight:700;color:${c}" class="mono">-&gt;</div>` : ''}
        `).join('')}
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 29. MOBILE FIELD TABLET SPLIT (Rugged landscape field tablet for offline ops)
  // ---------------------------------------------------------------------------
  if (layout === 'mobile-field-tablet-split') {
    const body = `<div style="width:1280px;height:800px;padding:28px 36px;display:flex;align-items:center;justify-content:center;background:${theme.bg}">
      <div style="width:1200px;height:730px;background:#181b20;border-radius:28px;padding:18px;box-shadow:0 26px 56px rgba(0,0,0,0.28);display:flex">
        <div style="flex:1;background:${theme.surface};border-radius:14px;overflow:hidden;display:flex;flex-direction:column">
          <div style="height:36px;background:${c};color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:11px" class="mono">
            <span>TABLET LAPANGAN · ${esc(project.name.toUpperCase())} (${esc(pageSpec.title.toUpperCase())})</span>
            <span>OFFLINE SQLITE: 4 ANTREAN · GPS LOCKED · BATERAI 88%</span>
          </div>

          <div style="flex:1;padding:18px 22px;display:grid;grid-template-columns:1.15fr 1fr;gap:20px;overflow:hidden">
            <div style="display:flex;flex-direction:column;gap:14px">
              <div style="padding:16px;background:${theme.surface2};border:1px solid ${theme.border};border-radius:10px;display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div class="mono muted">${esc(persona)}</div>
                  <div class="hd" style="font-size:20px;font-weight:700;margin-top:2px">${esc(project.preview.surfaceTitle)}</div>
                </div>
                <span class="btn-p" style="background:${c};padding:10px 18px">${esc(project.preview.primaryAction)}</span>
              </div>

              <!-- Big Field Action Tiles (Glove-Friendly) -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                ${items.map((it, i) => `
                  <div style="padding:14px;background:${theme.surface};border:2px solid ${i === 0 ? c : theme.border};border-radius:10px;display:flex;flex-direction:column;gap:6px">
                    <div style="display:flex;justify-content:space-between;align-items:center"><span class="mono" style="font-size:11px;font-weight:700;color:${c}">${esc(it.code)}</span>${pill(it.status, it.tone, theme.dark)}</div>
                    <div style="font-weight:700;font-size:13.5px">${esc(it.title)}</div>
                    <div class="muted">${esc(it.subtitle)}</div>
                    <div class="mono" style="font-size:15px;font-weight:700;margin-top:4px">${esc(it.value)}</div>
                  </div>
                `).join('')}
              </div>

              <div style="margin-top:auto;padding:12px 14px;background:#0e121a;color:#34d399;border-radius:8px;font-size:10.5px" class="mono">
                ${esc(project.preview.snippet)}
              </div>
            </div>

            <!-- Right Offline Photo/Barcode Capture & Sync Queue -->
            <div style="display:flex;flex-direction:column;gap:14px">
              <div style="height:260px;background:#0d131a;border-radius:10px;border:2px solid #2b384c;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e2e8f0">
                <div style="width:210px;height:130px;border:2.5px dashed #38bdf8;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
                  <span class="mono" style="font-size:11px;color:#38bdf8;font-weight:700">KAMERA BUKTI &amp; QR SCAN</span>
                  <strong class="mono" style="font-size:16px">${esc(items[0].code)} TERDETEKSI</strong>
                  <span class="mono" style="font-size:10px;color:#34d399">LAT -6.2088 · LNG 106.8456</span>
                </div>
                <span class="mono" style="position:absolute;bottom:10px;right:14px;font-size:10px;color:#94a3b8">WATERMARK GPS + WIB AKTIF</span>
              </div>

              <div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:10px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong class="hd" style="font-size:14px">Status Sinkronisasi &amp; Kuota</strong>
                  <span class="pill" style="background:#e6f6ed;color:#0e6d3b;border-color:#b7e4cb">DELTA SYNC SIAP</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                  ${[m0, m1, m2].map((m) => `<div style="padding:10px;background:${theme.surface2};border-radius:7px"><div class="muted">${esc(m.label)}</div><div class="mono" style="font-weight:700;font-size:14px;color:${c}">${esc(m.value)}</div></div>`).join('')}
                </div>
                <div style="margin-top:auto;padding:12px;background:#16a34a;color:#fff;border-radius:8px;text-align:center;font-weight:700;font-size:13px">
                  Sinkronkan Semua Data Offline Sekarang
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 30. MOBILE BOARDING PASS & TICKET WALLET (Perforated ticket + lockscreen live alert)
  // ---------------------------------------------------------------------------
  if (layout === 'mobile-boarding-ticket') {
    const body = `<div style="width:1280px;height:800px;padding:30px 44px;display:grid;grid-template-columns:400px 380px 1fr;gap:30px;align-items:center;background:${theme.bg}">
      <!-- Left Perforated E-Boarding Pass / Digital Voucher -->
      <div style="background:${theme.surface};border:1.5px solid ${theme.borderStrong};border-radius:20px;overflow:hidden;box-shadow:0 20px 44px rgba(0,0,0,0.12);position:relative">
        <div style="padding:22px 24px;background:${c};color:#fff">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:18px">${esc(project.name)}</strong>
            <span class="mono" style="padding:3px 9px;background:rgba(255,255,255,0.2);border-radius:10px;font-size:10px">PASS TERPADU</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px">
            <div><div class="mono" style="font-size:26px;font-weight:700">${esc(items[0].code)}</div><div style="font-size:11px;opacity:0.85">Asal / Gerbang</div></div>
            <div class="mono" style="font-size:18px;opacity:0.8">---&gt;</div>
            <div style="text-align:right"><div class="mono" style="font-size:26px;font-weight:700">${esc(items[1].code)}</div><div style="font-size:11px;opacity:0.85">Tujuan / Status</div></div>
          </div>
        </div>

        <div style="padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:14px;border-bottom:2px dashed ${theme.borderStrong}">
          <div><div class="muted">Pemegang / Akses</div><div style="font-weight:700;font-size:13px">${esc(persona)}</div></div>
          <div><div class="muted">${esc(m0.label)}</div><div class="mono" style="font-weight:700;font-size:14px;color:${c}">${esc(m0.value)}</div></div>
          <div><div class="muted">${esc(m1.label)}</div><div class="mono" style="font-weight:700;font-size:13px">${esc(m1.value)}</div></div>
          <div><div class="muted">${esc(m2.label)}</div><div class="mono" style="font-weight:700;font-size:13px">${esc(m2.value)}</div></div>
        </div>

        <div style="padding:22px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;background:${theme.surface2}">
          ${qrBlock(seed, 148, '#0f172a')}
          <div class="mono" style="font-size:11px;font-weight:700;color:${c}">QR DINAMIS · ${esc(project.standards[0])}</div>
          <div class="muted" style="text-align:center">${esc(items[0].title)}</div>
        </div>
      </div>

      <!-- Center Dark Lockscreen Live Activity Notification -->
      <div style="height:680px;background:linear-gradient(160deg,#0f172a 0%,#1e1b4b 100%);border:7px solid #18181b;border-radius:36px;padding:24px 20px;color:#fff;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 24px 48px rgba(0,0,0,0.22)">
        <div style="text-align:center;margin-top:16px">
          <div style="font-size:13px;opacity:0.75">Kamis, 20 November</div>
          <div class="mono" style="font-size:58px;font-weight:700;letter-spacing:-0.04em;line-height:1.05;margin-top:4px">09:41</div>
        </div>

        <!-- Live Activity Pill Card -->
        <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="mono" style="font-size:10.5px;color:#38bdf8;font-weight:700">● LIVE ACTIVITY · ${esc(project.name.toUpperCase())}</span>
            <span class="mono" style="font-size:10.5px;color:#34d399">ON TIME</span>
          </div>
          <div style="font-weight:700;font-size:14.5px">${esc(items[0].title)}</div>
          <div style="height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden"><div style="width:72%;height:100%;background:#38bdf8"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.85">
            <span>${esc(items[0].value)}</span>
            <span>${esc(items[1].status)}</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:9px">
          ${items.slice(1, 3).map((it) => `
            <div style="background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:12px 14px">
              <div style="font-size:11.5px;font-weight:700">${esc(it.title)}</div>
              <div style="font-size:10.5px;opacity:0.78;margin-top:2px">${esc(it.subtitle)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Itinerary & Timeline -->
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="hd" style="font-size:22px;font-weight:700">${esc(pageSpec.title)}</div>
        <p class="muted" style="margin:0;font-size:13px;line-height:1.55">${esc(project.indonesiaContext)}</p>
        <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
          ${items.map((it, i) => `
            <div style="display:flex;gap:12px;align-items:flex-start">
              <span class="mono" style="width:24px;height:24px;border-radius:12px;background:${i === 0 ? c : '#16a34a'};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${i + 1}</span>
              <div>
                <div style="font-weight:700;font-size:12.5px">${esc(it.title)}</div>
                <div class="muted">${esc(it.subtitle)} · <strong>${esc(it.value)}</strong></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 31. MOBILE CHAT & COMMERCE FEED (Consumer Indonesian app + order tracker)
  // ---------------------------------------------------------------------------
  if (layout === 'mobile-chat-commerce') {
    const body = `<div style="width:1280px;height:800px;padding:28px 42px;display:grid;grid-template-columns:360px 1fr;gap:32px;align-items:center;background:${theme.bg}">
      <div style="height:710px;background:${theme.surface};border:7px solid #18181b;border-radius:36px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 22px 46px rgba(0,0,0,0.18)">
        <div style="height:26px;background:#18181b;color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px" class="mono"><span>14:20 WIB</span><span>4G+ · 94%</span></div>
        <div style="padding:16px;background:${c};color:#fff">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong class="hd" style="font-size:16px">${esc(project.name)}</strong>
            <span class="mono" style="font-size:10px;padding:2px 8px;background:rgba(255,255,255,0.2);border-radius:10px">RESMI</span>
          </div>
          <div style="margin-top:10px;padding:8px 12px;background:#fff;color:#64748b;border-radius:8px;font-size:11.5px">Cari di ${esc(project.name)}...</div>
        </div>
        <!-- 4 Quick Category Bubbles -->
        <div style="padding:12px 14px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:${theme.surface};border-bottom:1px solid ${theme.border};text-align:center;font-size:10px;font-weight:600">
          ${['Pesan', 'Scan QR', 'Promo', 'Riwayat'].map((lb, i) => `
            <div><div style="width:38px;height:38px;margin:0 auto 4px;border-radius:12px;background:${i === 0 ? c : theme.surface2};color:${i === 0 ? '#fff' : c};display:flex;align-items:center;justify-content:center;font-weight:700" class="mono">0${i + 1}</div>${lb}</div>
          `).join('')}
        </div>
        <!-- Product / Feed List -->
        <div style="padding:12px 14px;flex:1;background:${theme.surface2};display:flex;flex-direction:column;gap:9px;overflow:hidden">
          ${items.map((it) => `
            <div style="padding:10px 12px;background:${theme.surface};border:1px solid ${theme.border};border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div style="min-width:0"><div style="font-weight:700;font-size:12px" class="clamp1">${esc(it.title)}</div><div class="muted clamp1">${esc(it.subtitle)}</div></div>
              <div style="text-align:right;flex-shrink:0"><div class="mono" style="font-weight:700;font-size:11.5px;color:${c}">${esc(it.value)}</div>${pill(it.status, it.tone, theme.dark)}</div>
            </div>
          `).join('')}
        </div>
        <div style="height:48px;background:${theme.surface};border-top:1px solid ${theme.border};display:grid;grid-template-columns:repeat(4,1fr);align-items:center;text-align:center;font-size:10.5px;font-weight:600">
          <span style="color:${c}">Beranda</span><span class="muted">Pesanan</span><span class="muted">Chat</span><span class="muted">Akun</span>
        </div>
      </div>

      <!-- Right Live Fulfillment & Analytics Companion -->
      <div style="display:flex;flex-direction:column;gap:18px;height:710px">
        <div>
          <span class="mono" style="font-size:11px;font-weight:700;color:${c}">${esc(project.id)} · ${esc(pageSpec.title.toUpperCase())}</span>
          <h1 class="hd" style="margin:4px 0 8px;font-size:28px">${esc(project.preview.surfaceTitle)}</h1>
          <p class="muted" style="margin:0;font-size:13.5px;line-height:1.55">${esc(project.summary)}</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
          ${[m0, m1, m2].map((m) => `
            <div class="card" style="padding:14px 16px"><div class="muted">${esc(m.label)}</div><div class="mono" style="font-size:20px;font-weight:700;color:${c};margin-top:4px">${esc(m.value)}</div></div>
          `).join('')}
        </div>

        <div class="card" style="padding:18px;flex:1;display:flex;flex-direction:column;gap:12px">
          <strong class="hd" style="font-size:15px">Linimasa Pesanan &amp; Penyelesaian</strong>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
            ${['Dipesan', 'Diproses', 'Dalam Pengiriman', 'Selesai & QRIS'].map((st, i) => `
              <div style="padding:12px;background:${i < 3 ? theme.surface2 : c};color:${i < 3 ? theme.text : '#fff'};border-radius:8px;border:1px solid ${i < 3 ? theme.border : c}">
                <div class="mono" style="font-size:10px;opacity:0.8">TAHAP 0${i + 1}</div>
                <div style="font-weight:700;font-size:12.5px;margin-top:4px">${st}</div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:auto;padding:14px;background:#0e121a;color:#34d399;border-radius:8px;font-size:10.5px;line-height:1.55" class="mono">
            ${esc(project.preview.snippet)}
          </div>
        </div>
      </div>
    </div>`.replace('{${\'\'}}', '');
    return pageWrap(body, theme, font);
  }

  // ---------------------------------------------------------------------------
  // 32. MOBILE BIOMETRIC WALLET & GOAL SIMULATOR (Donut + slider + instant BI-FAST)
  // ---------------------------------------------------------------------------
  const body = `<div style="width:1280px;height:800px;padding:30px 44px;display:grid;grid-template-columns:1fr 370px;gap:34px;align-items:center;background:${theme.bg}">
    <div style="display:flex;flex-direction:column;gap:18px">
      <div>
        <span class="mono" style="font-size:11px;font-weight:700;color:${c}">${esc(project.id)} · ${esc(pageSpec.title.toUpperCase())}</span>
        <h1 class="hd" style="margin:6px 0 10px;font-size:32px;line-height:1.15">${esc(project.name)}</h1>
        <p class="muted" style="margin:0;font-size:14px;line-height:1.55">${esc(project.indonesiaContext)}</p>
      </div>

      <!-- Interactive Financial / Goal Slider Card -->
      <div class="card" style="padding:22px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <strong class="hd" style="font-size:16px">Simulasi Cepat · ${esc(m0.label)}</strong>
          <span class="mono" style="font-size:24px;font-weight:700;color:${c}">${esc(m0.value)}</span>
        </div>
        <div style="height:12px;background:${theme.surface2};border-radius:6px;position:relative;border:1px solid ${theme.border}">
          <div style="width:68%;height:100%;background:${c};border-radius:6px"></div>
          <div style="position:absolute;left:68%;top:-6px;width:24px;height:24px;border-radius:12px;background:#fff;border:4px solid ${c};transform:translateX(-50%)"></div>
        </div>
        <div style="display:flex;justify-content:space-between" class="mono muted">
          <span>Min: Rp 100.000</span><span>Biaya Admin Flat · 0% Bunga</span><span>Maks: ${esc(m1.value)}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${project.features.map((f, i) => `
          <div class="card" style="padding:12px 14px;border-left:3px solid ${i % 2 === 0 ? c : c2};font-size:12px">${esc(f)}</div>
        `).join('')}
      </div>
    </div>

    <!-- Single Modern Goal-Driven Wallet Phone -->
    <div style="height:700px;background:${theme.surface};border:7px solid #18181b;border-radius:36px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,0.18)">
      <div style="height:26px;background:#18181b;color:#fff;padding:0 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px" class="mono"><span>09:41 WIB</span><span>BI-FAST READY</span></div>
      <div style="padding:20px;display:flex;flex-direction:column;align-items:center;text-align:center;background:${theme.surface2};border-bottom:1px solid ${theme.border}">
        <div class="mono" style="font-size:10px;color:${c};font-weight:700;margin-bottom:8px">${esc(project.standards[0])}</div>
        ${donutRing(74, c, theme.border, 120, theme.text)}
        <div class="hd" style="font-size:18px;font-weight:700;margin-top:8px">${esc(m0.value)}</div>
        <div class="muted">${esc(m1.label)}: ${esc(m1.value)}</div>
      </div>
      <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:9px">
        ${items.slice(0, 3).map((it) => `
          <div style="padding:10px 12px;background:${theme.surface2};border-radius:9px;display:flex;justify-content:space-between;align-items:center">
            <div style="min-width:0"><div style="font-weight:700;font-size:12px" class="clamp1">${esc(it.title)}</div><div class="muted clamp1">${esc(it.subtitle)}</div></div>
            <strong class="mono" style="font-size:11.5px;color:${c};flex-shrink:0">${esc(it.value)}</strong>
          </div>
        `).join('')}
        <div style="margin-top:auto;padding:12px;background:${c};color:#fff;border-radius:10px;text-align:center;font-weight:700;font-size:13px">
          ${esc(project.preview.primaryAction)} (Face ID)
        </div>
      </div>
    </div>
  </div>`;
  return pageWrap(body, theme, font);
}
