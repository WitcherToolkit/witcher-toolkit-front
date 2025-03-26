import { Component, OnInit, OnDestroy, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RACE_MAP } from '../../../fake-data-set/race-fake';
import { CARACTERISTIQUE_LIST } from '../../../fake-data-set/caracteristiques-fake';
import { PROFESSION_MAP } from '../../../fake-data-set/profession-fake';

@Component({
  selector: 'app-part2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part2.component.html',
  styles: ``,
})
export class Part2Component implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  caracteristiques = CARACTERISTIQUE_LIST;

  subscriptions: Subscription[] = [];
  
  niveauJeu = signal<string>('libre');
  pointsRestants = signal<number>(0);

  constructor(private fb: FormBuilder) {
    // Écoute les changements de niveau et met à jour les points restants
    effect(() => {
      this.updatePointsRestants();
    });
  }

  ngOnInit() {
    console.log(`Initialisation étape 2:`, this.form.value);
    this.initializeFormControls();
    this.calculateDerivedValues();
    this.subscribeToNiveauJeuChanges();
  }

  ngOnDestroy() {
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
    const isEditable = this.isEditable(code);
    const control = this.fb.group({
      valeurMax: [isEditable ? 3 : { value: 0, disabled: true }, [Validators.required, Validators.min(3), Validators.max(10)]],
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
      })
    );
  }

  // Récupération du FormArray des caractéristiques
  get caracteristiquePersonnage(): FormArray {
    return this.form.get('caracteristiquePersonnage') as FormArray;
  }

  // Vérification si une caractéristique est éditable
  isEditable(code: string): boolean {
    return ['INT', 'RÉF', 'DEX', 'COR', 'VIT', 'EMP', 'TECH', 'VOL', 'CHA'].includes(code);
  }

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
    const derivedValues = this.getDerivedValues(average);
  
    this.setDerivedValue('PS', derivedValues.PS);
    this.setDerivedValue('END', derivedValues.END);
    this.setDerivedValue('RÉC', derivedValues.RÉC);
    this.setDerivedValue('ÉTOU', derivedValues.ÉTOU);
  
    let encValue = corValue * 10;
    const couValue = vitValue * 3;
    const sautValue = Math.floor(couValue / 5);
  
    const raceId = this.form.get('race')?.value;
    const raceName = RACE_MAP[raceId];
    if (raceName === 'Nain') {
      encValue += 25;
    }
  
    this.setDerivedValue('ENC', encValue);
    this.setDerivedValue('COU', couValue);
    this.setDerivedValue('SAUT', sautValue);
  
    const { poings, pieds } = this.getPoingsPiedsValues(corValue);
    this.form.get('poings')?.setValue(poings);
    this.form.get('pieds')?.setValue(pieds);
  
    // Mettre à jour la vigueur
    const vigueur = this.getVigueur();
    this.form.get('vigueur')?.setValue(vigueur);
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

  // Mise à jour de la valeur d'une caractéristique dérivée
  setDerivedValue(code: string, value: number) {
    const index = this.caracteristiques.findIndex(c => c.code === code);
    if (index !== -1) {
      const control = this.caracteristiquePersonnage.at(index);
      control.get('valeurMax')?.setValue(value);
      control.get('valeurActuelle')?.setValue(value);
    }
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
      if (this.isEditable(code)) {
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
}