import { Component, effect, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Caracteristique } from '../../../models/caracteristique';
import { CaracteristiquePersonnage } from '../../../models/caracteristique-personnage';
import { CaracteristiqueService } from '../../../caracteristiques/caracteristique.service';
import { ToolsService } from '../../../tools/tools.service';
import { POINGS_PIEDS_TABLE, SECONDARY_STATS_TABLE } from '../../../shared/shared-constants/caracteristique-tables.constants';
import { RACE_MAP } from '../../../fake-data-set/race-fake';
import { PROFESSION_MAP } from '../../../fake-data-set/profession-fake';

@Component({
  selector: 'app-part2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part2-caracteristique.component.html',
  styleUrls: ['./part2-caracteristique.component.scss'],
})
export class Part2CaracteristiqueComponent implements OnInit, OnDestroy {
  
  // --- Propriétés du composant ---

  @Input() form!: FormGroup;
  caracteristiques : Caracteristique[] = [];
  subscriptions: Subscription[] = [];
  pointsRestants = signal<number>(0);
  niveauJeu = signal<string>('libre');

  // --- Cycle de vie ---
  constructor(
    private fb: FormBuilder,
    private caracteristiqueService: CaracteristiqueService,
    private toolsService: ToolsService
  ) {
    if (this.form && !this.form.contains('niveauJeu')) {
      this.form.addControl('niveauJeu', this.fb.control('libre'));
    }
    // Met à jour les points restants à chaque changement
    effect(() => {
      this.updatePointsRestants();
    });
  }

  ngOnInit() {
    console.log(`Initialisation étape 2:`, this.form.value);

    // Charger les caractéristiques depuis le service
    this.caracteristiqueService.getCaracteristiquesList().subscribe((caracteristiques: Caracteristique[]) => {
      this.caracteristiques = caracteristiques;
      this.initializeFormControls();
      this.subscribeToNiveauJeuChanges();
      this.calculateValuesSecondaires();
    });

  }

  ngOnDestroy() {
    // Annuler tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // --- Getters ---
  /** Retourne le FormArray des caractéristiques */
  get caracteristiquePersonnage(): FormArray {
    return this.form.get('caracteristiquePersonnage') as FormArray;
  }

  /** Liste des contrôles principales */
  get getCaracteristiquesPrincipalesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Principale';
    });
  }

  /** Liste des contrôles secondaires */
  get getCaracteristiquesSecondairesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Secondaire';
    });
  }

  /** Liste de tous les contrôles */
  get getCaracteristiquesList() {
    return this.caracteristiquePersonnage.controls;
  }

  private initializeFormControls() {
    // Nettoyage des abonnements précédents
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique.code))
    );

    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
    this.form.addControl('poings', this.fb.control(''));
    this.form.addControl('pieds', this.fb.control(''));
    this.form.addControl('niveauJeu', this.fb.control('libre'));
    this.form.addControl('vigueur', this.fb.control(''));
  }

 private createCaracteristiqueControl(code: string): FormGroup {
    //On récupère l'objet caractéristique correspondant au code
    const carac = this.caracteristiques.find(c => c.code === code);
    const isPrincipale = carac?.type === 'Principale';
    const initialValue = isPrincipale ? 3 : 0;
    const control = this.fb.group({
      valeurMax: [initialValue, [Validators.required, Validators.min(3)]],
      valeurActuelle: [initialValue],
      code: [code],
      type: [carac?.type] 
    });

    if (isPrincipale) {
      this.subscriptions.push(
        control.get('valeurMax')!.valueChanges.subscribe(() => {
          this.updateValeurActuelle();
          this.calculateValuesSecondaires();
          this.updatePointsRestants();
        })
      );
    } else {
      control.get('valeurMax')!.valueChanges.subscribe(val => {
        control.get('valeurActuelle')?.setValue(val, { emitEvent: false });
      });
    }

    return control;
  }

  // --- IMPORTANT ---
  // Avant la persistance (part3), il faudra fusionner valeurPrincipaleMax et valeurSecondaireMax dans valeurMax pour correspondre à la colonne de la base de données.

  /** Abonnement aux changements du niveau de jeu */
  private subscribeToNiveauJeuChanges() {
    this.subscriptions.push(
      this.form.get('niveauJeu')!.valueChanges.subscribe((niveau) => {
        this.niveauJeu.set(niveau);
        this.resetCaracteristiques();
      })
    );
  }

  initCaracteristiques(caracs: Caracteristique[]) {
    // Nettoyage des abonnements précédents
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.caracteristiques = caracs;
    if (this.form.contains('caracteristiquePersonnage')) {
      this.form.removeControl('caracteristiquePersonnage');
    }
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique.code))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
  }

  private resetCaracteristiques(): void {
  this.caracteristiquePersonnage.controls.forEach(control => {
    // On récupère le type directement depuis le contrôle (stocké lors de la création)
    if (control.get('type')?.value === 'Principale') {
      control.get('valeurMax')?.setValue(3);
      control.get('valeurActuelle')?.setValue(3);
    }
  });
  this.updatePointsRestants();
}

  /*resetCaracteristiques(caracsPerso: CaracteristiquePersonnage[]) {
    this.caracteristiques = caracsPerso.map(cp => cp.caracteristique);
    if (this.form.contains('caracteristiquePersonnage')) {
      this.form.removeControl('caracteristiquePersonnage');
    }
    const caracteristiquePersonnageArray = this.fb.array(
      caracsPerso.map(cp => this.createCaracteristiqueControl(cp.caracteristique, cp.valeurMax))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
  }*/

  /** Met à jour les points restants selon le niveau de jeu */
  updatePointsRestants() {
    const niveau = this.niveauJeu();
    let totalPoints = 0;
    switch (niveau) {
      case 'moyen': totalPoints = 60; break;
      case 'expérimenté': totalPoints = 70; break;
      case 'heroique': totalPoints = 75; break;
      case 'legendaire': totalPoints = 80; break;
      case 'libre':
      default:
        this.pointsRestants.set(0);
        return;
    }
    // On ne compte que les caractéristiques principales pour le calcul des points restants
    const pointsRestants = this.toolsService.calculatePointsRestants(
      totalPoints,
      this.caracteristiquePersonnage,
      (code: string) => {
        const carac = this.caracteristiques.find(c => c.code === code);
        return !!carac && carac.type === 'Principale';
      }
    );
    this.pointsRestants.set(pointsRestants);
  }

  /** Retourne le tableau des caractéristiques du personnage */
  getCaracteristiquePersonnageArray(): CaracteristiquePersonnage[] {
    return this.caracteristiquePersonnage.controls.map((ctrl, i) => ({
      valeurActuelle: ctrl.get('valeurActuelle')?.value,
      valeurMax: ctrl.get('valeurMax')?.value,
      caracteristique: this.caracteristiques[i]
    }));
  }

  /** Met à jour la valeur actuelle des caractéristiques principales à partir de la valeur max */
  updateValeurActuelle() {
    this.caracteristiquePersonnage.controls.forEach(control => {
      control.get('valeurActuelle')?.setValue(control.get('valeurMax')?.value);
    });
  }

  /** Calcule et met à jour toutes les valeurs secondaires et dérivées */
  private calculateValuesSecondaires() {
    // --- Récupération des indices et valeurs principales ---
    const corIndex = this.caracteristiques.findIndex(c => c.code === 'COR');
    const volIndex = this.caracteristiques.findIndex(c => c.code === 'VOL');
    const vitIndex = this.caracteristiques.findIndex(c => c.code === 'VIT');
    if (corIndex === -1 || volIndex === -1 || vitIndex === -1) {
      // Les caractéristiques principales ne sont pas encore chargées
      return;
    }
    const corValue = this.caracteristiquePersonnage.at(corIndex)?.get('valeurMax')?.value;
    const volValue = this.caracteristiquePersonnage.at(volIndex)?.get('valeurMax')?.value;
    const vitValue = this.caracteristiquePersonnage.at(vitIndex)?.get('valeurMax')?.value;
    const average = Math.floor((corValue + volValue) / 2);

    
    // --- Valeurs issues de la table de correspondance ---
    const secondary = SECONDARY_STATS_TABLE[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
    ['PS', 'END', 'RÉC', 'ÉTOU'].forEach(code => {
      const value = secondary[code as keyof typeof secondary];
      this.setSecondaireValue(code, value);
      console.log(`${code} =`, value);
    });

    // --- Valeurs calculées par formule ---
    let encValue = corValue * 10;
    const couValue = vitValue * 3;
    const sautValue = Math.ceil(couValue / 5);
    const raceId = this.form.get('race')?.value;
    const raceName = RACE_MAP[raceId];
    if (raceName === 'Nain') encValue += 25;
    [
      { code: 'ENC', value: encValue },
      { code: 'COU', value: couValue },
      { code: 'SAUT', value: sautValue }
    ].forEach(({ code, value }) => {
      this.setSecondaireValue(code, value);
      console.log(`${code} =`, value);
    });

    // --- Poings et pieds ---
    const { poings, pieds } = POINGS_PIEDS_TABLE[corValue] || { poings: '', pieds: '' };
    this.form.get('poings')?.setValue(poings);
    this.form.get('pieds')?.setValue(pieds);

    // --- Vigueur ---
    const vigueur = this.getVigueur();
    this.form.get('vigueur')?.setValue(vigueur);
    console.log('VIG =', vigueur);
  }

  /** Met à jour la valeur d'une caractéristique secondaire dans le FormArray */
  private setSecondaireValue(code: string, value: number): void {
    const index = this.caracteristiques.findIndex(c => c.code === code);
    if (index !== -1 && this.caracteristiquePersonnage.at(index)) {
      const control = this.caracteristiquePersonnage.at(index);
      control.get('valeurMax')?.setValue(value);
      control.get('valeurActuelle')?.setValue(value);
    }
  }


  /** Calcule la vigueur selon la profession */
  private getVigueur(): number {
    let vigueurValue = 0;
    const professionId = this.form.get('profession')?.value;
    const professionName = PROFESSION_MAP[professionId];
    if (professionName === 'Mage') {
      vigueurValue = 5;
    } else if (professionName === 'Prêtre' || professionName === 'Sorceleur') {
      vigueurValue = 2;
    }
    return vigueurValue;
  }

  // --- Handlers pour le template ---
  /** Change le niveau de jeu (radio) */
  setNiveauJeu(niveau: string) {
    this.niveauJeu.set(niveau);
  }

  incrementCaracteristique(index: number): void {
    const ctrl = this.caracteristiquePersonnage.at(index);
    if (!ctrl) return;
    const control = ctrl.get('valeurMax');
    if (control && control.value < 10 && (this.niveauJeu() === 'libre' || this.pointsRestants() > 0)) {
      control.setValue(control.value + 1);
      this.calculateValuesSecondaires();
    }
  }

  decrementCaracteristique(index: number): void {
    const ctrl = this.caracteristiquePersonnage.at(index);
    if (!ctrl) return;
    const control = ctrl.get('valeurMax');
    if (control && control.value > 3) {
      control.setValue(control.value - 1);
      this.calculateValuesSecondaires();
    }
  }

  /** Désactive le bouton de décrément si la valeur est à 3 */
  isDecrementDisabled(code: string): boolean {
    const index = this.getFormArrayIndexByCode(code);
    const control = this.caracteristiquePersonnage.at(index)?.get('valeurMax');
    return control ? control.value <= 3 : true;
  }

  isIncrementDisabled(code: string): boolean {
    const index = this.getFormArrayIndexByCode(code);
    const control = this.caracteristiquePersonnage.at(index)?.get('valeurMax');
    return control ? control.value >= 10 || (this.niveauJeu() !== 'libre' && this.pointsRestants() <= 0) : true;
  }

  getFormArrayIndexByCode(code: string): number {
    return this.caracteristiquePersonnage.controls.findIndex(ctrl => ctrl.get('code')?.value === code);
  }
}
