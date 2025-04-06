import { Injectable, signal } from '@angular/core';
import { Caracteristique } from '../models/caracteristique';
import { CARACTERISTIQUE_LIST } from '../fake-data-set/caracteristiques-fake';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  // Signal local (temporaire) pour l'état en mémoire
  private readonly caracteristiques = signal<Caracteristique[]>(CARACTERISTIQUE_LIST);


  getCaracteristiquesList(): Observable<Caracteristique[]> {
      return of(this.caracteristiques()); // Simule une requête HTTP
      //return this.http.get<Caracteristique[]>('url/api/caracteristiques');
  }

  searchCaracteristiques(term: string): Caracteristique[] {
    const lowerTerm = term.trim().toLowerCase();
    let filteredCaracteristiques: Caracteristique[] = [];
      this.getCaracteristiquesList().subscribe(list => {
        if (!lowerTerm) {
          filteredCaracteristiques = list;
        } else {
          filteredCaracteristiques = list.filter(caracteristique =>
            caracteristique.nom.toLowerCase().includes(lowerTerm)
          );
        }
      });

    return filteredCaracteristiques;
  }

}
