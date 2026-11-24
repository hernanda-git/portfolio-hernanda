import type { Language } from '../i18n/LanguageContext';
import type { ProjectPageSpec } from './projectPages';
import { PROJECT_PAGE_TITLES_EN } from './projectPageTitlesEn';
import type { ConceptProject } from './projectTypes';
import type { ProjectTranslationMap } from './projectTranslationTypes';
import { PROJECTS_EN_PART_1 } from './projectsEnPart1';
import { PROJECTS_EN_PART_2 } from './projectsEnPart2';
import { PROJECTS_EN_PART_3 } from './projectsEnPart3';
import { PROJECTS_EN_PART_4 } from './projectsEnPart4';
import { PROJECTS_EN_PART_5 } from './projectsEnPart5';
import { PROJECTS_EN_PART_6 } from './projectsEnPart6';

export const PROJECTS_EN_BY_ID: ProjectTranslationMap = {
  ...PROJECTS_EN_PART_1,
  ...PROJECTS_EN_PART_2,
  ...PROJECTS_EN_PART_3,
  ...PROJECTS_EN_PART_4,
  ...PROJECTS_EN_PART_5,
  ...PROJECTS_EN_PART_6,
};

export function localizeProject(project: ConceptProject, lang: Language): ConceptProject {
  if (lang !== 'en') return project;
  const tr = PROJECTS_EN_BY_ID[project.id];
  if (!tr) return project;
  return {
    ...project,
    tagline: tr.tagline,
    audience: tr.audience,
    summary: tr.summary,
    problem: tr.problem,
    indonesiaContext: tr.indonesiaContext,
    features: tr.features,
  };
}

export function localizeProjects(projects: ConceptProject[], lang: Language): ConceptProject[] {
  if (lang !== 'en') return projects;
  return projects.map((project) => localizeProject(project, 'en'));
}

export function getLocalizedPageTitle(
  projectId: string,
  page: ProjectPageSpec,
  lang: Language
): string {
  if (lang !== 'en') return page.title;
  return PROJECT_PAGE_TITLES_EN[projectId]?.[page.slug] ?? page.title;
}
