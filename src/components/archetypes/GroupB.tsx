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

export const KanbanWorkflowProto: React.FC<Props> = ({ project, onLog }) => {
  const [stages, setStages] = useState<number[]>([0, 1, 0, 2]);

  const advance = (idx: number) => {
    setStages((prev) => {
      const next = [...prev];
      next[idx] = (next[idx] + 1) % 3;
      const colNames = ['Pending Intake', 'In Review / SLA', 'Approved & Synced'];
      onLog(`Moved ${project.preview.items[idx].code} -> ${colNames[next[idx]]}`);
      return next;
    });
  };

  const columns = ['Pending Intake', 'In Review / SLA', 'Approved & Synced'];

  return (
    <div>
      <div className="proto-kanban-grid">
        {columns.map((col, colIdx) => (
          <div className="proto-kanban-col" key={col}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ui-line)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{col}</span>
              <span className="tag tag-mono">{stages.filter((s) => s === colIdx).length}</span>
            </div>
            {project.preview.items.map((it, itemIdx) =>
              stages[itemIdx] === colIdx ? (
                <div
                  key={it.code}
                  style={{ border: '1px solid var(--ui-line)', borderRadius: '3px', padding: '8px', background: 'var(--ui-surface-2)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginBottom: '4px' }}>
                    <span className="tag tag-mono">{it.code}</span>
                    <span className={toneBadge(it.tone)}>{it.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{it.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', margin: '3px 0 8px' }}>{it.subtitle}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', fontWeight: 600 }}>{it.value}</span>
                    <button type="button" className="btn btn-sm" onClick={() => advance(itemIdx)}>
                      {colIdx === 2 ? 'Reopen' : 'Advance'}
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <div className="code-block">{project.preview.snippet}</div>
      </div>
    </div>
  );
};

export const AiAgentWorkbenchProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [activeStep, setActiveStep] = useState(2);
  const steps = ['01 Ingest & Auth', '02 Policy / UU PDP', '03 Model / Flow Route', '04 Verify & Audit'];
  const active = project.preview.items[selected];

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {steps.map((s, idx) => (
            <button
              type="button"
              key={s}
              className={`btn btn-sm ${activeStep === idx ? 'btn-primary' : ''}`}
              onClick={() => {
                setActiveStep(idx);
                onLog(`Inspected pipeline stage: ${s}`);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setActiveStep(3);
            onLog(`${project.preview.primaryAction} completed across 4 deterministic stages`);
          }}
        >
          {project.preview.primaryAction}
        </button>
      </div>

      <div className="proto-split" style={{ border: '1px solid var(--ui-line)', borderRadius: '4px' }}>
        <div className="proto-split-left">
          <div className="brief-label">EXECUTION ROUTES / AGENT TRACE</div>
          {project.preview.items.map((it, idx) => (
            <button
              type="button"
              key={it.code}
              className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
              onClick={() => setSelected(idx)}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', marginRight: '6px' }}>{it.code}</span>
                  {it.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px' }}>{it.value}</div>
                <span className={toneBadge(it.tone)}>{it.status}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="proto-split-right">
          <div className="brief-label">STAGE TELEMETRY — {steps[activeStep]}</div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{active.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--ui-text-2)', marginBottom: '10px' }}>
            Status: {active.status} · Metric: {active.value} {active.meta ? `· ${active.meta}` : ''}
          </div>
          <div className="code-block">{project.preview.snippet}</div>
        </div>
      </div>
    </div>
  );
};

export const PosKioskProto: React.FC<Props> = ({ project, onLog }) => {
  const [cart, setCart] = useState<Array<{ code: string; title: string; value: string; qty: number }>>([
    { code: project.preview.items[0].code, title: project.preview.items[0].title, value: project.preview.items[0].value, qty: 1 },
  ]);
  const [paid, setPaid] = useState(false);

  const addToTicket = (idx: number) => {
    const it = project.preview.items[idx];
    setPaid(false);
    setCart((prev) => {
      const existing = prev.find((x) => x.code === it.code);
      if (existing) {
        return prev.map((x) => (x.code === it.code ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { code: it.code, title: it.title, value: it.value, qty: 1 }];
    });
    onLog(`Added ${it.code} (${it.title}) to POS / Kiosk ticket`);
  };

  return (
    <div className="proto-pos-layout">
      <div className="proto-pos-menu">
        {project.preview.items.map((it, idx) => (
          <button type="button" key={it.code} className="proto-pos-card" onClick={() => addToTicket(idx)}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                <span className="tag tag-mono">{it.code}</span>
                <span className={toneBadge(it.tone)}>{it.status}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '6px' }}>{it.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', marginTop: '2px' }}>{it.subtitle}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ui-line)', paddingTop: '6px' }}>
              <strong style={{ fontFamily: 'var(--ui-mono)', color: project.brandColor }}>{it.value}</strong>
              <span className="tag">Tap +1</span>
            </div>
          </button>
        ))}
      </div>

      <div className="proto-pos-cart">
        <div>
          <div className="brief-label">ACTIVE TICKET / RECEIPT</div>
          {cart.map((line) => (
            <div key={line.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--ui-line-strong)', fontSize: '12px' }}>
              <span>{line.qty}x {line.title}</span>
              <span style={{ fontFamily: 'var(--ui-mono)' }}>{line.value}</span>
            </div>
          ))}
          <div className="code-block" style={{ marginTop: '10px' }}>{project.preview.snippet}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ justifyContent: 'center' }}
            onClick={() => {
              setPaid(true);
              onLog(`${project.preview.primaryAction} settled (${cart.reduce((a, b) => a + b.qty, 0)} line items)`);
            }}
          >
            {paid ? 'Settled · Ready Next' : project.preview.primaryAction}
          </button>
          <button
            type="button"
            className="btn"
            style={{ justifyContent: 'center' }}
            onClick={() => {
              setCart([]);
              setPaid(false);
              onLog('Cleared POS ticket');
            }}
          >
            Clear Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export const IotScadaProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(1);
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const active = project.preview.items[selected];

  return (
    <div className="proto-terminal">
      <div className="proto-term-top">
        <span>{project.preview.surfaceTitle} — LIVE INDUSTRIAL TELEMETRY</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setAcked((a) => ({ ...a, [active.code]: true }));
              onLog(`SCADA action "${project.preview.primaryAction}" acknowledged on node ${active.code}`);
            }}
          >
            {project.preview.primaryAction}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: 'var(--ui-term-surface)', color: 'var(--ui-term-text)', borderColor: 'var(--ui-term-line)' }}
            onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}
          >
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', borderBottom: '1px solid var(--ui-term-line)' }}>
        {project.preview.items.map((it, idx) => {
          const isAck = Boolean(acked[it.code]);
          const borderCol = selected === idx ? '#4c8dff' : isAck ? '#34c279' : it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#2d313b';
          return (
            <button
              type="button"
              key={it.code}
              onClick={() => setSelected(idx)}
              style={{
                textAlign: 'left',
                padding: '10px',
                background: 'var(--ui-term-surface)',
                border: `1.5px solid ${borderCol}`,
                borderRadius: '4px',
                color: 'var(--ui-term-text)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ui-term-muted)' }}>
                <span>{it.code}</span>
                <span style={{ color: isAck ? '#34c279' : it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#34c279' }}>
                  {isAck ? 'ACKED' : it.status}
                </span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, margin: '6px 0 4px' }}>{it.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--ui-term-muted)' }}>{it.title}</div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ color: '#7cb0ff' }}>NODE INSPECTOR: {active.code} — {active.title}</div>
        <div style={{ color: 'var(--ui-term-muted)' }}>{active.subtitle}</div>
        <div style={{ padding: '8px 10px', background: 'var(--ui-term-surface)', border: '1px solid var(--ui-term-line)', borderRadius: '3px', marginTop: '4px' }}>
          {project.preview.snippet}
        </div>
      </div>
    </div>
  );
};

export const GovPortalProto: React.FC<Props> = ({ project, onLog }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({ [project.preview.items[0].code]: true });

  return (
    <div>
      <div style={{ background: '#141413', color: '#ffffff', padding: '14px 16px', borderBottom: `3px solid ${project.brandColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '10px', opacity: 0.8 }}>{project.preview.envTag}</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>{project.preview.surfaceTitle}</div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} submitted with verifiable receipt`)}>
          {project.preview.primaryAction}
        </button>
      </div>

      <div className="proto-split">
        <div className="proto-split-left">
          <div className="brief-label">SERVICE STEPS &amp; PUBLIC RECORD CHECKLIST</div>
          {project.preview.items.map((it) => {
            const isChecked = Boolean(checked[it.code]);
            return (
              <label
                key={it.code}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px',
                  marginBottom: '6px',
                  border: '1px solid var(--ui-line)',
                  borderRadius: '3px',
                  background: 'var(--ui-surface)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setChecked((c) => ({ ...c, [it.code]: !c[it.code] }));
                      onLog(`Toggled citizen verification step ${it.code}`);
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{it.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
                  </div>
                </div>
                <span className={toneBadge(it.tone)}>{it.status}</span>
              </label>
            );
          })}
        </div>
        <div className="proto-split-right">
          <div className="brief-label">PUBLIC AUDIT &amp; CONSENT RECEIPT</div>
          <div className="code-block" style={{ marginBottom: '10px' }}>{project.preview.snippet}</div>
          <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BiAnalyticsProto: React.FC<Props> = ({ project, onLog }) => {
  const [range, setRange] = useState<'7D' | '30D' | 'QTD'>('30D');
  const seriesMap = {
    '7D': [42, 56, 48, 64, 72, 68, 84],
    '30D': [38, 49, 58, 62, 74, 86, 81],
    QTD: [31, 44, 52, 66, 71, 79, 92],
  };
  const bars = seriesMap[range];

  return (
    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div className="segmented">
          {(['7D', '30D', 'QTD'] as const).map((r) => (
            <button
              type="button"
              key={r}
              className={`seg-btn ${range === r ? 'is-active' : ''}`}
              onClick={() => {
                setRange(r);
                onLog(`Switched BI horizon to ${r}`);
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} executed (${range})`)}>
            {project.preview.primaryAction}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => onLog(`Exported ${range} dataset from ${project.name}`)}>
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div className="proto-split" style={{ border: '1px solid var(--ui-line)', borderRadius: '4px' }}>
        <div className="proto-split-left">
          <div className="brief-label">PERFORMANCE DISTRIBUTION ({range})</div>
          <svg viewBox="0 0 420 150" width="100%" style={{ display: 'block', marginBottom: '10px' }}>
            <line x1="0" y1="130" x2="420" y2="130" stroke="var(--ui-line-strong)" />
            {bars.map((val, idx) => (
              <g key={idx}>
                <rect
                  x={18 + idx * 56}
                  y={130 - val * 1.2}
                  width="34"
                  height={val * 1.2}
                  rx="2"
                  fill={idx === bars.length - 1 ? project.brandColor : 'var(--ui-line-strong)'}
                />
                <text x={35 + idx * 56} y="145" textAnchor="middle" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text-muted)">
                  P{idx + 1}
                </text>
              </g>
            ))}
          </svg>
          <div className="code-block">{project.preview.snippet}</div>
        </div>
        <div className="proto-split-right">
          <div className="brief-label">SEGMENT BREAKDOWN</div>
          {project.preview.items.map((it) => (
            <div key={it.code} style={{ padding: '8px 0', borderBottom: '1px solid var(--ui-line)', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{it.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>{it.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600, fontSize: '12px' }}>{it.value}</div>
                <span className={toneBadge(it.tone)}>{it.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
