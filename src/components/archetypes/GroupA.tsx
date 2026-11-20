import React, { useState } from 'react';
import type { ConceptProject } from '../../data/projects';

interface Props {
  project: ConceptProject;
  onLog: (msg: string) => void;
}

const toneBadge = (tone?: 'neutral' | 'ok' | 'warn' | 'bad') => {
  if (tone === 'ok') return 'tag tag-ok';
  if (tone === 'warn') return 'tag tag-warn';
  if (tone === 'bad') return 'tag tag-bad';
  return 'tag';
};

export const MobileSuperAppProto: React.FC<Props> = ({ project, onLog }) => {
  const [tab, setTab] = useState<'home' | 'activity' | 'verify'>('home');
  const [selected, setSelected] = useState(0);
  const [doneActions, setDoneActions] = useState<string[]>([]);
  const activeItem = project.preview.items[selected];

  const trigger = (label: string) => {
    setDoneActions((prev) => [label, ...prev].slice(0, 4));
    onLog(`${project.name} mobile action executed: "${label}" -> Local state updated`);
  };

  return (
    <div className="proto-mobile-layout">
      <div className="proto-phone-device">
        <div className="proto-phone-banner" style={{ background: project.brandColor }}>
          <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '10px', opacity: 0.9 }}>
            {project.preview.envTag}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>
            {project.preview.surfaceTitle}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontFamily: 'var(--ui-mono)' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.85 }}>{project.preview.metrics[0].label}</div>
              <div style={{ fontSize: '17px', fontWeight: 600 }}>{project.preview.metrics[0].value}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', opacity: 0.85 }}>{project.preview.metrics[1].label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{project.preview.metrics[1].value}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '10px', display: 'flex', gap: '6px', borderBottom: '1px solid var(--ui-line)' }}>
          <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => trigger(project.preview.primaryAction)}>
            {project.preview.primaryAction}
          </button>
          <button type="button" className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => trigger(project.preview.secondaryAction)}>
            {project.preview.secondaryAction}
          </button>
        </div>

        <div style={{ padding: '10px', flex: 1 }}>
          {tab === 'home' &&
            project.preview.items.map((item, idx) => (
              <button
                type="button"
                key={item.code}
                className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
                onClick={() => {
                  setSelected(idx);
                  onLog(`Selected mobile item ${item.code} (${item.title})`);
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>{item.subtitle}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '11.5px', fontWeight: 600 }}>{item.value}</div>
                  <span className={toneBadge(item.tone)}>{item.status}</span>
                </div>
              </button>
            ))}

          {tab === 'activity' && (
            <div style={{ fontSize: '12px' }}>
              <div className="brief-label">RECENT INTERACTIONS</div>
              {doneActions.length === 0 ? (
                <p style={{ color: 'var(--ui-text-muted)', margin: 0 }}>Tap either action button above to simulate a live mobile workflow event.</p>
              ) : (
                doneActions.map((a, i) => (
                  <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--ui-line)', fontFamily: 'var(--ui-mono)', fontSize: '11px' }}>
                    OK · {a}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'verify' && (
            <div className="code-block">{project.preview.snippet}</div>
          )}
        </div>

        <div className="proto-phone-tabs">
          <button type="button" className={`proto-phone-tab ${tab === 'home' ? 'is-active' : ''}`} onClick={() => setTab('home')}>Home</button>
          <button type="button" className={`proto-phone-tab ${tab === 'activity' ? 'is-active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
          <button type="button" className={`proto-phone-tab ${tab === 'verify' ? 'is-active' : ''}`} onClick={() => setTab('verify')}>Receipt</button>
        </div>
      </div>

      <div className="panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div className="brief-label">MOBILE TELEMETRY &amp; SELECTED RECORD</div>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{activeItem.title}</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ui-text-2)' }}>{activeItem.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="tag tag-mono">{activeItem.code}</span>
          <span className="tag tag-mono">{activeItem.value}</span>
          <span className={toneBadge(activeItem.tone)}>{activeItem.status}</span>
          {activeItem.meta && <span className="tag">{activeItem.meta}</span>}
        </div>
        <div>
          <div className="brief-label">DEVICE PAYLOAD / SYNC PROOF</div>
          <div className="code-block">{project.preview.snippet}</div>
        </div>
        <div>
          <div className="brief-label">KEY CAPABILITIES IN THIS PROTOTYPE</div>
          <ul className="exp-bullets" style={{ margin: 0 }}>
            {project.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const TerminalCliProto: React.FC<Props> = ({ project, onLog }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [runCount, setRunCount] = useState(1);
  const active = project.preview.items[activeIdx];

  return (
    <div className="proto-terminal">
      <div className="proto-term-top">
        <span>{project.preview.surfaceTitle}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setRunCount((c) => c + 1);
              onLog(`Executed CLI command "${project.preview.primaryAction}" (run #${runCount + 1})`);
            }}
          >
            {project.preview.primaryAction}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: 'var(--ui-term-surface)', color: 'var(--ui-term-text)', borderColor: 'var(--ui-term-line)' }}
            onClick={() => onLog(`Exported SARIF / JSON artifact from ${project.name}`)}
          >
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div className="proto-term-grid">
        <div className="proto-term-side">
          <div style={{ fontSize: '10px', color: 'var(--ui-term-muted)', marginBottom: '4px' }}>INSPECTABLE TARGETS</div>
          {project.preview.items.map((it, idx) => (
            <button
              type="button"
              key={it.code}
              className={`proto-term-cmd ${activeIdx === idx ? 'is-active' : ''}`}
              onClick={() => {
                setActiveIdx(idx);
                onLog(`Switched CLI inspector target -> ${it.code}`);
              }}
            >
              <div>{it.code} · {it.status}</div>
              <div style={{ color: 'var(--ui-term-muted)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {it.title}
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: '#7cb0ff' }}>{project.preview.envTag} · run #{runCount}</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.55, color: 'var(--ui-term-text)' }}>
            {project.preview.snippet}
          </pre>
          <div style={{ borderTop: '1px solid var(--ui-term-line)', paddingTop: '10px' }}>
            <div style={{ color: '#34c279', marginBottom: '4px' }}>
              &gt; inspect --target {active.code} --format table
            </div>
            <div>Target : {active.title}</div>
            <div>Detail : {active.subtitle}</div>
            <div>Result : {active.value} ({active.status}) {active.meta ? `[${active.meta}]` : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FintechLedgerProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [settledIds, setSettledIds] = useState<Record<string, boolean>>({});
  const item = project.preview.items[selected];

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="brief-label" style={{ margin: 0 }}>DOUBLE-ENTRY SETTLEMENT LEDGER</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSettledIds((s) => ({ ...s, [item.code]: true }));
              onLog(`${project.preview.primaryAction} executed for ${item.code} (${item.value})`);
            }}
          >
            {project.preview.primaryAction}
          </button>
        </div>
        {project.preview.items.map((it, idx) => {
          const settled = Boolean(settledIds[it.code]);
          return (
            <button
              type="button"
              key={it.code}
              className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
              onClick={() => setSelected(idx)}
            >
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                  <span style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', marginRight: '6px' }}>{it.code}</span>
                  {it.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, fontSize: '12px' }}>{it.value}</div>
                <span className={settled ? 'tag tag-ok' : toneBadge(it.tone)}>
                  {settled ? 'Settled' : it.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="proto-split-right">
        <div className="brief-label">SELECTED ENTRY &amp; AUDIT PROOF</div>
        <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>{item.title}</h4>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--ui-text-2)' }}>{item.subtitle}</p>
        <div className="code-block" style={{ marginBottom: '10px' }}>{project.preview.snippet}</div>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onLog(`${project.preview.secondaryAction} verified Rp 0 trial-balance variance`)}
        >
          {project.preview.secondaryAction}
        </button>
      </div>
    </div>
  );
};

export const ClinicalEmrProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [synced, setSynced] = useState(false);
  const active = project.preview.items[selected];

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot ok" />
            <strong style={{ fontSize: '13px' }}>{project.preview.surfaceTitle}</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSynced(true);
                onLog(`${project.preview.primaryAction} -> SATUSEHAT FHIR R4 201 Created`);
              }}
            >
              {synced ? 'FHIR Synced' : project.preview.primaryAction}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
              {project.preview.secondaryAction}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '10px', padding: '8px 10px', background: 'var(--ui-surface-2)', border: '1px solid var(--ui-line)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-2)' }}>
            Vitals / Waveform Telemetry
          </span>
          <svg viewBox="0 0 180 24" width="180" height="24">
            <polyline points="0,14 28,14 36,3 44,21 52,10 62,14 96,14 104,4 112,20 120,11 130,14 180,14" fill="none" stroke={project.brandColor} strokeWidth="1.6" />
          </svg>
        </div>

        {project.preview.items.map((it, idx) => (
          <button
            type="button"
            key={it.code}
            className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
            onClick={() => setSelected(idx)}
          >
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                <span className="tag tag-mono" style={{ marginRight: '6px' }}>{it.code}</span>
                {it.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', marginTop: '2px' }}>{it.subtitle}</div>
            </div>
            <span className={toneBadge(it.tone)}>{it.status}</span>
          </button>
        ))}
      </div>

      <div className="proto-split-right">
        <div className="brief-label">CLINICAL INTEROPERABILITY INSPECTOR</div>
        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{active.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--ui-text-2)', marginBottom: '10px' }}>
          Code: {active.value} · {active.meta ?? 'Clinical Record'}
        </div>
        <div className="code-block">{project.preview.snippet}</div>
      </div>
    </div>
  );
};

export const GeoDispatchProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const pins = [
    { x: 96, y: 126 },
    { x: 186, y: 102 },
    { x: 282, y: 134 },
    { x: 374, y: 84 },
  ];
  const active = project.preview.items[selected];

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <span className="brief-label" style={{ margin: 0 }}>INTERACTIVE TELEMETRY MAP (CLICK ANY NODE)</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} dispatched for ${active.code}`)}>
            {project.preview.primaryAction}
          </button>
        </div>
        <svg viewBox="0 0 460 210" width="100%" style={{ background: 'var(--ui-surface-2)', border: '1px solid var(--ui-line)', borderRadius: '4px', display: 'block' }}>
          <path d="M0 42H460M0 84H460M0 126H460M0 168H460M92 0V210M184 0V210M276 0V210M368 0V210" stroke="var(--ui-line)" strokeWidth="1" />
          <path d="M36 154 L96 126 L186 102 L282 134 L374 84 L430 92" fill="none" stroke={project.brandColor} strokeWidth="2.2" strokeDasharray="5 3" />
          {project.preview.items.map((it, idx) => {
            const pt = pins[idx];
            const isSel = idx === selected;
            const fill = it.tone === 'bad' ? '#b42318' : it.tone === 'warn' ? '#9a5b00' : project.brandColor;
            return (
              <g
                key={it.code}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelected(idx);
                  onLog(`Focused telemetry node ${it.code}: ${it.title}`);
                }}
              >
                {isSel && <circle cx={pt.x} cy={pt.y} r="14" fill="none" stroke={fill} strokeWidth="2" />}
                <circle cx={pt.x} cy={pt.y} r="7" fill={fill} />
                <rect x={pt.x - 32} y={pt.y - 28} width="64" height="16" rx="2" fill="var(--ui-surface)" stroke="var(--ui-line-strong)" />
                <text x={pt.x} y={pt.y - 17} textAnchor="middle" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text)">
                  {it.code}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="code-block" style={{ marginTop: '10px' }}>{project.preview.snippet}</div>
      </div>

      <div className="proto-split-right">
        <div className="brief-label">ACTIVE UNITS &amp; ZONES</div>
        {project.preview.items.map((it, idx) => (
          <button
            type="button"
            key={it.code}
            className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
            onClick={() => setSelected(idx)}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>{it.subtitle}</div>
            </div>
            <span className={toneBadge(it.tone)}>{it.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const MarketplaceStoreProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState<Record<string, number>>({ [project.preview.items[0].code]: 1 });

  const toggleItem = (code: string, title: string) => {
    setSelected((prev) => ({ ...prev, [code]: (prev[code] || 0) + 1 }));
    onLog(`Updated order/sync batch for ${code} (${title})`);
  };

  const totalCount = Object.values(selected).reduce((a, b) => a + b, 0);

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="brief-label" style={{ margin: 0 }}>CATALOG &amp; CHANNEL SKU WORKBENCH</span>
          <span className="tag tag-accent tag-mono">{totalCount} queued</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {project.preview.items.map((it) => (
            <button
              type="button"
              key={it.code}
              className="proto-pos-card"
              onClick={() => toggleItem(it.code, it.title)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                  <span className="tag tag-mono">{it.code}</span>
                  <span className={toneBadge(it.tone)}>{it.status}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '12.5px', marginTop: '6px' }}>{it.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', marginTop: '2px' }}>{it.subtitle}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ui-line)', paddingTop: '6px' }}>
                <span style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, color: project.brandColor }}>{it.value}</span>
                <span style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>
                  Qty: {selected[it.code] || 0} (+1)
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="proto-split-right">
        <div className="brief-label">CHANNEL SYNC &amp; ORDER SUMMARY</div>
        <div className="code-block" style={{ marginBottom: '10px' }}>{project.preview.snippet}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} executed for ${totalCount} items`)}>
            {project.preview.primaryAction}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>
    </div>
  );
};
