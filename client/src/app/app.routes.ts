import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./screens/home').then((m) => m.HomeScreen),
  },
  {
    path: 'arena',
    loadComponent: () => import('./screens/arena').then((m) => m.ArenaScreen),
  },
  {
    path: 'scriptor',
    loadChildren: () =>
      import('./screens/scriptor/scriptor.routes').then((m) => m.SCRIPTOR_ROUTES),
  },
  { path: '**', redirectTo: '' },
];