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
export class CaracteristiquesUpdateComponent implements AfterViewInit, OnChanges{

  @Input() caracteristique: Caracteristique | null = null
  @ViewChild('modal') modalRef! : ElementRef;
  @Output() caracteristiqueUpdated = new EventEmitter<Caracteristique>();

  caracteristiqueForm! : FormGroup;

  constructor(private fb: FormBuilder, private caracteristiqueService: CaracteristiqueService) {}

  ngOnChanges(changes: SimpleChanges) {// SimpleChanges permet de détecter les changements dans les propriétés d'entrée
      if (changes['caracteristique']) {
        this.caracteristiqueForm = this.createCaracteristiqueForm(this.caracteristique);
      }
    }
  
      /**
       * Crée un FormGroup pour le rituel, prérempli si un objet est fourni, vide sinon.
       */
      private createCaracteristiqueForm(caracteristique: Caracteristique | null): FormGroup {
        return this.fb.group({
          nom: [caracteristique?.nom ?? '', [Validators.required, Validators.maxLength(16)]],
          code: [caracteristique?.code ?? '', [Validators.required, Validators.maxLength(6)]],
          description: [caracteristique?.description ?? '', [Validators.required]],
        });
      }

  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  open() {
    if (this.modalRef) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      instance.open();
    }
  }

  onUpperCase(event: Event) {
  const input = event.target as HTMLInputElement;
  const upperValue = input.value.toUpperCase();
  this.caracteristiqueForm.get('code')?.setValue(upperValue, { emitEvent: false });
}

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

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'caracteristique'
  resetForm() {
    if (this.caracteristiqueForm && this.caracteristique) {
      this.caracteristiqueForm.reset({
        nom: this.caracteristique.nom,
        code: this.caracteristique.code,
        description: this.caracteristique.description,
      });
      // Marquer le formulaire comme non modifié et non touché
      // Cela permet de réinitialiser l'état du formulaire
      this.caracteristiqueForm.markAsPristine();
      // Marquer tous les champs comme non touchés
      this.caracteristiqueForm.markAsUntouched();
    }
  }

  // Méthode pour gérer l'annulation : réinitialise le formulaire et ferme la modale
  onCancel() {
    this.resetForm(); // Réinitialise le formulaire aux valeurs d'origine
    if (this.modalRef) {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    }
  }

}
