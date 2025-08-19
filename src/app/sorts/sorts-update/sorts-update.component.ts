import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { MagieService } from '../magie.service';

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

  constructor(private fb: FormBuilder, private magieService: MagieService){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['magie']) {
      if (this.magie) {
        // Mode édition : préremplir le formulaire
        this.magieForm = this.fb.group({
          nom: [this.magie.nom, [Validators.required, Validators.maxLength(60)]],
          cout: [this.magie.cout, [Validators.required, Validators.maxLength(10)]],
          duree: [this.magie.duree, [Validators.required, Validators.maxLength(35)]],
          portee: [this.magie.portee, [Validators.maxLength(15)]],
          nature: [this.magie.nature, [Validators.required, Validators.maxLength(5)]],
          type: [this.magie.type, [Validators.required, Validators.maxLength(10)]],
          contre: [this.magie.contre, [Validators.maxLength(25)]],
          niveau: [this.magie.niveau, [Validators.required, Validators.maxLength(35)]],
          effet: [this.magie.effet, [Validators.required]]
        });
      } else {
        // Mode création : formulaire vide
        this.magieForm = this.fb.group({
          nom: ['', [Validators.required, Validators.maxLength(60)]],
          cout: ['', [Validators.required, Validators.maxLength(10)]],
          duree: ['', [Validators.required, Validators.maxLength(35)]],
          portee: ['', [Validators.maxLength(15)]],
          nature: ['', [Validators.required, Validators.maxLength(5)]],
          type: ['', [Validators.required, Validators.maxLength(10)]],
          contre: ['', [Validators.maxLength(25)]],
          niveau: ['', [Validators.required, Validators.maxLength(35)]],
          effet: ['', [Validators.required]]
        });
      }
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
    if (this.magieForm.valid) {
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
            const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
            instance.close();
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
            const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
            instance.close();
          },
          error: (err) => {
            console.error('Erreur lors de la création de la magie', err);
          }
        });
      }
    } else {
      this.magieForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
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
