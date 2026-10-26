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
    loadComponent: () => import('./screens/scriptor').then((m) => m.ScriptorScreen),
  },
  { path: '**', redirectTo: '' },
];