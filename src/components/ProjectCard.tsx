import { useEffect, useRef, useState } from 'react';
import { getCardThumbnailUrl, PROJECT_PAGES } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { getArchetypeLabel } from '../data/sectors';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { projectPath } from '../routes';
import { IconArrowRight } from './Icons';

const BESPOKE_IDS = new Set(['ID-011', 'ID-012']);
const LIVE_ENGINE_ARCHETYPES = new Set([
  'ai-agent-workbench',
  'fintech-ledger',
  'kanban-workflow',
  'clinical-emr',
  'geo-dispatch',
  'iot-scada',
]);

export function ProjectCard({ project }: { project: ConceptProject }) {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].atlas;
  const plan = PROJECT_PAGES[project.id];
  const count = plan.pages.length;
  const isBespoke = BESPOKE_IDS.has(project.id) || LIVE_ENGINE_ARCHETYPES.has(project.archetype);
  const isDeepBlueprint = Boolean(plan.enterpriseVerified);
  const thumbUrl = getCardThumbnailUrl(project.id);

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgState('loaded');
    } else {
      setImgState('loading');
    }
  }, [thumbUrl]);

  return (
    <a className="project-card" href={projectPath(project)}>
      <div className={`project-card-shot ${imgState === 'loaded' ? 'is-loaded' : ''}`}>
        {imgState === 'loading' && <div className="skeleton-shimmer project-shot-skeleton" aria-hidden="true" />}
        {imgState === 'error' ? (
          <div className="project-shot-fallback" aria-hidden="true">
            <span className="tag tag-mono">{project.id}</span>
            <span>{project.name}</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={thumbUrl}
            alt={copy.screenshotAlt(project.name)}
            className={`project-card-img ${imgState === 'loaded' ? 'is-loaded' : ''}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgState('loaded')}
            onError={() => setImgState('error')}
          />
        )}
        {lang === 'en' && imgState !== 'error' && (
          <span className="shot-lang-pill" title="Indonesian regulatory UI mockup">
            ID UI Mockup
          </span>
        )}
      </div>
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="project-id">{project.id}</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isBespoke ? (
              <span className="tag tag-ok">{lang === 'en' ? 'Interactive App' : 'Aplikasi Interaktif'}</span>
            ) : isDeepBlueprint ? (
              <span className="tag tag-accent">{lang === 'en' ? 'Deep Blueprint' : 'Blueprint Lengkap'}</span>
            ) : null}
            <span className="tag">{getArchetypeLabel(project.archetype, lang)}</span>
          </div>
        </div>
        <h3 className="project-name">{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <div className="project-card-foot">
          <span>{copy.cardPagesUnit(count)} | {project.platform}</span>
          <span>{copy.openCaseStudy} <IconArrowRight size={14} /></span>
        </div>
      </div>
    </a>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="project-card project-card-skeleton" aria-hidden="true">
      <div className="project-card-shot">
        <div className="skeleton-shimmer project-shot-skeleton" />
      </div>
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="skeleton-shimmer skel-line" style={{ width: '48px', height: '12px' }} />
          <span className="skeleton-shimmer skel-pill" style={{ width: '88px', height: '18px' }} />
        </div>
        <span className="skeleton-shimmer skel-line" style={{ width: '68%', height: '18px' }} />
        <span className="skeleton-shimmer skel-line" style={{ width: '100%', height: '13px' }} />
        <span className="skeleton-shimmer skel-line" style={{ width: '82%', height: '13px' }} />
        <div className="project-card-foot" style={{ marginTop: 'auto' }}>
          <span className="skeleton-shimmer skel-line" style={{ width: '110px', height: '12px' }} />
          <span className="skeleton-shimmer skel-line" style={{ width: '84px', height: '12px' }} />
        </div>
      </div>
    </div>
  );
}
