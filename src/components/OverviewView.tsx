import React from 'react';
import { PROFILE } from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { ARCHETYPE_LABELS, SECTORS, type SectorId } from '../data/sectors';
import { IconArrowRight, IconShield } from './Icons';
import { MiniPreview } from './MiniPreview';

interface OverviewViewProps {
  projects: ConceptProject[];
  onOpenProject: (project: ConceptProject) => void;
  onExploreAtlas: (sector?: SectorId) => void;
  onOpenExperience: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  projects,
  onOpenProject,
  onExploreAtlas,
  onOpenExperience,
}) => {
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <div>
      {/* Executive Dossier Hero */}
      <section className="hero-grid">
        <div className="hero-main">
          <div>
            <div className="hero-kicker">
              <span className="status-dot ok" />
              <span>{PROFILE.location} · {PROFILE.timezone}</span>
              <span>·</span>
              <span>Active Since {PROFILE.activeSince}</span>
              <span>·</span>
              <span>.NET · Solution Architecture · AI Inference</span>
            </div>
            <h1 className="hero-title">
              Engineering durable enterprise software &amp; mapping 108 digital products for Indonesia’s economy.
            </h1>
            <p className="hero-lead">{PROFILE.summary[0]}</p>
            <p className="hero-lead">{PROFILE.summary[1]}</p>
          </div>

          <div className="hero-cta-row">
            <button type="button" className="btn btn-primary" onClick={() => onExploreAtlas()}>
              Explore 108 Interactive Concepts
              <IconArrowRight size={14} />
            </button>
            <button type="button" className="btn" onClick={onOpenExperience}>
              Read Verified Career (2016–2026)
            </button>
            <a className="btn" href={`mailto:${PROFILE.email}`}>
              Direct Conversation
            </a>
          </div>
        </div>

        <aside className="hero-side">
          <div className="stat-grid">
            {PROFILE.verifiedStats.map((st) => (
              <div className="stat-cell" key={st.label}>
                <div className="stat-val">{st.value}</div>
                <div className="stat-label">{st.label}</div>
                <div className="stat-detail">{st.detail}</div>
              </div>
            ))}
          </div>

          <div className="credibility-box">
            <div>
              <div className="credibility-title">
                <IconShield size={14} />
                <span>Real Work vs. Conceptual Exploration</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.48 }}>{PROFILE.credibilityStatement}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="tag tag-ok">16 Verified CV Roles</span>
              <span className="tag tag-warn">108 Undeployed Concepts</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Featured Interactive Prototypes */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="section-title">Featured Interactive Prototypes Across 6 Distinct Interfaces</h2>
            <p className="section-desc">
              Click any card to launch its full interactive prototype, Indonesian regulatory brief, and SVG system architecture.
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => onExploreAtlas()}>
            View all {projects.length} concepts
            <IconArrowRight size={13} />
          </button>
        </div>

        <div className="featured-grid">
          {featured.map((project) => (
            <button
              type="button"
              key={project.id}
              className="project-card"
              onClick={() => onOpenProject(project)}
            >
              <div className="project-card-preview">
                <MiniPreview project={project} />
              </div>
              <div className="project-card-body">
                <div className="project-card-top">
                  <span className="project-id">{project.id}</span>
                  <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
                </div>
                <h3 className="project-name">{project.name}</h3>
                <p className="project-tagline">{project.tagline}</p>
                <div className="project-card-foot">
                  <span>{project.platform}</span>
                  <span style={{ color: 'var(--ui-accent-ink)', fontWeight: 500 }}>Launch Prototype -&gt;</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 15-Sector Indonesian Tech Landscape Radar */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Indonesian Digital Economy Atlas — 15 Market Sectors</h2>
            <p className="section-desc">
              Every sector maps real 2025–2026 Indonesian infrastructure standards (QRIS Tap, BI-FAST, SATUSEHAT, CoreTax, UU PDP, RKAB/SIMBARA, IDXCarbon, BPJPH). Click any sector to inspect its concepts.
            </p>
          </div>
          <span className="tag tag-mono">108 Concepts · 18 UI Archetypes</span>
        </div>

        <div className="sector-radar-grid">
          {SECTORS.map((sector) => {
            const count = projects.filter((p) => p.sector === sector.id).length;
            return (
              <button
                type="button"
                key={sector.id}
                className="sector-radar-cell"
                onClick={() => onExploreAtlas(sector.id)}
              >
                <div className="sector-radar-head">
                  <span className="sector-radar-name">{sector.shortName}</span>
                  <span className="tag tag-mono">{count}</span>
                </div>
                <div className="sector-radar-thesis">{sector.indonesiaThesis}</div>
                <div className="tag-wrap" style={{ marginTop: 'auto', paddingTop: '4px' }}>
                  {sector.standards.slice(0, 2).map((st) => (
                    <span className="tag" style={{ fontSize: '10px' }} key={st}>{st}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
