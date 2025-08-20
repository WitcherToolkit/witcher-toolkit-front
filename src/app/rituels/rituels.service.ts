import { Injectable, signal } from '@angular/core';
import { Rituel } from '../models/rituel';
import { RITUEL_LIST } from '../fake-data-set/rituel-fake';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class RituelsService {
  // Utilisation d'un signal pour gérer l'état local des rituels
  private readonly rituels = signal<Rituel[]>([]);
  // URL de base pour les requêtes rituels
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/rituels`;

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer la liste des rituels depuis l'API questConnect
  getRituelsList(): Observable<Rituel[]> {
    console.info('Fetching rituels from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Rituel[]>(`${this.apiUrl}`);
  }

  updateRituel(rituel: Rituel): Observable<Rituel> {
      console.log('Updating rituel:', rituel);
      return this.http.put<Rituel>(`${this.apiUrl}/update/${rituel.idRituel}`, rituel);
  }

  createRituel(rituel: Omit<Rituel, 'idRituel'> | Partial<Rituel>): Observable<Rituel> {
    console.log('Creating rituel:', rituel);
    return this.http.post<Rituel>(`${this.apiUrl}/create`, rituel);
  }

  deleteRituel(id: number): Observable<void> {
    console.log('Deleting rituel with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

}