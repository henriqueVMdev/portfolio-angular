import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

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
    path: 'projetos/omniseg',
    loadComponent: () => import('./pages/omniseg/omniseg').then((m) => m.OmniSegPage),
  },
  { path: 'projetos/:slug', redirectTo: '' },
];
