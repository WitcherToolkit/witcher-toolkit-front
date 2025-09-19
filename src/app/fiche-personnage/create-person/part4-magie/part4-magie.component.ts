import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Magie } from '../../../models/magie';
import { Envoutement } from '../../../models/envoutement';
import { ToolsService } from '../../../tools/tools.service';
import { MagieService } from '../../../sorts/magie.service';
import { RituelsService } from '../../../rituels/rituels.service';
import { ProfessionsService } from '../../../professions/professions.service';
import { EnvoutementService } from '../../../envoutements/envoutement.service';
import { MaterializeTooltipDirective } from '../../../directives/materialize-tooltip.directive';

@Component({
  selector: 'app-part4',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterializeTooltipDirective],
  templateUrl: './part4-magie.component.html',
  styleUrls: ['./part4-magie.component.scss'],
})
export class Part4MagieComponent implements OnInit {
  @Input() form!: FormGroup;
  // -- Magie --
  selectedMagies!: FormArray;
  magieDisponible: Magie[] = [];
  magieNom: string = '';
  // -- Rituel --
  selectedRituels!: FormArray;
  rituelDisponible: any[] = [];
  rituelNom: string = '';
  // -- Envoûtement --
  selectedEnvoutement!: FormArray;
  envoutementDisponible: Envoutement[] = [];
  envoutementNom: string = '';
  // -- Professions --
  professions: any[] = [];
  showMagieDesc: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private magieService: MagieService,
    private rituelsService: RituelsService,
    private professionsService: ProfessionsService,
    private envoutementService: EnvoutementService
  ) {}

  // -- Utilitaire pour récupérer la profession sélectionnée --
  get selectedProfession() {
    const selectedProfessionId = this.form.get('profession')?.value;
    return this.professions.find(p => p.idProfession === +selectedProfessionId);
  }

  ngOnInit(): void {
    // -- Initialisation des FormArray et des propriétés du formulaire --
    this.selectedMagies = this.fb.array([]);
    this.form.addControl('selectedMagies', this.selectedMagies);
    this.form.addControl('magiePersonnage', this.fb.control([]));

    this.selectedRituels = this.fb.array([]);
    this.form.addControl('selectedRituels', this.selectedRituels);
    this.form.addControl('rituelPersonnage', this.fb.control([]));

    this.selectedEnvoutement = this.fb.array([]);
    this.form.addControl('selectedEnvoutement', this.selectedEnvoutement);
    this.form.addControl('envoutementPersonnage', this.fb.control([]));

    // -- Chargement des professions --
    this.professionsService.getProfessionsList().subscribe(professions => {
      this.professions = professions;
      this.updateMagieDisponible();
      this.updateRituelDisponible();
      this.updateEnvoutementDisponible();
    });

    // -- Réagir au changement de profession --
    this.form.get('profession')?.valueChanges.subscribe(() => {
      this.updateMagieDisponible();
      this.clearInvalidMagies();
      this.updateRituelDisponible();
      this.clearInvalidRituels();
      this.updateEnvoutementDisponible();
      this.clearInvalidEnvoutements();
    });

    // -- Synchronisation des objets sélectionnés --
    this.selectedMagies.valueChanges.subscribe(() => this.convertMagieToObject());
    this.selectedRituels.valueChanges.subscribe(() => this.convertRituelToObject());
    this.selectedEnvoutement.valueChanges.subscribe(() => this.convertEnvoutementToObject());
  }

  // -- Magie --

  updateMagieDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = this.professions.find(p => p.idProfession === +selectedProfessionId);

    if (!selectedProfession) {
      this.magieDisponible = [];
      this.magieNom = '';
      return;
    }
    this.magieNom = 'Sorts';

    // Affiche uniquement les magies de type "Sort"
    this.magieService.getMagiesNoviceList().subscribe(magies => {
      this.magieDisponible = magies.filter(magie => magie.type === 'Sort');
    });
  }

  clearInvalidMagies() {
    this.toolsService.clearInvalidItems(this.selectedMagies, this.magieDisponible, () => this.convertMagieToObject());
  }

  onCheckboxChangeMagie(e: any) {
    const value = e.target.value;
    const checked = e.target.checked;
    const max = this.selectedProfession?.maxSort ?? 0;

    if (checked) {
      if (
        this.selectedMagies.length < max &&
        !this.selectedMagies.controls.some(ctrl => ctrl.value === value)
      ) {
        this.selectedMagies.push(new FormControl(value));
      }
    } else {
      const idx = this.selectedMagies.controls.findIndex(ctrl => ctrl.value === value);
      if (idx > -1) {
        this.selectedMagies.removeAt(idx);
      }
    }
    this.convertMagieToObject();
  }

  convertMagieToObject() {
    const magieList = this.selectedMagies.controls
      .map(control => this.magieDisponible.find(m => m.nom === control.value))
      .filter(Boolean) as Magie[];
    this.form.get('magiePersonnage')?.patchValue(magieList);
  }

  removeChipMagie(nom: string) {
    const idx = this.selectedMagies.controls.findIndex(ctrl => ctrl.value === nom);
    if (idx > -1) {
      this.selectedMagies.removeAt(idx);
      this.convertMagieToObject();
    }
  }

  isMagieDisabled(nom: string) {
    const max = this.selectedProfession?.maxSort ?? 0;
    const alreadySelected = this.selectedMagies.controls.some(ctrl => ctrl.value === nom);
    return this.selectedMagies.length >= max && !alreadySelected;
  }

  // -- Rituel --

  updateRituelDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = this.professions.find(p => p.idProfession === +selectedProfessionId);

    if (!selectedProfession) {
      this.rituelDisponible = [];
      this.rituelNom = '';
      return;
    }
    this.rituelNom = 'Rituels';

    this.rituelsService.getRituelsNoviceList().subscribe(rituels => {
      this.rituelDisponible = rituels;
    });
  }

  clearInvalidRituels() {
    this.toolsService.clearInvalidItems(this.selectedRituels, this.rituelDisponible, () => this.convertRituelToObject());
  }

  onCheckboxChangeRituel(e: any) {
    const value = e.target.value;
    const checked = e.target.checked;
    const max = this.selectedProfession?.maxRituel ?? 0;

    if (checked) {
      if (
        this.selectedRituels.length < max &&
        !this.selectedRituels.controls.some(ctrl => ctrl.value === value)
      ) {
        this.selectedRituels.push(new FormControl(value));
      }
    } else {
      const idx = this.selectedRituels.controls.findIndex(ctrl => ctrl.value === value);
      if (idx > -1) {
        this.selectedRituels.removeAt(idx);
      }
    }
    this.convertRituelToObject();
  }

  convertRituelToObject() {
    const rituelList = this.selectedRituels.controls
      .map(control => this.rituelDisponible.find(r => r.nom === control.value))
      .filter(Boolean);
    this.form.get('rituelPersonnage')?.patchValue(rituelList);
  }

  removeChipRituel(nom: string) {
    this.toolsService.removeItemFromFormArray(this.selectedRituels, nom, () => this.convertRituelToObject());
  }

  isRituelDisabled(nom: string) {
    const max = this.selectedProfession?.maxRituel ?? 0;
    const alreadySelected = this.selectedRituels.controls.some(ctrl => ctrl.value === nom);
    return this.selectedRituels.length >= max && !alreadySelected;
  }

  // -- Envoûtement --

  updateEnvoutementDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = this.professions.find(p => p.idProfession === +selectedProfessionId);

    if (!selectedProfession) {
      this.envoutementDisponible = [];
      this.envoutementNom = '';
      return;
    }
    this.envoutementNom = 'Envoûtements';

    this.envoutementService.getEnvoutementList().subscribe(envoutements => {
      this.envoutementDisponible = envoutements.filter(env => env.danger === 'Faible');
    });
  }

  clearInvalidEnvoutements() {
    this.toolsService.clearInvalidItems(this.selectedEnvoutement, this.envoutementDisponible, () => this.convertEnvoutementToObject());
  }

  onCheckboxChangeEnvoutement(e: any) {
    const value = e.target.value;
    const checked = e.target.checked;
    const max = this.selectedProfession?.maxEnvoutement ?? 0;

    if (checked) {
      if (
        this.selectedEnvoutement.length < max &&
        !this.selectedEnvoutement.controls.some(ctrl => ctrl.value === value)
      ) {
        this.selectedEnvoutement.push(new FormControl(value));
      }
    } else {
      const idx = this.selectedEnvoutement.controls.findIndex(ctrl => ctrl.value === value);
      if (idx > -1) {
        this.selectedEnvoutement.removeAt(idx);
      }
    }
    this.convertEnvoutementToObject();
  }

  convertEnvoutementToObject() {
    const envoutementList = this.selectedEnvoutement.controls
      .map(control => this.envoutementDisponible.find(e => e.nom === control.value))
      .filter(Boolean) as Envoutement[];
    this.form.get('envoutementPersonnage')?.patchValue(envoutementList);
  }

  removeChipEnvoutement(nom: string) {
    this.toolsService.removeItemFromFormArray(this.selectedEnvoutement, nom, () => this.convertEnvoutementToObject());
  }

  isEnvoutementDisabled(nom: string) {
    const max = this.selectedProfession?.maxEnvoutement ?? 0;
    const alreadySelected = this.selectedEnvoutement.controls.some(ctrl => ctrl.value === nom);
    return this.selectedEnvoutement.length >= max && !alreadySelected;
  }

}