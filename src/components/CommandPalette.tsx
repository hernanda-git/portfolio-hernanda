import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EXPERIENCES } from '../data/profile';
import type { ConceptProject } from '../data/projects';
import { getArchetypeLabel, getSectorName, SECTORS, type SectorId } from '../data/sectors';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { IconClose, IconSearch } from './Icons';

interface CommandPaletteProps {
  open: boolean;
  projects: ConceptProject[];
  onClose: () => void;
  onOpenProject: (project: ConceptProject) => void;
  onJumpSector: (sector: SectorId) => void;
  onJumpExperience: (expId?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  projects,
  onClose,
  onOpenProject,
  onJumpSector,
  onJumpExperience,
}) => {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].command;
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedProjects = projects
      .filter((p) => {
        if (!q) return Boolean(p.featured);
        return (
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q)) ||
          p.standards.some((s) => s.toLowerCase().includes(q)) ||
          p.sector.toLowerCase().includes(q)
        );
      })
      .slice(0, 12);

    const matchedSectors = SECTORS.filter((s) =>
      q
        ? s.name.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.standards.some((st) => st.toLowerCase().includes(q))
        : false
    ).slice(0, 4);

    const matchedExp = EXPERIENCES.filter((e) =>
      q
        ? e.company.toLowerCase().includes(q) ||
          e.role.en.toLowerCase().includes(q) ||
          e.role.id.toLowerCase().includes(q) ||
          e.sector.en.toLowerCase().includes(q) ||
          e.sector.id.toLowerCase().includes(q)
        : false
    ).slice(0, 3);

    return { matchedProjects, matchedSectors, matchedExp };
  }, [projects, query]);

  const flatCount =
    results.matchedProjects.length + results.matchedSectors.length + results.matchedExp.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => (flatCount > 0 ? (c + 1) % flatCount : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => (flatCount > 0 ? (c - 1 + flatCount) % flatCount : 0));
      } else if (e.key === 'Enter' && flatCount > 0) {
        e.preventDefault();
        const pLen = results.matchedProjects.length;
        const sLen = results.matchedSectors.length;
        if (cursor < pLen) {
          onOpenProject(results.matchedProjects[cursor]);
          onClose();
        } else if (cursor < pLen + sLen) {
          onJumpSector(results.matchedSectors[cursor - pLen].id);
          onClose();
        } else {
          onJumpExperience(results.matchedExp[cursor - pLen - sLen]?.id);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, cursor, flatCount, results, onClose, onOpenProject, onJumpSector, onJumpExperience]);

  if (!open) return null;

  let runningIndex = 0;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={copy.dialogAria}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-row">
          <IconSearch size={15} />
          <input
            ref={inputRef}
            className="cmd-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder={copy.placeholder(projects.length)}
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label={copy.closeAria}>
            <IconClose size={13} />
          </button>
        </div>

        <div className="cmd-list">
          {flatCount === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ui-text-muted)', fontSize: '12.5px' }}>
              {copy.emptyResult(query)}
            </div>
          ) : (
            <>
              <div className="facet-title" style={{ padding: '4px 10px' }}>
                <span>{query ? copy.matchedConcepts : copy.featuredConcepts}</span>
                <span className="tag-mono">{results.matchedProjects.length}</span>
              </div>
              {results.matchedProjects.map((p) => {
                const idx = runningIndex++;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`cmd-item ${cursor === idx ? 'is-selected' : ''}`}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={() => {
                      onOpenProject(p);
                      onClose();
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', marginRight: '8px', fontSize: '11px' }}>
                          {p.id}
                        </span>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--ui-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.tagline}
                      </div>
                    </div>
                    <span className="tag">{getArchetypeLabel(p.archetype, lang)}</span>
                  </button>
                );
              })}

              {results.matchedSectors.length > 0 && (
                <>
                  <div className="facet-title" style={{ padding: '8px 10px 4px' }}>
                    <span>{copy.marketSectors}</span>
                  </div>
                  {results.matchedSectors.map((s) => {
                    const idx = runningIndex++;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        className={`cmd-item ${cursor === idx ? 'is-selected' : ''}`}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => {
                          onJumpSector(s.id);
                          onClose();
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{getSectorName(s, lang)}</span>
                        <span className="tag">{copy.filterSectorTag}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {results.matchedExp.length > 0 && (
                <>
                  <div className="facet-title" style={{ padding: '8px 10px 4px' }}>
                    <span>{copy.careerHistory}</span>
                  </div>
                  {results.matchedExp.map((e) => {
                    const idx = runningIndex++;
                    return (
                      <button
                        type="button"
                        key={e.id}
                        className={`cmd-item ${cursor === idx ? 'is-selected' : ''}`}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => {
                          onJumpExperience(e.id);
                          onClose();
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{e.role[lang]} - {e.company}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ui-text-muted)' }}>{e.period[lang]} | {e.sector[lang]}</div>
                        </div>
                        <span className="tag tag-ok">{copy.verifiedRoleTag}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
