import { Injectable, signal } from '@angular/core';
import { COMPETENCE_LIST } from '../fake-data-set/competence-fake';
import { Competence } from '../models/competence';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
// Signal interne pour gérer les données en local
private readonly competences = signal<Competence[]>(COMPETENCE_LIST);

getCompetencesList(): Competence[] {
  return this.competences();
}

searchCompetences(term: string): Competence[] {
  const lowerTerm = term.trim().toLowerCase();
  const list = this.getCompetencesList();

  if (!lowerTerm) return list;

  return list.filter(c =>
    c.nom.toLowerCase().includes(lowerTerm)
  );
}

// 🔁 Pour plus tard (API REST) :
/*
constructor(private http: HttpClient) {}

getCompetencesList(): Observable<Competence[]> {
  return this.http.get<Competence[]>('url/api/competences');
}
*/
}
