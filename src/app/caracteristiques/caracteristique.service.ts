import { Injectable, signal } from '@angular/core';
import { COMPETENCE_LIST } from '../fake-data-set/competence-fake';
import { Competence } from '../models/competence';
import { Caracteristique } from '../models/caracteristique';
import { CARACTERISTIQUE_LIST } from '../fake-data-set/caracteristiques-fake';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  // Signal local (temporaire) pour l'état en mémoire
  private readonly caracteristiques = signal<Caracteristique[]>(CARACTERISTIQUE_LIST);

  getCaracteristiquesList(): Caracteristique[] {
    return this.caracteristiques();
  }

  searchCaracteristiques(term: string): Caracteristique[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getCaracteristiquesList();

    if (!lowerTerm) return list;

    return list.filter(c =>
      c.nom.toLowerCase().includes(lowerTerm)
    );
  }

  // 🔁 Futur backend :
  /*
  constructor(private http: HttpClient) {}

  getCaracteristiquesList(): Observable<Caracteristique[]> {
    return this.http.get<Caracteristique[]>('url/api/caracteristiques');
  }
  */

}
