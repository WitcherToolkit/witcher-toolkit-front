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

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer la liste des rituels depuis l'API questConnect
  getRituelsList(): Observable<Rituel[]> {
    //apiBaseUrl: 'http://localhost:8080/questconnect/api'
    console.log('Fetching rituels from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Rituel[]>(`${EnvironmentConfig.apiBaseUrl}/rituels`);
  }
  
  // Méthode pour récupérer un rituels depuis l'API questConnect
  /*getRituelById(id: number): Observable<Rituel | null> {
    console.log(`Fetching rituel with ID: ${id}`);
    return this.http.get<Rituel>(`${EnvironmentConfig.apiBaseUrl}/rituels/${id}`);
  }*/

}