import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { RequiredAsteriskDirective } from '../../../directives/required-asterisk.directive';
import { FormControlErrorComponent } from '../../../form-validation/form-control-error.component';
import { Profession } from '../../../models/profession';
import { Race } from '../../../models/race';
import { Competence } from '../../../models/competence';
import { ProfessionsService } from '../../../professions/professions.service';
import { ToolsService } from '../../../tools/tools.service';
import { RacesService } from '../../../races/races.service';
import { CompetenceService } from '../../../competences/competence.service';

@Component({
  selector: 'app-part1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RequiredAsteriskDirective,
    FormControlErrorComponent
  ],
  templateUrl: './part1-identity.component.html',
  styleUrls: ['./part1-identity.component.scss']
})
export class Part1IdentityComponent implements OnInit, OnDestroy {
  // --- INPUT & FORM ---
  @Input() form!: FormGroup;
  @Output() professionsChange = new EventEmitter<Profession[]>();

  // --- DATA ---
  races: Race[] = [];
  professions: Profession[] = [];
  filteredProfessions: Profession[] = [];
  readonly selectedInventaire!: FormArray;
  readonly professionSignal = signal<number | null>(null);
  inventaireWikiList: any[] = [];
  selectedProfessionNbObjet: number | null = null;

  competences: Competence[] = [];
  languesList: Competence[] = [];
  selectedLangues: Competence[] = [];
  combatCompetences: Competence[] = [];
  selectedCombatCompetences: Competence[] = [];

  // --- SUBSCRIPTIONS ---
  private subscriptions: Subscription[] = [];

  // --- CONSTRUCTOR ---
  constructor(
    private fb: FormBuilder,
    private professionsService: ProfessionsService,
    private toolsService: ToolsService,
    private racesService: RacesService,
    private competenceService: CompetenceService
  ) {
    this.selectedInventaire = this.fb.array([]);
  }

  // --- LIFECYCLE ---
  ngOnInit() {
    this.initializeForm();
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // --- CHARGEMENT INITIAL ---
  private loadInitialData(): void {
    // Chargement des compétences
    this.subscriptions.push(
      this.competenceService.getCompetencesList().subscribe((competences: Competence[]) => {
        this.competences = competences;
        this.languesList = competences.filter(c => c.type === 'Langue');
        this.combatCompetences = competences.filter(c => c.type === 'Combat');
      })
    );

    // Synchronisation du FormArray selectedInventaire
    this.syncSelectedInventaire();

    // Chargement des races
    this.subscriptions.push(
      this.racesService.getRacesList().subscribe((races: Race[]) => {
        this.races = races;
      })
    );

    // Chargement des professions + synchronisation initiale
    this.subscriptions.push(
      this.professionsService.getProfessionsList().subscribe((professions: Profession[]) => {
        this.professions = professions;
        this.filteredProfessions = professions;
        this.professionsChange.emit(professions);
        this.syncProfessionDataIfPresent();
      })
    );
  }

  // --- CONFIGURATION DES SUBSCRIPTIONS ---
  private setupFormSubscriptions(): void {
    // Gestion des changements de profession (SANS subscription imbriquée)
    this.subscriptions.push(
      this.professionControl?.valueChanges.pipe(
        tap(profession => {
          const professionId = profession?.idProfession;
          this.professionSignal.set(professionId);
          this.resetSelections();
        }),
        switchMap(profession => {
          const professionId = profession?.idProfession;
          if (!professionId) {
            this.resetInventaireState();
            return of(null);
          }
          return this.professionsService.getProfessionCompetences(professionId);
        })
      ).subscribe(prof => {
        if (prof) {
          this.inventaireWikiList = prof.inventaireWikiList || [];
          this.selectedProfessionNbObjet = prof.nbObjet ?? null;
        }
        this.updateInventairesControl();
      }) || new Subscription()
    );

    // Gestion des changements de race (objet Race complet)
    this.subscriptions.push(
      this.raceControl?.valueChanges.pipe(
        tap(race => {
          console.log('Race sélectionnée :', race?.nom, 'id:', race?.idRace);
        }),
        switchMap(race => {
          const raceId = race?.idRace ?? 0;
          return this.professionsService.filterProfessions(raceId);
        })
      ).subscribe(filtered => {
        console.log('Professions filtrées:', filtered.map(p => p.nom));
        this.filteredProfessions = filtered;
        this.validateCurrentProfession();
      }) || new Subscription()
    );

    // Synchronisation du FormArray inventaire
    this.subscriptions.push(
      this.selectedInventaire.valueChanges.subscribe(() => {
        this.updateInventairesControl();
      })
    );
  }

  // --- MÉTHODES HELPER POUR LA SYNCHRONISATION ---
  
  /** Synchronise le FormArray avec les données brutes du form */
  private syncSelectedInventaire(): void {
    const selectedInventaireRaw = this.form.get('selectedInventaire')?.value;
    if (Array.isArray(selectedInventaireRaw)) {
      this.selectedInventaire.clear();
      selectedInventaireRaw.forEach(item => {
        if (item && item.nom) {
          this.selectedInventaire.push(this.fb.group({ nom: item.nom }));
        }
      });
    }
  }

  /** Synchronise les données de profession si déjà sélectionnée */
  private syncProfessionDataIfPresent(): void {
    const profession = this.professionControl?.value;
    const professionId = profession?.idProfession;
    if (professionId) {
      this.professionSignal.set(professionId);
      this.subscriptions.push(
        this.professionsService.getProfessionCompetences(professionId).subscribe(prof => {
          this.inventaireWikiList = prof.inventaireWikiList || [];
          this.selectedProfessionNbObjet = prof.nbObjet ?? null;
          this.updateInventairesControl();
        })
      );
    }
  }

  /** Met à jour le contrôle inventaires */
  private updateInventairesControl(): void {
    const inventaires = this.convertInventaireToObject(this.selectedInventaire.controls);
    this.inventairesControl?.setValue(inventaires, { emitEvent: false });
  }

  /** Valide que la profession actuelle est toujours compatible avec la race */
  private validateCurrentProfession(): void {
    const currentProfession = this.professionControl?.value;
    const currentProfessionId = currentProfession?.idProfession;
    const isProfessionStillValid = this.filteredProfessions.some(
      prof => prof.idProfession === currentProfessionId
    );
    if (!isProfessionStillValid) {
      this.professionControl?.setValue(null, { emitEvent: false });
    }
  }

  // --- FORM CONTROLS GETTERS ---
  get professionControl() { return this.form.get('profession'); }
  get raceControl() { return this.form.get('race'); }
  get selectedInventaireControl() { return this.form.get('selectedInventaire'); }
  get inventairesControl() { return this.form.get('inventaires'); }
  get genreControl() { return this.form.get('genre'); }

  // --- INVENTAIRE : FILTRES ---
  private filterInventaireWikiList(special: boolean) {
    return this.inventaireWikiList.filter(obj => obj.special === special);
  }
  
  get filteredInventaireWikiList() {
    return this.filterInventaireWikiList(false);
  }
  
  get filteredSpecialInventaireWikiList() {
    return this.filterInventaireWikiList(true);
  }

  // --- FORM INITIALISATION ---
  private initializeForm() {
    this.form.addControl('nomPersonnage', this.fb.control('', [Validators.maxLength(50), Validators.required]));
    this.form.addControl('nomJoueur', this.fb.control('', [Validators.maxLength(50)]));
    this.form.addControl('genre', this.fb.control('', [Validators.required, Validators.maxLength(1)]));
    this.form.addControl('terreNatale', this.fb.control('', [Validators.maxLength(100)]));
    this.form.addControl('xp', this.fb.control(0));
    this.form.addControl('age', this.fb.control(0, [Validators.min(0)]));
    this.form.addControl('bestiaire', this.fb.control(false));
    this.form.addControl('historique', this.fb.control(''));
    this.form.addControl('profession', this.fb.control(null, [Validators.required]));
    this.form.addControl('race', this.fb.control(null, [Validators.required]));
    this.form.addControl('inventaires', this.fb.control([], [Validators.required]));
    this.form.addControl('selectedInventaire', this.selectedInventaire);
    this.form.addControl('languesSelectionnees', this.fb.control([]));
    this.form.addControl('combatSelectionnees', this.fb.control([]));
  }

  // --- INVENTAIRE : CHECKBOX, CHIPS, RESET ---
  private addInventaireItem(value: string) {
    this.selectedInventaire.push(this.fb.group({ nom: value }));
  }

  private removeInventaireItem(value: string) {
    const index = this.selectedInventaire.controls.findIndex(ctrl => ctrl.value.nom === value);
    if (index !== -1) {
      this.selectedInventaire.removeAt(index);
    }
  }

  onCheckboxChange(e: any) {
    const value = e.target.value;
    const checked = e.target.checked;
    if (checked) {
      this.addInventaireItem(value);
    } else {
      this.removeInventaireItem(value);
    }
  }

  resetSelections() {
    this.selectedInventaire.clear();
    this.selectedLangues = [];
    this.selectedCombatCompetences = [];
    this.form.get('languesSelectionnees')?.setValue([]);
    this.form.get('combatSelectionnees')?.setValue([]);
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
      checkbox.disabled = false;
    });
    
    this.toolsService.clearInvalidItems(
      this.selectedInventaire, 
      [], 
      () => this.convertInventaireToObject(this.selectedInventaire.controls)
    );
  }

  private resetInventaireState() {
    this.inventaireWikiList = [];
    this.selectedProfessionNbObjet = null;
  }

  // --- INVENTAIRE : CONVERSION ---
  private convertInventaireToObject(selectedInventaire: any[]): any[] {
    const userItems = selectedInventaire.map(control => {
      const wiki = this.inventaireWikiList.find((w: any) => w.nom === control.value.nom);
      if (!wiki) return { nom: control.value.nom };
      
      const inventaire: any = { nom: wiki.nom };
      if (wiki.type) inventaire.type = wiki.type;
      if (wiki.effet) inventaire.effet = wiki.effet;
      if (wiki.quantite !== undefined && wiki.quantite !== null && wiki.quantite !== '') {
        inventaire.quantite = wiki.quantite;
      }
      return inventaire;
    });

    const specialItems = this.inventaireWikiList
      .filter((w: any) => w.special === true && !userItems.some((i: any) => i.nom === w.nom))
      .map((wiki: any) => {
        const inventaire: any = { nom: wiki.nom };
        if (wiki.type) inventaire.type = wiki.type;
        if (wiki.effet) inventaire.effet = wiki.effet;
        if (wiki.quantite !== undefined && wiki.quantite !== null && wiki.quantite !== '') {
          inventaire.quantite = wiki.quantite;
        }
        return inventaire;
      });

    return [...userItems, ...specialItems];
  }

  // --- UTILITAIRES ---
  isCheckboxDisabled(item: any): boolean {
    const maxItems = this.getMaxInventaireItems();
    const isSelected = this.selectedInventaire.controls.some(ctrl => ctrl.value.nom === item.nom);
    return this.selectedInventaire.length >= maxItems && !isSelected;
  }

  getMaxInventaireItems(): number {
    return this.selectedProfessionNbObjet !== null ? this.selectedProfessionNbObjet : 5;
  }

  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.form.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }

  isItemChecked(item: any): boolean {
    return this.selectedInventaire.controls.some(ctrl => ctrl.value.nom === item.nom);
  }

  // --- GESTION DES LANGUES ---
  onLangueCheckboxChange(event: any) {
    const value = event.target.value;
    const checked = event.target.checked;
    const langueObj = this.languesList.find(l => l.nom === value);
    if (!langueObj) return;

    if (checked) {
      if (this.selectedLangues.length < this.getMaxLangues()) {
        this.selectedLangues.push(langueObj);
      }
    } else {
      this.selectedLangues = this.selectedLangues.filter(l => l.nom !== value);
    }
    
    this.form.get('languesSelectionnees')?.setValue(
      this.selectedLangues.map(l => l.idCompetence)
    );
  }

  isLangueChecked(langue: Competence): boolean {
    return this.selectedLangues.some(l => l.nom === langue.nom);
  }

  isLangueCheckboxDisabled(langue: Competence): boolean {
    const isSelected = this.selectedLangues.some(l => l.nom === langue.nom);
    const max = this.getMaxLangues();
    return !isSelected && this.selectedLangues.length >= max;
  }

  getMaxLangues(): number {
    const profession = this.professionControl?.value;
    const name = profession?.nom;
    if (name === 'Barde') return 1;
    if (name === 'Marchand') return 2;
    return 0;
  }

  // --- GESTION DES COMPÉTENCES DE COMBAT ---
  onCombatCheckboxChange(event: any) {
    const value = event.target.value;
    const checked = event.target.checked;
    const compObj = this.combatCompetences.find(c => c.nom === value);
    if (!compObj) return;

    if (checked) {
      if (this.selectedCombatCompetences.length < this.getMaxCombatCompetences()) {
        this.selectedCombatCompetences.push(compObj);
      }
    } else {
      this.selectedCombatCompetences = this.selectedCombatCompetences.filter(c => c.nom !== value);
    }
    
    this.form.get('combatSelectionnees')?.setValue(
      this.selectedCombatCompetences.map(c => c.idCompetence)
    );
  }

  isCombatChecked(comp: Competence): boolean {
    return this.selectedCombatCompetences.some(c => c.nom === comp.nom);
  }

  isCombatCheckboxDisabled(comp: Competence): boolean {
    const isSelected = this.selectedCombatCompetences.some(c => c.nom === comp.nom);
    const max = this.getMaxCombatCompetences();
    return !isSelected && this.selectedCombatCompetences.length >= max;
  }

  getMaxCombatCompetences(): number {
    const profession = this.professionControl?.value;
    const name = profession?.nom;
    if (name === "Homme d'arme") return 5;
    if (name === 'Noble') return 1;
    return 0;
  }

}