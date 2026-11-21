import type { ConceptProject } from './projectTypes';
import { PROJECTS_PART_1 } from './projectsPart1';
import { PROJECTS_PART_2 } from './projectsPart2';
import { PROJECTS_PART_3 } from './projectsPart3';
import { PROJECTS_PART_4 } from './projectsPart4';
import { PROJECTS_PART_5 } from './projectsPart5';
import { PROJECTS_PART_6 } from './projectsPart6';

export type { ConceptProject, PreviewItem, PreviewMetric } from './projectTypes';

export const PROJECTS: ConceptProject[] = [
  ...PROJECTS_PART_1,
  ...PROJECTS_PART_2,
  ...PROJECTS_PART_3,
  ...PROJECTS_PART_4,
  ...PROJECTS_PART_5,
  ...PROJECTS_PART_6,
];

export const PROJECTS_BY_ID: Record<string, ConceptProject> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p])
);
