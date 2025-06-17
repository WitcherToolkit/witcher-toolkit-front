import { Injectable, signal } from '@angular/core';
import { ENVOUTEMENT_LIST } from '../fake-data-set/envoutement-fake';
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
    console.log('Fetching rituels from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Envoutement[]>(`${EnvironmentConfig.apiBaseUrl}/envoutements`);
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}