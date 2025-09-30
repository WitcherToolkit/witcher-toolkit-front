import { Injectable, signal } from '@angular/core';
import { Rituel } from '../models/rituel';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
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
  
  // --- Cache pour éviter les appels API répétés ---
  private rituelsCache$?: Observable<Rituel[]>;
  private rituelsNoviceCache$?: Observable<Rituel[]>;

  constructor(private http: HttpClient) {}

  // --- Récupérer la liste des rituels (avec cache) ---
  getRituelsList(): Observable<Rituel[]> {
    if (!this.rituelsCache$) {
      console.info('Fetching rituels from API...');
      console.log(`API Base URL: ${this.apiUrl}`);
      this.rituelsCache$ = this.http.get<Rituel[]>(this.apiUrl).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.rituelsCache$;
  }

  // --- Récupérer la liste des rituels de niveau "Novice" (avec cache) ---
  getRituelsNoviceList(): Observable<Rituel[]> {
    if (!this.rituelsNoviceCache$) {
      console.info('Fetching rituels Novice from API...');
      this.rituelsNoviceCache$ = this.http.get<Rituel[]>(`${this.apiUrl}?niveau=Novice`).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.rituelsNoviceCache$;
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.rituelsCache$ = undefined;
    this.rituelsNoviceCache$ = undefined; // Invalide aussi le cache des novices
  }

  // --- Créer un nouveau rituel ---
  createRituel(
    rituel: Omit<Rituel, 'idRituel'> | Partial<Rituel>
  ): Observable<Rituel> {
    console.log('Creating rituel:', rituel);
    return this.http.post<Rituel>(`${this.apiUrl}/create`, rituel).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour un rituel existant ---
  updateRituel(rituel: Rituel): Observable<Rituel> {
    console.log('Updating rituel:', rituel);
    return this.http.put<Rituel>(`${this.apiUrl}/update/${rituel.idRituel}`, rituel).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer un rituel par son ID ---
  deleteRituel(id: number): Observable<void> {
    console.log('Deleting rituel with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Rituel[]> {
    this.invalidateCache();
    return this.getRituelsList();
  }
}