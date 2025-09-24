
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.checkTokenValidity().pipe(
    tap(isValid => {
      if (!isValid) {
        router.navigate(['/login']);
      }
    })
  );
};

export const profRaceGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.hasProfOrRaceAccess()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};