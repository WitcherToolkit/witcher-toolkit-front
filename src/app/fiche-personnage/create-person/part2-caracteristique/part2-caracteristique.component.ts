import { Component, effect, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Caracteristique } from '../../../models/caracteristique';
import { CaracteristiquePersonnage } from '../../../models/caracteristique-personnage';
import { CaracteristiqueService } from '../../../caracteristiques/caracteristique.service';
import { ToolsService } from '../../../tools/tools.service';

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
  caracteristiques: Caracteristique[] = [];
  subscriptions: Subscription[] = [];
  niveauJeu = signal<string>('libre');
  pointsRestants = signal<number>(0);

  // --- Cycle de vie ---
  constructor(
    private fb: FormBuilder,
    private caracteristiqueService: CaracteristiqueService,
    private toolsService: ToolsService
  ) {
    // Met à jour les points restants à chaque changement
    effect(() => {
      this.updatePointsRestants();
    });
  }

  ngOnInit() {
    // S'assure que le formControl 'niveauJeu' existe et a la bonne valeur par défaut
    if (!this.form.contains('niveauJeu')) {
      this.form.addControl('niveauJeu', this.fb.control('libre'));
    }
    console.log(`Initialisation étape 2:`, this.form.value);
    // Charge les caractéristiques puis initialise le formulaire
    this.caracteristiqueService.getCaracteristiquesList().subscribe((caracteristiques: Caracteristique[]) => {
      this.caracteristiques = caracteristiques;
      this.initializeFormControls();
      this.caracteristiqueService.calculateValuesSecondaires(this.caracteristiquePersonnage, this.caracteristiques, this.form);
      this.subscribeToNiveauJeuChanges();
      // Abonnement aux changements de valeur des caractéristiques principales pour mettre à jour dynamiquement les points restants
      this.subscriptions.push(
        this.caracteristiquePersonnage.valueChanges.subscribe(() => {
          this.updatePointsRestants();
        })
      );
    });
  }

  ngOnDestroy(): void {
    // Nettoie les abonnements
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

  // --- Initialisation ---
  /** Initialise les contrôles du formulaire */
  private initializeFormControls() {
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
    this.form.addControl('poings', this.fb.control(''));
    this.form.addControl('pieds', this.fb.control(''));
    this.form.addControl('vigueur', this.fb.control(''));
  }

  /** Crée un FormGroup pour une caractéristique */
  private createCaracteristiqueControl(carac: Caracteristique, valeur?: number): FormGroup {
    const initialValue = valeur ?? 3;
    const group = this.fb.group({
      code: this.fb.control(carac.code),
      valeurMax: this.fb.control(initialValue, [Validators.required, Validators.min(3), Validators.max(10)]),
      valeurActuelle: this.fb.control(initialValue)
    });
    // Synchronise valeurMax et valeurActuelle
    group.get('valeurMax')!.valueChanges.subscribe(val => {
      group.get('valeurActuelle')?.setValue(val, { emitEvent: false });
    });
    // Désactive les champs pour les secondaires
    if (carac.type !== 'Principale') {
      group.get('valeurMax')!.disable();
      group.get('valeurActuelle')!.disable();
    }
    return group;
  }

  /** Abonnement aux changements du niveau de jeu */
  private subscribeToNiveauJeuChanges() {
    this.subscriptions.push(
      this.form.get('niveauJeu')!.valueChanges.subscribe((niveau) => {
        this.niveauJeu.set(niveau);
        this.resetCaracteristiques();
      })
    );
  }

  /** Initialise le FormArray caracteristiquePersonnage à partir d'une liste de caractéristiques */
  initCaracteristiques(caracs: Caracteristique[]) {
    this.caracteristiques = caracs;
    if (this.form.contains('caracteristiquePersonnage')) {
      this.form.removeControl('caracteristiquePersonnage');
    }
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
  }

  /** Initialise le FormArray caracteristiquePersonnage à partir d'une liste de caractéristiquesPersonnage (pour édition) */
  initCaracteristiquesPersonnage(caracsPerso: CaracteristiquePersonnage[]) {
    this.caracteristiques = caracsPerso.map(cp => cp.caracteristique);
    if (this.form.contains('caracteristiquePersonnage')) {
      this.form.removeControl('caracteristiquePersonnage');
    }
    const caracteristiquePersonnageArray = this.fb.array(
      caracsPerso.map(cp => this.createCaracteristiqueControl(cp.caracteristique, cp.valeurMax))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
  }

  // --- Utilitaires ---
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
    const pointsRestants = this.toolsService.calculatePointsRestants(totalPoints, this.caracteristiquePersonnage, this.caracteristiqueService.isEditable);
    this.pointsRestants.set(pointsRestants);
  }

  /** Réinitialise les caractéristiques éditables à 3 */
  private resetCaracteristiques(): void {
    this.caracteristiquePersonnage.controls.forEach(control => {
      if (this.caracteristiqueService.isEditable(control.get('code')?.value)) {
        control.get('valeurMax')?.setValue(3);
        control.get('valeurActuelle')?.setValue(3);
      }
    });
    this.updatePointsRestants();
  }

  /** Retourne le tableau des caractéristiques du personnage */
  getCaracteristiquePersonnageArray(): CaracteristiquePersonnage[] {
    return this.caracteristiquePersonnage.controls.map((ctrl, i) => ({
      valeurActuelle: ctrl.get('valeurActuelle')?.value,
      valeurMax: ctrl.get('valeurMax')?.value,
      caracteristique: this.caracteristiques[i]
    }));
  }

  // --- Handlers pour le template ---
  /** Change le niveau de jeu (radio) */
  setNiveauJeu(niveau: string) {
    this.niveauJeu.set(niveau);
  }

  /** Incrémente la valeur d'une caractéristique principale */
  incrementCaracteristique(index: number): void {
    this.toolsService.incrementFormControlValue(this.caracteristiquePersonnage, index, 'valeurMax', 10);
  }

  /** Décrémente la valeur d'une caractéristique principale */
  decrementCaracteristique(index: number): void {
    this.toolsService.decrementFormControlValue(this.caracteristiquePersonnage, index, 'valeurMax', 3);
  }

  /** Désactive le bouton de décrément si la valeur est à 3 */
  isDecrementDisabled(index: number): boolean {
    const control = this.caracteristiquePersonnage.at(index).get('valeurMax');
    return control ? control.value <= 3 : true;
  }

  /** Désactive le bouton d'incrément si la valeur est à 10 ou plus de points */
  isIncrementDisabled(index: number): boolean {
    const control = this.caracteristiquePersonnage.at(index).get('valeurMax');
    return control ? control.value >= 10 || (this.niveauJeu() !== 'libre' && this.pointsRestants() <= 0) : true;
  }
}
