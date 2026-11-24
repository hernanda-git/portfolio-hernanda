import { getPageScreenshotUrl, PROJECT_PAGES } from '../data/projectPages';
import type { ConceptProject } from '../data/projectTypes';
import { ARCHETYPE_LABELS } from '../data/sectors';
import { projectPath } from '../routes';
import { IconArrowRight } from './Icons';

export function ProjectCard({ project }: { project: ConceptProject }) {
  const plan = PROJECT_PAGES[project.id];
  const count = plan.pages.length;
  const isEnterprise = Boolean(plan.enterpriseVerified);
  return (
    <a className="project-card" href={projectPath(project)}>
      <div className="project-card-shot">
        <img
          src={getPageScreenshotUrl(project.id, 'p1')}
          alt={`Tampilan UI/UX ${project.name}`}
          className="project-card-img"
          loading="lazy"
        />
      </div>
      <div className="project-card-body">
        <div className="project-card-top">
          <span className="project-id">{project.id}</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isEnterprise && <span className="tag tag-ok">Enterprise</span>}
            <span className="tag">{ARCHETYPE_LABELS[project.archetype]}</span>
          </div>
        </div>
        <h3 className="project-name">{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <div className="project-card-foot">
          <span>{count} halaman | {project.platform}</span>
          <span>Buka studi kasus <IconArrowRight size={14} /></span>
        </div>
      </div>
    </a>
  );
}
