import { Injectable, signal } from '@angular/core';
import { Rituel } from '../models/rituel';
import { RITUEL_LIST } from '../fake-data-set/rituel-fake';

@Injectable({
  providedIn: 'root'
})
export class RituelsService {
  private readonly rituels = signal<Rituel[]>(RITUEL_LIST);

  getRituelList(): Rituel[] {
    return this.rituels();
  }

  searchRituels(term: string): Rituel[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getRituelList();

    if (!lowerTerm) return list;

    return list.filter(rituel =>
      rituel.nom.toLowerCase().includes(lowerTerm)
    );
  }

  // Prévu pour une API REST :
  /*
  constructor(private http: HttpClient) {}

  getRituelList(): Observable<Rituel[]> {
    return this.http.get<Rituel[]>('url/api/rituels');
  }
  */
}