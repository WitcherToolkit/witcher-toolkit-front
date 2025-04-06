import { Injectable, signal } from '@angular/core';
import { RACE_LIST } from '../fake-data-set/race-fake';
import { Race } from '../models/race';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RacesService {
  private readonly races = signal<Race[]>(RACE_LIST);

  getRacesList():  Observable<Race[]> {
    return of(this.races());
    //return this.http.get<Race[]>('url/api/races');
  }

  searchRaces(term: string): Race[] {
    const lowerTerm = term.trim().toLowerCase();
    let filteredRaces: Race[] = [];
      this.getRacesList().subscribe(list => {
        if (!lowerTerm) {
          filteredRaces = list;
        } else {
          filteredRaces = list.filter(race =>
            race.nom.toLowerCase().includes(lowerTerm)
          );
        }
      });
  
    return filteredRaces;
    }

  getParticularitesNoms(race: Race): string {
    return race.particularites.map(p => p.nom).join(', ');
  }

}