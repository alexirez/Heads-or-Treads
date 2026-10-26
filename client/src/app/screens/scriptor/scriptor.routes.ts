import { Routes } from '@angular/router';
import { scriptExistsGuard } from './script-exists.guard';

export const SCRIPTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./script-library/script-library').then((m) => m.ScriptLibraryScreen),
  },
  {
    path: ':id',
    canActivate: [scriptExistsGuard],
    loadComponent: () => import('./script-editor/script-editor').then((m) => m.ScriptEditorScreen),
  },
];