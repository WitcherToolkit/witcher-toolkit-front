import { Injectable, signal } from '@angular/core';
import { Race } from '../models/race';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class RacesService {
  // --- Signal pour la liste des races ---
  private readonly races = signal<Race[]>([]);
  // --- URL de base pour les requêtes races ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/races`;

  constructor(private http: HttpClient) { }

  // --- Récupérer la liste des races ---
  getRacesList(): Observable<Race[]> {
    console.info('Fetching races from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Race[]>(this.apiUrl);
  }

  // --- Récupérer une race par son ID ---
  getRaceById(id: number): Observable<Race> {
    return this.http.get<Race>(`${this.apiUrl}/${id}`);
  }

  // --- Créer une nouvelle race ---
  createRace(race: Race): Observable<Race> {
    console.log('Creating race:', race);
    return this.http.post<Race>(`${this.apiUrl}/create`, race);
  }

  // --- Mettre à jour une race existante ---
  updateRace(race: Race): Observable<Race> {
    console.log('Updating race:', race);
    return this.http.put<Race>(`${this.apiUrl}/update/${race.idRace}`, race);
  }

  // --- Supprimer une race par son ID ---
  deleteRace(id: number): Observable<void> {
    console.log('Deleting race with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}