import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth-guard';

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
        loadComponent: () => 
          import('./features/auth/login/login.js').then((m) => m.LoginComponent),
      },
      // {
      //   path: 'forgot-password',
      //   loadComponent: () =>
      //     import('./features/auth/forgot-password/').then(
      //       (m) => m.ForgotPasswordComponent,
      //     ),
      // },
      // {
      //   path: 'reset-password',
      //   loadComponent: () =>
      //     import('./auth/reset-password/reset-password').then(
      //       (m) => m.ResetPasswordComponent,
      //     ),
      // },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },


  //Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('Administrator')],
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout.js').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.js').then(
            (m) => m.UserManagement,
          ),
      },
      {
        path: 'warehouses',
        loadComponent: () =>
          import('./features/admin/warehouse-management/warehouse-management.js').then(
            (m) => m.WarehouseManagement,
          ),
      },
      // {
      //   path: 'profile',
      //   loadComponent: () =>
      //     import('./profile/profile').then((m) => m.ProfileComponent),
      // },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },



  //  Manager
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard('WarehouseManager')],
    loadComponent: () =>
      import('./core/layouts/manager-layout/manager-layout.js').then(
        (m) => m.ManagerLayoutComponent,
      ),
    children: [
     
    ],
  },


  // Stock Keeper 
  {
    path: 'stock-keeper',
    canActivate: [authGuard, roleGuard('StockKeeper')],
    loadComponent: () =>
      import('./core/layouts/stock-keeper-layout/stock-keeper-layout.js').then(
        (m) => m.StockKeeperLayoutComponent,
      ),
    children: [
     
    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];