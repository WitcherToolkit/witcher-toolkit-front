import { Injectable, signal } from '@angular/core';
import { Race } from '../models/race';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class RacesService {
  private readonly races = signal<Race[]>([]);
  
    constructor(private http: HttpClient) { }
  
    getRacesList(): Observable<Race[]> {
      console.info('Fetching rituels from API...');
      console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
      return this.http.get<Race[]>(`${EnvironmentConfig.apiBaseUrl}/races`);
    }

    updateRace(race: Race): Observable<Race> {
      console.log('Updating race:', race);
      return this.http.put<Race>(`${EnvironmentConfig.apiBaseUrl}/races/update/${race.idRace}`, race);
    }

}