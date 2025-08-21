import { Injectable, signal } from '@angular/core';
import { Magie } from '../models/magie';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class MagieService {
  // --- Signal pour la liste des magies (optionnel) ---
  private readonly magies = signal<Magie[]>([]);
  // --- URL de base pour les requêtes magies ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/magies`;

  constructor(private http: HttpClient) { }

  // --- Récupérer la liste des magies ---
  getMagiesList(): Observable<Magie[]> {
    console.info('Fetching magies from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Magie[]>(this.apiUrl);
  }

  // --- Mettre à jour une magie existante ---
  updateMagie(magie: Magie): Observable<Magie> {
    console.log('Updating magie:', magie);
    return this.http.put<Magie>(`${this.apiUrl}/update/${magie.idMagie}`, magie);
  }

  // --- Créer une nouvelle magie (sans idMagie, géré côté API) ---
  // Omit<Magie, 'idMagie'> : Crée une nouvelle magie sans spécifier l'ID qui est gérée côté API
  createMagie(magie: Omit<Magie, 'idMagie'> | Partial<Magie>): Observable<Magie> {
    console.log('Creating magie:', magie);
    return this.http.post<Magie>(`${this.apiUrl}/create`, magie);
  }

  // --- Supprimer une magie par son ID ---
  deleteMagie(id: number): Observable<void> {
    console.log('Deleting magie with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}