import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Race } from '../../models/race';
import { RacesService } from '../races.service';

@Component({
  selector: 'app-races-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './races-update.component.html',
  styleUrl: './races-update.component.css'
})
export class RacesUpdateComponent implements AfterViewInit, OnChanges{

  @Input() race: Race | null = null
  @ViewChild('modal') modalRef! : ElementRef;
  @Output() raceUpdated = new EventEmitter<Race>();

  raceForm! : FormGroup;

  constructor(private fb: FormBuilder, private raceService: RacesService){}
  
  ngOnChanges(changes: SimpleChanges) {// SimpleChanges permet de détecter les changements dans les propriétés d'entrée
    if (changes['race'] && this.race) {
      this.raceForm = this.fb.group({
        nom: [this.race.nom, [Validators.required, Validators.maxLength(50)]],
        particulariteList: this.fb.array(
          this.race.particulariteList.map(p =>
            this.fb.group({
              idParticularite: [p.idParticularite],
              nom: [p.nom, [Validators.required, Validators.maxLength(50)]],
              description: [p.description, [Validators.required]]
            })
        )
        ),
        reputationWikiList: this.fb.array(
          this.race.reputationWikiList.map(r =>
            this.fb.group({
              idReputationWiki: [r.idReputationWiki],
              territoire: [r.territoire, [Validators.required, Validators.maxLength(50)]],
              valeur: [r.valeur, [Validators.required]]
            })
        )
        ),

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
    if (this.raceForm.valid) {
      const raceToUpdate = { 
        ...this.race, 
        ...this.raceForm.value ,
        idRace: this.race?.idRace, // empêche la modification de l'ID
        particulariteList: this.raceForm.value.particulariteList // liste modifiée
      };
      this.raceService.updateRace(raceToUpdate).subscribe({
        next: (result) => {
          console.info('Race mise à jour avec succès', result);
          this.raceUpdated.emit(result); // <-- Ajouté
          const instance = (window as any).M.Modal.getInstance(this.modalRef.nativeElement);
          instance.close();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la race', err);
        }
      });
    } else {
      this.raceForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    }
  }
  
  // Méthode pour réinitialiser le formulaire aux valeurs de l'objet 'race'
  resetForm() {
     if (this.raceForm && this.race) {
      // Réinitialise le champ nom
      this.raceForm.get('nom')?.setValue(this.race.nom);

      // Réinitialise les particularités
      const partArray = this.particulariteFormArray;
      partArray.clear();
      this.race.particulariteList.forEach(p => {
        partArray.push(this.fb.group({
          idParticularite: [p.idParticularite],
          nom: [p.nom, [Validators.required, Validators.maxLength(50)]],
          description: [p.description, [Validators.required]]
        }));
      });

      // Réinitialise les réputations
      const repArray = this.reputationWikiFormArray;
      repArray.clear();
      this.race.reputationWikiList.forEach(r => {
        repArray.push(this.fb.group({
          idReputationWiki: [r.idReputationWiki],
          territoire: [r.territoire, [Validators.required, Validators.maxLength(50)]],
          valeur: [r.valeur, [Validators.required]]
        }));
      });

      this.raceForm.markAsPristine();
      this.raceForm.markAsUntouched();
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

  //#region Particularites
  // Getter pour le FormArray
  get particulariteFormArray(): FormArray<FormGroup> {
    return this.raceForm.get('particulariteList') as FormArray<FormGroup>;
  }
  addParticularite() {
    this.particulariteFormArray.push(
      this.fb.group({
        idParticularite: [null],
        nom: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.required]]
      })
    );
  }

  removeParticularite(index: number) {
    this.particulariteFormArray.removeAt(index);
  }
  //#endregion Particularites

  //#region ReputationWiki
  // Getter pour le FormArray
  get reputationWikiFormArray(): FormArray<FormGroup> {
    return this.raceForm.get('reputationWikiList') as FormArray<FormGroup>;
  }
  addReputationWiki() {
    this.reputationWikiFormArray.push(
      this.fb.group({
        idParticularite: [null],
        territoire: ['', [Validators.required, Validators.maxLength(20)]],
        valeur: ['', [Validators.required, Validators.maxLength(20)]],
      })
    );
  }

  removeReputationWiki(index: number) {
    this.reputationWikiFormArray.removeAt(index);
  }
  //#endregion Particularites
}
