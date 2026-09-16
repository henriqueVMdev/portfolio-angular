import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { getProject } from './data/portfolio';
import { Home } from './pages/home/home';

const projectExistsGuard: CanActivateFn = (route) => {
  const project = getProject(route.paramMap.get('slug') ?? '');
  return project && project.detailsAvailable !== false
    ? true
    : inject(Router).parseUrl('/');
};

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'projetos/myrias',
    loadComponent: () => import('./pages/myrias/myrias').then((m) => m.MyriasPage),
  },
  {
    path: 'projetos/basanos',
    loadComponent: () => import('./pages/basanos/basanos').then((m) => m.BasanosPage),
  },
  {
    path: 'projetos/:slug',
    loadComponent: () => import('./pages/project/project').then((m) => m.ProjectPage),
    canActivate: [projectExistsGuard],
  },
];
