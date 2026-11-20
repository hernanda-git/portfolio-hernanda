import React, { useMemo, useState } from 'react';
import { EXPERIENCES, PROFILE, SKILL_GROUPS, type ExperienceItem } from '../data/profile';
import { PROJECTS_BY_ID, type ConceptProject } from '../data/projects';
import { IconArrowRight, IconShield } from './Icons';

interface ExperienceViewProps {
  highlightExpId: string | null;
  onOpenProject: (project: ConceptProject) => void;
}

const TYPES: Array<'All' | ExperienceItem['employmentType']> = [
  'All',
  'Full-Time',
  'Founder',
  'Leadership',
  'Consultant / Placement',
  'Freelance',
];

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  highlightExpId,
  onOpenProject,
}) => {
  const [typeFilter, setTypeFilter] = useState<'All' | ExperienceItem['employmentType']>('All');

  const items = useMemo(() => {
    if (typeFilter === 'All') return EXPERIENCES;
    return EXPERIENCES.filter((e) => e.employmentType === typeFilter);
  }, [typeFilter]);

  return (
    <div>
      <div className="panel" style={{ marginBottom: '16px' }}>
        <div className="panel-header">
          <div>
            <h1 className="section-title" style={{ fontSize: '20px' }}>
              Verified Production Career History (2016 – 2026)
            </h1>
            <p className="section-desc">
              Sourced verbatim from {PROFILE.name}’s resume — 16 real engagements across AI inference, civic SaaS, enterprise approval workflows, mining, banking, insurance, logistics, and law enforcement.
            </p>
          </div>
          <span className="tag tag-ok">
            <IconShield size={12} />
            CV-Verified Record
          </span>
        </div>

        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: 'var(--ui-surface-2)' }}>
          {TYPES.map((t) => (
            <button
              type="button"
              key={t}
              className={`lens-chip ${typeFilter === t ? 'is-active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

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
                    <h2 className="exp-role">{exp.role}</h2>
                    <div className="exp-company">
                      {exp.company}
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

                <p style={{ margin: '10px 0 8px', fontSize: '13px', color: 'var(--ui-text)' }}>
                  {exp.summary}
                </p>

                <ul className="exp-bullets">
                  {exp.highlights.map((h) => (
                    <li key={h}>{h}</li>
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
                      <span style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>Related concepts:</span>
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
              <h2 className="section-title" style={{ fontSize: '15px' }}>Technical Capabilities Matrix</h2>
              <p className="section-desc">Core production stack (2016–2026)</p>
            </div>
          </div>

          {SKILL_GROUPS.map((grp) => (
            <div className="skill-group" key={grp.category}>
              <div className="skill-cat">{grp.category}</div>
              <div className="tag-wrap">
                {grp.items.map((item) => (
                  <span className="tag" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};
