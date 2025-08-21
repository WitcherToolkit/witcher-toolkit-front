import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { MagieService } from '../magie.service';
import { NIVEAUX_MAGIE } from '../../shared-constants/niveau-magie.constants';
import { TYPE_MAGIE } from '../../shared-constants/type-magie.constants';
import { ELEMENT_MAGIE } from '../../shared-constants/element-magie.constants';

@Component({
  selector: 'app-sorts-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],// Utilisation de ReactiveFormsModule pour les formulaires
  templateUrl: './sorts-update.component.html',
})
export class SortsUpdateComponent implements AfterViewInit, OnChanges {
  @Input() magie: Magie | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() magieUpdated = new EventEmitter<Magie>();

  magieForm!: FormGroup;
  niveaux = NIVEAUX_MAGIE;
  types = TYPE_MAGIE;
  elements = ELEMENT_MAGIE;

  constructor(private fb: FormBuilder, private magieService: MagieService){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['magie']) {
      this.magieForm = this.createMagieForm(this.magie);
    }
  }

  /**
   * Crée un FormGroup pour la magie, prérempli si un objet est fourni, vide sinon.
   */
  private createMagieForm(magie: Magie | null): FormGroup {
    return this.fb.group({
      nom: [magie?.nom ?? '', [Validators.required, Validators.maxLength(60)]],
      cout: [magie?.cout ?? '', [Validators.required, Validators.maxLength(10)]],
      duree: [magie?.duree ?? '', [Validators.required, Validators.maxLength(35)]],
      portee: [magie?.portee ?? '', [Validators.maxLength(20)]],
      nature: [magie?.nature ?? '', [Validators.required, Validators.maxLength(5)]],
      type: [magie?.type ?? '', [Validators.required, Validators.maxLength(10)]],
      contre: [magie?.contre ?? '', [Validators.maxLength(25)]],
      niveau: [magie?.niveau ?? '', [Validators.required, Validators.maxLength(35)]],
      effet: [magie?.effet ?? '', [Validators.required]]
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

  onSubmit() {
    if (!this.magieForm.valid) {
      this.magieForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }

    const closeModal = () => {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    };

    if (this.magie) {
      // Edition
      const magieToUpdate = { 
        ...this.magie, 
        ...this.magieForm.value ,
        idMagie: this.magie?.idMagie, // empêche la modification de l'ID
      };
      this.magieService.updateMagie(magieToUpdate).subscribe({
        next: (result) => {
          console.info('Magie mise à jour avec succès', result);
          this.magieUpdated.emit(result);
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la magie', err);
        }
      });
    } else {
      // Création
      const magieToCreate = { ...this.magieForm.value };
      this.magieService.createMagie(magieToCreate).subscribe({
        next: (result) => {
          console.info('Magie créée avec succès', result);
          this.magieUpdated.emit(result);
          this.magieForm.reset();
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création de la magie', err);
        }
      });
    }
  }

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'magie'
  resetForm() {
    if (this.magieForm && this.magie) {
      this.magieForm.reset({
        nom: this.magie.nom,
        cout: this.magie.cout,
        duree: this.magie.duree,
        portee: this.magie.portee,
        nature: this.magie.nature,
        type: this.magie.type,
        contre: this.magie.contre,
        niveau: this.magie.niveau,
        effet: this.magie.effet
      });
      // Marquer le formulaire comme non modifié et non touché
      // Cela permet de réinitialiser l'état du formulaire
      this.magieForm.markAsPristine();
      // Marquer tous les champs comme non touchés
      this.magieForm.markAsUntouched();
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
