import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Signal, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl, Validators } from '@angular/forms';
import { Profession } from '../../../models/profession';
import { ProfessionsService } from '../../../professions/professions.service';
import { ToolsService } from '../../../tools/tools.service';
import { RacesService } from '../../../races/races.service';
import { Race } from '../../../models/race';
import { RequiredAsteriskDirective } from '../../../directives/required-asterisk.directive';
import { FormControlErrorComponent } from '../../../form-validation/form-control-error.component';

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
export class Part1IdentityComponent implements OnInit {
  // --- PROPRIÉTÉS ---
  @Input() form!: FormGroup;
  races: Race[] = [];
  professions: Profession[] = [];
  filteredProfessions: any[] = [];
  selectedInventaire!: FormArray;
  professionSignal = signal<number | null>(null);
  inventaireWikiList: any[] = [];
  selectedProfessionNbObjet: number | null = null;

  get filteredInventaireWikiList() {
    return this.inventaireWikiList.filter(obj => obj.special === false);
  }

  get filteredSpecialInventaireWikiList() {
    return this.inventaireWikiList.filter(obj => obj.special === true);
  }

  // --- CONSTRUCTEUR ---
  constructor(
    private fb: FormBuilder,
    private professionsService: ProfessionsService,
    private toolsService: ToolsService,
    private racesService: RacesService
  ) {
    this.selectedInventaire = this.fb.array([]);
  }

  // --- INIT ---
  ngOnInit() {
    this.initializeForm();

    // Charger les races depuis le service
    this.racesService.getRacesList().subscribe((races: Race[]) => {
      this.races = races;
    });

    // Charger les professions depuis le service
    this.professionsService.getProfessionsList().subscribe((professions: Profession[]) => {
      this.professions = professions;
      this.filteredProfessions = professions; // Initialiser les professions filtrées
    });

    // Écouteur pour les changements de profession
    this.form.get('profession')?.valueChanges.subscribe((professionId) => {
      this.professionSignal.set(professionId);
      this.resetSelections();
      if (professionId) {
        this.professionsService.getProfessionCompetences(professionId).subscribe(prof => {
          this.inventaireWikiList = prof.inventaireWikiList || [];
          this.selectedProfessionNbObjet = prof.nbObjet ?? null;
        });
      } else {
        this.inventaireWikiList = [];
        this.selectedProfessionNbObjet = null;
      }
    });

    // Appel des changements dans le formulaire
    this.form.get('selectedInventaire')?.valueChanges.subscribe(() => {
      this.convertInventaireToObject(this.selectedInventaire.controls);
    });

    // Réagir au changement de race
    this.form.get('race')?.valueChanges.subscribe((raceId: number) => {
      this.professionsService.filterProfessions(raceId).subscribe(filtered => {
        this.filteredProfessions = filtered;

        // Réinitialiser la profession si elle n'est plus valide
        const currentProfessionId = this.form.get('profession')?.value;
        if (!this.filteredProfessions.some(prof => prof.idProfession === +currentProfessionId)) {
          this.form.get('profession')?.setValue('', { emitEvent: false });
        }
      });
    });

    // Synchroniser le contrôle 'inventaires' à chaque changement de selectedInventaire
    this.selectedInventaire.valueChanges.subscribe(values => {
      // Ne garder que le champ nom, le reste vide
      const inventaires = values.map((item: any) => ({ nom: item.nom }));
      this.form.get('inventaires')?.setValue(inventaires, { emitEvent: false });
    });
  }

  //Initialisation du formulaire
   private initializeForm() {
    this.form.addControl('nomPersonnage', this.fb.control('', [Validators.maxLength(50), Validators.required]));
    this.form.addControl('nomJoueur', this.fb.control('', [Validators.maxLength(50)]));
    this.form.addControl('genre', this.fb.control('', [Validators.required, Validators.maxLength(1)]));
    this.form.addControl('terreNatale', this.fb.control('', [Validators.maxLength(100)]));
    this.form.addControl('xp', this.fb.control(0)); // Valeur par défaut à 0
    this.form.addControl('age', this.fb.control('', [Validators.min(0)]));
    this.form.addControl('bestiaire', this.fb.control(false));
    this.form.addControl('historique', this.fb.control(''));
    this.form.addControl('profession', this.fb.control('', [Validators.required]));
    this.form.addControl('race', this.fb.control('', [Validators.required]));
    this.form.addControl('inventaires', this.fb.control([], [Validators.required]));
    this.form.addControl('selectedInventaire', this.selectedInventaire);
  }

  // --- INVENTAIRE : CHECKBOX, CHIPS, RESET ---
  //Comportement des checkbox
  onCheckboxChange(e: any) {
  const value = e.target.value;
  const checked = e.target.checked;

  if (checked) {
    // Ajoute un objet { nom: string }
    this.selectedInventaire.push(this.fb.group({ nom: value }));
  } else {
    // Supprime l'objet correspondant
    const index = this.selectedInventaire.controls.findIndex(ctrl => ctrl.value.nom === value);
    if (index !== -1) {
      this.selectedInventaire.removeAt(index);
    }
  }
}

  removeChip(item: string) {
    const index = this.selectedInventaire.controls.findIndex(ctrl => ctrl.value.nom === item);
    if (index !== -1) {
      this.selectedInventaire.removeAt(index);
    }
    // Décoche la checkbox correspondante si elle existe dans le DOM
    const checkbox = document.querySelector('input[type="checkbox"][value="' + item.replace(/"/g, '\"') + '"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  // Fonction pour réinitialiser les sélections
  resetSelections() {
    // Réinitialiser les chips
    this.selectedInventaire.clear();

    // Réinitialiser les checkboxes : décocher et réactiver les checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
      checkbox.disabled = false;  // Réactiver les checkboxes pour la nouvelle profession
    });

    // Vous pouvez appeler une méthode générique si vous avez besoin de nettoyer d'autres collections similaires
    this.toolsService.clearInvalidItems(this.selectedInventaire, [], () => this.convertInventaireToObject(this.selectedInventaire.controls));
  }

  // --- INVENTAIRE : CONVERSION ---
  // Convertit les données d'inventaire sélectionnées en objets Inventaire
  private convertInventaireToObject(selectedInventaire: any[]): any[] {
    return selectedInventaire.map(control => ({
      nom: control.value,
      type: '',
      effet: '',
      quantite: undefined,
    }));
  }

  // --- UTILITAIRES ---
  // Vérifie si on doit désactiver les checkboxes
  isCheckboxDisabled(item: any): boolean {
    const maxItems = this.getMaxInventaireItems();
    // Désactive seulement si la limite est atteinte ET que l'item n'est pas déjà sélectionné
    const isSelected = this.selectedInventaire.controls.some(ctrl => ctrl.value.nom === item.nom);
    return this.selectedInventaire.length >= maxItems && !isSelected;
  }

  // Détermine la limite max d'objets en fonction de la profession
  getMaxInventaireItems(): number {
    return this.selectedProfessionNbObjet !== null ? this.selectedProfessionNbObjet : 5;
  }

}
