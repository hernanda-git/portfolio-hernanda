import React, { useMemo, useState } from 'react';
import type { ConceptProject } from '../data/projects';
import {
  ARCHETYPE_LABELS,
  CURATED_LENSES,
  SECTORS,
  type ArchetypeId,
  type PlatformType,
  type SectorId,
} from '../data/sectors';
import { IconClose, IconFilter, IconGrid, IconLayers, IconSearch, IconTable } from './Icons';
import { MiniPreview } from './MiniPreview';

interface AtlasViewProps {
  projects: ConceptProject[];
  initialSector: SectorId | 'all';
  onSectorConsumed: () => void;
  onOpenProject: (project: ConceptProject, contextList: ConceptProject[]) => void;
}

type ViewMode = 'gallery' | 'matrix' | 'ecosystem';

const PLATFORMS: PlatformType[] = [
  'Web SaaS',
  'Mobile App',
  'Desktop / WPF',
  'API / Middleware',
  'AI / Agentic',
  'IoT / Edge',
];

const ARCHETYPES = Object.keys(ARCHETYPE_LABELS) as ArchetypeId[];

export const AtlasView: React.FC<AtlasViewProps> = ({
  projects,
  initialSector,
  onSectorConsumed,
  onOpenProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorId | 'all'>(initialSector);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | 'all'>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | 'all'>('all');
  const [lensId, setLensId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [visibleLimit, setVisibleLimit] = useState<number>(36);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  React.useEffect(() => {
    if (initialSector !== 'all') {
      setSelectedSector(initialSector);
      setLensId('all');
      onSectorConsumed();
    }
  }, [initialSector, onSectorConsumed]);

  const activeLens = CURATED_LENSES.find((l) => l.id === lensId) ?? CURATED_LENSES[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (!activeLens.filter(p)) return false;
      if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
      if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false;
      if (selectedArchetype !== 'all' && p.archetype !== selectedArchetype) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.audience.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q)) ||
        p.standards.some((s) => s.toLowerCase().includes(q)) ||
        ARCHETYPE_LABELS[p.archetype].toLowerCase().includes(q)
      );
    });
  }, [projects, search, selectedSector, selectedPlatform, selectedArchetype, activeLens]);

  const hasFilters =
    search.trim() !== '' ||
    selectedSector !== 'all' ||
    selectedPlatform !== 'all' ||
    selectedArchetype !== 'all' ||
    lensId !== 'all';

  const resetAll = () => {
    setSearch('');
    setSelectedSector('all');
    setSelectedPlatform('all');
    setSelectedArchetype('all');
    setLensId('all');
    setVisibleLimit(36);
  };

  const shownGallery = filtered.slice(0, visibleLimit);

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
              placeholder="Filter 108 concepts by name, QRIS, SATUSEHAT, CoreTax, UU PDP, .NET, mining..."
              aria-label="Filter concept prototypes"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Clear filter">
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
              Filters
            </button>

            <span className="tag tag-mono">
              Showing {filtered.length} / {projects.length}
            </span>

            {hasFilters && (
              <button type="button" className="btn btn-sm" onClick={resetAll}>
                Reset
              </button>
            )}

            <div className="segmented" role="tablist" aria-label="Atlas view mode">
              <button
                type="button"
                className={`seg-btn ${viewMode === 'gallery' ? 'is-active' : ''}`}
                onClick={() => setViewMode('gallery')}
              >
                <IconGrid size={13} />
                Visual Gallery
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'matrix' ? 'is-active' : ''}`}
                onClick={() => setViewMode('matrix')}
              >
                <IconTable size={13} />
                Matrix
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'ecosystem' ? 'is-active' : ''}`}
                onClick={() => setViewMode('ecosystem')}
              >
                <IconLayers size={13} />
                Market Map
              </button>
            </div>
          </div>
        </div>

        {/* Curated Lenses */}
        <div className="lens-bar" aria-label="Curated lenses">
          {CURATED_LENSES.map((lens) => (
            <button
              type="button"
              key={lens.id}
              className={`lens-chip ${lensId === lens.id ? 'is-active' : ''}`}
              title={lens.description}
              onClick={() => setLensId(lens.id)}
            >
              {lens.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: Facet Sidebar + Active View */}
      <div className="atlas-body">
        <aside className={`facet-sidebar ${mobileFiltersOpen ? 'is-mobile-open' : ''}`} aria-label="Catalog facets">
          <div className="facet-group">
            <div className="facet-title">
              <span>Market Sectors (15)</span>
              {selectedSector !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedSector('all')}
                >
                  All
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedSector === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedSector('all')}
            >
              <span className="facet-row-label">All Indonesian Sectors</span>
              <span className="facet-count">{projects.length}</span>
            </button>
            {SECTORS.map((s) => {
              const count = projects.filter((p) => p.sector === s.id).length;
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`facet-row ${selectedSector === s.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedSector(s.id)}
                >
                  <span className="facet-row-label">{s.shortName}</span>
                  <span className="facet-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="facet-group">
            <div className="facet-title">
              <span>Platform Class (6)</span>
              {selectedPlatform !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedPlatform('all')}
                >
                  All
                </button>
              )}
            </div>
            {PLATFORMS.map((pl) => {
              const count = projects.filter((p) => p.platform === pl).length;
              return (
                <button
                  type="button"
                  key={pl}
                  className={`facet-row ${selectedPlatform === pl ? 'is-active' : ''}`}
                  onClick={() => setSelectedPlatform(selectedPlatform === pl ? 'all' : pl)}
                >
                  <span className="facet-row-label">{pl}</span>
                  <span className="facet-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="facet-group">
            <div className="facet-title">
              <span>UI Archetype (18)</span>
              {selectedArchetype !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedArchetype('all')}
                >
                  All
                </button>
              )}
            </div>
            {ARCHETYPES.map((arch) => {
              const count = projects.filter((p) => p.archetype === arch).length;
              return (
                <button
                  type="button"
                  key={arch}
                  className={`facet-row ${selectedArchetype === arch ? 'is-active' : ''}`}
                  onClick={() => setSelectedArchetype(selectedArchetype === arch ? 'all' : arch)}
                >
                  <span className="facet-row-label">{ARCHETYPE_LABELS[arch]}</span>
                  <span className="facet-count">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ui-text)', marginBottom: '6px' }}>
                No concept prototypes match the current filter combination.
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px' }}>
                Clear one or more active facets or search terms to return to the full 108-project Indonesian Market Atlas.
              </p>
              <button type="button" className="btn btn-primary" onClick={resetAll}>
                Reset all filters
              </button>
            </div>
          ) : viewMode === 'gallery' ? (
            <>
              <div className="project-grid">
                {shownGallery.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    className="project-card"
                    onClick={() => onOpenProject(project, filtered)}
                  >
                    <div className="project-card-preview">
                      <MiniPreview project={project} />
                    </div>
                    <div className="project-card-body">
                      <div className="project-card-top">
                        <span className="project-id">{project.id}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {project.cvLink && <span className="tag tag-ok">CV Domain</span>}
                          <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
                        </div>
                      </div>
                      <h3 className="project-name">{project.name}</h3>
                      <p className="project-tagline">{project.tagline}</p>
                      <div className="project-card-foot">
                        <span>{project.standards[0]}</span>
                        <span style={{ color: 'var(--ui-accent-ink)', fontWeight: 500 }}>Open Studio -&gt;</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {visibleLimit < filtered.length && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setVisibleLimit((n) => n + 36)}
                  >
                    Load 36 more ({filtered.length - visibleLimit} remaining)
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setVisibleLimit(filtered.length)}
                  >
                    Show all {filtered.length} previews
                  </button>
                </div>
              )}
            </>
          ) : viewMode === 'matrix' ? (
            <div className="matrix-wrap">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Concept</th>
                    <th>Sector</th>
                    <th>Platform</th>
                    <th>Interface Archetype</th>
                    <th>National Standard / Focus</th>
                    <th>Primary Stack</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const sec = SECTORS.find((s) => s.id === p.sector);
                    return (
                      <tr key={p.id} onClick={() => onOpenProject(p, filtered)}>
                        <td style={{ fontFamily: 'var(--ui-mono)', color: 'var(--ui-text-muted)', whiteSpace: 'nowrap' }}>{p.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{p.tagline}</div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{sec?.shortName}</td>
                        <td style={{ whiteSpace: 'nowrap' }}><span className="tag">{p.platform}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}><span className="tag tag-accent">{ARCHETYPE_LABELS[p.archetype]}</span></td>
                        <td style={{ fontFamily: 'var(--ui-mono)', fontSize: '11px' }}>{p.standards.slice(0, 2).join(' · ')}</td>
                        <td style={{ fontSize: '11px', color: 'var(--ui-text-2)' }}>{p.stack.slice(0, 2).join(', ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ecosystem-stack">
              {SECTORS.map((sec) => {
                const group = filtered.filter((p) => p.sector === sec.id);
                if (!group.length) return null;
                return (
                  <section className="ecosystem-sector" key={sec.id}>
                    <div className="panel-header">
                      <div>
                        <h3 className="section-title" style={{ fontSize: '15px' }}>{sec.name}</h3>
                        <p className="section-desc">{sec.indonesiaThesis}</p>
                      </div>
                      <span className="tag tag-mono">{group.length} concepts</span>
                    </div>
                    <div className="ecosystem-tiles">
                      {group.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          className="ecosystem-tile"
                          onClick={() => onOpenProject(p, filtered)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--ui-mono)', fontSize: '10.5px', color: 'var(--ui-text-muted)' }}>{p.id}</span>
                            <span className="tag" style={{ fontSize: '10px' }}>{ARCHETYPE_LABELS[p.archetype]}</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ui-text)' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ui-text-2)', lineHeight: 1.35 }}>{p.tagline}</div>
                          <div style={{ marginTop: 'auto', paddingTop: '4px', fontFamily: 'var(--ui-mono)', fontSize: '10px', color: 'var(--ui-accent-ink)' }}>
                            {p.standards[0]}
                          </div>
                        </button>
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
