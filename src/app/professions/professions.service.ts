import { Injectable, signal } from '@angular/core';
import { Profession } from '../models/profession';
import { PROFESSION_LIST } from '../fake-data-set/profession-fake';

@Injectable({
  providedIn: 'root'
})
export class ProfessionsService {
  private readonly professions = signal<Profession[]>(PROFESSION_LIST);

  getProfessionsList(): Profession[] {
    return this.professions();
  }

  searchProfessions(term: string): Profession[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getProfessionsList();

    if (!lowerTerm) return list;

    return list.filter(profession =>
      profession.nom.toLowerCase().includes(lowerTerm)
    );
  }

  // Prévu pour une API REST :
  /*
  constructor(private http: HttpClient) {}

  getProfessionsList(): Observable<Profession[]> {
    return this.http.get<Profession[]>('url/api/professions');
  }
  */
}