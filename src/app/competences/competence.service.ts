import { Injectable, signal } from '@angular/core';
import { Competence } from '../models/competence';
import { Observable, of } from 'rxjs';
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

  constructor(private http: HttpClient) { }

  // --- Récupérer la liste des compétences ---
  getCompetencesList(): Observable<Competence[]> {
    console.log('Fetching competences from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Competence[]>(this.apiUrl);
  }

  // --- Mettre à jour une compétence existante ---
  updateCompetence(competence: Competence): Observable<Competence> {
    console.log('Updating competence:', competence);
    return this.http.put<Competence>(`${this.apiUrl}/update/${competence.idCompetence}`, competence);
  }

  // --- Créer une nouvelle compétence ---
  createCompetence(competence: Competence): Observable<Competence> {
    console.log('Creating competence:', competence);
    return this.http.post<Competence>(`${this.apiUrl}/create`, competence);
  }
}
