import { Injectable, signal } from '@angular/core';
import { Caracteristique } from '../models/caracteristique';
import { CARACTERISTIQUE_LIST } from '../fake-data-set/caracteristiques-fake';
import { Observable, of } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  // Signal local (temporaire) pour l'état en mémoire
  private readonly caracteristiques = signal<Caracteristique[]>(CARACTERISTIQUE_LIST);

  constructor(private fb: FormBuilder) {}

  getCaracteristiquesList(): Observable<Caracteristique[]> {
      return of(this.caracteristiques()); // Simule une requête HTTP
      //return this.http.get<Caracteristique[]>('url/api/caracteristiques');
  }

  // Cette méthode permet de créer un groupe de formulaire pour une caractéristique
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

  // Récupération des valeurs dérivées (PS, END, RÉC, ÉTOU) en fonction de la moyenne
  getDerivedValues(average: number) {
    const table: { [key: number]: { PS: number; END: number; RÉC: number; ÉTOU: number } } = {
      2: { PS: 10, END: 10, RÉC: 2, ÉTOU: 2 },
      3: { PS: 15, END: 15, RÉC: 3, ÉTOU: 3 },
      4: { PS: 20, END: 20, RÉC: 4, ÉTOU: 4 },
      5: { PS: 25, END: 25, RÉC: 5, ÉTOU: 5 },
      6: { PS: 30, END: 30, RÉC: 6, ÉTOU: 6 },
      7: { PS: 35, END: 35, RÉC: 7, ÉTOU: 7 },
      8: { PS: 40, END: 40, RÉC: 8, ÉTOU: 8 },
      9: { PS: 45, END: 45, RÉC: 9, ÉTOU: 9 },
      10: { PS: 50, END: 50, RÉC: 10, ÉTOU: 10 },
      11: { PS: 55, END: 55, RÉC: 10, ÉTOU: 10 },
      12: { PS: 60, END: 60, RÉC: 10, ÉTOU: 10 },
      13: { PS: 65, END: 65, RÉC: 10, ÉTOU: 10 },
    };

    return table[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
  }

  // Récupération des valeurs de poings et pieds en fonction de la valeur de COR
  getPoingsPiedsValues(corValue: number) {
    if (corValue >= 1 && corValue <= 2) {
      return { poings: '1D6 - 4', pieds: '1D6' };
    } else if (corValue >= 3 && corValue <= 4) {
      return { poings: '1D6 - 2', pieds: '1D6 + 2' };
    } else if (corValue >= 5 && corValue <= 6) {
      return { poings: '1D6', pieds: '1D6 + 4' };
    } else if (corValue >= 7 && corValue <= 8) {
      return { poings: '1D6 + 2', pieds: '1D6 + 6' };
    } else if (corValue >= 9 && corValue <= 10) {
      return { poings: '1D6 + 4', pieds: '1D6 + 8' };
    } else if (corValue >= 11 && corValue <= 12) {
      return { poings: '1D6 + 6', pieds: '1D6 + 10' };
    } else if (corValue === 13) {
      return { poings: '1D6 + 8', pieds: '1D6 + 12' };
    } else {
      return { poings: '', pieds: '' };
    }
  }

   // Cette méthode met à jour la valeur actuelle des caractéristiques
   /*updateValeurActuelle(caracteristiquePersonnage: FormArray): void {
    caracteristiquePersonnage.controls.forEach(control => {
      control.get('valeurActuelle')?.setValue(control.get('valeurMax')?.value);
    });
  }*/

  // Externaliser la méthode createCaracteristiqueControl
  /*createCaracteristiqueControl(code: string, isEditable: boolean): FormGroup {
    const control = this.fb.group({
      valeurMax: [isEditable ? 3 : { value: 0, disabled: true }, [Validators.required, Validators.min(3)]],
      valeurActuelle: [isEditable ? 3 : 0],
      code: [code]
    });

    if (isEditable) {
      control.get('valeurMax')!.valueChanges.subscribe(() => {
        // Logique mise à jour de la valeur actuelle
        this.updateValeurActuelle(control);
      });
    }

    return control;
  }*/

}
