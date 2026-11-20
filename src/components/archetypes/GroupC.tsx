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

export const IdeCodeDiffProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [rtl, setRtl] = useState(false);
  const active = project.preview.items[selected];

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
          <span className="brief-label" style={{ margin: 0 }}>ENDPOINTS / SCHEMAS</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (project.id === 'ID-071') setRtl((v) => !v);
                onLog(`${project.preview.primaryAction} executed on ${active.code}`);
              }}
            >
              {project.preview.primaryAction}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
              {project.preview.secondaryAction}
            </button>
          </div>
        </div>
        {project.preview.items.map((it, idx) => (
          <button
            type="button"
            key={it.code}
            className={`proto-row-btn ${selected === idx ? 'is-active' : ''}`}
            dir={rtl ? 'rtl' : 'ltr'}
            onClick={() => setSelected(idx)}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                <span className="tag tag-mono" style={{ marginRight: '6px' }}>{it.code}</span>
                {it.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
            </div>
            <span className={toneBadge(it.tone)}>{it.value}</span>
          </button>
        ))}
      </div>
      <div className="proto-split-right">
        <div className="brief-label">CONTRACT &amp; PAYLOAD INSPECTOR {rtl ? '(RTL ACTIVE)' : ''}</div>
        <div className="code-block" style={{ marginBottom: '10px' }}>{project.preview.snippet}</div>
        <div style={{ fontSize: '12px', color: 'var(--ui-text-2)' }}>
          Active Spec: <strong>{active.title}</strong> ({active.status})
        </div>
      </div>
    </div>
  );
};

export const CalendarBookingProto: React.FC<Props> = ({ project, onLog }) => {
  const [bookedSlots, setBookedSlots] = useState<Record<string, boolean>>({ '0-0': true, '1-2': true, '2-1': true });
  const slots = ['08:00 – 11:00', '11:00 – 14:00', '14:00 – 17:00', '17:00 – 21:00'];

  const toggleSlot = (row: number, col: number) => {
    const key = `${row}-${col}`;
    setBookedSlots((prev) => {
      const nextVal = !prev[key];
      onLog(`${nextVal ? 'Allocated' : 'Released'} slot ${slots[col]} for ${project.preview.items[row].code}`);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <div>
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span className="brief-label" style={{ margin: 0 }}>CLICK ANY CELL TO ALLOCATE OR RELEASE RESOURCE SLOT</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} confirmed zero conflicts`)}>
            {project.preview.primaryAction}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div className="proto-cal-grid" style={{ minWidth: '620px' }}>
          <div className="proto-cal-cell" style={{ background: 'var(--ui-surface-2)', fontWeight: 600 }}>Resource / Unit</div>
          {slots.map((s) => (
            <div className="proto-cal-cell" key={s} style={{ background: 'var(--ui-surface-2)', fontWeight: 600, fontFamily: 'var(--ui-mono)' }}>
              {s}
            </div>
          ))}

          {project.preview.items.map((it, rIdx) => (
            <React.Fragment key={it.code}>
              <div className="proto-cal-cell">
                <div style={{ fontWeight: 600 }}>{it.code}</div>
                <div style={{ color: 'var(--ui-text-2)', fontSize: '10.5px' }}>{it.title}</div>
              </div>
              {slots.map((s, cIdx) => {
                const isBooked = Boolean(bookedSlots[`${rIdx}-${cIdx}`]);
                return (
                  <button
                    type="button"
                    key={s}
                    className="proto-cal-cell"
                    onClick={() => toggleSlot(rIdx, cIdx)}
                    style={{
                      border: 0,
                      borderRight: '1px solid var(--ui-line)',
                      borderBottom: '1px solid var(--ui-line)',
                      background: isBooked ? project.brandColor : 'var(--ui-surface)',
                      color: isBooked ? '#ffffff' : 'var(--ui-text-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--ui-mono)',
                    }}
                  >
                    {isBooked ? `${it.status}` : 'Available'}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div className="code-block">{project.preview.snippet}</div>
      </div>
    </div>
  );
};

export const DocumentVaultProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [verified, setVerified] = useState(false);
  const active = project.preview.items[selected];

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
          <span className="brief-label" style={{ margin: 0 }}>COMPLIANCE &amp; CLAUSE CHECKLIST</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setVerified(true);
                onLog(`${project.preview.primaryAction} -> Cryptographic seal verified`);
              }}
            >
              {verified ? 'Sealed & Valid' : project.preview.primaryAction}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
              {project.preview.secondaryAction}
            </button>
          </div>
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
              <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
            </div>
            <span className={toneBadge(it.tone)}>{it.status}</span>
          </button>
        ))}
      </div>

      <div className="proto-split-right">
        <div className="brief-label">DOCUMENT PREVIEW &amp; SIGNATURE SEAL</div>
        <div style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-line-strong)', borderRadius: '3px', padding: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ui-line)', paddingBottom: '6px', marginBottom: '8px' }}>
            <strong style={{ fontSize: '12.5px' }}>{active.title}</strong>
            <span className="tag tag-mono" style={{ borderColor: project.brandColor, color: project.brandColor }}>
              {verified ? 'LTV SEALED' : active.meta ?? 'DRAFT'}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ui-text-2)', marginBottom: '8px' }}>{active.subtitle}</div>
          <div style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px', color: 'var(--ui-text-muted)' }}>
            Ref: {active.code} · Value: {active.value}
          </div>
        </div>
        <div className="code-block">{project.preview.snippet}</div>
      </div>
    </div>
  );
};

export const DesktopErpProto: React.FC<Props> = ({ project, onLog }) => {
  const [view, setView] = useState<'active' | 'master' | 'audit'>('active');
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div style={{ padding: '6px 12px', background: 'var(--ui-surface-3)', borderBottom: '1px solid var(--ui-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-sm" onClick={() => setView('active')}>Active Register</button>
          <button type="button" className="btn btn-sm" onClick={() => setView('master')}>Master Data</button>
          <button type="button" className="btn btn-sm" onClick={() => setView('audit')}>Audit Journal</button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} committed in .NET Desktop ERP`)}>
            {project.preview.primaryAction}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => onLog(`Exported Excel/EPPlus workbook via ${project.preview.secondaryAction}`)}>
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Record / Unit ({view})</th>
              <th>Operational Detail</th>
              <th>Value</th>
              <th>Status</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {project.preview.items.map((it, idx) => (
              <tr
                key={it.code}
                onClick={() => {
                  setSelected(idx);
                  onLog(`Selected desktop ERP row ${it.code}`);
                }}
                style={{ background: selected === idx ? 'var(--ui-accent-soft)' : undefined }}
              >
                <td style={{ fontFamily: 'var(--ui-mono)', fontWeight: 600 }}>{it.code}</td>
                <td style={{ fontWeight: 600 }}>{it.title}</td>
                <td style={{ color: 'var(--ui-text-2)' }}>{it.subtitle}</td>
                <td style={{ fontFamily: 'var(--ui-mono)' }}>{it.value}</td>
                <td><span className={toneBadge(it.tone)}>{it.status}</span></td>
                <td style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)' }}>{it.meta ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div className="code-block">{project.preview.snippet}</div>
      </div>
    </div>
  );
};

export const SocialCommunityProto: React.FC<Props> = ({ project, onLog }) => {
  const [endorsed, setEndorsed] = useState<Record<string, boolean>>({});

  return (
    <div className="proto-split">
      <div className="proto-split-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <span className="brief-label" style={{ margin: 0 }}>VERIFIED COMMUNITY / COHORT STREAM</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onLog(`${project.preview.primaryAction} posted cleanly`)}>
            {project.preview.primaryAction}
          </button>
        </div>
        {project.preview.items.map((it) => {
          const isEndorsed = Boolean(endorsed[it.code]);
          return (
            <div key={it.code} style={{ padding: '10px', marginBottom: '8px', border: '1px solid var(--ui-line)', borderRadius: '4px', background: 'var(--ui-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '3px', background: project.brandColor, color: '#ffffff', fontFamily: 'var(--ui-mono)', fontSize: '10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {it.code.slice(0, 2)}
                  </span>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{it.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{it.subtitle}</div>
                  </div>
                </div>
                <span className={toneBadge(it.tone)}>{it.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--ui-line)' }}>
                <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '11.5px', fontWeight: 600 }}>{it.value}</span>
                <button
                  type="button"
                  className={`btn btn-sm ${isEndorsed ? 'btn-primary' : ''}`}
                  onClick={() => {
                    setEndorsed((e) => ({ ...e, [it.code]: !e[it.code] }));
                    onLog(`${isEndorsed ? 'Removed' : 'Recorded'} verification on ${it.code}`);
                  }}
                >
                  {isEndorsed ? 'Verified' : 'Verify / Endorse'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="proto-split-right">
        <div className="brief-label">TRANSPARENCY &amp; GOVERNANCE LEDGER</div>
        <div className="code-block" style={{ marginBottom: '10px' }}>{project.preview.snippet}</div>
        <button type="button" className="btn btn-sm" onClick={() => onLog(`Triggered: ${project.preview.secondaryAction}`)}>
          {project.preview.secondaryAction}
        </button>
      </div>
    </div>
  );
};

export const SecuritySocProto: React.FC<Props> = ({ project, onLog }) => {
  const [selected, setSelected] = useState(0);
  const [contained, setContained] = useState<Record<string, boolean>>({});
  const active = project.preview.items[selected];

  return (
    <div className="proto-terminal">
      <div className="proto-term-top">
        <span>{project.preview.surfaceTitle} — SECOPS TRIAGE</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setContained((c) => ({ ...c, [active.code]: true }));
              onLog(`Containment "${project.preview.primaryAction}" enforced on ${active.code}`);
            }}
          >
            {contained[active.code] ? 'Contained' : project.preview.primaryAction}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: 'var(--ui-term-surface)', color: 'var(--ui-term-text)', borderColor: 'var(--ui-term-line)' }}
            onClick={() => onLog(`Executed secondary playbook: ${project.preview.secondaryAction}`)}
          >
            {project.preview.secondaryAction}
          </button>
        </div>
      </div>

      <div className="proto-term-grid">
        <div className="proto-term-side">
          <div style={{ fontSize: '10px', color: 'var(--ui-term-muted)', marginBottom: '4px' }}>ALERT QUEUE</div>
          {project.preview.items.map((it, idx) => {
            const isC = Boolean(contained[it.code]);
            return (
              <button
                type="button"
                key={it.code}
                className={`proto-term-cmd ${selected === idx ? 'is-active' : ''}`}
                style={{ borderLeft: `3px solid ${isC ? '#34c279' : it.tone === 'bad' ? '#f97066' : it.tone === 'warn' ? '#eab308' : '#34c279'}` }}
                onClick={() => setSelected(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.code}</span>
                  <span>{isC ? 'CONTAINED' : it.status}</span>
                </div>
                <div style={{ color: 'var(--ui-term-muted)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.title}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: '#f97066', fontWeight: 600 }}>CASE {active.code}: {active.title}</div>
          <div style={{ color: 'var(--ui-term-muted)' }}>{active.subtitle}</div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
            <span>Severity/Value: {active.value}</span>
            <span>|</span>
            <span>State: {contained[active.code] ? 'CONTAINED' : active.status}</span>
          </div>
          <pre style={{ margin: '6px 0 0', padding: '10px', background: 'var(--ui-term-surface)', border: '1px solid var(--ui-term-line)', borderRadius: '3px', whiteSpace: 'pre-wrap' }}>
            {project.preview.snippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
