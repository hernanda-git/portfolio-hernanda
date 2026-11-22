import { PROJECT_PAGES } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { ARCHETYPE_LABELS } from '../data/sectors';
import { projectPath } from '../routes';
import { IconArrowRight } from './Icons';

export function ProjectCard({ project }: { project: ConceptProject }) {
  const count = PROJECT_PAGES[project.id].pages.length;
  return (
    <a className="project-card" href={projectPath(project)}>
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="project-id">{project.id}</span>
          <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
        </div>
        <h3 className="project-name">{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <div className="project-card-foot">
          <span>{count} halaman · {project.platform}</span>
          <span>Buka prototipe <IconArrowRight size={14} /></span>
        </div>
      </div>
    </a>
  );
}
