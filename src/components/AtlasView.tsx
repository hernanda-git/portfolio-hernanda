import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ConceptProject } from '../data/projects';
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_LABELS_EN,
  CURATED_LENSES,
  getArchetypeLabel,
  getLensDescription,
  getLensLabel,
  getSectorName,
  getSectorShortName,
  getSectorThesis,
  SECTORS,
  type ArchetypeId,
  type PlatformType,
  type SectorId,
} from '../data/sectors';
import { useLanguage } from '../i18n/LanguageContext';
import { UI_COPY } from '../i18n/uiCopy';
import { projectPath } from '../routes';
import { IconClose, IconFilter, IconGrid, IconLayers, IconSearch, IconTable } from './Icons';
import { ProjectCard, ProjectCardSkeleton } from './ProjectCard';

interface AtlasViewProps {
  projects: ConceptProject[];
  initialSector: SectorId | 'all';
  initialSearch: string;
  onFiltersConsumed: () => void;
}

type ViewMode = 'gallery' | 'matrix' | 'ecosystem';

const GALLERY_BATCH = 15;
const MATRIX_BATCH = 24;

const PLATFORMS: PlatformType[] = [
  'Web SaaS',
  'Mobile App',
  'Desktop / WPF',
  'API / Middleware',
  'AI / Agentic',
  'IoT / Edge',
];

const ARCHETYPES = Object.keys(ARCHETYPE_LABELS) as ArchetypeId[];

function matchesQuery(p: ConceptProject, q: string): boolean {
  if (!q) return true;
  return (
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.tagline.toLowerCase().includes(q) ||
    p.summary.toLowerCase().includes(q) ||
    p.audience.toLowerCase().includes(q) ||
    p.stack.some((s) => s.toLowerCase().includes(q)) ||
    p.standards.some((s) => s.toLowerCase().includes(q)) ||
    ARCHETYPE_LABELS[p.archetype].toLowerCase().includes(q) ||
    ARCHETYPE_LABELS_EN[p.archetype].toLowerCase().includes(q)
  );
}

export const AtlasView: React.FC<AtlasViewProps> = ({
  projects,
  initialSector,
  initialSearch,
  onFiltersConsumed,
}) => {
  const { lang } = useLanguage();
  const copy = UI_COPY[lang].atlas;

  const [search, setSearch] = useState(initialSearch);
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>(initialSector);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | 'all'>('all');
  const [lensId, setLensId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [galleryLimit, setGalleryLimit] = useState<number>(GALLERY_BATCH);
  const [matrixLimit, setMatrixLimit] = useState<number>(MATRIX_BATCH);
  const [isLoadingBatch, setIsLoadingBatch] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialSector !== 'all' || initialSearch !== '') {
      if (initialSector !== 'all') setSelectedSector(initialSector);
      if (initialSearch !== '') setSearch(initialSearch);
      setLensId('all');
      onFiltersConsumed();
    }
  }, [initialSector, initialSearch, onFiltersConsumed]);

  const activeLens = CURATED_LENSES.find((l) => l.id === lensId) ?? CURATED_LENSES[0];
  const normalizedQuery = search.trim().toLowerCase();

  const lensCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lens of CURATED_LENSES) {
      map[lens.id] = projects.filter((p) => lens.filter(p) && matchesQuery(p, normalizedQuery)).length;
    }
    return map;
  }, [projects, normalizedQuery]);

  const searchAndLensPool = useMemo(
    () => projects.filter((p) => activeLens.filter(p) && matchesQuery(p, normalizedQuery)),
    [projects, activeLens, normalizedQuery]
  );

  const sectorPool = useMemo(
    () =>
      searchAndLensPool.filter(
        (p) =>
          (selectedPlatform === 'all' || p.platform === selectedPlatform) &&
          (selectedArchetype === 'all' || p.archetype === selectedArchetype)
      ),
    [searchAndLensPool, selectedPlatform, selectedArchetype]
  );

  const platformPool = useMemo(
    () =>
      searchAndLensPool.filter(
        (p) =>
          (selectedSector === 'all' || p.sector === selectedSector) &&
          (selectedArchetype === 'all' || p.archetype === selectedArchetype)
      ),
    [searchAndLensPool, selectedSector, selectedArchetype]
  );

  const archetypePool = useMemo(
    () =>
      searchAndLensPool.filter(
        (p) =>
          (selectedSector === 'all' || p.sector === selectedSector) &&
          (selectedPlatform === 'all' || p.platform === selectedPlatform)
      ),
    [searchAndLensPool, selectedSector, selectedPlatform]
  );

  const filtered = useMemo(
    () =>
      sectorPool.filter((p) => selectedSector === 'all' || p.sector === selectedSector),
    [sectorPool, selectedSector]
  );

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of SECTORS) counts[s.id] = 0;
    for (const p of sectorPool) counts[p.sector] = (counts[p.sector] || 0) + 1;
    return counts;
  }, [sectorPool]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const pl of PLATFORMS) counts[pl] = 0;
    for (const p of platformPool) counts[p.platform] = (counts[p.platform] || 0) + 1;
    return counts;
  }, [platformPool]);

  const archetypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const arch of ARCHETYPES) counts[arch] = 0;
    for (const p of archetypePool) counts[p.archetype] = (counts[p.archetype] || 0) + 1;
    return counts;
  }, [archetypePool]);

  const hasFilters =
    search.trim() !== '' ||
    selectedSector !== 'all' ||
    selectedPlatform !== 'all' ||
    selectedArchetype !== 'all' ||
    lensId !== 'all';

  // Reset progressive window cleanly when filters or view mode change
  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    loadingRef.current = false;
    setIsLoadingBatch(false);
    setGalleryLimit(GALLERY_BATCH);
    setMatrixLimit(MATRIX_BATCH);
  }, [normalizedQuery, selectedSector, selectedPlatform, selectedArchetype, lensId, viewMode]);

  const activeLimit = viewMode === 'gallery' ? galleryLimit : matrixLimit;
  const hasMore = (viewMode === 'gallery' || viewMode === 'matrix') && activeLimit < filtered.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const triggerLoad = () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoadingBatch(true);
      timerRef.current = window.setTimeout(() => {
        if (viewMode === 'gallery') {
          setGalleryLimit((prev) => Math.min(prev + GALLERY_BATCH, filtered.length));
        } else if (viewMode === 'matrix') {
          setMatrixLimit((prev) => Math.min(prev + MATRIX_BATCH, filtered.length));
        }
        loadingRef.current = false;
        setIsLoadingBatch(false);
        timerRef.current = null;
      }, 220);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          triggerLoad();
        }
      },
      { rootMargin: '260px 0px' }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      loadingRef.current = false;
    };
  }, [hasMore, viewMode, filtered.length, activeLimit]);

  const resetAll = () => {
    setSearch('');
    setSelectedSector('all');
    setSelectedPlatform('all');
    setSelectedArchetype('all');
    setLensId('all');
    setGalleryLimit(GALLERY_BATCH);
    setMatrixLimit(MATRIX_BATCH);
  };

  const shownGallery = filtered.slice(0, galleryLimit);
  const shownMatrix = filtered.slice(0, matrixLimit);
  const remainingGallery = Math.max(0, filtered.length - galleryLimit);
  const skeletonCardCount = Math.min(3, remainingGallery);
  const remainingMatrix = Math.max(0, filtered.length - matrixLimit);
  const skeletonRowCount = Math.min(4, remainingMatrix);

  return (
    <div>
      {/* Top Explorer Toolbar */}
      <div className="atlas-toolbar">
        <div className="atlas-toolbar-top">
          <div className="search-wrap">
            <span className="search-icon">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.searchPlaceholder(projects.length)}
              aria-label={copy.searchAria}
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label={copy.clearSearchAria}>
                <IconClose size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm mobile-filter-btn"
              onClick={() => setMobileFiltersOpen((v) => !v)}
            >
              <IconFilter size={13} />
              {copy.filterBtn}
            </button>

            <span className="tag tag-mono" data-testid="atlas-showing-count">
              {copy.showingCount(filtered.length, projects.length)}
            </span>

            {hasFilters && (
              <button type="button" className="btn btn-sm" onClick={resetAll}>
                {copy.resetBtn}
              </button>
            )}

            <div className="segmented" role="tablist" aria-label={copy.viewModeAria}>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'gallery' ? 'is-active' : ''}`}
                onClick={() => setViewMode('gallery')}
              >
                <IconGrid size={13} />
                {copy.viewModes.gallery}
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'matrix' ? 'is-active' : ''}`}
                onClick={() => setViewMode('matrix')}
              >
                <IconTable size={13} />
                {copy.viewModes.matrix}
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'ecosystem' ? 'is-active' : ''}`}
                onClick={() => setViewMode('ecosystem')}
              >
                <IconLayers size={13} />
                {copy.viewModes.ecosystem}
              </button>
            </div>
          </div>
        </div>

        {/* Curated Lenses */}
        <div className="lens-bar" aria-label={copy.lensesAria}>
          {CURATED_LENSES.map((lens) => (
            <button
              type="button"
              key={lens.id}
              className={`lens-chip ${lensId === lens.id ? 'is-active' : ''}`}
              title={getLensDescription(lens, lang)}
              onClick={() => setLensId(lens.id)}
            >
              <span>{getLensLabel(lens, lang)}</span>
              <span className="lens-count">{lensCounts[lens.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body: Facet Sidebar + Active View */}
      <div className="atlas-body">
        <aside className={`facet-sidebar ${mobileFiltersOpen ? 'is-mobile-open' : ''}`} aria-label={copy.sidebarAria}>
          <div className="facet-group" data-facet-group="sector">
            <div className="facet-title">
              <span>{copy.sectorTitle(SECTORS.length)}</span>
              {selectedSector !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedSector('all')}
                >
                  {copy.allShort}
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedSector === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedSector('all')}
            >
              <span className="facet-row-label">{copy.allSectors}</span>
              <span className="facet-count" data-facet-all="sector">{sectorPool.length}</span>
            </button>
            {SECTORS.map((s) => {
              const count = sectorCounts[s.id] ?? 0;
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`facet-row ${selectedSector === s.id ? 'is-active' : ''} ${count === 0 ? 'is-zero' : ''}`}
                  onClick={() => setSelectedSector(selectedSector === s.id ? 'all' : s.id)}
                >
                  <span className="facet-row-label">{getSectorShortName(s, lang)}</span>
                  <span className="facet-count" data-facet-item="sector">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="facet-group" data-facet-group="platform">
            <div className="facet-title">
              <span>{copy.platformTitle(PLATFORMS.length)}</span>
              {selectedPlatform !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedPlatform('all')}
                >
                  {copy.allShort}
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedPlatform === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedPlatform('all')}
            >
              <span className="facet-row-label">{copy.allPlatforms}</span>
              <span className="facet-count" data-facet-all="platform">{platformPool.length}</span>
            </button>
            {PLATFORMS.map((pl) => {
              const count = platformCounts[pl] ?? 0;
              return (
                <button
                  type="button"
                  key={pl}
                  className={`facet-row ${selectedPlatform === pl ? 'is-active' : ''} ${count === 0 ? 'is-zero' : ''}`}
                  onClick={() => setSelectedPlatform(selectedPlatform === pl ? 'all' : pl)}
                >
                  <span className="facet-row-label">{pl}</span>
                  <span className="facet-count" data-facet-item="platform">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="facet-group" data-facet-group="archetype">
            <div className="facet-title">
              <span>{copy.archetypeTitle(ARCHETYPES.length)}</span>
              {selectedArchetype !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedArchetype('all')}
                >
                  {copy.allShort}
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedArchetype === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedArchetype('all')}
            >
              <span className="facet-row-label">{copy.allArchetypes}</span>
              <span className="facet-count" data-facet-all="archetype">{archetypePool.length}</span>
            </button>
            {ARCHETYPES.map((arch) => {
              const count = archetypeCounts[arch] ?? 0;
              return (
                <button
                  type="button"
                  key={arch}
                  className={`facet-row ${selectedArchetype === arch ? 'is-active' : ''} ${count === 0 ? 'is-zero' : ''}`}
                  onClick={() => setSelectedArchetype(selectedArchetype === arch ? 'all' : arch)}
                >
                  <span className="facet-row-label">{getArchetypeLabel(arch, lang)}</span>
                  <span className="facet-count" data-facet-item="archetype">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ui-text)', marginBottom: '6px' }}>
                {copy.emptyTitle}
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px' }}>
                {copy.emptyDesc(projects.length)}
              </p>
              <button type="button" className="btn btn-primary" onClick={resetAll}>
                {copy.resetAllBtn}
              </button>
            </div>
          ) : viewMode === 'gallery' ? (
            <>
              <div className="project-grid">
                {shownGallery.map((project) => <ProjectCard key={project.id} project={project} />)}
                {isLoadingBatch &&
                  Array.from({ length: skeletonCardCount }).map((_, idx) => (
                    <ProjectCardSkeleton key={`skel-card-${idx}`} />
                  ))}
              </div>

              {hasMore ? (
                <div ref={sentinelRef} className="atlas-sentinel" aria-live="polite">
                  {isLoadingBatch && <span className="tag tag-mono">{copy.loadingMore}</span>}
                </div>
              ) : (
                <div className="atlas-end-note">
                  <span className="tag tag-mono">{copy.endOfCatalog(filtered.length)}</span>
                </div>
              )}
            </>
          ) : viewMode === 'matrix' ? (
            <>
              <div className="matrix-wrap">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>{copy.tableHeaders.id}</th>
                      <th>{copy.tableHeaders.concept}</th>
                      <th>{copy.tableHeaders.sector}</th>
                      <th>{copy.tableHeaders.platform}</th>
                      <th>{copy.tableHeaders.archetype}</th>
                      <th>{copy.tableHeaders.standards}</th>
                      <th>{copy.tableHeaders.stack}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownMatrix.map((p) => {
                      const sec = SECTORS.find((s) => s.id === p.sector);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', whiteSpace: 'nowrap' }}>{p.id}</td>
                          <td>
                            <a href={projectPath(p)} style={{ fontWeight: 600 }}>{p.name}</a>
                            <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{p.tagline}</div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{sec ? getSectorShortName(sec, lang) : p.sector}</td>
                          <td style={{ whiteSpace: 'nowrap' }}><span className="tag">{p.platform}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}><span className="tag tag-accent">{getArchetypeLabel(p.archetype, lang)}</span></td>
                          <td style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px' }}>{p.standards.slice(0, 2).join(' | ')}</td>
                          <td style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{p.stack.slice(0, 2).join(', ')}</td>
                        </tr>
                      );
                    })}
                    {isLoadingBatch &&
                      Array.from({ length: skeletonRowCount }).map((_, idx) => (
                        <tr key={`skel-row-${idx}`} className="matrix-skeleton-row" aria-hidden="true">
                          <td><span className="skeleton-shimmer skel-line" style={{ width: '48px', height: '12px' }} /></td>
                          <td>
                            <span className="skeleton-shimmer skel-line" style={{ width: '130px', height: '13px', marginBottom: '5px' }} />
                            <span className="skeleton-shimmer skel-line" style={{ width: '210px', height: '11px' }} />
                          </td>
                          <td><span className="skeleton-shimmer skel-line" style={{ width: '88px', height: '12px' }} /></td>
                          <td><span className="skeleton-shimmer skel-pill" style={{ width: '76px', height: '18px' }} /></td>
                          <td><span className="skeleton-shimmer skel-pill" style={{ width: '96px', height: '18px' }} /></td>
                          <td><span className="skeleton-shimmer skel-line" style={{ width: '120px', height: '11px' }} /></td>
                          <td><span className="skeleton-shimmer skel-line" style={{ width: '100px', height: '11px' }} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {hasMore ? (
                <div ref={sentinelRef} className="atlas-sentinel" aria-live="polite">
                  {isLoadingBatch && <span className="tag tag-mono">{copy.loadingMore}</span>}
                </div>
              ) : (
                <div className="atlas-end-note">
                  <span className="tag tag-mono">{copy.endOfCatalog(filtered.length)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="ecosystem-stack">
              {SECTORS.map((sec) => {
                const group = filtered.filter((p) => p.sector === sec.id);
                if (!group.length) return null;
                return (
                  <section className="ecosystem-sector" key={sec.id}>
                    <div className="panel-header">
                      <div>
                        <h3 className="section-title" style={{ fontSize: '15px' }}>{getSectorName(sec, lang)}</h3>
                        <p className="section-desc">{getSectorThesis(sec, lang)}</p>
                      </div>
                      <span className="tag tag-mono">{copy.conceptsUnit(group.length)}</span>
                    </div>
                    <div className="ecosystem-tiles">
                      {group.map((p) => (
                        <a
                          key={p.id}
                          className="ecosystem-tile"
                          href={projectPath(p)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '10.5px', color: 'var(--ui-text-muted)' }}>{p.id}</span>
                            <span className="tag" style={{ fontSize: '10px' }}>{getArchetypeLabel(p.archetype, lang)}</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ui-text)' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', lineHeight: 1.35 }}>{p.tagline}</div>
                          <div style={{ marginTop: 'auto', paddingTop: '4px', fontFamily: 'var(--ui-mono)', fontSize: '10px', color: 'var(--ui-accent-ink)' }}>
                            {p.standards[0]}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
