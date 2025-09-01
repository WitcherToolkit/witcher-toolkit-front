import { HttpInterceptorFn } from '@angular/common/http';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('jwt');
  console.log('JwtInterceptor', token);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.log('Request with JWT:', req);
  }
  return next(req);
};