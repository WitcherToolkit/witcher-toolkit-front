import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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

  magieForm!: FormGroup;

  constructor(private fb: FormBuilder, private magieService: MagieService){}

  ngOnChanges(changes: SimpleChanges) {// SimpleChanges permet de détecter les changements dans les propriétés d'entrée
    if (changes['magie'] && this.magie) {
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
    const magieToUpdate = { ...this.magie, ...this.magieForm.value };
    this.magieService.updateMagie(magieToUpdate).subscribe({
      next: (result) => {
        console.info('Magie mise à jour avec succès', result);
        const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
        instance.close();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la magie', err);
      }
    });
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
