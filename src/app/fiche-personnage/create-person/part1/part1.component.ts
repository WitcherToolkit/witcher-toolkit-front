import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnInit, Signal, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { RACE_LIST, RACE_MAP } from '../../../fake-data-set/race-fake';
import { PROFESSION_LIST, PROFESSION_MAP } from '../../../fake-data-set/profession-fake';
import { ARTISAN_INVENTAIRE, BARDE_INVENTAIRE, CRIMINEL_INVENTAIRE, DOCTEUR_INVENTAIRE, HOMME_D_ARME_INVENTAIRE, MAGE_INVENTAIRE, MARCHAND_INVENTAIRE, NOBLE_INVENTAIRE, PRETRE_INVENTAIRE, SORCELEUR_INVENTAIRE } from '../../../fake-data-set/inventaire-fake';
import { Inventaire } from '../../../models/inventaire';

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
  filteredProfessions: any[] = [];
  selectedInventaire!: FormArray;
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
    this.form.addControl('inventaires', this.fb.control([]));

    this.form.addControl('selectedInventaire', this.selectedInventaire); // pour qu'il soit bien initialité

    //Appel des changements dans le formulaire
    this.form.get('selectedInventaire')?.valueChanges.subscribe(() => {
      this.convertInventaireToObject();
    });
    this.form.get('profession')?.valueChanges.subscribe(professionId => {
      this.professionSignal.set(professionId);
    });
    this.form.get('race')?.valueChanges.subscribe(raceId => {
      this.filterProfessions(raceId);
    });
    // Initialiser les professions filtrées
    this.filteredProfessions = this.professions;
  }

  filterProfessions(raceId: number) {
    // Récupération des IDs des professions Sorceleur et Mage
    const sorceleurProfessionId = Object.keys(PROFESSION_MAP).find(key => PROFESSION_MAP[+key] === 'Sorceleur');
    const mageProfessionId = Object.keys(PROFESSION_MAP).find(key => PROFESSION_MAP[+key] === 'Mage');
  
    // Récupération des IDs des races Sorceleur, Humain et Elfe
    const sorceleurRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Sorceleur');
    const humainRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Humain');
    const elfeRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Elfe');
  
    // Si la race sélectionnée est Sorceleur
    if (raceId.toString() === sorceleurRaceId) {
      // Seule la profession Sorceleur est disponible
      this.filteredProfessions = this.professions.filter(prof => prof.nom === 'Sorceleur');
      this.form.get('profession')?.setValue(sorceleurProfessionId, { emitEvent: false });
      return; 
    }
  
    // Si la race sélectionnée n'est PAS Sorceleur
    // On exclut Sorceleur de la liste des professions disponibles
    this.filteredProfessions = this.professions.filter(prof => prof.nom !== 'Sorceleur');
  
    // Si la profession actuelle est Sorceleur, on la réinitialise à "Choisir Profession"
    if (this.form.get('profession')?.value === sorceleurProfessionId) {
      this.form.get('profession')?.setValue('', { emitEvent: false });
    }
  
    // Si la race sélectionnée N'EST PAS Humain ou Elfe, on exclut Mage de la liste
    if (![humainRaceId, elfeRaceId].includes(raceId.toString())) {
      this.filteredProfessions = this.filteredProfessions.filter(prof => prof.nom !== 'Mage');
  
      // Si la profession actuelle est Mage", on la réinitialise à "Choisir Profession"
      if (this.form.get('profession')?.value === mageProfessionId) {
        this.form.get('profession')?.setValue('', { emitEvent: false });
      }
    }
  }

  //Affichage de l'inventaire disponible en fonction de la profession
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
  convertInventaireToObject() {
    const inventaireList: Inventaire[] = this.selectedInventaire.controls.map(control => ({
      nom: control.value,
      type: '',
      effet: '',
      quantite: undefined
    }));
    this.form.get('inventaires')?.patchValue(inventaireList);
  }

  //Comportement des checkbox
  onCheckboxChange(e: any) {
    if (e.target.checked) {
      this.selectedInventaire.push(new FormControl(e.target.value));
    } else {
      const index = this.selectedInventaire.controls.findIndex(x => x.value === e.target.value);
      if (index !== -1) {
        this.selectedInventaire.removeAt(index);
      }
    }
    this.convertInventaireToObject();
  }

  //Comportement des chips
  removeChip(item: string) {
    const index = this.selectedInventaire.controls.findIndex(x => x.value === item);
    if (index >= 0) {
      this.selectedInventaire.removeAt(index);
    }
    this.convertInventaireToObject();
  }

}