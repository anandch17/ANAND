import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let backendError: any = null;

      if (typeof error.error === 'string') {
        try {
          backendError = JSON.parse(error.error);
        } catch {
          backendError = null;
        }
      } else {
        backendError = error.error;
      }

      const message =
        backendError?.Message ||
        backendError?.message ||
        'Something went wrong. Please try again.';

      let errorData = {
        code: error.status || 500,
        title: 'Unexpected Error',
        message: message
      };

      if (error.status === 0) {
        errorData = {
          code: 503,
          title: 'Service Unavailable',
          message: 'Cannot connect to server. Please check if backend is running.'
        };
      }

      else if (error.status === 401) {
        errorData = {
          code: 401,
          title: 'Unauthorized',
          message: message
        };
      }

      else if (error.status === 400) {
        errorData = {
          code: 400,
          title: 'Bad Request',
          message: message
        };
      }

      else if (error.status === 403) {
        errorData = {
          code: 403,
          title: 'Access Denied',
          message: message
        };
      }

      else if (error.status === 404) {
        errorData = {
          code: 404,
          title: 'Not Found',
          message: message
        };
      }

      else if (error.status >= 500) {
        errorData = {
          code: error.status,
          title: 'Server Error',
          message: message
        };
      }

      router.navigate(['/error'], { state: errorData });

      return EMPTY;
    })
  );
};
   