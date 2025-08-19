import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Profession } from '../../models/profession';
import { ProfessionsService } from '../professions.service';

@Component({
  selector: 'app-professions-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './professions-update.component.html',
  styleUrl: './professions-update.component.scss'
})
export class ProfessionsUpdateComponent implements AfterViewInit, OnChanges {
  // Propriétés d'entrée et de sortie
  @Input() profession: Profession | null = null;
  @ViewChild('modal') modalRef!: ElementRef;
  @Output() professionUpdated = new EventEmitter<Profession>();

  professionForm!: FormGroup;

  constructor(private fb: FormBuilder, private professionsService: ProfessionsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profession'] && this.profession) {
      this.professionForm = this.fb.group({
        nom: [this.profession.nom, [Validators.required, Validators.maxLength(50)]],
        description: [this.profession.description, [Validators.required]],
        vigueur: [this.profession.vigueur],
        nbObjet: [this.profession.nbObjet, [Validators.required, Validators.min(0)]],
        maxSort: [this.profession.maxSort, [Validators.required, Validators.min(0)]],
        maxRituel: [this.profession.maxRituel, [Validators.required, Validators.min(0)]],
        maxEnvoutement: [this.profession.maxEnvoutement, [Validators.required, Validators.min(0)]],
        maxInvocation: [this.profession.maxInvocation, [Validators.required, Validators.min(0)]],
        inventaireWikiList: this.fb.array(this.profession.inventaireWikiList.map(item => this.fb.group({
          quantite: [item.quantite, [Validators.required, Validators.min(0)]],
          nom: [item.nom, [Validators.required, Validators.maxLength(50)]],
          type: [item.type, [Validators.maxLength(10)]],
          effet: [item.effet],
          special: [!!item.special]
        })))
        // Autres champs selon le modèle Profession
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
    if (this.professionForm.valid) {
      const updatedProfession = {
        ...this.profession,
        ...this.professionForm.value
      };
      this.professionsService.updateProfession(updatedProfession).subscribe({
        next: (result) => {
          console.info('Profession mise à jour avec succès:', result);
          this.professionUpdated.emit(result);
          const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
          instance.close();
        },
        error: (err) => {
          console.error('Error updating profession:', err);
         }
      });
    } else {
      this.professionForm.markAllAsTouched(); // Marque tous les champs comme touchés
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    }
  }

  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'profession'
  resetForm() {
    if (this.professionForm && this.profession) {
      this.professionForm.get('nom')?.setValue(this.profession.nom);
      this.professionForm.get('description')?.setValue(this.profession.description);
      this.professionForm.get('vigueur')?.setValue(this.profession.vigueur);
      this.professionForm.get('nbObjet')?.setValue(this.profession.nbObjet);
      this.professionForm.get('maxSort')?.setValue(this.profession.maxSort);
      this.professionForm.get('maxRituel')?.setValue(this.profession.maxRituel);
      this.professionForm.get('maxEnvoutement')?.setValue(this.profession.maxEnvoutement);
      this.professionForm.get('maxInvocation')?.setValue(this.profession.maxInvocation);
      
      // Réinitialisez de l'inventaire
      const inventaireWikiArray = this.inventaireWikiFormArray;
      inventaireWikiArray.clear();
      this.profession.inventaireWikiList.forEach(item => {
        inventaireWikiArray.push(this.fb.group({
          quantite: [item.quantite, [Validators.required, Validators.min(0)]],
          nom: [item.nom, [Validators.required, Validators.maxLength(50)]],
          type: [item.type, [Validators.maxLength(10)]],
          effet: [item.effet],
          special: [!!item.special]
        }));
      });

      this.professionForm.markAsPristine();
      this.professionForm.markAsUntouched();
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

  //#region pour l'inventaire
  get inventaireWikiFormArray(): FormArray<FormGroup> {
    return this.professionForm.get('inventaireWikiList') as FormArray;
  }

  addInventaireWiki() {
    const inventaireWikiArray = this.inventaireWikiFormArray;
    inventaireWikiArray.push(this.fb.group({
      quantite: ['', [Validators.required, Validators.min(0)]],
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['', [Validators.maxLength(10)]],
      effet: [''],
      special: [false]
    }));
  }

  removeInventaireWiki(index: number) {
    const inventaireWikiArray = this.inventaireWikiFormArray;
  inventaireWikiArray.removeAt(index);
  }
  //#endregion pour l'inventaire

  //-----------------------------------------------------//
  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.professionForm.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }


}
