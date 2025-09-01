import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { MagieService } from '../magie.service';
import { NIVEAUX_MAGIE } from '../../shared/shared-constants/niveau-magie.constants';
import { TYPE_MAGIE } from '../../shared/shared-constants/type-magie.constants';
import { ELEMENT_MAGIE } from '../../shared/shared-constants/element-magie.constants';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap, first } from 'rxjs/operators';

@Component({
  selector: 'app-sorts-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './sorts-update.component.html',
})
export class SortsUpdateComponent implements AfterViewInit, OnChanges {
  // --- Entrées, sorties et références ---
  @Input() magie: Magie | null = null;
  @Input() magies: Magie[] = [];
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() magieUpdated = new EventEmitter<Magie>();

  // --- Propriétés du formulaire et constantes ---
  magieForm!: FormGroup;
  niveaux = NIVEAUX_MAGIE;
  types = TYPE_MAGIE;
  elements = ELEMENT_MAGIE;

  constructor(private fb: FormBuilder, private magieService: MagieService) {}

  // --- Cycle de vie : mise à jour du formulaire si magie change ---
  ngOnChanges(changes: SimpleChanges) {
    if (changes['magie']) {
      this.magieForm = this.createMagieForm(this.magie);
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

  // --- Création du FormGroup pour la magie ---
  private createMagieForm(magie: Magie | null): FormGroup {
    return this.fb.group({
      nom: [
        magie?.nom ?? '',
        [Validators.required, Validators.maxLength(60)],
        [this.nomUniqueValidator(magie?.idMagie)]
      ],
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

  // --- Validation asynchrone pour vérifier l'unicité du nom dans la liste locale ---
  private nomUniqueValidator(currentId?: number | string | null): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const nom = control.value?.trim().toLowerCase();
      if (!nom || nom.length < 1) {
        return of(null);
      }
      return of(nom).pipe(
        debounceTime(200),
        map(nomValue => {
          const found = this.magies.find(m => m.nom.trim().toLowerCase() === nomValue);
          if (found && found.idMagie !== currentId) {
            return { nomExists: true };
          }
          return null;
        }),
        first()
      );
    };
  }

  // --- Soumission du formulaire (création ou édition) ---
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
        ...this.magieForm.value,
        idMagie: this.magie?.idMagie,
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

  // --- Soumission et création en boucle (reste ouvert) ---
  onSubmitAndContinue() {
    if (!this.magieForm.valid) {
      this.magieForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const magieToCreate = { ...this.magieForm.value };
    this.magieService.createMagie(magieToCreate).subscribe({
      next: (result) => {
        console.info('Magie créée avec succès', result);
        this.magieUpdated.emit(result);
        this.magieForm.reset();
        this.magieForm.markAsPristine();
        this.magieForm.markAsUntouched();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la magie', err);
      }
    });
  }

  // --- Réinitialise le formulaire aux valeurs de l'objet 'magie' (édition) ---
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
      this.magieForm.markAsPristine();
      this.magieForm.markAsUntouched();
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
