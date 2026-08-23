import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';

import { API_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

let renovando = false;
const renovacaoConcluida = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.obterToken();
  const autenticada = token && req.url.startsWith(API_URL)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(autenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      const rotaAuth = req.url.includes('/auth/login') || req.url.includes('/auth/cadastro') || req.url.includes('/auth/refresh');
      if (erro.status !== 401 || rotaAuth || !auth.obterRefreshToken()) return throwError(() => erro);

      if (!renovando) {
        renovando = true;
        renovacaoConcluida.next(null);
        return auth.renovar().pipe(
          switchMap((ok) => {
            renovacaoConcluida.next(ok);
            if (!ok) {
              void router.navigate(['/login']);
              return throwError(() => erro);
            }
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.obterToken()}` } }));
          }),
          finalize(() => { renovando = false; })
        );
      }

      return renovacaoConcluida.pipe(
        filter((ok): ok is boolean => ok !== null),
        take(1),
        switchMap((ok) => ok
          ? next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.obterToken()}` } }))
          : throwError(() => erro))
      );
    })
  );
};
