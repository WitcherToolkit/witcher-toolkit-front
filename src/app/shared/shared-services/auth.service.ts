import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { EnvironmentConfig } from '../../environment.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${EnvironmentConfig.apiBaseUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('jwt', res.token);
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
    // Retourne true si l'utilisateur a le rôle 'admin'.
    return this.getRoles().includes('admin');
  }
}