import { Injectable, signal } from '@angular/core';
import { COMPETENCE_LIST } from '../fake-data-set/competence-fake';
import { Competence } from '../models/competence';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
// Signal interne pour gérer les données en local
private readonly competences = signal<Competence[]>(COMPETENCE_LIST);

getCompetencesList(): Observable<Competence[]> {
      return of(this.competences()); // Simule une requête HTTP
      //return this.http.get<Competence[]>('url/api/competences');
  }

searchCompetences(term: string): Competence[] {
  const lowerTerm = term.trim().toLowerCase();
  let filteredCompetences: Competence[] = [];
    this.getCompetencesList().subscribe(list => {
      if (!lowerTerm) {
        filteredCompetences = list;
      } else {
        filteredCompetences = list.filter(competence =>
          competence.nom.toLowerCase().includes(lowerTerm)
        );
      }
    });

  return filteredCompetences;
  }

}
