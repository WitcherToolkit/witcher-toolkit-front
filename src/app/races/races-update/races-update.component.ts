import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { Race } from '../../models/race';
import { RacesService } from '../races.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RACE_LIST_PATH } from '../../app-routing/app-routing-constants';

@Component({
  selector: 'app-races-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './races-update.component.html',
  styleUrl: './races-update.component.scss'
})
export class RacesUpdateComponent implements OnInit {

  readonly raceListPath = RACE_LIST_PATH; // importé depuis tes constantes de routing
  raceForm!: FormGroup;
  race: Race | null = null;

  constructor(
    private fb: FormBuilder,
    private raceService: RacesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Mode édition
      const id = Number(idParam);
      this.raceService.getRaceById(id).subscribe(race => {
        this.race = race;
        this.initForm();
      });
    } else {
      // Mode création
      this.race = null;
      this.initForm();
    }
  }

  private createParticulariteGroup(p?: any): FormGroup {
  return this.fb.group({
    idParticularite: [p?.idParticularite ?? null],
    nom: [p?.nom ?? '', [Validators.maxLength(50)]],
    description: [p?.description ?? '']
  });
}

private createReputationWikiGroup(r?: any): FormGroup {
  return this.fb.group({
    idReputationWiki: [r?.idReputationWiki ?? null],
    territoire: [r?.territoire ?? '', Validators.maxLength(50)],
    valeur: [r?.valeur ?? '']
  });
}

initForm() {
  this.raceForm = this.fb.group({
    nom: [this.race?.nom ?? '', [Validators.required, Validators.maxLength(50)]],
    particulariteList: this.fb.array(
      (this.race?.particulariteList ?? []).map(p => this.createParticulariteGroup(p))
    ),
    reputationWikiList: this.fb.array(
      (this.race?.reputationWikiList ?? []).map(r => this.createReputationWikiGroup(r))
    ),
  });
}

  onSubmit() {
    if (!this.raceForm.valid) {
      this.raceForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }

    let raceObservable: Observable<Race>;
    if (this.race) {
      // Edition
      const raceToUpdate = { 
        ...this.race, 
        ...this.raceForm.value, 
        idRace: this.race.idRace };
      raceObservable = this.raceService.updateRace(raceToUpdate);
    } else {
      // Création
      const raceToCreate = this.raceForm.value;
      raceObservable = this.raceService.createRace(raceToCreate);
    }

    raceObservable.subscribe({
      next: () => this.router.navigate(['/', ...this.raceListPath.split('/')]),
      error: (err) => console.error('Erreur lors de la sauvegarde de la race', err)
    });
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
    this.router.navigate(['/', ...this.raceListPath.split('/')]);
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
