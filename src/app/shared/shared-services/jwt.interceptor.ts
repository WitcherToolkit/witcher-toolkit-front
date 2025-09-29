import { HttpInterceptorFn } from '@angular/common/http';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    const authHeader = `Bearer ${token}`;
    console.log('[JWT INTERCEPTOR] Token:', token);
    console.log('[JWT INTERCEPTOR] Authorization header:', authHeader);
    req = req.clone({
      setHeaders: { Authorization: authHeader }
    });
  } else {
    console.log('[JWT INTERCEPTOR] Aucun token trouvé');
  }
  return next(req);
};