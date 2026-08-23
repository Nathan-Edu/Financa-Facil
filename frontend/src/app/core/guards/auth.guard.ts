import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (
  route,
  state
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  if (authService.obterRefreshToken()) {
    return authService.renovar().pipe(
      map((ok) => ok ? true : router.createUrlTree(['/login'], { queryParams: { retorno: state.url } }))
    );
  }

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        retorno: state.url
      }
    }
  );
};
