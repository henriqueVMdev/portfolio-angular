import { RenderMode, ServerRoute } from '@angular/ssr';
import { projects } from './data/portfolio';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'projetos/myrias', renderMode: RenderMode.Prerender },
  { path: 'projetos/basanos', renderMode: RenderMode.Prerender },
  {
    path: 'projetos/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return projects
        .filter(
          (project) =>
            project.detailsAvailable !== false &&
            project.slug !== 'myrias' &&
            project.slug !== 'basanos',
        )
        .map((project) => ({ slug: project.slug }));
    },
  },
  { path: '**', renderMode: RenderMode.Server },
];
