import { Component, effect, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
  @Input() form!: FormGroup;
  caracteristiques : Caracteristique[] = [];

  subscriptions: Subscription[] = [];
  
  niveauJeu = signal<string>('libre');
  pointsRestants = signal<number>(0);

  constructor(private fb: FormBuilder, private caracteristiqueService: CaracteristiqueService, private toolsService: ToolsService) {
    // Écoute les changements de niveau et met à jour les points restants
    effect(() => {
      this.updatePointsRestants();
    });
  }
  ngOnDestroy(): void {
    // Désabonne tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    console.log(`Initialisation étape 2:`, this.form.value);

    // Charger les caractéristiques depuis le service
    this.caracteristiqueService.getCaracteristiquesList().subscribe((caracteristiques: Caracteristique[]) => {
      this.caracteristiques = caracteristiques;
      this.initializeFormControls();
      this.caracteristiqueService.calculateDerivedValues(this.caracteristiquePersonnage, this.caracteristiques, this.form);
      this.subscribeToNiveauJeuChanges();
    });
  }

  // Récupération du FormArray des caractéristiques
  get caracteristiquePersonnage(): FormArray {
    return this.form.get('caracteristiquePersonnage') as FormArray;
  }

  /** Retourne la liste des contrôles du FormArray correspondant aux caractéristiques principales */
  get getCaracteristiquesPrincipalesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl, i) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Principale';
    });
  }

  // Initialisation des contrôles du formulaire
  private initializeFormControls() {
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique))
    );
    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
    this.form.addControl('poings', this.fb.control(''));
    this.form.addControl('pieds', this.fb.control(''));
    this.form.addControl('niveauJeu', this.fb.control('libre'));
    this.form.addControl('vigueur', this.fb.control(''));
  }

   private createCaracteristiqueControl(carac: Caracteristique, valeur?: number): FormGroup {
    const initialValue = valeur ?? 3;
    const group = this.fb.group({
      code: this.fb.control(carac.code),
      valeurMax: this.fb.control(initialValue, [Validators.required, Validators.min(3), Validators.max(10)]),
      valeurActuelle: this.fb.control(initialValue)
    });
    // Synchronise toujours valeurMax et valeurActuelle
    group.get('valeurMax')!.valueChanges.subscribe(val => {
      group.get('valeurActuelle')?.setValue(val, { emitEvent: false });
    });
    // Pour les secondaires, désactive les champs (readonly)
    if (carac.type !== 'Principale') {
      group.get('valeurMax')!.disable();
      group.get('valeurActuelle')!.disable();
    }
    return group;
  }
  // Abonnement aux changements du niveau de jeu
  private subscribeToNiveauJeuChanges() {
    this.subscriptions.push(
      this.form.get('niveauJeu')!.valueChanges.subscribe((niveau) => {
        this.niveauJeu.set(niveau);
        this.resetCaracteristiques();
      })
    );
  }

  /** Retourne la liste des contrôles du FormArray correspondant aux caractéristiques secondaires */
  get getCaracteristiquesSecondairesList() {
    return this.caracteristiquePersonnage.controls.filter((ctrl, i) => {
      const code = ctrl.get('code')?.value;
      const carac = this.caracteristiques.find(c => c.code === code);
      return carac && carac.type === 'Secondaire';
    });
  }
  /** Retourne la liste des contrôles du FormArray caracteristiquePersonnage */
  get getCaracteristiquesList() {
    return this.caracteristiquePersonnage.controls;
  }

  // Mise à jour des points restants en fonction du niveau de jeu
  updatePointsRestants() {
    const niveau = this.niveauJeu();
    let totalPoints = 0;

    switch (niveau) {
      case 'moyen':
        totalPoints = 60;
        break;
      case 'expérimenté':
        totalPoints = 70;
        break;
      case 'heroique':
        totalPoints = 75;
        break;
      case 'legendaire':
        totalPoints = 80;
        break;
      case 'libre':
      default:
        this.pointsRestants.set(0);  // Aucun calcul de points en mode "libre"
        return;
    }
    // Calcul des points restants
    const pointsRestants = this.toolsService.calculatePointsRestants(totalPoints, this.caracteristiquePersonnage, this.caracteristiqueService.isEditable);
    this.pointsRestants.set(pointsRestants);
  }

  // Méthode pour changer le niveau de jeu quand un bouton radio est sélectionné
  setNiveauJeu(niveau: string) {
    this.niveauJeu.set(niveau);
  }

  incrementCaracteristique(index: number): void {
    this.toolsService.incrementFormControlValue(this.caracteristiquePersonnage, index, 'valeurMax', 10);
  }
  
  decrementCaracteristique(index: number): void {
    this.toolsService.decrementFormControlValue(this.caracteristiquePersonnage, index, 'valeurMax', 3);
  }

  isDecrementDisabled(index: number): boolean {
    const control = this.caracteristiquePersonnage.at(index).get('valeurMax');
    return control ? control.value <= 3 : true; // Désactive si valeur ≤ 3
  }
  
  isIncrementDisabled(index: number): boolean {
    const control = this.caracteristiquePersonnage.at(index).get('valeurMax');
    return control ? control.value >= 10 || (this.niveauJeu() !== 'libre' && this.pointsRestants() <= 0) : true;
  }

  private resetCaracteristiques(): void {
    this.caracteristiquePersonnage.controls.forEach(control => {
      if (this.caracteristiqueService.isEditable(control.get('code')?.value)) {
        control.get('valeurMax')?.setValue(3); // Réinitialise à 3
        control.get('valeurActuelle')?.setValue(3); // Réinitialise également la valeur actuelle
      }
    });
    this.updatePointsRestants(); // Met à jour les points restants
  }

  /** Initialise le FormArray caracteristiquePersonnage à partir d'une liste de caractéristiques */
  initCaracteristiques(caracs: Caracteristique[]) {
    this.caracteristiques = caracs;
    // Supprime l'ancien FormArray s'il existe
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

  getCaracteristiquePersonnageArray(): CaracteristiquePersonnage[] {
    return this.caracteristiquePersonnage.controls.map((ctrl, i) => ({
      valeurActuelle: ctrl.get('valeurActuelle')?.value,
      valeurMax: ctrl.get('valeurMax')?.value,
      caracteristique: this.caracteristiques[i]
    }));
  }
}
