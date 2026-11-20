import type { ConceptProject } from './projectTypes';
import { PROJECTS_PART_1 } from './projectsPart1';
import { PROJECTS_PART_2 } from './projectsPart2';
import { PROJECTS_PART_3 } from './projectsPart3';
import { PROJECTS_PART_4 } from './projectsPart4';

export type { ConceptProject, PreviewItem, PreviewMetric, ArchLayers } from './projectTypes';

export const PROJECTS: ConceptProject[] = [
  ...PROJECTS_PART_1,
  ...PROJECTS_PART_2,
  ...PROJECTS_PART_3,
  ...PROJECTS_PART_4,
];

export const PROJECTS_BY_ID: Record<string, ConceptProject> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p])
);
