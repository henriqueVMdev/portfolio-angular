import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'projetos/myrias', renderMode: RenderMode.Prerender },
  { path: 'projetos/basanos', renderMode: RenderMode.Prerender },
  { path: 'projetos/omniseg', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
