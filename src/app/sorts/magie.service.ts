import { Injectable, signal } from '@angular/core';
import { Magie } from '../models/magie';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class MagieService {
  private readonly magies = signal<Magie[]>([]);

  constructor(private http: HttpClient) { }

  getMagiesList(): Observable<Magie[]> {
    console.info('Fetching rituels from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Magie[]>(`${EnvironmentConfig.apiBaseUrl}/magies`);
  }

  updateMagie(magie: Magie): Observable<Magie> {
    console.log('Updating magie:', magie);
    return this.http.put<Magie>(`${EnvironmentConfig.apiBaseUrl}/magies/update/${magie.idMagie}`, magie);
  }

}