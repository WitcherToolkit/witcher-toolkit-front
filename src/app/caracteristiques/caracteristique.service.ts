import { Injectable, Signal, signal } from '@angular/core';
import { Caracteristique } from '../models/caracteristique';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PROFESSION_MAP } from '../fake-data-set/profession-fake';
import { RACE_MAP } from '../fake-data-set/race-fake';
import { EnvironmentConfig } from '../environment.config';
import { POINGS_PIEDS_TABLE, SECONDARY_STATS_TABLE } from '../shared/shared-constants/caracteristique-tables.constants';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  // --- Signal pour la liste des caractéristiques ---
  private readonly caracteristiques = signal<Caracteristique[]>([]);
  // --- URL de base pour les requêtes caractéristiques ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/caracteristiques`;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  // --- Récupérer la liste des caractéristiques ---
  getCaracteristiquesList(): Observable<Caracteristique[]> {
    console.info('Fetching caracteristiques from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Caracteristique[]>(this.apiUrl);
  }

  // --- Mettre à jour une caractéristique existante ---
  updateCaracteristique(caracteristique: Caracteristique): Observable<Caracteristique> {
    console.log('Updating caracteristique:', caracteristique);
    return this.http.put<Caracteristique>(`${this.apiUrl}/update/${caracteristique.idCaracteristique}`, caracteristique);
  }

  // --- Créer un nouveau caractéristique (sans idCaracteristique, géré côté API) ---
  createCaracteristique(caracteristique: Omit<Caracteristique, 'idCaracteristique'> | Partial<Caracteristique>): Observable<Caracteristique> {
    console.log('Creating caracteristique:', caracteristique);
    return this.http.post<Caracteristique>(`${this.apiUrl}/create`, caracteristique);
  }

  // --- Supprimer une caractéristique par son ID ---
  deleteCaracteristique(id: number): Observable<void> {
    console.log('Deleting caracteristique with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // --- Récupérer les valeurs de poings et pieds en fonction de la valeur de COR ---
  getPoingsPiedsValues(corValue: number) {
    return POINGS_PIEDS_TABLE[corValue] || { poings: '', pieds: '' };
  }

  // --- Obtenir la vigueur selon la profession ---
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

  // --- Récupérer les valeurs secondaires (PS, END, RÉC, ÉTOU) via table ---
  getValuesSecondaires(average: number) {
    return SECONDARY_STATS_TABLE[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
  }

  // --- Calculer et mettre à jour toutes les valeurs secondaires et dérivées ---
  calculateValuesSecondaires(caracteristiquePersonnage: FormArray, caracteristiques: Caracteristique[], form: FormGroup) {
    // --- Récupération des indices et valeurs principales ---
    const corIndex = caracteristiques.findIndex(c => c.code === 'COR');
    const volIndex = caracteristiques.findIndex(c => c.code === 'VOL');
    const vitIndex = caracteristiques.findIndex(c => c.code === 'VIT');
    const corValue = caracteristiquePersonnage.at(corIndex).get('valeurMax')?.value;
    const volValue = caracteristiquePersonnage.at(volIndex).get('valeurMax')?.value;
    const vitValue = caracteristiquePersonnage.at(vitIndex).get('valeurMax')?.value;
    const average = Math.floor((corValue + volValue) / 2);

    // --- Valeurs issues de la table de correspondance ---
    const secondary = SECONDARY_STATS_TABLE[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
    ['PS', 'END', 'RÉC', 'ÉTOU'].forEach(code => {
      const value = secondary[code as keyof typeof secondary];
      this.setSecondaireValue(caracteristiquePersonnage, caracteristiques, code, value);
    });

    // --- Valeurs calculées par formule ---
    let encValue = corValue * 10;
    const couValue = vitValue * 3;
    const sautValue = Math.ceil(couValue / 5);
    const raceId = form.get('race')?.value;
    const raceName = RACE_MAP[raceId];
    if (raceName === 'Nain') encValue += 25;
    [
      { code: 'ENC', value: encValue },
      { code: 'COU', value: couValue },
      { code: 'SAUT', value: sautValue }
    ].forEach(({ code, value }) => {
      this.setSecondaireValue(caracteristiquePersonnage, caracteristiques, code, value);
    });

    // --- Poings et pieds ---
    const { poings, pieds } = this.getPoingsPiedsValues(corValue);
    form.get('poings')?.setValue(poings);
    form.get('pieds')?.setValue(pieds);

    // --- Vigueur ---
    const vigueur = this.getVigueur(form);
    form.get('vigueur')?.setValue(vigueur);
  }

  // --- Mettre à jour la valeur d'une caractéristique secondaire dans le FormArray ---
  setSecondaireValue(formArray: FormArray, caracteristiques: Caracteristique[], code: string, value: number): void {
    const index = caracteristiques.findIndex(c => c.code === code);
    if (index !== -1 && formArray.at(index)) {
      const control = formArray.at(index);
      control.get('valeurMax')?.setValue(value);
      control.get('valeurActuelle')?.setValue(value);
    }
  }
}
