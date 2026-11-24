import React, { useMemo, useState } from 'react';
import {
  buildResumeMarkdown,
  EXPERIENCES,
  PROFILE,
  SKILL_GROUPS,
  type EmploymentType,
} from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { IconArrowRight, IconCheck, IconCopy, IconDownload, IconExternal, IconShield } from './Icons';

interface ExperienceViewProps {
  highlightExpId: string | null;
  projectsById: Record<string, ConceptProject>;
  onOpenProject: (project: ConceptProject) => void;
}

const TYPES: Array<'ALL' | EmploymentType> = [
  'ALL',
  'Full-Time',
  'Founder',
  'Leadership',
  'Konsultan / Penempatan',
  'Freelance',
];

export const ExperienceView: React.FC<ExperienceViewProps> = ({
  highlightExpId,
  projectsById,
  onOpenProject,
}) => {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].experience;
  const [typeFilter, setTypeFilter] = useState<'ALL' | EmploymentType>('ALL');
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => {
    if (typeFilter === 'ALL') return EXPERIENCES;
    return EXPERIENCES.filter((e) => e.employmentType === typeFilter);
  }, [typeFilter]);

  const totalHighlights = useMemo(
    () => EXPERIENCES.reduce((sum, e) => sum + e.highlights[lang].length, 0),
    [lang]
  );

  const copyResume = async () => {
    try {
      await navigator.clipboard.writeText(buildResumeMarkdown(lang));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const downloadResume = () => {
    const markdown = buildResumeMarkdown(lang);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lang === 'en' ? 'Muhammad_Hernanda_Resume_EN.md' : 'Muhammad_Hernanda_Resume_ID.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Career Header & Controls */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ minWidth: 0, flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="section-title" style={{ fontSize: '20px' }}>
                {PROFILE.name} - {PROFILE.title[lang]}
              </h1>
              <span className="tag tag-ok">
                <IconShield size={12} />
                {copy.verifiedCareerTag}
              </span>
              <span className="tag tag-mono">
                {copy.metaSummary(EXPERIENCES.length, totalHighlights, SKILL_GROUPS.length)}
              </span>
            </div>
            <p className="section-desc">
              {PROFILE.location} | {PROFILE.phone} | <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> |{' '}
              <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedinLabel}</a>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button type="button" className="btn btn-sm" onClick={copyResume}>
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              {copied ? copy.copiedResumeBtn : copy.copyResumeBtn}
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={downloadResume}>
              <IconDownload size={12} />
              {copy.downloadResumeBtn}
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ui-line)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="brief-label" style={{ margin: 0 }}>{copy.summaryLabel}</div>
          {PROFILE.summary[lang].map((para, idx) => (
            <p key={idx} style={{ margin: 0, fontSize: '13px', lineHeight: 1.56, color: 'var(--ui-text-2)' }}>
              {para}
            </p>
          ))}
        </div>

        {/* Role Type Filter */}
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', background: 'var(--ui-surface-2)' }}>
          {TYPES.map((t) => {
            const count = t === 'ALL' ? EXPERIENCES.length : EXPERIENCES.filter((e) => e.employmentType === t).length;
            const label = t === 'ALL' ? copy.allFilter : copy.employmentTypeLabels[t] ?? t;
            return (
              <button
                type="button"
                key={t}
                className={`lens-chip ${typeFilter === t ? 'is-active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                <span>{label}</span>
                <span className="lens-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Career Timeline (Left) + Technical Skills (Right) */}
      <div className="exp-layout">
        <div className="exp-list">
          {items.map((exp) => {
            const isHighlighted = highlightExpId === exp.id;
            const empLabel = copy.employmentTypeLabels[exp.employmentType] ?? exp.employmentType;
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
                  <div className="exp-title-col">
                    <h2 className="exp-role">{exp.role[lang]}</h2>
                    <div className="exp-company">
                      <span>{exp.company}</span>
                      {exp.clientContext && (
                        <span className="exp-client-ctx"> | {exp.clientContext[lang]}</span>
                      )}
                    </div>
                  </div>
                  <div className="exp-meta-col">
                    <div className="exp-period">{exp.period[lang]}</div>
                    <div className="exp-meta-tags">
                      <span className="tag">{empLabel}</span>
                      <span className="tag">{exp.location[lang]}</span>
                    </div>
                  </div>
                </div>

                <ul className="exp-bullets">
                  {exp.highlights[lang].map((h, i) => (
                    <li key={`${exp.id}-${i}`}>{h}</li>
                  ))}
                  {exp.link && (
                    <li>
                      <a href={exp.link.url} target="_blank" rel="noreferrer" className="exp-inline-link">
                        {exp.link.label[lang]} ({exp.link.url}) <IconExternal size={11} />
                      </a>
                    </li>
                  )}
                </ul>

                <div className="exp-foot">
                  <div className="tag-wrap">
                    {exp.stack.map((s) => (
                      <span className="tag tag-mono" key={s}>{s}</span>
                    ))}
                  </div>

                  {exp.relatedConceptIds.length > 0 && (
                    <div className="exp-related">
                      <span className="exp-related-label">{copy.relatedConceptsLabel}</span>
                      {exp.relatedConceptIds.map((cid) => {
                        const proj = projectsById[cid];
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
              <h2 className="section-title" style={{ fontSize: '15px' }}>{copy.skillsHeading}</h2>
              <p className="section-desc">{copy.skillsDesc(SKILL_GROUPS.length)}</p>
            </div>
          </div>

          {SKILL_GROUPS.map((grp) => (
            <div className="skill-group" key={grp.category.en}>
              <div className="skill-cat">{grp.category[lang]}</div>
              <div className="tag-wrap">
                {grp.items.map((item) => (
                  <span className="tag tag-mono" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};
