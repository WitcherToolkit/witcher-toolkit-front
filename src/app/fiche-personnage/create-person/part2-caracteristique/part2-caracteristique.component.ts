import { Component, effect, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Caracteristique } from '../../../models/caracteristique';
import { CaracteristiquePersonnage } from '../../../models/caracteristique-personnage';
import { Profession } from '../../../models/profession';
import { CaracteristiqueService } from '../../../caracteristiques/caracteristique.service';
import { ToolsService } from '../../../tools/tools.service';
import { POINGS_PIEDS_TABLE, SECONDARY_STATS_TABLE } from '../../../shared/shared-constants/caracteristique-tables.constants';
import { RacesService } from '../../../races/races.service';

@Component({
  selector: 'app-part2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part2-caracteristique.component.html',
  styleUrls: ['./part2-caracteristique.component.scss'],
})
export class Part2CaracteristiqueComponent implements OnInit, OnDestroy {
  // -- Inputs et propriétés principales --
  @Input() form!: FormGroup;
  @Input() professions: Profession[] = [];
  caracteristiques: Caracteristique[] = [];
  subscriptions: Subscription[] = [];
  pointsRestants = signal<number>(0);
  niveauJeu = signal<string>('libre');

  // -- Cycle de vie --
  constructor(
    private fb: FormBuilder,
    private caracteristiqueService: CaracteristiqueService,
    private toolsService: ToolsService,
    private racesService: RacesService
  ) {
    // Met à jour les points restants à chaque changement
    effect(() => {
      this.updatePointsRestants();
    });
  }

  ngOnInit() {
    console.info(`Initialisation étape 2:`, this.form.value);
    
    // Ajout du contrôle niveauJeu si absent
    if (this.form && !this.form.contains('niveauJeu')) {
      this.form.addControl('niveauJeu', this.fb.control('libre'));
    }

    // Charger les caractéristiques depuis le service
    this.caracteristiqueService.getCaracteristiquesList().subscribe((caracteristiques: Caracteristique[]) => {
      // Filtrer pour exclure les "Autre"
      this.caracteristiques = caracteristiques.filter(carac => carac.type !== 'Autre');
      this.initializeFormControls();
      this.setupFormSubscriptions();
      this.calculateValuesSecondaires();
      this.calculateValuesAutres();
      this.updateVigueur();
    });
  }

  ngOnDestroy() {
    // Annuler tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // -- Configuration des subscriptions (SANS imbrication) --
  private setupFormSubscriptions(): void {
    // Changement de profession
    this.subscriptions.push(
      this.form.get('profession')?.valueChanges.subscribe(() => {
        this.updateVigueur();
        this.calculateValuesAutres();
      }) || new Subscription()
    );

    // Changement de COR (Constitution)
    const corIndex = this.caracteristiques.findIndex(c => c.code === 'COR');
    if (corIndex !== -1) {
      this.subscriptions.push(
        this.caracteristiquePersonnage.at(corIndex).get('valeurMax')!.valueChanges.subscribe(() => {
          this.calculateValuesAutres();
        })
      );
    }

    // Changement de niveau de jeu
    this.subscriptions.push(
      this.form.get('niveauJeu')!.valueChanges.subscribe((niveau) => {
        this.niveauJeu.set(niveau);
        this.resetCaracteristiques();
      })
    );

    // Changement de race (OPTIMISÉ - sans subscription imbriquée)
    this.subscriptions.push(
      this.form.get('race')?.valueChanges.pipe(
        tap(raceId => console.log('Race changée, recalcul des secondaires pour race ID:', raceId)),
        switchMap(raceId => {
          // Récupère les races depuis le service
          return this.racesService.getRacesList();
        })
      ).subscribe(() => {
        // Recalcule les valeurs secondaires après avoir reçu les races
        this.calculateValuesSecondaires();
      }) || new Subscription()
    );
  }

  // -- Getters pour le template et la logique --
  get caracteristiquePersonnage(): FormArray {
    return this.form.get('caracteristiquePersonnageList') as FormArray;
  }

  get getCaracteristiquesPrincipalesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Principale';
    });
  }

  getPrincipalesRows() {
    const principales = this.getCaracteristiquesPrincipalesList;
    const rows = [];
    for (let i = 0; i < principales.length; i += 2) {
      rows.push([principales[i], principales[i + 1]]);
    }
    return rows;
  }

  get getCaracteristiquesSecondairesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Secondaire';
    });
  }

  get getCaracteristiquesList() {
    return this.caracteristiquePersonnage.controls;
  }

  // -- Initialisation et gestion du formulaire --
  private initializeFormControls() {
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique.code))
    );

    this.form.addControl('caracteristiquePersonnageList', caracteristiquePersonnageArray);
    
    if (!this.form.contains('poings')) {
      this.form.addControl('poings', this.fb.control(''));
    }
    if (!this.form.contains('pieds')) {
      this.form.addControl('pieds', this.fb.control(''));
    }
    if (!this.form.contains('niveauJeu')) {
      this.form.addControl('niveauJeu', this.fb.control('libre'));
    }
    if (!this.form.contains('vigueur')) {
      this.form.addControl('vigueur', this.fb.control(0));
    }
  }

  private createCaracteristiqueControl(code: string): FormGroup {
    const carac = this.caracteristiques.find(c => c.code === code);
    const isPrincipale = carac?.type === 'Principale';
    const initialValue = isPrincipale ? 1 : 0;
    const valeurMaxValidators = isPrincipale
      ? [Validators.required, Validators.min(1), Validators.max(10)]
      : [Validators.required];
    
    const control = this.fb.group({
      valeurMax: [initialValue, valeurMaxValidators],
      valeurActuelle: [initialValue],
      code: [code],
      idCaracteristique: [carac?.idCaracteristique],
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

  initCaracteristiques(caracs: Caracteristique[]) {
    // Nettoyage des abonnements précédents
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.caracteristiques = caracs.filter(carac => carac.type !== 'Autre');
    
    if (this.form.contains('caracteristiquePersonnageList')) {
      this.form.removeControl('caracteristiquePersonnageList');
    }
    
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique.code))
    );
    this.form.addControl('caracteristiquePersonnageList', caracteristiquePersonnageArray);
  }

  private resetCaracteristiques(): void {
    this.caracteristiquePersonnage.controls.forEach(control => {
      if (control.get('type')?.value === 'Principale') {
        control.get('valeurMax')?.setValue(1);
        control.get('valeurActuelle')?.setValue(1);
      }
    });
    this.updatePointsRestants();
  }

  // -- Calculs et mises à jour des valeurs --
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

  getCaracteristiquePersonnageArray(): CaracteristiquePersonnage[] {
    return this.caracteristiquePersonnage.controls.map(ctrl => ({
      valeurActuelle: ctrl.get('valeurActuelle')?.value,
      valeurMax: ctrl.get('valeurMax')?.value,
      caracteristique: this.caracteristiques.find(
        c => c.idCaracteristique === ctrl.get('idCaracteristique')?.value
      )!
    }));
  }

  updateValeurActuelle() {
    this.caracteristiquePersonnage.controls.forEach(control => {
      control.get('valeurActuelle')?.setValue(control.get('valeurMax')?.value);
    });
  }

  private updateVigueur() {
    const vigueur = this.getVigueur();
    const ctrl = this.form.get('vigueur');
    if (ctrl) {
      ctrl.setValue(vigueur);
    }
  }

  private getVigueur(): number {
    const professionId = this.form.get('profession')?.value;
    const profession = this.professions.find((p: any) => p.idProfession === +professionId);
    const professionName = profession?.nom;
    
    if (professionName === 'Mage') {
      return 5;
    } else if (professionName === 'Prêtre' || professionName === 'Sorceleur') {
      return 2;
    }
    return 0;
  }

  private calculateValuesSecondaires() {
    // Récupération des indices et valeurs principales
    const corIndex = this.caracteristiques.findIndex(c => c.code === 'COR');
    const volIndex = this.caracteristiques.findIndex(c => c.code === 'VOL');
    const vitIndex = this.caracteristiques.findIndex(c => c.code === 'VIT');
    
    if (corIndex === -1 || volIndex === -1 || vitIndex === -1) {
      return;
    }
    
    const corValue = this.caracteristiquePersonnage.at(corIndex)?.get('valeurMax')?.value;
    const volValue = this.caracteristiquePersonnage.at(volIndex)?.get('valeurMax')?.value;
    const vitValue = this.caracteristiquePersonnage.at(vitIndex)?.get('valeurMax')?.value;
    const average = Math.floor((corValue + volValue) / 2);

    // Valeurs issues de la table
    const secondary = SECONDARY_STATS_TABLE[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
    ['PS', 'END', 'RÉC', 'ÉTOU'].forEach(code => {
      const value = secondary[code as keyof typeof secondary];
      this.setSecondaireValue(code, value);
    });

    // Valeurs calculées avec la race (OPTIMISÉ - utilise le cache du service)
    const raceId = this.form.get('race')?.value;
    this.racesService.getRacesList().subscribe(races => {
      const race = races.find(r => Number(r.idRace) === Number(raceId));
      const raceName = race?.nom;
      
      let encValue = corValue * 10;
      if (raceName === 'Nain') encValue += 25;
      
      const couValue = vitValue * 3;
      const sautValue = Math.ceil(couValue / 5);
      
      [
        { code: 'ENC', value: encValue },
        { code: 'COU', value: couValue },
        { code: 'SAUT', value: sautValue }
      ].forEach(({ code, value }) => {
        this.setSecondaireValue(code, value);
      });
      
      // Poings et pieds
      const { poings, pieds } = POINGS_PIEDS_TABLE[corValue] || { poings: '', pieds: '' };
      this.form.get('poings')?.setValue(poings);
      this.form.get('pieds')?.setValue(pieds);
    });
  }

  private calculateValuesAutres() {
    const corIndex = this.caracteristiques.findIndex(c => c.code === 'COR');
    const corValue = this.caracteristiquePersonnage.at(corIndex)?.get('valeurMax')?.value;

    // Table de correspondance pour poings/pieds
    const { poings, pieds } = POINGS_PIEDS_TABLE[corValue] || { poings: '', pieds: '' };
    this.form.get('poings')?.setValue(poings);
    this.form.get('pieds')?.setValue(pieds);

    // Calcul de la vigueur
    this.updateVigueur();
  }

  private setSecondaireValue(code: string, value: number): void {
    const index = this.caracteristiques.findIndex(c => c.code === code);
    if (index !== -1 && this.caracteristiquePersonnage.at(index)) {
      const control = this.caracteristiquePersonnage.at(index);
      control.get('valeurMax')?.setValue(value);
      control.get('valeurActuelle')?.setValue(value);
    }
  }

  // -- Méthodes utilitaires pour le template --
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
      this.updatePointsRestants();
    }
  }

  decrementCaracteristique(index: number): void {
    const ctrl = this.caracteristiquePersonnage.at(index);
    if (!ctrl) return;
    
    const control = ctrl.get('valeurMax');
    if (control && control.value > 1) {
      control.setValue(control.value - 1);
      this.calculateValuesSecondaires();
      this.updatePointsRestants();
    }
  }

  isDecrementDisabled(code: string): boolean {
    const index = this.getFormArrayIndexByCode(code);
    const control = this.caracteristiquePersonnage.at(index)?.get('valeurMax');
    return control ? control.value <= 1 : true;
  }

  isIncrementDisabled(code: string): boolean {
    const index = this.getFormArrayIndexByCode(code);
    const control = this.caracteristiquePersonnage.at(index)?.get('valeurMax');
    return control ? control.value >= 10 || (this.niveauJeu() !== 'libre' && this.pointsRestants() <= 0) : true;
  }

  getFormArrayIndexByCode(code: string): number {
    return this.caracteristiquePersonnage.controls.findIndex(ctrl => ctrl.get('code')?.value === code);
  }

  getTotalPoints(): number {
    switch (this.niveauJeu()) {
      case 'moyen': return 60;
      case 'expérimenté': return 70;
      case 'heroique': return 75;
      case 'legendaire': return 80;
      default: return 0;
    }
  }

  getSecondairesRows() {
    const secondaires = this.getCaracteristiquesSecondairesList;
    const rows = [];
    for (let i = 0; i < secondaires.length; i += 2) {
      rows.push([secondaires[i], secondaires[i + 1]]);
    }
    return rows;
  }
}