import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, map, of } from 'rxjs';
import { EnvironmentConfig } from '../../environment.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${EnvironmentConfig.apiBaseUrl}/auth/login`;
  private checkUrl = `${EnvironmentConfig.apiBaseUrl}/auth/me`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('jwt', res.token);
      })
    );
  }

  /**
   * Vérifie la validité du token auprès du backend (endpoint protégé)
   * Retourne un Observable<boolean> : true si valide, false sinon
   */
  checkTokenValidity(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);
    return this.http.get(this.checkUrl).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    // Décodage du payload JWT (partie centrale)
    const payload = token.split('.')[1];
    if (!payload) return [];
    try {
      const decoded = JSON.parse(atob(payload));
      return decoded.roles || [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  // Vérifie si l'utilisateur a le droit d'accéder à la création/modification de profession ou de race
  hasProfOrRaceAccess(): boolean {
    // Retourne true si l'utilisateur a le rôle 'ROLE_ADMIN'.
    return this.getRoles().includes('ROLE_ADMIN');
  }
}