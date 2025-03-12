import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnInit, Signal, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { RACE_LIST } from '../../../fake-data-set/race-fake';
import { PROFESSION_LIST, PROFESSION_MAP } from '../../../fake-data-set/profession-fake';
import { ARTISAN_INVENTAIRE, BARDE_INVENTAIRE, CRIMINEL_INVENTAIRE, DOCTEUR_INVENTAIRE, HOMME_D_ARME_INVENTAIRE, MAGE_INVENTAIRE, MARCHAND_INVENTAIRE, NOBLE_INVENTAIRE, PRETRE_INVENTAIRE, SORCELEUR_INVENTAIRE } from '../../../fake-data-set/inventaire-fake';

@Component({
  selector: 'app-part1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part1.component.html',
  styles: []
})
export class Part1Component implements OnInit {
  @Input() form!: FormGroup;
  races = RACE_LIST;
  professions = PROFESSION_LIST;
  selectedInventaire: FormArray;
  professionSignal = signal<number | null>(null);
  inventaireSignal: Signal<any[]>;

  constructor(private fb: FormBuilder) {
    this.selectedInventaire = this.fb.array([]);
    this.inventaireSignal = computed(() => this.updateInventaire(this.professionSignal()));
  }

  ngOnInit() {
    this.form.addControl('nomPersonnage', this.fb.control(''));
    this.form.addControl('nomJoueur', this.fb.control(''));
    this.form.addControl('genre', this.fb.control(''));
    this.form.addControl('terreNatale', this.fb.control(''));
    this.form.addControl('xp', this.fb.control(0)); // Valeur par défaut à 0
    this.form.addControl('age', this.fb.control(''));
    this.form.addControl('bestiaire', this.fb.control(false));
    this.form.addControl('historique', this.fb.control(''));
    this.form.addControl('profession', this.fb.control(''));
    this.form.addControl('race', this.fb.control(''));
    this.form.addControl('selectedInventaire', this.selectedInventaire);

    this.form.get('profession')?.valueChanges.subscribe(professionId => {
      this.professionSignal.set(professionId);
    });
  }

  updateInventaire(professionId: number | null): any[] {
    const professionName = PROFESSION_MAP[professionId || 0];
    switch (professionName) {
      case 'Artisan':
        return ARTISAN_INVENTAIRE;
      case 'Barde':
        return BARDE_INVENTAIRE;
      case 'Criminel':
        return CRIMINEL_INVENTAIRE;
      case 'Docteur':
        return DOCTEUR_INVENTAIRE;
      case 'Homme d\'armes':
        return HOMME_D_ARME_INVENTAIRE;
      case 'Mage':
        return MAGE_INVENTAIRE;
      case 'Marchand':
        return MARCHAND_INVENTAIRE;
      case 'Prêtre':
        return PRETRE_INVENTAIRE;
      case 'Sorceleur':
        return SORCELEUR_INVENTAIRE;
      case 'Noble':
        return NOBLE_INVENTAIRE;
      default:
        return [];
    }
  }

  onCheckboxChange(e: any) {
    if (e.target.checked) {
      this.selectedInventaire.push(new FormControl(e.target.value));
    } else {
      const index = this.selectedInventaire.controls.findIndex(x => x.value === e.target.value);
      this.selectedInventaire.removeAt(index);
    }
  }

  removeChip(item: string) {
    const index = this.selectedInventaire.controls.findIndex(x => x.value === item);
    if (index >= 0) {
      this.selectedInventaire.removeAt(index);
    }
  }
}