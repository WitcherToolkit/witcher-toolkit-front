import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Envoutement } from '../../models/envoutement';
import { EnvoutementService } from '../envoutement.service';

@Component({
  selector: 'app-envoutements-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './envoutements-update.component.html',
  styleUrl: './envoutements-update.component.css'
})
export class EnvoutementsUpdateComponent implements AfterViewInit, OnChanges {
  @Input() envoutement: Envoutement | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() envoutementUpdated = new EventEmitter<Envoutement>();

  envoutementForm!: FormGroup;

  constructor(private fb: FormBuilder, private envoutementService: EnvoutementService){}

  ngOnChanges(changes: SimpleChanges) {// SimpleChanges permet de détecter les changements dans les propriétés d'entrée
    if (changes['envoutement'] && this.envoutement) {
      this.envoutementForm = this.fb.group({
        nom: [this.envoutement.nom, [Validators.required, Validators.maxLength(60)]],
        cout: [this.envoutement.cout, [Validators.required, Validators.maxLength(10)]],
        effet: [this.envoutement.effet, [Validators.required]],
        prerequis: [this.envoutement.prerequis, [Validators.required]],
        danger: [this.envoutement.danger, [Validators.required, Validators.maxLength(6)]]
      });
    }
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
    if (this.envoutementForm.valid) {
      const envoutementToUpdate = { 
        ...this.envoutement, 
        ...this.envoutementForm.value,
        idEnvoutement: this.envoutement?.idEnvoutement, // empêche la modification de l'ID
      };
      
      this.envoutementService.updateEnvoutement(envoutementToUpdate).subscribe({
        next: (result) => {
          console.info('Envoutement mise à jour avec succès', result);
          this.envoutementUpdated.emit(result); // <-- Ajouté
          const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
          instance.close();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la envoutement', err);
        }
      });
    } else {
      this.envoutementForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    }
  }

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'envoutement'
  resetForm() {
    if (this.envoutementForm && this.envoutement) {
      this.envoutementForm.reset({
        nom: this.envoutement.nom,
        cout: this.envoutement.cout,
        effet: this.envoutement.effet,
        prerequis: this.envoutement.prerequis,
        danger: this.envoutement.danger
      });
      // Marquer le formulaire comme non modifié et non touché
      // Cela permet de réinitialiser l'état du formulaire
      this.envoutementForm.markAsPristine();
      // Marquer tous les champs comme non touchés
      this.envoutementForm.markAsUntouched();
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
