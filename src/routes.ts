import { PROJECT_PAGES, type ProjectPageSpec } from './data/projectPages';
import { PROJECTS, type ConceptProject } from './data/projects';

const mountPath = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const SECTION_PATHS = {
  overview: `${mountPath}/`,
  atlas: `${mountPath}/atlas`,
  experience: `${mountPath}/karier`,
  architecture: `${mountPath}/arsitektur`,
} as const;

function slug(text: string) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function projectPath(project: ConceptProject, page = PROJECT_PAGES[project.id].pages[0]) {
  return `${mountPath}/${slug(project.name)}/${slug(page.title)}`;
}

type Section = keyof typeof SECTION_PATHS;
type StudioRoute = { kind: 'prototype'; project: ConceptProject; page: ProjectPageSpec; canonical: string };
type Route = { kind: 'section'; section: Section; canonical: string } | StudioRoute | { kind: 'missing' };

const routes = new Map<string, Exclude<Route, { kind: 'missing' }>>();
function register(path: string, route: Exclude<Route, { kind: 'missing' }>) {
  if (routes.has(path)) throw new Error(`Rute Atlas duplikat: ${path}`);
  routes.set(path, route);
}

for (const [section, canonical] of Object.entries(SECTION_PATHS)) {
  register(canonical.slice(mountPath.length), { kind: 'section', section: section as Section, canonical });
}
for (const project of PROJECTS) {
  const pages = PROJECT_PAGES[project.id].pages;
  for (const page of pages) {
    const canonical = projectPath(project, page);
    const route: StudioRoute = { kind: 'prototype', project, page, canonical };
    if (page === pages[0]) register(`/${slug(project.name)}`, route);
    register(canonical.slice(mountPath.length), route);
  }
}

export const STATIC_ROUTE_PATHS = [...routes.keys()];

export function resolveRoute(pathname: string): Route {
  if (mountPath && pathname !== mountPath && !pathname.startsWith(`${mountPath}/`)) return { kind: 'missing' };
  return routes.get(pathname.slice(mountPath.length).replace(/\/$/, '') || '/') ?? { kind: 'missing' };
}
