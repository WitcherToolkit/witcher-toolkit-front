import { Injectable, signal } from '@angular/core';
import { Envoutement } from '../models/envoutement';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EnvoutementService {
  // --- Signal pour la liste des envoutements (optionnel) ---
  private readonly envoutements = signal<Envoutement[]>([]);
  
  // --- URL de base pour les requêtes envoutements ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/envoutements`;
  
  // --- Cache pour éviter les appels API répétés ---
  private envoutementsCache$?: Observable<Envoutement[]>;

  constructor(private http: HttpClient) {}

  // --- Récupérer la liste des envoutements (avec cache) ---
  getEnvoutementList(): Observable<Envoutement[]> {
    if (!this.envoutementsCache$) {
      console.info('Fetching envoutements from API...');
      console.log(`API Base URL: ${this.apiUrl}`);
      this.envoutementsCache$ = this.http.get<Envoutement[]>(this.apiUrl).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.envoutementsCache$;
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.envoutementsCache$ = undefined;
  }

  // --- Créer un nouvel envoutement ---
  createEnvoutement(
    envoutement: Omit<Envoutement, 'idEnvoutement'> | Partial<Envoutement>
  ): Observable<Envoutement> {
    console.log('Creating envoutement:', envoutement);
    return this.http.post<Envoutement>(`${this.apiUrl}/create`, envoutement).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour un envoutement existant ---
  updateEnvoutement(envoutement: Envoutement): Observable<Envoutement> {
    console.log('Updating envoutement:', envoutement);
    return this.http.put<Envoutement>(
      `${this.apiUrl}/update/${envoutement.idEnvoutement}`, 
      envoutement
    ).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer un envoutement par son ID ---
  deleteEnvoutement(id: number): Observable<void> {
    console.log('Deleting envoutement with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Envoutement[]> {
    this.invalidateCache();
    return this.getEnvoutementList();
  }
}