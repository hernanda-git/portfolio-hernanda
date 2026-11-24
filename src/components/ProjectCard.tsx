import { useEffect, useRef, useState } from 'react';
import { getPageScreenshotUrl, PROJECT_PAGES } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { getArchetypeLabel } from '../data/sectors';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { projectPath } from '../routes';
import { IconArrowRight } from './Icons';

export function ProjectCard({ project }: { project: ConceptProject }) {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].atlas;
  const plan = PROJECT_PAGES[project.id];
  const count = plan.pages.length;
  const isEnterprise = Boolean(plan.enterpriseVerified);
  const shotUrl = getPageScreenshotUrl(project.id, 'p1');

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImgLoaded(true);
    } else {
      setImgLoaded(false);
    }
  }, [shotUrl]);

  return (
    <a className="project-card" href={projectPath(project)}>
      <div className={`project-card-shot ${imgLoaded ? 'is-loaded' : ''}`}>
        {!imgLoaded && <div className="skeleton-shimmer project-shot-skeleton" aria-hidden="true" />}
        <img
          ref={imgRef}
          src={shotUrl}
          alt={copy.screenshotAlt(project.name)}
          className={`project-card-img ${imgLoaded ? 'is-loaded' : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      </div>
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="project-id">{project.id}</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isEnterprise && <span className="tag tag-ok">Enterprise</span>}
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
