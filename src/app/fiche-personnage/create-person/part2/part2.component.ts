import { Component, OnInit, OnDestroy, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Caracteristique } from '../../../models/caracteristique';
import { CaracteristiqueService } from '../../../caracteristiques/caracteristique.service';
import { ToolsService } from '../../../tools/tools.service';

@Component({
  selector: 'app-part2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part2.component.html',
  styles: ``,
})
export class Part2Component implements OnInit, OnDestroy {
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

  ngOnInit() {
    console.log(`Initialisation étape 2:`, this.form.value);

    // Charger les caractéristiques depuis le service
    this.caracteristiqueService.getCaracteristiquesList().subscribe((caracteristiques: Caracteristique[]) => {
      this.caracteristiques = caracteristiques;
    });

    this.initializeFormControls();
    this.caracteristiqueService.calculateDerivedValues(this.caracteristiquePersonnage, this.caracteristiques, this.form);
    this.subscribeToNiveauJeuChanges();
  }

  ngOnDestroy() {
    // Annuler tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Initialisation des contrôles du formulaire
  private initializeFormControls() {
    const caracteristiquePersonnageArray = this.fb.array(
      this.caracteristiques.map(caracteristique => this.createCaracteristiqueControl(caracteristique.code))
    );

    this.form.addControl('caracteristiquePersonnage', caracteristiquePersonnageArray);
    this.form.addControl('poings', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('pieds', this.fb.control({ value: '', disabled: true }));
    this.form.addControl('niveauJeu', this.fb.control('libre'));
    this.form.addControl('vigueur', this.fb.control({ value: '', disabled: true }));
  }

  // Création d'un contrôle pour une caractéristique
  private createCaracteristiqueControl(code: string): FormGroup {
    const isEditable = this.caracteristiqueService.isEditable(code);
    const initialValue = isEditable ? 3 : 0;
    const control = this.fb.group({
      valeurMax: [initialValue, [Validators.required, Validators.min(3)]],
      valeurActuelle: [initialValue],
      code: [code]
    });

    if (isEditable) {
      this.subscriptions.push(
        control.get('valeurMax')!.valueChanges.subscribe(() => {
          this.caracteristiqueService.updateValeurActuelle(this.caracteristiquePersonnage);
          this.caracteristiqueService.calculateDerivedValues(this.caracteristiquePersonnage, this.caracteristiques, this.form);
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

  // Abonnement aux changements du niveau de jeu
  private subscribeToNiveauJeuChanges() {
    this.subscriptions.push(
      this.form.get('niveauJeu')!.valueChanges.subscribe((niveau) => {
        this.niveauJeu.set(niveau);
        this.resetCaracteristiques();
      })
    );
  }

  // Récupération du FormArray des caractéristiques
  get caracteristiquePersonnage(): FormArray {
    return this.form.get('caracteristiquePersonnage') as FormArray;
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

  isEditable(code: string): boolean {
    return this.caracteristiqueService.isEditable(code);
  }
}
