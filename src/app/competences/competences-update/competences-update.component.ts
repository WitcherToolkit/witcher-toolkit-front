import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Competence } from '../../models/competence';
import { CompetenceService } from '../competence.service';
import { Caracteristique } from '../../models/caracteristique';
import { CaracteristiqueService } from '../../caracteristiques/caracteristique.service';

@Component({
  selector: 'app-competences-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './competences-update.component.html',
  styleUrl: './competences-update.component.scss'
})
export class CompetencesUpdateComponent implements AfterViewInit, OnChanges{

  @Input() competence: Competence | null = null
  @ViewChild('modal') modalRef! : ElementRef;
  @Output() competenceUpdated = new EventEmitter<Competence>();

  competenceForm! : FormGroup;

  caracteristiques: Caracteristique[] = [];
  caracteristiquesLoaded = false;

  constructor(private fb: FormBuilder, private competenceService: CompetenceService, private caracteristiqueService: CaracteristiqueService) {}

  ngOnInit() {
    this.caracteristiqueService.getCaracteristiquesList().subscribe(caracs => {
      this.caracteristiques = caracs;
      this.caracteristiquesLoaded = true;
      this.competenceForm = this.createCompetenceForm(this.competence);
      // Abonnement pour gérer l'affichage dynamique des champs
      this.competenceForm.get('exclusive')?.valueChanges.subscribe((value: boolean) => {
        if (!value) {
          this.competenceForm.get('prerequis')?.setValue('');
          this.competenceForm.get('specialisation')?.setValue('');
        }
      });
      setTimeout(() => {
        const elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
      });
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['competence'] && this.caracteristiquesLoaded) {
      this.competenceForm = this.createCompetenceForm(this.competence);
      this.competenceForm.get('exclusive')?.valueChanges.subscribe((value: boolean) => {
        if (!value) {
          this.competenceForm.get('prerequis')?.setValue('');
          this.competenceForm.get('specialisation')?.setValue('');
        }
      });
      setTimeout(() => {
        const elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
      });
    }
  }

  createCompetenceForm(competence: Competence | null): FormGroup {
    return this.fb.group({
      nom: [competence?.nom ?? '', [Validators.required, Validators.maxLength(50)]],
      description: [competence?.description ?? '', [Validators.required]],
      specialisation: [competence?.specialisation ?? '', [Validators.maxLength(20)]],
      prerequis: [competence?.prerequis ?? '', [Validators.maxLength(20)]],
      exclusive: [!!this.competence?.exclusive],
      caracteristique: [competence?.caracteristique?.idCaracteristique ?? '', Validators.required],
    });
  }

  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
    
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
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
  this.competenceForm.get('code')?.setValue(upperValue, { emitEvent: false });
}

  onSubmit() {
    if (this.competenceForm.valid) {
      const selectedId = this.competenceForm.value.caracteristique;
      const selectedCarac = this.caracteristiques.find(c => c.idCaracteristique === +selectedId) ?? null;
      const competenceToUpdate = {
          ...this.competence,
          ...this.competenceForm.value,
          idCompetence: this.competence?.idCompetence, // empêche la modification de l'ID
          caracteristique: selectedCarac
        };
      
      this.competenceService.updateCompetence(competenceToUpdate).subscribe({
        next: (result) => {
          console.info('competence mise à jour avec succès', result);
          this.competenceUpdated.emit(result); // <-- Ajouté
          const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
          instance.close();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la competence', err);
        }
      });
    } else {
      this.competenceForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    }
  }

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'competence'
  resetForm() {
    if (this.competenceForm && this.competence) {
      this.competenceForm.reset({
        nom: this.competence.nom,
        description: this.competence.description,
        specialisation: this.competence.specialisation,
        prerequis: this.competence.prerequis,
        exclusive: this.competence.exclusive,
      });
      // Marquer le formulaire comme non modifié et non touché
      // Cela permet de réinitialiser l'état du formulaire
      this.competenceForm.markAsPristine();
      // Marquer tous les champs comme non touchés
      this.competenceForm.markAsUntouched();
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
