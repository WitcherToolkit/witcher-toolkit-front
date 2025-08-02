import { Injectable, signal } from '@angular/core';
import { Competence } from '../models/competence';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  // Signal interne pour gérer les données en local
  private readonly competences = signal<Competence[]>([]);

  constructor(private http: HttpClient) { }

  getCompetencesList(): Observable<Competence[]> {
    console.log('Fetching competence from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Competence[]>(`${EnvironmentConfig.apiBaseUrl}/competences`);
  }

  updateCompetence(competence: Competence): Observable<Competence> {
    console.log('Updating competence:', competence);
    return this.http.put<Competence>(`${EnvironmentConfig.apiBaseUrl}/competences/update/${competence.idCompetence}`, competence);
  }

}
