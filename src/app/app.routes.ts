import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/auth/login/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];