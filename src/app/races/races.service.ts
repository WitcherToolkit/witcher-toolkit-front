import { Injectable, signal } from '@angular/core';
import { RACE_LIST } from '../fake-data-set/race-fake';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RacesService {
  private readonly races = signal<Race[]>(RACE_LIST);

  getRacesList(): Race[] {
    return this.races();
  }

  searchRaces(term: string): Race[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getRacesList();

    if (!lowerTerm) return list;

    return list.filter(r =>
      r.nom.toLowerCase().includes(lowerTerm)
    );
  }

  getParticularitesNoms(race: Race): string {
    return race.particularites.map(p => p.nom).join(', ');
  }

  // Prévu pour le backend plus tard :
  /*
  constructor(private http: HttpClient) {}

  getRacesList(): Observable<Race[]> {
    return this.http.get<Race[]>('url/api/races');
  }
  */
}