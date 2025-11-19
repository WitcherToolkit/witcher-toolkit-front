import { Injectable, signal } from '@angular/core';
import { Competence } from '../models/competence';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  // --- Signal pour la liste des compétences (optionnel) ---
  private readonly competences = signal<Competence[]>([]);
  
  // --- URL de base pour les requêtes compétences ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/competences`;
  
  // --- Cache pour éviter les appels API répétés ---
  private competencesCache$?: Observable<Competence[]>;

  constructor(private http: HttpClient) {}

  // --- Récupérer la liste des compétences (avec cache) ---
  getCompetencesList(): Observable<Competence[]> {
    if (!this.competencesCache$) {
      console.log('Fetching competences from API...');
      console.log(`API Base URL: ${this.apiUrl}`);
      this.competencesCache$ = this.http.get<Competence[]>(this.apiUrl).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.competencesCache$;
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.competencesCache$ = undefined;
  }

  // --- Créer une nouvelle compétence ---
  createCompetence(competence: Competence): Observable<Competence> {
    console.log('Creating competence:', competence);
    return this.http.post<Competence>(`${this.apiUrl}/create`, competence).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour une compétence existante ---
  updateCompetence(competence: Competence): Observable<Competence> {
    console.log('Updating competence:', competence);
    return this.http.put<Competence>(
      `${this.apiUrl}/update/${competence.idCompetence}`, 
      competence
    ).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer une compétence par son ID ---
  deleteCompetence(id: string): Observable<void> {
    console.log('Deleting competence with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Competence[]> {
    this.invalidateCache();
    return this.getCompetencesList();
  }
}