import { Injectable, signal } from '@angular/core';
import { Race } from '../models/race';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
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
  
  // --- Cache pour éviter les appels API répétés ---
  private racesCache$?: Observable<Race[]>;

  constructor(private http: HttpClient) {}

  // --- Récupérer la liste des races (avec cache) ---
  getRacesList(): Observable<Race[]> {
    if (!this.racesCache$) {
      console.info('Fetching races from API...');
      console.log(`API Base URL: ${this.apiUrl}`);
      this.racesCache$ = this.http.get<Race[]>(this.apiUrl).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.racesCache$;
  }

  // --- Récupérer une race par son ID ---
  getRaceById(id: number): Observable<Race> {
    return this.http.get<Race>(`${this.apiUrl}/${id}`);
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.racesCache$ = undefined;
  }

  // --- Créer une nouvelle race ---
  createRace(race: Race): Observable<Race> {
    console.log('Creating race:', race);
    return this.http.post<Race>(`${this.apiUrl}/create`, race).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour une race existante ---
  updateRace(race: Race): Observable<Race> {
    console.log('Updating race:', race);
    return this.http.put<Race>(`${this.apiUrl}/update/${race.idRace}`, race).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer une race par son ID ---
  deleteRace(id: number): Observable<void> {
    console.log('Deleting race with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Race[]> {
    this.invalidateCache();
    return this.getRacesList();
  }
}