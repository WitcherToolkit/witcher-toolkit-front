import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Magie } from '../../../models/magie';
import { MAGIE_LIST } from '../../../fake-data-set/magie-fake';
import { PROFESSION_LIST } from '../../../fake-data-set/profession-fake';
import { RITUEL_LIST } from '../../../fake-data-set/rituel-fake';
import { Envoutement } from '../../../models/envoutement';
import { ENVOUTEMENT_LIST } from '../../../fake-data-set/envoutement-fake';
import { InventaireService } from '../../../inventaires/inventaire.service';
import { ToolsService } from '../../../tools/tools.service';

@Component({
  selector: 'app-part4',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part4.component.html',
  styles: ``
})
export class Part4Component implements OnInit {
  @Input() form!: FormGroup;
  // Magie
  selectedMagies!: FormArray;
  magieDisponible: Magie[] = [];
  magieInstruction: string = '';
  magieNom: string = '';
  // Rituel
  selectedRituels!: FormArray;
  rituelDisponible: any[] = [];
  rituelInstruction: string = '';
  rituelNom: string = '';
  // Envoûtement
  selectedEnvoutement!: FormArray;
  envoutementDisponible: Envoutement[] = [];
  envoutementInstruction: string = '';
  envoutementNom: string = '';

  constructor(private fb: FormBuilder, private toolsService: ToolsService) {}

  ngOnInit(): void {
    // Initialiser les magies dans le formulaire
    this.selectedMagies = this.fb.array([]);
    this.form.addControl('selectedMagies', this.selectedMagies);
    this.form.addControl('magiePersonnage', this.fb.control([]));
    // Initialiser les rituels dans le formulaire
    this.selectedRituels = this.fb.array([]);
    this.form.addControl('selectedRituels', this.selectedRituels);
    this.form.addControl('rituelPersonnage', this.fb.control([]));
    // Initialiser les envoûtement dans le formulaire
    this.selectedEnvoutement = this.fb.array([]);
    this.form.addControl('selectedEnvoutement', this.selectedEnvoutement);
    this.form.addControl('envoutementPersonnage', this.fb.control([]));

    // Initialiser la magie, les rituels et les envoûtements en fonction de la profession sélectionnée
    this.updateMagieDisponible();
    this.updateRituelDisponible();
    this.updateEnvoutementDisponible();

    // Réagir au changement de profession
    this.form.get('profession')?.valueChanges.subscribe(() => {
      // Mettre à jour les magies disponibles
      this.updateMagieDisponible();
      this.clearInvalidMagies();
      // Mettre à jour les rituels disponibles
      this.updateRituelDisponible();
      this.clearInvalidRituels();
      // Mettre à jour les envoûtements disponibles
      this.updateEnvoutementDisponible();
      this.clearInvalidEnvoutements();
    });

    this.selectedMagies.valueChanges.subscribe(() => {
      this.convertMagieToObject();
    });
    this.selectedRituels.valueChanges.subscribe(() => {
      this.convertRituelToObject();
    });
    this.selectedEnvoutement.valueChanges.subscribe(() => {
      this.convertEnvoutementToObject();
    });
  }
  //#region Magie
  // Méthode pour mettre à jour la liste des magies disponibles en fonction de la profession sélectionnée
  updateMagieDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = PROFESSION_LIST.find(p => p.id === +selectedProfessionId);
  
    // Si aucune profession n'est sélectionnée, vider la liste des magies disponibles
    if (!selectedProfession) {
      this.magieDisponible = [];
      this.magieInstruction = '';
      return;
    }
  
    let filtreType = '';
    // Déterminer le type de magie en fonction de la profession
    if (selectedProfession.nom === 'Mage') {
      filtreType = 'Sort';
      this.magieInstruction = 'Choisir 5 sorts';
      this.magieNom = 'Sorts';
    } else if (selectedProfession.nom === 'Prêtre') {
      filtreType = 'Invocation';
      this.magieInstruction = 'Choisir 2 invocations';
      this.magieNom = 'Invocations';
    } else {
      this.magieInstruction = '';
    }
  
    // Filtrer les magies disponibles en fonction de la profession et du niveau
    this.magieDisponible = MAGIE_LIST.filter(
      magie => magie.niveau === 'Novice' && magie.type === filtreType
    );
  }

  clearInvalidMagies() {
    // Supprimer les magies qui ne sont plus valides pour la profession
    this.toolsService.clearInvalidItems(this.selectedMagies, this.magieDisponible, () => this.convertMagieToObject());
  }

  // Méthode pour gérer le changement d'état de la case à cocher
  onCheckboxChangeMagie(e: any) {
    this.toolsService.handleCheckboxChange(e, this.selectedMagies, () => this.getMaxSelectableMagies(), () => this.convertMagieToObject());
  }

  // Méthode pour ajouter une magie à la liste des magies sélectionnées
  convertMagieToObject() {
    const magieList = this.selectedMagies.controls
      .map(control => this.magieDisponible.find(m => m.nom === control.value))
      .filter(Boolean) as Magie[];

    this.form.get('magiePersonnage')?.patchValue(magieList);
  }

  // Méthode pour supprimer une magie de la liste des magies sélectionnées
  removeChipMagie(nom: string) {
    this.toolsService.removeItemFromFormArray(this.selectedMagies, nom, () => this.convertMagieToObject());
  }

  // Méthode pour vérifier si une magie est déjà sélectionnée
  private getMaxSelectableMagies(): number {
    const professionLimits = { 'Prêtre': 2, 'Mage': 5 };

    return this.toolsService.getMaxSelectableItems(this.form.get('profession')?.value, professionLimits) || Infinity;
  }

  // Méthode pour vérifier si une magie est désactivée
  isMagieDisabled(nom: string): boolean {
    const max = this.getMaxSelectableMagies();
    return this.toolsService.isItemDisabled(this.selectedMagies.controls, max, nom);
  }
  //#endregion Magie

  //#region Rituel
  // Mettre à jour la liste des rituels disponibles en fonction de la profession
  updateRituelDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = PROFESSION_LIST.find(p => p.id === +selectedProfessionId);

    // Si aucune profession n'est sélectionnée, vider la liste des rituels disponibles
    if (!selectedProfession) {
      this.rituelDisponible = [];
      this.rituelInstruction = '';
      return;
    }

    // Déterminer les règles en fonction de la profession
    if (selectedProfession.nom === 'Mage') {
      this.rituelInstruction = 'Choisir 1 rituel';
      this.rituelNom = 'Rituels';
    } else if (selectedProfession.nom === 'Prêtre') {
      this.rituelInstruction = 'Choisir 2 rituels';
      this.rituelNom = 'Rituels';
    } else {
      this.rituelInstruction = '';
    }

    // Filtrer les rituels disponibles (niveau "Novice")
    this.rituelDisponible = RITUEL_LIST.filter(rituel => rituel.niveau === 'novice');
  }

  // Supprimer les rituels invalides pour la profession actuelle
  clearInvalidRituels() {
    this.toolsService.clearInvalidItems(this.selectedRituels, this.rituelDisponible, () => this.convertRituelToObject());
  }

  // Gérer le changement d'état des cases à cocher pour les rituels
  onCheckboxChangeRituel(e: any) {
    this.toolsService.handleCheckboxChange(e, this.selectedRituels, () => this.getMaxSelectableRituels(), () => this.convertRituelToObject());
  }

  // Convertir les rituels sélectionnés en objets pour le formulaire
  convertRituelToObject() {
    const rituelList = this.selectedRituels.controls
      .map(control => this.rituelDisponible.find(r => r.nom === control.value))
      .filter(Boolean);
    this.form.get('rituelPersonnage')?.patchValue(rituelList);
  }

  // Supprimer un rituel de la liste des rituels sélectionnés
  removeChipRituel(nom: string) {
    this.toolsService.removeItemFromFormArray(this.selectedRituels, nom, () => this.convertRituelToObject());
  }

  // Obtenir le nombre maximum de rituels sélectionnables en fonction de la profession
  private getMaxSelectableRituels(): number {
    const professionLimits = { 'Mage': 1, 'Prêtre': 2 };

    return this.toolsService.getMaxSelectableItems(this.form.get('profession')?.value, professionLimits) || Infinity;
  }

  // Vérifier si un rituel est désactivé
  isRituelDisabled(nom: string): boolean {
    const max = this.getMaxSelectableRituels();
    return this.toolsService.isItemDisabled(this.selectedRituels.controls, max, nom);
  }
  //#endregion Rituel
  //#region Envoûtement 
  updateEnvoutementDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = PROFESSION_LIST.find(p => p.id === +selectedProfessionId);

    // Si aucune profession n'est sélectionnée, vider la liste des envoûtements disponibles
    if (!selectedProfession) {
      this.envoutementDisponible = [];
      this.envoutementInstruction = '';
      return;
    }

    // Déterminer les règles en fonction de la profession
    if (selectedProfession.nom === 'Mage') {
      this.envoutementInstruction = 'Choisir 1 envoûtement';
      this.envoutementNom = 'Envoûtements';
    } else if (selectedProfession.nom === 'Prêtre') {
      this.envoutementInstruction = 'Choisir 2 envoûtements';
      this.envoutementNom = 'Envoûtements';
    } else {
      this.envoutementInstruction = '';
    }

    // Filtrer les envoûtements disponibles (danger "Faible")
    this.envoutementDisponible = ENVOUTEMENT_LIST.filter(env => env.danger === 'Faible');
  } 

  // Supprimer les envoûtements invalides pour la profession actuelle
  clearInvalidEnvoutements() {
    this.toolsService.clearInvalidItems(this.selectedEnvoutement, this.envoutementDisponible, () => this.convertEnvoutementToObject());
  }

  // Gérer le changement d'état des cases à cocher pour les envoutements
  onCheckboxChangeEnvoutement(e: any) {
    this.toolsService.handleCheckboxChange(e, this.selectedEnvoutement, () => this.getMaxSelectableEnvoutements(), () => this.convertEnvoutementToObject());
  }

  // Convertir les envoûtements sélectionnés en objets pour le formulaire
  convertEnvoutementToObject() {
    const envoutementList = this.selectedEnvoutement.controls
      .map(control => this.envoutementDisponible.find(e => e.nom === control.value))
      .filter(Boolean) as Envoutement[];
    this.form.get('envoutementPersonnage')?.patchValue(envoutementList);
  }
  // Supprimer un envoûtement de la liste des envoûtements sélectionnés
  removeChipEnvoutement(nom: string) {
    this.toolsService.removeItemFromFormArray(this.selectedEnvoutement, nom, () => this.convertEnvoutementToObject());
  }
  // Obtenir le nombre maximum d'envoûtements sélectionnables en fonction de la profession
  private getMaxSelectableEnvoutements(): number {
    const professionLimits = { 'Mage': 1, 'Prêtre': 2 };

    return this.toolsService.getMaxSelectableItems(this.form.get('profession')?.value, professionLimits) || Infinity;
  }

  // Vérifier si un envoûtement est désactivé
  isEnvoutementDisabled(nom: string): boolean {
    const max = this.getMaxSelectableEnvoutements();
    return this.toolsService.isItemDisabled(this.selectedEnvoutement.controls, max, nom);
  }
  //#region Envoûtement
}
