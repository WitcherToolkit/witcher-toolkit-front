import { Component, OnInit, OnDestroy, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RACE_MAP } from '../../../fake-data-set/race-fake';
import { PROFESSION_MAP } from '../../../fake-data-set/profession-fake';
import { CaracteristiquePersonnage } from '../../../models/caracteristique-personnage';
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
    this.calculateDerivedValues();
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
    const control = this.fb.group({
      valeurMax: [isEditable ? 3 : { value: 0, disabled: true }, [Validators.required, Validators.min(3)]],
      valeurActuelle: [isEditable ? 3 : 0],
      code: [code]
    });

    if (isEditable) {
      this.subscriptions.push(
        control.get('valeurMax')!.valueChanges.subscribe(() => {
          this.updateValeurActuelle();
          this.updatePointsRestants();
        })
      );
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

  // Lors le la création, valeur actuelle = valeur max
  // Mise à jour des valeurs actuelles des caractéristiques
  updateValeurActuelle() {
    this.caracteristiquePersonnage.controls.forEach(control => {
      control.get('valeurActuelle')?.setValue(control.get('valeurMax')?.value);
    });
    this.calculateDerivedValues();
  }

  // Calcul des valeurs dérivées (PS, END, RÉC, ÉTOU, ENC, COU, SAUT, poings, pieds)
  calculateDerivedValues() {
    const corIndex = this.caracteristiques.findIndex(c => c.code === 'COR');
    const volIndex = this.caracteristiques.findIndex(c => c.code === 'VOL');
    const vitIndex = this.caracteristiques.findIndex(c => c.code === 'VIT');
  
    const corValue = this.caracteristiquePersonnage.at(corIndex).get('valeurMax')?.value;
    const volValue = this.caracteristiquePersonnage.at(volIndex).get('valeurMax')?.value;
    const vitValue = this.caracteristiquePersonnage.at(vitIndex).get('valeurMax')?.value;
  
    const average = Math.floor((corValue + volValue) / 2);
    const derivedValues = this.caracteristiqueService.getDerivedValues(average);
  
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'PS', derivedValues.PS);
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'END', derivedValues.END);
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'RÉC', derivedValues.RÉC);
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'ÉTOU', derivedValues.ÉTOU);

    let encValue = corValue * 10;
    const couValue = vitValue * 3;
    const sautValue = Math.floor(couValue / 5);
  
    const raceId = this.form.get('race')?.value;
    const raceName = RACE_MAP[raceId];
    if (raceName === 'Nain') {
      encValue += 25;
    }
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'ENC', encValue);
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'COU', couValue);
    this.caracteristiqueService.setDerivedValue(this.caracteristiquePersonnage, this.caracteristiques, 'SAUT', sautValue);

    const { poings, pieds } = this.caracteristiqueService.getPoingsPiedsValues(corValue);
    this.form.get('poings')?.setValue(poings);
    this.form.get('pieds')?.setValue(pieds);
  
    // Mettre à jour la vigueur
    const vigueur = this.getVigueur();
    this.form.get('vigueur')?.setValue(vigueur);
  }

  getVigueur(): number {
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
    console.log('totalt de points = ', totalPoints);
    // Calcul des points dépensés
    const pointsDepenses = this.caracteristiquePersonnage.controls.reduce((sum, control) => {
      const code = control.get('code')?.value;
      if (this.caracteristiqueService.isEditable(code)) {
        return sum + (control.get('valeurMax')?.value || 0);
      }
      return sum;
    }, 0);
    console.log('pointsDepenses = ', pointsDepenses);

    // Mise à jour des points restants
    this.pointsRestants.set(totalPoints - pointsDepenses);
    console.log('pointsRestants = ', totalPoints - pointsDepenses);
    console.log(`Niveau de jeu: ${niveau}, Points restants: ${this.pointsRestants()}`);
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