import React from 'react';
import type { ConceptProject } from '../data/projects';

interface MiniPreviewProps {
  project: ConceptProject;
}

const toneColor = (tone?: 'neutral' | 'ok' | 'warn' | 'bad') => {
  if (tone === 'ok') return 'var(--ui-ok)';
  if (tone === 'warn') return 'var(--ui-warn)';
  if (tone === 'bad') return 'var(--ui-bad)';
  return 'var(--ui-text-muted)';
};

export const MiniPreview: React.FC<MiniPreviewProps> = ({ project }) => {
  const { archetype, brandColor, preview } = project;
  const [m0, m1, m2] = preview.metrics;
  const [i0, i1, i2, i3] = preview.items;

  if (archetype === 'mobile-superapp') {
    return (
      <div className="mini-frame">
        <div className="mini-phone-stage">
          <div className="mini-phone">
            <div className="mini-phone-head" style={{ background: brandColor }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </span>
              <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '9px' }}>{m0.value}</span>
            </div>
            <div className="mini-phone-row" style={{ background: 'var(--ui-surface-2)' }}>
              <span style={{ color: 'var(--ui-text-muted)' }}>{m1.label}</span>
              <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600 }}>{m1.value}</span>
            </div>
            {[i0, i1, i2].map((it) => (
              <div className="mini-phone-row" key={it.code}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.title}
                </span>
                <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone), flexShrink: 0 }}>
                  {it.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'terminal-cli') {
    return (
      <div className="mini-frame mini-term">
        <div className="mini-bar">
          <span className="mini-bar-title">$ {project.name.toLowerCase().replace(/\s+/g, '')}</span>
          <span style={{ color: '#34c279', fontSize: '9px' }}>{m0.value}</span>
        </div>
        <div className="mini-body" style={{ gap: '4px' }}>
          <div style={{ color: '#7cb0ff', fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {preview.snippet.split('\n')[0]}
          </div>
          {[i0, i1, i2].map((it) => (
            <div
              key={it.code}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '6px',
                borderBottom: '1px solid var(--ui-term-line)',
                paddingBottom: '3px',
              }}
            >
              <span style={{ color: 'var(--ui-term-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                [{it.code}] {it.title}
              </span>
              <span style={{ color: it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#34c279', flexShrink: 0 }}>
                {it.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'geo-dispatch') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{preview.surfaceTitle}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div style={{ flex: 1, position: 'relative', background: 'var(--ui-surface-2)' }}>
          <svg viewBox="0 0 320 140" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <path d="M0 35H320M0 70H320M0 105H320M64 0V140M128 0V140M192 0V140M256 0V140" stroke="var(--ui-line)" strokeWidth="1" />
            <path d="M26 104 L98 74 L176 82 L248 44 L294 52" fill="none" stroke={brandColor} strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="98" cy="74" r="5" fill={brandColor} />
            <circle cx="176" cy="82" r="5" fill={i1.tone === 'bad' ? '#b42318' : i1.tone === 'warn' ? '#9a5b00' : '#117a43'} />
            <circle cx="248" cy="44" r="5" fill={brandColor} />
            <rect x="12" y="10" width="128" height="22" rx="3" fill="var(--ui-surface)" stroke="var(--ui-line-strong)" />
            <text x="18" y="24" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text)">
              {i0.code}: {i0.status}
            </text>
            <rect x="172" y="104" width="136" height="24" rx="3" fill="var(--ui-surface)" stroke="var(--ui-line-strong)" />
            <text x="178" y="119" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text-2)">
              {m1.label}: {m1.value}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (archetype === 'iot-scada') {
    return (
      <div className="mini-frame mini-term">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name} SCADA</span>
          <span style={{ color: '#eab308', fontSize: '9px' }}>{m0.value}</span>
        </div>
        <div style={{ flex: 1, padding: '6px' }}>
          <svg viewBox="0 0 300 120" width="100%" height="100%">
            <line x1="76" y1="36" x2="112" y2="36" stroke="#4c8dff" strokeWidth="1.5" />
            <line x1="188" y1="36" x2="224" y2="36" stroke="#34c279" strokeWidth="1.5" />
            <rect x="8" y="14" width="68" height="44" rx="3" fill="#1e2128" stroke="#3f454f" />
            <text x="14" y="30" fontSize="8.5" fill="#949ba8">{i0.code}</text>
            <text x="14" y="47" fontSize="10" fontWeight="600" fill="#e6e8ec">{i0.value}</text>
            <rect x="112" y="14" width="76" height="44" rx="3" fill="#1e2128" stroke={i1.tone === 'bad' ? '#f97066' : '#eab308'} />
            <text x="118" y="30" fontSize="8.5" fill="#949ba8">{i1.code}</text>
            <text x="118" y="47" fontSize="10" fontWeight="600" fill={i1.tone === 'bad' ? '#f97066' : '#eab308'}>{i1.value}</text>
            <rect x="224" y="14" width="68" height="44" rx="3" fill="#1e2128" stroke="#34c279" />
            <text x="230" y="30" fontSize="8.5" fill="#949ba8">{i2.code}</text>
            <text x="230" y="47" fontSize="10" fontWeight="600" fill="#34c279">{i2.value}</text>
            <rect x="8" y="74" width="284" height="34" rx="3" fill="#171a20" stroke="#2d313b" />
            <text x="16" y="95" fontSize="9" fill="#949ba8">
              {m1.label}: {m1.value}  |  {m2.label}: {m2.value}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (archetype === 'bi-analytics') {
    const heights = [34, 52, 44, 68, 58, 76, 62];
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          <div className="mini-kpi-strip">
            {[m0, m1, m2].map((m) => (
              <div className="mini-kpi-box" key={m.label}>
                <div className="mini-kpi-lbl">{m.label}</div>
                <div className="mini-kpi-val" style={{ color: m.tone && m.tone !== 'neutral' ? toneColor(m.tone) : 'var(--ui-text)' }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 280 76" width="100%" height="76">
            <line x1="0" y1="70" x2="280" y2="70" stroke="var(--ui-line-strong)" strokeWidth="1" />
            {heights.map((h, idx) => (
              <rect
                key={idx}
                x={12 + idx * 38}
                y={70 - h}
                width="24"
                height={h}
                rx="2"
                fill={idx === 5 ? brandColor : 'var(--ui-line-strong)'}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  }

  if (archetype === 'clinical-emr') {
    return (
      <div className="mini-frame">
        <div className="mini-bar" style={{ borderLeft: `3px solid ${brandColor}` }}>
          <span className="mini-bar-title">{preview.surfaceTitle}</span>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '9px', color: 'var(--ui-ok)' }}>FHIR R4</span>
        </div>
        <div className="mini-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ui-surface)', border: '1px solid var(--ui-line)', padding: '4px 6px', borderRadius: '2px' }}>
            <span style={{ fontWeight: 600 }}>{i0.title}</span>
            <svg viewBox="0 0 70 16" width="70" height="16">
              <polyline points="0,9 14,9 19,2 25,14 31,6 38,9 52,9 57,3 63,12 70,9" fill="none" stroke={brandColor} strokeWidth="1.4" />
            </svg>
          </div>
          {[i1, i2, i3].map((it) => (
            <div className="mini-list-row" key={it.code}>
              <span style={{ fontFamily: 'var(--ui-mono)', color: brandColor, fontWeight: 600 }}>{it.code}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
              <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone) }}>{it.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'kanban-workflow') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          <div className="mini-kanban">
            {[
              { head: 'Pending', item: i0 },
              { head: 'In Review', item: i1 },
              { head: 'Verified', item: i3 },
            ].map((col) => (
              <div className="mini-kanban-col" key={col.head}>
                <div style={{ fontSize: '8.5px', fontWeight: 600, color: 'var(--ui-text-muted)', borderBottom: '1px solid var(--ui-line)', paddingBottom: '2px' }}>
                  {col.head}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--ui-text)', fontSize: '9px' }}>{col.item.code}</div>
                <div style={{ color: 'var(--ui-text-2)', fontSize: '8.5px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {col.item.title}
                </div>
                <div style={{ marginTop: 'auto', fontFamily: 'var(--ui-mono)', fontSize: '8.5px', color: toneColor(col.item.tone) }}>
                  {col.item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'pos-kiosk') {
    return (
      <div className="mini-frame">
        <div className="mini-bar" style={{ background: brandColor, color: '#ffffff' }}>
          <span style={{ fontWeight: 600 }}>{project.name}</span>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '9px' }}>{m0.value}</span>
        </div>
        <div className="mini-body">
          <div className="mini-pos-grid">
            <div className="mini-pos-items">
              {[i0, i1, i2, i3].map((it) => (
                <div className="mini-pos-tile" key={it.code}>
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                  <span style={{ fontFamily: 'var(--ui-mono)', color: brandColor }}>{it.value}</span>
                </div>
              ))}
            </div>
            <div className="mini-pos-receipt">
              <div style={{ borderBottom: '1px dashed var(--ui-line-strong)', paddingBottom: '3px', fontWeight: 600 }}>
                BILL / KIOSK
              </div>
              <div>{i0.code} · {i0.value}</div>
              <div>{i1.code} · {i1.value}</div>
              <div style={{ marginTop: 'auto', background: brandColor, color: '#ffffff', textAlign: 'center', padding: '3px', borderRadius: '2px' }}>
                {preview.primaryAction}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'desktop-erp') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name} (.NET Desktop)</span>
          <span className="mini-bar-env">WIN-ERP</span>
        </div>
        <div className="mini-erp-menu">
          <span>File</span>
          <span>Master</span>
          <span>Transactions</span>
          <span>Audit</span>
        </div>
        <div className="mini-erp-split">
          <div className="mini-erp-tree">
            <span style={{ color: brandColor, fontWeight: 600 }}>Active Grid</span>
            <span>Master SKU</span>
            <span>Batches</span>
            <span>Reports</span>
          </div>
          <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[i0, i1, i2].map((it) => (
              <div key={it.code} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--ui-line)', paddingBottom: '2px' }}>
                <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '8.5px', color: 'var(--ui-text-muted)' }}>{it.code}</span>
                <span style={{ flex: 1, marginLeft: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone), fontSize: '8.5px' }}>{it.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'ai-agent-workbench') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '9px', color: brandColor }}>{m1.value}</span>
        </div>
        <div className="mini-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--ui-mono)', fontSize: '8.5px' }}>
            {['Ingest', 'Policy', 'Route', 'Verify'].map((step, idx) => (
              <React.Fragment key={step}>
                <span style={{ padding: '2px 5px', border: '1px solid var(--ui-line-strong)', borderRadius: '2px', background: idx === 2 ? brandColor : 'var(--ui-surface)', color: idx === 2 ? '#ffffff' : 'var(--ui-text)' }}>
                  {step}
                </span>
                {idx < 3 && <span style={{ color: 'var(--ui-text-muted)' }}>-&gt;</span>}
              </React.Fragment>
            ))}
          </div>
          {[i0, i1, i2].map((it) => (
            <div className="mini-list-row" key={it.code}>
              <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '8.5px', color: 'var(--ui-text-muted)' }}>{it.code}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
              <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone) }}>{it.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'gov-portal') {
    return (
      <div className="mini-frame">
        <div className="mini-bar" style={{ background: '#141413', color: '#ffffff', borderBottom: `2px solid ${brandColor}` }}>
          <span style={{ fontWeight: 600 }}>{project.name} · Layanan Publik</span>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '8.5px' }}>DPI-ID</span>
        </div>
        <div className="mini-body">
          <div style={{ display: 'flex', gap: '4px', fontSize: '8.5px' }}>
            <span style={{ flex: 1, height: '4px', background: brandColor, borderRadius: '1px' }} />
            <span style={{ flex: 1, height: '4px', background: brandColor, borderRadius: '1px' }} />
            <span style={{ flex: 1, height: '4px', background: 'var(--ui-line-strong)', borderRadius: '1px' }} />
          </div>
          {[i0, i1, i2].map((it) => (
            <div className="mini-list-row" key={it.code}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{it.title}</span>
              <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone) }}>{it.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'security-soc') {
    return (
      <div className="mini-frame mini-term">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name} SOC</span>
          <span style={{ color: '#f97066', fontSize: '9px' }}>{m0.value}</span>
        </div>
        <div className="mini-body">
          {[i0, i1, i2].map((it) => (
            <div
              key={it.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                padding: '4px 6px',
                background: 'var(--ui-term-surface)',
                borderLeft: `3px solid ${it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#34c279'}`,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
              <span style={{ color: it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#34c279', flexShrink: 0 }}>
                {it.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'ide-code-diff') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name} IDE</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          <div style={{ background: 'var(--ui-term-bg)', color: '#7cb0ff', fontFamily: 'var(--ui-mono)', fontSize: '8.5px', padding: '5px 6px', borderRadius: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {preview.snippet.split('\n')[0]}
          </div>
          {[i0, i1].map((it) => (
            <div className="mini-list-row" key={it.code}>
              <span style={{ fontFamily: 'var(--ui-mono)', color: brandColor, fontWeight: 600 }}>{it.code}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
              <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone) }}>{it.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (archetype === 'calendar-booking') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(3, 1fr)', gap: '3px', fontSize: '8.5px' }}>
            {[i0, i1, i2].map((it, rowIdx) => (
              <React.Fragment key={it.code}>
                <span style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', alignSelf: 'center' }}>{it.code}</span>
                {[0, 1, 2].map((colIdx) => {
                  const active = (rowIdx + colIdx) % 2 === 0;
                  return (
                    <div
                      key={colIdx}
                      style={{
                        height: '24px',
                        borderRadius: '2px',
                        padding: '2px 4px',
                        border: '1px solid var(--ui-line)',
                        background: active ? brandColor : 'var(--ui-surface)',
                        color: active ? '#ffffff' : 'var(--ui-text-muted)',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {active ? it.status : 'Open'}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'marketplace-store') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', flex: 1 }}>
            {[i0, i1, i2, i3].map((it) => (
              <div key={it.code} style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-line)', borderRadius: '2px', padding: '4px 5px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--ui-mono)', color: brandColor, fontWeight: 600 }}>{it.value}</span>
                  <span style={{ fontSize: '8px', color: toneColor(it.tone) }}>{it.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'document-vault') {
    return (
      <div className="mini-frame">
        <div className="mini-bar">
          <span className="mini-bar-title">{project.name}</span>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '8.5px', color: brandColor }}>SEALED</span>
        </div>
        <div className="mini-body" style={{ flexDirection: 'row', gap: '6px' }}>
          <div style={{ width: '76px', background: 'var(--ui-surface)', border: '1px solid var(--ui-line)', borderRadius: '2px', padding: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ height: '4px', width: '70%', background: 'var(--ui-line-strong)' }} />
            <div style={{ height: '3px', width: '90%', background: 'var(--ui-line)' }} />
            <div style={{ height: '3px', width: '80%', background: 'var(--ui-line)' }} />
            <div style={{ marginTop: 'auto', border: `1px solid ${brandColor}`, color: brandColor, fontSize: '8px', textAlign: 'center', padding: '2px', fontFamily: 'var(--ui-mono)' }}>
              VERIFIED
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            {[i0, i1, i2].map((it) => (
              <div className="mini-list-row" key={it.code}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone), flexShrink: 0 }}>{it.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'social-community') {
    return (
      <div className="mini-frame">
        <div className="mini-bar" style={{ borderLeft: `3px solid ${brandColor}` }}>
          <span className="mini-bar-title">{project.name}</span>
          <span className="mini-bar-env">{m0.value}</span>
        </div>
        <div className="mini-body">
          {[i0, i1, i2].map((it) => (
            <div className="mini-list-row" key={it.code} style={{ alignItems: 'flex-start' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '2px', background: brandColor, color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ui-mono)', fontSize: '8px', flexShrink: 0 }}>
                {it.code.slice(0, 2)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
                <div style={{ fontSize: '8.5px', color: 'var(--ui-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.subtitle}</div>
              </div>
              <span style={{ fontFamily: 'var(--ui-mono)', color: toneColor(it.tone), flexShrink: 0 }}>{it.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: fintech-ledger (high-precision financial ledger)
  return (
    <div className="mini-frame">
      <div className="mini-bar">
        <span className="mini-bar-title">{project.name}</span>
        <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, color: brandColor }}>{m0.value}</span>
      </div>
      <div className="mini-body">
        <div className="mini-kpi-strip">
          {[m0, m1, m2].map((m) => (
            <div className="mini-kpi-box" key={m.label}>
              <div className="mini-kpi-lbl">{m.label}</div>
              <div className="mini-kpi-val">{m.value}</div>
            </div>
          ))}
        </div>
        {[i0, i1].map((it) => (
          <div className="mini-list-row" key={it.code}>
            <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '8.5px', color: 'var(--ui-text-muted)' }}>{it.code}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
            <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, color: toneColor(it.tone) }}>{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
