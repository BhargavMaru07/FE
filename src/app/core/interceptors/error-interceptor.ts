import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            const apiResponse = err.error;

            //auth interceptor handles 
            if (err.status === 401) {
                return throwError(() => err);
            }

            const message = apiResponse?.message
                || 'Something went wrong.';

            const errors = apiResponse?.errors as string[] | undefined;

            if (errors?.length) {
                const message = errors.join('\n');
                toast.error(message);
            } else {
                toast.error(message);
            }

            return throwError(() => err);
        })
    );
};