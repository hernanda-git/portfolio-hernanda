import React, { useState } from 'react';
import { PRODUCTION_CASE_STUDIES } from '../data/caseStudies';
import type { ConceptProject } from '../data/projects';
import { useLanguage } from '../i18n/LanguageContext';
import { ArchitectureDiagram } from './ArchitectureDiagrams';
import { IconArrowRight, IconShield } from './Icons';

interface CaseStudiesViewProps {
  initialSlug?: string | null;
  projectsById: Record<string, ConceptProject>;
  onOpenProject: (project: ConceptProject) => void;
  onJumpToExperience: (expId: string) => void;
}

export const CaseStudiesView: React.FC<CaseStudiesViewProps> = ({
  initialSlug,
  projectsById,
  onOpenProject,
  onJumpToExperience,
}) => {
  const { lang } = useLanguage();
  const initialIndex = Math.max(
    0,
    PRODUCTION_CASE_STUDIES.findIndex((cs) => cs.slug === initialSlug)
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(initialIndex);

  React.useEffect(() => {
    if (initialSlug) {
      const idx = PRODUCTION_CASE_STUDIES.findIndex((cs) => cs.slug === initialSlug);
      if (idx >= 0) setSelectedIdx(idx);
    }
  }, [initialSlug]);

  const active = PRODUCTION_CASE_STUDIES[selectedIdx];

  return (
    <div className="cs-stack">
      {/* Header Banner */}
      <section className="panel arch-hero">
        <div className="arch-hero-body">
          <div className="hero-kicker">
            <span className="status-dot ok" />
            <span>
              {lang === 'en'
                ? 'Verified Production Proof | 6 Deep Engineering Case Studies'
                : 'Bukti Produksi Terverifikasi | 6 Studi Kasus Engineering Mendalam'}
            </span>
          </div>
          <h1 className="arch-hero-title">
            {lang === 'en'
              ? 'Real enterprise systems shipped under real operational constraints.'
              : 'Sistem enterprise nyata yang dirilis di bawah batasan operasional sesungguhnya.'}
          </h1>
          <p className="arch-hero-sub">
            {lang === 'en'
              ? 'Unlike the 152 exploratory blueprints in the Product Atlas, these six case studies document actual production platforms delivered for named enterprises, mining operations, banks, insurers, and communities (NDA-safe, zero fabricated screenshots).'
              : 'Berbeda dari 152 blueprint eksplorasi di Atlas Produk, enam studi kasus ini mendokumentasikan sistem produksi nyata yang dibangun untuk konglomerasi, tambang, perbankan, asuransi, dan komunitas (aman NDA, tanpa screenshot fiktif).'}
          </p>
        </div>

        {/* Case Study Selector Strip */}
        <div className="cs-selector-grid" role="tablist" aria-label={lang === 'en' ? 'Production Case Studies' : 'Studi Kasus Produksi'}>
          {PRODUCTION_CASE_STUDIES.map((cs, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={cs.id}
                className={`cs-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedIdx(idx)}
              >
                <div className="cs-tab-top">
                  <span className="cs-tab-code">{cs.code}</span>
                  <span className="cs-tab-metric">{cs.headlineMetric[lang]}</span>
                </div>
                <div className="cs-tab-client">{cs.client}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Case Study Deep Dive */}
      <article className="panel cs-detail" role="tabpanel">
        <div className="panel-header">
          <div style={{ minWidth: 0, flex: '1 1 420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span className="tag tag-ok">
                <IconShield size={11} />
                {active.commitment[lang]}
              </span>
              <span className="tag tag-mono">{active.period[lang]}</span>
              <span className="tag">{active.sector[lang]}</span>
            </div>
            <h2 className="section-title" style={{ fontSize: '20px' }}>{active.title[lang]}</h2>
            <p className="section-desc" style={{ fontWeight: 500, color: 'var(--ui-accent-ink)' }}>
              {active.client}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onJumpToExperience(active.experienceId)}
            >
              {lang === 'en' ? 'View Career Entry' : 'Lihat Riwayat Karier'}
              <IconArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="cs-body">
          <p className="cs-summary">{active.summary[lang]}</p>

          {/* Interactive SVG Architecture Diagram */}
          <div className="cs-diagram-section">
            <div className="brief-label" style={{ marginBottom: '8px' }}>
              {lang === 'en'
                ? 'NDA-SAFE REFERENCE ARCHITECTURE (CLICK NODES TO INSPECT)'
                : 'ARSITEKTUR RUJUKAN AMAN NDA (KLIK NODE UNTUK INSPEKSI)'}
            </div>
            <ArchitectureDiagram key={active.diagramId} diagramId={active.diagramId} />
          </div>

          {/* Problem Context + Constraints + Decisions + Outcomes */}
          <div className="cs-grid">
            <div className="cs-box">
              <div className="brief-label">
                {lang === 'en' ? '01 / OPERATIONAL CONTEXT' : '01 / KONTEKS OPERASIONAL'}
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.56, color: 'var(--ui-text-2)' }}>
                {active.context[lang]}
              </p>
            </div>

            <div className="cs-box">
              <div className="brief-label">
                {lang === 'en' ? '02 / REAL CONSTRAINTS' : '02 / BATASAN NYATA'}
              </div>
              <ul className="pipeline-list">
                {active.constraints[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="cs-box">
              <div className="brief-label">
                {lang === 'en' ? '03 / KEY ARCHITECTURE DECISIONS' : '03 / KEPUTUSAN ARSITEKTUR UTAMA'}
              </div>
              <ul className="pipeline-list">
                {active.architectureDecisions[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="cs-box cs-box-ok">
              <div className="brief-label">
                {lang === 'en' ? '04 / DELIVERED OUTCOMES' : '04 / HASIL YANG DICAPAI'}
              </div>
              <ul className="pipeline-list">
                {active.outcomes[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Stack + Related Atlas Blueprints */}
          <div className="exp-foot" style={{ paddingTop: '12px', borderTop: '1px solid var(--ui-line)' }}>
            <div className="tag-wrap">
              {active.stack.map((tech) => (
                <span className="tag tag-mono" key={tech}>{tech}</span>
              ))}
            </div>

            {active.relatedConceptIds.length > 0 && (
              <div className="exp-related">
                <span className="exp-related-label">
                  {lang === 'en' ? 'Related Atlas Blueprints:' : 'Blueprint Atlas Terkait:'}
                </span>
                {active.relatedConceptIds.map((cid) => {
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
        </div>
      </article>
    </div>
  );
};
