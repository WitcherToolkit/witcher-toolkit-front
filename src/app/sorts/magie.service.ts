import { Injectable, signal } from '@angular/core';
import { Magie } from '../models/magie';
import { MAGIE_LIST } from '../fake-data-set/magie-fake';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MagieService {
  private readonly magies = signal<Magie[]>(MAGIE_LIST);

  getMagiesList(): Observable<Magie[]> {
    return of(this.magies());
    //return this.http.get<Magie[]>('url/api/magies');
  }

  searchMagies(term: string): Magie[] {
    const lowerTerm = term.trim().toLowerCase();
    let filteredMagies: Magie[] = [];
      this.getMagiesList().subscribe(list => {
        if (!lowerTerm) {
          filteredMagies = list;
        } else {
          filteredMagies = list.filter(magie =>
            magie.nom.toLowerCase().includes(lowerTerm)
          );
        }
      });
  
    return filteredMagies;
  }

}