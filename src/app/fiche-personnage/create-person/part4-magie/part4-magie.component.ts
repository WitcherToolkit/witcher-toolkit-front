import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Magie } from '../../../models/magie';
import { Envoutement } from '../../../models/envoutement';
import { Profession } from '../../../models/profession';
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
export class Part4MagieComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  
  // FormArrays
  selectedMagies!: FormArray;
  selectedInvocations!: FormArray;
  selectedRituels!: FormArray;
  selectedEnvoutement!: FormArray;
  
  // Données disponibles
  magieDisponible: Magie[] = [];
  invocationDisponible: Magie[] = [];
  rituelDisponible: any[] = [];
  envoutementDisponible: Envoutement[] = [];
  professions: Profession[] = [];
  
  // Labels
  magieNom: string = '';
  invocationNom: string = '';
  rituelNom: string = '';
  envoutementNom: string = '';
  
  // UI
  showMagieDesc: number | null = null;
  
  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private magieService: MagieService,
    private rituelsService: RituelsService,
    private professionsService: ProfessionsService,
    private envoutementService: EnvoutementService
  ) {}

  ngOnInit(): void {
    this.initializeFormControls();
    this.loadProfessionsAndSetupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Initialisation des contrôles du formulaire
  private initializeFormControls(): void {
    // Magies (Sorts)
    this.selectedMagies = this.fb.array([]);
    this.form.addControl('selectedMagies', this.selectedMagies);
    this.form.addControl('magiePersonnage', this.fb.control([]));

    // Invocations
    this.selectedInvocations = this.fb.array([]);
    this.form.addControl('selectedInvocations', this.selectedInvocations);
    this.form.addControl('invocationPersonnage', this.fb.control([]));

    // Rituels
    this.selectedRituels = this.fb.array([]);
    this.form.addControl('selectedRituels', this.selectedRituels);
    this.form.addControl('rituelPersonnage', this.fb.control([]));

    // Envoûtements
    this.selectedEnvoutement = this.fb.array([]);
    this.form.addControl('selectedEnvoutement', this.selectedEnvoutement);
    this.form.addControl('envoutementPersonnage', this.fb.control([]));
  }

  // Chargement des professions et configuration des subscriptions
  private loadProfessionsAndSetupSubscriptions(): void {
    this.subscriptions.push(
      this.professionsService.getProfessionsList().subscribe(professions => {
        this.professions = professions;
        this.updateAllDisponibles();
        this.setupFormSubscriptions();
      })
    );
  }

  // Configuration des subscriptions
  private setupFormSubscriptions(): void {
    // Changement de profession
    this.subscriptions.push(
      this.form.get('profession')?.valueChanges.subscribe(() => {
        this.updateAllDisponibles();
        this.clearAllInvalid();
      }) || new Subscription()
    );

    // Synchronisation des sélections
    this.subscriptions.push(
      this.selectedMagies.valueChanges.subscribe(() => this.convertMagieToObject())
    );
    this.subscriptions.push(
      this.selectedInvocations.valueChanges.subscribe(() => this.convertInvocationToObject())
    );
    this.subscriptions.push(
      this.selectedRituels.valueChanges.subscribe(() => this.convertRituelToObject())
    );
    this.subscriptions.push(
      this.selectedEnvoutement.valueChanges.subscribe(() => this.convertEnvoutementToObject())
    );
  }

  // Mise à jour de tous les disponibles
  private updateAllDisponibles(): void {
    this.updateMagieDisponible();
    this.updateRituelDisponible();
    this.updateEnvoutementDisponible();
  }

  // Nettoyage de tous les invalides
  private clearAllInvalid(): void {
    this.clearInvalidMagies();
    this.clearInvalidRituels();
    this.clearInvalidEnvoutements();
  }

  // Getter pour la profession sélectionnée
  get selectedProfession(): Profession | undefined {
    const selectedProfessionId = this.form.get('profession')?.value;
    return this.professions.find(p => p.idProfession === +selectedProfessionId);
  }

  // ========== MAGIE (SORTS) ==========

  updateMagieDisponible(): void {
    const selectedProfession = this.selectedProfession;

    if (!selectedProfession) {
      this.magieDisponible = [];
      this.invocationDisponible = [];
      this.magieNom = '';
      this.invocationNom = '';
      return;
    }

    this.magieNom = 'Sorts';
    this.invocationNom = 'Invocations';

    this.subscriptions.push(
      this.magieService.getMagiesNoviceList().subscribe(magies => {
        this.magieDisponible = magies.filter(magie => magie.type === 'Sort');
        this.invocationDisponible = magies.filter(magie => magie.type === 'Invocation');
      })
    );
  }

  clearInvalidMagies(): void {
    this.toolsService.clearInvalidItems(
      this.selectedMagies, 
      this.magieDisponible, 
      () => this.convertMagieToObject()
    );
  }

  onCheckboxChangeMagie(e: any): void {
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

  convertMagieToObject(): void {
    const magieList = this.selectedMagies.controls
      .map(control => this.magieDisponible.find(m => m.nom === control.value && m.type === 'Sort'))
      .filter(Boolean) as Magie[];
    this.form.get('magiePersonnage')?.patchValue(magieList);
  }

  removeChipMagie(nom: string): void {
    const idx = this.selectedMagies.controls.findIndex(ctrl => ctrl.value === nom);
    if (idx > -1) {
      this.selectedMagies.removeAt(idx);
      this.convertMagieToObject();
    }
  }

  isMagieDisabled(nom: string): boolean {
    const max = this.selectedProfession?.maxSort ?? 0;
    const alreadySelected = this.selectedMagies.controls.some(ctrl => ctrl.value === nom);
    return this.selectedMagies.length >= max && !alreadySelected;
  }

  // ========== INVOCATION ==========

  onCheckboxChangeInvocation(e: any): void {
    const value = e.target.value;
    const checked = e.target.checked;
    const max = this.selectedProfession?.maxInvocation ?? 0;

    if (checked) {
      if (
        this.selectedInvocations.length < max &&
        !this.selectedInvocations.controls.some(ctrl => ctrl.value === value)
      ) {
        this.selectedInvocations.push(new FormControl(value));
      }
    } else {
      const idx = this.selectedInvocations.controls.findIndex(ctrl => ctrl.value === value);
      if (idx > -1) {
        this.selectedInvocations.removeAt(idx);
      }
    }
    this.convertInvocationToObject();
  }

  convertInvocationToObject(): void {
    const invocationList = this.selectedInvocations.controls
      .map(control => this.invocationDisponible.find(m => m.nom === control.value && m.type === 'Invocation'))
      .filter(Boolean) as Magie[];
    this.form.get('invocationPersonnage')?.patchValue(invocationList);
  }

  removeChipInvocation(nom: string): void {
    const idx = this.selectedInvocations.controls.findIndex(ctrl => ctrl.value === nom);
    if (idx > -1) {
      this.selectedInvocations.removeAt(idx);
      this.convertInvocationToObject();
    }
  }

  isInvocationDisabled(nom: string): boolean {
    const max = this.selectedProfession?.maxInvocation ?? 0;
    const alreadySelected = this.selectedInvocations.controls.some(ctrl => ctrl.value === nom);
    return this.selectedInvocations.length >= max && !alreadySelected;
  }

  // ========== RITUEL ==========

  updateRituelDisponible(): void {
    const selectedProfession = this.selectedProfession;

    if (!selectedProfession) {
      this.rituelDisponible = [];
      this.rituelNom = '';
      return;
    }

    this.rituelNom = 'Rituels';

    this.subscriptions.push(
      this.rituelsService.getRituelsNoviceList().subscribe(rituels => {
        this.rituelDisponible = rituels;
      })
    );
  }

  clearInvalidRituels(): void {
    this.toolsService.clearInvalidItems(
      this.selectedRituels, 
      this.rituelDisponible, 
      () => this.convertRituelToObject()
    );
  }

  onCheckboxChangeRituel(e: any): void {
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

  convertRituelToObject(): void {
    const rituelList = this.selectedRituels.controls
      .map(control => this.rituelDisponible.find(r => r.nom === control.value))
      .filter(Boolean);
    this.form.get('rituelPersonnage')?.patchValue(rituelList);
  }

  removeChipRituel(nom: string): void {
    this.toolsService.removeItemFromFormArray(
      this.selectedRituels, 
      nom, 
      () => this.convertRituelToObject()
    );
  }

  isRituelDisabled(nom: string): boolean {
    const max = this.selectedProfession?.maxRituel ?? 0;
    const alreadySelected = this.selectedRituels.controls.some(ctrl => ctrl.value === nom);
    return this.selectedRituels.length >= max && !alreadySelected;
  }

  // ========== ENVOÛTEMENT ==========

  updateEnvoutementDisponible(): void {
    const selectedProfession = this.selectedProfession;

    if (!selectedProfession) {
      this.envoutementDisponible = [];
      this.envoutementNom = '';
      return;
    }

    this.envoutementNom = 'Envoûtements';

    this.subscriptions.push(
      this.envoutementService.getEnvoutementList().subscribe(envoutements => {
        this.envoutementDisponible = envoutements.filter(env => env.danger === 'Faible');
      })
    );
  }

  clearInvalidEnvoutements(): void {
    this.toolsService.clearInvalidItems(
      this.selectedEnvoutement, 
      this.envoutementDisponible, 
      () => this.convertEnvoutementToObject()
    );
  }

  onCheckboxChangeEnvoutement(e: any): void {
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

  convertEnvoutementToObject(): void {
    const envoutementList = this.selectedEnvoutement.controls
      .map(control => this.envoutementDisponible.find(e => e.nom === control.value))
      .filter(Boolean) as Envoutement[];
    this.form.get('envoutementPersonnage')?.patchValue(envoutementList);
  }

  removeChipEnvoutement(nom: string): void {
    this.toolsService.removeItemFromFormArray(
      this.selectedEnvoutement, 
      nom, 
      () => this.convertEnvoutementToObject()
    );
  }

  isEnvoutementDisabled(nom: string): boolean {
    const max = this.selectedProfession?.maxEnvoutement ?? 0;
    const alreadySelected = this.selectedEnvoutement.controls.some(ctrl => ctrl.value === nom);
    return this.selectedEnvoutement.length >= max && !alreadySelected;
  }
}