import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((c) => c.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((c) => c.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((c) => c.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
