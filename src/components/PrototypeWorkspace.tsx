import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { getPageScreenshotUrl, PROJECT_PAGES, type ProjectPageSpec } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { EXPERIENCES } from '../data/profile';
import { projectPath, SECTION_PATHS } from '../routes';
import { IconArrowLeft, IconArrowRight, IconClose, IconExternal, IconMoon, IconSearch, IconSun } from './Icons';
import '../styles/prototype.css';

const AtlasSurface = lazy(() => import('../prototypes/AtlasSurface'));
const TreasurySurface = lazy(() => import('../prototypes/TreasurySurface'));
const TapNusaSurface = lazy(() => import('../prototypes/TapNusaSurface'));

const BESPOKE_INTERACTIVE_IDS = new Set(['ID-011', 'ID-012']);

interface Props {
  project: ConceptProject;
  page: ProjectPageSpec;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommand: () => void;
  onJumpToExperience: (id: string) => void;
}

export function PrototypeWorkspace({ project, page, theme, onToggleTheme, onOpenCommand, onJumpToExperience }: Props) {
  const plan = PROJECT_PAGES[project.id];
  const pages = plan.pages;
  const position = pages.indexOf(page);
  const isEnterprise = Boolean(plan.enterpriseVerified);
  const hasBespokeInteractive = BESPOKE_INTERACTIVE_IDS.has(project.id);
  const Surface = project.id === 'ID-012' ? TreasurySurface : project.id === 'ID-011' ? TapNusaSurface : AtlasSurface;
  const previous = pages[position - 1];
  const next = pages[position + 1];
  const experience = project.cvLink && EXPERIENCES.find(entry => entry.id === project.cvLink);
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

  const resLabel = plan.resolution ?? '1280×800';
  const activeShotUrl = getPageScreenshotUrl(project.id, page.slug);

  const navigation = (
    <nav className="prototype-pages" aria-label="Halaman prototipe">
      {pages.map((entry, index) => (
        <a key={entry.slug} href={projectPath(project, entry)} aria-current={entry === page ? 'page' : undefined}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{entry.title}
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
          {isEnterprise && <span className="tag tag-ok">Enterprise Verified · {pages.length} Hal</span>}
        </div>
        <div className="prototype-header-actions">
          <div className="segmented" role="tablist" aria-label="Mode tampilan studi kasus">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'design'}
              className={`seg-btn ${viewMode === 'design' ? 'is-active' : ''}`}
              onClick={() => setViewMode('design')}
            >
              {isEnterprise ? `Desain Enterprise (${resLabel})` : 'Desain UI/UX'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'interactive'}
              className={`seg-btn ${viewMode === 'interactive' ? 'is-active' : ''}`}
              onClick={() => setViewMode('interactive')}
            >
              {hasBespokeInteractive ? 'Prototipe Interaktif' : 'Simulasi Interaktif'}
            </button>
          </div>
          <button className="icon-btn" type="button" onClick={onOpenCommand} aria-label="Cari prototipe" title="Cari prototipe"><IconSearch size={16} /></button>
          <button className="icon-btn" type="button" onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Ubah ke tema gelap' : 'Ubah ke tema terang'}
            title={theme === 'light' ? 'Ubah ke tema gelap' : 'Ubah ke tema terang'}>
            {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
          </button>
        </div>
      </header>

      <aside className="prototype-sidebar">
        <div className="prototype-pages-desktop">{navigation}</div>
        <details className="prototype-pages-mobile" key={page.slug}>
          <summary>Halaman {position + 1} dari {pages.length}</summary>
          {navigation}
        </details>
      </aside>

      <div className="prototype-content">
        <div className="proto-title-row">
          <h1 tabIndex={-1} ref={heading}>{page.title}</h1>
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
                  <strong>Halaman {String(position + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</strong>
                  <span className="tag tag-mono">{resLabel}</span>
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
                  Zoom &amp; Inspeksi
                </button>
              </div>
              <button
                type="button"
                className="proto-shot-btn"
                onClick={() => {
                  setZoomLevel('fit');
                  setZoomOpen(true);
                }}
                title={`Klik untuk inspeksi Zoom Fit / 100% / 150% (${resLabel})`}
              >
                <img
                  key={activeShotUrl}
                  src={activeShotUrl}
                  alt={`${project.name} — ${page.title} (${resLabel})`}
                  className="proto-shot-img"
                />
              </button>
            </div>

            <div
              className="proto-filmstrip"
              style={{ ['--page-cols' as string]: String(pages.length) }}
              aria-label="Pratinjau seluruh halaman"
            >
              {pages.map((entry, idx) => (
                <a
                  key={entry.slug}
                  href={projectPath(project, entry)}
                  className={`proto-thumb ${entry === page ? 'is-active' : ''}`}
                >
                  <div className="proto-thumb-frame">
                    <img
                      src={getPageScreenshotUrl(project.id, entry.slug)}
                      alt={`Pratinjau ${entry.title}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="proto-thumb-label">
                    <span className="proto-thumb-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="proto-thumb-text">{entry.title}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <Suspense fallback={<p className="prototype-loading" role="status">Memuat prototipe…</p>}>
            <Surface project={project} page={page} />
          </Suspense>
        )}

        <nav className="prototype-pager" aria-label="Halaman sebelum dan sesudah">
          {previous && <a href={projectPath(project, previous)}><IconArrowLeft size={16} /> {previous.title}</a>}
          {next && <a href={projectPath(project, next)}>{next.title} <IconArrowRight size={16} /></a>}
        </nav>

        <details className="prototype-about">
          <summary>Tentang {project.name}</summary>
          <div>
            <p>{project.summary}</p>
            <h2>Masalah</h2>
            <p>{project.problem}</p>
            <h2>Konteks Indonesia</h2>
            <p>{project.indonesiaContext}</p>
            <h2>Cakupan produk</h2>
            <ul>{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            <h2>Arsitektur rujukan</h2>
            <dl>{([
              ['Klien', project.architecture.client], ['Gateway', project.architecture.edge],
              ['Domain', project.architecture.core], ['Integrasi', project.architecture.integration],
              ['Penyimpanan', project.architecture.storage], ['Stack', project.stack.join(' · ')],
              ['Standar', project.standards.join(' · ')],
            ]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            {experience && <button type="button" className="btn" onClick={() => onJumpToExperience(experience.id)}>Pengalaman terkait: {experience.company}</button>}
          </div>
        </details>
      </div>

      {zoomOpen && (
        <div
          className="proto-lightbox-backdrop"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Inspeksi Zoom ${project.name} — ${page.title}`}
        >
          <div className="proto-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <div className="proto-lightbox-bar">
              <span className="tag-mono" style={{ fontSize: '12px' }}>
                {project.id} · {project.name} — {String(position + 1).padStart(2, '0')}/{String(pages.length).padStart(2, '0')}: {page.title} ({resLabel})
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="segmented" role="group" aria-label="Level zoom">
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
                    <IconArrowLeft size={12} /> Prev
                  </a>
                )}
                {next && (
                  <a className="btn btn-sm" href={projectPath(project, next)}>
                    Next <IconArrowRight size={12} />
                  </a>
                )}
                <button type="button" className="btn btn-sm" onClick={() => setZoomOpen(false)}>
                  <IconClose size={12} /> Tutup (Esc)
                </button>
              </div>
            </div>
            <div className={`proto-lightbox-viewport is-zoom-${zoomLevel}`}>
              <img
                src={activeShotUrl}
                alt={`Resolusi penuh ${project.name} — ${page.title}`}
                className="proto-lightbox-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
