import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../../models/api-error.model';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error;
      const normalized: ApiError =
        body && typeof body === 'object' && 'message' in body
          ? {
              timestamp: body.timestamp ?? new Date().toISOString(),
              status: body.status ?? error.status,
              message: body.message,
              errors: body.errors,
            }
          : {
              timestamp: new Date().toISOString(),
              status: error.status,
              message: error.message || 'Unexpected network error',
            };

      return throwError(() => normalized);
    })
  );
};
