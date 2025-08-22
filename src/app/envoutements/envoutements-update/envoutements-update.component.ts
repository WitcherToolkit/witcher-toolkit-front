import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Envoutement } from '../../models/envoutement';
import { EnvoutementService } from '../envoutement.service';
import { DANGER_RITUEL } from '../../shared-constants/danger-rituel.constans';

@Component({
  selector: 'app-envoutements-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './envoutements-update.component.html'
})
export class EnvoutementsUpdateComponent implements AfterViewInit, OnChanges {
  // --- Entrées, sorties et références ---
  @Input() envoutement: Envoutement | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() envoutementUpdated = new EventEmitter<Envoutement>();

  // --- Propriétés du formulaire et constantes ---
  envoutementForm!: FormGroup;
  dangers = DANGER_RITUEL;

  constructor(private fb: FormBuilder, private envoutementService: EnvoutementService) {}

  // --- Cycle de vie : mise à jour du formulaire si envoutement change ---
  ngOnChanges(changes: SimpleChanges) {
    if (changes['envoutement']) {
      this.envoutementForm = this.createEnvoutementForm(this.envoutement);
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

  // --- Création du FormGroup pour l'envoutement ---
  private createEnvoutementForm(envoutement: Envoutement | null): FormGroup {
    return this.fb.group({
      nom: [envoutement?.nom ?? '', [Validators.required, Validators.maxLength(60)]],
      cout: [envoutement?.cout ?? '', [Validators.required, Validators.maxLength(10)]],
      effet: [envoutement?.effet ?? '', [Validators.required]],
      prerequis: [envoutement?.prerequis ?? '', [Validators.required]],
      danger: [envoutement?.danger ?? '', [Validators.required, Validators.maxLength(6)]]
    });
  }

  // --- Soumission du formulaire (création ou édition) ---
  onSubmit() {
    if (!this.envoutementForm.valid) {
      this.envoutementForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const closeModal = () => {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    };
    if (this.envoutement) {
      // Edition
      const envoutementToUpdate = {
        ...this.envoutement,
        ...this.envoutementForm.value,
        idEnvoutement: this.envoutement?.idEnvoutement,
      };
      this.envoutementService.updateEnvoutement(envoutementToUpdate).subscribe({
        next: (result) => {
          console.info('Envoutement mise à jour avec succès', result);
          this.envoutementUpdated.emit(result);
          this.resetForm();
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l\'envoutement', err);
        }
      });
    } else {
      // Création
      const envoutementToCreate = { ...this.envoutementForm.value };
      this.envoutementService.createEnvoutement(envoutementToCreate).subscribe({
        next: (result) => {
          console.info('Envoutement créé avec succès', result);
          this.envoutementUpdated.emit(result);
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création de l\'envoutement', err);
        }
      });
    }
  }

  // --- Réinitialise le formulaire aux valeurs de l'objet 'envoutement' (édition) ---
  resetForm() {
    if (this.envoutementForm && this.envoutement) {
      this.envoutementForm.reset({
        nom: this.envoutement.nom,
        cout: this.envoutement.cout,
        effet: this.envoutement.effet,
        prerequis: this.envoutement.prerequis,
        danger: this.envoutement.danger
      });
      this.envoutementForm.markAsPristine();
      this.envoutementForm.markAsUntouched();
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
