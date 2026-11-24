import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { getPageScreenshotUrl, PROJECT_PAGES, type ProjectPageSpec } from '../data/projectPages';
import { getLocalizedPageTitle } from '../data/projectsEn';
import type { ConceptProject } from '../data/projectTypes';
import { EXPERIENCES } from '../data/profile';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { projectPath, SECTION_PATHS } from '../routes';
import { IconArrowLeft, IconArrowRight, IconClose, IconExternal, IconMoon, IconSearch, IconSun } from './Icons';
import '../styles/prototype.css';

import type { ArchetypeId } from '../data/sectors';

const AtlasSurface = lazy(() => import('../prototypes/AtlasSurface'));
const TreasurySurface = lazy(() => import('../prototypes/TreasurySurface'));
const TapNusaSurface = lazy(() => import('../prototypes/TapNusaSurface'));
const AiWorkbenchEngine = lazy(() => import('../prototypes/engines/AiWorkbenchEngine'));
const FintechLedgerEngine = lazy(() => import('../prototypes/engines/FintechLedgerEngine'));
const WorkflowApprovalEngine = lazy(() => import('../prototypes/engines/WorkflowApprovalEngine'));
const ClinicalEmrEngine = lazy(() => import('../prototypes/engines/ClinicalEmrEngine'));
const GeoDispatchEngine = lazy(() => import('../prototypes/engines/GeoDispatchEngine'));
const IndustrialScadaEngine = lazy(() => import('../prototypes/engines/IndustrialScadaEngine'));

const BESPOKE_INTERACTIVE_IDS = new Set(['ID-011', 'ID-012']);
const DOMAIN_ENGINE_BY_ARCHETYPE: Partial<Record<ArchetypeId, typeof AtlasSurface>> = {
  'ai-agent-workbench': AiWorkbenchEngine,
  'fintech-ledger': FintechLedgerEngine,
  'kanban-workflow': WorkflowApprovalEngine,
  'clinical-emr': ClinicalEmrEngine,
  'geo-dispatch': GeoDispatchEngine,
  'iot-scada': IndustrialScadaEngine,
};

interface Props {
  project: ConceptProject;
  page: ProjectPageSpec;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommand: () => void;
  onJumpToExperience: (id: string) => void;
}

export function PrototypeWorkspace({ project, page, theme, onToggleTheme, onOpenCommand, onJumpToExperience }: Props) {
  const { lang, setLang } = useLanguage();
  const copy = UI_COPY[lang];
  const pCopy = copy.prototype;

  const plan = PROJECT_PAGES[project.id];
  const pages = plan.pages;
  const position = pages.indexOf(page);
  const isEnterprise = Boolean(plan.enterpriseVerified);
  const domainEngine = DOMAIN_ENGINE_BY_ARCHETYPE[project.archetype];
  const hasBespokeInteractive = BESPOKE_INTERACTIVE_IDS.has(project.id) || Boolean(domainEngine);
  const Surface =
    project.id === 'ID-012'
      ? TreasurySurface
      : project.id === 'ID-011'
        ? TapNusaSurface
        : domainEngine ?? AtlasSurface;
  const previous = pages[position - 1];
  const next = pages[position + 1];
  const experience = project.cvLink && EXPERIENCES.find((entry) => entry.id === project.cvLink);
  const heading = useRef<HTMLHeadingElement>(null);

  const [viewMode, setViewMode] = useState<'design' | 'interactive'>(() =>
    hasBespokeInteractive ? 'interactive' : 'design'
  );
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100' | '150'>('fit');

  useEffect(() => {
    setViewMode(hasBespokeInteractive ? 'interactive' : 'design');
    setZoomOpen(false);
    setZoomLevel('fit');
  }, [project.id, hasBespokeInteractive]);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    setZoomOpen(false);
  }, [page]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      else if (e.key === '+' || e.key === '=') setZoomLevel((z) => (z === 'fit' ? '100' : '150'));
      else if (e.key === '-') setZoomLevel((z) => (z === '150' ? '100' : 'fit'));
      else if (e.key === '0') setZoomLevel('fit');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomOpen]);

  const resLabel = plan.resolution ?? '1280x800';
  const activeShotUrl = getPageScreenshotUrl(project.id, page.slug);
  const currentTitle = getLocalizedPageTitle(project.id, page, lang);
  const prevTitle = previous ? getLocalizedPageTitle(project.id, previous, lang) : '';
  const nextTitle = next ? getLocalizedPageTitle(project.id, next, lang) : '';

  const navigation = (
    <nav className="prototype-pages" aria-label={pCopy.pagesNavAria}>
      {pages.map((entry, index) => (
        <a key={entry.slug} href={projectPath(project, entry)} aria-current={entry === page ? 'page' : undefined}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          {getLocalizedPageTitle(project.id, entry, lang)}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="prototype-workspace">
      <header className="prototype-heading">
        <div className="prototype-crumbs">
          <a href={SECTION_PATHS.atlas}><IconArrowLeft size={14} /> Atlas</a>
          <span aria-hidden="true">/</span>
          <span>{project.name}</span>
          <span className="prototype-project-id">{project.id}</span>
          {isEnterprise && <span className="tag tag-ok">{pCopy.enterpriseVerifiedTag(pages.length)}</span>}
        </div>
        <div className="prototype-header-actions">
          <div className="segmented" role="tablist" aria-label={pCopy.viewModeAria}>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'design'}
              className={`seg-btn ${viewMode === 'design' ? 'is-active' : ''}`}
              onClick={() => setViewMode('design')}
            >
              {isEnterprise ? pCopy.enterpriseDesignTab(resLabel) : pCopy.uiDesignTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'interactive'}
              className={`seg-btn ${viewMode === 'interactive' ? 'is-active' : ''}`}
              onClick={() => setViewMode('interactive')}
            >
              {hasBespokeInteractive ? pCopy.interactiveProtoTab : pCopy.interactiveSimTab}
            </button>
          </div>
          <div className="lang-switch" role="group" aria-label={copy.switchLanguageAria}>
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'id' ? 'is-active' : ''}`}
              onClick={() => setLang('id')}
              aria-pressed={lang === 'id'}
            >
              ID
            </button>
          </div>
          <button className="icon-btn" type="button" onClick={onOpenCommand} aria-label={pCopy.searchProtoAria} title={pCopy.searchProtoAria}>
            <IconSearch size={16} />
          </button>
          <button
            className="icon-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? copy.switchToDark : copy.switchToLight}
            title={theme === 'light' ? copy.switchToDark : copy.switchToLight}
          >
            {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
          </button>
        </div>
      </header>

      <aside className="prototype-sidebar">
        <div className="prototype-pages-desktop">{navigation}</div>
        <details className="prototype-pages-mobile" key={page.slug}>
          <summary>{pCopy.pageOf(position + 1, pages.length)}</summary>
          {navigation}
        </details>
      </aside>

      <div className="prototype-content">
        <div className="proto-title-row">
          <h1 tabIndex={-1} ref={heading}>{currentTitle}</h1>
          {plan.designReference && (
            <span className="tag">Ref: {plan.designReference}</span>
          )}
        </div>

        {viewMode === 'design' ? (
          <div className="proto-design-wrap">
            <div className="proto-stage">
              <div className="proto-stage-bar">
                <div className="proto-stage-meta">
                  <span className="status-dot ok" />
                  <strong>{pCopy.pageBadge(String(position + 1).padStart(2, '0'), String(pages.length).padStart(2, '0'))}</strong>
                  <span className="tag tag-mono">{resLabel}</span>
                  {lang === 'en' && <span className="tag">ID Regulatory Mockup</span>}
                  <span className="tag tag-mono">{plan.persona}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setZoomLevel('fit');
                    setZoomOpen(true);
                  }}
                >
                  <IconExternal size={13} />
                  {pCopy.zoomInspectBtn}
                </button>
              </div>
              <button
                type="button"
                className="proto-shot-btn"
                onClick={() => {
                  setZoomLevel('fit');
                  setZoomOpen(true);
                }}
                title={pCopy.zoomHint(resLabel)}
              >
                <img
                  key={activeShotUrl}
                  src={activeShotUrl}
                  alt={`${project.name} - ${currentTitle} (${resLabel})`}
                  className="proto-shot-img"
                />
              </button>
            </div>

            <div
              className="proto-filmstrip"
              style={{ ['--page-cols' as string]: String(pages.length) }}
              aria-label={pCopy.filmstripAria}
            >
              {pages.map((entry, idx) => {
                const entryTitle = getLocalizedPageTitle(project.id, entry, lang);
                return (
                  <a
                    key={entry.slug}
                    href={projectPath(project, entry)}
                    className={`proto-thumb ${entry === page ? 'is-active' : ''}`}
                  >
                    <div className="proto-thumb-frame">
                      <img
                        src={getPageScreenshotUrl(project.id, entry.slug)}
                        alt={pCopy.previewAlt(entryTitle)}
                        loading="lazy"
                      />
                    </div>
                    <div className="proto-thumb-label">
                      <span className="proto-thumb-num">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="proto-thumb-text">{entryTitle}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <Suspense fallback={<p className="prototype-loading" role="status">{pCopy.loadingProto}</p>}>
            <Surface project={project} page={page} />
          </Suspense>
        )}

        <nav className="prototype-pager" aria-label={pCopy.pagerAria}>
          {previous && <a href={projectPath(project, previous)}><IconArrowLeft size={16} /> {prevTitle}</a>}
          {next && <a href={projectPath(project, next)}>{nextTitle} <IconArrowRight size={16} /></a>}
        </nav>

        <details className="prototype-about">
          <summary>{pCopy.aboutPrefix(project.name)}</summary>
          <div>
            <p>{project.summary}</p>
            <h2>{pCopy.problemHeading}</h2>
            <p>{project.problem}</p>
            <h2>{pCopy.contextHeading}</h2>
            <p>{project.indonesiaContext}</p>
            <h2>{pCopy.scopeHeading}</h2>
            <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <h2>{pCopy.refArchHeading}</h2>
            <dl>{([
              [pCopy.archLabels.client, project.architecture.client],
              [pCopy.archLabels.edge, project.architecture.edge],
              [pCopy.archLabels.core, project.architecture.core],
              [pCopy.archLabels.integration, project.architecture.integration],
              [pCopy.archLabels.storage, project.architecture.storage],
              [pCopy.archLabels.stack, project.stack.join(' | ')],
              [pCopy.archLabels.standards, project.standards.join(' | ')],
            ]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            {experience && (
              <button type="button" className="btn" onClick={() => onJumpToExperience(experience.id)}>
                {pCopy.relatedExpBtn(experience.company)}
              </button>
            )}
          </div>
        </details>
      </div>

      {zoomOpen && (
        <div
          className="proto-lightbox-backdrop"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={pCopy.zoomDialogAria(project.name, currentTitle)}
        >
          <div className="proto-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <div className="proto-lightbox-bar">
              <span className="tag-mono" style={{ fontSize: '12px' }}>
                {project.id} | {project.name} - {String(position + 1).padStart(2, '0')}/{String(pages.length).padStart(2, '0')}: {currentTitle} ({resLabel})
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="segmented" role="group" aria-label={pCopy.zoomLevelAria}>
                  {(['fit', '100', '150'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`seg-btn ${zoomLevel === lvl ? 'is-active' : ''}`}
                      style={{ height: '26px', padding: '0 9px', fontSize: '11px' }}
                      onClick={() => setZoomLevel(lvl)}
                    >
                      {lvl === 'fit' ? 'Fit' : `${lvl}%`}
                    </button>
                  ))}
                </div>
                {previous && (
                  <a className="btn btn-sm" href={projectPath(project, previous)}>
                    <IconArrowLeft size={12} /> {pCopy.prevBtn}
                  </a>
                )}
                {next && (
                  <a className="btn btn-sm" href={projectPath(project, next)}>
                    {pCopy.nextBtn} <IconArrowRight size={12} />
                  </a>
                )}
                <button type="button" className="btn btn-sm" onClick={() => setZoomOpen(false)}>
                  <IconClose size={12} /> {pCopy.closeEscBtn}
                </button>
              </div>
            </div>
            <div className={`proto-lightbox-viewport is-zoom-${zoomLevel}`}>
              <img
                src={activeShotUrl}
                alt={pCopy.fullResAlt(project.name, currentTitle)}
                className="proto-lightbox-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
