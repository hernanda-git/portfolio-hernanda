import React from 'react';
import { PROFILE } from '../data/profile';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { IconMoon, IconSearch, IconSun } from './Icons';

export type NavTab = 'overview' | 'caseStudies' | 'atlas' | 'experience' | 'architecture';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  totalCaseStudies: number;
  totalProjects: number;
  totalExperiences: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCommand: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  totalCaseStudies,
  totalProjects,
  totalExperiences,
  theme,
  onToggleTheme,
  onOpenCommand,
}) => {
  const { lang, setLang } = useLanguage();
  const copy = UI_COPY[lang];

  return (
    <header className="topbar">
      <button type="button" className="topbar-brand" onClick={() => onSelectTab('overview')}>
        <span className="brand-mark">{PROFILE.monogram}</span>
        <span className="brand-text">
          <span className="brand-name">{PROFILE.name}</span>
          <span className="brand-sub">{copy.brandSub}</span>
        </span>
      </button>

      <nav className="topbar-nav" aria-label={copy.navAriaLabel}>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('overview')}
        >
          {copy.nav.overview}
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'caseStudies' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('caseStudies')}
        >
          {copy.nav.caseStudies}
          <span className="nav-count">{totalCaseStudies}</span>
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'experience' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('experience')}
        >
          {copy.nav.experience}
          <span className="nav-count">{totalExperiences}</span>
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'architecture' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('architecture')}
        >
          {copy.nav.architecture}
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'atlas' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('atlas')}
        >
          {copy.nav.atlas}
          <span className="nav-count">{totalProjects}</span>
        </button>
      </nav>

      <div className="topbar-actions">
        <button type="button" className="cmd-trigger" onClick={onOpenCommand} aria-label={copy.openQuickSearch}>
          <IconSearch size={13} />
          <span className="cmd-trigger-label">{lang === 'en' ? 'Search' : 'Cari'}</span>
          <span className="kbd kbd-desktop">Ctrl K</span>
        </button>

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

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? copy.switchToDark : copy.switchToLight}
          title={theme === 'light' ? copy.switchToDark : copy.switchToLight}
        >
          {theme === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
        </button>
      </div>
    </header>
  );
};
