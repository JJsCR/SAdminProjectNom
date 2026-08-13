import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AUTH_TOKEN_STORAGE_KEY, routes } from '../../../consts';
import { AuthService } from '../../../shared/services/auth.service';

const ROUTES: typeof routes = routes;

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    if (auth.isAuthenticated()) {
      return true;
    }
  } catch {
    // fall through to redirect
  }

  return router.parseUrl(ROUTES.LOGIN);
};
