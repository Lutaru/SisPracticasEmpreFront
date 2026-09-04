import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/companies-list.component').then(
            (m) => m.CompaniesListComponent,
          ),
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./features/offers/offers-list.component').then(
            (m) => m.OffersListComponent,
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications-list.component').then(
            (m) => m.ApplicationsListComponent,
          ),
      },
      {
        path: 'internships',
        loadComponent: () =>
          import('./features/internships/internships-list.component').then(
            (m) => m.InternshipsListComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
