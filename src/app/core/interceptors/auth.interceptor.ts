import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor for adding auth token for every request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('auth_token');

  if (authToken) {
    // Creating modified clone of original request
    const clonedReq = req.clone({
      // Adding header with auth token for cloned request
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });

    return next(clonedReq);
  }

  // If token is missing, just return original request
  return next(req);
};
