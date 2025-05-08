import { Injectable, Signal, signal } from '@angular/core';
import { Caracteristique } from '../models/caracteristique';
import { CARACTERISTIQUE_LIST } from '../fake-data-set/caracteristiques-fake';
import { Observable, of } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PROFESSION_MAP } from '../fake-data-set/profession-fake';
import { RACE_MAP } from '../fake-data-set/race-fake';

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

  // Vérification si une caractéristique est éditable
  isEditable(code: string): boolean {
    return ['INT', 'RÉF', 'DEX', 'COR', 'VIT', 'EMP', 'TECH', 'VOL', 'CHA'].includes(code);
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

  // Méthode pour obtenir la vigueur
  getVigueur(form: FormGroup): number {
    let vigueurValue = 0;
    const professionId = form.get('profession')?.value;
    const professionName = PROFESSION_MAP[professionId];

    if (professionName === 'Mage') {
      vigueurValue = 5;
    } else if (professionName === 'Prêtre' || professionName === 'Sorceleur') {
      vigueurValue = 2;
    }

    return vigueurValue;
  }

  //#region caractéristiques dérivées
  // Récupération des valeurs dérivées (PS, END, RÉC, ÉTOU) en fonction de la moyenne de COR et de VOL
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

  // Mise à jour de la valeur d'une caractéristique dérivée
  setDerivedValue(formArray: FormArray, caracteristiques: Caracteristique[], code: string, value: number): void {
    const index = caracteristiques.findIndex(c => c.code === code);
    if (index !== -1 && formArray.at(index)) {
      const control = formArray.at(index);
      control.get('valeurMax')?.setValue(value);
      control.get('valeurActuelle')?.setValue(value);
    }
  }

  // Calcul des valeurs dérivées (PS, END, RÉC, ÉTOU, ENC, COU, SAUT, poings, pieds)
  calculateDerivedValues(caracteristiquePersonnage: FormArray, caracteristiques: Caracteristique[], form: FormGroup) {
    const corIndex = caracteristiques.findIndex(c => c.code === 'COR');
    const volIndex = caracteristiques.findIndex(c => c.code === 'VOL');
    const vitIndex = caracteristiques.findIndex(c => c.code === 'VIT');

    const corValue = caracteristiquePersonnage.at(corIndex).get('valeurMax')?.value;
    const volValue = caracteristiquePersonnage.at(volIndex).get('valeurMax')?.value;
    const vitValue = caracteristiquePersonnage.at(vitIndex).get('valeurMax')?.value;

    const average = Math.floor((corValue + volValue) / 2);
    const derivedValues = this.getDerivedValues(average);

    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'PS', derivedValues.PS);
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'END', derivedValues.END);
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'RÉC', derivedValues.RÉC);
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'ÉTOU', derivedValues.ÉTOU);

    let encValue = corValue * 10;
    const couValue = vitValue * 3;
    const sautValue = Math.floor(couValue / 5);

    const raceId = form.get('race')?.value;
    const raceName = RACE_MAP[raceId];
    if (raceName === 'Nain') {
      encValue += 25;
    }
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'ENC', encValue);
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'COU', couValue);
    this.setDerivedValue(caracteristiquePersonnage, caracteristiques, 'SAUT', sautValue);

    const { poings, pieds } = this.getPoingsPiedsValues(corValue);
    form.get('poings')?.setValue(poings);
    form.get('pieds')?.setValue(pieds);

    // Mettre à jour la vigueur
    const vigueur = this.getVigueur(form);
    form.get('vigueur')?.setValue(vigueur);
  }
  
  //#endregion caractéristiques dérivées

  // Mise à jour des valeurs actuelles des caractéristiques (Lors le la création, valeur actuelle = valeur max)
  updateValeurActuelle(caracteristiquePersonnage: FormArray) {
    caracteristiquePersonnage.controls.forEach(control => {
      control.get('valeurActuelle')?.setValue(control.get('valeurMax')?.value);
    });
  }

  // Méthode pour réinitialiser les caractéristiques
  resetCaracteristiques(caracteristiquePersonnage: FormArray, niveauJeu: Signal<string>, pointsRestants: Signal<number>) {
    //
  }

  // Méthode pour mettre à jour les points restants
  updatePointsRestants(caracteristiquePersonnage: FormArray, niveauJeu: Signal<string>, pointsRestants: Signal<number>) {
    //
  }
}
