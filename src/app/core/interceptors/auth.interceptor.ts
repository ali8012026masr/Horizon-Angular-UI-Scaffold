import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth';

const PUBLIC_PATHS = ['/auth/login', '/auth/register/tourist', '/auth/register/provider', '/auth/register/guide'];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  const isPublic = PUBLIC_PATHS.some((path) => req.url.includes(path));
  const accessToken = authService.getAccessToken();

  const authorizedReq =
    !isPublic && accessToken ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : req;

  const refreshToken = authService.getRefreshToken();
  const withRefreshHeader =
    !isPublic && refreshToken
      ? authorizedReq.clone({ setHeaders: { 'x-refresh-token': refreshToken } })
      : authorizedReq;

  return next(withRefreshHeader).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const rotated = event.headers.get('x-access-token');
        if (rotated) {
          authService.updateAccessToken(rotated);
        }
      }
    })
  );
};
