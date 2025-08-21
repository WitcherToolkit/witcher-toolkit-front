import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Caracteristique } from '../../models/caracteristique';
import { CaracteristiqueService } from '../caracteristique.service';

@Component({
  selector: 'app-caracteristiques-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './caracteristiques-update.component.html'
})
export class CaracteristiquesUpdateComponent implements AfterViewInit, OnChanges {
  // --- Entrées, sorties et références ---
  @Input() caracteristique: Caracteristique | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() caracteristiqueUpdated = new EventEmitter<Caracteristique>();

  // --- Propriétés du formulaire ---
  caracteristiqueForm!: FormGroup;

  constructor(private fb: FormBuilder, private caracteristiqueService: CaracteristiqueService) {}

  // --- Cycle de vie : mise à jour du formulaire si caracteristique change ---
  ngOnChanges(changes: SimpleChanges) {
    if (changes['caracteristique']) {
      this.caracteristiqueForm = this.createCaracteristiqueForm(this.caracteristique);
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

  // --- Création du FormGroup pour la caractéristique ---
  private createCaracteristiqueForm(caracteristique: Caracteristique | null): FormGroup {
    return this.fb.group({
      nom: [caracteristique?.nom ?? '', [Validators.required, Validators.maxLength(16)]],
      code: [caracteristique?.code ?? '', [Validators.required, Validators.maxLength(6)]],
      description: [caracteristique?.description ?? '', [Validators.required]],
    });
  }

  // --- Met à jour le champ code en majuscules lors de la saisie ---
  onUpperCase(event: Event) {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.caracteristiqueForm.get('code')?.setValue(upperValue, { emitEvent: false });
  }

  // --- Soumission du formulaire (création ou édition) ---
  onSubmit() {
    if (!this.caracteristiqueForm.valid) {
      this.caracteristiqueForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const closeModal = () => {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    };
    if (this.caracteristique) {
      // Edition
      const caracteristiqueToUpdate = {
        ...this.caracteristique,
        ...this.caracteristiqueForm.value,
        idCaracteristique: this.caracteristique?.idCaracteristique,
      };
      this.caracteristiqueService.updateCaracteristique(caracteristiqueToUpdate).subscribe({
        next: (result) => {
          console.info('caracteristique mise à jour avec succès', result);
          this.caracteristiqueUpdated.emit(result);
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la caracteristique', err);
        }
      });
    } else {
      // Création
      const caracteristiqueToCreate = { ...this.caracteristiqueForm.value };
      this.caracteristiqueService.createCaracteristique(caracteristiqueToCreate).subscribe({
        next: (result) => {
          console.info('caracteristique créé avec succès', result);
          this.caracteristiqueUpdated.emit(result);
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création de la caracteristique', err);
        }
      });
    }
  }

  // --- Réinitialise le formulaire aux valeurs de l'objet 'caracteristique' (édition) ---
  resetForm() {
    if (this.caracteristiqueForm && this.caracteristique) {
      this.caracteristiqueForm.reset({
        nom: this.caracteristique.nom,
        code: this.caracteristique.code,
        description: this.caracteristique.description,
      });
      this.caracteristiqueForm.markAsPristine();
      this.caracteristiqueForm.markAsUntouched();
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
