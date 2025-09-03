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
export class CompetencesUpdateComponent implements AfterViewInit, OnChanges {
  // --- Entrées, sorties et références ---
  @Input() competence: Competence | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() competenceUpdated = new EventEmitter<Competence>();

  // --- Propriétés du formulaire et données associées ---
  competenceForm!: FormGroup;
  caracteristiques: Caracteristique[] = [];
  caracteristiquesLoaded = false;

  constructor(
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private caracteristiqueService: CaracteristiqueService
  ) {}

  // --- Initialisation : chargement des caractéristiques et du formulaire ---
  ngOnInit() {
    this.caracteristiqueService.getCaracteristiquesList().subscribe(caracs => {
      this.caracteristiques = caracs;
      this.caracteristiquesLoaded = true;
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
    });
  }

  // --- Cycle de vie : mise à jour du formulaire si competence change ---
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

  // --- Création du FormGroup pour la compétence ---
  createCompetenceForm(competence: Competence | null): FormGroup {
    return this.fb.group({
      nom: [competence?.nom ?? '', [Validators.required, Validators.maxLength(50)]],
      description: [competence?.description ?? '', [Validators.required]],
      specialisation: [competence?.specialisation ?? '', [Validators.maxLength(20)]],
      prerequis: [competence?.prerequis ?? '', [Validators.maxLength(20)]],
      exclusive: [!!this.competence?.exclusive],
      caracteristique: [competence?.caracteristique?.idCaracteristique ?? '', Validators.required],
      step: [competence?.step ?? 1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  // --- Initialisation de la modale Materialize ---
  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
  }

  // --- Ouvre la modale ---
  open() {
    if (this.modalRef) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      instance.open();
    }
  }

  // --- Soumission du formulaire (création ou édition) ---
  onSubmit() {
    if (!this.competenceForm.valid) {
      this.competenceForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const closeModal = () => {
      const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
      instance.close();
    };
    const selectedId = this.competenceForm.value.caracteristique;
    const selectedCarac = this.caracteristiques.find(c => c.idCaracteristique === +selectedId) ?? null;
    if (this.competence) {
      // Edition
      const competenceToUpdate = {
        ...this.competence,
        ...this.competenceForm.value,
        idCompetence: this.competence?.idCompetence,
        caracteristique: selectedCarac,
        step: this.competenceForm.value.step
      };
      this.competenceService.updateCompetence(competenceToUpdate).subscribe({
        next: (result) => {
          console.info('competence mise à jour avec succès', result);
          this.competenceUpdated.emit(result);
          this.resetForm();
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la competence', err);
        }
      });
    } else {
      // Création
      const competenceToCreate = {
        ...this.competenceForm.value,
        caracteristique: selectedCarac,
        step: this.competenceForm.value.step
      };
      this.competenceService.createCompetence(competenceToCreate).subscribe({
        next: (result) => {
          console.info('competence créé avec succès', result);
          this.competenceUpdated.emit(result);
          closeModal();
        },
        error: (err) => {
          console.error('Erreur lors de la création de la competence', err);
        }
      });
    }
  }

  // --- Soumission et création en boucle (reste ouvert) ---
  onSubmitAndContinue() {
    if (!this.competenceForm.valid) {
      this.competenceForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const selectedId = this.competenceForm.value.caracteristique;
    const selectedCarac = this.caracteristiques.find(c => c.idCaracteristique === +selectedId) ?? null;
    const competenceToCreate = {
      ...this.competenceForm.value,
      caracteristique: selectedCarac,
      step: this.competenceForm.value.step
    };
    this.competenceService.createCompetence(competenceToCreate).subscribe({
      next: (result) => {
        console.info('compétence créée avec succès', result);
        this.competenceUpdated.emit(result);
        this.competenceForm.reset();
        this.competenceForm.markAsPristine();
        this.competenceForm.markAsUntouched();
      },
      error: (err) => {
        console.error('Erreur lors de la création de la compétence', err);
      }
    });
  }

  // --- Réinitialise le formulaire aux valeurs de l'objet 'competence' (édition) ---
  resetForm() {
    if (this.competenceForm && this.competence) {
      this.competenceForm.reset({
        nom: this.competence.nom,
        description: this.competence.description,
        specialisation: this.competence.specialisation,
        prerequis: this.competence.prerequis,
        exclusive: this.competence.exclusive,
      });
      this.competenceForm.markAsPristine();
      this.competenceForm.markAsUntouched();
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

  // --- Met le texte saisi en majuscules ---
  onUpperCase(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    // Met à jour le contrôle du formulaire si besoin
    const controlName = input.getAttribute('formControlName');
    if (controlName && this.competenceForm) {
      this.competenceForm.get(controlName)?.setValue(input.value, { emitEvent: false });
    }
  }

  // --- Outils UI ---
  /** Incrémente/décrémente un champ numérique du formulaire principal */
  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.competenceForm.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }
}
