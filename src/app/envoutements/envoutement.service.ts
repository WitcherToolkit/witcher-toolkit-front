import { Injectable, signal } from '@angular/core';
import { Envoutement } from '../models/envoutement';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnvoutementService {

  private readonly envoutements = signal<Envoutement[]>([]);

  constructor(private http: HttpClient) { }

  getEnvoutementList(): Observable<Envoutement[]> {
    console.info('Fetching rituels from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Envoutement[]>(`${EnvironmentConfig.apiBaseUrl}/envoutements`);
  }

  updateEnvoutement(envoutement: Envoutement): Observable<Envoutement> {
    console.log('Updating envoutement:', envoutement);
    return this.http.put<Envoutement>(`${EnvironmentConfig.apiBaseUrl}/envoutements/update/${envoutement.idEnvoutement}`, envoutement);
  }

  createEnvoutement(envoutement: Omit<Envoutement, 'idEnvoutement'> | Partial<Envoutement>): Observable<Envoutement> {
    console.log('Creating envoutement:', envoutement);
    return this.http.post<Envoutement>(`${EnvironmentConfig.apiBaseUrl}/envoutements/create`, envoutement);
  }
}