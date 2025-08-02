import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Rituel } from '../../models/rituel';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { RituelsService } from '../rituels.service';


@Component({
  selector: 'app-rituels-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './rituels-update.component.html',
  styleUrl: './rituels-update.component.css'
})
export class RituelsUpdateComponent implements AfterViewInit, OnChanges{
  
  @Input() rituel: Rituel | null = null
  @ViewChild('modal') modalRef! : ElementRef;
  @Output() rituelUpdated = new EventEmitter<Rituel>();

  rituelForm! : FormGroup;

  constructor(private fb: FormBuilder, private rituelService: RituelsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rituel'] && this.rituel) {
      this.rituelForm = this.fb.group({
        nom: [this.rituel.nom, [Validators.required, Validators.maxLength(60)]],
        cout: [this.rituel.cout, [Validators.required, Validators.maxLength(10)]],
        effet: [this.rituel.effet, [Validators.required]],
        tempsPreparation: [this.rituel.tempsPreparation, [Validators.required, Validators.maxLength(10)]],
        sd: [this.rituel.sd, [Validators.required, Validators.maxLength(7)]],
        duree: [this.rituel.duree, [Validators.required, Validators.maxLength(15)]],
        composant: [this.rituel.composant, [Validators.required]],
        niveau: [this.rituel.niveau, [Validators.required, Validators.maxLength(20)]],
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
    if (this.rituelForm.valid) {
      const rituelToUpdate = { 
        ...this.rituel, 
        ...this.rituelForm.value,
        idRituel: this.rituel?.idRituel, // empêche la modification de l'ID
      };

      this.rituelService.updateRituel(rituelToUpdate).subscribe({
        next: (result) => {
          console.info('Rituel mise à jour avec succès', result);
          this.rituelUpdated.emit(result); // <-- Ajouté
          const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
          instance.close();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la rituel', err);
        }
      });
    } else {
      this.rituelForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    }
  }

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'rituel'
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
      // Marquer le formulaire comme non modifié et non touché
      // Cela permet de réinitialiser l'état du formulaire
      this.rituelForm.markAsPristine();
      // Marquer tous les champs comme non touchés
      this.rituelForm.markAsUntouched();
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
