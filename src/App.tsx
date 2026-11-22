import React, { useCallback, useEffect, useState } from 'react';
import { ArchitectureView } from './components/ArchitectureView';
import { AtlasView } from './components/AtlasView';
import { CommandPalette } from './components/CommandPalette';
import { ExperienceView } from './components/ExperienceView';
import { OverviewView } from './components/OverviewView';
import { PrototypeWorkspace } from './components/PrototypeWorkspace';
import { TopBar } from './components/TopBar';
import { EXPERIENCES, PROFILE } from './data/profile';
import { PROJECTS, type ConceptProject } from './data/projects';
import type { SectorId } from './data/sectors';
import { projectPath, resolveRoute, SECTION_PATHS } from './routes';

export const App: React.FC = () => {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const route = resolveRoute(pathname);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('mh-theme') === 'dark' ? 'dark' : 'light';
  });
  const [pendingSector, setPendingSector] = useState<SectorId | 'all'>('all');
  const [highlightExpId, setHighlightExpId] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (route.kind !== 'missing' && route.canonical !== pathname) {
      window.history.replaceState(null, '', `${route.canonical}${window.location.search}${window.location.hash}`);
      setPathname(route.canonical);
    }
    document.title = route.kind === 'prototype'
      ? `${route.page.title} — ${route.project.name}`
      : route.kind === 'missing' ? 'Halaman tidak ditemukan — Atlas' : 'Muhammad Hernanda — Portofolio & Atlas Produk Digital';
  }, [pathname, route]);

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
    setPathname(path);
    window.scrollTo(0, 0);
  }, []);

  function followInternalLink(event: React.MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || url.hash || url.search) return;
    if (resolveRoute(url.pathname).kind === 'missing') return;
    event.preventDefault();
    navigate(url.pathname);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('mh-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openProject = useCallback((project: ConceptProject) => {
    navigate(projectPath(project));
  }, [navigate]);

  const jumpToAtlas = useCallback((sector?: SectorId) => {
    if (sector) setPendingSector(sector);
    navigate(SECTION_PATHS.atlas);
  }, [navigate]);

  const jumpToExperience = useCallback((expId?: string) => {
    setHighlightExpId(expId ?? null);
    navigate(SECTION_PATHS.experience);
    if (expId) {
      setTimeout(() => {
        document.getElementById(expId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }
  }, [navigate]);

  const consumeSector = useCallback(() => setPendingSector('all'), []);
  const toggleTheme = () => setTheme(current => current === 'light' ? 'dark' : 'light');

  return (
    <div className="app-shell" onClick={followInternalLink}>
      {route.kind !== 'prototype' && <TopBar
        activeTab={route.kind === 'section' ? route.section : 'atlas'}
        onSelectTab={(tab) => navigate(SECTION_PATHS[tab])}
        totalProjects={PROJECTS.length}
        totalExperiences={EXPERIENCES.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCommand={() => setCommandOpen(true)}
      />}

      <main className={route.kind === 'prototype' ? 'main-content prototype-main' : 'main-content'}>
        {route.kind === 'section' && route.section === 'overview' && (
          <OverviewView
            projects={PROJECTS}
            onExploreAtlas={jumpToAtlas}
            onOpenExperience={() => jumpToExperience()}
          />
        )}

        {route.kind === 'section' && route.section === 'atlas' && (
          <AtlasView
            projects={PROJECTS}
            initialSector={pendingSector}
            onSectorConsumed={consumeSector}
          />
        )}

        {route.kind === 'section' && route.section === 'experience' && (
          <ExperienceView
            highlightExpId={highlightExpId}
            onOpenProject={openProject}
          />
        )}

        {route.kind === 'section' && route.section === 'architecture' && <ArchitectureView totalProjects={PROJECTS.length} />}
        {route.kind === 'prototype' && (
          <PrototypeWorkspace key={route.project.id} project={route.project} page={route.page}
            theme={theme} onToggleTheme={toggleTheme} onOpenCommand={() => setCommandOpen(true)}
            onJumpToExperience={jumpToExperience} />
        )}
        {route.kind === 'missing' && (
          <section className="empty-state">
            <h1>Halaman tidak ditemukan</h1>
            <a className="btn" href={SECTION_PATHS.atlas}>Kembali ke Atlas</a>
          </section>
        )}
      </main>

      {route.kind !== 'prototype' && <footer className="site-footer">
        <div className="footer-inner">
          <span>
            {PROFILE.name} — {PROFILE.location} · Riwayat CV Terverifikasi ({EXPERIENCES.length} Pengalaman) dipisahkan tegas dari {PROJECTS.length} Konsep Produk Digital.
          </span>
          <span>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> · <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedinLabel}</a>
          </span>
        </div>
      </footer>}

      <CommandPalette
        open={commandOpen}
        projects={PROJECTS}
        onClose={() => setCommandOpen(false)}
        onOpenProject={openProject}
        onJumpSector={(sec) => jumpToAtlas(sec)}
        onJumpExperience={() => jumpToExperience()}
      />
    </div>
  );
};
