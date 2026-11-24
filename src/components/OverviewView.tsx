import React from 'react';
import { PRODUCTION_CASE_STUDIES } from '../data/caseStudies';
import { EXPERIENCES, PROFILE } from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { PROJECT_PAGES } from '../data/projectPages';
import {
  ARCHETYPE_LABELS,
  getSectorShortName,
  getSectorThesis,
  SECTORS,
  type SectorId,
} from '../data/sectors';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { IconArrowRight, IconShield } from './Icons';
import { ProjectCard } from './ProjectCard';

interface OverviewViewProps {
  projects: ConceptProject[];
  onExploreAtlas: (sector?: SectorId) => void;
  onOpenExperience: () => void;
  onOpenCaseStudies: (slug?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  projects,
  onExploreAtlas,
  onOpenExperience,
  onOpenCaseStudies,
}) => {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].overview;

  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const archetypeCount = Object.keys(ARCHETYPE_LABELS).length;
  const totalScreens = projects.reduce((sum, p) => sum + (PROJECT_PAGES[p.id]?.pages.length ?? 4), 0);

  const stats = [
    {
      label: copy.stats.prodEngLabel,
      value: copy.stats.prodEngVal,
      detail: copy.stats.prodEngDetail(PROFILE.activeSince),
    },
    {
      label: lang === 'en' ? 'Production Case Studies' : 'Studi Kasus Produksi',
      value: `${PRODUCTION_CASE_STUDIES.length} ${lang === 'en' ? 'Deep Dives' : 'Sistem'}`,
      detail: lang === 'en' ? 'Trakindo, GRC, Amman, Adaro, OCBC, Inhealth' : 'Trakindo, GRC, Amman, Adaro, OCBC, Inhealth',
    },
    {
      label: copy.stats.scaleLabel,
      value: copy.stats.scaleVal,
      detail: copy.stats.scaleDetail,
    },
    {
      label: lang === 'en' ? 'Architecture Lab (R&D)' : 'Lab Arsitektur (R&D)',
      value: copy.stats.atlasVal(projects.length),
      detail: copy.stats.atlasDetail(totalScreens, SECTORS.length),
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
              <span>{PROFILE.location} | {PROFILE.timezone}</span>
              <span>|</span>
              <span>{copy.activeSince(PROFILE.activeSince)}</span>
              <span>|</span>
              <span>{copy.heroDomain}</span>
            </div>
            <h1 className="hero-title">
              {lang === 'en'
                ? 'Principal .NET & AI systems architect shipping enterprise platforms across Indonesia and SEA.'
                : 'Principal .NET & AI systems architect yang membangun sistem enterprise tangguh di Indonesia dan Asia Tenggara.'}
            </h1>
            <p className="hero-lead">{PROFILE.summary[lang][0]}</p>
            <p className="hero-lead">{PROFILE.summary[lang][2]}</p>
          </div>

          <div className="hero-cta-row">
            <button type="button" className="btn btn-primary" onClick={() => onOpenCaseStudies()}>
              {lang === 'en' ? 'Inspect 6 Production Case Studies' : 'Lihat 6 Studi Kasus Produksi'}
              <IconArrowRight size={14} />
            </button>
            <button type="button" className="btn" onClick={onOpenExperience}>
              {copy.viewCareerBtn}
            </button>
            <a className="btn" href={`mailto:${PROFILE.email}`}>
              {copy.directContactBtn}
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
                <span>{copy.credibilityTitle}</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.48 }}>{PROFILE.credibilityStatement[lang]}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="tag tag-ok">{copy.verifiedRolesTag(EXPERIENCES.length)}</span>
              <span className="tag tag-warn">{copy.conceptsNotDeployedTag(projects.length)}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* PRIMARY PROOF: 6 Deep Production Case Studies */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="section-title">
              {lang === 'en' ? 'Selected Production Case Studies' : 'Studi Kasus Produksi Pilihan'}
            </h2>
            <p className="section-desc">
              {lang === 'en'
                ? 'Deployed enterprise platforms, mining field systems, banking encryption, and internal AI infrastructure with NDA-safe architecture blueprints.'
                : 'Platform enterprise produksi, aplikasi lapangan tambang, enkripsi perbankan, dan infrastruktur AI internal lengkap dengan blueprint arsitektur aman NDA.'}
            </p>
          </div>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => onOpenCaseStudies()}>
            {lang === 'en' ? 'Open full case study dossier' : 'Buka dossier studi kasus lengkap'}
            <IconArrowRight size={13} />
          </button>
        </div>

        <div className="cs-home-grid">
          {PRODUCTION_CASE_STUDIES.map((cs) => (
            <button
              type="button"
              key={cs.id}
              className="cs-home-card"
              onClick={() => onOpenCaseStudies(cs.slug)}
            >
              <div className="cs-home-card-top">
                <span className="tag tag-ok">{cs.code}</span>
                <span className="tag tag-mono">{cs.headlineMetric[lang]}</span>
              </div>
              <h3 className="cs-home-title">{cs.title[lang]}</h3>
              <div className="cs-home-client">{cs.client}</div>
              <p className="cs-home-desc">{cs.summary[lang]}</p>
              <div className="cs-home-foot">
                <div className="tag-wrap">
                  {cs.stack.slice(0, 3).map((tech) => (
                    <span className="tag tag-mono" style={{ fontSize: '10px' }} key={tech}>{tech}</span>
                  ))}
                </div>
                <span className="cs-home-cta">
                  {lang === 'en' ? 'Architecture & details' : 'Arsitektur & detail'}
                  <IconArrowRight size={12} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECONDARY R&D LAB: Featured Product Atlas Blueprints */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="section-title">
              {lang === 'en' ? 'Product Architecture Lab (Exploratory Blueprints)' : 'Lab Arsitektur Produk (Blueprint Eksplorasi)'}
            </h2>
            <p className="section-desc">
              {lang === 'en'
                ? 'Selected interactive concept blueprints from the 152-product Indonesian Digital Economy Atlas (not deployed client work).'
                : 'Blueprint konsep interaktif pilihan dari 152 produk Atlas Ekonomi Digital Indonesia (eksplorasi R&D, bukan deployment klien).'}
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => onExploreAtlas()}>
            {copy.viewAllConceptsBtn(projects.length)}
            <IconArrowRight size={13} />
          </button>
        </div>

        <div className="featured-grid">
          {featured.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>

      {/* 15-Sector Indonesian Tech Landscape Radar */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="section-title">{copy.radarHeading(SECTORS.length)}</h2>
            <p className="section-desc">{copy.radarDesc}</p>
          </div>
          <span className="tag tag-mono">{copy.radarSummaryTag(projects.length, archetypeCount)}</span>
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
                  <span className="sector-radar-name">{getSectorShortName(sector, lang)}</span>
                  <span className="tag tag-mono">{count}</span>
                </div>
                <div className="sector-radar-thesis">{getSectorThesis(sector, lang)}</div>
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
