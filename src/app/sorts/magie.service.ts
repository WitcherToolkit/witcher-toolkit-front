import { Injectable, signal } from '@angular/core';
import { Magie } from '../models/magie';
import { MAGIE_LIST } from '../fake-data-set/magie-fake';

@Injectable({
  providedIn: 'root'
})
export class MagieService {
  private readonly magies = signal<Magie[]>(MAGIE_LIST);

  getMagieList(): Magie[] {
    return this.magies();
  }

  searchMagies(term: string): Magie[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getMagieList();

    if (!lowerTerm) return list;

    return list.filter(magie =>
      magie.nom.toLowerCase().includes(lowerTerm)
    );
  }

  // Prévu pour l'API REST dans le futur :
  /*
  constructor(private http: HttpClient) {}

  getMagieList(): Observable<Magie[]> {
    return this.http.get<Magie[]>('url/api/magies');
  }
  */
}