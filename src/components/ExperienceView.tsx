import React, { useMemo, useState } from 'react';
import {
  EXPERIENCES,
  PROFILE,
  SKILL_GROUPS,
  VERBATIM_RESUME_MARKDOWN,
  type ExperienceItem,
} from '../data/profile';
import { PROJECTS_BY_ID, type ConceptProject } from '../data/projects';
import { IconArrowRight, IconCheck, IconCopy, IconDownload, IconShield } from './Icons';

interface ExperienceViewProps {
  highlightExpId: string | null;
  onOpenProject: (project: ConceptProject) => void;
}

const TYPES: Array<'Semua' | ExperienceItem['employmentType']> = [
  'Semua',
  'Full-Time',
  'Founder',
  'Leadership',
  'Konsultan / Penempatan',
  'Freelance',
];

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  highlightExpId,
  onOpenProject,
}) => {
  const [typeFilter, setTypeFilter] = useState<'Semua' | ExperienceItem['employmentType']>('Semua');
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => {
    if (typeFilter === 'Semua') return EXPERIENCES;
    return EXPERIENCES.filter((e) => e.employmentType === typeFilter);
  }, [typeFilter]);

  const totalBullets = EXPERIENCES.reduce((sum, e) => sum + e.highlights.length, 0);

  const copyVerbatim = async () => {
    try {
      await navigator.clipboard.writeText(VERBATIM_RESUME_MARKDOWN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const downloadVerbatim = () => {
    const blob = new Blob([VERBATIM_RESUME_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Muhammad_Hernanda_Resume_Verbatim.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Verbatim CV Header & Controls */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="section-title" style={{ fontSize: '20px' }}>
                {PROFILE.name} — {PROFILE.title}
              </h1>
              <span className="tag tag-ok">
                <IconShield size={12} />
                100% Verbatim CV
              </span>
              <span className="tag tag-mono">
                {EXPERIENCES.length} Peran · {totalBullets} Poin · {SKILL_GROUPS.length} Skill Groups
              </span>
            </div>
            <p className="section-desc">
              Reproduksi teks lengkap kata-per-kata dari <code>{PROFILE.sourceFile}</code> (tanpa diringkas): {PROFILE.location} · {PROFILE.phone} · {PROFILE.email} · {PROFILE.linkedinLabel}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-sm" onClick={copyVerbatim}>
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              {copied ? 'CV Verbatim Tersalin' : 'Salin CV Verbatim (.md)'}
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={downloadVerbatim}>
              <IconDownload size={12} />
              Unduh .md Verbatim
            </button>
          </div>
        </div>

        {/* Summary (4 Verbatim Paragraphs) */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ui-line)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="brief-label" style={{ margin: 0 }}>SUMMARY (VERBATIM)</div>
          {PROFILE.summary.map((para, idx) => (
            <p key={idx} style={{ margin: 0, fontSize: '13px', lineHeight: 1.52, color: 'var(--ui-text-2)' }}>
              {para}
            </p>
          ))}
        </div>

        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: 'var(--ui-surface-2)' }}>
          {TYPES.map((t) => {
            const count = t === 'Semua' ? EXPERIENCES.length : EXPERIENCES.filter((e) => e.employmentType === t).length;
            return (
              <button
                type="button"
                key={t}
                className={`lens-chip ${typeFilter === t ? 'is-active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                <span>{t}</span>
                <span className="lens-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Works & Project Experiences (Left) + Technical Skills (Right) */}
      <div className="exp-layout">
        <div className="exp-list">
          {items.map((exp) => {
            const isHighlighted = highlightExpId === exp.id;
            return (
              <article
                className="exp-row"
                key={exp.id}
                id={exp.id}
                style={{
                  borderLeft: isHighlighted ? '3px solid var(--ui-accent)' : undefined,
                  background: isHighlighted ? 'var(--ui-accent-soft)' : undefined,
                }}
              >
                <div className="exp-head">
                  <div>
                    <h2 className="exp-role">{exp.verbatimHeader}</h2>
                    <div className="exp-company">
                      {exp.role} · {exp.company}
                      {exp.clientContext ? ` · ${exp.clientContext}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="exp-period">{exp.period}</div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <span className="tag">{exp.employmentType}</span>
                      <span className="tag">{exp.location}</span>
                    </div>
                  </div>
                </div>

                <ul className="exp-bullets" style={{ marginTop: '10px' }}>
                  {exp.highlights.map((h, i) => (
                    <li key={`${exp.id}-${i}`}>
                      {/^https?:\/\/\S+$/.test(h) ? (
                        <a href={h} target="_blank" rel="noreferrer">{h}</a>
                      ) : (
                        h
                      )}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="tag-wrap">
                    {exp.stack.map((s) => (
                      <span className="tag tag-mono" key={s}>{s}</span>
                    ))}
                  </div>

                  {exp.relatedConceptIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>Konsep terkait:</span>
                      {exp.relatedConceptIds.map((cid) => {
                        const proj = PROJECTS_BY_ID[cid];
                        if (!proj) return null;
                        return (
                          <button
                            type="button"
                            key={cid}
                            className="btn btn-sm"
                            onClick={() => onOpenProject(proj)}
                          >
                            {proj.name}
                            <IconArrowRight size={11} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="skill-panel">
          <div className="panel-header">
            <div>
              <h2 className="section-title" style={{ fontSize: '15px' }}>Technical Skills (Verbatim)</h2>
              <p className="section-desc">{SKILL_GROUPS.length} kategori sesuai CV sumber</p>
            </div>
          </div>

          {SKILL_GROUPS.map((grp) => (
            <div className="skill-group" key={grp.category}>
              <div className="skill-cat">{grp.category}</div>
              <div style={{ fontSize: '12px', color: 'var(--ui-text-2)', lineHeight: 1.45 }}>
                {grp.verbatimLine}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};
