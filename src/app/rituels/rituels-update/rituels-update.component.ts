import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Rituel } from '../../models/rituel';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { RituelsService } from '../rituels.service';
import { NIVEAUX_RITUEL } from '../../shared/shared-constants/niveau-rituel.constants';


@Component({
  selector: 'app-rituels-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './rituels-update.component.html'
})
export class RituelsUpdateComponent implements AfterViewInit, OnChanges {
  // --- Entrées, sorties et références ---
  @Input() rituel: Rituel | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() rituelUpdated = new EventEmitter<Rituel>();

  // --- Propriétés du formulaire et constantes ---
  rituelForm!: FormGroup;
  niveaux = NIVEAUX_RITUEL;

  constructor(private fb: FormBuilder, private rituelService: RituelsService) {}

  // --- Cycle de vie : mise à jour du formulaire si rituel change ---
  ngOnChanges(changes: SimpleChanges) {
    if (changes['rituel']) {
      this.rituelForm = this.createRituelForm(this.rituel);
    }
  }

  // --- Initialisation de la modale Materialize ---
  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  // --- Ouvre la modale ---
  open() {
    if (this.modalRef) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      instance.open();
    }
  }

  // --- Création du FormGroup pour le rituel ---
  private createRituelForm(rituel: Rituel | null): FormGroup {
    return this.fb.group({
      nom: [rituel?.nom ?? '', [Validators.required, Validators.maxLength(60)]],
      cout: [rituel?.cout ?? '', [Validators.required, Validators.maxLength(10)]],
      effet: [rituel?.effet ?? '', [Validators.required]],
      tempsPreparation: [rituel?.tempsPreparation ?? '', [Validators.required, Validators.maxLength(10)]],
      sd: [rituel?.sd ?? '', [Validators.required, Validators.maxLength(10)]],
      duree: [rituel?.duree ?? '', [Validators.required, Validators.maxLength(15)]],
      composant: [rituel?.composant ?? '', [Validators.required]],
      niveau: [rituel?.niveau ?? '', [Validators.required, Validators.maxLength(20)]],
    });
  }

  // --- Soumission du formulaire (création ou édition) ---
  onSubmit() {
    if (!this.rituelForm.valid) {
      this.rituelForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const closeModal = () => {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    };
    if (this.rituel) {
      // Edition
      const rituelToUpdate = {
        ...this.rituel,
        ...this.rituelForm.value,
        idRituel: this.rituel?.idRituel,
      };
      this.rituelService.updateRituel(rituelToUpdate).subscribe({
        next: (result) => {
          console.info('Rituel mise à jour avec succès', result);
          this.rituelUpdated.emit(result);
          this.resetForm();
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du rituel', err);
        }
      });
    } else {
      // Création
      const rituelToCreate = { ...this.rituelForm.value };
      this.rituelService.createRituel(rituelToCreate).subscribe({
        next: (result) => {
          console.info('Rituel créé avec succès', result);
          this.rituelUpdated.emit(result);
          this.rituelForm.reset();
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création du rituel', err);
        }
      });
    }
  }

  // --- Réinitialise le formulaire aux valeurs de l'objet 'rituel' (édition) ---
  resetForm() {
    if (this.rituelForm && this.rituel) {
      this.rituelForm.reset({
        nom: this.rituel.nom,
        cout: this.rituel.cout,
        effet: this.rituel.effet,
        tempsPreparation: this.rituel.tempsPreparation,
        sd: this.rituel.sd,
        duree: this.rituel.duree,
        composant: this.rituel.composant,
        niveau: this.rituel.niveau,
      });
      this.rituelForm.markAsPristine();
      this.rituelForm.markAsUntouched();
    }
  }

  // --- Annulation : réinitialise le formulaire et ferme la modale ---
  onCancel() {
    this.resetForm();
    if (this.modalRef) {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    }
  }
}
