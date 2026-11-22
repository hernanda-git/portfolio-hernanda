import { lazy, Suspense, useEffect, useRef } from 'react';
import { PROJECT_PAGES, type ProjectPageSpec } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { EXPERIENCES } from '../data/profile';
import { projectPath, SECTION_PATHS } from '../routes';
import { IconArrowLeft, IconArrowRight, IconMoon, IconSearch, IconSun } from './Icons';
import '../styles/prototype.css';

const AtlasSurface = lazy(() => import('../prototypes/AtlasSurface'));
const TreasurySurface = lazy(() => import('../prototypes/TreasurySurface'));
const TapNusaSurface = lazy(() => import('../prototypes/TapNusaSurface'));

interface Props {
  project: ConceptProject;
  page: ProjectPageSpec;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommand: () => void;
  onJumpToExperience: (id: string) => void;
}

export function PrototypeWorkspace({ project, page, theme, onToggleTheme, onOpenCommand, onJumpToExperience }: Props) {
  const pages = PROJECT_PAGES[project.id].pages;
  const position = pages.indexOf(page);
  const Surface = project.id === 'ID-012' ? TreasurySurface : project.id === 'ID-011' ? TapNusaSurface : AtlasSurface;
  const previous = pages[position - 1];
  const next = pages[position + 1];
  const experience = project.cvLink && EXPERIENCES.find(entry => entry.id === project.cvLink);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [page]);

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
        </div>
        <div className="prototype-header-actions">
          <span className="prototype-environment">Simulasi lokal</span>
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
        <h1 tabIndex={-1} ref={heading}>{page.title}</h1>
        <Suspense fallback={<p className="prototype-loading" role="status">Memuat prototipe…</p>}>
          <Surface project={project} page={page} />
        </Suspense>

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
    </div>
  );
}
