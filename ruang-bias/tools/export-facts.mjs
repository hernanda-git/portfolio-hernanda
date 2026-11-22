import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.argv[2];
if (!root) throw new Error('Pass the read-only portfolio source folder.');
const { runnerImport } = await import(pathToFileURL(join(root,'node_modules/vite/dist/node/index.js')).href);
const get = async path => (await runnerImport(join(root,'src',path))).module;
const { PROJECTS } = await get('data/projects.ts');
const { PROJECT_PAGES } = await get('data/projectPages.ts');
const { SECTORS } = await get('data/sectors.ts');
const { projectPath, STATIC_ROUTE_PATHS } = await get('routes.ts');
const { PROFILE, EXPERIENCES } = await get('data/profile.ts');
const sectors = new Map(SECTORS.map(s=>[s.id,s.shortName]));
const site = 'https://hernanda-git.github.io/portfolio-hernanda';
const rows = PROJECTS.map(p => ({ id:p.id, name:p.name, sector:p.sector, sectorName:sectors.get(p.sector), platform:p.platform,
  subject:p.tagline, audience:p.audience, pages:PROJECT_PAGES[p.id].pages.map(s=>{
    const path=projectPath(p,s); if(!STATIC_ROUTE_PATHS.includes(path)) throw new Error(path);
    return { title:s.title, href:site+path+'/' };
  }) }));
if(rows.length!==new Set(rows.map(x=>x.id)).size) throw new Error('Duplicate concept identifier');
await writeFile(new URL('../data/catalog.json',import.meta.url), JSON.stringify(rows,null,2)+'\n');
await writeFile(new URL('../data/profile.json',import.meta.url), JSON.stringify({name:PROFILE.name,email:PROFILE.email,linkedin:PROFILE.linkedin,
  experience:EXPERIENCES.map(({id,role,company,period,sector})=>({id,role,company,period,sector}))},null,2)+'\n');
console.log(JSON.stringify({concepts:rows.length,demoLinks:rows.flatMap(r=>r.pages).length,career:EXPERIENCES.length}));
