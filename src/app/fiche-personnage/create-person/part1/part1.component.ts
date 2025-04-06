import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Input, OnInit, Signal, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { RACE_LIST, RACE_MAP } from '../../../fake-data-set/race-fake';
import { PROFESSION_LIST, PROFESSION_MAP } from '../../../fake-data-set/profession-fake';
import { ARTISAN_INVENTAIRE, BARDE_INVENTAIRE, CRIMINEL_INVENTAIRE, DOCTEUR_INVENTAIRE, HOMME_D_ARME_INVENTAIRE, MAGE_INVENTAIRE, MARCHAND_INVENTAIRE, NOBLE_INVENTAIRE, PRETRE_INVENTAIRE, SORCELEUR_INVENTAIRE } from '../../../fake-data-set/inventaire-fake';
import { Inventaire } from '../../../models/inventaire';
import { Profession } from '../../../models/profession';
import { ProfessionsService } from '../../../professions/professions.service';
import { InventaireService } from '../../../inventaires/inventaire.service';

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
  //professions = PROFESSION_LIST;
  professions : Profession[] = [];
  filteredProfessions: any[] = [];
  selectedInventaire!: FormArray;
  professionSignal = signal<number | null>(null);
  inventaireSignal: Signal<any[]>;

  constructor(private fb: FormBuilder, private professionsService: ProfessionsService, private inventaireService: InventaireService) {
    this.selectedInventaire = this.fb.array([]);
    this.inventaireSignal = computed(() => this.inventaireService.updateInventaire(this.professionSignal()));
  }

  ngOnInit() {

    this.initializeForm();

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
    const maxItems = this.inventaireService.getMaxInventaireItems(this.form.get('profession')?.value);
    if (e.target.checked) {
      if (this.selectedInventaire.length < maxItems) {
        this.selectedInventaire.push(new FormControl(e.target.value));
      } else {
        e.target.checked = false; // Empêche de cocher plus d'éléments que la limite
      }
    } else {
      const index = this.selectedInventaire.controls.findIndex(x => x.value === e.target.value);
      if (index !== -1) {
        this.selectedInventaire.removeAt(index);
      }
    }
    this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls);
  }
    
  // Vérifie si on doit désactiver les checkboxes
  isCheckboxDisabled(item: any): boolean {
    const maxItems = this.inventaireService.getMaxInventaireItems(this.form.get('profession')?.value);
    return this.selectedInventaire.length >= maxItems && !this.selectedInventaire.controls.some(control => control.value === item.nom);
  }

  removeChip(item: string) {
    // Supprimer l'élément de l'inventaire sélectionné
    const index = this.selectedInventaire.controls.findIndex(x => x.value === item);
    if (index >= 0) {
      this.selectedInventaire.removeAt(index);
    }
  
    // Désactiver visuellement la checkbox correspondante
    this.updateCheckboxState();
  
    // Mettre à jour les objets d'inventaire après suppression
    this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls);
  }
  
  updateCheckboxState() {
    const maxItems = this.inventaireService.getMaxInventaireItems(this.form.get('profession')?.value);
    const selectedCount = this.selectedInventaire.length;
  
    // On réactive toutes les checkboxes si la limite n'est plus atteinte
    if (selectedCount < maxItems) {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: any) => {
        if (!checkbox.checked) {
          checkbox.disabled = false;
        }
      });
    }
  
    // Assurer que les checkboxes sont décochées si nécessaire
    const selectedItems = this.selectedInventaire.controls.map(control => control.value);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox: any) => {
      const checkboxValue = checkbox.value;
      // Si l'élément est supprimé, décocher la checkbox
      if (selectedItems.indexOf(checkboxValue) === -1) {
        checkbox.checked = false;
      }
    });
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
    
    // Mettre à jour l'inventaire en fonction de la nouvelle profession
    this.inventaireService.convertInventaireToObject(this.selectedInventaire.controls);
  }
}
