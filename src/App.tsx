import React, { useCallback, useEffect, useState } from 'react';
import { ArchitectureView } from './components/ArchitectureView';
import { AtlasView } from './components/AtlasView';
import { CommandPalette } from './components/CommandPalette';
import { ExperienceView } from './components/ExperienceView';
import { OverviewView } from './components/OverviewView';
import { PrototypeStudio } from './components/PrototypeStudio';
import { TopBar, type NavTab } from './components/TopBar';
import { EXPERIENCES, PROFILE } from './data/profile';
import { PROJECTS, type ConceptProject } from './data/projects';
import type { SectorId } from './data/sectors';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('mh-theme') === 'dark' ? 'dark' : 'light';
  });
  const [pendingSector, setPendingSector] = useState<SectorId | 'all'>('all');
  const [highlightExpId, setHighlightExpId] = useState<string | null>(null);
  const [studioState, setStudioState] = useState<{
    project: ConceptProject | null;
    list: ConceptProject[];
  }>({ project: null, list: PROJECTS });
  const [commandOpen, setCommandOpen] = useState(false);

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

  const openProject = useCallback((project: ConceptProject, list?: ConceptProject[]) => {
    setStudioState({ project, list: list && list.length ? list : PROJECTS });
  }, []);

  const jumpToAtlas = useCallback((sector?: SectorId) => {
    if (sector) setPendingSector(sector);
    setActiveTab('atlas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const jumpToExperience = useCallback((expId?: string) => {
    setHighlightExpId(expId ?? null);
    setActiveTab('experience');
    if (expId) {
      setTimeout(() => {
        document.getElementById(expId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const consumeSector = useCallback(() => setPendingSector('all'), []);

  return (
    <div className="app-shell">
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        totalProjects={PROJECTS.length}
        totalExperiences={EXPERIENCES.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewView
            projects={PROJECTS}
            onOpenProject={(p) => openProject(p, PROJECTS)}
            onExploreAtlas={jumpToAtlas}
            onOpenExperience={() => jumpToExperience()}
          />
        )}

        {activeTab === 'atlas' && (
          <AtlasView
            projects={PROJECTS}
            initialSector={pendingSector}
            onSectorConsumed={consumeSector}
            onOpenProject={openProject}
          />
        )}

        {activeTab === 'experience' && (
          <ExperienceView
            highlightExpId={highlightExpId}
            onOpenProject={(p) => openProject(p, PROJECTS)}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>
            {PROFILE.name} — {PROFILE.location} · Verified CV History (16 Engagements) clearly separated from {PROJECTS.length} Conceptual Product Prototypes.
          </span>
          <span>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> · <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">{PROFILE.linkedinLabel}</a>
          </span>
        </div>
      </footer>

      <PrototypeStudio
        project={studioState.project}
        listContext={studioState.list}
        onClose={() => setStudioState((s) => ({ ...s, project: null }))}
        onSelectProject={(p) => setStudioState((s) => ({ ...s, project: p }))}
        onJumpToExperience={(id) => jumpToExperience(id)}
      />

      <CommandPalette
        open={commandOpen}
        projects={PROJECTS}
        onClose={() => setCommandOpen(false)}
        onOpenProject={(p) => openProject(p, PROJECTS)}
        onJumpSector={(sec) => jumpToAtlas(sec)}
        onJumpExperience={() => jumpToExperience()}
      />
    </div>
  );
};
