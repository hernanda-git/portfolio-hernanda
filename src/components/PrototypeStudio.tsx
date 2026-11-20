import React, { useEffect, useState } from 'react';
import { EXPERIENCES } from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { ARCHETYPE_LABELS, SECTORS } from '../data/sectors';
import { ArchDiagram } from './ArchDiagram';
import { IconArrowLeft, IconArrowRight, IconClose, IconExternal, IconShield } from './Icons';

interface PrototypeStudioProps {
  project: ConceptProject | null;
  listContext: ConceptProject[];
  onClose: () => void;
  onSelectProject: (project: ConceptProject) => void;
  onJumpToExperience: (expId: string) => void;
}

export const PrototypeStudio: React.FC<PrototypeStudioProps> = ({
  project,
  listContext,
  onClose,
  onSelectProject,
  onJumpToExperience,
}) => {
  const [studioTab, setStudioTab] = useState<'ui' | 'brief' | 'architecture'>('ui');
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setStudioTab('ui');
    setZoomOpen(false);
  }, [project?.id]);

  const currentIdx = project ? listContext.findIndex((p) => p.id === project.id) : -1;
  const prevProject = currentIdx > 0 ? listContext[currentIdx - 1] : null;
  const nextProject = currentIdx >= 0 && currentIdx < listContext.length - 1 ? listContext[currentIdx + 1] : null;

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomOpen) setZoomOpen(false);
        else onClose();
      } else if (e.key === 'ArrowLeft' && prevProject && !zoomOpen) {
        onSelectProject(prevProject);
      } else if (e.key === 'ArrowRight' && nextProject && !zoomOpen) {
        onSelectProject(nextProject);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, prevProject, nextProject, zoomOpen, onClose, onSelectProject]);

  if (!project) return null;

  const sectorMeta = SECTORS.find((s) => s.id === project.sector);
  const linkedExp = project.cvLink ? EXPERIENCES.find((e) => e.id === project.cvLink) : null;
  const shotSrc = `./screenshots/${project.id}.webp`;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Product Case Study: ${project.name}`}
    >
      <div className="studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="studio-header">
          <div className="studio-title-group">
            <span className="tag tag-mono">{project.id}</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{project.name}</h2>
            <span className="tag tag-warn">Concept Design · Undeployed</span>
            <span className="tag">{project.platform}</span>
            <span className="tag tag-accent">{ARCHETYPE_LABELS[project.archetype]}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-sm"
              disabled={!prevProject}
              onClick={() => prevProject && onSelectProject(prevProject)}
              title="Previous project (Left arrow)"
            >
              <IconArrowLeft size={13} />
              Prev
            </button>
            <button
              type="button"
              className="btn btn-sm"
              disabled={!nextProject}
              onClick={() => nextProject && onSelectProject(nextProject)}
              title="Next project (Right arrow)"
            >
              Next
              <IconArrowRight size={13} />
            </button>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close case study">
              <IconClose size={14} />
            </button>
          </div>
        </div>

        <div className="studio-tabs">
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`studio-tab-btn ${studioTab === 'ui' ? 'is-active' : ''}`}
              onClick={() => setStudioTab('ui')}
            >
              UI/UX Product Screen (1280×800)
            </button>
            <button
              type="button"
              className={`studio-tab-btn ${studioTab === 'brief' ? 'is-active' : ''}`}
              onClick={() => setStudioTab('brief')}
            >
              Product &amp; Indonesia Market Brief
            </button>
            <button
              type="button"
              className={`studio-tab-btn ${studioTab === 'architecture' ? 'is-active' : ''}`}
              onClick={() => setStudioTab('architecture')}
            >
              Solution Architecture &amp; Stack
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ui-text-muted)', padding: '6px 0' }}>
            {sectorMeta?.name} · Arrow keys to step across 108 projects
          </div>
        </div>

        <div className="studio-body">
          {studioTab === 'ui' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="screenshot-stage">
                <div className="screenshot-stage-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-dot ok" />
                    <strong style={{ fontSize: '12.5px' }}>{project.preview.surfaceTitle}</strong>
                    <span className="tag tag-mono">{project.preview.envTag}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setZoomOpen(true)}
                  >
                    <IconExternal size={12} />
                    Inspect Full Screen
                  </button>
                </div>

                <button
                  type="button"
                  className="screenshot-img-btn"
                  onClick={() => setZoomOpen(true)}
                  title="Click to inspect full 1280×800 UI/UX screen"
                >
                  <img
                    src={shotSrc}
                    alt={`${project.name} — ${project.tagline} UI/UX screen`}
                    className="screenshot-img-full"
                  />
                </button>
              </div>

              <div className="brief-grid">
                <div className="brief-box">
                  <div className="brief-label">PRODUCT SUMMARY &amp; PROBLEM SOLVED</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{project.tagline}</div>
                  <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: 'var(--ui-text-2)' }}>{project.summary}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ui-text-muted)' }}>
                    <strong>Pain Point:</strong> {project.problem}
                  </p>
                </div>

                <div className="brief-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div className="brief-label">INDONESIAN STANDARDS &amp; TECH STACK</div>
                    <div className="tag-wrap">
                      {project.standards.map((s) => (
                        <span className="tag tag-accent tag-mono" key={s}>{s}</span>
                      ))}
                      {project.stack.map((t) => (
                        <span className="tag tag-mono" key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ui-text-2)' }}>
                    <strong>Target Audience:</strong> {project.audience}
                  </div>
                  {linkedExp && (
                    <div style={{ paddingTop: '8px', borderTop: '1px solid var(--ui-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--ui-ok)' }}>
                        Informed by CV: <strong>{linkedExp.company}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => {
                          onClose();
                          onJumpToExperience(linkedExp.id);
                        }}
                      >
                        View CV Role
                        <IconArrowRight size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {studioTab === 'brief' && (
            <div className="brief-grid">
              <div className="brief-box" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div className="brief-label">PRODUCT OVERVIEW</div>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>{project.summary}</p>
                </div>
                <div>
                  <div className="brief-label">MARKET PAIN POINT SOLVED</div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ui-text-2)' }}>{project.problem}</p>
                </div>
                <div>
                  <div className="brief-label">INDONESIAN REGULATORY &amp; ECOSYSTEM FIT</div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ui-text-2)' }}>{project.indonesiaContext}</p>
                </div>
                <div>
                  <div className="brief-label">CORE CAPABILITIES</div>
                  <ul className="exp-bullets" style={{ margin: 0 }}>
                    {project.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="brief-box">
                  <div className="brief-label">TARGET AUDIENCE &amp; BUYERS</div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{project.audience}</p>
                </div>

                <div className="brief-box">
                  <div className="brief-label">STANDARDS &amp; NATIONAL INTEGRATIONS</div>
                  <div className="tag-wrap">
                    {project.standards.map((s) => (
                      <span className="tag tag-accent tag-mono" key={s}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className="brief-box">
                  <div className="brief-label">CREDIBILITY &amp; STATUS DISCLOSURE</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ui-text-2)' }}>
                    <IconShield size={15} />
                    <span>
                      Original undeployed conceptual product &amp; UI/UX exploration built to demonstrate architectural breadth across Indonesia’s technology landscape. Figures in the UI mockup represent realistic domain sample data.
                    </span>
                  </div>
                </div>

                {linkedExp && (
                  <div className="brief-box" style={{ borderColor: 'var(--ui-accent)' }}>
                    <div className="brief-label">INFORMED BY VERIFIED CAREER EXPERIENCE</div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{linkedExp.role} — {linkedExp.company}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ui-text-2)', margin: '4px 0 10px' }}>
                      {linkedExp.period} · {linkedExp.summary}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        onClose();
                        onJumpToExperience(linkedExp.id);
                      }}
                    >
                      View Verified Career Record
                      <IconArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {studioTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="brief-box">
                <div className="brief-label">LAYERED SOLUTION ARCHITECTURE</div>
                <ArchDiagram project={project} />
              </div>

              <div className="brief-grid">
                <div className="brief-box">
                  <div className="brief-label">PROPOSED TECHNOLOGY ECOSYSTEM</div>
                  <div className="tag-wrap" style={{ marginBottom: '12px' }}>
                    {project.stack.map((tech) => (
                      <span className="tag tag-mono" key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="brief-label">ARCHITECTURAL RATIONALE</div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ui-text-2)' }}>
                    Follows SOLID and KISS principles — favoring modular monoliths or cleanly bounded .NET / TypeScript services with explicit outbox messaging, deterministic audit ledgers, and Jakarta data-residency alignment under UU PDP No. 27/2022.
                  </p>
                </div>

                <div className="brief-box">
                  <div className="brief-label">LAYER RESPONSIBILITIES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <div><strong>Client Surface:</strong> {project.architecture.client}</div>
                    <div><strong>Edge &amp; Auth:</strong> {project.architecture.edge}</div>
                    <div><strong>Core Domain:</strong> {project.architecture.core}</div>
                    <div><strong>National / Ext API:</strong> {project.architecture.integration}</div>
                    <div><strong>Data &amp; Audit:</strong> {project.architecture.storage}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {zoomOpen && (
        <div
          className="lightbox-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(false);
          }}
        >
          <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-bar">
              <span className="tag-mono" style={{ fontSize: '12px' }}>
                {project.id} · {project.name} — 1280×800 UI/UX Design Screen
              </span>
              <button type="button" className="btn btn-sm" onClick={() => setZoomOpen(false)}>
                <IconClose size={12} />
                Close (Esc)
              </button>
            </div>
            <img
              src={shotSrc}
              alt={`${project.name} full resolution UI/UX design`}
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </div>
  );
};
