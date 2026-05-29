import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/auth/login/login';
import { Success } from './features/auth/success/success';

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
    path: 'success',
    canActivate : [authGuard],
    component: Success
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];