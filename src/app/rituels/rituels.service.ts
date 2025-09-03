import { Injectable, signal } from '@angular/core';
import { Rituel } from '../models/rituel';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class RituelsService {
  // --- Signal pour la liste des rituels ---
  private readonly rituels = signal<Rituel[]>([]);
  // --- URL de base pour les requêtes rituels ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/rituels`;

  constructor(private http: HttpClient) { }

  // --- Récupérer la liste des rituels ---
  getRituelsList(): Observable<Rituel[]> {
    console.info('Fetching rituels from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Rituel[]>(this.apiUrl);
  }

  // --- Mettre à jour un rituel existant ---
  updateRituel(rituel: Rituel): Observable<Rituel> {
    console.log('Updating rituel:', rituel);
    return this.http.put<Rituel>(`${this.apiUrl}/update/${rituel.idRituel}`, rituel);
  }

  // --- Créer un nouveau rituel (sans idRituel, géré côté API) ---
  createRituel(rituel: Omit<Rituel, 'idRituel'> | Partial<Rituel>): Observable<Rituel> {
    console.log('Creating rituel:', rituel);
    return this.http.post<Rituel>(`${this.apiUrl}/create`, rituel);
  }

  // --- Supprimer un rituel par son ID ---
  deleteRituel(id: number): Observable<void> {
    console.log('Deleting rituel with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}