import type { ProjectPageSpec } from '../../data/projectPages';
import type { ConceptProject } from '../../data/projectTypes';

export interface DomainEngineProps {
  project: ConceptProject;
  page: ProjectPageSpec;
}
