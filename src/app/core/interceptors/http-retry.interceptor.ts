/**
 * Reintenta una vez las lecturas GET ante red o 5xx. No reintenta 4xx ni POST.
 */
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

export const httpRetryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 1,
      delay: (error) => {
        if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
          return timer(400);
        }

        throw error;
      },
    }),
  );
};
