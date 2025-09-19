import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { Profession } from '../../../models/profession';
import { ProfessionsService } from '../../../professions/professions.service';
import { ToolsService } from '../../../tools/tools.service';
import { RacesService } from '../../../races/races.service';
import { Race } from '../../../models/race';
import { RequiredAsteriskDirective } from '../../../directives/required-asterisk.directive';
import { FormControlErrorComponent } from '../../../form-validation/form-control-error.component';
import { Subscription } from 'rxjs';
import { Competence } from '../../../models/competence';
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

  // Liste des langues disponibles
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
    this.competenceService.getCompetencesList().subscribe((competences: Competence[]) => {
      this.competences = competences;
      this.languesList = this.competences.filter(c => c.type === 'Langue');
      this.combatCompetences = this.competences.filter(c => c.type === 'Combat');
    });

    // Synchronise le FormArray selectedInventaire avec la valeur brute du FormGroup
    const selectedInventaireRaw = this.form.get('selectedInventaire')?.value;
    if (Array.isArray(selectedInventaireRaw)) {
      this.selectedInventaire.clear();
      selectedInventaireRaw.forEach(item => {
        if (item && item.nom) {
          this.selectedInventaire.push(this.fb.group({ nom: item.nom }));
        }
      });
    }

    // Chargement des listes de base
    this.subscriptions.push(
      this.racesService.getRacesList().subscribe((races: Race[]) => this.races = races)
    );
    this.subscriptions.push(
      this.professionsService.getProfessionsList().subscribe((professions: Profession[]) => {
        this.professions = professions;
        this.filteredProfessions = professions;
        // Émet la liste des professions au parent
        this.professionsChange.emit(professions);
        // Synchronisation de la profession et de l'inventaire si déjà présents dans le form
        const professionId = this.professionControl?.value;
        if (professionId) {
          this.professionSignal.set(professionId);
          this.professionsService.getProfessionCompetences(professionId).subscribe(prof => {
            this.inventaireWikiList = prof.inventaireWikiList || [];
            this.selectedProfessionNbObjet = prof.nbObjet ?? null;
            // Synchronise l'inventaire sélectionné si déjà présent
            const inventaires = this.convertInventaireToObject(this.selectedInventaire.controls);
            this.inventairesControl?.setValue(inventaires, { emitEvent: false });
          });
        }
      })
    );
    // Gestion des changements de profession
    this.subscriptions.push(
      this.professionControl?.valueChanges.subscribe((professionId) => {
        this.professionSignal.set(professionId);
        // Reset langues et combat à chaque changement de profession
        this.resetSelections();
        if (professionId) {
          this.subscriptions.push(
            this.professionsService.getProfessionCompetences(professionId).subscribe(prof => {
              this.inventaireWikiList = prof.inventaireWikiList || [];
              this.selectedProfessionNbObjet = prof.nbObjet ?? null;
              // Met à jour le contrôle inventaires pour inclure les objets spéciaux
              const inventaires = this.convertInventaireToObject(this.selectedInventaire.controls);
              this.inventairesControl?.setValue(inventaires, { emitEvent: false });
            })
          );
        } else {
          this.resetInventaireState();
          // Met à jour le contrôle inventaires pour inclure les objets spéciaux (s'il y en a)
          const inventaires = this.convertInventaireToObject(this.selectedInventaire.controls);
          this.inventairesControl?.setValue(inventaires, { emitEvent: false });
        }
      }) || new Subscription()
    );
    // Gestion des changements d'inventaire sélectionné
    this.subscriptions.push(
      this.selectedInventaireControl?.valueChanges.subscribe(() => {
        this.convertInventaireToObject(this.selectedInventaire.controls);
      }) || new Subscription()
    );
    // Gestion des changements de race
    this.subscriptions.push(
      this.raceControl?.valueChanges.subscribe((raceId: number) => {
        this.professionsService.filterProfessions(raceId).subscribe(filtered => {
          this.filteredProfessions = filtered;
          const currentProfessionId = this.professionControl?.value;
          if (!this.filteredProfessions.some(prof => prof.idProfession === +currentProfessionId)) {
            this.professionControl?.setValue('', { emitEvent: false });
          }
        });
      }) || new Subscription()
    );
    // Synchronisation du contrôle 'inventaires'
    this.subscriptions.push(
      this.selectedInventaire.valueChanges.subscribe(values => {
        const inventaires = this.convertInventaireToObject(this.selectedInventaire.controls);
        this.inventairesControl?.setValue(inventaires, { emitEvent: false });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // --- FORM CONTROLS GETTERS ---
  get professionControl() { return this.form.get('profession'); }
  get raceControl() { return this.form.get('race'); }
  get selectedInventaireControl() { return this.form.get('selectedInventaire'); }
  get inventairesControl() { return this.form.get('inventaires'); }
  get genreControl() { return this.form.get('genre'); }

  // --- INVENTAIRE : FILTRES ---
  /** Retourne la liste filtrée selon la propriété special */
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
  /** Initialise les contrôles du formulaire */
  //TODO Penser à ajouter l'image et l'url de l'image
  private initializeForm() {
    this.form.addControl('nomPersonnage', this.fb.control('', [Validators.maxLength(50), Validators.required]));
    this.form.addControl('nomJoueur', this.fb.control('', [Validators.maxLength(50)]));
    this.form.addControl('genre', this.fb.control('', [Validators.required, Validators.maxLength(1)]));
    this.form.addControl('terreNatale', this.fb.control('', [Validators.maxLength(100)]));
    this.form.addControl('xp', this.fb.control(0));
    this.form.addControl('age', this.fb.control(0, [Validators.min(0)]));
    this.form.addControl('bestiaire', this.fb.control(false));
    this.form.addControl('historique', this.fb.control(''));
    this.form.addControl('profession', this.fb.control('', [Validators.required]));
    this.form.addControl('race', this.fb.control('', [Validators.required]));
    this.form.addControl('inventaires', this.fb.control([], [Validators.required]));
    this.form.addControl('selectedInventaire', this.selectedInventaire);
    this.form.addControl('languesSelectionnees', this.fb.control([]));
    this.form.addControl('combatSelectionnees', this.fb.control([]));
  }

  // --- INVENTAIRE : CHECKBOX, CHIPS, RESET ---
  /** Ajoute un objet à l'inventaire sélectionné */
  private addInventaireItem(value: string) {
    this.selectedInventaire.push(this.fb.group({ nom: value }));
  }
  /** Retire un objet de l'inventaire sélectionné */
  private removeInventaireItem(value: string) {
    const index = this.selectedInventaire.controls.findIndex(ctrl => ctrl.value.nom === value);
    if (index !== -1) {
      this.selectedInventaire.removeAt(index);
    }
  }
  /** Gestion du changement d'état d'une checkbox d'inventaire */
  onCheckboxChange(e: any) {
    const value = e.target.value;
    const checked = e.target.checked;
    if (checked) {
      this.addInventaireItem(value);
    } else {
      this.removeInventaireItem(value);
    }
  }
  /** Réinitialise les sélections d'inventaire et les checkboxes */
  resetSelections() {
    this.selectedInventaire.clear();
    this.selectedLangues = [];
    this.selectedCombatCompetences = [];
    // Reset les contrôles du formulaire principal pour langues et combat
    this.form.get('languesSelectionnees')?.setValue([]);
    this.form.get('combatSelectionnees')?.setValue([]);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
      checkbox.disabled = false;
    });
    this.toolsService.clearInvalidItems(this.selectedInventaire, [], () => this.convertInventaireToObject(this.selectedInventaire.controls));
  }
  /** Réinitialise l'état de l'inventaire et des objets spéciaux */
  private resetInventaireState() {
    this.inventaireWikiList = [];
    this.selectedProfessionNbObjet = null;
  }

  // --- INVENTAIRE : CONVERSION ---
  /** Convertit les données d'inventaire sélectionnées en objets Inventaire (hors 'special' et 'idInventaireWiki', sans champs vides, inclut aussi les objets spéciaux) */
  private convertInventaireToObject(selectedInventaire: any[]): any[] {
    // Objets sélectionnés par l'utilisateur
    const userItems = selectedInventaire.map(control => {
      const wiki = this.inventaireWikiList.find((w: any) => w.nom === control.value.nom);
      if (!wiki) return { nom: control.value.nom };
      const inventaire: any = { nom: wiki.nom };
      if (wiki.type) inventaire.type = wiki.type;
      if (wiki.effet) inventaire.effet = wiki.effet;
      if (wiki.quantite !== undefined && wiki.quantite !== null && wiki.quantite !== '') inventaire.quantite = wiki.quantite;
      return inventaire;
    });
    // Ajout des objets spéciaux non déjà présents
    const specialItems = this.inventaireWikiList
      .filter((w: any) => w.special === true && !userItems.some((i: any) => i.nom === w.nom))
      .map((wiki: any) => {
        const inventaire: any = { nom: wiki.nom };
        if (wiki.type) inventaire.type = wiki.type;
        if (wiki.effet) inventaire.effet = wiki.effet;
        if (wiki.quantite !== undefined && wiki.quantite !== null && wiki.quantite !== '') inventaire.quantite = wiki.quantite;
        return inventaire;
      });
    return [...userItems, ...specialItems];
  }

  // --- UTILITAIRES ---
  /** Vérifie si on doit désactiver les checkboxes d'inventaire */
  isCheckboxDisabled(item: any): boolean {
    const maxItems = this.getMaxInventaireItems();
    const isSelected = this.selectedInventaire.controls.some(ctrl => ctrl.value.nom === item.nom);
    return this.selectedInventaire.length >= maxItems && !isSelected;
  }
  /** Retourne la limite max d'objets sélectionnables selon la profession */
  getMaxInventaireItems(): number {
    return this.selectedProfessionNbObjet !== null ? this.selectedProfessionNbObjet : 5;
  }

  /** Incrémente/décrémente un champ numérique du formulaire principal */
  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.form.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }

  /** Vérifie si un objet est déjà sélectionné dans l'inventaire (pour cocher la case) */
  isItemChecked(item: any): boolean {
    const result = this.selectedInventaire.controls.some(ctrl => ctrl.value.nom === item.nom);
    return result;
  }

  getProfessionName(professionId: number): string {
    const profession = this.professions.find(p => p.idProfession === +professionId);
    return profession ? profession.nom : '';
  }

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
    // Synchronise avec le formulaire principal
    this.form.get('languesSelectionnees')?.setValue(this.selectedLangues.map(l => l.idCompetence));
  }

  isLangueChecked(langue: Competence): boolean {
    return this.selectedLangues.some(l => l.nom === langue.nom);
  }

  isLangueCheckboxDisabled(langue: Competence): boolean {
    const isSelected = this.selectedLangues.some(l => l.nom === langue.nom);
    const max = this.getMaxLangues();
    // Désactive si non sélectionné et limite atteinte
    return !isSelected && this.selectedLangues.length >= max;
  }

  getMaxLangues(): number {
    const professionId = this.professionControl?.value;
    const name = this.getProfessionName(professionId);
    if (name === 'Barde') return 1;
    if (name === 'Marchand') return 2;
    return 0;
  }

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
    // Synchronise avec le formulaire principal
    this.form.get('combatSelectionnees')?.setValue(this.selectedCombatCompetences.map(c => c.idCompetence));
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
    const professionId = this.professionControl?.value;
    const name = this.getProfessionName(professionId);
    if (name === "Homme d'arme") return 5;
    if (name === 'Noble') return 1;
    return 0;
  }
}
