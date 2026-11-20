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
    ARCHETYPE_LABELS[p.archetype].toLowerCase().includes(q)
  );
}

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
  const normalizedQuery = search.trim().toLowerCase();

  // Dynamic counts for curated lens chips (respecting current search query)
  const lensCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lens of CURATED_LENSES) {
      map[lens.id] = projects.filter((p) => lens.filter(p) && matchesQuery(p, normalizedQuery)).length;
    }
    return map;
  }, [projects, normalizedQuery]);

  // Base pool after lens + search
  const searchAndLensPool = useMemo(
    () => projects.filter((p) => activeLens.filter(p) && matchesQuery(p, normalizedQuery)),
    [projects, activeLens, normalizedQuery]
  );

  // Cross-facet pools: each facet reflects all OTHER active filters so every count is mathematically accurate
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
              placeholder={`Saring ${projects.length} konsep berdasarkan nama, QRIS, SATUSEHAT, CoreTax, UU PDP, .NET, tambang...`}
              aria-label="Saring konsep produk"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian">
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
              Filter
            </button>

            <span className="tag tag-mono" data-testid="atlas-showing-count">
              Menampilkan {filtered.length} / {projects.length}
            </span>

            {hasFilters && (
              <button type="button" className="btn btn-sm" onClick={resetAll}>
                Reset
              </button>
            )}

            <div className="segmented" role="tablist" aria-label="Mode tampilan Atlas">
              <button
                type="button"
                className={`seg-btn ${viewMode === 'gallery' ? 'is-active' : ''}`}
                onClick={() => setViewMode('gallery')}
              >
                <IconGrid size={13} />
                Galeri Visual
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'matrix' ? 'is-active' : ''}`}
                onClick={() => setViewMode('matrix')}
              >
                <IconTable size={13} />
                Matriks
              </button>
              <button
                type="button"
                className={`seg-btn ${viewMode === 'ecosystem' ? 'is-active' : ''}`}
                onClick={() => setViewMode('ecosystem')}
              >
                <IconLayers size={13} />
                Peta Pasar
              </button>
            </div>
          </div>
        </div>

        {/* Curated Lenses */}
        <div className="lens-bar" aria-label="Lensa kurasi">
          {CURATED_LENSES.map((lens) => (
            <button
              type="button"
              key={lens.id}
              className={`lens-chip ${lensId === lens.id ? 'is-active' : ''}`}
              title={lens.description}
              onClick={() => setLensId(lens.id)}
            >
              <span>{lens.label}</span>
              <span className="lens-count">{lensCounts[lens.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body: Facet Sidebar + Active View */}
      <div className="atlas-body">
        <aside className={`facet-sidebar ${mobileFiltersOpen ? 'is-mobile-open' : ''}`} aria-label="Filter katalog">
          <div className="facet-group" data-facet-group="sector">
            <div className="facet-title">
              <span>Sektor Pasar ({SECTORS.length})</span>
              {selectedSector !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedSector('all')}
                >
                  Semua
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedSector === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedSector('all')}
            >
              <span className="facet-row-label">Semua Sektor Indonesia</span>
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
                  <span className="facet-row-label">{s.shortName}</span>
                  <span className="facet-count" data-facet-item="sector">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="facet-group" data-facet-group="platform">
            <div className="facet-title">
              <span>Kelas Platform ({PLATFORMS.length})</span>
              {selectedPlatform !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedPlatform('all')}
                >
                  Semua
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedPlatform === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedPlatform('all')}
            >
              <span className="facet-row-label">Semua Platform</span>
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
              <span>Arketipe UI ({ARCHETYPES.length})</span>
              {selectedArchetype !== 'all' && (
                <button
                  type="button"
                  style={{ border: 0, background: 'none', color: 'var(--ui-accent-ink)', cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setSelectedArchetype('all')}
                >
                  Semua
                </button>
              )}
            </div>
            <button
              type="button"
              className={`facet-row ${selectedArchetype === 'all' ? 'is-active' : ''}`}
              onClick={() => setSelectedArchetype('all')}
            >
              <span className="facet-row-label">Semua Arketipe UI</span>
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
                  <span className="facet-row-label">{ARCHETYPE_LABELS[arch]}</span>
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
                Tidak ada konsep produk yang cocok dengan kombinasi filter saat ini.
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px' }}>
                Hapus satu atau lebih filter aktif untuk kembali ke seluruh {projects.length} konsep Atlas Pasar Indonesia.
              </p>
              <button type="button" className="btn btn-primary" onClick={resetAll}>
                Reset semua filter
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
                    <div className="project-card-shot">
                      <img
                        src={`./screenshots/${project.id}.webp`}
                        alt={`Tampilan UI/UX produk ${project.name}`}
                        className="project-card-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="project-card-body">
                      <div className="project-card-top">
                        <span className="project-id">{project.id}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {project.cvLink && <span className="tag tag-ok">Domain CV</span>}
                          <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
                        </div>
                      </div>
                      <h3 className="project-name">{project.name}</h3>
                      <p className="project-tagline">{project.tagline}</p>
                      <div className="project-card-foot">
                        <span>{project.standards[0]}</span>
                        <span style={{ color: 'var(--ui-accent-ink)', fontWeight: 500 }}>Lihat UI/UX -&gt;</span>
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
                    Muat 36 lagi (tersisa {filtered.length - visibleLimit})
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setVisibleLimit(filtered.length)}
                  >
                    Tampilkan semua {filtered.length} konsep
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
                    <th>Konsep Produk</th>
                    <th>Sektor</th>
                    <th>Platform</th>
                    <th>Arketipe UI</th>
                    <th>Standar Nasional / Fokus</th>
                    <th>Stack Utama</th>
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
                      <span className="tag tag-mono">{group.length} konsep</span>
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
