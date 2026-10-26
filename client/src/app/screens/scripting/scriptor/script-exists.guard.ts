import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ScriptStore } from './script-store';

/** Scripts only live in memory, so a refresh on /scriptor/:id sends you back to the library. */
export const scriptExistsGuard: CanActivateFn = (route) => {
  const store = inject(ScriptStore);
  const router = inject(Router);
  return store.get(route.paramMap.get('id') ?? '') ? true : router.createUrlTree(['/scriptor']);
};