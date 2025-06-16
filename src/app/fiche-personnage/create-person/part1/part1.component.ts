import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Signal, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Profession } from '../../../models/profession';
import { ProfessionsService } from '../../../professions/professions.service';
import { InventaireService } from '../../../inventaires/inventaire.service';
import { ToolsService } from '../../../tools/tools.service';
import { RacesService } from '../../../races/races.service';
import { Race } from '../../../models/race';

@Component({
  selector: 'app-part1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part1.component.html',
  styles: []
})
export class Part1Component implements OnInit {
  @Input() form!: FormGroup;
  races: Race[] = [];
  professions : Profession[] = [];
  filteredProfessions: any[] = [];
  selectedInventaire!: FormArray;
  professionSignal = signal<number | null>(null);
  inventaireSignal: Signal<any[]>;

  constructor(private fb: FormBuilder, private professionsService: ProfessionsService, private inventaireService: InventaireService, private toolsService: ToolsService, private racesService: RacesService) {
    this.selectedInventaire = this.fb.array([]);
    this.inventaireSignal = computed(() => this.inventaireService.updateInventaire(this.professionSignal()));
  }

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
      this.resetSelections(); // Réinitialiser les sélections lors du changement de profession
    });

    // Appel des changements dans le formulaire
    this.form.get('selectedInventaire')?.valueChanges.subscribe(() => {
      this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls);
    });

    // Réagir au changement de race
    this.form.get('race')?.valueChanges.subscribe((raceId: number) => {
      this.professionsService.filterProfessions(raceId).subscribe(filtered => {
        this.filteredProfessions = filtered;

        // Réinitialiser la profession si elle n'est plus valide
        const currentProfessionId = this.form.get('profession')?.value;
        if (!this.filteredProfessions.some(prof => prof.id === +currentProfessionId)) {
          this.form.get('profession')?.setValue('', { emitEvent: false });
        }
      });
    });

    // Synchroniser le contrôle 'inventaires' à chaque changement de selectedInventaire
    this.selectedInventaire.valueChanges.subscribe(values => {
      this.form.get('inventaires')?.setValue(values, { emitEvent: false });
    });
  }

  //Initialisation du formulaire
   private initializeForm() {
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

    this.form.addControl('selectedInventaire', this.selectedInventaire); // pour qu'il soit bien initialisé

   }

  //Comportement des checkbox
  onCheckboxChange(e: any) {
    this.toolsService.handleCheckboxChange(e, this.selectedInventaire, () => this.inventaireService.getMaxInventaireItems(this.form.get('profession')?.value), () => this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls));
  }

  // Vérifie si on doit désactiver les checkboxes
  isCheckboxDisabled(item: any): boolean {
    const maxItems = this.inventaireService.getMaxInventaireItems(this.form.get('profession')?.value);
    return this.toolsService.isItemDisabled(this.selectedInventaire.controls, maxItems, item.nom);
    //return this.selectedInventaire.length >= maxItems && !this.selectedInventaire.controls.some(control => control.value === item.nom);
  }

  removeChip(item: string) {
    // Utilisation de la méthode générique pour supprimer l'élément
    this.toolsService.removeItemFromFormArray(this.selectedInventaire, item, () => this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls));
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
    this.toolsService.clearInvalidItems(this.selectedInventaire, [], () => this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls));
  }
}
