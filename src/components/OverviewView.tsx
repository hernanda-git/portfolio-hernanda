import React from 'react';
import { EXPERIENCES, PROFILE } from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { PROJECT_PAGES } from '../data/projectPages';
import { ARCHETYPE_LABELS, SECTORS, type SectorId } from '../data/sectors';
import { IconArrowRight, IconShield } from './Icons';

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
  const archetypeCount = Object.keys(ARCHETYPE_LABELS).length;
  const totalScreens = projects.reduce((sum, p) => sum + (PROJECT_PAGES[p.id]?.pages.length ?? 4), 0);

  const stats = [
    {
      label: 'Rekayasa Produksi',
      value: '10+ Thn',
      detail: `${PROFILE.activeSince}–2026 lintas enterprise & startup`,
    },
    {
      label: 'Pengalaman CV Valid',
      value: `${EXPERIENCES.length} Peran`,
      detail: 'Fintech, Pertambangan, Asuransi, Logistik, AI, GovTech',
    },
    {
      label: 'Atlas Konsep Produk',
      value: `${projects.length} Konsep`,
      detail: `${totalScreens} halaman UI/UX · ${SECTORS.length} sektor pasar`,
    },
    {
      label: 'Skala Sistem Utama',
      value: '80+ App',
      detail: 'Orkestrasi workflow approval konglomerasi',
    },
  ];

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
              <span>Aktif Sejak {PROFILE.activeSince}</span>
              <span>·</span>
              <span>.NET · Solution Architecture · AI Inference</span>
            </div>
            <h1 className="hero-title">
              Merancang perangkat lunak enterprise yang tangguh &amp; memetakan {projects.length} produk digital untuk ekonomi Indonesia.
            </h1>
            <p className="hero-lead">{PROFILE.summary[0]}</p>
            <p className="hero-lead">{PROFILE.summary[1]}</p>
          </div>

          <div className="hero-cta-row">
            <button type="button" className="btn btn-primary" onClick={() => onExploreAtlas()}>
              Jelajahi {projects.length} Konsep Produk
              <IconArrowRight size={14} />
            </button>
            <button type="button" className="btn" onClick={onOpenExperience}>
              Lihat Karier Terverifikasi (2016–2026)
            </button>
            <a className="btn" href={`mailto:${PROFILE.email}`}>
              Diskusi Langsung
            </a>
          </div>
        </div>

        <aside className="hero-side">
          <div className="stat-grid">
            {stats.map((st) => (
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
                <span>Pengalaman Nyata vs. Eksplorasi Konseptual</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.48 }}>{PROFILE.credibilityStatement}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="tag tag-ok">{EXPERIENCES.length} Pengalaman CV Valid</span>
              <span className="tag tag-warn">{projects.length} Konsep Belum Deploy</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Featured Product Concepts */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="section-title">Konsep Produk Unggulan Lintas 6 Disiplin UI/UX</h2>
            <p className="section-desc">
              Klik tangkapan layar produk mana saja untuk meninjau desain UI/UX penuh 1280×800, ringkasan pasar Indonesia, dan arsitektur sistem berlapisnya.
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => onExploreAtlas()}>
            Lihat seluruh {projects.length} konsep
            <IconArrowRight size={13} />
          </button>
        </div>

        <div className="featured-grid">
          {featured.map((project) => {
            const art = PROJECT_PAGES[project.id];
            const pageCount = art?.pages.length ?? 4;
            return (
              <button
                type="button"
                key={project.id}
                className="project-card"
                onClick={() => onOpenProject(project)}
              >
                <div className="project-card-shot">
                  <img
                    src={`./screenshots/${project.id}.webp`}
                    alt={`Tampilan UI/UX ${project.name}`}
                    className="project-card-img"
                  />
                </div>
                <div className="project-card-body">
                  <div className="project-card-top">
                    <span className="project-id">{project.id}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {art?.enterpriseVerified && <span className="tag tag-ok">Enterprise</span>}
                      <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
                    </div>
                  </div>
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-tagline">{project.tagline}</p>
                  <div className="project-card-foot">
                    <span>{project.platform} · {pageCount} Halaman UI</span>
                    <span style={{ color: 'var(--ui-accent-ink)', fontWeight: 500 }}>Buka {pageCount} Halaman -&gt;</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 15-Sector Indonesian Tech Landscape Radar */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="section-title">Atlas Ekonomi Digital Indonesia — {SECTORS.length} Sektor Pasar</h2>
            <p className="section-desc">
              Setiap sektor memetakan standar infrastruktur nyata Indonesia 2025–2026 (QRIS Tap, BI-FAST, SATUSEHAT, CoreTax, UU PDP, RKAB/SIMBARA, IDXCarbon, BPJPH, SPBE). Klik sektor mana saja untuk menyaring konsepnya.
            </p>
          </div>
          <span className="tag tag-mono">{projects.length} Konsep · {archetypeCount} Arketipe UI</span>
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
