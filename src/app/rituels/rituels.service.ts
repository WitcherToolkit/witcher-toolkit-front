import { Injectable, signal } from '@angular/core';
import { Rituel } from '../models/rituel';
import { RITUEL_LIST } from '../fake-data-set/rituel-fake';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RituelsService {
  private readonly rituels = signal<Rituel[]>(RITUEL_LIST);

  getRituelsList():  Observable<Rituel[]> {
    return of(this.rituels());
    //return this.http.get<Rituel[]>('url/api/rituels');
  }

  searchRituels(term: string): Rituel[] {
    const lowerTerm = term.trim().toLowerCase();
    let filteredRituels: Rituel[] = [];
      this.getRituelsList().subscribe(list => {
        if (!lowerTerm) {
          filteredRituels = list;
        } else {
          filteredRituels = list.filter(rituel =>
            rituel.nom.toLowerCase().includes(lowerTerm)
          );
        }
      });
  
    return filteredRituels;
    }

}