import React from 'react';
import { PROFILE } from '../data/profile';
import { IconMoon, IconSearch, IconSun } from './Icons';

export type NavTab = 'overview' | 'atlas' | 'experience' | 'architecture';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  totalProjects: number;
  totalExperiences: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommand: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  totalProjects,
  totalExperiences,
  theme,
  onToggleTheme,
  onOpenCommand,
}) => {
  return (
    <header className="topbar">
      <button type="button" className="topbar-brand" onClick={() => onSelectTab('overview')}>
        <span className="brand-mark">{PROFILE.monogram}</span>
        <span className="brand-text">
          <span className="brand-name">{PROFILE.name}</span>
          <span className="brand-sub">Principal .NET, Solution Architect &amp; AI Inference · Jakarta</span>
        </span>
      </button>

      <nav className="topbar-nav" aria-label="Navigasi utama">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('overview')}
        >
          Ringkasan
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'atlas' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('atlas')}
        >
          Atlas Konsep
          <span className="nav-count">{totalProjects}</span>
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'experience' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('experience')}
        >
          Karier Terverifikasi
          <span className="nav-count">{totalExperiences}</span>
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'architecture' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('architecture')}
        >
          Arsitektur &amp; Kontak
        </button>
      </nav>

      <div className="topbar-actions">
        <button type="button" className="cmd-trigger" onClick={onOpenCommand} aria-label="Buka pencarian cepat">
          <IconSearch size={13} />
          <span className="cmd-trigger-label">Cari {totalProjects} konsep...</span>
          <span className="kbd">Ctrl K</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Ubah ke tema gelap' : 'Ubah ke tema terang'}
          title={theme === 'light' ? 'Ubah ke tema gelap' : 'Ubah ke tema terang'}
        >
          {theme === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
        </button>
      </div>
    </header>
  );
};
