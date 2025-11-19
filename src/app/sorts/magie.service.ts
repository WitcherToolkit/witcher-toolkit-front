import { Injectable, signal } from '@angular/core';
import { Magie } from '../models/magie';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
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
  
  // --- Cache pour éviter les appels API répétés ---
  private magiesCache$?: Observable<Magie[]>;
  private magiesNoviceCache$?: Observable<Magie[]>;

  constructor(private http: HttpClient) {}

  // --- Récupérer la liste des magies (avec cache) ---
  getMagiesList(): Observable<Magie[]> {
    if (!this.magiesCache$) {
      console.info('Fetching magies from API...');
      console.log(`API Base URL: ${this.apiUrl}`);
      this.magiesCache$ = this.http.get<Magie[]>(this.apiUrl).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.magiesCache$;
  }

  // --- Récupérer la liste des magies de niveau "Novice" (avec cache) ---
  getMagiesNoviceList(): Observable<Magie[]> {
    if (!this.magiesNoviceCache$) {
      console.info('Fetching magies Novice from API...');
      this.magiesNoviceCache$ = this.http.get<Magie[]>(`${this.apiUrl}?niveauContains=novice`).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.magiesNoviceCache$;
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.magiesCache$ = undefined;
    this.magiesNoviceCache$ = undefined; // Invalide aussi le cache des novices
  }

  // --- Créer une nouvelle magie ---
  createMagie(
    magie: Omit<Magie, 'idMagie'> | Partial<Magie>
  ): Observable<Magie> {
    console.log('Creating magie:', magie);
    return this.http.post<Magie>(`${this.apiUrl}/create`, magie).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour une magie existante ---
  updateMagie(magie: Magie): Observable<Magie> {
    console.log('Updating magie:', magie);
    return this.http.put<Magie>(`${this.apiUrl}/update/${magie.idMagie}`, magie).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer une magie par son ID ---
  deleteMagie(id: string): Observable<void> {
    console.log('Deleting magie with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Magie[]> {
    this.invalidateCache();
    return this.getMagiesList();
  }
}