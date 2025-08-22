import { Injectable, signal } from '@angular/core';
import { Envoutement } from '../models/envoutement';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvoutementService {
  // --- Signal pour la liste des envoutements (optionnel) ---
  private readonly envoutements = signal<Envoutement[]>([]);
  // --- URL de base pour les requêtes envoutements ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/envoutements`;

  constructor(private http: HttpClient) { }

  // --- Récupérer la liste des envoutements ---
  getEnvoutementList(): Observable<Envoutement[]> {
    console.info('Fetching envoutements from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Envoutement[]>(this.apiUrl);
  }

  // --- Créer un nouvel envoutement (sans idEnvoutement, géré côté API) ---
  createEnvoutement(envoutement: Omit<Envoutement, 'idEnvoutement'> | Partial<Envoutement>): Observable<Envoutement> {
    console.log('Creating envoutement:', envoutement);
    return this.http.post<Envoutement>(`${this.apiUrl}/create`, envoutement);
  }

  // --- Mettre à jour un envoutement existant ---
  updateEnvoutement(envoutement: Envoutement): Observable<Envoutement> {
    console.log('Updating envoutement:', envoutement);
    return this.http.put<Envoutement>(`${this.apiUrl}/update/${envoutement.idEnvoutement}`, envoutement);
  }

  // --- Supprimer un envoutement par son ID ---
  deleteEnvoutement(id: number): Observable<void> {
    console.log('Deleting envoutement with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}